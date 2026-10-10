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
  /**
   * how returns aggregate over time: "compounded" (the funds) or "arithmetic" (GMV overlay on notional, growth =
   * 10 000 × (1 + Σr)). Optional (older datasets): absent → arithmetic for a gross series, else compounded.
   */
  method?: "compounded" | "arithmetic";
  /** first month of the track record (month-end) */
  firstMonth: string;
  monthly: MonthlyPoint[];
  indexMonthly?: MonthlyPoint[];
  trailing: Trailing;
  calendar: CalendarRow[];
  /** growth of 10 000 $, month-end points */
  growth: GrowthPoint[];
  /**
   * class whose returns form the track record, as the source names it (dataplatform monthly-net-returns
   * `class_code`: "STRATEGY" = the F class, "STRATEGY_H" = SEB's H class); optional
   */
  returnClass?: string;
  /** human-readable label of `returnClass`, e.g. "Series F"; optional */
  returnClassLabel?: string;
  /** name of the benchmark series as published (factsheet label); optional */
  indexName?: string;
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
  /**
   * when a value is a published figure (factsheet string), the number of decimals it was published with,
   * in display units (percent points for percentages): render at that precision. Optional.
   */
  decimals?: Partial<Record<"annReturn" | "annVol" | "downsideDev" | "sharpe" | "sortino" | "maxDrawdown" | "positiveMonths" | "bestMonth" | "worstMonth", number>>;
}

export interface NavClass {
  fundserv: string;
  /** class label as registered, e.g. "F", "FP", "F USD" */
  display: string;
  currency: string;
  nav: number | null;
  /** valuation date of `nav` (each class has its own date) */
  date: string | null;
  prevNav: number | null;
  /** valuation date of `prevNav` (the previous valuation day) */
  prevDate?: string | null;
  /** NAV difference in class currency; null whenever `changePct` is null */
  change: number | null;
  /**
   * daily TOTAL return vs the previous valuation day (decimal): the administrator's distribution-aware
   * net daily return (Apex `apex_distribution_aware`), so a distribution does not show as a loss. null
   * when that return is not available for exactly the previous valuation day.
   */
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

/* ------------------------------------------------------------------ daily portfolio and distributions */

/** Portfolio characteristic ids of the daily block, in display order. */
export const PORTFOLIO_METRICS = ["duration", "ytm", "averageYield", "coupon", "maturity", "rating"] as const;
export type PortfolioMetricId = (typeof PORTFOLIO_METRICS)[number];

export interface PortfolioMetric {
  id: PortfolioMetricId;
  /** duration / maturity in years, ytm / coupon as decimal fractions, rating as a letter notch ("A-") */
  value: number | string;
  unit: "years" | "pct" | "rating";
  /** share of the bond weight that had the input (1 = every bond); shown as a footnote below 1 */
  coverage: number;
}

export interface WeightBucket { label: string; weight: number; count?: number | null }

export interface PortfolioHolding {
  name: string;
  weight: number;
  coupon: number | null;
  /** ISO date */
  maturity: string | null;
  rating: string | null;
  sector: string | null;
  /** green bond flag; null when unknown */
  green: boolean | null;
}

/** Breakdown keys of the daily block; rating and term keep their natural order (AAA → D then not rated; 0-1 → 10+). */
export type PortfolioBreakdownKey = "sector" | "rating" | "term" | "country" | "assetType";

/**
 * Portfolio figures of one book date, computed by the data platform (the site only displays them). Optional in
 * FundData (datasets published before it have none): absent or null → the Portfolio tab shows the month-end factsheet
 * figures (`characteristics`, `breakdowns`, `topHoldings`, `factsheetMonth`), as before.
 */
export interface PortfolioData {
  /** "daily": the fund's daily book; "factsheet": reserved for a month-end factsheet book in this shape */
  source: "daily" | "factsheet";
  /** book date (ISO) */
  asOf: string;
  characteristics: PortfolioMetric[];
  /** weights over net assets (fractions), a "Cash" row included */
  breakdowns: Partial<Record<PortfolioBreakdownKey, WeightBucket[]>>;
  /** largest securities (cash and derivatives excluded), at most 10 */
  topHoldings: PortfolioHolding[];
  /** weight of green bonds (fraction); null when unknown or not shown for this fund */
  greenBondsWeight: number | null;
  totals: { holdings: number | null; bonds: number | null; cashWeight: number | null; derivatives: number | null } | null;
  /** share of the bond weight resolved to the instrument master / priced on the book date */
  coverage: { resolved: number | null; priced: number | null } | null;
}

export type DistributionFrequency = "monthly" | "quarterly" | "semi-annual" | "annual" | "irregular";

/** Distributions per unit of one series (class), in the class currency, keyed by its FundServ code. */
export interface ClassDistribution {
  fundserv: string;
  display: string;
  currency: string;
  frequency: DistributionFrequency | null;
  last: { date: string; amount: number } | null;
  /**
   * total per unit of the distributions dated in the 12 months ending at DistributionsData.trailingTo (after the same
   * day one year earlier, up to and including it) — not at the last distribution (null: not published)
   */
  trailing12m: number | null;
  calendarYears: { year: number; amount: number; count: number }[];
  /** every distribution, oldest first */
  history: { date: string; amount: number }[];
}

export interface DistributionsData {
  /** date of the latest distribution of the series shown ("Data as of") */
  asOf: string;
  /**
   * day the source was last read successfully (YYYY-MM-DD). Distributions carried over after a failed read are dropped
   * once it is too old (config DISTRIBUTIONS.maxCarryDays); absent in files published before it existed (not carried).
   */
  checkedAt?: string;
  /**
   * end of the trailing-12-month window (YYYY-MM-DD): the data platform's response end_date, i.e. the day of the read,
   * not the last distribution. A trailing figure without it cannot be checked and is not shown.
   */
  trailingTo?: string;
  /** live series only, in FundServ order */
  classes: ClassDistribution[];
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
  /** daily portfolio figures (optional, see PortfolioData); when present they take precedence over the factsheet ones */
  portfolio?: PortfolioData | null;
  /** per-series distributions (optional; absent in datasets published before it) */
  distributions?: DistributionsData | null;
}

/** What the pipeline writes (`published/site-data.json`). */
export interface SiteData {
  schemaVersion: 1;
  generatedAt: string;
  /** pipeline run that produced this dataset (optional; present in published/ and snapshots/) */
  runId?: string;
  /** when / by whom this dataset was published (optional; set only in published/site-data.json) */
  publishedAt?: string;
  publishedBy?: string;
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

/** Blocks an admin can hide on a fund page (`characteristics`, `breakdowns`, `holdings` apply to the daily portfolio too). */
export const HIDE_BLOCKS = ["performance", "calendar", "growth", "risk", "nav", "aum", "characteristics", "breakdowns", "holdings", "esg", "distributions"] as const;
export type HideBlock = (typeof HIDE_BLOCKS)[number];

export interface FundContent {
  hidden?: boolean;
  /** hide specific blocks on the public page (fund AUM is hidden unless `aum: false`) */
  hide?: Partial<Record<HideBlock, boolean>>;
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
  /**
   * Compliance sign-off of the disclaimer texts (src/content/disclaimers.ts + admin overrides). The admin shows a
   * "compliance review required" banner while `textsHash` differs from the current disclaimersHash().
   */
  compliance?: { approvedAt: string; approvedBy: string; textsHash: string } | null;
}
