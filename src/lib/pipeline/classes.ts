/**
 * Returns per class (series) into `ClassPerformance`. Pure (no I/O). A class is shown only with its own series, which must
 * end at the validated as-of month of the fund; anything else leaves the class without data ("coming soon") — never
 * another class's numbers. The class series come from the pipeline's own class-checked candidates (build.ts: track-record
 * class and preferred full-history class), never from an unchecked answer of the endpoint.
 *
 * A series shorter than 12 months is published with the periods that exist only (no annualized figure, no risk
 * statistics) and flagged `shortRecord`: the page says "since class inception".
 */
import type { CalendarRow, ClassPerformance, GrowthPoint, Issue, MonthlyPoint, Performance, PeriodMap, RiskStats } from "../data/types.ts";
import { PERIODS } from "../data/types.ts";
import type { ClassSeriesSource } from "./fund-sources.ts";
import {
  addMonths, calendarYears, clean, growth as growthOf, monthsBetween, riskStats, sortedKeys, trailing as trailingOf, type RiskResult, type Series,
} from "./metrics.ts";

const PERIOD_LIST = PERIODS as readonly string[];
const ym = (d: string): string => d.slice(0, 7);

const toPoints = (s: Series): MonthlyPoint[] => sortedKeys(s).map((month) => ({ month, r: s[month] }));

function periodMap(t: ReturnType<typeof trailingOf>): PeriodMap {
  const out: PeriodMap = {};
  for (const p of PERIOD_LIST) out[p as keyof PeriodMap] = t[p as keyof typeof t] ?? null;
  return out;
}

function riskFrom(r: RiskResult | null): RiskStats | null {
  if (!r) return null;
  return {
    window: r.window, annReturn: r.annReturn, annVol: r.annVol, downsideDev: r.downsideDev, sharpe: r.sharpe, sortino: r.sortino,
    maxDrawdown: r.maxDrawdown, positiveMonths: r.positiveMonths, bestMonth: r.bestMonth, worstMonth: r.worstMonth,
  };
}

/**
 * The contiguous run of months ending at `asOf` (the class's series cannot have a hole: the history of a class starts at
 * its first computable month, earlier months are simply absent, but a later gap ends the usable run).
 */
export function runEndingAt(s: Series, asOf: string): { series: Series; first: string; before: string[] } | null {
  if (!(asOf in s)) return null;
  let first = asOf;
  while (addMonths(first, -1) in s) first = addMonths(first, -1);
  const series: Series = {};
  const before: string[] = [];
  for (const m of sortedKeys(s)) (m >= first ? (series[m] = s[m]) : before.push(m));
  return { series, first, before };
}

export interface DerivedReturns {
  trailing: Performance["trailing"];
  calendar: CalendarRow[];
  growth: GrowthPoint[];
  indexMonthly?: MonthlyPoint[];
}

/**
 * Trailing / calendar / growth of a series, and of the benchmark over the same months (index figures only where the
 * index has every month: null otherwise). Same conventions as the fund's own series (metrics.ts).
 */
export function deriveReturns(series: Series, first: string, asOf: string, idx: Series | null): DerivedReturns {
  const fund = periodMap(trailingOf(series, asOf));
  const trailing: Performance["trailing"] = { fund };
  let indexMonthly: MonthlyPoint[] | undefined;
  if (idx) {
    const ci = periodMap(trailingOf(idx, asOf, { siStart: first }));
    const index: PeriodMap = {};
    const va: PeriodMap = {};
    for (const p of PERIOD_LIST) {
      const k = p as keyof PeriodMap;
      if (fund[k] == null) { index[k] = null; va[k] = null; continue; }
      const iv = ci[k] ?? null;
      index[k] = iv;
      va[k] = iv != null ? clean((fund[k] as number) - iv) : null;
    }
    trailing.index = index;
    trailing.va = va;
    const inRange: Series = {};
    for (const m of sortedKeys(idx)) if (m >= first && m <= asOf) inRange[m] = idx[m];
    indexMonthly = toPoints(inRange);
  }
  const idxCal = idx ? new Map(calendarYears(idx, asOf, { first }).map((y) => [y.year, y])) : null;
  const calendar: CalendarRow[] = calendarYears(series, asOf, { first }).map((y) => {
    const row: CalendarRow = { year: y.year, fund: y.value };
    if (y.partial) row.partial = true;
    if (idxCal) {
      const iy = idxCal.get(y.year);
      const iv = iy && iy.months === y.months ? iy.value : null;
      row.index = iv;
      row.va = iv != null && y.value != null ? clean(y.value - iv) : null;
    }
    return row;
  });
  let acc: number | null = 1;
  const growth: GrowthPoint[] = growthOf(series, asOf, { first }).map((pt, i) => {
    if (!idx) return { date: pt.date, fund: pt.value };
    if (i > 0) acc = acc != null && pt.date in idx ? acc * (1 + idx[pt.date]) : null;
    return { date: pt.date, fund: pt.value, index: acc != null ? 10_000 * acc : null };
  });
  return { trailing, calendar, growth, ...(indexMonthly ? { indexMonthly } : {}) };
}

export interface ClassBuild {
  /** the class's returns; null when it has none to show */
  entry: ClassPerformance | null;
  issues: Issue[];
}

