# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> distributions: per-series cards, history chart, calendar years and the full history behind a toggle
- Location: e2e/fund.spec.ts:172:5

# Error details

```
Error: expect(locator).toHaveClass(expected) failed

Locator: getByTestId('dist-class-LDM001')
Expected pattern: /hl/
Received string:  "ds-card in"
Timeout: 10000ms

Call log:
  - Expect "toHaveClass" getByTestId('dist-class-LDM001') with timeout 10000ms
  - waiting for getByTestId('dist-class-LDM001')
    3 × locator resolved to <div class="ds-card" data-testid="dist-class-LDM001">…</div>
      - unexpected value "ds-card"
    20 × locator resolved to <div class="ds-card in" data-testid="dist-class-LDM001">…</div>
       - unexpected value "ds-card in"

```

```yaml
- text: Series FP
- code: LDM001
- text: $0.045382 Last distribution · Aug 31, 2026
- term: 12 months to Sep 29, 2026
- definition: $0.537789
- term: Frequency
- definition: Monthly
```

# Test source

```ts
  77  | 
  78  |     // overview: facts, fees, returns table, team; series table for funds only
  79  |     await expect(page.getByTestId("fund-facts")).toBeVisible();
  80  |     await expect(page.getByTestId("fees")).toBeVisible();
  81  |     await expect(page.getByTestId("overview-returns").locator("tbody tr").first()).toBeVisible();
  82  |     if (f.series) await expect(page.getByTestId("classes-table").locator("tbody tr.hl")).toHaveCount(1);
  83  |     else await expect(page.getByTestId("classes-table")).toHaveCount(0);
  84  | 
  85  |     await expect(page.getByTestId("other-funds").locator("a")).toHaveCount(3);
  86  |     await expect(page.getByTestId("provenance")).toContainText("Updated daily");
  87  |     // the provenance line names the source of the Portfolio tab: the daily holdings with their date, else the factsheet
  88  |     if (f.daily) {
  89  |       await expect(page.getByTestId("provenance")).toContainText("portfolio data from the daily holdings as of September 28, 2026");
  90  |       await expect(page.getByTestId("provenance")).not.toContainText("portfolio data from the monthly factsheet");
  91  |     } else {
  92  |       await expect(page.getByTestId("provenance")).toContainText("portfolio data from the monthly factsheet of August 2026");
  93  |     }
  94  |     await expect(page.locator("#disclosure")).toBeVisible();
  95  | 
  96  |     await settle(page);
  97  |     await shot(page, f.slug, info.project.name);
  98  | 
  99  |     // performance tab: charts mount once shown
  100 |     await openTab(page, "performance");
  101 |     await expect(page).toHaveURL(/#performance$/);
  102 |     const chart = page.getByTestId("trailing-chart");
  103 |     await chart.scrollIntoViewIfNeeded();
  104 |     await expect(chart.locator("svg .cat").first()).toBeVisible();
  105 |     await expect(page.getByTestId("trailing-table")).toBeAttached();
  106 |     await expect(page.getByTestId("risk")).toBeVisible();
  107 | 
  108 |     // portfolio tab: the daily book with its date and source label, else the month-end factsheet
  109 |     await openTab(page, "portfolio");
  110 |     const source = page.getByTestId("portfolio-source");
  111 |     if (f.daily) {
  112 |       await expect(source).toHaveAttribute("data-source", "daily");
  113 |       await expect(source).toContainText("Daily portfolio data");
  114 |       await expect(page.getByTestId("portfolio-asof")).toHaveText("as of September 28, 2026");
  115 |       await expect(page.getByTestId("metric-duration")).toBeVisible();
  116 |       await expect(page.getByTestId("coverage-note")).toContainText("share of the bond holdings, by market value");
  117 |       await expect(page.getByTestId("breakdown-rating")).toBeVisible();
  118 |       await expect(page.getByTestId("holdings-table").locator("tbody tr")).toHaveCount(10);
  119 |       await expect(page.getByTestId("holdings-table").locator("thead")).toContainText("Coupon");
  120 |       // no breakdown is left alone in half a row (the SEB book has five: the last one takes the whole row)
  121 |       const panel = page.locator('[role="tabpanel"][data-panel="portfolio"]');
  122 |       const blocks = panel.locator(".bk-grid").first().locator(":scope > [data-testid^='breakdown-']");
  123 |       const n = await blocks.count();
  124 |       const grid = await panel.locator(".bk-grid").first().boundingBox();
  125 |       const last = await blocks.nth(n - 1).boundingBox();
  126 |       if (n % 2 === 1 && info.project.name === "desktop") expect(last!.width).toBeGreaterThan(grid!.width * 0.9);
  127 |       // every bar has a valid width within its track (never stretched by an invalid value)
  128 |       for (const bar of await panel.locator(".fx-hbar .b.fund").all()) {
  129 |         const [b, t] = await Promise.all([bar.boundingBox(), bar.locator("xpath=..").boundingBox()]);
  130 |         expect(b!.width).toBeLessThanOrEqual(t!.width + 0.5);
  131 |       }
  132 |     } else {
  133 |       await expect(source).toHaveAttribute("data-source", "factsheet");
  134 |       await expect(page.getByTestId("factsheet-month")).toContainText("August 2026");
  135 |     }
  136 |     await expect(page.getByTestId("holdings-table").locator("tbody tr").first()).toBeVisible();
  137 |     await expect(page.getByTestId("green-bonds")).toHaveCount(f.green ? 1 : 0);
  138 |     if (f.green) await expect(page.getByTestId("green-marker").first()).toBeVisible();
  139 | 
  140 |     // documents: nothing uploaded in e2e → regulatory list on request (funds) or the mandate-holder note
  141 |     await openTab(page, "documents");
  142 |     if (f.series) await expect(page.getByTestId("documents-on-request").locator(".dc-req-item")).toHaveCount(5);
  143 |     else await expect(page.getByTestId("documents-mandate")).toContainText("mandate holders");
  144 | 
  145 |     if (f.dist) {
  146 |       await openTab(page, "distributions");
  147 |       await expect(page.getByTestId("distributions")).toBeVisible();
  148 |       await expect(page.getByTestId("distributions-summary").locator(".ds-card")).toHaveCount(f.dist);
  149 |       await expect(page.getByTestId("distributions-summary").locator(".ds-card.hl")).toHaveCount(1);
  150 |       await expect(page.getByTestId("distributions-note")).toContainText("tax slips");
  151 |       await expect(page.getByTestId("distributions-history")).toBeVisible();
  152 |     } else {
  153 |       // managed accounts: no distributions tab
  154 |       await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="distributions"]')).toHaveCount(0);
  155 |     }
  156 | 
  157 |     expect(errors).toEqual([]);
  158 |   });
  159 | }
  160 | 
  161 | for (const [slug, tabs] of [["monthly-income", TABS], ["global-minimum-volatility", GMV_TABS], ["sustainable-enhanced-bonds", ["portfolio", "distributions"]], ["multi-strategy", ["portfolio"]]] as const) {
  162 |   test(`every tab at rest (screenshots): ${slug}`, async ({ page }, info) => {
  163 |     await page.goto(`/strategies/${slug}`);
  164 |     for (const id of tabs) {
  165 |       await openTab(page, id);
  166 |       await settle(page);
  167 |       await shot(page, `${slug}-tab-${id}`, info.project.name);
  168 |     }
  169 |   });
  170 | }
  171 | 
  172 | test("distributions: per-series cards, history chart, calendar years and the full history behind a toggle", async ({ page }) => {
  173 |   await page.goto("/strategies/monthly-income#distributions");
  174 |   // the latest distribution of the series shown (not the end of the requested window)
  175 |   await expect(page.getByTestId("distributions-asof")).toHaveText("Data as of September 28, 2026");
  176 |   const fp = page.getByTestId("dist-class-LDM001");
> 177 |   await expect(fp).toHaveClass(/hl/);
      |                    ^ Error: expect(locator).toHaveClass(expected) failed
  178 |   // amounts with the series' own precision (6 decimals in the sample), so rows add up to the calendar totals
  179 |   await expect(fp.getByTestId("dist-last-amount")).toHaveText(/^\$0\.\d{6}$/);
  180 |   await expect(fp.getByTestId("dist-t12m")).toHaveText(/^\$0\.\d{6}$/);
  181 |   // the trailing 12 months end at the day the data were read (the response end date), not at the last distribution
  182 |   await expect(fp.getByTestId("dist-t12m-label")).toHaveText(/^12 months to Sept?\.? 29, 2026$/);
  183 |   await expect(fp.getByTestId("dist-t12m-label")).toHaveAttribute("title", "Total per unit of the distributions paid in the 12 months to September 29, 2026");
  184 |   await expect(page.getByTestId("dist-class-LDM011").getByTestId("dist-last-amount")).toHaveText(/^US\$0\.\d{4,6}$/);
  185 |   // cards of one row: the amounts start at the same height even when a series header wraps
  186 |   const tops = await page.getByTestId("distributions-summary").locator(".ds-amt").evaluateAll((els) => els.map((e) => [Math.round(e.getBoundingClientRect().top), Math.round((e.closest(".ds-card") as HTMLElement).getBoundingClientRect().top)]));
  187 |   const byRow = new Map<number, number[]>();
  188 |   for (const [amt, card] of tops) byRow.set(card, [...(byRow.get(card) ?? []), amt]);
  189 |   for (const amts of byRow.values()) expect(Math.max(...amts) - Math.min(...amts)).toBeLessThanOrEqual(1);
  190 |   // nothing clipped inside a card (amounts with 6 decimals and a currency prefix fit on phones)
  191 |   const overflow = await page.getByTestId("distributions-summary").locator(".ds-card").evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1 || [...e.querySelectorAll("*")].some((c) => c.getBoundingClientRect().right > e.getBoundingClientRect().right + 1)).map((e) => e.getAttribute("data-testid")));
  192 |   expect(overflow).toEqual([]);
  193 |   const wrapped = await page.getByTestId("distributions-summary").locator(".ds-amt").evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height > 1.6 * parseFloat(getComputedStyle(e).lineHeight)).map((e) => e.textContent));
  194 |   expect(wrapped, "each amount on one line").toEqual([]);
  195 |   const history = page.getByTestId("distributions-history");
  196 |   await history.scrollIntoViewIfNeeded();
  197 |   const bars = page.getByTestId("distribution-chart").locator("svg .cat");
  198 |   await expect(bars).toHaveCount(24);
  199 |   // one tab stop for the chart (roving tabindex), on the latest distribution; arrows / Home / End move it
  200 |   await expect(page.getByTestId("distribution-chart").locator('svg .cat[tabindex="0"]')).toHaveCount(1);
  201 |   await expect(bars.nth(23)).toHaveAttribute("tabindex", "0");
  202 |   await bars.nth(23).focus();
  203 |   await page.keyboard.press("ArrowLeft");
  204 |   await expect(bars.nth(22)).toBeFocused();
  205 |   await expect(bars.nth(22)).toHaveAttribute("tabindex", "0");
  206 |   await expect(bars.nth(23)).toHaveAttribute("tabindex", "-1");
  207 |   await page.keyboard.press("Home");
  208 |   await expect(bars.nth(0)).toBeFocused();
  209 |   await page.keyboard.press("End");
  210 |   await expect(bars.nth(23)).toBeFocused();
  211 |   await expect(page.getByTestId("dist-ytd")).toHaveCount(1);
  212 |   await expect(page.getByTestId("distributions-calendar").locator("tbody tr").first()).toContainText("2026");
  213 |   const rows = page.getByTestId("distributions-table").locator("tbody tr");
  214 |   await expect(rows).toHaveCount(12);
  215 |   const toggle = page.getByTestId("distributions-show-all");
  216 |   await expect(toggle).toHaveAttribute("aria-expanded", "false");
  217 |   await toggle.click();
  218 |   await expect(toggle).toHaveAttribute("aria-expanded", "true");
  219 |   expect(await rows.count()).toBeGreaterThan(12);
  220 |   // another series: its own history
  221 |   await page.getByTestId("dist-series-LDM021").click();
  222 |   await expect(page.getByTestId("dist-series-LDM021")).toHaveAttribute("aria-pressed", "true");
  223 |   await expect(rows.first()).toContainText("Sep 28, 2026");
  224 |   await expect(page.getByTestId("distributions-note")).not.toContainText(/yield/i);
  225 | });
  226 | 
  227 | test("series selector switches the NAV card", async ({ page }) => {
  228 |   await page.goto("/strategies/monthly-income");
  229 |   const card = page.getByTestId("nav-card");
  230 |   // the default class is F (LDM081)
  231 |   await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM081");
  232 |   await expect(card.getByTestId("series-LDM081")).toHaveAttribute("aria-checked", "true");
  233 |   await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText("$10.0397");
  234 |   await card.getByTestId("series-LDM001").click();
  235 |   await expect(card.getByTestId("series-LDM001")).toHaveAttribute("aria-checked", "true");
  236 |   await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM001");
  237 |   await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText("$10.1905");
  238 |   await card.getByTestId("series-LDM011").click();
  239 |   await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^US\$\d+\.\d{4}$/);
  240 | });
  241 | 
  242 | test("tabs follow the URL hash and the keyboard", async ({ page }) => {
  243 |   await page.goto("/strategies/sustainable-enhanced-bonds#portfolio");
  244 |   const tabs = page.getByTestId("fund-tabs");
  245 |   await expect(tabs.locator('[role="tab"][data-tab="portfolio"]')).toHaveAttribute("aria-selected", "true");
  246 |   await expect(page.getByTestId("esg")).toBeVisible();
  247 |   await tabs.locator('[role="tab"][data-tab="portfolio"]').focus();
  248 |   await page.keyboard.press("ArrowRight");
  249 |   await expect(tabs.locator('[role="tab"][data-tab="distributions"]')).toHaveAttribute("aria-selected", "true");
  250 |   await expect(tabs.locator('[role="tab"][data-tab="distributions"]')).toBeFocused();
  251 |   // the header link selects the documents tab
  252 |   await page.evaluate(() => window.scrollTo(0, 0));
  253 |   await page.locator('.fh-actions a[href="#documents"]').click();
  254 |   await expect(tabs.locator('[role="tab"][data-tab="documents"]')).toHaveAttribute("aria-selected", "true");
  255 | });
  256 | 
  257 | test("without JavaScript every panel is on the page", async ({ browser }) => {
  258 |   const ctx = await browser.newContext({ javaScriptEnabled: false });
  259 |   const page = await ctx.newPage();
  260 |   await page.goto("/strategies/monthly-income");
  261 |   await expect(page.getByRole("heading", { level: 1, name: "Nymbus Monthly Income Fund" })).toBeVisible();
  262 |   for (const id of TABS) await expect(page.locator(`[role="tabpanel"][data-panel="${id}"]`)).toBeVisible();
  263 |   // Monthly Income F has no return series yet: its panels say "coming soon"
  264 |   await expect(page.getByTestId("perf-soon")).toBeAttached();
  265 |   await expect(page.getByTestId("holdings-table")).toBeVisible();
  266 |   await ctx.close();
  267 | });
  268 | 
  269 | test("legacy slug redirects to monthly income", async ({ page }) => {
  270 |   const res = await page.goto("/strategies/sustainable-enhanced-short-term-bonds");
  271 |   expect(res?.status()).toBe(200);
  272 |   await expect(page).toHaveURL(/\/strategies\/monthly-income$/);
  273 |   await expect(page.getByTestId("nav-card")).toBeVisible();
  274 | });
  275 | 
  276 | test("registry alias redirects to the canonical slug", async ({ page }) => {
  277 |   await page.goto("/strategies/gmv");
```