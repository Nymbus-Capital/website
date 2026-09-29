/**
 * "Bond universe": a living yield-curve × credit surface drawn with a few thousand glowing points.
 *
 *  - x axis: term to maturity (0 → 30 years), z axis: credit quality (AAA → BB), height: yield.
 *  - The surface "breathes": its level, slope and curvature (Nelson-Siegel factors) and the credit
 *    spreads drift slowly, like a market through regimes. A pulse of light travels along the curves.
 *  - The pointer lifts the surface under it and tilts the camera; clicks send a ripple.
 *  - Additive blending, one pre-rendered glow sprite per colour, DPR-aware (capped at 2).
 *  - Pauses when offscreen or when the tab is hidden; draws one still frame under reduced motion.
 *
 * Framework-free (plain DOM + canvas 2D) so it can be prototyped outside React.
 */

export interface BondUniverseOptions {
  /** force one still frame (prefers-reduced-motion) */
  still?: boolean;
  /** 0..1, density multiplier (auto-lowered on small screens / slow frames) */
  density?: number;
  /** called once after the first frame has been painted */
  onReady?: () => void;
}

export interface BondUniverse { destroy(): void; }

// brand ramp (dark keynote): deep blue → blue → cyan → ice
const RAMP: [number, number, number][] = [
  [26, 92, 255], [76, 141, 255], [79, 209, 255], [200, 236, 255],
];
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
function ramp(k: number): [number, number, number] {
  const x = Math.min(0.9999, Math.max(0, k)) * (RAMP.length - 1);
  const i = Math.floor(x), f = x - i;
  const a = RAMP[i], b = RAMP[i + 1];
  return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];
}

/** Soft round glow sprite. */
function sprite(rgb: [number, number, number], size: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const r = size / 2;
  const grd = g.createRadialGradient(r, r, 0, r, r, r);
  const [R, G, B] = rgb.map(Math.round);
  grd.addColorStop(0, `rgba(255,255,255,1)`);
  grd.addColorStop(0.12, `rgba(${R},${G},${B},0.95)`);
  grd.addColorStop(0.35, `rgba(${R},${G},${B},0.28)`);
  grd.addColorStop(1, `rgba(${R},${G},${B},0)`);
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return c;
}

