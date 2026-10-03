/**
 * overlay-stack-model.ts — pure model of the "what is an overlay" animation (/critical-concepts): the core portfolio
 * stays 100% invested, a small margin deposit (about 10% of the exposure, an illustrative estimate) supports a full
 * futures exposure stacked on top, and each generated period adds the two return streams into the combined one.
 * Every value is generated, symmetric around zero (no drift), so nothing reads as a result. Dependency-free.
 */
import { clamp, gauss } from "./timeline.ts";

/** Steps: core invested · deposit · overlay stacked on top · two return streams. */
export const OVERLAY_STEP_MS = [2800, 2800, 3200, 7600] as const;
/** Shares of the capital base (illustrative estimates, as in the overlays 101 slides). */
export const CORE_SHARE = 1;
export const DEPOSIT_SHARE = 0.1;
export const EXPOSURE_SHARE = 1;
/** Generated period contributions are clamped to ±MAX_CONTRIB (generated units, not percentages). */
export const MAX_CONTRIB = 2.4;
/** ms per generated period in the return chart. */
export const PERIOD_MS = 460;

export interface Period { n: number; core: number; overlay: number; combined: number }

/** Period `n` of the stream for `seed`: deterministic, bounded, combined = core + overlay exactly. */
export function periodAt(n: number, seed = 0): Period {
  const core = clamp(gauss(n, 1, seed) * 0.55, -MAX_CONTRIB / 2, MAX_CONTRIB / 2);
  const overlay = clamp(gauss(n, 2, seed) * 0.75, -MAX_CONTRIB / 2, MAX_CONTRIB / 2);
  return { n, core, overlay, combined: core + overlay };
}

export interface Rect { x: number; y: number; w: number; h: number }

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
  const deposit: Rect = { x: s.x + coreW + gap, y: coreY + coreH - Math.max(18, coreH * 0.42), w: depW, h: Math.max(18, coreH * 0.42) };
  const overlay: Rect = { x: s.x, y: coreY - 8 - ovH, w: coreW * EXPOSURE_SHARE, h: ovH };
  const bottom = coreY + coreH;
  const bracketY = bottom + under;
  const bracket = { x0: s.x, x1: s.x + s.w, y: bracketY };
  const right = s.x + s.w;
  const box = (cx: number, cy: number, w: number, align: "left" | "center" | "right"): Rect =>
    ({ x: align === "right" ? cx - w : align === "center" ? cx - w / 2 : cx, y: cy - 7, w, h: 14 });
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
