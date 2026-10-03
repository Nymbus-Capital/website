# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dialog.spec.ts >> team: a press that starts inside the bio and ends on the backdrop does not close it
- Location: e2e/dialog.spec.ts:68:5

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 44
Received:    8.390625
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main"
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "Nymbus Capital, home" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "nymbus" [ref=e6]
      - navigation "Primary"
      - generic [ref=e15]:
        - button "Afficher le site en français" [ref=e16] [cursor=pointer]:
          - generic [aria-hidden] [ref=e17]: en
          - generic [aria-hidden] [ref=e18]: fr
        - button "Open menu" [ref=e19] [cursor=pointer]
  - main [ref=e21]:
    - generic [ref=e22]:
      - generic [ref=e37]:
        - navigation "Breadcrumb" [ref=e38]:
          - list [ref=e39]:
            - listitem [ref=e40]:
              - link "Home" [ref=e41] [cursor=pointer]:
                - /url: /
            - listitem [ref=e44]:
              - generic [ref=e45]: About Nymbus
        - generic [ref=e46]:
          - generic [ref=e47]:
            - paragraph [ref=e49]: About Nymbus
            - heading "Scientists and market veterans" [level=1] [ref=e51]:
              - generic [aria-hidden] [ref=e52]:
                - generic [ref=e53]: Scientists
                - generic [ref=e54]: and
                - generic [ref=e55]: market
                - generic [ref=e56]: veterans
            - generic [ref=e57]: Independent Montreal manager of systematic fixed income and futures overlays, since 2013.
            - generic [ref=e60]:
              - link "Meet the team" [ref=e61] [cursor=pointer]:
                - /url: "#people"
              - link "Contact us" [ref=e64] [cursor=pointer]:
                - /url: /contact
          - generic [ref=e66]:
            - generic [ref=e67]:
              - generic [ref=e68]:
                - generic [ref=e69]: "18"
                - generic [ref=e70]: people
              - generic [ref=e71]:
                - generic [ref=e72]: "2"
                - generic [ref=e73]: PhDs
              - generic [ref=e74]:
                - generic [ref=e75]: "6"
                - generic [ref=e76]: CFA or CIM holders
              - generic [ref=e77]:
                - generic [ref=e78]: "2013"
                - generic [ref=e79]: founded in Montreal
            - list [aria-hidden] [ref=e80]:
              - listitem [ref=e81]
              - listitem [ref=e83]
              - listitem [ref=e85]
              - listitem [ref=e87]
              - listitem [ref=e89]
              - listitem [ref=e91]
              - listitem [ref=e93]
              - listitem [ref=e95]
      - region [ref=e101]:
        - generic [ref=e102]:
          - generic [ref=e103]:
            - paragraph [ref=e105]: Credentials
            - heading "Scientists, engineers and charterholders" [level=2] [ref=e107]:
              - generic [aria-hidden] [ref=e108]:
                - generic [ref=e109]: Scientists,
                - generic [ref=e110]: engineers
                - generic [ref=e111]: and
                - generic [ref=e112]: charterholders
            - generic [ref=e113]: The scientific method, applied to bonds and listed futures.
          - list [ref=e115]:
            - listitem [ref=e116]:
              - generic [ref=e121]:
                - generic [ref=e122]: "2"
                - generic [ref=e123]: PhDs
            - listitem [ref=e124]:
              - generic [ref=e129]:
                - generic [ref=e130]: "3"
                - generic [ref=e131]: Engineering or computer-science degrees
            - listitem [ref=e132]:
              - generic [ref=e136]:
                - generic [ref=e137]: "9"
                - generic [ref=e138]: Master’s and doctoral degrees
            - listitem [ref=e139]:
              - generic [ref=e144]:
                - generic [ref=e145]: "6"
                - generic [ref=e146]: CFA or CIM holders
            - listitem [ref=e147]:
              - generic [ref=e152]:
                - generic [ref=e153]: 332+
                - generic [ref=e154]: Years of combined experience
          - paragraph [ref=e155]: People counted from the team list below, board included. Experience as stated by each person; “+” marks a lower bound.
      - region [ref=e156]:
        - generic [ref=e158]:
          - generic [ref=e160]:
            - paragraph [ref=e162]: Who we are
            - heading "A research-driven investment firm" [level=2] [ref=e164]:
              - generic [aria-hidden] [ref=e165]:
                - generic [ref=e166]: A
                - generic [ref=e167]: research-driven
                - generic [ref=e168]: investment
                - generic [ref=e169]: firm
            - generic [ref=e170]: Founded in 2013 by Marc Rivet and Gabriel Cefaloni.
            - list [ref=e172]:
              - listitem [ref=e173]: "Two core specialties: systematic fixed income and futures overlays"
              - listitem [ref=e174]: Bonds analyzed one by one; listed futures traded systematically
              - listitem [ref=e175]: Physicists, engineers and charterholders, alongside market veterans
          - generic [ref=e196]:
            - paragraph [ref=e197]: Montreal office
            - paragraph [ref=e201]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - generic [ref=e202]:
              - generic [ref=e203]:
                - term [ref=e204]: Founded
                - definition [ref=e205]: 2013, Montreal
              - generic [ref=e206]:
                - term [ref=e207]: Signatory
                - definition [ref=e208]: PRI, since 2018
            - link "Directions" [ref=e209] [cursor=pointer]:
              - /url: https://www.google.com/maps/search/?api=1&query=1002%20Sherbrooke%20Street%20West%2C%20Suite%201900%2C%20Montreal%2C%20Quebec%20H3A%203L6
      - region [ref=e213]:
        - generic [ref=e214]:
          - generic [ref=e215]:
            - paragraph [ref=e217]: Our values
            - heading "What guides the way we work" [level=2] [ref=e219]:
              - generic [aria-hidden] [ref=e220]:
                - generic [ref=e221]: What
                - generic [ref=e222]: guides
                - generic [ref=e223]: the
                - generic [ref=e224]: way
                - generic [ref=e225]: we
                - generic [ref=e226]: work
          - generic [ref=e227]:
            - generic [ref=e228]:
              - heading "Innovation" [level=3] [ref=e232]
              - paragraph [ref=e234]: We adopt what research supports.
            - generic [ref=e235]:
              - heading "Agility" [level=3] [ref=e239]
              - paragraph [ref=e241]: Research reaches production quickly.
            - generic [ref=e242]:
              - heading "Accountability" [level=3] [ref=e247]
              - paragraph [ref=e249]: Transparent methods. Fiduciary duty first.
            - generic [ref=e250]:
              - heading "Integrity" [level=3] [ref=e256]
              - paragraph [ref=e258]: Clients’ interests first.
            - generic [ref=e259]:
              - heading "Collaboration" [level=3] [ref=e266]
              - paragraph [ref=e268]: Scientists and practitioners challenge each other.
      - region [ref=e269]:
        - generic [ref=e270]:
          - generic [ref=e271]:
            - paragraph [ref=e273]: Milestones
            - heading "Our story so far" [level=2] [ref=e275]:
              - generic [aria-hidden] [ref=e276]:
                - generic [ref=e277]: Our
                - generic [ref=e278]: story
                - generic [ref=e279]: so
                - generic [ref=e280]: far
          - list [ref=e282]:
            - listitem [ref=e283]:
              - paragraph [ref=e285]: "2013"
              - heading "Nymbus is founded" [level=3] [ref=e286]
            - listitem [ref=e287]:
              - paragraph [ref=e289]: "2018"
              - heading "PRI signatory" [level=3] [ref=e290]
            - listitem [ref=e291]:
              - paragraph [ref=e293]: "2021"
              - heading "Monthly Income fund launched" [level=3] [ref=e294]
            - listitem [ref=e295]:
              - paragraph [ref=e297]: "2023"
              - heading "Partnership with Dans la rue" [level=3] [ref=e298]
              - paragraph [ref=e299]: Support for youth at risk.
            - listitem [ref=e300]:
              - paragraph [ref=e302]: "2024"
              - heading "Tobacco-Free Finance Pledge" [level=3] [ref=e303]
            - listitem [ref=e304]:
              - paragraph [ref=e306]: "2025"
              - heading "Partnership with Mageska Capital" [level=3] [ref=e307]
              - paragraph [ref=e308]: A portable alpha strategy.
      - region [ref=e309]:
        - generic [ref=e310]:
          - generic [ref=e311]:
            - paragraph [ref=e313]: Our team
            - heading "The people behind the science" [level=2] [ref=e315]:
              - generic [aria-hidden] [ref=e316]:
                - generic [ref=e317]: The
                - generic [ref=e318]: people
                - generic [ref=e319]: behind
                - generic [ref=e320]: the
                - generic [ref=e321]: science
            - generic [ref=e322]: Select a person to read their biography.
          - group "Filter by department" [ref=e324]:
            - button "Everyone" [pressed] [ref=e325] [cursor=pointer]:
              - text: Everyone
              - generic [aria-hidden] [ref=e326]: "18"
            - button "Leadership" [ref=e327] [cursor=pointer]:
              - text: Leadership
              - generic [aria-hidden] [ref=e328]: "3"
            - button "Quantitative research" [ref=e329] [cursor=pointer]:
              - text: Quantitative research
              - generic [aria-hidden] [ref=e330]: "4"
            - button "Investment team" [ref=e331] [cursor=pointer]:
              - text: Investment team
              - generic [aria-hidden] [ref=e332]: "9"
            - button "Operations" [ref=e333] [cursor=pointer]:
              - text: Operations
              - generic [aria-hidden] [ref=e334]: "7"
            - button "Board" [ref=e335] [cursor=pointer]:
              - text: Board
              - generic [aria-hidden] [ref=e336]: "5"
          - paragraph [ref=e337]: 18 people shown
          - list [ref=e338]:
            - listitem [ref=e339]:
              - button "Read the biography of Marc Rivet" [ref=e340] [cursor=pointer]:
                - generic [ref=e342]:
                  - generic [ref=e343]: Marc Rivet
                  - generic [ref=e344]: Co-founder & Chief Executive Officer
            - listitem [ref=e349]:
              - button "Read the biography of Gabriel Cefaloni" [ref=e350] [cursor=pointer]:
                - generic [ref=e352]:
                  - generic [ref=e353]: Gabriel Cefaloni
                  - generic [ref=e354]: Co-founder & Chief Investment Officer
                  - generic [ref=e355]: CIM
            - listitem [ref=e361]:
              - button "Read the biography of Mathieu Poulin-Brière" [ref=e362] [cursor=pointer]:
                - generic [ref=e364]:
                  - generic [ref=e365]: Mathieu Poulin-Brière
                  - generic [ref=e366]: Partner, Systematic Overlays
                  - generic [ref=e367]: M.Sc.
            - listitem [ref=e373]:
              - button "Read the biography of Jessica Martins" [ref=e374] [cursor=pointer]:
                - generic [ref=e376]:
                  - generic [ref=e377]: Jessica Martins
                  - generic [ref=e378]: Quantitative Researcher & Data Scientist
                  - generic [ref=e379]: PhD
            - listitem [ref=e385]:
              - button "Read the biography of Jean-Philippe Lejeune" [ref=e386] [cursor=pointer]:
                - generic [ref=e388]:
                  - generic [ref=e389]: Jean-Philippe Lejeune
                  - generic [ref=e390]: Quantitative Developer & Trader
                  - generic [ref=e391]:
                    - generic [ref=e392]: CFA
                    - generic [ref=e393]: M.Sc.
            - listitem [ref=e398]:
              - button "Read the biography of Olivier Cyr-Choinière" [ref=e399] [cursor=pointer]:
                - generic [ref=e401]:
                  - generic [ref=e402]: Olivier Cyr-Choinière
                  - generic [ref=e403]: Quantitative Analyst
                  - generic [ref=e404]:
                    - generic [ref=e405]: PhD
                    - generic [ref=e406]: M.Sc.
            - listitem [ref=e411]:
              - button "Read the biography of Guy Liébart" [ref=e412] [cursor=pointer]:
                - generic [ref=e414]:
                  - generic [ref=e415]: Guy Liébart
                  - generic [ref=e416]: Portfolio Manager
                  - generic [ref=e417]: MBA
            - listitem [ref=e423]:
              - button "Read the biography of François-Olivier Laplante" [ref=e424] [cursor=pointer]:
                - generic [ref=e426]:
                  - generic [ref=e427]: François-Olivier Laplante
                  - generic [ref=e428]: Portfolio Manager, REITs
                  - generic [ref=e429]: CIM
            - listitem [ref=e435]:
              - button "Read the biography of Lyes Hammadi" [ref=e436] [cursor=pointer]:
                - generic [ref=e438]:
                  - generic [ref=e439]: Lyes Hammadi
                  - generic [ref=e440]: Lead Software Engineer, Investments
            - listitem [ref=e445]:
              - button "Read the biography of Jason Laliberte" [ref=e446] [cursor=pointer]:
                - generic [aria-hidden] [ref=e448]: JL
                - generic [ref=e449]:
                  - generic [ref=e450]: Jason Laliberte
                  - generic [ref=e451]: Consultant, Equities Asset Allocation
                  - generic [ref=e452]:
                    - generic [ref=e453]: CFA
                    - generic [ref=e454]: M.Sc.
            - listitem [ref=e459]:
              - button "Read the biography of Diane Dusabimana" [ref=e460] [cursor=pointer]:
                - generic [ref=e462]:
                  - generic [ref=e463]: Diane Dusabimana
                  - generic [ref=e464]: Chief Compliance Officer
                  - generic [ref=e465]:
                    - generic [ref=e466]: CFA
                    - generic [ref=e467]: CPA
                    - generic [ref=e468]: MBA
            - listitem [ref=e473]:
              - button "Read the biography of Jennifer Pinkerton" [ref=e474] [cursor=pointer]:
                - generic [ref=e476]:
                  - generic [ref=e477]: Jennifer Pinkerton
                  - generic [ref=e478]: Portfolio Administrator
                  - generic [ref=e479]: CFA
            - listitem [ref=e485]:
              - button "Read the biography of Fraser Coburn" [ref=e486] [cursor=pointer]:
                - generic [ref=e488]:
                  - generic [ref=e489]: Fraser Coburn
                  - generic [ref=e490]: Director, Client Relations
            - listitem [ref=e495]:
              - button "Read the biography of Luca Ieraci" [ref=e496] [cursor=pointer]:
                - generic [aria-hidden] [ref=e498]: LI
                - generic [ref=e499]:
                  - generic [ref=e500]: Luca Ieraci
                  - generic [ref=e501]: Consultant, Software Development
            - listitem [ref=e506]:
              - button "Read the biography of Xavier Girard" [ref=e507] [cursor=pointer]:
                - generic [ref=e509]:
                  - generic [ref=e510]: Xavier Girard
                  - generic [ref=e511]: Senior Associate, Client Relations — Advisor Channel
            - listitem [ref=e516]:
              - button "Read the biography of Danira Csano" [ref=e517] [cursor=pointer]:
                - generic [ref=e519]:
                  - generic [ref=e520]: Danira Csano
                  - generic [ref=e521]: Administrative Coordinator
            - listitem [ref=e526]:
              - button "Read the biography of Jean Turmel" [ref=e527] [cursor=pointer]:
                - generic [ref=e529]:
                  - generic [ref=e530]: Jean Turmel
                  - generic [ref=e531]: Chairman of the Board
                  - generic [ref=e532]: MBA
            - listitem [ref=e538]:
              - button "Read the biography of Jean-Luc Landry" [ref=e539] [cursor=pointer]:
                - generic [ref=e541]:
                  - generic [ref=e542]: Jean-Luc Landry
                  - generic [ref=e543]: Board Member
                  - generic [ref=e544]: M.Sc.
      - generic [ref=e552]:
        - heading "Work with us" [level=2] [ref=e553]:
          - generic [aria-hidden] [ref=e554]:
            - generic [ref=e555]: Work
            - generic [ref=e556]: with
            - generic [ref=e557]: us
        - paragraph [ref=e559]: "Researchers, engineers and investors: write to us."
        - generic [ref=e561]:
          - link "Send us your résumé" [ref=e562] [cursor=pointer]:
            - /url: mailto:info@nymbus.ca?subject=Careers
          - link "Contact us" [ref=e565] [cursor=pointer]:
            - /url: /contact
      - dialog [active] [ref=e566]:
        - generic [ref=e567]:
          - button "Close" [ref=e568] [cursor=pointer]
          - generic [ref=e574]:
            - heading "Marc Rivet" [level=2] [ref=e575]
            - paragraph [ref=e576]: Co-founder & Chief Executive Officer
            - paragraph [ref=e577]: 30 years of experience
            - link "LinkedIn profile" [ref=e578] [cursor=pointer]:
              - /url: https://www.linkedin.com/in/mrivet/
          - generic [ref=e581]:
            - heading "Biography" [level=3] [ref=e582]
            - paragraph [ref=e583]: Co-founded Nymbus Capital in 2013 to run systematic fixed income and derivatives strategies; 30 years of experience. Previously founded Groupe ARB and started as a fixed income trader.
            - heading "Previous roles" [level=3] [ref=e584]
            - list [ref=e585]:
              - listitem [ref=e586]: President, Groupe ARB
              - listitem [ref=e587]: Fixed Income Trader
            - heading "Education" [level=3] [ref=e588]
            - list [ref=e589]:
              - listitem [ref=e590]: B.Com Finance, Concordia University
              - listitem [ref=e591]: Partners, Directors and Officers (CSI)
  - contentinfo [ref=e592]:
    - generic [ref=e593]:
      - generic [ref=e594]:
        - generic [ref=e595]:
          - link "Nymbus Capital, home" [ref=e596] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e597]
          - paragraph [ref=e606]: Montreal portfolio manager building systematic fixed income and alternative strategies.
          - generic [ref=e607]:
            - generic [ref=e608]: 1002 Sherbrooke Street West, Suite 1900 Montreal, Quebec H3A 3L6
            - link "514-985-1138" [ref=e609] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e610]: 1-833-227-2656 (toll-free)
            - link "info@nymbus.ca" [ref=e611] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e612]:
          - heading "Strategies" [level=2] [ref=e613]
          - list [ref=e614]:
            - listitem [ref=e615]:
              - link "Monthly Income" [ref=e616] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e618]:
              - link "Sustainable Enhanced Bonds" [ref=e619] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e621]:
              - link "Multi-Strategy" [ref=e622] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e624]:
              - link "Global Minimum Volatility" [ref=e625] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e627]:
          - heading "Company" [level=2] [ref=e628]
          - list [ref=e629]:
            - listitem [ref=e630]:
              - link "About & team" [ref=e631] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e632]:
              - link "Approach" [ref=e633] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e634]:
              - link "Sustainability" [ref=e635] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e636]:
              - link "Solutions" [ref=e637] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e638]:
          - heading "Resources" [level=2] [ref=e639]
          - list [ref=e640]:
            - listitem [ref=e641]:
              - link "Contact" [ref=e642] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e643]:
              - link "Privacy policy" [ref=e644] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e645]:
              - link "Complaints & code of ethics" [ref=e646] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e647]:
              - link "LinkedIn" [ref=e648] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e652]:
        - paragraph [ref=e653]: Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.
        - paragraph [ref=e654]: Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. Please read the fund facts and the prospectus (or offering memorandum) before investing. Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.
        - paragraph [ref=e655]: The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.
        - paragraph [ref=e656]: The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; the composition and risk of a fund may differ materially from those of its benchmark.
        - paragraph [ref=e657]: The Nymbus Monthly Income Fund was launched on October 5, 2021. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since January 2019; it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.
        - paragraph [ref=e658]: Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative.
        - paragraph [ref=e659]: "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. “FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication."
      - generic [ref=e660]:
        - generic [ref=e661]: © 2026 Nymbus Capital Inc. All rights reserved.
        - generic [ref=e662]: PRI signatory
  - alert [ref=e663]
