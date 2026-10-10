/**
 * Tolerant parsers of the two dataplatform fund-data contracts (docs: fund-data contract, sections A and B):
 * `/api/apex/fund-portfolio` and `/api/performance/distributions`. Pure and dependency-free.
 *
 * Tolerant means: the shape must be recognisable (else `null`), but a single bad row or field is dropped and
 * noted instead of failing the whole payload. Nothing is ever defaulted to 0: a missing number stays null.
 * Numbers may arrive as JSON numbers or numeric strings (decimal serialisers); anything else is not a number.
 */
import type {
  BreakdownKey, ClassDistributions, DistributionClassSummary, DistributionRow, DistributionYear, FundPortfolio, PortfolioHoldingRow,
  PortfolioMeasure, PortfolioMeasureKey, WeightRow,
} from "../raw.ts";
import { BREAKDOWN_KEYS, PORTFOLIO_MEASURES } from "../raw.ts";

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

/** A finite number from a JSON number or a plain numeric string; null otherwise. */
export function num(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && /^\s*[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?\s*$/.test(v)) {
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** A non-negative integer count, else null. */
const count = (v: unknown): number | null => {
  const n = num(v);
  return n !== null && Number.isInteger(n) && n >= 0 ? n : null;
};

const text = (v: unknown, max = 200): string | null => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

/** `YYYY-MM-DD` (a datetime is cut to its date); null for anything else. */
export function isoDate(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const d = v.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const t = Date.parse(`${d}T00:00:00Z`);
  return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === d ? d : null;
}

const strings = (v: unknown, max = 20): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, max).map((x) => (x as string).slice(0, 300)) : []);

/* ------------------------------------------------------------------ A. fund portfolio */

function measure(v: unknown): PortfolioMeasure | null {
  if (!isObj(v)) return null;
  // a number (or numeric string), else a letter notch such as "A-" (average rating)
  const n = num(v.value);
  const value = n ?? (typeof v.value === "string" && /^[A-Za-z]{1,4}[+-]?$/.test(v.value.trim()) ? v.value.trim() : null);
  if (value === null) return null;
  const coverage = num(v.coverage);
  return { value, coverage };
}

const CANONICAL_UNITS = {
  average_duration: "years", average_yield: "percent", average_coupon: "percent",
  average_maturity: "years", average_rating: "notch",
} as const;

function canonicalMeasure(v: unknown, unit: string): PortfolioMeasure | null {
  if (!isObj(v) || v.unit !== unit || !["ok", "partial"].includes(String(v.status))) return null;
  const value = num(v.value);
  const coverage = num(v.coverage);
  if (value === null || coverage === null || coverage < 0 || coverage > 1) return null;
  if (unit === "notch") {
    const display = text(v.display, 8);
    return value >= 1 && value <= 22 && display ? { value: display, coverage } : null;
  }
  return { value: unit === "percent" ? value / 100 : value, coverage };
}

function weightRows(v: unknown, where: string, notes: string[]): WeightRow[] {
  if (!Array.isArray(v)) return [];
  const out: WeightRow[] = [];
  for (const r of v) {
    const label = isObj(r) ? text(r.label, 80) : null;
    const weight = isObj(r) ? num(r.weight) : null;
    if (label === null || weight === null) {
      notes.push(`${where}: row without a label or a numeric weight dropped`);
      continue;
    }
    out.push({ label, weight, count: isObj(r) ? count(r.count) : null });
  }
  return out;
}

function holding(v: unknown, couponScale: number | null = 1): PortfolioHoldingRow | null {
  if (!isObj(v)) return null;
  const name = text(v.name, 160);
  const weight = num(v.weight);
  const coupon = num(v.coupon);
  if (name === null || weight === null) return null;
  return {
    name, weight,
    issuer: text(v.issuer, 160),
    coupon: couponScale === null || coupon === null ? null : coupon * couponScale,
    maturity: isoDate(v.maturity),
    rating: text(v.rating, 8),
    sector: text(v.sector, 80),
    green_bond: typeof v.green_bond === "boolean" ? v.green_bond : null,
  };
}

