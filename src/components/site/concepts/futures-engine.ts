/**
 * futures-engine.ts — canvas scene of "how futures work" (/core-concepts). A generated index moves day by day:
 * settled days lock behind the glowing "today" column, where only the current day's move is open; at every close the
 * move is paid in cash (index up: the short pays the long; down: the long pays the short), a coin stream crosses
 * between the two sides and the day's settlement drops into the row below, whose sum is the total gain or loss. Each
 * side's margin buffer is sized to a one-day move and widens in the volatile episode. Four focus steps highlight, in
 * turn, the matched positions, the daily cash settlement, the margin buffer and the single day at risk.
 */
import { COL, makePen, rgba, splitLabel, type Pen } from "./draw-kit.ts";
import {
  DAYS, DAY_MS, FUTURES_STEP_MS, LOOP_MS, SETTLE_SHARE, futuresLayout, futuresLoop, intraday, marginFor, marketU, ruleAlpha, settledThrough, sigmaOf, type Day,
} from "./futures-model.ts";
import { runScene, type Runner, type RunnerOptions } from "./runner.ts";
import { clamp, ease, span, stepAt } from "./timeline.ts";

export interface FuturesLabels {
  price: string; settled: string; today: string; long: string; short: string; clearing: string; matched: string;
  closeDay: string; upPays: string; downPays: string; buffer: string; bufferNote: string; calm: string; volatile: string; settleRow: string;
  sum: string; realized: string; formula: string; watermark: string;
}

/** Still-frame clock of the first three steps (days into the loop): positions, a settlement in flight, the volatile episode. */
const STILL_DAYS = [2.6, 5.22, 9.55];
const UP = COL.blue, DOWN = COL.orange;
/** Share of a day during which the previous close's cash moves between the sides: the settlement pause. */
const FLOW = SETTLE_SHARE;

