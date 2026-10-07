// helpers.ts — small shared helpers of the build (month ranges, series points, trailing / risk mapping)
import { PERIODS, type MonthlyPoint, type PeriodMap, type RiskStats } from "../../data/types.ts";
import { ym } from "../../data/dates.ts";
import { addMonths, sortedKeys, toMonthEnd, trailing as trailingOf, type RiskResult, type Series } from "../metrics.ts";

export const PERIOD_LIST = PERIODS as readonly string[];

export const pct4 = (x: number): string => `${(x * 100).toFixed(4)}%`;

/** ["2019-01-31","2019-02-28","2019-04-30"] -> "2019-01 to 2019-02, 2019-04" */
export function monthRanges(ms: string[]): string {
  const out: string[] = [];
  let a: string | null = null;
  let b: string | null = null;
  for (const m of [...ms].sort()) {
    if (b && addMonths(b, 1) === toMonthEnd(m)) {
      b = m;
      continue;
    }
    if (a) out.push(a === b ? ym(a) : `${ym(a)} to ${ym(b!)}`);
    a = b = m;
  }
  if (a) out.push(a === b ? ym(a) : `${ym(a)} to ${ym(b!)}`);
  return out.join(", ");
}

/** Series → monthly points in month order. */
export const toPoints = (s: Series): MonthlyPoint[] => sortedKeys(s).map((month) => ({ month, r: s[month] }));

/** metrics.ts trailing result → PeriodMap with every period (null when absent). */
export function fromTrailingMap(t: ReturnType<typeof trailingOf>): PeriodMap {
  const out: PeriodMap = {};
  for (const p of PERIOD_LIST) out[p as keyof PeriodMap] = t[p as keyof typeof t] ?? null;
  return out;
}

/** metrics.ts risk result → the published RiskStats fields. */
export function riskFrom(r: RiskResult | null): RiskStats | null {
  if (!r) return null;
  return {
    window: r.window,
    annReturn: r.annReturn,
    annVol: r.annVol,
    downsideDev: r.downsideDev,
    sharpe: r.sharpe,
    sortino: r.sortino,
    maxDrawdown: r.maxDrawdown,
    positiveMonths: r.positiveMonths,
    bestMonth: r.bestMonth,
    worstMonth: r.worstMonth,
  };
}

/** The months of `s` up to `end`. */
export const cut = (s: Series, end: string): Series =>
  Object.fromEntries(
    sortedKeys(s)
      .filter((m) => m <= end)
      .map((m) => [m, s[m]]),
  );
