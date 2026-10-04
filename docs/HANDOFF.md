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
- 2026-10-01: **SEB performance = Class F series; the label always matches the data** ("Change SEB to Class F
  timeseries. If you showcase the class H timeseries, then show class H."). Branch `fix/seb-class`: class F with full
  history when the dataplatform confirms it, else class H labelled H; never a mixed series (see
  `docs/architecture.md` § Performance class).
  - **Fund AUM hidden by default** (admin can show it per fund by unticking "aum").
  - **Disclaimers**: start from our boilerplate, highlight the required review (done: admin banner +
    `docs/compliance-review.md`).
  - **Hosting**: move from GitHub Pages (`nymbus-capital.github.io/website`) to Northflank, in the
    project where the dataplatform runs; Claude sets everything up, Gabriel adds credentials.
- Publish mode defaults to **review** until an admin switches it to auto.
- 2026-10-02: **dataplatform main endpoints only, no dataplatform change for the website**: groupings and derived
  figures are computed in the website backend from those endpoints (`docs/architecture.md` § Sources). **Benchmarks:
  FTSE for the bond funds.** **Every Global Minimum Volatility figure names its downside volatility variant**; the
  record of about 10 %/yr is the **6 % downside volatility** variant.

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
8. **Superseded 2026-10-02 by `feat/dp-only-data`** (portfolio computed by the website from main endpoints; dataplatform
   PRs **#621, #626 and #631 are no longer needed** by the website). Remaining no-workaround gaps on main endpoints:
   distributions (no endpoint), Monthly Income `short_corp` benchmark before 2024-12 (only in the bbg2 mirror / B2),
   GMV live variants (bbg2 mirror only: factsheet stays the GMV source), months of a class before its first NAV (SEB F
   before 2023-07), ESG metrics and Multi-Strategy allocation (factsheet), month-end duration / yield (latest prices
   only). Old text: **Daily portfolio + distributions** (branch `feat/api-portfolio-distributions`, based on the PR #1 branch): the
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
11. **Superseded 2026-10-02** (class series computed by the website from `nav-timeseries`; PR #626 not needed). On the
   first live runs of `feat/dp-only-data` in review mode, check SEB F (LDM201) and Monthly Income F (LDM081) against the
   administrator and watch the `navchain` / `classes` issues. Old text: **Class series at the dataplatform** (PR #626 `feat/monthly-net-returns-class`, open): deploy it, then run in review mode
   and check that SEB F (LDM201), SEB H (LDM202), Multi-Strategy F and Monthly Income FP match the administrator. Until then the
   endpoint ignores `class_code`: the pipeline treats it as "not served" (info issue) and SEB shows its H series labelled H.
   **Monthly Income F (LDM081) has no class series** (dataplatform `STRATEGY` for SEST is FP): the page opens on "coming soon"
   for F. Needs a dataplatform change (class mapping for SEST F) and a `classSeries` entry in `fund-sources.ts`.
   The home page (other agent) reads the top-level `performance`: for Monthly Income that is still FP's, for SEB it becomes F's.
12. **Rankings / awards** — branch `feat/awards-v2` (not merged): Morningstar 5 stars (Class F, as of 2026-10-01, stated by
   Nymbus) on the bond funds' Overview + awards tab; RBC pooled fund survey / eVestment / LSEG Lipper / GMR entries
   (admin-editable, hidden until confirmed with URL + date); staleness limit in settings (default 6 months, all providers);
   weekly RBC survey check (admin issue + webhook, never hides data); AdvisorRankings on /solutions. **Gabriel to do**:
   (a) *(done 2026-10-03, `feat/awards-assets`)* provide the **official Morningstar files** (`public/brand/third-party/morningstar-logo.svg|png` and
   `morningstar-stars-5.svg|png`, or upload them in *Admin → Settings → third-party brand assets*) — until then the rating is
   text and the admin shows "official Morningstar assets missing"; (b) *(done 2026-10-03: Q2 2026 seeded, confirmed)* enter the **RBC survey percentiles** per period from
   the Q2 2026 PDF (drafts pre-filled with 1st percentile; add class, peer group, quarter end 2026-06-30, PDF URL, tick
   confirmed); (c) enter eVestment / LSEG Lipper / GMR figures with their source links; (d) compliance rows W1–W7
   (`docs/compliance-review.md`), incl. Morningstar "out of N funds". French category names are our translation (row F6).
13. **Admin to fill** (shown only when filled): class types for classes other than LDM081 / LDM001, minimum subsequent
   investment, RSP eligibility, liquidity, CIFSC category, portfolio managers, management fee / MER; upload factsheet / fund
   facts / prospectus / proxy-voting / tax-factor documents. Compliance: `docs/compliance-review.md` § Fund pages v2.

11. **Headless WordPress editor backend** (branch `feat/wp-cms`, based on the PR branch, not merged): built, CI-tested,
   **nothing deployed**. Gabriel's manual steps: `docs/deploy.md` §5 / `wordpress/README.md` (MySQL addon, uploads volume,
   secret group, service `wordpress`, install + activate plugin, permalinks, connect the website with `WP_BASE_URL` +
   secrets, **Microsoft SSO for WordPress login = TODO**). Follow-ups: import the current team/news into WordPress
   (photos are on www.nymbus.ca, not imported), render `linkedin` in the team modal (`TeamMember.linkedin`), fund pages
   still read managers from `src/data/team.ts`, add News to the nav/footer if wanted, independent adversarial review
   (could not be spawned in the building session).

14. **Content v3** (branch `feat/content-v3`, from `redesign/v3-keynote-live-data`, **not merged**): built, CI-tested. To do:
   independent adversarial review, compliance rows V1–V12 (`docs/compliance-review.md` § Content v3), Gabriel to confirm the
   decks titles (V6), the asset-class list of the multi-strategy diagram and the "liquid alternative" term (V3), the
   Tobacco-Free pledge scope (V11); the awards work wires `<AdvisorRankings />` (`src/components/site/pages/AdvisorRankings.tsx`).
   WordPress team entries have no years of experience: with the CMS on, the band hides that counter.

15. **Critical concepts** (branch `feat/critical-concepts`, from `redesign/v3-keynote-live-data`, **not merged**): page
   `/critical-concepts` built and CI-tested. To do: independent adversarial review (design / a11y / compliance), compliance
   rows CC1–CC4, Gabriel to confirm the $200 MM liquidity filter (the explainer deck says 175 M$) and the "≈10%" deposit.
   Still frames of every step: `e2e/screenshots/concepts-*` on the `ci/run-*` branches.
   **v5 (branch `feat/concepts-v5`, not merged)**: overlay driven by volatility (vega) with a calm/volatile strip, sector
   analysts and sector clusters, concept 3 renamed "Ultra-micro analysis, at scale" (anchor `#ultra-micro-analysis`,
   alias `#coverage`). Compliance rows CC6–CC8 to review.

16. **Core concepts** (branch `feat/core-concepts`, from `redesign/v3-keynote-live-data`, **not merged**): rename to
   "Core concepts" at `/core-concepts` (old URL redirects), "protective overlays" with the qualifier, futures slowed down,
   concept 3 as a VS comparison. Compliance rows CC9–CC12 to review; independent adversarial review still to run.

17. **Concepts v6** (branch `feat/concepts-v6`, from `redesign/v3-keynote-live-data`, **not merged**): futures 3.75 s a day;
   concept 3 back to one large shared graphic as a two-act comparison (methods column with VS, active method highlighted).
   Compliance rows CC13–CC14 to review; independent adversarial review still to run.

18. **Site v5** (branch `feat/site-v5`, not merged): independent adversarial review (design / a11y of the info note,
   compliance), compliance rows P1–P8 (`docs/compliance-review.md`), in particular **P3** (Morningstar disclosure behind an
   info note) and **P1** ("protective" as a name). Merge after the concepts branch to avoid copy conflicts.
   **WordPress**: Xavier Girard and Jean-Philippe Lejeune were removed from `src/data/team.ts` only; if the CMS is enabled
   (`WP_BASE_URL`), remove them from the WordPress team too (WordPress wins over the static list).

## 6. Session log

- 2026-10-04 (sub-agent, branch `feat/concepts-v6` from `redesign/v3-keynote-live-data`; not merged): Gabriel's two requests.
  (1) Futures "a tiny bit faster, still slower than initially": `DAY_MS` 5000 → 3750, `SETTLE_SHARE` 0.25 kept, new
  `READ_MARGIN` 1.5 (message held ≥ 1.5 reading times; test 3.5–4 s a day). (2) Concept 3 "the first design when the area was
  bigger": `coverageLayout` again returns one `grid` (the pre-VS v5 graphic: sector clusters, history room, legend) plus a
  methods column — `team` card, `vs` badge, `systems` card (left column ≥ 700 px; strip on top below) — with `CARD_ROWS`
  for the rows inside each card and `focusAt(step, p)` (`FOCUS`: universe 0.6/0.6, act 1 1/0.4, act 2 0.4/1, compare 1/1,
  eased over `FOCUS_IN`). Act 2 fades the team's colours, compare outlines the team's 180 (sector-colour rings) over the
  systems' coverage and swaps the filter legend for "Conventional team: ≈180 · Our systems: every liquid bond"; the wide
  title row names the method on the graphic. Steps "The universe · Conventional team · Our systems · Compare"; canvas
  480–560 px desktop, 620 px phone. e2e captures all three FR acts of concept 3 on desktop. Compliance CC13–CC14.

- 2026-10-04 (sub-agent, branch `fix/v5-minors` from `integ/v5`; not merged): review minors — meta descriptions (approach, about,
  core concepts) carry "designed to offset part of losses"; home added to the qualifier test; concept 3 stat "Covered by a team of
  6 analysts" ≈180 (was 5–6 / 150–180); futures canvas labels shrink to fit (`Pen.fit`) and shorter FR (« Somme = résultat total »,
  « (hors fiscalité) », formula chip); InfoNote popup focusable (scrollable) with `--bg`; stale comments; compliance P5 rule
  wording; handoff merge artefact (duplicate "Session log" header) fixed.
- 2026-10-03 (sub-agent, branch `feat/core-concepts` from `redesign/v3-keynote-live-data`; not merged): Gabriel's four
  concepts-page requests. (1) Page renamed "Core concepts" / « Concepts de base » (nav key `nav.concepts`, footer, title,
  metadata, hero eyebrow); route moved to `src/app/(site)/core-concepts/` (component `CoreConcepts.tsx`), `/critical-concepts`
  → `/core-concepts` permanent redirect in `next.config.ts` (legacy list); tests renamed `tests/unit/site/core-concepts.test.ts`,
  `e2e/core-concepts.spec.ts` (+ redirect test, 308). (2) Concept 1 "protective overlays" / « superpositions protectrices »
  ("What is a protective overlay?"), lead and caption carry "designed to offset part of (bond) losses; they may not do so".
  (3) Futures 4× slower: `DAY_MS` 1250 → 5000, `SETTLE_SHARE` 0.25 (price holds at the close while coins move,
  `marketU`), daily rule held the whole day (`ruleAlpha`, ≈ 4.5 s), unit-tested against two reads at ≈ 300 wpm.
  (4) Concept 3 as a comparison: `coverageLayout` returns `left` / `right` sides (side by side ≥ 700 px, stacked below,
  `gridFit` picks the rows) and a `vs` badge; left = conventional team (PM + six sector analysts in a crew row, year bar,
  "180 of ≈2,000"), right = our systems (scan bar, filter legend, history sheets, "Every liquid bond, every day"); steps
  "The universe · Conventional team · Our systems · Side by side"; canvas 480–560 px desktop, 760 px phone. Word budget
  660 → 720, visible prose 130 → 140 (qualifier). Compliance CC9–CC12.
- 2026-10-04 (sub-agent, branch `feat/site-v5` from `redesign/v3-keynote-live-data`; **not merged**): Gabriel's five requests.
  (1) **"Protective overlay(s)"** / « superposition(s) protectrice(s) » names the overlay strategy on home (strategies lead,
  engines band trio / lane / alt; Science at scale untouched), approach, solutions, about (+ qualifier note) and fund pages;
  qualifier "designed to offset part of losses; may not" kept next to it, futures-exposure disclosure verbatim; the
  content-v3 test that forbade "protective" now requires the qualifier instead. (2) About: people section before the values;
  Xavier Girard and Jean-Philippe Lejeune removed (portraits deleted; no fund-page manager seed named them); counts 18 people /
  2 PhD / 3 eng-CS / 6 CFA-CIM / 9 graduate / 278+ years. (3) /solutions "Third-party rankings" removed with
  `AdvisorRankings`, its CSS, `lib/rankings/advisor.ts` and their tests (`RK.adv` reduced to `RK.newTab`). (4) Awards:
  order Morningstar → Fundata → RBC → others; "Fund Library" → **Fundata** (source link "Fundata (FundLibrary.com)", admin
  labels); brand slot `fundlibrary-logo` → `fundata-logo` with legacy uploads still listed / served / replaced
  (`LEGACY_BRAND_SLOTS`, `toBrandSlot`); official logos `public/brand/third-party/fundata-logo.png` and `rbc-logo.png`
  (fetched from the providers' sites by the coordinator, Nymbus' permission per Gabriel) at ~124 px / ~38 px high;
  Morningstar methodology + attribution behind `InfoNote` (hover / focus / tap, Escape, aria-describedby); **awards gate**:
  tab + overview Morningstar block only with a shown Fundata FundGrade A or B (`awardsEligible`; server `gateAwards` strips
  the rankings, CIFSC line kept) — Multi-Strategy (C) has no tab. (5) GMV variants in the order 3 %, 6 %, 9 % with an
  explicit `default` flag (6 %) in `config/funds.ts`; pipeline order (default first) unchanged. Tests: unit (gate, order,
  legacy slot, shipped logos, variant order / default), e2e `e2e/site-v5.spec.ts` (+ fund / content-v3 / admin specs
  updated). Compliance rows P1–P8 (P3: hidden Morningstar disclosure to confirm). Not done: independent adversarial review.

- 2026-10-03 (sub-agent, branch `feat/concepts-v5` from `redesign/v3-keynote-live-data`; not merged): Gabriel's three
  /critical-concepts requests. (1) Overlay: the generated model is volatility-driven (`isVolatile`, `periodAt` in
  `overlay-stack-model.ts`): each 16-period chart has a 4-period and a 2-period volatile stretch; calm periods give a small
  overlay (slightly positive, sometimes slightly negative), volatile periods (large moves either way, sharp core drawdowns)
  a clearly positive one; the core drifts up in calm and down in volatile periods (no drift overall). Chart: violet shaded
  columns behind volatile periods, a Calm / Volatile regime strip under the bars, note "More volatility → overlay has
  historically tended to do better"; "Overlay losses add up too" still points at a losing calm period; caption sentence
  "Illustration of the overlay's sensitivity to volatility (vega); it may not behave this way." (2) Coverage: six named
  sector analysts (Financials, Technology & telecom, Consumer (discr. & staples), Utilities & infrastructure, Energy,
  Industrials; long / short / abbreviated names picked to fit), dots grouped in six sector clusters with faint sector
  names above them (hidden in the memory step), each analyst's 30 bonds in their cluster's colour; narrow screens show
  abbreviations under the analyst nodes. (3) Concept 3 renamed "Ultra-micro analysis, at scale" / « Analyse ultra-micro, à
  grande échelle » (heading "Why machines see more" kept); section anchor `#ultra-micro-analysis`, alias `#coverage`
  kept; internal id / test ids stay `coverage`. Unit tests: vega (volatile mean > calm mean, worst drawdowns positive,
  a losing calm period per seed), sector clusters and label fit at 300–1360 px; word budget for the page 580 → 660.
  Review fixes (same branch): volatile overlay without floor (0.15 + 0.55·|core| + 0.45·noise, loses ≈1 in 6), volatile core
  symmetric with a wider spread; chart scale from the window's tallest stack (`chartScale`); loss note on the largest
  visible loss, placed clear of the bars (`lossNoteSpot`, unit-tested at 332–800 px); pill tags shrink instead of
  truncating; FR « Agité »; caption "overlay strategy's sensitivity"; "Technology & communications"; narrow screens use the
  same abbreviations above the clusters and under the analysts.
- 2026-10-03 (sub-agent, branch `fix/concepts-v4` from `integ/v4`; not merged): fixes after the independent review of
  /critical-concepts. Overlay: one "Same capital base" bracket over core + deposit with the collateral sub-label;
  placeholder chart in steps 1–3 (desktop); no particles in still frames. Futures: clearing-house node between long and
  short, payment rule only while coins flow ("Day N close: …"), newest settlement bar glows in sync, running sum moved
  onto the price chart as a bracket ("Sum = total P&L"), formula chip with step 4, parties block centred (canvas shorter).
  Coverage: grid title anchored to the grid area, narrow team row 92 px, legend kept above the watermark; label boxes
  unit-tested apart. FR legend « Base » / « Superposition ». Text alpha ≥ 0.7. Roving tabindex on the step buttons.
  Captures: 360 px EN + FR steps 2–4, focus and scroll offset cleared. Compliance CC3(a) is a question for Gabriel
  (keeps $200 MM), new row CC5.
- 2026-10-03 (sub-agent, branch `fix/rbc-v4` from `integ/v4`; not merged): RBC seed review fixes. (1) The survey columns
  2026/2025/2024/2023 are **rolling 4-year periods ending June 30** ("Four year periods ending June 30"), not one-year
  periods: field `annual` → `rolling[]` (`years: 4`), labels "4 years to June 30, 2026" / « 4 ans au 30 juin 2026 » (page,
  /solutions, admin); stored `annual` entries migrate. (2) Scope label "Strategy track record since January 2019 (includes
  periods before the fund’s launch)" (`trackSince: "2019-01"`) + pre-launch sentence with a link to the disclosures (Monthly
  Income names its 2021-10-05 launch); entries stay confirmed. (3) Percentile note scope-aware ("fund’s strategy or
  series"), gross basis for RBC. (4) RBC category names in English in both languages. (5) FR « IF du PNUE » for UNEP FI
  (news, sustainability). Compliance W9 rewritten.

- 2026-10-03 (sub-agent, branch `feat/awards-assets` from `redesign/v3-keynote-live-data`; not merged): Gabriel's assets and
  data. (1) Official Morningstar files (provided by Gabriel, Nymbus holds the permission) shipped as
  `public/brand/third-party/morningstar-logo.png` and `morningstar-stars-5.png`: the Overview and awards tabs of both bond
  funds and the /solutions list show the logo (~124 px) and stars image (~98 px) with the text alternative, series,
  as-of, source and attribution; served with the sandbox CSP. (2) RBC Investor Services Pooled Fund Survey Q2 2026 seeded as
  **confirmed** entries (as-of 2026-06-30, PDF URL, edition "Q2 2026"): SEB "Canadian Fixed Income" p. 21, percentile 1 for
  1Q, 1/2/3/5Y and the "four year periods ending June 30" 2023–2026 (rolling 4-year; first mislabelled one-year, fixed in `fix/rbc-v4`); Monthly Income "Canadian Short Term Fixed Income" p. 26, **1Q = 4th
  percentile**, 1 for the rest. New fields: `scope: "fund"` (survey ranks the fund, no series; class not required),
  `basis` (shown: "returns gross of management fees, in Canadian dollars"), `annual[]` (one-year periods), `sourceRef`,
  `ror` (stored, never sent to the page). A stored copy of the old pristine draft migrates to the confirmed entry. (3) RBC
  check: Q2 2026 (with link) is the shipped floor (`SEEDED_RBC_LATEST`); a confirmed Q2 entry raises no update issue.
  Compliance W8 (Morningstar files), W9 (RBC figures, gross-of-fees basis). Open: Morningstar "out of N funds" still to enter (W1).
- 2026-10-03 (sub-agent, branch `feat/copy-v4` from `redesign/v3-keynote-live-data`; not merged): **copy v4**. (1) Portraits: the
  decks team photos were already the newest in the decks repository (seed `team.json` = what the keynote team slides render;
  prospectus / GMV pptx embed the same); Xavier Girard now self-hosted from the GMV keynote governance slide (+4 years);
  Guy Liébart still hotlinked from www.nymbus.ca (in no deck). (2) "Scientists, engineers and market veterans" / FR « des
  scientifiques, des développeurs et des vétérans des marchés » across home hero, about, approach and the Science at scale copy
  (fingerprint updated with Gabriel's 2026-10-03 note; animation untouched). (3) Tobacco-Free pledge worded as a firm signature
  (Tobacco Free Portfolios, UNEP FI; OTPP 2018 source in compliance). (4) "Liquid alternative" + "Alternative Multi-Strategy"
  category restored for Multi-Strategy (approved). (5) Body copy trimmed, budgets lowered. Compliance rows C1–C5 (§ Copy v4).
  Follow-up: live decks.nymbus.ca team (/api/team) — 6 newer portraits, Léana D’Imperio and Philippe Rivet added (business
  development), JPL title "Quant Developer & Trader"; counts 20 people / 7 CFA-CIM / 10 graduate / 293+ years (row C6).
- 2026-10-03 (sub-agent, branch `feat/critical-concepts` from `redesign/v3-keynote-live-data`; **not merged**): Gabriel's
  request "add a section called 'critical concepts' on the navigation … 3 main concepts … same type of amazing animations".
  New page `/critical-concepts` (nav after Approach — the desktop nav now switches to the menu button below 1240 px and
  tightens links below 1360 px — and footer). Three canvas panels in `src/components/site/concepts/` on the scan /
  engines motion contract (shared `runner.ts`: lazy, off-screen / hidden-tab pause, DPR 1.5, 30/15 fps, still frame per
  step under reduced motion incl. live change, Data Saver still, `data-frames` / `data-running` / `data-step`), with
  play / pause and step buttons (arrow keys, Home / End): (1) **overlay**: core 100% invested → ≈10% deposit to scale →
  beam opens into a full futures exposure on top → two generated return streams stacking into the combined one, a
  losing overlay period called out; (2) **futures**: generated index day by day, settled days lock, only today's move
  open, coin stream between long and short at each close, settlement row whose running sum is the total P&L, margin
  buffers widen in a volatile episode, formula chip; (3) **coverage at scale** ("Why machines see more"): 2,000 dots,
  $200 MM filter, PM + 6 analysts lighting 30 each (180), systematic scan of every liquid bond, history layers. Pure
  models unit-tested (`tests/unit/site/critical-concepts.test.ts`: determinism, bounds, settlements sum to cumulative
  P&L, margin scales with volatility and covers the open P&L, coverage counts, layouts, copy rules, word budgets);
  e2e `e2e/critical-concepts.spec.ts` (+ route in `site.spec.ts`). Compliance rows CC1–CC4. **Open for Gabriel**:
  $200 MM vs the explainer deck's 175 M$; "≈10%" deposit; independent adversarial review still to run (open item 15).

- 2026-10-03 (cloud agent, branch `fix/ftse-live` from `redesign/v3-keynote-live-data`; **not merged**): fixes after the
  first live run. (1) FTSE month-ends use a Canadian bond-market calendar (Truth and Reconciliation Day, Remembrance Day:
  the 2025-09 / 2026-09 index months came back); (2) verified one-day gap link between FTSE naming generations
  (implied return vs yield/duration estimate, calibrated tolerance; re-based levels are rejected, so `univ_overall` is
  linked only if FTSE kept the base); (3) broader family matching + candidate list in the source detail (no
  `ftseAliases` for SEST: no name could be justified without the live list); (4) class F dropped for unverifiable CIBC
  months is a non-blocking notice, one concise CIBC-mismatch warning per fund — **open**: the stored CIBC daily returns
  disagree with analytics by several percent on some months (e.g. 2021-11), to investigate with the dataplatform team;
  (5) pricing: the instrument master's `latest_price` (Bloomberg price tables) was not within 7 days for any bond on the
  live run; the FTSE constituents (univ / short_corp) now price Canadian bonds as a fallback and the warnings show the
  price dates — **open**: check the Bloomberg price loader schedule on the dataplatform.

- 2026-10-03 (cloud agent, branch `fix/data-v3` from `integ/v3`; **not merged**): fixes of the independent review
  of the dataplatform-only pipeline. B1 class series cover every month from the class's first computable month (else
  dropped, warn + alert), >= 12 months; M2 bridge seam continuity + factsheet confirmation without analytics July;
  M3 unconfirmed new months never auto-published (auto: previous performance kept, run `pending-review` + alert; admin
  approval publishes them; review mode unchanged); M4 revisions + class-change gate on every class entry and the
  default class; M5 per-fund fee band, none for Monthly Income (FP performance fee); M6 signed duration / yield,
  withheld above 0.5 % shorts, "bond holdings only" label with open futures; m7 CAD; m8 FTSE month-end vs TSX
  holidays; m9 net assets of every active register class; m10 navStart = register `fund_data_start` (SEB / Multi
  2023-07-01), never before the register inception; m11 identifier fallback, unresolved contracts unweighted; m12
  alert when monthly-net-returns folds several Apex classes. Shared TSX calendar: `src/lib/pipeline/market-calendar.ts`.
- 2026-10-03 (sub-agent, branch `fix/awards-v3` from `integ/v3`; not merged): fixes after the independent review of awards v2.
  RBC check: an edition counts only with an article / PDF link on an RBC host and only when its quarter ended ≥ 21 days ago;
  a stored "latest" in the future or without a link is dropped (self-heal); redirects followed by hand, RBC hosts only; pages
  read up to 3 MB then cancelled; `withLock("rankings-check")` (manual "check now" answers 409 while one runs). SVG
  validator: allow-list of elements / attributes, refuses DOCTYPE / CDATA / animation / backslash escapes / image-set.
  `next.config.ts` serves `/brand/third-party/*` with the sandbox CSP + nosniff; `brand-files.test.ts` validates every
  shipped file. `hide.rankings` → no rankings in the page payload. Brand: 304 without Content-Length, upload writes file +
  index before removing the old type, stream errors logged. Morningstar "out of N funds" shown in the advisor list too
  (compliance W1: required, enter N). /solutions: rankings moved out of the illustrative use case into their own
  "Third-party rankings" section with a link to each fund's standard performance (compliance V9 updated).
- 2026-10-03 (sub-agent, branch `fix/copy-v3` from `integ/v3`; not merged): fixes after the independent review of content v3 —
  ESG attribution without "other funds" claims, pledge texts describe the firm's signature only (FR « Engagement pour une finance
  sans tabac » incl. news title); no "protective" overlay as fact; pension objective "returns above inflation over a full rate cycle";
  "liquid, cross-asset alternative strategy" instead of "liquid alternative"; "low correlation with bonds in down months" across
  approach / fund pages / solutions; « volatilité à la baisse » everywhere (+ test forbidding « baissière »), "Fundserv"; no « ingénieurs »
  for people (FR « scientifiques, informaticiens et analystes »); decks titles aligned; Guy Liébart's 59 years dropped (combined
  experience 273+); both bond funds linked from "Bond funds with an overlay"; contrast, new-tab notice, portrait sizes.
  Compliance § Content v3 rows R1–R10. **TODO**: Guy Liébart's and Xavier Girard's portraits are still hotlinked from
  www.nymbus.ca (not in the repo, not in the decks list): add self-hosted copies when available. The frozen "Science at scale"
  band still says « ingénieurs » (needs Gabriel's sign-off).

- 2026-10-03 (sub-agent, branch `fix/overlay-v3` from `integ/v3`; not merged): reviewers' fixes to the home
  "diversifying engines" band. Caption now ends with the verbatim futures-exposure disclosure (EN/FR,
  `OVERLAY_EXPOSURE`); panel retitled "Diversifying engines · down months"; lanes = the Multi-Strategy Fund's four
  strategies (Low volatility, Directional, Mean reversion, Hedging) + a separate "Futures overlay" lane kept out of the
  blend ("Four strategies combined"); zero drift for every series (bond, lanes, blend; unit test); `role="img"` moved to
  the canvas wrapper so the counters `<dl>` is readable; FR counters « Mois simulés » etc.; "Highlighted: moves
  independently" / « En surbrillance : évolue indépendamment »; long lane names wrap on two lines, narrow legend on two
  lines. Science at scale untouched (fingerprint test green). Compliance notes updated.
- 2026-10-03 (sub-agent, branch `integ/v3` from `redesign/v3-keynote-live-data`; **not merged into the redesign
  branch**): integration of `feat/dp-only-data`, `feat/awards-v2`, `feat/content-v3`, `feat/home-overlay-viz` (merged in
  that order, `--no-ff`). Resolutions: one GMV label implementation, dp-only-data's `FundCard.perfVariant` from
  `shownVariant` (config/funds.ts); content-v3's per-variant figures kept, its `FundCard.variant` / `variantText` /
  `FUND_COPY.variant` removed (FundTile, StrategiesIndex, Solutions use `perfVariant`; solutions testid
  `solution-variant-<key>`). AdvisorRankings: content-v3's placeholder `pages/AdvisorRankings.tsx` deleted; the real
  awards-v2 component renders once, inside the advisors use-case card on /solutions. Overview keeps the variant lead and
  the Morningstar block. Word budgets: content-v3 ceilings + the engines band; copy-typography includes RK and
  OVERLAY_COPY. Science-at-scale files untouched (fingerprint test green). Sample unchanged after `npm run pipeline -- sample`.

- 2026-10-02 (cloud agent, branch `feat/dp-only-data` from `redesign/v3-keynote-live-data`; **not merged**):
  Gabriel: "all the data comes from the dataplatform … avoid PR 631 and other changes on dataplatform … compute whatever
  you need within the backend of the website". Done: (1) per-class monthly returns from the `nav-timeseries` daily chain
  (`daily-chain.ts`: ports of the dataplatform trading calendar, `_monthly_rows` and PR #626's July bridge), headline
  Apex months must equal `monthly-net-returns` (1e-8), CIBC months used all-or-nothing after ≥ 6 equal analytics
  months (0.2 bp); SEST F (LDM081) and SEB F (LDM201) now have their own series (fee-band checked); headline stays the
  track-record class (SEST FP, SEB H, Multi F); pages open on F. (2) Portfolio computed from `/api/apex/holdings` +
  `/api/instruments/batch` + `/api/instruments` (`fund-portfolio.ts`, port of PR #621), same coverage gates and
  month-end cross-check (sectors only: no month-end prices). (3) FTSE: earlier naming generations chain-linked only
  on equal daily returns over common days; the old ≤ 3 % seam join was unsafe (FTSE rebased levels at the 2024-12
  renaming) and is gone. `univ_overall` + `univ` verified for SEB; `short_corp` starts 2024-12 at the dataplatform, so
  Monthly Income's long-term benchmark periods are not shown (no workaround on main endpoints). (4) Distributions not
  fetched (no main endpoint; NAV-move derivation not exact): tab shows the policy text, info issue. (5) Stale
  track-record guard; a withheld month is never refilled from a factsheet; `PIPELINE_REQUIRE_FACTSHEET_FOR_NEW_MONTH`
  now defaults to `0` (an existing disagreeing factsheet still blocks) — **Gabriel to confirm**. (6) GMV variant named
  everywhere ("6% downside volatility" / « volatilité à la baisse de 6 % », or the selected one), unit + e2e tests.
  Fixtures, sample and docs updated.

- 2026-10-02 (sub-agent, branch `feat/awards-v2`, from `redesign/v3-keynote-live-data`; **not merged**): **awards v2**.
  (1) Morningstar block on the Overview tab of Monthly Income and SEB (`components/fund/Morningstar.tsx`) and in the awards
  tab: text rating "Morningstar Rating™: 5 stars" + series, as-of date, source link, methodology and © attribution; official
  logo / star images only from files in `public/brand/third-party/` or uploaded in admin settings (`brand-assets.ts`,
  `/api/admin/upload/brand`, `/api/brand/<slot>` with exact type + nosniff + sandbox CSP); the old CSS stars and the
  red "MORNINGSTAR" wordmark were removed (look-alikes). (2) RBC Investor Services research: the survey now lives at
  **rbcis.com** (rbcits.com is the old name). Latest edition **Q2 2026** (quarter end 2026-06-30), published 2026-08-05:
  article `https://www.rbcis.com/en/insights/2026/08/pooled-fund-survey-q2-26`, PDF
  `https://www.rbcis.com/assets/rbcits/docs/FINAL_EN_Pooled_Fund_Survey_Q2_2026.pdf` (individual funds with percentile
  ranks per period). The PDF could only be read up to its Canadian Fixed Income table (page ~20, managers A–M): **Nymbus was
  not found in the readable part and could not be checked**, so nothing is seeded: drafts (1st percentile pre-filled, no
  URL / date) are admin-only until confirmed. Q4 2025: article `…/insights/2026/02/pooled-fund-survey-q4-25`. Listing:
  `https://www.rbcis.com/en/our-insights.page` (filter "Pooled Fund Survey"; the cards visible without JavaScript did not
  include the survey on 2026-10-02, hence the PDF-address probe). (3) Freshness: `src/lib/rankings/{policy,rbc-survey,
  schedule,issues,advisor}.ts`; staleness limit `rankingPolicy.maxAgeMonths` (settings, default 6) for Morningstar, Fund
  Library, RBC, eVestment, LSEG Lipper, GMR; weekly RBC check (instrumentation, `RANKINGS_CHECK=off` in e2e), dashboard
  panel "third-party rankings" with issues + "check now". (4) Generic entries for eVestment / LSEG Lipper / GMR in the
  fund editor; `AdvisorRankings` (`components/site/AdvisorRankings.tsx`, provider via `AdvisorRankingsProvider` in
  `/solutions/page.tsx`) placed in the advisors section of /solutions — if another branch adds a bare
  `<AdvisorRankings />` placeholder there too, keep only one. Every shown ranking now requires an https source link
  (Fund Library and Morningstar included). Tests: `tests/unit/rankings/*`, e2e in `fund.spec.ts` (overview Morningstar text
  fallback, solutions list) and `admin.spec.ts` (draft → stale hidden → fresh shown, API refuses confirmed without URL,
  brand image upload / serve / delete). Docs: architecture "Awards v2", compliance W1–W7.

- 2026-10-02 (sub-agent, branch `feat/content-v3`, from `redesign/v3-keynote-live-data`; not merged, nothing published):
  **content v3**, Gabriel's eight requests. (1) /approach: new "Every strategy starts with risk" section after the hero
  (ultra-micro analysis at scale; scans; protective overlays designed for low correlation) with an `UltraMicro` SVG (universe
  scan + magnifier, "Illustration only"). (2) /approach: "Several strategies, across asset classes" section — CSS grid diagram
  (4 strategies × 5 asset classes under an overlay band, reduced-motion safe, `role=img` with a full aria-label), the three ways
  in (bond funds with overlay, Multi-Strategy, GMV), two pipeline bullets. (3) Team from `nymbus-decks/data/seed/team.json`:
  titles, years, education EN/FR, LinkedIn (two wrong decks URLs dropped), 14 portraits re-encoded to `public/team/*.webp`
  (≤ 400 px, ≤ 14 kB), no logos; WordPress team still wins. (4) Bios / about intro give futures overlays equal room.
  (5) Credentials band on /team (2 PhDs, 3 eng/CS degrees, 9 graduate degrees, 6 CFA/CIM, 332+ years), badges, LinkedIn +
  experience in the bio dialog; helpers in `pages/lib/people.ts`. (6) /solutions: one illustrative use-case card per audience
  (pension LDI + overlay, family-office collateral + downside-volatility target, advisors) with overlay disclosures;
  `<AdvisorRankings />` slot renders nothing. (7) ESG scoped to the SEB fund (/sustainability rewritten, home step, news,
  solutions benefit) + `tests/unit/site/esg-scope.test.ts`. (8) GMV cards show the default variant's own figures named
  "6% downside volatility" (`FundCard.variant`). Word budgets raised (about 285, approach 720, solutions 545). Tests:
  `tests/unit/site/content-v3.test.ts`, `e2e/content-v3.spec.ts`. Compliance rows V1–V12. No adversarial sub-agent review
  could be spawned from this session: still to do.

- 2026-10-02 (sub-agent, branch `feat/home-overlay-viz`, from `redesign/v3-keynote-live-data`; **not merged, not published**):
  Gabriel: "I love the science at scale section … don't change anything about that. Something similar for protective
  overlays and/or uncorrelated strategies within the multi-strat, very impactful". New home band right after science at
  scale: **"Diversifying engines"** (`src/components/site/fx/overlay*.{ts,tsx,css}`: pure seeded `overlay-model.ts`,
  canvas `overlay-engine.ts`, component `OverlayEngines`, copy EN+FR). Time flows into a glowing "now" line: a generated
  bond reference dips through stress episodes (down months shaded), five generic engine lanes move on their own, engines
  that move up in a down month light up and leave marks, particles stream into the blended path, and a down-month
  (downside) correlation heatmap "concept" eases live. Same motion contract as the scan (lazy, off-screen / hidden-tab
  pause, DPR 1.5, 30/15 fps, still frame under reduced motion incl. live change, Data Saver still, `data-frames` /
  `data-running`), reuses the scan panel chrome (`.sc-panel`, `.sc-stats`, `.sc-trio`). Science at scale is untouched
  and frozen by `tests/unit/site/scan-frozen.test.ts` (hashes) + e2e text checks. Tests: `tests/unit/site/overlay.test.ts`,
  `e2e/home-engines.spec.ts`; copy in word-budget (own ceiling) and FR typography tests. Compliance:
  `docs/compliance-review.md` § "diversifying engines". Decisions for Gabriel: the wording (esp. the overlay pillar),
  strategy-type names (generic, not our sleeves), whether the heatmap should show Nymbus's actual engine list.
- 2026-10-01 (home, branch `feat/home-v2`, from `redesign/v3-keynote-live-data`; **not merged, not published**):
  Gabriel's brief: team dialogs centered, more tech-company motion, much less text, AUM C$1.9B, no daily NAV on home,
  bring back the "scanning billions of datapoints" table. Done: (1) dialogs: Tailwind preflight removed the UA
  `margin:auto`, so `dialog:modal` is now `fixed; inset:0; margin:auto` (+ scroll lock, `e2e/dialog.spec.ts` asserts the
  bounding box is centered, focus trap, Esc, backdrop). (2) `aumLabel` default `$1.9B` / `1,9 G$` (legacy `$1.8B+`
  migrated, test scans `src` for the old figure). (3) Home: NAV panel and fund-data section removed (fund cards keep
  returns only; fund pages untouched); new `AnalysisScan` canvas panel (`src/components/site/fx/`: pure `scan-model.ts`,
  `scan-engine.ts`, labelled "Illustration only"), key-figures card (AUM, strategies, people, PhDs from `team.ts`).
  (4) Motion kit `fx/`: lazy canvas `DataField` in heroes, section `Divider`s, `Parallax`, magnetic buttons, card
  spotlight, scroll-progress bar. All canvases lazy-init near the viewport, pause off-screen / hidden tab, cap DPR and
  fps, draw one still frame under `prefers-reduced-motion`; test hooks `data-frames` / `data-running`
  (`e2e/home-v2.spec.ts`). (5) Copy cut on home, approach, team, sustainability, solutions, contact (EN + FR, legal and
  disclosures untouched); `word-budget.test.ts`. New claims flagged in `docs/compliance-review.md` ("Home v2").
  Decisions for Gabriel: wording of the scan panel ("billions of data points" vs illustrative), whether /strategies
  keeps NAV, PRI principles list removed from /sustainability, saved admin content with the old AUM default.
- 2026-10-01 (home, branch `feat/wp-cms`): headless WordPress. `wordpress/` (plugin `nymbus-site-content`: news, team, site
  texts, EN/FR tabs, normalized `/wp-json/nymbus/v1/site-content`, optional secret, ETag, revalidate hook; mu-plugin; Dockerfile;
  compose + setup script; README for editors and Northflank), `src/lib/cms/` (validated plain-text client, memory + last-good
  cache, `/api/cms/revalidate`), `/news` + `/news/<id>`, home teaser (3), announcement banner (admin banner was never
  rendered before; now shown, admin wins over WordPress), team/approach/home read `getTeam()`, CSP img-src media origin.
  Wiring in shared files is minimal: Team.tsx/Approach.tsx take an optional `members` prop, Home/News an optional `news`
  prop, `(site)/layout.tsx` + `page.tsx` use `getPublicContent()`. Tests: `tests/unit/cms/*`, `e2e/cms.spec.ts` (own server +
  mock WP), PHP plain tests + lint in CI. Precedence and fallbacks: `docs/architecture.md` "Headless WordPress".
- 2026-10-01 (sub-agent, branch `feat/fund-pages-v2`, from `redesign/v3-keynote-live-data`; not merged, nothing published):
  **fund pages v2.** Plan and what was done: (1) the borrowed-money / "liquidity score" wording removed everywhere (copy reworded, two
  characteristics no longer parsed) + test `tests/unit/site/fonts-and-wording.test.ts` that fails on that wording; (2) all
  fonts Poppins (inherit rule for form controls / SVG text, test greps every `font-family`); (3) **returns per class**:
  pipeline `classes.ts` + `build.ts` (`performanceByClass`, default class F, short records, per-class
  gates in `validate.ts`, held with the performance), page `lib/select.ts`; (4) **GMV variants**
  3 / 6 / 9 % (`FundData.variants`); (5) page: class selector with Prospectus / Offering memorandum badges, "coming soon" per
  class, Awards and rankings tab (seeded Fund Library data, admin-editable, wordmark badges are CSS text), new facts
  (minimum subsequent, RSP, liquidity, CIFSC category, managers), top-10 total, header document shortcuts, document types
  proxy voting / tax factors, calendar chart with a label on every bar. Admin: class types, facts, rankings editor with a
  "updated manually" note. Docs: `architecture.md` (§ Returns per class), `compliance-review.md` (§ Fund pages v2, rows F1-F12).
  **Merged with `redesign/v3-keynote-live-data` (2026-10-02)**: the SEB class-from-data work (`perf-class.ts`, `classLabels`,
  class-change gate), the perf-only hold and the concise copy were kept as they are; the class layer was rebuilt on top of
  them (no second class fetch: the headline class is the headline, SEB's other class comes from the track-record candidate;
  a held performance holds every class and variant). The overlay wording (no removed term) was applied to the new concise copy.
  **Not done / blocked on data**: see open items 11-13. Tests: unit (`npm test`), e2e in `e2e/fund.spec.ts`.

- 2026-10-01 (home, branch `fix/perf-hold-only`): **live site was empty** — no run had ever been published (publish
  mode "review"; every run "blocked" by the July return mismatch of SEST / SEB / Multistrat, and a blocked fund with no
  previous publication was withheld whole, NAV included). `validateSite` now holds only the **performance**
  (`performance`, `trailing`, `risk`, `risk3Y` gates) when those are the only blocking issues: previous performance
  kept (else none), NAV / AUM / portfolio / distributions / factsheet publish, the run stays `blocked` + alert, a
  stale kept performance alerts. Any other blocking issue still withholds the whole fund. Adversarially reviewed.
  **Still needed from Gabriel: click Publish on the latest run in /admin (or switch publish mode to auto).**

- 2026-10-01 (home, branch `fix/seb-class`, from `redesign/v3-keynote-live-data`): **SEB class label = class of the
  data** (Gabriel's decision above; resolves compliance-review A1). `fund-sources.ts` replaces the hard-coded
  `returnClassLabel` with `trackRecordClass` / `preferredClass` / `factsheetClass` / `classLabels`; SEB asks
  monthly-net-returns for `class_code=STRATEGY&history=full` (new `raw.monthlyReturnsFull`, snapshot file
  `monthly-net-returns-full_SEB.json`) and uses it for every month only when the response is class STRATEGY with ready
  months from 2019-02 (`fullHistoryProblem`), else the class H sources (analytics + `class_code=STRATEGY_H` Apex
  months) labelled H. Every month carries its class; a mixed / unknown-class series is withheld (error + alert). New
  `performance.classCode`; validate blocks a label that is not the data's class; `perf-class.ts` relabels legacy
  publications (no classCode: their track-record class) when carried, kept by validate, rolled back or pinned
  (`site.ts`). Factsheet (class H) comparisons skipped with an info issue only on a class mismatch; timing gate kept.
  A class change (H → F) gives one warn + alert instead of a revision per month. Label added to home tiles, the
  strategies index and the growth-chart legend (badges, overview, performance tab, disclosures already had it). The
  sample is built as if the dataplatform change were deployed (SEB = Series F); fixtures default to the server
  deployed today (parameters ignored → H), `fullHistoryRoute` emulates the new one. Tests: `perf-class.test.ts`,
  e2e "performance class label …". Until the dataplatform PR ships, live SEB shows **Series H**. Not merged.

- 2026-10-01 (home, branch `fix/seb-class`): fixes after the independent review of the above.
  (1) Class F only when complete: both candidates are built (class H: analytics + `STRATEGY_H` Apex months + same-class
  factsheet; class F: the `history=full` answer alone) and F is chosen only when ready and continuous from 2019-02
  through max(class H last month, published as-of); a missing month (e.g. the 2026-07 bridge or one CIBC month) falls
  back to class H, labelled H. (2) No flip-flop: once class F is published, a failed / unconfirmed / incomplete F answer
  keeps the class F publication (carried + alert), never class H; F → H only by configuration + an approved run.
  (3) Independent gates: F − H on every common month within `CLASS_SPREAD` (−5 to +30 bp, ±5 bp around the median;
  July 2026 ≈ +11.6 bp), payload `class_display` / `fundserv` = F / LDM201 and the fund register's LDM201 = F (and
  H / LDM202 on the track-record answer when present); a breach withholds (previous publication kept). (4) A class
  change (H ↔ F) is a validation-blocking issue: `validateSite` returns `autoData` (the fund kept at its previous
  publication), auto mode publishes only that, the stored run holds the change and publishing it (admin "approve class
  change & publish", also on the live run) approves it (`RunReport.classChanges` / `classChangesApprovedAt`); such a
  run cannot be pinned before approval. (5) Factsheet class by archive month (`factsheetClass` ranges: SEB ≤ 2026-07
  = F, ≥ 2026-08 = H): only an archive of the series' class is compared / used to fill; in class H mode a missing
  class H monthly table is an error + alert. (6) Analytics SEB June already corrected (above). (7) Fixtures follow
  PR #626 (bridge only 2026-07, `class_display`, `fundserv`, `history`, `rows[].source/method`); e2e also renders SEB
  as Series H (admin test pinning a synthetic class H run, `e2e/fixtures/seb-class-h-site-data.json`, kept in sync
  by `sample-sync.test.ts`). (8) Tiles / index say "Returns: Series X" / « Rendements : Série X »; disclaimers review
  note and compliance A1 updated (pre-launch part of SEB series F). Not merged.

- 2026-10-01 (home): **July 2026 returns block explained** (investigated + independently verified). Not a website bug:
  the August 2026 factsheet archive carries raw `funds_nav_ts` July net returns, known wrong after the CIBC→Apex
  cut-over, because the factsheet generator's NAV+distribution restatement got HTTP 401 from the dataplatform on every
  call (run 2026-09-17) and silently kept the DB values. Analytics `fund_returns.json` July values are the correct
  NAV-based ones (SEST FP, SEB H, Multistrat F). July comes from analytics because dataplatform `monthly_net_returns`
  marks the cut-over month unavailable by design. SEB June: analytics held the Class F value in an otherwise Class H
  history — since corrected to the Class H value (analytics commit `fcdc05a`). Fixes (outside this repo): give the
  generator valid dataplatform credentials, make the restatement mandatory, re-run + republish August. Open (Gabriel/compliance): website
  labels SEB's Class H series "Class F" (`fund-sources.ts` returnClassLabel) — resolved on `fix/seb-class` (above). GMV audience resolved and merged.

- 2026-10-01 (home, branch `fix/gmv-audience`): Gabriel resolved the GMV audience flag — "primarily for family
  offices and also viable for institutions". GMV fund summary (EN/FR) leads with family offices; /solutions lists GMV
  first for family offices and names it in their managed-accounts vehicle (futures-exposure disclosure verbatim);
  `concise-copy.test.ts` pins the new sentence. `funds.ts`, strategies index, home tile, team and approach had no
  audience wording to change. Compliance note marked resolved. Not merged.

- 2026-09-30 (home, branch `feat/concise-copy`): fixes after the independent review of the concise copy — fund risk
  note as a visible body-size callout (`.fxb-risk`), Multi-Strategy and GMV wording restored closer to the reviewed
  text, tobacco sentence de-duplicated, « durée » for duration in French, `role="list"` on `<Bullets>` and `.pg-ticks`,
  fund feature cards balanced (long disclosure cards last and full-width, or paired), equal-height home approach cards,
  Fondaction lead + bullets, French disclosure literals in `concise-copy.test.ts`. Open flag: Solutions lists GMV for
  family offices while the fund page says "for institutional portfolios" (see compliance-review.md). Still not merged.

- 2026-09-30 (home, branch `feat/concise-copy`, from `redesign/v3-keynote-live-data`): **concise copy** after
  Gabriel's "make the website a lot less verbose … more bullet points, short sentences". Home, strategies, solutions,
  approach, sustainability, team (intro, values, milestones, bios to 1–2 sentences), contact and the fund pages' own
  texts (`FUND_TEXTS`: summary, approach as `focus` bullets + `note` risk text, feature section) rewritten EN + FR.
  Body copy on these pages roughly halved (counts in `docs/compliance-review.md` "Concise copy 2026-09-30" and the
  branch report). New kit component `<Bullets>` (`kit.tsx` / `.ticks` in `kit.css`: gradient tick markers, staggered
  `Reveal` behind the `html.js` gate, static under reduced motion, `cols={2}` option). No new claims or figures;
  disclosures inside condensed blocks verbatim, guarded by `tests/unit/site/concise-copy.test.ts` (also checks lead
  length ≤ 15 words, 3–5 bullets ≤ 12 words, bios ≤ 2 sentences). Legal pages, `disclaimers.ts`, `funds.ts`
  descriptions / taglines, the PRI principles and the contact form untouched. Compliance checklist added. Not merged
  into `redesign/v3-keynote-live-data` (auto-deploys): the main session merges after an independent review.

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
  compliance wording (no guarantees/"uncorrelated" as fact, futures-exposure disclosure, PRI naming, Law 25, AMF/OBSI),
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
