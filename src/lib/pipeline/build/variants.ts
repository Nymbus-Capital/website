// variants.ts — strategy variants (GMV downside volatility levels), one factsheet block each
import type { FundSpec } from "../../../config/funds.ts";
import type { FundData, Performance, RiskStats, VariantData } from "../../data/types.ts";
import { ym } from "../../data/dates.ts";
import { FUND_SOURCES } from "../fund-sources.ts";
import type { RawPayloads } from "../raw.ts";
import type { Ctx } from "./context.ts";
import { buildFactsheetPerformance } from "./factsheet-performance.ts";
import { buildFactsheetParts, type FsParts } from "./factsheet-parts.ts";

/** Variants of a strategy (GMV): one factsheet block each; the default variant's data is the fund's own. */
export function buildVariants(
  raw: RawPayloads, spec: FundSpec, prev: FundData | undefined,
  own: { performance: Performance | null; risk: RiskStats | null; risk3Y: RiskStats | null; fp: FsParts }, c: Ctx, base: string,
): Record<string, VariantData> | undefined {
  const defs = FUND_SOURCES[spec.key].variants;
  if (!defs?.length) return undefined;
  const out: Record<string, VariantData> = {};
  defs.forEach((v, i) => {
    if (i === 0) {
      out[v.id] = { variant: v.id, performance: own.performance, risk: own.risk, risk3Y: own.risk3Y, ...own.fp };
      return;
    }
    const vb = `${base}.variants.${v.id}`;
    const old = prev?.variants?.[v.id];
    const pb = buildFactsheetPerformance(raw, spec, old?.performance, c, vb, v.key);
    if (!pb?.performance) {
      if (old) {
        out[v.id] = old;
        c.warn(`${vb}.performance`, `variant ${v.id} %: no usable factsheet block "${v.key}"; previous publication kept (as of ${old.performance ? ym(old.performance.asOf) : "?"})`);
      } else c.warn(`${vb}.performance`, `variant ${v.id} %: no usable factsheet block "${v.key}"; the variant is not shown`);
      return;
    }
    const fp = buildFactsheetParts(raw, spec, old, pb.performance.asOf, c, vb, v.key);
    out[v.id] = { variant: v.id, performance: pb.performance, risk: pb.risk, risk3Y: pb.risk3Y, ...fp.parts };
  });
  return out;
}
