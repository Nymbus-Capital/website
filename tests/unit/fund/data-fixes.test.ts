import { test } from "node:test";
import assert from "node:assert/strict";
import { growthMethod, growthRange } from "../../../src/components/fund/lib/growth.ts";
import { heatmapGrid } from "../../../src/components/fund/lib/heatmap.ts";
import {
  isAnnualized,
  partialKind,
  returnBadges,
  siAnnualized,
  trackMonths,
} from "../../../src/components/fund/lib/performance.ts";
import { stripHidden, visibleBlocks } from "../../../src/components/fund/lib/visibility.ts";
import { lastYears, navText } from "../../../src/components/site/home/figures.ts";
import { toFundCard, toHomeData } from "../../../src/components/site/home/data.ts";
import { FUNDS } from "../../../src/config/funds.ts";
import type { FundData, GrowthPoint, SiteContent } from "../../../src/lib/data/types.ts";

const close = (a: number | null, b: number, eps = 1e-9) => assert.ok(a != null && Math.abs(a - b) < eps, `${a} ≉ ${b}`);

/* ------------------------------------------------------------------ 1. growth of 10 000 $: compounded vs arithmetic */

/** 15 months of +1 %: month-end points from the start (10 000 $) like the pipeline's growth(). */
function series(method: "compounded" | "arithmetic", n = 15, r = 0.01): GrowthPoint[] {
  const out: GrowthPoint[] = [{ date: "2025-05-31", fund: 10000 }];
  for (let k = 1; k <= n; k++) {
    const m = new Date(Date.UTC(2025, 5 + k, 0)).toISOString().slice(0, 10);
    out.push({ date: m, fund: method === "arithmetic" ? 10000 * (1 + r * k) : 10000 * Math.pow(1 + r, k) });
  }
  return out;
}

test("growthRange: an arithmetic series (GMV, 10 000 × (1 + Σr)) is rebased additively", () => {
  const pts = series("arithmetic");
  const s = growthRange(pts, "1Y", "arithmetic");
  assert.equal(s.fund.length, 13);
  assert.equal(s.start, 10000);
  close(s.fund[0], 10000);
  // 12 months of +1 % without reinvestment: 10 000 × (1 + 0.12) = 11 200 (the ratio rescaling gave 11 165.05)
  close(s.fund[12], 11200, 1e-6);
  close(s.change, 0.12);
  // the range is exactly what 10 000 $ on notional at the start of the range becomes: 10 000 + (p − p0)
  for (let i = 0; i < 13; i++) close(s.fund[i], 10000 + (pts[i + 3].fund - pts[3].fund), 1e-6);
  // the old ratio rescaling would have been wrong for this series
  assert.ok(Math.abs((pts[15].fund / pts[3].fund) * 10000 - 11200) > 30);
});

test("growthRange: a compounded series is rebased by ratio; SI is the published series untouched", () => {
  const pts = series("compounded");
  const s = growthRange(pts, "1Y", "compounded");
  close(s.fund[12], 10000 * Math.pow(1.01, 12), 1e-6); // 11 268.25
  close(s.change, Math.pow(1.01, 12) - 1);
  const si = growthRange(pts, "SI", "compounded");
  assert.deepEqual(
    si.fund,
    pts.map((p) => p.fund),
  );
  close(si.change, Math.pow(1.01, 15) - 1);
  const siA = growthRange(series("arithmetic"), "SI", "arithmetic");
  close(siA.fund[15], 11500, 1e-6);
  close(siA.change, 0.15);
  // default method stays compounded (the funds)
  close(growthRange(pts, "1Y").fund[12], 10000 * Math.pow(1.01, 12), 1e-6);
});

test("growthRange: an index line is rebased with the same method", () => {
  const pts = series("compounded").map((p, i) => ({ ...p, index: 10000 * Math.pow(1.005, i) }));
  const s = growthRange(pts, "1Y", "compounded");
  close(s.index[0]!, 10000);
  close(s.index[12]!, 10000 * Math.pow(1.005, 12), 1e-6);
});

