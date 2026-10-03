/**
 * overlay-model.ts — pure model of the home "diversifying engines" illustration: an endless, seeded stream of
 * generated months. A bond-market reference has calm months and stress episodes (clusters of down months); five
 * generic strategy engines are drawn mostly independently of it, the volatility engine is built to react when
 * stress rises (the overlay idea). From that stream: smoothed paths, down-month correlation, "lit" engines.
 * Everything is generated: no real strategy, position, return or correlation. Dependency-free (unit tested).
 */
import { gauss, hash01 } from "./scan-model.ts";

const l = (en: string, fr: string) => ({ en, fr });

export interface Engine { key: string; label: { en: string; fr: string }; color: string }

/** Generic strategy types (no product names). */
export const ENGINES: Engine[] = [
  { key: "trend", label: l("Trend", "Tendance"), color: "#1a73e8" },
  { key: "carry", label: l("Carry", "Portage"), color: "#0b8fd6" },
  { key: "macro", label: l("Macro", "Macro"), color: "#6d5bd0" },
  { key: "vol", label: l("Volatility", "Volatilité"), color: "#00a3e0" },
  { key: "rv", label: l("Relative value", "Valeur relative"), color: "#0f9d8a" },
];
export const BOND = { key: "bond", label: l("Bonds", "Obligations"), color: "#5f6368" };

/** All monthly values are clamped to ±MAX_MOVE (generated units, not percentages). */
export const MAX_MOVE = 4;
/** Memory of the smoothed paths: level(n) = Σ PHI^k · move(n − k), k < DEPTH. */
export const PHI = 0.82;
export const DEPTH = 28;
/** Months in the down-month correlation window. */
export const CORR_WINDOW = 120;

export interface Month {
  n: number;
  bond: number;
  engines: number[];
  /** the bond reference fell this month */
  down: boolean;
  /** part of a stress episode (sharper falls, volatility up) */
  stress: boolean;
}

const clamp = (v: number, a = -MAX_MOVE, b = MAX_MOVE) => Math.max(a, Math.min(b, v));

/** Stress episodes: one block in three (on average) of 9 months carries a 2–3 month episode. */
export function isStress(n: number, seed = 0): boolean {
  if (n < 0) return false;
  const block = Math.floor(n / 9), at = n - block * 9;
  if (hash01(block, 11, seed) >= 0.36) return false;
  const start = Math.floor(hash01(block, 12, seed) * 5) + 1;
  const len = hash01(block, 13, seed) < 0.5 ? 2 : 3;
  return at >= start && at < start + len;
}

const BETA = [0.04, 0.05, -0.03, 0, 0.04];
const SIGMA = [0.9, 0.55, 0.75, 0.6, 0.45];
const DRIFT = [0.04, 0.1, 0.03, -0.06, 0.06];

/** Month `n` (any integer) of the stream for `seed`: deterministic, bounded. */
export function monthAt(n: number, seed = 0): Month {
  const stress = isStress(n, seed);
  // calm months drift up slightly, stress months fall: the reference has no trend over the long run
  const bond = clamp(stress ? -0.9 - Math.abs(gauss(n, 21, seed)) * 0.8 : 0.2 + gauss(n, 22, seed) * 0.55);
  const engines = ENGINES.map((e, i) => {
    let v = DRIFT[i] + BETA[i] * bond + SIGMA[i] * gauss(n, 30 + i, seed);
    if (e.key === "vol" && stress) v += 0.55 * Math.abs(bond); // built to react when volatility rises
    if (e.key === "trend" && stress && isStress(n - 1, seed)) v += 0.35; // a persistent fall becomes a trend
    return clamp(v);
  });
  return { n, bond, engines, down: bond < 0, stress };
}

/** Small cache in front of monthAt (the renderer asks for the same months every frame). */
export function monthCache(seed = 0, size = 512) {
  const m = new Map<number, Month>();
  return (n: number): Month => {
    let v = m.get(n);
    if (!v) {
      if (m.size >= size) m.clear();
      v = monthAt(n, seed);
      m.set(n, v);
    }
    return v;
  };
}

/** Smoothed path of a series at month n: an exponentially weighted sum of its recent moves (bounded, stateless). */
export function level(get: (n: number) => Month, n: number, series: number /* -1 bond, 0..4 engines, 5 combined */): number {
  let s = 0, w = 1;
  for (let k = 0; k < DEPTH; k++) {
    const m = get(n - k);
    const v = series < 0 ? m.bond : series >= ENGINES.length ? combinedMove(m) : m.engines[series];
    s += w * v;
    w *= PHI;
  }
  return s;
}

/** Upper bound of |level|: every move at its maximum. */
export const LEVEL_BOUND = (MAX_MOVE * (1 - Math.pow(PHI, DEPTH))) / (1 - PHI);

