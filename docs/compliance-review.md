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
  *To confirm:* that class F has a track record from 2019-02 (otherwise the dataplatform's full history will not
  start at the track-record start and the site stays on class H).
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
  fund pages, approach, solutions, home, news). The leverage disclosure ("The overlay adds leveraged futures
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
and can lose money"), the leverage disclosure, the distributions sentence, the approach footnotes (\*, \*\*) or the
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
  futures-overlay vehicle keeps "most of the capital stays invested in the bonds" and the leverage disclosure). The
  minimum / suitability note unchanged.
- [ ] **Approach** (`copy-approach.ts`): hero, pipeline, bond-process, overlay, research and team leads; the four step
  paragraphs replaced by their bullets (3 per step; the bullet "Futures overlays designed to offset part of losses in
  stressed markets", which carried no caveat, was removed; step 4 keeps "Hedging seeks to limit losses in adverse
  conditions; it does not eliminate the risk of loss."); philosophy, lifecycle and capability cards shortened. The
  margin sentence now reads "Futures sit on top of the bonds, with a margin deposit of about 5 to 10% of exposure.\*\*"
  (same figure). Overlay caveat, leverage disclosure and both footnotes verbatim.
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
  approach" is now 3 bullets plus the risk note in fine print (overlay caveat + leverage disclosure, verbatim; GMV: the
  leverage disclosure); the fund's own section (Monthly Income features, SEB sustainability, Multi-Strategy
  sub-strategies, GMV overlay) has a shorter lead and card texts, with the same disclosures in the same cards
  (distributions sentence on "Monthly distributions", caveat + leverage on the overlay cards, "it may not do so" on
  Hedging, the futures-overlay exception in the SEB lead).
- [ ] **Confirm** that no condensed sentence changed the meaning of a reviewed statement (full diff on the branch).
- [ ] **Independent review fixes (same day).** Fund Overview risk note (overlay caveat + leverage) now shown as a
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
  on /solutions; the family-office "Managed accounts" vehicle names the GMV overlay and carries the leverage disclosure
  verbatim. « bureaux de gestion familiale » kept (item B terminology), not « bureaux de famille ». Tobacco:
  "We exclude tobacco companies from the securities we select directly." (news, sustainability); the 2024 milestone on
  /team reads "Tobacco exclusion adopted". Margin sentence: "about 5 to 10% of their exposure" (« de leur exposition »).
  SEB metrics card: "Sustainability metrics such as carbon intensity, reported monthly for the portfolio and its index."
  Mageska news: "Mageska Capital entrusted Nymbus with the mandate: …". French: « durée » used for duration everywhere
  (as in the Portfolio tab's « Durée modifiée »; the approach bullet « Couverture de la duration » became « de la
  durée »). Fondaction section: lead plus three bullets taken from the previously reviewed Fondaction paragraph
  (labour-sponsored fund; positive economic, social and environmental impact; mission of responsible capital
  allocation). The unit test now also checks the French disclosures, the Solutions overlay leverage sentence, the
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

