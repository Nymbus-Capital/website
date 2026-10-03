/**
 * Shapes of the raw source payloads (as documented by the dataplatform OpenAPI and the factsheet
 * archives) and the bundle the fetchers hand to the (pure) build step. What is written to
 * `snapshots/<id>/raw/` is exactly this bundle, split per source, already reduced where needed
 * (AUM: fund totals only, never investor-level rows; FTSE: aggregate daily levels only).
 */
import type { FundKey } from "../data/types.ts";
import type { DailyRow } from "./daily-chain.ts";

export type DpShort = "SEST" | "SEB" | "Multistrat";

export interface MonthlyNetReturnRow {
  month: string;
  net_return: number | null;
  status: "ready" | "unavailable" | "conflict" | string;
  issue?: string | null;
  method?: string | null;
  /** where a full-history month comes from ("cibc" | "bridge" | "apex"); absent on the Apex-only default */
  source?: string | null;
}
export interface MonthlyNetReturnsResponse {
  short_name?: string;
  as_of: string;
  class_code?: string;
  /** history requested / served: "full" (pre-Apex months included) or the Apex-only default; absent on older servers */
  history?: string | null;
  /** class of the series as the site labels it ("F", "H", "FP") and its FundServ code (dataplatform PR #626; absent before) */
  class_display?: string | null;
  fundserv?: string | null;
  currency?: string;
  return_basis?: string;
  methodology_version?: string;
  row_count?: number;
  rows: MonthlyNetReturnRow[];
}

export interface NavPoint {
  date: string;
  source?: string | null;
  fundserv?: string | null;
  class_display?: string | null;
  class_code?: string | null;
  currency?: string | null;
  nav_per_share_local?: number | null;
  nav_per_share_cad?: number | null;
  net_daily_return?: number | null;
  /** "apex_distribution_aware" | "nav_price_ratio" | "legacy_stored" */
  net_return_method?: string | null;
  /** valuation date the daily return starts from (previous valuation day) */
  return_start_date?: string | null;
  nav_type?: string | null;
  short_name?: string | null;
  /** rows aggregated into this one (1 for a class row) */
  return_source_count?: number | null;
  /** class NAV in CAD (the fund's net assets are the sum over its classes) */
  net_asset_value_cad?: number | null;
  [k: string]: unknown;
}
/** one class's daily rows (nav-timeseries fundserv=…), reduced to the fields the chain needs */
export interface NavHistory {
  fundserv: string;
  rows: (DailyRow & { fundserv: string })[];
  warnings: string[];
}

export interface NavSeriesResponse { rows: NavPoint[]; warnings?: string[]; sources?: string[]; [k: string]: unknown }

export interface RegisteredShareClass { fundserv: string; display: string; currency: string; status: string; [k: string]: unknown }
export interface RegisteredFund {
  key: string;
  name: string;
  status: string;
  apex_account?: string | null;
  cibc_short?: string | null;
  inception?: string | null;
  classes: RegisteredShareClass[];
}
export interface FundRef { short_name: string; name: string; apex_account?: string | null; cibc_account?: string | null }

/** AUM reduced to fund-level totals (the only thing ever stored or published). */
export interface AumTotals { snapshot_date: string | null; warningCount: number; totals: Record<string, number> }

export interface FtseLevels { levels: Record<string, number>; rowCount: number; first: string | null; last: string | null; joined?: string[]; /** published index name (/api/ftse/index-summary/short-names) */ indexName?: string | null }

/** analytics repo fund_returns.json, reduced to the series the website uses */
export interface AnalyticsReturns { dates: string[]; returns: Record<string, (number | null)[]>; where: string }

export interface FactsheetFiles {
  /** file name (e.g. `bonds_data_2026-08.json`) -> parsed JSON */
  files: Record<string, unknown>;
  /** file names looked for, newest first */
  tried: string[];
  /** "local <dir>" | "SharePoint" */
  where: string;
}

