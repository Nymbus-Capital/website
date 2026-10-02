# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> awards and rankings: Fund Library rank and quartile with source and as-at date; Morningstar 5 stars on the bond funds only
- Location: e2e/fund.spec.ts:385:5

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('[role="tabpanel"][data-panel="awards"]').getByTestId('morningstar')
Expected substring: "Class F"
Received string:    "Morningstar ratingMorningstarAs at October 1, 2026 Series FSource: Morningstar (opens in a new tab)"
Timeout: 10000ms

Call log:
  - Expect "toContainText" locator('[role="tabpanel"][data-panel="awards"]').getByTestId('morningstar') with timeout 10000ms
  - waiting for locator('[role="tabpanel"][data-panel="awards"]').getByTestId('morningstar')
    23 × locator resolved to <div data-reveal="" class="fxb fxb-card " data-testid="morningstar">…</div>
       - unexpected value "Morningstar ratingMorningstarAs at October 1, 2026 Series FSource: Morningstar (opens in a new tab)"

```

```yaml
- heading "Morningstar rating" [level=3]
- text: Morningstar
- paragraph: As at October 1, 2026
- paragraph:
  - img "5 out of 5 stars"
  - strong: Series F
- paragraph:
  - text: "Source:"
  - link "Morningstar (opens in a new tab)":
    - /url: https://global.morningstar.com/en-ca/investments/funds/0P0001ROZG/quote
