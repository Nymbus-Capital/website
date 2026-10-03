/**
 * Dataplatform fetchers (documented API: docs/api/openapi.json of nymbus-dataplatform).
 *
 * Base URL from DATAPLATFORM_URL only (never hardcoded). The API has no machine auth today (network
 * policy); optional basic auth (DATAPLATFORM_USERNAME / DATAPLATFORM_PASSWORD) or bearer
 * (DATAPLATFORM_TOKEN) are sent when configured.
 *
 * Each fetcher returns a SourceResult (never throws). Payloads are reduced to what the website needs:
 * AUM to fund totals (no investor-level field ever leaves this module), FTSE to aggregate daily levels,
 * NAV to the fields used.
 */
import type { AumTotals, ClassDistributions, DpShort, FtseLevels, FundPortfolio, FundRef, HoldingsBook, HoldingsPosition, InstrumentRef, InstrumentRefs, MonthlyNetReturnsResponse, NavHistory, NavPoint, NavSeriesResponse, RegisteredFund, SourceResult } from "../raw.ts";
import { parseDistributions, parseFundPortfolio } from "./contracts.ts";
import { ftseFamily, ftseGroupingSummary, ftseLevels, joinFtseHistory, type FtseCandidate, type FtseRow } from "../metrics.ts";
import { errMsg, fetchRetry, readJsonBody, retryBaseMs, type FetchImpl } from "./http.ts";

export interface DpClient {
  base: string;
  headers: Record<string, string>;
  fetchImpl: FetchImpl;
  timeoutMs: number;
  backoffMs: number;
}

export function dpClient(fetchImpl: FetchImpl, env: Record<string, string | undefined> = process.env): DpClient | null {
  const base = (env.DATAPLATFORM_URL || "").trim().replace(/\/+$/, "");
  if (!base) return null;
  const headers: Record<string, string> = { Accept: "application/json", "User-Agent": "nymbus-web-pipeline/1.0" };
  if (env.DATAPLATFORM_TOKEN) headers.Authorization = `Bearer ${env.DATAPLATFORM_TOKEN}`;
  else if (env.DATAPLATFORM_USERNAME) headers.Authorization = `Basic ${Buffer.from(`${env.DATAPLATFORM_USERNAME}:${env.DATAPLATFORM_PASSWORD ?? ""}`).toString("base64")}`;
  const t = Number(env.DATAPLATFORM_TIMEOUT_MS);
  return { base, headers, fetchImpl, timeoutMs: Number.isFinite(t) && t > 0 ? t : 120_000, backoffMs: retryBaseMs(env) };
}

type Params = Record<string, string | number | boolean | string[] | undefined>;

async function get(c: DpClient, path: string, params: Params): Promise<{ status: number; body: unknown }> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) for (const x of v) qs.append(k, x);
    else qs.append(k, String(v));
  }
  const url = `${c.base}${path}${qs.size ? `?${qs}` : ""}`;
  const res = await fetchRetry(c.fetchImpl, url, { headers: c.headers }, { timeoutMs: c.timeoutMs, backoffMs: c.backoffMs });
  let body: unknown = null;
  if (res.status === 200) body = await readJsonBody(res, url);
  else {
    // keep a short, credential-free reason (FastAPI `detail`)
    const text = await res.text().catch(() => "");
    try {
      const d = (JSON.parse(text) as { detail?: unknown }).detail;
      body = typeof d === "string" ? d.slice(0, 300) : null;
    } catch {
      body = null;
    }
  }
  return { status: res.status, body };
}

const fail = <T>(error: string): SourceResult<T> => ({ ok: false, data: null, error });

async function guarded<T>(label: string, fn: () => Promise<SourceResult<T>>): Promise<SourceResult<T>> {
  try {
    return await fn();
  } catch (e: unknown) {
    return fail(`${label}: ${errMsg(e)}`);
  }
}

/* ------------------------------------------------------------------ endpoints */

/**
 * `classCode` / `history` are sent when given; a server that predates them ignores them, so the caller must check the
 * response's own `class_code` / `history` / rows before trusting that it got what it asked for.
 */
