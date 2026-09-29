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
import type { AumTotals, DpShort, FtseLevels, FundRef, MonthlyNetReturnsResponse, NavPoint, NavSeriesResponse, RegisteredFund, SourceResult } from "../raw.ts";
import { ftseLevels, type FtseRow } from "../metrics.ts";
import { errMsg, fetchRetry, readJsonBody, retryBaseMs, type FetchImpl } from "./http.ts";

export interface DpClient {
  base: string;
  headers: Record<string, string>;
  fetchImpl: FetchImpl;
  timeoutMs: number;
  backoffMs: number;
}

export function dpClient(fetchImpl: FetchImpl, env: NodeJS.ProcessEnv = process.env): DpClient | null {
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

export function fetchMonthlyNetReturns(c: DpClient, short: DpShort, endMonth: string): Promise<SourceResult<MonthlyNetReturnsResponse>> {
  const label = `monthly-net-returns ${short}`;
  return guarded(label, async () => {
    const { status, body } = await get(c, "/api/performance/monthly-net-returns", { short_name: short, start_date: "2019-01-01", end_date: endMonth });
    if (status === 422) return fail(`${label}: no closed month available (HTTP 422${body ? `: ${body}` : ""})`);
    if (status !== 200) return fail(`${label}: HTTP ${status}`);
    const j = body as MonthlyNetReturnsResponse;
    if (!j || !Array.isArray(j.rows)) return fail(`${label}: unexpected payload`);
    const rows = j.rows.map((r) => ({ month: String(r.month).slice(0, 10), net_return: typeof r.net_return === "number" ? r.net_return : null, status: String(r.status), issue: r.issue ?? null }));
    const ready = rows.filter((r) => r.status === "ready" && r.net_return !== null);
    const data: MonthlyNetReturnsResponse = {
      short_name: j.short_name ?? short, as_of: j.as_of, class_code: j.class_code, currency: j.currency,
      return_basis: j.return_basis, methodology_version: j.methodology_version, row_count: rows.length, rows,
    };
    return { ok: true, data, detail: `${ready.length} ready month(s)${ready.length ? `, last ${ready[ready.length - 1].month}` : ""}` };
  });
}

const NAV_FIELDS = ["date", "source", "fundserv", "class_display", "class_code", "currency", "nav_per_share_local", "nav_per_share_cad", "net_daily_return", "nav_type", "short_name"] as const;

export function fetchNav(c: DpClient, short: DpShort, now: Date, lookbackDays = 21): Promise<SourceResult<NavSeriesResponse>> {
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
        return o as NavPoint;
      });
    return { ok: true, data: { rows, warnings: Array.isArray(j.warnings) ? j.warnings.map(String).slice(0, 20) : [] }, detail: `${rows.length} class row(s) since ${start}` };
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

export function fetchFtse(c: DpClient, short: string, endDate: string, startDate = "2018-12-01"): Promise<SourceResult<FtseLevels>> {
  const label = `ftse index-summary ${short}`;
  return guarded(label, async () => {
    const { status, body } = await get(c, "/api/ftse/index-summary", { short_name: short, start_date: startDate, end_date: endDate });
    if (status !== 200) return fail(`${label}: HTTP ${status}`);
    if (!Array.isArray(body)) return fail(`${label}: unexpected payload`);
    const levels = ftseLevels(body as FtseRow[]);
    const days = Object.keys(levels);
    if (!days.length) return fail(`${label}: no aggregate total-return level in ${body.length} row(s)`);
    return { ok: true, data: { levels, rowCount: body.length, first: days[0], last: days[days.length - 1] }, detail: `${days.length} day(s), ${days[0]} to ${days[days.length - 1]}` };
  });
}
