# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site.spec.ts >> mobile menu opens, traps focus, closes with Escape
- Location: e2e/site.spec.ts:140:5

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
    124 × waiting for element to be visible, enabled and stable
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
      - generic [ref=e19]:
        - navigation "Breadcrumb" [ref=e20]:
          - list [ref=e21]:
            - listitem [ref=e22]:
              - link "Home" [ref=e23] [cursor=pointer]:
                - /url: /
            - listitem [ref=e26]:
              - generic [ref=e27]: Our approach
        - generic [ref=e29]:
          - paragraph [ref=e31]: Our approach
          - heading "At the intersection of technology, data and finance" [level=1] [ref=e33]:
            - generic [aria-hidden] [ref=e34]:
              - generic [ref=e35]: At
              - generic [ref=e36]: the
              - generic [ref=e37]: intersection
              - generic [ref=e38]: of
              - generic [ref=e39]: technology,
              - generic [ref=e40]: data
              - generic [ref=e41]: and
              - generic [ref=e42]: finance
          - generic [ref=e43]: We invest systematically. Every step, from the data we collect to the positions we hold, follows documented rules that are tested before they are used, monitored while they run and refined through ongoing research.
          - generic [ref=e46]:
            - link "Our strategies" [ref=e47] [cursor=pointer]:
              - /url: /strategies
            - link "Meet the team" [ref=e50] [cursor=pointer]:
              - /url: /team
      - region [ref=e51]:
        - generic [ref=e52]:
          - generic [ref=e53]:
            - paragraph [ref=e55]: Investment methodology
            - heading "From raw data to a managed portfolio, in four steps" [level=2] [ref=e57]:
              - generic [aria-hidden] [ref=e58]:
                - generic [ref=e59]: From
                - generic [ref=e60]: raw
                - generic [ref=e61]: data
                - generic [ref=e62]: to
                - generic [ref=e63]: a
                - generic [ref=e64]: managed
                - generic [ref=e65]: portfolio,
                - generic [ref=e66]: in
                - generic [ref=e67]: four
                - generic [ref=e68]: steps
            - generic [ref=e69]: A systematic pipeline turns public market data into portfolios that respect explicit risk budgets. What we learn from monitoring feeds back into research.
          - figure "Monitoring results feed back into research" [ref=e71]:
            - list [ref=e72]:
              - listitem [ref=e73]:
                - generic [ref=e118]: "01"
                - paragraph [ref=e125]: Data and research
                - paragraph [ref=e126]: Prices, credit metrics and macro indicators, cleaned and stored every day.
              - listitem [ref=e127]:
                - generic [ref=e134]: "02"
                - paragraph [ref=e145]: Signal generation
                - paragraph [ref=e146]: Models turn data into investment signals, validated out of sample.
              - listitem [ref=e147]:
                - generic [ref=e157]: "03"
                - paragraph [ref=e164]: Portfolio construction
                - paragraph [ref=e165]: An optimizer sizes positions within risk, liquidity and cost limits.
              - listitem [ref=e166]:
                - generic [ref=e172]: "04"
                - paragraph [ref=e178]: Risk management
                - paragraph [ref=e179]: Exposures are monitored continuously and adjusted to the market regime.
          - list [ref=e187]:
            - listitem [ref=e188]:
              - generic [ref=e194]:
                - paragraph [ref=e195]: "01"
                - heading "Data and research" [level=3] [ref=e196]
                - generic [ref=e198]:
                  - paragraph [ref=e199]: "We process large volumes of public market data: bond prices, fundamental credit metrics, macroeconomic indicators and cross-asset relationships. Statistical analysis and machine learning look for patterns across billions of data points, a volume no team could review by hand, to find opportunities and measure risk more precisely."
                  - list [ref=e200]:
                    - listitem [ref=e201]: Proprietary credit scoring models
                    - listitem [ref=e202]: Macro regime classification
                    - listitem [ref=e203]: Pattern recognition across billions of data points
                    - listitem [ref=e204]: Cross-asset correlation analysis
            - listitem [ref=e205]:
              - generic [ref=e215]:
                - paragraph [ref=e216]: "02"
                - heading "Signal generation" [level=3] [ref=e217]
                - generic [ref=e219]:
                  - paragraph [ref=e220]: Machine learning models turn the data into investment signals. Ensemble methods combine several independent sources so that no single signal dominates, and every signal is validated on data it was not trained on before it is used.
                  - list [ref=e221]:
                    - listitem [ref=e222]: Gradient-boosted tree ensembles
                    - listitem [ref=e223]: Neural network regime classifiers
                    - listitem [ref=e224]: Cross-validation and walk-forward testing
                    - listitem [ref=e225]: Signal decay analysis and refresh cycles
            - listitem [ref=e226]:
              - generic [ref=e232]:
                - paragraph [ref=e233]: "03"
                - heading "Portfolio construction" [level=3] [ref=e234]
                - generic [ref=e236]:
                  - paragraph [ref=e237]: Signals feed a portfolio optimizer that sizes positions within risk budgets, concentration limits, liquidity constraints and transaction-cost models. The result is a portfolio built by the same rules every time, with every position traceable to the signals behind it.
                  - list [ref=e238]:
                    - listitem [ref=e239]: Mean-variance with robust covariance estimation
                    - listitem [ref=e240]: Risk parity and factor-aware allocation
                    - listitem [ref=e241]: Transaction-cost optimization
                    - listitem [ref=e242]: Rebalancing threshold calibration
            - listitem [ref=e243]:
              - generic [ref=e248]:
                - paragraph [ref=e249]: "04"
                - heading "Risk management" [level=3] [ref=e250]
                - generic [ref=e252]:
                  - paragraph [ref=e253]: "A risk engine monitors each portfolio continuously: value at risk, stress tests, concentration and liquidity. Hedging adjusts exposure to the market regime identified by our models, to limit losses in adverse conditions."
                  - list [ref=e254]:
                    - listitem [ref=e255]: Value at risk and stress testing
                    - listitem [ref=e256]: Regime detection (risk-on / risk-off)
                    - listitem [ref=e257]: Duration and credit hedging
                    - listitem [ref=e258]: Tail-risk protection through overlays
      - region [ref=e259]:
        - generic [ref=e260]:
          - generic [ref=e261]:
            - paragraph [ref=e263]: Bond investment process
            - heading "Two systems for every bond portfolio" [level=2] [ref=e265]:
              - generic [aria-hidden] [ref=e266]:
                - generic [ref=e267]: Two
                - generic [ref=e268]: systems
                - generic [ref=e269]: for
                - generic [ref=e270]: every
                - generic [ref=e271]: bond
                - generic [ref=e272]: portfolio
            - generic [ref=e273]: "Our fixed income mandates run on the same framework: a top-down system positions the portfolio across the yield curve and credit sectors, and a bottom-up system selects the individual bonds."
          - generic [ref=e275]:
            - article [ref=e276]:
              - paragraph [ref=e277]: System 1 · macro
              - heading "Portfolio positioning" [level=3] [ref=e278]
              - paragraph [ref=e279]: Systematizes a portfolio manager’s experience
              - generic [ref=e280]:
                - generic [ref=e281]:
                  - term [ref=e282]: Method
                  - definition [ref=e283]: Systematic
                - generic [ref=e284]:
                  - term [ref=e285]: View
                  - definition [ref=e286]: Macro, top-down
                - generic [ref=e287]:
                  - term [ref=e288]: Rebalancing
                  - definition [ref=e289]: Every six months
              - list [ref=e290]:
                - listitem [ref=e291]:
                  - generic [aria-hidden] [ref=e292]: "1"
                  - text: Identify market regimes and trends
                - listitem [ref=e293]:
                  - generic [aria-hidden] [ref=e294]: "2"
                  - text: Build the curve and credit matrix from billions of bond data points
            - article [ref=e295]:
              - paragraph [ref=e296]: System 2 · micro
              - heading "Security selection" [level=3] [ref=e297]
              - paragraph [ref=e298]: Replicates an analyst’s in-depth knowledge
              - generic [ref=e299]:
                - generic [ref=e300]:
                  - term [ref=e301]: Method
                  - definition [ref=e302]: Systematic and discretionary
                - generic [ref=e303]:
                  - term [ref=e304]: View
                  - definition [ref=e305]: Micro, bottom-up
                - generic [ref=e306]:
                  - term [ref=e307]: Rebalancing
                  - definition [ref=e308]: Continuous, on alerts
              - list [ref=e309]:
                - listitem [ref=e310]:
                  - generic [aria-hidden] [ref=e311]: "1"
                  - text: Score and rank the bonds of each cell by yield and risk, continuously
                - listitem [ref=e312]:
                  - generic [aria-hidden] [ref=e313]: "2"
                  - text: Select the final securities
      - region [ref=e314]:
        - generic [ref=e315]:
          - generic [ref=e316]:
            - paragraph [ref=e318]: Protection strategy
            - heading "Why add a protection overlay to a bond portfolio?" [level=2] [ref=e320]:
              - generic [aria-hidden] [ref=e321]:
                - generic [ref=e322]: Why
                - generic [ref=e323]: add
                - generic [ref=e324]: a
                - generic [ref=e325]: protection
                - generic [ref=e326]: overlay
                - generic [ref=e327]: to
                - generic [ref=e328]: a
                - generic [ref=e329]: bond
                - generic [ref=e330]: portfolio?
            - generic [ref=e331]: "Bonds tend to struggle in the same conditions: rising rates, inflation spikes and widening credit spreads. All three come with elevated volatility, the environment in which managed futures strategies have tended to perform."
          - generic [ref=e333]:
            - generic [ref=e334]:
              - paragraph [ref=e335]: Bonds suffer when…
              - list [ref=e336]:
                - listitem [ref=e337]: rates rise
                - listitem [ref=e340]: inflation spikes
                - listitem [ref=e343]: spreads widen
            - generic [ref=e347]:
              - paragraph [ref=e348]: The common thread
              - generic [ref=e349]: Elevated volatility
            - generic [ref=e354]:
              - paragraph [ref=e355]: Our response
              - generic [ref=e356]:
                - heading "A managed futures overlay" [level=3] [ref=e360]
                - paragraph [ref=e361]: Our uncorrelated protection strategy acts as a statistical hedge and has typically buffered bond drawdowns when volatility rises.*
          - generic [ref=e362]:
            - generic [ref=e363]:
              - heading "Capital stays invested" [level=3] [ref=e364]
              - paragraph [ref=e365]: The overlay is added on top of the bond portfolio with futures, which only require a margin deposit of about 5 to 10% of their exposure.**
            - generic [aria-hidden] [ref=e366]:
              - generic [ref=e367]:
                - generic [ref=e368]: Bonds, 100% of capital
                - paragraph [ref=e370]: Bond portfolio
              - generic [ref=e371]:
                - generic [ref=e372]:
                  - generic [ref=e373]: Protection overlay
                  - generic [ref=e374]: Bonds, 100% of capital
                - paragraph [ref=e375]: With the overlay
          - generic [ref=e376]:
            - paragraph [ref=e377]: "* Source: Nymbus Capital Inc. Statements reflect historical observations of the Nymbus bond funds’ underlying strategies for conceptual visualization purposes and should not be construed as an exact representation of past contributions or future expectations."
            - paragraph [ref=e378]: "** Source: Nymbus Capital Inc. For illustrative purposes only. The percentages are approximations of typical allocations and may vary as the model allocation evolves."
      - region [ref=e379]:
        - generic [ref=e380]:
          - generic [ref=e381]:
            - paragraph [ref=e383]: Investment philosophy
            - heading "The principles behind every decision" [level=2] [ref=e385]:
              - generic [aria-hidden] [ref=e386]:
                - generic [ref=e387]: The
                - generic [ref=e388]: principles
                - generic [ref=e389]: behind
                - generic [ref=e390]: every
                - generic [ref=e391]: decision
          - generic [ref=e392]:
            - generic [ref=e393]:
              - heading "Systematic over discretionary" [level=3] [ref=e398]
              - paragraph [ref=e400]: Decisions follow rules that are tested, validated and improved over time, which keeps emotion out of the process.
            - generic [ref=e401]:
              - heading "Risk before return" [level=3] [ref=e407]
              - paragraph [ref=e409]: Every source of return is weighed against the risk it adds. Portfolios are built to risk budgets, not return targets.
            - generic [ref=e410]:
              - heading "Technology first" [level=3] [ref=e416]
              - paragraph [ref=e418]: Purpose-built infrastructure processes data at scale, so research moves quickly and strategies run reliably.
            - generic [ref=e419]:
              - heading "Continuous research" [level=3] [ref=e423]
              - paragraph [ref=e425]: A dedicated quantitative research team keeps testing new data, methods and market structures.
            - generic [ref=e426]:
              - heading "Capital preservation" [level=3] [ref=e430]
              - paragraph [ref=e432]: Downside protection is built into each strategy through systematic risk limits and hedging.
            - generic [ref=e433]:
              - heading "Diversified return sources" [level=3] [ref=e439]
              - paragraph [ref=e441]: Combining strategies that behave differently across market regimes makes a portfolio less dependent on any one of them.
      - region [ref=e442]:
        - generic [ref=e443]:
          - generic [ref=e444]:
            - paragraph [ref=e446]: Research and technology
            - heading "Built like a research lab, run like a trading desk" [level=2] [ref=e448]:
              - generic [aria-hidden] [ref=e449]:
                - generic [ref=e450]: Built
                - generic [ref=e451]: like
                - generic [ref=e452]: a
                - generic [ref=e453]: research
                - generic [ref=e454]: lab,
                - generic [ref=e455]: run
                - generic [ref=e456]: like
                - generic [ref=e457]: a
                - generic [ref=e458]: trading
                - generic [ref=e459]: desk
            - generic [ref=e460]: Our strategies are developed and operated on in-house technology. The same data and code serve research, daily operations and reporting, so what we test is what we run.
          - generic [ref=e462]:
            - generic [ref=e463]:
              - heading "From idea to production" [level=3] [ref=e464]
              - list [ref=e465]:
                - listitem [ref=e466]:
                  - generic [aria-hidden] [ref=e467]: "01"
                  - generic [ref=e468]:
                    - paragraph [ref=e469]: Hypothesis
                    - paragraph [ref=e470]: A documented idea about a market behaviour, with the data needed to test it.
                - listitem [ref=e471]:
                  - generic [aria-hidden] [ref=e472]: "02"
                  - generic [ref=e473]:
                    - paragraph [ref=e474]: Research
                    - paragraph [ref=e475]: Backtests on historical data, including transaction costs.
                - listitem [ref=e476]:
                  - generic [aria-hidden] [ref=e477]: "03"
                  - generic [ref=e478]:
                    - paragraph [ref=e479]: Validation
                    - paragraph [ref=e480]: Out-of-sample and walk-forward tests, then review by the team.
                - listitem [ref=e481]:
                  - generic [aria-hidden] [ref=e482]: "04"
                  - generic [ref=e483]:
                    - paragraph [ref=e484]: Production
                    - paragraph [ref=e485]: Deployed with the same code, monitored daily, retired when its signal decays.
            - generic [ref=e486]:
              - generic [ref=e487]:
                - heading "Data platform" [level=3] [ref=e493]
                - paragraph [ref=e495]: Custodian, market and index data consolidated into one central store every business day.
              - generic [ref=e496]:
                - heading "Machine learning" [level=3] [ref=e506]
                - paragraph [ref=e508]: Regime classification and pattern recognition across the bond universe.
              - generic [ref=e509]:
                - heading "Validation discipline" [level=3] [ref=e513]
                - paragraph [ref=e515]: Cross-validation, walk-forward testing and signal-decay monitoring before and after launch.
              - generic [ref=e516]:
                - heading "Operations and reporting" [level=3] [ref=e520]
                - paragraph [ref=e522]: Trade reporting and fund analytics built on the same data as research.
      - region [ref=e523]:
        - generic [ref=e525]:
          - generic [ref=e526]:
            - generic [ref=e527]:
              - paragraph [ref=e529]: The team
              - heading "Scientists and market veterans" [level=2] [ref=e531]:
                - generic [aria-hidden] [ref=e532]:
                  - generic [ref=e533]: Scientists
                  - generic [ref=e534]: and
                  - generic [ref=e535]: market
                  - generic [ref=e536]: veterans
              - generic [ref=e537]: Physicists, engineers and computer scientists work alongside portfolio managers who have spent their careers in fixed income and derivatives.
            - generic [ref=e539]:
              - generic [ref=e540]:
                - generic [ref=e541]: "18"
                - generic [ref=e542]: people on the team
              - generic [ref=e543]:
                - generic [ref=e544]: "2"
                - generic [ref=e545]: PhDs in physics
              - generic [ref=e546]:
                - generic [ref=e547]: "4"
                - generic [ref=e548]: CFA charterholders
            - link "Meet the team" [ref=e550] [cursor=pointer]:
              - /url: /team
          - list [aria-hidden] [ref=e553]:
            - listitem [ref=e554]
            - listitem [ref=e556]
            - listitem [ref=e558]
            - listitem [ref=e560]
            - listitem [ref=e562]
            - listitem [ref=e564]
            - listitem [ref=e566]
            - listitem [ref=e568]
            - listitem [ref=e570]
      - generic [ref=e574]:
        - heading "See the approach in practice" [level=2] [ref=e575]:
          - generic [aria-hidden] [ref=e576]:
            - generic [ref=e577]: See
            - generic [ref=e578]: the
            - generic [ref=e579]: approach
            - generic [ref=e580]: in
            - generic [ref=e581]: practice
        - paragraph [ref=e583]: Each of our strategies applies this process to a different mandate. Explore them, or talk to our team about yours.
        - generic [ref=e585]:
          - link "View strategies" [ref=e586] [cursor=pointer]:
            - /url: /strategies
          - link "Contact us" [ref=e589] [cursor=pointer]:
            - /url: /contact
  - contentinfo [ref=e590]:
    - generic [ref=e591]:
      - generic [ref=e592]:
        - generic [ref=e593]:
          - link "Nymbus Capital, home" [ref=e594] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e595]
          - paragraph [ref=e604]: Montreal-based quantitative investment manager building systematic fixed income and multi-asset strategies with scientific rigour.
          - generic [ref=e605]:
            - generic [ref=e606]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e607] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e608]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e609] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e610]:
          - heading "Strategies" [level=2] [ref=e611]
          - list [ref=e612]:
            - listitem [ref=e613]:
              - link "Monthly Income" [ref=e614] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e616]:
              - link "Sustainable Enhanced Bonds" [ref=e617] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e619]:
              - link "Multi-Strategy" [ref=e620] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e622]:
              - link "Global Minimum Volatility" [ref=e623] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e625]:
          - heading "Company" [level=2] [ref=e626]
          - list [ref=e627]:
            - listitem [ref=e628]:
              - link "About & team" [ref=e629] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e630]:
              - link "Approach" [ref=e631] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e632]:
              - link "Sustainability" [ref=e633] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e634]:
              - link "Solutions" [ref=e635] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e636]:
          - heading "Resources" [level=2] [ref=e637]
          - list [ref=e638]:
            - listitem [ref=e639]:
              - link "Contact" [ref=e640] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e641]:
              - link "Privacy policy" [ref=e642] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e643]:
              - link "Complaints & code of ethics" [ref=e644] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e645]:
              - link "LinkedIn" [ref=e646] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e650]:
        - paragraph [ref=e651]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
        - paragraph [ref=e652]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
        - paragraph [ref=e653]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the class shown; periods of less than one year are not annualized.
        - paragraph [ref=e654]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
        - paragraph [ref=e655]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund's returns may have differed had it existed during that period.
        - paragraph [ref=e656]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account.
        - paragraph [ref=e657]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
      - generic [ref=e658]:
        - generic [ref=e659]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e660]: PRI signatory
  - alert [ref=e661]
