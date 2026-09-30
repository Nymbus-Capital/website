# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site.spec.ts >> mobile menu opens, traps focus, closes with Escape
- Location: e2e/site.spec.ts:125:5

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByTestId('menu-toggle')
    - locator resolved to <button type="button" aria-expanded="false" aria-label="Open menu" aria-controls="site-menu" data-testid="menu-toggle" class="icon-btn nav-burger">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <body>…</body> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <body>…</body> intercepts pointer events
    - retrying click action
      - waiting 100ms
    125 × waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - <body>…</body> intercepts pointer events
      - retrying click action
        - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main"
  - banner:
    - generic:
      - link "Nymbus Capital, home":
        - /url: /
        - img "nymbus"
      - navigation "Primary"
      - generic:
        - button "Open menu"
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e20]:
        - generic [ref=e21]:
          - paragraph [ref=e23]: Montreal · systematic fixed income and alternative strategies
          - heading "Scientific investing" [level=1] [ref=e25]:
            - generic [aria-hidden] [ref=e26]:
              - generic [ref=e27]: Scientific
              - generic [ref=e28]: investing
          - paragraph [ref=e30]: Nymbus Capital is a Montreal investment manager that builds fixed income and alternative strategies with quantitative research, systematic portfolio construction and continuous risk management.
          - generic [ref=e32]:
            - link "Explore strategies" [ref=e33] [cursor=pointer]:
              - /url: /strategies
            - link "Investment solutions" [ref=e36] [cursor=pointer]:
              - /url: /solutions
        - generic [ref=e38]:
          - paragraph [ref=e39]:
            - generic [ref=e41]: Daily NAVs as of Sep 28, 2026
            - generic "Illustrative figures only, not actual performance." [ref=e42]: Sample data
          - list [ref=e43]:
            - listitem [ref=e44]:
              - link "Monthly Income Series FP $10.19" [ref=e45] [cursor=pointer]:
                - /url: /strategies/monthly-income
                - generic [ref=e47]:
                  - generic [ref=e48]: Monthly Income
                  - generic [ref=e49]: Series FP
                - generic [ref=e50]: $10.19
            - listitem [ref=e54]:
              - link "Sustainable Enhanced Bonds Series F $9.58" [ref=e55] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
                - generic [ref=e57]:
                  - generic [ref=e58]: Sustainable Enhanced Bonds
                  - generic [ref=e59]: Series F
                - generic [ref=e60]: $9.58
            - listitem [ref=e64]:
              - link "Multi-Strategy Series F $13.03" [ref=e65] [cursor=pointer]:
                - /url: /strategies/multi-strategy
                - generic [ref=e67]:
                  - generic [ref=e68]: Multi-Strategy
                  - generic [ref=e69]: Series F
                - generic [ref=e70]: $13.03
          - paragraph [ref=e74]: NAV · net asset value per unit
      - region [ref=e75]:
        - generic [ref=e77]:
          - generic [ref=e78]:
            - heading "Nymbus at a glance" [level=2] [ref=e79]
            - paragraph [ref=e80]: Investment manager headquartered in Montreal.
          - generic [ref=e81]:
            - generic [ref=e82]:
              - generic [ref=e83]: $1.8B+
              - generic [ref=e84]: Assets under management, including mandates
            - generic [ref=e85]:
              - generic [ref=e86]: "4"
              - generic [ref=e87]: Investment strategies
            - generic [ref=e88]:
              - generic [ref=e89]: "18"
              - generic [ref=e90]: People on our team and board
      - region [ref=e91]:
        - generic [ref=e93]:
          - generic [ref=e94]:
            - generic [ref=e95]:
              - paragraph [ref=e97]: Our approach
              - heading "At the intersection of technology, data and finance" [level=2] [ref=e99]:
                - generic [aria-hidden] [ref=e100]:
                  - generic [ref=e101]: At
                  - generic [ref=e102]: the
                  - generic [ref=e103]: intersection
                  - generic [ref=e104]: of
                  - generic [ref=e105]: technology,
                  - generic [ref=e106]: data
                  - generic [ref=e107]: and
                  - generic [ref=e108]: finance
              - generic [ref=e109]: "We apply the scientific method to investing: form a hypothesis, test it on data, and keep only what holds up out of sample. Our team combines decades of institutional experience with research in machine learning, signal processing and portfolio optimization."
            - generic [ref=e111]:
              - link "Read about our approach" [ref=e112] [cursor=pointer]:
                - /url: /approach
              - link "Meet the team" [ref=e115] [cursor=pointer]:
                - /url: /team
          - generic [ref=e118]:
            - generic [ref=e125]:
              - heading "Quantitative research" [level=3] [ref=e126]
              - paragraph [ref=e127]: Market dynamics, credit fundamentals and risk factors studied with proprietary models and machine learning, security by security.
            - generic [ref=e133]:
              - heading "Systematic construction" [level=3] [ref=e134]
              - paragraph [ref=e135]: Portfolios built by explicit rules and optimization models, with disciplined allocation and rebalancing instead of discretionary calls.
            - generic [ref=e142]:
              - heading "Dynamic risk management" [level=3] [ref=e143]
              - paragraph [ref=e144]: Continuous monitoring, market-regime classification and protection strategies designed to soften drawdowns.
      - region [ref=e145]:
        - generic [ref=e146]:
          - generic [ref=e147]:
            - paragraph [ref=e149]: Strategies
            - heading "Our funds and strategies" [level=2] [ref=e151]:
              - generic [aria-hidden] [ref=e152]:
                - generic [ref=e153]: Our
                - generic [ref=e154]: funds
                - generic [ref=e155]: and
                - generic [ref=e156]: strategies
            - generic [ref=e157]: "Four strategies built by the same research process: two bond funds, a multi-strategy fund and a protection overlay for managed accounts."
          - generic [ref=e159]:
            - link "Short-term fixed income Sample data Fund · FundServ Monthly Income Steady monthly income with a short duration +2.3% Since inception · Net of fees 1 year +1.0% NAV · Series FP $10.19 as of Sep 28, 2026 Returns as of August 2026 · Net of fees View the strategy" [ref=e160] [cursor=pointer]:
              - /url: /strategies/monthly-income
              - generic [ref=e161]:
                - generic [aria-hidden] [ref=e162]: "01"
                - generic [ref=e163]: Short-term fixed income
                - generic [ref=e164]:
                  - generic "Illustrative figures only, not actual performance." [ref=e165]: Sample data
                  - generic [ref=e166]: Fund · FundServ
              - heading "Monthly Income" [level=3] [ref=e167]
              - generic [ref=e168]: Steady monthly income with a short duration
              - generic [ref=e169]:
                - generic [ref=e170]:
                  - generic [ref=e172]:
                    - generic [ref=e173]: +2.3%
                    - generic [aria-hidden] [ref=e174]:
                      - generic [ref=e175]: +
                      - generic [ref=e177]:
                        - generic [ref=e178]: "0"
                        - generic [ref=e179]: "1"
                        - generic [ref=e180]: "2"
                        - generic [ref=e181]: "3"
                        - generic [ref=e182]: "4"
                        - generic [ref=e183]: "5"
                        - generic [ref=e184]: "6"
                        - generic [ref=e185]: "7"
                        - generic [ref=e186]: "8"
                        - generic [ref=e187]: "9"
                      - generic [ref=e188]: .
                      - generic [ref=e190]:
                        - generic [ref=e191]: "0"
                        - generic [ref=e192]: "1"
                        - generic [ref=e193]: "2"
                        - generic [ref=e194]: "3"
                        - generic [ref=e195]: "4"
                        - generic [ref=e196]: "5"
                        - generic [ref=e197]: "6"
                        - generic [ref=e198]: "7"
                        - generic [ref=e199]: "8"
                        - generic [ref=e200]: "9"
                      - generic [ref=e201]: "%"
                  - generic [ref=e202]: Since inception · Net of fees
                - generic [ref=e203]:
                  - generic [ref=e204]:
                    - generic [ref=e205]: 1 year
                    - generic [ref=e206]: +1.0%
                  - generic [ref=e207]:
                    - generic [ref=e208]: NAV · Series FP
                    - generic [ref=e209]: $10.19
                    - generic [ref=e210]: as of Sep 28, 2026
                - generic [ref=e211]: Returns as of August 2026 · Net of fees
              - generic [ref=e212]: View the strategy
            - link "Core fixed income Sample data Fund · FundServ Sustainable Enhanced Bonds The Canadian bond universe, scientifically enhanced +2.3% Since inception · Net of fees 1 year −4.0% NAV · Series F $9.58 as of Sep 28, 2026 Returns as of August 2026 · Net of fees View the strategy" [ref=e215] [cursor=pointer]:
              - /url: /strategies/sustainable-enhanced-bonds
              - generic [ref=e216]:
                - generic [aria-hidden] [ref=e217]: "02"
                - generic [ref=e218]: Core fixed income
                - generic [ref=e219]:
                  - generic "Illustrative figures only, not actual performance." [ref=e220]: Sample data
                  - generic [ref=e221]: Fund · FundServ
              - heading "Sustainable Enhanced Bonds" [level=3] [ref=e222]
              - generic [ref=e223]: The Canadian bond universe, scientifically enhanced
              - generic [ref=e224]:
                - generic [ref=e225]:
                  - generic [ref=e227]:
                    - generic [ref=e228]: +2.3%
                    - generic [aria-hidden] [ref=e229]:
                      - generic [ref=e230]: +
                      - generic [ref=e232]:
                        - generic [ref=e233]: "0"
                        - generic [ref=e234]: "1"
                        - generic [ref=e235]: "2"
                        - generic [ref=e236]: "3"
                        - generic [ref=e237]: "4"
                        - generic [ref=e238]: "5"
                        - generic [ref=e239]: "6"
                        - generic [ref=e240]: "7"
                        - generic [ref=e241]: "8"
                        - generic [ref=e242]: "9"
                      - generic [ref=e243]: .
                      - generic [ref=e245]:
                        - generic [ref=e246]: "0"
                        - generic [ref=e247]: "1"
                        - generic [ref=e248]: "2"
                        - generic [ref=e249]: "3"
                        - generic [ref=e250]: "4"
                        - generic [ref=e251]: "5"
                        - generic [ref=e252]: "6"
                        - generic [ref=e253]: "7"
                        - generic [ref=e254]: "8"
                        - generic [ref=e255]: "9"
                      - generic [ref=e256]: "%"
                  - generic [ref=e257]: Since inception · Net of fees
                - generic [ref=e258]:
                  - generic [ref=e259]:
                    - generic [ref=e260]: 1 year
                    - generic [ref=e261]: −4.0%
                  - generic [ref=e262]:
                    - generic [ref=e263]: NAV · Series F
                    - generic [ref=e264]: $9.58
                    - generic [ref=e265]: as of Sep 28, 2026
                - generic [ref=e266]: Returns as of August 2026 · Net of fees
              - generic [ref=e267]: View the strategy
            - link "Alternative strategies Sample data Fund · FundServ Multi-Strategy Four uncorrelated systematic strategies +7.6% Since inception · Net of fees 1 year +9.4% NAV · Series F $13.03 as of Sep 28, 2026 Returns as of August 2026 · Net of fees View the strategy" [ref=e270] [cursor=pointer]:
              - /url: /strategies/multi-strategy
              - generic [ref=e271]:
                - generic [aria-hidden] [ref=e272]: "03"
                - generic [ref=e273]: Alternative strategies
                - generic [ref=e274]:
                  - generic "Illustrative figures only, not actual performance." [ref=e275]: Sample data
                  - generic [ref=e276]: Fund · FundServ
              - heading "Multi-Strategy" [level=3] [ref=e277]
              - generic [ref=e278]: Four uncorrelated systematic strategies
              - generic [ref=e279]:
                - generic [ref=e280]:
                  - generic [ref=e282]:
                    - generic [ref=e283]: +7.6%
                    - generic [aria-hidden] [ref=e284]:
                      - generic [ref=e285]: +
                      - generic [ref=e287]:
                        - generic [ref=e288]: "0"
                        - generic [ref=e289]: "1"
                        - generic [ref=e290]: "2"
                        - generic [ref=e291]: "3"
                        - generic [ref=e292]: "4"
                        - generic [ref=e293]: "5"
                        - generic [ref=e294]: "6"
                        - generic [ref=e295]: "7"
                        - generic [ref=e296]: "8"
                        - generic [ref=e297]: "9"
                      - generic [ref=e298]: .
                      - generic [ref=e300]:
                        - generic [ref=e301]: "0"
                        - generic [ref=e302]: "1"
                        - generic [ref=e303]: "2"
                        - generic [ref=e304]: "3"
                        - generic [ref=e305]: "4"
                        - generic [ref=e306]: "5"
                        - generic [ref=e307]: "6"
                        - generic [ref=e308]: "7"
                        - generic [ref=e309]: "8"
                        - generic [ref=e310]: "9"
                      - generic [ref=e311]: "%"
                  - generic [ref=e312]: Since inception · Net of fees
                - generic [ref=e313]:
                  - generic [ref=e314]:
                    - generic [ref=e315]: 1 year
                    - generic [ref=e316]: +9.4%
                  - generic [ref=e317]:
                    - generic [ref=e318]: NAV · Series F
                    - generic [ref=e319]: $13.03
                    - generic [ref=e320]: as of Sep 28, 2026
                - generic [ref=e321]: Returns as of August 2026 · Net of fees
              - generic [ref=e322]: View the strategy
            - link "Protection overlay (managed accounts) Sample data Managed accounts Global Minimum Volatility An uncorrelated buffer against bond drawdowns +8.2% Since inception · Gross of fees 1 year +6.1% Returns as of August 2026 · Gross of fees View the strategy" [ref=e325] [cursor=pointer]:
              - /url: /strategies/global-minimum-volatility
              - generic [ref=e326]:
                - generic [aria-hidden] [ref=e327]: "04"
                - generic [ref=e328]: Protection overlay (managed accounts)
                - generic [ref=e329]:
                  - generic "Illustrative figures only, not actual performance." [ref=e330]: Sample data
                  - generic [ref=e331]: Managed accounts
              - heading "Global Minimum Volatility" [level=3] [ref=e332]
              - generic [ref=e333]: An uncorrelated buffer against bond drawdowns
              - generic [ref=e334]:
                - generic [ref=e335]:
                  - generic [ref=e337]:
                    - generic [ref=e338]: +8.2%
                    - generic [aria-hidden] [ref=e339]:
                      - generic [ref=e340]: +
                      - generic [ref=e342]:
                        - generic [ref=e343]: "0"
                        - generic [ref=e344]: "1"
                        - generic [ref=e345]: "2"
                        - generic [ref=e346]: "3"
                        - generic [ref=e347]: "4"
                        - generic [ref=e348]: "5"
                        - generic [ref=e349]: "6"
                        - generic [ref=e350]: "7"
                        - generic [ref=e351]: "8"
                        - generic [ref=e352]: "9"
                      - generic [ref=e353]: .
                      - generic [ref=e355]:
                        - generic [ref=e356]: "0"
                        - generic [ref=e357]: "1"
                        - generic [ref=e358]: "2"
                        - generic [ref=e359]: "3"
                        - generic [ref=e360]: "4"
                        - generic [ref=e361]: "5"
                        - generic [ref=e362]: "6"
                        - generic [ref=e363]: "7"
                        - generic [ref=e364]: "8"
                        - generic [ref=e365]: "9"
                      - generic [ref=e366]: "%"
                  - generic [ref=e367]: Since inception · Gross of fees
                - generic [ref=e369]:
                  - generic [ref=e370]: 1 year
                  - generic [ref=e371]: +6.1%
                - generic [ref=e372]: Returns as of August 2026 · Gross of fees
              - generic [ref=e373]: View the strategy
          - paragraph [ref=e376]: Net of fees, in CAD. Past performance may not be repeated. See the important information below. Global Minimum Volatility returns are gross of fees (managed accounts, not a fund).
          - link "View all strategies" [ref=e378] [cursor=pointer]:
            - /url: /strategies
      - region [ref=e381]:
        - generic [ref=e382]:
          - generic [ref=e383]:
            - paragraph [ref=e385]: Investment process
            - heading "One pipeline, from data to portfolio" [level=2] [ref=e387]:
              - generic [aria-hidden] [ref=e388]:
                - generic [ref=e389]: One
                - generic [ref=e390]: pipeline,
                - generic [ref=e391]: from
                - generic [ref=e392]: data
                - generic [ref=e393]: to
                - generic [ref=e394]: portfolio
            - generic [ref=e395]: The same four steps run behind every strategy, and each one is documented, tested and monitored.
          - list [ref=e397]:
            - listitem [ref=e398]:
              - generic [ref=e404]:
                - paragraph [ref=e405]: "01"
                - heading "Data and research" [level=3] [ref=e406]
                - generic [ref=e407]: Market, security and fundamental data gathered, cleaned and studied to identify persistent drivers of return.
            - listitem [ref=e408]:
              - generic [ref=e412]:
                - paragraph [ref=e413]: "02"
                - heading "Signal generation" [level=3] [ref=e414]
                - generic [ref=e415]: Machine-learning models turn that research into signals, which are kept only after rigorous statistical validation.
            - listitem [ref=e416]:
              - generic [ref=e422]:
                - paragraph [ref=e423]: "03"
                - heading "Portfolio construction" [level=3] [ref=e424]
                - generic [ref=e425]: Optimization combines the signals into a portfolio under explicit constraints on risk, liquidity and sustainability criteria.
            - listitem [ref=e426]:
              - generic [ref=e431]:
                - paragraph [ref=e432]: "04"
                - heading "Risk management" [level=3] [ref=e433]
                - generic [ref=e434]: Positions and exposures are monitored continuously, with regime-based adjustments and hedging when conditions change.
      - region [ref=e435]:
        - generic [ref=e436]:
          - generic [ref=e437]:
            - paragraph [ref=e439]: Clients and platforms
            - heading "Institutions and partners we work with" [level=2] [ref=e441]:
              - generic [aria-hidden] [ref=e442]:
                - generic [ref=e443]: Institutions
                - generic [ref=e444]: and
                - generic [ref=e445]: partners
                - generic [ref=e446]: we
                - generic [ref=e447]: work
                - generic [ref=e448]: with
          - region "Logos of institutions and platforms we work with" [ref=e450]:
            - generic [ref=e451]:
              - list [ref=e452]:
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
              - list [aria-hidden] [ref=e453]
          - generic [ref=e454]:
            - generic [ref=e455]:
              - heading "Institutional clients and programs" [level=3] [ref=e456]
              - list [ref=e457]:
                - listitem [ref=e458]: Fondaction
                - listitem [ref=e459]: Fonds FMOQ
                - listitem [ref=e460]: QEMP (Innocap)
                - listitem [ref=e461]: Caisse de retraite et d’épargne du Groupe Securitas
                - listitem [ref=e462]: GardaWorld
                - listitem [ref=e463]: Bâtirente
            - generic [ref=e464]:
              - heading "Our funds are available through" [level=3] [ref=e465]
              - list [ref=e466]:
                - listitem [ref=e467]: National Bank Financial Wealth Management
                - listitem [ref=e468]: RBC Dominion Securities
                - listitem [ref=e469]: iA Financial Group
          - paragraph [ref=e470]: "Source: Nymbus Capital Inc. Representative list; not all clients are shown. QEMP: Quebec Emerging Managers Program (Innocap). Inclusion does not imply endorsement."
      - region [ref=e471]:
        - generic [ref=e472]:
          - generic [ref=e473]:
            - paragraph [ref=e475]: News and milestones
            - heading "Recent developments" [level=2] [ref=e477]:
              - generic [aria-hidden] [ref=e478]:
                - generic [ref=e479]: Recent
                - generic [ref=e480]: developments
          - generic [ref=e481]:
            - article [ref=e482]:
              - generic [ref=e493]:
                - paragraph [ref=e494]:
                  - generic [ref=e495]: Partnership
                  - time [ref=e496]: Jan 28, 2025
                - heading "Mageska Capital and Nymbus Capital announce a partnership" [level=3] [ref=e497]
                - paragraph [ref=e498]: Mageska entrusts Nymbus with a portion of the Mageska Fund to implement a portable alpha strategy.
                - 'button "Read more : Mageska Capital and Nymbus Capital announce a partnership" [ref=e499] [cursor=pointer]':
                  - text: Read more
                  - generic [ref=e502]: ": Mageska Capital and Nymbus Capital announce a partnership"
            - article [ref=e503]:
              - generic [ref=e512]:
                - paragraph [ref=e513]:
                  - generic [ref=e514]: ESG
                  - time [ref=e515]: Apr 23, 2024
                - heading "Nymbus becomes a signatory of the Tobacco-Free Finance Pledge" [level=3] [ref=e516]
                - paragraph [ref=e517]: Nymbus commits to excluding tobacco companies from all of its portfolios.
                - 'button "Read more : Nymbus becomes a signatory of the Tobacco-Free Finance Pledge" [ref=e518] [cursor=pointer]':
                  - text: Read more
                  - generic [ref=e521]: ": Nymbus becomes a signatory of the Tobacco-Free Finance Pledge"
            - article [ref=e522]:
              - generic [ref=e534]:
                - paragraph [ref=e535]:
                  - generic [ref=e536]: Recognition
                  - time [ref=e537]: Nov 16, 2023
                - heading "Nymbus fixed income strategies ranked in the RBC fund study" [level=3] [ref=e538]
                - paragraph [ref=e539]: All three fixed income strategies managed by Nymbus ranked in the top percentiles of the RBC fund study.
                - 'button "Read more : Nymbus fixed income strategies ranked in the RBC fund study" [ref=e540] [cursor=pointer]':
                  - text: Read more
                  - generic [ref=e543]: ": Nymbus fixed income strategies ranked in the RBC fund study"
            - article [ref=e544]:
              - generic [ref=e552]:
                - paragraph [ref=e553]:
                  - generic [ref=e554]: Community
                  - time [ref=e555]: Oct 3, 2023
                - heading "Nymbus partners with Dans la rue" [level=3] [ref=e556]
                - paragraph [ref=e557]: A partnership with the Montreal organization that supports homeless and at-risk youth.
                - 'button "Read more : Nymbus partners with Dans la rue" [ref=e558] [cursor=pointer]':
                  - text: Read more
                  - generic [ref=e561]: ": Nymbus partners with Dans la rue"
      - generic [ref=e564]:
        - heading "Let’s discuss your investment objectives" [level=2] [ref=e565]:
          - generic [aria-hidden] [ref=e566]:
            - generic [ref=e567]: Let’s
            - generic [ref=e568]: discuss
            - generic [ref=e569]: your
            - generic [ref=e570]: investment
            - generic [ref=e571]: objectives
        - paragraph [ref=e573]: Our team can walk you through the strategies, their track records and how they could fit your portfolio or mandate.
        - generic [ref=e575]:
          - link "Get in touch" [ref=e576] [cursor=pointer]:
            - /url: /contact
          - link "View solutions" [ref=e579] [cursor=pointer]:
            - /url: /solutions
  - contentinfo [ref=e580]:
    - generic [ref=e581]:
      - generic [ref=e582]:
        - generic [ref=e583]:
          - link "Nymbus Capital, home" [ref=e584] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e585]
          - paragraph [ref=e594]: Montreal-based quantitative investment manager building systematic fixed income and multi-asset strategies with scientific rigour.
          - generic [ref=e595]:
            - generic [ref=e596]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e597] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e598]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e599] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e600]:
          - heading "Strategies" [level=2] [ref=e601]
          - list [ref=e602]:
            - listitem [ref=e603]:
              - link "Monthly Income" [ref=e604] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e606]:
              - link "Sustainable Enhanced Bonds" [ref=e607] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e609]:
              - link "Multi-Strategy" [ref=e610] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e612]:
              - link "Global Minimum Volatility" [ref=e613] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e615]:
          - heading "Company" [level=2] [ref=e616]
          - list [ref=e617]:
            - listitem [ref=e618]:
              - link "About & team" [ref=e619] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e620]:
              - link "Approach" [ref=e621] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e622]:
              - link "Sustainability" [ref=e623] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e624]:
              - link "Solutions" [ref=e625] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e626]:
          - heading "Resources" [level=2] [ref=e627]
          - list [ref=e628]:
            - listitem [ref=e629]:
              - link "Contact" [ref=e630] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e631]:
              - link "Privacy policy" [ref=e632] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e633]:
              - link "Complaints & code of ethics" [ref=e634] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e635]:
              - link "LinkedIn" [ref=e636] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e640]:
        - paragraph [ref=e641]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
        - paragraph [ref=e642]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
        - paragraph [ref=e643]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the class shown; periods of less than one year are not annualized.
        - paragraph [ref=e644]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
        - paragraph [ref=e645]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund's returns may have differed had it existed during that period.
        - paragraph [ref=e646]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account.
        - paragraph [ref=e647]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
      - generic [ref=e648]:
        - generic [ref=e649]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e650]: PRI signatory
  - alert [ref=e651]
