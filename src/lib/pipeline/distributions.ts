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

interface DistributionsSelection {
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

/**
 * The currency of one series: the fund register's and the payload's (summary and every row) must agree, and one of them
 * must say it. Never a default: an amount in an unknown or disputed currency is not shown.
 */
function seriesCurrency(live: LiveClass, payload: (string | null | undefined)[]): { currency: string } | { problem: string } {
  const reg = live.currency?.trim().toUpperCase() || null;
  const inPayload = [...new Set(payload.filter((c): c is string => !!c?.trim()).map((c) => c.trim().toUpperCase()))].sort();
  if (inPayload.length > 1) return { problem: `currencies disagree within the payload (${inPayload.join(", ")})` };
  if (reg && inPayload.length && inPayload[0] !== reg) return { problem: `currency ${inPayload[0]} in the payload vs ${reg} in the fund register` };
  const currency = reg ?? inPayload[0] ?? null;
  return currency ? { currency } : { problem: "currency unknown (neither the fund register nor the payload gives it)" };
}

/**
 * One live class: summary and history from the payload, labels and currency from the fund register. Null when the
 * payload has nothing for it, or when its currency is unknown or disputed (the reason is appended to `problems`).
 */
export function classDistribution(data: ClassDistributions, live: LiveClass, problems: string[] = []): ClassDistribution | null {
  const code = live.fundserv.toUpperCase();
  const summary = data.classes.find((c) => c.fundserv.toUpperCase() === code) ?? null;
  const rows = data.rows.filter((r) => r.fundserv.toUpperCase() === code);
  if (!summary && !rows.length) return null;
  const cur = seriesCurrency(live, [summary?.currency, ...rows.map((r) => r.currency)]);
  if ("problem" in cur) {
    problems.push(`${live.display ?? live.fundserv} (${live.fundserv}): ${cur.problem}`);
    return null;
  }
  const history = rows.map((r) => ({ date: r.date, amount: r.amount_per_unit })).slice(-DISTRIBUTIONS.maxHistory);
  // a capped history no longer holds every row of its first year: calendar years from the next one only
  const firstFullYear = rows.length > history.length ? +history[0].date.slice(0, 4) + 1 : 0;
  const last = summary?.last_date && summary.last_amount_per_unit !== null ? { date: summary.last_date, amount: summary.last_amount_per_unit } : null;
  return {
    fundserv: live.fundserv,
    display: live.display ?? summary?.class_display ?? rows[0]?.class_display ?? live.fundserv,
    currency: cur.currency,
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
    const problems: string[] = [];
    const c = classDistribution(data, l, problems);
    if (c) classes.push(c);
    else if (problems.length) for (const p of problems) issues.push({ key: `${key}.${l.fundserv}`, level: "warn", message: `distributions of series ${p}: not shown` });
    else missing.push(l.fundserv);
  }
  const liveCodes = new Set(o.live.map((l) => l.fundserv.toUpperCase()));
  const notLive = [...new Set([...data.classes.map((c) => c.fundserv), ...data.rows.map((r) => r.fundserv)])].filter((f) => !liveCodes.has(f.toUpperCase()));
  if (notLive.length) issues.push({ key, level: "info", message: `series not live, not shown: ${notLive.sort().join(", ")}` });
  if (missing.length) issues.push({ key, level: "info", message: `live series without distribution data: ${missing.join(", ")}` });
  if (!classes.length) return none([...issues, { key, level: "info", message: "no distribution data for any live series" }]);
  // "Data as of": the latest distribution of the series shown (not the end of the requested window)
  const dates = classes.flatMap((c) => [c.last?.date, c.history[c.history.length - 1]?.date]).filter((d): d is string => !!d && d <= o.today).sort();
  const asOf = dates[dates.length - 1] ?? (data.end_date && data.end_date <= o.today ? data.end_date : o.today);
  const provenance = `dataplatform /api/performance/distributions ${o.short} (${data.rows.length} row(s)${data.start_date ? ` from ${data.start_date}` : ""}; per unit, class currency, keyed by FundServ code${data.method ? `; ${data.method}` : ""}); live series from /api/apex/funds`;
  // the trailing 12 months end at the response's end date (the day of the read), not at the last distribution
  const trailingTo = data.end_date && /^\d{4}-\d{2}-\d{2}$/.test(data.end_date) ? data.end_date : undefined;
  return { distributions: { asOf, checkedAt: o.today, ...(trailingTo ? { trailingTo } : {}), classes }, issues, provenance, absent: false };
}
