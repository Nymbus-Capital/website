# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> awards and rankings: Fund Library rank and quartile with source and as-at date; no Morningstar unless set
- Location: e2e/fund.spec.ts:385:5

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('[role="tabpanel"][data-panel="awards"]').getByTestId('morningstar')
Expected: 0
Received: 1
Timeout:  10000ms

Call log:
  - Expect "toHaveCount" locator('[role="tabpanel"][data-panel="awards"]').getByTestId('morningstar') with timeout 10000ms
  - waiting for locator('[role="tabpanel"][data-panel="awards"]').getByTestId('morningstar')
    24 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
              - generic [ref=e36]: Sustainable Enhanced Bonds
        - generic [ref=e37]:
          - generic [ref=e38]:
            - paragraph [ref=e40]: Core fixed income
            - heading "Nymbus Sustainable Enhanced Bonds Fund" [level=1] [ref=e42]:
              - generic [aria-hidden] [ref=e43]:
                - generic [ref=e44]: Nymbus
                - generic [ref=e45]: Sustainable
                - generic [ref=e46]: Enhanced
                - generic [ref=e47]: Bonds
                - generic [ref=e48]: Fund
            - paragraph [ref=e50]: Canadian core bonds, managed systematically
            - paragraph [ref=e52]: A core Canadian bond portfolio built systematically, integrating sustainability criteria in bond selection, with a futures overlay designed to have low correlation with bonds and to offset part of bond losses; it may not do so and can lose money.
            - generic [ref=e53]:
              - generic [ref=e54]: Mutual fund
              - generic [ref=e56]:
                - generic [ref=e57]: Risk
                - text: Low
              - generic "Illustrative figures only, not actual performance" [ref=e64]: Sample data
            - generic [ref=e66]:
              - link "Contact us" [ref=e67] [cursor=pointer]:
                - /url: /contact
              - link "Fund documents" [ref=e70] [cursor=pointer]:
                - /url: "#documents"
          - generic [ref=e75]:
            - generic [ref=e76]:
              - generic [ref=e77]: Net asset value per unit
              - generic [ref=e78]: As of Sep 28, 2026
            - radiogroup "Choose a series" [ref=e81]:
              - radio "Series F" [checked] [ref=e82] [cursor=pointer]:
                - generic [ref=e83]: Series
                - text: F
              - radio "Series H" [ref=e84] [cursor=pointer]:
                - generic [ref=e85]: Series
                - text: H
              - radio "Series A" [ref=e86] [cursor=pointer]:
                - generic [ref=e87]: Series
                - text: A
              - radio "Series FP" [ref=e88] [cursor=pointer]:
                - generic [ref=e89]: Series
                - text: FP
            - generic [ref=e91]:
              - generic [ref=e92]: $9.5816
              - generic [aria-hidden] [ref=e93]:
                - generic [ref=e94]: $
                - generic [ref=e96]:
                  - generic [ref=e97]: "0"
                  - generic [ref=e98]: "1"
                  - generic [ref=e99]: "2"
                  - generic [ref=e100]: "3"
                  - generic [ref=e101]: "4"
                  - generic [ref=e102]: "5"
                  - generic [ref=e103]: "6"
                  - generic [ref=e104]: "7"
                  - generic [ref=e105]: "8"
                  - generic [ref=e106]: "9"
                - generic [ref=e107]: .
                - generic [ref=e109]:
                  - generic [ref=e110]: "0"
                  - generic [ref=e111]: "1"
                  - generic [ref=e112]: "2"
                  - generic [ref=e113]: "3"
                  - generic [ref=e114]: "4"
                  - generic [ref=e115]: "5"
                  - generic [ref=e116]: "6"
                  - generic [ref=e117]: "7"
                  - generic [ref=e118]: "8"
                  - generic [ref=e119]: "9"
                - generic [ref=e121]:
                  - generic [ref=e122]: "0"
                  - generic [ref=e123]: "1"
                  - generic [ref=e124]: "2"
                  - generic [ref=e125]: "3"
                  - generic [ref=e126]: "4"
                  - generic [ref=e127]: "5"
                  - generic [ref=e128]: "6"
                  - generic [ref=e129]: "7"
                  - generic [ref=e130]: "8"
                  - generic [ref=e131]: "9"
                - generic [ref=e133]:
                  - generic [ref=e134]: "0"
                  - generic [ref=e135]: "1"
                  - generic [ref=e136]: "2"
                  - generic [ref=e137]: "3"
                  - generic [ref=e138]: "4"
                  - generic [ref=e139]: "5"
                  - generic [ref=e140]: "6"
                  - generic [ref=e141]: "7"
                  - generic [ref=e142]: "8"
                  - generic [ref=e143]: "9"
                - generic [ref=e145]:
                  - generic [ref=e146]: "0"
                  - generic [ref=e147]: "1"
                  - generic [ref=e148]: "2"
                  - generic [ref=e149]: "3"
                  - generic [ref=e150]: "4"
                  - generic [ref=e151]: "5"
                  - generic [ref=e152]: "6"
                  - generic [ref=e153]: "7"
                  - generic [ref=e154]: "8"
                  - generic [ref=e155]: "9"
            - paragraph [ref=e156]:
              - generic [ref=e159]: −0.0083 (−0.09%)
              - generic [ref=e160]: vs previous valuation day
            - generic [ref=e161]:
              - generic [ref=e162]:
                - term [ref=e163]: Series
                - definition [ref=e164]: F
              - generic [ref=e165]:
                - term [ref=e166]: FundServ
                - definition [ref=e167]:
                  - code [ref=e168]: LDM201
              - generic [ref=e169]:
                - term [ref=e170]: Currency
                - definition [ref=e171]: CAD
              - generic [ref=e172]:
                - term [ref=e173]: Track record since
                - definition [ref=e174]: February 2019
              - generic [ref=e175]:
                - term [ref=e176]: Benchmark
                - definition [ref=e177]: FTSE Canada Universe Bond Index
      - region [ref=e178]:
        - generic [ref=e180]:
          - generic [ref=e181]:
            - heading "Returns" [level=2] [ref=e182]
            - paragraph [ref=e183]: Series F, net of fees · as of August 31, 2026
          - list [ref=e184]:
            - listitem [ref=e185]:
              - generic "1 month" [ref=e186]: 1M
              - generic [ref=e188]: −0.91%
            - listitem [ref=e189]:
              - generic "3 months" [ref=e190]: 3M
              - generic [ref=e192]: −0.47%
            - listitem [ref=e193]:
              - generic "Year to date" [ref=e194]: YTD
              - generic [ref=e196]: −3.77%
            - listitem [ref=e197]:
              - generic "1 year" [ref=e198]: 1Y
              - generic [ref=e200]: −2.62%
            - listitem [ref=e201]:
              - generic "3 years" [ref=e202]:
                - text: 3Y
                - superscript [aria-hidden] [ref=e204]: "*"
              - generic [ref=e205]: +2.24%
            - listitem [ref=e206]:
              - generic "5 years" [ref=e207]:
                - text: 5Y
                - superscript [aria-hidden] [ref=e209]: "*"
              - generic [ref=e210]: +1.69%
            - listitem [ref=e211]:
              - generic "Since inception" [ref=e212]:
                - text: SI
                - superscript [aria-hidden] [ref=e214]: "*"
              - generic [ref=e215]: +3.78%
          - paragraph [ref=e216]: "* Periods over one year are annualized."
      - generic [ref=e217]:
        - tablist "Fund information" [ref=e220]:
          - tab "Overview" [ref=e221] [cursor=pointer]
          - tab "Performance" [ref=e222] [cursor=pointer]
          - tab "Portfolio" [ref=e223] [cursor=pointer]
          - tab "Distributions" [ref=e224] [cursor=pointer]
          - tab "Awards and rankings" [selected] [ref=e225] [cursor=pointer]
          - tab "Documents" [ref=e226] [cursor=pointer]
        - text: FundServ Currency NAV per unit Daily change Valuation date FundServ Currency NAV per unit Daily change Valuation date FundServ Currency NAV per unit Daily change Valuation date
        - tabpanel "Awards and rankings" [ref=e227]:
          - heading "Awards and rankings" [level=2] [ref=e228]
          - generic [ref=e229]:
            - paragraph [ref=e230]: Independent rankings and ratings of the series listed, as at the date given.
            - generic [ref=e231]:
              - generic [ref=e232]:
                - heading "Series F (LDM201)" [level=3] [ref=e233]
                - generic [ref=e235]: Fund Library
              - paragraph [ref=e237]:
                - text: "Category:"
                - strong [ref=e238]: Canadian Fixed Income
                - text: · As at August 31, 2026
              - generic [ref=e239]:
                - generic [ref=e240]: FundGrade
                - generic "FundGrade rating A" [ref=e242]: A
              - table [ref=e244]:
                - caption [ref=e245]: Category rank and quartile by period
                - rowgroup [ref=e246]:
                  - row [ref=e247]:
                    - columnheader "Period" [ref=e248]
                    - columnheader "Rank in category" [ref=e249]
                    - columnheader "Quartile" [ref=e250]
                - rowgroup [ref=e251]:
                  - row [ref=e252]:
                    - cell "1 month" [ref=e253]
                    - cell [ref=e254]:
                      - strong [ref=e255]: "4"
                      - text: of 486
                    - cell "Quartile 1" [ref=e256]:
                      - generic "Quartile 1" [ref=e257]: Q1
                  - row [ref=e258]:
                    - cell "3 months" [ref=e259]
                    - cell [ref=e260]:
                      - strong [ref=e261]: "22"
                      - text: of 478
                    - cell "Quartile 1" [ref=e262]:
                      - generic "Quartile 1" [ref=e263]: Q1
                  - row [ref=e264]:
                    - cell "6 months" [ref=e265]
                    - cell [ref=e266]:
                      - strong [ref=e267]: "17"
                      - text: of 474
                    - cell "Quartile 1" [ref=e268]:
                      - generic "Quartile 1" [ref=e269]: Q1
                  - row [ref=e270]:
                    - cell "Year to date" [ref=e271]
                    - cell [ref=e272]:
                      - strong [ref=e273]: "1"
                      - text: of 470
                    - cell "Quartile 1" [ref=e274]:
                      - generic "Quartile 1" [ref=e275]: Q1
                  - row [ref=e276]:
                    - cell "1 year" [ref=e277]
                    - cell [ref=e278]:
                      - strong [ref=e279]: "1"
                      - text: of 465
                    - cell "Quartile 1" [ref=e280]:
                      - generic "Quartile 1" [ref=e281]: Q1
                  - row [ref=e282]:
                    - cell "2 years" [ref=e283]
                    - cell [ref=e284]:
                      - strong [ref=e285]: "3"
                      - text: of 442
                    - cell "Quartile 1" [ref=e286]:
                      - generic "Quartile 1" [ref=e287]: Q1
                  - row [ref=e288]:
                    - cell "3 years" [ref=e289]
                    - cell [ref=e290]:
                      - strong [ref=e291]: "1"
                      - text: of 408
                    - cell "Quartile 1" [ref=e292]:
                      - generic "Quartile 1" [ref=e293]: Q1
              - paragraph [ref=e294]:
                - text: "Source:"
                - link "Fund Library (opens in a new tab)" [ref=e295] [cursor=pointer]:
                  - /url: https://www.fundlibrary.com/MutualFunds/Detail/790334
                  - text: Fund Library
                  - generic [ref=e300]: (opens in a new tab)
            - generic [ref=e301]:
              - generic [ref=e302]:
                - heading "Morningstar rating" [level=3] [ref=e303]
                - generic [ref=e305]: Morningstar
              - paragraph [ref=e307]: As at October 1, 2026
              - paragraph [ref=e308]:
                - img "5 out of 5 stars" [ref=e309]
                - strong [ref=e320]: Series F
              - paragraph [ref=e321]:
                - text: "Source:"
                - link "Morningstar (opens in a new tab)" [ref=e322] [cursor=pointer]:
                  - /url: https://global.morningstar.com/en-ca/investments/funds/0P0001ROZG/quote
                  - text: Morningstar
                  - generic [ref=e327]: (opens in a new tab)
            - paragraph [ref=e328]: Rankings and ratings are provided by third parties, reproduced as at the date shown and not updated daily. Category rankings compare returns with those of the other funds in the same category over each period; the number of funds ranked varies by period. Past performance does not predict future results, and rankings and ratings are not guarantees. See the source for the methodology.
      - region [ref=e329]:
        - generic [ref=e330]:
          - generic [ref=e331]:
            - paragraph [ref=e333]: Sustainable Enhanced Bonds Fund
            - heading "Sustainability, integrated" [level=2] [ref=e335]:
              - generic [aria-hidden] [ref=e336]:
                - generic [ref=e337]: Sustainability,
                - generic [ref=e338]: integrated
            - generic [ref=e339]: Criteria at every step of bond selection. They do not apply to the futures overlay, which holds no securities of individual issuers.
          - generic [ref=e341]:
            - generic [ref=e342]:
              - heading "Exclusion screens" [level=3] [ref=e347]
              - paragraph [ref=e349]: Issuers in conflict with the fund’s criteria are excluded.
            - generic [ref=e350]:
              - heading "ESG in issuer selection" [level=3] [ref=e355]
              - paragraph [ref=e357]: ESG data weighed with credit and valuation, issuer by issuer.
            - generic [ref=e358]:
              - heading "Green bonds" [level=3] [ref=e363]
              - paragraph [ref=e365]: The fund can hold bonds financing environmental projects.
            - generic [ref=e366]:
              - heading "Measured every month" [level=3] [ref=e371]
              - paragraph [ref=e373]: Sustainability metrics such as carbon intensity, reported monthly for the portfolio and its index.
          - link "Our sustainability approach" [ref=e375] [cursor=pointer]:
            - /url: /sustainability
      - region [ref=e378]:
        - generic [ref=e380]:
          - generic [ref=e381]:
            - paragraph [ref=e382]: Important information
            - heading "Disclosures" [level=2] [ref=e384]
          - generic [ref=e385]:
            - paragraph [ref=e386]: The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.
            - paragraph [ref=e387]: "Performance shown: Series F, net of fees · Benchmark: FTSE Canada Universe Bond Index"
            - paragraph [ref=e388]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
            - paragraph [ref=e389]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
            - paragraph [ref=e390]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
            - paragraph [ref=e391]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
            - paragraph [ref=e392]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
            - paragraph [ref=e393]:
              - generic [ref=e395]: Updated daily from Nymbus’ data platform; portfolio data from the daily holdings as of September 28, 2026; sustainability metrics from the monthly factsheet of August 2026. performance as of August 2026 · net asset values as of Sep 28, 2026.
      - generic [ref=e398]:
        - heading "Interested in the fund?" [level=2] [ref=e399]:
          - generic [aria-hidden] [ref=e400]:
            - generic [ref=e401]: Interested
            - generic [ref=e402]: in
            - generic [ref=e403]: the
            - generic [ref=e404]: fund?
        - paragraph [ref=e406]: Our team can walk you through the fund, its series and how to invest.
        - generic [ref=e408]:
          - link "Contact our team" [ref=e409] [cursor=pointer]:
            - /url: /contact
          - link "All strategies" [ref=e412] [cursor=pointer]:
            - /url: /strategies
      - region [ref=e413]:
        - generic [ref=e414]:
          - generic [ref=e415]:
            - paragraph [ref=e417]: Explore
            - heading "Other strategies" [level=2] [ref=e419]:
              - generic [aria-hidden] [ref=e420]:
                - generic [ref=e421]: Other
                - generic [ref=e422]: strategies
          - generic [ref=e423]:
            - link "Short-term fixed income Monthly Income Monthly income from short-term corporate bonds View Nymbus Monthly Income Fund" [ref=e424] [cursor=pointer]:
              - /url: /strategies/monthly-income
              - generic [ref=e426]: Short-term fixed income
              - generic [ref=e427]: Monthly Income
              - generic [ref=e428]: Monthly income from short-term corporate bonds
              - generic [ref=e429]:
                - text: View
                - generic [ref=e430]: Nymbus Monthly Income Fund
            - link "Alternative strategies Multi-Strategy Four systematic strategies designed to have low correlation with one another View Nymbus Multi-Strategy Fund" [ref=e433] [cursor=pointer]:
              - /url: /strategies/multi-strategy
              - generic [ref=e435]: Alternative strategies
              - generic [ref=e436]: Multi-Strategy
              - generic [ref=e437]: Four systematic strategies designed to have low correlation with one another
              - generic [ref=e438]:
                - text: View
                - generic [ref=e439]: Nymbus Multi-Strategy Fund
            - link "Futures overlay (managed accounts) Global Minimum Volatility A futures overlay designed to have low correlation with bonds View Nymbus Global Minimum Volatility" [ref=e442] [cursor=pointer]:
              - /url: /strategies/global-minimum-volatility
              - generic [ref=e444]: Futures overlay (managed accounts)
              - generic [ref=e445]: Global Minimum Volatility
              - generic [ref=e446]: A futures overlay designed to have low correlation with bonds
              - generic [ref=e447]:
                - text: View
                - generic [ref=e448]: Nymbus Global Minimum Volatility
  - contentinfo [ref=e451]:
    - generic [ref=e452]:
      - generic [ref=e453]:
        - generic [ref=e454]:
          - link "Nymbus Capital, home" [ref=e455] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e456]
          - paragraph [ref=e465]: Montreal portfolio manager building systematic fixed income and alternative strategies.
          - generic [ref=e466]:
            - generic [ref=e467]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e468] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e469]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e470] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e471]:
          - heading "Strategies" [level=2] [ref=e472]
          - list [ref=e473]:
            - listitem [ref=e474]:
              - link "Monthly Income" [ref=e475] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e477]:
              - link "Sustainable Enhanced Bonds" [ref=e478] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e480]:
              - link "Multi-Strategy" [ref=e481] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e483]:
              - link "Global Minimum Volatility" [ref=e484] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e486]:
          - heading "Company" [level=2] [ref=e487]
          - list [ref=e488]:
            - listitem [ref=e489]:
              - link "About & team" [ref=e490] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e491]:
              - link "Approach" [ref=e492] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e493]:
              - link "Sustainability" [ref=e494] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e495]:
              - link "Solutions" [ref=e496] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e497]:
          - heading "Resources" [level=2] [ref=e498]
          - list [ref=e499]:
            - listitem [ref=e500]:
              - link "Contact" [ref=e501] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e502]:
              - link "Privacy policy" [ref=e503] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e504]:
              - link "Complaints & code of ethics" [ref=e505] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e506]:
              - link "LinkedIn" [ref=e507] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e511]:
        - paragraph [ref=e512]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
        - paragraph [ref=e513]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
        - paragraph [ref=e514]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
        - paragraph [ref=e515]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
        - paragraph [ref=e516]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
        - paragraph [ref=e517]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative.
        - paragraph [ref=e518]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
      - generic [ref=e519]:
        - generic [ref=e520]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e521]: PRI signatory
  - alert [ref=e522]
