# Nymbus website content (WordPress)

WordPress is **only the editing tool** for the Nymbus website. The website itself is the Next.js application in this
repository; it reads what you write here (news, team, a few texts, in English and French) and shows it. The live fund
figures never come from WordPress.

This folder contains:

| Path | What |
| --- | --- |
| `plugins/nymbus-site-content/` | the plugin: News, Team, Site texts (incl. contact details and page intros) and the read-only content endpoint |
| `mu-plugins/nymbus-headless.php` | always-on hardening (no public WordPress front end, no XML-RPC, no file editor, no installs / updates from wp-admin, no application passwords) |
| `mu-plugins/nymbus-security.php` (+ `nymbus-lib/`) | "Sign in with Microsoft" configured from env, password sign-in for the emergency admin only, real visitor IP for the login limiter, bundled plugins kept active |
| `Dockerfile`, `docker/` | the production image: pinned WordPress, the two plugins above, two pinned wordpress.org plugins (checksums), WP-CLI, Apache rules |
| `docker-compose.yml`, `.env.example`, `scripts/setup.sh` | a local copy for trying things (built from the same Dockerfile) |
| `scripts/import-from-site.mjs` | exports the website's current team and news for `wp nymbus import` (first go-live) |
| `tests/*-test.php`, `tests/docker-smoke.sh` | plain-PHP tests (`for t in wordpress/tests/*-test.php; do php $t; done`) and the smoke test of the built image (CI) |

---

## For editors: changing the website

Sign in at the address you were given (`/wp-login.php`) with **Sign in with Microsoft** (your @nymbus.ca account; your
first sign-in creates your WordPress account as an *Editor*). In the left menu choose **Nymbus**. Everything on the
website that you can change is under it:

| Menu | What you change |
| --- | --- |
| **Nymbus → News** | the news items (home page shows the 3 latest; the News page shows all) |
| **Nymbus → Team** | the people on the team and board |
| **Nymbus → Site texts** | the assets-under-management label, the announcement banner, contact details (footer + Contact page), page intros (Approach, Solutions, Sustainability, Team) |

Changes appear on the website **within about a minute** after you click **Publish** or **Update**. Nothing is
visible on the website until it is **Published**: a **Draft** is private, and a news item dated in the future is
published on that date.

### Add a news item

1. **Nymbus → News → Add news**.
2. Type the **English title** in the big title field at the top.
3. In the **Content** box: under **English** write the short summary (one or two sentences) and, if you want, the
   full text (leave an empty line between paragraphs). Click **Français** and do the same in French, including the
   **French title**. If a French field is empty, the website shows the English text.
4. Choose a **Category**. Add a **Link to another page** only if the news should point somewhere else (it must start
   with `https://`). If the full text is empty and there is a link, the card links straight to that page.
5. **News image** (right-hand side): *Choose the news image*. Optional.
6. The date is the **Publish date** (top right, "Publish immediately" by default). Click it to change the date.
7. Click **Publish**.

To change or remove an item: **Nymbus → News**, open it, edit, **Update**; or **Trash** it.

### Edit a team member

1. **Nymbus → Team**, click the person's name.
2. Change the fields in the **Content** box: *Main department*, *Also shown under* (people who belong to several
   departments), *Order on the page*, LinkedIn, and on the **English** / **Français** tabs the role, biography and
   previous roles. *Designations* (e.g. CFA) and *Education* are one per line; the website counts the CFA and PhD
   holders from them, so keep them accurate.
3. **Photo** (right-hand side): *Choose the photo*. Without a photo the website shows the person's initials.
4. **Update**.

**Add a person:** **Nymbus → Team → Add team member**, type the full name at the top, fill the box, **Publish**.

**Reorder:** the **Order on the page** number decides the order inside a department (smaller first). Use 10, 20,
30 … so you can slip someone in between (e.g. 25). The team list is sorted by that number; click the **Order**
column header to reverse it.

**Hide someone (without deleting):** tick **Hide from the website** and **Update**. Untick it to show them again.
The list shows *Hidden* / *Shown* in the **On the website** column.

### English and French

Every text has an English and a French version, on the two tabs of the **Content** box. The visitor sees the language
they chose on the website. If a French text is missing, the English one is shown instead. Names are not translated.

### Site texts

