import { expect, test } from "@playwright/test";

/**
 * Content v3 (2026-10-02): approach risk-first and multi-strategy sections, the team credentials band and
 * self-hosted portraits, solutions use cases (no rankings on /solutions), the ESG scope of
 * /sustainability, and Global Minimum Volatility figures named by their downside-volatility variant.
 */

test("approach: risk-first section and the multi-strategy diagram, with links to the three ways in", async ({
  page,
}) => {
  await page.goto("/approach");
  await expect(page.getByRole("heading", { level: 2, name: /every strategy starts with risk/i })).toBeVisible();
  const um = page.getByTestId("ultra-micro");
  await um.scrollIntoViewIfNeeded();
  await expect(um).toHaveAttribute("data-on", "");
  await expect(um.getByRole("img")).toHaveAccessibleName(/bond universe/i);
  const ms = page.getByTestId("multi-strategy");
  await ms.scrollIntoViewIfNeeded();
  const viz = ms.getByRole("img");
  await expect(viz).toHaveAccessibleName(/low volatility.*directional.*mean reversion.*hedging.*rates.*commodities/i);
  await expect(viz).toHaveAttribute("data-on", "");
  await expect(ms.locator(".ap-ms-cell")).toHaveCount(20);
  await expect(ms).toContainText(/illustration only/i);
  await expect(ms).toContainText("The overlay adds futures exposure on top of the underlying portfolio");
  for (const key of ["monthly-income", "sustainable-enhanced-bonds", "multi-strategy", "global-minimum-volatility"]) {
    await expect(page.locator(`.ap-ms-offers a[href="/strategies/${key}"]`)).toHaveCount(1);
  }
  // the diagram fits the viewport (no horizontal page scroll on mobile)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("approach (fr): the new sections are translated", async ({ page, baseURL }) => {
  await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: baseURL! }]);
  await page.goto("/approach");
  await expect(page.getByRole("heading", { level: 2, name: /chaque stratégie part du risque/i })).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: /plusieurs stratégies, dans plusieurs catégories d’actifs/i }),
  ).toBeAttached();
});

test("team: credentials band counted from the data, self-hosted portraits, LinkedIn in the bio", async ({
  page,
  request,
}) => {
  await page.goto("/team");
  const band = page.getByTestId("credentials");
  await band.scrollIntoViewIfNeeded();
  await expect(band.locator(":scope > li")).toHaveCount(5);
  await expect(band).toContainText(/PhDs/);
  await expect(band).toContainText(/CFA or CIM holders/);
  await expect(band).toContainText(/years of combined experience/i);
  // portraits are served by the site itself
  const img = page.locator('img[src^="/team/"]').first();
  await expect(img).toBeAttached();
  const src = await img.getAttribute("src");
  const res = await request.get(src!);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/image\/webp/);
  // a bio with a LinkedIn profile and the stated experience
  const people = page.getByTestId("people");
  await people.scrollIntoViewIfNeeded();
  await people.getByRole("button", { name: /Gabriel Cefaloni/ }).click();
  const dialog = page.getByTestId("bio-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId("bio-linkedin")).toHaveAttribute("href", /^https:\/\/www\.linkedin\.com\/in\//);
  await expect(dialog).toContainText(/19 years of experience/);
  await expect(dialog.locator(".ab-tag.key")).toHaveText(["CIM"]);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("solutions: three illustrative use cases, overlay disclosures, no ranking claim in the copy", async ({ page }) => {
  await page.goto("/solutions");
  for (const a of ["institutional", "family", "advisor"]) {
    const uc = page.getByTestId(`use-case-${a}`);
    await uc.scrollIntoViewIfNeeded();
    await expect(uc).toBeVisible();
    await expect(uc).toContainText(/illustrative only: not a client testimonial/i);
    await expect(uc.locator(".sl-case-steps > li")).toHaveCount(3);
  }
  await expect(page.getByTestId("use-case-institutional")).toContainText(
    "The overlay adds futures exposure on top of the underlying portfolio",
  );
  await expect(page.getByTestId("use-case-family")).toContainText(/collateral/);
  // no ranking anywhere on /solutions (the "Third-party rankings" section was removed on 2026-10-04)
  await expect(page.getByTestId("use-case-advisor").locator(".sl-case-steps")).not.toContainText(
    /percentile|quartile|eVestment|Lipper/i,
  );
  await expect(page.getByTestId("advisor-rankings")).toHaveCount(0);
  await expect(page.locator("#advisor-rankings")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Third-party rankings" })).toHaveCount(0);
});

test("GMV: every figure on the home, strategies and solutions pages names its downside-volatility variant", async ({
  page,
}) => {
  await page.goto("/");
  const tile = page.getByTestId("strategy-global-minimum-volatility");
  await tile.scrollIntoViewIfNeeded();
  if (!(await tile.getByTestId("fund-figure").count())) test.skip(true, "no published GMV figures in this environment");
  await expect(tile.getByTestId("perf-variant")).toHaveText("6% downside volatility");
  await page.goto("/strategies");
  await expect(
    page
      .getByTestId("compare-table")
      .locator('tr:has(a[href="/strategies/global-minimum-volatility"])')
      .getByTestId("perf-variant"),
  ).toHaveText("6% downside volatility");
  await page.goto("/solutions");
  const fam = page.locator("section#family").getByTestId("solution-fund-global-minimum-volatility");
  await fam.scrollIntoViewIfNeeded();
  await expect(fam.getByTestId("solution-variant-global-minimum-volatility")).toHaveText("6% downside volatility");
});

test("sustainability: ESG criteria and exclusions are attributed to the Sustainable Enhanced Bonds Fund only", async ({
  page,
  baseURL,
}) => {
  await page.goto("/sustainability");
  await expect(page.locator("main")).toContainText(
    "The ESG criteria and exclusions on this page are those of the Sustainable Enhanced Bonds Fund",
  );
  const ex = page.locator("section#exclusions");
  await ex.scrollIntoViewIfNeeded();
  await expect(ex).toContainText(
    "The ESG criteria and exclusions below are those of the Sustainable Enhanced Bonds Fund",
  );
  await expect(page.locator("main")).not.toContainText(/other funds and strategies/i);
  await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: baseURL! }]);
  await page.goto("/sustainability");
  await expect(page.locator("main")).toContainText("sont ceux du Fonds Obligations Durables Bonifiées");
});