export interface SourceResult<T> {
  ok: boolean;
  data: T | null;
  /** failure reason (never contains credentials) */
  error?: string;
  /** the route or the resource does not exist (HTTP 404): for a new endpoint, "not deployed yet" */
  absent?: boolean;
  /** informational detail for the run report */
  detail?: string;
}

export interface RawPayloads {
  fetchedAt: string;
  /** last closed month-end at fetch time */
  targetMonth: string;
  /** FTSE index-summary short name actually used per fund (resolved from env at fetch time) */
  ftseIndex: Partial<Record<FundKey, string | null>>;
  /** monthly net returns of the fund's track-record class (FUND_SOURCES.trackRecordClass, Apex months) */
  monthlyReturns: Partial<Record<DpShort, SourceResult<MonthlyNetReturnsResponse>>>;
  /** monthly net returns with `history=full` (dataplatform PR #626, never merged; only in older snapshots, unused) */
  monthlyReturnsFull?: Partial<Record<DpShort, SourceResult<MonthlyNetReturnsResponse>>>;
  /**
   * daily nav-timeseries rows of each class with a series (FUND_SOURCES.classFundserv), keyed by FundServ code, from the
   * fund's NAV start: the website compounds the monthly returns itself (daily-chain.ts). Optional (older snapshots)
   */
  navHistory?: Record<string, SourceResult<NavHistory>>;
  nav: Partial<Record<DpShort, SourceResult<NavSeriesResponse>>>;
  apexFunds: SourceResult<RegisteredFund[]>;
  unitholderFunds: SourceResult<FundRef[]>;
  aum: SourceResult<AumTotals>;
  ftse: Record<string, SourceResult<FtseLevels>>;
  factsheets: SourceResult<FactsheetFiles>;
  /** official monthly history before the Apex cutover (analytics repo) */
  analytics: SourceResult<AnalyticsReturns>;
  /**
   * Apex book of each fund (/api/apex/holdings) on its latest FINAL_NAV valuation day, and on the last valuation day of the
   * last closed month (factsheet cross-check; null when the latest book is in that month). The website computes the
   * portfolio analytics from them (fund-portfolio.ts). Optional (older snapshots)
   */
  holdings?: Partial<Record<DpShort, { latest: SourceResult<HoldingsBook>; monthEnd: SourceResult<HoldingsBook> | null }>>;
  /** instrument master references of the held securities (/api/instruments/batch + bond universe pages); optional */
  instruments?: SourceResult<InstrumentRefs>;
  /** portfolio analytics in the PR #621 contract shape: older snapshots only (the endpoint never reached the main branch) */
  portfolio?: Partial<Record<DpShort, SourceResult<FundPortfolio>>>;
  portfolioMonthEnd?: Partial<Record<DpShort, SourceResult<FundPortfolio>>>;
  /** per-class distributions (PR #621 contract): no endpoint on the dataplatform main branch; only when supplied */
  distributions?: Partial<Record<DpShort, SourceResult<ClassDistributions>>>;
}

/* ------------------------------------------------------------------ Apex holdings and instrument master (main-branch endpoints) */

/** /api/apex/holdings position, reduced */
export interface HoldingsPosition {
  date: string; bloomberg_id: string | null; isin: string | null; cusip: string | null; sedol: string | null; security_id: string | null;
  description: string | null; security_type: string | null; sector: string | null; country: string | null; currency: string | null;
  quantity: number | null; market_value_cad: number | null;
}
/** /api/apex/holdings bank / broker balance line, reduced */
export interface HoldingsCash { date: string; currency: string | null; glc_description: string | null; closing_bal_cad: number | null }
/** one fund's Apex FINAL_NAV book of one valuation day */
export interface HoldingsBook { fund: string; date: string; positions: HoldingsPosition[]; cash: HoldingsCash[]; warnings: string[] }

