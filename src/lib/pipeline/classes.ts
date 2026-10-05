/**
 * Returns per class (series) into `ClassPerformance`. Pure (no I/O). A class is shown only with its own series
 * (class-returns.ts: its own daily chain from its inception), ending at the validated as-of month of the fund — never
 * another class's numbers.
 *
 * A month that failed a check is withheld (absent from `monthly`, listed in `withheldMonths`): every figure whose window
 * contains a withheld month is null ("—"), the growth series starts after the last withheld month. The first month runs
 * from the inception NAV per unit (`partialFirstMonth`): it counts for the since-inception return, the calendar year of
 * inception and the growth series only — never for a fixed period (1 month … 10 years), the year to date or the risk
 * statistics, which use complete months — and no index figure is set against it.
 * A class with less than CLASS_CHECKS.minHistoryMonths months since its inception shows no figure at all (regulatory
 * minimum): `ClassInfo.status` "young".
 */
import type { CalendarRow, ClassInfo, ClassPerformance, GrowthPoint, Issue, MonthlyPoint, Performance, PeriodMap, RiskStats } from "../data/types.ts";
import { PERIODS } from "../data/types.ts";
import type { ClassSeriesSource } from "./fund-sources.ts";
import type { ClassMonthResult, ClassResult } from "./class-returns.ts";
import { hasMinHistory } from "./class-returns.ts";
import {
  addMonths, annualize, calendarYears, clean, compound, growth as growthOf, monthsBetween, riskStats, sortedKeys, trailing as trailingOf, window, type RiskResult, type Series,
} from "./metrics.ts";

const PERIOD_LIST = PERIODS as readonly string[];
const ym = (d: string): string => d.slice(0, 7);
const dayDiff = (a: string, b: string): number => (Date.parse(`${b.slice(0, 10)}T00:00:00Z`) - Date.parse(`${a.slice(0, 10)}T00:00:00Z`)) / 86_400_000;

const toPoints = (s: Series): MonthlyPoint[] => sortedKeys(s).map((month) => ({ month, r: s[month] }));

function riskFrom(r: RiskResult | null): RiskStats | null {
  if (!r) return null;
  return {
    window: r.window, annReturn: r.annReturn, annVol: r.annVol, downsideDev: r.downsideDev, sharpe: r.sharpe, sortino: r.sortino,
    maxDrawdown: r.maxDrawdown, positiveMonths: r.positiveMonths, bestMonth: r.bestMonth, worstMonth: r.worstMonth,
  };
}

/** what the trailing figures of a class entry are computed from */
export interface ClassSeriesShape {
  /** usable monthly returns (withheld months absent), the partial first month included */
  all: Series;
  asOf: string;
  firstMonth: string;
  inception: string;
  partialFirst: boolean;
}

/**
 * Trailing returns of a class (fund side). Fixed periods and YTD from complete months only (a window containing a withheld
 * month, or reaching into the partial first month, is null); YTD only when the year's January is usable and complete; since inception only when EVERY month from the first one is usable — compounded from the
 * inception NAV, annualized from one year on (over calendar days, 365 a year, when the first month is partial, else over months).
 */
export function classFundTrailing(c: ClassSeriesShape): PeriodMap {
  const full: Series = {};
  for (const m of sortedKeys(c.all)) if (!(c.partialFirst && m === c.firstMonth)) full[m] = c.all[m];
  const t = trailingOf(full, c.asOf);
  const out: PeriodMap = {};
  for (const p of PERIOD_LIST) out[p as keyof PeriodMap] = null;
  for (const p of ["1M", "3M", "1Y", "2Y", "3Y", "5Y", "10Y"] as const) out[p] = t[p];
  const year = c.asOf.slice(0, 4);
  const jan = `${year}-01-31`;
  const ytd = window(full, c.asOf, undefined, `${year}-01-01`);
  // a class priced since before the year's first valuation day (its first complete month may be January itself)
  out.YTD = ytd && jan in full && (c.firstMonth < jan || (c.firstMonth === jan && !c.partialFirst)) ? compound(ytd) : null;
  const si = window(c.all, c.asOf, undefined, c.firstMonth);
  if (si && c.firstMonth in c.all && monthsBetween(c.firstMonth, c.asOf) === si.length) {
    const total = compound(si);
    if (c.partialFirst) {
      // one year = 365 days (the 12-month minimum guarantees at least that much for a class with figures)
      const days = dayDiff(c.inception, c.asOf);
      out.SI = days >= 365 ? Math.pow(1 + total, 365 / days) - 1 : total;
    } else out.SI = si.length >= 12 ? annualize(si) : total;
  }
  return out;
}

