/**
 * Daily portfolio analytics of one fund, computed by the website from dataplatform main-branch endpoints only
 * (Gabriel 2026-10-02, instead of the unmerged dataplatform PR #621 `/api/apex/fund-portfolio`):
 *   /api/apex/holdings        the fund's Apex FINAL_NAV positions and bank / broker balances of one valuation day
 *   /api/instruments/batch    instrument master match by ISIN / CUSIP / FIGI: asset class, ratings, green-bond flag,
 *                             Bloomberg classification, latest price (modified duration, yield to maturity)
 *   /api/instruments          the bond universe pages: coupon rate, maturity date, issuer (not in the batch detail)
 *   /api/performance/nav-timeseries   the classes' Apex closing capital (net assets, the weights' denominator)
 * The method is a port of PR #621 `fund_portfolio.py` (weights, characteristics and their coverage, breakdowns with a
 * cash row, top holdings, green-bond weight), so its output is the same `FundPortfolio` shape; the selection rules,
 * coverage thresholds and gates stay those of portfolio.ts / validate.ts. Differences from PR #621, by necessity:
 * the Apex accrual coupon and the Apex position rating are not served by the holdings endpoint (master coupon and
 * agency ratings only), and the price is the instrument's latest one (accepted within 7 days of the book date).
 * Pure, dependency-free.
 */
import type { FundPortfolio, HoldingsBook, HoldingsPosition, InstrumentRef, PortfolioHoldingRow, WeightRow } from "./raw.ts";

export const PRICE_MAX_AGE_DAYS = 7;
export const GREEN_UNKNOWN_LIMIT = 0.1;
const BOOK_GAP_WARNING = 0.05;
const MIN_WEIGHT = 1e-6;

const NOTCH_LABELS = ["AAA", "AA+", "AA", "AA-", "A+", "A", "A-", "BBB+", "BBB", "BBB-", "BB+", "BB", "BB-", "B+", "B", "B-", "CCC+", "CCC", "CCC-", "CC", "C", "D"] as const;
const RATING_GRADES = ["AAA", "AA", "A", "BBB", "BB", "B", "CCC", "CC", "C", "D"];
const TERM_BUCKETS = ["0-1", "1-3", "3-5", "5-7", "7-10", "10+"];
const NOT_RATED = "Not rated";
const UNKNOWN_TERM = "Unknown maturity";
const OTHER_ASSETS = "Other assets";
const CASH = "Cash";
const UNCLASSIFIED = "Unclassified";
const BOND_TYPES: Record<string, string> = { GOVT: "Government bonds", CORP: "Corporate bonds", MUNI: "Municipal bonds", MTGE: "Mortgage-backed bonds" };
const ASSET_TYPES: Record<string, string> = { EQUITY: "Equities", ETF_FUND: "Funds", PREFERRED: "Preferred shares" };
const DERIVATIVE_CLASSES = new Set(["FUTURE", "OPTION"]);
const DERIVATIVE_WORDS = ["future", "option", "forward", "swap"];
const BOND_WORDS = ["bond", "debenture", "note", "fixed income", "frn", "treasury", "bill"];
const FIGI = /^BBG[0-9A-Z]{9}$/;
const AGENCIES = ["sp", "moody", "fitch", "dbrs"];

export const METHOD = {
  source: "computed by the website from dataplatform /api/apex/holdings, /api/instruments/batch, /api/instruments (bond universe) and /api/performance/nav-timeseries (port of dataplatform PR #621 fund_portfolio.py)",
  weights: "market_value_cad / net assets (sum of the classes' Apex closing capital), signed",
  duration: "modified duration (instrument latest price), weighted by absolute market value over bond positions, renormalised over covered weight",
  yield: "yield to maturity (instrument latest price), same weighting",
  coupon: "coupon rate (instrument master), same weighting",
  rating: "composite rating, else the lowest of S&P / Moody's / Fitch / DBRS; notch-scored AAA=1…D=22, weighted mean notch rounded half up",
  prices_as_of: `instrument latest price, accepted within ${PRICE_MAX_AGE_DAYS} days of the book date (else unpriced)`,
};

