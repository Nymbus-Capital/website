// completeness.ts — embedded (invisible) data-quality gate: what every public fund page needs before a run is published
import type { FundData, FundKey, Performance, SiteData } from "../../data/types.ts";
import { monthsBetween, ym } from "../../data/dates.ts";

/**
 * One fund's completeness problems: things a visitor would otherwise see as a missing block. Never shown on the pages:
 * they become non-blocking advisories (admin + alert channel) so a human fixes the source before it shows. Pure.
 *
 * Checked on the data that would go live:
 *  - a series with complete figures exists (≥ 12 full months, no withheld month, since-inception / 1-year / YTD figures)
 *    for the fund's preferred class or, failing that, for any CAD class or its track record;
 *  - the preferred (headline) class has complete figures of its own (else the pages show another class, labelled);
 *  - withheld months left in any published series (each one hides the periods over it);
 *  - a fund vehicle has a NAV for its headline class;
 *  - the performance includes the last closed month once `expectedMonth` is due.
 */
export interface CompletenessProblem {
  fund: FundKey;
  /** stable fingerprint (alert deduplication) */
  code: string;
  message: string;
}

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** a series a visitor can be shown in full: ≥ 12 full months, nothing withheld, the headline figures present */
export function completeSeries(p: Performance | null | undefined): boolean {
  if (!p) return false;
  if (p.withheldMonths?.length) return false;
  const full = monthsBetween(p.firstMonth, p.asOf) - (p.partialFirstMonth ? 1 : 0);
  if (full < 12) return false;
  // same rule as the pages' choice of series (components/fund/lib/returns-class.ts isComplete)
  return isNum(p.trailing.fund.SI);
}

export function fundCompleteness(
  key: FundKey,
  f: FundData | undefined,
  opts: { vehicle: "fund" | "strategy"; headlineClass: string | null; expectedMonth?: string | null },
): CompletenessProblem[] {
  const out: CompletenessProblem[] = [];
  const add = (code: string, message: string): void => {
    out.push({ fund: key, code: `${key}:${code}`, message });
  };
  if (!f) {
    add("missing", "no data for this fund in the run: its page would have no figure");
    return out;
  }
  const byClass = Object.values(f.performanceByClass ?? {});
  const head = opts.headlineClass?.toUpperCase() ?? null;
  const headEntry = head ? byClass.find((c) => c.fundserv.toUpperCase() === head) : undefined;
  const anyComplete = completeSeries(f.performance) || byClass.some((c) => completeSeries(c.performance));
  if (!f.performance && !byClass.length && !f.variants) add("no-performance", "no performance series at all");
  else if (!anyComplete && !f.variants)
    add(
      "no-complete-series",
      "no series with complete figures (≥ 12 full months, nothing withheld, a since-inception figure): the pages show partial figures only",
    );
  if (head && byClass.length && !completeSeries(headEntry?.performance) && anyComplete)
    add(
      `headline-incomplete:${head}`,
      `the preferred class ${head} has no complete series of its own${headEntry?.performance.withheldMonths?.length ? ` (withheld: ${headEntry.performance.withheldMonths.map(ym).join(", ")})` : ""}: the pages show another class (labelled with its own name)`,
    );
  const withheld = [
    ...(f.performance?.withheldMonths?.length
      ? [[f.performance.returnClass ?? "track record", f.performance.withheldMonths] as const]
      : []),
    ...byClass
      .filter((c) => c.performance.withheldMonths?.length)
      .map((c) => [c.fundserv, c.performance.withheldMonths!] as const),
  ];
  // one problem per distinct set of months (the track record and its own class entry usually share them): no duplicates
  const byMonths = new Map<string, string[]>();
  for (const [cls, months] of withheld) {
    const k = [...months].sort().join(",");
    byMonths.set(k, [...new Set([...(byMonths.get(k) ?? []), cls])]);
  }
  for (const [k, classes] of byMonths)
    add(
      `withheld:${k}`,
      `series ${classes.join(", ")}: month(s) ${k.split(",").map(ym).join(", ")} withheld (the periods over them are hidden)`,
    );
  if (opts.vehicle === "fund") {
    const navs = f.nav?.classes ?? [];
    if (!navs.some((c) => isNum(c.nav))) add("no-nav", "no NAV for any class");
    else if (head && !navs.some((c) => c.fundserv.toUpperCase() === head && isNum(c.nav)))
      add(`no-headline-nav:${head}`, `no NAV for the preferred class ${head}`);
  }
  const asOf = f.performance?.asOf ?? null;
  if (opts.expectedMonth && asOf && asOf < opts.expectedMonth)
    add(`behind:${opts.expectedMonth}`, `performance as of ${ym(asOf)}, ${ym(opts.expectedMonth)} is due`);
  return out;
}

/** Every fund of the data that would go live. */
export function siteCompleteness(
  data: SiteData,
  specs: { key: FundKey; vehicle: "fund" | "strategy"; headlineClass: string | null }[],
  expectedMonth?: string | null,
): CompletenessProblem[] {
  return specs.flatMap((s) =>
    fundCompleteness(s.key, data.funds[s.key] ?? undefined, {
      vehicle: s.vehicle,
      headlineClass: s.headlineClass,
      expectedMonth,
    }),
  );
}
