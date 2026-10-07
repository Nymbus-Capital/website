# Handoff — shared work log between Claude sessions

This file lets any Claude session (Gabriel's home or office machine) pick up exactly where the last
one stopped. **Read it fully before working; update it before you stop.**

- Owner: Gabriel Cefaloni (gcefaloni@nymbus.ca), Nymbus Capital.
- Working branch: `redesign/v3-keynote-live-data` (Northflank continuous deployment from this branch).
- Live: https://p01--website--ddyc4hjyxx82.code.run (Northflank project `etl`, service `website`).
- Last updated: 2026-10-06 by the home session (cloud workspace): §3 and §5 rewritten, every feature branch merged.

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
- **CI** (`.github/workflows/ci.yml`, every push): unit → typecheck → lint (**blocking**, `eslint.config.mjs`) → format check (**blocking**) → build →
  Playwright e2e (desktop + Pixel 7; admin tests run after public ones) → Docker build.
  Add `[ci-logs]` to a commit message to have CI push logs + screenshots to a `ci/run-<n>` branch
  (useful from sandboxes that cannot download Actions artifacts:
  `git fetch origin 'refs/heads/ci/*:refs/remotes/origin/ci/*'` then `git show origin/ci/run-<n>:ci-out/e2e.log`).
  Those branches can be deleted any time.
- **Visual diff (refactor safety net)**: `e2e/visual-baseline.spec.ts` saves deterministic screenshots of every public
  page (home, strategies, core concepts, approach, sustainability, team, solutions, contact, legal, privacy, each fund
  page full / top / bottom; desktop + mobile; English, reduced motion, animations finished, caret hidden, fonts loaded,
  off-site requests aborted) to `e2e/screenshots/visual/<page>[-top|-bottom]-<project>.png`; three French pages to
  `visual-fr/`; and each animated canvas (home Science at scale and engines band, the three core-concepts panels) with
  motion ON to `visual-motion/`, at a fixed position of Playwright's paused fake clock (`page.clock`: every engine
  starts at the same instant and `runFor(4000)` advances the same frames). The spec fails on a blank canvas. Limit: the
  hero data-field backdrop uses `Math.random` and is not captured in motion. Before a "no visual change"
  refactor: push the base commit with `[ci-logs]`, then the work with `[ci-logs]`, fetch both `ci/run-<n>` branches and run
  `node scripts/visual-diff.mjs <before>/screenshots/visual <after>/screenshots/visual [--max-ratio=0] [--tolerance=0]
  [--out=<dir>]` (no dependencies; exit 1 on any image changed beyond the ratio, resized or missing, 2 on invalid options;
  `--out` writes red masks of the changed pixels). **Refactor proofs use `--max-ratio=0`** (the default): two runs of the
  same commit are byte-identical, so any reported pixel is a real change.
  Extract a run with `git archive origin/ci/run-<n> screenshots | tar -x -C <dir>`.
- **Lint**: blocking, with a warnings ratchet (`--max-warnings` in `ci.yml`, 0 since § 5 B3: no warning may be added).
  Fixing warnings → lower the cap in the same commit; never raise it.
- **Formatting**: Prettier 3 (`.prettierrc`: printWidth 120; `.prettierignore`: the frozen Science-at-scale files, all
  data / fixture JSON except `package.json` and `tsconfig.json`, Markdown, the WordPress plugin, `public/`). CI runs
  `npm run format:check` (**blocking**, after lint); on failure it writes the needed diff to `ci-out/prettier.diff`
  (published with `[ci-logs]`, so a sandbox without `node_modules` can `git apply` it). Locally: `npm run format`.
  The one-time repository pass is listed in `.git-blame-ignore-revs` (`git config blame.ignoreRevsFile
  .git-blame-ignore-revs`; GitHub applies it automatically). Prettier is pinned to an exact version (no lockfile yet), so
  a newer 3.x cannot fail the check on its own; bump it deliberately with a fresh `format` pass.
- **Lockfile**: none is committed (the cloud workspace cannot reach the npm registry). CI resolves one on every run
  (`npm install`), uploads it as the `package-lock` artifact and, with `[ci-logs]`, copies it to the `ci/run-<n>` branch;
  the Dockerfile uses `npm ci` when a lockfile exists. Gabriel or the office session can commit one from a green run.
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

## 3. Current state (2026-10-06)

Everything is merged on `redesign/v3-keynote-live-data` and live. No feature branch is pending.

| Area | Where | State |
| --- | --- | --- |
| Public pages | `src/app/(site)/**`, `src/components/site/**` | home (Science at scale, engines band), strategies, core concepts, approach, sustainability, team, solutions, contact (form sent to the site on branch `feat/contact-form`, mailto on the main branch until merged), legal, privacy, 404; EN/FR |
| Fund pages | `src/app/(site)/strategies/[slug]`, `src/components/fund/**` | 4 funds; every active CAD series with its own returns (§ 5 B1 for Multi-Strategy), awards (Morningstar, Fundata, RBC), disclosures last and collapsed (performance qualifiers visible) |
| Data pipeline | `src/lib/pipeline/**`, scheduler `src/instrumentation.ts` | dataplatform main endpoints only (+ analytics history, factsheet archives); runs 06:45 / 12:45 / 18:45 Toronto with catch-up and one retry; publish mode **review** |
| Monitoring | `src/lib/pipeline/{alerts,monitor,freshness}.ts`, `GET /api/status` | deduped Teams / JSON alerts — **no webhook configured yet** (§ 5 A2) |
| Admin | `src/app/admin/**`, `src/lib/auth/**` | Entra sign-in (nymbus.ca), runs, approve & publish, content, documents, alerts, audit |
| WordPress (editors) | `wordpress/**`, `src/lib/cms/**` | hardened image built and CI-tested, **not deployed** (§ 5 A3); without `WP_BASE_URL` the site uses its coded content |
| Code quality | `eslint.config.mjs`, `.prettierrc`, `e2e/visual-baseline.spec.ts`, `scripts/visual-diff.mjs` | lint blocking (warnings ratchet), visual baseline diff for no-change refactors |

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
- 2026-10-04: **fund-page disclosures last** (below the call to action and the other strategies, just above the footer).
  **No simulated counters on the home animations** (Science at scale, engines band): remove rather than replace, no
  invented "real metrics". **Engines band = traditional markets (equities above bonds, moving together in down months)
  vs our strategies (low down-month correlation with both and with each other).**

