/**
 * Data contract between the pipeline (writer) and the website (reader).
 *
 * Conventions
 *  - Every return / weight / yield is a DECIMAL FRACTION (0.0512 = 5.12 %), never a percent string.
 *  - Dates are ISO `YYYY-MM-DD`. Month keys are month-end dates (`2026-08-31`).
 *  - `null` means "unknown / not published"; the UI hides the metric instead of showing 0.
 *  - This file is dependency-free so the pipeline and its tests can run under plain Node (type stripping).
 */
import type { L, Locale } from "../i18n/config.ts";

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

export interface MonthlyPoint {
  month: string;
  r: number;
}
export interface GrowthPoint {
  date: string;
  fund: number;
  index?: number | null;
}
export interface CalendarRow {
  year: number;
  fund: number | null;
  index?: number | null;
  va?: number | null;
  partial?: boolean;
}

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
   * class whose returns form the WHOLE track record, as the dataplatform names it (monthly-net-returns `class_code`:
   * "STRATEGY" = the fund's F / FP class, "STRATEGY_H" = SEB's H class). Every month of `monthly` is of this class
   * (a series mixing classes is never published). Absent on publications made before 2026-10-01
   */
  classCode?: string;
  /** site code of `classCode` ("FP", "F", "H"), always derived from it (fund-sources classLabels); optional */
  returnClass?: string;
  /** human-readable label of `returnClass`, e.g. "Series F"; optional */
  returnClassLabel?: string;
  /** name of the benchmark series as published (factsheet label); optional */
  indexName?: string;
  /**
   * the series covers fewer than 12 months (a recent class): only the periods that exist are published, the page says
   * "since class inception"; no risk statistics. Optional.
   */
  shortRecord?: boolean;
  /**
   * class entries (FundData.performanceByClass) other than the track record: first price date of the class's current run
   * (YYYY-MM-DD). The first month runs from that day's NAV (the inception day's own return is never used). Optional.
   */
  inception?: string;
  /** `firstMonth` is a partial month starting at `inception` (index figures over it are not shown). Optional. */
  partialFirstMonth?: boolean;
  /**
   * months between `firstMonth` and `asOf` withheld because a check failed (shown "—"; reasons in the admin issues): they are
   * absent from `monthly`, and every figure whose window contains one is null. Optional (absent: none).
   */
  withheldMonths?: string[];
  /** where the growth series starts: the inception date, or the month-end after the last withheld month. Optional. */
  growthFrom?: string;
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
  decimals?: Partial<
    Record<
      | "annReturn"
      | "annVol"
      | "downsideDev"
      | "sharpe"
      | "sortino"
      | "maxDrawdown"
      | "positiveMonths"
      | "bestMonth"
      | "worstMonth",
      number
    >
  >;
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

export interface Bucket {
  label: string;
  fund: number | null;
  index?: number | null;
}
export interface Holding {
  name: string;
  weight: number;
}

export interface Characteristic {
  /** stable id, e.g. `portfolioYield`, `duration`, `creditQuality` */
  id: string;
  label: L;
  fund: number | string | null;
  index?: number | string | null;
  /** how to format: pct (decimal), num (1 decimal), int, text */
  unit: "pct" | "num" | "int" | "text";
}

/* ------------------------------------------------------------------ daily portfolio and distributions */

/** Portfolio characteristic ids of the daily block, in display order. */
export const PORTFOLIO_METRICS = ["duration", "ytm", "coupon", "maturity", "rating"] as const;
export type PortfolioMetricId = (typeof PORTFOLIO_METRICS)[number];

export interface PortfolioMetric {
  id: PortfolioMetricId;
  /** duration / maturity in years, ytm / coupon as decimal fractions, rating as a letter notch ("A-") */
  value: number | string;
  unit: "years" | "pct" | "rating";
  /** share of the bond weight that had the input (1 = every bond); shown as a footnote below 1 */
  coverage: number;
  /** the figure covers the bond holdings only (the fund holds futures whose exposure is not included): labelled so */
  scope?: "bondHoldings";
}

export interface WeightBucket {
  label: string;
  weight: number;
  count?: number | null;
}

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
  totals: {
    holdings: number | null;
    bonds: number | null;
    cashWeight: number | null;
    derivatives: number | null;
  } | null;
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

/**
 * Returns of one selectable class (series), keyed by FundServ code in `FundData.performanceByClass`. The series is the
 * class's own: never another class's numbers (a class without data has no entry and the page says "coming soon").
 */
export interface ClassPerformance {
  fundserv: string;
  /** class label as registered ("F", "FP", "H") */
  display: string;
  performance: Performance;
  risk: RiskStats | null;
  risk3Y: RiskStats | null;
}

