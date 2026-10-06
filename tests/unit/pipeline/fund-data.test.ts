/**
 * Daily portfolio and per-series distributions: the PR #621 contract parsers and fetchers (kept for older snapshots and
 * a future endpoint), selection thresholds and fallback, month-end cross-check, validation gates, and the build against
 * the synthetic fixtures, where the daily book is computed by the website from the Apex holdings and the instrument
 * master (fund-portfolio.ts) and distributions are shown only when a payload is supplied (no endpoint on the
 * dataplatform main branch). Expected values are literals read from the fixture files.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDistributions, parseFundPortfolio } from "../../../src/lib/pipeline/sources/contracts.ts";
import { dpClient, fetchDistributions, fetchFundPortfolio } from "../../../src/lib/pipeline/sources/dataplatform.ts";
import { crossCheckPortfolio, monthEndBook, orderRows, ratingRank, selectPortfolio, termRank } from "../../../src/lib/pipeline/portfolio.ts";
import { classDistribution, frequency, selectDistributions } from "../../../src/lib/pipeline/distributions.ts";
import { DISTRIBUTIONS } from "../../../src/lib/pipeline/config.ts";
import { checkDistributions, checkPortfolio, distributionProblem, trailingProblem, validateSite, yearBefore } from "../../../src/lib/pipeline/validate.ts";
import { buildSiteData, computedBook as computedBookOf, type BuildResult } from "../../../src/lib/pipeline/build/index.ts";
import { fetchAll } from "../../../src/lib/pipeline/sources/index.ts";
import type { ClassDistributions, DpShort, FundPortfolio, RawPayloads, SourceResult } from "../../../src/lib/pipeline/raw.ts";
import type { ClassDistribution, FundData, SiteData } from "../../../src/lib/data/types.ts";
import { fixtureEnv, json, loadFixture, mockFetch, type Route } from "../../fixtures/pipeline/mock-fetch.ts";
import { assertConfigUntouched, once } from "../../fixtures/pipeline/memo.ts";

const NOW = new Date("2026-09-29T14:00:00Z");
const client = (...routes: Route[]) => dpClient(mockFetch(...routes).fetch, { DATAPLATFORM_URL: "http://dataplatform.test", PIPELINE_RETRY_BASE_MS: "0" })!;
const book = (over: Record<string, unknown> = {}): FundPortfolio => parseFundPortfolio({ ...(loadFixture("dataplatform/portfolio_SEST.json") as object), ...over })!;
const ok = <T>(data: T): SourceResult<T> => ({ ok: true, data });
const O = { base: "funds.monthly-income", short: "SEST", now: NOW, greenBonds: false };
/** the fixtures fetched, with distributions supplied ("ok": the PR #621 contract fixtures; "down": a failed read) */
async function rawWith(opts: { routes?: Route[]; now?: Date; dist?: "ok" | "down" } = {}): Promise<RawPayloads> {
  const raw = await fetchAll({ fetchImpl: mockFetch(...(opts.routes ?? [])).fetch, now: opts.now ?? NOW, env: fixtureEnv() });
  if (opts.dist) {
    raw.distributions = {};
    for (const s of ["SEST", "SEB", "Multistrat"] as DpShort[]) {
      raw.distributions[s] = opts.dist === "ok" ? ok(parseDistributions({ ...(loadFixture(`dataplatform/distributions_${s}.json`) as object), end_date: (opts.now ?? NOW).toISOString().slice(0, 10) })!) : { ok: false, data: null, error: `distributions ${s}: HTTP 503` };
    }
  }
  return raw;
}
/** The unaltered fixtures (with distributions) are built once per file (pure); every caller gets its own deep copy. */
const baseline = once(async () => buildSiteData(await rawWith({ dist: "ok" }), null, NOW));
async function build(...routes: Route[]): Promise<BuildResult> {
  return routes.length ? buildSiteData(await rawWith({ routes, dist: "ok" }), null, NOW) : baseline();
}

/* ------------------------------------------------------------------ parsers */

test("parseFundPortfolio: the fixture parses; numeric strings accepted; bad rows dropped and noted; never a 0 default", () => {
  const b = book();
  assert.equal(b.fund, "SEST");
  assert.equal(b.as_of, "2026-09-28");
  assert.deepEqual(b.characteristics.modified_duration, { value: 2.38, coverage: 0.97 });
  assert.deepEqual(b.characteristics.average_rating, { value: "A-", coverage: 1 });
  assert.equal(b.top_holdings.length, 10);
  assert.deepEqual(b.coverage, { resolved_weight: 0.99, priced_weight: 0.97 });

  const p = parseFundPortfolio({
    fund: "SEB", as_of: "2026-09-28T00:00:00", net_assets_cad: "12.5",
    characteristics: { modified_duration: { value: "7.1", coverage: "0.95" }, coupon: { value: "n/a", coverage: 1 }, yield_to_maturity: null },
    breakdowns: { sector: [{ label: "Financials", weight: 0.5 }, { label: "", weight: 0.2 }, { label: "Cash", weight: "abc" }], term: "nope" },
    top_holdings: [{ name: "X 1% 2030", weight: 0.03, maturity: "2030-02-30", coupon: "0.01", green_bond: "yes" }, { weight: 0.02 }],
    totals: { holdings_count: 3.5, bonds_count: 2 }, coverage: {}, warnings: ["w", 3],
  })!;
  assert.equal(p.as_of, "2026-09-28");
  assert.equal(p.net_assets_cad, 12.5);
  assert.deepEqual(p.characteristics, { modified_duration: { value: 7.1, coverage: 0.95 } });
  assert.deepEqual(p.breakdowns, { sector: [{ label: "Financials", weight: 0.5, count: null }] });
  assert.deepEqual(p.top_holdings, [{ name: "X 1% 2030", weight: 0.03, issuer: null, coupon: 0.01, maturity: null, rating: null, sector: null, green_bond: null }]);
  assert.equal(p.totals.holdings_count, null, "3.5 is not a count");
  assert.equal(p.totals.bonds_count, 2);
  assert.equal(p.totals.cash_weight, null);
  assert.deepEqual(p.coverage, { resolved_weight: null, priced_weight: null });
  assert.equal(p.green_bonds_weight, null);
  assert.deepEqual(p.warnings, ["w"]);
  assert.ok(p.notes.some((n) => n.startsWith("characteristics.coupon")));
  assert.ok(p.notes.some((n) => n.startsWith("breakdowns.sector")));
  assert.ok(p.notes.some((n) => n.startsWith("top_holdings")));

  for (const bad of [null, [], "x", { fund: "SEST" }, { as_of: "2026-09-28" }, { fund: "SEST", as_of: "28/09/2026" }]) assert.equal(parseFundPortfolio(bad), null);
});

