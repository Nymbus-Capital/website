/**
 * coverage-engine.ts — canvas scene of "ultra-micro analysis, at scale" (/core-concepts): one large shared graphic of
 * about 2,000 dots (the Canadian investment-grade index, six named sector clusters), told as a comparison of two methods.
 * Step 1: the universe appears and the issues under the $200 MM filter fade to outlines. Step 2 (act 1, conventional
 * fundamental team): a portfolio manager and six sector analysts light ~30 securities each in their sector's cluster and
 * colour over a year, 180 in all. Step 3 (act 2, our systems): a scan sweeps the grid and lights every liquid bond, then
 * layers of history stack up behind it. Step 4 (compare): the systems' full coverage with the team's 180 still outlined.
 * The methods column (a strip on top on narrow screens) stacks both methods with a VS badge between them: the method on
 * the graphic is highlighted, the other faded. Dots are drawn in batched paths; history layers are pre-rendered.
 */
import { COL, makePen, rgba, splitLabel, type Pen } from "./draw-kit.ts";
import {
  ANALYSTS, CARD_ROWS, COVERAGE_STEP_MS, LAYERS, PER_ANALYST, UNIVERSE, analystPos, analystSlot, cellOf, coverageLayout, focusTracker, pmPos,
  sectorFont, sectorLabelBoxes, teamCoverage, universe, type Bond, type Rect,
} from "./coverage-model.ts";
import { runScene, type Runner, type RunnerOptions } from "./runner.ts";
import { ease, easeOut, span, stepAt, stepStarts } from "./timeline.ts";

interface CoverageLabels {
  pm: string; perYear: string; covered: string; of: string; universe: string; liquid: string; below: string;
  scan: string; scanned: string; memory: string; otc: string; dot: string; team: string; teamShort: string; systems: string; vs: string;
  teamLegend: string; systemsLegend: string; watermark: string;
  /** sector names in three lengths (analyst a covers sector a), longest first */
  sectors: { long: string; short: string; abbr: string }[];
}

