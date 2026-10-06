/**
 * datafield-engine.ts — "data field" backdrop: a lattice of dots that light up in travelling waves, with a slow
 * diagonal sweep and a lift under the pointer. Canvas 2D, dots batched by alpha bucket, ~24 fps, DPR ≤ 1.5,
 * paused off-screen and while the tab is hidden, one still frame under reduced motion. Framework-free, lazily imported.
 */
export interface DataField { destroy(): void }

interface DataFieldOptions {
  still?: boolean;
  /** 0..1 overall strength */
  strength?: number;
  /** dot spacing in CSS px (default 28, 32 on phones) */
  gap?: number;
  /** frame-rate ceiling (default 26; 15 on coarse pointers) */
  maxFps?: number;
}

const BUCKETS = 7;

export function createDataField(canvas: HTMLCanvasElement, opts: DataFieldOptions = {}): DataField {
  const ctx = canvas.getContext("2d", { alpha: true });
  const host = canvas.parentElement ?? canvas;
  if (!ctx) return { destroy() {} };
  const strength = opts.strength ?? 1;
  const minGap = 1000 / Math.max(5, Math.min(60, opts.maxFps ?? 26)) - 2;
  let W = 0, H = 0, dpr = 1, gap = 28, cols = 0, rows = 0;
  let raf = 0, running = false, onscreen = false, visible = document.visibilityState === "visible";
  let clock = 0, last = 0, frames = 0, nextPulse = 0;
  const pulses: { x: number; y: number; t0: number }[] = [];
  const pointer = { x: -1e4, y: -1e4, a: 0, ta: 0 };
  const lists: Uint32Array[] = [];

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    gap = opts.gap ?? (W < 600 ? 32 : 28);
    cols = Math.ceil(W / gap) + 1; rows = Math.ceil(H / gap) + 1;
    const n = cols * rows;
    for (let b = 0; b < BUCKETS; b++) lists[b] = new Uint32Array(n);
  }

  function draw(t: number) {
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, W, H);
    const counts = new Array<number>(BUCKETS).fill(0);
    const sweep = ((t * 0.00012) % 1.6) - 0.3; // diagonal band, fraction of the diagonal
    const diag = W + H;
    pointer.a += (pointer.ta - pointer.a) * 0.08;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const x = i * gap, y = j * gap;
        let v = 0.16;
        for (const p of pulses) {
          const age = (t - p.t0) / 1000;
          if (age < 0 || age > 3) continue;
          const d = Math.hypot(x - p.x, y - p.y);
          const front = age * 230;
          const w = (d - front) / 46;
          v += Math.exp(-w * w) * (1 - age / 3) * 0.95;
        }
        const s = (x + y) / diag - sweep;
        v += Math.exp(-s * s * 90) * 0.55;
        if (pointer.a > 0.01) {
          const d2 = ((x - pointer.x) ** 2 + (y - pointer.y) ** 2) / (140 * 140);
          v += Math.exp(-d2) * 0.8 * pointer.a;
        }
        // a quiet twinkle so the lattice is never still
        v += 0.05 * Math.sin(t * 0.0011 + (i * 12.9898 + j * 78.233) % 6.283);
        const b = Math.max(0, Math.min(BUCKETS - 1, Math.floor(v * strength * BUCKETS * 0.75)));
        lists[b][counts[b]++] = j * cols + i;
      }
    }
    for (let b = 0; b < BUCKETS; b++) {
      if (!counts[b]) continue;
      const k = b / (BUCKETS - 1);
      const size = 1.5 + 2.1 * k;
      ctx!.fillStyle = k > 0.7 ? `rgba(0,163,224,${(0.35 + 0.5 * k).toFixed(2)})` : `rgba(26,115,232,${(0.09 + 0.4 * k).toFixed(2)})`;
      const list = lists[b];
      for (let m = 0; m < counts[b]; m++) {
        const idx = list[m];
        const x = (idx % cols) * gap, y = Math.floor(idx / cols) * gap;
        ctx!.fillRect(x - size / 2, y - size / 2, size, size);
      }
    }
  }

  function frame() {
    if (clock >= nextPulse) {
      pulses.push({ x: Math.random() * W, y: Math.random() * H, t0: clock });
      if (pulses.length > 4) pulses.shift();
      nextPulse = clock + 2300 + Math.random() * 1800;
    }
    draw(clock);
    frames++;
    host.setAttribute("data-frames", String(frames));
  }

  const loop = (now: number) => {
    raf = 0;
    if (!running) return;
    const dt = last ? Math.min(100, now - last) : 16;
    if (last && dt < minGap) { raf = requestAnimationFrame(loop); return; }
    last = now;
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
  host.setAttribute("data-running", "false");
  if (opts.still) {
    pulses.push({ x: W * 0.72, y: H * 0.42, t0: 0 }, { x: W * 0.3, y: H * 0.75, t0: -900 });
    draw(1200);
    host.setAttribute("data-frames", "1");
  } else {
    clock = 600;
    pulses.push({ x: W * 0.7, y: H * 0.45, t0: 0 });
    nextPulse = 2200;
    frame();
  }

  const ro = typeof ResizeObserver !== "undefined"
    ? new ResizeObserver(() => { resize(); if (opts.still) draw(1200); else if (!running) draw(clock); })
    : null;
  ro?.observe(canvas);
  const io = typeof IntersectionObserver !== "undefined"
    ? new IntersectionObserver((es) => { onscreen = es.some((e) => e.isIntersecting); if (onscreen) start(); else stop(); }, { threshold: 0 })
    : null;
  if (io) io.observe(canvas); else { onscreen = true; start(); }
  const onVis = () => { visible = document.visibilityState === "visible"; if (visible) start(); else stop(); };
  document.addEventListener("visibilitychange", onVis);
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.ta = 1;
  };
  const onLeave = () => { pointer.ta = 0; };
  // the canvas sits behind the content: listen on the section that hosts it
  const track = (canvas.closest("header, section") as HTMLElement | null) ?? host;
  if (!opts.still) {
    track.addEventListener("pointermove", onMove, { passive: true });
    track.addEventListener("pointerleave", onLeave);
  }

  return {
    destroy() {
      stop();
      ro?.disconnect();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerleave", onLeave);
    },
  };
}
