/**
 * coverage-engine.ts — canvas scene of "ultra-micro analysis, at scale" (/critical-concepts). Step 1: about 2,000 dots
 * (the Canadian investment-grade index, in six named sector clusters) appear and the issues under the $200 MM filter
 * fade to outlines. Step 2: a portfolio manager and six sector analysts light ~30 securities each in their own sector's
 * cluster and colour over a year, 180 in all (a small fraction).
 * Step 3: a scan sweeps the grid and lights every liquid bond. Step 4: layers of history stack up behind the grid and a
 * light runs through them (every day remembered). Dots are drawn in batched paths; history layers are pre-rendered.
 */
import { COL, makePen, rgba, splitLabel, type Pen } from "./draw-kit.ts";
import {
  ANALYSTS, COVERAGE_STEP_MS, LAYERS, PER_ANALYST, UNIVERSE, analystPos as slotOf, analystSlot, cellOf, coverageLayout, sectorLabelBoxes,
  teamCoverage, universe, type Bond, type Rect,
} from "./coverage-model.ts";
import { runScene, type Runner, type RunnerOptions } from "./runner.ts";
import { ease, easeOut, span, stepAt, stepStarts } from "./timeline.ts";

export interface CoverageLabels {
  pm: string; analyst: string; perYear: string; covered: string; of: string; universe: string; liquid: string; below: string;
  scanned: string; memory: string; otc: string; dot: string; team: string; systems: string; watermark: string;
  /** sector names in three lengths (analyst a covers sector a), longest first */
  sectors: { long: string; short: string; abbr: string }[];
}

const STARTS = stepStarts(COVERAGE_STEP_MS);
/** One colour per sector (and its analyst): financials, technology & telecom, consumer, utilities & infrastructure, energy, industrials. */
export const ANALYST_COLORS = ["#1a73e8", "#00a3e0", "#6d5bd0", "#0f9d8a", "#e37400", "#c5221f"];

