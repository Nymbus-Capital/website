/**
 * Build: raw source payloads (+ previously published data) -> SiteData. Pure (no I/O, no clock: `now`
 * is a parameter).
 *
 * Rules
 *  - Net funds (SEST / SEB / Multistrat): the dataplatform "ready" monthly net returns are the
 *    reference. The track record must be complete from its official start to the as-of month (the
 *    last ready month): a hole (a month not ready before a ready one), or missing first months, makes
 *    the performance block unusable for this run (error issue, previous values carried over).
 *  - Trailing / calendar / growth / risk are computed from those returns (metrics.ts conventions).
 *  - The factsheet of the same month is a cross-check for the fund trailing (warn beyond rounding,
 *    validate.ts blocks beyond 0.5 %), and the published source for the INDEX trailing and value added
 *    (published numbers win; computed from the FTSE levels otherwise).
 *  - GMV (no fund vehicle): gross figures from the factsheet archive (factsheet_data), arithmetic
 *    (non-compounded) convention; trailing, calendar and statistics as published, monthly table for
 *    the monthly series / growth chart.
 *  - Compliance: a track record shorter than 12 months is not shown (performance and risk null).
 *  - A part whose source failed keeps its previously published value (issue + provenance say so).
 */
import { FUNDS, type FundSpec } from "../../config/funds.ts";
import type { Bucket, CalendarRow, Characteristic, FundData, FundKey, GrowthPoint, Issue, MonthlyPoint, NavClass, Performance, PeriodMap, RiskStats, SiteData, Trailing } from "../data/types.ts";
import { PERIODS } from "../data/types.ts";
import { PIPELINE_FUNDS, TOL } from "./config.ts";
import {
  addMonths, calendarYears, clean, growth as growthOf, levelsToMonthly, monthsBetween, riskStats, sortedKeys, toMonthEnd, trailing as trailingOf,
  type Method, type RiskResult, type Series,
} from "./metrics.ts";
import {
  BOND_CHARACTERISTICS, ESG_METRICS, isObj, MULTISTRAT_CHARACTERISTICS, parseAllocationSeries, parseBuckets, parseCalendarTable, parseCharacteristicTable,
  parseFlatCharacteristics, parseHoldings, parseMonthlyTable, parseStatistics, parseTrailingTable, type Obj, type TrailingTable,
} from "./parse.ts";
import type { DpShort, FundRef, NavPoint, RawPayloads, RegisteredFund } from "./raw.ts";

export type PartName = "performance" | "nav" | "aum" | "factsheet";
export type PartState = "fresh" | "carried" | "none";

/** What validate.ts needs besides the data itself. */
export interface FundContext {
  key: FundKey;
  method: Method;
  /** where the fund trailing figures come from */
  trailingSource: "computed" | "factsheet" | null;
  /** published fund trailing of the factsheet whose month equals the performance as-of (cross-check) */
  factsheetTrailing: PeriodMap | null;
  factsheetTrailingFile: string | null;
  parts: Record<PartName, PartState>;
}

export interface BuildResult { data: SiteData; context: Partial<Record<FundKey, FundContext>> }

const PERIOD_LIST = PERIODS as readonly string[];

/* ------------------------------------------------------------------ helpers */

const pct = (x: number): string => `${(x * 100).toFixed(2)}%`;
const ym = (d: string): string => d.slice(0, 7);

class Ctx {
  issues: Issue[] = [];
  prov: Record<string, string> = {};
  prevProv: Record<string, string> = {};
  prevGenerated = "";
  info(key: string, message: string): void { this.issues.push({ key, level: "info", message }); }
  warn(key: string, message: string): void { this.issues.push({ key, level: "warn", message }); }
  error(key: string, message: string): void { this.issues.push({ key, level: "error", message }); }
}

/** factsheet archive file name -> parsed month-keyed view, newest first */
function factsheetFilesFor(raw: RawPayloads, file: "bonds_data" | "factsheet_data"): { name: string; month: string; data: Obj }[] {
  const out: { name: string; month: string; data: Obj }[] = [];
  const files = raw.factsheets.ok && raw.factsheets.data ? raw.factsheets.data.files : {};
  for (const [name, data] of Object.entries(files)) {
    const m = name.match(/^(bonds_data|factsheet_data)_(\d{4}-\d{2})\.json$/);
    if (!m || m[1] !== file || !isObj(data)) continue;
    out.push({ name, month: m[2], data });
  }
  return out.sort((a, b) => (a.month < b.month ? 1 : -1));
}

function factsheetBlock(raw: RawPayloads, spec: FundSpec, month?: string): { name: string; month: string; block: Obj } | null {
  const fs = spec.sources.factsheet;
  if (!fs) return null;
  for (const f of factsheetFilesFor(raw, fs.file)) {
    if (month && f.month !== month) continue;
    const block = f.data[fs.key];
    if (isObj(block)) return { name: f.name, month: f.month, block };
  }
  return null;
}

