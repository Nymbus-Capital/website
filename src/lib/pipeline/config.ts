/**
 * Pipeline-only settings per fund (complements the public registry in src/config/funds.ts).
 * Dependency-free.
 */
import type { FundKey } from "../data/types.ts";
import type { Method } from "./metrics.ts";
import { PORTFOLIO_MAX_AGE_DAYS } from "../data/freshness.ts";
import { MIN_CLASS_HISTORY_MONTHS } from "../../config/funds.ts";

export interface PipelineFundSpec {
  /** first month of the official track record (month-end); null: first month of the source series */
  trackStart: string | null;
  /** dataplatform fund-register key (/api/apex/funds) */
  apexKey: string | null;
  /**
   * return aggregation: "compounded" for the funds; "arithmetic" for the GMV overlay, whose factsheet
   * figures are computed on notional without reinvestment (factsheet-generator `compounded: False`)
   */
  method: Method;
  /** publish the green-bond weight of the daily portfolio (the sustainable fund reports it) */
  greenBonds?: boolean;
}

export const PIPELINE_FUNDS: Record<FundKey, PipelineFundSpec> = {
  // dataplatform monthly_net_returns._TRACK_RECORDS
  "monthly-income": { trackStart: "2019-01-31", apexKey: "monthly_income", method: "compounded" },
  "sustainable-enhanced-bonds": { trackStart: "2019-02-28", apexKey: "sustainable_enhanced_bonds", method: "compounded", greenBonds: true },
  "multi-strategy": { trackStart: "2019-01-31", apexKey: "multistrategy", method: "compounded" },
  "global-minimum-volatility": { trackStart: null, apexKey: null, method: "arithmetic" },
};

/**
 * The factsheet producer's index series is the XSB / XBB ETF until 2026-04-30 and FTSE (short_corp / univ)
 * afterwards (factsheet-generator FTSE_RETURNS_LEGACY_CUTOFF). The site computes every index figure from
 * FTSE; the published index figures are compared with it: differences before this month are expected
 * (info), after it they are warnings.
 */
export const FTSE_COMPARABLE_FROM = "2026-05-31";

/** difference between two published-precision monthly index returns (2 decimals in %) */
export const INDEX_MONTHLY_TOL = 0.00006;

const SHORT_PERIODS = new Set(["1M", "3M", "YTD", "1Y"]);

/**
 * Tolerances of a computed trailing return vs the published factsheet figure with `decimals` decimals
 * (percent units): up to `round` it is rounding; up to `block` a warning; beyond, blocking.
 */
export function factsheetTolerance(period: string, decimals = 1): { round: number; block: number } {
  const half = (0.5 * 10 ** -decimals) / 100;
  return { round: half + 1e-9, block: half + (SHORT_PERIODS.has(period) ? 0.0005 : 0.001) + 1e-9 };
}

/**
 * Default fee band of a non-headline class (compounded from its own daily NAV chain) against the track-record class of
 * the same months: the monthly difference is a fee difference, so it must stay in [minDiff, maxDiff] and within
 * maxFromMedian of its median. A fund may set its own band (fund-sources.ts classSpread: SEB F − H, July 2026 ≈ +11.6
 * bp). A breach blocks that class's series (previous publication kept).
 */
export const CLASS_SPREAD = { minDiff: -0.0005, maxDiff: 0.003, maxFromMedian: 0.0005 } as const;

export const TOL = {
  /** a monthly return beyond ±25 % is treated as a data error */
  maxMonthly: 0.25,
  /** a NAV moving more than 10 % in one valuation day is treated as a data error (class dropped) */
  maxNavDayChange: 0.1,
  /** NAV / AUM older than this (days) is an alert-level issue */
  navStaleDays: 7,
  /** analytics vs dataplatform monthly return difference worth a warning */
  analyticsVsDataplatform: 5e-6,
  /** revision of an already published month worth a warning + alert */
  revision: 1e-6,
  /** the website's compounding of the Apex daily chain vs dataplatform monthly-net-returns (same rows, same rule) */
  chainVsDataplatform: 1e-8,
  /** stored CIBC daily returns compounded vs the analytics monthly history (a missed distribution is 10 to 100 times this) */
  chainVsAnalytics: 2e-5,
};

/**
 * Per-class returns (class-returns.ts, classes.ts, build.ts buildClasses): every active register class of a fund gets its
 * own monthly series from its own daily nav-timeseries chain, from its inception (first price of its CURRENT run). A month
 * that fails a check is withheld ("—", reason in the admin issues), never estimated or filled from another class; every
 * figure whose window contains a withheld month is withheld too.
 */