export interface ClassBuildInput {
  /** dotted key base of the issues, e.g. `funds.sustainable-enhanced-bonds.performance.classes.LDM202` */
  key: string;
  cls: ClassSeriesSource;
  /** the class's monthly net returns (one class, checked by the caller); null: none */
  series: Series | null;
  /** months of `series` that come from rounded factsheet figures (no risk statistics over a window containing one) */
  roundedMonths?: string[];
  /** validated as-of month of the fund: the class series must end there */
  asOf: string;
  /** benchmark monthly returns (FTSE), null when the fund has none */
  idx: Series | null;
  indexName?: string;
}

/** One class (not the headline one: that series is the fund's main one) from its own monthly series. */
export function buildClassPerformance(inp: ClassBuildInput): ClassBuild {
  const { key, cls, series, asOf, idx } = inp;
  const issues: Issue[] = [];
  const label = `class ${cls.display} (${cls.fundserv})`;
  if (!series) return { entry: null, issues };
  const run = runEndingAt(series, asOf);
  if (!run) {
    const last = sortedKeys(series).pop();
    issues.push({ key, level: "warn", message: `${label}: series ${last ? `ends ${ym(last)}` : "has no month"}, not ${ym(asOf)}; returns not shown for this class` });
    return { entry: null, issues };
  }
  const n = monthsBetween(run.first, asOf);
  const d = deriveReturns(run.series, run.first, asOf, idx);
  const short = n < 12;
  const performance: Performance = {
    asOf, basis: "net", method: "compounded", firstMonth: run.first, monthly: toPoints(run.series),
    ...(d.indexMonthly ? { indexMonthly: d.indexMonthly } : {}), trailing: d.trailing, calendar: d.calendar, growth: d.growth,
    classCode: cls.classCode, returnClass: cls.display, returnClassLabel: `Series ${cls.display}`,
    ...(inp.indexName ? { indexName: inp.indexName } : {}),
    ...(short ? { shortRecord: true } : {}),
  };
  if (short) issues.push({ key, level: "info", message: `${label}: ${n} month(s) of history (< 12): only the periods that exist are shown ("since class inception"), no risk statistics` });
  const rounded = (inp.roundedMonths ?? []).filter((m) => m >= run.first && m <= asOf);
  const risk = rounded.length ? null : riskFrom(riskStats(run.series, asOf, "SI"));
  const risk3Y = rounded.some((m) => m > addMonths(asOf, -36)) ? null : riskFrom(riskStats(run.series, asOf, "3Y"));
  if (rounded.length) issues.push({ key: key.replace(/\.performance\..*$/, ".risk"), level: "warn", message: `${label}: risk statistics not shown${risk3Y ? " for the SI window" : ""}: ${rounded.length} month(s) come from rounded factsheet figures` });
  return { entry: { fundserv: cls.fundserv, display: cls.display, performance, risk, risk3Y }, issues };
}

/**
 * Why a performance block cannot be published (used for the classes and variants, whose failure drops that class /
 * variant only, never the fund): non-finite or implausible monthly returns (beyond ±25 %), a series that has a gap or does
 * not end at as-of, trailing figures that differ from a recomputation (`recompute`: the pipeline computed them), a growth
 * series that does not match the monthly returns. Empty = fine.
 */
export function performanceProblems(p: Performance, method: "compounded" | "arithmetic", recompute: boolean, maxMonthly = 0.25): string[] {
  const out: string[] = [];
  for (const m of p.monthly) if (!Number.isFinite(m.r) || Math.abs(m.r) > maxMonthly) out.push(`monthly return ${m.month} = ${m.r} is outside ±${maxMonthly * 100}%`);
  for (const m of p.indexMonthly ?? []) if (!Number.isFinite(m.r) || Math.abs(m.r) > maxMonthly) out.push(`index monthly return ${m.month} = ${m.r} is outside ±${maxMonthly * 100}%`);
  const ms = p.monthly.map((m) => m.month);
  if (!ms.length) out.push("no monthly return");
  else {
    if (ms[ms.length - 1] !== p.asOf) out.push(`last monthly return ${ms[ms.length - 1]} does not match as-of ${p.asOf}`);
    for (let i = 1; i < ms.length; i++) if (addMonths(ms[i - 1], 1) !== ms[i]) { out.push(`monthly series has a gap between ${ms[i - 1]} and ${ms[i]}`); break; }
    if (p.firstMonth !== ms[0]) out.push(`first month ${p.firstMonth} does not match the series (${ms[0]})`);
  }
  const series: Series = {};
  for (const m of p.monthly) series[m.month] = m.r;
  if (recompute && ms.length) {
    const t = trailingOf(series, p.asOf, { method });
    for (const per of PERIODS) {
      const a = p.trailing.fund[per];
      const b = t[per];
      if (a === undefined) continue;
      if ((a === null) !== (b === null) || (a !== null && b !== null && Math.abs(a - b) > 1e-9)) out.push(`trailing ${per} (${a}) differs from the recomputation (${b})`);
    }
  }
  if (p.growth.length && ms.length) {
    const rs = p.monthly.map((m) => m.r);
    const expected = 10_000 * (1 + (method === "arithmetic" ? rs.reduce((a, b) => a + b, 0) : rs.reduce((a, r) => a * (1 + r), 1) - 1));
    const last = p.growth[p.growth.length - 1];
    if (last.date !== p.asOf || Math.abs(last.fund - expected) > 0.01) out.push(`growth of 10 000 ends at ${last.date} ${last.fund.toFixed(2)}, expected ${p.asOf} ${expected.toFixed(2)}`);
  }
  return out;
}
