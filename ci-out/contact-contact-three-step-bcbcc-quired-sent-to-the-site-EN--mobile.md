# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contact.spec.ts >> contact: three steps validated, consent required, sent to the site (EN)
- Location: e2e/contact.spec.ts:40:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('group', { name: /what type of investor/i })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('group', { name: /what type of investor/i }) with timeout 10000ms
  - waiting for getByRole('group', { name: /what type of investor/i })

```

```yaml
- link "Skip to content":
  - /url: "#main"
- banner:
  - link "Nymbus Capital, home":
    - /url: /
    - img "nymbus"
  - navigation "Primary"
  - button "Afficher le site en français"
  - button "Open menu"
- main:
  - navigation "Breadcrumb":
    - list:
      - listitem:
        - link "Home":
          - /url: /
      - listitem: Contact us
  - paragraph: Contact us
  - heading "Get in touch" [level=1]
  - text: "Strategies, a custom mandate or the firm: our Montreal team can help."
  - link "514-985-1138":
    - /url: tel:+15149851138
  - link "info@nymbus.ca":
    - /url: mailto:info@nymbus.ca
  - region "Write to us":
    - heading "Write to us" [level=2]
    - paragraph: Three short steps.
    - status
    - list "Form progress":
      - listitem: Profile
      - listitem
      - listitem
    - group "Who are you?":
      - text: Who are you?
      - radio "Financial advisor Registered with CIRO or a provincial regulator"
      - text: Financial advisor Registered with CIRO or a provincial regulator
      - radio "Institution Pensions, foundations, insurers, family offices"
      - text: Institution Pensions, foundations, insurers, family offices
      - radio "Individual investor Investing on your own behalf"
      - text: Individual investor Investing on your own behalf
      - radio "Other Media, partners, careers"
      - text: Other Media, partners, careers
      - button "Continue"
    - paragraph: Please do not include account numbers or other sensitive information.
    - complementary "Montreal office":
      - heading "Montreal office" [level=2]
      - list:
        - listitem: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
        - listitem:
          - link "514-985-1138":
            - /url: tel:+15149851138
          - link "1-833-227-2656 (toll-free)":
            - /url: tel:+18332272656
        - listitem:
          - link "info@nymbus.ca":
            - /url: mailto:info@nymbus.ca
        - listitem: Monday to Friday, 8:30 a.m. to 5:00 p.m. (Eastern time)
      - link "Open in Google Maps":
        - /url: https://www.google.com/maps/search/?api=1&query=1002%20Sherbrooke%20Street%20West%2C%20Suite%201900%2C%20Montreal%2C%20Quebec%20H3A%203L6
      - link "LinkedIn":
        - /url: https://www.linkedin.com/company/nymbus-capital/
      - heading "Response time" [level=2]
      - paragraph: Usually within one business day.
  - region "The right person for your question":
    - paragraph: Who to contact
    - heading "The right person for your question" [level=2]
    - heading "Investors and institutions" [level=3]
    - paragraph: Strategies, mandates, due diligence, meetings.
    - link "info@nymbus.ca":
      - /url: mailto:info@nymbus.ca?subject=Investor%20inquiry
    - heading "Financial advisors" [level=3]
    - paragraph: Fund codes, documents, client portfolio support.
    - link "info@nymbus.ca":
      - /url: mailto:info@nymbus.ca?subject=Advisor%20inquiry
    - heading "Media and careers" [level=3]
    - paragraph: Interviews, events, job applications.
    - link "info@nymbus.ca":
      - /url: mailto:info@nymbus.ca?subject=Media%20or%20careers
    - heading "Complaints and privacy" [level=3]
    - paragraph: Complaints and personal information requests.
    - link "compliance@nymbus.ca":
      - /url: mailto:compliance@nymbus.ca?subject=Compliance
    - link "Complaints policy":
      - /url: /legal#complaints
  - region "In the heart of downtown Montreal":
    - paragraph: Visit us
    - heading "In the heart of downtown Montreal" [level=2]
    - list:
      - listitem: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
      - listitem: Monday to Friday, 8:30 a.m. to 5:00 p.m. (Eastern time)
    - link "Open in Google Maps":
      - /url: https://www.google.com/maps/search/?api=1&query=1002%20Sherbrooke%20Street%20West%2C%20Suite%201900%2C%20Montreal%2C%20Quebec%20H3A%203L6
    - link "Nymbus Capital 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6 Open in Google Maps":
      - /url: https://www.google.com/maps/search/?api=1&query=1002%20Sherbrooke%20Street%20West%2C%20Suite%201900%2C%20Montreal%2C%20Quebec%20H3A%203L6
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
      - link "Core concepts":
        - /url: /core-concepts
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
  - button "Show full text"
  - text: © 2026 Nymbus Capital Inc. All rights reserved. PRI signatory
