/**
 * Fund page selectors for the daily portfolio and the distributions: admin hide flags (stripHidden / visibleBlocks),
 * the source label, breakdown order and labels, history rows and bars. Built on the synthetic sample dataset.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import sample from "../../../src/lib/data/sample-site-data.json" with { type: "json" };
import type { FundData, SiteData } from "../../../src/lib/data/types.ts";
import { amountDecimals, distributionBars, distributionClasses, historyRows, isYearToDate } from "../../../src/components/fund/lib/distributions.ts";
import { dailyBreakdowns, fullRowItems, hasDailyPortfolio, partialCoverage, portfolioOrigin } from "../../../src/components/fund/lib/portfolio.ts";
import { stripHidden, visibleBlocks } from "../../../src/components/fund/lib/visibility.ts";
import { categoryLabel } from "../../../src/components/fund/labels.ts";
import { provenanceLine } from "../../../src/components/fund/lib/provenance.ts";

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
  assert.deepEqual(b.find((x) => x.key === "rating")!.rows.map((r) => r.label), ["AAA", "AA", "A", "Cash"]);
  assert.deepEqual(b.find((x) => x.key === "term")!.rows.map((r) => r.label), ["1-3", "3-5", "5-7", "7-10", "10+", "Unknown maturity", "Cash"]);
  // weights over net assets (PR #621 contract): positions plus cash are 100.4 % of net assets in the fixture (accruals)
  for (const x of b) assert.ok(Math.abs(x.rows.reduce((a, r) => a + (r.fund ?? 0), 0) - 1.004) < 0.001, x.key);
  assert.deepEqual(partialCoverage(p.characteristics).map((m) => m.id), []);
  assert.deepEqual(partialCoverage(fund("monthly-income").portfolio!.characteristics).map((m) => m.id), ["duration", "ytm"]);
  assert.equal(categoryLabel("1-3", "en", "term"), "1–3 years");
  assert.equal(categoryLabel("0-1", "en", "term"), "0–1 year");
  assert.equal(categoryLabel("10+", "fr", "term"), "10 ans et plus");
  assert.equal(categoryLabel("3-5", "fr", "term"), "3–5 ans");
  assert.equal(categoryLabel("Cash", "fr"), "Liquidités");
  assert.equal(categoryLabel("United States", "fr"), "États-Unis");
  assert.equal(categoryLabel("Unknown label", "fr"), "Unknown label");
  assert.equal(categoryLabel("Financials", "en"), "Financials");
  // labels of the website-computed book (Bloomberg industry sectors, fund-portfolio.ts buckets)
  assert.equal(categoryLabel("Financial", "fr"), "Services financiers");
  assert.equal(categoryLabel("Consumer, Non-cyclical", "fr"), "Consommation de base");
  assert.equal(categoryLabel("Unknown maturity", "fr", "term"), "Échéance inconnue");
  assert.equal(categoryLabel("Other assets", "fr"), "Autres actifs");
  assert.equal(categoryLabel("Bonds (unclassified)", "fr"), "Obligations (non classées)");
});

test("distributions: headline first, newest-first history (12 or all), last 24 bars oldest first", () => {
  const d = fund("monthly-income").distributions!;
  assert.deepEqual(distributionClasses(d, "LDM081").map((c) => c.fundserv), ["LDM081", "LDM001", "LDM011", "LDM021", "LDM031", "LDM061"]);
  assert.deepEqual(distributionClasses(d, null).map((c) => c.fundserv), ["LDM001", "LDM011", "LDM021", "LDM031", "LDM061", "LDM081"]);
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

test("provenance line: daily holdings with their date when the daily book is shown, else the factsheet month (EN / FR)", () => {
  const mi = fund("monthly-income");
  const seb = fund("sustainable-enhanced-bonds");
  const ms = fund("multi-strategy");
  const esgLine = (f: FundData, lang: "en" | "fr") => provenanceLine(f, lang);
  assert.equal(provenanceLine({ ...mi, esg: [] }, "en"), "Updated daily from Nymbus’ data platform; portfolio data from the daily holdings as of September 28, 2026.");
  assert.doesNotMatch(provenanceLine(mi, "en"), /portfolio data from the monthly factsheet/, "never the factsheet wording for the daily book");
  assert.equal(provenanceLine({ ...mi, esg: [] }, "fr"), "Mis à jour quotidiennement à partir de la plateforme de données de Nymbus; données de portefeuille selon les positions quotidiennes au 28 septembre 2026.");
  // sustainability metrics next to the daily book: they come from the factsheet and say so
  const withEsg = { ...seb, esg: [{ id: "x", label: { en: "x", fr: "x" }, fund: 1, unit: "num" as const }] };
  assert.match(esgLine(withEsg, "en"), /daily holdings as of September 28, 2026; sustainability metrics from the monthly factsheet of August 2026\.$/);
  assert.match(esgLine(withEsg, "fr"), /positions quotidiennes au 28 septembre 2026; indicateurs de durabilité selon la fiche mensuelle d’août 2026\.$/);
  assert.equal(provenanceLine(ms, "en"), "Updated daily from Nymbus’ data platform; portfolio data from the monthly factsheet of August 2026.");
  // a stale book dropped at render time falls back to the factsheet wording
  assert.match(provenanceLine({ ...mi, portfolio: null }, "en"), /monthly factsheet of August 2026\.$/);
  assert.equal(provenanceLine(null, "en"), "Updated daily from Nymbus’ data platform.");
  assert.match(provenanceLine(ms, "fr"), /selon la fiche mensuelle d’août 2026\.$/, "French elision");
  assert.match(provenanceLine({ ...ms, factsheetMonth: "2026-09" }, "fr"), /fiche mensuelle de septembre 2026\.$/);
});

test("distribution amounts: one precision per series (4 to 6 decimals) at which rows add up to the calendar totals", () => {
  const c = fund("monthly-income").distributions!.classes.find((x) => x.fundserv === "LDM001")!;
  const dp = amountDecimals(c);
  assert.equal(dp, 6, "the sample amounts have 6 decimals");
  // every calendar year: the sum of its rows as displayed equals its total as displayed
  for (const y of c.calendarYears) {
    const shown: number[] = c.history.filter((h) => h.date.startsWith(`${y.year}-`)).map((h) => Number(h.amount.toFixed(dp)));
    const total = shown.reduce((a: number, v: number) => a + v, 0);
    assert.equal(Number(total.toFixed(dp)), Number(y.amount.toFixed(dp)), `${y.year}`);
  }
  const round = { ...c, history: [{ date: "2026-07-31", amount: 0.04 }, { date: "2026-08-31", amount: 0.045 }], last: { date: "2026-08-31", amount: 0.045 }, trailing12m: 0.085, calendarYears: [{ year: 2026, amount: 0.085, count: 2 }] };
  assert.equal(amountDecimals(round), 4);
  assert.equal(amountDecimals({ ...round, trailing12m: 0.08512 }), 5);
  assert.equal(amountDecimals(null), 4);
});

test("year-to-date tag: the reference year only, and only while it is not over", () => {
  assert.equal(isYearToDate(2026, "2026-09-29"), true);
  assert.equal(isYearToDate(2025, "2026-09-29"), false);
  assert.equal(isYearToDate(2026, "2026-12-31"), false, "the year is complete");
  assert.equal(isYearToDate(2025, "2026-01-05"), false, "a December distribution read in January: the year is over");
  assert.equal(isYearToDate(2026, null), false);
  // the sample: the current year is tagged (read on 2026-09-29)
  assert.equal(fund("monthly-income").distributions!.checkedAt, "2026-09-29");
});

test("breakdown grid: an item left alone in a row spans it (odd count, or before a wide item)", () => {
  const F = false, W = true;
  assert.deepEqual(fullRowItems([F, F, F, F, F]), [F, F, F, F, W], "5 daily breakdowns: the fifth takes the whole row");
  assert.deepEqual(fullRowItems([F, F, F, F]), [F, F, F, F]);
  assert.deepEqual(fullRowItems([W, F, F, F, F]), [W, F, F, F, F], "a donut first, then two pairs");
  assert.deepEqual(fullRowItems([F, W, F, F]), [W, W, F, F], "alone before a wide item");
  assert.deepEqual(fullRowItems([F]), [W]);
  assert.deepEqual(fullRowItems([]), []);
  // the sample: the SEB daily book has five breakdowns
  assert.equal(dailyBreakdowns(fund("sustainable-enhanced-bonds").portfolio).length, 5);
});
