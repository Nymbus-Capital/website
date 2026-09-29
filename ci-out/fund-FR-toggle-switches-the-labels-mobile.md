# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> FR toggle switches the labels
- Location: e2e/fund.spec.ts:86:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'fonds nymbus revenu mensuel', level: 1 })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'fonds nymbus revenu mensuel', level: 1 }) with timeout 10000ms
  - waiting for getByRole('heading', { name: 'fonds nymbus revenu mensuel', level: 1 })

```

```yaml
- link "Skip to content":
  - /url: "#main"
- banner:
  - navigation "Primary":
    - link "Nymbus Capital, home":
      - /url: /
      - img "nymbus"
    - button "Open menu"
- main:
  - region "Nymbus Monthly Income Fund":
    - text: investment fund sample data
    - heading "nymbus monthly income fund" [level=1]
    - text: Nymbus Monthly Income Fund
    - paragraph: steady monthly income, short duration
    - text: 2.3% net annualized return · since inception · as of august 2026 −0.0% value-added vs benchmark vs FTSE Canada Short Term Corporate Bond Index $10.1905 +0.0114 · +0.11% net asset value · class FP (LDM001) · sep 28, 2026 net of fees asset class short-term fixed income risk level solution inception january 2019 fundserv
    - code: LDM001
  - region "trailing returns":
    - text: performance · as of august 2026
    - heading "trailing returns" [level=2]
    - text: trailing returns fund index value added
    - paragraph: "* Periods of 2 years and more, and since inception, are annualized."
    - group: show the numbers
  - region "growth of $10,000":
    - text: growth
    - heading "growth of $10,000" [level=2]
    - text: growth of $10,000
    - paragraph: a hypothetical $10,000 investment, distributions reinvested
    - group "period":
      - button "1Y"
      - button "3Y"
      - button "5Y"
      - button "since inception" [pressed]
    - text: fund index
  - region "year by year":
    - text: calendar years
    - heading "year by year" [level=2]
    - text: year by year fund index value added
    - group: show the numbers
  - region "every month, since inception":
    - text: monthly returns
    - heading "every month, since inception" [level=2]
    - text: every month, since inception
  - region "the ride matters":
    - text: risk
    - heading "the ride matters" [level=2]
    - text: the ride matters
    - paragraph: annualized, from monthly returns · as of august 2026
    - group "risk":
      - button "since inception" [pressed]
      - button "3 years"
    - text: 2.3% annualized return 1.9% volatility 1.0% downside deviation 1.18 sharpe ratio 2.17 sortino ratio −2.5% max drawdown 1.6% best month −1.3% worst month
    - 'img "positive months: 63%"':
      - img
    - text: positive months
  - region "inside the portfolio":
    - text: portfolio
    - heading "inside the portfolio" [level=2]
    - text: inside the portfolio
    - paragraph: from the monthly factsheet of august 2026
    - text: 4.21% Portfolio yield index 3.48% 4.02% Current yield index 3.31% 2.4 Duration (years) index 2.7 A Average credit quality index A 93.0% Rated investment grade index 100.0% 86 Number of securities index 742 0.62% Probability of default (5Y) index 0.48% 71.3 Liquidity score index 74.2
    - tablist "portfolio":
      - tab "strategy allocation" [selected]
      - tab "credit ratings"
      - tab "sectors"
      - tab "term structure"
      - tab "countries"
    - tabpanel "strategy allocation":
      - 'img "strategy allocation: Fixed income 90.0%, Protection overlay 6.0%, Cash 4.0%"'
      - 'button "Fixed income: 90.0%"': Fixed income 90.0%
      - 'button "Protection overlay: 6.0%"': Protection overlay 6.0%
      - 'button "Cash: 4.0%"': Cash 4.0%
    - heading "top 10 holdings" [level=3]
    - list "top 10 holdings":
      - listitem: 01 Synthetic Issuer A 3.1% 2028 4.90%
      - listitem: 02 Synthetic Issuer B 3.1% 2029 4.60%
      - listitem: 03 Synthetic Issuer C 3.1% 2030 4.30%
      - listitem: 04 Synthetic Issuer D 3.1% 2031 4.00%
      - listitem: 05 Synthetic Issuer E 3.1% 2032 3.70%
      - listitem: 06 Synthetic Issuer F 3.1% 2033 3.40%
      - listitem: 07 Synthetic Issuer G 3.1% 2034 3.00%
      - listitem: 08 Synthetic Issuer H 3.1% 2028 2.70%
      - listitem: 09 Synthetic Issuer I 3.1% 2029 2.40%
      - listitem: 10 Synthetic Issuer J 3.1% 2030 2.10%
    - heading "sustainability metrics" [level=3]
    - paragraph: the portfolio vs its index
    - term: S&P Global ESG rank
    - definition: 72.5index 64.1
    - term: Carbon intensity
    - definition: 63.4index 118.7
    - term: Water intensity
    - definition: 412.8index 655.1
    - term: Board independence
    - definition: 81.2%index 79.4%
    - term: Board diversity
    - definition: 34.1%index 31.8%
  - region "the essentials":
    - text: fund facts
    - heading "the essentials" [level=2]
    - text: the essentials
    - paragraph: Short-term Canadian corporate bonds selected by our two-system process, with an uncorrelated protection overlay designed to soften bond drawdowns.
    - text: $213.6M assets under management · as of sep 28, 2026
    - heading "classes" [level=3]
    - table "classes":
      - caption: classes
      - rowgroup:
        - row "fundserv class currency nav change date":
          - columnheader "fundserv"
          - columnheader "class"
          - columnheader "currency"
          - columnheader "nav"
          - columnheader "change"
          - columnheader "date"
      - rowgroup:
        - row "headline class LDM001 (headline class) FP CAD $10.1905 +0.11% sep 28, 2026":
          - cell "headline class LDM001 (headline class)":
            - code: LDM001
            - text: (headline class)
          - cell "FP"
          - cell "CAD"
          - cell "$10.1905"
          - cell "+0.11%"
          - cell "sep 28, 2026"
        - row "LDM021 A CAD $9.7714 −0.21% sep 28, 2026":
          - cell "LDM021":
            - code: LDM021
          - cell "A"
          - cell "CAD"
          - cell "$9.7714"
          - cell "−0.21%"
          - cell "sep 28, 2026"
        - row "LDM081 F CAD $10.0397 −0.19% sep 28, 2026":
          - cell "LDM081":
            - code: LDM081
          - cell "F"
          - cell "CAD"
          - cell "$10.0397"
          - cell "−0.19%"
          - cell "sep 28, 2026"
        - row "LDM011 F USD USD US$10.3711 — sep 28, 2026":
          - cell "LDM011":
            - code: LDM011
          - cell "F USD"
          - cell "USD"
          - cell "US$10.3711"
          - cell "—"
          - cell "sep 28, 2026"
    - term: vehicle
    - definition: investment fund
    - term: asset class
    - definition: short-term fixed income
    - term: inception
    - definition: january 2019
    - term: benchmark
    - definition: FTSE Canada Short Term Corporate Bond Index
    - term: risk rating
    - definition: low to medium
  - region "disclosure":
    - text: important information
    - heading "disclosure" [level=2]
    - text: disclosure
    - paragraph: The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.
    - paragraph: Returns are net of fees for the class shown, in Canadian dollars, and assume the reinvestment of all distributions.
    - paragraph: Commissions, trailing commissions, management fees and expenses all may be associated with investments in investment funds. Please read the offering documents before investing. Investment funds are not guaranteed, their values change frequently and past performance may not be repeated. The indicated rates of return are the historical annual compounded total returns including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns.
    - paragraph: Indices are shown for comparison only; they are unmanaged, bear no fees and cannot be invested in directly.
    - paragraph: This website is for informational purposes only and does not constitute investment advice, an offer to sell, or a solicitation to buy any security. Past performance is not indicative of future results.
    - text: Updated daily from Nymbus’ data platform; portfolio data from the monthly factsheet of august 2026. performance as of august 2026 · net asset values as of sep 28, 2026 · assets as of sep 28, 2026.
  - navigation "on this page":
    - list "strategies":
      - listitem "Nymbus Monthly Income Fund"
      - listitem "Nymbus Sustainable Enhanced Bonds Fund"
      - listitem "Nymbus Multi-Strategy Fund"
      - listitem "Nymbus Global Minimum Volatility"
    - link "overview":
      - /url: "#overview"
    - link "performance":
      - /url: "#performance"
    - link "growth":
      - /url: "#growth"
    - link "calendar years":
      - /url: "#calendar"
    - link "monthly":
      - /url: "#monthly"
    - link "risk":
      - /url: "#risk"
    - link "portfolio":
      - /url: "#portfolio"
    - link "fund facts":
      - /url: "#facts"
    - text: sample data
