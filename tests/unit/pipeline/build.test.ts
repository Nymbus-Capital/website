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
import { ftseFamily } from "../../../src/lib/pipeline/metrics.ts";
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

test("end to end: history from analytics + the dataplatform daily NAV chain + ready months, published index, every block", async () => {
  const { raw: r, calls } = await raw();
  assert.ok(calls.every((c) => c.url.startsWith("http://dataplatform.test/")), "only the configured base URL is called");
  assert.ok(calls.every((c) => !c.headers.authorization), "no auth header unless configured");
  const { data, context } = buildSiteData(r, null, NOW);
  assert.deepEqual(data.asOf, { performance: "2026-08-31", nav: "2026-09-28", aum: "2026-09-28", factsheet: "2026-08" });
  // the only warnings: the published 2026 index calendar rows (FTSE-era months differ from the synthetic ETF-era table),
  // the multi-strategy daily portfolio whose synthetic coverage is below the thresholds (factsheet shown), and the
  // short_corp history that starts with its 2024-12 naming generation (like the live data: no earlier name to join)
  // + the synthetic source defects of Monthly Income (a bad valuation print in every class, a drifting month of class I):
  // months withheld for every class
  const expectedWarn = (k: string) => /^funds\.[a-z-]+\.calendar\.2026\.index$/.test(k) || k === "funds.multi-strategy.portfolio" || k === "funds.monthly-income.performance.index" || k === "funds.monthly-income.trailing.index"
    || /^funds\.monthly-income\.performance\.classes(\.LDM0(31|61)(\.monthly\.\d{4}-\d{2}-\d{2})?)?$/.test(k);
  assert.deepEqual(data.issues.filter((i) => i.level !== "info" && !expectedWarn(i.key)), [], JSON.stringify(data.issues.filter((i) => i.level !== "info")));

  const mi = data.funds["monthly-income"]!;
  const p = mi.performance!;
  assert.equal(p.firstMonth, "2019-01-31");
  assert.equal(p.monthly.length, 92);
  assert.equal(p.monthly[p.monthly.length - 1].r, -0.00121918, "Aug 2026 = dataplatform ready month");
  // Jul 2026 (cut-over) = NAV bridge: Apex NAV per unit 2026-07-31 / CIBC NAV per unit 2026-06-30 − 1 (python3 from nav_history_LDM001.json)
  near(p.monthly[p.monthly.length - 2].r, -0.0013904499981939322);
  // python3 reference: analytics 2019-01..2021-10, LDM001 CIBC daily returns compounded 2021-11..2026-06, bridge, Apex
  near(p.trailing.fund["1Y"], 0.010394608382565895);
  near(p.trailing.fund["3Y"], 0.010184838677784747);
  near(p.trailing.fund.SI, 0.02269285607744842);
  near(p.trailing.fund.YTD, -0.0006194254199901605);
  assert.equal(p.trailing.fund["10Y"], null);
  // class label: derived from the class of the data (Monthly Income STRATEGY = FP)
  assert.equal(p.classCode, "STRATEGY");
  assert.equal(p.returnClass, "FP");
  assert.equal(p.returnClassLabel, "Series FP");
  assert.match(data.provenance["funds.monthly-income.performance"], /every month class_code STRATEGY, shown as class FP/);
  assert.match(data.provenance["funds.monthly-income.performance"], /analytics fund_returns\.json "Nymbus Monthly Income" \(34 month\(s\): 2019-01 to 2021-10/);
  // every index figure computed from FTSE short_corp levels (python3 reference from the fixture rows)
  assert.equal(p.indexName, "FTSE Canada Short Term Corporate Bond Index", "from /short-names index_name");
  near(p.trailing.index!["1M"], 0.003790669539088798);
  near(p.trailing.index!["1Y"], 0.0023965137671608794);
  // short_corp from 2024-12 only (no earlier generation at the dataplatform): no 2Y / 3Y / 5Y / SI index figure
  assert.equal(p.trailing.index!["3Y"], null);
  assert.equal(p.trailing.index!.SI, null);
  assert.ok(data.issues.some((i) => i.level === "warn" && i.key === "funds.monthly-income.trailing.index" && /index 2Y, 3Y, 5Y, SI not shown: FTSE short_corp does not cover the whole period/.test(i.message)));
  near(p.trailing.index!.YTD, -0.0030955530445111457);
  near(p.indexMonthly![p.indexMonthly!.length - 1].r, 0.003790669539088798);
  assert.equal(p.indexMonthly!.length, 20, "2025-01 to 2026-08");
  // VA = fund − FTSE index
  assert.match(data.provenance["funds.monthly-income.performance"], /nav-timeseries LDM001 \(cibc 2021-11 to 2026-06, bridge 2026-07\) daily NAV chain compounded by the website \(57 month/);
  assert.ok(data.issues.some((i) => i.level === "info" && /stored CIBC daily returns of class FP \(LDM001\) reproduce the analytics history on 56 month/.test(i.message)));
  near(p.trailing.va!["1Y"], p.trailing.fund["1Y"]! - 0.0023965137671608794, 1e-12);
  assert.equal(p.trailing.va!.SI, null);
  // class F (LDM081) from its own daily chain since its inception (2024-03-01, first month partial); the page opens on it;
  // I and J too; A (launched 2026-03: < 12 months) and F USD (no distribution-aware returns) show no figure
  assert.deepEqual(Object.keys(mi.performanceByClass!).sort(), ["LDM001", "LDM031", "LDM061", "LDM081"]);
  assert.equal(mi.classInfo!.LDM021.status, "young");
  assert.equal(mi.classInfo!.LDM011.status, "currency");
  assert.equal(mi.defaultClass, "LDM081");
  const f81 = mi.performanceByClass!.LDM081.performance;
  assert.equal(f81.firstMonth, "2024-03-31");
  assert.equal(f81.returnClassLabel, "Series F");
  assert.equal(f81.inception, "2024-03-01");
  assert.equal(f81.partialFirstMonth, true);
  near(f81.trailing.fund.SI, 0.008200559405328933);
  near(f81.trailing.fund["1Y"], 0.007370174765965132);
  assert.deepEqual(mi.performanceByClass!.LDM001.performance, p, "the headline class entry is the headline itself");
  const c2025 = p.calendar.find((r) => r.year === 2025)!;
  near(c2025.index, 0.02320695456298516);
  assert.equal(p.growth[p.growth.length - 1].index, null, "the index growth line needs every month since inception");
  // published index figures differ (ETF before 2026-05): info only
  assert.ok(data.issues.some((i) => i.level === "info" && i.key === "funds.monthly-income.trailing.index.1Y" && /expected before 2026-05/.test(i.message)));
  assert.equal(p.calendar[p.calendar.length - 1].partial, true);
  assert.equal(p.growth[0].date, "2018-12-31");
  assert.equal(p.growth[0].index, 10_000);
  assert.ok(mi.risk && mi.risk3Y);
  assert.match(data.provenance["funds.monthly-income.risk"], /month-end peaks only/);

  // C3: NAV daily change = Apex distribution-aware return from the previous valuation day
  const cls = Object.fromEntries(mi.nav!.classes.map((c) => [c.fundserv, c]));
  assert.deepEqual(Object.keys(cls), ["LDM001", "LDM021", "LDM081", "LDM011", "LDM031", "LDM061"], "dormant class excluded");
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

  // SEB: the track record (headline) is the class H series (analytics strategy months + LDM202 daily chain + Apex
  // months), LABELLED H; class F (LDM201) is compounded from its own daily chain since its inception (2023-07-05)
  const seb = data.funds["sustainable-enhanced-bonds"]!.performance!;
  assert.equal(seb.firstMonth, "2019-02-28");
  assert.equal(seb.classCode, "STRATEGY_H");
  assert.equal(seb.returnClass, "H");
  assert.equal(seb.returnClassLabel, "Series H");
  assert.match(data.provenance["funds.sustainable-enhanced-bonds.performance"], /every month class_code STRATEGY_H, shown as class H/);
  const sebF = data.funds["sustainable-enhanced-bonds"]!.performanceByClass!.LDM201!.performance;
  assert.equal(sebF.firstMonth, "2023-07-31");
  assert.equal(sebF.inception, "2023-07-05");
  assert.equal(sebF.classCode, "STRATEGY");
  assert.equal(sebF.returnClassLabel, "Series F");
  assert.equal(sebF.withheldMonths, undefined);
  near(sebF.trailing.fund.SI, 0.02930987039704447);
  near(sebF.trailing.fund["1Y"], -0.02622203240078491);
  assert.match(data.provenance["funds.sustainable-enhanced-bonds.performance.classes.LDM201"], /fundserv=LDM201 \(cibc 2023-07 to 2026-06, bridge 2026-07, apex 2026-08\); 38 month\(s\) shown; checks: coverage and method, bad valuation prints and cross-class consistency/);
  assert.equal(data.funds["sustainable-enhanced-bonds"]!.defaultClass, "LDM201");
  // the class-H factsheet is cross-checked as before (same class)
  assert.ok(context["sustainable-enhanced-bonds"]!.factsheetTrailing, "factsheet trailing cross-check kept for class H");
  // only main-branch contracts: monthly-net-returns with short_name and dates, each class's daily history by fundserv
  assert.ok(calls.every((c) => !/class_code=|history=/.test(c.url)), "no parameter the dataplatform main branch does not have");
  for (const fsv of ["LDM001", "LDM011", "LDM021", "LDM031", "LDM061", "LDM081", "LDM201", "LDM202", "LDM203", "LDM204", "LDM205", "LDM206", "LDM300", "LDM301", "LDM303", "LDM304", "LDM305"]) assert.ok(calls.some((c) => c.url.includes("/api/performance/nav-timeseries?") && c.url.includes(`fundserv=${fsv}`)), fsv);
  assert.ok(calls.every((c) => !/fund-portfolio|\/api\/performance\/distributions/.test(c.url)), "no endpoint that only exists on an unmerged dataplatform branch");
  // FTSE univ, history chain-linked over its earlier generation univ_overall (python3 reference from the two fixture files)
  near(seb.trailing.index!["1Y"], -0.031101481717578983);
  near(seb.trailing.index!.SI, 0.015257215399883783);
  assert.equal(seb.indexMonthly!.length, 91);
  assert.equal(data.funds["multi-strategy"]!.performance!.returnClass, "F");

  // Multi-strategy: python3 SI 0.07627904672671759 (analytics to 2023-06, LDM301 chain), no benchmark
  const ms = data.funds["multi-strategy"]!.performance!;
  near(ms.trailing.fund.SI, 0.07627904672671759);
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

test("FTSE history: an earlier naming generation is chain-linked only on equal daily returns over a common period", async () => {
  const { raw: r } = await raw();
  const u = r.ftse.univ.data!;
  assert.equal(u.first, "2018-12-27", "history from the earlier generation");
  assert.deepEqual(u.joined, ["univ_overall"]);
  assert.match(r.ftse.univ.detail!, /earlier days under univ_overall from 2018-12-27 \(configured earlier name; linked at 2024-11-25 on 9 equal daily return\(s\)\)/);
  // the levels were re-based (× 0.87): chain-linked, so the month-end returns are the earlier name's own
  type Row = { date: string; rating: string | null; term: string | null; total_return: number };
  const old = loadFixture("dataplatform/ftse_univ_overall.json") as Row[];
  const agg = (rows: Row[], d: string) => rows.find((x) => x.date === d && x.rating === null && x.term === null)!.total_return;
  near(u.levels["2024-10-31"] / u.levels["2024-09-30"] - 1, agg(old, "2024-10-31") / agg(old, "2024-09-30") - 1, 1e-15);
  // short_corp: like the live data, no earlier name (nothing with its index_id or family in /short-names)
  assert.equal(r.ftse.short_corp.data!.first, "2024-12-02");
  assert.match(r.ftse.short_corp.detail!, /no earlier name found \(none with index_id 1101 or family "short corp" among 5 short-names\)/);

  // an earlier short_corp generation (other index_id, same name family): its rows up to `until`, levels re-based, and
  // 24 synthetic month-ends before the current name's first day
  const names = loadFixture("dataplatform/ftse_short_names.json") as object[];
  const cur = (loadFixture("dataplatform/ftse_short_corp.json") as Row[]).filter((x) => x.rating === null && x.term === null);
  const earlier = (o: { until: string; noise?: number; name?: string; indexName?: string }): Route => {
    const name = o.name ?? "ftse_tmx_canada_short_corp";
    const base = { short_name: name, index_name: o.indexName ?? "FTSE TMX Canada Short Term Corporate Bond Index", rating: null, term: null, industry_sector: null, industry_group: null };
    const rows: (typeof base & { date: string; total_return: number })[] = cur.filter((x) => x.date <= o.until).map((x) => ({ ...base, date: x.date, total_return: x.total_return * 0.5 * (x.date === "2024-12-04" ? 1 + (o.noise ?? 0) : 1) }));
    let level = cur[0].total_return * 0.5;
    for (let i = 0; i < 24; i++) {
      const d = new Date(Date.UTC(2024, 11 - i, 0)).toISOString().slice(0, 10); // 2024-11-30, 2024-10-31, …
      level /= 1.002;
      rows.unshift({ ...base, date: d, total_return: level });
    }
    return (url) => {
      if (url.pathname === "/api/ftse/index-summary/short-names") return json([...names, { short_name: name, index_id: 7777, index_name: base.index_name }]);
      if (url.pathname === "/api/ftse/index-summary" && url.searchParams.get("short_name") === name) return json(rows);
      return undefined;
    };
  };
  const ok = await raw({}, earlier({ until: "2024-12-09" }));
  assert.deepEqual(ok.raw.ftse.short_corp.data!.joined, ["ftse_tmx_canada_short_corp"]);
  assert.equal(ok.raw.ftse.short_corp.data!.first, "2022-12-31");
  assert.match(ok.raw.ftse.short_corp.detail!, /earlier days under ftse_tmx_canada_short_corp from 2022-12-31 \(same index family "short corp" \(FTSE TMX Canada Short Term Corporate Bond Index\); linked at 2024-12-02 on 5 equal daily return\(s\)\)/);
  near(ok.raw.ftse.short_corp.data!.levels["2024-11-29"] ?? ok.raw.ftse.short_corp.data!.levels["2024-11-30"], cur[0].total_return / 1.002, 1e-9);
  // the same name with different daily returns on the common days: another index, not joined
  const differ = await raw({}, earlier({ until: "2024-12-09", noise: 0.002 }));
  assert.equal(differ.raw.ftse.short_corp.data!.first, "2024-12-02");
  assert.match(differ.raw.ftse.short_corp.detail!, /not joined: ftse_tmx_canada_short_corp \(daily returns differ on common days \(up to \d+\.\d+ bp\): another index\)/);
  // too short an overlap to compare 5 daily returns
  const short = await raw({}, earlier({ until: "2024-12-04" }));
  assert.match(short.raw.ftse.short_corp.detail!, /not joined: ftse_tmx_canada_short_corp \(3 common day\(s\): at least 6 needed to compare daily returns\)/);
  // stopping the day before the current name starts: no overlap to verify the re-based levels, not joined
  const seam = await raw({}, earlier({ until: "2024-11-30" }));
  assert.equal(seam.raw.ftse.short_corp.data!.first, "2024-12-02");
  assert.match(seam.raw.ftse.short_corp.detail!, /not joined: ftse_tmx_canada_short_corp \(no level on 2024-12-02 \(no overlap\); gap link not verified: levels [\d.]+ on 2024-11-30 and [\d.]+ on 2024-12-02 differ by 100\.40% \(re-based\)\)/);
  // the admin sees the names that look like an earlier generation
  assert.match(seam.raw.ftse.short_corp.detail!, /short-names whose name contains "short corp": ftse_tmx_canada_short_corp \(FTSE TMX Canada Short Term Corporate Bond Index, index_id 7777\)/);
  // a sibling of another family is never a candidate
  const sib = await raw({}, earlier({ until: "2024-12-09", name: "short_overall_x", indexName: "FTSE Canada Short Term Overall Bond Index" }));
  assert.equal(sib.raw.ftse.short_corp.data!.first, "2024-12-02");
  assert.ok(!/short_overall_x/.test(sib.raw.ftse.short_corp.detail!));
});

test("ftseFamily: publisher prefixes, Bond Index, Overall and Term do not change the family", () => {
  assert.equal(ftseFamily("FTSE Canada Universe Bond Index"), "univ");
  assert.equal(ftseFamily("FTSE Canada Universe Overall Bond Index"), "univ");
  assert.equal(ftseFamily("FTSE TMX Canada Universe Bond Index"), "univ");
  assert.equal(ftseFamily("FTSE Canada Short Term Corporate Bond Index"), "short corp");
  assert.equal(ftseFamily("DEX Short Term Corporate Bond Index"), "short corp");
  assert.equal(ftseFamily("FTSE Canada Short Term Overall Bond Index"), "short");
  assert.equal(ftseFamily("FTSE Canada Universe Corporate Bond Index"), "univ corp");
  assert.equal(ftseFamily(null), "");
});
test("H1: a month missing from every source interrupts the track record (error); analytics vs dataplatform difference warns", async () => {
  const hole: Route = () => undefined;
  const dir = await fsCopy();
  const af = path.join(dir, "an.json");
  const an = loadFixture("analytics_fund_returns.json") as { dates: string[]; returns: Record<string, (number | null)[]> };
  // months before the class's own NAV history (strategy track record) exist in the analytics history only
  an.returns["Nymbus Sustainable Enhanced Bonds"][an.dates.indexOf("2022-03-31")] = null;
  an.returns["Nymbus Monthly Income"][an.dates.indexOf("2020-07-31")] = null; // filled by the factsheet table (1.17%)
  an.returns["Nymbus Monthly Income"][an.dates.indexOf("2026-07-31")] = null; // the cut-over month: NAV bridge
  await writeFile(af, JSON.stringify(an));
  for (const f of ["bonds_data_2026-08.json", "bonds_data_2026-07.json"]) await editJson(path.join(dir, f), (j) => { delete j["QCFI-SEB"]["Monthly Returns: Nymbus QCFI-SEB Net"]["2022"]; });
  const { data } = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir, ANALYTICS_RETURNS_FILE: af }, hole)).raw, null, NOW);
  assert.equal(data.funds["sustainable-enhanced-bonds"]!.performance, null, "track record 2019-02..2022-02 cannot reach the as-of");
  assert.ok(data.issues.some((i) => i.level === "error" && /interrupted after 2022-02: 2022-03 missing/.test(i.message)));
  const mi = data.funds["monthly-income"]!.performance!.monthly;
  assert.equal(mi.find((x) => x.month === "2020-07-31")!.r, 0.0117, "factsheet table value (2 decimals)");
  assert.ok(data.issues.some((i) => i.level === "warn" && /2020-07: factsheet .* figures used/.test(i.message)));
  near(mi.find((x) => x.month === "2026-07-31")!.r, -0.0013904499981939322, 1e-15);

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

test("H3: by default a new month does not wait for its factsheet; opt-in waits (held, info); an inconsistent factsheet blocks the new month", async () => {
  const prevDir = await fsCopy();
  await rm(path.join(prevDir, "bonds_data_2026-08.json"));
  await rm(path.join(prevDir, "factsheet_data_2026-08.json"));
  // default (the factsheet job is not a dependency any more): August published without its factsheet
  const dflt = buildSiteData((await raw({ FACTSHEET_DATA_DIR: prevDir })).raw, null, NOW);
  assert.equal(dflt.data.funds["monthly-income"]!.performance!.asOf, "2026-08-31");
  const first = buildSiteData((await raw({ FACTSHEET_DATA_DIR: prevDir })).raw, null, NOW, { requireFactsheetForNewMonth: true });
  // opt-in, no previous publication: the newest cross-checkable month is July
  const p = first.data.funds["monthly-income"]!.performance!;
  assert.equal(p.asOf, "2026-07-31");
  near(p.trailing.fund["1Y"], 0.004947973070355882);
  assert.equal(first.context["monthly-income"]!.parts.performance, "held");
  assert.ok(first.data.issues.some((i) => i.level === "info" && /2026-08 not published yet: waiting for the factsheet of 2026-08/.test(i.message)));
  assert.ok(!first.context["monthly-income"]!.alerts.length, "waiting is not an alert");

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

/* ------------------------------------------------------------------ verifier round (N1, N4) */

async function julyOnly(): Promise<SiteData> {
  const d0 = await fsCopy();
  await rm(path.join(d0, "bonds_data_2026-08.json"));
  await rm(path.join(d0, "factsheet_data_2026-08.json"));
  return buildSiteData((await raw({ FACTSHEET_DATA_DIR: d0 })).raw, null, NOW, { requireFactsheetForNewMonth: true }).data;
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
    // opt-in factsheet gate: August waits for a usable factsheet
    const b = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir })).raw, first, NOW, { requireFactsheetForNewMonth: true });
    const p = b.data.funds["monthly-income"]!.performance!;
    assert.equal(p.asOf, "2026-07-31", "August not cross-checked: not published under the opt-in gate");
    near(p.trailing.fund["1Y"], 0.004947973070355882);
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

test("N0: by default a new month the dataplatform views disagree on is withheld (chain vs monthly-net-returns)", async () => {
  const first = await julyOnly();
  const b = buildSiteData((await raw({}, wrongAug)).raw, first, NOW);
  assert.equal(b.data.funds["monthly-income"]!.performance!.asOf, "2026-07-31", "August (20 % at monthly-net-returns, -0.12 % in the daily chain) not published");
  assert.ok(b.data.issues.some((i) => i.level === "error" && /2026-08: daily NAV chain -0\.1219% vs monthly-net-returns 20\.0000%: two dataplatform views of the same days disagree; month withheld/.test(i.message)));
});

test("N4: analytics unavailable -> factsheet-rebuilt history alerts, risk statistics withheld", async () => {
  const { data, context } = buildSiteData((await raw({ ANALYTICS_RETURNS_FILE: path.join(os.tmpdir(), "nope-analytics.json") })).raw, null, NOW);
  const mi = data.funds["monthly-income"]!;
  assert.equal(mi.performance!.monthly[0].r, 0.0057, "2019-01 as printed in the factsheet table (0.57 %)");
  assert.equal(mi.risk, null);
  assert.equal(mi.risk3Y, null);
  // 2019-01..2026-06 rebuilt (the stored CIBC daily returns cannot be verified without the analytics history); the cut-over
  // month from the NAV bridge (its own gates), August from the dataplatform
  assert.ok(context["monthly-income"]!.alerts.some((a) => /analytics history unavailable: 90 month\(s\) rebuilt/.test(a)), JSON.stringify(context["monthly-income"]!.alerts));
  assert.ok(data.issues.some((i) => /only 0 month\(s\) in common with the analytics history/.test(i.message)));
  assert.ok(data.issues.some((i) => i.key === "funds.monthly-income.risk" && /rounded factsheet figures/.test(i.message)));
});


test("FTSE for all benchmarks: a published index month after the cutover that differs -> warn; FTSE still shown", async () => {
  const dir = await fsCopy();
  await editJson(path.join(dir, "bonds_data_2026-08.json"), (j) => { j["QCFI-SEB"]["Monthly Returns: FTSE Canada Universe Bond Index"]["2026"]["06-Jun"] = "0.90%"; });
  const { data } = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir })).raw, null, NOW);
  assert.ok(data.issues.some((i) => i.level === "warn" && /published index months differ from FTSE univ for 2026-06 \(2026-06: published 0\.90% vs FTSE/.test(i.message)));
  const jun = data.funds["sustainable-enhanced-bonds"]!.performance!.indexMonthly!.find((x) => x.month === "2026-06-30")!.r;
  assert.notEqual(jun, 0.009, "FTSE value, not the published one");
});

