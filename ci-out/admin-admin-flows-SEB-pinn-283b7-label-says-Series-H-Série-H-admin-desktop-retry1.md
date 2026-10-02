# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> admin flows >> SEB pinned to a class H run: F opens as coming soon; with class H selected every performance label says Series H / Série H
- Location: e2e/admin.spec.ts:381:7

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: getByTestId('strategy-sustainable-enhanced-bonds').getByTestId('perf-class')
Expected pattern: /^Returns: Series H$/
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" getByTestId('strategy-sustainable-enhanced-bonds').getByTestId('perf-class') with timeout 10000ms
  - waiting for getByTestId('strategy-sustainable-enhanced-bonds').getByTestId('perf-class')

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
  - paragraph: Montreal · systematic fixed income and alternatives
  - heading "Scientific investing" [level=1]
  - paragraph: Scientists and engineers solving the harder problems in finance.
  - link "Explore strategies":
    - /url: /strategies
  - link "Investment solutions":
    - /url: /solutions
  - region "Nymbus at a glance":
    - heading "Nymbus at a glance" [level=2]
    - text: $1.9B Assets under management, including mandates 4 Strategies 18 People, team and board 2 PhDs on the team
  - region "Scientists and engineers, hard problems in finance":
    - paragraph: Science at scale
    - heading "Scientists and engineers, hard problems in finance" [level=2]
    - text: Data at scale. Models tested before they are trusted.
    - 'figure "Generic labels and generated values: not actual securities, signals or results. The counters count what this animation scans."':
      - 'img "Animated illustration: a table of securities scanned for factor scores, with flagged signals."'
      - text: "Generic labels and generated values: not actual securities, signals or results. The counters count what this animation scans."
    - heading "Scientists" [level=3]
    - paragraph: Hypotheses, tested on data.
    - heading "Engineers" [level=3]
    - paragraph: Pipelines that run every day.
    - heading "Together" [level=3]
    - paragraph: The harder problems in fixed income.
  - region "Our funds and strategies":
    - paragraph: Strategies
    - heading "Our funds and strategies" [level=2]
    - text: Two bond funds, a multi-strategy fund, a futures overlay.
    - link "Short-term fixed income Fund · FundServ Monthly Income Monthly income from short-term corporate bonds Figures coming soon View the strategy":
      - /url: /strategies/monthly-income
      - text: Short-term fixed income Fund · FundServ
      - heading "Monthly Income" [level=3]
      - text: Monthly income from short-term corporate bonds Figures coming soon View the strategy
    - link "Core fixed income Fund · FundServ Sustainable Enhanced Bonds Canadian core bonds, managed systematically Figures coming soon View the strategy":
      - /url: /strategies/sustainable-enhanced-bonds
      - text: Core fixed income Fund · FundServ
      - heading "Sustainable Enhanced Bonds" [level=3]
      - text: Canadian core bonds, managed systematically Figures coming soon View the strategy
    - 'link "Alternative strategies Sample data Fund · FundServ Multi-Strategy e2e tagline +7.6% Since inception, annualized · Net of fees 1 year +9.4% Returns as of August 2026 · Net of fees · Returns: Series F View the strategy"':
      - /url: /strategies/multi-strategy
      - text: Alternative strategies Sample data Fund · FundServ
      - heading "Multi-Strategy" [level=3]
      - text: "e2e tagline +7.6% Since inception, annualized · Net of fees 1 year +9.4% Returns as of August 2026 · Net of fees · Returns: Series F View the strategy"
    - link "Futures overlay (managed accounts) Sample data Managed accounts Global Minimum Volatility A futures overlay designed to have low correlation with bonds +8.2% Since inception, annualized · Gross of fees 1 year +6.1% Returns as of August 2026 · Gross of fees View the strategy":
      - /url: /strategies/global-minimum-volatility
      - text: Futures overlay (managed accounts) Sample data Managed accounts
      - heading "Global Minimum Volatility" [level=3]
      - text: A futures overlay designed to have low correlation with bonds +8.2% Since inception, annualized · Gross of fees 1 year +6.1% Returns as of August 2026 · Gross of fees View the strategy
    - paragraph: Net of fees, in CAD. Past performance may not be repeated. See the important information below. Global Minimum Volatility returns are gross of fees (managed accounts, not a fund).
    - link "View all strategies":
      - /url: /strategies
  - region "One pipeline, from data to portfolio":
    - paragraph: Investment process
    - heading "One pipeline, from data to portfolio" [level=2]
    - text: Four documented, tested and monitored steps.
    - list:
      - listitem:
        - paragraph: "01"
        - heading "Data and research" [level=3]
        - text: Market and fundamental data, cleaned and studied.
      - listitem:
        - paragraph: "02"
        - heading "Signal generation" [level=3]
        - text: Machine-learning signals, kept only after statistical validation.
      - listitem:
        - paragraph: "03"
        - heading "Portfolio construction" [level=3]
        - text: Optimization within risk, liquidity and sustainability limits.
      - listitem:
        - paragraph: "04"
        - heading "Risk management" [level=3]
        - text: Continuous monitoring, adjustments and hedging. Risk management does not eliminate the risk of loss.
    - link "Our approach":
      - /url: /approach
    - link "Meet the team":
      - /url: /team
  - region "Institutions and partners we work with":
    - paragraph: Clients and platforms
    - heading "Institutions and partners we work with" [level=2]
    - region "Logos of institutions and platforms we work with":
      - list:
        - listitem:
          - img "Fondaction"
        - listitem:
          - img "Fonds FMOQ"
        - listitem:
          - img "QEMP (Innocap)"
        - listitem:
          - img "Caisse de retraite et d’épargne du Groupe Securitas"
        - listitem:
          - img "GardaWorld"
        - listitem:
          - img "Bâtirente"
        - listitem:
          - img "National Bank Financial Wealth Management"
        - listitem:
          - img "RBC Dominion Securities"
        - listitem:
          - img "iA Financial Group"
    - paragraph: "Source: Nymbus Capital Inc. Representative list; not all clients are shown. QEMP: Quebec Emerging Managers Program (Innocap). Inclusion does not imply endorsement."
  - region "Recent developments":
    - paragraph: News and milestones
    - heading "Recent developments" [level=2]
    - article:
      - paragraph:
        - text: Partnership
        - time: Jan 28, 2025
      - heading "Mageska Capital and Nymbus Capital announce a partnership" [level=3]
      - 'button "Read more : Mageska Capital and Nymbus Capital announce a partnership"'
    - article:
      - paragraph:
        - text: ESG
        - time: Apr 23, 2024
      - heading "Nymbus becomes a signatory of the Tobacco-Free Finance Pledge" [level=3]
      - 'button "Read more : Nymbus becomes a signatory of the Tobacco-Free Finance Pledge"'
    - article:
      - paragraph:
        - text: Community
        - time: Oct 3, 2023
      - heading "Nymbus partners with Dans la rue" [level=3]
      - 'button "Read more : Nymbus partners with Dans la rue"'
    - paragraph:
      - link "All news":
        - /url: /news
  - heading "Let’s discuss your investment objectives" [level=2]
  - paragraph: Talk to our team about your mandate.
  - link "Get in touch":
    - /url: /contact
  - link "View solutions":
    - /url: /solutions
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
  - paragraph: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative.
  - paragraph: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
  - text: © 2026 Nymbus Capital Inc. All rights reserved. PRI signatory