export function createCoverage(canvas: HTMLCanvasElement, opts: RunnerOptions & { labels: () => CoverageLabels }): Runner {
  const bonds: Bond[] = universe(0);
  const team = teamCoverage(bonds, 0);
  const owner = new Map<number, { a: number; k: number }>();
  team.forEach((list, a) => list.forEach((i, k) => owner.set(i, { a, k })));
  let L = coverageLayout(1, 1);
  let pos: { x: number; y: number }[] = [];
  let bands: Rect[] = [];
  let layer: HTMLCanvasElement | null = null;
  let pen: Pen | null = null;

  function prerender() {
    pos = bonds.map((b) => cellOf(b.i, L));
    bands = sectorLabelBoxes(L);
    // one history layer: the lit grid, pre-rendered once per size
    if (typeof document === "undefined") return;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const c = layer ?? document.createElement("canvas");
    c.width = Math.max(1, Math.round((L.grid.w + 4) * dpr)); c.height = Math.max(1, Math.round((L.grid.h + 4) * dpr));
    const x = c.getContext("2d");
    if (x) {
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.clearRect(0, 0, L.grid.w + 4, L.grid.h + 4);
      x.fillStyle = rgba(COL.blue, 0.9);
      x.beginPath();
      const r = Math.max(0.8, L.cell * 0.26);
      for (const b of bonds) {
        if (!b.liquid) continue;
        const p = pos[b.i];
        x.moveTo(p.x - L.grid.x + 2 + r, p.y - L.grid.y + 2);
        x.arc(p.x - L.grid.x + 2, p.y - L.grid.y + 2, r, 0, Math.PI * 2);
      }
      x.fill();
    }
    layer = c;
  }

  const scene = {
    steps: COVERAGE_STEP_MS,
    stillAt: (s: number) => STARTS[s] + COVERAGE_STEP_MS[s] * (s === 0 ? 0.92 : s === 1 ? 0.97 : s === 2 ? 0.9 : 0.75),
    resize(W: number, H: number) { L = coverageLayout(W, H); prerender(); },
    draw(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
      pen ??= makePen(ctx);
      const P = pen;
      const lab = opts.labels();
      const { step, p } = stepAt(t, COVERAGE_STEP_MS);
      const appear = step > 0 ? 1 : easeOut(span(p, 0, 0.55));
      const filter = step > 0 ? 1 : ease(span(p, 0.55, 0.9));
      const year = step > 1 ? 1 : step < 1 ? 0 : span(p, 0.06, 0.9);
      const scan = step > 2 ? 1 : step < 2 ? 0 : span(p, 0.05, 0.85);
      const mem = step < 3 ? 0 : ease(span(p, 0, 0.45));
      const fade = step === 3 ? 1 - span(p, 0.96, 1) : 1;
      ctx.globalAlpha = fade;
      const G = L.grid;
      const r = Math.max(0.8, L.cell * 0.26);
      const scanX = G.x + G.w * scan;

      /* ---------- history layers behind the grid (memory step): sheets stacked in depth, oldest at the back */
      if (mem > 0 && layer) {
        const sheet = (k: number, alpha: number) => {
          const ox = (L.depthX * k) / LAYERS * mem, oy = -(L.depthY * k) / LAYERS * mem;
          ctx.globalAlpha = fade * mem;
          P.round(G.x - 6 + ox, G.y - 6 + oy, G.w + 12, G.h + 12, 8);
          ctx.fillStyle = "rgba(250,252,255,.92)"; ctx.fill();
          ctx.strokeStyle = rgba(COL.blue, 0.22); ctx.lineWidth = 1; ctx.stroke();
          if (alpha > 0) { ctx.globalAlpha = fade * mem * alpha; ctx.drawImage(layer!, G.x - 2 + ox, G.y - 2 + oy, G.w + 4, G.h + 4); }
        };
        for (let k = LAYERS; k >= 1; k--) sheet(k, 0.1 + 0.25 * (1 - k / (LAYERS + 1)));
        sheet(0, 0);
        // a light runs from the oldest sheet to today, again and again
        const run = (t / 1600) % 1;
        const k = LAYERS * (1 - run);
        const ox = (L.depthX * k) / LAYERS * mem, oy = -(L.depthY * k) / LAYERS * mem;
        ctx.globalAlpha = fade * mem * Math.sin(Math.PI * run) * 0.9;
        ctx.strokeStyle = rgba(COL.sky, 0.95); ctx.lineWidth = 1.6;
        P.round(G.x - 6 + ox, G.y - 6 + oy, G.w + 12, G.h + 12, 8); ctx.stroke();
        ctx.globalAlpha = fade;
      }

      /* ---------- the dots, in batched paths by state */
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
        const dist = Math.hypot(q.x - cx0, q.y - cy0) / maxD;
        if (appear < 1 && dist > appear * 1.05) continue;
        const own = owner.get(b.i);
        const lit = own ? year * PER_ANALYST > own.k : false;
        const scanned = b.liquid && scan > 0 && q.x <= scanX;
        if (!b.liquid && filter > 0.5) { add("out", q.x, q.y, r); continue; }
        if (lit) add(`a${own!.a}`, q.x, q.y, r * 1.25);
        else if (scanned) {
          const near = Math.max(0, 1 - (scanX - q.x) / (G.w * 0.12));
          add(near > 0.5 && scan < 1 ? "front" : "scan", q.x, q.y, r * (1 + 0.35 * near));
        } else add("base", q.x, q.y, r);
      }
      const fill = (key: string, style: string) => { const pth = paths[key]; if (pth) { ctx.fillStyle = style; ctx.fill(pth); } };
      const stroke = (key: string, style: string) => { const pth = paths[key]; if (pth) { ctx.strokeStyle = style; ctx.lineWidth = 0.8; ctx.stroke(pth); } };
      fill("base", rgba(COL.mute, step >= 1 ? 0.2 : 0.3));
      stroke("out", rgba(COL.mute, 0.28));
      fill("scan", rgba(COL.blue, step === 3 ? 0.85 : 0.7));
      fill("front", COL.sky);
      for (let a = 0; a < ANALYSTS; a++) fill(`a${a}`, ANALYST_COLORS[a]);

      // daily re-scoring twinkle in the memory step
      if (mem > 0) {
        for (let k = 0; k < 26; k++) {
          const i = Math.floor((((t / 260) | 0) * 97 + k * 389) % UNIVERSE);
          const b = bonds[i];
          if (!b.liquid) continue;
          const q = pos[i];
          ctx.globalAlpha = fade * mem * 0.8;
          P.glowDot(q.x, q.y, r * 1.1, COL.cyan, 0.7);
        }
        ctx.globalAlpha = fade;
      }

      // scan line
      if (scan > 0 && scan < 1) {
        const g = ctx.createLinearGradient(scanX - 40, 0, scanX + 2, 0);
        g.addColorStop(0, rgba(COL.sky, 0)); g.addColorStop(1, rgba(COL.sky, 0.35));
        ctx.fillStyle = g; ctx.fillRect(scanX - 40, G.y - 4, 42, G.h + 8);
        ctx.fillStyle = rgba(COL.cyan, 0.95); ctx.fillRect(scanX - 1, G.y - 6, 2, G.h + 12);
      }

      // analysts reaching their newest security: a fine line from the team panel
      if (step === 1) {
        for (let a = 0; a < ANALYSTS; a++) {
          const k = Math.min(PER_ANALYST - 1, Math.floor(year * PER_ANALYST));
          const i = team[a][k];
          const q = pos[i];
          const from = analystPos(a);
          const fr = (year * PER_ANALYST) % 1;
          ctx.strokeStyle = rgba(ANALYST_COLORS[a], 0.35 * Math.sin(Math.PI * fr));
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(from.x, from.y);
          ctx.quadraticCurveTo((from.x + q.x) / 2, Math.min(from.y, q.y) - 20, q.x, q.y); ctx.stroke();
        }
      }

      /* ---------- sector names above their clusters (they give way to the history sheets in the memory step) */
      ctx.globalAlpha = fade * appear * (1 - mem) * (step === 1 ? 1 : 0.75);
      P.font(600, L.narrow ? 9 : 10);
      bands.forEach((bx, s) => {
        const name = fitName(P, lab.sectors[s], bx.w + 4);
        P.text(name, bx.x + bx.w / 2, bx.y + bx.h / 2, bx.w + 4, "center", ANALYST_COLORS[s]);
      });
      ctx.globalAlpha = fade;

      /* ---------- labels around the grid */
      const small = L.narrow ? 10 : 11;
      P.font(600, small);
      ctx.globalAlpha = fade * appear;
      // narrow: the title gets the whole row (the "each dot" key would truncate it)
      P.text(lab.universe.toUpperCase(), G.x, L.titleY, L.narrow ? L.area.w : G.w * 0.6, "left", COL.mute);
      if (!L.narrow) { P.font(500, small); P.text(lab.dot, G.x + G.w, L.titleY, G.w * 0.38, "right", COL.mute); }
      // filter legend, under the grid
      const ly = L.legendY;
      ctx.globalAlpha = fade * filter;
      ctx.strokeStyle = rgba(COL.mute, 0.5); ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.arc(G.x + 4, ly, 3.2, 0, Math.PI * 2); ctx.stroke();
      P.font(500, small);
      const w1 = P.text(lab.below, G.x + 12, ly, G.w * 0.3, "left", COL.mute);
      ctx.fillStyle = rgba(COL.blue, 0.75); ctx.beginPath(); ctx.arc(G.x + 26 + w1, ly, 3.2, 0, Math.PI * 2); ctx.fill();
      P.text(lab.liquid, G.x + 34 + w1, ly, G.w - (34 + w1), "left", COL.ink2);
      ctx.globalAlpha = fade;

      // over-the-counter note while the scan runs
      if (step === 2) {
        ctx.globalAlpha = fade * span(p, 0.1, 0.25) * (1 - span(p, 0.9, 1));
        pill(P, ctx, lab.otc, G.x + G.w / 2, G.y + G.h / 2, G.w * 0.9, COL.amber);
        ctx.globalAlpha = fade;
      }
      if (step === 3) {
        ctx.globalAlpha = fade * span(p, 0.25, 0.4);
        pill(P, ctx, lab.memory, G.x + G.w / 2, G.y + G.h / 2, G.w * 0.9, COL.blue);
        ctx.globalAlpha = fade;
      }

      drawTeam(ctx, P, lab, step, year, scan, fade);
      ctx.globalAlpha = 1;
      P.watermark(lab.watermark, W, H, L.pad);
    },
  };

  function pill(P: Pen, ctx: CanvasRenderingContext2D, s: string, x: number, y: number, maxW: number, color: string) {
    P.font(600, L.narrow ? 11 : 12.5);
    const w = Math.min(P.measure(s) + 28, maxW);
    P.round(x - w / 2, y - 15, w, 30, 15);
    ctx.fillStyle = "rgba(255,255,255,.94)"; ctx.fill();
    ctx.strokeStyle = rgba(color, 0.5); ctx.lineWidth = 1; ctx.stroke();
    P.text(s, x, y, w - 20, "center", color === COL.amber ? COL.orange : COL.blueD);
  }

  /** Position of analyst a's node in the team panel. */
  const analystPos = (a: number) => slotOf(L, a);

  /** The longest sector name that fits `maxW` (long, short, then abbreviation; fitted as a last resort). */
  function fitName(P: Pen, n: { long: string; short: string; abbr: string }, maxW: number): string {
    for (const s of [n.long, n.short]) if (P.measure(s) <= maxW) return s;
    return n.abbr;
  }

  function drawTeam(ctx: CanvasRenderingContext2D, P: Pen, lab: CoverageLabels, step: number, year: number, scan: number, fade: number) {
    const T = L.team;
    const small = L.narrow ? 10 : 11.5;
    const teamA = step === 1 ? 1 : 0.7;
    ctx.globalAlpha = fade * teamA;
    // portfolio manager
    const pm = L.narrow ? { x: T.x + 22, y: T.y + 40 } : { x: T.x + 20, y: T.y + 46 };
    P.font(600, L.narrow ? 10 : 11);
    P.text(lab.team.toUpperCase(), T.x, T.y + 8, T.w, "left", COL.mute);
    ctx.fillStyle = "#fff"; ctx.strokeStyle = COL.ink2; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(pm.x, pm.y, L.narrow ? 11 : 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = COL.ink2; ctx.beginPath(); ctx.arc(pm.x, pm.y - 2.5, 3.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(pm.x, pm.y + 7, 6, Math.PI, 0); ctx.fill();
    if (!L.narrow) {
      P.font(600, small); P.text(lab.pm, pm.x + 22, pm.y, T.w - 44, "left", COL.ink);
      P.font(500, L.narrow ? 9.5 : 10.5); P.text(lab.analyst, pm.x + 22, pm.y + 24, T.w - 44, "left", COL.mute);
    }
    for (let a = 0; a < ANALYSTS; a++) {
      const q = analystPos(a);
      ctx.strokeStyle = rgba(COL.mute, 0.35); ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(pm.x, pm.y + 13); ctx.quadraticCurveTo(L.narrow ? q.x : pm.x, q.y - 10, q.x, q.y - 7); ctx.stroke();
      ctx.setLineDash([]);
      const done = Math.min(PER_ANALYST, Math.floor(year * PER_ANALYST));
      P.glowDot(q.x, q.y, L.narrow ? 4.5 : 5, ANALYST_COLORS[a], step === 1 ? 0.8 : 0.3);
      if (!L.narrow) {
        P.font(500, small);
        const maxW = T.w - 14 - 20 - 30;
        P.text(fitName(P, lab.sectors[a], maxW), q.x + 14, q.y, maxW, "left", COL.ink2);
        P.font(600, small);
        P.text(`${done}`, T.x + T.w - 4, q.y, 30, "right", ANALYST_COLORS[a]);
      } else {
        // narrow: the sector's short name under each node
        P.font(600, 9);
        const slot = analystSlot(L) - 2;
        P.text(lab.sectors[a].abbr, q.x, q.y + 17, slot, "center", ANALYST_COLORS[a]);
      }
    }
    if (!L.narrow) {
      const y0 = analystPos(ANALYSTS - 1).y + 26;
      P.font(500, L.narrow ? 9.5 : 10.5);
      P.text(lab.perYear, T.x, y0, T.w, "left", COL.mute);
      // year progress
      P.round(T.x, y0 + 12, T.w, 4, 2); ctx.fillStyle = rgba(COL.mute, 0.14); ctx.fill();
      P.round(T.x, y0 + 12, T.w * year, 4, 2); ctx.fillStyle = COL.blue; ctx.fill();
      // covered counter
      const covered = Math.round(Math.min(1, year) * ANALYSTS * PER_ANALYST);
      ctx.globalAlpha = fade * Math.max(teamA, 0.8);
      P.font(600, 30);
      const g = ctx.createLinearGradient(T.x, 0, T.x + 120, 0);
      g.addColorStop(0, COL.blueD); g.addColorStop(1, COL.cyan);
      ctx.fillStyle = g; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(String(covered), T.x, y0 + 44);
      const cw = P.measure(String(covered));
      P.font(500, small);
      P.text(lab.of, T.x + cw + 8, y0 + 48, T.w - cw - 8, "left", COL.mute);
      P.text(lab.covered, T.x, y0 + 70, T.w, "left", COL.ink2);
      // our systems: a progress of the scan, then the memory
      const sy = y0 + 104;
      ctx.globalAlpha = fade * (step >= 2 ? 1 : 0.7);
      P.font(600, 11);
      P.text(lab.systems.toUpperCase(), T.x, sy, T.w, "left", COL.mute);
      P.round(T.x, sy + 14, T.w, 6, 3); ctx.fillStyle = rgba(COL.mute, 0.14); ctx.fill();
      const sg = ctx.createLinearGradient(T.x, 0, T.x + T.w, 0);
      sg.addColorStop(0, COL.blueD); sg.addColorStop(1, COL.sky);
      P.round(T.x, sy + 14, T.w * scan, 6, 3); ctx.fillStyle = sg; ctx.fill();
      P.font(500, small);
      const two = P.measure(lab.scanned) > T.w ? splitLabel(lab.scanned) : null;
      if (two) { P.text(two[0], T.x, sy + 34, T.w, "left", COL.blueD); P.text(two[1], T.x, sy + 50, T.w, "left", COL.blueD); }
      else P.text(lab.scanned, T.x, sy + 34, T.w, "left", COL.blueD);
    } else {
      // narrow: one line under the team row with the live counter
      const covered = Math.round(Math.min(1, year) * ANALYSTS * PER_ANALYST);
      ctx.globalAlpha = fade * (step >= 1 ? 1 : 0.7);
      P.font(600, 11);
      const s = step >= 2 ? lab.scanned : `${lab.covered} · ${covered} ${lab.of}`;
      P.text(s, T.x, T.y + 80, T.w, "left", step >= 2 ? COL.blueD : COL.ink2);
    }
    ctx.globalAlpha = fade;
  }

  return runScene(canvas, scene, opts);
}
