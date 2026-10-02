# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> home tiles and the strategies index name the class of the returns (EN + FR)
- Location: e2e/fund.spec.ts:488:5

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: getByTestId('strategy-monthly-income').getByTestId('perf-class')
Expected pattern: /^Returns: Series FP$/
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" getByTestId('strategy-monthly-income').getByTestId('perf-class') with timeout 10000ms
  - waiting for getByTestId('strategy-monthly-income').getByTestId('perf-class')

```

```yaml
- link "Skip to content":
  - /url: "#main"
- banner:
  - link "Nymbus Capital, home":
    - /url: /
    - img "nymbus"
  - navigation "Primary"
  - button "Afficher le site en français"
  - button "Open menu"
- main:
  - paragraph: Montreal · systematic fixed income and alternatives
  - heading "Scientific investing" [level=1]
  - paragraph: Scientists and engineers solving the harder problems in finance.
  - link "Explore strategies":
    - /url: /strategies
  - link "Investment solutions":
    - /url: /solutions
  - region "Nymbus at a glance":
    - heading "Nymbus at a glance" [level=2]
    - text: $1.9B Assets under management, including mandates 4 Strategies 18 People, team and board 2 PhDs on the team
  - region "Scientists and engineers, hard problems in finance":
    - paragraph: Science at scale
    - heading "Scientists and engineers, hard problems in finance" [level=2]
    - text: Data at scale. Models tested before they are trusted.
    - 'figure "Generic labels and generated values: not actual securities, signals or results. The counters count what this animation scans."':
      - 'img "Animated illustration: a table of securities scanned for factor scores, with flagged signals."'
      - text: "Generic labels and generated values: not actual securities, signals or results. The counters count what this animation scans."
    - heading "Scientists" [level=3]
    - paragraph: Hypotheses, tested on data.
    - heading "Engineers" [level=3]
    - paragraph: Pipelines that run every day.
    - heading "Together" [level=3]
    - paragraph: The harder problems in fixed income.
  - region "Our funds and strategies":
    - paragraph: Strategies
    - heading "Our funds and strategies" [level=2]
    - text: Two bond funds, a multi-strategy fund, a futures overlay.
    - link "Short-term fixed income Fund · FundServ Monthly Income Monthly income from short-term corporate bonds Figures coming soon View the strategy":
      - /url: /strategies/monthly-income
      - text: Short-term fixed income Fund · FundServ
      - heading "Monthly Income" [level=3]
      - text: Monthly income from short-term corporate bonds Figures coming soon View the strategy
    - 'link "Core fixed income Sample data Fund · FundServ Sustainable Enhanced Bonds Canadian core bonds, managed systematically +3.8% Since inception, annualized · Net of fees 1 year −2.6% Returns as of August 2026 · Net of fees · Returns: Series F View the strategy"':
      - /url: /strategies/sustainable-enhanced-bonds
      - text: Core fixed income Sample data Fund · FundServ
      - heading "Sustainable Enhanced Bonds" [level=3]
      - text: "Canadian core bonds, managed systematically +3.8% Since inception, annualized · Net of fees 1 year −2.6% Returns as of August 2026 · Net of fees · Returns: Series F View the strategy"
    - 'link "Alternative strategies Sample data Fund · FundServ Multi-Strategy Four systematic strategies designed to have low correlation with one another +7.6% Since inception, annualized · Net of fees 1 year +9.4% Returns as of August 2026 · Net of fees · Returns: Series F View the strategy"':
      - /url: /strategies/multi-strategy
      - text: Alternative strategies Sample data Fund · FundServ
      - heading "Multi-Strategy" [level=3]
      - text: "Four systematic strategies designed to have low correlation with one another +7.6% Since inception, annualized · Net of fees 1 year +9.4% Returns as of August 2026 · Net of fees · Returns: Series F View the strategy"
    - link "Futures overlay (managed accounts) Sample data Managed accounts Global Minimum Volatility A futures overlay designed to have low correlation with bonds +8.2% Since inception, annualized · Gross of fees 1 year +6.1% Returns as of August 2026 · Gross of fees View the strategy":
      - /url: /strategies/global-minimum-volatility
      - text: Futures overlay (managed accounts) Sample data Managed accounts
      - heading "Global Minimum Volatility" [level=3]
      - text: A futures overlay designed to have low correlation with bonds +8.2% Since inception, annualized · Gross of fees 1 year +6.1% Returns as of August 2026 · Gross of fees View the strategy
    - paragraph: Net of fees, in CAD. Past performance may not be repeated. See the important information below. Global Minimum Volatility returns are gross of fees (managed accounts, not a fund).
    - link "View all strategies":
      - /url: /strategies
  - region "One pipeline, from data to portfolio":
    - paragraph: Investment process
    - heading "One pipeline, from data to portfolio" [level=2]
    - text: Four documented, tested and monitored steps.
    - list:
      - listitem:
        - paragraph: "01"
        - heading "Data and research" [level=3]
        - text: Market and fundamental data, cleaned and studied.
      - listitem:
        - paragraph: "02"
        - heading "Signal generation" [level=3]
        - text: Machine-learning signals, kept only after statistical validation.
      - listitem:
        - paragraph: "03"
        - heading "Portfolio construction" [level=3]
        - text: Optimization within risk, liquidity and sustainability limits.
      - listitem:
        - paragraph: "04"
        - heading "Risk management" [level=3]
        - text: Continuous monitoring, adjustments and hedging. Risk management does not eliminate the risk of loss.
    - link "Our approach":
      - /url: /approach
    - link "Meet the team":
      - /url: /team
  - region "Institutions and partners we work with":
    - paragraph: Clients and platforms
    - heading "Institutions and partners we work with" [level=2]
    - region "Logos of institutions and platforms we work with":
      - list:
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
    - paragraph: "Source: Nymbus Capital Inc. Representative list; not all clients are shown. QEMP: Quebec Emerging Managers Program (Innocap). Inclusion does not imply endorsement."
  - region "Recent developments":
    - paragraph: News and milestones
    - heading "Recent developments" [level=2]
    - article:
      - paragraph:
        - text: Partnership
        - time: Jan 28, 2025
      - heading "Mageska Capital and Nymbus Capital announce a partnership" [level=3]
      - 'button "Read more : Mageska Capital and Nymbus Capital announce a partnership"'
    - article:
      - paragraph:
        - text: ESG
        - time: Apr 23, 2024
      - heading "Nymbus becomes a signatory of the Tobacco-Free Finance Pledge" [level=3]
      - 'button "Read more : Nymbus becomes a signatory of the Tobacco-Free Finance Pledge"'
    - article:
      - paragraph:
        - text: Community
        - time: Oct 3, 2023
      - heading "Nymbus partners with Dans la rue" [level=3]
      - 'button "Read more : Nymbus partners with Dans la rue"'
    - paragraph:
      - link "All news":
        - /url: /news
  - heading "Let’s discuss your investment objectives" [level=2]
  - paragraph: Talk to our team about your mandate.
  - link "Get in touch":
    - /url: /contact
  - link "View solutions":
    - /url: /solutions
