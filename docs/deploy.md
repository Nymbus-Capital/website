# Deploying on Northflank

The site replaces the old GitHub Pages static export: it needs a Node server to read fresh data at
request time, run the pipeline next to the dataplatform, and serve the admin.

## 1. Create everything (automated)

`deploy/northflank/provision.mjs` creates, in the Northflank project where the dataplatform runs
(`etl`), everything the site needs. It only creates what is missing and never changes or deletes
existing resources:

| Resource | What |
| --- | --- |
| Service `website` (combined) | builds this repository's `Dockerfile` from `main` on every push; port 3000 public (Northflank `*.code.run` address with TLS); health checks on `/api/health`; one instance |
| Volume `website-data` | 4 GB SSD at `/data`: published data, run snapshots, content, documents, audit log |
| Secret group `website-secrets` | restricted to `website`; `AUTH_SECRET` generated, `PUBLIC_URL` and `DATAPLATFORM_URL` (`http://dataplatform-staging:8000`, private) filled, empty slots for your credentials |

Steps:

1. Merge the pull request (GitHub only offers the workflow once it is on `main`).
2. Northflank → Team → **API roles** → new role limited to project `etl` with: Services (create, read,
   update scale, health checks), Volumes (create, read), Secret groups (create, read — not "read
   values"). Then Team → API → **Create token** with that role.
3. GitHub → this repository → Settings → **Environments** → `production`: add yourself as required
   reviewer, deployment branches = `main` only, and add the environment secret `NORTHFLANK_API_TOKEN`.
   (An environment secret is readable only by jobs of that environment, after your approval.)
4. Northflank → Team → Integrations → GitHub: check the Northflank GitHub app can see
   `Nymbus-Capital/website` (it is public, but the app may be limited to selected repositories).
5. GitHub → Actions → **Provision Northflank** → Run workflow with **apply** unticked (dry run) and
   approve it: the run summary lists what would be created. The script **stops** if a secret group in
   `etl` is not restricted to specific services, because Northflank would also inject it into this
   public website — restrict those groups to their services first.
6. Run it again with **apply** ticked. The service is created stopped, then the volume and the secret
   group, then it is scaled to one instance; it starts when its first build finishes (~5 min).
7. Northflank → `etl` → Secret groups → `website-secrets`: paste the credentials (table below), then
   **restart** the `website` service. Enable daily backups on the `website-data` volume.
8. Revoke the API token (or keep it only in the protected environment for future re-runs).

Re-running is safe: existing resources are left as they are, and the run fails loudly if the volume is
not attached to the service or the secret group is not restricted to it.

Keep **one instance**: the file store and the in-process scheduler assume a single replica. The
dataplatform service and its port settings are not modified; the site reads it over the project's
private network, like the IMS frontend.

## 2. Credentials to paste

| Variable | Where it comes from |
| --- | --- |
| `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` | a new Entra app registration for the website admin (`docs/admin.md`); redirect URI `<PUBLIC_URL>/api/auth/callback` |
| `ADMIN_REQUIRED_ROLE` | optional app role (e.g. `Admin.Web`) assigned to the people allowed in the admin |
| `GRAPH_TENANT_ID`, `GRAPH_CLIENT_ID`, `GRAPH_CLIENT_SECRET`, `GRAPH_DRIVE_ID` | the app-only registration the deck studio already uses (`Sites.Selected` read on the Data site) — same values as the `nymbus-decks` service |
| `GITHUB_TOKEN` | fine-grained token, contents:read on `Nymbus-Capital/analytics` only |
| `PIPELINE_ALERT_WEBHOOK` | optional Teams incoming webhook for blocked/failed runs |

`AUTH_SECRET` is optional: without it the server generates one on first start and keeps it on the
volume (`/data/secrets/auth-secret`). Already filled: `PUBLIC_URL`, `DATAPLATFORM_URL`, `ADMIN_ALLOWED_DOMAINS=nymbus.ca`,
`PIPELINE_SCHEDULE`, `FICHES_BASE_PATH`. Never set `SHOW_SAMPLE_DATA` or
`AUTH_INSECURE_COOKIES_FOR_LOCALHOST` in production.

Until the credentials are in, the site runs: public pages work, fund figures show "coming soon",
and `/admin` answers "not configured".

## Custom domain (later)

When the new site is approved: Northflank → `website` → Ports → add `www.nymbus.ca` (and the apex
domain), create the DNS records Northflank shows, then change `PUBLIC_URL` to `https://www.nymbus.ca`
and the Entra redirect URI accordingly. The old GitHub Pages site
(`nymbus-capital.github.io/website`) is no longer updated by this repository; disable Pages in the
repository settings once the new address is live.

## 3. First run

1. Once the credentials are in, open `<PUBLIC_URL>/admin` and sign in with your @nymbus.ca account.
2. Publish mode starts as **review**: every run waits for your approval in the admin.
3. Dashboard → **run now** (dry run first). Check every issue, compare the figures with the latest
   factsheet, then run for real and **approve & publish**.
4. Upload the fund documents (fund facts, prospectus, MRFP, factsheets) and fill fees / MER / minimums
   per fund. Until data is published, fund pages show "figures coming soon" (the sample is never shown).
5. Switch back to **auto** once a few scheduled runs have been reviewed.

## 4. Operations

- Schedule: 06:45, 12:45, 18:45 America/Toronto (NAVs final the next morning, factsheets early month).
- A run that blocks a fund keeps its last validated figures and posts an alert.
- Roll back: Runs → pick a published run → publish. Freeze one fund: Funds → pin to a run.
- CLI inside the container, as the app user (a shell opens as root): `runuser -u nymbus -- npm run pipeline -- status | run --dry-run | publish <id>`. Files a root shell leaves on `/data` are re-owned at the next start (`docker/start.mjs`).
- Backups: enable the daily backup schedule on the `website-data` volume (Northflank → Volumes).

## 5. WordPress content backend (optional, headless)

Lets non-technical editors change the news, the team, the contact details and a few page intros (EN/FR); the website
keeps running without it. **Not created yet — done by hand in the Northflank UI and the Entra portal** (the
provisioning script does not cover it). Variable names, security model, updating and the editor guide:
[`wordpress/README.md`](../wordpress/README.md); how the website uses it: [architecture.md](architecture.md)
("Headless WordPress"). The image is built and smoke-tested by CI (`wordpress/tests/docker-smoke.sh`).

**Gabriel** (credentials, billing, Entra, people):

1. **MySQL addon** in the same project (smallest plan, TLS on, **backups on**, daily). Keep its connection values.
2. **Volume** `wordpress-uploads` (SSD, a few GB) for `/var/www/html/wp-content/uploads`, with a backup schedule
   (the editors' pictures exist nowhere else).
3. **Entra app registration "Nymbus WordPress"** (*App registrations → New registration*): single tenant; platform
   **Web**, redirect URI `https://<wordpress address>/wp-admin/admin-ajax.php?action=openid-connect-authorize`; no
   implicit / hybrid flow. *Token configuration → optional claims (ID token)*: `email`, `acct` (members only; guests
   are refused either way). *Certificates & secrets* → new client secret (note the expiry, set a reminder to rotate).
   *Enterprise applications → Nymbus WordPress → Properties → **Assignment required = Yes***, then *Users and groups* →
   assign the editors (a group is easiest). If the first sign-in asks for consent and users cannot give it: *API
   permissions → Grant admin consent*.
4. **Secret group** `wordpress-secrets`, restricted to the `wordpress` service (runtime): the variables of the table in
   `wordpress/README.md` → *Deploying on Northflank*: database (addon), eight keys / salts (random, fixed),
   `WORDPRESS_CONFIG_EXTRA`, `NYMBUS_CONTENT_SECRET`, `NYMBUS_REVALIDATE_URL`, `NYMBUS_REVALIDATE_SECRET`,
   `NYMBUS_SSO_TENANT_ID`, `NYMBUS_SSO_CLIENT_ID`, `NYMBUS_SSO_CLIENT_SECRET`, `NYMBUS_EMERGENCY_ADMIN` (the login you
   will create in step 6, e.g. `nymbus-emergency`).
5. **Service** `wordpress` (combined, this repository, branch `main`): Dockerfile `wordpress/Dockerfile`, build context
   `wordpress`, **one instance** (single-attach volume; never scale up), the volume of step 2 mounted, port 80 HTTP
   public (a `*.code.run` address first, `cms.<domain>` later — then update the Entra redirect URI and `WP_HOME`),
   health check `GET /wp-login.php`.
6. Open `https://<wordpress address>/wp-admin/install.php` once: site title, the **emergency administrator** (login =
   `NYMBUS_EMERGENCY_ADMIN`, long random password in the password manager, a shared-mailbox e-mail that is nobody's
   Microsoft sign-in). Then *Settings → Permalinks → Post name → Save*. The bundled plugins activate themselves on this
   first admin visit (Nymbus Site Content, Limit Login Attempts Reloaded, OpenID Connect Generic Client).
7. **Editors' roles**: each editor signs in once with *Sign in with Microsoft* (they get the **Editor** role). Promote
   nobody to Administrator unless needed. Check that an editor's password sign-in is refused and that the emergency
   account still works.
8. **Connect the website**: add to `website-secrets`: `WP_BASE_URL` (the WordPress address, no trailing slash),
   `WP_CONTENT_SECRET` (= `NYMBUS_CONTENT_SECRET`), `WP_REVALIDATE_SECRET` (= `NYMBUS_REVALIDATE_SECRET`),
   `WP_MEDIA_ORIGIN` (the same origin, so pictures load); redeploy the website — **after** Claude's import (step B), so
   the site switches straight from the built-in team and news to the same content in WordPress.

**Claude** (with Gabriel's go-ahead; nothing secret involved):

- A. Check the service: `/wp-login.php` shows *Sign in with Microsoft*, `/wp-content/uploads/x.php` is refused,
  `/wp-json/nymbus/v1/site-content` answers 401 without the secret and a JSON document with it:
  `curl -s -H "X-Nymbus-Content-Secret: $SECRET" https://<wordpress address>/wp-json/nymbus/v1/site-content | head -c 300`.
- B. **Import the current team and news** (photos downloaded from the running website):
  `node --experimental-strip-types wordpress/scripts/import-from-site.mjs --site-url https://<website address> --out nymbus-import.json`,
  bring it to the `wordpress` service (Northflank shell: `cat > /tmp/nymbus-import.json`, paste, Ctrl-D — or pass an
  https URL, or `-` to read standard input), then
  `wp nymbus import /tmp/nymbus-import.json --dry-run` (lists *create* / *skip*, changes nothing) and
  `wp nymbus import /tmp/nymbus-import.json --photos`. Existing items (same slug) are never overwritten unless `--update`
  is given; nothing is deleted. Years of experience and the short summaries are not WordPress fields: with the CMS on,
  the team band hides the experience counter (see HANDOFF).
- C. After step 8: `/news` and `/team` show the WordPress items, an edit appears within a minute, and with the
  `wordpress` service stopped the pages still render (last good copy).

Never go live with the "[Sample]" items of the local set-up (`wp nymbus clear-samples`). Backups: addon schedule +
uploads volume schedule. Updates: rebuild the image (README → *Updating WordPress*); nothing updates itself.
