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
- A performance-only validation failure (`performance`, `trailing`, `risk`, `risk3Y` keys) holds the performance alone: the previous one is kept (or none), the other parts publish, the run is `blocked` with an alert. Any other blocking issue withholds the fund.
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

### Returns per class and GMV variants (`classes.ts`, `build.ts` `buildClasses`, `validate.ts`, `components/fund/lib/select.ts`)

- **Built on the performance-class design above** (merged with `fix/seb-class` and `fix/perf-hold-only`): the pipeline
  fetches nothing extra for classes. The fund's headline series is whatever `fundSeries` chose with its gates (SEB: class F
  from `class_code=STRATEGY&history=full` when complete and fee-band checked, else class H labelled H; SEST FP, Multistrat F).
  `FundData.performanceByClass` (by FundServ) and `defaultClass` are derived from it: `classSeriesOf(key)` lists the
  classes of the configuration (`classLabels` + `classFundserv`); the headline's class entry is the headline itself; the
  other class that has a checked series (SEB class H next to a class F headline: the track-record candidate, analytics +
  Apex months + same-class factsheet table, cut at the headline's as-of) is built by `buildClassPerformance`; a class
  without one (F not served or failing its gates, Monthly Income F LDM081, the other share classes) is absent and the page
  says "coming soon". A class's figures are never taken from another class.
- A class series must be a contiguous run ending at the headline's as-of month, with plausible months (`performanceProblems`),
  else it is dropped with a warn (`validate.ts` `checkClassesAndVariants` repeats the gates on the published data, dropping
  only that class). A class with < 12 months is published with the periods that exist (`Performance.shortRecord`, no
  annualized figure, no risk statistics) and the page says "since class inception".
- **Hold**: when only the performance fails validation (`validateSite` perf-only hold) the held performance carries every
  class and variant with it (`performanceByClass`, `defaultClass`, the default variant, the other variants from the previous
  publication, or dropped when there is none): never new classes next to an old headline, never the whole fund dropped.
  A change of the headline's class still needs an admin approval (class-change gate).
- **Not available yet** (what is missing): (1) dataplatform PR #626 deployed (until then SEB is class H only, F is "coming soon");
  (2) Monthly Income **F LDM081** has no class series at the dataplatform (`STRATEGY` for SEST is FP): the page opens on
  "coming soon" for F; add the class to `classLabels` / `classFundserv` in `fund-sources.ts` and the dataplatform class
  mapping when it exists; (3) the other classes (A, FP of SEB and Multi-Strategy, USD classes) have no class series, so they
  also show "coming soon". The home page (`components/site/home`, not touched here) still reads the top-level `performance`.
- **GMV variants**: `FundData.variants` ("3" | "6" | "9", default "6") from the factsheet blocks `GMV_3pct`, `GMV_6pct`,
  `GMV_9pct`: returns, risk, characteristics, allocation and holdings per variant; the default variant equals the fund's own
  data. A variant whose block is missing or fails the gates is dropped alone (warn); the page then shows nothing for it.
- **Page**: `FundPage` holds the selected class and variant; `pickData` applies them before `stripHidden`. Class types
  (prospectus / OM) come from the registry (`FundSpec.classes[].type`) and the admin (`FundContent.classTypes`); no type, no label.
- **Rankings** (`FundContent.rankings`, seeded in `src/lib/data/defaults.ts`, merged field-level per fund): third-party
  Fund Library rank / quartile per period, FundGrade and an optional Morningstar rating, edited by hand in the admin with
  an "as at" date; shown in the *Awards and rankings* tab with the source link; `hide.rankings` removes the tab. Wordmarks
  are CSS text: official brand assets may only be dropped in with the owners' permission.

### Awards v2: rankings freshness, official brand assets (`src/lib/rankings/`, `src/lib/data/brand-assets.ts`)

- **What may be shown** (`rankings/policy.ts`, pure): every ranking or rating needs its source name, an https source link,
  an as-of date and its class; missing → not shown. Fund Library (rank / quartile), Morningstar (stars, class, optional
  category and "out of N funds"), and `FundRankings.thirdParty[]` entries for the **RBC Investor Services pooled fund
  survey, eVestment, LSEG Lipper and GMR** (provider, class, optional FundServ, peer group EN/FR, period-end date,
  edition, per-period percentile 1–100 and / or rank out of N, URL, `confirmed`, admin-only `note`). A third-party entry
  is public only when `confirmed` and complete; drafts are admin-only.
- **Staleness**: an entry whose as-of date is older than `SiteContent.rankingPolicy.maxAgeMonths` (admin settings, default
  6, 1–24) is hidden — same rule for every provider. "Re-confirming" = entering the source's newer as-of date. The fund
  page (`strategies/[slug]/page.tsx`) and `/solutions` filter on the server (`publicFundRankings`,
  `advisorRankingItems`): drafts, notes and stale figures never reach the RSC payload; the client only re-checks the shape.
- **RBC survey check** (`rankings/rbc-survey.ts`, `rankings/schedule.ts`, started by `instrumentation.ts`): every 6 h the
  process runs the check when the stored one (`rankings/rbc-survey-check.json` on the volume) is older than
  `RANKINGS_CHECK_DAYS` (7). It reads the public insights listing (`https://www.rbcis.com/en/our-insights.page`, then the
  legacy `rbcits.com` address), parses survey editions from article links, PDF links and titles, and HEAD-probes the
  predictable PDF address (`/assets/rbcits/docs/FINAL_EN_Pooled_Fund_Survey_Q<q>_<yyyy>.pdf`) of the next quarters. A
  quarter newer than a fund's confirmed RBC entry gives a dashboard issue ("New RBC pooled fund survey Qx published —
  update rankings") and one `PIPELINE_ALERT_WEBHOOK` message per edition. **A failed check only logs and shows an issue;
  it never hides or changes data** (hiding is the as-of rule above). `POST /api/admin/rankings/check` runs it on demand.
- **Seeds** (`defaults.ts`): Morningstar 5 stars Class F as of 2026-10-01 for both bond funds (stated by Nymbus); Fund
  Library as at 2026-08-31; RBC entries for both bond funds as **drafts** (1st percentile pre-filled, no URL, no date) —
  the survey PDF could not be read here. A fund whose stored rankings lack `thirdParty` gets the drafts; saving an empty
  list keeps it empty.
- **Morningstar on the overview**: the bond funds' Overview tab shows the rating in the side column
  (`components/fund/Morningstar.tsx`), with class, as-of date, source link, methodology and © attribution
  (`rankings-copy.ts`, compliance row W3). The awards tab shows the same block.
- **Official brand assets** (`brand-assets.ts`): slots `morningstar-logo`, `morningstar-stars-1..5`, `rbc-logo`,
  `evestment-logo`, `lseg-lipper-logo`, `gmr-logo`, `fundlibrary-logo`. A slot is filled by a file shipped in
  `public/brand/third-party/<slot>.svg|png|webp` or uploaded in *Admin → Settings → third-party brand assets*
  (`POST /api/admin/upload/brand`, stored at `brand/files/<slot>.<ext>`, served by `GET /api/brand/<slot>` with its exact
  type, `nosniff`, a sandboxing CSP and an ETag; PNG / WebP / plain SVG only, scripts / handlers / external references
  refused, 512 KB). The upload wins. An empty slot renders **text** (e.g. "Morningstar Rating™: 5 stars") — never an
  imitation graphic; the dashboard and the fund editor warn "official Morningstar assets missing".
- **AdvisorRankings** (`components/site/AdvisorRankings.tsx`): compact list per fund across providers; reads items from
  `AdvisorRankingsProvider` (set by `/solutions/page.tsx`) or an `items` prop; renders nothing when empty. Placed in the
  advisors section of `/solutions`.

## Conventions

- All returns/weights/yields are decimal fractions in data; formatting happens in the UI only.
- `src/lib/data/types.ts`, `src/config/funds.ts`, `src/lib/data/store.ts` and everything under
  `src/lib/pipeline/` and `src/lib/auth/policy.ts` are dependency-free and use relative imports with
  explicit `.ts` extensions, so the unit tests run with plain Node (`npm test`, `node:test`).
- The repository is **public**: no real fund data, credentials, hostnames of internal services or
  unitholder information are committed. Fixtures and the sample dataset are synthetic.
- Sample data (`mode: "sample"`) is never shown in production unless `SHOW_SAMPLE_DATA=1`.

## Headless WordPress (editor backend, optional)

Non-technical editors change the **news**, the **team** and a few **texts** (EN/FR) in WordPress; the website stays
this Next.js application and keeps the live fund pipeline. WordPress is only the editor: it never renders a public
page and never carries fund data. Plugin, editor guide and Northflank steps: [`wordpress/README.md`](../wordpress/README.md).

```
 editors ─▶ WordPress (own Northflank service + MySQL addon + uploads volume)
              │  GET /wp-json/nymbus/v1/site-content   {schemaVersion:1, news[], team[], texts{}}
              │  (published, non-hidden, whitelisted, plain text; optional X-Nymbus-Content-Secret)
              ▼
 website server  src/lib/cms/  fetch (4 s timeout, no redirects, 2 MB cap) → validate + sanitise (plain text, https only)
              │                → memory (reuse `CMS_REVALIDATE_SECONDS`, default 60 s, stale-while-revalidate)
              │                → /data/cms/last-good.json (atomic; used when WordPress is down)
              ▼
 getTeam() · getNews() · getSiteTexts() · getPublicContent()  →  team page, approach stats, /news, /news/<id>,
                                                                 home teaser (3 items), banner, AUM label
 WordPress save ─▶ POST /api/cms/revalidate (Bearer WP_REVALIDATE_SECRET) ─▶ refetch now
```

- **Optional**: without `WP_BASE_URL` (unset, empty, invalid) nothing changes: the pages read the static team
  (`src/data/team.ts`), the static news (`src/components/site/home/news.ts`) and the admin content, exactly as before.
- **Fallback chain** for team and news: live document → memory → last good copy on the volume → static sources. An
  **empty** list from WordPress also falls back to the static one (a fresh WordPress never blanks the site). A document
  that fails validation (wrong `schemaVersion`, not JSON, wrong type, too large) is a failed fetch: it never replaces a
  good one; a failed refresh is not retried for 30 s. Single bad items (bad date, unknown department, duplicate id) are
  dropped and logged; the rest is used.
- **Editable texts and precedence** (one source of truth per text): the AUM label and the announcement banner are
  wired. A value **saved in the website admin** (`content/site-content.json`, not the defaults) always wins; else the
  WordPress text; else the built-in default. The overlay (`getPublicContent()`, `src/lib/cms/map.ts overlayTexts`) is
  used by the public layout and home page only: the admin UI keeps reading the raw admin content, so a WordPress text is
  never saved back as an admin value. To switch a WordPress banner off, clear it in WordPress (the admin "off" means
  "not set here"). Home headline / sub-headline / contact texts are exposed by `getSiteTexts()` but not wired (the pages
  keep their reviewed copy).
- **Security**: every string is reduced to plain text (entities decoded once, tags stripped, control / bidi characters
  removed, capped); links must be `https` without credentials; images (`photo`, news `image`) are accepted only on
  the configured media origin (`WP_MEDIA_ORIGIN`, default the origin of `WP_BASE_URL` when it is public https or
  loopback), which is added to the CSP `img-src` (`src/lib/auth/csp.ts`, re-validated there) — nothing else in the
  CSP changes. The endpoint is built from the configured base only (no URL from data), redirects are refused, the
  content secret is sent only to that endpoint and never logged. `POST /api/cms/revalidate` is 404 when the CMS is
  off, 503 without a secret, 401 on a wrong one (constant-time compare, failure limiter), no cookies involved.
  `http` is accepted for `WP_BASE_URL` only for localhost or a single-label private-network host (`http://wordpress`).
- **Code map**: `types.ts` (document), `sanitize.ts`, `validate.ts` (whitelisting parser), `config.ts` (env),
  `client.ts` (fetch), `source.ts` (cache, last good, backoff, revalidate), `map.ts` (to page shapes, precedence),
  `index.ts` (public API, server only). Tests: `tests/unit/cms/*`, `e2e/cms.spec.ts` (mock WordPress
  `e2e/mock-wp.mjs`, fixture `e2e/fixtures/wp-site-content.json`), `wordpress/tests/normalize-test.php`.
- The fund pages still read their managers from `src/data/team.ts` (`resolveManagers`); the CMS team feeds the team page,
  the approach page figures and the home page head-count.

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
| `PIPELINE_ALERT_WEBHOOK` | optional Teams/Slack incoming webhook for failed or blocked runs (also: a new RBC pooled fund survey edition, once per edition) |
| `RANKINGS_CHECK` | `off` disables the weekly RBC pooled fund survey check (e2e sets it) |
| `RANKINGS_CHECK_DAYS` | days between two survey checks (default 7, 1–60) |
| `SHOW_SAMPLE_DATA` | `1` to allow the synthetic sample in production (demo environments only) |
| `WP_BASE_URL` | optional: base URL of the WordPress content backend (`https://…`; `http` only for localhost or a single-label private host). Unset = CMS off, static content |
| `WP_CONTENT_SECRET` | optional shared secret sent as `X-Nymbus-Content-Secret` (same value as `NYMBUS_CONTENT_SECRET` in WordPress) |
| `CMS_MAX_STALE_HOURS` | optional (default 72, 1 to 720): after this long without a successful fetch the CMS content is not used (static sources) |
| `WP_REVALIDATE_SECRET` | shared secret that authorises `POST /api/cms/revalidate` (same value as `NYMBUS_REVALIDATE_SECRET` in WordPress); without it the route answers 503 |
| `WP_MEDIA_ORIGIN` | optional public origin of WordPress images (default: origin of `WP_BASE_URL` when it is public https / loopback); added to the CSP `img-src` |
| `CMS_REVALIDATE_SECONDS` | optional, reuse time of the fetched content (default 60, 5–3600) |
