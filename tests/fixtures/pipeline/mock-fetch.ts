/**
 * A `fetch` implementation serving the synthetic dataplatform fixtures, for tests and `pipeline sample`.
 * Routes can be overridden (fail a source, alter a payload) and every call is recorded.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const FIXTURES_DIR = path.dirname(fileURLToPath(import.meta.url));
export const FIXTURE_FACTSHEETS_DIR = path.join(FIXTURES_DIR, "factsheets");
export const FIXTURE_BASE_URL = "http://dataplatform.test";
export const FIXTURE_ANALYTICS_FILE = path.join(FIXTURES_DIR, "analytics_fund_returns.json");

export const loadFixture = (rel: string): unknown => JSON.parse(readFileSync(path.join(FIXTURES_DIR, rel), "utf8"));

export type Route = (url: URL, init?: RequestInit) => Response | Promise<Response> | undefined;

export const json = (body: unknown, status = 200): Response => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function filterDates<T extends { date: string }>(rows: T[], url: URL): T[] {
  const s = url.searchParams.get("start_date");
  const e = url.searchParams.get("end_date");
  return rows.filter((r) => (!s || r.date >= s) && (!e || r.date.slice(0, 10) <= e));
}

export function fixtureRoute(url: URL): Response | undefined {
  const p = url.pathname;
  const q = url.searchParams;
  if (p === "/api/performance/monthly-net-returns") {
    const sn = q.get("short_name") ?? "";
    if (!["SEST", "SEB", "Multistrat"].includes(sn)) return json({ detail: "Unsupported official fund" }, 422);
    const j = loadFixture(`dataplatform/mnr_${sn}.json`) as { rows: { month: string }[] };
    const end = q.get("end_date") ?? "9999";
    return json({ ...j, rows: j.rows.filter((r) => r.month <= end) });
  }
  if (p === "/api/performance/nav-timeseries") {
    const j = loadFixture(`dataplatform/nav_${q.get("short_name")}.json`) as { rows: { date: string }[] };
    return json({ ...j, rows: filterDates(j.rows, url) });
  }
  if (p === "/api/apex/fund-portfolio") {
    const fund = q.get("fund") ?? "";
    const date = q.get("date");
    // like the real endpoint: `date` must be a full ISO date
    if (date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ detail: [{ loc: ["query", "date"], msg: "Input should be a valid date" }] }, 422);
    try {
      return json(loadFixture(`dataplatform/portfolio_${fund}${date ? `_${date}` : ""}.json`));
    } catch {
      return json({ detail: `No FINAL_NAV book for ${fund} on or before ${date ?? "today"}` }, 404);
    }
  }
  if (p === "/api/performance/distributions") {
    try {
      return json(loadFixture(`dataplatform/distributions_${q.get("short_name")}.json`));
    } catch {
      return json({ detail: "Unsupported official fund" }, 422);
    }
  }
  if (p === "/api/apex/funds") return json(loadFixture("dataplatform/apex_funds.json"));
  if (p === "/api/unitholders/funds") return json(loadFixture("dataplatform/unitholders_funds.json"));
  if (p === "/api/unitholders/aum") return json(loadFixture("dataplatform/aum.json"));
  if (p === "/api/ftse/index-summary/short-names") return json(loadFixture("dataplatform/ftse_short_names.json"));
  if (p === "/api/ftse/index-summary") {
    const sn = q.get("short_name");
    try {
      return json(filterDates(loadFixture(`dataplatform/ftse_${sn}.json`) as { date: string }[], url));
    } catch {
      return json([]);
    }
  }
  return undefined;
}

export interface MockFetch {
  fetch: typeof fetch;
  calls: { url: string; headers: Record<string, string> }[];
}

/** overrides are tried first (return undefined to fall through to the fixtures) */
export function mockFetch(...overrides: Route[]): MockFetch {
  const calls: MockFetch["calls"] = [];
  const f = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    const headers: Record<string, string> = {};
    new Headers(init?.headers).forEach((v, k) => { headers[k] = v; });
    calls.push({ url: url.href, headers });
    for (const o of overrides) {
      const r = await o(url, init);
      if (r) return r;
    }
    return fixtureRoute(url) ?? json({ detail: "Not Found" }, 404);
  };
  return { fetch: f as typeof fetch, calls };
}

/** the class series as dataplatform PR #626 serves them (history=full, every month ready): files mnr_class_*.json */
type MnrRow = { month: string; net_return: number | null; status: string; source?: string };
const CLASS_FILES: Record<string, Record<string, { fundserv: string; display: string; file: string }>> = {
  SEST: { STRATEGY: { fundserv: "LDM001", display: "FP", file: "mnr_class_SEST.json" } },
  SEB: { STRATEGY: { fundserv: "LDM201", display: "F", file: "mnr_class_SEB_F.json" }, STRATEGY_H: { fundserv: "LDM202", display: "H", file: "mnr_class_SEB_H.json" } },
  Multistrat: { STRATEGY: { fundserv: "LDM301", display: "F", file: "mnr_class_Multistrat.json" } },
};
export function classServedRoute(tweak?: (short: string, classCode: string, rows: MnrRow[]) => MnrRow[]): Route {
  return (url) => {
    if (url.pathname !== "/api/performance/monthly-net-returns") return undefined;
    const sn = url.searchParams.get("short_name") ?? "";
    const cc = url.searchParams.get("class_code");
    if (!cc) return undefined;
    const meta = CLASS_FILES[sn]?.[cc];
    if (!meta) return json({ detail: "Unsupported class" }, 422);
    const j = loadFixture(`dataplatform/${meta.file}`) as { rows: MnrRow[] };
    const end = url.searchParams.get("end_date") ?? "9999";
    let rows = j.rows.filter((r) => r.month <= end);
    if (tweak) rows = tweak(sn, cc, rows);
    return json({ ...j, class_code: cc, fundserv: meta.fundserv, class_display: meta.display, history: "full", rows });
  };
}

/** env for a run against the fixtures (no Graph, analytics from the local fixture file) */
export function fixtureEnv(extra: Record<string, string | undefined> = {}): Record<string, string | undefined> {
  return { DATAPLATFORM_URL: FIXTURE_BASE_URL, FACTSHEET_DATA_DIR: FIXTURE_FACTSHEETS_DIR, ANALYTICS_RETURNS_FILE: FIXTURE_ANALYTICS_FILE, PIPELINE_RETRY_BASE_MS: "0", ...extra };
}
