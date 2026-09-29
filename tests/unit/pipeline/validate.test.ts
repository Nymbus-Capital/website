import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSiteData, type BuildResult } from "../../../src/lib/pipeline/build.ts";
import { fetchAll } from "../../../src/lib/pipeline/sources/index.ts";
import { validateSite, validateFund, nonFinitePaths } from "../../../src/lib/pipeline/validate.ts";
import type { SiteData } from "../../../src/lib/data/types.ts";
import { fixtureEnv, mockFetch } from "../../fixtures/pipeline/mock-fetch.ts";

const NOW = new Date("2026-09-29T14:00:00Z");

async function built(): Promise<BuildResult> {
  const raw = await fetchAll({ fetchImpl: mockFetch().fetch, now: NOW, env: fixtureEnv() });
  return buildSiteData(raw, null, NOW);
}
const clone = <T>(x: T): T => structuredClone(x);

test("clean fixtures pass every gate", async () => {
  const b = await built();
  const v = validateSite(b.data, b.context, null, NOW);
  for (const r of v.results) {
    assert.deepEqual(r.blocking, [], `${r.fund}: ${JSON.stringify(r.blocking)}`);
    assert.deepEqual(r.alerts, [], `${r.fund}: ${JSON.stringify(r.alerts)}`);
  }
  assert.deepEqual(v.funds, { "monthly-income": "updated", "sustainable-enhanced-bonds": "updated", "multi-strategy": "updated", "global-minimum-volatility": "updated" });
  assert.deepEqual(v.data.funds, b.data.funds);
  assert.equal(validateFund(b.data.funds["multi-strategy"]!, b.context["multi-strategy"], null, NOW).blocking.length, 0);
});

/** previous publication = clean build; `mutate` breaks the new one */
async function scenario(mutate: (d: SiteData, b: BuildResult) => void, key: keyof SiteData["funds"] = "monthly-income") {
  const prevB = await built();
  const previous = validateSite(prevB.data, prevB.context, null, NOW).data;
  const b = await built();
  mutate(b.data, b);
  const v = validateSite(b.data, b.context, previous, NOW);
  const r = v.results.find((x) => x.fund === key)!;
  return { v, r, previous };
}

test("blocking: performance as-of going backwards", async () => {
  const { v, r, previous } = await scenario((d) => {
    const p = d.funds["monthly-income"]!.performance!;
    p.monthly = p.monthly.slice(0, -1);
    p.asOf = "2026-07-31";
  });
  assert.ok(r.blocking.some((i) => i.key === "funds.monthly-income.performance.asOf" && /earlier than/.test(i.message)));
  assert.equal(v.funds["monthly-income"], "kept-previous");
  assert.deepEqual(v.data.funds["monthly-income"], previous.funds["monthly-income"], "previous FundData kept");
  assert.equal(v.funds["sustainable-enhanced-bonds"], "updated", "other funds unaffected");
  assert.ok(v.data.issues.some((i) => i.key === "funds.monthly-income" && /previously published data kept/.test(i.message)));
  assert.match(v.data.provenance["funds.monthly-income.performance"], /^carried over from the publication of/);
});

test("blocking: monthly return beyond ±25 % (fund and index)", async () => {
  const { r } = await scenario((d) => { d.funds["monthly-income"]!.performance!.monthly[10].r = 0.26; });
  assert.ok(r.blocking.some((i) => /outside ±25%/.test(i.message)));
  const { r: r2 } = await scenario((d) => { d.funds["sustainable-enhanced-bonds"]!.performance!.indexMonthly![3].r = -0.3; }, "sustainable-enhanced-bonds");
  assert.ok(r2.blocking.some((i) => i.key.includes("indexMonthly")));
});

test("blocking: trailing in data differs from recomputation", async () => {
  const { r } = await scenario((d) => { d.funds["monthly-income"]!.performance!.trailing.fund["3Y"]! += 0.0001; });
  assert.ok(r.blocking.some((i) => i.key === "funds.monthly-income.trailing.3Y" && /recomputation/.test(i.message)));
  const { r: r2 } = await scenario((d) => { d.funds["monthly-income"]!.performance!.trailing.fund["10Y"] = 0.05; });
  assert.ok(r2.blocking.some((i) => i.key === "funds.monthly-income.trailing.10Y"), "a value where the track record is too short");
});

test("blocking: computed trailing vs factsheet beyond the per-period tolerance (1Y: 0.1 %, 3Y: 0.15 %)", async () => {
  // 1Y: tolerance 0.0005 (rounding) + 0.0005 = 0.001
  const { r, v } = await scenario((_d, b) => { b.context["monthly-income"]!.factsheetTrailing!["1Y"] = b.data.funds["monthly-income"]!.performance!.trailing.fund["1Y"]! + 0.00101; });
  assert.ok(r.blocking.some((i) => i.key === "funds.monthly-income.trailing.1Y" && /factsheet/.test(i.message)));
  assert.equal(v.funds["monthly-income"], "kept-previous");
  const { r: ok } = await scenario((_d, b) => { b.context["monthly-income"]!.factsheetTrailing!["1Y"] = b.data.funds["monthly-income"]!.performance!.trailing.fund["1Y"]! - 0.00099; });
  assert.deepEqual(ok.blocking, []);
  // 3Y: 0.0005 + 0.001 = 0.0015
  const { r: ok3 } = await scenario((_d, b) => { b.context["monthly-income"]!.factsheetTrailing!["3Y"] = b.data.funds["monthly-income"]!.performance!.trailing.fund["3Y"]! + 0.00149; });
  assert.deepEqual(ok3.blocking, []);
  const { r: bad3 } = await scenario((_d, b) => { b.context["monthly-income"]!.factsheetTrailing!["3Y"] = b.data.funds["monthly-income"]!.performance!.trailing.fund["3Y"]! + 0.00151; });
  assert.ok(bad3.blocking.some((i) => i.key === "funds.monthly-income.trailing.3Y"));
});

