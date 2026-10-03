/**
 * Review fixes of 2026-10-03 (integ/v3 review): bridge confirmation (M2), class-entry class change and revisions (M4),
 * net assets of every active register class (m9), data start from the register (m10), monthly-net-returns aggregating
 * several Apex classes (m12). Synthetic fixtures only.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, cp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildSiteData, computedBook, effectiveNavStart } from "../../../src/lib/pipeline/build.ts";
import { validateSite } from "../../../src/lib/pipeline/validate.ts";
import { fetchAll } from "../../../src/lib/pipeline/sources/index.ts";
import { FUNDS } from "../../../src/config/funds.ts";
import type { RawPayloads } from "../../../src/lib/pipeline/raw.ts";
import type { SiteData } from "../../../src/lib/data/types.ts";
import { FIXTURE_FACTSHEETS_DIR, fixtureEnv, json, loadFixture, mockFetch, type Route } from "../../fixtures/pipeline/mock-fetch.ts";

const NOW = new Date("2026-09-29T14:00:00Z");
const SEB = "sustainable-enhanced-bonds";
const MI = "monthly-income";

async function raw(env: Record<string, string | undefined> = {}, ...routes: Route[]): Promise<RawPayloads> {
  return fetchAll({ fetchImpl: mockFetch(...routes).fetch, now: NOW, env: fixtureEnv(env) });
}

/** the analytics history without SEB's July 2026 month */
async function analyticsWithoutSebJuly(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "an-m2-"));
  const j = JSON.parse(await readFile(fixtureEnv().ANALYTICS_RETURNS_FILE!, "utf8")) as { dates: string[]; returns: Record<string, (number | null)[]> };
  const i = j.dates.findIndex((d) => d.slice(0, 7) === "2026-07");
  j.returns["Nymbus Sustainable Enhanced Bonds"][i] = null;
  const file = path.join(dir, "fund_returns.json");
  await writeFile(file, JSON.stringify(j));
  return file;
}

/** a copy of the factsheet archives with the SEB July 2026 monthly figure replaced */
async function sebJuly(value: string): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "fs-m2-"));
  await cp(FIXTURE_FACTSHEETS_DIR, dir, { recursive: true });
  const file = path.join(dir, "bonds_data_2026-08.json");
  const j = JSON.parse(await readFile(file, "utf8"));
  j["QCFI-SEB"]["Monthly Returns: Nymbus QCFI-SEB Net"]["2026"]["07-Jul"] = value;
  await writeFile(file, JSON.stringify(j));
  return dir;
}

test("M2: without an analytics July, the bridge needs a same-class factsheet printing July; a disagreement withholds the month", async () => {
  // SEB analytics without July; the August (class H) archive prints July within precision: bridge used
  const an = await analyticsWithoutSebJuly();
  const ok = buildSiteData(await raw({ ANALYTICS_RETURNS_FILE: an }), null, NOW).data;
  assert.equal(ok.funds[SEB]!.performance!.asOf, "2026-08-31");
  assert.match(ok.provenance[`funds.${SEB}.performance`], /bridge 2026-07/);
  // the archive prints another July figure: neither is used, the track record stops at June
  const off = buildSiteData(await raw({ ANALYTICS_RETURNS_FILE: an, FACTSHEET_DATA_DIR: await sebJuly("-3.21%") }), null, NOW).data;
  assert.ok(off.issues.some((i) => i.key === `funds.${SEB}.performance` && /cut-over month 2026-07: NAV bridge .* vs factsheet bonds_data_2026-08.* \(beyond print precision\): month withheld \(neither is used\)/.test(i.message)), JSON.stringify(off.issues.filter((i) => /2026-07/.test(i.message))));
  assert.ok(off.issues.some((i) => /track record interrupted after 2026-06/.test(i.message)));
  // no July figure anywhere: the bridge is not used
  const none = buildSiteData(await raw({ ANALYTICS_RETURNS_FILE: an, FACTSHEET_DATA_DIR: await sebJuly("nan") }), null, NOW).data;
  assert.ok(none.issues.some((i) => /cut-over month 2026-07: NAV bridge .* has no independent confirmation .*: bridge not used/.test(i.message)));
});

test("M4: a class entry changing class needs an approval like the headline; its revised months are reported (warn + alert)", async () => {
  const r = await raw();
  const first = buildSiteData(r, null, NOW);
  const prev: SiteData = validateSite(first.data, first.context, null, NOW).data;
  // the previous publication's SEB F entry carried another class: a class change of that entry
  const relabelled: SiteData = structuredClone(prev);
  relabelled.funds[SEB]!.performanceByClass!.LDM201.performance.classCode = "LDM201";
  const b = buildSiteData(r, relabelled, NOW);
  const v = validateSite(b.data, b.context, relabelled, NOW);
  assert.deepEqual(v.classChanges, [SEB]);
  assert.ok(v.data.issues.some((i) => i.key === `funds.${SEB}.performance.class` && /class entry LDM201 from LDM201 \(LDM201\) to F \(STRATEGY\)/.test(i.message)));
  assert.deepEqual(v.autoData.funds[SEB]!.performanceByClass!.LDM201.performance.classCode, "LDM201", "auto mode keeps the previous publication");
  // the default class changing is gated too
  const otherDefault: SiteData = structuredClone(prev);
  otherDefault.funds[SEB]!.defaultClass = "LDM202";
  const b2 = buildSiteData(r, otherDefault, NOW);
  assert.ok(validateSite(b2.data, b2.context, otherDefault, NOW).data.issues.some((i) => /default class from LDM202 to LDM201/.test(i.message)));
  // a published month of class F (LDM081) revised: warn + alert
  const revised: SiteData = structuredClone(prev);
  const m = revised.funds[MI]!.performanceByClass!.LDM081.performance.monthly.find((x) => x.month === "2025-05-31")!;
  m.r += 0.002;
  const b3 = buildSiteData(r, revised, NOW);
  assert.ok(b3.data.issues.some((i) => i.key === `funds.${MI}.performance.classes.LDM081.monthly` && /class F \(LDM081\): revised month\(s\) already published: 2025-05/.test(i.message)));
  assert.ok(b3.context[MI]!.alerts.some((a) => /class F \(LDM081\): 1 published month\(s\) revised/.test(a)));
  assert.ok(b3.context[MI]!.revisions.some((x) => x.fundserv === "LDM081" && x.month === "2025-05-31"));
});

