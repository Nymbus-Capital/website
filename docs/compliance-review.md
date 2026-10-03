# Compliance review of the public disclaimers

**Status: DRAFT BOILERPLATE. It must be reviewed by compliance before launch.**

All regulatory text of the public site is kept in **one file**: [`src/content/disclaimers.ts`](../src/content/disclaimers.ts).
It is in EN and FR, and each text records where it appears and what to verify. Admins can override two texts without
a code change:

- **Firm disclaimer**: *Admin → Site settings → firm disclaimer*. When set, it replaces the boilerplate firm text in
  every footer and in every fund disclosure.
- Both languages are required for an override (or both left empty, which means "use the default").
- The pre-launch footer paragraph of a fund is omitted while that fund is hidden in the admin.
- **Performance note per fund**: *Admin → Funds → performance footnote*. When set, it replaces the pre-launch
  boilerplate for that fund, if the fund has one.

## How the review is tracked

- The admin dashboard shows a **"compliance review required"** banner. The banner lists every text (EN + FR),
  including the admin overrides. Each text has a link to where it appears and the points to verify.
- An admin clicks **"mark disclaimers as reviewed by compliance"** (confirm dialog). The reviewer, the time and a
  fingerprint of the texts are saved in `SiteContent.compliance`. The action is recorded in the audit log
  (`compliance.disclaimers.reviewed`).
- If `src/content/disclaimers.ts` or an admin override changes afterwards, the fingerprint no longer matches and the
  banner comes back ("changed since the last review"). Other content edits (fees, taglines, etc.) do not trigger it.

## Texts, where they appear, what to verify

| # | Text (id) | Where | Verify |
|---|---|---|---|
| 1 | Firm disclaimer (`firm`): registration, not advice, not an offer or solicitation, offering documents | Footer of every public page; fund pages → *disclosure* | Registration categories: portfolio manager and investment fund manager with the **AMF (Québec)**? Other provinces and registrations (OSC, exempt market dealer)? Legal name *Nymbus Capital Inc. / inc.* How each fund is sold: **simplified prospectus + fund facts** vs **offering memorandum** (exempt). Adapt per fund if needed. |
| 2 | Mutual fund standard warning (`fundStandard`): commissions, trailing commissions, management fees and expenses; read the fund facts and prospectus; not guaranteed; values change frequently; past performance may not be repeated | Footer; fund pages (investment funds only) | Exact prescribed wording (NI 81-102 s. 15.4 style) for prospectus funds vs OM funds. "Fund facts" exists only for prospectus funds. |
| 3 | Rates of return (`returnsNet`): historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of distributions, excluding sales, redemption, distribution and optional charges and income taxes | Footer; fund pages (net-of-fees funds) | Net of which fees (management fee, expenses, MER). Series shown per fund. Annualization (the site annualizes periods of 12 months and more; periods under one year are not annualized). |
| 4 | Benchmark (`benchmark`): broad-based FTSE Canada index, comparison only, not investable | Footer; fund pages with a benchmark | Benchmark names. Monthly Income: FTSE Canada Short Term Corporate (`short_corp`). All index figures are computed from FTSE data, so they can differ from older factsheets, which used the XSB/XBB ETFs before May 2026. SEB: FTSE Canada Universe. Is "broad-based" accurate? |
| 5 | Performance before the fund's launch (`preInception`): Monthly Income launched **2021-10-05**, strategy track record since **2019-01** | Footer; Monthly Income page → *disclosure* (unless an admin performance note replaces it) | Both dates. Do other funds (SEB, Multi-Strategy) show pre-launch history? If so, add them to `FUND_INCEPTION`. Is the pre-launch series net of the fund's current fees? Is showing it permitted under the sales-communication rules? |
| 6 | GMV gross of fees (`gmvGross`): managed accounts, not a fund; client returns reduced by fees | Footer; GMV page → hero + *disclosure* | Gross/net wording. Must a net series accompany it? The 6 % volatility-target variant is the one shown. |
| 7 | FTSE Russell notice (`ftse`): LSE Group trademark and data notice | Footer; fund pages with a benchmark | Exact notice required by the FTSE Russell data licence. Is public redistribution of index levels and returns allowed under the licence? |
| 8 | Short net note (`summaryNet`) near figures | Home → strategies; `/strategies` | Consistent with the full disclosure. |
| 9 | Short gross note (`summaryGross`) | Home → strategies; `/strategies` | Gross/net wording. |
| 10 | Basis labels (`basisLabels`): "net of fees", "gross of fees · managed accounts, not a fund" | Fund pages, hero and disclosure | Consistent with texts 3 and 6. |
| 11 | Sample-data warning (`sample`) | Fund pages, sample mode only (never in production) | Wording, if a demo site shows sample data. |
| 12 | Provenance line (`provenance`): "Updated daily from Nymbus’ data platform; portfolio data from the monthly factsheet of …" — or, when the Portfolio tab shows the daily book: "…; portfolio data from the daily holdings as of <date>; sustainability metrics from the monthly factsheet of <month>." (FR: « données de portefeuille selon les positions quotidiennes au <date>; indicateurs de durabilité selon la fiche mensuelle de <mois> ») — **new 2026-09-30, to review** | Fund pages → *disclosure* | "Daily" is accurate; the as-of dates next to it. "Daily holdings" describes the data platform's book of the last valuation day (shown only when its coverage passes the thresholds, else the factsheet). The sustainability clause appears only when those metrics are shown. |
| – | Admin overrides: firm disclaimer; per-fund performance notes | As above | Entire text. |

Other statements on the site that compliance may want to see (not boilerplate): taglines and fund descriptions
(*Admin → Funds*), the risk ratings, and the fees, MER and minimum-investment fields.

## Editing

1. Edit `src/content/disclaimers.ts`: change the EN and FR texts together, and keep `where` and `review` current.
   Unit tests (`tests/unit/admin/disclaimers.test.ts`) check that the required elements are present in both
   languages.
2. Deploy. The admin banner reappears automatically. Compliance reviews the texts, then an admin marks them as
   reviewed.

## Website legal pages and page copy (site rebuild, 2026-09-30)

The complaints policy, code of ethics and privacy policy are kept as data in `src/components/site/legal/`
(`complaints.ts`, `privacy.ts`), EN and FR, word for word from the previous site except for the points below.
They are **not** covered by the admin fingerprint banner above: review them here.

