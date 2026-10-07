/**
 * SYNTHETIC Apex holdings and instrument master (dataplatform /api/apex/holdings, /api/instruments/batch,
 * /api/instruments) for the website's own portfolio analytics (src/lib/pipeline/fund-portfolio.ts). No real security:
 * identifiers use the made-up "SY" country prefix and "SYN" CUSIPs.
 *
 *  - SEST, SEB: covered bond books (priced >= 90 %, resolved >= 95 % of the bond weight); SEB holds perpetual bonds
 *    (15 % of its bonds: no maturity, so not in the maturing bond universe) whose coupon and maturity are unknown, so
 *    those two characteristics stay below the 90 % coverage threshold. Month-end values close to the factsheet of the
 *    month (the cross-check passes).
 *  - Multistrat: equities, futures and a bond sleeve only 80 % resolved: below the thresholds (factsheet figures shown).
 */

export type Short = "SEST" | "SEB" | "Multistrat";

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface BondSpec {
  isin: string;
  cusip: string;
  name: string;
  issuer: string;
  sector: string;
  market: "CORP" | "GOVT" | "MUNI";
  weight: number;
  coupon: number;
  maturity: string | null;
  rating: string;
  duration: number;
  ytm: number;
  green: boolean | null;
  resolved: boolean;
  priced: boolean;
}

const SECTORS: Record<Short, [string, "CORP" | "GOVT" | "MUNI", number][]> = {
  SEST: [
    ["Financial", "CORP", 0.383],
    ["Government", "GOVT", 0.176],
    ["Energy", "CORP", 0.118],
    ["Utilities", "CORP", 0.093],
    ["Communications", "CORP", 0.087],
    ["Industrial", "CORP", 0.061],
    ["Consumer, Non-cyclical", "CORP", 0.04],
  ],
  SEB: [
    ["Government", "GOVT", 0.3],
    ["Financial", "CORP", 0.37],
    ["Utilities", "CORP", 0.12],
    ["Energy", "CORP", 0.1],
    ["Communications", "CORP", 0.08],
    ["Government", "MUNI", 0.029],
  ],
  Multistrat: [["Government", "GOVT", 0.3]],
};
const RATINGS = ["AAA", "AA+", "AA", "AA-", "A+", "A", "A-", "BBB+", "BBB", "BBB-"];
const PROFILE: Record<
  Short,
  { n: number; dur: [number, number]; mat: [number, number]; ytm: number; cash: number; ratingShift: number }
> = {
  SEST: { n: 28, dur: [0.4, 4.4], mat: [0.5, 4.2], ytm: 0.0418, cash: 0.042, ratingShift: 3 },
  SEB: { n: 30, dur: [1.5, 14.5], mat: [1.6, 15], ytm: 0.0433, cash: 0.041, ratingShift: 0 },
  Multistrat: { n: 10, dur: [1, 9], mat: [1, 11], ytm: 0.0375, cash: 0.1, ratingShift: 1 },
};

/** the bond book of a fund (weights of net assets, before the date's small drift) */
function bonds(short: Short): BondSpec[] {
  const rnd = mulberry32(short.length * 104729 + 17);
  const p = PROFILE[short];
  const out: BondSpec[] = [];
  const secs = SECTORS[short];
  const totalSec = secs.reduce((a, [, , w]) => a + w, 0);
  const bondWeight = short === "Multistrat" ? 0.3 : 1 - p.cash;
  let k = 0;
  for (const [sector, market, w] of secs) {
    const count = Math.max(1, Math.round((p.n * w) / totalSec));
    for (let i = 0; i < count; i++, k++) {
      const weight = (bondWeight * (w / totalSec)) / count;
      const mat = p.mat[0] + (p.mat[1] - p.mat[0]) * rnd();
      const year = 2026 + Math.floor(mat + 0.75);
      const month = 1 + Math.floor(rnd() * 12);
      const perpetual = short === "SEB" && sector === "Financial" && i < 4; // about 15 % of the SEB bonds
      const dur = Math.min(p.dur[1], Math.max(p.dur[0], mat * (0.86 + 0.08 * rnd())));
      const isin = `SY${{ SEST: "ST", SEB: "SB", Multistrat: "MS" }[short]}${String(100000 + k * 7919).slice(-6)}${k % 10}${(k * 3) % 10}`;
      out.push({
        isin,
        cusip: `SYN${String(k).padStart(5, "0")}${short.length}`,
        issuer: `Synthetic ${sector.split(",")[0]} Issuer ${k + 1}`,
        name: `Synthetic ${sector.split(",")[0]} ${(2 + rnd() * 3).toFixed(2)}% ${perpetual ? "perpetual" : year}`,
        sector,
        market,
        weight,
        coupon: Math.round((2.1 + 3.2 * rnd()) * 1000) / 1000,
        maturity: perpetual ? null : `${year}-${String(month).padStart(2, "0")}-15`,
        rating: RATINGS[Math.min(RATINGS.length - 1, Math.floor(rnd() * 6) + p.ratingShift)],
        duration: Math.round(dur * 100) / 100,
        ytm: Math.round((p.ytm + 0.006 * (rnd() - 0.5)) * 10000) / 100,
        green: short === "SEB" ? k % 4 === 0 : false,
        resolved: short !== "Multistrat" || k % 5 !== 0,
        priced: !(short === "SEST" && k === 5),
      });
    }
  }
  return out;
}