## 5. Open items (claim before starting)

History of the items closed before 2026-10-06: § 6 and `git log`.

### A. Gabriel (needs an account, a credential or a decision)

1. **Compliance review** of `docs/compliance-review.md`, then "mark as reviewed" in admin. Priorities: P1 ("protective"
   overlays), P3 (Morningstar disclosure behind an info note) and Morningstar "out of N funds", RBC gross-of-fees basis,
   D1 (collapsed disclosures), AC1–AC6 (series figures, "—" months, 12-month minimum), CC / V rows.
2. **Alerts**: Teams channel webhook (Workflows "Post to a channel when a webhook request is received") into
   `PIPELINE_ALERT_WEBHOOK` (`website-secrets`), restart, "send a test alert"; an external uptime monitor on
   `<PUBLIC_URL>/api/status?strict=1` (`docs/deploy.md` § Alerts).
3. **WordPress deployment**: `docs/deploy.md` §5 steps 1–8 (MySQL addon, uploads volume, Entra app "Nymbus WordPress",
   secret group, service, install + emergency admin, editors, connect the website). Claude then does steps A–C (checks,
   `wp nymbus import`, verify) and the first real Entra round trip; check that Apache logs the visitor address.
4. **Dataplatform team** (the coordinator holds the details, not kept in this public repository): source defects listed
   by the runs (month-end bad prints, inconsistent distribution adjustments between series, duplicate Apex records and a
   NAV seam at the switch to Apex, missing valuation days); a
   distributions endpoint on main (USD series, distribution yields); `nav-timeseries` loads the whole legacy table per
   call (the 4 GB service ran out of memory under ~20 parallel calls — the website now calls one at a time); record
   the website as a read-only consumer (dataplatform CLAUDE.md).
5. **Custom domain** `www.nymbus.ca` (`docs/deploy.md`), then switch off GitHub Pages.
6. **Admin to fill** (shown only when filled): minimum investments, RSP eligibility, CIFSC category, managers, fees /
   MER, documents (fund facts, prospectus, proxy voting, tax factors); rankings: eVestment / LSEG Lipper / GMR figures
   with their sources.
7. **Repository chores** the sandbox cannot do: commit a lockfile from a green CI run (`package-lock` artifact); delete
   the old `ci/run-*` branches (`git push origin --delete …`, keep the last ten).

### B. Development (Claude or a developer)

1. [done 2026-10-06, branch `feat/multi-fee-fit`, not merged] **Multi-Strategy series checks**: the cross-class fit has
   separate up / down slopes (`src/lib/pipeline/class-fit.ts`, docs/architecture.md: sides decided on the full sample, a
   short side at slope 1 or not checkable, a damped / normalised fixed point that must settle). After the merge, check the
   live Multi-Strategy months in admin (a fee-free class with fewer than 6 down months has its down months withheld).
2. **Readability** — split done on branch `refactor/split-modules` (not merged, 2026-10-06): `build.ts` →
   `src/lib/pipeline/build/` (entry `index.ts`; `context`, `helpers`, `factsheets`, `register`, `series`, `track-record`,
   `benchmark`, `performance`, `net-performance`, `factsheet-performance`, `nav`, `factsheet-parts`, `daily-book`,
   `class-series`, `variants`, `fund`, `site`); `validate.ts` → `src/lib/pipeline/validate/` (`performance`, `nav`,
   `portfolio`, `distributions`, `site`, `helpers`); FTSE level code out of `metrics.ts` into `index-levels.ts`;
   `components/fund/lib/data.ts` → `performance`, `growth`, `heatmap`, `portfolio`, `distributions`, `documents`,
   `visibility`, `facts`, `is-num`; Contact.tsx imports `components/motion/motion` (shim deleted), `contact.copy.ts`.
   Prettier pass done on branch `chore/prettier` (not merged, 2026-10-06; § 2 Formatting). Remaining: `class-returns.ts`
   (≈ 500 lines) left whole while B1 changes it; `fund.copy.ts` and `data/types.ts` (≈ 530 lines each) are copy / the
   data contract and read best in one file; references to `build.ts` in `config.ts` comments left (CLASS_CHECKS is being
   changed on another branch).
3. **React Compiler readiness** — done on branch `chore/react-compiler-warnings` (not merged, 2026-10-06): the 25 lint
   warnings (`react-hooks/refs`, `set-state-in-effect`, `immutability`) fixed with no rendered change, CI cap 25 → 0.
   Patterns: values derived during render (Breakdowns arc starts, Nav closes on a path change, Tip keeps the last tip,
   Odometer decides its roll once), browser values read after hydration through `useMountValue` /
   `useNoObserver` (`useSyncExternalStore`, `components/motion/motion.tsx`), language refs synced in a layout effect
   (ConceptPanel, overlay), no ref written during render (Team bio, Contact steps, chart `hostRef`). The frozen
   AnalysisScan still writes its language ref during render: one `eslint-disable react-hooks/refs` line right before
   `export function AnalysisScan()` (outside the hashed slice, covers only the panel to the end of fx.tsx).
4. **Known source gaps** (no workaround on main endpoints): distributions, `short_corp` before 2024-12, GMV live
   variants (factsheet), ESG metrics and Multi-Strategy allocation (factsheet), month-end duration / yield.
