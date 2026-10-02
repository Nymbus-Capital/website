import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BOND_CHARACTERISTICS, ESG_METRICS, MULTISTRAT_CHARACTERISTICS, parseAllocationSeries, parseBuckets, parseCalendarTable, parseCharacteristicTable, parseFlatCharacteristics,
  parseHoldings, parseMonthlyTable, parseNumber, parsePct, parsePeriodMap, parseStatistics, parseText, parseTrailingTable,
} from "../../../src/lib/pipeline/parse.ts";
import { parseLooseJson } from "../../../src/lib/pipeline/sources/factsheets.ts";
import { fundMonthlyTableKey, indexMonthlyTableKey } from "../../../src/lib/pipeline/parse.ts";

test("monthly table keys: fund vs index", () => {
  const b = { "Monthly Returns: Nymbus QCFI-SEB Net": {}, "Monthly Returns: Nymbus QCFI-SEB Gross": {}, "Monthly Returns: FTSE Canada Universe Bond Index": {}, "Monthly Value Added vs FTSE Canada Universe Bond Index Net": {} };
  assert.equal(fundMonthlyTableKey(b, "Net"), "Monthly Returns: Nymbus QCFI-SEB Net");
  assert.equal(indexMonthlyTableKey(b), "Monthly Returns: FTSE Canada Universe Bond Index");
  assert.equal(indexMonthlyTableKey(b, "FTSE Canada Universe Bond Index"), "Monthly Returns: FTSE Canada Universe Bond Index");
  assert.equal(fundMonthlyTableKey({ "Monthly Returns Net": {} }, "Net"), "Monthly Returns Net");
  assert.equal(indexMonthlyTableKey({ "Monthly Returns Net": {} }), null);
});

test("parseNumber / parsePct: every string format seen in the archives", () => {
  assert.equal(parsePct("4.82%"), 0.0482);
  assert.equal(parsePct("+2.1%"), 0.021);
  assert.equal(parsePct("−0.6%"), -0.006, "unicode minus");
  assert.equal(parsePct("–0.6%"), -0.006, "en dash");
  assert.equal(parsePct("-0.6%"), -0.006);
  assert.equal(parsePct(" 7.2 "), 0.072, "percent units without %");
  assert.equal(parsePct("0.0%"), 0);
  assert.ok(Object.is(parsePct("-0.0%"), 0), "-0.0% is plain 0");
  assert.equal(parsePct("100%"), 1);
  assert.equal(parsePct(3.5), 0.035, "raw number in percent units");
  assert.equal(parseNumber("7.2"), 7.2);
  assert.equal(parseNumber("1,784"), 1784, "thousands separator");
  assert.equal(parseNumber("4,8"), 4.8, "decimal comma");
  assert.equal(parseNumber("1e-3"), 0.001);
  for (const bad of ["nan", "NaN", "", "  ", "n/a", "-", "None", "null", "abc", "4.8%%", "4.8.1", "12 bps", "AA"]) {
    assert.equal(parsePct(bad), null, `"${bad}" must be null`);
  }
  for (const bad of [null, undefined, Number.NaN, Number.POSITIVE_INFINITY, {}, [], true]) assert.equal(parsePct(bad as unknown), null);
});

test("parseText", () => {
  assert.equal(parseText(" A+ "), "A+");
  assert.equal(parseText("nan"), null);
  assert.equal(parseText(""), null);
  assert.equal(parseText(3), null);
});

