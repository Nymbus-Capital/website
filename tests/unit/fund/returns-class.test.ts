/** Which class's own series a card / fund page shows: the preferred class when complete, else the most complete one. */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  chosenReturnsClass,
  figureCount,
  hasMinHistory,
  isComplete,
  returnsCandidates,
  showsReturns,
} from "../../../src/components/fund/lib/returns-class.ts";
import { initialSelection, pickData, selectableClasses } from "../../../src/components/fund/lib/select.ts";
import { heatmapGrid } from "../../../src/components/fund/lib/heatmap.ts";
import { toFundCard } from "../../../src/components/site/home/data.ts";
import { FUNDS } from "../../../src/config/funds.ts";
import sample from "../../../src/lib/data/sample-site-data.json" with { type: "json" };
import type { ClassInfo, FundData, Performance } from "../../../src/lib/data/types.ts";

type Data = Omit<FundData, "sourceName">;

const perf = (cls: string, extra: Partial<Performance> = {}): Performance => ({
  asOf: "2026-08-31",
  basis: "net",
  method: "compounded",
  firstMonth: "2019-01-31",
  monthly: [],
  trailing: { fund: { "1M": 0.001, YTD: 0.01, "1Y": 0.02, "3Y": 0.03, SI: 0.04 } },
  calendar: [{ year: 2025, fund: 0.05 }],
  growth: [],
  returnClass: cls,
  ...extra,
});
/** a series with a withheld month: every figure whose window contains it is null */
const holed = (cls: string): Performance =>
  perf(cls, {
    firstMonth: "2023-07-31",
    withheldMonths: ["2024-02-29"],
    trailing: { fund: { "1M": 0.001, YTD: 0.01, "1Y": 0.02, "3Y": null, SI: null } },
    calendar: [
      { year: 2024, fund: null },
      { year: 2025, fund: 0.04 },
    ],
  });
const entry = (fundserv: string, display: string, performance: Performance) => ({
  fundserv,
  display,
  performance,
  risk: null,
  risk3Y: null,
});
const info = (fundserv: string, display: string, status: ClassInfo["status"], currency = "CAD"): ClassInfo => ({
  fundserv,
  display,
  currency,
  inception: "2023-07-05",
  status,
});
const nav = (fundserv: string, display: string, currency = "CAD") =>
  ({ fundserv, display, currency, nav: 10, date: "2026-09-28", prevNav: 10, change: 0, changePct: 0 }) as never;
const base = (extra: Partial<Data>): Data => ({
  key: "sustainable-enhanced-bonds",
  performance: null,
  risk: null,
  risk3Y: null,
  nav: null,
  aum: null,
  characteristics: [],
  breakdowns: {},
  topHoldings: [],
  esg: [],
  factsheetMonth: null,
  ...extra,
});

const sebSpec = { headlineClass: "LDM201", classes: [{ fundserv: "LDM201" }, { fundserv: "LDM202" }] };

/** SEB as reported on 2026-10-07: F (headline) has withheld months, the track record (H) is complete. */
const seb = (): Data =>
  base({
    performance: perf("H", { classCode: "STRATEGY_H" }),
    performanceByClass: {
      LDM201: entry("LDM201", "F", holed("F")),
      LDM202: entry("LDM202", "H", perf("H", { classCode: "STRATEGY_H" })),
      LDM203: entry("LDM203", "I", perf("I", { firstMonth: "2023-11-30" })),
    },
    defaultClass: "LDM201",
    classInfo: {
      LDM201: info("LDM201", "F", "shown"),
      LDM202: info("LDM202", "H", "shown"),
      LDM203: info("LDM203", "I", "shown"),
      LDM205: info("LDM205", "A", "young"),
      LDM211: info("LDM211", "F USD", "currency", "USD"),
    },
    nav: {
      asOf: "2026-09-28",
      classes: [nav("LDM201", "F"), nav("LDM202", "H"), nav("LDM205", "A"), nav("LDM211", "F USD", "USD")],
    },
  });

test("completeness: 12 months, no withheld month and a since-inception figure", () => {
  assert.equal(isComplete(perf("F")), true);
  assert.equal(isComplete(holed("F")), false);
  assert.equal(isComplete(perf("F", { firstMonth: "2025-10-31" })), false, "11 months");
  assert.equal(hasMinHistory(perf("F", { firstMonth: "2025-09-30" })), true, "12 months");
  assert.equal(hasMinHistory(perf("F", { firstMonth: "2025-09-30", partialFirstMonth: true })), false);
  assert.equal(hasMinHistory(perf("F", { shortRecord: true })), false);
  assert.equal(figureCount(perf("F")), 6);
  assert.equal(figureCount(holed("F")), 4);
});

test("candidates: preferred (admin → registry → data default), data default, track record, then CAD classes by code", () => {
  const d = seb();
  assert.deepEqual(returnsCandidates(d, sebSpec, {}), ["LDM201", "LDM202", "LDM203", "LDM205"]);
  assert.deepEqual(returnsCandidates(d, sebSpec, { headlineClass: "LDM203" }).slice(0, 3), [
    "LDM203",
    "LDM201",
    "LDM202",
  ]);
  assert.ok(!returnsCandidates(d, sebSpec, {}).includes("LDM211"), "a non-CAD class is never a candidate");
});

