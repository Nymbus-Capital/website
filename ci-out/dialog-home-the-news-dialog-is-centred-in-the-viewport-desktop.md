# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dialog.spec.ts >> home: the news dialog is centred in the viewport
- Location: e2e/dialog.spec.ts:67:5

# Error details

```
Error: horizontal centre 712.5 vs 720

expect(received).toBeLessThanOrEqual(expected)

Expected: <= 2
Received:    7.5
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
          - 'img "Animated illustration: a table of securities scanned for factor scores, with flagged signals." [ref=e104]':
            - generic [aria-hidden] [ref=e105]:
              - generic [ref=e110]: Analysis · universe, factors, signals
              - generic [ref=e111]: Illustration
            - generic [ref=e114]:
              - generic [ref=e115]:
                - term [ref=e116]: Data points scanned
                - definition [ref=e117]: "0"
              - generic [ref=e118]:
                - term [ref=e119]: Securities screened
                - definition [ref=e120]: "0"
              - generic [ref=e121]:
                - term [ref=e122]: Factors per security
                - definition [ref=e123]: "4"
              - generic [ref=e124]:
                - term [ref=e125]: Signals flagged
                - definition [ref=e126]: "0"
          - paragraph [ref=e127]: "Illustration only: generic labels and generated values, not actual securities, signals or results. The counters count what this animation scans."
          - generic [ref=e128]:
            - generic [ref=e133]:
              - heading "Scientists" [level=3] [ref=e134]
              - paragraph [ref=e135]: Hypotheses, tested on data.
            - generic [ref=e141]:
              - heading "Engineers" [level=3] [ref=e142]
              - paragraph [ref=e143]: Pipelines that run every day.
            - generic [ref=e148]:
              - heading "Together" [level=3] [ref=e149]
              - paragraph [ref=e150]: The harder problems in fixed income.
      - region [ref=e151]:
        - generic [ref=e152]:
          - generic [ref=e153]:
            - paragraph [ref=e155]: Strategies
            - heading "Our funds and strategies" [level=2] [ref=e157]:
              - generic [aria-hidden] [ref=e158]:
                - generic [ref=e159]: Our
                - generic [ref=e160]: funds
                - generic [ref=e161]: and
                - generic [ref=e162]: strategies
            - generic [ref=e163]: Two bond funds, a multi-strategy fund, a futures overlay.
          - generic [ref=e165]:
            - 'link "Short-term fixed income Sample data Fund · FundServ Monthly Income Monthly income from short-term corporate bonds +2.3% Since inception, annualized · Net of fees 1 year +1.0% Returns as of August 2026 · Net of fees · Returns: Series FP View the strategy" [ref=e166] [cursor=pointer]':
              - /url: /strategies/monthly-income
              - generic [ref=e167]:
                - generic [aria-hidden] [ref=e168]: "01"
                - generic [ref=e169]: Short-term fixed income
                - generic [ref=e170]:
                  - generic "Illustrative figures only, not actual performance." [ref=e171]: Sample data
                  - generic [ref=e172]: Fund · FundServ
              - heading "Monthly Income" [level=3] [ref=e173]
              - generic [ref=e174]: Monthly income from short-term corporate bonds
              - generic [ref=e175]:
                - generic [ref=e176]:
                  - generic [ref=e178]:
                    - generic [ref=e179]: +2.3%
                    - generic [aria-hidden] [ref=e180]:
                      - generic [ref=e181]: +
                      - generic [ref=e183]:
                        - generic [ref=e184]: "0"
                        - generic [ref=e185]: "1"
                        - generic [ref=e186]: "2"
                        - generic [ref=e187]: "3"
                        - generic [ref=e188]: "4"
                        - generic [ref=e189]: "5"
                        - generic [ref=e190]: "6"
                        - generic [ref=e191]: "7"
                        - generic [ref=e192]: "8"
                        - generic [ref=e193]: "9"
                      - generic [ref=e194]: .
                      - generic [ref=e196]:
                        - generic [ref=e197]: "0"
                        - generic [ref=e198]: "1"
                        - generic [ref=e199]: "2"
                        - generic [ref=e200]: "3"
                        - generic [ref=e201]: "4"
                        - generic [ref=e202]: "5"
                        - generic [ref=e203]: "6"
                        - generic [ref=e204]: "7"
                        - generic [ref=e205]: "8"
                        - generic [ref=e206]: "9"
                      - generic [ref=e207]: "%"
                  - generic [ref=e208]: Since inception, annualized · Net of fees
                - generic [ref=e210]:
                  - generic [ref=e211]: 1 year
                  - generic [ref=e212]: +1.0%
                - generic [ref=e213]:
                  - text: Returns as of August 2026 · Net of fees ·
                  - generic [ref=e214]: "Returns: Series FP"
              - generic [ref=e215]: View the strategy
            - 'link "Core fixed income Sample data Fund · FundServ Sustainable Enhanced Bonds Canadian core bonds, managed systematically +3.8% Since inception, annualized · Net of fees 1 year −2.6% Returns as of August 2026 · Net of fees · Returns: Series F View the strategy" [ref=e218] [cursor=pointer]':
              - /url: /strategies/sustainable-enhanced-bonds
              - generic [ref=e219]:
                - generic [aria-hidden] [ref=e220]: "02"
                - generic [ref=e221]: Core fixed income
                - generic [ref=e222]:
                  - generic "Illustrative figures only, not actual performance." [ref=e223]: Sample data
                  - generic [ref=e224]: Fund · FundServ
              - heading "Sustainable Enhanced Bonds" [level=3] [ref=e225]
              - generic [ref=e226]: Canadian core bonds, managed systematically
              - generic [ref=e227]:
                - generic [ref=e228]:
                  - generic [ref=e230]:
                    - generic [ref=e231]: +3.8%
                    - generic [aria-hidden] [ref=e232]:
                      - generic [ref=e233]: +
                      - generic [ref=e235]:
                        - generic [ref=e236]: "0"
                        - generic [ref=e237]: "1"
                        - generic [ref=e238]: "2"
                        - generic [ref=e239]: "3"
                        - generic [ref=e240]: "4"
                        - generic [ref=e241]: "5"
                        - generic [ref=e242]: "6"
                        - generic [ref=e243]: "7"
                        - generic [ref=e244]: "8"
                        - generic [ref=e245]: "9"
                      - generic [ref=e246]: .
                      - generic [ref=e248]:
                        - generic [ref=e249]: "0"
                        - generic [ref=e250]: "1"
                        - generic [ref=e251]: "2"
                        - generic [ref=e252]: "3"
                        - generic [ref=e253]: "4"
                        - generic [ref=e254]: "5"
                        - generic [ref=e255]: "6"
                        - generic [ref=e256]: "7"
                        - generic [ref=e257]: "8"
                        - generic [ref=e258]: "9"
                      - generic [ref=e259]: "%"
                  - generic [ref=e260]: Since inception, annualized · Net of fees
                - generic [ref=e262]:
                  - generic [ref=e263]: 1 year
                  - generic [ref=e264]: −2.6%
                - generic [ref=e265]:
                  - text: Returns as of August 2026 · Net of fees ·
                  - generic [ref=e266]: "Returns: Series F"
              - generic [ref=e267]: View the strategy
            - 'link "Alternative strategies Sample data Fund · FundServ Multi-Strategy Four systematic strategies designed to have low correlation with one another +7.6% Since inception, annualized · Net of fees 1 year +9.4% Returns as of August 2026 · Net of fees · Returns: Series F View the strategy" [ref=e270] [cursor=pointer]':
              - /url: /strategies/multi-strategy
              - generic [ref=e271]:
                - generic [aria-hidden] [ref=e272]: "03"
                - generic [ref=e273]: Alternative strategies
                - generic [ref=e274]:
                  - generic "Illustrative figures only, not actual performance." [ref=e275]: Sample data
                  - generic [ref=e276]: Fund · FundServ
              - heading "Multi-Strategy" [level=3] [ref=e277]
              - generic [ref=e278]: Four systematic strategies designed to have low correlation with one another
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
                  - generic [ref=e312]: Since inception, annualized · Net of fees
                - generic [ref=e314]:
                  - generic [ref=e315]: 1 year
                  - generic [ref=e316]: +9.4%
                - generic [ref=e317]:
                  - text: Returns as of August 2026 · Net of fees ·
                  - generic [ref=e318]: "Returns: Series F"
              - generic [ref=e319]: View the strategy
            - link "Futures overlay (managed accounts) Sample data Managed accounts Global Minimum Volatility A futures overlay designed to have low correlation with bonds +8.2% Since inception, annualized · Gross of fees 1 year +6.1% Returns as of August 2026 · Gross of fees View the strategy" [ref=e322] [cursor=pointer]:
              - /url: /strategies/global-minimum-volatility
              - generic [ref=e323]:
                - generic [aria-hidden] [ref=e324]: "04"
                - generic [ref=e325]: Futures overlay (managed accounts)
                - generic [ref=e326]:
                  - generic "Illustrative figures only, not actual performance." [ref=e327]: Sample data
                  - generic [ref=e328]: Managed accounts
              - heading "Global Minimum Volatility" [level=3] [ref=e329]
              - generic [ref=e330]: A futures overlay designed to have low correlation with bonds
              - generic [ref=e331]:
                - generic [ref=e332]:
                  - generic [ref=e334]:
                    - generic [ref=e335]: +8.2%
                    - generic [aria-hidden] [ref=e336]:
                      - generic [ref=e337]: +
                      - generic [ref=e339]:
                        - generic [ref=e340]: "0"
                        - generic [ref=e341]: "1"
                        - generic [ref=e342]: "2"
                        - generic [ref=e343]: "3"
                        - generic [ref=e344]: "4"
                        - generic [ref=e345]: "5"
                        - generic [ref=e346]: "6"
                        - generic [ref=e347]: "7"
                        - generic [ref=e348]: "8"
                        - generic [ref=e349]: "9"
                      - generic [ref=e350]: .
                      - generic [ref=e352]:
                        - generic [ref=e353]: "0"
                        - generic [ref=e354]: "1"
                        - generic [ref=e355]: "2"
                        - generic [ref=e356]: "3"
                        - generic [ref=e357]: "4"
                        - generic [ref=e358]: "5"
                        - generic [ref=e359]: "6"
                        - generic [ref=e360]: "7"
                        - generic [ref=e361]: "8"
                        - generic [ref=e362]: "9"
                      - generic [ref=e363]: "%"
                  - generic [ref=e364]: Since inception, annualized · Gross of fees
                - generic [ref=e366]:
                  - generic [ref=e367]: 1 year
                  - generic [ref=e368]: +6.1%
                - generic [ref=e369]: Returns as of August 2026 · Gross of fees
              - generic [ref=e370]: View the strategy
          - paragraph [ref=e373]: Net of fees, in CAD. Past performance may not be repeated. See the important information below. Global Minimum Volatility returns are gross of fees (managed accounts, not a fund).
          - link "View all strategies" [ref=e375] [cursor=pointer]:
            - /url: /strategies
      - region [ref=e378]:
        - generic [ref=e379]:
          - generic [ref=e380]:
            - paragraph [ref=e382]: Investment process
            - heading "One pipeline, from data to portfolio" [level=2] [ref=e384]:
              - generic [aria-hidden] [ref=e385]:
                - generic [ref=e386]: One
                - generic [ref=e387]: pipeline,
                - generic [ref=e388]: from
                - generic [ref=e389]: data
                - generic [ref=e390]: to
                - generic [ref=e391]: portfolio
            - generic [ref=e392]: Four documented, tested and monitored steps.
          - list [ref=e394]:
            - listitem [ref=e395]:
              - generic [ref=e401]:
                - paragraph [ref=e402]: "01"
                - heading "Data and research" [level=3] [ref=e403]
                - generic [ref=e404]: Market and fundamental data, cleaned and studied.
            - listitem [ref=e405]:
              - generic [ref=e409]:
                - paragraph [ref=e410]: "02"
                - heading "Signal generation" [level=3] [ref=e411]
                - generic [ref=e412]: Machine-learning signals, kept only after statistical validation.
            - listitem [ref=e413]:
              - generic [ref=e419]:
                - paragraph [ref=e420]: "03"
                - heading "Portfolio construction" [level=3] [ref=e421]
                - generic [ref=e422]: Optimization within risk, liquidity and sustainability limits.
            - listitem [ref=e423]:
              - generic [ref=e428]:
                - paragraph [ref=e429]: "04"
                - heading "Risk management" [level=3] [ref=e430]
                - generic [ref=e431]: Continuous monitoring, adjustments and hedging. Risk management does not eliminate the risk of loss.
          - generic [ref=e432]:
            - link "Our approach" [ref=e433] [cursor=pointer]:
              - /url: /approach
            - link "Meet the team" [ref=e436] [cursor=pointer]:
              - /url: /team
      - region [ref=e439]:
        - generic [ref=e440]:
          - generic [ref=e441]:
            - paragraph [ref=e443]: Clients and platforms
            - heading "Institutions and partners we work with" [level=2] [ref=e445]:
              - generic [aria-hidden] [ref=e446]:
                - generic [ref=e447]: Institutions
                - generic [ref=e448]: and
                - generic [ref=e449]: partners
                - generic [ref=e450]: we
                - generic [ref=e451]: work
                - generic [ref=e452]: with
          - region "Logos of institutions and platforms we work with" [ref=e454]:
            - generic [ref=e455]:
              - list [ref=e456]:
                - listitem [ref=e457]:
                  - img "Fondaction" [ref=e458]
                - listitem [ref=e459]:
                  - img "Fonds FMOQ" [ref=e460]
                - listitem [ref=e461]:
                  - img "QEMP (Innocap)" [ref=e462]
                - listitem [ref=e463]:
                  - img "Caisse de retraite et d’épargne du Groupe Securitas" [ref=e464]
                - listitem [ref=e465]:
                  - img "GardaWorld" [ref=e466]
                - listitem [ref=e467]:
                  - img "Bâtirente" [ref=e468]
                - listitem [ref=e469]:
                  - img "National Bank Financial Wealth Management" [ref=e470]
                - listitem [ref=e471]:
                  - img "RBC Dominion Securities" [ref=e472]
                - listitem [ref=e473]:
                  - img "iA Financial Group" [ref=e474]
              - list [aria-hidden] [ref=e475]:
                - listitem [ref=e476]
                - listitem [ref=e478]
                - listitem [ref=e480]
                - listitem [ref=e482]
                - listitem [ref=e484]
                - listitem [ref=e486]
                - listitem [ref=e488]
                - listitem [ref=e490]
                - listitem [ref=e492]
          - paragraph [ref=e494]: "Source: Nymbus Capital Inc. Representative list; not all clients are shown. QEMP: Quebec Emerging Managers Program (Innocap). Inclusion does not imply endorsement."
      - region [ref=e495]:
        - generic [ref=e496]:
          - generic [ref=e497]:
            - paragraph [ref=e499]: News and milestones
            - heading "Recent developments" [level=2] [ref=e501]:
              - generic [aria-hidden] [ref=e502]:
                - generic [ref=e503]: Recent
                - generic [ref=e504]: developments
          - generic [ref=e505]:
            - article [ref=e506]:
              - generic [ref=e517]:
                - paragraph [ref=e518]:
                  - generic [ref=e519]: Partnership
                  - time [ref=e520]: Jan 28, 2025
                - heading "Mageska Capital and Nymbus Capital announce a partnership" [level=3] [ref=e521]
                - 'button "Read more : Mageska Capital and Nymbus Capital announce a partnership" [ref=e522] [cursor=pointer]':
                  - text: Read more
                  - generic [ref=e525]: ": Mageska Capital and Nymbus Capital announce a partnership"
            - article [ref=e526]:
              - generic [ref=e535]:
                - paragraph [ref=e536]:
                  - generic [ref=e537]: ESG
                  - time [ref=e538]: Apr 23, 2024
                - heading "Nymbus becomes a signatory of the Tobacco-Free Finance Pledge" [level=3] [ref=e539]
                - 'button "Read more : Nymbus becomes a signatory of the Tobacco-Free Finance Pledge" [ref=e540] [cursor=pointer]':
                  - text: Read more
                  - generic [ref=e543]: ": Nymbus becomes a signatory of the Tobacco-Free Finance Pledge"
            - article [ref=e544]:
              - generic [ref=e552]:
                - paragraph [ref=e553]:
                  - generic [ref=e554]: Community
                  - time [ref=e555]: Oct 3, 2023
                - heading "Nymbus partners with Dans la rue" [level=3] [ref=e556]
                - 'button "Read more : Nymbus partners with Dans la rue" [ref=e557] [cursor=pointer]':
                  - text: Read more
                  - generic [ref=e560]: ": Nymbus partners with Dans la rue"
          - dialog [ref=e561]:
            - generic [ref=e562]:
              - button "Close" [active] [ref=e563] [cursor=pointer]
              - paragraph [ref=e567]:
                - generic [ref=e568]: Partnership
                - time [ref=e569]: Jan 28, 2025
              - heading "Mageska Capital and Nymbus Capital announce a partnership" [level=2] [ref=e570]
              - paragraph [ref=e572]: "Mageska Capital entrusted Nymbus with the mandate: a portable alpha strategy using Nymbus’ low-volatility strategies, designed to have low correlation with traditional indices."
      - generic [ref=e575]:
        - heading "Let’s discuss your investment objectives" [level=2] [ref=e576]:
          - generic [aria-hidden] [ref=e577]:
            - generic [ref=e578]: Let’s
            - generic [ref=e579]: discuss
            - generic [ref=e580]: your
            - generic [ref=e581]: investment
            - generic [ref=e582]: objectives
        - paragraph [ref=e584]: Talk to our team about your mandate.
        - generic [ref=e586]:
          - link "Get in touch" [ref=e587] [cursor=pointer]:
            - /url: /contact
          - link "View solutions" [ref=e590] [cursor=pointer]:
            - /url: /solutions
  - contentinfo [ref=e591]:
    - generic [ref=e592]:
      - generic [ref=e593]:
        - generic [ref=e594]:
          - link "Nymbus Capital, home" [ref=e595] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e596]
          - paragraph [ref=e605]: Montreal portfolio manager building systematic fixed income and alternative strategies.
          - generic [ref=e606]:
            - generic [ref=e607]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e608] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e609]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e610] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e611]:
          - heading "Strategies" [level=2] [ref=e612]
          - list [ref=e613]:
            - listitem [ref=e614]:
              - link "Monthly Income" [ref=e615] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e617]:
              - link "Sustainable Enhanced Bonds" [ref=e618] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e620]:
              - link "Multi-Strategy" [ref=e621] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e623]:
              - link "Global Minimum Volatility" [ref=e624] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e626]:
          - heading "Company" [level=2] [ref=e627]
          - list [ref=e628]:
            - listitem [ref=e629]:
              - link "About & team" [ref=e630] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e631]:
              - link "Approach" [ref=e632] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e633]:
              - link "Sustainability" [ref=e634] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e635]:
              - link "Solutions" [ref=e636] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e637]:
          - heading "Resources" [level=2] [ref=e638]
          - list [ref=e639]:
            - listitem [ref=e640]:
              - link "Contact" [ref=e641] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e642]:
              - link "Privacy policy" [ref=e643] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e644]:
              - link "Complaints & code of ethics" [ref=e645] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e646]:
              - link "LinkedIn" [ref=e647] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e651]:
        - paragraph [ref=e652]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
        - paragraph [ref=e653]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
        - paragraph [ref=e654]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
        - paragraph [ref=e655]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
        - paragraph [ref=e656]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
        - paragraph [ref=e657]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative.
        - paragraph [ref=e658]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
      - generic [ref=e659]:
        - generic [ref=e660]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e661]: PRI signatory
  - alert [ref=e662]
```

