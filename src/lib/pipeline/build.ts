/**
 * Build: raw source payloads (+ previously published data) -> SiteData. Pure (no I/O, no clock: `now`
 * is a parameter).
 *
 * Rules (Gabriel 2026-10-02: the dataplatform API is the only input; the website computes whatever grouping it needs)
 *  - Net funds (SEST / SEB / Multistrat), headline = the track-record class: Apex months from dataplatform
 *    monthly-net-returns "ready" months, reproduced by the website's own compounding of the class's daily
 *    nav-timeseries chain; the 2026-07 cut-over month from the NAV bridge; CIBC months from the class's stored CIBC
 *    daily returns once they reproduce the analytics history; the strategy months before the class's own NAV history
 *    (not served by any endpoint) from the analytics repo history; gaps from the factsheet monthly table (warn). It
 *    must be continuous from the official track-record start.
 *  - Other classes (Monthly Income F, SEB F): compounded from their own daily NAV chain (buildClasses).
 *  - A month's factsheet, when it exists, cross-checks it (a disagreement holds a new month back and withholds an
 *    already published one). A new month that no independent source confirms (analytics, a same-class factsheet) is
 *    listed in FundContext.unconfirmed: auto mode does not publish it without an admin (validate.ts / run.ts); with
 *    requireFactsheetForNewMonth it waits for its factsheet in every mode.
 *  - Index figures (monthly, growth, calendar, trailing): computed from the dataplatform FTSE
 *    index-summary levels (short_corp / univ). A period FTSE does not cover is null (issue). The
 *    factsheet's published index figures are a cross-check only (info before 2026-05, when its index
 *    was the XSB/XBB ETF; warn after). Value added = displayed fund − FTSE index.
 *  - GMV (no fund vehicle, no dataplatform endpoint): gross figures from the factsheet archive (factsheet_data),
 *    arithmetic (non-compounded) convention; trailing, calendar and statistics as published.
 *  - Compliance: a track record shorter than 12 months is not shown (performance and risk null).
 *  - A part whose source failed keeps its previously published value (issue + provenance + alert).
 *  - NAV daily change: Apex distribution-aware daily return from the previous valuation day only.
 *  - Portfolio: computed by the website from the dataplatform Apex holdings and instrument master (fund-portfolio.ts),
 *    used when its coverage passes the thresholds (portfolio.ts, config PORTFOLIO), else the month-end factsheet
 *    figures (issue); both are cross-checked at month-ends. Distributions: no dataplatform endpoint (none shown unless a
 *    payload is supplied: distributions.ts keeps the display logic).
 */
import { FUNDS, type FundSpec } from "../../config/funds.ts";
import type { Bucket, CalendarRow, Characteristic, ClassPerformance, FundData, FundKey, GrowthPoint, Issue, MonthlyPoint, NavClass, Performance, PeriodMap, RiskStats, SiteData, Trailing, VariantData } from "../data/types.ts";
import { PERIODS } from "../data/types.ts";
import { classLabel, classSeriesOf, factsheetClassAt, FUND_SOURCES, trackFundserv, type FeeBand } from "./fund-sources.ts";
import { perfClassCode, withClassLabel } from "./perf-class.ts";
import { CHAIN, CLASS_SPREAD, factsheetTolerance, FTSE_COMPARABLE_FROM, INDEX_MONTHLY_TOL, PIPELINE_FUNDS, TOL } from "./config.ts";
import {
  addMonths, calendarYears, clean, growth as growthOf, lastClosedMonth, monthEndReturns, monthsBetween, riskStats, sortedKeys, toMonthEnd, trailing as trailingOf,
  type Method, type RiskResult, type Series,
} from "./metrics.ts";
import {
  BOND_CHARACTERISTICS, ESG_METRICS, fundMonthlyTableKey, indexMonthlyTableKey, isObj, MULTISTRAT_CHARACTERISTICS, parseAllocationSeries, parseBuckets, parseCalendarTable, parseCharacteristicTable,
  parseFlatCharacteristics, parseHoldings, parseMonthlyTable, parseStatistics, parseTrailingTable, type Obj, type TrailingTable,
} from "./parse.ts";
import type { DpShort, FundPortfolio, FundRef, NavPoint, RawPayloads, RegisteredFund, SourceResult } from "./raw.ts";
import { computeFundPortfolio } from "./fund-portfolio.ts";
import { crossCheckPortfolio, monthEndBook, selectPortfolio } from "./portfolio.ts";
import { selectDistributions, type LiveClass } from "./distributions.ts";
import { buildClassPerformance, performanceProblems } from "./classes.ts";
import { classMonths, classStart, type ChainMonth } from "./daily-chain.ts";

export type PartName = "performance" | "nav" | "aum" | "factsheet";
/** fresh: built this run; held: kept at an older month on purpose (waiting for a factsheet); carried: previous publication reused because a source failed */
export type PartState = "fresh" | "held" | "carried" | "none";

export interface BuildOptions {
  mode?: SiteData["mode"];
  /**
   * H3 gate: a performance month newer than the published one also needs its factsheet and a passing cross-check, in
   * every publish mode (default false). Without it, such a month is published only after an admin review in auto mode
   * (FundContext.unconfirmed).
   */
  requireFactsheetForNewMonth?: boolean;
}

/** What validate.ts needs besides the data itself. */
export interface FundContext {
  key: FundKey;
  method: Method;
  /** where the fund trailing figures come from */
  trailingSource: "computed" | "factsheet" | null;
  /** published fund trailing of the factsheet whose month equals the performance as-of (cross-check) */
  factsheetTrailing: PeriodMap | null;
  factsheetTrailingFile: string | null;
  factsheetTrailingDecimals?: Partial<Record<string, number>>;
  parts: Record<PartName, PartState>;
  /** reasons that must be brought to a human (run status "blocked" + alert) */
  alerts: string[];
  /** already published months whose return changed (headline and every other class entry) */
  revisions: { month: string; before: number; after: number | null; fundserv?: string }[];
  /**
   * new performance months (after the previous publication) that no source independent of the dataplatform confirms
   * (analytics history, a same-class factsheet monthly table or trailing table): auto mode keeps them for an admin
   */
  unconfirmed?: string[];
}

export interface BuildResult { data: SiteData; context: Partial<Record<FundKey, FundContext>> }

const PERIOD_LIST = PERIODS as readonly string[];

/* ------------------------------------------------------------------ helpers */

const pct = (x: number): string => `${(x * 100).toFixed(2)}%`;
const pct4 = (x: number): string => `${(x * 100).toFixed(4)}%`;

/** ["2019-01-31","2019-02-28","2019-04-30"] -> "2019-01 to 2019-02, 2019-04" */
export function monthRanges(ms: string[]): string {
  const out: string[] = [];
  let a: string | null = null;
  let b: string | null = null;
  for (const m of [...ms].sort()) {
    if (b && addMonths(b, 1) === toMonthEnd(m)) { b = m; continue; }
    if (a) out.push(a === b ? ym(a) : `${ym(a)} to ${ym(b!)}`);
    a = b = m;
  }
  if (a) out.push(a === b ? ym(a) : `${ym(a)} to ${ym(b!)}`);
  return out.join(", ");
}
const ym = (d: string): string => d.slice(0, 7);

