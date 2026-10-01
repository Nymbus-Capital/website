/**
 * Parsing of the factsheet archives (factsheet-generator `bonds_data_YYYY-MM.json` /
 * `factsheet_data_YYYY-MM.json`). Values there are formatted strings produced by
 * `convert_to_percent_str`: "4.82%", "7.2", "+2.1%", "−0.6%" (unicode minus), "nan", "", NaN, or raw
 * numbers. Pure and dependency-free.
 */
import type { Bucket, Characteristic, Holding, L10n, MonthlyPoint, PeriodMap } from "../data/types.ts";
import { monthEnd } from "./metrics.ts";

type Json = unknown;
export type Obj = Record<string, Json>;
export const isObj = (v: Json): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Parse a formatted number. Returns null for anything that is not a clean number: "nan", "", "n/a",
 * "-", null/undefined, NaN, Infinity, or text with other characters. Accepts a leading +/−/-/–, a
 * trailing %, thousands separators (",", thin/non-breaking spaces) and a decimal comma when no dot is
 * present ("4,8").
 */
export function parseNumber(v: Json): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  let t = v.trim().replace(/[−–‒—]/g, "-").replace(/[\s  ]/g, "");
  if (t.endsWith("%")) t = t.slice(0, -1);
  if (!t || /^(nan|none|null|n\/a|na|-)$/i.test(t)) return null;
  if (/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) t = t.replace(/,/g, "");
  else if (/^[+-]?\d+,\d+$/.test(t)) t = t.replace(",", ".");
  if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n + 0 : null; // "+ 0" turns "-0.0" into 0
}

/** "4.82%" / "4.82" (percent units) -> 0.0482. */
export function parsePct(v: Json): number | null {
  const n = parseNumber(v);
  // toPrecision hides binary noise (0.9 / 100 = 0.009000000000000001)
  return n === null ? null : Number((n / 100).toPrecision(12));
}

/** Number of decimals as published ("4.8%" -> 1), used for rounding tolerances. */
export function decimals(v: Json): number | null {
  if (typeof v !== "string") return null;
  const m = v.trim().match(/\.(\d+)/);
  return m ? m[1].length : 0;
}

/** Text value ("A", "AA-"), null for blanks / nan. */
export function parseText(v: Json): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return !t || /^(nan|none|null|n\/a)$/i.test(t) ? null : t;
}

/* ------------------------------------------------------------------ characteristics */

export interface CharSpec { id: string; source: string; label: L10n; unit: Characteristic["unit"] }

/** Bond fund characteristics (bonds_data "Characteristics"), in display order. */
export const BOND_CHARACTERISTICS: CharSpec[] = [
  { id: "portfolioYield", source: "Portfolio Yield", label: { en: "Portfolio yield", fr: "Rendement du portefeuille" }, unit: "pct" },
  { id: "currentYield", source: "Current Yield", label: { en: "Current yield", fr: "Rendement courant" }, unit: "pct" },
  { id: "duration", source: "Duration", label: { en: "Duration (years)", fr: "Durée (années)" }, unit: "num" },
  { id: "creditQuality", source: "Credit Quality", label: { en: "Average credit quality", fr: "Qualité de crédit moyenne" }, unit: "text" },
  { id: "investmentGrade", source: "% of Portfolio Rated Investment Grade", label: { en: "Rated investment grade", fr: "Cotée de première qualité" }, unit: "pct" },
  { id: "numberOfSecurities", source: "Number of Securities", label: { en: "Number of securities", fr: "Nombre de titres" }, unit: "int" },
  { id: "probabilityOfDefault5y", source: "Probability of Defaults (5Y)", label: { en: "Probability of default (5Y)", fr: "Probabilité de défaut (5 ans)" }, unit: "pct" },
];

export const ESG_METRICS: CharSpec[] = [
  { id: "spGlobalEsgRank", source: "S&P Global ESG Rank", label: { en: "S&P Global ESG rank", fr: "Rang ESG S&P Global" }, unit: "num" },
  { id: "carbonIntensity", source: "Carbon Intensity", label: { en: "Carbon intensity", fr: "Intensité carbone" }, unit: "num" },
  { id: "waterIntensity", source: "Water Intensity", label: { en: "Water intensity", fr: "Intensité hydrique" }, unit: "num" },
  { id: "boardIndependence", source: "Board Independence", label: { en: "Board independence", fr: "Indépendance du conseil" }, unit: "pct" },
  { id: "boardDiversity", source: "Board Diversity", label: { en: "Board diversity", fr: "Diversité du conseil" }, unit: "pct" },
];