/** Equal-weight blend of the engines for a month. */
export function combinedMove(m: Month): number {
  return m.engines.reduce((a, v) => a + v, 0) / m.engines.length;
}

/** An engine "lights" in a down month when it moves the other way (up): an independent move. */
export function lit(m: Month, i: number): boolean {
  return m.down && m.engines[i] > 0;
}

function pearson(a: number[], b: number[]): number {
  const n = a.length;
  if (n < 3) return 0;
  let ma = 0, mb = 0;
  for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
  ma /= n; mb /= n;
  let sab = 0, saa = 0, sbb = 0;
  for (let i = 0; i < n; i++) { const x = a[i] - ma, y = b[i] - mb; sab += x * y; saa += x * x; sbb += y * y; }
  if (saa <= 1e-12 || sbb <= 1e-12) return 0;
  return Math.max(-1, Math.min(1, sab / Math.sqrt(saa * sbb)));
}

/**
 * Down-month correlation matrix over the CORR_WINDOW months ending at `end`: only the months where the bond
 * reference fell count (downside correlation). Order: bonds, then the engines. Symmetric, unit diagonal.
 */
export function downsideCorrelation(get: (n: number) => Month, end: number, window = CORR_WINDOW): number[][] {
  const cols: number[][] = Array.from({ length: ENGINES.length + 1 }, () => []);
  for (let n = end - window + 1; n <= end; n++) {
    const m = get(n);
    if (!m.down) continue;
    cols[0].push(m.bond);
    m.engines.forEach((v, i) => cols[i + 1].push(v));
  }
  const k = cols.length;
  const out = Array.from({ length: k }, () => new Array<number>(k).fill(0));
  for (let i = 0; i < k; i++) {
    out[i][i] = 1;
    for (let j = 0; j < i; j++) { const c = pearson(cols[i], cols[j]); out[i][j] = c; out[j][i] = c; }
  }
  return out;
}

/** Counters of the illustration over months [from, to): what the animation itself has generated. */
export interface OverlayCounters { months: number; down: number; litMoves: number }

export function countersBetween(get: (n: number) => Month, from: number, to: number): OverlayCounters {
  let months = 0, down = 0, litMoves = 0;
  for (let n = from; n < to; n++) {
    const m = get(n);
    months++;
    if (m.down) { down++; for (let i = 0; i < ENGINES.length; i++) if (lit(m, i)) litMoves++; }
  }
  return { months, down, litMoves };
}

/** Months per counter cycle: the counters restart so the figures stay small and obviously the animation's own. */
export const COUNTER_CYCLE = 120;

/** Layout of the canvas for a width: side heatmap on wide screens, stacked under the chart on narrow ones. */
export function overlayLayout(W: number, H: number) {
  const narrow = W < 700;
  const pad = narrow ? 12 : 20;
  const foot = narrow ? 42 : 26; // watermark row (narrow: legend line above it)
  const labW = Math.round(Math.max(64, Math.min(132, W * (narrow ? 0.3 : 0.11))));
  if (!narrow) {
    const hmW = Math.round(Math.min(340, W * 0.3));
    const chartR = W - pad - hmW - 48;
    const top = 16, bandH = Math.round((H - top - foot) * 0.44);
    return {
      narrow, pad, labW, foot, x0: pad + labW, x1: chartR,
      band: { y: top, h: bandH },
      lanes: { y: top + bandH + 14, h: H - foot - (top + bandH + 14) - 6 },
      heat: { x: W - pad - hmW, y: top, w: hmW, h: H - top - foot - 6 },
    };
  }
  const top = 12;
  const avail = H - top - foot;
  const bandH = Math.round(avail * 0.27), lanesH = Math.round(avail * 0.33);
  const heatY = top + bandH + 10 + lanesH + 14;
  return {
    narrow, pad, labW, foot, x0: pad + labW, x1: W - pad - 10,
    band: { y: top, h: bandH },
    lanes: { y: top + bandH + 10, h: lanesH },
    heat: { x: pad, y: heatY, w: W - 2 * pad, h: H - foot - heatY - 4 },
  };
}

/** Width of one month on the time axis for a chart width: about 30 months on screen, never under 7 px. */
export function monthWidth(chartW: number): number {
  return Math.max(7, Math.min(26, chartW / 30));
}

/** Heatmap cell colour (rgba) for a correlation: pale near zero, blue when moving together, cyan when opposite. */
export function heatColor(c: number): string {
  const a = Math.min(1, Math.abs(c));
  const alpha = (0.05 + 0.85 * Math.pow(a, 1.5)).toFixed(3);
  return c >= 0 ? `rgba(11,87,208,${alpha})` : `rgba(0,163,224,${alpha})`;
}
