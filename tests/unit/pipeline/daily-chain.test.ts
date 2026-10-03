import { test } from "node:test";
import assert from "node:assert/strict";
import { apexMonth, bridgeMonth, caMarketHolidays, cibcMonth, classMonths, classStart, firstComputableMonth, isTradingDay, priorTradingDay, tradingDays, type DailyRow } from "../../../src/lib/pipeline/daily-chain.ts";
import { synthClassRows, monthsOf } from "../../fixtures/pipeline/nav-history.ts";
import type { Series } from "../../../src/lib/pipeline/metrics.ts";

const close = (a: number | null | undefined, b: number, eps = 1e-12): void => {
  assert.ok(typeof a === "number", `expected ${b}, got ${a}`);
  assert.ok(Math.abs(a - b) < eps, `expected ${b}, got ${a}`);
};

test("TSX holidays (port of the dataplatform market calendar)", () => {
  assert.deepEqual([...caMarketHolidays(2026)].sort(), [
    "2026-01-01", "2026-02-16", "2026-04-03", "2026-05-18", "2026-07-01", "2026-08-03", "2026-09-07", "2026-10-12", "2026-12-25", "2026-12-28",
  ]);
  // Christmas on a Saturday: Monday 27 and Tuesday 28; New Year on a Saturday observed Monday 3
  const h21 = caMarketHolidays(2021);
  assert.ok(h21.has("2021-12-27") && h21.has("2021-12-28") && !h21.has("2021-12-24"));
  assert.ok(caMarketHolidays(2022).has("2022-01-03"));
  // Victoria Day: the Monday on or before May 24 (2021: May 24 is a Monday)
  assert.ok(h21.has("2021-05-24"));
  assert.ok(caMarketHolidays(2019).has("2019-04-19")); // Good Friday 2019
  assert.equal(isTradingDay("2026-07-01"), false);
  assert.equal(isTradingDay("2026-07-02"), true);
  assert.equal(isTradingDay("2026-07-04"), false); // Saturday
  assert.deepEqual(tradingDays("2026-07-01", "2026-07-07"), ["2026-07-02", "2026-07-03", "2026-07-06", "2026-07-07"]);
  assert.equal(priorTradingDay("2026-08-01"), "2026-07-31");
  assert.equal(priorTradingDay("2026-07-06"), "2026-07-03");
});

const months: Series = {};
for (const [i, m] of monthsOf("2025-01-31", "2026-08-31").entries()) months[m] = 0.001 + 0.002 * Math.sin(i);

const rows = (extra: Partial<Parameters<typeof synthClassRows>[0]> = {}): DailyRow[] =>
  synthClassRows({ fundserv: "LDM901", monthly: months, navStart: "2025-01-02", end: "2026-09-28", nav0: 10, seed: 3, dist: (m) => (m.endsWith("-31") ? 0.03 : 0), ...extra });

test("Apex month: compounds the distribution-aware chain exactly; any gap or other method is unavailable", () => {
  const rs = rows();
  const aug = apexMonth(rs, "2026-08-31");
  assert.equal(aug.status, "ready");
  close(aug.r, months["2026-08-31"]);
  // a missing valuation day
  const missing = rs.filter((r) => r.date !== "2026-08-12");
  assert.match(apexMonth(missing, "2026-08-31").issue!, /Incomplete Apex valuation-day coverage/);
  // a price-ratio row (distribution-blind) is never compounded
  const priceRatio = rs.map((r) => (r.date === "2026-08-20" ? { ...r, net_return_method: "nav_price_ratio" } : r));
  assert.match(apexMonth(priceRatio, "2026-08-31").issue!, /distribution-aware/);
  // a broken return_start_date chain
  const broken = rs.map((r) => (r.date === "2026-08-20" ? { ...r, return_start_date: "2026-08-18" } : r));
  assert.match(apexMonth(broken, "2026-08-31").issue!, /continuous/);
  // duplicates
  const dup = [...rs, rs.find((r) => r.date === "2026-08-20")!];
  assert.equal(apexMonth(dup, "2026-08-31").status, "conflict");
  // a USD-like row
  const usd = rs.map((r) => (r.date === "2026-08-20" ? { ...r, currency: "USD" } : r));
  assert.equal(apexMonth(usd, "2026-08-31").status, "unavailable");
});

