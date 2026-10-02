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

Lets non-technical editors change the news, the team and a few texts (EN/FR); the website keeps running without it.
**Not created yet — done by hand in the Northflank UI** (the provisioning script does not cover it). Full details,
variable names and the editor guide: [`wordpress/README.md`](../wordpress/README.md); how the website uses it:
[architecture.md](architecture.md) ("Headless WordPress").

1. **Addon**: MySQL (smallest plan, TLS, backups on) in the same project.
2. **Volume** `wordpress-uploads` (SSD, a few GB), mounted at `/var/www/html/wp-content/uploads` on the service.
3. **Secret group** `wordpress-secrets` restricted to the `wordpress` service: `WORDPRESS_DB_HOST`, `WORDPRESS_DB_NAME`,
   `WORDPRESS_DB_USER`, `WORDPRESS_DB_PASSWORD` (from the addon), the eight `WORDPRESS_*_KEY` / `*_SALT` variables
   (random, fixed), `WORDPRESS_CONFIG_EXTRA` (`WP_HOME`, `WP_SITEURL`, `FORCE_SSL_ADMIN`), `NYMBUS_CONTENT_SECRET`,
   `NYMBUS_REVALIDATE_URL`, `NYMBUS_REVALIDATE_SECRET`, optional `NYMBUS_PUBLIC_SITE_URL`.
4. **Service** `wordpress` (combined, this repository, branch `main`): Dockerfile `wordpress/Dockerfile`, build context
   `wordpress`, **one instance**, port 80 HTTP public, health check `GET /wp-login.php`.
5. Open `/wp-admin/install.php`, create the emergency administrator, activate **Nymbus Site Content**, Settings →
   Permalinks → *Post name*. Create editors with the **Editor** role. Microsoft sign-in (SSO plugin + Entra app
   registration) is a TODO for Gabriel, see the README.
6. **Connect the website**: add to `website-secrets`: `WP_BASE_URL`, `WP_CONTENT_SECRET` (= `NYMBUS_CONTENT_SECRET`),
   `WP_REVALIDATE_SECRET` (= `NYMBUS_REVALIDATE_SECRET`), `WP_MEDIA_ORIGIN`; redeploy the website. Check `/news` shows the
   WordPress items; stop the WordPress service and check the pages still render (last good copy).
7. Never go live with the "[Sample]" items of the local set-up. Backups: addon schedule + the uploads volume.
