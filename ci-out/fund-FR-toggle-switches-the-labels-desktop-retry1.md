# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> FR toggle switches the labels
- Location: e2e/fund.spec.ts:86:5

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /toggle language|fr/i }).first()
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
    110 × waiting for element to be visible, enabled and stable
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
      - generic [aria-hidden]: sample data
      - region "Nymbus Monthly Income Fund" [ref=e5]:
        - generic [ref=e6]:
          - generic [ref=e7]:
            - generic [ref=e8]: investment fund
            - generic "illustrative figures only, not actual performance" [ref=e10]: sample data
          - heading "nymbus monthly income fund" [level=1] [ref=e11]:
            - generic [aria-hidden] [ref=e12]:
              - generic [ref=e13]: nymbus
              - generic [ref=e14]: monthly
              - generic [ref=e15]: income
              - generic [ref=e16]: fund
          - generic [ref=e17]: Nymbus Monthly Income Fund
          - paragraph [ref=e18]: Steady monthly income with a short duration
          - generic [ref=e19]:
            - generic [ref=e21]:
              - generic [ref=e24]:
                - generic [ref=e25]: 2.3%
                - generic [aria-hidden] [ref=e26]:
                  - generic [ref=e28]:
                    - generic [ref=e29]: "0"
                    - generic [ref=e30]: "1"
                    - generic [ref=e31]: "2"
                    - generic [ref=e32]: "3"
                    - generic [ref=e33]: "4"
                    - generic [ref=e34]: "5"
                    - generic [ref=e35]: "6"
                    - generic [ref=e36]: "7"
                    - generic [ref=e37]: "8"
                    - generic [ref=e38]: "9"
                  - generic [ref=e39]: .
                  - generic [ref=e41]:
                    - generic [ref=e42]: "0"
                    - generic [ref=e43]: "1"
                    - generic [ref=e44]: "2"
                    - generic [ref=e45]: "3"
                    - generic [ref=e46]: "4"
                    - generic [ref=e47]: "5"
                    - generic [ref=e48]: "6"
                    - generic [ref=e49]: "7"
                    - generic [ref=e50]: "8"
                    - generic [ref=e51]: "9"
                  - generic [ref=e52]: "%"
              - generic [ref=e53]: net annualized return · since inception · as of august 2026
            - generic [ref=e54]:
              - generic [ref=e55]:
                - generic [ref=e56]: in line with benchmark
                - generic [ref=e57]: vs FTSE Canada Short Term Corporate Bond Index
              - generic [ref=e59]:
                - generic [ref=e60]:
                  - generic [ref=e61]: $10.1905
                  - generic "+0.11% vs previous valuation day" [ref=e62]: +0.0114 · +0.11%
                - generic [ref=e65]:
                  - text: net asset value · class
                  - generic [ref=e66]: FP (LDM001)
                  - text: · sep 28, 2026
              - generic [ref=e67]: net of fees · class FP
          - generic [ref=e69]:
            - generic [ref=e70]:
              - generic [ref=e71]: asset class
              - text: Short-term fixed income
            - 'generic "risk level: low to medium" [ref=e72]':
              - generic [ref=e73]: risk level
              - generic [aria-hidden] [ref=e74]: low to medium
            - generic [ref=e81]:
              - generic [ref=e82]: solution inception
              - text: january 2019
            - generic [ref=e83]:
              - generic [ref=e84]: fundserv
              - code [ref=e85]: LDM001
      - region "trailing returns" [ref=e86]:
        - generic [ref=e87]:
          - generic [ref=e88]:
            - generic [ref=e89]: performance · as of august 2026
            - heading "trailing returns" [level=2] [ref=e91]:
              - generic [aria-hidden] [ref=e92]:
                - generic [ref=e93]: trailing
                - generic [ref=e94]: returns
            - generic [ref=e95]: trailing returns
          - generic [ref=e97]:
            - generic [ref=e98]: fund
            - generic [ref=e100]: index
            - generic [ref=e102]: value added
          - group "trailing returns" [ref=e106]:
            - generic [ref=e107]: −1%
            - generic [ref=e109]: 0%
            - generic [ref=e111]: 1%
            - generic [ref=e113]: 2%
            - generic [ref=e115]: 3%
            - img "1 month, fund −0.1%, index 0.4%, value added −0.5%" [ref=e117]:
              - generic [ref=e119]: −0.1
              - generic [ref=e122]: "0.4"
              - generic [ref=e125]: −0.5%
              - generic [ref=e128]: 1M
            - img "3 months, fund −0.6%, index −0.3%, value added −0.3%" [ref=e129]:
              - generic [ref=e131]: −0.6
              - generic [ref=e134]: −0.3
              - generic [ref=e137]: −0.3%
              - generic [ref=e140]: 3M
            - img "year to date, fund −0.1%, index −0.3%, value added +0.2%" [ref=e141]:
              - generic [ref=e143]: −0.1
              - generic [ref=e146]: −0.3
              - generic [ref=e149]: +0.2%
              - generic [ref=e152]: YTD
            - img "1 year, fund 1.0%, index 0.2%, value added +0.8%" [ref=e153]:
              - generic [ref=e155]: "1.0"
              - generic [ref=e158]: "0.2"
              - generic [ref=e161]: +0.8%
              - generic [ref=e164]: 1Y
            - img "2 years*, fund 0.8%, index 1.6%, value added −0.9%" [ref=e165]:
              - generic [ref=e167]: "0.8"
              - generic [ref=e170]: "1.6"
              - generic [ref=e173]: −0.9%
              - generic [ref=e176]: 2Y
            - img "3 years*, fund 1.0%, index 2.2%, value added −1.2%" [ref=e177]:
              - generic [ref=e179]: "1.0"
              - generic [ref=e182]: "2.2"
              - generic [ref=e185]: −1.2%
              - generic [ref=e188]: 3Y
            - img "5 years*, fund 2.0%, index 1.9%, value added +0.1%" [ref=e189]:
              - generic [ref=e191]: "2.0"
              - generic [ref=e194]: "1.9"
              - generic [ref=e197]: +0.1%
              - generic [ref=e200]: 5Y
            - img "since inception*, fund 2.3%, index 2.3%, value added 0.0%" [ref=e201]:
              - generic [ref=e203]: "2.3"
              - generic [ref=e206]: "2.3"
              - generic [ref=e209]: 0.0%
              - generic [ref=e212]: SI
          - paragraph [ref=e213]: "* Periods of 2 years and more, and since inception, are annualized."
          - group [ref=e214]:
            - generic "show the numbers" [ref=e215] [cursor=pointer]
      - region "growth of $10,000" [ref=e216]:
        - generic [ref=e217]:
          - generic [ref=e218]:
            - generic [ref=e219]: growth
            - heading "growth of $10,000" [level=2] [ref=e221]:
              - generic [aria-hidden] [ref=e222]:
                - generic [ref=e223]: growth
                - generic [ref=e224]: of
                - generic [ref=e225]: $10,000
            - generic [ref=e226]: growth of $10,000
            - paragraph [ref=e227]: a hypothetical $10,000 investment, distributions reinvested
          - generic [ref=e228]:
            - group "period" [ref=e230]:
              - button "1Y" [ref=e231] [cursor=pointer]
              - button "3Y" [ref=e232] [cursor=pointer]
              - button "5Y" [ref=e233] [cursor=pointer]
              - button "since inception" [pressed] [ref=e234] [cursor=pointer]
            - generic [ref=e235]:
              - generic [ref=e236]: fund
              - generic [ref=e238]: index
      - region "year by year" [ref=e242]:
        - generic [ref=e243]:
          - generic [ref=e244]:
            - generic [ref=e245]: calendar years
            - heading "year by year" [level=2] [ref=e247]:
              - generic [aria-hidden] [ref=e248]:
                - generic [ref=e249]: year
                - generic [ref=e250]: by
                - generic [ref=e251]: year
            - generic [ref=e252]: year by year
          - generic [ref=e254]:
            - generic [ref=e255]: fund
            - generic [ref=e257]: index
            - generic [ref=e259]: value added
          - group [ref=e263]:
            - generic "show the numbers" [ref=e264] [cursor=pointer]
      - region "every month, since inception" [ref=e265]:
        - generic [ref=e266]:
          - generic [ref=e267]:
            - generic [ref=e268]: monthly returns
            - heading "every month, since inception" [level=2] [ref=e270]:
              - generic [aria-hidden] [ref=e271]:
                - generic [ref=e272]: every
                - generic [ref=e273]: month,
                - generic [ref=e274]: since
                - generic [ref=e275]: inception
            - generic [ref=e276]: every month, since inception
          - generic [aria-hidden] [ref=e279]:
            - generic [ref=e280]: negative
            - generic [ref=e282]: positive
      - region "the ride matters" [ref=e283]:
        - generic [ref=e284]:
          - generic [ref=e285]:
            - generic [ref=e286]: risk
            - heading "the ride matters" [level=2] [ref=e288]:
              - generic [aria-hidden] [ref=e289]:
                - generic [ref=e290]: the
                - generic [ref=e291]: ride
                - generic [ref=e292]: matters
            - generic [ref=e293]: the ride matters
            - paragraph [ref=e294]: annualized, from monthly returns · as of august 2026
          - group "risk" [ref=e296]:
            - button "since inception" [pressed] [ref=e297] [cursor=pointer]
            - button "3 years" [ref=e298] [cursor=pointer]
          - generic [ref=e299]:
            - generic [ref=e300]:
              - generic [ref=e301]: 2.3%
              - generic [ref=e302]: annualized return
            - generic [ref=e303]:
              - generic [ref=e304]: 1.9%
              - generic [ref=e305]: volatility
            - generic [ref=e306]:
              - generic [ref=e307]: 1.0%
              - generic [ref=e308]: downside deviation
            - generic [ref=e309]:
              - generic [ref=e310]: "1.18"
              - generic [ref=e311]: sharpe ratio
            - generic [ref=e312]:
              - generic [ref=e313]: "2.17"
              - generic [ref=e314]: sortino ratio
            - generic [ref=e315]:
              - generic [ref=e316]: −2.5%
              - generic [ref=e317]: max drawdown
            - generic [ref=e318]:
              - generic [ref=e319]: 1.6%
              - generic [ref=e320]: best month
            - generic [ref=e321]:
              - generic [ref=e322]: −1.3%
              - generic [ref=e323]: worst month
            - generic [ref=e324]:
              - 'img "positive months: 63%" [ref=e325]':
                - generic [aria-hidden] [ref=e329]: 63%
              - generic [ref=e330]: positive months
      - region "inside the portfolio" [ref=e331]:
        - generic [ref=e332]:
          - generic [ref=e333]:
            - generic [ref=e334]: portfolio
            - heading "inside the portfolio" [level=2] [ref=e336]:
              - generic [aria-hidden] [ref=e337]:
                - generic [ref=e338]: inside
                - generic [ref=e339]: the
                - generic [ref=e340]: portfolio
            - generic [ref=e341]: inside the portfolio
            - paragraph [ref=e342]: from the monthly factsheet of august 2026
          - generic [ref=e343]:
            - generic [ref=e344]:
              - generic [ref=e345]: 4.21%
              - generic [ref=e346]: Portfolio yield
              - generic [ref=e347]: index 3.48%
            - generic [ref=e348]:
              - generic [ref=e349]: 4.02%
              - generic [ref=e350]: Current yield
              - generic [ref=e351]: index 3.31%
            - generic [ref=e352]:
              - generic [ref=e353]: "2.4"
              - generic [ref=e354]: Duration (years)
              - generic [ref=e355]: index 2.7
            - generic [ref=e356]:
              - generic [ref=e357]: A
              - generic [ref=e358]: Average credit quality
              - generic [ref=e359]: index A
            - generic [ref=e360]:
              - generic [ref=e361]: 93.0%
              - generic [ref=e362]: Rated investment grade
              - generic [ref=e363]: index 100.0%
            - generic [ref=e364]:
              - generic [ref=e365]: "86"
              - generic [ref=e366]: Number of securities
              - generic [ref=e367]: index 742
            - generic [ref=e368]:
              - generic [ref=e369]: 0.62%
              - generic [ref=e370]: Probability of default (5Y)
              - generic [ref=e371]: index 0.48%
            - generic [ref=e372]:
              - generic [ref=e373]: "71.3"
              - generic [ref=e374]: Liquidity score
              - generic [ref=e375]: index 74.2
          - generic [ref=e376]:
            - tablist "portfolio" [ref=e378]:
              - tab "credit ratings" [selected] [ref=e379] [cursor=pointer]
              - tab "sectors" [ref=e380] [cursor=pointer]
              - tab "term structure" [ref=e381] [cursor=pointer]
              - tab "countries" [ref=e382] [cursor=pointer]
            - tabpanel "credit ratings" [ref=e383]:
              - generic [ref=e384]:
                - generic [ref=e385]: fund
                - generic [ref=e387]: index
              - list "credit ratings" [ref=e389]:
                - 'listitem "AAA: fund 8.1%, index 3.2%" [ref=e390]':
                  - generic "AAA" [ref=e391]
                  - generic [aria-hidden] [ref=e395]:
                    - text: 8.1%
                    - generic [ref=e396]: 3.2%
                - 'listitem "AA: fund 14.6%, index 16.8%" [ref=e397]':
                  - generic "AA" [ref=e398]
                  - generic [aria-hidden] [ref=e402]:
                    - text: 14.6%
                    - generic [ref=e403]: 16.8%
                - 'listitem "A: fund 42.8%, index 41.9%" [ref=e404]':
                  - generic "A" [ref=e405]
                  - generic [aria-hidden] [ref=e409]:
                    - text: 42.8%
                    - generic [ref=e410]: 41.9%
                - 'listitem "BBB: fund 27.5%, index 38.1%" [ref=e411]':
                  - generic "BBB" [ref=e412]
                  - generic [aria-hidden] [ref=e416]:
                    - text: 27.5%
                    - generic [ref=e417]: 38.1%
                - 'listitem "BB & below: fund 7.0%, index 0.0%" [ref=e418]':
                  - generic "BB & below" [ref=e419]
                  - generic [aria-hidden] [ref=e423]:
                    - text: 7.0%
                    - generic [ref=e424]: 0.0%
          - generic [ref=e425]:
            - generic [ref=e426]:
              - heading "top 10 holdings" [level=3] [ref=e427]
              - list "top 10 holdings" [ref=e428]:
                - listitem [ref=e429]:
                  - generic [ref=e430]: "01"
                  - generic "Synthetic Issuer A 3.1% 2028" [ref=e431]
                  - generic [ref=e434]: 4.90%
                - listitem [ref=e435]:
                  - generic [ref=e436]: "02"
                  - generic "Synthetic Issuer B 3.1% 2029" [ref=e437]
                  - generic [ref=e440]: 4.60%
                - listitem [ref=e441]:
                  - generic [ref=e442]: "03"
                  - generic "Synthetic Issuer C 3.1% 2030" [ref=e443]
                  - generic [ref=e446]: 4.30%
                - listitem [ref=e447]:
                  - generic [ref=e448]: "04"
                  - generic "Synthetic Issuer D 3.1% 2031" [ref=e449]
                  - generic [ref=e452]: 4.00%
                - listitem [ref=e453]:
                  - generic [ref=e454]: "05"
                  - generic "Synthetic Issuer E 3.1% 2032" [ref=e455]
                  - generic [ref=e458]: 3.70%
                - listitem [ref=e459]:
                  - generic [ref=e460]: "06"
                  - generic "Synthetic Issuer F 3.1% 2033" [ref=e461]
                  - generic [ref=e464]: 3.40%
                - listitem [ref=e465]:
                  - generic [ref=e466]: "07"
                  - generic "Synthetic Issuer G 3.1% 2034" [ref=e467]
                  - generic [ref=e470]: 3.00%
                - listitem [ref=e471]:
                  - generic [ref=e472]: "08"
                  - generic "Synthetic Issuer H 3.1% 2028" [ref=e473]
                  - generic [ref=e476]: 2.70%
                - listitem [ref=e477]:
                  - generic [ref=e478]: "09"
                  - generic "Synthetic Issuer I 3.1% 2029" [ref=e479]
                  - generic [ref=e482]: 2.40%
                - listitem [ref=e483]:
                  - generic [ref=e484]: "10"
                  - generic "Synthetic Issuer J 3.1% 2030" [ref=e485]
                  - generic [ref=e488]: 2.10%
            - generic [ref=e489]:
              - heading "sustainability metrics" [level=3] [ref=e490]
              - paragraph [ref=e491]: the portfolio vs its index
              - generic [ref=e492]:
                - generic [ref=e493]:
                  - term [ref=e494]: S&P Global ESG rank
                  - definition [ref=e495]:
                    - text: "72.5"
                    - generic [ref=e496]: index 64.1
                - generic [ref=e497]:
                  - term [ref=e498]: Carbon intensity
                  - definition [ref=e499]:
                    - text: "63.4"
                    - generic [ref=e500]: index 118.7
                - generic [ref=e501]:
                  - term [ref=e502]: Water intensity
                  - definition [ref=e503]:
                    - text: "412.8"
                    - generic [ref=e504]: index 655.1
                - generic [ref=e505]:
                  - term [ref=e506]: Board independence
                  - definition [ref=e507]:
                    - text: 81.2%
                    - generic [ref=e508]: index 79.4%
                - generic [ref=e509]:
                  - term [ref=e510]: Board diversity
                  - definition [ref=e511]:
                    - text: 34.1%
                    - generic [ref=e512]: index 31.8%
      - region "the essentials" [ref=e513]:
        - generic [ref=e514]:
          - generic [ref=e515]:
            - generic [ref=e516]: fund facts
            - heading "the essentials" [level=2] [ref=e518]:
              - generic [aria-hidden] [ref=e519]:
                - generic [ref=e520]: the
                - generic [ref=e521]: essentials
            - generic [ref=e522]: the essentials
            - paragraph [ref=e523]: Short-term Canadian corporate bonds selected by our two-system process, with an uncorrelated protection overlay designed to soften bond drawdowns.
          - generic [ref=e524]:
            - heading "classes" [level=3] [ref=e525]
            - table [ref=e527]:
              - caption [ref=e528]: classes
              - rowgroup [ref=e529]:
                - row [ref=e530]:
                  - columnheader "fundserv" [ref=e531]
                  - columnheader "class" [ref=e532]
                  - columnheader "currency" [ref=e533]
                  - columnheader "nav" [ref=e534]
                  - columnheader "change" [ref=e535]
                  - columnheader "date" [ref=e536]
              - rowgroup [ref=e537]:
                - row [ref=e538]:
                  - cell "headline class LDM001 (headline class)" [ref=e539]:
                    - generic "headline class" [ref=e540]
                    - code [ref=e541]: LDM001
                    - generic [ref=e542]: (headline class)
                  - cell "FP" [ref=e543]
                  - cell "CAD" [ref=e544]
                  - cell "$10.1905" [ref=e545]
                  - cell "+0.11%" [ref=e546]
                  - cell "sep 28, 2026" [ref=e547]
                - row [ref=e548]:
                  - cell [ref=e549]:
                    - code [ref=e550]: LDM021
                  - cell "A" [ref=e551]
                  - cell "CAD" [ref=e552]
                  - cell "$9.7714" [ref=e553]
                  - cell "−0.21%" [ref=e554]
                  - cell "sep 28, 2026" [ref=e555]
                - row [ref=e556]:
                  - cell [ref=e557]:
                    - code [ref=e558]: LDM081
                  - cell "F" [ref=e559]
                  - cell "CAD" [ref=e560]
                  - cell "$10.0397" [ref=e561]
                  - cell "−0.19%" [ref=e562]
                  - cell "sep 28, 2026" [ref=e563]
                - row [ref=e564]:
                  - cell [ref=e565]:
                    - code [ref=e566]: LDM011
                  - cell "F USD" [ref=e567]
                  - cell "USD" [ref=e568]
                  - cell "US$10.3711" [ref=e569]
                  - cell "—" [ref=e570]
                  - cell "sep 28, 2026" [ref=e571]
          - generic [ref=e573]:
            - generic [ref=e574]:
              - term [ref=e575]: vehicle
              - definition [ref=e576]: investment fund
            - generic [ref=e577]:
              - term [ref=e578]: asset class
              - definition [ref=e579]: Short-term fixed income
            - generic [ref=e580]:
              - term [ref=e581]: inception
              - definition [ref=e582]: january 2019
            - generic [ref=e583]:
              - term [ref=e584]: benchmark
              - definition [ref=e585]: FTSE Canada Short Term Corporate Bond Index
            - generic [ref=e586]:
              - term [ref=e587]: risk rating
              - definition [ref=e588]: low to medium
      - region "disclosure" [ref=e589]:
        - generic [ref=e590]:
          - generic [ref=e591]:
            - generic [ref=e592]: important information
            - heading "disclosure" [level=2] [ref=e594]:
              - generic [ref=e596]: disclosure
            - generic [ref=e597]: disclosure
          - generic [ref=e598]:
            - paragraph [ref=e599]: The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.
            - paragraph [ref=e600]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund's returns may have differed had it existed during that period.
            - paragraph [ref=e601]: "Performance shown: net of fees · class FP · vs FTSE Canada Short Term Corporate Bond Index"
            - paragraph [ref=e602]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the class shown; periods of less than one year are not annualized.
            - paragraph [ref=e603]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
            - paragraph [ref=e604]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
            - paragraph [ref=e605]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
            - paragraph [ref=e606]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
            - generic [ref=e607]: Updated daily from Nymbus’ data platform; portfolio data from the monthly factsheet of august 2026. performance as of august 2026 · net asset values as of sep 28, 2026.
      - navigation "on this page" [ref=e610]:
        - list "strategies" [ref=e611]:
          - listitem "Nymbus Monthly Income Fund" [ref=e612] [cursor=pointer]
          - listitem "Nymbus Sustainable Enhanced Bonds Fund" [ref=e615] [cursor=pointer]
          - listitem "Nymbus Multi-Strategy Fund" [ref=e618] [cursor=pointer]
          - listitem "Nymbus Global Minimum Volatility" [ref=e621] [cursor=pointer]
        - generic [ref=e624]:
          - link "overview" [ref=e625] [cursor=pointer]:
            - /url: "#overview"
          - link "performance" [ref=e626] [cursor=pointer]:
            - /url: "#performance"
          - link "growth" [ref=e627] [cursor=pointer]:
            - /url: "#growth"
          - link "calendar years" [ref=e628] [cursor=pointer]:
            - /url: "#calendar"
          - link "monthly" [ref=e629] [cursor=pointer]:
            - /url: "#monthly"
          - link "risk" [ref=e630] [cursor=pointer]:
            - /url: "#risk"
          - link "portfolio" [ref=e631] [cursor=pointer]:
            - /url: "#portfolio"
          - link "fund facts" [ref=e632] [cursor=pointer]:
            - /url: "#facts"
        - generic "illustrative figures only, not actual performance" [ref=e633]: sample data
  - contentinfo [ref=e634]:
    - generic [ref=e635]:
      - generic [ref=e636]:
        - generic [ref=e637]:
          - link "Nymbus Capital, home" [ref=e638] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e639]
          - paragraph [ref=e648]: Montreal-based quantitative investment manager building systematic fixed income and multi-asset strategies with scientific rigour.
          - generic [ref=e649]:
            - generic [ref=e650]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e651] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e652]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e653] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e654]:
          - heading "Strategies" [level=2] [ref=e655]
          - list [ref=e656]:
            - listitem [ref=e657]:
              - link "Monthly Income" [ref=e658] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e660]:
              - link "Sustainable Enhanced Bonds" [ref=e661] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e663]:
              - link "Multi-Strategy" [ref=e664] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e666]:
              - link "Global Minimum Volatility" [ref=e667] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e669]:
          - heading "Company" [level=2] [ref=e670]
          - list [ref=e671]:
            - listitem [ref=e672]:
              - link "About & team" [ref=e673] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e674]:
              - link "Approach" [ref=e675] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e676]:
              - link "Sustainability" [ref=e677] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e678]:
              - link "Solutions" [ref=e679] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e680]:
          - heading "Resources" [level=2] [ref=e681]
          - list [ref=e682]:
            - listitem [ref=e683]:
              - link "Contact" [ref=e684] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e685]:
              - link "Privacy policy" [ref=e686] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e687]:
              - link "Complaints & code of ethics" [ref=e688] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e689]:
              - link "LinkedIn" [ref=e690] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e694]:
        - paragraph [ref=e695]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
        - paragraph [ref=e696]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
        - paragraph [ref=e697]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the class shown; periods of less than one year are not annualized.
        - paragraph [ref=e698]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
        - paragraph [ref=e699]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund's returns may have differed had it existed during that period.
        - paragraph [ref=e700]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account.
        - paragraph [ref=e701]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
      - generic [ref=e702]:
        - generic [ref=e703]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e704]: PRI signatory
  - alert [ref=e705]