/* ------------------------------------------------------------------ ratings (port of PR #621 _rating_notch / _notch) */

const NOTCH: Record<string, number> = Object.fromEntries(NOTCH_LABELS.map((l, i) => [l, i + 1]));
const MOODY_BASE: Record<string, string> = { AAA: "AAA", AA: "AA", A: "A", BAA: "BBB", BA: "BB", B: "B", CAA: "CCC", CA: "CC", C: "C" };
const MOODY_MOD: Record<string, string> = { "1": "+", "2": "", "3": "-" };
const DBRS = /^(AAA|AA|A|BBB|BB|B|CCC|CC|C|D)\s*\((HIGH|MIDDLE|MID|LOW)\)$/;
const DBRS_SHORT = /^(AA|A|BBB|BB|B|CCC)([HL])$/;
const SHORT_TERM = /^(R-[1-5]|A-[1-3]|P-[1-3]|F[1-3])/;
const MOODY = /^(AAA|AA|A|BAA|BA|B|CAA|CA|C)([123])?$/;
const LETTER = /^(AAA|AA|A|BBB|BB|B|CCC|CC|C|D|SD|RD)([+-])?$/;

const letterNotch = (base: string, mod: string): number => NOTCH[base + mod] ?? NOTCH[base];

/** Notch 1 (AAA) … 22 (D) for a long-term S&P/Fitch, Moody's or DBRS rating; null when unrated, short-term or unparseable. */
export function ratingNotch(raw: string | null | undefined): number | null {
  let t = (raw ?? "").toUpperCase().split(/\s+/).filter(Boolean).join(" ");
  t = t.replace(/^\(P\)/, "").trim();
  t = t.replace(/\s*\/\s*\*[+-]?$/, "");
  t = t.split("*")[0].trim();
  t = t.replace(/\s*\((SF|EXP|P)\)$/, "");
  t = t.replace(/([A-Z0-9)+-])\s*U$/, "$1");
  if (!t || SHORT_TERM.test(t)) return null;
  let m = DBRS.exec(t);
  if (m) return letterNotch(m[1], { HIGH: "+", MIDDLE: "", MID: "", LOW: "-" }[m[2]] ?? "");
  m = DBRS_SHORT.exec(t);
  if (m) return letterNotch(m[1], m[2] === "H" ? "+" : "-");
  m = MOODY.exec(t);
  if (m && (m[2] || ["BAA", "BA", "CAA", "CA"].includes(m[1]))) return letterNotch(MOODY_BASE[m[1]], MOODY_MOD[m[2] ?? "2"]);
  m = LETTER.exec(t);
  if (m) return letterNotch(m[1] === "SD" || m[1] === "RD" ? "D" : m[1], m[2] ?? "");
  return null;
}

/** Composite rating, else the lowest (highest notch) of the four agencies. */
export function instrumentNotch(ratings: InstrumentRef["ratings"]): number | null {
  const byAgency = new Map<string, string>();
  for (const r of ratings ?? []) {
    if (!r || typeof r.agency !== "string" || typeof r.rating !== "string") continue;
    const a = r.agency.toLowerCase();
    if (!byAgency.has(a) || r.source === "bloomberg") byAgency.set(a, r.rating);
  }
  const composite = ratingNotch(byAgency.get("composite"));
  if (composite !== null) return composite;
  const notches = AGENCIES.map((a) => ratingNotch(byAgency.get(a))).filter((n): n is number => n !== null);
  return notches.length ? Math.max(...notches) : null;
}

export const notchLabel = (n: number): string => NOTCH_LABELS[Math.min(Math.max(n, 1), NOTCH_LABELS.length) - 1];
const gradeOf = (n: number): string => notchLabel(n).replace(/[+-]$/, "");

/* ------------------------------------------------------------------ securities */

