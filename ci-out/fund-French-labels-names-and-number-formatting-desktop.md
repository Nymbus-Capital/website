# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> French: labels, names and number formatting
- Location: e2e/fund.spec.ts:394:5

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('provenance')
Expected substring: "données de portefeuille selon les positions quotidiennes au 28 septembre 2026"
Received string:    "Données de portefeuille au 28 septembre 2026; indicateurs de durabilité au 31 août 2026. rendements au août 2026 · valeurs liquidatives au 28 sept. 2026."
Timeout: 10000ms

Call log:
  - Expect "toContainText" getByTestId('provenance') with timeout 10000ms
  - waiting for getByTestId('provenance')
    24 × locator resolved to <p class="fxd-prov" data-testid="provenance">…</p>
       - unexpected value "Données de portefeuille au 28 septembre 2026; indicateurs de durabilité au 31 août 2026. rendements au août 2026 · valeurs liquidatives au 28 sept. 2026."

```

```yaml
- paragraph: Données de portefeuille au 28 septembre 2026; indicateurs de durabilité au 31 août 2026. rendements au août 2026 · valeurs liquidatives au 28 sept. 2026.
```

# Test source

```ts
  320 |   const rows = page.getByTestId("distributions-table").locator("tbody tr");
  321 |   await expect(rows).toHaveCount(12);
  322 |   const toggle = page.getByTestId("distributions-show-all");
  323 |   await expect(toggle).toHaveAttribute("aria-expanded", "false");
  324 |   await toggle.click();
  325 |   await expect(toggle).toHaveAttribute("aria-expanded", "true");
  326 |   expect(await rows.count()).toBeGreaterThan(12);
  327 |   // another series: its own history
  328 |   await page.getByTestId("dist-series-LDM021").click();
  329 |   await expect(page.getByTestId("dist-series-LDM021")).toHaveAttribute("aria-pressed", "true");
  330 |   await expect(rows.first()).toContainText("Sep 28, 2026");
  331 |   await expect(page.getByTestId("distributions-note")).not.toContainText(/yield/i);
  332 | });
  333 | 
  334 | test("series selector switches the NAV card", async ({ page }) => {
  335 |   await page.goto("/strategies/monthly-income");
  336 |   const card = page.getByTestId("nav-card");
  337 |   // the default class is F (LDM081)
  338 |   await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM081");
  339 |   await expect(card.getByTestId("series-LDM081")).toHaveAttribute("aria-checked", "true");
  340 |   await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText("$10.0397");
  341 |   await card.getByTestId("series-LDM001").click();
  342 |   await expect(card.getByTestId("series-LDM001")).toHaveAttribute("aria-checked", "true");
  343 |   await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM001");
  344 |   await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText("$10.1905");
  345 |   await card.getByTestId("series-LDM011").click();
  346 |   await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^US\$\d+\.\d{4}$/);
  347 | });
  348 | 
  349 | test("tabs follow the URL hash and the keyboard", async ({ page }) => {
  350 |   await page.goto("/strategies/sustainable-enhanced-bonds#portfolio");
  351 |   const tabs = page.getByTestId("fund-tabs");
  352 |   await expect(tabs.locator('[role="tab"][data-tab="portfolio"]')).toHaveAttribute("aria-selected", "true");
  353 |   await expect(page.getByTestId("esg")).toBeVisible();
  354 |   await tabs.locator('[role="tab"][data-tab="portfolio"]').focus();
  355 |   await page.keyboard.press("ArrowRight");
  356 |   await expect(tabs.locator('[role="tab"][data-tab="distributions"]')).toHaveAttribute("aria-selected", "true");
  357 |   await expect(tabs.locator('[role="tab"][data-tab="distributions"]')).toBeFocused();
  358 |   // the header link selects the documents tab
  359 |   await page.evaluate(() => window.scrollTo(0, 0));
  360 |   await page.locator('.fh-actions a[href="#documents"]').click();
  361 |   await expect(tabs.locator('[role="tab"][data-tab="documents"]')).toHaveAttribute("aria-selected", "true");
  362 | });
  363 | 
  364 | test("without JavaScript every panel is on the page", async ({ browser }) => {
  365 |   const ctx = await browser.newContext({ javaScriptEnabled: false });
  366 |   const page = await ctx.newPage();
  367 |   await page.goto("/strategies/monthly-income");
  368 |   await expect(page.getByRole("heading", { level: 1, name: "Nymbus Monthly Income Fund" })).toBeVisible();
  369 |   for (const id of TABS) await expect(page.locator(`[role="tabpanel"][data-panel="${id}"]`)).toBeVisible();
  370 |   // Monthly Income F has its own return series: the performance panel is server-rendered with it
  371 |   await expect(page.getByTestId("perf-context")).toBeAttached();
  372 |   await expect(page.getByTestId("perf-soon")).toHaveCount(0);
  373 |   await expect(page.getByTestId("holdings-table")).toBeVisible();
  374 |   await ctx.close();
  375 | });
  376 | 
  377 | test("legacy slug redirects to monthly income", async ({ page }) => {
  378 |   const res = await page.goto("/strategies/sustainable-enhanced-short-term-bonds");
  379 |   expect(res?.status()).toBe(200);
  380 |   await expect(page).toHaveURL(/\/strategies\/monthly-income$/);
  381 |   await expect(page.getByTestId("nav-card")).toBeVisible();
  382 | });
  383 | 
  384 | test("registry alias redirects to the canonical slug", async ({ page }) => {
  385 |   await page.goto("/strategies/gmv");
  386 |   await expect(page).toHaveURL(/\/strategies\/global-minimum-volatility$/);
  387 | });
  388 | 
  389 | test("unknown slug is a 404", async ({ page }) => {
  390 |   const res = await page.goto("/strategies/no-such-fund");
  391 |   expect(res?.status()).toBe(404);
  392 | });
  393 | 
  394 | test("French: labels, names and number formatting", async ({ page }) => {
  395 |   await page.goto("/strategies/monthly-income");
  396 |   await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  397 |   await page.reload();
  398 |   await expect(page.getByRole("heading", { level: 1, name: "Fonds Nymbus Revenu Mensuel" })).toBeVisible();
  399 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="overview"]')).toHaveText("Aperçu");
  400 |   // class F (LDM081) has its own returns, computed from its daily NAV chain
  401 |   await expect(page.getByTestId("basis")).toContainText(/Série F(?![A-Za-z])/);
  402 |   // a class launched less than 12 months ago: its NAV, and the chosen class's returns under that class's own label
  403 |   await page.getByTestId("series-LDM021").click();
  404 |   await expect(page.getByTestId("nav-fundserv")).toHaveText("LDM021");
  405 |   await expect(page.getByTestId("basis")).toContainText(/Série F(?![A-Za-z])/);
  406 |   await expect(page.locator("body")).not.toContainText(
  407 |     /bientôt|à venir|non disponible|pas disponible|seront présentés lorsque/,
  408 |   );
  409 |   await page.getByTestId("series-LDM001").click();
  410 |   await expect(page.getByTestId("basis")).toContainText("après déduction des frais");
  411 |   await expect(page.getByTestId("class-type")).toHaveText("Série à notice d’offre");
  412 |   // decimal comma and a no-break space before % / $
  413 |   await expect(page.getByTestId("badge-SI").locator(".fr-v")).toHaveText(/^[+−]?\d+,\d{2}\s%$/);
  414 |   await expect(page.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^\d+,\d{4}\s\$$/);
  415 |   await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="portfolio"]').click();
  416 |   await expect(page.getByTestId("portfolio-asof")).toHaveText("Au 28 septembre 2026");
  417 |   await expect(page.getByTestId("portfolio-source")).not.toContainText(/quotidienn|fiche/i);
  418 |   await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="distributions"]').click();
  419 |   await expect(page.getByTestId("dist-class-LDM001").getByTestId("dist-last-amount")).toHaveText(/^0,\d{6}\s\$$/);
