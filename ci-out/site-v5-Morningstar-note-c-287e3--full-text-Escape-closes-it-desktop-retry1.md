# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site-v5.spec.ts >> Morningstar note: compact info button; hover / focus / tap opens the full text, Escape closes it
- Location: e2e/site-v5.spec.ts:81:5

# Error details

```
Error: expect(locator).toHaveAccessibleDescription(expected) failed

Locator: locator('[role="tabpanel"][data-panel="overview"]').getByTestId('overview-morningstar').getByTestId('overview-morningstar-rating-info-button')
Expected pattern: /Morningstar Rating™ reflects performance as of October 1, 2026.*© 2026 Morningstar Research Inc\./s
Received string:  "Rating methodology and attribution"
Timeout: 10000ms

Call log:
  - Expect "toHaveAccessibleDescription" locator('[role="tabpanel"][data-panel="overview"]').getByTestId('overview-morningstar').getByTestId('overview-morningstar-rating-info-button') with timeout 10000ms
  - waiting for locator('[role="tabpanel"][data-panel="overview"]').getByTestId('overview-morningstar').getByTestId('overview-morningstar-rating-info-button')
    24 × locator resolved to <button type="button" class="inote-btn" aria-expanded="false" aria-controls="_R_5tj3a5fiv5uebtb_" aria-describedby="_R_5tj3a5fiv5uebtb_" data-testid="overview-morningstar-rating-info-button">…</button>
       - unexpected value "Rating methodology and attribution"

```

