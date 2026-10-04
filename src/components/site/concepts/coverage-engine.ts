/**
 * coverage-engine.ts — canvas scene of "ultra-micro analysis, at scale" (/core-concepts), drawn as a comparison: a
 * conventional fundamental team (left) VS our systems (right), the same ≈2,000 dots (the Canadian investment-grade index,
 * six named sector clusters) on both sides, a "VS" badge between them. Step 1: both universes appear and the issues
 * under the $200 MM filter fade to outlines. Step 2 (left): a portfolio manager and six sector analysts light ~30
 * securities each in their own sector's cluster and colour over a year, 180 in all. Step 3 (right): a scan sweeps the grid
 * and lights every liquid bond, then layers of history stack up behind it (every day remembered). Step 4: side by side.
 * Dots are drawn in batched paths; history layers are pre-rendered.
 */
import { COL, makePen, rgba, type Pen } from "./draw-kit.ts";
import {
  ANALYSTS, COVERAGE_STEP_MS, LAYERS, PER_ANALYST, UNIVERSE, analystPos, analystSlot, cellOf, coverageLayout, pmPos, sectorFont,
  sectorLabelBoxes, teamCoverage, universe, type Bond, type Rect, type Side,
} from "./coverage-model.ts";
import { runScene, type Runner, type RunnerOptions } from "./runner.ts";
import { ease, easeOut, span, stepAt, stepStarts } from "./timeline.ts";

export interface CoverageLabels {
  pm: string; pmShort: string; perYear: string; covered: string; of: string; universe: string; liquid: string; below: string;
  scan: string; scanned: string; memory: string; otc: string; dot: string; team: string; systems: string; vs: string; watermark: string;
  /** sector names in three lengths (analyst a covers sector a), longest first */
  sectors: { long: string; short: string; abbr: string }[];
}

const STARTS = stepStarts(COVERAGE_STEP_MS);
/** One colour per sector (and its analyst): financials, technology & communications, consumer, utilities & infrastructure, energy, industrials. */
export const ANALYST_COLORS = ["#1a73e8", "#00a3e0", "#6d5bd0", "#0f9d8a", "#e37400", "#c5221f"];

