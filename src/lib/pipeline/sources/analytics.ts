/**
 * Official monthly net-return history of the funds before the Apex cutover: `fund_returns.json` of the
 * analytics repository (same source as the deck engine, nymbus-decks server/sources._fetch_analytics),
 * read through the GitHub contents API (GITHUB_TOKEN with contents:read) or from a local file
 * (ANALYTICS_RETURNS_FILE). Only the series listed in the fund registry are kept.
 */
import { readFile } from "node:fs/promises";
import { FUNDS } from "../../../config/funds.ts";
import { FUND_SOURCES } from "../fund-sources.ts";
import type { AnalyticsReturns, SourceResult } from "../raw.ts";
import { errMsg, fetchRetry, readJsonBody, retryBaseMs, type FetchImpl } from "./http.ts";
import { parseLooseJson } from "./factsheets.ts";
import { githubToken } from "./github-auth.ts";

export const ANALYTICS_DEFAULTS = {
  repo: "Nymbus-Capital/analytics",
  branch: "main",
  path: "fund-analytics-app/backend/data/fund_returns.json",
};

export function reduceAnalytics(body: unknown, where: string): AnalyticsReturns | null {
  const j = body as { dates?: unknown; returns?: unknown };
  if (!j || !Array.isArray(j.dates) || !j.returns || typeof j.returns !== "object") return null;
  const wanted = new Set(FUNDS.map((f) => FUND_SOURCES[f.key].analytics).filter((x): x is string => !!x));
  const returns: Record<string, (number | null)[]> = {};
  for (const [name, arr] of Object.entries(j.returns as Record<string, unknown>)) {
    if (!wanted.has(name) || !Array.isArray(arr) || arr.length !== j.dates.length) continue;
    returns[name] = arr.map((v) => (typeof v === "number" && Number.isFinite(v) ? v : null));
  }
  return { dates: (j.dates as unknown[]).map((d) => String(d).slice(0, 10)), returns, where };
}

export async function fetchAnalytics(fetchImpl: FetchImpl, env: Record<string, string | undefined> = process.env): Promise<SourceResult<AnalyticsReturns>> {
  const summary = (d: AnalyticsReturns): string => `${d.where}: ${Object.keys(d.returns).length} series through ${d.dates[d.dates.length - 1] ?? "?"}`;
  try {
    if (env.ANALYTICS_RETURNS_FILE) {
      const d = reduceAnalytics(parseLooseJson(await readFile(env.ANALYTICS_RETURNS_FILE, "utf8")), "local file");
      if (!d) return { ok: false, data: null, error: "analytics: ANALYTICS_RETURNS_FILE has an unexpected shape" };
      return { ok: true, data: d, detail: summary(d) };
    }
    const repo = env.ANALYTICS_REPO || ANALYTICS_DEFAULTS.repo;
    const token = await githubToken(env, repo, fetchImpl);
    if (!token) return { ok: false, data: null, error: "analytics: neither ANALYTICS_RETURNS_FILE nor GitHub credentials configured" };
    const branch = env.ANALYTICS_BRANCH || ANALYTICS_DEFAULTS.branch;
    const file = env.ANALYTICS_RETURNS_PATH || ANALYTICS_DEFAULTS.path;
    const url = `https://api.github.com/repos/${repo.split("/").map(encodeURIComponent).join("/")}/contents/${file.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(branch)}`;
    const res = await fetchRetry(fetchImpl, url, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.raw+json", "User-Agent": "nymbus-web-pipeline/1.0", "X-GitHub-Api-Version": "2022-11-28" } }, { timeoutMs: 120_000, backoffMs: retryBaseMs(env), honorRetryAfter: true });
    if (res.status !== 200) {
      await res.body?.cancel().catch(() => undefined);
      const why = ({ 401: "the GITHUB_TOKEN is invalid or expired", 403: "the GITHUB_TOKEN may not read this repository (or is rate limited)", 404: `the GITHUB_TOKEN cannot see ${repo} (contents:read) or ${file} moved` } as Record<number, string>)[res.status];
      return { ok: false, data: null, error: `analytics: GitHub HTTP ${res.status}${why ? `: ${why}` : ""}` };
    }
    const d = reduceAnalytics(await readJsonBody(res, url), `GitHub ${repo}@${branch}`);
    if (!d) return { ok: false, data: null, error: "analytics: fund_returns.json has an unexpected shape" };
    return { ok: true, data: d, detail: summary(d) };
  } catch (e: unknown) {
    return { ok: false, data: null, error: `analytics: ${errMsg(e)}` };
  }
}
