/**
 * fetch with timeout + bounded retries (network errors, 5xx, 429). Dependency-free.
 * Error messages never contain request headers (credentials).
 */

export type FetchImpl = typeof fetch;

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface RetryOpts {
  timeoutMs?: number;
  /** retries after the first attempt (default 2) */
  retries?: number;
  /** base backoff (default 500 ms, env PIPELINE_RETRY_BASE_MS), doubled per attempt */
  backoffMs?: number;
  /** honour a Retry-After header on 429/503 (capped at 60 s) */
  honorRetryAfter?: boolean;
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export const retryBaseMs = (env: NodeJS.ProcessEnv = process.env): number => {
  const v = Number(env.PIPELINE_RETRY_BASE_MS);
  return Number.isFinite(v) && v >= 0 ? v : 500;
};

/** URL without query string credentials / for messages. */
export const safeUrl = (url: string): string => {
  try {
    const u = new URL(url);
    u.username = "";
    u.password = "";
    return `${u.pathname}${u.search}`;
  } catch {
    return "<invalid url>";
  }
};

function retryAfterMs(res: Response): number | null {
  const h = res.headers.get("retry-after");
  if (!h) return null;
  const s = Number(h);
  if (Number.isFinite(s)) return Math.min(60_000, Math.max(0, s * 1000));
  const d = Date.parse(h);
  return Number.isFinite(d) ? Math.min(60_000, Math.max(0, d - Date.now())) : null;
}

/**
 * Returns the Response for any status that is not retried (2xx, 4xx except 429), after at most
 * `retries` retries on network errors / timeouts / 5xx / 429. Throws the last error otherwise.
 */
export async function fetchRetry(fetchImpl: FetchImpl, url: string, init: RequestInit = {}, opts: RetryOpts = {}): Promise<Response> {
  const retries = opts.retries ?? 2;
  const base = opts.backoffMs ?? retryBaseMs();
  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    let wait = base * 2 ** attempt;
    try {
      const res = await fetchImpl(url, { ...init, redirect: "manual", signal: AbortSignal.timeout(opts.timeoutMs ?? 60_000) });
      if (res.status >= 500 || res.status === 429) {
        lastErr = new HttpError(res.status, `HTTP ${res.status} on ${safeUrl(url)}`);
        if (opts.honorRetryAfter) wait = retryAfterMs(res) ?? wait;
        await res.body?.cancel().catch(() => undefined);
      } else {
        return res;
      }
    } catch (e: unknown) {
      const name = (e as Error)?.name;
      lastErr = new Error(name === "TimeoutError" || name === "AbortError" ? `timeout on ${safeUrl(url)}` : `network error on ${safeUrl(url)}: ${(e as Error)?.message ?? e}`);
    }
    if (attempt < retries) await sleep(wait);
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export async function readJsonBody(res: Response, url: string): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`invalid JSON from ${safeUrl(url)}`);
  }
}

export const errMsg = (e: unknown): string => (e instanceof Error ? e.message : String(e));
