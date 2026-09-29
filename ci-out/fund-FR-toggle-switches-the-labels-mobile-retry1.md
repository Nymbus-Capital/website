# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> FR toggle switches the labels
- Location: e2e/fund.spec.ts:86:5

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  getByTestId('basis')
Expected: "net de frais"
Received: "net de frais · Series FP"
Timeout:  10000ms

Call log:
  - Expect "toHaveText" getByTestId('basis') with timeout 10000ms
  - waiting for getByTestId('basis')
    23 × locator resolved to <span class="fx-basis" data-testid="basis">…</span>
       - unexpected value "net de frais · Series FP"

```

```yaml
- text: net de frais · Series FP
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
  35  |     await expect(page.locator(".fx-bigfig .odo")).toHaveAttribute("aria-label", /^−?\d+\.\d%$/);
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
  90  |   if (await toggle.isVisible().catch(() => false)) await toggle.click();
  91  |   else {
  92  |     // the site shell owns the toggle; fall back to the persisted choice it reads on load
  93  |     await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  94  |     await page.reload();
  95  |   }
  96  |   await expect(page.getByRole("heading", { level: 1, name: "fonds nymbus revenu mensuel" })).toBeVisible();
  97  |   await expect(page.getByRole("heading", { name: "rendements cumulatifs" })).toBeAttached();
> 98  |   await expect(page.getByTestId("basis")).toHaveText("net de frais");
      |                                           ^ Error: expect(locator).toHaveText(expected) failed
  99  |   // French number formatting: decimal comma and a (narrow) no-break space before %
  100 |   await expect(page.locator(".fx-bigfig .odo")).toHaveAttribute("aria-label", /^−?\d+,\d\s%$/);
  101 | });
  102 | 
```