# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> fee basis stated everywhere a return is shown: net for the funds, gross for Global Minimum Volatility (EN + FR)
- Location: e2e/fund.spec.ts:920:5

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('perf-context')
Expected substring: "gross of fees"
Received string:    "Rendements présentés : avant déduction des frais · comptes gérés, pas un fonds · au 31 août 2026 · volatilité à la baisse de 6 %"
Timeout: 10000ms

Call log:
  - Expect "toContainText" getByTestId('perf-context') with timeout 10000ms
  - waiting for getByTestId('perf-context')
    23 × locator resolved to <p class="fp-context" data-testid="perf-context">…</p>
       - unexpected value "Rendements présentés : avant déduction des frais · comptes gérés, pas un fonds · au 31 août 2026 · volatilité à la baisse de 6 %"

```

```yaml
- paragraph: "Rendements présentés : avant déduction des frais · comptes gérés, pas un fonds · au 31 août 2026 · volatilité à la baisse de 6 %"
```

# Test source

```ts
  837 | const CLASS_OF: Record<string, { visit: string[]; letters: string[] }> = {
  838 |   "monthly-income": { visit: ["LDM081", "LDM001"], letters: ["F", "FP"] },
  839 |   "sustainable-enhanced-bonds": { visit: ["LDM201", "LDM202"], letters: ["F", "H"] },
  840 |   "multi-strategy": { visit: ["LDM301"], letters: ["F"] },
  841 | };
  842 | const classLetter = (slug: string, fs: string): string =>
  843 |   SAMPLE.funds[slug].performanceByClass![fs].performance!.returnClass!;
  844 | /** "Series F" but not "Series FP" (and the other way round) */
  845 | const seriesRe = (word: string, code: string): RegExp => new RegExp(`${word} ${code}(?![A-Za-z])`);
  846 | 
  847 | for (const slug of Object.keys(CLASS_OF)) {
  848 |   test(`performance class label follows the data's class everywhere (EN + FR): ${slug}`, async ({ page }) => {
  849 |     expect(SAMPLE.funds[slug].defaultClass).toBe(CLASS_OF[slug].visit[0]);
  850 |     for (const [lang, word, fund, net] of [
  851 |       ["en", "Series", "Fund", "net of fees"],
  852 |       ["fr", "Série", "Fonds", "après déduction des frais"],
  853 |     ] as const) {
  854 |       await page.goto(`/strategies/${slug}`);
  855 |       if (lang === "fr") {
  856 |         await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  857 |         await page.reload();
  858 |       }
  859 |       for (const [i, fs] of CLASS_OF[slug].visit.entries()) {
  860 |         const code = classLetter(slug, fs);
  861 |         const others = CLASS_OF[slug].letters.filter((c) => c !== code);
  862 |         if (i > 0) {
  863 |           await openTab(page, "overview");
  864 |           await page.getByTestId("nav-card").getByTestId(`series-${fs}`).click();
  865 |         }
  866 |         const exact = seriesRe(word, code);
  867 |         // header return badges, overview returns, disclosures: this class, never another class of the fund
  868 |         for (const tid of ["basis", "overview-returns", "perf-class"]) {
  869 |           await expect(page.getByTestId(tid)).toContainText(exact);
  870 |           for (const o of others) await expect(page.getByTestId(tid)).not.toContainText(seriesRe(word, o));
  871 |         }
  872 |         // performance tab context line and growth chart legend
  873 |         await openTab(page, "performance");
  874 |         await expect(page.getByTestId("perf-context")).toContainText(exact);
  875 |         for (const o of others) await expect(page.getByTestId("perf-context")).not.toContainText(seriesRe(word, o));
  876 |         await page.getByTestId("growth").scrollIntoViewIfNeeded();
  877 |         await expect(page.getByTestId("growth").locator(".fx-legend").first()).toContainText(
  878 |           `${fund} (${word} ${code}, ${net})`,
  879 |         );
  880 |       }
  881 |       if (slug === "sustainable-enhanced-bonds") {
  882 |         // the NAV card is the register's class of the series selected, whatever the class of the returns
  883 |         await openTab(page, "overview");
  884 |         await expect(page.getByTestId("nav-fundserv")).toHaveText("LDM202");
  885 |       }
  886 |     }
  887 |   });
  888 | }
  889 | 
  890 | test("home tiles and the strategies index name the class of the returns (EN + FR)", async ({ page }) => {
  891 |   // the French label has a no-break space before « : » (matched as \s)
  892 |   for (const [lang, returns] of [
  893 |     ["en", "Returns: Series"],
  894 |     ["fr", "Rendements\\s:\\sSérie"],
  895 |   ] as const) {
  896 |     const label = (code: string): RegExp => new RegExp(`^${returns} ${code}$`);
  897 |     for (const p of ["/", "/strategies"]) {
  898 |       await page.goto(p);
  899 |       if (lang === "fr") {
  900 |         await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  901 |         await page.reload();
  902 |       }
  903 |       for (const slug of Object.keys(CLASS_OF)) {
  904 |         const cls = page.getByTestId(`strategy-${slug}`).getByTestId("perf-class");
  905 |         // the tile shows the default class's own returns (F for every fund)
  906 |         await expect(cls).toHaveText(label(classLetter(slug, SAMPLE.funds[slug].defaultClass!)));
  907 |       }
  908 |       // a strategy without classes (GMV) shows none
  909 |       await expect(page.getByTestId("strategy-global-minimum-volatility").getByTestId("perf-class")).toHaveCount(0);
  910 |     }
  911 |     // the comparison table: every fund with a class, in registry order
  912 |     const cells = page.getByTestId("compare-table").getByTestId("perf-class");
  913 |     const shown = Object.keys(CLASS_OF);
  914 |     await expect(cells).toHaveCount(shown.length);
  915 |     for (const [i, slug] of shown.entries())
  916 |       await expect(cells.nth(i)).toHaveText(label(classLetter(slug, SAMPLE.funds[slug].defaultClass!)));
  917 |   }
  918 | });
  919 | 
  920 | test("fee basis stated everywhere a return is shown: net for the funds, gross for Global Minimum Volatility (EN + FR)", async ({
  921 |   page,
  922 | }) => {
  923 |   for (const [slug, en, fr] of [
  924 |     ["sustainable-enhanced-bonds", "net of fees", "après déduction des frais"],
  925 |     ["global-minimum-volatility", "gross of fees", "avant déduction des frais"],
  926 |   ] as const) {
  927 |     for (const [lang, text] of [
  928 |       ["en", en],
  929 |       ["fr", fr],
  930 |     ] as const) {
  931 |       await page.goto(`/strategies/${slug}`);
  932 |       if (lang === "fr") {
  933 |         await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  934 |         await page.reload();
  935 |       }
  936 |       await openTab(page, "performance");
> 937 |       await expect(page.getByTestId("perf-context")).toContainText(text);
      |                                                      ^ Error: expect(locator).toContainText(expected) failed
  938 |       await expect(page.getByTestId("trailing-table").locator("thead")).toContainText(text);
  939 |       if (await page.getByTestId("calendar-table").count())
  940 |         await expect(page.getByTestId("calendar-table").locator("thead")).toContainText(text);
  941 |     }
  942 |   }
  943 |   // the comparison table: every figure carries its basis marker
  944 |   await page.context().clearCookies();
  945 |   await page.goto("/strategies");
  946 |   await expect(page.getByTestId("net-marker").first()).toBeAttached();
  947 |   await expect(page.getByTestId("gross-marker").first()).toBeAttached();
  948 |   await expect(page.getByTestId("net-marker").first()).toHaveAttribute("title", "net of fees");
  949 | });
  950 | 
```