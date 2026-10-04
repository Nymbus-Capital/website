# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site-v5.spec.ts >> fund awards: Morningstar → Fundata → RBC, official logos sized like Morningstar's, no 'Fund Library' label
- Location: e2e/site-v5.spec.ts:49:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

  Array [
    "awards-morningstar",
    "ranking-LDM201",
-   "tp-rbc-pfs",
+   "ranking-table",
  ]
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
            - link "Critical concepts" [ref=e24] [cursor=pointer]:
              - /url: /critical-concepts
          - listitem [ref=e25]:
            - link "About" [ref=e26] [cursor=pointer]:
              - /url: /team
          - listitem [ref=e27]:
            - link "Solutions" [ref=e28] [cursor=pointer]:
              - /url: /solutions
          - listitem [ref=e29]:
            - link "Sustainability" [ref=e30] [cursor=pointer]:
              - /url: /sustainability
          - listitem [ref=e31]:
            - link "Contact" [ref=e32] [cursor=pointer]:
              - /url: /contact
      - button "Afficher le site en français" [ref=e34] [cursor=pointer]:
        - generic [aria-hidden] [ref=e35]: en
        - generic [aria-hidden] [ref=e36]: fr
  - main [ref=e37]:
    - generic [ref=e38]:
      - generic [aria-hidden]: Sample data
      - generic [ref=e40]:
        - navigation "Breadcrumb" [ref=e41]:
          - list [ref=e42]:
            - listitem [ref=e43]:
              - link "Home" [ref=e44] [cursor=pointer]:
                - /url: /
            - listitem [ref=e47]:
              - link "Strategies" [ref=e48] [cursor=pointer]:
                - /url: /strategies
            - listitem [ref=e51]:
              - generic [ref=e52]: Sustainable Enhanced Bonds
        - generic [ref=e53]:
          - generic [ref=e54]:
            - paragraph [ref=e56]: Core fixed income
            - heading "Nymbus Sustainable Enhanced Bonds Fund" [level=1] [ref=e58]:
              - generic [aria-hidden] [ref=e59]:
                - generic [ref=e60]: Nymbus
                - generic [ref=e61]: Sustainable
                - generic [ref=e62]: Enhanced
                - generic [ref=e63]: Bonds
                - generic [ref=e64]: Fund
            - paragraph [ref=e66]: Canadian core bonds, managed systematically
            - paragraph [ref=e68]: A core Canadian bond portfolio built systematically, integrating sustainability criteria in bond selection, with a protective futures overlay designed to have low correlation with bonds in down months and to offset part of bond losses; it may not do so and can lose money.
            - generic [ref=e69]:
              - generic [ref=e70]: Mutual fund
              - generic [ref=e72]:
                - generic [ref=e73]: Risk
                - text: Low
              - generic "Illustrative figures only, not actual performance" [ref=e80]: Sample data
            - generic [ref=e82]:
              - link "Contact us" [ref=e83] [cursor=pointer]:
                - /url: /contact
              - link "Fund documents" [ref=e86] [cursor=pointer]:
                - /url: "#documents"
          - generic [ref=e91]:
            - generic [ref=e92]:
              - generic [ref=e93]: Net asset value per unit
              - generic [ref=e94]: As of Sep 28, 2026
            - radiogroup "Choose a series" [ref=e97]:
              - radio "Series F" [checked] [ref=e98] [cursor=pointer]:
                - generic [ref=e99]: Series
                - text: F
              - radio "Series H" [ref=e100] [cursor=pointer]:
                - generic [ref=e101]: Series
                - text: H
              - radio "Series A" [ref=e102] [cursor=pointer]:
                - generic [ref=e103]: Series
                - text: A
              - radio "Series FP" [ref=e104] [cursor=pointer]:
                - generic [ref=e105]: Series
                - text: FP
            - generic [ref=e107]:
              - generic [ref=e108]: $9.5816
              - generic [aria-hidden] [ref=e109]:
                - generic [ref=e110]: $
                - generic [ref=e112]:
                  - generic [ref=e113]: "0"
                  - generic [ref=e114]: "1"
                  - generic [ref=e115]: "2"
                  - generic [ref=e116]: "3"
                  - generic [ref=e117]: "4"
                  - generic [ref=e118]: "5"
                  - generic [ref=e119]: "6"
                  - generic [ref=e120]: "7"
                  - generic [ref=e121]: "8"
                  - generic [ref=e122]: "9"
                - generic [ref=e123]: .
                - generic [ref=e125]:
                  - generic [ref=e126]: "0"
                  - generic [ref=e127]: "1"
                  - generic [ref=e128]: "2"
                  - generic [ref=e129]: "3"
                  - generic [ref=e130]: "4"
                  - generic [ref=e131]: "5"
                  - generic [ref=e132]: "6"
                  - generic [ref=e133]: "7"
                  - generic [ref=e134]: "8"
                  - generic [ref=e135]: "9"
                - generic [ref=e137]:
                  - generic [ref=e138]: "0"
                  - generic [ref=e139]: "1"
                  - generic [ref=e140]: "2"
                  - generic [ref=e141]: "3"
                  - generic [ref=e142]: "4"
                  - generic [ref=e143]: "5"
                  - generic [ref=e144]: "6"
                  - generic [ref=e145]: "7"
                  - generic [ref=e146]: "8"
                  - generic [ref=e147]: "9"
                - generic [ref=e149]:
                  - generic [ref=e150]: "0"
                  - generic [ref=e151]: "1"
                  - generic [ref=e152]: "2"
                  - generic [ref=e153]: "3"
                  - generic [ref=e154]: "4"
                  - generic [ref=e155]: "5"
                  - generic [ref=e156]: "6"
                  - generic [ref=e157]: "7"
                  - generic [ref=e158]: "8"
                  - generic [ref=e159]: "9"
                - generic [ref=e161]:
                  - generic [ref=e162]: "0"
                  - generic [ref=e163]: "1"
                  - generic [ref=e164]: "2"
                  - generic [ref=e165]: "3"
                  - generic [ref=e166]: "4"
                  - generic [ref=e167]: "5"
                  - generic [ref=e168]: "6"
                  - generic [ref=e169]: "7"
                  - generic [ref=e170]: "8"
                  - generic [ref=e171]: "9"
            - paragraph [ref=e172]:
              - generic [ref=e175]: −0.0083 (−0.09%)
              - generic [ref=e176]: vs previous valuation day
            - generic [ref=e177]:
              - generic [ref=e178]:
                - term [ref=e179]: Series
                - definition [ref=e180]: F
              - generic [ref=e181]:
                - term [ref=e182]: Fundserv
                - definition [ref=e183]:
                  - code [ref=e184]: LDM201
              - generic [ref=e185]:
                - term [ref=e186]: Currency
                - definition [ref=e187]: CAD
              - generic [ref=e188]:
                - term [ref=e189]: Track record since
                - definition [ref=e190]: August 2023
              - generic [ref=e191]:
                - term [ref=e192]: Benchmark
                - definition [ref=e193]: FTSE Canada Universe Bond Index
      - region [ref=e194]:
        - generic [ref=e196]:
          - generic [ref=e197]:
            - heading "Returns" [level=2] [ref=e198]
            - paragraph [ref=e199]: Series F, net of fees · as of August 31, 2026
          - list [ref=e200]:
            - listitem [ref=e201]:
              - generic "1 month" [ref=e202]: 1M
              - generic [ref=e204]: −0.78%
            - listitem [ref=e205]:
              - generic "3 months" [ref=e206]: 3M
              - generic [ref=e208]: −0.40%
            - listitem [ref=e209]:
              - generic "Year to date" [ref=e210]: YTD
              - generic [ref=e212]: −3.25%
            - listitem [ref=e213]:
              - generic "1 year" [ref=e214]: 1Y
              - generic [ref=e216]: −2.26%
            - listitem [ref=e217]:
              - generic "3 years" [ref=e218]:
                - text: 3Y
                - superscript [aria-hidden] [ref=e220]: "*"
              - generic [ref=e221]: +1.93%
            - listitem [ref=e222]:
              - generic "Since inception" [ref=e223]:
                - text: SI
                - superscript [aria-hidden] [ref=e225]: "*"
              - generic [ref=e226]: +2.31%
          - paragraph [ref=e227]: "* Periods over one year are annualized."
      - generic [ref=e228]:
        - tablist "Fund information" [ref=e231]:
          - tab "Overview" [ref=e232] [cursor=pointer]
          - tab "Performance" [ref=e233] [cursor=pointer]
          - tab "Portfolio" [ref=e234] [cursor=pointer]
          - tab "Distributions" [ref=e235] [cursor=pointer]
          - tab "Awards and rankings" [selected] [ref=e236] [cursor=pointer]
          - tab "Documents" [ref=e237] [cursor=pointer]
        - tabpanel "Awards and rankings" [ref=e238]:
          - heading "Awards and rankings" [level=2] [ref=e239]
          - generic [ref=e240]:
            - paragraph [ref=e241]: Independent rankings and ratings of the series listed, as at the date given.
            - generic [ref=e242]:
              - heading "Morningstar rating" [level=3] [ref=e244]
              - region "Morningstar Rating™" [ref=e246]:
                - generic [ref=e247]:
                  - img "Morningstar" [ref=e248]
                  - 'img "Morningstar Rating™: 5 stars" [ref=e249]'
                  - paragraph [ref=e250]: "Morningstar Rating™: 5 stars"
                - paragraph [ref=e251]: Series F, as of October 1, 2026
                - generic [ref=e252]:
                  - 'link "Source: Morningstar (opens in a new tab)" [ref=e253] [cursor=pointer]':
                    - /url: https://global.morningstar.com/en-ca/investments/funds/0P0001ROZG/quote
                    - text: "Source: Morningstar"
                    - generic [ref=e258]: (opens in a new tab)
                  - button "Rating methodology and attribution" [ref=e260] [cursor=pointer]
            - generic [ref=e264]:
              - generic [ref=e265]:
                - heading "Series F (LDM201)" [level=3] [ref=e266]
                - img "Fundata" [ref=e269]
              - paragraph [ref=e270]:
                - text: "Category:"
                - strong [ref=e271]: Canadian Fixed Income
                - text: · As at August 31, 2026
              - generic [ref=e272]:
                - generic [ref=e273]: FundGrade
                - generic "FundGrade rating A" [ref=e275]: A
              - table [ref=e277]:
                - caption [ref=e278]: Category rank and quartile by period
                - rowgroup [ref=e279]:
                  - row [ref=e280]:
                    - columnheader "Period" [ref=e281]
                    - columnheader "Rank in category" [ref=e282]
                    - columnheader "Quartile" [ref=e283]
                - rowgroup [ref=e284]:
                  - row [ref=e285]:
                    - cell "1 month" [ref=e286]
                    - cell [ref=e287]:
                      - strong [ref=e288]: "4"
                      - text: of 486
                    - cell "Quartile 1" [ref=e289]:
                      - generic "Quartile 1" [ref=e290]: Q1
                  - row [ref=e291]:
                    - cell "3 months" [ref=e292]
                    - cell [ref=e293]:
                      - strong [ref=e294]: "22"
                      - text: of 478
                    - cell "Quartile 1" [ref=e295]:
                      - generic "Quartile 1" [ref=e296]: Q1
                  - row [ref=e297]:
                    - cell "6 months" [ref=e298]
                    - cell [ref=e299]:
                      - strong [ref=e300]: "17"
                      - text: of 474
                    - cell "Quartile 1" [ref=e301]:
                      - generic "Quartile 1" [ref=e302]: Q1
                  - row [ref=e303]:
                    - cell "Year to date" [ref=e304]
                    - cell [ref=e305]:
                      - strong [ref=e306]: "1"
                      - text: of 470
                    - cell "Quartile 1" [ref=e307]:
                      - generic "Quartile 1" [ref=e308]: Q1
                  - row [ref=e309]:
                    - cell "1 year" [ref=e310]
                    - cell [ref=e311]:
                      - strong [ref=e312]: "1"
                      - text: of 465
                    - cell "Quartile 1" [ref=e313]:
                      - generic "Quartile 1" [ref=e314]: Q1
                  - row [ref=e315]:
                    - cell "2 years" [ref=e316]
                    - cell [ref=e317]:
                      - strong [ref=e318]: "3"
                      - text: of 442
                    - cell "Quartile 1" [ref=e319]:
                      - generic "Quartile 1" [ref=e320]: Q1
                  - row [ref=e321]:
                    - cell "3 years" [ref=e322]
                    - cell [ref=e323]:
                      - strong [ref=e324]: "1"
                      - text: of 408
                    - cell "Quartile 1" [ref=e325]:
                      - generic "Quartile 1" [ref=e326]: Q1
              - paragraph [ref=e327]:
                - text: "Source:"
                - link "Fundata (FundLibrary.com) (opens in a new tab)" [ref=e328] [cursor=pointer]:
                  - /url: https://www.fundlibrary.com/MutualFunds/Detail/790334
                  - text: Fundata (FundLibrary.com)
                  - generic [ref=e333]: (opens in a new tab)
            - generic [ref=e334]:
              - generic [ref=e335]:
                - heading "RBC Investor Services Pooled Fund Survey — Q2 2026" [level=3] [ref=e336]
                - img "RBC Investor Services" [ref=e339]
              - paragraph [ref=e340]:
                - text: "Strategy track record since January 2019 (includes periods before the fund’s launch) · Peer group:"
                - strong [ref=e341]: Canadian Fixed Income
                - text: · Period ended June 30, 2026
              - paragraph [ref=e342]: "Survey basis: returns gross of management fees, in Canadian dollars; percentile rank 1 = best."
              - paragraph [ref=e343]:
                - text: These rankings use the strategy’s track record since January 2019, which includes periods before the fund’s launch; the fund’s own returns may differ.
                - link "See the disclosures" [ref=e344] [cursor=pointer]:
                  - /url: "#disclosure"
              - table [ref=e346]:
                - caption [ref=e347]: Percentile rank by period
                - rowgroup [ref=e348]:
                  - row [ref=e349]:
                    - columnheader "Period" [ref=e350]
                    - columnheader "Standing in peer group" [ref=e351]
                - rowgroup [ref=e352]:
                  - row [ref=e353]:
                    - cell "3 months" [ref=e354]
                    - cell [ref=e355]:
                      - strong [ref=e356]: 1st percentile
                  - row [ref=e357]:
                    - cell "1 year" [ref=e358]
                    - cell [ref=e359]:
                      - strong [ref=e360]: 1st percentile
                  - row [ref=e361]:
                    - cell "2 years" [ref=e362]
                    - cell [ref=e363]:
                      - strong [ref=e364]: 1st percentile
                  - row [ref=e365]:
                    - cell "3 years" [ref=e366]
                    - cell [ref=e367]:
                      - strong [ref=e368]: 1st percentile
                  - row [ref=e369]:
                    - cell "5 years" [ref=e370]
                    - cell [ref=e371]:
                      - strong [ref=e372]: 1st percentile
                  - row [ref=e373]:
                    - cell "4 years to June 30, 2026" [ref=e374]
                    - cell [ref=e375]:
                      - strong [ref=e376]: 1st percentile
                  - row [ref=e377]:
                    - cell "4 years to June 30, 2025" [ref=e378]
                    - cell [ref=e379]:
                      - strong [ref=e380]: 1st percentile
                  - row [ref=e381]:
                    - cell "4 years to June 30, 2024" [ref=e382]
                    - cell [ref=e383]:
                      - strong [ref=e384]: 1st percentile
                  - row [ref=e385]:
                    - cell "4 years to June 30, 2023" [ref=e386]
                    - cell [ref=e387]:
                      - strong [ref=e388]: 1st percentile
              - paragraph [ref=e389]:
                - text: "Source:"
                - link "RBC Investor Services Pooled Fund Survey (opens in a new tab)" [ref=e390] [cursor=pointer]:
                  - /url: https://www.rbcis.com/assets/rbcits/docs/FINAL_EN_Pooled_Fund_Survey_Q2_2026.pdf
                  - text: RBC Investor Services Pooled Fund Survey
                  - generic [ref=e395]: (opens in a new tab)
            - paragraph [ref=e396]: Percentile ranks compare the returns of the fund’s strategy or series (as stated on each ranking) with those of the other funds in the same peer group over each period (1st percentile = top 1%). They are reproduced from the source named, as at the date shown, on that source’s basis (the RBC Investor Services survey uses returns gross of management fees); peer groups and methodologies differ between providers. Past performance does not predict future results.
            - paragraph [ref=e397]: Rankings and ratings are provided by third parties, reproduced as at the date shown and not updated daily. Category rankings compare returns with those of the other funds in the same category over each period; the number of funds ranked varies by period. Past performance does not predict future results, and rankings and ratings are not guarantees. See the source for the methodology.
      - region [ref=e398]:
        - generic [ref=e399]:
          - generic [ref=e400]:
            - paragraph [ref=e402]: Sustainable Enhanced Bonds Fund
            - heading "Sustainability, integrated" [level=2] [ref=e404]:
              - generic [aria-hidden] [ref=e405]:
                - generic [ref=e406]: Sustainability,
                - generic [ref=e407]: integrated
            - generic [ref=e408]: Criteria at every step of bond selection. They do not apply to the futures overlay, which holds no securities of individual issuers.
          - generic [ref=e410]:
            - generic [ref=e411]:
              - heading "Exclusion screens" [level=3] [ref=e416]
              - paragraph [ref=e418]: Issuers in conflict with the fund’s criteria are excluded.
            - generic [ref=e419]:
              - heading "ESG in issuer selection" [level=3] [ref=e424]
              - paragraph [ref=e426]: ESG data weighed with credit and valuation, issuer by issuer.
            - generic [ref=e427]:
              - heading "Green bonds" [level=3] [ref=e432]
              - paragraph [ref=e434]: The fund can hold bonds financing environmental projects.
            - generic [ref=e435]:
              - heading "Measured every month" [level=3] [ref=e440]
              - paragraph [ref=e442]: Metrics such as carbon intensity, monthly, for the portfolio and its index.
          - link "Our sustainability approach" [ref=e444] [cursor=pointer]:
            - /url: /sustainability
      - region [ref=e447]:
        - generic [ref=e449]:
          - generic [ref=e450]:
            - paragraph [ref=e451]: Important information
            - heading "Disclosures" [level=2] [ref=e453]
          - generic [ref=e454]:
            - paragraph [ref=e455]: The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.
            - paragraph [ref=e456]: "Performance shown: Series F, net of fees · Benchmark: FTSE Canada Universe Bond Index"
            - paragraph [ref=e457]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
            - paragraph [ref=e458]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
            - paragraph [ref=e459]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
            - paragraph [ref=e460]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
            - paragraph [ref=e461]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
            - paragraph [ref=e462]:
              - generic [ref=e464]: Updated daily from Nymbus’ data platform; portfolio data from the daily holdings as of September 28, 2026; sustainability metrics from the monthly factsheet of August 2026. performance as of August 2026 · net asset values as of Sep 28, 2026.
      - generic [ref=e467]:
        - heading "Interested in the fund?" [level=2] [ref=e468]:
          - generic [aria-hidden] [ref=e469]:
            - generic [ref=e470]: Interested
            - generic [ref=e471]: in
            - generic [ref=e472]: the
            - generic [ref=e473]: fund?
        - paragraph [ref=e475]: Our team can walk you through the fund, its series and how to invest.
        - generic [ref=e477]:
          - link "Contact our team" [ref=e478] [cursor=pointer]:
            - /url: /contact
          - link "All strategies" [ref=e481] [cursor=pointer]:
            - /url: /strategies
      - region [ref=e482]:
        - generic [ref=e483]:
          - generic [ref=e484]:
            - paragraph [ref=e486]: Explore
            - heading "Other strategies" [level=2] [ref=e488]:
              - generic [aria-hidden] [ref=e489]:
                - generic [ref=e490]: Other
                - generic [ref=e491]: strategies
          - generic [ref=e492]:
            - link "Short-term fixed income Monthly Income Monthly income from short-term corporate bonds View Nymbus Monthly Income Fund" [ref=e493] [cursor=pointer]:
              - /url: /strategies/monthly-income
              - generic [ref=e495]: Short-term fixed income
              - generic [ref=e496]: Monthly Income
              - generic [ref=e497]: Monthly income from short-term corporate bonds
              - generic [ref=e498]:
                - text: View
                - generic [ref=e499]: Nymbus Monthly Income Fund
            - link "Alternative strategies Multi-Strategy Four systematic strategies designed to have low correlation with one another View Nymbus Multi-Strategy Fund" [ref=e502] [cursor=pointer]:
              - /url: /strategies/multi-strategy
              - generic [ref=e504]: Alternative strategies
              - generic [ref=e505]: Multi-Strategy
              - generic [ref=e506]: Four systematic strategies designed to have low correlation with one another
              - generic [ref=e507]:
                - text: View
                - generic [ref=e508]: Nymbus Multi-Strategy Fund
            - link "Protective overlay (managed accounts) Global Minimum Volatility A protective futures overlay designed to have low correlation with bonds in down months View Nymbus Global Minimum Volatility" [ref=e511] [cursor=pointer]:
              - /url: /strategies/global-minimum-volatility
              - generic [ref=e513]: Protective overlay (managed accounts)
              - generic [ref=e514]: Global Minimum Volatility
              - generic [ref=e515]: A protective futures overlay designed to have low correlation with bonds in down months
              - generic [ref=e516]:
                - text: View
                - generic [ref=e517]: Nymbus Global Minimum Volatility
  - contentinfo [ref=e520]:
    - generic [ref=e521]:
      - generic [ref=e522]:
        - generic [ref=e523]:
          - link "Nymbus Capital, home" [ref=e524] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e525]
          - paragraph [ref=e534]: Montreal portfolio manager building systematic fixed income and alternative strategies.
          - generic [ref=e535]:
            - generic [ref=e536]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e537] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e538]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e539] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e540]:
          - heading "Strategies" [level=2] [ref=e541]
          - list [ref=e542]:
            - listitem [ref=e543]:
              - link "Monthly Income" [ref=e544] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e546]:
              - link "Sustainable Enhanced Bonds" [ref=e547] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e549]:
              - link "Multi-Strategy" [ref=e550] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e552]:
              - link "Global Minimum Volatility" [ref=e553] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e555]:
          - heading "Company" [level=2] [ref=e556]
          - list [ref=e557]:
            - listitem [ref=e558]:
              - link "About & team" [ref=e559] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e560]:
              - link "Approach" [ref=e561] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e562]:
              - link "Critical concepts" [ref=e563] [cursor=pointer]:
                - /url: /critical-concepts
            - listitem [ref=e564]:
              - link "Sustainability" [ref=e565] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e566]:
              - link "Solutions" [ref=e567] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e568]:
          - heading "Resources" [level=2] [ref=e569]
          - list [ref=e570]:
            - listitem [ref=e571]:
              - link "Contact" [ref=e572] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e573]:
              - link "Privacy policy" [ref=e574] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e575]:
              - link "Complaints & code of ethics" [ref=e576] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e577]:
              - link "LinkedIn" [ref=e578] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e582]:
        - paragraph [ref=e583]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
        - paragraph [ref=e584]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
        - paragraph [ref=e585]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
        - paragraph [ref=e586]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
        - paragraph [ref=e587]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
        - paragraph [ref=e588]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative. Unless another variant is selected on the strategy page, the returns shown are those of the 6% downside volatility variant; the strategy is also offered with 3% and 9% downside volatility targets, whose returns differ.
        - paragraph [ref=e589]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
      - generic [ref=e590]:
        - generic [ref=e591]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e592]: PRI signatory
  - alert [ref=e593]
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | /**
  4   |  * Site v5 (2026-10-04, Gabriel's requests): "protective overlay" naming with its qualifier, About page order
  5   |  * (people before values) and team changes, /solutions without the third-party rankings section, fund awards
  6   |  * (Morningstar, Fundata, RBC; Morningstar note as an info disclosure; tab only with a Fundata FundGrade A or B) and
  7   |  * the Global Minimum Volatility variants in the order 3 %, 6 %, 9 % with 6 % selected.
  8   |  */
  9   | 
  10  | const SHOTS = "e2e/screenshots";
  11  | 
  12  | test("about: the people come before the values; the protective-overlay name keeps its qualifier", async ({ page }, info) => {
  13  |   await page.goto("/team");
  14  |   const people = page.locator("#ab-people-t");
  15  |   const values = page.locator("#ab-val-t");
  16  |   await expect(people).toBeAttached();
  17  |   await expect(values).toBeAttached();
  18  |   const yPeople = await people.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  19  |   const yValues = await values.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  20  |   expect(yPeople).toBeLessThan(yValues);
  21  |   await expect(page.getByTestId("about-overlay-note")).toContainText("designed to offset part of losses; they may not do so");
  22  |   const list = page.getByTestId("people");
  23  |   await list.scrollIntoViewIfNeeded();
  24  |   await expect(list).not.toContainText("Xavier Girard");
  25  |   await expect(list).not.toContainText("Jean-Philippe Lejeune");
  26  |   for (const img of ["/team/xavier-girard.webp", "/team/jean-philippe-lejeune.webp"]) {
  27  |     expect((await page.request.get(img)).status()).toBe(404);
  28  |   }
  29  |   await page.screenshot({ path: `${SHOTS}/v5-about-${info.project.name}.png`, fullPage: true });
  30  | });
  31  | 
  32  | test("approach: protective overlays named with the qualifier and the futures-exposure disclosure (FR too)", async ({ page, baseURL }) => {
  33  |   await page.goto("/approach");
  34  |   await expect(page.getByRole("heading", { level: 2, name: /why add a protective overlay/i })).toBeAttached();
  35  |   await expect(page.locator("body")).toContainText("Our protective overlay is designed to have low correlation with bonds in down months and to offset part of bond losses when volatility rises; it may not do so and can lose money.");
  36  |   await expect(page.locator("body")).toContainText("The overlay adds futures exposure on top of the underlying portfolio");
  37  |   await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: baseURL! }]);
  38  |   await page.goto("/approach");
  39  |   await expect(page.locator("body")).toContainText("Pourquoi ajouter une superposition protectrice");
  40  | });
  41  | 
  42  | test("solutions: no third-party rankings section", async ({ page }) => {
  43  |   await page.goto("/solutions");
  44  |   await expect(page.getByRole("heading", { name: /third-party rankings/i })).toHaveCount(0);
  45  |   await expect(page.locator("body")).not.toContainText(/percentile|FundGrade|Morningstar Rating/);
  46  |   await expect(page.locator("body")).toContainText("Protective overlay");
  47  | });
  48  | 
  49  | test("fund awards: Morningstar → Fundata → RBC, official logos sized like Morningstar's, no 'Fund Library' label", async ({ page }, info) => {
  50  |   await page.goto("/strategies/sustainable-enhanced-bonds#awards");
  51  |   const tab = page.locator('[role="tabpanel"][data-panel="awards"]');
  52  |   await expect(tab).toBeVisible();
  53  |   const order = await tab.locator('[data-testid="awards-morningstar"], [data-testid^="ranking-"], [data-testid^="tp-rbc"]').evaluateAll((els) => els.map((e) => e.getAttribute("data-testid")));
> 54  |   expect(order.slice(0, 3)).toEqual(["awards-morningstar", "ranking-LDM201", "tp-rbc-pfs"]);
      |                             ^ Error: expect(received).toEqual(expected) // deep equality
  55  |   const fundata = tab.getByTestId("logo-fundata");
  56  |   await expect(fundata).toHaveAttribute("src", "/brand/third-party/fundata-logo.png");
  57  |   await expect(fundata).toHaveAttribute("alt", "Fundata");
  58  |   const rbc = tab.getByTestId("logo-rbc-pfs");
  59  |   await expect(rbc).toHaveAttribute("src", "/brand/third-party/rbc-logo.png");
  60  |   await expect(rbc).toHaveAttribute("alt", "RBC Investor Services");
  61  |   for (const img of [fundata, rbc]) expect(await img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
  62  |   const fb = (await fundata.boundingBox())!;
  63  |   expect(fb.width).toBeGreaterThanOrEqual(100);
  64  |   expect(fb.width).toBeLessThanOrEqual(130);
  65  |   const rb = (await rbc.boundingBox())!;
  66  |   expect(rb.height).toBeGreaterThanOrEqual(32);
  67  |   expect(rb.height).toBeLessThanOrEqual(40);
  68  |   await expect(tab).not.toContainText("Fund Library");
  69  |   await tab.getByTestId("ranking-LDM201").scrollIntoViewIfNeeded();
  70  |   await page.screenshot({ path: `${SHOTS}/v5-awards-seb-${info.project.name}.png`, fullPage: true });
  71  |   // Monthly Income (FundGrade B): tab shown; Multi-Strategy (C) and GMV (none): no tab
  72  |   await page.goto("/strategies/monthly-income");
  73  |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="awards"]')).toHaveCount(1);
  74  |   for (const slug of ["multi-strategy", "global-minimum-volatility"]) {
  75  |     await page.goto(`/strategies/${slug}`);
  76  |     await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="awards"]'), slug).toHaveCount(0);
  77  |     await expect(page.getByTestId("overview-morningstar"), slug).toHaveCount(0);
  78  |   }
  79  | });
  80  | 
  81  | test("Morningstar note: compact info button; hover / focus / tap opens the full text, Escape closes it", async ({ page, isMobile }, info) => {
  82  |   await page.goto("/strategies/monthly-income");
  83  |   const block = page.locator('[role="tabpanel"][data-panel="overview"]').getByTestId("overview-morningstar");
  84  |   await block.scrollIntoViewIfNeeded();
  85  |   const btn = block.getByTestId("overview-morningstar-rating-info-button");
  86  |   const pop = block.getByTestId("overview-morningstar-rating-info-text");
  87  |   await expect(btn).toHaveAccessibleName("Rating methodology and attribution");
  88  |   await expect(btn).toHaveAccessibleDescription(/Morningstar Rating™ reflects performance as of October 1, 2026.*© 2026 Morningstar Research Inc\./s);
  89  |   const id = await pop.getAttribute("id");
  90  |   await expect(btn).toHaveAttribute("aria-describedby", id!);
  91  |   await expect(btn).toHaveAttribute("aria-controls", id!);
  92  |   await expect(pop).toBeHidden();
  93  |   await expect(btn).toHaveAttribute("aria-expanded", "false");
  94  |   if (isMobile) {
  95  |     await btn.tap();
  96  |     await expect(pop).toBeVisible();
  97  |     await page.screenshot({ path: `${SHOTS}/v5-morningstar-note-open-${info.project.name}.png` });
  98  |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  99  |     await btn.tap();
  100 |     await expect(pop).toBeHidden();
  101 |     await btn.tap();
  102 |     await expect(pop).toBeVisible();
  103 |     await page.getByRole("heading", { level: 1 }).tap();
  104 |     await expect(pop).toBeHidden();
  105 |   } else {
  106 |     await btn.hover();
  107 |     await expect(pop).toBeVisible();
  108 |     // hoverable: moving onto the note keeps it open
  109 |     await pop.hover();
  110 |     await expect(pop).toBeVisible();
  111 |     await page.keyboard.press("Escape");
  112 |     await expect(pop).toBeHidden();
  113 |     await page.mouse.move(0, 0);
  114 |     // keyboard: focus opens, Escape closes, Enter pins
  115 |     await btn.focus();
  116 |     await page.keyboard.press("Shift+Tab");
  117 |     await page.keyboard.press("Tab");
  118 |     await expect(btn).toBeFocused();
  119 |     await expect(pop).toBeVisible();
  120 |     await expect(btn).toHaveAttribute("aria-expanded", "true");
  121 |     await page.screenshot({ path: `${SHOTS}/v5-morningstar-note-open-${info.project.name}.png` });
  122 |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  123 |     await page.keyboard.press("Escape");
  124 |     await expect(pop).toBeHidden();
  125 |     await page.keyboard.press("Enter");
  126 |     await expect(pop).toBeVisible();
  127 |     await page.keyboard.press("Enter");
  128 |     await expect(pop).toBeHidden();
  129 |   }
  130 | });
  131 | 
  132 | test("Global Minimum Volatility: variants shown 3 %, 6 %, 9 %, with 6 % selected on every page", async ({ page, baseURL }, info) => {
  133 |   await page.goto("/strategies/global-minimum-volatility");
  134 |   const sel = page.getByTestId("variant-selector");
  135 |   await expect(sel.locator('[role="radio"]')).toHaveText([/3%/, /6%/, /9%/]);
  136 |   await expect(sel.getByTestId("variant-6")).toHaveAttribute("aria-checked", "true");
  137 |   await expect(page.getByTestId("hero-variant")).toHaveText("6% downside volatility");
  138 |   await expect(page.getByTestId("disclosure-variant")).toHaveText("6% downside volatility");
  139 |   await page.screenshot({ path: `${SHOTS}/v5-gmv-${info.project.name}.png` });
  140 |   await page.goto("/strategies");
  141 |   await expect(page.locator("body")).toContainText("6% downside volatility");
  142 |   await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: baseURL! }]);
  143 |   await page.goto("/strategies/global-minimum-volatility");
  144 |   await expect(page.getByTestId("variant-selector").locator('[role="radio"]')).toHaveText([/3\s%/, /6\s%/, /9\s%/]);
  145 |   await expect(page.getByTestId("variant-selector").getByTestId("variant-6")).toHaveAttribute("aria-checked", "true");
  146 | });
  147 | 
```