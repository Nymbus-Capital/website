/**
 * Pipeline-only settings per fund (complements the public registry in src/config/funds.ts).
 * Dependency-free.
 */
import type { FundKey } from "../data/types.ts";
import type { Method } from "./metrics.ts";

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
}

export const PIPELINE_FUNDS: Record<FundKey, PipelineFundSpec> = {
  // dataplatform monthly_net_returns._TRACK_RECORDS
  "monthly-income": { trackStart: "2019-01-31", apexKey: "monthly_income", method: "compounded" },
  "sustainable-enhanced-bonds": { trackStart: "2019-02-28", apexKey: "sustainable_enhanced_bonds", method: "compounded" },
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

/** Tolerances (decimal returns). */
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
};

export const DEFAULT_SCHEDULE = "06:45,12:45,18:45";
export const TIMEZONE = "America/Toronto" as const;
export const SNAPSHOT_RETENTION = 120;
