# Admin: Microsoft Entra ID sign-in and security model

`/admin` (pages) and `/api/admin/*` (JSON API) are restricted to members of the Nymbus Microsoft Entra ID tenant.

## Entra app registration (one-time)

1. **App registrations → New registration**
   - Supported account types: **Accounts in this organizational directory only** (single tenant).
   - Redirect URI: platform **Web**, `https://<public host>/api/auth/callback` (the value of `PUBLIC_URL` + `/api/auth/callback`).
   - Leave *implicit grant* and *hybrid flows* unchecked.
2. **Certificates & secrets** → new client secret → `AZURE_CLIENT_SECRET` (note its expiry and rotate it before then).
   `AZURE_TENANT_ID` / `AZURE_CLIENT_ID` come from the *Overview* page.
3. **Token configuration → Add optional claim → ID token**: `acct`, `email`, `upn` (accept the Microsoft Graph
   `email` / `profile` permissions). **`acct` is mandatory**: without it sign-in is refused, because member accounts
   could not be told apart from guests.
4. **Restrict who can sign in** (strongly recommended):
   - *Enterprise applications → <the app> → Properties → **Assignment required? = Yes***, then
     *Users and groups* → assign the people / groups who may use the admin. Unassigned users cannot even obtain a token.
   - Optionally define an **app role** (*App registrations → App roles*, allowed member types *Users/Groups*, value e.g.
     `Admin.Web`), assign it in *Enterprise applications → Users and groups*, and set `ADMIN_REQUIRED_ROLE=Admin.Web`.
     The role arrives in the `roles` claim of the ID token.
5. **Group restriction** (optional, alternative to the role): *Token configuration → Add groups claim* → *Security groups*
   (or better *Groups assigned to the application*), ID token as *Group ID*; set `ADMIN_ALLOWED_GROUP_IDS` to the group
   object ids. A user in too many groups gets a *group overage* instead of the list and is refused with an explicit
   message: use "groups assigned to the application" or an app role instead.
6. API permissions: only the delegated `openid`, `profile`, `email` (no admin consent needed beyond that).

## Environment

| Variable | Purpose |
| --- | --- |
| `PUBLIC_URL` | public origin (https); redirect URI and CSRF origin |
| `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` | the app registration above (tenant id must be a GUID) |
| `AUTH_SECRET` | ≥ 32 random characters, e.g. `openssl rand -base64 48`. Changing it signs everyone out |
| `ADMIN_ALLOWED_DOMAINS` | default `nymbus.ca`, comma separated, exact match (no implicit subdomains) |
| `ADMIN_ALLOWED_GROUP_IDS` | optional group object ids |
| `ADMIN_REQUIRED_ROLE` | optional app role value |
| `AUTH_INSECURE_COOKIES_FOR_LOCALHOST` | e2e only (`PUBLIC_URL` on localhost) |

Missing or weak settings disable the admin (HTTP 503) instead of running insecurely. The `AUTH_SECRET` committed for
the e2e tests and a localhost `PUBLIC_URL` in production are refused.

## How sign-in works

1. `/admin` without a session → `/api/auth/login?returnTo=…` (same-site `/admin…` paths only).
2. Login creates `state`, `nonce` and a PKCE verifier (S256), stores them encrypted (A256GCM, key derived from
   `AUTH_SECRET`) in a 10-minute HttpOnly cookie, and redirects to
   `https://login.microsoftonline.com/<tenant>/oauth2/v2.0/authorize`.
3. `/api/auth/callback` checks `state`, redeems the code (confidential client + verifier), verifies the ID token with the
   tenant JWKS (RS256, exact issuer `https://login.microsoftonline.com/<tenant>/v2.0`, audience = client id, nonce,
   `tid`), then applies the policy (`src/lib/auth/policy.ts`):
   - `tid` = the tenant; `oid` present;
   - member, not guest: `acct` = 0 required, no `#EXT#`, no foreign `idp`;
   - the **sign-in name** (`preferred_username`, else `upn`: controlled by the tenant admins) is in an allowed domain.
     The `email` claim is never used for authorization;
   - optional groups / app role.
4. Session: HS256 JWT in `__Host-nymbus_admin` (HttpOnly, Secure, SameSite=Lax, Path=/), **4 h**, with a random `jti`
   and `pv` = fingerprint of the policy (domains, groups, role). A policy change invalidates existing sessions.
5. Every request: `src/proxy.ts` and again each page / route handler verify signature, expiry, `pv`, revocation, and
   re-apply tenant / domain / guest checks.
6. Logout (POST `/api/auth/logout`) revokes the `jti` server-side (`revoked/<jti>` on the data volume, pruned after
   expiry) and clears the cookie; `sso=1` also signs out of Microsoft.

## Other protections

- CSRF: mutating `/api/admin` calls need `Origin` = `PUBLIC_URL` origin **and** `x-nymbus-admin: 1` or a JSON body.
- CSP: per-request nonce (`script-src 'self' 'nonce-…' 'strict-dynamic'`), set by `src/proxy.ts` on every page.
- Every admin mutation is recorded in `audit/audit.jsonl` with the user's e-mail (see *Audit log* in the admin).
- Uploaded files: PDF only (`%PDF-` magic bytes), ≤ 25 MB, sanitised names; served only while published, as
  `application/pdf` + `nosniff`, `Cache-Control: public, no-cache` + ETag.

## Messages (contact form)

*Admin → messages* (`/admin/inquiries`; the dashboard header shows the number of open messages) lists the messages sent with the public /contact form, newest first (filter
open / handled / all; an open message is the "unread" marker): name, e-mail (reply link), phone, organisation, profile (financial advisor / institution / individual investor / other), interests, language, consent time
and message. Reply from your own mailbox, then **mark handled** (records who and when; "mark open" undoes it) or
**delete** (confirm dialog, cannot be undone). **Export CSV** downloads every stored message (the file then holds
personal information: keep it out of shared folders and delete it after use).

- Same protections as every admin page and API: Entra session re-verified by the proxy and by each page / route
  (`GET /api/admin/inquiries`, `GET /api/admin/inquiries/export`, `PATCH|DELETE /api/admin/inquiries/<id>`), CSRF rules on the mutations, strict ids.
- Audit log: `inquiries.view` (count only) on every listing, `inquiries.export` (count only), `inquiry.handled` / `inquiry.reopened` / `inquiry.delete`
  with the inquiry id. The sender's details never go to the audit log, the server logs or the alerts channel (the Teams /
  JSON alert, when `PIPELINE_ALERT_WEBHOOK` is set, names the sender's first name and profile only, with a link here).
- Use: only to answer the request, never for marketing (privacy policy § 11). Each inquiry is deleted automatically
  after the retention set in *Admin → settings* ("delete contact messages after (days)": default 180, between 30 and
  180, because the privacy policy promises deletion within 180 days; a longer period needs a policy change first).
- Storage, guards and retention: `docs/architecture.md` § Contact form.
