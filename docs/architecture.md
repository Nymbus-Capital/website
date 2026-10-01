# Nymbus website — architecture

## Overview

```
             ┌────────────── Northflank project (private network) ──────────────┐
             │                                                                  │
 dataplatform│  /api/performance/monthly-net-returns   ┐                        │
 (no auth,   │  /api/performance/nav-timeseries        │   pipeline (in-process │
 IP policy)  │  /api/apex/funds  /api/unitholders/aum  ├──▶ scheduler, daily)   │
             │  /api/ftse/index-summary                │        │               │
             │  /api/apex/fund-portfolio               │        │               │
             │  /api/performance/distributions         ┘        │               │
             │                                                  ▼               │
 SharePoint  │  Fiches d'infos/_data/bonds_data_YYYY-MM.json ─▶ build → validate│
 (Graph,     │  Fiches d'infos/_data/factsheet_data_YYYY-MM.json   → snapshot   │
 app-only)   │                                                     → publish    │
             │                                                  │               │
             │      /data volume: published/site-data.json ◀────┘               │
             │                    content/site-content.json ◀── admin (Entra ID) │
             │                    documents/                ◀── admin uploads    │
             │                                                  │               │
             │      Next.js server (standalone) ────────────────┴──▶ public site│
             └──────────────────────────────────────────────────────────────────┘
```

One container (Next.js standalone, Node 22) serves the public site and the admin, and runs the data
pipeline on a schedule. The dataplatform API has no machine authentication and is only reachable from
inside the Northflank private network / IP allow-list, so the pipeline has to run there: the public site
never calls the dataplatform from the browser.

## Data flow

1. **Fetch** (`src/lib/pipeline/sources/*`): analytics `fund_returns.json` (monthly history before the Apex
   cut-over), dataplatform (monthly net returns — only `status: ready`
   months —, NAV per class, AUM per fund, FTSE benchmark levels, fund/class register, daily portfolio book and
   per-class distributions) and the monthly factsheet archives on SharePoint (characteristics,
   credit/sector/curve breakdowns, top holdings, ESG metrics, published trailing returns used as a cross-check).
   The two fund-data endpoints follow the contract agreed with the dataplatform (2026-09-30); their payloads are
   parsed tolerantly in `sources/contracts.ts` (a bad row is dropped and noted, a missing number stays null).
2. **Build** (`src/lib/pipeline/build.ts`, pure): computes trailing / calendar / growth / risk figures
   from the monthly net returns (same conventions as the factsheets and the deck studio), parses the
   factsheet strings into numbers, and produces `SiteData` (`src/lib/data/types.ts`).
3. **Validate** (`src/lib/pipeline/validate.ts`, pure): gates per fund (as-of regression, outliers,
   factsheet cross-checks, stale NAV …). A fund that fails a blocking gate keeps its previously
   published data; the issue is shown in the admin. The daily portfolio and the distributions have their own,
   never-blocking gates: what is implausible is dropped (warn issue) and the page falls back (see below).
4. **Publish**: every run is stored as `snapshots/<id>/`; validated runs are copied to
   `published/site-data.json` (publish mode `auto`), or wait for approval in the admin (mode `review`).
5. **Render**: pages read the published file at request time (no rebuild), merged with the
   admin-managed content (`content/site-content.json`) and the static fund registry (`src/config/funds.ts`).
   The files are served from an in-memory cache (`src/lib/data/cache.ts`): parsed once, reused until the file
   changes — at once after a publish, rollback or content save in the process (the store bumps a write
   generation), within a second after a write by another process (file identity re-check: inode, size, mtime).
   Values are frozen; concurrent requests share one load. No `Cache-Control` on the HTML: every page carries a
   per-request CSP nonce, so it must not be stored by a shared cache.

## Sources

| Source | Used for | Primary / cross-check | When it is missing |
| --- | --- | --- | --- |
| analytics `fund_returns.json` | monthly net returns before the Apex cut-over | primary (history) | factsheet monthly table (rounded) + alert |
| dataplatform `/api/performance/monthly-net-returns` | monthly net returns, `ready` months (`class_code` = track-record class; SEB also `class_code=STRATEGY&history=full`) | primary | month held / previous kept |
| dataplatform `/api/performance/nav-timeseries`, `/api/apex/funds` | NAV per class, live classes | primary | previous NAV kept + alert |
| dataplatform `/api/unitholders/aum` | fund AUM (totals only) | primary | previous kept + alert |
| dataplatform `/api/ftse/index-summary` | benchmark figures | primary | index figures not shown |
| dataplatform `/api/apex/fund-portfolio` | daily portfolio: characteristics with coverage, breakdowns, top 10, green bonds | primary when covered (below) | month-end factsheet figures (issue) |
| dataplatform `/api/performance/distributions` | distributions per unit per class (FundServ) | primary | policy text only (issue); previous kept on a failure |
| factsheet archives (SharePoint) | characteristics vs index, breakdowns, top 10, ESG, published returns | ESG / GMV primary; portfolio fallback; cross-check | previous kept + alert |