test("parseDistributions: rows sorted, invalid rows / classes / years dropped and noted; shape required", () => {
  const d = parseDistributions({
    short_name: "SEST", start_date: "2019-01-01", end_date: "2026-09-29", method: "m",
    rows: [
      { date: "2026-08-31", fundserv: "LDM001", amount_per_unit: "0.0415" },
      { date: "2026-07-31", fundserv: "LDM001", class_display: "FP", currency: "CAD", amount_per_unit: 0.041 },
      { date: "2026-07-31", fundserv: "LDM001", amount_per_unit: null },
      { date: "bad", fundserv: "LDM001", amount_per_unit: 1 },
    ],
    classes: [
      { fundserv: "LDM001", last_date: "2026-08-31", last_amount_per_unit: 0.0415, trailing_12m_per_unit: 0.5, calendar_years: [{ year: 2026, per_unit: 0.0825, count: 2 }, { year: "x" }] },
      { class_display: "no code" },
    ],
  })!;
  assert.deepEqual(d.rows.map((r) => [r.date, r.amount_per_unit]), [["2026-07-31", 0.041], ["2026-08-31", 0.0415]]);
  assert.equal(d.classes.length, 1);
  assert.deepEqual(d.classes[0].calendar_years, [{ year: 2026, per_unit: 0.0825, count: 2 }]);
  assert.equal(d.classes[0].frequency_observed, null);
  assert.equal(d.notes.length, 3);
  assert.equal(parseDistributions({ rows: [] }), null);
  assert.equal(parseDistributions(null), null);
});

/* ------------------------------------------------------------------ fetchers */

test("fetchers: 404 route (not deployed) and 404 resource are `absent`; 5xx / network / garbage are failures", async () => {
  const notFound = client((u) => (u.pathname.startsWith("/api/apex/fund-portfolio") || u.pathname.endsWith("/distributions") ? json({ detail: "Not Found" }, 404) : undefined));
  const a = await fetchFundPortfolio(notFound, "SEST");
  assert.equal(a.ok, false);
  assert.equal(a.absent, true);
  assert.match(a.error!, /HTTP 404 \(endpoint not deployed yet\)/);
  const d = await fetchDistributions(notFound, "SEB");
  assert.equal(d.absent, true);

  const noBook = await fetchFundPortfolio(client(), "SEST", "2026-07-31");
  assert.equal(noBook.absent, true);
  assert.match(noBook.error!, /No FINAL_NAV book for SEST on or before 2026-07-31/);

  let calls = 0;
  const down = client((u) => (u.pathname === "/api/apex/fund-portfolio" ? (calls++, new Response("x", { status: 503 })) : undefined));
  const e = await fetchFundPortfolio(down, "SEST");
  assert.equal(e.ok, false);
  assert.equal(e.absent, undefined);
  assert.match(e.error!, /HTTP 503/);
  assert.equal(calls, 3, "5xx retried");

  const garbage = await fetchDistributions(client((u) => (u.pathname.endsWith("/distributions") ? json({ rows: "x" }) : undefined)), "SEST");
  assert.equal(garbage.ok, false);
  assert.match(garbage.error!, /unexpected payload/);
  const net = await fetchFundPortfolio(client(() => { throw new TypeError("fetch failed"); }), "SEST");
  assert.equal(net.ok, false);
  assert.match(net.error!, /network error/);

  const fine = await fetchFundPortfolio(client(), "SEB", "2026-08-31");
  assert.equal(fine.ok, true);
  assert.equal(fine.data!.as_of, "2026-08-31");
});

/* ------------------------------------------------------------------ selection, ordering */

test("ordering: ratings AAA → D, then not rated, then cash; terms in bucket order; others largest first, cash last", () => {
  assert.ok(ratingRank("AAA") < ratingRank("AA+") && ratingRank("AA-") < ratingRank("A") && ratingRank("BBB") < ratingRank("D"));
  assert.ok(ratingRank("D") < ratingRank("Weird") && ratingRank("Weird") < ratingRank("Not rated") && ratingRank("NR") < ratingRank("Cash"));
  assert.ok(termRank("0-1") < termRank("1-3") && termRank("7-10") < termRank("10+") && termRank("10+") < termRank("Cash"));
  const r = (labels: [string, number][]) => labels.map(([label, weight]) => ({ label, weight, count: null }));
  assert.deepEqual(orderRows("rating", r([["Cash", 0.04], ["BBB", 0.3], ["Not rated", 0.01], ["AAA", 0.05], ["A", 0.6]])).map((x) => x.label), ["AAA", "A", "BBB", "Not rated", "Cash"]);
  assert.deepEqual(orderRows("term", r([["10+", 0.1], ["Cash", 0.04], ["0-1", 0.2], ["3-5", 0.66]])).map((x) => x.label), ["0-1", "3-5", "10+", "Cash"]);
  assert.deepEqual(orderRows("sector", r([["Cash", 0.5], ["B", 0.2], ["A", 0.3]])).map((x) => x.label), ["A", "B", "Cash"]);
});

