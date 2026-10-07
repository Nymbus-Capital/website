// factsheet-performance.ts — GMV: gross, arithmetic performance as published in the factsheet archive
import type { FundSpec } from "../../../config/funds.ts";
import type { CalendarRow, GrowthPoint, Performance, PeriodMap, RiskStats } from "../../data/types.ts";
import { monthsBetween, ym } from "../../data/dates.ts";
import { FUND_SOURCES } from "../fund-sources.ts";
import { calendarYears, growth as growthOf, riskStats, trailing as trailingOf, type Series } from "../metrics.ts";
import {
  isObj,
  parseCalendarTable,
  parseMonthlyTable,
  parseStatistics,
  parseTrailingTable,
  type Obj,
} from "../parse.ts";
import type { RawPayloads } from "../raw.ts";
import { pct } from "../format.ts";
import type { Ctx } from "./context.ts";
import { fromTrailingMap, PERIOD_LIST, riskFrom } from "./helpers.ts";
import { factsheetBlock } from "./factsheets.ts";
import type { PerfBuild } from "./performance.ts";

/** GMV: gross, arithmetic; published figures from factsheet_data. */
export function buildFactsheetPerformance(
  raw: RawPayloads,
  spec: FundSpec,
  prevPerf: Performance | null | undefined,
  c: Ctx,
  base: string,
  variantKey?: string,
): PerfBuild | null {
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
    return {
      performance: null,
      risk: null,
      risk3Y: null,
      trailingSource: null,
      fsTrailing: null,
      fsFile: null,
      withheld: "compliance",
    };
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
    if (a != null && f != null && Math.abs(a - f) > 0.002 && Math.abs(a - f) <= 0.005)
      c.warn(
        `${base}.trailing.${p}`,
        `${p}: published ${pct(f)} vs recomputed from the rounded monthly table ${pct(a)}`,
      );
  }
  const fsCal = parseCalendarTable(b["Calendar Performance Gross"]);
  const calendar: CalendarRow[] = calendarYears(series, asOf, { method: "arithmetic", first: firstMonth }).map((y) => {
    const pub = fsCal[String(y.year)]?.fund;
    const row: CalendarRow = { year: y.year, fund: pub ?? y.value };
    if (y.partial) row.partial = true;
    return row;
  });
  const growth: GrowthPoint[] = growthOf(series, asOf, { method: "arithmetic", first: firstMonth }).map((p) => ({
    date: p.date,
    fund: p.value,
  }));
  const monthDec = Math.max(...Object.values(dec), 0);
  const withPub = (r: RiskStats | null, pub: ReturnType<typeof parseStatistics>): RiskStats | null => {
    if (!r) return null;
    const decimals: NonNullable<RiskStats["decimals"]> = { bestMonth: monthDec, worstMonth: monthDec };
    const outR: RiskStats = { ...r };
    if (pub) {
      for (const k of [
        "annReturn",
        "annVol",
        "downsideDev",
        "sharpe",
        "sortino",
        "maxDrawdown",
        "positiveMonths",
      ] as const) {
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
  const risk3Y = withPub(
    riskFrom(riskStats(series, asOf, "3Y", "arithmetic")),
    parseStatistics(snap["Statistics Gross 3Y"]),
  );
  c.prov[key] =
    `factsheet ${fsBlock.name} (${variantKey ?? FUND_SOURCES[spec.key].factsheet!.key}): gross, non-compounded (overlay on notional); trailing and calendar as published; monthly table (${monthDec} decimal) for the monthly series and growth chart`;
  c.prov[`${base}.risk`] = pub
    ? `factsheet ${fsBlock.name} "Statistics Gross" (published precision in risk.decimals; best/worst month from the monthly table)`
    : `computed from the factsheet monthly table (non-compounded)`;
  return {
    performance: {
      asOf,
      basis: "gross",
      method: "arithmetic",
      firstMonth,
      monthly: points,
      trailing: { fund },
      calendar,
      growth,
    },
    risk,
    risk3Y,
    trailingSource: "factsheet",
    fsTrailing,
    fsFile: fsBlock.name,
  };
}