```

# Test source

```ts
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
  365 |   const read = async () => page.getByTestId("return-strip").getByTestId("badge-SI").locator(".fr-v").innerText();
  366 |   // the value counts up: wait until it is non-zero and stable
  367 |   const si = async () => {
  368 |     let last = "";
  369 |     await expect.poll(async () => { const v = await read(); const ok = v === last && !/^[+-]?0[.,]00/.test(v); last = v; return ok; }, { intervals: [300] }).toBe(true);
  370 |     return last;
  371 |   };
  372 |   const six = await si();
  373 |   await sel.getByTestId("variant-3").click();
  374 |   const three = await si();
  375 |   await sel.getByTestId("variant-9").click();
  376 |   const nine = await si();
  377 |   expect(new Set([six, three, nine]).size, "each variant has its own returns").toBe(3);
  378 |   await expect(page.getByTestId("basis")).toContainText("Target downside volatility 9%");
  379 |   await openTab(page, "performance");
  380 |   await expect(page.getByTestId("perf-context")).toContainText("9%");
  381 |   await sel.getByTestId("variant-6").click();
  382 |   expect(await si()).toBe(six);
  383 | });
  384 | 
  385 | test("awards and rankings: Fund Library rank and quartile with source and as-at date; no Morningstar unless set", async ({ page }) => {
  386 |   await page.goto("/strategies/sustainable-enhanced-bonds#awards");
  387 |   const tab = page.locator('[role="tabpanel"][data-panel="awards"]');
  388 |   await expect(tab).toBeVisible();
  389 |   await expect(tab.getByTestId("ranking-LDM201")).toContainText("Canadian Fixed Income");
  390 |   await expect(tab.getByTestId("ranking-LDM201")).toContainText("August 31, 2026");
  391 |   await expect(tab.getByTestId("rank-1Y")).toContainText("1 of 465");
  392 |   await expect(tab.getByTestId("rank-1M")).toContainText("4 of 486");
  393 |   await expect(tab.getByTestId("fundgrade")).toContainText("A");
  394 |   await expect(tab.getByTestId("ranking-LDM201").getByRole("link", { name: /Fund Library/ })).toHaveAttribute("href", /^https:\/\/www\.fundlibrary\.com\//);
> 395 |   await expect(tab.getByTestId("morningstar")).toHaveCount(0);
      |                                                ^ Error: expect(locator).toHaveCount(expected) failed
  396 |   await expect(tab.getByTestId("awards-note")).toContainText("not guarantees");
  397 |   // no third-party logo images: wordmarks are text
  398 |   await expect(tab.locator("img")).toHaveCount(0);
  399 |   // the CIFSC category line of the facts comes from the ranking category
  400 |   await openTab(page, "overview");
  401 |   await expect(page.getByTestId("fund-facts")).toContainText("Canadian Fixed Income");
  402 |   // multi-strategy: a quartile 4 is shown as it is
  403 |   await page.goto("/strategies/multi-strategy#awards");
  404 |   await expect(page.getByTestId("rank-1M")).toContainText("127 of 144");
  405 |   await expect(page.getByTestId("rank-1M").locator(".aw-q")).toHaveText("Q4");
  406 |   // GMV: no ranking, no tab
  407 |   await page.goto("/strategies/global-minimum-volatility");
  408 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="awards"]')).toHaveCount(0);
  409 | });
  410 | 
  411 | test("calendar-year chart: a value label on every bar, none overlapping, no horizontal page scroll", async ({ page }) => {
  412 |   await page.goto("/strategies/global-minimum-volatility#performance");
  413 |   const chart = page.getByTestId("calendar");
  414 |   await chart.scrollIntoViewIfNeeded();
  415 |   const cats = chart.locator("svg .cat");
  416 |   await expect(cats.first()).toBeVisible();
  417 |   const n = await cats.count();
  418 |   expect(n).toBeGreaterThan(8);
  419 |   const labels = chart.locator("svg text.vl");
  420 |   await expect(labels).toHaveCount(n);
  421 |   // each label sits above its bar (below a negative one) and the labels do not overlap each other
  422 |   const boxes = await labels.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, text: e.textContent }; }));
  423 |   for (const b of boxes) expect(b.text).toMatch(/^[+−-]?\d+\.\d%$/);
  424 |   const sorted = [...boxes].sort((a, b) => a.l - b.l);
  425 |   for (let i = 1; i < sorted.length; i++) expect(sorted[i].l, `labels ${sorted[i - 1].text} / ${sorted[i].text}`).toBeGreaterThanOrEqual(sorted[i - 1].r - 0.5);
  426 |   // the bars of the chart stay inside the card (it scrolls sideways when narrow), the page never does
  427 |   const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  428 |   expect(overflow).toBeLessThanOrEqual(1);
  429 |   // accessible: every category keeps its text alternative with the value
  430 |   await expect(cats.first()).toHaveAttribute("aria-label", /\d/);
  431 |   // roving tabindex: a single category in the tab order
  432 |   await expect(chart.locator('svg .cat[tabindex="0"]')).toHaveCount(1);
  433 | });
  434 | 
  435 | /**
  436 |  * Performance class label (Gabriel 2026-10-01: the label must match the class of the data). The expected label is
  437 |  * read from the class code of the sample's own data (`performance.classCode`), never assumed: the sample is built as
  438 |  * if the dataplatform served SEB class F (PR #626); the class H rendering (what production shows before that) is
  439 |  * covered by the admin test that pins SEB to a class H run (admin.spec.ts). The NAV card keeps the register's own
  440 |  * series (LDM201 = F), independent of the returns' class.
  441 |  */
  442 | const SAMPLE = JSON.parse(readFileSync("src/lib/data/sample-site-data.json", "utf8")) as { funds: Record<string, { performance: { classCode?: string; returnClass?: string } | null }> };
  443 | const CLASS_OF: Record<string, Record<string, string>> = {
  444 |   "monthly-income": { STRATEGY: "FP" },
  445 |   "sustainable-enhanced-bonds": { STRATEGY: "F", STRATEGY_H: "H" },
  446 |   "multi-strategy": { STRATEGY: "F" },
  447 | };
  448 | const codeOf = (slug: string): string => CLASS_OF[slug][SAMPLE.funds[slug].performance!.classCode!];
  449 | /** "Series F" but not "Series FP" (and the other way round) */
  450 | const seriesRe = (word: string, code: string): RegExp => new RegExp(`${word} ${code}(?![A-Za-z])`);
  451 | 
  452 | for (const slug of Object.keys(CLASS_OF)) {
  453 |   test(`performance class label follows the data's class everywhere (EN + FR): ${slug}`, async ({ page }) => {
  454 |     const perf = SAMPLE.funds[slug].performance!;
  455 |     const code = codeOf(slug);
  456 |     expect(code, `class ${perf.classCode} has a label`).toBeTruthy();
  457 |     expect(perf.returnClass).toBe(code);
  458 |     const others = Object.values(CLASS_OF[slug]).filter((c) => c !== code);
  459 |     for (const [lang, word, fund] of [["en", "Series", "Fund"], ["fr", "Série", "Fonds"]] as const) {
  460 |       await page.goto(`/strategies/${slug}`);
  461 |       if (lang === "fr") {
  462 |         await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  463 |         await page.reload();
  464 |       }
  465 |       // Monthly Income opens on class F (LDM081), which has no series yet: its returns are the FP class (LDM001)
  466 |       if (slug === "monthly-income") await page.getByTestId("nav-card").getByTestId("series-LDM001").click();
  467 |       const exact = seriesRe(word, code);
  468 |       // header return badges, overview returns, disclosures: this class, never another class of the fund
  469 |       for (const tid of ["basis", "overview-returns", "perf-class"]) {
  470 |         await expect(page.getByTestId(tid)).toContainText(exact);
  471 |         for (const o of others) await expect(page.getByTestId(tid)).not.toContainText(seriesRe(word, o));
  472 |       }
  473 |       // performance tab context line and growth chart legend
  474 |       await openTab(page, "performance");
  475 |       await expect(page.getByTestId("perf-context")).toContainText(exact);
  476 |       for (const o of others) await expect(page.getByTestId("perf-context")).not.toContainText(seriesRe(word, o));
  477 |       await page.getByTestId("growth").scrollIntoViewIfNeeded();
  478 |       await expect(page.getByTestId("growth").locator(".fx-legend").first()).toContainText(`${fund} (${word} ${code})`);
  479 |       if (slug === "sustainable-enhanced-bonds") {
  480 |         // the NAV card is the register's class LDM201 (F) whatever the class of the returns
  481 |         await openTab(page, "overview");
  482 |         await expect(page.getByTestId("nav-fundserv")).toHaveText("LDM201");
  483 |       }
  484 |     }
  485 |   });
  486 | }
  487 | 
  488 | test("home tiles and the strategies index name the class of the returns (EN + FR)", async ({ page }) => {
  489 |   // the French label has a no-break space before « : » (matched as \s)
  490 |   for (const [lang, returns] of [["en", "Returns: Series"], ["fr", "Rendements\\s:\\sSérie"]] as const) {
  491 |     const label = (code: string): RegExp => new RegExp(`^${returns} ${code}$`);
  492 |     for (const p of ["/", "/strategies"]) {
  493 |       await page.goto(p);
  494 |       if (lang === "fr") {
  495 |         await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
```