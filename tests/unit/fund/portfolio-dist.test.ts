/**
 * Fund page selectors for the daily portfolio and the distributions: admin hide flags (stripHidden / visibleBlocks),
 * the source label, breakdown order and labels, history rows and bars. Built on the synthetic sample dataset.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import sample from "../../../src/lib/data/sample-site-data.json" with { type: "json" };
import type { FundData, SiteData } from "../../../src/lib/data/types.ts";
import {
  dailyBreakdowns, distributionBars, distributionClasses, hasDailyPortfolio, historyRows, partialCoverage, portfolioOrigin, stripHidden, visibleBlocks,
} from "../../../src/components/fund/lib/data.ts";
import { categoryLabel } from "../../../src/components/fund/labels.ts";

const site = sample as unknown as SiteData;
const fund = (k: keyof SiteData["funds"]): FundData => structuredClone(site.funds[k]!);

test("sample: daily portfolio for the bond funds, factsheet for the multi-strategy fund, distributions for the three funds", () => {
  assert.equal(site.mode, "sample");
  assert.deepEqual(portfolioOrigin(fund("monthly-income")), { kind: "daily", asOf: "2026-09-28" });
  assert.deepEqual(portfolioOrigin(fund("sustainable-enhanced-bonds")), { kind: "daily", asOf: "2026-09-28" });
  assert.deepEqual(portfolioOrigin(fund("multi-strategy")), { kind: "factsheet", month: "2026-08" });
  assert.deepEqual(portfolioOrigin(fund("global-minimum-volatility")), { kind: "factsheet", month: "2026-08" });
  assert.equal(portfolioOrigin(null), null);
  for (const k of ["monthly-income", "sustainable-enhanced-bonds", "multi-strategy"] as const) assert.ok((fund(k).distributions?.classes.length ?? 0) > 0, k);
  assert.equal(fund("global-minimum-volatility").distributions, null);
});

test("stripHidden: the portfolio flags apply to the daily block too; `distributions` hides the series data", () => {
  const f = fund("sustainable-enhanced-bonds");
  const chars = stripHidden(f, { hide: { characteristics: true } })!;
  assert.deepEqual(chars.portfolio!.characteristics, []);
  assert.equal(chars.portfolio!.totals!.holdings, null, "the securities count goes with the characteristics block");
  assert.equal(chars.portfolio!.totals!.cashWeight, f.portfolio!.totals!.cashWeight);
  assert.equal(stripHidden(f, {})!.portfolio!.totals!.holdings, f.portfolio!.totals!.holdings);
  assert.ok(chars.portfolio!.topHoldings.length > 0);
  const bks = stripHidden(f, { hide: { breakdowns: true } })!;
  assert.deepEqual(bks.portfolio!.breakdowns, {});
  assert.equal(bks.portfolio!.greenBondsWeight, null, "the green weight is a breakdown");
  assert.deepEqual(stripHidden(f, { hide: { holdings: true } })!.portfolio!.topHoldings, []);
  assert.equal(stripHidden(f, { hide: { characteristics: true, breakdowns: true, holdings: true } })!.portfolio, null, "nothing left");
  assert.equal(stripHidden(f, { hide: { distributions: true } })!.distributions, null);
  assert.ok(stripHidden(f, {})!.distributions);
  assert.deepEqual(f, fund("sustainable-enhanced-bonds"), "input untouched");
  // datasets published before the new blocks: no key added
  const { portfolio: _p, distributions: _d, ...old } = f;
  void _p; void _d;
  const out = stripHidden(old as FundData, { hide: { distributions: true } })!;
  assert.ok(!("portfolio" in out) && !("distributions" in out));
});

test("visibleBlocks: portfolio visible with a daily book only; distributions follow data and flag", () => {
  const f = fund("monthly-income");
  const bare = { ...f, characteristics: [], breakdowns: {}, topHoldings: [], esg: [] };
  assert.equal(visibleBlocks(bare, {}, 0).portfolio, true);
  assert.equal(visibleBlocks(bare, { hide: { characteristics: true, breakdowns: true, holdings: true } }, 0).portfolio, false);
  assert.equal(visibleBlocks(f, {}, 0).distributions, true);
  assert.equal(visibleBlocks(f, { hide: { distributions: true } }, 0).distributions, false);
  assert.equal(visibleBlocks({ ...f, distributions: null }, {}, 0).distributions, false);
  assert.equal(hasDailyPortfolio({ ...f.portfolio!, characteristics: [], breakdowns: {}, topHoldings: [], greenBondsWeight: null }), false);
});

test("daily breakdowns: display order, rating and term order kept, weights as the bar value; FR labels", () => {
  const p = fund("sustainable-enhanced-bonds").portfolio!;
  const b = dailyBreakdowns(p);
  assert.deepEqual(b.map((x) => x.key), ["assetType", "country", "sector", "rating", "term"]);
  assert.deepEqual(b.find((x) => x.key === "rating")!.rows.map((r) => r.label), ["AAA", "AA", "A", "BBB", "BB", "Cash"]);
  assert.deepEqual(b.find((x) => x.key === "term")!.rows.map((r) => r.label), ["0-1", "1-3", "3-5", "5-7", "7-10", "10+", "Cash"]);
  for (const x of b) assert.ok(Math.abs(x.rows.reduce((a, r) => a + (r.fund ?? 0), 0) - 1) < 0.001, x.key);
  assert.deepEqual(partialCoverage(p.characteristics).map((m) => m.id), ["duration", "ytm"]);
  assert.equal(categoryLabel("1-3", "en", "term"), "1–3 years");
  assert.equal(categoryLabel("0-1", "en", "term"), "0–1 year");
  assert.equal(categoryLabel("10+", "fr", "term"), "10 ans et plus");
  assert.equal(categoryLabel("3-5", "fr", "term"), "3–5 ans");
  assert.equal(categoryLabel("Cash", "fr"), "Liquidités");
  assert.equal(categoryLabel("United States", "fr"), "États-Unis");
  assert.equal(categoryLabel("Unknown label", "fr"), "Unknown label");
  assert.equal(categoryLabel("Financials", "en"), "Financials");
});

test("distributions: headline first, newest-first history (12 or all), last 24 bars oldest first", () => {
  const d = fund("monthly-income").distributions!;
  assert.deepEqual(distributionClasses(d, "LDM081").map((c) => c.fundserv), ["LDM081", "LDM001", "LDM011", "LDM021"]);
  assert.deepEqual(distributionClasses(d, null).map((c) => c.fundserv), ["LDM001", "LDM011", "LDM021", "LDM081"]);
  assert.deepEqual(distributionClasses(null, "x"), []);
  const a = d.classes.find((c) => c.fundserv === "LDM021")!;
  const recent = historyRows(a, false);
  assert.equal(recent.length, 12);
  assert.equal(recent[0].date, "2026-09-28");
  assert.equal(historyRows(a, true).length, a.history.length);
  const bars = distributionBars(a);
  assert.equal(bars.length, 24);
  assert.equal(bars[23].date, "2026-09-28");
  assert.ok(bars[0].date < bars[1].date);
});