interface Security {
  key: string;
  isin: string | null;
  cusip: string | null;
  bloombergId: string | null;
  description: string | null;
  apexType: string | null;
  sector: string | null;
  country: string | null;
  quantity: number;
  mv: number | null;
  ref: InstrumentRef | null;
  kind: "bond" | "derivative" | "other";
  notch: number | null;
  coupon: number | null;
  maturity: string | null;
  years: number | null;
  duration: number | null;
  ytm: number | null;
  priced: boolean;
  green: boolean | null;
  assetType: string;
  name: string;
}

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
const num = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : Number.NaN;
  return Number.isFinite(n) ? n : null;
};
const DAY = 86_400_000;
const days = (a: string, b: string): number => (Date.parse(`${b.slice(0, 10)}T00:00:00Z`) - Date.parse(`${a.slice(0, 10)}T00:00:00Z`)) / DAY;
const sample = (keys: string[], limit = 10): string => `${keys.slice(0, limit).join(", ")}${keys.length > limit ? ` … (+${keys.length - limit})` : ""}`;

/** One row per security (lots summed in CAD), like PR #621 `_securities`. */
function securities(positions: HoldingsPosition[], warnings: string[]): Security[] {
  const book = new Map<string, Security & { missing: boolean }>();
  let noKey = 0;
  for (const p of positions) {
    const key = [p.security_id, p.bloomberg_id, p.isin, p.cusip, p.sedol, p.description].map(str).find((x) => x);
    if (!key) { noKey++; continue; }
    const s = book.get(key) ?? {
      key, isin: null, cusip: null, bloombergId: null, description: null, apexType: null, sector: null, country: null, quantity: 0, mv: 0, missing: false,
      ref: null, kind: "other" as const, notch: null, coupon: null, maturity: null, years: null, duration: null, ytm: null, priced: false, green: null, assetType: OTHER_ASSETS, name: key,
    };
    s.isin ??= str(p.isin)?.toUpperCase() ?? null;
    s.cusip ??= str(p.cusip)?.toUpperCase() ?? null;
    s.bloombergId ??= str(p.bloomberg_id)?.toUpperCase() ?? null;
    s.description ??= str(p.description);
    s.apexType ??= str(p.security_type);
    s.sector ??= str(p.sector);
    s.country ??= str(p.country);
    const q = num(p.quantity);
    if (q !== null) s.quantity += q;
    const v = num(p.market_value_cad);
    if (v === null) s.missing = true;
    else s.mv = (s.mv ?? 0) + v;
    book.set(key, s);
  }
  if (noKey) warnings.push(`${noKey} position line(s) without any identifier or description skipped`);
  const out: Security[] = [];
  const missing: string[] = [];
  for (const s of book.values()) {
    if (s.missing) { s.mv = null; missing.push(s.key); }
    const { missing: _m, ...rest } = s; // eslint-disable-line @typescript-eslint/no-unused-vars
    out.push(rest);
  }
  if (missing.length) warnings.push(`${missing.length} position(s) without a CAD market value, excluded from weights: ${sample(missing)}`);
  return out;
}

/** Index of the instrument references by identifier; an identifier shared by two instruments is ambiguous (not used). */
export function refIndex(refs: InstrumentRef[]): { isin: Map<string, InstrumentRef | null>; cusip: Map<string, InstrumentRef | null>; figi: Map<string, InstrumentRef | null> } {
  const idx = { isin: new Map<string, InstrumentRef | null>(), cusip: new Map<string, InstrumentRef | null>(), figi: new Map<string, InstrumentRef | null>() };
  for (const r of refs) {
    for (const k of ["isin", "cusip", "figi"] as const) {
      const v = str(r[k])?.toUpperCase();
      if (!v) continue;
      const m = idx[k];
      const cur = m.get(v);
      m.set(v, cur === undefined || cur?.nymbus_instrument_id === r.nymbus_instrument_id ? r : null);
    }
  }
  return idx;
}

function resolve(s: Security, idx: ReturnType<typeof refIndex>): { ref: InstrumentRef | null; ambiguous: boolean } {
  const tries: [keyof typeof idx, string | null][] = [["isin", s.isin], ["cusip", s.cusip], ["figi", s.bloombergId && FIGI.test(s.bloombergId) ? s.bloombergId : null]];
  for (const [k, v] of tries) {
    if (!v || !idx[k].has(v)) continue;
    const r = idx[k].get(v)!;
    return r ? { ref: r, ambiguous: false } : { ref: null, ambiguous: true };
  }
  return { ref: null, ambiguous: false };
}