test("m9: net assets need every active register class of the day; a partial sum is never the denominator", async () => {
  const full = await raw();
  const book = computedBook(full, "SEST", "latest")!;
  assert.equal(book.data!.method.denominator, "net_assets_cad");
  // LDM021 (active) without its Apex row on the book date
  const noA: Route = (u) => {
    if (u.pathname !== "/api/performance/nav-timeseries" || u.searchParams.get("short_name") !== "SEST" || u.searchParams.get("fundserv")) return undefined;
    const j = loadFixture("dataplatform/nav_SEST.json") as { rows: { date: string; fundserv: string; source: string }[] };
    return json({ ...j, rows: j.rows.filter((x) => !(x.fundserv === "LDM021" && x.date === "2026-09-28" && x.source === "apex")) });
  };
  const partial = computedBook(await raw({}, noA), "SEST", "latest")!;
  assert.equal(partial.data!.method.denominator, "positions_plus_cash");
  assert.ok(partial.data!.warnings.some((w) => /net assets of 2026-09-28 unavailable: an active register class \(LDM001, LDM021, LDM081, LDM011\) has no Apex closing capital that day/.test(w)), JSON.stringify(partial.data!.warnings));
});

test("m10: the data start is the register's fund_data_start, never before the register inception (later one used, warned)", async () => {
  const spec = FUNDS.find((f) => f.key === MI)!;
  assert.deepEqual(effectiveNavStart(await raw(), spec), { start: "2021-10-05", note: null });
  const later: Route = (u) => {
    if (u.pathname !== "/api/apex/funds") return undefined;
    const j = loadFixture("dataplatform/apex_funds.json") as { key: string; inception: string | null }[];
    return json(j.map((f) => (f.key === "monthly_income" ? { ...f, inception: "2022-01-04" } : f)));
  };
  const r = await raw({}, later);
  assert.deepEqual(effectiveNavStart(r, spec), { start: "2022-01-04", note: "register inception 2022-01-04 differs from the configured data start 2021-10-05: the later one is used" });
  const d = buildSiteData(r, null, NOW).data;
  assert.ok(d.issues.some((i) => i.key === `funds.${MI}.performance` && i.level === "warn" && /register inception 2022-01-04 differs/.test(i.message)));
  // 2022-01-04 is the first valuation day of January 2022 (the 3rd is the observed New Year holiday): January is the first month
  assert.match(d.provenance[`funds.${MI}.performance`], /LDM001 \(cibc 2022-01 to 2026-06/);
});

test("m12: monthly-net-returns unavailable because the dataplatform aggregates two Apex classes: explained by an alert", async () => {
  const mnr: Route = (u) => {
    if (u.pathname !== "/api/performance/monthly-net-returns" || u.searchParams.get("short_name") !== "SEB") return undefined;
    const j = loadFixture("dataplatform/mnr_SEB.json") as { rows: { month: string; status: string; net_return: number | null; issue?: string | null }[] };
    Object.assign(j.rows.find((x) => x.month === "2026-08-31")!, { status: "unavailable", net_return: null, issue: "A complete distribution-aware Apex net-return chain is unavailable" });
    return json(j);
  };
  const nav: Route = (u) => {
    if (u.pathname !== "/api/performance/nav-timeseries" || u.searchParams.get("short_name") !== "SEB" || u.searchParams.get("fundserv")) return undefined;
    const j = loadFixture("dataplatform/nav_SEB.json") as { rows: Record<string, unknown>[] };
    return json({ ...j, rows: [...j.rows, { date: "2026-08-20", short_name: "SEB", class_code: "STRATEGY_H", fundserv: null, source: "apex", currency: "CAD", nav_type: "FINAL_NAV", return_source_count: 2 }] });
  };
  const b = buildSiteData(await raw({}, mnr, nav), null, NOW);
  assert.ok(b.context[SEB]!.alerts.some((a) => /2026-08: monthly-net-returns STRATEGY_H is unavailable because the dataplatform aggregates 2 Apex classes into its STRATEGY_H row \(return_source_count 2 on 2026-08-20\)/.test(a)), JSON.stringify(b.context[SEB]!.alerts));
  // without that evidence: the month is not used, no such alert
  const plain = buildSiteData(await raw({}, mnr), null, NOW);
  assert.ok(!plain.context[SEB]!.alerts.some((a) => /aggregates/.test(a)));
  // the month never comes from the chain alone; the same-class factsheet table fills it (rounded, warned)
  assert.ok(plain.data.issues.some((i) => /2026-08: daily NAV chain complete, monthly-net-returns says unavailable .*: month not used/.test(i.message)));
});