/** Rebuild the class series shape of a published class entry (for validation recomputations). */
export function shapeOf(p: Performance): ClassSeriesShape | null {
  if (!p.inception) return null;
  const all: Series = {};
  for (const m of p.monthly) all[m.month] = m.r;
  return { all, asOf: p.asOf, firstMonth: p.firstMonth, inception: p.inception, partialFirst: !!p.partialFirstMonth };
}

export interface ClassEntryInput {
  /** dotted key base of the issues, e.g. `funds.sustainable-enhanced-bonds.performance.classes.LDM202` */
  key: string;
  cls: ClassSeriesSource;
  result: ClassResult;
  /** validated as-of month of the fund: the class series ends there */
  asOf: string;
  /** benchmark monthly returns (FTSE), null when the fund has none */
  idx: Series | null;
  indexName?: string;
  minMonths: number;
}

export interface ClassEntryBuild {
  entry: ClassPerformance | null;
  info: ClassInfo;
  issues: Issue[];
}

/** One class (not the track-record one) from its own months (class-returns.ts). */
export function buildClassEntry(inp: ClassEntryInput): ClassEntryBuild {
  const { key, cls, result: res, asOf, idx } = inp;
  const issues: Issue[] = [];
  const label = `class ${cls.display} (${cls.fundserv})`;
  const info: ClassInfo = { fundserv: cls.fundserv, display: cls.display, currency: res.currency, inception: res.inception, status: "unavailable" };
  if (res.status === "currency") {
    issues.push({ key, level: "info", message: `${label}: ${res.why}; no performance shown for this series (the page says why)` });
    return { entry: null, info: { ...info, status: "currency" }, issues };
  }
  if (res.status !== "ok" || !res.inception) {
    issues.push({ key, level: "warn", message: `${label}: ${res.why ?? "no usable daily history"}; returns not shown for this class ("coming soon")` });
    return { entry: null, info, issues };
  }
  if (res.previousRunEnd) issues.push({ key, level: "warn", message: `${label}: relaunch detected (gap after ${res.previousRunEnd}, corroborated by the NAV per unit or the gap length) — earlier NAVs treated as a previous life of the code; inception ${res.inception}: check against the register` });
  for (const g of res.gaps ?? []) issues.push({ key, level: "warn", message: `${label}: no NAV per unit from ${g.from} to ${g.to} and no relaunch corroborated: a coverage gap, the months it touches are withheld` });
  if (!hasMinHistory(res.inception, asOf, inp.minMonths)) {
    issues.push({ key, level: "info", message: `${label}: inception ${res.inception}, less than ${inp.minMonths} months before ${ym(asOf)}: no performance figure (regulatory minimum)` });
    return { entry: null, info: { ...info, status: "young", minMonths: inp.minMonths }, issues };
  }
  const months: ClassMonthResult[] = res.months.filter((m) => m.month <= asOf);
  if (!months.length || months[months.length - 1].month !== asOf) {
    issues.push({ key, level: "warn", message: `${label}: no month computed up to ${ym(asOf)}; returns not shown for this class` });
    return { entry: null, info, issues };
  }
  const firstMonth = months[0].month;
  const partialFirst = months[0].partial;
  const withheld = months.filter((m) => m.r === null);
  const all: Series = {};
  for (const m of months) if (m.r !== null) all[m.month] = m.r;
  if (!Object.keys(all).length) {
    issues.push({ key, level: "warn", message: `${label}: every month since inception withheld (${withheld.slice(0, 2).map((m) => `${ym(m.month)} ${m.reason}`).join("; ")}…); returns not shown for this class` });
    return { entry: null, info, issues };
  }
  for (const m of withheld) issues.push({ key: `${key}.monthly.${m.month}`, level: "warn", message: `${label}: ${ym(m.month)} withheld ("—"): ${m.reason}` });
  const shape: ClassSeriesShape = { all, asOf, firstMonth, inception: res.inception, partialFirst };
  const fund = classFundTrailing(shape);
  const firstFull = partialFirst ? addMonths(firstMonth, 1) : firstMonth;
  const full: Series = {};
  for (const m of sortedKeys(all)) if (m >= firstFull) full[m] = all[m];

  // benchmark over the same complete months (never against the partial first month)
  const trailing: Performance["trailing"] = { fund };
  let indexMonthly: MonthlyPoint[] | undefined;
  if (idx) {
    const ti = trailingOf(idx, asOf, { siStart: firstMonth });
    const index: PeriodMap = {};
    const va: PeriodMap = {};
    for (const p of PERIOD_LIST) {
      const k = p as keyof PeriodMap;
      const fv = fund[k];
      const iv = fv == null || (k === "SI" && partialFirst) ? null : ti[k as keyof typeof ti] ?? null;
      index[k] = iv;
      va[k] = fv != null && iv != null ? clean(fv - iv) : null;
    }
    trailing.index = index;
    trailing.va = va;
    const inRange: Series = {};
    for (const m of sortedKeys(idx)) if (m >= firstFull && m <= asOf) inRange[m] = idx[m];
    indexMonthly = toPoints(inRange);
  }
  const idxCal = idx ? new Map(calendarYears(idx, asOf, { first: firstMonth }).map((y) => [y.year, y])) : null;
  const firstYear = +firstMonth.slice(0, 4);
  const calendar: CalendarRow[] = calendarYears(all, asOf, { first: firstMonth }).map((y) => {
    const row: CalendarRow = { year: y.year, fund: y.value };
    if (y.partial) row.partial = true;
    if (idxCal) {
      const iy = idxCal.get(y.year);
      const iv = y.value != null && iy && iy.months === y.months && !(partialFirst && y.year === firstYear) ? iy.value : null;
      row.index = iv;
      row.va = iv != null && y.value != null ? clean(y.value - iv) : null;
    }
    return row;
  });

  // growth: from the inception (all months usable) or from the month-end after the last withheld month
  const lastWithheld = withheld.length ? withheld[withheld.length - 1].month : null;
  const gStart = lastWithheld ? addMonths(lastWithheld, 1) : firstMonth;
  let growth: GrowthPoint[] = [];
  let growthFrom: string | undefined;
  if (gStart <= asOf) {
    const pts = growthOf(all, asOf, { first: gStart });
    const fromInception = gStart === firstMonth;
    growthFrom = fromInception ? res.inception : addMonths(gStart, -1);
    const withIndex = !!idx && !(fromInception && partialFirst);
    // from the inception, the first point is the inception day itself (the series starts at that day's NAV per unit)
    if (fromInception && partialFirst && pts.length) pts[0] = { ...pts[0], date: res.inception };
    let acc: number | null = 1;
    growth = pts.map((pt, i) => {
      if (!withIndex) return { date: pt.date, fund: pt.value };
      if (i > 0) acc = acc != null && pt.date in idx! ? acc * (1 + idx![pt.date]) : null;
      return { date: pt.date, fund: pt.value, index: acc != null ? 10_000 * acc : null };
    });
  }

  const performance: Performance = {
    asOf, basis: "net", method: "compounded", firstMonth, monthly: toPoints(all),
    ...(indexMonthly ? { indexMonthly } : {}), trailing, calendar, growth,
    classCode: cls.classCode, returnClass: cls.display, returnClassLabel: `Series ${cls.display}`,
    ...(inp.indexName ? { indexName: inp.indexName } : {}),
    inception: res.inception,
    ...(partialFirst ? { partialFirstMonth: true } : {}),
    ...(withheld.length ? { withheldMonths: withheld.map((m) => m.month) } : {}),
    ...(growthFrom ? { growthFrom } : {}),
  };
  // risk statistics over complete months: since inception only when every complete month is usable
  const fullCount = Object.keys(full).length;
  const risk = fullCount === monthsBetween(firstFull, asOf) ? riskFrom(riskStats(full, asOf, "SI")) : null;
  const risk3Y = riskFrom(riskStats(full, asOf, "3Y"));
  if (withheld.length) {
    const nulls = PERIOD_LIST.filter((p) => fund[p as keyof PeriodMap] == null).join(", ");
    issues.push({ key, level: "warn", message: `${label}: ${withheld.length} month(s) withheld (${withheld.map((m) => ym(m.month)).join(", ")}); figures over them withheld (${nulls || "none"}${risk ? "" : ", risk since inception"}${risk3Y ? "" : ", risk 3 years"}); growth from ${growthFrom ?? "—"}` });
  }
  return { entry: { fundserv: cls.fundserv, display: cls.display, performance, risk, risk3Y }, info: { ...info, status: "shown" }, issues };
}

