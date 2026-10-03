import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addMonths, annualize, calendarYears, compound, downsideDeviation, ftseLevels, growth, lastClosedMonth, lastWeekdays, levelsToMonthly, maxDrawdown, monthEnd, monthEndReturns,
  riskStats, trailing, window, type Series,
} from "../../../src/lib/pipeline/metrics.ts";

const close = (a: number | null | undefined, b: number, eps = 1e-12): void => {
  assert.ok(a !== null && a !== undefined, `expected ${b}, got ${a}`);
  assert.ok(Math.abs(a - b) < eps, `expected ${b}, got ${a}`);
};

/** constant monthly return r from `first` for n months */
function flat(first: string, n: number, r: number): Series {
  const s: Series = {};
  for (let i = 0; i < n; i++) s[addMonths(first, i)] = r;
  return s;
}

test("month helpers", () => {
  assert.equal(monthEnd(2024, 2), "2024-02-29");
  assert.equal(monthEnd(2026, 2), "2026-02-28");
  assert.equal(addMonths("2026-01-31", 1), "2026-02-28");
  assert.equal(addMonths("2026-01-31", -1), "2025-12-31");
  assert.equal(addMonths("2019-01", 12), "2020-01-31");
  assert.equal(lastClosedMonth(new Date("2026-09-29T12:00:00Z")), "2026-08-31");
  assert.equal(lastClosedMonth(new Date("2026-01-03T12:00:00Z")), "2025-12-31");
});

test("compound and annualize (hand-checked)", () => {
  close(compound([0.1, -0.1]), -0.01);
  close(compound([]), 0);
  // 24 months of 1 %: annualized = 1.01^12 - 1
  close(annualize(new Array(24).fill(0.01)), Math.pow(1.01, 12) - 1);
  close(annualize(new Array(24).fill(0.01)), 0.12682503013196977, 1e-14);
  // 6 months of +2 %: (1.02^6)^(2) - 1 = 1.02^12 - 1
  close(annualize(new Array(6).fill(0.02)), Math.pow(1.02, 12) - 1);
  // arithmetic: sum / years
  close(annualize([0.01, 0.02, -0.01, 0.04, 0, 0], "arithmetic"), 0.06 / 0.5);
});

test("window requires contiguity and the end month", () => {
  const s: Series = { "2026-01-31": 0.01, "2026-02-28": 0.02, "2026-04-30": 0.03 };
  assert.equal(window(s, "2026-03-31", 1), null, "end month missing");
  assert.equal(window(s, "2026-04-30", 3), null, "gap in March");
  assert.deepEqual(window(s, "2026-02-28", 2), [0.01, 0.02]);
  assert.equal(window(s, "2026-04-30"), null, "SI window with a gap");
  assert.equal(window(s, "2026-02-28", 3), null, "not enough months");
});

test("trailing: 1M/3M/YTD/1Y compounded, 2Y+ annualized, longer than track record -> null", () => {
  // 16 months: 2024-11 .. 2026-02, 1 % each, except Jan 2026 = 2 %, Feb 2026 = -1 %
  const s = flat("2024-11-30", 16, 0.01);
  s["2026-01-31"] = 0.02;
  s["2026-02-28"] = -0.01;
  const t = trailing(s, "2026-02-28");
  close(t["1M"], -0.01);
  close(t["3M"], 1.01 * 1.02 * 0.99 - 1);
  close(t.YTD, 1.02 * 0.99 - 1);
  close(t["1Y"], Math.pow(1.01, 10) * 1.02 * 0.99 - 1);
  assert.equal(t["2Y"], null);
  assert.equal(t["3Y"], null);
  assert.equal(t["5Y"], null);
  assert.equal(t["10Y"], null);
  // SI: 16 months >= 12 -> annualized
  close(t.SI, Math.pow(Math.pow(1.01, 14) * 1.02 * 0.99, 12 / 16) - 1);
  // 2Y annualized when available
  const s2 = flat("2024-03-31", 24, 0.01);
  close(trailing(s2, "2026-02-28")["2Y"], Math.pow(1.01, 12) - 1);
});

test("trailing: SI < 12 months is compounded, not annualized", () => {
  const s = flat("2026-03-31", 6, 0.01);
  const t = trailing(s, "2026-08-31");
  close(t.SI, Math.pow(1.01, 6) - 1);
  assert.equal(t["1Y"], null);
  // YTD for a fund launched this year starts at inception
  close(t.YTD, Math.pow(1.01, 6) - 1);
});

