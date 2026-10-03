/**
 * overlay-engine.ts — canvas renderer of the home "diversifying engines" illustration. Time flows right to left
 * into a glowing "now" line: a generated bond reference dips through stress episodes (down months shaded), five
 * generic engine lanes move on their own, an engine that moves up in a down month lights up and leaves a mark,
 * particles stream from every engine into the combined path, and a down-month correlation heatmap (concept) eases
 * towards the values of the generated window. Framework-free; lazily imported.
 *
 *  - ~30 fps cap (20 when frames run slow, `maxFps` lower on coarse pointers), DPR capped at 1.5; gradients are
 *    created on resize only; month values and smoothed paths are memoised.
 *  - Every label is measured and fitted to its width; the font is awaited (document.fonts) and the canvas redrawn.
 *  - "ILLUSTRATION · generated values" is drawn on the canvas itself; the counters restart every COUNTER_CYCLE months.
 *  - Runs only while the canvas is on screen and the tab is visible; one still frame under reduced motion.
 *  - `data-frames` / `data-running` on the host let tests observe it.
 */
import { fitText, groupDigits, type Lang } from "./scan-model.ts";
import {
  BOND, COUNTER_CYCLE, DEPTH, ENGINES, PHI, combinedMove, countersBetween, downsideCorrelation, heatColor, lit, monthCache,
  monthWidth, overlayLayout, type Month,
} from "./overlay-model.ts";

export interface OverlayLabels {
  bond: string; combined: string; down: string; lit: string; heat: string; opposite: string; low: string; together: string;
  engines: string[]; bondShort: string;
}

export interface OverlayOptions {
  still?: boolean;
  lang: () => Lang;
  labels: () => OverlayLabels;
  /** elements that receive the live counters (textContent) */
  counters?: { months?: HTMLElement | null; down?: HTMLElement | null; lit?: HTMLElement | null };
  onReady?: () => void;
  /** frame-rate ceiling (default 30; 15 on coarse pointers) */
  maxFps?: number;
  /** text drawn on the canvas itself ("ILLUSTRATION · generated values") */
  watermark?: () => string;
  seed?: number;
}

export interface Overlay { destroy(): void; redraw(): void }

const SANS = `"Poppins", ui-sans-serif, system-ui, sans-serif`;
const INK2 = "#444746", MUTE = "#5f6368", BLUE = "#1a73e8", CYAN = "#00a3e0", ORANGE = "#c2410c";
/** first month shown: enough history behind it for the paths and the correlation window */
const START = 240;
/** ms per generated month */
const MONTH_MS = 640;
const NE = ENGINES.length;