/** Multistrategy "Characteristics" (flat {field: string}). */
export const MULTISTRAT_CHARACTERISTICS: CharSpec[] = [
  { id: "dividendYield", source: "Dividend Yield", label: { en: "Dividend yield", fr: "Rendement en dividendes" }, unit: "pct" },
  { id: "priceEarnings", source: "Price/Earnings Ratio", label: { en: "Price/earnings ratio", fr: "Ratio cours/bénéfice" }, unit: "num" },
  { id: "numberOfEquityHoldings", source: "Number of Equity Holdings", label: { en: "Number of equity holdings", fr: "Nombre de titres de capitaux propres" }, unit: "int" },
  { id: "numberOfHoldings", source: "Number of Holdings", label: { en: "Number of holdings", fr: "Nombre de titres" }, unit: "int" },
  { id: "largestEquitySector", source: "Largest Equity Sector Exposure", label: { en: "Largest equity sector exposure", fr: "Exposition sectorielle la plus importante" }, unit: "pct" },
];

function convert(v: Json, unit: Characteristic["unit"]): number | string | null {
  if (unit === "text") return parseText(v);
  if (unit === "pct") return parsePct(v);
  const n = parseNumber(v);
  if (n === null) return null;
  return unit === "int" ? Math.round(n) : n;
}

/** {field: {"Fund","Index","+/-"}} -> Characteristic[] (fields absent or blank on the fund side are skipped). */
export function parseCharacteristicTable(table: Json, specs: CharSpec[]): Characteristic[] {
  if (!isObj(table)) return [];
  const out: Characteristic[] = [];
  for (const s of specs) {
    const row = table[s.source];
    if (!isObj(row)) continue;
    const fund = convert(row["Fund"], s.unit);
    if (fund === null) continue;
    const c: Characteristic = { id: s.id, label: s.label, fund, unit: s.unit };
    const idx = convert(row["Index"], s.unit);
    if (idx !== null) c.index = idx;
    out.push(c);
  }
  return out;
}

/** Flat {field: value} (Multistrategy) -> Characteristic[]. */
export function parseFlatCharacteristics(table: Json, specs: CharSpec[]): Characteristic[] {
  if (!isObj(table)) return [];
  const out: Characteristic[] = [];
  for (const s of specs) {
    const fund = convert(table[s.source], s.unit);
    if (fund !== null) out.push({ id: s.id, label: s.label, fund, unit: s.unit });
  }
  return out;
}

/* ------------------------------------------------------------------ breakdowns & holdings */

/**
 * {"Nymbus": {bucket: "x%"}, "Index": {...}, "Nymbus vs Index": {...}} -> Bucket[] (fund order, then
 * index-only buckets). Buckets with no fund and no index weight are dropped. With `fundOnly`, a flat
 * {bucket: "x%"} is also accepted.
 */
export function parseBuckets(section: Json): Bucket[] {
  if (!isObj(section)) return [];
  const fundCol = section["Nymbus"] ?? section["Fund"];
  const idxCol = section["Index"];
  if (!isObj(fundCol) && !isObj(idxCol)) {
    // flat {label: value}
    const out: Bucket[] = [];
    for (const [label, v] of Object.entries(section)) {
      const f = parsePct(v);
      if (f !== null) out.push({ label, fund: f });
    }
    return out;
  }
  const labels: string[] = [];
  for (const col of [fundCol, idxCol]) if (isObj(col)) for (const k of Object.keys(col)) if (!labels.includes(k)) labels.push(k);
  const out: Bucket[] = [];
  for (const label of labels) {
    const f = isObj(fundCol) ? parsePct(fundCol[label]) : null;
    const i = isObj(idxCol) ? parsePct(idxCol[label]) : null;
    if (f === null && i === null) continue;
    const b: Bucket = { label, fund: f };
    if (isObj(idxCol)) b.index = i;
    out.push(b);
  }
  return out;
}

/**
 * Top holdings: {"1": {"Name", "Market Value %"}, ...} (optionally wrapped in {"Nymbus": ...}); the
 * weight may be "3.2%", "3.2" (percent units) or a number (percent units). Sorted by rank.
 */
export function parseHoldings(section: Json): Holding[] {
  if (!isObj(section)) return [];
  const body = isObj(section["Nymbus"]) ? section["Nymbus"] : section;
  if (!isObj(body)) return [];
  const rows = Object.entries(body)
    .filter(([, v]) => isObj(v))
    .sort(([a], [b]) => (parseNumber(a) ?? 1e9) - (parseNumber(b) ?? 1e9));
  const out: Holding[] = [];
  for (const [, v] of rows) {
    const r = v as Obj;
    const name = parseText(r["Name"]);
    const w = parsePct(r["Market Value %"] ?? r["Instrument Exposure %"]);
    if (name && w !== null) out.push({ name, weight: w });
  }
  return out;
}

