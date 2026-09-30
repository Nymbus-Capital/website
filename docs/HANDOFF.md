# Handoff — shared work log between Claude sessions

This file lets any Claude session (Gabriel's home or office machine) pick up exactly where the last
one stopped. **Read it fully before working; update it before you stop.**

- Owner: Gabriel Cefaloni (gcefaloni@nymbus.ca), Nymbus Capital.
- Working branch: `redesign/v3-keynote-live-data` → PR https://github.com/Nymbus-Capital/website/pull/1
- Last updated: 2026-09-29 by the home session (cloud workspace).

## 1. Protocol for two sessions

1. **Start**: `git fetch origin && git switch redesign/v3-keynote-live-data && git pull --rebase`
   (after the PR is merged: work on `main` or a new branch from `main`, and write its name here).
2. Read §3 (state), §4 (decisions — do not reopen them), §5 (open items). Take the first unclaimed
   open item, or what Gabriel asks.
3. **Claim** what you work on: edit §5 (`[in progress — office session, <date>]`), commit
   `handoff: claim …`, push *before* starting, so the other session sees it.
4. Commit and push small, working increments (`npm test` green). Never leave work only on disk: the
   other session only sees what is pushed.
5. **Stop**: update §3 if the state changed, §5 (done / new items), add a dated line to §6, commit
   `handoff: …`, push.
6. Conflicts: always `pull --rebase`; never force-push the shared branch; if both sessions touched
   HANDOFF.md, keep both sets of lines.
7. Both sessions share Claude memory, but **this file is the source of truth** for the project state.

Commit trailers used so far (keep them):
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and a `Claude-Session:` link.

## 2. How to work here

- **User preference**: validate everything with adversarial review — independent sub-agents that did
  not write the code attack it (security, number correctness, design/a11y), then a verifier re-checks
  the fixes — plus automated tests. Do this for every substantial change.
- **Tests**: `npm test` = unit tests with plain Node (`node:test`, no dependencies needed). Pure modules
  (`src/lib/pipeline/**`, `src/lib/data/{types,store}.ts`, `src/config/funds.ts`, `src/lib/auth/policy.ts`,
  `src/content/disclaimers.ts`, `deploy/northflank/provision.mjs`) use relative imports with explicit
  `.ts` extensions and erasable TypeScript only, so they run under Node type stripping.
- **CI** (`.github/workflows/ci.yml`, every push): unit → typecheck → lint (non-blocking) → build →
  Playwright e2e (desktop + Pixel 7; admin tests run after public ones) → Docker build.
  Add `[ci-logs]` to a commit message to have CI push logs + screenshots to a `ci/run-<n>` branch
  (useful from sandboxes that cannot download Actions artifacts:
  `git fetch origin 'refs/heads/ci/*:refs/remotes/origin/ci/*'` then `git show origin/ci/run-<n>:ci-out/e2e.log`).
  Those branches can be deleted any time.
- **Environment differences**: the cloud workspace (home session) cannot reach the npm registry,
  Northflank, the dataplatform or SharePoint — it relies on CI. A local office machine can
  `npm install`, `npm run dev`, `npm run build`, `npm run e2e` directly (Node ≥ 22.12). Neither
  session can reach the dataplatform unless it runs inside the Northflank project.
- **Sample data**: `npm run pipeline -- sample` regenerates `src/lib/data/sample-site-data.json` from the
  synthetic fixtures in `tests/fixtures/pipeline/`. Never commit real numbers (public repo).
- Related repos (read-only references): `Nymbus-Capital/nymbus-decks` (v3 keynote design in
  `src/v3/`, deck data engine `server/`), `Nymbus-Capital/nymbus-dataplatform` (API:
  `docs/api/openapi.json`; its CLAUDE.md governs that repo), `Nymbus-Capital/factsheet-generator`
  (monthly factsheet archives format).

## 3. Current state (2026-09-29)

Everything below is on the PR branch, CI green (183 unit tests, 119 e2e, Docker build).
Not yet run against live data, not deployed.

| Area | Where | State |
| --- | --- | --- |
| Design system (v3 keynote) | `src/app/globals.css`, `src/components/v3/motion.tsx` | done, reviewed twice (design/a11y) |
| Public pages | `src/app/(site)/**`, `src/components/site/**` | home keynote (bond-universe canvas, overlay story), strategies, approach, sustainability, team, contact (mailto only, no email backend), solutions, legal, privacy, 404 |
| Fund pages | `src/app/(site)/strategies/[slug]`, `src/components/fund/**` | 4 funds: monthly-income, sustainable-enhanced-bonds, multi-strategy, global-minimum-volatility (gross, managed accounts) |
| Data pipeline | `src/lib/pipeline/**`, scheduler `src/instrumentation.ts` | analytics history + dataplatform (ready months, NAV, AUM, FTSE) + factsheet archives; gates, snapshots, review/auto publish, rollback, pins, alerts |
| Admin | `src/app/admin/**`, `src/app/api/admin/**`, `src/lib/auth/**`, `src/proxy.ts` | Entra OIDC (tenant, member-only `acct`, @nymbus.ca sign-in name, optional role), sessions 4 h revocable, nonce CSP, documents, content, runs, compliance banner, audit |
| Disclaimers | `src/content/disclaimers.ts`, `docs/compliance-review.md` | boilerplate EN/FR, **needs compliance review** (banner in admin until marked reviewed) |
| Deployment | `Dockerfile`, `deploy/northflank/provision.mjs`, `.github/workflows/northflank-provision.yml`, `docs/deploy.md` | provisioning script written + unit-tested against a mock API; **never run against real Northflank** |

## 4. Decisions already taken by Gabriel (do not reopen)

- 2026-09-28: rebuild the site in the v3 keynote look; fund pages updated daily from the dataplatform;
  Microsoft-authenticated admin restricted to nymbus.ca.
- 2026-09-29:
  - **Benchmarks: FTSE data for all** (dataplatform FTSE levels; Monthly Income = `short_corp`,
    SEB = `univ`). Factsheet index figures are a cross-check only.
  - **Class F/FP for all funds**: Monthly Income FP (LDM001), SEB F (LDM201), Multi-Strategy F (LDM301).
    Note kept in admin issues: SEB's dataplatform track record is the STRATEGY_H series.
  - **Fund AUM hidden by default** (admin can show it per fund by unticking "aum").
  - **Disclaimers**: start from our boilerplate, highlight the required review (done: admin banner +
    `docs/compliance-review.md`).
  - **Hosting**: move from GitHub Pages (`nymbus-capital.github.io/website`) to Northflank, in the
    project where the dataplatform runs; Claude sets everything up, Gabriel adds credentials.
- Publish mode defaults to **review** until an admin switches it to auto.

## 5. Open items (claim before starting)

1. **Merge PR #1** — Gabriel.
2. **Northflank provisioning** — [in progress — home session, 2026-09-29] done through the Northflank UI
   with Gabriel's approval: service `website` (ETL project, branch `redesign/v3-keynote-live-data`,
   nf-compute-50, public `https://p01--website--ddyc4hjyxx82.code.run`) and volume `website-data`
   (4 GB SSD at `/data`) created. Still to do: secret group `website-secrets` (restricted to `website`,
   runtime), health check `/api/health` on port 3000, switch branch to `main` after the PR merge, then
   Gabriel pastes credentials. (The original plan was the script below:) Gabriel runs it (steps in `docs/deploy.md` §1: API role + token,
   protected `production` environment, dry run, apply). Then paste credentials (§2). If the workflow
   fails, the Actions log shows the Northflank API error message; fix `provision.mjs` field names
   accordingly (the API body shapes were written from docs/conventions, not tested live).