const toPoints = (s: Series): MonthlyPoint[] => sortedKeys(s).map((month) => ({ month, r: s[month] }));

function fromTrailingMap(t: ReturnType<typeof trailingOf>): PeriodMap {
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

/* ------------------------------------------------------------------ net returns (dataplatform) */

interface NetSeries { series: Series; asOf: string; firstMonth: string; asOfSource: string; methodology?: string }

/**
 * Ready months of monthly-net-returns, checked for completeness from the track-record start.
 * Returns null (with an error issue) when the series cannot be used as a track record.
 */
function netSeries(raw: RawPayloads, short: DpShort, trackStart: string | null, key: string, c: Ctx): NetSeries | null {
  const res = raw.monthlyReturns[short];
  const j = res?.data;
  if (!res?.ok || !j) return null;
  const rows = j.rows.map((r) => ({ ...r, month: toMonthEnd(String(r.month)) }))
    .filter((r) => !trackStart || r.month >= trackStart)
    .sort((a, b) => (a.month < b.month ? -1 : 1));
  const ready = rows.filter((r) => r.status === "ready" && typeof r.net_return === "number" && Number.isFinite(r.net_return));
  if (!ready.length) {
    c.error(key, `dataplatform ${short}: no ready month`);
    return null;
  }
  const asOf = ready[ready.length - 1].month;
  const first = trackStart ?? ready[0].month;
  const series: Series = {};
  for (const r of ready) series[r.month] = r.net_return as number;
  const missing: string[] = [];
  for (let m = first; m <= asOf; m = addMonths(m, 1)) if (!(m in series)) missing.push(m);
  if (missing.length) {
    const why = rows.filter((r) => missing.includes(r.month)).map((r) => `${ym(r.month)} ${r.status}${r.issue ? ` (${r.issue})` : ""}`);
    c.error(key, `dataplatform ${short}: track record incomplete before ${ym(asOf)}: ${missing.length} month(s) not ready (${(why.length ? why : missing.map(ym)).slice(0, 4).join("; ")}${missing.length > 4 ? "; …" : ""}); performance not updated`);
    return null;
  }
  const later = rows.filter((r) => r.month > asOf);
  if (later.length) c.info(key, `dataplatform ${short}: ${later.map((r) => `${ym(r.month)} ${r.status}${r.issue ? ` (${r.issue})` : ""}`).join("; ")}; performance as of ${ym(asOf)}`);
  return { series, asOf, firstMonth: first, asOfSource: j.as_of, methodology: j.methodology_version };
}

/* ------------------------------------------------------------------ index */

function indexSeries(raw: RawPayloads, spec: FundSpec, prevPerf: Performance | null | undefined, key: string, c: Ctx): { series: Series; source: string } | null {
  const name = raw.ftseIndex[spec.key];
  if (!name) return null;
  const res = raw.ftse[name];
  if (res?.ok && res.data) return { series: levelsToMonthly(res.data.levels), source: `dataplatform /api/ftse/index-summary ${name} (aggregate total-return level, month-end to month-end)` };
  c.warn(`${key}.index`, `FTSE ${name} unavailable (${res?.error ?? "not fetched"})${prevPerf?.indexMonthly?.length ? "; previously published index months reused" : ""}`);
  if (prevPerf?.indexMonthly?.length) {
    const s: Series = {};
    for (const p of prevPerf.indexMonthly) s[p.month] = p.r;
    return { series: s, source: `previously published index months (FTSE ${name} unavailable this run)` };
  }
  return { series: {}, source: `FTSE ${name} unavailable` };
}

/* ------------------------------------------------------------------ performance */

interface PerfBuild { performance: Performance | null; risk: RiskStats | null; risk3Y: RiskStats | null; trailingSource: FundContext["trailingSource"]; fsTrailing: TrailingTable | null; fsFile: string | null }

function crossCheckFund(computed: PeriodMap, fs: TrailingTable | null, key: string, file: string | null, c: Ctx): void {
  if (!fs) return;
  for (const p of PERIOD_LIST) {
    const a = computed[p as keyof PeriodMap];
    const b = fs.fund[p as keyof PeriodMap];
    if (a == null || b == null) continue;
    const d = Math.abs(a - b);
    if (d > TOL.factsheetWarn && d <= TOL.factsheetBlock) c.warn(`${key}.trailing.${p}`, `${p}: computed ${pct(a)} vs factsheet ${file} ${pct(b)} (difference beyond rounding; computed kept)`);
  }
}

function buildNetPerformance(raw: RawPayloads, spec: FundSpec, prev: FundData | undefined, c: Ctx, base: string): PerfBuild | null {
  const short = spec.sources.dataplatform as DpShort;
  const pspec = PIPELINE_FUNDS[spec.key];
  const ns = netSeries(raw, short, pspec.trackStart, `${base}.performance`, c);
  if (!ns) return null;
  const { series, asOf, firstMonth } = ns;
  const n = monthsBetween(firstMonth, asOf);
  const empty: PerfBuild = { performance: null, risk: null, risk3Y: null, trailingSource: null, fsTrailing: null, fsFile: null };
  if (n < 12) {
    c.info(`${base}.performance`, `track record of ${n} month(s) (< 12): performance is not shown (regulatory rule)`);
    c.prov[`${base}.performance`] = `not shown: track record < 12 months (dataplatform ${short})`;
    return empty;
  }
  const fund = fromTrailingMap(trailingOf(series, asOf));

  // factsheet of the same month: cross-check (fund) and published figures (index, value added)
  const fsBlock = factsheetBlock(raw, spec, ym(asOf));
  const fsTrailing = fsBlock ? parseTrailingTable(fsBlock.block["Trailing Returns Net"], asOf.slice(0, 4)) : null;
  if (spec.sources.factsheet && !fsTrailing) c.info(`${base}.trailing`, `no factsheet trailing returns for ${ym(asOf)}: no published cross-check`);
  crossCheckFund(fund, fsTrailing, base, fsBlock?.name ?? null, c);

  const trailing: Trailing = { fund };
  let indexMonthly: MonthlyPoint[] | undefined;
  let idx: Series = {};
  const provParts: string[] = [];
  if (spec.sources.ftseIndex) {
    const is = indexSeries(raw, spec, prev?.performance, `${base}.performance`, c);
    for (const k of sortedKeys(is?.series ?? {})) if (k >= firstMonth && k <= asOf) idx[k] = is!.series[k];
    const computedIdx = fromTrailingMap(trailingOf(idx, asOf, { siStart: firstMonth }));
    const fsIdx = fsTrailing?.index ?? {};
    const fsVa = fsTrailing?.va ?? {};
    const index: PeriodMap = {};
    const va: PeriodMap = {};
    const fromFs: string[] = [];
    for (const p of PERIOD_LIST) {
      const k = p as keyof PeriodMap;
      if (fund[k] == null) { index[k] = null; va[k] = null; continue; }
      const f = fsIdx[k];
      if (f != null) {
        const comp = computedIdx[k];
        if (comp != null && Math.abs(comp - f) > TOL.factsheetWarn) c.warn(`${base}.trailing.index.${p}`, `index ${p}: FTSE computed ${pct(comp)} vs factsheet ${pct(f)} (factsheet used)`);
        index[k] = f;
        va[k] = fsVa[k] ?? clean((fund[k] as number) - f);
        fromFs.push(p);
      } else {
        index[k] = computedIdx[k] ?? null;
        va[k] = index[k] != null ? (fund[k] as number) - (index[k] as number) : null;
      }
    }
    trailing.index = index;
    trailing.va = va;
    indexMonthly = toPoints(idx);
    const missingIdx = PERIOD_LIST.filter((p) => fund[p as keyof PeriodMap] != null && index[p as keyof PeriodMap] == null);
    if (missingIdx.length) c.warn(`${base}.trailing.index`, `index ${missingIdx.join(", ")} unavailable (index history incomplete for the window, no published figure)`);
    provParts.push(`index: ${is?.source ?? "n/a"}${fromFs.length ? `; index & value added ${fromFs.join(", ")} as published in factsheet ${fsBlock!.name}` : ""}`);
  }

  // calendar
  const fsCal = fsBlock ? parseCalendarTable(fsBlock.block["Calendar Performance Net"]) : {};
  const idxCal = spec.sources.ftseIndex ? new Map(calendarYears(idx, asOf, { first: firstMonth }).map((y) => [y.year, y])) : null;
  const calendar: CalendarRow[] = calendarYears(series, asOf, { first: firstMonth }).map((y) => {
    const row: CalendarRow = { year: y.year, fund: y.value };
    if (y.partial) row.partial = true;
    if (idxCal) {
      const iy = idxCal.get(y.year);
      let iv = iy && iy.months === y.months ? iy.value : null;
      if (iv == null) iv = fsCal[String(y.year)]?.index ?? null; // published index calendar return, same month
      row.index = iv;
      row.va = iv != null && y.value != null ? y.value - iv : null;
    }
    return row;
  });

  // growth of 10 000
  const g = growthOf(series, asOf, { first: firstMonth });
  let idxAcc: number | null = 1;
  const growth: GrowthPoint[] = g.map((pt, i) => {
    if (!spec.sources.ftseIndex) return { date: pt.date, fund: pt.value };
    if (i > 0) idxAcc = idxAcc != null && pt.date in idx ? idxAcc * (1 + idx[pt.date]) : null;
    return { date: pt.date, fund: pt.value, index: idxAcc != null ? 10_000 * idxAcc : null };
  });

  const risk = riskFrom(riskStats(series, asOf, "SI"));
  const risk3Y = riskFrom(riskStats(series, asOf, "3Y"));

  // published statistics (multistrategy): warn-only cross-check
  const stats = fsBlock && isObj(fsBlock.block["Portfolio Snapshot"]) ? parseStatistics((fsBlock.block["Portfolio Snapshot"] as Obj)["Statistics Net"]) : null;
  if (stats && risk) {
    const checks: [string, number | null, number | null, number][] = [
      ["annReturn", risk.annReturn, stats.annReturn, 0.0006], ["annVol", risk.annVol, stats.annVol, 0.0006],
      ["downsideDev", risk.downsideDev, stats.downsideDev, 0.0006], ["sharpe", risk.sharpe, stats.sharpe, 0.051],
      ["sortino", risk.sortino, stats.sortino, 0.051], ["maxDrawdown", risk.maxDrawdown, stats.maxDrawdown, 0.0051],
      ["positiveMonths", risk.positiveMonths, stats.positiveMonths, 0.0051],
    ];
    for (const [k, a, b, tol] of checks) if (a != null && b != null && Math.abs(a - b) > tol) c.warn(`${base}.risk.${k}`, `${k}: computed ${a.toFixed(4)} vs factsheet ${fsBlock!.name} ${b.toFixed(4)} (computed kept)`);
  }

  c.prov[`${base}.performance`] = `dataplatform /api/performance/monthly-net-returns ${short} (ready months ${ym(firstMonth)} to ${ym(asOf)}${ns.methodology ? `, ${ns.methodology}` : ""}); trailing/calendar/growth computed (compounded, annualized beyond 1 year)${provParts.length ? `; ${provParts.join("; ")}` : ""}`;
  c.prov[`${base}.risk`] = `computed from the monthly net returns (SI and 3Y windows; population st.dev. ×√12; downside dev. = st.dev. of negative months ×√12; Sharpe and Sortino without risk-free rate, as in the factsheets)`;
  return {
    performance: { asOf, basis: "net", firstMonth, monthly: toPoints(series), ...(indexMonthly ? { indexMonthly } : {}), trailing, calendar, growth },
    risk, risk3Y, trailingSource: "computed", fsTrailing, fsFile: fsBlock?.name ?? null,
  };
}

/** GMV: gross, arithmetic; published figures from factsheet_data. */
function buildFactsheetPerformance(raw: RawPayloads, spec: FundSpec, c: Ctx, base: string): PerfBuild | null {
  const fsBlock = factsheetBlock(raw, spec);
  if (!fsBlock) return null;
  const b = fsBlock.block;
  const { points } = parseMonthlyTable(b["Monthly Returns Gross"]);
  if (!points.length) {
    c.error(`${base}.performance`, `factsheet ${fsBlock.name}: no "Monthly Returns Gross" table`);
    return null;
  }
  const series: Series = {};
  for (const p of points) series[p.month] = p.r;
  const firstMonth = points[0].month;
  const asOf = points[points.length - 1].month;
  if (ym(asOf) !== fsBlock.month) {
    c.error(`${base}.performance`, `factsheet ${fsBlock.name}: last monthly return is ${ym(asOf)}, expected ${fsBlock.month}`);
    return null;
  }
  const n = monthsBetween(firstMonth, asOf);
  if (n !== points.length) {
    c.error(`${base}.performance`, `factsheet ${fsBlock.name}: monthly table has gaps (${points.length} of ${n} months)`);
    return null;
  }
  const empty: PerfBuild = { performance: null, risk: null, risk3Y: null, trailingSource: null, fsTrailing: null, fsFile: null };
  if (n < 12) {
    c.info(`${base}.performance`, `track record of ${n} month(s) (< 12): performance is not shown (regulatory rule)`);
    return empty;
  }
  const fsTrailing = parseTrailingTable(b["Trailing Returns Gross"], asOf.slice(0, 4));
  if (!fsTrailing) {
    c.error(`${base}.performance`, `factsheet ${fsBlock.name}: no "Trailing Returns Gross"`);
    return null;
  }
  // published trailing figures (computed on unrounded returns); periods not published stay empty
  const fund: PeriodMap = {};
  for (const p of PERIOD_LIST) fund[p as keyof PeriodMap] = fsTrailing.fund[p as keyof PeriodMap] ?? null;
  const computed = fromTrailingMap(trailingOf(series, asOf, { method: "arithmetic" }));
  for (const p of PERIOD_LIST) {
    const a = computed[p as keyof PeriodMap];
    const f = fund[p as keyof PeriodMap];
    if (a != null && f != null && Math.abs(a - f) > 0.002 && Math.abs(a - f) <= TOL.factsheetBlock) c.warn(`${base}.trailing.${p}`, `${p}: published ${pct(f)} vs recomputed from the rounded monthly table ${pct(a)}`);
  }
  const fsCal = parseCalendarTable(b["Calendar Performance Gross"]);
  const calendar: CalendarRow[] = calendarYears(series, asOf, { method: "arithmetic", first: firstMonth }).map((y) => {
    const pub = fsCal[String(y.year)]?.fund;
    const row: CalendarRow = { year: y.year, fund: pub ?? y.value };
    if (y.partial) row.partial = true;
    return row;
  });
  const growth: GrowthPoint[] = growthOf(series, asOf, { method: "arithmetic", first: firstMonth }).map((p) => ({ date: p.date, fund: p.value }));
  const computedRisk = riskStats(series, asOf, "SI", "arithmetic");
  const snap = isObj(b["Portfolio Snapshot"]) ? (b["Portfolio Snapshot"] as Obj) : {};
  const pub = parseStatistics(snap["Statistics Gross"]);
  let risk: RiskStats | null = riskFrom(computedRisk);
  if (pub && risk) {
    risk = {
      ...risk,
      annReturn: pub.annReturn ?? risk.annReturn, annVol: pub.annVol ?? risk.annVol, downsideDev: pub.downsideDev ?? risk.downsideDev,
      sharpe: pub.sharpe ?? risk.sharpe, sortino: pub.sortino ?? risk.sortino, maxDrawdown: pub.maxDrawdown ?? risk.maxDrawdown,
      positiveMonths: pub.positiveMonths ?? risk.positiveMonths,
    };
  }
  const pub3 = parseStatistics(snap["Statistics Gross 3Y"]);
  let risk3Y = riskFrom(riskStats(series, asOf, "3Y", "arithmetic"));
  if (pub3 && risk3Y) {
    risk3Y = { ...risk3Y, annReturn: pub3.annReturn ?? risk3Y.annReturn, annVol: pub3.annVol ?? risk3Y.annVol, downsideDev: pub3.downsideDev ?? risk3Y.downsideDev, sharpe: pub3.sharpe ?? risk3Y.sharpe, sortino: pub3.sortino ?? risk3Y.sortino, maxDrawdown: pub3.maxDrawdown ?? risk3Y.maxDrawdown, positiveMonths: pub3.positiveMonths ?? risk3Y.positiveMonths };
  }
  c.prov[`${base}.performance`] = `factsheet ${fsBlock.name} (${spec.sources.factsheet!.key}): gross, non-compounded (overlay on notional); trailing and calendar as published; monthly table (1 decimal) for the monthly series and growth chart`;
  c.prov[`${base}.risk`] = pub ? `factsheet ${fsBlock.name} "Statistics Gross" (best/worst month from the monthly table)` : `computed from the factsheet monthly table (non-compounded)`;
  return {
    performance: { asOf, basis: "gross", firstMonth, monthly: points, trailing: { fund }, calendar, growth },
    risk, risk3Y, trailingSource: "factsheet", fsTrailing, fsFile: fsBlock.name,
  };
}

/* ------------------------------------------------------------------ NAV */

function registerFund(raw: RawPayloads, spec: FundSpec): RegisteredFund | null {
  if (!raw.apexFunds.ok || !raw.apexFunds.data) return null;
  const short = spec.sources.dataplatform;
  const refs: FundRef[] = raw.unitholderFunds.ok && raw.unitholderFunds.data ? raw.unitholderFunds.data : [];
  const acct = refs.find((r) => r.short_name === short)?.apex_account;
  const live = raw.apexFunds.data.filter((f) => f.status !== "wound_down");
  return (acct ? live.find((f) => f.apex_account === acct) : undefined) ?? live.find((f) => f.key === PIPELINE_FUNDS[spec.key].apexKey) ?? null;
}

function buildNav(raw: RawPayloads, spec: FundSpec, prev: FundData | undefined, c: Ctx, base: string): { nav: FundData["nav"]; state: PartState } {
  const short = spec.sources.dataplatform as DpShort;
  const res = raw.nav[short];
  const carry = (why: string): { nav: FundData["nav"]; state: PartState } => {
    c.warn(`${base}.nav`, `${why}; ${prev?.nav ? "previous NAV kept" : "no NAV shown"}`);
    if (prev?.nav) c.prov[`${base}.nav`] = carriedNoteFor(c, base, "nav");
    return { nav: prev?.nav ?? null, state: prev?.nav ? "carried" : "none" };
  };
  if (!res?.ok || !res.data) return carry(`NAV unavailable (${res?.error ?? "not fetched"})`);
  const reg = registerFund(raw, spec);
  let allowed: { fundserv: string; display: string | null; currency: string | null }[];
  if (reg) {
    allowed = reg.classes.filter((k) => k.status === "active").map((k) => ({ fundserv: k.fundserv, display: k.display, currency: k.currency }));
  } else if (prev?.nav?.classes.length) {
    c.warn(`${base}.nav`, `fund register unavailable (${raw.apexFunds.error ?? "fund not found"}): previously published classes used`);
    allowed = prev.nav.classes.map((k) => ({ fundserv: k.fundserv, display: k.display, currency: k.currency }));
  } else {
    return carry(`fund register unavailable (${raw.apexFunds.error ?? "fund not found in /api/apex/funds"}), live classes unknown`);
  }
  const byClass = new Map<string, Map<string, NavPoint>>();
  for (const r of res.data.rows) {
    if (!r.fundserv) continue;
    const v = r.nav_per_share_local;
    if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) continue;
    const m = byClass.get(r.fundserv) ?? new Map<string, NavPoint>();
    const cur = m.get(r.date);
    // several sources may report the same class/date: prefer apex
    if (!cur || (cur.source !== "apex" && r.source === "apex")) m.set(r.date, r);
    byClass.set(r.fundserv, m);
  }
  const classes: NavClass[] = [];
  for (const a of allowed) {
    const m = byClass.get(a.fundserv);
    const dates = m ? [...m.keys()].sort() : [];
    if (!dates.length) {
      c.info(`${base}.nav.${a.fundserv}`, `no NAV for class ${a.display ?? a.fundserv} (${a.fundserv}) in the last weeks`);
      continue;
    }
    const last = m!.get(dates[dates.length - 1])!;
    const before = dates.length > 1 ? m!.get(dates[dates.length - 2])! : null;
    const nav = last.nav_per_share_local as number;
    const prevNav = before ? (before.nav_per_share_local as number) : null;
    classes.push({
      fundserv: a.fundserv,
      display: a.display ?? last.class_display ?? a.fundserv,
      currency: a.currency ?? last.currency ?? "CAD",
      nav, date: last.date, prevNav,
      change: prevNav != null ? nav - prevNav : null,
      changePct: prevNav != null ? nav / prevNav - 1 : null,
    });
  }
  if (!classes.length) return carry("no NAV row for any live class");
  const asOf = classes.map((k) => k.date as string).sort().pop() ?? null;
  c.prov[`${base}.nav`] = `dataplatform /api/performance/nav-timeseries ${short} (FINAL_NAV, NAV per unit in class currency, apex preferred); classes from /api/apex/funds (active)`;
  return { nav: { asOf, classes }, state: "fresh" };
}

