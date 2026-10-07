/**
 * Returns per class and GMV variants: pipeline build + validation against the synthetic fixtures (every active register
 * class compounded by the website from its own nav-timeseries daily chain, from its inception), and the hold of a failing
 * performance per class / variant. A class never shows another class's numbers; a month that fails a check is withheld.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSiteData } from "../../../src/lib/pipeline/build/index.ts";
import { fetchAll } from "../../../src/lib/pipeline/sources/index.ts";
import {
  buildClassEntry,
  indexSinceInception,
  classFundTrailing,
  performanceProblems,
  pickDefaultClass,
} from "../../../src/lib/pipeline/classes.ts";
import { classSeriesOf } from "../../../src/lib/pipeline/fund-sources.ts";
import { validateSite } from "../../../src/lib/pipeline/validate/index.ts";
import type { ClassResult } from "../../../src/lib/pipeline/class-returns.ts";
import type { SiteData } from "../../../src/lib/data/types.ts";
import { fixtureEnv, json, loadFixture, mockFetch, type Route } from "../../fixtures/pipeline/mock-fetch.ts";
import { assertConfigUntouched, once } from "../../fixtures/pipeline/memo.ts";
import type { FundContext } from "../../../src/lib/pipeline/build/index.ts";
import { addMonths } from "../../../src/lib/pipeline/metrics.ts";

const NOW = new Date("2026-09-29T14:00:00Z");
const SEB = "sustainable-enhanced-bonds";
const MI = "monthly-income";
const GMV = "global-minimum-volatility";

type Built = { data: SiteData; validated: SiteData; context: Partial<Record<string, FundContext>> };
async function buildWith(routes: Route[]): Promise<Built> {
  const raw = await fetchAll({ fetchImpl: mockFetch(...routes).fetch, now: NOW, env: fixtureEnv() });
  const { data, context } = buildSiteData(raw, null, NOW);
  return { data, validated: validateSite(data, context, null, NOW).data, context };
}
/** The unaltered fixtures are built once per file (pure); every caller gets its own deep copy. */
const baseline = once(() => buildWith([]));
async function build(...routes: Route[]): Promise<Built> {
  return routes.length ? buildWith(routes) : baseline();
}

/** route serving one class's daily history altered by `fn` */
const history =
  (fundserv: string, fn: (rows: Record<string, unknown>[]) => Record<string, unknown>[]): Route =>
  (url) => {
    if (url.pathname !== "/api/performance/nav-timeseries" || url.searchParams.get("fundserv") !== fundserv)
      return undefined;
    const j = loadFixture(`dataplatform/nav_history_${fundserv}.json`) as { rows: Record<string, unknown>[] };
    return json({ ...j, rows: fn(j.rows) });
  };

test("classes of a fund: configured codes, then the registry's classes, then the register's other active classes", () => {
  assert.deepEqual(
    classSeriesOf(SEB).map((k) => k.fundserv),
    ["LDM201", "LDM202", "LDM203", "LDM204", "LDM205", "LDM206"],
  );
  assert.deepEqual(
    classSeriesOf(MI)
      .slice(0, 3)
      .map((k) => [k.fundserv, k.display, k.classCode]),
    [
      ["LDM001", "FP", "STRATEGY"],
      ["LDM081", "F", "LDM081"],
      ["LDM011", "F USD", "LDM011"],
    ],
  );
  // with the register: its inactive classes are left out (never the track-record class), unknown active ones are added
  const reg = [
    { fundserv: "LDM201", display: "F", status: "active" },
    { fundserv: "LDM203", display: "I", status: "inactive" },
    { fundserv: "LDM209", display: "Z", status: "active", currency: "CAD" },
  ];
  assert.deepEqual(
    classSeriesOf(SEB, reg).map((k) => [k.fundserv, k.classCode]),
    [
      ["LDM201", "STRATEGY"],
      ["LDM202", "STRATEGY_H"],
      ["LDM209", "LDM209"],
    ],
  );
  assert.deepEqual(classSeriesOf(GMV), []);
});

