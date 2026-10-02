/**
 * POST /api/cms/revalidate — called by the WordPress plugin after an editor saves (and by hand with curl): refetches
 * the document now instead of waiting for the time-based revalidation. `Authorization: Bearer <WP_REVALIDATE_SECRET>`.
 * 404 when the CMS is not configured; 503 when no secret is set (fail closed); 401 on a wrong secret; 429 after
 * repeated failures. No cookies are involved (no CSRF surface), the body is ignored, the secret is never logged.
 */
import { bearerToken, failureLimiter, secretsEqual } from "@/lib/cms/auth";
import { cmsSource } from "@/lib/cms";

export const dynamic = "force-dynamic";

const H = { "Cache-Control": "no-store" };
const limiter = failureLimiter();

export async function POST(req: Request) {
  const c = cmsSource();
  if (!c) return Response.json({ error: "not_found" }, { status: 404, headers: H });
  if (!c.cfg.revalidateSecret) return Response.json({ error: "revalidation_not_configured" }, { status: 503, headers: H });
  if (limiter.blocked()) return Response.json({ error: "too_many_attempts" }, { status: 429, headers: { ...H, "Retry-After": "60" } });
  if (!secretsEqual(bearerToken(req.headers.get("authorization")), c.cfg.revalidateSecret)) {
    limiter.fail();
    return Response.json({ error: "unauthorized" }, { status: 401, headers: H });
  }
  const r = await c.source.revalidate();
  return Response.json({ ok: r.ok, source: r.origin }, { headers: H });
}

export function GET() {
  return Response.json({ error: "method_not_allowed" }, { status: 405, headers: { ...H, Allow: "POST" } });
}
