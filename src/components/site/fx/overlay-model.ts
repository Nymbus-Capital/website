/**
 * overlay-model.ts — pure model of the home "diversifying engines" illustration: an endless, seeded stream of
 * generated months. Two traditional-market references — equities and bonds — have calm months and stress episodes
 * (clusters of down months); in a clear down month for equities (DOWN_CUT), bonds tend to fall with them, less
 * deeply (traditional markets moving together). Five lanes, labelled with the Multi-Strategy Fund's four strategy
 * names plus a futures overlay, are drawn independently of each other (low down-month correlation); hedging and the
 * overlay react when stress rises (moderately negative down-month correlation with equities and bonds), the others
 * barely move with the markets. Every series has zero drift (nothing trends up or down over time), so
 * nothing reads as performance. From that stream: smoothed paths, down-month correlation, highlighted independent moves.
 * Everything is generated: no real market, strategy, position, return or correlation. Dependency-free (unit tested).
 */
import { gauss, hash01 } from "./scan-model.ts";

const l = (en: string, fr: string) => ({ en, fr });

interface Engine { key: string; label: { en: string; fr: string }; color: string; /** part of the blended line */ blend: boolean }

/**
 * The Multi-Strategy Fund's four strategies (names as on the fund page and /approach) and the bond funds' futures
 * overlay, which has its own lane and is never blended with the four.
 */
export const ENGINES: Engine[] = [
  { key: "lowvol", label: l("Low volatility", "Faible volatilité"), color: "#0b8fd6", blend: true },
  { key: "directional", label: l("Directional", "Directionnelle"), color: "#1a73e8", blend: true },
  { key: "meanrev", label: l("Mean reversion", "Retour à la moyenne"), color: "#6d5bd0", blend: true },
  { key: "hedging", label: l("Hedging", "Couverture"), color: "#00a3e0", blend: true },
  { key: "overlay", label: l("Protective overlay", "Superposition protectrice"), color: "#0f9d8a", blend: false },
];
/** The traditional markets (generated references), drawn above the strategies: equities first, then bonds. */
export const EQUITY = { key: "equity", label: l("Equity markets", "Marchés boursiers"), short: l("Equities", "Actions"), color: "#3c4043" };
export const BOND = { key: "bond", label: l("Bond markets", "Marchés obligataires"), short: l("Bonds", "Obligations"), color: "#80868b" };
export const MARKETS = [EQUITY, BOND];

/** All monthly values are clamped to ±MAX_MOVE (generated units, not percentages). */
export const MAX_MOVE = 4;
/** Memory of the smoothed paths: level(n) = Σ PHI^k · move(n − k), k < DEPTH. */
export const PHI = 0.82;
export const DEPTH = 28;
/** Months in the down-month correlation window (≈ 95 clear down months: long enough for a steady picture). */
export const CORR_WINDOW = 360;

