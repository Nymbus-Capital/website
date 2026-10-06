/**
 * Performance class (Gabriel 2026-10-01: "Change SEB to Class F timeseries. If you showcase the class H timeseries,
 * then show class H."): the label shown is derived from the class of the data actually used, a series never mixes
 * classes, a change of the headline class needs an admin approval, and the factsheet is compared only with its own
 * class (by archive month). Since 2026-10-02 the SEB class F series is compounded by the website from its own daily
 * nav-timeseries chain (classes.test.ts); the headline (track record) stays class H. Synthetic fixtures only.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, cp, readFile, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildSiteData, classSpreadProblem, type BuildResult } from "../../../src/lib/pipeline/build.ts";
import { fetchAll } from "../../../src/lib/pipeline/sources/index.ts";
import { validateSite } from "../../../src/lib/pipeline/validate.ts";
import { factsheetClassAt } from "../../../src/lib/pipeline/fund-sources.ts";
import { fundWithClassLabel, perfClassCode, withClassLabel } from "../../../src/lib/pipeline/perf-class.ts";
import type { FundData, Performance, SiteData } from "../../../src/lib/data/types.ts";
import type { RawPayloads } from "../../../src/lib/pipeline/raw.ts";
import { FIXTURE_FACTSHEETS_DIR, fixtureEnv, json, loadFixture, mockFetch, type Route } from "../../fixtures/pipeline/mock-fetch.ts";
import { assertConfigUntouched, once } from "../../fixtures/pipeline/memo.ts";

const NOW = new Date("2026-09-29T14:00:00Z");
const SEB = "sustainable-enhanced-bonds" as const;

function fetchWith(env: Record<string, string | undefined>, routes: Route[]): Promise<RawPayloads> {
  return fetchAll({ fetchImpl: mockFetch(...routes).fetch, now: NOW, env: fixtureEnv({ PIPELINE_RETRY_BASE_MS: "0", ...env }) });
}
// the unaltered fixtures are fetched, built and validated once per file (pure); every caller gets its own deep copy
const baseRaw = once(() => fetchWith({}, []));
async function raw(env: Record<string, string | undefined> = {}, ...routes: Route[]): Promise<RawPayloads> {
  return Object.keys(env).length || routes.length ? fetchWith(env, routes) : baseRaw();
}
/** the unaltered fixtures, built with no previous publication */
const built: () => Promise<BuildResult> = once(async () => buildSiteData(await raw(), null, NOW));
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
const sebErrors = (d: SiteData) => sebIssues(d).filter((i) => i.level === "error");
/** a previous publication built (and validated) from the given routes */
async function publishedWith(routes: Route[]): Promise<SiteData> {
  const b = buildSiteData(await raw({}, ...routes), null, NOW);
  return validateSite(b.data, b.context, null, NOW).data;
}
const basePublished = once(() => publishedWith([]));
async function published(...routes: Route[]): Promise<SiteData> {
  return routes.length ? publishedWith(routes) : basePublished();
}
/** the SEB track-record answer of monthly-net-returns, changed by `edit` */
const sebMnr = (edit: (j: Record<string, unknown>) => Record<string, unknown>): Route => (u) =>
  (u.pathname === "/api/performance/monthly-net-returns" && u.searchParams.get("short_name") === "SEB" ? json(edit(loadFixture("dataplatform/mnr_SEB.json") as Record<string, unknown>)) : undefined);

/* ------------------------------------------------------------------ the headline is the track record, labelled by its class */

test("SEB headline: class H data (analytics + LDM202 chain + STRATEGY_H Apex months) labelled H; class F next to it", async () => {
  const { data, context } = await built();
  const p = data.funds[SEB]!.performance!;
  assert.equal(p.classCode, "STRATEGY_H");
  assert.equal(p.returnClass, "H");
  assert.equal(p.returnClassLabel, "Series H");
  assert.equal(p.firstMonth, "2019-02-28");
  assert.equal(p.asOf, "2026-08-31");
  assert.match(data.provenance[`funds.${SEB}.performance`], /every month class_code STRATEGY_H, shown as class H/);
  // the August archive (class H) is the same class: cross-checked
  assert.ok(context[SEB]!.factsheetTrailing);
  assert.equal(data.funds[SEB]!.performanceByClass!.LDM201.performance.returnClassLabel, "Series F");
  const v = validateSite(data, context, null, NOW);
  assert.equal(v.funds[SEB], "updated");
  assert.deepEqual(v.results.find((x) => x.fund === SEB)!.blocking, []);
  assert.deepEqual(v.classChanges, [], "nothing published before: no class change");
  assert.equal(data.funds["monthly-income"]!.performance!.returnClass, "FP");
  assert.equal(data.funds["multi-strategy"]!.performance!.returnClass, "F");
});

