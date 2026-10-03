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
      - generic [ref=e53]:
        - paragraph [ref=e55]: Montreal · systematic fixed income and alternatives
        - heading "Scientific investing" [level=1] [ref=e57]:
          - generic [aria-hidden] [ref=e58]:
            - generic [ref=e59]: Scientific
            - generic [ref=e60]: investing
        - paragraph [ref=e62]: Scientists and engineers solving the harder problems in finance.
        - generic [ref=e64]:
          - link "Explore strategies" [ref=e65] [cursor=pointer]:
            - /url: /strategies
          - link "Investment solutions" [ref=e68] [cursor=pointer]:
            - /url: /solutions
      - region [ref=e69]:
        - generic [ref=e71]:
          - heading "Nymbus at a glance" [level=2] [ref=e73]
          - generic [ref=e74]:
            - generic [ref=e75]:
              - generic [ref=e76]: $1.9B
              - generic [ref=e77]: Assets under management, including mandates
            - generic [ref=e78]:
              - generic [ref=e79]: "4"
              - generic [ref=e80]: Strategies
            - generic [ref=e81]:
              - generic [ref=e82]: "18"
              - generic [ref=e83]: People, team and board
            - generic [ref=e84]:
              - generic [ref=e85]: "2"
              - generic [ref=e86]: PhDs on the team
      - region [ref=e87]:
        - generic [ref=e88]:
          - generic [ref=e89]:
            - paragraph [ref=e91]: Science at scale
            - heading "Scientists and engineers, hard problems in finance" [level=2] [ref=e93]:
              - generic [aria-hidden] [ref=e94]:
                - generic [ref=e95]: Scientists
                - generic [ref=e96]: and
                - generic [ref=e97]: engineers,
                - generic [ref=e98]: hard
                - generic [ref=e99]: problems
                - generic [ref=e100]: in
                - generic [ref=e101]: finance
            - generic [ref=e102]: Data at scale. Models tested before they are trusted.
          - 'figure "Generic labels and generated values: not actual securities, signals or results. The counters count what this animation scans." [ref=e104]':
            - 'img "Animated illustration: a table of securities scanned for factor scores, with flagged signals." [ref=e105]':
              - generic [aria-hidden] [ref=e106]:
                - generic [ref=e111]: Analysis · universe, factors, signals
                - generic [ref=e112]: Illustration
          - generic [ref=e116]:
            - generic [ref=e121]:
              - heading "Scientists" [level=3] [ref=e122]
              - paragraph [ref=e123]: Hypotheses, tested on data.
            - generic [ref=e129]:
              - heading "Engineers" [level=3] [ref=e130]
              - paragraph [ref=e131]: Pipelines that run every day.
            - generic [ref=e136]:
              - heading "Together" [level=3] [ref=e137]
              - paragraph [ref=e138]: The harder problems in fixed income.
      - region [ref=e139]:
        - generic [ref=e140]:
          - generic [ref=e141]:
            - paragraph [ref=e143]: Strategies
            - heading "Our funds and strategies" [level=2] [ref=e145]:
              - generic [aria-hidden] [ref=e146]:
                - generic [ref=e147]: Our
                - generic [ref=e148]: funds
                - generic [ref=e149]: and
                - generic [ref=e150]: strategies
            - generic [ref=e151]: Two bond funds, a multi-strategy fund, a futures overlay.
          - generic [ref=e153]:
            - 'link "Short-term fixed income Sample data Fund · FundServ Monthly Income Monthly income from short-term corporate bonds +0.8% Since inception, annualized · Net of fees 1 year +0.7% Returns as of August 2026 · Net of fees · Returns: Series F View the strategy" [ref=e154] [cursor=pointer]':
              - /url: /strategies/monthly-income
              - generic [ref=e155]:
                - generic [aria-hidden] [ref=e156]: "01"
                - generic [ref=e157]: Short-term fixed income
                - generic [ref=e158]:
                  - generic "Illustrative figures only, not actual performance." [ref=e159]: Sample data
                  - generic [ref=e160]: Fund · FundServ
              - heading "Monthly Income" [level=3] [ref=e161]
              - generic [ref=e162]: Monthly income from short-term corporate bonds
              - generic [ref=e163]:
                - generic [ref=e164]:
                  - generic [ref=e166]:
                    - generic [ref=e167]: +0.8%
                    - generic [aria-hidden] [ref=e168]:
                      - generic [ref=e169]: +
                      - generic [ref=e171]:
                        - generic [ref=e172]: "0"
                        - generic [ref=e173]: "1"
                        - generic [ref=e174]: "2"
                        - generic [ref=e175]: "3"
                        - generic [ref=e176]: "4"
                        - generic [ref=e177]: "5"
                        - generic [ref=e178]: "6"
                        - generic [ref=e179]: "7"
                        - generic [ref=e180]: "8"
                        - generic [ref=e181]: "9"
                      - generic [ref=e182]: .
                      - generic [ref=e184]:
                        - generic [ref=e185]: "0"
                        - generic [ref=e186]: "1"
                        - generic [ref=e187]: "2"
                        - generic [ref=e188]: "3"
                        - generic [ref=e189]: "4"
                        - generic [ref=e190]: "5"
                        - generic [ref=e191]: "6"
                        - generic [ref=e192]: "7"
                        - generic [ref=e193]: "8"
                        - generic [ref=e194]: "9"
                      - generic [ref=e195]: "%"
                  - generic [ref=e196]: Since inception, annualized · Net of fees
                - generic [ref=e198]:
                  - generic [ref=e199]: 1 year
                  - generic [ref=e200]: +0.7%
                - generic [ref=e201]:
                  - text: Returns as of August 2026 · Net of fees ·
                  - generic [ref=e202]: "Returns: Series F"
              - generic [ref=e203]: View the strategy
            - 'link "Core fixed income Sample data Fund · FundServ Sustainable Enhanced Bonds Canadian core bonds, managed systematically +2.7% Since inception, annualized · Net of fees 1 year −2.6% Returns as of August 2026 · Net of fees · Returns: Series F View the strategy" [ref=e206] [cursor=pointer]':
              - /url: /strategies/sustainable-enhanced-bonds
              - generic [ref=e207]:
                - generic [aria-hidden] [ref=e208]: "02"
                - generic [ref=e209]: Core fixed income
                - generic [ref=e210]:
                  - generic "Illustrative figures only, not actual performance." [ref=e211]: Sample data
                  - generic [ref=e212]: Fund · FundServ
              - heading "Sustainable Enhanced Bonds" [level=3] [ref=e213]
              - generic [ref=e214]: Canadian core bonds, managed systematically
              - generic [ref=e215]:
                - generic [ref=e216]:
                  - generic [ref=e218]:
                    - generic [ref=e219]: +2.7%
                    - generic [aria-hidden] [ref=e220]:
                      - generic [ref=e221]: +
                      - generic [ref=e223]:
                        - generic [ref=e224]: "0"
                        - generic [ref=e225]: "1"
                        - generic [ref=e226]: "2"
                        - generic [ref=e227]: "3"
                        - generic [ref=e228]: "4"
                        - generic [ref=e229]: "5"
                        - generic [ref=e230]: "6"
                        - generic [ref=e231]: "7"
                        - generic [ref=e232]: "8"
                        - generic [ref=e233]: "9"
                      - generic [ref=e234]: .
                      - generic [ref=e236]:
                        - generic [ref=e237]: "0"
                        - generic [ref=e238]: "1"
                        - generic [ref=e239]: "2"
                        - generic [ref=e240]: "3"
                        - generic [ref=e241]: "4"
                        - generic [ref=e242]: "5"
                        - generic [ref=e243]: "6"
                        - generic [ref=e244]: "7"
                        - generic [ref=e245]: "8"
                        - generic [ref=e246]: "9"
                      - generic [ref=e247]: "%"
                  - generic [ref=e248]: Since inception, annualized · Net of fees
                - generic [ref=e250]:
                  - generic [ref=e251]: 1 year
                  - generic [ref=e252]: −2.6%
                - generic [ref=e253]:
                  - text: Returns as of August 2026 · Net of fees ·
                  - generic [ref=e254]: "Returns: Series F"
              - generic [ref=e255]: View the strategy
            - 'link "Alternative strategies Sample data Fund · FundServ Multi-Strategy Four systematic strategies designed to have low correlation with one another +7.6% Since inception, annualized · Net of fees 1 year +9.4% Returns as of August 2026 · Net of fees · Returns: Series F View the strategy" [ref=e258] [cursor=pointer]':
              - /url: /strategies/multi-strategy
              - generic [ref=e259]:
                - generic [aria-hidden] [ref=e260]: "03"
                - generic [ref=e261]: Alternative strategies
                - generic [ref=e262]:
                  - generic "Illustrative figures only, not actual performance." [ref=e263]: Sample data
                  - generic [ref=e264]: Fund · FundServ
              - heading "Multi-Strategy" [level=3] [ref=e265]
              - generic [ref=e266]: Four systematic strategies designed to have low correlation with one another
              - generic [ref=e267]:
                - generic [ref=e268]:
                  - generic [ref=e270]:
                    - generic [ref=e271]: +7.6%
                    - generic [aria-hidden] [ref=e272]:
                      - generic [ref=e273]: +
                      - generic [ref=e275]:
                        - generic [ref=e276]: "0"
                        - generic [ref=e277]: "1"
                        - generic [ref=e278]: "2"
                        - generic [ref=e279]: "3"
                        - generic [ref=e280]: "4"
                        - generic [ref=e281]: "5"
                        - generic [ref=e282]: "6"
                        - generic [ref=e283]: "7"
                        - generic [ref=e284]: "8"
                        - generic [ref=e285]: "9"
                      - generic [ref=e286]: .
                      - generic [ref=e288]:
                        - generic [ref=e289]: "0"
                        - generic [ref=e290]: "1"
                        - generic [ref=e291]: "2"
                        - generic [ref=e292]: "3"
                        - generic [ref=e293]: "4"
                        - generic [ref=e294]: "5"
                        - generic [ref=e295]: "6"
                        - generic [ref=e296]: "7"
                        - generic [ref=e297]: "8"
                        - generic [ref=e298]: "9"
                      - generic [ref=e299]: "%"
                  - generic [ref=e300]: Since inception, annualized · Net of fees
                - generic [ref=e302]:
                  - generic [ref=e303]: 1 year
                  - generic [ref=e304]: +9.4%
                - generic [ref=e305]:
                  - text: Returns as of August 2026 · Net of fees ·
                  - generic [ref=e306]: "Returns: Series F"
              - generic [ref=e307]: View the strategy
            - link "Futures overlay (managed accounts) Sample data Managed accounts Global Minimum Volatility A futures overlay designed to have low correlation with bonds +8.2% Since inception, annualized · Gross of fees 6% downside volatility 1 year +6.1% Returns as of August 2026 · Gross of fees · 6% downside volatility View the strategy" [ref=e310] [cursor=pointer]:
              - /url: /strategies/global-minimum-volatility
              - generic [ref=e311]:
                - generic [aria-hidden] [ref=e312]: "04"
                - generic [ref=e313]: Futures overlay (managed accounts)
                - generic [ref=e314]:
                  - generic "Illustrative figures only, not actual performance." [ref=e315]: Sample data
                  - generic [ref=e316]: Managed accounts
              - heading "Global Minimum Volatility" [level=3] [ref=e317]
              - generic [ref=e318]: A futures overlay designed to have low correlation with bonds
              - generic [ref=e319]:
                - generic [ref=e320]:
                  - generic [ref=e322]:
                    - generic [ref=e323]: +8.2%
                    - generic [aria-hidden] [ref=e324]:
                      - generic [ref=e325]: +
                      - generic [ref=e327]:
                        - generic [ref=e328]: "0"
                        - generic [ref=e329]: "1"
                        - generic [ref=e330]: "2"
                        - generic [ref=e331]: "3"
                        - generic [ref=e332]: "4"
                        - generic [ref=e333]: "5"
                        - generic [ref=e334]: "6"
                        - generic [ref=e335]: "7"
                        - generic [ref=e336]: "8"
                        - generic [ref=e337]: "9"
                      - generic [ref=e338]: .
                      - generic [ref=e340]:
                        - generic [ref=e341]: "0"
                        - generic [ref=e342]: "1"
                        - generic [ref=e343]: "2"
                        - generic [ref=e344]: "3"
                        - generic [ref=e345]: "4"
                        - generic [ref=e346]: "5"
                        - generic [ref=e347]: "6"
                        - generic [ref=e348]: "7"
                        - generic [ref=e349]: "8"
                        - generic [ref=e350]: "9"
                      - generic [ref=e351]: "%"
                  - generic [ref=e352]: Since inception, annualized · Gross of fees
                  - generic [ref=e353]: 6% downside volatility
                - generic [ref=e355]:
                  - generic [ref=e356]: 1 year
                  - generic [ref=e357]: +6.1%
                - generic [ref=e358]: Returns as of August 2026 · Gross of fees · 6% downside volatility
              - generic [ref=e359]: View the strategy
          - paragraph [ref=e362]: Net of fees, in CAD. Past performance may not be repeated. See the important information below. Global Minimum Volatility returns (6% downside volatility variant unless another is selected) are gross of fees (managed accounts, not a fund).
          - link "View all strategies" [ref=e364] [cursor=pointer]:
            - /url: /strategies
      - region [ref=e367]:
        - generic [ref=e368]:
          - generic [ref=e369]:
            - paragraph [ref=e371]: Investment process
            - heading "One pipeline, from data to portfolio" [level=2] [ref=e373]:
              - generic [aria-hidden] [ref=e374]:
                - generic [ref=e375]: One
                - generic [ref=e376]: pipeline,
                - generic [ref=e377]: from
                - generic [ref=e378]: data
                - generic [ref=e379]: to
                - generic [ref=e380]: portfolio
            - generic [ref=e381]: Four documented, tested and monitored steps.
          - list [ref=e383]:
            - listitem [ref=e384]:
              - generic [ref=e390]:
                - paragraph [ref=e391]: "01"
                - heading "Data and research" [level=3] [ref=e392]
                - generic [ref=e393]: Market and fundamental data, cleaned and studied.
            - listitem [ref=e394]:
              - generic [ref=e398]:
                - paragraph [ref=e399]: "02"
                - heading "Signal generation" [level=3] [ref=e400]
                - generic [ref=e401]: Machine-learning signals, kept only after statistical validation.
            - listitem [ref=e402]:
              - generic [ref=e408]:
                - paragraph [ref=e409]: "03"
                - heading "Portfolio construction" [level=3] [ref=e410]
                - generic [ref=e411]: Optimization within risk, liquidity and sustainability limits.
            - listitem [ref=e412]:
              - generic [ref=e417]:
                - paragraph [ref=e418]: "04"
                - heading "Risk management" [level=3] [ref=e419]
                - generic [ref=e420]: Continuous monitoring, adjustments and hedging. Risk management does not eliminate the risk of loss.
          - generic [ref=e421]:
            - link "Our approach" [ref=e422] [cursor=pointer]:
              - /url: /approach
            - link "Meet the team" [ref=e425] [cursor=pointer]:
              - /url: /team
      - region [ref=e428]:
        - generic [ref=e429]:
          - generic [ref=e430]:
            - paragraph [ref=e432]: Clients and platforms
            - heading "Institutions and partners we work with" [level=2] [ref=e434]:
              - generic [aria-hidden] [ref=e435]:
                - generic [ref=e436]: Institutions
                - generic [ref=e437]: and
                - generic [ref=e438]: partners
                - generic [ref=e439]: we
                - generic [ref=e440]: work
                - generic [ref=e441]: with
          - region "Logos of institutions and platforms we work with" [ref=e443]:
            - generic [ref=e444]:
              - list [ref=e445]:
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
              - list [aria-hidden] [ref=e446]
          - paragraph [ref=e447]: "Source: Nymbus Capital Inc. Representative list; not all clients are shown. QEMP: Quebec Emerging Managers Program (Innocap). Inclusion does not imply endorsement."
      - region [ref=e448]:
        - generic [ref=e449]:
          - generic [ref=e450]:
            - paragraph [ref=e452]: News and milestones
            - heading "Recent developments" [level=2] [ref=e454]:
              - generic [aria-hidden] [ref=e455]:
                - generic [ref=e456]: Recent
                - generic [ref=e457]: developments
          - generic [ref=e458]:
            - article [ref=e459]:
              - generic [ref=e470]:
                - paragraph [ref=e471]:
                  - generic [ref=e472]: Partnership
                  - time [ref=e473]: Jan 28, 2025
                - heading "Mageska Capital and Nymbus Capital announce a partnership" [level=3] [ref=e474]
                - 'button "Read more : Mageska Capital and Nymbus Capital announce a partnership" [ref=e475] [cursor=pointer]':
                  - text: Read more
                  - generic [ref=e478]: ": Mageska Capital and Nymbus Capital announce a partnership"
            - article [ref=e479]:
              - generic [ref=e488]:
                - paragraph [ref=e489]:
                  - generic [ref=e490]: ESG
                  - time [ref=e491]: Apr 23, 2024
                - heading "Nymbus becomes a signatory of the Tobacco-Free Finance Pledge" [level=3] [ref=e492]
                - 'button "Read more : Nymbus becomes a signatory of the Tobacco-Free Finance Pledge" [ref=e493] [cursor=pointer]':
                  - text: Read more
                  - generic [ref=e496]: ": Nymbus becomes a signatory of the Tobacco-Free Finance Pledge"
            - article [ref=e497]:
              - generic [ref=e505]:
                - paragraph [ref=e506]:
                  - generic [ref=e507]: Community
                  - time [ref=e508]: Oct 3, 2023
                - heading "Nymbus partners with Dans la rue" [level=3] [ref=e509]
                - 'button "Read more : Nymbus partners with Dans la rue" [ref=e510] [cursor=pointer]':
                  - text: Read more
                  - generic [ref=e513]: ": Nymbus partners with Dans la rue"
          - paragraph [ref=e514]:
            - link "All news" [ref=e515] [cursor=pointer]:
              - /url: /news
      - generic [ref=e520]:
        - heading "Let’s discuss your investment objectives" [level=2] [ref=e521]:
          - generic [aria-hidden] [ref=e522]:
            - generic [ref=e523]: Let’s
            - generic [ref=e524]: discuss
            - generic [ref=e525]: your
            - generic [ref=e526]: investment
            - generic [ref=e527]: objectives
        - paragraph [ref=e529]: Talk to our team about your mandate.
        - generic [ref=e531]:
          - link "Get in touch" [ref=e532] [cursor=pointer]:
            - /url: /contact
          - link "View solutions" [ref=e535] [cursor=pointer]:
            - /url: /solutions
  - contentinfo [ref=e536]:
    - generic [ref=e537]:
      - generic [ref=e538]:
        - generic [ref=e539]:
          - link "Nymbus Capital, home" [ref=e540] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e541]
          - paragraph [ref=e550]: Montreal portfolio manager building systematic fixed income and alternative strategies.
          - generic [ref=e551]:
            - generic [ref=e552]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e553] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e554]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e555] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e556]:
          - heading "Strategies" [level=2] [ref=e557]
          - list [ref=e558]:
            - listitem [ref=e559]:
              - link "Monthly Income" [ref=e560] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e562]:
              - link "Sustainable Enhanced Bonds" [ref=e563] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e565]:
              - link "Multi-Strategy" [ref=e566] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e568]:
              - link "Global Minimum Volatility" [ref=e569] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e571]:
          - heading "Company" [level=2] [ref=e572]
          - list [ref=e573]:
            - listitem [ref=e574]:
              - link "About & team" [ref=e575] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e576]:
              - link "Approach" [ref=e577] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e578]:
              - link "Sustainability" [ref=e579] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e580]:
              - link "Solutions" [ref=e581] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e582]:
          - heading "Resources" [level=2] [ref=e583]
          - list [ref=e584]:
            - listitem [ref=e585]:
              - link "Contact" [ref=e586] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e587]:
              - link "Privacy policy" [ref=e588] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e589]:
              - link "Complaints & code of ethics" [ref=e590] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e591]:
              - link "LinkedIn" [ref=e592] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e596]:
        - paragraph [ref=e597]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
        - paragraph [ref=e598]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
        - paragraph [ref=e599]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
        - paragraph [ref=e600]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
        - paragraph [ref=e601]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
        - paragraph [ref=e602]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative. Unless another variant is selected on the strategy page, the returns shown are those of the 6% downside volatility variant; the strategy is also offered with 3% and 9% downside volatility targets, whose returns differ.
        - paragraph [ref=e603]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
      - generic [ref=e604]:
        - generic [ref=e605]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e606]: PRI signatory
  - alert [ref=e607]
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