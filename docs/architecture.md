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

The pipeline reads **only endpoints of the dataplatform main branch** (Gabriel 2026-10-02: no dataplatform change for
the website). Groupings and derived figures are computed by the website's backend (`src/lib/pipeline`) from those
inputs, with gates; a figure is never assembled from two sources.

| Source | Used for | Primary / cross-check | When it is missing |
| --- | --- | --- | --- |
| analytics `fund_returns.json` | monthly net returns before the Apex cut-over; verifies the CIBC months of the daily chain | primary (history) | factsheet monthly table (rounded) + alert |
| dataplatform `/api/performance/monthly-net-returns` | monthly net returns of the track-record class, `ready` months (no class parameter: main branch) | primary (Apex months) | the daily chain's Apex months; else month held / previous kept |
| dataplatform `/api/performance/nav-timeseries` (`fundserv=`, every class, from 2019-01-01) | daily NAV chain per class → inception and per-class monthly returns (`daily-chain.ts`, `class-returns.ts`); net assets for portfolio weights | primary for non-headline classes; cross-check of the headline | class "coming soon" / headline from monthly-net-returns |
| dataplatform `/api/performance/nav-timeseries`, `/api/apex/funds` | NAV per class, live classes | primary | previous NAV kept + alert |
| dataplatform `/api/unitholders/aum` | fund AUM (totals only) | primary | previous kept + alert |
| dataplatform `/api/ftse/index-summary` (+ `/short-names`) | benchmark levels; earlier naming generations chain-linked only when verified (`metrics.ts` `joinFtseHistory`) | primary | index figures not shown |
| dataplatform `/api/apex/holdings` + `/api/instruments/batch` + `/api/instruments` (bond universe) | daily (and month-end) book computed by the website (`fund-portfolio.ts`, port of the PR #621 analytics) | primary when covered (below) | month-end factsheet figures (issue) |
| factsheet archives (SharePoint) | characteristics vs index, breakdowns, top 10, ESG, published returns, GMV variants | ESG / GMV primary; portfolio fallback; cross-check | previous kept + alert |

Not read any more: `/api/apex/fund-portfolio` and `/api/performance/distributions` (PR #621) and the `class_code` /
`history=full` parameters (PR #626) — none is on the dataplatform main branch. Distributions are therefore not shown
(info issue `sources.distributions`; the page keeps the policy text); the display code stays for a future source.

### Computed by the website from main endpoints

- **Per-class monthly returns** (`daily-chain.ts`, `build.ts` `classChain`): from `nav-timeseries` daily rows of one
  FundServ code. Apex months (`apex_distribution_aware`) compound daily returns over the Canadian trading calendar
  (port of the dataplatform `market_calendar` and `_monthly_rows`); CIBC months (`legacy_stored`) are taken only
  complete and in CAD, from the class's first computable month (its first complete month on or after the fund's data
  start `navStart` = the register's `fund_data_start`, never before the register `inception`, and its own first row);
  July 2026 is bridged across the CIBC → Apex cut-over (port of PR #626 `_bridge`, drift tolerance 1 bp), with a seam
  continuity check: when the first Apex return starts on the last CIBC day, last CIBC NAV × (1 + that return) must equal
  the first Apex NAV within 1e-4. Gates: the headline's Apex months must equal `monthly-net-returns` within 1e-8 (else
  error, the month withheld, never refilled from a factsheet); CIBC months are used only all-or-nothing, after at least 6
  months equal the analytics series within 0.2 bp; the bridge month only when it agrees with analytics, or — without an
  analytics month — with a same-class factsheet printing it (a disagreement withholds the month, no confirmation leaves it
  out). When `monthly-net-returns` is unavailable because the dataplatform folds several Apex classes into its
  STRATEGY / STRATEGY_H row (`return_source_count` > 1), an alert says so. Months before a class's first NAV cannot be
  computed: `nav-timeseries` drops rows without a NAV.
- **Portfolio** (`fund-portfolio.ts`): signed weights over the classes' net assets (Apex closing capital of EVERY active
  register class that day, else positions plus cash, warned) — positions plus cash may differ by accruals (warn beyond
  5 %); characteristics from `latest_price` (duration, YTM; a price more than 7 days from the book date is unpriced),
  duration and YTM weighted by signed market value, withheld when short bonds exceed 0.5 % of net assets and labelled
  "bond holdings only, excluding futures" when futures are open (their exposure is not in the book's values); coupon /
  maturity / issuer from the bond universe, rating = composite else the lowest agency notch; green weight withheld when
  unknown for more than 10 % of the bonds; a bond without an instrument-master price within 7 days takes its FTSE Canada
  constituent row (`/api/ftse/index-constituents` univ / short_corp: yield, modified duration) within the same window, and
  the warnings name the bonds still unpriced and their price dates; identifiers are tried ISIN → CUSIP → FIGI, an ambiguous one falling through
  to the next (unresolved when none resolves); an unresolved position with a quantity and no market value is a
  contract, never a weight. The month-end book has no month-end price (latest only): its
  cross-check with the factsheet compares sectors, not duration / yield.
- **FTSE**: the index of a short name is the latest `index_id` in `/short-names`. An earlier name (configured alias,
  or same `index_id`, or same index family) is chain-linked only when it has a level on the current series' first day
  and at least 5 equal daily returns (±0.02 bp) on common days; otherwise not joined (info). The former "seam" join
  (≤ 3 % level gap) was unsafe across FTSE's 2024-12 renaming (levels were rebased) and is gone. Universe: `univ` +
  `univ_overall` verified. Short corporate: the dataplatform's `short_corp` starts at the new generation (2024-12):
  long-term benchmark periods before it are not shown (no main endpoint has the older history). A month's closing level
  counts only when no Canadian bond-market business day follows the month's last level (`market-calendar.ts`
  `caBondHolidays`: the TSX holidays plus Truth and Reconciliation Day, Sep 30 from 2021, and Remembrance Day, Nov 11,
  both observed on Monday when on a weekend — the bond market and FTSE Canada close then, the TSX does not); otherwise that
  month (and the next) has no index return (warn). Fund NAVs keep the TSX calendar.
- **FTSE gap link**: an earlier name (alias, same `index_id` or same family — never a loose name match) with no overlap
  is linked only when it ends on the bond-market business day just before the current name's first day (one daily return
  missing), with equal bases: the implied gap return (first / last − 1) must match the estimate from the rows' own
  analytics, carry − duration × Δyield (`average_yield` act/365, `modified_duration` of the earlier day), within
  min(max(3 × p95 of the daily residuals of the current series and the earlier one's last 250 days, first bond day of
  each month excluded, 2 bp), 5 bp), stay below 1 %, not be a copied level (zero implied return), levels within 3 %;
  never for a name marked synthetic. Bonds priced from FTSE need both yield and duration in range (−1–25 %, 0–40 years). The source detail and an info issue give the implied return, estimate, residual and threshold.
  An overlap of equal daily returns always wins. Family matching is order-insensitive ("Short Term Corporate" =
  "Corporate Short Term" = "short corp"); names containing every family word are tried by overlap only and listed in the
  source detail (up to 10) for the admin.

### Daily portfolio: selection, cross-check, gates (`portfolio.ts`, `validate.ts`, config `PORTFOLIO`)

- **Primary** when the book is at most 7 whole calendar days old (one rule, `src/lib/data/freshness.ts`, for the
  selection, the validation gate — also on funds carried over from the previous publication — and a render-time gate
  in `src/lib/data/site.ts`, so a rollback or a pin to an old snapshot never shows a stale book as "daily") and covers
  the bond book: `coverage.priced_weight >= 0.90` and
  `coverage.resolved_weight >= 0.95`. Each characteristic is shown only when its own coverage is `>= 0.90`; below 1 it
  gets a footnote with its coverage. Otherwise the Portfolio tab keeps the month-end factsheet figures (warn issue).
- A fetch failure of `/api/apex/holdings` or the instrument master (4xx, 5xx, network) keeps the previously
  published daily book (until the 7-day gate). A holdings payload for another fund than the one requested
  (`fund_short_name`) is a failure. Snapshots stored before 2026-10-02 (`raw.portfolio`) are still rebuilt as before.
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

- **Not fetched** since 2026-10-02 (no main-branch endpoint; deriving them from NAV moves is not verifiably exact). The
  rules below apply to a payload of the PR #621 contract (sample data, old snapshots, a future endpoint).

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
- The headline (track record) stays the track-record class: SEST FP (`STRATEGY`), SEB H (`STRATEGY_H`),
  Multi-Strategy F. Its months: analytics history (CIBC months replaced by the daily chain when verified, origin
  `navchain`), then the Apex months of `monthly-net-returns`, else the chain's Apex months when that endpoint is down;
  a track record ending more than 2 months before the target month is withheld (stale guard). A month on which an
  existing factsheet of the same class disagrees blocks the new month / withholds the published one.
- **Review gate (M3)**: a new month (after the previous publication) that no source independent of the dataplatform
  confirms (analytics month, same-class factsheet monthly or trailing table) is listed in `FundContext.unconfirmed`;
  in auto mode the run publishes that fund with its previous performance (every class with it) and stays
  `pending-review` (`RunReport.reviewNeeded`, webhook alert) until an admin publishes it; review mode is unchanged.
  `PIPELINE_REQUIRE_FACTSHEET_FOR_NEW_MONTH=1` still holds such a month in every mode until its factsheet exists.
- Fund pages open on the default class F when it has returns, else on the first class with returns (`defaultClass`,
  § Returns per class); every other class comes from its own daily chain. A payload `class_code` other than the class
  requested is an error.
- A class change (H ↔ F, relative to the published performance — of the headline, of any class entry by FundServ
  code, of the page's default class — or classes published for the first time) blocks in validation: auto mode publishes the run
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

### Returns per class and GMV variants (`class-returns.ts`, `classes.ts`, `build.ts` `buildClasses`, `validate.ts`, `components/fund/lib/select.ts`)

Gabriel 2026-10-04: every class's returns come from the dataplatform (main endpoints only), for the three funds.

- **Classes**: every ACTIVE class of the fund register (`/api/apex/funds`), plus the classes of the registry
  (`config/funds.ts` `classes`) and of the class-code configuration (`fund-sources.ts`: `STRATEGY` / `STRATEGY_H` keep their
  codes; any other class is named by its FundServ code). The daily history of each is read from
  `CLASS_CHECKS.historyFrom` (2019-01-01; a register class unknown to the configuration is read after the register).
  `FundData.classInfo` (by FundServ) gives each class its inception and why it shows no returns (`young`, `currency`,
  `unavailable`); `FundData.performanceByClass` holds the classes that show returns.
- **Inception** = first NAV-per-unit date of the class's CURRENT run: a gap of more than `CLASS_CHECKS.relaunchGapDays` (10)
  calendar days ends a run only when a relaunch is corroborated — the NAV per unit jumps by more than `relaunchNavJump` (5 %)
  across the gap, restarts at a launch price (10.00) after a gap of more than `relaunchResetMinGapDays` (30), or the gap
  exceeds `relaunchLongGapDays` (180) — and earlier rows are
  then a previous life (warn issue: check against the register); an uncorroborated gap is a coverage gap inside the run (warn;
  the months it touches lack valuation days and are withheld). `FUND_SOURCES.classFloor` cuts a run reaching back before the
  fund's own book; a run starting within 10 days of the first day read has an unknown inception (class unavailable). The
  inception day's own return is never used (it may be relative to the old life): the first month is a partial month from
  the inception NAV per unit (`Performance.partialFirstMonth`, `inception`).
- **Months** (each class's own rows): CIBC months compound the stored `legacy_stored` returns, the cut-over month uses the
  NAV bridge, which must equal the class's own compounded daily returns within the bridge tolerance (else a distribution or
  adjustment inside the month: withheld; a class launched in that month before the switch has no month), Apex months the `apex_distribution_aware`
  chain (continuous `return_start_date`); every valuation day after the inception present once, CAD. A non-CAD class (F USD:
  `nav_price_ratio` only in the Apex era, and the fund distributes) shows no figure, with a sentence saying why.
- **Source defects withhold months** (never repaired, never filled from another class; reasons in the issues; months
  withheld for every class are also a non-blocking notice — `FundContext.advisories`, webhook once per list — to report to
  the dataplatform team), config `CLASS_CHECKS`:
  - bad valuation print: two consecutive daily returns of opposite sign, both ≥ 2 %, combined ≤ 0.5 × the smaller → both
    months, every class of the fund. Checked over every row fetched (to the run day), so a print on the newest month's last
    day reversed on the next valuation day is seen; the newest month of a class waits ("—") until one later valuation day
    exists;
  - cross-class consistency of a COMPLETE month, on the published monthly values. Each class c is compared with a
    LEAVE-CLASS-OUT reference m₋c = median over the OTHER fitted complete classes d of (r_d − a_d) / b_d (each mapped back
    to the fund's common return through its own fit), so an error in c never moves its own reference and a correct class
    with a different slope (e.g. without a performance fee) is never made the outlier by another class's error. a_c, b_c
    are fitted by Theil–Sen (median of pairwise slopes; intercept = median of r − b·m) on that reference over the months
    where c and ≥ 2 other fitted classes are complete, LEAVING OUT the month under test; the fits and references are
    iterated a few rounds from a = 0, b = 1; b clipped to [0.6, 1.4], a to ±0.30 % a month. A class is fitted when it has
    12 such months (`fitMinMonths`); young classes never enter another class's reference and are only ever withheld
    themselves. Residual = r_c − (a_c + b_c · m₋c); above `residualMax` (0.40 %) it is a breach. For the fitted classes:
    - the month holds a **distribution / price-adjustment day** in any class of the fund (a day whose stored or
      distribution-aware return differs from the NAV-per-unit ratio − 1 by more than `adjustmentMin`, 0.10 %) → the month
      is withheld for EVERY class: which side is right cannot be told (on a distribution day the majority of classes
      can be the wrong side);
    - otherwise exactly one class breaches and the ≥ 2 other complete classes are consistent (all residuals within the
      tolerance) → that class's month only;
    - otherwise (two or more breaching, or only two complete classes) → every class.
    Partial inception months are outside the median and the fit: each is compared with the other classes compounded over
    its own days (band max(`crossAbs` 0.50 %, `crossRel` 0.25 × |median|)) and withheld alone when it deviates (every class
    when the month holds an adjustment day); a month with
    no other class to compare is listed in the provenance (unchecked). There is no daily cross-class check.
    Note: in a fund distributing every month, every month holds an adjustment day: any fitted breach then withholds the
    month for every class. A class without a fit of its own (fewer than 12 complete months next to two other classes)
    in a fund whose other classes are fitted is never checked at slope 1: its months are withheld until it has a fit.
    Limit: with only two classes no fit is possible; each class is then compared with the other's plain value at slope 1,
    which withholds both in strong months when their spread is legitimate AND can let an error pass when it cancels a
    legitimate spread (different slopes, e.g. a fee-free class) — a wrong value is possible. None of the three funds is in
    that case today (each has at least four CAD classes); a two-class fund would need a pairwise fit first. With three fitted classes the reference is the mean of
    two, so a large error in one class can also push the others past the tolerance: the month then goes to every class
    (conservative);
  - missing / duplicate days, another return method, invalid returns.
  The headline (track record) keeps its own logic and checks (analytics history, CIBC verification within 0.2 bp, Apex
  months = `monthly-net-returns`). The class results are computed first (`computeClassRun`, to the run's target month);
  the track record's defects are the months withheld for every class plus the track class's own check failures (lone
  cross-class outlier, newest month waiting). A defect month the track record takes from its OWN daily NAV chain, or from
  `monthly-net-returns` (computed from the same Apex NAVs: equal to the chain by construction, not an independent source),
  is replaced by the analytics history's official figure when that has the month (labelled "official figure", not an
  independent check), else withheld (a newest month is held, a month in the middle interrupts the track record as any
  missing month does). A defect month already taken from the analytics history or a factsheet stays, with a warning. That verification is not a gate for the
  other classes any more (the strategy track record
  differs from the class NAV chains before mid-2025: a different series), nor is the old fee band against the track-record
  class (`classSpread`, kept in the configuration, unused).
- **Per-figure withholding** (`classes.ts`): a figure is shown only when every month of its window is usable — fixed
  periods (1 month … 10 years) and the year to date from complete months only (never the partial first month; YTD needs the
  year's January, complete), since inception only when every month from the inception month is
  usable (compounded from the inception NAV; annualized from one year on, over calendar days when the first month is
  partial, else over months — "periods of less than one year are not annualized"); calendar years with a withheld month
  are null; risk statistics over complete months (since inception only when every complete month is usable, 3 years only
  when its 36 months are; labelled "From <first complete month>" when the first month is partial); the growth series starts at
  the inception day (first point dated the inception), or at the month-end after the last withheld month (`growthFrom`,
  labelled on the page); no index figure is set against a partial first month (marked in the heat map). The page shows a
  withheld figure as "—" (header badges, trailing table, calendar table, heat map) with a one-line note. The track record
  (headline) shows no series inception next to its figures; its since-inception row reads "Since track-record start (<month>)".
- **Regulatory minimum**: a class with less than `MIN_CLASS_HISTORY_MONTHS` (12, `config/funds.ts`, compliance may change it)
  months since its inception (same day 12 months later) shows no performance figure, only "Series X launched on <date>.
  Performance will be shown once the series has 12 months of history." (`ClassInfo.status` `young`).
- **Opening series**: `defaultClass` = the registry's headline class when it has returns, else the first class (register
  order) that has; the page (`openingClass`) prefers the admin's headline class when it has returns, then the data's
  default, then the first class offered with returns — a page never opens on an empty performance block while another
  series has data. The home cards still read the headline class (`defaultClassCode`), unchanged.
- **Approval**: a class entry changing class, the default class changing, and classes published for the first time —
  also when the previous publication had no performance, and every series of a fund new to a live site (its page then goes
  live without performance until approved); the very first publication of the whole site has nothing to compare with and is
  not gated (run it in review mode) — e.g. a class reaching its 12 months, or every register class at once, go through the
  class-change gate: auto mode keeps the fund at its previous publication until an admin publishes the run — one approval
  publishes every class of every fund of the run. Revisions of published months (a month newly withheld counts) are
  reported per class entry (warn + alert); a class that was published and disappears is a blocking alert.
- **Hold**: when only the performance fails validation (`validateSite` perf-only hold) the held performance carries every
  class and variant with it (`performanceByClass`, `defaultClass`, the default variant, the other variants from the previous
  publication, or dropped when there is none): never new classes next to an old headline, never the whole fund dropped.
  A change of the headline's class still needs an admin approval (class-change gate).
- **Not available** (no main endpoint): months of a class before its first NAV (the strategy months before a class's
  inception); distributions (no endpoint: total returns cannot be rebuilt from NAVs per unit); distribution-aware returns
  of the USD class.
- **GMV variants**: `FundData.variants` ("3" | "6" | "9", default "6") from the factsheet blocks `GMV_3pct`, `GMV_6pct`,
  `GMV_9pct`: returns, risk, characteristics, allocation and holdings per variant; the default variant equals the fund's own
  data. A variant whose block is missing or fails the gates is dropped alone (warn); the page then shows nothing for it.
  The live GMV series exist only in the bbg2 mirror (no dataplatform endpoint). Every GMV figure names its variant
  (`config/funds.ts` `VariantSpec.name`: "6% downside volatility" / « volatilité à la baisse de 6 % », or the selected one):
  home and strategies cards, compare table, solutions, hero, return strip, overview, performance, chart legend,
  disclosure, disclaimers and admin.
- **Page**: `FundPage` holds the selected class and variant; `pickData` applies them before `stripHidden`. Class types
  (prospectus / OM) come from the registry (`FundSpec.classes[].type`) and the admin (`FundContent.classTypes`); no type, no label.
- **Rankings** (`FundContent.rankings`, seeded in `src/lib/data/defaults.ts`, merged field-level per fund): third-party
  Fundata (formerly Fund Library; field name `fundLibrary` kept) rank / quartile per period, FundGrade and an optional Morningstar rating, edited by hand in the admin with
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
  page (`strategies/[slug]/page.tsx`) filters on the server (`publicFundRankings`): drafts, notes and stale figures never
  reach the RSC payload; the client only re-checks the shape.
- **Awards gate** (2026-10-04): the *Awards and rankings* tab and the overview Morningstar block exist only when a shown
  Fundata entry has a FundGrade of **A or B** (`awardsEligible`); otherwise `gateAwards` removes the rankings from the
  payload on the server (the CIFSC category line keeps its Fundata fallback). Tab order: Morningstar, Fundata, RBC, others.
- **RBC survey check** (`rankings/rbc-survey.ts`, `rankings/schedule.ts`, started by `instrumentation.ts`): every 6 h the
  process runs the check when the stored one (`rankings/rbc-survey-check.json` on the volume) is older than
  `RANKINGS_CHECK_DAYS` (7). It reads the public insights listing (`https://www.rbcis.com/en/our-insights.page`, then the
  legacy `rbcits.com` address), parses survey editions from article links, PDF links and titles, and HEAD-probes the
  predictable PDF address (`/assets/rbcits/docs/FINAL_EN_Pooled_Fund_Survey_Q<q>_<yyyy>.pdf`) of the next quarters. A
  quarter newer than a fund's confirmed RBC entry gives a dashboard issue ("New RBC pooled fund survey Qx published —
  update rankings") and one `PIPELINE_ALERT_WEBHOOK` message per edition. **A failed check only logs and shows an issue;
  it never hides or changes data** (hiding is the as-of rule above). `POST /api/admin/rankings/check` runs it on demand.
- **Seeds** (`defaults.ts`): Morningstar 5 stars Class F as of 2026-10-01 for both bond funds (stated by Nymbus); Fund
  Library as at 2026-08-31; RBC Investor Services Pooled Fund Survey Q2 2026 for both bond funds, **confirmed**
  (`scope: "fund"`, `trackSince: "2019-01"` — strategy track record incl. pre-launch periods, labelled as such with a link
  to the disclosures —, `basis` gross of management fees in CAD, standard periods + `rolling` 4-year periods ending June 30
  2023–2026 (the survey table "Four year periods ending June 30"); category names in English in both languages; returns
  stored as `ror`, never sent to the page). Entries stored with the earlier `annual` field migrate to `rolling` (4 years). The old pristine drafts migrate to these entries. Official Morningstar logo and 5-star
  image are shipped in `public/brand/third-party/` (served with the sandbox CSP by `next.config.ts`). A fund whose stored rankings lack `thirdParty` gets the drafts; saving an empty
  list keeps it empty.
- **Morningstar on the overview**: the bond funds' Overview tab shows the rating in the side column
  (`components/fund/Morningstar.tsx`), with class, as-of date, source link, methodology and © attribution
  (`rankings-copy.ts`, compliance row W3). The awards tab shows the same block.
- **Official brand assets** (`brand-assets.ts`): slots `morningstar-logo`, `morningstar-stars-1..5`, `rbc-logo`,
  `evestment-logo`, `lseg-lipper-logo`, `gmr-logo`, `fundata-logo` (former name `fundlibrary-logo`: an upload stored under it is listed, served — also at
  `/api/brand/fundlibrary-logo` — and replaced as `fundata-logo`; `LEGACY_BRAND_SLOTS`). Shipped: Morningstar logo and
  5 stars, Fundata, RBC Investor Services. A slot is filled by a file shipped in
  `public/brand/third-party/<slot>.svg|png|webp` or uploaded in *Admin → Settings → third-party brand assets*
  (`POST /api/admin/upload/brand`, stored at `brand/files/<slot>.<ext>`, served by `GET /api/brand/<slot>` with its exact
  type, `nosniff`, a sandboxing CSP and an ETag; PNG / WebP / plain SVG only, scripts / handlers / external references
  refused, 512 KB). The upload wins. An empty slot renders **text** (e.g. "Morningstar Rating™: 5 stars") — never an
  imitation graphic; the dashboard and the fund editor warn "official Morningstar assets missing".
- **Morningstar note**: methodology and © attribution in full behind an info note (`components/fund/InfoNote.tsx`:
  hover / keyboard focus / tap, Escape, `aria-describedby`; compliance row P3).
- The /solutions advisor rankings list (`AdvisorRankings`) was removed on 2026-10-04: rankings live on the fund pages only.

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
| `PIPELINE_REQUIRE_FACTSHEET_FOR_NEW_MONTH` | default `0`: a new month no independent source confirms needs an admin in auto mode (run `pending-review`); `1`: it waits for its factsheet in every mode (an existing disagreeing factsheet always blocks) |
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