export const CLASS_CHECKS = {
  /** regulatory minimum: a class with less than this many months since inception shows no performance figure (compliance) */
  minHistoryMonths: MIN_CLASS_HISTORY_MONTHS,
  /**
   * a gap of more than this many calendar days without a NAV per unit ends a run (earlier rows: a previous life of the code)
   * only when a relaunch is corroborated — the NAV per unit jumps by more than relaunchNavJump across the gap, restarts at a
   * launch price (10.00), or the gap is longer than relaunchLongGapDays; otherwise it is a coverage gap (months withheld)
   */
  relaunchGapDays: 10,
  relaunchNavJump: 0.05,
  relaunchLongGapDays: 180,
  /** history requested from the dataplatform for every class (a run starting within relaunchGapDays of it has an unknown inception) */
  historyFrom: "2019-01-01",
  /**
   * bad valuation print: two consecutive daily returns of opposite sign, both at least `spikeMin` in size, whose combined
   * return is at most `spikeRevert` × the smaller of the two → both months touched are withheld for every class of the fund
   */
  spikeMin: 0.02,
  spikeRevert: 0.5,
  /**
   * cross-class consistency of a COMPLETE month, on the published monthly values. Each class's expected return is
   * a + b × (fund median of the month), a and b fitted per class by Theil–Sen over the months where ≥ 3 classes are
   * complete, LEAVING OUT the month under test (b clipped to [fitSlopeMin, fitSlopeMax], a to ±fitInterceptMax a month;
   * a = 0, b = 1 with fewer than fitMinMonths months): a class without a performance fee legitimately beats the others by a
   * share of a strong month. A residual beyond residualMax is a breach. A breach of a fitted class in a month holding a
   * distribution / price-adjustment day (a class's stored return differing from its NAV ratio − 1 by more than
   * adjustmentMin) withholds the month for EVERY class (the majority of classes can be the wrong side); otherwise one
   * breaching class whose ≥ 2 other complete classes agree is withheld alone, anything else withholds every class. A class
   * with too short a history for a fit is only ever withheld itself.
   */
  residualMax: 0.004,
  adjustmentMin: 0.001,
  fitMinMonths: 12,
  fitSlopeMin: 0.6,
  fitSlopeMax: 1.4,
  fitInterceptMax: 0.003,
  /** a partial inception month (outside the fit) against the other classes over its own days: max(crossAbs, crossRel × |median|) */
  crossAbs: 0.005,
  crossRel: 0.25,
} as const;

/** Daily NAV chain (daily-chain.ts, build.ts): CIBC months are used only after this many months agree with the analytics history. */
export const CHAIN = { minVerifiedMonths: 6 } as const;

/**
 * Daily portfolio (dataplatform /api/apex/fund-portfolio). Selection (build.ts / portfolio.ts): the daily book is the
 * primary source only when its bond book is covered (priced >= 90 % and resolved >= 95 % of the bond weight) and it
 * is recent; each characteristic is shown only when its own coverage is >= 90 %. Otherwise the month-end factsheet
 * figures are shown, with an issue. Gates (validate.ts) drop what is implausible rather than publish it.
 */
export const PORTFOLIO = {
  minPricedWeight: 0.9,
  minResolvedWeight: 0.95,
  minMetricCoverage: 0.9,
  /**
   * a book older than this (whole calendar days) is not "daily" any more: factsheet shown. One rule for the selection,
   * the validation gate and the render-time gate: data/freshness.ts (bookAgeProblem)
   */
  maxAgeDays: PORTFOLIO_MAX_AGE_DAYS,
  /** every breakdown must add up to 100 % of net assets (cash included) within ±3 % */
  weightSumTol: 0.03,
  /** plausible ranges (years, decimal fractions) */
  ranges: { duration: [0, 30], ytm: [-0.05, 0.25], coupon: [0, 0.25], maturity: [0, 100] } as Record<"duration" | "ytm" | "coupon" | "maturity", [number, number]>,
  /** top 10 holdings: each weight in (0, 25 %], together at most 100 % */
  maxHoldingWeight: 0.25,
  /**
   * Month-end cross-check with the factsheet of the same month (warn issues, nothing blocked): modified duration
   * within max(0.25 year, 5 %), yield within 0.30 percentage point (the factsheet "Portfolio Yield"), and the
   * weights of the 3 largest daily sectors that the factsheet also names within 5 percentage points.
   */
  crossCheck: { durationYears: 0.25, durationRel: 0.05, yield: 0.003, sectorWeight: 0.05, sectors: 3, bookWithinDays: 7 },
};

/** Distributions gates (validate.ts): a class whose figures fail is dropped, the others are kept. */
export const DISTRIBUTIONS = {
  /** one distribution per unit above 5 % of the class NAV per unit is treated as a data error */
  maxShareOfNav: 0.05,
  /** the trailing 12-month total above 25 % of the NAV per unit is treated as a data error */
  maxTrailingShareOfNav: 0.25,
  /** calendar-year totals must equal the sum of the year's rows (amounts have 6 decimals) */
  sumTol: 2e-6,
  /** history kept per class (the page shows the last 12, all behind a toggle) */
  maxHistory: 400,
  /**
   * distributions carried over after failed reads are dropped once the source has not been read successfully for more
   * than this many days (a new distribution may have been paid in the meantime)
   */
  maxCarryDays: 10,
};

export const DEFAULT_SCHEDULE = "06:45,12:45,18:45";
export const TIMEZONE = "America/Toronto" as const;
export const SNAPSHOT_RETENTION = 120;
