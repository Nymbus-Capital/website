# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> admin flows >> rankings: seeded RBC entry shown; new entry draft → stale hidden → fresh shown with source and date; brand image slots
- Location: e2e/admin.spec.ts:649:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('brand-morningstar-stars-4')
Expected substring: "missing"
Received string:    "Morningstar rating image, 4 starsmorningstar-stars-4shippedupload"
Timeout: 10000ms

Call log:
  - Expect "toContainText" getByTestId('brand-morningstar-stars-4') with timeout 10000ms
  - waiting for getByTestId('brand-morningstar-stars-4')
    24 × locator resolved to <tr data-slot="morningstar-stars-4" data-testid="brand-morningstar-stars-4">…</tr>
       - unexpected value "Morningstar rating image, 4 starsmorningstar-stars-4shippedupload"

```

```yaml
- row "Morningstar rating image, 4 stars morningstar-stars-4 shipped Morningstar rating image, 4 stars upload upload morningstar-stars-4":
  - cell "Morningstar rating image, 4 stars morningstar-stars-4"
  - cell "shipped"
  - cell "Morningstar rating image, 4 stars":
    - img "Morningstar rating image, 4 stars"
  - cell "upload upload morningstar-stars-4":
    - text: upload
    - button "upload morningstar-stars-4"
```

# Test source

```ts
  666 |     await page.goto(`/admin/funds/${fund}`);
  667 |     const ed = page.getByTestId("tp-editor");
  668 |     await expect(ed.getByTestId("tp-status-0")).toHaveText("shown on the site");
  669 |     await expect(page.getByTestId("morningstar-assets-missing")).toHaveCount(0);
  670 |     // a new eVestment entry: draft, then confirmed but stale (hidden), then fresh (shown)
  671 |     await page.getByTestId("tp-add-evestment").click();
  672 |     await expect(ed.getByTestId("tp-status-1")).toHaveText("draft — hidden");
  673 |     const n = "eVestment 2";
  674 |     const label = (s: string) => page.getByLabel(`${n} ${s}`, { exact: true });
  675 |     await label("class").fill("Strategy composite");
  676 |     await label("peer group (EN)").fill("Canadian Core Plus Fixed Income");
  677 |     await label("peer group (FR)").fill("Revenu fixe canadien de base plus");
  678 |     await label("as of").fill("2025-12-31");
  679 |     await label("source URL").fill("https://www.evestment.example/e2e-ranking");
  680 |     await ed.getByTestId("tp-entry-1").getByRole("button", { name: "add period", exact: true }).click();
  681 |     await label("percentile 1M").fill("3");
  682 |     await label("confirmed").check();
  683 |     await expect(ed.getByTestId("tp-status-1")).toHaveText("out of date — hidden");
  684 |     await page.getByTestId("save-fund").click();
  685 |     await expect(page.locator(".adm-toast.ok")).toContainText("Saved");
  686 |     await shot(page, "rankings", info.project.name);
  687 | 
  688 |     // stale: neither on the page nor in its payload
  689 |     const staleHtml = await request.get(`/strategies/${fund}`).then((r) => r.text());
  690 |     expect(staleHtml).not.toContain("e2e-ranking");
  691 |     await page.goto(`/strategies/${fund}#awards`);
  692 |     await expect(page.getByTestId("awards")).toBeVisible();
  693 |     await expect(page.getByTestId("tp-evestment")).toHaveCount(0);
  694 |     await expect(page.getByTestId("tp-rbc-pfs")).toBeVisible();
  695 | 
  696 |     // fresh (end of the last quarter): shown on the awards tab, with source link and date
  697 |     const now = new Date();
  698 |     const qEnd = new Date(Date.UTC(now.getUTCFullYear(), Math.floor(now.getUTCMonth() / 3) * 3, 0))
  699 |       .toISOString()
  700 |       .slice(0, 10);
  701 |     await page.goto(`/admin/funds/${fund}`);
  702 |     await label("as of").fill(qEnd);
  703 |     await expect(page.getByTestId("tp-editor").getByTestId("tp-status-1")).toHaveText("shown on the site");
  704 |     await page.getByTestId("save-fund").click();
  705 |     await expect(page.locator(".adm-toast.ok")).toContainText("Saved");
  706 |     await page.goto(`/strategies/${fund}#awards`);
  707 |     const entry = page.getByTestId("tp-evestment");
  708 |     await expect(entry).toBeVisible();
  709 |     await expect(entry.getByTestId("tp-row-1M")).toContainText("3rd percentile");
  710 |     await expect(entry.getByRole("link", { name: /eVestment/ })).toHaveAttribute(
  711 |       "href",
  712 |       "https://www.evestment.example/e2e-ranking",
  713 |     );
  714 | 
  715 |     // a confirmed entry without its source URL is refused by the API
  716 |     const cur = (await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json()).content;
  717 |     const noUrl = { ...cur.funds[fund].rankings.thirdParty[1], url: undefined };
  718 |     const bad = await request.put(`/api/admin/content/funds/${fund}`, {
  719 |       headers: adminHeaders(token),
  720 |       data: {
  721 |         version: cur.version,
  722 |         fund: { ...cur.funds[fund], rankings: { ...cur.funds[fund].rankings, thirdParty: [noUrl] } },
  723 |       },
  724 |     });
  725 |     expect(bad.status()).toBe(400);
  726 |     expect(await bad.text()).toContain("source URL");
  727 | 
  728 |     // restore the seeded content
  729 |     const restore = await request.put(`/api/admin/content/funds/${fund}`, {
  730 |       headers: adminHeaders(token),
  731 |       data: { version: cur.version, fund: original },
  732 |     });
  733 |     expect(restore.status(), await restore.text()).toBe(200);
  734 | 
  735 |     // brand image slots: plain image accepted and served with its exact type, an active SVG refused, removal
  736 |     const svgBad = await request.post("/api/admin/upload/brand", {
  737 |       headers: adminHeaders(token, false),
  738 |       multipart: {
  739 |         slot: "gmr-logo",
  740 |         file: { name: "x.svg", mimeType: "image/svg+xml", buffer: Buffer.from('<svg onload="alert(1)"></svg>') },
  741 |       },
  742 |     });
  743 |     expect(svgBad.status()).toBe(415);
  744 |     const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
  745 |     const up = await request.post("/api/admin/upload/brand", {
  746 |       headers: adminHeaders(token, false),
  747 |       multipart: { slot: "gmr-logo", file: { name: "gmr.png", mimeType: "image/png", buffer: png } },
  748 |     });
  749 |     expect(up.status(), await up.text()).toBe(201);
  750 |     const img = await request.get("/api/brand/gmr-logo");
  751 |     expect(img.status()).toBe(200);
  752 |     expect(img.headers()["content-type"]).toBe("image/png");
  753 |     expect(img.headers()["x-content-type-options"]).toBe("nosniff");
  754 |     expect(img.headers()["content-security-policy"]).toContain("sandbox");
  755 |     expect((await request.get("/api/brand/not-a-slot")).status()).toBe(404);
  756 |     expect(
  757 |       (
  758 |         await request.post("/api/admin/upload/brand", {
  759 |           multipart: { slot: "gmr-logo", file: { name: "gmr.png", mimeType: "image/png", buffer: png } },
  760 |         })
  761 |       ).status(),
  762 |     ).toBe(401);
  763 |     await page.goto("/admin/settings");
  764 |     await expect(page.getByTestId("brand-gmr-logo")).toContainText("uploaded");
  765 |     await expect(page.getByTestId("brand-morningstar-logo")).toContainText("shipped");
