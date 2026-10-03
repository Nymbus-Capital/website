# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fund.spec.ts >> French: labels, names and number formatting
- Location: e2e/fund.spec.ts:286:5

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('figures-soon')
Expected substring: "Les rendements de la série F seront bientôt publiés"
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" getByTestId('figures-soon') with timeout 10000ms
  - waiting for getByTestId('figures-soon')

```

```yaml
- link "Aller au contenu":
  - /url: "#main"
- banner:
  - link "Nymbus Capital, accueil":
    - /url: /
    - img "nymbus"
  - navigation "Principale"
  - button "View the site in English"
  - button "Ouvrir le menu"
- main:
  - navigation "Breadcrumb":
    - list:
      - listitem:
        - link "Accueil":
          - /url: /
      - listitem:
        - link "Stratégies":
          - /url: /strategies
      - listitem: Revenu Mensuel
  - paragraph: Revenu fixe à court terme
  - heading "Fonds Nymbus Revenu Mensuel" [level=1]
  - paragraph: Un revenu mensuel tiré d’obligations de sociétés à court terme
  - paragraph: Des obligations de sociétés canadiennes à court terme sélectionnées par notre processus à deux systèmes, avec une stratégie de superposition conçue pour avoir une faible corrélation avec les obligations et compenser une partie des pertes obligataires; elle peut ne pas y parvenir et peut subir des pertes. Les distributions ne sont pas garanties, peuvent changer et peuvent comprendre un remboursement de capital.
  - text: Organisme de placement collectif Risque Faible à moyen Données fictives
  - link "Nous joindre":
    - /url: /contact
  - link "Documents du fonds":
    - /url: "#documents"
  - text: Valeur liquidative par part Au 28 sept. 2026
  - radiogroup "Choisir une série":
    - radio "Série F" [checked]
    - radio "Série FP"
    - radio "Série F USD"
    - radio "Série A"
  - text: Série à prospectus
  - paragraph: Cette série est offerte aux termes du prospectus simplifié.
  - text: 10,0397 $
  - paragraph: −0,0190 (−0,19 %) par rapport au jour d’évaluation précédent
  - term: Série
  - definition: F
  - term: FundServ
  - definition:
    - code: LDM081
  - term: Devise
  - definition: CAD
  - term: Lancement du fonds
  - definition: 5 octobre 2021
  - term: Indice de référence
  - definition: Indice FTSE Canada des obligations corporatives à court terme
  - region "Rendements":
    - heading "Rendements" [level=2]
    - paragraph: Série F, après déduction des frais · au 31 août 2026 Série à prospectus
    - list:
      - listitem: 1 mois −0,15 %
      - listitem: 3 mois −0,67 %
      - listitem: Depuis le début de l’année −0,26 %
      - listitem: 1 an +0,74 %
      - listitem: Depuis la création +0,83 %
    - paragraph: "* Les périodes de plus d’un an sont annualisées."
  - tablist "Information sur le fonds":
    - tab "Aperçu" [selected]
    - tab "Rendement"
    - tab "Portefeuille"
    - tab "Distributions"
    - tab "Prix et classements"
    - tab "Documents"
  - tabpanel "Aperçu":
    - heading "Aperçu" [level=2]
    - heading "Ce que fait le fonds" [level=3]
    - paragraph: Un revenu mensuel tiré d’obligations de sociétés canadiennes à court terme, peu sensible aux taux. Les distributions ne sont pas garanties, peuvent changer et peuvent comprendre un remboursement de capital.
    - heading "Approche de placement" [level=3]
    - list:
      - listitem: Surtout des obligations de sociétés canadiennes à court terme
      - listitem: Sélectionnées par notre processus quantitatif à deux systèmes
      - listitem: Risque de crédit et valeur relative, obligation par obligation
    - paragraph: La stratégie de superposition est conçue pour avoir une faible corrélation avec les obligations et pour compenser une partie des pertes obligataires lorsque la volatilité augmente; elle peut ne pas y parvenir et peut subir des pertes. La superposition ajoute une exposition additionnelle au moyen de contrats à terme; ses pertes s’ajoutent à celles du portefeuille sous-jacent et peuvent exiger des dépôts de garantie supplémentaires.
    - heading "Rendements" [level=3]
    - link "Voir tous les rendements":
      - /url: "#performance"
    - paragraph: Série F, après déduction des frais · au 31 août 2026
    - table "Rendements":
      - caption: Rendements
      - rowgroup:
        - row "Période Fonds Indice Valeur ajoutée":
          - columnheader "Période"
          - columnheader "Fonds"
          - columnheader "Indice"
          - columnheader "Valeur ajoutée"
      - rowgroup:
        - row "1 mois −0,15 % 0,38 % −0,53 %":
          - cell "1 mois"
          - cell "−0,15 %"
          - cell "0,38 %"
          - cell "−0,53 %"
        - row "3 mois −0,67 % −0,29 % −0,38 %":
          - cell "3 mois"
          - cell "−0,67 %"
          - cell "−0,29 %"
          - cell "−0,38 %"
        - row "Depuis le début de l’année −0,26 % −0,31 % +0,05 %":
          - cell "Depuis le début de l’année"
          - cell "−0,26 %"
          - cell "−0,31 %"
          - cell "+0,05 %"
        - row "1 an 0,74 % 0,24 % +0,50 %":
          - cell "1 an"
          - cell "0,74 %"
          - cell "0,24 %"
          - cell "+0,50 %"
        - row "2 ans * 0,49 % — —":
          - cell "2 ans *"
          - cell "0,49 %"
          - cell "—"
          - cell "—"
        - row "Depuis la création * 0,83 % — —":
          - cell "Depuis la création *"
          - cell "0,83 %"
          - cell "—"
          - cell "—"
    - paragraph: "* Les périodes de plus d’un an sont annualisées."
    - complementary:
      - heading "Caractéristiques du fonds" [level=3]
      - term: Dénomination
      - definition: Fonds Nymbus Revenu Mensuel
      - term: Véhicule
      - definition: Organisme de placement collectif
      - term: Classe d’actifs
      - definition: Revenu fixe à court terme
      - term: Indice de référence
      - definition: Indice FTSE Canada des obligations corporatives à court terme
      - term: Lancement du fonds
      - definition: 5 octobre 2021
      - term: Historique depuis
      - definition: mars 2024
      - term: Devise
      - definition: CAD, USD
      - term: Séries
      - definition: FP, F USD, A, F
      - term: Niveau de risque
      - definition: Faible à moyen
      - term: Rendements présentés
      - definition: Après déduction des frais
      - term: Catégorie CIFSC
      - definition: Revenu fixe canadien de base plus
      - heading "Frais et charges" [level=3]
      - paragraph: Les frais et charges sont présentés dans l’aperçu du fonds et le prospectus simplifié.
    - heading "Séries et codes FundServ" [level=3]
    - table "Séries et codes FundServ":
      - caption: Séries et codes FundServ
      - rowgroup:
        - row "Séries FundServ Offerte aux termes Devise VL par part Variation quotidienne Date d’évaluation":
          - columnheader "Séries"
          - columnheader "FundServ"
          - columnheader "Offerte aux termes"
          - columnheader "Devise"
          - columnheader "VL par part"
          - columnheader "Variation quotidienne"
          - columnheader "Date d’évaluation"
      - rowgroup:
        - row "F (Série présentée en en-tête) FundServ LDM081 Offerte aux termes Série à prospectus Devise CAD VL par part 10,0397 $ Variation quotidienne −0,19 % Date d’évaluation 28 sept. 2026":
          - cell "F (Série présentée en en-tête)"
          - cell "FundServ LDM081":
            - text: FundServ
            - code: LDM081
          - cell "Offerte aux termes Série à prospectus"
          - cell "Devise CAD"
          - cell "VL par part 10,0397 $"
          - cell "Variation quotidienne −0,19 %"
          - cell "Date d’évaluation 28 sept. 2026"
        - row "FP FundServ LDM001 Offerte aux termes Série à notice d’offre Devise CAD VL par part 10,1905 $ Variation quotidienne +0,11 % Date d’évaluation 28 sept. 2026":
          - cell "FP"
          - cell "FundServ LDM001":
            - text: FundServ
            - code: LDM001
          - cell "Offerte aux termes Série à notice d’offre"
          - cell "Devise CAD"
          - cell "VL par part 10,1905 $"
          - cell "Variation quotidienne +0,11 %"
          - cell "Date d’évaluation 28 sept. 2026"
        - row "F USD FundServ LDM011 Offerte aux termes Devise USD VL par part 10,3711 $ US Variation quotidienne — Date d’évaluation 28 sept. 2026":
          - cell "F USD"
          - cell "FundServ LDM011":
            - text: FundServ
            - code: LDM011
          - cell "Offerte aux termes"
          - cell "Devise USD"
          - cell "VL par part 10,3711 $ US"
          - cell "Variation quotidienne —"
          - cell "Date d’évaluation 28 sept. 2026"
        - row "A FundServ LDM021 Offerte aux termes Devise CAD VL par part 9,7714 $ Variation quotidienne −0,21 % Date d’évaluation 28 sept. 2026":
          - cell "A"
          - cell "FundServ LDM021":
            - text: FundServ
            - code: LDM021
          - cell "Offerte aux termes"
          - cell "Devise CAD"
          - cell "VL par part 9,7714 $"
          - cell "Variation quotidienne −0,21 %"
          - cell "Date d’évaluation 28 sept. 2026"
    - heading "Équipe de placement" [level=3]
    - link "Découvrir l’équipe":
      - /url: /team
    - paragraph: Le fonds est géré par l’équipe de placement de Nymbus Capital.
  - region "Conçu pour un revenu mensuel":
    - paragraph: Fonds Revenu Mensuel
    - heading "Conçu pour un revenu mensuel" [level=2]
    - text: Quatre caractéristiques définissent la gestion du fonds.
    - heading "Distributions mensuelles" [level=3]
    - paragraph: Conçu pour verser une distribution chaque mois. Les distributions ne sont pas garanties, peuvent changer et peuvent comprendre un remboursement de capital.
    - heading "Échéances courtes" [level=3]
    - paragraph: "Des échéances courtes limitent la sensibilité aux taux. Durée actuelle : onglet Portefeuille."
    - heading "Sélection systématique du crédit" [level=3]
    - paragraph: "Mêmes modèles pour chaque émetteur : risque de crédit contre rendement."
    - heading "Stratégie de superposition" [level=3]
    - paragraph: Une stratégie de superposition conçue pour avoir une faible corrélation avec les obligations et pour compenser une partie des pertes obligataires lorsque la volatilité augmente; elle peut ne pas y parvenir et peut subir des pertes. La superposition ajoute une exposition additionnelle au moyen de contrats à terme; ses pertes s’ajoutent à celles du portefeuille sous-jacent et peuvent exiger des dépôts de garantie supplémentaires.
  - region "Mentions importantes":
    - paragraph: Renseignements importants
    - heading "Mentions importantes" [level=2]
    - paragraph: Les chiffres de cette page sont des données fictives utilisées tant que la plateforme de données n’est pas branchée. Il ne s’agit pas des rendements réels du fonds.
    - paragraph: Le Fonds Nymbus Revenu Mensuel a été lancé le 5 octobre 2021. Les rendements présentés pour les périodes antérieures à cette date correspondent à ceux de la même stratégie de placement gérée par Nymbus Capital depuis janvier 2019; il ne s’agit pas des rendements du fonds, et ceux-ci auraient pu être différents si le fonds avait existé durant cette période.
    - paragraph: "Rendements présentés : Série F, après déduction des frais · Indice : FTSE Canada Short Term Corporate Bond Index"
    - paragraph: Les taux de rendement indiqués sont les rendements totaux annuels composés historiques, après déduction des frais, qui tiennent compte des fluctuations de la valeur des parts et du réinvestissement de toutes les distributions; ils ne tiennent pas compte des frais d’acquisition, de rachat, de placement ou des frais optionnels ni de l’impôt sur le revenu payable par un porteur, qui auraient réduit le rendement. Les rendements sont exprimés en dollars canadiens pour la série indiquée; les périodes de moins d’un an ne sont pas annualisées.
    - paragraph: Un placement dans un organisme de placement collectif peut donner lieu à des courtages, des commissions de suivi, des frais de gestion et d’autres frais. Veuillez lire l’aperçu du fonds et le prospectus (ou la notice d’offre) avant de faire un placement. Les organismes de placement collectif ne sont pas garantis, leur valeur fluctue souvent et leur rendement passé n’est pas indicatif de leur rendement futur.
    - paragraph: L’indice de référence est un indice obligataire général FTSE Canada présenté à des fins de comparaison seulement. Les indices ne sont pas gérés, n’assument aucuns frais et on ne peut y investir directement; la composition et le risque d’un fonds peuvent différer sensiblement de ceux de son indice de référence.
    - paragraph: Nymbus Capital inc. est inscrite à titre de gestionnaire de portefeuille et de gestionnaire de fonds d’investissement auprès de l’Autorité des marchés financiers (Québec). Les renseignements présentés sur ce site Web sont fournis à titre informatif seulement; ils ne constituent pas des conseils en placement, fiscaux, juridiques ou comptables et ne doivent pas être considérés comme tels. Ils ne constituent ni une offre de vente ni une sollicitation d’achat de titres ou de parts de fonds d’investissement dans un territoire où une telle offre ou sollicitation n’est pas autorisée. Les parts des fonds Nymbus ne sont offertes qu’au moyen de leurs documents de placement (prospectus simplifié et aperçu du fonds, ou notice d’offre aux investisseurs admissibles, selon le cas) et uniquement là où elles peuvent légalement être vendues.
    - paragraph: "Source : London Stock Exchange Group plc et les entreprises de son groupe (collectivement, le « Groupe LSE »). © Groupe LSE. FTSE Russell est une dénomination commerciale de certaines sociétés du Groupe LSE. « FTSE® » est une marque de commerce des sociétés concernées du Groupe LSE, utilisée sous licence par toute autre société du Groupe LSE. Tous les droits sur les indices ou les données FTSE Russell appartiennent à la société du Groupe LSE qui en est propriétaire. Ni le Groupe LSE ni ses concédants de licence n’assument de responsabilité à l’égard d’erreurs ou d’omissions dans les indices ou les données, et nul ne peut se fier aux indices ou aux données contenus dans la présente communication. Toute autre diffusion de données du Groupe LSE est interdite sans le consentement écrit exprès de la société concernée du Groupe LSE. Le Groupe LSE ne promeut, ne parraine ni n’approuve le contenu de la présente communication."
    - paragraph: Mis à jour quotidiennement à partir de la plateforme de données de Nymbus; données de portefeuille selon les positions quotidiennes au 28 septembre 2026; indicateurs de durabilité selon la fiche mensuelle d’août 2026. rendements au août 2026 · valeurs liquidatives au 28 sept. 2026.
  - heading "Le fonds vous intéresse?" [level=2]
  - paragraph: Notre équipe peut vous présenter le fonds, ses séries et la façon d’investir.
  - link "Communiquer avec notre équipe":
    - /url: /contact
  - link "Toutes les stratégies":
    - /url: /strategies
  - region "Autres stratégies":
    - paragraph: Explorer
    - heading "Autres stratégies" [level=2]
    - link "Revenu fixe de base Obligations Durables Bonifiées Obligations canadiennes de base, gérées de façon systématique Voir Fonds Nymbus Obligations Durables Bonifiées":
      - /url: /strategies/sustainable-enhanced-bonds
    - link "Stratégies alternatives Multistratégies Quatre stratégies systématiques conçues pour être peu corrélées entre elles Voir Fonds Nymbus Multistratégies":
      - /url: /strategies/multi-strategy
    - link "Stratégie de superposition (comptes gérés) Global Minimum Volatility Une stratégie de superposition conçue pour avoir une faible corrélation avec les obligations Voir Nymbus Global Minimum Volatility":
      - /url: /strategies/global-minimum-volatility