- contentinfo:
  - link "Nymbus Capital, home":
    - /url: /
    - img "nymbus"
  - paragraph: scientific investing
  - button "Back to top"
  - heading "strategies" [level=2]
  - list:
    - listitem:
      - link "monthly income":
        - /url: /strategies/monthly-income
    - listitem:
      - link "sustainable enhanced bonds":
        - /url: /strategies/sustainable-enhanced-bonds
    - listitem:
      - link "multi-strategy":
        - /url: /strategies/multi-strategy
    - listitem:
      - link "global minimum volatility":
        - /url: /strategies/global-minimum-volatility
  - heading "firm" [level=2]
  - list:
    - listitem:
      - link "approach":
        - /url: /approach
    - listitem:
      - link "team":
        - /url: /team
    - listitem:
      - link "sustainability":
        - /url: /sustainability
    - listitem:
      - link "solutions":
        - /url: /solutions
  - heading "contact" [level=2]
  - text: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
  - link "514-985-1138":
    - /url: tel:+15149851138
  - text: 1-833-227-2656 (toll-free)
  - link "info@nymbus.ca":
    - /url: mailto:info@nymbus.ca
  - link "LinkedIn":
    - /url: https://www.linkedin.com/company/nymbus-capital/
  - heading "legal" [level=2]
  - list:
    - listitem:
      - link "complaints & code of ethics":
        - /url: /legal
    - listitem:
      - link "privacy policy":
        - /url: /privacy
    - listitem: PRI signatory
  - paragraph: This website is for informational purposes only and does not constitute investment advice, an offer to sell, or a solicitation to buy any security. Past performance is not indicative of future results.
  - paragraph: © 2026 Nymbus Capital Inc. All rights reserved.