test("characteristics table (Fund / Index / +/-)", () => {
  const t = {
    "Portfolio Yield": { Fund: "4.82%", Index: "3.8%", "+/-": "+1.0%" },
    Duration: { Fund: "7.2", Index: "6.8", "+/-": "+0.4" },
    "Credit Quality": { Fund: "A", Index: "AA", "+/-": "nan" },
    "Number of Securities": { Fund: "35", Index: "1979", "+/-": "" },
    // present in the source archives but never published on the website (no leverage metric, no liquidity score)
    "Net Credit Leverage": { Fund: "12.5%", Index: "", "+/-": "" },
    "Liquidity Score": { Fund: "71.3%", Index: "74.2%", "+/-": "-2.9%" },
    "% of Portfolio Rated Investment Grade": { Fund: "93%", Index: "nan", "+/-": "nan" },
  };
  const cs = parseCharacteristicTable(t, BOND_CHARACTERISTICS);
  const by = Object.fromEntries(cs.map((c) => [c.id, c]));
  assert.deepEqual(by.portfolioYield, { id: "portfolioYield", label: by.portfolioYield.label, fund: 0.0482, index: 0.038, unit: "pct" });
  assert.equal(by.duration.fund, 7.2);
  assert.equal(by.duration.unit, "num");
  assert.equal(by.creditQuality.fund, "A");
  assert.equal(by.creditQuality.index, "AA");
  assert.equal(by.numberOfSecurities.fund, 35);
  assert.equal(by.numberOfSecurities.index, 1979);
  assert.equal(by.netCreditLeverage, undefined, "leverage metric never parsed");
  assert.equal(by.liquidityScore, undefined, "liquidity score never parsed");
  assert.ok(!cs.some((c) => /leverag|effet de levier|liquidity score|cote de liquidit/i.test(`${c.id} ${c.label.en} ${c.label.fr}`)));
  assert.equal(by.investmentGrade.fund, 0.93);
  assert.equal("index" in by.investmentGrade, false, "nan index omitted");
  // order follows the spec, labels are bilingual
  assert.deepEqual(cs.map((c) => c.id), ["portfolioYield", "duration", "creditQuality", "investmentGrade", "numberOfSecurities"]);
  assert.ok(by.duration.label.fr.length > 0);
  const esg = parseCharacteristicTable({ "Carbon Intensity": { Fund: "63.4", Index: "118.7", "+/-": "−55.3" } }, ESG_METRICS);
  assert.deepEqual(esg.map((c) => [c.id, c.fund, c.index]), [["carbonIntensity", 63.4, 118.7]]);
  assert.deepEqual(parseCharacteristicTable(null, BOND_CHARACTERISTICS), []);
  const flat = parseFlatCharacteristics({ "Dividend Yield": "2.14%", "Price/Earnings Ratio": "nan", "Number of Holdings": "71", "Largest Equity Sector Exposure": "18%" }, MULTISTRAT_CHARACTERISTICS);
  assert.deepEqual(flat.map((c) => [c.id, c.fund]), [["dividendYield", 0.0214], ["numberOfHoldings", 71], ["largestEquitySector", 0.18]]);
});

test("buckets: Nymbus/Index columns, index-only rows, flat tables, nan", () => {
  const b = parseBuckets({ Nymbus: { AAA: "8.1%", AA: "14.6%", NR: "nan" }, Index: { AAA: "3.2%", AA: "16.8%", BBB: "38.1%" }, "Nymbus vs Index": { AAA: "+4.9%" } });
  assert.deepEqual(b, [
    { label: "AAA", fund: 0.081, index: 0.032 },
    { label: "AA", fund: 0.146, index: 0.168 },
    { label: "BBB", fund: null, index: 0.381 },
  ]);
  assert.deepEqual(parseBuckets({ Financials: "15.6%", Other: "nan" }), [{ label: "Financials", fund: 0.156 }]);
  assert.deepEqual(parseBuckets("x"), []);
});

test("holdings: ranks sorted numerically, string or numeric weights, futures", () => {
  const h = parseHoldings({ Nymbus: { "10": { Name: "J", "Market Value %": "1.0%" }, "2": { Name: "B", "Market Value %": 4.2 }, "1": { Name: "A", "Market Value %": "5.1%" }, "3": { Name: "nan", "Market Value %": "1%" } } });
  assert.deepEqual(h, [{ name: "A", weight: 0.051 }, { name: "B", weight: 0.042 }, { name: "J", weight: 0.01 }]);
  assert.deepEqual(parseHoldings({ "1": { Name: "Fut", "Instrument Exposure %": "12.5%" } }), [{ name: "Fut", weight: 0.125 }]);
  assert.deepEqual(parseHoldings({}), []);
});

test("systematic allocation averaged over the dates", () => {
  const a = parseAllocationSeries({ "2026-06-01": { EQUITIES: "40.00%", BONDS: "60.00%" }, "2026-07-06": { EQUITIES: "50.00%", BONDS: "50.00%" } })!;
  assert.equal(a.from, "2026-06-01");
  assert.equal(a.to, "2026-07-06");
  assert.deepEqual(a.buckets, [{ label: "Equities", fund: 0.45 }, { label: "Bonds", fund: 0.55 }]);
  assert.equal(parseAllocationSeries({}), null);
});

