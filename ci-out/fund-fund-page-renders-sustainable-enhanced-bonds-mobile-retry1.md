# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> fund page renders: sustainable-enhanced-bonds
- Location: e2e/fund.spec.ts:46:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('coverage-note')
Expected substring: "share of the bond holdings, by market value"
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" getByTestId('coverage-note') with timeout 10000ms
  - waiting for getByTestId('coverage-note')

```

```yaml
- link "Skip to content":
  - /url: "#main"
- banner:
  - link "Nymbus Capital, home":
    - /url: /
    - img "nymbus"
  - navigation "Primary"
  - button "Afficher le site en français"
  - button "Open menu"
- main:
  - navigation "Breadcrumb":
    - list:
      - listitem:
        - link "Home":
          - /url: /
      - listitem:
        - link "Strategies":
          - /url: /strategies
      - listitem: Sustainable Enhanced Bonds
  - paragraph: Core fixed income
  - heading "Nymbus Sustainable Enhanced Bonds Fund" [level=1]
  - paragraph: Canadian core bonds, managed systematically
  - paragraph: A core Canadian bond portfolio built systematically, integrating sustainability criteria in bond selection, with a futures overlay designed to have low correlation with bonds and to offset part of bond losses; it may not do so and can lose money.
  - text: Mutual fund Risk Low Sample data
  - link "Contact us":
    - /url: /contact
  - link "Fund documents":
    - /url: "#documents"
  - text: Net asset value per unit As of Sep 28, 2026
  - radiogroup "Choose a series":
    - radio "Series F" [checked]
    - radio "Series H"
    - radio "Series A"
    - radio "Series FP"
  - text: $9.5816
  - paragraph: −0.0083 (−0.09%) vs previous valuation day
  - term: Series
  - definition: F
  - term: FundServ
  - definition:
    - code: LDM201
  - term: Currency
  - definition: CAD
  - term: Track record since
  - definition: August 2023
  - term: Benchmark
  - definition: FTSE Canada Universe Bond Index
  - region "Returns":
    - heading "Returns" [level=2]
    - paragraph: Series F, net of fees · as of August 31, 2026
    - list:
      - listitem: 1 month −0.91%
      - listitem: 3 months −0.47%
      - listitem: Year to date −3.77%
      - listitem: 1 year −2.62%
      - listitem: 3 years +2.24%
      - listitem: Since inception +2.68%
    - paragraph: "* Periods over one year are annualized."
  - tablist "Fund information":
    - tab "Overview"
    - tab "Performance"
    - tab "Portfolio" [selected]
    - tab "Distributions"
    - tab "Awards and rankings"
    - tab "Documents"
  - tabpanel "Portfolio":
    - heading "Portfolio" [level=2]
    - paragraph: Daily portfolio data as of September 28, 2026
    - heading "Portfolio characteristics" [level=3]
    - text: 8.16 years Modified duration 4.32% Yield to maturity AA- Average credit rating 30 Securities held
    - heading "Green bonds" [level=3]
    - paragraph: 26.1% of the portfolio
    - paragraph: Share of the portfolio invested in green bonds, whose proceeds finance projects with environmental benefits.
    - heading "Asset types" [level=3]
    - list "Asset types":
      - 'listitem "Corporate bonds: Fund 64.6%"': Corporate bonds
      - 'listitem "Government bonds: Fund 28.9%"': Government bonds
      - 'listitem "Municipal bonds: Fund 2.8%"': Municipal bonds
      - 'listitem "Cash: Fund 4.1%"': Cash
    - heading "Geography" [level=3]
    - list "Geography":
      - 'listitem "Canada: Fund 86.9%"': Canada
      - 'listitem "United States: Fund 9.4%"': United States
      - 'listitem "Cash: Fund 4.1%"': Cash
    - heading "Sectors" [level=3]
    - list "Sectors":
      - 'listitem "Financial: Fund 35.7%"': Financial
      - 'listitem "Government: Fund 31.7%"': Government
      - 'listitem "Utilities: Fund 11.6%"': Utilities
      - 'listitem "Energy: Fund 9.6%"': Energy
      - 'listitem "Communications: Fund 7.7%"': Communications
      - 'listitem "Cash: Fund 4.1%"': Cash
    - heading "Credit quality" [level=3]
    - list "Credit quality":
      - 'listitem "AAA: Fund 12.9%"': AAA
      - 'listitem "AA: Fund 32.9%"': AA
      - 'listitem "A: Fund 50.5%"': A
      - 'listitem "Cash: Fund 4.1%"': Cash
    - heading "Term to maturity" [level=3]
    - list "Term to maturity":
      - 'listitem "1–3 years: Fund 6.4%"': 1–3 years
      - 'listitem "3–5 years: Fund 18.4%"': 3–5 years
      - 'listitem "5–7 years: Fund 9.3%"': 5–7 years
      - 'listitem "7–10 years: Fund 12.9%"': 7–10 years
      - 'listitem "10+ years: Fund 36.4%"': 10+ years
      - 'listitem "Unknown maturity: Fund 13.0%"': Unknown maturity
      - 'listitem "Cash: Fund 4.1%"': Cash
    - paragraph: Weights as a percentage of net assets, cash included. Futures used for the overlay are excluded.
    - heading "Top 10 holdings" [level=3]
    - region "Top 10 holdings":
      - table "Top 10 holdings":
        - caption: Top 10 holdings
        - rowgroup:
          - row "# Holding Coupon Rating Weight":
            - columnheader "#"
            - columnheader "Holding"
            - columnheader "Coupon"
            - columnheader "Rating"
            - columnheader "Weight"
        - rowgroup:
          - row "01 Synthetic Communications 4.12% 2041 (Green bond) 4.74% AA- 3.86%":
            - cell "01"
            - cell "Synthetic Communications 4.12% 2041 (Green bond)"
            - cell "4.74%"
            - cell "AA-"
            - cell "3.86%"
          - row "02 Synthetic Communications 4.29% 2040 4.95% AA 3.86%":
            - cell "02"
            - cell "Synthetic Communications 4.29% 2040"
            - cell "4.95%"
            - cell "AA"
            - cell "3.86%"
          - row "03 Synthetic Financial 2.05% 2030 3.79% AA+ 3.24%":
            - cell "03"
            - cell "Synthetic Financial 2.05% 2030"
            - cell "3.79%"
            - cell "AA+"
            - cell "3.24%"
          - row "04 Synthetic Financial 2.05% 2035 4.68% A- 3.24%":
            - cell "04"
            - cell "Synthetic Financial 2.05% 2035"
            - cell "4.68%"
            - cell "A-"
            - cell "3.24%"
          - row "05 Synthetic Financial 2.64% 2031 2.96% AA+ 3.24%":
            - cell "05"
            - cell "Synthetic Financial 2.64% 2031"
            - cell "2.96%"
            - cell "AA+"
            - cell "3.24%"
          - row "06 Synthetic Financial 3.34% 2037 3.30% AA+ 3.24%":
            - cell "06"
            - cell "Synthetic Financial 3.34% 2037"
            - cell "3.30%"
            - cell "AA+"
            - cell "3.24%"
          - row "07 Synthetic Financial 3.49% perpetual — AAA 3.24%":
            - cell "07"
            - cell "Synthetic Financial 3.49% perpetual"
            - cell "—"
            - cell "AAA"
            - cell "3.24%"
          - row "08 Synthetic Financial 3.59% 2041 4.05% A- 3.24%":
            - cell "08"
            - cell "Synthetic Financial 3.59% 2041"
            - cell "4.05%"
            - cell "A-"
            - cell "3.24%"
          - row "09 Synthetic Financial 3.63% perpetual — A- 3.24%":
            - cell "09"
            - cell "Synthetic Financial 3.63% perpetual"
            - cell "—"
            - cell "A-"
            - cell "3.24%"
          - row "10 Synthetic Financial 3.76% perpetual — AAA 3.24%":
            - cell "10"
            - cell "Synthetic Financial 3.76% perpetual"
            - cell "—"
            - cell "AAA"
            - cell "3.24%"
        - rowgroup:
          - row "Top 10 total 33.64%":
            - rowheader "Top 10 total"
            - cell "33.64%"
      - paragraph: Green bond
    - heading "Sustainability metrics" [level=3]
    - paragraph: From the monthly factsheet of August 2026.
    - table "Sustainability metrics":
      - caption: Sustainability metrics
      - rowgroup:
        - row "Metric Fund Index":
          - columnheader "Metric"
          - columnheader "Fund"
          - columnheader "Index"
      - rowgroup:
        - row "S&P Global ESG rank 72.5 64.1":
          - cell "S&P Global ESG rank"
          - cell "72.5"
          - cell "64.1"
        - row "Carbon intensity 63.4 118.7":
          - cell "Carbon intensity"
          - cell "63.4"
          - cell "118.7"
        - row "Water intensity 412.8 655.1":
          - cell "Water intensity"
          - cell "412.8"
          - cell "655.1"
        - row "Board independence 81.2% 79.4%":
          - cell "Board independence"
          - cell "81.2%"
          - cell "79.4%"
        - row "Board diversity 34.1% 31.8%":
          - cell "Board diversity"
          - cell "34.1%"
          - cell "31.8%"
  - region "Sustainability, integrated":
    - paragraph: Sustainable Enhanced Bonds Fund
    - heading "Sustainability, integrated" [level=2]
    - text: Criteria at every step of bond selection. They do not apply to the futures overlay, which holds no securities of individual issuers.
    - heading "Exclusion screens" [level=3]
    - paragraph: Issuers in conflict with the fund’s criteria are excluded.
    - heading "ESG in issuer selection" [level=3]
    - paragraph: ESG data weighed with credit and valuation, issuer by issuer.
    - heading "Green bonds" [level=3]
    - paragraph: The fund can hold bonds financing environmental projects.
    - heading "Measured every month" [level=3]
    - paragraph: Sustainability metrics such as carbon intensity, reported monthly for the portfolio and its index.
    - link "Our sustainability approach":
      - /url: /sustainability
  - region "Disclosures":
    - paragraph: Important information
    - heading "Disclosures" [level=2]
    - paragraph: The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.
    - paragraph: "Performance shown: Series F, net of fees · Benchmark: FTSE Canada Universe Bond Index"
    - paragraph: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
    - paragraph: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
    - paragraph: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
    - paragraph: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
    - paragraph: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
    - paragraph: Updated daily from Nymbus’ data platform; portfolio data from the daily holdings as of September 28, 2026; sustainability metrics from the monthly factsheet of August 2026. performance as of August 2026 · net asset values as of Sep 28, 2026.
  - heading "Interested in the fund?" [level=2]
  - paragraph: Our team can walk you through the fund, its series and how to invest.
  - link "Contact our team":
    - /url: /contact
  - link "All strategies":
    - /url: /strategies
  - region "Other strategies":
    - paragraph: Explore
    - heading "Other strategies" [level=2]
    - link "Short-term fixed income Monthly Income Monthly income from short-term corporate bonds View Nymbus Monthly Income Fund":
      - /url: /strategies/monthly-income
    - link "Alternative strategies Multi-Strategy Four systematic strategies designed to have low correlation with one another View Nymbus Multi-Strategy Fund":
      - /url: /strategies/multi-strategy
    - link "Futures overlay (managed accounts) Global Minimum Volatility A futures overlay designed to have low correlation with bonds View Nymbus Global Minimum Volatility":
      - /url: /strategies/global-minimum-volatility
