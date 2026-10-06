/**
 * GET /api/status — public data-freshness status (no auth): publication time, as-of dates of the blocks the site shows
 * and a freshness verdict; no run status, schedule, issue text or hostname (those are in the admin). Always HTTP 200
 * with `ok`; with `?strict=1` HTTP 503 (not cacheable) when stale, for an external uptime monitor. Computed at most once
 * a minute per process. Liveness stays on /api/health (a stale verdict must never restart the service).
 */
import type { NextRequest } from "next/server";
import { publicStatus, siteStatus, type PublicStatus } from "@/lib/pipeline/monitor";

export const dynamic = "force-dynamic";

const TTL_MS = 60_000;
const G = globalThis as typeof globalThis & { __nymbusStatusCache?: { at: number; value: Promise<PublicStatus> } };

function cached(): Promise<PublicStatus> {
  const c = G.__nymbusStatusCache;
  if (c && Date.now() - c.at < TTL_MS) return c.value;
  const value = siteStatus().then(publicStatus);
  G.__nymbusStatusCache = { at: Date.now(), value };
  value.catch(() => {
    if (G.__nymbusStatusCache?.value === value) G.__nymbusStatusCache = undefined;
  });
  return value;
}

const CACHE = { "Cache-Control": "public, max-age=60, s-maxage=60", "X-Content-Type-Options": "nosniff" };
const NO_STORE = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function GET(request: NextRequest) {
  const strict = ["1", "true"].includes(request.nextUrl.searchParams.get("strict") ?? "");
  try {
    const s = await cached();
    if (strict && !s.ok) return Response.json(s, { status: 503, headers: NO_STORE });
    return Response.json(s, { status: 200, headers: CACHE });
  } catch (e) {
    console.error("[status]", e instanceof Error ? e.message : e);
    return Response.json({ ok: false, verdict: "unknown", error: "status unavailable" }, { status: strict ? 503 : 200, headers: NO_STORE });
  }
}
