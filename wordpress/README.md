# Nymbus website content (WordPress)

WordPress is **only the editing tool** for the Nymbus website. The website itself is the Next.js application in this
repository; it reads what you write here (news, team, a few texts, in English and French) and shows it. The live fund
figures never come from WordPress.

This folder contains:

| Path | What |
| --- | --- |
| `plugins/nymbus-site-content/` | the plugin: News, Team, Site texts and the read-only content endpoint |
| `mu-plugins/nymbus-headless.php` | always-on hardening (no public WordPress front end, no XML-RPC, no file editor) |
| `Dockerfile` | the production image (WordPress + the two plugins) |
| `docker-compose.yml`, `.env.example`, `scripts/setup.sh` | a local copy for trying things |
| `tests/normalize-test.php` | plain-PHP tests (`php wordpress/tests/normalize-test.php`) |

---

## For editors: changing the website

Sign in at the address you were given (`/wp-login.php`). In the left menu choose **Nymbus**. Everything on the
website that you can change is under it:

| Menu | What you change |
| --- | --- |
| **Nymbus → News** | the news items (home page shows the 3 latest; the News page shows all) |
| **Nymbus → Team** | the people on the team and board |
| **Nymbus → Site texts** | the assets-under-management label, the announcement banner, the home headline, contact details |

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
(tick *Show the announcement banner*), a home headline and contact details. A field you leave empty keeps the
website's built-in text. If the same text was also saved in the website's own admin (`/admin`), **that value wins**:
the website admin takes precedence over WordPress for the assets label and the banner.

### Good to know

- Text is **plain text**: formatting (bold, links inside the text) is not used and is removed. Use empty lines for paragraphs.
- Use pictures of a reasonable size (a few hundred KB; about 1600 px wide for news, a square or portrait photo for people).
- If something does not appear after a few minutes, check it is **Published** (not Draft or Pending), that *Hide from the website* is not ticked, and that the English title / name is filled in.
- Never put confidential information here: everything published is public.

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

### Deploying on Northflank

WordPress runs as its own service next to the website, in the same project. **Nothing here has been created yet**:
these are the steps for Gabriel (also in `docs/deploy.md`).

1. **MySQL addon** (Northflank → Addons → MySQL, smallest plan, TLS on, backups on). Keep its connection values for step 3.
2. **Volume** `wordpress-uploads` (a few GB, SSD), mounted on the service at `/var/www/html/wp-content/uploads`.
3. **Secret group** `wordpress-secrets`, restricted to the `wordpress` service (runtime). Variable names (values are
   yours; generate the keys/salts with a password manager or `openssl rand -base64 48`):

   | Variable | Value |
   | --- | --- |
   | `WORDPRESS_DB_HOST`, `WORDPRESS_DB_NAME`, `WORDPRESS_DB_USER`, `WORDPRESS_DB_PASSWORD` | from the MySQL addon (`host:port` for the host) |
   | `WORDPRESS_AUTH_KEY`, `WORDPRESS_SECURE_AUTH_KEY`, `WORDPRESS_LOGGED_IN_KEY`, `WORDPRESS_NONCE_KEY`, `WORDPRESS_AUTH_SALT`, `WORDPRESS_SECURE_AUTH_SALT`, `WORDPRESS_LOGGED_IN_SALT`, `WORDPRESS_NONCE_SALT` | eight different random strings (fixed, so logins survive a redeploy) |
   | `WORDPRESS_CONFIG_EXTRA` | PHP lines, e.g. `define('WP_HOME','https://<wordpress public address>'); define('WP_SITEURL','https://<wordpress public address>'); define('FORCE_SSL_ADMIN', true); define('WP_ENVIRONMENT_TYPE','production');` |
   | `NYMBUS_CONTENT_SECRET` | random string, same value as `WP_CONTENT_SECRET` on the website (recommended) |
   | `NYMBUS_REVALIDATE_URL` | `https://<website address>/api/cms/revalidate` (or the private `http://website:3000/api/cms/revalidate`) |
   | `NYMBUS_REVALIDATE_SECRET` | random string, same value as `WP_REVALIDATE_SECRET` on the website |
   | `NYMBUS_PUBLIC_SITE_URL` | optional: the website's address; visitors who open WordPress itself are sent there |

4. **Service** `wordpress` (combined service, build from this repository): Dockerfile path `wordpress/Dockerfile`, build
   context `wordpress`, one instance (the volume is single-attach), port 80 HTTP public (a Northflank `*.code.run`
   address first; a `cms.<domain>` name later), health check `GET /wp-login.php`. Never run more than one instance.
5. Open `https://<wordpress address>/wp-admin/install.php` once: site title, an administrator with a strong password
   (kept as the emergency account), then **Plugins → Nymbus Site Content → Activate**, and **Settings → Permalinks →
   *Post name* → Save** (required for the `/wp-json/...` address).
6. Check that `https://<wordpress address>/wp-json/nymbus/v1/site-content` answers `401` without the secret (if you set one)
   and a JSON document with it:
   `curl -s -H "X-Nymbus-Content-Secret: $SECRET" https://<wordpress address>/wp-json/nymbus/v1/site-content | head -c 300`
7. **Connect the website**: in the website's secret group add `WP_BASE_URL` (the WordPress public address, no trailing
   slash), `WP_CONTENT_SECRET`, `WP_REVALIDATE_SECRET`, and `WP_MEDIA_ORIGIN` (the same public origin, so the images load),
   then redeploy it. Without `WP_BASE_URL` the website ignores WordPress completely.
8. **Backups**: addon backups (database) + a schedule on the uploads volume. The editor content is the only copy.
9. **Sign-in with Microsoft (TODO — Gabriel)**: install an OpenID Connect / SAML single-sign-on plugin on WordPress
   (for example "OpenID Connect Generic Client" from wordpress.org, or a maintained Microsoft Entra ID SSO plugin),
   register a second *Web* redirect in the Entra tenant (a new app registration "Nymbus WordPress", single tenant,
   *Assignment required = Yes*, same as the website admin, `docs/admin.md`), map signed-in users to the **Editor**
   role, then disable password login for everyone except the one emergency administrator. Until then, WordPress users
   have local passwords: keep the list short, use strong passwords, give people the **Editor** role (not Administrator).

### Roles

Use **Editor** for people who maintain the content (they can use the whole *Nymbus* menu and publish). Authors can
only edit their own news; Contributors can only write drafts. Keep **Administrator** for one or two people.