# Test source

```ts
  1  | import { expect, test, type Page } from "@playwright/test";
  2  | 
  3  | /**
  4  |  * Modal dialogs (team bios, news): centred in the viewport (not at the top-left, which Tailwind's margin reset caused),
  5  |  * page scroll locked while open, focus kept inside, Escape and backdrop close them, nothing overflows on a phone.
  6  |  */
  7  | async function settled(page: Page, testId: string) {
  8  |   await page.getByTestId(testId).evaluate((d) => Promise.all(d.getAnimations().map((a) => a.finished.catch(() => null))));
  9  | }
  10 | 
  11 | async function expectCentred(page: Page, testId: string) {
  12 |   await settled(page, testId);
  13 |   const r = await page.evaluate((id) => {
  14 |     const el = document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
  15 |     const b = el.getBoundingClientRect();
  16 |     const vv = window.visualViewport;
  17 |     const w = vv?.width ?? window.innerWidth, h = vv?.height ?? window.innerHeight;
  18 |     return { cx: b.left + b.width / 2, cy: b.top + b.height / 2, w, h, left: b.left, right: b.right, top: b.top, bottom: b.bottom };
  19 |   }, testId);
> 20 |   expect(Math.abs(r.cx - r.w / 2), `horizontal centre ${r.cx} vs ${r.w / 2}`).toBeLessThanOrEqual(2);
     |                                                                               ^ Error: horizontal centre 712.5 vs 720
  21 |   expect(Math.abs(r.cy - r.h / 2), `vertical centre ${r.cy} vs ${r.h / 2}`).toBeLessThanOrEqual(2);
  22 |   expect(r.left).toBeGreaterThanOrEqual(0);
  23 |   expect(r.right).toBeLessThanOrEqual(r.w + 0.5);
  24 |   expect(r.top).toBeGreaterThanOrEqual(0);
  25 |   expect(r.bottom).toBeLessThanOrEqual(r.h + 0.5);
  26 | }
  27 | 
  28 | test("team: the bio dialog is centred in the viewport, locks the page scroll and traps focus", async ({ page }) => {
  29 |   await page.goto("/team");
  30 |   const people = page.getByTestId("people").locator(":scope > li");
  31 |   await people.first().scrollIntoViewIfNeeded();
  32 |   // scrolled away from the top: the dialog is still centred in the viewport, not on the page
  33 |   await page.evaluate(() => window.scrollBy(0, 300));
  34 |   const opener = people.nth(2).getByRole("button");
  35 |   await opener.click();
  36 |   const dialog = page.getByTestId("bio-dialog");
  37 |   await expect(dialog).toBeVisible();
  38 |   await expectCentred(page, "bio-dialog");
  39 |   expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");
  40 |   // focus stays inside the dialog whatever is tabbed
  41 |   for (let i = 0; i < 6; i++) {
  42 |     await page.keyboard.press("Tab");
  43 |     expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
  44 |   }
  45 |   await page.keyboard.press("Escape");
  46 |   await expect(dialog).toBeHidden();
  47 |   expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");
  48 |   await expect(opener).toBeFocused();
  49 | });
  50 | 
  51 | test("team: the bio dialog closes from the backdrop and the close button", async ({ page }) => {
  52 |   await page.goto("/team");
  53 |   const people = page.getByTestId("people").locator(":scope > li");
  54 |   await people.first().scrollIntoViewIfNeeded();
  55 |   const dialog = page.getByTestId("bio-dialog");
  56 |   await people.first().getByRole("button").click();
  57 |   await expect(dialog).toBeVisible();
  58 |   await settled(page, "bio-dialog");
  59 |   await page.mouse.click(4, 4);
  60 |   await expect(dialog).toBeHidden();
  61 |   await people.first().getByRole("button").click();
  62 |   await expect(dialog).toBeVisible();
  63 |   await dialog.getByRole("button", { name: /close|fermer/i }).click();
  64 |   await expect(dialog).toBeHidden();
  65 | });
  66 | 
  67 | test("home: the news dialog is centred in the viewport", async ({ page }) => {
  68 |   await page.goto("/");
  69 |   const card = page.getByTestId("news-mageska");
  70 |   await card.scrollIntoViewIfNeeded();
  71 |   await card.getByRole("button", { name: /read more/i }).click();
  72 |   await expect(page.getByTestId("news-dialog")).toBeVisible();
  73 |   await expectCentred(page, "news-dialog");
  74 | });
  75 | 
```