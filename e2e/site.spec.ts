import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { signIn } from "./helpers";

/**
 * Public site (everything but the fund detail pages, covered by fund.spec.ts): every route answers 200 and
 * shows its main heading in English and in French, without console errors; the mobile menu and the
 * language toggle work; content is visible under reduced motion. Full-page screenshots go to
 * e2e/screenshots/site-<route>-<project>.png.
 */
const ROUTES = [
  { path: "/", name: "home", en: /scientific investing/i, fr: /investissement scientifique/i },
  { path: "/strategies", name: "strategies", en: /our funds and strategies/i, fr: /nos fonds et stratégies/i },
  { path: "/approach", name: "approach", en: /where science meets bonds/, fr: /là où la science rencontre les obligations/ },
  { path: "/sustainability", name: "sustainability", en: /modernity meets responsibility/, fr: /la modernité rencontre la responsabilité/ },
  { path: "/team", name: "team", en: /scientists and market veterans/, fr: /des scientifiques et des vétérans des marchés/ },
  { path: "/contact", name: "contact", en: /let’s talk/, fr: /parlons ensemble/ },
  { path: "/solutions", name: "solutions", en: /solutions tailored to your mandate/i, fr: /des solutions adaptées à votre mandat/i },
  { path: "/legal", name: "legal", en: /legal/, fr: /juridique/ },
  { path: "/privacy", name: "privacy", en: /privacy policy/, fr: /politique de confidentialité/ },
];

const SHOTS = "e2e/screenshots";
mkdirSync(SHOTS, { recursive: true });

/** Console errors, minus resources the sandboxed test browser may not reach (team photos on www.nymbus.ca). */
function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (/Failed to load resource/.test(t) && /nymbus\.ca|ERR_|net::/.test(t + (m.location().url ?? ""))) return;
    errors.push(t);
  });
  return errors;
}

async function scrollThrough(page: Page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
}

