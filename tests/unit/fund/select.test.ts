/** Class and variant selection of the fund page: one class's own series under that class's label, never a "coming soon" state. */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classOptions,
  classType,
  initialSelection,
  offeredVariants,
  pickData,
  selectableClasses,
  type SpecLike,
} from "../../../src/components/fund/lib/select.ts";
import type { FundData, Performance } from "../../../src/lib/data/types.ts";

const perf = (cls: string, si: number, extra: Partial<Performance> = {}): Performance => ({
  asOf: "2026-08-31",
  basis: "net",
  method: "compounded",
  firstMonth: "2019-01-31",
  monthly: [],
  trailing: { fund: { SI: si, "1Y": si / 2 } },
  calendar: [],
  growth: [],
  returnClass: cls,
  returnClassLabel: `Series ${cls}`,
  ...extra,
});
const nav = (fundserv: string, display: string) =>
  ({ fundserv, display, currency: "CAD", nav: 10, date: "2026-09-28", prevNav: 10, change: 0, changePct: 0 }) as never;

const spec: SpecLike = {
  headlineClass: "LDM201",
  classes: [
    { fundserv: "LDM201", display: "F" },
    { fundserv: "LDM202", display: "H" },
    { fundserv: "LDM081", display: "F", type: "prospectus" },
    { fundserv: "LDM001", display: "FP", type: "om" },
  ],
};
const base = (extra: Partial<FundData> = {}): Omit<FundData, "sourceName"> => ({
  key: "sustainable-enhanced-bonds",
  performance: perf("F", 0.05),
  risk: { window: "SI", annReturn: 0.05 } as never,
  risk3Y: null,
  nav: { asOf: "2026-09-28", classes: [nav("LDM201", "F"), nav("LDM202", "H"), nav("LDM299", "A")] },
  aum: null,
  characteristics: [],
  breakdowns: {},
  topHoldings: [],
  esg: [],
  factsheetMonth: null,
  ...extra,
});
const withClasses = (): Omit<FundData, "sourceName"> =>
  base({
    performanceByClass: {
      LDM201: {
        fundserv: "LDM201",
        display: "F",
        performance: perf("F", 0.05),
        risk: { window: "SI", annReturn: 0.05 } as never,
        risk3Y: null,
      },
      LDM202: {
        fundserv: "LDM202",
        display: "H",
        performance: perf("H", 0.04, { shortRecord: true }),
        risk: null,
        risk3Y: null,
      },
    },
    defaultClass: "LDM201",
  });

test("classType: admin choice, else registry, else unknown (no label)", () => {
  assert.equal(classType("LDM081", spec, null), "prospectus");
  assert.equal(classType("LDM001", spec, null), "om");
  assert.equal(classType("LDM201", spec, null), "none");
  assert.equal(classType("LDM201", spec, { classTypes: { LDM201: "prospectus" } }), "prospectus");
  assert.equal(classType("LDM081", spec, { classTypes: { LDM081: "om" } }), "om");
  assert.equal(classType("LDM299", spec, {}), "none");
});

test("classOptions: default class first, registry + NAV + returns classes, types attached", () => {
  const o = classOptions(withClasses(), spec, {});
  assert.deepEqual(
    o.map((c) => c.fundserv),
    ["LDM201", "LDM001", "LDM081", "LDM202", "LDM299"],
  );
  assert.equal(o.find((c) => c.fundserv === "LDM081")!.type, "prospectus");
  assert.equal(o.find((c) => c.fundserv === "LDM299")!.type, "none");
  // selectable: a class with a NAV, or with returns of its own; never a class with neither
  assert.deepEqual(
    selectableClasses(withClasses(), spec, {}).map((c) => c.fundserv),
    ["LDM201", "LDM202", "LDM299"],
  );
  assert.equal(initialSelection(withClasses(), spec, {}).classCode, "LDM201");
  // H has less than 12 months: never the opening class, even as the admin's headline
  assert.equal(initialSelection(withClasses(), spec, { headlineClass: "LDM202" }).classCode, "LDM201");
});