test("growthMethod: the published method, else arithmetic for a gross series, else compounded", () => {
  assert.equal(growthMethod({ method: "arithmetic", basis: "net" }), "arithmetic");
  assert.equal(growthMethod({ method: "compounded", basis: "gross" }), "compounded");
  assert.equal(growthMethod({ basis: "gross" }), "arithmetic");
  assert.equal(growthMethod({ basis: "net" }), "compounded");
  assert.equal(growthMethod(null, "gross"), "arithmetic");
  assert.equal(growthMethod(undefined), "compounded");
});

/* ------------------------------------------------------------------ 2 / 4. hidden blocks */

const full = (): Omit<FundData, "sourceName"> => ({
  key: "monthly-income",
  performance: {
    returnClass: "F",
    returnClassLabel: "Series F",
    asOf: "2026-08-31",
    basis: "net",
    method: "compounded",
    firstMonth: "2019-01-31",
    monthly: [
      { month: "2026-07-31", r: 0.004 },
      { month: "2026-08-31", r: 0.01 },
    ],
    trailing: { fund: { "1M": 0.01, YTD: 0.02, SI: 0.03 } },
    calendar: [
      { year: 2025, fund: 0.04 },
      { year: 2026, fund: 0.02, partial: true },
    ],
    growth: [
      { date: "2026-06-30", fund: 10000 },
      { date: "2026-07-31", fund: 10040 },
      { date: "2026-08-31", fund: 10140.4 },
    ],
  },
  risk: {
    window: "SI",
    annReturn: 0.03,
    annVol: 0.02,
    downsideDev: null,
    sharpe: 1,
    sortino: null,
    maxDrawdown: -0.01,
    positiveMonths: 0.7,
    bestMonth: 0.01,
    worstMonth: -0.01,
  },
  risk3Y: {
    window: "3Y",
    annReturn: 0.02,
    annVol: 0.02,
    downsideDev: null,
    sharpe: 1,
    sortino: null,
    maxDrawdown: -0.01,
    positiveMonths: 0.7,
    bestMonth: 0.01,
    worstMonth: -0.01,
  },
  nav: {
    asOf: "2026-09-28",
    classes: [
      {
        fundserv: "LDM001",
        display: "F",
        currency: "CAD",
        nav: 10.1905,
        date: "2026-09-28",
        prevNav: null,
        change: null,
        changePct: null,
      },
    ],
  },
  aum: { cad: 123_000_000, asOf: "2026-09-28" },
  characteristics: [{ id: "duration", label: { en: "Duration", fr: "Durée" }, fund: 2.1, unit: "num" }],
  breakdowns: { credit: [{ label: "A", fund: 0.5 }] },
  topHoldings: [{ name: "Bond", weight: 0.05 }],
  esg: [{ id: "carbon", label: { en: "Carbon", fr: "Carbone" }, fund: 10, unit: "num" }],
  factsheetMonth: "2026-08",
});

test("visibleBlocks: hide.performance hides every returns-derived block, the portfolio stays", () => {
  const all = visibleBlocks(full(), {}, 1);
  for (const b of ["trailing", "growth", "calendar", "heatmap", "risk", "portfolio"] as const)
    assert.equal(all[b], true, b);
  const v = visibleBlocks(full(), { hide: { performance: true } }, 1);
  for (const b of ["trailing", "growth", "calendar", "heatmap", "risk"] as const) assert.equal(v[b], false, b);
  assert.equal(v.portfolio, true);
  assert.equal(v.documents, true);
  assert.deepEqual(returnBadges(full().performance, true), []);
});

test("visibleBlocks: growth / calendar / risk hide individually", () => {
  const g = visibleBlocks(full(), { hide: { growth: true } }, 0);
  assert.deepEqual([g.growth, g.calendar, g.risk, g.trailing, g.heatmap], [false, true, true, true, true]);
  const c = visibleBlocks(full(), { hide: { calendar: true } }, 0);
  assert.deepEqual([c.growth, c.calendar, c.risk], [true, false, true]);
  const r = visibleBlocks(full(), { hide: { risk: true } }, 0);
  assert.deepEqual([r.growth, r.calendar, r.risk, r.trailing], [true, true, false, true]);
});

