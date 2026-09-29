# Compliance review of the public disclaimers

**Status: DRAFT BOILERPLATE. It must be reviewed by compliance before launch.**

All regulatory text of the public site is kept in **one file**: [`src/content/disclaimers.ts`](../src/content/disclaimers.ts).
It is in EN and FR, and each text records where it appears and what to verify. Admins can override two texts without
a code change:

- **Firm disclaimer**: *Admin → Site settings → firm disclaimer*. When set, it replaces the boilerplate firm text in
  every footer and in every fund disclosure.
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
| – | Admin overrides: firm disclaimer; per-fund performance notes | As above | Entire text. |

Other statements on the site that compliance may want to see (not boilerplate): taglines and fund descriptions
(*Admin → Funds*), the risk ratings, and the fees, MER and minimum-investment fields.

## Editing

1. Edit `src/content/disclaimers.ts`: change the EN and FR texts together, and keep `where` and `review` current.
   Unit tests (`tests/unit/admin/disclaimers.test.ts`) check that the required elements are present in both
   languages.
2. Deploy. The admin banner reappears automatically. Compliance reviews the texts, then an admin marks them as
   reviewed.
