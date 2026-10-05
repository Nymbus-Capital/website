/**
 * Where each fund's data comes from (dataplatform short names, FTSE index keys, analytics series, factsheet
 * keys). Internal: pipeline / server only, never imported by a client component (tests/unit/site/client-imports.test.ts).
 * Dependency-free (plain TS) for Node type stripping.
 *
 * Gabriel 2026-10-02: every figure is computed in the website from endpoints that exist on the dataplatform's main
 * branch. The class series are compounded here from the daily `/api/performance/nav-timeseries` rows of each class
 * (daily-chain.ts); no dataplatform change (PR #621, #626, #631) is needed.
 */
import type { FundKey } from "../data/types.ts";
import { FUNDS } from "../../config/funds.ts";

/**
 * Class code of a monthly series. "STRATEGY" / "STRATEGY_H" are the dataplatform monthly-net-returns names ("STRATEGY"
 * = the fund's F / FP class, "STRATEGY_H" = SEB's H class); a class the dataplatform has no aggregate for is named by
 * its FundServ code (e.g. "LDM081", Monthly Income class F).
 */
export type ClassCode = "STRATEGY" | "STRATEGY_H" | `LDM${string}`;

export interface FeeBand { minDiff: number; maxDiff: number; maxFromMedian: number }

export interface FundSources {
  /** dataplatform `short_name` for monthly-net-returns / nav-timeseries / aum / holdings (null: no fund vehicle) */
  dataplatform: "SEST" | "SEB" | "Multistrat" | null;
  /** FTSE index-summary short_name of the benchmark (every index figure is computed from its levels). null: no benchmark */
  ftseIndex: string | null;
  /**
   * Earlier FTSE short_names to try for the benchmark's history before its current name (checked by equal daily returns
   * on common days before being chain-linked, metrics.ts joinFtseHistory); names sharing the index_id or the published
   * name are tried too. Optional.
   */
  ftseAliases?: string[];
  /** series name in the analytics repo fund_returns.json: the strategy track record before the class's own NAV history */
  analytics: string | null;
  /**
   * Class of the monthly track record (the headline series): the class of the analytics series and of the dataplatform
   * monthly-net-returns default; every publication made before classes were tracked is of this class.
   */
  trackRecordClass: ClassCode | null;
  /**
   * First day of the fund's own NAV history at the dataplatform: the fund register's `fund_data_start` (apex.fund; not
   * served by /api/apex/funds, so mirrored here — keep equal to the register). Earlier rows under the same fund code
   * belong to another strategy (SEST is a reused code) or are placeholders. Never before the register's `inception`
   * when /api/apex/funds gives one (build.ts effectiveNavStart). A class's computed series starts at its first complete
   * month on or after this day and its own first valuation. null: no class series.
   */
  navStart: string | null;
  /**
   * Earliest possible class inception (the day the fund's book began under its code), or null. A class's inception is the
   * first price of its current continuous run of NAVs (class-returns.ts); a run reaching back before this day is cut here
   * (rows of a reused fund code before it belong to another strategy even without a gap).
   */
  classFloor: string | null;
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
  /** FundServ code of each class (nav-timeseries `fundserv`, fund register) */
  classFundserv: Partial<Record<ClassCode, string>>;
  /**
   * Fee band of another class against the track-record class, month by month (class − track): total returns of two
   * classes of one book differ by their fees only, so the difference stays in [minDiff, maxDiff] and within maxFromMedian
   * of its median. A breach (e.g. a distribution missed by one class) drops that class (warn + alert). null: no band for
   * this fund (its classes may differ by more than a fixed fee, `classSpreadNote` says why); the other class gates apply.
   */
  classSpread: FeeBand | null;
  /** why a fund has no fee band (shown in the class's issues and provenance) */
  classSpreadNote?: string;
  /**
   * variants of a strategy in the factsheet archive (Global Minimum Volatility), default first (its data is the fund's
   * own); null otherwise. Pipeline order only: pages show the variants in src/config/funds.ts order (3 %, 6 %, 9 %)
   */
  variants: { id: string; key: string }[] | null;
  /** factsheet archive: file prefix and fund key inside it */
  factsheet: { file: "bonds_data" | "factsheet_data"; key: string } | null;
}

