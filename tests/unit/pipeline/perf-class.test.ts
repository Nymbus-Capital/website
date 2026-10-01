/**
 * Performance class (Gabriel 2026-10-01: "Change SEB to Class F timeseries. If you showcase the class H timeseries,
 * then show class H."): the label shown is derived from the class of the data actually used, a series never mixes
 * classes, and the factsheet cross-checks are skipped only when the factsheet publishes another class.
 * Synthetic fixtures only (tests/fixtures/pipeline).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, cp, readFile, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildSiteData, fullHistoryProblem } from "../../../src/lib/pipeline/build.ts";
import { fetchAll } from "../../../src/lib/pipeline/sources/index.ts";
import { validateSite } from "../../../src/lib/pipeline/validate.ts";
import { fundWithClassLabel, perfClassCode, withClassLabel } from "../../../src/lib/pipeline/perf-class.ts";
import type { FundData, Performance, SiteData } from "../../../src/lib/data/types.ts";
import type { RawPayloads } from "../../../src/lib/pipeline/raw.ts";
import { FIXTURE_FACTSHEETS_DIR, fixtureEnv, fullHistoryRoute, json, loadFixture, mockFetch, type Route } from "../../fixtures/pipeline/mock-fetch.ts";

const NOW = new Date("2026-09-29T14:00:00Z");
const SEB = "sustainable-enhanced-bonds" as const;
const near = (a: number | null | undefined, b: number, eps = 1e-12): void => assert.ok(a != null && Math.abs(a - b) <= eps, `expected ${b}, got ${a}`);

async function raw(env: Record<string, string | undefined> = {}, ...routes: Route[]): Promise<RawPayloads> {
  return fetchAll({ fetchImpl: mockFetch(...routes).fetch, now: NOW, env: fixtureEnv(env) });
}
async function fsCopy(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "fs-class-"));
  await cp(FIXTURE_FACTSHEETS_DIR, dir, { recursive: true });
  return dir;
}
async function editJson(file: string, fn: (j: any) => void): Promise<void> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const j = JSON.parse(await readFile(file, "utf8"));
  fn(j);
  await writeFile(file, JSON.stringify(j));
}
const sebIssues = (d: SiteData) => d.issues.filter((i) => i.key.startsWith(`funds.${SEB}`));
const analyticsSeb = (month: string): number => {
  const an = loadFixture("analytics_fund_returns.json") as { dates: string[]; returns: Record<string, (number | null)[]> };
  return an.returns["Nymbus Sustainable Enhanced Bonds"][an.dates.indexOf(month)] as number;
};

/* ------------------------------------------------------------------ class F used and labelled F */

test("class F: a confirmed full-history STRATEGY response is the whole SEB series, labelled F, no analytics month", async () => {
  const r = await raw({}, fullHistoryRoute);
  const { data, context } = buildSiteData(r, null, NOW);
  const p = data.funds[SEB]!.performance!;
  assert.equal(p.classCode, "STRATEGY");
  assert.equal(p.returnClass, "F");
  assert.equal(p.returnClassLabel, "Series F");
  assert.equal(p.firstMonth, "2019-02-28");
  assert.equal(p.asOf, "2026-08-31");
  assert.equal(p.monthly.length, 91);
  // July 2026 is the class F dataplatform value (synthetic H + 0.0012), not the analytics (class H) value
  const jul = p.monthly.find((m) => m.month === "2026-07-31")!.r;
  near(jul, Math.round((analyticsSeb("2026-07-31") + 0.0012) * 1e8) / 1e8, 2e-6);
  assert.notEqual(jul, analyticsSeb("2026-07-31"));
  const prov = data.provenance[`funds.${SEB}.performance`];
  assert.doesNotMatch(prov, /analytics fund_returns/);
  assert.match(prov, /class_code STRATEGY history=full ready months \(91; sources apex, bridge, cibc\)/);
  assert.match(prov, /every month class_code STRATEGY, shown as class F/);
  assert.match(prov, /not cross-checked with factsheet bonds_data_2026-08\.json \(it publishes class H\)/);
  // the factsheet (class H) is not used for a cross-check: none reaches validate
  assert.equal(context[SEB]!.factsheetTrailing, null);
  assert.ok(sebIssues(data).some((i) => i.level === "info" && /publishes class H \(STRATEGY_H\), the site shows class F \(STRATEGY\): fund trailing, monthly table, value-added and statistics cross-checks skipped \(class mismatch\)/.test(i.message)));
  assert.ok(sebIssues(data).some((i) => i.level === "info" && /monthly table is neither compared nor used \(class mismatch\)/.test(i.message)));
  assert.deepEqual(sebIssues(data).filter((i) => i.level !== "info" && !/calendar\.2026\.index$/.test(i.key)), []);
  // every gate passes: published as is
  const v = validateSite(data, context, null, NOW);
  assert.equal(v.funds[SEB], "updated");
  assert.deepEqual(v.results.find((x) => x.fund === SEB)!.blocking, []);
  assert.deepEqual(v.results.find((x) => x.fund === SEB)!.alerts, []);
  // other funds unchanged by the SEB-only preference
  assert.equal(data.funds["monthly-income"]!.performance!.returnClass, "FP");
  assert.equal(data.funds["multi-strategy"]!.performance!.returnClass, "F");
});