test("trailing tables: nested (bonds) and flat (strategies), YTD label = year", () => {
  const nested = parseTrailingTable({
    "Nymbus Fund": { "1M": "0.4%", "2026": "3.1%", "1Y": "5.0%", SI: "4.2%" },
    "FTSE Index": { "1M": "0.3%", "2026": "2.0%", "1Y": "nan", SI: "3.0%" },
    "Value Added": { "1M": "+0.1%", "2026": "+1.1%", SI: "+1.2%" },
  }, "2026")!;
  assert.equal(nested.fundName, "Nymbus Fund");
  assert.equal(nested.indexName, "FTSE Index");
  assert.deepEqual(nested.fund, { "1M": 0.004, YTD: 0.031, "1Y": 0.05, SI: 0.042 });
  assert.deepEqual(nested.index, { "1M": 0.003, YTD: 0.02, "1Y": null, SI: 0.03 });
  assert.deepEqual(nested.va, { "1M": 0.001, YTD: 0.011, SI: 0.012 });
  assert.deepEqual(nested.decimals.fund, { "1M": 1, YTD: 1, "1Y": 1, SI: 1 });
  assert.deepEqual(nested.decimals.index, { "1M": 1, YTD: 1, SI: 1 }, "nan has no decimals");
  const flat = parseTrailingTable({ "1M": "1.1", "3M": "−0.8", "2026": "4.8", SI: "7.4", "2025": "9.9" }, "2026")!;
  assert.deepEqual(flat.fund, { "1M": 0.011, "3M": -0.008, YTD: 0.048, SI: 0.074 }, "other year labels ignored");
  assert.equal(parseTrailingTable({}, "2026"), null);
  assert.deepEqual(parsePeriodMap(null, "2026"), {});
});

test("monthly returns table -> sorted month-end points", () => {
  const { points, decimals } = parseMonthlyTable({
    "2026": { "01-Jan": "0.9%", "02-Feb": "−1.8%", "03-Mar": "nan", YTD: "-0.9%" },
    "2025": { "11-Nov": "0.25%", "12-Dec": 0.5 },
    YTD: { x: "1" },
  });
  assert.deepEqual(points, [
    { month: "2025-11-30", r: 0.0025 },
    { month: "2025-12-31", r: 0.005 },
    { month: "2026-01-31", r: 0.009 },
    { month: "2026-02-28", r: -0.018 },
  ]);
  assert.equal(decimals["2025-11-30"], 2);
  assert.equal(decimals["2026-01-31"], 1);
});

test("calendar tables (nested / flat) and statistics", () => {
  const c = parseCalendarTable({ Fund: { "2025": "5.1%", "2026": "1.0%" }, Index: { "2025": "3.0%" }, "Value Added": { "2025": "+2.1%" } });
  assert.deepEqual(c["2025"], { fund: 0.051, index: 0.03, va: 0.021 });
  assert.deepEqual(c["2026"], { fund: 0.01, index: null, va: null });
  assert.deepEqual(parseCalendarTable({ "2024": "9.9", "2025": "nan" }), { "2024": { fund: 0.099 }, "2025": { fund: null } });
  const st = parseStatistics({ "Annualized Returns": "7.4%", "Annualized St. Dev.": "5.5%", "Sharpe Ratio": "1.3", "Sortino Ratio": "nan", "% Positive Months": "66%", "Max Drawdown": "-9%" })!;
  assert.deepEqual(st, { annReturn: 0.074, annVol: 0.055, downsideDev: null, sharpe: 1.3, sortino: null, positiveMonths: 0.66, maxDrawdown: -0.09, decimals: { annReturn: 1, annVol: 1, sharpe: 1, positiveMonths: 0, maxDrawdown: 0 } });
});

test("Python json.dump NaN / Infinity tokens are read as null (not inside strings)", () => {
  const j = parseLooseJson('{"a": NaN, "b": "NaN text", "c": [Infinity, -Infinity, 1], "d": "say \\"NaN\\""}') as Record<string, unknown>;
  assert.deepEqual(j, { a: null, b: "NaN text", c: [null, null, 1], d: 'say "NaN"' });
});