test("CIBC month: stored daily returns compounded over a complete month only", () => {
  const rs = rows();
  const m = cibcMonth(rs, "2026-03-31", "2025-01-02");
  assert.equal(m.status, "ready");
  close(m.r, months["2026-03-31"]);
  // a distribution month: the chain (total return) is above the NAV ratio by about distribution / NAV
  assert.ok((m.navGap ?? 0) > 0.002, `navGap ${m.navGap}`);
  const apr = cibcMonth(rs, "2026-04-30", "2025-01-02");
  close(apr.navGap ?? NaN, 0, 1e-9); // no distribution at an April month-end in this synthetic set
  assert.match(cibcMonth(rs.filter((r) => r.date !== "2026-03-17"), "2026-03-31", "2025-01-02").issue!, /missing 2026-03-17/);
  assert.match(cibcMonth(rs.map((r) => (r.date === "2026-03-17" ? { ...r, net_return_method: "nav_price_ratio" } : r)), "2026-03-31", "2025-01-02").issue!, /not the stored CIBC net return/);
  assert.match(cibcMonth(rs, "2026-03-31", "2026-03-05").issue!, /before the class's own data start/);
});

test("cut-over month: NAV bridge equals the chain when nothing is distributed inside the month", () => {
  const rs = rows();
  const july = bridgeMonth(rs, "2026-07-31");
  assert.equal(july.status, "ready", july.issue ?? "");
  close(july.r, months["2026-07-31"], 1e-9);
  // a distribution inside the Apex part of the month: the Apex chain drifts from its NAV per unit
  const withDist = rs.map((r) => (r.date >= "2026-07-20" && r.date <= "2026-07-31" ? { ...r, nav_per_share_cad: (r.nav_per_share_cad as number) - 0.05 } : r));
  assert.match(bridgeMonth(withDist, "2026-07-31").issue!, /Apex daily returns disagree/);
  // a CIBC day missing before the first Apex day
  assert.match(bridgeMonth(rs.filter((r) => r.date !== "2026-07-02"), "2026-07-31").issue!, /Incomplete CIBC valuation-day coverage/);
  // no CIBC June month-end
  assert.match(bridgeMonth(rs.filter((r) => r.date.slice(0, 7) !== "2026-06"), "2026-07-31").issue!, /No CIBC month-end NAV per unit/);
  // a broken Apex chain after the cut-over
  assert.match(bridgeMonth(rs.map((r) => (r.date === "2026-07-15" ? { ...r, return_start_date: "2026-07-13" } : r)), "2026-07-31").issue!, /chain is unavailable after the cut-over/);
});

test("classMonths: rows of another strategy before navStart are ignored; first listed month is the first complete one", () => {
  const rs = synthClassRows({ fundserv: "LDM902", monthly: months, navStart: "2025-03-05", end: "2026-09-28", nav0: 10, seed: 5, priorFrom: "2024-06-03" });
  const out = classMonths(rs, { navStart: "2025-03-05", endMonth: "2026-08-31" });
  assert.equal(out[0].month, "2025-04-30");
  assert.ok(out.every((m) => m.status === "ready"), out.filter((m) => m.status !== "ready").map((m) => `${m.month} ${m.issue}`).join("; "));
  for (const m of out) close(m.r, months[m.month], 1e-9);
  assert.deepEqual(out.map((m) => m.source).filter((s, i, a) => a.indexOf(s) === i), ["cibc", "bridge", "apex"]);
  // the open month (September) is never computed
  assert.equal(out.at(-1)!.month, "2026-08-31");
  // a class starting in the Apex era (after the first valuation day of July): its first computable month is August
  const late = synthClassRows({ fundserv: "LDM903", monthly: months, navStart: "2026-07-06", end: "2026-09-28", nav0: 10, seed: 6 });
  const lm = classMonths(late, { navStart: "2026-07-06", endMonth: "2026-08-31" });
  assert.deepEqual(lm.map((m) => [m.month, m.status]), [["2026-08-31", "ready"]]);
});

test("class start: the class's own first row on or after the fund's data start; first computable month", () => {
  // a class launched after the fund's data start: its months start at its own first valuation, not at the fund's start
  const rs = synthClassRows({ fundserv: "LDM904", monthly: months, navStart: "2025-06-02", end: "2026-09-28", nav0: 10, seed: 7 });
  assert.equal(classStart(rs, "2025-01-02"), "2025-06-02");
  const out = classMonths(rs, { navStart: "2025-01-02", endMonth: "2026-08-31" });
  assert.equal(out[0].month, "2025-06-30");
  assert.ok(out.every((m) => m.status === "ready"));
  assert.equal(classStart([], "2025-01-02"), null);
  assert.deepEqual(classMonths([], { navStart: "2025-01-02", endMonth: "2026-08-31" }), []);
  // 2023-07-01 is a Saturday (and Canada Day): July 2023 starts on Monday 3, so a start on the 1st keeps July
  assert.equal(firstComputableMonth("2023-07-01"), "2023-07-31");
  assert.equal(firstComputableMonth("2023-07-05"), "2023-08-31");
});

test("CAD only: a CIBC row in another currency makes the CIBC month and the bridge unavailable (m7)", () => {
  const rs = rows();
  const usd = rs.map((r) => (r.date === "2026-03-17" ? { ...r, currency: "USD" } : r));
  assert.match(cibcMonth(usd, "2026-03-31", "2025-01-02").issue!, /2026-03-17: currency USD \(CAD expected\)/);
  const julyUsd = rs.map((r) => (r.date === "2026-07-02" ? { ...r, currency: "USD" } : r));
  assert.match(bridgeMonth(julyUsd, "2026-07-31").issue!, /not in CAD/);
  const juneUsd = rs.map((r) => (r.date === "2026-06-30" ? { ...r, currency: "USD" } : r));
  assert.match(bridgeMonth(juneUsd, "2026-07-31").issue!, /CIBC month-end NAV per unit of 2026-06-30 is not in CAD/);
});

test("cut-over seam (M2): the first Apex return must carry the last CIBC NAV per unit to the first Apex NAV per unit", () => {
  const rs = rows();
  const firstApex = rs.find((r) => r.source === "apex")!;
  const lastCibc = rs.filter((r) => r.source === "cibc" && r.date < firstApex.date).pop()!;
  assert.equal(firstApex.return_start_date, lastCibc.date, "the synthetic chain starts on the last CIBC day");
  assert.equal(bridgeMonth(rs, "2026-07-31").status, "ready");
  // the Apex unit value re-based at the switch (every Apex NAV × 1.01, daily returns unchanged): the seam breaks
  const rebased = rs.map((r) => (r.source === "apex" ? { ...r, nav_per_share_cad: (r.nav_per_share_cad as number) * 1.01 } : r));
  assert.match(bridgeMonth(rebased, "2026-07-31").issue!, /seam discontinuity: CIBC NAV per unit of 2026-07-0\d × \(1 \+ Apex return of 2026-07-0\d\)/);
  // within 1 bp: accepted
  const tiny = rs.map((r) => (r.source === "apex" ? { ...r, nav_per_share_cad: (r.nav_per_share_cad as number) * 1.00005 } : r));
  assert.equal(bridgeMonth(tiny, "2026-07-31").status, "ready");
  // the first Apex return starting elsewhere: no seam evidence, the other bridge gates decide
  const other = rs.map((r) => (r.date === firstApex.date ? { ...r, return_start_date: "2026-06-30" } : r));
  assert.equal(bridgeMonth(other, "2026-07-31").status, "ready");
});