- contentinfo:
  - link "Nymbus Capital, accueil":
    - /url: /
    - img "nymbus"
  - paragraph: Gestionnaire de portefeuille établi à Montréal, qui conçoit des stratégies systématiques de revenu fixe et alternatives.
  - text: 1002, rue Sherbrooke Ouest, bureau 1900 Montréal (Québec) H3A 3L6
  - link "514 985-1138":
    - /url: tel:+15149851138
  - text: 1 833 227-2656 (sans frais)
  - link "info@nymbus.ca":
    - /url: mailto:info@nymbus.ca
  - heading "Stratégies" [level=2]
  - list:
    - listitem:
      - link "Revenu Mensuel":
        - /url: /strategies/monthly-income
    - listitem:
      - link "Obligations Durables Bonifiées":
        - /url: /strategies/sustainable-enhanced-bonds
    - listitem:
      - link "Multistratégies":
        - /url: /strategies/multi-strategy
    - listitem:
      - link "Global Minimum Volatility":
        - /url: /strategies/global-minimum-volatility
  - heading "Entreprise" [level=2]
  - list:
    - listitem:
      - link "À propos et équipe":
        - /url: /team
    - listitem:
      - link "Approche":
        - /url: /approach
    - listitem:
      - link "Développement durable":
        - /url: /sustainability
    - listitem:
      - link "Solutions":
        - /url: /solutions
  - heading "Ressources" [level=2]
  - list:
    - listitem:
      - link "Contact":
        - /url: /contact
    - listitem:
      - link "Politique de confidentialité":
        - /url: /privacy
    - listitem:
      - link "Plaintes et code d’éthique":
        - /url: /legal
    - listitem:
      - link "LinkedIn":
        - /url: https://www.linkedin.com/company/nymbus-capital/
  - paragraph: Nymbus Capital inc. est inscrite à titre de gestionnaire de portefeuille et de gestionnaire de fonds d’investissement auprès de l’Autorité des marchés financiers (Québec). Les renseignements présentés sur ce site Web sont fournis à titre informatif seulement; ils ne constituent pas des conseils en placement, fiscaux, juridiques ou comptables et ne doivent pas être considérés comme tels. Ils ne constituent ni une offre de vente ni une sollicitation d’achat de titres ou de parts de fonds d’investissement dans un territoire où une telle offre ou sollicitation n’est pas autorisée. Les parts des fonds Nymbus ne sont offertes qu’au moyen de leurs documents de placement (prospectus simplifié et aperçu du fonds, ou notice d’offre aux investisseurs admissibles, selon le cas) et uniquement là où elles peuvent légalement être vendues.
  - paragraph: Un placement dans un organisme de placement collectif peut donner lieu à des courtages, des commissions de suivi, des frais de gestion et d’autres frais. Veuillez lire l’aperçu du fonds et le prospectus (ou la notice d’offre) avant de faire un placement. Les organismes de placement collectif ne sont pas garantis, leur valeur fluctue souvent et leur rendement passé n’est pas indicatif de leur rendement futur.
  - paragraph: Les taux de rendement indiqués sont les rendements totaux annuels composés historiques, après déduction des frais, qui tiennent compte des fluctuations de la valeur des parts et du réinvestissement de toutes les distributions; ils ne tiennent pas compte des frais d’acquisition, de rachat, de placement ou des frais optionnels ni de l’impôt sur le revenu payable par un porteur, qui auraient réduit le rendement. Les rendements sont exprimés en dollars canadiens pour la série indiquée; les périodes de moins d’un an ne sont pas annualisées.
  - paragraph: L’indice de référence est un indice obligataire général FTSE Canada présenté à des fins de comparaison seulement. Les indices ne sont pas gérés, n’assument aucuns frais et on ne peut y investir directement; la composition et le risque d’un fonds peuvent différer sensiblement de ceux de son indice de référence.
  - paragraph: Le Fonds Nymbus Revenu Mensuel a été lancé le 5 octobre 2021. Les rendements présentés pour les périodes antérieures à cette date correspondent à ceux de la même stratégie de placement gérée par Nymbus Capital depuis janvier 2019; il ne s’agit pas des rendements du fonds, et ceux-ci auraient pu être différents si le fonds avait existé durant cette période.
  - paragraph: Nymbus Global Minimum Volatility est une stratégie offerte au moyen de comptes gérés distincts; il ne s’agit pas d’un fonds d’investissement. Ses rendements sont présentés avant déduction des frais de gestion et des autres frais, lesquels réduisent le rendement des clients; le rendement réel varie d’un compte à l’autre. Les rendements sont arithmétiques (sommes simples des rendements mensuels sur l’exposition notionnelle, non composés) et avant déduction des frais; le graphique de croissance est illustratif. Sauf si une autre variante est sélectionnée sur la page de la stratégie, les rendements présentés sont ceux de la variante à volatilité à la baisse de 6 %; la stratégie est aussi offerte avec des cibles de volatilité à la baisse de 3 % et de 9 %, dont les rendements diffèrent.
  - paragraph: "Source : London Stock Exchange Group plc et les entreprises de son groupe (collectivement, le « Groupe LSE »). © Groupe LSE. FTSE Russell est une dénomination commerciale de certaines sociétés du Groupe LSE. « FTSE® » est une marque de commerce des sociétés concernées du Groupe LSE, utilisée sous licence par toute autre société du Groupe LSE. Tous les droits sur les indices ou les données FTSE Russell appartiennent à la société du Groupe LSE qui en est propriétaire. Ni le Groupe LSE ni ses concédants de licence n’assument de responsabilité à l’égard d’erreurs ou d’omissions dans les indices ou les données, et nul ne peut se fier aux indices ou aux données contenus dans la présente communication. Toute autre diffusion de données du Groupe LSE est interdite sans le consentement écrit exprès de la société concernée du Groupe LSE. Le Groupe LSE ne promeut, ne parraine ni n’approuve le contenu de la présente communication."
  - text: © 2026 Nymbus Capital Inc. Tous droits réservés. Signataire des PRI