test("every active class from its own daily chain since its inception: shown, young (< 12 months) or non-CAD", async () => {
  const { data, validated } = await build();
  for (const d of [data, validated]) {
    const seb = d.funds[SEB]!;
    assert.equal(seb.performance!.returnClass, "H", "the SEB track record is class H, labelled H");
    assert.equal(seb.defaultClass, "LDM201", "the page opens on class F (it has returns)");
    assert.deepEqual(
      seb.performanceByClass!.LDM202.performance,
      seb.performance,
      "the headline class entry is the headline itself",
    );
    assert.deepEqual(Object.keys(seb.performanceByClass!).sort(), ["LDM201", "LDM202", "LDM203", "LDM204"]);
    assert.deepEqual(
      Object.fromEntries(Object.values(seb.classInfo!).map((c) => [c.fundserv, [c.status, c.inception]])),
      {
        LDM201: ["shown", "2023-07-05"],
        LDM202: ["shown", "2023-07-05"],
        LDM203: ["shown", "2023-11-06"],
        LDM204: ["shown", "2023-08-01"],
        LDM205: ["young", "2026-04-01"],
        LDM206: ["young", "2026-07-27"],
      },
    );
    assert.equal(seb.classInfo!.LDM205.minMonths, 12);
    const f = seb.performanceByClass!.LDM201.performance;
    assert.equal(f.returnClass, "F");
    assert.equal(f.classCode, "STRATEGY");
    assert.equal(f.inception, "2023-07-05");
    assert.equal(f.firstMonth, "2023-07-31", "the inception month, partial");
    assert.equal(f.partialFirstMonth, true);
    // F − H = the synthetic +12 bp fee difference on every complete month both publish
    const hm = new Map(seb.performance!.monthly.map((m) => [m.month, m.r]));
    for (const m of f.monthly)
      if (m.month > f.firstMonth) assert.ok(Math.abs(m.r - hm.get(m.month)! - 0.0012) < 1e-6, m.month);
    const mi = d.funds[MI]!;
    assert.equal(mi.performance!.returnClass, "FP");
    assert.equal(mi.classInfo!.LDM011.status, "currency");
    assert.equal(mi.classInfo!.LDM011.currency, "USD");
    assert.equal(mi.classInfo!.LDM021.status, "young");
    // class I was closed and relaunched: its inception is the first price of its current run (the 2022 rows are a previous life)
    assert.equal(mi.classInfo!.LDM031.inception, "2023-03-06");
    assert.equal(mi.performanceByClass!.LDM031.performance.firstMonth, "2023-03-31");
    // class J priced since the 2021-10-05 re-seed; the earlier rows of the reused code are cut at the fund's first day
    assert.equal(mi.classInfo!.LDM061.inception, "2021-10-05");
    const ms = d.funds["multi-strategy"]!;
    assert.deepEqual(Object.keys(ms.performanceByClass!).sort(), ["LDM300", "LDM301", "LDM303", "LDM304"]);
    assert.equal(ms.classInfo!.LDM305.status, "young");
  }
  assert.ok(
    data.issues.some(
      (i) =>
        i.level === "warn" &&
        /class I \(LDM031\): relaunch detected \(gap after 2022-06-30, corroborated/.test(i.message),
    ),
  );
  assert.ok(
    data.issues.some(
      (i) =>
        i.level === "info" && /class F USD \(LDM011\): USD series: no distribution-aware total returns/.test(i.message),
    ),
  );
  assert.ok(
    data.issues.some(
      (i) =>
        i.level === "info" &&
        /class A \(LDM021\): inception 2026-03-02, less than 12 months before 2026-08: no performance figure \(regulatory minimum\)/.test(
          i.message,
        ),
    ),
  );
});

test("source defects in the fixtures: a bad valuation print and a drift in a distribution month withhold every class; a lone outlier only itself", async () => {
  const { data } = await build();
  const mi = data.funds[MI]!;
  // the print of 2022-03-15/16 in every Monthly Income class (March 2022: only FP and J were priced then) and class I
  // drifting +0.9 % from the other classes in 2023-09 (an inconsistent adjustment: which class is right cannot be told)
  assert.deepEqual(mi.performanceByClass!.LDM061.performance.withheldMonths, ["2022-03-31", "2023-09-30"]);
  assert.equal(
    mi.performanceByClass!.LDM061.performance.trailing.fund.SI,
    null,
    "since inception crosses a withheld month",
  );
  assert.equal(mi.performanceByClass!.LDM061.performance.trailing.fund["3Y"], null, "so do 3 years");
  assert.ok(mi.performanceByClass!.LDM061.performance.trailing.fund["2Y"] != null, "2 years do not");
  assert.equal(mi.performanceByClass!.LDM061.performance.growthFrom, "2023-09-30");
  assert.deepEqual(
    mi.performanceByClass!.LDM031.performance.withheldMonths,
    ["2023-09-30"],
    "the drifting class and every other class",
  );
  assert.match(
    data.issues.find((i) => i.key === `funds.${MI}.performance.classes.LDM061.monthly.2023-09-30`)!.message,
    /distribution \/ price-adjustment day/,
    "Monthly Income distributes: the majority cannot be trusted",
  );
  // Multi-Strategy class A off alone in 2025-05 (no distribution that month, F / I / J agree): A withheld alone
  const ms = data.funds["multi-strategy"]!.performanceByClass!;
  assert.deepEqual(ms.LDM300.performance.withheldMonths, ["2025-05-31"]);
  for (const f of ["LDM301", "LDM303", "LDM304"]) assert.equal(ms[f].performance.withheldMonths, undefined, f);
  assert.ok(ms.LDM300.performance.trailing.fund["1Y"] != null, "the 1-year window (2025-09 to 2026-08) is clean");
  for (const [k, f] of [
    [MI, "LDM081"],
    [SEB, "LDM201"],
    [SEB, "LDM203"],
    [SEB, "LDM204"],
  ] as const)
    assert.equal(data.funds[k]!.performanceByClass![f].performance.withheldMonths, undefined, f);
  assert.ok(
    data.issues.some(
      (i) =>
        i.level === "warn" &&
        i.key === `funds.${MI}.performance.classes` &&
        /source defects to report to the dataplatform\): 2022-03 bad valuation print: .*; 2023-09 classes disagree in a month with a distribution \/ price-adjustment day .*LDM031 1\.03%/.test(
          i.message,
        ),
    ),
  );
  assert.ok(
    data.issues.some(
      (i) =>
        i.level === "warn" &&
        i.key === `funds.${MI}.performance.classes.LDM061.monthly.2023-09-30` &&
        /withheld \("—"\): classes disagree/.test(i.message),
    ),
    "one admin issue per class and month",
  );
  // the headline (track record) keeps its own logic
  assert.equal(mi.performance!.withheldMonths, undefined);
});

