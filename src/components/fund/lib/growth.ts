// growth.ts — the growth-of-10 000 $ chart: available ranges and rebasing
import type { GrowthPoint } from "../../../lib/data/types.ts";
import { isNum } from "./is-num.ts";

export type Range = "1Y" | "3Y" | "5Y" | "SI";
const RANGE_MONTHS: Record<Range, number> = { "1Y": 12, "3Y": 36, "5Y": 60, SI: Infinity };

/** Ranges the record is long enough for (SI always; 1Y/3Y/5Y only when shorter than the whole record). */
export function availableRanges(points: GrowthPoint[]): Range[] {
  const months = points.length - 1;
  const out: Range[] = (["1Y", "3Y", "5Y"] as Range[]).filter((r) => months > RANGE_MONTHS[r]);
  return [...out, "SI"];
}

export type GrowthMethod = "compounded" | "arithmetic";

/**
 * How the published growth series aggregates returns: the published `method`, else arithmetic for a gross series
 * (the GMV overlay, computed on notional without reinvestment), else compounded.
 */
export function growthMethod(perf: { method?: string | null; basis?: string | null } | null | undefined, specBasis?: "net" | "gross"): GrowthMethod {
  if (perf?.method === "arithmetic" || perf?.method === "compounded") return perf.method;
  return (perf?.basis ?? specBasis) === "gross" ? "arithmetic" : "compounded";
}

interface GrowthSeries {
  dates: string[]; fund: number[]; index: (number | null)[]; hasIndex: boolean; start: number;
  /** fund return over the range shown (decimal), consistent with the method: what the end label / aria state */
  change: number | null;
}

/**
 * Points of a range, rebased so the range starts at 10 000 $ like the published series (10 000 $ at inception).
 * A compounded series is rebased by ratio (p / p0 × 10 000); an arithmetic one (10 000 × (1 + Σr), no reinvestment)
 * additively (10 000 + p − p0), which is 10 000 × (1 + Σr over the range). SI returns the published values untouched.
 */
export function growthRange(points: GrowthPoint[], range: Range, method: GrowthMethod = "compounded"): GrowthSeries {
  const clean = points.filter((p) => isNum(p.fund));
  const n = RANGE_MONTHS[range];
  const slice = n === Infinity || clean.length <= n + 1 ? clean : clean.slice(clean.length - (n + 1));
  const base = clean[0]?.fund ?? 10000;
  const start = 10000;
  const f0 = slice[0]?.fund;
  const i0 = slice.find((p) => isNum(p.index))?.index ?? null;
  const rebased = range !== "SI" && slice !== clean;
  const add = method === "arithmetic";
  const rb = (v: number, v0: number | null | undefined) => (!rebased || !isNum(v0) || !v0 ? v : add ? start + (v - v0) : (v / v0) * start);
  const fund = slice.map((p) => rb(p.fund, f0));
  const index = slice.map((p) => (isNum(p.index) ? rb(p.index, i0) : null));
  const s0 = rebased ? start : base;
  const last = fund[fund.length - 1];
  // arithmetic: Σr over the range = (p − p0) / notional; compounded: p / p0 − 1 (the notional is 10 000 $ either way)
  const change = fund.length > 1 && isNum(last) && s0 ? (add ? (last - fund[0]) / start : last / fund[0] - 1) : null;
  return { dates: slice.map((p) => p.date), fund, index, hasIndex: index.some(isNum), start: s0, change };
}