export function createFutures(canvas: HTMLCanvasElement, opts: RunnerOptions & { labels: () => FuturesLabels }): Runner {
  let L = futuresLayout(1, 1);
  let pen: Pen | null = null;
  const loops = new Map<number, { days: Day[]; lo: number; hi: number }>();
  const getLoop = (k: number) => {
    let v = loops.get(k);
    if (!v) {
      if (loops.size > 6) loops.clear();
      const days = futuresLoop(k);
      let lo = Infinity, hi = -Infinity;
      for (const d of days) { lo = Math.min(lo, d.open, d.close) - d.sigma * 0.5; hi = Math.max(hi, d.open, d.close) + d.sigma * 0.5; }
      v = { days, lo, hi };
      loops.set(k, v);
    }
    return v;
  };
  let bufEase = NaN;
  let chipIn = 0;

  const scene = {
    steps: FUTURES_STEP_MS,
    stillAt: (s: number) => {
      const k = Math.max(0, Math.min(3, s));
      if (k < 3) return STILL_DAYS[k] * DAY_MS;
      // "one day at risk": late in the step's day with the largest move, so the open P&L is visible
      const days = getLoop(0).days;
      let best = 11;
      for (let d = 11; d <= 13; d++) if (Math.abs(days[d].move) > Math.abs(days[best].move)) best = d;
      return (best + 0.82) * DAY_MS;
    },
    resize(W: number, H: number) { L = futuresLayout(W, H); },
    draw(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, still: boolean) {
      pen ??= makePen(ctx);
      const P = pen;
      const lab = opts.labels();
      const loopN = Math.floor(t / LOOP_MS);
      const tl = t - loopN * LOOP_MS;
      const dayF = tl / DAY_MS;
      const d = Math.min(DAYS - 1, Math.floor(dayF)), u = dayF - d;
      const { step } = stepAt(t, FUTURES_STEP_MS);
      const { days, lo, hi } = getLoop(loopN);
      const prev = d > 0 ? days[d - 1] : null;
      // focus: the step's subject at full strength, the rest softened
      const f = (k: number) => (step === k ? 1 : 0.7);
      drawPrice(ctx, P, lab, days, d, u, lo, hi, step, f);
      drawSettlements(ctx, P, lab, days, d, u, f(1), step);
      const sigma = sigmaOf(d);
      const target = marginFor(sigma);
      bufEase = Number.isFinite(bufEase) && !still ? bufEase + (target - bufEase) * 0.08 : target;
      chipIn = step === 3 ? (still ? 1 : stepAt(t, FUTURES_STEP_MS).p * 4) : 0;
      drawParties(ctx, P, lab, prev, d, u, step, f, sigma, t);
      ctx.globalAlpha = 1;
      P.watermark(lab.watermark, W, H, L.pad);
    },
  };

  function drawPrice(ctx: CanvasRenderingContext2D, P: Pen, lab: FuturesLabels, days: Day[], d: number, u: number, lo: number, hi: number, step: number, f: (k: number) => number) {
    const R = L.price;
    const small = L.narrow ? 10 : 11;
    const top = R.y + 42, bottom = R.y + R.h - 16;
    const cw = R.w / DAYS;
    const y = (v: number) => bottom - ((v - lo) / (hi - lo)) * (bottom - top);
    const x = (day: number) => R.x + day * cw;
    // title
    P.font(600, small);
    P.text(lab.price.toUpperCase(), R.x, R.y + 7, R.w * 0.5, "left", COL.mute);
    // settled columns (locked) and the glowing "today" column
    const settledA = step === 3 ? 1 : 0.6;
    for (let k = 0; k < d; k++) {
      ctx.fillStyle = rgba(COL.blue, 0.045 * settledA);
      ctx.fillRect(x(k) + 1, top, cw - 2, bottom - top);
    }
    const tg = ctx.createLinearGradient(0, top, 0, bottom);
    tg.addColorStop(0, rgba(COL.cyan, 0.05)); tg.addColorStop(0.5, rgba(COL.cyan, step === 3 ? 0.2 : 0.12)); tg.addColorStop(1, rgba(COL.cyan, 0.05));
    ctx.fillStyle = tg; ctx.fillRect(x(d), top, cw, bottom - top);
    ctx.fillStyle = rgba(COL.cyan, 0.8); ctx.fillRect(x(d), top, 1.5, bottom - top);
    // day ticks
    P.font(500, L.narrow ? 9 : 10);
    for (let k = 0; k < DAYS; k++) {
      if (L.narrow && k % 2 === 1 && k !== d) continue;
      P.text(String(k + 1), x(k) + cw / 2, bottom + 9, cw * 2, "center", k === d ? COL.blueD : rgba(COL.mute, 0.8));
    }
    // last settlement level (today's open): the reference of the open P&L
    const today = days[d];
    const oy = y(today.open);
    ctx.strokeStyle = rgba(COL.mute, 0.5); ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x(Math.max(0, d - 1)), oy); ctx.lineTo(x(d) + cw, oy); ctx.stroke();
    ctx.setLineDash([]);
    // path: settled closes, then today's intraday path up to now
    const pts: [number, number][] = [[x(0), y(days[0].open)]];
    for (let k = 0; k < d; k++) pts.push([x(k + 1), y(days[k].close)]);
    const steps = 18;
    const todayPts: [number, number][] = [];
    // the price holds at the last close during the settlement pause, then trades to the close
    const mu = marketU(u);
    for (let s = 0; s <= steps; s++) {
      const uu = (mu * s) / steps;
      todayPts.push([x(d) + cw * uu, y(intraday(today, uu))]);
    }
    // the sum of the settlements so far is the price change since the first open: a bracket on the settled boundary
    if (d > 0) {
      const y0 = y(days[0].open), y1 = y(days[0].open + settledThrough(days, d));
      ctx.globalAlpha = Math.max(f(1), f(3)) * 0.9;
      ctx.strokeStyle = rgba(COL.cyan, 0.6); ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x(0), y0); ctx.lineTo(x(d), y0); ctx.stroke(); ctx.setLineDash([]);
      const bx = x(d) - 4;
      ctx.strokeStyle = COL.cyan; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(bx - 3, y0); ctx.lineTo(bx, y0); ctx.lineTo(bx, y1); ctx.lineTo(bx - 3, y1); ctx.stroke();
      const sumRoom = Math.max(0, bx - R.x - 8);
      P.fit(lab.sum, sumRoom - 12, 600, L.narrow ? 9.5 : 10.5, 8);
      const sw = Math.min(P.measure(lab.sum) + 12, sumRoom);
      if (sw > 40) {
        const ly = Math.max(top + 8, Math.min(bottom - 8, (y0 + y1) / 2 + (Math.abs(y1 - y0) < 16 ? 14 : 0)));
        P.round(bx - 6 - sw, ly - 9, sw, 18, 9); ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fill();
        P.text(lab.sum, bx - 6 - sw / 2, ly, sw - 8, "center", COL.blueD);
      }
      ctx.globalAlpha = 1;
    }
    // open P&L shading between the price and today's open
    const head = todayPts[todayPts.length - 1];
    const upNow = head[1] <= oy;
    ctx.beginPath();
    ctx.moveTo(todayPts[0][0], oy);
    for (const q of todayPts) ctx.lineTo(q[0], q[1]);
    ctx.lineTo(head[0], oy); ctx.closePath();
    ctx.fillStyle = rgba(upNow ? UP : DOWN, step === 3 ? 0.26 : 0.16); ctx.fill();
    const g = ctx.createLinearGradient(R.x, 0, R.x + R.w, 0);
    g.addColorStop(0, COL.blueD); g.addColorStop(1, COL.cyan);
    ctx.strokeStyle = g; ctx.lineWidth = 2.2; ctx.lineJoin = "round";
    ctx.beginPath();
    pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
    for (const q of todayPts) ctx.lineTo(q[0], q[1]);
    ctx.stroke();
    // settlement marks at each close
    for (let k = 0; k < d; k++) {
      const cx = x(k + 1), cy = y(days[k].close);
      ctx.fillStyle = "#fff"; ctx.strokeStyle = days[k].move >= 0 ? UP : DOWN; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    // the close flash, right after a day ends
    if (d > 0 && u < 0.3) {
      const k = u / 0.3;
      ctx.strokeStyle = rgba(days[d - 1].move >= 0 ? UP : DOWN, 0.6 * (1 - k)); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x(d), y(days[d - 1].close), 4 + 14 * k, 0, Math.PI * 2); ctx.stroke();
    }
    // the open P&L meter on the right edge of the today column: today's move, and nothing older
    const mx = x(d) + cw - 5;
    ctx.globalAlpha = Math.max(f(3), 0.55);
    ctx.fillStyle = rgba(upNow ? UP : DOWN, 0.9);
    P.round(mx - 2, Math.min(oy, head[1]), 4, Math.max(2, Math.abs(head[1] - oy)), 2); ctx.fill();
    ctx.fillStyle = rgba(COL.mute, 0.7);
    ctx.fillRect(mx - 5, oy - 0.5, 10, 1);
    ctx.globalAlpha = 1;
    P.glowDot(head[0], head[1], 3.4, upNow ? UP : DOWN, 0.9);
    // row above the chart: "settled" over the locked days, "today: unsettled" over the today column
    ctx.globalAlpha = Math.max(f(3), 0.75);
    P.font(600, small);
    const tag = lab.today;
    const tw = Math.min(P.measure(tag) + 16, R.w * 0.6);
    const tx = Math.max(R.x, Math.min(R.x + R.w - tw, x(d) + cw / 2 - tw / 2));
    P.round(tx, R.y + 17, tw, 18, 9);
    ctx.fillStyle = rgba(COL.cyan, 0.14); ctx.fill();
    P.text(tag, tx + tw / 2, R.y + 26, tw - 12, "center", COL.blueD);
    const room = tx - R.x - 10;
    if (d > 0 && room > 30) {
      ctx.fillStyle = rgba(COL.blue, 0.35); ctx.fillRect(R.x, top - 5, Math.min(room, x(d) - R.x - 3), 2);
      P.font(500, small);
      P.text(`✓ ${lab.settled}`, R.x, R.y + 26, room, "left", COL.blueD);
    }
    ctx.globalAlpha = 1;
  }

  function drawSettlements(ctx: CanvasRenderingContext2D, P: Pen, lab: FuturesLabels, days: Day[], d: number, u: number, fRow: number, step: number) {
    const R = L.settle;
    const small = L.narrow ? 10 : 11;
    const cw = L.price.w / DAYS;
    const top = R.y + 20, bottom = R.y + R.h - (L.narrow ? 16 : 18);
    const mid = (top + bottom) / 2;
    ctx.globalAlpha = fRow;
    P.font(600, small);
    P.text(lab.settleRow.toUpperCase(), R.x, R.y + 7, R.w, "left", COL.mute);
    ctx.fillStyle = rgba(COL.mute, 0.28); ctx.fillRect(R.x, Math.round(mid), R.w, 1);
    let maxAbs = 0.6;
    for (const dd of days) maxAbs = Math.max(maxAbs, Math.abs(dd.move));
    const scale = (bottom - top) / 2 / maxAbs;
    const flowing = d > 0 && u < FLOW;
    for (let k = 0; k < d; k++) {
      const grow = k === d - 1 ? ease(span(u, 0, 0.35)) : 1;
      const v = days[k].long * grow;
      const h = Math.abs(v) * scale;
      const bx = R.x + k * cw + cw * 0.22, bw = cw * 0.56;
      const c = v >= 0 ? UP : DOWN;
      // the newest settlement glows while its cash is moving between the two sides
      if (flowing && k === d - 1) {
        const g = Math.sin(Math.PI * (u / FLOW));
        ctx.fillStyle = rgba(c, 0.18 * g);
        P.round(bx - 5, (v >= 0 ? mid - h : mid) - 5, bw + 10, Math.max(1, h) + 10, 5); ctx.fill();
      }
      ctx.fillStyle = rgba(c, k === d - 1 ? 0.95 : 0.7);
      P.round(bx, v >= 0 ? mid - h : mid, bw, Math.max(1, h), 2); ctx.fill();
    }
    // the realized note sits under the row
    ctx.globalAlpha = step === 3 || step === 1 ? 1 : 0.7;
    P.fit(lab.realized, R.w, 500, L.narrow ? 9.5 : 10.5, 8);
    P.text(lab.realized, R.x, R.y + R.h - 5, R.w, "left", COL.ink2);
    ctx.globalAlpha = 1;
  }

  function drawParties(ctx: CanvasRenderingContext2D, P: Pen, lab: FuturesLabels, prev: Day | null, d: number, u: number, step: number, f: (k: number) => number, sigma: number, t: number) {
    const R = L.parties;
    const small = L.narrow ? 10.5 : 11.5;
    const nodeR = L.narrow ? 24 : 30;
    // wide: the block (≈ 250 px with the chip) is centred in its column, no dead space below
    const base = L.narrow ? R.y : R.y + Math.max(0, (R.h - 250) / 2);
    const nodeY = base + (L.narrow ? 46 : 52);
    const lx = R.x + nodeR + 2, rx = R.x + R.w - nodeR - 2;
    const cx = (lx + rx) / 2;
    const x0 = lx + nodeR + 6, x1 = rx - nodeR - 6;
    // matched positions, above the clearing house
    ctx.globalAlpha = f(0);
    P.font(500, L.narrow ? 9.5 : 10.5);
    P.text(lab.matched, cx, nodeY - nodeR - 10, R.w, "center", COL.mute);
    // the day's cash settlement: coins go from the payer to the clearing house, then on to the receiver
    const flowing = !!prev && u < FLOW;
    const upDay = prev ? prev.move >= 0 : true;
    const k = flowing ? u / FLOW : 0;
    const winL = upDay; // index up: the long receives
    const color = upDay ? UP : DOWN;
    const pulseL = flowing && winL ? Math.sin(Math.PI * k) : 0, pulseR = flowing && !winL ? Math.sin(Math.PI * k) : 0;
    const node = (x: number, label: string, c: string, pulse: number) => {
      if (pulse > 0) { ctx.fillStyle = rgba(c, 0.18 * pulse); ctx.beginPath(); ctx.arc(x, nodeY, nodeR + 10 * pulse, 0, Math.PI * 2); ctx.fill(); }
      const g = ctx.createLinearGradient(x - nodeR, nodeY - nodeR, x + nodeR, nodeY + nodeR);
      g.addColorStop(0, "#fff"); g.addColorStop(1, rgba(c, 0.16));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, nodeY, nodeR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = rgba(c, 0.9); ctx.lineWidth = 1.8; ctx.stroke();
      // the label shrinks to fit inside the circle (« Acheteur », « Vendeur »)
      const room = nodeR * 2 - 8;
      P.fit(label, room, 600, L.narrow ? 11.5 : 13, 7.5);
      P.text(label, x, nodeY, room + 6, "center", COL.ink);
    };
    ctx.globalAlpha = Math.max(f(0), f(1));
    ctx.fillStyle = rgba(COL.mute, 0.14); ctx.fillRect(x0, nodeY - 1, x1 - x0, 2);
    node(lx, lab.long, COL.blue, pulseL);
    node(rx, lab.short, COL.slate, pulseR);
    // clearing house in the middle of the channel
    P.font(600, L.narrow ? 9.5 : 10.5);
    const chW = Math.min(P.measure(lab.clearing) + 20, x1 - x0 - 8);
    P.round(cx - chW / 2, nodeY - 12, chW, 24, 12);
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.strokeStyle = rgba(flowing ? color : COL.blue, flowing ? 0.7 : 0.35); ctx.lineWidth = 1.2; ctx.stroke();
    P.text(lab.clearing, cx, nodeY, chW - 12, "center", COL.blueD);
    if (flowing) {
      const from = winL ? x1 : x0, to = winL ? x0 : x1;
      const hop = (a: number, b: number, q: number) => ({ x: a + (b - a) * ease(q), y: nodeY - Math.sin(Math.PI * q) * 14 });
      for (let c = 0; c < 7; c++) {
        const q = Math.min(1, Math.max(0, k * 1.6 - c * 0.09));
        if (q <= 0 || q >= 1) continue;
        // first half: payer → clearing house; second half: clearing house → receiver
        const p = q < 0.5 ? hop(from, cx + (from > cx ? chW / 2 : -chW / 2), q * 2) : hop(cx + (to > cx ? chW / 2 : -chW / 2), to, q * 2 - 1);
        ctx.fillStyle = rgba(color, 0.9 * Math.sin(Math.PI * q));
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2); ctx.fill();
      }
      const ax = winL ? x0 : x1, dir = winL ? 1 : -1;
      ctx.fillStyle = rgba(color, 0.8 * Math.sin(Math.PI * k));
      ctx.beginPath(); ctx.moveTo(ax, nodeY); ctx.lineTo(ax + 9 * dir, nodeY - 5); ctx.lineTo(ax + 9 * dir, nodeY + 5); ctx.closePath(); ctx.fill();
    }
    // the payment rule, named after the close it settles: in with the coins, held for the whole day (long enough to read comfortably)
    if (prev) {
      ctx.globalAlpha = ruleAlpha(u);
      P.font(600, L.narrow ? 10.5 : 11.5);
      const rule = `${lab.closeDay.replace("{n}", String(d))} ${upDay ? lab.upPays : lab.downPays}`;
      const two = P.measure(rule) > R.w ? splitLabel(rule) : null;
      const ry = nodeY + nodeR + 14;
      if (two) { P.text(two[0], cx, ry, R.w, "center", color); P.text(two[1], cx, ry + 15, R.w, "center", color); }
      else P.text(rule, cx, ry, R.w, "center", color);
    }
    ctx.globalAlpha = 1;

    // margin buffers, sized to a potential one-day move (they widen with volatility)
    ctx.globalAlpha = f(2);
    const by = nodeY + nodeR + (L.narrow ? 70 : 66); // narrow: room for a two-line settlement message
    P.font(600, small);
    P.text(lab.buffer, R.x, by - 16, R.w * 0.6, "left", COL.ink);
    P.font(500, L.narrow ? 9.5 : 10.5);
    P.text(lab.bufferNote, R.x, by - 2, R.w * 0.6, "left", COL.mute);
    const hot = sigma > 1;
    P.font(600, L.narrow ? 9.5 : 10.5);
    const pill = hot ? lab.volatile : lab.calm;
    const pw = Math.min(P.measure(pill) + 18, R.w * 0.45);
    P.round(R.x + R.w - pw, by - 20, pw, 20, 10);
    ctx.fillStyle = rgba(hot ? COL.amber : COL.teal, 0.14); ctx.fill();
    P.text(pill, R.x + R.w - pw / 2, by - 10, pw - 10, "center", hot ? COL.orange : COL.teal);
    const maxM = marginFor(1.5) * 1.12;
    const track = (yy: number, label: string, c: string) => {
      const tw = R.w - 70;
      P.font(500, L.narrow ? 10 : 11);
      P.text(label, R.x, yy + 6, 64, "left", COL.ink2);
      P.round(R.x + 70, yy, tw, 12, 6); ctx.fillStyle = rgba(COL.mute, 0.1); ctx.fill();
      const w = tw * (bufEase / maxM);
      const g = ctx.createLinearGradient(R.x + 70, 0, R.x + 70 + w, 0);
      g.addColorStop(0, rgba(c, 0.55)); g.addColorStop(1, c);
      P.round(R.x + 70, yy, w, 12, 6); ctx.fillStyle = g; ctx.fill();
      const sx = R.x + 70 + ((t / 12) % Math.max(1, w + 40)) - 20;
      ctx.save(); P.round(R.x + 70, yy, w, 12, 6); ctx.clip();
      ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.fillRect(sx, yy, 14, 12); ctx.restore();
    };
    track(by + 12, lab.long, COL.blue);
    track(by + 34, lab.short, COL.slate);
    ctx.globalAlpha = 1;

    // formula chip: arrives with step 4 (the one-day-at-risk view), right under the buffers
    if (step === 3) {
      ctx.globalAlpha = Math.min(1, chipIn * 1.4);
      const fy = by + 80;
      P.fit(lab.formula, R.w - 26, 500, L.narrow ? 10 : 11.5, 8);
      const fw = Math.min(P.measure(lab.formula) + 26, R.w);
      P.round(R.x + (R.w - fw) / 2, fy - 13, fw, 26, 13);
      ctx.fillStyle = rgba(COL.blue, 0.08); ctx.fill();
      ctx.strokeStyle = rgba(COL.blue, 0.25); ctx.lineWidth = 1; ctx.stroke();
      P.text(lab.formula, R.x + R.w / 2, fy, fw - 18, "center", COL.blueD);
      ctx.globalAlpha = 1;
    }
  }

  return runScene(canvas, scene, opts);
}
