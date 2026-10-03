# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> performance class label follows the data's class everywhere (EN + FR): sustainable-enhanced-bonds
- Location: e2e/fund.spec.ts:488:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('basis')
Expected pattern: /Series H(?![A-Za-z])/
Received string:  "Series F, net of fees · as of August 31, 2026 "
Timeout: 10000ms

Call log:
  - Expect "toContainText" getByTestId('basis') with timeout 10000ms
  - waiting for getByTestId('basis')
    24 × locator resolved to <p class="fr-sub" data-testid="basis">…</p>
       - unexpected value "Series F, net of fees · as of August 31, 2026 "

```

```yaml
- paragraph: Series F, net of fees · as of August 31, 2026
```

# Test source

```ts
  405 |     await page.goto("/strategies");
  406 |     await expect(page.getByTestId("strategy-global-minimum-volatility").getByTestId("perf-variant")).toHaveText(name);
  407 |     await expect(page.getByTestId("compare-table").getByTestId("perf-variant")).toHaveCount(1);
  408 |     await expect(page.getByTestId("compare-table").getByTestId("perf-variant")).toHaveText(name);
  409 |     await page.goto("/solutions");
  410 |     await expect(page.getByTestId("solution-variant-global-minimum-volatility").first()).toHaveText(name);
  411 |     await page.goto("/strategies/global-minimum-volatility");
  412 |     await expect(page.getByTestId("basis").getByTestId("variant-name")).toHaveText(name);
  413 |     await expect(page.getByTestId("disclosure-variant")).toHaveText(name);
  414 |   }
  415 | });
  416 | 
  417 | test("awards and rankings: Fund Library rank and quartile with source and as-at date; Morningstar 5 stars on the bond funds only", async ({ page }) => {
  418 |   await page.goto("/strategies/sustainable-enhanced-bonds#awards");
  419 |   const tab = page.locator('[role="tabpanel"][data-panel="awards"]');
  420 |   await expect(tab).toBeVisible();
  421 |   await expect(tab.getByTestId("ranking-LDM201")).toContainText("Canadian Fixed Income");
  422 |   await expect(tab.getByTestId("ranking-LDM201")).toContainText("August 31, 2026");
  423 |   await expect(tab.getByTestId("rank-1Y")).toContainText("1 of 465");
  424 |   await expect(tab.getByTestId("rank-1M")).toContainText("4 of 486");
  425 |   await expect(tab.getByTestId("fundgrade")).toContainText("A");
  426 |   await expect(tab.getByTestId("ranking-LDM201").getByRole("link", { name: /Fund Library/ })).toHaveAttribute("href", /^https:\/\/www\.fundlibrary\.com\//);
  427 |   await expect(tab.getByTestId("morningstar")).toBeVisible();
  428 |   await expect(tab.getByTestId("morningstar")).toContainText("Series F");
  429 |   await expect(tab.getByTestId("awards-note")).toContainText("not guarantees");
  430 |   // no third-party logo images: wordmarks are text
  431 |   await expect(tab.locator("img")).toHaveCount(0);
  432 |   // the CIFSC category line of the facts comes from the ranking category
  433 |   await openTab(page, "overview");
  434 |   await expect(page.getByTestId("fund-facts")).toContainText("Canadian Fixed Income");
  435 |   // multi-strategy: a quartile 4 is shown as it is
  436 |   await page.goto("/strategies/multi-strategy#awards");
  437 |   await expect(page.getByTestId("rank-1M")).toContainText("127 of 144");
  438 |   await expect(page.getByTestId("rank-1M").locator(".aw-q")).toHaveText("Q4");
  439 |   await expect(page.getByTestId("morningstar")).toHaveCount(0);
  440 |   // GMV: no ranking, no tab
  441 |   await page.goto("/strategies/global-minimum-volatility");
  442 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="awards"]')).toHaveCount(0);
  443 | });
  444 | 
  445 | test("calendar-year chart: a value label on every bar, none overlapping, no horizontal page scroll", async ({ page }) => {
  446 |   await page.goto("/strategies/global-minimum-volatility#performance");
  447 |   const chart = page.getByTestId("calendar");
  448 |   await chart.scrollIntoViewIfNeeded();
  449 |   const cats = chart.locator("svg .cat");
  450 |   await expect(cats.first()).toBeVisible();
  451 |   const n = await cats.count();
  452 |   expect(n).toBeGreaterThan(8);
  453 |   const labels = chart.locator("svg text.vl");
  454 |   await expect(labels).toHaveCount(n);
  455 |   // each label sits above its bar (below a negative one) and the labels do not overlap each other
  456 |   const boxes = await labels.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, text: e.textContent }; }));
  457 |   for (const b of boxes) expect(b.text).toMatch(/^[+−-]?\d+\.\d%$/);
  458 |   const sorted = [...boxes].sort((a, b) => a.l - b.l);
  459 |   for (let i = 1; i < sorted.length; i++) expect(sorted[i].l, `labels ${sorted[i - 1].text} / ${sorted[i].text}`).toBeGreaterThanOrEqual(sorted[i - 1].r - 0.5);
  460 |   // the bars of the chart stay inside the card (it scrolls sideways when narrow), the page never does
  461 |   const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  462 |   expect(overflow).toBeLessThanOrEqual(1);
  463 |   // accessible: every category keeps its text alternative with the value
  464 |   await expect(cats.first()).toHaveAttribute("aria-label", /\d/);
  465 |   // roving tabindex: a single category in the tab order
  466 |   await expect(chart.locator('svg .cat[tabindex="0"]')).toHaveCount(1);
  467 | });
  468 | 
  469 | /**
  470 |  * Performance class label (Gabriel 2026-10-01: the label must match the class of the data). The expected label is
  471 |  * read from the class code of the sample's own data (`performance.classCode`), never assumed: the sample is built as
  472 |  * if the dataplatform served SEB class F (PR #626); the class H rendering (what production shows before that) is
  473 |  * covered by the admin test that pins SEB to a class H run (admin.spec.ts). The NAV card keeps the register's own
  474 |  * series (LDM201 = F), independent of the returns' class.
  475 |  */
  476 | const SAMPLE = JSON.parse(readFileSync("src/lib/data/sample-site-data.json", "utf8")) as { funds: Record<string, { performance: { classCode?: string; returnClass?: string } | null }> };
  477 | const CLASS_OF: Record<string, Record<string, string>> = {
  478 |   "monthly-income": { STRATEGY: "FP" },
  479 |   "sustainable-enhanced-bonds": { STRATEGY: "F", STRATEGY_H: "H" },
  480 |   "multi-strategy": { STRATEGY: "F" },
  481 | };
  482 | const NO_HEADLINE_SERIES = new Set(["monthly-income"]);
  483 | const codeOf = (slug: string): string => CLASS_OF[slug][SAMPLE.funds[slug].performance!.classCode!];
  484 | /** "Series F" but not "Series FP" (and the other way round) */
  485 | const seriesRe = (word: string, code: string): RegExp => new RegExp(`${word} ${code}(?![A-Za-z])`);
  486 | 
  487 | for (const slug of Object.keys(CLASS_OF)) {
  488 |   test(`performance class label follows the data's class everywhere (EN + FR): ${slug}`, async ({ page }) => {
  489 |     const perf = SAMPLE.funds[slug].performance!;
  490 |     const code = codeOf(slug);
  491 |     expect(code, `class ${perf.classCode} has a label`).toBeTruthy();
  492 |     expect(perf.returnClass).toBe(code);
  493 |     const others = Object.values(CLASS_OF[slug]).filter((c) => c !== code);
  494 |     for (const [lang, word, fund] of [["en", "Series", "Fund"], ["fr", "Série", "Fonds"]] as const) {
  495 |       await page.goto(`/strategies/${slug}`);
  496 |       if (lang === "fr") {
  497 |         await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  498 |         await page.reload();
  499 |       }
  500 |       // Monthly Income opens on class F (LDM081), which has no series yet: its returns are the FP class (LDM001)
  501 |       if (slug === "monthly-income") await page.getByTestId("nav-card").getByTestId("series-LDM001").click();
  502 |       const exact = seriesRe(word, code);
  503 |       // header return badges, overview returns, disclosures: this class, never another class of the fund
  504 |       for (const tid of ["basis", "overview-returns", "perf-class"]) {
> 505 |         await expect(page.getByTestId(tid)).toContainText(exact);
      |                                             ^ Error: expect(locator).toContainText(expected) failed
  506 |         for (const o of others) await expect(page.getByTestId(tid)).not.toContainText(seriesRe(word, o));
  507 |       }
  508 |       // performance tab context line and growth chart legend
  509 |       await openTab(page, "performance");
  510 |       await expect(page.getByTestId("perf-context")).toContainText(exact);
  511 |       for (const o of others) await expect(page.getByTestId("perf-context")).not.toContainText(seriesRe(word, o));
  512 |       await page.getByTestId("growth").scrollIntoViewIfNeeded();
  513 |       await expect(page.getByTestId("growth").locator(".fx-legend").first()).toContainText(`${fund} (${word} ${code})`);
  514 |       if (slug === "sustainable-enhanced-bonds") {
  515 |         // the NAV card is the register's class LDM201 (F) whatever the class of the returns
  516 |         await openTab(page, "overview");
  517 |         await expect(page.getByTestId("nav-fundserv")).toHaveText("LDM201");
  518 |       }
  519 |     }
  520 |   });
  521 | }
  522 | 
  523 | test("home tiles and the strategies index name the class of the returns (EN + FR)", async ({ page }) => {
  524 |   // the French label has a no-break space before « : » (matched as \s)
  525 |   for (const [lang, returns] of [["en", "Returns: Series"], ["fr", "Rendements\\s:\\sSérie"]] as const) {
  526 |     const label = (code: string): RegExp => new RegExp(`^${returns} ${code}$`);
  527 |     for (const p of ["/", "/strategies"]) {
  528 |       await page.goto(p);
  529 |       if (lang === "fr") {
  530 |         await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  531 |         await page.reload();
  532 |       }
  533 |       for (const slug of Object.keys(CLASS_OF)) {
  534 |         const cls = page.getByTestId(`strategy-${slug}`).getByTestId("perf-class");
  535 |         // the tile shows the headline class's own returns only: none while that class has no series (Monthly Income F)
  536 |         if (NO_HEADLINE_SERIES.has(slug)) await expect(cls).toHaveCount(0);
  537 |         else await expect(cls).toHaveText(label(codeOf(slug)));
  538 |       }
  539 |       // a strategy without classes (GMV) shows none
  540 |       await expect(page.getByTestId("strategy-global-minimum-volatility").getByTestId("perf-class")).toHaveCount(0);
  541 |     }
  542 |     // the comparison table: every fund with a class, in registry order
  543 |     const cells = page.getByTestId("compare-table").getByTestId("perf-class");
  544 |     const shown = Object.keys(CLASS_OF).filter((k) => !NO_HEADLINE_SERIES.has(k));
  545 |     await expect(cells).toHaveCount(shown.length);
  546 |     for (const [i, slug] of shown.entries()) await expect(cells.nth(i)).toHaveText(label(codeOf(slug)));
  547 |   }
  548 | });
  549 | 
```