class Ctx {
  issues: Issue[] = [];
  prov: Record<string, string> = {};
  prevProv: Record<string, string> = {};
  prevGenerated = "";
  /** funds whose new fund-data endpoints answered 404 (reported once per run, see absentEndpoints) */
  absent: { portfolio: string[]; distributions: string[] } = { portfolio: [], distributions: [] };
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

function factsheetBlock(raw: RawPayloads, spec: FundSpec, month?: string, key?: string): { name: string; month: string; block: Obj } | null {
  const fs = FUND_SOURCES[spec.key].factsheet;
  if (!fs) return null;
  for (const f of factsheetFilesFor(raw, fs.file)) {
    if (month && f.month !== month) continue;
    const block = f.data[key ?? fs.key];
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

/* ------------------------------------------------------------------ fund monthly series */

/** where one month of a series comes from */
type Origin = "analytics" | "dataplatform" | "navchain" | "factsheet";

interface FundSeries {
  series: Series;
  /** last month of the continuous track record */
  last: string;
  firstMonth: string;
  sources: string[];
  /** class code of EVERY month of `series` (STRATEGY / STRATEGY_H / a FundServ code) */
  classCode: string;
  /** source of each month of `series` */
  origin: Record<string, Origin>;
  /** months whose factsheet-printed return disagrees with the reference beyond print precision */
  mismatches: string[];
  /** months taken from the (rounded) factsheet monthly table */
  factsheetMonths: string[];
  /** months a same-class factsheet monthly table prints within its precision (an independent confirmation) */
  confirmed: string[];
  /** reasons for an alert (run blocked) */
  alerts: string[];
}

type MnrResult = RawPayloads["monthlyReturns"][DpShort];

/** Whether the daily NAV chain of a fund was verified on its track-record class (shared with its other classes). */
export interface ChainVerification {
  /** the stored CIBC daily returns reproduce the independent monthly history: CIBC months may be compounded */
  cibc: boolean;
  /** the cut-over month's NAV bridge is consistent: the bridge may be used for the other classes */
  bridge: boolean;
}

/** the track-record class's series, before the other classes are built from it */
interface Candidate {
  fs: FundSeries | null;
  /** monthly returns of the class from the data sources only (no factsheet month): the fee-band gate's input */
  sourceMonths: Series;
  issues: Issue[];
  verify: ChainVerification;
  /** the analytics history of the class (independent of the dataplatform) */
  analyticsMonths: Series;
  /** reasons for an alert raised while gathering the months */
  alerts: string[];
}

const readyRows = (res: MnrResult): { month: string; r: number; source?: string | null }[] =>
  res?.ok && res.data
    ? res.data.rows.filter((r) => r.status === "ready" && typeof r.net_return === "number" && Number.isFinite(r.net_return)).map((r) => ({ month: toMonthEnd(String(r.month)), r: r.net_return as number, source: r.source }))
    : [];

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
  const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  const bad = months.map((m, i) => ({ m, x: d[i] })).filter(({ x }) => x < cfg.minDiff - 1e-12 || x > cfg.maxDiff + 1e-12 || Math.abs(x - median) > cfg.maxFromMedian + 1e-12);
  if (!bad.length) return null;
  const bp = (x: number): string => `${(x * 10_000).toFixed(1)} bp`;
  return `${bad.length} of ${months.length} month(s) outside the fee band (median ${bp(median)}; allowed ${bp(cfg.minDiff)} to ${bp(cfg.maxDiff)}, ±${bp(cfg.maxFromMedian)} around the median): ${bad.slice(0, 4).map(({ m, x }) => `${ym(m)} ${bp(x)}`).join(", ")}${bad.length > 4 ? ", …" : ""}`;
}

/** newest factsheet archive having the fund whose published class is `classCode` (other classes are never used) */
function sameClassArchive(raw: RawPayloads, spec: FundSpec, classCode: string): { name: string; month: string; block: Obj } | null {
  const fs = FUND_SOURCES[spec.key].factsheet;
  if (!fs) return null;
  for (const f of factsheetFilesFor(raw, fs.file)) {
    const block = f.data[fs.key];
    if (isObj(block) && factsheetClassAt(spec.key, f.month) === classCode) return { name: f.name, month: f.month, block };
  }
  return null;
}

/**
 * Data start of the fund's own NAV history: the configured `navStart` (the register's fund_data_start, which
 * /api/apex/funds does not serve), never before the register's `inception` (the day a reused CIBC code became this
 * fund) when the register gives one. A disagreement between the two is reported (`note`).
 */
export function effectiveNavStart(raw: RawPayloads, spec: FundSpec): { start: string | null; note: string | null } {
  const cfg = FUND_SOURCES[spec.key].navStart;
  if (!cfg) return { start: null, note: null };
  const inc = registerFund(raw, spec)?.inception;
  const inception = typeof inc === "string" && /^\d{4}-\d{2}-\d{2}/.test(inc) ? inc.slice(0, 10) : null;
  if (!inception || inception === cfg) return { start: cfg, note: null };
  return { start: inception > cfg ? inception : cfg, note: `register inception ${inception} differs from the configured data start ${cfg}: the later one is used` };
}

/** Months of one class computed from its daily nav-timeseries rows (daily-chain.ts), its first day, or why there are none. */
export function classChain(raw: RawPayloads, spec: FundSpec, fundserv: string): { months: ChainMonth[]; start: string | null; error: string | null } {
  const navStart = effectiveNavStart(raw, spec).start;
  if (!navStart) return { months: [], start: null, error: "no NAV history for this fund" };
  const res = raw.navHistory?.[fundserv];
  if (!res) return { months: [], start: null, error: "not fetched" };
  if (!res.ok || !res.data) return { months: [], start: null, error: res.error ?? "unavailable" };
  const rows = res.data.rows.filter((r) => r.fundserv === fundserv);
  if (rows.length !== res.data.rows.length) return { months: [], start: null, error: `payload has rows of another class than ${fundserv}` };
  return { months: classMonths(rows, { navStart, endMonth: raw.targetMonth }), start: classStart(rows, navStart), error: null };
}

/** "FundServ (cibc 2021-11 to 2026-06, bridge 2026-07, apex 2026-08)" */
function chainNote(months: string[], chain: ChainMonth[]): string {
  const by: Record<string, string[]> = {};
  for (const m of chain) if (months.includes(m.month)) (by[m.source] ??= []).push(m.month);
  return Object.entries(by).map(([k, ms]) => `${k} ${monthRanges(ms)}`).join(", ");
}

/**
 * One class's series: the months gathered (with their origin and class) → continuous track record from the official
 * start, of a single labelled class, with the newest same-class factsheet monthly table filling (only when `fill`)
 * and cross-checking it.
 */
function finishSeries(raw: RawPayloads, spec: FundSpec, c: Ctx, base: string, g: {
  s: Series; origin: Record<string, Origin>; klass: Record<string, string>; classCode: string;
  dp: MnrResult; fill: boolean; chainSource: string | null; analyticsName: string | null; mandatoryTable: boolean;
  /** months withheld on purpose (two dataplatform views disagree): never filled from the factsheet */
  withheld?: Set<string>;
}): FundSeries | null {
  const key = `${base}.performance`;
  const trackStart = PIPELINE_FUNDS[spec.key].trackStart;
  const { s, origin, klass, dp } = g;
  const target = raw.targetMonth;
  const label = (code: string | null | undefined): string => (code ? `${classLabel(spec.key, code) ? `class ${classLabel(spec.key, code)} ` : ""}(${code})` : "unknown class");

  // factsheet monthly table: the newest archive publishing this class only (an archive of another class is never
  // compared nor used)
  const mismatches: string[] = [];
  const confirmed: string[] = [];
  const fsb = sameClassArchive(raw, spec, g.classCode);
  const newest = factsheetBlock(raw, spec);
  if (newest && newest.month !== fsb?.month) c.info(key, `factsheet ${newest.name} publishes ${label(factsheetClassAt(spec.key, newest.month))} returns, the series is ${label(g.classCode)}: its monthly table is neither compared nor used (class mismatch)${fsb ? `; ${fsb.name} used instead` : ""}`);
  const tk = fsb ? fundMonthlyTableKey(fsb.block, "Net") : null;
  const alerts: string[] = [];
  if (fsb && tk) {
    const { points, decimals: dec } = parseMonthlyTable(fsb.block[tk]);
    const filled: string[] = [];
    for (const p of points) {
      if (p.month > target) continue;
      const tol = (0.5 * 10 ** -(dec[p.month] ?? 1)) / 100 + 1e-9;
      if (!(p.month in s)) {
        if (!g.fill || g.withheld?.has(p.month)) continue;
        s[p.month] = p.r;
        origin[p.month] = "factsheet";
        klass[p.month] = g.classCode;
        filled.push(ym(p.month));
      } else if (Math.abs(s[p.month] - p.r) > tol) {
        mismatches.push(p.month);
        c.warn(key, `${ym(p.month)}: ${origin[p.month]} ${pct4(s[p.month])} vs factsheet ${fsb.name} ${pct4(p.r)} (beyond print precision)`);
      } else confirmed.push(p.month);
    }
    if (filled.length) c.warn(key, `no analytics/dataplatform return for ${monthRanges(filled.map(toMonthEnd))}: factsheet ${fsb.name} figures used (published precision)`);
  } else if (g.mandatoryTable && raw.factsheets.ok && FUND_SOURCES[spec.key].factsheet && factsheetFilesFor(raw, FUND_SOURCES[spec.key].factsheet!.file).length) {
    // the factsheet is an optional third view since 2026-10-02 (the factsheet job is not a dependency): an info only
    c.info(key, `no factsheet archive publishing ${label(g.classCode)} returns with a monthly table: the monthly series is not cross-checked with a factsheet`);
  }

  const months = sortedKeys(s).filter((m) => !trackStart || m >= trackStart);
  if (!months.length) {
    c.error(key, "no monthly return from any source");
    return null;
  }
  const first = trackStart ?? months[0];
  if (months[0] !== first) {
    c.error(key, `track record should start ${ym(first)}, first available month is ${ym(months[0])}; performance not updated`);
    return null;
  }
  // continuous from the start: the track record ends at the first missing month
  let last = first;
  for (const m of months.slice(1)) {
    if (m !== addMonths(last, 1)) break;
    last = m;
  }
  const after = months.filter((m) => m > last);
  if (after.length) {
    const why = dp?.data?.rows.filter((r) => toMonthEnd(String(r.month)) === addMonths(last, 1)).map((r) => `${r.status}${r.issue ? ` (${r.issue})` : ""}`)[0];
    c.error(key, `track record interrupted after ${ym(last)}: ${ym(addMonths(last, 1))} missing from every source${why ? ` (dataplatform: ${why})` : ""}; later months (${after.map(ym).join(", ")}) not used`);
  }
  const series: Series = {};
  const count: Record<Origin, number> = { analytics: 0, dataplatform: 0, navchain: 0, factsheet: 0 };
  const byClass = new Map<string, string[]>();
  for (const m of months) {
    if (m > last) continue;
    series[m] = s[m];
    count[origin[m]]++;
    byClass.set(klass[m], [...(byClass.get(klass[m]) ?? []), m]);
  }
  // one class for the whole series, known to the site: never a mixed (or unlabelled) series
  const classes = [...byClass.keys()];
  if (classes.length !== 1 || !classLabel(spec.key, classes[0])) {
    const detail = classes.map((k) => `${label(k === "unknown" ? null : k)}: ${monthRanges(byClass.get(k)!)}`).join("; ");
    c.error(key, classes.length > 1
      ? `months of different classes in one series (${detail}): performance withheld (a series never mixes classes)`
      : `series of a class the site has no label for (${detail}): performance withheld`);
    return null;
  }
  if (dp?.ok && dp.data) {
    const pending = dp.data.rows.filter((r) => toMonthEnd(String(r.month)) > last && r.status !== "ready").map((r) => `${ym(toMonthEnd(String(r.month)))} ${r.status}${r.issue ? ` (${r.issue})` : ""}`);
    if (pending.length) c.info(key, `dataplatform: ${pending.join("; ")}`);
  }
  const monthsOf = (o: Origin): string[] => sortedKeys(series).filter((m) => origin[m] === o);
  const sources = [
    count.analytics ? `analytics fund_returns.json "${g.analyticsName}" (${count.analytics} month(s): ${monthRanges(monthsOf("analytics"))}; ${raw.analytics.data?.where ?? ""})` : null,
    count.navchain ? `dataplatform /api/performance/nav-timeseries ${g.chainSource ?? "?"} daily NAV chain compounded by the website (${count.navchain} month(s): ${monthRanges(monthsOf("navchain"))})` : null,
    count.dataplatform ? `dataplatform /api/performance/monthly-net-returns ${FUND_SOURCES[spec.key].dataplatform} class_code ${classes[0]} ready months (${count.dataplatform}: ${monthRanges(monthsOf("dataplatform"))})` : null,
    count.factsheet ? `factsheet monthly table (${count.factsheet} month(s))` : null,
  ].filter((x): x is string => !!x);
  const factsheetMonths = monthsOf("factsheet");
  if (!raw.analytics.ok && g.analyticsName && factsheetMonths.length > 2) {
    alerts.push(`analytics history unavailable: ${factsheetMonths.length} month(s) rebuilt from rounded factsheet figures`);
    c.error(key, `analytics history unavailable: ${factsheetMonths.length} month(s) of the track record rebuilt from the factsheet monthly table (rounded to its printed precision)`);
  }
  return { series, last, firstMonth: first, sources, classCode: classes[0], origin: Object.fromEntries(Object.keys(series).map((m) => [m, origin[m]])), mismatches: mismatches.filter((m) => m <= last).sort(), factsheetMonths, confirmed: confirmed.filter((m) => m <= last).sort(), alerts };
}

/** a same-class factsheet monthly table's printed return for `month`, with its print tolerance, or null */
function factsheetMonthValue(raw: RawPayloads, spec: FundSpec, classCode: string, month: string): { value: number; tol: number; name: string } | null {
  const fsb = sameClassArchive(raw, spec, classCode);
  const tk = fsb ? fundMonthlyTableKey(fsb.block, "Net") : null;
  if (!fsb || !tk) return null;
  const { points, decimals } = parseMonthlyTable(fsb.block[tk]);
  const pt = points.find((x) => x.month === month);
  return pt ? { value: pt.r, tol: (0.5 * 10 ** -(decimals[pt.month] ?? 1)) / 100 + 1e-9, name: fsb.name } : null;
}

/** the dataplatform's aggregate row of a class code built from more than one Apex class during `month` (latest NAV window), or null */
function multiClassAggregate(raw: RawPayloads, short: DpShort, code: string, month: string): { count: number; date: string } | null {
  const res = raw.nav[short];
  if (!res?.ok || !res.data) return null;
  const hit = (res.data.aggregates ?? []).find((r) => r.class_code === code && r.date.slice(0, 7) === month.slice(0, 7) && typeof r.return_source_count === "number" && r.return_source_count > 1);
  return hit ? { count: hit.return_source_count as number, date: hit.date } : null;
}

/** class identity of a monthly-net-returns answer (class_code always; class_display / fundserv when a later dataplatform adds them): why it is not `code`, or null */
function payloadIdentityProblem(spec: FundSpec, res: MnrResult, code: string): string | null {
  const d = res?.ok ? res.data : null;
  if (!d) return null;
  if (d.class_code !== code) return `class_code ${d.class_code ?? "missing"} instead of ${code}`;
  const want = { display: classLabel(spec.key, code), fundserv: (FUND_SOURCES[spec.key].classFundserv as Record<string, string | undefined>)[code] ?? null };
  if (d.class_display != null && d.class_display !== want.display) return `class_display ${d.class_display} instead of ${want.display}`;
  if (d.fundserv != null && d.fundserv !== want.fundserv) return `fundserv ${d.fundserv} instead of ${want.fundserv}`;
  return null;
}

/**
 * The track-record (headline) class, month by month:
 *  - Apex months: dataplatform monthly-net-returns "ready" months, which the website's own compounding of the class's
 *    daily NAV chain must reproduce (two views of the same rows; a disagreement withholds the month). When the endpoint
 *    is down, the chain alone (same rule) is used.
 *  - The cut-over month (2026-07, which monthly-net-returns leaves unavailable by design): the NAV bridge, cross-checked
 *    with the analytics history when it has the month.
 *  - CIBC months: the class's stored CIBC daily returns compounded, used only when they reproduce the analytics history
 *    on every common month (then every CIBC month of the class comes from the dataplatform); else the analytics history.
 *  - Months before the class's own NAV history (the strategy's track record since 2019, stored by the dataplatform as
 *    monthly figures that no endpoint serves): the analytics history. Gaps: the same-class factsheet monthly table.
 */
function trackRecordCandidate(raw: RawPayloads, spec: FundSpec, base: string): Candidate {
  const c = new Ctx();
  const key = `${base}.performance`;
  const src = FUND_SOURCES[spec.key];
  const short = src.dataplatform as DpShort;
  const code = src.trackRecordClass ?? "unknown";
  const s: Series = {};
  const origin: Record<string, Origin> = {};
  const klass: Record<string, string> = {};
  const verify: ChainVerification = { cibc: false, bridge: false };
  const withheld = new Set<string>();
  const alerts: string[] = [];
  const startNote = effectiveNavStart(raw, spec).note;
  if (startNote) c.warn(key, startNote);
  const target = raw.targetMonth;
  const an = raw.analytics;
  const name = src.analytics;
  const set = (m: string, r: number, o: Origin): void => {
    s[m] = r;
    origin[m] = o;
    klass[m] = code;
  };
  if (name) {
    if (an.ok && an.data) {
      const arr = an.data.returns[name];
      if (arr) {
        an.data.dates.forEach((d, i) => {
          const v = arr[i];
          if (v === null || !Number.isFinite(v)) return;
          const m = toMonthEnd(d);
          if (m > target) return;
          set(m, v, "analytics");
        });
      } else c.warn(key, `analytics: series "${name}" not found in fund_returns.json`);
    } else c.warn(key, `analytics history unavailable (${an.error ?? "not fetched"})`);
  }
  const analyticsMonths: Series = { ...s };
  const dp = raw.monthlyReturns[short];
  const idp = payloadIdentityProblem(spec, dp, code);
  if (idp) {
    c.error(key, `dataplatform monthly net returns ${short} ${code}: ${idp}: performance withheld`);
    return { fs: null, sourceMonths: {}, issues: c.issues, verify, analyticsMonths, alerts };
  }
  const mnrReady = new Map(readyRows(dp).filter((r) => r.month <= target).map((r) => [r.month, r.r]));
  if (dp?.ok && dp.data) {
    for (const [m, r] of mnrReady) {
      if (m in s && Math.abs(s[m] - r) > TOL.analyticsVsDataplatform) c.warn(key, `${ym(m)}: analytics ${pct4(s[m])} vs dataplatform ${pct4(r)} (dataplatform used)`);
      set(m, r, "dataplatform");
    }
  } else c.warn(key, `dataplatform monthly net returns unavailable (${dp?.error ?? "not fetched"})`);

  // the track class's own daily NAV chain (nav-timeseries)
  const fsv = trackFundserv(spec.key);
  let chainSource: string | null = null;
  if (fsv && src.navStart) {
    const ch = classChain(raw, spec, fsv);
    const lbl = `class ${classLabel(spec.key, code) ?? "?"} (${fsv})`;
    if (ch.error) c.warn(key, `daily NAV chain of ${lbl} unavailable (${ch.error}): months before the Apex ones from the analytics history`);
    else {
      const ready = ch.months.filter((m) => m.status === "ready" && m.r !== null && m.month <= target);
      const mnrRows = dp?.ok && dp.data ? new Map(dp.data.rows.map((r) => [toMonthEnd(String(r.month)), r])) : null;
      const used: string[] = [];
      // Apex months: the same rule as monthly-net-returns, so both must agree
      for (const m of ready.filter((x) => x.source === "apex")) {
        const v = mnrReady.get(m.month);
        if (v !== undefined) {
          if (Math.abs(v - (m.r as number)) > TOL.chainVsDataplatform) {
            c.error(key, `${ym(m.month)}: daily NAV chain ${pct4(m.r as number)} vs monthly-net-returns ${pct4(v)}: two dataplatform views of the same days disagree; month withheld`);
            delete s[m.month];
            withheld.add(m.month);
          }
          continue;
        }
        if (!mnrRows) {
          set(m.month, m.r as number, "navchain");
          used.push(m.month);
          continue;
        }
        const row = mnrRows.get(m.month);
        c.warn(key, `${ym(m.month)}: daily NAV chain complete, monthly-net-returns says ${row ? `${row.status}${row.issue ? ` (${row.issue})` : ""}` : "nothing"}: month not used`);
        // the dataplatform aggregates its STRATEGY / STRATEGY_H row from every Apex class carrying the class's NAV token:
        // with two such classes (return_source_count > 1) monthly-net-returns can never compound the month
        const multi = multiClassAggregate(raw, short, code, m.month);
        if (multi) {
          const why = `${ym(m.month)}: monthly-net-returns ${code} is unavailable because the dataplatform aggregates ${multi.count} Apex classes into its ${code} row (return_source_count ${multi.count} on ${multi.date}); it cannot compound a single-class return until the class mapping is fixed: the track record stops before this month`;
          c.error(key, why);
          alerts.push(why);
        }
      }
      if (!mnrRows && used.length) c.warn(key, `monthly-net-returns unavailable: Apex month(s) ${monthRanges(used)} compounded from the daily NAV chain (same rule)`);
      // CIBC months: all or nothing, verified on every month the analytics history also has
      const cibc = ready.filter((x) => x.source === "cibc");
      const common = cibc.filter((m) => m.month in analyticsMonths);
      const off = common.filter((m) => Math.abs((m.r as number) - analyticsMonths[m.month]) > TOL.chainVsAnalytics);
      if (cibc.length) {
        if (off.length) {
          c.warn(key, `stored CIBC daily returns of ${lbl} do not reproduce the analytics history (beyond ${(TOL.chainVsAnalytics * 10_000).toFixed(1)} bp) for ${monthRanges(off.map((m) => m.month))} (${off.slice(0, 3).map((m) => `${ym(m.month)}: chain ${pct4(m.r as number)} vs analytics ${pct4(analyticsMonths[m.month])}`).join("; ")}): CIBC months not taken from the dataplatform (method not verified; analytics kept)`);
        } else if (common.length < CHAIN.minVerifiedMonths) {
          c.info(key, `stored CIBC daily returns of ${lbl}: only ${common.length} month(s) in common with the analytics history (${CHAIN.minVerifiedMonths} needed to verify them): CIBC months not taken from the dataplatform`);
        } else {
          verify.cibc = true;
          const maxDiff = Math.max(...common.map((m) => Math.abs((m.r as number) - analyticsMonths[m.month])));
          for (const m of cibc) {
            set(m.month, m.r as number, "navchain");
            used.push(m.month);
          }
          c.info(key, `stored CIBC daily returns of ${lbl} reproduce the analytics history on ${common.length} month(s) (largest difference ${(maxDiff * 10_000).toFixed(3)} bp): ${monthRanges(cibc.map((m) => m.month))} taken from the dataplatform daily NAV chain`);
        }
      }
      // the cut-over month
      const br = ch.months.find((x) => x.source === "bridge" && x.month <= target);
      if (br && br.status !== "ready") c.info(key, `cut-over month ${ym(br.month)}: NAV bridge of ${lbl} unavailable (${br.issue})`);
      else if (br && br.r !== null) {
        const a = analyticsMonths[br.month];
        // without an analytics month, the bridge needs an independent confirmation: a same-class factsheet monthly table
        // printing the cut-over month within its precision
        const fsv2 = a === undefined && !mnrReady.has(br.month) ? factsheetMonthValue(raw, spec, code, br.month) : null;
        if (a !== undefined && Math.abs(br.r - a) > TOL.chainVsAnalytics) {
          c.warn(key, `cut-over month ${ym(br.month)}: NAV bridge ${pct4(br.r)} vs analytics ${pct4(a)}: bridge not used (analytics kept)`);
        } else if (a === undefined && !mnrReady.has(br.month) && !fsv2) {
          c.warn(key, `cut-over month ${ym(br.month)}: NAV bridge ${pct4(br.r)} has no independent confirmation (no analytics month, no same-class factsheet printing ${ym(br.month)}): bridge not used`);
        } else if (fsv2 && Math.abs(br.r - fsv2.value) > fsv2.tol) {
          c.warn(key, `cut-over month ${ym(br.month)}: NAV bridge ${pct4(br.r)} vs factsheet ${fsv2.name} ${pct4(fsv2.value)} (beyond print precision): month withheld (neither is used)`);
          withheld.add(br.month);
        } else if (mnrReady.has(br.month)) {
          const v = mnrReady.get(br.month)!;
          if (Math.abs(br.r - v) > TOL.chainVsAnalytics) c.warn(key, `cut-over month ${ym(br.month)}: NAV bridge ${pct4(br.r)} vs monthly-net-returns ${pct4(v)} (monthly-net-returns used)`);
        } else {
          verify.bridge = true;
          set(br.month, br.r, "navchain");
          used.push(br.month);
        }
      }
      if (used.length) chainSource = `${fsv} (${chainNote(used, ch.months)})`;
    }
  }
  const sourceMonths: Series = Object.fromEntries(Object.entries(s).filter(([m]) => klass[m] === code && origin[m] !== "factsheet"));
  const fs = finishSeries(raw, spec, c, base, { s, origin, klass, classCode: code, dp, fill: true, chainSource, analyticsName: name, mandatoryTable: true, withheld });
  return { fs, sourceMonths, issues: c.issues, verify, analyticsMonths, alerts };
}

/**
 * Official monthly net series of the fund (port of nymbus-decks engine.fund_series): the track-record class, every month
 * of ONE class (a series mixing classes is never built: finishSeries). The fund's other classes are built from their own
 * daily NAV chains next to it (buildClasses).
 */
function fundSeries(raw: RawPayloads, spec: FundSpec, c: Ctx, base: string): { fs: FundSeries | null; cand: Candidate } {
  const cand = trackRecordCandidate(raw, spec, base);
  c.issues.push(...cand.issues);
  return { fs: cand.fs, cand };
}

/* ------------------------------------------------------------------ index (FTSE) */

/** first month of a trailing window (a difference is expected when the window starts before the FTSE cutover) */
function periodStart(p: string, asOf: string, firstMonth: string): string {
  const n: Record<string, number> = { "1M": 1, "3M": 3, "1Y": 12, "2Y": 24, "3Y": 36, "5Y": 60, "10Y": 120 };
  if (p === "SI") return firstMonth;
  if (p === "YTD") return `${asOf.slice(0, 4)}-01-31`;
  return addMonths(asOf, -(n[p] - 1));
}

interface IndexBuild {
  /** FTSE monthly returns (month-end to month-end levels), first month to as-of */
  monthly: Series;
  name: string | null;
  source: string | null;
  prov: string;
  /** published figures of the factsheet (cross-check only) */
  pub: { file: string; month: string; monthly: Series; trailing: PeriodMap | null; va: PeriodMap | null; decimals: TrailingTable["decimals"] | null; calendar: Record<string, { index?: number | null }> } | null;
}

/** info before the producer's FTSE cutover (its index was the ETF then), warn after */
function indexNote(c: Ctx, key: string, month: string, msg: string): void {
  if (month < FTSE_COMPARABLE_FROM) c.info(key, `${msg} (expected before ${ym(FTSE_COMPARABLE_FROM)}: the factsheet index was the ETF)`);
  else c.warn(key, msg);
}

/**
 * Index monthly returns computed from the dataplatform FTSE index-summary levels (seam-joined history,
 * closed month-ends only). The factsheet's published index tables are read for cross-checks only.
 */
function buildIndex(raw: RawPayloads, spec: FundSpec, fsb: { name: string; month: string; block: Obj } | null, firstMonth: string, asOf: string, c: Ctx, base: string): IndexBuild {
  const key = `${base}.performance.index`;
  const ftseName = raw.ftseIndex[spec.key] ?? null;
  const out: IndexBuild = { monthly: {}, name: null, source: ftseName, prov: "", pub: null };
  if (ftseName) {
    const res = raw.ftse[ftseName];
    if (res?.ok && res.data) {
      out.name = res.data.indexName ?? null;
      const me = monthEndReturns(res.data.levels);
      for (const d of me.dropped) if (d.month >= firstMonth && d.month <= asOf) c.warn(key, `FTSE ${ftseName} ${ym(d.month)}: ${d.reason}; month not used`);
      for (const m of sortedKeys(me.series)) if (m >= firstMonth && m <= asOf) out.monthly[m] = me.series[m];
      const missing: string[] = [];
      for (let m = firstMonth; m <= asOf; m = addMonths(m, 1)) if (!(m in out.monthly)) missing.push(m);
      if (missing.length) c.warn(key, `FTSE ${ftseName} has no monthly return for ${monthRanges(missing)}: index figures needing these months are not shown`);
      const joined = res.data.joined?.length ? ` (history joined over ${res.data.joined.join(", ")})` : "";
      out.prov = `FTSE ${ftseName} via dataplatform /api/ftse/index-summary, aggregate total-return level, month-end to month-end${joined}`;
    } else {
      c.warn(key, `FTSE ${ftseName} unavailable (${res?.error ?? "not fetched"}): no index figure shown`);
      out.prov = `FTSE ${ftseName} unavailable`;
    }
  }
  out.name ??= spec.benchmark?.en ?? null;
  if (fsb) {
    const tt = parseTrailingTable(fsb.block["Trailing Returns Net"], fsb.month.slice(0, 4));
    const tk = indexMonthlyTableKey(fsb.block, tt?.indexName);
    const monthly: Series = {};
    if (tk) for (const p of parseMonthlyTable(fsb.block[tk]).points) monthly[p.month] = p.r;
    out.pub = {
      file: fsb.name, month: fsb.month, monthly,
      trailing: tt?.index && fsb.month === ym(asOf) ? tt.index : null,
      va: tt?.va && fsb.month === ym(asOf) ? tt.va : null,
      decimals: tt?.decimals ?? null,
      calendar: parseCalendarTable(fsb.block["Calendar Performance Net"]),
    };
    const off: string[] = [];
    for (const m of sortedKeys(monthly)) {
      const f = out.monthly[m];
      if (f === undefined || m < firstMonth || m > asOf) continue;
      if (Math.abs(f - monthly[m]) > INDEX_MONTHLY_TOL) off.push(m);
    }
    const early = off.filter((m) => m < FTSE_COMPARABLE_FROM);
    const late = off.filter((m) => m >= FTSE_COMPARABLE_FROM);
    if (early.length) c.info(key, `published index months differ from FTSE ${ftseName} for ${monthRanges(early)} (expected before ${ym(FTSE_COMPARABLE_FROM)}: the factsheet index was the ETF); FTSE used`);
    if (late.length) c.warn(key, `published index months differ from FTSE ${ftseName} for ${monthRanges(late)} (${late.slice(0, 3).map((m) => `${ym(m)}: published ${pct(monthly[m])} vs FTSE ${pct(out.monthly[m])}`).join("; ")}); FTSE used`);
  }
  return out;
}

/* ------------------------------------------------------------------ performance */

interface PerfBuild {
  performance: Performance | null;
  risk: RiskStats | null;
  risk3Y: RiskStats | null;
  trailingSource: FundContext["trailingSource"];
  fsTrailing: TrailingTable | null;
  fsFile: string | null;
  /** why performance is null: compliance (not an alert) vs error */
  withheld?: "compliance" | "error";
  /** the month used is older than the last available one (waiting for the factsheet) */
  held?: string;
  /** reasons for an alert (run blocked) */
  alerts?: string[];
  /** new months that no independent source confirms (FundContext.unconfirmed) */
  unconfirmed?: string[];
  /** what the per-class series are compared with and measured against (net funds only) */
  ref?: { series: Series; origin: Record<string, string>; idx: Series | null; firstMonth: string; indexName?: string; sourceMonths: Series; verify: ChainVerification };
}

/** a factsheet trailing table can serve as a cross-check only if the fund row has 1M, 3M, YTD and 1Y */
export function crossCheckable(tt: TrailingTable | null): tt is TrailingTable {
  return !!tt && (["1M", "3M", "YTD", "1Y"] as const).every((k) => typeof tt.fund[k] === "number" && Number.isFinite(tt.fund[k] as number));
}

/** fund trailing vs published factsheet, per-period tolerance: "ok" | "warn" | "block" per period */
export function crossCheck(fund: PeriodMap, fs: TrailingTable): { period: string; computed: number; published: number; level: "warn" | "block" }[] {
  const out: { period: string; computed: number; published: number; level: "warn" | "block" }[] = [];
  for (const p of PERIOD_LIST) {
    const a = fund[p as keyof PeriodMap];
    const b = fs.fund[p as keyof PeriodMap];
    if (a == null || b == null) continue;
    const tol = factsheetTolerance(p, fs.decimals.fund[p as keyof PeriodMap] ?? 1);
    const d = Math.abs(a - b);
    if (d > tol.block) out.push({ period: p, computed: a, published: b, level: "block" });
    else if (d > tol.round) out.push({ period: p, computed: a, published: b, level: "warn" });
  }
  return out;
}

const cut = (s: Series, end: string): Series => Object.fromEntries(sortedKeys(s).filter((m) => m <= end).map((m) => [m, s[m]]));

function buildNetPerformance(raw: RawPayloads, spec: FundSpec, prev: FundData | undefined, c: Ctx, base: string, opts: BuildOptions): PerfBuild | null {
  const { fs: fsr, cand } = fundSeries(raw, spec, c, base);
  if (!fsr) return null;
  const { firstMonth } = fsr;
  const key = `${base}.performance`;
  const n = monthsBetween(firstMonth, fsr.last);
  if (n < 12) {
    c.info(key, `track record of ${n} month(s) (< 12): performance is not shown (regulatory rule)`);
    c.prov[key] = `not shown: track record < 12 months`;
    return { performance: null, risk: null, risk3Y: null, trailingSource: null, fsTrailing: null, fsFile: null, withheld: "compliance" };
  }
  const prevAsOf = prev?.performance?.asOf ?? null;
  // a track record ending more than two closed months ago (interrupted, or a source stopped) is never published as new
  if (fsr.last < addMonths(raw.targetMonth, -2)) {
    c.error(key, `track record ends ${ym(fsr.last)}, more than two closed months before ${ym(raw.targetMonth)}: performance not updated`);
    if (prev?.performance) return null; // caller carries the previous publication
    return { performance: null, risk: null, risk3Y: null, trailingSource: null, fsTrailing: null, fsFile: null, withheld: "error" };
  }
  const alerts = [...fsr.alerts, ...cand.alerts];
  // the factsheet publishes one class: its fund figures are compared only with a series of the same class
  // (by archive month: SEB archives up to 2026-07 publish class F, later ones class H)
  const classOfArchive = (month: string): string | null => factsheetClassAt(spec.key, month);
  const archMismatch = (month: string): boolean => classOfArchive(month) !== fsr.classCode;

  // choose the as-of month. A month's factsheet, when it exists, must agree (a disagreement holds a new month back and
  // withholds an already published one); it is not required for a new month (option, default off): the months come
  // from the dataplatform and pass its own gates (complete daily chain, monthly-net-returns agreement)
  let asOf: string | null = null;
  let fsBlock: { name: string; month: string; block: Obj } | null = null;
  let fsTrailing: TrailingTable | null = null;
  const lowest = prevAsOf && prevAsOf <= fsr.last ? prevAsOf : addMonths(fsr.last, -2);
  // factsheet monthly-table mismatches: blocking for months after the previous as-of, alert for older ones
  const boundary = prevAsOf ?? addMonths(lowest, -1);
  const oldMismatches = fsr.mismatches.filter((m) => m <= boundary);
  if (oldMismatches.length) {
    alerts.push(`factsheet monthly table disagrees with already published month(s) ${monthRanges(oldMismatches)}`);
    c.error(key, `factsheet monthly table disagrees beyond print precision with month(s) ${monthRanges(oldMismatches)} (already published or older): to review`);
  }
  for (let m = fsr.last; m >= lowest && m >= firstMonth; m = addMonths(m, -1)) {
    const fund = fromTrailingMap(trailingOf(cut(fsr.series, m), m));
    const blk = factsheetBlock(raw, spec, ym(m));
    const parsed = blk ? parseTrailingTable(blk.block["Trailing Returns Net"], m.slice(0, 4)) : null;
    const tt = crossCheckable(parsed) ? parsed : null;
    if (blk && !tt) c.warn(`${base}.trailing`, `factsheet ${blk.name}: fund trailing row missing or incomplete (1M/3M/YTD/1Y): not usable as a cross-check`);
    const checks = tt && !archMismatch(blk!.month) ? crossCheck(fund, tt) : [];
    const blocking = checks.filter((x) => x.level === "block");
    const isNew = !prevAsOf || m > prevAsOf;
    const newMismatch = fsr.mismatches.filter((x) => x > boundary && x <= m);
    if (newMismatch.length) {
      c.error(key, `${ym(m)} not published: factsheet monthly table disagrees beyond print precision for ${monthRanges(newMismatch)}`);
      continue;
    }
    const detail = blocking.map((x) => `${x.period} computed ${pct(x.computed)} vs published ${pct(x.published)}`).join("; ");
    if (!isNew && blocking.length) {
      // an already published month that the factsheet now contradicts: withhold rather than keep unchecked data
      c.error(key, `${ym(m)} (already published): factsheet ${blk!.name} disagrees beyond tolerance (${detail}); performance withheld`);
      return { performance: null, risk: null, risk3Y: null, trailingSource: null, fsTrailing: tt, fsFile: blk!.name, withheld: "error" };
    }
    if (isNew && blocking.length) {
      c.error(key, `${ym(m)} not published: factsheet ${blk!.name} disagrees beyond tolerance (${detail})`);
      continue;
    }
    if (isNew && opts.requireFactsheetForNewMonth && !tt) {
      c.info(key, `${ym(m)} not published yet: waiting for the factsheet of ${ym(m)} to cross-check it`);
      continue;
    }
    asOf = m; fsBlock = blk; fsTrailing = tt;
    break;
  }
  if (!asOf) {
    if (prev?.performance) return null; // caller carries the previous publication (issue already raised)
    c.error(key, `no month of the track record passed its gates; performance withheld`);
    return { performance: null, risk: null, risk3Y: null, trailingSource: null, fsTrailing: null, fsFile: null, withheld: "error" };
  }
  const series = cut(fsr.series, asOf);
  const fund = fromTrailingMap(trailingOf(series, asOf));
  const shown = classLabel(spec.key, fsr.classCode);
  const fsClass = fsBlock ? classOfArchive(fsBlock.month) : null;
  const fsMismatch = !!fsBlock && archMismatch(fsBlock.month);
  if (fsMismatch) {
    // the factsheet of the month is still required for a new month (timing gate above); only the comparison is skipped
    c.info(`${base}.trailing`, `factsheet ${fsBlock!.name} publishes class ${classLabel(spec.key, fsClass) ?? fsClass ?? "?"} (${fsClass ?? "unknown"}), the site shows class ${shown} (${fsr.classCode}): its fund trailing, value-added and statistics cross-checks are skipped (class mismatch); all other gates apply`);
    fsTrailing = null;
  }
  if (FUND_SOURCES[spec.key].factsheet && !fsTrailing && !fsMismatch) c.warn(`${base}.trailing`, `no factsheet trailing returns for ${ym(asOf)}: not cross-checked`);
  // new months confirmed by no source independent of the dataplatform: auto mode waits for an admin (validate.ts)
  const confirmedSet = new Set(fsr.confirmed);
  const independent = (m: string): boolean => {
    const o = fsr.origin[m];
    if (o === "analytics" || o === "factsheet" || confirmedSet.has(m)) return true;
    const a = cand.analyticsMonths[m];
    if (a !== undefined && Math.abs(a - fsr.series[m]) <= TOL.analyticsVsDataplatform) return true;
    return !!fsTrailing && m === asOf;
  };
  const unconfirmed = sortedKeys(cut(fsr.series, asOf)).filter((m) => (!prevAsOf || m > prevAsOf) && !independent(m));
  if (unconfirmed.length) c.warn(`${key}.review`, `new month(s) ${monthRanges(unconfirmed)} confirmed by no source independent of the dataplatform (no analytics month, no same-class factsheet): in auto mode they wait for an admin to publish this run`);
  if (fsTrailing) for (const x of crossCheck(fund, fsTrailing)) if (x.level === "warn") c.warn(`${base}.trailing.${x.period}`, `${x.period}: computed ${pct(x.computed)} vs factsheet ${fsBlock!.name} ${pct(x.published)} (beyond rounding, within tolerance; computed kept)`);

  const trailing: Trailing = { fund };
  let indexMonthly: MonthlyPoint[] | undefined;
  let idx: Series = {};
  let indexName: string | undefined;
  const provParts: string[] = [];
  let ib: IndexBuild | null = null;
  if (FUND_SOURCES[spec.key].ftseIndex) {
    // newest factsheet up to the as-of month (cross-checks only)
    const blk = fsBlock ?? factsheetFilesFor(raw, FUND_SOURCES[spec.key].factsheet!.file).map((f) => ({ ...f, block: f.data[FUND_SOURCES[spec.key].factsheet!.key] })).find((f) => f.month <= ym(asOf!) && isObj(f.block)) as { name: string; month: string; block: Obj } | undefined ?? null;
    ib = buildIndex(raw, spec, blk, firstMonth, asOf, c, base);
    idx = ib.monthly;
    indexName = ib.name ?? undefined;
    const computedIdx = fromTrailingMap(trailingOf(idx, asOf, { siStart: firstMonth }));
    const index: PeriodMap = {};
    const va: PeriodMap = {};
    for (const p of PERIOD_LIST) {
      const k = p as keyof PeriodMap;
      if (fund[k] == null) { index[k] = null; va[k] = null; continue; }
      const iv = computedIdx[k] ?? null;
      index[k] = iv;
      va[k] = iv != null ? clean((fund[k] as number) - iv) : null;
      const pub = ib.pub?.trailing?.[k];
      if (pub != null && iv != null) {
        const tol = (0.5 * 10 ** -(ib.pub?.decimals?.index[k] ?? 1)) / 100 + 1e-9;
        if (Math.abs(iv - pub) > tol) indexNote(c, `${base}.trailing.index.${p}`, periodStart(p, asOf, firstMonth), `index ${p}: FTSE ${pct(iv)} vs factsheet ${ib.pub!.file} ${pct(pub)} (FTSE shown)`);
      }
      const pv = ib.pub?.va?.[k];
      if (pv != null && va[k] != null && !archMismatch(ib.pub!.month)) {
        const tol = (0.5 * 10 ** -(ib.pub?.decimals?.va[k] ?? 1)) / 100 + 1e-9;
        if (Math.abs((va[k] as number) - pv) > tol) indexNote(c, `${base}.trailing.va.${p}`, periodStart(p, asOf, firstMonth), `value added ${p}: fund − FTSE ${pct(va[k] as number)} vs factsheet ${pct(pv)}`);
      }
    }
    trailing.index = index;
    trailing.va = va;
    indexMonthly = toPoints(idx);
    const missingIdx = PERIOD_LIST.filter((p) => fund[p as keyof PeriodMap] != null && index[p as keyof PeriodMap] == null);
    if (missingIdx.length) c.warn(`${base}.trailing.index`, `index ${missingIdx.join(", ")} not shown: FTSE ${ib.source} does not cover the whole period`);
    provParts.push(`index "${indexName ?? "?"}": computed from ${ib.prov || "no FTSE data"}; value added = fund − FTSE index${ib.pub ? `; factsheet ${ib.pub.file} index figures used as a cross-check only (its index was the XSB/XBB ETF before ${ym(FTSE_COMPARABLE_FROM)})` : ""}`);
  }

  // calendar (index years computed from FTSE; the published index row is a cross-check)
  const idxCal = FUND_SOURCES[spec.key].ftseIndex ? new Map(calendarYears(idx, asOf, { first: firstMonth }).map((y) => [y.year, y])) : null;
  const calendar: CalendarRow[] = calendarYears(series, asOf, { first: firstMonth }).map((y) => {
    const row: CalendarRow = { year: y.year, fund: y.value };
    if (y.partial) row.partial = true;
    if (idxCal) {
      const iy = idxCal.get(y.year);
      const iv = iy && iy.months === y.months ? iy.value : null;
      row.index = iv;
      row.va = iv != null && y.value != null ? clean(y.value - iv) : null;
      const pub = ib?.pub?.calendar[String(y.year)]?.index;
      const pubComplete = ib?.pub && (y.year < Number(ib.pub.month.slice(0, 4)) || ib.pub.month === ym(asOf));
      if (pubComplete && pub != null && iv != null && Math.abs(iv - pub) > 0.0005 + 1e-9) indexNote(c, `${base}.calendar.${y.year}.index`, y.year === Number(firstMonth.slice(0, 4)) ? firstMonth : `${y.year}-01-31`, `index ${y.year}: FTSE ${pct(iv)} vs factsheet ${pct(pub)} (FTSE shown)`);
    }
    return row;
  });

  // growth of 10 000
  const g = growthOf(series, asOf, { first: firstMonth });
  let idxAcc: number | null = 1;
  const growth: GrowthPoint[] = g.map((pt, i) => {
    if (!FUND_SOURCES[spec.key].ftseIndex) return { date: pt.date, fund: pt.value };
    if (i > 0) idxAcc = idxAcc != null && pt.date in idx ? idxAcc * (1 + idx[pt.date]) : null;
    return { date: pt.date, fund: pt.value, index: idxAcc != null ? 10_000 * idxAcc : null };
  });

  const rounded = fsr.factsheetMonths.filter((m) => m <= asOf);
  const risk = rounded.length ? null : riskFrom(riskStats(series, asOf, "SI"));
  const risk3Y = rounded.some((m) => m > addMonths(asOf, -36)) ? null : riskFrom(riskStats(series, asOf, "3Y"));
  if (rounded.length) c.warn(`${base}.risk`, `risk statistics not shown${risk3Y ? " for the SI window" : ""}: ${rounded.length} month(s) come from rounded factsheet figures (${monthRanges(rounded)})`);
  const stats = fsBlock && isObj(fsBlock.block["Portfolio Snapshot"]) ? parseStatistics((fsBlock.block["Portfolio Snapshot"] as Obj)["Statistics Net"]) : null;
  if (stats && risk && !fsMismatch) {
    const checks: [string, number | null, number | null, number][] = [
      ["annReturn", risk.annReturn, stats.annReturn, 0.0006], ["annVol", risk.annVol, stats.annVol, 0.0006],
      ["downsideDev", risk.downsideDev, stats.downsideDev, 0.0006], ["sharpe", risk.sharpe, stats.sharpe, 0.051],
      ["sortino", risk.sortino, stats.sortino, 0.051], ["positiveMonths", risk.positiveMonths, stats.positiveMonths, 0.0051],
    ];
    for (const [k, a, b, tol] of checks) if (a != null && b != null && Math.abs(a - b) > tol) c.warn(`${base}.risk.${k}`, `${k}: computed ${a.toFixed(4)} vs factsheet ${fsBlock!.name} ${b.toFixed(4)} (computed kept)`);
  }

  c.prov[key] = `monthly net returns ${ym(firstMonth)} to ${ym(asOf)}: ${fsr.sources.join("; ")}; every month class_code ${fsr.classCode}, shown as class ${shown}; trailing/calendar/growth computed (compounded, annualized beyond 1 year)${fsTrailing ? `, cross-checked with factsheet ${fsBlock!.name}` : fsMismatch && fsBlock ? `, not cross-checked with factsheet ${fsBlock.name} (it publishes class ${classLabel(spec.key, fsClass) ?? fsClass ?? "?"})` : ""}${provParts.length ? `; ${provParts.join("; ")}` : ""}`;
  c.prov[`${base}.risk`] = `computed from the monthly net returns (SI and 3Y windows; population st.dev. ×√12; downside dev. = st.dev. of negative months ×√12; Sharpe and Sortino without risk-free rate, as in the factsheets; max drawdown from the running peak including the initial investment, whereas the factsheet uses month-end peaks only)`;
  // the label is derived from the class of the data used (fundSeries guarantees one labelled class for every month);
  // returnClass = the site code ("FP" / "F" / "H"), the label keeps the "Series <code>" form the UI localises
  const performance: Performance = {
    asOf, basis: "net", method: "compounded", firstMonth, monthly: toPoints(series), ...(indexMonthly ? { indexMonthly } : {}), trailing, calendar, growth,
    classCode: fsr.classCode, returnClass: shown!, returnClassLabel: `Series ${shown}`,
  };
  // less than 12 monthly returns: the page says "since class inception" (same flag as the per-class series)
  if (monthsBetween(firstMonth, asOf) + 1 < 12) performance.shortRecord = true;
  if (indexName) performance.indexName = indexName;
  return {
    performance, risk, risk3Y, trailingSource: "computed", fsTrailing, fsFile: fsBlock?.name ?? null, held: asOf < fsr.last ? fsr.last : undefined, alerts, unconfirmed,
    ref: { series, origin: fsr.origin, idx: FUND_SOURCES[spec.key].ftseIndex ? idx : null, firstMonth, indexName, sourceMonths: cand.sourceMonths, verify: cand.verify },
  };
}

/** GMV: gross, arithmetic; published figures from factsheet_data. */
function buildFactsheetPerformance(raw: RawPayloads, spec: FundSpec, prevPerf: Performance | null | undefined, c: Ctx, base: string, variantKey?: string): PerfBuild | null {
  const fsBlock = factsheetBlock(raw, spec, undefined, variantKey);
  if (!fsBlock) return null;
  const b = fsBlock.block;
  const key = `${base}.performance`;
  const { points, decimals: dec } = parseMonthlyTable(b["Monthly Returns Gross"]);
  if (!points.length) {
    c.error(key, `factsheet ${fsBlock.name}: no "Monthly Returns Gross" table`);
    return null;
  }
  const series: Series = {};
  for (const p of points) series[p.month] = p.r;
  const firstMonth = points[0].month;
  const asOf = points[points.length - 1].month;
  if (ym(asOf) !== fsBlock.month) {
    c.error(key, `factsheet ${fsBlock.name}: last monthly return is ${ym(asOf)}, expected ${fsBlock.month}`);
    return null;
  }
  const n = monthsBetween(firstMonth, asOf);
  if (n !== points.length) {
    c.error(key, `factsheet ${fsBlock.name}: monthly table has gaps (${points.length} of ${n} months)`);
    return null;
  }
  if (n < 12) {
    c.info(key, `track record of ${n} month(s) (< 12): performance is not shown (regulatory rule)`);
    return { performance: null, risk: null, risk3Y: null, trailingSource: null, fsTrailing: null, fsFile: null, withheld: "compliance" };
  }
  if (prevPerf && asOf < prevPerf.asOf) {
    c.error(key, `factsheet ${fsBlock.name} is older than the published performance (${ym(prevPerf.asOf)})`);
    return null;
  }
  const fsTrailing = parseTrailingTable(b["Trailing Returns Gross"], asOf.slice(0, 4));
  if (!fsTrailing) {
    c.error(key, `factsheet ${fsBlock.name}: no "Trailing Returns Gross"`);
    return null;
  }
  const fund: PeriodMap = {};
  for (const p of PERIOD_LIST) fund[p as keyof PeriodMap] = fsTrailing.fund[p as keyof PeriodMap] ?? null;
  const computed = fromTrailingMap(trailingOf(series, asOf, { method: "arithmetic" }));
  for (const p of PERIOD_LIST) {
    const a = computed[p as keyof PeriodMap];
    const f = fund[p as keyof PeriodMap];
    if (a != null && f != null && Math.abs(a - f) > 0.002 && Math.abs(a - f) <= 0.005) c.warn(`${base}.trailing.${p}`, `${p}: published ${pct(f)} vs recomputed from the rounded monthly table ${pct(a)}`);
  }
  const fsCal = parseCalendarTable(b["Calendar Performance Gross"]);
  const calendar: CalendarRow[] = calendarYears(series, asOf, { method: "arithmetic", first: firstMonth }).map((y) => {
    const pub = fsCal[String(y.year)]?.fund;
    const row: CalendarRow = { year: y.year, fund: pub ?? y.value };
    if (y.partial) row.partial = true;
    return row;
  });
  const growth: GrowthPoint[] = growthOf(series, asOf, { method: "arithmetic", first: firstMonth }).map((p) => ({ date: p.date, fund: p.value }));
  const monthDec = Math.max(...Object.values(dec), 0);
  const withPub = (r: RiskStats | null, pub: ReturnType<typeof parseStatistics>): RiskStats | null => {
    if (!r) return null;
    const decimals: NonNullable<RiskStats["decimals"]> = { bestMonth: monthDec, worstMonth: monthDec };
    const outR: RiskStats = { ...r };
    if (pub) {
      for (const k of ["annReturn", "annVol", "downsideDev", "sharpe", "sortino", "maxDrawdown", "positiveMonths"] as const) {
        if (pub[k] != null) {
          outR[k] = pub[k];
          if (pub.decimals[k] !== undefined) decimals[k] = pub.decimals[k];
        }
      }
    }
    outR.decimals = decimals;
    return outR;
  };
  const snap = isObj(b["Portfolio Snapshot"]) ? (b["Portfolio Snapshot"] as Obj) : {};
  const pub = parseStatistics(snap["Statistics Gross"]);
  const risk = withPub(riskFrom(riskStats(series, asOf, "SI", "arithmetic")), pub);
  const risk3Y = withPub(riskFrom(riskStats(series, asOf, "3Y", "arithmetic")), parseStatistics(snap["Statistics Gross 3Y"]));
  c.prov[key] = `factsheet ${fsBlock.name} (${variantKey ?? FUND_SOURCES[spec.key].factsheet!.key}): gross, non-compounded (overlay on notional); trailing and calendar as published; monthly table (${monthDec} decimal) for the monthly series and growth chart`;
  c.prov[`${base}.risk`] = pub ? `factsheet ${fsBlock.name} "Statistics Gross" (published precision in risk.decimals; best/worst month from the monthly table)` : `computed from the factsheet monthly table (non-compounded)`;
  return {
    performance: { asOf, basis: "gross", method: "arithmetic", firstMonth, monthly: points, trailing: { fund }, calendar, growth },
    risk, risk3Y, trailingSource: "factsheet", fsTrailing, fsFile: fsBlock.name,
  };
}

/* ------------------------------------------------------------------ NAV */

function registerFund(raw: RawPayloads, spec: FundSpec): RegisteredFund | null {
  if (!raw.apexFunds.ok || !raw.apexFunds.data) return null;
  const short = FUND_SOURCES[spec.key].dataplatform;
  const refs: FundRef[] = raw.unitholderFunds.ok && raw.unitholderFunds.data ? raw.unitholderFunds.data : [];
  const acct = refs.find((r) => r.short_name === short)?.apex_account;
  const live = raw.apexFunds.data.filter((f) => f.status !== "wound_down");
  return (acct ? live.find((f) => f.apex_account === acct) : undefined) ?? live.find((f) => f.key === PIPELINE_FUNDS[spec.key].apexKey) ?? null;
}

/**
 * Daily change of one class: the administrator's distribution-aware net daily return of the latest
 * valuation, only when it starts exactly at the previous valuation day shown. The $ change is shown only
 * when it is consistent with that return (no distribution in between).
 */
export function navChange(last: NavPoint, before: NavPoint | null): { changePct: number | null; change: number | null; reason: string | null } {
  if (!before) return { changePct: null, change: null, reason: "no previous valuation" };
  const r = last.net_daily_return;
  if (last.net_return_method !== "apex_distribution_aware") return { changePct: null, change: null, reason: `return method ${last.net_return_method ?? "unknown"} (not distribution-aware)` };
  if (typeof r !== "number" || !Number.isFinite(r)) return { changePct: null, change: null, reason: "no daily return" };
  if (last.return_start_date !== before.date) return { changePct: null, change: null, reason: `daily return starts ${last.return_start_date ?? "?"}, previous valuation shown is ${before.date}` };
  const nav = last.nav_per_share_local as number;
  const prevNav = before.nav_per_share_local as number;
  const priceRet = nav / prevNav - 1;
  return { changePct: r, change: Math.abs(priceRet - r) <= 1e-4 ? clean(nav - prevNav) : null, reason: null };
}

function buildNav(raw: RawPayloads, spec: FundSpec, prev: FundData | undefined, c: Ctx, base: string): { nav: FundData["nav"]; state: PartState } {
  const short = FUND_SOURCES[spec.key].dataplatform as DpShort;
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
    if (!cur || (cur.source !== "apex" && r.source === "apex")) m.set(r.date, r);
    byClass.set(r.fundserv, m);
  }
  const classes: NavClass[] = [];
  const noChange: string[] = [];
  for (const a of allowed) {
    const m = byClass.get(a.fundserv);
    const dates = m ? [...m.keys()].sort() : [];
    if (!dates.length) {
      c.info(`${base}.nav.${a.fundserv}`, `no NAV for class ${a.display ?? a.fundserv} (${a.fundserv}) in the last weeks`);
      continue;
    }
    const last = m!.get(dates[dates.length - 1])!;
    const before = dates.length > 1 ? m!.get(dates[dates.length - 2])! : null;
    const ch = navChange(last, before);
    if (ch.reason && before) noChange.push(`${a.display ?? a.fundserv}: ${ch.reason}`);
    classes.push({
      fundserv: a.fundserv,
      display: a.display ?? last.class_display ?? a.fundserv,
      currency: a.currency ?? last.currency ?? "CAD",
      nav: last.nav_per_share_local as number, date: last.date,
      prevNav: before ? (before.nav_per_share_local as number) : null,
      prevDate: before?.date ?? null,
      change: ch.change, changePct: ch.changePct,
    });
  }
  if (!classes.length) return carry("no NAV row for any live class");
  if (noChange.length) c.info(`${base}.nav`, `daily change not shown for ${noChange.join("; ")}`);
  const asOf = classes.map((k) => k.date as string).sort().pop() ?? null;
  c.prov[`${base}.nav`] = `dataplatform /api/performance/nav-timeseries ${short} (FINAL_NAV, NAV per unit in class currency, apex preferred; daily change = Apex distribution-aware net daily return from the previous valuation day, per class date); classes from /api/apex/funds (active)`;
  return { nav: { asOf, classes }, state: "fresh" };
}

/* ------------------------------------------------------------------ revisions */

/** months already published (up to the previous as-of) whose return changed by more than 1e-6, or disappeared */
export function revisions(prev: Performance | null | undefined, next: Performance | null): { month: string; before: number; after: number | null }[] {
  if (!prev || !next) return [];
  const now = new Map(next.monthly.map((p) => [p.month, p.r]));
  const out: { month: string; before: number; after: number | null }[] = [];
  for (const p of prev.monthly) {
    if (p.month > prev.asOf || p.month > next.asOf) continue;
    const a = now.get(p.month);
    if (a === undefined) out.push({ month: p.month, before: p.r, after: null });
    else if (Math.abs(a - p.r) > TOL.revision) out.push({ month: p.month, before: p.r, after: a });
  }
  return out;
}

/* ------------------------------------------------------------------ AUM */

function buildAum(raw: RawPayloads, spec: FundSpec, prev: FundData | undefined, c: Ctx, base: string): { aum: FundData["aum"]; state: PartState } {
  const short = FUND_SOURCES[spec.key].dataplatform as DpShort;
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

function buildFactsheetParts(raw: RawPayloads, spec: FundSpec, prev: FsParts | undefined, perfAsOf: string | null, c: Ctx, base: string, variantKey?: string): { parts: FsParts; state: PartState } {
  const keep = (why: string): { parts: FsParts; state: PartState } => {
    const hasPrev = !!prev && (prev.characteristics.length > 0 || Object.keys(prev.breakdowns).length > 0 || prev.topHoldings.length > 0 || prev.esg.length > 0);
    c.warn(`${base}.factsheet`, `${why}; ${hasPrev ? `previous factsheet data (${prev!.factsheetMonth ?? "?"}) kept` : "no factsheet data shown"}`);
    if (hasPrev) c.prov[`${base}.factsheet`] = carriedNoteFor(c, base, "factsheet");
    return {
      parts: prev ? { characteristics: prev.characteristics, breakdowns: prev.breakdowns, topHoldings: prev.topHoldings, esg: prev.esg, factsheetMonth: prev.factsheetMonth } : { characteristics: [], breakdowns: {}, topHoldings: [], esg: [], factsheetMonth: null },
      state: hasPrev ? "carried" : "none",
    };
  };
  const fs = FUND_SOURCES[spec.key].factsheet;
  if (!fs) return { parts: { characteristics: [], breakdowns: {}, topHoldings: [], esg: [], factsheetMonth: null }, state: "none" };
  if (!raw.factsheets.ok) return keep(`factsheet archives unavailable (${raw.factsheets.error ?? "not fetched"})`);
  const blk = factsheetBlock(raw, spec, undefined, variantKey);
  if (!blk) return keep(`"${variantKey ?? fs.key}" not found in ${fs.file} archives (${raw.factsheets.data?.tried.filter((t) => t.startsWith(fs.file)).join(", ")})`);
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
  c.prov[`${base}.factsheet`] = `factsheet archive ${blk.name} (${raw.factsheets.data?.where ?? "?"}), key ${variantKey ?? fs.key}: characteristics, breakdowns, top holdings${fs.file === "bonds_data" ? ", ESG metrics" : ""}`;
  return { parts, state: "fresh" };
}

/* ------------------------------------------------------------------ daily portfolio & distributions */

/**
 * Net assets of a fund on a book date: the sum of its classes' Apex closing capital (nav-timeseries
 * `net_asset_value_cad`, one row per mapped class). null when a class row of that day has no value, or when an
 * active class of the fund register (`required`) has no row that day (a partial sum is never a denominator).
 */
export function netAssetsOn(raw: RawPayloads, short: DpShort, date: string, required?: string[] | null): number | null {
  const res = raw.nav[short];
  if (!res?.ok || !res.data) return null;
  const rows = res.data.rows.filter((r) => r.source === "apex" && r.date === date && r.fundserv);
  if (!rows.length) return null;
  const byClass = new Map<string, number | null>();
  for (const r of rows) {
    const v = typeof r.net_asset_value_cad === "number" && Number.isFinite(r.net_asset_value_cad) ? r.net_asset_value_cad : null;
    if (byClass.has(r.fundserv!)) return null; // duplicate class rows: unknown
    byClass.set(r.fundserv!, v);
  }
  if ([...byClass.values()].some((v) => v === null)) return null;
  if (required && required.some((k) => !byClass.has(k))) return null;
  return [...byClass.values()].reduce<number>((a, v) => a + (v as number), 0);
}

/**
 * The fund's book computed by the website (fund-portfolio.ts) from its Apex holdings of `date`, the instrument master and
 * the classes' net assets, as a SourceResult like the PR #621 endpoint answer it replaces. Older snapshots without
 * holdings: their stored fund-portfolio answer.
 */
export function computedBook(raw: RawPayloads, short: DpShort, which: "latest" | "monthEnd"): SourceResult<FundPortfolio> | undefined {
  const h = raw.holdings?.[short];
  if (!h) return which === "latest" ? raw.portfolio?.[short] : raw.portfolioMonthEnd?.[short];
  const res = which === "latest" ? h.latest : h.monthEnd;
  if (!res) return undefined;
  if (!res.ok || !res.data) return { ok: false, data: null, error: res.error ?? "holdings unavailable" };
  const inst = raw.instruments;
  if (!inst?.ok || !inst.data) return { ok: false, data: null, error: `instrument master unavailable (${inst?.error ?? "not fetched"})` };
  try {
    const spec = FUNDS.find((f) => FUND_SOURCES[f.key].dataplatform === short);
    const reg = spec ? registerFund(raw, spec) : null;
    const required = reg ? reg.classes.filter((k) => k.status === "active").map((k) => k.fundserv) : null;
    const na = netAssetsOn(raw, short, res.data.date, required);
    const book = computeFundPortfolio(res.data, inst.data.refs, { short, netAssets: na });
    if (na === null && required && netAssetsOn(raw, short, res.data.date) !== null) book.warnings.push(`net assets of ${res.data.date} unavailable: an active register class (${required.join(", ")}) has no Apex closing capital that day`);
    if (!inst.data.universeComplete) book.warnings.push("bond universe read incompletely: coupon / maturity of some bonds unknown");
    return { ok: true, data: book };
  } catch (e: unknown) {
    return { ok: false, data: null, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Daily portfolio (primary when usable, see portfolio.ts), and the month-end cross-check with the factsheet of the
 * same month. The book is computed by the website from main-branch endpoints (computedBook). A failure keeps the
 * previously published daily book (validation drops it once it is too old).
 */
function buildPortfolio(raw: RawPayloads, spec: FundSpec, prev: FundData | undefined, fp: { parts: FsParts; state: PartState }, c: Ctx, base: string, now: Date): FundData["portfolio"] {
  const short = FUND_SOURCES[spec.key].dataplatform as DpShort;
  const res = computedBook(raw, short, "latest");
  const sel = selectPortfolio(res, { base, short, now, greenBonds: !!PIPELINE_FUNDS[spec.key].greenBonds });
  c.issues.push(...sel.issues);
  if (sel.absent) c.absent.portfolio.push(short);
  let portfolio = sel.portfolio;
  if (portfolio) c.prov[`${base}.portfolio`] = sel.provenance!;
  else if (res && !res.ok && !res.absent && prev?.portfolio?.source === "daily") {
    portfolio = prev.portfolio;
    c.info(`${base}.portfolio`, `previous daily book (${prev.portfolio.asOf}) kept`);
    c.prov[`${base}.portfolio`] = carriedNoteFor(c, base, "portfolio");
  }
  const month = fp.state === "fresh" ? fp.parts.factsheetMonth : null;
  const book = month ? monthEndBook([computedBook(raw, short, "monthEnd")?.data, res?.data], month) : null;
  if (book && month) {
    // sectors of the factsheet: issuer types ("Sectors") and industries ("Industry"); matched by label
    const snap = factsheetBlock(raw, spec, month)?.block["Portfolio Snapshot"];
    const sectors = [...(fp.parts.breakdowns.sectors ?? []), ...(isObj(snap) ? parseBuckets((snap as Obj)["Industry"]) : [])];
    c.issues.push(...crossCheckPortfolio(book, { month, characteristics: fp.parts.characteristics, sectors }, `${base}.portfolio.crossCheck`));
  }
  return portfolio ?? null;
}

/** Live series: the fund register's active classes, else the NAV classes being published. */
function liveClasses(raw: RawPayloads, spec: FundSpec, nav: FundData["nav"]): LiveClass[] | null {
  const reg = registerFund(raw, spec);
  if (reg) return reg.classes.filter((k) => k.status === "active").map((k) => ({ fundserv: k.fundserv, display: k.display, currency: k.currency }));
  return nav?.classes.length ? nav.classes.map((k) => ({ fundserv: k.fundserv, display: k.display, currency: k.currency })) : null;
}

function buildDistributions(raw: RawPayloads, spec: FundSpec, prev: FundData | undefined, nav: FundData["nav"], c: Ctx, base: string, now: Date): FundData["distributions"] {
  const short = FUND_SOURCES[spec.key].dataplatform as DpShort;
  const res = raw.distributions?.[short];
  const sel = selectDistributions(res, { base, short, live: liveClasses(raw, spec, nav), today: now.toISOString().slice(0, 10) });
  c.issues.push(...sel.issues);
  if (sel.absent) c.absent.distributions.push(short);
  if (sel.distributions) {
    c.prov[`${base}.distributions`] = sel.provenance!;
    return sel.distributions;
  }
  if (res && !res.ok && !res.absent && prev?.distributions) {
    c.info(`${base}.distributions`, `previous distributions (as of ${prev.distributions.asOf}) kept`);
    c.prov[`${base}.distributions`] = carriedNoteFor(c, base, "distributions");
    return prev.distributions;
  }
  return null;
}

/** One info issue per run for an endpoint that is not deployed yet (404), instead of one per fund. */
function absentEndpoints(c: Ctx, raw: RawPayloads): void {
  if (c.absent.portfolio.length) c.info("sources.fund-portfolio", `dataplatform /api/apex/fund-portfolio not available (HTTP 404, not deployed yet?) for ${c.absent.portfolio.join(", ")}: month-end factsheet figures shown`);
  if (!raw.distributions) c.info("sources.distributions", "no distributions endpoint on the dataplatform main branch (PR #621 not merged) and no exact way to derive them from nav-timeseries: distribution policy text only");
  if (c.absent.distributions.length) c.info("sources.distributions", `dataplatform /api/performance/distributions not available (HTTP 404, not deployed yet?) for ${c.absent.distributions.join(", ")}: distribution policy text only`);
}

/** provenance of a part carried over from the previous publication */
function carriedNoteFor(c: Ctx, base: string, part: string): string {
  const old = c.prevProv[`${base}.${part}`];
  // a part already carried keeps its original provenance (it names the publication it comes from)
  if (old?.startsWith("carried over")) return old;
  return `carried over from the publication of ${c.prevGenerated}${old ? ` (${old})` : ""}`;
}

/* ------------------------------------------------------------------ classes and variants */

/** Previous publication's performance of the same class as `next` (never another class: its months are not "revised"). */
function comparablePrevious(prev: FundData | undefined, next: Performance): Performance | null {
  if (!prev) return null;
  const same = (p: Performance | null | undefined): boolean => !!p && (next.classCode && p.classCode ? p.classCode === next.classCode : p.returnClass === next.returnClass);
  if (same(prev.performance)) return prev.performance;
  const hit = Object.values(prev.performanceByClass ?? {}).find((k) => same(k.performance));
  return hit ? hit.performance : null;
}

/**
 * Returns of every class of the fund that has a series. The headline class (the track record) is the fund's main series,
 * as built and cross-checked. Every other configured class (classSeriesOf) is compounded from its OWN daily NAV chain
 * (nav-timeseries, daily-chain.ts), never from another class's numbers:
 *  - from the class's first computable month (its first complete month on or after the fund's data start and its own
 *    first valuation) to the headline's as-of, EVERY month: a month that is unavailable, or that cannot be used (CIBC
 *    months while the headline did not verify the stored CIBC returns, the cut-over bridge while the headline's was not
 *    consistent), drops the class — never a truncated run shown as "since series inception";
 *  - at least 12 months, as for the headline (regulatory rule);
 *  - the fund's fee band against the headline class on every common month (FUND_SOURCES.classSpread; none for a fund
 *    whose classes may differ by a performance fee).
 * A dropped class is absent (the page says "coming soon"), with a warn issue and an alert naming why. Class entries are
 * held and carried with the headline.
 */
function buildClasses(
  raw: RawPayloads, spec: FundSpec, prev: FundData | undefined, pb: PerfBuild | null, performance: Performance | null,
  risk: RiskStats | null, risk3Y: RiskStats | null, c: Ctx, base: string,
): { byClass: Record<string, ClassPerformance>; alerts: string[] } {
  const src = FUND_SOURCES[spec.key];
  const classes = classSeriesOf(spec.key);
  const alerts: string[] = [];
  // the main series carried over (a source failed this run): the classes carried over with it
  const byClass: Record<string, ClassPerformance> = pb ? {} : performance && prev?.performanceByClass ? { ...prev.performanceByClass } : {};
  const head = performance?.classCode ? classes.find((k) => k.classCode === performance.classCode) : undefined;
  if (head && performance) byClass[head.fundserv] = { fundserv: head.fundserv, display: head.display, performance, risk, risk3Y };
  if (!pb?.performance || !pb.ref || !head) return { byClass, alerts };
  const asOf = pb.performance.asOf;
  const ref = pb.ref;
  for (const k of classes) {
    if (k.classCode === head.classCode) continue;
    const key = `${base}.performance.classes.${k.fundserv}`;
    const lbl = `class ${k.display} (${k.fundserv})`;
    const drop = (why: string): void => {
      c.warn(key, `${lbl}: ${why}; returns not shown for this class`);
      alerts.push(`${lbl} not shown: ${why}`);
    };
    const ch = classChain(raw, spec, k.fundserv);
    if (ch.error) {
      drop(`daily NAV chain unavailable (${ch.error})`);
      continue;
    }
    const months = ch.months.filter((m) => m.month <= asOf);
    if (!months.length || !ch.start) {
      drop(`no computable month up to ${ym(asOf)}${ch.start ? ` (own data from ${ch.start})` : " (no own NAV row)"}`);
      continue;
    }
    const first = months[0].month;
    // every month from the class's first computable month: an unusable one drops the class (never a truncated run)
    const unusable = months.map((m) => ({
      m,
      why: m.status !== "ready" || m.r === null ? m.issue ?? m.status
        : m.source === "cibc" && !ref.verify.cibc ? "stored CIBC daily returns not verified on the headline class"
        : m.source === "bridge" && !ref.verify.bridge ? "cut-over bridge not confirmed on the headline class" : null,
    })).filter((x) => x.why);
    if (unusable.length) {
      drop(`${unusable.length} month(s) unusable after its first computable month ${ym(first)} (own data from ${ch.start}): ${unusable.slice(0, 3).map((x) => `${ym(x.m.month)} ${x.why}`).join("; ")}${unusable.length > 3 ? "; …" : ""}`);
      continue;
    }
    if (months[months.length - 1].month !== asOf) {
      drop(`series ends ${ym(months[months.length - 1].month)}, not at the headline's ${ym(asOf)}`);
      continue;
    }
    const series: Series = Object.fromEntries(months.map((m) => [m.month, m.r as number]));
    const n = months.length;
    if (n < 12) {
      c.info(key, `${lbl}: ${n} month(s) since ${ym(first)} (< 12): returns not shown for this class (regulatory rule)`);
      continue;
    }
    if (src.classSpread) {
      const band = classSpreadProblem(series, ref.sourceMonths, src.classSpread);
      if (band) {
        drop(`vs class ${head.display}: ${band}`);
        continue;
      }
    } else c.info(key, `${lbl}: no fee band against class ${head.display} for this fund (${src.classSpreadNote ?? "classes may differ by more than a fixed fee"}); the other gates apply`);
    const b = buildClassPerformance({ key, cls: k, series, asOf, idx: ref.idx, indexName: ref.indexName });
    c.issues.push(...b.issues);
    if (!b.entry) continue;
    const problems = performanceProblems(b.entry.performance, "compounded", true);
    if (problems.length) {
      drop(`${problems[0]}${problems.length > 1 ? ` (+${problems.length - 1} more)` : ""}`);
      continue;
    }
    byClass[k.fundserv] = b.entry;
    const checked = src.classSpread ? `fee band vs class ${head.display} checked on ${sortedKeys(series).filter((m) => m in ref.sourceMonths).length} month(s)` : `no fee band (${src.classSpreadNote ?? "not configured"})`;
    c.prov[key] = `monthly net returns of ${lbl} ${ym(first)} to ${ym(asOf)} (every month since its first computable month; own data from ${ch.start}) compounded by the website from dataplatform /api/performance/nav-timeseries fundserv=${k.fundserv} (${chainNote(sortedKeys(series), ch.months)}); ${checked}`;
  }
  return { byClass, alerts };
}

/** Variants of a strategy (GMV): one factsheet block each; the default variant's data is the fund's own. */
function buildVariants(
  raw: RawPayloads, spec: FundSpec, prev: FundData | undefined,
  own: { performance: Performance | null; risk: RiskStats | null; risk3Y: RiskStats | null; fp: FsParts }, c: Ctx, base: string,
): Record<string, VariantData> | undefined {
  const defs = FUND_SOURCES[spec.key].variants;
  if (!defs?.length) return undefined;
  const out: Record<string, VariantData> = {};
  defs.forEach((v, i) => {
    if (i === 0) {
      out[v.id] = { variant: v.id, performance: own.performance, risk: own.risk, risk3Y: own.risk3Y, ...own.fp };
      return;
    }
    const vb = `${base}.variants.${v.id}`;
    const old = prev?.variants?.[v.id];
    const pb = buildFactsheetPerformance(raw, spec, old?.performance, c, vb, v.key);
    if (!pb?.performance) {
      if (old) {
        out[v.id] = old;
        c.warn(`${vb}.performance`, `variant ${v.id} %: no usable factsheet block "${v.key}"; previous publication kept (as of ${old.performance?.asOf.slice(0, 7) ?? "?"})`);
      } else c.warn(`${vb}.performance`, `variant ${v.id} %: no usable factsheet block "${v.key}"; the variant is not shown`);
      return;
    }
    const fp = buildFactsheetParts(raw, spec, old, pb.performance.asOf, c, vb, v.key);
    out[v.id] = { variant: v.id, performance: pb.performance, risk: pb.risk, risk3Y: pb.risk3Y, ...fp.parts };
  });
  return out;
}

/* ------------------------------------------------------------------ fund */

function buildFund(raw: RawPayloads, spec: FundSpec, prevData: SiteData | null, c: Ctx, opts: BuildOptions, now: Date): { fund: FundData | null; ctx: FundContext } {
  const base = `funds.${spec.key}`;
  const prev = prevData?.funds[spec.key];
  const ctx: FundContext = {
    key: spec.key, method: PIPELINE_FUNDS[spec.key].method, trailingSource: null, factsheetTrailing: null, factsheetTrailingFile: null,
    parts: { performance: "none", nav: "none", aum: "none", factsheet: "none" }, alerts: [], revisions: [],
  };

  // performance + risk
  let performance: Performance | null = null;
  let risk: RiskStats | null = null;
  let risk3Y: RiskStats | null = null;
  let pb: PerfBuild | null = null;
  const src = FUND_SOURCES[spec.key];
  const short = src.dataplatform;
  if (short) {
    pb = buildNetPerformance(raw, spec, prev, c, base, opts);
  } else if (src.factsheet) {
    if (!raw.factsheets.ok) c.error(`${base}.performance`, `factsheet archives unavailable (${raw.factsheets.error ?? "not fetched"})`);
    else pb = buildFactsheetPerformance(raw, spec, prev?.performance, c, base);
    if (raw.factsheets.ok && !pb && !factsheetBlock(raw, spec)) c.error(`${base}.performance`, `"${src.factsheet.key}" not found in the ${src.factsheet.file} archives`);
  }
  if (pb) {
    performance = pb.performance;
    risk = pb.risk;
    risk3Y = pb.risk3Y;
    ctx.trailingSource = pb.trailingSource;
    ctx.parts.performance = pb.performance ? (pb.held || (prev?.performance && pb.performance.asOf === prev.performance.asOf && pb.performance.asOf < lastClosedMonth(now)) ? "held" : "fresh") : "none";
    if (pb.fsTrailing && pb.performance) {
      ctx.factsheetTrailing = pb.fsTrailing.fund;
      ctx.factsheetTrailingFile = pb.fsFile;
      ctx.factsheetTrailingDecimals = pb.fsTrailing.decimals.fund;
    }
    if (pb.withheld === "error") ctx.alerts.push("performance withheld");
    if (pb.alerts?.length) ctx.alerts.push(...pb.alerts);
    if (pb.unconfirmed?.length && pb.performance) ctx.unconfirmed = pb.unconfirmed.filter((m) => m <= pb!.performance!.asOf);
    if (pb.held) c.info(`${base}.performance`, `performance kept at ${ym(pb.performance!.asOf)} until the ${ym(pb.held)} factsheet is available and consistent`);
  } else if (prev?.performance && withClassLabel(spec.key, prev.performance)) {
    // relabelled by its own class (a publication made before classes were tracked carries its track-record class)
    performance = withClassLabel(spec.key, prev.performance);
    risk = prev.risk;
    risk3Y = prev.risk3Y ?? null;
    ctx.parts.performance = "carried";
    ctx.trailingSource = null;
    ctx.alerts.push("performance carried over");
    c.error(`${base}.performance`, `performance kept from the previous publication (as of ${ym(prev.performance.asOf)})`);
    c.prov[`${base}.performance`] = carriedNoteFor(c, base, "performance");
    if (c.prevProv[`${base}.risk`]) c.prov[`${base}.risk`] = carriedNoteFor(c, base, "risk");
  } else {
    if (short || FUND_SOURCES[spec.key].factsheet) ctx.alerts.push("no performance");
  }

  // returns per class (net funds): every class that has a series; the default class (F) is the headline when it has one
  let performanceByClass: FundData["performanceByClass"];
  let defaultClass: string | undefined;
  if (short) {
    const cls = buildClasses(raw, spec, prev, pb, performance, risk, risk3Y, c, base);
    performanceByClass = cls.byClass;
    defaultClass = spec.headlineClass ?? undefined;
    ctx.alerts.push(...cls.alerts);
  }

  // revisions of already published months (M5), against the same class of the previous publication; a change of class
  // restates every month: no revision list, the change itself needs an approval (validate.ts)
  const prevClass = perfClassCode(spec.key, prev?.performance);
  if (performance && ctx.parts.performance !== "carried" && !(prev?.performance && performance.classCode && prevClass !== performance.classCode)) {
    ctx.revisions = revisions(comparablePrevious(prev, performance), performance);
    if (ctx.revisions.length) {
      c.warn(`${base}.performance.monthly`, `revised month(s) already published: ${ctx.revisions.slice(0, 6).map((r) => `${ym(r.month)} ${pct(r.before)} → ${r.after === null ? "removed" : pct(r.after)}`).join("; ")}${ctx.revisions.length > 6 ? "; …" : ""}`);
      ctx.alerts.push(`${ctx.revisions.length} published month(s) revised`);
    }
  }
  // the same for every other class entry, against the previous publication's entry of the same FundServ code and class
  // (a class change of an entry is gated in validate.ts)
  if (ctx.parts.performance !== "carried") {
    for (const [fsv, entry] of Object.entries(performanceByClass ?? {})) {
      if (entry.performance === performance) continue;
      const old = prev?.performanceByClass?.[fsv]?.performance;
      if (!old || (old.classCode && entry.performance.classCode && old.classCode !== entry.performance.classCode)) continue;
      const rev = revisions(old, entry.performance);
      if (!rev.length) continue;
      ctx.revisions.push(...rev.map((r) => ({ ...r, fundserv: fsv })));
      c.warn(`${base}.performance.classes.${fsv}.monthly`, `class ${entry.display} (${fsv}): revised month(s) already published: ${rev.slice(0, 6).map((r) => `${ym(r.month)} ${pct(r.before)} → ${r.after === null ? "removed" : pct(r.after)}`).join("; ")}${rev.length > 6 ? "; …" : ""}`);
      ctx.alerts.push(`class ${entry.display} (${fsv}): ${rev.length} published month(s) revised`);
    }
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
  for (const part of ["nav", "aum", "factsheet"] as const) if (ctx.parts[part] === "carried") ctx.alerts.push(`${part} carried over`);

  // daily portfolio and distributions (fund vehicles only): never an alert, the page falls back on its own
  const portfolio = short ? buildPortfolio(raw, spec, prev, fp, c, base, now) : null;
  const distributions = short ? buildDistributions(raw, spec, prev, nav, c, base, now) : null;

  // strategy variants (GMV 3 / 6 / 9 % downside volatility): the default variant is the fund's own data above
  const variants = !short && src.variants ? buildVariants(raw, spec, prev, { performance, risk, risk3Y, fp: fp.parts }, c, base) : undefined;

  const hasAny = performance || nav || aum || portfolio || fp.parts.characteristics.length || fp.parts.topHoldings.length || Object.keys(fp.parts.breakdowns).length;
  if (!hasAny) return { fund: null, ctx };
  const fund: FundData = {
    key: spec.key,
    sourceName: [short ? `dataplatform ${short}` : null, src.analytics ? `analytics "${src.analytics}"` : null, src.factsheet ? `${src.factsheet.file}:${src.factsheet.key}` : null].filter(Boolean).join(" / "),
    performance, risk, risk3Y, nav, aum,
    characteristics: fp.parts.characteristics,
    breakdowns: fp.parts.breakdowns,
    topHoldings: fp.parts.topHoldings,
    esg: fp.parts.esg,
    factsheetMonth: fp.parts.factsheetMonth,
    portfolio,
    distributions,
    ...(performanceByClass && Object.keys(performanceByClass).length ? { performanceByClass, defaultClass } : {}),
    ...(variants ? { variants, defaultVariant: src.variants![0].id } : {}),
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

export function buildSiteData(raw: RawPayloads, previous: SiteData | null, now: Date, opts: BuildOptions = {}): BuildResult {
  const o: BuildOptions = { requireFactsheetForNewMonth: false, ...opts };
  // never carry over illustrative data into a live dataset
  const prev = previous && previous.mode === "live" ? previous : null;
  const c = new Ctx();
  c.prevProv = prev?.provenance ?? {};
  c.prevGenerated = prev?.generatedAt ?? "";
  const funds: SiteData["funds"] = {};
  const context: BuildResult["context"] = {};
  for (const spec of FUNDS) {
    const { fund, ctx } = buildFund(raw, spec, prev, c, o, now);
    context[spec.key] = ctx;
    if (fund) funds[spec.key] = fund;
    else c.warn(`funds.${spec.key}`, `no data available for this fund`);
  }
  absentEndpoints(c, raw);
  const data: SiteData = {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    mode: o.mode ?? "live",
    asOf: computeAsOf(funds),
    funds,
    provenance: c.prov,
    issues: c.issues,
  };
  return { data, context };
}

/** helper for callers/tests */
export const bucketsTotal = (bs: Bucket[]): number => bs.reduce((a, b) => a + (b.fund ?? 0), 0);