/** FundPortfolioResponse -> FundPortfolio, or null when the payload is not recognisable (no fund / as_of). */
export function parseFundPortfolio(body: unknown): FundPortfolio | null {
  if (!isObj(body)) return null;
  const fund = text(body.fund, 40);
  const asOf = isoDate(body.as_of);
  if (!fund || !asOf) return null;
  const notes: string[] = [];
  const characteristics: FundPortfolio["characteristics"] = {};
  const chars = isObj(body.characteristics) ? body.characteristics : {};
  const canonical = ["average_duration", "average_yield", "average_coupon"].some((key) => key in chars);
  const keys = canonical ? Object.keys(CANONICAL_UNITS) as (keyof typeof CANONICAL_UNITS)[] : PORTFOLIO_MEASURES;
  for (const k of keys) {
    if (!(k in chars)) continue;
    const m = canonical ? canonicalMeasure(chars[k], CANONICAL_UNITS[k as keyof typeof CANONICAL_UNITS]) : measure(chars[k]);
    if (m) characteristics[k as PortfolioMeasureKey] = m;
    else if (chars[k] !== null) notes.push(`characteristics.${k}: no usable value`);
  }
  const breakdowns: FundPortfolio["breakdowns"] = {};
  const bks = isObj(body.breakdowns) ? body.breakdowns : {};
  for (const k of BREAKDOWN_KEYS) {
    const rows = weightRows(bks[k], `breakdowns.${k}`, notes);
    if (rows.length) breakdowns[k as BreakdownKey] = rows;
  }
  const top: PortfolioHoldingRow[] = [];
  const couponScale = !canonical ? 1 : isObj(chars.average_coupon) && chars.average_coupon.unit === "percent" ? 0.01 : null;
  for (const r of Array.isArray(body.top_holdings) ? body.top_holdings : []) {
    const h = holding(r, couponScale);
    if (h) top.push(h);
    else notes.push("top_holdings: row without a name or a numeric weight dropped");
  }
  const totals = isObj(body.totals) ? body.totals : {};
  const coverage = isObj(body.coverage) ? body.coverage : {};
  const method: Record<string, string> = {};
  if (isObj(body.method)) for (const [k, v] of Object.entries(body.method)) if (typeof v === "string") method[k] = v.slice(0, 300);
  return {
    fund, as_of: asOf,
    currency: text(body.currency, 8),
    net_assets_cad: num(body.net_assets_cad),
    totals: {
      holdings_count: count(totals.holdings_count), bonds_count: count(totals.bonds_count), cash_weight: num(totals.cash_weight),
      derivatives_count: count(totals.derivatives_count), other_weight: num(totals.other_weight),
    },
    characteristics, breakdowns, top_holdings: top,
    green_bonds_weight: num(body.green_bonds_weight),
    coverage: { resolved_weight: num(coverage.resolved_weight), priced_weight: num(coverage.priced_weight) },
    method,
    warnings: strings(body.warnings),
    notes: [...new Set(notes)],
  };
}

/* ------------------------------------------------------------------ B. class distributions */

function distRow(v: unknown): DistributionRow | null {
  if (!isObj(v)) return null;
  const date = isoDate(v.date);
  const fundserv = text(v.fundserv, 20);
  const amount = num(v.amount_per_unit);
  if (!date || !fundserv || amount === null) return null;
  return { date, fundserv, class_display: text(v.class_display, 40), currency: text(v.currency, 8), amount_per_unit: amount };
}

function year(v: unknown): DistributionYear | null {
  if (!isObj(v)) return null;
  const y = count(v.year);
  const perUnit = num(v.per_unit);
  const n = count(v.count);
  return y !== null && y >= 1900 && y <= 2200 && perUnit !== null && n !== null ? { year: y, per_unit: perUnit, count: n } : null;
}

function classSummary(v: unknown, notes: string[]): DistributionClassSummary | null {
  if (!isObj(v)) return null;
  const fundserv = text(v.fundserv, 20);
  if (!fundserv) return null;
  const years: DistributionYear[] = [];
  for (const y of Array.isArray(v.calendar_years) ? v.calendar_years : []) {
    const p = year(y);
    if (p) years.push(p);
    else notes.push(`classes.${fundserv}.calendar_years: invalid row dropped`);
  }
  return {
    fundserv,
    class_display: text(v.class_display, 40),
    currency: text(v.currency, 8),
    frequency_observed: text(v.frequency_observed, 30),
    last_date: isoDate(v.last_date),
    last_amount_per_unit: num(v.last_amount_per_unit),
    trailing_12m_per_unit: num(v.trailing_12m_per_unit),
    calendar_years: years.sort((a, b) => a.year - b.year),
  };
}

/** ClassDistributionsResponse -> ClassDistributions, or null when the payload is not recognisable (no rows / classes arrays). */
export function parseDistributions(body: unknown): ClassDistributions | null {
  if (!isObj(body) || !Array.isArray(body.rows) || !Array.isArray(body.classes)) return null;
  const notes: string[] = [];
  const rows: DistributionRow[] = [];
  for (const r of body.rows) {
    const p = distRow(r);
    if (p) rows.push(p);
    else notes.push("rows: row without a date, a FundServ code or a numeric amount dropped");
  }
  rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.fundserv.localeCompare(b.fundserv)));
  const classes: DistributionClassSummary[] = [];
  for (const c of body.classes) {
    const p = classSummary(c, notes);
    if (p) classes.push(p);
    else notes.push("classes: entry without a FundServ code dropped");
  }
  return {
    short_name: text(body.short_name, 40) ?? "",
    start_date: isoDate(body.start_date),
    end_date: isoDate(body.end_date),
    method: text(body.method, 400),
    rows, classes,
    warnings: strings(body.warnings),
    notes: [...new Set(notes)],
  };
}