3. **Entra app registration for the website admin** — mostly done 2026-09-29 (home session, via the
   built-in browser): app "Nymbus website admin" (single tenant, Web redirect `<PUBLIC_URL>/api/auth/callback`),
   ID-token optional claims `acct`, `email`, `upn` (+ Graph `email`/`profile`), enterprise app
   "Assignment required = Yes". Tenant and client IDs typed into the Northflank `website-secrets` form.
   **Gabriel still to do**: assign himself (and anyone else) under Enterprise apps → Nymbus website admin →
   Users and groups; create the client secret and paste it into `AZURE_CLIENT_SECRET`; then create the secret group.
   If first sign-in asks for consent and users can't consent, grant admin consent on API permissions.
4. **Dataplatform access decision** — the dataplatform's CLAUDE.md requires an authentication /
   authorization decision for a new consumer. The website service reads, read-only and from inside the
   `etl` project: `/api/performance/monthly-net-returns`, `/api/performance/nav-timeseries`,
   `/api/apex/funds`, `/api/unitholders/funds`, `/api/unitholders/aum` (fund totals only),
   `/api/ftse/index-summary` (+ `/short-names`), and (branch `feat/api-portfolio-distributions`)
   `/api/apex/fund-portfolio`, `/api/performance/distributions`. Gabriel to confirm; record the decision in the
   dataplatform repo if required there.
