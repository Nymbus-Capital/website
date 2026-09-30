# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> fund page renders: global-minimum-volatility
- Location: e2e/fund.spec.ts:42:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('trailing-chart').locator('svg .cat').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('trailing-chart').locator('svg .cat').first() with timeout 10000ms
  - waiting for getByTestId('trailing-chart').locator('svg .cat').first()

```

```yaml
- link "Skip to content":
  - /url: "#main"
- banner:
  - link "Nymbus Capital, home":
    - /url: /
    - img "nymbus"
  - navigation "Primary"
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
      - listitem: Global Minimum Volatility
  - paragraph: Protection overlay (managed accounts)
  - heading "Nymbus Global Minimum Volatility" [level=1]
  - paragraph: An uncorrelated buffer against bond drawdowns
  - paragraph: "A managed-futures overlay stacked on top of an existing portfolio (about 5-10% deposit): capital stays fully invested while the overlay targets 3%, 6% or 9% downside volatility."
  - text: Managed accounts Risk Low Sample data
  - link "Contact us":
    - /url: /contact
  - link "Documentation":
    - /url: "#documents"
  - text: Strategy at a glance As of Aug 31, 2026 8.2%
  - paragraph: Annualized return since inception, gross of fees
  - term: Vehicle
  - definition: Separately managed accounts
  - term: Returns
  - definition: Gross of fees
  - term: Track record since
  - definition: January 2015
  - term: Risk
  - definition: Low
  - region "Returns":
    - heading "Returns" [level=2]
    - paragraph: gross of fees · managed accounts, not a fund · as of August 31, 2026
    - list:
      - listitem: 1 month +2.00%
      - listitem: 3 months +4.00%
      - listitem: Year to date +4.80%
      - listitem: 1 year +6.10%
      - listitem: 3 years +6.80%
      - listitem: 5 years +7.20%
      - listitem: Since inception +8.20%
    - paragraph: "* Periods over one year are annualized."
  - tablist "Strategy information":
    - tab "Overview"
    - tab "Performance" [selected]
    - tab "Portfolio"
    - tab "Distributions"
    - tab "Documents"
  - tabpanel "Performance":
    - heading "Performance" [level=2]
    - paragraph: "Performance shown: gross of fees · managed accounts, not a fund · as of August 31, 2026"
    - heading "Growth of $10,000" [level=3]
    - paragraph: A hypothetical $10,000 invested in the strategy, gross of fees.
    - group "Period":
      - button "1Y"
      - button "3Y"
      - button "5Y"
      - button "Since inception" [pressed]
    - text: Strategy
    - 'img "Growth of $10,000. Strategy: $10,000 → $19,570 (+95.7%), December 2014 – August 2026. Use the arrow keys to move through the months."': $10k $12.5k $15k $17.5k $20k 2015 2020 2025
    - heading "Annualized and trailing returns" [level=3]
    - text: Strategy
    - paragraph: "* Periods over one year are annualized."
    - group: Show the data table
    - heading "Calendar-year returns" [level=3]
    - text: Strategy
    - group "Calendar-year returns":
      - text: 0% 5% 10% 15% 20%
      - img "2015, Strategy 11.8%": "2015"
      - img "2016, Strategy 7.0%": "2016"
      - img "2017, Strategy 6.6%": "2017"
      - img "2018, Strategy 15.7%": "2018"
      - img "2019, Strategy 13.3%": "2019"
      - img "2020, Strategy 9.2%": "2020"
      - img "2021, Strategy 2.8%": "2021"
      - img "2022, Strategy 6.0%": "2022"
      - img "2023, Strategy 5.3%": "2023"
      - img "2024, Strategy 3.7%": "2024"
      - img "2025, Strategy 9.4%": "2025"
      - img "2026 (YTD), Strategy 4.8%": 2026 YTD
    - group: Show the data table
    - heading "Monthly returns" [level=3]
    - paragraph: Every month since the start of the track record; the last column is the calendar-year return.
    - heading "Risk statistics" [level=3]
    - group "Risk statistics":
      - button "Since inception" [pressed]
      - button "Last 3 years"
    - paragraph: Annualized, from monthly returns.
    - text: 8.2% Annualized return 5.5% Volatility 2.4% Downside deviation 1.5 Sharpe ratio 3.5 Sortino ratio −7% Maximum drawdown 5.2% Best month −3.0% Worst month
    - 'img "Positive months: 65%"':
      - img
    - text: Positive months
    - heading "Performance notes" [level=3]
    - paragraph: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account.
  - region "How the overlay works":
    - paragraph: Global Minimum Volatility
    - heading "How the overlay works" [level=2]
    - text: A protection layer that sits on top of the portfolio you already own.
    - heading "Stacked on your portfolio" [level=3]
    - paragraph: "The overlay does not replace existing holdings: most of the capital stays invested as it is."
    - heading "Liquid futures" [level=3]
    - paragraph: Positions are taken through exchange-traded futures, which only require a margin deposit.
    - heading "A volatility target" [level=3]
    - paragraph: The overlay is sized to the level of downside volatility agreed with the client.
    - heading "Uncorrelated with bonds" [level=3]
    - paragraph: It aims to behave independently of bonds, to act as a buffer when bond markets decline.
  - region "Disclosures":
    - paragraph: Important information
    - heading "Disclosures" [level=2]
    - paragraph: The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.
    - paragraph: "Performance shown: gross of fees · managed accounts, not a fund"
    - paragraph: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account.
    - paragraph: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
    - paragraph: Updated daily from Nymbus’ data platform; portfolio data from the monthly factsheet of August 2026. performance as of August 2026.
  - heading "Interested in the strategy?" [level=2]
  - paragraph: Our team can explain how the overlay works and how it could fit your portfolio.
  - link "Contact our team":
    - /url: /contact
  - link "All strategies":
    - /url: /strategies
  - region "Other strategies":
    - paragraph: Explore
    - heading "Other strategies" [level=2]
    - link "Short-term fixed income Monthly Income Steady monthly income with a short duration View Nymbus Monthly Income Fund":
      - /url: /strategies/monthly-income
    - link "Core fixed income Sustainable Enhanced Bonds The Canadian bond universe, scientifically enhanced View Nymbus Sustainable Enhanced Bonds Fund":
      - /url: /strategies/sustainable-enhanced-bonds
    - link "Alternative strategies Multi-Strategy Four uncorrelated systematic strategies View Nymbus Multi-Strategy Fund":
      - /url: /strategies/multi-strategy