test("FTSE for all benchmarks: no factsheet index table / published VA changed -> index still from FTSE; VA = fund − FTSE", async () => {
  const dir = await fsCopy();
  for (const f of ["bonds_data_2026-08.json", "bonds_data_2026-07.json"]) await editJson(path.join(dir, f), (j) => {
    delete j.SEST["Monthly Returns: FTSE Canada Short Term Corporate Bond Index"];
    j.SEST["Trailing Returns Net"]["Value Added"]["1Y"] = "+9.9%";
  });
  const { data, context } = buildSiteData((await raw({ FACTSHEET_DATA_DIR: dir })).raw, null, NOW);
  const p = data.funds["monthly-income"]!.performance!;
  near(p.trailing.index!["1Y"], 0.0023965137671608794);
  near(p.trailing.va!["1Y"], p.trailing.fund["1Y"]! - 0.0023965137671608794, 1e-12);
  assert.deepEqual(context["monthly-income"]!.alerts, [], "no N5 alert any more");
  assert.ok(data.issues.some((i) => i.key === "funds.monthly-income.trailing.va.1Y" && i.level === "info"), "published VA: cross-check only");
});

test("FTSE for all benchmarks: a period FTSE does not cover is null with an issue (never filled from the factsheet)", async () => {
  // FTSE short_corp only from 2024-12: SI / 5Y / 3Y cannot be computed
  const cut: Route = (url) => {
    if (url.pathname !== "/api/ftse/index-summary" || url.searchParams.get("short_name") !== "short_corp") return undefined;
    const rows = loadFixture("dataplatform/ftse_short_corp.json") as { date: string }[];
    return json(rows.filter((r) => r.date >= "2024-11-27"));
  };
  const { data } = buildSiteData((await raw({}, cut)).raw, null, NOW);
  const t = data.funds["monthly-income"]!.performance!.trailing;
  assert.equal(t.index!.SI, null);
  assert.equal(t.index!["5Y"], null);
  assert.equal(t.index!["3Y"], null);
  assert.equal(t.va!.SI, null);
  near(t.index!["1Y"], 0.0023965137671608794);
  assert.ok(data.issues.some((i) => i.level === "warn" && /index 2Y, 3Y, 5Y, SI not shown: FTSE short_corp does not cover the whole period/.test(i.message)));
  const cal2019 = data.funds["monthly-income"]!.performance!.calendar.find((r) => r.year === 2019)!;
  assert.equal(cal2019.index, null);
  // FTSE unavailable: no index figure at all
  const down: Route = (url) => (url.pathname === "/api/ftse/index-summary" ? json({ detail: "x" }, 500) : undefined);
  const d2 = buildSiteData((await raw({}, down)).raw, null, NOW).data;
  assert.equal(d2.funds["monthly-income"]!.performance!.trailing.index!["1Y"], null);
  assert.equal(d2.funds["monthly-income"]!.performance!.indexName, "FTSE Canada Short Term Corporate Bond Index", "fallback to the funds.ts benchmark label");
  assert.ok(d2.issues.some((i) => i.level === "warn" && /FTSE short_corp unavailable .*: no index figure shown/.test(i.message)));
});
