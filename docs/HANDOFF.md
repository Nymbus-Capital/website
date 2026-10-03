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
11. **Class series at the dataplatform** (PR #626 `feat/monthly-net-returns-class`, open): deploy it, then run in review mode
   and check that SEB F (LDM201), SEB H (LDM202), Multi-Strategy F and Monthly Income FP match the administrator. Until then the
   endpoint ignores `class_code`: the pipeline treats it as "not served" (info issue) and SEB shows its H series labelled H.
   **Monthly Income F (LDM081) has no class series** (dataplatform `STRATEGY` for SEST is FP): the page opens on "coming soon"
   for F. Needs a dataplatform change (class mapping for SEST F) and a `classSeries` entry in `fund-sources.ts`.
   The home page (other agent) reads the top-level `performance`: for Monthly Income that is still FP's, for SEB it becomes F's.
12. **Rankings / awards**: Morningstar stars not confirmed (pages unreadable when collected): nobody has entered a rating.
   The Fund Library figures are as at 2026-08-31 and edited by hand (*Admin → Funds → awards and rankings*); decide who updates
   them and when the tab is hidden if stale. French category names are our translation (compliance, row F6). Official logos
   are not used: brand assets only with the owners' permission.
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

14. **Content v3** [in progress — sub-agent, 2026-10-02, branch `feat/content-v3`]: approach risk-first + multi-strategy
   diagram, team from nymbus-decks (photos, credentials band), solutions use cases, ESG scoped to SEB, GMV variant labels.

## 6. Session log

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
