/**
 * Where each fund's data comes from (dataplatform short names, FTSE index keys, analytics series, factsheet
 * keys). Internal: pipeline / server only, never imported by a client component (tests/unit/site/client-imports.test.ts).
 * Dependency-free (plain TS) for Node type stripping.
 */
import type { FundKey } from "../data/types.ts";

/** dataplatform monthly-net-returns `class_code`: "STRATEGY" = the fund's F / FP class, "STRATEGY_H" = SEB's H class */
export type ClassCode = "STRATEGY" | "STRATEGY_H";

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
  /**
   * Class of the monthly track record when no full-history class is confirmed: the class of the analytics series,
   * of the dataplatform default (Apex) months and of every publication made before classes were tracked.
   */
  trackRecordClass: ClassCode | null;
  /**
   * Class asked from monthly-net-returns with `history=full` (Gabriel 2026-10-01: SEB shown as Class F). Used for
   * every month, with no analytics month, only when the response confirms that class from the track-record start;
   * otherwise the trackRecordClass sources are used. null: no preferred class.
   */
  preferredClass: ClassCode | null;
  /**
   * Class of the fund returns each factsheet archive publishes (monthly table, trailing, statistics), by archive
   * month: the first entry whose `until` (YYYY-MM, inclusive) is not before the archive month, the last entry having
   * no `until`. Read with factsheetClassAt().
   */
  factsheetClass: { until?: string; class: ClassCode }[];
  /**
   * Site label of each class code. The label shown is ALWAYS derived from the class of the data actually used
   * (never a business label that can disagree with it); a class without a label is not shown.
   */
  classLabels: Partial<Record<ClassCode, string>>;
  /** FundServ code of each class (dataplatform `fundserv`, fund register), checked against the payload */
  classFundserv: Partial<Record<ClassCode, string>>;
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
    trackRecordClass: "STRATEGY",
    preferredClass: null,
    factsheetClass: [{ class: "STRATEGY" }],
    classLabels: { STRATEGY: "FP" },
    classFundserv: { STRATEGY: "LDM001" },
    variants: null,
    factsheet: { file: "bonds_data", key: "SEST" },
  },
  "sustainable-enhanced-bonds": {
    dataplatform: "SEB",
    ftseIndex: "univ",
    analytics: "Nymbus Sustainable Enhanced Bonds",
    // analytics history and the dataplatform default track record are the H class (STRATEGY_H); the F class
    // (STRATEGY) is used once the dataplatform serves its full history (dataplatform PR #626). The factsheet
    // generator published SEB as class F up to the 2026-07 archive and as class H from 2026-08 (fdc2b35..fed3af3)
    trackRecordClass: "STRATEGY_H",
    preferredClass: "STRATEGY",
    factsheetClass: [{ until: "2026-07", class: "STRATEGY" }, { class: "STRATEGY_H" }],
    classLabels: { STRATEGY: "F", STRATEGY_H: "H" },
    classFundserv: { STRATEGY: "LDM201", STRATEGY_H: "LDM202" },
    variants: null,
    factsheet: { file: "bonds_data", key: "QCFI-SEB" },
  },
  "multi-strategy": {
    dataplatform: "Multistrat",
    ftseIndex: null,
    analytics: "Nymbus Multistrategy (Inc. discretionary strats history)",
    trackRecordClass: "STRATEGY",
    preferredClass: null,
    factsheetClass: [{ class: "STRATEGY" }],
    classLabels: { STRATEGY: "F" },
    classFundserv: { STRATEGY: "LDM301" },
    variants: null,
    factsheet: { file: "factsheet_data", key: "Multistrategy" },
  },
  "global-minimum-volatility": {
    dataplatform: null,
    ftseIndex: null,
    analytics: null,
    trackRecordClass: null,
    preferredClass: null,
    factsheetClass: [],
    classLabels: {},
    classFundserv: {},
    // target downside volatility 6 % (default), 3 % and 9 %: one factsheet block each
    variants: [{ id: "6", key: "GMV_6pct" }, { id: "3", key: "GMV_3pct" }, { id: "9", key: "GMV_9pct" }],
    factsheet: { file: "factsheet_data", key: "GMV_6pct" },
  },
};

/** Sources of one fund (every registry key has an entry). */
export const fundSources = (key: FundKey): FundSources => FUND_SOURCES[key];

/** Site label of a class code for a fund ("F", "H", "FP"), or null when the class is unknown for that fund. */
export function classLabel(key: FundKey, code: string | null | undefined): string | null {
  if (!code) return null;
  return (FUND_SOURCES[key].classLabels as Record<string, string | undefined>)[code] ?? null;
}

/** Class of the fund returns published in the factsheet archive of `month` (YYYY-MM or a date), or null. */
export function factsheetClassAt(key: FundKey, month: string): ClassCode | null {
  const m = month.slice(0, 7);
  for (const e of FUND_SOURCES[key].factsheetClass) if (!e.until || m <= e.until) return e.class;
  return null;
}

/** One class series of a net fund: its FundServ code, site label and dataplatform class code. */
export interface ClassSeriesSource {
  fundserv: string;
  display: string;
  classCode: ClassCode;
}

/** Classes of a fund that can have a monthly series (dataplatform `class_code`), from the class configuration. */
export function classSeriesOf(key: FundKey): ClassSeriesSource[] {
  const src = FUND_SOURCES[key];
  const out: ClassSeriesSource[] = [];
  for (const code of Object.keys(src.classLabels) as ClassCode[]) {
    const fundserv = src.classFundserv[code];
    const display = src.classLabels[code];
    if (fundserv && display) out.push({ fundserv, display, classCode: code });
  }
  return out;
}
