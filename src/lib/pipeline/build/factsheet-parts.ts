// factsheet-parts.ts — characteristics, breakdowns, top holdings and ESG metrics from the factsheet archive
import type { FundSpec } from "../../../config/funds.ts";
import type { Characteristic, FundData } from "../../data/types.ts";
import { ym } from "../../data/dates.ts";
import { FUND_SOURCES } from "../fund-sources.ts";
import {
  BOND_CHARACTERISTICS,
  ESG_METRICS,
  isObj,
  MULTISTRAT_CHARACTERISTICS,
  parseAllocationSeries,
  parseBuckets,
  parseCharacteristicTable,
  parseFlatCharacteristics,
  parseHoldings,
  type Obj,
} from "../parse.ts";
import type { RawPayloads } from "../raw.ts";
import { carriedNoteFor, type Ctx, type PartState } from "./context.ts";
import { factsheetBlock } from "./factsheets.ts";

export interface FsParts {
  characteristics: Characteristic[];
  breakdowns: FundData["breakdowns"];
  topHoldings: FundData["topHoldings"];
  esg: Characteristic[];
  factsheetMonth: string | null;
}

/** Newest factsheet archive block → characteristics, breakdowns, holdings, ESG; a failure keeps the previous ones. */
export function buildFactsheetParts(
  raw: RawPayloads,
  spec: FundSpec,
  prev: FsParts | undefined,
  perfAsOf: string | null,
  c: Ctx,
  base: string,
  variantKey?: string,
): { parts: FsParts; state: PartState } {
  const keep = (why: string): { parts: FsParts; state: PartState } => {
    const hasPrev =
      !!prev &&
      (prev.characteristics.length > 0 ||
        Object.keys(prev.breakdowns).length > 0 ||
        prev.topHoldings.length > 0 ||
        prev.esg.length > 0);
    c.warn(
      `${base}.factsheet`,
      `${why}; ${hasPrev ? `previous factsheet data (${prev!.factsheetMonth ?? "?"}) kept` : "no factsheet data shown"}`,
    );
    if (hasPrev) c.prov[`${base}.factsheet`] = carriedNoteFor(c, base, "factsheet");
    return {
      parts: prev
        ? {
            characteristics: prev.characteristics,
            breakdowns: prev.breakdowns,
            topHoldings: prev.topHoldings,
            esg: prev.esg,
            factsheetMonth: prev.factsheetMonth,
          }
        : { characteristics: [], breakdowns: {}, topHoldings: [], esg: [], factsheetMonth: null },
      state: hasPrev ? "carried" : "none",
    };
  };
  const fs = FUND_SOURCES[spec.key].factsheet;
  if (!fs)
    return {
      parts: { characteristics: [], breakdowns: {}, topHoldings: [], esg: [], factsheetMonth: null },
      state: "none",
    };
  if (!raw.factsheets.ok) return keep(`factsheet archives unavailable (${raw.factsheets.error ?? "not fetched"})`);
  const blk = factsheetBlock(raw, spec, undefined, variantKey);
  if (!blk)
    return keep(
      `"${variantKey ?? fs.key}" not found in ${fs.file} archives (${raw.factsheets.data?.tried.filter((t) => t.startsWith(fs.file)).join(", ")})`,
    );
  if (prev?.factsheetMonth && blk.month < prev.factsheetMonth)
    return keep(`newest ${fs.file} archive (${blk.month}) is older than the published one (${prev.factsheetMonth})`);
  const b = blk.block;
  const snap = isObj(b["Portfolio Snapshot"]) ? (b["Portfolio Snapshot"] as Obj) : {};
  let parts: FsParts;
  if (fs.file === "bonds_data") {
    const breakdowns: FundData["breakdowns"] = {};
    const credit = parseBuckets(snap["Credit Ratings"]);
    const sectors = parseBuckets(snap["Sectors"]);
    const curve = parseBuckets(snap["Curve"]);
    const country = parseBuckets(snap["Country"]);
    if (credit.length) breakdowns.credit = credit;
    if (sectors.length) breakdowns.sectors = sectors;
    if (curve.length) breakdowns.curve = curve;
    if (country.length) breakdowns.country = country;
    parts = {
      characteristics: parseCharacteristicTable(b["Characteristics"], BOND_CHARACTERISTICS),
      breakdowns,
      topHoldings: parseHoldings(snap["Top 10 Holdings"]),
      esg: parseCharacteristicTable(b["ESG Metrics"], ESG_METRICS),
      factsheetMonth: blk.month,
    };
  } else {
    const breakdowns: FundData["breakdowns"] = {};
    const sectors = parseBuckets(snap["Equity Sectors Allocation"]);
    const country = parseBuckets(snap["Equity Country Allocation"]);
    const alloc = parseAllocationSeries(snap["Systematic Strategies Allocation"]);
    if (sectors.length) breakdowns.sectors = sectors;
    if (country.length) breakdowns.country = country;
    if (alloc) {
      breakdowns.assetClass = alloc.buckets;
      c.prov[`${base}.breakdowns.assetClass`] =
        `factsheet ${blk.name} "Systematic Strategies Allocation" averaged over ${alloc.from} to ${alloc.to}`;
    }
    const holdings = parseHoldings(snap["Top 10 Holdings"]);
    parts = {
      characteristics: isObj(b["Characteristics"])
        ? parseFlatCharacteristics(b["Characteristics"], MULTISTRAT_CHARACTERISTICS)
        : [],
      breakdowns,
      topHoldings: holdings.length ? holdings : parseHoldings(snap["Top 10 Futures"]),
      esg: [],
      factsheetMonth: blk.month,
    };
  }
  if (perfAsOf && blk.month < ym(perfAsOf))
    c.info(`${base}.factsheet`, `latest factsheet archive is ${blk.month} (performance as of ${ym(perfAsOf)})`);
  c.prov[`${base}.factsheet`] =
    `factsheet archive ${blk.name} (${raw.factsheets.data?.where ?? "?"}), key ${variantKey ?? fs.key}: characteristics, breakdowns, top holdings${fs.file === "bonds_data" ? ", ESG metrics" : ""}`;
  return { parts, state: "fresh" };
}