test("pickData: a class shows its own series; a class that cannot shows the chosen class's, under that class's label", () => {
  const d = withClasses();
  const f = pickData(d, spec, {}, { classCode: "LDM201", variant: null });
  assert.equal(f.data!.performance!.returnClass, "F");
  assert.equal(f.returnsClass, "LDM201");
  // H: less than 12 months (regulatory minimum) -> F's own series, labelled F
  const h = pickData(d, spec, {}, { classCode: "LDM202", variant: null });
  assert.equal(h.returnsClass, "LDM201");
  assert.equal(h.data!.performance!.returnClass, "F");
  // A: no series -> F, labelled F; its NAV untouched
  const a = pickData(d, spec, {}, { classCode: "LDM299", variant: null });
  assert.equal(a.returnsClass, "LDM201");
  assert.equal(a.data!.performance!.returnClass, "F");
  assert.equal(a.data!.nav!.classes.length, 3, "NAV of the class is untouched");
  assert.ok(d.performance && d.risk, "input not mutated");
  // no class can show returns: no performance at all (no message)
  const none = pickData(base({ performanceByClass: {} }), spec, {}, { classCode: "LDM201", variant: null });
  assert.equal(none.data!.performance, null);
  assert.equal(none.data!.risk, null);
  assert.equal(none.returnsClass, null);
});

test("pickData: data published before class series: only the class the series says it is", () => {
  const d = base();
  const f = pickData(d, spec, {}, { classCode: "LDM201", variant: null });
  assert.equal(f.data!.performance!.returnClass, "F");
  // H has no series of its own: F's (the series is F), labelled F
  const h = pickData(d, spec, {}, { classCode: "LDM202", variant: null });
  assert.equal(h.returnsClass, "LDM201");
  assert.equal(h.data!.performance!.returnClass, "F");
  // a series whose class is not a known class: never shown under another class's name
  const odd = base({ performance: perf("Z", 0.05) });
  assert.equal(pickData(odd, spec, {}, { classCode: "LDM201", variant: null }).data!.performance, null);
});

test("pickData: variants switch returns, risk, characteristics, allocation and holdings; only published variants are offered", () => {
  const gspec: SpecLike = {
    headlineClass: null,
    classes: [],
    variants: [
      { id: "3", label: { en: "3%", fr: "3 %" } },
      { id: "6", label: { en: "6%", fr: "6 %" }, default: true },
      { id: "9", label: { en: "9%", fr: "9 %" } },
    ],
  };
  const v = (id: string, si: number) => ({
    variant: id,
    performance: perf("", si),
    risk: null,
    risk3Y: null,
    characteristics: [{ key: id }] as never,
    breakdowns: { sectors: [{ label: id, fund: 1 }] },
    topHoldings: [],
    esg: [],
    factsheetMonth: "2026-08",
  });
  const d = base({
    performance: perf("", 0.06),
    variants: { "6": v("6", 0.06), "3": v("3", 0.03) },
    defaultVariant: "6",
  });
  assert.equal(initialSelection(d, gspec, {}).variant, "6");
  assert.deepEqual(
    offeredVariants(gspec.variants, d).map((x) => x.id),
    ["3", "6"],
  );
  assert.equal(pickData(d, gspec, {}, { classCode: null, variant: "3" }).data!.performance!.trailing.fund.SI, 0.03);
  assert.deepEqual(pickData(d, gspec, {}, { classCode: null, variant: "3" }).data!.characteristics, [{ key: "3" }]);
  // an unpublished variant is not offered: the default (published) one is shown, never another's under its name
  assert.equal(pickData(d, gspec, {}, { classCode: null, variant: "9" }).data!.performance!.trailing.fund.SI, 0.06);
  // no variant published at all: nothing of another variant
  const none = pickData({ ...d, variants: {} }, gspec, {}, { classCode: null, variant: "6" });
  assert.equal(none.data!.performance, null);
  // older data without a variant map: only the default variant (its figures are the top-level ones)
  assert.deepEqual(
    offeredVariants(gspec.variants, { ...d, variants: undefined }).map((x) => x.id),
    ["6"],
  );
});