test("selectPortfolio: thresholds (priced >= 90 %, resolved >= 95 %), freshness, per-characteristic coverage >= 90 %", () => {
  const sel = selectPortfolio(ok(book()), O);
  assert.equal(sel.portfolio?.source, "daily");
  assert.equal(sel.portfolio?.asOf, "2026-09-28");
  assert.deepEqual(sel.portfolio?.characteristics.map((m) => [m.id, m.value, m.coverage]), [["duration", 2.38, 0.97], ["ytm", 0.0414, 0.97], ["coupon", 0.0398, 1], ["maturity", 2.71, 1], ["rating", "A-", 1]]);
  assert.equal(sel.portfolio?.greenBondsWeight, null, "green weight only for the funds that publish it");
  assert.deepEqual(sel.portfolio?.totals, { holdings: 86, bonds: 84, cashWeight: 0.042, derivatives: 2 });
  assert.equal(sel.portfolio?.topHoldings.length, 10);
  assert.match(sel.provenance!, /fund-portfolio: SEST FINAL_NAV book 2026-09-28; priced 97.0%, resolved 99.0%/);
  assert.deepEqual(sel.issues, []);

  const fallback = (over: Record<string, unknown>) => selectPortfolio(ok(book(over)), O);
  const low = fallback({ coverage: { priced_weight: 0.89, resolved_weight: 0.99 } });
  assert.equal(low.portfolio, null);
  assert.equal(low.issues[0].level, "warn");
  assert.match(low.issues[0].message, /priced 89.0% < 90%.*factsheet figures shown/);
  assert.equal(fallback({ coverage: { priced_weight: 0.99, resolved_weight: 0.949 } }).portfolio, null);
  assert.equal(fallback({ coverage: { priced_weight: 0.99 } }).portfolio, null, "unknown coverage is not enough");
  assert.equal(fallback({ coverage: { priced_weight: 0.9, resolved_weight: 0.95 } }).portfolio?.source, "daily", "thresholds are inclusive");
  const stale = fallback({ as_of: "2026-09-21" });
  assert.equal(stale.portfolio, null);
  assert.match(stale.issues[0].message, /8 days old/);
  assert.equal(fallback({ as_of: "2026-09-22" }).portfolio?.asOf, "2026-09-22", "7 days old is still daily");
  assert.equal(fallback({ as_of: "2026-10-02" }).portfolio, null, "future book");

  const partial = fallback({ characteristics: { modified_duration: { value: 2.4, coverage: 0.89 }, yield_to_maturity: { value: 0.04, coverage: 0.9 }, coupon: { value: "A", coverage: 1 }, average_rating: { value: "A", coverage: null } } });
  assert.deepEqual(partial.portfolio?.characteristics.map((m) => m.id), ["ytm"]);
  assert.match(partial.issues.find((i) => i.key.endsWith(".characteristics"))!.message, /modified_duration \(coverage 89.0%\), coupon \(value of the wrong type\), average_rating \(coverage unknown\)/);

  const absent = selectPortfolio({ ok: false, data: null, absent: true, error: "x: HTTP 404" }, O);
  assert.deepEqual(absent, { portfolio: null, issues: [], provenance: null, absent: true });
  const failed = selectPortfolio({ ok: false, data: null, error: "fund-portfolio SEST: HTTP 500" }, O);
  assert.equal(failed.issues[0].level, "warn");
  assert.equal(selectPortfolio(undefined, O).portfolio, null);
  assert.equal(selectPortfolio(ok(book()), { ...O, greenBonds: true }).portfolio?.greenBondsWeight, 0);
});

/* ------------------------------------------------------------------ month-end cross-check */

test("cross-check: month-end book vs the factsheet of the same month (duration, yield, top sectors)", () => {
  const me = parseFundPortfolio(loadFixture("dataplatform/portfolio_SEST_2026-08-31.json"))!;
  const fs = {
    month: "2026-08",
    characteristics: [
      { id: "duration", label: { en: "", fr: "" }, fund: 2.41, unit: "num" as const },
      { id: "portfolioYield", label: { en: "", fr: "" }, fund: 0.0421, unit: "pct" as const },
    ],
    sectors: [{ label: "Financial", fund: 0.382 }, { label: "Energy", fund: 0.121 }, { label: "Utilities", fund: 0.094 }],
  };
  assert.deepEqual(crossCheckPortfolio(me, fs, "k"), [], "fixture month-end book within tolerances");
  const off = crossCheckPortfolio(me, { ...fs, characteristics: [{ ...fs.characteristics[0], fund: 2.1 }, { ...fs.characteristics[1], fund: 0.0455 }], sectors: [{ label: "Financials", fund: 0.3 }] }, "k");
  assert.deepEqual(off.map((i) => [i.key, i.level]), [["k.duration", "warn"], ["k.ytm", "warn"], ["k.sector", "warn"]]);
  assert.match(off[1].message, /yield to maturity .* \(daily book\) vs portfolio yield .* the two measures may differ/);
  // duration tolerance: max(0.25 year, 5 %): 7.31 vs 7.0 is within 0.35 (5 % of 7)
  const seb = parseFundPortfolio(loadFixture("dataplatform/portfolio_SEB_2026-08-31.json"))!;
  assert.deepEqual(crossCheckPortfolio(seb, { month: "2026-08", characteristics: [{ ...fs.characteristics[0], fund: 7.0 }] }, "k"), []);
  assert.equal(crossCheckPortfolio(seb, { month: "2026-08", characteristics: [{ ...fs.characteristics[0], fund: 6.9 }] }, "k")[0].key, "k.duration");
  assert.deepEqual(crossCheckPortfolio(me, { month: "2026-08", characteristics: [] }, "k").map((i) => i.level), ["info"], "nothing comparable");

  assert.equal(monthEndBook([null, me], "2026-08"), me);
  assert.equal(monthEndBook([book()], "2026-08"), null, "a September book is not the August month-end");
  assert.equal(monthEndBook([book({ as_of: "2026-08-20" })], "2026-08"), null, "too far from the month-end");
});

/* ------------------------------------------------------------------ distributions */

const distFixture = (): ClassDistributions => parseDistributions(loadFixture("dataplatform/distributions_SEST.json"))!;

