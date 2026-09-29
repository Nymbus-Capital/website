import { test } from "node:test";
import assert from "node:assert/strict";
import { fmt, pct, money, compactMoney, monthLabel, dateLabel, charValue, charCount, pctTick, fileSize, bigMoney } from "../../../src/components/fund/lib/format.ts";
import { nice, linear, barPath, monotonePath, bands, nearestIndex, yearTicks, monthTicks } from "../../../src/components/fund/lib/scale.ts";
import {
  trailingPeriods, isAnnualized, headlineClass, availableRanges, growthRange, heatmapGrid, heatScale, heatCell, groupDocuments,
  visibleBlocks, riskIndex, calendarRows, riskWindows, bucketRows,
} from "../../../src/components/fund/lib/data.ts";
import type { DocumentMeta, FundData, GrowthPoint, NavClass } from "../../../src/lib/data/types.ts";

const NB = " ";

test("fmt: unicode minus, FR spacing and decimal comma", () => {
  assert.equal(fmt(-0.0523, { pct: true, lang: "en" }), "−5.2%");
  assert.equal(fmt(0.0523, { pct: true, lang: "fr" }), `5,2${NB}%`);
  assert.equal(fmt(0.0523, { pct: true, sign: true, lang: "en" }), "+5.2%");
  assert.equal(fmt(-0.00001, { pct: true, lang: "en" }), "0.0%", "rounded zero is unsigned");
  assert.equal(pct(0.1234, "en", 2), "12.34%");
  assert.equal(fmt(1234.5, { decimals: 1, lang: "en" }), "1,234.5");
});

test("money and compact money", () => {
  assert.equal(money(10.5234, "CAD", "en"), "$10.52");
  assert.equal(money(10.5234, "USD", "en"), "US$10.52");
  assert.equal(money(10.5234, "CAD", "fr"), `10,52${NB}$`);
  assert.equal(money(10.5234, "USD", "fr"), `10,52${NB}$${NB}US`);
  assert.equal(money(-0.0412, "CAD", "en", 4), "−$0.0412");
  assert.equal(compactMoney(12500, "en"), "$12.5k");
  assert.equal(compactMoney(12000, "fr"), `12${NB}k$`);
  assert.equal(bigMoney(245_300_000, "en"), "$245.3M");
  assert.equal(bigMoney(245_300_000, "fr"), `245,3${NB}M$`);
});

test("dates and months", () => {
  assert.equal(monthLabel("2026-08-31", "en"), "august 2026");
  assert.equal(monthLabel("2026-08", "fr"), "août 2026");
  assert.equal(dateLabel("2026-09-26", "en"), "sep 26, 2026");
  assert.equal(dateLabel("2026-09-01", "fr"), "1er sept. 2026");
  assert.equal(monthLabel(null, "en"), "");
});

test("characteristics", () => {
  assert.equal(charValue(0.0512, "pct", "en"), "5.12%");
  assert.equal(charValue(2.345, "num", "fr"), "2,3");
  assert.equal(charValue(312, "int", "en"), "312");
  assert.equal(charValue("A", "text", "en"), "A");
  assert.equal(charValue(null, "pct", "en"), null);
  assert.deepEqual(charCount(0.05, "pct"), { value: 0.05, decimals: 2, pct: true });
  assert.equal(charCount("AA", "text"), null);
});

test("ticks and file size", () => {
  assert.equal(pctTick(0.02, "en", 0.01), "2%");
  assert.equal(pctTick(0.025, "en", 0.005), "2.5%");
  assert.equal(fileSize(2_500_000, "en"), `2.4${NB}MB`);
  assert.equal(fileSize(200_000, "fr"), `195${NB}Ko`);
});

test("nice scale covers the data with round steps", () => {
  const s = nice(-0.013, 0.087, 5);
  assert.ok(s.lo <= -0.013 && s.hi >= 0.087);
  assert.equal(s.step, 0.02);
  assert.deepEqual(s.ticks, [-0.02, 0, 0.02, 0.04, 0.06, 0.08, 0.1]);
  const flat = nice(5, 5);
  assert.ok(flat.lo < 5 && flat.hi > 5);
  assert.equal(linear(0, 10, 100, 0)(5), 50);
});