test("opening class: the chosen returns class (complete series first); a page never opens on a class without figures", async () => {
  const { openingClass } = await import("../../../src/components/fund/lib/select.ts");
  // the registry's headline (F) is young: no returns; the pipeline's default (register order) is H
  const young = base({
    performanceByClass: {
      LDM202: { fundserv: "LDM202", display: "H", performance: perf("H", 0.04), risk: null, risk3Y: null },
    },
    defaultClass: "LDM202",
    classInfo: {
      LDM201: {
        fundserv: "LDM201",
        display: "F",
        currency: "CAD",
        inception: "2026-06-03",
        status: "young",
        minMonths: 12,
      },
    },
  });
  assert.equal(initialSelection(young, spec, {}).classCode, "LDM202", "never opens on an empty performance block");
  assert.equal(
    openingClass({ ...young, defaultClass: undefined }, spec, {}, classOptions(young, spec, {})),
    "LDM202",
    "first class offered with returns",
  );
  // no class has returns: the headline
  assert.equal(initialSelection(base({ performanceByClass: {} }), spec, {}).classCode, "LDM201");
});

test("young / non-CAD / no-series classes: never offered for returns, their NAV still selectable, no notice", () => {
  const d = base({
    performanceByClass: {
      LDM202: { fundserv: "LDM202", display: "H", performance: perf("H", 0.04), risk: null, risk3Y: null },
      // a series published for a young class is still never shown (status wins)
      LDM201: { fundserv: "LDM201", display: "F", performance: perf("F", 0.05), risk: null, risk3Y: null },
    },
    classInfo: {
      LDM201: {
        fundserv: "LDM201",
        display: "F",
        currency: "CAD",
        inception: "2026-06-03",
        status: "young",
        minMonths: 12,
      },
      LDM299: { fundserv: "LDM299", display: "F USD", currency: "USD", inception: "2025-12-12", status: "currency" },
    },
  });
  const f = pickData(d, spec, {}, { classCode: "LDM201", variant: null });
  assert.equal(f.returnsClass, "LDM202");
  assert.equal(f.data!.performance!.returnClass, "H");
  assert.ok(!("notice" in f) && !("returnsSoon" in f));
  const u = pickData(d, spec, {}, { classCode: "LDM299", variant: null });
  assert.equal(u.returnsClass, "LDM202");
  assert.deepEqual(
    selectableClasses(d, spec, {}).map((c) => c.fundserv),
    ["LDM201", "LDM202", "LDM299"],
    "their NAV stays selectable",
  );
});

test("withheld figures: no row, no year, no dash; periods longer than the history do not appear", async () => {
  const { trailingRows, calendarRows, returnBadges } = await import(
    "../../../src/components/fund/lib/performance.ts"
  );
  const p = perf("I", 0.05, {
    firstMonth: "2023-03-31",
    inception: "2023-03-06",
    partialFirstMonth: true,
    withheldMonths: ["2025-03-31"],
    trailing: {
      fund: {
        "1M": 0.001,
        "3M": 0.003,
        YTD: 0.01,
        "1Y": 0.02,
        "2Y": null,
        "3Y": null,
        "5Y": null,
        "10Y": null,
        SI: null,
      },
      index: { "1M": 0.002, SI: 0.03, "3Y": 0.01 },
    },
    calendar: [
      { year: 2024, fund: 0.03 },
      { year: 2025, fund: null, index: 0.02 },
    ],
  });
  assert.deepEqual(
    trailingRows(p).map((r) => [r.period, r.fund, r.index]),
    [
      ["1M", 0.001, 0.002],
      ["3M", 0.003, null],
      ["YTD", 0.01, null],
      ["1Y", 0.02, null],
    ],
  );
  assert.deepEqual(
    returnBadges(p).map((b) => b.period),
    ["1M", "3M", "YTD", "1Y"],
  );
  assert.deepEqual(
    calendarRows(p.calendar).map((r) => r.year),
    [2024],
  );
  assert.deepEqual(
    trailingRows(perf("F", 0.05)).map((r) => r.period),
    ["1Y", "SI"],
  );
});

test("since-inception label of a class entry names its inception (EN / FR); other periods and the track record unchanged", async () => {
  const { periodLong } = await import("../../../src/components/fund/lib/notice.ts");
  assert.equal(periodLong("SI", { inception: "2021-10-05" }, "en"), "Since inception (Oct 5, 2021)");
  assert.match(periodLong("SI", { inception: "2021-10-05" }, "fr"), /^Depuis la création \(5 oct\.? 2021\)$/);
  assert.equal(periodLong("SI", {}, "en"), "Since inception");
  assert.equal(periodLong("1Y", { inception: "2021-10-05" }, "en"), "1 year");
});