/**
 * "Systematic Strategies Allocation" {date: {EQUITIES, BONDS, CURRENCIES, COMMODITIES}} -> buckets
 * averaged over the dates present (the factsheet shows the trailing 3 months, weekly).
 */
export function parseAllocationSeries(section: Json): { buckets: Bucket[]; from: string; to: string } | null {
  if (!isObj(section)) return null;
  const dates = Object.keys(section).filter((d) => isObj(section[d])).sort();
  if (!dates.length) return null;
  const labels: Record<string, string> = { EQUITIES: "Equities", BONDS: "Bonds", CURRENCIES: "Currencies", COMMODITIES: "Commodities" };
  const acc: Record<string, { s: number; n: number }> = {};
  for (const d of dates) {
    for (const [k, v] of Object.entries(section[d] as Obj)) {
      const x = parsePct(v);
      if (x === null) continue;
      acc[k] ??= { s: 0, n: 0 };
      acc[k].s += x;
      acc[k].n += 1;
    }
  }
  const buckets = Object.entries(acc).map(([k, { s, n }]) => ({ label: labels[k] ?? k, fund: s / n }));
  return buckets.length ? { buckets, from: dates[0], to: dates[dates.length - 1] } : null;
}

/* ------------------------------------------------------------------ performance tables */

/** {"1M": "0.4%", "2026": "3.1%", ...} -> PeriodMap (the current-year label maps to YTD). */
export function parsePeriodMap(d: Json, ytdYear: string): PeriodMap {
  const out: PeriodMap = {};
  if (!isObj(d)) return out;
  const allowed = new Set(["1M", "3M", "YTD", "1Y", "2Y", "3Y", "5Y", "10Y", "SI"]);
  for (const [k, v] of Object.entries(d)) {
    const key = k === ytdYear ? "YTD" : k;
    if (!allowed.has(key)) continue;
    out[key as keyof PeriodMap] = parsePct(v);
  }
  return out;
}

export type PeriodDecimals = Partial<Record<keyof PeriodMap, number>>;

export interface TrailingTable {
  fund: PeriodMap; index?: PeriodMap; va?: PeriodMap; fundName?: string; indexName?: string;
  /** published decimals (percent units) per period, for rounding tolerances */
  decimals: { fund: PeriodDecimals; index: PeriodDecimals; va: PeriodDecimals };
}

/** decimals of each published period value (current-year label maps to YTD) */
export function periodDecimals(d: Json, ytdYear: string): PeriodDecimals {
  const out: PeriodDecimals = {};
  if (!isObj(d)) return out;
  for (const [k, v] of Object.entries(d)) {
    const key = (k === ytdYear ? "YTD" : k) as keyof PeriodMap;
    const n = decimals(v);
    if (n !== null && parsePct(v) !== null) out[key] = n;
  }
  return out;
}

/**
 * "Trailing Returns Net|Gross": either nested {<fund>: {...}, <index>: {...}, "Value Added": {...}}
 * (bonds_data) or flat {period: "x.x"} (factsheet_data strategies).
 */
export function parseTrailingTable(section: Json, ytdYear: string): TrailingTable | null {
  if (!isObj(section) || !Object.keys(section).length) return null;
  const vals = Object.values(section);
  if (!isObj(vals[0])) return { fund: parsePeriodMap(section, ytdYear), decimals: { fund: periodDecimals(section, ytdYear), index: {}, va: {} } };
  const names = Object.keys(section).filter((k) => k !== "Value Added" && isObj(section[k]));
  const out: TrailingTable = { fund: parsePeriodMap(section[names[0]], ytdYear), fundName: names[0], decimals: { fund: periodDecimals(section[names[0]], ytdYear), index: {}, va: {} } };
  if (names[1]) {
    out.index = parsePeriodMap(section[names[1]], ytdYear);
    out.indexName = names[1];
    out.decimals.index = periodDecimals(section[names[1]], ytdYear);
  }
  if (isObj(section["Value Added"])) {
    out.va = parsePeriodMap(section["Value Added"], ytdYear);
    out.decimals.va = periodDecimals(section["Value Added"], ytdYear);
  }
  return out;
}

/**
 * "Monthly Returns Net|Gross" {year: {"01-Jan": "x.x%", ..., "YTD": ...}} -> monthly points (sorted).
 * Month labels are "MM-Mon" (the MM prefix is authoritative). Blank / nan cells are skipped.
 */
