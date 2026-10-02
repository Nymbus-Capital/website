# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> Global Minimum Volatility: 3 / 6 / 9 % variants, default 6, no class selector, no NAV, no distributions
- Location: e2e/fund.spec.ts:358:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "+8.20%"
Received: "+0.31%"
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main"
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "Nymbus Capital, home" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "nymbus" [ref=e6]
      - navigation "Primary"
      - generic [ref=e15]:
        - button "Afficher le site en français" [ref=e16] [cursor=pointer]:
          - generic [aria-hidden] [ref=e17]: en
          - generic [aria-hidden] [ref=e18]: fr
        - button "Open menu" [ref=e19] [cursor=pointer]
  - main [ref=e21]:
    - generic [ref=e22]:
      - generic [ref=e24]:
        - navigation "Breadcrumb" [ref=e25]:
          - list [ref=e26]:
            - listitem [ref=e27]:
              - link "Home" [ref=e28] [cursor=pointer]:
                - /url: /
            - listitem [ref=e31]:
              - link "Strategies" [ref=e32] [cursor=pointer]:
                - /url: /strategies
            - listitem [ref=e35]:
              - generic [ref=e36]: Global Minimum Volatility
        - generic [ref=e37]:
          - generic [ref=e38]:
            - paragraph [ref=e40]: Futures overlay (managed accounts)
            - heading "Nymbus Global Minimum Volatility" [level=1] [ref=e42]:
              - generic [aria-hidden] [ref=e43]:
                - generic [ref=e44]: Nymbus
                - generic [ref=e45]: Global
                - generic [ref=e46]: Minimum
                - generic [ref=e47]: Volatility
            - paragraph [ref=e49]: A futures overlay designed to have low correlation with bonds
            - paragraph [ref=e51]: "A managed-futures overlay stacked on top of an existing portfolio (margin deposit of about 5 to 10% of exposure): most of the capital stays invested in the underlying portfolio while the overlay targets 3%, 6% or 9% downside volatility. The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin."
            - generic [ref=e52]:
              - generic [ref=e53]: Managed accounts
              - generic [ref=e55]:
                - generic [ref=e56]: Risk
                - text: Low
              - generic "Illustrative figures only, not actual performance" [ref=e63]: Sample data
            - generic [ref=e65]:
              - link "Contact us" [ref=e66] [cursor=pointer]:
                - /url: /contact
              - link "Documentation" [ref=e69] [cursor=pointer]:
                - /url: "#documents"
          - generic [ref=e74]:
            - generic [ref=e75]:
              - generic [ref=e76]: Strategy at a glance
              - generic [ref=e77]: As of Aug 31, 2026
            - generic [ref=e80]:
              - generic [ref=e81]: Target downside volatility
              - radiogroup "Target downside volatility" [ref=e82]:
                - radio "Variant 6%" [checked] [active] [ref=e83] [cursor=pointer]:
                  - generic [ref=e84]: Variant
                  - text: 6%
                - radio "Variant 3%" [ref=e85] [cursor=pointer]:
                  - generic [ref=e86]: Variant
                  - text: 3%
                - radio "Variant 9%" [ref=e87] [cursor=pointer]:
                  - generic [ref=e88]: Variant
                  - text: 9%
            - generic [ref=e90]:
              - generic [ref=e91]: 8.2%
              - generic [aria-hidden] [ref=e92]:
                - generic [ref=e94]:
                  - generic [ref=e95]: "0"
                  - generic [ref=e96]: "1"
                  - generic [ref=e97]: "2"
                  - generic [ref=e98]: "3"
                  - generic [ref=e99]: "4"
                  - generic [ref=e100]: "5"
                  - generic [ref=e101]: "6"
                  - generic [ref=e102]: "7"
                  - generic [ref=e103]: "8"
                  - generic [ref=e104]: "9"
                - generic [ref=e105]: .
                - generic [ref=e107]:
                  - generic [ref=e108]: "0"
                  - generic [ref=e109]: "1"
                  - generic [ref=e110]: "2"
                  - generic [ref=e111]: "3"
                  - generic [ref=e112]: "4"
                  - generic [ref=e113]: "5"
                  - generic [ref=e114]: "6"
                  - generic [ref=e115]: "7"
                  - generic [ref=e116]: "8"
                  - generic [ref=e117]: "9"
                - generic [ref=e118]: "%"
            - paragraph [ref=e119]:
              - generic [ref=e120]: Annualized return since inception, gross of fees
            - generic [ref=e121]:
              - generic [ref=e122]:
                - term [ref=e123]: Vehicle
                - definition [ref=e124]: Separately managed accounts
              - generic [ref=e125]:
                - term [ref=e126]: Returns
                - definition [ref=e127]: Gross of fees
              - generic [ref=e128]:
                - term [ref=e129]: Track record since
                - definition [ref=e130]: January 2015
              - generic [ref=e131]:
                - term [ref=e132]: Risk
                - definition [ref=e133]: Low
      - region [ref=e134]:
        - generic [ref=e136]:
          - generic [ref=e137]:
            - heading "Returns" [level=2] [ref=e138]
            - paragraph [ref=e139]: Target downside volatility 6%, Gross of fees · managed accounts, not a fund · as of August 31, 2026
          - list [ref=e140]:
            - listitem [ref=e141]:
              - generic "1 month" [ref=e142]: 1M
              - generic [ref=e144]: +1.99%
            - listitem [ref=e145]:
              - generic "3 months" [ref=e146]: 3M
              - generic [ref=e148]: +3.98%
            - listitem [ref=e149]:
              - generic "Year to date" [ref=e150]: YTD
              - generic [ref=e152]: +4.78%
            - listitem [ref=e153]:
              - generic "1 year" [ref=e154]: 1Y
              - generic [ref=e156]: +6.07%
            - listitem [ref=e157]:
              - generic "3 years" [ref=e158]:
                - text: 3Y
                - superscript [aria-hidden] [ref=e160]: "*"
              - generic [ref=e161]: +6.77%
            - listitem [ref=e162]:
              - generic "5 years" [ref=e163]:
                - text: 5Y
                - superscript [aria-hidden] [ref=e165]: "*"
              - generic [ref=e166]: +7.17%
            - listitem [ref=e167]:
              - generic "Since inception" [ref=e168]:
                - text: SI
                - superscript [aria-hidden] [ref=e170]: "*"
              - generic [ref=e171]: +8.16%
          - paragraph [ref=e172]: "* Periods over one year are annualized."
      - generic [ref=e173]:
        - tablist "Strategy information" [ref=e176]:
          - tab "Overview" [ref=e177] [cursor=pointer]
          - tab "Performance" [selected] [ref=e178] [cursor=pointer]
          - tab "Portfolio" [ref=e179] [cursor=pointer]
          - tab "Documents" [ref=e180] [cursor=pointer]
        - tabpanel "Performance" [ref=e181]:
          - heading "Performance" [level=2] [ref=e182]
          - generic [ref=e183]:
            - paragraph [ref=e184]: "Performance shown: gross of fees · managed accounts, not a fund · as of August 31, 2026 · Target downside volatility 6%"
            - generic [ref=e185]:
              - heading "Growth of $10,000" [level=3] [ref=e187]
              - paragraph [ref=e189]: A hypothetical $10,000 invested in the strategy. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative.
              - generic [ref=e190]:
                - group "Period" [ref=e192]:
                  - button "1Y" [ref=e193] [cursor=pointer]
                  - button "3Y" [ref=e194] [cursor=pointer]
                  - button "5Y" [ref=e195] [cursor=pointer]
                  - button "Since inception" [pressed] [ref=e196] [cursor=pointer]
                - generic [ref=e197]: Strategy
                - 'img "Growth of $10,000. Strategy: $10,000 → $19,570 (+95.7%), December 2014 – August 2026. Use the arrow keys to move through the months." [ref=e201]':
                  - generic [ref=e202]: $10k
                  - generic [ref=e204]: $12.5k
                  - generic [ref=e206]: $15k
                  - generic [ref=e208]: $17.5k
                  - generic [ref=e210]: $20k
                  - generic [ref=e212]: "2015"
                  - generic [ref=e213]: "2020"
                  - generic [ref=e214]: "2025"
            - generic [ref=e220]:
              - generic [ref=e221]:
                - heading "Annualized and trailing returns" [level=3] [ref=e222]
                - generic [ref=e224]: Strategy
              - paragraph [ref=e232]: "* Periods over one year are annualized."
              - group [ref=e233]:
                - generic "Show the data table" [ref=e234] [cursor=pointer]
            - generic [ref=e235]:
              - generic [ref=e236]:
                - heading "Calendar-year returns" [level=3] [ref=e237]
                - generic [ref=e239]: Strategy
              - group [ref=e246]:
                - generic "Show the data table" [ref=e247] [cursor=pointer]
            - generic [ref=e248]:
              - heading "Monthly returns" [level=3] [ref=e250]
              - paragraph [ref=e252]: Every month since the start of the track record; the last column is the calendar-year return.
              - generic [aria-hidden] [ref=e255]:
                - generic [ref=e256]: Negative
                - generic [ref=e258]: Positive
            - generic [ref=e259]:
              - generic [ref=e260]:
                - heading "Risk statistics" [level=3] [ref=e261]
                - group "Risk statistics" [ref=e264]:
                  - button "Since inception" [pressed] [ref=e265] [cursor=pointer]
                  - button "Last 3 years" [ref=e266] [cursor=pointer]
              - paragraph [ref=e267]: Annualized, from monthly returns.
              - generic [ref=e268]:
                - generic [ref=e269]:
                  - generic [ref=e270]: 8.2%
                  - generic [ref=e271]: Annualized return
                - generic [ref=e272]:
                  - generic [ref=e273]: 5.5%
                  - generic [ref=e274]: Volatility
                - generic [ref=e275]:
                  - generic [ref=e276]: 2.4%
                  - generic [ref=e277]: Downside deviation
                - generic [ref=e278]:
                  - generic [ref=e279]: "1.5"
                  - generic [ref=e280]: Sharpe ratio
                - generic [ref=e281]:
                  - generic [ref=e282]: "3.5"
                  - generic [ref=e283]: Sortino ratio
                - generic [ref=e284]:
                  - generic [ref=e285]: −7%
                  - generic [ref=e286]: Maximum drawdown
                - generic [ref=e287]:
                  - generic [ref=e288]: 5.2%
                  - generic [ref=e289]: Best month
                - generic [ref=e290]:
                  - generic [ref=e291]: −3.0%
                  - generic [ref=e292]: Worst month
                - generic [ref=e293]:
                  - 'img "Positive months: 65%" [ref=e294]':
                    - generic [aria-hidden] [ref=e298]: 65%
                  - generic [ref=e299]: Positive months
            - generic [ref=e300]:
              - heading "Performance notes" [level=3] [ref=e302]
              - paragraph [ref=e304]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative.
      - region [ref=e305]:
        - generic [ref=e306]:
          - generic [ref=e307]:
            - paragraph [ref=e309]: Global Minimum Volatility
            - heading "How the overlay works" [level=2] [ref=e311]:
              - generic [aria-hidden] [ref=e312]:
                - generic [ref=e313]: How
                - generic [ref=e314]: the
                - generic [ref=e315]: overlay
                - generic [ref=e316]: works
            - generic [ref=e317]: A futures overlay that sits on top of the portfolio you already own.
          - generic [ref=e319]:
            - generic [ref=e320]:
              - heading "Stacked on your portfolio" [level=3] [ref=e325]
              - paragraph [ref=e327]: "The overlay does not replace existing holdings: most of the capital stays invested in the underlying portfolio."
            - generic [ref=e328]:
              - heading "Liquid futures" [level=3] [ref=e334]
              - paragraph [ref=e336]: Positions are taken through exchange-traded futures, which require a margin deposit. The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.
            - generic [ref=e337]:
              - heading "A volatility target" [level=3] [ref=e342]
              - paragraph [ref=e344]: The overlay is sized to the level of downside volatility agreed with the client.
            - generic [ref=e345]:
              - heading "Designed for low correlation" [level=3] [ref=e350]
              - paragraph [ref=e352]: The overlay is designed to have low correlation with bonds and to offset part of bond losses when volatility rises; it may not do so and can lose money.
      - region [ref=e353]:
        - generic [ref=e355]:
          - generic [ref=e356]:
            - paragraph [ref=e357]: Important information
            - heading "Disclosures" [level=2] [ref=e359]
          - generic [ref=e360]:
            - paragraph [ref=e361]: The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.
            - paragraph [ref=e362]: "Performance shown: gross of fees · managed accounts, not a fund"
            - paragraph [ref=e363]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative.
            - paragraph [ref=e364]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
            - paragraph [ref=e365]:
              - generic [ref=e367]: Updated daily from Nymbus’ data platform; portfolio data from the monthly factsheet of August 2026. performance as of August 2026.
      - generic [ref=e370]:
        - heading "Interested in the strategy?" [level=2] [ref=e371]:
          - generic [aria-hidden] [ref=e372]:
            - generic [ref=e373]: Interested
            - generic [ref=e374]: in
            - generic [ref=e375]: the
            - generic [ref=e376]: strategy?
        - paragraph [ref=e378]: Our team can explain how the overlay works and how it could fit your portfolio.
        - generic [ref=e380]:
          - link "Contact our team" [ref=e381] [cursor=pointer]:
            - /url: /contact
          - link "All strategies" [ref=e384] [cursor=pointer]:
            - /url: /strategies
      - region [ref=e385]:
        - generic [ref=e386]:
          - generic [ref=e387]:
            - paragraph [ref=e389]: Explore
            - heading "Other strategies" [level=2] [ref=e391]:
              - generic [aria-hidden] [ref=e392]:
                - generic [ref=e393]: Other
                - generic [ref=e394]: strategies
          - generic [ref=e395]:
            - link "Short-term fixed income Monthly Income Monthly income from short-term corporate bonds View Nymbus Monthly Income Fund" [ref=e396] [cursor=pointer]:
              - /url: /strategies/monthly-income
              - generic [ref=e398]: Short-term fixed income
              - generic [ref=e399]: Monthly Income
              - generic [ref=e400]: Monthly income from short-term corporate bonds
              - generic [ref=e401]:
                - text: View
                - generic [ref=e402]: Nymbus Monthly Income Fund
            - link "Core fixed income Sustainable Enhanced Bonds Canadian core bonds, managed systematically View Nymbus Sustainable Enhanced Bonds Fund" [ref=e405] [cursor=pointer]:
              - /url: /strategies/sustainable-enhanced-bonds
              - generic [ref=e407]: Core fixed income
              - generic [ref=e408]: Sustainable Enhanced Bonds
              - generic [ref=e409]: Canadian core bonds, managed systematically
              - generic [ref=e410]:
                - text: View
                - generic [ref=e411]: Nymbus Sustainable Enhanced Bonds Fund
            - link "Alternative strategies Multi-Strategy Four systematic strategies designed to have low correlation with one another View Nymbus Multi-Strategy Fund" [ref=e414] [cursor=pointer]:
              - /url: /strategies/multi-strategy
              - generic [ref=e416]: Alternative strategies
              - generic [ref=e417]: Multi-Strategy
              - generic [ref=e418]: Four systematic strategies designed to have low correlation with one another
              - generic [ref=e419]:
                - text: View
                - generic [ref=e420]: Nymbus Multi-Strategy Fund
  - contentinfo [ref=e423]:
    - generic [ref=e424]:
      - generic [ref=e425]:
        - generic [ref=e426]:
          - link "Nymbus Capital, home" [ref=e427] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e428]
          - paragraph [ref=e437]: Montreal portfolio manager building systematic fixed income and alternative strategies.
          - generic [ref=e438]:
            - generic [ref=e439]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e440] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e441]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e442] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e443]:
          - heading "Strategies" [level=2] [ref=e444]
          - list [ref=e445]:
            - listitem [ref=e446]:
              - link "Monthly Income" [ref=e447] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e449]:
              - link "Sustainable Enhanced Bonds" [ref=e450] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e452]:
              - link "Multi-Strategy" [ref=e453] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e455]:
              - link "Global Minimum Volatility" [ref=e456] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e458]:
          - heading "Company" [level=2] [ref=e459]
          - list [ref=e460]:
            - listitem [ref=e461]:
              - link "About & team" [ref=e462] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e463]:
              - link "Approach" [ref=e464] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e465]:
              - link "Sustainability" [ref=e466] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e467]:
              - link "Solutions" [ref=e468] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e469]:
          - heading "Resources" [level=2] [ref=e470]
          - list [ref=e471]:
            - listitem [ref=e472]:
              - link "Contact" [ref=e473] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e474]:
              - link "Privacy policy" [ref=e475] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e476]:
              - link "Complaints & code of ethics" [ref=e477] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e478]:
              - link "LinkedIn" [ref=e479] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e483]:
        - paragraph [ref=e484]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
        - paragraph [ref=e485]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
        - paragraph [ref=e486]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
        - paragraph [ref=e487]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
        - paragraph [ref=e488]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
        - paragraph [ref=e489]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative.
        - paragraph [ref=e490]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
      - generic [ref=e491]:
        - generic [ref=e492]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e493]: PRI signatory
  - alert [ref=e494]