const STARTS = stepStarts(COVERAGE_STEP_MS);
/** One colour per sector (and its analyst): financials, technology & communications, consumer, utilities & infrastructure, energy, industrials. */
const ANALYST_COLORS = ["#1a73e8", "#00a3e0", "#6d5bd0", "#0f9d8a", "#e37400", "#c5221f"];

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
  const focus = focusTracker();

  function prerender() {
    pos = bonds.map((b) => cellOf(b.i, L));
    bands = sectorLabelBoxes(L);
    // one history layer: the lit grid, pre-rendered once per size
    if (typeof document === "undefined") return;
    const G = L.grid;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const c = layer ?? document.createElement("canvas");
    c.width = Math.max(1, Math.round((G.w + 4) * dpr)); c.height = Math.max(1, Math.round((G.h + 4) * dpr));
    const x = c.getContext("2d");
    if (x) {
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.clearRect(0, 0, G.w + 4, G.h + 4);
      x.fillStyle = rgba(COL.blue, 0.9);
      x.beginPath();
      const r = Math.max(0.8, L.cell * 0.26);
      for (const b of bonds) {
        if (!b.liquid) continue;
        const p = pos[b.i];
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
      // act 1's colours give way at the start of act 2; the team's 180 come back as outlines in the compare step
      const teamLit = step === 1 ? 1 : step === 2 ? 1 - ease(span(p, 0, 0.08)) : 0;
      const rings = step === 3 ? ease(span(p, 0.04, 0.22)) : 0;
      const scan = step > 2 ? 1 : step < 2 ? 0 : span(p, 0.08, 0.5);
      const mem = step > 2 ? 1 : step < 2 ? 0 : ease(span(p, 0.55, 0.8));
      const fade = step === 3 ? 1 - span(p, 0.96, 1) : 1;
      const [fT, fS] = focus(step, p);
      const G = L.grid;
      const r = Math.max(0.8, L.cell * 0.26);
      const scanX = G.x + G.w * scan;

      /* ---------- history sheets behind the grid (act 2 memory, kept in the compare step) */
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
        if (appear < 1 && Math.hypot(q.x - cx0, q.y - cy0) / maxD > appear * 1.05) continue;
        if (!b.liquid && filter > 0.5) { add("out", q.x, q.y, r); continue; }
        const own = owner.get(b.i);
        const lit = own && teamLit > 0 && year * PER_ANALYST > own.k;
        if (lit) add(`a${own.a}`, q.x, q.y, r * 1.25);
        if (lit && teamLit >= 1) continue;
        if (b.liquid && scan > 0 && q.x <= scanX) {
          const near = Math.max(0, 1 - (scanX - q.x) / (G.w * 0.12));
          add(near > 0.5 && scan < 1 ? "front" : "scan", q.x, q.y, r * (1 + 0.35 * near));
        } else add("base", q.x, q.y, r);
        if (own && rings > 0) add(`r${own.a}`, q.x, q.y, r * 2.1);
      }
      ctx.globalAlpha = fade;
      const fill = (key: string, style: string) => { const pth = paths[key]; if (pth) { ctx.fillStyle = style; ctx.fill(pth); } };
      if (paths.out) { ctx.strokeStyle = rgba(COL.mute, 0.28); ctx.lineWidth = 0.8; ctx.stroke(paths.out); }
      fill("base", rgba(COL.mute, step >= 1 ? 0.2 : 0.3));
      fill("scan", rgba(COL.blue, step === 3 ? 0.85 : 0.72));
      fill("front", COL.sky);
      ctx.globalAlpha = fade * teamLit;
      for (let a = 0; a < ANALYSTS; a++) fill(`a${a}`, ANALYST_COLORS[a]);
      // compare: the team's 180 outlined in their sector colours over the systems' coverage
      if (rings > 0) {
        ctx.globalAlpha = fade * rings;
        ctx.lineWidth = L.narrow ? 1.1 : 1.4;
        for (let a = 0; a < ANALYSTS; a++) { const pth = paths[`r${a}`]; if (pth) { ctx.strokeStyle = ANALYST_COLORS[a]; ctx.stroke(pth); } }
      }

      // act 2: daily re-scoring twinkle once the history is in memory
      if (mem > 0) {
        for (let k = 0; k < 26; k++) {
          const i = Math.floor((((t / 260) | 0) * 97 + k * 389) % UNIVERSE);
          if (!bonds[i].liquid) continue;
          const q = pos[i];
          ctx.globalAlpha = fade * mem * (step === 3 ? 0.5 : 0.8);
          P.glowDot(q.x, q.y, r * 1.1, COL.cyan, 0.7);
        }
      }

      // act 2: scan line
      if (scan > 0 && scan < 1) {
        ctx.globalAlpha = fade;
        const g = ctx.createLinearGradient(scanX - 40, 0, scanX + 2, 0);
        g.addColorStop(0, rgba(COL.sky, 0)); g.addColorStop(1, rgba(COL.sky, 0.35));
        ctx.fillStyle = g; ctx.fillRect(Math.max(G.x, scanX - 40), G.y - 4, Math.min(42, scanX - G.x + 2), G.h + 8);
        ctx.fillStyle = rgba(COL.cyan, 0.95); ctx.fillRect(scanX - 1, G.y - 6, 2, G.h + 12);
      }

      // act 1: analysts reaching their newest security, a fine line from their node in the team card
      if (step === 1) {
        ctx.globalAlpha = fade;
        for (let a = 0; a < ANALYSTS; a++) {
          const k = Math.min(PER_ANALYST - 1, Math.floor(year * PER_ANALYST));
          const q = pos[team[a][k]];
          const from = analystPos(L, a);
          const fr = (year * PER_ANALYST) % 1;
          ctx.strokeStyle = rgba(ANALYST_COLORS[a], 0.35 * Math.sin(Math.PI * fr));
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(from.x, from.y);
          if (L.narrow) ctx.quadraticCurveTo(from.x, (from.y + q.y) / 2, q.x, q.y);
          else ctx.quadraticCurveTo((from.x + q.x) / 2, Math.min(from.y, q.y) - 20, q.x, q.y);
          ctx.stroke();
        }
      }

      /* ---------- sector names above their clusters (they give way to the history sheets) */
      // kept over the history sheets (on a white backing) in acts 2 and compare: the key to the team's coloured rings
      ctx.globalAlpha = fade * appear * (step === 1 || step === 3 ? 1 : 0.75);
      if (ctx.globalAlpha > 0.01) {
        P.font(600, sectorFont(L));
        const a0 = ctx.globalAlpha;
        bands.forEach((bx, s) => {
          const name = L.narrow ? lab.sectors[s].abbr : fitName(P, { ...lab.sectors[s], long: lab.sectors[s].short }, bx.w + 4);
          if (mem > 0) {
            const w = Math.min(P.measure(name), bx.w + 4) + 8;
            ctx.globalAlpha = a0 * mem;
            P.round(bx.x + bx.w / 2 - w / 2, bx.y, w, bx.h, bx.h / 2);
            ctx.fillStyle = "rgba(255,255,255,.96)"; ctx.fill();
            ctx.globalAlpha = a0;
          }
          P.text(name, bx.x + bx.w / 2, bx.y + bx.h / 2, bx.w + 4, "center", ANALYST_COLORS[s]);
        });
      }

      /* ---------- labels around the grid */
      const small = L.narrow ? 10 : 11;
      ctx.globalAlpha = fade * appear;
      P.font(600, small);
      const tw = P.text(lab.universe.toUpperCase(), G.x, L.titleY, L.narrow ? L.area.w : G.w * 0.6, "left", COL.mute);
      // wide: the right of the title row names what the graphic shows — each dot, then the method on it
      if (!L.narrow) {
        const room = G.w + L.depthX - tw - 16;
        const what = step === 0 ? lab.dot : step === 1 ? lab.teamShort : step === 2 ? lab.systems : `${lab.teamShort} ${lab.vs} ${lab.systems.toLowerCase()}`;
        showing(ctx, P, what, G.x + G.w + L.depthX, L.titleY, room, step);
      }
      legend(ctx, P, lab, step, p, filter, fade);

      // act 2: over-the-counter note while the scan runs, then the memory
      if (step === 2) {
        ctx.globalAlpha = fade * span(p, 0.1, 0.18) * (1 - span(p, 0.46, 0.54));
        pill(P, ctx, lab.otc, G.x + G.w / 2, G.y + G.h / 2, G.w * 0.92, COL.amber);
        ctx.globalAlpha = fade * span(p, 0.62, 0.7);
        pill(P, ctx, lab.memory, G.x + G.w / 2, G.y + G.h / 2, G.w * 0.92, COL.blue);
      }

      /* ---------- the methods column: team · VS · systems */
      card(ctx, L.team, fT, fade, step === 1 || step === 3);
      card(ctx, L.systems, fS, fade, step === 2 || step === 3);
      drawTeam(ctx, P, lab, step, year, fT * fade);
      drawSystems(ctx, P, lab, step, p, scan, mem, fS * fade);
      drawVs(ctx, P, lab, step, p, t, fade);
      ctx.globalAlpha = 1;
      P.watermark(lab.watermark, W, H, L.pad);
    },
  };

  /** A method card: a soft card; the active one gets an accent border, a glow and a gradient bar on its leading edge. */
  function card(ctx: CanvasRenderingContext2D, R: Rect, alpha: number, fade: number, active: boolean) {
    const on = active ? Math.max(0, (alpha - 0.6) / 0.4) : 0;
    ctx.globalAlpha = fade * alpha;
    // glow: three widening translucent rings
    if (on > 0) {
      for (let k = 3; k >= 1; k--) {
        P().round(R.x - 2 * k, R.y - 2 * k, R.w + 4 * k, R.h + 4 * k, 14 + 2 * k);
        ctx.strokeStyle = rgba(COL.cyan, 0.07 * on * (4 - k)); ctx.lineWidth = 2; ctx.stroke();
      }
    }
    P().round(R.x, R.y, R.w, R.h, 14);
    const g = ctx.createLinearGradient(R.x, R.y, R.x + R.w, R.y + R.h);
    g.addColorStop(0, "rgba(255,255,255,.97)"); g.addColorStop(1, rgba(COL.blue, 0.03 + 0.04 * on));
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = rgba(COL.blue, 0.16 + 0.34 * on); ctx.lineWidth = 1 + 0.6 * on; ctx.stroke();
    if (on > 0) {
      ctx.globalAlpha = fade * alpha * on;
      const bar = L.narrow ? ctx.createLinearGradient(R.x, 0, R.x + R.w, 0) : ctx.createLinearGradient(0, R.y, 0, R.y + R.h);
      bar.addColorStop(0, COL.blueD); bar.addColorStop(1, COL.cyan);
      ctx.fillStyle = bar;
      if (L.narrow) P().round(R.x + 12, R.y, R.w - 24, 3, 1.5); else P().round(R.x, R.y + 14, 3, R.h - 28, 1.5);
      ctx.fill();
    }
  }
  const P = (): Pen => pen!;

  /** Wide title row, right side: what the graphic shows (a quiet key in step 1, an accent label for each method). */
  function showing(ctx: CanvasRenderingContext2D, Pn: Pen, s: string, right: number, y: number, room: number, step: number) {
    if (step === 0) { Pn.font(500, 11); Pn.text(s, right, y, room, "right", COL.mute); return; }
    Pn.font(600, 11);
    const w = Math.min(Pn.measure(s) + 22, room);
    if (w < 60) return;
    Pn.round(right - w, y - 10, w, 20, 10);
    ctx.fillStyle = rgba(COL.blue, 0.08); ctx.fill();
    ctx.strokeStyle = rgba(COL.blue, 0.3); ctx.lineWidth = 1; ctx.stroke();
    Pn.text(s, right - w / 2, y + 0.5, w - 14, "center", COL.blueD);
  }

  /** Under the grid: the filter key (outlines under the filter, dots reviewed); in the compare step, the two methods' key. */
  function legend(ctx: CanvasRenderingContext2D, Pn: Pen, lab: CoverageLabels, step: number, p: number, filter: number, fade: number) {
    const G = L.grid, maxW = G.w + L.depthX;
    const cmp = step === 3 ? ease(span(p, 0.04, 0.22)) : 0;
    const small = L.narrow ? 10 : 11;
    Pn.font(500, small);
    const row = (items: { mark: (x: number, y: number) => void; s: string; color: string }[], alpha: number) => {
      if (alpha <= 0.01) return;
      ctx.globalAlpha = fade * alpha;
      const widths = items.map((it) => Math.min(Pn.measure(it.s), maxW - 12));
      const oneLine = widths.reduce((a, w) => a + w + 12, 0) + 14 * (items.length - 1) <= maxW;
      let x = G.x, y = L.legendY;
      items.forEach((it, k) => {
        if (k > 0) { if (oneLine) x += 14; else { x = G.x; y += 14; } }
        it.mark(x + 4, y);
        x += 12 + Pn.text(it.s, x + 12, y, maxW - (x - G.x) - 12, "left", it.color);
      });
    };
    const outline = (x: number, y: number) => { ctx.strokeStyle = rgba(COL.mute, 0.55); ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.stroke(); };
    const dot = (x: number, y: number) => { ctx.fillStyle = rgba(COL.blue, 0.8); ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill(); };
    const ring = (x: number, y: number) => { ctx.strokeStyle = ANALYST_COLORS[0]; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(x, y, 3.6, 0, Math.PI * 2); ctx.stroke(); };
    row([{ mark: outline, s: lab.below, color: COL.mute }, { mark: dot, s: lab.liquid, color: COL.ink2 }], filter * (1 - cmp));
    row([{ mark: ring, s: lab.teamLegend, color: COL.ink2 }, { mark: dot, s: lab.systemsLegend, color: COL.blueD }], cmp);
  }

  function pill(Pn: Pen, ctx: CanvasRenderingContext2D, s: string, x: number, y: number, maxW: number, color: string) {
    Pn.font(600, L.narrow ? 10.5 : 12.5);
    const w = Math.min(Pn.measure(s) + 26, maxW);
    Pn.round(x - w / 2, y - 15, w, 30, 15);
    ctx.fillStyle = "rgba(255,255,255,.95)"; ctx.fill();
    ctx.strokeStyle = rgba(color, 0.5); ctx.lineWidth = 1; ctx.stroke();
    Pn.text(s, x, y, w - 16, "center", color === COL.amber ? COL.orange : COL.blueD);
  }

  /** The longest sector name that fits `maxW` (long, short, then abbreviation). */
  function fitName(Pn: Pen, n: { long: string; short: string; abbr: string }, maxW: number): string {
    for (const s of [n.long, n.short]) if (Pn.measure(s) <= maxW) return s;
    return n.abbr;
  }

  /**
   * A label wrapped on at most `maxLines` lines at the largest size ≤ `size` (≥ `min`, 0.5 px steps) where every line
   * fits `maxW`: one line when it fits, else greedy word wrap. Sets the font; returns the lines.
   */
  function wrap(Pn: Pen, s: string, maxW: number, weight: 500 | 600, size: number, min = 9, maxLines = 2): string[] {
    const words = s.split(" ");
    let out: string[] = [s];
    for (let z = size; z >= min - 1e-9; z -= 0.5) {
      Pn.font(weight, z);
      out = [];
      for (const w of words) {
        const cur = out.length ? `${out[out.length - 1]} ${w}` : w;
        if (out.length && Pn.measure(cur) <= maxW) out[out.length - 1] = cur; else out.push(w);
      }
      if (out.length <= maxLines && out.every((ln) => Pn.measure(ln) <= maxW)) return out;
    }
    // last resort (never at the tested widths): the minimum size, extra words kept on the last line (fitted by the pen)
    return out.length > maxLines ? [...out.slice(0, maxLines - 1), out.slice(maxLines - 1).join(" ")] : out;
  }

  /** A method title at y1 (and y2 when it needs two lines; wide, long titles always take two for air between the words). */
  function title(Pn: Pen, s: string, x: number, y1: number, y2: number, maxW: number, color: string, size: number) {
    const lines = wrap(Pn, s, L.narrow ? maxW : maxW * 0.78, 600, size, L.narrow ? 8.5 : 9);
    lines.forEach((ln, k) => Pn.text(ln, x, k ? y2 : y1, maxW, "left", color));
  }

  /** A gradient figure (counter or claim) at x, y; returns its width. */
  function figure(ctx: CanvasRenderingContext2D, Pn: Pen, s: string, x: number, y: number, size: number, maxW: number): number {
    if (size > 0) Pn.font(600, size);
    const g = ctx.createLinearGradient(x, 0, x + Math.min(maxW, Pn.measure(s)), 0);
    g.addColorStop(0, COL.blueD); g.addColorStop(1, COL.cyan);
    ctx.fillStyle = g;
    return Pn.text(s, x, y, maxW, "left");
  }

  /** Method 1 card: the conventional fundamental team — portfolio manager, six sector analysts, a year of coverage, the count. */
  function drawTeam(ctx: CanvasRenderingContext2D, Pn: Pen, lab: CoverageLabels, step: number, year: number, alpha: number) {
    const T = L.team;
    const ip = L.narrow ? 8 : 14;
    const x = T.x + ip, w = T.w - 2 * ip;
    const covered = Math.round(Math.min(1, year) * ANALYSTS * PER_ANALYST);
    ctx.globalAlpha = alpha;
    const pm = pmPos(L);
    const person = (pr: number) => {
      ctx.fillStyle = "#fff"; ctx.strokeStyle = COL.ink2; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(pm.x, pm.y, pr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = COL.ink2; ctx.beginPath(); ctx.arc(pm.x, pm.y - pr * 0.22, pr * 0.28, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(pm.x, pm.y + pr * 0.55, pr * 0.46, Math.PI, 0); ctx.fill();
    };
    if (L.narrow) {
      const R = CARD_ROWS.narrow.team;
      title(Pn, lab.team, x, T.y + R.title, T.y + R.title2, w, COL.ink, 10.5);
      person(6.5);
      for (let a = 0; a < ANALYSTS; a++) { const q = analystPos(L, a); Pn.glowDot(q.x, q.y, 3.2, ANALYST_COLORS[a], step === 1 ? 0.8 : 0.35); }
      const nw = figure(ctx, Pn, String(covered), x, T.y + R.result, 20, w * 0.45);
      Pn.fit(lab.of, w - nw - 6, 500, 9.5, 8);
      Pn.text(lab.of, x + nw + 6, T.y + R.result + 2, w - nw - 6, "left", COL.mute);
      Pn.fit(lab.covered, w, 600, 9.5, 8);
      Pn.text(lab.covered, x, T.y + R.result2, w, "left", COL.ink2);
      return;
    }
    const R = CARD_ROWS.wide.team;
    title(Pn, lab.team.toUpperCase(), x, T.y + R.title, T.y + R.title2, w, COL.ink, 11);
    person(9);
    Pn.font(600, 11);
    Pn.text(lab.pm, pm.x + 16, pm.y, T.x + T.w - ip - (pm.x + 16), "left", COL.ink2);
    const slot = analystSlot(L);
    for (let a = 0; a < ANALYSTS; a++) {
      const q = analystPos(L, a);
      Pn.glowDot(q.x, q.y, 4, ANALYST_COLORS[a], step === 1 ? 0.8 : 0.35);
      Pn.font(500, 10.5);
      Pn.text(fitName(Pn, lab.sectors[a], slot - 16), q.x + 9, q.y, slot - 14, "left", COL.ink2);
    }
    // a year of work: ≈30 securities each
    Pn.font(500, 10.5);
    Pn.text(lab.perYear, x, T.y + R.perYear, w, "left", COL.mute);
    Pn.round(x, T.y + R.bar, w, 4, 2); ctx.fillStyle = rgba(COL.mute, 0.14); ctx.fill();
    Pn.round(x, T.y + R.bar, w * year, 4, 2); ctx.fillStyle = COL.blue; ctx.fill();
    // the count: 180 of ≈2,000, covered in depth
    const nw = figure(ctx, Pn, String(covered), x, T.y + R.result, 26, w * 0.4);
    Pn.font(500, 10.5);
    Pn.text(lab.of, x + nw + 9, T.y + R.result - 8, w - nw - 9, "left", COL.mute);
    Pn.font(600, 10.5);
    Pn.text(lab.covered, x + nw + 9, T.y + R.result + 8, w - nw - 9, "left", COL.ink2);
  }

  /** Method 2 card: our systems — the systematic scan, every liquid bond every day, every day of history remembered. */
  function drawSystems(ctx: CanvasRenderingContext2D, Pn: Pen, lab: CoverageLabels, step: number, p: number, scan: number, mem: number, alpha: number) {
    const S = L.systems;
    const ip = L.narrow ? 8 : 14;
    const x = S.x + ip, w = S.w - 2 * ip;
    ctx.globalAlpha = alpha;
    const rings = (cx: number, cy: number, k0: number) => {
      for (let k = 0; k < 3; k++) {
        ctx.strokeStyle = rgba(COL.blue, 0.85 - k * 0.25); ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.arc(cx, cy, k0 + k * k0, 0, Math.PI * 2); ctx.stroke();
      }
    };
    const bar = (bx: number, by: number, bw: number, bh: number) => {
      Pn.round(bx, by, bw, bh, bh / 2); ctx.fillStyle = rgba(COL.mute, 0.14); ctx.fill();
      const sg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      sg.addColorStop(0, COL.blueD); sg.addColorStop(1, COL.sky);
      Pn.round(bx, by, bw * scan, bh, bh / 2); ctx.fillStyle = sg; ctx.fill();
    };
    if (L.narrow) {
      const R = CARD_ROWS.narrow.systems;
      title(Pn, lab.systems, x, S.y + R.title, S.y + R.title2, w, COL.ink, 10.5);
      rings(x + 7, S.y + R.crew, 2.4);
      bar(x + 22, S.y + R.crew - 2.5, w - 22, 5);
      ctx.globalAlpha = alpha * Math.max(0.45, Math.min(1, scan * 1.5));
      const sc = wrap(Pn, lab.scanned, w, 600, 11, 9, 3);
      const ys = sc.length > 2 ? [R.result3a, R.result3b, R.result3c] : [R.result, R.result2];
      sc.forEach((ln, k) => figure(ctx, Pn, ln, x, S.y + ys[k], 0, w));
      return;
    }
    const R = CARD_ROWS.wide.systems;
    title(Pn, lab.systems.toUpperCase(), x, S.y + R.title, S.y + R.title2, w, COL.ink, 11);
    rings(x + 8, S.y + R.scan, 3);
    Pn.font(600, 11);
    Pn.text(lab.scan, x + 26, S.y + R.scan, w - 26, "left", COL.blueD);
    bar(x, S.y + R.bar - 3, w, 6);
    // every liquid bond, every day (bright once the scan has run); every day of history, remembered (after the memory)
    ctx.globalAlpha = alpha * Math.max(0.45, Math.min(1, scan * 1.5));
    const sc = wrap(Pn, lab.scanned, w, 600, 15, 10.5);
    sc.forEach((ln, k) => figure(ctx, Pn, ln, x, S.y + (k ? R.scanned2 : R.scanned), 0, w));
    // in act 2 the line gives way when the pill on the graphic says it; full again in the compare step
    ctx.globalAlpha = alpha * (step === 2 ? 0.45 * (1 - span(p, 0.56, 0.62)) : step === 3 ? Math.max(0.45, mem) : 0.45);
    const my = sc.length > 1 ? S.y + R.memory : S.y + R.scanned2 + 4;
    wrap(Pn, lab.memory, w, 500, 10.5).forEach((ln, k) => Pn.text(ln, x, my + 15 * k, w, "left", step >= 2 ? COL.ink2 : COL.mute));
  }

  /** The VS badge between the two methods, with a divider; it pulses in the compare step. */
  function drawVs(ctx: CanvasRenderingContext2D, Pn: Pen, lab: CoverageLabels, step: number, p: number, t: number, fade: number) {
    const V = L.vs;
    ctx.globalAlpha = fade * 0.8;
    if (L.narrow) {
      // a short vertical divider through the gutter, interrupted by the badge
      const y0 = L.team.y + 6, y1 = L.team.y + L.team.h - 6;
      const g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, rgba(COL.blue, 0)); g.addColorStop(0.5, rgba(COL.blue, 0.35)); g.addColorStop(1, rgba(COL.blue, 0));
      ctx.fillStyle = g;
      ctx.fillRect(V.x - 0.5, y0, 1, V.y - V.r - 6 - y0); ctx.fillRect(V.x - 0.5, V.y + V.r + 6, 1, y1 - (V.y + V.r + 6));
    } else {
      const x0 = L.column.x + 10, x1 = L.column.x + L.column.w - 10;
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, rgba(COL.blue, 0)); g.addColorStop(0.5, rgba(COL.blue, 0.35)); g.addColorStop(1, rgba(COL.blue, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x0, V.y - 0.5, V.x - V.r - 8 - x0, 1); ctx.fillRect(V.x + V.r + 8, V.y - 0.5, x1 - (V.x + V.r + 8), 1);
    }
    const breath = 0.5 + 0.5 * Math.sin(t / 700);
    const ring = step === 3 ? (t / 1400) % 1 : 0;
    ctx.globalAlpha = fade;
    ctx.fillStyle = rgba(COL.cyan, 0.1 + 0.08 * breath + (step === 3 ? 0.06 : 0));
    ctx.beginPath(); ctx.arc(V.x, V.y, V.r + 3 + 2 * breath, 0, Math.PI * 2); ctx.fill();
    if (step === 3) {
      ctx.strokeStyle = rgba(COL.cyan, 0.5 * (1 - ring) * Math.min(1, p * 8)); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(V.x, V.y, V.r + 3 + 12 * ring, 0, Math.PI * 2); ctx.stroke();
    }
    const bg = ctx.createLinearGradient(V.x - V.r, V.y - V.r, V.x + V.r, V.y + V.r);
    bg.addColorStop(0, COL.blueD); bg.addColorStop(1, COL.cyan);
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(V.x, V.y, V.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 2; ctx.stroke();
    Pn.font(600, L.narrow ? 11.5 : 13.5);
    Pn.text(lab.vs, V.x, V.y + 0.5, V.r * 2 - 6, "center", "#fff");
  }

  return runScene(canvas, scene, opts);
}