5. Nice to have: ~~contact form backend~~ [done 2026-10-06, branch `feat/contact-form`, not merged: `POST /api/contact`
   (JS + no-JS), messages on the data volume, `/admin/inquiries` (messages: mark handled, delete, CSV export, open count
   on the dashboard), duplicate suppression, retention set in admin settings (default 180 days, 30–180), Teams alert with
   first name + profile only; "I am" = advisor / institution / individual investor / other; privacy § 11 and
   `docs/compliance-review.md` CF1–CF8 to review; independent security review done 2026-10-06, findings M1, m1–m7 fixed; Gabriel: set the volume backup retention to ≤ 30 days and check the X-Forwarded-For log line after deploy (`docs/deploy.md` § Contact form)], ~~team LinkedIn in the team modal~~
   (already rendered from `team.ts` / WordPress `linkedin`, e2e-tested), fund managers from WordPress, News in the
   navigation.

## 6. Session log

- 2026-10-06 (sub-agent, branch `chore/prettier`, **not merged**): § 5 B2 — one Prettier 3.9.9 pass over the repository
  (`style: Prettier over the repository (no code change)` `84f3ff5`, 378 files, + a 3-file second pass `3d802d3` where
  Prettier is not idempotent; both in `.git-blame-ignore-revs`), produced in CI (temporary step, run 278) and applied
  locally. `.prettierignore`: frozen scan files (fx `scan-model/engine/copy.ts`, `fx.tsx`, `fx.css`, `home/Home.tsx`),
  data / fixture JSON, Markdown, `wordpress/plugins/`, `public/`. Permanent blocking `npm run format:check` in CI
  (writes `ci-out/prettier.diff` on failure); `format` / `format:check` scripts; prettier pinned (no lockfile).
  Hand fixes in their own commits: four source-text unit tests made whitespace tolerant; three `eslint-disable`
  comments re-anchored; the Overview Returns lead keeps its ` · ` in one text node (`{" · "}`: Prettier's `{" "}` split
  shifted the glyph by 8 px on the GMV page). Visual proof: base run 277 (empty `[ci-logs]` commit on `f6da169`; equal
  to run 275) vs run 282 (`bd02aa3`), `--max-ratio=0`: visual 44, visual-fr 6, visual-motion 10, all byte-identical.
  Prettier's `{" "}` also splits ~45 other JSX text nodes (admin pages mostly, not covered by the visual set; no other
  pixel moved on the public pages). Branch `chore/prettier-base` (baseline only) can be deleted.

- 2026-10-06 (sub-agent, branch `feat/contact-form`, fourth pass; **not merged**): rebased on
  `chore/react-compiler-warnings` (Contact uses `useMountValue` and one ref per step, no lint disable; lint cap 0).
  Independent security review (coordinator, on `e940b62`): no blockers; every finding fixed — M1 limiter: IPv6 bucketed
  by /64, IPv4 per address, LRU eviction past 5 000 buckets instead of a shared overflow bucket (unit tests: overflow,
  IPv6 rotation); m1 one-time X-Forwarded-For shape log (first 10 posts: hop count + classes, never addresses) and how to
  verify it on Northflank (`docs/deploy.md`); m2 `AlertMessage.logTitle`: logs and the stored alert state say "New
  website inquiry" (no first name; tested on a failed delivery); m3 purge deletes within a day of the limit (so "no
  later than 180 days" holds), removes orphaned `*.tmp` older than 1 h, privacy § 11 EN/FR one sentence on backups
  (≤ 30 more days; set the volume backup retention accordingly), Teams-history point in CF7; m4 site-wide cap refunded
  for duplicates and failed writes; m5 token max age 24 h, "not a CAPTCHA" documented; m6 one summary live region
  ("Please check: …") + aria-describedby per field, no-JS redirect carries field codes only
  (`?error=invalid_input&fields=phone`) and shows the per-field messages (e2e); m7 www ↔ apex must redirect to
  `PUBLIC_URL` (`docs/deploy.md`).

- 2026-10-06 (sub-agent, branch `chore/react-compiler-warnings`, **not merged**): § 5 B3 — lint warnings 25 → 0, CI
  `--max-warnings=0`; the frozen AnalysisScan keeps its render-time language ref under a region disable placed outside
  the hashed slice. Visual proof: baseline run 264 (empty `[ci-logs]` commit on `5b2f067`) vs the final run,
  `scripts/visual-diff.mjs --max-ratio=0` vs run 268 (`7787479`): visual 44, visual-fr 6, visual-motion 10 images,
  all byte-identical (0 changed).
- 2026-10-06 (sub-agent, branch `feat/multi-fee-fit`, **not merged**): § 5 B1 — the cross-class fit of a class is
  a + b⁺·max(m, 0) + b⁻·min(m, 0) (`class-fit.ts`: Theil–Sen per side, each slope clipped to [0.6, 1.4]). After the
  independent review: side kinds decided on the full sample and kept in every leave-one-out fit; a side with < 6 months is
  never pooled with the other — slope 1 when the other side is within 0.10 of 1, else its months are withheld ("not
  checkable"); fits iterated to a fixed point (damped, decaying step, normalised median a → 0 / slopes → 1, tolerance 0.01 %
  at ±10 %, ≤ 400 rounds; unsettled → checked months withheld for the fund); second leave-out pass without the class's
  other first-pass breaches. Verifier round: stability rule of the second pass (`robustResiduals`: an unstable class keeps
  its first-pass verdicts; a cleared breach stands unless another on the same side is confirmed); a class-month whose other
  classes are all not checkable that month is not checkable (no slope-1 fallback next to fitted classes). Stress scripts
  (20 random 30-month funds per row, ±0.6/0.8/1.0 % errors, 4 classes, 5 target months): misses 0 / 0 / 5 / 2 / 0 / 2 of
  2 400 at 3 / 5 / 6 / 7 / 8 / 11 down months (two-error: 0 / 0 / 4 / 1 / 0 / 2), every one a ±0.6 % error in a deep
  down month (the residual tolerance's noise floor); every month as target at ±0.8 / 1.0 % (10 funds, 4 800 cases per
  row, single and two-error): 0 misses at 6 / 7 / 8 / 11; never an unsettled fit; result independent of class order
  (720 permutations × 3 scripts); ≈ 150 ms for 6 classes × 60 months.
  Sample data messages regenerated (same withheld months).
