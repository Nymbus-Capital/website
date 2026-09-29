/**
 * Build step against the synthetic fixtures. Expected values are LITERALS computed independently (python3
 * from the fixture files, or by hand), never with the pipeline's own functions.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, cp, readFile, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildSiteData, navChange, revisions } from "../../../src/lib/pipeline/build.ts";
import { fetchAll } from "../../../src/lib/pipeline/sources/index.ts";
import type { NavPoint, RawPayloads } from "../../../src/lib/pipeline/raw.ts";
import type { SiteData } from "../../../src/lib/data/types.ts";
import { FIXTURE_FACTSHEETS_DIR, fixtureEnv, json, loadFixture, mockFetch, type Route } from "../../fixtures/pipeline/mock-fetch.ts";

const NOW = new Date("2026-09-29T14:00:00Z");
const near = (a: number | null | undefined, b: number, eps = 1e-12): void => {
  assert.ok(a != null && Math.abs(a - b) <= eps, `expected ${b}, got ${a}`);
};

async function raw(env: Record<string, string | undefined> = {}, ...routes: Route[]): Promise<{ raw: RawPayloads; calls: ReturnType<typeof mockFetch>["calls"] }> {
  const m = mockFetch(...routes);
  return { raw: await fetchAll({ fetchImpl: m.fetch, now: NOW, env: fixtureEnv(env) }), calls: m.calls };
}
async function fsCopy(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "fs-"));
  await cp(FIXTURE_FACTSHEETS_DIR, dir, { recursive: true });
  return dir;
}
async function editJson(file: string, fn: (j: any) => void): Promise<void> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const j = JSON.parse(await readFile(file, "utf8"));
  fn(j);
  await writeFile(file, JSON.stringify(j));
}

test("end to end: history from analytics + dataplatform ready months, published index, every block", async () => {
  const { raw: r, calls } = await raw();
  assert.ok(calls.every((c) => c.url.startsWith("http://dataplatform.test/")), "only the configured base URL is called");
  assert.ok(calls.every((c) => !c.headers.authorization), "no auth header unless configured");
  const { data, context } = buildSiteData(r, null, NOW);
  assert.deepEqual(data.asOf, { performance: "2026-08-31", nav: "2026-09-28", aum: "2026-09-28", factsheet: "2026-08" });
  assert.deepEqual(data.issues.filter((i) => i.level !== "info"), [], JSON.stringify(data.issues.filter((i) => i.level !== "info")));

  const mi = data.funds["monthly-income"]!;
  const p = mi.performance!;
  assert.equal(p.firstMonth, "2019-01-31");
  assert.equal(p.monthly.length, 92);
  assert.equal(p.monthly[p.monthly.length - 1].r, -0.00121918, "Aug 2026 = dataplatform ready month");
  assert.equal(p.monthly[p.monthly.length - 2].r, -0.00139, "Jul 2026 = analytics history");
  // python3 reference (compounded / annualized from the fixture files)
  near(p.trailing.fund["1Y"], 0.010394449520831683);
  near(p.trailing.fund["3Y"], 0.010184756985094356);
  near(p.trailing.fund.SI, 0.022692721033146235);
  near(p.trailing.fund.YTD, -0.0006185939561148546);
  assert.equal(p.trailing.fund["10Y"], null);
  // H5
  assert.equal(p.returnClass, "STRATEGY");
  assert.equal(p.returnClassLabel, "Series FP");
  assert.match(data.provenance["funds.monthly-income.performance"], /class STRATEGY \(Series FP\)/);
  assert.match(data.provenance["funds.monthly-income.performance"], /analytics fund_returns\.json "Nymbus Monthly Income" \(91 month/);
  // C1: index as published (factsheet 2026-08): 1Y "0.0%", SI "2.3%", monthly Aug "0.38%", Jan 2019 "0.28%"
  assert.equal(p.indexName, "FTSE Canada Short Term Corporate Bond Index");
  assert.equal(p.trailing.index!["1Y"], 0);
  assert.equal(p.trailing.index!.SI, 0.023);
  assert.equal(p.indexMonthly![0].r, 0.0028);
  assert.equal(p.indexMonthly![p.indexMonthly!.length - 1].r, 0.0038);
  // C2: VA = displayed fund − displayed index
  near(p.trailing.va!["1Y"], 0.010394449520831683 - 0, 1e-12);
  near(p.trailing.va!.SI, 0.022692721033146235 - 0.023, 1e-12);
  assert.equal(p.calendar[p.calendar.length - 1].partial, true);
  assert.equal(p.growth[0].date, "2018-12-31");
  assert.equal(p.growth[0].index, 10_000);
  assert.ok(mi.risk && mi.risk3Y);
  assert.match(data.provenance["funds.monthly-income.risk"], /month-end peaks only/);

  // C3: NAV daily change = Apex distribution-aware return from the previous valuation day
  const cls = Object.fromEntries(mi.nav!.classes.map((c) => [c.fundserv, c]));
  assert.deepEqual(Object.keys(cls), ["LDM001", "LDM021", "LDM081", "LDM011"], "dormant class excluded");
  assert.equal(cls.LDM001.changePct, 0.00111994);
  near(cls.LDM001.change, 0.0114, 1e-9);
  assert.equal(cls.LDM001.prevDate, "2026-09-25");
  // distribution day: total return -0.20749 % while the NAV fell 0.0604 $ (-0.614 %): $ change hidden
  assert.equal(cls.LDM021.changePct, -0.0020749);
  assert.equal(cls.LDM021.change, null);
  // USD class: nav_price_ratio only -> no change shown
  assert.equal(cls.LDM011.changePct, null);
  assert.equal(cls.LDM011.change, null);
  assert.equal(cls.LDM011.nav, 10.3711);
  // SEB LDM205: last return starts 2026-09-25, the previous valuation shown is 2026-09-24
  const a205 = data.funds["sustainable-enhanced-bonds"]!.nav!.classes.find((c) => c.fundserv === "LDM205")!;
  assert.equal(a205.changePct, null);
  assert.equal(a205.prevDate, "2026-09-24");

  assert.equal(mi.aum!.cad, 213_580_246);

  // SEB: STRATEGY_H track record, published universe index
  const seb = data.funds["sustainable-enhanced-bonds"]!.performance!;
  assert.equal(seb.firstMonth, "2019-02-28");
  assert.equal(seb.returnClass, "STRATEGY_H");
  assert.equal(seb.returnClassLabel, "Series H");
  assert.equal(seb.trailing.index!["1Y"], -0.035);
  assert.equal(seb.indexMonthly![0].r, -0.015);

  // Multi-strategy: python3 SI 0.07627897978009623, no benchmark
  const ms = data.funds["multi-strategy"]!.performance!;
  near(ms.trailing.fund.SI, 0.07627897978009623);
  assert.equal(ms.trailing.index, undefined);
  assert.equal(ms.indexMonthly, undefined);

  // GMV: published statistics with their published precision (M4)
  const gmv = data.funds["global-minimum-volatility"]!;
  assert.equal(gmv.performance!.basis, "gross");
  assert.equal(gmv.risk!.decimals!.sharpe, 1);
  assert.equal(gmv.risk!.decimals!.maxDrawdown, 0);
  assert.equal(context["global-minimum-volatility"]!.trailingSource, "factsheet");
  for (const k of ["monthly-income", "sustainable-enhanced-bonds", "multi-strategy"] as const) assert.deepEqual(context[k]!.alerts, [], k);
});

test("SEST benchmark default is short_corp; FTSE_INDEX_SEST overrides it", async () => {
  const d = await raw();
  assert.equal(d.raw.ftseIndex["monthly-income"], "short_corp");
  assert.ok(d.calls.some((c) => c.url.includes("short_name=short_corp")));
  const o = await raw({ FTSE_INDEX_SEST: "short_overall" });
  assert.equal(o.raw.ftseIndex["monthly-income"], "short_overall");
  assert.equal(o.raw.ftse.short_overall.ok, false, "no rows for short_overall in the fixtures");
});

test("FTSE history joined across a rename (same index_id), siblings ignored", async () => {
  const { raw: r } = await raw();
  const u = r.ftse.univ.data!;
  assert.equal(u.first, "2018-12-27", "history from the old name");
  assert.deepEqual(u.joined, ["ftse_tmx_canada_univ"]);
  assert.match(r.ftse.univ.detail!, /earlier years under ftse_tmx_canada_univ \(index_id 2001\)/);
  // a level break at the seam: not joined
  const broken: Route = (url) => {
    if (url.pathname === "/api/ftse/index-summary" && url.searchParams.get("short_name") === "ftse_tmx_canada_univ") {
      const rows = loadFixture("dataplatform/ftse_ftse_tmx_canada_univ.json") as { total_return: number }[];
      return json(rows.map((x) => ({ ...x, total_return: x.total_return * 0.9 })));
    }
    return undefined;
  };
  const b = await raw({}, broken);
  assert.equal(b.raw.ftse.univ.data!.first, "2024-12-05");
  assert.match(b.raw.ftse.univ.detail!, /not joined: ftse_tmx_canada_univ \(level jumps 11\.1% at 2024-12-05\)/);
});

test("C1: index months the factsheet does not cover come from FTSE, with a warn and provenance", async () => {
  const dir = await fsCopy();
  // the August archive lost its index monthly table: August comes from FTSE short_corp (0.3790669539088798, python)
  await editJson(path.join(dir, "bonds_data_2026-08.json"), (j) => { delete j.SEST["Monthly Returns: FTSE Canada Short Term Corporate Bond Index"]; });
  await rm(path.join(dir, "bonds_data_2026-07.json"));
  const { data } = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir })).raw, null, NOW);
  const p = data.funds["monthly-income"]!.performance!;
  // no published table at all: the whole index series is FTSE (one definition), flagged
  const im = Object.fromEntries(p.indexMonthly!.map((x) => [x.month, x.r]));
  near(im["2026-08-31"], 0.003790669539088798, 1e-12);
  assert.ok(data.issues.some((i) => i.level === "warn" && i.key === "funds.monthly-income.performance.index" && /^index 2019-01 to 2026-08 from FTSE short_corp \(no published factsheet index table/.test(i.message)));
  assert.match(data.provenance["funds.monthly-income.performance"], /FTSE short_corp via dataplatform \/api\/ftse\/index-summary for 2019-01 to 2026-08/);
  // published trailing still used for the index figures
  assert.equal(p.trailing.index!.SI, 0.023);
});

test("C1: published index months vs FTSE disagreeing beyond rounding (after the FTSE cutover): warn, published used", async () => {
  const dir = await fsCopy();
  await editJson(path.join(dir, "bonds_data_2026-08.json"), (j) => { j["QCFI-SEB"]["Monthly Returns: FTSE Canada Universe Bond Index"]["2026"]["06-Jun"] = "0.90%"; });
  const { data } = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir })).raw, null, NOW);
  assert.ok(data.issues.some((i) => i.level === "warn" && /2026-06: published index 0\.90% vs FTSE univ/.test(i.message)));
  assert.equal(data.funds["sustainable-enhanced-bonds"]!.performance!.indexMonthly!.find((x) => x.month === "2026-06-30")!.r, 0.009);
});

test("C2: value added is fund − displayed index; published VA is only a cross-check", async () => {
  const dir = await fsCopy();
  await editJson(path.join(dir, "bonds_data_2026-08.json"), (j) => { j.SEST["Trailing Returns Net"]["Value Added"]["1Y"] = "+9.9%"; });
  const { data } = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir })).raw, null, NOW);
  near(data.funds["monthly-income"]!.performance!.trailing.va!["1Y"], 0.010394449520831683, 1e-12);
  assert.ok(data.issues.some((i) => i.key === "funds.monthly-income.trailing.va.1Y" && i.level === "warn"));
});

test("H1: a month missing from every source interrupts the track record (error); analytics vs dataplatform difference warns", async () => {
  const hole: Route = () => undefined;
  const dir = await fsCopy();
  const af = path.join(dir, "an.json");
  const an = loadFixture("analytics_fund_returns.json") as { dates: string[]; returns: Record<string, (number | null)[]> };
  an.returns["Nymbus Sustainable Enhanced Bonds"][an.dates.indexOf("2024-03-31")] = null;
  an.returns["Nymbus Monthly Income"][an.dates.indexOf("2026-07-31")] = null; // July filled by the factsheet table (-0.14%)
  await writeFile(af, JSON.stringify(an));
  for (const f of ["bonds_data_2026-08.json", "bonds_data_2026-07.json"]) await editJson(path.join(dir, f), (j) => { delete j["QCFI-SEB"]["Monthly Returns: Nymbus QCFI-SEB Net"]["2024"]; });
  const { data } = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir, ANALYTICS_RETURNS_FILE: af }, hole)).raw, null, NOW);
  assert.equal(data.funds["sustainable-enhanced-bonds"]!.performance, null, "track record 2019-02..2024-02 cannot reach the as-of");
  assert.ok(data.issues.some((i) => i.level === "error" && /interrupted after 2024-02: 2024-03 missing/.test(i.message)));
  const jul = data.funds["monthly-income"]!.performance!.monthly.find((x) => x.month === "2026-07-31")!;
  assert.equal(jul.r, -0.0014, "factsheet table value (2 decimals)");
  assert.ok(data.issues.some((i) => i.level === "warn" && /2026-07: factsheet .* figures used/.test(i.message)));

  const diff: Route = (url) => {
    if (url.pathname !== "/api/performance/monthly-net-returns" || url.searchParams.get("short_name") !== "SEST") return undefined;
    const j = loadFixture("dataplatform/mnr_SEST.json") as { rows: { month: string; status: string; net_return: number | null }[] };
    const r = j.rows.find((x) => x.month === "2026-07-31")!;
    Object.assign(r, { status: "ready", net_return: -0.00137 });
    return json(j);
  };
  const d2 = buildSiteData((await raw({}, diff)).raw, null, NOW).data;
  assert.ok(d2.issues.some((i) => i.level === "warn" && /2026-07: analytics -0\.1390% vs dataplatform -0\.1370% \(dataplatform used\)/.test(i.message)));
  assert.equal(d2.funds["monthly-income"]!.performance!.monthly.find((x) => x.month === "2026-07-31")!.r, -0.00137);
});

test("H1: analytics unavailable -> track record cannot start in 2019: performance not built (error)", async () => {
  const { data, context } = buildSiteData((await raw({ ANALYTICS_RETURNS_FILE: path.join(os.tmpdir(), "nope-analytics.json") })).raw, null, NOW);
  // the factsheet monthly tables still cover the history for the bond funds (warn), Multi-strategy too
  assert.ok(data.issues.some((i) => i.level === "warn" && /analytics history unavailable/.test(i.message)));
  assert.equal(data.funds["monthly-income"]!.performance!.firstMonth, "2019-01-31");
  assert.ok(data.issues.some((i) => i.level === "warn" && /factsheet .* figures used/.test(i.message)));
  void context;
});

test("H3: a new month waits for its factsheet (held, info); an inconsistent factsheet blocks the new month", async () => {
  const prevDir = await fsCopy();
  await rm(path.join(prevDir, "bonds_data_2026-08.json"));
  await rm(path.join(prevDir, "factsheet_data_2026-08.json"));
  const first = buildSiteData((await raw({ FACTSHEET_DATA_DIR: prevDir })).raw, null, NOW);
  // no previous publication: the newest cross-checkable month is July
  const p = first.data.funds["monthly-income"]!.performance!;
  assert.equal(p.asOf, "2026-07-31");
  near(p.trailing.fund["1Y"], 0.00494802750682144);
  assert.equal(first.context["monthly-income"]!.parts.performance, "held");
  assert.ok(first.data.issues.some((i) => i.level === "info" && /2026-08 not published yet: waiting for the factsheet of 2026-08/.test(i.message)));
  assert.ok(!first.context["monthly-income"]!.alerts.length, "waiting is not an alert");
  // gate disabled: August published without its factsheet
  const off = buildSiteData((await raw({ FACTSHEET_DATA_DIR: prevDir })).raw, null, NOW, { requireFactsheetForNewMonth: false });
  assert.equal(off.data.funds["monthly-income"]!.performance!.asOf, "2026-08-31");

  // August factsheet disagrees beyond tolerance on 1Y (computed 1.04 %, published 2.0 %): August is not published
  const bad = await fsCopy();
  await editJson(path.join(bad, "bonds_data_2026-08.json"), (j) => { j.SEST["Trailing Returns Net"]["Nymbus Monthly Income Fund"]["1Y"] = "2.0%"; });
  const second = buildSiteData((await raw({ FACTSHEET_DATA_DIR: bad })).raw, first.data, NOW);
  assert.equal(second.data.funds["monthly-income"]!.performance!.asOf, "2026-07-31");
  assert.ok(second.data.issues.some((i) => i.level === "error" && /2026-08 not published: factsheet bonds_data_2026-08.json disagrees beyond tolerance \(1Y computed 1\.04% vs published 2\.00%\)/.test(i.message)));

  // once August is published, a later factsheet contradicting it withholds the performance
  const good = buildSiteData((await raw()).raw, first.data, NOW).data;
  assert.equal(good.funds["monthly-income"]!.performance!.asOf, "2026-08-31");
  const third = buildSiteData((await raw({ FACTSHEET_DATA_DIR: bad })).raw, good, NOW);
  assert.equal(third.data.funds["monthly-income"]!.performance, null);
  assert.ok(third.context["monthly-income"]!.alerts.includes("performance withheld"));
  assert.ok(third.data.issues.some((i) => i.level === "error" && /already published/.test(i.message)));
});

test("H3 tolerances: 1Y rounding (0.05 %) + 0.05 %; 5Y 0.05 % + 0.1 %", async () => {
  const dir = await fsCopy();
  // computed 1Y 1.0394 %: published 1.0 % is rounding; 1.6 % is 0.56 pts off (> 0.1 %) -> blocking
  // computed 5Y 1.99595 % (python): published 2.1 % is within 0.15 % -> warn only
  await editJson(path.join(dir, "bonds_data_2026-08.json"), (j) => { j.SEST["Trailing Returns Net"]["Nymbus Monthly Income Fund"]["5Y"] = "2.1%"; });
  const { data } = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir })).raw, null, NOW);
  assert.equal(data.funds["monthly-income"]!.performance!.asOf, "2026-08-31");
  assert.ok(data.issues.some((i) => i.level === "warn" && i.key === "funds.monthly-income.trailing.5Y"));
  await editJson(path.join(dir, "bonds_data_2026-08.json"), (j) => { j.SEST["Trailing Returns Net"]["Nymbus Monthly Income Fund"]["5Y"] = "2.2%"; });
  const d2 = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir })).raw, null, NOW).data;
  assert.equal(d2.funds["monthly-income"]!.performance!.asOf, "2026-07-31", "5Y off by 0.204 pts > 0.15: August held back");
});

test("track record < 12 months: performance and risk withheld (compliance), info only", async () => {
  const { PIPELINE_FUNDS } = await import("../../../src/lib/pipeline/config.ts");
  const saved = PIPELINE_FUNDS["multi-strategy"].trackStart;
  PIPELINE_FUNDS["multi-strategy"].trackStart = "2025-12-31";
  try {
    const { data, context } = buildSiteData((await raw()).raw, null, NOW);
    assert.equal(data.funds["multi-strategy"]!.performance, null);
    assert.equal(data.funds["multi-strategy"]!.risk, null);
    assert.ok(data.issues.some((i) => i.level === "info" && i.message.includes("< 12")));
    assert.deepEqual(context["multi-strategy"]!.alerts, []);
  } finally {
    PIPELINE_FUNDS["multi-strategy"].trackStart = saved;
  }
});

test("C3 navChange unit cases", () => {
  const row = (o: Partial<NavPoint>): NavPoint => ({ date: "2026-09-28", nav_per_share_local: 10.1, net_daily_return: 0.01, net_return_method: "apex_distribution_aware", return_start_date: "2026-09-25", ...o });
  const prev = row({ date: "2026-09-25", nav_per_share_local: 10 });
  assert.deepEqual(navChange(row({}), prev), { changePct: 0.01, change: 0.1, reason: null });
  assert.equal(navChange(row({}), null).changePct, null);
  assert.equal(navChange(row({ net_return_method: "nav_price_ratio" }), prev).changePct, null);
  assert.equal(navChange(row({ return_start_date: "2026-09-24" }), prev).changePct, null, "return from a day older than the previous valuation shown");
  assert.equal(navChange(row({ net_daily_return: null }), prev).changePct, null);
  const dist = navChange(row({ nav_per_share_local: 9.9, net_daily_return: 0.001 }), prev);
  assert.equal(dist.changePct, 0.001);
  assert.equal(dist.change, null, "NAV moved -1 % but the total return is +0.1 %: a distribution, $ change hidden");
});

test("M5 revisions: months up to the previous as-of changed by more than 1e-6", () => {
  const prev = { asOf: "2026-07-31", monthly: [{ month: "2026-05-31", r: 0.01 }, { month: "2026-06-30", r: 0.02 }, { month: "2026-07-31", r: 0.03 }] } as SiteData["funds"]["monthly-income"] extends infer _ ? any : never; // eslint-disable-line @typescript-eslint/no-explicit-any
  const next = { asOf: "2026-08-31", monthly: [{ month: "2026-05-31", r: 0.0100005 }, { month: "2026-06-30", r: 0.021 }, { month: "2026-07-31", r: 0.03 }, { month: "2026-08-31", r: 0.5 }] } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  assert.deepEqual(revisions(prev, next), [{ month: "2026-06-30", before: 0.02, after: 0.021 }]);
});

test("failed sources carry over previous values, with error issues and alerts", async () => {
  const first = buildSiteData((await raw()).raw, null, NOW).data;
  const later = new Date("2026-09-30T14:00:00Z");
  const down: Route = (url) => (url.pathname.startsWith("/api/") ? json({ detail: "maintenance" }, 503) : undefined);
  const m = mockFetch(down);
  const r = await fetchAll({ fetchImpl: m.fetch, now: later, env: fixtureEnv({ FACTSHEET_DATA_DIR: path.join(os.tmpdir(), "does-not-exist-xyz"), ANALYTICS_RETURNS_FILE: path.join(os.tmpdir(), "nope.json") }) });
  const { data, context } = buildSiteData(r, first, later);
  const mi = data.funds["monthly-income"]!;
  assert.deepEqual(mi.performance, first.funds["monthly-income"]!.performance);
  assert.deepEqual(mi.nav, first.funds["monthly-income"]!.nav);
  assert.deepEqual(context["monthly-income"]!.parts, { performance: "carried", nav: "carried", aum: "carried", factsheet: "carried" });
  assert.deepEqual(context["monthly-income"]!.alerts, ["performance carried over", "nav carried over", "aum carried over", "factsheet carried over"]);
  for (const part of ["performance", "nav", "aum", "factsheet"]) assert.match(data.provenance[`funds.monthly-income.${part}`], /^carried over from the publication of 2026-09-29/);
  assert.ok(data.issues.some((i) => i.level === "error" && i.key === "funds.monthly-income.performance"));
  const fromSample = buildSiteData(r, { ...first, mode: "sample" }, later).data;
  assert.equal(fromSample.funds["monthly-income"], undefined, "sample data is never carried into live data");
});

test("C1: factsheet covers the index up to July; August from FTSE (after the cutover, one definition); no FTSE month spliced before 2026-05", async () => {
  const dir = await fsCopy();
  // July archive only (bonds), but the August fund month is allowed without a factsheet (gate off)
  await rm(path.join(dir, "bonds_data_2026-08.json"));
  const { data } = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir })).raw, null, NOW, { requireFactsheetForNewMonth: false });
  const p = data.funds["monthly-income"]!.performance!;
  assert.equal(p.asOf, "2026-08-31");
  const im = Object.fromEntries(p.indexMonthly!.map((x) => [x.month, x.r]));
  assert.equal(im["2019-01-31"], 0.0028, "published (factsheet table)");
  near(im["2026-08-31"], 0.003790669539088798, 1e-12);
  assert.equal(p.indexMonthly!.length, 92);
  assert.ok(data.issues.some((i) => i.level === "warn" && /^index 2026-08 from FTSE short_corp \(not covered by the published factsheet yet\)/.test(i.message)));
  // no published trailing for August: index trailing computed from these months (warned)
  assert.ok(data.issues.some((i) => i.level === "warn" && /no published index trailing for 2026-08/.test(i.message)));
  // VA consistent with the displayed figures
  near(p.trailing.va!["1Y"], p.trailing.fund["1Y"]! - p.trailing.index!["1Y"]!, 1e-12);
});

/* ------------------------------------------------------------------ verifier round (N1, N4, N5) */