```

# Test source

```ts
  296 |   // decimal comma and a no-break space before % / $
  297 |   await expect(page.getByTestId("badge-SI").locator(".fr-v")).toHaveText(/^[+−]?\d+,\d{2}\s%$/);
  298 |   await expect(page.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^\d+,\d{4}\s\$$/);
  299 |   await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="portfolio"]').click();
  300 |   await expect(page.getByTestId("portfolio-source")).toContainText("Données quotidiennes du portefeuille");
  301 |   await expect(page.getByTestId("portfolio-asof")).toHaveText("au 28 septembre 2026");
  302 |   await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="distributions"]').click();
  303 |   await expect(page.getByTestId("dist-class-LDM001").getByTestId("dist-last-amount")).toHaveText(/^0,\d{6}\s\$$/);
  304 |   await expect(page.getByTestId("provenance")).toContainText("données de portefeuille selon les positions quotidiennes au 28 septembre 2026");
  305 | });
  306 | 
  307 | /* ------------------------------------------------------------------ classes, variants, awards, calendar labels */
  308 | 
  309 | test("class selector: returns follow the class; F is the default; a class without its own series says coming soon", async ({ page }) => {
  310 |   await page.goto("/strategies/sustainable-enhanced-bonds");
  311 |   const card = page.getByTestId("nav-card");
  312 |   const strip = page.getByTestId("return-strip");
  313 |   await expect(card.getByTestId("series-LDM201")).toHaveAttribute("aria-checked", "true");
  314 |   await expect(page.getByTestId("basis")).toContainText("Series F");
  315 |   const f = await strip.getByTestId("badge-SI").locator(".fr-v").innerText();
  316 |   await card.getByTestId("series-LDM202").click();
  317 |   await expect(page.getByTestId("basis")).toContainText("Series H");
  318 |   const h = await strip.getByTestId("badge-SI").locator(".fr-v").innerText();
  319 |   expect(h, "class H shows its own returns").not.toBe(f);
  320 |   // a class that has no series of its own: no figure at all, never F's
  321 |   await card.getByTestId("series-LDM205").click();
  322 |   await expect(strip.getByTestId("figures-soon")).toContainText("series A coming soon");
  323 |   await expect(strip.getByTestId("badge-SI")).toHaveCount(0);
  324 |   await openTab(page, "performance");
  325 |   await expect(page.getByTestId("perf-soon")).toContainText("series A coming soon");
  326 |   await expect(page.getByTestId("growth")).toHaveCount(0);
  327 |   await expect(page.getByTestId("calendar")).toHaveCount(0);
  328 |   await expect(page.getByTestId("risk")).toHaveCount(0);
  329 |   // back to F: everything returns
  330 |   await card.getByTestId("series-LDM201").click();
  331 |   await expect(page.getByTestId("calendar")).toBeVisible();
  332 |   await expect(page.getByTestId("risk")).toBeVisible();
  333 | });
  334 | 
  335 | test("class types: only classes whose type is known are labelled, with a disclosure sentence", async ({ page }) => {
  336 |   await page.goto("/strategies/monthly-income");
  337 |   const card = page.getByTestId("nav-card");
  338 |   await expect(card.getByTestId("class-type")).toHaveText("Prospectus class");
  339 |   await expect(card.getByTestId("class-type-note")).toContainText("simplified prospectus");
  340 |   await card.getByTestId("series-LDM001").click();
  341 |   await expect(card.getByTestId("class-type")).toHaveText("Offering memorandum class");
  342 |   await expect(card.getByTestId("class-type-note")).toContainText("offering memorandum");
  343 |   await expect(page.getByTestId("returns-class-type")).toHaveText("Offering memorandum class");
  344 |   // unknown type: nothing is said
  345 |   await card.getByTestId("series-LDM021").click();
  346 |   await expect(card.getByTestId("class-type")).toHaveCount(0);
  347 |   await expect(card.getByTestId("class-type-note")).toHaveCount(0);
  348 |   // the class table: the badge on the two classes whose type is known, none elsewhere
  349 |   await expect(page.getByTestId("class-type-LDM081")).toHaveText("Prospectus class");
  350 |   await expect(page.getByTestId("class-type-LDM001")).toHaveText("Offering memorandum class");
  351 |   await expect(page.getByTestId("class-type-LDM021")).toHaveCount(0);
  352 |   // SEB: no class has a known type yet: no label, no column
  353 |   await page.goto("/strategies/sustainable-enhanced-bonds");
  354 |   await expect(page.getByTestId("class-type")).toHaveCount(0);
  355 |   await expect(page.getByTestId("classes-table").locator("thead")).not.toContainText("Offered under");
  356 | });
  357 | 
  358 | test("Global Minimum Volatility: 3 / 6 / 9 % variants, default 6, no class selector, no NAV, no distributions", async ({ page }) => {
  359 |   await page.goto("/strategies/global-minimum-volatility");
  360 |   const sel = page.getByTestId("variant-selector");
  361 |   await expect(sel.getByTestId("variant-6")).toHaveAttribute("aria-checked", "true");
  362 |   await expect(sel.locator('[role="radio"]')).toHaveCount(3);
  363 |   await expect(page.getByTestId("nav-card")).toHaveCount(0);
  364 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="distributions"]')).toHaveCount(0);
  365 |   const read = async () => page.getByTestId("return-strip").getByTestId("badge-SI").locator(".fr-v").innerText();
  366 |   // the value counts up: wait until it is non-zero and stable
  367 |   const si = async () => {
  368 |     let last = "";
  369 |     await expect.poll(async () => { const v = await read(); const ok = v === last && !/^[+-]?0[.,]00/.test(v); last = v; return ok; }, { intervals: [300] }).toBe(true);
  370 |     return last;
  371 |   };
  372 |   const six = await si();
  373 |   await sel.getByTestId("variant-3").click();
  374 |   const three = await si();
  375 |   await sel.getByTestId("variant-9").click();
  376 |   const nine = await si();
  377 |   expect(new Set([six, three, nine]).size, "each variant has its own returns").toBe(3);
  378 |   await expect(page.getByTestId("basis")).toContainText("Target downside volatility 9%");
  379 |   await openTab(page, "performance");
  380 |   await expect(page.getByTestId("perf-context")).toContainText("9%");
  381 |   await sel.getByTestId("variant-6").click();
  382 |   expect(await si()).toBe(six);
  383 | });
  384 | 
  385 | test("awards and rankings: Fund Library rank and quartile with source and as-at date; Morningstar 5 stars on the bond funds only", async ({ page }) => {
  386 |   await page.goto("/strategies/sustainable-enhanced-bonds#awards");
  387 |   const tab = page.locator('[role="tabpanel"][data-panel="awards"]');
  388 |   await expect(tab).toBeVisible();
  389 |   await expect(tab.getByTestId("ranking-LDM201")).toContainText("Canadian Fixed Income");
  390 |   await expect(tab.getByTestId("ranking-LDM201")).toContainText("August 31, 2026");
  391 |   await expect(tab.getByTestId("rank-1Y")).toContainText("1 of 465");
  392 |   await expect(tab.getByTestId("rank-1M")).toContainText("4 of 486");
  393 |   await expect(tab.getByTestId("fundgrade")).toContainText("A");
  394 |   await expect(tab.getByTestId("ranking-LDM201").getByRole("link", { name: /Fund Library/ })).toHaveAttribute("href", /^https:\/\/www\.fundlibrary\.com\//);
  395 |   await expect(tab.getByTestId("morningstar")).toBeVisible();
> 396 |   await expect(tab.getByTestId("morningstar")).toContainText("Class F");
      |                                                ^ Error: expect(locator).toContainText(expected) failed
  397 |   await expect(tab.getByTestId("awards-note")).toContainText("not guarantees");
  398 |   // no third-party logo images: wordmarks are text
  399 |   await expect(tab.locator("img")).toHaveCount(0);
  400 |   // the CIFSC category line of the facts comes from the ranking category
  401 |   await openTab(page, "overview");
  402 |   await expect(page.getByTestId("fund-facts")).toContainText("Canadian Fixed Income");
  403 |   // multi-strategy: a quartile 4 is shown as it is
  404 |   await page.goto("/strategies/multi-strategy#awards");
  405 |   await expect(page.getByTestId("rank-1M")).toContainText("127 of 144");
  406 |   await expect(page.getByTestId("rank-1M").locator(".aw-q")).toHaveText("Q4");
  407 |   await expect(page.getByTestId("morningstar")).toHaveCount(0);
  408 |   // GMV: no ranking, no tab
  409 |   await page.goto("/strategies/global-minimum-volatility");
  410 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="awards"]')).toHaveCount(0);
  411 | });
  412 | 
  413 | test("calendar-year chart: a value label on every bar, none overlapping, no horizontal page scroll", async ({ page }) => {
  414 |   await page.goto("/strategies/global-minimum-volatility#performance");
  415 |   const chart = page.getByTestId("calendar");
  416 |   await chart.scrollIntoViewIfNeeded();
  417 |   const cats = chart.locator("svg .cat");
  418 |   await expect(cats.first()).toBeVisible();
  419 |   const n = await cats.count();
  420 |   expect(n).toBeGreaterThan(8);
  421 |   const labels = chart.locator("svg text.vl");
  422 |   await expect(labels).toHaveCount(n);
  423 |   // each label sits above its bar (below a negative one) and the labels do not overlap each other
  424 |   const boxes = await labels.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, text: e.textContent }; }));
  425 |   for (const b of boxes) expect(b.text).toMatch(/^[+−-]?\d+\.\d%$/);
  426 |   const sorted = [...boxes].sort((a, b) => a.l - b.l);
  427 |   for (let i = 1; i < sorted.length; i++) expect(sorted[i].l, `labels ${sorted[i - 1].text} / ${sorted[i].text}`).toBeGreaterThanOrEqual(sorted[i - 1].r - 0.5);
  428 |   // the bars of the chart stay inside the card (it scrolls sideways when narrow), the page never does
  429 |   const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  430 |   expect(overflow).toBeLessThanOrEqual(1);
  431 |   // accessible: every category keeps its text alternative with the value
  432 |   await expect(cats.first()).toHaveAttribute("aria-label", /\d/);
  433 |   // roving tabindex: a single category in the tab order
  434 |   await expect(chart.locator('svg .cat[tabindex="0"]')).toHaveCount(1);
  435 | });
  436 | 
  437 | /**
  438 |  * Performance class label (Gabriel 2026-10-01: the label must match the class of the data). The expected label is
  439 |  * read from the class code of the sample's own data (`performance.classCode`), never assumed: the sample is built as
  440 |  * if the dataplatform served SEB class F (PR #626); the class H rendering (what production shows before that) is
  441 |  * covered by the admin test that pins SEB to a class H run (admin.spec.ts). The NAV card keeps the register's own
  442 |  * series (LDM201 = F), independent of the returns' class.
  443 |  */
  444 | const SAMPLE = JSON.parse(readFileSync("src/lib/data/sample-site-data.json", "utf8")) as { funds: Record<string, { performance: { classCode?: string; returnClass?: string } | null }> };
  445 | const CLASS_OF: Record<string, Record<string, string>> = {
  446 |   "monthly-income": { STRATEGY: "FP" },
  447 |   "sustainable-enhanced-bonds": { STRATEGY: "F", STRATEGY_H: "H" },
  448 |   "multi-strategy": { STRATEGY: "F" },
  449 | };
  450 | const NO_HEADLINE_SERIES = new Set(["monthly-income"]);
  451 | const codeOf = (slug: string): string => CLASS_OF[slug][SAMPLE.funds[slug].performance!.classCode!];
  452 | /** "Series F" but not "Series FP" (and the other way round) */
  453 | const seriesRe = (word: string, code: string): RegExp => new RegExp(`${word} ${code}(?![A-Za-z])`);
  454 | 
  455 | for (const slug of Object.keys(CLASS_OF)) {
  456 |   test(`performance class label follows the data's class everywhere (EN + FR): ${slug}`, async ({ page }) => {
  457 |     const perf = SAMPLE.funds[slug].performance!;
  458 |     const code = codeOf(slug);
  459 |     expect(code, `class ${perf.classCode} has a label`).toBeTruthy();
  460 |     expect(perf.returnClass).toBe(code);
  461 |     const others = Object.values(CLASS_OF[slug]).filter((c) => c !== code);
  462 |     for (const [lang, word, fund] of [["en", "Series", "Fund"], ["fr", "Série", "Fonds"]] as const) {
  463 |       await page.goto(`/strategies/${slug}`);
  464 |       if (lang === "fr") {
  465 |         await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  466 |         await page.reload();
  467 |       }
  468 |       // Monthly Income opens on class F (LDM081), which has no series yet: its returns are the FP class (LDM001)
  469 |       if (slug === "monthly-income") await page.getByTestId("nav-card").getByTestId("series-LDM001").click();
  470 |       const exact = seriesRe(word, code);
  471 |       // header return badges, overview returns, disclosures: this class, never another class of the fund
  472 |       for (const tid of ["basis", "overview-returns", "perf-class"]) {
  473 |         await expect(page.getByTestId(tid)).toContainText(exact);
  474 |         for (const o of others) await expect(page.getByTestId(tid)).not.toContainText(seriesRe(word, o));
  475 |       }
  476 |       // performance tab context line and growth chart legend
  477 |       await openTab(page, "performance");
  478 |       await expect(page.getByTestId("perf-context")).toContainText(exact);
  479 |       for (const o of others) await expect(page.getByTestId("perf-context")).not.toContainText(seriesRe(word, o));
  480 |       await page.getByTestId("growth").scrollIntoViewIfNeeded();
  481 |       await expect(page.getByTestId("growth").locator(".fx-legend").first()).toContainText(`${fund} (${word} ${code})`);
  482 |       if (slug === "sustainable-enhanced-bonds") {
  483 |         // the NAV card is the register's class LDM201 (F) whatever the class of the returns
  484 |         await openTab(page, "overview");
  485 |         await expect(page.getByTestId("nav-fundserv")).toHaveText("LDM201");
  486 |       }
  487 |     }
  488 |   });
  489 | }
  490 | 
  491 | test("home tiles and the strategies index name the class of the returns (EN + FR)", async ({ page }) => {
  492 |   // the French label has a no-break space before « : » (matched as \s)
  493 |   for (const [lang, returns] of [["en", "Returns: Series"], ["fr", "Rendements\\s:\\sSérie"]] as const) {
  494 |     const label = (code: string): RegExp => new RegExp(`^${returns} ${code}$`);
  495 |     for (const p of ["/", "/strategies"]) {
  496 |       await page.goto(p);
```