**Nymbus → Site texts**: the label shown for assets under management (for example `$1.8B+`), the announcement banner
(tick *Show the announcement banner*), the **contact details** and the **page intros**. A field you leave empty keeps
the website's built-in text. If the same text was also saved in the website's own admin (`/admin`), **that value wins**:
the website admin takes precedence over WordPress for the assets label and the banner.

- **Contact details**: e-mail, phone and office address (one line per row, as on an envelope) shown in the footer of
  every page and on the Contact page. The toll-free number and the address the contact form writes to stay as they are.
- **Page intros**: the big title (*headline*), a few words shown in colour right after it (*highlighted ending*,
  optional) and the sentence under it (*lead*) of the Approach, Solutions, Sustainability and Team pages. Each language
  is separate: if you fill only the English headline, the French page keeps its built-in French title. The
  Sustainability page has no lead field: that sentence explains which funds the ESG criteria apply to and was reviewed
  by compliance.
- Not here on purpose: disclosures, fund texts, awards and legal pages. They were reviewed by compliance and are changed
  by the website team (see *Who edits what* below).

### Good to know

- Text is **plain text**: formatting (bold, links inside the text) is not used and is removed. Use empty lines for paragraphs.
- Use pictures of a reasonable size (a few hundred KB; about 1600 px wide for news, a square or portrait photo for people).
- If something does not appear after a few minutes, check it is **Published** (not Draft or Pending), that *Hide from the website* is not ticked, and that the English title / name is filled in.
- Never put confidential information here: everything published is public.

### Who edits what

| What | Where | Who |
| --- | --- | --- |
| News, team (people, photos, bios, order) | **WordPress** → Nymbus → News / Team | editors |
| Contact details, page intros (Approach, Solutions, Sustainability headline, Team) | **WordPress** → Nymbus → Site texts | editors |
| AUM label, announcement banner | **WordPress** → Site texts, *or* the website **/admin** (the /admin value wins) | editors / admins |
| Fund figures, publishing runs, fund visibility, documents (factsheets…), awards entries, firm disclaimer | website **/admin** (Microsoft sign-in) | admins |
| Disclosures, fund copy, legal and privacy pages, Sustainability lead, page layout and design | **code** (this repository, compliance review: `docs/compliance-review.md`) | website team |

---

## For the developers: how it works

```
 editor ──▶ WordPress (this folder) ──▶  GET /wp-json/nymbus/v1/site-content  ──▶  Next.js server (src/lib/cms)
                                         one normalized, read-only JSON document       │ validates, sanitises, caches
                                         {schemaVersion, news[], team[], texts{}}       ▼  last good copy on /data
                                                                                   public pages
```

- **Post types** `nymbus_news` and `nymbus_team` (not public on the WordPress side, `show_in_rest` on, anonymous
  access to `/wp/v2/nymbus_*` and `/wp/v2/users` refused), classic editor with EN/FR tabs.
  News image / team photo = the post's featured image. Texts = one option, `nymbus_sc_texts`.
- **Endpoint** `/wp-json/nymbus/v1/site-content`: published, non-password-protected, non-hidden items only,
  whitelisted fields, plain text, https URLs only. `ETag` + `Cache-Control`; built once, kept in a transient, rebuilt
  on any change. Optional shared secret: set `NYMBUS_CONTENT_SECRET` and the request must carry the same value in the
  `X-Nymbus-Content-Secret` header.
- **Refresh**: the website re-reads the document at most every `CMS_REVALIDATE_SECONDS` (default 60). When
  `NYMBUS_REVALIDATE_URL` and `NYMBUS_REVALIDATE_SECRET` are set, the plugin also calls the website's
  `POST /api/cms/revalidate` after every save (fire-and-forget).
- **If WordPress is down** the website keeps serving its last good copy (memory, then the `/data` volume); with
  nothing at all it falls back to the built-in team and news. See `docs/architecture.md` ("Headless WordPress").
- Image URLs: the website only shows images served from its configured media origin (the public WordPress origin).

### How to add a field

Say editors should change one more text (e.g. a careers line). Five small steps, all covered by tests:

1. **Form** — `plugins/nymbus-site-content/includes/fields.php`: add a row to `nymbus_sc_text_fields()` (or
   `nymbus_sc_news_fields()` / `nymbus_sc_team_fields()`): `key`, `type`, `bi => true` for English + French, `max`,
   `label`, `help`. The screen, saving and sanitising follow from that row.
