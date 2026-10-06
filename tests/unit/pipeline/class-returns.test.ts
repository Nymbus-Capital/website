/**
 * Per-class returns engine (class-returns.ts) on SYNTHETIC daily rows: inception of the current run, the partial first
 * month from the inception NAV, and the source-defect checks (bad valuation prints, cross-class
 * consistency). No real fund data.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  adjustmentDays, computeFundClasses, crossClassFailures, currentRun, expectedReturn, fitClass, hasMinHistory, minHistoryDate, monthsFromInception, spikeMonths,
} from "../../../src/lib/pipeline/class-returns.ts";
import { CLASS_CHECKS } from "../../../src/lib/pipeline/config.ts";
import { tradingDays, type DailyRow } from "../../../src/lib/pipeline/daily-chain.ts";
import { addMonths } from "../../../src/lib/pipeline/metrics.ts";

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
  // a gap of 7 months: the class was closed (corroborated relaunch)
  assert.deepEqual(currentRun(rs, { gapDays: 10 }), { inception: "2023-02-06", previousRunEnd: "2022-06-30", why: null, gaps: [] });
  // a 3-week hole with the NAV carrying on: a coverage gap inside the run, never a relaunch
  const hole = rows([...tradingDays("2023-01-03", "2023-02-03"), ...tradingDays("2023-02-27", "2023-05-31")]);
  assert.deepEqual(currentRun(hole, { gapDays: 10 }), { inception: "2023-01-03", previousRunEnd: null, why: null, gaps: [{ from: "2023-02-03", to: "2023-02-27" }] });
  // a bond class trading near 10.00 with the same 3-week hole: still a coverage gap (a reset needs more than 30 days)
  const near10 = hole.map((r) => ({ ...r, nav_per_share_cad: 10 + ((r.nav_per_share_cad as number) - 10) * 0.01 }));
  assert.equal(currentRun(near10, { gapDays: 10, resetMinGapDays: 30 }).inception, "2023-01-03");
  // a 6-week closure restarting at 10.00: a relaunch
  const closed = rows([...tradingDays("2023-01-03", "2023-02-03"), ...tradingDays("2023-03-20", "2023-05-31")], () => 0.001, 10).map((r) => (r.date >= "2023-03-20" ? { ...r, nav_per_share_cad: 10 * (1 + 0.0001) } : r));
  assert.equal(currentRun(closed, { gapDays: 10, resetMinGapDays: 30 }).inception, "2023-03-20");
  // the same hole with the NAV per unit jumping by more than 5 %: a relaunch
  const reset = hole.map((r) => (r.date >= "2023-02-27" ? { ...r, nav_per_share_cad: (r.nav_per_share_cad as number) * 1.08 } : r));
  assert.equal(currentRun(reset, { gapDays: 10 }).inception, "2023-02-27");
  // a long weekend (4 days) is not a gap
  const cont = rows(tradingDays("2023-03-01", "2023-05-31"));
  assert.equal(currentRun(cont, { gapDays: 10 }).inception, "2023-03-01");
  // a reused code priced without a gap: the fund's first day cuts the run there
  const reused = rows(tradingDays("2021-06-01", "2021-12-31"));
  assert.deepEqual(currentRun(reused, { gapDays: 10, floor: "2021-10-05" }), { inception: "2021-10-05", previousRunEnd: null, why: null, gaps: [] });
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

/** one complete month per key of `rs` (one valuation day each, so the daily map reproduces the month) */
function panel(byClass: Record<string, Record<string, number>>): { months: Record<string, { month: string; r: number; days: string[]; partial: boolean }[]>; daily: Record<string, Map<string, number>> } {
  const months: Record<string, { month: string; r: number; days: string[]; partial: boolean }[]> = {};
  const daily: Record<string, Map<string, number>> = {};
  for (const [fsv, rs] of Object.entries(byClass)) {
    months[fsv] = Object.entries(rs).map(([month, r]) => ({ month, r, days: [month], partial: false }));
    daily[fsv] = new Map(Object.entries(rs));
  }
  return { months, daily };
}
const MONTHS = Array.from({ length: 24 }, (_, i) => { const y = 2024 + Math.floor(i / 12), mo = (i % 12) + 1; return new Date(Date.UTC(y, mo, 0)).toISOString().slice(0, 10); });
/** a synthetic fund month path (between −2 % and +7 %), deterministic */
const fundPath = (i: number): number => 0.01 + 0.03 * Math.sin(i * 1.7) + (i % 5 === 0 ? 0.03 : 0);

