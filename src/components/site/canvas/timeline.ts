/**
 * timeline.ts — pure timing helpers shared by the /core-concepts animations: a cycle split into steps, easing,
 * clamping, and a seeded hash. Dependency-free (unit tested).
 */

export const clamp = (v: number, a = 0, b = 1): number => Math.max(a, Math.min(b, v));
/** Smooth ease in-out on [0, 1]. */
export const ease = (u: number): number => {
  const x = clamp(u);
  return x * x * (3 - 2 * x);
};
/** Ease out (fast start, soft landing) on [0, 1]. */
export const easeOut = (u: number): number => 1 - Math.pow(1 - clamp(u), 3);
/** Progress of `u` through the window [a, b], clamped to [0, 1]. */
export const span = (u: number, a: number, b: number): number => (b <= a ? (u >= b ? 1 : 0) : clamp((u - a) / (b - a)));

export const cycleMs = (durations: readonly number[]): number => durations.reduce((s, d) => s + d, 0);

/** Start time (ms into the cycle) of each step. */
export function stepStarts(durations: readonly number[]): number[] {
  const out: number[] = [];
  let s = 0;
  for (const d of durations) {
    out.push(s);
    s += d;
  }
  return out;
}

/** Step at time `t` (any ms, wrapped into the cycle): its index, progress p in [0, 1) and start time. */
export function stepAt(
  t: number,
  durations: readonly number[],
): { step: number; p: number; start: number; loop: number } {
  const total = cycleMs(durations);
  const loop = Math.floor(t / total);
  let x = t - loop * total;
  let start = 0;
  for (let i = 0; i < durations.length; i++) {
    if (x < durations[i] || i === durations.length - 1)
      return { step: i, p: clamp(x / durations[i], 0, 0.999999), start, loop };
    x -= durations[i];
    start += durations[i];
  }
  return { step: 0, p: 0, start: 0, loop };
}

/** 32-bit integer hash → [0, 1). Deterministic and stateless. */
export function hash01(a: number, b = 0, c = 0): number {
  let h = (Math.imul(a | 0, 0x9e3779b1) ^ Math.imul(b | 0, 0x85ebca6b) ^ Math.imul(c | 0, 0xc2b2ae35)) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d) >>> 0;
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39) >>> 0;
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/** Approximately standard normal, deterministic (sum of four uniforms, rescaled). */
export function gauss(a: number, b = 0, c = 0): number {
  let s = 0;
  for (let k = 0; k < 4; k++) s += hash01(a, b * 4 + k, c);
  return (s - 2) * Math.sqrt(3);
}