async function julyOnly(): Promise<SiteData> {
  const d0 = await fsCopy();
  await rm(path.join(d0, "bonds_data_2026-08.json"));
  await rm(path.join(d0, "factsheet_data_2026-08.json"));
  return buildSiteData((await raw({ FACTSHEET_DATA_DIR: d0 })).raw, null, NOW).data;
}
const wrongAug: Route = (url) => {
  if (url.pathname !== "/api/performance/monthly-net-returns" || url.searchParams.get("short_name") !== "SEST") return undefined;
  const j = loadFixture("dataplatform/mnr_SEST.json") as { rows: { month: string; net_return: number | null }[] };
  j.rows.find((r) => r.month === "2026-08-31")!.net_return = 0.2;
  return json(j);
};

for (const [label, mutate] of [
  ["all nan", (t: Record<string, string>) => { for (const k of Object.keys(t)) t[k] = "nan"; }],
  ["empty strings", (t: Record<string, string>) => { for (const k of Object.keys(t)) t[k] = ""; }],
  ["1Y missing", (t: Record<string, string>) => { delete t["1Y"]; }],
] as const) {
  test(`N1: a same-month factsheet whose fund trailing row is ${label} is not a cross-check (new month waits)`, async () => {
    const first = await julyOnly();
    const dir = await fsCopy();
    await editJson(path.join(dir, "bonds_data_2026-08.json"), (j) => mutate(j.SEST["Trailing Returns Net"]["Nymbus Monthly Income Fund"]));
    const b = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir }, wrongAug)).raw, first, NOW);
    const p = b.data.funds["monthly-income"]!.performance!;
    assert.equal(p.asOf, "2026-07-31", "August (20 % return, unverifiable) not published");
    near(p.trailing.fund["1Y"], 0.00494802750682144);
    assert.ok(b.data.issues.some((i) => i.level === "warn" && /fund trailing row missing or incomplete/.test(i.message)));
  });
}

