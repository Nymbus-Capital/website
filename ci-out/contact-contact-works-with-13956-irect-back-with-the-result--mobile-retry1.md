# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contact.spec.ts >> contact: works without JavaScript (native post, redirect back with the result)
- Location: e2e/contact.spec.ts:137:5

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/contact\?sent=1/
Received string:  "http://localhost:3100/contact?error=rate_limited#contact-form"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    23 × locator resolved to <html lang="en">…</html>
       - unexpected value "http://localhost:3100/contact?error=rate_limited#contact-form"

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
    - alert:
      - paragraph: Too many attempts. Please try again later or email us.
      - link "Email us instead":
        - /url: mailto:info@nymbus.ca
    - alert
    - list "Form progress":
      - listitem
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
    - group "What are you interested in?":
      - text: What are you interested in?
      - paragraph: Choose one or more.
      - checkbox "Monthly Income"
      - text: Monthly Income
      - checkbox "Sustainable Enhanced Bonds"
      - text: Sustainable Enhanced Bonds
      - checkbox "Multi-Strategy"
      - text: Multi-Strategy
      - checkbox "Global Minimum Volatility"
      - text: Global Minimum Volatility
      - checkbox "Custom mandate"
      - text: Custom mandate
      - checkbox "General inquiry"
      - text: General inquiry
    - group "Your contact details":
      - text: Your contact details Full name
      - textbox "Full name"
      - text: Email address
      - textbox "Email address"
      - text: Phone (optional)
      - textbox "Phone (optional)"
      - text: Organization (optional)
      - textbox "Organization (optional)"
      - text: Message (optional)
      - textbox "Message (optional)":
        - /placeholder: Tell us about your needs
      - checkbox "I agree that Nymbus Capital uses these details only to answer my request. Privacy policy"
      - text: I agree that Nymbus Capital uses these details only to answer my request.
      - link "Privacy policy":
        - /url: /privacy
      - button "Send my message"
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
  - text: © 2026 Nymbus Capital Inc. All rights reserved. PRI signatory