- contentinfo:
  - link "Nymbus Capital, home":
    - /url: /
    - img "nymbus"
  - paragraph: Montreal-based quantitative investment manager building systematic fixed income and multi-asset strategies with scientific rigour.
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
  - paragraph: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the class shown; periods of less than one year are not annualized.
  - paragraph: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
  - paragraph: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund's returns may have differed had it existed during that period.
  - paragraph: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account.
  - paragraph: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
  - text: © 2026 Nymbus Capital Inc. All rights reserved. PRI signatory
- alert
```

# Test source

```ts
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | import { mkdirSync } from "node:fs";
  3   | 
  4   | /**
  5   |  * Fund detail pages (/strategies/<fund key>) rendered against the illustrative sample data
  6   |  * (SHOW_SAMPLE_DATA=1 in the e2e server env, empty data volume). Also saves full-page screenshots
  7   |  * (e2e/screenshots/fund-<slug>-<project>.png, and one per tab for two funds) for design review.
  8   |  */
  9   | const FUNDS = [
  10  |   { slug: "monthly-income", en: "Nymbus Monthly Income Fund", fr: "Fonds Nymbus Revenu Mensuel", gross: false, series: 4 },
  11  |   { slug: "sustainable-enhanced-bonds", en: "Nymbus Sustainable Enhanced Bonds Fund", fr: "Fonds Nymbus Obligations Durables Bonifiées", gross: false, series: 3 },
  12  |   { slug: "multi-strategy", en: "Nymbus Multi-Strategy Fund", fr: "Fonds Nymbus Multistratégies", gross: false, series: 3 },
  13  |   // managed accounts, not a fund: gross figures, no NAV / FundServ series
  14  |   { slug: "global-minimum-volatility", en: "Nymbus Global Minimum Volatility", fr: "Nymbus Global Minimum Volatilité", gross: true, series: 0 },
  15  | ];
  16  | const TABS = ["overview", "performance", "portfolio", "distributions", "documents"] as const;
  17  | 
  18  | /** Scroll the whole page so lazily mounted charts and reveals run, then let the animations settle at the top. */
  19  | async function settle(page: Page) {
  20  |   const h = await page.evaluate(() => document.body.scrollHeight);
  21  |   for (let y = 0; y < h; y += 500) {
  22  |     await page.evaluate((top) => window.scrollTo(0, top), y);
  23  |     await page.waitForTimeout(70);
  24  |   }
  25  |   await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  26  |   await page.waitForTimeout(400);
  27  |   await page.evaluate(() => window.scrollTo(0, 0));
  28  |   await page.waitForTimeout(2600);
  29  | }
  30  | 
  31  | async function shot(page: Page, name: string, project: string) {
  32  |   mkdirSync("e2e/screenshots", { recursive: true });
  33  |   await page.screenshot({ path: `e2e/screenshots/fund-${name}-${project}.png`, fullPage: true });
  34  | }
  35  | 
  36  | async function openTab(page: Page, id: string) {
  37  |   await page.getByTestId("fund-tabs").locator(`[role="tab"][data-tab="${id}"]`).click();
  38  |   await expect(page.locator(`[role="tabpanel"][data-panel="${id}"]`)).toBeVisible();
  39  | }
  40  | 
  41  | for (const f of FUNDS) {
  42  |   test(`fund page renders: ${f.slug}`, async ({ page }, info) => {
  43  |     const errors: string[] = [];
  44  |     page.on("pageerror", (e) => errors.push(e.message));
  45  |     const res = await page.goto(`/strategies/${f.slug}`);
  46  |     expect(res?.status()).toBe(200);
  47  | 
  48  |     await expect(page.getByRole("heading", { level: 1, name: f.en })).toBeVisible();
  49  |     await expect(page.locator("h1")).toHaveCount(1);
  50  |     await expect(page.getByTestId("sample-chip")).toBeVisible();
  51  | 
  52  |     // header card: NAV with a series selector (funds) or the strategy card (managed accounts)
  53  |     if (f.series) {
  54  |       const card = page.getByTestId("nav-card");
  55  |       await expect(card).toBeVisible();
  56  |       await expect(card.locator('[role="radio"]')).toHaveCount(f.series);
  57  |       await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^(US)?\$\d+\.\d{4}$/);
  58  |     } else {
  59  |       await expect(page.getByTestId("nav-card")).toHaveCount(0);
  60  |       await expect(page.getByTestId("strategy-card").locator(".odo .sr-only")).toHaveText(/^−?\d+\.\d%$/);
  61  |     }
  62  | 
  63  |     // return badges with the class / basis label
  64  |     const strip = page.getByTestId("return-strip");
  65  |     await expect(strip.getByTestId("badge-SI")).toBeVisible();
  66  |     await expect(strip.getByTestId("badge-SI").locator(".fr-v")).toHaveText(/^[+−]?\d+\.\d{2}%$/);
  67  |     await expect(page.getByTestId("basis")).toContainText(f.gross ? "gross of fees" : "net of fees");
  68  | 
  69  |     // overview: facts, fees, returns table, team; series table for funds only
  70  |     await expect(page.getByTestId("fund-facts")).toBeVisible();
  71  |     await expect(page.getByTestId("fees")).toBeVisible();
  72  |     await expect(page.getByTestId("overview-returns").locator("tbody tr").first()).toBeVisible();
  73  |     if (f.series) await expect(page.getByTestId("classes-table").locator("tbody tr.hl")).toHaveCount(1);
  74  |     else await expect(page.getByTestId("classes-table")).toHaveCount(0);
  75  | 
  76  |     await expect(page.getByTestId("other-funds").locator("a")).toHaveCount(3);
  77  |     await expect(page.getByTestId("provenance")).toContainText("Updated daily");
  78  |     await expect(page.locator("#disclosure")).toBeVisible();
  79  | 
  80  |     await settle(page);
  81  |     await shot(page, f.slug, info.project.name);
  82  | 
  83  |     // performance tab: charts mount once shown
  84  |     await openTab(page, "performance");
  85  |     await expect(page).toHaveURL(/#performance$/);
  86  |     const chart = page.getByTestId("trailing-chart");
  87  |     await chart.scrollIntoViewIfNeeded();
> 88  |     await expect(chart.locator("svg .cat").first()).toBeVisible();
      |                                                     ^ Error: expect(locator).toBeVisible() failed
  89  |     await expect(page.getByTestId("trailing-table")).toBeAttached();
  90  |     await expect(page.getByTestId("risk")).toBeVisible();
  91  | 
  92  |     // portfolio tab: from the factsheet
  93  |     await openTab(page, "portfolio");
  94  |     await expect(page.getByTestId("factsheet-month")).toContainText("August 2026");
  95  |     await expect(page.getByTestId("holdings-table").locator("tbody tr").first()).toBeVisible();
  96  | 
  97  |     // documents: nothing uploaded in e2e → regulatory list on request (funds) or the mandate-holder note
  98  |     await openTab(page, "documents");
  99  |     if (f.series) await expect(page.getByTestId("documents-on-request").locator(".dc-req-item")).toHaveCount(5);
  100 |     else await expect(page.getByTestId("documents-mandate")).toContainText("mandate holders");
  101 | 
  102 |     await openTab(page, "distributions");
  103 |     await expect(page.getByTestId("distributions")).toBeVisible();
  104 | 
  105 |     expect(errors).toEqual([]);
  106 |   });
  107 | }
  108 | 
  109 | for (const slug of ["monthly-income", "global-minimum-volatility"]) {
  110 |   test(`every tab at rest (screenshots): ${slug}`, async ({ page }, info) => {
  111 |     await page.goto(`/strategies/${slug}`);
  112 |     for (const id of TABS) {
  113 |       await openTab(page, id);
  114 |       await settle(page);
  115 |       await shot(page, `${slug}-tab-${id}`, info.project.name);
  116 |     }
  117 |   });
  118 | }
  119 | 
  120 | test("series selector switches the NAV card", async ({ page }) => {
  121 |   await page.goto("/strategies/monthly-income");
  122 |   const card = page.getByTestId("nav-card");
  123 |   await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM001");
  124 |   await card.getByTestId("series-LDM081").click();
  125 |   await expect(card.getByTestId("series-LDM081")).toHaveAttribute("aria-checked", "true");
  126 |   await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM081");
  127 |   await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText("$10.0397");
  128 |   await card.getByTestId("series-LDM011").click();
  129 |   await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^US\$\d+\.\d{4}$/);
  130 | });
  131 | 
  132 | test("tabs follow the URL hash and the keyboard", async ({ page }) => {
  133 |   await page.goto("/strategies/sustainable-enhanced-bonds#portfolio");
  134 |   const tabs = page.getByTestId("fund-tabs");
  135 |   await expect(tabs.locator('[role="tab"][data-tab="portfolio"]')).toHaveAttribute("aria-selected", "true");
  136 |   await expect(page.getByTestId("esg")).toBeVisible();
  137 |   await tabs.locator('[role="tab"][data-tab="portfolio"]').focus();
  138 |   await page.keyboard.press("ArrowRight");
  139 |   await expect(tabs.locator('[role="tab"][data-tab="distributions"]')).toHaveAttribute("aria-selected", "true");
  140 |   await expect(tabs.locator('[role="tab"][data-tab="distributions"]')).toBeFocused();
  141 |   // the header link selects the documents tab
  142 |   await page.evaluate(() => window.scrollTo(0, 0));
  143 |   await page.locator('.fh-actions a[href="#documents"]').click();
  144 |   await expect(tabs.locator('[role="tab"][data-tab="documents"]')).toHaveAttribute("aria-selected", "true");
  145 | });
  146 | 
  147 | test("without JavaScript every panel is on the page", async ({ browser }) => {
  148 |   const ctx = await browser.newContext({ javaScriptEnabled: false });
  149 |   const page = await ctx.newPage();
  150 |   await page.goto("/strategies/monthly-income");
  151 |   await expect(page.getByRole("heading", { level: 1, name: "Nymbus Monthly Income Fund" })).toBeVisible();
  152 |   for (const id of TABS) await expect(page.locator(`[role="tabpanel"][data-panel="${id}"]`)).toBeVisible();
  153 |   await expect(page.getByTestId("trailing-table")).toBeAttached();
  154 |   await expect(page.getByTestId("holdings-table")).toBeVisible();
  155 |   await ctx.close();
  156 | });
  157 | 
  158 | test("legacy slug redirects to monthly income", async ({ page }) => {
  159 |   const res = await page.goto("/strategies/sustainable-enhanced-short-term-bonds");
  160 |   expect(res?.status()).toBe(200);
  161 |   await expect(page).toHaveURL(/\/strategies\/monthly-income$/);
  162 |   await expect(page.getByTestId("nav-card")).toBeVisible();
  163 | });
  164 | 
  165 | test("registry alias redirects to the canonical slug", async ({ page }) => {
  166 |   await page.goto("/strategies/gmv");
  167 |   await expect(page).toHaveURL(/\/strategies\/global-minimum-volatility$/);
  168 | });
  169 | 
  170 | test("unknown slug is a 404", async ({ page }) => {
  171 |   const res = await page.goto("/strategies/no-such-fund");
  172 |   expect(res?.status()).toBe(404);
  173 | });
  174 | 
  175 | test("French: labels, names and number formatting", async ({ page }) => {
  176 |   await page.goto("/strategies/monthly-income");
  177 |   await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  178 |   await page.reload();
  179 |   await expect(page.getByRole("heading", { level: 1, name: "Fonds Nymbus Revenu Mensuel" })).toBeVisible();
  180 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="overview"]')).toHaveText("Aperçu");
  181 |   await expect(page.getByTestId("basis")).toContainText("net de frais");
  182 |   // decimal comma and a no-break space before % / $
  183 |   await expect(page.getByTestId("badge-SI").locator(".fr-v")).toHaveText(/^[+−]?\d+,\d{2}\s%$/);
  184 |   await expect(page.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^\d+,\d{4}\s\$$/);
  185 | });
  186 | 
```