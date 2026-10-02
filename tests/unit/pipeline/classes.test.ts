/**
 * Returns per class and GMV variants: pipeline build + validation against the synthetic fixtures (full-history class
 * served like dataplatform PR #626, or not served yet), and the hold of a failing performance per class / variant.
 * A class never shows another class's numbers.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSiteData } from "../../../src/lib/pipeline/build.ts";
import { fetchAll } from "../../../src/lib/pipeline/sources/index.ts";
import { buildClassPerformance, runEndingAt, performanceProblems } from "../../../src/lib/pipeline/classes.ts";
import { classSeriesOf } from "../../../src/lib/pipeline/fund-sources.ts";
import { validateSite } from "../../../src/lib/pipeline/validate.ts";
import type { SiteData } from "../../../src/lib/data/types.ts";
import { fixtureEnv, fullHistoryRoute, mockFetch, type Route } from "../../fixtures/pipeline/mock-fetch.ts";
import type { FundContext } from "../../../src/lib/pipeline/build.ts";

const NOW = new Date("2026-09-29T14:00:00Z");
const SEB = "sustainable-enhanced-bonds";
const GMV = "global-minimum-volatility";

async function build(...routes: Route[]): Promise<{ data: SiteData; validated: SiteData; context: Partial<Record<string, FundContext>> }> {
  const raw = await fetchAll({ fetchImpl: mockFetch(...routes).fetch, now: NOW, env: fixtureEnv() });
  const { data, context } = buildSiteData(raw, null, NOW);
  return { data, validated: validateSite(data, context, null, NOW).data, context };
}

test("classes of a fund come from the class configuration (SEB F + H, Monthly Income FP only: LDM081 has no series)", () => {
  assert.deepEqual(classSeriesOf(SEB).map((k) => k.fundserv), ["LDM201", "LDM202"]);
  assert.deepEqual(classSeriesOf("monthly-income").map((k) => k.fundserv), ["LDM001"]);
  assert.deepEqual(classSeriesOf(GMV), []);
});

test("full history not served yet: headline is class H labelled H; no invented class", async () => {
  const { data } = await build();
  const seb = data.funds[SEB]!;
  assert.equal(seb.performance!.returnClass, "H", "the parameterless SEB series is class H");
  assert.deepEqual(Object.keys(seb.performanceByClass ?? {}), ["LDM202"]);
  assert.deepEqual(seb.performanceByClass!.LDM202.performance, seb.performance);
  assert.equal(data.funds["monthly-income"]!.performance!.returnClass, "FP");
  assert.deepEqual(Object.keys(data.funds["monthly-income"]!.performanceByClass ?? {}), ["LDM001"], "LDM081 (F) has no series: not shown");
  assert.ok(!data.issues.some((i) => i.level === "warn" && /classes/.test(i.key)));
});

test("full history served: F is the headline of SEB, H keeps its own series, numbers differ per class", async () => {
  const { data, validated } = await build(fullHistoryRoute);
  for (const d of [data, validated]) {
    const seb = d.funds[SEB]!;
    assert.equal(seb.defaultClass, "LDM201");
    assert.equal(seb.performance!.returnClass, "F");
    assert.equal(seb.performance!.classCode, "STRATEGY");
    const f = seb.performanceByClass!.LDM201;
    const h = seb.performanceByClass!.LDM202;
    assert.ok(f && h);
    assert.equal(f.performance.returnClass, "F");
    assert.equal(h.performance.returnClass, "H");
    assert.equal(h.performance.classCode, "STRATEGY_H");
    assert.deepEqual(seb.performance, f.performance, "headline = default class");
    assert.equal(h.performance.asOf, f.performance.asOf);
    assert.notEqual(f.performance.trailing.fund.SI, h.performance.trailing.fund.SI);
    assert.equal(d.funds["multi-strategy"]!.performance!.returnClass, "F");
    assert.equal(d.funds["monthly-income"]!.performance!.returnClass, "FP");
  }
  assert.ok(!data.issues.some((i) => i.level === "warn" && /classes/.test(i.key)), JSON.stringify(data.issues.filter((i) => /classes/.test(i.key))));
});

test("a class whose series is shorter than 12 months: only the periods that exist, flagged, no risk statistics", () => {
  const series: Record<string, number> = {};
  for (const m of ["2026-03-31", "2026-04-30", "2026-05-31", "2026-06-30", "2026-07-31", "2026-08-31"]) series[m] = 0.004;
  const cls = { fundserv: "LDM081", display: "F", classCode: "STRATEGY" as const };
  const b = buildClassPerformance({ key: "k", cls, series, asOf: "2026-08-31", idx: null });
  const e = b.entry!;
  assert.equal(e.performance.shortRecord, true);
  assert.equal(e.performance.firstMonth, "2026-03-31");
  assert.equal(e.performance.monthly.length, 6);
  assert.equal(e.performance.trailing.fund["1Y"], null);
  assert.equal(e.performance.trailing.fund["3M"] != null, true);
  assert.equal(e.risk, null);
  assert.equal(e.risk3Y, null);
  assert.ok(e.performance.calendar.every((y) => y.year === 2026 && y.partial));
});

test("a class series that does not end at the as-of month is not shown, with a warning", () => {
  const cls = { fundserv: "LDM201", display: "F", classCode: "STRATEGY" as const };
  const b = buildClassPerformance({ key: "k", cls, series: { "2026-05-31": 0.01, "2026-06-30": 0.01 }, asOf: "2026-08-31", idx: null });
  assert.equal(b.entry, null);
  assert.ok(b.issues.some((i) => i.level === "warn" && /ends 2026-06/.test(i.message)));
});

test("GMV variants 3 / 6 / 9: each has its own returns; the default (6) is the fund's own data", async () => {
  const { data, validated } = await build();
  for (const d of [data, validated]) {
    const g = d.funds[GMV]!;
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
  const g = validateSite(data, context, null, NOW).data.funds[GMV]!;
  assert.deepEqual(Object.keys(g.variants!).sort(), ["3", "6"]);
  assert.ok(data.issues.some((i) => i.level === "warn" && i.key === `funds.${GMV}.variants.9.performance`));
});

test("validation drops a class whose own numbers are implausible, never the fund", async () => {
  const { data, context } = await build(fullHistoryRoute);
  const bad = structuredClone(data);
  bad.funds[SEB]!.performanceByClass!.LDM202.performance.monthly[3].r = 0.9;
  const v = validateSite(bad, context, null, NOW).data;
  assert.equal(v.funds[SEB]!.performanceByClass!.LDM202, undefined);
  assert.ok(v.funds[SEB]!.performanceByClass!.LDM201);
  assert.ok(v.funds[SEB]!.performance);
  assert.ok(v.issues.some((i) => i.level === "warn" && /LDM202/.test(i.key)));
});

test("a performance held by validation holds every class, never new classes next to an old headline; NAV and the rest still publish", async () => {
  const first = await build(fullHistoryRoute);
  const previous = { ...structuredClone(first.validated), mode: "live" } as SiteData;
  const bad = structuredClone(first.data);
  const seb = bad.funds[SEB]!;
  seb.performance!.monthly[3].r = Number.NaN; // only the performance fails
  seb.performanceByClass!.LDM201.performance.monthly[3].r = Number.NaN;
  seb.performanceByClass!.LDM202.performance.trailing.fund["1M"] = 0.0123; // would differ from the held one
  const out = validateSite(bad, first.context, previous, NOW);
  const kept = out.data.funds[SEB]!;
  const was = previous.funds[SEB]!;
  assert.ok(kept, "the fund is not dropped");
  assert.deepEqual(kept.performance, was.performance);
  assert.deepEqual(kept.performanceByClass, was.performanceByClass, "every class is held with the headline");
  assert.equal(kept.defaultClass, was.defaultClass);
  assert.deepEqual(kept.nav, bad.funds[SEB]!.nav, "NAV is the new one");
  assert.ok(out.results.find((r) => r.fund === SEB)!.blocking.length > 0);
});

test("a held GMV performance holds every variant with it", async () => {
  const first = await build();
  const previous = { ...structuredClone(first.validated), mode: "live" } as SiteData;
  const bad = structuredClone(first.data);
  const g = bad.funds[GMV]!;
  g.performance!.monthly[3].r = Number.NaN;
  g.variants!["6"].performance = g.performance;
  g.variants!["3"].performance!.trailing.fund["1M"] = 0.0123;
  const out = validateSite(bad, first.context, previous, NOW);
  const kept = out.data.funds[GMV]!;
  assert.ok(kept, "the fund is not dropped");
  assert.deepEqual(kept.performance, previous.funds[GMV]!.performance);
  assert.deepEqual(kept.variants!["6"].performance, previous.funds[GMV]!.performance);
  assert.deepEqual(kept.variants!["3"], previous.funds[GMV]!.variants!["3"]);
  assert.deepEqual(kept.variants!["9"], previous.funds[GMV]!.variants!["9"]);
});

test("runEndingAt: contiguous run to as-of; a hole ends the usable run; missing as-of = null", () => {
  const s = { "2026-01-31": 0.01, "2026-02-28": 0.01, "2026-04-30": 0.01, "2026-05-31": 0.02 };
  const r = runEndingAt(s, "2026-05-31")!;
  assert.equal(r.first, "2026-04-30");
  assert.deepEqual(r.before, ["2026-01-31", "2026-02-28"]);
  assert.equal(runEndingAt(s, "2026-06-30"), null);
});

test("performanceProblems: gap, wrong end, huge month, trailing mismatch", () => {
  const p = { asOf: "2026-03-31", basis: "net", method: "compounded", firstMonth: "2026-01-31", monthly: [{ month: "2026-01-31", r: 0.01 }, { month: "2026-03-31", r: 0.6 }], trailing: { fund: { "1M": 0.6 } }, calendar: [], growth: [] } as unknown as Parameters<typeof performanceProblems>[0];
  const out = performanceProblems(p, "compounded", true);
  assert.ok(out.some((m) => /outside/.test(m)) && out.some((m) => /gap/.test(m)));
});
