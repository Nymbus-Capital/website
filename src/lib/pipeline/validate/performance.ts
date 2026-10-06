// performance.ts — gates of the fund performance (blocking) and of the class / variant returns (repairs)
import { PERIODS, type FundData, type Issue, type PeriodMap } from "../../data/types.ts";
import type { FundContext } from "../build/index.ts";
import { factsheetTolerance, PIPELINE_FUNDS, TOL } from "../config.ts";
import { classLabel, FUND_SOURCES } from "../fund-sources.ts";
import { performanceProblems, pickDefaultClass } from "../classes.ts";
import { FUNDS } from "../../../config/funds.ts";
import { addMonths, compound, lastClosedMonth, sum, trailing, type Method, type Series } from "../metrics.ts";
import { ym } from "../../data/dates.ts";
import { pct } from "../format.ts";

/** Blocking gates of the fund performance (class label, as-of, outliers, recomputed trailing, factsheet, growth) and its staleness warning. */
export function checkPerformance(f: FundData, ctx: FundContext | undefined, prev: FundData | undefined, base: string, blocking: Issue[], warnings: Issue[], now: Date): void {
  const p = f.performance;
  if (!p) return;
  const method: Method = ctx?.method ?? PIPELINE_FUNDS[f.key]?.method ?? "compounded";
  // the class label must be the one of the data's class (never a business label that can disagree with it)
  if (Object.keys(FUND_SOURCES[f.key]?.classLabels ?? {}).length) {
    const want = classLabel(f.key, p.classCode);
    if (!p.classCode || !want || p.returnClass !== want || p.returnClassLabel !== `Series ${want}`) {
      blocking.push({ key: `${base}.performance.class`, level: "error", message: `performance labelled ${p.returnClassLabel ?? p.returnClass ?? "without a class"} but its data are of class ${p.classCode ?? "unknown"}${want ? ` (class ${want})` : ""}` });
    }
  }
  if (prev?.performance && p.asOf < prev.performance.asOf) {
    blocking.push({ key: `${base}.performance.asOf`, level: "error", message: `performance as of ${p.asOf} is earlier than the published ${prev.performance.asOf}` });
  }
  for (const [label, pts] of [["fund", p.monthly], ["index", p.indexMonthly ?? []]] as const) {
    for (const m of pts) {
      if (!Number.isFinite(m.r) || Math.abs(m.r) > TOL.maxMonthly) blocking.push({ key: `${base}.performance.${label === "fund" ? "monthly" : "indexMonthly"}.${m.month}`, level: "error", message: `${label} monthly return ${m.month} = ${Number.isFinite(m.r) ? pct(m.r) : m.r} is outside ±${TOL.maxMonthly * 100}%` });
    }
  }
  // the monthly series must end at as-of and be contiguous
  const ms = p.monthly.map((m) => m.month);
  if (ms.length && ms[ms.length - 1] !== p.asOf) blocking.push({ key: `${base}.performance.asOf`, level: "error", message: `last monthly return ${ms[ms.length - 1]} does not match as-of ${p.asOf}` });
  for (let i = 1; i < ms.length; i++) {
    if (addMonths(ms[i - 1], 1) !== ms[i]) {
      blocking.push({ key: `${base}.performance.monthly`, level: "error", message: `monthly series has a gap between ${ms[i - 1]} and ${ms[i]}` });
      break;
    }
  }
  const series: Series = {};
  for (const m of p.monthly) series[m.month] = m.r;
  // recomputed trailing = data (only when the pipeline computed them; published figures are checked below)
  if (ctx?.trailingSource === "computed" || (ctx?.trailingSource == null && p.basis === "net")) {
    const t = trailing(series, p.asOf, { method });
    for (const per of PERIODS) {
      const a = p.trailing.fund[per];
      const b = t[per];
      if (a === undefined) continue;
      if ((a === null) !== (b === null) || (a !== null && b !== null && Math.abs(a - b) > 1e-9)) {
        blocking.push({ key: `${base}.trailing.${per}`, level: "error", message: `trailing ${per} in data (${a === null ? "null" : pct(a)}) differs from recomputation (${b === null ? "null" : pct(b)})` });
      }
    }
  }
  // cross-check with the published factsheet of the same month
  const fs: PeriodMap | null = ctx?.factsheetTrailing ?? null;
  if (fs && ctx?.trailingSource === "computed") {
    for (const per of PERIODS) {
      const a = p.trailing.fund[per];
      const b = fs[per];
      if (a == null || b == null) continue;
      const tol = factsheetTolerance(per, ctx.factsheetTrailingDecimals?.[per] ?? 1);
      if (Math.abs(a - b) > tol.block) blocking.push({ key: `${base}.trailing.${per}`, level: "error", message: `trailing ${per}: computed ${pct(a)} vs factsheet ${ctx.factsheetTrailingFile ?? ""} ${pct(b)} (difference > ${(tol.block * 100).toFixed(3)}%)` });
    }
  }
  // growth consistent with the monthly returns
  if (p.growth.length) {
    const last = p.growth[p.growth.length - 1];
    const expected = 10_000 * (1 + (method === "arithmetic" ? sum(p.monthly.map((m) => m.r)) : compound(p.monthly.map((m) => m.r))));
    if (last.date !== p.asOf || Math.abs(last.fund - expected) > 0.01) blocking.push({ key: `${base}.performance.growth`, level: "error", message: `growth of 10 000 ends at ${last.date} ${last.fund.toFixed(2)}, expected ${p.asOf} ${expected.toFixed(2)}` });
  }
  const closed = lastClosedMonth(now);
  if (p.asOf < addMonths(closed, -1)) warnings.push({ key: `${base}.performance.asOf`, level: "error", message: `stale: performance as of ${ym(p.asOf)} while ${ym(closed)} is closed` });
}

