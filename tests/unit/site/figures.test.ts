import { test } from "node:test";
import assert from "node:assert/strict";
import { CATEGORY, cell, dayText, filterFunds, lastYears, latest, miniBars, monthText, navText, pctText } from "../../../src/components/site/home/figures.ts";
import { toFundCard, toHomeData } from "../../../src/components/site/home/data.ts";
import { FUNDS } from "../../../src/config/funds.ts";
import type { FundData, SiteContent } from "../../../src/lib/data/types.ts";

/** FR output uses a (narrow) no-break space before % and $: compare with any space */
const sp = (s: string | null) => (s ?? "").replace(/[\u00a0\u202f ]/g, " ");

test("pctText / cell: signed, FR spacing, em dash when not published", () => {
  assert.equal(pctText(0.0523, "en"), "+5.2%");
  assert.equal(sp(pctText(-0.0131, "fr")), "−1,3 %");
  assert.equal(pctText(0.0523, "en", false), "5.2%");
  assert.equal(pctText(null, "en"), null);
  assert.equal(pctText(Number.NaN, "en"), null);
  assert.equal(cell(undefined, "en"), "—");
  assert.equal(cell(0, "en"), "0.0%");
});

test("dates: sentence case in English, French as written", () => {
  assert.equal(monthText("2026-08-31", "en"), "August 2026");
  assert.equal(monthText("2026-08-31", "fr"), "août 2026");
  assert.equal(dayText("2026-09-28", "en"), "Sep 28, 2026");
  assert.equal(dayText("2026-09-28", "fr"), "28 sept. 2026");
  assert.equal(monthText(null, "en"), "");
});

test("navText: class currency", () => {
  // 4 decimals everywhere, like the fund page (NAV card, series table)
  assert.equal(navText(10.1905, "CAD", "en"), "$10.1905");
  assert.equal(navText(10.1905, "USD", "en"), "US$10.1905");
  assert.equal(sp(navText(10.1905, "CAD", "fr")), "10,1905 $");
  assert.equal(navText(10.2, "CAD", "en"), "$10.2000");
});

test("filterFunds: every registered fund has a category; filters keep order", () => {
  for (const f of FUNDS) assert.ok(CATEGORY[f.key], f.key);
  const funds = FUNDS.map((f) => ({ key: f.key }));
  assert.equal(filterFunds(funds, "all").length, funds.length);
  assert.deepEqual(filterFunds(funds, "fixed-income").map((f) => f.key), ["monthly-income", "sustainable-enhanced-bonds"]);
  assert.deepEqual(filterFunds(funds, "alternatives").map((f) => f.key), ["multi-strategy", "global-minimum-volatility"]);
});

test("lastYears: the most recent years, oldest first, only published values", () => {
  const rows = [
    { year: 2026, fund: 0.01, partial: true }, { year: 2019, fund: 0.05 }, { year: 2020, fund: null },
    { year: 2021, fund: -0.02 }, { year: 2022, fund: 0.03 }, { year: 2023, fund: 0.04 }, { year: 2024, fund: 0.06 }, { year: 2025, fund: 0.07 },
  ];
  const y = lastYears(rows, 6);
  assert.deepEqual(y.map((b) => b.year), [2021, 2022, 2023, 2024, 2025, 2026]);
  assert.equal(y[5].partial, true);
  assert.deepEqual(lastYears(null), []);
});

test("miniBars: zero line and bar geometry stay inside the plot", () => {
  const g = miniBars([{ year: 2024, r: 0.06, partial: false }, { year: 2025, r: -0.02, partial: false }]);
  assert.equal(g.zero, 0.75);
  assert.deepEqual([g.bars[0].top, g.bars[0].height].map((v) => +v.toFixed(6)), [0, 0.75]);
  assert.deepEqual([g.bars[1].top, g.bars[1].height].map((v) => +v.toFixed(6)), [0.75, 0.25]);
  const pos = miniBars([{ year: 2024, r: 0.02, partial: false }, { year: 2025, r: 0.04, partial: false }]);
  assert.equal(pos.zero, 1, "all positive: zero line at the bottom");
  for (const b of [...g.bars, ...pos.bars]) assert.ok(b.top >= 0 && b.top + b.height <= 1 + 1e-9);
  assert.deepEqual(miniBars([]).bars, []);
});

