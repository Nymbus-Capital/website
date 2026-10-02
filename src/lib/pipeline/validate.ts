/**
 * Validation gates (pure). Principle: show nothing rather than a wrong number.
 *
 * Per fund:
 *  blocking (the whole fund keeps its previously published FundData, or is withheld if none):
 *   - performance as-of earlier than the one previously published
 *   - a monthly return (fund or index) beyond ±25 %
 *   - trailing returns in the data differ from a recomputation from the monthly series
 *   - computed trailing differs from the published factsheet of the same month by more than 0.5 %
 *   - growth series inconsistent with the monthly returns
 *   - any non-finite number anywhere in the fund data
 *   - a performance class label that is not the label of the class of its data (performance.classCode)
 *  repairs (the value is dropped / kept from the previous publication, the rest is published):
 *   - NAV class moving more than 10 % in one valuation day: class dropped (previous value kept if any) — error issue
 *   - AUM negative or not a number: dropped (previous kept if any) — error issue
 *   - daily portfolio (never blocks the fund; the page then shows the month-end factsheet figures): the whole block is
 *     dropped when its book is invalid, older than 7 whole days or dated in the future (data/freshness.ts, one rule with
 *     the selection and the page), or when nothing plausible is left — also for a fund carried over from the previous
 *     publication (missing or blocked in this run);
 *     a characteristic outside its plausible range (duration 0–30 y, YTM −5 %–25 %, coupon 0–25 %, average maturity
 *     0–100 y, rating a letter notch, coverage 0–1), a breakdown whose weights do not add up to 100 % ± 3 % (cash
 *     included), and a top-10 list with a weight outside (0, 25 %] or a total above 100 % are dropped one by one — warn
 *   - distributions: a series is dropped when an amount is not positive or reaches 5 % of its NAV per unit, its
 *     trailing 12 months reach 25 % of it, its dates are not ascending / in the future, or its last distribution and
 *     calendar-year totals disagree with its own rows; a trailing-12-month figure that differs from the rows of the 12
 *     months ending at the response's end date (trailingTo, the day of the read) is dropped (the series stays), as is one
 *     whose window end is unknown; all distributions are dropped when the source
 *     has not been read successfully for more than 10 days (carried over) — warn
 *  warnings:
 *   - NAV older than 7 days, AUM older than 7 days, performance older than 2 closed months
 */
import type { ClassDistribution, FundData, FundKey, Issue, NavClass, PeriodMap, PortfolioData, PortfolioMetric, SiteData, WeightBucket } from "../data/types.ts";
import { PERIODS } from "../data/types.ts";
import type { FundContext } from "./build.ts";
import { computeAsOf } from "./build.ts";
import { DISTRIBUTIONS, factsheetTolerance, PIPELINE_FUNDS, PORTFOLIO, TOL } from "./config.ts";
import { bookAgeProblem } from "../data/freshness.ts";
import { classLabel, FUND_SOURCES } from "./fund-sources.ts";
import { performanceProblems } from "./classes.ts";
import { FUNDS } from "../../config/funds.ts";
import { fundWithClassLabel, perfClassCode } from "./perf-class.ts";
import { addMonths, compound, lastClosedMonth, sum, trailing, type Method, type Series } from "./metrics.ts";

export interface FundValidation {
  fund: FundKey;
  blocking: Issue[];
  warnings: Issue[];
  /**
   * reasons a human must look at although the fund is published (performance carried over / withheld /
   * stale, carried NAV / AUM / factsheet, revised months, error-level issues): run status "blocked" + alert
   */
  alerts: string[];
}

const days = (a: string, b: Date): number => (b.getTime() - Date.parse(`${a.slice(0, 10)}T00:00:00Z`)) / 86_400_000;
const pct = (x: number): string => `${(x * 100).toFixed(2)}%`;

/** paths of non-finite numbers inside a value */
export function nonFinitePaths(v: unknown, path: string, out: string[] = []): string[] {
  if (typeof v === "number") {
    if (!Number.isFinite(v)) out.push(path);
  } else if (Array.isArray(v)) {
    v.forEach((x, i) => nonFinitePaths(x, `${path}[${i}]`, out));
  } else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) nonFinitePaths(x, `${path}.${k}`, out);
  }
  return out;
}