```yaml
- button "Rating methodology and attribution"
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | /**
  4   |  * Site v5 (2026-10-04, Gabriel's requests): "protective overlay" naming with its qualifier, About page order
  5   |  * (people before values) and team changes, /solutions without the third-party rankings section, fund awards
  6   |  * (Morningstar, Fundata, RBC; Morningstar note as an info disclosure; tab only with a Fundata FundGrade A or B) and
  7   |  * the Global Minimum Volatility variants in the order 3 %, 6 %, 9 % with 6 % selected.
  8   |  */
  9   | 
  10  | const SHOTS = "e2e/screenshots";
  11  | 
  12  | test("about: the people come before the values; the protective-overlay name keeps its qualifier", async ({ page }, info) => {
  13  |   await page.goto("/team");
  14  |   const people = page.locator("#ab-people-t");
  15  |   const values = page.locator("#ab-val-t");
  16  |   await expect(people).toBeAttached();
  17  |   await expect(values).toBeAttached();
  18  |   const yPeople = await people.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  19  |   const yValues = await values.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  20  |   expect(yPeople).toBeLessThan(yValues);
  21  |   await expect(page.getByTestId("about-overlay-note")).toContainText("designed to offset part of losses; they may not do so");
  22  |   const list = page.getByTestId("people");
  23  |   await list.scrollIntoViewIfNeeded();
  24  |   await expect(list).not.toContainText("Xavier Girard");
  25  |   await expect(list).not.toContainText("Jean-Philippe Lejeune");
  26  |   for (const img of ["/team/xavier-girard.webp", "/team/jean-philippe-lejeune.webp"]) {
  27  |     expect((await page.request.get(img)).status()).toBe(404);
  28  |   }
  29  |   await page.screenshot({ path: `${SHOTS}/v5-about-${info.project.name}.png`, fullPage: true });
  30  | });
  31  | 
  32  | test("approach: protective overlays named with the qualifier and the futures-exposure disclosure (FR too)", async ({ page, baseURL }) => {
  33  |   await page.goto("/approach");
  34  |   await expect(page.getByRole("heading", { level: 2, name: /why add a protective overlay/i })).toBeAttached();
  35  |   await expect(page.locator("body")).toContainText("Our protective overlay is designed to have low correlation with bonds in down months and to offset part of bond losses when volatility rises; it may not do so and can lose money.");
  36  |   await expect(page.locator("body")).toContainText("The overlay adds futures exposure on top of the underlying portfolio");
  37  |   await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: baseURL! }]);
  38  |   await page.goto("/approach");
  39  |   await expect(page.locator("body")).toContainText("Pourquoi ajouter une superposition protectrice");
  40  | });
  41  | 
  42  | test("solutions: no third-party rankings section", async ({ page }) => {
  43  |   await page.goto("/solutions");
  44  |   await expect(page.getByRole("heading", { name: /third-party rankings/i })).toHaveCount(0);
  45  |   await expect(page.locator("body")).not.toContainText(/percentile|FundGrade|Morningstar Rating/);
  46  |   await expect(page.locator("body")).toContainText("Protective overlay");
  47  | });
  48  | 
  49  | test("fund awards: Morningstar → Fundata → RBC, official logos sized like Morningstar's, no 'Fund Library' label", async ({ page }, info) => {
  50  |   await page.goto("/strategies/sustainable-enhanced-bonds#awards");
  51  |   const tab = page.locator('[role="tabpanel"][data-panel="awards"]');
  52  |   await expect(tab).toBeVisible();
  53  |   const order = await tab.locator('[data-testid="awards-morningstar"], [data-testid="ranking-LDM201"], [data-testid="tp-rbc-pfs"]').evaluateAll((els) => els.map((e) => e.getAttribute("data-testid")));
  54  |   expect(order).toEqual(["awards-morningstar", "ranking-LDM201", "tp-rbc-pfs"]);
  55  |   const fundata = tab.getByTestId("logo-fundata");
  56  |   await expect(fundata).toHaveAttribute("src", "/brand/third-party/fundata-logo.png");
  57  |   await expect(fundata).toHaveAttribute("alt", "Fundata");
  58  |   const rbc = tab.getByTestId("logo-rbc-pfs");
  59  |   await expect(rbc).toHaveAttribute("src", "/brand/third-party/rbc-logo.png");
  60  |   await expect(rbc).toHaveAttribute("alt", "RBC Investor Services");
  61  |   for (const img of [fundata, rbc]) expect(await img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
  62  |   const fb = (await fundata.boundingBox())!;
  63  |   expect(fb.width).toBeGreaterThanOrEqual(100);
  64  |   expect(fb.width).toBeLessThanOrEqual(130);
  65  |   const rb = (await rbc.boundingBox())!;
  66  |   expect(rb.height).toBeGreaterThanOrEqual(32);
  67  |   expect(rb.height).toBeLessThanOrEqual(40);
  68  |   await expect(tab).not.toContainText("Fund Library");
  69  |   await tab.getByTestId("ranking-LDM201").scrollIntoViewIfNeeded();
  70  |   await page.screenshot({ path: `${SHOTS}/v5-awards-seb-${info.project.name}.png`, fullPage: true });
  71  |   // Monthly Income (FundGrade B): tab shown; Multi-Strategy (C) and GMV (none): no tab
  72  |   await page.goto("/strategies/monthly-income");
  73  |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="awards"]')).toHaveCount(1);
  74  |   for (const slug of ["multi-strategy", "global-minimum-volatility"]) {
  75  |     await page.goto(`/strategies/${slug}`);
  76  |     await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="awards"]'), slug).toHaveCount(0);
  77  |     await expect(page.getByTestId("overview-morningstar"), slug).toHaveCount(0);
  78  |   }
  79  | });
  80  | 
  81  | test("Morningstar note: compact info button; hover / focus / tap opens the full text, Escape closes it", async ({ page, isMobile }, info) => {
  82  |   await page.goto("/strategies/monthly-income");
  83  |   const block = page.locator('[role="tabpanel"][data-panel="overview"]').getByTestId("overview-morningstar");
  84  |   await block.scrollIntoViewIfNeeded();
  85  |   const btn = block.getByTestId("overview-morningstar-rating-info-button");
  86  |   const pop = block.getByTestId("overview-morningstar-rating-info-text");
  87  |   await expect(btn).toHaveAccessibleName("Rating methodology and attribution");
> 88  |   await expect(btn).toHaveAccessibleDescription(/Morningstar Rating™ reflects performance as of October 1, 2026.*© 2026 Morningstar Research Inc\./s);
      |                     ^ Error: expect(locator).toHaveAccessibleDescription(expected) failed
  89  |   const id = await pop.getAttribute("id");
  90  |   await expect(btn).toHaveAttribute("aria-describedby", id!);
  91  |   await expect(btn).toHaveAttribute("aria-controls", id!);
  92  |   await expect(pop).toBeHidden();
  93  |   await expect(btn).toHaveAttribute("aria-expanded", "false");
  94  |   if (isMobile) {
  95  |     await btn.tap();
  96  |     await expect(pop).toBeVisible();
  97  |     await pop.scrollIntoViewIfNeeded();
  98  |     await page.screenshot({ path: `${SHOTS}/v5-morningstar-note-open-${info.project.name}.png` });
  99  |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  100 |     await btn.tap();
  101 |     await expect(pop).toBeHidden();
  102 |     await btn.tap();
  103 |     await expect(pop).toBeVisible();
  104 |     await page.getByRole("heading", { level: 1 }).tap();
  105 |     await expect(pop).toBeHidden();
  106 |   } else {
  107 |     await btn.hover();
  108 |     await expect(pop).toBeVisible();
  109 |     // hoverable: moving onto the note keeps it open
  110 |     await pop.hover();
  111 |     await expect(pop).toBeVisible();
  112 |     await page.keyboard.press("Escape");
  113 |     await expect(pop).toBeHidden();
  114 |     await page.mouse.move(0, 0);
  115 |     // keyboard: focus opens, Escape closes, Enter pins
  116 |     await btn.focus();
  117 |     await page.keyboard.press("Shift+Tab");
  118 |     await page.keyboard.press("Tab");
  119 |     await expect(btn).toBeFocused();
  120 |     await expect(pop).toBeVisible();
  121 |     await expect(btn).toHaveAttribute("aria-expanded", "true");
  122 |     await page.screenshot({ path: `${SHOTS}/v5-morningstar-note-open-${info.project.name}.png` });
  123 |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  124 |     await page.keyboard.press("Escape");
  125 |     await expect(pop).toBeHidden();
  126 |     await page.keyboard.press("Enter");
  127 |     await expect(pop).toBeVisible();
  128 |     await page.keyboard.press("Enter");
  129 |     await expect(pop).toBeHidden();
  130 |   }
  131 | });
  132 | 
  133 | test("Global Minimum Volatility: variants shown 3 %, 6 %, 9 %, with 6 % selected on every page", async ({ page, baseURL }, info) => {
  134 |   await page.goto("/strategies/global-minimum-volatility");
  135 |   const sel = page.getByTestId("variant-selector");
  136 |   await expect(sel.locator('[role="radio"]')).toHaveText([/3%/, /6%/, /9%/]);
  137 |   await expect(sel.getByTestId("variant-6")).toHaveAttribute("aria-checked", "true");
  138 |   await expect(page.getByTestId("hero-variant")).toHaveText("6% downside volatility");
  139 |   await expect(page.getByTestId("disclosure-variant")).toHaveText("6% downside volatility");
  140 |   await sel.scrollIntoViewIfNeeded();
  141 |   await page.waitForTimeout(1200);
  142 |   await sel.screenshot({ path: `${SHOTS}/v5-gmv-${info.project.name}.png` });
  143 |   await page.goto("/strategies");
  144 |   await expect(page.locator("body")).toContainText("6% downside volatility");
  145 |   await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: baseURL! }]);
  146 |   await page.goto("/strategies/global-minimum-volatility");
  147 |   await expect(page.getByTestId("variant-selector").locator('[role="radio"]')).toHaveText([/3\s%/, /6\s%/, /9\s%/]);
  148 |   await expect(page.getByTestId("variant-selector").getByTestId("variant-6")).toHaveAttribute("aria-checked", "true");
  149 | });
  150 | 
```