```

# Test source

```ts
  45  |   await page.waitForTimeout(1200);
  46  |   await page.evaluate(() => window.scrollTo(0, 0));
  47  |   await page.waitForTimeout(300);
  48  | }
  49  | 
  50  | /** Jump every finite animation (CSS and Web Animations) to its end state, so full-page captures are at rest. */
  51  | async function settle(page: Page) {
  52  |   await page.evaluate(() => {
  53  |     for (const a of document.getAnimations()) {
  54  |       try {
  55  |         const end = a.effect?.getComputedTiming().endTime;
  56  |         if (typeof end === "number" && Number.isFinite(end)) a.finish();
  57  |       } catch { /* infinite or detached: leave it */ }
  58  |     }
  59  |   });
  60  |   await page.waitForTimeout(150);
  61  | }
  62  | 
  63  | for (const r of ROUTES) {
  64  |   for (const locale of ["en", "fr"] as const) {
  65  |     test(`${r.path} renders its heading (${locale})`, async ({ page, baseURL }) => {
  66  |       await page.context().addCookies([{ name: "nymbus-locale", value: locale, url: baseURL! }]);
  67  |       const errors = collectErrors(page);
  68  |       const res = await page.goto(r.path);
  69  |       expect(res?.status()).toBe(200);
  70  |       await expect(page.locator("html")).toHaveAttribute("lang", locale);
  71  |       const h1 = page.getByRole("heading", { level: 1 }).first();
  72  |       await expect(h1).toHaveAccessibleName(locale === "en" ? r.en : r.fr);
  73  |       await expect(page.getByTestId("site-nav")).toBeVisible();
  74  |       await expect(page.getByTestId("site-footer")).toBeAttached();
  75  |       expect(errors, errors.join("\n")).toEqual([]);
  76  |     });
  77  |   }
  78  | 
  79  |   test(`${r.path} full-page screenshot`, async ({ page, baseURL }, info) => {
  80  |     await page.context().addCookies([{ name: "nymbus-locale", value: "en", url: baseURL! }]);
  81  |     await page.goto(r.path);
  82  |     await scrollThrough(page);
  83  |     await settle(page);
  84  |     await page.screenshot({ path: `${SHOTS}/site-${r.name}-${info.project.name}.png`, fullPage: true });
  85  |   });
  86  | }
  87  | 
  88  | test("unknown route: 404 page in the site chrome", async ({ page }, info) => {
  89  |   const res = await page.goto("/this-page-does-not-exist");
  90  |   expect(res?.status()).toBe(404);
  91  |   await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(/this page has matured/i);
  92  |   await expect(page.getByRole("link", { name: /back to home/i })).toBeVisible();
  93  |   await expect(page.getByRole("link", { name: /our strategies/i })).toHaveAttribute("href", "/strategies");
  94  |   await expect(page.getByTestId("site-nav")).toBeVisible();
  95  |   await page.waitForTimeout(3200);
  96  |   await page.screenshot({ path: `${SHOTS}/site-404-${info.project.name}.png`, fullPage: true });
  97  | });
  98  | 
  99  | test("odometer: the figure's accessible name is the final value", async ({ page }) => {
  100 |   await page.goto("/");
  101 |   const odo = page.locator('[data-testid^="strategy-"] .odo').first();
  102 |   if (!(await odo.count())) test.skip(true, "no published figures in this environment");
  103 |   await odo.scrollIntoViewIfNeeded();
  104 |   await expect(odo.locator(".sr-only")).toHaveText(/^[+−]?\d+\.\d%$/);
  105 | });
  106 | 
  107 | test("home: live figures come from the data, never invented", async ({ page }) => {
  108 |   await page.goto("/");
  109 |   const cards = page.locator('[data-testid^="strategy-"]');
  110 |   await cards.first().scrollIntoViewIfNeeded();
  111 |   await expect(cards).toHaveCount(4);
  112 |   // each card shows either a published figure or the "figures coming soon" state
  113 |   for (let i = 0; i < 4; i++) {
  114 |     const card = cards.nth(i);
  115 |     await card.scrollIntoViewIfNeeded();
  116 |     const hasFig = await card.locator(".fig").count();
  117 |     const soon = await card.getByTestId("figures-soon").count();
  118 |     expect(hasFig + soon).toBe(1);
  119 |   }
  120 |   // the NAV ribbon only exists when NAVs are published
  121 |   const ribbon = page.getByTestId("nav-ribbon");
  122 |   if (await ribbon.count()) await expect(ribbon).toContainText(/nav as of/);
  123 | });
  124 | 
  125 | test("language toggle switches the page to French and back", async ({ page, isMobile }) => {
  126 |   await page.goto("/");
  127 |   await expect(page.getByRole("heading", { level: 1 }).first()).toHaveAccessibleName(/scientific investing/);
  128 |   if (isMobile) await page.getByTestId("menu-toggle").click();
  129 |   const toggle = isMobile ? page.getByTestId("mobile-menu").getByTestId("lang-toggle") : page.getByTestId("site-nav").getByTestId("lang-toggle");
  130 |   await toggle.click();
  131 |   await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  132 |   if (isMobile) await page.keyboard.press("Escape");
  133 |   await expect(page.getByRole("heading", { level: 1 }).first()).toHaveAccessibleName(/investissement scientifique/);
  134 |   const cookies = await page.context().cookies();
  135 |   expect(cookies.find((c) => c.name === "nymbus-locale")?.value).toBe("fr");
  136 |   await page.reload();
  137 |   await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  138 | });
  139 | 
  140 | test("mobile menu opens, traps focus, closes with Escape", async ({ page, isMobile }) => {
  141 |   test.skip(!isMobile, "the burger menu is the small-screen navigation");
  142 |   await page.goto("/approach");
  143 |   const toggle = page.getByTestId("menu-toggle");
  144 |   await expect(toggle).toHaveAttribute("aria-expanded", "false");
> 145 |   await toggle.click();
      |                ^ Error: locator.click: Test timeout of 60000ms exceeded.
  146 |   const menu = page.getByTestId("mobile-menu");
  147 |   await expect(menu).toBeVisible();
  148 |   await expect(toggle).toHaveAttribute("aria-expanded", "true");
  149 |   await expect(menu.getByRole("link", { name: /^about$/i })).toBeVisible();
  150 |   // focus starts inside the menu and stays there
  151 |   expect(await page.evaluate(() => !!document.activeElement?.closest("#site-menu"))).toBe(true);
  152 |   for (let i = 0; i < 20; i++) await page.keyboard.press("Tab");
  153 |   expect(await page.evaluate(() => !!document.activeElement?.closest("#site-menu"))).toBe(true);
  154 |   await page.keyboard.press("Escape");
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
  240 | test("legal: table of contents follows both documents; privacy covers Law 25", async ({ page }) => {
  241 |   await page.goto("/legal");
  242 |   await expect(page.getByRole("heading", { level: 2, name: /complaints policy/i })).toBeVisible();
  243 |   await expect(page.getByRole("heading", { level: 2, name: /code of ethics/i })).toBeAttached();
  244 |   await expect(page.getByText("514-985-1138 or 1-833-227-2656").first()).toBeAttached();
  245 |   await expect(page.getByText(/514-931-1138/)).toHaveCount(0);
```