test("bar path: rounded far end, empty for zero height", () => {
  assert.equal(barPath(0, 100, 10, 100, 3), "");
  const up = barPath(0, 100, 10, 40, 3);
  assert.match(up, /^M0,100V43Q0,40 3,40H7Q10,40 10,43V100Z$/);
  const down = barPath(0, 100, 10, 160, 3);
  assert.match(down, /V157Q0,160/);
});

test("monotone path passes through every point", () => {
  const d = monotonePath([[0, 10], [10, 5], [20, 5], [30, 0]]);
  assert.ok(d.startsWith("M0,10"));
  for (const p of ["10,5", "20,5", "30,0"]) assert.ok(d.includes(p));
  assert.equal(monotonePath([[0, 0], [5, 5]]), "M0,0L5,5");
});

test("bands, nearest index, ticks", () => {
  const b = bands(4, 0, 400, 2, 0.2);
  assert.equal(b.band, 100);
  assert.equal(b.bw, 40);
  assert.equal(b.barX(1, 1), 150);
  assert.equal(nearestIndex([0, 10, 20, 30], 14), 1);
  assert.equal(nearestIndex([0, 10, 20, 30], 16), 2);
  const dates = Array.from({ length: 90 }, (_, i) => `${2019 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}-28`);
  const yt = yearTicks(dates, 4);
  assert.ok(yt.length <= 4 && yt.every((t) => dates[t.i].startsWith(t.label)));
  assert.deepEqual(monthTicks(dates.slice(0, 13), 5).at(-1), 12);
});

test("trailing periods and annualisation", () => {
  assert.deepEqual(trailingPeriods({ SI: 0.05, "1Y": 0.04, "10Y": null, "1M": 0.001 }), ["1M", "1Y", "SI"]);
  assert.equal(isAnnualized("1Y"), false);
  assert.equal(isAnnualized("3Y"), true);
  assert.equal(isAnnualized("SI", "2026-01-31", "2026-08-31"), false);
  assert.equal(isAnnualized("SI", "2019-01-31", "2026-08-31"), true);
});

const cls = (fundserv: string, nav: number | null): NavClass => ({ fundserv, display: fundserv, currency: "CAD", nav, date: "2026-09-26", prevNav: null, change: null, changePct: null });
test("headline class: admin choice, then default, then first with a NAV", () => {
  const cs = [cls("LDM000", null), cls("LDM001", 10), cls("LDM002", 11)];
  assert.equal(headlineClass(cs, ["LDM002", "LDM001"])?.fundserv, "LDM002");
  assert.equal(headlineClass(cs, [undefined, "ldm001"])?.fundserv, "LDM001");
  assert.equal(headlineClass(cs, ["X"])?.fundserv, "LDM001");
  assert.equal(headlineClass([], ["X"]), null);
});

test("growth ranges rebase to 10 000 and never invent points", () => {
  const pts: GrowthPoint[] = Array.from({ length: 50 }, (_, i) => ({ date: `d${i}`, fund: 10000 * (1 + 0.01 * i), index: i < 3 ? null : 10000 * (1 + 0.005 * i) }));
  assert.deepEqual(availableRanges(pts), ["1Y", "3Y", "SI"]);
  const si = growthRange(pts, "SI");
  assert.equal(si.fund.length, 50);
  assert.equal(si.fund[49], pts[49].fund);
  const y1 = growthRange(pts, "1Y");
  assert.equal(y1.dates.length, 13);
  assert.equal(y1.fund[0], 10000);
  assert.ok(Math.abs(y1.fund[12] - (pts[49].fund / pts[37].fund) * 10000) < 1e-9);
  assert.equal(y1.index[0], 10000);
  assert.equal(y1.hasIndex, true);
});