/** symmetric fee band: two classes of one book within ±30 bp a month and ±5 bp around their median difference */
const DEFAULT_SPREAD: FeeBand = { minDiff: -0.003, maxDiff: 0.003, maxFromMedian: 0.0005 };

export const FUND_SOURCES: Record<FundKey, FundSources> = {
  "monthly-income": {
    dataplatform: "SEST",
    // Every index figure is computed from this FTSE series (dataplatform index-summary levels). The factsheet producer
    // used the XSB ETF until 2026-04 and FTSE short_corp afterwards: its published index figures are only a cross-check.
    // Override with FTSE_INDEX_SEST.
    ftseIndex: "short_corp",
    analytics: "Nymbus Monthly Income",
    trackRecordClass: "STRATEGY",
    // register fund_data_start (= inception): SEST is a reused fund code, the Monthly Income book starts at the 2021-10-05 re-seed
    navStart: "2021-10-05",
    classFloor: "2021-10-05",
    factsheetClass: [{ class: "STRATEGY" }],
    classLabels: { STRATEGY: "FP", LDM081: "F" },
    classFundserv: { STRATEGY: "LDM001", LDM081: "LDM081" },
    // F − FP is not a fixed fee difference: FP may carry a performance fee, so no monthly band is reliable. Class F stays
    // gated by its own complete daily chain, the CIBC verification of the headline, plausibility and revision checks
    classSpread: null,
    classSpreadNote: "class FP may carry a performance fee: F − FP is not a fixed fee difference",
    variants: null,
    factsheet: { file: "bonds_data", key: "SEST" },
  },
  "sustainable-enhanced-bonds": {
    dataplatform: "SEB",
    ftseIndex: "univ",
    // FTSE's summary feed named the universe "univ_overall" before its 2024-12 naming generation (factsheet-generator
    // ftse_index_engine SUBINDEX_SPECS): tried first, joined only on equal daily returns
    ftseAliases: ["univ_overall"],
    analytics: "Nymbus Sustainable Enhanced Bonds",
    // analytics history and the dataplatform default track record are the H class (STRATEGY_H). The F class (STRATEGY,
    // LDM201) is computed from its own daily NAV chain since the fund's data start (register fund_data_start); its strategy months
    // before that exist only as stored monthly figures that no dataplatform endpoint serves. The factsheet generator
    // published SEB as class F up to the 2026-07 archive and as class H from 2026-08 (fdc2b35..fed3af3)
    trackRecordClass: "STRATEGY_H",
    navStart: "2023-07-01",
    // no reused code: each class's own run decides its inception
    classFloor: null,
    factsheetClass: [{ until: "2026-07", class: "STRATEGY" }, { class: "STRATEGY_H" }],
    classLabels: { STRATEGY: "F", STRATEGY_H: "H" },
    classFundserv: { STRATEGY: "LDM201", STRATEGY_H: "LDM202" },
    // F − H: H carries the higher fee (reference: July 2026 ≈ +11.6 bp)
    classSpread: { minDiff: -0.0005, maxDiff: 0.003, maxFromMedian: 0.0005 },
    variants: null,
    factsheet: { file: "bonds_data", key: "QCFI-SEB" },
  },
  "multi-strategy": {
    dataplatform: "Multistrat",
    ftseIndex: null,
    analytics: "Nymbus Multistrategy (Inc. discretionary strats history)",
    trackRecordClass: "STRATEGY",
    navStart: "2023-07-01",
    // some classes were priced before the register's fund data start: each class's own run decides its inception
    classFloor: null,
    factsheetClass: [{ class: "STRATEGY" }],
    classLabels: { STRATEGY: "F" },
    classFundserv: { STRATEGY: "LDM301" },
    classSpread: DEFAULT_SPREAD,
    variants: null,
    factsheet: { file: "factsheet_data", key: "Multistrategy" },
  },
  "global-minimum-volatility": {
    dataplatform: null,
    ftseIndex: null,
    analytics: null,
    trackRecordClass: null,
    navStart: null,
    classFloor: null,
    factsheetClass: [],
    classLabels: {},
    classFundserv: {},
    classSpread: null,
    // target downside volatility 6 % (default), 3 % and 9 %: one factsheet block each. No dataplatform endpoint serves
    // these strategy series (their live track records sit in the dataplatform's internal bbg2 mirror only)
    variants: [{ id: "6", key: "GMV_6pct" }, { id: "3", key: "GMV_3pct" }, { id: "9", key: "GMV_9pct" }],
    factsheet: { file: "factsheet_data", key: "GMV_6pct" },
  },
};

