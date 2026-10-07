import { test } from "node:test";
import assert from "node:assert/strict";
import {
  businessDaysSince,
  expectedPerformanceMonthEnd,
  freshness,
  localDate,
} from "../../../src/lib/pipeline/freshness.ts";

const t = (s: string): number => Date.parse(s);

test("Toronto calendar date", () => {
  assert.equal(localDate(t("2026-10-06T03:00:00Z")), "2026-10-05", "23:00 EDT is still the 5th in Toronto");
});

test("expected performance month: the last month-end closed for more than 7 business days", () => {
  assert.equal(expectedPerformanceMonthEnd("2026-10-05"), "2026-08-31");
  // Oct 1–9 = 7 business days: not yet; Oct 13 (Thanksgiving Oct 12 skipped) is the 8th
  assert.equal(expectedPerformanceMonthEnd("2026-10-09"), "2026-08-31");
  assert.equal(expectedPerformanceMonthEnd("2026-10-13"), "2026-09-30");
  assert.equal(expectedPerformanceMonthEnd("2027-01-04"), "2026-11-30", "across the year end");
  // Jan 4–12 = 7 business days (Jan 1 holiday): Dec due on Jan 13
  assert.equal(expectedPerformanceMonthEnd("2027-01-12"), "2026-11-30");
  assert.equal(expectedPerformanceMonthEnd("2027-01-13"), "2026-12-31");
  assert.equal(businessDaysSince("2026-10-02", "2026-10-05"), 1, "Friday's NAV on Monday");
  assert.equal(businessDaysSince("2026-10-09", "2026-10-13"), 1, "holiday Monday skipped");
  assert.equal(businessDaysSince("2026-10-05", "2026-10-05"), 0);
});

const NOW = new Date("2026-10-07T14:00:00Z"); // Wednesday 10:00 EDT
const fund = (key: string, perf: string | null, nav: string | null, hasNav = true, hasPerformance = true) => ({
  key,
  hasNav,
  hasPerformance,
  performanceAsOf: perf,
  navAsOf: nav,
});

test("verdict ok: last expected month, NAV a day old; a strategy without NAV is fine; no publication-age rule (review mode)", () => {
  const f = freshness({
    now: NOW,
    funds: [
      fund("monthly-income", "2026-08-31", "2026-10-06"),
      fund("global-minimum-volatility", "2026-09-30", null, false),
    ],
  });
  assert.equal(f.verdict, "ok", f.reasons.join("; "));
  assert.deepEqual(f.codes, []);
  assert.equal(f.funds["monthly-income"].navLagBusinessDays, 1);
  assert.equal(f.funds["global-minimum-volatility"].navLagBusinessDays, null);
  assert.equal(f.funds["monthly-income"].performanceExpected, "2026-08-31");
});

test("verdict stale: performance month, NAV age, missing data — each with a stable code; hidden blocks are not checked", () => {
  const f = freshness({
    now: NOW,
    funds: [
      fund("monthly-income", "2026-07-31", "2026-09-29"),
      fund("multi-strategy", null, null),
      fund("global-minimum-volatility", "2026-08-31", null, false),
    ],
  });
  assert.equal(f.verdict, "stale");
  assert.deepEqual(f.codes, [
    "monthly-income:nav",
    "monthly-income:performance",
    "multi-strategy:nav",
    "multi-strategy:performance",
  ]);
  assert.ok(f.reasons.includes("monthly-income: NAV as of 2026-09-29, 6 business days old (limit 2)"));
  assert.ok(f.reasons.some((r) => r.startsWith("monthly-income: performance as of 2026-07-31, 2026-08 expected")));
  assert.equal(f.funds["global-minimum-volatility"].verdict, "ok");
  // NAV exactly 2 business days old is still fine
  assert.equal(freshness({ now: NOW, funds: [fund("x", "2026-08-31", "2026-10-05")] }).verdict, "ok");
  assert.equal(freshness({ now: NOW, funds: [fund("x", "2026-08-31", "2026-10-02")] }).verdict, "stale");
  // hidden by the admin: performance and NAV not checked
  const hidden = freshness({ now: NOW, funds: [fund("x", null, null, false, false)] });
  assert.equal(hidden.verdict, "ok");
  assert.deepEqual([hidden.funds.x.performanceExpected, hidden.funds.x.navLagBusinessDays], [null, null]);
});