test("distributions: per live series by FundServ code; non-live series hidden; register labels win", () => {
  const live = [
    { fundserv: "LDM001", display: "FP", currency: "CAD" }, { fundserv: "LDM021", display: "A", currency: "CAD" },
    { fundserv: "LDM011", display: "F USD", currency: "USD" }, { fundserv: "LDM999", display: "Z", currency: "CAD" },
  ];
  const sel = selectDistributions(ok(distFixture()), { base: "b", short: "SEST", live, today: "2026-09-29" });
  assert.deepEqual(sel.distributions!.classes.map((c) => c.fundserv), ["LDM001", "LDM011", "LDM021"]);
  assert.equal(sel.distributions!.asOf, "2026-09-28", "the latest distribution shown, not the end of the requested window (2026-09-29)");
  assert.equal(sel.distributions!.checkedAt, "2026-09-29");
  assert.equal(sel.distributions!.trailingTo, "2026-09-29", "the trailing 12 months end at the response end date, not the last distribution");
  assert.equal(selectDistributions(ok({ ...distFixture(), end_date: null }), { base: "b", short: "SEST", live, today: "2026-09-29" }).distributions!.trailingTo, undefined);
  const a = sel.distributions!.classes.find((c) => c.fundserv === "LDM021")!;
  assert.deepEqual(a.last, { date: "2026-09-28", amount: 0.04 });
  assert.equal(a.history.length, 93);
  assert.equal(a.frequency, "monthly");
  assert.equal(sel.distributions!.classes.find((c) => c.fundserv === "LDM011")!.currency, "USD");
  assert.deepEqual(sel.issues.map((i) => i.message), ["series not live, not shown: LDM031, LDM061, LDM081, LDM091", "live series without distribution data: LDM999"]);

  // matched by FundServ code only: a payload that relabels the class letters still maps to the right series
  const d = distFixture();
  const swapped: ClassDistributions = { ...d, rows: d.rows.map((r) => ({ ...r, class_display: r.class_display === "FP" ? "A" : "FP" })), classes: d.classes.map((c) => ({ ...c, class_display: "?" })) };
  const fp = classDistribution(swapped, { fundserv: "LDM001", display: "FP", currency: "CAD" })!;
  assert.equal(fp.display, "FP");
  assert.deepEqual(fp.last, { date: "2026-08-31", amount: d.classes.find((c) => c.fundserv === "LDM001")!.last_amount_per_unit! });

  assert.equal(selectDistributions(ok(d), { base: "b", short: "SEST", live: null, today: "2026-09-29" }).issues[0].level, "warn");
  assert.equal(selectDistributions({ ok: false, data: null, absent: true }, { base: "b", short: "SEST", live, today: "2026-09-29" }).absent, true);
  assert.deepEqual(["monthly", "Quarterly", "semi_annual", "yearly", "weird", null].map(frequency), ["monthly", "quarterly", "semi-annual", "annual", null, null]);
});

test("distributions gates: amount vs NAV, dates, last row, trailing 12 months, calendar-year totals", () => {
  const base = (): ClassDistribution => ({
    fundserv: "LDM001", display: "FP", currency: "CAD", frequency: "monthly",
    last: { date: "2026-08-31", amount: 0.05 }, trailing12m: 0.1,
    calendarYears: [{ year: 2026, amount: 0.1, count: 2 }],
    history: [{ date: "2026-07-31", amount: 0.05 }, { date: "2026-08-31", amount: 0.05 }],
  });
  const today = "2026-09-29";
  assert.equal(distributionProblem(base(), 10, today), null);
  assert.equal(distributionProblem(base(), null, today), null, "no NAV: the ratio gate cannot run, the others do");
  assert.match(distributionProblem(base(), 1, today)!, /5.00% of the NAV per unit/);
  const mut = (f: (c: ClassDistribution) => void) => { const c = base(); f(c); return distributionProblem(c, 10, today); };
  assert.match(mut((c) => { c.history[0].amount = -0.01; })!, /amount -0.01/);
  assert.match(mut((c) => { c.history[0].amount = 0; })!, /amount 0 /);
  assert.match(mut((c) => { c.history[1].date = "2026-07-31"; })!, /not ascending/);
  assert.match(mut((c) => { c.history.push({ date: "2026-10-30", amount: 0.05 }); })!, /invalid date 2026-10-30/);
  assert.match(mut((c) => { c.last = { date: "2026-08-31", amount: 0.06 }; })!, /differs from the last row/);
  assert.match(mut((c) => { c.last = null; })!, /no last distribution/);
  assert.match(mut((c) => { c.trailing12m = 2.6; })!, /trailing 12 months 2.6 is 26.00%/);
  assert.match(mut((c) => { c.calendarYears[0].amount = 0.11; })!, /calendar year 2026/);
  assert.match(mut((c) => { c.calendarYears[0].count = 3; })!, /calendar year 2026/);
  assert.equal(mut((c) => { c.calendarYears[0].amount = 0.100001; }), null, "6-decimal rounding tolerated");

  const f = { key: "monthly-income", nav: { asOf: "2026-09-28", classes: [{ fundserv: "LDM001", nav: 1 }, { fundserv: "LDM021", nav: 10 }] }, distributions: { asOf: today, checkedAt: today, trailingTo: today, classes: [base(), { ...base(), fundserv: "LDM021", display: "A" }] } } as unknown as FundData;
  const issues = checkDistributions(f, "funds.monthly-income", NOW);
  assert.deepEqual(f.distributions!.classes.map((c) => c.fundserv), ["LDM021"]);
  assert.deepEqual(issues.map((i) => [i.key, i.level]), [["funds.monthly-income.distributions.LDM001", "warn"]]);
  (f.nav!.classes[1] as { nav: number }).nav = 0.5;
  checkDistributions(f, "b", NOW);
  assert.equal(f.distributions, null, "no plausible series left");
});

/* ------------------------------------------------------------------ portfolio gates */