function enrich(list: Security[], refs: InstrumentRef[], asOf: string, warnings: string[]): void {
  const idx = refIndex(refs);
  const ambiguous: string[] = [];
  const stale: string[] = [];
  const matured: string[] = [];
  for (const s of list) {
    const { ref, ambiguous: amb } = resolve(s, idx);
    if (amb) ambiguous.push(s.key);
    s.ref = ref;
    const assetClass = (ref?.asset_class ?? "").toUpperCase();
    const text = (s.apexType ?? "").toLowerCase();
    s.kind = DERIVATIVE_CLASSES.has(assetClass) || (!assetClass && DERIVATIVE_WORDS.some((w) => text.includes(w))) ? "derivative"
      : assetClass === "BOND" || (!assetClass && BOND_WORDS.some((w) => text.includes(w))) ? "bond" : "other";
    const cls = ref?.classification ?? null;
    s.name = s.description ?? str(ref?.name) ?? s.key;
    s.sector = s.sector ?? str(cls?.industry_sector) ?? str(ref?.sector);
    s.country = s.country ?? str(cls?.country_of_risk) ?? str(ref?.country_of_risk);
    const market = (str(cls?.market_sector) ?? str(ref?.market_sector) ?? "").toUpperCase();
    s.assetType = s.kind === "bond" ? BOND_TYPES[market] ?? "Bonds (unclassified)" : ASSET_TYPES[assetClass] ?? s.apexType ?? OTHER_ASSETS;
    s.notch = ref ? instrumentNotch(ref.ratings) : null;
    const green = ref?.reference?.is_green_bond;
    s.green = typeof green === "boolean" ? green : null;
    const coupon = num(ref?.coupon_rate);
    s.coupon = coupon !== null ? coupon / 100 : null;
    s.maturity = str(ref?.maturity_date)?.slice(0, 10) ?? null;
    s.years = s.maturity ? days(asOf, s.maturity) / 365.25 : null;
    if (s.years !== null && s.years < 0) {
      matured.push(s.key);
      s.years = null;
    }
    const price = ref?.latest_price ?? null;
    const pd = str(price?.price_date);
    s.priced = !!pd && Math.abs(days(pd, asOf)) <= PRICE_MAX_AGE_DAYS;
    if (pd && !s.priced && s.kind === "bond") stale.push(s.key);
    const ytm = s.priced ? num(price?.yield_to_maturity) : null;
    s.duration = s.priced ? num(price?.modified_duration) : null;
    s.ytm = ytm !== null ? ytm / 100 : null;
  }
  const zero = new Set(list.filter((s) => s.mv === 0).map((s) => s.key));
  const report = (keys: string[], what: string) => {
    const k = keys.filter((x) => !zero.has(x));
    if (k.length) warnings.push(`${k.length} ${what}: ${sample(k)}`);
  };
  report(ambiguous, "position(s) with an ambiguous identifier left unresolved");
  report(matured, "bond(s) held past their maturity date, left without a term");
  report(stale, `bond price(s) more than ${PRICE_MAX_AGE_DAYS} days from the book date, treated as unpriced`);
}

/* ------------------------------------------------------------------ aggregates */

function weightedMean(pairs: [number, number | null][]): { value: number | null; coverage: number | null } {
  const total = pairs.reduce((a, [w]) => a + Math.abs(w), 0);
  const known = pairs.filter(([, v]) => v !== null).map(([w, v]) => [Math.abs(w), v as number] as const);
  const kw = known.reduce((a, [w]) => a + w, 0);
  const coverage = total ? kw / total : null;
  if (kw < MIN_WEIGHT) return { value: null, coverage };
  return { value: known.reduce((a, [w, v]) => a + w * v, 0) / kw, coverage };
}

