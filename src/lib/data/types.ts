/**
 * Data contract between the pipeline (writer) and the website (reader).
 *
 * Conventions
 *  - Every return / weight / yield is a DECIMAL FRACTION (0.0512 = 5.12 %), never a percent string.
 *  - Dates are ISO `YYYY-MM-DD`. Month keys are month-end dates (`2026-08-31`).
 *  - `null` means "unknown / not published"; the UI hides the metric instead of showing 0.
 *  - This file is dependency-free so the pipeline and its tests can run under plain Node (type stripping).
 */

export type Lang = "en" | "fr";
export type L10n = { en: string; fr: string };

/** Website fund keys (stable URL slugs). */
export type FundKey = "monthly-income" | "sustainable-enhanced-bonds" | "multi-strategy" | "global-minimum-volatility";

export const PERIODS = ["1M", "3M", "YTD", "1Y", "2Y", "3Y", "5Y", "10Y", "SI"] as const;
export type Period = (typeof PERIODS)[number];
export type PeriodMap = Partial<Record<Period, number | null>>;

export interface Issue {
  /** dotted path of the value concerned, e.g. `funds.monthly-income.trailing.1Y` */
  key: string;
  level: "info" | "warn" | "error";
  message: string;
}

export interface MonthlyPoint { month: string; r: number }
export interface GrowthPoint { date: string; fund: number; index?: number | null }
export interface CalendarRow { year: number; fund: number | null; index?: number | null; va?: number | null; partial?: boolean }

export interface Trailing {
  fund: PeriodMap;
  index?: PeriodMap;
  /** value added = fund - index, per period */
  va?: PeriodMap;
}

export interface Performance {
  /** month-end of the last closed, validated month */
  asOf: string;
  basis: "net" | "gross";
  /** first month of the track record (month-end) */
  firstMonth: string;
  monthly: MonthlyPoint[];
  indexMonthly?: MonthlyPoint[];
  trailing: Trailing;
  calendar: CalendarRow[];
  /** growth of 10 000 $, month-end points */
  growth: GrowthPoint[];
}

export interface RiskStats {
  window: "SI" | "3Y";
  annReturn: number | null;
  annVol: number | null;
  downsideDev: number | null;
  sharpe: number | null;
  sortino: number | null;
  maxDrawdown: number | null;
  positiveMonths: number | null;
  bestMonth: number | null;
  worstMonth: number | null;
}

export interface NavClass {
  fundserv: string;
  /** class label as registered, e.g. "F", "FP", "F USD" */
  display: string;
  currency: string;
  nav: number | null;
  date: string | null;
  prevNav: number | null;
  change: number | null;
  /** relative change vs previous valuation day (decimal) */
  changePct: number | null;
}

export interface Bucket { label: string; fund: number | null; index?: number | null }
export interface Holding { name: string; weight: number }

export interface Characteristic {
  /** stable id, e.g. `portfolioYield`, `duration`, `creditQuality` */
  id: string;
  label: L10n;
  fund: number | string | null;
  index?: number | string | null;
  /** how to format: pct (decimal), num (1 decimal), int, text */
  unit: "pct" | "num" | "int" | "text";
}

export interface FundData {
  key: FundKey;
  /** name as the sources know it (for provenance only) */
  sourceName: string;
  performance: Performance | null;
  risk: RiskStats | null;
  /** same statistics over the last 36 months (null when the track record is shorter); optional, added by the pipeline */
  risk3Y?: RiskStats | null;
  nav: { asOf: string | null; classes: NavClass[] } | null;
  aum: { cad: number; asOf: string } | null;
  characteristics: Characteristic[];
  breakdowns: {
    credit?: Bucket[];
    sectors?: Bucket[];
    curve?: Bucket[];
    country?: Bucket[];
    assetClass?: Bucket[];
  };
  topHoldings: Holding[];
  esg: Characteristic[];
  /** month of the factsheet the characteristics / breakdowns come from (YYYY-MM) */
  factsheetMonth: string | null;
}

/** What the pipeline writes (`published/site-data.json`). */
export interface SiteData {
  schemaVersion: 1;
  generatedAt: string;
  /** "live" = produced by the pipeline; "sample" = illustrative seed shipped in the repo */
  mode: "live" | "sample";
  asOf: { performance: string | null; nav: string | null; aum: string | null; factsheet: string | null };
  funds: Partial<Record<FundKey, FundData>>;
  /** path -> human readable source, e.g. "dataplatform /api/performance/monthly-net-returns (2026-08)" */
  provenance: Record<string, string>;
  issues: Issue[];
}

/* ------------------------------------------------------------------ admin-managed content */

export type DocType =
  | "factsheet" | "fund-facts" | "prospectus" | "annual-report" | "interim-report"
  | "mrfp" | "commentary" | "presentation" | "esg" | "other";

export interface DocumentMeta {
  id: string;
  /** fund key, or "firm" for firm-wide documents */
  scope: FundKey | "firm";
  type: DocType;
  lang: Lang | "both";
  title: L10n;
  /** as-of / publication date */
  date: string;
  fileName: string;
  size: number;
  sha256: string;
  published: boolean;
  uploadedBy: string;
  uploadedAt: string;
}

export interface FundContent {
  hidden?: boolean;
  /** hide specific blocks on the public page */
  hide?: Partial<Record<"performance" | "calendar" | "growth" | "risk" | "nav" | "aum" | "characteristics" | "breakdowns" | "holdings" | "esg", boolean>>;
  tagline?: L10n;
  description?: L10n;
  objective?: L10n;
  riskRating?: "low" | "low-medium" | "medium" | "medium-high" | "high";
  managementFee?: string;
  performanceFee?: string;
  mer?: string;
  minInvestment?: string;
  distributions?: L10n;
  /** FundServ code highlighted on the page (the class whose NAV headlines) */
  headlineClass?: string;
  /** footnotes shown under performance, EN/FR */
  performanceNote?: L10n;
  managers?: string[];
  /** freeze: keep showing this snapshot id instead of the latest one for this fund */
  pinnedSnapshot?: string | null;
}

export interface SiteContent {
  version: number;
  updatedAt: string;
  updatedBy: string;
  firm: {
    aumLabel?: L10n;          // e.g. "1.8 B$+" (firm AUM incl. mandates is not in the dataplatform)
    announcement?: L10n | null;
    disclaimer?: L10n;
  };
  funds: Partial<Record<FundKey, FundContent>>;
  pipeline: {
    /** "auto": validated runs publish immediately; "review": runs wait for approval in the admin */
    publishMode: "auto" | "review";
  };
}
