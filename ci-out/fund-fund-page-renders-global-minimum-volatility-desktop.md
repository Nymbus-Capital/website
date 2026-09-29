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
      - list [ref=e14]:
        - listitem [ref=e15]:
          - link "strategies" [ref=e16] [cursor=pointer]:
            - /url: /strategies
        - listitem [ref=e17]:
          - link "approach" [ref=e18] [cursor=pointer]:
            - /url: /approach
        - listitem [ref=e19]:
          - link "sustainability" [ref=e20] [cursor=pointer]:
            - /url: /sustainability
        - listitem [ref=e21]:
          - link "team" [ref=e22] [cursor=pointer]:
            - /url: /team
        - listitem [ref=e23]:
          - link "contact" [ref=e24] [cursor=pointer]:
            - /url: /contact
      - generic [ref=e25]:
        - button "Afficher le site en français" [ref=e26] [cursor=pointer]:
          - generic [aria-hidden] [ref=e27]: en
          - generic [aria-hidden] [ref=e28]: fr
        - 'button "Switch theme (current: system theme)" [ref=e29] [cursor=pointer]'
  - main [ref=e32]:
    - generic [ref=e33]:
      - generic [aria-hidden]: sample data
      - region "Nymbus Global Minimum Volatility" [ref=e34]:
        - generic [ref=e35]:
          - generic [ref=e36]:
            - generic [ref=e37]: managed accounts
            - generic "illustrative figures only, not actual performance" [ref=e39]: sample data
          - heading "nymbus global minimum volatility" [level=1] [ref=e40]:
            - generic [aria-hidden] [ref=e41]:
              - generic [ref=e42]: nymbus
              - generic [ref=e43]: global
              - generic [ref=e44]: minimum
              - generic [ref=e45]: volatility
          - generic [ref=e46]: Nymbus Global Minimum Volatility
          - paragraph [ref=e47]: an uncorrelated buffer for bond drawdowns
          - generic [ref=e48]:
            - generic [ref=e50]:
              - generic [ref=e51]: 8.2%
              - generic [ref=e53]: gross annualized return · since inception · as of august 2026
            - generic [ref=e54]:
              - generic [ref=e55]:
                - generic [ref=e56]:
                  - generic [ref=e57]: $10.1234
                  - generic "+0.12% vs previous valuation day" [ref=e58]: +0.0123 · +0.12%
                - generic [ref=e61]:
                  - text: net asset value · class
                  - generic [ref=e62]: F (SAMPLE01)
                  - text: · sep 28, 2026
              - generic [ref=e63]: gross of fees · managed accounts, not a fund
          - generic [ref=e65]:
            - generic [ref=e66]:
              - generic [ref=e67]: asset class
              - text: protection overlay (managed accounts)
            - 'generic "risk level: low" [ref=e68]':
              - generic [ref=e69]: risk level
              - generic [aria-hidden] [ref=e70]: low
            - generic [ref=e77]:
              - generic [ref=e78]: solution inception
              - text: january 2015
          - paragraph [ref=e79]: Returns shown for this strategy are gross of fees and represent managed accounts; they are not the returns of an investment fund. Client returns are reduced by management fees and other expenses, and vary by account.
      - region "trailing returns" [ref=e80]:
        - generic [ref=e81]:
          - generic [ref=e82]:
            - generic [ref=e83]: performance · as of august 2026
            - heading "trailing returns" [level=2] [ref=e85]:
              - generic [aria-hidden] [ref=e86]:
                - generic [ref=e87]: trailing
                - generic [ref=e88]: returns
            - generic [ref=e89]: trailing returns
          - generic [ref=e90]: strategy
          - group "trailing returns" [ref=e96]:
            - generic [ref=e97]: 0%
            - generic [ref=e99]: 2%
            - generic [ref=e101]: 4%
            - generic [ref=e103]: 6%
            - generic [ref=e105]: 8%
            - generic [ref=e107]: 10%
            - img "1 month, strategy 2.0%" [ref=e109]:
              - generic [ref=e111]: "2.0"
              - generic [ref=e114]: 1M
            - img "3 months, strategy 4.0%" [ref=e115]:
              - generic [ref=e117]: "4.0"
              - generic [ref=e120]: 3M
            - img "year to date, strategy 4.8%" [ref=e121]:
              - generic [ref=e123]: "4.8"
              - generic [ref=e126]: YTD
            - img "1 year, strategy 6.1%" [ref=e127]:
              - generic [ref=e129]: "6.1"
              - generic [ref=e132]: 1Y
            - img "2 years*, strategy 6.5%" [ref=e133]:
              - generic [ref=e135]: "6.5"
              - generic [ref=e138]: 2Y
            - img "3 years*, strategy 6.8%" [ref=e139]:
              - generic [ref=e141]: "6.8"
              - generic [ref=e144]: 3Y
            - img "5 years*, strategy 7.2%" [ref=e145]:
              - generic [ref=e147]: "7.2"
              - generic [ref=e150]: 5Y
            - img "since inception*, strategy 8.2%" [ref=e151]:
              - generic [ref=e153]: "8.2"
              - generic [ref=e156]: SI
          - paragraph [ref=e157]: "* Periods of 2 years and more, and since inception, are annualized."
          - group [ref=e158]:
            - generic "show the numbers" [ref=e159] [cursor=pointer]
      - region "growth of $10,000" [ref=e160]:
        - generic [ref=e161]:
          - generic [ref=e162]:
            - generic [ref=e163]: growth
            - heading "growth of $10,000" [level=2] [ref=e165]:
              - generic [aria-hidden] [ref=e166]:
                - generic [ref=e167]: growth
                - generic [ref=e168]: of
                - generic [ref=e169]: $10,000
            - generic [ref=e170]: growth of $10,000
            - paragraph [ref=e171]: a hypothetical $10,000 investment, distributions reinvested
          - generic [ref=e172]:
            - group "period" [ref=e174]:
              - button "1Y" [ref=e175] [cursor=pointer]
              - button "3Y" [ref=e176] [cursor=pointer]
              - button "5Y" [ref=e177] [cursor=pointer]
              - button "since inception" [pressed] [ref=e178] [cursor=pointer]
            - generic [ref=e179]: strategy
            - 'img "growth of $10,000. strategy: $10,000 → $19,570 (+95.7%), december 2014 – august 2026. use the arrow keys to move through the months" [ref=e183]':
              - generic [ref=e184]: $10k
              - generic [ref=e186]: $12k
              - generic [ref=e188]: $14k
              - generic [ref=e190]: $16k
              - generic [ref=e192]: $18k
              - generic [ref=e194]: $20k
              - generic [ref=e196]: "2016"
              - generic [ref=e197]: "2018"
              - generic [ref=e198]: "2020"
              - generic [ref=e199]: "2022"
              - generic [ref=e200]: "2024"
              - generic [ref=e201]: "2026"
              - generic [ref=e207]: $19,570
      - region "year by year" [ref=e210]:
        - generic [ref=e211]:
          - generic [ref=e212]:
            - generic [ref=e213]: calendar years
            - heading "year by year" [level=2] [ref=e215]:
              - generic [aria-hidden] [ref=e216]:
                - generic [ref=e217]: year
                - generic [ref=e218]: by
                - generic [ref=e219]: year
            - generic [ref=e220]: year by year
          - generic [ref=e221]: strategy
          - group [ref=e227]:
            - generic "show the numbers" [ref=e228] [cursor=pointer]
      - region "every month, since inception" [ref=e229]:
        - generic [ref=e230]:
          - generic [ref=e231]:
            - generic [ref=e232]: monthly returns
            - heading "every month, since inception" [level=2] [ref=e234]:
              - generic [aria-hidden] [ref=e235]:
                - generic [ref=e236]: every
                - generic [ref=e237]: month,
                - generic [ref=e238]: since
                - generic [ref=e239]: inception
            - generic [ref=e240]: every month, since inception
          - generic [aria-hidden] [ref=e243]:
            - generic [ref=e244]: negative
            - generic [ref=e246]: positive
      - region "the ride matters" [ref=e247]:
        - generic [ref=e248]:
          - generic [ref=e249]:
            - generic [ref=e250]: risk
            - heading "the ride matters" [level=2] [ref=e252]:
              - generic [aria-hidden] [ref=e253]:
                - generic [ref=e254]: the
                - generic [ref=e255]: ride
                - generic [ref=e256]: matters
            - generic [ref=e257]: the ride matters
            - paragraph [ref=e258]: annualized, from monthly returns · as of august 2026
          - group "risk" [ref=e260]:
            - button "since inception" [pressed] [ref=e261] [cursor=pointer]
            - button "3 years" [ref=e262] [cursor=pointer]
          - generic [ref=e263]:
            - generic [ref=e264]:
              - generic [ref=e265]: 8.2%
              - generic [ref=e266]: annualized return
            - generic [ref=e267]:
              - generic [ref=e268]: 5.5%
              - generic [ref=e269]: volatility
            - generic [ref=e270]:
              - generic [ref=e271]: 2.4%
              - generic [ref=e272]: downside deviation
            - generic [ref=e273]:
              - generic [ref=e274]: "1.5"
              - generic [ref=e275]: sharpe ratio
            - generic [ref=e276]:
              - generic [ref=e277]: "3.5"
              - generic [ref=e278]: sortino ratio
            - generic [ref=e279]:
              - generic [ref=e280]: −7%
              - generic [ref=e281]: max drawdown
            - generic [ref=e282]:
              - generic [ref=e283]: 5.2%
              - generic [ref=e284]: best month
            - generic [ref=e285]:
              - generic [ref=e286]: −3.0%
              - generic [ref=e287]: worst month
            - generic [ref=e288]:
              - 'img "positive months: 65%" [ref=e289]':
                - generic [aria-hidden] [ref=e293]: 65%
              - generic [ref=e294]: positive months
      - region "inside the portfolio" [ref=e295]:
        - generic [ref=e296]:
          - generic [ref=e297]:
            - generic [ref=e298]: portfolio
            - heading "inside the portfolio" [level=2] [ref=e300]:
              - generic [aria-hidden] [ref=e301]:
                - generic [ref=e302]: inside
                - generic [ref=e303]: the
                - generic [ref=e304]: portfolio
            - generic [ref=e305]: inside the portfolio
            - paragraph [ref=e306]: from the monthly factsheet of august 2026
          - generic [ref=e307]:
            - generic [ref=e308]:
              - generic [ref=e309]: "24"
              - generic [ref=e310]: Number of futures contracts
            - generic [ref=e311]:
              - generic [ref=e312]: 6.00%
              - generic [ref=e313]: Target downside volatility
          - generic [ref=e314]:
            - tablist "portfolio" [ref=e316]:
              - tab "strategy allocation" [selected] [ref=e317] [cursor=pointer]
              - tab "credit ratings" [ref=e318] [cursor=pointer]
              - tab "sectors" [ref=e319] [cursor=pointer]
              - tab "term structure" [ref=e320] [cursor=pointer]
              - tab "countries" [ref=e321] [cursor=pointer]
            - tabpanel "strategy allocation" [ref=e322]:
              - generic [ref=e323]:
                - generic [ref=e324]:
                  - 'img "strategy allocation: Equities 34.0%, Bonds 33.0%, Currencies 21.0%, Commodities 12.0%" [ref=e325]'
                  - generic [aria-hidden]:
                    - generic: 34%
                    - generic: Equities
                - generic [ref=e332]:
                  - 'button "Equities: 34.0%" [ref=e333]':
                    - generic [ref=e335]: Equities
                    - generic [ref=e336]: 34.0%
                  - 'button "Bonds: 33.0%" [ref=e337]':
                    - generic [ref=e339]: Bonds
                    - generic [ref=e340]: 33.0%
                  - 'button "Currencies: 21.0%" [ref=e341]':
                    - generic [ref=e343]: Currencies
                    - generic [ref=e344]: 21.0%
                  - 'button "Commodities: 12.0%" [ref=e345]':
                    - generic [ref=e347]: Commodities
                    - generic [ref=e348]: 12.0%
          - generic [ref=e349]:
            - generic [ref=e350]:
              - heading "top 10 holdings" [level=3] [ref=e351]
              - list "top 10 holdings" [ref=e352]:
                - listitem [ref=e353]:
                  - generic [ref=e354]: "01"
                  - generic "Synthetic Future 1" [ref=e355]
                  - generic [ref=e358]: 12.50%
                - listitem [ref=e359]:
                  - generic [ref=e360]: "02"
                  - generic "Synthetic Future 2" [ref=e361]
                  - generic [ref=e364]: 11.30%
                - listitem [ref=e365]:
                  - generic [ref=e366]: "03"
                  - generic "Synthetic Future 3" [ref=e367]
                  - generic [ref=e370]: 10.10%
                - listitem [ref=e371]:
                  - generic [ref=e372]: "04"
                  - generic "Synthetic Future 4" [ref=e373]
                  - generic [ref=e376]: 8.90%
                - listitem [ref=e377]:
                  - generic [ref=e378]: "05"
                  - generic "Synthetic Future 5" [ref=e379]
                  - generic [ref=e382]: 7.70%
                - listitem [ref=e383]:
                  - generic [ref=e384]: "06"
                  - generic "Synthetic Future 6" [ref=e385]
                  - generic [ref=e388]: 6.50%
                - listitem [ref=e389]:
                  - generic [ref=e390]: "07"
                  - generic "Synthetic Future 7" [ref=e391]
                  - generic [ref=e394]: 5.30%
                - listitem [ref=e395]:
                  - generic [ref=e396]: "08"
                  - generic "Synthetic Future 8" [ref=e397]
                  - generic [ref=e400]: 4.10%
            - generic [ref=e401]:
              - heading "sustainability metrics" [level=3] [ref=e402]
              - paragraph [ref=e403]: the portfolio vs its index
              - generic [ref=e404]:
                - generic [ref=e405]:
                  - term [ref=e406]: S&P Global ESG rank
                  - definition [ref=e407]:
                    - text: "68.2"
                    - generic [ref=e408]: index 61.5
                - generic [ref=e409]:
                  - term [ref=e410]: Carbon intensity
                  - definition [ref=e411]:
                    - text: "88.1"
                    - generic [ref=e412]: index 131.4
      - region "the essentials" [ref=e413]:
        - generic [ref=e414]:
          - generic [ref=e415]:
            - generic [ref=e416]: fund facts
            - heading "the essentials" [level=2] [ref=e418]:
              - generic [aria-hidden] [ref=e419]:
                - generic [ref=e420]: the
                - generic [ref=e421]: essentials
            - generic [ref=e422]: the essentials
            - paragraph [ref=e423]: "A managed-futures overlay stacked on top of an existing portfolio (about 5-10% deposit): capital stays fully invested while the overlay targets 3%, 6% or 9% downside volatility."
          - generic [ref=e424]:
            - generic [ref=e425]: $25.0M
            - generic [ref=e426]: assets under management · as of sep 28, 2026
          - generic [ref=e427]:
            - heading "classes" [level=3] [ref=e428]
            - table [ref=e430]:
              - caption [ref=e431]: classes
              - rowgroup [ref=e432]:
                - row [ref=e433]:
                  - columnheader "fundserv" [ref=e434]
                  - columnheader "class" [ref=e435]
                  - columnheader "currency" [ref=e436]
                  - columnheader "nav" [ref=e437]
                  - columnheader "change" [ref=e438]
                  - columnheader "date" [ref=e439]
              - rowgroup [ref=e440]:
                - row [ref=e441]:
                  - cell "headline class SAMPLE01 (headline class)" [ref=e442]:
                    - generic "headline class" [ref=e443]
                    - code [ref=e444]: SAMPLE01
                    - generic [ref=e445]: (headline class)
                  - cell "F" [ref=e446]
                  - cell "CAD" [ref=e447]
                  - cell "$10.1234" [ref=e448]
                  - cell "+0.12%" [ref=e449]
                  - cell "sep 28, 2026" [ref=e450]
          - generic [ref=e452]:
            - generic [ref=e453]:
              - term [ref=e454]: vehicle
              - definition [ref=e455]: managed accounts
            - generic [ref=e456]:
              - term [ref=e457]: asset class
              - definition [ref=e458]: protection overlay (managed accounts)
            - generic [ref=e459]:
              - term [ref=e460]: inception
              - definition [ref=e461]: january 2015
            - generic [ref=e462]:
              - term [ref=e463]: risk rating
              - definition [ref=e464]: low
      - region "disclosure" [ref=e465]:
        - generic [ref=e466]:
          - generic [ref=e467]:
            - generic [ref=e468]: important information
            - heading "disclosure" [level=2] [ref=e470]:
              - generic [ref=e472]: disclosure
            - generic [ref=e473]: disclosure
          - generic [ref=e474]:
            - paragraph [ref=e475]: The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.
            - paragraph [ref=e476]: Returns shown for this strategy are gross of fees and represent managed accounts; they are not the returns of an investment fund. Client returns are reduced by management fees and other expenses, and vary by account.
            - paragraph [ref=e477]: This website is for informational purposes only and does not constitute investment advice, an offer to sell, or a solicitation to buy any security. Past performance is not indicative of future results.
            - generic [ref=e478]: Updated daily from Nymbus’ data platform; portfolio data from the monthly factsheet of august 2026. performance as of august 2026 · net asset values as of sep 28, 2026 · assets as of sep 28, 2026.
      - navigation "on this page" [ref=e481]:
        - list "strategies" [ref=e482]:
          - listitem "Nymbus Monthly Income Fund" [ref=e483] [cursor=pointer]
          - listitem "Nymbus Sustainable Enhanced Bonds Fund" [ref=e486] [cursor=pointer]
          - listitem "Nymbus Multi-Strategy Fund" [ref=e489] [cursor=pointer]
          - listitem "Nymbus Global Minimum Volatility" [ref=e492] [cursor=pointer]
        - generic [ref=e495]:
          - link "overview" [ref=e496] [cursor=pointer]:
            - /url: "#overview"
          - link "performance" [ref=e497] [cursor=pointer]:
            - /url: "#performance"
          - link "growth" [ref=e498] [cursor=pointer]:
            - /url: "#growth"
          - link "calendar years" [ref=e499] [cursor=pointer]:
            - /url: "#calendar"
          - link "monthly" [ref=e500] [cursor=pointer]:
            - /url: "#monthly"
          - link "risk" [ref=e501] [cursor=pointer]:
            - /url: "#risk"
          - link "portfolio" [ref=e502] [cursor=pointer]:
            - /url: "#portfolio"
          - link "fund facts" [ref=e503] [cursor=pointer]:
            - /url: "#facts"
        - generic "illustrative figures only, not actual performance" [ref=e504]: sample data
  - contentinfo [ref=e505]:
    - generic [ref=e507]:
      - generic [ref=e508]:
        - generic [ref=e509]:
          - link "Nymbus Capital, home" [ref=e510] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e511]
          - paragraph [ref=e520]:
            - generic [ref=e522]: scientific investing
        - button "Back to top" [ref=e523] [cursor=pointer]
      - generic [ref=e526]:
        - generic [ref=e527]:
          - heading "strategies" [level=2] [ref=e528]
          - list [ref=e529]:
            - listitem [ref=e530]:
              - link "monthly income" [ref=e531] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e533]:
              - link "sustainable enhanced bonds" [ref=e534] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e536]:
              - link "multi-strategy" [ref=e537] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e539]:
              - link "global minimum volatility" [ref=e540] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e542]:
          - heading "firm" [level=2] [ref=e543]
          - list [ref=e544]:
            - listitem [ref=e545]:
              - link "approach" [ref=e546] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e547]:
              - link "team" [ref=e548] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e549]:
              - link "sustainability" [ref=e550] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e551]:
              - link "solutions" [ref=e552] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e553]:
          - heading "contact" [level=2] [ref=e554]
          - generic [ref=e555]:
            - generic [ref=e556]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e557] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e558]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e559] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
            - link "LinkedIn" [ref=e560] [cursor=pointer]:
              - /url: https://www.linkedin.com/company/nymbus-capital/
        - generic [ref=e564]:
          - heading "legal" [level=2] [ref=e565]
          - list [ref=e566]:
            - listitem [ref=e567]:
              - link "complaints & code of ethics" [ref=e568] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e569]:
              - link "privacy policy" [ref=e570] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e571]: PRI signatory
      - paragraph [ref=e572]: This website is for informational purposes only and does not constitute investment advice, an offer to sell, or a solicitation to buy any security. Past performance is not indicative of future results.
      - paragraph [ref=e573]: © 2026 Nymbus Capital Inc. All rights reserved.
  - alert [ref=e574]
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