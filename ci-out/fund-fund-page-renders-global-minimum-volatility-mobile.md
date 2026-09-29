# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> fund page renders: global-minimum-volatility
- Location: e2e/fund.spec.ts:26:7

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByTestId('classes-table')
Expected: 0
Received: 1
Timeout:  10000ms

Call log:
  - Expect "toHaveCount" getByTestId('classes-table') with timeout 10000ms
  - waiting for getByTestId('classes-table')
    24 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main"
  - banner:
    - navigation "Primary" [ref=e3]:
      - link "Nymbus Capital, home" [ref=e4] [cursor=pointer]:
        - /url: /
        - img "nymbus" [ref=e5]
      - button "Open menu" [ref=e15] [cursor=pointer]
  - main [ref=e17]:
    - generic [ref=e18]:
      - generic [aria-hidden]: sample data
      - region "Nymbus Global Minimum Volatility" [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]:
            - generic [ref=e22]: managed accounts
            - generic "illustrative figures only, not actual performance" [ref=e24]: sample data
          - heading "nymbus global minimum volatility" [level=1] [ref=e25]:
            - generic [aria-hidden] [ref=e26]:
              - generic [ref=e27]: nymbus
              - generic [ref=e28]: global
              - generic [ref=e29]: minimum
              - generic [ref=e30]: volatility
          - generic [ref=e31]: Nymbus Global Minimum Volatility
          - paragraph [ref=e32]: an uncorrelated buffer for bond drawdowns
          - generic [ref=e33]:
            - generic [ref=e35]:
              - generic [ref=e36]: 8.2%
              - generic [ref=e38]: gross annualized return · since inception · as of august 2026
            - generic [ref=e39]:
              - generic [ref=e40]:
                - generic [ref=e41]:
                  - generic [ref=e42]: $10.1234
                  - generic "+0.12% vs previous valuation day" [ref=e43]: +0.0123 · +0.12%
                - generic [ref=e46]:
                  - text: net asset value · class
                  - generic [ref=e47]: F (SAMPLE01)
                  - text: · sep 28, 2026
              - generic [ref=e48]: gross of fees · managed accounts, not a fund
          - generic [ref=e50]:
            - generic [ref=e51]:
              - generic [ref=e52]: asset class
              - text: protection overlay (managed accounts)
            - 'generic "risk level: low" [ref=e53]':
              - generic [ref=e54]: risk level
              - generic [aria-hidden] [ref=e55]: low
            - generic [ref=e62]:
              - generic [ref=e63]: solution inception
              - text: january 2015
          - paragraph [ref=e64]: Returns shown for this strategy are gross of fees and represent managed accounts; they are not the returns of an investment fund. Client returns are reduced by management fees and other expenses, and vary by account.
      - region "trailing returns" [ref=e65]:
        - generic [ref=e66]:
          - generic [ref=e67]:
            - generic [ref=e68]: performance · as of august 2026
            - heading "trailing returns" [level=2] [ref=e70]:
              - generic [aria-hidden] [ref=e71]:
                - generic [ref=e72]: trailing
                - generic [ref=e73]: returns
            - generic [ref=e74]: trailing returns
          - generic [ref=e75]: strategy
          - group "trailing returns" [ref=e81]:
            - generic [ref=e82]: 0.0%
            - generic [ref=e84]: 2.5%
            - generic [ref=e86]: 5.0%
            - generic [ref=e88]: 7.5%
            - generic [ref=e90]: 10.0%
            - img "1 month, strategy 2.0%" [ref=e92]:
              - generic [ref=e94]: "2.0"
              - generic [ref=e97]: 1M
            - img "3 months, strategy 4.0%" [ref=e98]:
              - generic [ref=e100]: "4.0"
              - generic [ref=e103]: 3M
            - img "year to date, strategy 4.8%" [ref=e104]:
              - generic [ref=e106]: "4.8"
              - generic [ref=e109]: YTD
            - img "1 year, strategy 6.1%" [ref=e110]:
              - generic [ref=e112]: "6.1"
              - generic [ref=e115]: 1Y
            - img "2 years*, strategy 6.5%" [ref=e116]:
              - generic [ref=e118]: "6.5"
              - generic [ref=e121]: 2Y
            - img "3 years*, strategy 6.8%" [ref=e122]:
              - generic [ref=e124]: "6.8"
              - generic [ref=e127]: 3Y
            - img "5 years*, strategy 7.2%" [ref=e128]:
              - generic [ref=e130]: "7.2"
              - generic [ref=e133]: 5Y
            - img "since inception*, strategy 8.2%" [ref=e134]:
              - generic [ref=e136]: "8.2"
              - generic [ref=e139]: SI
          - paragraph [ref=e140]: "* Periods of 2 years and more, and since inception, are annualized."
          - group [ref=e141]:
            - generic "show the numbers" [ref=e142] [cursor=pointer]
      - region "growth of $10,000" [ref=e143]:
        - generic [ref=e144]:
          - generic [ref=e145]:
            - generic [ref=e146]: growth
            - heading "growth of $10,000" [level=2] [ref=e148]:
              - generic [aria-hidden] [ref=e149]:
                - generic [ref=e150]: growth
                - generic [ref=e151]: of
                - generic [ref=e152]: $10,000
            - generic [ref=e153]: growth of $10,000
            - paragraph [ref=e154]: a hypothetical $10,000 investment, distributions reinvested
          - generic [ref=e155]:
            - group "period" [ref=e157]:
              - button "1Y" [ref=e158] [cursor=pointer]
              - button "3Y" [ref=e159] [cursor=pointer]
              - button "5Y" [ref=e160] [cursor=pointer]
              - button "since inception" [pressed] [ref=e161] [cursor=pointer]
            - generic [ref=e162]: strategy
            - 'img "growth of $10,000. strategy: $10,000 → $19,570 (+95.7%), december 2014 – august 2026. use the arrow keys to move through the months" [ref=e166]':
              - generic [ref=e167]: $10k
              - generic [ref=e169]: $12.5k
              - generic [ref=e171]: $15k
              - generic [ref=e173]: $17.5k
              - generic [ref=e175]: $20k
              - generic [ref=e177]: "2015"
              - generic [ref=e178]: "2020"
              - generic [ref=e179]: "2025"
      - region "year by year" [ref=e185]:
        - generic [ref=e186]:
          - generic [ref=e187]:
            - generic [ref=e188]: calendar years
            - heading "year by year" [level=2] [ref=e190]:
              - generic [aria-hidden] [ref=e191]:
                - generic [ref=e192]: year
                - generic [ref=e193]: by
                - generic [ref=e194]: year
            - generic [ref=e195]: year by year
          - generic [ref=e196]: strategy
          - group [ref=e202]:
            - generic "show the numbers" [ref=e203] [cursor=pointer]
      - region "every month, since inception" [ref=e204]:
        - generic [ref=e205]:
          - generic [ref=e206]:
            - generic [ref=e207]: monthly returns
            - heading "every month, since inception" [level=2] [ref=e209]:
              - generic [aria-hidden] [ref=e210]:
                - generic [ref=e211]: every
                - generic [ref=e212]: month,
                - generic [ref=e213]: since
                - generic [ref=e214]: inception
            - generic [ref=e215]: every month, since inception
          - generic [aria-hidden] [ref=e218]:
            - generic [ref=e219]: negative
            - generic [ref=e221]: positive
      - region "the ride matters" [ref=e222]:
        - generic [ref=e223]:
          - generic [ref=e224]:
            - generic [ref=e225]: risk
            - heading "the ride matters" [level=2] [ref=e227]:
              - generic [aria-hidden] [ref=e228]:
                - generic [ref=e229]: the
                - generic [ref=e230]: ride
                - generic [ref=e231]: matters
            - generic [ref=e232]: the ride matters
            - paragraph [ref=e233]: annualized, from monthly returns · as of august 2026
          - group "risk" [ref=e235]:
            - button "since inception" [pressed] [ref=e236] [cursor=pointer]
            - button "3 years" [ref=e237] [cursor=pointer]
          - generic [ref=e238]:
            - generic [ref=e239]:
              - generic [ref=e240]: 8.2%
              - generic [ref=e241]: annualized return
            - generic [ref=e242]:
              - generic [ref=e243]: 5.5%
              - generic [ref=e244]: volatility
            - generic [ref=e245]:
              - generic [ref=e246]: 2.4%
              - generic [ref=e247]: downside deviation
            - generic [ref=e248]:
              - generic [ref=e249]: "1.5"
              - generic [ref=e250]: sharpe ratio
            - generic [ref=e251]:
              - generic [ref=e252]: "3.5"
              - generic [ref=e253]: sortino ratio
            - generic [ref=e254]:
              - generic [ref=e255]: −7%
              - generic [ref=e256]: max drawdown
            - generic [ref=e257]:
              - generic [ref=e258]: 5.2%
              - generic [ref=e259]: best month
            - generic [ref=e260]:
              - generic [ref=e261]: −3.0%
              - generic [ref=e262]: worst month
            - generic [ref=e263]:
              - 'img "positive months: 65%" [ref=e264]':
                - generic [aria-hidden] [ref=e268]: 65%
              - generic [ref=e269]: positive months
      - region "inside the portfolio" [ref=e270]:
        - generic [ref=e271]:
          - generic [ref=e272]:
            - generic [ref=e273]: portfolio
            - heading "inside the portfolio" [level=2] [ref=e275]:
              - generic [aria-hidden] [ref=e276]:
                - generic [ref=e277]: inside
                - generic [ref=e278]: the
                - generic [ref=e279]: portfolio
            - generic [ref=e280]: inside the portfolio
            - paragraph [ref=e281]: from the monthly factsheet of august 2026
          - generic [ref=e282]:
            - generic [ref=e283]:
              - generic [ref=e284]: "24"
              - generic [ref=e285]: Number of futures contracts
            - generic [ref=e286]:
              - generic [ref=e287]: 6.00%
              - generic [ref=e288]: Target downside volatility
          - generic [ref=e289]:
            - tablist "portfolio" [ref=e291]:
              - tab "strategy allocation" [selected] [ref=e292] [cursor=pointer]
              - tab "credit ratings" [ref=e293] [cursor=pointer]
              - tab "sectors" [ref=e294] [cursor=pointer]
              - tab "term structure" [ref=e295] [cursor=pointer]
              - tab "countries" [ref=e296] [cursor=pointer]
            - tabpanel "strategy allocation" [ref=e297]:
              - generic [ref=e298]:
                - generic [ref=e299]:
                  - 'img "strategy allocation: Equities 34.0%, Bonds 33.0%, Currencies 21.0%, Commodities 12.0%" [ref=e300]'
                  - generic [aria-hidden]:
                    - generic: 34%
                    - generic: Equities
                - generic [ref=e307]:
                  - 'button "Equities: 34.0%" [ref=e308]':
                    - generic [ref=e310]: Equities
                    - generic [ref=e311]: 34.0%
                  - 'button "Bonds: 33.0%" [ref=e312]':
                    - generic [ref=e314]: Bonds
                    - generic [ref=e315]: 33.0%
                  - 'button "Currencies: 21.0%" [ref=e316]':
                    - generic [ref=e318]: Currencies
                    - generic [ref=e319]: 21.0%
                  - 'button "Commodities: 12.0%" [ref=e320]':
                    - generic [ref=e322]: Commodities
                    - generic [ref=e323]: 12.0%
          - generic [ref=e324]:
            - generic [ref=e325]:
              - heading "top 10 holdings" [level=3] [ref=e326]
              - list "top 10 holdings" [ref=e327]:
                - listitem [ref=e328]:
                  - generic [ref=e329]: "01"
                  - generic "Synthetic Future 1" [ref=e330]
                  - generic [ref=e331]: 12.50%
                - listitem [ref=e332]:
                  - generic [ref=e333]: "02"
                  - generic "Synthetic Future 2" [ref=e334]
                  - generic [ref=e335]: 11.30%
                - listitem [ref=e336]:
                  - generic [ref=e337]: "03"
                  - generic "Synthetic Future 3" [ref=e338]
                  - generic [ref=e339]: 10.10%
                - listitem [ref=e340]:
                  - generic [ref=e341]: "04"
                  - generic "Synthetic Future 4" [ref=e342]
                  - generic [ref=e343]: 8.90%
                - listitem [ref=e344]:
                  - generic [ref=e345]: "05"
                  - generic "Synthetic Future 5" [ref=e346]
                  - generic [ref=e347]: 7.70%
                - listitem [ref=e348]:
                  - generic [ref=e349]: "06"
                  - generic "Synthetic Future 6" [ref=e350]
                  - generic [ref=e351]: 6.50%
                - listitem [ref=e352]:
                  - generic [ref=e353]: "07"
                  - generic "Synthetic Future 7" [ref=e354]
                  - generic [ref=e355]: 5.30%
                - listitem [ref=e356]:
                  - generic [ref=e357]: "08"
                  - generic "Synthetic Future 8" [ref=e358]
                  - generic [ref=e359]: 4.10%
            - generic [ref=e360]:
              - heading "sustainability metrics" [level=3] [ref=e361]
              - paragraph [ref=e362]: the portfolio vs its index
              - generic [ref=e363]:
                - generic [ref=e364]:
                  - term [ref=e365]: S&P Global ESG rank
                  - definition [ref=e366]:
                    - text: "68.2"
                    - generic [ref=e367]: index 61.5
                - generic [ref=e368]:
                  - term [ref=e369]: Carbon intensity
                  - definition [ref=e370]:
                    - text: "88.1"
                    - generic [ref=e371]: index 131.4
      - region "the essentials" [ref=e372]:
        - generic [ref=e373]:
          - generic [ref=e374]:
            - generic [ref=e375]: fund facts
            - heading "the essentials" [level=2] [ref=e377]:
              - generic [aria-hidden] [ref=e378]:
                - generic [ref=e379]: the
                - generic [ref=e380]: essentials
            - generic [ref=e381]: the essentials
            - paragraph [ref=e382]: "A managed-futures overlay stacked on top of an existing portfolio (about 5-10% deposit): capital stays fully invested while the overlay targets 3%, 6% or 9% downside volatility."
          - generic [ref=e383]:
            - generic [ref=e384]: $25.0M
            - generic [ref=e385]: assets under management · as of sep 28, 2026
          - generic [ref=e386]:
            - heading "classes" [level=3] [ref=e387]
            - table [ref=e389]:
              - caption [ref=e390]: classes
              - rowgroup [ref=e391]:
                - row [ref=e392]:
                  - columnheader "fundserv" [ref=e393]
                  - columnheader "class" [ref=e394]
                  - columnheader "currency" [ref=e395]
                  - columnheader "nav" [ref=e396]
                  - columnheader "change" [ref=e397]
                  - columnheader "date" [ref=e398]
              - rowgroup [ref=e399]:
                - row [ref=e400]:
                  - cell "headline class SAMPLE01 (headline class)" [ref=e401]:
                    - generic "headline class" [ref=e402]
                    - code [ref=e403]: SAMPLE01
                    - generic [ref=e404]: (headline class)
                  - cell "F" [ref=e405]
                  - cell "CAD" [ref=e406]
                  - cell "$10.1234" [ref=e407]
                  - cell "+0.12%" [ref=e408]
                  - cell "sep 28, 2026" [ref=e409]
          - generic [ref=e411]:
            - generic [ref=e412]:
              - term [ref=e413]: vehicle
              - definition [ref=e414]: managed accounts
            - generic [ref=e415]:
              - term [ref=e416]: asset class
              - definition [ref=e417]: protection overlay (managed accounts)
            - generic [ref=e418]:
              - term [ref=e419]: inception
              - definition [ref=e420]: january 2015
            - generic [ref=e421]:
              - term [ref=e422]: risk rating
              - definition [ref=e423]: low
      - region "disclosure" [ref=e424]:
        - generic [ref=e425]:
          - generic [ref=e426]:
            - generic [ref=e427]: important information
            - heading "disclosure" [level=2] [ref=e429]:
              - generic [ref=e431]: disclosure
            - generic [ref=e432]: disclosure
          - generic [ref=e433]:
            - paragraph [ref=e434]: The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.
            - paragraph [ref=e435]: Returns shown for this strategy are gross of fees and represent managed accounts; they are not the returns of an investment fund. Client returns are reduced by management fees and other expenses, and vary by account.
            - paragraph [ref=e436]: This website is for informational purposes only and does not constitute investment advice, an offer to sell, or a solicitation to buy any security. Past performance is not indicative of future results.
            - generic [ref=e437]: Updated daily from Nymbus’ data platform; portfolio data from the monthly factsheet of august 2026. performance as of august 2026 · net asset values as of sep 28, 2026 · assets as of sep 28, 2026.
      - navigation "on this page" [ref=e440]:
        - list "strategies" [ref=e441]:
          - listitem "Nymbus Monthly Income Fund" [ref=e442] [cursor=pointer]
          - listitem "Nymbus Sustainable Enhanced Bonds Fund" [ref=e445] [cursor=pointer]
          - listitem "Nymbus Multi-Strategy Fund" [ref=e448] [cursor=pointer]
          - listitem "Nymbus Global Minimum Volatility" [ref=e451] [cursor=pointer]
        - generic [ref=e454]:
          - link "overview" [ref=e455] [cursor=pointer]:
            - /url: "#overview"
          - link "performance" [ref=e456] [cursor=pointer]:
            - /url: "#performance"
          - link "growth" [ref=e457] [cursor=pointer]:
            - /url: "#growth"
          - link "calendar years" [ref=e458] [cursor=pointer]:
            - /url: "#calendar"
          - link "monthly" [ref=e459] [cursor=pointer]:
            - /url: "#monthly"
          - link "risk" [ref=e460] [cursor=pointer]:
            - /url: "#risk"
          - link "portfolio" [ref=e461] [cursor=pointer]:
            - /url: "#portfolio"
          - link "fund facts" [ref=e462] [cursor=pointer]:
            - /url: "#facts"
        - generic "illustrative figures only, not actual performance" [ref=e463]: sample data
  - contentinfo [ref=e464]:
    - generic [ref=e466]:
      - generic [ref=e467]:
        - generic [ref=e468]:
          - link "Nymbus Capital, home" [ref=e469] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e470]
          - paragraph [ref=e479]:
            - generic [ref=e481]: scientific investing
        - button "Back to top" [ref=e482] [cursor=pointer]
      - generic [ref=e485]:
        - generic [ref=e486]:
          - heading "strategies" [level=2] [ref=e487]
          - list [ref=e488]:
            - listitem [ref=e489]:
              - link "monthly income" [ref=e490] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e492]:
              - link "sustainable enhanced bonds" [ref=e493] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e495]:
              - link "multi-strategy" [ref=e496] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e498]:
              - link "global minimum volatility" [ref=e499] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e501]:
          - heading "firm" [level=2] [ref=e502]
          - list [ref=e503]:
            - listitem [ref=e504]:
              - link "approach" [ref=e505] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e506]:
              - link "team" [ref=e507] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e508]:
              - link "sustainability" [ref=e509] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e510]:
              - link "solutions" [ref=e511] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e512]:
          - heading "contact" [level=2] [ref=e513]
          - generic [ref=e514]:
            - generic [ref=e515]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e516] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e517]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e518] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
            - link "LinkedIn" [ref=e519] [cursor=pointer]:
              - /url: https://www.linkedin.com/company/nymbus-capital/
        - generic [ref=e523]:
          - heading "legal" [level=2] [ref=e524]
          - list [ref=e525]:
            - listitem [ref=e526]:
              - link "complaints & code of ethics" [ref=e527] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e528]:
              - link "privacy policy" [ref=e529] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e530]: PRI signatory
      - paragraph [ref=e531]: This website is for informational purposes only and does not constitute investment advice, an offer to sell, or a solicitation to buy any security. Past performance is not indicative of future results.
      - paragraph [ref=e532]: © 2026 Nymbus Capital Inc. All rights reserved.
  - alert [ref=e533]
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
> 54  |       await expect(page.getByTestId("classes-table")).toHaveCount(0);
      |                                                       ^ Error: expect(locator).toHaveCount(expected) failed
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
  96  |   await expect(page.getByRole("heading", { level: 1, name: "fonds nymbus revenu mensuel" })).toBeVisible();
  97  |   await expect(page.getByRole("heading", { name: "rendements cumulatifs" })).toBeAttached();
  98  |   await expect(page.getByTestId("basis")).toHaveText("net de frais");
  99  |   // French number formatting: decimal comma and a (narrow) no-break space before %
  100 |   await expect(page.locator(".fx-bigfig")).toHaveText(/^−?\d+,\d\s%$/, { timeout: 5_000 });
  101 | });
  102 | 
```