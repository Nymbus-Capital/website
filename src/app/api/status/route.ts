/**
 * GET /api/status — public data-freshness status (no auth, no secrets): last run time and status, last publication,
 * performance / NAV as-of per fund, next scheduled run and a freshness verdict. Always HTTP 200 with `ok`; with
 * `?strict=1` HTTP 503 when stale (for an external uptime monitor). Computed at most once a minute per process and
 * cacheable for 60 s. Liveness stays on /api/health (a stale verdict must never restart the service).
 */
import type { NextRequest } from "next/server";
import { siteStatus, type SiteStatus } from "@/lib/pipeline/monitor";

export const dynamic = "force-dynamic";

const TTL_MS = 60_000;
const G = globalThis as typeof globalThis & { __nymbusStatusCache?: { at: number; value: Promise<SiteStatus> } };

function cached(): Promise<SiteStatus> {
  const c = G.__nymbusStatusCache;
  if (c && Date.now() - c.at < TTL_MS) return c.value;
  const value = siteStatus();
  G.__nymbusStatusCache = { at: Date.now(), value };
  value.catch(() => {
    if (G.__nymbusStatusCache?.value === value) G.__nymbusStatusCache = undefined;
  });
  return value;
}

export async function GET(request: NextRequest) {
  const strict = ["1", "true"].includes(request.nextUrl.searchParams.get("strict") ?? "");
  const headers = { "Cache-Control": "public, max-age=60, s-maxage=60", "X-Content-Type-Options": "nosniff" };
  try {
    const s = await cached();
    return Response.json(s, { status: strict && !s.ok ? 503 : 200, headers });
  } catch (e) {
    console.error("[status]", e instanceof Error ? e.message : e);
    return Response.json({ ok: false, verdict: "unknown", error: "status unavailable" }, { status: strict ? 503 : 200, headers: { "Cache-Control": "no-store" } });
  }
}
