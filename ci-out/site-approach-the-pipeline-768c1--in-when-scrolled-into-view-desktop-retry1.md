# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site.spec.ts >> approach: the pipeline and the risk flow draw themselves in when scrolled into view
- Location: e2e/site.spec.ts:240:5

# Error details

```
Error: loop

expect(received).toMatch(expected)

Expected pattern: /^(none|inset\(0(px)?\))$/
Received string:  "inset(0px 0px 0px 0%)"
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
      - generic [ref=e51]:
        - navigation "Breadcrumb" [ref=e52]:
          - list [ref=e53]:
            - listitem [ref=e54]:
              - link "Home" [ref=e55] [cursor=pointer]:
                - /url: /
            - listitem [ref=e58]:
              - generic [ref=e59]: Our approach
        - generic [ref=e61]:
          - paragraph [ref=e63]: Our approach
          - heading "At the intersection of technology, data and finance" [level=1] [ref=e65]:
            - generic [aria-hidden] [ref=e66]:
              - generic [ref=e67]: At
              - generic [ref=e68]: the
              - generic [ref=e69]: intersection
              - generic [ref=e70]: of
              - generic [ref=e71]: technology,
              - generic [ref=e72]: data
              - generic [ref=e73]: and
              - generic [ref=e74]: finance
          - generic [ref=e75]: We invest systematically. Every step, from the data we collect to the positions we hold, follows documented rules that are tested before they are used, monitored while they run and refined through ongoing research.
          - generic [ref=e78]:
            - link "Our strategies" [ref=e79] [cursor=pointer]:
              - /url: /strategies
            - link "Meet the team" [ref=e82] [cursor=pointer]:
              - /url: /team
      - region [ref=e83]:
        - generic [ref=e84]:
          - generic [ref=e85]:
            - paragraph [ref=e87]: Investment methodology
            - heading "From raw data to a managed portfolio, in four steps" [level=2] [ref=e89]:
              - generic [aria-hidden] [ref=e90]:
                - generic [ref=e91]: From
                - generic [ref=e92]: raw
                - generic [ref=e93]: data
                - generic [ref=e94]: to
                - generic [ref=e95]: a
                - generic [ref=e96]: managed
                - generic [ref=e97]: portfolio,
                - generic [ref=e98]: in
                - generic [ref=e99]: four
                - generic [ref=e100]: steps
            - generic [ref=e101]: A systematic pipeline turns public market data into portfolios that respect explicit risk budgets. What we learn from monitoring feeds back into research.
          - figure "Monitoring results feed back into research" [ref=e103]:
            - list [ref=e104]:
              - listitem [ref=e105]:
                - generic [ref=e150]: "01"
                - paragraph [ref=e157]: Data and research
                - paragraph [ref=e158]: Prices, credit metrics and macro indicators, cleaned and stored every day.
              - listitem [ref=e159]:
                - generic [ref=e166]: "02"
                - paragraph [ref=e177]: Signal generation
                - paragraph [ref=e178]: Models turn data into investment signals, validated out of sample.
              - listitem [ref=e179]:
                - generic [ref=e189]: "03"
                - paragraph [ref=e196]: Portfolio construction
                - paragraph [ref=e197]: An optimizer sizes positions within risk, liquidity and cost limits.
              - listitem [ref=e198]:
                - generic [ref=e204]: "04"
                - paragraph [ref=e210]: Risk management
                - paragraph [ref=e211]: Exposures are monitored continuously and adjusted to the market regime.
          - list [ref=e220]:
            - listitem [ref=e221]:
              - generic [ref=e227]:
                - paragraph [ref=e228]: "01"
                - heading "Data and research" [level=3] [ref=e229]
                - generic [ref=e231]:
                  - paragraph [ref=e232]: "We process large volumes of public market data: bond prices, fundamental credit metrics, macroeconomic indicators and cross-asset relationships. Statistical analysis and machine learning look for patterns across billions of data points, a volume no team could review by hand, to find opportunities and measure risk more precisely."
                  - list [ref=e233]:
                    - listitem [ref=e234]: Proprietary credit scoring models
                    - listitem [ref=e235]: Macro regime classification
                    - listitem [ref=e236]: Pattern recognition across billions of data points
                    - listitem [ref=e237]: Cross-asset correlation analysis
            - listitem [ref=e238]:
              - generic [ref=e248]:
                - paragraph [ref=e249]: "02"
                - heading "Signal generation" [level=3] [ref=e250]
                - generic [ref=e252]:
                  - paragraph [ref=e253]: Machine learning models turn the data into investment signals. Ensemble methods combine several independent sources so that no single signal dominates, and every signal is validated on data it was not trained on before it is used.
                  - list [ref=e254]:
                    - listitem [ref=e255]: Gradient-boosted tree ensembles
                    - listitem [ref=e256]: Neural network regime classifiers
                    - listitem [ref=e257]: Cross-validation and walk-forward testing
                    - listitem [ref=e258]: Signal decay analysis and refresh cycles
            - listitem [ref=e259]:
              - generic [ref=e265]:
                - paragraph [ref=e266]: "03"
                - heading "Portfolio construction" [level=3] [ref=e267]
                - generic [ref=e269]:
                  - paragraph [ref=e270]: Signals feed a portfolio optimizer that sizes positions within risk budgets, concentration limits, liquidity constraints and transaction-cost models. The result is a portfolio built by the same rules every time, with every position traceable to the signals behind it.
                  - list [ref=e271]:
                    - listitem [ref=e272]: Mean-variance with robust covariance estimation
                    - listitem [ref=e273]: Risk parity and factor-aware allocation
                    - listitem [ref=e274]: Transaction-cost optimization
                    - listitem [ref=e275]: Rebalancing threshold calibration
            - listitem [ref=e276]:
              - generic [ref=e281]:
                - paragraph [ref=e282]: "04"
                - heading "Risk management" [level=3] [ref=e283]
                - generic [ref=e285]:
                  - paragraph [ref=e286]: "A risk engine monitors each portfolio continuously: value at risk, stress tests, concentration and liquidity. Hedging adjusts exposure to the market regime identified by our models, to limit losses in adverse conditions."
                  - list [ref=e287]:
                    - listitem [ref=e288]: Value at risk and stress testing
                    - listitem [ref=e289]: Regime detection (risk-on / risk-off)
                    - listitem [ref=e290]: Duration and credit hedging
                    - listitem [ref=e291]: Tail-risk protection through overlays
      - region [ref=e292]:
        - generic [ref=e293]:
          - generic [ref=e294]:
            - paragraph [ref=e296]: Bond investment process
            - heading "Two systems for every bond portfolio" [level=2] [ref=e298]:
              - generic [aria-hidden] [ref=e299]:
                - generic [ref=e300]: Two
                - generic [ref=e301]: systems
                - generic [ref=e302]: for
                - generic [ref=e303]: every
                - generic [ref=e304]: bond
                - generic [ref=e305]: portfolio
            - generic [ref=e306]: "Our fixed income mandates run on the same framework: a top-down system positions the portfolio across the yield curve and credit sectors, and a bottom-up system selects the individual bonds."
          - generic [ref=e308]:
            - article [ref=e309]:
              - paragraph [ref=e310]: System 1 · macro
              - heading "Portfolio positioning" [level=3] [ref=e311]
              - paragraph [ref=e312]: Systematizes a portfolio manager’s experience
              - generic [ref=e313]:
                - generic [ref=e314]:
                  - term [ref=e315]: Method
                  - definition [ref=e316]: Systematic
                - generic [ref=e317]:
                  - term [ref=e318]: View
                  - definition [ref=e319]: Macro, top-down
                - generic [ref=e320]:
                  - term [ref=e321]: Rebalancing
                  - definition [ref=e322]: Every six months
              - list [ref=e323]:
                - listitem [ref=e324]:
                  - generic [aria-hidden] [ref=e325]: "1"
                  - text: Identify market regimes and trends
                - listitem [ref=e326]:
                  - generic [aria-hidden] [ref=e327]: "2"
                  - text: Build the curve and credit matrix from billions of bond data points
            - article [ref=e328]:
              - paragraph [ref=e329]: System 2 · micro
              - heading "Security selection" [level=3] [ref=e330]
              - paragraph [ref=e331]: Replicates an analyst’s in-depth knowledge
              - generic [ref=e332]:
                - generic [ref=e333]:
                  - term [ref=e334]: Method
                  - definition [ref=e335]: Systematic and discretionary
                - generic [ref=e336]:
                  - term [ref=e337]: View
                  - definition [ref=e338]: Micro, bottom-up
                - generic [ref=e339]:
                  - term [ref=e340]: Rebalancing
                  - definition [ref=e341]: Continuous, on alerts
              - list [ref=e342]:
                - listitem [ref=e343]:
                  - generic [aria-hidden] [ref=e344]: "1"
                  - text: Score and rank the bonds of each cell by yield and risk, continuously
                - listitem [ref=e345]:
                  - generic [aria-hidden] [ref=e346]: "2"
                  - text: Select the final securities
      - region [ref=e347]:
        - generic [ref=e348]:
          - generic [ref=e349]:
            - paragraph [ref=e351]: Protection strategy
            - heading "Why add a protection overlay to a bond portfolio?" [level=2] [ref=e353]:
              - generic [aria-hidden] [ref=e354]:
                - generic [ref=e355]: Why
                - generic [ref=e356]: add
                - generic [ref=e357]: a
                - generic [ref=e358]: protection
                - generic [ref=e359]: overlay
                - generic [ref=e360]: to
                - generic [ref=e361]: a
                - generic [ref=e362]: bond
                - generic [ref=e363]: portfolio?
            - generic [ref=e364]: "Bonds tend to struggle in the same conditions: rising rates, inflation spikes and widening credit spreads. All three come with elevated volatility, the environment in which managed futures strategies have tended to perform."
          - generic [ref=e366]:
            - generic [ref=e367]:
              - paragraph [ref=e368]: Bonds suffer when…
              - list [ref=e369]:
                - listitem [ref=e370]: rates rise
                - listitem [ref=e373]: inflation spikes
                - listitem [ref=e376]: spreads widen
            - generic [ref=e382]:
              - paragraph [ref=e383]: The common thread
              - generic [ref=e384]: Elevated volatility
            - generic [ref=e390]:
              - paragraph [ref=e391]: Our response
              - generic [ref=e392]:
                - heading "A managed futures overlay" [level=3] [ref=e396]
                - paragraph [ref=e397]: Our uncorrelated protection strategy acts as a statistical hedge and has typically buffered bond drawdowns when volatility rises.*
          - generic [ref=e398]:
            - generic [ref=e399]:
              - heading "Capital stays invested" [level=3] [ref=e400]
              - paragraph [ref=e401]: The overlay is added on top of the bond portfolio with futures, which only require a margin deposit of about 5 to 10% of their exposure.**
            - generic [aria-hidden] [ref=e402]:
              - generic [ref=e403]:
                - generic [ref=e404]: Bonds, 100% of capital
                - paragraph [ref=e406]: Bond portfolio
              - generic [ref=e407]:
                - generic [ref=e408]:
                  - generic [ref=e409]: Protection overlay
                  - generic [ref=e410]: Bonds, 100% of capital
                - paragraph [ref=e411]: With the overlay
          - generic [ref=e412]:
            - paragraph [ref=e413]: "* Source: Nymbus Capital Inc. Statements reflect historical observations of the Nymbus bond funds’ underlying strategies for conceptual visualization purposes and should not be construed as an exact representation of past contributions or future expectations."
            - paragraph [ref=e414]: "** Source: Nymbus Capital Inc. For illustrative purposes only. The percentages are approximations of typical allocations and may vary as the model allocation evolves."
      - region [ref=e415]:
        - generic [ref=e416]:
          - generic [ref=e417]:
            - paragraph [ref=e419]: Investment philosophy
            - heading "The principles behind every decision" [level=2] [ref=e421]:
              - generic [aria-hidden] [ref=e422]:
                - generic [ref=e423]: The
                - generic [ref=e424]: principles
                - generic [ref=e425]: behind
                - generic [ref=e426]: every
                - generic [ref=e427]: decision
          - generic [ref=e428]:
            - generic [ref=e429]:
              - heading "Systematic over discretionary" [level=3] [ref=e434]
              - paragraph [ref=e436]: Decisions follow rules that are tested, validated and improved over time, which keeps emotion out of the process.
            - generic [ref=e437]:
              - heading "Risk before return" [level=3] [ref=e443]
              - paragraph [ref=e445]: Every source of return is weighed against the risk it adds. Portfolios are built to risk budgets, not return targets.
            - generic [ref=e446]:
              - heading "Technology first" [level=3] [ref=e452]
              - paragraph [ref=e454]: Purpose-built infrastructure processes data at scale, so research moves quickly and strategies run reliably.
            - generic [ref=e455]:
              - heading "Continuous research" [level=3] [ref=e459]
              - paragraph [ref=e461]: A dedicated quantitative research team keeps testing new data, methods and market structures.
            - generic [ref=e462]:
              - heading "Capital preservation" [level=3] [ref=e466]
              - paragraph [ref=e468]: Downside protection is built into each strategy through systematic risk limits and hedging.
            - generic [ref=e469]:
              - heading "Diversified return sources" [level=3] [ref=e475]
              - paragraph [ref=e477]: Combining strategies that behave differently across market regimes makes a portfolio less dependent on any one of them.
      - region [ref=e478]:
        - generic [ref=e479]:
          - generic [ref=e480]:
            - paragraph [ref=e482]: Research and technology
            - heading "Built like a research lab, run like a trading desk" [level=2] [ref=e484]:
              - generic [aria-hidden] [ref=e485]:
                - generic [ref=e486]: Built
                - generic [ref=e487]: like
                - generic [ref=e488]: a
                - generic [ref=e489]: research
                - generic [ref=e490]: lab,
                - generic [ref=e491]: run
                - generic [ref=e492]: like
                - generic [ref=e493]: a
                - generic [ref=e494]: trading
                - generic [ref=e495]: desk
            - generic [ref=e496]: Our strategies are developed and operated on in-house technology. The same data and code serve research, daily operations and reporting, so what we test is what we run.
          - generic [ref=e498]:
            - generic [ref=e499]:
              - heading "From idea to production" [level=3] [ref=e500]
              - list [ref=e501]:
                - listitem [ref=e502]:
                  - generic [aria-hidden] [ref=e503]: "01"
                  - generic [ref=e504]:
                    - paragraph [ref=e505]: Hypothesis
                    - paragraph [ref=e506]: A documented idea about a market behaviour, with the data needed to test it.
                - listitem [ref=e507]:
                  - generic [aria-hidden] [ref=e508]: "02"
                  - generic [ref=e509]:
                    - paragraph [ref=e510]: Research
                    - paragraph [ref=e511]: Backtests on historical data, including transaction costs.
                - listitem [ref=e512]:
                  - generic [aria-hidden] [ref=e513]: "03"
                  - generic [ref=e514]:
                    - paragraph [ref=e515]: Validation
                    - paragraph [ref=e516]: Out-of-sample and walk-forward tests, then review by the team.
                - listitem [ref=e517]:
                  - generic [aria-hidden] [ref=e518]: "04"
                  - generic [ref=e519]:
                    - paragraph [ref=e520]: Production
                    - paragraph [ref=e521]: Deployed with the same code, monitored daily, retired when its signal decays.
            - generic [ref=e522]:
              - generic [ref=e523]:
                - heading "Data platform" [level=3] [ref=e529]
                - paragraph [ref=e531]: Custodian, market and index data consolidated into one central store every business day.
              - generic [ref=e532]:
                - heading "Machine learning" [level=3] [ref=e542]
                - paragraph [ref=e544]: Regime classification and pattern recognition across the bond universe.
              - generic [ref=e545]:
                - heading "Validation discipline" [level=3] [ref=e549]
                - paragraph [ref=e551]: Cross-validation, walk-forward testing and signal-decay monitoring before and after launch.
              - generic [ref=e552]:
                - heading "Operations and reporting" [level=3] [ref=e556]
                - paragraph [ref=e558]: Trade reporting and fund analytics built on the same data as research.
      - region [ref=e559]:
        - generic [ref=e561]:
          - generic [ref=e562]:
            - generic [ref=e563]:
              - paragraph [ref=e565]: The team
              - heading "Scientists and market veterans" [level=2] [ref=e567]:
                - generic [aria-hidden] [ref=e568]:
                  - generic [ref=e569]: Scientists
                  - generic [ref=e570]: and
                  - generic [ref=e571]: market
                  - generic [ref=e572]: veterans
              - generic [ref=e573]: Physicists, engineers and computer scientists work alongside portfolio managers who have spent their careers in fixed income and derivatives.
            - generic [ref=e575]:
              - generic [ref=e576]:
                - generic [ref=e577]: "18"
                - generic [ref=e578]: people on the team
              - generic [ref=e579]:
                - generic [ref=e580]: "2"
                - generic [ref=e581]: PhDs in physics
              - generic [ref=e582]:
                - generic [ref=e583]: "4"
                - generic [ref=e584]: CFA charterholders
            - link "Meet the team" [ref=e586] [cursor=pointer]:
              - /url: /team
          - list [aria-hidden] [ref=e589]:
            - listitem [ref=e590]
            - listitem [ref=e592]
            - listitem [ref=e594]
            - listitem [ref=e596]
            - listitem [ref=e598]
            - listitem [ref=e600]
            - listitem [ref=e602]
            - listitem [ref=e604]
            - listitem [ref=e606]
      - generic [ref=e610]:
        - heading "See the approach in practice" [level=2] [ref=e611]:
          - generic [aria-hidden] [ref=e612]:
            - generic [ref=e613]: See
            - generic [ref=e614]: the
            - generic [ref=e615]: approach
            - generic [ref=e616]: in
            - generic [ref=e617]: practice
        - paragraph [ref=e619]: Each of our strategies applies this process to a different mandate. Explore them, or talk to our team about yours.
        - generic [ref=e621]:
          - link "View strategies" [ref=e622] [cursor=pointer]:
            - /url: /strategies
          - link "Contact us" [ref=e625] [cursor=pointer]:
            - /url: /contact
  - contentinfo [ref=e626]:
    - generic [ref=e627]:
      - generic [ref=e628]:
        - generic [ref=e629]:
          - link "Nymbus Capital, home" [ref=e630] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e631]
          - paragraph [ref=e640]: Montreal-based quantitative investment manager building systematic fixed income and multi-asset strategies with scientific rigour.
          - generic [ref=e641]:
            - generic [ref=e642]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e643] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e644]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e645] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e646]:
          - heading "Strategies" [level=2] [ref=e647]
          - list [ref=e648]:
            - listitem [ref=e649]:
              - link "Monthly Income" [ref=e650] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e652]:
              - link "Sustainable Enhanced Bonds" [ref=e653] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e655]:
              - link "Multi-Strategy" [ref=e656] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e658]:
              - link "Global Minimum Volatility" [ref=e659] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e661]:
          - heading "Company" [level=2] [ref=e662]
          - list [ref=e663]:
            - listitem [ref=e664]:
              - link "About & team" [ref=e665] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e666]:
              - link "Approach" [ref=e667] [cursor=pointer]:
                - /url: /approach
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
      - generic [ref=e686]:
        - paragraph [ref=e687]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
        - paragraph [ref=e688]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
        - paragraph [ref=e689]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the class shown; periods of less than one year are not annualized.
        - paragraph [ref=e690]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
        - paragraph [ref=e691]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund's returns may have differed had it existed during that period.
        - paragraph [ref=e692]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account.
        - paragraph [ref=e693]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
      - generic [ref=e694]:
        - generic [ref=e695]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e696]: PRI signatory
  - alert [ref=e697]
```

