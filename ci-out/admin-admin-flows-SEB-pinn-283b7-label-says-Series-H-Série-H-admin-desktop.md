# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> admin flows >> SEB pinned to a class H run: F opens as coming soon; with class H selected every performance label says Series H / Série H
- Location: e2e/admin.spec.ts:383:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('figures-soon')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('figures-soon') with timeout 10000ms
  - waiting for getByTestId('figures-soon')

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
      - listitem: Sustainable Enhanced Bonds
  - paragraph: Core fixed income
  - heading "Nymbus Sustainable Enhanced Bonds Fund" [level=1]
  - paragraph: Canadian core bonds, managed systematically
  - paragraph: A core Canadian bond portfolio built systematically, integrating sustainability criteria in bond selection, with a futures overlay designed to have low correlation with bonds and to offset part of bond losses; it may not do so and can lose money.
  - text: Mutual fund Risk Low Sample data
  - link "Contact us":
    - /url: /contact
  - link "Fund documents":
    - /url: "#documents"
  - text: Net asset value per unit As of Sep 28, 2026
  - radiogroup "Choose a series":
    - radio "Series F" [checked]
    - radio "Series H"
    - radio "Series A"
    - radio "Series FP"
  - text: $9.5816
  - paragraph: −0.0083 (−0.09%) vs previous valuation day
  - term: Series
  - definition: F
  - term: FundServ
  - definition:
    - code: LDM201
  - term: Currency
  - definition: CAD
  - term: Track record since
  - definition: August 2023
  - term: Benchmark
  - definition: FTSE Canada Universe Bond Index
  - region "Returns":
    - heading "Returns" [level=2]
    - paragraph: Series F, net of fees · as of August 31, 2026
    - list:
      - listitem: 1 month −0.91%
      - listitem: 3 months −0.47%
      - listitem: Year to date −3.77%
      - listitem: 1 year −2.62%
      - listitem: 3 years +2.24%
      - listitem: Since inception +2.68%
    - paragraph: "* Periods over one year are annualized."
  - tablist "Fund information":
    - tab "Overview" [selected]
    - tab "Performance"
    - tab "Portfolio"
    - tab "Distributions"
    - tab "Awards and rankings"
    - tab "Documents"
  - tabpanel "Overview":
    - heading "Overview" [level=2]
    - heading "What the fund does" [level=3]
    - paragraph: Core Canadian bonds, managed systematically, with sustainability criteria.
    - heading "Investment approach" [level=3]
    - list:
      - listitem: Federal, provincial and corporate issuers
      - listitem: Built with our quantitative models
      - listitem: ESG data weighed with credit quality and valuation
    - paragraph: The futures overlay is designed to have low correlation with bonds and to offset part of bond losses when volatility rises; it may not do so and can lose money. The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.
    - heading "Returns" [level=3]
    - link "See all performance":
      - /url: "#performance"
    - paragraph: Series F, net of fees · as of August 31, 2026
    - table "Returns":
      - caption: Returns
      - rowgroup:
        - row "Period Fund Benchmark Value added":
          - columnheader "Period"
          - columnheader "Fund"
          - columnheader "Benchmark"
          - columnheader "Value added"
      - rowgroup:
        - row "1 month −0.91% −1.00% +0.09%":
          - cell "1 month"
          - cell "−0.91%"
          - cell "−1.00%"
          - cell "+0.09%"
        - row "3 months −0.47% −0.76% +0.30%":
          - cell "3 months"
          - cell "−0.47%"
          - cell "−0.76%"
          - cell "+0.30%"
        - row "Year to date −3.77% −4.22% +0.44%":
          - cell "Year to date"
          - cell "−3.77%"
          - cell "−4.22%"
          - cell "+0.44%"
        - row "1 year −2.62% −3.11% +0.49%":
          - cell "1 year"
          - cell "−2.62%"
          - cell "−3.11%"
          - cell "+0.49%"
        - row "2 years * −0.24% −2.21% +1.97%":
          - cell "2 years *": 2 years*
          - cell "−0.24%"
          - cell "−2.21%"
          - cell "+1.97%"
        - row "3 years * 2.24% 0.70% +1.54%":
          - cell "3 years *": 3 years*
          - cell "2.24%"
          - cell "0.70%"
          - cell "+1.54%"
        - row "Since inception * 2.68% 1.21% +1.47%":
          - cell "Since inception *": Since inception*
          - cell "2.68%"
          - cell "1.21%"
          - cell "+1.47%"
    - paragraph: "* Periods over one year are annualized."
    - complementary:
      - heading "Key facts" [level=3]
      - term: Legal name
      - definition: Nymbus Sustainable Enhanced Bonds Fund
      - term: Vehicle
      - definition: Mutual fund
      - term: Asset class
      - definition: Core fixed income
      - term: Benchmark
      - definition: FTSE Canada Universe Bond Index
      - term: Track record since
      - definition: August 2023
      - term: Currency
      - definition: CAD
      - term: Series
      - definition: F, A, FP
      - term: Risk rating
      - definition: Low
      - term: Returns shown
      - definition: Net of fees
      - term: CIFSC category
      - definition: Canadian Fixed Income
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
        - row "F (Series shown in the header) LDM201 CAD $9.5816 −0.09% Sep 28, 2026":
          - cell "F (Series shown in the header)"
          - cell "LDM201":
            - code: LDM201
          - cell "CAD"
          - cell "$9.5816"
          - cell "−0.09%"
          - cell "Sep 28, 2026"
        - row "A LDM205 CAD $9.2591 — Sep 28, 2026":
          - cell "A"
          - cell "LDM205":
            - code: LDM205
          - cell "CAD"
          - cell "$9.2591"
          - cell "—"
          - cell "Sep 28, 2026"
        - row "FP LDM206 CAD $9.6982 −0.18% Sep 28, 2026":
          - cell "FP"
          - cell "LDM206":
            - code: LDM206
          - cell "CAD"
          - cell "$9.6982"
          - cell "−0.18%"
          - cell "Sep 28, 2026"
    - heading "Investment team" [level=3]
    - link "Meet the team":
      - /url: /team
    - paragraph: The fund is managed by the Nymbus Capital investment team.
  - region "Sustainability, integrated":
    - paragraph: Sustainable Enhanced Bonds Fund
    - heading "Sustainability, integrated" [level=2]
    - text: Criteria at every step of bond selection. They do not apply to the futures overlay, which holds no securities of individual issuers.
    - heading "Exclusion screens" [level=3]
    - paragraph: Issuers in conflict with the fund’s criteria are excluded.
    - heading "ESG in issuer selection" [level=3]
    - paragraph: ESG data weighed with credit and valuation, issuer by issuer.
    - heading "Green bonds" [level=3]
    - paragraph: The fund can hold bonds financing environmental projects.
    - heading "Measured every month" [level=3]
    - paragraph: Sustainability metrics such as carbon intensity, reported monthly for the portfolio and its index.
    - link "Our sustainability approach":
      - /url: /sustainability
  - region "Disclosures":
    - paragraph: Important information
    - heading "Disclosures" [level=2]
    - paragraph: The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.
    - paragraph: "Performance shown: Series F, net of fees · Benchmark: FTSE Canada Universe Bond Index"
    - paragraph: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
    - paragraph: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
    - paragraph: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
    - paragraph: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
    - paragraph: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
    - paragraph: Updated daily from Nymbus’ data platform; portfolio data from the daily holdings as of September 28, 2026; sustainability metrics from the monthly factsheet of August 2026. performance as of August 2026 · net asset values as of Sep 28, 2026.
  - heading "Interested in the fund?" [level=2]
  - paragraph: Our team can walk you through the fund, its series and how to invest.
  - link "Contact our team":
    - /url: /contact
  - link "All strategies":
    - /url: /strategies
  - region "Other strategies":
    - paragraph: Explore
    - heading "Other strategies" [level=2]
    - link "Short-term fixed income Monthly Income Monthly income from short-term corporate bonds View Nymbus Monthly Income Fund":
      - /url: /strategies/monthly-income
    - link "Alternative strategies Multi-Strategy e2e tagline View Nymbus Multi-Strategy Fund":
      - /url: /strategies/multi-strategy
    - link "Futures overlay (managed accounts) Global Minimum Volatility A futures overlay designed to have low correlation with bonds View Nymbus Global Minimum Volatility":
      - /url: /strategies/global-minimum-volatility