test("N1: renamed fund trailing row (fund name changed) -> not cross-checkable", async () => {
  const first = await julyOnly();
  const dir = await fsCopy();
  await editJson(path.join(dir, "bonds_data_2026-08.json"), (j) => {
    const t = j.SEST["Trailing Returns Net"];
    // the fund row disappears; only the index and value added remain
    delete t["Nymbus Monthly Income Fund"];
  });
  const b = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir }, wrongAug)).raw, first, NOW);
  assert.equal(b.data.funds["monthly-income"]!.performance!.asOf, "2026-07-31");
});

test("N1: fund monthly-table mismatch beyond print precision: blocking after the previous as-of, alert for older months", async () => {
  const first = await julyOnly();
  // August printed as 0.50 % while the reference (dataplatform) is -0.121918 %: August not published
  const dir = await fsCopy();
  await editJson(path.join(dir, "bonds_data_2026-08.json"), (j) => { j.SEST["Monthly Returns: Nymbus SEST Net"]["2026"]["08-Aug"] = "0.50%"; });
  const b = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir })).raw, first, NOW);
  assert.equal(b.data.funds["monthly-income"]!.performance!.asOf, "2026-07-31");
  assert.ok(b.data.issues.some((i) => i.level === "error" && /2026-08 not published: factsheet monthly table disagrees beyond print precision for 2026-08/.test(i.message)));
  // an older month (2025-03, already published) printed differently: published month kept, alert raised
  const dir2 = await fsCopy();
  await editJson(path.join(dir2, "bonds_data_2026-08.json"), (j) => { j.SEST["Monthly Returns: Nymbus SEST Net"]["2025"]["03-Mar"] = "9.99%"; });
  const b2 = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir2 })).raw, first, NOW);
  assert.equal(b2.data.funds["monthly-income"]!.performance!.asOf, "2026-08-31");
  assert.ok(b2.context["monthly-income"]!.alerts.some((a) => /already published month\(s\) 2025-03/.test(a)));
  // within print precision (-0.12 % for -0.121918 %): no issue
  const b3 = buildSiteData((await raw()).raw, first, NOW);
  assert.deepEqual(b3.context["monthly-income"]!.alerts, []);
});