const round = (x: number, d: number): number => Math.round(x * 10 ** d) / 10 ** d;

function share(bonds: Security[], pred: (b: Security) => boolean, dflt: number | null = null): number | null {
  const total = bonds.reduce((a, b) => a + Math.abs(b.mv as number), 0);
  if (!total) return dflt;
  return round(bonds.filter(pred).reduce((a, b) => a + Math.abs(b.mv as number), 0) / total, 4);
}

function breakdown(items: [string, number, number][], denominator: number, order?: string[]): WeightRow[] {
  const groups = new Map<string, [number, number]>();
  for (const [label, v, c] of items) {
    const g = groups.get(label) ?? [0, 0];
    groups.set(label, [g[0] + v, g[1] + c]);
  }
  const rows = [...groups].map(([label, [v, c]]) => ({ label, weight: round(v / denominator, 4), count: c }));
  if (!order) return rows.sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label));
  const rank = (l: string): number => (order.includes(l) ? order.indexOf(l) : order.length);
  return rows.sort((a, b) => rank(a.label) - rank(b.label) || a.label.localeCompare(b.label));
}

const termBucket = (years: number): string => (years < 1 ? "0-1" : years < 3 ? "1-3" : years < 5 ? "3-5" : years < 7 ? "5-7" : years < 10 ? "7-10" : "10+");

export interface ComputeOptions {
  /** fund short name (payload identity) */
  short: string;
  /** sum of the classes' Apex closing capital on the book date (CAD), or null */
  netAssets: number | null;
  top?: number;
}