test('a failed history leaves the class out ("coming soon"); a class published before that disappears is a blocking alert; a hole withholds one month only', async () => {
  const down: Route = (url) =>
    url.pathname === "/api/performance/nav-timeseries" && url.searchParams.get("fundserv") === "LDM201"
      ? json({ detail: "x" }, 500)
      : undefined;
  const c = await build(down);
  assert.equal(c.data.funds[SEB]!.performanceByClass!.LDM201, undefined);
  assert.equal(c.data.funds[SEB]!.classInfo!.LDM201.status, "unavailable");
  assert.ok(
    c.data.issues.some(
      (i) =>
        i.key === `funds.${SEB}.performance.classes.LDM201` &&
        /daily history unavailable \(nav-timeseries SEB LDM201 history: .*500/.test(i.message),
    ),
  );
  assert.equal(c.data.funds[SEB]!.defaultClass, "LDM202", "the page opens on a class that has returns");
  const prev = (await build()).validated;
  const again = buildSiteData(
    await fetchAll({ fetchImpl: mockFetch(down).fetch, now: NOW, env: fixtureEnv() }),
    { ...prev, mode: "live" },
    NOW,
  );
  assert.ok(again.context[SEB]!.alerts.some((a) => /class F \(LDM201\) not shown \(it was published before\)/.test(a)));
  // a missing valuation day in 2025-02: that month withheld, never a series restarting after the hole
  const hole = await build(history("LDM201", (rows) => rows.filter((r) => r.date !== "2025-02-11")));
  const f = hole.data.funds[SEB]!.performanceByClass!.LDM201.performance;
  assert.deepEqual(f.withheldMonths, ["2025-02-28"]);
  assert.equal(f.firstMonth, "2023-07-31", "still since its inception");
  assert.ok(
    hole.data.issues.some(
      (i) =>
        i.key === `funds.${SEB}.performance.classes.LDM201.monthly.2025-02-28` &&
        /Incomplete CIBC valuation-day coverage \(missing 2025-02-11\)/.test(i.message),
    ),
  );
});

test("buildClassEntry: per-figure withholding, growth after the last withheld month, the 12-month rule, non-CAD", () => {
  const months: ClassResult["months"] = [];
  for (let m = "2022-04-30"; m <= "2026-08-31"; m = addMonths(m, 1))
    months.push({ month: m, r: 0.004, partial: m === "2022-04-30", source: "cibc", reason: null });
  const held = months.find((m) => m.month === "2024-05-31")!;
  held.r = null;
  held.reason = "synthetic";
  const res: ClassResult = {
    fundserv: "LDM999",
    display: "Z",
    currency: "CAD",
    inception: "2022-04-20",
    status: "ok",
    why: null,
    previousRunEnd: null,
    months,
  };
  const cls = { fundserv: "LDM999", display: "Z", classCode: "LDM999" as const };
  const idx = Object.fromEntries(months.map((m) => [m.month, 0.002]));
  const b = buildClassEntry({ key: "k", cls, result: res, asOf: "2026-08-31", idx, minMonths: 12 });
  const p = b.entry!.performance;
  assert.equal(b.info.status, "shown");
  assert.deepEqual(p.withheldMonths, ["2024-05-31"]);
  assert.ok(!p.monthly.some((m) => m.month === "2024-05-31"));
  const t = p.trailing.fund;
  for (const k of ["1M", "3M", "YTD", "1Y", "2Y"] as const) assert.ok(t[k] != null, k);
  assert.equal(t["3Y"], null, "3 years contain the withheld month");
  assert.equal(t["5Y"], null, "longer than the history");
  assert.equal(t.SI, null);
  // the index is shown over a period the class covers even when the fund figure is withheld; value added needs both
  assert.ok(Math.abs(p.trailing.index!["3Y"]! - (Math.pow(1.002, 12) - 1)) < 1e-12, "index 3Y shown");
  assert.equal(p.trailing.va!["3Y"], null, "no value added against a withheld fund figure");
  assert.equal(p.trailing.index!["5Y"], null, "longer than the class's history: no index either");
  assert.equal(p.trailing.index!.SI, null, "partial first month and no daily levels: no index since inception");
  assert.ok(p.trailing.index!["1Y"] != null);
  assert.equal(p.calendar.find((y) => y.year === 2024)!.fund, null);
  assert.ok(p.calendar.find((y) => y.year === 2025)!.fund != null);
  assert.equal(p.calendar.find((y) => y.year === 2022)!.index, null, "no index against the partial inception year");
  assert.equal(p.growth[0].date, "2024-05-31", "growth from the month-end after the last withheld month");
  assert.equal(p.growthFrom, "2024-05-31");
  assert.equal(b.entry!.risk, null, "risk since inception crosses the withheld month");
  assert.equal(b.entry!.risk3Y, null);
  assert.deepEqual(performanceProblems(p, "compounded", true), []);
  // without the withheld month: since inception from the inception NAV, annualized over calendar days (partial first month)
  held.r = 0.004;
  held.reason = null;
  const ok = buildClassEntry({ key: "k", cls, result: res, asOf: "2026-08-31", idx, minMonths: 12 }).entry!;
  const total = Math.pow(1.004, months.length) - 1;
  const days = (Date.parse("2026-08-31") - Date.parse("2022-04-20")) / 86_400_000;
  assert.ok(Math.abs(ok.performance.trailing.fund.SI! - (Math.pow(1 + total, 365 / days) - 1)) < 1e-12);
  assert.equal(ok.performance.trailing.index!.SI, null, "no index since inception against a partial first month");
  assert.equal(ok.performance.growthFrom, "2022-04-20");
  assert.ok(
    ok.performance.growth.every((g) => g.index === undefined),
    "no index line from a partial first month",
  );
  assert.ok(ok.risk && ok.risk3Y);
  assert.deepEqual(performanceProblems(ok.performance, "compounded", true), []);
  // 12-month rule: inception 2025-09-15, as of 2026-08: 11.5 months → nothing; as of 2026-09: shown
  const young: ClassResult = {
    ...res,
    inception: "2025-09-15",
    months: months.filter((m) => m.month >= "2025-09-30").map((m, i) => ({ ...m, partial: i === 0 })),
  };
  const y = buildClassEntry({ key: "k", cls, result: young, asOf: "2026-08-31", idx: null, minMonths: 12 });
  assert.equal(y.entry, null);
  assert.deepEqual(y.info, {
    fundserv: "LDM999",
    display: "Z",
    currency: "CAD",
    inception: "2025-09-15",
    status: "young",
    minMonths: 12,
  });
  const y2 = buildClassEntry({
    key: "k",
    cls,
    result: {
      ...young,
      months: [...young.months, { month: "2026-09-30", r: 0.001, partial: false, source: "apex", reason: null }],
    },
    asOf: "2026-09-30",
    idx: null,
    minMonths: 12,
  });
  assert.equal(y2.info.status, "shown");
  // a non-CAD class: no figure, the page says why
  const usd = buildClassEntry({
    key: "k",
    cls,
    result: {
      ...res,
      currency: "USD",
      status: "currency",
      why: "USD series: no distribution-aware total returns in the source",
      months: [],
    },
    asOf: "2026-08-31",
    idx: null,
    minMonths: 12,
  });
  assert.equal(usd.entry, null);
  assert.equal(usd.info.status, "currency");
});

test("classFundTrailing: YTD needs the year's January; fixed periods never reach into the partial first month", () => {
  const all: Record<string, number> = {};
  for (let m = "2025-03-31"; m <= "2026-08-31"; m = addMonths(m, 1)) all[m] = 0.01;
  const shape = { all, asOf: "2026-08-31", firstMonth: "2025-03-31", inception: "2025-03-10", partialFirst: true };
  const t = classFundTrailing(shape);
  assert.ok(t["1Y"] != null && t.YTD != null && t.SI != null);
  delete all["2026-01-31"];
  const t2 = classFundTrailing(shape);
  assert.equal(t2.YTD, null, "January withheld: no year to date (never from February)");
  assert.equal(t2["1Y"], null);
  assert.ok(t2["3M"] != null);
  // 18 months of which the first is partial: 1Y from complete months only; a 2-year window does not exist
  const s2: Record<string, number> = {};
  for (let m = "2025-08-31"; m <= "2026-08-31"; m = addMonths(m, 1)) s2[m] = 0.01;
  const t3 = classFundTrailing({
    all: s2,
    asOf: "2026-08-31",
    firstMonth: "2025-08-31",
    inception: "2025-08-20",
    partialFirst: true,
  });
  assert.ok(t3["1Y"] != null, "Sep 2025 – Aug 2026: 12 complete months");
  assert.ok(Math.abs(t3["1Y"]! - (Math.pow(1.01, 12) - 1)) < 1e-12, "the partial August 2025 is not part of the year");
});

test("pickDefaultClass: the headline class when it has returns, else the first class in register order that has", () => {
  assert.equal(pickDefaultClass("LDM081", ["LDM001", "LDM081"], { LDM081: 1, LDM001: 1 }), "LDM081");
  assert.equal(pickDefaultClass("LDM081", ["LDM011", "LDM001", "LDM081"], { LDM001: 1 }), "LDM001");
  assert.equal(pickDefaultClass("LDM081", [], {}), undefined);
});

test("a young headline class: the page opens on the first class (register order) that has returns", async () => {
  // class F of Monthly Income launched less than 12 months before the as-of
  const late = history("LDM081", (rows) => rows.filter((r) => (r.date as string) >= "2026-06-01"));
  const { validated } = await build(late);
  const mi = validated.funds[MI]!;
  assert.equal(mi.classInfo!.LDM081.status, "young");
  assert.equal(mi.classInfo!.LDM081.inception, "2026-06-01");
  assert.equal(mi.performanceByClass!.LDM081, undefined);
  assert.equal(mi.defaultClass, "LDM001", "FP, first in the register with returns");
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
  assert.equal(
    v.funds[SEB]!.performanceByClass!.LDM201,
    undefined,
    "class F dropped: the page says coming soon for it",
  );
  assert.equal(v.funds[SEB]!.classInfo!.LDM201.status, "unavailable");
  assert.equal(v.funds[SEB]!.defaultClass, "LDM202", "never opens on the dropped class");
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
  assert.deepEqual(kept.classInfo, was.classInfo, "the class notices are held too");
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

test("performanceProblems: gap, wrong end, huge month, trailing mismatch", () => {
  const p = {
    asOf: "2026-03-31",
    basis: "net",
    method: "compounded",
    firstMonth: "2026-01-31",
    monthly: [
      { month: "2026-01-31", r: 0.01 },
      { month: "2026-03-31", r: 0.6 },
    ],
    trailing: { fund: { "1M": 0.6 } },
    calendar: [],
    growth: [],
  } as unknown as Parameters<typeof performanceProblems>[0];
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
  gv.variants!["3"] = {
    ...gv.variants!["3"],
    performance: {
      ...stale,
      asOf: "2026-07-31",
      monthly: stale.monthly.filter((m) => m.month <= "2026-07-31"),
      growth: stale.growth.filter((p) => p.date <= "2026-07-31"),
    },
  };
  const v = validateSite(old, g.context, null, NOW).data.funds[GMV]!;
  assert.equal(v.variants!["3"], undefined, "a variant older than the fund's performance is not shown");
  assert.ok(v.variants!["9"]);
});

test("a class not launched yet (no own row up to the as-of): info only, no alert", async () => {
  const notYet = history("LDM201", (rows) => rows.filter((r) => (r.date as string) >= "2026-09-01"));
  const { data, context } = await build(notYet);
  assert.equal(data.funds[SEB]!.performanceByClass!.LDM201, undefined);
  assert.equal(data.funds[SEB]!.classInfo!.LDM201.status, "young");
  assert.equal(data.funds[SEB]!.classInfo!.LDM201.inception, "2026-09-01");
  assert.ok(
    data.issues.some(
      (i) =>
        i.level === "info" &&
        /class F \(LDM201\): inception 2026-09-01, less than 12 months before 2026-08/.test(i.message),
    ),
  );
  assert.ok(!context[SEB]!.alerts.some((a) => /LDM201/.test(a)));
});

test("M2: a month withheld for every class applies to the track record where it comes from its own NAV chain; an official figure stays", async () => {
  // fixtures: Monthly Income 2022-03 and 2023-09 are withheld for every class; the track record's CIBC months come from its
  // verified daily chain, so those two months take the analytics history's own figure instead (warned)
  const { data } = await build();
  assert.ok(
    data.issues.some(
      (i) =>
        i.key === `funds.${MI}.performance` &&
        i.level === "warn" &&
        /kept in the track record with an official figure \(not an independent check of the class NAV data\): 2022-03 \(official figure of the analytics history, instead of its own daily NAV chain\), 2023-09 \(official figure/.test(
          i.message,
        ),
    ),
  );
  // an Apex-era month taken from the chain (monthly-net-returns down) with a bad print in every class: no official figure,
  // the month is withheld from the track record too (here the newest month: the track record stops before it)
  const print = (fsv: string): Route =>
    history(fsv, (rows) =>
      rows.map((r) =>
        r.date === "2026-08-13"
          ? { ...r, net_daily_return: (r.net_daily_return as number) + 0.03 }
          : r.date === "2026-08-14"
            ? { ...r, net_daily_return: (r.net_daily_return as number) - 0.0295 }
            : r,
      ),
    );
  const mnrDown: Route = (url) =>
    url.pathname === "/api/performance/monthly-net-returns" && url.searchParams.get("short_name") === "SEST"
      ? json({ detail: "x" }, 500)
      : undefined;
  const b = await build(mnrDown, ...["LDM001", "LDM021", "LDM031", "LDM061", "LDM081"].map(print));
  assert.ok(
    b.data.issues.some(
      (i) =>
        i.key === `funds.${MI}.performance` &&
        /2026-08: withheld from the track record \(taken from its own daily NAV chain, which failed the class checks: bad valuation print/.test(
          i.message,
        ),
    ),
    JSON.stringify(b.data.issues.filter((i) => i.key === `funds.${MI}.performance`).map((i) => i.message)),
  );
  assert.equal(b.data.funds[MI]!.performance!.asOf, "2026-07-31");
});

test("new classes are gated even when the previous publication had no performance", async () => {
  const { classEntryChanges } = await import("../../../src/lib/pipeline/validate/index.ts");
  const { data } = await build();
  const f = data.funds[SEB]!;
  const prev = { ...f, performance: null, risk: null, performanceByClass: undefined, defaultClass: undefined };
  const out = classEntryChanges(SEB, prev, f);
  assert.ok(
    out.some((x) => /classes published for the first time: .*I \(LDM203\)/.test(x)),
    JSON.stringify(out),
  );
  assert.ok(!out.some((x) => /H \(LDM202\)/.test(x)), "the headline itself is not a new class");
});

test("YTD of a class whose first complete month is January (priced since the previous December's last day); growth starts at the inception day", async () => {
  const all: Record<string, number> = {};
  for (let m = "2025-01-31"; m <= "2026-08-31"; m = addMonths(m, 1)) all[m] = 0.003;
  const t = classFundTrailing({
    all,
    asOf: "2025-08-31",
    firstMonth: "2025-01-31",
    inception: "2024-12-31",
    partialFirst: false,
  });
  assert.ok(t.YTD != null && Math.abs(t.YTD - (1.003 ** 8 - 1)) < 1e-12);
  // the same January but partial (launched mid-January): no YTD
  assert.equal(
    classFundTrailing({
      all,
      asOf: "2025-08-31",
      firstMonth: "2025-01-31",
      inception: "2025-01-15",
      partialFirst: true,
    }).YTD,
    null,
  );
  const { data } = await build();
  const f = data.funds[MI]!.performanceByClass!.LDM081.performance;
  assert.equal(f.growth[0].date, f.inception, "a partial first month: the growth series starts at the inception day");
  assert.deepEqual(performanceProblems(f, "compounded", true), []);
});

test("headline: a print on the newest month's last day reversed on the next valuation day in every class is never published, even with monthly-net-returns matching", async () => {
  const { mkdtemp, readFile, writeFile, rm } = await import("node:fs/promises");
  const os = await import("node:os");
  const path = await import("node:path");
  const { FIXTURE_FACTSHEETS_DIR } = await import("../../fixtures/pipeline/mock-fetch.ts");
  // no factsheet for the newest month (August): only the July archives
  const fsDir = await mkdtemp(path.join(os.tmpdir(), "fs-print-"));
  for (const f of ["bonds_data_2026-07.json", "factsheet_data_2026-07.json"])
    await writeFile(path.join(fsDir, f), await readFile(path.join(FIXTURE_FACTSHEETS_DIR, f)));
  const shift = (r: Record<string, unknown>): Record<string, unknown> =>
    r.date === "2026-08-31"
      ? { ...r, net_daily_return: (r.net_daily_return as number) + 0.03 }
      : r.date === "2026-09-01"
        ? { ...r, net_daily_return: (r.net_daily_return as number) - 0.0295 }
        : r;
  const prints = ["LDM001", "LDM021", "LDM031", "LDM061", "LDM081"].map((f) => history(f, (rows) => rows.map(shift)));
  // monthly-net-returns serves the same (wrong) August as the chain: the two dataplatform views agree
  const aug =
    (loadFixture("dataplatform/nav_history_LDM001.json") as { rows: Record<string, unknown>[] }).rows
      .filter((r) => String(r.date).startsWith("2026-08") && r.source === "apex")
      .map(shift)
      .reduce((p, r) => p * (1 + (r.net_daily_return as number)), 1) - 1;
  const mnr: Route = (url) => {
    if (url.pathname !== "/api/performance/monthly-net-returns" || url.searchParams.get("short_name") !== "SEST")
      return undefined;
    const j = loadFixture("dataplatform/mnr_SEST.json") as { rows: Record<string, unknown>[] };
    return json({ ...j, rows: j.rows.map((r) => (r.month === "2026-08-31" ? { ...r, net_return: aug } : r)) });
  };
  try {
    const raw = await fetchAll({
      fetchImpl: mockFetch(mnr, ...prints).fetch,
      now: NOW,
      env: fixtureEnv({ FACTSHEET_DATA_DIR: fsDir }),
    });
    const { data } = buildSiteData(raw, null, NOW);
    assert.ok(
      !data.issues.some((i) => /2026-08: daily NAV chain .* vs monthly-net-returns/.test(i.message)),
      "the two views agree",
    );
    assert.ok(
      data.issues.some(
        (i) =>
          i.key === `funds.${MI}.performance` &&
          /2026-08: withheld from the track record \(taken from monthly-net-returns \(the same Apex NAVs as the class chain\), which failed the class checks: bad valuation print: LDM\d+ 2026-08-31 /.test(
            i.message,
          ),
      ),
      JSON.stringify(data.issues.filter((i) => i.key === `funds.${MI}.performance`).map((i) => i.message)),
    );
    assert.equal(data.funds[MI]!.performance!.asOf, "2026-07-31", "the headline holds the newest month");
  } finally {
    await rm(fsDir, { recursive: true, force: true });
  }
});

test("headline: the track class's own newest-month hold reaches the track record (its months come from the same NAVs)", async () => {
  const cut = history("LDM001", (rows) => rows.filter((r) => String(r.date) <= "2026-08-31"));
  const { data } = await build(cut);
  assert.ok(
    data.issues.some(
      (i) =>
        i.key === `funds.${MI}.performance` &&
        /2026-08: withheld from the track record .*newest month held/.test(i.message),
    ),
    JSON.stringify(data.issues.filter((i) => i.key === `funds.${MI}.performance`).map((i) => i.message)),
  );
  assert.equal(data.funds[MI]!.performance!.asOf, "2026-07-31");
});

test("a fund new to a live site: every series gated (its page goes live without performance until approved); the very first site publication is not gated", async () => {
  const { data, validated, context } = await build();
  const prev = structuredClone({ ...validated, mode: "live" as const });
  delete prev.funds[SEB];
  const v = validateSite(structuredClone(data), context, prev, NOW);
  assert.ok(v.classChanges.includes(SEB));
  assert.ok(
    v.data.issues.some(
      (i) =>
        i.key === `funds.${SEB}.performance.class` &&
        /classes published for the first time \(fund new to the site\)/.test(i.message),
    ),
  );
  assert.equal(v.autoData.funds[SEB]!.performance, null);
  assert.ok(v.autoData.funds[SEB]!.nav, "the rest of the page goes live");
  assert.ok(!validateSite(structuredClone(data), context, null, NOW).classChanges.length);
});

test("class histories are fetched one at a time (twenty in parallel ran the dataplatform out of memory)", async () => {
  const base = mockFetch().fetch;
  let inFlight = 0,
    peak = 0,
    histories = 0;
  const fetchImpl: typeof base = async (input, init) => {
    const url = String(input);
    const isHistory = url.includes("/api/performance/nav-timeseries") && url.includes("fundserv=");
    if (!isHistory) return base(input, init);
    histories++;
    inFlight++;
    peak = Math.max(peak, inFlight);
    try {
      await new Promise((r) => setTimeout(r, 5));
      return await base(input, init);
    } finally {
      inFlight--;
    }
  };
  const raw = await fetchAll({ fetchImpl, now: NOW, env: fixtureEnv() });
  assert.ok(histories >= 5, `class histories fetched: ${histories}`);
  assert.equal(peak, 1, "never two class histories at once");
  assert.ok(Object.keys(raw.navHistory ?? {}).length >= 5);
});

test("class histories: after 3 failures in a row the rest are not requested (a failing dataplatform cannot hold the run)", async () => {
  const base = mockFetch().fetch;
  let histories = 0;
  const fetchImpl: typeof base = async (input, init) => {
    const url = String(input);
    if (url.includes("/api/performance/nav-timeseries") && url.includes("fundserv=")) {
      histories++;
      return new Response("down", { status: 400 });
    }
    return base(input, init);
  };
  const raw = await fetchAll({ fetchImpl, now: NOW, env: fixtureEnv() });
  assert.equal(histories, 3);
  const skipped = Object.values(raw.navHistory ?? {}).filter((r) => !r.ok && /not fetched/.test(r.error ?? ""));
  assert.ok(skipped.length >= 2, String(skipped.length));
});

test("no test leaves the pipeline config mutated (memoised baselines stay valid)", () => {
  assertConfigUntouched();
});

test("indexSinceInception: from the inception-day close to the as-of month-end, same closing levels as the monthly series, 365-day annualization", () => {
  // daily levels: 100 on 2023-06-30 (June close), 101 on 2023-07-24 (inception), 102 on 2023-07-31 (July close)
  const levels: Record<string, number> = { "2023-06-29": 99.9, "2023-06-30": 100, "2023-07-24": 101, "2023-07-31": 102 };
  const idx: Record<string, number> = { "2023-07-31": 0.02 };
  for (let m = "2023-08-31"; m <= "2026-09-30"; m = addMonths(m, 1)) idx[m] = 0.001;
  const n = Object.keys(idx).length - 1;
  const total = (102 / 101) * Math.pow(1.001, n) - 1;
  const days = (Date.parse("2026-09-30") - Date.parse("2023-07-24")) / 86_400_000;
  const r = indexSinceInception(idx, levels, "2023-07-24", "2023-07-31", "2026-09-30")!;
  assert.ok(Math.abs(r - (Math.pow(1 + total, 365 / days) - 1)) < 1e-12);
  // inception on a bond-market holiday is not used blindly: a missing bond day before it → null
  assert.equal(indexSinceInception(idx, { ...levels, "2023-07-24": NaN }, "2023-07-24", "2023-07-31", "2026-09-30"), null);
  // a missing month → null; no levels → null
  const gap = { ...idx };
  delete gap["2025-03-31"];
  assert.equal(indexSinceInception(gap, levels, "2023-07-24", "2023-07-31", "2026-09-30"), null);
  assert.equal(indexSinceInception(idx, null, "2023-07-24", "2023-07-31", "2026-09-30"), null);
  // a weekend inception takes the Friday close (no bond day in between)
  const wk = { "2023-06-30": 100, "2023-07-21": 101, "2023-07-31": 102 };
  assert.ok(indexSinceInception(idx, wk, "2023-07-23", "2023-07-31", "2026-09-30") != null);
});

test("buildClassEntry: a class launched mid-month gets its since-inception index from the daily levels, value added against the fund", () => {
  const months: ClassResult["months"] = [];
  for (let m = "2023-07-31"; m <= "2026-09-30"; m = addMonths(m, 1))
    months.push({ month: m, r: 0.004, partial: m === "2023-07-31", source: "cibc", reason: null });
  const res: ClassResult = {
    fundserv: "LDM998",
    display: "Y",
    currency: "CAD",
    inception: "2023-07-24",
    status: "ok",
    why: null,
    previousRunEnd: null,
    months,
  };
  const cls = { fundserv: "LDM998", display: "Y", classCode: "LDM998" as const };
  const idx = Object.fromEntries(months.map((m) => [m.month, 0.002]));
  const levels = { "2023-06-30": 100, "2023-07-24": 101, "2023-07-31": 100 * 1.002 };
  const e = buildClassEntry({ key: "k", cls, result: res, asOf: "2026-09-30", idx, idxLevels: levels, minMonths: 12 })
    .entry!;
  const t = e.performance.trailing;
  assert.ok(t.fund.SI != null && t.index!.SI != null);
  assert.ok(Math.abs(t.va!.SI! - (t.fund.SI! - t.index!.SI!)) < 1e-12);
  assert.deepEqual(performanceProblems(e.performance, "compounded", true), []);
});
