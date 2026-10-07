/**
 * POST /api/auth/logout — revokes the session server-side (jti) and clears the cookie. Same-origin only (Origin must equal PUBLIC_URL when present,
 * so a cross-site page cannot log admins out). `?sso=1` (or form field sso=1) also signs out of Microsoft.
 * Responds 303 to "/" (or the Entra logout endpoint) for form posts, JSON for fetch calls.
 */
import { NextResponse, type NextRequest } from "next/server";
import { denyPage } from "@/lib/auth/deny";
import { authConfig, checkRequestSession } from "@/lib/auth/session";
import { audit } from "@/lib/data/store";
import { revokeSession } from "@/lib/auth/revocation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const c = authConfig();
  if (!c.ok) return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  const cfg = c.config;
  const origin = request.headers.get("origin");
  if (origin && origin !== cfg.origin) return NextResponse.json({ error: "csrf" }, { status: 403 });

  const ct = request.headers.get("content-type") || "";
  const wantsJson =
    (request.headers.get("accept") || "").includes("application/json") &&
    !ct.startsWith("application/x-www-form-urlencoded");
  const clear = <R extends NextResponse | Response>(res: R): R => {
    res.headers.append(
      "Set-Cookie",
      `${cfg.cookie.name}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${cfg.cookie.secure ? "; Secure" : ""}`,
    );
    res.headers.set("Cache-Control", "no-store");
    return res;
  };

  const s = await checkRequestSession(request);
  if (s.status === "ok") {
    // server-side revocation: a copied cookie stops working too. If it cannot be recorded, do NOT report success
    // (the token would stay valid until it expires): clear the cookie anyway and ask the user to retry.
    try {
      await revokeSession(s.session.jti, s.session.exp);
    } catch (e: unknown) {
      console.error("[auth] revocation failed:", e instanceof Error ? e.message : e);
      const msg =
        "Sign-out could not be completed on the server. Your browser session was cleared, but please sign in and sign out again, or contact an administrator.";
      return clear(
        wantsJson
          ? NextResponse.json({ ok: false, error: "revocation_failed", message: msg }, { status: 500 })
          : denyPage(500, "sign-out incomplete", msg),
      );
    }
    await audit({ by: s.user.email, action: "auth.logout" }).catch(() => undefined);
  }

  let sso = request.nextUrl.searchParams.get("sso") === "1";
  if (!sso && ct.startsWith("application/x-www-form-urlencoded")) {
    const f = await request.formData().catch(() => null);
    sso = f?.get("sso") === "1";
  }
  let target = new URL("/", cfg.origin).toString();
  if (sso) {
    const u = new URL(cfg.logoutEndpoint);
    u.searchParams.set("post_logout_redirect_uri", `${cfg.origin}/`);
    target = u.toString();
  }
  return clear(
    wantsJson ? NextResponse.json({ ok: true, redirect: target }) : NextResponse.redirect(target, { status: 303 }),
  );
}