- alert
```

# Test source

```ts
  328 |       data: { version: content.version, firm: { aumLabel: content.firm.aumLabel, announcement: null, disclaimer: firm }, publishMode: content.pipeline.publishMode },
  329 |     });
  330 |     expect(put.status()).toBe(200);
  331 |     await page.goto("/");
  332 |     await expect(page.getByTestId("footer-disclaimers")).toContainText(firm.en);
  333 |     await page.goto("/admin");
  334 |     await expect(page.getByTestId("compliance-banner")).toContainText("changed since the last review");
  335 | 
  336 |     // restore the boilerplate (empty override)
  337 |     const after = (await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json()).content;
  338 |     await request.put("/api/admin/content/settings", {
  339 |       headers: adminHeaders(token),
  340 |       data: { version: after.version, firm: { aumLabel: after.firm.aumLabel, announcement: null, disclaimer: { en: "", fr: "" } }, publishMode: after.pipeline.publishMode },
  341 |     });
  342 | 
  343 |     // a stale hash is refused
  344 |     const stale = await request.post("/api/admin/compliance", { headers: adminHeaders(token), data: { version: after.version + 1, textsHash: "0000000000000000", confirm: true } });
  345 |     expect(stale.status()).toBe(409);
  346 |   });
  347 | 
  348 |   test("unticking 'hide aum' persists and publishes the fund AUM; ticking it again removes it from the page", async ({ page, context, request }, info) => {
  349 |     test.skip(info.project.name !== "desktop", "mutations run on the desktop project only");
  350 |     const token = await signIn(context);
  351 |     const fund = "sustainable-enhanced-bonds";
  352 |     const before = await request.get(`/strategies/${fund}`).then((r) => r.text());
  353 |     expect(before).not.toMatch(CAD_KEY);
  354 | 
  355 |     await page.goto(`/admin/funds/${fund}`);
  356 |     const aum = page.getByTestId("fund-editor").locator("label.adm-chip", { hasText: /^aum$/ }).locator("input");
  357 |     await expect(aum).toBeChecked(); // hidden by default
  358 |     await aum.uncheck({ force: true });
  359 |     await page.getByTestId("save-fund").click();
  360 |     await expect(page.locator(".adm-toast.ok")).toContainText("Saved");
  361 | 
  362 |     const { content } = await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json();
  363 |     expect(content.funds[fund].hide?.aum).toBe(false);
  364 |     const after = await request.get(`/strategies/${fund}`).then((r) => r.text());
  365 |     expect(after).toMatch(CAD_KEY);
  366 | 
  367 |     // restore (hide again)
  368 |     const put = await request.put(`/api/admin/content/funds/${fund}`, {
  369 |       headers: adminHeaders(token),
  370 |       data: { version: content.version, fund: { ...content.funds[fund], hide: { ...(content.funds[fund].hide ?? {}), aum: true } } },
  371 |     });
  372 |     expect(put.status()).toBe(200);
  373 |     expect(await request.get(`/strategies/${fund}`).then((r) => r.text())).not.toMatch(CAD_KEY);
  374 | 
  375 |     // a one-language override is rejected
  376 |     const v = (await put.json()).content.version;
  377 |     const bad = await request.put(`/api/admin/content/funds/${fund}`, { headers: adminHeaders(token), data: { version: v, fund: { tagline: { en: "only english", fr: "" } } } });
  378 |     expect(bad.status()).toBe(400);
  379 |   });
  380 | 
  381 |   test("SEB pinned to a class H run: F opens as coming soon; with class H selected every performance label says Series H / Série H", async ({ page, context, request }, info) => {
  382 |     // mutates the (global) content: desktop admin project only, restored at the end
  383 |     test.skip(info.project.name !== "admin-desktop", "mutations run on the desktop project only");
  384 |     const token = await signIn(context);
  385 |     const fund = "sustainable-enhanced-bonds";
  386 |     // a stored "live" run whose SEB data is the class H series (synthetic: what the dataplatform serves before PR #626)
  387 |     const id = "20260929T140000-e2eclassh";
  388 |     const dirRun = path.join(E2E_ENV.SITE_DATA_DIR, "snapshots", id);
  389 |     mkdirSync(dirRun, { recursive: true });
  390 |     const data = JSON.parse(readFileSync("e2e/fixtures/seb-class-h-site-data.json", "utf8"));
  391 |     expect(data.funds[fund].performance.classCode).toBe("STRATEGY_H");
  392 |     writeFileSync(path.join(dirRun, "site-data.json"), JSON.stringify({ ...data, runId: id }));
  393 |     writeFileSync(path.join(dirRun, "report.json"), JSON.stringify({
  394 |       id, trigger: "manual", by: "e2e", startedAt: data.generatedAt, finishedAt: data.generatedAt, status: "published", asOf: data.asOf,
  395 |       issues: [], sources: [], funds: { [fund]: "updated" }, publishedAt: data.generatedAt, publishedBy: "e2e",
  396 |     }));
  397 |     const { content } = await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json();
  398 |     const original = content.funds[fund] ?? {};
  399 |     const pin = await request.put(`/api/admin/content/funds/${fund}`, { headers: adminHeaders(token), data: { version: content.version, fund: { ...original, pinnedSnapshot: id } } });
  400 |     expect(pin.status(), await pin.text()).toBe(200);
  401 |     try {
  402 |       for (const [lang, word, fundWord, returns] of [["en", "Series", "Fund", "Returns: Series"], ["fr", "Série", "Fonds", "Rendements\\s:\\sSérie"]] as const) {
  403 |         await page.goto(`/strategies/${fund}`);
  404 |         if (lang === "fr") {
  405 |           // cookie for the whole site (a cookie set from the fund page's URL would be scoped to /strategies)
  406 |           await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: BASE }]);
  407 |           await page.reload();
  408 |         }
  409 |         // the page opens on class F (LDM201), which this run has no series for: "coming soon", never H's numbers under F
  410 |         await expect(page.getByTestId("figures-soon")).toBeVisible();
  411 |         await page.getByTestId("nav-card").getByTestId("series-LDM202").click();
  412 |         const h = new RegExp(`${word} H(?![A-Za-z])`);
  413 |         const f = new RegExp(`(Series|Série) F(?![A-Za-z])`);
  414 |         for (const tid of ["basis", "overview-returns", "perf-class"]) {
  415 |           await expect(page.getByTestId(tid)).toContainText(h);
  416 |           await expect(page.getByTestId(tid)).not.toContainText(f);
  417 |         }
  418 |         // the NAV card follows the class selected (H, LDM202)
  419 |         await expect(page.getByTestId("nav-fundserv")).toHaveText("LDM202");
  420 |         await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="performance"]').click();
  421 |         await expect(page.getByTestId("perf-context")).toContainText(h);
  422 |         await expect(page.getByTestId("perf-context")).not.toContainText(f);
  423 |         await page.getByTestId("growth").scrollIntoViewIfNeeded();
  424 |         await expect(page.getByTestId("growth").locator(".fx-legend").first()).toContainText(`${fundWord} (${word} H)`);
  425 |         // home tile and strategies index
  426 |         for (const p of ["/", "/strategies"]) {
  427 |           await page.goto(p);
> 428 |           await expect(page.getByTestId(`strategy-${fund}`).getByTestId("perf-class")).toHaveText(new RegExp(`^${returns} H$`));
      |                                                                                        ^ Error: expect(locator).toHaveText(expected) failed
  429 |         }
  430 |         await expect(page.getByTestId("compare-table").getByTestId("perf-class").nth(1)).toHaveText(new RegExp(`^${returns} H$`));
  431 |       }
  432 |       await shot(page, "seb-class-h-strategies", info.project.name);
  433 |     } finally {
  434 |       const cur = (await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json()).content;
  435 |       const { pinnedSnapshot: _pin, ...rest } = cur.funds[fund] ?? {}; // eslint-disable-line @typescript-eslint/no-unused-vars
  436 |       const unpin = await request.put(`/api/admin/content/funds/${fund}`, { headers: adminHeaders(token), data: { version: cur.version, fund: rest } });
  437 |       expect(unpin.status()).toBe(200);
  438 |     }
  439 |     await page.goto(`/strategies/${fund}`);
  440 |     await page.context().clearCookies({ name: "nymbus-locale" });
  441 |     await page.reload();
  442 |     await expect(page.getByTestId("basis")).toContainText(/Series F(?![A-Za-z])/);
  443 |   });
  444 | 
  445 |   test("logout clears and revokes the session", async ({ request }) => {
  446 |     const t = await mintSession({ email: "alice@nymbus.ca" });
  447 |     expect((await request.get("/api/admin/me", { headers: { cookie: `${SESSION_COOKIE}=${t}` } })).status()).toBe(200);
  448 |     const r = await request.post("/api/auth/logout", { headers: { cookie: `${SESSION_COOKIE}=${t}`, origin: BASE, accept: "application/json" } });
  449 |     expect(r.status()).toBe(200);
  450 |     expect(r.headers()["set-cookie"]).toMatch(/nymbus_admin=;.*Max-Age=0/i);
  451 |     // the same token replayed after logout is rejected server-side
  452 |     expect((await request.get("/api/admin/me", { headers: { cookie: `${SESSION_COOKIE}=${t}` } })).status()).toBe(401);
  453 |     const x = await request.post("/api/auth/logout", { headers: { origin: "https://evil.example" } });
  454 |     expect(x.status()).toBe(403);
  455 |   });
  456 | });
  457 | 
```