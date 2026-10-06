// series.ts — one class's monthly series: daily NAV chain months and the continuous, single-class track record
import type { FundSpec } from "../../../config/funds.ts";
import { ym } from "../../data/dates.ts";
import { classLabel, factsheetClassAt, FUND_SOURCES } from "../fund-sources.ts";
import { PIPELINE_FUNDS } from "../config.ts";
import { addMonths, sortedKeys, toMonthEnd, type Series } from "../metrics.ts";
import { fundMonthlyTableKey, parseMonthlyTable } from "../parse.ts";
import type { DpShort, RawPayloads } from "../raw.ts";
import { classMonths, classStart, type ChainMonth } from "../daily-chain.ts";
import type { Ctx } from "./context.ts";
import { monthRanges, pct4 } from "./helpers.ts";
import { factsheetBlock, factsheetFilesFor, sameClassArchive } from "./factsheets.ts";
import { effectiveNavStart } from "./register.ts";

/** where one month of a series comes from */
export type Origin = "analytics" | "dataplatform" | "navchain" | "factsheet";

export interface FundSeries {
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

export type MnrResult = RawPayloads["monthlyReturns"][DpShort];

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
export function chainNote(months: string[], chain: ChainMonth[]): string {
  const by: Record<string, string[]> = {};
  for (const m of chain) if (months.includes(m.month)) (by[m.source] ??= []).push(m.month);
  return Object.entries(by).map(([k, ms]) => `${k} ${monthRanges(ms)}`).join(", ");
}

/**
 * One class's series: the months gathered (with their origin and class) → continuous track record from the official
 * start, of a single labelled class, with the newest same-class factsheet monthly table filling (only when `fill`)
 * and cross-checking it.
 */
export function finishSeries(raw: RawPayloads, spec: FundSpec, c: Ctx, base: string, g: {
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