test("fit per class: a fee-free class scaling with the median is expected (no breach); clipping and the < 12-month fallback", () => {
  // F, J, A track the median with their fees; I (no performance fee) earns ~20 % more of every month
  const series = (f: (m: number) => number) => Object.fromEntries(MONTHS.map((d, i) => [d, f(fundPath(i))]));
  const { months, daily } = panel({ F: series((m) => m - 0.0002), J: series((m) => m - 0.0001), A: series((m) => m - 0.0009), I: series((m) => 1.2 * m + 0.0001) });
  const out = crossClassFailures(months, daily, CLASS_CHECKS);
  assert.equal(out.fundMonths.size, 0);
  assert.equal(out.fails.size, 0, "class I's spread in strong months is its expected spread");
  assert.ok(Math.abs(out.fits.I.bUp - 1.2) < 0.05 && Math.abs(out.fits.I.bDown - 1.2) < 0.05 && !out.fits.I.fallback, JSON.stringify(out.fits.I));
  // clipping: an absurd slope / intercept is bounded (each side); fewer than 12 months → a = 0, slope 1
  const pts = MONTHS.map((_, i) => ({ m: fundPath(i), r: 3 * fundPath(i) + 0.01 }));
  const f = fitClass(pts, CLASS_CHECKS);
  assert.equal(f.bUp, 1.4);
  assert.equal(f.bDown, 1.4);
  assert.equal(f.a, 0.003);
  assert.deepEqual(fitClass(pts.slice(0, 11), CLASS_CHECKS), { a: 0, bUp: 1, bDown: 1, n: 11, fallback: true, piecewise: false });
});

test("fit per class: separate up / down slopes (performance fee in up months only); one line when a side is short", () => {
  // a fee-free class against fee-paying ones: 1.25 × an up month, 1 × a down month, +0.05 % a month
  const ms = MONTHS.map((_, i) => fundPath(i));
  const pts = ms.map((m) => ({ m, r: 0.0005 + 1.25 * Math.max(m, 0) + Math.min(m, 0) }));
  const down = pts.filter((p) => p.m <= 0).length;
  assert.ok(down >= CLASS_CHECKS.fitSideMinMonths && pts.length - down >= CLASS_CHECKS.fitSideMinMonths);
  const f = fitClass(pts, CLASS_CHECKS);
  assert.ok(f.piecewise && Math.abs(f.bUp - 1.25) < 1e-9 && Math.abs(f.bDown - 1) < 1e-9 && Math.abs(f.a - 0.0005) < 1e-9, JSON.stringify(f));
  // continuous at 0: the expected return at m = 0 is a on both sides
  assert.ok(Math.abs(expectedReturn(f, 0) - 0.0005) < 1e-12 && Math.abs(expectedReturn(f, 0.02) - 0.0255) < 1e-9 && Math.abs(expectedReturn(f, -0.02) + 0.0195) < 1e-9);
  // fewer than fitSideMinMonths down months: one Theil–Sen line over every month (both slopes equal)
  const ups = pts.filter((p) => p.m > 0);
  const few = [...ups, ...pts.filter((p) => p.m <= 0).slice(0, CLASS_CHECKS.fitSideMinMonths - 1)];
  const g = fitClass(few, CLASS_CHECKS);
  assert.ok(!g.piecewise && !g.fallback && g.bUp === g.bDown, JSON.stringify(g));
});