/** Sources of one fund (every registry key has an entry). */
export const fundSources = (key: FundKey): FundSources => FUND_SOURCES[key];

/**
 * Site label of a class code for a fund ("F", "H", "FP"), or null when the class is unknown for that fund. A class named by
 * its FundServ code (no dataplatform aggregate) takes the registry's display (src/config/funds.ts `classes`).
 */
export function classLabel(key: FundKey, code: string | null | undefined): string | null {
  if (!code) return null;
  const own = (FUND_SOURCES[key].classLabels as Record<string, string | undefined>)[code];
  if (own) return own;
  if (!/^LDM\d+$/.test(code) || !Object.keys(FUND_SOURCES[key].classLabels).length) return null;
  return FUNDS.find((f) => f.key === key)?.classes.find((c) => c.fundserv === code)?.display ?? null;
}

/** Class of the fund returns published in the factsheet archive of `month` (YYYY-MM or a date), or null. */
export function factsheetClassAt(key: FundKey, month: string): ClassCode | null {
  const m = month.slice(0, 7);
  for (const e of FUND_SOURCES[key].factsheetClass) if (!e.until || m <= e.until) return e.class;
  return null;
}

/** One class series of a net fund: its FundServ code, site label and class code. */
export interface ClassSeriesSource {
  fundserv: string;
  display: string;
  classCode: ClassCode;
}

/** a share class as the fund register lists it (/api/apex/funds) */
export interface RegisterClass { fundserv: string; display: string; currency?: string | null; status?: string | null }

/**
 * Classes of a fund that can have a monthly series: the configured classes (class code mapping of the dataplatform
 * aggregates), the registry's classes (src/config/funds.ts) and, when given, the fund register's ACTIVE classes — a
 * register class unknown to the configuration is named by its FundServ code with the register's display. When the
 * register is given, a configured class it does not list as active is left out (never the track-record class).
 * Order: configured class codes first, then the registry's order, then the register's.
 */
export function classSeriesOf(key: FundKey, register?: RegisterClass[] | null): ClassSeriesSource[] {
  const src = FUND_SOURCES[key];
  if (!Object.keys(src.classLabels).length) return [];
  const out: ClassSeriesSource[] = [];
  const seen = new Set<string>();
  const add = (c: ClassSeriesSource): void => { if (!seen.has(c.fundserv)) { seen.add(c.fundserv); out.push(c); } };
  for (const code of Object.keys(src.classLabels) as ClassCode[]) {
    const fundserv = src.classFundserv[code];
    const display = src.classLabels[code];
    if (fundserv && display) add({ fundserv, display, classCode: code });
  }
  for (const c of FUNDS.find((f) => f.key === key)?.classes ?? []) add({ fundserv: c.fundserv, display: c.display, classCode: c.fundserv as ClassCode });
  for (const c of register ?? []) {
    if (c.status === "active" && /^LDM\d+$/.test(c.fundserv) && c.display) add({ fundserv: c.fundserv, display: c.display, classCode: c.fundserv as ClassCode });
  }
  if (register) {
    const active = new Set(register.filter((c) => c.status === "active").map((c) => c.fundserv));
    const track = trackFundserv(key);
    return out.filter((c) => active.has(c.fundserv) || c.fundserv === track);
  }
  return out;
}

/** FundServ code of the track-record class (the headline series), or null. */
export function trackFundserv(key: FundKey): string | null {
  const src = FUND_SOURCES[key];
  return src.trackRecordClass ? src.classFundserv[src.trackRecordClass] ?? null : null;
}