test("classSpreadProblem: class − track must stay in the fee band and near its median", () => {
  const h = { "2026-06-30": 0.001, "2026-07-31": -0.021831, "2026-08-31": 0.004 };
  const f = { "2026-06-30": 0.0021, "2026-07-31": -0.020667, "2026-08-31": 0.0051 }; // ≈ +11 to +11.6 bp
  assert.equal(classSpreadProblem(f, h), null);
  assert.match(classSpreadProblem({ ...f, "2026-08-31": 0.0091 }, h)!, /1 of 3 month\(s\) outside the fee band .*2026-08 51\.0 bp/);
  assert.match(classSpreadProblem({ ...f, "2026-06-30": 0.0001 }, h)!, /2026-06 -9\.0 bp/, "below −5 bp");
  assert.match(classSpreadProblem(f, {})!, /no month of the other class/);
  // all equal to H: 0 bp is inside [−5, +30] bp
  assert.equal(classSpreadProblem(h, h), null);
  // symmetric band (Monthly Income F vs FP)
  assert.equal(classSpreadProblem({ "2026-08-31": 0.0035 }, { "2026-08-31": 0.0038 }, { minDiff: -0.003, maxDiff: 0.003, maxFromMedian: 0.0005 }), null);
});

/* ------------------------------------------------------------------ identity and mixed classes */

test("the track-record answer must be the track-record class: another or a missing class_code withholds the performance", async () => {
  for (const [name, route, msg] of [
    ["class F answer", sebMnr((j) => ({ ...j, class_code: "STRATEGY" })), /monthly net returns SEB STRATEGY_H: class_code STRATEGY instead of STRATEGY_H: performance withheld/],
    ["no class_code", sebMnr(({ class_code: _drop, ...rest }) => rest), /monthly net returns SEB STRATEGY_H: class_code missing instead of STRATEGY_H: performance withheld/], // eslint-disable-line @typescript-eslint/no-unused-vars
    ["class_display of another class (a later dataplatform)", sebMnr((j) => ({ ...j, class_display: "F" })), /class_display F instead of H: performance withheld/],
    ["fundserv of another class", sebMnr((j) => ({ ...j, fundserv: "LDM201" })), /fundserv LDM201 instead of LDM202: performance withheld/],
  ] as [string, Route, RegExp][]) {
    const { data, context } = buildSiteData(await raw({}, route), null, NOW);
    assert.equal(data.funds[SEB]?.performance ?? null, null, `${name}: withheld rather than a mixed or mislabelled series`);
    assert.ok(sebErrors(data).some((i) => msg.test(i.message)), `${name}: ${JSON.stringify(sebErrors(data))}`);
    assert.ok(context[SEB]!.alerts.includes("no performance"), name);
  }
  // with a previous (class H) publication: that one is carried, labelled H
  const again = buildSiteData(await raw({}, sebMnr((j) => ({ ...j, class_code: "STRATEGY" }))), await published(), NOW);
  assert.equal(again.context[SEB]!.parts.performance, "carried");
  assert.equal(again.data.funds[SEB]!.performance!.classCode, "STRATEGY_H");
  assert.equal(again.data.funds[SEB]!.performance!.returnClass, "H");
});

test("a class history answering rows of another class is a failure, never compounded into this class", async () => {
  const other: Route = (u) => {
    if (u.pathname !== "/api/performance/nav-timeseries" || u.searchParams.get("fundserv") !== "LDM201") return undefined;
    const j = loadFixture("dataplatform/nav_history_LDM202.json") as Record<string, unknown>;
    return json(j);
  };
  const { data } = buildSiteData(await raw({}, other), null, NOW);
  assert.equal(data.funds[SEB]!.performanceByClass!.LDM201, undefined);
  assert.ok(data.issues.some((i) => i.key === `funds.${SEB}.performance.classes.LDM201` && /payload has a row of SEB LDM202/.test(i.message)), JSON.stringify(sebIssues(data).filter((i) => /classes/.test(i.key))));
});