- contentinfo:
  - link "Nymbus Capital, home":
    - /url: /
    - img "nymbus"
  - paragraph: Montreal portfolio manager building systematic fixed income and alternative strategies.
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
  - paragraph: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
  - paragraph: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
  - paragraph: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
  - paragraph: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative. Unless another variant is selected on the strategy page, the returns shown are those of the 6% downside volatility variant; the strategy is also offered with 3% and 9% downside volatility targets, whose returns differ.
  - paragraph: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
  - text: © 2026 Nymbus Capital Inc. All rights reserved. PRI signatory
- alert
```

# Test source

```ts
  312 |     const token = await signIn(context);
  313 |     await page.goto("/admin");
  314 |     const banner = page.getByTestId("compliance-banner");
  315 |     await expect(banner).toBeVisible();
  316 |     await expect(banner.getByTestId("compliance-text-ftse")).toBeVisible();
  317 |     await shot(page, "compliance", info.project.name);
  318 |     await page.getByTestId("mark-reviewed").click();
  319 |     await page.getByRole("button", { name: "mark as reviewed", exact: true }).click();
  320 |     await expect(page.getByTestId("compliance-ok")).toBeVisible();
  321 | 
  322 |     const audit = await (await request.get("/api/admin/audit", { headers: adminHeaders(token) })).json();
  323 |     expect(audit.entries.some((e: { action: string }) => e.action === "compliance.disclaimers.reviewed")).toBe(true);
  324 | 
  325 |     // an admin override (firm disclaimer) is shown publicly and brings the banner back
  326 |     const { content } = await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json();
  327 |     const firm = { en: "E2E firm disclaimer override.", fr: "Avis de la firme E2E." };
  328 |     const put = await request.put("/api/admin/content/settings", {
  329 |       headers: adminHeaders(token),
  330 |       data: { version: content.version, firm: { aumLabel: content.firm.aumLabel, announcement: null, disclaimer: firm }, publishMode: content.pipeline.publishMode },
  331 |     });
  332 |     expect(put.status()).toBe(200);
  333 |     await page.goto("/");
  334 |     await expect(page.getByTestId("footer-disclaimers")).toContainText(firm.en);
  335 |     await page.goto("/admin");
  336 |     await expect(page.getByTestId("compliance-banner")).toContainText("changed since the last review");
  337 | 
  338 |     // restore the boilerplate (empty override)
  339 |     const after = (await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json()).content;
  340 |     await request.put("/api/admin/content/settings", {
  341 |       headers: adminHeaders(token),
  342 |       data: { version: after.version, firm: { aumLabel: after.firm.aumLabel, announcement: null, disclaimer: { en: "", fr: "" } }, publishMode: after.pipeline.publishMode },
  343 |     });
  344 | 
  345 |     // a stale hash is refused
  346 |     const stale = await request.post("/api/admin/compliance", { headers: adminHeaders(token), data: { version: after.version + 1, textsHash: "0000000000000000", confirm: true } });
  347 |     expect(stale.status()).toBe(409);
  348 |   });
  349 | 
  350 |   test("unticking 'hide aum' persists and publishes the fund AUM; ticking it again removes it from the page", async ({ page, context, request }, info) => {
  351 |     test.skip(info.project.name !== "desktop", "mutations run on the desktop project only");
  352 |     const token = await signIn(context);
  353 |     const fund = "sustainable-enhanced-bonds";
  354 |     const before = await request.get(`/strategies/${fund}`).then((r) => r.text());
  355 |     expect(before).not.toMatch(CAD_KEY);
  356 | 
  357 |     await page.goto(`/admin/funds/${fund}`);
  358 |     const aum = page.getByTestId("fund-editor").locator("label.adm-chip", { hasText: /^aum$/ }).locator("input");
  359 |     await expect(aum).toBeChecked(); // hidden by default
  360 |     await aum.uncheck({ force: true });
  361 |     await page.getByTestId("save-fund").click();
  362 |     await expect(page.locator(".adm-toast.ok")).toContainText("Saved");
  363 | 
  364 |     const { content } = await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json();
  365 |     expect(content.funds[fund].hide?.aum).toBe(false);
  366 |     const after = await request.get(`/strategies/${fund}`).then((r) => r.text());
  367 |     expect(after).toMatch(CAD_KEY);
  368 | 
  369 |     // restore (hide again)
  370 |     const put = await request.put(`/api/admin/content/funds/${fund}`, {
  371 |       headers: adminHeaders(token),
  372 |       data: { version: content.version, fund: { ...content.funds[fund], hide: { ...(content.funds[fund].hide ?? {}), aum: true } } },
  373 |     });
  374 |     expect(put.status()).toBe(200);
  375 |     expect(await request.get(`/strategies/${fund}`).then((r) => r.text())).not.toMatch(CAD_KEY);
  376 | 
  377 |     // a one-language override is rejected
  378 |     const v = (await put.json()).content.version;
  379 |     const bad = await request.put(`/api/admin/content/funds/${fund}`, { headers: adminHeaders(token), data: { version: v, fund: { tagline: { en: "only english", fr: "" } } } });
  380 |     expect(bad.status()).toBe(400);
  381 |   });
  382 | 
  383 |   test("SEB pinned to a class H run: F opens as coming soon; with class H selected every performance label says Series H / Série H", async ({ page, context, request }, info) => {
  384 |     // mutates the (global) content: desktop admin project only, restored at the end
  385 |     test.skip(info.project.name !== "admin-desktop", "mutations run on the desktop project only");
  386 |     const token = await signIn(context);
  387 |     const fund = "sustainable-enhanced-bonds";
  388 |     // a stored "live" run whose SEB data is the class H series (synthetic: what the dataplatform serves before PR #626)
  389 |     const id = "20260929T140000-e2eclassh";
  390 |     const dirRun = path.join(E2E_ENV.SITE_DATA_DIR, "snapshots", id);
  391 |     mkdirSync(dirRun, { recursive: true });
  392 |     const data = JSON.parse(readFileSync("e2e/fixtures/seb-class-h-site-data.json", "utf8"));
  393 |     expect(data.funds[fund].performance.classCode).toBe("STRATEGY_H");
  394 |     writeFileSync(path.join(dirRun, "site-data.json"), JSON.stringify({ ...data, runId: id }));
  395 |     writeFileSync(path.join(dirRun, "report.json"), JSON.stringify({
  396 |       id, trigger: "manual", by: "e2e", startedAt: data.generatedAt, finishedAt: data.generatedAt, status: "published", asOf: data.asOf,
  397 |       issues: [], sources: [], funds: { [fund]: "updated" }, publishedAt: data.generatedAt, publishedBy: "e2e",
  398 |     }));
  399 |     const { content } = await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json();
  400 |     const original = content.funds[fund] ?? {};
  401 |     const pin = await request.put(`/api/admin/content/funds/${fund}`, { headers: adminHeaders(token), data: { version: content.version, fund: { ...original, pinnedSnapshot: id } } });
  402 |     expect(pin.status(), await pin.text()).toBe(200);
  403 |     try {
  404 |       for (const [lang, word, fundWord, returns] of [["en", "Series", "Fund", "Returns: Series"], ["fr", "Série", "Fonds", "Rendements\\s:\\sSérie"]] as const) {
  405 |         await page.goto(`/strategies/${fund}`);
  406 |         if (lang === "fr") {
  407 |           // cookie for the whole site (a cookie set from the fund page's URL would be scoped to /strategies)
  408 |           await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: BASE }]);
  409 |           await page.reload();
  410 |         }
  411 |         // the page opens on class F (LDM201), which this run has no series for: "coming soon", never H's numbers under F
> 412 |         await expect(page.getByTestId("figures-soon")).toBeVisible();
      |                                                        ^ Error: expect(locator).toBeVisible() failed
  413 |         await page.getByTestId("nav-card").getByTestId("series-LDM202").click();
  414 |         const h = new RegExp(`${word} H(?![A-Za-z])`);
  415 |         const f = new RegExp(`(Series|Série) F(?![A-Za-z])`);
  416 |         for (const tid of ["basis", "overview-returns", "perf-class"]) {
  417 |           await expect(page.getByTestId(tid)).toContainText(h);
  418 |           await expect(page.getByTestId(tid)).not.toContainText(f);
  419 |         }
  420 |         // the NAV card follows the class selected (H, LDM202)
  421 |         await expect(page.getByTestId("nav-fundserv")).toHaveText("LDM202");
  422 |         await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="performance"]').click();
  423 |         await expect(page.getByTestId("perf-context")).toContainText(h);
  424 |         await expect(page.getByTestId("perf-context")).not.toContainText(f);
  425 |         await page.getByTestId("growth").scrollIntoViewIfNeeded();
  426 |         await expect(page.getByTestId("growth").locator(".fx-legend").first()).toContainText(`${fundWord} (${word} H)`);
  427 |         // home tile and strategies index
  428 |         for (const p of ["/", "/strategies"]) {
  429 |           await page.goto(p);
  430 |           // the tile shows only the headline class's own returns: F has no series here, so no class H figure appears
  431 |           await expect(page.getByTestId(`strategy-${fund}`).getByTestId("perf-class")).toHaveCount(0);
  432 |         }
  433 |         await expect(page.getByTestId("compare-table").getByTestId("perf-class").filter({ hasText: new RegExp(`${returns} H$`) })).toHaveCount(0);
  434 |       }
  435 |       await shot(page, "seb-class-h-strategies", info.project.name);
  436 |     } finally {
  437 |       const cur = (await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json()).content;
  438 |       const { pinnedSnapshot: _pin, ...rest } = cur.funds[fund] ?? {}; // eslint-disable-line @typescript-eslint/no-unused-vars
  439 |       const unpin = await request.put(`/api/admin/content/funds/${fund}`, { headers: adminHeaders(token), data: { version: cur.version, fund: rest } });
  440 |       expect(unpin.status()).toBe(200);
  441 |     }
  442 |     await page.goto(`/strategies/${fund}`);
  443 |     await page.context().clearCookies({ name: "nymbus-locale" });
  444 |     await page.reload();
  445 |     await expect(page.getByTestId("basis")).toContainText(/Series F(?![A-Za-z])/);
  446 |   });
  447 | 
  448 |   test("logout clears and revokes the session", async ({ request }) => {
  449 |     const t = await mintSession({ email: "alice@nymbus.ca" });
  450 |     expect((await request.get("/api/admin/me", { headers: { cookie: `${SESSION_COOKIE}=${t}` } })).status()).toBe(200);
  451 |     const r = await request.post("/api/auth/logout", { headers: { cookie: `${SESSION_COOKIE}=${t}`, origin: BASE, accept: "application/json" } });
  452 |     expect(r.status()).toBe(200);
  453 |     expect(r.headers()["set-cookie"]).toMatch(/nymbus_admin=;.*Max-Age=0/i);
  454 |     // the same token replayed after logout is rejected server-side
  455 |     expect((await request.get("/api/admin/me", { headers: { cookie: `${SESSION_COOKIE}=${t}` } })).status()).toBe(401);
  456 |     const x = await request.post("/api/auth/logout", { headers: { origin: "https://evil.example" } });
  457 |     expect(x.status()).toBe(403);
  458 |   });
  459 | });
  460 | 
```