export function fetchMonthlyNetReturns(c: DpClient, short: DpShort, endMonth: string, opts: { classCode?: string | null; history?: "full" } = {}): Promise<SourceResult<MonthlyNetReturnsResponse>> {
  const label = `monthly-net-returns ${short}${opts.classCode ? ` ${opts.classCode}` : ""}${opts.history ? ` history=${opts.history}` : ""}`;
  return guarded(label, async () => {
    const { status, body } = await get(c, "/api/performance/monthly-net-returns", { short_name: short, start_date: "2019-01-01", end_date: endMonth, class_code: opts.classCode ?? undefined, history: opts.history });
    if (status === 422) return fail(`${label}: no closed month available (HTTP 422${body ? `: ${body}` : ""})`);
    if (status !== 200) return fail(`${label}: HTTP ${status}`);
    const j = body as MonthlyNetReturnsResponse;
    if (!j || !Array.isArray(j.rows)) return fail(`${label}: unexpected payload`);
    const rows = j.rows.map((r) => ({
      month: String(r.month).slice(0, 10), net_return: typeof r.net_return === "number" ? r.net_return : null, status: String(r.status), issue: r.issue ?? null,
      ...(typeof r.source === "string" ? { source: r.source } : {}),
    }));
    const ready = rows.filter((r) => r.status === "ready" && r.net_return !== null);
    const data: MonthlyNetReturnsResponse = {
      short_name: j.short_name ?? short, as_of: j.as_of, class_code: j.class_code, ...(typeof j.history === "string" ? { history: j.history } : {}),
      ...(typeof j.class_display === "string" ? { class_display: j.class_display } : {}), ...(typeof j.fundserv === "string" ? { fundserv: j.fundserv } : {}), currency: j.currency,
      return_basis: j.return_basis, methodology_version: j.methodology_version, row_count: rows.length, rows,
    };
    return { ok: true, data, detail: `${ready.length} ready month(s)${ready.length ? `, last ${ready[ready.length - 1].month}` : ""}` };
  });
}

const NAV_FIELDS = ["date", "source", "fundserv", "class_display", "class_code", "currency", "nav_per_share_local", "nav_per_share_cad", "net_daily_return", "net_return_method", "return_start_date", "return_source_count", "nav_type", "short_name", "net_asset_value_cad"] as const;

/** the last weeks of every class: long enough to reach the previous month-end (month-end book date and net assets) */
export function fetchNav(c: DpClient, short: DpShort, now: Date, lookbackDays = 45): Promise<SourceResult<NavSeriesResponse>> {
  const label = `nav-timeseries ${short}`;
  return guarded(label, async () => {
    const end = now.toISOString().slice(0, 10);
    const start = new Date(now.getTime() - lookbackDays * 86_400_000).toISOString().slice(0, 10);
    const { status, body } = await get(c, "/api/performance/nav-timeseries", { short_name: short, start_date: start, end_date: end, nav_type: "FINAL_NAV" });
    if (status !== 200) return fail(`${label}: HTTP ${status}`);
    const j = body as NavSeriesResponse;
    if (!j || !Array.isArray(j.rows)) return fail(`${label}: unexpected payload`);
    const rows = j.rows
      .filter((r) => r && r.fundserv)
      .map((r) => {
        const o: Record<string, unknown> = {};
        for (const k of NAV_FIELDS) o[k] = (r as NavPoint)[k] ?? null;
        o.date = String(r.date).slice(0, 10);
        if (typeof o.return_start_date === "string") o.return_start_date = o.return_start_date.slice(0, 10);
        return o as NavPoint;
      });
    // the STRATEGY / STRATEGY_H aggregate rows: how many Apex classes the dataplatform folded into them (diagnostics)
    const aggregates = j.rows
      .filter((r) => r && !r.fundserv && (r.class_code === "STRATEGY" || r.class_code === "STRATEGY_H"))
      .map((r) => ({ date: String(r.date).slice(0, 10), class_code: String(r.class_code), return_source_count: typeof r.return_source_count === "number" ? r.return_source_count : null }));
    return { ok: true, data: { rows, warnings: Array.isArray(j.warnings) ? j.warnings.map(String).slice(0, 20) : [], aggregates }, detail: `${rows.length} class row(s) since ${start}` };
  });
}

