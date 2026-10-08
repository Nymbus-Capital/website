# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> every series of a fund: own figures when it has them, a withheld period / year is omitted, no notice (EN + FR)
- Location: e2e/fund.spec.ts:463:5

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByTestId('overview-returns').locator('tbody tr').filter({ hasText: '3 years' })
Expected: 0
Received: 1
Timeout:  10000ms

Call log:
  - Expect "toHaveCount" getByTestId('overview-returns').locator('tbody tr').filter({ hasText: '3 years' }) with timeout 10000ms
  - waiting for getByTestId('overview-returns').locator('tbody tr').filter({ hasText: '3 years' })
    24 × locator resolved to 1 element
       - unexpected value "1"

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
              - generic [ref=e36]: Monthly Income
        - generic [ref=e37]:
          - generic [ref=e38]:
            - paragraph [ref=e40]: Short-term fixed income
            - heading "Nymbus Monthly Income Fund" [level=1] [ref=e42]:
              - generic [aria-hidden] [ref=e43]:
                - generic [ref=e44]: Nymbus
                - generic [ref=e45]: Monthly
                - generic [ref=e46]: Income
                - generic [ref=e47]: Fund
            - paragraph [ref=e49]: Monthly income from short-term corporate bonds
            - paragraph [ref=e51]: Short-term Canadian corporate bonds selected by our two-system process, with a protective futures overlay designed to have low correlation with bonds in down months and to offset part of bond losses; it may not do so and can lose money. Distributions are not guaranteed, may change and may include a return of capital.
            - generic [ref=e52]:
              - generic [ref=e53]: Mutual fund
              - generic [ref=e55]:
                - generic [ref=e56]: Risk
                - text: Low to medium
              - generic "Illustrative figures only, not actual performance" [ref=e63]: Sample data
            - generic [ref=e65]:
              - link "Contact us" [ref=e66] [cursor=pointer]:
                - /url: /contact
              - link "Fund documents" [ref=e69] [cursor=pointer]:
                - /url: "#documents"
          - generic [ref=e74]:
            - generic [ref=e75]:
              - generic [ref=e76]: Net asset value per unit
              - generic [ref=e77]: As of Sep 28, 2026
            - radiogroup "Choose a series" [ref=e80]:
              - radio "Series F" [ref=e81] [cursor=pointer]:
                - generic [ref=e82]: Series
                - text: F
              - radio "Series FP" [ref=e83] [cursor=pointer]:
                - generic [ref=e84]: Series
                - text: FP
              - radio "Series F USD" [ref=e85] [cursor=pointer]:
                - generic [ref=e86]: Series
                - text: F USD
              - radio "Series A" [ref=e87] [cursor=pointer]:
                - generic [ref=e88]: Series
                - text: A
              - radio "Series I" [ref=e89] [cursor=pointer]:
                - generic [ref=e90]: Series
                - text: I
              - radio "Series J" [checked] [active] [ref=e91] [cursor=pointer]:
                - generic [ref=e92]: Series
                - text: J
            - generic [ref=e94]:
              - generic [ref=e95]: $10.3943
              - generic [aria-hidden] [ref=e96]:
                - generic [ref=e97]: $
                - generic [ref=e99]:
                  - generic [ref=e100]: "0"
                  - generic [ref=e101]: "1"
                  - generic [ref=e102]: "2"
                  - generic [ref=e103]: "3"
                  - generic [ref=e104]: "4"
                  - generic [ref=e105]: "5"
                  - generic [ref=e106]: "6"
                  - generic [ref=e107]: "7"
                  - generic [ref=e108]: "8"
                  - generic [ref=e109]: "9"
                - generic [ref=e111]:
                  - generic [ref=e112]: "0"
                  - generic [ref=e113]: "1"
                  - generic [ref=e114]: "2"
                  - generic [ref=e115]: "3"
                  - generic [ref=e116]: "4"
                  - generic [ref=e117]: "5"
                  - generic [ref=e118]: "6"
                  - generic [ref=e119]: "7"
                  - generic [ref=e120]: "8"
                  - generic [ref=e121]: "9"
                - generic [ref=e122]: .
                - generic [ref=e124]:
                  - generic [ref=e125]: "0"
                  - generic [ref=e126]: "1"
                  - generic [ref=e127]: "2"
                  - generic [ref=e128]: "3"
                  - generic [ref=e129]: "4"
                  - generic [ref=e130]: "5"
                  - generic [ref=e131]: "6"
                  - generic [ref=e132]: "7"
                  - generic [ref=e133]: "8"
                  - generic [ref=e134]: "9"
                - generic [ref=e136]:
                  - generic [ref=e137]: "0"
                  - generic [ref=e138]: "1"
                  - generic [ref=e139]: "2"
                  - generic [ref=e140]: "3"
                  - generic [ref=e141]: "4"
                  - generic [ref=e142]: "5"
                  - generic [ref=e143]: "6"
                  - generic [ref=e144]: "7"
                  - generic [ref=e145]: "8"
                  - generic [ref=e146]: "9"
                - generic [ref=e148]:
                  - generic [ref=e149]: "0"
                  - generic [ref=e150]: "1"
                  - generic [ref=e151]: "2"
                  - generic [ref=e152]: "3"
                  - generic [ref=e153]: "4"
                  - generic [ref=e154]: "5"
                  - generic [ref=e155]: "6"
                  - generic [ref=e156]: "7"
                  - generic [ref=e157]: "8"
                  - generic [ref=e158]: "9"
                - generic [ref=e160]:
                  - generic [ref=e161]: "0"
                  - generic [ref=e162]: "1"
                  - generic [ref=e163]: "2"
                  - generic [ref=e164]: "3"
                  - generic [ref=e165]: "4"
                  - generic [ref=e166]: "5"
                  - generic [ref=e167]: "6"
                  - generic [ref=e168]: "7"
                  - generic [ref=e169]: "8"
                  - generic [ref=e170]: "9"
            - paragraph [ref=e171]:
              - generic [ref=e174]: −0.0081 (−0.08%)
              - generic [ref=e175]: vs previous valuation day
            - generic [ref=e176]:
              - generic [ref=e177]:
                - term [ref=e178]: Series
                - definition [ref=e179]: J
              - generic [ref=e180]:
                - term [ref=e181]: Fundserv
                - definition [ref=e182]:
                  - code [ref=e183]: LDM061
              - generic [ref=e184]:
                - term [ref=e185]: Currency
                - definition [ref=e186]: CAD
              - generic [ref=e187]:
                - term [ref=e188]: Series inception
                - definition [ref=e189]: Oct 5, 2021
              - generic [ref=e190]:
                - term [ref=e191]: Fund launch
                - definition [ref=e192]: October 5, 2021
              - generic [ref=e193]:
                - term [ref=e194]: Benchmark
                - definition [ref=e195]: FTSE Canada Short Term Corporate Bond Index
      - region [ref=e196]:
        - generic [ref=e198]:
          - generic [ref=e199]:
            - heading "Returns" [level=2] [ref=e200]
            - paragraph [ref=e201]: Series J, net of fees · as of August 31, 2026
          - list [ref=e202]:
            - listitem [ref=e203]:
              - generic "1 month" [ref=e204]: 1M
              - generic [ref=e206]: −0.11%
            - listitem [ref=e207]:
              - generic "3 months" [ref=e208]: 3M
              - generic [ref=e210]: −0.57%
            - listitem [ref=e211]:
              - generic "Year to date" [ref=e212]: YTD
              - generic [ref=e214]: +0.02%
            - listitem [ref=e215]:
              - generic "1 year" [ref=e216]: 1Y
              - generic [ref=e218]: +1.16%
            - listitem [ref=e219]:
              - generic "3 years" [ref=e220]:
                - text: 3Y
                - superscript [aria-hidden] [ref=e222]: "*"
              - generic [ref=e223]: +1.14%
            - listitem [ref=e224]:
              - generic "Since inception (Oct 5, 2021)" [ref=e225]:
                - text: SI
                - superscript [aria-hidden] [ref=e227]: "*"
              - generic [ref=e228]: +1.96%
          - paragraph [ref=e229]: "* Periods over one year are annualized."
      - generic [ref=e230]:
        - tablist "Fund information" [ref=e233]:
          - tab "Overview" [selected] [ref=e234] [cursor=pointer]
          - tab "Performance" [ref=e235] [cursor=pointer]
          - tab "Portfolio" [ref=e236] [cursor=pointer]
          - tab "Distributions" [ref=e237] [cursor=pointer]
          - tab "Awards and rankings" [ref=e238] [cursor=pointer]
          - tab "Documents" [ref=e239] [cursor=pointer]
        - tabpanel "Overview" [ref=e240]:
          - heading "Overview" [level=2] [ref=e241]
          - generic [ref=e242]:
            - generic [ref=e243]:
              - generic [ref=e244]:
                - generic [ref=e245]:
                  - heading "What the fund does" [level=3] [ref=e247]
                  - paragraph [ref=e249]: Monthly income from short-term Canadian corporate bonds, with low rate sensitivity. Distributions are not guaranteed, may change and may include a return of capital.
                - generic [ref=e250]:
                  - heading "Investment approach" [level=3] [ref=e252]
                  - list [ref=e254]:
                    - listitem [ref=e255]: Mainly short-term Canadian corporate bonds
                    - listitem [ref=e256]: Selected by our two-system process
                    - listitem [ref=e257]: Credit risk and relative value, bond by bond
                  - paragraph [ref=e258]: The protective overlay is designed to have low correlation with bonds in down months and to offset part of bond losses when volatility rises; it may not do so and can lose money. The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.
                - generic [ref=e259]:
                  - generic [ref=e260]:
                    - heading "Returns" [level=3] [ref=e261]
                    - link "See all performance" [ref=e264] [cursor=pointer]:
                      - /url: "#performance"
                  - paragraph [ref=e267]: Series J, net of fees · as of August 31, 2026
                  - generic [ref=e268]:
                    - table [ref=e269]:
                      - caption [ref=e270]: Returns
                      - rowgroup [ref=e271]:
                        - row [ref=e272]:
                          - columnheader "Period" [ref=e273]
                          - columnheader "Fund" [ref=e274]
                          - columnheader "Benchmark" [ref=e275]
                          - columnheader "Value added" [ref=e276]
                      - rowgroup [ref=e277]:
                        - row [ref=e278]:
                          - cell "1 month" [ref=e279]: 1M
                          - cell "−0.11%" [ref=e281]
                          - cell "0.38%" [ref=e282]
                          - cell "−0.49%" [ref=e283]
                        - row [ref=e284]:
                          - cell "3 months" [ref=e285]: 3M
                          - cell "−0.57%" [ref=e287]
                          - cell "−0.29%" [ref=e288]
                          - cell "−0.27%" [ref=e289]
                        - row [ref=e290]:
                          - cell "Year to date" [ref=e291]: YTD
                          - cell "0.02%" [ref=e293]
                          - cell "−0.31%" [ref=e294]
                          - cell "+0.33%" [ref=e295]
                        - row [ref=e296]:
                          - cell "1 year" [ref=e297]: 1Y
                          - cell "1.16%" [ref=e299]
                          - cell "0.24%" [ref=e300]
                          - cell "+0.92%" [ref=e301]
                        - row [ref=e302]:
                          - cell "2 years *" [ref=e303]:
                            - generic [ref=e304]: 2 years
                            - text: 2Y*
                          - cell "0.91%" [ref=e305]
                          - cell [ref=e306]
                          - cell [ref=e307]
                        - row [ref=e308]:
                          - cell "3 years *" [ref=e309]:
                            - generic [ref=e310]: 3 years
                            - text: 3Y*
                          - cell "1.14%" [ref=e311]
                          - cell [ref=e312]
                          - cell [ref=e313]
                        - row [ref=e314]:
                          - cell "Since inception (Oct 5, 2021) *" [ref=e315]:
                            - generic [ref=e316]: Since inception (Oct 5, 2021)
                            - text: SI*
                          - cell "1.96%" [ref=e317]
                          - cell [ref=e318]
                          - cell [ref=e319]
                    - paragraph [ref=e320]: "* Periods over one year are annualized."
              - complementary [ref=e321]:
                - generic [ref=e322]:
                  - generic [ref=e323]:
                    - heading "Morningstar Rating™" [level=3] [ref=e324]
                    - link "Awards and rankings" [ref=e327] [cursor=pointer]:
                      - /url: "#awards"
                  - region "Morningstar Rating™" [ref=e330]:
                    - generic [ref=e331]:
                      - img "Morningstar" [ref=e332]
                      - 'img "Morningstar Rating™: 5 stars" [ref=e333]'
                      - paragraph [ref=e334]: "Morningstar Rating™: 5 stars"
                    - paragraph [ref=e335]: Series F, as of October 1, 2026
                    - generic [ref=e336]:
                      - 'link "Source: Morningstar (opens in a new tab)" [ref=e337] [cursor=pointer]':
                        - /url: https://global.morningstar.com/en-ca/investments/funds/0P0001NL0N/quote
                        - text: "Source: Morningstar"
                        - generic [ref=e342]: (opens in a new tab)
                      - button "Rating methodology and attribution" [ref=e344] [cursor=pointer]
                - generic [ref=e348]:
                  - heading "Key facts" [level=3] [ref=e350]
                  - generic [ref=e352]:
                    - generic [ref=e353]:
                      - term [ref=e354]: Legal name
                      - definition [ref=e355]: Nymbus Monthly Income Fund
                    - generic [ref=e356]:
                      - term [ref=e357]: Vehicle
                      - definition [ref=e358]: Mutual fund
                    - generic [ref=e359]:
                      - term [ref=e360]: Asset class
                      - definition [ref=e361]: Short-term fixed income
                    - generic [ref=e362]:
                      - term [ref=e363]: Benchmark
                      - definition [ref=e364]: FTSE Canada Short Term Corporate Bond Index
                    - generic [ref=e365]:
                      - term [ref=e366]: Fund launch
                      - definition [ref=e367]: October 5, 2021
                    - generic [ref=e368]:
                      - term [ref=e369]: Track record since
                      - definition [ref=e370]: October 2021
                    - generic [ref=e371]:
                      - term [ref=e372]: Currency
                      - definition [ref=e373]: CAD, USD
                    - generic [ref=e374]:
                      - term [ref=e375]: Series
                      - definition [ref=e376]: FP, F USD, A, I, J, F
                    - generic [ref=e377]:
                      - term [ref=e378]: Risk rating
                      - definition [ref=e379]: Low to medium
                    - generic [ref=e380]:
                      - term [ref=e381]: Returns shown
                      - definition [ref=e382]: Net of fees
                    - generic [ref=e383]:
                      - term [ref=e384]: CIFSC category
                      - definition [ref=e385]: Canadian Core Plus Fixed Income
                - generic [ref=e386]:
                  - heading "Fees and expenses" [level=3] [ref=e388]
                  - paragraph [ref=e390]: Fees and expenses are set out in the fund facts and the simplified prospectus.
            - generic [ref=e391]:
              - heading "Series and Fundserv codes" [level=3] [ref=e393]
              - table [ref=e396]:
                - caption [ref=e397]: Series and Fundserv codes
                - rowgroup [ref=e398]:
                  - row [ref=e399]:
                    - columnheader "Series" [ref=e400]
                    - columnheader "Fundserv" [ref=e401]
                    - columnheader "Offered under" [ref=e402]
                    - columnheader "Currency" [ref=e403]
                    - columnheader "Series launch" [ref=e404]
                    - columnheader "NAV per unit" [ref=e405]
                    - columnheader "Daily change" [ref=e406]
                    - columnheader "Valuation date" [ref=e407]
                - rowgroup [ref=e408]:
                  - row [ref=e409]:
                    - cell "J (Series shown in the header)" [ref=e410]:
                      - text: J
                      - generic [ref=e412]: (Series shown in the header)
                    - cell [ref=e413]:
                      - text: Fundserv
                      - code [ref=e414]: LDM061
                    - cell "Offered under" [ref=e415]
                    - cell "Currency CAD" [ref=e416]
                    - cell "Series launch Oct 5, 2021" [ref=e417]
                    - cell "NAV per unit $10.3943" [ref=e418]
                    - cell "Daily change −0.08%" [ref=e419]
                    - cell "Valuation date Sep 28, 2026" [ref=e420]
                  - row [ref=e421]:
                    - cell "FP" [ref=e422]
                    - cell [ref=e423]:
                      - text: Fundserv
                      - code [ref=e424]: LDM001
                    - cell "Offered under Offering memorandum class" [ref=e425]:
                      - text: Offered under
                      - generic [ref=e426]: Offering memorandum class
                    - cell "Currency CAD" [ref=e427]
                    - cell "Series launch Oct 5, 2021" [ref=e428]
                    - cell "NAV per unit $10.1905" [ref=e429]
                    - cell "Daily change +0.11%" [ref=e430]
                    - cell "Valuation date Sep 28, 2026" [ref=e431]
                  - row [ref=e432]:
                    - cell "F USD" [ref=e433]
                    - cell [ref=e434]:
                      - text: Fundserv
                      - code [ref=e435]: LDM011
                    - cell "Offered under" [ref=e436]
                    - cell "Currency USD" [ref=e437]
                    - cell "Series launch Jun 2, 2025" [ref=e438]
                    - cell "NAV per unit US$10.3711" [ref=e439]
                    - cell "Daily change" [ref=e440]
                    - cell "Valuation date Sep 28, 2026" [ref=e441]
                  - row [ref=e442]:
                    - cell "A" [ref=e443]
                    - cell [ref=e444]:
                      - text: Fundserv
                      - code [ref=e445]: LDM021
                    - cell "Offered under" [ref=e446]
                    - cell "Currency CAD" [ref=e447]
                    - cell "Series launch Mar 2, 2026" [ref=e448]
                    - cell "NAV per unit $9.7714" [ref=e449]
                    - cell "Daily change −0.21%" [ref=e450]
                    - cell "Valuation date Sep 28, 2026" [ref=e451]
                  - row [ref=e452]:
                    - cell "I" [ref=e453]
                    - cell [ref=e454]:
                      - text: Fundserv
                      - code [ref=e455]: LDM031
                    - cell "Offered under" [ref=e456]
                    - cell "Currency CAD" [ref=e457]
                    - cell "Series launch Mar 6, 2023" [ref=e458]
                    - cell "NAV per unit $10.8684" [ref=e459]
                    - cell "Daily change −0.20%" [ref=e460]
                    - cell "Valuation date Sep 28, 2026" [ref=e461]
                  - row [ref=e462]:
                    - cell "F" [ref=e463]
                    - cell [ref=e464]:
                      - text: Fundserv
                      - code [ref=e465]: LDM081
                    - cell "Offered under Prospectus class" [ref=e466]:
                      - text: Offered under
                      - generic [ref=e467]: Prospectus class
                    - cell "Currency CAD" [ref=e468]
                    - cell "Series launch Mar 1, 2024" [ref=e469]
                    - cell "NAV per unit $10.0397" [ref=e470]
                    - cell "Daily change −0.19%" [ref=e471]
                    - cell "Valuation date Sep 28, 2026" [ref=e472]
            - generic [ref=e473]:
              - generic [ref=e474]:
                - heading "Investment team" [level=3] [ref=e475]
                - link "Meet the team" [ref=e478] [cursor=pointer]:
                  - /url: /team
              - paragraph [ref=e481]: The fund is managed by the Nymbus Capital investment team.
      - region [ref=e482]:
        - generic [ref=e483]:
          - generic [ref=e484]:
            - paragraph [ref=e486]: Monthly Income Fund
            - heading "Built for monthly income" [level=2] [ref=e488]:
              - generic [aria-hidden] [ref=e489]:
                - generic [ref=e490]: Built
                - generic [ref=e491]: for
                - generic [ref=e492]: monthly
                - generic [ref=e493]: income
            - generic [ref=e494]: What shapes the fund.
          - generic [ref=e496]:
            - generic [ref=e497]:
              - heading "Monthly distributions" [level=3] [ref=e503]
              - paragraph [ref=e505]: Designed to pay every month. Distributions are not guaranteed, may change and may include a return of capital.
            - generic [ref=e506]:
              - heading "Short maturities" [level=3] [ref=e511]
              - paragraph [ref=e513]: "Low rate sensitivity. Current duration: Portfolio tab."
            - generic [ref=e514]:
              - heading "Systematic credit selection" [level=3] [ref=e523]
              - paragraph [ref=e525]: Credit risk weighed against yield, issuer by issuer.
            - generic [ref=e526]:
              - heading "Protective overlay" [level=3] [ref=e531]
              - paragraph [ref=e533]: A protective overlay designed to have low correlation with bonds in down months and to offset part of bond losses when volatility rises; it may not do so and can lose money. The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.
      - generic [ref=e536]:
        - heading "Interested in the fund?" [level=2] [ref=e537]:
          - generic [aria-hidden] [ref=e538]:
            - generic [ref=e539]: Interested
            - generic [ref=e540]: in
            - generic [ref=e541]: the
            - generic [ref=e542]: fund?
        - paragraph [ref=e544]: Our team can walk you through the fund, its series and how to invest.
        - generic [ref=e546]:
          - link "Contact our team" [ref=e547] [cursor=pointer]:
            - /url: /contact
          - link "All strategies" [ref=e550] [cursor=pointer]:
            - /url: /strategies
      - region [ref=e551]:
        - generic [ref=e552]:
          - generic [ref=e553]:
            - paragraph [ref=e555]: Explore
            - heading "Other strategies" [level=2] [ref=e557]:
              - generic [aria-hidden] [ref=e558]:
                - generic [ref=e559]: Other
                - generic [ref=e560]: strategies
          - generic [ref=e561]:
            - link "Core fixed income Sustainable Enhanced Bonds Canadian core bonds, managed systematically View Nymbus Sustainable Enhanced Bonds Fund" [ref=e562] [cursor=pointer]:
              - /url: /strategies/sustainable-enhanced-bonds
              - generic [ref=e564]: Core fixed income
              - generic [ref=e565]: Sustainable Enhanced Bonds
              - generic [ref=e566]: Canadian core bonds, managed systematically
              - generic [ref=e567]:
                - text: View
                - generic [ref=e568]: Nymbus Sustainable Enhanced Bonds Fund
            - link "Alternative strategies Multi-Strategy Four systematic strategies designed to have low correlation with one another View Nymbus Multi-Strategy Fund" [ref=e571] [cursor=pointer]:
              - /url: /strategies/multi-strategy
              - generic [ref=e573]: Alternative strategies
              - generic [ref=e574]: Multi-Strategy
              - generic [ref=e575]: Four systematic strategies designed to have low correlation with one another
              - generic [ref=e576]:
                - text: View
                - generic [ref=e577]: Nymbus Multi-Strategy Fund
            - link "Protective overlay (managed accounts) Global Minimum Volatility A protective futures overlay designed to have low correlation with bonds in down months View Nymbus Global Minimum Volatility" [ref=e580] [cursor=pointer]:
              - /url: /strategies/global-minimum-volatility
              - generic [ref=e582]: Protective overlay (managed accounts)
              - generic [ref=e583]: Global Minimum Volatility
              - generic [ref=e584]: A protective futures overlay designed to have low correlation with bonds in down months
              - generic [ref=e585]:
                - text: View
                - generic [ref=e586]: Nymbus Global Minimum Volatility
      - region [ref=e589]:
        - generic [ref=e591]:
          - generic [ref=e592]:
            - paragraph [ref=e593]: Important information
            - heading "Disclosures" [level=2] [ref=e595]
          - generic [ref=e596]:
            - paragraph [ref=e597]: The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.
            - paragraph [ref=e598]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
            - paragraph [ref=e599]: "Performance shown: Series J, net of fees · Benchmark: FTSE Canada Short Term Corporate Bond Index"
            - paragraph [ref=e600]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
            - generic [ref=e601]:
              - generic [ref=e603] [cursor=pointer]:
                - paragraph [ref=e604]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
                - paragraph [ref=e605]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
                - paragraph [ref=e606]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
                - paragraph [ref=e607]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
                - paragraph [ref=e608]:
                  - generic [ref=e610]: Updated daily from Nymbus’ data platform; portfolio data from the daily holdings as of September 28, 2026; sustainability metrics from the monthly factsheet of August 2026. performance as of August 2026 · net asset values as of Sep 28, 2026.
              - button "Show full text" [ref=e611] [cursor=pointer]
  - contentinfo [ref=e615]:
    - generic [ref=e616]:
      - generic [ref=e617]:
        - generic [ref=e618]:
          - link "Nymbus Capital, home" [ref=e619] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e620]
          - paragraph [ref=e629]: Montreal portfolio manager building systematic fixed income and alternative strategies.
          - generic [ref=e630]:
            - generic [ref=e631]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e632] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e633]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e634] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e635]:
          - heading "Strategies" [level=2] [ref=e636]
          - list [ref=e637]:
            - listitem [ref=e638]:
              - link "Monthly Income" [ref=e639] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e641]:
              - link "Sustainable Enhanced Bonds" [ref=e642] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e644]:
              - link "Multi-Strategy" [ref=e645] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e647]:
              - link "Global Minimum Volatility" [ref=e648] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e650]:
          - heading "Company" [level=2] [ref=e651]
          - list [ref=e652]:
            - listitem [ref=e653]:
              - link "About & team" [ref=e654] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e655]:
              - link "Approach" [ref=e656] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e657]:
              - link "Core concepts" [ref=e658] [cursor=pointer]:
                - /url: /core-concepts
            - listitem [ref=e659]:
              - link "Sustainability" [ref=e660] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e661]:
              - link "Solutions" [ref=e662] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e663]:
          - heading "Resources" [level=2] [ref=e664]
          - list [ref=e665]:
            - listitem [ref=e666]:
              - link "Contact" [ref=e667] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e668]:
              - link "Privacy policy" [ref=e669] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e670]:
              - link "Complaints & code of ethics" [ref=e671] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e672]:
              - link "LinkedIn" [ref=e673] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e678]:
        - generic [ref=e680] [cursor=pointer]:
          - paragraph [ref=e681]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
          - paragraph [ref=e682]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
          - paragraph [ref=e683]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
          - paragraph [ref=e684]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
          - paragraph [ref=e685]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
          - paragraph [ref=e686]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative. Unless another variant is selected on the strategy page, the returns shown are those of the 6% downside volatility variant; the strategy is also offered with 3% and 9% downside volatility targets, whose returns differ.
          - paragraph [ref=e687]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
        - button "Show full text" [ref=e688] [cursor=pointer]
      - generic [ref=e692]:
        - generic [ref=e693]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e694]: PRI signatory
  - alert [ref=e695]