### Daily portfolio: selection, cross-check, gates (`portfolio.ts`, `validate.ts`, config `PORTFOLIO`)

- **Primary** when the book is at most 7 whole calendar days old (one rule, `src/lib/data/freshness.ts`, for the
  selection, the validation gate — also on funds carried over from the previous publication — and a render-time gate
  in `src/lib/data/site.ts`, so a rollback or a pin to an old snapshot never shows a stale book as "daily") and covers
  the bond book: `coverage.priced_weight >= 0.90` and
  `coverage.resolved_weight >= 0.95`. Each characteristic is shown only when its own coverage is `>= 0.90`; below 1 it
  gets a footnote with its coverage. Otherwise the Portfolio tab keeps the month-end factsheet figures (warn issue).
- **404** on either new endpoint = not deployed yet: one info issue per run, the site behaves exactly as before.
  A fetch failure (5xx, network) keeps the previously published daily book (until the 7-day gate) / distributions
  (until 10 days without a successful read: `DistributionsData.checkedAt`, config `DISTRIBUTIONS.maxCarryDays`).
  A payload for another fund than the one requested (`fund` / `short_name`) is a failure.
- **Month-end cross-check** with the factsheet of the same month (book within the last 7 days of that month; the
  pipeline also asks for the month-end book when the latest one is in a later month): modified duration within
  max(0.25 year, 5 %), yield to maturity vs the factsheet "Portfolio Yield" within 0.30 percentage point (the two
  measures may differ: the issue says so), the 3
  largest daily sectors that the factsheet also names (its "Sectors" and "Industry" tables) within 5 points.
  Gaps are warn issues, never blocking.
- **Gates** (drop the part, warn, never the fund): duration 0–30 years, YTM −5 %–25 %, coupon 0–25 %, average maturity
  0–100 years, rating a letter notch, coverage 0–1; every breakdown adds up to 100 % ± 3 % (cash included); top 10
  weights in (0, 25 %] and at most 100 % together; green weight 0–1; nothing plausible left → the whole block.

### Distributions (`distributions.ts`, `validate.ts`, config `DISTRIBUTIONS`)

- Keyed by FundServ code only (never by class letter); only the fund register's active classes are published.
  Currency: the register's and the payload's must agree and one must give it, else the series is dropped (never a
  default currency). "Data as of" is the latest distribution of the series shown.
- Per series: last distribution, trailing 12 months, observed frequency, calendar-year totals and the history
  (computed by the dataplatform). No yield and no distribution type (not in the source): the page says so.
- Gates (drop the series, warn): amounts positive and below 5 % of the series' NAV per unit, trailing 12 months below
  25 % of it, dates ascending and not in the future, the last distribution and every calendar-year total equal to
  the series' own rows. The trailing 12 months must equal the rows dated in the dataplatform's window — after the same
  day one year before the response `end_date` (the day of the read; 29 Feb → 28 Feb), up to and including it; stored
  as `distributions.trailingTo` — else that figure alone is dropped (also when the window end is unknown or the capped
  history does not reach its start). The page labels it "12 months to <trailingTo>", not the last distribution. The page shows every amount of a series with one precision (4–6
  decimals, the fewest at which all are exact), so rows add up to the calendar totals as displayed.

### Performance class (`fund-sources.ts`, `build.ts` `fundSeries`, `perf-class.ts`; Gabriel 2026-10-01)

- The class label shown with returns ("Series F" / « Série F ») is derived from the class of the data actually used
  (`performance.classCode`: dataplatform `STRATEGY` = the fund's F / FP class, `STRATEGY_H` = SEB's H class) through
  `classLabels`, never a business label. Every month carries the class of its source (analytics series and Apex
  months: `trackRecordClass`; factsheet table: `factsheetClass`); a series mixing classes, or of a class without a
  label, is withheld (error + alert). Validation blocks a label that is not its data's class.
- SEB (`preferredClass: STRATEGY`): `/api/performance/monthly-net-returns?class_code=STRATEGY&history=full`
  (dataplatform PR #626). Both candidates are built — class H (analytics + `class_code=STRATEGY_H` Apex months +
  same-class factsheet table) and class F (the full-history answer alone, no analytics month). Class F is used when
  the answer says `class_code: STRATEGY` (and `history: "full"` if it says anything), its first ready month is the
  track-record start and it is ready and continuous through max(class H last month, published as-of); else class H,
  labelled H. A server that predates the parameters answers `STRATEGY_H`: the site shows Series H.
- Gates of class F that withhold the performance (previous publication kept), never switch: payload `class_display`
  / `fundserv` other than F / LDM201 or the fund register naming another class for LDM201; F − H outside the fee
  band on any common month (`CLASS_SPREAD`: −5 to +30 bp and within ±5 bp of the median).
- No flip-flop: once class F is published, a failed / unconfirmed / incomplete class F answer keeps the class F
  publication (carried, alert); class H comes back only through configuration and an approved run.