/**
 * Gates of the per-class returns and of the strategy variants (repairs in place, never blocking: a class / variant that
 * fails is dropped and the page says "coming soon" for it; the fund's own default series is gated by checkPerformance):
 * contiguous monthly series ending at as-of, no month beyond ±25 %, trailing figures equal to a recomputation (classes),
 * growth consistent with the monthly returns. Each class / variant is checked on its own numbers only.
 */
export function checkClassesAndVariants(f: FundData, base: string): Issue[] {
  const issues: Issue[] = [];
  // the headline class is the one of the fund's own series (the track record); without a class code (older data), the
  // default class
  const own = f.performance?.classCode ? Object.values(f.performanceByClass ?? {}).find((k) => k.performance.classCode === f.performance!.classCode)?.fundserv : undefined;
  const headline = (own ?? f.defaultClass ?? FUNDS.find((x) => x.key === f.key)?.headlineClass ?? "").toUpperCase();
  if (f.performanceByClass) {
    for (const [code, k] of Object.entries(f.performanceByClass)) {
      const problems = performanceProblems(k.performance, "compounded", true);
      if (!problems.length) continue;
      // the headline class is never dropped on its own: its failure is an error that holds the whole performance
      if (code.toUpperCase() === headline) {
        issues.push({ key: `${base}.performance.classes.${code}`, level: "error", message: `headline class ${k.display} (${code}): ${problems[0]}${problems.length > 1 ? ` (+${problems.length - 1} more)` : ""}; performance held back` });
        continue;
      }
      issues.push({ key: `${base}.performance.classes.${code}`, level: "warn", message: `class ${k.display} (${code}): ${problems[0]}${problems.length > 1 ? ` (+${problems.length - 1} more)` : ""}; returns not shown for this class` });
      delete f.performanceByClass[code];
      if (f.classInfo?.[code]) f.classInfo[code] = { ...f.classInfo[code], status: "unavailable" };
    }
    if (!Object.keys(f.performanceByClass).length) {
      delete f.performanceByClass;
      delete f.defaultClass;
    } else if (f.defaultClass && !f.performanceByClass[f.defaultClass]) {
      // the page never opens on a class whose returns were just dropped; same order as build/class-series.ts (classInfo is written in
      // register order), the registry's headline class first
      const spec = FUNDS.find((x) => x.key === f.key);
      const order = [...Object.keys(f.classInfo ?? {}), ...(spec?.classes.map((c) => c.fundserv) ?? [])];
      const next = pickDefaultClass(spec?.headlineClass, order, f.performanceByClass);
      if (next) f.defaultClass = next;
      else delete f.defaultClass;
    }
  }
  if (f.variants) {
    for (const [id, v] of Object.entries(f.variants)) {
      if (id === f.defaultVariant || !v.performance) continue;
      const problems = performanceProblems(v.performance, "arithmetic", false);
      // a variant older than the fund's own performance never sits next to it (one date per page)
      if (f.performance && v.performance.asOf < f.performance.asOf) problems.push(`as of ${v.performance.asOf} is older than the fund's ${f.performance.asOf}`);
      if (!problems.length) continue;
      issues.push({ key: `${base}.variants.${id}.performance`, level: "warn", message: `variant ${id} %: ${problems[0]}${problems.length > 1 ? ` (+${problems.length - 1} more)` : ""}; the variant is not shown` });
      delete f.variants[id];
    }
  }
  return issues;
}
