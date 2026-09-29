# Deploying on Northflank

The site replaces the old GitHub Pages static export: it needs a Node server to read fresh data at
request time, run the pipeline next to the dataplatform, and serve the admin.

## 1. Service

1. **New service → Combined (build + deploy)** in the same Northflank project as the dataplatform
   (the dataplatform API is only reachable from its private network / IP policy).
2. Source: `Nymbus-Capital/website`, branch `main`, **Dockerfile** build (`/Dockerfile`).
3. Port **3000**, HTTP, public. Health check: `GET /api/health`.
4. **Volume**: 5 GB mounted at `/data` (published data, snapshots, content, documents, audit log).
   Keep **one instance**: the file store and the in-process scheduler assume a single replica.
5. Custom domain (e.g. `www.nymbus.ca`) with TLS; set `PUBLIC_URL` to exactly that origin.

## 2. Secrets (secret group)

| Variable | Value |
| --- | --- |
| `PUBLIC_URL` | `https://www.nymbus.ca` |
| `AUTH_SECRET` | `openssl rand -base64 48` |
| `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` | website admin app registration (see `docs/admin.md`) |
| `DATAPLATFORM_URL` | internal URL of the dataplatform service (private endpoint) |
| `GITHUB_TOKEN` | fine-grained token, contents:read on `Nymbus-Capital/analytics` only |
| `GRAPH_TENANT_ID`, `GRAPH_CLIENT_ID`, `GRAPH_CLIENT_SECRET`, `GRAPH_DRIVE_ID` | the same app-only registration the deck studio uses (`Sites.Selected` read on the Data site) |
| `PIPELINE_ALERT_WEBHOOK` | optional Teams incoming webhook |

Optional: `ADMIN_REQUIRED_ROLE`, `ADMIN_ALLOWED_GROUP_IDS`, `PIPELINE_SCHEDULE`, `FTSE_INDEX_SEST`.
Never set `SHOW_SAMPLE_DATA` or `AUTH_INSECURE_COOKIES_FOR_LOCALHOST` in production.

## 3. First run

1. Deploy; open `/admin`, sign in with your @nymbus.ca account.
2. Settings → publish mode **review** for the first days.
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