export function createCoverage(canvas: HTMLCanvasElement, opts: RunnerOptions & { labels: () => CoverageLabels }): Runner {
  const bonds: Bond[] = universe(0);
  const team = teamCoverage(bonds, 0);
  const owner = new Map<number, { a: number; k: number }>();
  team.forEach((list, a) => list.forEach((i, k) => owner.set(i, { a, k })));
  let L = coverageLayout(1, 1);
  // dot centres per side (both grids share a shape, at different places)
  let posL: { x: number; y: number }[] = [];
  let posR: { x: number; y: number }[] = [];
  let bandsL: Rect[] = [];
  let bandsR: Rect[] = [];
  let layer: HTMLCanvasElement | null = null;
  let pen: Pen | null = null;

  function prerender() {
    posL = bonds.map((b) => cellOf(b.i, L.left));
    posR = bonds.map((b) => cellOf(b.i, L.right));
    bandsL = sectorLabelBoxes(L.left);
    bandsR = sectorLabelBoxes(L.right);
    // one history layer: the lit grid, pre-rendered once per size
    if (typeof document === "undefined") return;
    const G = L.right.grid;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const c = layer ?? document.createElement("canvas");
    c.width = Math.max(1, Math.round((G.w + 4) * dpr)); c.height = Math.max(1, Math.round((G.h + 4) * dpr));
    const x = c.getContext("2d");
    if (x) {
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.clearRect(0, 0, G.w + 4, G.h + 4);
      x.fillStyle = rgba(COL.blue, 0.9);
      x.beginPath();
      const r = Math.max(0.8, L.right.cell * 0.26);
      for (const b of bonds) {
        if (!b.liquid) continue;
        const p = posR[b.i];
        x.moveTo(p.x - G.x + 2 + r, p.y - G.y + 2);
        x.arc(p.x - G.x + 2, p.y - G.y + 2, r, 0, Math.PI * 2);
      }
      x.fill();
    }
    layer = c;
  }

  const scene = {
    steps: COVERAGE_STEP_MS,
    stillAt: (s: number) => STARTS[s] + COVERAGE_STEP_MS[s] * (s === 0 ? 0.92 : s === 1 ? 0.97 : s === 2 ? 0.93 : 0.6),
    resize(W: number, H: number) { L = coverageLayout(W, H); prerender(); },
    draw(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
      pen ??= makePen(ctx);
      const P = pen;
      const lab = opts.labels();
      const { step, p } = stepAt(t, COVERAGE_STEP_MS);
      const appear = step > 0 ? 1 : easeOut(span(p, 0, 0.55));
      const filter = step > 0 ? 1 : ease(span(p, 0.55, 0.9));
      const year = step > 1 ? 1 : step < 1 ? 0 : span(p, 0.06, 0.9);
      const scan = step > 2 ? 1 : step < 2 ? 0 : span(p, 0.05, 0.5);
      const mem = step > 2 ? 1 : step < 2 ? 0 : ease(span(p, 0.55, 0.8));
      const fade = step === 3 ? 1 - span(p, 0.96, 1) : 1;
      // focus: the side the step is about at full strength, the other softened; both in steps 1 and 4
      const fL = step === 2 ? 0.42 : 1, fR = step === 1 ? 0.42 : 1;

      /* ---------- title row across the canvas */
      const small = L.narrow ? 10 : 11;
      ctx.globalAlpha = fade * appear;
      P.font(600, small);
      const tw = P.text(lab.universe.toUpperCase(), L.pad, L.titleY, (W - 2 * L.pad) * (L.narrow ? 1 : 0.6), "left", COL.mute);
      if (!L.narrow || W - 2 * L.pad - tw > 150) { P.font(500, small); P.text(lab.dot, W - L.pad, L.titleY, W - 2 * L.pad - tw - 16, "right", COL.mute); }

      frame(ctx, P, L.left, fade * fL, step === 1 || step === 3);
      frame(ctx, P, L.right, fade * fR, step === 2 || step === 3);

      /* ---------- right side: history sheets behind the grid (memory) */
      if (mem > 0 && layer) {
        const S = L.right, G = S.grid;
        const sheet = (k: number, alpha: number) => {
          const ox = (S.depthX * k) / LAYERS * mem, oy = -(S.depthY * k) / LAYERS * mem;
          ctx.globalAlpha = fade * fR * mem;
          P.round(G.x - 6 + ox, G.y - 6 + oy, G.w + 12, G.h + 12, 8);
          ctx.fillStyle = "rgba(250,252,255,.94)"; ctx.fill();
          ctx.strokeStyle = rgba(COL.blue, 0.22); ctx.lineWidth = 1; ctx.stroke();
          if (alpha > 0) { ctx.globalAlpha = fade * fR * mem * alpha; ctx.drawImage(layer!, G.x - 2 + ox, G.y - 2 + oy, G.w + 4, G.h + 4); }
        };
        for (let k = LAYERS; k >= 1; k--) sheet(k, 0.1 + 0.25 * (1 - k / (LAYERS + 1)));
        sheet(0, 0);
        // a light runs from the oldest sheet to today, again and again
        const run = (t / 1600) % 1;
        const k = LAYERS * (1 - run);
        const ox = (S.depthX * k) / LAYERS * mem, oy = -(S.depthY * k) / LAYERS * mem;
        ctx.globalAlpha = fade * fR * mem * Math.sin(Math.PI * run) * 0.9;
        ctx.strokeStyle = rgba(COL.sky, 0.95); ctx.lineWidth = 1.6;
        P.round(G.x - 6 + ox, G.y - 6 + oy, G.w + 12, G.h + 12, 8); ctx.stroke();
      }

      /* ---------- the dots, in batched paths by state */
      const r = Math.max(0.8, L.left.cell * 0.26);
      const scanX = L.right.grid.x + L.right.grid.w * scan;
      dots(ctx, L.left, posL, appear, filter, fade * fL, r, step, (b) => {
        const own = owner.get(b.i);
        return own && year * PER_ANALYST > own.k ? `a${own.a}` : null;
      });
      dots(ctx, L.right, posR, appear, filter, fade * fR, r, step, (b, q) => {
        if (!b.liquid || scan <= 0 || q.x > scanX) return null;
        const near = Math.max(0, 1 - (scanX - q.x) / (L.right.grid.w * 0.12));
        return near > 0.5 && scan < 1 ? "front" : "scan";
      });

      // right: daily re-scoring twinkle once the history is in memory
      if (mem > 0) {
        for (let k = 0; k < 26; k++) {
          const i = Math.floor((((t / 260) | 0) * 97 + k * 389) % UNIVERSE);
          if (!bonds[i].liquid) continue;
          const q = posR[i];
          ctx.globalAlpha = fade * fR * mem * 0.8;
          P.glowDot(q.x, q.y, r * 1.1, COL.cyan, 0.7);
        }
      }

      // right: scan line
      if (scan > 0 && scan < 1) {
        const G = L.right.grid;
        ctx.globalAlpha = fade * fR;
        const g = ctx.createLinearGradient(scanX - 40, 0, scanX + 2, 0);
        g.addColorStop(0, rgba(COL.sky, 0)); g.addColorStop(1, rgba(COL.sky, 0.35));
        ctx.fillStyle = g; ctx.fillRect(Math.max(G.x, scanX - 40), G.y - 4, Math.min(42, scanX - G.x + 2), G.h + 8);
        ctx.fillStyle = rgba(COL.cyan, 0.95); ctx.fillRect(scanX - 1, G.y - 6, 2, G.h + 12);
      }

      // left: analysts reaching their newest security, a fine line from the crew row
      if (step === 1) {
        ctx.globalAlpha = fade;
        for (let a = 0; a < ANALYSTS; a++) {
          const k = Math.min(PER_ANALYST - 1, Math.floor(year * PER_ANALYST));
          const q = posL[team[a][k]];
          const from = analystPos(L.left, a);
          const fr = (year * PER_ANALYST) % 1;
          ctx.strokeStyle = rgba(ANALYST_COLORS[a], 0.4 * Math.sin(Math.PI * fr));
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(from.x, from.y + 4);
          ctx.quadraticCurveTo((from.x + q.x) / 2, (from.y + q.y) / 2 - 10, q.x, q.y); ctx.stroke();
        }
      }

      /* ---------- sector names above the clusters (right: they give way to the history sheets) */
      sectors(ctx, P, lab, L.left, bandsL, fade * appear * fL * (step === 1 ? 1 : 0.8));
      sectors(ctx, P, lab, L.right, bandsR, fade * appear * fR * (1 - mem) * 0.8);

      // right: over-the-counter note while the scan runs, then the memory
      if (step === 2) {
        const G = L.right.grid;
        ctx.globalAlpha = fade * span(p, 0.08, 0.16) * (1 - span(p, 0.46, 0.54));
        pill(P, ctx, lab.otc, G.x + G.w / 2, G.y + G.h / 2, G.w * 0.94, COL.amber);
        ctx.globalAlpha = fade * span(p, 0.62, 0.7);
        pill(P, ctx, lab.memory, G.x + G.w / 2, G.y + G.h / 2, G.w * 0.94, COL.blue);
      }

      drawTeam(ctx, P, lab, step, year, fade * fL);
      drawSystems(ctx, P, lab, step, scan, mem, filter, fade * fR);
      drawVs(ctx, P, lab, step, p, t, fade * appear);
      ctx.globalAlpha = 1;
      P.watermark(lab.watermark, W, H, L.pad);
    },
  };

  /** A side's frame: a soft card, brighter when it is the focus of the step. */
  function frame(ctx: CanvasRenderingContext2D, P: Pen, S: Side, alpha: number, focus: boolean) {
    const F = S.panel;
    ctx.globalAlpha = alpha;
    P.round(F.x, F.y, F.w, F.h, 14);
    const g = ctx.createLinearGradient(F.x, F.y, F.x + F.w, F.y + F.h);
    g.addColorStop(0, "rgba(255,255,255,.96)"); g.addColorStop(1, rgba(COL.blue, focus ? 0.05 : 0.025));
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = rgba(COL.blue, focus ? 0.3 : 0.14); ctx.lineWidth = focus ? 1.3 : 1; ctx.stroke();
  }

  function dots(ctx: CanvasRenderingContext2D, S: Side, pos: { x: number; y: number }[], appear: number, filter: number, alpha: number, r: number, step: number,
    lit: (b: Bond, q: { x: number; y: number }) => string | null) {
    const G = S.grid;
    const paths: Record<string, Path2D> = {};
    const add = (key: string, x: number, y: number, rr: number) => {
      const pth = (paths[key] ??= new Path2D());
      pth.moveTo(x + rr, y); pth.arc(x, y, rr, 0, Math.PI * 2);
    };
    const cx0 = G.x + G.w / 2, cy0 = G.y + G.h / 2, maxD = Math.hypot(G.w, G.h) / 2;
    for (const b of bonds) {
      const q = pos[b.i];
      if (!q) continue;
      // appearance: a ripple from the centre
      if (appear < 1 && Math.hypot(q.x - cx0, q.y - cy0) / maxD > appear * 1.05) continue;
      const key = lit(b, q);
      if (key && key[0] === "a") { add(key, q.x, q.y, r * 1.25); continue; }
      if (!b.liquid && filter > 0.5) { add("out", q.x, q.y, r); continue; }
      if (key === "front") add("front", q.x, q.y, r * 1.35);
      else if (key) add(key, q.x, q.y, r);
      else add("base", q.x, q.y, r);
    }
    ctx.globalAlpha = alpha;
    const fill = (key: string, style: string) => { const pth = paths[key]; if (pth) { ctx.fillStyle = style; ctx.fill(pth); } };
    const pth = paths.out;
    if (pth) { ctx.strokeStyle = rgba(COL.mute, 0.28); ctx.lineWidth = 0.8; ctx.stroke(pth); }
    fill("base", rgba(COL.mute, step >= 1 ? 0.2 : 0.3));
    fill("scan", rgba(COL.blue, step === 3 ? 0.85 : 0.72));
    fill("front", COL.sky);
    for (let a = 0; a < ANALYSTS; a++) fill(`a${a}`, ANALYST_COLORS[a]);
  }

  function sectors(ctx: CanvasRenderingContext2D, P: Pen, lab: CoverageLabels, S: Side, bands: Rect[], alpha: number) {
    if (alpha <= 0.01) return;
    ctx.globalAlpha = alpha;
    P.font(600, sectorFont(S));
    bands.forEach((bx, s) => {
      P.text(fitName(P, { ...lab.sectors[s], long: lab.sectors[s].short }, bx.w + 4), bx.x + bx.w / 2, bx.y + bx.h / 2, bx.w + 4, "center", ANALYST_COLORS[s]);
    });
  }

  function pill(P: Pen, ctx: CanvasRenderingContext2D, s: string, x: number, y: number, maxW: number, color: string) {
    P.font(600, L.narrow ? 11 : 12.5);
    const w = Math.min(P.measure(s) + 28, maxW);
    P.round(x - w / 2, y - 15, w, 30, 15);
    ctx.fillStyle = "rgba(255,255,255,.95)"; ctx.fill();
    ctx.strokeStyle = rgba(color, 0.5); ctx.lineWidth = 1; ctx.stroke();
    P.text(s, x, y, w - 20, "center", color === COL.amber ? COL.orange : COL.blueD);
  }

  /** The longest sector name that fits `maxW` (long, short, then abbreviation; fitted as a last resort). */
  function fitName(P: Pen, n: { long: string; short: string; abbr: string }, maxW: number): string {
    for (const s of [n.long, n.short]) if (P.measure(s) <= maxW) return s;
    return n.abbr;
  }

  /** A gradient figure (counter or claim) at x, y. */
  function figure(ctx: CanvasRenderingContext2D, P: Pen, s: string, x: number, y: number, size: number, maxW: number): number {
    P.font(600, size);
    const g = ctx.createLinearGradient(x, 0, x + Math.min(maxW, P.measure(s)), 0);
    g.addColorStop(0, COL.blueD); g.addColorStop(1, COL.cyan);
    ctx.fillStyle = g;
    return P.text(s, x, y, maxW, "left");
  }

  /** Left side: the conventional team — portfolio manager, six sector analysts, a year of coverage, the count. */
  function drawTeam(ctx: CanvasRenderingContext2D, P: Pen, lab: CoverageLabels, step: number, year: number, alpha: number) {
    const S = L.left, C = S.crew;
    ctx.globalAlpha = alpha;
    P.font(600, L.narrow ? 10 : 11);
    P.text(lab.team.toUpperCase(), S.inner.x, S.titleY, S.inner.w, "left", COL.ink2);
    // portfolio manager
    const pm = pmPos(S);
    const pr = L.narrow ? 8 : 9;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = COL.ink2; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(pm.x, pm.y, pr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = COL.ink2; ctx.beginPath(); ctx.arc(pm.x, pm.y - 2, pr * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(pm.x, pm.y + pr * 0.55, pr * 0.46, Math.PI, 0); ctx.fill();
    P.font(600, 9);
    P.text(lab.pmShort, pm.x, pm.y + 15, 30, "center", COL.ink2);
    const slot = analystSlot(S);
    // the portfolio manager leads the six analysts: one dashed line along the row
    const last = analystPos(S, ANALYSTS - 1);
    ctx.strokeStyle = rgba(COL.mute, 0.3); ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(pm.x + pr + 2, pm.y); ctx.lineTo(last.x, last.y); ctx.stroke();
    ctx.setLineDash([]);
    for (let a = 0; a < ANALYSTS; a++) {
      const q = analystPos(S, a);
      P.glowDot(q.x, q.y, L.narrow ? 4 : 4.5, ANALYST_COLORS[a], step === 1 ? 0.8 : 0.35);
      P.font(600, L.narrow ? 9 : 10);
      P.text(fitName(P, { ...lab.sectors[a], long: lab.sectors[a].short }, slot - 4), q.x, q.y + 15, slot - 2, "center", ANALYST_COLORS[a]);
    }
    // a year of work: ≈30 securities each
    const ly = C.y + 39;
    P.font(500, L.narrow ? 9.5 : 10.5);
    const w = P.text(lab.perYear, C.x, ly, C.w * 0.62, "left", COL.mute);
    const bx = C.x + w + 10, bw = C.x + C.w - bx;
    if (bw > 20) {
      P.round(bx, ly - 2, bw, 4, 2); ctx.fillStyle = rgba(COL.mute, 0.14); ctx.fill();
      P.round(bx, ly - 2, bw * year, 4, 2); ctx.fillStyle = COL.blue; ctx.fill();
    }
    // the result: 180 of ≈2,000, covered in depth
    const R = S.result;
    const covered = Math.round(Math.min(1, year) * ANALYSTS * PER_ANALYST);
    const big = L.narrow ? 24 : 28;
    const nw = figure(ctx, P, String(covered), R.x, R.y + R.h / 2, big, R.w * 0.3);
    P.font(500, L.narrow ? 10.5 : 11.5);
    P.text(lab.of, R.x + nw + 10, R.y + R.h / 2 - 8, R.w - nw - 10, "left", COL.mute);
    P.font(600, L.narrow ? 10.5 : 11.5);
    P.text(lab.covered, R.x + nw + 10, R.y + R.h / 2 + 8, R.w - nw - 10, "left", COL.ink2);
  }

  /** Right side: our systems — the scan, the liquidity filter, every liquid bond and every day of history. */
  function drawSystems(ctx: CanvasRenderingContext2D, P: Pen, lab: CoverageLabels, step: number, scan: number, mem: number, filter: number, alpha: number) {
    const S = L.right, C = S.crew;
    ctx.globalAlpha = alpha;
    P.font(600, L.narrow ? 10 : 11);
    P.text(lab.systems.toUpperCase(), S.inner.x, S.titleY, S.inner.w, "left", COL.ink2);
    // the system: concentric rings, then the scan bar
    const ic = { x: C.x + 12, y: C.y + 9 };
    for (let k = 0; k < 3; k++) {
      ctx.strokeStyle = rgba(COL.blue, 0.85 - k * 0.25); ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.arc(ic.x, ic.y, 3 + k * 3, 0, Math.PI * 2); ctx.stroke();
    }
    P.font(600, L.narrow ? 10 : 11);
    const sw = P.text(lab.scan, C.x + 34, ic.y, C.w * 0.5, "left", COL.blueD);
    const bx = C.x + 34 + sw + 12, bw = C.x + C.w - bx;
    if (bw > 20) {
      P.round(bx, ic.y - 3, bw, 6, 3); ctx.fillStyle = rgba(COL.mute, 0.14); ctx.fill();
      const sg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      sg.addColorStop(0, COL.blueD); sg.addColorStop(1, COL.sky);
      P.round(bx, ic.y - 3, bw * scan, 6, 3); ctx.fillStyle = sg; ctx.fill();
    }
    // filter legend: outlines under the filter, filled dots reviewed
    ctx.globalAlpha = alpha * filter;
    const ly = C.y + 30;
    const small = L.narrow ? 9.5 : 10.5;
    ctx.strokeStyle = rgba(COL.mute, 0.55); ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.arc(C.x + 4, ly, 3.2, 0, Math.PI * 2); ctx.stroke();
    P.font(500, small);
    const w1 = P.text(lab.below, C.x + 12, ly, C.w * 0.32, "left", COL.mute);
    ctx.fillStyle = rgba(COL.blue, 0.8); ctx.beginPath(); ctx.arc(C.x + 26 + w1, ly, 3.2, 0, Math.PI * 2); ctx.fill();
    P.text(lab.liquid, C.x + 34 + w1, ly, C.w - (34 + w1), "left", COL.ink2);
    // the result: every liquid bond, every day; every day of history, remembered
    ctx.globalAlpha = alpha * Math.max(0.35, Math.min(1, scan * 1.5));
    const R = S.result;
    figure(ctx, P, lab.scanned, R.x, R.y + R.h / 2 - 7, L.narrow ? 13 : 15, R.w);
    ctx.globalAlpha = alpha * Math.max(0.35, mem);
    P.font(500, L.narrow ? 10 : 11);
    P.text(lab.memory, R.x, R.y + R.h / 2 + 11, R.w, "left", step >= 2 ? COL.ink2 : COL.mute);
  }

  /** The VS badge between the two sides, with a divider; it pulses in the side-by-side step. */
  function drawVs(ctx: CanvasRenderingContext2D, P: Pen, lab: CoverageLabels, step: number, p: number, t: number, alpha: number) {
    const V = L.vs;
    ctx.globalAlpha = alpha * 0.8;
    // divider: through the gutter, interrupted by the badge
    const g = L.narrow ? ctx.createLinearGradient(L.left.panel.x, 0, L.left.panel.x + L.left.panel.w, 0) : ctx.createLinearGradient(0, L.left.panel.y, 0, L.left.panel.y + L.left.panel.h);
    g.addColorStop(0, rgba(COL.blue, 0)); g.addColorStop(0.5, rgba(COL.blue, 0.35)); g.addColorStop(1, rgba(COL.blue, 0));
    ctx.fillStyle = g;
    if (L.narrow) {
      const x0 = L.left.panel.x, x1 = x0 + L.left.panel.w;
      ctx.fillRect(x0, V.y - 0.5, V.x - V.r - 8 - x0, 1); ctx.fillRect(V.x + V.r + 8, V.y - 0.5, x1 - (V.x + V.r + 8), 1);
    } else {
      const y0 = L.left.panel.y, y1 = y0 + L.left.panel.h;
      ctx.fillRect(V.x - 0.5, y0, 1, V.y - V.r - 8 - y0); ctx.fillRect(V.x - 0.5, V.y + V.r + 8, 1, y1 - (V.y + V.r + 8));
    }
    // pulse: always a soft breath, a strong ring in the side-by-side step
    const breath = 0.5 + 0.5 * Math.sin(t / 700);
    const ring = step === 3 ? (t / 1400) % 1 : 0;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = rgba(COL.cyan, 0.1 + 0.08 * breath + (step === 3 ? 0.06 : 0));
    ctx.beginPath(); ctx.arc(V.x, V.y, V.r + 4 + 2 * breath, 0, Math.PI * 2); ctx.fill();
    if (step === 3) {
      ctx.strokeStyle = rgba(COL.cyan, 0.5 * (1 - ring) * Math.min(1, p * 8)); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(V.x, V.y, V.r + 4 + 14 * ring, 0, Math.PI * 2); ctx.stroke();
    }
    const bg = ctx.createLinearGradient(V.x - V.r, V.y - V.r, V.x + V.r, V.y + V.r);
    bg.addColorStop(0, COL.blueD); bg.addColorStop(1, COL.cyan);
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(V.x, V.y, V.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 2; ctx.stroke();
    P.font(600, L.narrow ? 12 : 14);
    P.text(lab.vs, V.x, V.y + 0.5, V.r * 2 - 6, "center", "#fff");
  }

  return runScene(canvas, scene, opts);
}