- contentinfo:
  - link "Nymbus Capital, home":
    - /url: /
    - img "nymbus"
  - paragraph: Montreal portfolio manager building systematic fixed income and alternative strategies.
  - text: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
  - link "514-985-1138":
    - /url: tel:+15149851138
  - text: 1-833-227-2656 (toll-free)
  - link "info@nymbus.ca":
    - /url: mailto:info@nymbus.ca
  - heading "Strategies" [level=2]
  - list:
    - listitem:
      - link "Monthly Income":
        - /url: /strategies/monthly-income
    - listitem:
      - link "Sustainable Enhanced Bonds":
        - /url: /strategies/sustainable-enhanced-bonds
    - listitem:
      - link "Multi-Strategy":
        - /url: /strategies/multi-strategy
    - listitem:
      - link "Global Minimum Volatility":
        - /url: /strategies/global-minimum-volatility
  - heading "Company" [level=2]
  - list:
    - listitem:
      - link "About & team":
        - /url: /team
    - listitem:
      - link "Approach":
        - /url: /approach
    - listitem:
      - link "Sustainability":
        - /url: /sustainability
    - listitem:
      - link "Solutions":
        - /url: /solutions
  - heading "Resources" [level=2]
  - list:
    - listitem:
      - link "Contact":
        - /url: /contact
    - listitem:
      - link "Privacy policy":
        - /url: /privacy
    - listitem:
      - link "Complaints & code of ethics":
        - /url: /legal
    - listitem:
      - link "LinkedIn":
        - /url: https://www.linkedin.com/company/nymbus-capital/
  - paragraph: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
  - paragraph: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
  - paragraph: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
  - paragraph: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
  - paragraph: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
  - paragraph: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative. Unless another variant is selected on the strategy page, the returns shown are those of the 6% downside volatility variant; the strategy is also offered with 3% and 9% downside volatility targets, whose returns differ.
  - paragraph: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
  - text: © 2026 Nymbus Capital Inc. All rights reserved. PRI signatory
