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
            - paragraph [ref=e52]: A core Canadian bond portfolio built systematically, integrating sustainability criteria in bond selection, with a protective futures overlay designed to have low correlation with bonds in down months and to offset part of bond losses; it may not do so and can lose money.
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
                - term [ref=e166]: Fundserv
                - definition [ref=e167]:
                  - code [ref=e168]: LDM201
              - generic [ref=e169]:
                - term [ref=e170]: Currency
                - definition [ref=e171]: CAD
              - generic [ref=e172]:
                - term [ref=e173]: Track record since
                - definition [ref=e174]: August 2023
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
              - generic [ref=e188]: −0.43%
            - listitem [ref=e189]:
              - generic "3 months" [ref=e190]: 3M
              - generic [ref=e192]: −0.22%
            - listitem [ref=e193]:
              - generic "Year to date" [ref=e194]: YTD
              - generic [ref=e196]: −1.78%
            - listitem [ref=e197]:
              - generic "1 year" [ref=e198]: 1Y
              - generic [ref=e200]: −1.24%
            - listitem [ref=e201]:
              - generic "3 years" [ref=e202]:
                - text: 3Y
                - superscript [aria-hidden] [ref=e204]: "*"
              - generic [ref=e205]: +1.06%
            - listitem [ref=e206]:
              - generic "Since inception" [ref=e207]:
                - text: SI
                - superscript [aria-hidden] [ref=e209]: "*"
              - generic [ref=e210]: +1.27%
          - paragraph [ref=e211]: "* Periods over one year are annualized."
      - generic [ref=e212]:
        - tablist "Fund information" [ref=e215]:
          - tab "Overview" [ref=e216] [cursor=pointer]
          - tab "Performance" [ref=e217] [cursor=pointer]
          - tab "Portfolio" [ref=e218] [cursor=pointer]
          - tab "Distributions" [ref=e219] [cursor=pointer]
          - tab "Awards and rankings" [selected] [ref=e220] [cursor=pointer]
          - tab "Documents" [ref=e221] [cursor=pointer]
        - text: Fundserv Currency NAV per unit Daily change Valuation date Fundserv Currency NAV per unit Daily change Valuation date Fundserv Currency NAV per unit Daily change Valuation date
        - tabpanel "Awards and rankings" [ref=e222]:
          - heading "Awards and rankings" [level=2] [ref=e223]
          - generic [ref=e224]:
            - paragraph [ref=e225]: Independent rankings and ratings of the series listed, as at the date given.
            - generic [ref=e226]:
              - heading "Morningstar rating" [level=3] [ref=e228]
              - region "Morningstar Rating™" [ref=e230]:
                - generic [ref=e231]:
                  - img "Morningstar" [ref=e232]
                  - 'img "Morningstar Rating™: 5 stars" [ref=e233]'
                  - paragraph [ref=e234]: "Morningstar Rating™: 5 stars"
                - paragraph [ref=e235]: Series F, as of October 1, 2026
                - generic [ref=e236]:
                  - 'link "Source: Morningstar (opens in a new tab)" [ref=e237] [cursor=pointer]':
                    - /url: https://global.morningstar.com/en-ca/investments/funds/0P0001ROZG/quote
                    - text: "Source: Morningstar"
                    - generic [ref=e242]: (opens in a new tab)
                  - button "Rating methodology and attribution" [ref=e244] [cursor=pointer]
            - generic [ref=e248]:
              - generic [ref=e249]:
                - heading "Series F (LDM201)" [level=3] [ref=e250]
                - img "Fundata" [ref=e253]
              - paragraph [ref=e254]:
                - text: "Category:"
                - strong [ref=e255]: Canadian Fixed Income
                - text: · As at August 31, 2026
              - generic [ref=e256]:
                - generic [ref=e257]: FundGrade
                - generic "FundGrade rating A" [ref=e259]: A
              - table [ref=e261]:
                - caption [ref=e262]: Category rank and quartile by period
                - rowgroup [ref=e263]:
                  - row [ref=e264]:
                    - columnheader "Period" [ref=e265]
                    - columnheader "Rank in category" [ref=e266]
                    - columnheader "Quartile" [ref=e267]
                - rowgroup [ref=e268]:
                  - row [ref=e269]:
                    - cell "1 month" [ref=e270]
                    - cell [ref=e271]:
                      - strong [ref=e272]: "4"
                      - text: of 486
                    - cell "Quartile 1" [ref=e273]:
                      - generic "Quartile 1" [ref=e274]: Q1
                  - row [ref=e275]:
                    - cell "3 months" [ref=e276]
                    - cell [ref=e277]:
                      - strong [ref=e278]: "22"
                      - text: of 478
                    - cell "Quartile 1" [ref=e279]:
                      - generic "Quartile 1" [ref=e280]: Q1
                  - row [ref=e281]:
                    - cell "6 months" [ref=e282]
                    - cell [ref=e283]:
                      - strong [ref=e284]: "17"
                      - text: of 474
                    - cell "Quartile 1" [ref=e285]:
                      - generic "Quartile 1" [ref=e286]: Q1
                  - row [ref=e287]:
                    - cell "Year to date" [ref=e288]
                    - cell [ref=e289]:
                      - strong [ref=e290]: "1"
                      - text: of 470
                    - cell "Quartile 1" [ref=e291]:
                      - generic "Quartile 1" [ref=e292]: Q1
                  - row [ref=e293]:
                    - cell "1 year" [ref=e294]
                    - cell [ref=e295]:
                      - strong [ref=e296]: "1"
                      - text: of 465
                    - cell "Quartile 1" [ref=e297]:
                      - generic "Quartile 1" [ref=e298]: Q1
                  - row [ref=e299]:
                    - cell "2 years" [ref=e300]
                    - cell [ref=e301]:
                      - strong [ref=e302]: "3"
                      - text: of 442
                    - cell "Quartile 1" [ref=e303]:
                      - generic "Quartile 1" [ref=e304]: Q1
                  - row [ref=e305]:
                    - cell "3 years" [ref=e306]
                    - cell [ref=e307]:
                      - strong [ref=e308]: "1"
                      - text: of 408
                    - cell "Quartile 1" [ref=e309]:
                      - generic "Quartile 1" [ref=e310]: Q1
              - paragraph [ref=e311]:
                - text: "Source:"
                - link "Fundata (FundLibrary.com) (opens in a new tab)" [ref=e312] [cursor=pointer]:
                  - /url: https://www.fundlibrary.com/MutualFunds/Detail/790334
                  - text: Fundata (FundLibrary.com)
                  - generic [ref=e317]: (opens in a new tab)
            - generic [ref=e318]:
              - generic [ref=e319]:
                - heading "RBC Investor Services Pooled Fund Survey — Q2 2026" [level=3] [ref=e320]
                - img "RBC Investor Services" [ref=e323]
              - paragraph [ref=e324]:
                - text: "Strategy track record since January 2019 (includes periods before the fund’s launch) · Peer group:"
                - strong [ref=e325]: Canadian Fixed Income
                - text: · Period ended June 30, 2026
              - paragraph [ref=e326]: "Survey basis: returns gross of management fees, in Canadian dollars; percentile rank 1 = best."
              - paragraph [ref=e327]:
                - text: These rankings use the strategy’s track record since January 2019, which includes periods before the fund’s launch; the fund’s own returns may differ.
                - link "See the disclosures" [ref=e328] [cursor=pointer]:
                  - /url: "#disclosure"
              - table [ref=e330]:
                - caption [ref=e331]: Percentile rank by period
                - rowgroup [ref=e332]:
                  - row [ref=e333]:
                    - columnheader "Period" [ref=e334]
                    - columnheader "Standing in peer group" [ref=e335]
                - rowgroup [ref=e336]:
                  - row [ref=e337]:
                    - cell "3 months" [ref=e338]
                    - cell [ref=e339]:
                      - strong [ref=e340]: 1st percentile
                  - row [ref=e341]:
                    - cell "1 year" [ref=e342]
                    - cell [ref=e343]:
                      - strong [ref=e344]: 1st percentile
                  - row [ref=e345]:
                    - cell "2 years" [ref=e346]
                    - cell [ref=e347]:
                      - strong [ref=e348]: 1st percentile
                  - row [ref=e349]:
                    - cell "3 years" [ref=e350]
                    - cell [ref=e351]:
                      - strong [ref=e352]: 1st percentile
                  - row [ref=e353]:
                    - cell "5 years" [ref=e354]
                    - cell [ref=e355]:
                      - strong [ref=e356]: 1st percentile
                  - row [ref=e357]:
                    - cell "4 years to June 30, 2026" [ref=e358]
                    - cell [ref=e359]:
                      - strong [ref=e360]: 1st percentile
                  - row [ref=e361]:
                    - cell "4 years to June 30, 2025" [ref=e362]
                    - cell [ref=e363]:
                      - strong [ref=e364]: 1st percentile
                  - row [ref=e365]:
                    - cell "4 years to June 30, 2024" [ref=e366]
                    - cell [ref=e367]:
                      - strong [ref=e368]: 1st percentile
                  - row [ref=e369]:
                    - cell "4 years to June 30, 2023" [ref=e370]
                    - cell [ref=e371]:
                      - strong [ref=e372]: 1st percentile
              - paragraph [ref=e373]:
                - text: "Source:"
                - link "RBC Investor Services Pooled Fund Survey (opens in a new tab)" [ref=e374] [cursor=pointer]:
                  - /url: https://www.rbcis.com/assets/rbcits/docs/FINAL_EN_Pooled_Fund_Survey_Q2_2026.pdf
                  - text: RBC Investor Services Pooled Fund Survey
                  - generic [ref=e379]: (opens in a new tab)
            - paragraph [ref=e380]: Percentile ranks compare the returns of the fund’s strategy or series (as stated on each ranking) with those of the other funds in the same peer group over each period (1st percentile = top 1%). They are reproduced from the source named, as at the date shown, on that source’s basis (the RBC Investor Services survey uses returns gross of management fees); peer groups and methodologies differ between providers. Past performance does not predict future results.
            - paragraph [ref=e381]: Rankings and ratings are provided by third parties, reproduced as at the date shown and not updated daily. Category rankings compare returns with those of the other funds in the same category over each period; the number of funds ranked varies by period. Past performance does not predict future results, and rankings and ratings are not guarantees. See the source for the methodology.
      - region [ref=e382]:
        - generic [ref=e383]:
          - generic [ref=e384]:
            - paragraph [ref=e386]: Sustainable Enhanced Bonds Fund
            - heading "Sustainability, integrated" [level=2] [ref=e388]:
              - generic [aria-hidden] [ref=e389]:
                - generic [ref=e390]: Sustainability,
                - generic [ref=e391]: integrated
            - generic [ref=e392]: Criteria at every step of bond selection. They do not apply to the futures overlay, which holds no securities of individual issuers.
          - generic [ref=e394]:
            - generic [ref=e395]:
              - heading "Exclusion screens" [level=3] [ref=e400]
              - paragraph [ref=e402]: Issuers in conflict with the fund’s criteria are excluded.
            - generic [ref=e403]:
              - heading "ESG in issuer selection" [level=3] [ref=e408]
              - paragraph [ref=e410]: ESG data weighed with credit and valuation, issuer by issuer.
            - generic [ref=e411]:
              - heading "Green bonds" [level=3] [ref=e416]
              - paragraph [ref=e418]: The fund can hold bonds financing environmental projects.
            - generic [ref=e419]:
              - heading "Measured every month" [level=3] [ref=e424]
              - paragraph [ref=e426]: Metrics such as carbon intensity, monthly, for the portfolio and its index.
          - link "Our sustainability approach" [ref=e428] [cursor=pointer]:
            - /url: /sustainability
      - region [ref=e431]:
        - generic [ref=e433]:
          - generic [ref=e434]:
            - paragraph [ref=e435]: Important information
            - heading "Disclosures" [level=2] [ref=e437]
          - generic [ref=e438]:
            - paragraph [ref=e439]: The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.
            - paragraph [ref=e440]: "Performance shown: Series F, net of fees · Benchmark: FTSE Canada Universe Bond Index"
            - paragraph [ref=e441]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
            - paragraph [ref=e442]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
            - paragraph [ref=e443]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
            - paragraph [ref=e444]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
            - paragraph [ref=e445]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
            - paragraph [ref=e446]:
              - generic [ref=e448]: Updated daily from Nymbus’ data platform; portfolio data from the daily holdings as of September 28, 2026; sustainability metrics from the monthly factsheet of August 2026. performance as of August 2026 · net asset values as of Sep 28, 2026.
      - generic [ref=e451]:
        - heading "Interested in the fund?" [level=2] [ref=e452]:
          - generic [aria-hidden] [ref=e453]:
            - generic [ref=e454]: Interested
            - generic [ref=e455]: in
            - generic [ref=e456]: the
            - generic [ref=e457]: fund?
        - paragraph [ref=e459]: Our team can walk you through the fund, its series and how to invest.
        - generic [ref=e461]:
          - link "Contact our team" [ref=e462] [cursor=pointer]:
            - /url: /contact
          - link "All strategies" [ref=e465] [cursor=pointer]:
            - /url: /strategies
      - region [ref=e466]:
        - generic [ref=e467]:
          - generic [ref=e468]:
            - paragraph [ref=e470]: Explore
            - heading "Other strategies" [level=2] [ref=e472]:
              - generic [aria-hidden] [ref=e473]:
                - generic [ref=e474]: Other
                - generic [ref=e475]: strategies
          - generic [ref=e476]:
            - link "Short-term fixed income Monthly Income Monthly income from short-term corporate bonds View Nymbus Monthly Income Fund" [ref=e477] [cursor=pointer]:
              - /url: /strategies/monthly-income
              - generic [ref=e479]: Short-term fixed income
              - generic [ref=e480]: Monthly Income
              - generic [ref=e481]: Monthly income from short-term corporate bonds
              - generic [ref=e482]:
                - text: View
                - generic [ref=e483]: Nymbus Monthly Income Fund
            - link "Alternative strategies Multi-Strategy Four systematic strategies designed to have low correlation with one another View Nymbus Multi-Strategy Fund" [ref=e486] [cursor=pointer]:
              - /url: /strategies/multi-strategy
              - generic [ref=e488]: Alternative strategies
              - generic [ref=e489]: Multi-Strategy
              - generic [ref=e490]: Four systematic strategies designed to have low correlation with one another
              - generic [ref=e491]:
                - text: View
                - generic [ref=e492]: Nymbus Multi-Strategy Fund
            - link "Protective overlay (managed accounts) Global Minimum Volatility A protective futures overlay designed to have low correlation with bonds in down months View Nymbus Global Minimum Volatility" [ref=e495] [cursor=pointer]:
              - /url: /strategies/global-minimum-volatility
              - generic [ref=e497]: Protective overlay (managed accounts)
              - generic [ref=e498]: Global Minimum Volatility
              - generic [ref=e499]: A protective futures overlay designed to have low correlation with bonds in down months
              - generic [ref=e500]:
                - text: View
                - generic [ref=e501]: Nymbus Global Minimum Volatility
  - contentinfo [ref=e504]:
    - generic [ref=e505]:
      - generic [ref=e506]:
        - generic [ref=e507]:
          - link "Nymbus Capital, home" [ref=e508] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e509]
          - paragraph [ref=e518]: Montreal portfolio manager building systematic fixed income and alternative strategies.
          - generic [ref=e519]:
            - generic [ref=e520]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e521] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e522]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e523] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e524]:
          - heading "Strategies" [level=2] [ref=e525]
          - list [ref=e526]:
            - listitem [ref=e527]:
              - link "Monthly Income" [ref=e528] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e530]:
              - link "Sustainable Enhanced Bonds" [ref=e531] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e533]:
              - link "Multi-Strategy" [ref=e534] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e536]:
              - link "Global Minimum Volatility" [ref=e537] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e539]:
          - heading "Company" [level=2] [ref=e540]
          - list [ref=e541]:
            - listitem [ref=e542]:
              - link "About & team" [ref=e543] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e544]:
              - link "Approach" [ref=e545] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e546]:
              - link "Critical concepts" [ref=e547] [cursor=pointer]:
                - /url: /critical-concepts
            - listitem [ref=e548]:
              - link "Sustainability" [ref=e549] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e550]:
              - link "Solutions" [ref=e551] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e552]:
          - heading "Resources" [level=2] [ref=e553]
          - list [ref=e554]:
            - listitem [ref=e555]:
              - link "Contact" [ref=e556] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e557]:
              - link "Privacy policy" [ref=e558] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e559]:
              - link "Complaints & code of ethics" [ref=e560] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e561]:
              - link "LinkedIn" [ref=e562] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e566]:
        - paragraph [ref=e567]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
        - paragraph [ref=e568]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
        - paragraph [ref=e569]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
        - paragraph [ref=e570]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
        - paragraph [ref=e571]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
        - paragraph [ref=e572]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative. Unless another variant is selected on the strategy page, the returns shown are those of the 6% downside volatility variant; the strategy is also offered with 3% and 9% downside volatility targets, whose returns differ.
        - paragraph [ref=e573]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
      - generic [ref=e574]:
        - generic [ref=e575]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e576]: PRI signatory
  - alert [ref=e577]
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