/**
 * What the page says about one active class of the fund register (FundData.classInfo, by FundServ code):
 *  - "shown": its returns are in performanceByClass;
 *  - "young": less than `minMonths` months since its inception: no performance figure (regulatory minimum);
 *  - "currency": a non-CAD series without distribution-aware returns: no performance figure;
 *  - "unavailable": no usable daily history yet ("coming soon").
 */
export interface ClassInfo {
  fundserv: string;
  display: string;
  currency: string | null;
  /** first price date of the class's current run (YYYY-MM-DD), null when unknown */
  inception: string | null;
  status: "shown" | "young" | "currency" | "unavailable";
  /** the regulatory minimum applied (months), for the "young" message */
  minMonths?: number;
}

/** Everything the page shows for one variant of a strategy: returns, risk, characteristics, allocation, holdings. */
export interface VariantData {
  variant: string;
  performance: Performance | null;
  risk: RiskStats | null;
  risk3Y: RiskStats | null;
  characteristics: Characteristic[];
  breakdowns: FundData["breakdowns"];
  topHoldings: Holding[];
  esg: Characteristic[];
  factsheetMonth: string | null;
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
  /**
   * returns per selectable class, by FundServ code (optional; datasets published before it only have `performance`).
   * `performance` / `risk` / `risk3Y` above are the default class's (F) when it has a series, else the series the
   * source serves by default, labelled with its true class (`performance.returnClass`).
   */
  performanceByClass?: Record<string, ClassPerformance>;
  /**
   * FundServ code of the class the page opens on: the registry's headline class when it has returns, else the first class
   * (registry order) that has returns; optional
   */
  defaultClass?: string;
  /** every active register class of the fund with its inception and why it shows no returns (optional, by FundServ) */
  classInfo?: Record<string, ClassInfo>;
  /**
   * variants of a strategy (Global Minimum Volatility: "3", "6", "9" % downside volatility), by variant id. The
   * top-level performance / risk / characteristics / breakdowns / topHoldings are the default variant's. Optional.
   */
  variants?: Record<string, VariantData>;
  defaultVariant?: string;
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
  | "factsheet"
  | "fund-facts"
  | "prospectus"
  | "annual-report"
  | "interim-report"
  | "mrfp"
  | "proxy-voting"
  | "tax-factors"
  | "commentary"
  | "presentation"
  | "esg"
  | "other";

export interface DocumentMeta {
  id: string;
  /** fund key, or "firm" for firm-wide documents */
  scope: FundKey | "firm";
  type: DocType;
  lang: Locale | "both";
  title: L;
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
export const HIDE_BLOCKS = [
  "performance",
  "calendar",
  "growth",
  "risk",
  "nav",
  "aum",
  "characteristics",
  "breakdowns",
  "holdings",
  "esg",
  "distributions",
  "rankings",
] as const;
type HideBlock = (typeof HIDE_BLOCKS)[number];

export type ClassType = "prospectus" | "om" | "none";

export const RANKING_PERIODS = ["1M", "3M", "6M", "YTD", "1Y", "2Y", "3Y", "4Y", "5Y", "10Y"] as const;
export type RankingPeriod = (typeof RANKING_PERIODS)[number];

export interface RankingRow {
  period: RankingPeriod;
  /** position in the category (1 = best) and number of funds ranked in the category for that period */
  rank: number;
  of: number;
  /** 1 (top) to 4; null when the source gives none */
  quartile: 1 | 2 | 3 | 4 | null;
}

/** Category ranking of one series as published by Fundata on FundLibrary.com (field name kept: stored admin content). */
export interface FundLibraryRanking {
  /** class the ranking is for, as the source names it ("Class F") */
  classLabel: string;
  fundserv?: string;
  category: L;
  /** "as at" date of the ranking (YYYY-MM-DD) */
  asOf: string;
  /** Fundata FundGrade letter, when the source gives one (the awards are shown only with A or B: AWARD_GRADES) */
  fundGrade?: string;
  rows: RankingRow[];
  /** page the figures were read from (attribution link) */
  url?: string;
}

export interface MorningstarRating {
  /** overall rating, 1 to 5 stars */
  stars: 1 | 2 | 3 | 4 | 5;
  asOf: string;
  /** class the rating is for, as the source names it ("Class F"): required, a rating is never shown without it */
  classLabel: string;
  category?: L;
  /** number of funds rated in the category, when the source states it ("out of N funds") */
  fundsInCategory?: number;
  url?: string;
}

/** Third-party providers of percentile / category rankings entered by hand in the admin (besides Fundata and Morningstar). */
export const THIRD_PARTY_PROVIDERS = ["rbc-pfs", "evestment", "lipper", "gmr"] as const;
export type ThirdPartyProvider = (typeof THIRD_PARTY_PROVIDERS)[number];

/** One period of a third-party ranking: a percentile (1 = best) and / or a rank out of a number of funds. */
export interface PercentileRow {
  period: RankingPeriod;
  /** percentile rank in the peer group, 1 (best) to 100; null when the source gives a rank only */
  percentile: number | null;
  rank?: number | null;
  of?: number | null;
  /** return of the period as the source states it (percent, e.g. 10.04), stored for reference; shown only with its basis */
  ror?: number | null;
}

/**
 * A rolling multi-year period ending on a date (RBC survey table "Four year periods ending June 30": columns 2026, 2025,
 * 2024, 2023 are the 4-year annualized periods ending June 30 of each year).
 */
interface RollingPercentileRow {
  /** end of the period, YYYY-MM-DD */
  end: string;
  /** length of the period in years (4 for the RBC survey table) */
  years: number;
  percentile: number | null;
  ror?: number | null;
}

/**
 * A ranking from RBC Investor Services (pooled fund survey), eVestment, LSEG Lipper or GMR. Shown publicly only when
 * `confirmed` and complete (source URL, as-of date, class, category, at least one period) and not older than the
 * staleness limit. A draft (not confirmed) is admin-only: it never reaches a public page.
 */
export interface ThirdPartyRanking {
  provider: ThirdPartyProvider;
  /** class / vehicle the ranking is for, as the source names it ("Class F"); may be empty when `scope` is "fund" */
  classLabel: string;
  /** "fund": the source ranks the fund (or its strategy) as a whole, not a series (RBC pooled fund survey) */
  scope?: "fund";
  /** basis of the figures as the source states it ("gross of management fees, in Canadian dollars"); shown next to them */
  basis?: L;
  /** FundServ code when the ranking is for one series (must be a class of the fund) */
  fundserv?: string;
  /** peer group / category as the source names it */
  category: L;
  /** end of the period measured (quarter end for the RBC survey), YYYY-MM-DD; "" in a draft */
  asOf: string;
  /** edition of the survey or report ("Q2 2026"), when the source has one */
  edition?: string;
  rows: PercentileRow[];
  /** rolling multi-year periods ending on given dates, when the source has them */
  rolling?: RollingPercentileRow[];
  /** the figures use the strategy's track record since this month (YYYY-MM), incl. periods before the fund's launch */
  trackSince?: string;
  /** where in the source (e.g. "page 21 of 57"), admin reference */
  sourceRef?: string;
  /** public page or PDF the figures were read from (https) */
  url?: string;
  /** the admin checked every figure on the source page */
  confirmed?: boolean;
  /** admin-only note (never published) */
  note?: string;
}

export interface FundRankings {
  fundLibrary?: FundLibraryRanking[];
  morningstar?: MorningstarRating;
  thirdParty?: ThirdPartyRanking[];
}

export interface FundContent {
  hidden?: boolean;
  /** hide specific blocks on the public page (fund AUM is hidden unless `aum: false`) */
  hide?: Partial<Record<HideBlock, boolean>>;
  tagline?: L;
  description?: L;
  objective?: L;
  riskRating?: "low" | "low-medium" | "medium" | "medium-high" | "high";
  managementFee?: string;
  performanceFee?: string;
  mer?: string;
  minInvestment?: string;
  distributions?: L;
  /** FundServ code highlighted on the page (the class whose NAV headlines) */
  headlineClass?: string;
  /**
   * Which classes are offered by prospectus and which by offering memorandum, by FundServ code. Nothing is shown for a
   * class until its type is set here or known in the registry (src/config/funds.ts); "none" hides a registry default.
   */
  classTypes?: Record<string, ClassType>;
  /** fund facts shown only when filled: subsequent minimum, RSP eligibility, liquidity (redemption), CIFSC category */
  minSubsequent?: string;
  rspEligible?: "yes" | "no";
  liquidity?: L;
  cifscCategory?: L;
  /** third-party rankings and ratings (Fundata category rank / quartile, Morningstar); updated manually */
  rankings?: FundRankings;
  /** footnotes shown under performance, EN/FR */
  performanceNote?: L;
  managers?: string[];
  /** freeze: keep showing this snapshot id instead of the latest one for this fund */
  pinnedSnapshot?: string | null;
}

export interface SiteContent {
  version: number;
  updatedAt: string;
  updatedBy: string;
  firm: {
    aumLabel?: L; // e.g. "$1.9B" (firm AUM incl. mandates is not in the dataplatform)
    announcement?: L | null;
    disclaimer?: L;
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
  /** third-party rankings: an entry whose as-of date is older than `maxAgeMonths` is hidden (default 6) */
  rankingPolicy?: { maxAgeMonths: number };
  /** contact form messages: deleted `retentionDays` after receipt (default 180, 30-180; src/lib/contact/store.ts) */
  inquiryPolicy?: { retentionDays: number };
}