test("portfolio gates: implausible parts dropped one by one, the block when nothing is left, never the fund", async () => {
  const b = await build();
  const fund = () => structuredClone(b.data.funds["monthly-income"]!);
  const run = (f: (x: FundData) => void) => { const x = fund(); f(x); return { x, issues: checkPortfolio(x, "p", NOW) }; };

  assert.deepEqual(run(() => undefined).issues, []);
  const dur = run((x) => { x.portfolio!.characteristics[0].value = 31; });
  assert.deepEqual(dur.x.portfolio!.characteristics.map((m) => m.id), ["ytm", "coupon", "maturity", "rating"]);
  assert.equal(dur.issues[0].key, "p.portfolio.characteristics.duration");
  assert.equal(run((x) => { x.portfolio!.characteristics[1].value = 0.26; }).x.portfolio!.characteristics.length, 4, "YTM above 25 %");
  assert.equal(run((x) => { x.portfolio!.characteristics[1].value = -0.051; }).x.portfolio!.characteristics.length, 4, "YTM below -5 %");
  assert.equal(run((x) => { x.portfolio!.characteristics[4].value = "Q+"; }).x.portfolio!.characteristics.length, 4, "not a rating");
  assert.equal(run((x) => { x.portfolio!.characteristics[2].coverage = 1.2; }).x.portfolio!.characteristics.length, 4, "coverage above 1");
  const sum = run((x) => { x.portfolio!.breakdowns.sector![0].weight -= 0.05; });
  assert.equal(sum.x.portfolio!.breakdowns.sector, undefined);
  assert.match(sum.issues[0].message, /sector breakdown not shown: weights add up to 95/);
  assert.ok(run((x) => { x.portfolio!.breakdowns.country![0].weight += 0.02; }).x.portfolio!.breakdowns.country, "within ±3 %");
  const nan = run((x) => { x.portfolio!.breakdowns.term![0].weight = Number.NaN; });
  assert.equal(nan.x.portfolio!.breakdowns.term, undefined);
  const top = run((x) => { x.portfolio!.topHoldings[0].weight = 0.3; });
  assert.deepEqual(top.x.portfolio!.topHoldings, []);
  const detail = run((x) => { x.portfolio!.topHoldings[0].coupon = 0.9; x.portfolio!.topHoldings[1].maturity = "soon"; });
  assert.equal(detail.x.portfolio!.topHoldings[0].coupon, null);
  assert.equal(detail.x.portfolio!.topHoldings[1].maturity, null);
  assert.deepEqual(detail.issues, [], "details are blanked quietly");
  assert.equal(run((x) => { x.portfolio!.asOf = "2026-09-10"; }).x.portfolio, null, "stale book");
  assert.equal(run((x) => { x.portfolio!.asOf = "yesterday"; }).x.portfolio, null);
  const empty = run((x) => { x.portfolio!.characteristics = []; x.portfolio!.breakdowns = {}; x.portfolio!.topHoldings[0].weight = -1; });
  assert.equal(empty.x.portfolio, null);
  assert.match(empty.issues[empty.issues.length - 1].message, /nothing plausible left/);

  // through validateSite: a NaN inside the portfolio never blocks the fund
  const site = structuredClone(b.data);
  site.funds["monthly-income"]!.portfolio!.breakdowns.sector![0].weight = Number.NaN;
  site.funds["monthly-income"]!.distributions!.classes[0].history[0].amount = Number.NaN;
  const v = validateSite(site, b.context, null, NOW);
  assert.equal(v.funds["monthly-income"], "updated");
  assert.deepEqual(v.results.find((r) => r.fund === "monthly-income")!.blocking, []);
  assert.deepEqual(v.results.find((r) => r.fund === "monthly-income")!.alerts, [], "warn only: the run is not blocked");
  assert.equal(v.data.funds["monthly-income"]!.portfolio!.breakdowns.sector, undefined);
});

/* ------------------------------------------------------------------ build */


test("build: daily book computed by the website for covered funds, factsheet kept for the others; distributions only when supplied", async () => {
  const m = mockFetch();
  const r = await fetchAll({ fetchImpl: m.fetch, now: NOW, env: fixtureEnv() });
  // main-branch endpoints only: the Apex books of the latest valuation day and of the last closed month's last one
  const holdings = m.calls.map((c) => new URL(c.url)).filter((u) => u.pathname === "/api/apex/holdings");
  assert.deepEqual(holdings.map((u) => `${u.searchParams.get("fund")} ${u.searchParams.get("date")}`).sort(), ["Multistrat 2026-08-31", "Multistrat 2026-09-28", "SEB 2026-08-31", "SEB 2026-09-28", "SEST 2026-08-31", "SEST 2026-09-28"]);
  assert.ok(m.calls.some((c) => c.url.includes("/api/instruments/batch?identifier_type=isin")));
  assert.equal(m.calls.filter((c) => new URL(c.url).pathname === "/api/instruments").length, 3, "bond universe read page by page until a short page");
  assert.ok(m.calls.every((c) => !/fund-portfolio|\/api\/performance\/distributions/.test(c.url)));
  const { data } = buildSiteData(r, null, NOW);
  const mi = data.funds["monthly-income"]!;
  assert.equal(mi.portfolio?.source, "daily");
  assert.equal(mi.portfolio?.asOf, "2026-09-28");
  assert.deepEqual(mi.portfolio?.breakdowns.term?.map((x) => x.label), ["0-1", "1-3", "3-5", "Cash"]);
  assert.deepEqual(mi.portfolio?.breakdowns.sector?.slice(0, 3).map((x) => x.label), ["Financial", "Government", "Energy"]);
  assert.equal(mi.portfolio?.coverage?.priced, 0.9637, "one bond's price is 45 days old: unpriced");
  assert.equal(mi.factsheetMonth, "2026-08", "the factsheet figures are still published alongside (ESG, fallback)");
  const seb = data.funds["sustainable-enhanced-bonds"]!;
  assert.equal(seb.portfolio?.greenBondsWeight, 0.2608);
  assert.deepEqual(seb.portfolio?.characteristics.map((x) => x.id), ["duration", "ytm", "rating"], "coupon and maturity coverage 86.5 % (perpetual bonds)");
  assert.equal(data.funds["multi-strategy"]!.portfolio, null, "coverage below the thresholds");
  assert.equal(data.funds["global-minimum-volatility"]!.portfolio, null);
  assert.match(data.provenance["funds.monthly-income.portfolio"], /^computed by the website from dataplatform \/api\/apex\/holdings, \/api\/instruments\/batch, \/api\/instruments \(bond universe\) and \/api\/performance\/nav-timeseries .*: SEST FINAL_NAV book 2026-09-28; priced 96\.4%, resolved 100\.0%/);
  // no distributions endpoint on the dataplatform main branch: none shown, one info issue
  assert.equal(mi.distributions, null);
  assert.deepEqual(data.issues.filter((i) => i.key.startsWith("sources.")).map((i) => [i.key, i.level]), [["sources.distributions", "info"]]);
  // the month-end cross-check ran and passed for both bond funds (no issue under the crossCheck keys)
  assert.deepEqual(data.issues.filter((i) => i.key.includes("crossCheck")), []);
  // a supplied distributions payload (the PR #621 contract) is still displayed per series
  const withDist = (await build()).data;
  assert.deepEqual(withDist.funds["monthly-income"]!.distributions?.classes.map((c) => c.fundserv), ["LDM001", "LDM011", "LDM021", "LDM031", "LDM061", "LDM081"]);
  assert.deepEqual(withDist.funds["multi-strategy"]!.distributions?.classes[0].calendarYears.map((y) => y.year), [2019, 2020, 2021, 2023, 2024, 2025]);
});