- A class change (H ↔ F, relative to the published performance) blocks in validation: auto mode publishes the run
  with that fund at its previous publication (`ValidationOutcome.autoData`), the stored run holds the change, and
  publishing the run (admin "approve class change & publish") approves it (`RunReport.classChanges`). Such a run
  cannot be pinned before approval.
- Factsheet class by archive month (`factsheetClass`, `factsheetClassAt`): SEB archives up to 2026-07 publish class
  F, later ones class H. A series is compared with (and, for class H, filled from) archives of its own class only;
  other archives' fund trailing / value added / statistics are skipped with an info issue (the factsheet of a new
  month is still required). In class H mode a missing class H monthly table is an error + alert.
- Publications made before `classCode` existed were all built from the track-record class: when carried over, kept
  by validation, rolled back or pinned they are relabelled by it (`fundWithClassLabel`, also at render in `site.ts`).
- The NAV card is independent: its series is the fund register's class of the FundServ code shown.

## Conventions

- All returns/weights/yields are decimal fractions in data; formatting happens in the UI only.
- `src/lib/data/types.ts`, `src/config/funds.ts`, `src/lib/data/store.ts` and everything under
  `src/lib/pipeline/` and `src/lib/auth/policy.ts` are dependency-free and use relative imports with
  explicit `.ts` extensions, so the unit tests run with plain Node (`npm test`, `node:test`).
- The repository is **public**: no real fund data, credentials, hostnames of internal services or
  unitholder information are committed. Fixtures and the sample dataset are synthetic.
- Sample data (`mode: "sample"`) is never shown in production unless `SHOW_SAMPLE_DATA=1`.

## Admin

`/admin` (pages) and `/api/admin/*` (JSON API) require a Microsoft Entra ID sign-in on the Nymbus tenant
with an account in an allowed domain (`nymbus.ca`). Checks are done server-side on every request
(`src/proxy.ts` + route handlers): signed session cookie, tenant id, domain, optional group allow-list.
Setup of the Entra app registration and the security model: [docs/admin.md](admin.md).

## Environment

| Variable | Purpose |
| --- | --- |
| `SITE_DATA_DIR` | persistent volume (default `./var`) |
| `PUBLIC_URL` | public origin, used for the OIDC redirect URI (`<PUBLIC_URL>/api/auth/callback`) |
| `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` | Entra ID app registration (single tenant) |
| `AUTH_SECRET` | ≥ 32 random characters (e.g. `openssl rand -base64 48`), signs the admin session; the committed e2e value is refused — optional: when unset, generated once and kept on the volume (`secrets/auth-secret`) |
| `ADMIN_ALLOWED_DOMAINS` | comma separated, default `nymbus.ca`; matched exactly on `preferred_username` / `upn` |
| `ADMIN_ALLOWED_GROUP_IDS` | optional: only members of these Entra groups (needs the `groups` claim) |
| `ADMIN_REQUIRED_ROLE` | optional: app role value that must be in the `roles` claim (e.g. `Admin.Web`) |
| `AUTH_INSECURE_COOKIES_FOR_LOCALHOST` | `1` only for the local e2e server (`PUBLIC_URL` on localhost): non-Secure cookies |
| `DATAPLATFORM_URL` | internal dataplatform base URL |
| `DATAPLATFORM_USERNAME`, `DATAPLATFORM_PASSWORD` / `DATAPLATFORM_TOKEN` | optional, if the API gets auth |
| `GRAPH_TENANT_ID`, `GRAPH_CLIENT_ID`, `GRAPH_CLIENT_SECRET`, `GRAPH_DRIVE_ID` | factsheet archives (app-only, `Sites.Selected` read) |
| `FICHES_BASE_PATH` | default `Business Development/Fiches d'infos` |
| `FACTSHEET_DATA_DIR` | optional local folder of factsheet archives (overrides Graph) |
| `FTSE_INDEX_SEST` | FTSE short name of the Monthly Income benchmark (default `short_corp`; SEB uses `univ`). Every index figure is computed from the dataplatform FTSE levels; the factsheet's published index figures are a cross-check only |
| `GITHUB_TOKEN` | contents:read on the analytics repo: pre-Apex monthly history (`fund_returns.json`) |
| `ANALYTICS_REPO`, `ANALYTICS_BRANCH`, `ANALYTICS_RETURNS_PATH` | defaults `Nymbus-Capital/analytics`, `main`, `fund-analytics-app/backend/data/fund_returns.json` |
| `ANALYTICS_RETURNS_FILE` | optional local copy of `fund_returns.json` (overrides GitHub) |
| `PIPELINE_REQUIRE_FACTSHEET_FOR_NEW_MONTH` | default `1`: a new performance month goes live only once its factsheet exists and cross-checks |
| `PIPELINE_SCHEDULE` | `HH:MM,HH:MM` America/Toronto, or `off` (default `06:45,12:45,18:45`) |
| `PIPELINE_ALERT_WEBHOOK` | optional Teams/Slack incoming webhook for failed or blocked runs |
| `SHOW_SAMPLE_DATA` | `1` to allow the synthetic sample in production (demo environments only) |
