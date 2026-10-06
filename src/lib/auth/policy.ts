/**
 * Admin authorization policy — PURE (no I/O, no dependencies), unit tested in tests/unit/auth/policy.test.ts.
 *
 * Who may use the admin:
 *  - an account of the configured Entra tenant (`tid` === AZURE_TENANT_ID),
 *  - that is a MEMBER of that tenant: `acct` must be present and 0 (fail closed: the app registration must emit the
 *    `acct` optional claim), no `#EXT#` in its names, no foreign `idp`,
 *  - whose sign-in name (`preferred_username`, else `upn`: set by the tenant's administrators, not by the user) is
 *    exactly in an allowed domain (ADMIN_ALLOWED_DOMAINS, default `nymbus.ca`; no implicit subdomains). The
 *    `email` claim is user/admin-editable metadata and is never used for authorization,
 *  - when ADMIN_ALLOWED_GROUP_IDS is set, that is a member of one of those groups (`groups` claim); a group overage
 *    (`_claim_names.groups`) is denied with an explicit message instead of guessed,
 *  - when ADMIN_REQUIRED_ROLE is set, whose `roles` claim contains that app role.
 *
 * `evaluateLogin` runs on the verified id_token at sign-in; `evaluateSession` re-checks tenant / domain on
 * every request from the session claims (a policy change, e.g. removing a domain, takes effect at once).
 */

export type Claims = Record<string, unknown>;

export interface PolicyConfig {
  tenantId: string;
  allowedDomains: readonly string[];
  allowedGroupIds?: readonly string[];
  /** app role value that must be in the `roles` claim (ADMIN_REQUIRED_ROLE); empty/undefined = no role required */
  requiredRole?: string;
}

type PolicyDenyReason = "tenant" | "subject" | "guest" | "acct-missing" | "email" | "domain" | "groups" | "groups-overage" | "role";

export type PolicyResult =
  | { ok: true; oid: string; email: string; name: string; tid: string }
  | { ok: false; reason: PolicyDenyReason; message: string };

const DEFAULT_ALLOWED_DOMAINS: readonly string[] = ["nymbus.ca"];

const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DOMAIN_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export const isGuid = (v: unknown): v is string => typeof v === "string" && GUID_RE.test(v);

const str = (v: unknown): string | undefined => (typeof v === "string" && v.length > 0 ? v : undefined);

/** ADMIN_ALLOWED_DOMAINS → normalised list. Empty / unset → default. Invalid entries throw (fail closed at startup). */
export function parseAllowedDomains(raw: string | undefined): string[] {
  if (raw === undefined || raw.trim() === "") return [...DEFAULT_ALLOWED_DOMAINS];
  const out = raw
    .split(",")
    .map((s) => s.trim().toLowerCase().replace(/^@/, ""))
    .filter((s) => s.length > 0);
  if (out.length === 0) throw new Error("ADMIN_ALLOWED_DOMAINS contains no domain");
  for (const d of out) if (!DOMAIN_RE.test(d)) throw new Error(`invalid domain in ADMIN_ALLOWED_DOMAINS: "${d}"`);
  return [...new Set(out)];
}

/** ADMIN_ALLOWED_GROUP_IDS → list of lower-case GUIDs (empty = no group restriction). Invalid entries throw. */
export function parseGroupIds(raw: string | undefined): string[] {
  if (raw === undefined || raw.trim() === "") return [];
  const out = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
  for (const g of out) if (!GUID_RE.test(g)) throw new Error(`invalid group object id in ADMIN_ALLOWED_GROUP_IDS: "${g}"`);
  return [...new Set(out)];
}

/** ADMIN_REQUIRED_ROLE → trimmed app-role value, or "" (no restriction). Invalid values throw. */
export function parseRequiredRole(raw: string | undefined): string {
  const r = (raw ?? "").trim();
  if (r && !/^[A-Za-z0-9][A-Za-z0-9._-]{0,119}$/.test(r)) throw new Error(`invalid app role in ADMIN_REQUIRED_ROLE: "${r}"`);
  return r;
}