test("validate: a performance whose label is not the label of its data's class is blocked", async () => {
  const b = await built();
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
    assert.equal(v.funds[SEB], "updated", "only the performance is held");
    assert.equal(v.data.funds[SEB]!.performance, null, "withheld rather than mislabelled");
    assert.equal(v.data.funds[SEB]!.risk, null);
    assert.ok(v.data.funds[SEB]!.nav, "NAV still published");
    assert.ok(v.data.issues.some((i) => i.key === `funds.${SEB}.performance` && /held back/.test(i.message)));
  }
  assert.equal(validateSite(b.data, b.context, null, NOW).funds["global-minimum-volatility"], "updated");
});

/* ------------------------------------------------------------------ factsheet: by archive month, same class only */

test("factsheet class by archive month: SEB archives up to 2026-07 are class F, later ones class H", () => {
  assert.equal(factsheetClassAt(SEB, "2026-06"), "STRATEGY");
  assert.equal(factsheetClassAt(SEB, "2026-07-31"), "STRATEGY");
  assert.equal(factsheetClassAt(SEB, "2026-08"), "STRATEGY_H");
  assert.equal(factsheetClassAt(SEB, "2027-01"), "STRATEGY_H");
  assert.equal(factsheetClassAt("monthly-income", "2026-08"), "STRATEGY");
  assert.equal(factsheetClassAt("global-minimum-volatility", "2026-08"), null);
});

