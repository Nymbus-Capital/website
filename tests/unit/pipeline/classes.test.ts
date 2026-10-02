/**
 * Returns per class and GMV variants: pipeline build + validation against the synthetic fixtures (class series served
 * like dataplatform PR #626, or not served yet). A class never shows another class's numbers.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSiteData } from "../../../src/lib/pipeline/build.ts";
import { fetchAll } from "../../../src/lib/pipeline/sources/index.ts";
import { runEndingAt, readyMonths, performanceProblems } from "../../../src/lib/pipeline/classes.ts";
import { validateSite } from "../../../src/lib/pipeline/validate.ts";
import type { SiteData } from "../../../src/lib/data/types.ts";
import type { MonthlyNetReturnsResponse } from "../../../src/lib/pipeline/raw.ts";
import { classServedRoute, fixtureEnv, mockFetch, type Route } from "../../fixtures/pipeline/mock-fetch.ts";

const NOW = new Date("2026-09-29T14:00:00Z");

async function build(...routes: Route[]): Promise<{ data: SiteData; validated: SiteData }> {
  const raw = await fetchAll({ fetchImpl: mockFetch(...routes).fetch, now: NOW, env: fixtureEnv() });
  const { data, context } = buildSiteData(raw, null, NOW);
  return { data, validated: validateSite(data, context, null, NOW).data };
}
const SEB = "sustainable-enhanced-bonds";

test("class series not served yet: headline stays the legacy class with its true label; no invented class", async () => {
  const { data } = await build();
  const seb = data.funds[SEB]!;
  assert.equal(seb.performance!.returnClass, "H", "the parameterless SEB series is class H");
  assert.deepEqual(Object.keys(seb.performanceByClass ?? {}), ["LDM202"]);
  assert.equal(data.funds["monthly-income"]!.performance!.returnClass, "FP");
  assert.deepEqual(Object.keys(data.funds["monthly-income"]!.performanceByClass ?? {}), ["LDM001"], "LDM081 (F) has no series: not shown");
  assert.ok(data.issues.some((i) => i.key === "sources.monthly-net-returns-class.SEB" && i.level === "info"));
  assert.ok(!data.issues.some((i) => i.level === "warn" && /class/.test(i.key)));
});

test("class series served: F is the headline of SEB and Multi-Strategy, H keeps its own series, numbers differ per class", async () => {
  const { data, validated } = await build(classServedRoute());
  for (const d of [data, validated]) {
    const seb = d.funds[SEB]!;
    assert.equal(d.funds[SEB]!.defaultClass, "LDM201");
    assert.equal(seb.performance!.returnClass, "F");
    const f = seb.performanceByClass!.LDM201;
    const h = seb.performanceByClass!.LDM202;
    assert.ok(f && h);
    assert.equal(f.performance.returnClass, "F");
    assert.equal(h.performance.returnClass, "H");
    assert.deepEqual(seb.performance, f.performance, "headline = default class");
    const fl = f.performance.monthly[f.performance.monthly.length - 1].r;
    const hl = h.performance.monthly[h.performance.monthly.length - 1].r;
    assert.ok(Math.abs(fl - hl - 0.00012) < 1e-9, "class F = class H + 1.2 bp in the fixture");
    assert.notEqual(f.performance.trailing.fund.SI, h.performance.trailing.fund.SI);
    assert.equal(d.funds["multi-strategy"]!.performance!.returnClass, "F");
    // Monthly Income: the legacy series (FP) stays the headline until LDM081 is served
    assert.equal(d.funds["monthly-income"]!.performance!.returnClass, "FP");
  }
  assert.ok(!data.issues.some((i) => i.level === "warn" && /classes/.test(i.key)), JSON.stringify(data.issues.filter((i) => /classes/.test(i.key))));
});

test("class history shorter than 12 months: only the periods that exist, flagged, no risk statistics", async () => {
  const { data } = await build(classServedRoute((sn, cc, rows) => (sn === "SEB" && cc === "STRATEGY" ? rows.filter((r) => r.month >= "2026-03-31") : rows)));
  const f = data.funds[SEB]!.performanceByClass!.LDM201;
  assert.equal(f.performance.shortRecord, true);
  assert.equal(f.performance.firstMonth, "2026-03-31");
  assert.equal(f.performance.monthly.length, 6);
  assert.equal(f.performance.trailing.fund["1Y"], null);
  assert.equal(f.performance.trailing.fund["3M"] != null, true);
  assert.equal(f.risk, null);
  assert.equal(f.risk3Y, null);
  assert.ok(f.performance.calendar.every((y) => y.year === 2026 && y.partial));
});

test("a class series that does not end at the as-of month is dropped with a warning; the other class and the fund stay", async () => {
  const { data } = await build(classServedRoute((sn, cc, rows) => (sn === "SEB" && cc === "STRATEGY" ? rows.filter((r) => r.month <= "2026-07-31") : rows)));
  const seb = data.funds[SEB]!;
  assert.equal(seb.performanceByClass!.LDM201, undefined);
  assert.equal(seb.performance!.returnClass, "H", "no F series: the headline is the class that has one, labelled H");
  assert.ok(data.issues.some((i) => i.level === "warn" && i.key === `funds.${SEB}.performance.classes.LDM201`));
});

test("the class endpoint disagreeing with the main series for the same class is flagged", async () => {
  const { data } = await build(classServedRoute((sn, cc, rows) => (sn === "SEB" && cc === "STRATEGY_H" ? rows.map((r) => (r.month === "2026-08-31" ? { ...r, net_return: (r.net_return ?? 0) + 0.01 } : r)) : rows)));
  assert.ok(data.issues.some((i) => i.level === "warn" && i.key === `funds.${SEB}.performance.classes.LDM202` && /differs from the main series/.test(i.message)));
});

test("a class answer for another class than the one asked is refused", async () => {
  const wrong: Route = (u) => {
    if (u.pathname !== "/api/performance/monthly-net-returns" || u.searchParams.get("class_code") !== "STRATEGY" || u.searchParams.get("short_name") !== "SEB") return undefined;
    return classServedRoute()(new URL(u.toString().replace("class_code=STRATEGY", "class_code=STRATEGY_H")));
  };
  const { data } = await build(wrong);
  assert.equal(data.funds[SEB]!.performanceByClass?.LDM201, undefined);
});

test("GMV variants 3 / 6 / 9: each has its own returns; the default (6) is the fund's own data", async () => {
  const { data, validated } = await build();
  for (const d of [data, validated]) {
    const g = d.funds["global-minimum-volatility"]!;
    assert.equal(g.defaultVariant, "6");
    assert.deepEqual(Object.keys(g.variants!).sort(), ["3", "6", "9"]);
    assert.deepEqual(g.variants!["6"].performance, g.performance);
    assert.notEqual(g.variants!["3"].performance!.trailing.fund.SI, g.variants!["9"].performance!.trailing.fund.SI);
    assert.equal(g.variants!["3"].performance!.asOf, g.performance!.asOf);
  }
  assert.ok(!data.issues.some((i) => /variants/.test(i.key) && i.level !== "info"));
});

test("GMV: a missing variant block drops that variant only", async () => {
  const raw = await fetchAll({ fetchImpl: mockFetch().fetch, now: NOW, env: fixtureEnv() });
  for (const f of Object.values(raw.factsheets.data!.files) as Record<string, unknown>[]) delete f.GMV_9pct;
  const { data, context } = buildSiteData(raw, null, NOW);
  const g = validateSite(data, context, null, NOW).data.funds["global-minimum-volatility"]!;
  assert.deepEqual(Object.keys(g.variants!).sort(), ["3", "6"]);
  assert.ok(data.issues.some((i) => i.level === "warn" && i.key === "funds.global-minimum-volatility.variants.9.performance"));
});

test("validation drops a class whose own numbers are implausible, never the fund", async () => {
  const { data } = await build(classServedRoute());
  const bad = structuredClone(data);
  const seb = bad.funds[SEB]!;
  seb.performanceByClass!.LDM202.performance.monthly[3].r = 0.9;
  const raw = await fetchAll({ fetchImpl: mockFetch(classServedRoute()).fetch, now: NOW, env: fixtureEnv() });
  const { context } = buildSiteData(raw, null, NOW);
  const v = validateSite(bad, context, null, NOW).data;
  assert.equal(v.funds[SEB]!.performanceByClass!.LDM202, undefined);
  assert.ok(v.funds[SEB]!.performanceByClass!.LDM201);
  assert.ok(v.funds[SEB]!.performance);
  assert.ok(v.issues.some((i) => i.level === "warn" && /LDM202/.test(i.key)));
});

test("runEndingAt: contiguous run to as-of; a hole ends the usable run; missing as-of = null", () => {
  const s = { "2026-01-31": 0.01, "2026-02-28": 0.01, "2026-04-30": 0.01, "2026-05-31": 0.02 };
  const r = runEndingAt(s, "2026-05-31")!;
  assert.equal(r.first, "2026-04-30");
  assert.deepEqual(r.before, ["2026-01-31", "2026-02-28"]);
  assert.equal(runEndingAt(s, "2026-06-30"), null);
});

test("readyMonths: only ready finite months up to as-of and after the track start", () => {
  const data = { as_of: "x", rows: [
    { month: "2026-01-31", net_return: 0.01, status: "ready" }, { month: "2026-02-28", net_return: null, status: "ready" },
    { month: "2026-03-31", net_return: 0.02, status: "unavailable" }, { month: "2026-04-30", net_return: 0.03, status: "ready" }, { month: "2026-05-31", net_return: 0.04, status: "ready" },
  ] } as MonthlyNetReturnsResponse;
  assert.deepEqual(readyMonths(data, "2026-04-30", "2026-02-28"), { "2026-04-30": 0.03 });
});

test("performanceProblems: gap, wrong end, huge month, trailing mismatch", () => {
  const p = { asOf: "2026-03-31", basis: "net", method: "compounded", firstMonth: "2026-01-31", monthly: [{ month: "2026-01-31", r: 0.01 }, { month: "2026-03-31", r: 0.6 }], trailing: { fund: { "1M": 0.6 } }, calendar: [], growth: [] } as unknown as Parameters<typeof performanceProblems>[0];
  const out = performanceProblems(p, "compounded", true);
  assert.ok(out.some((m) => /outside/.test(m)) && out.some((m) => /gap/.test(m)));
});
