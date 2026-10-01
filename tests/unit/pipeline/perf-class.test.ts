/**
 * Performance class (Gabriel 2026-10-01: "Change SEB to Class F timeseries. If you showcase the class H timeseries,
 * then show class H."): the label shown is derived from the class of the data actually used, a series never mixes
 * classes, SEB class F is used only when complete, identified and within the fee band of class H, a published class
 * F is never replaced by class H because of a source problem, and the factsheet is compared only with its own class
 * (by archive month). Synthetic fixtures only (tests/fixtures/pipeline).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, cp, readFile, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildSiteData, classSpreadProblem, fullHistoryProblem } from "../../../src/lib/pipeline/build.ts";
import { fetchAll } from "../../../src/lib/pipeline/sources/index.ts";
import { validateSite } from "../../../src/lib/pipeline/validate.ts";
import { factsheetClassAt } from "../../../src/lib/pipeline/fund-sources.ts";
import { fundWithClassLabel, perfClassCode, withClassLabel } from "../../../src/lib/pipeline/perf-class.ts";
import type { FundData, Performance, SiteData } from "../../../src/lib/data/types.ts";
import type { RawPayloads } from "../../../src/lib/pipeline/raw.ts";
import { FIXTURE_FACTSHEETS_DIR, fixtureEnv, fullHistoryRoute, json, loadFixture, mockFetch, type Route } from "../../fixtures/pipeline/mock-fetch.ts";

const NOW = new Date("2026-09-29T14:00:00Z");
const SEB = "sustainable-enhanced-bonds" as const;
const near = (a: number | null | undefined, b: number, eps = 1e-12): void => assert.ok(a != null && Math.abs(a - b) <= eps, `expected ${b}, got ${a}`);

async function raw(env: Record<string, string | undefined> = {}, ...routes: Route[]): Promise<RawPayloads> {
  return fetchAll({ fetchImpl: mockFetch(...routes).fetch, now: NOW, env: fixtureEnv({ PIPELINE_RETRY_BASE_MS: "0", ...env }) });
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
const sebErrors = (d: SiteData) => sebIssues(d).filter((i) => i.level === "error");
const analyticsSeb = (month: string): number => {
  const an = loadFixture("analytics_fund_returns.json") as { dates: string[]; returns: Record<string, (number | null)[]> };
  return an.returns["Nymbus Sustainable Enhanced Bonds"][an.dates.indexOf(month)] as number;
};
type FullRow = { month: string; status: string; net_return: number | null; source: string; issue: string | null };
type Full = { rows: FullRow[]; [k: string]: unknown };
const FULL = (): Full => structuredClone(loadFixture("dataplatform/mnr_SEB_STRATEGY_full.json") as Full);
/** the PR #626 server, with the class F full-history answer changed by `edit` */
const fullWith = (edit: (j: Full) => void): Route => (u) => {
  if (u.pathname !== "/api/performance/monthly-net-returns" || u.searchParams.get("history") !== "full") return undefined;
  const j = FULL();
  edit(j);
  return json(j);
};
const unavailable = (month: string, issue: string) => (j: Full) => {
  Object.assign(j.rows.find((r) => r.month === month)!, { status: "unavailable", net_return: null, issue });
};
/** a previous publication built (and validated) from the given routes */
async function published(...routes: Route[]): Promise<SiteData> {
  const b = buildSiteData(await raw({}, ...routes), null, NOW);
  return validateSite(b.data, b.context, null, NOW).data;
}

/* ------------------------------------------------------------------ class F used and labelled F */

