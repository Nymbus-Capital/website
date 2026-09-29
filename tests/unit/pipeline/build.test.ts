import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, cp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildSiteData } from "../../../src/lib/pipeline/build.ts";
import { fetchAll } from "../../../src/lib/pipeline/sources/index.ts";
import { trailing, type Series } from "../../../src/lib/pipeline/metrics.ts";
import type { RawPayloads } from "../../../src/lib/pipeline/raw.ts";
import { FIXTURE_FACTSHEETS_DIR, fixtureEnv, json, loadFixture, mockFetch, type Route } from "../../fixtures/pipeline/mock-fetch.ts";

const NOW = new Date("2026-09-29T14:00:00Z");

async function raw(env: Record<string, string | undefined> = {}, ...routes: Route[]): Promise<{ raw: RawPayloads; calls: ReturnType<typeof mockFetch>["calls"] }> {
  const m = mockFetch(...routes);
  return { raw: await fetchAll({ fetchImpl: m.fetch, now: NOW, env: fixtureEnv(env) }), calls: m.calls };
}

const mnrSeries = (short: string): Series => {
  const j = loadFixture(`dataplatform/mnr_${short}.json`) as { rows: { month: string; net_return: number }[] };
  return Object.fromEntries(j.rows.map((r) => [r.month, r.net_return]));
};

