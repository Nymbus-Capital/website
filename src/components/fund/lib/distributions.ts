// distributions.ts — distribution series, amount precision, history rows and bars
import type { ClassDistribution, DistributionsData } from "../../../lib/data/types.ts";
import { isNum } from "./is-num.ts";

/** Series with distribution data, the headline one first, then by FundServ code. */
export function distributionClasses(
  d: DistributionsData | null | undefined,
  headline: string | null | undefined,
): ClassDistribution[] {
  const h = (headline ?? "").toUpperCase();
  return [...(d?.classes ?? [])].sort((a, b) =>
    a.fundserv.toUpperCase() === h ? -1 : b.fundserv.toUpperCase() === h ? 1 : a.fundserv.localeCompare(b.fundserv),
  );
}

/**
 * Decimals for every amount of one series (cards, chart, tables): the fewest between 4 and 6 at which each amount it
 * shows (history, last distribution, trailing 12 months, calendar-year totals) is exact, so the rows of a year add up to
 * its total as displayed. Amounts per unit are recorded with up to 6 decimals.
 */
export function amountDecimals(c: ClassDistribution | null | undefined): number {
  if (!c) return 4;
  const values = [
    ...c.history.map((h) => h.amount),
    c.last?.amount,
    c.trailing12m,
    ...c.calendarYears.map((y) => y.amount),
  ].filter(isNum);
  for (let d = 4; d < 6; d++) if (values.every((v) => Math.abs(v - Number(v.toFixed(d))) < 5e-10)) return d;
  return 6;
}

/** Tag a calendar year as year to date: the year of the reference date (the last successful read of the source) while that year is not over. */
export function isYearToDate(year: number, ref: string | null | undefined): boolean {
  if (!ref || !/^\d{4}-\d{2}-\d{2}$/.test(ref)) return false;
  return String(year) === ref.slice(0, 4) && ref < `${year}-12-31`;
}

/** History newest first: the last `limit` distributions, or all of them. */
export function historyRows(
  c: ClassDistribution | null | undefined,
  all: boolean,
  limit = 12,
): { date: string; amount: number }[] {
  const rows = [...(c?.history ?? [])].filter((r) => isNum(r.amount)).reverse();
  return all ? rows : rows.slice(0, limit);
}

/** Bars of the history chart: the last `n` distributions, oldest first. */
export function distributionBars(c: ClassDistribution | null | undefined, n = 24): { date: string; amount: number }[] {
  return (c?.history ?? []).filter((r) => isNum(r.amount)).slice(-n);
}
