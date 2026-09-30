# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> without JavaScript every panel is on the page
- Location: e2e/fund.spec.ts:147:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('[role="tabpanel"][data-panel="performance"]')
Expected: visible
Received: hidden
Timeout:  10000ms

Call log:
  - Expect "toBeVisible" locator('[role="tabpanel"][data-panel="performance"]') with timeout 10000ms
  - waiting for locator('[role="tabpanel"][data-panel="performance"]')
    23 × locator resolved to <div hidden="" tabindex="-1" role="tabpanel" class="ft-panel" data-panel="performance" id="_R_8lubsnqbtb_-panel-performance" aria-labelledby="_R_8lubsnqbtb_-tab-performance">…</div>
       - unexpected value "hidden"

```

```yaml
- link "Skip to content":
  - /url: "#main"
- banner:
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
  - button "Afficher le site en français"
- main:
  - navigation "Breadcrumb":
    - list:
      - listitem:
        - link "Home":
          - /url: /
      - listitem:
        - link "Strategies":
          - /url: /strategies
      - listitem: Monthly Income
  - paragraph: Short-term fixed income
  - heading "Nymbus Monthly Income Fund" [level=1]
  - paragraph: Steady monthly income with a short duration
  - paragraph: Short-term Canadian corporate bonds selected by our two-system process, with an uncorrelated protection overlay designed to soften bond drawdowns.
  - text: Mutual fund Risk Low to medium Sample data
  - link "Contact us":
    - /url: /contact
  - link "Fund documents":
    - /url: "#documents"
  - text: Net asset value per unit As of Sep 28, 2026
  - radiogroup "Choose a series":
    - radio "Series FP" [checked]
    - radio "Series F USD"
    - radio "Series A"
    - radio "Series F"
  - text: $10.1905
  - paragraph: +0.0114 (+0.11%) vs previous valuation day
  - term: Series
  - definition: FP
  - term: FundServ
  - definition:
    - code: LDM001
  - term: Currency
  - definition: CAD
  - term: Fund launch
  - definition: October 5, 2021
  - term: Benchmark
  - definition: FTSE Canada Short Term Corporate Bond Index
  - region "Returns":
    - heading "Returns" [level=2]
    - paragraph: Series FP, net of fees · as of August 31, 2026
    - list:
      - listitem: 1 month −0.12%
      - listitem: 3 months −0.60%
      - listitem: Year to date −0.06%
      - listitem: 1 year +1.04%
      - listitem: 3 years +1.02%
      - listitem: 5 years +2.00%
      - listitem: Since inception +2.27%
    - paragraph: "* Periods over one year are annualized."
  - tabpanel "Overview":
    - heading "Overview" [level=2]
    - heading "What the fund does" [level=3]
    - paragraph: The fund is designed for investors who want regular monthly income from a portfolio of short-term Canadian corporate bonds, with limited sensitivity to interest-rate changes.
    - heading "Investment approach" [level=3]
    - paragraph: The portfolio invests mainly in Canadian corporate bonds with short terms to maturity. Bonds are selected by our two-system quantitative process, which assesses credit risk and relative value across the market. An uncorrelated protection overlay is designed to soften drawdowns when bond markets fall.
    - heading "Returns" [level=3]
    - link "See all performance":
      - /url: "#performance"
    - paragraph: Series FP, net of fees · as of August 31, 2026
    - table "Returns":
      - caption: Returns
      - rowgroup:
        - row "Period Fund Benchmark Value added":
          - columnheader "Period"
          - columnheader "Fund"
          - columnheader "Benchmark"
          - columnheader "Value added"
      - rowgroup:
        - row "1 month −0.12% 0.38% −0.50%":
          - cell "1 month"
          - cell "−0.12%"
          - cell "0.38%"
          - cell "−0.50%"
        - row "3 months −0.60% −0.29% −0.30%":
          - cell "3 months"
          - cell "−0.60%"
          - cell "−0.29%"
          - cell "−0.30%"
        - row "Year to date −0.06% −0.31% +0.25%":
          - cell "Year to date"
          - cell "−0.06%"
          - cell "−0.31%"
          - cell "+0.25%"
        - row "1 year 1.04% 0.24% +0.80%":
          - cell "1 year"
          - cell "1.04%"
          - cell "0.24%"
          - cell "+0.80%"
        - row "2 years* 0.79% 1.65% −0.86%":
          - cell "2 years*"
          - cell "0.79%"
          - cell "1.65%"
          - cell "−0.86%"
        - row "3 years* 1.02% 2.18% −1.17%":
          - cell "3 years*"
          - cell "1.02%"
          - cell "2.18%"
          - cell "−1.17%"
        - row "5 years* 2.00% 1.92% +0.08%":
          - cell "5 years*"
          - cell "2.00%"
          - cell "1.92%"
          - cell "+0.08%"
        - row "Since inception* 2.27% 2.31% −0.04%":
          - cell "Since inception*"
          - cell "2.27%"
          - cell "2.31%"
          - cell "−0.04%"
    - paragraph: "* Periods over one year are annualized."
    - complementary:
      - heading "Fund facts" [level=3]
      - term: Legal name
      - definition: Nymbus Monthly Income Fund
      - term: Vehicle
      - definition: Mutual fund
      - term: Asset class
      - definition: Short-term fixed income
      - term: Benchmark
      - definition: FTSE Canada Short Term Corporate Bond Index
      - term: Fund launch
      - definition: October 5, 2021
      - term: Track record since
      - definition: January 2019
      - term: Currency
      - definition: CAD, USD
      - term: Series
      - definition: FP, F USD, A, F
      - term: Risk rating
      - definition: Low to medium
      - term: Returns shown
      - definition: net of fees
      - heading "Fees and expenses" [level=3]
      - paragraph: Fees and expenses are set out in the fund facts and the simplified prospectus.
    - heading "Series and FundServ codes" [level=3]
    - table "Series and FundServ codes":
      - caption: Series and FundServ codes
      - rowgroup:
        - row "Series FundServ Currency NAV per unit Daily change Valuation date":
          - columnheader "Series"
          - columnheader "FundServ"
          - columnheader "Currency"
          - columnheader "NAV per unit"
          - columnheader "Daily change"
          - columnheader "Valuation date"
      - rowgroup:
        - row "FP (Series shown in the header) LDM001 CAD $10.1905 +0.11% Sep 28, 2026":
          - cell "FP (Series shown in the header)"
          - cell "LDM001":
            - code: LDM001
          - cell "CAD"
          - cell "$10.1905"
          - cell "+0.11%"
          - cell "Sep 28, 2026"
        - row "F USD LDM011 USD US$10.3711 — Sep 28, 2026":
          - cell "F USD"
          - cell "LDM011":
            - code: LDM011
          - cell "USD"
          - cell "US$10.3711"
          - cell "—"
          - cell "Sep 28, 2026"
        - row "A LDM021 CAD $9.7714 −0.21% Sep 28, 2026":
          - cell "A"
          - cell "LDM021":
            - code: LDM021
          - cell "CAD"
          - cell "$9.7714"
          - cell "−0.21%"
          - cell "Sep 28, 2026"
        - row "F LDM081 CAD $10.0397 −0.19% Sep 28, 2026":
          - cell "F"
          - cell "LDM081":
            - code: LDM081
          - cell "CAD"
          - cell "$10.0397"
          - cell "−0.19%"
          - cell "Sep 28, 2026"
    - heading "Investment team" [level=3]
    - link "Meet the team":
      - /url: /team
    - paragraph: The fund is managed by the Nymbus Capital investment team.
  - region "Built for regular income":
    - paragraph: Monthly Income Fund
    - heading "Built for regular income" [level=2]
    - text: Four features shape the way the fund is managed.
    - heading "Monthly distributions" [level=3]
    - paragraph: The fund is designed to pay distributions every month, for investors who rely on a regular cash flow.
    - heading "Short maturities" [level=3]
    - paragraph: Holding bonds that mature within a few years keeps the portfolio’s sensitivity to interest-rate changes low. Its current duration is reported in the Portfolio tab.
    - heading "Systematic credit selection" [level=3]
    - paragraph: Every issuer is assessed by the same quantitative models, which weigh credit risk against the yield each bond offers.
    - heading "Protection overlay" [level=3]
    - paragraph: An overlay uncorrelated with bonds is designed to cushion the portfolio when bond markets decline.
  - region "Disclosures":
    - paragraph: Important information
    - heading "Disclosures" [level=2]
    - paragraph: The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.
    - paragraph: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund's returns may have differed had it existed during that period.
    - paragraph: "Performance shown: Series FP, net of fees · Benchmark: FTSE Canada Short Term Corporate Bond Index"
    - paragraph: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the class shown; periods of less than one year are not annualized.
    - paragraph: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
    - paragraph: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
    - paragraph: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
    - paragraph: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
    - paragraph: Updated daily from Nymbus’ data platform; portfolio data from the monthly factsheet of August 2026. performance as of August 2026 · net asset values as of Sep 28, 2026.
  - heading "Interested in the fund?" [level=2]
  - paragraph: Our team can walk you through the fund, its series and how to invest.
  - link "Contact our team":
    - /url: /contact
  - link "All strategies":
    - /url: /strategies
  - region "Other strategies":
    - paragraph: Explore
    - heading "Other strategies" [level=2]
    - link "Core fixed income Sustainable Enhanced Bonds The Canadian bond universe, scientifically enhanced View Nymbus Sustainable Enhanced Bonds Fund":
      - /url: /strategies/sustainable-enhanced-bonds
    - link "Alternative strategies Multi-Strategy Four uncorrelated systematic strategies View Nymbus Multi-Strategy Fund":
      - /url: /strategies/multi-strategy
    - link "Protection overlay (managed accounts) Global Minimum Volatility An uncorrelated buffer against bond drawdowns View Nymbus Global Minimum Volatility":
      - /url: /strategies/global-minimum-volatility
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
```

# Test source

```ts
  52  |     // header card: NAV with a series selector (funds) or the strategy card (managed accounts)
  53  |     if (f.series) {
  54  |       const card = page.getByTestId("nav-card");
  55  |       await expect(card).toBeVisible();
  56  |       await expect(card.locator('[role="radio"]')).toHaveCount(f.series);
  57  |       await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^(US)?\$\d+\.\d{4}$/);
  58  |     } else {
  59  |       await expect(page.getByTestId("nav-card")).toHaveCount(0);
  60  |       await expect(page.getByTestId("strategy-card").locator(".odo .sr-only")).toHaveText(/^−?\d+\.\d%$/);
  61  |     }
  62  | 
  63  |     // return badges with the class / basis label
  64  |     const strip = page.getByTestId("return-strip");
  65  |     await expect(strip.getByTestId("badge-SI")).toBeVisible();
  66  |     await expect(strip.getByTestId("badge-SI").locator(".fr-v")).toHaveText(/^[+−]?\d+\.\d{2}%$/);
  67  |     await expect(page.getByTestId("basis")).toContainText(f.gross ? "gross of fees" : "net of fees");
  68  | 
  69  |     // overview: facts, fees, returns table, team; series table for funds only
  70  |     await expect(page.getByTestId("fund-facts")).toBeVisible();
  71  |     await expect(page.getByTestId("fees")).toBeVisible();
  72  |     await expect(page.getByTestId("overview-returns").locator("tbody tr").first()).toBeVisible();
  73  |     if (f.series) await expect(page.getByTestId("classes-table").locator("tbody tr.hl")).toHaveCount(1);
  74  |     else await expect(page.getByTestId("classes-table")).toHaveCount(0);
  75  | 
  76  |     await expect(page.getByTestId("other-funds").locator("a")).toHaveCount(3);
  77  |     await expect(page.getByTestId("provenance")).toContainText("Updated daily");
  78  |     await expect(page.locator("#disclosure")).toBeVisible();
  79  | 
  80  |     await settle(page);
  81  |     await shot(page, f.slug, info.project.name);
  82  | 
  83  |     // performance tab: charts mount once shown
  84  |     await openTab(page, "performance");
  85  |     await expect(page).toHaveURL(/#performance$/);
  86  |     const chart = page.getByTestId("trailing-chart");
  87  |     await chart.scrollIntoViewIfNeeded();
  88  |     await expect(chart.locator("svg .cat").first()).toBeVisible();
  89  |     await expect(page.getByTestId("trailing-table")).toBeAttached();
  90  |     await expect(page.getByTestId("risk")).toBeVisible();
  91  | 
  92  |     // portfolio tab: from the factsheet
  93  |     await openTab(page, "portfolio");
  94  |     await expect(page.getByTestId("factsheet-month")).toContainText("August 2026");
  95  |     await expect(page.getByTestId("holdings-table").locator("tbody tr").first()).toBeVisible();
  96  | 
  97  |     // documents: nothing uploaded in e2e → regulatory list on request (funds) or the mandate-holder note
  98  |     await openTab(page, "documents");
  99  |     if (f.series) await expect(page.getByTestId("documents-on-request").locator(".dc-req-item")).toHaveCount(5);
  100 |     else await expect(page.getByTestId("documents-mandate")).toContainText("mandate holders");
  101 | 
  102 |     await openTab(page, "distributions");
  103 |     await expect(page.getByTestId("distributions")).toBeVisible();
  104 | 
  105 |     expect(errors).toEqual([]);
  106 |   });
  107 | }
  108 | 
  109 | for (const slug of ["monthly-income", "global-minimum-volatility"]) {
  110 |   test(`every tab at rest (screenshots): ${slug}`, async ({ page }, info) => {
  111 |     await page.goto(`/strategies/${slug}`);
  112 |     for (const id of TABS) {
  113 |       await openTab(page, id);
  114 |       await settle(page);
  115 |       await shot(page, `${slug}-tab-${id}`, info.project.name);
  116 |     }
  117 |   });
  118 | }
  119 | 
  120 | test("series selector switches the NAV card", async ({ page }) => {
  121 |   await page.goto("/strategies/monthly-income");
  122 |   const card = page.getByTestId("nav-card");
  123 |   await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM001");
  124 |   await card.getByTestId("series-LDM081").click();
  125 |   await expect(card.getByTestId("series-LDM081")).toHaveAttribute("aria-checked", "true");
  126 |   await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM081");
  127 |   await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText("$10.0397");
  128 |   await card.getByTestId("series-LDM011").click();
  129 |   await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^US\$\d+\.\d{4}$/);
  130 | });
  131 | 
  132 | test("tabs follow the URL hash and the keyboard", async ({ page }) => {
  133 |   await page.goto("/strategies/sustainable-enhanced-bonds#portfolio");
  134 |   const tabs = page.getByTestId("fund-tabs");
  135 |   await expect(tabs.locator('[role="tab"][data-tab="portfolio"]')).toHaveAttribute("aria-selected", "true");
  136 |   await expect(page.getByTestId("esg")).toBeVisible();
  137 |   await tabs.locator('[role="tab"][data-tab="portfolio"]').focus();
  138 |   await page.keyboard.press("ArrowRight");
  139 |   await expect(tabs.locator('[role="tab"][data-tab="distributions"]')).toHaveAttribute("aria-selected", "true");
  140 |   await expect(tabs.locator('[role="tab"][data-tab="distributions"]')).toBeFocused();
  141 |   // the header link selects the documents tab
  142 |   await page.evaluate(() => window.scrollTo(0, 0));
  143 |   await page.locator('.fh-actions a[href="#documents"]').click();
  144 |   await expect(tabs.locator('[role="tab"][data-tab="documents"]')).toHaveAttribute("aria-selected", "true");
  145 | });
  146 | 
  147 | test("without JavaScript every panel is on the page", async ({ browser }) => {
  148 |   const ctx = await browser.newContext({ javaScriptEnabled: false });
  149 |   const page = await ctx.newPage();
  150 |   await page.goto("/strategies/monthly-income");
  151 |   await expect(page.getByRole("heading", { level: 1, name: "Nymbus Monthly Income Fund" })).toBeVisible();
> 152 |   for (const id of TABS) await expect(page.locator(`[role="tabpanel"][data-panel="${id}"]`)).toBeVisible();
      |                                                                                              ^ Error: expect(locator).toBeVisible() failed
  153 |   await expect(page.getByTestId("trailing-table")).toBeAttached();
  154 |   await expect(page.getByTestId("holdings-table")).toBeVisible();
  155 |   await ctx.close();
  156 | });
  157 | 
  158 | test("legacy slug redirects to monthly income", async ({ page }) => {
  159 |   const res = await page.goto("/strategies/sustainable-enhanced-short-term-bonds");
  160 |   expect(res?.status()).toBe(200);
  161 |   await expect(page).toHaveURL(/\/strategies\/monthly-income$/);
  162 |   await expect(page.getByTestId("nav-card")).toBeVisible();
  163 | });
  164 | 
  165 | test("registry alias redirects to the canonical slug", async ({ page }) => {
  166 |   await page.goto("/strategies/gmv");
  167 |   await expect(page).toHaveURL(/\/strategies\/global-minimum-volatility$/);
  168 | });
  169 | 
  170 | test("unknown slug is a 404", async ({ page }) => {
  171 |   const res = await page.goto("/strategies/no-such-fund");
  172 |   expect(res?.status()).toBe(404);
  173 | });
  174 | 
  175 | test("French: labels, names and number formatting", async ({ page }) => {
  176 |   await page.goto("/strategies/monthly-income");
  177 |   await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  178 |   await page.reload();
  179 |   await expect(page.getByRole("heading", { level: 1, name: "Fonds Nymbus Revenu Mensuel" })).toBeVisible();
  180 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="overview"]')).toHaveText("Aperçu");
  181 |   await expect(page.getByTestId("basis")).toContainText("net de frais");
  182 |   // decimal comma and a no-break space before % / $
  183 |   await expect(page.getByTestId("badge-SI").locator(".fr-v")).toHaveText(/^[+−]?\d+,\d{2}\s%$/);
  184 |   await expect(page.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^\d+,\d{4}\s\$$/);
  185 | });
  186 | 
```