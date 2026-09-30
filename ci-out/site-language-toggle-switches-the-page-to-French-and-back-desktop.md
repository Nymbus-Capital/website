# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site.spec.ts >> language toggle switches the page to French and back
- Location: e2e/site.spec.ts:110:5

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByTestId('site-nav').getByTestId('lang-toggle')
    - locator resolved to <button lang="fr" type="button" class="lang-btn " data-testid="lang-toggle" aria-label="Afficher le site en français">…</button>
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
    87 × waiting for element to be visible, enabled and stable
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
      - navigation "Primary":
        - list:
          - listitem:
            - link "Strategies":
              - /url: /strategies
          - listitem:
            - link "Approach":
              - /url: /approach
          - listitem:
            - link "About":
              - /url: /team
          - listitem:
            - link "Solutions":
              - /url: /solutions
          - listitem:
            - link "Sustainability":
              - /url: /sustainability
          - listitem:
            - link "Contact":
              - /url: /contact
      - generic:
        - button "Afficher le site en français":
          - generic [aria-hidden]: en
          - generic [aria-hidden]: fr
  - main [ref=e3]:
    - generic [ref=e4]:
      - region [ref=e5]:
        - generic [ref=e7]:
          - generic [ref=e8]: systematic fixed income
          - heading "scientific investing" [level=1] [ref=e9]:
            - generic [aria-hidden] [ref=e10]:
              - generic [ref=e11]: scientific
              - generic [ref=e12]: investing
          - paragraph [ref=e13]: scientists and market veterans tackling problems traditional managers don't.
          - generic [ref=e14]:
            - link "explore our strategies" [ref=e15] [cursor=pointer]:
              - /url: /strategies
            - link "our approach" [ref=e18] [cursor=pointer]:
              - /url: /approach
        - region "net asset value per unit" [ref=e19]:
          - generic "Illustrative figures only, not actual performance." [ref=e21]: Sample data
          - generic [ref=e23]:
            - generic [ref=e24]:
              - link "Monthly Income LDM001 10.1905 +0.11%" [ref=e25] [cursor=pointer]:
                - /url: /strategies/monthly-income
                - generic [ref=e27]: Monthly Income
                - emphasis [ref=e28]: LDM001
                - generic [ref=e29]: "10.1905"
                - generic [ref=e30]: +0.11%
              - link "Sustainable Enhanced Bonds LDM201 9.5816 −0.09%" [ref=e31] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
                - generic [ref=e33]: Sustainable Enhanced Bonds
                - emphasis [ref=e34]: LDM201
                - generic [ref=e35]: "9.5816"
                - generic [ref=e36]: −0.09%
              - link "Multi-Strategy LDM301 13.0285 −0.39%" [ref=e37] [cursor=pointer]:
                - /url: /strategies/multi-strategy
                - generic [ref=e39]: Multi-Strategy
                - emphasis [ref=e40]: LDM301
                - generic [ref=e41]: "13.0285"
                - generic [ref=e42]: −0.39%
              - generic [ref=e43]: nav as of sep 28, 2026
            - generic [aria-hidden] [ref=e44]:
              - link [ref=e45] [cursor=pointer]:
                - /url: /strategies/monthly-income
                - generic [ref=e47]: Monthly Income
                - emphasis [ref=e48]: LDM001
                - generic [ref=e49]: "10.1905"
                - generic [ref=e50]: +0.11%
              - link [ref=e51] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
                - generic [ref=e53]: Sustainable Enhanced Bonds
                - emphasis [ref=e54]: LDM201
                - generic [ref=e55]: "9.5816"
                - generic [ref=e56]: −0.09%
              - link [ref=e57] [cursor=pointer]:
                - /url: /strategies/multi-strategy
                - generic [ref=e59]: Multi-Strategy
                - emphasis [ref=e60]: LDM301
                - generic [ref=e61]: "13.0285"
                - generic [ref=e62]: −0.39%
              - generic [ref=e63]: nav as of sep 28, 2026
      - region [ref=e66]:
        - generic [ref=e67]:
          - generic [ref=e68]: 01 · bonds investment process
          - heading "how we build bond portfolios" [level=2] [ref=e71]:
            - generic [aria-hidden] [ref=e72]:
              - generic [ref=e73]: how
              - generic [ref=e74]: we
              - generic [ref=e75]: build
              - generic [ref=e76]: bond
              - generic [ref=e77]: portfolios
      - region [ref=e78]:
        - generic [ref=e79]:
          - generic [ref=e80]:
            - generic [ref=e81]: our investment philosophy
            - heading "two pillars, working together." [level=2] [ref=e83]:
              - generic [aria-hidden] [ref=e84]:
                - generic [ref=e85]: two
                - generic [ref=e86]: pillars,
                - generic [ref=e87]: working
                - generic [ref=e88]: together.
          - generic [ref=e89]:
            - article [ref=e90]:
              - generic [aria-hidden] [ref=e91]: "01"
              - paragraph [ref=e92]: fixed income process
              - heading "systematic, regime-aware bond management" [level=3] [ref=e93]
              - paragraph [ref=e94]: a two-system framework (macro regime/sector positioning and security selection) running across all of our fixed income mandates
            - article [ref=e95]:
              - generic [aria-hidden] [ref=e96]: "02"
              - paragraph [ref=e97]: protection overlay
              - heading "an uncorrelated buffer for bond drawdowns" [level=3] [ref=e98]
              - paragraph [ref=e99]: a managed futures overlay that tends to perform in higher-volatility regimes, softening the conditions that hurt bond portfolios
      - region [ref=e100]:
        - generic [ref=e101]:
          - generic [ref=e102]:
            - generic [ref=e103]: bonds investment process
            - heading "bonds investment process" [level=2] [ref=e104]:
              - generic [aria-hidden] [ref=e105]:
                - generic [ref=e106]: bonds
                - generic [ref=e107]: investment
                - generic [ref=e108]: process
          - generic [ref=e109]:
            - generic [ref=e111]:
              - generic [ref=e112]:
                - generic [ref=e113]: system 1
                - heading "(macro) portfolio positioning" [level=3] [ref=e114]
              - list [ref=e115]:
                - listitem [ref=e116]:
                  - generic [aria-hidden] [ref=e117]: "1"
                  - paragraph [ref=e118]: identify market regimes & trends
                - listitem [ref=e119]:
                  - generic [aria-hidden] [ref=e120]: "2"
                  - paragraph [ref=e121]: build the curve/credit matrix using billions of bond datapoints
              - list [ref=e122]:
                - listitem [ref=e123]: systematic
                - listitem [ref=e124]: macro; top-down
                - listitem [ref=e125]: rebalancing every 6 month
                - listitem [ref=e126]: systematize a PM’s experience
            - generic [ref=e127]:
              - generic [ref=e128]:
                - generic [ref=e129]: system 2
                - heading "(micro) security selection" [level=3] [ref=e130]
              - list [ref=e131]:
                - listitem [ref=e132]:
                  - generic [aria-hidden] [ref=e133]: "3"
                  - paragraph [ref=e134]: continuously score and rank the bonds in each “cell” by yield to maturity / risk
                - listitem [ref=e135]:
                  - generic [aria-hidden] [ref=e136]: "4"
                  - paragraph [ref=e137]: select the final securities
              - list [ref=e138]:
                - listitem [ref=e139]: systematic + discretionary
                - listitem [ref=e140]: micro; bottom-up
                - listitem [ref=e141]: continuous rebalancing (alert)
                - listitem [ref=e142]: replicate an analyst’s in-depth knowledge
      - region [ref=e143]:
        - generic [ref=e144]:
          - generic [ref=e145]: 02 · protection strategy
          - heading "why add a protection overlay to a bond portfolio?" [level=2] [ref=e148]:
            - generic [aria-hidden] [ref=e149]:
              - generic [ref=e150]: why
              - generic [ref=e151]: add
              - generic [ref=e152]: a
              - generic [ref=e153]: protection
              - generic [ref=e154]: overlay
              - generic [ref=e155]: to
              - generic [ref=e156]: a
              - generic [ref=e157]: bond
              - generic [ref=e158]: portfolio?
      - region [ref=e159]:
        - generic [ref=e160]:
          - generic [ref=e161]:
            - generic [ref=e162]:
              - generic [ref=e163]: protection strategy
              - heading "the fixed income challenge" [level=2] [ref=e164]
              - list [ref=e165]:
                - listitem [ref=e166]:
                  - generic [ref=e167]: the problem
                  - paragraph [ref=e168]: bonds suffer when…
                  - paragraph [ref=e169]: rates rise · inflation spikes · spreads widen
                - listitem:
                  - generic: the common thread
                  - paragraph: all create… elevated volatility
                  - paragraph: the risks we’re trying to mitigate statistically with overlays
                - listitem:
                  - generic: our solution
                  - paragraph: managed futures overlays tend to perform in those same conditions
                  - paragraph: our uncorrelated protection strategy acts as a statistical hedge and typically buffers bond drawdowns when volatility rises*
                - listitem:
                  - generic: how a protection overlay works
                  - paragraph: "your capital stays 100% invested: the overlay stacks on top using futures (~5-10% deposit)"
                  - paragraph:
                    - generic: total return
                    - generic: =
                    - generic: portfolio return
                    - generic: +
                    - generic: overlay return
            - generic [aria-hidden] [ref=e170]:
              - generic [ref=e171]:
                - generic [ref=e172]: rates rise
                - generic [ref=e178]: inflation spikes
                - generic [ref=e183]: spreads widen
                - generic [ref=e189]: elevated volatility
                - generic [ref=e194]:
                  - generic [ref=e195]: overlay
                  - generic [ref=e197]:
                    - generic [ref=e198]: your portfolio
                    - generic [ref=e199]: 5–10%
                  - generic [ref=e200]: still 100% of your capital
              - figure [ref=e201]:
                - generic [ref=e202]:
                  - generic [ref=e203]: drawdowns through a volatile period
                  - generic [ref=e204]: bonds onlywith overlay
                - generic [ref=e211]: illustrative shape, not actual performance
          - paragraph [ref=e212]: "* Source: Nymbus Capital Inc. | Statements reflect historical observations of the Nymbus bond funds underlying strategies for conceptual visualization purposes and should not be construed as an exact representation of past contributions or future expectations."
      - region [ref=e213]:
        - generic [ref=e214]:
          - generic [ref=e215]: 03 · strategies
          - heading "our investment strategies" [level=2] [ref=e218]:
            - generic [aria-hidden] [ref=e219]:
              - generic [ref=e220]: our
              - generic [ref=e221]: investment
              - generic [ref=e222]: strategies
      - region [ref=e223]:
        - generic [ref=e224]:
          - generic [ref=e225]:
            - generic [ref=e226]: strategies
            - heading "four strategies, one scientific process" [level=2] [ref=e227]
          - generic [ref=e228]:
            - 'link "Sample data fund Monthly Income Short-term fixed income +2.3% net annualized return · since inception august 2026 risk risk: low to medium low to medium fund code LDM001 view the strategy" [ref=e229] [cursor=pointer]':
              - /url: /strategies/monthly-income
              - generic [ref=e231]:
                - generic [aria-hidden] [ref=e232]: "01"
                - generic [ref=e233]:
                  - generic "Illustrative figures only, not actual performance." [ref=e234]: Sample data
                  - generic [ref=e235]: fund
              - generic [ref=e236]: Monthly Income
              - generic [ref=e237]: Short-term fixed income
              - generic [ref=e238]:
                - generic [ref=e240]:
                  - generic [ref=e241]: +2.3%
                  - generic [aria-hidden] [ref=e242]:
                    - generic [ref=e243]: +
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
                    - generic [ref=e256]: .
                    - generic [ref=e258]:
                      - generic [ref=e259]: "0"
                      - generic [ref=e260]: "1"
                      - generic [ref=e261]: "2"
                      - generic [ref=e262]: "3"
                      - generic [ref=e263]: "4"
                      - generic [ref=e264]: "5"
                      - generic [ref=e265]: "6"
                      - generic [ref=e266]: "7"
                      - generic [ref=e267]: "8"
                      - generic [ref=e268]: "9"
                    - generic [ref=e269]: "%"
                - generic [ref=e270]: net annualized return · since inception
                - generic [ref=e271]: august 2026
              - generic [ref=e272]:
                - generic [ref=e273]:
                  - generic [ref=e274]: risk
                  - 'img "risk: low to medium" [ref=e275]'
                  - generic [ref=e281]: low to medium
                - generic [ref=e282]:
                  - generic [ref=e283]: fund code
                  - generic [ref=e284]: LDM001
              - generic [ref=e285]: view the strategy
            - 'link "Sample data fund Sustainable Enhanced Bonds Core fixed income +2.3% net annualized return · since inception august 2026 risk risk: low low fund code LDM201 view the strategy" [ref=e289] [cursor=pointer]':
              - /url: /strategies/sustainable-enhanced-bonds
              - generic [ref=e291]:
                - generic [aria-hidden] [ref=e292]: "02"
                - generic [ref=e293]:
                  - generic "Illustrative figures only, not actual performance." [ref=e294]: Sample data
                  - generic [ref=e295]: fund
              - generic [ref=e296]: Sustainable Enhanced Bonds
              - generic [ref=e297]: Core fixed income
              - generic [ref=e298]:
                - generic [ref=e300]:
                  - generic [ref=e301]: +2.3%
                  - generic [aria-hidden] [ref=e302]:
                    - generic [ref=e303]: +
                    - generic [ref=e305]:
                      - generic [ref=e306]: "0"
                      - generic [ref=e307]: "1"
                      - generic [ref=e308]: "2"
                      - generic [ref=e309]: "3"
                      - generic [ref=e310]: "4"
                      - generic [ref=e311]: "5"
                      - generic [ref=e312]: "6"
                      - generic [ref=e313]: "7"
                      - generic [ref=e314]: "8"
                      - generic [ref=e315]: "9"
                    - generic [ref=e316]: .
                    - generic [ref=e318]:
                      - generic [ref=e319]: "0"
                      - generic [ref=e320]: "1"
                      - generic [ref=e321]: "2"
                      - generic [ref=e322]: "3"
                      - generic [ref=e323]: "4"
                      - generic [ref=e324]: "5"
                      - generic [ref=e325]: "6"
                      - generic [ref=e326]: "7"
                      - generic [ref=e327]: "8"
                      - generic [ref=e328]: "9"
                    - generic [ref=e329]: "%"
                - generic [ref=e330]: net annualized return · since inception
                - generic [ref=e331]: august 2026
              - generic [ref=e332]:
                - generic [ref=e333]:
                  - generic [ref=e334]: risk
                  - 'img "risk: low" [ref=e335]'
                  - generic [ref=e341]: low
                - generic [ref=e342]:
                  - generic [ref=e343]: fund code
                  - generic [ref=e344]: LDM201
              - generic [ref=e345]: view the strategy
            - 'link "Sample data fund Multi-Strategy Alternative strategies +7.6% net annualized return · since inception august 2026 risk risk: medium medium fund code LDM301 view the strategy" [ref=e349] [cursor=pointer]':
              - /url: /strategies/multi-strategy
              - generic [ref=e351]:
                - generic [aria-hidden] [ref=e352]: "03"
                - generic [ref=e353]:
                  - generic "Illustrative figures only, not actual performance." [ref=e354]: Sample data
                  - generic [ref=e355]: fund
              - generic [ref=e356]: Multi-Strategy
              - generic [ref=e357]: Alternative strategies
              - generic [ref=e358]:
                - generic [ref=e360]:
                  - generic [ref=e361]: +7.6%
                  - generic [aria-hidden] [ref=e362]:
                    - generic [ref=e363]: +
                    - generic [ref=e365]:
                      - generic [ref=e366]: "0"
                      - generic [ref=e367]: "1"
                      - generic [ref=e368]: "2"
                      - generic [ref=e369]: "3"
                      - generic [ref=e370]: "4"
                      - generic [ref=e371]: "5"
                      - generic [ref=e372]: "6"
                      - generic [ref=e373]: "7"
                      - generic [ref=e374]: "8"
                      - generic [ref=e375]: "9"
                    - generic [ref=e376]: .
                    - generic [ref=e378]:
                      - generic [ref=e379]: "0"
                      - generic [ref=e380]: "1"
                      - generic [ref=e381]: "2"
                      - generic [ref=e382]: "3"
                      - generic [ref=e383]: "4"
                      - generic [ref=e384]: "5"
                      - generic [ref=e385]: "6"
                      - generic [ref=e386]: "7"
                      - generic [ref=e387]: "8"
                      - generic [ref=e388]: "9"
                    - generic [ref=e389]: "%"
                - generic [ref=e390]: net annualized return · since inception
                - generic [ref=e391]: august 2026
              - generic [ref=e392]:
                - generic [ref=e393]:
                  - generic [ref=e394]: risk
                  - 'img "risk: medium" [ref=e395]'
                  - generic [ref=e401]: medium
                - generic [ref=e402]:
                  - generic [ref=e403]: fund code
                  - generic [ref=e404]: LDM301
              - generic [ref=e405]: view the strategy
            - 'link "Sample data SMA Global Minimum Volatility Protection overlay (managed accounts) +8.2% gross annualized return · since inception august 2026 risk risk: low low view the strategy" [ref=e409] [cursor=pointer]':
              - /url: /strategies/global-minimum-volatility
              - generic [ref=e411]:
                - generic [aria-hidden] [ref=e412]: "04"
                - generic [ref=e413]:
                  - generic "Illustrative figures only, not actual performance." [ref=e414]: Sample data
                  - generic [ref=e415]: SMA
              - generic [ref=e416]: Global Minimum Volatility
              - generic [ref=e417]: Protection overlay (managed accounts)
              - generic [ref=e418]:
                - generic [ref=e420]:
                  - generic [ref=e421]: +8.2%
                  - generic [aria-hidden] [ref=e422]:
                    - generic [ref=e423]: +
                    - generic [ref=e425]:
                      - generic [ref=e426]: "0"
                      - generic [ref=e427]: "1"
                      - generic [ref=e428]: "2"
                      - generic [ref=e429]: "3"
                      - generic [ref=e430]: "4"
                      - generic [ref=e431]: "5"
                      - generic [ref=e432]: "6"
                      - generic [ref=e433]: "7"
                      - generic [ref=e434]: "8"
                      - generic [ref=e435]: "9"
                    - generic [ref=e436]: .
                    - generic [ref=e438]:
                      - generic [ref=e439]: "0"
                      - generic [ref=e440]: "1"
                      - generic [ref=e441]: "2"
                      - generic [ref=e442]: "3"
                      - generic [ref=e443]: "4"
                      - generic [ref=e444]: "5"
                      - generic [ref=e445]: "6"
                      - generic [ref=e446]: "7"
                      - generic [ref=e447]: "8"
                      - generic [ref=e448]: "9"
                    - generic [ref=e449]: "%"
                - generic [ref=e450]: gross annualized return · since inception
                - generic [ref=e451]: august 2026
              - generic [ref=e453]:
                - generic [ref=e454]: risk
                - 'img "risk: low" [ref=e455]'
                - generic [ref=e461]: low
              - generic [ref=e462]: view the strategy
          - paragraph [ref=e466]: Net of fees, in CAD. Past performance may not be repeated. See the important information below. Global Minimum Volatility returns are gross of fees (managed accounts, not a fund).
          - link "all strategies" [ref=e468] [cursor=pointer]:
            - /url: /strategies
      - region [ref=e472]:
        - generic [ref=e473]:
          - generic [ref=e474]:
            - generic [ref=e475]: nymbus at a glance
            - heading "one firm, three strengths" [level=2] [ref=e476]:
              - generic [aria-hidden] [ref=e477]:
                - generic [ref=e478]: one
                - generic [ref=e479]: firm,
                - generic [ref=e480]: three
                - generic [ref=e481]: strengths
          - generic [ref=e482]:
            - generic [ref=e483]:
              - generic [ref=e484]: approach
              - paragraph [ref=e486]: systematic fixed income
              - generic [aria-hidden] [ref=e487]: +
              - paragraph [ref=e488]: systematic uncorrelated strategies
              - generic [ref=e489]:
                - generic [ref=e491]:
                  - generic [ref=e492]: 10+
                  - generic [aria-hidden] [ref=e493]:
                    - generic [ref=e495]:
                      - generic [ref=e496]: "0"
                      - generic [ref=e497]: "1"
                      - generic [ref=e498]: "2"
                      - generic [ref=e499]: "3"
                      - generic [ref=e500]: "4"
                      - generic [ref=e501]: "5"
                      - generic [ref=e502]: "6"
                      - generic [ref=e503]: "7"
                      - generic [ref=e504]: "8"
                      - generic [ref=e505]: "9"
                    - generic [ref=e507]:
                      - generic [ref=e508]: "0"
                      - generic [ref=e509]: "1"
                      - generic [ref=e510]: "2"
                      - generic [ref=e511]: "3"
                      - generic [ref=e512]: "4"
                      - generic [ref=e513]: "5"
                      - generic [ref=e514]: "6"
                      - generic [ref=e515]: "7"
                      - generic [ref=e516]: "8"
                      - generic [ref=e517]: "9"
                    - generic [ref=e518]: +
                - generic [ref=e519]: year track record
            - generic [ref=e520]:
              - generic [ref=e521]: team
              - paragraph [ref=e523]: specialists
              - paragraph [ref=e524]: data scientists · physics PhDs · applied mathematicians · computer scientists
              - generic [aria-hidden] [ref=e525]: +
              - paragraph [ref=e526]: markets veterans
              - generic [ref=e527]:
                - generic [ref=e529]:
                  - generic [ref=e530]: "23"
                  - generic [aria-hidden] [ref=e531]:
                    - generic [ref=e533]:
                      - generic [ref=e534]: "0"
                      - generic [ref=e535]: "1"
                      - generic [ref=e536]: "2"
                      - generic [ref=e537]: "3"
                      - generic [ref=e538]: "4"
                      - generic [ref=e539]: "5"
                      - generic [ref=e540]: "6"
                      - generic [ref=e541]: "7"
                      - generic [ref=e542]: "8"
                      - generic [ref=e543]: "9"
                    - generic [ref=e545]:
                      - generic [ref=e546]: "0"
                      - generic [ref=e547]: "1"
                      - generic [ref=e548]: "2"
                      - generic [ref=e549]: "3"
                      - generic [ref=e550]: "4"
                      - generic [ref=e551]: "5"
                      - generic [ref=e552]: "6"
                      - generic [ref=e553]: "7"
                      - generic [ref=e554]: "8"
                      - generic [ref=e555]: "9"
                - generic [ref=e556]: years average experience
            - generic [ref=e557]:
              - generic [ref=e558]: firm
              - generic [ref=e560]:
                - generic [ref=e561]: $1.8B+
                - generic [ref=e562]: aum
              - generic [ref=e563]:
                - generic [ref=e564]:
                  - text: top 1%
                  - superscript [ref=e565]: "*"
                - generic [ref=e566]: performance since launch (amongst Canadian institutional bond managers)
          - paragraph [ref=e567]: "* Source: Nymbus Capital Inc., eVestment, RBC PFS."
      - region [ref=e568]:
        - generic [ref=e569]:
          - generic [ref=e570]:
            - generic [ref=e571]: the firm
            - heading "trusted by leading institutions" [level=2] [ref=e572]:
              - generic [aria-hidden] [ref=e573]:
                - generic [ref=e574]: trusted
                - generic [ref=e575]: by
                - generic [ref=e576]: leading
                - generic [ref=e577]: institutions
          - generic [ref=e578]:
            - generic [ref=e579]:
              - generic [ref=e580]:
                - generic [ref=e581]:
                  - heading "institutions" [level=3] [ref=e582]
                  - paragraph [ref=e583]: vetted by sophisticated capital
                - list [ref=e584]:
                  - listitem [ref=e585]:
                    - img "Fondaction"
                  - listitem [ref=e586]:
                    - img "Fonds FMOQ"
                  - listitem [ref=e587]:
                    - img "QEMP by Innocap"
                    - generic [aria-hidden] [ref=e588]: "*"
                  - listitem [ref=e589]:
                    - img "Caisse de retraite et d'épargne du Groupe Securitas"
                  - listitem [ref=e590]:
                    - img "GardaWorld"
                  - listitem [ref=e591]:
                    - img "Bâtirente"
              - generic [ref=e592]:
                - generic [ref=e593]:
                  - heading "platforms" [level=3] [ref=e594]
                  - paragraph [ref=e595]: available on leading platforms
                - list [ref=e596]:
                  - listitem [ref=e597]:
                    - img "National Bank Financial Wealth Management"
                  - listitem [ref=e598]:
                    - img "RBC Dominion Securities Wealth Management"
                  - listitem [ref=e599]:
                    - img "iA Financial Group"
              - paragraph [ref=e600]: … and many more
            - generic [ref=e601]:
              - heading "investor mix (as % of aum)" [level=3] [ref=e602]:
                - text: investor mix
                - generic [ref=e603]: (as % of aum)
              - generic [ref=e604]:
                - img [aria-hidden] [ref=e605]:
                  - generic [ref=e607] [cursor=pointer]
                  - generic [ref=e608] [cursor=pointer]
                  - generic [ref=e609] [cursor=pointer]
                - generic:
                  - generic: 45%
                  - generic: institutions
                - list [ref=e610]:
                  - listitem [ref=e611]:
                    - button "institutions 45%" [pressed] [ref=e612] [cursor=pointer]:
                      - generic [ref=e614]: institutions
                      - emphasis [ref=e617]: 45%
                  - listitem [ref=e618]:
                    - button "family offices 35%" [ref=e619] [cursor=pointer]:
                      - generic [ref=e621]: family offices
                      - emphasis [ref=e624]: 35%
                  - listitem [ref=e625]:
                    - button "financial advisors 20%" [ref=e626] [cursor=pointer]:
                      - generic [ref=e628]: financial advisors
                      - emphasis [ref=e631]: 20%
          - paragraph [ref=e632]: "*Quebec Emerging Managers Program · * Source: Nymbus Capital Inc. | Representative client list. Not all clients shown. For illustrative purposes only."
      - region [ref=e633]:
        - generic [ref=e634]:
          - generic [ref=e635]:
            - heading "in summary" [level=2] [ref=e636]:
              - generic [aria-hidden] [ref=e637]:
                - generic [ref=e638]: in
                - generic [ref=e639]: summary
            - paragraph [ref=e640]: Canada's only pure-play systematic bond manager*
          - generic [ref=e641]:
            - article [ref=e642]:
              - generic [ref=e643]: 01 / approach
              - heading "scientific edge" [level=3] [ref=e644]
              - paragraph [ref=e645]: ultra-micro analysis at scale, with ML-based pattern recognition across billions of data points
            - article [ref=e646]:
              - generic [ref=e647]: 02 / team
              - heading "a unique team" [level=3] [ref=e648]
              - paragraph [ref=e649]: scientists and market veterans tackling problems traditional managers don't
            - article [ref=e650]:
              - generic [ref=e651]: 03 / results
              - heading "top 1% results" [level=3] [ref=e652]
              - paragraph [ref=e653]: "top 1% among institutional bond managers: consistent performance with attractive downside risk"
          - paragraph [ref=e654]: "* Source: Nymbus Capital Inc. | This characterization is based on internal proprietary research, comprehensive reviews of the Canadian landscape, and ongoing consultations with institutional allocators and investment consultants. “Pure-play” is defined as a canadian-domiciled firm whose investment engine and organizational structure are dedicated exclusively to systematic and algorithmic modeling, distinguishing it from firms utilizing fundamental credit research, hybrid quantitative overlays, or passive index replication strategies."
      - region [ref=e655]:
        - generic [ref=e656]:
          - generic [ref=e657]: contact us if you have any questions
          - heading "let’s talk" [level=2] [ref=e659]:
            - generic [aria-hidden] [ref=e660]:
              - generic [ref=e661]: let’s
              - generic [ref=e662]: talk
          - generic [ref=e663]:
            - link "contact us" [ref=e664] [cursor=pointer]:
              - /url: /contact
            - link "meet the team" [ref=e667] [cursor=pointer]:
              - /url: /team
          - paragraph [ref=e668]:
            - link "info@nymbus.ca" [ref=e669] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
  - contentinfo [ref=e670]:
    - generic [ref=e671]:
      - generic [ref=e672]:
        - generic [ref=e673]:
          - link "Nymbus Capital, home" [ref=e674] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e675]
          - paragraph [ref=e684]: Montreal-based quantitative investment manager building systematic fixed income and multi-asset strategies with scientific rigour.
          - generic [ref=e685]:
            - generic [ref=e686]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e687] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e688]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e689] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e690]:
          - heading "Strategies" [level=2] [ref=e691]
          - list [ref=e692]:
            - listitem [ref=e693]:
              - link "Monthly Income" [ref=e694] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e696]:
              - link "Sustainable Enhanced Bonds" [ref=e697] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e699]:
              - link "Multi-Strategy" [ref=e700] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e702]:
              - link "Global Minimum Volatility" [ref=e703] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e705]:
          - heading "Company" [level=2] [ref=e706]
          - list [ref=e707]:
            - listitem [ref=e708]:
              - link "About & team" [ref=e709] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e710]:
              - link "Approach" [ref=e711] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e712]:
              - link "Sustainability" [ref=e713] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e714]:
              - link "Solutions" [ref=e715] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e716]:
          - heading "Resources" [level=2] [ref=e717]
          - list [ref=e718]:
            - listitem [ref=e719]:
              - link "Contact" [ref=e720] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e721]:
              - link "Privacy policy" [ref=e722] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e723]:
              - link "Complaints & code of ethics" [ref=e724] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e725]:
              - link "LinkedIn" [ref=e726] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e730]:
        - paragraph [ref=e731]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
        - paragraph [ref=e732]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
        - paragraph [ref=e733]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the class shown; periods of less than one year are not annualized.
        - paragraph [ref=e734]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
        - paragraph [ref=e735]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund's returns may have differed had it existed during that period.
        - paragraph [ref=e736]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account.
        - paragraph [ref=e737]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
      - generic [ref=e738]:
        - generic [ref=e739]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e740]: PRI signatory
  - alert [ref=e741]
