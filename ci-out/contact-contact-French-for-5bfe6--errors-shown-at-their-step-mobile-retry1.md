# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: contact.spec.ts >> contact: French form, server-side field errors shown at their step
- Location: e2e/contact.spec.ts:94:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 429
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Aller au contenu" [ref=e2] [cursor=pointer]:
    - /url: "#main"
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "Nymbus Capital, accueil" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "nymbus" [ref=e6]
      - navigation "Principale"
      - generic [ref=e15]:
        - button "View the site in English" [ref=e16] [cursor=pointer]:
          - generic [aria-hidden] [ref=e17]: en
          - generic [aria-hidden] [ref=e18]: fr
        - button "Ouvrir le menu" [ref=e19] [cursor=pointer]
  - main [ref=e21]:
    - generic [ref=e22]:
      - generic [ref=e36]:
        - navigation "Breadcrumb" [ref=e37]:
          - list [ref=e38]:
            - listitem [ref=e39]:
              - link "Accueil" [ref=e40] [cursor=pointer]:
                - /url: /
            - listitem [ref=e43]:
              - generic [ref=e44]: Nous joindre
        - generic [ref=e46]:
          - paragraph [ref=e48]: Nous joindre
          - heading "Communiquez avec nous" [level=1] [ref=e50]:
            - generic [aria-hidden] [ref=e51]:
              - generic [ref=e52]: Communiquez
              - generic [ref=e53]: avec
              - generic [ref=e54]: nous
          - generic [ref=e55]: "Nos stratégies, un mandat sur mesure ou la firme : notre équipe de Montréal peut vous aider."
          - generic [ref=e58]:
            - link "514 985-1138" [ref=e59] [cursor=pointer]:
              - /url: tel:+15149851138
            - link "info@nymbus.ca" [ref=e62] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
      - region [ref=e66]:
        - generic [ref=e68]:
          - generic [ref=e69]:
            - heading "Écrivez-nous" [level=2] [ref=e70]
            - paragraph [ref=e71]: Trois courtes étapes.
            - generic [ref=e72]:
              - status [ref=e73]
              - generic [ref=e74]:
                - generic [aria-hidden] [ref=e75]:
                  - text: Website
                  - textbox [ref=e76]
                - alert
                - list "Progression du formulaire" [ref=e77]:
                  - listitem [ref=e78]
                  - listitem [ref=e82]
                  - listitem [ref=e86]:
                    - generic [aria-hidden] [ref=e87]: "3"
                    - generic [ref=e88]: Coordonnées
                - group "Vos coordonnées" [ref=e89]:
                  - generic [ref=e91]:
                    - generic [ref=e92]:
                      - generic [ref=e93]: Nom complet
                      - textbox "Nom complet" [ref=e94]: E2E Visiteur mobile
                    - generic [ref=e95]:
                      - generic [ref=e96]: Adresse courriel
                      - textbox "Adresse courriel" [ref=e97]: visitor@example.com
                    - generic [ref=e98]:
                      - generic [ref=e99]: Téléphone (facultatif)
                      - textbox "Téléphone (facultatif)" [ref=e100]
                    - generic [ref=e101]:
                      - generic [ref=e102]: Organisation (facultatif)
                      - textbox "Organisation (facultatif)" [ref=e103]: Example Pension Plan
                    - generic [ref=e104]:
                      - generic [ref=e105]: Message (facultatif)
                      - textbox "Message (facultatif)" [ref=e106]:
                        - /placeholder: Parlez-nous de vos besoins
                        - text: Hello, I would like to learn more about your funds.
                    - generic [ref=e108] [cursor=pointer]:
                      - checkbox "J’accepte que Nymbus Capital utilise ces renseignements uniquement pour répondre à ma demande. Politique de confidentialité" [checked] [ref=e109]
                      - generic [ref=e110]:
                        - generic [ref=e111]: J’accepte que Nymbus Capital utilise ces renseignements uniquement pour répondre à ma demande.
                        - link "Politique de confidentialité" [ref=e112]:
                          - /url: /privacy
                  - alert [ref=e119]:
                    - paragraph [ref=e120]: Trop de tentatives. Réessayez plus tard ou écrivez-nous par courriel.
                    - link "Écrivez-nous par courriel" [ref=e121] [cursor=pointer]:
                      - /url: mailto:info@nymbus.ca?subject=Demande%20du%20site%20Web%20%C2%B7%20Individual%20investor%20%C2%B7%20E2E%20Visiteur%20mobile&body=Hello%2C%0AI%20would%20like%20to%20learn%20more%20about%20your%20funds.%0A%0A%E2%80%94%0ANom%3A%20E2E%20Visiteur%20mobile%0ACourriel%3A%20visitor%40example.com%0AOrganisation%3A%20Example%20Pension%20Plan%0AProfil%20d%E2%80%99investisseur%3A%20Individual%20investor%0AInt%C3%A9r%C3%AAts%3A%20General%20inquiry
                  - generic [ref=e125]:
                    - button "Retour" [ref=e126] [cursor=pointer]
                    - button "Envoyer mon message" [ref=e129] [cursor=pointer]
                - paragraph [ref=e133]: N’y indiquez pas de numéros de compte ni d’autres renseignements sensibles.
          - complementary "Bureau de Montréal" [ref=e134]:
            - generic [ref=e135]:
              - heading "Bureau de Montréal" [level=2] [ref=e136]
              - list [ref=e137]:
                - listitem [ref=e138]:
                  - generic [ref=e142]: 1002, rue Sherbrooke Ouest, bureau 1900 Montréal (Québec) H3A 3L6
                - listitem [ref=e143]:
                  - generic [ref=e146]:
                    - link "514 985-1138" [ref=e147] [cursor=pointer]:
                      - /url: tel:+15149851138
                    - link "1 833 227-2656 (sans frais)" [ref=e148] [cursor=pointer]:
                      - /url: tel:+18332272656
                - listitem [ref=e149]:
                  - link "info@nymbus.ca" [ref=e153] [cursor=pointer]:
                    - /url: mailto:info@nymbus.ca
                - listitem [ref=e154]:
                  - generic [ref=e158]: Du lundi au vendredi, de 8 h 30 à 17 h (heure de l’Est)
              - generic [ref=e159]:
                - link "Ouvrir dans Google Maps" [ref=e160] [cursor=pointer]:
                  - /url: https://www.google.com/maps/search/?api=1&query=1002%20Sherbrooke%20Street%20West%2C%20Suite%201900%2C%20Montreal%2C%20Quebec%20H3A%203L6
                - link "LinkedIn" [ref=e164] [cursor=pointer]:
                  - /url: https://www.linkedin.com/company/nymbus-capital/
            - generic [ref=e168]:
              - heading "Délai de réponse" [level=2] [ref=e169]
              - paragraph [ref=e170]: Habituellement en un jour ouvrable.
      - region [ref=e171]:
        - generic [ref=e172]:
          - generic [ref=e173]:
            - paragraph [ref=e175]: Qui joindre
            - heading "La bonne personne pour votre question" [level=2] [ref=e177]:
              - generic [aria-hidden] [ref=e178]:
                - generic [ref=e179]: La
                - generic [ref=e180]: bonne
                - generic [ref=e181]: personne
                - generic [ref=e182]: pour
                - generic [ref=e183]: votre
                - generic [ref=e184]: question
          - generic [ref=e185]:
            - generic [ref=e186]:
              - heading "Investisseurs et institutions" [level=3] [ref=e187]
              - paragraph [ref=e188]: Stratégies, mandats, vérification diligente, rencontres.
              - link "info@nymbus.ca" [ref=e189] [cursor=pointer]:
                - /url: mailto:info@nymbus.ca?subject=Demande%20d%E2%80%99investisseur
            - generic [ref=e193]:
              - heading "Conseillers en placement" [level=3] [ref=e194]
              - paragraph [ref=e195]: Codes de fonds, documents, soutien pour vos clients.
              - link "info@nymbus.ca" [ref=e196] [cursor=pointer]:
                - /url: mailto:info@nymbus.ca?subject=Demande%20de%20conseiller
            - generic [ref=e200]:
              - heading "Médias et carrières" [level=3] [ref=e201]
              - paragraph [ref=e202]: Entrevues, événements, candidatures.
              - link "info@nymbus.ca" [ref=e203] [cursor=pointer]:
                - /url: mailto:info@nymbus.ca?subject=M%C3%A9dias%20ou%20carri%C3%A8res
            - generic [ref=e207]:
              - heading "Plaintes et confidentialité" [level=3] [ref=e208]
              - paragraph [ref=e209]: Plaintes et demandes sur les renseignements personnels.
              - link "compliance@nymbus.ca" [ref=e210] [cursor=pointer]:
                - /url: mailto:compliance@nymbus.ca?subject=Conformit%C3%A9
              - link "Politique de traitement des plaintes" [ref=e214] [cursor=pointer]:
                - /url: /legal#complaints
      - region [ref=e217]:
        - generic [ref=e219]:
          - generic [ref=e220]:
            - generic [ref=e221]:
              - paragraph [ref=e223]: Nous rendre visite
              - heading "Au cœur du centre-ville de Montréal" [level=2] [ref=e225]:
                - generic [aria-hidden] [ref=e226]:
                  - generic [ref=e227]: Au
                  - generic [ref=e228]: cœur
                  - generic [ref=e229]: du
                  - generic [ref=e230]: centre-ville
                  - generic [ref=e231]: de
                  - generic [ref=e232]: Montréal
            - generic [ref=e233]:
              - list [ref=e234]:
                - listitem [ref=e235]:
                  - generic [ref=e239]: 1002, rue Sherbrooke Ouest, bureau 1900 Montréal (Québec) H3A 3L6
                - listitem [ref=e240]:
                  - generic [ref=e244]: Du lundi au vendredi, de 8 h 30 à 17 h (heure de l’Est)
              - link "Ouvrir dans Google Maps" [ref=e246] [cursor=pointer]:
                - /url: https://www.google.com/maps/search/?api=1&query=1002%20Sherbrooke%20Street%20West%2C%20Suite%201900%2C%20Montreal%2C%20Quebec%20H3A%203L6
          - link "Nymbus Capital 1002, rue Sherbrooke Ouest, bureau 1900 Montréal (Québec) H3A 3L6 Ouvrir dans Google Maps" [ref=e251] [cursor=pointer]:
            - /url: https://www.google.com/maps/search/?api=1&query=1002%20Sherbrooke%20Street%20West%2C%20Suite%201900%2C%20Montreal%2C%20Quebec%20H3A%203L6
            - generic [ref=e280]:
              - generic [ref=e281]: Nymbus Capital
              - generic [ref=e282]: 1002, rue Sherbrooke Ouest, bureau 1900 Montréal (Québec) H3A 3L6
              - generic [ref=e283]: Ouvrir dans Google Maps
  - contentinfo [ref=e287]:
    - generic [ref=e288]:
      - generic [ref=e289]:
        - generic [ref=e290]:
          - link "Nymbus Capital, accueil" [ref=e291] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=e292]
          - paragraph [ref=e301]: Gestionnaire de portefeuille établi à Montréal, qui conçoit des stratégies systématiques de revenu fixe et alternatives.
          - generic [ref=e302]:
            - generic [ref=e303]: 1002, rue Sherbrooke Ouest, bureau 1900 Montréal (Québec) H3A 3L6
            - link "514 985-1138" [ref=e304] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=e305]: 1 833 227-2656 (sans frais)
            - link "info@nymbus.ca" [ref=e306] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=e307]:
          - heading "Stratégies" [level=2] [ref=e308]
          - list [ref=e309]:
            - listitem [ref=e310]:
              - link "Revenu Mensuel" [ref=e311] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=e313]:
              - link "Obligations Durables Bonifiées" [ref=e314] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=e316]:
              - link "Multistratégies" [ref=e317] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=e319]:
              - link "Global Minimum Volatility" [ref=e320] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=e322]:
          - heading "Entreprise" [level=2] [ref=e323]
          - list [ref=e324]:
            - listitem [ref=e325]:
              - link "À propos et équipe" [ref=e326] [cursor=pointer]:
                - /url: /team
            - listitem [ref=e327]:
              - link "Approche" [ref=e328] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=e329]:
              - link "Concepts de base" [ref=e330] [cursor=pointer]:
                - /url: /core-concepts
            - listitem [ref=e331]:
              - link "Développement durable" [ref=e332] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=e333]:
              - link "Solutions" [ref=e334] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=e335]:
          - heading "Ressources" [level=2] [ref=e336]
          - list [ref=e337]:
            - listitem [ref=e338]:
              - link "Contact" [ref=e339] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=e340]:
              - link "Politique de confidentialité" [ref=e341] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e342]:
              - link "Plaintes et code d’éthique" [ref=e343] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=e344]:
              - link "LinkedIn" [ref=e345] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=e350]:
        - generic [ref=e352] [cursor=pointer]:
          - paragraph [ref=e353]: Nymbus Capital inc. est inscrite à titre de gestionnaire de portefeuille et de gestionnaire de fonds d’investissement auprès de l’Autorité des marchés financiers (Québec). Les renseignements présentés sur ce site Web sont fournis à titre informatif seulement; ils ne constituent pas des conseils en placement, fiscaux, juridiques ou comptables et ne doivent pas être considérés comme tels. Ils ne constituent ni une offre de vente ni une sollicitation d’achat de titres ou de parts de fonds d’investissement dans un territoire où une telle offre ou sollicitation n’est pas autorisée. Les parts des fonds Nymbus ne sont offertes qu’au moyen de leurs documents de placement (prospectus simplifié et aperçu du fonds, ou notice d’offre aux investisseurs admissibles, selon le cas) et uniquement là où elles peuvent légalement être vendues.
          - paragraph [ref=e354]: Un placement dans un organisme de placement collectif peut donner lieu à des courtages, des commissions de suivi, des frais de gestion et d’autres frais. Veuillez lire l’aperçu du fonds et le prospectus (ou la notice d’offre) avant de faire un placement. Les organismes de placement collectif ne sont pas garantis, leur valeur fluctue souvent et leur rendement passé n’est pas indicatif de leur rendement futur.
          - paragraph [ref=e355]: Les taux de rendement indiqués sont les rendements totaux annuels composés historiques, après déduction des frais, qui tiennent compte des fluctuations de la valeur des parts et du réinvestissement de toutes les distributions; ils ne tiennent pas compte des frais d’acquisition, de rachat, de placement ou des frais optionnels ni de l’impôt sur le revenu payable par un porteur, qui auraient réduit le rendement. Les rendements sont exprimés en dollars canadiens pour la série indiquée; les périodes de moins d’un an ne sont pas annualisées.
          - paragraph [ref=e356]: L’indice de référence est un indice obligataire général FTSE Canada présenté à des fins de comparaison seulement. Les indices ne sont pas gérés, n’assument aucuns frais et on ne peut y investir directement; la composition et le risque d’un fonds peuvent différer sensiblement de ceux de son indice de référence.
          - paragraph [ref=e357]: Le Fonds Nymbus Revenu Mensuel a été lancé le 5 octobre 2021. Les rendements présentés pour les périodes antérieures à cette date correspondent à ceux de la même stratégie de placement gérée par Nymbus Capital depuis janvier 2019; il ne s’agit pas des rendements du fonds, et ceux-ci auraient pu être différents si le fonds avait existé durant cette période.
          - paragraph [ref=e358]: Nymbus Global Minimum Volatility est une stratégie offerte au moyen de comptes gérés distincts; il ne s’agit pas d’un fonds d’investissement. Ses rendements sont présentés avant déduction des frais de gestion et des autres frais, lesquels réduisent le rendement des clients; le rendement réel varie d’un compte à l’autre. Les rendements sont arithmétiques (sommes simples des rendements mensuels sur l’exposition notionnelle, non composés) et avant déduction des frais; le graphique de croissance est illustratif. Sauf si une autre variante est sélectionnée sur la page de la stratégie, les rendements présentés sont ceux de la variante à volatilité à la baisse de 6 %; la stratégie est aussi offerte avec des cibles de volatilité à la baisse de 3 % et de 9 %, dont les rendements diffèrent.
          - paragraph [ref=e359]: "Source : London Stock Exchange Group plc et les entreprises de son groupe (collectivement, le « Groupe LSE »). © Groupe LSE. FTSE Russell est une dénomination commerciale de certaines sociétés du Groupe LSE. « FTSE® » est une marque de commerce des sociétés concernées du Groupe LSE, utilisée sous licence par toute autre société du Groupe LSE. Tous les droits sur les indices ou les données FTSE Russell appartiennent à la société du Groupe LSE qui en est propriétaire. Ni le Groupe LSE ni ses concédants de licence n’assument de responsabilité à l’égard d’erreurs ou d’omissions dans les indices ou les données, et nul ne peut se fier aux indices ou aux données contenus dans la présente communication. Toute autre diffusion de données du Groupe LSE est interdite sans le consentement écrit exprès de la société concernée du Groupe LSE. Le Groupe LSE ne promeut, ne parraine ni n’approuve le contenu de la présente communication."
        - button "Afficher le texte complet" [ref=e360] [cursor=pointer]
      - generic [ref=e364]:
        - generic [ref=e365]: © 2026 Nymbus Capital Inc. Tous droits réservés.
        - generic [ref=e366]: Signataire des PRI
  - alert [ref=e367]
```

# Test source

```ts
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
> 130 |   expect((await posted).status()).toBe(200);
      |                                   ^ Error: expect(received).toBe(expected) // Object.is equality
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
  151 |   await expect(page).toHaveURL(/\/contact\?sent=1/);
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