const HISTORY_FIELDS = ["date", "source", "fundserv", "currency", "nav_type", "nav_per_share_cad", "net_daily_return", "net_return_method", "return_start_date", "return_source_count"] as const;

/**
 * Daily rows of ONE class (FundServ code) from `start` to `end` (the union of the frozen CIBC history and the live Apex
 * book, deduplicated at the 2026-07-05 cut-over by the dataplatform), reduced to what the monthly chain needs. A row of
 * another class or fund in the answer is a failure (never compounded into this class).
 */
export function fetchNavHistory(c: DpClient, short: DpShort, fundserv: string, start: string, end: string): Promise<SourceResult<NavHistory>> {
  const label = `nav-timeseries ${short} ${fundserv} history`;
  return guarded(label, async () => {
    const { status, body } = await get(c, "/api/performance/nav-timeseries", { short_name: short, fundserv, start_date: start, end_date: end, nav_type: "FINAL_NAV", include_unmapped: false });
    if (status !== 200) return fail(`${label}: HTTP ${status}`);
    const j = body as NavSeriesResponse;
    if (!j || !Array.isArray(j.rows)) return fail(`${label}: unexpected payload`);
    const other = j.rows.find((r) => r?.fundserv !== fundserv || (r.short_name != null && r.short_name !== short));
    if (other) return fail(`${label}: payload has a row of ${other?.short_name ?? "?"} ${other?.fundserv ?? "no class"}`);
    const rows = j.rows.map((r) => {
      const o: Record<string, unknown> = {};
      for (const k of HISTORY_FIELDS) o[k] = (r as NavPoint)[k] ?? null;
      o.date = String(r.date).slice(0, 10);
      if (typeof o.return_start_date === "string") o.return_start_date = o.return_start_date.slice(0, 10);
      return o as unknown as NavHistory["rows"][number];
    }).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const sources = [...new Set(rows.map((r) => r.source ?? "?"))].sort().join("/");
    return { ok: true, data: { fundserv, rows, warnings: Array.isArray(j.warnings) ? j.warnings.map(String).slice(0, 20) : [] }, detail: `${rows.length} daily row(s)${rows.length ? `, ${rows[0].date} to ${rows[rows.length - 1].date} (${sources})` : ""}` };
  });
}

export function fetchApexFunds(c: DpClient): Promise<SourceResult<RegisteredFund[]>> {
  return guarded("apex/funds", async () => {
    const { status, body } = await get(c, "/api/apex/funds", { include_wound_down: false });
    if (status !== 200) return fail(`apex/funds: HTTP ${status}`);
    if (!Array.isArray(body)) return fail("apex/funds: unexpected payload");
    const data = (body as RegisteredFund[]).map((f) => ({
      key: f.key, name: f.name, status: f.status, apex_account: f.apex_account ?? null, cibc_short: f.cibc_short ?? null, inception: f.inception ?? null,
      classes: (f.classes ?? []).map((k) => ({ fundserv: k.fundserv, display: k.display, currency: k.currency, status: k.status })),
    }));
    return { ok: true, data, detail: `${data.length} fund(s)` };
  });
}

export function fetchUnitholderFunds(c: DpClient): Promise<SourceResult<FundRef[]>> {
  return guarded("unitholders/funds", async () => {
    const { status, body } = await get(c, "/api/unitholders/funds", {});
    if (status !== 200) return fail(`unitholders/funds: HTTP ${status}`);
    if (!Array.isArray(body)) return fail("unitholders/funds: unexpected payload");
    const data = (body as FundRef[]).map((f) => ({ short_name: f.short_name, name: f.name, apex_account: f.apex_account ?? null }));
    return { ok: true, data, detail: `${data.length} fund(s)` };
  });
}

/**
 * Fund-level AUM totals. The response rows are summed per short_name on `holding_value_cad` and
 * EVERYTHING else is discarded here: investor-level data never reaches a snapshot or the site.
 */