test("trailing: YTD is null when January is missing for an older fund", () => {
  const s = flat("2024-01-31", 30, 0.01);
  delete s["2026-01-31"];
  const t = trailing(s, "2026-06-30");
  assert.equal(t.YTD, null);
  assert.equal(t["1Y"], null, "gap inside the 1Y window");
  close(t["3M"], Math.pow(1.01, 3) - 1);
  assert.equal(t.SI, null, "gap inside the SI window");
});

test("trailing: siStart aligns an index on the fund inception", () => {
  const idx = flat("2018-01-31", 40, 0.005);
  const t = trailing(idx, "2021-04-30", { siStart: "2019-01-31" });
  close(t.SI, Math.pow(Math.pow(1.005, 28), 12 / 28) - 1);
  const short = flat("2019-06-30", 10, 0.005);
  assert.equal(trailing(short, "2020-03-31", { siStart: "2019-01-31" }).SI, null, "index history does not cover the fund inception");
});

test("calendar years: partial first and current years, gaps -> null", () => {
  const s = flat("2019-03-31", 12, 0.01); // 2019-03 .. 2020-02
  const cy = calendarYears(s, "2020-02-29");
  assert.equal(cy.length, 2);
  assert.equal(cy[0].year, 2019);
  assert.equal(cy[0].partial, true);
  close(cy[0].value, Math.pow(1.01, 10) - 1);
  assert.equal(cy[1].partial, true);
  close(cy[1].value, Math.pow(1.01, 2) - 1);
  const full = calendarYears(flat("2019-01-31", 24, 0.01), "2020-12-31");
  assert.equal(full[0].partial, false);
  assert.equal(full[1].partial, false);
  const gap = flat("2019-01-31", 24, 0.01);
  delete gap["2019-06-30"];
  assert.equal(calendarYears(gap, "2020-12-31")[0].value, null);
});

test("growth of 10 000 starts the month before the first return", () => {
  const g = growth({ "2026-01-31": 0.1, "2026-02-28": -0.1 }, "2026-02-28");
  assert.deepEqual(g.map((x) => x.date), ["2025-12-31", "2026-01-31", "2026-02-28"]);
  close(g[0].value, 10_000);
  close(g[1].value, 11_000, 1e-9);
  close(g[2].value, 9_900, 1e-9);
  const a = growth({ "2026-01-31": 0.1, "2026-02-28": -0.1 }, "2026-02-28", { method: "arithmetic" });
  close(a[2].value, 10_000, 1e-9);
});

test("max drawdown from the running peak, including a first-month loss", () => {
  close(maxDrawdown([0.1, -0.2, 0.05, 0.1]), 0.88 / 1.1 - 1);
  close(maxDrawdown([0.1, -0.2, 0.05, 0.1]), -0.2, 1e-12);
  close(maxDrawdown([-0.1, 0.05]), -0.1);
  close(maxDrawdown([0.01, 0.02]), 0);
  close(maxDrawdown([0.05, -0.1, 0.02], "arithmetic"), -0.1);
});

test("downside deviation: population st.dev. of negative months ×√12", () => {
  close(downsideDeviation([-0.01, -0.03, 0.02]), 0.01 * Math.sqrt(12));
  assert.equal(downsideDeviation([-0.01, 0.02]), null, "needs at least 2 negative months");
});

test("risk statistics (SI and 3Y), Sharpe without risk-free rate", () => {
  const rs = [0.02, -0.01, 0.03, -0.02, 0.01, 0.0, 0.02, -0.01, 0.01, 0.02, -0.03, 0.01];
  const s: Series = {};
  rs.forEach((r, i) => { s[addMonths("2025-09-30", i)] = r; });
  const st = riskStats(s, "2026-08-31", "SI")!;
  assert.equal(st.months, 12);
  const ann = compound(rs);
  close(st.annReturn, ann);
  const mean = rs.reduce((a, b) => a + b, 0) / 12;
  const vol = Math.sqrt(rs.reduce((a, b) => a + (b - mean) ** 2, 0) / 12) * Math.sqrt(12);
  close(st.annVol, vol);
  close(st.sharpe, ann / vol);
  close(st.sortino, ann / downsideDeviation(rs)!);
  close(st.positiveMonths, 7 / 12);
  close(st.bestMonth, 0.03);
  close(st.worstMonth, -0.03);
  assert.equal(riskStats(s, "2026-08-31", "3Y"), null, "3Y needs 36 months");
  assert.equal(riskStats(flat("2026-01-31", 8, 0.01), "2026-08-31", "SI"), null, "SI needs 12 months");
});

