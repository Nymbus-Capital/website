/**
 * Fetch every source for a run. Never throws: each failure is a SourceResult with ok=false.
 */
import { FUNDS } from "../../../config/funds.ts";
import { classSeriesOf, FUND_SOURCES } from "../fund-sources.ts";
import { CLASS_CHECKS, PIPELINE_FUNDS } from "../config.ts";
import type { FundKey } from "../../data/types.ts";
import type { DpShort, FtseBondAnalytics, HoldingsBook, InstrumentRefs, NavPoint, RawPayloads, SourceResult } from "../raw.ts";
import { lastClosedMonth } from "../metrics.ts";
import { dpClient, fetchApexFunds, fetchAum, fetchFtse, fetchFtseBondAnalytics, fetchHoldings, fetchInstruments, fetchMonthlyNetReturns, fetchNav, fetchNavHistory, fetchUnitholderFunds } from "./dataplatform.ts";
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
  const keyOf = Object.fromEntries(FUNDS.filter((f) => FUND_SOURCES[f.key].dataplatform).map((f) => [FUND_SOURCES[f.key].dataplatform, f.key])) as Record<DpShort, FundKey>;
  const ftseIndex: RawPayloads["ftseIndex"] = {};
  for (const f of FUNDS) ftseIndex[f.key] = ftseIndexFor(f.key, env);
  const ftseNames = [...new Set(Object.values(ftseIndex).filter((x): x is string => !!x))];

  const c = dpClient(opts.fetchImpl, env);
  const noDp = <T>(): SourceResult<T> => ({ ok: false, data: null, error: "dataplatform: DATAPLATFORM_URL not configured" });

  const monthlyReturns: RawPayloads["monthlyReturns"] = {};
  const navHistory: NonNullable<RawPayloads["navHistory"]> = {};
  const nav: RawPayloads["nav"] = {};
  const ftse: RawPayloads["ftse"] = {};
  const holdings: NonNullable<RawPayloads["holdings"]> = {};

  const today = opts.now.toISOString().slice(0, 10);
  const jobs: Promise<unknown>[] = [];
  // class histories are heavy for the dataplatform (each one loads its NAV history table): fetched ONE AT A TIME after
  // the other calls — about twenty in parallel ran the dataplatform out of memory (HTTP 503 while it restarted)
  const classJobs: { s: DpShort; fundserv: string }[] = [];
  for (const s of shorts) {
    const fs = FUND_SOURCES[keyOf[s]];
    // main-branch contract: short_name + dates only (the answer names its class: checked by the build)
    jobs.push((c ? fetchMonthlyNetReturns(c, s, target) : Promise.resolve(noDp())).then((r) => { monthlyReturns[s] = r as never; }));
    // every class known to the configuration / registry: its daily rows from CLASS_CHECKS.historyFrom (the website finds
    // each class's inception and compounds the months); the register's other active classes follow below
    if (fs.navStart) {
      for (const k of classSeriesOf(keyOf[s])) {
        if (c) classJobs.push({ s, fundserv: k.fundserv });
        else navHistory[k.fundserv] = noDp() as never;
      }
    }
    // NAV of the last weeks (NAV card, the book dates and the net assets), then the Apex book(s) of those days
    jobs.push((async () => {
      const n = c ? await fetchNav(c, s, opts.now) : noDp<never>();
      nav[s] = n;
      if (!c) { holdings[s] = { latest: noDp(), monthEnd: null }; return; }
      const days = bookDays(n.ok && n.data ? n.data.rows : [], target);
      if (!days.latest) { holdings[s] = { latest: { ok: false, data: null, error: `apex/holdings ${s}: no Apex FINAL_NAV valuation day in the NAV rows (${n.ok ? "none in the last weeks" : n.error})` }, monthEnd: null }; return; }
      const latest = await fetchHoldings(c, s, days.latest);
      const monthEnd = days.monthEnd && days.monthEnd.slice(0, 7) !== days.latest.slice(0, 7) ? await fetchHoldings(c, s, days.monthEnd) : null;
      holdings[s] = { latest, monthEnd };
    })());
  }
  for (const n of ftseNames) jobs.push((c ? fetchFtse(c, n, today, FUND_SOURCES[FUNDS.find((f) => ftseIndex[f.key] === n)!.key].ftseAliases ?? []) : Promise.resolve(noDp())).then((r) => { ftse[n] = r as never; }));
  const apexP = c ? fetchApexFunds(c) : Promise.resolve(noDp<never>());
  const uhP = c ? fetchUnitholderFunds(c) : Promise.resolve(noDp<never>());
  const aumP = c ? fetchAum(c) : Promise.resolve(noDp<never>());
  const fsP = fetchFactsheets(target, opts.fetchImpl, env);
  const anP = fetchAnalytics(opts.fetchImpl, env);
  const [apexFunds, unitholderFunds, aum, factsheets, analytics] = await Promise.all([apexP, uhP, aumP, fsP, anP, ...jobs]);
  // active classes of the fund register that the configuration does not know yet: their history too
  if (c && apexFunds.ok && apexFunds.data) {
    for (const s of shorts) {
      const key = keyOf[s];
      if (!FUND_SOURCES[key].navStart) continue;
      const acct = unitholderFunds.ok ? unitholderFunds.data?.find((r) => r.short_name === s)?.apex_account : undefined;
      const live = apexFunds.data.filter((f) => f.status !== "wound_down");
      const reg = (acct ? live.find((f) => f.apex_account === acct) : undefined) ?? live.find((f) => f.key === PIPELINE_FUNDS[key].apexKey);
      for (const k of classSeriesOf(key, reg?.classes ?? null)) {
        if (classJobs.some((j) => j.fundserv === k.fundserv)) continue;
        classJobs.push({ s, fundserv: k.fundserv });
      }
    }
  }
  if (c) {
    // sequential on purpose (5xx are already retried with backoff by the HTTP client); a dataplatform that keeps failing
    // or hangs must not hold the run lock for hours: stop after 3 failures in a row or 15 minutes, the rest unavailable
    const deadline = Date.now() + 15 * 60_000;
    let failures = 0;
    for (const j of classJobs) {
      if (failures >= 3 || Date.now() > deadline) {
        navHistory[j.fundserv] = { ok: false, data: null, error: `nav-timeseries ${j.s} ${j.fundserv} history: not fetched (${failures >= 3 ? "3 class histories failed in a row" : "15-minute budget for class histories spent"})` };
        continue;
      }
      const r = await fetchNavHistory(c, j.s, j.fundserv, CLASS_CHECKS.historyFrom, today);
      failures = r.ok ? 0 : failures + 1;
      navHistory[j.fundserv] = r;
    }
  }
  // the instrument master of every security held (one pass for all funds and both book dates)
  const books = Object.values(holdings).flatMap((h) => [h?.latest, h?.monthEnd]).filter((b): b is SourceResult<HoldingsBook> => !!b?.ok && !!b.data).map((b) => b.data!);
  let instruments: SourceResult<InstrumentRefs> | undefined;
  if (c && books.length) {
    const securities = books.flatMap((b) => b.positions.map((p) => ({ isin: p.isin, cusip: p.cusip, figi: p.bloomberg_id })));
    instruments = await fetchInstruments(c, securities, books.map((b) => b.date).sort()[0]);
  }
  // FTSE constituent analytics of the held securities on each book date (pricing fallback)
  let ftseBonds: Record<string, SourceResult<FtseBondAnalytics>> | undefined;
  if (c && books.length) {
    ftseBonds = {};
    for (const date of [...new Set(books.map((b) => b.date))].sort()) {
      const held = books.filter((b) => b.date === date).flatMap((b) => b.positions);
      const isins = [...new Set(held.map((p) => p.isin).filter((x): x is string => typeof x === "string" && !!x.trim()))];
      const cusips = [...new Set(held.map((p) => p.cusip).filter((x): x is string => typeof x === "string" && !!x.trim()))];
      ftseBonds[date] = await fetchFtseBondAnalytics(c, date, isins, cusips);
    }
  }
  // distributions: no endpoint on the dataplatform main branch (PR #621 not merged): not fetched, none shown
  return { fetchedAt: opts.now.toISOString(), targetMonth: target, ftseIndex, monthlyReturns, navHistory, nav, apexFunds, unitholderFunds, aum, ftse, factsheets, analytics, holdings, ...(instruments ? { instruments } : {}), ...(ftseBonds ? { ftseBonds } : {}) };
}

/**
 * Book dates of a fund from its NAV rows: the latest Apex FINAL_NAV valuation day, and the last one of the last closed
 * month (for the month-end cross-check with the factsheet).
 */
export function bookDays(rows: NavPoint[], monthEnd: string): { latest: string | null; monthEnd: string | null } {
  const apex = [...new Set(rows.filter((r) => r.source === "apex" && (r.nav_type ?? "FINAL_NAV") === "FINAL_NAV").map((r) => String(r.date).slice(0, 10)))].sort();
  const inMonth = apex.filter((d) => d.slice(0, 7) === monthEnd.slice(0, 7));
  return { latest: apex.at(-1) ?? null, monthEnd: inMonth.at(-1) ?? null };
}