5. **First live runs in review mode** — compare every figure with the latest factsheet; expect
   index differences before May 2026 (factsheets used XSB/XBB ETFs then).
6. **Compliance review of disclaimers** — `docs/compliance-review.md`; then "mark as reviewed" in admin.
7. **Custom domain** `www.nymbus.ca` when approved (`docs/deploy.md`), then disable GitHub Pages.
8. **Daily portfolio + distributions** (branch `feat/api-portfolio-distributions`, based on the PR #1 branch): the
   website consumes the two new dataplatform endpoints (contract of 2026-09-30, `docs/architecture.md` § Sources).
   Until the **dataplatform PR** implementing `/api/apex/fund-portfolio` and `/api/performance/distributions` is
   deployed, they answer 404: one info issue per run, the site behaves as before. After deployment: run in review
   mode, compare the Portfolio tab (daily) with the month-end factsheet (the cross-check issues in the run say where
   they differ), check the distributions per series against the administrator's records, then merge this branch.
9. **Coverage follow-up**: the daily book is used only when priced ≥ 90 % and resolved ≥ 95 % of the bond weight (and
   each characteristic ≥ 90 %). Watch the `funds.<fund>.portfolio` warn issues on the first live runs (the
   multi-strategy fund may stay on the factsheet); raise coverage in the instrument master / market data rather than
   lowering the thresholds. Distribution yields and types are not in the source (documented gap).
10. Nice to have: contact form backend (currently mailto), fund inception dates for funds other than
   Monthly Income (`FUND_INCEPTION` in `src/content/disclaimers.ts`), holiday calendar for FTSE
   month-ends (currently weekdays).

## 6. Session log

- 2026-09-30 (home, branch `feat/api-portfolio-distributions`): regression from the independent verification fixed —
  the trailing-12-month check used a window ending at the last distribution, but the dataplatform
  (`distribution_history.py`, `_year_before(end) < date <= end`) ends it at the response `end_date` (day of the read),
  so monthly / quarterly figures were wrongly hidden on most days. Now `DistributionsData.trailingTo` = payload
  `end_date`, `trailingProblem(c, trailingTo, today)` uses the same window (29 Feb → 28 Feb), drops the figure when the
  window end is unknown / in the future or the capped history does not reach the window start. Card label "12 months
  to <date>" / « 12 mois au <date> » (title gives the full sentence). Tests: verifier scenarios (monthly 2026-09-30
  with last 2026-08-31 = 11 rows, June date with last 2026-05-29 = 12 rows, quarterly = 3 rows, 29 Feb), e2e label.

- 2026-09-30 (home, branch `feat/api-portfolio-distributions`): fixes after an independent adversarial review of the
  portfolio / distributions work. One freshness rule for the daily book (`src/lib/data/freshness.ts`, 7 whole days)
  used by the selection, the validation gate (now also on funds carried over from the previous publication) and a
  render-time gate in `site.ts` (rollback / pin never shows a stale book as "daily"; the sample is judged at its
  generation date). Identity check of both payloads (`fund` / `short_name`). Distributions: currency never defaulted
  (register vs payload must agree), trailing 12 months checked against the rows of the 12 months ending at the last
  distribution (superseded: see the entry above, window ends at the response end date), carried-over data dropped after 10 days without a successful read (`checkedAt`,
  `DISTRIBUTIONS.maxCarryDays`), "Data as of" = latest distribution. Page: provenance line says "daily holdings as of
  <date>" when the daily book is shown (+ sustainability clause) — **new wording in `docs/compliance-review.md` row 12,
  to review**; negative weights draw no bar (was stretched); hiding characteristics hides the securities count; chart
  roving tabindex; amounts at the series' own precision (rows add up to calendar totals); YTD tag only while the year
  is open; odd last breakdown spans the row; distribution cards aligned (subgrid); snapshot cache bounded (8, LRU).
  Review item "month-end book requested with YYYY-MM" was not reproducible (`lastClosedMonth` returns the month-end
  date); a test now pins the dated request and a divergent month-end warning. Item "nbsp before « ; »" not applied:
  the repo's tested convention is Québec (no space before « ; »). Not merged into `redesign/v3-keynote-live-data`
  (the main session merges after an independent verification).

