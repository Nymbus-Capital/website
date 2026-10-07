// site.ts — every fund → SiteData (as-of dates, provenance, issues)
import { FUNDS } from "../../../config/funds.ts";
import type { FundData, SiteData } from "../../data/types.ts";
import type { RawPayloads } from "../raw.ts";
import { Ctx, type BuildOptions, type BuildResult } from "./context.ts";
import { buildFund } from "./fund.ts";

/** One info issue per run for an endpoint that is not deployed yet (404), instead of one per fund. */
function absentEndpoints(c: Ctx, raw: RawPayloads): void {
  if (c.absent.portfolio.length)
    c.info(
      "sources.fund-portfolio",
      `dataplatform /api/apex/fund-portfolio not available (HTTP 404, not deployed yet?) for ${c.absent.portfolio.join(", ")}: month-end factsheet figures shown`,
    );
  if (!raw.distributions)
    c.info(
      "sources.distributions",
      "no distributions endpoint on the dataplatform main branch (PR #621 not merged) and no exact way to derive them from nav-timeseries: distribution policy text only",
    );
  if (c.absent.distributions.length)
    c.info(
      "sources.distributions",
      `dataplatform /api/performance/distributions not available (HTTP 404, not deployed yet?) for ${c.absent.distributions.join(", ")}: distribution policy text only`,
    );
}

/** Newest as-of date of each part across the funds. */
export function computeAsOf(funds: SiteData["funds"]): SiteData["asOf"] {
  const max = (xs: (string | null | undefined)[]): string | null =>
    xs
      .filter((x): x is string => !!x)
      .sort()
      .pop() ?? null;
  const fs = Object.values(funds).filter((f): f is FundData => !!f);
  return {
    performance: max(fs.map((f) => f.performance?.asOf)),
    nav: max(fs.map((f) => f.nav?.asOf)),
    aum: max(fs.map((f) => f.aum?.asOf)),
    factsheet: max(fs.map((f) => f.factsheetMonth)),
  };
}

/** Raw payloads (+ the previous live publication) → SiteData and the per-fund context for validate.ts. */
export function buildSiteData(
  raw: RawPayloads,
  previous: SiteData | null,
  now: Date,
  opts: BuildOptions = {},
): BuildResult {
  const o: BuildOptions = { requireFactsheetForNewMonth: false, ...opts };
  // never carry over illustrative data into a live dataset
  const prev = previous && previous.mode === "live" ? previous : null;
  const c = new Ctx();
  c.prevProv = prev?.provenance ?? {};
  c.prevGenerated = prev?.generatedAt ?? "";
  const funds: SiteData["funds"] = {};
  const context: BuildResult["context"] = {};
  for (const spec of FUNDS) {
    const { fund, ctx } = buildFund(raw, spec, prev, c, o, now);
    context[spec.key] = ctx;
    if (fund) funds[spec.key] = fund;
    else c.warn(`funds.${spec.key}`, `no data available for this fund`);
  }
  absentEndpoints(c, raw);
  const data: SiteData = {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    mode: o.mode ?? "live",
    asOf: computeAsOf(funds),
    funds,
    provenance: c.prov,
    issues: c.issues,
  };
  return { data, context };
}
