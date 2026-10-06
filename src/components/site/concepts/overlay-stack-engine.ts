/**
 * overlay-stack-engine.ts — canvas scene of "what is an overlay" (/core-concepts). Step 1: the core portfolio
 * fills to 100% and stays invested. Step 2: a small deposit (≈10% wide, to scale) slides out beside it. Step 3: a beam
 * rises from the deposit and opens into a full-width futures exposure stacked on top of the core. Step 4: both blocks
 * stream particles into a chart where each generated period stacks the core and overlay contributions into the
 * combined one (overlay losses add up too); a regime strip under the bars and shaded columns behind them mark the
 * volatile periods, where the generated overlay does better. Lazily imported; drawn by runner.ts.
 */
import { COL, makePen, rgba, splitLabel, type Pen } from "../canvas/draw-kit.ts";
import {
  CHART_PERIODS, OVERLAY_STEP_MS, PERIOD_MS, MAX_CONTRIB, chartScale, largestLoss, lossNoteSpot, overlayStackLayout, periodAt, stackBlocks, type Period,
} from "./overlay-stack-model.ts";
import { runScene, type Runner, type RunnerOptions } from "../canvas/runner.ts";
import { ease, easeOut, span, stepAt, stepStarts } from "../canvas/timeline.ts";

interface OverlayStackLabels {
  core: string; coreSub: string; deposit: string; depositSub: string; overlay: string; overlaySub: string;
  bracket: string; bracketSub: string; coreRet: string; ovRet: string; combined: string; tagline: string; loss: string;
  calm: string; volatile: string; volNote: string; watermark: string;
}

const STARTS = stepStarts(OVERLAY_STEP_MS);
const CORE_C = "#7b8aa3";