test("latest: ignores missing and malformed dates", () => {
  assert.equal(latest(["2026-09-26", null, "2026-09-28", "bad"]), "2026-09-28");
  assert.equal(latest([undefined]), null);
});

/* ------------------------------------------------------------------ server → client props */

const spec = FUNDS[0];
const data = (over: Partial<FundData> = {}): FundData => ({
  key: spec.key, sourceName: "internal-source", risk: null, aum: { cad: 123_000_000, asOf: "2026-09-28" }, characteristics: [], breakdowns: {}, topHoldings: [], esg: [], factsheetMonth: null,
  performance: {
    asOf: "2026-08-31", basis: "net", firstMonth: "2019-01-31", monthly: [], growth: [],
    trailing: { fund: { YTD: 0.01, "1Y": 0.02, SI: 0.03 } },
    calendar: [{ year: 2025, fund: 0.04 }, { year: 2026, fund: 0.01, partial: true }],
  },
  nav: { asOf: "2026-09-28", classes: [{ fundserv: "LDM001", display: "F", currency: "CAD", nav: 10.19, date: "2026-09-28", prevNav: null, change: null, changePct: null }] },
  ...over,
});
const view = (d: FundData | null, content = {}) => ({ spec, content, data: d, sample: false });

test("toFundCard: published figures pass through; internal fields never do", () => {
  const c = toFundCard(view(data()) as never);
  assert.equal(c.ytd, 0.01); assert.equal(c.y1, 0.02); assert.equal(c.si, 0.03);
  assert.equal(c.nav?.nav, 10.19);
  assert.deepEqual(c.calendar.map((b) => b.year), [2025, 2026]);
  const json = JSON.stringify(c);
  assert.ok(!json.includes("internal-source"), "source name stays server side");
  assert.ok(!json.includes("123000000"), "fund AUM stays server side");
});

test("toFundCard: nothing published or hidden in the admin → nulls (the UI shows 'figures coming soon')", () => {
  const none = toFundCard(view(null) as never);
  assert.equal(none.si, null); assert.equal(none.ytd, null); assert.equal(none.y1, null); assert.equal(none.nav, null);
  assert.deepEqual(none.calendar, []);
  const hidden = toFundCard(view(data(), { hide: { performance: true, nav: true } }) as never);
  assert.equal(hidden.si, null); assert.equal(hidden.nav, null); assert.deepEqual(hidden.calendar, []);
  const noCal = toFundCard(view(data(), { hide: { calendar: true } }) as never);
  assert.deepEqual(noCal.calendar, []);
  assert.equal(noCal.si, 0.03);
});

test("toFundCard: a 1-year figure needs a year of track record", () => {
  const young = data();
  young.performance = { ...young.performance!, firstMonth: "2026-03-31" };
  assert.equal(toFundCard(view(young) as never).y1, null);
});

test("toFundCard: admin minimum investment is passed as written, blank is none", () => {
  assert.equal(toFundCard(view(data(), { minInvestment: " 150 000 $ " }) as never).minInvestment, "150 000 $");
  assert.equal(toFundCard(view(data(), { minInvestment: "  " }) as never).minInvestment, null);
});

test("toHomeData: firm AUM label only when filled; team size only when positive; latest dates", () => {
  const content = { version: 1, updatedAt: "", updatedBy: "", firm: { aumLabel: { en: "", fr: " " } }, funds: {}, pipeline: { publishMode: "review" } } as SiteContent;
  const h = toHomeData([view(data()) as never], content, { teamSize: 0 });
  assert.equal(h.aumLabel, null);
  assert.equal(h.teamSize, null);
  assert.equal(h.navAsOf, "2026-09-28");
  assert.equal(h.perfAsOf, "2026-08-31");
  const h2 = toHomeData([view(data()) as never], { ...content, firm: { aumLabel: { en: "$1.9B", fr: "1,9 G$" } } }, { teamSize: 20 });
  assert.deepEqual(h2.aumLabel, { en: "$1.9B", fr: "1,9 G$" });
  assert.equal(h2.teamSize, 20);
});