```

# Test source

```ts
  276 | test("registry alias redirects to the canonical slug", async ({ page }) => {
  277 |   await page.goto("/strategies/gmv");
  278 |   await expect(page).toHaveURL(/\/strategies\/global-minimum-volatility$/);
  279 | });
  280 | 
  281 | test("unknown slug is a 404", async ({ page }) => {
  282 |   const res = await page.goto("/strategies/no-such-fund");
  283 |   expect(res?.status()).toBe(404);
  284 | });
  285 | 
  286 | test("French: labels, names and number formatting", async ({ page }) => {
  287 |   await page.goto("/strategies/monthly-income");
  288 |   await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  289 |   await page.reload();
  290 |   await expect(page.getByRole("heading", { level: 1, name: "Fonds Nymbus Revenu Mensuel" })).toBeVisible();
  291 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="overview"]')).toHaveText("Aperçu");
  292 |   await expect(page.getByTestId("figures-soon")).toContainText("Les rendements de la série F seront bientôt publiés");
  293 |   await page.getByTestId("series-LDM001").click();
  294 |   await expect(page.getByTestId("basis")).toContainText("après déduction des frais");
  295 |   await expect(page.getByTestId("class-type")).toHaveText("Série à notice d’offre");
  296 |   // decimal comma and a no-break space before % / $
  297 |   await expect(page.getByTestId("badge-SI").locator(".fr-v")).toHaveText(/^[+−]?\d+,\d{2}\s%$/);
  298 |   await expect(page.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^\d+,\d{4}\s\$$/);
  299 |   await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="portfolio"]').click();
  300 |   await expect(page.getByTestId("portfolio-source")).toContainText("Données quotidiennes du portefeuille");
  301 |   await expect(page.getByTestId("portfolio-asof")).toHaveText("au 28 septembre 2026");
  302 |   await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="distributions"]').click();
  303 |   await expect(page.getByTestId("dist-class-LDM001").getByTestId("dist-last-amount")).toHaveText(/^0,\d{6}\s\$$/);
  304 |   await expect(page.getByTestId("provenance")).toContainText("données de portefeuille selon les positions quotidiennes au 28 septembre 2026");
  305 | });
  306 | 
  307 | /* ------------------------------------------------------------------ classes, variants, awards, calendar labels */
  308 | 
  309 | test("class selector: returns follow the class; F is the default; a class without its own series says coming soon", async ({ page }) => {
  310 |   await page.goto("/strategies/sustainable-enhanced-bonds");
  311 |   const card = page.getByTestId("nav-card");
  312 |   const strip = page.getByTestId("return-strip");
  313 |   await expect(card.getByTestId("series-LDM201")).toHaveAttribute("aria-checked", "true");
  314 |   await expect(page.getByTestId("basis")).toContainText("Series F");
  315 |   const f = await strip.getByTestId("badge-SI").locator(".fr-v").innerText();
  316 |   await card.getByTestId("series-LDM202").click();
  317 |   await expect(page.getByTestId("basis")).toContainText("Series H");
  318 |   const h = await strip.getByTestId("badge-SI").locator(".fr-v").innerText();
  319 |   expect(h, "class H shows its own returns").not.toBe(f);
  320 |   // a class that has no series of its own: no figure at all, never F's
  321 |   await card.getByTestId("series-LDM205").click();
  322 |   await expect(strip.getByTestId("figures-soon")).toContainText("series A coming soon");
  323 |   await expect(strip.getByTestId("badge-SI")).toHaveCount(0);
  324 |   await openTab(page, "performance");
  325 |   await expect(page.getByTestId("perf-soon")).toContainText("series A coming soon");
  326 |   await expect(page.getByTestId("growth")).toHaveCount(0);
  327 |   await expect(page.getByTestId("calendar")).toHaveCount(0);
  328 |   await expect(page.getByTestId("risk")).toHaveCount(0);
  329 |   // back to F: everything returns
  330 |   await card.getByTestId("series-LDM201").click();
  331 |   await expect(page.getByTestId("calendar")).toBeVisible();
  332 |   await expect(page.getByTestId("risk")).toBeVisible();
  333 | });
  334 | 
  335 | test("class types: only classes whose type is known are labelled, with a disclosure sentence", async ({ page }) => {
  336 |   await page.goto("/strategies/monthly-income");
  337 |   const card = page.getByTestId("nav-card");
  338 |   await expect(card.getByTestId("class-type")).toHaveText("Prospectus class");
  339 |   await expect(card.getByTestId("class-type-note")).toContainText("simplified prospectus");
  340 |   await card.getByTestId("series-LDM001").click();
  341 |   await expect(card.getByTestId("class-type")).toHaveText("Offering memorandum class");
  342 |   await expect(card.getByTestId("class-type-note")).toContainText("offering memorandum");
  343 |   await expect(page.getByTestId("returns-class-type")).toHaveText("Offering memorandum class");
  344 |   // unknown type: nothing is said
  345 |   await card.getByTestId("series-LDM021").click();
  346 |   await expect(card.getByTestId("class-type")).toHaveCount(0);
  347 |   await expect(card.getByTestId("class-type-note")).toHaveCount(0);
  348 |   // the class table: the badge on the two classes whose type is known, none elsewhere
  349 |   await expect(page.getByTestId("class-type-LDM081")).toHaveText("Prospectus class");
  350 |   await expect(page.getByTestId("class-type-LDM001")).toHaveText("Offering memorandum class");
  351 |   await expect(page.getByTestId("class-type-LDM021")).toHaveCount(0);
  352 |   // SEB: no class has a known type yet: no label, no column
  353 |   await page.goto("/strategies/sustainable-enhanced-bonds");
  354 |   await expect(page.getByTestId("class-type")).toHaveCount(0);
  355 |   await expect(page.getByTestId("classes-table").locator("thead")).not.toContainText("Offered under");
  356 | });
  357 | 
  358 | test("Global Minimum Volatility: 3 / 6 / 9 % variants, default 6, no class selector, no NAV, no distributions", async ({ page }) => {
  359 |   await page.goto("/strategies/global-minimum-volatility");
  360 |   const sel = page.getByTestId("variant-selector");
  361 |   await expect(sel.getByTestId("variant-6")).toHaveAttribute("aria-checked", "true");
  362 |   await expect(sel.locator('[role="radio"]')).toHaveCount(3);
  363 |   await expect(page.getByTestId("nav-card")).toHaveCount(0);
  364 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="distributions"]')).toHaveCount(0);
  365 |   const si = async () => page.getByTestId("return-strip").getByTestId("badge-SI").locator(".fr-v").innerText();
  366 |   const six = await si();
  367 |   await sel.getByTestId("variant-3").click();
  368 |   const three = await si();
  369 |   await sel.getByTestId("variant-9").click();
  370 |   const nine = await si();
  371 |   expect(new Set([six, three, nine]).size, "each variant has its own returns").toBe(3);
  372 |   await expect(page.getByTestId("basis")).toContainText("Target downside volatility 9%");
  373 |   await openTab(page, "performance");
  374 |   await expect(page.getByTestId("perf-context")).toContainText("9%");
  375 |   await sel.getByTestId("variant-6").click();
> 376 |   expect(await si()).toBe(six);
      |                      ^ Error: expect(received).toBe(expected) // Object.is equality
  377 | });
  378 | 
  379 | test("awards and rankings: Fund Library rank and quartile with source and as-at date; no Morningstar unless set", async ({ page }) => {
  380 |   await page.goto("/strategies/sustainable-enhanced-bonds#awards");
  381 |   const tab = page.locator('[role="tabpanel"][data-panel="awards"]');
  382 |   await expect(tab).toBeVisible();
  383 |   await expect(tab.getByTestId("ranking-LDM201")).toContainText("Canadian Fixed Income");
  384 |   await expect(tab.getByTestId("ranking-LDM201")).toContainText("August 31, 2026");
  385 |   await expect(tab.getByTestId("rank-1Y")).toContainText("1 of 465");
  386 |   await expect(tab.getByTestId("rank-1M")).toContainText("4 of 486");
  387 |   await expect(tab.getByTestId("fundgrade")).toContainText("A");
  388 |   await expect(tab.getByTestId("ranking-LDM201").getByRole("link", { name: /Fund Library/ })).toHaveAttribute("href", /^https:\/\/www\.fundlibrary\.com\//);
  389 |   await expect(tab.getByTestId("morningstar")).toHaveCount(0);
  390 |   await expect(tab.getByTestId("awards-note")).toContainText("not guarantees");
  391 |   // no third-party logo images: wordmarks are text
  392 |   await expect(tab.locator("img")).toHaveCount(0);
  393 |   // the CIFSC category line of the facts comes from the ranking category
  394 |   await openTab(page, "overview");
  395 |   await expect(page.getByTestId("fund-facts")).toContainText("Canadian Fixed Income");
  396 |   // multi-strategy: a quartile 4 is shown as it is
  397 |   await page.goto("/strategies/multi-strategy#awards");
  398 |   await expect(page.getByTestId("rank-1M")).toContainText("127 of 144");
  399 |   await expect(page.getByTestId("rank-1M").locator(".aw-q")).toHaveText("Q4");
  400 |   // GMV: no ranking, no tab
  401 |   await page.goto("/strategies/global-minimum-volatility");
  402 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="awards"]')).toHaveCount(0);
  403 | });
  404 | 
  405 | test("calendar-year chart: a value label on every bar, none overlapping, no horizontal page scroll", async ({ page }) => {
  406 |   await page.goto("/strategies/global-minimum-volatility#performance");
  407 |   const chart = page.getByTestId("calendar");
  408 |   await chart.scrollIntoViewIfNeeded();
  409 |   const cats = chart.locator("svg .cat");
  410 |   await expect(cats.first()).toBeVisible();
  411 |   const n = await cats.count();
  412 |   expect(n).toBeGreaterThan(8);
  413 |   const labels = chart.locator("svg text.vl");
  414 |   await expect(labels).toHaveCount(n);
  415 |   // each label sits above its bar (below a negative one) and the labels do not overlap each other
  416 |   const boxes = await labels.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, text: e.textContent }; }));
  417 |   for (const b of boxes) expect(b.text).toMatch(/^[+−-]?\d+\.\d%$/);
  418 |   const sorted = [...boxes].sort((a, b) => a.l - b.l);
  419 |   for (let i = 1; i < sorted.length; i++) expect(sorted[i].l, `labels ${sorted[i - 1].text} / ${sorted[i].text}`).toBeGreaterThanOrEqual(sorted[i - 1].r - 0.5);
  420 |   // the bars of the chart stay inside the card (it scrolls sideways when narrow), the page never does
  421 |   const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  422 |   expect(overflow).toBeLessThanOrEqual(1);
  423 |   // accessible: every category keeps its text alternative with the value
  424 |   await expect(cats.first()).toHaveAttribute("aria-label", /\d/);
  425 | });
  426 | 
```