export interface Month {
  n: number;
  equity: number;
  bond: number;
  engines: number[];
  /** a clear equity down month (equities fell by more than DOWN_CUT): the months the illustration is about */
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

/** Mean |gauss| (Irwin–Hall, 4 terms): used by the zero-drift corrections. */
const ABS_G = 0.79;
/** Share of stress months (block design above) and P(stress month right after a stress month). */
const P_STRESS = (0.36 * 2.5) / 9;
const P_STRESS_RUN = (0.36 * 1.5) / 9;
/** Equities: stress months fall by EQ_FALL + EQ_FALL_SD·|g|; calm months drift up just enough to balance them. */
const EQ_FALL = 1.5, EQ_FALL_SD = 1.0, EQ_SD = 0.9;
const STRESS_ABS = EQ_FALL + EQ_FALL_SD * ABS_G;
const EQ_CALM = (P_STRESS * STRESS_ABS) / (1 - P_STRESS);
/** Bonds: a share of the equity move plus their own noise (zero drift because equities have none). */
const BOND_BETA = 0.42, BOND_SD = 0.32;

/**
 * A down month is a clear fall in equities: below −0.5σ of the monthly equity move (σ ≈ 1.16 generated units; every
 * stress month qualifies). Small negative months are not shaded. The heatmap's down-month correlation, the bands and
 * the highlights all use this same definition (Month.down).
 */
export const DOWN_CUT = -0.58;

const BETA = [0.02, 0.015, -0.02, 0, 0];
const SIGMA = [0.4, 0.9, 0.7, 0.55, 0.5];
/**
 * hedging and the overlay react when stress rises (designed to offset part of the falls): a moderate negative
 * down-month correlation with equities and bonds, while staying low against the other strategies
 */
const REACT = [0, 0, 0, 0.2, 0.2];
const RUN = [0, 0.3, 0, 0, 0];
/** zero drift: what a lane gains in stress months is taken back evenly, so no lane trends over time */
const DRIFT = REACT.map((r, i) => -(r * STRESS_ABS * P_STRESS + RUN[i] * P_STRESS_RUN));

/** Month `n` (any integer) of the stream for `seed`: deterministic, bounded. */
export function monthAt(n: number, seed = 0): Month {
  const stress = isStress(n, seed);
  // calm months drift up slightly, stress months fall sharply: equities have no trend over the long run
  const equity = clamp(stress ? -EQ_FALL - Math.abs(gauss(n, 21, seed)) * EQ_FALL_SD : EQ_CALM + gauss(n, 21, seed) * EQ_SD);
  // bonds move with equities (traditional markets together in down months), less deeply
  const bond = clamp(BOND_BETA * equity + BOND_SD * gauss(n, 22, seed));
  const engines = ENGINES.map((_, i) => {
    let v = DRIFT[i] + BETA[i] * equity + SIGMA[i] * gauss(n, 30 + i, seed);
    if (stress) v += REACT[i] * Math.abs(equity); // hedging and the overlay: built to react when stress rises
    if (stress && isStress(n - 1, seed)) v += RUN[i]; // directional: a persistent fall becomes a trend
    return clamp(v);
  });
  return { n, equity, bond, engines, down: equity < DOWN_CUT, stress };
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
export function level(get: (n: number) => Month, n: number, series: number /* -2 equity, -1 bond, 0..4 engines, 5 combined */): number {
  let s = 0, w = 1;
  for (let k = 0; k < DEPTH; k++) {
    const m = get(n - k);
    const v = series === -2 ? m.equity : series < 0 ? m.bond : series >= ENGINES.length ? combinedMove(m) : m.engines[series];
    s += w * v;
    w *= PHI;
  }
  return s;
}

/** Upper bound of |level|: every move at its maximum. */
export const LEVEL_BOUND = (MAX_MOVE * (1 - Math.pow(PHI, DEPTH))) / (1 - PHI);

const BLEND = ENGINES.map((e, i) => (e.blend ? i : -1)).filter((i) => i >= 0);
/** Equal-weight blend of the four strategies for a month (the overlay lane is not part of it). */
export function combinedMove(m: Month): number {
  return BLEND.reduce((a, i) => a + m.engines[i], 0) / BLEND.length;
}

/** An engine is highlighted in a (clear) down month when it moves the other way (up): an independent move. */
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

/** Rows / columns of the correlation matrix before the engines: equities, bonds. */
export const NM = MARKETS.length;

/**
 * Down-month correlation matrix over the CORR_WINDOW months ending at `end`: only the clear equity down months
 * (Month.down, equity < DOWN_CUT) count (downside correlation). Order: equities, bonds, then the engines. Symmetric, unit diagonal.
 */
export function downsideCorrelation(get: (n: number) => Month, end: number, window = CORR_WINDOW): number[][] {
  const cols: number[][] = Array.from({ length: ENGINES.length + NM }, () => []);
  for (let n = end - window + 1; n <= end; n++) {
    const m = get(n);
    if (!m.down) continue;
    cols[0].push(m.equity);
    cols[1].push(m.bond);
    m.engines.forEach((v, i) => cols[i + NM].push(v));
  }
  const k = cols.length;
  const out = Array.from({ length: k }, () => new Array<number>(k).fill(0));
  for (let i = 0; i < k; i++) {
    out[i][i] = 1;
    for (let j = 0; j < i; j++) { const c = pearson(cols[i], cols[j]); out[i][j] = c; out[j][i] = c; }
  }
  return out;
}

/** Height of the blended line's row, in strategy rows. */
const COMBINED_ROWS = 1.4;

/**
 * Layout of the canvas for a width: two groups on the left — traditional markets (equities, bonds) above our
 * strategies (five lanes and the blended line), each under a header row — and the heatmap at the side on wide
 * screens, stacked under the chart on narrow ones.
 */
export function overlayLayout(W: number, H: number) {
  const narrow = W < 700;
  const pad = narrow ? 12 : 20;
  const foot = narrow ? 58 : 26; // watermark row (narrow: two legend lines above it)
  const head = narrow ? 18 : 22; // group header row
  const gap = narrow ? 10 : 14; // between the two groups
  const labW = Math.round(Math.max(64, Math.min(132, W * (narrow ? 0.3 : 0.11))));
  if (!narrow) {
    const hmW = Math.round(Math.min(340, W * 0.3));
    const chartR = W - pad - hmW - 48;
    const top = 12, avail = H - top - foot - 6;
    const tradH = Math.round((avail - gap) * 0.3);
    return {
      narrow, pad, labW, foot, head, x0: pad + labW, x1: chartR,
      trad: { y: top, h: tradH },
      lanes: { y: top + tradH + gap, h: avail - tradH - gap },
      heat: { x: W - pad - hmW, y: top, w: hmW, h: H - top - foot - 6 },
    };
  }
  const top = 10;
  const avail = H - top - foot;
  const tradH = Math.round(avail * 0.2), lanesH = Math.round(avail * 0.37);
  const heatY = top + tradH + gap + lanesH + 14;
  return {
    narrow, pad, labW, foot, head, x0: pad + labW, x1: W - pad - 10,
    trad: { y: top, h: tradH },
    lanes: { y: top + tradH + gap, h: lanesH },
    heat: { x: pad, y: heatY, w: W - 2 * pad, h: H - foot - heatY - 4 },
  };
}

type OverlayLayout = ReturnType<typeof overlayLayout>;
export interface Row { y: number; h: number }

/** Centre line and height of every row: equities and bonds, the five engines, then the blended line. */
export function laneRows(L: OverlayLayout): { markets: Row[]; engines: Row[]; combined: Row } {
  const t = (L.trad.h - L.head) / MARKETS.length;
  const u = (L.lanes.h - L.head) / (ENGINES.length + COMBINED_ROWS);
  const y0 = L.lanes.y + L.head;
  return {
    markets: MARKETS.map((_, i) => ({ y: L.trad.y + L.head + t * i + t / 2, h: t })),
    engines: ENGINES.map((_, i) => ({ y: y0 + u * i + u / 2, h: u })),
    combined: { y: y0 + u * ENGINES.length + (u * COMBINED_ROWS) / 2, h: u * COMBINED_ROWS },
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
