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
| 3 | Rates of return (`returnsNet`): historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of distributions, excluding sales, redemption, distribution and optional charges and income taxes | Footer; fund pages (net-of-fees funds) | Net of which fees (management fee, expenses, MER). Class shown per fund. Annualization (the site annualizes periods of 2 years and more). |
| 4 | Benchmark (`benchmark`): broad-based FTSE Canada index, comparison only, not investable | Footer; fund pages with a benchmark | Benchmark names. Monthly Income: FTSE Canada Short Term Corporate (`short_corp`). All index figures are computed from FTSE data, so they can differ from older factsheets, which used the XSB/XBB ETFs before May 2026. SEB: FTSE Canada Universe. Is "broad-based" accurate? |
| 5 | Performance before the fund's launch (`preInception`): Monthly Income launched **2021-10-05**, strategy track record since **2019-01** | Footer; Monthly Income page → *disclosure* (unless an admin performance note replaces it) | Both dates. Do other funds (SEB, Multi-Strategy) show pre-launch history? If so, add them to `FUND_INCEPTION`. Is the pre-launch series net of the fund's current fees? Is showing it permitted under the sales-communication rules? |
| 6 | GMV gross of fees (`gmvGross`): managed accounts, not a fund; client returns reduced by fees | Footer; GMV page → hero + *disclosure* | Gross/net wording. Must a net series accompany it? The 6 % volatility-target variant is the one shown. |
| 7 | FTSE Russell notice (`ftse`): LSE Group trademark and data notice | Footer; fund pages with a benchmark | Exact notice required by the FTSE Russell data licence. Is public redistribution of index levels and returns allowed under the licence? |
| 8 | Short net note (`summaryNet`) near figures | Home → strategies; `/strategies` | Consistent with the full disclosure. |
| 9 | Short gross note (`summaryGross`) | Home → strategies; `/strategies` | Gross/net wording. |
| 10 | Basis labels (`basisLabels`): "net of fees", "gross of fees · managed accounts, not a fund" | Fund pages, hero and disclosure | Consistent with texts 3 and 6. |
| 11 | Sample-data warning (`sample`) | Fund pages, sample mode only (never in production) | Wording, if a demo site shows sample data. |
| 12 | Provenance line (`provenance`): "Updated daily from Nymbus’ data platform; portfolio data from the monthly factsheet of …" | Fund pages → *disclosure* | "Daily" is accurate; the as-of dates next to it. |
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
| L4 | **New section 10 "Québec residents: Law 25"**: person in charge (the Designated Privacy Officer), access / rectification / withdrawal / portability rights, automated decisions, assessment before communication outside Québec, confidentiality incident register and CAI notification, this website's single language cookie, recourse to the Commission d'accès à l'information | `/privacy#privacy-quebec` | Entire text, EN and FR. Title and contact details of the person in charge must be published (Law 25); is it the Designated Privacy Officer or the CEO? Is a privacy impact assessment process in place for transfers outside Québec? |
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
  ("has typically buffered bond drawdowns when volatility rises", futures margin "about 5 to 10 %"); the macro
  system is described as "rebalanced every six months".
- `/team` (`copy-about.ts`): milestones shown are only those backed by another source in the repository (2013
  founding, 2018 PRI, 2021 Monthly Income launch from `FUND_INCEPTION`, 2023 Dans la rue, 2024 tobacco-free pledge,
  2025 Mageska partnership). The old timeline's AUM figures, the 2019/2023 fund launch years and the 2020 merger were
  left out (inconsistent or unverified).
- `/contact` (`copy-contact.ts`): office hours (Monday to Friday, 8:30 to 5:00 ET) and "reply within one business
  day" come from the previous site. Advisors described as "registered with CIRO or the CSA" (the old site said IIROC).
