/**
 * Chart maths for the hand-built SVG charts (ports of nymbus-decks v2/viz.ts and curve.ts). Pure.
 */

/** "Nice" axis: rounded bounds and 1-2-2.5-5-10 steps covering [min, max]. */
export function nice(min: number, max: number, n = 5): { lo: number; hi: number; step: number; ticks: number[] } {
  if (!Number.isFinite(min) || !Number.isFinite(max)) { min = 0; max = 1; }
  if (min > max) [min, max] = [max, min];
  if (min === max) { const d = Math.abs(min) * 0.1 || 1; min -= d; max += d; }
  const raw = (max - min) / Math.max(1, n);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const r = raw / mag;
  const step = (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * mag;
  const lo = Math.floor(min / step + 1e-9) * step;
  const hi = Math.ceil(max / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(12));
  return { lo: +lo.toFixed(12), hi: +hi.toFixed(12), step, ticks };
}

/**
 * Width of a horizontal bar in % of its track: value / max, clamped to [0, 100]. A negative weight (cash overdrawn
 * by pending settlements, a short position), zero or a missing value draws no bar (its value label still says it);
 * never an invalid CSS width, which would let the bar stretch to the whole track.
 */
export function barWidthPct(v: number | null | undefined, max: number): number {
  if (typeof v !== "number" || !Number.isFinite(v) || v <= 0 || !(max > 0)) return 0;
  return Math.min(100, (v / max) * 100);
}

/** Linear map from a domain to a range. */
export const linear = (d0: number, d1: number, r0: number, r1: number) => (v: number) =>
  d1 === d0 ? (r0 + r1) / 2 : r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);

/** Bar whose far end only is rounded (top for positive values, bottom for negative ones). */
export function barPath(x: number, y0: number, w: number, y1: number, r: number): string {
  const h = Math.abs(y1 - y0);
  if (h < 0.5 || w <= 0) return "";
  const rr = Math.max(0, Math.min(r, w / 2, h));
  const f = (n: number) => +n.toFixed(2);
  if (y1 < y0) return `M${f(x)},${f(y0)}V${f(y1 + rr)}Q${f(x)},${f(y1)} ${f(x + rr)},${f(y1)}H${f(x + w - rr)}Q${f(x + w)},${f(y1)} ${f(x + w)},${f(y1 + rr)}V${f(y0)}Z`;
  return `M${f(x)},${f(y0)}V${f(y1 - rr)}Q${f(x)},${f(y1)} ${f(x + rr)},${f(y1)}H${f(x + w - rr)}Q${f(x + w)},${f(y1)} ${f(x + w)},${f(y1 - rr)}V${f(y0)}Z`;
}

/** Smooth curve through the points that never overshoots them (monotone cubic, Fritsch-Carlson). */
export function monotonePath(pts: [number, number][]): string {
  const n = pts.length;
  const f = (v: number) => +v.toFixed(2);
  if (n === 0) return "";
  if (n < 3) return pts.map((p, i) => `${i ? "L" : "M"}${f(p[0])},${f(p[1])}`).join("");
  const dx = pts.slice(1).map((p, i) => p[0] - pts[i][0]);
  const sl = pts.slice(1).map((p, i) => (dx[i] ? (p[1] - pts[i][1]) / dx[i] : 0));
  const m = pts.map((_, i) => (i === 0 ? sl[0] : i === n - 1 ? sl[n - 2] : sl[i - 1] * sl[i] <= 0 ? 0 : (sl[i - 1] + sl[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (!sl[i]) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / sl[i], b = m[i + 1] / sl[i], h = a * a + b * b;
    if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * sl[i]; m[i + 1] = t * b * sl[i]; }
  }
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += `C${f(pts[i][0] + h)},${f(pts[i][1] + m[i] * h)} ${f(pts[i + 1][0] - h)},${f(pts[i + 1][1] - m[i + 1] * h)} ${f(pts[i + 1][0])},${f(pts[i + 1][1])}`;
  }
  return d;
}

/** Grouped band layout: x of each category band, inner bar width per series. */
export function bands(n: number, x0: number, width: number, series: number, gap = 0.3) {
  const band = n > 0 ? width / n : width;
  const inner = band * (1 - gap);
  const bw = series > 0 ? inner / series : inner;
  return { band, inner, bw, x: (i: number) => x0 + i * band, barX: (i: number, s: number) => x0 + i * band + (band - inner) / 2 + s * bw };
}

/** Index of the value in a sorted array closest to x. */
export function nearestIndex(xs: number[], x: number): number {
  if (!xs.length) return -1;
  let lo = 0, hi = xs.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid; else hi = mid;
  }
  return Math.abs(xs[lo] - x) <= Math.abs(xs[hi] - x) ? lo : hi;
}

/**
 * Year ticks for a monthly time axis: the indices of the first point of every year, thinned to at most
 * `max` labels (every 1, 2, 5 or 10 years).
 */
export function yearTicks(dates: string[], max = 6): { i: number; label: string }[] {
  const firsts: { i: number; y: number }[] = [];
  let prev = "";
  dates.forEach((d, i) => {
    const y = d.slice(0, 4);
    if (y !== prev) { if (i > 0 || dates.length < 3) firsts.push({ i, y: +y }); prev = y; }
  });
  if (!firsts.length) return [];
  const every = [1, 2, 5, 10, 20].find((k) => Math.ceil(firsts.length / k) <= Math.max(1, max)) ?? 20;
  return firsts.filter((f) => f.y % every === 0 || every === 1).map((f) => ({ i: f.i, label: String(f.y) }));
}

/** Month ticks for short ranges (≤ 2 years): every k months so that at most `max` labels show. */
export function monthTicks(dates: string[], max = 6): number[] {
  const n = dates.length;
  const k = [1, 2, 3, 4, 6, 12].find((s) => Math.ceil(n / s) <= max) ?? 12;
  const out: number[] = [];
  for (let i = n - 1; i >= 0; i -= k) out.unshift(i);
  return out;
}

/** Clamp helper. */
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