```

# Test source

```ts
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | import { mkdirSync } from "node:fs";
  3   | 
  4   | /**
  5   |  * Fund detail pages (/strategies/<fund key>) rendered against the illustrative sample data
  6   |  * (SHOW_SAMPLE_DATA=1 in the e2e server env, empty data volume).
  7   |  */
  8   | const FUNDS = [
  9   |   { slug: "monthly-income", en: "Nymbus Monthly Income Fund", fr: "Fonds Nymbus Revenu Mensuel", gross: false, classes: true },
  10  |   { slug: "sustainable-enhanced-bonds", en: "Nymbus Sustainable Enhanced Bonds Fund", fr: "Fonds Nymbus Obligations Durables Bonifiées", gross: false, classes: true },
  11  |   { slug: "multi-strategy", en: "Nymbus Multi-Strategy Fund", fr: "Fonds Nymbus Multistratégies", gross: false, classes: true },
  12  |   // managed accounts, not a fund: gross figures, no FundServ classes
  13  |   { slug: "global-minimum-volatility", en: "Nymbus Global Minimum Volatility", fr: "Nymbus Global Minimum Volatilité", gross: true, classes: false },
  14  | ];
  15  | 
  16  | /** Scroll the whole page so lazily mounted charts and reveals run. */
  17  | async function scrollThrough(page: Page) {
  18  |   const h = await page.evaluate(() => document.body.scrollHeight);
  19  |   for (let y = 0; y < h; y += 600) {
  20  |     await page.evaluate((top) => window.scrollTo(0, top), y);
  21  |     await page.waitForTimeout(60);
  22  |   }
  23  | }
  24  | 
  25  | for (const f of FUNDS) {
  26  |   test(`fund page renders: ${f.slug}`, async ({ page }, info) => {
  27  |     const errors: string[] = [];
  28  |     page.on("pageerror", (e) => errors.push(e.message));
  29  |     const res = await page.goto(`/strategies/${f.slug}`);
  30  |     expect(res?.status()).toBe(200);
  31  | 
  32  |     await expect(page.getByRole("heading", { level: 1, name: f.en.toLowerCase() })).toBeVisible();
  33  |     // hero: since-inception figure and its label
  34  |     await expect(page.locator(".fx-bigfig")).toBeVisible();
  35  |     await expect(page.locator(".fx-bigfig .odo .sr-only")).toHaveText(/^−?\d+\.\d%$/);
  36  |     await expect(page.getByTestId("hero-figure-label")).toContainText(f.gross ? "gross" : "net");
  37  |     await expect(page.getByTestId("basis")).toContainText(f.gross ? "gross of fees" : "net of fees");
  38  |     // sample data is flagged (corner ribbon on desktop, hero chip everywhere)
  39  |     await expect(page.locator(".fx-hero .fx-sample")).toBeVisible();
  40  | 
  41  |     // trailing returns: chart mounts when scrolled near, one focusable group per period
  42  |     const chart = page.getByTestId("trailing-chart");
  43  |     await chart.scrollIntoViewIfNeeded();
  44  |     await expect(chart.locator("svg .cat").first()).toBeVisible();
  45  |     expect(await chart.locator("svg .cat").count()).toBeGreaterThan(0);
  46  |     await expect(page.getByTestId("trailing-table")).toBeAttached();
  47  | 
  48  |     // classes table (funds only)
  49  |     if (f.classes) {
  50  |       await page.getByTestId("classes-table").scrollIntoViewIfNeeded();
  51  |       await expect(page.getByTestId("classes-table")).toBeVisible();
  52  |       await expect(page.getByTestId("classes-table").locator("tbody tr.hl")).toHaveCount(1);
  53  |     } else {
  54  |       await expect(page.getByTestId("classes-table")).toHaveCount(0);
  55  |     }
  56  | 
  57  |     await expect(page.getByTestId("provenance")).toContainText("Updated daily");
  58  |     await scrollThrough(page);
  59  |     await page.evaluate(() => window.scrollTo(0, 0));
  60  |     await page.waitForTimeout(400);
  61  |     mkdirSync("e2e/screenshots", { recursive: true });
  62  |     await page.screenshot({ path: `e2e/screenshots/fund-${f.slug}-${info.project.name}.png`, fullPage: true });
  63  |     expect(errors).toEqual([]);
  64  |   });
  65  | }
  66  | 
  67  | test("fund switcher links every fund", async ({ page }) => {
  68  |   await page.goto("/strategies/monthly-income");
  69  |   const dock = page.getByTestId("fund-dock");
  70  |   for (const f of FUNDS) await expect(dock.locator(`a[href="/strategies/${f.slug}"]`)).toHaveCount(1);
  71  |   await expect(dock.locator('a[aria-current="page"]')).toHaveAttribute("href", "/strategies/monthly-income");
  72  | });
  73  | 
  74  | test("legacy slug redirects to monthly income", async ({ page }) => {
  75  |   const res = await page.goto("/strategies/sustainable-enhanced-short-term-bonds");
  76  |   expect(res?.status()).toBe(200);
  77  |   await expect(page).toHaveURL(/\/strategies\/monthly-income$/);
  78  |   await expect(page.locator(".fx-bigfig")).toBeVisible();
  79  | });
  80  | 
  81  | test("unknown slug is a 404", async ({ page }) => {
  82  |   const res = await page.goto("/strategies/no-such-fund");
  83  |   expect(res?.status()).toBe(404);
  84  | });
  85  | 
  86  | test("FR toggle switches the labels", async ({ page }) => {
  87  |   await page.goto("/strategies/monthly-income");
  88  |   await expect(page.getByRole("heading", { name: "trailing returns" })).toBeAttached();
  89  |   const toggle = page.getByRole("button", { name: /toggle language|fr/i }).first();
> 90  |   if (await toggle.isVisible().catch(() => false)) await toggle.click();
      |                                                                 ^ Error: locator.click: Test timeout of 60000ms exceeded.
  91  |   else {
  92  |     // the site shell owns the toggle; fall back to the persisted choice it reads on load
  93  |     await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  94  |     await page.reload();
  95  |   }
  96  |   await expect(page.getByRole("heading", { level: 1, name: "fonds nymbus revenu mensuel" })).toBeVisible();
  97  |   await expect(page.getByRole("heading", { name: "rendements cumulatifs" })).toBeAttached();
  98  |   await expect(page.getByTestId("basis")).toHaveText(/^net de frais( · (série|classe) \S+)?$/i);
  99  |   // French number formatting: decimal comma and a (narrow) no-break space before %
  100 |   await expect(page.locator(".fx-bigfig .odo .sr-only")).toHaveText(/^−?\d+,\d\s%$/);
  101 | });
  102 | 
```