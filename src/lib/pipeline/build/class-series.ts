// class-series.ts — returns of every other active class, each from its own daily NAV chain
import type { FundSpec } from "../../../config/funds.ts";
import type { ClassInfo, ClassPerformance, FundData, Performance, RiskStats } from "../../data/types.ts";
import { ym } from "../../data/dates.ts";
import { classSeriesOf, FUND_SOURCES, type ClassSeriesSource, type FeeBand } from "../fund-sources.ts";
import { CLASS_CHECKS, CLASS_SPREAD } from "../config.ts";
import { sortedKeys, type Series } from "../metrics.ts";
import type { RawPayloads } from "../raw.ts";
import { buildClassEntry, performanceProblems, pickDefaultClass } from "../classes.ts";
import { computeFundClasses, type ClassInput, type FundClassesResult } from "../class-returns.ts";
import type { Ctx } from "./context.ts";
import { monthRanges } from "./helpers.ts";
import { registerFund } from "./register.ts";
import { chainNote } from "./series.ts";
import type { PerfBuild } from "./performance.ts";

/**
 * Independent gate of a class series against the track-record class of the same months (FUND_SOURCES.classSpread):
 * the difference between two classes of one book is a fee difference, so it stays in a narrow band around its median.
 * Returns why not, or null.
 */
export function classSpreadProblem(pref: Series, track: Series, cfg: FeeBand = CLASS_SPREAD): string | null {
  const months = sortedKeys(pref).filter((m) => m in track);
  if (!months.length) return "no month of the other class to compare with";
  const d = months.map((m) => pref[m] - track[m]);
  const sorted = [...d].sort((a, b) => a - b);
  const median =
    sorted.length % 2
      ? sorted[(sorted.length - 1) / 2]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  const bad = months
    .map((m, i) => ({ m, x: d[i] }))
    .filter(
      ({ x }) => x < cfg.minDiff - 1e-12 || x > cfg.maxDiff + 1e-12 || Math.abs(x - median) > cfg.maxFromMedian + 1e-12,
    );
  if (!bad.length) return null;
  const bp = (x: number): string => `${(x * 10_000).toFixed(1)} bp`;
  return `${bad.length} of ${months.length} month(s) outside the fee band (median ${bp(median)}; allowed ${bp(cfg.minDiff)} to ${bp(cfg.maxDiff)}, ±${bp(cfg.maxFromMedian)} around the median): ${bad
    .slice(0, 4)
    .map(({ m, x }) => `${ym(m)} ${bp(x)}`)
    .join(", ")}${bad.length > 4 ? ", …" : ""}`;
}

/** every class's months of one fund from its own daily chain (class-returns.ts), up to the run's target month */
interface FundClassRun {
  classes: ClassSeriesSource[];
  /** register order of the active classes (else the configuration's) */
  order: string[];
  res: FundClassesResult;
}

/** Runs class-returns.ts over every active class of a net fund (null for a fund without daily NAV history). */
export function computeClassRun(raw: RawPayloads, spec: FundSpec): FundClassRun | null {
  const src = FUND_SOURCES[spec.key];
  if (!src.dataplatform || !src.navStart) return null;
  const reg = registerFund(raw, spec);
  const classes = classSeriesOf(spec.key, reg?.classes ?? null);
  if (!classes.length) return null;
  const order = reg
    ? reg.classes.filter((k) => k.status === "active").map((k) => k.fundserv)
    : classes.map((k) => k.fundserv);
  const currencyOf = new Map((reg?.classes ?? []).map((k) => [k.fundserv, k.currency || null]));
  const inputs: ClassInput[] = classes.map((k) => {
    const r = raw.navHistory?.[k.fundserv];
    const rows = r?.ok && r.data ? r.data.rows.filter((x) => x.fundserv === k.fundserv) : null;
    const foreign = r?.ok && r.data && rows!.length !== r.data.rows.length;
    return {
      fundserv: k.fundserv,
      display: k.display,
      currency: currencyOf.get(k.fundserv) ?? null,
      rows: foreign ? null : rows,
      error: !r
        ? "not fetched"
        : !r.ok || !r.data
          ? (r.error ?? "unavailable")
          : foreign
            ? `payload has rows of another class than ${k.fundserv}`
            : null,
    };
  });
  const requested =
    classes.map((k) => raw.navHistory?.[k.fundserv]?.data?.from).find((x): x is string => typeof x === "string") ??
    CLASS_CHECKS.historyFrom;
  const res = computeFundClasses(inputs, {
    endMonth: raw.targetMonth,
    cfg: CLASS_CHECKS,
    floor: src.classFloor,
    requestedFrom: requested,
  });
  return { classes, order, res };
}