test("end to end from the synthetic fixtures: every fund, every block", async () => {
  const { raw: r, calls } = await raw();
  assert.ok(calls.every((c) => c.url.startsWith("http://dataplatform.test/")), "only the configured base URL is called");
  assert.ok(calls.every((c) => !c.headers.authorization), "no auth header unless configured");
  const { data, context } = buildSiteData(r, null, NOW);
  assert.equal(data.mode, "live");
  assert.equal(data.schemaVersion, 1);
  assert.deepEqual(data.asOf, { performance: "2026-08-31", nav: "2026-09-28", aum: "2026-09-28", factsheet: "2026-08" });
  assert.deepEqual(data.issues.filter((i) => i.level !== "info"), [], JSON.stringify(data.issues));

  const mi = data.funds["monthly-income"]!;
  const p = mi.performance!;
  assert.equal(p.basis, "net");
  assert.equal(p.firstMonth, "2019-01-31");
  assert.equal(p.asOf, "2026-08-31");
  assert.equal(p.monthly.length, 92);
  // fund trailing = recomputation from the dataplatform series
  const t = trailing(mnrSeries("SEST"), "2026-08-31");
  assert.equal(p.trailing.fund["1Y"], t["1Y"]);
  assert.equal(p.trailing.fund.SI, t.SI);
  assert.equal(p.trailing.fund["10Y"], null, "longer than the track record");
  // index & value added as published in the factsheet (1 decimal)
  const fs = (loadFixture("factsheets/bonds_data_2026-08.json") as Record<string, Record<string, Record<string, Record<string, string>>>>).SEST["Trailing Returns Net"];
  assert.equal(p.trailing.index!["1Y"], Number(fs["FTSE Canada Short Term Corporate Bond Index"]["1Y"].replace("%", "")) / 100);
  assert.equal(p.trailing.va!.SI, Number(fs["Value Added"].SI.replace("%", "")) / 100);
  assert.equal(p.indexMonthly!.length, 92);
  assert.equal(p.calendar[0].year, 2019);
  assert.equal(p.calendar[p.calendar.length - 1].partial, true);
  assert.equal(p.growth[0].date, "2018-12-31");
  assert.equal(p.growth[0].fund, 10_000);
  assert.equal(p.growth[0].index, 10_000);
  assert.equal(p.growth.length, 93);
  assert.ok(mi.risk && mi.risk.window === "SI" && mi.risk.sharpe! > 0);
  assert.ok(mi.risk3Y && mi.risk3Y.window === "3Y");

  // NAV: live classes only (dormant LDM031 excluded), apex preferred over cibc, currency of the class
  assert.deepEqual(mi.nav!.classes.map((c) => c.fundserv), ["LDM001", "LDM021", "LDM081", "LDM011"]);
  const navRows = (loadFixture("dataplatform/nav_SEST.json") as { rows: { fundserv: string; source: string; date: string; nav_per_share_local: number }[] }).rows;
  const apex = navRows.filter((x) => x.fundserv === "LDM011" && x.source === "apex");
  const usd = mi.nav!.classes.find((c) => c.fundserv === "LDM011")!;
  assert.equal(usd.currency, "USD");
  assert.equal(usd.display, "F USD");
  assert.equal(usd.nav, apex[apex.length - 1].nav_per_share_local);
  assert.equal(usd.prevNav, apex[apex.length - 2].nav_per_share_local);
  assert.equal(usd.date, "2026-09-28");
  assert.ok(Math.abs(usd.changePct! - (usd.nav! / usd.prevNav! - 1)) < 1e-15);

  // AUM: fund total over APEX + CIBC rows
  assert.equal(mi.aum!.cad, 212_345_678.9 + 1_234_567.1);
  assert.equal(mi.aum!.asOf, "2026-09-28");

  // factsheet parts
  const ch = Object.fromEntries(mi.characteristics.map((c) => [c.id, c]));
  assert.equal(ch.portfolioYield.fund, 0.0421);
  assert.equal(ch.duration.fund, 2.41);
  assert.equal(ch.creditQuality.fund, "A");
  assert.equal(ch.netCreditLeverage, undefined);
  assert.deepEqual(Object.keys(mi.breakdowns).sort(), ["country", "credit", "curve", "sectors"]);
  assert.equal(mi.topHoldings.length, 10);
  assert.equal(mi.esg.length, 5);
  assert.equal(mi.factsheetMonth, "2026-08");
  assert.equal(context["monthly-income"]!.trailingSource, "computed");
  assert.ok(context["monthly-income"]!.factsheetTrailing);

  // SEB: track record from 2019-02, FTSE Universe
  const seb = data.funds["sustainable-enhanced-bonds"]!;
  assert.equal(seb.performance!.firstMonth, "2019-02-28");
  assert.equal(seb.nav!.classes.length, 3);

  // Multi-strategy: no benchmark, flat characteristics, asset-class allocation
  const ms = data.funds["multi-strategy"]!;
  assert.equal(ms.performance!.trailing.index, undefined);
  assert.equal(ms.performance!.indexMonthly, undefined);
  assert.equal(ms.performance!.calendar[0].index, undefined);
  assert.equal(ms.performance!.growth[0].index, undefined);
  assert.deepEqual(ms.breakdowns.assetClass!.map((b) => b.label), ["Equities", "Bonds", "Currencies", "Commodities"]);
  assert.ok(ms.characteristics.some((c) => c.id === "dividendYield"));

  // GMV: gross, published trailing, no NAV / AUM
  const gmv = data.funds["global-minimum-volatility"]!;
  assert.equal(gmv.performance!.basis, "gross");
  assert.equal(gmv.performance!.trailing.fund.SI, 0.074);
  assert.equal(gmv.nav, null);
  assert.equal(gmv.aum, null);
  assert.equal(gmv.topHoldings.length, 8, "top futures");
  assert.equal(context["global-minimum-volatility"]!.trailingSource, "factsheet");
  assert.ok(gmv.risk!.sharpe !== null);

  // provenance for every value group
  for (const k of ["monthly-income", "sustainable-enhanced-bonds", "multi-strategy"]) {
    for (const part of ["performance", "risk", "nav", "aum", "factsheet"]) assert.ok(data.provenance[`funds.${k}.${part}`], `provenance ${k}.${part}`);
  }
  assert.ok(data.provenance["funds.global-minimum-volatility.performance"]);
});

test("optional auth: bearer token or basic auth sent when configured", async () => {
  const b = await raw({ DATAPLATFORM_TOKEN: "tok123" });
  assert.ok(b.calls.every((c) => c.headers.authorization === "Bearer tok123"));
  const u = await raw({ DATAPLATFORM_USERNAME: "u", DATAPLATFORM_PASSWORD: "p" });
  assert.ok(u.calls.every((c) => c.headers.authorization === `Basic ${Buffer.from("u:p").toString("base64")}`));
});

