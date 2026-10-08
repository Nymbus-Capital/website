/** Embedded completeness gate (validate/completeness.ts): internal problems, never on the pages. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { completeSeries, fundCompleteness } from "../../../src/lib/pipeline/validate/completeness.ts";
import type { FundData, Performance } from "../../../src/lib/data/types.ts";

const perf = (o: Partial<Performance> = {}): Performance =>
  ({
    asOf: "2026-09-30",
    firstMonth: "2023-01-31",
    trailing: { fund: { "1M": 0.01, YTD: 0.02, "1Y": 0.03, SI: 0.04 } },
    monthly: [],
    calendar: [],
    growth: [],
    ...o,
  }) as unknown as Performance;

test("completeSeries: ≥ 12 full months, nothing withheld, since-inception and 1-year figures", () => {
  assert.equal(completeSeries(perf()), true);
  assert.equal(completeSeries(perf({ withheldMonths: ["2024-12-31"] })), false);
  assert.equal(completeSeries(perf({ firstMonth: "2025-11-30" })), false, "11 months");
  assert.equal(completeSeries(perf({ firstMonth: "2025-10-31", partialFirstMonth: true })), false, "partial first month");
  assert.equal(completeSeries(perf({ trailing: { fund: { SI: null, "1Y": 0.01 } } as never })), false);
  assert.equal(completeSeries(null), false);
});

test("fundCompleteness: headline class incomplete, withheld months, NAV, months behind — each with a stable code", () => {
  const f = {
    performance: perf(),
    performanceByClass: {
      LDM201: { fundserv: "LDM201", display: "F", performance: perf({ withheldMonths: ["2026-07-31"] }) },
    },
    nav: { asOf: "2026-10-06", classes: [{ fundserv: "LDM202", display: "H", nav: 11, currency: "CAD" }] },
  } as unknown as FundData;
  const out = fundCompleteness("sustainable-enhanced-bonds", f, {
    vehicle: "fund",
    headlineClass: "LDM201",
    expectedMonth: "2026-10-31",
  });
  const codes = out.map((p) => p.code);
  assert.ok(codes.includes("sustainable-enhanced-bonds:headline-incomplete:LDM201"), codes.join(" "));
  assert.ok(codes.includes("sustainable-enhanced-bonds:withheld:2026-07-31"));
  assert.ok(codes.includes("sustainable-enhanced-bonds:no-headline-nav:LDM201"));
  assert.ok(codes.includes("sustainable-enhanced-bonds:behind:2026-10-31"));
  assert.ok(!codes.some((c) => c.endsWith(":no-complete-series")), "the track record is complete");
  // a complete fund: nothing
  const ok = {
    performance: perf(),
    nav: { asOf: "2026-10-06", classes: [{ fundserv: "LDM001", display: "FP", nav: 12, currency: "CAD" }] },
  } as unknown as FundData;
  assert.deepEqual(fundCompleteness("monthly-income", ok, { vehicle: "fund", headlineClass: "LDM001" }), []);
  assert.deepEqual(
    fundCompleteness("monthly-income", undefined, { vehicle: "fund", headlineClass: null }).map((p) => p.code),
    ["monthly-income:missing"],
  );
});
