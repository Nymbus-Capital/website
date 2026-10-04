/**
 * futures-model.ts — pure model of the "how futures work" animation (/core-concepts). A generated index price
 * moves day by day; every close settles the day's move in cash between the long and the short (index up: the short
 * pays the long; down: the long pays the short), so the open, unsettled P&L is never more than one day's move. The
 * margin buffer each side posts is sized to a potential one-day move and grows when volatility rises.
 * Everything is generated (no real contract, price or result). Dependency-free (unit tested).
 */
import { clamp, gauss, hash01 } from "./timeline.ts";

/**
 * Trading days per loop of the animation, and ms per day. Slowed down 2026-10-03 (Gabriel: "we have a hard time reading
 * the text … every day"): 5 s a day, so each daily settlement message stays on screen long enough to read twice.
 */
export const DAYS = 14;
export const DAY_MS = 5000;
/**
 * Each day opens with a settlement pause: for this share of the day the price holds at the last close while the cash of
 * that close moves between the two sides; the market then trades for the rest of the day.
 */
export const SETTLE_SHARE = 0.25;
/** Fade-in / fade-out shares of the day for the settlement message (it is fully shown in between). */
export const RULE_IN = 0.04, RULE_OUT = 0.06;
/** Ms a reader needs per word of the settlement message (≈ 300 words a minute: short, repeated phrases). */
export const READ_MS_PER_WORD = 200;
export const LOOP_MS = DAYS * DAY_MS;
/** Four focus steps over one loop: long meets short · daily settlement · margin buffer · one day at risk. */
export const FUTURES_STEP_MS = [LOOP_MS / 4, LOOP_MS / 4, LOOP_MS / 4, LOOP_MS / 4] as const;
/** First price of every loop (internal units; never shown). */
export const START_PRICE = 100;
/** A generated daily move never exceeds MOVE_CAP typical moves (σ); the margin buffer covers MARGIN_K of them. */
export const MOVE_CAP = 2.5;
export const MARGIN_K = 3;
/** Days of the high-volatility episode in each loop (the buffer grows there). */
export const HIGH_VOL_FROM = 7;
export const HIGH_VOL_TO = 10;

/** Typical one-day move (σ) of day d: calm, then a volatile episode, then easing back. */
export function sigmaOf(d: number): number {
  if (d >= HIGH_VOL_FROM && d <= HIGH_VOL_TO) return 1.5;
  if (d === HIGH_VOL_TO + 1) return 0.95;
  return 0.55;
}

/** Margin buffer each side posts for a day with typical move σ: sized to a potential one-day move. */
export const marginFor = (sigma: number): number => MARGIN_K * sigma;

export interface Day {
  d: number;
  sigma: number;
  open: number;
  close: number;
  /** close − open */
  move: number;
  /** cash the long receives at the close (negative: pays); the short gets the opposite */
  long: number;
  short: number;
  /** buffer posted by each side for this day */
  margin: number;
}

/** One loop of generated days for `seed`: deterministic, bounded, each close is the next day's open. */
export function futuresLoop(loop: number, seed = 0): Day[] {
  const out: Day[] = [];
  let p = START_PRICE;
  // a loop never ends far from where it started: the last days lean back towards the start (no trend over the loop)
  for (let d = 0; d < DAYS; d++) {
    const sigma = sigmaOf(d);
    let move = gauss(d, 7 + loop * 3, seed) * sigma;
    if (d >= DAYS - 3) move -= (p - START_PRICE) / (DAYS - d) * 0.6;
    // a visible move every day (flat days teach nothing), never beyond the cap
    if (Math.abs(move) < 0.25 * sigma) move = (hash01(d, loop, seed) < 0.5 ? -1 : 1) * 0.35 * sigma;
    move = clamp(move, -MOVE_CAP * sigma, MOVE_CAP * sigma);
    const open = p, close = p + move;
    out.push({ d, sigma, open, close, move, long: move, short: -move, margin: marginFor(sigma) });
    p = close;
  }
  return out;
}

/** Sum of the daily cash settlements of the long over days [0, k): equals close(k − 1) − open(0). */
export function settledThrough(days: Day[], k: number): number {
  let s = 0;
  for (let d = 0; d < Math.min(k, days.length); d++) s += days[d].long;
  return s;
}

/**
 * Price inside day d at fraction u of the day (0 = open, 1 = close): the day's move plus a small intraday wiggle that
 * vanishes at both ends. The open (unsettled) P&L is price − open: zero at the open, the day's settlement at the close.
 */
export function intraday(day: Day, u: number, seed = 0): number {
  const x = clamp(u);
  const shape = x * x * (3 - 2 * x);
  const w = Math.sin(Math.PI * x) * (Math.sin(x * 9 + day.d * 1.7 + seed) * 0.5 + Math.sin(x * 23 + day.d) * 0.22) * day.sigma * 0.6;
  return day.open + day.move * shape + w;
}

/** Fraction of the trading session at fraction u of the day: 0 during the settlement pause, then 0 → 1 to the close. */
export const marketU = (u: number): number => clamp((u - SETTLE_SHARE) / (1 - SETTLE_SHARE));

/** Opacity of the day's settlement message at fraction u of the day: in quickly after the close, held, out before the next. */
export const ruleAlpha = (u: number): number => clamp(Math.min(u / RULE_IN, (1 - u) / RULE_OUT));

/** Ms the settlement message is fully shown each day. */
export const RULE_FULL_MS = DAY_MS * (1 - RULE_IN - RULE_OUT);

/** Unsettled P&L of the long at fraction u of day d (only today's move is ever open). */
export const unsettled = (day: Day, u: number, seed = 0): number => intraday(day, u, seed) - day.open;

export interface Rect { x: number; y: number; w: number; h: number }

/** Layout: price chart and settlement row on the left (top on narrow screens), long/short and buffers beside (below). */
export function futuresLayout(W: number, H: number) {
  const narrow = W < 700;
  const pad = narrow ? 14 : 24;
  const foot = 26;
  if (!narrow) {
    const leftW = Math.round(W * 0.58);
    const top = 18, bottom = H - foot - 8;
    const priceH = Math.round((bottom - top) * 0.6);
    const price: Rect = { x: pad, y: top, w: leftW - pad, h: priceH };
    const settle: Rect = { x: pad, y: top + priceH + 16, w: leftW - pad, h: bottom - (top + priceH + 16) };
    const rx = leftW + 40;
    const parties: Rect = { x: rx, y: top, w: W - pad - rx, h: bottom - top };
    return { narrow, pad, foot, price, settle, parties };
  }
  const top = 12, bottom = H - foot - 8;
  const avail = bottom - top;
  const priceH = Math.round(avail * 0.36), settleH = Math.round(avail * 0.2);
  const price: Rect = { x: pad, y: top, w: W - 2 * pad, h: priceH };
  const settle: Rect = { x: pad, y: top + priceH + 12, w: W - 2 * pad, h: settleH };
  const py = settle.y + settleH + 16;
  const parties: Rect = { x: pad, y: py, w: W - 2 * pad, h: bottom - py };
  return { narrow, pad, foot, price, settle, parties };
}