/** Lower-cased address with exactly one ASCII `@`, no whitespace / control characters; null otherwise. */
export function normalizeEmail(raw: string): string | null {
  const e = raw.toLowerCase();
  if (e.length === 0 || e.length > 254) return null;
  // eslint-disable-next-line no-control-regex
  if (/[\s\u0000-\u001f\u007f]/.test(e)) return null;
  const at = e.indexOf("@");
  if (at <= 0 || at !== e.lastIndexOf("@") || at === e.length - 1) return null;
  return e;
}

/** Exact (case-insensitive) domain match: `a@nymbus.ca` yes; `a@evilnymbus.ca`, `a@nymbus.ca.evil.com`, `a@x.nymbus.ca` no. */
export function isAllowedEmail(email: string, allowedDomains: readonly string[]): boolean {
  const n = normalizeEmail(email);
  if (!n) return false;
  const domain = n.slice(n.indexOf("@") + 1);
  return allowedDomains.some((d) => d.toLowerCase() === domain);
}

/** Why the claims look like a guest / external account, or null for a tenant member. */
export function guestReason(claims: Claims, tenantId: string): string | null {
  for (const k of ["upn", "preferred_username", "email", "unique_name"]) {
    const v = str(claims[k]);
    if (v && v.toUpperCase().includes("#EXT#")) return `the ${k} claim identifies a guest (#EXT#) account`;
  }
  if (claims.idp !== undefined && claims.idp !== null) {
    const idp = typeof claims.idp === "string" ? claims.idp.toLowerCase().replace(/\/+$/, "") : "";
    const t = tenantId.toLowerCase();
    const own = [`https://sts.windows.net/${t}`, `https://login.microsoftonline.com/${t}/v2.0`, `https://login.microsoftonline.com/${t}`];
    if (!own.includes(idp)) return "the account is authenticated by another identity provider (guest)";
  }
  if (claims.acct !== undefined && claims.acct !== null) {
    if (claims.acct === 1 || claims.acct === "1") return "the acct claim identifies a guest account";
    if (!(claims.acct === 0 || claims.acct === "0")) return "unrecognised acct claim";
  }
  return null;
}

const acctMissing = (claims: Claims) => claims.acct === undefined || claims.acct === null;

function tenantMatches(tid: unknown, tenantId: string): tid is string {
  return typeof tid === "string" && isGuid(tid) && tid.toLowerCase() === tenantId.toLowerCase();
}

/** Tenant-controlled sign-in name. `email` is deliberately NOT used (editable, not verified for authorization). */
function pickSignInName(claims: Claims): string | undefined {
  return str(claims.preferred_username) ?? str(claims.upn);
}