2. **Document** — `includes/normalize.php`: copy the value into the JSON (`nymbus_sc_shape_texts()` for a text; the
   shape functions for news / team). Only what is listed there ever leaves WordPress. Add a check to
   `tests/normalize-test.php`.
3. **Website types + validation** — `src/lib/cms/types.ts` (the optional property) and `src/lib/cms/validate.ts`
   (`parseTexts()`: plain text, length cap). Unknown fields are dropped there, so this step is required. Test in
   `tests/unit/cms/`.
4. **Use it** — `src/lib/cms/map.ts` (a small pure helper when the value replaces coded copy) and the page: pass it as an
   **optional prop with the coded copy as the default**, so nothing changes without WordPress. Add the value to
   `e2e/fixtures/wp-site-content.json` and a check to `e2e/cms.spec.ts`.
5. **Docs** — this README (editor guide + *Who edits what*). Never add a field for disclosures, fund copy, awards or
   legal text (compliance-reviewed: code or /admin).

### Try it locally

Needs Docker. From this folder:

```bash
cp .env.example .env                                # local-only values
docker compose up -d                                # WordPress http://localhost:8080 + MariaDB
docker compose --profile setup run --rm wpcli       # installs WordPress, activates the plugin, creates SAMPLE content
```

Sign in at <http://localhost:8080/wp-login.php> with `WP_ADMIN_USER` / `WP_ADMIN_PASSWORD` from `.env`. Then, from the
repository root, run the website against it:

```bash
WP_BASE_URL=http://localhost:8080 npm run dev
```

Open <http://localhost:3000/news> and `/team`, edit something in WordPress and reload (a minute at most). Remove
the sample content with
`docker compose --profile setup run --rm --entrypoint wp wpcli nymbus clear-samples`.
**Never go live with the sample items** (they are labelled "[Sample]").

### Security of the image

- **Immutable**: WordPress core (`FROM wordpress:<exact version>`), the plugins and WP-CLI are baked in at build time.
  `DISALLOW_FILE_MODS` and `file_mod_allowed` = no install / update / delete of code from wp-admin; automatic updates off.
- **Uploads**: no script ever runs from `wp-content/uploads` (Apache refuses `.php` and friends, the PHP engine is off
  there, `.htaccess` files there are ignored); uploads up to **8 MB** (`docker/` + `Dockerfile`: raise
  `upload_max_filesize` / `post_max_size` if a PDF ever needs more).
- **Sign-in**: *Sign in with Microsoft* through **OpenID Connect Generic Client** (wordpress.org, pinned), configured by
  `mu-plugins/nymbus-security.php` from the `NYMBUS_SSO_*` variables: our tenant only (endpoints and issuer built from
  the tenant id), the ID token's signature checked against the tenant keys, member accounts only (no guests), sign-in
  name in `NYMBUS_SSO_ALLOWED_DOMAINS` (default `nymbus.ca`), first sign-in = `NYMBUS_SSO_DEFAULT_ROLE` (default
  Editor, never Administrator). Once SSO is configured, **passwords work only for `NYMBUS_EMERGENCY_ADMIN`** (and
  password reset only for that account); XML-RPC and application passwords are off.
- **Brute force**: **Limit Login Attempts Reloaded** (wordpress.org, pinned): 4 wrong passwords = 20 min lockout (its
  defaults; *Settings → Limit Login Attempts*). Behind the load balancer, Apache (`mod_remoteip`, set up by the
  official image) takes the visitor address from the right of `X-Forwarded-For` (what the balancer appended); the
  limiter counts that address only (its "trusted IP origins" setting is forced), so a forged header cannot hand out
  fresh IPs. Should the balancer ever reach WordPress from a public address, every visitor would share one address:
  only the emergency password account could then be locked out (Microsoft sign-in does not go through it).
- **Plugins stay active**: the bundled plugins are activated on the first admin page view and cannot be deactivated
  from the Plugins screen.

### Updating WordPress (and the plugins)

Nothing updates itself. About once a month, or the day a security release is announced (wordpress.org/news):

