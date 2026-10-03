/**
 * runner.ts — shared canvas loop of the /critical-concepts animations, same motion contract as the home scan and
 * engines panels: DPR capped at 1.5, ~30 fps cap (20 when frames run slow, lower `maxFps` on coarse pointers),
 * runs only while the canvas is on screen, the tab is visible and the visitor has not paused it; one still frame
 * per step under reduced motion / Data Saver. A scene draws a time `t` (ms, absolute clock); the runner maps it to a
 * step of the scene's cycle and lets the controls jump between steps. Test hooks on the host: data-frames,
 * data-running, data-step. Framework-free; imported lazily with each engine.
 */
import { cycleMs, stepAt, stepStarts } from "./timeline.ts";

export interface Scene {
  /** durations (ms) of the steps of one cycle */
  steps: readonly number[];
  /** clock time shown for a step's still frame (reduced motion, or a step chosen while paused) */
  stillAt(step: number): number;
  resize(W: number, H: number): void;
  draw(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, still: boolean): void;
}

export interface RunnerOptions {
  still?: boolean;
  maxFps?: number;
  onReady?: () => void;
  onStep?: (step: number) => void;
}

export interface Runner {
  destroy(): void;
  redraw(): void;
  setPlaying(on: boolean): void;
  goto(step: number): void;
}

export function runScene(canvas: HTMLCanvasElement, scene: Scene, opts: RunnerOptions): Runner {
  const ctx = canvas.getContext("2d", { alpha: true });
  const host = canvas.parentElement ?? canvas;
  if (!ctx) return { destroy() {}, redraw() {}, setPlaying() {}, goto() {} };
  const total = cycleMs(scene.steps);
  const starts = stepStarts(scene.steps);
  let W = 1, H = 1, dpr = 1;
  let raf = 0, running = false, onscreen = false, visible = document.visibilityState === "visible";
  let userPaused = false, dead = false;
  let clock = opts.still ? scene.stillAt(scene.steps.length - 1) : 0;
  let last = 0, frames = 0, slow = 0, minGap = 1000 / Math.max(5, Math.min(60, opts.maxFps ?? 30));
  let step = -1;

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    scene.resize(W, H);
  }

  function frame(still = false) {
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, W, H);
    scene.draw(ctx!, W, H, clock, still);
    frames = still ? 1 : frames + 1;
    host.setAttribute("data-frames", String(frames));
    const s = stepAt(clock, scene.steps).step;
    if (s !== step) { step = s; host.setAttribute("data-step", String(s)); opts.onStep?.(s); }
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
    if (running || opts.still || userPaused || !visible || !onscreen || dead) return;
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
  frame(opts.still);
  opts.onReady?.();

  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => { resize(); if (!running) frame(opts.still); }) : null;
  ro?.observe(canvas);
  const io = typeof IntersectionObserver !== "undefined"
    ? new IntersectionObserver((es) => { onscreen = es.some((e) => e.isIntersecting); if (onscreen) start(); else stop(); }, { threshold: 0.05 })
    : null;
  if (io) io.observe(canvas); else { onscreen = true; start(); }
  const onVis = () => { visible = document.visibilityState === "visible"; if (visible) start(); else stop(); };
  document.addEventListener("visibilitychange", onVis);

  const redraw = () => { if (!dead && !running) frame(opts.still); };
  try {
    const fonts = document.fonts;
    if (fonts?.load) void Promise.all(["500", "600"].map((w) => fonts.load(`${w} 12px Poppins`))).then(redraw, () => undefined);
  } catch { /* no font API: keep the fallback font */ }

  return {
    redraw,
    setPlaying(on: boolean) {
      if (opts.still) return;
      userPaused = !on;
      if (on) start(); else { stop(); frame(); }
    },
    goto(s: number) {
      const k = Math.max(0, Math.min(scene.steps.length - 1, s));
      if (opts.still || userPaused) clock = scene.stillAt(k);
      else clock = Math.floor(clock / total) * total + starts[k] + 1;
      step = -1;
      frame(opts.still);
    },
    destroy() {
      dead = true;
      stop();
      ro?.disconnect();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    },
  };
}