export function reduceAum(body: unknown): AumTotals | null {
  const j = body as { snapshot_date?: unknown; warnings?: unknown; rows?: unknown };
  if (!j || !Array.isArray(j.rows)) return null;
  const totals: Record<string, number> = {};
  for (const r of j.rows as Record<string, unknown>[]) {
    const sn = r?.short_name;
    const v = r?.holding_value_cad;
    if (typeof sn !== "string" || !sn) continue;
    if (typeof v !== "number" || !Number.isFinite(v)) {
      totals[sn] = Number.NaN; // an incomplete measure poisons the fund total (dropped by validation)
      continue;
    }
    totals[sn] = (totals[sn] ?? 0) + v;
  }
  return {
    snapshot_date: typeof j.snapshot_date === "string" ? j.snapshot_date.slice(0, 10) : null,
    warningCount: Array.isArray(j.warnings) ? j.warnings.length : 0,
    totals,
  };
}

export function fetchAum(c: DpClient): Promise<SourceResult<AumTotals>> {
  return guarded("unitholders/aum", async () => {
    const { status, body } = await get(c, "/api/unitholders/aum", { group_by: ["short_name"] });
    if (status !== 200) return fail(`unitholders/aum: HTTP ${status}`);
    const data = reduceAum(body);
    if (!data) return fail("unitholders/aum: unexpected payload");
    return { ok: true, data, detail: `snapshot ${data.snapshot_date ?? "?"}, ${Object.keys(data.totals).length} fund total(s)` };
  });
}

/**
 * 404 on the newer fund-data routes: the route is not deployed yet (FastAPI detail "Not Found") or the fund has
 * no data on or before the date asked. Either way the caller falls back (factsheet / policy text): `absent`.
 */
const absent = <T>(label: string, body: unknown): SourceResult<T> => ({
  ok: false, data: null, absent: true,
  error: `${label}: HTTP 404 (${body === "Not Found" || body == null ? "endpoint not deployed yet" : body})`,
});

/**
 * Daily portfolio analytics of one fund (contract A): characteristics with coverage, breakdowns, top holdings.
 * `date` asks for the book on or before that day (month-end cross-check); default: the latest FINAL_NAV book.
 */
export function fetchFundPortfolio(c: DpClient, short: DpShort, date?: string): Promise<SourceResult<FundPortfolio>> {
  const label = `fund-portfolio ${short}${date ? ` ${date}` : ""}`;
  return guarded(label, async () => {
    const { status, body } = await get(c, "/api/apex/fund-portfolio", { fund: short, date, top: 10 });
    if (status === 404) return absent(label, body);
    if (status !== 200) return fail(`${label}: HTTP ${status}${typeof body === "string" ? ` (${body})` : ""}`);
    const data = parseFundPortfolio(body);
    if (!data) return fail(`${label}: unexpected payload`);
    // the answer must be the book that was asked for: another fund's figures are never published under this one
    if (data.fund.toUpperCase() !== short.toUpperCase()) return fail(`${label}: payload is for fund "${data.fund}", not ${short}`);
    const cov = data.coverage;
    return { ok: true, data, detail: `book ${data.as_of}, ${data.top_holdings.length} top holding(s), priced ${cov.priced_weight ?? "?"}, resolved ${cov.resolved_weight ?? "?"}${data.notes.length ? `; ${data.notes.length} parser note(s)` : ""}` };
  });
}

/** Distributions per unit of every class of one fund (contract B), keyed by FundServ code. */
export function fetchDistributions(c: DpClient, short: DpShort): Promise<SourceResult<ClassDistributions>> {
  const label = `distributions ${short}`;
  return guarded(label, async () => {
    const { status, body } = await get(c, "/api/performance/distributions", { short_name: short });
    if (status === 404) return absent(label, body);
    if (status !== 200) return fail(`${label}: HTTP ${status}${typeof body === "string" ? ` (${body})` : ""}`);
    const data = parseDistributions(body);
    if (!data) return fail(`${label}: unexpected payload`);
    if (data.short_name.toUpperCase() !== short.toUpperCase()) return fail(`${label}: payload is for fund "${data.short_name || "(none)"}", not ${short}`);
    return { ok: true, data, detail: `${data.rows.length} row(s), ${data.classes.length} class(es)${data.notes.length ? `; ${data.notes.length} parser note(s)` : ""}` };
  });
}

/* ------------------------------------------------------------------ Apex holdings and instrument master */

const HOLDING_FIELDS = ["date", "bloomberg_id", "isin", "cusip", "sedol", "security_id", "description", "security_type", "sector", "country", "currency", "quantity", "market_value_cad"] as const;