- alert
```

# Test source

```ts
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | import { mkdirSync } from "node:fs";
  3   | 
  4   | /**
  5   |  * Fund detail pages (/strategies/<fund key>) rendered against the illustrative sample data
  6   |  * (SHOW_SAMPLE_DATA=1 in the e2e server env, empty data volume).
  7   |  */
  8   | const FUNDS = [
  9   |   { slug: "monthly-income", en: "Nymbus Monthly Income Fund", fr: "Fonds Nymbus Revenu Mensuel", gross: false, classes: true },
  10  |   { slug: "sustainable-enhanced-bonds", en: "Nymbus Sustainable Enhanced Bonds Fund", fr: "Fonds Nymbus Obligations Durables Bonifiées", gross: false, classes: true },
  11  |   { slug: "multi-strategy", en: "Nymbus Multi-Strategy Fund", fr: "Fonds Nymbus Multistratégies", gross: false, classes: true },
  12  |   // managed accounts, not a fund: gross figures, no FundServ classes
  13  |   { slug: "global-minimum-volatility", en: "Nymbus Global Minimum Volatility", fr: "Nymbus Global Minimum Volatilité", gross: true, classes: false },
  14  | ];
  15  | 
  16  | /** Scroll the whole page so lazily mounted charts and reveals run. */
  17  | async function scrollThrough(page: Page) {
  18  |   const h = await page.evaluate(() => document.body.scrollHeight);
  19  |   for (let y = 0; y < h; y += 600) {
  20  |     await page.evaluate((top) => window.scrollTo(0, top), y);
  21  |     await page.waitForTimeout(60);
  22  |   }
  23  | }
  24  | 
  25  | for (const f of FUNDS) {
  26  |   test(`fund page renders: ${f.slug}`, async ({ page }, info) => {
  27  |     const errors: string[] = [];
  28  |     page.on("pageerror", (e) => errors.push(e.message));
  29  |     const res = await page.goto(`/strategies/${f.slug}`);
  30  |     expect(res?.status()).toBe(200);
  31  | 
  32  |     await expect(page.getByRole("heading", { level: 1, name: f.en.toLowerCase() })).toBeVisible();
  33  |     // hero: since-inception figure and its label
  34  |     await expect(page.locator(".fx-bigfig")).toBeVisible();
  35  |     await expect(page.locator(".fx-bigfig")).toHaveText(/^−?\d+\.\d%$/, { timeout: 5_000 });
  36  |     await expect(page.getByTestId("hero-figure-label")).toContainText(f.gross ? "gross" : "net");
  37  |     await expect(page.getByTestId("basis")).toContainText(f.gross ? "gross of fees" : "net of fees");
  38  |     // sample data is flagged
  39  |     await expect(page.locator(".fx-ribbon")).toBeVisible();
  40  | 
  41  |     // trailing returns: chart mounts when scrolled near, one focusable group per period
  42  |     const chart = page.getByTestId("trailing-chart");
  43  |     await chart.scrollIntoViewIfNeeded();
  44  |     await expect(chart.locator("svg .cat").first()).toBeVisible();
  45  |     expect(await chart.locator("svg .cat").count()).toBeGreaterThan(0);
  46  |     await expect(page.getByTestId("trailing-table")).toBeAttached();
  47  | 
  48  |     // classes table (funds only)
  49  |     if (f.classes) {
  50  |       await page.getByTestId("classes-table").scrollIntoViewIfNeeded();
  51  |       await expect(page.getByTestId("classes-table")).toBeVisible();
  52  |       await expect(page.getByTestId("classes-table").locator("tbody tr.hl")).toHaveCount(1);
  53  |     } else {
  54  |       await expect(page.getByTestId("classes-table")).toHaveCount(0);
  55  |     }
  56  | 
  57  |     await expect(page.getByTestId("provenance")).toContainText("Updated daily");
  58  |     await scrollThrough(page);
  59  |     await page.evaluate(() => window.scrollTo(0, 0));
  60  |     await page.waitForTimeout(400);
  61  |     mkdirSync("e2e/screenshots", { recursive: true });
  62  |     await page.screenshot({ path: `e2e/screenshots/fund-${f.slug}-${info.project.name}.png`, fullPage: true });
  63  |     expect(errors).toEqual([]);
  64  |   });
  65  | }
  66  | 
  67  | test("fund switcher links every fund", async ({ page }) => {
  68  |   await page.goto("/strategies/monthly-income");
  69  |   const dock = page.getByTestId("fund-dock");
  70  |   for (const f of FUNDS) await expect(dock.locator(`a[href="/strategies/${f.slug}"]`)).toHaveCount(1);
  71  |   await expect(dock.locator('a[aria-current="page"]')).toHaveAttribute("href", "/strategies/monthly-income");
  72  | });
  73  | 
  74  | test("legacy slug redirects to monthly income", async ({ page }) => {
  75  |   const res = await page.goto("/strategies/sustainable-enhanced-short-term-bonds");
  76  |   expect(res?.status()).toBe(200);
  77  |   await expect(page).toHaveURL(/\/strategies\/monthly-income$/);
  78  |   await expect(page.locator(".fx-bigfig")).toBeVisible();
  79  | });
  80  | 
  81  | test("unknown slug is a 404", async ({ page }) => {
  82  |   const res = await page.goto("/strategies/no-such-fund");
  83  |   expect(res?.status()).toBe(404);
  84  | });
  85  | 
  86  | test("FR toggle switches the labels", async ({ page }) => {
  87  |   await page.goto("/strategies/monthly-income");
  88  |   await expect(page.getByRole("heading", { name: "trailing returns" })).toBeAttached();
  89  |   const toggle = page.getByRole("button", { name: /toggle language|fr/i }).first();
  90  |   if (await toggle.isVisible().catch(() => false)) await toggle.click();
  91  |   else {
  92  |     // the site shell owns the toggle; fall back to the persisted choice it reads on load
  93  |     await page.evaluate(() => localStorage.setItem("nymbus-locale", "fr"));
  94  |     await page.reload();
  95  |   }
> 96  |   await expect(page.getByRole("heading", { level: 1, name: "fonds nymbus revenu mensuel" })).toBeVisible();
      |                                                                                              ^ Error: expect(locator).toBeVisible() failed
  97  |   await expect(page.getByRole("heading", { name: "rendements cumulatifs" })).toBeAttached();
  98  |   await expect(page.getByTestId("basis")).toHaveText("net de frais");
  99  |   // French number formatting: decimal comma and a (narrow) no-break space before %
  100 |   await expect(page.locator(".fx-bigfig")).toHaveText(/^−?\d+,\d\s%$/, { timeout: 5_000 });
  101 | });
  102 | 
```