/** an instrument as the website needs it: batch detail (ratings, reference, classification, latest price) + universe terms */
export interface InstrumentRef {
  nymbus_instrument_id: number;
  isin: string | null; cusip: string | null; figi: string | null; name: string | null; asset_class: string | null; security_type: string | null;
  ratings: { agency: string; rating: string; source?: string | null }[];
  reference: { is_green_bond?: boolean | null } | null;
  classification: { industry_sector?: string | null; country_of_risk?: string | null; market_sector?: string | null } | null;
  latest_price: { price_date?: string | null; modified_duration?: number | null; yield_to_maturity?: number | null } | null;
  /** from the bond universe (/api/instruments): coupon rate in percent, maturity, issuer, Bloomberg sector / country / market sector */
  coupon_rate?: number | string | null; maturity_date?: string | null; issuer?: string | null; sector?: string | null; country_of_risk?: string | null; market_sector?: string | null;
}
export interface InstrumentRefs {
  refs: InstrumentRef[];
  /** identifiers asked, by type, and how many matched */
  asked: Record<string, number>;
  matched: number;
  /** bond universe rows read (coupon / maturity); complete = every page was read */
  universeRows: number;
  universeComplete: boolean;
}

/* ------------------------------------------------------------------ fund portfolio (dataplatform contract A) */

export type PortfolioMeasureKey = "modified_duration" | "yield_to_maturity" | "coupon" | "average_maturity" | "average_rating";
export const PORTFOLIO_MEASURES: readonly PortfolioMeasureKey[] = ["modified_duration", "yield_to_maturity", "coupon", "average_maturity", "average_rating"];
export type BreakdownKey = "sector" | "rating" | "term" | "country" | "asset_type";
export const BREAKDOWN_KEYS: readonly BreakdownKey[] = ["sector", "rating", "term", "country", "asset_type"];

/** one characteristic: value (number, or a rating notch), and the share of the bond weight that had an input */
export interface PortfolioMeasure { value: number | string; coverage: number | null }
export interface WeightRow { label: string; weight: number; count: number | null }
export interface PortfolioHoldingRow {
  name: string; issuer: string | null; weight: number; coupon: number | null; maturity: string | null;
  rating: string | null; sector: string | null; green_bond: boolean | null;
}

/** FundPortfolioResponse, parsed tolerantly (sources/contracts.ts): invalid rows and fields are dropped and noted */
export interface FundPortfolio {
  fund: string;
  as_of: string;
  currency: string | null;
  net_assets_cad: number | null;
  totals: { holdings_count: number | null; bonds_count: number | null; cash_weight: number | null; derivatives_count: number | null; other_weight: number | null };
  characteristics: Partial<Record<PortfolioMeasureKey, PortfolioMeasure>>;
  breakdowns: Partial<Record<BreakdownKey, WeightRow[]>>;
  top_holdings: PortfolioHoldingRow[];
  green_bonds_weight: number | null;
  coverage: { resolved_weight: number | null; priced_weight: number | null };
  /** the method strings as documented by the endpoint (provenance) */
  method: Record<string, string>;
  warnings: string[];
  /** what the tolerant parser dropped */
  notes: string[];
}

/* ------------------------------------------------------------------ class distributions (dataplatform contract B) */

export interface DistributionRow { date: string; fundserv: string; class_display: string | null; currency: string | null; amount_per_unit: number }
export interface DistributionYear { year: number; per_unit: number; count: number }
export interface DistributionClassSummary {
  fundserv: string; class_display: string | null; currency: string | null; frequency_observed: string | null;
  last_date: string | null; last_amount_per_unit: number | null; trailing_12m_per_unit: number | null; calendar_years: DistributionYear[];
}
export interface ClassDistributions {
  short_name: string;
  start_date: string | null;
  end_date: string | null;
  method: string | null;
  rows: DistributionRow[];
  classes: DistributionClassSummary[];
  warnings: string[];
  notes: string[];
}