/**
 * One fund's Apex FINAL_NAV book of one valuation day (/api/apex/holdings, positions + bank and broker balances), reduced
 * to the fields the portfolio analytics need. A row of another fund (the response names the fund it resolved) is a failure.
 */
export function fetchHoldings(c: DpClient, short: DpShort, date: string): Promise<SourceResult<HoldingsBook>> {
  const label = `apex/holdings ${short} ${date}`;
  return guarded(label, async () => {
    const { status, body } = await get(c, "/api/apex/holdings", { fund: short, date, nav_type: "FINAL_NAV", include_unrealised_pl: false });
    if (status !== 200) return fail(`${label}: HTTP ${status}${typeof body === "string" ? ` (${body})` : ""}`);
    const j = body as { fund_short_name?: unknown; positions?: unknown; cash?: unknown; warnings?: unknown };
    if (!j || !Array.isArray(j.positions) || !Array.isArray(j.cash)) return fail(`${label}: unexpected payload`);
    if (typeof j.fund_short_name === "string" && j.fund_short_name.toUpperCase() !== short.toUpperCase()) return fail(`${label}: payload is for fund "${j.fund_short_name}", not ${short}`);
    const day = (v: unknown): string => String(v ?? "").slice(0, 10);
    const positions = (j.positions as Record<string, unknown>[]).filter((p) => p && day(p.date) === date).map((p) => {
      const o: Record<string, unknown> = {};
      for (const k of HOLDING_FIELDS) o[k] = p[k] ?? null;
      o.date = day(p.date);
      return o as unknown as HoldingsPosition;
    });
    const cash = (j.cash as Record<string, unknown>[]).filter((x) => x && day(x.date) === date).map((x) => ({
      date: day(x.date), currency: typeof x.currency === "string" ? x.currency : null, glc_description: typeof x.glc_description === "string" ? x.glc_description : null,
      closing_bal_cad: typeof x.closing_bal_cad === "number" ? x.closing_bal_cad : null,
    }));
    const warnings = Array.isArray(j.warnings) ? j.warnings.map(String).slice(0, 20) : [];
    return { ok: true, data: { fund: short, date, positions, cash, warnings }, detail: `${positions.length} position(s), ${cash.length} cash line(s)` };
  });
}

const FIGI_RE = /^BBG[0-9A-Z]{9}$/;
export const BATCH_SIZE = 40;
export const UNIVERSE_PAGE = 500;
export const UNIVERSE_MAX_PAGES = 60;

type Detail = Record<string, unknown>;
const s = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
const n = (v: unknown): number | null => {
  const x = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : Number.NaN;
  return Number.isFinite(x) ? x : null;
};

function toRef(d: Detail): InstrumentRef | null {
  const id = n(d.nymbus_instrument_id);
  if (id === null) return null;
  const obj = (v: unknown): Record<string, unknown> | null => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null);
  const ref = obj(d.reference);
  const cls = obj(d.classification);
  const price = obj(d.latest_price);
  return {
    nymbus_instrument_id: id, isin: s(d.isin), cusip: s(d.cusip), figi: s(d.figi), name: s(d.name), asset_class: s(d.asset_class), security_type: s(d.security_type),
    ratings: Array.isArray(d.ratings) ? (d.ratings as Detail[]).filter((r) => r && typeof r.agency === "string" && typeof r.rating === "string").map((r) => ({ agency: r.agency as string, rating: r.rating as string, source: s(r.source) })) : [],
    reference: ref ? { is_green_bond: typeof ref.is_green_bond === "boolean" ? ref.is_green_bond : null } : null,
    classification: cls ? { industry_sector: s(cls.industry_sector), country_of_risk: s(cls.country_of_risk), market_sector: s(cls.market_sector) } : null,
    latest_price: price ? { price_date: s(price.price_date)?.slice(0, 10) ?? null, modified_duration: n(price.modified_duration), yield_to_maturity: n(price.yield_to_maturity) } : null,
  };
}