test("build: the month-end book is cross-checked with the factsheet of the month (sectors; no duration: latest prices only)", async () => {
  const { data } = await build();
  const me = computedBookOf(await rawWith(), "SEST", "monthEnd");
  assert.equal(me?.data?.as_of, "2026-08-31");
  assert.equal(me?.data?.characteristics.modified_duration, undefined, "a month-old book has no current price: no duration to compare");
  assert.deepEqual(data.issues.filter((i) => i.key.startsWith("funds.monthly-income.portfolio.crossCheck")), []);
  // a month-end book that disagrees with the August factsheet produces cross-check warnings (the check really runs)
  const divergent: Route = (u) => {
    if (u.pathname !== "/api/apex/holdings" || u.searchParams.get("fund") !== "SEST" || u.searchParams.get("date") !== "2026-08-31") return undefined;
    const h = structuredClone(loadFixture("dataplatform/holdings_SEST_2026-08-31.json")) as { positions: { description: string; market_value_cad: number }[] };
    for (const p of h.positions) if (/^Synthetic Energy/.test(p.description)) p.market_value_cad *= 3;
    return json(h);
  };
  const d2 = (await build(divergent)).data;
  const cc = d2.issues.filter((i) => i.key.startsWith("funds.monthly-income.portfolio.crossCheck"));
  assert.deepEqual(cc.map((i) => [i.key, i.level]), [["funds.monthly-income.portfolio.crossCheck.sector", "warn"]]);
  assert.match(cc[0].message, /month-end cross-check 2026-08-31: sector Energy 35\.\d% \(daily book\) vs 12\.1% \(factsheet 2026-08\)/);
  assert.equal(d2.funds["monthly-income"]!.portfolio?.source, "daily", "a cross-check warning never withholds the daily book");
});

