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
| Volume `website-data` | 5 GB at `/data`: published data, run snapshots, content, documents, audit log |
| Secret group `website-secrets` | restricted to `website`; `AUTH_SECRET` generated, `PUBLIC_URL` and `DATAPLATFORM_URL` (`http://dataplatform-staging:8000`, private) filled, empty slots for your credentials |

Steps:

1. Merge the pull request (GitHub only offers the workflow once it is on `main`).
2. Northflank → Team settings → API → **Create token** with read/write access to the `etl` project.
   GitHub → this repository → Settings → Secrets and variables → Actions → new secret
   `NORTHFLANK_API_TOKEN` with that token.
3. GitHub → Actions → **Provision Northflank** → Run workflow, leave **apply** unticked: the summary
   lists what would be created. Run it again with **apply** ticked.
4. Northflank → `etl` → Secret groups → `website-secrets`: paste the credentials (table below), then
   restart the `website` service.

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

Already filled: `PUBLIC_URL`, `AUTH_SECRET`, `DATAPLATFORM_URL`, `ADMIN_ALLOWED_DOMAINS=nymbus.ca`,
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
- CLI inside the container: `npm run pipeline -- status | run --dry-run | publish <id>`.
- Backups: snapshot the `/data` volume (Northflank volume backups, daily).