/**
 * Instrument master references of the held securities: /api/instruments/batch by ISIN, then CUSIP, then FIGI for what is
 * still unmatched (ambiguous identifiers are excluded by the endpoint), then the bond universe pages (/api/instruments,
 * asset_class=BOND, maturing after `maturityAfter`) for the coupon rate, maturity and issuer of the matched bonds, which
 * the batch detail does not carry. Pages are read until a short page (at most UNIVERSE_MAX_PAGES); an incomplete read
 * leaves those terms unknown (their coverage drops, the gates decide).
 */
export function fetchInstruments(c: DpClient, securities: { isin?: string | null; cusip?: string | null; figi?: string | null }[], maturityAfter: string): Promise<SourceResult<InstrumentRefs>> {
  const label = "instruments";
  return guarded(label, async () => {
    const refs = new Map<number, InstrumentRef>();
    const asked: Record<string, number> = {};
    const matched = { isin: new Set<string>(), cusip: new Set<string>(), figi: new Set<string>() };
    const seen = (r: InstrumentRef): void => {
      for (const k of ["isin", "cusip", "figi"] as const) { const v = r[k]?.toUpperCase(); if (v) matched[k].add(v); }
    };
    const order: ("isin" | "cusip" | "figi")[] = ["isin", "cusip", "figi"];
    const up = (v: string | null | undefined): string | null => (typeof v === "string" && v.trim() ? v.trim().toUpperCase() : null);
    const isMatched = (x: (typeof securities)[number]): boolean => order.some((t) => { const v = up(x[t]); return !!v && matched[t].has(v); });
    for (const type of order) {
      // only the securities not matched yet by a previous identifier type
      const values = [...new Set(securities.filter((x) => !isMatched(x)).map((x) => up(x[type])).filter((v): v is string => !!v && (type !== "figi" || FIGI_RE.test(v))))].sort();
      asked[type] = values.length;
      for (let i = 0; i < values.length; i += BATCH_SIZE) {
        const { status, body } = await get(c, "/api/instruments/batch", { identifier_type: type, values: values.slice(i, i + BATCH_SIZE) });
        if (status !== 200) return fail(`${label}: /api/instruments/batch ${type}: HTTP ${status}`);
        if (!Array.isArray(body)) return fail(`${label}: /api/instruments/batch ${type}: unexpected payload`);
        for (const d of body as Detail[]) {
          const r = toRef(d);
          if (!r) continue;
          refs.set(r.nymbus_instrument_id, refs.get(r.nymbus_instrument_id) ?? r);
          seen(r);
        }
      }
    }
    const bondIds = new Set([...refs.values()].filter((r) => (r.asset_class ?? "").toUpperCase() === "BOND").map((r) => r.nymbus_instrument_id));
    let rows = 0;
    let complete = !bondIds.size;
    for (let page = 0; bondIds.size && page < UNIVERSE_MAX_PAGES; page++) {
      const { status, body } = await get(c, "/api/instruments", { asset_class: "BOND", maturity_after: maturityAfter, offset: page * UNIVERSE_PAGE, limit: UNIVERSE_PAGE });
      if (status !== 200) return fail(`${label}: /api/instruments (bond universe page ${page + 1}): HTTP ${status}`);
      if (!Array.isArray(body)) return fail(`${label}: /api/instruments: unexpected payload`);
      rows += body.length;
      for (const u of body as Detail[]) {
        const id = n(u.nymbus_instrument_id);
        const r = id !== null ? refs.get(id) : undefined;
        if (!r) continue;
        Object.assign(r, { coupon_rate: n(u.coupon_rate), maturity_date: s(u.maturity_date)?.slice(0, 10) ?? null, issuer: s(u.issuer), sector: s(u.sector), country_of_risk: s(u.country_of_risk), market_sector: s(u.market_sector) });
      }
      if (body.length < UNIVERSE_PAGE) { complete = true; break; }
    }
    const data: InstrumentRefs = { refs: [...refs.values()].sort((a, b) => a.nymbus_instrument_id - b.nymbus_instrument_id), asked, matched: refs.size, universeRows: rows, universeComplete: complete };
    return { ok: true, data, detail: `${refs.size} instrument(s) matched (asked ${Object.entries(asked).map(([k, v]) => `${v} ${k}`).join(", ")}); bond universe ${rows} row(s)${complete ? "" : " (incomplete: coupon / maturity of some bonds unknown)"}` };
  });
}

export const FTSE_START = "2000-01-01";
/** at most this many earlier-name candidates are read per index */
export const FTSE_MAX_CANDIDATES = 8;

