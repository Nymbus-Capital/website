/**
 * Per-class returns engine (class-returns.ts) on SYNTHETIC daily rows: inception of the current run, the partial first
 * month from the inception NAV, and the source-defect checks (bad valuation prints, daily dispersion, cross-class
 * consistency). No real fund data.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeFundClasses, crossClassFailures, currentRun, dispersionMonths, hasMinHistory, minHistoryDate, monthsFromInception, spikeMonths,
} from "../../../src/lib/pipeline/class-returns.ts";
import { CLASS_CHECKS } from "../../../src/lib/pipeline/config.ts";
import { tradingDays, type DailyRow } from "../../../src/lib/pipeline/daily-chain.ts";

/** CIBC-era rows of one class: a NAV path from `navs` days with the given daily returns (default 0.1 %) */
function rows(days: string[], r: (d: string, i: number) => number = () => 0.001, nav0 = 10, currency = "CAD"): DailyRow[] {
  let nav = nav0;
  return days.map((date, i) => {
    const ret = r(date, i);
    nav *= 1 + ret;
    return { date, source: "cibc", currency, nav_per_share_cad: nav, net_daily_return: ret, net_return_method: "legacy_stored" };
  });
}

test("inception = first price of the current run: a gap of more than 10 days ends an earlier life; the floor cuts a run; an unknown start", () => {
  const old = tradingDays("2022-01-04", "2022-06-30");
  const now = tradingDays("2023-02-06", "2023-05-31");
  const rs = rows([...old, ...now]);
  assert.deepEqual(currentRun(rs, { gapDays: 10 }), { inception: "2023-02-06", previousRunEnd: "2022-06-30", why: null });
  // a long weekend (4 days) is not a gap
  const cont = rows(tradingDays("2023-03-01", "2023-05-31"));
  assert.equal(currentRun(cont, { gapDays: 10 }).inception, "2023-03-01");
  // a reused code priced without a gap: the fund's first day cuts the run there
  const reused = rows(tradingDays("2021-06-01", "2021-12-31"));
  assert.deepEqual(currentRun(reused, { gapDays: 10, floor: "2021-10-05" }), { inception: "2021-10-05", previousRunEnd: null, why: null });
  // priced from the first day read: the inception may be earlier, unknown
  const fromStart = rows(tradingDays("2019-01-02", "2019-06-28"));
  assert.equal(currentRun(fromStart, { gapDays: 10, requestedFrom: "2019-01-01" }).inception, null);
  assert.match(currentRun(fromStart, { gapDays: 10, requestedFrom: "2019-01-01" }).why!, /inception before it unknown/);
  // rows without a NAV per unit do not count
  assert.equal(currentRun([{ date: "2023-01-03", nav_per_share_cad: null }], { gapDays: 10 }).inception, null);
});

test("the first month runs from the inception NAV: the inception day's own return (relative to an old life) is never used", () => {
  const days = tradingDays("2023-02-06", "2023-04-28");
  // the first row after the gap carries a +35 % 'return' against the old life's last NAV
  const rs = rows(days, (d) => (d === "2023-02-06" ? 0.35 : 0.001));
  const ms = monthsFromInception(rs, "2023-02-06", "2023-04-30");
  assert.equal(ms[0].month, "2023-02-28");
  assert.equal(ms[0].partial, true);
  const febAfter = tradingDays("2023-02-07", "2023-02-28").length;
  assert.ok(Math.abs(ms[0].r! - (Math.pow(1.001, febAfter) - 1)) < 1e-12, "compounded from the day after the inception");
  assert.equal(ms[1].partial, false);
  assert.ok(Math.abs(ms[1].r! - (Math.pow(1.001, tradingDays("2023-03-01", "2023-03-31").length) - 1)) < 1e-12);
  // a class launched on the month's last valuation day: its first month is the next one, complete
  const late = rows(tradingDays("2023-02-28", "2023-04-28"));
  const ml = monthsFromInception(late, "2023-02-28", "2023-04-30");
  assert.equal(ml[0].month, "2023-03-31");
  assert.equal(ml[0].partial, false);
  // a missing day after the inception: the partial month is unavailable
  const hole = rs.filter((r) => r.date !== "2023-02-15");
  assert.equal(monthsFromInception(hole, "2023-02-06", "2023-04-30")[0].r, null);
});

test("bad valuation print: opposite daily moves ≥ 2 % that cancel out flag both months, for the fund", () => {
  const d = new Map<string, number>([["2021-11-29", 0.001], ["2021-11-30", 0.045], ["2021-12-01", -0.052], ["2021-12-02", 0.001]]);
  const out = spikeMonths({ LDM001: d }, CLASS_CHECKS);
  assert.deepEqual([...out.keys()].sort(), ["2021-11-30", "2021-12-31"]);
  assert.match(out.get("2021-11-30")!, /bad valuation print: LDM001 2021-11-30 4\.50% then 2021-12-01 -5\.20%/);
  // a real two-day move (same sign, or not reversed) is not a print error
  assert.equal(spikeMonths({ X: new Map([["2022-03-14", 0.03], ["2022-03-15", 0.025]]) }, CLASS_CHECKS).size, 0);
  assert.equal(spikeMonths({ X: new Map([["2022-03-14", 0.04], ["2022-03-15", -0.021]]) }, CLASS_CHECKS).size, 0, "combined +1.8 % > half of 2.1 %: not reversed");
  assert.equal(spikeMonths({ X: new Map([["2022-03-14", 0.015], ["2022-03-15", -0.015]]) }, CLASS_CHECKS).size, 0, "below 2 %");
});

