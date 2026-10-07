/**
 * The website's own portfolio analytics (fund-portfolio.ts, port of dataplatform PR #621 fund_portfolio.py) on a book
 * small enough to be computed by hand. Synthetic identifiers only.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeFundPortfolio,
  instrumentNotch,
  notchLabel,
  ratingNotch,
  refIndex,
  resolve,
} from "../../../src/lib/pipeline/fund-portfolio.ts";
import type { HoldingsBook, HoldingsPosition, InstrumentRef } from "../../../src/lib/pipeline/raw.ts";

const AS_OF = "2026-09-28";
const pos = (o: Partial<HoldingsPosition>): HoldingsPosition => ({
  date: AS_OF,
  bloomberg_id: null,
  isin: null,
  cusip: null,
  sedol: null,
  security_id: null,
  description: null,
  security_type: "Bond",
  sector: null,
  country: "Canada",
  currency: "CAD",
  quantity: 1,
  market_value_cad: 0,
  ...o,
});
const ref = (o: Partial<InstrumentRef> & { nymbus_instrument_id: number }): InstrumentRef => ({
  isin: null,
  cusip: null,
  figi: null,
  name: null,
  asset_class: "BOND",
  security_type: null,
  ratings: [],
  reference: null,
  classification: null,
  latest_price: null,
  ...o,
});

const book: HoldingsBook = {
  fund: "SEST",
  date: AS_OF,
  warnings: [],
  positions: [
    pos({ isin: "SYA0000000001", description: "Bond A 4% 2028", market_value_cad: 250 }),
    pos({ isin: "SYA0000000001", description: "Bond A 4% 2028", market_value_cad: 150 }), // a second lot of A
    pos({ isin: "SYB0000000002", description: "Bond B 5% 2032", market_value_cad: 300 }),
    pos({ cusip: "SYNC00001", description: "Bond C (not in the master)", market_value_cad: 100 }),
    pos({
      bloomberg_id: "BBGSYN000001",
      description: "Bond future",
      security_type: "Future",
      market_value_cad: 0,
      quantity: -5,
    }),
    pos({
      isin: "SYE0000000003",
      description: "Equity E",
      security_type: "Common Stock",
      market_value_cad: 100,
      sector: "Technology",
    }),
  ],
  cash: [{ date: AS_OF, currency: "CAD", glc_description: "BANK AND BROKER BALANCES - CAD", closing_bal_cad: 100 }],
};
const refs: InstrumentRef[] = [
  ref({
    nymbus_instrument_id: 1,
    isin: "SYA0000000001",
    ratings: [
      { agency: "composite", rating: "A" },
      { agency: "sp", rating: "BBB" },
    ],
    reference: { is_green_bond: true },
    classification: { industry_sector: "Financial", market_sector: "CORP" },
    latest_price: { price_date: "2026-09-25", modified_duration: 1.9, yield_to_maturity: 4.5 },
    coupon_rate: "4.000",
    maturity_date: "2028-09-28",
    issuer: "Issuer A",
  }),
  ref({
    nymbus_instrument_id: 2,
    isin: "SYB0000000002",
    ratings: [
      { agency: "sp", rating: "BBB+" },
      { agency: "moody", rating: "Baa2" },
      { agency: "fitch", rating: "BBB" },
    ],
    reference: { is_green_bond: false },
    classification: { industry_sector: "Government", market_sector: "GOVT" },
    latest_price: { price_date: AS_OF, modified_duration: 5, yield_to_maturity: 5 },
    coupon_rate: 5,
    maturity_date: "2032-09-28",
  }),
  ref({ nymbus_instrument_id: 3, isin: "SYE0000000003", asset_class: "EQUITY" }),
];

test("computeFundPortfolio: weights over net assets, characteristics with coverage, breakdowns with a cash row (hand-computed)", () => {
  const p = computeFundPortfolio(book, refs, { short: "SEST", netAssets: 1000 });
  assert.equal(p.as_of, AS_OF);
  assert.deepEqual(p.totals, {
    holdings_count: 4,
    bonds_count: 3,
    cash_weight: 0.1,
    derivatives_count: 1,
    other_weight: 0.1,
  });
  // bonds A (400), B (300) known, C (100) unknown: coverage 700 / 800
  // the book has an open future: duration and yield are those of the bond holdings only (labelled)
  assert.deepEqual(p.characteristics.modified_duration, { value: 3.23, coverage: 0.875, scope: "bond_holdings" }); // (400·1.9 + 300·5) / 700
  assert.deepEqual(p.characteristics.yield_to_maturity, { value: 0.0471, coverage: 0.875, scope: "bond_holdings" }); // (400·4.5 % + 300·5 %) / 700
  assert.ok(
    p.warnings.some((w) =>
      /1 open futures position\(s\): duration and yield to maturity are those of the bond holdings only/.test(w),
    ),
  );
  assert.deepEqual(p.characteristics.coupon, { value: 0.0443, coverage: 0.875 }); // (400·4 % + 300·5 %) / 700
  assert.deepEqual(p.characteristics.average_maturity, { value: 3.72, coverage: 0.875 }); // (400·731 + 300·2192) / 700 / 365.25
  // notches A = 6, B = lowest of BBB+ / Baa2 / BBB = 9: (400·6 + 300·9) / 700 = 7.29 → A-
  assert.deepEqual(p.characteristics.average_rating, { value: "A-", coverage: 0.875 });
  assert.deepEqual(p.coverage, { resolved_weight: 0.875, priced_weight: 0.875 });
  assert.equal(p.green_bonds_weight, null, "the green flag is unknown for 12.5 % of the bond weight (> 10 %)");
  assert.deepEqual(
    p.breakdowns.rating!.map((r) => [r.label, r.weight]),
    [
      ["A", 0.4],
      ["BBB", 0.3],
      ["Not rated", 0.1],
      ["Other assets", 0.1],
      ["Cash", 0.1],
    ],
  );
  assert.deepEqual(
    p.breakdowns.term!.map((r) => [r.label, r.weight]),
    [
      ["1-3", 0.4],
      ["5-7", 0.3],
      ["Unknown maturity", 0.1],
      ["Other assets", 0.1],
      ["Cash", 0.1],
    ],
  );
  // largest first, ties by label (portfolio.ts moves the cash row last for display)
  assert.deepEqual(
    p.breakdowns.sector!.map((r) => [r.label, r.weight]),
    [
      ["Financial", 0.4],
      ["Government", 0.3],
      ["Cash", 0.1],
      ["Technology", 0.1],
      ["Unclassified", 0.1],
    ],
  );
  assert.deepEqual(
    p.breakdowns.asset_type!.map((r) => [r.label, r.weight]),
    [
      ["Corporate bonds", 0.4],
      ["Government bonds", 0.3],
      ["Bonds (unclassified)", 0.1],
      ["Cash", 0.1],
      ["Equities", 0.1],
    ],
  );
  for (const b of Object.values(p.breakdowns))
    assert.ok(
      Math.abs(b!.reduce((a, r) => a + r.weight, 0) - 1) < 1e-9,
      "every breakdown adds up to 100 % of net assets",
    );
  assert.deepEqual(
    p.top_holdings.slice(0, 2).map((h) => [h.name, h.weight, h.coupon, h.maturity, h.rating, h.green_bond, h.issuer]),
    [
      ["Bond A 4% 2028", 0.4, 0.04, "2028-09-28", "A", true, "Issuer A"],
      ["Bond B 5% 2032", 0.3, 0.05, "2032-09-28", "BBB", false, null],
    ],
  );
  assert.equal(p.method.denominator, "net_assets_cad");
  assert.ok(
    p.warnings.some((w) =>
      /1 bond position\(s\) \(10\.0% of the denominator\) not resolved to the instrument master/.test(w),
    ),
  );
});

test("computeFundPortfolio: stale prices are unpriced; no net assets → positions plus cash; ambiguous identifiers stay unresolved", () => {
  const stale = refs.map((r) =>
    r.nymbus_instrument_id === 2
      ? { ...r, latest_price: { price_date: "2026-09-10", modified_duration: 5, yield_to_maturity: 5 } }
      : r,
  );
  const p = computeFundPortfolio(book, stale, { short: "SEST", netAssets: null });
  assert.equal(p.method.denominator, "positions_plus_cash");
  assert.equal(p.totals.cash_weight, round4(100 / 1000)); // A 400 + B 300 + C 100 + E 100 + cash 100 (the future counts 0)
  assert.equal(p.coverage.priced_weight, 0.5, "only A is priced: 400 / 800");
  assert.deepEqual(p.characteristics.modified_duration, { value: 1.9, coverage: 0.5, scope: "bond_holdings" });
  assert.ok(p.warnings.some((w) => /bond price\(s\) more than 7 days from the book date/.test(w)));
  // the same ISIN on two instruments: neither is used
  const dup = [...refs, ref({ nymbus_instrument_id: 9, isin: "SYA0000000001" })];
  assert.equal(refIndex(dup).isin.get("SYA0000000001"), null);
  const q = computeFundPortfolio(book, dup, { short: "SEST", netAssets: 1000 });
  assert.equal(q.coverage.resolved_weight, 0.375, "only B resolved: 300 / 800");
  assert.ok(q.warnings.some((w) => /ambiguous identifier/.test(w)));
  assert.throws(
    () => computeFundPortfolio({ ...book, positions: [], cash: [] }, refs, { short: "SEST", netAssets: null }),
    /no positive net assets/,
  );
});

const round4 = (x: number): number => Math.round(x * 1e4) / 1e4;

test("ratings: composite, else the lowest agency; DBRS, Moody's, watch and unsolicited markers; short-term ignored", () => {
  assert.equal(ratingNotch("A (low)"), 7);
  assert.equal(ratingNotch("AAH"), 2);
  assert.equal(ratingNotch("Baa1"), 8);
  assert.equal(ratingNotch("Baa"), 9);
  assert.equal(ratingNotch("BBB+/*-"), 8);
  assert.equal(ratingNotch("AAu"), 3);
  assert.equal(ratingNotch("(P)A2"), 6);
  assert.equal(ratingNotch("R-1 (high)"), null);
  assert.equal(ratingNotch("SD"), 22);
  assert.equal(ratingNotch("NR"), null);
  assert.equal(
    instrumentNotch([
      { agency: "sp", rating: "A" },
      { agency: "moody", rating: "Baa3" },
    ]),
    10,
    "lowest = BBB-",
  );
  assert.equal(
    instrumentNotch([
      { agency: "composite", rating: "AA-" },
      { agency: "sp", rating: "B" },
    ]),
    4,
    "composite first",
  );
  assert.equal(instrumentNotch([]), null);
  assert.equal(notchLabel(7), "A-");
  assert.equal(notchLabel(30), "D");
});

test("M6: no open future → no scope; short bonds offset longs (signed), above 0.5 % of net assets duration and yield are withheld", () => {
  const noFuture: HoldingsBook = { ...book, positions: book.positions.filter((x) => x.security_type !== "Future") };
  const p = computeFundPortfolio(noFuture, refs, { short: "SEST", netAssets: 1000 });
  assert.deepEqual(p.characteristics.modified_duration, { value: 3.23, coverage: 0.875 });
  // a small short of bond B (−4 = 0.4 % of net assets): signed weights (400·1.9 + 296·5) / 696
  const smallShort: HoldingsBook = {
    ...noFuture,
    positions: [
      ...noFuture.positions,
      pos({
        isin: "SYB0000000002",
        security_id: "SHORT-B",
        description: "Bond B short",
        market_value_cad: -4,
        quantity: -4,
      }),
    ],
  };
  const q = computeFundPortfolio(smallShort, refs, { short: "SEST", netAssets: 1000 });
  assert.equal(q.characteristics.modified_duration?.value, Math.round(((400 * 1.9 + 296 * 5) / 696) * 100) / 100);
  // −10 (1 % of net assets): withheld, with a warning; the other characteristics stay
  const bigShort: HoldingsBook = {
    ...noFuture,
    positions: [
      ...noFuture.positions,
      pos({
        isin: "SYB0000000002",
        security_id: "SHORT-B",
        description: "Bond B short",
        market_value_cad: -10,
        quantity: -10,
      }),
    ],
  };
  const r = computeFundPortfolio(bigShort, refs, { short: "SEST", netAssets: 1000 });
  assert.equal(r.characteristics.modified_duration, undefined);
  assert.equal(r.characteristics.yield_to_maturity, undefined);
  assert.ok(r.characteristics.average_rating);
  assert.ok(
    r.warnings.some((w) =>
      /short bond positions are 1\.00% of the denominator \(above 0\.5%\): duration and yield to maturity not shown/.test(
        w,
      ),
    ),
  );
  // breakdown weights are signed: the short reduces bond B's rating bucket
  assert.equal(r.breakdowns.rating!.find((x) => x.label === "BBB")!.weight, 0.29);
});

test("m11: an ambiguous ISIN falls back to the CUSIP; unresolved contracts never enter the weights", () => {
  const a = ref({ nymbus_instrument_id: 1, isin: "SYD0000000009", cusip: "SYNC00009" });
  const b = ref({ nymbus_instrument_id: 2, isin: "SYD0000000009", cusip: "SYNC00010" });
  const idx = refIndex([a, b]);
  assert.equal(
    resolve({ isin: "SYD0000000009", cusip: "SYNC00009", bloombergId: null }, idx).ref?.nymbus_instrument_id,
    1,
    "the CUSIP resolves the shared ISIN",
  );
  assert.deepEqual(resolve({ isin: "SYD0000000009", cusip: null, bloombergId: null }, idx), {
    ref: null,
    ambiguous: true,
  });
  assert.deepEqual(resolve({ isin: "SYZ0000000000", cusip: null, bloombergId: null }, idx), {
    ref: null,
    ambiguous: false,
  });
  // an unresolved position with a quantity and no market value (a contract the master does not know): a derivative
  const withContract: HoldingsBook = {
    ...book,
    positions: [
      ...book.positions,
      pos({
        bloomberg_id: "XYZ OPTION",
        description: "Unknown contract",
        security_type: "Misc",
        market_value_cad: 0,
        quantity: 3,
      }),
    ],
  };
  const p = computeFundPortfolio(withContract, refs, { short: "SEST", netAssets: 1000 });
  assert.equal(p.totals.derivatives_count, 2);
  assert.equal(p.totals.holdings_count, 4, "never a holding line");
  assert.ok(
    p.warnings.some((w) =>
      /1 unresolved position\(s\) with a quantity and no market value treated as derivatives/.test(w),
    ),
  );
});

test("pricing fallback: a bond without a current master price takes its FTSE constituent yield and duration (within 7 days)", () => {
  const noFuture: HoldingsBook = { ...book, positions: book.positions.filter((x) => x.security_type !== "Future") };
  const stale = refs.map((r) =>
    r.nymbus_instrument_id === 2
      ? { ...r, latest_price: { price_date: "2026-08-14", modified_duration: 9, yield_to_maturity: 9 } }
      : r,
  );
  const before = computeFundPortfolio(noFuture, stale, { short: "SEST", netAssets: 1000 });
  assert.equal(before.coverage.priced_weight, 0.5);
  assert.ok(
    before.warnings.some((w) =>
      /1 bond price\(s\) more than 7 days from the book date and not in the FTSE constituents, treated as unpriced \(their latest price dates: 2026-08-14 to 2026-08-14\)/.test(
        w,
      ),
    ),
    JSON.stringify(before.warnings),
  );
  const ftse = {
    date: AS_OF,
    rows: 1,
    byCusip: {},
    byIsin: { SYB0000000002: { date: "2026-09-25", ytm: 4.8, dur: 5.2, index: "univ", cusip: null } },
  };
  const p = computeFundPortfolio(noFuture, stale, { short: "SEST", netAssets: 1000, ftse });
  assert.equal(p.coverage.priced_weight, 0.875, "A and B priced: 700 / 800");
  assert.deepEqual(p.characteristics.modified_duration, {
    value: Math.round(((400 * 1.9 + 300 * 5.2) / 700) * 100) / 100,
    coverage: 0.875,
  });
  assert.deepEqual(p.characteristics.yield_to_maturity, {
    value: Math.round(((400 * 0.045 + 300 * 0.048) / 700) * 1e4) / 1e4,
    coverage: 0.875,
  });
  assert.ok(p.warnings.some((w) => /1 bond\(s\) priced from the FTSE Canada index constituents/.test(w)));
  // an FTSE row older than 7 days is not used
  const old = { ...ftse, byIsin: { SYB0000000002: { ...ftse.byIsin.SYB0000000002, date: "2026-09-10" } } };
  assert.equal(
    computeFundPortfolio(noFuture, stale, { short: "SEST", netAssets: 1000, ftse: old }).coverage.priced_weight,
    0.5,
  );
  // a bond with no master price at all is named as such
  const none = refs.map((r) => (r.nymbus_instrument_id === 2 ? { ...r, latest_price: null } : r));
  assert.ok(
    computeFundPortfolio(noFuture, none, { short: "SEST", netAssets: 1000 }).warnings.some((w) =>
      /2 bond\(s\) without any price in the instrument master nor in the FTSE constituents: (SYNC00001, SYB0000000002|SYB0000000002, SYNC00001)/.test(
        w,
      ),
    ),
  );
});

test("FTSE fallback: matched by CUSIP when the position has no ISIN; a row without yield or duration, or out of range, does not price", () => {
  const cusipOnly: HoldingsBook = {
    ...book,
    positions: [
      ...book.positions.filter((x) => x.security_type !== "Future"),
      pos({ cusip: "SYNC00077", description: "Bond D (CUSIP only)", market_value_cad: 100 }),
    ],
  };
  const d = ref({
    nymbus_instrument_id: 7,
    cusip: "SYNC00077",
    latest_price: null,
    coupon_rate: 3,
    maturity_date: "2030-09-28",
  });
  const at = (o: Partial<{ ytm: number | null; dur: number | null }>) => ({
    date: AS_OF,
    rows: 1,
    byIsin: {},
    byCusip: { SYNC00077: { date: AS_OF, ytm: 4, dur: 3, index: "short_corp", cusip: "SYNC00077", ...o } },
  });
  const priced = (f: ReturnType<typeof at>) =>
    computeFundPortfolio(cusipOnly, [...refs, d], { short: "SEST", netAssets: 1000, ftse: f }).coverage.priced_weight;
  assert.equal(priced(at({})), round4(800 / 900), "A, B and D priced (C is unresolved)");
  assert.equal(priced(at({ ytm: null })), round4(700 / 900), "no yield: unpriced");
  assert.equal(priced(at({ dur: null })), round4(700 / 900), "no duration: unpriced");
  assert.equal(priced(at({ ytm: 40 })), round4(700 / 900), "yield out of range");
  assert.equal(priced(at({ dur: 55 })), round4(700 / 900), "duration out of range");
});
