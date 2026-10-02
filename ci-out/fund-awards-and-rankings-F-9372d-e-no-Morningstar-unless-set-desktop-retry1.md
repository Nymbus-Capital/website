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
      - navigation "Primary" [ref=e15]:
        - list [ref=e16]:
          - listitem [ref=e17]:
            - link "Strategies" [ref=e18] [cursor=pointer]:
              - /url: /strategies
          - listitem [ref=e21]:
            - link "Approach" [ref=e22] [cursor=pointer]:
              - /url: /approach
          - listitem [ref=e23]:
            - link "About" [ref=e24] [cursor=pointer]:
              - /url: /team
          - listitem [ref=e25]:
            - link "Solutions" [ref=e26] [cursor=pointer]:
              - /url: /solutions
          - listitem [ref=e27]:
            - link "Sustainability" [ref=e28] [cursor=pointer]:
              - /url: /sustainability
          - listitem [ref=e29]:
            - link "Contact" [ref=e30] [cursor=pointer]:
              - /url: /contact
      - button "Afficher le site en français" [ref=e32] [cursor=pointer]:
        - generic [aria-hidden] [ref=e33]: en
        - generic [aria-hidden] [ref=e34]: fr
  - main [ref=e35]:
    - generic [ref=e36]:
      - generic [aria-hidden]: Sample data
      - generic [ref=e38]:
        - navigation "Breadcrumb" [ref=e39]:
          - list [ref=e40]:
            - listitem [ref=e41]:
              - link "Home" [ref=e42] [cursor=pointer]:
                - /url: /
            - listitem [ref=e45]:
              - link "Strategies" [ref=e46] [cursor=pointer]:
                - /url: /strategies
            - listitem [ref=e49]:
              - generic [ref=e50]: Sustainable Enhanced Bonds
        - generic [ref=e51]:
          - generic [ref=e52]:
            - paragraph [ref=e54]: Core fixed income
            - heading "Nymbus Sustainable Enhanced Bonds Fund" [level=1] [ref=e56]:
              - generic [aria-hidden] [ref=e57]:
                - generic [ref=e58]: Nymbus
                - generic [ref=e59]: Sustainable
                - generic [ref=e60]: Enhanced
                - generic [ref=e61]: Bonds
                - generic [ref=e62]: Fund
            - paragraph [ref=e64]: Canadian core bonds, managed systematically
            - paragraph [ref=e66]: A core Canadian bond portfolio built systematically, integrating sustainability criteria in bond selection, with a futures overlay designed to have low correlation with bonds and to offset part of bond losses; it may not do so and can lose money.
            - generic [ref=e67]:
              - generic [ref=e68]: Mutual fund
              - generic [ref=e70]:
                - generic [ref=e71]: Risk
                - text: Low
              - generic "Illustrative figures only, not actual performance" [ref=e78]: Sample data
            - generic [ref=e80]:
              - link "Contact us" [ref=e81] [cursor=pointer]:
                - /url: /contact
              - link "Fund documents" [ref=e84] [cursor=pointer]:
                - /url: "#documents"
          - generic [ref=e89]:
            - generic [ref=e90]:
              - generic [ref=e91]: Net asset value per unit
              - generic [ref=e92]: As of Sep 28, 2026
            - radiogroup "Choose a series" [ref=e95]:
              - radio "Series F" [checked] [ref=e96] [cursor=pointer]:
                - generic [ref=e97]: Series
                - text: F
              - radio "Series H" [ref=e98] [cursor=pointer]:
                - generic [ref=e99]: Series
                - text: H
              - radio "Series A" [ref=e100] [cursor=pointer]:
                - generic [ref=e101]: Series
                - text: A
              - radio "Series FP" [ref=e102] [cursor=pointer]:
                - generic [ref=e103]: Series
                - text: FP
            - generic [ref=e105]:
              - generic [ref=e106]: $9.5816
              - generic [aria-hidden] [ref=e107]:
                - generic [ref=e108]: $
                - generic [ref=e110]:
                  - generic [ref=e111]: "0"
                  - generic [ref=e112]: "1"
                  - generic [ref=e113]: "2"
                  - generic [ref=e114]: "3"
                  - generic [ref=e115]: "4"
                  - generic [ref=e116]: "5"
                  - generic [ref=e117]: "6"
                  - generic [ref=e118]: "7"
                  - generic [ref=e119]: "8"
                  - generic [ref=e120]: "9"
                - generic [ref=e121]: .
                - generic [ref=e123]:
                  - generic [ref=e124]: "0"
                  - generic [ref=e125]: "1"
                  - generic [ref=e126]: "2"
                  - generic [ref=e127]: "3"
                  - generic [ref=e128]: "4"
                  - generic [ref=e129]: "5"
                  - generic [ref=e130]: "6"
                  - generic [ref=e131]: "7"
                  - generic [ref=e132]: "8"
                  - generic [ref=e133]: "9"
                - generic [ref=e135]:
                  - generic [ref=e136]: "0"
                  - generic [ref=e137]: "1"
                  - generic [ref=e138]: "2"
                  - generic [ref=e139]: "3"
                  - generic [ref=e140]: "4"
                  - generic [ref=e141]: "5"
                  - generic [ref=e142]: "6"
                  - generic [ref=e143]: "7"
                  - generic [ref=e144]: "8"
                  - generic [ref=e145]: "9"
                - generic [ref=e147]:
                  - generic [ref=e148]: "0"
                  - generic [ref=e149]: "1"
                  - generic [ref=e150]: "2"
                  - generic [ref=e151]: "3"
                  - generic [ref=e152]: "4"
                  - generic [ref=e153]: "5"
                  - generic [ref=e154]: "6"
                  - generic [ref=e155]: "7"
                  - generic [ref=e156]: "8"
                  - generic [ref=e157]: "9"
                - generic [ref=e159]:
                  - generic [ref=e160]: "0"
                  - generic [ref=e161]: "1"
                  - generic [ref=e162]: "2"
                  - generic [ref=e163]: "3"
                  - generic [ref=e164]: "4"
                  - generic [ref=e165]: "5"
                  - generic [ref=e166]: "6"
                  - generic [ref=e167]: "7"
                  - generic [ref=e168]: "8"
                  - generic [ref=e169]: "9"
            - paragraph [ref=e170]:
              - generic [ref=e173]: −0.0083 (−0.09%)
              - generic [ref=e174]: vs previous valuation day
            - generic [ref=e175]:
              - generic [ref=e176]:
                - term [ref=e177]: Series
                - definition [ref=e178]: F
              - generic [ref=e179]:
                - term [ref=e180]: FundServ
                - definition [ref=e181]:
                  - code [ref=e182]: LDM201
              - generic [ref=e183]:
                - term [ref=e184]: Currency
                - definition [ref=e185]: CAD
              - generic [ref=e186]:
                - term [ref=e187]: Track record since
                - definition [ref=e188]: February 2019
              - generic [ref=e189]:
                - term [ref=e190]: Benchmark
                - definition [ref=e191]: FTSE Canada Universe Bond Index
      - region [ref=e192]:
        - generic [ref=e194]:
          - generic [ref=e195]:
            - heading "Returns" [level=2] [ref=e196]
            - paragraph [ref=e197]: Series F, net of fees · as of August 31, 2026
          - list [ref=e198]:
            - listitem [ref=e199]:
              - generic "1 month" [ref=e200]: 1M
              - generic [ref=e202]: −0.91%
            - listitem [ref=e203]:
              - generic "3 months" [ref=e204]: 3M
              - generic [ref=e206]: −0.47%
            - listitem [ref=e207]:
              - generic "Year to date" [ref=e208]: YTD
              - generic [ref=e210]: −3.77%
            - listitem [ref=e211]:
              - generic "1 year" [ref=e212]: 1Y
              - generic [ref=e214]: −2.62%
            - listitem [ref=e215]:
              - generic "3 years" [ref=e216]:
                - text: 3Y
                - superscript [aria-hidden] [ref=e218]: "*"
              - generic [ref=e219]: +2.24%
            - listitem [ref=e220]:
              - generic "5 years" [ref=e221]:
                - text: 5Y
                - superscript [aria-hidden] [ref=e223]: "*"
              - generic [ref=e224]: +1.69%
            - listitem [ref=e225]:
              - generic "Since inception" [ref=e226]:
                - text: SI
                - superscript [aria-hidden] [ref=e228]: "*"
              - generic [ref=e229]: +3.78%
          - paragraph [ref=e230]: "* Periods over one year are annualized."
      - generic [ref=e231]:
        - tablist "Fund information" [ref=e234]:
          - tab "Overview" [ref=e235] [cursor=pointer]
          - tab "Performance" [ref=e236] [cursor=pointer]
          - tab "Portfolio" [ref=e237] [cursor=pointer]
          - tab "Distributions" [ref=e238] [cursor=pointer]
          - tab "Awards and rankings" [selected] [ref=e239] [cursor=pointer]
          - tab "Documents" [ref=e240] [cursor=pointer]
        - tabpanel "Awards and rankings" [ref=e241]:
          - heading "Awards and rankings" [level=2] [ref=e242]
          - generic [ref=e243]:
            - paragraph [ref=e244]: Independent rankings and ratings of the series listed, as at the date given.
            - generic [ref=e245]:
              - generic [ref=e246]:
                - heading "Series F (LDM201)" [level=3] [ref=e247]
                - generic [ref=e249]: Fund Library
              - paragraph [ref=e251]:
                - text: "Category:"
                - strong [ref=e252]: Canadian Fixed Income
                - text: · As at August 31, 2026
              - generic [ref=e253]:
                - generic [ref=e254]: FundGrade
                - generic "FundGrade rating A" [ref=e256]: A
              - table [ref=e258]:
                - caption [ref=e259]: Category rank and quartile by period
                - rowgroup [ref=e260]:
                  - row [ref=e261]:
                    - columnheader "Period" [ref=e262]
                    - columnheader "Rank in category" [ref=e263]
                    - columnheader "Quartile" [ref=e264]
                - rowgroup [ref=e265]:
                  - row [ref=e266]:
                    - cell "1 month" [ref=e267]
                    - cell [ref=e268]:
                      - strong [ref=e269]: "4"
                      - text: of 486
                    - cell "Quartile 1" [ref=e270]:
                      - generic "Quartile 1" [ref=e271]: Q1
                  - row [ref=e272]:
                    - cell "3 months" [ref=e273]
                    - cell [ref=e274]:
                      - strong [ref=e275]: "22"
                      - text: of 478
                    - cell "Quartile 1" [ref=e276]:
                      - generic "Quartile 1" [ref=e277]: Q1
                  - row [ref=e278]:
                    - cell "6 months" [ref=e279]
                    - cell [ref=e280]:
                      - strong [ref=e281]: "17"
                      - text: of 474
                    - cell "Quartile 1" [ref=e282]:
                      - generic "Quartile 1" [ref=e283]: Q1
                  - row [ref=e284]:
                    - cell "Year to date" [ref=e285]
                    - cell [ref=e286]:
                      - strong [ref=e287]: "1"
                      - text: of 470
                    - cell "Quartile 1" [ref=e288]:
                      - generic "Quartile 1" [ref=e289]: Q1
                  - row [ref=e290]:
                    - cell "1 year" [ref=e291]
                    - cell [ref=e292]:
                      - strong [ref=e293]: "1"
                      - text: of 465
                    - cell "Quartile 1" [ref=e294]:
                      - generic "Quartile 1" [ref=e295]: Q1
                  - row [ref=e296]:
                    - cell "2 years" [ref=e297]
                    - cell [ref=e298]:
                      - strong [ref=e299]: "3"
                      - text: of 442
                    - cell "Quartile 1" [ref=e300]:
                      - generic "Quartile 1" [ref=e301]: Q1
                  - row [ref=e302]:
                    - cell "3 years" [ref=e303]
                    - cell [ref=e304]:
                      - strong [ref=e305]: "1"
                      - text: of 408
                    - cell "Quartile 1" [ref=e306]:
                      - generic "Quartile 1" [ref=e307]: Q1
              - paragraph [ref=e308]:
                - text: "Source:"
                - link "Fund Library (opens in a new tab)" [ref=e309] [cursor=pointer]:
                  - /url: https://www.fundlibrary.com/MutualFunds/Detail/790334
                  - text: Fund Library
                  - generic [ref=e314]: (opens in a new tab)
            - generic [ref=e315]:
              - generic [ref=e316]:
                - heading "Morningstar rating" [level=3] [ref=e317]
                - generic [ref=e319]: Morningstar
              - paragraph [ref=e321]: As at October 1, 2026
              - paragraph [ref=e322]:
                - img "5 out of 5 stars" [ref=e323]
                - strong [ref=e334]: Series F
              - paragraph [ref=e335]:
                - text: "Source:"
                - link "Morningstar (opens in a new tab)" [ref=e336] [cursor=pointer]:
                  - /url: https://global.morningstar.com/en-ca/investments/funds/0P0001ROZG/quote
                  - text: Morningstar
                  - generic [ref=e341]: (opens in a new tab)
            - paragraph [ref=e342]: Rankings and ratings are provided by third parties, reproduced as at the date shown and not updated daily. Category rankings compare returns with those of the other funds in the same category over each period; the number of funds ranked varies by period. Past performance does not predict future results, and rankings and ratings are not guarantees. See the source for the methodology.
      - region [ref=e343]:
        - generic [ref=e344]:
          - generic [ref=e345]:
            - paragraph [ref=e347]: Sustainable Enhanced Bonds Fund
            - heading "Sustainability, integrated" [level=2] [ref=e349]:
              - generic [aria-hidden] [ref=e350]:
                - generic [ref=e351]: Sustainability,
                - generic [ref=e352]: integrated
            - generic [ref=e353]: Criteria at every step of bond selection. They do not apply to the futures overlay, which holds no securities of individual issuers.
          - generic [ref=e355]:
            - generic [ref=e356]:
              - heading "Exclusion screens" [level=3] [ref=e361]
              - paragraph [ref=e363]: Issuers in conflict with the fund’s criteria are excluded.
            - generic [ref=e364]:
              - heading "ESG in issuer selection" [level=3] [ref=e369]
              - paragraph [ref=e371]: ESG data weighed with credit and valuation, issuer by issuer.
            - generic [ref=e372]:
              - heading "Green bonds" [level=3] [ref=e377]
              - paragraph [ref=e379]: The fund can hold bonds financing environmental projects.
            - generic [ref=e380]:
              - heading "Measured every month" [level=3] [ref=e385]
              - paragraph [ref=e387]: Sustainability metrics such as carbon intensity, reported monthly for the portfolio and its index.
          - link "Our sustainability approach" [ref=e389] [cursor=pointer]:
            - /url: /sustainability
      - region [ref=e392]:
        - generic [ref=e394]:
          - generic [ref=e395]:
            - paragraph [ref=e396]: Important information
            - heading "Disclosures" [level=2] [ref=e398]
          - generic [ref=e399]:
            - paragraph [ref=e400]: The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.
            - paragraph [ref=e401]: "Performance shown: Series F, net of fees · Benchmark: FTSE Canada Universe Bond Index"
            - paragraph [ref=e402]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
            - paragraph [ref=e403]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
            - paragraph [ref=e404]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
            - paragraph [ref=e405]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
            - paragraph [ref=e406]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
            - paragraph [ref=e407]:
              - generic [ref=e409]: Updated daily from Nymbus’ data platform; portfolio data from the daily holdings as of September 28, 2026; sustainability metrics from the monthly factsheet of August 2026. performance as of August 2026 · net asset values as of Sep 28, 2026.
      - generic [ref=e412]:
        - heading "Interested in the fund?" [level=2] [ref=e413]:
          - generic [aria-hidden] [ref=e414]:
            - generic [ref=e415]: Interested
            - generic [ref=e416]: in
            - generic [ref=e417]: the
            - generic [ref=e418]: fund?
        - paragraph [ref=e420]: Our team can walk you through the fund, its series and how to invest.
        - generic [ref=e422]:
          - link "Contact our team" [ref=e423] [cursor=pointer]:
            - /url: /contact
          - link "All strategies" [ref=e426] [cursor=pointer]:
            - /url: /strategies
      - region [ref=e427]:
        - generic [ref=e428]:
          - generic [ref=e429]:
            - paragraph [ref=e431]: Explore
            - heading "Other strategies" [level=2] [ref=e433]:
              - generic [aria-hidden] [ref=e434]:
                - generic [ref=e435]: Other
                - generic [ref=e436]: strategies
          - generic [ref=e437]:
            - link "Short-term fixed income Monthly Income Monthly income from short-term corporate bonds View Nymbus Monthly Income Fund" [ref=e438] [cursor=pointer]:
              - /url: /strategies/monthly-income
              - generic [ref=e440]: Short-term fixed income
              - generic [ref=e441]: Monthly Income
              - generic [ref=e442]: Monthly income from short-term corporate bonds
              - generic [ref=e443]:
                - text: View
                - generic [ref=e444]: Nymbus Monthly Income Fund
            - link "Alternative strategies Multi-Strategy Four systematic strategies designed to have low correlation with one another View Nymbus Multi-Strategy Fund" [ref=e447] [cursor=pointer]:
              - /url: /strategies/multi-strategy
              - generic [ref=e449]: Alternative strategies
              - generic [ref=e450]: Multi-Strategy
              - generic [ref=e451]: Four systematic strategies designed to have low correlation with one another
              - generic [ref=e452]:
                - text: View
                - generic [ref=e453]: Nymbus Multi-Strategy Fund
            - link "Futures overlay (managed accounts) Global Minimum Volatility A futures overlay designed to have low correlation with bonds View Nymbus Global Minimum Volatility" [ref=e456] [cursor=pointer]:
              - /url: /strategies/global-minimum-volatility
              - generic [ref=e458]: Futures overlay (managed accounts)
              - generic [ref=e459]: Global Minimum Volatility
              - generic [ref=e460]: A futures overlay designed to have low correlation with bonds
              - generic [ref=e461]:
                - text: View
                - generic [ref=e462]: Nymbus Global Minimum Volatility
  - contentinfo [ref=e465]:
    - generic [ref=e466]:
      - generic [ref=e467]:
        - generic [ref=e468]:
          - link "Nymbus Capital, home" [ref=e469] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e470]
          - paragraph [ref=e479]: Montreal portfolio manager building systematic fixed income and alternative strategies.
          - generic [ref=e480]:
            - generic [ref=e481]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e482] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e483]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e484] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e485]:
          - heading "Strategies" [level=2] [ref=e486]
          - list [ref=e487]:
            - listitem [ref=e488]:
              - link "Monthly Income" [ref=e489] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e491]:
              - link "Sustainable Enhanced Bonds" [ref=e492] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e494]:
              - link "Multi-Strategy" [ref=e495] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e497]:
              - link "Global Minimum Volatility" [ref=e498] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e500]:
          - heading "Company" [level=2] [ref=e501]
          - list [ref=e502]:
            - listitem [ref=e503]:
              - link "About & team" [ref=e504] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e505]:
              - link "Approach" [ref=e506] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e507]:
              - link "Sustainability" [ref=e508] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e509]:
              - link "Solutions" [ref=e510] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e511]:
          - heading "Resources" [level=2] [ref=e512]
          - list [ref=e513]:
            - listitem [ref=e514]:
              - link "Contact" [ref=e515] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e516]:
              - link "Privacy policy" [ref=e517] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e518]:
              - link "Complaints & code of ethics" [ref=e519] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e520]:
              - link "LinkedIn" [ref=e521] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e525]:
        - paragraph [ref=e526]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
        - paragraph [ref=e527]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
        - paragraph [ref=e528]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
        - paragraph [ref=e529]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
        - paragraph [ref=e530]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
        - paragraph [ref=e531]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative.
        - paragraph [ref=e532]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
      - generic [ref=e533]:
        - generic [ref=e534]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e535]: PRI signatory
  - alert [ref=e536]
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