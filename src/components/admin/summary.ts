/**
 * Compact per-fund summary of a SiteData (run detail, fund editor context). Pure, dependency-free.
 */
import type { FundData, FundKey, SiteData } from "../../lib/data/types.ts";

export interface FundSummary {
  key: FundKey;
  performanceAsOf: string | null;
  basis: "net" | "gross" | null;
  r1M: number | null;
  rYTD: number | null;
  r1Y: number | null;
  rSI: number | null;
  navAsOf: string | null;
  classes: { fundserv: string; display: string; currency: string; nav: number | null; date: string | null; changePct: number | null }[];
  aumCad: number | null;
  aumAsOf: string | null;
  factsheetMonth: string | null;
  holdings: number;
  characteristics: number;
}

export function summarizeFund(key: FundKey, f: FundData | undefined | null): FundSummary {
  const t = f?.performance?.trailing.fund ?? {};
  const n = (v: number | null | undefined) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  return {
    key,
    performanceAsOf: f?.performance?.asOf ?? null,
    basis: f?.performance?.basis ?? null,
    r1M: n(t["1M"]),
    rYTD: n(t.YTD),
    r1Y: n(t["1Y"]),
    rSI: n(t.SI),
    navAsOf: f?.nav?.asOf ?? null,
    classes: (f?.nav?.classes ?? []).map((c) => ({
      fundserv: c.fundserv, display: c.display, currency: c.currency, nav: n(c.nav), date: c.date, changePct: n(c.changePct),
    })),
    aumCad: n(f?.aum?.cad),
    aumAsOf: f?.aum?.asOf ?? null,
    factsheetMonth: f?.factsheetMonth ?? null,
    holdings: f?.topHoldings?.length ?? 0,
    characteristics: f?.characteristics?.length ?? 0,
  };
}

export interface RunDataSummary {
  mode: SiteData["mode"];
  generatedAt: string;
  asOf: SiteData["asOf"];
  funds: FundSummary[];
  issues: SiteData["issues"];
  provenance: [string, string][];
}

export function summarizeRunData(d: SiteData): RunDataSummary {
  const keys = Object.keys(d.funds ?? {}) as FundKey[];
  return {
    mode: d.mode,
    generatedAt: d.generatedAt,
    asOf: d.asOf,
    funds: keys.map((k) => summarizeFund(k, d.funds[k])),
    issues: (d.issues ?? []).slice(0, 500),
    provenance: Object.entries(d.provenance ?? {}).slice(0, 200),
  };
}
