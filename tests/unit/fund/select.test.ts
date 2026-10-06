/** Class and variant selection of the fund page: each class shows its own series or "coming soon", never another class's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { classOptions, classType, initialSelection, pickData, type SpecLike } from "../../../src/components/fund/lib/select.ts";
import type { FundData, Performance } from "../../../src/lib/data/types.ts";

const perf = (cls: string, si: number, extra: Partial<Performance> = {}): Performance => ({
  asOf: "2026-08-31", basis: "net", method: "compounded", firstMonth: "2019-01-31", monthly: [], trailing: { fund: { SI: si, "1Y": si / 2 } }, calendar: [], growth: [],
  returnClass: cls, returnClassLabel: `Series ${cls}`, ...extra,
});
const nav = (fundserv: string, display: string) => ({ fundserv, display, currency: "CAD", nav: 10, date: "2026-09-28", prevNav: 10, change: 0, changePct: 0 }) as never;

const spec: SpecLike = {
  headlineClass: "LDM201",
  classes: [{ fundserv: "LDM201", display: "F" }, { fundserv: "LDM202", display: "H" }, { fundserv: "LDM081", display: "F", type: "prospectus" }, { fundserv: "LDM001", display: "FP", type: "om" }],
};
const base = (extra: Partial<FundData> = {}): Omit<FundData, "sourceName"> => ({
  key: "sustainable-enhanced-bonds", performance: perf("F", 0.05), risk: { window: "SI", annReturn: 0.05 } as never, risk3Y: null,
  nav: { asOf: "2026-09-28", classes: [nav("LDM201", "F"), nav("LDM202", "H"), nav("LDM299", "A")] }, aum: null,
  characteristics: [], breakdowns: {}, topHoldings: [], esg: [], factsheetMonth: null, ...extra,
});
const withClasses = (): Omit<FundData, "sourceName"> => base({
  performanceByClass: {
    LDM201: { fundserv: "LDM201", display: "F", performance: perf("F", 0.05), risk: { window: "SI", annReturn: 0.05 } as never, risk3Y: null },
    LDM202: { fundserv: "LDM202", display: "H", performance: perf("H", 0.04, { shortRecord: true }), risk: null, risk3Y: null },
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
  assert.deepEqual(o.map((c) => c.fundserv), ["LDM201", "LDM001", "LDM081", "LDM202", "LDM299"]);
  assert.equal(o.find((c) => c.fundserv === "LDM081")!.type, "prospectus");
  assert.equal(o.find((c) => c.fundserv === "LDM299")!.type, "none");
  assert.equal(initialSelection(withClasses(), spec, {}).classCode, "LDM201");
  assert.equal(initialSelection(withClasses(), spec, { headlineClass: "LDM202" }).classCode, "LDM202");
});

test("pickData: each class gets its own series; a class without one is 'coming soon'", () => {
  const d = withClasses();
  const f = pickData(d, spec, {}, { classCode: "LDM201", variant: null });
  assert.equal(f.data!.performance!.returnClass, "F");
  assert.equal(f.returnsSoon, false);
  const h = pickData(d, spec, {}, { classCode: "LDM202", variant: null });
  assert.equal(h.data!.performance!.returnClass, "H");
  assert.equal(h.shortRecord, true);
  assert.equal(h.data!.risk, null);
  const a = pickData(d, spec, {}, { classCode: "LDM299", variant: null });
  assert.equal(a.returnsSoon, true);
  assert.equal(a.data!.performance, null);
  assert.equal(a.data!.risk, null);
  assert.equal(a.data!.nav!.classes.length, 3, "NAV of the class is untouched");
  assert.ok(d.performance && d.risk, "input not mutated");
});

test("pickData: data published before class series: only the class the series says it is", () => {
  const d = base();
  assert.equal(pickData(d, spec, {}, { classCode: "LDM201", variant: null }).data!.performance!.returnClass, "F");
  assert.equal(pickData(d, spec, {}, { classCode: "LDM202", variant: null }).returnsSoon, true);
  assert.equal(pickData(d, spec, {}, { classCode: "LDM299", variant: null }).data!.performance, null);
});

test("pickData: variants switch returns, risk, characteristics, allocation and holdings; the default is the fund's own", () => {
  const gspec: SpecLike = { headlineClass: null, classes: [], variants: [{ id: "6", label: { en: "6%", fr: "6 %" } }, { id: "3", label: { en: "3%", fr: "3 %" } }, { id: "9", label: { en: "9%", fr: "9 %" } }] };
  const v = (id: string, si: number) => ({ variant: id, performance: perf("", si), risk: null, risk3Y: null, characteristics: [{ key: id }] as never, breakdowns: { sectors: [{ label: id, fund: 1 }] }, topHoldings: [], esg: [], factsheetMonth: "2026-08" });
  const d = base({ performance: perf("", 0.06), variants: { "6": v("6", 0.06), "3": v("3", 0.03) }, defaultVariant: "6" });
  assert.equal(initialSelection(d, gspec, {}).variant, "6");
  assert.equal(pickData(d, gspec, {}, { classCode: null, variant: "3" }).data!.performance!.trailing.fund.SI, 0.03);
  assert.deepEqual(pickData(d, gspec, {}, { classCode: null, variant: "3" }).data!.characteristics, [{ key: "3" }]);
  const nine = pickData(d, gspec, {}, { classCode: null, variant: "9" });
  assert.equal(nine.data!.performance, null, "an unpublished variant shows nothing of another variant");
  assert.equal(nine.returnsSoon, true);
});

test("opening class: the headline when it has returns, else the data's default, else the first class offered that has returns", async () => {
  const { openingClass } = await import("../../../src/components/fund/lib/select.ts");
  // the registry's headline (F) is young: no returns; the pipeline's default (register order) is H
  const young = base({
    performanceByClass: { LDM202: { fundserv: "LDM202", display: "H", performance: perf("H", 0.04), risk: null, risk3Y: null } },
    defaultClass: "LDM202",
    classInfo: { LDM201: { fundserv: "LDM201", display: "F", currency: "CAD", inception: "2026-06-03", status: "young", minMonths: 12 } },
  });
  assert.equal(initialSelection(young, spec, {}).classCode, "LDM202", "never opens on an empty performance block");
  assert.equal(openingClass({ ...young, defaultClass: undefined }, spec, {}, classOptions(young, spec, {})), "LDM202", "first class offered with returns");
  // the admin's headline class wins when it has returns
  assert.equal(initialSelection(withClasses(), spec, { headlineClass: "LDM202" }).classCode, "LDM202");
  // no class has returns: the headline (the page then says why)
  assert.equal(initialSelection(base({ performanceByClass: {} }), spec, {}).classCode, "LDM201");
});

test("notices: a young series says when it launched and the minimum; a non-CAD series says why; others 'coming soon'", async () => {
  const { noFiguresText } = await import("../../../src/components/fund/lib/notice.ts");
  const d = base({
    performanceByClass: { LDM202: { fundserv: "LDM202", display: "H", performance: perf("H", 0.04), risk: null, risk3Y: null } },
    classInfo: {
      LDM201: { fundserv: "LDM201", display: "F", currency: "CAD", inception: "2026-06-03", status: "young", minMonths: 12 },
      LDM299: { fundserv: "LDM299", display: "F USD", currency: "USD", inception: "2025-12-12", status: "currency" },
    },
  });
  const f = pickData(d, spec, {}, { classCode: "LDM201", variant: null });
  assert.equal(f.data!.performance, null);
  assert.deepEqual(f.notice, { kind: "young", display: "F", inception: "2026-06-03", minMonths: 12 });
  const ctx = { returnsSoon: true, notice: f.notice, options: [{ fundserv: "LDM201", display: "F" }], selected: "LDM201" };
  const soon = { en: "Performance figures coming soon.", fr: "Les rendements seront bientôt publiés." };
  assert.equal(noFiguresText(ctx, "en", soon), "Series F launched on June 3, 2026. Performance will be shown once the series has 12 months of history.");
  assert.equal(noFiguresText(ctx, "fr", soon), "La série F a été lancée le 3 juin 2026. Les rendements seront présentés lorsque la série aura 12 mois d’historique.");
  const u = pickData(d, spec, {}, { classCode: "LDM299", variant: null });
  assert.match(noFiguresText({ ...ctx, notice: u.notice, selected: "LDM299" }, "en", soon), /not shown for series F USD: returns that account for distributions are not available for this series in USD/);
  assert.equal(noFiguresText({ returnsSoon: true, notice: null, options: [{ fundserv: "LDM203", display: "I" }], selected: "LDM203" }, "en", soon), "Performance figures for series I coming soon.");
});

test("withheld figures keep their row ('—'); periods longer than the history do not appear", async () => {
  const { trailingRows, calendarRows } = await import("../../../src/components/fund/lib/performance.ts");
  const p = perf("I", 0.05, {
    firstMonth: "2023-03-31", inception: "2023-03-06", partialFirstMonth: true, withheldMonths: ["2025-03-31"],
    trailing: { fund: { "1M": 0.001, "3M": 0.003, YTD: 0.01, "1Y": 0.02, "2Y": null, "3Y": null, "5Y": null, "10Y": null, SI: null } },
    calendar: [{ year: 2024, fund: 0.03 }, { year: 2025, fund: null }],
  });
  assert.deepEqual(trailingRows(p).map((r) => [r.period, r.fund]), [["1M", 0.001], ["3M", 0.003], ["YTD", 0.01], ["1Y", 0.02], ["2Y", null], ["3Y", null], ["SI", null]]);
  assert.deepEqual(calendarRows(p.calendar, true).map((r) => r.year), [2024, 2025]);
  assert.deepEqual(calendarRows(p.calendar).map((r) => r.year), [2024], "the headline keeps its rule");
  // without withheld months nothing changes
  assert.deepEqual(trailingRows(perf("F", 0.05)).map((r) => r.period), ["1Y", "SI"]);
});

test("since-inception label of a class entry names its inception (EN / FR); other periods and the track record unchanged", async () => {
  const { periodLong } = await import("../../../src/components/fund/lib/notice.ts");
  assert.equal(periodLong("SI", { inception: "2021-10-05" }, "en"), "Since inception (Oct 5, 2021)");
  assert.match(periodLong("SI", { inception: "2021-10-05" }, "fr"), /^Depuis la création \(5 oct\.? 2021\)$/);
  assert.equal(periodLong("SI", {}, "en"), "Since inception");
  assert.equal(periodLong("1Y", { inception: "2021-10-05" }, "en"), "1 year");
});