- alert
```

# Test source

```ts
  192 |   expect(overflow).toEqual([]);
  193 |   const wrapped = await page.getByTestId("distributions-summary").locator(".ds-amt").evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().height > 1.6 * parseFloat(getComputedStyle(e).lineHeight)).map((e) => e.textContent));
  194 |   expect(wrapped, "each amount on one line").toEqual([]);
  195 |   const history = page.getByTestId("distributions-history");
  196 |   await history.scrollIntoViewIfNeeded();
  197 |   const bars = page.getByTestId("distribution-chart").locator("svg .cat");
  198 |   await expect(bars).toHaveCount(24);
  199 |   // one tab stop for the chart (roving tabindex), on the latest distribution; arrows / Home / End move it
  200 |   await expect(page.getByTestId("distribution-chart").locator('svg .cat[tabindex="0"]')).toHaveCount(1);
  201 |   await expect(bars.nth(23)).toHaveAttribute("tabindex", "0");
  202 |   await bars.nth(23).focus();
  203 |   await page.keyboard.press("ArrowLeft");
  204 |   await expect(bars.nth(22)).toBeFocused();
  205 |   await expect(bars.nth(22)).toHaveAttribute("tabindex", "0");
  206 |   await expect(bars.nth(23)).toHaveAttribute("tabindex", "-1");
  207 |   await page.keyboard.press("Home");
  208 |   await expect(bars.nth(0)).toBeFocused();
  209 |   await page.keyboard.press("End");
  210 |   await expect(bars.nth(23)).toBeFocused();
  211 |   await expect(page.getByTestId("dist-ytd")).toHaveCount(1);
  212 |   await expect(page.getByTestId("distributions-calendar").locator("tbody tr").first()).toContainText("2026");
  213 |   const rows = page.getByTestId("distributions-table").locator("tbody tr");
  214 |   await expect(rows).toHaveCount(12);
  215 |   const toggle = page.getByTestId("distributions-show-all");
  216 |   await expect(toggle).toHaveAttribute("aria-expanded", "false");
  217 |   await toggle.click();
  218 |   await expect(toggle).toHaveAttribute("aria-expanded", "true");
  219 |   expect(await rows.count()).toBeGreaterThan(12);
  220 |   // another series: its own history
  221 |   await page.getByTestId("dist-series-LDM021").click();
  222 |   await expect(page.getByTestId("dist-series-LDM021")).toHaveAttribute("aria-pressed", "true");
  223 |   await expect(rows.first()).toContainText("Sep 28, 2026");
  224 |   await expect(page.getByTestId("distributions-note")).not.toContainText(/yield/i);
  225 | });
  226 | 
  227 | test("series selector switches the NAV card", async ({ page }) => {
  228 |   await page.goto("/strategies/monthly-income");
  229 |   const card = page.getByTestId("nav-card");
  230 |   // the default class is F (LDM081)
  231 |   await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM081");
  232 |   await expect(card.getByTestId("series-LDM081")).toHaveAttribute("aria-checked", "true");
  233 |   await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText("$10.0397");
  234 |   await card.getByTestId("series-LDM001").click();
  235 |   await expect(card.getByTestId("series-LDM001")).toHaveAttribute("aria-checked", "true");
  236 |   await expect(card.getByTestId("nav-fundserv")).toHaveText("LDM001");
  237 |   await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText("$10.1905");
  238 |   await card.getByTestId("series-LDM011").click();
  239 |   await expect(card.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^US\$\d+\.\d{4}$/);
  240 | });
  241 | 
  242 | test("tabs follow the URL hash and the keyboard", async ({ page }) => {
  243 |   await page.goto("/strategies/sustainable-enhanced-bonds#portfolio");
  244 |   const tabs = page.getByTestId("fund-tabs");
  245 |   await expect(tabs.locator('[role="tab"][data-tab="portfolio"]')).toHaveAttribute("aria-selected", "true");
  246 |   await expect(page.getByTestId("esg")).toBeVisible();
  247 |   await tabs.locator('[role="tab"][data-tab="portfolio"]').focus();
  248 |   await page.keyboard.press("ArrowRight");
  249 |   await expect(tabs.locator('[role="tab"][data-tab="distributions"]')).toHaveAttribute("aria-selected", "true");
  250 |   await expect(tabs.locator('[role="tab"][data-tab="distributions"]')).toBeFocused();
  251 |   // the header link selects the documents tab
  252 |   await page.evaluate(() => window.scrollTo(0, 0));
  253 |   await page.locator('.fh-actions a[href="#documents"]').click();
  254 |   await expect(tabs.locator('[role="tab"][data-tab="documents"]')).toHaveAttribute("aria-selected", "true");
  255 | });
  256 | 
  257 | test("without JavaScript every panel is on the page", async ({ browser }) => {
  258 |   const ctx = await browser.newContext({ javaScriptEnabled: false });
  259 |   const page = await ctx.newPage();
  260 |   await page.goto("/strategies/monthly-income");
  261 |   await expect(page.getByRole("heading", { level: 1, name: "Nymbus Monthly Income Fund" })).toBeVisible();
  262 |   for (const id of TABS) await expect(page.locator(`[role="tabpanel"][data-panel="${id}"]`)).toBeVisible();
  263 |   // Monthly Income F has no return series yet: its panels say "coming soon"
  264 |   await expect(page.getByTestId("perf-soon")).toBeAttached();
  265 |   await expect(page.getByTestId("holdings-table")).toBeVisible();
  266 |   await ctx.close();
  267 | });
  268 | 
  269 | test("legacy slug redirects to monthly income", async ({ page }) => {
  270 |   const res = await page.goto("/strategies/sustainable-enhanced-short-term-bonds");
  271 |   expect(res?.status()).toBe(200);
  272 |   await expect(page).toHaveURL(/\/strategies\/monthly-income$/);
  273 |   await expect(page.getByTestId("nav-card")).toBeVisible();
  274 | });
  275 | 
  276 | test("registry alias redirects to the canonical slug", async ({ page }) => {
  277 |   await page.goto("/strategies/gmv");
  278 |   await expect(page).toHaveURL(/\/strategies\/global-minimum-volatility$/);
  279 | });
  280 | 
  281 | test("unknown slug is a 404", async ({ page }) => {
  282 |   const res = await page.goto("/strategies/no-such-fund");
  283 |   expect(res?.status()).toBe(404);
  284 | });
  285 | 
  286 | test("French: labels, names and number formatting", async ({ page }) => {
  287 |   await page.goto("/strategies/monthly-income");
  288 |   await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: page.url() }]);
  289 |   await page.reload();
  290 |   await expect(page.getByRole("heading", { level: 1, name: "Fonds Nymbus Revenu Mensuel" })).toBeVisible();
  291 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="overview"]')).toHaveText("Aperçu");
