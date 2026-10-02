/**
 * Where each fund's data comes from (dataplatform short names, FTSE index keys, analytics series, factsheet
 * keys). Internal: pipeline / server only, never imported by a client component (tests/unit/site/client-imports.test.ts).
 * Dependency-free (plain TS) for Node type stripping.
 */
import type { FundKey } from "../data/types.ts";

/**
 * One class series of the dataplatform monthly-net-returns endpoint (`class_code`, `history=full`; dataplatform PR #626).
 * `legacy`: the class the endpoint serves without parameters (and the analytics history belongs to): the series the
 * pipeline has always built, cross-checked with the factsheets.
 */
export interface ClassSeriesSource {
  fundserv: string;
  /** class label as the register shows it; the answer must say the same (`class_display`) */
  display: string;
  classCode: "STRATEGY" | "STRATEGY_H";
  legacy?: true;
}

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
  /** class the legacy (parameterless) series belongs to, the label its performance carries on the site */
  returnClassLabel: "FP" | "F" | "H" | null;
  /**
   * classes with a monthly series at the dataplatform, per FundServ code. Monthly Income F (LDM081) has none yet: the
   * endpoint only knows STRATEGY (= FP LDM001) for it, so that class stays "coming soon" until the dataplatform serves it.
   */
  classSeries: ClassSeriesSource[];
  /** variants of a strategy in the factsheet archive (Global Minimum Volatility), default first; null otherwise */
  variants: { id: string; key: string }[] | null;
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
    classSeries: [{ fundserv: "LDM001", display: "FP", classCode: "STRATEGY", legacy: true }],
    variants: null,
    factsheet: { file: "bonds_data", key: "SEST" },
  },
  "sustainable-enhanced-bonds": {
    dataplatform: "SEB",
    ftseIndex: "univ",
    analytics: "Nymbus Sustainable Enhanced Bonds",
    // the parameterless dataplatform series (and the analytics history) is STRATEGY_H = class H: labelled H. Class F
    // (LDM201, STRATEGY) comes from `class_code=STRATEGY&history=full` (PR #626) and becomes the headline when served.
    returnClassLabel: "H",
    classSeries: [
      { fundserv: "LDM201", display: "F", classCode: "STRATEGY" },
      { fundserv: "LDM202", display: "H", classCode: "STRATEGY_H", legacy: true },
    ],
    variants: null,
    factsheet: { file: "bonds_data", key: "QCFI-SEB" },
  },
  "multi-strategy": {
    dataplatform: "Multistrat",
    ftseIndex: null,
    analytics: "Nymbus Multistrategy (Inc. discretionary strats history)",
    returnClassLabel: "F",
    classSeries: [{ fundserv: "LDM301", display: "F", classCode: "STRATEGY", legacy: true }],
    variants: null,
    factsheet: { file: "factsheet_data", key: "Multistrategy" },
  },
  "global-minimum-volatility": {
    dataplatform: null,
    ftseIndex: null,
    analytics: null,
    returnClassLabel: null,
    classSeries: [],
    // target downside volatility 6 % (default), 3 % and 9 %: one factsheet block each
    variants: [{ id: "6", key: "GMV_6pct" }, { id: "3", key: "GMV_3pct" }, { id: "9", key: "GMV_9pct" }],
    factsheet: { file: "factsheet_data", key: "GMV_6pct" },
  },
};

/** Sources of one fund (every registry key has an entry). */
export const fundSources = (key: FundKey): FundSources => FUND_SOURCES[key];