function checkPerformance(f: FundData, ctx: FundContext | undefined, prev: FundData | undefined, base: string, blocking: Issue[], warnings: Issue[], now: Date): void {
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
  if (p.asOf < addMonths(closed, -1)) warnings.push({ key: `${base}.performance.asOf`, level: "error", message: `stale: performance as of ${p.asOf.slice(0, 7)} while ${closed.slice(0, 7)} is closed` });
}

/**
 * Gates of the per-class returns and of the strategy variants (repairs in place, never blocking: a class / variant that
 * fails is dropped and the page says "coming soon" for it; the fund's own default series is gated by checkPerformance):
 * contiguous monthly series ending at as-of, no month beyond ±25 %, trailing figures equal to a recomputation (classes),
 * growth consistent with the monthly returns. Each class / variant is checked on its own numbers only.
 */
export function checkClassesAndVariants(f: FundData, base: string): Issue[] {
  const issues: Issue[] = [];
  const headline = (f.defaultClass ?? FUNDS.find((x) => x.key === f.key)?.headlineClass ?? "").toUpperCase();
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
    }
    if (!Object.keys(f.performanceByClass).length) {
      delete f.performanceByClass;
      delete f.defaultClass;
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

/**
 * NAV gates per class: the day change (administrator return when available) AND the plain price ratio
 * vs the previous valuation AND vs the previously published NAV of the class must stay within ±10 %.
 * A failing class is dropped (previous published value kept if any) with an error issue (run blocked).
 */
function checkNav(f: FundData, prev: FundData | undefined, base: string, repairs: Issue[], warnings: Issue[], now: Date): void {
  if (!f.nav) return;
  const kept: NavClass[] = [];
  const lim = TOL.maxNavDayChange;
  for (const k of f.nav.classes) {
    const old = prev?.nav?.classes.find((c) => c.fundserv === k.fundserv);
    const reasons: string[] = [];
    if (k.nav === null || !Number.isFinite(k.nav) || k.nav <= 0) reasons.push(`invalid NAV ${k.nav}`);
    else {
      if (k.changePct !== null && (!Number.isFinite(k.changePct) || Math.abs(k.changePct) > lim)) reasons.push(`daily return ${Number.isFinite(k.changePct) ? pct(k.changePct) : "invalid"}`);
      if (k.prevNav !== null && (!Number.isFinite(k.prevNav) || k.prevNav <= 0 || Math.abs(k.nav / k.prevNav - 1) > lim)) reasons.push(`NAV ${k.nav} vs ${k.prevNav} on ${k.prevDate ?? "previous valuation"} (${Number.isFinite(k.prevNav) && k.prevNav > 0 ? pct(k.nav / k.prevNav - 1) : "invalid"})`);
      if (old?.nav && old.nav > 0 && old.date !== k.date && Math.abs(k.nav / old.nav - 1) > lim) reasons.push(`NAV ${k.nav} vs published ${old.nav} (${old.date}, ${pct(k.nav / old.nav - 1)})`);
    }
    if (reasons.length) {
      repairs.push({ key: `${base}.nav.${k.fundserv}`, level: "error", message: `NAV ${k.display} (${k.fundserv}) ${k.date}: ${reasons.join("; ")} exceeds ±${lim * 100}%; ${old ? `previous value (${old.date}) kept` : "class not shown"}` });
      if (old) kept.push(old);
      continue;
    }
    kept.push(k);
    if (k.date && days(k.date, now) > TOL.navStaleDays) warnings.push({ key: `${base}.nav.${k.fundserv}`, level: "error", message: `stale: NAV ${k.display} (${k.fundserv}) dated ${k.date} is older than ${TOL.navStaleDays} days` });
  }
  f.nav.classes = kept;
  if (!kept.length) f.nav = null;
  else f.nav.asOf = kept.map((k) => k.date ?? "").sort().pop() || null;
}

function checkAum(f: FundData, prev: FundData | undefined, base: string, repairs: Issue[], warnings: Issue[], now: Date): void {
  if (!f.aum) return;
  if (typeof f.aum.cad !== "number" || !Number.isFinite(f.aum.cad) || f.aum.cad < 0) {
    repairs.push({ key: `${base}.aum`, level: "error", message: `AUM ${f.aum.cad} is not a valid amount; ${prev?.aum ? `previous (${prev.aum.asOf}) kept` : "not shown"}` });
    f.aum = prev?.aum && Number.isFinite(prev.aum.cad) && prev.aum.cad >= 0 ? prev.aum : null;
    return;
  }
  if (days(f.aum.asOf, now) > TOL.navStaleDays) warnings.push({ key: `${base}.aum`, level: "error", message: `stale: AUM snapshot ${f.aum.asOf} is older than ${TOL.navStaleDays} days` });
}

/* ------------------------------------------------------------------ daily portfolio */

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const RATING = /^(AAA|AA[+-]?|A[+-]?|BBB[+-]?|BB[+-]?|B[+-]?|CCC[+-]?|CC|C|D)$/;

/** Why a characteristic is implausible, or null. */
export function metricProblem(m: PortfolioMetric): string | null {
  if (!isNum(m.coverage) || m.coverage < 0 || m.coverage > 1) return `coverage ${m.coverage}`;
  if (m.id === "rating") return typeof m.value === "string" && RATING.test(m.value) ? null : `rating "${m.value}"`;
  if (!isNum(m.value)) return `value ${m.value}`;
  const [lo, hi] = PORTFOLIO.ranges[m.id];
  return m.value < lo || m.value > hi ? `${m.value} outside ${lo}–${hi}` : null;
}

/** Why a breakdown is implausible (weights not numbers, or not adding up to 100 % of net assets), or null. */
export function breakdownProblem(rows: WeightBucket[]): string | null {
  if (!rows.length) return "empty";
  if (rows.some((r) => !isNum(r.weight) || Math.abs(r.weight) > 1.5)) return "a weight is not a plausible number";
  const total = rows.reduce((a, r) => a + r.weight, 0);
  return Math.abs(total - 1) > PORTFOLIO.weightSumTol ? `weights add up to ${pct(total)}` : null;
}

/** Why the top-holdings list is implausible, or null. */
export function holdingsProblem(rows: PortfolioData["topHoldings"]): string | null {
  if (rows.some((h) => !h.name || !isNum(h.weight) || h.weight <= 0 || h.weight > PORTFOLIO.maxHoldingWeight)) return `a weight is outside (0, ${pct(PORTFOLIO.maxHoldingWeight)}]`;
  const total = rows.reduce((a, h) => a + h.weight, 0);
  return total > 1 + 1e-9 ? `weights add up to ${pct(total)}` : null;
}

/**
 * Gates of the daily portfolio: repairs in place (drops what is implausible) and returns the issues. Never blocking:
 * without a plausible daily block the page shows the month-end factsheet figures.
 */
export function checkPortfolio(f: FundData, base: string, now: Date): Issue[] {
  const p = f.portfolio;
  if (!p) return [];
  const key = `${base}.portfolio`;
  const issues: Issue[] = [];
  const warn = (k: string, message: string) => issues.push({ key: k, level: "warn", message });
  const drop = (why: string): Issue[] => {
    warn(key, `daily portfolio not shown: ${why}; month-end factsheet figures shown`);
    f.portfolio = null;
    return issues;
  };
  const stale = bookAgeProblem(p.asOf, now);
  if (stale) return drop(stale);

  p.characteristics = (p.characteristics ?? []).filter((m) => {
    const why = metricProblem(m);
    if (why) warn(`${key}.characteristics.${m.id}`, `${m.id} not shown: ${why}`);
    return !why;
  });
  for (const [k, rows] of Object.entries(p.breakdowns ?? {}) as [keyof PortfolioData["breakdowns"], WeightBucket[]][]) {
    const why = breakdownProblem(rows ?? []);
    if (why) {
      warn(`${key}.breakdowns.${k}`, `${k} breakdown not shown: ${why}`);
      delete p.breakdowns[k];
    }
  }
  const hw = holdingsProblem(p.topHoldings ?? []);
  if (hw) {
    warn(`${key}.topHoldings`, `top holdings not shown: ${hw}`);
    p.topHoldings = [];
  }
  for (const h of p.topHoldings) {
    // field repairs: an implausible detail is blanked, the holding and its weight stay
    if (h.coupon !== null && !(isNum(h.coupon) && h.coupon >= PORTFOLIO.ranges.coupon[0] && h.coupon <= PORTFOLIO.ranges.coupon[1])) h.coupon = null;
    if (h.maturity !== null && !(typeof h.maturity === "string" && ISO.test(h.maturity))) h.maturity = null;
  }
  if (p.greenBondsWeight !== null && !(isNum(p.greenBondsWeight) && p.greenBondsWeight >= 0 && p.greenBondsWeight <= 1)) {
    warn(`${key}.greenBondsWeight`, `green bonds weight ${p.greenBondsWeight} not shown`);
    p.greenBondsWeight = null;
  }
  if (p.totals) {
    const t = p.totals;
    for (const k of ["holdings", "bonds", "derivatives"] as const) if (t[k] !== null && !(isNum(t[k]) && Number.isInteger(t[k]) && (t[k] as number) >= 0)) t[k] = null;
    if (t.cashWeight !== null && !(isNum(t.cashWeight) && Math.abs(t.cashWeight) <= 1)) t.cashWeight = null;
  }
  if (p.coverage) for (const k of ["resolved", "priced"] as const) if (p.coverage[k] !== null && !(isNum(p.coverage[k]) && (p.coverage[k] as number) >= 0 && (p.coverage[k] as number) <= 1)) p.coverage[k] = null;
  if (!p.characteristics.length && !Object.keys(p.breakdowns).length && !p.topHoldings.length) return drop("nothing plausible left");
  return issues;
}

/* ------------------------------------------------------------------ distributions */

/** Why one series' distributions are implausible or internally inconsistent, or null. `nav`: its NAV per unit when known. */
export function distributionProblem(c: ClassDistribution, nav: number | null, today: string): string | null {
  const navOk = isNum(nav) && nav > 0;
  let prev = "";
  for (const h of c.history) {
    if (typeof h.date !== "string" || !ISO.test(h.date) || h.date > today) return `invalid date ${h.date}`;
    if (h.date <= prev) return `dates not ascending at ${h.date}`;
    prev = h.date;
    if (!isNum(h.amount) || h.amount <= 0) return `amount ${h.amount} on ${h.date}`;
    if (navOk && h.amount >= DISTRIBUTIONS.maxShareOfNav * (nav as number)) return `${h.amount} on ${h.date} is ${pct(h.amount / (nav as number))} of the NAV per unit`;
  }
  const lastRow = c.history[c.history.length - 1];
  if (c.last) {
    if (!lastRow || lastRow.date !== c.last.date || Math.abs(lastRow.amount - c.last.amount) > 1e-9) return `last distribution ${c.last.date} ${c.last.amount} differs from the last row`;
  } else if (lastRow) return "rows but no last distribution";
  if (c.trailing12m !== null) {
    if (!isNum(c.trailing12m) || c.trailing12m < 0) return `trailing 12 months ${c.trailing12m}`;
    if (navOk && c.trailing12m >= DISTRIBUTIONS.maxTrailingShareOfNav * (nav as number)) return `trailing 12 months ${c.trailing12m} is ${pct(c.trailing12m / (nav as number))} of the NAV per unit`;
  }
  for (const y of c.calendarYears) {
    const rows = c.history.filter((h) => h.date.startsWith(`${y.year}-`));
    const total = rows.reduce((a, h) => a + h.amount, 0);
    if (!isNum(y.amount) || y.count !== rows.length || Math.abs(y.amount - total) > DISTRIBUTIONS.sumTol * Math.max(1, rows.length)) {
      return `calendar year ${y.year}: ${y.amount} over ${y.count} vs ${+total.toFixed(6)} over ${rows.length} row(s)`;
    }
  }
  return null;
}

/** Same day one year earlier, 29 February → 28 February (the data platform's `_year_before`), YYYY-MM-DD. */
export function yearBefore(date: string): string {
  const y = String(+date.slice(0, 4) - 1).padStart(4, "0"), md = date.slice(5);
  return md === "02-29" ? `${y}-02-28` : `${y}-${md}`;
}

/**
 * Why the trailing-12-month total disagrees with the series' own rows, or null. The window is the data platform's: the
 * distributions dated after the same day one year before `to` (the response's end date, the day of the read — not the
 * last distribution), up to and including `to`. The rows cover every distribution since the fund's data start; when the
 * history was capped (DISTRIBUTIONS.maxHistory) short of the window start, the figure cannot be checked.
 */
export function trailingProblem(c: ClassDistribution, to: string | null | undefined, today: string): string | null {
  if (c.trailing12m === null) return null;
  if (typeof to !== "string" || !ISO.test(to)) return "end of the 12-month window unknown";
  if (to > today) return `end of the 12-month window ${to} is in the future`;
  const from = yearBefore(to);
  if (c.history.length && c.history[0].date > from && c.history.length >= DISTRIBUTIONS.maxHistory) return `history does not reach back to ${from}`;
  const rows = c.history.filter((h) => h.date > from && h.date <= to);
  const total = rows.reduce((a, h) => a + h.amount, 0);
  return Math.abs(total - c.trailing12m) > DISTRIBUTIONS.sumTol * Math.max(1, rows.length)
    ? `${c.trailing12m} vs ${+total.toFixed(6)} over the ${rows.length} distribution(s) after ${from} up to ${to}`
    : null;
}

/**
 * Gates of the distributions: drops them all when the source has not been read successfully for too long (carried
 * over), the series that fail (see distributionProblem), and a trailing-12-month figure that its rows do not add up to.
 * Returns the issues.
 */
export function checkDistributions(f: FundData, base: string, now: Date): Issue[] {
  const d = f.distributions;
  if (!d) return [];
  const today = now.toISOString().slice(0, 10);
  const issues: Issue[] = [];
  const read = typeof d.checkedAt === "string" && ISO.test(d.checkedAt) ? Math.floor(days(d.checkedAt, now)) : Number.NaN; // whole days
  if (!(read <= DISTRIBUTIONS.maxCarryDays)) {
    issues.push({ key: `${base}.distributions`, level: "warn", message: `distributions not shown: source last read successfully ${d.checkedAt ?? "(date unknown)"}, more than ${DISTRIBUTIONS.maxCarryDays} days ago` });
    f.distributions = null;
    return issues;
  }
  d.classes = (d.classes ?? []).filter((c) => {
    const nav = f.nav?.classes.find((k) => k.fundserv.toUpperCase() === c.fundserv.toUpperCase())?.nav ?? null;
    const why = distributionProblem(c, nav, today);
    if (why) issues.push({ key: `${base}.distributions.${c.fundserv}`, level: "warn", message: `distributions of series ${c.display} (${c.fundserv}) not shown: ${why}` });
    return !why;
  });
  for (const c of d.classes) {
    const why = trailingProblem(c, d.trailingTo, today);
    if (why) {
      issues.push({ key: `${base}.distributions.${c.fundserv}.trailing12m`, level: "warn", message: `trailing 12 months of series ${c.display} (${c.fundserv}) not shown: ${why}` });
      c.trailing12m = null;
    }
  }
  if (!d.classes.length) f.distributions = null;
  return issues;
}

export interface ValidationOutcome {
  /**
   * data after repairs and merge (blocked funds replaced by their previous publication). A fund whose performance
   * class changes keeps its NEW data here: this is what publishing (approving) the run publishes
   */
  data: SiteData;
  /**
   * what may be published without a human (auto mode): `data` with every fund whose performance class changes
   * replaced by its previous publication (== data when there is none)
   */
  autoData: SiteData;
  /** funds whose performance class changes: the run needs an admin approval to publish them */
  classChanges: FundKey[];
  results: FundValidation[];
  funds: Partial<Record<FundKey, "updated" | "kept-previous" | "unavailable">>;
}

/**
 * Validate every fund of `data`, repair what can be repaired, and merge: a fund with a blocking issue
 * keeps its previously published FundData (or is withheld when there is none). Pure: returns a new object.
 */
export function validateSite(input: SiteData, context: Partial<Record<FundKey, FundContext>>, previous: SiteData | null, now: Date): ValidationOutcome {
  const data: SiteData = structuredClone(input); // keeps NaN / Infinity, so they can be caught below
  const prevLive = previous && previous.mode === "live" ? previous : null;
  const results: FundValidation[] = [];
  const funds: ValidationOutcome["funds"] = {};
  const extraIssues: Issue[] = [];
  const held: Partial<Record<FundKey, FundData>> = {};
  const keys = new Set<FundKey>([...(Object.keys(context) as FundKey[]), ...(Object.keys(data.funds) as FundKey[])]);
  for (const key of keys) {
    const base = `funds.${key}`;
    const f = data.funds[key];
    const prev = prevLive?.funds[key];
    const ctx = context[key];
    const blocking: Issue[] = [];
    const warnings: Issue[] = [];
    // a carried-over fund passes the daily-book gate again: its book may have become too old since it was published;
    // its performance is labelled by its own class (perf-class.ts)
    const carry = (): FundData => {
      const c = structuredClone(fundWithClassLabel(prev!)!);
      const issues = [...checkPortfolio(c, base, now), ...checkDistributions(c, base, now)];
      if (issues.length) {
        warnings.push(...issues);
        extraIssues.push(...issues);
      }
      if (!c.portfolio) delete data.provenance[`${base}.portfolio`];
      if (!c.distributions) delete data.provenance[`${base}.distributions`];
      return c;
    };
    if (!f) {
      funds[key] = prev ? "kept-previous" : "unavailable";
      if (prev) data.funds[key] = carry();
      results.push({ fund: key, blocking, warnings, alerts: [...(ctx?.alerts ?? []), prev ? "fund carried over" : "fund unavailable"] });
      continue;
    }
    const repairs: Issue[] = [];
    checkNav(f, prev, base, repairs, warnings, now);
    checkAum(f, prev, base, repairs, warnings, now);
    warnings.push(...checkPortfolio(f, base, now), ...checkDistributions(f, base, now));
    checkPerformance(f, ctx, prev, base, blocking, warnings, now);
    for (const i of checkClassesAndVariants(f, base)) (i.level === "error" ? blocking : warnings).push(i);
    for (const p of nonFinitePaths(f, base)) blocking.push({ key: p, level: "error", message: `non-finite number at ${p}` });
    extraIssues.push(...repairs, ...warnings);
    // a change of performance class (e.g. SEB class H -> F) restates every month under another label: it is never
    // published without an admin approving the run, whatever the publish mode (the previous publication stays live)
    const fromClass = prev?.performance ? perfClassCode(key, prev.performance) : null;
    const toClass = f.performance?.classCode ?? null;
    const classChange: Issue | null = !blocking.length && fromClass && toClass && fromClass !== toClass
      ? { key: `${base}.performance.class`, level: "error", message: `performance class change from class ${classLabel(key, fromClass) ?? "?"} (${fromClass}) to class ${classLabel(key, toClass) ?? "?"} (${toClass}): every month restated and relabelled; an admin must approve (publish) this run — until then the previous publication stays live, also in auto mode` }
      : null;
    // performance (and what is computed from it: trailing, risk) is gated on its own: when only it fails, the NAV,
    // AUM, portfolio and distributions still publish and the performance alone is held (previous kept, else withheld)
    // (the returns of a class or a variant are part of it: they are held with it)
    const isPerf = (i: Issue) => [`${base}.performance`, `${base}.trailing`, `${base}.risk`, `${base}.risk3Y`].some((k) => i.key === k || i.key.startsWith(`${k}.`) || i.key.startsWith(`${k}[`))
      || new RegExp(`^${base.replaceAll(".", "\\.")}\\.(performanceByClass|variants)\\.[^.]+\\.(performance|risk|risk3Y)([.\\[]|$)`).test(i.key);
    const perfBlocking = blocking.filter(isPerf);
    if (blocking.length && perfBlocking.length === blocking.length) {
      const kept = prev?.performance ? structuredClone(fundWithClassLabel(prev)!) : null;
      f.performance = kept?.performance ?? null;
      f.risk = kept?.risk ?? null;
      if (kept?.risk3Y !== undefined) f.risk3Y = kept.risk3Y;
      else delete f.risk3Y;
      // the hold covers every class and variant: their returns come with the held performance, never new next to old
      if (kept?.performanceByClass) {
        f.performanceByClass = kept.performanceByClass;
        if (kept.defaultClass) f.defaultClass = kept.defaultClass;
        else delete f.defaultClass;
      } else {
        delete f.performanceByClass;
        delete f.defaultClass;
      }
      if (f.variants) {
        const dv = f.defaultVariant;
        for (const id of Object.keys(f.variants)) {
          const old = kept?.variants?.[id];
          if (id === dv) f.variants[id] = { ...f.variants[id], performance: f.performance, risk: f.risk, risk3Y: f.risk3Y ?? null };
          else if (old?.performance) f.variants[id] = old;
          else delete f.variants[id];
        }
      }
      for (const k of [`${base}.performance`, `${base}.risk`]) {
        const was = prevLive?.provenance[k];
        if (kept?.performance && was) data.provenance[k] = was.startsWith("carried over") ? was : `carried over from the publication of ${prevLive!.generatedAt} (${was})`;
        else delete data.provenance[k];
      }
      const closed = lastClosedMonth(now);
      if (kept?.performance && kept.performance.asOf < addMonths(closed, -1)) {
        const stale: Issue = { key: `${base}.performance.asOf`, level: "error", message: `stale: kept performance as of ${kept.performance.asOf.slice(0, 7)} while ${closed.slice(0, 7)} is closed` };
        warnings.push(stale);
        extraIssues.push(stale);
      }
      extraIssues.push(...blocking, { key: `${base}.performance`, level: "error", message: `performance held back by ${blocking.length} validation error(s): ${kept?.performance ? "previously published performance kept" : "performance withheld (nothing previously published)"}; NAV, AUM, portfolio and distributions published` });
      const parts = ctx?.parts;
      // the held performance is not an update: the fund counts as updated only when another part is fresh
      funds[key] = (parts ? Object.entries(parts).every(([n, s]) => n === "performance" || (s !== "fresh" && s !== "held")) : false) && prev ? "kept-previous" : "updated";
    } else if (blocking.length) {
      extraIssues.push(...blocking, { key: base, level: "error", message: `fund blocked by ${blocking.length} validation error(s): ${prev ? "previously published data kept" : "fund withheld (nothing previously published)"}` });
      if (prev) {
        funds[key] = "kept-previous";
        for (const k of Object.keys(data.provenance)) if (k === base || k.startsWith(`${base}.`)) delete data.provenance[k];
        for (const [k, v] of Object.entries(prevLive!.provenance)) if (k === base || k.startsWith(`${base}.`)) data.provenance[k] = v.startsWith("carried over") ? v : `carried over from the publication of ${prevLive!.generatedAt} (${v})`;
        data.funds[key] = carry();
      } else {
        delete data.funds[key];
        funds[key] = "unavailable";
      }
    } else {
      const parts = ctx?.parts;
      const allCarried = parts ? Object.values(parts).every((s) => s !== "fresh" && s !== "held") : false;
      funds[key] = allCarried && prev ? "kept-previous" : "updated";
      if (classChange) {
        extraIssues.push(classChange);
        held[key] = carry();
      }
    }
    const alerts = [...(ctx?.alerts ?? [])];
    if (blocking.length) alerts.push(perfBlocking.length === blocking.length ? "performance held back by validation" : "blocked by validation");
    if (classChange) {
      blocking.push(classChange);
      alerts.push(`performance class change to class ${classLabel(key, toClass) ?? "?"} needs approval`);
    }
    for (const i of [...repairs, ...warnings]) if (i.level === "error") alerts.push(i.message);
    for (const i of input.issues) if (i.level === "error" && (i.key === base || i.key.startsWith(`${base}.`))) alerts.push(i.message);
    results.push({ fund: key, blocking, warnings: [...repairs, ...warnings], alerts: [...new Set(alerts)] });
  }
  data.issues = [...data.issues, ...extraIssues];
  data.asOf = computeAsOf(data.funds);
  const classChanges = Object.keys(held) as FundKey[];
  let autoData = data;
  if (classChanges.length) {
    autoData = structuredClone(data);
    for (const key of classChanges) {
      const base = `funds.${key}`;
      autoData.funds[key] = held[key];
      for (const k of Object.keys(autoData.provenance)) if (k === base || k.startsWith(`${base}.`)) delete autoData.provenance[k];
      for (const [k, v] of Object.entries(prevLive!.provenance)) if (k === base || k.startsWith(`${base}.`)) autoData.provenance[k] = v.startsWith("carried over") ? v : `carried over from the publication of ${prevLive!.generatedAt} (${v})`;
    }
    autoData.asOf = computeAsOf(autoData.funds);
  }
  return { data, autoData, classChanges, results, funds };
}

/** Gates of one fund, without merging (convenience for the admin / tests). */
export function validateFund(f: FundData, ctx: FundContext | undefined, previous: SiteData | null, now: Date): FundValidation {
  const site: SiteData = { schemaVersion: 1, generatedAt: now.toISOString(), mode: "live", asOf: { performance: null, nav: null, aum: null, factsheet: null }, funds: { [f.key]: f }, provenance: {}, issues: [] };
  return validateSite(site, ctx ? { [f.key]: ctx } : {}, previous, now).results.find((r) => r.fund === f.key)!;
}