test("class F: a confirmed, complete full-history answer is the whole SEB series, labelled F, no analytics month", async () => {
  const { data, context } = buildSiteData(await raw({}, fullHistoryRoute), null, NOW);
  const p = data.funds[SEB]!.performance!;
  assert.equal(p.classCode, "STRATEGY");
  assert.equal(p.returnClass, "F");
  assert.equal(p.returnClassLabel, "Series F");
  assert.equal(p.firstMonth, "2019-02-28");
  assert.equal(p.asOf, "2026-08-31");
  assert.equal(p.monthly.length, 91);
  // July 2026 is the class F bridge month (synthetic H + 0.0012), not the analytics (class H) value
  const jul = p.monthly.find((m) => m.month === "2026-07-31")!.r;
  near(jul, Math.round((analyticsSeb("2026-07-31") + 0.0012) * 1e8) / 1e8, 2e-6);
  const prov = data.provenance[`funds.${SEB}.performance`];
  assert.doesNotMatch(prov, /analytics fund_returns/);
  assert.match(prov, /monthly-net-returns SEB class_code STRATEGY history=full \(sources apex, bridge, cibc\) ready months \(91\)/);
  assert.match(prov, /every month class_code STRATEGY, shown as class F/);
  assert.match(prov, /not cross-checked with factsheet bonds_data_2026-08\.json \(it publishes class H\)/);
  // August archive (class H): no trailing cross-check reaches validate; the July archive (class F) is the monthly table compared
  assert.equal(context[SEB]!.factsheetTrailing, null);
  assert.ok(sebIssues(data).some((i) => i.level === "info" && /bonds_data_2026-08\.json publishes class H \(STRATEGY_H\) returns, the series is class F \(STRATEGY\): its monthly table is neither compared nor used \(class mismatch\); bonds_data_2026-07\.json used instead/.test(i.message)));
  assert.ok(sebIssues(data).some((i) => i.level === "info" && /fee band vs class H \(STRATEGY_H\) checked on 91 month\(s\)/.test(i.message)));
  assert.deepEqual(sebIssues(data).filter((i) => i.level !== "info" && !/calendar\.2026\.index$/.test(i.key)), []);
  const v = validateSite(data, context, null, NOW);
  assert.equal(v.funds[SEB], "updated");
  assert.deepEqual(v.results.find((x) => x.fund === SEB)!.blocking, []);
  assert.deepEqual(v.results.find((x) => x.fund === SEB)!.alerts, []);
  assert.deepEqual(v.classChanges, [], "nothing published before: no class change");
  // other funds unchanged by the SEB-only preference
  assert.equal(data.funds["monthly-income"]!.performance!.returnClass, "FP");
  assert.equal(data.funds["multi-strategy"]!.performance!.returnClass, "F");
});

/* ------------------------------------------------------------------ class H fallback labelled H */