# Test source

```ts
  155 |   await expect(menu).toBeHidden();
  156 |   await expect(toggle).toBeFocused();
  157 |   // navigating from the menu
  158 |   await toggle.click();
  159 |   await menu.getByRole("link", { name: /^about$/i }).click();
  160 |   await expect(page).toHaveURL(/\/team$/);
  161 |   await expect(menu).toBeHidden();
  162 | });
  163 | 
  164 | test("reduced motion: content is visible without animations", async ({ browser, baseURL }) => {
  165 |   const ctx = await browser.newContext({ reducedMotion: "reduce", baseURL });
  166 |   const page = await ctx.newPage();
  167 |   for (const path of ["/approach", "/sustainability", "/team", "/contact", "/legal", "/privacy"]) {
  168 |     await page.goto(path);
  169 |     // the H1 words and every revealed block are visible at once, even before they scroll into view
  170 |     const h1 = page.getByRole("heading", { level: 1 }).first();
  171 |     expect(await h1.evaluate((n) => Number(getComputedStyle(n.querySelector(".w") ?? n).opacity)), path).toBe(1);
  172 |     const hidden = await page.evaluate(() =>
  173 |       Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-kids] > *, .ap-node, .ap-risks li, .ap-seg, .ab-person, .ab-tl-i, .ct-opt, .lg2-sec"))
  174 |         .filter((e) => getComputedStyle(e).opacity === "0").length,
  175 |     );
  176 |     expect(hidden, path).toBe(0);
  177 |   }
  178 |   // the pipeline illustrations are drawn, not waiting for a scroll
  179 |   await page.goto("/approach");
  180 |   const wave = page.locator(".ap-wave").first();
  181 |   expect(await wave.evaluate((n) => getComputedStyle(n).strokeDashoffset)).toMatch(/^0(px)?$/);
  182 |   await ctx.close();
  183 | });
  184 | 
  185 | test("team: filter by department and open a bio", async ({ page }) => {
  186 |   await page.goto("/team");
  187 |   const people = page.getByTestId("people").locator(":scope > li");
  188 |   await people.first().scrollIntoViewIfNeeded();
  189 |   const all = await people.count();
  190 |   expect(all).toBeGreaterThan(10);
  191 |   const board = page.getByRole("button", { name: /^board/i });
  192 |   await board.click();
  193 |   await expect(board).toHaveAttribute("aria-pressed", "true");
  194 |   await expect.poll(() => people.count()).toBeLessThan(all);
  195 |   await page.getByRole("button", { name: /^everyone/i }).click();
  196 |   await expect.poll(() => people.count()).toBe(all);
  197 |   const first = people.first().getByRole("button");
  198 |   await first.click();
  199 |   const dialog = page.getByTestId("bio-dialog");
  200 |   await expect(dialog).toBeVisible();
  201 |   await expect(dialog.getByRole("heading", { level: 2 })).toBeVisible();
  202 |   await page.keyboard.press("Escape");
  203 |   await expect(dialog).toBeHidden();
  204 |   await expect(first).toBeFocused();
  205 | });
  206 | 
  207 | test("contact: three steps, validated, then an email is prepared (no backend)", async ({ page }) => {
  208 |   await page.goto("/contact");
  209 |   const form = page.getByTestId("contact-form");
  210 |   await form.scrollIntoViewIfNeeded();
  211 |   await expect(form).toHaveAttribute("data-live", "");
  212 |   // step 1: an investor type is required
  213 |   await form.getByRole("button", { name: /^continue/i }).click();
  214 |   await expect(form.getByText("Please choose an investor type.")).toBeVisible();
  215 |   await form.getByText("Family office", { exact: true }).click();
  216 |   await form.getByRole("button", { name: /^continue/i }).click();
  217 |   // step 2: at least one interest
  218 |   await expect(form.getByRole("group", { name: /what are you interested in/i })).toBeVisible();
  219 |   await form.getByRole("button", { name: /^continue/i }).click();
  220 |   await expect(form.getByText("Please choose at least one interest.")).toBeVisible();
  221 |   await form.getByText("Monthly Income", { exact: true }).click();
  222 |   await form.getByRole("button", { name: /^continue/i }).click();
  223 |   // step 3: name and a valid email
  224 |   await form.getByRole("button", { name: /prepare my email/i }).click();
  225 |   await expect(form.getByText("Please enter a valid email address.")).toBeVisible();
  226 |   await page.getByLabel("Full name").fill("Test Person");
  227 |   await page.getByLabel("Email address").fill("test@example.com");
  228 |   await page.getByLabel(/^Message/).fill("Hello, I would like to learn more about your funds.");
  229 |   // the mailto: hand-off opens the mail app (a no-op in the test browser); the ready state must show
  230 |   await form.getByRole("button", { name: /prepare my email/i }).click();
  231 |   const ready = page.getByTestId("contact-ready");
  232 |   await expect(ready).toBeVisible();
  233 |   await expect(ready.getByRole("link")).toHaveAttribute("href", /^mailto:info@nymbus\.ca\?subject=Website%20inquiry%20%C2%B7%20Family%20office/);
  234 |   // office details and a map link (no third-party frame)
  235 |   await expect(page.locator('a[href^="tel:+15149851138"]').first()).toBeVisible();
  236 |   await expect(page.locator('a[href^="https://www.google.com/maps/search/"]').first()).toBeAttached();
  237 |   await expect(page.locator("iframe")).toHaveCount(0);
  238 | });
  239 | 
  240 | test("approach: the pipeline and the risk flow draw themselves in when scrolled into view", async ({ page }) => {
  241 |   await page.goto("/approach");
  242 |   const pipe = page.getByTestId("approach-pipeline");
  243 |   await pipe.scrollIntoViewIfNeeded();
  244 |   await expect(pipe).toHaveAttribute("data-on", "");
  245 |   const flow = page.getByTestId("overlay-flow");
  246 |   await flow.scrollIntoViewIfNeeded();
  247 |   await expect(flow).toHaveAttribute("data-on", "");
  248 |   await page.waitForTimeout(3500);
  249 |   const probe = await page.evaluate(() => {
  250 |     const cs = (sel: string) => { const e = document.querySelector(sel); if (!e) return null; const c = getComputedStyle(e); return { off: c.strokeDashoffset, clip: c.clipPath, op: c.opacity, anim: c.animationName, disp: c.display, w: (e as Element).getBoundingClientRect().width }; };
  251 |     return { wave: cs(".ap-wave"), loop: cs(".ap-loop-line"), conv: cs(".ap-conv path"), arrow: cs(".ap-arrow path"), vol: cs(".ap-vol path") };
  252 |   });
  253 |   console.log("approach probe", JSON.stringify(probe));
  254 |   for (const k of ["wave", "conv", "arrow", "vol"] as const) expect(probe[k]?.off, k).toMatch(/^0(px)?$/);
> 255 |   expect(probe.loop?.clip ?? "none", "loop").toMatch(/^(none|inset\(0(px)?\))$/);
      |                                              ^ Error: loop
  256 | });
  257 | 
  258 | test("legal: table of contents follows both documents; privacy covers Law 25", async ({ page }) => {
  259 |   await page.goto("/legal");
  260 |   await expect(page.getByRole("heading", { level: 2, name: /complaints policy/i })).toBeVisible();
  261 |   await expect(page.getByRole("heading", { level: 2, name: /code of ethics/i })).toBeAttached();
  262 |   await expect(page.getByText("514-985-1138 or 1-833-227-2656").first()).toBeAttached();
  263 |   await expect(page.getByText(/514-931-1138/)).toHaveCount(0);
  264 |   await page.goto("/privacy");
  265 |   await expect(page.getByRole("heading", { level: 2, name: /law 25/i })).toBeAttached();
  266 |   await expect(page.locator('a[href="/legal#complaints"]').first()).toBeAttached();
  267 | });
  268 | 
  269 | test("admin does not get the public chrome", async ({ page, context }) => {
  270 |   await signIn(context);
  271 |   const res = await page.goto("/admin");
  272 |   expect(res?.status()).toBe(200);
  273 |   await expect(page.getByTestId("site-nav")).toHaveCount(0);
  274 |   await expect(page.getByTestId("site-footer")).toHaveCount(0);
  275 | });
  276 | 
```