```

# Test source

```ts
  15  |   { path: "/sustainability", name: "sustainability", en: /modernity meets responsibility/, fr: /la modernité rencontre la responsabilité/ },
  16  |   { path: "/team", name: "team", en: /scientists and market veterans/, fr: /des scientifiques et des vétérans des marchés/ },
  17  |   { path: "/contact", name: "contact", en: /let’s talk/, fr: /parlons ensemble/ },
  18  |   { path: "/solutions", name: "solutions", en: /solutions for every mandate/, fr: /des solutions pour chaque mandat/ },
  19  |   { path: "/legal", name: "legal", en: /legal/, fr: /juridique/ },
  20  |   { path: "/privacy", name: "privacy", en: /privacy policy/, fr: /politique de confidentialité/ },
  21  | ];
  22  | 
  23  | const SHOTS = "e2e/screenshots";
  24  | mkdirSync(SHOTS, { recursive: true });
  25  | 
  26  | /** Console errors, minus resources the sandboxed test browser may not reach (team photos on www.nymbus.ca). */
  27  | function collectErrors(page: Page) {
  28  |   const errors: string[] = [];
  29  |   page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
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
  97  |   // each card shows either a published figure or the "figures coming soon" state
  98  |   for (let i = 0; i < 4; i++) {
  99  |     const card = cards.nth(i);
  100 |     await card.scrollIntoViewIfNeeded();
  101 |     const hasFig = await card.locator(".fig").count();
  102 |     const soon = await card.getByTestId("figures-soon").count();
  103 |     expect(hasFig + soon).toBe(1);
  104 |   }
  105 |   // the NAV ribbon only exists when NAVs are published
  106 |   const ribbon = page.getByTestId("nav-ribbon");
  107 |   if (await ribbon.count()) await expect(ribbon).toContainText(/nav as of/);
  108 | });
  109 | 
  110 | test("language toggle switches the page to French and back", async ({ page, isMobile }) => {
  111 |   await page.goto("/");
  112 |   await expect(page.getByRole("heading", { level: 1 }).first()).toHaveAccessibleName(/scientific investing/);
  113 |   if (isMobile) await page.getByTestId("menu-toggle").click();
  114 |   const toggle = isMobile ? page.getByTestId("mobile-menu").getByTestId("lang-toggle") : page.getByTestId("site-nav").getByTestId("lang-toggle");
> 115 |   await toggle.click();
      |                ^ Error: locator.click: Test timeout of 60000ms exceeded.
  116 |   await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  117 |   if (isMobile) await page.keyboard.press("Escape");
  118 |   await expect(page.getByRole("heading", { level: 1 }).first()).toHaveAccessibleName(/investissement scientifique/);
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
  130 |   await toggle.click();
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
  153 |   for (const sel of ["#hero-t", "#glance-t", "#process-t", "#strat-t", "#sum-t"]) {
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
  167 |   // the pinned "why an overlay" story unpins and shows every step
  168 |   await expect(page.locator(".story-pin")).toHaveCSS("position", "relative");
  169 |   await expect(page.locator(".story-steps li")).toHaveCount(4);
  170 |   for (const li of await page.locator(".story-steps li").all()) await expect(li).toHaveCSS("opacity", "1");
  171 |   await ctx.close();
  172 | });
  173 | 
  174 | test("team: filter by department and open a bio", async ({ page }) => {
  175 |   await page.goto("/team");
  176 |   const people = page.locator(".people > li");
  177 |   await people.first().scrollIntoViewIfNeeded();
  178 |   const all = await people.count();
  179 |   await page.getByRole("button", { name: /^board/ }).click();
  180 |   await expect.poll(() => people.count()).toBeLessThan(all);
  181 |   await page.getByRole("button", { name: /^everyone/ }).click();
  182 |   await expect.poll(() => people.count()).toBe(all);
  183 |   await people.first().getByRole("button").click();
  184 |   const dialog = page.getByTestId("bio-dialog");
  185 |   await expect(dialog).toBeVisible();
  186 |   await expect(dialog.getByRole("heading", { level: 2 })).toBeVisible();
  187 |   await page.keyboard.press("Escape");
  188 |   await expect(dialog).toBeHidden();
  189 | });
  190 | 
  191 | test("contact: validates, then prepares an email (no backend)", async ({ page }) => {
  192 |   await page.goto("/contact");
  193 |   const form = page.getByTestId("contact-form");
  194 |   await form.scrollIntoViewIfNeeded();
  195 |   await form.getByRole("button", { name: /prepare my email/ }).click();
  196 |   await expect(page.getByText("please enter a valid email")).toBeVisible();
  197 |   await page.getByLabel("full name").fill("Test Person");
  198 |   await page.getByLabel("email").fill("test@example.com");
  199 |   await page.getByLabel("message").fill("Hello, I would like to learn more about your funds.");
  200 |   // the mailto: hand-off opens the mail app (a no-op in the test browser); the ready state must show
  201 |   await form.getByRole("button", { name: /prepare my email/ }).click();
  202 |   await expect(page.getByTestId("contact-ready")).toBeVisible();
  203 |   await expect(page.getByTestId("contact-ready").getByRole("link")).toHaveAttribute("href", /^mailto:info@nymbus\.ca\?subject=/);
  204 | });
  205 | 
  206 | test("admin does not get the public chrome", async ({ page, context }) => {
  207 |   await signIn(context);
  208 |   const res = await page.goto("/admin");
  209 |   expect(res?.status()).toBe(200);
  210 |   await expect(page.getByTestId("site-nav")).toHaveCount(0);
  211 |   await expect(page.getByTestId("site-footer")).toHaveCount(0);
  212 | });
  213 | 
```