# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> admin flows >> SEB pinned to a class H run: every performance label says Series H / Série H, the NAV card keeps series F
- Location: e2e/admin.spec.ts:381:7

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: getByTestId('strategy-sustainable-enhanced-bonds').getByTestId('perf-class')
Expected pattern: /^Rendements\s:\sSérie H$/
Received string:  "Returns: Series H"
Timeout: 10000ms

Call log:
  - Expect "toHaveText" getByTestId('strategy-sustainable-enhanced-bonds').getByTestId('perf-class') with timeout 10000ms
  - waiting for getByTestId('strategy-sustainable-enhanced-bonds').getByTestId('perf-class')
    24 × locator resolved to <span data-testid="perf-class">…</span>
       - unexpected value "Returns: Series H"

```

```yaml
- text: "Returns: Series H"
```

# Test source

```ts
  324 |     const { content } = await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json();
  325 |     const firm = { en: "E2E firm disclaimer override.", fr: "Avis de la firme E2E." };
  326 |     const put = await request.put("/api/admin/content/settings", {
  327 |       headers: adminHeaders(token),
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
  381 |   test("SEB pinned to a class H run: every performance label says Series H / Série H, the NAV card keeps series F", async ({ page, context, request }, info) => {
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
  405 |           await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  406 |           await page.reload();
  407 |         }
  408 |         const h = new RegExp(`${word} H(?![A-Za-z])`);
  409 |         const f = new RegExp(`(Series|Série) F(?![A-Za-z])`);
  410 |         for (const tid of ["basis", "overview-returns", "perf-class"]) {
  411 |           await expect(page.getByTestId(tid)).toContainText(h);
  412 |           await expect(page.getByTestId(tid)).not.toContainText(f);
  413 |         }
  414 |         // the NAV card is the register's class F (LDM201): a different series, labelled as such
  415 |         await expect(page.getByTestId("nav-fundserv")).toHaveText("LDM201");
  416 |         await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="performance"]').click();
  417 |         await expect(page.getByTestId("perf-context")).toContainText(h);
  418 |         await expect(page.getByTestId("perf-context")).not.toContainText(f);
  419 |         await page.getByTestId("growth").scrollIntoViewIfNeeded();
  420 |         await expect(page.getByTestId("growth").locator(".fx-legend").first()).toContainText(`${fundWord} (${word} H)`);
  421 |         // home tile and strategies index
  422 |         for (const p of ["/", "/strategies"]) {
  423 |           await page.goto(p);
> 424 |           await expect(page.getByTestId(`strategy-${fund}`).getByTestId("perf-class")).toHaveText(new RegExp(`^${returns} H$`));
      |                                                                                        ^ Error: expect(locator).toHaveText(expected) failed
  425 |         }
  426 |         await expect(page.getByTestId("compare-table").getByTestId("perf-class").nth(1)).toHaveText(new RegExp(`^${returns} H$`));
  427 |       }
  428 |       await shot(page, "seb-class-h-strategies", info.project.name);
  429 |     } finally {
  430 |       const cur = (await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json()).content;
  431 |       const { pinnedSnapshot: _pin, ...rest } = cur.funds[fund] ?? {}; // eslint-disable-line @typescript-eslint/no-unused-vars
  432 |       const unpin = await request.put(`/api/admin/content/funds/${fund}`, { headers: adminHeaders(token), data: { version: cur.version, fund: rest } });
  433 |       expect(unpin.status()).toBe(200);
  434 |     }
  435 |     await page.goto(`/strategies/${fund}`);
  436 |     await page.context().clearCookies({ name: "nymbus-locale" });
  437 |     await page.reload();
  438 |     await expect(page.getByTestId("basis")).toContainText(/Series F(?![A-Za-z])/);
  439 |   });
  440 | 
  441 |   test("logout clears and revokes the session", async ({ request }) => {
  442 |     const t = await mintSession({ email: "alice@nymbus.ca" });
  443 |     expect((await request.get("/api/admin/me", { headers: { cookie: `${SESSION_COOKIE}=${t}` } })).status()).toBe(200);
  444 |     const r = await request.post("/api/auth/logout", { headers: { cookie: `${SESSION_COOKIE}=${t}`, origin: BASE, accept: "application/json" } });
  445 |     expect(r.status()).toBe(200);
  446 |     expect(r.headers()["set-cookie"]).toMatch(/nymbus_admin=;.*Max-Age=0/i);
  447 |     // the same token replayed after logout is rejected server-side
  448 |     expect((await request.get("/api/admin/me", { headers: { cookie: `${SESSION_COOKIE}=${t}` } })).status()).toBe(401);
  449 |     const x = await request.post("/api/auth/logout", { headers: { origin: "https://evil.example" } });
  450 |     expect(x.status()).toBe(403);
  451 |   });
  452 | });
  453 | 
```