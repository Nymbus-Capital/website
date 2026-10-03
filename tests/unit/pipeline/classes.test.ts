/**
 * Returns per class and GMV variants: pipeline build + validation against the synthetic fixtures (each class compounded
 * by the website from its own nav-timeseries daily chain), and the hold of a failing performance per class / variant.
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
import { fixtureEnv, json, loadFixture, mockFetch, type Route } from "../../fixtures/pipeline/mock-fetch.ts";
import type { FundContext } from "../../../src/lib/pipeline/build.ts";

const NOW = new Date("2026-09-29T14:00:00Z");
const SEB = "sustainable-enhanced-bonds";
const GMV = "global-minimum-volatility";

async function build(...routes: Route[]): Promise<{ data: SiteData; validated: SiteData; context: Partial<Record<string, FundContext>> }> {
  const raw = await fetchAll({ fetchImpl: mockFetch(...routes).fetch, now: NOW, env: fixtureEnv() });
  const { data, context } = buildSiteData(raw, null, NOW);
  return { data, validated: validateSite(data, context, null, NOW).data, context };
}

test("classes of a fund come from the class configuration (SEB F + H, Monthly Income FP + F)", () => {
  assert.deepEqual(classSeriesOf(SEB).map((k) => k.fundserv), ["LDM201", "LDM202"]);
  assert.deepEqual(classSeriesOf("monthly-income").map((k) => [k.fundserv, k.display, k.classCode]), [["LDM001", "FP", "STRATEGY"], ["LDM081", "F", "LDM081"]]);
  assert.deepEqual(classSeriesOf(GMV), []);
});

test("every class from its own daily chain: SEB H headline + F next to it, Monthly Income FP headline + F since launch", async () => {
  const { data, validated } = await build();
  for (const d of [data, validated]) {
    const seb = d.funds[SEB]!;
    assert.equal(seb.performance!.returnClass, "H", "the SEB track record is class H, labelled H");
    assert.equal(seb.defaultClass, "LDM201", "the page opens on class F");
    const f = seb.performanceByClass!.LDM201;
    const h = seb.performanceByClass!.LDM202;
    assert.ok(f && h);
    assert.deepEqual(h.performance, seb.performance, "the headline class entry is the headline itself");
    assert.equal(f.performance.returnClass, "F");
    assert.equal(f.performance.classCode, "STRATEGY");
    assert.equal(f.performance.firstMonth, "2023-08-31", "first complete month of the fund's own NAV history");
    assert.equal(f.performance.asOf, h.performance.asOf);
    assert.notEqual(f.performance.trailing.fund.SI, h.performance.trailing.fund.SI);
    // F − H = the synthetic +12 bp fee difference on every common month
    const hm = new Map(h.performance.monthly.map((m) => [m.month, m.r]));
    for (const m of f.performance.monthly) assert.ok(Math.abs(m.r - hm.get(m.month)! - 0.0012) < 1e-6, m.month);
    const mi = d.funds["monthly-income"]!;
    assert.equal(mi.performance!.returnClass, "FP");
    assert.deepEqual(Object.keys(mi.performanceByClass!), ["LDM001", "LDM081"]);
    assert.equal(mi.performanceByClass!.LDM081.performance.firstMonth, "2024-03-31");
    assert.equal(mi.performanceByClass!.LDM081.performance.returnClassLabel, "Series F");
    assert.equal(d.funds["multi-strategy"]!.performance!.returnClass, "F");
    assert.deepEqual(Object.keys(d.funds["multi-strategy"]!.performanceByClass!), ["LDM301"]);
  }
  assert.ok(!data.issues.some((i) => i.level === "warn" && /classes/.test(i.key)), JSON.stringify(data.issues.filter((i) => /classes/.test(i.key))));
});

/** route serving one class's daily history altered by `fn` */
const history = (fundserv: string, fn: (rows: Record<string, unknown>[]) => Record<string, unknown>[]): Route => (url) => {
  if (url.pathname !== "/api/performance/nav-timeseries" || url.searchParams.get("fundserv") !== fundserv) return undefined;
  const j = loadFixture(`dataplatform/nav_history_${fundserv}.json`) as { rows: Record<string, unknown>[] };
  return json({ ...j, rows: fn(j.rows) });
};

