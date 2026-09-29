/**
 * POST /api/auth/logout — clears the admin session. Same-origin only (Origin must equal PUBLIC_URL when present,
 * so a cross-site page cannot log admins out). `?sso=1` (or form field sso=1) also signs out of Microsoft.
 * Responds 303 to "/" (or the Entra logout endpoint) for form posts, JSON for fetch calls.
 */
import { NextResponse, type NextRequest } from "next/server";
import { authConfig, checkRequestSession } from "@/lib/auth/session";
import { audit } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const c = authConfig();
  if (!c.ok) return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  const cfg = c.config;
  const origin = request.headers.get("origin");
  if (origin && origin !== cfg.origin) return NextResponse.json({ error: "csrf" }, { status: 403 });

  const s = await checkRequestSession(request);
  if (s.status === "ok") await audit({ by: s.user.email, action: "auth.logout" }).catch(() => undefined);

  let sso = request.nextUrl.searchParams.get("sso") === "1";
  const ct = request.headers.get("content-type") || "";
  if (!sso && ct.startsWith("application/x-www-form-urlencoded")) {
    const f = await request.formData().catch(() => null);
    sso = f?.get("sso") === "1";
  }
  const wantsJson = (request.headers.get("accept") || "").includes("application/json") && !ct.startsWith("application/x-www-form-urlencoded");

  let target = new URL("/", cfg.origin).toString();
  if (sso) {
    const u = new URL(cfg.logoutEndpoint);
    u.searchParams.set("post_logout_redirect_uri", `${cfg.origin}/`);
    target = u.toString();
  }
  const res = wantsJson ? NextResponse.json({ ok: true, redirect: target }) : NextResponse.redirect(target, { status: 303 });
  res.headers.set("Cache-Control", "no-store");
  res.cookies.set(cfg.cookie.name, "", { httpOnly: true, secure: cfg.cookie.secure, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