| # | What | Where | Verify |
|---|---|---|---|
| L1 | Complaints policy phone number changed from **514-931-1138** to **514-985-1138** (the firm's number everywhere else) | `/legal#complaints-file` | Which number reaches the designated complaints officer. |
| L2 | Headings in sentence case (e.g. "How to file a complaint"); wording unchanged | `/legal`, `/privacy` | None expected. |
| L3 | **New section 3.3 "Service providers"** (section 3.2 referred to a 3.3 that did not exist): fund administrators, custodians, IT and cloud providers; written agreements; information may be stored outside Québec or Canada | `/privacy#privacy-use-3` | Entire text, EN and FR. Accuracy of the provider categories and of the outside-Québec statement. |
| L4 | **New section 10 "Québec residents: Law 25"** (retitled "Québec privacy law (Law 25)" on 2026-09-30, see below): person in charge (the Designated Privacy Officer), access / rectification / withdrawal / portability rights, automated decisions, assessment before communication outside Québec, confidentiality incident register and CAI notification, this website's single language cookie, recourse to the Commission d'accès à l'information | `/privacy#privacy-quebec` | Entire text, EN and FR. Title and contact details of the person in charge must be published (Law 25); is it the Designated Privacy Officer or the CEO? Is a privacy impact assessment process in place for transfers outside Québec? |
| L5 | Section 7 now links the complaints policy (`/legal#complaints`); the legal page links the AMF and OBSI websites | `/privacy`, `/legal` | None expected. |

Other page statements compliance may want to see (not boilerplate, written for the rebuild; facts only, no figures
other than counts computed from `src/data/team.ts`):

- `/sustainability` (`src/components/site/pages/copy-sustainability.ts`): the exclusion policy (fossil fuel
  production > 5 % of revenue, tobacco, controversial weapons, severe ESG controversies) is presented as applying
  "as set out in each fund's offering documents and each mandate's investment policy": confirm the scope per fund.
  Fondaction described as a Québec labour-sponsored fund that entrusted Nymbus with sustainable bond mandates. PRI
  signatory since 2018, Tobacco-Free Finance Pledge 2024. The old ESG metrics, green-bond allocation chart and "PRI
  alignment scorecard" percentages were placeholders and were removed.
- `/approach` (`copy-approach.ts`): the protection overlay text and its two footnotes reuse the deck's wording
  (futures margin "about 5 to 10 %"; the "has typically buffered bond drawdowns" claim was replaced on 2026-09-30, see below); the macro
  system is described as "rebalanced every six months".
- `/team` (`copy-about.ts`): milestones shown are only those backed by another source in the repository (2013
  founding, 2018 PRI, 2021 Monthly Income launch from `FUND_INCEPTION`, 2023 Dans la rue, 2024 tobacco-free pledge,
  2025 Mageska partnership). The old timeline's AUM figures, the 2019/2023 fund launch years and the 2020 merger were
  left out (inconsistent or unverified).
- `/contact` (`copy-contact.ts`): office hours (Monday to Friday, 8:30 to 5:00 ET) and "reply within one business
  day" come from the previous site. Advisors described as "registered with CIRO or a provincial securities regulator" (the old site said IIROC; "or the CSA" replaced on 2026-09-30).

## Website copy review 2026-09-30

A copy and compliance review of every public page (review items A1–A15, B, C) was applied on branch `fix/copy`.
Everything below is **pending compliance approval**. Items marked *changed* were rewritten; items marked *flag only*
were left as they are because they are Gabriel's or compliance's decision. Nothing new was asserted: claims that could
not be substantiated were softened to "designed to" statements or removed.

### A. Must-fix items

- [x] **A1 (resolved 2026-10-01, Gabriel).** Sustainable Enhanced Bonds: the performance shown was the dataplatform
  `STRATEGY_H` (class/series H) track record, labelled **series F** on the site. Presenting one series' returns under
  another series' name is a sales-communication risk unless the series have identical fees and history.
  *Changed:* the returns disclaimer now says "series" / « série » like the UI (it said "class" / « catégorie »).
  **Decision 2026-10-01 (Gabriel): "Change SEB to Class F timeseries. If you showcase the class H timeseries, then
  show class H."** Implemented on branch `fix/seb-class`: the label is never a business label any more, it is
  derived from the class of the data actually used (`performance.classCode`, `fund-sources.ts` `classLabels`):
  - SEB asks the dataplatform for its class F series with the full history (`class_code=STRATEGY&history=full`);
    when the response confirms class F from the track-record start (2019-02), every month comes from it (no
    analytics month) and the site says **Series F / Série F**;
  - otherwise (dataplatform change not deployed yet, or the answer is not confirmed) the class H sources are kept
    and the site says **Series H / Série H**;
  - a series whose months come from different (or unknown) classes is never published (withheld, error + alert);
    a validation gate blocks any performance whose label is not its data's class; publications made before this
    change are relabelled by their data (class H) when carried over, rolled back or pinned;
  - the factsheet publishes SEB as class H (factsheet-generator `fed3af3`): while the site shows class F, the SEB
    factsheet comparisons (monthly table, trailing returns, value added, statistics) are skipped with an info
    issue naming the class mismatch; the "factsheet of the month must exist" timing gate and every other gate stay;
  - the label appears on the fund header badges, overview returns, performance tab, growth-chart legend,
    disclosures, home tiles and the strategies index; the NAV card keeps the register's own series (LDM201 = F).
  Follow-up (independent review, same day): class F is used only when complete through the latest class H month and
  within a fee band of class H on every month (−5 to +30 bp), with the payload naming class F / LDM201 like the fund
  register; once class F is published a source failure keeps it (never back to H); any class change H ↔ F waits for
  an admin approving the run, also in auto mode; the factsheet is compared by archive month (SEB archives up to
  2026-07 publish class F, from 2026-08 class H). Home tiles and the strategies index say "Returns: Series F" /
  « Rendements : Série F ».
  *To confirm:* that class F has a track record from 2019-02 (otherwise the dataplatform's full history will not
  start at the track-record start and the site stays on class H).
  *To review (same question as A2):* "Series F" for **2019-02 to 2023-07** covers pre-launch **strategy** returns
  (segregated accounts) net of the class's current fees, not the fund's own units; confirm this is permitted and how
  it must be disclosed.
- [ ] **A2 (flag only).** Monthly Income shows the strategy track record from **January 2019**, before the fund's
  launch on **2021-10-05** (`FUND_INCEPTION`, `preInception` disclaimer). Confirm this is permitted under NI 81-102
  Part 15 (standard periods 1, 3, 5, 10 years and since inception; no performance for a fund in existence < 12
  months; pre-launch history of another account). Since-inception returns under 12 months are shown cumulative
  (`strategies-copy.ts` note). *Changed:* the disclaimer review note and row 3 above now match the code
  (annualized from 12 months, not "2 years and more").
- [ ] **A3 (flag + disclosure added).** Global Minimum Volatility returns are **arithmetic** (sums of monthly returns
  on notional exposure). *Changed:* the GMV gross disclaimer and the growth-chart caption now say "Returns are
  arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth
  chart is illustrative." (+ FR). **Confirm whether the series is actual accounts, a composite or a model**; a model
  or hypothetical series must be labelled as such, and a net-of-fees series may be required.
- [x] **A4 (changed).** The RBC fund-study ranking news item was removed: a fund ranking needs the NI 81-102
  s. 15.3(4) details (ranking entity, category, number of funds, period, date), which we do not have. Re-add only
  with those details and compliance approval.
- [ ] **A5 (changed).** "Capital preservation" / "protection" wording replaced with risk-control wording that does
  not imply a guarantee ("Risk control — Each strategy operates within explicit risk limits and may use hedging;
  this does not eliminate the risk of loss."). The past-performance claim "has typically buffered bond drawdowns"
  became "designed to have low correlation with bonds and to offset part of bond losses when volatility rises; it may
  not do so and can lose money". "Uncorrelated" stated as fact became "designed to have low correlation" (funds.ts,
  fund pages, approach, solutions, home, news). The futures-exposure disclosure ("The overlay adds futures
  exposure; its losses add to those of the underlying portfolio and may require additional margin.") was added
  wherever the overlay is described. "Only require a margin deposit" lost its "only". The "capital stays invested"
  statement is now "Most of the capital stays invested in the underlying portfolio" everywhere (it said "fully
  invested" / "100 %" in places), and the approach diagram label "Bonds, 100% of capital" became "Bonds".
  **Confirm:** margin deposit "about 5 to 10 % of exposure"; "most of the capital stays invested"; the target
  downside volatilities 3 %, 6 %, 9 %; the approach footnote \* (deck, "historical observations") still fits the new
  design-language sentence.
- [ ] **A6 (changed).** Monthly Income tagline "Steady monthly income…" → "Monthly income from short-term corporate
  bonds"; "Distributions are not guaranteed, may change and may include a return of capital." added where monthly
  income / distributions are promoted (fund description, summary, "Monthly distributions" card). Multi-Strategy
  low-volatility sleeve "steady returns … a stable base" → "Seeks returns with lower volatility". **Confirm** the
  return-of-capital sentence matches the fund's distribution policy.
- [ ] **A7 (changed).** ESG scope limited to the bond selection processes, with the futures-overlay exception stated
  (sustainability hero, principles, integration, exclusions, SEB feature). Tobacco: "excluded from all portfolios" →
  "from the securities we select directly" (sustainability, about, news). "Fossil fuel production" → "Coal and oil
  sands"; "What we do not finance" → "Our exclusions"; "certified green bonds" → "green bonds labelled under
  recognized frameworks such as the ICMA Green Bond Principles". **Confirm:** the exclusion list and thresholds
  (> 5 % of revenue, MSCI "severe") per fund and mandate; whether the Multi-Strategy fund applies them; that
  exchange-traded futures are indeed outside the exclusions; "we report on our progress every year" (kept once, in
  "Accountability"; removed from the 2018 milestone) is accurate for the PRI reporting cycle.
- [x] **A8 (changed).** "UN PRI" / « PRI de l'ONU » → "PRI signatory since 2018" / « Signataire des PRI depuis 2018 »;
  running text "the UN-supported Principles for Responsible Investment (PRI)".
- [ ] **A9 (changed).** "registered with CIRO or the CSA" → "registered with CIRO or a provincial securities
  regulator" (FR « inscrits auprès de l'OCRI ou d'une autorité provinciale en valeurs mobilières »), solutions and
  contact form.
- [ ] **A10 (changed + flag).** Approach copy made consistent: "systematic, with human oversight" (hero, philosophy,
  System 2 "Method", home "Systematic construction" card). System 2 was described as "Systematic and discretionary".
  **Confirm** how final security selection works (is there a discretionary override?). **Flag for Gabriel:** the
  Multi-Strategy track record is the analytics series "Nymbus Multistrategy (Inc. discretionary strats history)",
  which includes discretionary strategies, while the fund is described as combining systematic, rules-based
  strategies.
- [ ] **A11 (changed + flag).** The French pages used the mixed-language name "Nymbus Global Minimum Volatilité".
  The English proper name "Nymbus Global Minimum Volatility" is now used in both languages (funds.ts, fund page,
  disclaimers, e2e). **Confirm** there is no official French name. Note for the code fixer: the French meta
  description in `src/app/(site)/strategies/page.tsx` still says "Global Minimum Volatilité".
- [ ] **A12 (changed).** Privacy policy: the intro cites PIPEDA and Québec's Act respecting the protection of personal
  information in the private sector; section 10 retitled "Québec privacy law (Law 25)" and applies to all personal
  information we hold; one title everywhere, "Person in charge of the protection of personal information" / « responsable
  de la protection des renseignements personnels » (was "Chief Privacy Officer", "Designated Privacy Officer",
  « RPRP »); 30-day written response; privacy concerns go to the person in charge, then the CAI (cai.gouv.qc.ca) and
  the Office of the Privacy Commissioner of Canada (priv.gc.ca); governance-policies publication statement;
  cessation of dissemination / de-indexation right (s. 28.1); cookie sentence ("a single cookie, which remembers your
  language preference, and no technology that allows you to be identified, located or profiled"). **Confirm:** who the
  person in charge is (title and contact details must be published; CEO by default under Law 25 unless delegated in
  writing); that this policy is the published governance-policy summary; the 30-day commitment for all requests.
  **Effective date:** kept "July 1, 2025"; the page has no "last updated" slot, so a "Last updated: 2026-09-30"
  line needs either a code change (LegalDoc field) or a new effective date chosen by compliance.
- [ ] **A13 (changed).** Complaints policy: AMF step reworded to "ask us to transfer your complaint file to the AMF,
  which can examine it and offer dispute resolution services" (+ FR) with the AMF contact (1 877 525-0337,
  lautorite.qc.ca); OBSI: the 90-day rule, "mainly for clients who live outside Québec", full French name
  « Ombudsman des services bancaires et d'investissement (OSBI) », French phone formats « 416 287-2877 ou
  1 888 451-4519 (sans frais) ». **Confirm** Nymbus' OBSI membership and that the 90-day / 180-day wording matches
  the firm's policy; the effective date (July 1, 2025) given the wording changes.
- [x] **A14 (changed).** French typography: U+00A0 before « : », « % », « $ », inside « », and in amounts
  (« 10 000 $ », « 5 à 10 % »); Québec convention kept (no space before ; ? !). Enforced by
  `tests/unit/site/copy-typography.test.ts` over every copy module. Labels assembled in components (e.g.
  "Rendements présentés: …" in `src/components/fund/*.tsx`) are code, not checked by the test.
- [x] **A15 (changed).** Jean Turmel FR bio: « Financière Banque Nationale » (was « Banque Nationale Investissements »).

### B. Terminology and tone (changed)

- [ ] French terms: « bureau de gestion familiale » (not "family office"); « DDA » / « Depuis le début de l'année »
  (not « Cumul annuel » / « AAJ »); « Classe d'actifs »; « Placement minimal »; « placement » for securities
  (« Processus de placement », « Solutions de placement », « équipe de placement », « Méthodologie de placement »);
  « après / avant déduction des frais » (not « nets / bruts de frais », also in the disclaimer basis labels);
  « obligations de sociétés » (the Monthly Income benchmark name « Indice FTSE Canada des obligations corporatives à
  court terme » was left as is — **confirm the official FTSE French index name**); « Rendements sur périodes mobiles »; « Caractéristiques du fonds » / "Key facts" (not "Fund facts",
  which is the regulatory document); « Frais et charges »; « chaîne de traitement »; « validation progressive
  (walk-forward) »; « stratégies de superposition »; « Socle »; « Tous les six mois »; « communiquer avec »;
  « service »; « renseignements »; « vérification diligente »; « recueillons »; « En vigueur depuis le »;
  « chef de la conformité ». Straight quotes and apostrophes → typographic.
- [ ] Puffery and unsourced figures removed or softened: Mageska news (no "known for rigorous risk management",
  no return-potential claim), Watson/Jeopardy aside, "invaluable", "Ready to get started?", "scientifically
  enhanced", "diversified alpha sources", "They will appear shortly", "eight million deaths" / "billions every
  year" (tobacco news), "billions of data points", "decades of experience".
- [ ] One firm descriptor: "systematic fixed income and alternative strategies" (home, about, footer; was also
  "multi-asset"), and "portfolio manager" (the registration category) rather than "investment manager".
- [ ] Dead i18n keys removed (`nav.theme.*`, `ui.chapter`); "nav as of" → "NAV as of".

### C. Facts to confirm (not changed)

The review's section C was not included in the brief; this list is compiled from the statements in the copy.

- [ ] Founding in **2013** by Marc Rivet and Gabriel Cefaloni; PRI signatory since **2018**; Tobacco-Free Finance
  Pledge **2024-04-23**; Dans la rue partnership **2023-10-03** (and "since 1988" for Dans la rue); Mageska
  partnership **2025-01-28** ("a portion of the Mageska Fund", portable alpha).
- [ ] Monthly Income launch **2021-10-05**, strategy track record since **2019-01**; Multi-Strategy and SEB launch
  dates and whether they show pre-launch history.
- [ ] Fondaction: "Québec labour-sponsored fund" that "entrusted Nymbus with sustainable bond mandates".
- [ ] Dealer platforms: National Bank Financial, RBC Dominion Securities, iA Financial Group; funds "available on
  FundServ"; "daily NAVs"; QEMP (Innocap) client list and logos.
- [ ] Futures margin "about 5 to 10 % of exposure"; GMV target downside volatility 3 %, 6 %, 9 % (6 % shown);
  System 1 "rebalanced every six months"; System 2 "continuous, on alerts".
- [ ] Exclusion thresholds and providers (5 % of revenue: coal, oil sands, thermal coal power; MSCI "severe"
  controversies; controversial weapons list); SEB green bonds; monthly carbon-intensity reporting.
- [ ] Team bios: Jean Turmel (NBF Financial Markets, OTPP chair, Diamond Jubilee Medal); Jean-Luc Landry ("over five
  decades", Montrusco Bolton, AIMCo, GardaWorld); team counts (PhDs, CFA charterholders) computed from `team.ts`.
- [ ] Contact: office hours (8:30 to 5:00 ET), "reply within one business day", complaints officer phone (L1).
- [ ] Complaints: 10 / 60 / 30 / 15 / 180 / 90 days, OBSI limit $350,000, AMF phone 1 877 525-0337.

## Concise copy 2026-09-30

Gabriel asked for a much less verbose site ("cut down on the text significantly, more bullet points, short sentences").
Branch `feat/concise-copy` condenses the copy of the pages below, EN and FR in parallel. **No new claim, figure or
promise was introduced**: every sentence is a shorter form of text already reviewed above (A/B items), or the same
text. Regulatory sentences inside a condensed block were kept word for word, and a unit test
(`tests/unit/site/concise-copy.test.ts`) fails if the overlay caveat ("designed to have low correlation … it may not do so
and can lose money"), the futures-exposure disclosure, the distributions sentence, the approach footnotes (\*, \*\*) or the
ESG-scope sentences disappear. Not touched: legal pages (complaints, code of ethics, privacy / Law 25),
`src/content/disclaimers.ts` (fund disclosures, footer disclaimers, firm disclaimer, gross / net markers, provenance
lines, "figures coming soon"), the fund header descriptions and taglines (`src/config/funds.ts`, mostly disclosure
wording), the six PRI principles (official wording), the contact form texts and regulatory names (AMF, OBSI, CIRO, PRI).

Changed pages (please tick once reviewed):

- [ ] **Home** (`src/components/site/home/copy.ts`, `news.ts`): hero lead, approach lead + 3 bullets, card texts
  (the "Risk management does not eliminate the risk of loss." sentence kept), strategies / process leads and step
  texts, CTA; news summaries and "Read more" texts shortened (Mageska, Tobacco-Free Finance Pledge, Dans la rue: same
  facts, the opinion sentence of the tobacco item and the closing sentence of the Dans la rue item removed). "Investment
  manager headquartered in Montreal" → "Portfolio manager based in Montreal" (registration category, item B).
- [ ] **Strategies index** (`strategies-copy.ts`): lead, comparison lead, CTA. Since-inception and "—" notes unchanged.
- [ ] **Solutions** (`solutions-copy.ts`): lead, profile intros and descriptions, benefit bullets, vehicle texts (the
  futures-overlay vehicle keeps "most of the capital stays invested in the bonds" and the futures-exposure disclosure). The
  minimum / suitability note unchanged.
- [ ] **Approach** (`copy-approach.ts`): hero, pipeline, bond-process, overlay, research and team leads; the four step
  paragraphs replaced by their bullets (3 per step; the bullet "Futures overlays designed to offset part of losses in
  stressed markets", which carried no caveat, was removed; step 4 keeps "Hedging seeks to limit losses in adverse
  conditions; it does not eliminate the risk of loss."); philosophy, lifecycle and capability cards shortened. The
  margin sentence now reads "Futures sit on top of the bonds, with a margin deposit of about 5 to 10% of exposure.\*\*"
  (same figure). Overlay caveat, futures-exposure disclosure and both footnotes verbatim.
- [ ] **Sustainability** (`copy-sustainability.ts`): hero and principles leads shortened before the ESG-scope sentence
  (kept verbatim), principle / integration / exclusion / commitment cards shortened (thresholds unchanged: > 5 % of
  revenue, MSCI "severe"), green-bond text (ICMA sentence kept), Fondaction text (second paragraph "shared
  commitment…" removed), PRI lead. Exclusions lead unchanged. The six principles unchanged.
- [ ] **Team** (`copy-about.ts`, `src/data/team.ts`): hero lead, intro as 4 bullets, values and milestones shortened;
  every biography cut to one or two sentences (facts kept are a subset of the previous bios; previous roles and education
  still listed in the dialog). Jean Turmel FR keeps « Financière Banque Nationale » (A15).
- [ ] **Contact** (`copy-contact.ts`): hero lead, form lead, "who to contact" texts, response time ("Usually within
  one business day. Urgent? Please call."), visit text. Form note about sensitive information unchanged.
- [ ] **Fund pages** (`src/components/fund/copy.ts`, `FUND_TEXTS`): "What the fund does" shortened; "Investment
  approach" is now 3 bullets plus the risk note in fine print (overlay caveat + futures-exposure disclosure, verbatim; GMV: the
  futures-exposure disclosure); the fund's own section (Monthly Income features, SEB sustainability, Multi-Strategy
  sub-strategies, GMV overlay) has a shorter lead and card texts, with the same disclosures in the same cards
  (distributions sentence on "Monthly distributions", caveat + futures exposure on the overlay cards, "it may not do so" on
  Hedging, the futures-overlay exception in the SEB lead).
- [ ] **Confirm** that no condensed sentence changed the meaning of a reviewed statement (full diff on the branch).
- [ ] **Independent review fixes (same day).** Fund Overview risk note (overlay caveat + futures exposure) now shown as a
  body-size callout next to the approach bullets, as prominent as them. Multi-Strategy: "An alternative fund of
  systematic strategies, designed to behave differently from stocks and bonds"; mean reversion "Takes positions when
  prices stray far from usual levels, expecting them to revert"; "Each with its own rules, designed for a distinct role".
  GMV summary back to the reviewed wording "A managed-futures overlay for institutional portfolios, offered through
  separately managed accounts." **Flag:** the Solutions page lists Global Minimum Volatility among the strategies that
  usually fit family offices (unchanged, pre-existing); confirm whether GMV is offered outside institutions.
  **Resolved — Gabriel 2026-10-01: primarily family offices, also institutions** (branch `fix/gmv-audience`): GMV
  summary now "A managed-futures overlay for family offices and institutions, offered through separately managed
  accounts." / « Une stratégie de superposition de contrats à terme gérés pour les bureaux de gestion familiale et les
  institutions, offerte en comptes gérés distincts. » (caveat sentence unchanged); GMV listed first for family offices
  on /solutions; the family-office "Managed accounts" vehicle names the GMV overlay and carries the futures-exposure disclosure
  verbatim. « bureaux de gestion familiale » kept (item B terminology), not « bureaux de famille ». Tobacco:
  "We exclude tobacco companies from the securities we select directly." (news, sustainability); the 2024 milestone on
  /team reads "Tobacco exclusion adopted". Margin sentence: "about 5 to 10% of their exposure" (« de leur exposition »).
  SEB metrics card: "Sustainability metrics such as carbon intensity, reported monthly for the portfolio and its index."
  Mageska news: "Mageska Capital entrusted Nymbus with the mandate: …". French: « durée » used for duration everywhere
  (as in the Portfolio tab's « Durée modifiée »; the approach bullet « Couverture de la duration » became « de la
  durée »). Fondaction section: lead plus three bullets taken from the previously reviewed Fondaction paragraph
  (labour-sponsored fund; positive economic, social and environmental impact; mission of responsible capital
  allocation). The unit test now also checks the French disclosures, the Solutions overlay exposure sentence, the
  Multi-Strategy hedging caveat, the approach step-4 note and the SEB overlay exception.

English word counts of the strings in these copy modules (body copy = prose sentences; headings, button labels,
meta descriptions, form labels and regulatory sentences counted apart; regulatory sentences only shrink where a
condensed sentence carried a regulatory keyword, e.g. the PRI naming, or where a caveat-free claim was removed):

| Page | Body copy before | after | cut | Headings/labels b→a | Verbatim disclosures b→a |
|---|---:|---:|---:|---:|---:|
| Home | 510 | 246 | 52 % | 100→100 | 15→15 |
| Strategies index | 115 | 62 | 46 % | 44→44 | 18→18 |
| Solutions | 331 | 187 | 44 % | 65→73 | 39→39 |
| Approach | 765 | 364 | 52 % | 212→218 | 72→47 |
| Sustainability | 305 | 172 | 44 % | 114→114 | 218→171 |
| Team (intro, values, milestones) | 301 | 141 | 53 % | 116→116 | 9→8 |
| Team bios | 834 | 349 | 58 % | 0→0 | 0→0 |
| Contact | 82 | 45 | 45 % | 51→55 | 0→0 |
| Fund pages (FUND_TEXTS) | 623 | 370 | 41 % | 67→70 | 191→191 |
| **Total** | 3866 | 1936 | 50 % | 769→790 | 562→489 |


## Home v2 (branch `feat/home-v2`, 2026-10-01)

Gabriel asked for an inspiring home page (AUM now C$1.9 billion, no daily NAV on the main page, a large animated
"scanning" analysis table), more motion, and less text. Please tick once reviewed:

- [ ] **AUM figure**: the firm content default `aumLabel` is now "$1.9B" / « 1,9 G$ » (Gabriel, 2026-10-01; one source
  of truth in `src/lib/data/defaults.ts`, editable in admin). Saved admin content that still holds the old default
  ("$1.8B+") is migrated to the new default; any other custom value is kept. Confirm the "as at" date and whether the
  figure needs a footnote (firm-level AUM, not fund NAV).
- [ ] **Home: no daily NAV, no "as of" widget.** The fund cards on the home page show returns only. Fund pages keep their
  NAV and disclosures unchanged.
- [ ] **Scanning analysis panel** (`src/components/site/fx/scan-copy.ts`, `AnalysisScan`): a canvas animation. It is
  labelled "Illustration only" in EN and FR, uses generic sector labels and generated values (no issuer names, no
  performance, no real holdings), and its counters ("data points", "securities", "signals") count only what the
  animation itself scans. **New numeric claims to confirm: none about the firm.** The panel title says "Scientists and
  engineers, solving the hard problems in finance" (Gabriel's words). Decision needed: keep or soften any wording that
  could read as "we analyse billions of data points" (the counters run into the millions/billions of illustrative cells).
- [ ] **Key figures card**: AUM, number of strategies, team size and number of PhDs come from firm content and
  `src/data/team.ts`; nothing hard-coded.
- [ ] **Copy cut again** (Home, Approach, Team/About, Sustainability, Solutions, Contact; legal excluded). Verbatim
  disclosures kept (overlay caveat, futures exposure, distributions, approach footnotes, ESG scope, "Risk management does not
  eliminate the risk of loss."). Removed: the Approach "philosophy" block, the research capability descriptions, card
  summaries on /team, the Fondaction bullets, and the **six PRI principles list on /sustainability** (the PRI signatory
  statement and link remain). Home Partners no longer lists the dealer platforms or client types by name.
  `tests/unit/site/word-budget.test.ts` keeps the pages from growing back.
## Home: "diversifying engines" band (branch `feat/home-overlay-viz`, 2026-10-02)

Gabriel asked for a visual "as impactful as science at scale" about protective overlays and low-correlation strategies
within the multi-strategy. New band right after science at scale (which is unchanged, guarded by
`tests/unit/site/scan-frozen.test.ts`). Copy: `src/components/site/fx/overlay-copy.ts` (EN + FR). Please tick once reviewed:

- [ ] **Generated illustration, not data.** A canvas animation of a generated bond reference (calm months and stress
  episodes, down months shaded), five lanes and a blended line, plus a concept heatmap. **Revised 2026-10-03
  (`fix/overlay-v3`)**: the lanes carry the Multi-Strategy Fund's four strategy names as on /approach and the fund page
  (Low volatility, Directional, Mean reversion, Hedging) plus a separate "Futures overlay" lane (the bond funds'
  overlay), which is **not** part of the blended line ("Four strategies combined (generated)"); panel title is generic
  ("Diversifying engines · down months", no "Multi-strategy"). Values are generated (no weights, no positions); every
  series has **zero drift** (unit test), so neither the blend nor the bond line trends up or down. No axis values, no
  percentages, no dates. "ILLUSTRATION · generated values" is drawn on the canvas; the chip says "Illustration"; the
  caption says "Our funds’ strategy names; generated values, not actual positions or results." Counters: "Simulated
  months / down months / engines / independent moves" (FR « Mois simulés », « Mois de baisse simulés », « Moteurs
  simulés », « Mouvements autonomes simulés »); highlighted lanes: "Highlighted: moves independently" (FR « En
  surbrillance : évolue indépendamment »). Only the drawing has `role="img"`; the counters are a readable list.
- [ ] **Correlation framed as a design objective, around down months** (downside correlation, Gabriel's standing view):
  lead "Strategies designed to have low correlation in down months."; heatmap titled "Down-month correlation · concept",
  computed on the generated down months only, colour scale "Opposite · Low · Together" with no numbers; caption "Low
  down-month correlation is a design objective, not a guarantee." "Uncorrelated" is never used (unit test).
- [ ] **Overlay claim**: pillar "Overlay — Futures designed to offset part of bond losses." (FR « Des contrats à terme
  conçus pour compenser une partie des pertes obligataires. »), consistent with the fund-page wording ("designed … to
  offset part of bond losses when volatility rises; it may not do so and can lose money"). Caption adds "Overlays and
  strategies can lose money." and, since 2026-10-03, the verbatim futures-exposure disclosure used on /approach and
  /solutions: "The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the
  underlying portfolio and may require additional margin." (FR as in the repo; unit test checks it word for word).
- [ ] **Visual reading risk**: during a generated stress episode the blended line dips less than the bond reference
  (that is the diversification idea being illustrated). Both have zero drift, so neither ends above the other over
  time. Confirm this generic depiction is acceptable in a sales communication with the caption above, and that no
  performance comparison is implied (no values, no axis, no period). Also confirm the fund's strategy names may label
  generated lanes.
- [ ] Other pillars: "Distinct engines — Each engine seeks a different source of return." and "Down months first —
  Diversification is judged when markets fall." (wording choice, not a factual claim about results).

## Fund pages v2 (2026-10-01): returns per class, rankings, GMV variants — to review

Branch `feat/fund-pages-v2`. Everything below is **new wording or a new kind of statement**; none of it has been
reviewed by compliance. All visitor-facing texts are in `src/components/fund/copy.ts` (EN and FR).

| # | Change | Where | Verify |
|---|---|---|---|
| F1 | **Wording of the overlay exposure reduced.** A borrowed-money term became "futures exposure on top of the underlying portfolio" (FR « exposition additionnelle au moyen de contrats à terme »). The pipeline no longer parses two bond-fund characteristics (a liquidity score and a credit-exposure metric), so they cannot be published. A unit test fails the build if the removed terms (listed in `tests/unit/site/fonts-and-wording.test.ts`) appear in the page copy, the fund registry, the parse specs or the sample data. | Fund copy, approach and solutions pages, `src/config/funds.ts` | Does the reworded text still leave the futures overlay adequately described and its risks disclosed (the risk text and the prospectus / OM still carry the full disclosure)? Is a general "derivatives used" risk statement needed in its place? |
| F2 | **Returns follow the selected class (default F).** Headline returns, growth of $10,000, calendar years and risk statistics are those of the class selected next to the NAV; a class without its own series says "Performance figures for series X coming soon". A class's figures are never taken from another class. | Fund pages, header and Performance tab | Which class is the default per fund: Monthly Income F (LDM081, prospectus), SEB F (LDM201), Multi-Strategy F (LDM301). Until the dataplatform serves LDM081, the Monthly Income page opens on "coming soon" (FP LDM001 is one click away). |
| F3 | **Series with under 12 months of history** show only the periods that exist, are never annualized, have no risk statistics, and say "Since series inception (<month>): only the periods this series has completed are shown." | Header strip, Overview, Performance tab | **Conflicts with the "12 months" convention mentioned in row 3 above.** Confirm that publishing returns for a series younger than one year is permitted (NI 81-102 Part 15, sales communications: rules on performance data for a fund or series with less than 12 months of history, to confirm). If not allowed, set the threshold in `src/lib/pipeline/classes.ts` (`short`) to drop such classes instead. |
| F4 | **"Prospectus class" / "Offering memorandum class" badge** next to the class selector and in the series table, with a one-line disclosure ("offered under the simplified prospectus" / "offered by offering memorandum, to eligible investors only"). Registry: LDM081 F prospectus, LDM001 FP offering memorandum. Every other class shows **no label** until an admin sets its type (*Admin → Funds → class types*). | Fund pages | Which classes are prospectus vs OM. The registry defaults above come from Gabriel's brief. FR « Série à prospectus » / « Série à notice d’offre ». Is the OM sentence enough, or must OM series carry the full exempt-distribution legend? |
| F5 | **SEB class H.** The dataplatform series the site used until now is class **H** (LDM202), not F; the old pages showed it as "Series F". It is now labelled H (merged with the data-driven class label of `fix/seb-class`), and class F (LDM201) shows its own series once the dataplatform serves it (PR #626); until then F says "coming soon" and H is one click away. | SEB page | Confirm the earlier "F" label was wrong, and whether the previously published figures need a correction notice. |
| F6 | **Awards and rankings tab** (admin-editable, seeded 2026-10-01): Fund Library category rank and quartile per period, category name, "as at" date, FundGrade letter, and (only when set) a Morningstar star rating, each with its source link. Wordmarks are plain text, not logos. Disclosure under the table: third-party data, reproduced as at the date shown, not updated daily, number of funds ranked varies by period, past performance does not predict future results, rankings are not guarantees, see the source for the methodology. | Fund pages, tab *Awards and rankings* | (a) Rules for presenting rankings and ratings in sales communications (NI 81-102 Part 15 and CSA staff guidance on rankings, to confirm: category, number of funds, period and source given, ranking current, shown only for the series ranked). (b) Whether FundGrade and Fund Library may be named and linked, and whether their terms need a licence or written permission (**official logos are not used and must not be dropped in without permission**). (c) Whether a ranking of an OM series (Monthly Income FP) may be shown on a public page. (d) The **French category names are our translation** of the source's English names (« Revenu fixe canadien », « Revenu fixe canadien de base plus », « Multistratégies alternatives »): replace with the official CIFSC French names. (e) Staleness: the figures are as at 2026-08-31 and are edited by hand; decide a maximum age after which the tab is hidden. |
| F7 | *(superseded by W1–W3 below: the rating stated by Nymbus is seeded and shown.)* **Morningstar rating: not published.** The Morningstar pages could not be read when the data was collected, so **no star rating is on the site**. The two bond funds are believed to be rated 5 stars, but that is unconfirmed. An admin can enter one (*Admin → Funds → awards and rankings → Morningstar*); it then shows with its "as at" date and source. | Fund pages | Confirm the rating, class, category and date on the Morningstar page, and the right to cite it, before entering it. |
| F8 | **CIFSC category** is shown in the facts table: the admin's value, else the Fund Library category when it is the only one. | Fund pages, key facts | The categories above are the Fund Library names, assumed to equal the CIFSC categories. |
| F9 | **New fund facts shown only when filled by an admin**: minimum subsequent investment, RSP eligibility, liquidity (redemption terms), portfolio managers. Management fee, MER and minimum investment already existed. Nothing is shown by default and nothing is invented; fund assets stay hidden. | Fund pages, key facts and fees | Fill these only from the prospectus / OM / fund facts. |
| F10 | **Top 10 holdings total** shown only when ten holdings are listed. Document shortcuts (factsheet, fund facts, prospectus) in the header appear only when a published document of that type exists; new document types *proxy voting* and *tax factors*. | Portfolio tab, header, Documents | Proxy voting and tax factors are the Lysander-style document slots; no document is uploaded yet. |
| F11 | **GMV variants 3 % / 6 % / 9 %** (target downside volatility): a selector switches returns, growth, calendar years, risk, characteristics and allocation. Default 6 %. Gross figures only, no class selector, no NAV, no distributions tab. | GMV page | The gross-of-fees wording applies to every variant (row 6); whether net figures must accompany each variant; whether the 3 % and 9 % variants may be shown publicly. |
| F12 | **Fonts**: every font on the site is Poppins (test enforced). | Whole site | None. |

## Awards v2 (branch `feat/awards-v2`, 2026-10-02) — to review

Gabriel's requests: Morningstar 5 stars and logo on the overview of each bond fund (real assets, not imitations); the RBC
Investor Services pooled fund survey with source and date and a quarterly freshness check; the funds' standing in
eVestment, RBC, LSEG/Lipper and GMR for advisors. Nothing below has been reviewed by compliance. Texts:
`src/components/fund/rankings-copy.ts` (EN / FR).

| # | Change | Where | Verify |
|---|---|---|---|
| W1 | **Morningstar Rating™ on the Overview tab** of Monthly Income and SEB (side column) and in the awards tab: "Morningstar Rating™: 5 stars", Series F, as of October 1, 2026, source link to the fund's Morningstar page. Seeded from Nymbus' statement (the Morningstar pages were not machine-readable). | Fund pages | (a) Confirm stars, class (F for both? Monthly Income's F is LDM081), category and date on Morningstar before go-live. (b) **"Out of N funds" is shown (fund pages and /solutions) only when an admin enters N; Morningstar normally REQUIRES the number of funds in the category (and the 3/5/10-year ratings) next to an overall rating — the rating is currently shown without it: enter N before go-live, or hide the rating.** (c) Right to cite the rating publicly (Morningstar licensing). |
| W2 | *(files now provided: see W8.)* **Official Morningstar logo / star images only from delivered files.** No look-alike stars are drawn (the previous CSS stars and the red uppercase "MORNINGSTAR" wordmark were removed; provider names are now neutral text). Until the files are present the rating is text. | Fund pages, /solutions | Obtain the official artwork and the permission to use it; drop files in `public/brand/third-party/` (`morningstar-logo.svg`, `morningstar-stars-5.svg`, …) or upload them in admin settings. |
| W3 | **Morningstar attribution and methodology text** next to every rating (EN / FR): "© {year} Morningstar Research Inc. All rights reserved. The information contained herein: (1) is proprietary to Morningstar and/or its content providers; (2) may not be copied or distributed; and (3) is not warranted to be accurate, complete or timely…", plus "reflects performance as of {date} and changes monthly… calculated from its 3-, 5- and 10-year returns… top 10% 5 stars… for the series shown only… Past performance does not predict future results." | Fund pages, /solutions | **Wording written from the disclaimer Morningstar usually requires; verify against Morningstar's current licence terms** (exact entity name — Morningstar Research Inc. in Canada —, risk-free/peer group wording, French translation, whether "out of N funds" and the 3/5/10-year ratings are mandatory). |
| W4 | **RBC Investor Services pooled fund survey entries** (admin-editable, hidden until confirmed with URL and quarter-end date): "RBC Investor Services Pooled Fund Survey — Q2 2026", class, peer group, period ended, percentile per period ("1st percentile"; FR « 1er centile »), source link, and a note: percentile = rank in the peer group, 1st = top 1 %, reproduced from the source as at the date shown, methodologies differ, past performance. *(Superseded by W9: the Q2 2026 figures, read by Nymbus, are published.)* | Fund pages (awards tab), /solutions | (a) Whether survey percentiles of a pooled fund / series may be shown in public sales communications, and for which series (the survey ranks pooled funds; are the bond funds listed under the same names/classes?). (b) RBC's terms of use of the survey (citation, permission). (c) French name of the survey (« Sondage sur les fonds en gestion commune de RBC Services aux investisseurs » is our translation). (d) "1st percentile across all periods" must be verified period by period. |
| W5 | **eVestment, LSEG Lipper, GMR** entries (same structure, admin-editable, hidden until confirmed). Provider names are text unless official logos are supplied. | Fund pages, /solutions | Licences / permission to cite each provider publicly; whether peer-group rankings from institutional databases (eVestment) may be shown to retail visitors; what "GMR" must be called in full. |
| W6 | **Advisor rankings list on /solutions** (advisors section): per fund, every confirmed, current ranking or rating with provider, figures, series, category, as-at date and source link; general note ("provided by the third parties named… not guarantees… see each source") + Morningstar attribution when a rating is listed. | /solutions | Gabriel's sentence "our funds have been amongst the top percentiles in their respective categories since launch according to eVestment, RBC pooled fund survey, LSEG/Lipper, GMR" is **not** used as copy: only the sourced figures are listed. Confirm that this presentation (no summary claim) is acceptable, and whether the page must say it is intended for advisors. |
| W7 | **Staleness rule**: every ranking / rating is hidden once its as-of date is older than N months (admin settings, default 6); the weekly RBC check flags a newer survey to the admin but never changes the page by itself. | Whole site | Is 6 months the right limit (CSA guidance on "current" rankings may require the most recent available period — e.g. hide an RBC quarter as soon as the next survey is out)? |
| W8 | **Official Morningstar logo and 5-star image now shown** (`public/brand/third-party/morningstar-logo.png`, `morningstar-stars-5.png`, files provided by Gabriel, who states Nymbus holds the permission to use them, 2026-10-03), on the Overview and awards tabs of both bond funds and in the /solutions rankings list, with the text alternative "Morningstar Rating™: 5 stars", series, as-of date, source link and the attribution of W3. | Fund pages, /solutions | Keep the written permission / licence on file; confirm the files are the current official artwork and that the rating image matches the rating shown (5 stars). |
| W9 | **RBC Investor Services Pooled Fund Survey Q2 2026 published** (periods ending 2026-06-30; PDF https://www.rbcis.com/assets/rbcits/docs/FINAL_EN_Pooled_Fund_Survey_Q2_2026.pdf, figures read by Nymbus): SEB — "Canadian Fixed Income" (p. 21), percentile 1 for 1 quarter, 1, 2, 3 and 5 years and the one-year periods ending June 30 2023–2026; Monthly Income — "Canadian Short Term Fixed Income" (p. 26), **4th percentile for 1 quarter**, 1st for 1, 2, 3 and 5 years and the one-year periods 2023–2026. Shown as "Fund as a whole (not a specific series)" — the survey ranks the fund (strategy track record since Jan-19), not a series — with the **basis next to the figures: "Survey basis: returns gross of management fees, in Canadian dollars; percentile rank 1 = best."** (FR « avant déduction des frais de gestion, en dollars canadiens »). Returns are stored for reference but not displayed. Nowhere does the site say "1st percentile across all periods". | Fund pages (awards tab), /solutions | (a) Gross-of-management-fees survey ranks next to net-of-fees fund returns: is the basis line enough, or must the net standard performance be shown alongside (the /solutions list links to it)? (b) Fund-level ranking (pre-launch strategy history since Jan-19) shown on series pages: acceptable, and is a pre-launch note needed? (c) Monthly Income's survey category (short term) vs its Fund Library category (core plus): explain or accept. (d) RBC's terms for citing the survey. |

## Content v3 (2026-10-02): risk-first approach, multi-strategy, team credentials, use cases, ESG scope — to review

Branch `feat/content-v3`. Gabriel's eight requests of 2026-10-02. Everything below is **new wording or a new kind of
statement**; none of it has been reviewed by compliance. EN and FR texts: `src/components/site/pages/copy-approach.ts`,
`copy-about.ts`, `solutions-copy.ts`, `copy-sustainability.ts`, `src/components/site/home/{copy,news}.ts`,
`src/data/team.ts`. Tests: `tests/unit/site/content-v3.test.ts`, `tests/unit/site/esg-scope.test.ts`, `e2e/content-v3.spec.ts`.

| # | New claim / change | Where | Verify |
|---|---|---|---|
| V1 | **"Every strategy starts with risk"**; "Ultra-micro analysis, at scale: each asset weighed for its risk" (Gabriel's term); "Each bond studied on its own, across entire universes"; "Bond universes screened for the most attractive assets for their risk". Illustration (labelled "Illustration only") of a universe scan with a magnifier on one bond (yield, credit, duration, risk-adjusted score; no real data). | /approach, new section after the hero | Method description, not an outcome. Is "the most attractive assets for their risk" acceptable (no "best")? |
| V2 | **"Protective overlays"**: "Futures overlays designed to have low correlation with bonds (risks below)"; the full overlay caveat and exposure disclosure are further down the page (unchanged). | /approach risk-first section | Is the adjective "protective" acceptable for the overlay (it may not protect)? Alternative: "overlays designed to offset part of bond losses". |
| V3 | **Multi-strategy, "a liquid alternative"**: "systematic strategies across asset classes, designed to have low correlation with stocks and bonds". Illustrative diagram: four strategies (low volatility, directional, mean reversion, hedging — the Multi-Strategy Fund's own list) × five asset classes (**rates, credit, equity indices, currencies, commodities**) under a "protective overlay · listed futures" band; note: "Illustration only: allocations change over time and not every strategy trades every asset class. Low correlation is an objective, not a guarantee." + the overlay futures-exposure disclosure verbatim. | /approach, new section after the overlay | (a) The asset-class list is **to confirm** (commodities?). (b) "Liquid alternative" is a defined term in Canada (NI 81-102 alternative mutual funds): may it describe the Multi-Strategy Fund / the strategies? If not, use "an alternative strategy". |
| V4 | Pipeline bullets added: "Allocation across strategies and asset classes" (portfolio construction), "Overlays sized to a downside-volatility target" (risk management). | /approach pipeline | None expected. |
| V5 | **Three ways to access** the strategies: "Bond funds with an overlay — Monthly Income and Sustainable Enhanced Bonds"; "Multi-Strategy Fund — several systematic strategies in one fund"; "Global Minimum Volatility — the overlay alone, on top of your portfolio". | /approach | Both bond funds use the overlay (as their fund pages already say). |
| V6 | **Team data from the nymbus-decks team list** (`data/seed/team.json`, the source of decks.nymbus.ca): titles, years of experience, education, designations, LinkedIn, portraits (self-hosted under `public/team/`, WebP, ≤ 400 px). Title changes vs the old site: Mathieu Poulin-Brière "Partner, Systematic Overlays" (was Vice-President), Jean-Philippe Lejeune "Quantitative Developer & Trader" (was Associate PM & Quantitative Developer), Jessica Martins "Quantitative Researcher & Data Scientist" (was Team Lead, Quantitative Research), Olivier Cyr-Choinière "Quantitative Analyst" (was Quantitative Researcher), Lyes Hammadi "Lead Software Engineer, Investments". Experience updated: Gabriel 19 years (was 18), Jean-Philippe 11 (was 10), François-Olivier 25 (was 23), Marc 30 (the old summary said 32+). Guy Liébart, Jason Laliberte, Luca Ieraci and Xavier Girard are not in the decks list and keep their previous data. **Not used**: the decks LinkedIn URLs of Fraser Coburn and Danira Csano (they point to other people's profiles); university / employer logos (credentials are text only). | /team, /approach (faces) | (a) Which titles are current (decks vs old site)? (b) Consent of each person to publish the portrait and LinkedIn link on the public site. The WordPress team (when configured) still takes precedence over this static list. |
| V7 | **Credentials band** (counted from the team list at render time, board included, people counted once): **2 PhDs, 3 engineering or computer-science degrees, 9 master's and doctoral degrees, 6 CFA or CIM holders, 332+ years of combined experience** (sum of the stated years; "+" because two figures are "+40" and four people have no stated figure). Heading "Scientists, engineers and charterholders"; lead "The scientific method, applied to bonds and listed futures." Short credential badges on each person (PhD, CFA, CIM highlighted; CPA, M.Sc., MBA). The /team hero card keeps people + founding year (the counts moved to the band); /approach team stats now read "PhDs" (was "PhDs in physics") and "CFA or CIM holders" (was "CFA charterholders": the count now includes CIM). | /team, /approach | (a) "Charterholders" strictly fits CFA; CIM is a designation — acceptable in a heading? (b) "Engineering or computer-science degrees" counts degrees in engineering / computer science (Gabriel, Lyes, Olivier), not licensed engineers (no "ing." / P.Eng. claimed). (c) Combined experience overlaps (years at other firms), as is customary. |
| V8 | **Equal room for overlays in the team wording**: about intro "Two core specialties: systematic fixed income and futures overlays"; "Bonds analyzed one by one; listed futures traded systematically"; hero lead "Independent Montreal manager of systematic fixed income and futures overlays, since 2013"; bios of Gabriel (from systematic fixed income to futures overlays), Mathieu (leads the overlay strategies on listed futures, across asset classes), Jean-Philippe (for bonds and listed futures), Jessica (bond selection and futures signals), Marc (to run systematic fixed income and derivatives strategies). | /team | Roles as described are accurate? |
| V9 | **Solutions use cases** (each labelled "Illustrative use case" + "Illustrative only: not a client testimonial and not a promise of performance"): **Pension plan** — bonds matched to long-term liabilities, actively managed to seek added value; a protective futures overlay on top, "seeking to beat inflation whether rates rise or fall"; most of the capital stays in the bonds; note: "The overlay may not reach its objective and can lose money." + overlay exposure disclosure. **Family office** — existing positions serve as collateral for the futures; overlay sized to a targeted downside volatility; the existing portfolio stays invested; note: same two sentences + "Positions held as collateral may have to be sold to meet margin calls." **Advisors** — systematic fixed income core on FundServ; "a liquid alternative sleeve to diversify"; documents and due diligence support. **No ranking claim in the copy.** Rankings are **not** inside the illustrative use case: they have their own small section "Third-party rankings" right after the advisors card (`fix/awards-v3`), listing per fund each confirmed, current item with provider, series, period(s), rank / percentile, "out of N" where available, as-of date and source link, plus a link to the fund's standard performance (fund page, Performance tab), the general third-party note and the Morningstar attribution. | /solutions, one card per audience | (a) "Seeking to beat inflation whether rates rise or fall" (Gabriel: "regardless of what interest rates are doing") — acceptable as an objective? (b) Collateral wording: which positions are eligible, broker / custodian arrangements. (c) "Liquid alternative" (see V3). (d) Rankings section: see W4–W7; whether the standard-performance link next to the rankings is sufficient, or the standard performance must be shown on /solutions itself. |
| V10 | Institutional benefit changed: "Your own responsible-investment guidelines, if your policy sets them" (was "Customizable ESG integration and exclusions"). | /solutions | Can segregated mandates follow a client's own responsible-investment guidelines? |
| V11 | **ESG scope = Sustainable Enhanced Bonds Fund only** (Gabriel: "only our sustainable enhanced bond fund has these exclusions"). /sustainability rewritten: H1 "Our commitments, and a sustainable bond fund"; firm level = PRI signatory since 2018, Tobacco-Free Finance Pledge (2024, "an initiative led by Tobacco Free Portfolios"), Fondaction mandates; integration, exclusions and green bonds are introduced as the fund's ("The Sustainable Enhanced Bonds Fund excludes the issuers below, as set out in its offering documents. Our other funds and strategies do not apply these exclusions."). Home process step: "Optimization within each mandate's risk and liquidity limits" (was "… risk, liquidity and sustainability limits"). News (Tobacco-Free pledge) summary: "A firm commitment; tobacco is among the Sustainable Enhanced Bonds Fund's exclusions" (was "We exclude tobacco companies from the securities we select directly"). A unit test fails if exclusion / ESG-screen wording appears on a firm-level page without the fund's name in the same block. | /sustainability, home, news | (a) **Does the Tobacco-Free Finance Pledge commit the firm to exclude tobacco beyond the SEB fund?** If yes, the pledge and the "only SEB" scope conflict: decide the wording. (b) Fondaction "sustainable bond mandates" kept as a client mandate fact. (c) Exclusion list unchanged (fund's offering documents). |
| V12 | **Global Minimum Volatility figures always name their variant**: the home tile, the strategies table and the solutions fund links show the default variant's own figures labelled "6% downside volatility" / « volatilité à la baisse de 6 % » (no longer the top-level series); an unpublished variant shows "figures coming soon". A unit test fails if copy pairs the strategy with a percentage without naming the downside-volatility variant. | Home, /strategies, /solutions | Row F11 above (which variants may be shown publicly). |

### Content v3 — fixes after the independent review (2026-10-03, branch `fix/copy-v3`)

These rows **replace** the wording quoted in V2, V3, V6, V7, V9, V11 and V12 above where they differ.

| # | Change | Where | Verify |
|---|---|---|---|
| R1 | **Pledge vs SEB-only (V11)**: the sentence "Our other funds and strategies do not apply these exclusions" is removed. Attribution only: "The ESG criteria and exclusions below are those of the Sustainable Enhanced Bonds Fund, as set out in its offering documents" (hero: "… on this page are those of the Sustainable Enhanced Bonds Fund"). Pledge items describe the firm's signature only: "Signatory of the Tobacco-Free Finance Pledge since 2024"; "The firm's signature of an initiative led by Tobacco Free Portfolios"; news summary "A commitment by the firm to an initiative led by Tobacco Free Portfolios" (was "A firm commitment; tobacco is among the SEB fund's exclusions"). FR pledge name everywhere « Engagement pour une finance sans tabac », news title included. A test fails if a pledge text says "exclu…" or the page mentions "other funds". | /sustainability, news | Still open: what the pledge commits the firm to. |
| R2 | **"Protective" removed (V2)**: the approach item is now "Futures overlays — designed to offset part of bond losses, with low correlation with bonds in down months (risks below)"; the diagram band reads "Futures overlay · designed to offset part of bond losses". | /approach | — |
| R3 | **Pension use case (V9)**: "A futures overlay on top, designed to offset part of bond losses, with an objective of returns above inflation over a full rate cycle" (FR « … avec un objectif de rendement supérieur à l’inflation sur un cycle complet de taux »). The overlay disclosure stays on both overlay use cases and on /approach (checked). | /solutions | Is "over a full rate cycle" acceptable? |
| R4 | **"Liquid alternative" (V3, V9)** replaced by "a liquid, cross-asset alternative strategy" / « une stratégie alternative liquide et multi-actifs ». | /approach, /solutions | Use "liquid alternative" only if the Multi-Strategy Fund is an alternative mutual fund (NI 81-102). |
| R5 | **Down-month correlation**: every "designed to have low correlation with bonds" in the approach page, the fund pages (FUND_TEXTS, registry descriptions, GMV tagline) and /solutions now reads "… with bonds in down months" (FR « … lors des mois de baisse »). | /approach, fund pages, /solutions | The overlay caveat (row 3 of the fund pages) changed wording: re-check it as a whole. |
| R6 | **Team (V6, V7)**: the four people not in the decks list (Guy Liébart, Jason Laliberte, Luca Ieraci, Xavier Girard) keep their previous data and are not described as decks data; Guy Liébart's 59 years (not from the decks) no longer count. **Combined experience is now 273+ years**; other counts unchanged (2 PhDs, 3 engineering & computer-science degrees, 9 master's and doctoral degrees, 6 CFA or CIM holders). Titles aligned with the decks: Gabriel's previous role "Partner & Portfolio Manager, GC Capital"; Lyes "Senior Engineer, Vertex AI" / "Engineer, IBM Watson"; Diane "Senior Compliance Manager" / "Practice Leader, Asset Management Compliance"; Mathieu FR « Associé, stratégies systématiques »; Fraser FR « Directeur, relations avec la clientèle ». Guy's and Xavier's portraits are still served from www.nymbus.ca (not in the repo). | /team | — |
| R7 | **Québec "ingénieur"**: the site no longer calls its people engineers: about band "Scientists, technologists and investment professionals" / « Scientifiques, informaticiens et analystes », home hero "Scientists and technologists…" / « Des scientifiques, des informaticiens et des analystes… », about intro and careers line likewise; the count reads "Engineering & computer-science degrees" / « diplômes en génie et en informatique » (degrees, not titles); « titulaires de titres CFA ou CIM »; badges expand CIM as « Gestionnaire de placements agréé ». The frozen "Science at scale" band (`scan-copy.ts`, hash-pinned) still says « Des scientifiques et des ingénieurs » — **needs Gabriel's sign-off to change**. Lyes's own job title (« Ingénieur logiciel principal ») is kept as in the decks. | Home, /team | Lyes's title and the frozen band. |
| R8 | **French "downside volatility"** is « volatilité à la baisse » everywhere (registry, fund pages, approach, solutions); a test forbids « baissière ». "Fundserv" spelling in visitor copy (test). FR « catégorie(s) d’actifs » on /strategies and /solutions. Eyebrow « Titres et diplômes ». | Whole site | — |
| R9 | **"Bond funds with an overlay"** card says "Both bond funds use the futures overlay" and links to both fund pages (Monthly Income and Sustainable Enhanced Bonds: both fund pages describe the overlay). | /approach | Confirm both bond funds use the overlay. |
| R10 | Accessibility: darker gradient behind the key credential badges and the overlay band (white text ≥ 4.5:1), "(opens in a new tab)" / « (s’ouvre dans un nouvel onglet) » on the LinkedIn link, portrait images carry width/height. | /team, /approach | — |

## Copy v4 (branch `feat/copy-v4`, 2026-10-03) — to review

Gabriel's requests of 2026-10-03. Rows replace earlier wording where they differ.

| # | Change | Where | Verify |
|---|---|---|---|
| C1 | **Team portraits** (Gabriel consents to the photos and LinkedIn links): the 14 decks people keep the decks.nymbus.ca team photos (`nymbus-decks/data/seed/team.json`, the store the keynote team slides render from; no newer portrait exists in the repository: the prospectus and GMV keynote decks embed the same pictures). **Xavier Girard** now uses his portrait from the governance slide of the v3 keynote GMV deck (`decks/nymbus-capital-global-minimum-volatility-6/en.pptx`), and that slide's "4 years of experience" (combined experience now **277+**). Guy Liébart is in no deck: his www.nymbus.ca photo stays. All portraits re-encoded WebP ≤ 400 px, no metadata. | /team, /approach | Photos uploaded later in the live decks studio (Northflank volume, not reachable from here) would not be picked up. |
| C2 | **"Scientists, engineers and market veterans"** (EN) / « Des scientifiques, des développeurs et des vétérans des marchés » (FR: « ingénieur » is a protected title in Québec, so people are not called « ingénieurs »): home hero, about meta description, credentials band ("Scientists, engineers and market veterans" / « Scientifiques, développeurs et vétérans des marchés »), about intro, approach team section, careers line, and the **Science at scale band** (title + third card "Market veterans — Decades in fixed income and derivatives." / « Vétérans des marchés — Des décennies en revenu fixe et en dérivés. »; second card FR « Développeurs »). The band's animation and engine are unchanged; its fingerprint test notes "copy changed at Gabriel's request 2026-10-03". | Home, /team, /approach | EN "engineers" is approved by Gabriel; FR « développeurs ». |
| C3 | **Tobacco-Free Finance Pledge**, worded as a firm-level signature (date unchanged, 2024): "A firm-level signature. The pledge, an initiative of Tobacco Free Portfolios hosted with UNEP FI, encourages signatories to consider tobacco-free policies across lending, insurance and investment." News body: "Nymbus signed the Tobacco-Free Finance Pledge, an initiative of Tobacco Free Portfolios hosted with UNEP FI. Signatories are encouraged to consider adopting tobacco-free finance policies across lending, insurance and investment." No firm-wide portfolio exclusion is claimed; ESG exclusions stay attributed to the Sustainable Enhanced Bonds Fund. No logo. **Source**: Ontario Teachers' Pension Plan, "Global leaders launch Tobacco-Free Finance Pledge" (2018), https://www.otpp.com/en-ca/about-us/news-and-insights/2018/global-leaders-launch-tobacco-free-finance-pledge/ | /sustainability, news | Resolves R1's open question as worded. |
| C4 | **"Liquid alternative" approved for Multi-Strategy** (Gabriel, 2026-10-03; supersedes R4): approach lead "A liquid alternative across asset classes, designed to have low correlation with stocks and bonds in down months"; "Three ways" card "A liquid alternative, Alternative Multi-Strategy category" / « catégorie Multistratégies alternatives »; Multi-Strategy fund summary "A liquid alternative fund of systematic strategies…" and feature lead "Alternative Multi-Strategy category: distinct roles, diversified sources of return"; solutions "Liquid alternatives designed for low down-month correlation", advisors "A liquid alternative to diversify". **Inflation wording "over a full rate cycle" approved** (R3). | /approach, Multi-Strategy page, /solutions | Category name to match the fund's official CIFSC category. |
| C5 | **Text cuts** (Gabriel: "a little bit too much text"): body copy trimmed on home, about, approach, solutions, strategies index and the fund-page marketing texts; every disclosure kept verbatim (overlay exposure, low-correlation caveat, distributions, hedging note, footnotes, ESG scope, illustration labels). Removed or shortened: two approach pipeline bullets (transaction-cost optimization, regime detection), the risk-section lead ("Ultra-micro analysis, at scale."), bond-process steps, use-case titles and steps, credentials note, strategies lead / dash note / CTA, fund feature leads and cards (Monthly Income, SEB metrics card, Multi-Strategy mean reversion, GMV stack card). Word budgets lowered (`word-budget.test.ts`), FUND_TEXTS get their own ceiling. | Public pages | No meaning change intended; the removed approach bullets are method details only. |
| C6 | **Live decks.nymbus.ca team (2026-10-03, /api/team, fetched by the coordinator)**: newer portraits for Jennifer Pinkerton, Danira Csano, Jean-Philippe Lejeune, Gabriel Cefaloni, Fraser Coburn and Lyes Hammadi (re-encoded WebP 320 px, colour profile converted to sRGB and removed, no metadata). Two new people, both Operations / business development: **Léana D’Imperio**, Manager, Business Development (6 years; MBA; CIM — the live entry's typo "managert (im)" read as CIM / « gestionnaire de placements agréée (CIM) »; previous roles relationship manager, business markets; business development associate; financial advisor; LinkedIn) and **Philippe Rivet**, Manager, Business Development (10 years; BBA, international business & economics; previous roles global marketing manager, digital & channel; marketing operations manager; LinkedIn). Live title for Jean-Philippe Lejeune: "Quant Developer & Trader" (FR unchanged); Lyes Hammadi's « Ingénieur logiciel principal, placements » is kept as his own job title only. Fraser Coburn's and Danira Csano's decks LinkedIn links are still skipped (they point to other people). **Counts now: 20 people, 2 PhDs, 3 engineering & computer-science degrees, 10 master's and doctoral degrees, 7 CFA or CIM holders, 293+ years of combined experience.** Gabriel consented on 2026-10-03 to the portraits and LinkedIn links. | /team, /approach | Confirm the two newcomers' consent to their portrait and LinkedIn link. |