test("build: holdings or the instrument master failing → factsheet figures (warn), everything else unchanged", async () => {
  const before = (await build((u) => (u.pathname === "/api/instruments/batch" ? json({ detail: "x" }, 500) : undefined))).data;
  const after = (await build()).data;
  for (const [k, f] of Object.entries(before.funds)) {
    assert.equal(f!.portfolio, null, k);
    const { portfolio: _p, ...rest } = f!;
    const { portfolio: _p2, ...rest2 } = after.funds[k as keyof SiteData["funds"]]!;
    assert.deepEqual(rest, rest2, `${k}: the other blocks do not depend on the portfolio sources`);
  }
  assert.ok(before.issues.some((i) => i.key === "funds.monthly-income.portfolio" && i.level === "warn" && /instrument master unavailable \(instruments: HTTP 500 on \/api\/instruments\/batch\?identifier_type=isin/.test(i.message)), JSON.stringify(before.issues.filter((i) => /portfolio/.test(i.key))));
  const noHoldings = (await build((u) => (u.pathname === "/api/apex/holdings" ? json({ detail: "x" }, 500) : undefined))).data;
  assert.equal(noHoldings.funds["sustainable-enhanced-bonds"]!.portfolio, null);
  assert.ok(noHoldings.issues.some((i) => i.key === "funds.sustainable-enhanced-bonds.portfolio" && /apex\/holdings SEB 2026-09-28: HTTP 500/.test(i.message)));
  // a holdings answer naming another fund is a failure, never another fund's book under this one
  const wrong: Route = (u) => (u.pathname === "/api/apex/holdings" && u.searchParams.get("fund") === "SEST" ? json({ ...(loadFixture("dataplatform/holdings_SEB_2026-09-28.json") as object) }) : undefined);
  const w = (await build(wrong)).data;
  assert.equal(w.funds["monthly-income"]!.portfolio, null);
  assert.ok(w.issues.some((i) => /payload is for fund "SEB", not SEST/.test(i.message)));
});

test("build: a failing source keeps the previous daily book and distributions; validation drops a book once too old", async () => {
  const prev = (await build()).data;
  const down: Route = (u) => (u.pathname === "/api/apex/holdings" ? new Response("x", { status: 500 }) : undefined);
  const raw = await rawWith({ routes: [down], dist: "down" });
  const { data, context } = buildSiteData(raw, prev, NOW);
  assert.deepEqual(data.funds["monthly-income"]!.portfolio, prev.funds["monthly-income"]!.portfolio);
  assert.deepEqual(data.funds["monthly-income"]!.distributions, prev.funds["monthly-income"]!.distributions);
  assert.match(data.provenance["funds.monthly-income.portfolio"], /^carried over/);
  assert.ok(data.issues.some((i) => i.key === "funds.monthly-income.portfolio" && i.level === "warn"));
  // ten days later the carried book is stale: dropped by validation (factsheet shown), fund still updated
  const later = new Date("2026-10-09T14:00:00Z");
  const v = validateSite(data, context, prev, later);
  assert.equal(v.data.funds["monthly-income"]!.portfolio, null);
  assert.ok(v.data.issues.some((i) => i.key === "funds.monthly-income.portfolio" && /is 11 days old \(more than 7\)/.test(i.message)));
});

test("distributions: a capped history drops the calendar years it no longer fully holds", () => {
  const d = distFixture();
  const many = { ...d, rows: Array.from({ length: 450 }, (_, i) => ({ date: new Date(Date.UTC(1990, 0, 1 + i * 20)).toISOString().slice(0, 10), fundserv: "LDM001", class_display: "FP", currency: "CAD", amount_per_unit: 0.01 })) };
  const years = [...new Set(many.rows.map((r) => +r.date.slice(0, 4)))].map((year) => ({ year, per_unit: 0, count: 0 }));
  const c = classDistribution({ ...many, classes: [{ ...d.classes[0], calendar_years: years }] }, { fundserv: "LDM001", display: "FP", currency: "CAD" })!;
  assert.equal(c.history.length, 400);
  assert.ok(c.calendarYears[0].year > +c.history[0].date.slice(0, 4));
});

test("carried-over funds pass the daily-book age gate again (fund missing from the run, or blocked)", async () => {
  const { data: prev, context } = buildSiteData(await fetchAll({ fetchImpl: mockFetch().fetch, now: NOW, env: fixtureEnv() }), null, NOW);
  const later = new Date("2026-10-09T14:00:00Z"); // the September 28 book is now 11 days old
  // the fund is missing from this run: the previous publication is carried, without its stale daily book
  const input = structuredClone(prev);
  input.generatedAt = later.toISOString();
  delete input.funds["monthly-income"];
  const v = validateSite(input, context, prev, later);
  assert.equal(v.funds["monthly-income"], "kept-previous");
  const kept = v.data.funds["monthly-income"]!;
  assert.equal(kept.portfolio, null, "never republished as Daily");
  assert.ok(kept.nav, "the rest of the previous publication is kept");
  assert.ok(prev.funds["monthly-income"]!.portfolio, "the previous publication is not mutated");
  assert.ok(v.data.issues.some((i) => i.key === "funds.monthly-income.portfolio" && i.level === "warn" && /11 days old/.test(i.message)));
  assert.equal(v.data.provenance["funds.monthly-income.portfolio"], undefined);
  // a blocked fund carried over: same gate
  const blocked = structuredClone(prev);
  blocked.funds["monthly-income"]!.performance!.monthly[0].r = Number.NaN;
  const vb = validateSite(blocked, context, prev, later);
  assert.equal(vb.funds["monthly-income"], "updated", "only the performance is held; the rest is published");
  assert.equal(vb.data.funds["monthly-income"]!.portfolio, null);
  assert.deepEqual(vb.data.funds["monthly-income"]!.performance, prev.funds["monthly-income"]!.performance, "previous performance kept");
  // a fresh carried book stays
  const vf = validateSite(input, context, prev, NOW);
  assert.equal(vf.data.funds["monthly-income"]!.portfolio?.asOf, "2026-09-28");
});

test("fetchers: a payload for another fund than the one requested is rejected (identity check)", async () => {
  const wrongBook = client((u) => (u.pathname === "/api/apex/fund-portfolio" ? json({ ...(loadFixture("dataplatform/portfolio_SEB.json") as object) }) : undefined));
  const p = await fetchFundPortfolio(wrongBook, "SEST");
  assert.equal(p.ok, false);
  assert.equal(p.absent, undefined, "a failure, not 'not deployed'");
  assert.match(p.error!, /payload is for fund "SEB", not SEST/);
  const wrongDist = client((u) => (u.pathname === "/api/performance/distributions" ? json(loadFixture("dataplatform/distributions_SEB.json")) : undefined));
  const d = await fetchDistributions(wrongDist, "SEST");
  assert.equal(d.ok, false);
  assert.match(d.error!, /payload is for fund "SEB", not SEST/);
  const noName = client((u) => (u.pathname === "/api/performance/distributions" ? json({ ...(loadFixture("dataplatform/distributions_SEST.json") as object), short_name: undefined }) : undefined));
  assert.match((await fetchDistributions(noName, "SEST")).error!, /payload is for fund "\(none\)"/);
  assert.equal((await fetchFundPortfolio(client(), "SEST")).ok, true);
  assert.equal((await fetchDistributions(client(), "Multistrat")).ok, true);
});

test("distributions: the currency is never defaulted; a series is dropped when it is unknown or register and payload disagree", () => {
  const d = distFixture();
  const noCur: ClassDistributions = { ...d, rows: d.rows.map((r) => ({ ...r, currency: null })), classes: d.classes.map((c) => ({ ...c, currency: null })) };
  const problems: string[] = [];
  assert.equal(classDistribution(noCur, { fundserv: "LDM001", display: "FP", currency: null }, problems), null, "no currency anywhere: not CAD by default");
  assert.match(problems[0], /FP \(LDM001\): currency unknown/);
  assert.equal(classDistribution(noCur, { fundserv: "LDM001", display: "FP", currency: "CAD" })!.currency, "CAD", "the register alone is enough");
  assert.equal(classDistribution(d, { fundserv: "LDM011", display: "F USD", currency: null })!.currency, "USD", "the payload alone is enough");

  const clash: string[] = [];
  assert.equal(classDistribution(d, { fundserv: "LDM011", display: "F USD", currency: "CAD" }, clash), null);
  assert.match(clash[0], /currency USD in the payload vs CAD in the fund register/);
  const mixed: ClassDistributions = { ...d, rows: d.rows.map((r, i) => (r.fundserv === "LDM001" && i === 0 ? { ...r, currency: "USD" } : r)) };
  const mixedP: string[] = [];
  assert.equal(classDistribution(mixed, { fundserv: "LDM001", display: "FP", currency: null }, mixedP), null);
  assert.match(mixedP[0], /currencies disagree within the payload \(CAD, USD\)/);

  const live = [{ fundserv: "LDM001", display: "FP", currency: "CAD" }, { fundserv: "LDM011", display: "F USD", currency: "CAD" }];
  const sel = selectDistributions(ok(d), { base: "b", short: "SEST", live, today: "2026-09-29" });
  assert.deepEqual(sel.distributions!.classes.map((c) => c.fundserv), ["LDM001"]);
  const w = sel.issues.find((i) => i.key === "b.distributions.LDM011")!;
  assert.equal(w.level, "warn");
  assert.match(w.message, /distributions of series F USD \(LDM011\): currency USD in the payload vs CAD in the fund register: not shown/);
});

test("distributions gates: the trailing 12 months are checked over the data platform's window, ending at the response end date", () => {
  const monthEnds = (from: string, n: number) => Array.from({ length: n }, (_, i) => new Date(Date.UTC(+from.slice(0, 4), +from.slice(5, 7) - 1 + i + 1, 0)).toISOString().slice(0, 10));
  const rows = (dates: string[], amount: (i: number) => number) => dates.map((date, i) => ({ date, amount: amount(i) }));
  const series = (history: { date: string; amount: number }[], t12: number | null, frequency: ClassDistribution["frequency"] = "monthly"): ClassDistribution => ({
    fundserv: "LDM001", display: "FP", currency: "CAD", frequency, last: history.length ? { ...history[history.length - 1] } : null, trailing12m: t12,
    calendarYears: [], history,
  });
  // the backend's figure (distribution_history.py): rows with _year_before(end) < date <= end
  const backend = (h: { date: string; amount: number }[], end: string) => +h.filter((r) => r.date > yearBefore(end) && r.date <= end).reduce((a, r) => a + r.amount, 0).toFixed(6);

  assert.equal(yearBefore("2026-09-30"), "2025-09-30");
  assert.equal(yearBefore("2028-02-29"), "2027-02-28", "29 February: the data platform's _year_before");
  assert.equal(yearBefore("2027-02-28"), "2026-02-28");

  // monthly on 2026-09-30, last distribution 2026-08-31: 11 rows (2025-10-31 … 2026-08-31), not the 12 ending at the last one
  const m = rows(monthEnds("2024-01", 32), (i) => +(0.04 + i * 0.0001).toFixed(6)); // 2024-01-31 … 2026-08-31
  const t = backend(m, "2026-09-30");
  assert.equal(m.filter((r) => r.date > "2025-09-30" && r.date <= "2026-09-30").length, 11);
  assert.equal(trailingProblem(series(m, t), "2026-09-30", "2026-09-30"), null, "the backend's figure is kept");
  const lastAnchored = backend(m, "2026-08-31"); // the 12 months ending at the last distribution: 12 rows, another total
  assert.notEqual(lastAnchored, t);
  assert.match(trailingProblem(series(m, lastAnchored), "2026-09-30", "2026-09-30")!, /over the 11 distribution\(s\) after 2025-09-30 up to 2026-09-30/, "a wrong figure is still dropped");

  // a June date, last distribution 2026-05-29: 12 rows 2025-06-30 … 2026-05-29 (the one of 2025-05-30 is outside)
  const j = rows(["2025-04-30", "2025-05-30", "2025-06-30", "2025-07-31", "2025-08-29", "2025-09-30", "2025-10-31", "2025-11-28", "2025-12-31", "2026-01-30", "2026-02-27", "2026-03-31", "2026-04-30", "2026-05-29"], (i) => +(0.05 + i * 0.001).toFixed(6));
  const tj = backend(j, "2026-06-15");
  assert.equal(j.filter((r) => r.date > "2025-06-15").length, 12);
  assert.equal(trailingProblem(series(j, tj), "2026-06-15", "2026-06-16"), null);
  assert.match(trailingProblem(series(j, backend(j, "2026-05-29")), "2026-06-15", "2026-06-16")!, /over the 12 distribution\(s\) after 2025-06-15/, "the 13 rows ending at the last distribution");

  // quarterly on 2026-09-30, last 2026-06-30: 3 rows (2025-09-30 itself is outside: strictly after)
  const q = rows(["2025-03-31", "2025-06-30", "2025-09-30", "2025-12-31", "2026-03-31", "2026-06-30"], (i) => 0.12 + i * 0.01);
  const tq = backend(q, "2026-09-30");
  assert.equal(+tq.toFixed(6), +(0.15 + 0.16 + 0.17).toFixed(6));
  assert.equal(trailingProblem(series(q, tq, "quarterly"), "2026-09-30", "2026-09-30"), null);
  assert.match(trailingProblem(series(q, backend(q, "2026-06-30"), "quarterly"), "2026-09-30", "2026-09-30")!, /over the 3 distribution\(s\)/);

  // 29 February: the window starts after 28 February of the year before
  const f = rows(["2027-02-26", "2027-03-31", "2028-01-31", "2028-02-29"], () => 0.1);
  assert.equal(trailingProblem(series(f, 0.3), "2028-02-29", "2028-03-01"), null, "2027-03-31, 2028-01-31, 2028-02-29");

  // window end unknown or in the future, capped history, gaps, young series
  assert.match(trailingProblem(series(m, t), undefined, "2026-09-30")!, /window unknown/);
  assert.match(trailingProblem(series(m, t), "2026-10-01", "2026-09-30")!, /in the future/);
  const daily = rows(Array.from({ length: DISTRIBUTIONS.maxHistory }, (_, i) => new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10)), () => 0.001);
  assert.match(trailingProblem(series(daily, 0.365), "2026-12-31", "2099-12-31")!, /history does not reach back to 2025-12-31/, "capped history: cannot be checked");
  assert.equal(trailingProblem(series(daily.slice(1), 0.364), "2026-12-31", "2099-12-31"), null, "uncapped: every row since the data start");
  assert.match(trailingProblem(series(m.filter((r) => r.date !== "2026-02-28"), t), "2026-09-30", "2026-09-30")!, /over the 10/, "a gap in the rows");
  const young = rows(monthEnds("2026-03", 6), () => 0.04);
  assert.equal(trailingProblem(series(young, 0.24), "2026-09-30", "2026-09-30"), null, "a young series: its rows only");
  assert.equal(trailingProblem(series(m, null), undefined, "2026-09-30"), null);

  // checkDistributions uses the block's window end and drops only the figure, the series stays
  const fund = (t12: number, trailingTo?: string) => ({ key: "monthly-income", nav: null, distributions: { asOf: "2026-08-31", checkedAt: "2026-09-29", ...(trailingTo ? { trailingTo } : {}), classes: [series(m, t12)] } }) as unknown as FundData;
  const good = fund(backend(m, "2026-09-29"), "2026-09-29");
  assert.deepEqual(checkDistributions(good, "b", NOW), []);
  assert.equal(good.distributions!.classes[0].trailing12m, backend(m, "2026-09-29"));
  // on 2026-09-29 the row of 2025-09-30 is still inside: the 11-row total of 2026-09-30 is wrong that day
  for (const bad of [fund(backend(m, "2026-09-30"), "2026-09-29"), fund(backend(m, "2026-09-29"))]) {
    const issues = checkDistributions(bad, "b", NOW);
    assert.equal(bad.distributions!.classes.length, 1);
    assert.equal(bad.distributions!.classes[0].trailing12m, null);
    assert.deepEqual(issues.map((i) => [i.key, i.level]), [["b.distributions.LDM001.trailing12m", "warn"]]);
  }
});