export function createBondUniverse(canvas: HTMLCanvasElement, opts: BondUniverseOptions = {}): BondUniverse {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return { destroy() {} };

  const SPRITES = 12;
  const sprites = Array.from({ length: SPRITES }, (_, i) => sprite(ramp(i / (SPRITES - 1)), 64));

  let W = 0, H = 0, dpr = 1;
  let cols = 0, rows = 0;
  let density = opts.density ?? 1;
  // per point: term (0..1), credit (0..1), jitter
  let pts: Float32Array = new Float32Array(0);
  // projected: x, y, size, alpha, spriteIndex, depth
  let proj: Float32Array = new Float32Array(0);
  let order: Uint32Array = new Uint32Array(0);

  // sparse floating "data dust" for depth
  let dust: Float32Array = new Float32Array(0);
  const pointer = { x: 0.62, y: 0.55, tx: 0.62, ty: 0.55, active: 0, tactive: 0 };
  const ripples: { x: number; y: number; t0: number }[] = [];

  function build() {
    const small = W < 700;
    const base = small ? 0.55 : W < 1100 ? 0.8 : 1;
    const k = Math.max(0.35, Math.min(1, base * density));
    cols = Math.round(96 * k);
    rows = Math.round(34 * Math.sqrt(k));
    const n = cols * rows;
    pts = new Float32Array(n * 3);
    let p = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // maturities are denser at the short end, like the real bond universe
        const u = c / (cols - 1);
        pts[p++] = Math.pow(u, 1.35);
        pts[p++] = r / (rows - 1);
        pts[p++] = Math.random();
      }
    }
    proj = new Float32Array(n * 6);
    order = new Uint32Array(n);
    const nd = Math.round((small ? 70 : 160) * k);
    dust = new Float32Array(nd * 4);
    for (let i = 0; i < nd; i++) { dust[i * 4] = Math.random(); dust[i * 4 + 1] = Math.random(); dust[i * 4 + 2] = 0.3 + Math.random(); dust[i * 4 + 3] = Math.random(); }
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    build();
  }

  /** Nelson-Siegel-ish curve + credit spread, all in "screen yield units" (0..1). */
  function yieldAt(m: number, q: number, t: number) {
    const level = 0.42 + 0.06 * Math.sin(t * 0.00011) + 0.03 * Math.sin(t * 0.00027 + 1.3);
    const slope = -0.34 + 0.16 * Math.sin(t * 0.00009 + 0.4);           // negative: upward sloping curve
    const curv = 0.22 * Math.sin(t * 0.00013 + 2.1);
    const tau = 0.18;
    const x = Math.max(1e-3, m / tau);
    const f1 = (1 - Math.exp(-x)) / x;
    const f2 = f1 - Math.exp(-x);
    const spread = q * q * (0.26 + 0.07 * Math.sin(t * 0.00017 + q * 3)) + q * 0.05;
    return level + slope * f1 + curv * f2 + spread;
  }

  function frame(now: number) {
    const t = now;
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    pointer.active += (pointer.tactive - pointer.active) * 0.05;

    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, W, H);
    ctx!.globalCompositeOperation = "lighter";

    // camera: slow yaw oscillation + pointer parallax
    const yaw = -0.5 + 0.12 * Math.sin(t * 0.00006) + (pointer.x - 0.5) * 0.22 * pointer.active;
    const pitch = 0.36 + (pointer.y - 0.5) * 0.1 * pointer.active;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const narrow = W < 700;
    const scale = Math.min(W * (narrow ? 1.05 : 0.56), H * 1.15);
    const cx0 = W * (narrow ? 0.56 : 0.7), cy0 = H * (narrow ? 0.34 : 0.54);
    const fov = 2.6;

    // travelling pulse (a "trade" of light running down the curve), and a credit sweep
    const pulseM = ((t * 0.00007) % 1.3) - 0.15;
    const sweepQ = (Math.sin(t * 0.00021) + 1) / 2;

    const n = cols * rows;
    for (let i = 0; i < n; i++) {
      const m = pts[i * 3], q = pts[i * 3 + 1], j = pts[i * 3 + 2];
      const h = yieldAt(m, q, t);
      // twinkle: brightness only, so the surface itself stays smooth
      const tw = 0.75 + 0.25 * Math.sin(t * 0.0016 + j * 60);
      // world coordinates centered
      const wx = (m - 0.5) * 1.9;
      const wz = (q - 0.5) * 1.05;
      let wy = -(h - 0.45) * 1.55;
      // rotate (yaw around y, then pitch around x)
      let x = wx * cy - wz * sy;
      let z = wx * sy + wz * cy;
      let y = wy * cp - z * sp;
      z = wy * sp + z * cp;
      const persp = fov / (fov + z + 1.2);
      let sx = cx0 + x * scale * persp;
      let syy = cy0 + y * scale * persp;

      // pointer lift: points near the pointer rise and brighten
      let glow = 0;
      if (pointer.active > 0.01) {
        const dx = sx - pointer.x * W, dy = syy - pointer.y * H;
        const d2 = (dx * dx + dy * dy) / (W * W * 0.012);
        const g = Math.exp(-d2) * pointer.active;
        syy -= g * 26;
        glow += g * 0.9;
      }
      // ripples
      for (const r of ripples) {
        const age = (t - r.t0) / 1000;
        const dx = sx - r.x, dy = syy - r.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const front = age * 520;
        const w = Math.exp(-Math.pow((d - front) / 38, 2)) * Math.max(0, 1 - age / 1.6);
        syy -= w * 16;
        glow += w * 0.8;
      }
      // pulse along maturities, strongest on the swept credit band
      const pm = Math.exp(-Math.pow((m - pulseM) / 0.035, 2));
      const pq = Math.exp(-Math.pow((q - sweepQ) / 0.22, 2));
      glow += pm * (0.35 + 0.65 * pq);

      const depth = Math.min(1, Math.max(0, (z + 1.1) / 2.2)); // 0 near, 1 far
      const o = i * 6;
      proj[o] = sx;
      proj[o + 1] = syy;
      proj[o + 2] = (1.5 + 2.6 * persp * persp) * (1 + glow * 1.4) * (narrow ? 0.9 : 1);
      proj[o + 3] = Math.min(1, (0.16 + 0.55 * (1 - depth)) * (0.55 + 0.45 * (1 - q * 0.4)) * tw + glow * 0.7);
      // colour: along credit (AAA blue → BB cyan) lifted to ice where it glows
      proj[o + 4] = Math.min(SPRITES - 1, Math.round((q * 0.72 + glow * 0.5 + m * 0.12) * (SPRITES - 1)));
      proj[o + 5] = z;
      order[i] = i;
    }

    // faint curve lines every few credit rows (structure, drawn under the points)
    ctx!.globalCompositeOperation = "lighter";
    ctx!.lineWidth = 1;
    const step = Math.max(3, Math.round(rows / 7));
    for (let r = 0; r < rows; r += step) {
      const [R, G, B] = ramp(r / (rows - 1) * 0.8);
      ctx!.strokeStyle = `rgba(${R | 0},${G | 0},${B | 0},0.11)`;
      ctx!.beginPath();
      for (let c = 0; c < cols; c++) {
        const o = (r * cols + c) * 6;
        if (c === 0) ctx!.moveTo(proj[o], proj[o + 1]); else ctx!.lineTo(proj[o], proj[o + 1]);
      }
      ctx!.stroke();
    }
    // the swept credit curve: a bright light trail
    {
      const r = Math.round(sweepQ * (rows - 1));
      const g = ctx!.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, "rgba(26,115,232,0)");
      g.addColorStop(0.35, "rgba(76,141,255,0.45)");
      g.addColorStop(0.8, "rgba(79,209,255,0.55)");
      g.addColorStop(1, "rgba(232,244,255,0.2)");
      ctx!.strokeStyle = g;
      ctx!.lineWidth = 1.6;
      ctx!.shadowColor = "rgba(79,209,255,0.9)";
      ctx!.shadowBlur = 12;
      ctx!.beginPath();
      for (let c = 0; c < cols; c++) {
        const o = (r * cols + c) * 6;
        if (c === 0) ctx!.moveTo(proj[o], proj[o + 1]); else ctx!.lineTo(proj[o], proj[o + 1]);
      }
      ctx!.stroke();
      ctx!.shadowBlur = 0;
    }

    // dust drifting up slowly, parallax with the pointer
    for (let i = 0; i < dust.length / 4; i++) {
      const sp2 = dust[i * 4 + 2];
      const x = ((dust[i * 4] + (pointer.x - 0.5) * 0.02 * sp2) % 1) * W;
      const y = (((dust[i * 4 + 1] - t * 0.000012 * sp2) % 1) + 1) % 1 * H;
      const a = 0.08 + 0.22 * (0.5 + 0.5 * Math.sin(t * 0.001 + dust[i * 4 + 3] * 20));
      const s = 3 + 5 * sp2;
      ctx!.globalAlpha = a;
      ctx!.drawImage(sprites[Math.round(dust[i * 4 + 3] * (SPRITES - 1))], x - s / 2, y - s / 2, s, s);
    }

    // points (far first)
    order.sort((a, b) => proj[b * 6 + 5] - proj[a * 6 + 5]);
    for (let k = 0; k < n; k++) {
      const o = order[k] * 6;
      const s = proj[o + 2] * 4.2;
      ctx!.globalAlpha = proj[o + 3];
      ctx!.drawImage(sprites[proj[o + 4]], proj[o] - s / 2, proj[o + 1] - s / 2, s, s);
    }
    ctx!.globalAlpha = 1;
    ctx!.globalCompositeOperation = "source-over";

    while (ripples.length && t - ripples[0].t0 > 1700) ripples.shift();
  }

  // ------------------------------------------------------------------ loop, visibility, input
  let raf = 0, running = false, visible = true, onscreen = true, readyFired = false;
  let last = 0, slow = 0;
  const loop = (now: number) => {
    raf = 0;
    if (!running) return;
    const dt = last ? now - last : 16;
    last = now;
    // adaptive density: sustained slow frames → fewer points
    if (dt > 34) { slow++; if (slow > 40 && density > 0.4) { density *= 0.8; build(); slow = 0; } } else slow = Math.max(0, slow - 1);
    frame(now);
    if (!readyFired) { readyFired = true; opts.onReady?.(); }
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (running || opts.still || !visible || !onscreen) return;
    running = true; last = 0;
    raf = requestAnimationFrame(loop);
  };
  const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; };

  resize();
  if (opts.still) {
    frame(18000);
    opts.onReady?.();
  } else {
    start();
  }

  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => { resize(); if (opts.still) frame(18000); }) : null;
  ro?.observe(canvas);
  const io = typeof IntersectionObserver !== "undefined"
    ? new IntersectionObserver((es) => { onscreen = es.some((e) => e.isIntersecting); if (onscreen) start(); else stop(); }, { threshold: 0 })
    : null;
  io?.observe(canvas);
  const onVis = () => { visible = document.visibilityState === "visible"; if (visible) start(); else stop(); };
  document.addEventListener("visibilitychange", onVis);

  const host = canvas.parentElement ?? canvas;
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.tx = (e.clientX - r.left) / r.width;
    pointer.ty = (e.clientY - r.top) / r.height;
    pointer.tactive = e.pointerType === "touch" ? 0.6 : 1;
  };
  const onLeave = () => { pointer.tactive = 0; };
  const onDown = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t0: performance.now() });
    if (ripples.length > 4) ripples.shift();
  };
  if (!opts.still) {
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);
  }

  return {
    destroy() {
      stop();
      ro?.disconnect();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
    },
  };
}
