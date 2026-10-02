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
