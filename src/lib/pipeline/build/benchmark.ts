// benchmark.ts — FTSE index monthly returns (dataplatform levels) and the factsheet index cross-checks
import type { FundSpec } from "../../../config/funds.ts";
import type { PeriodMap } from "../../data/types.ts";
import { ym } from "../../data/dates.ts";
import { FTSE_COMPARABLE_FROM, INDEX_MONTHLY_TOL } from "../config.ts";
import { addMonths, monthEndReturns, sortedKeys, type Series } from "../metrics.ts";
import { indexMonthlyTableKey, parseCalendarTable, parseMonthlyTable, parseTrailingTable, type Obj, type TrailingTable } from "../parse.ts";
import type { RawPayloads } from "../raw.ts";
import { pct } from "../format.ts";
import type { Ctx } from "./context.ts";
import { monthRanges } from "./helpers.ts";

/** first month of a trailing window (a difference is expected when the window starts before the FTSE cutover) */
export function periodStart(p: string, asOf: string, firstMonth: string): string {
  const n: Record<string, number> = { "1M": 1, "3M": 3, "1Y": 12, "2Y": 24, "3Y": 36, "5Y": 60, "10Y": 120 };
  if (p === "SI") return firstMonth;
  if (p === "YTD") return `${asOf.slice(0, 4)}-01-31`;
  return addMonths(asOf, -(n[p] - 1));
}

export interface IndexBuild {
  /** FTSE monthly returns (month-end to month-end levels), first month to as-of */
  monthly: Series;
  name: string | null;
  source: string | null;
  prov: string;
  /** published figures of the factsheet (cross-check only) */
  pub: { file: string; month: string; monthly: Series; trailing: PeriodMap | null; va: PeriodMap | null; decimals: TrailingTable["decimals"] | null; calendar: Record<string, { index?: number | null }> } | null;
}

/** info before the producer's FTSE cutover (its index was the ETF then), warn after */
export function indexNote(c: Ctx, key: string, month: string, msg: string): void {
  if (month < FTSE_COMPARABLE_FROM) c.info(key, `${msg} (expected before ${ym(FTSE_COMPARABLE_FROM)}: the factsheet index was the ETF)`);
  else c.warn(key, msg);
}

/**
 * Index monthly returns computed from the dataplatform FTSE index-summary levels (seam-joined history,
 * closed month-ends only). The factsheet's published index tables are read for cross-checks only.
 */
export function buildIndex(raw: RawPayloads, spec: FundSpec, fsb: { name: string; month: string; block: Obj } | null, firstMonth: string, asOf: string, c: Ctx, base: string): IndexBuild {
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
      for (const l of res.data.links ?? []) {
        if (l.kind !== "gap" || !l.gap) continue;
        const bp = (x: number): string => `${(x * 10_000).toFixed(2)} bp`;
        c.info(key, `FTSE ${ftseName}: earlier name ${l.name} linked across the one-day gap ${l.gap.last} → ${l.gap.first} (no overlap): implied gap return ${bp(l.gap.implied)}, yield/duration estimate ${bp(l.gap.estimate)}, residual ${bp(l.gap.residual)} within the threshold ${bp(l.gap.threshold)} (3 × p95 of ${l.gap.samples} daily residuals, between 2 and 5 bp)`);
      }
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