test("class H fallback: an unconfirmed class F answer keeps today's class H sources and labels them H", async () => {
  const cases: [string, Route[], RegExp][] = [
    ["server before PR #626 (parameters ignored)", [], /answered class STRATEGY_H instead of STRATEGY \(parameter not supported yet\)/],
    ["class starts after the track record", [fullWith((j) => { j.rows = j.rows.filter((r) => r.month >= "2023-08-31"); }), fullHistoryRoute], /first ready month 2023-08, track record starts 2019-02/],
    ["history apex", [fullWith((j) => { j.history = "apex"; }), fullHistoryRoute], /answered history "apex" instead of "full"/],
    ["5xx", [(u) => (u.searchParams.get("history") === "full" ? json({ detail: "boom" }, 500) : undefined), fullHistoryRoute], /full history not used: unavailable \(monthly-net-returns SEB STRATEGY history=full: HTTP 500/],
    // dataplatform: the bridge month cannot be computed -> class F is not continuous through the class H last month
    ["July bridge unavailable", [fullWith(unavailable("2026-07-31", "CIBC 2026-06 month-end NAV per unit missing")), fullHistoryRoute], /ready and continuous only through 2026-06, 2026-08 needed \(track record interrupted after 2026-06: 2026-07 missing from every source \(dataplatform: unavailable \(CIBC 2026-06 month-end NAV per unit missing\)\)/],
    ["one CIBC month unavailable (2019-03)", [fullWith(unavailable("2019-03-31", "conflict")), fullHistoryRoute], /ready and continuous only through 2019-02, 2026-08 needed/],
  ];
  for (const [name, routes, why] of cases) {
    const { data, context } = buildSiteData(await raw({}, ...routes), null, NOW);
    const p = data.funds[SEB]!.performance;
    assert.ok(p, `${name}: falls back to class H, not withheld: ${JSON.stringify(sebErrors(data))}`);
    assert.equal(p.classCode, "STRATEGY_H", name);
    assert.equal(p.returnClass, "H", name);
    assert.equal(p.returnClassLabel, "Series H", name);
    assert.equal(p.asOf, "2026-08-31", `${name}: not stalled`);
    assert.equal(p.monthly.find((m) => m.month === "2026-07-31")!.r, analyticsSeb("2026-07-31"), `${name}: analytics (class H) month`);
    assert.ok(sebIssues(data).some((i) => i.level === "info" && why.test(i.message)), `${name}: ${JSON.stringify(sebIssues(data).map((i) => i.message))}`);
    assert.deepEqual(sebErrors(data), [], `${name}: the class F problems are not the run's errors`);
    assert.ok(context[SEB]!.factsheetTrailing, `${name}: class H (August) factsheet cross-checked`);
    assert.equal(validateSite(data, context, null, NOW).funds[SEB], "updated", name);
  }
  // with a previous class H publication: same
  const prev = await published();
  const again = buildSiteData(await raw({}, fullWith(unavailable("2026-07-31", "x")), fullHistoryRoute), prev, NOW);
  assert.equal(again.data.funds[SEB]!.performance!.returnClass, "H");
  assert.equal(again.context[SEB]!.parts.performance, "fresh", "rebuilt from class H, not carried");
});

test("fullHistoryProblem: class, history, identity (payload and register) and first ready month", () => {
  const data = { as_of: "x", class_code: "STRATEGY", class_display: "F", fundserv: "LDM201", history: "full", rows: [{ month: "2019-02-28", net_return: 0.01, status: "ready" }] };
  const ok = { ok: true, data };
  const id = { display: "F", fundserv: "LDM201", register: [{ fundserv: "LDM201", display: "F" }, { fundserv: "LDM202", display: "H" }] };
  assert.equal(fullHistoryProblem(ok, "STRATEGY", "2019-02-28", id), null);
  assert.equal(fullHistoryProblem({ ok: true, data: { ...data, history: undefined } }, "STRATEGY", "2019-02-28", id), null, "rows prove the full history");
  assert.deepEqual(fullHistoryProblem({ ok: true, data: { ...data, class_code: "STRATEGY_H" } }, "STRATEGY", "2019-02-28", id)?.kind, "unconfirmed");
  assert.match(fullHistoryProblem({ ok: true, data: { ...data, class_code: undefined } }, "STRATEGY", "2019-02-28", id)!.why, /answered class unknown/);
  assert.match(fullHistoryProblem({ ok: true, data: { ...data, rows: [{ month: "2019-02-28", net_return: null, status: "unavailable" }] } }, "STRATEGY", "2019-02-28", id)!.why, /no ready month/);
  assert.match(fullHistoryProblem({ ok: false, data: null, error: "e" }, "STRATEGY", "2019-02-28", id)!.why, /unavailable \(e\)/);
  assert.match(fullHistoryProblem(undefined, "STRATEGY", "2019-02-28", id)!.why, /not fetched/);
  // identity: blocks (kind "identity"), never a fallback
  assert.deepEqual(fullHistoryProblem({ ok: true, data: { ...data, class_display: "H" } }, "STRATEGY", "2019-02-28", id), { kind: "identity", why: "class_display H instead of F" });
  assert.deepEqual(fullHistoryProblem({ ok: true, data: { ...data, class_display: undefined } }, "STRATEGY", "2019-02-28", id), { kind: "identity", why: "class_display missing instead of F" });
  assert.deepEqual(fullHistoryProblem({ ok: true, data: { ...data, fundserv: "LDM202" } }, "STRATEGY", "2019-02-28", id), { kind: "identity", why: "fundserv LDM202 instead of LDM201" });
  assert.deepEqual(fullHistoryProblem(ok, "STRATEGY", "2019-02-28", { ...id, register: [{ fundserv: "LDM201", display: "A" }] }), { kind: "identity", why: "the fund register has class A for LDM201" });
  assert.deepEqual(fullHistoryProblem(ok, "STRATEGY", "2019-02-28", { ...id, register: [] }), { kind: "identity", why: "the fund register has no class for LDM201" });
  assert.equal(fullHistoryProblem(ok, "STRATEGY", "2019-02-28", { ...id, register: null }), null, "register unavailable: configuration only");
});

/* ------------------------------------------------------------------ independent gates of class F */

test("classSpreadProblem: F − H must stay in the fee band and near its median", () => {
  const h = { "2026-06-30": 0.001, "2026-07-31": -0.021831, "2026-08-31": 0.004 };
  const f = { "2026-06-30": 0.0021, "2026-07-31": -0.020667, "2026-08-31": 0.0051 }; // ≈ +11 to +11.6 bp
  assert.equal(classSpreadProblem(f, h), null);
  assert.match(classSpreadProblem({ ...f, "2026-08-31": 0.0091 }, h)!, /1 of 3 month\(s\) outside the fee band .*2026-08 51\.0 bp/);
  assert.match(classSpreadProblem({ ...f, "2026-06-30": 0.0001 }, h)!, /2026-06 -9\.0 bp/, "below −5 bp");
  assert.match(classSpreadProblem(f, {})!, /no month of the other class/);
  // all equal to H: 0 bp is inside [−5, +30] bp
  assert.equal(classSpreadProblem(h, h), null);
});

test("class F blocked (previous publication kept) on a fee-band breach or an identity mismatch, never a silent switch", async () => {
  const blocks: [string, Route, RegExp][] = [
    ["fee band", fullWith((j) => { const r = j.rows.find((x) => x.month === "2024-03-31")!; r.net_return = (r.net_return as number) + 0.01; }), /class F \(STRATEGY\) vs class H \(STRATEGY_H\): 1 of 91 month\(s\) outside the fee band .*2024-03 .*performance withheld \(independent fee-band gate\)/],
    ["class_display", fullWith((j) => { j.class_display = "H"; }), /class F \(STRATEGY\) answer names another series \(class_display H instead of F\): performance withheld/],
    ["fundserv", fullWith((j) => { j.fundserv = "LDM202"; }), /answer names another series \(fundserv LDM202 instead of LDM201\)/],
  ];
  const prev = await published();
  for (const [name, route, msg] of blocks) {
    const fresh = buildSiteData(await raw({}, route, fullHistoryRoute), null, NOW);
    assert.equal(fresh.data.funds[SEB]?.performance ?? null, null, `${name}: withheld`);
    assert.ok(sebErrors(fresh.data).some((i) => msg.test(i.message)), `${name}: ${JSON.stringify(sebErrors(fresh.data))}`);
    const kept = buildSiteData(await raw({}, route, fullHistoryRoute), prev, NOW);
    assert.equal(kept.context[SEB]!.parts.performance, "carried", name);
    assert.equal(kept.data.funds[SEB]!.performance!.returnClass, "H", `${name}: previous (class H) publication kept`);
  }
  // the fund register names another class for LDM201
  const reg: Route = (u) => {
    if (u.pathname !== "/api/apex/funds") return undefined;
    const funds = loadFixture("dataplatform/apex_funds.json") as { key: string; classes: { fundserv: string; display: string }[] }[];
    funds.find((f) => f.key === "sustainable_enhanced_bonds")!.classes.find((k) => k.fundserv === "LDM201")!.display = "I";
    return json(funds);
  };
  const r = buildSiteData(await raw({}, reg, fullHistoryRoute), null, NOW);
  assert.equal(r.data.funds[SEB]?.performance ?? null, null);
  assert.ok(sebErrors(r.data).some((i) => /the fund register has class I for LDM201/.test(i.message)));
  // the class H (track-record) answer naming another series blocks too
  const hId: Route = (u) => (u.pathname === "/api/performance/monthly-net-returns" && u.searchParams.get("short_name") === "SEB" && !u.searchParams.get("history")
    ? json({ ...(loadFixture("dataplatform/mnr_SEB.json") as object), class_display: "F" }) : undefined);
  const h = buildSiteData(await raw({}, hId), null, NOW);
  assert.equal(h.data.funds[SEB]?.performance ?? null, null);
  assert.ok(sebErrors(h.data).some((i) => /monthly net returns SEB STRATEGY_H: class_display F instead of H: performance withheld/.test(i.message)));
});

/* ------------------------------------------------------------------ no flip-flop */

test("class F published: a failed, unconfirmed or incomplete class F answer keeps the class F publication, never class H", async () => {
  const prevF = await published(fullHistoryRoute);
  assert.equal(prevF.funds[SEB]!.performance!.returnClass, "F");
  for (const [name, route] of [
    ["5xx", (u: URL) => (u.searchParams.get("history") === "full" ? json({ detail: "boom" }, 500) : undefined)],
    ["parameters ignored", (u: URL) => (u.searchParams.get("history") === "full" ? json(loadFixture("dataplatform/mnr_SEB.json")) : undefined)],
    ["bridge unavailable", fullWith(unavailable("2026-07-31", "x"))],
  ] as [string, Route][]) {
    const b = buildSiteData(await raw({}, route, fullHistoryRoute), prevF, NOW);
    const p = b.data.funds[SEB]!.performance!;
    assert.equal(b.context[SEB]!.parts.performance, "carried", name);
    assert.equal(p.classCode, "STRATEGY", name);
    assert.equal(p.returnClass, "F", name);
    assert.ok(sebErrors(b.data).some((i) => /full history not usable .*the published class F \(STRATEGY\) performance is kept \(never replaced by class H \(STRATEGY_H\) because of a source problem\)/.test(i.message)), `${name}: ${JSON.stringify(sebErrors(b.data))}`);
    assert.ok(b.context[SEB]!.alerts.includes("performance carried over"), name);
    assert.deepEqual(validateSite(b.data, b.context, prevF, NOW).classChanges, [], `${name}: no class change`);
  }
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
  assert.ok(sebErrors(data).some((i) => /months of different classes in one series \(class H \(STRATEGY_H\): 2019-02 to 2026-07; class F \(STRATEGY\): 2026-08\): performance withheld/.test(i.message)), JSON.stringify(sebIssues(data)));
  assert.ok(context[SEB]!.alerts.includes("no performance"));
  // with a previous (class H) publication: that one is carried, labelled H
  const again = buildSiteData(await raw({}, fApex), await published(), NOW);
  assert.equal(again.context[SEB]!.parts.performance, "carried");
  assert.equal(again.data.funds[SEB]!.performance!.classCode, "STRATEGY_H");
  assert.equal(again.data.funds[SEB]!.performance!.returnClass, "H");
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
  assert.ok(sebErrors(data).some((i) => /different classes in one series .*unknown class: 2026-08/.test(i.message)));
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
    // August archive (class H): a published 1Y far from both series
    await editJson(path.join(dir, "bonds_data_2026-08.json"), (j) => { j["QCFI-SEB"]["Trailing Returns Net"]["Nymbus Sustainable Enhanced Bonds Fund"]["1Y"] = "9.9%"; });
    // July archive (class F): a monthly figure far from both series
    await editJson(path.join(dir, "bonds_data_2026-07.json"), (j) => { j["QCFI-SEB"]["Monthly Returns: Nymbus QCFI-SEB Net"]["2025"]["03-Mar"] = "4.0%"; });
    // class H: the August (same-class) archive contradicts August -> held at July; the July (class F) archive is ignored
    const h = buildSiteData(await raw({ FACTSHEET_DATA_DIR: dir }), null, NOW);
    assert.ok(sebErrors(h.data).some((i) => /2026-08 not published: factsheet bonds_data_2026-08\.json disagrees beyond tolerance \(1Y/.test(i.message)));
    assert.equal(h.data.funds[SEB]!.performance!.asOf, "2026-07-31");
    assert.equal(h.data.funds[SEB]!.performance!.returnClass, "H");
    assert.ok(!sebIssues(h.data).some((i) => /2025-03/.test(i.message)), "class F archive never compared with class H");
    // class F: the August (class H) trailing is not compared, the July (class F) monthly table is
    const f = buildSiteData(await raw({ FACTSHEET_DATA_DIR: dir }, fullHistoryRoute), null, NOW);
    assert.equal(f.data.funds[SEB]!.performance!.returnClass, "F");
    assert.ok(sebIssues(f.data).some((i) => i.level === "warn" && /2025-03: dataplatform .* vs factsheet bonds_data_2026-07\.json 4\.0000% \(beyond print precision\)/.test(i.message)), JSON.stringify(sebIssues(f.data)));
    assert.ok(!sebErrors(f.data).some((i) => /1Y/.test(i.message)), "class H trailing not compared with class F");
    // the other funds keep their (same-class) cross-check
    assert.ok(f.context["monthly-income"]!.factsheetTrailing);
    assert.ok(f.context["multi-strategy"]!.factsheetTrailing);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("class F: the July (class F) archive cross-checks July; a new month still waits for its factsheet", async () => {
  const dir = await fsCopy();
  try {
    await rm(path.join(dir, "bonds_data_2026-08.json"));
    const { data, context } = buildSiteData(await raw({ FACTSHEET_DATA_DIR: dir }, fullHistoryRoute), null, NOW, { requireFactsheetForNewMonth: true });
    const p = data.funds[SEB]!.performance!;
    assert.equal(p.asOf, "2026-07-31", "August held until its factsheet exists");
    assert.equal(p.returnClass, "F");
    assert.ok(sebIssues(data).some((i) => /2026-08 not published yet: waiting for the factsheet of 2026-08/.test(i.message)));
    assert.ok(context[SEB]!.factsheetTrailing, "July: same class, trailing cross-checked");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("class H with only class F archives: the monthly table comparison is mandatory -> error + alert", async () => {
  const dir = await fsCopy();
  try {
    await rm(path.join(dir, "bonds_data_2026-08.json"));
    const { data, context } = buildSiteData(await raw({ FACTSHEET_DATA_DIR: dir }), null, NOW);
    assert.equal(data.funds[SEB]!.performance!.returnClass, "H");
    assert.ok(sebErrors(data).some((i) => /no factsheet archive publishing class H \(STRATEGY_H\) returns with a monthly table/.test(i.message)));
    assert.ok(context[SEB]!.alerts.some((a) => /no class H \(STRATEGY_H\) factsheet monthly table/.test(a)));
    assert.ok(!sebIssues(data).some((i) => /factsheet .* figures used/.test(i.message)), "never filled from a class F archive");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

/* ------------------------------------------------------------------ class change, carried and legacy publications */

test("class change H -> F: a blocking issue; the run holds the change, the auto-publishable data keeps class H", async () => {
  const previous = await published();
  const { data, context } = buildSiteData(await raw({}, fullHistoryRoute), previous, NOW);
  assert.equal(data.funds[SEB]!.performance!.returnClass, "F");
  assert.deepEqual(context[SEB]!.revisions, [], "no revision list for a restatement under another class");
  const v = validateSite(data, context, previous, NOW);
  assert.deepEqual(v.classChanges, [SEB]);
  const r = v.results.find((x) => x.fund === SEB)!;
  assert.ok(r.blocking.some((i) => i.key === `funds.${SEB}.performance.class` && /class change from class H \(STRATEGY_H\) to class F \(STRATEGY\)/.test(i.message)));
  assert.ok(r.alerts.includes("performance class change to class F needs approval"));
  assert.equal(v.data.funds[SEB]!.performance!.returnClass, "F", "what an approval publishes");
  assert.equal(v.autoData.funds[SEB]!.performance!.returnClass, "H", "what may go live without a human");
  assert.match(v.autoData.provenance[`funds.${SEB}.performance`], /^carried over from the publication of/);
  assert.deepEqual(v.autoData.funds["monthly-income"], v.data.funds["monthly-income"], "other funds identical");
  // same class again: no change
  const same = buildSiteData(await raw({}, fullHistoryRoute), v.data, NOW);
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
});

/* ------------------------------------------------------------------ NAV class vs performance class */

test("NAV card and performance label are independent: SEB NAV LDM201 is class F (register) whatever the performance class", async () => {
  for (const [routes, perf] of [[[], "H"], [[fullHistoryRoute], "F"]] as [Route[], string][]) {
    const { data } = buildSiteData(await raw({}, ...routes), null, NOW);
    const f = data.funds[SEB]!;
    assert.equal(f.performance!.returnClass, perf);
    assert.equal(f.nav!.classes.find((c) => c.fundserv === "LDM201")!.display, "F", "NAV class label comes from the fund register, by FundServ code");
  }
});