test("stripHidden: hidden blocks are removed from the data (not in the RSC props), input untouched", () => {
  const src = full();
  const before = JSON.stringify(src);
  const p = stripHidden(src, { hide: { performance: true } })!;
  assert.equal(p.performance, null);
  assert.equal(p.risk, null);
  assert.equal(p.risk3Y, null);
  assert.equal(p.nav?.classes[0].nav, 10.1905, "NAV is not performance");
  assert.equal(p.aum, null, "fund AUM hidden unless explicitly published");
  assert.equal(p.characteristics.length, 1);
  const json = JSON.stringify(p);
  for (const leak of ["0.03", "10140.4", "0.004", "annReturn"]) assert.ok(!json.includes(leak), `leaks ${leak}`);
  assert.equal(JSON.stringify(src), before, "input not mutated");
  // the stripped data renders no returns block either
  const v = visibleBlocks(p, {}, 0);
  assert.deepEqual([v.trailing, v.growth, v.calendar, v.heatmap, v.risk], [false, false, false, false, false]);

  const g = stripHidden(src, { hide: { growth: true, calendar: true } })!;
  assert.deepEqual(g.performance?.growth, []);
  assert.deepEqual(g.performance?.calendar, []);
  assert.equal(g.performance?.trailing.fund.SI, 0.03);
  const r = stripHidden(src, { hide: { risk: true } })!;
  assert.equal(r.risk, null);
  assert.equal(r.risk3Y, null);
  assert.ok(r.performance);
  const n = stripHidden(src, {
    hide: { nav: true, characteristics: true, breakdowns: true, holdings: true, esg: true, aum: false },
  })!;
  assert.equal(n.nav, null);
  assert.deepEqual([n.characteristics, n.breakdowns, n.topHoldings, n.esg], [[], {}, [], []]);
  assert.equal(n.aum?.cad, 123_000_000, "published only on hide.aum === false");
  assert.equal(stripHidden(null, {}), null);
  assert.equal(stripHidden(src, null)!.aum, null);
});

const spec = FUNDS[0];
const view = (content = {}) => ({
  spec,
  content,
  data: { ...full(), sourceName: "internal" } as FundData,
  sample: false,
});

test("home / strategies / solutions props: hidden blocks never reach the cards", () => {
  const c = toFundCard(view({ hide: { performance: true } }) as never);
  assert.deepEqual([c.si, c.ytd, c.y1, c.asOf, c.firstMonth], [null, null, null, null, null]);
  assert.deepEqual(c.calendar, []);
  assert.equal(c.nav?.nav, 10.1905);
  const cal = toFundCard(view({ hide: { calendar: true } }) as never);
  assert.deepEqual(cal.calendar, []);
  assert.equal(cal.si, 0.03);
  const nav = toFundCard(view({ hide: { nav: true } }) as never);
  assert.equal(nav.nav, null);
  // the class of the returns travels with them (never shown once performance is hidden)
  assert.equal(c.perfClass, null);
  const labelled = toFundCard({
    ...view(),
    data: {
      ...full(),
      sourceName: "x",
      performance: { ...full().performance!, classCode: "STRATEGY_H", returnClass: "H", returnClassLabel: "Series H" },
    },
  } as never);
  // an H series next to the F headline class is never shown on the F tile
  assert.equal(labelled.perfClass, null);
  assert.deepEqual(
    [labelled.si, labelled.ytd, labelled.y1, labelled.asOf, labelled.calendar],
    [null, null, null, null, []],
  );
  // ... but the headline class's own series is (by-class publication)
  const byCls = {
    LDM081: { fundserv: "LDM081", display: "F", performance: full().performance!, risk: null, risk3Y: null },
  };
  const ownSeries = toFundCard({
    ...view(),
    data: {
      ...full(),
      sourceName: "x",
      performance: { ...full().performance!, returnClass: "H" },
      performanceByClass: byCls,
    },
  } as never);
  assert.equal(ownSeries.perfClass, "F");
  assert.equal(ownSeries.si, 0.03);
  const noSeries = toFundCard({
    ...view(),
    data: {
      ...full(),
      sourceName: "x",
      performanceByClass: { LDM001: { ...byCls.LDM081, fundserv: "LDM001", display: "FP" } },
    },
  } as never);
  // the headline class has no series: the card shows another class's own series, labelled with that class, and the
  // NAV of that same class (never a "coming soon" state, never a figure under another class's name)
  assert.equal(noSeries.si, 0.03);
  assert.equal(noSeries.perfClass, "FP");
  assert.equal(noSeries.nav?.code, "LDM001");
  assert.equal(noSeries.code, "LDM001");
  const content = {
    version: 1,
    updatedAt: "",
    updatedBy: "",
    firm: {},
    funds: {},
    pipeline: { publishMode: "review" },
  } as unknown as SiteContent;
  const h = toHomeData([view({ hide: { performance: true } }) as never], content);
  assert.equal(h.perfAsOf, null);
  assert.ok(!JSON.stringify(h).includes("123000000"));
});