test("heatmap grid and colours", () => {
  const monthly = [{ month: "2025-11-30", r: 0.01 }, { month: "2025-12-31", r: -0.02 }, { month: "2026-01-31", r: 0.003 }];
  const g = heatmapGrid(monthly, [{ year: 2025, fund: 0.05 }, { year: 2026, fund: 0.003, partial: true }]);
  assert.deepEqual(g.map((r) => r.year), [2026, 2025]);
  assert.equal(g[1].cells[10], 0.01);
  assert.equal(g[1].cells[0], null);
  assert.equal(g[1].total, 0.05);
  assert.equal(g[1].partial, false);
  assert.equal(g[0].partial, true);
  const s = heatScale([0.01, -0.02, 0.003, 0.5], 0.5);
  assert.ok(s > 0 && s < 0.5);
  assert.deepEqual(heatCell(null, 0.02), { tone: "none", alpha: 0, strong: false });
  assert.equal(heatCell(0.02, 0.02).alpha, 1);
  assert.equal(heatCell(-0.03, 0.02).tone, "neg");
  assert.ok(heatCell(0.001, 0.02).alpha >= 0.1);
});

test("calendar rows and buckets drop empty values", () => {
  assert.deepEqual(calendarRows([{ year: 2021, fund: null, index: null }, { year: 2020, fund: 0.01 }]).map((r) => r.year), [2020]);
  assert.deepEqual(bucketRows([{ label: "a", fund: 0.1 }, { label: "b", fund: 0.3 }, { label: "c", fund: null }]).map((b) => b.label), ["b", "a"]);
  assert.equal(riskIndex("medium"), 2);
  assert.equal(riskIndex(undefined), 0);
});

test("risk windows accept one object or several", () => {
  const w = (window: "SI" | "3Y", v: number | null) => ({ window, annReturn: v, annVol: null, downsideDev: null, sharpe: null, sortino: null, maxDrawdown: null, positiveMonths: null, bestMonth: null, worstMonth: null });
  assert.deepEqual(riskWindows(w("SI", 0.05)).map((r) => r.window), ["SI"]);
  assert.deepEqual(riskWindows([w("3Y", 0.05), w("SI", 0.04)]).map((r) => r.window), ["SI", "3Y"]);
  assert.deepEqual(riskWindows({ SI: w("SI", null) }), []);
  assert.deepEqual(riskWindows(null), []);
});

test("documents grouped by type, newest first, unpublished dropped", () => {
  const d = (id: string, type: DocumentMeta["type"], date: string, published = true): DocumentMeta => ({
    id, scope: "firm", type, lang: "both", title: { en: id, fr: id }, date, fileName: `${id}.pdf`, size: 1, sha256: "", published, uploadedBy: "", uploadedAt: "",
  });
  const g = groupDocuments([d("a", "commentary", "2026-01-01"), d("b", "factsheet", "2026-02-01"), d("c", "factsheet", "2026-03-01"), d("x", "esg", "2026-01-01", false)], "en");
  assert.deepEqual(g.map((x) => x.type), ["factsheet", "commentary"]);
  assert.deepEqual(g[0].docs.map((x) => x.id), ["c", "b"]);
});

test("visible blocks follow data and admin switches", () => {
  const data = {
    key: "monthly-income", sourceName: "SEST",
    performance: { asOf: "2026-08-31", basis: "net", firstMonth: "2019-01-31", monthly: [{ month: "2026-08-31", r: 0.01 }], trailing: { fund: { SI: 0.05 } }, calendar: [], growth: [{ date: "a", fund: 1 }, { date: "b", fund: 2 }] },
    risk: null, nav: null, aum: null, characteristics: [], breakdowns: {}, topHoldings: [], esg: [], factsheetMonth: null,
  } as unknown as FundData;
  const v = visibleBlocks(data, {}, 0);
  assert.equal(v.trailing, true);
  assert.equal(v.growth, true);
  assert.equal(v.calendar, false);
  assert.equal(v.risk, false);
  assert.equal(v.portfolio, false);
  assert.equal(v.documents, false);
  assert.equal(visibleBlocks(data, { hide: { performance: true, growth: true } }, 2).trailing, false);
  assert.equal(visibleBlocks(null, {}, 0).trailing, false);
});
