# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site.spec.ts >> mobile menu opens, traps focus, closes with Escape
- Location: e2e/site.spec.ts:125:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('mobile-menu').getByRole('link', { name: 'team' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('mobile-menu').getByRole('link', { name: 'team' }) with timeout 10000ms
  - waiting for getByTestId('mobile-menu').getByRole('link', { name: 'team' })

```

```yaml
- link "Skip to content":
  - /url: "#main"
- banner:
  - link "Nymbus Capital, home":
    - /url: /
    - img "nymbus"
  - navigation "Primary"
  - button "Close menu" [expanded]
- dialog "Menu":
  - link "Nymbus Capital, home":
    - /url: /
    - img "nymbus"
  - button "Close menu"
  - list:
    - listitem:
      - link "Home":
        - /url: /
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
  - link "info@nymbus.ca":
    - /url: mailto:info@nymbus.ca
  - link "LinkedIn":
    - /url: https://www.linkedin.com/company/nymbus-capital/
  - button "Afficher le site en français"
- main:
  - paragraph: Montreal · systematic fixed income and alternative strategies
  - heading "Scientific investing" [level=1]
  - paragraph: Nymbus Capital is a Montreal investment manager that builds fixed income and alternative strategies with quantitative research, systematic portfolio construction and continuous risk management.
  - link "Explore strategies":
    - /url: /strategies
  - link "Investment solutions":
    - /url: /solutions
  - paragraph: Daily NAVs as of Sep 28, 2026 Sample data
  - list:
    - listitem:
      - link "Monthly Income Series FP $10.19":
        - /url: /strategies/monthly-income
    - listitem:
      - link "Sustainable Enhanced Bonds Series F $9.58":
        - /url: /strategies/sustainable-enhanced-bonds
    - listitem:
      - link "Multi-Strategy Series F $13.03":
        - /url: /strategies/multi-strategy
  - paragraph: NAV · net asset value per unit
  - region "Nymbus at a glance":
    - heading "Nymbus at a glance" [level=2]
    - paragraph: Investment manager headquartered in Montreal.
    - text: $1.8B+ Assets under management, including mandates 4 Investment strategies 18 People on our team and board
  - region "At the intersection of technology, data and finance":
    - paragraph: Our approach
    - heading "At the intersection of technology, data and finance" [level=2]
    - text: "We apply the scientific method to investing: form a hypothesis, test it on data, and keep only what holds up out of sample. Our team combines decades of institutional experience with research in machine learning, signal processing and portfolio optimization."
    - link "Read about our approach":
      - /url: /approach
    - link "Meet the team":
      - /url: /team
    - heading "Quantitative research" [level=3]
    - paragraph: Market dynamics, credit fundamentals and risk factors studied with proprietary models and machine learning, security by security.
    - heading "Systematic construction" [level=3]
    - paragraph: Portfolios built by explicit rules and optimization models, with disciplined allocation and rebalancing instead of discretionary calls.
    - heading "Dynamic risk management" [level=3]
    - paragraph: Continuous monitoring, market-regime classification and protection strategies designed to soften drawdowns.
  - region "Our funds and strategies":
    - paragraph: Strategies
    - heading "Our funds and strategies" [level=2]
    - text: "Four strategies built by the same research process: two bond funds, a multi-strategy fund and a protection overlay for managed accounts."
    - link "Short-term fixed income Sample data Fund · FundServ Monthly Income Steady monthly income with a short duration +2.3% Since inception, annualized · Net of fees 1 year +1.0% NAV · Series FP $10.19 as of Sep 28, 2026 Returns as of August 2026 · Net of fees View the strategy":
      - /url: /strategies/monthly-income
      - text: Short-term fixed income Sample data Fund · FundServ
      - heading "Monthly Income" [level=3]
      - text: Steady monthly income with a short duration +2.3% Since inception, annualized · Net of fees 1 year +1.0% NAV · Series FP $10.19 as of Sep 28, 2026 Returns as of August 2026 · Net of fees View the strategy
    - link "Core fixed income Sample data Fund · FundServ Sustainable Enhanced Bonds The Canadian bond universe, scientifically enhanced +2.3% Since inception, annualized · Net of fees 1 year −4.0% NAV · Series F $9.58 as of Sep 28, 2026 Returns as of August 2026 · Net of fees View the strategy":
      - /url: /strategies/sustainable-enhanced-bonds
      - text: Core fixed income Sample data Fund · FundServ
      - heading "Sustainable Enhanced Bonds" [level=3]
      - text: The Canadian bond universe, scientifically enhanced +2.3% Since inception, annualized · Net of fees 1 year −4.0% NAV · Series F $9.58 as of Sep 28, 2026 Returns as of August 2026 · Net of fees View the strategy
    - link "Alternative strategies Sample data Fund · FundServ Multi-Strategy Four uncorrelated systematic strategies +7.6% Since inception, annualized · Net of fees 1 year +9.4% NAV · Series F $13.03 as of Sep 28, 2026 Returns as of August 2026 · Net of fees View the strategy":
      - /url: /strategies/multi-strategy
      - text: Alternative strategies Sample data Fund · FundServ
      - heading "Multi-Strategy" [level=3]
      - text: Four uncorrelated systematic strategies +7.6% Since inception, annualized · Net of fees 1 year +9.4% NAV · Series F $13.03 as of Sep 28, 2026 Returns as of August 2026 · Net of fees View the strategy
    - link "Protection overlay (managed accounts) Sample data Managed accounts Global Minimum Volatility An uncorrelated buffer against bond drawdowns +8.2% Since inception, annualized · Gross of fees 1 year +6.1% Returns as of August 2026 · Gross of fees View the strategy":
      - /url: /strategies/global-minimum-volatility
      - text: Protection overlay (managed accounts) Sample data Managed accounts
      - heading "Global Minimum Volatility" [level=3]
      - text: An uncorrelated buffer against bond drawdowns +8.2% Since inception, annualized · Gross of fees 1 year +6.1% Returns as of August 2026 · Gross of fees View the strategy
    - paragraph: Net of fees, in CAD. Past performance may not be repeated. See the important information below. Global Minimum Volatility returns are gross of fees (managed accounts, not a fund).
    - link "View all strategies":
      - /url: /strategies
  - region "One pipeline, from data to portfolio":
    - paragraph: Investment process
    - heading "One pipeline, from data to portfolio" [level=2]
    - text: The same four steps run behind every strategy, and each one is documented, tested and monitored.
    - list:
      - listitem:
        - paragraph: "01"
        - heading "Data and research" [level=3]
        - text: Market, security and fundamental data gathered, cleaned and studied to identify persistent drivers of return.
      - listitem:
        - paragraph: "02"
        - heading "Signal generation" [level=3]
        - text: Machine-learning models turn that research into signals, which are kept only after rigorous statistical validation.
      - listitem:
        - paragraph: "03"
        - heading "Portfolio construction" [level=3]
        - text: Optimization combines the signals into a portfolio under explicit constraints on risk, liquidity and sustainability criteria.
      - listitem:
        - paragraph: "04"
        - heading "Risk management" [level=3]
        - text: Positions and exposures are monitored continuously, with regime-based adjustments and hedging when conditions change.
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
    - heading "Institutional clients and programs" [level=3]
    - list:
      - listitem: Fondaction
      - listitem: Fonds FMOQ
      - listitem: QEMP (Innocap)
      - listitem: Caisse de retraite et d’épargne du Groupe Securitas
      - listitem: GardaWorld
      - listitem: Bâtirente
    - heading "Our funds are available through" [level=3]
    - list:
      - listitem: National Bank Financial Wealth Management
      - listitem: RBC Dominion Securities
      - listitem: iA Financial Group
    - paragraph: "Source: Nymbus Capital Inc. Representative list; not all clients are shown. QEMP: Quebec Emerging Managers Program (Innocap). Inclusion does not imply endorsement."
  - region "Recent developments":
    - paragraph: News and milestones
    - heading "Recent developments" [level=2]
    - article:
      - paragraph:
        - text: Partnership
        - time: Jan 28, 2025
      - heading "Mageska Capital and Nymbus Capital announce a partnership" [level=3]
      - paragraph: Mageska entrusts Nymbus with a portion of the Mageska Fund to implement a portable alpha strategy.
      - 'button "Read more : Mageska Capital and Nymbus Capital announce a partnership"'
    - article:
      - paragraph:
        - text: ESG
        - time: Apr 23, 2024
      - heading "Nymbus becomes a signatory of the Tobacco-Free Finance Pledge" [level=3]
      - paragraph: Nymbus commits to excluding tobacco companies from all of its portfolios.
      - 'button "Read more : Nymbus becomes a signatory of the Tobacco-Free Finance Pledge"'
    - article:
      - paragraph:
        - text: Recognition
        - time: Nov 16, 2023
      - heading "Nymbus fixed income strategies ranked in the RBC fund study" [level=3]
      - paragraph: All three fixed income strategies managed by Nymbus ranked in the top percentiles of the RBC fund study.
      - 'button "Read more : Nymbus fixed income strategies ranked in the RBC fund study"'
    - article:
      - paragraph:
        - text: Community
        - time: Oct 3, 2023
      - heading "Nymbus partners with Dans la rue" [level=3]
      - paragraph: A partnership with the Montreal organization that supports homeless and at-risk youth.
      - 'button "Read more : Nymbus partners with Dans la rue"'
  - heading "Let’s discuss your investment objectives" [level=2]
  - paragraph: Our team can walk you through the strategies, their track records and how they could fit your portfolio or mandate.
  - link "Get in touch":
    - /url: /contact
  - link "View solutions":
    - /url: /solutions
- contentinfo:
  - link "Nymbus Capital, home":
    - /url: /
    - img "nymbus"
  - paragraph: Montreal-based quantitative investment manager building systematic fixed income and multi-asset strategies with scientific rigour.
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
  - paragraph: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the class shown; periods of less than one year are not annualized.
  - paragraph: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
  - paragraph: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund's returns may have differed had it existed during that period.
  - paragraph: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account.
  - paragraph: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
  - text: © 2026 Nymbus Capital Inc. All rights reserved. PRI signatory
- alert
```

# Test source

```ts
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
  130 |   await toggle.click();
  131 |   const menu = page.getByTestId("mobile-menu");
  132 |   await expect(menu).toBeVisible();
  133 |   await expect(toggle).toHaveAttribute("aria-expanded", "true");
> 134 |   await expect(menu.getByRole("link", { name: "team" })).toBeVisible();
      |                                                          ^ Error: expect(locator).toBeVisible() failed
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