```

# Test source

```ts
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
  63  |   await expect(form.getByTestId("contact-errors")).toHaveText("Please check: Full name, Email address, Consent");
  64  |   await expect(form.getByTestId("contact-errors")).toHaveAttribute("role", "alert");
  65  |   await expect(page.getByLabel("Full name")).toBeFocused(); // focus goes to the first field to fix
  66  |   await expect(form.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");
  67  |   await page.getByLabel("Full name").fill(`E2E Visitor ${info.project.name}`);
  68  |   await page.getByLabel("Email address").fill("visitor@example.com");
  69  |   await page.getByLabel(/^Message/).fill("Hello, I would like to learn more about your funds.");
  70  |   await form.getByText(/I agree that Nymbus Capital uses these details only to answer my request/).click();
  71  |   await expect(page.getByTestId("contact-consent")).toBeChecked();
  72  |   await form.scrollIntoViewIfNeeded();
  73  |   await page.screenshot({ path: `${SHOTS}/contact-step3-${info.project.name}.png`, fullPage: false });
  74  |   await page.getByTestId("contact-form").screenshot({ path: `${SHOTS}/contact-form-step3-${info.project.name}.png` });
  75  |   await page.waitForTimeout(3200); // the timing token: no post within 3 s of the page render
  76  |   const posted = page.waitForResponse((r) => r.url().endsWith("/api/contact") && r.request().method() === "POST");
  77  |   await send.click();
  78  |   expect((await posted).status()).toBe(200);
  79  |   const sent = page.getByTestId("contact-sent");
  80  |   await expect(sent).toBeVisible();
  81  |   await expect(sent).toContainText("Message sent");
  82  |   await expect(page.locator(".ct-wrap [role=status]")).toHaveText("Message sent");
  83  |   await page.locator(".ct-card").screenshot({ path: `${SHOTS}/contact-sent-${info.project.name}.png` });
  84  |   // another message starts over at step 1
  85  |   await sent.getByRole("link", { name: /send another message/i }).click();
  86  |   await expect(page.getByTestId("contact-form")).toBeVisible();
  87  |   await expect(page.getByRole("group", { name: /who are you/i })).toBeVisible();
  88  |   // office details and the mailto / phone alternatives remain
  89  |   await expect(page.locator('a[href^="tel:+15149851138"]').first()).toBeVisible();
  90  |   await expect(page.locator('a[href^="mailto:info@nymbus.ca"]').first()).toBeAttached();
  91  |   await expect(page.locator("iframe")).toHaveCount(0);
  92  | });
  93  | 
  94  | test("contact: French form, server-side field errors shown at their step", async ({ page, baseURL }, info) => {
  95  |   await page.emulateMedia({ reducedMotion: "reduce" });
  96  |   await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: baseURL! }]);
  97  |   await page.setExtraHTTPHeaders({ "x-forwarded-for": ip() });
  98  |   await page.goto("/contact");
  99  |   await fillSteps(page, `E2E Visiteur ${info.project.name}`, true);
  100 |   const form = page.getByTestId("contact-form");
  101 |   await expect(form.getByText(/J’accepte que Nymbus Capital utilise ces renseignements uniquement/)).toBeVisible();
  102 |   await form.scrollIntoViewIfNeeded();
  103 |   await page.getByTestId("contact-form").screenshot({ path: `${SHOTS}/contact-form-step3-fr-${info.project.name}.png` });
  104 |   // the send button's label fits inside the button and the button inside the form (phones: its own row)
  105 |   const send = form.locator('button[type="submit"]');
  106 |   expect(await send.evaluate((b) => b.scrollWidth <= b.clientWidth + 1)).toBe(true);
  107 |   const [fb, sb] = [await form.boundingBox(), await send.boundingBox()];
  108 |   expect(sb!.x).toBeGreaterThanOrEqual(fb!.x - 1);
  109 |   expect(sb!.x + sb!.width).toBeLessThanOrEqual(fb!.x + fb!.width + 1);
  110 |   // the server is the authority: a field it refuses (here forced through the API shape) comes back to its step
  111 |   await page.route("**/api/contact", (route) => route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: "invalid_input", fields: ["interests"] }) }));
  112 |   await form.getByText(/J’accepte que Nymbus Capital/).click();
  113 |   await form.getByRole("button", { name: /envoyer mon message/i }).click();
  114 |   await expect(form.getByText("Veuillez choisir au moins un intérêt.")).toBeVisible();
  115 |   await page.unroute("**/api/contact");
  116 |   // a failure keeps the form and offers the e-mail instead
  117 |   await page.route("**/api/contact", (route) => route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ error: "rate_limited" }) }));
  118 |   await form.getByRole("button", { name: /^continuer/i }).click();
  119 |   await form.getByRole("button", { name: /envoyer mon message/i }).click();
  120 |   const fail = page.getByTestId("contact-fail");
  121 |   await expect(fail).toContainText("Trop de tentatives");
  122 |   await expect(fail.getByRole("link")).toHaveAttribute("href", /^mailto:info@nymbus\.ca\?subject=Demande%20du%20site%20Web/);
  123 |   await expect(page.getByLabel("Nom complet")).toHaveValue(`E2E Visiteur ${info.project.name}`);
  124 |   await page.getByTestId("contact-form").screenshot({ path: `${SHOTS}/contact-fail-fr-${info.project.name}.png` });
  125 |   // once the server answers again, the same form is sent (French success state)
  126 |   await page.unroute("**/api/contact");
  127 |   await page.waitForTimeout(3200); // the timing token: no post within 3 s of the page render
  128 |   const posted = page.waitForResponse((r) => r.url().endsWith("/api/contact") && r.request().method() === "POST");
  129 |   await form.getByRole("button", { name: /envoyer mon message/i }).click();
  130 |   expect((await posted).status()).toBe(200);
  131 |   const sent = page.getByTestId("contact-sent");
  132 |   await expect(sent).toContainText("Message envoyé");
  133 |   await expect(sent.getByText("Message envoyé", { exact: true })).toBeFocused();
  134 |   await page.locator(".ct-card").screenshot({ path: `${SHOTS}/contact-sent-fr-${info.project.name}.png` });
  135 | });
  136 | 
  137 | test("contact: works without JavaScript (native post, redirect back with the result)", async ({ browser }, info) => {
  138 |   const ctx = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce", extraHTTPHeaders: { "x-forwarded-for": ip() }, ...(info.project.name === "mobile" ? { viewport: { width: 412, height: 915 } } : {}) });
  139 |   const page = await ctx.newPage();
  140 |   await page.goto("/contact");
  141 |   const form = page.getByTestId("contact-form");
  142 |   await expect(form).not.toHaveAttribute("data-live", "");
  143 |   // every step is shown; the browser validates the required fields itself
  144 |   await form.getByText("Financial advisor", { exact: true }).click();
  145 |   await form.getByText("General inquiry", { exact: true }).click();
  146 |   await page.getByLabel("Full name").fill(`E2E NoScript ${info.project.name}`);
  147 |   await page.getByLabel("Email address").fill("noscript@example.com");
  148 |   await form.getByText(/I agree that Nymbus Capital uses these details/).click();
  149 |   await page.waitForTimeout(3200);
  150 |   await form.getByRole("button", { name: /send my message/i }).click();
> 151 |   await expect(page).toHaveURL(/\/contact\?sent=1/);
      |                      ^ Error: expect(page).toHaveURL(expected) failed
  152 |   await expect(page.getByTestId("contact-sent")).toBeVisible();
  153 |   // a field the server refuses comes back as its code only (never the value), with its message and the summary
  154 |   await page.goto("/contact");
  155 |   await form.getByText("Other", { exact: true }).click();
  156 |   await form.getByText("General inquiry", { exact: true }).click();
  157 |   await page.getByLabel("Full name").fill(`E2E NoScript bad phone ${info.project.name}`);
  158 |   await page.getByLabel("Email address").fill("noscript@example.com");
  159 |   await page.getByLabel(/^Phone/).fill("call me maybe");
  160 |   await form.getByText(/I agree that Nymbus Capital uses these details/).click();
  161 |   await page.waitForTimeout(3200);
  162 |   await form.getByRole("button", { name: /send my message/i }).click();
  163 |   await expect(page).toHaveURL(/\/contact\?error=invalid_input&fields=phone#contact-form$/);
  164 |   expect(page.url()).not.toMatch(/call|maybe|noscript/i);
  165 |   await expect(page.getByTestId("contact-errors")).toHaveText("Please check: Phone");
  166 |   await expect(page.getByText("Please check the phone number.")).toBeVisible();
  167 |   await expect(page.getByLabel(/^Phone/)).toHaveAttribute("aria-describedby", "ct-e-phone");
  168 |   // an error comes back the same way
  169 |   await page.goto("/contact?error=rate_limited");
  170 |   await expect(page.getByTestId("contact-fail")).toContainText("Too many attempts");
  171 |   await page.goto("/contact?error=<script>");
  172 |   await expect(page.getByTestId("contact-fail")).toContainText("Not sent");
  173 |   await ctx.close();
  174 | });
  175 | 
  176 | test.describe("POST /api/contact guards", () => {
  177 |   const valid = (t: string, name: string) => ({ profile: "Other", interests: ["General inquiry"], name, email: "api@example.com", phone: "", company: "", message: "From the API test", consent: true, website: "", t, lang: "en" });
  178 | 
  179 |   test("same origin, content type, size, method", async ({ request }) => {
  180 |     const xff = { "x-forwarded-for": ip() };
  181 |     const t = await token(request);
  182 |     const data = JSON.stringify(valid(t, "Guard Test"));
  183 |     expect((await request.post("/api/contact", { headers: { ...xff, "content-type": "application/json" }, data })).status(), "no Origin").toBe(403);
  184 |     expect((await request.post("/api/contact", { headers: { ...xff, origin: "https://evil.example", "content-type": "application/json" }, data })).status()).toBe(403);
  185 |     expect((await request.post("/api/contact", { headers: { ...xff, origin: BASE, "sec-fetch-site": "cross-site", "content-type": "application/json" }, data })).status()).toBe(403);
  186 |     expect((await request.post("/api/contact", { headers: { ...xff, origin: BASE, "content-type": "text/plain" }, data })).status()).toBe(415);
  187 |     const big = JSON.stringify({ ...valid(t, "Big"), message: "x".repeat(20_000) });
  188 |     expect((await request.post("/api/contact", { headers: { "x-forwarded-for": ip(), origin: BASE, "content-type": "application/json" }, data: big })).status()).toBe(413);
  189 |     expect((await request.get("/api/contact")).status()).toBe(405);
  190 |   });
  191 | 
  192 |   test("invalid fields are listed; bots get a fake success and nothing is stored", async ({ request }, info) => {
  193 |     const h = { "x-forwarded-for": ip(), origin: BASE, "content-type": "application/json" };
  194 |     const t = await token(request);
  195 |     await new Promise((r) => setTimeout(r, 3200));
  196 |     const bad = await request.post("/api/contact", { headers: h, data: JSON.stringify({ ...valid(t, "<b>x</b>"), email: "nope", consent: false, interests: ["Bitcoin"] }) });
  197 |     expect(bad.status()).toBe(400);
  198 |     expect((await bad.json()).fields).toEqual(["interests", "name", "email", "consent"]);
  199 |     // honeypot filled, or posted too fast with a fresh token, or without a token: 200 { ok: true }, not stored
  200 |     // (admin.spec.ts checks that "E2E Bot" never reaches the inquiries)
  201 |     const hp = await request.post("/api/contact", { headers: h, data: JSON.stringify({ ...valid(t, `E2E Bot honeypot ${info.project.name}`), website: "http://spam.example" }) });
  202 |     expect(hp.status()).toBe(200);
  203 |     expect(await hp.json()).toEqual({ ok: true });
  204 |     const fresh = await token(request);
  205 |     const fast = await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": ip() }, data: JSON.stringify(valid(fresh, `E2E Bot fast ${info.project.name}`)) });
  206 |     expect(fast.status()).toBe(200);
  207 |     const none = await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": ip() }, data: JSON.stringify(valid("", `E2E Bot token ${info.project.name}`)) });
  208 |     expect(none.status()).toBe(200);
  209 |   });
  210 | 
  211 |   test("per-client rate limit (5 attempts / 15 min), keyed on the rightmost forwarded address", async ({ request }) => {
  212 |     const addr = ip();
  213 |     const h = { origin: BASE, "content-type": "application/json" };
  214 |     // no timing token: answered like a success and dropped (bot path), but every attempt counts against the client
  215 |     const body = JSON.stringify({ name: "x" });
  216 |     for (let i = 0; i < 5; i++) {
  217 |       // a forged left part does not change the client: always the same bucket
  218 |       const r = await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": `198.51.100.${i}, ${addr}` }, data: body });
  219 |       expect(r.status(), `attempt ${i + 1}`).toBe(200);
  220 |     }
  221 |     const limited = await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": `198.51.100.99, ${addr}` }, data: body });
  222 |     expect(limited.status()).toBe(429);
  223 |     expect(limited.headers()["retry-after"]).toBe("900");
  224 |     expect((await request.post("/api/contact", { headers: { ...h, "x-forwarded-for": ip() }, data: body })).status()).toBe(200);
  225 |   });
  226 | });
  227 | 
```