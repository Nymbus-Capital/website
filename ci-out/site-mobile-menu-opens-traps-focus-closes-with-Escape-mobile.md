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
    98 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <body>…</body> intercepts pointer events
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling

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
      - region [ref=e64]:
        - generic [ref=e65]:
          - generic [ref=e66]: 01 · bonds investment process
          - heading "how we build bond portfolios" [level=2] [ref=e69]:
            - generic [aria-hidden] [ref=e70]:
              - generic [ref=e71]: how
              - generic [ref=e72]: we
              - generic [ref=e73]: build
              - generic [ref=e74]: bond
              - generic [ref=e75]: portfolios
      - region [ref=e76]:
        - generic [ref=e77]:
          - generic [ref=e78]:
            - generic [ref=e79]: our investment philosophy
            - heading "two pillars, working together." [level=2] [ref=e81]:
              - generic [aria-hidden] [ref=e82]:
                - generic [ref=e83]: two
                - generic [ref=e84]: pillars,
                - generic [ref=e85]: working
                - generic [ref=e86]: together.
          - generic [ref=e87]:
            - article [ref=e88]:
              - generic [aria-hidden] [ref=e89]: "01"
              - paragraph [ref=e90]: fixed income process
              - heading "systematic, regime-aware bond management" [level=3] [ref=e91]
              - paragraph [ref=e92]: a two-system framework (macro regime/sector positioning and security selection) running across all of our fixed income mandates
            - article [ref=e93]:
              - generic [aria-hidden] [ref=e94]: "02"
              - paragraph [ref=e95]: protection overlay
              - heading "an uncorrelated buffer for bond drawdowns" [level=3] [ref=e96]
              - paragraph [ref=e97]: a managed futures overlay that tends to perform in higher-volatility regimes, softening the conditions that hurt bond portfolios
      - region [ref=e98]:
        - generic [ref=e99]:
          - generic [ref=e100]:
            - generic [ref=e101]: bonds investment process
            - heading "bonds investment process" [level=2] [ref=e102]:
              - generic [aria-hidden] [ref=e103]:
                - generic [ref=e104]: bonds
                - generic [ref=e105]: investment
                - generic [ref=e106]: process
          - generic [ref=e107]:
            - generic [ref=e108]:
              - generic [ref=e109]:
                - generic [ref=e110]: system 1
                - heading "(macro) portfolio positioning" [level=3] [ref=e111]
              - list [ref=e112]:
                - listitem [ref=e113]:
                  - generic [aria-hidden] [ref=e114]: "1"
                  - paragraph [ref=e115]: identify market regimes & trends
                - listitem [ref=e116]:
                  - generic [aria-hidden] [ref=e117]: "2"
                  - paragraph [ref=e118]: build the curve/credit matrix using billions of bond datapoints
              - list [ref=e119]:
                - listitem [ref=e120]: systematic
                - listitem [ref=e121]: macro; top-down
                - listitem [ref=e122]: rebalancing every 6 month
                - listitem [ref=e123]: systematize a PM’s experience
            - generic [ref=e124]:
              - generic [ref=e125]:
                - generic [ref=e126]: system 2
                - heading "(micro) security selection" [level=3] [ref=e127]
              - list [ref=e128]:
                - listitem [ref=e129]:
                  - generic [aria-hidden] [ref=e130]: "3"
                  - paragraph [ref=e131]: continuously score and rank the bonds in each “cell” by yield to maturity / risk
                - listitem [ref=e132]:
                  - generic [aria-hidden] [ref=e133]: "4"
                  - paragraph [ref=e134]: select the final securities
              - list [ref=e135]:
                - listitem [ref=e136]: systematic + discretionary
                - listitem [ref=e137]: micro; bottom-up
                - listitem [ref=e138]: continuous rebalancing (alert)
                - listitem [ref=e139]: replicate an analyst’s in-depth knowledge
      - region [ref=e140]:
        - generic [ref=e141]:
          - generic [ref=e142]: 02 · protection strategy
          - heading "why add a protection overlay to a bond portfolio?" [level=2] [ref=e145]:
            - generic [aria-hidden] [ref=e146]:
              - generic [ref=e147]: why
              - generic [ref=e148]: add
              - generic [ref=e149]: a
              - generic [ref=e150]: protection
              - generic [ref=e151]: overlay
              - generic [ref=e152]: to
              - generic [ref=e153]: a
              - generic [ref=e154]: bond
              - generic [ref=e155]: portfolio?
      - region [ref=e156]:
        - generic [ref=e158]:
          - generic [ref=e159]:
            - heading "the fixed income challenge" [level=2] [ref=e160]
            - list [ref=e161]:
              - listitem [ref=e162]:
                - generic [ref=e163]: the problem
                - paragraph [ref=e164]: bonds suffer when…
                - paragraph [ref=e165]: rates rise · inflation spikes · spreads widen
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
          - generic [aria-hidden] [ref=e166]:
            - generic [ref=e167]:
              - generic [ref=e168]: rates rise
              - generic [ref=e174]: inflation spikes
              - generic [ref=e179]: spreads widen
              - generic [ref=e185]: elevated volatility
              - generic [ref=e190]:
                - generic [ref=e191]: overlay
                - generic [ref=e193]:
                  - generic [ref=e194]: your portfolio
                  - generic [ref=e195]: 5–10%
                - generic [ref=e196]: still 100% of your capital
            - figure [ref=e197]:
              - generic [ref=e198]:
                - generic [ref=e199]: drawdowns through a volatile period
                - generic [ref=e200]: bonds onlywith overlay
              - generic [ref=e207]: illustrative shape, not actual performance
      - region [ref=e208]:
        - generic [ref=e209]:
          - generic [ref=e210]: 03 · strategies
          - heading "our investment strategies" [level=2] [ref=e213]:
            - generic [aria-hidden] [ref=e214]:
              - generic [ref=e215]: our
              - generic [ref=e216]: investment
              - generic [ref=e217]: strategies
      - region [ref=e218]:
        - generic [ref=e219]:
          - generic [ref=e220]:
            - generic [ref=e221]: strategies
            - heading "four strategies, one scientific process" [level=2] [ref=e222]
          - generic [ref=e223]:
            - 'link "Sample data fund Monthly Income Short-term fixed income +2.3% net annualized return · since inception august 2026 risk risk: low to medium low to medium fund code LDM001 view the strategy" [ref=e224] [cursor=pointer]':
              - /url: /strategies/monthly-income
              - generic [ref=e226]:
                - generic [aria-hidden] [ref=e227]: "01"
                - generic [ref=e228]:
                  - generic "Illustrative figures only, not actual performance." [ref=e229]: Sample data
                  - generic [ref=e230]: fund
              - generic [ref=e231]: Monthly Income
              - generic [ref=e232]: Short-term fixed income
              - generic [ref=e233]:
                - generic [ref=e235]:
                  - generic [ref=e236]: +2.3%
                  - generic [aria-hidden] [ref=e237]:
                    - generic [ref=e238]: +
                    - generic [ref=e240]:
                      - generic [ref=e241]: "0"
                      - generic [ref=e242]: "1"
                      - generic [ref=e243]: "2"
                      - generic [ref=e244]: "3"
                      - generic [ref=e245]: "4"
                      - generic [ref=e246]: "5"
                      - generic [ref=e247]: "6"
                      - generic [ref=e248]: "7"
                      - generic [ref=e249]: "8"
                      - generic [ref=e250]: "9"
                    - generic [ref=e251]: .
                    - generic [ref=e253]:
                      - generic [ref=e254]: "0"
                      - generic [ref=e255]: "1"
                      - generic [ref=e256]: "2"
                      - generic [ref=e257]: "3"
                      - generic [ref=e258]: "4"
                      - generic [ref=e259]: "5"
                      - generic [ref=e260]: "6"
                      - generic [ref=e261]: "7"
                      - generic [ref=e262]: "8"
                      - generic [ref=e263]: "9"
                    - generic [ref=e264]: "%"
                - generic [ref=e265]: net annualized return · since inception
                - generic [ref=e266]: august 2026
              - generic [ref=e267]:
                - generic [ref=e268]:
                  - generic [ref=e269]: risk
                  - 'img "risk: low to medium" [ref=e270]'
                  - generic [ref=e276]: low to medium
                - generic [ref=e277]:
                  - generic [ref=e278]: fund code
                  - generic [ref=e279]: LDM001
              - generic [ref=e280]: view the strategy
            - 'link "Sample data fund Sustainable Enhanced Bonds Core fixed income +2.3% net annualized return · since inception august 2026 risk risk: low low fund code LDM201 view the strategy" [ref=e284] [cursor=pointer]':
              - /url: /strategies/sustainable-enhanced-bonds
              - generic [ref=e286]:
                - generic [aria-hidden] [ref=e287]: "02"
                - generic [ref=e288]:
                  - generic "Illustrative figures only, not actual performance." [ref=e289]: Sample data
                  - generic [ref=e290]: fund
              - generic [ref=e291]: Sustainable Enhanced Bonds
              - generic [ref=e292]: Core fixed income
              - generic [ref=e293]:
                - generic [ref=e295]:
                  - generic [ref=e296]: +2.3%
                  - generic [aria-hidden] [ref=e297]:
                    - generic [ref=e298]: +
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
                    - generic [ref=e311]: .
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
                    - generic [ref=e324]: "%"
                - generic [ref=e325]: net annualized return · since inception
                - generic [ref=e326]: august 2026
              - generic [ref=e327]:
                - generic [ref=e328]:
                  - generic [ref=e329]: risk
                  - 'img "risk: low" [ref=e330]'
                  - generic [ref=e336]: low
                - generic [ref=e337]:
                  - generic [ref=e338]: fund code
                  - generic [ref=e339]: LDM201
              - generic [ref=e340]: view the strategy
            - 'link "Sample data fund Multi-Strategy Alternative strategies +7.6% net annualized return · since inception august 2026 risk risk: medium medium fund code LDM301 view the strategy" [ref=e344] [cursor=pointer]':
              - /url: /strategies/multi-strategy
              - generic [ref=e346]:
                - generic [aria-hidden] [ref=e347]: "03"
                - generic [ref=e348]:
                  - generic "Illustrative figures only, not actual performance." [ref=e349]: Sample data
                  - generic [ref=e350]: fund
              - generic [ref=e351]: Multi-Strategy
              - generic [ref=e352]: Alternative strategies
              - generic [ref=e353]:
                - generic [ref=e355]:
                  - generic [ref=e356]: +7.6%
                  - generic [aria-hidden] [ref=e357]:
                    - generic [ref=e358]: +
                    - generic [ref=e360]:
                      - generic [ref=e361]: "0"
                      - generic [ref=e362]: "1"
                      - generic [ref=e363]: "2"
                      - generic [ref=e364]: "3"
                      - generic [ref=e365]: "4"
                      - generic [ref=e366]: "5"
                      - generic [ref=e367]: "6"
                      - generic [ref=e368]: "7"
                      - generic [ref=e369]: "8"
                      - generic [ref=e370]: "9"
                    - generic [ref=e371]: .
                    - generic [ref=e373]:
                      - generic [ref=e374]: "0"
                      - generic [ref=e375]: "1"
                      - generic [ref=e376]: "2"
                      - generic [ref=e377]: "3"
                      - generic [ref=e378]: "4"
                      - generic [ref=e379]: "5"
                      - generic [ref=e380]: "6"
                      - generic [ref=e381]: "7"
                      - generic [ref=e382]: "8"
                      - generic [ref=e383]: "9"
                    - generic [ref=e384]: "%"
                - generic [ref=e385]: net annualized return · since inception
                - generic [ref=e386]: august 2026
              - generic [ref=e387]:
                - generic [ref=e388]:
                  - generic [ref=e389]: risk
                  - 'img "risk: medium" [ref=e390]'
                  - generic [ref=e396]: medium
                - generic [ref=e397]:
                  - generic [ref=e398]: fund code
                  - generic [ref=e399]: LDM301
              - generic [ref=e400]: view the strategy
            - 'link "Sample data SMA Global Minimum Volatility Protection overlay (managed accounts) +8.2% gross annualized return · since inception august 2026 risk risk: low low view the strategy" [ref=e404] [cursor=pointer]':
              - /url: /strategies/global-minimum-volatility
              - generic [ref=e406]:
                - generic [aria-hidden] [ref=e407]: "04"
                - generic [ref=e408]:
                  - generic "Illustrative figures only, not actual performance." [ref=e409]: Sample data
                  - generic [ref=e410]: SMA
              - generic [ref=e411]: Global Minimum Volatility
              - generic [ref=e412]: Protection overlay (managed accounts)
              - generic [ref=e413]:
                - generic [ref=e415]:
                  - generic [ref=e416]: +8.2%
                  - generic [aria-hidden] [ref=e417]:
                    - generic [ref=e418]: +
                    - generic [ref=e420]:
                      - generic [ref=e421]: "0"
                      - generic [ref=e422]: "1"
                      - generic [ref=e423]: "2"
                      - generic [ref=e424]: "3"
                      - generic [ref=e425]: "4"
                      - generic [ref=e426]: "5"
                      - generic [ref=e427]: "6"
                      - generic [ref=e428]: "7"
                      - generic [ref=e429]: "8"
                      - generic [ref=e430]: "9"
                    - generic [ref=e431]: .
                    - generic [ref=e433]:
                      - generic [ref=e434]: "0"
                      - generic [ref=e435]: "1"
                      - generic [ref=e436]: "2"
                      - generic [ref=e437]: "3"
                      - generic [ref=e438]: "4"
                      - generic [ref=e439]: "5"
                      - generic [ref=e440]: "6"
                      - generic [ref=e441]: "7"
                      - generic [ref=e442]: "8"
                      - generic [ref=e443]: "9"
                    - generic [ref=e444]: "%"
                - generic [ref=e445]: gross annualized return · since inception
                - generic [ref=e446]: august 2026
              - generic [ref=e448]:
                - generic [ref=e449]: risk
                - 'img "risk: low" [ref=e450]'
                - generic [ref=e456]: low
              - generic [ref=e457]: view the strategy
          - paragraph [ref=e461]: Net of fees, in CAD. Past performance may not be repeated. See the important information below. Global Minimum Volatility returns are gross of fees (managed accounts, not a fund).
          - link "all strategies" [ref=e463] [cursor=pointer]:
            - /url: /strategies
      - region [ref=e467]:
        - generic [ref=e468]:
          - generic [ref=e469]:
            - generic [ref=e470]: nymbus at a glance
            - heading "one firm, three strengths" [level=2] [ref=e471]:
              - generic [aria-hidden] [ref=e472]:
                - generic [ref=e473]: one
                - generic [ref=e474]: firm,
                - generic [ref=e475]: three
                - generic [ref=e476]: strengths
          - generic [ref=e477]:
            - generic [ref=e478]:
              - generic [ref=e479]: approach
              - paragraph [ref=e481]: systematic fixed income
              - generic [aria-hidden] [ref=e482]: +
              - paragraph [ref=e483]: systematic uncorrelated strategies
              - generic [ref=e484]:
                - generic [ref=e486]:
                  - generic [ref=e487]: 10+
                  - generic [aria-hidden] [ref=e488]:
                    - generic [ref=e490]:
                      - generic [ref=e491]: "0"
                      - generic [ref=e492]: "1"
                      - generic [ref=e493]: "2"
                      - generic [ref=e494]: "3"
                      - generic [ref=e495]: "4"
                      - generic [ref=e496]: "5"
                      - generic [ref=e497]: "6"
                      - generic [ref=e498]: "7"
                      - generic [ref=e499]: "8"
                      - generic [ref=e500]: "9"
                    - generic [ref=e502]:
                      - generic [ref=e503]: "0"
                      - generic [ref=e504]: "1"
                      - generic [ref=e505]: "2"
                      - generic [ref=e506]: "3"
                      - generic [ref=e507]: "4"
                      - generic [ref=e508]: "5"
                      - generic [ref=e509]: "6"
                      - generic [ref=e510]: "7"
                      - generic [ref=e511]: "8"
                      - generic [ref=e512]: "9"
                    - generic [ref=e513]: +
                - generic [ref=e514]: year track record
            - generic [ref=e515]:
              - generic [ref=e516]: team
              - paragraph [ref=e518]: specialists
              - paragraph [ref=e519]: data scientists · physics PhDs · applied mathematicians · computer scientists
              - generic [aria-hidden] [ref=e520]: +
              - paragraph [ref=e521]: markets veterans
              - generic [ref=e522]:
                - generic [ref=e524]:
                  - generic [ref=e525]: "23"
                  - generic [aria-hidden] [ref=e526]:
                    - generic [ref=e528]:
                      - generic [ref=e529]: "0"
                      - generic [ref=e530]: "1"
                      - generic [ref=e531]: "2"
                      - generic [ref=e532]: "3"
                      - generic [ref=e533]: "4"
                      - generic [ref=e534]: "5"
                      - generic [ref=e535]: "6"
                      - generic [ref=e536]: "7"
                      - generic [ref=e537]: "8"
                      - generic [ref=e538]: "9"
                    - generic [ref=e540]:
                      - generic [ref=e541]: "0"
                      - generic [ref=e542]: "1"
                      - generic [ref=e543]: "2"
                      - generic [ref=e544]: "3"
                      - generic [ref=e545]: "4"
                      - generic [ref=e546]: "5"
                      - generic [ref=e547]: "6"
                      - generic [ref=e548]: "7"
                      - generic [ref=e549]: "8"
                      - generic [ref=e550]: "9"
                - generic [ref=e551]: years average experience
            - generic [ref=e552]:
              - generic [ref=e553]: firm
              - generic [ref=e555]:
                - generic [ref=e556]: $1.8B+
                - generic [ref=e557]: aum
              - generic [ref=e558]:
                - generic [ref=e559]:
                  - text: top 1%
                  - superscript [ref=e560]: "*"
                - generic [ref=e561]: performance since launch (amongst Canadian institutional bond managers)
          - paragraph [ref=e562]: "* Source: Nymbus Capital Inc., eVestment, RBC PFS."
      - region [ref=e563]:
        - generic [ref=e564]:
          - generic [ref=e565]:
            - generic [ref=e566]: the firm
            - heading "trusted by leading institutions" [level=2] [ref=e567]:
              - generic [aria-hidden] [ref=e568]:
                - generic [ref=e569]: trusted
                - generic [ref=e570]: by
                - generic [ref=e571]: leading
                - generic [ref=e572]: institutions
          - generic [ref=e573]:
            - generic [ref=e574]:
              - generic [ref=e575]:
                - generic [ref=e576]:
                  - heading "institutions" [level=3] [ref=e577]
                  - paragraph [ref=e578]: vetted by sophisticated capital
                - list [ref=e579]:
                  - listitem [ref=e580]:
                    - img "Fondaction"
                  - listitem [ref=e581]:
                    - img "Fonds FMOQ"
                  - listitem [ref=e582]:
                    - img "QEMP by Innocap"
                    - generic [aria-hidden] [ref=e583]: "*"
                  - listitem [ref=e584]:
                    - img "Caisse de retraite et d'épargne du Groupe Securitas"
                  - listitem [ref=e585]:
                    - img "GardaWorld"
                  - listitem [ref=e586]:
                    - img "Bâtirente"
              - generic [ref=e587]:
                - generic [ref=e588]:
                  - heading "platforms" [level=3] [ref=e589]
                  - paragraph [ref=e590]: available on leading platforms
                - list [ref=e591]:
                  - listitem [ref=e592]:
                    - img "National Bank Financial Wealth Management"
                  - listitem [ref=e593]:
                    - img "RBC Dominion Securities Wealth Management"
                  - listitem [ref=e594]:
                    - img "iA Financial Group"
              - paragraph [ref=e595]: … and many more
            - generic [ref=e596]:
              - heading "investor mix (as % of aum)" [level=3] [ref=e597]:
                - text: investor mix
                - generic [ref=e598]: (as % of aum)
              - generic [ref=e599]:
                - img [aria-hidden] [ref=e600]:
                  - generic [ref=e602] [cursor=pointer]
                  - generic [ref=e603] [cursor=pointer]
                  - generic [ref=e604] [cursor=pointer]
                - generic:
                  - generic: 45%
                  - generic: institutions
                - list [ref=e605]:
                  - listitem [ref=e606]:
                    - button "institutions 45%" [pressed] [ref=e607] [cursor=pointer]:
                      - generic [ref=e609]: institutions
                      - emphasis [ref=e612]: 45%
                  - listitem [ref=e613]:
                    - button "family offices 35%" [ref=e614] [cursor=pointer]:
                      - generic [ref=e616]: family offices
                      - emphasis [ref=e619]: 35%
                  - listitem [ref=e620]:
                    - button "financial advisors 20%" [ref=e621] [cursor=pointer]:
                      - generic [ref=e623]: financial advisors
                      - emphasis [ref=e626]: 20%
          - paragraph [ref=e627]: "*Quebec Emerging Managers Program · * Source: Nymbus Capital Inc. | Representative client list. Not all clients shown. For illustrative purposes only."
      - region [ref=e628]:
        - generic [ref=e629]:
          - generic [ref=e630]:
            - heading "in summary" [level=2] [ref=e631]:
              - generic [aria-hidden] [ref=e632]:
                - generic [ref=e633]: in
                - generic [ref=e634]: summary
            - paragraph [ref=e635]: Canada's only pure-play systematic bond manager*
          - generic [ref=e636]:
            - article [ref=e637]:
              - generic [ref=e638]: 01 / approach
              - heading "scientific edge" [level=3] [ref=e639]
              - paragraph [ref=e640]: ultra-micro analysis at scale, with ML-based pattern recognition across billions of data points
            - article [ref=e641]:
              - generic [ref=e642]: 02 / team
              - heading "a unique team" [level=3] [ref=e643]
              - paragraph [ref=e644]: scientists and market veterans tackling problems traditional managers don't
            - article [ref=e645]:
              - generic [ref=e646]: 03 / results
              - heading "top 1% results" [level=3] [ref=e647]
              - paragraph [ref=e648]: "top 1% among institutional bond managers: consistent performance with attractive downside risk"
          - paragraph [ref=e649]: "* Source: Nymbus Capital Inc. | This characterization is based on internal proprietary research, comprehensive reviews of the Canadian landscape, and ongoing consultations with institutional allocators and investment consultants. “Pure-play” is defined as a canadian-domiciled firm whose investment engine and organizational structure are dedicated exclusively to systematic and algorithmic modeling, distinguishing it from firms utilizing fundamental credit research, hybrid quantitative overlays, or passive index replication strategies."
      - region [ref=e650]:
        - generic [ref=e651]:
          - generic [ref=e652]: contact us if you have any questions
          - heading "let’s talk" [level=2] [ref=e654]:
            - generic [aria-hidden] [ref=e655]:
              - generic [ref=e656]: let’s
              - generic [ref=e657]: talk
          - generic [ref=e658]:
            - link "contact us" [ref=e659] [cursor=pointer]:
              - /url: /contact
            - link "meet the team" [ref=e662] [cursor=pointer]:
              - /url: /team
          - paragraph [ref=e663]:
            - link "info@nymbus.ca" [ref=e664] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
  - contentinfo [ref=e665]:
    - generic [ref=e666]:
      - generic [ref=e667]:
        - generic [ref=e668]:
          - link "Nymbus Capital, home" [ref=e669] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e670]
          - paragraph [ref=e679]: Montreal-based quantitative investment manager building systematic fixed income and multi-asset strategies with scientific rigour.
          - generic [ref=e680]:
            - generic [ref=e681]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e682] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e683]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e684] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e685]:
          - heading "Strategies" [level=2] [ref=e686]
          - list [ref=e687]:
            - listitem [ref=e688]:
              - link "Monthly Income" [ref=e689] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e691]:
              - link "Sustainable Enhanced Bonds" [ref=e692] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e694]:
              - link "Multi-Strategy" [ref=e695] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e697]:
              - link "Global Minimum Volatility" [ref=e698] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e700]:
          - heading "Company" [level=2] [ref=e701]
          - list [ref=e702]:
            - listitem [ref=e703]:
              - link "About & team" [ref=e704] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e705]:
              - link "Approach" [ref=e706] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e707]:
              - link "Sustainability" [ref=e708] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e709]:
              - link "Solutions" [ref=e710] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e711]:
          - heading "Resources" [level=2] [ref=e712]
          - list [ref=e713]:
            - listitem [ref=e714]:
              - link "Contact" [ref=e715] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e716]:
              - link "Privacy policy" [ref=e717] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e718]:
              - link "Complaints & code of ethics" [ref=e719] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e720]:
              - link "LinkedIn" [ref=e721] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e725]:
        - paragraph [ref=e726]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
        - paragraph [ref=e727]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
        - paragraph [ref=e728]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the class shown; periods of less than one year are not annualized.
        - paragraph [ref=e729]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
        - paragraph [ref=e730]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund's returns may have differed had it existed during that period.
        - paragraph [ref=e731]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account.
        - paragraph [ref=e732]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
      - generic [ref=e733]:
        - generic [ref=e734]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e735]: PRI signatory
  - alert [ref=e736]
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
  115 |   await toggle.click();
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