> 292 |   await expect(page.getByTestId("figures-soon")).toContainText("Les rendements de la série F seront bientôt publiés");
      |                                                  ^ Error: expect(locator).toContainText(expected) failed
  293 |   await page.getByTestId("series-LDM001").click();
  294 |   await expect(page.getByTestId("basis")).toContainText("après déduction des frais");
  295 |   await expect(page.getByTestId("class-type")).toHaveText("Série à notice d’offre");
  296 |   // decimal comma and a no-break space before % / $
  297 |   await expect(page.getByTestId("badge-SI").locator(".fr-v")).toHaveText(/^[+−]?\d+,\d{2}\s%$/);
  298 |   await expect(page.getByTestId("hero-nav").locator(".odo .sr-only")).toHaveText(/^\d+,\d{4}\s\$$/);
  299 |   await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="portfolio"]').click();
  300 |   await expect(page.getByTestId("portfolio-source")).toContainText("Données quotidiennes du portefeuille");
  301 |   await expect(page.getByTestId("portfolio-asof")).toHaveText("au 28 septembre 2026");
  302 |   await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="distributions"]').click();
  303 |   await expect(page.getByTestId("dist-class-LDM001").getByTestId("dist-last-amount")).toHaveText(/^0,\d{6}\s\$$/);
  304 |   await expect(page.getByTestId("provenance")).toContainText("données de portefeuille selon les positions quotidiennes au 28 septembre 2026");
  305 | });
  306 | 
  307 | /* ------------------------------------------------------------------ classes, variants, awards, calendar labels */
  308 | 
  309 | test("class selector: returns follow the class; F is the default; a class without its own series says coming soon", async ({ page }) => {
  310 |   await page.goto("/strategies/sustainable-enhanced-bonds");
  311 |   const card = page.getByTestId("nav-card");
  312 |   const strip = page.getByTestId("return-strip");
  313 |   await expect(card.getByTestId("series-LDM201")).toHaveAttribute("aria-checked", "true");
  314 |   await expect(page.getByTestId("basis")).toContainText("Series F");
  315 |   const f = await strip.getByTestId("badge-SI").locator(".fr-v").innerText();
  316 |   await card.getByTestId("series-LDM202").click();
  317 |   await expect(page.getByTestId("basis")).toContainText("Series H");
  318 |   const h = await strip.getByTestId("badge-SI").locator(".fr-v").innerText();
  319 |   expect(h, "class H shows its own returns").not.toBe(f);
  320 |   // a class that has no series of its own: no figure at all, never F's
  321 |   await card.getByTestId("series-LDM205").click();
  322 |   await expect(strip.getByTestId("figures-soon")).toContainText("series A coming soon");
  323 |   await expect(strip.getByTestId("badge-SI")).toHaveCount(0);
  324 |   await openTab(page, "performance");
  325 |   await expect(page.getByTestId("perf-soon")).toContainText("series A coming soon");
  326 |   await expect(page.getByTestId("growth")).toHaveCount(0);
  327 |   await expect(page.getByTestId("calendar")).toHaveCount(0);
  328 |   await expect(page.getByTestId("risk")).toHaveCount(0);
  329 |   // back to F: everything returns
  330 |   await card.getByTestId("series-LDM201").click();
  331 |   await expect(page.getByTestId("calendar")).toBeVisible();
  332 |   await expect(page.getByTestId("risk")).toBeVisible();
  333 | });
  334 | 
  335 | test("class types: only classes whose type is known are labelled, with a disclosure sentence", async ({ page }) => {
  336 |   await page.goto("/strategies/monthly-income");
  337 |   const card = page.getByTestId("nav-card");
  338 |   await expect(card.getByTestId("class-type")).toHaveText("Prospectus class");
  339 |   await expect(card.getByTestId("class-type-note")).toContainText("simplified prospectus");
  340 |   await card.getByTestId("series-LDM001").click();
  341 |   await expect(card.getByTestId("class-type")).toHaveText("Offering memorandum class");
  342 |   await expect(card.getByTestId("class-type-note")).toContainText("offering memorandum");
  343 |   await expect(page.getByTestId("returns-class-type")).toHaveText("Offering memorandum class");
  344 |   // unknown type: nothing is said
  345 |   await card.getByTestId("series-LDM021").click();
  346 |   await expect(card.getByTestId("class-type")).toHaveCount(0);
  347 |   await expect(card.getByTestId("class-type-note")).toHaveCount(0);
  348 |   // the class table: the badge on the two classes whose type is known, none elsewhere
  349 |   await expect(page.getByTestId("class-type-LDM081")).toHaveText("Prospectus class");
  350 |   await expect(page.getByTestId("class-type-LDM001")).toHaveText("Offering memorandum class");
  351 |   await expect(page.getByTestId("class-type-LDM021")).toHaveCount(0);
  352 |   // SEB: no class has a known type yet: no label, no column
  353 |   await page.goto("/strategies/sustainable-enhanced-bonds");
  354 |   await expect(page.getByTestId("class-type")).toHaveCount(0);
  355 |   await expect(page.getByTestId("classes-table").locator("thead")).not.toContainText("Offered under");
  356 | });
  357 | 
  358 | test("Global Minimum Volatility: 3 / 6 / 9 % variants, default 6, no class selector, no NAV, no distributions", async ({ page }) => {
  359 |   await page.goto("/strategies/global-minimum-volatility");
  360 |   const sel = page.getByTestId("variant-selector");
  361 |   await expect(sel.getByTestId("variant-6")).toHaveAttribute("aria-checked", "true");
  362 |   await expect(sel.locator('[role="radio"]')).toHaveCount(3);
  363 |   await expect(page.getByTestId("nav-card")).toHaveCount(0);
  364 |   await expect(page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="distributions"]')).toHaveCount(0);
  365 |   const read = async () => page.getByTestId("return-strip").getByTestId("badge-SI").locator(".fr-v").innerText();
  366 |   // the value counts up: wait until it is non-zero and stable
  367 |   const si = async () => {
  368 |     let last = "";
  369 |     await expect.poll(async () => { const v = await read(); const ok = v === last && !/^[+-]?0[.,]00/.test(v); last = v; return ok; }, { intervals: [300] }).toBe(true);
  370 |     return last;
  371 |   };
  372 |   const six = await si();
  373 |   await sel.getByTestId("variant-3").click();
  374 |   const three = await si();
  375 |   await sel.getByTestId("variant-9").click();
  376 |   const nine = await si();
  377 |   expect(new Set([six, three, nine]).size, "each variant has its own returns").toBe(3);
  378 |   // every figure names its downside volatility variant: hero, return strip, overview, performance, chart legend, disclosure
  379 |   await expect(page.getByTestId("basis").getByTestId("variant-name")).toHaveText("9% downside volatility");
  380 |   await expect(page.getByTestId("hero-variant")).toHaveText("9% downside volatility");
  381 |   await expect(page.getByTestId("overview-variant")).toHaveText("9% downside volatility");
  382 |   await expect(page.getByTestId("disclosure-variant")).toHaveText("9% downside volatility");
  383 |   await openTab(page, "performance");
  384 |   await expect(page.getByTestId("perf-context").getByTestId("perf-variant")).toHaveText("9% downside volatility");
  385 |   await page.getByTestId("growth").scrollIntoViewIfNeeded();
  386 |   await expect(page.getByTestId("growth").locator(".fx-legend").first()).toContainText("(9% downside volatility)");
  387 |   await sel.getByTestId("variant-6").click();
  388 |   expect(await si()).toBe(six);
  389 |   await expect(page.getByTestId("hero-variant")).toHaveText("6% downside volatility");
  390 |   await expect(page.getByTestId("growth").locator(".fx-legend").first()).toContainText("(6% downside volatility)");
  391 | });
  392 | 
```