const NET_ASSETS: Record<Short, number> = { SEST: 212_000_000, SEB: 148_000_000, Multistrat: 61_000_000 };
/** the classes' Apex closing capital shares (they add up to the fund's net assets on every date) */
export const CLASS_SHARE: Record<string, number> = {
  LDM001: 0.5,
  LDM011: 0.04,
  LDM021: 0.1,
  LDM031: 0.08,
  LDM061: 0.1,
  LDM081: 0.18,
  LDM091: 0,
  LDM201: 0.5,
  LDM202: 0.2,
  LDM203: 0.1,
  LDM204: 0.06,
  LDM205: 0.09,
  LDM206: 0.05,
  LDM300: 0.25,
  LDM301: 0.45,
  LDM303: 0.1,
  LDM304: 0.08,
  LDM305: 0.12,
};
export const netAssetsOf = (short: Short, date: string): number =>
  NET_ASSETS[short] * (date === "2026-08-31" ? 0.99 : 1);

/** /api/apex/holdings answer of one fund on one day (positions + bank and broker balances) */
export function holdingsPayload(short: Short, date: string): unknown {
  const na = netAssetsOf(short, date);
  const drift = date === "2026-08-31" ? 1 : 1.004;
  const positions: Record<string, unknown>[] = bonds(short).map((b, i) => ({
    date: `${date}T00:00:00`,
    fund: `SYNTHETIC ${short}`,
    nav_type: "FINAL_NAV",
    bloomberg_id: null,
    isin: b.isin,
    cusip: b.cusip,
    sedol: null,
    security_id: `SEC-${b.cusip}`,
    description: b.name,
    security_type: "Bond",
    sector: null,
    country: i % 9 === 4 ? "United States" : "Canada",
    currency: "CAD",
    quantity: Math.round((b.weight * na) / 100),
    market_price: 100,
    market_value_local: Math.round(b.weight * na * drift),
    market_value_cad: Math.round(b.weight * na * drift),
    pct_of_total: null,
  }));
  if (short === "Multistrat") {
    for (let i = 0; i < 8; i++) {
      positions.push({
        date,
        fund: `SYNTHETIC ${short}`,
        nav_type: "FINAL_NAV",
        bloomberg_id: null,
        isin: `SYEQ${String(1000 + i)}00${i}`,
        cusip: null,
        sedol: null,
        security_id: `EQ-${i}`,
        description: `Synthetic Equity ${String.fromCharCode(65 + i)} Inc`,
        security_type: "Common Stock",
        sector: ["Technology", "Financial", "Health Care", "Industrial"][i % 4],
        country: i % 3 ? "United States" : "Canada",
        currency: "CAD",
        quantity: 1000,
        market_price: 50,
        market_value_local: Math.round(0.07 * na),
        market_value_cad: Math.round(0.07 * na),
        pct_of_total: null,
      });
    }
  }
  for (let i = 0; i < 2; i++)
    positions.push({
      date,
      fund: `SYNTHETIC ${short}`,
      nav_type: "FINAL_NAV",
      bloomberg_id: `BBGSYNFUT${i}0`,
      isin: null,
      cusip: null,
      sedol: null,
      security_id: `FUT-${i}`,
      description: `Synthetic Bond Future ${i + 1}`,
      security_type: "Future",
      sector: null,
      country: "Canada",
      currency: "CAD",
      quantity: -12 + i * 5,
      market_price: 101,
      market_value_local: 0,
      market_value_cad: 0,
      pct_of_total: null,
    });
  const cashW = PROFILE[short].cash;
  const cash = [
    {
      date,
      fund: `SYNTHETIC ${short}`,
      nav_type: "FINAL_NAV",
      currency: "CAD",
      glc_description: "BANK AND BROKER BALANCES - CAD",
      closing_bal_cad: Math.round(cashW * na * 0.8),
      closing_bal_local: Math.round(cashW * na * 0.8),
    },
    {
      date,
      fund: `SYNTHETIC ${short}`,
      nav_type: "FINAL_NAV",
      currency: "USD",
      glc_description: "BANK AND BROKER BALANCES - USD",
      closing_bal_cad: Math.round(cashW * na * 0.2),
      closing_bal_local: Math.round((cashW * na * 0.2) / 1.37),
    },
  ];
  return {
    fund: short,
    fund_key: short.toLowerCase(),
    fund_name: `SYNTHETIC ${short}`,
    fund_short_name: short,
    apex_account: "SYN",
    cibc_account: null,
    start_date: date,
    end_date: date,
    nav_type: "FINAL_NAV",
    positions_count: positions.length,
    cash_count: cash.length,
    unrealised_pl_count: 0,
    warnings: [],
    positions,
    cash,
    unrealised_pl: [],
  };
}

