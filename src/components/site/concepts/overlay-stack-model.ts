/**
 * overlay-stack-model.ts — pure model of the "what is an overlay" animation (/core-concepts): the core portfolio
 * stays 100% invested, a small margin deposit (about 10% of the exposure, an illustrative estimate) supports a full
 * futures exposure stacked on top, and each generated period adds the two return streams into the combined one.
 * The overlay's generated return follows market volatility (its sensitivity to volatility, or vega): small in calm
 * periods, clearly positive in volatile ones. Every value is generated; the core has no drift. Dependency-free.
 */
import { clamp, gauss, hash01 } from "../canvas/timeline.ts";

/** Steps: core invested · deposit · overlay stacked on top · two return streams. */
export const OVERLAY_STEP_MS = [2800, 2800, 3200, 7600] as const;
/** Shares of the capital base (illustrative estimates, as in the overlays 101 slides). */
export const DEPOSIT_SHARE = 0.1;
export const EXPOSURE_SHARE = 1;
/** Generated period contributions are clamped to ±MAX_CONTRIB (generated units, not percentages). */
export const MAX_CONTRIB = 2.4;
/** ms per generated period in the return chart. */
export const PERIOD_MS = 460;
/** Periods drawn in the return chart (one generated "market path" per loop). */
export const CHART_PERIODS = 16;

export interface Period {
  n: number;
  core: number;
  overlay: number;
  combined: number;
  /** generated market regime of the period: volatile (large moves either way) or calm */
  volatile: boolean;
}

/**
 * Volatile stretches of chart window `w` (CHART_PERIODS periods) for `seed`: a longer episode in the first half and a
 * short one in the second, placed by the seed, so every chart shows calm and volatile periods side by side.
 */
function isVolatile(n: number, seed = 0): boolean {
  const w = Math.floor(n / CHART_PERIODS),
    k = n - w * CHART_PERIODS;
  const a = 3 + Math.floor(hash01(w, 61, seed) * 4); // 3..6, four periods
  const b = 11 + Math.floor(hash01(w, 62, seed) * 3); // 11..13, two periods
  return (k >= a && k < a + 4) || (k >= b && k < b + 2);
}

/**
 * Period `n` of the stream for `seed`: deterministic, bounded, combined = core + overlay exactly. The overlay is
 * driven by market volatility (its vega): in calm periods it is small (slightly positive or flat, sometimes slightly
 * negative); in volatile periods — large moves up or down — it tends to be larger and positive, yet can still lose.
 * The core has no drift in either regime; volatile periods simply have a larger spread.
 */
export function periodAt(n: number, seed = 0): Period {
  const volatile = isVolatile(n, seed);
  const g = gauss(n, 1, seed);
  const lim = MAX_CONTRIB / 2;
  const core = clamp(volatile ? g * 0.85 : g * 0.22, -lim, lim);
  const noise = gauss(n, 2, seed);
  const overlay = clamp(volatile ? 0.15 + 0.55 * Math.abs(core) + 0.45 * noise : 0.05 + 0.13 * noise, -lim, lim);
  return { n, core, overlay, combined: core + overlay, volatile };
}

/** Bar heights of a period in units: the positive stack (up) and the negative stack (down). */
export const stackOf = (p: Period): { up: number; dn: number } => ({
  up: Math.max(0, p.core) + Math.max(0, p.overlay),
  dn: Math.max(0, -p.core) + Math.max(0, -p.overlay),
});

/** Pixels per unit for a chart window: its tallest stack fills `half` with 15% headroom (constant while bars grow). */
export function chartScale(ps: Period[], half: number): number {
  let m = 0.5;
  for (const p of ps) {
    const s = stackOf(p);
    m = Math.max(m, s.up, s.dn);
  }
  return half / (m * 1.15);
}

/** Index of the largest overlay loss among `ps` (-1 when none loses). */
export function largestLoss(ps: Period[]): number {
  let k = -1;
  ps.forEach((p, i) => {
    if (p.overlay < 0 && (k < 0 || p.overlay < ps[k].overlay)) k = i;
  });
  return k;
}

/**
 * Where the "losses add up too" note goes for the losing bar `i`: its text box (beside the pointer, towards the
 * chart's centre) sits under the deepest negative stack it spans, or above the tallest positive one when that does
 * not fit, so it never covers a bar. `line` is the pointer, from the bar to the text.
 */
