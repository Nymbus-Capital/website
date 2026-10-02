/**
 * scan-engine.ts — canvas renderer of the home "analysis scan": a dense table of generic rows streams upward
 * while a glowing scan line sweeps down it; rows above the line are resolved (numbers settled, flagged rows
 * highlighted), rows just under it flicker, rows below are pending. Framework-free; lazily imported.
 *
 *  - ~30 fps cap (20 when frames run slow), DPR capped at 1.5, a few hundred fillText calls per frame.
 *  - Runs only while the canvas is on screen and the tab is visible; one still frame under reduced motion.
 *  - `data-frames` / `data-running` on the host let tests observe it.
 */
import { SECTORS, columnsFor, flicker, fmtNum, fmtZ, groupDigits, hash01, layout, rowAt, scanProgress, type Column, type Lang } from "./scan-model.ts";

export interface ScanOptions {
  still?: boolean;
  lang: () => Lang;
  /** elements that receive the live counters (textContent) */
  counters?: { datapoints?: HTMLElement | null; securities?: HTMLElement | null; signals?: HTMLElement | null };
  /** called once after the first frame */
  onReady?: () => void;
}

export interface Scan { destroy(): void; redraw(): void }

const MONO = `ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`;
const SANS = `"Poppins", ui-sans-serif, system-ui, sans-serif`;
const INK = "#1f1f1f", INK2 = "#444746", MUTE = "#5f6368", BLUE = "#1a73e8", BLUE_D = "#0b57d0", CYAN = "#00a3e0", ORANGE = "#c2410c";