test("FTSE: only fully aggregate rows count (no sub-index fallback)", () => {
  const rows = [
    { date: "2026-01-30", total_return: 100, rating: null, term: null, industry_sector: null, industry_group: null },
    { date: "2026-01-30", total_return: 150, rating: "All", term: "Short", industry_sector: null, industry_group: null },
    { date: "2026-01-30", total_return: 999, rating: "AAA", term: null, industry_sector: null, industry_group: null },
    // only a sub-index row (rating All but term Short) on this day: the day is dropped
    { date: "2026-02-27", total_return: 180, rating: "All", term: "Short", industry_sector: null, industry_group: null },
    { date: "2026-02-27", total_return: 999, rating: "BBB", term: null, industry_sector: null, industry_group: null },
    { date: "2026-03-31", total_return: 110, rating: "Overall", term: "Total", industry_sector: "", industry_group: "All" },
  ];
  assert.deepEqual(ftseLevels(rows), { "2026-01-30": 100, "2026-03-31": 110 });
});

test("FTSE month-end: closing level on the last TSX valuation day (skipped days must be holidays), month closed, no open-month return", () => {
  assert.deepEqual(lastWeekdays("2026-01"), { last: "2026-01-30", earliest: "2026-01-28" });
  assert.deepEqual(lastWeekdays("2026-05"), { last: "2026-05-29", earliest: "2026-05-27" });
  const m = monthEndReturns({
    "2025-12-31": 100,
    "2026-01-15": 101, "2026-01-30": 102, // Jan 31 is a Saturday: the 30th closes January
    "2026-02-27": 103.02, // the last valuation day of February
    "2026-03-10": 104, // March ends 21 days early: dropped, and so is April (no base)
    "2026-04-30": 105,
    "2026-05-29": 106.05,
    "2026-06-10": 107, // June is the open month: no June return
  });
  assert.equal(m.series["2026-01-31"], 102 / 100 - 1);
  assert.equal(m.series["2026-02-28"], 103.02 / 102 - 1);
  assert.match(m.dropped[0].reason, /no level for the TSX valuation day\(s\) .*2026-03-31 … before the month-end/);
  assert.equal(m.series["2026-03-31"], undefined);
  assert.equal(m.series["2026-04-30"], undefined);
  assert.equal(m.series["2026-05-31"], 106.05 / 105 - 1);
  assert.equal(m.series["2026-06-30"], undefined, "open month");
  assert.deepEqual(m.dropped.map((d) => d.month), ["2026-03-31"]);
  close(m.series["2026-01-31"], 0.02);
  close(m.series["2026-02-28"], 0.01);
  close(m.series["2026-05-31"], 0.01);
  assert.deepEqual(levelsToMonthly({ "2025-12-31": 100, "2026-02-27": 103, "2026-03-31": 104 }), {}, "a month without levels breaks the chain");
});

test("m8: a month-end skipped on a TSX holiday is accepted, a skipped business day is not", () => {
  // Good Friday 2024-03-29: the 28th closes March 2024
  const a = monthEndReturns({ "2024-02-29": 100, "2024-03-28": 101, "2024-04-30": 102, "2024-05-01": 103 });
  close(a.series["2024-03-31"], 0.01);
  close(a.series["2024-04-30"], 102 / 101 - 1);
  assert.deepEqual(a.dropped, []);
  // a level missing on Thursday 2026-04-30 (a business day): April is dropped, and May has no base
  const b = monthEndReturns({ "2026-03-31": 100, "2026-04-29": 101, "2026-05-29": 102, "2026-06-01": 103 });
  assert.equal(b.series["2026-04-30"], undefined);
  assert.equal(b.series["2026-05-31"], undefined);
  assert.deepEqual(b.dropped.map((d) => d.month), ["2026-04-30"]);
  assert.match(b.dropped[0].reason, /no level for the TSX valuation day\(s\) 2026-04-30/);
  // Boxing Day 2026 observed on Monday 28 and Christmas on Friday 25: a level on 2026-12-31 closes December
  const c = monthEndReturns({ "2026-11-30": 100, "2026-12-31": 101, "2027-01-04": 101 });
  close(c.series["2026-12-31"], 0.01);
});