for (const r of ROUTES) {
  for (const locale of ["en", "fr"] as const) {
    test(`${r.path} renders its heading (${locale})`, async ({ page, baseURL }) => {
      await page.context().addCookies([{ name: "nymbus-locale", value: locale, url: baseURL! }]);
      const errors = collectErrors(page);
      const res = await page.goto(r.path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      const h1 = page.getByRole("heading", { level: 1 }).first();
      await expect(h1).toHaveAccessibleName(locale === "en" ? r.en : r.fr);
      await expect(page.getByTestId("site-nav")).toBeVisible();
      await expect(page.getByTestId("site-footer")).toBeAttached();
      expect(errors, errors.join("\n")).toEqual([]);
    });
  }

  test(`${r.path} full-page screenshot`, async ({ page, baseURL }, info) => {
    await page.context().addCookies([{ name: "nymbus-locale", value: "en", url: baseURL! }]);
    await page.goto(r.path);
    await scrollThrough(page);
    // freeze the keynote swap so every screen is at rest in the capture
    await page.addStyleTag({ content: ".screen{transform:none!important;filter:none!important;opacity:1!important;clip-path:none!important;animation:none!important}" });
    await page.screenshot({ path: `${SHOTS}/site-${r.name}-${info.project.name}.png`, fullPage: true });
  });
}

test("unknown route: 404 page in the site chrome", async ({ page }, info) => {
  const res = await page.goto("/this-page-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(/this bond has matured/);
  await expect(page.getByRole("link", { name: /back to home/ })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/site-404-${info.project.name}.png`, fullPage: true });
});

test("odometer: the figure's accessible name is the final value", async ({ page }) => {
  await page.goto("/");
  const odo = page.locator('[data-testid^="strategy-"] .odo').first();
  if (!(await odo.count())) test.skip(true, "no published figures in this environment");
  await odo.scrollIntoViewIfNeeded();
  await expect(odo.locator(".sr-only")).toHaveText(/^[+−]?\d+\.\d%$/);
});

test("home: live figures come from the data, never invented", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator('[data-testid^="strategy-"]');
  await cards.first().scrollIntoViewIfNeeded();
  await expect(cards).toHaveCount(4);
  // each card shows either its published figures or the "figures coming soon" state, never both
  for (let i = 0; i < 4; i++) {
    const card = cards.nth(i);
    await card.scrollIntoViewIfNeeded();
    const figs = await card.getByTestId("fund-figure").count();
    const soon = await card.getByTestId("figures-soon").count();
    expect(figs + soon).toBe(1);
  }
  // the NAV panel only exists when NAVs are published
  const panel = page.getByTestId("nav-panel");
  if (await panel.count()) await expect(panel).toContainText(/daily navs as of/i);
});

test("language toggle switches the page to French and back", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 }).first()).toHaveAccessibleName(/scientific investing/i);
  if (isMobile) await page.getByTestId("menu-toggle").click();
  const toggle = isMobile ? page.getByTestId("mobile-menu").getByTestId("lang-toggle") : page.getByTestId("site-nav").getByTestId("lang-toggle");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  if (isMobile) await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { level: 1 }).first()).toHaveAccessibleName(/investissement scientifique/i);
  const cookies = await page.context().cookies();
  expect(cookies.find((c) => c.name === "nymbus-locale")?.value).toBe("fr");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});

test("mobile menu opens, traps focus, closes with Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "the burger menu is the small-screen navigation");
  await page.goto("/");
  const toggle = page.getByTestId("menu-toggle");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  const menu = page.getByTestId("mobile-menu");
  await expect(menu).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(menu.getByRole("link", { name: "team" })).toBeVisible();
  // focus starts inside the menu and stays there
  expect(await page.evaluate(() => !!document.activeElement?.closest("#site-menu"))).toBe(true);
  for (let i = 0; i < 20; i++) await page.keyboard.press("Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest("#site-menu"))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();
  // navigating from the menu
  await toggle.click();
  await menu.getByRole("link", { name: "team" }).click();
  await expect(page).toHaveURL(/\/team$/);
  await expect(menu).toBeHidden();
});

test("reduced motion: content is visible without animations", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", baseURL });
  const page = await ctx.newPage();
  await page.goto("/");
  for (const sel of ["#hero-t", "#glance-t", "#approach-t", "#strat-t", "#process-t", "#partners-t", "#news-t"]) {
    const el = page.locator(sel);
    await el.scrollIntoViewIfNeeded();
    const opacity = await el.evaluate((n) => {
      const w = n.querySelector(".w") ?? n;
      return Number(getComputedStyle(w).opacity);
    });
    expect(opacity, sel).toBe(1);
  }
  // revealed blocks are visible even before they scroll in
  const hidden = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-kids] > *")).filter((e) => getComputedStyle(e).opacity === "0").length,
  );
  expect(hidden).toBe(0);
  await ctx.close();
});

test("team: filter by department and open a bio", async ({ page }) => {
  await page.goto("/team");
  const people = page.locator(".people > li");
  await people.first().scrollIntoViewIfNeeded();
  const all = await people.count();
  await page.getByRole("button", { name: /^board/ }).click();
  await expect.poll(() => people.count()).toBeLessThan(all);
  await page.getByRole("button", { name: /^everyone/ }).click();
  await expect.poll(() => people.count()).toBe(all);
  await people.first().getByRole("button").click();
  const dialog = page.getByTestId("bio-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { level: 2 })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("contact: validates, then prepares an email (no backend)", async ({ page }) => {
  await page.goto("/contact");
  const form = page.getByTestId("contact-form");
  await form.scrollIntoViewIfNeeded();
  await form.getByRole("button", { name: /prepare my email/ }).click();
  await expect(page.getByText("please enter a valid email")).toBeVisible();
  await page.getByLabel("full name").fill("Test Person");
  await page.getByLabel("email").fill("test@example.com");
  await page.getByLabel("message").fill("Hello, I would like to learn more about your funds.");
  // the mailto: hand-off opens the mail app (a no-op in the test browser); the ready state must show
  await form.getByRole("button", { name: /prepare my email/ }).click();
  await expect(page.getByTestId("contact-ready")).toBeVisible();
  await expect(page.getByTestId("contact-ready").getByRole("link")).toHaveAttribute("href", /^mailto:info@nymbus\.ca\?subject=/);
});

test("admin does not get the public chrome", async ({ page, context }) => {
  await signIn(context);
  const res = await page.goto("/admin");
  expect(res?.status()).toBe(200);
  await expect(page.getByTestId("site-nav")).toHaveCount(0);
  await expect(page.getByTestId("site-footer")).toHaveCount(0);
});