test("cross-class: a single outlier with no adjustment day → that class only; with an adjustment day → every class; two breaching → every class", () => {
  const series = (f: (m: number, d: string) => number) => Object.fromEntries(MONTHS.map((d, i) => [d, f(fundPath(i), d)]));
  const bad = MONTHS[13];
  const four = (aBad: (d: string) => number, fBad: (d: string) => number = () => 0) => panel({
    F: series((m, d) => m - 0.0002 + fBad(d)), J: series((m) => m - 0.0001), I: series((m) => 1.2 * m), A: series((m, d) => m - 0.0009 + aBad(d)),
  });
  // A alone is off by +6 % in one month (a broken class): A withheld alone
  const one = four((d) => (d === bad ? 0.06 : 0));
  const r1 = crossClassFailures(one.months, one.daily, CLASS_CHECKS);
  assert.equal(r1.fundMonths.size, 0);
  assert.deepEqual([...r1.fails.keys()], ["A"]);
  assert.match(r1.fails.get("A")!.get(bad)!, /deviates from the fund's other classes, which agree with each other: A /);
  // the same month holds a distribution day: which side is right cannot be told → every class
  const r2 = crossClassFailures(one.months, one.daily, CLASS_CHECKS, new Map([[bad, "J 2025-02-27 return 0.10% vs NAV ratio -1.20%"]]));
  assert.deepEqual([...r2.fundMonths.keys()], [bad]);
  assert.match(r2.fundMonths.get(bad)!, /distribution \/ price-adjustment day/);
  assert.equal(r2.fails.size, 0);
  // two classes breaching (A up, F down): every class
  const two = four((d) => (d === bad ? 0.06 : 0), (d) => (d === bad ? -0.02 : 0));
  const r3 = crossClassFailures(two.months, two.daily, CLASS_CHECKS);
  assert.deepEqual([...r3.fundMonths.keys()], [bad]);
  assert.match(r3.fundMonths.get(bad)!, /no consistent majority/);
  // a fund with two classes only: no month has the 3 classes a fit needs, so each class is judged alone against the
  // median of two (their mean): both deviate, both are withheld — nobody to side with
  const pairS = (dlt: number) => Object.fromEntries(MONTHS.map((d, i) => [d, fundPath(i) + (d === bad ? dlt : 0)]));
  const pair = panel({ F: pairS(0), H: pairS(0.012) });
  assert.deepEqual([...crossClassFailures(pair.months, pair.daily, CLASS_CHECKS).fails.keys()].sort(), ["F", "H"]);
  // classes too young for a fit (< 12 months) are only ever withheld themselves, never the fund
  const young = panel({ F: { "2025-03-31": 0.01 }, H: { "2025-03-31": 0.02 } });
  const ry = crossClassFailures(young.months, young.daily, CLASS_CHECKS);
  assert.equal(ry.fundMonths.size, 0);
  assert.deepEqual([...ry.fails.keys()].sort(), ["F", "H"]);
  assert.match(ry.fails.get("H")!.get("2025-03-31")!, /\(no fitted spread\)/);
  // within the residual tolerance (0.40 %): nothing
  const ok = panel({ F: { "2025-03-31": 0.01 }, H: { "2025-03-31": 0.0135 }, J: { "2025-03-31": 0.0101 } });
  assert.equal(crossClassFailures(ok.months, ok.daily, CLASS_CHECKS).fundMonths.size, 0);
});

test("cross-class: a December distribution-day error where the majority is wrong is withheld for every class (adjustment day)", () => {
  const dec = MONTHS[11];
  const series = (shift: number, err: number) => Object.fromEntries(MONTHS.map((d, i) => [d, fundPath(i) + shift + (d === dec ? err : 0)]));
  // three classes book the distribution day wrongly (−1.4 %), the fourth does not
  const p = panel({ F: series(-0.0002, -0.014), H: series(0, -0.014), J: series(-0.0001, -0.0145), I: series(0.0001, 0) });
  const out = crossClassFailures(p.months, p.daily, CLASS_CHECKS, new Map([[dec, "F 2024-12-31 return -1.28% vs NAV ratio -2.10%"]]));
  assert.deepEqual([...out.fundMonths.keys()], [dec]);
  assert.equal(out.fails.size, 0, "never only the minority class");
});

test("B1: an error in the fund's strongest month cannot bend its own fit (leave-one-out, Theil–Sen)", () => {
  // 14 ordinary months + one +2.5 % month; class X runs 0.05 % below the others and books +1.00 % too much that month only
  const ms = MONTHS.slice(0, 15);
  const strong = ms[14];
  const base = (i: number): number => (ms[i] === strong ? 0.025 : 0.002 + 0.004 * Math.sin(i * 1.3));
  const mk = (f: (b: number, d: string) => number) => Object.fromEntries(ms.map((d, i) => [d, f(base(i), d)]));
  const p = panel({ F: mk((b) => b), J: mk((b) => b + 0.0001), I: mk((b) => b - 0.0001), X: mk((b, d) => b - 0.0005 + (d === strong ? 0.01 : 0)) });
  const out = crossClassFailures(p.months, p.daily, CLASS_CHECKS);
  assert.deepEqual([...out.fails.keys()], ["X"]);
  assert.match(out.fails.get("X")!.get(strong)!, /X 3\.45% \(expected 2\.4[56]% from the other classes' reference/);
  assert.equal(out.fundMonths.size, 0);
  // the full-sample fit itself stays near the true spread (robust estimator)
  assert.ok(Math.abs(out.fits.X.bUp - 1) < 0.05 && Math.abs(out.fits.X.bDown - 1) < 0.05 && Math.abs(out.fits.X.a + 0.0005) < 0.0002, JSON.stringify(out.fits.X));
});

test("adjustment days: stored return vs NAV ratio beyond 0.10 % (a distribution), not otherwise", () => {
  const rs: DailyRow[] = [
    { date: "2024-12-27", nav_per_share_cad: 10, net_daily_return: 0.001 },
    { date: "2024-12-30", nav_per_share_cad: 10.01, net_daily_return: 0.001 },
    // a 0.25 distribution: NAV drops 2.5 %, the distribution-aware return is +0.1 %
    { date: "2024-12-31", nav_per_share_cad: 9.77, net_daily_return: 0.001 },
    { date: "2025-01-02", nav_per_share_cad: 9.7798, net_daily_return: 0.001 },
  ];
  const out = adjustmentDays(rs, "2024-12-27", CLASS_CHECKS.adjustmentMin);
  assert.deepEqual([...out.keys()], ["2024-12-31"]);
  assert.match(out.get("2024-12-31")!, /return 0\.10% vs NAV ratio -2\.40%/);
});

test("cross-class: partial months stay outside the median and the fit; compared over their own days, withheld alone", () => {
  const days = ["2025-03-03", "2025-03-04"];
  const d = (r: number): Map<string, number> => new Map(days.map((x) => [x, r]));
  const m = (r: number) => [{ month: "2025-03-31", r: (1 + r) ** 2 - 1, days, partial: false }];
  const late = { month: "2025-03-31", r: 0.02, days: ["2025-03-04"], partial: true };
  const part = crossClassFailures({ F: m(0.003), J: m(0.0031), N: [late] }, { F: d(0.003), J: d(0.0031), N: new Map([["2025-03-04", 0.02]]) }, CLASS_CHECKS);
  assert.equal(part.fundMonths.size, 0, "the complete months agree");
  assert.deepEqual([...part.fails.keys()], ["N"]);
  assert.match(part.fails.get("N")!.get("2025-03-31")!, /first \(partial\) month deviates/);
  // a class alone over its days cannot be compared: unchecked (recorded for the admin)
  const alone = crossClassFailures({ F: m(0.01) }, { F: d(0.01) }, CLASS_CHECKS);
  assert.deepEqual(alone.unchecked, [{ fundserv: "F", month: "2025-03-31" }]);
});

test("computeFundClasses: one class off in a month without an adjustment day → that class only; with a distribution day → every class", () => {
  const days = tradingDays("2023-01-03", "2024-06-28");
  const inputs = (distOnA: boolean) => [
    // A pays a distribution on 2024-04-22: NAV −2 %, distribution-aware return unchanged (when distOnA)
    { fundserv: "A", display: "A", currency: "CAD", rows: rows(days, () => 0.0005).map((r, i, all) => {
      if (!distOnA) return r;
      const k = all.findIndex((x) => x.date === "2024-04-22");
      return i >= k ? { ...r, nav_per_share_cad: (r.nav_per_share_cad as number) * 0.98 } : r;
    }) },
    { fundserv: "B", display: "B", currency: "CAD", rows: rows(days, () => 0.00049) },
    { fundserv: "D", display: "D", currency: "CAD", rows: rows(days, () => 0.00051) },
    // C books a 1.2 % adjustment on one April day that the others do not have
    { fundserv: "C", display: "C", currency: "CAD", rows: rows(days, (x) => (x === "2024-04-15" ? 0.0125 : 0.0005)) },
  ];
  const opts = { endMonth: "2024-05-31", cfg: CLASS_CHECKS, requestedFrom: "2019-01-01" };
  const alone = computeFundClasses(inputs(false), opts);
  assert.deepEqual(alone.fundMonths, []);
  for (const c of alone.classes) {
    const apr = c.months.find((x) => x.month === "2024-04-30")!;
    if (c.fundserv === "C") assert.match(apr.reason!, /deviates from the fund's other classes, which agree with each other: C/);
    else assert.equal(apr.reason, null, c.fundserv);
  }
  const all = computeFundClasses(inputs(true), opts);
  assert.deepEqual(all.fundMonths.map((x) => x.month), ["2024-04-30"]);
  assert.match(all.fundMonths[0].reason, /distribution \/ price-adjustment day \(A 2024-04-22 /);
  for (const c of all.classes) {
    assert.equal(c.months.find((x) => x.month === "2024-04-30")!.r, null, c.fundserv);
    assert.ok(c.months.filter((x) => x.month !== "2024-04-30").every((x) => x.r !== null), c.fundserv);
  }
});

test("computeFundClasses: non-CAD class without figures; withheld months keep their place with the reason", () => {
  const days = tradingDays("2024-01-02", "2024-06-28");
  const base = (d: string): number => (d === "2024-03-15" ? 0.03 : d === "2024-03-18" ? -0.0295 : 0.0005);
  const res = computeFundClasses([
    { fundserv: "A", display: "A", currency: "CAD", rows: rows(days, base) },
    { fundserv: "B", display: "B", currency: "CAD", rows: rows(days, (d) => base(d) - 0.00001) },
    { fundserv: "U", display: "U USD", currency: "USD", rows: rows(days, base, 10, "USD") },
    { fundserv: "X", display: "X", currency: "CAD", rows: null, error: "HTTP 500" },
  ], { endMonth: "2024-05-31", cfg: CLASS_CHECKS, requestedFrom: "2019-01-01" });
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

test("M1: a print on the newest month's last day reversed on the next valuation day is caught; without a next day the newest month waits", () => {
  const days = tradingDays("2023-01-03", "2024-06-07");
  const spike = (d: string): number => (d === "2024-05-31" ? 0.03 : d === "2024-06-03" ? -0.0295 : 0.0005);
  const opts = { endMonth: "2024-05-31", cfg: CLASS_CHECKS, requestedFrom: "2019-01-01" };
  const res = computeFundClasses([
    { fundserv: "A", display: "A", currency: "CAD", rows: rows(days, spike) },
    { fundserv: "B", display: "B", currency: "CAD", rows: rows(days, (d) => spike(d) - 0.00001) },
  ], opts);
  assert.deepEqual(res.fundMonths.map((x) => x.month), ["2024-05-31"]);
  assert.match(res.fundMonths[0].reason, /bad valuation print: A 2024-05-31 3\.00% then 2024-06-03 -2\.95%/);
  // rows end on the newest month's last day: that month is held for every class until a later valuation day is checked
  const upTo = tradingDays("2023-01-03", "2024-05-31");
  const held = computeFundClasses([
    { fundserv: "A", display: "A", currency: "CAD", rows: rows(upTo) },
    { fundserv: "B", display: "B", currency: "CAD", rows: rows(upTo, () => 0.00099) },
  ], opts);
  for (const c of held.classes) {
    const may = c.months.find((m) => m.month === "2024-05-31")!;
    assert.equal(may.r, null);
    assert.match(may.reason!, /newest month held: no valuation day after its last day/);
    assert.ok(c.months.filter((m) => m.month < "2024-05-31").every((m) => m.r !== null));
  }
});

test("M3: the cut-over month's NAV bridge must equal the class's compounded daily returns", async () => {
  const { synthClassRows } = await import("../../fixtures/pipeline/nav-history.ts");
  const monthly: Record<string, number> = {};
  for (let m = "2025-01-31"; m <= "2026-08-31"; m = addMonths(m, 1)) monthly[m] = 0.004;
  const good = synthClassRows({ fundserv: "LDM990", monthly, navStart: "2025-01-02", end: "2026-09-28", nav0: 10, seed: 7 });
  const ok = monthsFromInception(good, "2025-01-02", "2026-08-31");
  const jul = ok.find((m) => m.month === "2026-07-31")!;
  assert.equal(jul.source, "bridge");
  assert.ok(jul.r !== null && Math.abs(jul.r - 0.004) < 1e-6, String(jul.r));
  // every CIBC NAV per unit 1 % higher (a unit-value change the stored returns do not carry) and no seam link on the first
  // Apex day: the NAV bridge says ≈ −1 %, the daily returns +0.4 % → the month is withheld
  const firstApex = good.find((r) => r.source === "apex")!.date;
  const bad = good.map((r) => (r.source === "cibc" ? { ...r, nav_per_share_cad: (r.nav_per_share_cad as number) * 1.01 } : r.date === firstApex ? { ...r, return_start_date: null } : r));
  const m = monthsFromInception(bad, "2025-01-02", "2026-08-31").find((x) => x.month === "2026-07-31")!;
  assert.equal(m.r, null);
  assert.match(m.issue!, /NAV bridge .* vs compounded daily returns/);
});

test("leave-class-out reference: the class with the injected error is the one withheld, never the correct fee-free class", () => {
  // F, A, J track the fund with their fees (slope 1); I is fee-free (slope 1.2): a reference that includes the class
  // under test would make I look like the outlier when another class is wrong
  const n = 24;
  const path = MONTHS.slice(0, n).map((_, i) => fundPath(i));
  const strongest = MONTHS[path.indexOf(Math.max(...path))];
  const weakest = MONTHS[path.indexOf(Math.min(...path))];
  const calm = MONTHS[path.map((x, i) => [Math.abs(x - 0.01), i]).sort((a, b) => a[0] - b[0])[0][1]];
  const cls: Record<string, (m: number) => number> = { F: (m) => m - 0.0002, A: (m) => m - 0.0009, J: (m) => m - 0.0001, I: (m) => 1.2 * m + 0.0001 };
  const run = (names: string[], bad: string, month: string | string[], err: number) => {
    const hit = new Set([month].flat());
    const p = panel(Object.fromEntries(names.map((c) => [c, Object.fromEntries(MONTHS.slice(0, n).map((d, i) => [d, cls[c](path[i]) + (c === bad && hit.has(d) ? err : 0)]))])));
    return crossClassFailures(p.months, p.daily, CLASS_CHECKS);
  };
  const cases: [string[], string, string, number, string][] = [
    [["F", "A", "I"], "F", weakest, -0.006, "F −0.6 % in the weakest month (3 classes)"],
    [["F", "A", "I", "J"], "F", strongest, 0.008, "F +0.8 % in the strongest month"],
    [["F", "A", "I", "J"], "J", strongest, 0.008, "J +0.8 % in the strongest month"],
    [["F", "A", "I", "J"], "F", strongest, 0.006, "F +0.6 % in the strongest month"],
    [["F", "A", "I", "J"], "A", strongest, 0.006, "A +0.6 % in the strongest month"],
    [["F", "A", "I", "J"], "J", strongest, 0.006, "J +0.6 % in the strongest month"],
    [["F", "A", "I", "J"], "F", calm, -0.006, "F −0.6 % in a calm month"],
    [["F", "A", "I", "J"], "A", calm, -0.006, "A −0.6 % in a calm month"],
    [["F", "A", "I", "J"], "I", strongest, -0.006, "I −0.6 % in the strongest month"],
    [["F", "A", "I", "J"], "I", weakest, 0.006, "I +0.6 % in the weakest month"],
    [["F", "A", "I", "J"], "I", calm, 0.006, "I +0.6 % in a calm month"],
    [["F", "A", "I", "J"], "J", weakest, -0.006, "J −0.6 % in the weakest month"],
    [["F", "A", "I"], "I", strongest, 0.008, "I +0.8 % in the strongest month (3 classes)"],
  ];
  for (const [names, bad, month, err, label] of cases) {
    const out = run(names, bad, month, err);
    assert.equal(out.fundMonths.size, 0, label);
    assert.deepEqual([...out.fails.keys()], [bad], `${label}: ${JSON.stringify([...out.fails].map(([k, v]) => [k, [...v.keys()]]))}`);
    assert.deepEqual([...out.fails.get(bad)!.keys()], [month], label);
  }
  // the same error in the two strongest months: both months of that class, nothing else
  const top2 = MONTHS.slice(0, n).map((d, i) => [path[i], d] as const).sort((a, b) => b[0] - a[0]).slice(0, 2).map(([, d]) => d);
  for (const bad of ["F", "I"]) {
    const two = run(["F", "A", "I", "J"], bad, top2, 0.006);
    assert.equal(two.fundMonths.size, 0, `${bad} twice`);
    assert.deepEqual([...two.fails.keys()], [bad], `${bad} twice`);
    assert.deepEqual([...two.fails.get(bad)!.keys()].sort(), [...top2].sort(), `${bad} twice`);
  }
  // no error: nothing withheld (the fee-free class's spread is expected)
  assert.equal(run(["F", "A", "I", "J"], "F", calm, 0).fails.size, 0);
  // a young class (no fit) with an error is withheld alone and never moves the others' reference
  const p = panel({
    ...Object.fromEntries(["F", "A", "I", "J"].map((c) => [c, Object.fromEntries(MONTHS.slice(0, n).map((d, i) => [d, cls[c](path[i])]))])),
    Y: { [strongest]: cls.F(path[MONTHS.indexOf(strongest)]) + 0.02 },
  });
  const y = crossClassFailures(p.months, p.daily, CLASS_CHECKS);
  assert.equal(y.fundMonths.size, 0);
  assert.deepEqual([...y.fails.keys()], ["Y"]);
});

test("Multi-Strategy-like fund: a 20 % performance fee in up months only is an expected spread; ±0.6 % errors are still caught", () => {
  // SYNTHETIC: 30 months of a gross path (−2.6 % … +7.3 %, 11 down months); I has no performance fee, F / J / A pay 20 % of
  // every up month; each class has its own management-fee spread and a little noise. A single straight line cannot hold
  // I's spread (≈ 25 % of an up month, ≈ 0 in a down month): it missed I's errors in the strongest and weakest months.
  const n = 30;
  const ms = Array.from({ length: n }, (_, i) => addMonths("2023-01-31", i));
  const gross = ms.map((_, i) => 0.006 + 0.032 * Math.sin(i * 2.3) + (i % 7 === 3 ? 0.035 : 0));
  const noise = (i: number, k: number): number => 0.0002 * Math.sin(i * 7.1 + k * 3.3);
  const net = (g: number, perfFee: boolean): number => (perfFee && g > 0 ? 0.8 * g : g);
  const cls: Record<string, (g: number, i: number) => number> = {
    I: (g, i) => net(g, false) - 0.0006 + noise(i, 0),
    F: (g, i) => net(g, true) - 0.0008 + noise(i, 1),
    J: (g, i) => net(g, true) - 0.0007 + noise(i, 2),
    A: (g, i) => net(g, true) - 0.0016 + noise(i, 3),
  };
  const run = (bad: string | null, month: string | null, err: number) => {
    const p = panel(Object.fromEntries(Object.keys(cls).map((c) => [c, Object.fromEntries(ms.map((d, i) => [d, cls[c](gross[i], i) + (c === bad && d === month ? err : 0)]))])));
    return crossClassFailures(p.months, p.daily, CLASS_CHECKS);
  };
  const clean = run(null, null, 0);
  assert.equal(clean.fundMonths.size, 0);
  assert.equal(clean.fails.size, 0, JSON.stringify([...clean.fails].map(([k, v]) => [k, [...v.keys()]])));
  assert.ok(clean.fits.I.piecewise && Math.abs(clean.fits.I.bUp - 1.25) < 0.03 && Math.abs(clean.fits.I.bDown - 1) < 0.03, JSON.stringify(clean.fits.I));
  for (const c of ["F", "J", "A"]) assert.ok(Math.abs(clean.fits[c].bUp - 1) < 0.03 && Math.abs(clean.fits[c].bDown - 1) < 0.03, `${c} ${JSON.stringify(clean.fits[c])}`);
  const at = (x: number): string => ms[gross.indexOf(x)];
  const months: [string, string][] = [
    ["strongest", at(Math.max(...gross))],
    ["weakest", at(Math.min(...gross))],
    ["calm", ms[gross.map((g, i) => [Math.abs(g - 0.003), i]).sort((a, b) => a[0] - b[0])[0][1]]],
  ];
  for (const c of Object.keys(cls)) for (const [label, month] of months) for (const err of [0.006, -0.006]) {
    const out = run(c, month, err);
    const what = `${c} ${err > 0 ? "+" : "−"}0.6 % in the ${label} month: ${JSON.stringify([...out.fails].map(([k, v]) => [k, [...v.keys()]]))}`;
    assert.equal(out.fundMonths.size, 0, what);
    assert.deepEqual([...out.fails.keys()], [c], what);
    assert.deepEqual([...out.fails.get(c)!.keys()], [month], what);
  }
});

test("a class without a fit, next to fitted classes, is never checked at slope 1: its months wait for a fit of its own", () => {
  // I (fee-free, slope 1.2) has only 11 complete months: at slope 1 its legitimate spread could hide an error, so every
  // month of I is withheld (alone) until it has a fit; the fitted classes are untouched
  const path = MONTHS.map((_, i) => fundPath(i));
  const fit = (c: string, m: number): number => (c === "F" ? m - 0.0002 : c === "A" ? m - 0.0009 : m - 0.0001);
  const recent = MONTHS.slice(-11);
  const strongIdx = MONTHS.indexOf(recent.reduce((a, b) => (path[MONTHS.indexOf(b)] > path[MONTHS.indexOf(a)] ? b : a)));
  const p = panel({
    ...Object.fromEntries(["F", "A", "J"].map((c) => [c, Object.fromEntries(MONTHS.map((d, i) => [d, fit(c, path[i])]))])),
    I: Object.fromEntries(recent.map((d) => { const i = MONTHS.indexOf(d); return [d, 1.2 * path[i] + 0.0001 + (i === strongIdx ? -0.006 : 0)]; })),
  });
  const out = crossClassFailures(p.months, p.daily, CLASS_CHECKS);
  assert.equal(out.fundMonths.size, 0);
  assert.deepEqual([...out.fails.keys()], ["I"]);
  assert.deepEqual([...out.fails.get("I")!.keys()].sort(), [...recent].sort());
  // once I has a fit (all 24 months), its correct months pass
  const q = panel({
    ...Object.fromEntries(["F", "A", "J"].map((c) => [c, Object.fromEntries(MONTHS.map((d, i) => [d, fit(c, path[i])]))])),
    I: Object.fromEntries(MONTHS.map((d, i) => [d, 1.2 * path[i] + 0.0001])),
  });
  assert.equal(crossClassFailures(q.months, q.daily, CLASS_CHECKS).fails.size, 0);
});

test("CIBC holiday filler rows (NAV carried over, no return, market holiday) are not valuation days; a moving holiday row stays", async () => {
  const { dropHolidayFiller, cibcMonth } = await import("../../../src/lib/pipeline/daily-chain.ts");
  const { tradingDays } = await import("../../../src/lib/pipeline/market-calendar.ts");
  // September 2024: Labour Day (2024-09-02) is a market holiday
  const days = tradingDays("2024-08-30", "2024-09-30");
  let nav = 10;
  const base = days.map((d) => { nav *= 1.001; return { date: d, source: "cibc", currency: "CAD", net_return_method: "legacy_stored", nav_per_share_cad: nav, net_daily_return: 0.001 }; });
  const filler = { date: "2024-09-02", source: "cibc", currency: "CAD", net_return_method: "legacy_stored", nav_per_share_cad: base[0].nav_per_share_cad, net_daily_return: null };
  const rows = [...base, filler];
  assert.equal(dropHolidayFiller(rows).some((r) => r.date === "2024-09-02"), false);
  const m = cibcMonth(rows, "2024-09-30", "2024-01-01");
  assert.equal(m.status, "ready", m.issue ?? "");
  assert.ok(m.r !== null && Math.abs(m.r - (1.001 ** (days.length - 1) - 1)) < 1e-12, String(m.r));
  // the same holiday row with a moved NAV stays and withholds the month (its move would otherwise be lost)
  const moved = [...base, { ...filler, nav_per_share_cad: (base[0].nav_per_share_cad as number) * 1.01 }];
  assert.equal(dropHolidayFiller(moved).some((r) => r.date === "2024-09-02"), true);
  assert.equal(cibcMonth(moved, "2024-09-30", "2024-01-01").r, null);
  // a filler next to a second row on the same holiday: both stay, the duplicate check withholds the month
  const dup = [...rows, { ...filler, nav_per_share_cad: 10.1, net_daily_return: 0.01 }];
  assert.equal(dropHolidayFiller(dup).filter((r) => r.date === "2024-09-02").length, 2);
  assert.equal(cibcMonth(dup, "2024-09-30", "2024-01-01").r, null);
  // no NAV on the holiday row: nothing shows it was carried over, it stays (and withholds the month)
  const noNav = [...base, { ...filler, nav_per_share_cad: null }];
  assert.equal(dropHolidayFiller(noNav).some((r) => r.date === "2024-09-02"), true);
  assert.equal(cibcMonth(noNav, "2024-09-30", "2024-01-01").r, null);
  // an Apex row on a holiday is never dropped
  assert.equal(dropHolidayFiller([...base, { ...filler, source: "apex" }]).some((r) => r.date === "2024-09-02"), true);
});