- contentinfo:
  - link "Nymbus Capital, home":
    - /url: /
    - img "nymbus"
  - paragraph: Montreal portfolio manager building systematic fixed income and alternative strategies.
  - text: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
  - link "514-985-1138":
    - /url: tel:+15149851138
  - text: 1-833-227-2656 (toll-free)
  - link "info@nymbus.ca":
    - /url: mailto:info@nymbus.ca
  - heading "Strategies" [level=2]
  - list:
    - listitem:
      - link "Monthly Income":
        - /url: /strategies/monthly-income
    - listitem:
      - link "Sustainable Enhanced Bonds":
        - /url: /strategies/sustainable-enhanced-bonds
    - listitem:
      - link "Multi-Strategy":
        - /url: /strategies/multi-strategy
    - listitem:
      - link "Global Minimum Volatility":
        - /url: /strategies/global-minimum-volatility
  - heading "Company" [level=2]
  - list:
    - listitem:
      - link "About & team":
        - /url: /team
    - listitem:
      - link "Approach":
        - /url: /approach
    - listitem:
      - link "Sustainability":
        - /url: /sustainability
    - listitem:
      - link "Solutions":
        - /url: /solutions
  - heading "Resources" [level=2]
  - list:
    - listitem:
      - link "Contact":
        - /url: /contact
    - listitem:
      - link "Privacy policy":
        - /url: /privacy
    - listitem:
      - link "Complaints & code of ethics":
        - /url: /legal
    - listitem:
      - link "LinkedIn":
        - /url: https://www.linkedin.com/company/nymbus-capital/
  - paragraph: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
  - paragraph: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
  - paragraph: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
  - paragraph: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
  - paragraph: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
  - paragraph: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative.
  - paragraph: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
  - text: © 2026 Nymbus Capital Inc. All rights reserved. PRI signatory
