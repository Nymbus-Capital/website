import { test } from "node:test";
import assert from "node:assert/strict";
import { businessDaysSince, businessMsBetween, expectedPerformanceMonthEnd, freshness, localDate } from "../../../src/lib/pipeline/freshness.ts";

const H = 3_600_000;
const t = (s: string): number => Date.parse(s);

test("business-day hours: weekends and TSX holidays do not count (America/Toronto days)", () => {
  // Friday 2026-10-02 18:45 EDT -> Monday 2026-10-05 12:00 EDT: 5h15 on Friday + 12h on Monday
  assert.equal(businessMsBetween(t("2026-10-02T22:45:00Z"), t("2026-10-05T16:00:00Z")) / H, 17.25);
  // Thanksgiving Monday 2026-10-12 is a holiday: Friday 18:45 -> Tuesday 06:45 = 5h15 + 6h45
  assert.equal(businessMsBetween(t("2026-10-09T22:45:00Z"), t("2026-10-13T10:45:00Z")) / H, 12);
  // across the fall-back change (Sunday 2026-11-01): Friday 12:00 EDT -> Monday 12:00 EST = 12h + 12h
  assert.equal(businessMsBetween(t("2026-10-30T16:00:00Z"), t("2026-11-02T17:00:00Z")) / H, 24);
  assert.equal(businessMsBetween(t("2026-10-05T16:00:00Z"), t("2026-10-05T15:00:00Z")), 0);
  assert.equal(localDate(t("2026-10-06T03:00:00Z")), "2026-10-05", "23:00 EDT is still the 5th in Toronto");
});

test("expected performance month: the last month-end closed for more than 10 business days", () => {
  assert.equal(expectedPerformanceMonthEnd("2026-10-05"), "2026-08-31");
  // Oct 1–15 without Thanksgiving (Oct 12) = 10 business days: not yet
  assert.equal(expectedPerformanceMonthEnd("2026-10-15"), "2026-08-31");
  assert.equal(expectedPerformanceMonthEnd("2026-10-16"), "2026-09-30");
  assert.equal(expectedPerformanceMonthEnd("2027-01-04"), "2026-11-30", "across the year end");
  assert.equal(expectedPerformanceMonthEnd("2027-01-20"), "2026-12-31");
  assert.equal(businessDaysSince("2026-10-02", "2026-10-05"), 1, "Friday's NAV on Monday");
  assert.equal(businessDaysSince("2026-10-09", "2026-10-13"), 1, "holiday Monday skipped");
  assert.equal(businessDaysSince("2026-10-05", "2026-10-05"), 0);
});

const NOW = new Date("2026-10-07T14:00:00Z"); // Wednesday 10:00 EDT
const fund = (key: string, perf: string | null, nav: string | null, hasNav = true) => ({ key, hasNav, performanceAsOf: perf, navAsOf: nav });

test("verdict ok: recent publication, last expected month, NAV a day old; a strategy without NAV is fine", () => {
  const f = freshness({ now: NOW, lastPublishAt: "2026-10-06T22:46:00Z", funds: [fund("monthly-income", "2026-08-31", "2026-10-06"), fund("global-minimum-volatility", "2026-09-30", null, false)] });
  assert.equal(f.verdict, "ok", f.reasons.join("; "));
  assert.deepEqual(f.codes, []);
  assert.equal(f.funds["monthly-income"].navLagBusinessDays, 1);
  assert.equal(f.funds["global-minimum-volatility"].navLagBusinessDays, null);
  assert.equal(f.funds["monthly-income"].performanceExpected, "2026-08-31");
});

test("verdict stale: publication, performance month, NAV age, missing data — each with a stable code", () => {
  const f = freshness({
    now: NOW, lastPublishAt: "2026-10-02T22:45:00Z", // Friday 18:45: 5 h 15 + Mon + Tue (24 h each) + 10 h Wednesday = 63 h 15
    funds: [fund("monthly-income", "2026-07-31", "2026-09-29"), fund("multi-strategy", null, null), fund("global-minimum-volatility", "2026-08-31", null, false)],
  });
  assert.equal(f.verdict, "stale");
  assert.deepEqual(f.codes, ["monthly-income:nav", "monthly-income:performance", "multi-strategy:nav", "multi-strategy:performance", "publish"]);
  assert.ok(f.reasons.some((r) => /no publication for 63 business-day hours/.test(r)), f.reasons.join("; "));
  assert.ok(f.reasons.includes("monthly-income: NAV as of 2026-09-29, 6 business days old (limit 4)"));
  assert.ok(f.reasons.some((r) => r.startsWith("monthly-income: performance as of 2026-07-31, 2026-08 expected")));
  assert.equal(f.funds["global-minimum-volatility"].verdict, "ok");
  assert.equal(freshness({ now: NOW, lastPublishAt: null, funds: [] }).reasons[0], "never published");
  // NAV exactly 4 business days old is still fine
  assert.equal(freshness({ now: NOW, lastPublishAt: "2026-10-07T10:45:00Z", funds: [fund("x", "2026-08-31", "2026-10-01")] }).verdict, "ok");
  assert.equal(freshness({ now: NOW, lastPublishAt: "2026-10-07T10:45:00Z", funds: [fund("x", "2026-08-31", "2026-09-30")] }).verdict, "stale");
});
