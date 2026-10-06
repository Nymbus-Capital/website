// heatmap.ts — the monthly returns heatmap: years × months grid and cell colours
import type { CalendarRow, MonthlyPoint } from "../../../lib/data/types.ts";
import { isNum } from "./is-num.ts";
import { partialKind, type PartialKind } from "./performance.ts";

interface HeatRow { year: number; cells: (number | null)[]; total: number | null; partial: boolean; kind: PartialKind }

/**
 * Years × 12 months grid of monthly returns, with the calendar-year return when published. A partial row is
 * "ytd" only for the as-of year (default: the last published month), "launch" for a partial inception year.
 */
export function heatmapGrid(monthly: MonthlyPoint[] | undefined | null, calendar?: CalendarRow[] | null, asOf?: string | null): HeatRow[] {
  const byYear = new Map<number, (number | null)[]>();
  for (const p of monthly ?? []) {
    if (!isNum(p.r)) continue;
    const y = +p.month.slice(0, 4), m = +p.month.slice(5, 7);
    if (!y || m < 1 || m > 12) continue;
    if (!byYear.has(y)) byYear.set(y, Array(12).fill(null));
    byYear.get(y)![m - 1] = p.r;
  }
  const cal = new Map((calendar ?? []).map((c) => [c.year, c]));
  const lastMonth = (monthly ?? []).filter((p) => isNum(p.r)).map((p) => p.month).sort().pop() ?? null;
  const end = asOf ?? lastMonth;
  return [...byYear.keys()].sort((a, b) => b - a).map((year) => {
    const c = cal.get(year);
    const cells = byYear.get(year)!;
    const partial = !!c?.partial || cells[11] == null;
    return { year, cells, total: c && isNum(c.fund) ? c.fund : null, partial, kind: partialKind(year, partial, end) };
  });
}

/** Scale for the heatmap colours: a high percentile of |r| so one outlier month doesn't wash out the rest. */
export function heatScale(values: number[], q = 0.95): number {
  const a = values.filter(isNum).map(Math.abs).sort((x, y) => x - y);
  if (!a.length) return 0.01;
  const v = a[Math.min(a.length - 1, Math.floor(q * (a.length - 1)))];
  return Math.max(v, 0.001);
}

/**
 * Colour of a heatmap cell: sign picks the hue (pos = blue→cyan, neg = red), |r| / scale the intensity.
 * Returns an opacity in [0.1, 1] (small returns stay visible) and whether the text should turn white.
 */
export function heatCell(r: number | null, scale: number): { tone: "pos" | "neg" | "zero" | "none"; alpha: number; strong: boolean } {
  if (!isNum(r)) return { tone: "none", alpha: 0, strong: false };
  if (Math.abs(r) < 5e-5) return { tone: "zero", alpha: 0.1, strong: false };
  const k = Math.min(1, Math.abs(r) / (scale || 1));
  const alpha = +(0.1 + 0.9 * Math.pow(k, 0.8)).toFixed(3);
  // white text only on saturated cells of at least 1 %: smaller returns keep the ink colour
  return { tone: r > 0 ? "pos" : "neg", alpha, strong: alpha >= 0.62 && Math.abs(r) >= 0.01 };
}
