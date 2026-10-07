// performance.ts — what a performance build returns, factsheet trailing cross-checks and revisions
import type { FundData, Performance, PeriodMap, RiskStats } from "../../data/types.ts";
import { monthsBetween } from "../../data/dates.ts";
import { factsheetTolerance, TOL } from "../config.ts";
import type { Series } from "../metrics.ts";
import type { TrailingTable } from "../parse.ts";
import type { FundContext } from "./context.ts";
import { PERIOD_LIST } from "./helpers.ts";
import type { ChainVerification } from "./track-record.ts";

export interface PerfBuild {
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
  ref?: {
    series: Series;
    origin: Record<string, string>;
    idx: Series | null;
    /** daily index levels (since-inception benchmark of a series launched mid-month) */
    idxLevels?: Record<string, number> | null;
    firstMonth: string;
    indexName?: string;
    sourceMonths: Series;
    verify: ChainVerification;
  };
}

/** a factsheet trailing table can serve as a cross-check only if the fund row has 1M, 3M, YTD and 1Y */
export function crossCheckable(tt: TrailingTable | null): tt is TrailingTable {
  return (
    !!tt &&
    (["1M", "3M", "YTD", "1Y"] as const).every(
      (k) => typeof tt.fund[k] === "number" && Number.isFinite(tt.fund[k] as number),
    )
  );
}

/** fund trailing vs published factsheet, per-period tolerance: "ok" | "warn" | "block" per period */
export function crossCheck(
  fund: PeriodMap,
  fs: TrailingTable,
): { period: string; computed: number; published: number; level: "warn" | "block" }[] {
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

/** Fewer than 12 monthly returns from `firstMonth` to `asOf` (both month-ends, inclusive). */
export const isShortRecord = (firstMonth: string, asOf: string): boolean => monthsBetween(firstMonth, asOf) < 12;

/** months already published (up to the previous as-of) whose return changed by more than 1e-6, or disappeared */
export function revisions(
  prev: Performance | null | undefined,
  next: Performance | null,
): { month: string; before: number; after: number | null }[] {
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

/** Previous publication's performance of the same class as `next` (never another class: its months are not "revised"). */
export function comparablePrevious(prev: FundData | undefined, next: Performance): Performance | null {
  if (!prev) return null;
  const same = (p: Performance | null | undefined): boolean =>
    !!p && (next.classCode && p.classCode ? p.classCode === next.classCode : p.returnClass === next.returnClass);
  if (same(prev.performance)) return prev.performance;
  const hit = Object.values(prev.performanceByClass ?? {}).find((k) => same(k.performance));
  return hit ? hit.performance : null;
}