export function lossNoteSpot(
  ps: Period[],
  i: number,
  g: { x0: number; bw: number; w: number; mid: number; top: number; bottom: number; scale: number; textW: number },
): { x: number; y: number; align: "left" | "right"; box: Rect; line: [number, number] } {
  const x = g.x0 + g.bw * (i + 0.5);
  const right = i >= ps.length / 2;
  const tx0 = right ? x - 4 - g.textW : x + 4,
    tx1 = tx0 + g.textW;
  let up = 0,
    dn = 0;
  ps.forEach((p, k) => {
    const cx = g.x0 + g.bw * (k + 0.5);
    if (cx + g.w / 2 < tx0 - 2 && k !== i) return;
    if (cx - g.w / 2 > tx1 + 2 && k !== i) return;
    const s = stackOf(p);
    up = Math.max(up, s.up * g.scale);
    dn = Math.max(dn, s.dn * g.scale);
  });
  const own = stackOf(ps[i]);
  let y = g.mid + dn + 14,
    line: [number, number] = [g.mid + own.dn * g.scale + 3, y - 6];
  if (y + 7 > g.bottom - 2) {
    y = Math.max(g.top + 7, g.mid - up - 14);
    line = [g.mid - own.up * g.scale - 3, y + 6];
  }
  return {
    x: right ? x - 4 : x + 4,
    y,
    align: right ? "right" : "left",
    box: { x: tx0, y: y - 7, w: g.textW, h: 14 },
    line,
  };
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Layout for a canvas size: the capital stack on the left (top on narrow screens), the return chart beside (below). */
export function overlayStackLayout(W: number, H: number) {
  const narrow = W < 700;
  const pad = narrow ? 14 : 24;
  const foot = 26;
  if (!narrow) {
    const stackW = Math.round(Math.min(460, W * 0.42));
    const stack: Rect = { x: pad, y: 18, w: stackW - pad, h: H - foot - 18 - 6 };
    const cx = pad + stackW + 36;
    const chart: Rect = { x: cx, y: 18, w: W - pad - cx, h: H - foot - 18 - 6 };
    return { narrow, pad, foot, stack, chart };
  }
  const avail = H - foot - 12;
  const sh = Math.round(avail * 0.5);
  const stack: Rect = { x: pad, y: 12, w: W - 2 * pad, h: sh };
  const chart: Rect = { x: pad, y: 12 + sh + 18, w: W - 2 * pad, h: avail - sh - 18 };
  return { narrow, pad, foot, stack, chart };
}

/**
 * Blocks inside the stack area: the core, the deposit beside it (its width = DEPOSIT_SHARE of the core) and the overlay
 * on top; under them the deposit's labels, then one bracket spanning core + deposit ("same capital base") with its
 * two-line sub-label. `labels` are the boxes of those texts (unit-tested not to overlap).
 */
export function stackBlocks(s: Rect, narrow: boolean) {
  const gap = narrow ? 10 : 14;
  const labelH = narrow ? 18 : 22;
  const under = narrow ? 34 : 36; // core bottom → bracket line (room for the deposit labels)
  const bracketH = under + 58;
  const coreW = (s.w - gap) / (1 + DEPOSIT_SHARE);
  const depW = coreW * DEPOSIT_SHARE;
  const free = s.h - labelH - bracketH;
  const coreH = Math.max(40, free * 0.46);
  const ovH = Math.max(30, free * 0.36);
  const coreY = s.y + labelH + (free - coreH);
  const core: Rect = { x: s.x, y: coreY, w: coreW, h: coreH };
  const deposit: Rect = {
    x: s.x + coreW + gap,
    y: coreY + coreH - Math.max(18, coreH * 0.42),
    w: depW,
    h: Math.max(18, coreH * 0.42),
  };
  const overlay: Rect = { x: s.x, y: coreY - 8 - ovH, w: coreW * EXPOSURE_SHARE, h: ovH };
  const bottom = coreY + coreH;
  const bracketY = bottom + under;
  const bracket = { x0: s.x, x1: s.x + s.w, y: bracketY };
  const right = s.x + s.w;
  const box = (cx: number, cy: number, w: number, align: "left" | "center" | "right"): Rect => ({
    x: align === "right" ? cx - w : align === "center" ? cx - w / 2 : cx,
    y: cy - 7,
    w,
    h: 14,
  });
  const depLabelW = Math.min(120, s.w * 0.4);
  const labels = {
    depositA: box(right, bottom + 10, depLabelW, "right"),
    depositB: box(right, bottom + 24, depLabelW, "right"),
    bracket: box((bracket.x0 + bracket.x1) / 2, bracketY + 19, s.w, "center"),
    sub1: box((bracket.x0 + bracket.x1) / 2, bracketY + 34, s.w, "center"),
    sub2: box((bracket.x0 + bracket.x1) / 2, bracketY + 48, s.w, "center"),
  };
  return { core, deposit, overlay, bracketY, bracket, labels, gap };
}
