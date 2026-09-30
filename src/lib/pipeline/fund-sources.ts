/**
 * Where each fund's data comes from (dataplatform short names, FTSE index keys, analytics series, factsheet
 * keys). Internal: pipeline / server only, never imported by a client component (tests/unit/site/client-imports.test.ts).
 * Dependency-free (plain TS) for Node type stripping.
 */
import type { FundKey } from "../data/types.ts";

export interface FundSources {
  /** dataplatform `short_name` for monthly-net-returns / nav-timeseries / aum / holdings (null: no fund vehicle) */
  dataplatform: "SEST" | "SEB" | "Multistrat" | null;
  /**
   * FTSE index-summary short_name, used for index months the published factsheet does not cover yet
   * (the factsheet's own index tables are the primary source of every index figure). null: no benchmark
   */
  ftseIndex: string | null;
  /** series name in the analytics repo fund_returns.json (official monthly history before the Apex cutover) */
  analytics: string | null;
  /** class the published performance is labelled with on the site (business decision: FP / F) */
  returnClassLabel: "FP" | "F" | null;
  /** factsheet archive: file prefix and fund key inside it */
  factsheet: { file: "bonds_data" | "factsheet_data"; key: string } | null;
}

export const FUND_SOURCES: Record<FundKey, FundSources> = {
  "monthly-income": {
    dataplatform: "SEST",
    // Every index figure is computed from this FTSE series (dataplatform index-summary levels). The
    // factsheet producer used the XSB ETF until 2026-04 and FTSE short_corp afterwards: its published
    // index figures are only a cross-check. Override with FTSE_INDEX_SEST.
    ftseIndex: "short_corp",
    analytics: "Nymbus Monthly Income",
    returnClassLabel: "FP",
    factsheet: { file: "bonds_data", key: "SEST" },
  },
  "sustainable-enhanced-bonds": {
    dataplatform: "SEB",
    ftseIndex: "univ",
    analytics: "Nymbus Sustainable Enhanced Bonds",
    // the dataplatform track record is the STRATEGY_H (class H) series; the site labels it class F
    returnClassLabel: "F",
    factsheet: { file: "bonds_data", key: "QCFI-SEB" },
  },
  "multi-strategy": {
    dataplatform: "Multistrat",
    ftseIndex: null,
    analytics: "Nymbus Multistrategy (Inc. discretionary strats history)",
    returnClassLabel: "F",
    factsheet: { file: "factsheet_data", key: "Multistrategy" },
  },
  "global-minimum-volatility": {
    dataplatform: null,
    ftseIndex: null,
    analytics: null,
    returnClassLabel: null,
    factsheet: { file: "factsheet_data", key: "GMV_6pct" },
  },
};

/** Sources of one fund (every registry key has an entry). */
export const fundSources = (key: FundKey): FundSources => FUND_SOURCES[key];
