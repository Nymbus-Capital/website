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
  { path: "/", name: "home", en: /scientific investing/, fr: /investissement scientifique/ },
  { path: "/strategies", name: "strategies", en: /our investment strategies/, fr: /nos stratégies de placement/ },
  { path: "/approach", name: "approach", en: /at the intersection of technology, data and finance/i, fr: /à l’intersection de la technologie, des données et de la finance/i },
  { path: "/sustainability", name: "sustainability", en: /responsible investing, built into the process/i, fr: /l’investissement responsable, intégré au processus/i },
  { path: "/team", name: "team", en: /scientists and market veterans/i, fr: /des scientifiques et des vétérans des marchés/i },
  { path: "/contact", name: "contact", en: /get in touch/i, fr: /communiquez avec nous/i },
  { path: "/solutions", name: "solutions", en: /solutions for every mandate/, fr: /des solutions pour chaque mandat/ },
  { path: "/legal", name: "legal", en: /^legal$/i, fr: /^juridique$/i },
  { path: "/privacy", name: "privacy", en: /^privacy policy$/i, fr: /^politique de confidentialité$/i },
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

/** Jump every finite animation (CSS and Web Animations) to its end state, so full-page captures are at rest. */
async function settle(page: Page) {
  await page.evaluate(() => {
    for (const a of document.getAnimations()) {
      try {
        const end = a.effect?.getComputedTiming().endTime;
        if (typeof end === "number" && Number.isFinite(end)) a.finish();
      } catch { /* infinite or detached: leave it */ }
    }
  });
  await page.waitForTimeout(150);
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
    await settle(page);
    await page.screenshot({ path: `${SHOTS}/site-${r.name}-${info.project.name}.png`, fullPage: true });
  });
}

test("unknown route: 404 page in the site chrome", async ({ page }, info) => {
  const res = await page.goto("/this-page-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(/this page has matured/i);
  await expect(page.getByRole("link", { name: /back to home/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /our strategies/i })).toHaveAttribute("href", "/strategies");
  await expect(page.getByTestId("site-nav")).toBeVisible();
  await page.waitForTimeout(3200);
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
  // each card shows either a published figure or the "figures coming soon" state
  for (let i = 0; i < 4; i++) {
    const card = cards.nth(i);
    await card.scrollIntoViewIfNeeded();
    const hasFig = await card.locator(".fig").count();
    const soon = await card.getByTestId("figures-soon").count();
    expect(hasFig + soon).toBe(1);
  }
  // the NAV ribbon only exists when NAVs are published
  const ribbon = page.getByTestId("nav-ribbon");
  if (await ribbon.count()) await expect(ribbon).toContainText(/nav as of/);
});

test("language toggle switches the page to French and back", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 }).first()).toHaveAccessibleName(/scientific investing/);
  if (isMobile) await page.getByTestId("menu-toggle").click();
  const toggle = isMobile ? page.getByTestId("mobile-menu").getByTestId("lang-toggle") : page.getByTestId("site-nav").getByTestId("lang-toggle");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  if (isMobile) await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { level: 1 }).first()).toHaveAccessibleName(/investissement scientifique/);
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
  await expect(menu.getByRole("link", { name: /^about$/i })).toBeVisible();
  // focus starts inside the menu and stays there
  expect(await page.evaluate(() => !!document.activeElement?.closest("#site-menu"))).toBe(true);
  for (let i = 0; i < 20; i++) await page.keyboard.press("Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest("#site-menu"))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();
  // navigating from the menu
  await toggle.click();
  await menu.getByRole("link", { name: /^about$/i }).click();
  await expect(page).toHaveURL(/\/team$/);
  await expect(menu).toBeHidden();
});

