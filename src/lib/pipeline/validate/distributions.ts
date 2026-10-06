// distributions.ts — distributions gates (never blocking: implausible series and figures are dropped)
import type { ClassDistribution, FundData, Issue } from "../../data/types.ts";
import { DISTRIBUTIONS } from "../config.ts";
import { pct } from "../format.ts";
import { days, isNum, ISO } from "./helpers.ts";

/** Why one series' distributions are implausible or internally inconsistent, or null. `nav`: its NAV per unit when known. */
export function distributionProblem(c: ClassDistribution, nav: number | null, today: string): string | null {
  const navOk = isNum(nav) && nav > 0;
  let prev = "";
  for (const h of c.history) {
    if (typeof h.date !== "string" || !ISO.test(h.date) || h.date > today) return `invalid date ${h.date}`;
    if (h.date <= prev) return `dates not ascending at ${h.date}`;
    prev = h.date;
    if (!isNum(h.amount) || h.amount <= 0) return `amount ${h.amount} on ${h.date}`;
    if (navOk && h.amount >= DISTRIBUTIONS.maxShareOfNav * (nav as number)) return `${h.amount} on ${h.date} is ${pct(h.amount / (nav as number))} of the NAV per unit`;
  }
  const lastRow = c.history[c.history.length - 1];
  if (c.last) {
    if (!lastRow || lastRow.date !== c.last.date || Math.abs(lastRow.amount - c.last.amount) > 1e-9) return `last distribution ${c.last.date} ${c.last.amount} differs from the last row`;
  } else if (lastRow) return "rows but no last distribution";
  if (c.trailing12m !== null) {
    if (!isNum(c.trailing12m) || c.trailing12m < 0) return `trailing 12 months ${c.trailing12m}`;
    if (navOk && c.trailing12m >= DISTRIBUTIONS.maxTrailingShareOfNav * (nav as number)) return `trailing 12 months ${c.trailing12m} is ${pct(c.trailing12m / (nav as number))} of the NAV per unit`;
  }
  for (const y of c.calendarYears) {
    const rows = c.history.filter((h) => h.date.startsWith(`${y.year}-`));
    const total = rows.reduce((a, h) => a + h.amount, 0);
    if (!isNum(y.amount) || y.count !== rows.length || Math.abs(y.amount - total) > DISTRIBUTIONS.sumTol * Math.max(1, rows.length)) {
      return `calendar year ${y.year}: ${y.amount} over ${y.count} vs ${+total.toFixed(6)} over ${rows.length} row(s)`;
    }
  }
  return null;
}

/** Same day one year earlier, 29 February → 28 February (the data platform's `_year_before`), YYYY-MM-DD. */
export function yearBefore(date: string): string {
  const y = String(+date.slice(0, 4) - 1).padStart(4, "0"), md = date.slice(5);
  return md === "02-29" ? `${y}-02-28` : `${y}-${md}`;
}

/**
 * Why the trailing-12-month total disagrees with the series' own rows, or null. The window is the data platform's: the
 * distributions dated after the same day one year before `to` (the response's end date, the day of the read — not the
 * last distribution), up to and including `to`. The rows cover every distribution since the fund's data start; when the
 * history was capped (DISTRIBUTIONS.maxHistory) short of the window start, the figure cannot be checked.
 */
export function trailingProblem(c: ClassDistribution, to: string | null | undefined, today: string): string | null {
  if (c.trailing12m === null) return null;
  if (typeof to !== "string" || !ISO.test(to)) return "end of the 12-month window unknown";
  if (to > today) return `end of the 12-month window ${to} is in the future`;
  const from = yearBefore(to);
  if (c.history.length && c.history[0].date > from && c.history.length >= DISTRIBUTIONS.maxHistory) return `history does not reach back to ${from}`;
  const rows = c.history.filter((h) => h.date > from && h.date <= to);
  const total = rows.reduce((a, h) => a + h.amount, 0);
  return Math.abs(total - c.trailing12m) > DISTRIBUTIONS.sumTol * Math.max(1, rows.length)
    ? `${c.trailing12m} vs ${+total.toFixed(6)} over the ${rows.length} distribution(s) after ${from} up to ${to}`
    : null;
}

/**
 * Gates of the distributions: drops them all when the source has not been read successfully for too long (carried
 * over), the series that fail (see distributionProblem), and a trailing-12-month figure that its rows do not add up to.
 * Returns the issues.
 */
export function checkDistributions(f: FundData, base: string, now: Date): Issue[] {
  const d = f.distributions;
  if (!d) return [];
  const today = now.toISOString().slice(0, 10);
  const issues: Issue[] = [];
  const read = typeof d.checkedAt === "string" && ISO.test(d.checkedAt) ? Math.floor(days(d.checkedAt, now)) : Number.NaN; // whole days
  if (!(read <= DISTRIBUTIONS.maxCarryDays)) {
    issues.push({ key: `${base}.distributions`, level: "warn", message: `distributions not shown: source last read successfully ${d.checkedAt ?? "(date unknown)"}, more than ${DISTRIBUTIONS.maxCarryDays} days ago` });
    f.distributions = null;
    return issues;
  }
  d.classes = (d.classes ?? []).filter((c) => {
    const nav = f.nav?.classes.find((k) => k.fundserv.toUpperCase() === c.fundserv.toUpperCase())?.nav ?? null;
    const why = distributionProblem(c, nav, today);
    if (why) issues.push({ key: `${base}.distributions.${c.fundserv}`, level: "warn", message: `distributions of series ${c.display} (${c.fundserv}) not shown: ${why}` });
    return !why;
  });
  for (const c of d.classes) {
    const why = trailingProblem(c, d.trailingTo, today);
    if (why) {
      issues.push({ key: `${base}.distributions.${c.fundserv}.trailing12m`, level: "warn", message: `trailing 12 months of series ${c.display} (${c.fundserv}) not shown: ${why}` });
      c.trailing12m = null;
    }
  }
  if (!d.classes.length) f.distributions = null;
  return issues;
}