/* ------------------------------------------------------------------ AUM */

function buildAum(raw: RawPayloads, spec: FundSpec, prev: FundData | undefined, c: Ctx, base: string): { aum: FundData["aum"]; state: PartState } {
  const short = spec.sources.dataplatform as DpShort;
  if (!raw.aum.ok || !raw.aum.data) {
    c.warn(`${base}.aum`, `AUM unavailable (${raw.aum.error ?? "not fetched"}); ${prev?.aum ? "previous AUM kept" : "no AUM shown"}`);
    if (prev?.aum) c.prov[`${base}.aum`] = carriedNoteFor(c, base, "aum");
    return { aum: prev?.aum ?? null, state: prev?.aum ? "carried" : "none" };
  }
  const v = raw.aum.data.totals[short];
  if (v === undefined) {
    c.info(`${base}.aum`, `no AUM row for ${short}`);
    return { aum: null, state: "none" };
  }
  const asOf = raw.aum.data.snapshot_date ?? raw.fetchedAt.slice(0, 10);
  c.prov[`${base}.aum`] = `dataplatform /api/unitholders/aum group_by=short_name (sum of holding_value_cad, snapshot ${asOf}); fund total only`;
  return { aum: { cad: v, asOf }, state: "fresh" };
}

/* ------------------------------------------------------------------ factsheet parts */