export function parseMonthlyTable(section: Json): { points: MonthlyPoint[]; decimals: Record<string, number> } {
  const points: MonthlyPoint[] = [];
  const dec: Record<string, number> = {};
  if (!isObj(section)) return { points, decimals: dec };
  for (const [year, row] of Object.entries(section)) {
    if (!/^\d{4}$/.test(year) || !isObj(row)) continue;
    for (const [lab, txt] of Object.entries(row)) {
      const m = lab.match(/^(\d{2})/);
      if (!m) continue; // YTD and other columns
      const mm = Number(m[1]);
      if (mm < 1 || mm > 12) continue;
      const r = parsePct(txt);
      if (r === null) continue;
      const key = monthEnd(Number(year), mm);
      points.push({ month: key, r });
      dec[key] = decimals(txt) ?? 6;
    }
  }
  points.sort((a, b) => (a.month < b.month ? -1 : 1));
  return { points, decimals: dec };
}

/**
 * "Calendar Performance Net": nested {<fund>: {year: "x%"}, <index>: {...}, "Value Added": {...}} or
 * flat {year: "x.x"}. Returns year -> {fund, index, va}.
 */
export function parseCalendarTable(section: Json): Record<string, { fund: number | null; index?: number | null; va?: number | null }> {
  const out: Record<string, { fund: number | null; index?: number | null; va?: number | null }> = {};
  if (!isObj(section)) return out;
  const vals = Object.values(section);
  if (vals.length && !isObj(vals[0])) {
    for (const [y, v] of Object.entries(section)) if (/^\d{4}$/.test(y)) out[y] = { fund: parsePct(v) };
    return out;
  }
  const names = Object.keys(section).filter((k) => k !== "Value Added");
  const f = section[names[0]];
  const i = names[1] ? section[names[1]] : undefined;
  const va = section["Value Added"];
  const years = new Set<string>();
  for (const c of [f, i, va]) if (isObj(c)) for (const y of Object.keys(c)) if (/^\d{4}$/.test(y)) years.add(y);
  for (const y of [...years].sort()) {
    out[y] = { fund: isObj(f) ? parsePct(f[y]) : null };
    if (isObj(i)) out[y].index = parsePct(i[y]);
    if (isObj(va)) out[y].va = parsePct(va[y]);
  }
  return out;
}

export interface PublishedStatistics {
  annReturn: number | null; annVol: number | null; downsideDev: number | null; sharpe: number | null;
  sortino: number | null; positiveMonths: number | null; maxDrawdown: number | null;
  /** published decimals (display units) of each value present */
  decimals: Partial<Record<"annReturn" | "annVol" | "downsideDev" | "sharpe" | "sortino" | "positiveMonths" | "maxDrawdown", number>>;
}

const STAT_FIELDS = [
  ["annReturn", "Annualized Returns", "pct"], ["annVol", "Annualized St. Dev.", "pct"], ["downsideDev", "Annualized Downside Dev.", "pct"],
  ["sharpe", "Sharpe Ratio", "num"], ["sortino", "Sortino Ratio", "num"], ["positiveMonths", "% Positive Months", "pct"], ["maxDrawdown", "Max Drawdown", "pct"],
] as const;

/** "Statistics Net|Gross" dict -> numbers (percent strings as decimals, ratios as numbers) + published decimals. */
export function parseStatistics(section: Json): PublishedStatistics | null {
  if (!isObj(section)) return null;
  const out: PublishedStatistics = { annReturn: null, annVol: null, downsideDev: null, sharpe: null, sortino: null, positiveMonths: null, maxDrawdown: null, decimals: {} };
  for (const [k, label, unit] of STAT_FIELDS) {
    const raw = section[label];
    const v = unit === "pct" ? parsePct(raw) : parseNumber(raw);
    out[k] = v;
    const d = decimals(raw);
    if (v !== null && d !== null) out.decimals[k] = d;
  }
  return out;
}

/** the factsheet table of fund monthly returns (bonds: "Monthly Returns: Nymbus <X> Net"; strategies: "Monthly Returns Net") */
export function fundMonthlyTableKey(block: Obj, basis: "Net" | "Gross"): string | null {
  if (isObj(block[`Monthly Returns ${basis}`])) return `Monthly Returns ${basis}`;
  return Object.keys(block).find((k) => k.startsWith("Monthly Returns: Nymbus ") && k.endsWith(` ${basis}`) && isObj(block[k])) ?? null;
}

/** the factsheet table of index monthly returns ("Monthly Returns: <index name>") */
export function indexMonthlyTableKey(block: Obj, indexName?: string): string | null {
  if (indexName && isObj(block[`Monthly Returns: ${indexName}`])) return `Monthly Returns: ${indexName}`;
  return Object.keys(block).find((k) => k.startsWith("Monthly Returns: ") && !k.startsWith("Monthly Returns: Nymbus ") && isObj(block[k])) ?? null;
}
