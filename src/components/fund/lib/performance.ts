// performance.ts — trailing returns, return badges, class and benchmark labels, calendar years and risk windows
import type { CalendarRow, Period, PeriodMap, RiskStats } from "../../../lib/data/types.ts";
import { monthsBetween } from "../../../lib/data/dates.ts";
import { isNum } from "./is-num.ts";

const PERIOD_ORDER: Period[] = ["1M", "3M", "YTD", "1Y", "2Y", "3Y", "5Y", "10Y", "SI"];

/** Periods for which the fund has a trailing return, in display order. */
export function trailingPeriods(fund: PeriodMap | undefined | null): Period[] {
  if (!fund) return [];
  return PERIOD_ORDER.filter((p) => isNum(fund[p]));
}

/** Monthly returns in a track record from `firstMonth` to `asOf` (both month-ends, inclusive). */
export function trackMonths(firstMonth: string, asOf: string): number {
  return monthsBetween(firstMonth, asOf);
}

/**
 * Since-inception return is annualized when the record has at least 12 monthly returns: the pipeline's rule
 * (metrics.trailing: `si.length >= 12`). Unknown dates: annualized (the pipeline's default for long records).
 */
export function siAnnualized(firstMonth?: string | null, asOf?: string | null): boolean {
  if (!firstMonth || !asOf) return true;
  return trackMonths(firstMonth, asOf) >= 12;
}

/** Periods that are annualized (2 years and more, and since inception from 12 monthly returns). */
export function isAnnualized(p: Period, firstMonth?: string | null, asOf?: string | null): boolean {
  if (p === "2Y" || p === "3Y" || p === "5Y" || p === "10Y") return true;
  if (p !== "SI") return false;
  return siAnnualized(firstMonth, asOf);
}

/**
 * Value added rounded to the precision it is displayed at (percent points, `decimals`), as a decimal
 * fraction; 0 means "in line with the benchmark" (never "−0.0%").
 */
export function vaRounded(va: number | null | undefined, decimals = 1): number | null {
  if (!isNum(va)) return null;
  const k = Math.pow(10, decimals);
  const r = +(Math.round(va * 100 * k) / k / 100).toFixed(decimals + 2);
  return Math.abs(r) < 1e-12 ? 0 : r;
}

/**
 * Benchmark name to display: in French the registry's localized name (the published FTSE `indexName` is English);
 * in English the published name, else the registry's. The disclosure / provenance keep the raw `indexName`.
 */
export function benchmarkLabel(
  indexName: string | null | undefined,
  benchmark: { en: string; fr: string } | null | undefined,
  lang: "en" | "fr",
): string | null {
  const loc = benchmark ? benchmark[lang] || benchmark.en : null;
  if (lang === "fr") return loc || indexName || null;
  return indexName || loc || null;
}

/** Label of the class the performance is published for: "Series F", else "class FP", else null. */
export function perfClassLabel(
  perf: { returnClass?: string; returnClassLabel?: string } | null | undefined,
  classWord: string,
): string | null {
  if (!perf) return null;
  // labels arrive in English ("Series FP"): keep only the class code and use the localised word
  const m = perf.returnClassLabel?.match(/^(?:series|class|s\u00e9rie|classe)\s+(.+)$/i);
  if (m) return `${classWord} ${m[1]}`;
  if (perf.returnClassLabel) return perf.returnClassLabel;
  return perf.returnClass ? `${classWord} ${perf.returnClass}` : null;
}

/** Calendar years with a fund figure (a year without one is not shown). */
export function calendarRows(rows: CalendarRow[] | undefined | null): CalendarRow[] {
  return (rows ?? []).filter((r) => isNum(r.fund)).sort((a, b) => a.year - b.year);
}

/** Why a calendar year is incomplete: "ytd" only for the as-of year, "launch" for an earlier partial (inception) year. */
export type PartialKind = "ytd" | "launch" | null;

export function partialKind(
  year: number,
  partial: boolean | null | undefined,
  asOf: string | null | undefined,
): PartialKind {
  if (!partial) return null;
  const y = asOf && /^\d{4}/.test(asOf) ? +asOf.slice(0, 4) : null;
  return y != null && year === y ? "ytd" : "launch";
}

/**
 * The contract publishes one RiskStats (its `window` says SI or 3Y). The page offers an SI / 3Y toggle,
 * so it also accepts an array of windows (or `{ SI, "3Y" }`) should the pipeline publish both; only
 * windows with at least one figure are kept, SI first.
 */
export function riskWindows(risk: unknown): RiskStats[] {
  const list: unknown[] = Array.isArray(risk)
    ? risk
    : risk && typeof risk === "object" && !("window" in risk)
      ? Object.values(risk as object)
      : [risk];
  const ok = list
    .filter(
      (r): r is RiskStats =>
        !!r && typeof r === "object" && ((r as RiskStats).window === "SI" || (r as RiskStats).window === "3Y"),
    )
    .filter((r) => Object.entries(r).some(([k, v]) => k !== "window" && isNum(v)));
  const seen = new Set<string>();
  return ok
    .filter((r) => (seen.has(r.window) ? false : (seen.add(r.window), true)))
    .sort((a, b) => (a.window === "SI" ? -1 : b.window === "SI" ? 1 : 0));
}

/** Periods shown as return badges under the header (6M is not published by the pipeline). */
const BADGE_PERIODS: Period[] = ["1M", "3M", "YTD", "1Y", "3Y", "5Y", "10Y", "SI"];

export interface Badge {
  period: Period;
  value: number;
  annualized: boolean;
}

/** Return badges: published fund returns only, in display order; none when the admin hid performance. */
export function returnBadges(
  perf:
    | {
        trailing: { fund: PeriodMap };
        firstMonth?: string;
        asOf?: string;
      }
    | null
    | undefined,
  hidden = false,
): Badge[] {
  if (!perf || hidden) return [];
  return BADGE_PERIODS.filter((p) => isNum(perf.trailing.fund[p])).map((p) => ({
    period: p,
    value: perf.trailing.fund[p] as number,
    annualized: isAnnualized(p, perf.firstMonth, perf.asOf),
  }));
}

/** One row of the trailing returns table: a period with a fund figure (benchmark / value added null when not published). */
interface TrailingRow {
  period: Period;
  fund: number;
  index: number | null;
  va: number | null;
  annualized: boolean;
}

/** Rows of the trailing / annualized returns table: fund, benchmark and value added per period with a fund figure. */
export function trailingRows(
  perf:
    | {
        trailing: { fund: PeriodMap; index?: PeriodMap; va?: PeriodMap };
        firstMonth?: string;
        asOf?: string;
      }
    | null
    | undefined,
): TrailingRow[] {
  if (!perf) return [];
  return trailingPeriods(perf.trailing.fund).map((p) => {
    const index = perf.trailing.index?.[p];
    const va = perf.trailing.va?.[p];
    return {
      period: p,
      fund: perf.trailing.fund[p] as number,
      index: isNum(index) ? index : null,
      va: isNum(va) ? va : null,
      annualized: isAnnualized(p, perf.firstMonth, perf.asOf),
    };
  });
}