interface FsParts { characteristics: Characteristic[]; breakdowns: FundData["breakdowns"]; topHoldings: FundData["topHoldings"]; esg: Characteristic[]; factsheetMonth: string | null }

function buildFactsheetParts(raw: RawPayloads, spec: FundSpec, prev: FundData | undefined, perfAsOf: string | null, c: Ctx, base: string): { parts: FsParts; state: PartState } {
  const keep = (why: string): { parts: FsParts; state: PartState } => {
    const hasPrev = !!prev && (prev.characteristics.length > 0 || Object.keys(prev.breakdowns).length > 0 || prev.topHoldings.length > 0 || prev.esg.length > 0);
    c.warn(`${base}.factsheet`, `${why}; ${hasPrev ? `previous factsheet data (${prev!.factsheetMonth ?? "?"}) kept` : "no factsheet data shown"}`);
    if (hasPrev) c.prov[`${base}.factsheet`] = carriedNoteFor(c, base, "factsheet");
    return {
      parts: prev ? { characteristics: prev.characteristics, breakdowns: prev.breakdowns, topHoldings: prev.topHoldings, esg: prev.esg, factsheetMonth: prev.factsheetMonth } : { characteristics: [], breakdowns: {}, topHoldings: [], esg: [], factsheetMonth: null },
      state: hasPrev ? "carried" : "none",
    };
  };
  const fs = spec.sources.factsheet;
  if (!fs) return { parts: { characteristics: [], breakdowns: {}, topHoldings: [], esg: [], factsheetMonth: null }, state: "none" };
  if (!raw.factsheets.ok) return keep(`factsheet archives unavailable (${raw.factsheets.error ?? "not fetched"})`);
  const blk = factsheetBlock(raw, spec);
  if (!blk) return keep(`"${fs.key}" not found in ${fs.file} archives (${raw.factsheets.data?.tried.filter((t) => t.startsWith(fs.file)).join(", ")})`);
  if (prev?.factsheetMonth && blk.month < prev.factsheetMonth) return keep(`newest ${fs.file} archive (${blk.month}) is older than the published one (${prev.factsheetMonth})`);
  const b = blk.block;
  const snap = isObj(b["Portfolio Snapshot"]) ? (b["Portfolio Snapshot"] as Obj) : {};
  let parts: FsParts;
  if (fs.file === "bonds_data") {
    const breakdowns: FundData["breakdowns"] = {};
    const credit = parseBuckets(snap["Credit Ratings"]);
    const sectors = parseBuckets(snap["Sectors"]);
    const curve = parseBuckets(snap["Curve"]);
    const country = parseBuckets(snap["Country"]);
    if (credit.length) breakdowns.credit = credit;
    if (sectors.length) breakdowns.sectors = sectors;
    if (curve.length) breakdowns.curve = curve;
    if (country.length) breakdowns.country = country;
    parts = {
      characteristics: parseCharacteristicTable(b["Characteristics"], BOND_CHARACTERISTICS),
      breakdowns,
      topHoldings: parseHoldings(snap["Top 10 Holdings"]),
      esg: parseCharacteristicTable(b["ESG Metrics"], ESG_METRICS),
      factsheetMonth: blk.month,
    };
  } else {
    const breakdowns: FundData["breakdowns"] = {};
    const sectors = parseBuckets(snap["Equity Sectors Allocation"]);
    const country = parseBuckets(snap["Equity Country Allocation"]);
    const alloc = parseAllocationSeries(snap["Systematic Strategies Allocation"]);
    if (sectors.length) breakdowns.sectors = sectors;
    if (country.length) breakdowns.country = country;
    if (alloc) {
      breakdowns.assetClass = alloc.buckets;
      c.prov[`${base}.breakdowns.assetClass`] = `factsheet ${blk.name} "Systematic Strategies Allocation" averaged over ${alloc.from} to ${alloc.to}`;
    }
    const holdings = parseHoldings(snap["Top 10 Holdings"]);
    parts = {
      characteristics: isObj(b["Characteristics"]) ? parseFlatCharacteristics(b["Characteristics"], MULTISTRAT_CHARACTERISTICS) : [],
      breakdowns,
      topHoldings: holdings.length ? holdings : parseHoldings(snap["Top 10 Futures"]),
      esg: [],
      factsheetMonth: blk.month,
    };
  }
  if (perfAsOf && blk.month < ym(perfAsOf)) c.info(`${base}.factsheet`, `latest factsheet archive is ${blk.month} (performance as of ${ym(perfAsOf)})`);
  c.prov[`${base}.factsheet`] = `factsheet archive ${blk.name} (${raw.factsheets.data?.where ?? "?"}), key ${fs.key}: characteristics, breakdowns, top holdings${fs.file === "bonds_data" ? ", ESG metrics" : ""}`;
  return { parts, state: "fresh" };
}

