# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> series selector switches the NAV card
- Location: e2e/fund.spec.ts:120:5

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  getByTestId('nav-card').getByTestId('nav-fundserv')
Expected: "LDM001"
Received: "FundServLDM001"
Timeout:  10000ms

Call log:
  - Expect "toHaveText" getByTestId('nav-card').getByTestId('nav-fundserv') with timeout 10000ms
  - waiting for getByTestId('nav-card').getByTestId('nav-fundserv')
    24 × locator resolved to <div class="nc-fact" data-testid="nav-fundserv">…</div>
       - unexpected value "FundServLDM001"

```

```yaml
- term: FundServ
- definition:
  - code: LDM001
```

# Test source

```ts
  23  |     await page.waitForTimeout(70);
  24  |   }
  25  |   await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  26  |   await page.waitForTimeout(400);
  27  |   await page.evaluate(() => window.scrollTo(0, 0));
  28  |   await page.waitForTimeout(2600);
  29  | }
  30  | 
  31  | async function shot(page: Page, name: string, project: string) {
  32  |   mkdirSync("e2e/screenshots", { recursive: true });
  33  |   await page.screenshot({ path: `e2e/screenshots/fund-${name}-${project}.png`, fullPage: true });
  34  | }
  35  | 
  36  | async function openTab(page: Page, id: string) {
  37  |   await page.getByTestId("fund-tabs").locator(`[role="tab"][data-tab="${id}"]`).click();
  38  |   await expect(page.locator(`[role="tabpanel"][data-panel="${id}"]`)).toBeVisible();
  39  | }
  40  | 
  41  | for (const f of FUNDS) {
  42  |   test(`fund page renders: ${f.slug}`, async ({ page }, info) => {
  43  |     const errors: string[] = [];
  44  |     page.on("pageerror", (e) => errors.push(e.message));
  45  |     const res = await page.goto(`/strategies/${f.slug}`);
  46  |     expect(res?.status()).toBe(200);
  47  | 
  48  |     await expect(page.getByRole("heading", { level: 1, name: f.en })).toBeVisible();
  49  |     await expect(page.locator("h1")).toHaveCount(1);
  50  |     await expect(page.getByTestId("sample-chip")).toBeVisible();
  51  | 
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
> 123 |   await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM001");
      |                                                  ^ Error: expect(locator).toHaveText(expected) failed
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
  152 |   for (const id of TABS) await expect(page.locator(`[role="tabpanel"][data-panel="${id}"]`)).toBeVisible();
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