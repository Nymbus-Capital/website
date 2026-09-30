/**
 * Per-series distributions (FundData.distributions) from the dataplatform distributions endpoint. Pure.
 *
 * Classes are matched by FundServ code only (never by class letter), and only the live classes of the fund
 * register are kept. The data platform computes the summaries (last distribution, trailing 12 months, calendar
 * years); this module selects and reshapes. Consistency gates: validate.ts.
 */
import type { ClassDistribution, DistributionFrequency, DistributionsData, Issue } from "../data/types.ts";
import { DISTRIBUTIONS } from "./config.ts";
import type { ClassDistributions, SourceResult } from "./raw.ts";

export interface LiveClass { fundserv: string; display: string | null; currency: string | null }

export interface DistributionsSelection {
  distributions: DistributionsData | null;
  issues: Issue[];
  provenance: string | null;
  /** the endpoint answered 404 (not deployed yet): reported once per run by the caller */
  absent: boolean;
}

/** "monthly", "Quarterly", "semi_annual", "yearly" … → the site's frequency; anything else → null. */
export function frequency(v: string | null | undefined): DistributionFrequency | null {
  const s = (v ?? "").toLowerCase().replace(/[\s_]+/g, "-");
  if (s === "monthly") return "monthly";
  if (s === "quarterly") return "quarterly";
  if (s === "semi-annual" || s === "semiannual" || s === "half-yearly") return "semi-annual";
  if (s === "annual" || s === "yearly") return "annual";
  if (s === "irregular") return "irregular";
  return null;
}

/** One live class: summary and history from the payload, labels and currency from the fund register. */
export function classDistribution(data: ClassDistributions, live: LiveClass): ClassDistribution | null {
  const code = live.fundserv.toUpperCase();
  const summary = data.classes.find((c) => c.fundserv.toUpperCase() === code) ?? null;
  const rows = data.rows.filter((r) => r.fundserv.toUpperCase() === code);
  if (!summary && !rows.length) return null;
  const history = rows.map((r) => ({ date: r.date, amount: r.amount_per_unit })).slice(-DISTRIBUTIONS.maxHistory);
  // a capped history no longer holds every row of its first year: calendar years from the next one only
  const firstFullYear = rows.length > history.length ? +history[0].date.slice(0, 4) + 1 : 0;
  const last = summary?.last_date && summary.last_amount_per_unit !== null ? { date: summary.last_date, amount: summary.last_amount_per_unit } : null;
  return {
    fundserv: live.fundserv,
    display: live.display ?? summary?.class_display ?? rows[0]?.class_display ?? live.fundserv,
    currency: live.currency ?? summary?.currency ?? rows[0]?.currency ?? "CAD",
    frequency: frequency(summary?.frequency_observed),
    last,
    trailing12m: summary?.trailing_12m_per_unit ?? null,
    calendarYears: (summary?.calendar_years ?? []).filter((y) => y.year >= firstFullYear).map((y) => ({ year: y.year, amount: y.per_unit, count: y.count })),
    history,
  };
}

export function selectDistributions(res: SourceResult<ClassDistributions> | undefined, o: { base: string; short: string; live: LiveClass[] | null; today: string }): DistributionsSelection {
  const key = `${o.base}.distributions`;
  const none = (issues: Issue[] = [], absent = false): DistributionsSelection => ({ distributions: null, issues, provenance: null, absent });
  if (!res) return none();
  if (!res.ok || !res.data) {
    if (res.absent) return none([], true);
    return none([{ key, level: "warn", message: `distributions unavailable (${res.error ?? "no data"}): not shown` }]);
  }
  if (!o.live) return none([{ key, level: "warn", message: "live series unknown (fund register unavailable): distributions not shown" }]);
  const data = res.data;
  const issues: Issue[] = [];
  if (data.notes.length) issues.push({ key, level: "info", message: `distributions payload: ${data.notes.slice(0, 5).join("; ")}` });
  if (data.warnings.length) issues.push({ key, level: "info", message: `dataplatform: ${data.warnings.slice(0, 5).join("; ")}` });
  const classes: ClassDistribution[] = [];
  const missing: string[] = [];
  for (const l of [...o.live].sort((a, b) => a.fundserv.localeCompare(b.fundserv))) {
    const c = classDistribution(data, l);
    if (c) classes.push(c);
    else missing.push(l.fundserv);
  }
  const liveCodes = new Set(o.live.map((l) => l.fundserv.toUpperCase()));
  const notLive = [...new Set([...data.classes.map((c) => c.fundserv), ...data.rows.map((r) => r.fundserv)])].filter((f) => !liveCodes.has(f.toUpperCase()));
  if (notLive.length) issues.push({ key, level: "info", message: `series not live, not shown: ${notLive.sort().join(", ")}` });
  if (missing.length) issues.push({ key, level: "info", message: `live series without distribution data: ${missing.join(", ")}` });
  if (!classes.length) return none([...issues, { key, level: "info", message: "no distribution data for any live series" }]);
  const lastRow = data.rows.length ? data.rows[data.rows.length - 1].date : null;
  const asOf = data.end_date && data.end_date <= o.today ? data.end_date : lastRow ?? o.today;
  const provenance = `dataplatform /api/performance/distributions ${o.short} (${data.rows.length} row(s)${data.start_date ? ` from ${data.start_date}` : ""}; per unit, class currency, keyed by FundServ code${data.method ? `; ${data.method}` : ""}); live series from /api/apex/funds`;
  return { distributions: { asOf, classes }, issues, provenance, absent: false };
}