> 766 |     await expect(page.getByTestId("brand-morningstar-stars-4")).toContainText("missing");
      |                                                                 ^ Error: expect(locator).toContainText(expected) failed
  767 |     const del = await request.delete("/api/admin/brand/gmr-logo", { headers: adminHeaders(token, false) });
  768 |     expect(del.status()).toBe(200);
  769 |     expect((await request.get("/api/brand/gmr-logo")).status()).toBe(404);
  770 |   });
  771 | 
  772 |   test("inquiries: contact form messages listed (bots filtered), marked handled, deleted, audited without personal data", async ({
  773 |     page,
  774 |     context,
  775 |     request,
  776 |   }, info) => {
  777 |     const token = await signIn(context);
  778 |     // unauthenticated: the page goes to sign-in, the API answers 401, a mutation without the CSRF header is refused
  779 |     expect((await request.get("/admin/inquiries", { maxRedirects: 0 })).status()).toBe(302);
  780 |     // one inquiry of this project, posted through the public API once the form's 3 s timing window has passed
  781 |     const html = await (await request.get("/contact")).text();
  782 |     const t = /name="t" value="(v1\.[^"]+)"/.exec(html)![1];
  783 |     await page.waitForTimeout(3200);
  784 |     const name = `E2E Admin ${info.project.name}`;
  785 |     const post = () =>
  786 |       request.post("/api/contact", {
  787 |         headers: {
  788 |           origin: BASE,
  789 |           "content-type": "application/json",
  790 |           "x-forwarded-for": info.project.name === "admin-mobile" ? "2001:db8:a:2::1" : "2001:db8:a:1::1",
  791 |         },
  792 |         data: JSON.stringify({
  793 |           profile: "Institution",
  794 |           interests: ["General inquiry"],
  795 |           name,
  796 |           email: "admin-test@example.com",
  797 |           phone: "+1 514 555 0100",
  798 |           company: "=E2E Pension",
  799 |           message: "Line one\n<script>alert(1)</script>",
  800 |           consent: true,
  801 |           website: "",
  802 |           t,
  803 |           lang: "fr",
  804 |         }),
  805 |       });
  806 |     expect((await post()).status()).toBe(200);
  807 |     // the same message sent again (double click, reload) answers OK but is stored once (checked below: one card)
  808 |     expect((await post()).status()).toBe(200);
  809 | 
  810 |     const dialogs: string[] = [];
  811 |     page.on("dialog", (d) => {
  812 |       dialogs.push(d.message());
  813 |       void d.dismiss();
  814 |     });
  815 |     expect((await page.goto("/admin/inquiries"))?.status()).toBe(200);
  816 |     await expect(page.getByRole("heading", { level: 1, name: "messages" })).toBeVisible();
  817 |     await expect(page.locator("#admin-main")).toContainText("deleted automatically 180 days after it was received");
  818 |     const list = page.getByTestId("inquiries");
  819 |     await list.getByLabel("filter by status").selectOption("all");
  820 |     // the public tests' inquiries are there (with and without JavaScript), the bots' never are
  821 |     await expect(list).toContainText("E2E Visitor");
  822 |     await expect(list).toContainText("E2E NoScript");
  823 |     await expect(list).not.toContainText("E2E Bot");
  824 |     const card = list.locator("article", { hasText: name });
  825 |     await expect(card).toHaveCount(1);
  826 |     await expect(card.getByTestId("inquiry-message")).toHaveText(/Line one\s+<script>alert\(1\)<\/script>/); // plain text, never markup
  827 |     await expect(card.getByRole("link", { name: "admin-test@example.com" })).toHaveAttribute(
  828 |       "href",
  829 |       "mailto:admin-test@example.com",
  830 |     );
  831 |     await expect(card).toContainText("E2E Pension");
  832 |     await expect(card).toContainText("français");
  833 |     await shot(page, "inquiries", info.project.name);
  834 | 
  835 |     // CSV export: admin only, formula-like cells neutralised, audited
  836 |     expect((await request.get("/api/admin/inquiries/export")).status()).toBe(401);
  837 |     await expect(list.getByTestId("inquiries-export")).toHaveAttribute("href", "/api/admin/inquiries/export");
  838 |     const csv = await request.get("/api/admin/inquiries/export", { headers: adminHeaders(token, false) });
  839 |     expect(csv.status()).toBe(200);
  840 |     expect(csv.headers()["content-type"]).toMatch(/^text\/csv/);
  841 |     expect(csv.headers()["content-disposition"]).toMatch(
  842 |       /^attachment; filename="nymbus-website-messages-\d{4}-\d{2}-\d{2}\.csv"$/,
  843 |     );
  844 |     const csvText = await csv.text();
  845 |     expect(csvText.split("\r\n")[0]).toContain("id,received_at,status");
  846 |     expect(csvText).toContain(name);
  847 |     expect(csvText).toContain("'=E2E Pension");
  848 |     expect(csvText).not.toContain(",=E2E Pension");
  849 | 
  850 |     await card.getByTestId("inquiry-handled").click();
  851 |     await expect(card.getByTestId("inquiry-reopen")).toBeVisible();
  852 |     await expect(card.locator(".adm-pill", { hasText: /^handled$/ })).toBeVisible();
  853 |     const id = await card.getAttribute("data-inquiry-id");
  854 |     // the JSON API agrees, and refuses a mutation without the CSRF header
  855 |     const listed = (await (
  856 |       await request.get("/api/admin/inquiries", { headers: adminHeaders(token, false) })
  857 |     ).json()) as { inquiries: { id: string; handled: { by: string } | null }[] };
  858 |     expect(listed.inquiries.find((x) => x.id === id)?.handled?.by).toBe("alice@nymbus.ca");
  859 |     const csrf = await request.fetch(`/api/admin/inquiries/${id}`, {
  860 |       method: "PATCH",
  861 |       headers: { cookie: `${SESSION_COOKIE}=${token}`, origin: BASE, "content-type": "text/plain" },
  862 |       data: JSON.stringify({ handled: false }),
  863 |     });
  864 |     expect(csrf.status()).toBe(403);
  865 |     const unknownKey = await request.fetch(`/api/admin/inquiries/${id}`, {
  866 |       method: "PATCH",
```