test("FTSE_INDEX_SEST overrides the Monthly Income benchmark series", async () => {
  const { raw: r, calls } = await raw({ FTSE_INDEX_SEST: "short_corp" });
  assert.ok(calls.some((c) => c.url.includes("short_name=short_corp")));
  assert.equal(r.ftseIndex["monthly-income"], "short_corp");
  assert.equal(r.ftse.short_corp.ok, false, "no rows in the fixtures for short_corp");
});

test("unavailable / conflict month inside the track record: performance not updated (error), later months tolerated (info)", async () => {
  const withStatus = (month: string, status: string): Route => (url) => {
    if (url.pathname !== "/api/performance/monthly-net-returns" || url.searchParams.get("short_name") !== "SEB") return undefined;
    const j = loadFixture("dataplatform/mnr_SEB.json") as { rows: { month: string; status: string; net_return: number | null; issue: string | null }[] };
    for (const row of j.rows) if (row.month === month) Object.assign(row, { status, net_return: null, issue: "Incomplete Apex valuation-day coverage" });
    return json(j);
  };
  const hole = buildSiteData((await raw({}, withStatus("2025-03-31", "unavailable"))).raw, null, NOW).data;
  assert.equal(hole.funds["sustainable-enhanced-bonds"]!.performance, null);
  assert.ok(hole.issues.some((i) => i.level === "error" && i.key.startsWith("funds.sustainable-enhanced-bonds.performance") && i.message.includes("2025-03")));
  assert.ok(hole.funds["sustainable-enhanced-bonds"]!.nav, "other parts still built");

  const last = buildSiteData((await raw({}, withStatus("2026-08-31", "conflict"))).raw, null, NOW).data;
  assert.equal(last.funds["sustainable-enhanced-bonds"]!.performance!.asOf, "2026-07-31");
  assert.ok(last.issues.some((i) => i.level === "info" && i.message.includes("2026-08 conflict")));
});

test("track record < 12 months: performance and risk withheld (compliance), info issue", async () => {
  const short: Route = (url) => {
    if (url.pathname !== "/api/performance/monthly-net-returns" || url.searchParams.get("short_name") !== "Multistrat") return undefined;
    const j = loadFixture("dataplatform/mnr_Multistrat.json") as { rows: { month: string; status: string }[] };
    for (const row of j.rows) if (row.month < "2025-12-31") row.status = "unavailable";
    return json(j);
  };
  // Emulate a young fund: the configured track start is 2019, so craft the check through a start after the gap
  const { raw: r } = await raw({}, short);
  const mnr = r.monthlyReturns.Multistrat!.data!;
  mnr.rows = mnr.rows.filter((x) => x.month >= "2025-12-31");
  const { PIPELINE_FUNDS } = await import("../../../src/lib/pipeline/config.ts");
  const saved = PIPELINE_FUNDS["multi-strategy"].trackStart;
  PIPELINE_FUNDS["multi-strategy"].trackStart = "2025-12-31";
  try {
    const { data } = buildSiteData(r, null, NOW);
    const ms = data.funds["multi-strategy"]!;
    assert.equal(ms.performance, null);
    assert.equal(ms.risk, null);
    assert.ok(data.issues.some((i) => i.level === "info" && i.message.includes("< 12")));
  } finally {
    PIPELINE_FUNDS["multi-strategy"].trackStart = saved;
  }
});

test("factsheet trailing beyond rounding: warning; computed figure kept", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "fs-"));
  await cp(FIXTURE_FACTSHEETS_DIR, dir, { recursive: true });
  const f = path.join(dir, "bonds_data_2026-08.json");
  const j = JSON.parse(await readFile(f, "utf8"));
  const fund = j.SEST["Trailing Returns Net"]["Nymbus Monthly Income Fund"];
  const v = Number(fund["1Y"].replace("%", ""));
  fund["1Y"] = `${(v + 0.2).toFixed(1)}%`;
  await writeFile(f, JSON.stringify(j));
  const { data, context } = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir })).raw, null, NOW);
  assert.ok(data.issues.some((i) => i.level === "warn" && i.key === "funds.monthly-income.trailing.1Y"));
  assert.equal(data.funds["monthly-income"]!.performance!.trailing.fund["1Y"], trailing(mnrSeries("SEST"), "2026-08-31")["1Y"]);
  assert.equal(context["monthly-income"]!.factsheetTrailing!["1Y"], Number(((v + 0.2) / 100).toPrecision(12)));
});

