/**
 * Shapes of the raw source payloads (as documented by the dataplatform OpenAPI and the factsheet
 * archives) and the bundle the fetchers hand to the (pure) build step. What is written to
 * `snapshots/<id>/raw/` is exactly this bundle, split per source, already reduced where needed
 * (AUM: fund totals only, never investor-level rows; FTSE: aggregate daily levels only).
 */
import type { FundKey } from "../data/types.ts";

export type DpShort = "SEST" | "SEB" | "Multistrat";

export interface MonthlyNetReturnRow {
  month: string;
  net_return: number | null;
  status: "ready" | "unavailable" | "conflict" | string;
  issue?: string | null;
  method?: string | null;
}
export interface MonthlyNetReturnsResponse {
  short_name?: string;
  as_of: string;
  class_code?: string;
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
  [k: string]: unknown;
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

export interface FtseLevels { levels: Record<string, number>; rowCount: number; first: string | null; last: string | null; joined?: string[] }

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
  /** informational detail for the run report */
  detail?: string;
}

export interface RawPayloads {
  fetchedAt: string;
  /** last closed month-end at fetch time */
  targetMonth: string;
  /** FTSE index-summary short name actually used per fund (resolved from env at fetch time) */
  ftseIndex: Partial<Record<FundKey, string | null>>;
  monthlyReturns: Partial<Record<DpShort, SourceResult<MonthlyNetReturnsResponse>>>;
  nav: Partial<Record<DpShort, SourceResult<NavSeriesResponse>>>;
  apexFunds: SourceResult<RegisteredFund[]>;
  unitholderFunds: SourceResult<FundRef[]>;
  aum: SourceResult<AumTotals>;
  ftse: Record<string, SourceResult<FtseLevels>>;
  factsheets: SourceResult<FactsheetFiles>;
  /** official monthly history before the Apex cutover (analytics repo) */
  analytics: SourceResult<AnalyticsReturns>;
}