/**
 * The class the page opens on: the registry's headline class when it has returns, else the first class (in `order`) that
 * has returns; undefined when none has.
 */
export function pickDefaultClass(headline: string | null | undefined, order: string[], byClass: Record<string, unknown>): string | undefined {
  if (headline && byClass[headline]) return headline;
  return order.find((k) => byClass[k]) ?? Object.keys(byClass).sort()[0];
}

/**
 * Why a performance block cannot be published (used for the classes and variants, whose failure drops that class /
 * variant only, never the fund): non-finite or implausible monthly returns (beyond ±25 %), a series that has a gap (other
 * than its declared withheld months) or does not end at as-of, trailing figures that differ from a recomputation
 * (`recompute`: the pipeline computed them), a growth series that does not match the monthly returns. Empty = fine.
 */
export function performanceProblems(p: Performance, method: "compounded" | "arithmetic", recompute: boolean, maxMonthly = 0.25): string[] {
  const out: string[] = [];
  for (const m of p.monthly) if (!Number.isFinite(m.r) || Math.abs(m.r) > maxMonthly) out.push(`monthly return ${m.month} = ${m.r} is outside ±${maxMonthly * 100}%`);
  for (const m of p.indexMonthly ?? []) if (!Number.isFinite(m.r) || Math.abs(m.r) > maxMonthly) out.push(`index monthly return ${m.month} = ${m.r} is outside ±${maxMonthly * 100}%`);
  const ms = p.monthly.map((m) => m.month);
  const withheld = new Set(p.withheldMonths ?? []);
  const shape = shapeOf(p);
  if (!ms.length) out.push("no monthly return");
  else if (shape) {
    // a class entry: every month from the first one to as-of is either published or declared withheld, never both
    for (const m of ms) if (withheld.has(m)) { out.push(`month ${m} is both published and withheld`); break; }
    const have = new Set(ms);
    for (let m = p.firstMonth; m <= p.asOf; m = addMonths(m, 1)) if (!have.has(m) && !withheld.has(m)) { out.push(`monthly series has an undeclared gap at ${m}`); break; }
    if (ms.some((m) => m < p.firstMonth || m > p.asOf)) out.push(`a monthly return lies outside ${p.firstMonth} to ${p.asOf}`);
    if (ms[ms.length - 1] !== p.asOf && !withheld.has(p.asOf)) out.push(`last monthly return ${ms[ms.length - 1]} does not match as-of ${p.asOf}`);
  } else {
    if (ms[ms.length - 1] !== p.asOf) out.push(`last monthly return ${ms[ms.length - 1]} does not match as-of ${p.asOf}`);
    for (let i = 1; i < ms.length; i++) if (addMonths(ms[i - 1], 1) !== ms[i]) { out.push(`monthly series has a gap between ${ms[i - 1]} and ${ms[i]}`); break; }
    if (p.firstMonth !== ms[0]) out.push(`first month ${p.firstMonth} does not match the series (${ms[0]})`);
  }
  const series: Series = {};
  for (const m of p.monthly) series[m.month] = m.r;
  if (recompute && ms.length) {
    const t: PeriodMap = shape ? classFundTrailing(shape) : trailingOf(series, p.asOf, { method });
    for (const per of PERIODS) {
      const a = p.trailing.fund[per];
      const b = t[per] ?? null;
      if (a === undefined) continue;
      if ((a === null) !== (b === null) || (a !== null && b !== null && Math.abs(a - b) > 1e-9)) out.push(`trailing ${per} (${a}) differs from the recomputation (${b})`);
    }
  }
  if (p.growth.length && ms.length) {
    // the growth series starts at its first point (the month-end before its first month)
    const first = shape && p.partialFirstMonth && p.growth[0].date === p.inception ? p.firstMonth : addMonths(p.growth[0].date, 1);
    const rs = p.monthly.filter((m) => m.month >= first).map((m) => m.r);
    const expectedMonths = monthsBetween(first, p.asOf);
    if (shape && rs.length !== expectedMonths) out.push(`growth series from ${first} crosses a withheld month`);
    const expected = 10_000 * (1 + (method === "arithmetic" ? rs.reduce((a, b) => a + b, 0) : rs.reduce((a, r) => a * (1 + r), 1) - 1));
    const last = p.growth[p.growth.length - 1];
    if (last.date !== p.asOf || Math.abs(last.fund - expected) > 0.01) out.push(`growth of 10 000 ends at ${last.date} ${last.fund.toFixed(2)}, expected ${p.asOf} ${expected.toFixed(2)}`);
  }
  return out;
}