test("factsheet cross-checks run only against an archive of the same class", async () => {
  const dir = await fsCopy();
  try {
    // August archive (class H): a published 1Y far from the series
    await editJson(path.join(dir, "bonds_data_2026-08.json"), (j) => { j["QCFI-SEB"]["Trailing Returns Net"]["Nymbus Sustainable Enhanced Bonds Fund"]["1Y"] = "9.9%"; });
    // July archive (class F): a monthly figure far from the series
    await editJson(path.join(dir, "bonds_data_2026-07.json"), (j) => { j["QCFI-SEB"]["Monthly Returns: Nymbus QCFI-SEB Net"]["2025"]["03-Mar"] = "4.0%"; });
    // class H: the August (same-class) archive contradicts August -> held at July; the July (class F) archive is ignored
    const h = buildSiteData(await raw({ FACTSHEET_DATA_DIR: dir }), null, NOW);
    assert.ok(sebErrors(h.data).some((i) => /2026-08 not published: factsheet bonds_data_2026-08\.json disagrees beyond tolerance \(1Y/.test(i.message)));
    assert.equal(h.data.funds[SEB]!.performance!.asOf, "2026-07-31");
    assert.equal(h.data.funds[SEB]!.performance!.returnClass, "H");
    assert.ok(!sebIssues(h.data).some((i) => /2025-03/.test(i.message) && !i.key.includes(".performance.classes.")), "class F archive never compared with class H");
    // the other funds keep their (same-class) cross-check
    assert.ok(h.context["monthly-income"]!.factsheetTrailing);
    assert.ok(h.context["multi-strategy"]!.factsheetTrailing);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("class H with only class F archives: not cross-checked with a factsheet (info: the factsheet is optional), never filled from class F", async () => {
  const dir = await fsCopy();
  try {
    await rm(path.join(dir, "bonds_data_2026-08.json"));
    const { data, context } = buildSiteData(await raw({ FACTSHEET_DATA_DIR: dir }), null, NOW);
    assert.equal(data.funds[SEB]!.performance!.returnClass, "H");
    assert.ok(sebIssues(data).some((i) => i.level === "info" && /no factsheet archive publishing class H \(STRATEGY_H\) returns with a monthly table/.test(i.message)));
    assert.deepEqual(context[SEB]!.alerts, [], "not an alert");
    assert.ok(!sebIssues(data).some((i) => /factsheet .* figures used/.test(i.message)), "never filled from a class F archive");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

/* ------------------------------------------------------------------ class change, carried and legacy publications */

test("class change F -> H (a publication of a class F headline, e.g. built from the unmerged PR #626): blocking, needs approval", async () => {
  const previous = structuredClone(await published());
  // the previous headline was class F (classCode STRATEGY), consistently labelled
  Object.assign(previous.funds[SEB]!.performance!, { classCode: "STRATEGY", returnClass: "F", returnClassLabel: "Series F" });
  const { data, context } = buildSiteData(await raw(), previous, NOW);
  assert.equal(data.funds[SEB]!.performance!.returnClass, "H");
  assert.deepEqual(context[SEB]!.revisions, [], "no revision list for a restatement under another class");
  const v = validateSite(data, context, previous, NOW);
  assert.deepEqual(v.classChanges, [SEB]);
  const r = v.results.find((x) => x.fund === SEB)!;
  assert.ok(r.blocking.some((i) => i.key === `funds.${SEB}.performance.class` && /class change from class F \(STRATEGY\) to class H \(STRATEGY_H\)/.test(i.message)));
  assert.ok(r.alerts.includes("performance class change to class H needs approval"));
  assert.equal(v.data.funds[SEB]!.performance!.returnClass, "H", "what an approval publishes");
  assert.equal(v.autoData.funds[SEB]!.performance!.returnClass, "F", "what may go live without a human");
  assert.match(v.autoData.provenance[`funds.${SEB}.performance`], /^carried over from the publication of/);
  assert.deepEqual(v.autoData.funds["monthly-income"], v.data.funds["monthly-income"], "other funds identical");
  // same class again: no change
  const same = buildSiteData(await raw(), v.data, NOW);
  assert.deepEqual(validateSite(same.data, same.context, v.data, NOW).classChanges, []);
});

test("legacy publication (before 2026-10-01: SEB class H labelled F) is relabelled by its data when carried or rendered", async () => {
  const previous = structuredClone(await published());
  for (const k of Object.keys(previous.funds) as (keyof SiteData["funds"])[]) delete previous.funds[k]!.performance?.classCode;
  previous.funds[SEB]!.performance!.returnClass = "F";
  previous.funds[SEB]!.performance!.returnClassLabel = "Series F";
  const down: Route = (u) => (u.pathname === "/api/performance/monthly-net-returns" && u.searchParams.get("short_name") === "SEB" ? json({ detail: "down" }, 500) : undefined);
  const empty = await mkdtemp(path.join(os.tmpdir(), "fs-empty-"));
  const b = buildSiteData(await raw({ ANALYTICS_RETURNS_FILE: "/nonexistent/fund_returns.json", FACTSHEET_DATA_DIR: empty }, down), previous, NOW);
  await rm(empty, { recursive: true, force: true });
  const carried = b.data.funds[SEB]!.performance!;
  assert.equal(b.context[SEB]!.parts.performance, "carried");
  assert.equal(carried.classCode, "STRATEGY_H");
  assert.equal(carried.returnClassLabel, "Series H");
  const d = structuredClone(b.data);
  d.funds[SEB]!.performance!.monthly[3].r = 0.9; // blocks the fund -> previous kept
  const v = validateSite(d, b.context, previous, NOW);
  assert.equal(v.funds[SEB], "updated", "NAV etc. fresh, only the performance is held");
  assert.equal(v.data.funds[SEB]!.performance!.returnClass, "H", "previous performance kept, relabelled by its data");
  assert.notEqual(v.data.funds[SEB]!.performance!.monthly[3].r, 0.9, "the blocked series is not published");
  // render-time (site.ts): same rule
  const legacy = previous.funds[SEB]!;
  const shown = fundWithClassLabel(legacy)!;
  assert.equal(shown.performance!.returnClassLabel, "Series H");
  assert.equal(legacy.performance!.returnClassLabel, "Series F", "input not mutated");
  assert.equal(withClassLabel("monthly-income", previous.funds["monthly-income"]!.performance)!.returnClassLabel, "Series FP");
  assert.equal(withClassLabel("multi-strategy", previous.funds["multi-strategy"]!.performance)!.returnClassLabel, "Series F");
  const gmv = previous.funds["global-minimum-volatility"]!.performance!;
  assert.equal(withClassLabel("global-minimum-volatility", gmv), gmv, "a strategy without classes is unchanged");
  const odd = fundWithClassLabel({ ...legacy, performance: { ...legacy.performance!, classCode: "STRATEGY_X" } } as FundData)!;
  assert.equal(odd.performance, null);
  assert.equal(odd.risk, null);
  assert.equal(perfClassCode(SEB, { classCode: "STRATEGY" }), "STRATEGY");
  assert.equal(perfClassCode(SEB, {}), "STRATEGY_H");
  // Monthly Income class F (LDM081): its own code and label
  assert.equal(withClassLabel("monthly-income", { ...previous.funds["monthly-income"]!.performance!, classCode: "LDM081" })!.returnClassLabel, "Series F");
});

/* ------------------------------------------------------------------ NAV class vs performance class */

test("NAV card and performance label are independent: SEB NAV LDM201 is class F (register) whatever the performance class", async () => {
  const { data } = await built();
  const f = data.funds[SEB]!;
  assert.equal(f.performance!.returnClass, "H");
  assert.equal(f.nav!.classes.find((c) => c.fundserv === "LDM201")!.display, "F", "NAV class label comes from the fund register, by FundServ code");
});

test("no test leaves the pipeline config mutated (memoised baselines stay valid)", () => {
  assertConfigUntouched();
});