- alert
```

# Test source

```ts
  16  |   // managed accounts, not a fund: gross figures, no NAV / FundServ series, no distributions
  17  |   { slug: "global-minimum-volatility", en: "Nymbus Global Minimum Volatility", fr: "Nymbus Global Minimum Volatility", gross: true, series: 0, dist: 0, daily: false, green: false, returns: true },
  18  | ];
  19  | const TABS = ["overview", "performance", "portfolio", "distributions", "awards", "documents"] as const;
  20  | const GMV_TABS = ["overview", "performance", "portfolio", "documents"] as const;
  21  | 
  22  | /** Scroll the whole page so lazily mounted charts and reveals run, then let the animations settle at the top. */
  23  | async function settle(page: Page) {
  24  |   const h = await page.evaluate(() => document.body.scrollHeight);
  25  |   for (let y = 0; y < h; y += 500) {
  26  |     await page.evaluate((top) => window.scrollTo(0, top), y);
  27  |     await page.waitForTimeout(70);
  28  |   }
  29  |   await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  30  |   await page.waitForTimeout(400);
  31  |   await page.evaluate(() => window.scrollTo(0, 0));
  32  |   await page.waitForTimeout(2600);
  33  | }
  34  | 
  35  | async function shot(page: Page, name: string, project: string) {
  36  |   mkdirSync("e2e/screenshots", { recursive: true });
  37  |   await page.screenshot({ path: `e2e/screenshots/fund-${name}-${project}.png`, fullPage: true });
  38  | }
  39  | 
  40  | async function openTab(page: Page, id: string) {
  41  |   await page.getByTestId("fund-tabs").locator(`[role="tab"][data-tab="${id}"]`).click();
  42  |   await expect(page.locator(`[role="tabpanel"][data-panel="${id}"]`)).toBeVisible();
  43  | }
  44  | 
  45  | for (const f of FUNDS) {
  46  |   test(`fund page renders: ${f.slug}`, async ({ page }, info) => {
  47  |     const errors: string[] = [];
  48  |     page.on("pageerror", (e) => errors.push(e.message));
  49  |     const res = await page.goto(`/strategies/${f.slug}`);
  50  |     expect(res?.status()).toBe(200);
  51  | 
  52  |     await expect(page.getByRole("heading", { level: 1, name: f.en })).toBeVisible();
  53  |     await expect(page.locator("h1")).toHaveCount(1);
  54  |     await expect(page.getByTestId("sample-chip")).toBeVisible();
  55  | 
  56  |     // header card: NAV with a series selector (funds) or the strategy card (managed accounts)
  57  |     if (f.series) {
  58  |       const card = page.getByTestId("nav-card");
  59  |       await expect(card).toBeVisible();
  60  |       await expect(card.locator('[role="radio"]')).toHaveCount(f.series);
  61  |       await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^(US)?\$\d+\.\d{4}$/);
  62  |     } else {
  63  |       await expect(page.getByTestId("nav-card")).toHaveCount(0);
  64  |       await expect(page.getByTestId("strategy-card").locator(".odo .sr-only")).toHaveText(/^−?\d+\.\d%$/);
  65  |     }
  66  | 
  67  |     // return badges with the class / basis label; a default class without its own series says "coming soon"
  68  |     const strip = page.getByTestId("return-strip");
  69  |     if (!f.returns) {
  70  |       await expect(strip.getByTestId("figures-soon")).toContainText("Performance figures for series F coming soon");
  71  |       await expect(strip.getByTestId("badge-SI")).toHaveCount(0);
  72  |       await page.getByTestId("nav-card").getByTestId("series-LDM001").click();
  73  |     }
  74  |     await expect(strip.getByTestId("badge-SI")).toBeVisible();
  75  |     await expect(strip.getByTestId("badge-SI").locator(".fr-v")).toHaveText(/^[+−]?\d+\.\d{2}%$/);
  76  |     await expect(page.getByTestId("basis")).toContainText(f.gross ? /gross of fees/i : /net of fees/i);
  77  | 
  78  |     // overview: facts, fees, returns table, team; series table for funds only
  79  |     await expect(page.getByTestId("fund-facts")).toBeVisible();
  80  |     await expect(page.getByTestId("fees")).toBeVisible();
  81  |     await expect(page.getByTestId("overview-returns").locator("tbody tr").first()).toBeVisible();
  82  |     if (f.series) await expect(page.getByTestId("classes-table").locator("tbody tr.hl")).toHaveCount(1);
  83  |     else await expect(page.getByTestId("classes-table")).toHaveCount(0);
  84  | 
  85  |     await expect(page.getByTestId("other-funds").locator("a")).toHaveCount(3);
  86  |     await expect(page.getByTestId("provenance")).toContainText("Updated daily");
  87  |     // the provenance line names the source of the Portfolio tab: the daily holdings with their date, else the factsheet
  88  |     if (f.daily) {
  89  |       await expect(page.getByTestId("provenance")).toContainText("portfolio data from the daily holdings as of September 28, 2026");
  90  |       await expect(page.getByTestId("provenance")).not.toContainText("portfolio data from the monthly factsheet");
  91  |     } else {
  92  |       await expect(page.getByTestId("provenance")).toContainText("portfolio data from the monthly factsheet of August 2026");
  93  |     }
  94  |     await expect(page.locator("#disclosure")).toBeVisible();
  95  | 
  96  |     await settle(page);
  97  |     await shot(page, f.slug, info.project.name);
  98  | 
  99  |     // performance tab: charts mount once shown
  100 |     await openTab(page, "performance");
  101 |     await expect(page).toHaveURL(/#performance$/);
  102 |     const chart = page.getByTestId("trailing-chart");
  103 |     await chart.scrollIntoViewIfNeeded();
  104 |     await expect(chart.locator("svg .cat").first()).toBeVisible();
  105 |     await expect(page.getByTestId("trailing-table")).toBeAttached();
  106 |     await expect(page.getByTestId("risk")).toBeVisible();
  107 | 
  108 |     // portfolio tab: the daily book with its date and source label, else the month-end factsheet
  109 |     await openTab(page, "portfolio");
  110 |     const source = page.getByTestId("portfolio-source");
  111 |     if (f.daily) {
  112 |       await expect(source).toHaveAttribute("data-source", "daily");
  113 |       await expect(source).toContainText("Daily portfolio data");
  114 |       await expect(page.getByTestId("portfolio-asof")).toHaveText("as of September 28, 2026");
  115 |       await expect(page.getByTestId("metric-duration")).toBeVisible();
> 116 |       await expect(page.getByTestId("coverage-note")).toContainText("share of the bond holdings, by market value");
      |                                                       ^ Error: expect(locator).toContainText(expected) failed
  117 |       await expect(page.getByTestId("breakdown-rating")).toBeVisible();
  118 |       await expect(page.getByTestId("holdings-table").locator("tbody tr")).toHaveCount(10);
  119 |       await expect(page.getByTestId("holdings-table").locator("thead")).toContainText("Coupon");
  120 |       // no breakdown is left alone in half a row (the SEB book has five: the last one takes the whole row)
  121 |       const panel = page.locator('[role="tabpanel"][data-panel="portfolio"]');
  122 |       const blocks = panel.locator(".bk-grid").first().locator(":scope > [data-testid^='breakdown-']");
  123 |       const n = await blocks.count();
  124 |       const grid = await panel.locator(".bk-grid").first().boundingBox();
  125 |       const last = await blocks.nth(n - 1).boundingBox();
  126 |       if (n % 2 === 1 && info.project.name === "desktop") expect(last!.width).toBeGreaterThan(grid!.width * 0.9);
  127 |       // every bar has a valid width within its track (never stretched by an invalid value)
  128 |       for (const bar of await panel.locator(".fx-hbar .b.fund").all()) {
  129 |         const [b, t] = await Promise.all([bar.boundingBox(), bar.locator("xpath=..").boundingBox()]);
  130 |         expect(b!.width).toBeLessThanOrEqual(t!.width + 0.5);
  131 |       }
  132 |     } else {
  133 |       await expect(source).toHaveAttribute("data-source", "factsheet");
  134 |       await expect(page.getByTestId("factsheet-month")).toContainText("August 2026");
  135 |     }
  136 |     await expect(page.getByTestId("holdings-table").locator("tbody tr").first()).toBeVisible();
  137 |     await expect(page.getByTestId("green-bonds")).toHaveCount(f.green ? 1 : 0);
  138 |     if (f.green) await expect(page.getByTestId("green-marker").first()).toBeVisible();
  139 | 
  140 |     // documents: nothing uploaded in e2e → regulatory list on request (funds) or the mandate-holder note
  141 |     await openTab(page, "documents");
  142 |     if (f.series) await expect(page.getByTestId("documents-on-request").locator(".dc-req-item")).toHaveCount(5);
  143 |     else await expect(page.getByTestId("documents-mandate")).toContainText("mandate holders");
  144 | 
  145 |     if (f.dist) {
  146 |       await openTab(page, "distributions");
  147 |       await expect(page.getByTestId("distributions")).toBeVisible();
  148 |       await expect(page.getByTestId("distributions-summary").locator(".ds-card")).toHaveCount(f.dist);
  149 |       await expect(page.getByTestId("distributions-summary").locator(".ds-card.hl")).toHaveCount(1);
  150 |       await expect(page.getByTestId("distributions-note")).toContainText("tax slips");
  151 |       await expect(page.getByTestId("distributions-history")).toBeVisible();
  152 |     } else {
  153 |       // managed accounts: no distributions tab
  154 |       await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="distributions"]')).toHaveCount(0);
  155 |     }
  156 | 
  157 |     expect(errors).toEqual([]);
  158 |   });
  159 | }
  160 | 
  161 | for (const [slug, tabs] of [["monthly-income", TABS], ["global-minimum-volatility", GMV_TABS], ["sustainable-enhanced-bonds", ["portfolio", "distributions"]], ["multi-strategy", ["portfolio"]]] as const) {
  162 |   test(`every tab at rest (screenshots): ${slug}`, async ({ page }, info) => {
  163 |     await page.goto(`/strategies/${slug}`);
  164 |     for (const id of tabs) {
  165 |       await openTab(page, id);
  166 |       await settle(page);
  167 |       await shot(page, `${slug}-tab-${id}`, info.project.name);
  168 |     }
  169 |   });
  170 | }
  171 | 
  172 | test("distributions: per-series cards, history chart, calendar years and the full history behind a toggle", async ({ page }) => {
  173 |   await page.goto("/strategies/monthly-income#distributions");
  174 |   // the latest distribution of the series shown (not the end of the requested window)
  175 |   await expect(page.getByTestId("distributions-asof")).toHaveText("Data as of September 28, 2026");
  176 |   const fp = page.getByTestId("dist-class-LDM001");
  177 |   await expect(page.locator('[data-testid^="dist-class-"].hl')).toHaveCount(1);
  178 |   // amounts with the series' own precision (6 decimals in the sample), so rows add up to the calendar totals
  179 |   await expect(fp.getByTestId("dist-last-amount")).toHaveText(/^\$0\.\d{6}$/);
  180 |   await expect(fp.getByTestId("dist-t12m")).toHaveText(/^\$0\.\d{6}$/);
  181 |   // the trailing 12 months end at the day the data were read (the response end date), not at the last distribution
  182 |   await expect(fp.getByTestId("dist-t12m-label")).toHaveText(/^12 months to Sept?\.? 29, 2026$/);
  183 |   await expect(fp.getByTestId("dist-t12m-label")).toHaveAttribute("title", "Total per unit of the distributions paid in the 12 months to September 29, 2026");
  184 |   await expect(page.getByTestId("dist-class-LDM011").getByTestId("dist-last-amount")).toHaveText(/^US\$0\.\d{4,6}$/);
  185 |   // cards of one row: the amounts start at the same height even when a series header wraps
  186 |   const tops = await page.getByTestId("distributions-summary").locator(".ds-amt").evaluateAll((els) => els.map((e) => [Math.round(e.getBoundingClientRect().top), Math.round((e.closest(".ds-card") as HTMLElement).getBoundingClientRect().top)]));
  187 |   const byRow = new Map<number, number[]>();
  188 |   for (const [amt, card] of tops) byRow.set(card, [...(byRow.get(card) ?? []), amt]);
  189 |   for (const amts of byRow.values()) expect(Math.max(...amts) - Math.min(...amts)).toBeLessThanOrEqual(1);
  190 |   // nothing clipped inside a card (amounts with 6 decimals and a currency prefix fit on phones)
  191 |   const overflow = await page.getByTestId("distributions-summary").locator(".ds-card").evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1 || [...e.querySelectorAll("*")].some((c) => c.getBoundingClientRect().right > e.getBoundingClientRect().right + 1)).map((e) => e.getAttribute("data-testid")));
  192 |   expect(overflow).toEqual([]);
  193 |   const wrapped = await page.getByTestId("distributions-summary").locator(".ds-amt").evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height > 1.6 * parseFloat(getComputedStyle(e).lineHeight)).map((e) => e.textContent));
  194 |   expect(wrapped, "each amount on one line").toEqual([]);
  195 |   const history = page.getByTestId("distributions-history");
  196 |   await history.scrollIntoViewIfNeeded();
  197 |   const bars = page.getByTestId("distribution-chart").locator("svg .cat");
  198 |   await expect(bars).toHaveCount(24);
  199 |   // one tab stop for the chart (roving tabindex), on the latest distribution; arrows / Home / End move it
  200 |   await expect(page.getByTestId("distribution-chart").locator('svg .cat[tabindex="0"]')).toHaveCount(1);
  201 |   await expect(bars.nth(23)).toHaveAttribute("tabindex", "0");
  202 |   await bars.nth(23).focus();
  203 |   await page.keyboard.press("ArrowLeft");
  204 |   await expect(bars.nth(22)).toBeFocused();
  205 |   await expect(bars.nth(22)).toHaveAttribute("tabindex", "0");
  206 |   await expect(bars.nth(23)).toHaveAttribute("tabindex", "-1");
  207 |   await page.keyboard.press("Home");
  208 |   await expect(bars.nth(0)).toBeFocused();
  209 |   await page.keyboard.press("End");
  210 |   await expect(bars.nth(23)).toBeFocused();
  211 |   await expect(page.getByTestId("dist-ytd")).toHaveCount(1);
  212 |   await expect(page.getByTestId("distributions-calendar").locator("tbody tr").first()).toContainText("2026");
  213 |   const rows = page.getByTestId("distributions-table").locator("tbody tr");
  214 |   await expect(rows).toHaveCount(12);
  215 |   const toggle = page.getByTestId("distributions-show-all");
  216 |   await expect(toggle).toHaveAttribute("aria-expanded", "false");
```