test("N4: analytics unavailable -> factsheet-rebuilt history alerts, risk statistics withheld", async () => {
  const { data, context } = buildSiteData((await raw({ ANALYTICS_RETURNS_FILE: path.join(os.tmpdir(), "nope-analytics.json") })).raw, null, NOW);
  const mi = data.funds["monthly-income"]!;
  assert.equal(mi.performance!.monthly[0].r, 0.0057, "2019-01 as printed in the factsheet table (0.57 %)");
  assert.equal(mi.risk, null);
  assert.equal(mi.risk3Y, null);
  assert.ok(context["monthly-income"]!.alerts.some((a) => /analytics history unavailable: 91 month\(s\) rebuilt/.test(a)));
  assert.ok(data.issues.some((i) => i.key === "funds.monthly-income.risk" && /rounded factsheet figures/.test(i.message)));
});

test("N5: FTSE months before the FTSE cutover used for the index (no published table) -> alert", async () => {
  const dir = await fsCopy();
  for (const f of ["bonds_data_2026-08.json", "bonds_data_2026-07.json"]) await editJson(path.join(dir, f), (j) => { delete j.SEST["Monthly Returns: FTSE Canada Short Term Corporate Bond Index"]; });
  const { context } = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir })).raw, null, NOW);
  assert.ok(context["monthly-income"]!.alerts.some((a) => /index months 2019-01 to 2026-04 from FTSE short_corp, a different definition/.test(a)));
  // with the published table, no such alert
  const ok = buildSiteData((await raw()).raw, null, NOW);
  assert.deepEqual(ok.context["monthly-income"]!.alerts, []);
});