```

# Test source

```ts
  376 |   // Monthly Income F has its own return series: the performance panel is server-rendered with it
  377 |   await expect(page.getByTestId("perf-context")).toBeAttached();
  378 |   await expect(page.getByTestId("perf-soon")).toHaveCount(0);
  379 |   await expect(page.getByTestId("holdings-table")).toBeVisible();
  380 |   await ctx.close();
  381 | });
  382 | 
  383 | test("legacy slug redirects to monthly income", async ({ page }) => {
  384 |   const res = await page.goto("/strategies/sustainable-enhanced-short-term-bonds");
  385 |   expect(res?.status()).toBe(200);
  386 |   await expect(page).toHaveURL(/\/strategies\/monthly-income$/);
  387 |   await expect(page.getByTestId("nav-card")).toBeVisible();
  388 | });
  389 | 
  390 | test("registry alias redirects to the canonical slug", async ({ page }) => {
  391 |   await page.goto("/strategies/gmv");
  392 |   await expect(page).toHaveURL(/\/strategies\/global-minimum-volatility$/);
  393 | });
  394 | 
  395 | test("unknown slug is a 404", async ({ page }) => {
  396 |   const res = await page.goto("/strategies/no-such-fund");
  397 |   expect(res?.status()).toBe(404);
  398 | });
  399 | 
  400 | test("French: labels, names and number formatting", async ({ page }) => {
  401 |   await page.goto("/strategies/monthly-income");
  402 |   await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  403 |   await page.reload();
  404 |   await expect(page.getByRole("heading", { level: 1, name: "Fonds Nymbus Revenu Mensuel" })).toBeVisible();
  405 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="overview"]')).toHaveText("Aperçu");
  406 |   // class F (LDM081) has its own returns, computed from its daily NAV chain
  407 |   await expect(page.getByTestId("basis")).toContainText(/Série F(?![A-Za-z])/);
  408 |   // a class launched less than 12 months ago: its NAV, and the chosen class's returns under that class's own label
  409 |   await page.getByTestId("series-LDM021").click();
  410 |   await expect(page.getByTestId("nav-fundserv")).toHaveText("LDM021");
  411 |   await expect(page.getByTestId("basis")).toContainText(/Série F(?![A-Za-z])/);
  412 |   await expect(page.locator("body")).not.toContainText(
  413 |     /bientôt|à venir|non disponible|pas disponible|seront présentés lorsque/,
  414 |   );
  415 |   await page.getByTestId("series-LDM001").click();
  416 |   await expect(page.getByTestId("basis")).toContainText("après déduction des frais");
  417 |   await expect(page.getByTestId("class-type")).toHaveText("Série à notice d’offre");
  418 |   // decimal comma and a no-break space before % / $
  419 |   await expect(page.getByTestId("badge-SI").locator(".fr-v")).toHaveText(/^[+−]?\d+,\d{2}\s%$/);
  420 |   await expect(page.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^\d+,\d{4}\s\$$/);
  421 |   await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="portfolio"]').click();
  422 |   await expect(page.getByTestId("portfolio-source")).toContainText("Données quotidiennes du portefeuille");
  423 |   await expect(page.getByTestId("portfolio-asof")).toHaveText("au 28 septembre 2026");
  424 |   await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="distributions"]').click();
  425 |   await expect(page.getByTestId("dist-class-LDM001").getByTestId("dist-last-amount")).toHaveText(/^0,\d{6}\s\$$/);
  426 |   await expect(page.getByTestId("provenance")).toContainText(
  427 |     "données de portefeuille selon les positions quotidiennes au 28 septembre 2026",
  428 |   );
  429 | });
  430 | 
  431 | /* ------------------------------------------------------------------ classes, variants, awards, calendar labels */
  432 | 
  433 | test("class selector: returns follow the class; F is the default; a young class shows its NAV and F's returns, labelled F", async ({
  434 |   page,
  435 | }) => {
  436 |   await page.goto("/strategies/sustainable-enhanced-bonds");
  437 |   const card = page.getByTestId("nav-card");
  438 |   const strip = page.getByTestId("return-strip");
  439 |   await expect(card.getByTestId("series-LDM201")).toHaveAttribute("aria-checked", "true");
  440 |   await expect(page.getByTestId("basis")).toContainText("Series F");
  441 |   const f = await strip.getByTestId("badge-SI").locator(".fr-v").innerText();
  442 |   await card.getByTestId("series-LDM202").click();
  443 |   await expect(page.getByTestId("basis")).toContainText("Series H");
  444 |   const h = await strip.getByTestId("badge-SI").locator(".fr-v").innerText();
  445 |   expect(h, "class H shows its own returns").not.toBe(f);
  446 |   // a class launched less than 12 months ago (regulatory minimum): never offered for returns, never a notice; its
  447 |   // NAV is shown and the returns are the chosen class's (F), under F's own label
  448 |   await card.getByTestId("series-LDM205").click();
  449 |   await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM205");
  450 |   await expect(page.getByTestId("basis")).toContainText(/Series F(?![A-Za-z])/);
  451 |   await expect(page.getByTestId("basis")).not.toContainText(/Series A(?![A-Za-z])/);
  452 |   await expect(strip.getByTestId("badge-SI").locator(".fr-v")).toHaveText(f);
  453 |   await expect(page.locator("body")).not.toContainText(
  454 |     /coming soon|will be shown once|not available|could not be verified/i,
  455 |   );
  456 |   await openTab(page, "performance");
  457 |   await expect(page.getByTestId("perf-context")).toContainText(/Series F(?![A-Za-z])/);
  458 |   await expect(page.getByTestId("growth")).toBeVisible();
  459 |   await expect(page.getByTestId("calendar")).toBeVisible();
  460 |   await expect(page.getByTestId("risk")).toBeVisible();
  461 | });
  462 | 
  463 | test("every series of a fund: own figures when it has them, a withheld period / year is omitted, no notice (EN + FR)", async ({
  464 |   page,
  465 | }) => {
  466 |   await page.goto("/strategies/monthly-income");
  467 |   const card = page.getByTestId("nav-card");
  468 |   const strip = page.getByTestId("return-strip");
  469 |   // class J: since its inception (Oct 5, 2021); a synthetic bad valuation print (March 2022) and a day the classes disagree
  470 |   // (September 2023) are withheld: since inception and 3 years are not shown at all (no row, no dash), 1 year is a number
  471 |   await card.getByTestId("series-LDM061").click();
  472 |   await expect(page.getByTestId("basis")).toContainText(/Series J(?![A-Za-z])/);
  473 |   await expect(card.getByTestId("nav-inception")).toHaveText("Oct 5, 2021");
  474 |   const rows = page.getByTestId("overview-returns").locator("tbody tr");
  475 |   await expect(rows.filter({ hasText: "1 year" }).locator("td").nth(1)).toHaveText(/^[−-]?\d+\.\d{2}%$/);
> 476 |   await expect(rows.filter({ hasText: "3 years" })).toHaveCount(0);
      |                                                     ^ Error: expect(locator).toHaveCount(expected) failed
  477 |   await expect(rows.filter({ hasText: "Since inception" })).toHaveCount(0);
  478 |   await expect(page.getByTestId("overview-returns")).not.toContainText("—");
  479 |   await expect(page.getByTestId("overview-withheld-note")).toHaveCount(0);
  480 |   await expect(strip.getByTestId("badge-1Y")).toBeVisible();
  481 |   await expect(strip.getByTestId("badge-SI")).toHaveCount(0);
  482 |   await expect(strip).not.toContainText("—");
  483 |   await expect(strip.getByTestId("strip-withheld-note")).toHaveCount(0);
  484 |   await openTab(page, "performance");
  485 |   await expect(page.getByTestId("perf-inception")).toContainText("Series inception: October 5, 2021");
  486 |   await expect(page.getByTestId("perf-withheld-note")).toHaveCount(0);
  487 |   await page.getByTestId("growth").scrollIntoViewIfNeeded();
  488 |   await expect(page.getByTestId("growth-from")).toHaveText("Starts on September 30, 2023.");
  489 |   await page.getByTestId("calendar").scrollIntoViewIfNeeded();
  490 |   await expect(page.getByTestId("calendar-table")).not.toContainText("—");
  491 |   // the heat map: the years with a withheld month (2022, 2023) are not shown; no empty month inside the record
  492 |   await page.getByTestId("heatmap").scrollIntoViewIfNeeded();
  493 |   const years = page.getByTestId("heatmap").locator("tbody th.y");
  494 |   await expect(years.first()).toBeVisible();
  495 |   const shown = await years.allInnerTexts();
  496 |   expect(shown).not.toContain("2022");
  497 |   expect(shown).not.toContain("2023");
  498 |   expect(shown).toContain("2024");
  499 |   await expect(page.getByTestId("heat-withheld")).toHaveCount(0);
  500 |   await expect(page.locator("body")).not.toContainText(/could not be verified|figure not shown/i);
  501 |   // class F: a series with 12 months and no withheld month: every figure it has the history for
  502 |   await openTab(page, "overview");
  503 |   await card.getByTestId("series-LDM081").click();
  504 |   await expect(rows.filter({ hasText: "Since inception" }).locator("td").nth(1)).toHaveText(/^[−-]?\d+\.\d{2}%$/);
  505 |   // its first month is partial (from Mar 1, 2024): marked in the heat map; risk statistics from its first complete month
  506 |   await openTab(page, "performance");
  507 |   await page.getByTestId("heatmap").scrollIntoViewIfNeeded();
  508 |   await expect(page.getByTestId("heat-partial")).toHaveCount(1);
  509 |   await page.getByTestId("risk").scrollIntoViewIfNeeded();
  510 |   await expect(page.getByTestId("risk-window")).toHaveText("From Apr 2024");
  511 |   await openTab(page, "overview");
  512 |   // the track-record series (FP): its since-inception figure names the track-record start, never a series inception
  513 |   await card.getByTestId("series-LDM001").click();
  514 |   await expect(card.getByTestId("nav-inception")).toHaveCount(0);
  515 |   await expect(rows.filter({ hasText: "Since track-record start" }).locator("td").first()).toContainText(
  516 |     "Since track-record start (Jan 2019)",
  517 |   );
  518 |   // class A (launched less than 12 months ago) and the US-dollar class (no distribution-aware returns): their NAV, the
  519 |   // chosen class's returns under its own label (F), and never a sentence about why
  520 |   for (const code of ["LDM021", "LDM011"]) {
  521 |     await card.getByTestId(`series-${code}`).click();
  522 |     await expect(card.getByTestId("nav-fundserv")).toHaveText(code);
  523 |     await expect(page.getByTestId("basis")).toContainText(/Series F(?![A-Za-z])/);
  524 |     await expect(strip.getByTestId("badge-SI")).toBeVisible();
  525 |     await expect(page.getByTestId("overview-returns")).toBeVisible();
  526 |     await expect(page.locator("body")).not.toContainText(
  527 |       /coming soon|will be shown once|not available|figures are not shown/i,
  528 |     );
  529 |   }
  530 |   // the series table gives every series' inception
  531 |   await expect(page.getByTestId("class-inception-LDM031")).toHaveText("Mar 6, 2023");
  532 |   // French
  533 |   await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  534 |   await page.reload();
  535 |   await page.getByTestId("nav-card").getByTestId("series-LDM021").click();
  536 |   await expect(page.getByTestId("basis")).toContainText(/Série F(?![A-Za-z])/);
  537 |   await expect(page.locator("body")).not.toContainText(
  538 |     /bientôt|à venir|non disponible|pas disponible|seront présentés lorsque|n’a pas pu être vérifié/,
  539 |   );
  540 | });
  541 | 
  542 | test("class types: only classes whose type is known are labelled, with a disclosure sentence", async ({ page }) => {
  543 |   await page.goto("/strategies/monthly-income");
  544 |   const card = page.getByTestId("nav-card");
  545 |   await expect(card.getByTestId("class-type")).toHaveText("Prospectus class");
  546 |   await expect(card.getByTestId("class-type-note")).toContainText("simplified prospectus");
  547 |   await card.getByTestId("series-LDM001").click();
  548 |   await expect(card.getByTestId("class-type")).toHaveText("Offering memorandum class");
  549 |   await expect(card.getByTestId("class-type-note")).toContainText("offering memorandum");
  550 |   await expect(page.getByTestId("returns-class-type")).toHaveText("Offering memorandum class");
  551 |   // unknown type: nothing is said
  552 |   await card.getByTestId("series-LDM021").click();
  553 |   await expect(card.getByTestId("class-type")).toHaveCount(0);
  554 |   await expect(card.getByTestId("class-type-note")).toHaveCount(0);
  555 |   // the class table: the badge on the two classes whose type is known, none elsewhere
  556 |   await expect(page.getByTestId("class-type-LDM081")).toHaveText("Prospectus class");
  557 |   await expect(page.getByTestId("class-type-LDM001")).toHaveText("Offering memorandum class");
  558 |   await expect(page.getByTestId("class-type-LDM021")).toHaveCount(0);
  559 |   // SEB: no class has a known type yet: no label, no column
  560 |   await page.goto("/strategies/sustainable-enhanced-bonds");
  561 |   await expect(page.getByTestId("class-type")).toHaveCount(0);
  562 |   await expect(page.getByTestId("classes-table").locator("thead")).not.toContainText("Offered under");
  563 | });
  564 | 
  565 | test("Global Minimum Volatility: 3 / 6 / 9 % variants, default 6, no class selector, no NAV, no distributions", async ({
  566 |   page,
  567 | }) => {
  568 |   await page.goto("/strategies/global-minimum-volatility");
  569 |   const sel = page.getByTestId("variant-selector");
  570 |   await expect(sel.getByTestId("variant-6")).toHaveAttribute("aria-checked", "true");
  571 |   await expect(sel.locator('[role="radio"]')).toHaveCount(3);
  572 |   await expect(page.getByTestId("nav-card")).toHaveCount(0);
  573 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="distributions"]')).toHaveCount(0);
  574 |   const read = async () => page.getByTestId("return-strip").getByTestId("badge-SI").locator(".fr-v").innerText();
  575 |   // the value counts up: wait until it is non-zero and stable
  576 |   const si = async () => {
```