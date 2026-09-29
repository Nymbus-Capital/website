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

/** Tolerances (decimal returns). */
export const TOL = {
  /** factsheet figures carry one decimal in percent: anything beyond rounding is worth a warning */
  factsheetWarn: 0.0006,
  /** beyond this, a computed trailing return disagrees with the published factsheet: blocking */
  factsheetBlock: 0.005,
  /** a monthly return beyond ±25 % is treated as a data error */
  maxMonthly: 0.25,
  /** a NAV moving more than 10 % in one valuation day is treated as a data error (class dropped) */
  maxNavDayChange: 0.1,
  /** NAV older than this (days) is flagged */
  navStaleDays: 7,
};

export const DEFAULT_SCHEDULE = "06:45,12:45,18:45";
export const TIMEZONE = "America/Toronto" as const;
export const SNAPSHOT_RETENTION = 120;