test("reduced motion: content is visible without animations", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", baseURL });
  const page = await ctx.newPage();
  for (const path of ["/approach", "/sustainability", "/team", "/contact", "/legal", "/privacy"]) {
    await page.goto(path);
    // the H1 words and every revealed block are visible at once, even before they scroll into view
    const h1 = page.getByRole("heading", { level: 1 }).first();
    expect(await h1.evaluate((n) => Number(getComputedStyle(n.querySelector(".w") ?? n).opacity)), path).toBe(1);
    const hidden = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-kids] > *, .ap-node, .ap-risks li, .ap-seg, .ab-person, .ab-tl-i, .ct-opt, .lg2-sec"))
        .filter((e) => getComputedStyle(e).opacity === "0").length,
    );
    expect(hidden, path).toBe(0);
  }
  // the pipeline illustrations are drawn, not waiting for a scroll
  await page.goto("/approach");
  const wave = page.locator(".ap-wave").first();
  expect(await wave.evaluate((n) => getComputedStyle(n).strokeDashoffset)).toMatch(/^0(px)?$/);
  await ctx.close();
});

test("team: filter by department and open a bio", async ({ page }) => {
  await page.goto("/team");
  const people = page.getByTestId("people").locator(":scope > li");
  await people.first().scrollIntoViewIfNeeded();
  const all = await people.count();
  expect(all).toBeGreaterThan(10);
  const board = page.getByRole("button", { name: /^board/i });
  await board.click();
  await expect(board).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => people.count()).toBeLessThan(all);
  await page.getByRole("button", { name: /^everyone/i }).click();
  await expect.poll(() => people.count()).toBe(all);
  const first = people.first().getByRole("button");
  await first.click();
  const dialog = page.getByTestId("bio-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { level: 2 })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(first).toBeFocused();
});

test("contact: three steps, validated, then an email is prepared (no backend)", async ({ page }) => {
  await page.goto("/contact");
  const form = page.getByTestId("contact-form");
  await form.scrollIntoViewIfNeeded();
  await expect(form).toHaveAttribute("data-live", "");
  // step 1: an investor type is required
  await form.getByRole("button", { name: /^continue/i }).click();
  await expect(form.getByText("Please choose an investor type.")).toBeVisible();
  await form.getByText("Family office", { exact: true }).click();
  await form.getByRole("button", { name: /^continue/i }).click();
  // step 2: at least one interest
  await expect(form.getByRole("group", { name: /what are you interested in/i })).toBeVisible();
  await form.getByRole("button", { name: /^continue/i }).click();
  await expect(form.getByText("Please choose at least one interest.")).toBeVisible();
  await form.getByText("Monthly Income", { exact: true }).click();
  await form.getByRole("button", { name: /^continue/i }).click();
  // step 3: name and a valid email
  await form.getByRole("button", { name: /prepare my email/i }).click();
  await expect(form.getByText("Please enter a valid email address.")).toBeVisible();
  await page.getByLabel("Full name").fill("Test Person");
  await page.getByLabel("Email address").fill("test@example.com");
  await page.getByLabel(/^Message/).fill("Hello, I would like to learn more about your funds.");
  // the mailto: hand-off opens the mail app (a no-op in the test browser); the ready state must show
  await form.getByRole("button", { name: /prepare my email/i }).click();
  const ready = page.getByTestId("contact-ready");
  await expect(ready).toBeVisible();
  await expect(ready.getByRole("link")).toHaveAttribute("href", /^mailto:info@nymbus\.ca\?subject=Website%20inquiry%20%C2%B7%20Family%20office/);
  // office details and a map link (no third-party frame)
  await expect(page.locator('a[href^="tel:+15149851138"]').first()).toBeVisible();
  await expect(page.locator('a[href^="https://www.google.com/maps/search/"]').first()).toBeAttached();
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("legal: table of contents follows both documents; privacy covers Law 25", async ({ page }) => {
  await page.goto("/legal");
  await expect(page.getByRole("heading", { level: 2, name: /complaints policy/i })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /code of ethics/i })).toBeAttached();
  await expect(page.getByText("514-985-1138 or 1-833-227-2656").first()).toBeAttached();
  await expect(page.getByText(/514-931-1138/)).toHaveCount(0);
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { level: 2, name: /law 25/i })).toBeAttached();
  await expect(page.locator('a[href="/legal#complaints"]').first()).toBeAttached();
});

test("admin does not get the public chrome", async ({ page, context }) => {
  await signIn(context);
  const res = await page.goto("/admin");
  expect(res?.status()).toBe(200);
  await expect(page.getByTestId("site-nav")).toHaveCount(0);
  await expect(page.getByTestId("site-footer")).toHaveCount(0);
});