- 2026-10-06 (sub-agent, branch `refactor/split-modules`; **not merged**): § 5 B2 split by responsibility with no
  behaviour or visual change — functions moved verbatim (checked line by line against the originals), public exports kept
  through `build/index.ts` and `validate/index.ts`, pipeline output on the fixtures byte-identical, `npm test` green;
  Contact.tsx shim and `contact.copy.ts` done. Visual proof: run 252 (base `d62a263`, pushed to the helper branch
  `refactor/split-modules-base` because the branch's own baseline run was cancelled by the next push) vs run 253
  (`239f4e9`): `scripts/visual-diff.mjs --max-ratio=0` → 44 + 6 + 10 images (visual, visual-fr, visual-motion), all
  byte-identical. Run 253 green (its first attempt failed only on the flaky WordPress smoke check "login page offers
  Sign in with Microsoft"; nothing under `wordpress/` changed; the re-run passed). The helper branch can be deleted.

- 2026-10-06 (sub-agent, branch `feat/contact-form`, third pass; **not merged**): contact form brought to the brief.
  "I am" choices = financial advisor / institution (family offices in its description) / individual investor / other
  (step "Profile"); the Teams / JSON notice carries the **first name** and profile only ("New website inquiry: <first
  name> (<profile>)" + admin link); retention is an admin setting `inquiryPolicy.retentionDays` (default **180**, clamped
  30–180 because privacy § 11 now says "no later than 180 days"), purged by the existing 12-hour retention timer (kept
  separate from the pipeline scheduler, which `PIPELINE_SCHEDULE=off` stops) and on every admin listing; honeypot /
  timing screen extracted to `screenSubmission` (unit-tested). Privacy § 11 EN/FR updated (first name, profile list,
  180 days); compliance CF2 amended, CF6 (individual investors), CF7 (Teams notice), CF8 (retention) added. Decisions
  kept from the earlier passes: no zod in the shared rule module (plain-Node tests, browser bundle), native no-JS post
  with 303 back (mailto stays as the alternative and as the fallback on failure), in-memory per-client limiter (single
  instance). Phones: the send button takes its own row above "Back" (« Envoyer mon message »
  overflowed half a row; e2e checks it fits). CI run 272 green; independent review done in the fourth
  pass.

- 2026-10-06 (sub-agent, branch `feat/contact-form`; **not merged**): § 5 B5 contact form backend, no e-mail service and
  no new credential or env var. The three-step form (unchanged design) now posts to `POST /api/contact` (JSON with
  JavaScript; native urlencoded post + 303 back to `/contact?sent=1|error=<code>` without), with a required consent tile
  (link to /privacy), sending / sent / error states (error keeps the form and offers a prepared mailto:), an aria-live
  status and focus on the result. Guards (`src/lib/contact/`): same origin (Origin/Referer = `PUBLIC_URL`,
  Sec-Fetch-Site), 5 attempts / 15 min per client (rightmost non-internal X-Forwarded-For), 16 KB, strict shared field
  rules (pure module, no zod, so `npm test` stays install-free), honeypot + HMAC form timing token (≥ 3 s, ≤ 7 days;
  bots get a fake 200), 40 stored / hour site-wide, 5 000 cap. One JSON file per inquiry (`inquiries/<id>.json`), no IP
  kept, purged 12 months after receipt (12-hour timer + every admin listing). Admin `/admin/inquiries` (rail item):
  newest first, filter, mark handled / open, delete; audit `inquiries.view` (count), `inquiry.handled|reopened|delete`
  (id only). Privacy policy § 11 added (flagged for review), compliance CF1–CF4. Team LinkedIn: already in the bio
  dialog, nothing to do. Word budget for /contact 295 → 305 (consent + states). Second pass (same day, sub-agent): an
  identical message within 24 h is answered OK but stored / alerted once (check + cap + write under the `inquiries`
  lock); admin renamed "messages" (route unchanged), CSV export (`/api/admin/inquiries/export`, formula cells
  neutralised, audited `inquiries.export`), open-message count on the dashboard, alert "New website message from …";
  focus moves to the first field to fix; e2e: French success, focus, duplicate, CSV; `docs/deploy.md` § Contact form
  (nothing to configure), compliance CF5 (export). Judgement calls: no zod (shared browser / plain-Node module), "I am"
  kept as the page's four investor types (individuals under "Other"), in-memory per-client limit (single instance).
  Independent adversarial review by separate reviewer agents still to run (none available to the sub-agent; self-review
  only).

- 2026-10-06 (sub-agent, branch `feat/multi-fee-fit`, **not merged**): § 5 B1 — the cross-class fit of a class is
  a + b⁺·max(m, 0) + b⁻·min(m, 0) (`class-fit.ts`: Theil–Sen per side, each slope clipped to [0.6, 1.4]). After the
  independent review: side kinds decided on the full sample and kept in every leave-one-out fit; a side with < 6 months is
  never pooled with the other — slope 1 when the other side is within 0.10 of 1, else its months are withheld ("not
  checkable"); fits iterated to a fixed point (damped, decaying step, normalised median a → 0 / slopes → 1, tolerance 0.01 %
  at ±10 %, ≤ 400 rounds; unsettled → checked months withheld for the fund); second leave-out pass without the class's
  other first-pass breaches. Verifier round: stability rule of the second pass (`robustResiduals`: an unstable class keeps
  its first-pass verdicts; a cleared breach stands unless another on the same side is confirmed); a class-month whose other
  classes are all not checkable that month is not checkable (no slope-1 fallback next to fitted classes). Stress scripts
  (20 random 30-month funds per row, ±0.6/0.8/1.0 % errors, 4 classes, 5 target months): misses 0 / 0 / 5 / 2 / 0 / 2 of
  2 400 at 3 / 5 / 6 / 7 / 8 / 11 down months (two-error: 0 / 0 / 4 / 1 / 0 / 2), every one a ±0.6 % error in a deep
  down month (the residual tolerance's noise floor); every month as target at ±0.8 / 1.0 % (10 funds, 4 800 cases per
  row, single and two-error): 0 misses at 6 / 7 / 8 / 11; never an unsettled fit; result independent of class order
  (720 permutations × 3 scripts); ≈ 150 ms for 6 classes × 60 months.
  Sample data messages regenerated (same withheld months).
- 2026-10-06 (sub-agent, branch `refactor/split-modules`; **not merged**): § 5 B2 split by responsibility with no
  behaviour or visual change — functions moved verbatim (checked line by line against the originals), public exports kept
  through `build/index.ts` and `validate/index.ts`, pipeline output on the fixtures byte-identical, `npm test` green;
  Contact.tsx shim and `contact.copy.ts` done. Visual proof: run 252 (base `d62a263`, pushed to the helper branch
  `refactor/split-modules-base` because the branch's own baseline run was cancelled by the next push) vs run 253
  (`239f4e9`): `scripts/visual-diff.mjs --max-ratio=0` → 44 + 6 + 10 images (visual, visual-fr, visual-motion), all
  byte-identical. Run 253 green (its first attempt failed only on the flaky WordPress smoke check "login page offers
  Sign in with Microsoft"; nothing under `wordpress/` changed; the re-run passed). The helper branch can be deleted.

- 2026-10-06 (home session): feat/cleanup, feat/automation, feat/wp-ready merged and pushed (CI green on each,
  reviewed); §3 / §5 rewritten (every branch listed as "not merged" was merged); merged local branches and worktrees
  deleted.

- 2026-10-05 (sub-agent, branch `feat/cleanup` from `redesign/v3-keynote-live-data`; **not merged**): code cleanup with no
  rendered change ("keep the looks and feel … beautiful code that's easy to read"), proven by the visual diff (every page
  byte-identical to the baseline run 232). (0) visual baseline spec + `scripts/visual-diff.mjs` (see § 2). (1) ESLint flat
  config (Next core web vitals + TypeScript), lint blocking in CI; `.prettierrc` (120 columns) and `.editorconfig` — **no
  repository-wide reformat yet** (later pass). React Compiler readiness rules (`react-hooks/refs`, `set-state-in-effect`,
  `immutability`) are warnings: the flagged patterns are deliberate and changing them is not a no-visual-change refactor.
  (2) Unused dependencies removed (framer-motion, recharts, gsap, @gsap/react, clsx, tailwind-merge). (3) Dead exports deleted
  (ScreenSwap, team helpers, fundSources, bucketsTotal, morningstarSlots, …), 199 file-local symbols un-exported, the
  legacy `.in` reveal class dropped. (4) One `Locale`, one bilingual `L` and one `tr` (src/lib/i18n/config.ts); motion's
  CountUp uses `fund/lib/format` `fmt`; `ym` / `monthsBetween` in `src/lib/data/dates.ts` (client code may import it),
  pipeline `pct` in `src/lib/pipeline/format.ts`; canvas kit (`draw-kit`, `runner`, `timeline`) in
  `src/components/site/canvas/`, used by the home engines band too. (5) The two `.fx-chip` rules are scoped with `:where()`
  (no added specificity). (6) Copy files renamed `<page>.copy.ts`; motion primitives in `src/components/motion/motion.tsx`;
  dated owner notes moved from code comments to `docs/architecture.md` § Decision log. (7) Pipeline tests build the
  unaltered fixtures once per file (`npm test` ≈ 131 s → 88 s) through `tests/fixtures/pipeline/memo.ts`, which refuses
  to serve a baseline while a test has the pipeline config mutated.
  **Review fixes (2026-10-06)**: the < 12 months test no longer poisons the memoised build; `visual-diff.mjs` defaults to
  `--max-ratio=0`, validates options (exit 2), rejects corrupt filter bytes / unsupported tRNS, works from paths with
  spaces (unit-tested in `tests/unit/scripts/`); visual spec adds FR pages, motion captures and blank-canvas checks;
  `e2e/soft-nav-css.spec.ts` proves the `.fx-chip` fix — **intended behaviour after a soft navigation home → fund → home:
  the tile chip stays 26px and the fund chip 30px** (before the `:where()` scoping, whichever stylesheet loaded last won
  on both pages); lint warnings ratchet; `fund/lib/format` `ym` → `parseYmd`; `build.ts` short record fixed
  (`isShortRecord`: fewer than 12 inclusive months; it double counted with `+ 1`, so an 11-month record lost its "since
  class inception" note); `L10n` alias removed (`src/lib/rankings/policy.ts` uses `L`), `rankings-copy.ts` →
  `rankings.copy.ts`, `inquiry.ts` uses `Locale`. Still open: Contact.tsx imports the one-line shim
  `src/components/v3/motion.ts` and `copy-contact.ts` keeps its name (both need an edit of Contact.tsx, which another
  branch changes); `scan-copy.ts` keeps its name (frozen); `run.test.ts` not sped up (every test runs a full pipeline
  run on its own temp volume, nothing to share); split the big files and run the formatter. **Could not delete the stale `ci/run-*` branches** (the sandbox proxy refuses ref deletion, HTTP 403):
  Gabriel can run `git ls-remote origin 'refs/heads/ci/*'` and `git push origin --delete <ci/run-n …>` for all but the
  last ten.

- 2026-10-05 (sub-agent, branch `feat/automation` from `redesign/v3-keynote-live-data`; **not merged**): automation /
  monitoring. `src/lib/pipeline/alerts.ts` (format detection Teams / JSON, Adaptive Card payload, delivery with 4 attempts
  and backoff, dedup state `alerts/state.json`, `raiseAlert` / `resolveAlert` / `announceNew`, admin channel status);
  `run.ts` `notifyRun` replaces the old per-run alert (attention = failed / blocked / pending-review; fingerprint = status +
  masked error issues + review / class-change funds; daily reminder; "Resolved"; notices once; dry runs silent);
  `schedule.ts` catch-up after boot (`catchUpDue`: a slot passed since the last run, ≥ 1 h since it, next slot ≥ 45 min away
  — judgement: the brief's "> 7 h since the last run" alone would miss a redeploy just after a slot and would run at night),
  one retry 30 min after a source outage (`retryWanted`), monitor every 30 min and after runs; `freshness.ts` (pure verdict)
  + `monitor.ts` (`siteStatus`, stale-data alert) + `GET /api/status`; rankings `rankingExpiries` (dashboard warn issue 30
  days ahead) + `expiry-alert.ts` (webhook once per entry / phase, from the 6-hourly rankings tick); RBC alert through the
  shared delivery (alertedFor kept only when delivered); dashboard `AlertsPanel` (+ `POST /api/admin/alerts/test`). No
  email (no mail path exists). Tests: `alerts`, `freshness`, `monitor`, `schedule` (catch-up / retry / runtime wiring),
  `run` (run alert dedup, Teams format, failed delivery), `rankings/expiry`; e2e: alerts panel off, `/api/status`. Docs:
  deploy (alerts, Teams how-to, status + monitoring), architecture § Monitoring and alerts. Publishing gates unchanged.
  **Review fixes (2026-10-06)**: retry after a slot run now happens (next slot armed before the run); review mode — clean
  waiting runs are not problem alerts, "N runs waiting for approval" at most daily and only with new data, `publishRun`
  settles the alerts, freshness has no publication-age rule (performance threshold 15 business days, NAV = oldest class);
  `/api/status` public payload reduced to ok / verdict / checkedAt / lastPublishAt / stale codes / per-fund as-of of
  shown blocks (ops details on the dashboard; strict 503 no-store); hidden blocks skipped; "Resolved" after 2 clean runs;
  dry runs ignored by the catch-up, second check ~35 min after boot; Toronto date for rankings expiry; RBC alertedFor
  only on delivery; test alert one attempt, outside the queue, one a minute; https webhooks only; environment label in
  titles; Teams Markdown escaped; hosts stripped from alert lines.

- 2026-10-05 (sub-agent, branch `feat/wp-ready` from `redesign/v3-keynote-live-data`; **not merged**): WordPress side made
  deployable (open item 20). `wordpress/Dockerfile` pinned + checksummed downloads, `docker/apache-security.conf`,
  `docker/wp` (WP-CLI as www-data), `mu-plugins/nymbus-security.php` + `nymbus-lib/security.php` (pure, tested by
  `wordpress/tests/security-test.php`), `nymbus-headless.php` (file mods / updates / app passwords off). Plugin 1.1.0:
  Site texts gain section headings, multi-line address (`lines`), "Page intros" (`intro_<page>_headline|highlight|lead`,
  Sustainability lead locked: ESG scope qualifier), `wp nymbus import <file|https URL|->` (`--dry-run`, `--update`,
  `--status`, `--photos`; never deletes; editor sanitiser). Website: `src/lib/cms` `pageIntros` (types / validate),
  `contactOverrides`, `telHref`, `oneLine`, `introCopy` (per language; no intro = the coded object itself); Footer,
  SiteShell, layout, /contact, Approach, Solutions, Sustainability, Team take optional props. Tests: unit
  `tests/unit/cms/intros-contact.test.ts`, `import-export.test.ts`; PHP checks; e2e `cms.spec.ts` (WordPress values +
  "without WP_BASE_URL exactly as before"); CI step "WordPress image smoke test". Docs: `wordpress/README.md` (security,
  updating, who edits what, how to add a field, env table), `docs/deploy.md` §5 (who does what), `docs/architecture.md`.
  Not done: independent adversarial review (no sub-agents available in this session).

- 2026-10-05 (sub-agent, branch `feat/collapsible-disclosures` from `redesign/v3-keynote-live-data`; **not merged**): Gabriel's
  request "all the disclosure in the websites … smaller divs that have a fade out towards the end and a static arrow that shows
  that this box can be expanded". New `src/components/site/Disclosure.tsx` (+ pure `disclosure-logic.ts`, unit-tested in
  `tests/unit/site/disclosure.test.ts`; CSS at the end of `kit.css`): blocks of ≥ 420 characters (`DISCLOSURE_MIN_CHARS`, decided
  on the server from the text, so the collapsed box is the SSR default and nothing moves on hydration) are clipped to
  `--disc-max` (9 rem) with a mask fade and a static chevron button (`aria-expanded` / `aria-controls`, "Show full text" /
  « Afficher le texte complet », "Show less" / « Réduire ») centred on the bottom edge; click / Enter / Space / click on the box
  open it (max-height animation, none under reduced motion). If the text fits the collapsed height (wide screens) the box shows
  no fade and no arrow (`data-disc="fits"`, no height change); shorter blocks render as before (`data-disc="plain"`,
  `display: contents`). Full text always in the DOM (clip, never display:none / aria-hidden); collapsed style only under the
  head script's `.js` class → **no-JS = everything open**; print opens everything; a scroll of the clip (find-in-page, focus,
  scrollIntoView) opens the box; `anchors` hashes (`#disclosure`, `#disclaimers`) or an id inside the box open it on load,
  hashchange and same-hash link clicks. Used on: fund-page Disclosures (`fund-disclosure`), footer (`footer-disclosure`; grid
  moved to `.footer-disc-body`), Performance → Notes, Awards notes, /strategies notes, /solutions notes, /approach overlay
  footnotes. Not used (judgement): /legal, /privacy, animation figcaptions, Morningstar info note, one-line notes.
  e2e `e2e/disclosure.spec.ts` (desktop + mobile; screenshots `disc-fund-collapsed|fund-expanded|footer-collapsed-<project>.png`).
  Compliance rows D1–D3 (**D1: regulator / compliance to confirm the prominence of collapsed disclosures**). Not done:
  independent adversarial review (could not be spawned from the sub-agent).
  **Independent review fixes (same day)**: fund page — the sample notice, performance note, series / basis line and returns
  paragraph stay outside the box (only the boilerplate after them collapses); Performance notes, awards notes, /strategies,
  /solutions and /approach notes unwrapped again (qualifiers / short); collapse decided on the **English** length (`en` prop,
  threshold 600) so both languages match; no box can fit today (unit-tested estimate), "fits" is a plain-looking fallback
  (no border / fade / arrow, padding kept: no shift); any same-page link to the anchor, popstate and pathname changes (Next
  soft navigation) open the box; find-in-page limitation (match in the faded strip) documented in D2. e2e: soft navigation,
  link inside a box, 360 px overflow.

- 2026-10-05 (sub-agent, `feat/disclosures-engines`, independent review fixes; **not merged**): FR legend
  « Mois de baisse des actions » no longer ellipsised on phones (narrow: full width for the down-month key);
  "generated" back on the canvas, on the market group header ("Traditional markets · generated" / « Marchés
  traditionnels · générés »); lead one sentence ("…in down months, with traditional markets and with each other.");
  **down months = clear equity falls** (`DOWN_CUT` ≈ −0.5σ of the monthly equity move, ≈ 26 % of months; bands, highlights and
  the heatmap all use `Month.down`), heatmap window 240 → 360 months (≈ 95 down months); hedging / overlay `REACT` 0.12/0.10 →
  0.2/0.2 (down-month ρ vs equities ≈ −0.36, vs bonds ≈ −0.25, still |ρ| < 0.25 vs every other strategy; tested); per-window
  ceiling for the heatmap as shown (seed 0, months 300–1500, max |ρ| < 0.4); accessible name mentions the heatmap and says
  "designed to … drawn moving independently"; layout test covers 699–760 px; e2e: FR figure screenshot
  (`engines-fr-<project>.png`) and tall viewport so phone screenshots keep the footer. Note: the counters code in
  `scan-engine.ts` (`opts.counters`, `counters()`) is now **dead but kept on purpose** — Science at scale is
  fingerprint-frozen (`tests/unit/site/scan-frozen.test.ts`); remove it only together with a hash update and its reason.
- 2026-10-04 (sub-agent, branch `feat/disclosures-engines` from `redesign/v3-keynote-live-data`; **not merged**): Gabriel's two
  requests. (1) **Fund pages**: the disclosures block (`#disclosure`, text unchanged) is now the last block of every fund /
  strategy page — after the call to action and the other strategies, immediately above the site footer (`FundPage.tsx`);
  `e2e/fund.spec.ts` asserts the order on each page and saves `fund-<slug>-bottom-<project>.png`. (2) **Home engines band**:
  a generated **equity** line above the bond line, grouped under "Traditional markets" / « Marchés traditionnels », with
  "Our strategies" / « Nos stratégies » below (four strategies, the protective overlay, then the blended line, which moved
  from the top band to the bottom of the strategies group). Down months now key off equities ("Equity down month"; equities
  fall deeper than bonds; bonds fall in ≈80 % of them). Down-month correlation: equities–bonds ≈ 0.7; every strategy vs
  equities, bonds and each other |ρ| < 0.25 over the long run (hedging / overlay mildly negative, ≈ −0.15), unit-tested on
  three seeds (`tests/unit/site/overlay.test.ts`); heatmap 7×7 with a hairline between the two groups, window 240 months
  (steadier picture). Counters strip removed from the engines band **and** from Science at scale (its four "Simulated …"
  counters and the caption sentence about them; fingerprint hashes updated with the reason, nothing else changed). Canvas a
  little taller instead (desktop clamp 460–600 px, phone 760 px). Lead "Strategies designed to have low correlation in down
  months. With traditional markets and each other."; caption adds "Market lines are not an index." Compliance rows updated
  (`docs/compliance-review.md`, engines band). Not done: independent adversarial review (the sub-agent had no way to spawn
  reviewers).
- 2026-10-05 (sub-agent, last): second verifier's fixes. Cross-class reference is now leave-CLASS-out (median of the other
  fitted classes, each mapped through its own fit; young classes never in it): the class carrying an injected error is the one
  withheld, never a correct fee-free class (verifier's panels as tests). Track record: monthly-net-returns months are the same
  Apex NAVs as the chain, so defect months there are replaced by the analytics official figure or withheld (newest month held);
  the track class's own lone failures and newest-month hold feed it too (test: a reversed print on the newest month's last day,
  monthly-net-returns matching, no factsheet → not published). Relaunch by reset-to-10 needs a gap > 30 days. Funds new to a live
  site are gated; two-class funds documented as a limit (a wrong value can pass when the two classes have different slopes — none today; would need a pairwise fit). 2026-10-05 (main session): a class with no fit next to fitted classes is withheld until it has one (verifier finding 2).

- 2026-10-05 (sub-agent, latest): fixes of the independent review. B1 leave-one-out Theil–Sen fit (an error in the fund's
  strongest month no longer bends its own expectation). M1 bad-print check over every row fetched; the newest month waits for one
  later valuation day. M2 months withheld for every class leave the track record where it took them from its own NAV chain (the
  official analytics / monthly-net-returns figure is used instead when one exists, else the month is withheld), warned. M3 the
  cut-over bridge must equal the class's compounded daily returns; the cross-class check uses published values. M4 the track
  record's SI reads "Since track-record start (<month>)" with no series inception next to it; series table "Series launch". M5
  live-data specifics removed from the docs. Minors: relaunch only when corroborated (NAV jump > 5 %, reset to 10.00 or gap > 180
  days; warn), else a coverage gap; classes without a fit (< 12 months) withheld alone; a partial month in an adjustment month →
  every class; risk window "From <first complete month>"; partial month marked in the heat map; growth from the inception day;
  withheld header badges "—"; classInfo in register order; new classes gated without a previous performance; YTD from a complete
  January; history fallback `historyFrom`.

- 2026-10-05 (sub-agent, later): cross-class rule refined after the coordinator ran the rules on live data (a flat band withheld
  every class of a fund for one broken class, and for a fee-free class's legitimate spread in strong months). Now: per
  class fit r ≈ a + b × median (OLS + one trimming pass — since replaced by leave-one-out Theil–Sen —, b ∈ [0.6, 1.4], |a| ≤ 0.30 %, fallback a=0 b=1 under 12 months), breach
  = residual > 0.40 % (`residualMax`); a breach in a month with a distribution / price-adjustment day (return vs NAV ratio > 0.10 %,
  `adjustmentMin`) → every class; else a lone breaching class with ≥ 2 consistent others → that class only; else every class.
  Spike rule and partial-month handling unchanged. Fixture: Multi-Strategy class A off alone in 2025-05 (withheld alone).

- 2026-10-05 (sub-agent, branch `feat/all-classes`; not merged): review of the 2026-10-04 work against the brief. Cross-class rule
  aligned with the brief: over the classes with a COMPLETE month (partial first months outside the median) ANY class beyond
  max(0.50 %, 0.25 × |median|) withholds the month for EVERY class of the fund (was: the outlier alone when a strict minority);
  a partial inception month is compared over its own days and withheld alone. The daily-dispersion check (not in the brief) is
  removed: a one-day mismatch offset within the month leaves the month consistent, and it risked withholding every December
  (performance-fee crystallisation) for every class. Fixtures: Monthly Income class I drifts +0.9 % in 2023-09 (monthly), the
  2025-03 drifts are gone (MI F, SEB F/I clean). Page: since-inception rows of a class read "Since inception (Oct 5, 2021)".

- 2026-10-04 (sub-agent, branch `feat/all-classes` from `redesign/v3-keynote-live-data`; not merged): Gabriel's request "make sure
  that all classes' returns are populated with data coming from dataplatform … for our 3 funds … inception date of each class = first
  date when there are prices". New pure engine `src/lib/pipeline/class-returns.ts`: inception = first NAV of the class's current run
  (gap > 10 days = previous life; `FUND_SOURCES.classFloor`; a run starting at the first day read = unknown),
  months from the inception (partial first month from the inception NAV, the inception day's own return never used; CIBC stored /
  bridge / Apex distribution-aware, reusing daily-chain.ts), and the defect checks of `CLASS_CHECKS` (config.ts): bad valuation print
  (opposite daily moves ≥ 2 %, combined ≤ half the smaller → both months, every class), daily dispersion between classes
  (> max(0.40 %, 0.5 × |median|) → month, every class: the majority may be wrong), cross-class monthly consistency over the same days
  (> max(0.50 %, 0.25 × |median|) → that class; no strict-minority outlier → every class compared). `classes.ts` `buildClassEntry`:
  withheld months absent from `monthly` + `withheldMonths`, fixed periods / YTD / risk from complete months only, SI only when every
  month since inception is usable (annualized over calendar days with a partial first month), calendar years null with a withheld
  month, growth from the month-end after the last withheld month (`growthFrom`), no index against a partial first month; 12-month
  minimum `MIN_CLASS_HISTORY_MONTHS` (config/funds.ts) → `ClassInfo.status` "young"; non-CAD → "currency". `build.ts` `buildClasses`
  rewritten (register active classes ∪ registry ∪ configured codes; the old "drop all classes when the headline's CIBC months are
  unverified", "drop the class on any unusable month" and fee-band gates are gone; headline/track record unchanged); every class's
  history fetched from 2019-01-01 (`sources/index.ts`, register classes unknown to the configuration fetched after the register);
  `FundData.classInfo`, `defaultClass` = headline with returns else first class with returns; validation holds / carries / drops
  `classInfo` with the classes, `classEntryChanges` gates classes published for the first time (one approval for all), defect months
  are a non-blocking notice. Page: `openingClass` (never opens on an empty performance block), young / USD sentences (EN/FR,
  `lib/notice.ts`), "Series inception" in the NAV card, series table and performance tab, "—" rows kept for withheld periods
  (`withheldPeriods`), calendar "—" years, heat-map "—" cells, growth start note and "From <date>" range. `config/funds.ts` lists
  every register class. Fixtures: every class of the three funds with shared daily paths (`noiseSeed`), synthetic defects (print
  in Monthly Income 2022-03, a one-day jump of MI class I 2023-09, drifting class I months 2025-03), a relaunched class, a young
  class, a USD class; `run.test.ts` now deletes its temp directories. Docs: architecture § Returns per class, compliance AC1–AC6.
  Not done: independent adversarial review (could not be spawned here); live run.


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
  Review polish: faded method 0.5 (`FOCUS`); `focusTracker()` eases from the last drawn state on step jumps or restarts
  (per-frame continuity unit-tested); sector names kept over the history sheets in steps 3–4 (white backing) as the key to
  the compare rings — on phones the cluster abbreviations do this (the strip's analyst slots, ≈ 19 px, are too narrow for
  names); "Our systems" card shrunk to its rows; the card's "Every day of history, remembered" gives way when the act 2 pill
  shows it (never both at once), full again in the compare step.

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