> 420 |   await expect(page.getByTestId("provenance")).toContainText(
      |                                                ^ Error: expect(locator).toContainText(expected) failed
  421 |     "données de portefeuille selon les positions quotidiennes au 28 septembre 2026",
  422 |   );
  423 | });
  424 | 
  425 | /* ------------------------------------------------------------------ classes, variants, awards, calendar labels */
  426 | 
  427 | test("class selector: returns follow the class; F is the default; a young class shows its NAV and F's returns, labelled F", async ({
  428 |   page,
  429 | }) => {
  430 |   await page.goto("/strategies/sustainable-enhanced-bonds");
  431 |   const card = page.getByTestId("nav-card");
  432 |   const strip = page.getByTestId("return-strip");
  433 |   await expect(card.getByTestId("series-LDM201")).toHaveAttribute("aria-checked", "true");
  434 |   await expect(page.getByTestId("basis")).toContainText("Series F");
  435 |   const f = await strip.getByTestId("badge-SI").locator(".fr-v").innerText();
  436 |   await card.getByTestId("series-LDM202").click();
  437 |   await expect(page.getByTestId("basis")).toContainText("Series H");
  438 |   const h = await strip.getByTestId("badge-SI").locator(".fr-v").innerText();
  439 |   expect(h, "class H shows its own returns").not.toBe(f);
  440 |   // a class launched less than 12 months ago (regulatory minimum): never offered for returns, never a notice; its
  441 |   // NAV is shown and the returns are the chosen class's (F), under F's own label
  442 |   await card.getByTestId("series-LDM205").click();
  443 |   await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM205");
  444 |   await expect(page.getByTestId("basis")).toContainText(/Series F(?![A-Za-z])/);
  445 |   await expect(page.getByTestId("basis")).not.toContainText(/Series A(?![A-Za-z])/);
  446 |   await expect(strip.getByTestId("badge-SI").locator(".fr-v")).toHaveText(f);
  447 |   await expect(page.locator("body")).not.toContainText(
  448 |     /coming soon|will be shown once|not available|could not be verified/i,
  449 |   );
  450 |   await openTab(page, "performance");
  451 |   await expect(page.getByTestId("perf-context")).toContainText(/Series F(?![A-Za-z])/);
  452 |   await expect(page.getByTestId("growth")).toBeVisible();
  453 |   await expect(page.getByTestId("calendar")).toBeVisible();
  454 |   await expect(page.getByTestId("risk")).toBeVisible();
  455 | });
  456 | 
  457 | test("every series of a fund: own figures when it has them, a withheld period / year is omitted, no notice (EN + FR)", async ({
  458 |   page,
  459 | }) => {
  460 |   // Multi-Strategy class A: three valuation days never served by the source (October 2025, synthetic): that month cannot
  461 |   // be computed, so 1 year and since inception are not shown at all (no row, no dash), the rest is
  462 |   await page.goto("/strategies/multi-strategy");
  463 |   const card = page.getByTestId("nav-card");
  464 |   const strip = page.getByTestId("return-strip");
  465 |   const rows = page.getByTestId("overview-returns").locator("tbody tr");
  466 |   await card.getByTestId("series-LDM300").click();
  467 |   await expect(page.getByTestId("basis")).toContainText(/Series A(?![A-Za-z])/);
  468 |   await expect(rows.filter({ hasText: "3 months" }).locator("td").nth(1)).toHaveText(/^[−-]?\d+\.\d{2}%$/);
  469 |   await expect(rows.filter({ hasText: "1 year" })).toHaveCount(0);
  470 |   await expect(rows.filter({ hasText: "Since inception" })).toHaveCount(0);
  471 |   await expect(page.getByTestId("overview-returns")).not.toContainText("—");
  472 |   await expect(page.getByTestId("overview-withheld-note")).toHaveCount(0);
  473 |   await expect(strip.getByTestId("badge-SI")).toHaveCount(0);
  474 |   await expect(strip).not.toContainText("—");
  475 |   await expect(strip.getByTestId("strip-withheld-note")).toHaveCount(0);
  476 |   await openTab(page, "performance");
  477 |   await expect(page.getByTestId("perf-withheld-note")).toHaveCount(0);
  478 |   await page.getByTestId("growth").scrollIntoViewIfNeeded();
  479 |   await expect(page.getByTestId("growth-from")).toHaveText("Starts on October 31, 2025.");
  480 |   await page.getByTestId("calendar").scrollIntoViewIfNeeded();
  481 |   await expect(page.getByTestId("calendar-table")).not.toContainText("—");
  482 |   // the heat map: the year with the missing month (2025) is not shown; no empty month inside the record
  483 |   await page.getByTestId("heatmap").scrollIntoViewIfNeeded();
  484 |   const myears = page.getByTestId("heatmap").locator("tbody th.y");
  485 |   await expect(myears.first()).toBeVisible();
  486 |   const mshown = await myears.allInnerTexts();
  487 |   expect(mshown).not.toContain("2025");
  488 |   expect(mshown).toContain("2026");
  489 |   await expect(page.getByTestId("heat-withheld")).toHaveCount(0);
  490 |   await expect(page.locator("body")).not.toContainText(/could not be verified|figure not shown/i);
  491 | 
  492 |   await page.goto("/strategies/monthly-income");
  493 |   await openTab(page, "overview");
  494 |   // class J: since its inception (Oct 5, 2021); its synthetic source anomalies (a bad print reversed inside March 2022, a
  495 |   // drift in September 2023) are internal data-quality alerts now: every figure it has the history for is shown
  496 |   await card.getByTestId("series-LDM061").click();
  497 |   await expect(page.getByTestId("basis")).toContainText(/Series J(?![A-Za-z])/);
  498 |   await expect(card.getByTestId("nav-inception")).toHaveText("Oct 5, 2021");
  499 |   for (const p of ["1 year", "3 years", "Since inception"])
  500 |     await expect(rows.filter({ hasText: p }).locator("td").nth(1)).toHaveText(/^[−-]?\d+\.\d{2}%$/);
  501 |   await expect(page.getByTestId("overview-returns")).not.toContainText("—");
  502 |   await openTab(page, "performance");
  503 |   await expect(page.getByTestId("perf-inception")).toContainText("Series inception: October 5, 2021");
  504 |   await page.getByTestId("heatmap").scrollIntoViewIfNeeded();
  505 |   const years = page.getByTestId("heatmap").locator("tbody th.y");
  506 |   await expect(years.first()).toBeVisible();
  507 |   const shown = await years.allInnerTexts();
  508 |   for (const y of ["2022", "2023", "2024"]) expect(shown).toContain(y);
  509 |   // class F: a series with 12 months and no withheld month: every figure it has the history for
  510 |   await openTab(page, "overview");
  511 |   await card.getByTestId("series-LDM081").click();
  512 |   await expect(rows.filter({ hasText: "Since inception" }).locator("td").nth(1)).toHaveText(/^[−-]?\d+\.\d{2}%$/);
  513 |   // its first month is partial (from Mar 1, 2024): marked in the heat map; risk statistics from its first complete month
  514 |   await openTab(page, "performance");
  515 |   await page.getByTestId("heatmap").scrollIntoViewIfNeeded();
  516 |   await expect(page.getByTestId("heat-partial")).toHaveCount(1);
  517 |   await page.getByTestId("risk").scrollIntoViewIfNeeded();
  518 |   await expect(page.getByTestId("risk-window")).toHaveText("From Apr 2024");
  519 |   await openTab(page, "overview");
  520 |   // the track-record series (FP): its since-inception figure names the track-record start, never a series inception
```