- alert
```

# Test source

```ts
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | import { mkdirSync } from "node:fs";
  3   | import { randomBytes } from "node:crypto";
  4   | import { BASE } from "./helpers";
  5   | 
  6   | /**
  7   |  * Contact form backend (POST /api/contact): the three steps with JavaScript, the native post without JavaScript, and
  8   |  * the API guards. Inquiries land in the e2e server's test-only data volume (SITE_DATA_DIR=./var-e2e); the admin tests
  9   |  * (admin.spec.ts, run after this file) read them. Every test uses its own client address (X-Forwarded-For) so the
  10  |  * per-client rate limit of one test never affects another.
  11  |  */
  12  | 
  13  | const SHOTS = "e2e/screenshots";
  14  | mkdirSync(SHOTS, { recursive: true });
  15  | 
  16  | /** a fresh documentation-range (2001:db8::/32) client address: tests run in parallel workers and must never share one */
  17  | const ip = () => `2001:db8::${randomBytes(2).toString("hex")}:${randomBytes(2).toString("hex")}`;
  18  | 
  19  | /** the form timing token rendered in the page (the server refuses posts made within 3 s of rendering) */
  20  | async function token(request: import("@playwright/test").APIRequestContext): Promise<string> {
  21  |   const html = await (await request.get("/contact")).text();
  22  |   const m = /name="t" value="(v1\.[^"]+)"/.exec(html);
  23  |   expect(m, "form token in the page").not.toBeNull();
  24  |   return m![1];
  25  | }
  26  | 
  27  | async function fillSteps(page: Page, name: string, fr = false) {
  28  |   const form = page.getByTestId("contact-form");
  29  |   const next = form.getByRole("button", { name: fr ? /^continuer/i : /^continue/i });
  30  |   await form.getByText(fr ? "Particulier" : "Individual investor", { exact: true }).click();
  31  |   await next.click();
  32  |   await form.getByText(fr ? "Demande générale" : "General inquiry", { exact: true }).click();
  33  |   await next.click();
  34  |   await page.getByLabel(fr ? "Nom complet" : "Full name").fill(name);
  35  |   await page.getByLabel(fr ? "Adresse courriel" : "Email address").fill("visitor@example.com");
  36  |   await page.getByLabel(fr ? /^Organisation/ : /^Organization/).fill("Example Pension Plan");
  37  |   await page.getByLabel(/^Message/).fill("Hello,\nI would like to learn more about your funds.");
  38  | }
  39  | 
  40  | test("contact: three steps validated, consent required, sent to the site (EN)", async ({ page }, info) => {
  41  |   await page.emulateMedia({ reducedMotion: "reduce" });
  42  |   await page.setExtraHTTPHeaders({ "x-forwarded-for": ip() });
  43  |   await page.goto("/contact");
  44  |   const form = page.getByTestId("contact-form");
  45  |   await form.scrollIntoViewIfNeeded();
  46  |   await expect(form).toHaveAttribute("data-live", "");
  47  |   // step 1: a profile is required
  48  |   await form.getByRole("button", { name: /^continue/i }).click();
  49  |   await expect(form.getByText("Please choose a profile.")).toBeVisible();
  50  |   await form.getByText("Individual investor", { exact: true }).click();
  51  |   await form.getByRole("button", { name: /^continue/i }).click();
  52  |   // step 2: at least one interest
  53  |   await expect(form.getByRole("group", { name: /what are you interested in/i })).toBeVisible();
  54  |   await form.getByRole("button", { name: /^continue/i }).click();
  55  |   await expect(form.getByText("Please choose at least one interest.")).toBeVisible();
  56  |   await form.getByText("Monthly Income", { exact: true }).click();
  57  |   await form.getByRole("button", { name: /^continue/i }).click();
  58  |   // step 3: name, a valid email and the consent
  59  |   const send = form.getByRole("button", { name: /send my message/i });
  60  |   await send.click();
  61  |   await expect(form.getByText("Please enter a valid email address.")).toBeVisible();
  62  |   await expect(form.getByText("Please give your consent.")).toBeVisible();
  63  |   await expect(page.getByLabel("Full name")).toBeFocused(); // focus goes to the first field to fix
  64  |   await expect(form.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");
  65  |   await page.getByLabel("Full name").fill(`E2E Visitor ${info.project.name}`);
  66  |   await page.getByLabel("Email address").fill("visitor@example.com");
  67  |   await page.getByLabel(/^Message/).fill("Hello, I would like to learn more about your funds.");
  68  |   await form.getByText(/I agree that Nymbus Capital uses these details only to answer my request/).click();
  69  |   await expect(page.getByTestId("contact-consent")).toBeChecked();
  70  |   await form.scrollIntoViewIfNeeded();
  71  |   await page.screenshot({ path: `${SHOTS}/contact-step3-${info.project.name}.png`, fullPage: false });
  72  |   await page.getByTestId("contact-form").screenshot({ path: `${SHOTS}/contact-form-step3-${info.project.name}.png` });
  73  |   await page.waitForTimeout(3200); // the timing token: no post within 3 s of the page render
  74  |   const posted = page.waitForResponse((r) => r.url().endsWith("/api/contact") && r.request().method() === "POST");
  75  |   await send.click();
  76  |   expect((await posted).status()).toBe(200);
  77  |   const sent = page.getByTestId("contact-sent");
  78  |   await expect(sent).toBeVisible();
  79  |   await expect(sent).toContainText("Message sent");
  80  |   await expect(page.locator(".ct-wrap [role=status]")).toHaveText("Message sent");
  81  |   await page.locator(".ct-card").screenshot({ path: `${SHOTS}/contact-sent-${info.project.name}.png` });
  82  |   // another message starts over at step 1
  83  |   await sent.getByRole("link", { name: /send another message/i }).click();
  84  |   await expect(page.getByTestId("contact-form")).toBeVisible();
> 85  |   await expect(page.getByRole("group", { name: /what type of investor/i })).toBeVisible();
      |                                                                             ^ Error: expect(locator).toBeVisible() failed
  86  |   // office details and the mailto / phone alternatives remain
  87  |   await expect(page.locator('a[href^="tel:+15149851138"]').first()).toBeVisible();
  88  |   await expect(page.locator('a[href^="mailto:info@nymbus.ca"]').first()).toBeAttached();
  89  |   await expect(page.locator("iframe")).toHaveCount(0);
  90  | });
  91  | 
  92  | test("contact: French form, server-side field errors shown at their step", async ({ page, baseURL }, info) => {
  93  |   await page.emulateMedia({ reducedMotion: "reduce" });
  94  |   await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: baseURL! }]);
  95  |   await page.setExtraHTTPHeaders({ "x-forwarded-for": ip() });
  96  |   await page.goto("/contact");
  97  |   await fillSteps(page, `E2E Visiteur ${info.project.name}`, true);
  98  |   const form = page.getByTestId("contact-form");
  99  |   await expect(form.getByText(/J’accepte que Nymbus Capital utilise ces renseignements uniquement/)).toBeVisible();
  100 |   await form.scrollIntoViewIfNeeded();
  101 |   await page.getByTestId("contact-form").screenshot({ path: `${SHOTS}/contact-form-step3-fr-${info.project.name}.png` });
  102 |   // the server is the authority: a field it refuses (here forced through the API shape) comes back to its step
  103 |   await page.route("**/api/contact", (route) => route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: "invalid_input", fields: ["interests"] }) }));
  104 |   await form.getByText(/J’accepte que Nymbus Capital/).click();
  105 |   await form.getByRole("button", { name: /envoyer mon message/i }).click();
  106 |   await expect(form.getByText("Veuillez choisir au moins un intérêt.")).toBeVisible();
  107 |   await page.unroute("**/api/contact");
  108 |   // a failure keeps the form and offers the e-mail instead
  109 |   await page.route("**/api/contact", (route) => route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ error: "rate_limited" }) }));
  110 |   await form.getByRole("button", { name: /^continuer/i }).click();
  111 |   await form.getByRole("button", { name: /envoyer mon message/i }).click();
  112 |   const fail = page.getByTestId("contact-fail");
  113 |   await expect(fail).toContainText("Trop de tentatives");
  114 |   await expect(fail.getByRole("link")).toHaveAttribute("href", /^mailto:info@nymbus\.ca\?subject=Demande%20du%20site%20Web/);
  115 |   await expect(page.getByLabel("Nom complet")).toHaveValue(`E2E Visiteur ${info.project.name}`);
  116 |   await page.getByTestId("contact-form").screenshot({ path: `${SHOTS}/contact-fail-fr-${info.project.name}.png` });
  117 |   // once the server answers again, the same form is sent (French success state)
  118 |   await page.unroute("**/api/contact");
  119 |   await page.waitForTimeout(3200); // the timing token: no post within 3 s of the page render
  120 |   const posted = page.waitForResponse((r) => r.url().endsWith("/api/contact") && r.request().method() === "POST");
  121 |   await form.getByRole("button", { name: /envoyer mon message/i }).click();
  122 |   expect((await posted).status()).toBe(200);
  123 |   const sent = page.getByTestId("contact-sent");
  124 |   await expect(sent).toContainText("Message envoyé");
  125 |   await expect(sent.getByText("Message envoyé", { exact: true })).toBeFocused();
  126 |   await page.locator(".ct-card").screenshot({ path: `${SHOTS}/contact-sent-fr-${info.project.name}.png` });
  127 | });
  128 | 
  129 | test("contact: works without JavaScript (native post, redirect back with the result)", async ({ browser }, info) => {
  130 |   const ctx = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce", extraHTTPHeaders: { "x-forwarded-for": ip() }, ...(info.project.name === "mobile" ? { viewport: { width: 412, height: 915 } } : {}) });
  131 |   const page = await ctx.newPage();
  132 |   await page.goto("/contact");
  133 |   const form = page.getByTestId("contact-form");
  134 |   await expect(form).not.toHaveAttribute("data-live", "");
  135 |   // every step is shown; the browser validates the required fields itself
  136 |   await form.getByText("Financial advisor", { exact: true }).click();
  137 |   await form.getByText("General inquiry", { exact: true }).click();
  138 |   await page.getByLabel("Full name").fill(`E2E NoScript ${info.project.name}`);
  139 |   await page.getByLabel("Email address").fill("noscript@example.com");
  140 |   await form.getByText(/I agree that Nymbus Capital uses these details/).click();
  141 |   await page.waitForTimeout(3200);
  142 |   await form.getByRole("button", { name: /send my message/i }).click();
  143 |   await expect(page).toHaveURL(/\/contact\?sent=1/);
  144 |   await expect(page.getByTestId("contact-sent")).toBeVisible();
  145 |   // an error comes back the same way
  146 |   await page.goto("/contact?error=rate_limited");
  147 |   await expect(page.getByTestId("contact-fail")).toContainText("Too many attempts");
  148 |   await page.goto("/contact?error=<script>");
  149 |   await expect(page.getByTestId("contact-fail")).toContainText("Not sent");
  150 |   await ctx.close();
  151 | });
  152 | 
  153 | test.describe("POST /api/contact guards", () => {
  154 |   const valid = (t: string, name: string) => ({ profile: "Other", interests: ["General inquiry"], name, email: "api@example.com", phone: "", company: "", message: "From the API test", consent: true, website: "", t, lang: "en" });
  155 | 
  156 |   test("same origin, content type, size, method", async ({ request }) => {
  157 |     const xff = { "x-forwarded-for": ip() };
  158 |     const t = await token(request);
  159 |     const data = JSON.stringify(valid(t, "Guard Test"));
  160 |     expect((await request.post("/api/contact", { headers: { ...xff, "content-type": "application/json" }, data })).status(), "no Origin").toBe(403);
  161 |     expect((await request.post("/api/contact", { headers: { ...xff, origin: "https://evil.example", "content-type": "application/json" }, data })).status()).toBe(403);
  162 |     expect((await request.post("/api/contact", { headers: { ...xff, origin: BASE, "sec-fetch-site": "cross-site", "content-type": "application/json" }, data })).status()).toBe(403);
  163 |     expect((await request.post("/api/contact", { headers: { ...xff, origin: BASE, "content-type": "text/plain" }, data })).status()).toBe(415);
  164 |     const big = JSON.stringify({ ...valid(t, "Big"), message: "x".repeat(20_000) });
  165 |     expect((await request.post("/api/contact", { headers: { "x-forwarded-for": ip(), origin: BASE, "content-type": "application/json" }, data: big })).status()).toBe(413);
  166 |     expect((await request.get("/api/contact")).status()).toBe(405);
  167 |   });
  168 | 
  169 |   test("invalid fields are listed; bots get a fake success and nothing is stored", async ({ request }, info) => {
  170 |     const h = { "x-forwarded-for": ip(), origin: BASE, "content-type": "application/json" };
  171 |     const t = await token(request);
  172 |     await new Promise((r) => setTimeout(r, 3200));
  173 |     const bad = await request.post("/api/contact", { headers: h, data: JSON.stringify({ ...valid(t, "<b>x</b>"), email: "nope", consent: false, interests: ["Bitcoin"] }) });
  174 |     expect(bad.status()).toBe(400);
  175 |     expect((await bad.json()).fields).toEqual(["interests", "name", "email", "consent"]);
  176 |     // honeypot filled, or posted too fast with a fresh token, or without a token: 200 { ok: true }, not stored
  177 |     // (admin.spec.ts checks that "E2E Bot" never reaches the inquiries)
  178 |     const hp = await request.post("/api/contact", { headers: h, data: JSON.stringify({ ...valid(t, `E2E Bot honeypot ${info.project.name}`), website: "http://spam.example" }) });
  179 |     expect(hp.status()).toBe(200);
  180 |     expect(await hp.json()).toEqual({ ok: true });
  181 |     const fresh = await token(request);
  182 |     const fast = await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": ip() }, data: JSON.stringify(valid(fresh, `E2E Bot fast ${info.project.name}`)) });
  183 |     expect(fast.status()).toBe(200);
  184 |     const none = await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": ip() }, data: JSON.stringify(valid("", `E2E Bot token ${info.project.name}`)) });
  185 |     expect(none.status()).toBe(200);
```