/** One fund's book as portfolio analytics (the `FundPortfolio` shape of portfolio.ts). */
export function computeFundPortfolio(book: HoldingsBook, refs: InstrumentRef[], o: ComputeOptions): FundPortfolio {
  const warnings = [...book.warnings.slice(0, 5)];
  const asOf = book.date;
  const list = securities(book.positions, warnings);
  enrich(list, refs, asOf, warnings);
  const cashValues = book.cash.map((c) => num(c.closing_bal_cad));
  const cash = !book.cash.length ? null : cashValues.some((v) => v === null) ? null : (cashValues as number[]).reduce((a, b) => a + b, 0);
  const cashLines = cash === null ? 0 : (cashValues as number[]).filter((v) => v !== 0).length;
  if (!book.cash.length) warnings.push("no bank and broker balance lines on the book date: cash weight unavailable");
  else if (cash === null) warnings.push("a bank and broker balance has no CAD value: cash weight unavailable");
  const derivatives = list.filter((s) => s.kind === "derivative" && (s.mv !== 0 || s.quantity !== 0));
  const lines = list.filter((s) => s.kind !== "derivative" && s.mv !== 0);
  const held = lines.filter((s) => s.mv !== null);
  const positionsPlusCash = held.reduce((a, s) => a + (s.mv as number), 0) + (cash ?? 0);
  let denominator: number;
  let denominatorName: string;
  if (o.netAssets !== null && o.netAssets > 0) {
    denominator = o.netAssets;
    denominatorName = "net_assets_cad";
    if (cash !== null && Math.abs(positionsPlusCash / o.netAssets - 1) > BOOK_GAP_WARNING) warnings.push(`positions plus cash are ${(100 * positionsPlusCash / o.netAssets).toFixed(1)}% of net assets`);
  } else {
    denominator = positionsPlusCash;
    denominatorName = "positions_plus_cash";
    warnings.push("net assets unavailable: weights use position values plus cash as the denominator");
  }
  if (!(denominator > 0)) throw new Error(`the book of ${o.short} on ${asOf} has no positive net assets and no positive positions plus cash`);
  const bonds = held.filter((s) => s.kind === "bond");
  for (const [flag, label] of [["resolved", "not resolved to the instrument master"], ["priced", "without a current price"]] as const) {
    const missing = bonds.filter((b) => (flag === "resolved" ? !b.ref : !b.priced));
    if (missing.length) warnings.push(`${missing.length} bond position(s) (${(100 * missing.reduce((a, b) => a + (b.mv as number), 0) / denominator).toFixed(1)}% of the denominator) ${label}: ${sample(missing.map((b) => b.isin ?? b.key))}`);
  }
  const measure = (field: "duration" | "ytm" | "coupon" | "years", digits: number) => {
    const m = weightedMean(bonds.map((b) => [b.mv as number, b[field]]));
    return m.value === null ? undefined : { value: round(m.value, digits), coverage: m.coverage === null ? null : round(m.coverage, 4) };
  };
  const notch = weightedMean(bonds.map((b) => [b.mv as number, b.notch]));
  const characteristics: FundPortfolio["characteristics"] = {};
  const put = <K extends keyof FundPortfolio["characteristics"]>(k: K, v: FundPortfolio["characteristics"][K] | undefined) => { if (v) characteristics[k] = v; };
  put("modified_duration", measure("duration", 2));
  put("yield_to_maturity", measure("ytm", 4));
  put("coupon", measure("coupon", 4));
  put("average_maturity", measure("years", 2));
  if (notch.value !== null) characteristics.average_rating = { value: notchLabel(Math.floor(notch.value + 0.5)), coverage: notch.coverage === null ? null : round(notch.coverage, 4) };

  const cashItems: [string, number, number][] = cash !== null && cashLines ? [[CASH, cash, cashLines]] : [];
  const items = (labelOf: (s: Security) => string): [string, number, number][] => [...held.map((s) => [labelOf(s), s.mv as number, 1] as [string, number, number]), ...cashItems];
  const tail = [OTHER_ASSETS, CASH];
  const breakdowns: FundPortfolio["breakdowns"] = {
    sector: breakdown(items((s) => s.sector ?? UNCLASSIFIED), denominator),
    rating: breakdown(items((s) => (s.kind !== "bond" ? OTHER_ASSETS : s.notch !== null ? gradeOf(s.notch) : NOT_RATED)), denominator, [...RATING_GRADES, NOT_RATED, ...tail]),
    term: breakdown(items((s) => (s.kind !== "bond" ? OTHER_ASSETS : s.years !== null ? termBucket(s.years) : UNKNOWN_TERM)), denominator, [...TERM_BUCKETS, UNKNOWN_TERM, ...tail]),
    country: breakdown(items((s) => s.country ?? UNCLASSIFIED), denominator),
    asset_type: breakdown(items((s) => s.assetType), denominator),
  };
  const top: PortfolioHoldingRow[] = [...held].sort((a, b) => (b.mv as number) - (a.mv as number) || a.name.localeCompare(b.name)).slice(0, o.top ?? 10).map((s) => ({
    name: s.name, issuer: str(s.ref?.issuer), weight: round((s.mv as number) / denominator, 4), coupon: s.coupon !== null ? round(s.coupon, 4) : null,
    maturity: s.maturity, rating: s.notch !== null ? notchLabel(s.notch) : null, sector: s.sector, green_bond: s.green,
  }));
  const unknownGreen = share(bonds, (b) => b.green === null, 1) as number;
  const green = unknownGreen > GREEN_UNKNOWN_LIMIT ? null : round(bonds.filter((b) => b.green).reduce((a, b) => a + (b.mv as number), 0) / denominator, 4);
  const others = held.filter((s) => s.kind === "other");
  return {
    fund: o.short,
    as_of: asOf,
    currency: "CAD",
    net_assets_cad: o.netAssets !== null ? round(o.netAssets, 2) : null,
    totals: {
      holdings_count: lines.length,
      bonds_count: lines.filter((s) => s.kind === "bond").length,
      cash_weight: cash !== null ? round(cash / denominator, 4) : null,
      derivatives_count: derivatives.length,
      other_weight: round(others.reduce((a, s) => a + (s.mv as number), 0) / denominator, 4),
    },
    characteristics,
    breakdowns,
    top_holdings: top,
    green_bonds_weight: green,
    coverage: { resolved_weight: share(bonds, (b) => !!b.ref), priced_weight: share(bonds, (b) => b.priced) },
    method: { ...METHOD, denominator: denominatorName },
    warnings,
    notes: [],
  };
}