1. **Core**: in `Dockerfile`, change `FROM wordpress:7.1.2-php8.3-apache` to the new exact tag (list:
   https://hub.docker.com/_/wordpress/tags?name=php8.3-apache; keep `-php8.3-apache` unless you also test a PHP bump).
2. **A plugin**: change `LLAR_VERSION` / `OIDC_VERSION` and its `*_SHA256`. Get the checksum from the official zip:
   `curl -fsSL https://downloads.wordpress.org/plugin/<slug>.<version>.zip | sha256sum` (slugs
   `limit-login-attempts-reloaded`, `daggerhart-openid-connect-generic`). A wrong checksum fails the build on purpose.
   **WP-CLI**: `WPCLI_VERSION` / `WPCLI_SHA256` (the `.sha256` file next to the release on GitHub).
3. Push: CI builds the image and runs `tests/docker-smoke.sh` (hardening, sign-in, plugins, import). Merge, then
   Northflank rebuilds the `wordpress` service. If WordPress asks for a database update, open `/wp-admin` once (or run
   `wp core update-db` in the service shell).

### Deploying on Northflank

WordPress runs as its own service next to the website, in the same project. **Nothing here has been created yet**:
the full list of steps, with who does what, is in [`docs/deploy.md` §5](../docs/deploy.md#5-wordpress-content-backend-optional-headless).
Environment variables of the `wordpress` service (secret group `wordpress-secrets`; values are yours, generate random
ones with a password manager or `openssl rand -base64 48`):

| Variable | Value |
| --- | --- |
| `WORDPRESS_DB_HOST`, `WORDPRESS_DB_NAME`, `WORDPRESS_DB_USER`, `WORDPRESS_DB_PASSWORD` | from the MySQL addon (`host:port` for the host) |
| `WORDPRESS_AUTH_KEY`, `WORDPRESS_SECURE_AUTH_KEY`, `WORDPRESS_LOGGED_IN_KEY`, `WORDPRESS_NONCE_KEY`, `WORDPRESS_AUTH_SALT`, `WORDPRESS_SECURE_AUTH_SALT`, `WORDPRESS_LOGGED_IN_SALT`, `WORDPRESS_NONCE_SALT` | eight different random strings (fixed, so logins survive a redeploy) |
| `WORDPRESS_CONFIG_EXTRA` | `define('WP_HOME','https://<wordpress address>'); define('WP_SITEURL','https://<wordpress address>'); define('FORCE_SSL_ADMIN', true); define('WP_ENVIRONMENT_TYPE','production');` |
| `NYMBUS_CONTENT_SECRET` | random string, same value as `WP_CONTENT_SECRET` on the website (required in production) |
| `NYMBUS_REVALIDATE_URL` | `https://<website address>/api/cms/revalidate` (or the private `http://website:3000/api/cms/revalidate`) |
| `NYMBUS_REVALIDATE_SECRET` | random string, same value as `WP_REVALIDATE_SECRET` on the website |
| `NYMBUS_PUBLIC_SITE_URL` | optional: the website's address; visitors who open WordPress itself are sent there |
| `NYMBUS_SSO_TENANT_ID`, `NYMBUS_SSO_CLIENT_ID` | Entra app "Nymbus WordPress" → *Overview* (Directory (tenant) ID, Application (client) ID) |
| `NYMBUS_SSO_CLIENT_SECRET` | Entra app → *Certificates & secrets* → new client secret (note its expiry; rotate before) |
| `NYMBUS_EMERGENCY_ADMIN` | the login of the one emergency administrator created at install (the only password sign-in) |
| `NYMBUS_SSO_ALLOWED_DOMAINS` | optional, default `nymbus.ca` |
| `NYMBUS_SSO_DEFAULT_ROLE` | optional, default `editor` (`author`, `contributor`, `subscriber` also accepted; never administrator) |
| `NYMBUS_SSO_LINK_EXISTING_USERS` | optional, `1` = a Microsoft sign-in takes over an existing account with the same e-mail / login (default off) |

**Emergency administrator**: created once at install, with a long random password kept in the company password
manager and an e-mail address that is **not** anyone's Microsoft sign-in (e.g. a shared mailbox), so no SSO account can
collide with it. Use it only when Microsoft sign-in is broken (expired client secret, Entra outage).

### Roles

Use **Editor** for people who maintain the content (they can use the whole *Nymbus* menu and publish) — the default for a
first Microsoft sign-in. Authors can only edit their own news; Contributors can only write drafts. Keep
**Administrator** for the emergency account and, if needed, one person (promote them in *Users* after their first
Microsoft sign-in). Someone who leaves: remove them from the Entra app's *Users and groups* (they can no longer sign
in) and delete or demote their WordPress user.