export function createOverlayStack(canvas: HTMLCanvasElement, opts: RunnerOptions & { labels: () => OverlayStackLabels }): Runner {
  let L = overlayStackLayout(1, 1);
  let B = stackBlocks(L.stack, false);
  let pen: Pen | null = null;
  const periods = new Map<string, Period>();
  const period = (n: number, loop: number) => {
    const k = `${loop}:${n}`;
    let v = periods.get(k);
    if (!v) { if (periods.size > 400) periods.clear(); v = periodAt(n, loop % 16); periods.set(k, v); }
    return v;
  };

  const scene = {
    steps: OVERLAY_STEP_MS,
    stillAt: (s: number) => STARTS[s] + OVERLAY_STEP_MS[s] * (s === 3 ? 0.82 : 0.9),
    resize(W: number, H: number) { L = overlayStackLayout(W, H); B = stackBlocks(L.stack, L.narrow); },
    draw(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, still: boolean) {
      pen ??= makePen(ctx);
      const P = pen;
      const lab = opts.labels();
      const { step, p, loop } = stepAt(t, OVERLAY_STEP_MS);
      const a0 = step > 0 ? 1 : ease(span(p, 0.05, 0.6));
      const a1 = step > 1 ? 1 : step < 1 ? 0 : ease(span(p, 0.05, 0.55));
      const a2 = step > 2 ? 1 : step < 2 ? 0 : p;
      const a3 = step < 3 ? 0 : p;
      // the last instants of the cycle fade out, so the loop restarts softly
      const fade = step === 3 ? 1 - span(p, 0.955, 1) : 1;
      ctx.globalAlpha = fade;
      const { core, deposit, overlay } = B;
      const small = L.narrow ? 11 : 12;

      /* ---------- core portfolio: fills up to 100% and stays invested */
      if (a0 > 0) {
        const fillH = core.h * a0;
        const g = ctx.createLinearGradient(0, core.y, 0, core.y + core.h);
        g.addColorStop(0, "#eef2f9"); g.addColorStop(1, "#dbe3f0");
        P.round(core.x, core.y, core.w, core.h, 14);
        ctx.fillStyle = rgba("#ffffff", 0.7); ctx.fill();
        ctx.strokeStyle = rgba(CORE_C, 0.35); ctx.lineWidth = 1; ctx.stroke();
        ctx.save();
        P.round(core.x, core.y, core.w, core.h, 14); ctx.clip();
        ctx.fillStyle = g;
        ctx.fillRect(core.x, core.y + core.h - fillH, core.w, fillH);
        // holdings: small chips shimmering inside the filled part
        const cs = L.narrow ? 9 : 11, gap = 4;
        const cols = Math.max(1, Math.floor((core.w - 16) / (cs + gap))), rows = Math.max(1, Math.floor((core.h - 54) / (cs + gap)));
        const ox = core.x + (core.w - cols * (cs + gap) + gap) / 2, oy = core.y + core.h - 10 - rows * (cs + gap) + gap;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const y = oy + r * (cs + gap);
          if (y < core.y + core.h - fillH) continue;
          const tw = 0.5 + 0.5 * Math.sin(t / 900 + c * 0.7 + r * 1.3);
          ctx.fillStyle = rgba(CORE_C, 0.16 + 0.14 * tw);
          P.round(ox + c * (cs + gap), y, cs, cs, 3); ctx.fill();
        }
        ctx.restore();
        ctx.globalAlpha = fade * span(a0, 0.4, 1);
        P.font(600, L.narrow ? 13.5 : 15.5);
        P.text(lab.core, core.x + 14, core.y + 20, core.w - 28, "left", COL.ink);
        P.font(500, small);
        P.text(lab.coreSub, core.x + 14, core.y + 39, core.w - 28, "left", COL.ink2);
        // bracket: the same capital base covers the core and the deposit posted from it
        const br = B.bracket, by = br.y, LB = B.labels;
        ctx.strokeStyle = rgba(COL.mute, 0.55); ctx.lineWidth = 1.2;
        const bx1 = br.x0 + core.w + (br.x1 - br.x0 - core.w) * a1;
        ctx.beginPath();
        ctx.moveTo(br.x0 + 1, by); ctx.lineTo(br.x0 + 1, by + 6); ctx.lineTo(bx1 - 1, by + 6); ctx.lineTo(bx1 - 1, by);
        ctx.stroke();
        P.font(600, small);
        P.text(lab.bracket, (br.x0 + bx1) / 2, LB.bracket.y + 7, LB.bracket.w, "center", COL.ink2);
        if (a1 > 0) {
          ctx.globalAlpha = fade * a1;
          P.font(500, L.narrow ? 10 : 11);
          const two = P.measure(lab.bracketSub) > LB.sub1.w ? splitLabel(lab.bracketSub) : null;
          if (two) { P.text(two[0], LB.sub1.x + LB.sub1.w / 2, LB.sub1.y + 7, LB.sub1.w, "center", COL.mute); P.text(two[1], LB.sub2.x + LB.sub2.w / 2, LB.sub2.y + 7, LB.sub2.w, "center", COL.mute); }
          else P.text(lab.bracketSub, LB.sub1.x + LB.sub1.w / 2, LB.sub1.y + 7, LB.sub1.w, "center", COL.mute);
        }
        ctx.globalAlpha = fade;
      }

      /* ---------- deposit: ≈10% of the exposure, to scale */
      if (a1 > 0) {
        const dx = deposit.x - (1 - a1) * (deposit.w + B.gap);
        ctx.globalAlpha = fade * a1;
        const pulse = 0.5 + 0.5 * Math.sin(t / 380);
        P.round(dx - 4, deposit.y - 4, deposit.w + 8, deposit.h + 8, 10);
        ctx.fillStyle = rgba(COL.cyan, 0.08 + 0.08 * pulse); ctx.fill();
        const g = ctx.createLinearGradient(0, deposit.y, 0, deposit.y + deposit.h);
        g.addColorStop(0, COL.sky); g.addColorStop(1, COL.cyan);
        P.round(dx, deposit.y, deposit.w, deposit.h, 6);
        ctx.fillStyle = g; ctx.fill();
        // labels under the deposit (the beam rises from its top), aligned to the right edge of the stack
        const right = L.stack.x + L.stack.w;
        P.font(600, small);
        P.text(lab.depositSub, right, B.labels.depositA.y + 7, B.labels.depositA.w, "right", COL.blueD);
        P.font(500, small - 0.5);
        P.text(lab.deposit, right, B.labels.depositB.y + 7, B.labels.depositB.w, "right", COL.ink2);
        ctx.globalAlpha = fade;
      }

      /* ---------- overlay: a beam rises from the deposit, then opens over the whole core */
      if (a2 > 0) {
        const beam = ease(span(a2, 0, 0.35)), open = easeOut(span(a2, 0.3, 1));
        const bx = deposit.x + deposit.w / 2;
        const topY = overlay.y + overlay.h / 2;
        const curY = deposit.y - (deposit.y - topY) * beam;
        const bg = ctx.createLinearGradient(0, deposit.y, 0, topY);
        bg.addColorStop(0, rgba(COL.cyan, 0.9)); bg.addColorStop(1, rgba(COL.blue, 0.9));
        ctx.fillStyle = rgba(COL.cyan, 0.15); ctx.fillRect(bx - 4, curY, 8, deposit.y - curY);
        ctx.fillStyle = bg; ctx.fillRect(bx - 1.2, curY, 2.4, deposit.y - curY);
        // the beam's light travels up
        const k = (t / 900) % 1;
        ctx.fillStyle = rgba(COL.sky, 0.9 * beam);
        ctx.beginPath(); ctx.arc(bx, deposit.y - (deposit.y - curY) * k, 2.6, 0, Math.PI * 2); ctx.fill();
        if (open > 0) {
          const right = overlay.x + overlay.w;
          const w = Math.max(10, overlay.w * open);
          const x = right - w;
          ctx.fillStyle = rgba(COL.blue, 0.1);
          P.round(x - 4, overlay.y - 4, w + 8, overlay.h + 8, 16); ctx.fill();
          const og = ctx.createLinearGradient(x, 0, right, 0);
          og.addColorStop(0, rgba(COL.blueD, 0.2)); og.addColorStop(1, rgba(COL.cyan, 0.3));
          P.round(x, overlay.y, w, overlay.h, 12); ctx.fillStyle = og; ctx.fill();
          ctx.save();
          P.round(x, overlay.y, w, overlay.h, 12); ctx.clip();
          // futures: diagonal stripes flowing
          ctx.strokeStyle = rgba(COL.blue, 0.13); ctx.lineWidth = 6;
          const off = (t / 40) % 22;
          for (let sx = x - overlay.h - 22 + off; sx < right + 22; sx += 22) {
            ctx.beginPath(); ctx.moveTo(sx, overlay.y + overlay.h); ctx.lineTo(sx + overlay.h, overlay.y); ctx.stroke();
          }
          ctx.restore();
          P.round(x, overlay.y, w, overlay.h, 12);
          ctx.strokeStyle = rgba(COL.blue, 0.85); ctx.lineWidth = 1.6; ctx.stroke();
          // join the beam to the overlay's right edge
          ctx.fillStyle = bg; ctx.fillRect(right, topY - 1.2, bx - right, 2.4);
          ctx.globalAlpha = fade * span(open, 0.5, 1);
          P.font(600, L.narrow ? 13 : 15);
          P.text(lab.overlay, overlay.x + 14, overlay.y + overlay.h / 2 - (overlay.h > 50 ? 9 : 0), overlay.w - 28, "left", COL.blueD);
          if (overlay.h > 50) { P.font(500, small); P.text(lab.overlaySub, overlay.x + 14, overlay.y + overlay.h / 2 + 11, overlay.w - 28, "left", COL.ink2); }
          ctx.globalAlpha = fade;
        }
      }

      /* ---------- return chart: two streams stacking into the combined portfolio */
      drawChart(ctx, P, lab, t, a3, loop, step, fade, still);
      ctx.globalAlpha = 1;
      P.watermark(lab.watermark, W, H, L.pad);
    },
  };

  function drawChart(ctx: CanvasRenderingContext2D, P: Pen, lab: OverlayStackLabels, t: number, a3: number, loop: number, step: number, fade: number, still: boolean) {
    const C = L.chart;
    const small = L.narrow ? 10.5 : 11.5;
    const legendH = L.narrow ? 38 : 26;
    const taglineH = 26;
    // volatility regime strip + its note, between the bars and the tagline
    P.font(500, L.narrow ? 10 : 11);
    const noteLines = P.measure(lab.volNote) > C.w ? splitLabel(lab.volNote) ?? [lab.volNote] : [lab.volNote];
    const stripH = 14, stripBlock = 8 + stripH + 6 + noteLines.length * 14;
    const top = C.y + legendH, bottom = C.y + C.h - taglineH - stripBlock;
    const mid = (top + bottom) / 2, half = (bottom - top) / 2;
    const show = step === 3 ? 1 : 0.7;
    // legend
    ctx.globalAlpha = fade * show;
    P.font(500, small);
    const items: [string, string, "bar" | "dot"][] = [[lab.coreRet, CORE_C, "bar"], [lab.ovRet, COL.cyan, "bar"], [lab.combined, COL.blueD, "dot"]];
    let lx = C.x, ly = C.y + 8;
    for (const [s, c, kind] of items) {
      const w = Math.min(P.measure(s), C.w * 0.42);
      if (lx + 18 + w > C.x + C.w) { lx = C.x; ly += 16; }
      if (kind === "bar") { ctx.fillStyle = c; P.round(lx, ly - 5, 10, 10, 2); ctx.fill(); }
      else { ctx.fillStyle = "#fff"; ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(lx + 5, ly, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      P.text(s, lx + 16, ly, w, "left", COL.ink2);
      lx += 16 + w + 16;
    }
    // zero line and time arrow
    ctx.fillStyle = rgba(COL.mute, 0.3); ctx.fillRect(C.x, Math.round(mid), C.w, 1);
    ctx.globalAlpha = fade;
    if (step !== 3) {
      // desktop: a faint placeholder of the chart to come (steps 1–3)
      if (!L.narrow) {
        const bw0 = C.w / 17, sc0 = half / (MAX_CONTRIB * 1.05);
        ctx.fillStyle = rgba(COL.mute, 0.08);
        for (let i = 0; i < 16; i++) {
          const v = periodAt(i, 7).combined * sc0;
          P.round(C.x + bw0 * (i + 0.5) - bw0 * 0.28, v >= 0 ? mid - v : mid, bw0 * 0.56, Math.max(2, Math.abs(v)), 2); ctx.fill();
        }
      }
      return;
    }
    const n = Math.floor((a3 * OVERLAY_STEP_MS[3]) / PERIOD_MS);
    const cap = CHART_PERIODS;
    const bw = C.w / (cap + 1);
    const win = Array.from({ length: cap }, (_, i) => period(i, loop));
    const scale = chartScale(win, half);
    const last = Math.min(n, cap - 1);
    const growOf = (i: number) => (i === n ? easeOut(((a3 * OVERLAY_STEP_MS[3]) % PERIOD_MS) / PERIOD_MS) : 1);
    // volatile periods: shaded columns behind the bars, and the regime strip (calm / volatile runs) under them
    const sy = bottom + 8;
    let firstVol = -1;
    for (let i = 0; i <= last; i++) {
      if (!period(i, loop).volatile) continue;
      if (firstVol < 0) firstVol = i;
      ctx.fillStyle = rgba(COL.violet, 0.075 * growOf(i));
      ctx.fillRect(C.x + bw * i, top - 2, bw, sy - top + 2);
    }
    for (let i = 0; i <= last;) {
      const v = period(i, loop).volatile;
      let j = i;
      while (j + 1 <= last && period(j + 1, loop).volatile === v) j++;
      const x0 = C.x + bw * i + 2, x1 = Math.max(x0 + 4, C.x + bw * (j + growOf(j)) - 2);
      ctx.globalAlpha = fade * growOf(i);
      P.round(x0, sy, x1 - x0, stripH, 7);
      ctx.fillStyle = v ? rgba(COL.violet, 0.2) : rgba(COL.slate, 0.16); ctx.fill();
      // the tag at a smaller size when the run is short; never truncated (the shading carries it otherwise)
      const tag = v ? lab.volatile : lab.calm;
      for (const fs of L.narrow ? [9, 8] : [9.5, 8.5]) {
        P.font(500, fs);
        if (P.measure(tag) <= x1 - x0 - 6) { P.text(tag, (x0 + x1) / 2, sy + stripH / 2, x1 - x0 - 6, "center", v ? COL.violet : COL.mute); break; }
      }
      i = j + 1;
    }
    ctx.globalAlpha = fade;
    // the note tied to the strip, once the first volatile period has arrived
    if (firstVol >= 0) {
      ctx.globalAlpha = fade * growOf(firstVol);
      P.font(500, L.narrow ? 10 : 11);
      noteLines.forEach((s, k) => P.text(s, C.x + C.w / 2, sy + stripH + 12 + k * 14, C.w, "center", COL.violet));
      ctx.globalAlpha = fade;
    }
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= last; i++) {
      const pd = period(i, loop);
      const grow = growOf(i);
      const x = C.x + bw * (i + 0.5);
      const w = Math.max(3, bw * 0.56);
      // positives stack up from zero, negatives stack down
      let up = 0, dn = 0;
      for (const [v, c] of [[pd.core, CORE_C], [pd.overlay, COL.cyan]] as [number, string][]) {
        const h = Math.abs(v) * scale * grow;
        const y0 = v >= 0 ? mid - up - h : mid + dn;
        ctx.fillStyle = v >= 0 ? c : rgba(c, 0.75);
        P.round(x - w / 2, y0, w, h, 2); ctx.fill();
        if (v >= 0) up += h; else dn += h;
      }
      pts.push({ x, y: mid - pd.combined * scale * grow });
    }
    // combined path + dots
    if (pts.length > 1) {
      const g = ctx.createLinearGradient(C.x, 0, C.x + C.w, 0);
      g.addColorStop(0, COL.blueD); g.addColorStop(1, COL.cyan);
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineJoin = "round";
      ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.stroke();
    }
    for (const q of pts) { ctx.fillStyle = "#fff"; ctx.strokeStyle = COL.blueD; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(q.x, q.y, 3.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    if (pts.length) P.glowDot(pts[pts.length - 1].x, pts[pts.length - 1].y, 3, COL.blue, 0.8);
    // streams: particles from the core and the overlay into the newest bar
    const head = pts[pts.length - 1];
    if (head && !still) {
      const srcs: [number, number, string][] = [
        [B.core.x + B.core.w, B.core.y + B.core.h / 2, CORE_C],
        [B.overlay.x + B.overlay.w, B.overlay.y + B.overlay.h / 2, COL.cyan],
      ];
      for (const [sx0, sy, c] of srcs) {
        // narrow: both streams leave the bottom of the stack (core from its middle, overlay down the beam's side)
        const sx = L.narrow ? (c === CORE_C ? B.core.x + B.core.w * 0.4 : B.deposit.x + B.deposit.w / 2) : sx0 + 6;
        const sY = L.narrow ? B.labels.sub2.y + 16 : sy;
        for (let k = 0; k < 7; k++) {
          const u = ((t / 1400) + k / 7 + (c === CORE_C ? 0 : 0.07)) % 1;
          const cx = L.narrow ? (sx + head.x) / 2 + (c === CORE_C ? -30 : 30) : (sx + head.x) / 2;
          const cy = L.narrow ? (sY + head.y) / 2 : Math.min(sY, head.y) - 30;
          const x = (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * cx + u * u * head.x;
          const y = (1 - u) * (1 - u) * sY + 2 * (1 - u) * u * cy + u * u * head.y;
          ctx.fillStyle = rgba(c, Math.round(80 * Math.sin(Math.PI * u)) / 100);
          ctx.beginPath(); ctx.arc(x, y, 2.3, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    // honest note: an overlay period can lose, and the loss adds to the core's
    // pointed at the largest overlay loss on screen, placed clear of the bars around it
    const shown = win.slice(0, n >= cap ? cap : n);
    const li = largestLoss(shown);
    if (li >= 0) {
      P.font(500, L.narrow ? 10 : 10.5);
      const textW = Math.min(P.measure(lab.loss), C.w * 0.55);
      const spot = lossNoteSpot(win, li, { x0: C.x, bw, w: Math.max(3, bw * 0.56), mid, top, bottom, scale, textW });
      const x = C.x + bw * (li + 0.5);
      ctx.strokeStyle = rgba(COL.orange, 0.7); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, spot.line[0]); ctx.lineTo(x, spot.line[1]); ctx.stroke();
      P.text(lab.loss, spot.x, spot.y, textW, spot.align, COL.orange);
    }
    // tagline
    ctx.globalAlpha = fade * span(a3, 0.12, 0.3);
    // the tagline shrinks (rather than truncates) when the regime note leaves it a narrow column
    let tf = L.narrow ? 13 : 15;
    P.font(600, tf);
    while (tf > 10.5 && P.measure(lab.tagline) > C.w) { tf -= 0.5; P.font(600, tf); }
    P.text(lab.tagline, C.x + C.w / 2, C.y + C.h - 10, C.w, "center", COL.blueD);
    ctx.globalAlpha = fade;
  }

  return runScene(canvas, scene, opts);
}
