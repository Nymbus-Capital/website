# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> fund page renders: monthly-income
- Location: e2e/fund.spec.ts:46:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('return-strip').getByTestId('figures-soon')
Expected substring: "Performance figures for series F coming soon"
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" getByTestId('return-strip').getByTestId('figures-soon') with timeout 10000ms
  - waiting for getByTestId('return-strip').getByTestId('figures-soon')

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
      - listitem: Monthly Income
  - paragraph: Short-term fixed income
  - heading "Nymbus Monthly Income Fund" [level=1]
  - paragraph: Monthly income from short-term corporate bonds
  - paragraph: Short-term Canadian corporate bonds selected by our two-system process, with a futures overlay designed to have low correlation with bonds and to offset part of bond losses; it may not do so and can lose money. Distributions are not guaranteed, may change and may include a return of capital.
  - text: Mutual fund Risk Low to medium Sample data
  - link "Contact us":
    - /url: /contact
  - link "Fund documents":
    - /url: "#documents"
  - text: Net asset value per unit As of Sep 28, 2026
  - radiogroup "Choose a series":
    - radio "Series F" [checked]
    - radio "Series FP"
    - radio "Series F USD"
    - radio "Series A"
  - text: Prospectus class
  - paragraph: This series is offered under the simplified prospectus.
  - text: $10.0397
  - paragraph: −0.0190 (−0.19%) vs previous valuation day
  - term: Series
  - definition: F
  - term: FundServ
  - definition:
    - code: LDM081
  - term: Currency
  - definition: CAD
  - term: Fund launch
  - definition: October 5, 2021
  - term: Benchmark
  - definition: FTSE Canada Short Term Corporate Bond Index
  - region "Returns":
    - heading "Returns" [level=2]
    - paragraph: Series F, net of fees · as of August 31, 2026 Prospectus class
    - list:
      - listitem: 1 month −0.15%
      - listitem: 3 months −0.67%
      - listitem: Year to date −0.26%
      - listitem: 1 year +0.74%
      - listitem: Since inception +0.83%
    - paragraph: "* Periods over one year are annualized."
  - tablist "Fund information":
    - tab "Overview" [selected]
    - tab "Performance"
    - tab "Portfolio"
    - tab "Distributions"
    - tab "Awards and rankings"
    - tab "Documents"
  - tabpanel "Overview":
    - heading "Overview" [level=2]
    - heading "What the fund does" [level=3]
    - paragraph: Monthly income from short-term Canadian corporate bonds, with low rate sensitivity. Distributions are not guaranteed, may change and may include a return of capital.
    - heading "Investment approach" [level=3]
    - list:
      - listitem: Mainly short-term Canadian corporate bonds
      - listitem: Selected by our two-system quantitative process
      - listitem: Credit risk and relative value, bond by bond
    - paragraph: The futures overlay is designed to have low correlation with bonds and to offset part of bond losses when volatility rises; it may not do so and can lose money. The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.
    - heading "Returns" [level=3]
    - link "See all performance":
      - /url: "#performance"
    - paragraph: Series F, net of fees · as of August 31, 2026
    - table "Returns":
      - caption: Returns
      - rowgroup:
        - row "Period Fund Benchmark Value added":
          - columnheader "Period"
          - columnheader "Fund"
          - columnheader "Benchmark"
          - columnheader "Value added"
      - rowgroup:
        - row "1 month −0.15% 0.38% −0.53%":
          - cell "1 month"
          - cell "−0.15%"
          - cell "0.38%"
          - cell "−0.53%"
        - row "3 months −0.67% −0.29% −0.38%":
          - cell "3 months"
          - cell "−0.67%"
          - cell "−0.29%"
          - cell "−0.38%"
        - row "Year to date −0.26% −0.31% +0.05%":
          - cell "Year to date"
          - cell "−0.26%"
          - cell "−0.31%"
          - cell "+0.05%"
        - row "1 year 0.74% 0.24% +0.50%":
          - cell "1 year"
          - cell "0.74%"
          - cell "0.24%"
          - cell "+0.50%"
        - row "2 years * 0.49% — —":
          - cell "2 years *"
          - cell "0.49%"
          - cell "—"
          - cell "—"
        - row "Since inception * 0.83% — —":
          - cell "Since inception *"
          - cell "0.83%"
          - cell "—"
          - cell "—"
    - paragraph: "* Periods over one year are annualized."
    - complementary:
      - heading "Key facts" [level=3]
      - term: Legal name
      - definition: Nymbus Monthly Income Fund
      - term: Vehicle
      - definition: Mutual fund
      - term: Asset class
      - definition: Short-term fixed income
      - term: Benchmark
      - definition: FTSE Canada Short Term Corporate Bond Index
      - term: Fund launch
      - definition: October 5, 2021
      - term: Track record since
      - definition: March 2024
      - term: Currency
      - definition: CAD, USD
      - term: Series
      - definition: FP, F USD, A, F
      - term: Risk rating
      - definition: Low to medium
      - term: Returns shown
      - definition: Net of fees
      - term: CIFSC category
      - definition: Canadian Core Plus Fixed Income
      - heading "Fees and expenses" [level=3]
      - paragraph: Fees and expenses are set out in the fund facts and the simplified prospectus.
    - heading "Series and FundServ codes" [level=3]
    - table "Series and FundServ codes":
      - caption: Series and FundServ codes
      - rowgroup:
        - row "Series FundServ Offered under Currency NAV per unit Daily change Valuation date":
          - columnheader "Series"
          - columnheader "FundServ"
          - columnheader "Offered under"
          - columnheader "Currency"
          - columnheader "NAV per unit"
          - columnheader "Daily change"
          - columnheader "Valuation date"
      - rowgroup:
        - row "F (Series shown in the header) FundServ LDM081 Offered under Prospectus class Currency CAD NAV per unit $10.0397 Daily change −0.19% Valuation date Sep 28, 2026":
          - cell "F (Series shown in the header)"
          - cell "FundServ LDM081":
            - text: FundServ
            - code: LDM081
          - cell "Offered under Prospectus class"
          - cell "Currency CAD"
          - cell "NAV per unit $10.0397"
          - cell "Daily change −0.19%"
          - cell "Valuation date Sep 28, 2026"
        - row "FP FundServ LDM001 Offered under Offering memorandum class Currency CAD NAV per unit $10.1905 Daily change +0.11% Valuation date Sep 28, 2026":
          - cell "FP"
          - cell "FundServ LDM001":
            - text: FundServ
            - code: LDM001
          - cell "Offered under Offering memorandum class"
          - cell "Currency CAD"
          - cell "NAV per unit $10.1905"
          - cell "Daily change +0.11%"
          - cell "Valuation date Sep 28, 2026"
        - row "F USD FundServ LDM011 Offered under Currency USD NAV per unit US$10.3711 Daily change — Valuation date Sep 28, 2026":
          - cell "F USD"
          - cell "FundServ LDM011":
            - text: FundServ
            - code: LDM011
          - cell "Offered under"
          - cell "Currency USD"
          - cell "NAV per unit US$10.3711"
          - cell "Daily change —"
          - cell "Valuation date Sep 28, 2026"
        - row "A FundServ LDM021 Offered under Currency CAD NAV per unit $9.7714 Daily change −0.21% Valuation date Sep 28, 2026":
          - cell "A"
          - cell "FundServ LDM021":
            - text: FundServ
            - code: LDM021
          - cell "Offered under"
          - cell "Currency CAD"
          - cell "NAV per unit $9.7714"
          - cell "Daily change −0.21%"
          - cell "Valuation date Sep 28, 2026"
    - heading "Investment team" [level=3]
    - link "Meet the team":
      - /url: /team
    - paragraph: The fund is managed by the Nymbus Capital investment team.
  - region "Built for monthly income":
    - paragraph: Monthly Income Fund
    - heading "Built for monthly income" [level=2]
    - text: Four features shape how the fund is managed.
    - heading "Monthly distributions" [level=3]
    - paragraph: Designed to pay every month. Distributions are not guaranteed, may change and may include a return of capital.
    - heading "Short maturities" [level=3]
    - paragraph: "Short maturities keep rate sensitivity low. Current duration: Portfolio tab."
    - heading "Systematic credit selection" [level=3]
    - paragraph: "Same models for every issuer: credit risk against yield."
    - heading "Futures overlay" [level=3]
    - paragraph: An overlay designed to have low correlation with bonds and to offset part of bond losses when volatility rises; it may not do so and can lose money. The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.
  - region "Disclosures":
    - paragraph: Important information
    - heading "Disclosures" [level=2]
    - paragraph: The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.
    - paragraph: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
    - paragraph: "Performance shown: Series F, net of fees · Benchmark: FTSE Canada Short Term Corporate Bond Index"
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
    - link "Core fixed income Sustainable Enhanced Bonds Canadian core bonds, managed systematically View Nymbus Sustainable Enhanced Bonds Fund":
      - /url: /strategies/sustainable-enhanced-bonds
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
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | import { mkdirSync, readFileSync } from "node:fs";
  3   | 
  4   | /**
  5   |  * Fund detail pages (/strategies/<fund key>) rendered against the illustrative sample data
  6   |  * (SHOW_SAMPLE_DATA=1 in the e2e server env, empty data volume). Also saves full-page screenshots
  7   |  * (e2e/screenshots/fund-<slug>-<project>.png, and one per tab for two funds) for design review.
  8   |  */
  9   | // daily: the sample has a daily portfolio book (bond funds); the multi-strategy book is below the coverage thresholds
  10  | // series: radio buttons of the class selector (registry classes + classes with a NAV); dist: series with distributions;
  11  | // returns: the default class (F) has its own return series (Monthly Income F has none yet: "coming soon", FP has)
  12  | const FUNDS = [
  13  |   { slug: "monthly-income", en: "Nymbus Monthly Income Fund", fr: "Fonds Nymbus Revenu Mensuel", gross: false, series: 4, dist: 4, daily: true, green: false, returns: false },
  14  |   { slug: "sustainable-enhanced-bonds", en: "Nymbus Sustainable Enhanced Bonds Fund", fr: "Fonds Nymbus Obligations Durables Bonifiées", gross: false, series: 4, dist: 3, daily: true, green: true, returns: true },
  15  |   { slug: "multi-strategy", en: "Nymbus Multi-Strategy Fund", fr: "Fonds Nymbus Multistratégies", gross: false, series: 3, dist: 3, daily: false, green: false, returns: true },
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
> 70  |       await expect(strip.getByTestId("figures-soon")).toContainText("Performance figures for series F coming soon");
      |                                                       ^ Error: expect(locator).toContainText(expected) failed
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
  116 |       await expect(page.getByTestId("coverage-note")).toContainText("share of the bond holdings, by market value");
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
```