test("distributions carried over after failed reads are dropped after 10 days without a successful read", async () => {
  const { data: prev, context } = await build();
  assert.equal(prev.funds["monthly-income"]!.distributions!.checkedAt, "2026-09-29");
  const at = async (iso: string) => {
    const now = new Date(iso);
    const b = buildSiteData(await rawWith({ now, dist: "down" }), prev, now);
    return validateSite(b.data, b.context, prev, now);
  };
  const soon = await at("2026-10-09T14:00:00Z"); // 10 days
  assert.ok(soon.data.funds["monthly-income"]!.distributions, "10 days: still carried");
  assert.equal(soon.data.funds["monthly-income"]!.distributions!.checkedAt, "2026-09-29", "a carried block keeps its read date");
  const late = await at("2026-10-10T14:00:00Z"); // 11 days
  assert.equal(late.data.funds["monthly-income"]!.distributions, null);
  assert.ok(late.data.issues.some((i) => i.key === "funds.monthly-income.distributions" && i.level === "warn" && /last read successfully 2026-09-29, more than 10 days ago/.test(i.message)));
  // a whole fund carried over: same limit
  const input = structuredClone(prev);
  delete input.funds["monthly-income"];
  assert.equal(validateSite(input, context, prev, new Date("2026-10-10T14:00:00Z")).data.funds["monthly-income"]!.distributions, null);
  // files published before the read date existed: not carried
  const old = structuredClone(prev);
  delete old.funds["monthly-income"]!.distributions!.checkedAt;
  const f = old.funds["monthly-income"]!;
  checkDistributions(f, "b", NOW);
  assert.equal(f.distributions, null);
});

test("no test leaves the pipeline config mutated (memoised baselines stay valid)", () => {
  assertConfigUntouched();
});