/* ------------------------------------------------------------------ 5. YTD only for the as-of year */

test("partialKind: YTD only for the as-of year, a partial inception year is 'launch'", () => {
  assert.equal(partialKind(2026, true, "2026-08-31"), "ytd");
  assert.equal(partialKind(2019, true, "2026-08-31"), "launch");
  assert.equal(partialKind(2025, false, "2026-08-31"), null);
  assert.equal(partialKind(2026, true, null), "launch", "no as-of: never claim YTD");
});

test("heatmap rows and mini bars carry the partial-year kind", () => {
  // contiguous months inside each year shown (a year with a gap inside the record is not shown)
  const monthly = [
    ...[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => ({ month: `2019-${String(m).padStart(2, "0")}-28`, r: 0.001 })),
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((m) => ({ month: `2026-${String(m).padStart(2, "0")}-28`, r: 0.0005 })),
  ];
  const cal = [
    { year: 2019, fund: 0.02, partial: true },
    { year: 2026, fund: 0.005, partial: true },
  ];
  const g = heatmapGrid(monthly, cal, "2026-08-31");
  assert.deepEqual(
    g.map((r) => [r.year, r.kind]),
    [
      [2026, "ytd"],
      [2019, "launch"],
    ],
  );
  // as-of defaults to the last published month
  assert.deepEqual(
    heatmapGrid(monthly, cal).map((r) => r.kind),
    ["ytd", "launch"],
  );
  const bars = lastYears(
    [
      { year: 2019, fund: 0.02, partial: true },
      { year: 2020, fund: 0.03 },
      { year: 2026, fund: 0.005, partial: true },
    ],
    6,
    "2026-08-31",
  );
  assert.deepEqual(
    bars.map((b) => b.kind),
    ["launch", null, "ytd"],
  );
  const card = toFundCard({
    ...view(),
    data: { ...full(), sourceName: "x", performance: { ...full().performance!, calendar: cal } },
  } as never);
  assert.deepEqual(
    card.calendar.map((b) => b.kind),
    ["launch", "ytd"],
  );
});

/* ------------------------------------------------------------------ 7. SI annualized threshold, NAV decimals */

test("SI is annualized from 12 monthly returns, like the pipeline (si.length >= 12)", () => {
  assert.equal(trackMonths("2025-09-30", "2026-08-31"), 12);
  assert.equal(siAnnualized("2025-09-30", "2026-08-31"), true);
  assert.equal(siAnnualized("2025-10-31", "2026-08-31"), false);
  assert.equal(isAnnualized("SI", "2025-09-30", "2026-08-31"), true);
  const c = toFundCard({
    ...view(),
    data: { ...full(), sourceName: "x", performance: { ...full().performance!, firstMonth: "2025-09-30" } },
  } as never);
  assert.equal(c.siAnnualized, true);
  assert.equal(c.y1, null, "no published 1Y in this fixture");
});

test("NAV per unit: 4 decimals everywhere (cards and tables like the fund page)", () => {
  assert.equal(navText(10.1905, "CAD", "en"), "$10.1905");
});