const rgba = (hex: string, a: number) => {
  const v = parseInt(hex.slice(1), 16);
  return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${a})`;
};

export function createOverlay(canvas: HTMLCanvasElement, opts: OverlayOptions): Overlay {
  const ctx = canvas.getContext("2d", { alpha: true });
  const host = canvas.parentElement ?? canvas;
  if (!ctx) return { destroy() {}, redraw() {} };
  const get = monthCache(opts.seed ?? 0, 1024);
  const fills = ENGINES.map((e) => rgba(e.color, 0.09));
  const halos = ENGINES.map((e) => [rgba(e.color, 0.1), rgba(e.color, 0.2), rgba(e.color, 0.35)]);

  let W = 0, H = 0, dpr = 1;
  let L = overlayLayout(1, 1);
  let mw = 12;
  let raf = 0, running = false, onscreen = false, visible = document.visibilityState === "visible";
  let clock = 0, last = 0, frames = 0, slow = 0, minGap = 1000 / Math.max(5, Math.min(60, opts.maxFps ?? 30));
  let dead = false;
  let widths = new Map<string, number>();
  let combG: CanvasGradient | null = null, areaG: CanvasGradient | null = null, cursorG: CanvasGradient | null = null, fadeL: CanvasGradient | null = null;
  // eased scales and heatmap
  let bandMid = NaN;
  let bandScale = 0, laneScale = new Array<number>(NE).fill(0);
  let heat: number[][] | null = null, heatTarget: number[][] | null = null, heatFor = -1;
  let countFor = -1;
  const counts = { months: 0, down: 0, litMoves: 0 };
  let lastCounterWrite = 0;

  // smoothed paths, memoised per month: [bond, engines…, combined]
  let lv = new Map<number, number[]>();
  function levels(n: number): number[] {
    let v = lv.get(n);
    if (v) return v;
    if (lv.size > 900) lv = new Map();
    v = new Array<number>(NE + 2).fill(0);
    let w = 1;
    for (let k = 0; k < DEPTH; k++) {
      const m = get(n - k);
      v[0] += w * m.bond;
      for (let i = 0; i < NE; i++) v[i + 1] += w * m.engines[i];
      v[NE + 1] += w * combinedMove(m);
      w *= PHI;
    }
    lv.set(n, v);
    return v;
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    L = overlayLayout(W, H);
    mw = monthWidth(L.x1 - L.x0);
    widths = new Map();
    combG = ctx!.createLinearGradient(L.x0, 0, L.x1, 0);
    combG.addColorStop(0, "#0b57d0"); combG.addColorStop(0.6, BLUE); combG.addColorStop(1, CYAN);
    areaG = ctx!.createLinearGradient(0, L.band.y, 0, L.band.y + L.band.h);
    areaG.addColorStop(0, "rgba(26,115,232,.16)"); areaG.addColorStop(1, "rgba(0,163,224,0)");
    cursorG = ctx!.createLinearGradient(0, L.band.y, 0, L.lanes.y + L.lanes.h);
    cursorG.addColorStop(0, "rgba(0,163,224,.15)"); cursorG.addColorStop(0.25, "rgba(26,115,232,.95)");
    cursorG.addColorStop(0.8, "rgba(0,163,224,1)"); cursorG.addColorStop(1, "rgba(0,163,224,.1)");
    // left edge fade: months scroll out softly under the lane labels
    fadeL = ctx!.createLinearGradient(L.x0, 0, L.x0 + 36, 0);
    fadeL.addColorStop(0, "rgba(250,252,255,1)"); fadeL.addColorStop(1, "rgba(250,252,255,0)");
  }

  function measure(s: string): number {
    const k = `${ctx!.font}|${s}`;
    let v = widths.get(k);
    if (v === undefined) {
      if (widths.size > 800) widths = new Map();
      v = ctx!.measureText(s).width;
      widths.set(k, v);
    }
    return v;
  }
  const text = (s: string, x: number, y: number, maxW: number) => ctx!.fillText(fitText(s, maxW, measure), x, y);

  function round(x: number, y: number, w: number, h: number, r: number) {
    ctx!.beginPath();
    if (typeof ctx!.roundRect === "function") ctx!.roundRect(x, y, w, h, r); else ctx!.rect(x, y, w, h);
  }

  /** x of the end of month m when the clock reads t (months, fractional) */
  const xAt = (m: number, t: number) => L.x1 - (t - m) * mw;

  function draw(t: number, easing: number) {
    const lab = opts.labels();
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, W, H);
    const fl = Math.floor(t), frac = t - fl;
    const cur = fl + 1; // month being revealed at the "now" line
    const first = Math.floor(t - (L.x1 - L.x0) / mw) - 1;
    const chartTop = L.band.y, chartBot = L.lanes.y + L.lanes.h;
    const small = L.narrow ? 10 : 11;

    ctx!.save();
    ctx!.beginPath(); ctx!.rect(L.x0, 0, L.x1 - L.x0 + 1, H); ctx!.clip();
    // ---- down-month bands (behind everything)
    for (let m = first; m <= cur; m++) {
      const mo = get(m);
      if (!mo.down) continue;
      const xa = Math.max(L.x0, xAt(m - 1, t)), xb = m === cur ? L.x1 : xAt(m, t);
      if (xb <= xa) continue;
      ctx!.fillStyle = mo.stress ? "rgba(194,65,12,.11)" : "rgba(194,65,12,.05)";
      ctx!.fillRect(xa, chartTop, xb - xa, chartBot - chartTop);
    }

    // ---- values at the visible months (+ the interpolated head at the cursor)
    const pts: { x: number; v: number[] }[] = [];
    for (let m = first; m <= fl; m++) pts.push({ x: xAt(m, t), v: levels(m) });
    const a = levels(fl), b = levels(cur);
    const head = a.map((v, i) => v + (b[i] - v) * frac);
    pts.push({ x: L.x1, v: head });

    // ---- band: bond reference and combined engines on one scale
    const legendH = L.narrow ? 34 : 20;
    const by0 = chartTop + legendH, bh = L.band.h - legendH - 4, bmid = by0 + bh / 2;
    // the band is centred on the visible range (eased), so both paths use its whole height
    let lo = Infinity, hi = -Infinity;
    for (const p of pts) { lo = Math.min(lo, p.v[0], p.v[NE + 1]); hi = Math.max(hi, p.v[0], p.v[NE + 1]); }
    const target = Math.max(2, ((hi - lo) / 2) * 1.12), centre = (hi + lo) / 2;
    bandScale = bandScale ? bandScale + (target - bandScale) * easing : target;
    bandMid = Number.isFinite(bandMid) ? bandMid + (centre - bandMid) * easing : centre;
    const by = (v: number) => bmid - ((v - bandMid) / bandScale) * (bh / 2);
    const base = by0 + bh;
    // combined: soft area, gradient stroke
    ctx!.beginPath();
    pts.forEach((p, i) => (i ? ctx!.lineTo(p.x, by(p.v[NE + 1])) : ctx!.moveTo(p.x, by(p.v[NE + 1]))));
    ctx!.lineTo(L.x1, base); ctx!.lineTo(pts[0].x, base); ctx!.closePath();
    ctx!.fillStyle = areaG!; ctx!.fill();
    ctx!.beginPath();
    pts.forEach((p, i) => (i ? ctx!.lineTo(p.x, by(p.v[0])) : ctx!.moveTo(p.x, by(p.v[0]))));
    ctx!.strokeStyle = "rgba(95,99,104,.85)"; ctx!.lineWidth = 1.5; ctx!.lineJoin = "round"; ctx!.stroke();
    ctx!.beginPath();
    pts.forEach((p, i) => (i ? ctx!.lineTo(p.x, by(p.v[NE + 1])) : ctx!.moveTo(p.x, by(p.v[NE + 1]))));
    ctx!.strokeStyle = combG!; ctx!.lineWidth = 2.6; ctx!.stroke();

    // ---- lanes
    const lh = L.lanes.h / NE;
    for (let i = 0; i < NE; i++) {
      const yc = L.lanes.y + lh * i + lh / 2;
      let lt = 1.5;
      for (const p of pts) lt = Math.max(lt, Math.abs(p.v[i + 1]) * 1.1);
      laneScale[i] = laneScale[i] ? laneScale[i] + (lt - laneScale[i]) * easing : lt;
      const amp = lh * 0.4;
      const ly2 = (v: number) => yc - (v / laneScale[i]) * amp;
      ctx!.fillStyle = "rgba(95,99,104,.14)";
      ctx!.fillRect(L.x0, Math.round(yc), L.x1 - L.x0, 1);
      ctx!.beginPath();
      pts.forEach((p, k) => (k ? ctx!.lineTo(p.x, ly2(p.v[i + 1])) : ctx!.moveTo(p.x, ly2(p.v[i + 1]))));
      ctx!.lineTo(L.x1, yc); ctx!.lineTo(pts[0].x, yc); ctx!.closePath();
      ctx!.fillStyle = fills[i]; ctx!.fill();
      ctx!.beginPath();
      pts.forEach((p, k) => (k ? ctx!.lineTo(p.x, ly2(p.v[i + 1])) : ctx!.moveTo(p.x, ly2(p.v[i + 1]))));
      ctx!.strokeStyle = ENGINES[i].color; ctx!.lineWidth = 1.6; ctx!.stroke();
      // marks left by engines that moved on their own in a down month
      for (let m = Math.max(first, fl - 80); m <= fl; m++) {
        const mo = get(m);
        if (!lit(mo, i)) continue;
        const x = xAt(m, t) - mw / 2;
        if (x < L.x0) continue;
        const age = (t - m) * MONTH_MS;
        if (age < 700) { // a ring expands when the month closes
          const k = age / 700;
          ctx!.strokeStyle = rgba(ENGINES[i].color, 0.55 * (1 - k)); ctx!.lineWidth = 1.5;
          ctx!.beginPath(); ctx!.arc(x, yc, 4 + k * 12, 0, Math.PI * 2); ctx!.stroke();
        }
        ctx!.fillStyle = halos[i][0];
        ctx!.beginPath(); ctx!.arc(x, yc, 6, 0, Math.PI * 2); ctx!.fill();
        ctx!.fillStyle = ENGINES[i].color;
        ctx!.beginPath(); ctx!.arc(x, yc, 2.6, 0, Math.PI * 2); ctx!.fill();
      }
    }
    // fade the oldest months under the labels
    ctx!.fillStyle = fadeL!;
    ctx!.fillRect(L.x0, chartTop + legendH, 36, chartBot - chartTop - legendH);
    ctx!.restore();
    for (let i = 0; i < NE; i++) {
      const yc = L.lanes.y + lh * i + lh / 2;
      ctx!.fillStyle = ENGINES[i].color;
      ctx!.beginPath(); ctx!.arc(L.pad + 4, yc, 3.5, 0, Math.PI * 2); ctx!.fill();
      ctx!.font = `500 ${L.narrow ? 10.5 : 12.5}px ${SANS}`;
      ctx!.fillStyle = INK2; ctx!.textAlign = "left";
      text(lab.engines[i] ?? ENGINES[i].label.en, L.pad + 13, yc, L.labW - 18);
    }
    // legend of the band (two rows on narrow screens)
    ctx!.font = `500 ${small}px ${SANS}`;
    ctx!.textBaseline = "middle"; ctx!.textAlign = "left";
    const ly = chartTop + 8;
    const cw = L.x1 - L.x0;
    const lx0 = L.narrow ? L.pad : L.x0, colW = L.narrow ? W - 2 * L.pad - 22 : cw / 2 - 26;
    const lx1 = L.narrow ? L.pad : L.x0 + cw / 2, ly1 = L.narrow ? ly + 15 : ly;
    ctx!.fillStyle = "rgba(95,99,104,.85)"; ctx!.fillRect(lx0, ly - 1, 14, 2);
    ctx!.fillStyle = MUTE; text(lab.bond, lx0 + 20, ly, colW);
    ctx!.fillStyle = BLUE; ctx!.fillRect(lx1, ly1 - 1.5, 14, 3);
    ctx!.fillStyle = INK2; text(lab.combined, lx1 + 20, ly1, colW);

    // ---- particles: every engine streams into the combined head
    const cy = by(head[NE + 1]);
    const bulge = Math.min(40, (L.narrow ? W - L.x1 - 4 : L.heat.x - L.x1 - 8));
    for (let i = 0; i < NE; i++) {
      const sy = L.lanes.y + lh * i + lh / 2 - (head[i + 1] / (laneScale[i] || 1)) * lh * 0.4;
      for (let k = 0; k < 5; k++) {
        const u = ((clock / 1500) + k / 5 + i * 0.137) % 1;
        const cx = L.x1 + bulge * (0.6 + 0.4 * Math.sin(i + k));
        const x = (1 - u) * (1 - u) * L.x1 + 2 * (1 - u) * u * cx + u * u * L.x1;
        const y = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * ((sy + cy) / 2) + u * u * cy;
        ctx!.fillStyle = rgba(ENGINES[i].color, Math.round(85 * Math.sin(Math.PI * u)) / 100);
        ctx!.beginPath(); ctx!.arc(x, y, 2.2, 0, Math.PI * 2); ctx!.fill();
      }
    }

    // ---- the "now" line: glow strips + bright core, no shadowBlur
    ctx!.fillStyle = cursorG!;
    ctx!.globalAlpha = 0.14; ctx!.fillRect(L.x1 - 6, chartTop, 12, chartBot - chartTop);
    ctx!.globalAlpha = 0.3; ctx!.fillRect(L.x1 - 3, chartTop, 6, chartBot - chartTop);
    ctx!.globalAlpha = 1; ctx!.fillRect(L.x1 - 1, chartTop, 2, chartBot - chartTop);
    // heads: bond, combined and each engine (lit when it moves up in a down month)
    const curM = get(cur);
    const dot = (x: number, y: number, r: number, fill: string, ring: string) => {
      ctx!.fillStyle = fill; ctx!.beginPath(); ctx!.arc(x, y, r, 0, Math.PI * 2); ctx!.fill();
      ctx!.strokeStyle = ring; ctx!.lineWidth = 1.5; ctx!.stroke();
    };
    dot(L.x1, by(head[0]), 3, "#fff", curM.down ? ORANGE : MUTE);
    dot(L.x1, cy, 4, "#fff", BLUE);
    const glow = Math.max(0, Math.min(1, (frac - 0.3) / 0.25));
    for (let i = 0; i < NE; i++) {
      const y = L.lanes.y + lh * i + lh / 2 - (head[i + 1] / (laneScale[i] || 1)) * lh * 0.4;
      if (lit(curM, i) && glow > 0) {
        const pulse = 1 + 0.25 * Math.sin(clock / 120 + i);
        for (let h = 0; h < 3; h++) {
          ctx!.fillStyle = halos[i][h];
          ctx!.beginPath(); ctx!.arc(L.x1, y, (13 - h * 4) * glow * pulse, 0, Math.PI * 2); ctx!.fill();
        }
        dot(L.x1, y, 4, ENGINES[i].color, "#fff");
      } else {
        dot(L.x1, y, 3, "#fff", curM.down ? "rgba(95,99,104,.6)" : ENGINES[i].color);
      }
    }

    drawHeat(lab, fl, easing);
    drawFoot(lab);
  }

  function drawHeat(lab: OverlayLabels, fl: number, easing: number) {
    if (heatFor !== fl) { heatTarget = downsideCorrelation(get, fl); heatFor = fl; }
    const tgt = heatTarget!;
    if (!heat || easing >= 1) heat = tgt.map((r) => r.slice());
    else for (let i = 0; i < tgt.length; i++) for (let j = 0; j < tgt.length; j++) heat[i][j] += (tgt[i][j] - heat[i][j]) * easing * 0.6;
    const hx = L.heat.x, hy = L.heat.y, hw = L.heat.w, hh = L.heat.h;
    const n = NE + 1;
    const titleH = 22, dotsH = 16, legH = 34;
    ctx!.textBaseline = "middle";
    ctx!.font = `600 ${L.narrow ? 10 : 10.5}px ${SANS}`;
    ctx!.fillStyle = MUTE; ctx!.textAlign = L.narrow ? "center" : "left";
    const title = lab.heat.toUpperCase();
    if (L.narrow) text(title, hx + hw / 2, hy + 8, hw); else text(title, hx, hy + 8, hw);
    ctx!.font = `500 ${L.narrow ? 10.5 : 11.5}px ${SANS}`;
    const names = [lab.bondShort, ...lab.engines];
    let rowLab = 0;
    for (const s of names) rowLab = Math.max(rowLab, measure(s));
    rowLab = Math.min(rowLab + 12, hw * 0.42);
    const grid = Math.max(30, Math.min(hw - rowLab, hh - titleH - dotsH - legH, L.narrow ? 220 : 280));
    const cell = grid / n;
    const gx = L.narrow ? hx + (hw - (rowLab + grid)) / 2 + rowLab : hx + rowLab;
    const gy = hy + titleH + dotsH + Math.max(0, (hh - titleH - dotsH - legH - grid) / 2);
    const colors = [BOND.color, ...ENGINES.map((e) => e.color)];
    for (let j = 0; j < n; j++) {
      ctx!.fillStyle = colors[j];
      ctx!.beginPath(); ctx!.arc(gx + cell * j + cell / 2, gy - 8, 3.2, 0, Math.PI * 2); ctx!.fill();
    }
    ctx!.textAlign = "right";
    for (let i = 0; i < n; i++) {
      ctx!.fillStyle = i === 0 ? MUTE : INK2;
      text(names[i], gx - 8, gy + cell * i + cell / 2, rowLab - 10);
      for (let j = 0; j < n; j++) {
        const x = gx + cell * j + 1.5, y = gy + cell * i + 1.5, s = cell - 3;
        if (i === j) {
          ctx!.fillStyle = "rgba(95,99,104,.07)"; round(x, y, s, s, 4); ctx!.fill();
          ctx!.fillStyle = colors[i]; ctx!.beginPath(); ctx!.arc(x + s / 2, y + s / 2, Math.max(1.5, s * 0.1), 0, Math.PI * 2); ctx!.fill();
        } else {
          ctx!.fillStyle = heatColor(heat![i][j]); round(x, y, s, s, 4); ctx!.fill();
        }
      }
    }
    // legend: opposite · low · together
    const lgY = gy + grid + 14, lgW = Math.min(hw, Math.max(grid, 200));
    const lgX = Math.max(hx, Math.min(hx + hw - lgW, gx + (grid - lgW) / 2));
    const steps = 11;
    for (let k = 0; k < steps; k++) {
      const c = -1 + (2 * k) / (steps - 1);
      ctx!.fillStyle = heatColor(c);
      ctx!.fillRect(lgX + (lgW / steps) * k, lgY - 3, lgW / steps + 0.5, 6);
    }
    ctx!.font = `500 ${L.narrow ? 9.5 : 10}px ${SANS}`;
    ctx!.fillStyle = MUTE;
    const third = lgW / 3;
    ctx!.textAlign = "left"; text(lab.opposite, lgX, lgY + 13, third);
    ctx!.textAlign = "center"; text(lab.low, lgX + lgW / 2, lgY + 13, third);
    ctx!.textAlign = "right"; text(lab.together, lgX + lgW, lgY + 13, third);
  }

  function drawFoot(lab: OverlayLabels) {
    ctx!.textBaseline = "middle";
    const mark = opts.watermark?.();
    const fy = H - 13;
    // legend: down month swatch and lit dot
    const legendY = L.narrow ? H - 30 : fy;
    let lx = L.narrow ? L.pad : L.x0;
    const maxX = L.narrow ? W - L.pad : L.x1;
    ctx!.font = `500 ${L.narrow ? 10 : 10.5}px ${SANS}`;
    if (!L.narrow && mark) {
      ctx!.font = `600 10.5px ${SANS}`;
      lx = Math.max(L.x0, L.pad + measure(mark) + 24);
      ctx!.font = `500 10.5px ${SANS}`;
    }
    ctx!.textAlign = "left";
    ctx!.fillStyle = "rgba(194,65,12,.22)"; ctx!.fillRect(lx, legendY - 5, 10, 10);
    ctx!.fillStyle = MUTE;
    const downW = Math.min(measure(lab.down), (maxX - lx) * 0.35);
    text(lab.down, lx + 15, legendY, downW);
    const lx2 = lx + 15 + downW + 16;
    if (lx2 + 30 < maxX) {
      ctx!.fillStyle = halos[3][1]; ctx!.beginPath(); ctx!.arc(lx2 + 5, legendY, 6, 0, Math.PI * 2); ctx!.fill();
      ctx!.fillStyle = ENGINES[3].color; ctx!.beginPath(); ctx!.arc(lx2 + 5, legendY, 3, 0, Math.PI * 2); ctx!.fill();
      ctx!.fillStyle = MUTE; text(lab.lit, lx2 + 16, legendY, maxX - lx2 - 16);
    }
    if (mark) {
      ctx!.font = `600 ${L.narrow ? 10 : 10.5}px ${SANS}`;
      ctx!.fillStyle = MUTE; ctx!.textAlign = "left";
      text(mark, L.pad, fy, W - 2 * L.pad);
    }
  }

  function updateCounters(t: number, force = false) {
    const fl = Math.floor(t);
    if (fl === countFor && !force) return;
    countFor = fl;
    const cycleStart = START + Math.floor((fl - START) / COUNTER_CYCLE) * COUNTER_CYCLE;
    const c = countersBetween(get, cycleStart, fl + 1);
    counts.months = c.months; counts.down = c.down; counts.litMoves = c.litMoves;
    const now = performance.now();
    if (!force && now - lastCounterWrite < 120) return;
    lastCounterWrite = now;
    writeCounters();
  }
  function writeCounters() {
    const lang = opts.lang();
    const c = opts.counters;
    if (c?.months) c.months.textContent = groupDigits(counts.months, lang);
    if (c?.down) c.down.textContent = groupDigits(counts.down, lang);
    if (c?.lit) c.lit.textContent = groupDigits(counts.litMoves, lang);
  }

  const timeNow = () => START + clock / MONTH_MS;

  function frame() {
    const t = timeNow();
    draw(t, 0.08);
    updateCounters(t);
    frames++;
    host.setAttribute("data-frames", String(frames));
  }

  /** reduced motion: one frame, frozen on a down month where engines light up, counters matching it */
  function stillFrame() {
    resize();
    let m = START + 30;
    for (let k = 0; k < 400; k++, m++) {
      const mo: Month = get(m);
      let n = 0;
      for (let i = 0; i < NE; i++) if (lit(mo, i)) n++;
      if (mo.down && n >= 2 && n <= 4) break;
    }
    clock = (m - 1 + 0.85 - START) * MONTH_MS;
    bandScale = 0; bandMid = NaN; laneScale = laneScale.map(() => 0); heat = null;
    draw(timeNow(), 1);
    countFor = -1;
    updateCounters(timeNow(), true);
    host.setAttribute("data-frames", "1");
    host.setAttribute("data-running", "false");
  }

  const loop = (now: number) => {
    raf = 0;
    if (!running) return;
    const dt = last ? Math.min(100, now - last) : 16;
    if (last && dt < minGap - 2) { raf = requestAnimationFrame(loop); return; }
    last = now;
    if (dt > 52 && minGap < 50) { slow++; if (slow > 20) minGap = 1000 / 20; } else slow = Math.max(0, slow - 1);
    clock += dt;
    frame();
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (running || opts.still || !visible || !onscreen) return;
    running = true; last = 0;
    host.setAttribute("data-running", "true");
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    host.setAttribute("data-running", "false");
  };

  resize();
  host.setAttribute("data-frames", "0");
  host.setAttribute("data-running", "false");
  if (opts.still) { stillFrame(); opts.onReady?.(); }

  const ro = typeof ResizeObserver !== "undefined"
    ? new ResizeObserver(() => { resize(); if (opts.still) stillFrame(); else if (!running) frame(); })
    : null;
  ro?.observe(canvas);
  const io = typeof IntersectionObserver !== "undefined"
    ? new IntersectionObserver((es) => { onscreen = es.some((e) => e.isIntersecting); if (onscreen) start(); else stop(); }, { threshold: 0.05 })
    : null;
  if (io) io.observe(canvas); else { onscreen = true; start(); }
  const onVis = () => { visible = document.visibilityState === "visible"; if (visible) start(); else stop(); };
  document.addEventListener("visibilitychange", onVis);
  if (!opts.still) { frame(); opts.onReady?.(); }

  const redraw = () => { if (dead) return; widths = new Map(); if (opts.still) stillFrame(); else if (!running) frame(); else writeCounters(); };
  try {
    const fonts = document.fonts;
    if (fonts?.load) void Promise.all(["500", "600"].map((w) => fonts.load(`${w} 12px Poppins`))).then(redraw, () => undefined);
  } catch { /* no font API: keep the fallback font */ }

  return {
    redraw,
    destroy() {
      dead = true;
      stop();
      ro?.disconnect();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    },
  };
}