/** instrument master details (the /api/instruments/batch shape) and bond-universe rows (the /api/instruments shape) */
export function instrumentsPayload(): { details: Record<string, unknown>[]; universe: Record<string, unknown>[] } {
  const details: Record<string, unknown>[] = [];
  const universe: Record<string, unknown>[] = [];
  let id = 900_000;
  for (const short of ["SEST", "SEB", "Multistrat"] as Short[]) {
    for (const b of bonds(short)) {
      if (!b.resolved) continue;
      id++;
      const composite = details.length % 3 !== 0;
      details.push({
        nymbus_instrument_id: id,
        figi: null,
        isin: b.isin,
        cusip: b.cusip,
        sedol: null,
        ticker: null,
        name: b.name,
        description: b.name,
        currency: "CAD",
        asset_class: "BOND",
        security_type: "Corporate Bond",
        status: "active",
        reference: { is_green_bond: b.green, coupon_frequency: 2 },
        classification: { industry_sector: b.sector, country_of_risk: "CA", market_sector: b.market },
        ratings: composite
          ? [
              { agency: "composite", rating: b.rating, source: "bloomberg" },
              { agency: "sp", rating: "BBB", source: "bloomberg" },
            ]
          : [
              { agency: "sp", rating: b.rating, source: "bloomberg" },
              { agency: "dbrs", rating: "A (low)", source: "bloomberg" },
            ],
        latest_price: b.priced
          ? { price_date: "2026-09-28", modified_duration: b.duration, yield_to_maturity: b.ytm, source: "bloomberg" }
          : { price_date: "2026-08-14", modified_duration: b.duration, yield_to_maturity: b.ytm, source: "bloomberg" },
      });
      if (b.maturity)
        universe.push({
          nymbus_instrument_id: id,
          isin: b.isin,
          name: b.name,
          asset_class: "BOND",
          issuer: b.issuer,
          coupon_rate: b.coupon.toFixed(3),
          maturity_date: b.maturity,
          sector: b.sector,
          country_of_risk: "CA",
          market_sector: b.market,
          rating: b.rating,
          rating_agency: "composite",
        });
    }
  }
  // equities of the multi-strategy fund, and unrelated bonds of the universe (pages)
  for (let i = 0; i < 8; i++)
    details.push({
      nymbus_instrument_id: 800_000 + i,
      isin: `SYEQ${String(1000 + i)}00${i}`,
      cusip: null,
      figi: null,
      name: `Synthetic Equity ${String.fromCharCode(65 + i)} Inc`,
      asset_class: "EQUITY",
      security_type: "Common Stock",
      status: "active",
      reference: null,
      classification: { industry_sector: "Technology", country_of_risk: "US", market_sector: "EQUITY" },
      ratings: [],
      latest_price: { price_date: "2026-09-28", last_price: 50 },
    });
  for (let i = 0; i < 1200; i++)
    universe.push({
      nymbus_instrument_id: 100_000 + i,
      isin: `SYUN${String(i).padStart(8, "0")}`,
      name: `Synthetic universe bond ${i}`,
      asset_class: "BOND",
      issuer: "Synthetic",
      coupon_rate: "3.000",
      maturity_date: `${2027 + (i % 20)}-06-01`,
      sector: "Government",
      country_of_risk: "CA",
      market_sector: "GOVT",
      rating: "AA",
      rating_agency: "composite",
    });
  universe.sort((a, b) => (a.nymbus_instrument_id as number) - (b.nymbus_instrument_id as number));
  return { details, universe };
}