test("daily dispersion: classes of one book disagreeing on a day (distribution adjustment) withhold that month for the fund", () => {
  const f = new Map([["2024-12-30", 0.001], ["2024-12-31", -0.012]]);
  const h = new Map([["2024-12-30", 0.0011], ["2024-12-31", -0.0121]]);
  const i = new Map([["2024-12-30", 0.001], ["2024-12-31", 0.001]]);
  const out = dispersionMonths({ F: f, H: h, I: i }, CLASS_CHECKS);
  assert.deepEqual([...out.keys()], ["2024-12-31"], "the majority (F, H) may be the wrong side: every class");
  assert.match(out.get("2024-12-31")!, /classes disagree on 2024-12-31: H -1\.21% vs I 0\.10%/);
  // fee accruals (a few hundredths of a percent) never trigger it; a large common move scales the tolerance
  assert.equal(dispersionMonths({ F: new Map([["2024-11-01", 0.002]]), H: new Map([["2024-11-01", 0.0019]]) }, CLASS_CHECKS).size, 0);
  assert.equal(dispersionMonths({ F: new Map([["2020-03-16", -0.04]]), H: new Map([["2020-03-16", -0.042]]) }, CLASS_CHECKS).size, 0);
});

test("cross-class consistency: an outlier class is withheld alone; two classes that disagree, or no majority, withhold every class", () => {
  const days = ["2025-03-03", "2025-03-04"];
  const d = (r: number): Map<string, number> => new Map(days.map((x) => [x, r]));
  const m = (r: number) => [{ month: "2025-03-31", r: (1 + r) ** 2 - 1, days }];
  // 4 classes: I drifts by ≈ +0.9 % while the others agree (median ≈ 0.6 %, tolerance 0.5 %)
  const four = crossClassFailures({ FP: m(0.003), F: m(0.0029), J: m(0.0031), I: m(0.0075) }, { FP: d(0.003), F: d(0.0029), J: d(0.0031), I: d(0.0075) }, CLASS_CHECKS);
  assert.deepEqual([...four.fails.keys()], ["I"]);
  assert.match(four.fails.get("I")!.get("2025-03-31")!, /deviates from the fund's other series: 1\.51% vs median 0\.61% of 4 series \(tolerance 0\.50%\)/);
  // 2 classes beyond the tolerance: which one is wrong cannot be told → both
  const two = crossClassFailures({ F: m(0.001), H: m(0.006) }, { F: d(0.001), H: d(0.006) }, CLASS_CHECKS);
  assert.deepEqual([...two.fails.keys()].sort(), ["F", "H"]);
  // 3 classes spread with no majority: every class
  const three = crossClassFailures({ A: m(0), B: m(0.003), C: m(0.006) }, { A: d(0), B: d(0.003), C: d(0.006) }, CLASS_CHECKS);
  assert.deepEqual([...three.fails.keys()].sort(), ["A", "B", "C"]);
  assert.match(three.fails.get("B")!.get("2025-03-31")!, /no clear majority/);
  // a performance-fee class drifting 0.4 % in a strong month stays within the tolerance
  const fee = crossClassFailures({ F: m(0.01), FP: m(0.008) }, { F: d(0.01), FP: d(0.008) }, CLASS_CHECKS);
  assert.equal(fee.fails.size, 0);
  // a class alone over its days cannot be compared: unchecked (recorded for the admin)
  const alone = crossClassFailures({ F: m(0.01) }, { F: d(0.01) }, CLASS_CHECKS);
  assert.deepEqual(alone.unchecked, [{ fundserv: "F", month: "2025-03-31" }]);
});

test("computeFundClasses: non-CAD class without figures; withheld months keep their place with the reason", () => {
  const days = tradingDays("2024-01-02", "2024-06-28");
  const base = (d: string): number => (d === "2024-03-15" ? 0.03 : d === "2024-03-18" ? -0.0295 : 0.0005);
  const res = computeFundClasses([
    { fundserv: "A", display: "A", currency: "CAD", rows: rows(days, base) },
    { fundserv: "B", display: "B", currency: "CAD", rows: rows(days, (d) => base(d) - 0.00001) },
    { fundserv: "U", display: "U USD", currency: "USD", rows: rows(days, base, 10, "USD") },
    { fundserv: "X", display: "X", currency: "CAD", rows: null, error: "HTTP 500" },
  ], { endMonth: "2024-06-30", cfg: CLASS_CHECKS, requestedFrom: "2019-01-01" });
  const by = Object.fromEntries(res.classes.map((c) => [c.fundserv, c]));
  assert.equal(by.U.status, "currency");
  assert.equal(by.X.status, "unavailable");
  assert.match(by.X.why!, /HTTP 500/);
  assert.equal(by.A.inception, "2024-01-02");
  const march = by.A.months.find((m) => m.month === "2024-03-31")!;
  assert.equal(march.r, null);
  assert.match(march.reason!, /bad valuation print/);
  assert.deepEqual(res.fundMonths.map((x) => x.month), ["2024-03-31"]);
  assert.ok(by.B.months.filter((m) => m.month !== "2024-03-31").every((m) => m.r !== null));
});

test("12-month minimum: counted from the inception day (same day 12 months later, clamped to the month's end)", () => {
  assert.equal(hasMinHistory("2025-09-15", "2026-08-31", 12), false);
  assert.equal(hasMinHistory("2025-09-15", "2026-09-30", 12), true);
  assert.equal(hasMinHistory("2025-08-29", "2026-08-31", 12), true);
  assert.equal(hasMinHistory("2026-06-03", "2026-09-30", 12), false);
  assert.equal(minHistoryDate("2024-02-29", 12), "2025-02-28");
  assert.equal(minHistoryDate("2025-08-31", 6), "2026-02-28");
});