export function createScan(canvas: HTMLCanvasElement, opts: ScanOptions): Scan {
  const ctx = canvas.getContext("2d", { alpha: true });
  const host = canvas.parentElement ?? canvas;
  if (!ctx) return { destroy() {}, redraw() {} };

  let W = 0, H = 0, dpr = 1, rowH = 26, headH = 34, pad = 16;
  let cols: Column[] = [];
  let lay: { x: number; w: number }[] = [];
  let raf = 0, running = false, onscreen = false, visible = document.visibilityState === "visible";
  let clock = 0, last = 0, frames = 0, slow = 0, minGap = 1000 / 30;
  let scroll = 0;
  let crossedRows = 0, datapoints = 0, signals = 0, lastScanY = -1, lastCycle = 0;
  let lastCounterWrite = 0;
  const pointer = { y: -1, active: false };

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const narrow = W < 560;
    rowH = narrow ? 28 : W < 900 ? 26 : 27; headH = narrow ? 32 : 36; pad = narrow ? 12 : 20;
    cols = columnsFor(W);
    lay = layout(cols, W, pad);
  }

  function put(text: string, x: number, y: number, c: Column, w: number) {
    ctx!.textAlign = c.align === "r" ? "right" : c.align === "c" ? "center" : "left";
    const px = c.align === "r" ? x + w - 8 : c.align === "c" ? x + w / 2 : x + 4;
    ctx!.fillText(text, px, y);
  }

  function draw(now: number, scanK: number, scrollPx: number, tick: number, cycle: number) {
    const lang = opts.lang();
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, W, H);
    const bodyTop = headH, bodyH = H - headH;
    const scanY = bodyTop + scanK * bodyH;
    const baseRow = Math.floor(scrollPx / rowH);
    const frac = scrollPx - baseRow * rowH;
    const nRows = Math.ceil(bodyH / rowH) + 2;
    const fs = W < 560 ? 12 : 13;

    // header
    ctx!.font = `600 ${W < 560 ? 10.5 : 11.5}px ${SANS}`;
    ctx!.textBaseline = "middle";
    ctx!.fillStyle = MUTE;
    cols.forEach((c, i) => put(c.label[lang].toUpperCase(), lay[i].x, headH / 2, c, lay[i].w));
    ctx!.fillStyle = "rgba(26,115,232,.18)";
    ctx!.fillRect(pad, headH - 1, W - 2 * pad, 1);

    ctx!.font = `500 ${fs}px ${MONO}`;
    for (let i = 0; i < nRows; i++) {
      const n = baseRow + i;
      const y = bodyTop + i * rowH - frac;
      const yc = y + rowH / 2;
      if (yc < bodyTop - 2 || y > H) continue;
      const row = rowAt(n);
      const dist = scanY - yc; // > 0: the line has passed this row
      const settle = dist <= 0 ? 0 : Math.min(1, dist / (rowH * 2.2));
      const resolved = settle >= 1;
      const near = dist > -rowH * 0.5 && dist < rowH * 2.2;
      const hovered = pointer.active && Math.abs(pointer.y - yc) < rowH / 2;

      if (row.hit && dist > 0) {
        const a = 0.12 * Math.min(1, dist / (rowH * 1.2)) + (dist < rowH * 6 ? 0.1 * (1 - dist / (rowH * 6)) : 0);
        ctx!.fillStyle = `rgba(0,163,224,${a.toFixed(3)})`;
        ctx!.fillRect(pad - 6, y + 1, W - 2 * pad + 12, rowH - 2);
        ctx!.fillStyle = row.score >= 0 ? BLUE : ORANGE;
        ctx!.fillRect(pad - 6, y + 3, 3, rowH - 6);
      } else if (hovered) {
        ctx!.fillStyle = "rgba(26,115,232,.06)";
        ctx!.fillRect(pad - 6, y + 1, W - 2 * pad + 12, rowH - 2);
      }
      ctx!.globalAlpha = dist <= 0 ? 0.3 : 1;

      cols.forEach((c, ci) => {
        const x = lay[ci].x, w = lay[ci].w;
        const amp = near ? 1.6 : 0;
        switch (c.kind) {
          case "id":
            ctx!.fillStyle = resolved ? INK : INK2;
            put(row.id, x, yc, c, w);
            break;
          case "sector":
            ctx!.fillStyle = INK2;
            ctx!.font = `400 ${fs}px ${SANS}`;
            put(SECTORS[row.sector][lang], x, yc, c, w);
            ctx!.font = `500 ${fs}px ${MONO}`;
            break;
          case "num": {
            const v = c.key === "term" ? row.term : row.spread;
            const shown = dist <= 0 ? v * (0.85 + 0.3 * hash01(n, ci, tick >> 2)) : flicker(v, n, ci, tick, settle, c.key === "term" ? 2 * amp : 40 * amp);
            ctx!.fillStyle = INK2;
            put(c.key === "term" ? fmtNum(Math.max(0.1, shown), 1, lang) : String(Math.max(1, Math.round(shown))), x, yc, c, w);
            break;
          }
          case "z": {
            const fi = Number(c.key.slice(1));
            const base = row.z[fi];
            const v = dist <= 0 ? base * (0.5 + hash01(n, ci, tick >> 2)) : flicker(base, n, ci, tick, settle, amp);
            const strong = resolved && Math.abs(v) > 1.1;
            ctx!.fillStyle = !resolved ? INK2 : strong ? (v > 0 ? BLUE_D : ORANGE) : INK2;
            ctx!.font = `${strong ? 700 : 500} ${fs}px ${MONO}`;
            put(fmtZ(v, lang), x, yc, c, w);
            ctx!.font = `500 ${fs}px ${MONO}`;
            break;
          }
          case "signal": {
            const bw = Math.min(w * 0.46, 84), cx = x + w / 2 - (row.hit ? 18 : 0), by = yc - 3;
            const len = (resolved || near ? row.score * (resolved ? 1 : settle) : 0) * bw;
            ctx!.fillStyle = "rgba(95,99,104,.18)";
            ctx!.fillRect(cx - bw, yc - 0.5, bw * 2, 1);
            if (len !== 0) {
              const g = ctx!.createLinearGradient(cx, 0, cx + len, 0);
              g.addColorStop(0, len > 0 ? "rgba(26,115,232,.35)" : "rgba(194,65,12,.3)");
              g.addColorStop(1, len > 0 ? BLUE : ORANGE);
              ctx!.fillStyle = g;
              ctx!.fillRect(Math.min(cx, cx + len), by, Math.abs(len), 6);
            }
            if (row.hit && dist > 0) {
              const pw = 50, px = cx + bw + 8;
              if (px + pw < x + w + 4 || W >= 560) {
                ctx!.fillStyle = row.score >= 0 ? "rgba(26,115,232,.12)" : "rgba(194,65,12,.12)";
                ctx!.beginPath();
                if (ctx!.roundRect) ctx!.roundRect(px, yc - 9, pw, 18, 9); else ctx!.rect(px, yc - 9, pw, 18);
                ctx!.fill();
                ctx!.fillStyle = row.score >= 0 ? BLUE_D : ORANGE;
                ctx!.font = `600 9.5px ${SANS}`;
                ctx!.textAlign = "center";
                ctx!.fillText("SIGNAL", px + pw / 2, yc + 0.5);
                ctx!.font = `500 ${fs}px ${MONO}`;
              }
            }
            break;
          }
        }
      });
      ctx!.globalAlpha = 1;
    }

    // scan line: trailing glow above, bright core, leading dots at both ends
    const gl = ctx!.createLinearGradient(0, scanY - 110, 0, scanY);
    gl.addColorStop(0, "rgba(0,163,224,0)");
    gl.addColorStop(1, "rgba(26,115,232,.17)");
    ctx!.fillStyle = gl;
    ctx!.fillRect(0, Math.max(bodyTop - 4, scanY - 110), W, Math.min(110, scanY - bodyTop + 4));
    const lg = ctx!.createLinearGradient(0, 0, W, 0);
    lg.addColorStop(0, "rgba(26,115,232,0)");
    lg.addColorStop(0.12, "rgba(26,115,232,.95)");
    lg.addColorStop(0.7, "rgba(0,163,224,1)");
    lg.addColorStop(1, "rgba(0,163,224,.25)");
    ctx!.save();
    ctx!.shadowColor = "rgba(0,163,224,.9)";
    ctx!.shadowBlur = 14;
    ctx!.fillStyle = lg;
    ctx!.fillRect(0, scanY - 1, W, 2);
    ctx!.restore();
    for (const x of [pad - 6, W - pad + 6]) {
      ctx!.fillStyle = "#fff";
      ctx!.beginPath(); ctx!.arc(x, scanY, 3.2, 0, Math.PI * 2); ctx!.fill();
      ctx!.strokeStyle = CYAN; ctx!.lineWidth = 1.5; ctx!.stroke();
    }
    void cycle;
    return { scanY, baseRow, frac };
  }

  function counters(scanY: number, baseRow: number, frac: number, cycle: number, force = false) {
    // rows the line has crossed since the animation started (cumulative; a new sweep counts the visible rows again)
    if (cycle !== lastCycle) { lastCycle = cycle; lastScanY = headH; }
    if (lastScanY < 0) lastScanY = scanY;
    const dy = scanY - lastScanY;
    if (dy > 0) {
      const before = Math.floor((lastScanY - headH) / rowH), after = Math.floor((scanY - headH) / rowH);
      for (let r = before + 1; r <= after; r++) {
        const idx = baseRow + Math.floor((headH + r * rowH - headH + frac) / rowH);
        crossedRows++;
        datapoints += cols.length - 1; // every column but the identifier holds a data point
        if (rowAt(idx).hit) signals++;
      }
    }
    lastScanY = scanY;
    const t = performance.now();
    if (!force && t - lastCounterWrite < 120) return;
    lastCounterWrite = t;
    const lang = opts.lang();
    const c = opts.counters;
    if (c?.datapoints) c.datapoints.textContent = groupDigits(datapoints, lang);
    if (c?.securities) c.securities.textContent = groupDigits(crossedRows, lang);
    if (c?.signals) c.signals.textContent = groupDigits(signals, lang);
  }

  function frame(now: number) {
    const p = scanProgress(clock);
    const tick = Math.floor(clock / 90);
    const r = draw(now, p.k, scroll, tick, p.cycle);
    counters(r.scanY, r.baseRow, r.frac, p.cycle);
    frames++;
    host.setAttribute("data-frames", String(frames));
  }

  function still() {
    // reduced motion: one frame, the scan frozen two thirds down, counters set to what that frame shows
    resize();
    const k = 0.66;
    const r = draw(0, k, 0, 0, 0);
    const bodyH = H - headH;
    const rowsDone = Math.max(0, Math.floor((k * bodyH) / rowH));
    let sig = 0;
    for (let i = 0; i < rowsDone; i++) if (rowAt(i).hit) sig++;
    crossedRows = rowsDone; datapoints = rowsDone * (cols.length - 1); signals = sig;
    void r;
    const lang = opts.lang();
    const c = opts.counters;
    if (c?.datapoints) c.datapoints.textContent = groupDigits(datapoints, lang);
    if (c?.securities) c.securities.textContent = groupDigits(crossedRows, lang);
    if (c?.signals) c.signals.textContent = groupDigits(signals, lang);
    host.setAttribute("data-frames", "1");
    host.setAttribute("data-running", "false");
  }

  const loop = (now: number) => {
    raf = 0;
    if (!running) return;
    const dt = last ? Math.min(100, now - last) : 16;
    if (last && dt < minGap - 2) { raf = requestAnimationFrame(loop); return; }
    last = now;
    // adaptive: sustained slow frames → fewer frames per second
    if (dt > 52) { slow++; if (slow > 20 && minGap < 50) minGap = 1000 / 20; } else slow = Math.max(0, slow - 1);
    clock += dt;
    // one page of rows per sweep: every sweep screens rows it has not screened before
    scroll += dt * ((H - headH) / 5700);
    frame(now);
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
  if (opts.still) { still(); opts.onReady?.(); }

  const ro = typeof ResizeObserver !== "undefined"
    ? new ResizeObserver(() => { resize(); if (opts.still) still(); else if (!running) frame(performance.now()); })
    : null;
  ro?.observe(canvas);
  const io = typeof IntersectionObserver !== "undefined"
    ? new IntersectionObserver((es) => {
        onscreen = es.some((e) => e.isIntersecting);
        if (onscreen) { start(); } else stop();
      }, { threshold: 0.05 })
    : null;
  if (io) io.observe(canvas); else { onscreen = true; start(); }
  const onVis = () => { visible = document.visibilityState === "visible"; if (visible) start(); else stop(); };
  document.addEventListener("visibilitychange", onVis);
  const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); pointer.y = e.clientY - r.top; pointer.active = e.pointerType !== "touch"; };
  const onLeave = () => { pointer.active = false; };
  if (!opts.still) {
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
  }
  if (!opts.still) { frame(performance.now()); opts.onReady?.(); }

  return {
    redraw() { if (opts.still) still(); else if (!running) frame(performance.now()); },
    destroy() {
      stop();
      ro?.disconnect();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    },
  };
}