/**
 * Aggregate daily levels of one FTSE index over its whole history. ftse.bond_index_summary names an index by a slug of
 * its published name, so the days before a naming generation sit under another short_name (e.g. "univ_overall" before
 * the 2024-12 generation of "univ"). Candidates: the configured aliases, the names sharing the index_id, and the names
 * of the same family (metrics.ts ftseFamily) in /short-names. A candidate is joined only on equal daily returns over a
 * common period that includes the current name's first day (metrics.ts joinFtseHistory): levels are never compared
 * across names (FTSE re-bases them). The detail lists what was joined and why every other candidate was not.
 */
export function fetchFtse(c: DpClient, short: string, endDate: string, aliases: string[] = []): Promise<SourceResult<FtseLevels>> {
  const label = `ftse index-summary ${short}`;
  return guarded(label, async () => {
    let lastRows: FtseRow[] = [];
    const rowsOf = async (name: string): Promise<Record<string, number>> => {
      const { status, body } = await get(c, "/api/ftse/index-summary", { short_name: name, start_date: FTSE_START, end_date: endDate });
      if (status !== 200) throw new Error(`${name}: HTTP ${status}`);
      if (!Array.isArray(body)) throw new Error(`${name}: unexpected payload`);
      if (name === short) lastRows = body as FtseRow[];
      return ftseLevels(body as FtseRow[]);
    };
    const cur = await rowsOf(short);
    if (!Object.keys(cur).length) return fail(`${label}: no aggregate total-return level (${ftseGroupingSummary(lastRows)})`);
    const notes: string[] = [];
    let names: { short_name: string; index_id?: number | null; index_name?: string | null }[] = [];
    try {
      const { status, body } = await get(c, "/api/ftse/index-summary/short-names", {});
      if (status === 200 && Array.isArray(body)) names = body as typeof names;
      else notes.push(`short-names: HTTP ${status} (only the configured earlier names tried)`);
    } catch (e: unknown) {
      notes.push(`short-names: ${errMsg(e)} (only the configured earlier names tried)`);
    }
    const me = names.find((n) => n.short_name === short);
    const family = ftseFamily(me?.index_name ?? null);
    const why = new Map<string, string>();
    for (const a of aliases) if (a !== short) why.set(a, "configured earlier name");
    for (const n of names) {
      if (n.short_name === short || why.has(n.short_name)) continue;
      if (me?.index_id != null && n.index_id === me.index_id) why.set(n.short_name, `same index_id ${me.index_id}`);
      else if (family && ftseFamily(n.index_name) === family) why.set(n.short_name, `same index family "${family}" (${n.index_name})`);
    }
    const cands: FtseCandidate[] = [];
    const skipped: string[] = [];
    for (const [name, reason] of [...why].slice(0, FTSE_MAX_CANDIDATES)) {
      try {
        const lv = await rowsOf(name);
        if (Object.keys(lv).length) cands.push({ name, levels: lv, why: reason });
        else skipped.push(`${name} (no aggregate level)`);
      } catch (e: unknown) {
        skipped.push(`${name} (${errMsg(e)})`);
      }
    }
    const j = joinFtseHistory(cur, cands);
    const days = Object.keys(j.levels);
    let detail = `${days.length} day(s), ${days[0]} to ${days[days.length - 1]}`;
    if (j.used.length) detail += `; earlier days under ${j.used.map((u) => `${u.name} from ${u.from} (${u.why}; linked at ${u.link} on ${u.checked} equal daily return(s))`).join(", ")}`;
    const allSkipped = [...skipped, ...j.skipped];
    if (allSkipped.length) detail += `; not joined: ${allSkipped.join(", ")}`;
    else if (!j.used.length) detail += `; no earlier name found (${names.length ? `none with index_id ${me?.index_id ?? "?"} or family "${family || "?"}" among ${names.length} short-names` : "short-names unavailable"})`;
    if (notes.length) detail += `; ${notes.join("; ")}`;
    return { ok: true, data: { levels: j.levels, rowCount: days.length, first: days[0], last: days[days.length - 1], joined: j.used.map((u) => u.name), indexName: me?.index_name ?? null }, detail };
  });
}