test("class gates: a fee-band breach drops the class; a hole after the first computable month drops it; a failed history leaves it out (warn + alert)", async () => {
  const alertOf = (ctx: Partial<Record<string, FundContext>>, re: RegExp): boolean => !!ctx[SEB]?.alerts.some((a) => re.test(a));
  // a missed distribution on class F in 2025-06 (its daily return lowered by 0.7 %): outside the fee band vs class H
  const missed = history("LDM201", (rows) => rows.map((r) => (r.date === "2025-06-30" ? { ...r, net_daily_return: (r.net_daily_return as number) - 0.007 } : r)));
  const a = await build(missed);
  assert.equal(a.data.funds[SEB]!.performanceByClass!.LDM201, undefined);
  assert.ok(a.data.issues.some((i) => i.level === "warn" && i.key === `funds.${SEB}.performance.classes.LDM201` && /outside the fee band .*2025-06/.test(i.message)));
  assert.ok(alertOf(a.context, /class F \(LDM201\) not shown: vs class H: .*fee band/));
  assert.ok(a.data.funds[SEB]!.performance, "the headline is not affected");
  // a missing valuation day in 2025-02: never a series restarting after the hole ("since" 2025-03) — the class is dropped
  const hole = history("LDM201", (rows) => rows.filter((r) => r.date !== "2025-02-11"));
  const b = await build(hole);
  assert.equal(b.data.funds[SEB]!.performanceByClass!.LDM201, undefined, "no truncated run");
  assert.ok(b.data.issues.some((i) => i.level === "warn" && i.key === `funds.${SEB}.performance.classes.LDM201` && /not every month since its first computable month 2023-08 is usable \(own data from 2023-07-05\): 1 month\(s\) unavailable: 2025-02 Incomplete CIBC valuation-day coverage \(missing 2025-02-11\)/.test(i.message)));
  assert.ok(alertOf(b.context, /class F \(LDM201\) not shown: not every month .*1 month\(s\) unavailable/), "a data hole is an anomaly: blocking alert");
  // the history endpoint failing for class F: class F not shown ("coming soon"), H unchanged
  const down: Route = (url) => (url.pathname === "/api/performance/nav-timeseries" && url.searchParams.get("fundserv") === "LDM201" ? json({ detail: "x" }, 500) : undefined);
  const c = await build(down);
  assert.deepEqual(Object.keys(c.data.funds[SEB]!.performanceByClass!), ["LDM202"]);
  assert.ok(c.data.issues.some((i) => i.key === `funds.${SEB}.performance.classes.LDM201` && /daily NAV chain unavailable \(nav-timeseries SEB LDM201 history: .*500/.test(i.message)));
  assert.ok(alertOf(c.context, /class F \(LDM201\) not shown: daily NAV chain unavailable/));
  // a class launched less than 12 months before the as-of: not shown (regulatory rule), info only (no alert)
  const late = history("LDM201", (rows) => rows.filter((r) => (r.date as string) >= "2025-11-03"));
  const d = await build(late);
  assert.equal(d.data.funds[SEB]!.performanceByClass!.LDM201, undefined);
  assert.ok(d.data.issues.some((i) => i.level === "info" && /class F \(LDM201\): 10 month\(s\) since 2025-11 \(< 12\): returns not shown for this class \(regulatory rule\)/.test(i.message)));
  assert.ok(!alertOf(d.context, /LDM201/));
});

test("Monthly Income: no fee band (FP may carry a performance fee), the class F gates still apply", async () => {
  const { data } = await build();
  assert.ok(data.funds["monthly-income"]!.performanceByClass!.LDM081);
  assert.ok(data.issues.some((i) => i.level === "info" && i.key === "funds.monthly-income.performance.classes.LDM081" && /no fee band against class FP for this fund \(class FP may carry a performance fee/.test(i.message)));
  assert.match(data.provenance["funds.monthly-income.performance.classes.LDM081"], /no fee band \(class FP may carry a performance fee/);
  // a gap still drops it
  const hole = history("LDM081", (rows) => rows.filter((r) => r.date !== "2025-05-13"));
  const b = await build(hole);
  assert.equal(b.data.funds["monthly-income"]!.performanceByClass!.LDM081, undefined);
});

test("CIBC months of the other classes are used only when the headline verified the stored CIBC returns: else the class is dropped", async () => {
  // the headline's stored CIBC returns no longer reproduce analytics (a price-only chain would miss the distributions)
  const priceOnly = history("LDM202", (rows) => rows.map((r) => (r.date === "2024-03-28" ? { ...r, net_daily_return: (r.net_daily_return as number) - 0.007 } : r)));
  const { data, context } = await build(priceOnly);
  const seb = data.funds[SEB]!;
  assert.ok(data.issues.some((i) => i.level === "warn" && /stored CIBC daily returns of class H \(LDM202\) do not reproduce the analytics history .*largest 2024-03/.test(i.message)));
  assert.match(data.provenance[`funds.${SEB}.performance`], /analytics fund_returns\.json "Nymbus Sustainable Enhanced Bonds" \(89 month\(s\): 2019-02 to 2026-06/);
  // class F would start at 2023-08 but its CIBC months cannot be used: never a series "since" the bridge month
  assert.equal(seb.performanceByClass!.LDM201, undefined);
  // a persistent, expected limitation (the fund's CIBC months cannot be verified): a non-blocking advisory, not an alert
  assert.ok(!context[SEB]!.alerts.some((a) => /LDM201/.test(a)), JSON.stringify(context[SEB]!.alerts));
  assert.ok(context[SEB]!.advisories?.some((a) => a.code === "LDM201" && /class F \(LDM201\) not shown: not every month since its first computable month 2023-08 is usable .*: \d+ month\(s\) \(2023-08 to 2026-06\) stored CIBC daily returns not verified on the headline class$/.test(a.message)), JSON.stringify(context[SEB]!.advisories));
  // one concise CIBC-mismatch warning for the fund
  const cibcWarns = data.issues.filter((i) => /stored CIBC daily returns of class H \(LDM202\) do not reproduce/.test(i.message));
  assert.equal(cibcWarns.length, 1);
  assert.match(cibcWarns[0].message, /on 1 of \d+ month\(s\) \(beyond 0\.2 bp; largest 2024-03: chain .* vs analytics .*\): the fund's CIBC months are not taken from the dataplatform/);
  // the same class published before and now gone: blocking alert (an approval item)
  const prevBuild = await build();
  const again = buildSiteData(await fetchAll({ fetchImpl: mockFetch(priceOnly).fetch, now: NOW, env: fixtureEnv() }), prevBuild.validated, NOW);
  assert.ok(again.context[SEB]!.alerts.some((a) => /class F \(LDM201\) not shown \(it was published before\)/.test(a)));
  assert.ok(!again.context[SEB]!.advisories?.length);
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

test("validation drops a class whose own numbers are implausible (also the default class F), never the fund", async () => {
  const { data, context } = await build();
  const bad = structuredClone(data);
  bad.funds[SEB]!.performanceByClass!.LDM201.performance.monthly[3].r = 0.9;
  const v = validateSite(bad, context, null, NOW).data;
  assert.equal(v.funds[SEB]!.performanceByClass!.LDM201, undefined, "class F dropped: the page says coming soon for it");
  assert.ok(v.funds[SEB]!.performanceByClass!.LDM202);
  assert.ok(v.funds[SEB]!.performance);
  assert.ok(v.issues.some((i) => i.level === "warn" && /LDM201/.test(i.key)));
});

test("a performance held by validation holds every class, never new classes next to an old headline; NAV and the rest still publish", async () => {
  const first = await build();
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

test("a failing headline class holds the performance (never dropped by the class gate alone); a stale variant is dropped", async () => {
  const first = await build();
  const previous = { ...structuredClone(first.validated), mode: "live" } as SiteData;
  const bad = structuredClone(first.data);
  // the headline class = the track record (class H for SEB), not the default class the page opens on
  const head = "LDM202";
  bad.funds[SEB]!.performanceByClass![head].performance.monthly[3].r = 0.9;
  const out = validateSite(bad, first.context, previous, NOW);
  const kept = out.data.funds[SEB]!;
  assert.ok(kept.performanceByClass![head], "headline class entry kept (held with the previous publication)");
  assert.deepEqual(kept.performanceByClass, previous.funds[SEB]!.performanceByClass);
  assert.ok(out.results.find((r) => r.fund === SEB)!.blocking.some((i) => i.key.endsWith(`classes.${head}`)));

  const g = await build();
  const old = structuredClone(g.data);
  const gv = old.funds[GMV]!;
  const stale = gv.variants!["3"].performance!;
  gv.variants!["3"] = { ...gv.variants!["3"], performance: { ...stale, asOf: "2026-07-31", monthly: stale.monthly.filter((m) => m.month <= "2026-07-31"), growth: stale.growth.filter((p) => p.date <= "2026-07-31") } };
  const v = validateSite(old, g.context, null, NOW).data.funds[GMV]!;
  assert.equal(v.variants!["3"], undefined, "a variant older than the fund's performance is not shown");
  assert.ok(v.variants!["9"]);
});

test("a class not launched yet (no own row up to the as-of): info only, no alert", async () => {
  const notYet = history("LDM201", (rows) => rows.filter((r) => (r.date as string) >= "2026-09-01"));
  const { data, context } = await build(notYet);
  assert.equal(data.funds[SEB]!.performanceByClass!.LDM201, undefined);
  assert.ok(data.issues.some((i) => i.level === "info" && /class F \(LDM201\): no computable month up to 2026-08 \(own data from 2026-09-01\)/.test(i.message)));
  assert.ok(!context[SEB]!.alerts.some((a) => /LDM201/.test(a)));
});
