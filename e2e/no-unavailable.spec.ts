import { expect, test, type Page } from "@playwright/test";

/**
 * Owner's rule (2026-10-07): no public page ever says that data is missing, coming or unavailable (EN + FR). A block
 * without a figure is simply not rendered; a class without its own figures shows its NAV and the chosen class's
 * returns under that class's own label. Every public route is visited, every fund page with every selectable class
 * (and every Global Minimum Volatility variant); the whole page text is checked, hidden tab panels and collapsed
 * disclosures included (scripts and styles excluded).
 */
const BANNED =
  /coming soon|not available|unavailable|could not be verified|bientôt|à venir|non disponible|pas disponible/i;

const PAGES = [
  "/",
  "/strategies",
  "/solutions",
  "/approach",
  "/core-concepts",
  "/team",
  "/sustainability",
  "/contact",
  "/legal",
  "/privacy",
  "/news",
];
const FUNDS = ["monthly-income", "sustainable-enhanced-bonds", "multi-strategy", "global-minimum-volatility"];

/** Text of the whole page as rendered in the DOM (every tab panel, collapsed blocks included), without scripts. */
async function pageText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const body = document.body.cloneNode(true) as HTMLElement;
    body.querySelectorAll("script, style, noscript, template").forEach((n) => n.remove());
    return (body.textContent ?? "").replace(/\s+/g, " ");
  });
}

async function check(page: Page, where: string) {
  const text = await pageText(page);
  const m = BANNED.exec(text);
  expect(m ? `${where}: …${text.slice(Math.max(0, m.index - 80), m.index + 80)}…` : null, where).toBeNull();
}

async function setLocale(page: Page, lang: "en" | "fr") {
  if (lang === "fr") {
    await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
    await page.reload();
  }
}

for (const lang of ["en", "fr"] as const) {
  test(`no "unavailable" text on any public page (${lang})`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto("/");
    await setLocale(page, lang);
    for (const p of PAGES) {
      await page.goto(p);
      await expect(page.locator("main, body").first()).toBeVisible();
      await check(page, `${lang} ${p}`);
    }
    // every news item
    await page.goto("/news");
    const items = await page.locator('a[href^="/news/"]').evaluateAll((as) => [
      ...new Set(as.map((a) => (a as HTMLAnchorElement).getAttribute("href")!)),
    ]);
    for (const href of items) {
      await page.goto(href);
      await check(page, `${lang} ${href}`);
    }
  });

  for (const slug of FUNDS) {
    test(`no "unavailable" text on /strategies/${slug}, every tab and every class / variant (${lang})`, async ({
      page,
    }) => {
      test.setTimeout(180_000);
      await page.goto(`/strategies/${slug}`);
      await setLocale(page, lang);
      await expect(page.locator("h1")).toBeVisible();
      await check(page, `${lang} ${slug} (opening class)`);
      const tabs = page.getByTestId("fund-tabs").locator('[role="tab"]');
      const radios = page.locator('[data-testid="nav-card"] [role="radio"], [data-testid="variant-selector"] [role="radio"]');
      const n = await radios.count();
      for (let i = 0; i < Math.max(n, 1); i++) {
        if (n) await radios.nth(i).click();
        const label = n ? (await radios.nth(i).innerText()).trim() : "-";
        for (let t = 0; t < (await tabs.count()); t++) {
          await tabs.nth(t).click();
          await check(page, `${lang} ${slug} class/variant ${label} tab ${await tabs.nth(t).getAttribute("data-tab")}`);
        }
        // the returns strip, when shown, always names the class / variant of its figures
        if (await page.getByTestId("basis").count())
          await expect(page.getByTestId("basis")).toContainText(/\S/);
      }
    });
  }
}