test("index trailing computed from FTSE levels when the factsheet has no figure; FTSE failure falls back to previous index months", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "fs-"));
  await cp(FIXTURE_FACTSHEETS_DIR, dir, { recursive: true });
  const f = path.join(dir, "bonds_data_2026-08.json");
  const j = JSON.parse(await readFile(f, "utf8"));
  delete j["QCFI-SEB"]["Trailing Returns Net"]["FTSE Canada Universe Bond Index"];
  delete j["QCFI-SEB"]["Trailing Returns Net"]["Value Added"];
  await writeFile(f, JSON.stringify(j));
  const first = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir })).raw, null, NOW);
  const p = first.data.funds["sustainable-enhanced-bonds"]!.performance!;
  const idx: Series = Object.fromEntries(p.indexMonthly!.map((m) => [m.month, m.r]));
  const ti = trailing(idx, "2026-08-31", { siStart: "2019-02-28" });
  assert.equal(p.trailing.index!["3Y"], ti["3Y"]);
  assert.equal(p.trailing.va!["3Y"], p.trailing.fund["3Y"]! - ti["3Y"]!);
  // factsheet figures were rounded from the same synthetic series: computed ≈ published
  assert.ok(Math.abs(p.trailing.index!.SI! - 0.015) < 0.0006);

  const ftseDown: Route = (url) => (url.pathname === "/api/ftse/index-summary" ? json({ detail: "boom" }, 503) : undefined);
  const second = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir }, ftseDown)).raw, first.data, NOW);
  const p2 = second.data.funds["sustainable-enhanced-bonds"]!.performance!;
  assert.deepEqual(p2.indexMonthly, p.indexMonthly);
  assert.equal(p2.trailing.index!["3Y"], ti["3Y"]);
  assert.ok(second.data.issues.some((i) => i.level === "warn" && i.message.includes("FTSE univ unavailable")));
});

test("failed sources carry over previous values, with issues and provenance", async () => {
  const first = buildSiteData((await raw()).raw, null, NOW).data;
  const later = new Date("2026-09-30T14:00:00Z");
  const down: Route = (url) => (url.pathname.startsWith("/api/") ? json({ detail: "maintenance" }, 503) : undefined);
  const m = mockFetch(down);
  const r = await fetchAll({ fetchImpl: m.fetch, now: later, env: fixtureEnv({ FACTSHEET_DATA_DIR: path.join(os.tmpdir(), "does-not-exist-xyz") }) });
  assert.equal(r.aum.ok, false);
  assert.match(r.aum.error!, /HTTP 503/);
  const { data, context } = buildSiteData(r, first, later);
  const mi = data.funds["monthly-income"]!;
  assert.deepEqual(mi.performance, first.funds["monthly-income"]!.performance);
  assert.deepEqual(mi.nav, first.funds["monthly-income"]!.nav);
  assert.deepEqual(mi.aum, first.funds["monthly-income"]!.aum);
  assert.deepEqual(mi.characteristics, first.funds["monthly-income"]!.characteristics);
  assert.deepEqual(context["monthly-income"]!.parts, { performance: "carried", nav: "carried", aum: "carried", factsheet: "carried" });
  for (const part of ["performance", "nav", "aum", "factsheet"]) assert.match(data.provenance[`funds.monthly-income.${part}`], /^carried over from the publication of 2026-09-29/);
  assert.ok(data.issues.some((i) => i.level === "error" && i.key === "funds.monthly-income.performance"));
  assert.ok(data.issues.some((i) => i.level === "warn" && i.key === "funds.monthly-income.aum"));
  // sample data is never carried into live data
  const fromSample = buildSiteData(r, { ...first, mode: "sample" }, later).data;
  assert.equal(fromSample.funds["monthly-income"], undefined);
});