```

# Test source

```ts
  1  | import { expect, test, type Page } from "@playwright/test";
  2  | 
  3  | /**
  4  |  * Modal dialogs (team bios, news): centred in the viewport (not at the top-left, which Tailwind's margin reset caused),
  5  |  * page scroll locked while open, focus kept inside, Escape and backdrop close them, nothing overflows on a phone.
  6  |  */
  7  | async function settled(page: Page, testId: string) {
  8  |   await page.getByTestId(testId).evaluate((d) => Promise.all(d.getAnimations().map((a) => a.finished.catch(() => null))));
  9  | }
  10 | 
  11 | async function expectCentred(page: Page, testId: string) {
  12 |   await settled(page, testId);
  13 |   const r = await page.evaluate((id) => {
  14 |     const el = document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
  15 |     const b = el.getBoundingClientRect();
  16 |     // the layout viewport (without the reserved scrollbar gutter) is what a fixed, inset:0 dialog centres in
  17 |     const w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
  18 |     return { cx: b.left + b.width / 2, cy: b.top + b.height / 2, w, h, left: b.left, right: b.right, top: b.top, bottom: b.bottom };
  19 |   }, testId);
  20 |   expect(Math.abs(r.cx - r.w / 2), `horizontal centre ${r.cx} vs ${r.w / 2}`).toBeLessThanOrEqual(2);
  21 |   expect(Math.abs(r.cy - r.h / 2), `vertical centre ${r.cy} vs ${r.h / 2}`).toBeLessThanOrEqual(2);
  22 |   expect(r.left).toBeGreaterThanOrEqual(0);
  23 |   expect(r.right).toBeLessThanOrEqual(r.w + 0.5);
  24 |   expect(r.top).toBeGreaterThanOrEqual(0);
  25 |   expect(r.bottom).toBeLessThanOrEqual(r.h + 0.5);
  26 | }
  27 | 
  28 | test("team: the bio dialog is centred in the viewport, locks the page scroll and traps focus", async ({ page }) => {
  29 |   await page.goto("/team");
  30 |   const people = page.getByTestId("people").locator(":scope > li");
  31 |   await people.first().scrollIntoViewIfNeeded();
  32 |   // scrolled away from the top: the dialog is still centred in the viewport, not on the page
  33 |   await page.evaluate(() => window.scrollBy(0, 300));
  34 |   const opener = people.nth(2).getByRole("button");
  35 |   await opener.click();
  36 |   const dialog = page.getByTestId("bio-dialog");
  37 |   await expect(dialog).toBeVisible();
  38 |   await expectCentred(page, "bio-dialog");
  39 |   expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");
  40 |   // focus stays inside the dialog whatever is tabbed
  41 |   for (let i = 0; i < 6; i++) {
  42 |     await page.keyboard.press("Tab");
  43 |     // inside the dialog, or nowhere (body: focus handed to the browser UI); never on the inert page behind it
  44 |     expect(await page.evaluate(() => { const a = document.activeElement; return !a || a === document.body || !!a.closest("dialog"); })).toBe(true);
  45 |   }
  46 |   await page.keyboard.press("Escape");
  47 |   await expect(dialog).toBeHidden();
  48 |   expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");
  49 |   await expect(opener).toBeFocused();
  50 | });
  51 | 
  52 | test("team: the bio dialog closes from the backdrop and the close button", async ({ page }) => {
  53 |   await page.goto("/team");
  54 |   const people = page.getByTestId("people").locator(":scope > li");
  55 |   await people.first().scrollIntoViewIfNeeded();
  56 |   const dialog = page.getByTestId("bio-dialog");
  57 |   await people.first().getByRole("button").click();
  58 |   await expect(dialog).toBeVisible();
  59 |   await settled(page, "bio-dialog");
  60 |   await page.mouse.click(4, 4);
  61 |   await expect(dialog).toBeHidden();
  62 |   await people.first().getByRole("button").click();
  63 |   await expect(dialog).toBeVisible();
  64 |   await dialog.getByRole("button", { name: /close|fermer/i }).click();
  65 |   await expect(dialog).toBeHidden();
  66 | });
  67 | 
  68 | test("team: a press that starts inside the bio and ends on the backdrop does not close it", async ({ page }) => {
  69 |   await page.goto("/team");
  70 |   const people = page.getByTestId("people").locator(":scope > li");
  71 |   await people.first().scrollIntoViewIfNeeded();
  72 |   const dialog = page.getByTestId("bio-dialog");
  73 |   await people.first().getByRole("button").click();
  74 |   await settled(page, "bio-dialog");
  75 |   const box = (await dialog.boundingBox())!;
  76 |   await page.mouse.move(box.x + box.width / 2, box.y + 40);
  77 |   await page.mouse.down();
  78 |   await page.mouse.move(4, 4);
  79 |   await page.mouse.up();
  80 |   await expect(dialog).toBeVisible();
  81 |   // the close button keeps a 44 px hit area
  82 |   const x = await dialog.getByRole("button", { name: /close|fermer/i }).boundingBox();
> 83 |   expect(x!.width).toBeGreaterThanOrEqual(44);
     |                    ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  84 |   expect(x!.height).toBeGreaterThanOrEqual(44);
  85 | });
  86 | 
  87 | test("home: the news dialog is centred in the viewport", async ({ page }) => {
  88 |   await page.goto("/");
  89 |   const card = page.getByTestId("news-mageska");
  90 |   await card.scrollIntoViewIfNeeded();
  91 |   await card.getByRole("button", { name: /read more/i }).click();
  92 |   await expect(page.getByTestId("news-dialog")).toBeVisible();
  93 |   await expectCentred(page, "news-dialog");
  94 | });
  95 | 
```