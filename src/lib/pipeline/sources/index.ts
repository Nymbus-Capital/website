/**
 * Fetch every source for a run. Never throws: each failure is a SourceResult with ok=false.
 */
import { FUNDS } from "../../../config/funds.ts";
import { FUND_SOURCES } from "../fund-sources.ts";
import type { FundKey } from "../../data/types.ts";
import type { DpShort, RawPayloads, SourceResult } from "../raw.ts";
import { lastClosedMonth } from "../metrics.ts";
import { dpClient, fetchApexFunds, fetchAum, fetchFtse, fetchMonthlyNetReturns, fetchNav, fetchUnitholderFunds } from "./dataplatform.ts";
import { fetchFactsheets } from "./factsheets.ts";
import { fetchAnalytics } from "./analytics.ts";
import type { FetchImpl } from "./http.ts";

/** FTSE short name per fund, with the env override for the Monthly Income benchmark. */
export function ftseIndexFor(key: FundKey, env: Record<string, string | undefined> = process.env): string | null {
  const src = FUND_SOURCES[key];
  if (!src?.ftseIndex) return null;
  if (key === "monthly-income" && env.FTSE_INDEX_SEST) return env.FTSE_INDEX_SEST.trim();
  return src.ftseIndex;
}

export async function fetchAll(opts: { fetchImpl: FetchImpl; now: Date; env?: Record<string, string | undefined> }): Promise<RawPayloads> {
  const env = opts.env ?? process.env;
  const target = lastClosedMonth(opts.now);
  const shorts = FUNDS.map((f) => FUND_SOURCES[f.key].dataplatform).filter((s): s is DpShort => !!s);
  const ftseIndex: RawPayloads["ftseIndex"] = {};
  for (const f of FUNDS) ftseIndex[f.key] = ftseIndexFor(f.key, env);
  const ftseNames = [...new Set(Object.values(ftseIndex).filter((x): x is string => !!x))];

  const c = dpClient(opts.fetchImpl, env);
  const noDp = <T>(): SourceResult<T> => ({ ok: false, data: null, error: "dataplatform: DATAPLATFORM_URL not configured" });

  const monthlyReturns: RawPayloads["monthlyReturns"] = {};
  const nav: RawPayloads["nav"] = {};
  const ftse: RawPayloads["ftse"] = {};

  const today = opts.now.toISOString().slice(0, 10);
  const jobs: Promise<unknown>[] = [];
  for (const s of shorts) {
    jobs.push((c ? fetchMonthlyNetReturns(c, s, target) : Promise.resolve(noDp())).then((r) => { monthlyReturns[s] = r as never; }));
    jobs.push((c ? fetchNav(c, s, opts.now) : Promise.resolve(noDp())).then((r) => { nav[s] = r as never; }));
  }
  for (const n of ftseNames) jobs.push((c ? fetchFtse(c, n, today) : Promise.resolve(noDp())).then((r) => { ftse[n] = r as never; }));
  const apexP = c ? fetchApexFunds(c) : Promise.resolve(noDp<never>());
  const uhP = c ? fetchUnitholderFunds(c) : Promise.resolve(noDp<never>());
  const aumP = c ? fetchAum(c) : Promise.resolve(noDp<never>());
  const fsP = fetchFactsheets(target, opts.fetchImpl, env);
  const anP = fetchAnalytics(opts.fetchImpl, env);
  const [apexFunds, unitholderFunds, aum, factsheets, analytics] = await Promise.all([apexP, uhP, aumP, fsP, anP, ...jobs]);
  return { fetchedAt: opts.now.toISOString(), targetMonth: target, ftseIndex, monthlyReturns, nav, apexFunds, unitholderFunds, aum, ftse, factsheets, analytics };
}