/**
 * Returns of EVERY active class of the fund register. The track-record class (the headline) is the fund's main series, as
 * built and cross-checked. Every other class gets its own monthly series from its OWN daily NAV chain (nav-timeseries,
 * class-returns.ts) from its inception — the first price of its current run — to the headline's as-of, never another
 * class's numbers:
 *  - a month that fails a check (coverage, method, bad valuation print — every class —, cross-class consistency — that
 *    class or every class, class-returns.ts) is withheld, with its reason in the issues; the figures over it are withheld (classes.ts);
 *  - less than CLASS_CHECKS.minHistoryMonths months since inception: no figure (regulatory minimum), ClassInfo "young";
 *  - a non-CAD class: no figure (no distribution-aware returns), ClassInfo "currency".
 * `classInfo` describes every class (inception, why no returns); `defaultClass` is the registry's headline class when it
 * has returns, else the first class (register order) that has. Class entries are held and carried with the headline.
 */
export function buildClasses(
  raw: RawPayloads,
  spec: FundSpec,
  prev: FundData | undefined,
  pb: PerfBuild | null,
  performance: Performance | null,
  risk: RiskStats | null,
  risk3Y: RiskStats | null,
  c: Ctx,
  base: string,
  run: FundClassRun | null,
): {
  byClass: Record<string, ClassPerformance>;
  classInfo: Record<string, ClassInfo> | undefined;
  defaultClass: string | undefined;
  alerts: string[];
  advisories: { code: string; message: string }[];
} {
  const reg = registerFund(raw, spec);
  const classes = run?.classes ?? classSeriesOf(spec.key, reg?.classes ?? null);
  const order =
    run?.order ??
    (reg ? reg.classes.filter((k) => k.status === "active").map((k) => k.fundserv) : classes.map((k) => k.fundserv));
  const alerts: string[] = [];
  const advisories: { code: string; message: string }[] = [];
  const head = performance?.classCode ? classes.find((k) => k.classCode === performance.classCode) : undefined;
  if (!pb) {
    // the main series carried over (a source failed this run): the classes carried over with it
    const byClass: Record<string, ClassPerformance> =
      performance && prev?.performanceByClass ? { ...prev.performanceByClass } : {};
    if (head && performance)
      byClass[head.fundserv] = { fundserv: head.fundserv, display: head.display, performance, risk, risk3Y };
    const classInfo = performance && prev?.classInfo ? { ...prev.classInfo } : undefined;
    return {
      byClass,
      classInfo,
      defaultClass: performance
        ? (prev?.defaultClass ?? pickDefaultClass(spec.headlineClass, order, byClass))
        : undefined,
      alerts,
      advisories,
    };
  }
  const byClass: Record<string, ClassPerformance> = {};
  if (head && performance)
    byClass[head.fundserv] = { fundserv: head.fundserv, display: head.display, performance, risk, risk3Y };
  if (!pb.performance || !pb.ref || !head || !run)
    return {
      byClass,
      classInfo: undefined,
      defaultClass: pickDefaultClass(spec.headlineClass, order, byClass),
      alerts,
      advisories,
    };
  const asOf = pb.performance.asOf;
  const ref = pb.ref;
  const fundRes = run.res;
  if (fundRes.fundMonths.length) {
    const msg = `month(s) withheld for every class of the fund (source defects to report to the dataplatform): ${fundRes.fundMonths.map((x) => `${ym(x.month)} ${x.reason}`).join("; ")}`;
    c.warn(`${base}.performance.classes`, msg);
    // a persistent source defect, not an anomaly of this run: one non-blocking notice, posted again only when the list changes
    advisories.push({ code: `defects ${fundRes.fundMonths.map((x) => ym(x.month)).join(",")}`, message: msg });
  }
  const classInfo: Record<string, ClassInfo> = {};
  const byRes = new Map(fundRes.classes.map((r) => [r.fundserv, r]));
  // register order first (headline-first choice in pickDefaultClass), the same order validate.ts reads from classInfo
  const rank = (f: string): number => {
    const i = order.indexOf(f);
    return i < 0 ? order.length : i;
  };
  for (const k of [...classes].sort((a, b) => rank(a.fundserv) - rank(b.fundserv))) {
    const r = byRes.get(k.fundserv)!;
    const key = `${base}.performance.classes.${k.fundserv}`;
    const lbl = `class ${k.display} (${k.fundserv})`;
    if (k.fundserv === head.fundserv) {
      classInfo[k.fundserv] = {
        fundserv: k.fundserv,
        display: k.display,
        currency: r.currency,
        inception: r.inception,
        status: "shown",
      };
      continue;
    }
    const wasPublished = !!prev?.performanceByClass?.[k.fundserv];
    const b = buildClassEntry({
      key,
      cls: k,
      result: r,
      asOf,
      idx: ref.idx,
      indexName: ref.indexName,
      minMonths: CLASS_CHECKS.minHistoryMonths,
    });
    c.issues.push(...b.issues);
    let entry = b.entry;
    if (entry) {
      const problems = performanceProblems(entry.performance, "compounded", true);
      if (problems.length) {
        c.warn(
          key,
          `${lbl}: ${problems[0]}${problems.length > 1 ? ` (+${problems.length - 1} more)` : ""}; returns not shown for this class`,
        );
        entry = null;
      }
    }
    classInfo[k.fundserv] = entry
      ? b.info
      : { ...b.info, status: b.info.status === "shown" ? "unavailable" : b.info.status };
    if (!entry) {
      // a class that was published and disappears always needs a human (blocking alert)
      if (wasPublished)
        alerts.push(
          `${lbl} not shown (it was published before): ${
            b.issues
              .filter((i) => i.level !== "info")
              .map((i) => i.message)
              .pop() ?? "see the issues"
          }`,
        );
      continue;
    }
    byClass[k.fundserv] = entry;
    const months = entry.performance.monthly.length;
    const withheld = entry.performance.withheldMonths ?? [];
    const unchecked = fundRes.unchecked.filter((u) => u.fundserv === k.fundserv && u.month <= asOf).map((u) => u.month);
    c.prov[key] =
      `monthly net returns of ${lbl} from its inception ${r.inception} (first price of its current run; first month ${entry.performance.partialFirstMonth ? "partial, from the inception NAV per unit" : "complete"}) to ${ym(asOf)}, compounded by the website from dataplatform /api/performance/nav-timeseries fundserv=${k.fundserv} (${chainNote(
        entry.performance.monthly.map((m) => m.month),
        r.months.map((m) => ({ month: m.month, source: m.source, status: "ready", r: m.r, issue: null })),
      )}); ${months} month(s) shown${withheld.length ? `, ${withheld.length} withheld (${monthRanges(withheld)})` : ""}; checks: coverage and method, bad valuation prints and cross-class consistency${unchecked.length ? ` (${unchecked.length} month(s) without another class to compare: ${monthRanges(unchecked)})` : ""}`;
  }
  return { byClass, classInfo, defaultClass: pickDefaultClass(spec.headlineClass, order, byClass), alerts, advisories };
}
