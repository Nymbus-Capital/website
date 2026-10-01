/**
 * Microsoft Graph (app-only, client credentials) download of SharePoint files, for the factsheet
 * archives. Same pattern as nymbus-decks server/graph.py. Dependency-free.
 */
import { errMsg, fetchRetry, HttpError, retryBaseMs, safeUrl, type FetchImpl } from "./http.ts";

export const GRAPH = "https://graph.microsoft.com/v1.0";

export interface GraphConfig { tenantId: string; clientId: string; clientSecret: string; driveId: string; backoffMs?: number }

export function graphConfig(env: Record<string, string | undefined> = process.env): GraphConfig | null {
  const { GRAPH_TENANT_ID, GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET, GRAPH_DRIVE_ID } = env;
  if (!GRAPH_TENANT_ID || !GRAPH_CLIENT_ID || !GRAPH_CLIENT_SECRET || !GRAPH_DRIVE_ID) return null;
  return { tenantId: GRAPH_TENANT_ID, clientId: GRAPH_CLIENT_ID, clientSecret: GRAPH_CLIENT_SECRET, driveId: GRAPH_DRIVE_ID, backoffMs: retryBaseMs(env) };
}

/** token cache per (tenant, client) */
const tokens = new Map<string, { value: string; exp: number }>();

export function clearGraphTokenCache(): void {
  tokens.clear();
}

export async function graphToken(cfg: GraphConfig, fetchImpl: FetchImpl): Promise<string> {
  const k = `${cfg.tenantId}/${cfg.clientId}`;
  const cached = tokens.get(k);
  if (cached && cached.exp > Date.now() + 60_000) return cached.value;
  const body = new URLSearchParams({ client_id: cfg.clientId, client_secret: cfg.clientSecret, scope: "https://graph.microsoft.com/.default", grant_type: "client_credentials" });
  const url = `https://login.microsoftonline.com/${encodeURIComponent(cfg.tenantId)}/oauth2/v2.0/token`;
  const res = await fetchRetry(fetchImpl, url, { method: "POST", body, headers: { "Content-Type": "application/x-www-form-urlencoded" } }, { timeoutMs: 30_000, honorRetryAfter: true, backoffMs: cfg.backoffMs });
  if (res.status !== 200) {
    await res.body?.cancel().catch(() => undefined);
    throw new HttpError(res.status, `Graph token: HTTP ${res.status}`);
  }
  const j = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!j.access_token) throw new Error("Graph token: no access_token in response");
  tokens.set(k, { value: j.access_token, exp: Date.now() + (Number(j.expires_in) || 3600) * 1000 });
  return j.access_token;
}

export const itemPath = (p: string): string => p.replace(/^\/+|\/+$/g, "").split("/").map(encodeURIComponent).join("/");

/**
 * Download a drive item by path. Returns null when the file does not exist (404). Retries 429/5xx
 * honouring Retry-After. Throws on other errors (message without secrets).
 */
export async function graphDownload(cfg: GraphConfig, fetchImpl: FetchImpl, filePath: string): Promise<Uint8Array | null> {
  const token = await graphToken(cfg, fetchImpl);
  const url = `${GRAPH}/drives/${encodeURIComponent(cfg.driveId)}/root:/${itemPath(filePath)}:/content`;
  let res: Response;
  try {
    // Graph answers /content with a 302 to a pre-authenticated download URL: follow it manually
    res = await fetchRetry(fetchImpl, url, { headers: { Authorization: `Bearer ${token}` } }, { timeoutMs: 120_000, retries: 3, honorRetryAfter: true, backoffMs: cfg.backoffMs });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      await res.body?.cancel().catch(() => undefined);
      if (!loc) throw new Error(`Graph ${safeUrl(url)}: redirect without location`);
      // the pre-authenticated URL must NOT receive the bearer token
      res = await fetchRetry(fetchImpl, loc, {}, { timeoutMs: 120_000, retries: 3, honorRetryAfter: true, backoffMs: cfg.backoffMs });
    }
  } catch (e: unknown) {
    throw new Error(`Graph download ${filePath}: ${errMsg(e)}`);
  }
  if (res.status === 404) {
    await res.body?.cancel().catch(() => undefined);
    return null;
  }
  if (res.status !== 200) {
    await res.body?.cancel().catch(() => undefined);
    throw new HttpError(res.status, `Graph download ${filePath}: HTTP ${res.status}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}
