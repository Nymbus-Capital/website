/**
 * Server-side client of the WordPress document: fixed endpoint (built from the configured base, never from data), hard
 * timeout, no redirects (a redirect could point the request, and the secret header, elsewhere), JSON only, response
 * size cap, then strict validation. `fetch` is injectable for tests. Dependency-free (unit tested).
 */
import { CONTENT_SECRET_HEADER, type CmsConfig } from "./config.ts";
import { parseCmsDocument, type ParseResult } from "./validate.ts";

export const MAX_BYTES = 2 * 1024 * 1024;

export class CmsFetchError extends Error {
  constructor(message: string) { super(message); this.name = "CmsFetchError"; }
}

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

async function readCapped(res: Response, max: number): Promise<string> {
  const declared = Number(res.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > max) throw new CmsFetchError(`response too large (${declared} bytes)`);
  if (!res.body) {
    const t = await res.text();
    if (t.length > max) throw new CmsFetchError("response too large");
    return t;
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let n = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    n += value.byteLength;
    if (n > max) { await reader.cancel().catch(() => undefined); throw new CmsFetchError("response too large"); }
    chunks.push(value);
  }
  const all = new Uint8Array(n);
  let o = 0;
  for (const c of chunks) { all.set(c, o); o += c.byteLength; }
  return new TextDecoder("utf-8", { fatal: false }).decode(all);
}

/** Fetches and validates the document. Throws CmsFetchError (transport / status / size / type) or CmsInvalidError (content). */
export async function fetchCmsDocument(cfg: CmsConfig, fetchImpl: FetchLike = fetch as FetchLike): Promise<ParseResult> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (cfg.contentSecret) headers[CONTENT_SECRET_HEADER] = cfg.contentSecret;
  let res: Response;
  try {
    res = await fetchImpl(cfg.endpoint, { method: "GET", headers, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(cfg.timeoutMs) });
  } catch (e: unknown) {
    // the message never includes request headers; keep it short anyway
    const name = e instanceof Error ? e.name : "error";
    throw new CmsFetchError(name === "TimeoutError" || name === "AbortError" ? `timeout after ${cfg.timeoutMs} ms` : `request failed (${name})`);
  }
  if (!res.ok) { await res.body?.cancel().catch(() => undefined); throw new CmsFetchError(`HTTP ${res.status}`); }
  const type = (res.headers.get("content-type") ?? "").toLowerCase();
  if (!type.includes("application/json")) { await res.body?.cancel().catch(() => undefined); throw new CmsFetchError(`unexpected content type`); }
  const text = await readCapped(res, MAX_BYTES);
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { throw new CmsFetchError("invalid JSON"); }
  return parseCmsDocument(raw, { mediaOrigin: cfg.mediaOrigin, allowLoopbackHttp: cfg.allowLoopbackHttp });
}
