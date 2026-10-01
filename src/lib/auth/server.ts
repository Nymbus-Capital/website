/**
 * Session check for server components (admin layout and pages): the proxy already gated the request, this is the
 * defence-in-depth re-check from the cookie store. Server only.
 */
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authConfig, verifySessionToken, type AdminUser, type SessionCheck } from "./session.ts";

export async function adminSession(): Promise<SessionCheck> {
  const c = authConfig();
  if (!c.ok) return { status: "misconfigured", message: "Admin sign-in is not configured on this server." };
  const store = await cookies();
  return verifySessionToken(store.get(c.config.cookie.name)?.value, c.config);
}

/** The signed-in admin, or a redirect to sign-in. Throws (renders the error boundary) when denied / misconfigured. */
export async function requireAdminPage(returnTo = "/admin"): Promise<AdminUser> {
  const s = await adminSession();
  if (s.status === "ok") return s.user;
  if (s.status === "none") redirect(`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  throw new Error(s.status === "denied" ? "Access denied." : "Admin sign-in is not configured.");
}