test("blocking: non-finite number anywhere", async () => {
  const { r } = await scenario((d) => { d.funds["monthly-income"]!.risk!.sortino = Number.POSITIVE_INFINITY; });
  assert.ok(r.blocking.some((i) => i.key === "funds.monthly-income.risk.sortino"));
  const { r: r2 } = await scenario((d) => { d.funds["monthly-income"]!.breakdowns.credit![0].fund = Number.NaN; });
  assert.ok(r2.blocking.some((i) => i.key.startsWith("funds.monthly-income.breakdowns.credit")));
  assert.deepEqual(nonFinitePaths({ a: [1, Number.NaN], b: { c: -Infinity } }, "x"), ["x.a[1]", "x.b.c"]);
});

test("blocking without a previous publication: fund withheld", async () => {
  const b = await built();
  b.data.funds["multi-strategy"]!.performance!.monthly[0].r = 0.5;
  const v = validateSite(b.data, b.context, null, NOW);
  assert.equal(v.funds["multi-strategy"], "unavailable");
  assert.equal(v.data.funds["multi-strategy"], undefined);
  assert.ok(v.data.issues.some((i) => i.key === "funds.multi-strategy" && /withheld/.test(i.message)));
});

test("NAV day change > 10 %: class dropped, previous value kept, rest of the fund published", async () => {
  const { v, r, previous } = await scenario((d) => {
    const k = d.funds["monthly-income"]!.nav!.classes.find((c) => c.fundserv === "LDM021")!;
    k.nav = k.prevNav! * 1.12;
    k.changePct = 0.12;
  });
  assert.deepEqual(r.blocking, []);
  assert.ok(r.warnings.some((i) => i.level === "error" && i.key === "funds.monthly-income.nav.LDM021"));
  assert.equal(v.funds["monthly-income"], "updated");
  const prevK = previous.funds["monthly-income"]!.nav!.classes.find((c) => c.fundserv === "LDM021");
  assert.deepEqual(v.data.funds["monthly-income"]!.nav!.classes.find((c) => c.fundserv === "LDM021"), prevK);
  // without previous: class removed
  const b = await built();
  const k = b.data.funds["sustainable-enhanced-bonds"]!.nav!.classes[0];
  k.changePct = -0.2;
  const v2 = validateSite(b.data, b.context, null, NOW);
  assert.equal(v2.data.funds["sustainable-enhanced-bonds"]!.nav!.classes.some((c) => c.fundserv === k.fundserv), false);
});

test("NAV / AUM older than 7 days: alert-level issue (not blocking), per-class dates kept", async () => {
  const b = await built();
  const later = new Date("2026-10-08T14:00:00Z");
  const v = validateSite(b.data, b.context, null, later);
  const r = v.results.find((x) => x.fund === "monthly-income")!;
  assert.deepEqual(r.blocking, []);
  assert.ok(r.warnings.some((i) => i.level === "error" && /^stale: NAV/.test(i.message) && i.key.includes(".nav.")));
  assert.ok(r.warnings.some((i) => i.level === "error" && /^stale: AUM/.test(i.message)));
  assert.ok(r.alerts.some((a) => /^stale: NAV/.test(a)));
  assert.ok(v.data.funds["monthly-income"]!.nav!.classes.every((c) => c.date === "2026-09-28"));
});

test("AUM negative or NaN: dropped (previous kept when available)", async () => {
  const { v, r, previous } = await scenario((d) => { d.funds["monthly-income"]!.aum!.cad = -5; });
  assert.deepEqual(r.blocking, []);
  assert.ok(r.warnings.some((i) => i.key === "funds.monthly-income.aum" && i.level === "error"));
  assert.deepEqual(v.data.funds["monthly-income"]!.aum, previous.funds["monthly-income"]!.aum);
  const b = await built();
  b.data.funds["sustainable-enhanced-bonds"]!.aum!.cad = Number.NaN;
  const v2 = validateSite(b.data, b.context, null, NOW);
  assert.equal(v2.data.funds["sustainable-enhanced-bonds"]!.aum, null);
  assert.equal(v2.funds["sustainable-enhanced-bonds"], "updated");
});

test("input is not mutated", async () => {
  const b = await built();
  b.data.funds["monthly-income"]!.aum!.cad = -1;
  const before = clone(b.data);
  validateSite(b.data, b.context, null, NOW);
  assert.deepEqual(b.data, before);
});