/** Policy on the (already signature-verified) id_token claims at sign-in. */
export function evaluateLogin(claims: Claims, cfg: PolicyConfig): PolicyResult {
  if (!isGuid(cfg.tenantId)) return { ok: false, reason: "tenant", message: "The admin tenant is not configured." };
  if (!tenantMatches(claims.tid, cfg.tenantId)) {
    return { ok: false, reason: "tenant", message: "This account does not belong to the Nymbus Microsoft tenant." };
  }
  const oid = claims.oid;
  if (!isGuid(oid)) return { ok: false, reason: "subject", message: "The sign-in token has no object id (oid)." };

  const guest = guestReason(claims, cfg.tenantId);
  if (guest) return { ok: false, reason: "guest", message: `Guest accounts cannot use the admin: ${guest}.` };
  if (acctMissing(claims)) {
    return {
      ok: false,
      reason: "acct-missing",
      message: "The sign-in token has no acct claim, so member accounts cannot be told apart from guests. " +
        "An administrator must add the acct optional claim to the ID token (app registration → Token configuration).",
    };
  }

  const rawName = pickSignInName(claims);
  const email = rawName ? normalizeEmail(rawName) : null;
  if (!email) return { ok: false, reason: "email", message: "The sign-in token has no usable sign-in name (preferred_username / upn)." };
  if (!isAllowedEmail(email, cfg.allowedDomains)) {
    return { ok: false, reason: "domain", message: "This account's e-mail domain is not allowed to use the admin." };
  }

  const groups = cfg.allowedGroupIds ?? [];
  if (groups.length > 0) {
    const names = claims._claim_names;
    if (names && typeof names === "object" && "groups" in (names as Record<string, unknown>)) {
      return {
        ok: false,
        reason: "groups-overage",
        message:
          "Your account is a member of too many groups for them to be listed in the sign-in token (group overage). " +
          "Ask an administrator to configure the app registration to emit only the groups assigned to the application.",
      };
    }
    const claimGroups = Array.isArray(claims.groups) ? claims.groups.filter((g): g is string => typeof g === "string") : [];
    const mine = new Set(claimGroups.map((g) => g.toLowerCase()));
    if (!groups.some((g) => mine.has(g.toLowerCase()))) {
      return { ok: false, reason: "groups", message: "Your account is not a member of a group allowed to use the admin." };
    }
  }

  const role = cfg.requiredRole ?? "";
  if (role) {
    const roles = Array.isArray(claims.roles) ? claims.roles.filter((r): r is string => typeof r === "string") : [];
    if (!roles.includes(role)) {
      return { ok: false, reason: "role", message: `Your account has not been assigned the "${role}" role of the admin application.` };
    }
  }

  const name = (str(claims.name) ?? email).slice(0, 200);
  return { ok: true, oid: oid.toLowerCase(), email, name, tid: (claims.tid as string).toLowerCase() };
}

/**
 * Fingerprint of the authorization policy (domains, groups, role). Stored in the session (`pv`) so tightening the
 * policy (e.g. adding a group or role requirement) invalidates existing sessions, which were checked under the old
 * rules at sign-in. Pure (FNV-1a 64 over a canonical string; not a secret).
 */
export function policyVersion(cfg: Pick<PolicyConfig, "tenantId" | "allowedDomains" | "allowedGroupIds" | "requiredRole">): string {
  const canon = JSON.stringify([
    cfg.tenantId.toLowerCase(),
    [...cfg.allowedDomains].map((d) => d.toLowerCase()).sort(),
    [...(cfg.allowedGroupIds ?? [])].map((g) => g.toLowerCase()).sort(),
    cfg.requiredRole ?? "",
  ]);
  let h = 0xcbf29ce484222325n;
  for (const b of new TextEncoder().encode(canon)) {
    h ^= BigInt(b);
    h = (h * 0x100000001b3n) & 0xffffffffffffffffn;
  }
  return h.toString(16).padStart(16, "0");
}

/** Re-check on every request from the session claims (tenant, member, domain). Groups are checked at sign-in. */
export function evaluateSession(session: { sub?: unknown; email?: unknown; name?: unknown; tid?: unknown }, cfg: PolicyConfig): PolicyResult {
  if (!isGuid(cfg.tenantId) || !tenantMatches(session.tid, cfg.tenantId)) {
    return { ok: false, reason: "tenant", message: "This session does not belong to the Nymbus Microsoft tenant." };
  }
  if (!isGuid(session.sub)) return { ok: false, reason: "subject", message: "Invalid session subject." };
  const email = typeof session.email === "string" ? normalizeEmail(session.email) : null;
  if (!email) return { ok: false, reason: "email", message: "The session has no usable e-mail address." };
  if (email.toUpperCase().includes("#EXT#")) return { ok: false, reason: "guest", message: "Guest accounts cannot use the admin." };
  if (!isAllowedEmail(email, cfg.allowedDomains)) {
    return { ok: false, reason: "domain", message: "This account's e-mail domain is not allowed to use the admin." };
  }
  const name = (typeof session.name === "string" && session.name ? session.name : email).slice(0, 200);
  return { ok: true, oid: session.sub.toLowerCase(), email, name, tid: session.tid.toLowerCase() };
}