/** provenance of a part carried over from the previous publication */
function carriedNoteFor(c: Ctx, base: string, part: string): string {
  const old = c.prevProv[`${base}.${part}`];
  // a part already carried keeps its original provenance (it names the publication it comes from)
  if (old?.startsWith("carried over")) return old;
  return `carried over from the publication of ${c.prevGenerated}${old ? ` (${old})` : ""}`;
}

/* ------------------------------------------------------------------ fund */

function buildFund(raw: RawPayloads, spec: FundSpec, prevData: SiteData | null, c: Ctx): { fund: FundData | null; ctx: FundContext } {
  const base = `funds.${spec.key}`;
  const prev = prevData?.funds[spec.key];
  const ctx: FundContext = {
    key: spec.key, method: PIPELINE_FUNDS[spec.key].method, trailingSource: null, factsheetTrailing: null, factsheetTrailingFile: null,
    parts: { performance: "none", nav: "none", aum: "none", factsheet: "none" },
  };

  // performance + risk
  let performance: Performance | null = null;
  let risk: RiskStats | null = null;
  let risk3Y: RiskStats | null = null;
  let pb: PerfBuild | null = null;
  const short = spec.sources.dataplatform;
  if (short) {
    const res = raw.monthlyReturns[short];
    if (!res?.ok) c.error(`${base}.performance`, `monthly net returns unavailable (${res?.error ?? "not fetched"})`);
    pb = res?.ok ? buildNetPerformance(raw, spec, prev, c, base) : null;
  } else if (spec.sources.factsheet) {
    if (!raw.factsheets.ok) c.error(`${base}.performance`, `factsheet archives unavailable (${raw.factsheets.error ?? "not fetched"})`);
    else pb = buildFactsheetPerformance(raw, spec, c, base);
    if (raw.factsheets.ok && !pb && !factsheetBlock(raw, spec)) c.error(`${base}.performance`, `"${spec.sources.factsheet.key}" not found in the ${spec.sources.factsheet.file} archives`);
  }
  if (pb) {
    performance = pb.performance;
    risk = pb.risk;
    risk3Y = pb.risk3Y;
    ctx.trailingSource = pb.trailingSource;
    ctx.parts.performance = pb.performance ? "fresh" : "none";
    if (pb.fsTrailing) {
      ctx.factsheetTrailing = pb.fsTrailing.fund;
      ctx.factsheetTrailingFile = pb.fsFile;
    }
  } else if (prev?.performance) {
    performance = prev.performance;
    risk = prev.risk;
    risk3Y = prev.risk3Y ?? null;
    ctx.parts.performance = "carried";
    ctx.trailingSource = null;
    c.warn(`${base}.performance`, `performance kept from the previous publication (as of ${ym(prev.performance.asOf)})`);
    c.prov[`${base}.performance`] = carriedNoteFor(c, base, "performance");
    if (c.prevProv[`${base}.risk`]) c.prov[`${base}.risk`] = carriedNoteFor(c, base, "risk");
  }

  // NAV & AUM (fund vehicles only)
  let nav: FundData["nav"] = null;
  let aum: FundData["aum"] = null;
  if (short) {
    const n = buildNav(raw, spec, prev, c, base);
    nav = n.nav;
    ctx.parts.nav = n.state;
    const a = buildAum(raw, spec, prev, c, base);
    aum = a.aum;
    ctx.parts.aum = a.state;
  }

  const fp = buildFactsheetParts(raw, spec, prev, performance?.asOf ?? null, c, base);
  ctx.parts.factsheet = fp.state;

  const hasAny = performance || nav || aum || fp.parts.characteristics.length || fp.parts.topHoldings.length || Object.keys(fp.parts.breakdowns).length;
  if (!hasAny) return { fund: null, ctx };
  const fund: FundData = {
    key: spec.key,
    sourceName: [short ? `dataplatform ${short}` : null, spec.sources.factsheet ? `${spec.sources.factsheet.file}:${spec.sources.factsheet.key}` : null].filter(Boolean).join(" / "),
    performance, risk, risk3Y, nav, aum,
    characteristics: fp.parts.characteristics,
    breakdowns: fp.parts.breakdowns,
    topHoldings: fp.parts.topHoldings,
    esg: fp.parts.esg,
    factsheetMonth: fp.parts.factsheetMonth,
  };
  return { fund, ctx };
}