- alert
```

# Test source

```ts
  399 |   // the CIFSC category line of the facts comes from the ranking category
  400 |   await openTab(page, "overview");
  401 |   await expect(page.getByTestId("fund-facts")).toContainText("Canadian Fixed Income");
  402 |   // multi-strategy: a quartile 4 is shown as it is
  403 |   await page.goto("/strategies/multi-strategy#awards");
  404 |   await expect(page.getByTestId("rank-1M")).toContainText("127 of 144");
  405 |   await expect(page.getByTestId("rank-1M").locator(".aw-q")).toHaveText("Q4");
  406 |   // GMV: no ranking, no tab
  407 |   await page.goto("/strategies/global-minimum-volatility");
  408 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="awards"]')).toHaveCount(0);
  409 | });
  410 | 
  411 | test("calendar-year chart: a value label on every bar, none overlapping, no horizontal page scroll", async ({ page }) => {
  412 |   await page.goto("/strategies/global-minimum-volatility#performance");
  413 |   const chart = page.getByTestId("calendar");
  414 |   await chart.scrollIntoViewIfNeeded();
  415 |   const cats = chart.locator("svg .cat");
  416 |   await expect(cats.first()).toBeVisible();
  417 |   const n = await cats.count();
  418 |   expect(n).toBeGreaterThan(8);
  419 |   const labels = chart.locator("svg text.vl");
  420 |   await expect(labels).toHaveCount(n);
  421 |   // each label sits above its bar (below a negative one) and the labels do not overlap each other
  422 |   const boxes = await labels.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, text: e.textContent }; }));
  423 |   for (const b of boxes) expect(b.text).toMatch(/^[+−-]?\d+\.\d%$/);
  424 |   const sorted = [...boxes].sort((a, b) => a.l - b.l);
  425 |   for (let i = 1; i < sorted.length; i++) expect(sorted[i].l, `labels ${sorted[i - 1].text} / ${sorted[i].text}`).toBeGreaterThanOrEqual(sorted[i - 1].r - 0.5);
  426 |   // the bars of the chart stay inside the card (it scrolls sideways when narrow), the page never does
  427 |   const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  428 |   expect(overflow).toBeLessThanOrEqual(1);
  429 |   // accessible: every category keeps its text alternative with the value
  430 |   await expect(cats.first()).toHaveAttribute("aria-label", /\d/);
  431 |   // roving tabindex: a single category in the tab order
  432 |   await expect(chart.locator('svg .cat[tabindex="0"]')).toHaveCount(1);
  433 | });
  434 | 
  435 | /**
  436 |  * Performance class label (Gabriel 2026-10-01: the label must match the class of the data). The expected label is
  437 |  * read from the class code of the sample's own data (`performance.classCode`), never assumed: the sample is built as
  438 |  * if the dataplatform served SEB class F (PR #626); the class H rendering (what production shows before that) is
  439 |  * covered by the admin test that pins SEB to a class H run (admin.spec.ts). The NAV card keeps the register's own
  440 |  * series (LDM201 = F), independent of the returns' class.
  441 |  */
  442 | const SAMPLE = JSON.parse(readFileSync("src/lib/data/sample-site-data.json", "utf8")) as { funds: Record<string, { performance: { classCode?: string; returnClass?: string } | null }> };
  443 | const CLASS_OF: Record<string, Record<string, string>> = {
  444 |   "monthly-income": { STRATEGY: "FP" },
  445 |   "sustainable-enhanced-bonds": { STRATEGY: "F", STRATEGY_H: "H" },
  446 |   "multi-strategy": { STRATEGY: "F" },
  447 | };
  448 | const codeOf = (slug: string): string => CLASS_OF[slug][SAMPLE.funds[slug].performance!.classCode!];
  449 | /** "Series F" but not "Series FP" (and the other way round) */
  450 | const seriesRe = (word: string, code: string): RegExp => new RegExp(`${word} ${code}(?![A-Za-z])`);
  451 | 
  452 | for (const slug of Object.keys(CLASS_OF)) {
  453 |   test(`performance class label follows the data's class everywhere (EN + FR): ${slug}`, async ({ page }) => {
  454 |     const perf = SAMPLE.funds[slug].performance!;
  455 |     const code = codeOf(slug);
  456 |     expect(code, `class ${perf.classCode} has a label`).toBeTruthy();
  457 |     expect(perf.returnClass).toBe(code);
  458 |     const others = Object.values(CLASS_OF[slug]).filter((c) => c !== code);
  459 |     for (const [lang, word, fund] of [["en", "Series", "Fund"], ["fr", "Série", "Fonds"]] as const) {
  460 |       await page.goto(`/strategies/${slug}`);
  461 |       if (lang === "fr") {
  462 |         await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  463 |         await page.reload();
  464 |       }
  465 |       // Monthly Income opens on class F (LDM081), which has no series yet: its returns are the FP class (LDM001)
  466 |       if (slug === "monthly-income") await page.getByTestId("nav-card").getByTestId("series-LDM001").click();
  467 |       const exact = seriesRe(word, code);
  468 |       // header return badges, overview returns, disclosures: this class, never another class of the fund
  469 |       for (const tid of ["basis", "overview-returns", "perf-class"]) {
  470 |         await expect(page.getByTestId(tid)).toContainText(exact);
  471 |         for (const o of others) await expect(page.getByTestId(tid)).not.toContainText(seriesRe(word, o));
  472 |       }
  473 |       // performance tab context line and growth chart legend
  474 |       await openTab(page, "performance");
  475 |       await expect(page.getByTestId("perf-context")).toContainText(exact);
  476 |       for (const o of others) await expect(page.getByTestId("perf-context")).not.toContainText(seriesRe(word, o));
  477 |       await page.getByTestId("growth").scrollIntoViewIfNeeded();
  478 |       await expect(page.getByTestId("growth").locator(".fx-legend").first()).toContainText(`${fund} (${word} ${code})`);
  479 |       if (slug === "sustainable-enhanced-bonds") {
  480 |         // the NAV card is the register's class LDM201 (F) whatever the class of the returns
  481 |         await openTab(page, "overview");
  482 |         await expect(page.getByTestId("nav-fundserv")).toHaveText("LDM201");
  483 |       }
  484 |     }
  485 |   });
  486 | }
  487 | 
  488 | test("home tiles and the strategies index name the class of the returns (EN + FR)", async ({ page }) => {
  489 |   // the French label has a no-break space before « : » (matched as \s)
  490 |   for (const [lang, returns] of [["en", "Returns: Series"], ["fr", "Rendements\\s:\\sSérie"]] as const) {
  491 |     const label = (code: string): RegExp => new RegExp(`^${returns} ${code}$`);
  492 |     for (const p of ["/", "/strategies"]) {
  493 |       await page.goto(p);
  494 |       if (lang === "fr") {
  495 |         await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  496 |         await page.reload();
  497 |       }
  498 |       for (const slug of Object.keys(CLASS_OF)) {
> 499 |         await expect(page.getByTestId(`strategy-${slug}`).getByTestId("perf-class")).toHaveText(label(codeOf(slug)));
      |                                                                                      ^ Error: expect(locator).toHaveText(expected) failed
  500 |       }
  501 |       // a strategy without classes (GMV) shows none
  502 |       await expect(page.getByTestId("strategy-global-minimum-volatility").getByTestId("perf-class")).toHaveCount(0);
  503 |     }
  504 |     // the comparison table: every fund with a class, in registry order
  505 |     const cells = page.getByTestId("compare-table").getByTestId("perf-class");
  506 |     await expect(cells).toHaveCount(3);
  507 |     for (const [i, slug] of Object.keys(CLASS_OF).entries()) await expect(cells.nth(i)).toHaveText(label(codeOf(slug)));
  508 |   }
  509 | });
  510 | 
```