# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> home tiles and the strategies index name the class of the returns (EN + FR)
- Location: e2e/fund.spec.ts:523:5

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByTestId('strategy-monthly-income').getByTestId('perf-class')
Expected: 0
Received: 1
Timeout:  10000ms

Call log:
  - Expect "toHaveCount" getByTestId('strategy-monthly-income').getByTestId('perf-class') with timeout 10000ms
  - waiting for getByTestId('strategy-monthly-income').getByTestId('perf-class')
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
      - generic [ref=e39]:
        - paragraph [ref=e41]: Montreal · systematic fixed income and alternatives
        - heading "Scientific investing" [level=1] [ref=e43]:
          - generic [aria-hidden] [ref=e44]:
            - generic [ref=e45]: Scientific
            - generic [ref=e46]: investing
        - paragraph [ref=e48]: Scientists and engineers solving the harder problems in finance.
        - generic [ref=e50]:
          - link "Explore strategies" [ref=e51] [cursor=pointer]:
            - /url: /strategies
          - link "Investment solutions" [ref=e54] [cursor=pointer]:
            - /url: /solutions
      - region [ref=e55]:
        - generic [ref=e57]:
          - heading "Nymbus at a glance" [level=2] [ref=e59]
          - generic [ref=e60]:
            - generic [ref=e61]:
              - generic [ref=e62]: $1.9B
              - generic [ref=e63]: Assets under management, including mandates
            - generic [ref=e64]:
              - generic [ref=e65]: "4"
              - generic [ref=e66]: Strategies
            - generic [ref=e67]:
              - generic [ref=e68]: "18"
              - generic [ref=e69]: People, team and board
            - generic [ref=e70]:
              - generic [ref=e71]: "2"
              - generic [ref=e72]: PhDs on the team
      - region [ref=e73]:
        - generic [ref=e74]:
          - generic [ref=e75]:
            - paragraph [ref=e77]: Science at scale
            - heading "Scientists and engineers, hard problems in finance" [level=2] [ref=e79]:
              - generic [aria-hidden] [ref=e80]:
                - generic [ref=e81]: Scientists
                - generic [ref=e82]: and
                - generic [ref=e83]: engineers,
                - generic [ref=e84]: hard
                - generic [ref=e85]: problems
                - generic [ref=e86]: in
                - generic [ref=e87]: finance
            - generic [ref=e88]: Data at scale. Models tested before they are trusted.
          - 'figure "Generic labels and generated values: not actual securities, signals or results. The counters count what this animation scans." [ref=e90]':
            - 'img "Animated illustration: a table of securities scanned for factor scores, with flagged signals." [ref=e91]':
              - generic [aria-hidden] [ref=e92]:
                - generic [ref=e97]: Analysis · universe, factors, signals
                - generic [ref=e98]: Illustration
          - generic [ref=e102]:
            - generic [ref=e107]:
              - heading "Scientists" [level=3] [ref=e108]
              - paragraph [ref=e109]: Hypotheses, tested on data.
            - generic [ref=e115]:
              - heading "Engineers" [level=3] [ref=e116]
              - paragraph [ref=e117]: Pipelines that run every day.
            - generic [ref=e122]:
              - heading "Together" [level=3] [ref=e123]
              - paragraph [ref=e124]: The harder problems in fixed income.
      - region [ref=e125]:
        - generic [ref=e126]:
          - generic [ref=e127]:
            - paragraph [ref=e129]: Strategies
            - heading "Our funds and strategies" [level=2] [ref=e131]:
              - generic [aria-hidden] [ref=e132]:
                - generic [ref=e133]: Our
                - generic [ref=e134]: funds
                - generic [ref=e135]: and
                - generic [ref=e136]: strategies
            - generic [ref=e137]: Two bond funds, a multi-strategy fund, a futures overlay.
          - generic [ref=e139]:
            - 'link "Short-term fixed income Sample data Fund · FundServ Monthly Income Monthly income from short-term corporate bonds +0.8% Since inception, annualized · Net of fees 1 year +0.7% Returns as of August 2026 · Net of fees · Returns: Series F View the strategy" [ref=e140] [cursor=pointer]':
              - /url: /strategies/monthly-income
              - generic [ref=e141]:
                - generic [aria-hidden] [ref=e142]: "01"
                - generic [ref=e143]: Short-term fixed income
                - generic [ref=e144]:
                  - generic "Illustrative figures only, not actual performance." [ref=e145]: Sample data
                  - generic [ref=e146]: Fund · FundServ
              - heading "Monthly Income" [level=3] [ref=e147]
              - generic [ref=e148]: Monthly income from short-term corporate bonds
              - generic [ref=e149]:
                - generic [ref=e150]:
                  - generic [ref=e152]:
                    - generic [ref=e153]: +0.8%
                    - generic [aria-hidden] [ref=e154]:
                      - generic [ref=e155]: +
                      - generic [ref=e157]:
                        - generic [ref=e158]: "0"
                        - generic [ref=e159]: "1"
                        - generic [ref=e160]: "2"
                        - generic [ref=e161]: "3"
                        - generic [ref=e162]: "4"
                        - generic [ref=e163]: "5"
                        - generic [ref=e164]: "6"
                        - generic [ref=e165]: "7"
                        - generic [ref=e166]: "8"
                        - generic [ref=e167]: "9"
                      - generic [ref=e168]: .
                      - generic [ref=e170]:
                        - generic [ref=e171]: "0"
                        - generic [ref=e172]: "1"
                        - generic [ref=e173]: "2"
                        - generic [ref=e174]: "3"
                        - generic [ref=e175]: "4"
                        - generic [ref=e176]: "5"
                        - generic [ref=e177]: "6"
                        - generic [ref=e178]: "7"
                        - generic [ref=e179]: "8"
                        - generic [ref=e180]: "9"
                      - generic [ref=e181]: "%"
                  - generic [ref=e182]: Since inception, annualized · Net of fees
                - generic [ref=e184]:
                  - generic [ref=e185]: 1 year
                  - generic [ref=e186]: +0.7%
                - generic [ref=e187]:
                  - text: Returns as of August 2026 · Net of fees ·
                  - generic [ref=e188]: "Returns: Series F"
              - generic [ref=e189]: View the strategy
            - 'link "Core fixed income Sample data Fund · FundServ Sustainable Enhanced Bonds Canadian core bonds, managed systematically +2.7% Since inception, annualized · Net of fees 1 year −2.6% Returns as of August 2026 · Net of fees · Returns: Series F View the strategy" [ref=e192] [cursor=pointer]':
              - /url: /strategies/sustainable-enhanced-bonds
              - generic [ref=e193]:
                - generic [aria-hidden] [ref=e194]: "02"
                - generic [ref=e195]: Core fixed income
                - generic [ref=e196]:
                  - generic "Illustrative figures only, not actual performance." [ref=e197]: Sample data
                  - generic [ref=e198]: Fund · FundServ
              - heading "Sustainable Enhanced Bonds" [level=3] [ref=e199]
              - generic [ref=e200]: Canadian core bonds, managed systematically
              - generic [ref=e201]:
                - generic [ref=e202]:
                  - generic [ref=e204]:
                    - generic [ref=e205]: +2.7%
                    - generic [aria-hidden] [ref=e206]:
                      - generic [ref=e207]: +
                      - generic [ref=e209]:
                        - generic [ref=e210]: "0"
                        - generic [ref=e211]: "1"
                        - generic [ref=e212]: "2"
                        - generic [ref=e213]: "3"
                        - generic [ref=e214]: "4"
                        - generic [ref=e215]: "5"
                        - generic [ref=e216]: "6"
                        - generic [ref=e217]: "7"
                        - generic [ref=e218]: "8"
                        - generic [ref=e219]: "9"
                      - generic [ref=e220]: .
                      - generic [ref=e222]:
                        - generic [ref=e223]: "0"
                        - generic [ref=e224]: "1"
                        - generic [ref=e225]: "2"
                        - generic [ref=e226]: "3"
                        - generic [ref=e227]: "4"
                        - generic [ref=e228]: "5"
                        - generic [ref=e229]: "6"
                        - generic [ref=e230]: "7"
                        - generic [ref=e231]: "8"
                        - generic [ref=e232]: "9"
                      - generic [ref=e233]: "%"
                  - generic [ref=e234]: Since inception, annualized · Net of fees
                - generic [ref=e236]:
                  - generic [ref=e237]: 1 year
                  - generic [ref=e238]: −2.6%
                - generic [ref=e239]:
                  - text: Returns as of August 2026 · Net of fees ·
                  - generic [ref=e240]: "Returns: Series F"
              - generic [ref=e241]: View the strategy
            - 'link "Alternative strategies Sample data Fund · FundServ Multi-Strategy Four systematic strategies designed to have low correlation with one another +7.6% Since inception, annualized · Net of fees 1 year +9.4% Returns as of August 2026 · Net of fees · Returns: Series F View the strategy" [ref=e244] [cursor=pointer]':
              - /url: /strategies/multi-strategy
              - generic [ref=e245]:
                - generic [aria-hidden] [ref=e246]: "03"
                - generic [ref=e247]: Alternative strategies
                - generic [ref=e248]:
                  - generic "Illustrative figures only, not actual performance." [ref=e249]: Sample data
                  - generic [ref=e250]: Fund · FundServ
              - heading "Multi-Strategy" [level=3] [ref=e251]
              - generic [ref=e252]: Four systematic strategies designed to have low correlation with one another
              - generic [ref=e253]:
                - generic [ref=e254]:
                  - generic [ref=e256]:
                    - generic [ref=e257]: +7.6%
                    - generic [aria-hidden] [ref=e258]:
                      - generic [ref=e259]: +
                      - generic [ref=e261]:
                        - generic [ref=e262]: "0"
                        - generic [ref=e263]: "1"
                        - generic [ref=e264]: "2"
                        - generic [ref=e265]: "3"
                        - generic [ref=e266]: "4"
                        - generic [ref=e267]: "5"
                        - generic [ref=e268]: "6"
                        - generic [ref=e269]: "7"
                        - generic [ref=e270]: "8"
                        - generic [ref=e271]: "9"
                      - generic [ref=e272]: .
                      - generic [ref=e274]:
                        - generic [ref=e275]: "0"
                        - generic [ref=e276]: "1"
                        - generic [ref=e277]: "2"
                        - generic [ref=e278]: "3"
                        - generic [ref=e279]: "4"
                        - generic [ref=e280]: "5"
                        - generic [ref=e281]: "6"
                        - generic [ref=e282]: "7"
                        - generic [ref=e283]: "8"
                        - generic [ref=e284]: "9"
                      - generic [ref=e285]: "%"
                  - generic [ref=e286]: Since inception, annualized · Net of fees
                - generic [ref=e288]:
                  - generic [ref=e289]: 1 year
                  - generic [ref=e290]: +9.4%
                - generic [ref=e291]:
                  - text: Returns as of August 2026 · Net of fees ·
                  - generic [ref=e292]: "Returns: Series F"
              - generic [ref=e293]: View the strategy
            - link "Futures overlay (managed accounts) Sample data Managed accounts Global Minimum Volatility A futures overlay designed to have low correlation with bonds +8.2% Since inception, annualized · Gross of fees 6% downside volatility 1 year +6.1% Returns as of August 2026 · Gross of fees · 6% downside volatility View the strategy" [ref=e296] [cursor=pointer]:
              - /url: /strategies/global-minimum-volatility
              - generic [ref=e297]:
                - generic [aria-hidden] [ref=e298]: "04"
                - generic [ref=e299]: Futures overlay (managed accounts)
                - generic [ref=e300]:
                  - generic "Illustrative figures only, not actual performance." [ref=e301]: Sample data
                  - generic [ref=e302]: Managed accounts
              - heading "Global Minimum Volatility" [level=3] [ref=e303]
              - generic [ref=e304]: A futures overlay designed to have low correlation with bonds
              - generic [ref=e305]:
                - generic [ref=e306]:
                  - generic [ref=e308]:
                    - generic [ref=e309]: +8.2%
                    - generic [aria-hidden] [ref=e310]:
                      - generic [ref=e311]: +
                      - generic [ref=e313]:
                        - generic [ref=e314]: "0"
                        - generic [ref=e315]: "1"
                        - generic [ref=e316]: "2"
                        - generic [ref=e317]: "3"
                        - generic [ref=e318]: "4"
                        - generic [ref=e319]: "5"
                        - generic [ref=e320]: "6"
                        - generic [ref=e321]: "7"
                        - generic [ref=e322]: "8"
                        - generic [ref=e323]: "9"
                      - generic [ref=e324]: .
                      - generic [ref=e326]:
                        - generic [ref=e327]: "0"
                        - generic [ref=e328]: "1"
                        - generic [ref=e329]: "2"
                        - generic [ref=e330]: "3"
                        - generic [ref=e331]: "4"
                        - generic [ref=e332]: "5"
                        - generic [ref=e333]: "6"
                        - generic [ref=e334]: "7"
                        - generic [ref=e335]: "8"
                        - generic [ref=e336]: "9"
                      - generic [ref=e337]: "%"
                  - generic [ref=e338]: Since inception, annualized · Gross of fees
                  - generic [ref=e339]: 6% downside volatility
                - generic [ref=e341]:
                  - generic [ref=e342]: 1 year
                  - generic [ref=e343]: +6.1%
                - generic [ref=e344]: Returns as of August 2026 · Gross of fees · 6% downside volatility
              - generic [ref=e345]: View the strategy
          - paragraph [ref=e348]: Net of fees, in CAD. Past performance may not be repeated. See the important information below. Global Minimum Volatility returns (6% downside volatility variant unless another is selected) are gross of fees (managed accounts, not a fund).
          - link "View all strategies" [ref=e350] [cursor=pointer]:
            - /url: /strategies
      - region [ref=e353]:
        - generic [ref=e354]:
          - generic [ref=e355]:
            - paragraph [ref=e357]: Investment process
            - heading "One pipeline, from data to portfolio" [level=2] [ref=e359]:
              - generic [aria-hidden] [ref=e360]:
                - generic [ref=e361]: One
                - generic [ref=e362]: pipeline,
                - generic [ref=e363]: from
                - generic [ref=e364]: data
                - generic [ref=e365]: to
                - generic [ref=e366]: portfolio
            - generic [ref=e367]: Four documented, tested and monitored steps.
          - list [ref=e369]:
            - listitem [ref=e370]:
              - generic [ref=e376]:
                - paragraph [ref=e377]: "01"
                - heading "Data and research" [level=3] [ref=e378]
                - generic [ref=e379]: Market and fundamental data, cleaned and studied.
            - listitem [ref=e380]:
              - generic [ref=e384]:
                - paragraph [ref=e385]: "02"
                - heading "Signal generation" [level=3] [ref=e386]
                - generic [ref=e387]: Machine-learning signals, kept only after statistical validation.
            - listitem [ref=e388]:
              - generic [ref=e394]:
                - paragraph [ref=e395]: "03"
                - heading "Portfolio construction" [level=3] [ref=e396]
                - generic [ref=e397]: Optimization within risk, liquidity and sustainability limits.
            - listitem [ref=e398]:
              - generic [ref=e403]:
                - paragraph [ref=e404]: "04"
                - heading "Risk management" [level=3] [ref=e405]
                - generic [ref=e406]: Continuous monitoring, adjustments and hedging. Risk management does not eliminate the risk of loss.
          - generic [ref=e407]:
            - link "Our approach" [ref=e408] [cursor=pointer]:
              - /url: /approach
            - link "Meet the team" [ref=e411] [cursor=pointer]:
              - /url: /team
      - region [ref=e414]:
        - generic [ref=e415]:
          - generic [ref=e416]:
            - paragraph [ref=e418]: Clients and platforms
            - heading "Institutions and partners we work with" [level=2] [ref=e420]:
              - generic [aria-hidden] [ref=e421]:
                - generic [ref=e422]: Institutions
                - generic [ref=e423]: and
                - generic [ref=e424]: partners
                - generic [ref=e425]: we
                - generic [ref=e426]: work
                - generic [ref=e427]: with
          - region "Logos of institutions and platforms we work with" [ref=e429]:
            - generic [ref=e430]:
              - list [ref=e431]:
                - listitem:
                  - img "Fondaction"
                - listitem:
                  - img "Fonds FMOQ"
                - listitem:
                  - img "QEMP (Innocap)"
                - listitem:
                  - img "Caisse de retraite et d’épargne du Groupe Securitas"
                - listitem:
                  - img "GardaWorld"
                - listitem:
                  - img "Bâtirente"
                - listitem:
                  - img "National Bank Financial Wealth Management"
                - listitem:
                  - img "RBC Dominion Securities"
                - listitem:
                  - img "iA Financial Group"
              - list [aria-hidden] [ref=e432]
          - paragraph [ref=e433]: "Source: Nymbus Capital Inc. Representative list; not all clients are shown. QEMP: Quebec Emerging Managers Program (Innocap). Inclusion does not imply endorsement."
      - region [ref=e434]:
        - generic [ref=e435]:
          - generic [ref=e436]:
            - paragraph [ref=e438]: News and milestones
            - heading "Recent developments" [level=2] [ref=e440]:
              - generic [aria-hidden] [ref=e441]:
                - generic [ref=e442]: Recent
                - generic [ref=e443]: developments
          - generic [ref=e444]:
            - article [ref=e445]:
              - generic [ref=e456]:
                - paragraph [ref=e457]:
                  - generic [ref=e458]: Partnership
                  - time [ref=e459]: Jan 28, 2025
                - heading "Mageska Capital and Nymbus Capital announce a partnership" [level=3] [ref=e460]
                - 'button "Read more : Mageska Capital and Nymbus Capital announce a partnership" [ref=e461] [cursor=pointer]':
                  - text: Read more
                  - generic [ref=e464]: ": Mageska Capital and Nymbus Capital announce a partnership"
            - article [ref=e465]:
              - generic [ref=e474]:
                - paragraph [ref=e475]:
                  - generic [ref=e476]: ESG
                  - time [ref=e477]: Apr 23, 2024
                - heading "Nymbus becomes a signatory of the Tobacco-Free Finance Pledge" [level=3] [ref=e478]
                - 'button "Read more : Nymbus becomes a signatory of the Tobacco-Free Finance Pledge" [ref=e479] [cursor=pointer]':
                  - text: Read more
                  - generic [ref=e482]: ": Nymbus becomes a signatory of the Tobacco-Free Finance Pledge"
            - article [ref=e483]:
              - generic [ref=e491]:
                - paragraph [ref=e492]:
                  - generic [ref=e493]: Community
                  - time [ref=e494]: Oct 3, 2023
                - heading "Nymbus partners with Dans la rue" [level=3] [ref=e495]
                - 'button "Read more : Nymbus partners with Dans la rue" [ref=e496] [cursor=pointer]':
                  - text: Read more
                  - generic [ref=e499]: ": Nymbus partners with Dans la rue"
          - paragraph [ref=e500]:
            - link "All news" [ref=e501] [cursor=pointer]:
              - /url: /news
      - generic [ref=e506]:
        - heading "Let’s discuss your investment objectives" [level=2] [ref=e507]:
          - generic [aria-hidden] [ref=e508]:
            - generic [ref=e509]: Let’s
            - generic [ref=e510]: discuss
            - generic [ref=e511]: your
            - generic [ref=e512]: investment
            - generic [ref=e513]: objectives
        - paragraph [ref=e515]: Talk to our team about your mandate.
        - generic [ref=e517]:
          - link "Get in touch" [ref=e518] [cursor=pointer]:
            - /url: /contact
          - link "View solutions" [ref=e521] [cursor=pointer]:
            - /url: /solutions
  - contentinfo [ref=e522]:
    - generic [ref=e523]:
      - generic [ref=e524]:
        - generic [ref=e525]:
          - link "Nymbus Capital, home" [ref=e526] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e527]
          - paragraph [ref=e536]: Montreal portfolio manager building systematic fixed income and alternative strategies.
          - generic [ref=e537]:
            - generic [ref=e538]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e539] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e540]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e541] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e542]:
          - heading "Strategies" [level=2] [ref=e543]
          - list [ref=e544]:
            - listitem [ref=e545]:
              - link "Monthly Income" [ref=e546] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e548]:
              - link "Sustainable Enhanced Bonds" [ref=e549] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e551]:
              - link "Multi-Strategy" [ref=e552] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e554]:
              - link "Global Minimum Volatility" [ref=e555] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e557]:
          - heading "Company" [level=2] [ref=e558]
          - list [ref=e559]:
            - listitem [ref=e560]:
              - link "About & team" [ref=e561] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e562]:
              - link "Approach" [ref=e563] [cursor=pointer]:
                - /url: /approach
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
  436 |   await page.goto("/strategies/multi-strategy#awards");
  437 |   await expect(page.getByTestId("rank-1M")).toContainText("127 of 144");
  438 |   await expect(page.getByTestId("rank-1M").locator(".aw-q")).toHaveText("Q4");
  439 |   await expect(page.getByTestId("morningstar")).toHaveCount(0);
  440 |   // GMV: no ranking, no tab
  441 |   await page.goto("/strategies/global-minimum-volatility");
  442 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="awards"]')).toHaveCount(0);
  443 | });
  444 | 
  445 | test("calendar-year chart: a value label on every bar, none overlapping, no horizontal page scroll", async ({ page }) => {
  446 |   await page.goto("/strategies/global-minimum-volatility#performance");
  447 |   const chart = page.getByTestId("calendar");
  448 |   await chart.scrollIntoViewIfNeeded();
  449 |   const cats = chart.locator("svg .cat");
  450 |   await expect(cats.first()).toBeVisible();
  451 |   const n = await cats.count();
  452 |   expect(n).toBeGreaterThan(8);
  453 |   const labels = chart.locator("svg text.vl");
  454 |   await expect(labels).toHaveCount(n);
  455 |   // each label sits above its bar (below a negative one) and the labels do not overlap each other
  456 |   const boxes = await labels.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, text: e.textContent }; }));
  457 |   for (const b of boxes) expect(b.text).toMatch(/^[+−-]?\d+\.\d%$/);
  458 |   const sorted = [...boxes].sort((a, b) => a.l - b.l);
  459 |   for (let i = 1; i < sorted.length; i++) expect(sorted[i].l, `labels ${sorted[i - 1].text} / ${sorted[i].text}`).toBeGreaterThanOrEqual(sorted[i - 1].r - 0.5);
  460 |   // the bars of the chart stay inside the card (it scrolls sideways when narrow), the page never does
  461 |   const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  462 |   expect(overflow).toBeLessThanOrEqual(1);
  463 |   // accessible: every category keeps its text alternative with the value
  464 |   await expect(cats.first()).toHaveAttribute("aria-label", /\d/);
  465 |   // roving tabindex: a single category in the tab order
  466 |   await expect(chart.locator('svg .cat[tabindex="0"]')).toHaveCount(1);
  467 | });
  468 | 
  469 | /**
  470 |  * Performance class label (Gabriel 2026-10-01: the label must match the class of the data). The expected label is
  471 |  * read from the class code of the sample's own data (`performance.classCode`), never assumed: the sample is built as
  472 |  * if the dataplatform served SEB class F (PR #626); the class H rendering (what production shows before that) is
  473 |  * covered by the admin test that pins SEB to a class H run (admin.spec.ts). The NAV card keeps the register's own
  474 |  * series (LDM201 = F), independent of the returns' class.
  475 |  */
  476 | const SAMPLE = JSON.parse(readFileSync("src/lib/data/sample-site-data.json", "utf8")) as { funds: Record<string, { performance: { classCode?: string; returnClass?: string } | null }> };
  477 | const CLASS_OF: Record<string, Record<string, string>> = {
  478 |   "monthly-income": { STRATEGY: "FP" },
  479 |   "sustainable-enhanced-bonds": { STRATEGY: "F", STRATEGY_H: "H" },
  480 |   "multi-strategy": { STRATEGY: "F" },
  481 | };
  482 | const NO_HEADLINE_SERIES = new Set(["monthly-income"]);
  483 | const codeOf = (slug: string): string => CLASS_OF[slug][SAMPLE.funds[slug].performance!.classCode!];
  484 | /** "Series F" but not "Series FP" (and the other way round) */
  485 | const seriesRe = (word: string, code: string): RegExp => new RegExp(`${word} ${code}(?![A-Za-z])`);
  486 | 
  487 | for (const slug of Object.keys(CLASS_OF)) {
  488 |   test(`performance class label follows the data's class everywhere (EN + FR): ${slug}`, async ({ page }) => {
  489 |     const perf = SAMPLE.funds[slug].performance!;
  490 |     const code = codeOf(slug);
  491 |     expect(code, `class ${perf.classCode} has a label`).toBeTruthy();
  492 |     expect(perf.returnClass).toBe(code);
  493 |     const others = Object.values(CLASS_OF[slug]).filter((c) => c !== code);
  494 |     for (const [lang, word, fund] of [["en", "Series", "Fund"], ["fr", "Série", "Fonds"]] as const) {
  495 |       await page.goto(`/strategies/${slug}`);
  496 |       if (lang === "fr") {
  497 |         await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  498 |         await page.reload();
  499 |       }
  500 |       // Monthly Income opens on class F (LDM081), which has no series yet: its returns are the FP class (LDM001)
  501 |       if (slug === "monthly-income") await page.getByTestId("nav-card").getByTestId("series-LDM001").click();
  502 |       const exact = seriesRe(word, code);
  503 |       // header return badges, overview returns, disclosures: this class, never another class of the fund
  504 |       for (const tid of ["basis", "overview-returns", "perf-class"]) {
  505 |         await expect(page.getByTestId(tid)).toContainText(exact);
  506 |         for (const o of others) await expect(page.getByTestId(tid)).not.toContainText(seriesRe(word, o));
  507 |       }
  508 |       // performance tab context line and growth chart legend
  509 |       await openTab(page, "performance");
  510 |       await expect(page.getByTestId("perf-context")).toContainText(exact);
  511 |       for (const o of others) await expect(page.getByTestId("perf-context")).not.toContainText(seriesRe(word, o));
  512 |       await page.getByTestId("growth").scrollIntoViewIfNeeded();
  513 |       await expect(page.getByTestId("growth").locator(".fx-legend").first()).toContainText(`${fund} (${word} ${code})`);
  514 |       if (slug === "sustainable-enhanced-bonds") {
  515 |         // the NAV card is the register's class LDM201 (F) whatever the class of the returns
  516 |         await openTab(page, "overview");
  517 |         await expect(page.getByTestId("nav-fundserv")).toHaveText("LDM201");
  518 |       }
  519 |     }
  520 |   });
  521 | }
  522 | 
  523 | test("home tiles and the strategies index name the class of the returns (EN + FR)", async ({ page }) => {
  524 |   // the French label has a no-break space before « : » (matched as \s)
  525 |   for (const [lang, returns] of [["en", "Returns: Series"], ["fr", "Rendements\\s:\\sSérie"]] as const) {
  526 |     const label = (code: string): RegExp => new RegExp(`^${returns} ${code}$`);
  527 |     for (const p of ["/", "/strategies"]) {
  528 |       await page.goto(p);
  529 |       if (lang === "fr") {
  530 |         await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  531 |         await page.reload();
  532 |       }
  533 |       for (const slug of Object.keys(CLASS_OF)) {
  534 |         const cls = page.getByTestId(`strategy-${slug}`).getByTestId("perf-class");
  535 |         // the tile shows the headline class's own returns only: none while that class has no series (Monthly Income F)
> 536 |         if (NO_HEADLINE_SERIES.has(slug)) await expect(cls).toHaveCount(0);
      |                                                             ^ Error: expect(locator).toHaveCount(expected) failed
  537 |         else await expect(cls).toHaveText(label(codeOf(slug)));
  538 |       }
  539 |       // a strategy without classes (GMV) shows none
  540 |       await expect(page.getByTestId("strategy-global-minimum-volatility").getByTestId("perf-class")).toHaveCount(0);
  541 |     }
  542 |     // the comparison table: every fund with a class, in registry order
  543 |     const cells = page.getByTestId("compare-table").getByTestId("perf-class");
  544 |     const shown = Object.keys(CLASS_OF).filter((k) => !NO_HEADLINE_SERIES.has(k));
  545 |     await expect(cells).toHaveCount(shown.length);
  546 |     for (const [i, slug] of shown.entries()) await expect(cells.nth(i)).toHaveText(label(codeOf(slug)));
  547 |   }
  548 | });
  549 | 
```