test("SEB: F has withheld months -> the complete track record (H) is shown, labelled H, with the H NAV", () => {
  const d = seb();
  assert.equal(chosenReturnsClass(d, sebSpec, {}), "LDM202");
  assert.equal(initialSelection(d, sebSpec, {}).classCode, "LDM202");
  const p = pickData(d, sebSpec, {}, { classCode: "LDM202", variant: null });
  assert.equal(p.data!.performance!.returnClass, "H");
  // the preferred class is shown again as soon as its series is complete
  const fixed = seb();
  fixed.performanceByClass!.LDM201 = entry("LDM201", "F", perf("F", { firstMonth: "2023-07-31" }));
  assert.equal(chosenReturnsClass(fixed, sebSpec, {}), "LDM201");
});

test("no complete series: the one with the most figures (ties: candidate order); none: null", () => {
  const d = base({
    performanceByClass: {
      LDM201: entry("LDM201", "F", holed("F")),
      LDM202: entry("LDM202", "H", perf("H", { withheldMonths: ["2020-01-31"], trailing: { fund: { "1M": 0.01 } } })),
    },
  });
  assert.equal(chosenReturnsClass(d, sebSpec, {}), "LDM201", "4 figures beat 2");
  assert.equal(chosenReturnsClass(base({ performanceByClass: {} }), sebSpec, {}), null);
});

test("young / currency / unavailable classes never show returns; a selection pointing to one falls back", () => {
  const d = seb();
  assert.equal(showsReturns(d, "LDM205"), false);
  assert.equal(showsReturns(d, "LDM211"), false);
  for (const code of ["LDM205", "LDM211", "LDM999"]) {
    const p = pickData(d, sebSpec, {}, { classCode: code, variant: null });
    assert.equal(p.returnsClass, "LDM202", code);
    assert.equal(p.data!.performance!.returnClass, "H", code);
  }
  // the visitor's own pick of a class with figures (even incomplete) shows that class's own figures
  const f = pickData(d, sebSpec, {}, { classCode: "LDM201", variant: null });
  assert.equal(f.returnsClass, "LDM201");
  assert.equal(f.data!.performance!.returnClass, "F");
  // the NAV of the young and USD classes stays selectable
  assert.deepEqual(
    selectableClasses(d, sebSpec, {}).map((o) => o.fundserv),
    ["LDM201", "LDM202", "LDM203", "LDM205", "LDM211"],
  );
});

test("cards: returns and NAV of the same class, labelled with it", () => {
  const spec = { ...FUNDS.find((f) => f.key === "sustainable-enhanced-bonds")! };
  const card = toFundCard({ spec, content: {}, data: { ...seb(), sourceName: "x" }, sample: false } as never);
  assert.equal(card.perfClass, "H");
  assert.equal(card.nav?.code, "LDM202");
  assert.equal(card.code, "LDM202");
  assert.equal(card.si, 0.04);
});

test("heatmap: a year with a withheld month or a gap inside the record is not shown", () => {
  const months = (y: number, from: number, to: number, skip: number[] = []) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i)
      .filter((m) => !skip.includes(m))
      .map((m) => ({ month: `${y}-${String(m).padStart(2, "0")}-28`, r: 0.001 }));
  const monthly = [...months(2023, 7, 12), ...months(2024, 1, 12, [2]), ...months(2025, 1, 12), ...months(2026, 1, 8)];
  assert.deepEqual(
    heatmapGrid(monthly, [], "2026-08-31").map((r) => r.year),
    [2026, 2025, 2023],
    "2024 has a gap",
  );
  assert.deepEqual(
    heatmapGrid(months(2025, 1, 12), [], "2025-12-31", ["2025-06-30"]).map((r) => r.year),
    [],
    "a listed withheld month removes its year",
  );
  // months before the start / after the last month are not gaps
  assert.deepEqual(
    heatmapGrid([...months(2023, 7, 12), ...months(2024, 1, 3)], [], "2024-03-31").map((r) => r.year),
    [2024, 2023],
  );
});

test("sample data (e2e) covers the fallbacks: young, non-CAD and withheld-month classes", () => {
  const funds = (sample as unknown as { funds: Record<string, Data> }).funds;
  const all = Object.values(funds);
  const statuses = new Set(all.flatMap((f) => Object.values(f.classInfo ?? {}).map((c) => c.status)));
  assert.ok(statuses.has("young") && statuses.has("currency"));
  assert.ok(
    all.some((f) => Object.values(f.performanceByClass ?? {}).some((c) => c.performance.withheldMonths?.length)),
  );
  // every fund with class series opens on a class whose own series has figures
  for (const spec of FUNDS.filter((s) => s.classes?.length)) {
    const d = funds[spec.key];
    if (!d) continue;
    const code = chosenReturnsClass(d, spec, {});
    assert.ok(code && showsReturns(d, code), spec.key);
  }
});