```

# Test source

```ts
  30  |   page.on("console", (m) => {
  31  |     if (m.type() !== "error") return;
  32  |     const t = m.text();
  33  |     if (/Failed to load resource/.test(t) && /nymbus\.ca|ERR_|net::/.test(t + (m.location().url ?? ""))) return;
  34  |     errors.push(t);
  35  |   });
  36  |   return errors;
  37  | }
  38  | 
  39  | async function scrollThrough(page: Page) {
  40  |   const h = await page.evaluate(() => document.documentElement.scrollHeight);
  41  |   for (let y = 0; y < h; y += 500) {
  42  |     await page.evaluate((top) => window.scrollTo(0, top), y);
  43  |     await page.waitForTimeout(70);
  44  |   }
  45  |   await page.waitForTimeout(1200);
  46  |   await page.evaluate(() => window.scrollTo(0, 0));
  47  |   await page.waitForTimeout(300);
  48  | }
  49  | 
  50  | for (const r of ROUTES) {
  51  |   for (const locale of ["en", "fr"] as const) {
  52  |     test(`${r.path} renders its heading (${locale})`, async ({ page, baseURL }) => {
  53  |       await page.context().addCookies([{ name: "nymbus-locale", value: locale, url: baseURL! }]);
  54  |       const errors = collectErrors(page);
  55  |       const res = await page.goto(r.path);
  56  |       expect(res?.status()).toBe(200);
  57  |       await expect(page.locator("html")).toHaveAttribute("lang", locale);
  58  |       const h1 = page.getByRole("heading", { level: 1 }).first();
  59  |       await expect(h1).toHaveAccessibleName(locale === "en" ? r.en : r.fr);
  60  |       await expect(page.getByTestId("site-nav")).toBeVisible();
  61  |       await expect(page.getByTestId("site-footer")).toBeAttached();
  62  |       expect(errors, errors.join("\n")).toEqual([]);
  63  |     });
  64  |   }
  65  | 
  66  |   test(`${r.path} full-page screenshot`, async ({ page, baseURL }, info) => {
  67  |     await page.context().addCookies([{ name: "nymbus-locale", value: "en", url: baseURL! }]);
  68  |     await page.goto(r.path);
  69  |     await scrollThrough(page);
  70  |     // freeze the keynote swap so every screen is at rest in the capture
  71  |     await page.addStyleTag({ content: ".screen{transform:none!important;filter:none!important;opacity:1!important;clip-path:none!important;animation:none!important}" });
  72  |     await page.screenshot({ path: `${SHOTS}/site-${r.name}-${info.project.name}.png`, fullPage: true });
  73  |   });
  74  | }
  75  | 
  76  | test("unknown route: 404 page in the site chrome", async ({ page }, info) => {
  77  |   const res = await page.goto("/this-page-does-not-exist");
  78  |   expect(res?.status()).toBe(404);
  79  |   await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(/this bond has matured/);
  80  |   await expect(page.getByRole("link", { name: /back to home/ })).toBeVisible();
  81  |   await page.screenshot({ path: `${SHOTS}/site-404-${info.project.name}.png`, fullPage: true });
  82  | });
  83  | 
  84  | test("odometer: the figure's accessible name is the final value", async ({ page }) => {
  85  |   await page.goto("/");
  86  |   const odo = page.locator('[data-testid^="strategy-"] .odo').first();
  87  |   if (!(await odo.count())) test.skip(true, "no published figures in this environment");
  88  |   await odo.scrollIntoViewIfNeeded();
  89  |   await expect(odo.locator(".sr-only")).toHaveText(/^[+−]?\d+\.\d%$/);
  90  | });
  91  | 
  92  | test("home: live figures come from the data, never invented", async ({ page }) => {
  93  |   await page.goto("/");
  94  |   const cards = page.locator('[data-testid^="strategy-"]');
  95  |   await cards.first().scrollIntoViewIfNeeded();
  96  |   await expect(cards).toHaveCount(4);
  97  |   // each card shows either its published figures or the "figures coming soon" state, never both
  98  |   for (let i = 0; i < 4; i++) {
  99  |     const card = cards.nth(i);
  100 |     await card.scrollIntoViewIfNeeded();
  101 |     const figs = await card.getByTestId("fund-figure").count();
  102 |     const soon = await card.getByTestId("figures-soon").count();
  103 |     expect(figs + soon).toBe(1);
  104 |   }
  105 |   // the NAV panel only exists when NAVs are published
  106 |   const panel = page.getByTestId("nav-panel");
  107 |   if (await panel.count()) await expect(panel).toContainText(/daily navs as of/i);
  108 | });
  109 | 
  110 | test("language toggle switches the page to French and back", async ({ page, isMobile }) => {
  111 |   await page.goto("/");
  112 |   await expect(page.getByRole("heading", { level: 1 }).first()).toHaveAccessibleName(/scientific investing/i);
  113 |   if (isMobile) await page.getByTestId("menu-toggle").click();
  114 |   const toggle = isMobile ? page.getByTestId("mobile-menu").getByTestId("lang-toggle") : page.getByTestId("site-nav").getByTestId("lang-toggle");
  115 |   await toggle.click();
  116 |   await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  117 |   if (isMobile) await page.keyboard.press("Escape");
  118 |   await expect(page.getByRole("heading", { level: 1 }).first()).toHaveAccessibleName(/investissement scientifique/i);
  119 |   const cookies = await page.context().cookies();
  120 |   expect(cookies.find((c) => c.name === "nymbus-locale")?.value).toBe("fr");
  121 |   await page.reload();
  122 |   await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  123 | });
  124 | 
  125 | test("mobile menu opens, traps focus, closes with Escape", async ({ page, isMobile }) => {
  126 |   test.skip(!isMobile, "the burger menu is the small-screen navigation");
  127 |   await page.goto("/");
  128 |   const toggle = page.getByTestId("menu-toggle");
  129 |   await expect(toggle).toHaveAttribute("aria-expanded", "false");
> 130 |   await toggle.click();
      |                ^ Error: locator.click: Test timeout of 60000ms exceeded.
  131 |   const menu = page.getByTestId("mobile-menu");
  132 |   await expect(menu).toBeVisible();
  133 |   await expect(toggle).toHaveAttribute("aria-expanded", "true");
  134 |   await expect(menu.getByRole("link", { name: "team" })).toBeVisible();
  135 |   // focus starts inside the menu and stays there
  136 |   expect(await page.evaluate(() => !!document.activeElement?.closest("#site-menu"))).toBe(true);
  137 |   for (let i = 0; i < 20; i++) await page.keyboard.press("Tab");
  138 |   expect(await page.evaluate(() => !!document.activeElement?.closest("#site-menu"))).toBe(true);
  139 |   await page.keyboard.press("Escape");
  140 |   await expect(menu).toBeHidden();
  141 |   await expect(toggle).toBeFocused();
  142 |   // navigating from the menu
  143 |   await toggle.click();
  144 |   await menu.getByRole("link", { name: "team" }).click();
  145 |   await expect(page).toHaveURL(/\/team$/);
  146 |   await expect(menu).toBeHidden();
  147 | });
  148 | 
  149 | test("reduced motion: content is visible without animations", async ({ browser, baseURL }) => {
  150 |   const ctx = await browser.newContext({ reducedMotion: "reduce", baseURL });
  151 |   const page = await ctx.newPage();
  152 |   await page.goto("/");
  153 |   for (const sel of ["#hero-t", "#glance-t", "#approach-t", "#strat-t", "#process-t", "#partners-t", "#news-t"]) {
  154 |     const el = page.locator(sel);
  155 |     await el.scrollIntoViewIfNeeded();
  156 |     const opacity = await el.evaluate((n) => {
  157 |       const w = n.querySelector(".w") ?? n;
  158 |       return Number(getComputedStyle(w).opacity);
  159 |     });
  160 |     expect(opacity, sel).toBe(1);
  161 |   }
  162 |   // revealed blocks are visible even before they scroll in
  163 |   const hidden = await page.evaluate(() =>
  164 |     Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-kids] > *")).filter((e) => getComputedStyle(e).opacity === "0").length,
  165 |   );
  166 |   expect(hidden).toBe(0);
  167 |   await ctx.close();
  168 | });
  169 | 
  170 | test("team: filter by department and open a bio", async ({ page }) => {
  171 |   await page.goto("/team");
  172 |   const people = page.locator(".people > li");
  173 |   await people.first().scrollIntoViewIfNeeded();
  174 |   const all = await people.count();
  175 |   await page.getByRole("button", { name: /^board/ }).click();
  176 |   await expect.poll(() => people.count()).toBeLessThan(all);
  177 |   await page.getByRole("button", { name: /^everyone/ }).click();
  178 |   await expect.poll(() => people.count()).toBe(all);
  179 |   await people.first().getByRole("button").click();
  180 |   const dialog = page.getByTestId("bio-dialog");
  181 |   await expect(dialog).toBeVisible();
  182 |   await expect(dialog.getByRole("heading", { level: 2 })).toBeVisible();
  183 |   await page.keyboard.press("Escape");
  184 |   await expect(dialog).toBeHidden();
  185 | });
  186 | 
  187 | test("contact: validates, then prepares an email (no backend)", async ({ page }) => {
  188 |   await page.goto("/contact");
  189 |   const form = page.getByTestId("contact-form");
  190 |   await form.scrollIntoViewIfNeeded();
  191 |   await form.getByRole("button", { name: /prepare my email/ }).click();
  192 |   await expect(page.getByText("please enter a valid email")).toBeVisible();
  193 |   await page.getByLabel("full name").fill("Test Person");
  194 |   await page.getByLabel("email").fill("test@example.com");
  195 |   await page.getByLabel("message").fill("Hello, I would like to learn more about your funds.");
  196 |   // the mailto: hand-off opens the mail app (a no-op in the test browser); the ready state must show
  197 |   await form.getByRole("button", { name: /prepare my email/ }).click();
  198 |   await expect(page.getByTestId("contact-ready")).toBeVisible();
  199 |   await expect(page.getByTestId("contact-ready").getByRole("link")).toHaveAttribute("href", /^mailto:info@nymbus\.ca\?subject=/);
  200 | });
  201 | 
  202 | test("admin does not get the public chrome", async ({ page, context }) => {
  203 |   await signIn(context);
  204 |   const res = await page.goto("/admin");
  205 |   expect(res?.status()).toBe(200);
  206 |   await expect(page.getByTestId("site-nav")).toHaveCount(0);
  207 |   await expect(page.getByTestId("site-footer")).toHaveCount(0);
  208 | });
  209 | 
```