/* ------------------------------------------------------------------ site */

export function computeAsOf(funds: SiteData["funds"]): SiteData["asOf"] {
  const max = (xs: (string | null | undefined)[]): string | null => xs.filter((x): x is string => !!x).sort().pop() ?? null;
  const fs = Object.values(funds).filter((f): f is FundData => !!f);
  return {
    performance: max(fs.map((f) => f.performance?.asOf)),
    nav: max(fs.map((f) => f.nav?.asOf)),
    aum: max(fs.map((f) => f.aum?.asOf)),
    factsheet: max(fs.map((f) => f.factsheetMonth)),
  };
}

export function buildSiteData(raw: RawPayloads, previous: SiteData | null, now: Date, opts: { mode?: SiteData["mode"] } = {}): BuildResult {
  // never carry over illustrative data into a live dataset
  const prev = previous && previous.mode === "live" ? previous : null;
  const c = new Ctx();
  c.prevProv = prev?.provenance ?? {};
  c.prevGenerated = prev?.generatedAt ?? "";
  const funds: SiteData["funds"] = {};
  const context: BuildResult["context"] = {};
  for (const spec of FUNDS) {
    const { fund, ctx } = buildFund(raw, spec, prev, c);
    context[spec.key] = ctx;
    if (fund) funds[spec.key] = fund;
    else c.warn(`funds.${spec.key}`, `no data available for this fund`);
  }
  const data: SiteData = {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    mode: opts.mode ?? "live",
    asOf: computeAsOf(funds),
    funds,
    provenance: c.prov,
    issues: c.issues,
  };
  return { data, context };
}

/** helper for callers/tests */
export const bucketsTotal = (bs: Bucket[]): number => bs.reduce((a, b) => a + (b.fund ?? 0), 0);
