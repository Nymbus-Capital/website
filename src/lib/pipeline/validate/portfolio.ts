// portfolio.ts — daily portfolio gates (never blocking: implausible parts are dropped)
import type { FundData, Issue, PortfolioData, PortfolioMetric, WeightBucket } from "../../data/types.ts";
import { PORTFOLIO } from "../config.ts";
import { bookAgeProblem } from "../../data/freshness.ts";
import { pct } from "../format.ts";
import { isNum, ISO } from "./helpers.ts";

const RATING = /^(AAA|AA[+-]?|A[+-]?|BBB[+-]?|BB[+-]?|B[+-]?|CCC[+-]?|CC|C|D)$/;

/** Why a characteristic is implausible, or null. */
function metricProblem(m: PortfolioMetric): string | null {
  if (!isNum(m.coverage) || m.coverage < 0 || m.coverage > 1) return `coverage ${m.coverage}`;
  if (m.id === "rating") return typeof m.value === "string" && RATING.test(m.value) ? null : `rating "${m.value}"`;
  if (!isNum(m.value)) return `value ${m.value}`;
  const [lo, hi] = PORTFOLIO.ranges[m.id];
  return m.value < lo || m.value > hi ? `${m.value} outside ${lo}–${hi}` : null;
}

/** Why a breakdown is implausible (weights not numbers, or not adding up to 100 % of net assets), or null. */
function breakdownProblem(rows: WeightBucket[]): string | null {
  if (!rows.length) return "empty";
  if (rows.some((r) => !isNum(r.weight) || Math.abs(r.weight) > 1.5)) return "a weight is not a plausible number";
  const total = rows.reduce((a, r) => a + r.weight, 0);
  return Math.abs(total - 1) > PORTFOLIO.weightSumTol ? `weights add up to ${pct(total)}` : null;
}

/** Why the top-holdings list is implausible, or null. */
function holdingsProblem(rows: PortfolioData["topHoldings"]): string | null {
  if (rows.some((h) => !h.name || !isNum(h.weight) || h.weight <= 0 || h.weight > PORTFOLIO.maxHoldingWeight))
    return `a weight is outside (0, ${pct(PORTFOLIO.maxHoldingWeight)}]`;
  const total = rows.reduce((a, h) => a + h.weight, 0);
  return total > 1 + 1e-9 ? `weights add up to ${pct(total)}` : null;
}

/**
 * Gates of the daily portfolio: repairs in place (drops what is implausible) and returns the issues. Never blocking:
 * without a plausible daily block the page shows the month-end factsheet figures.
 */
export function checkPortfolio(f: FundData, base: string, now: Date): Issue[] {
  const p = f.portfolio;
  if (!p) return [];
  const key = `${base}.portfolio`;
  const issues: Issue[] = [];
  const warn = (k: string, message: string) => issues.push({ key: k, level: "warn", message });
  const drop = (why: string): Issue[] => {
    warn(key, `daily portfolio not shown: ${why}; month-end factsheet figures shown`);
    f.portfolio = null;
    return issues;
  };
  const stale = bookAgeProblem(p.asOf, now);
  if (stale) return drop(stale);

  p.characteristics = (p.characteristics ?? []).filter((m) => {
    const why = metricProblem(m);
    if (why) warn(`${key}.characteristics.${m.id}`, `${m.id} not shown: ${why}`);
    return !why;
  });
  for (const [k, rows] of Object.entries(p.breakdowns ?? {}) as [keyof PortfolioData["breakdowns"], WeightBucket[]][]) {
    const why = breakdownProblem(rows ?? []);
    if (why) {
      warn(`${key}.breakdowns.${k}`, `${k} breakdown not shown: ${why}`);
      delete p.breakdowns[k];
    }
  }
  const hw = holdingsProblem(p.topHoldings ?? []);
  if (hw) {
    warn(`${key}.topHoldings`, `top holdings not shown: ${hw}`);
    p.topHoldings = [];
  }
  for (const h of p.topHoldings) {
    // field repairs: an implausible detail is blanked, the holding and its weight stay
    if (
      h.coupon !== null &&
      !(isNum(h.coupon) && h.coupon >= PORTFOLIO.ranges.coupon[0] && h.coupon <= PORTFOLIO.ranges.coupon[1])
    )
      h.coupon = null;
    if (h.maturity !== null && !(typeof h.maturity === "string" && ISO.test(h.maturity))) h.maturity = null;
  }
  if (
    p.greenBondsWeight !== null &&
    !(isNum(p.greenBondsWeight) && p.greenBondsWeight >= 0 && p.greenBondsWeight <= 1)
  ) {
    warn(`${key}.greenBondsWeight`, `green bonds weight ${p.greenBondsWeight} not shown`);
    p.greenBondsWeight = null;
  }
  if (p.totals) {
    const t = p.totals;
    for (const k of ["holdings", "bonds", "derivatives"] as const)
      if (t[k] !== null && !(isNum(t[k]) && Number.isInteger(t[k]) && (t[k] as number) >= 0)) t[k] = null;
    if (t.cashWeight !== null && !(isNum(t.cashWeight) && Math.abs(t.cashWeight) <= 1)) t.cashWeight = null;
  }
  if (p.coverage)
    for (const k of ["resolved", "priced"] as const)
      if (
        p.coverage[k] !== null &&
        !(isNum(p.coverage[k]) && (p.coverage[k] as number) >= 0 && (p.coverage[k] as number) <= 1)
      )
        p.coverage[k] = null;
  if (!p.characteristics.length && !Object.keys(p.breakdowns).length && !p.topHoldings.length)
    return drop("nothing plausible left");
  return issues;
}