/* ------------------------------------------------------------------ class H fallback labelled H */

test("class H fallback: an unconfirmed class F answer keeps today's class H sources and labels them H", async () => {
  const full = loadFixture("dataplatform/mnr_SEB_STRATEGY_full.json") as { rows: { month: string; status: string; net_return: number | null; source?: string }[]; history?: string };
  const cases: [string, Route, RegExp][] = [
    // a server honouring class_code but not history: Apex-only class F months
    ["apex only", (u) => (u.searchParams.get("history") === "full" ? json({ ...full, history: undefined, rows: full.rows.map((x) => (x.month >= "2026-08-31" ? x : { ...x, status: "unavailable", net_return: null })) }) : undefined), /first ready month 2026-08, track record starts 2019-02/],
    // a server that says it served another history
    ["history apex", (u) => (u.searchParams.get("history") === "full" ? json({ ...full, history: "apex" }) : undefined), /answered history "apex" instead of "full"/],
    // the full-history call fails
    ["5xx", (u) => (u.searchParams.get("history") === "full" ? json({ detail: "boom" }, 500) : undefined), /full history not used: unavailable \(monthly-net-returns SEB STRATEGY history=full: HTTP 500/],
  ];
  for (const [name, route, why] of cases) {
    const { data, context } = buildSiteData(await raw({ PIPELINE_RETRY_BASE_MS: "0" }, route), null, NOW);
    const p = data.funds[SEB]!.performance!;
    assert.equal(p.classCode, "STRATEGY_H", name);
    assert.equal(p.returnClass, "H", name);
    assert.equal(p.returnClassLabel, "Series H", name);
    assert.equal(p.monthly.find((m) => m.month === "2026-07-31")!.r, analyticsSeb("2026-07-31"), `${name}: analytics (class H) month`);
    assert.ok(sebIssues(data).some((i) => i.level === "info" && why.test(i.message)), `${name}: ${JSON.stringify(sebIssues(data).map((i) => i.message))}`);
    assert.ok(context[SEB]!.factsheetTrailing, `${name}: class H factsheet cross-checked`);
    assert.equal(validateSite(data, context, null, NOW).funds[SEB], "updated", name);
  }
});

test("fullHistoryProblem: class, history and first ready month are all required", () => {
  const ok = { ok: true, data: { as_of: "x", class_code: "STRATEGY", history: "full", rows: [{ month: "2019-02-28", net_return: 0.01, status: "ready" }] } };
  assert.equal(fullHistoryProblem(ok, "STRATEGY", "2019-02-28"), null);
  assert.equal(fullHistoryProblem({ ...ok, data: { ...ok.data, history: undefined } }, "STRATEGY", "2019-02-28"), null, "rows prove the full history");
  assert.match(fullHistoryProblem({ ...ok, data: { ...ok.data, class_code: "STRATEGY_H" } }, "STRATEGY", "2019-02-28")!, /answered class STRATEGY_H/);
  assert.match(fullHistoryProblem({ ...ok, data: { ...ok.data, class_code: undefined } }, "STRATEGY", "2019-02-28")!, /answered class unknown/);
  assert.match(fullHistoryProblem({ ...ok, data: { ...ok.data, rows: [{ month: "2019-02-28", net_return: null, status: "unavailable" }] } }, "STRATEGY", "2019-02-28")!, /no ready month/);
  assert.match(fullHistoryProblem({ ok: false, data: null, error: "e" }, "STRATEGY", "2019-02-28")!, /unavailable \(e\)/);
  assert.match(fullHistoryProblem(undefined, "STRATEGY", "2019-02-28")!, /not fetched/);
});

/* ------------------------------------------------------------------ mixed classes blocked */

test("mixed classes: class F dataplatform months on top of class H analytics are never published", async () => {
  // the track-record request answered with class F Apex months (e.g. a server whose default class changed)
  const fApex: Route = (u) => {
    if (u.pathname !== "/api/performance/monthly-net-returns" || u.searchParams.get("short_name") !== "SEB" || u.searchParams.get("history")) return undefined;
    const j = loadFixture("dataplatform/mnr_SEB.json") as { rows: unknown[] };
    return json({ ...j, class_code: "STRATEGY" });
  };
  const { data, context } = buildSiteData(await raw({}, fApex), null, NOW);
  assert.equal(data.funds[SEB]?.performance ?? null, null, "withheld rather than a mixed series");
  assert.ok(sebIssues(data).some((i) => i.level === "error" && /months of different classes in one series \(class H \(STRATEGY_H\): 2019-02 to 2026-07; class F \(STRATEGY\): 2026-08\): performance withheld/.test(i.message)), JSON.stringify(sebIssues(data)));
  assert.ok(context[SEB]!.alerts.includes("no performance"));

  // with a previous (class H) publication: that one is carried, labelled H
  const prevB = buildSiteData(await raw(), null, NOW);
  const previous = validateSite(prevB.data, prevB.context, null, NOW).data;
  const again = buildSiteData(await raw({}, fApex), previous, NOW);
  const carried = again.data.funds[SEB]!.performance!;
  assert.equal(again.context[SEB]!.parts.performance, "carried");
  assert.equal(carried.classCode, "STRATEGY_H");
  assert.equal(carried.returnClass, "H");
});

test("mixed classes: a month of unknown class (no class_code in the response) blocks the series", async () => {
  const noClass: Route = (u) => {
    if (u.pathname !== "/api/performance/monthly-net-returns" || u.searchParams.get("short_name") !== "SEB" || u.searchParams.get("history")) return undefined;
    const j = loadFixture("dataplatform/mnr_SEB.json") as Record<string, unknown>;
    const { class_code: _drop, ...rest } = j; // eslint-disable-line @typescript-eslint/no-unused-vars
    return json(rest);
  };
  const { data } = buildSiteData(await raw({}, noClass), null, NOW);
  assert.equal(data.funds[SEB]?.performance ?? null, null);
  assert.ok(sebIssues(data).some((i) => i.level === "error" && /different classes in one series .*unknown class: 2026-08/.test(i.message)));
});

test("mixed classes: the class H factsheet never fills a gap of the class F series", async () => {
  // class F full history with one month missing: the (class H) factsheet table must not fill it
  const full = loadFixture("dataplatform/mnr_SEB_STRATEGY_full.json") as { rows: { month: string }[] };
  const gap: Route = (u) => (u.searchParams.get("history") === "full"
    ? json({ ...full, rows: full.rows.map((x) => (x.month === "2026-06-30" ? { ...x, status: "unavailable", net_return: null } : x)) })
    : undefined);
  const { data } = buildSiteData(await raw({}, gap), null, NOW);
  assert.equal(data.funds[SEB]?.performance ?? null, null, "a 2019-02..2026-05 record cannot reach the as-of");
  assert.ok(sebIssues(data).some((i) => i.level === "error" && /track record interrupted after 2026-05: 2026-06 missing from every source/.test(i.message)));
  assert.ok(!sebIssues(data).some((i) => /factsheet .* figures used/.test(i.message)), "no factsheet month used");
});

test("validate: a performance whose label is not the label of its data's class is blocked", async () => {
  const b = buildSiteData(await raw(), null, NOW);
  for (const mutate of [
    (p: Performance) => { p.returnClass = "F"; p.returnClassLabel = "Series F"; }, // class H data labelled F (the pre-2026-10-01 bug)
    (p: Performance) => { delete p.classCode; },
    (p: Performance) => { p.classCode = "STRATEGY_X"; },
  ]) {
    const d = structuredClone(b.data);
    mutate(d.funds[SEB]!.performance!);
    const v = validateSite(d, b.context, null, NOW);
    const r = v.results.find((x) => x.fund === SEB)!;
    assert.ok(r.blocking.some((i) => i.key === `funds.${SEB}.performance.class`), JSON.stringify(r.blocking));
    assert.equal(v.funds[SEB], "unavailable");
  }
  // GMV (no class) is not concerned
  assert.equal(validateSite(b.data, b.context, null, NOW).funds["global-minimum-volatility"], "updated");
});

/* ------------------------------------------------------------------ cross-checks skipped only on a class mismatch */

test("factsheet cross-check: skipped for class F vs a class H factsheet, kept (and blocking) for class H", async () => {
  const dir = await fsCopy();
  try {
    // a published 1Y far from both series
    await editJson(path.join(dir, "bonds_data_2026-08.json"), (j) => { j["QCFI-SEB"]["Trailing Returns Net"]["Nymbus Sustainable Enhanced Bonds Fund"]["1Y"] = "9.9%"; });
    const h = buildSiteData(await raw({ FACTSHEET_DATA_DIR: dir }), null, NOW);
    // class H: the same-class factsheet contradicts August -> August not published (kept at July, as before this change)
    assert.ok(sebIssues(h.data).some((i) => i.level === "error" && /2026-08 not published: factsheet bonds_data_2026-08\.json disagrees beyond tolerance \(1Y/.test(i.message)));
    assert.equal(h.data.funds[SEB]!.performance!.asOf, "2026-07-31");
    assert.equal(h.data.funds[SEB]!.performance!.returnClass, "H");

    const f = buildSiteData(await raw({ FACTSHEET_DATA_DIR: dir }, fullHistoryRoute), null, NOW);
    assert.equal(f.data.funds[SEB]!.performance!.asOf, "2026-08-31", "class F is not compared with the class H factsheet");
    assert.equal(f.data.funds[SEB]!.performance!.returnClass, "F");
    assert.ok(!sebIssues(f.data).some((i) => i.level === "error"));
    assert.equal(validateSite(f.data, f.context, null, NOW).funds[SEB], "updated");
    // the other funds keep their (same-class) cross-check
    assert.ok(f.context["monthly-income"]!.factsheetTrailing);
    assert.ok(f.context["multi-strategy"]!.factsheetTrailing);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("factsheet timing gate kept for class F: a new month still waits for its factsheet", async () => {
  const dir = await fsCopy();
  try {
    await rm(path.join(dir, "bonds_data_2026-08.json"));
    const { data } = buildSiteData(await raw({ FACTSHEET_DATA_DIR: dir }, fullHistoryRoute), null, NOW, { requireFactsheetForNewMonth: true });
    const p = data.funds[SEB]!.performance!;
    assert.equal(p.asOf, "2026-07-31", "August held until its factsheet exists");
    assert.equal(p.returnClass, "F");
    assert.ok(sebIssues(data).some((i) => /2026-08 not published yet: waiting for the factsheet of 2026-08/.test(i.message)));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

/* ------------------------------------------------------------------ class change, carried and legacy publications */

test("class change H -> F: one warn + alert instead of a revision per month", async () => {
  const prevB = buildSiteData(await raw(), null, NOW);
  const previous = validateSite(prevB.data, prevB.context, null, NOW).data;
  const { data, context } = buildSiteData(await raw({}, fullHistoryRoute), previous, NOW);
  assert.equal(data.funds[SEB]!.performance!.returnClass, "F");
  assert.deepEqual(context[SEB]!.revisions, []);
  assert.ok(context[SEB]!.alerts.includes("performance class changed to class F"));
  assert.ok(sebIssues(data).some((i) => i.level === "warn" && /class changed from class H \(STRATEGY_H\) to class F \(STRATEGY\): every published month is restated and relabelled/.test(i.message)));
  // same class again: no class-change issue
  const same = buildSiteData(await raw({}, fullHistoryRoute), validateSite(data, context, previous, NOW).data, NOW);
  assert.ok(!same.context[SEB]!.alerts.some((a) => /class changed/.test(a)));
});

test("legacy publication (before 2026-10-01: SEB class H labelled F) is relabelled by its data when carried or rendered", async () => {
  const prevB = buildSiteData(await raw(), null, NOW);
  const previous = structuredClone(validateSite(prevB.data, prevB.context, null, NOW).data);
  // what the site published before this change
  for (const k of Object.keys(previous.funds) as (keyof SiteData["funds"])[]) delete previous.funds[k]!.performance?.classCode;
  previous.funds[SEB]!.performance!.returnClass = "F";
  previous.funds[SEB]!.performance!.returnClassLabel = "Series F";
  // SEB performance sources all fail -> carried
  const down: Route = (u) => (u.pathname === "/api/performance/monthly-net-returns" && u.searchParams.get("short_name") === "SEB" ? json({ detail: "down" }, 500) : undefined);
  const empty = await mkdtemp(path.join(os.tmpdir(), "fs-empty-"));
  const b = buildSiteData(await raw({ ANALYTICS_RETURNS_FILE: "/nonexistent/fund_returns.json", FACTSHEET_DATA_DIR: empty, PIPELINE_RETRY_BASE_MS: "0" }, down), previous, NOW);
  await rm(empty, { recursive: true, force: true });
  const carried = b.data.funds[SEB]!.performance!;
  assert.equal(b.context[SEB]!.parts.performance, "carried");
  assert.equal(carried.classCode, "STRATEGY_H");
  assert.equal(carried.returnClassLabel, "Series H");
  // a whole fund kept from the previous publication by validate is relabelled as well
  const d = structuredClone(b.data);
  d.funds[SEB]!.performance!.monthly[3].r = 0.9; // blocks the fund -> previous kept
  const v = validateSite(d, b.context, previous, NOW);
  assert.equal(v.funds[SEB], "kept-previous");
  assert.equal(v.data.funds[SEB]!.performance!.returnClass, "H");

  // render-time (site.ts): same rule
  const legacy = previous.funds[SEB]!;
  const shown = fundWithClassLabel(legacy)!;
  assert.equal(shown.performance!.returnClassLabel, "Series H");
  assert.equal(legacy.performance!.returnClassLabel, "Series F", "input not mutated");
  assert.equal(withClassLabel("monthly-income", previous.funds["monthly-income"]!.performance)!.returnClassLabel, "Series FP");
  assert.equal(withClassLabel("multi-strategy", previous.funds["multi-strategy"]!.performance)!.returnClassLabel, "Series F");
  const gmv = previous.funds["global-minimum-volatility"]!.performance!;
  assert.equal(withClassLabel("global-minimum-volatility", gmv), gmv, "a strategy without classes is unchanged");
  // an unknown class is never shown: performance and risk dropped
  const odd = fundWithClassLabel({ ...legacy, performance: { ...legacy.performance!, classCode: "STRATEGY_X" } } as FundData)!;
  assert.equal(odd.performance, null);
  assert.equal(odd.risk, null);
  assert.equal(perfClassCode(SEB, { classCode: "STRATEGY" }), "STRATEGY");
  assert.equal(perfClassCode(SEB, {}), "STRATEGY_H");
});

/* ------------------------------------------------------------------ NAV class vs performance class */

test("NAV card and performance label are independent: SEB NAV LDM201 is class F (register) whatever the performance class", async () => {
  for (const [routes, perf] of [[[], "H"], [[fullHistoryRoute], "F"]] as [Route[], string][]) {
    const { data } = buildSiteData(await raw({}, ...routes), null, NOW);
    const f = data.funds[SEB]!;
    assert.equal(f.performance!.returnClass, perf);
    const ldm201 = f.nav!.classes.find((c) => c.fundserv === "LDM201")!;
    assert.equal(ldm201.display, "F", "NAV class label comes from the fund register, by FundServ code");
  }
});
