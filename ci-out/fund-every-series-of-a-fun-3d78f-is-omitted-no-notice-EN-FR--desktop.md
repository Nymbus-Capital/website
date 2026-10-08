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
    23 × locator resolved to 1 element
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
      - navigation "Primary" [ref=e15]:
        - list [ref=e16]:
          - listitem [ref=e17]:
            - link "Strategies" [ref=e18] [cursor=pointer]:
              - /url: /strategies
          - listitem [ref=e21]:
            - link "Approach" [ref=e22] [cursor=pointer]:
              - /url: /approach
          - listitem [ref=e23]:
            - link "Core concepts" [ref=e24] [cursor=pointer]:
              - /url: /core-concepts
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
              - generic [ref=e52]: Monthly Income
        - generic [ref=e53]:
          - generic [ref=e54]:
            - paragraph [ref=e56]: Short-term fixed income
            - heading "Nymbus Monthly Income Fund" [level=1] [ref=e58]:
              - generic [aria-hidden] [ref=e59]:
                - generic [ref=e60]: Nymbus
                - generic [ref=e61]: Monthly
                - generic [ref=e62]: Income
                - generic [ref=e63]: Fund
            - paragraph [ref=e65]: Monthly income from short-term corporate bonds
            - paragraph [ref=e67]: Short-term Canadian corporate bonds selected by our two-system process, with a protective futures overlay designed to have low correlation with bonds in down months and to offset part of bond losses; it may not do so and can lose money. Distributions are not guaranteed, may change and may include a return of capital.
            - generic [ref=e68]:
              - generic [ref=e69]: Mutual fund
              - generic [ref=e71]:
                - generic [ref=e72]: Risk
                - text: Low to medium
              - generic "Illustrative figures only, not actual performance" [ref=e79]: Sample data
            - generic [ref=e81]:
              - link "Contact us" [ref=e82] [cursor=pointer]:
                - /url: /contact
              - link "Fund documents" [ref=e85] [cursor=pointer]:
                - /url: "#documents"
          - generic [ref=e90]:
            - generic [ref=e91]:
              - generic [ref=e92]: Net asset value per unit
              - generic [ref=e93]: As of Sep 28, 2026
            - radiogroup "Choose a series" [ref=e96]:
              - radio "Series F" [ref=e97] [cursor=pointer]:
                - generic [ref=e98]: Series
                - text: F
              - radio "Series FP" [ref=e99] [cursor=pointer]:
                - generic [ref=e100]: Series
                - text: FP
              - radio "Series F USD" [ref=e101] [cursor=pointer]:
                - generic [ref=e102]: Series
                - text: F USD
              - radio "Series A" [ref=e103] [cursor=pointer]:
                - generic [ref=e104]: Series
                - text: A
              - radio "Series I" [ref=e105] [cursor=pointer]:
                - generic [ref=e106]: Series
                - text: I
              - radio "Series J" [checked] [active] [ref=e107] [cursor=pointer]:
                - generic [ref=e108]: Series
                - text: J
            - generic [ref=e110]:
              - generic [ref=e111]: $10.3943
              - generic [aria-hidden] [ref=e112]:
                - generic [ref=e113]: $
                - generic [ref=e115]:
                  - generic [ref=e116]: "0"
                  - generic [ref=e117]: "1"
                  - generic [ref=e118]: "2"
                  - generic [ref=e119]: "3"
                  - generic [ref=e120]: "4"
                  - generic [ref=e121]: "5"
                  - generic [ref=e122]: "6"
                  - generic [ref=e123]: "7"
                  - generic [ref=e124]: "8"
                  - generic [ref=e125]: "9"
                - generic [ref=e127]:
                  - generic [ref=e128]: "0"
                  - generic [ref=e129]: "1"
                  - generic [ref=e130]: "2"
                  - generic [ref=e131]: "3"
                  - generic [ref=e132]: "4"
                  - generic [ref=e133]: "5"
                  - generic [ref=e134]: "6"
                  - generic [ref=e135]: "7"
                  - generic [ref=e136]: "8"
                  - generic [ref=e137]: "9"
                - generic [ref=e138]: .
                - generic [ref=e140]:
                  - generic [ref=e141]: "0"
                  - generic [ref=e142]: "1"
                  - generic [ref=e143]: "2"
                  - generic [ref=e144]: "3"
                  - generic [ref=e145]: "4"
                  - generic [ref=e146]: "5"
                  - generic [ref=e147]: "6"
                  - generic [ref=e148]: "7"
                  - generic [ref=e149]: "8"
                  - generic [ref=e150]: "9"
                - generic [ref=e152]:
                  - generic [ref=e153]: "0"
                  - generic [ref=e154]: "1"
                  - generic [ref=e155]: "2"
                  - generic [ref=e156]: "3"
                  - generic [ref=e157]: "4"
                  - generic [ref=e158]: "5"
                  - generic [ref=e159]: "6"
                  - generic [ref=e160]: "7"
                  - generic [ref=e161]: "8"
                  - generic [ref=e162]: "9"
                - generic [ref=e164]:
                  - generic [ref=e165]: "0"
                  - generic [ref=e166]: "1"
                  - generic [ref=e167]: "2"
                  - generic [ref=e168]: "3"
                  - generic [ref=e169]: "4"
                  - generic [ref=e170]: "5"
                  - generic [ref=e171]: "6"
                  - generic [ref=e172]: "7"
                  - generic [ref=e173]: "8"
                  - generic [ref=e174]: "9"
                - generic [ref=e176]:
                  - generic [ref=e177]: "0"
                  - generic [ref=e178]: "1"
                  - generic [ref=e179]: "2"
                  - generic [ref=e180]: "3"
                  - generic [ref=e181]: "4"
                  - generic [ref=e182]: "5"
                  - generic [ref=e183]: "6"
                  - generic [ref=e184]: "7"
                  - generic [ref=e185]: "8"
                  - generic [ref=e186]: "9"
            - paragraph [ref=e187]:
              - generic [ref=e190]: −0.0081 (−0.08%)
              - generic [ref=e191]: vs previous valuation day
            - generic [ref=e192]:
              - generic [ref=e193]:
                - term [ref=e194]: Series
                - definition [ref=e195]: J
              - generic [ref=e196]:
                - term [ref=e197]: Fundserv
                - definition [ref=e198]:
                  - code [ref=e199]: LDM061
              - generic [ref=e200]:
                - term [ref=e201]: Currency
                - definition [ref=e202]: CAD
              - generic [ref=e203]:
                - term [ref=e204]: Series inception
                - definition [ref=e205]: Oct 5, 2021
              - generic [ref=e206]:
                - term [ref=e207]: Fund launch
                - definition [ref=e208]: October 5, 2021
              - generic [ref=e209]:
                - term [ref=e210]: Benchmark
                - definition [ref=e211]: FTSE Canada Short Term Corporate Bond Index
      - region [ref=e212]:
        - generic [ref=e214]:
          - generic [ref=e215]:
            - heading "Returns" [level=2] [ref=e216]
            - paragraph [ref=e217]: Series J, net of fees · as of August 31, 2026
          - list [ref=e218]:
            - listitem [ref=e219]:
              - generic "1 month" [ref=e220]: 1M
              - generic [ref=e222]: −0.11%
            - listitem [ref=e223]:
              - generic "3 months" [ref=e224]: 3M
              - generic [ref=e226]: −0.57%
            - listitem [ref=e227]:
              - generic "Year to date" [ref=e228]: YTD
              - generic [ref=e230]: +0.02%
            - listitem [ref=e231]:
              - generic "1 year" [ref=e232]: 1Y
              - generic [ref=e234]: +1.16%
            - listitem [ref=e235]:
              - generic "3 years" [ref=e236]:
                - text: 3Y
                - superscript [aria-hidden] [ref=e238]: "*"
              - generic [ref=e239]: +1.14%
            - listitem [ref=e240]:
              - generic "Since inception (Oct 5, 2021)" [ref=e241]:
                - text: SI
                - superscript [aria-hidden] [ref=e243]: "*"
              - generic [ref=e244]: +1.96%
          - paragraph [ref=e245]: "* Periods over one year are annualized."
      - generic [ref=e246]:
        - tablist "Fund information" [ref=e249]:
          - tab "Overview" [selected] [ref=e250] [cursor=pointer]
          - tab "Performance" [ref=e251] [cursor=pointer]
          - tab "Portfolio" [ref=e252] [cursor=pointer]
          - tab "Distributions" [ref=e253] [cursor=pointer]
          - tab "Awards and rankings" [ref=e254] [cursor=pointer]
          - tab "Documents" [ref=e255] [cursor=pointer]
        - tabpanel "Overview" [ref=e256]:
          - heading "Overview" [level=2] [ref=e257]
          - generic [ref=e258]:
            - generic [ref=e259]:
              - generic [ref=e260]:
                - generic [ref=e261]:
                  - heading "What the fund does" [level=3] [ref=e263]
                  - paragraph [ref=e265]: Monthly income from short-term Canadian corporate bonds, with low rate sensitivity. Distributions are not guaranteed, may change and may include a return of capital.
                - generic [ref=e266]:
                  - heading "Investment approach" [level=3] [ref=e268]
                  - list [ref=e270]:
                    - listitem [ref=e271]: Mainly short-term Canadian corporate bonds
                    - listitem [ref=e272]: Selected by our two-system process
                    - listitem [ref=e273]: Credit risk and relative value, bond by bond
                  - paragraph [ref=e274]: The protective overlay is designed to have low correlation with bonds in down months and to offset part of bond losses when volatility rises; it may not do so and can lose money. The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.
                - generic [ref=e275]:
                  - generic [ref=e276]:
                    - heading "Returns" [level=3] [ref=e277]
                    - link "See all performance" [ref=e280] [cursor=pointer]:
                      - /url: "#performance"
                  - paragraph [ref=e283]: Series J, net of fees · as of August 31, 2026
                  - generic [ref=e284]:
                    - table [ref=e285]:
                      - caption [ref=e286]: Returns
                      - rowgroup [ref=e287]:
                        - row [ref=e288]:
                          - columnheader "Period" [ref=e289]
                          - columnheader "Fund" [ref=e290]
                          - columnheader "Benchmark" [ref=e291]
                          - columnheader "Value added" [ref=e292]
                      - rowgroup [ref=e293]:
                        - row [ref=e294]:
                          - cell "1 month" [ref=e295]
                          - cell "−0.11%" [ref=e296]
                          - cell "0.38%" [ref=e297]
                          - cell "−0.49%" [ref=e298]
                        - row [ref=e299]:
                          - cell "3 months" [ref=e300]
                          - cell "−0.57%" [ref=e301]
                          - cell "−0.29%" [ref=e302]
                          - cell "−0.27%" [ref=e303]
                        - row [ref=e304]:
                          - cell "Year to date" [ref=e305]
                          - cell "0.02%" [ref=e306]
                          - cell "−0.31%" [ref=e307]
                          - cell "+0.33%" [ref=e308]
                        - row [ref=e309]:
                          - cell "1 year" [ref=e310]
                          - cell "1.16%" [ref=e311]
                          - cell "0.24%" [ref=e312]
                          - cell "+0.92%" [ref=e313]
                        - row [ref=e314]:
                          - cell "2 years *" [ref=e315]
                          - cell "0.91%" [ref=e316]
                          - cell [ref=e317]
                          - cell [ref=e318]
                        - row [ref=e319]:
                          - cell "3 years *" [ref=e320]
                          - cell "1.14%" [ref=e321]
                          - cell [ref=e322]
                          - cell [ref=e323]
                        - row [ref=e324]:
                          - cell "Since inception (Oct 5, 2021) *" [ref=e325]
                          - cell "1.96%" [ref=e326]
                          - cell [ref=e327]
                          - cell [ref=e328]
                    - paragraph [ref=e329]: "* Periods over one year are annualized."
              - complementary [ref=e330]:
                - generic [ref=e331]:
                  - generic [ref=e332]:
                    - heading "Morningstar Rating™" [level=3] [ref=e333]
                    - link "Awards and rankings" [ref=e336] [cursor=pointer]:
                      - /url: "#awards"
                  - region "Morningstar Rating™" [ref=e339]:
                    - generic [ref=e340]:
                      - img "Morningstar" [ref=e341]
                      - 'img "Morningstar Rating™: 5 stars" [ref=e342]'
                      - paragraph [ref=e343]: "Morningstar Rating™: 5 stars"
                    - paragraph [ref=e344]: Series F, as of October 1, 2026
                    - generic [ref=e345]:
                      - 'link "Source: Morningstar (opens in a new tab)" [ref=e346] [cursor=pointer]':
                        - /url: https://global.morningstar.com/en-ca/investments/funds/0P0001NL0N/quote
                        - text: "Source: Morningstar"
                        - generic [ref=e351]: (opens in a new tab)
                      - button "Rating methodology and attribution" [ref=e353] [cursor=pointer]
                - generic [ref=e357]:
                  - heading "Key facts" [level=3] [ref=e359]
                  - generic [ref=e361]:
                    - generic [ref=e362]:
                      - term [ref=e363]: Legal name
                      - definition [ref=e364]: Nymbus Monthly Income Fund
                    - generic [ref=e365]:
                      - term [ref=e366]: Vehicle
                      - definition [ref=e367]: Mutual fund
                    - generic [ref=e368]:
                      - term [ref=e369]: Asset class
                      - definition [ref=e370]: Short-term fixed income
                    - generic [ref=e371]:
                      - term [ref=e372]: Benchmark
                      - definition [ref=e373]: FTSE Canada Short Term Corporate Bond Index
                    - generic [ref=e374]:
                      - term [ref=e375]: Fund launch
                      - definition [ref=e376]: October 5, 2021
                    - generic [ref=e377]:
                      - term [ref=e378]: Track record since
                      - definition [ref=e379]: October 2021
                    - generic [ref=e380]:
                      - term [ref=e381]: Currency
                      - definition [ref=e382]: CAD, USD
                    - generic [ref=e383]:
                      - term [ref=e384]: Series
                      - definition [ref=e385]: FP, F USD, A, I, J, F
                    - generic [ref=e386]:
                      - term [ref=e387]: Risk rating
                      - definition [ref=e388]: Low to medium
                    - generic [ref=e389]:
                      - term [ref=e390]: Returns shown
                      - definition [ref=e391]: Net of fees
                    - generic [ref=e392]:
                      - term [ref=e393]: CIFSC category
                      - definition [ref=e394]: Canadian Core Plus Fixed Income
                - generic [ref=e395]:
                  - heading "Fees and expenses" [level=3] [ref=e397]
                  - paragraph [ref=e399]: Fees and expenses are set out in the fund facts and the simplified prospectus.
            - generic [ref=e400]:
              - heading "Series and Fundserv codes" [level=3] [ref=e402]
              - table [ref=e405]:
                - caption [ref=e406]: Series and Fundserv codes
                - rowgroup [ref=e407]:
                  - row [ref=e408]:
                    - columnheader "Series" [ref=e409]
                    - columnheader "Fundserv" [ref=e410]
                    - columnheader "Offered under" [ref=e411]
                    - columnheader "Currency" [ref=e412]
                    - columnheader "Series launch" [ref=e413]
                    - columnheader "NAV per unit" [ref=e414]
                    - columnheader "Daily change" [ref=e415]
                    - columnheader "Valuation date" [ref=e416]
                - rowgroup [ref=e417]:
                  - row [ref=e418]:
                    - cell "J (Series shown in the header)" [ref=e419]:
                      - text: J
                      - generic [ref=e421]: (Series shown in the header)
                    - cell [ref=e422]:
                      - code [ref=e423]: LDM061
                    - cell [ref=e424]
                    - cell "CAD" [ref=e425]
                    - cell "Oct 5, 2021" [ref=e426]
                    - cell "$10.3943" [ref=e427]
                    - cell "−0.08%" [ref=e428]
                    - cell "Sep 28, 2026" [ref=e429]
                  - row [ref=e430]:
                    - cell "FP" [ref=e431]
                    - cell [ref=e432]:
                      - code [ref=e433]: LDM001
                    - cell "Offering memorandum class" [ref=e434]
                    - cell "CAD" [ref=e436]
                    - cell "Oct 5, 2021" [ref=e437]
                    - cell "$10.1905" [ref=e438]
                    - cell "+0.11%" [ref=e439]
                    - cell "Sep 28, 2026" [ref=e440]
                  - row [ref=e441]:
                    - cell "F USD" [ref=e442]
                    - cell [ref=e443]:
                      - code [ref=e444]: LDM011
                    - cell [ref=e445]
                    - cell "USD" [ref=e446]
                    - cell "Jun 2, 2025" [ref=e447]
                    - cell "US$10.3711" [ref=e448]
                    - cell [ref=e449]
                    - cell "Sep 28, 2026" [ref=e450]
                  - row [ref=e451]:
                    - cell "A" [ref=e452]
                    - cell [ref=e453]:
                      - code [ref=e454]: LDM021
                    - cell [ref=e455]
                    - cell "CAD" [ref=e456]
                    - cell "Mar 2, 2026" [ref=e457]
                    - cell "$9.7714" [ref=e458]
                    - cell "−0.21%" [ref=e459]
                    - cell "Sep 28, 2026" [ref=e460]
                  - row [ref=e461]:
                    - cell "I" [ref=e462]
                    - cell [ref=e463]:
                      - code [ref=e464]: LDM031
                    - cell [ref=e465]
                    - cell "CAD" [ref=e466]
                    - cell "Mar 6, 2023" [ref=e467]
                    - cell "$10.8684" [ref=e468]
                    - cell "−0.20%" [ref=e469]
                    - cell "Sep 28, 2026" [ref=e470]
                  - row [ref=e471]:
                    - cell "F" [ref=e472]
                    - cell [ref=e473]:
                      - code [ref=e474]: LDM081
                    - cell "Prospectus class" [ref=e475]
                    - cell "CAD" [ref=e477]
                    - cell "Mar 1, 2024" [ref=e478]
                    - cell "$10.0397" [ref=e479]
                    - cell "−0.19%" [ref=e480]
                    - cell "Sep 28, 2026" [ref=e481]
            - generic [ref=e482]:
              - generic [ref=e483]:
                - heading "Investment team" [level=3] [ref=e484]
                - link "Meet the team" [ref=e487] [cursor=pointer]:
                  - /url: /team
              - paragraph [ref=e490]: The fund is managed by the Nymbus Capital investment team.
      - region [ref=e491]:
        - generic [ref=e492]:
          - generic [ref=e493]:
            - paragraph [ref=e495]: Monthly Income Fund
            - heading "Built for monthly income" [level=2] [ref=e497]:
              - generic [aria-hidden] [ref=e498]:
                - generic [ref=e499]: Built
                - generic [ref=e500]: for
                - generic [ref=e501]: monthly
                - generic [ref=e502]: income
            - generic [ref=e503]: What shapes the fund.
          - generic [ref=e505]:
            - generic [ref=e506]:
              - heading "Monthly distributions" [level=3] [ref=e512]
              - paragraph [ref=e514]: Designed to pay every month. Distributions are not guaranteed, may change and may include a return of capital.
            - generic [ref=e515]:
              - heading "Short maturities" [level=3] [ref=e520]
              - paragraph [ref=e522]: "Low rate sensitivity. Current duration: Portfolio tab."
            - generic [ref=e523]:
              - heading "Systematic credit selection" [level=3] [ref=e532]
              - paragraph [ref=e534]: Credit risk weighed against yield, issuer by issuer.
            - generic [ref=e535]:
              - heading "Protective overlay" [level=3] [ref=e540]
              - paragraph [ref=e542]: A protective overlay designed to have low correlation with bonds in down months and to offset part of bond losses when volatility rises; it may not do so and can lose money. The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.
      - generic [ref=e545]:
        - heading "Interested in the fund?" [level=2] [ref=e546]:
          - generic [aria-hidden] [ref=e547]:
            - generic [ref=e548]: Interested
            - generic [ref=e549]: in
            - generic [ref=e550]: the
            - generic [ref=e551]: fund?
        - paragraph [ref=e553]: Our team can walk you through the fund, its series and how to invest.
        - generic [ref=e555]:
          - link "Contact our team" [ref=e556] [cursor=pointer]:
            - /url: /contact
          - link "All strategies" [ref=e559] [cursor=pointer]:
            - /url: /strategies
      - region [ref=e560]:
        - generic [ref=e561]:
          - generic [ref=e562]:
            - paragraph [ref=e564]: Explore
            - heading "Other strategies" [level=2] [ref=e566]:
              - generic [aria-hidden] [ref=e567]:
                - generic [ref=e568]: Other
                - generic [ref=e569]: strategies
          - generic [ref=e570]:
            - link "Core fixed income Sustainable Enhanced Bonds Canadian core bonds, managed systematically View Nymbus Sustainable Enhanced Bonds Fund" [ref=e571] [cursor=pointer]:
              - /url: /strategies/sustainable-enhanced-bonds
              - generic [ref=e573]: Core fixed income
              - generic [ref=e574]: Sustainable Enhanced Bonds
              - generic [ref=e575]: Canadian core bonds, managed systematically
              - generic [ref=e576]:
                - text: View
                - generic [ref=e577]: Nymbus Sustainable Enhanced Bonds Fund
            - link "Alternative strategies Multi-Strategy Four systematic strategies designed to have low correlation with one another View Nymbus Multi-Strategy Fund" [ref=e580] [cursor=pointer]:
              - /url: /strategies/multi-strategy
              - generic [ref=e582]: Alternative strategies
              - generic [ref=e583]: Multi-Strategy
              - generic [ref=e584]: Four systematic strategies designed to have low correlation with one another
              - generic [ref=e585]:
                - text: View
                - generic [ref=e586]: Nymbus Multi-Strategy Fund
            - link "Protective overlay (managed accounts) Global Minimum Volatility A protective futures overlay designed to have low correlation with bonds in down months View Nymbus Global Minimum Volatility" [ref=e589] [cursor=pointer]:
              - /url: /strategies/global-minimum-volatility
              - generic [ref=e591]: Protective overlay (managed accounts)
              - generic [ref=e592]: Global Minimum Volatility
              - generic [ref=e593]: A protective futures overlay designed to have low correlation with bonds in down months
              - generic [ref=e594]:
                - text: View
                - generic [ref=e595]: Nymbus Global Minimum Volatility
      - region [ref=e598]:
        - generic [ref=e600]:
          - generic [ref=e601]:
            - paragraph [ref=e602]: Important information
            - heading "Disclosures" [level=2] [ref=e604]
          - generic [ref=e605]:
            - paragraph [ref=e606]: The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.
            - paragraph [ref=e607]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
            - paragraph [ref=e608]: "Performance shown: Series J, net of fees · Benchmark: FTSE Canada Short Term Corporate Bond Index"
            - paragraph [ref=e609]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
            - generic [ref=e610]:
              - generic [ref=e612] [cursor=pointer]:
                - paragraph [ref=e613]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
                - paragraph [ref=e614]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
                - paragraph [ref=e615]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
                - paragraph [ref=e616]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
                - paragraph [ref=e617]:
                  - generic [ref=e619]: Updated daily from Nymbus’ data platform; portfolio data from the daily holdings as of September 28, 2026; sustainability metrics from the monthly factsheet of August 2026. performance as of August 2026 · net asset values as of Sep 28, 2026.
              - button "Show full text" [ref=e620] [cursor=pointer]
  - contentinfo [ref=e624]:
    - generic [ref=e625]:
      - generic [ref=e626]:
        - generic [ref=e627]:
          - link "Nymbus Capital, home" [ref=e628] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e629]
          - paragraph [ref=e638]: Montreal portfolio manager building systematic fixed income and alternative strategies.
          - generic [ref=e639]:
            - generic [ref=e640]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e641] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e642]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e643] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e644]:
          - heading "Strategies" [level=2] [ref=e645]
          - list [ref=e646]:
            - listitem [ref=e647]:
              - link "Monthly Income" [ref=e648] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e650]:
              - link "Sustainable Enhanced Bonds" [ref=e651] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e653]:
              - link "Multi-Strategy" [ref=e654] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e656]:
              - link "Global Minimum Volatility" [ref=e657] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e659]:
          - heading "Company" [level=2] [ref=e660]
          - list [ref=e661]:
            - listitem [ref=e662]:
              - link "About & team" [ref=e663] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e664]:
              - link "Approach" [ref=e665] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e666]:
              - link "Core concepts" [ref=e667] [cursor=pointer]:
                - /url: /core-concepts
            - listitem [ref=e668]:
              - link "Sustainability" [ref=e669] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e670]:
              - link "Solutions" [ref=e671] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e672]:
          - heading "Resources" [level=2] [ref=e673]
          - list [ref=e674]:
            - listitem [ref=e675]:
              - link "Contact" [ref=e676] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e677]:
              - link "Privacy policy" [ref=e678] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e679]:
              - link "Complaints & code of ethics" [ref=e680] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e681]:
              - link "LinkedIn" [ref=e682] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e687]:
        - generic [ref=e689] [cursor=pointer]:
          - paragraph [ref=e690]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
          - paragraph [ref=e691]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
          - paragraph [ref=e692]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
          - paragraph [ref=e693]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
          - paragraph [ref=e694]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
          - paragraph [ref=e695]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative. Unless another variant is selected on the strategy page, the returns shown are those of the 6% downside volatility variant; the strategy is also offered with 3% and 9% downside volatility targets, whose returns differ.
          - paragraph [ref=e696]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
        - button "Show full text" [ref=e697] [cursor=pointer]
      - generic [ref=e701]:
        - generic [ref=e702]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e703]: PRI signatory
  - alert [ref=e704]
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