- 2026-09-30 (home, branch `feat/api-portfolio-distributions`): wired the two new dataplatform endpoints (daily
  portfolio book, per-series distributions) per the 2026-09-30 contract: tolerant parsers (`sources/contracts.ts`),
  selection with coverage thresholds and factsheet fallback + month-end cross-check (`portfolio.ts`), distributions
  by FundServ code for live series (`distributions.ts`), never-blocking gates (`validate.ts`), new `FundData.portfolio`
  / `FundData.distributions` (optional; old files still read), `hide.distributions`, Portfolio tab (daily source
  label and date, characteristics with coverage footnote, breakdowns in rating / bucket order, top 10 with coupon /
  maturity / rating / sector / green marker, green bonds weight) and Distributions tab (per-series cards, history
  chart, calendar-year totals, full history behind "Show all", note on type / tax character). In-memory cache of the
  published data and content (`src/lib/data/cache.ts`). Synthetic fixtures + sample extended; unit + e2e tests.
  Waiting for the dataplatform PR (open item 8).

- 2026-09-30 (home): **public site rebuilt** after Gabriel's feedback ("informational corporate site with the
  previous site's sections, light v3 look and motion, not a deck"): see `docs/site-rebuild.md`. Foundation
  (light tokens, kit with v3 motion, old-site nav/footer) + three parallel builders (home/strategies/solutions;
  fund pages with tabs Overview/Performance/Portfolio/Distributions/Documents; approach/sustainability/about/
  contact/legal/privacy/404), legacy deck CSS removed. Adversarial reviews (numbers/data, content/compliance) →
  fixes: GMV arithmetic growth rebasing, hidden blocks stripped server-side, fund sources moved to
  `src/lib/pipeline/fund-sources.ts` (never in client bundles, test enforces), per-fund as-of/gross markers,
  compliance wording (no guarantees/"uncorrelated" as fact, leverage disclosure, PRI naming, Law 25, AMF/OBSI),
  FR typography test. Open decisions for Gabriel/compliance: `docs/compliance-review.md` "Website copy review
  2026-09-30" (SEB H-series labelled F, Monthly Income pre-launch track record, GMV series nature, client logos).

- 2026-09-29 16:50 (home): first live runs. All sources reach (dataplatform, SharePoint factsheets, analytics).
  Fixed: FTSE levels (dataplatform returns one row/day describing the index; `ftseLevels` now anchors on the
  index signature). short_corp history only from 2024-12 (older name not joined yet: investigate
  `/api/ftse/index-summary/short-names`). **Open, needs Gabriel**: July 2026 monthly returns in the analytics
  `fund_returns.json` disagree with the August factsheet's monthly table for SEST, SEB and Multistrat (SEB June
  too) → performance withheld for those 3 funds (runs `blocked`, nothing published). Which source is right?

- 2026-09-29 16:25 (home): all settings present in the container (startup logs: `[admin] sign-in configured`,
  `[pipeline] settings: …` all set except the optional webhook, `[pipeline] dataplatform: HTTP 200 (reachable)`).
  Northflank **CD is off** on `website` (a manual redeploy turned it off): Gabriel to re-enable the CD toggle on
  the service header, else new pushes build but do not deploy. Next: first sign-in, dry run in review mode.

- 2026-09-29 14:00 (home): secret group `website-secrets` created by Gabriel; health check `/api/health` :3000
  added. New startup diagnostics (`[admin] …`, `[data] …` lines in the runtime logs) showed the container
  gets AZURE_TENANT_ID and AZURE_CLIENT_SECRET but **not** AZURE_CLIENT_ID, PUBLIC_URL, ADMIN_ALLOWED_DOMAINS
  → Gabriel to re-check the group's values (password-protected page). Entrypoint now re-owns /data and drops
  root (`docker/start.mjs`); pipeline logs redact credential query values.

- 2026-09-29 13:30 (home): Entra app registration created and configured (see §5 item 3); the
  Northflank secret-group form is filled but not yet created (waiting on Gabriel's secrets).

- 2026-09-29 midday (home): Northflank setup through the built-in browser — service + volume created;
  AUTH_SECRET now self-generated on the volume (`src/lib/auth/volume-secret.ts`), so nobody pastes it.

- 2026-09-28/29 (home, cloud workspace): built the whole PR (design, pages, fund pages, pipeline,
  admin, CI, Docker). Adversarial reviews: security ×2, data correctness ×2, design/a11y ×1, final
  verifier; all findings fixed. Applied Gabriel's 2026-09-29 decisions (§4). Wrote the Northflank
  provisioning script + workflow, reviewed adversarially (unrestricted secret groups guard, stopped-
  until-wired order, strict options, secret scrubbing, protected environment). Wrote this handoff.
