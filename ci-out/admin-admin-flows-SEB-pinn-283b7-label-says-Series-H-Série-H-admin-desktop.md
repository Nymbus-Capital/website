# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> admin flows >> SEB pinned to a class H run: F opens as coming soon; with class H selected every performance label says Series H / Série H
- Location: e2e/admin.spec.ts:383:7

# Error details

```
Error: apiRequestContext.get: read ECONNRESET
Call log:
  - → GET http://localhost:3100/api/admin/content
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.8010.12 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - cookie: nymbus_admin=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsaWNlQG55bWJ1cy5jYSIsIm5hbWUiOiJhbGljZSIsInRpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwZTJlMCIsInB2IjoiNjk0ZmY2OWExNzUyMDFiNSIsImp0aSI6ImUyZWRkODAyNWVjNTVlZDQ5NDhhMGYyZjgxNGZhNjdjODkzIiwic3ViIjoiMzMzMzMzMzMtMzMzMy0zMzMzLTMzMzMtMzMzMzMzMzNlMmUzIiwiaXNzIjoibnltYnVzLWFkbWluIiwiYXVkIjoibnltYnVzLWFkbWluIiwiaWF0IjoxNzkxMDY0MDgxLCJleHAiOjE3OTEwNjc2ODF9.0QnL6bqxdLa0CMWWn0MOl-wjqjY1Ck_3hp2cnNe-BqY
    - origin: http://localhost:3100
    - x-nymbus-admin: 1
    - content-type: application/json

```

# Page snapshot

```yaml
- generic [active] [ref=f6e1]:
  - link "Aller au contenu" [ref=f6e2] [cursor=pointer]:
    - /url: "#main"
  - banner [ref=f6e3]:
    - generic [ref=f6e4]:
      - link "Nymbus Capital, accueil" [ref=f6e5] [cursor=pointer]:
        - /url: /
        - img "nymbus" [ref=f6e6]
      - navigation "Principale" [ref=f6e15]:
        - list [ref=f6e16]:
          - listitem [ref=f6e17]:
            - link "Stratégies" [ref=f6e18] [cursor=pointer]:
              - /url: /strategies
          - listitem [ref=f6e21]:
            - link "Approche" [ref=f6e22] [cursor=pointer]:
              - /url: /approach
          - listitem [ref=f6e23]:
            - link "Concepts clés" [ref=f6e24] [cursor=pointer]:
              - /url: /critical-concepts
          - listitem [ref=f6e25]:
            - link "À propos" [ref=f6e26] [cursor=pointer]:
              - /url: /team
          - listitem [ref=f6e27]:
            - link "Solutions" [ref=f6e28] [cursor=pointer]:
              - /url: /solutions
          - listitem [ref=f6e29]:
            - link "Développement durable" [ref=f6e30] [cursor=pointer]:
              - /url: /sustainability
          - listitem [ref=f6e31]:
            - link "Contact" [ref=f6e32] [cursor=pointer]:
              - /url: /contact
      - button "View the site in English" [ref=f6e34] [cursor=pointer]:
        - generic [aria-hidden] [ref=f6e35]: en
        - generic [aria-hidden] [ref=f6e36]: fr
  - main [ref=f6e37]:
    - generic [ref=f6e38]:
      - generic [ref=f6e53]:
        - navigation "Breadcrumb" [ref=f6e54]:
          - list [ref=f6e55]:
            - listitem [ref=f6e56]:
              - link "Accueil" [ref=f6e57] [cursor=pointer]:
                - /url: /
            - listitem [ref=f6e60]:
              - generic [ref=f6e61]: Stratégies
        - generic [ref=f6e63]:
          - paragraph [ref=f6e65]: Stratégies de placement
          - heading "Nos fonds et stratégies" [level=1] [ref=f6e67]:
            - generic [aria-hidden] [ref=f6e68]:
              - generic [ref=f6e69]: Nos
              - generic [ref=f6e70]: fonds
              - generic [ref=f6e71]: et
              - generic [ref=f6e72]: stratégies
          - paragraph [ref=f6e74]: Revenu fixe systématique et stratégies alternatives. Chiffres mensuels, une fois validés.
          - generic [ref=f6e76]:
            - link "Comparer les stratégies" [ref=f6e77] [cursor=pointer]:
              - /url: "#compare"
            - link "Solutions de placement" [ref=f6e78] [cursor=pointer]:
              - /url: /solutions
      - region [ref=f6e81]:
        - generic [ref=f6e82]:
          - heading "Fonds et stratégies" [level=2] [ref=f6e83]
          - generic [ref=f6e84]:
            - group "Filtrer par catégorie d’actifs" [ref=f6e85]:
              - button "Toutes" [pressed] [ref=f6e86] [cursor=pointer]:
                - text: Toutes
                - generic [aria-hidden] [ref=f6e87]: "4"
              - button "Revenu fixe" [ref=f6e88] [cursor=pointer]:
                - text: Revenu fixe
                - generic [aria-hidden] [ref=f6e89]: "2"
              - button "Alternatives" [ref=f6e90] [cursor=pointer]:
                - text: Alternatives
                - generic [aria-hidden] [ref=f6e91]: "2"
            - paragraph [ref=f6e92]: 4 stratégies
          - generic [ref=f6e93]:
            - 'link "Revenu fixe à court terme Données fictives Fonds · Fundserv Revenu Mensuel Un revenu mensuel tiré d’obligations de sociétés à court terme DDA −0,3 % 1 an +0,7 % Depuis la création, annualisé +0,8 % VL · Série F 10,0397 $ au 28 sept. 2026 Rendements au août 2026 · Après déduction des frais · Rendements : Série F Rendements par année civile Niveau de risque Faible à moyen Voir la stratégie" [ref=f6e94] [cursor=pointer]':
              - /url: /strategies/monthly-income
              - generic [ref=f6e95]:
                - generic [aria-hidden] [ref=f6e96]: "01"
                - generic [ref=f6e97]: Revenu fixe à court terme
                - generic [ref=f6e98]:
                  - generic "Chiffres illustratifs seulement, pas des rendements réels." [ref=f6e99]: Données fictives
                  - generic [ref=f6e100]: Fonds · Fundserv
              - heading "Revenu Mensuel" [level=3] [ref=f6e101]
              - generic [ref=f6e102]: Un revenu mensuel tiré d’obligations de sociétés à court terme
              - generic [ref=f6e103]:
                - generic [ref=f6e104]:
                  - generic [ref=f6e105]:
                    - generic [ref=f6e106]: DDA
                    - generic [ref=f6e107]: −0,3 %
                  - generic [ref=f6e108]:
                    - generic [ref=f6e109]: 1 an
                    - generic [ref=f6e110]: +0,7 %
                  - generic [ref=f6e111]:
                    - generic [ref=f6e112]: Depuis la création, annualisé
                    - generic [ref=f6e113]: +0,8 %
                - generic [ref=f6e115]:
                  - generic [ref=f6e116]: VL · Série F
                  - generic [ref=f6e117]: 10,0397 $
                  - generic [ref=f6e118]: au 28 sept. 2026
                - generic [ref=f6e119]:
                  - text: Rendements au août 2026 · Après déduction des frais ·
                  - generic [ref=f6e120]: "Rendements : Série F"
              - figure "Rendements par année civile" [ref=f6e121]:
                - generic [aria-hidden] [ref=f6e123]:
                  - emphasis [ref=f6e126]: 1,9 %
                  - emphasis [ref=f6e128]: 0,4 %
                  - emphasis [ref=f6e130]: −0,3 %
                - generic [aria-hidden] [ref=f6e131]:
                  - generic [ref=f6e132]: 2024 lanc.
                  - generic [ref=f6e133]: "2025"
                  - generic [ref=f6e134]: 2026 CA
                - list [ref=f6e135]:
                  - listitem [ref=f6e136]: "2024 (depuis le lancement) : 1,9 %"
                  - listitem [ref=f6e137]: "2025 : 0,4 %"
                  - listitem [ref=f6e138]: "2026 (depuis le début de l’année) : −0,3 %"
              - generic [ref=f6e139]:
                - generic [ref=f6e140]: Niveau de risque
                - generic [ref=f6e141]: Faible à moyen
              - generic [ref=f6e149]: Voir la stratégie
            - link "Revenu fixe de base Données fictives Fonds · Fundserv Obligations Durables Bonifiées Obligations canadiennes de base, gérées de façon systématique Chiffres à venir Les rendements sont publiés ici une fois le mois fermé et validé. VL · Série F 9,5816 $ au 28 sept. 2026 Niveau de risque Faible Voir la stratégie" [ref=f6e152] [cursor=pointer]:
              - /url: /strategies/sustainable-enhanced-bonds
              - generic [ref=f6e153]:
                - generic [aria-hidden] [ref=f6e154]: "02"
                - generic [ref=f6e155]: Revenu fixe de base
                - generic [ref=f6e156]:
                  - generic "Chiffres illustratifs seulement, pas des rendements réels." [ref=f6e157]: Données fictives
                  - generic [ref=f6e158]: Fonds · Fundserv
              - heading "Obligations Durables Bonifiées" [level=3] [ref=f6e159]
              - generic [ref=f6e160]: Obligations canadiennes de base, gérées de façon systématique
              - generic [ref=f6e161]:
                - generic [ref=f6e166]:
                  - generic [ref=f6e167]: Chiffres à venir
                  - generic [ref=f6e168]: Les rendements sont publiés ici une fois le mois fermé et validé.
                - generic [ref=f6e170]:
                  - generic [ref=f6e171]: VL · Série F
                  - generic [ref=f6e172]: 9,5816 $
                  - generic [ref=f6e173]: au 28 sept. 2026
              - generic [ref=f6e174]:
                - generic [ref=f6e175]: Niveau de risque
                - generic [ref=f6e176]: Faible
              - generic [ref=f6e184]: Voir la stratégie
            - 'link "Stratégies alternatives Données fictives Fonds · Fundserv Multistratégies slogan e2e DDA +5,4 % 1 an +9,4 % Depuis la création, annualisé +7,6 % VL · Série F 13,0285 $ au 28 sept. 2026 Rendements au août 2026 · Après déduction des frais · Rendements : Série F Rendements par année civile Niveau de risque Moyen Voir la stratégie" [ref=f6e187] [cursor=pointer]':
              - /url: /strategies/multi-strategy
              - generic [ref=f6e188]:
                - generic [aria-hidden] [ref=f6e189]: "03"
                - generic [ref=f6e190]: Stratégies alternatives
                - generic [ref=f6e191]:
                  - generic "Chiffres illustratifs seulement, pas des rendements réels." [ref=f6e192]: Données fictives
                  - generic [ref=f6e193]: Fonds · Fundserv
              - heading "Multistratégies" [level=3] [ref=f6e194]
              - generic [ref=f6e195]: slogan e2e
              - generic [ref=f6e196]:
                - generic [ref=f6e197]:
                  - generic [ref=f6e198]:
                    - generic [ref=f6e199]: DDA
                    - generic [ref=f6e200]: +5,4 %
                  - generic [ref=f6e201]:
                    - generic [ref=f6e202]: 1 an
                    - generic [ref=f6e203]: +9,4 %
                  - generic [ref=f6e204]:
                    - generic [ref=f6e205]: Depuis la création, annualisé
                    - generic [ref=f6e206]: +7,6 %
                - generic [ref=f6e208]:
                  - generic [ref=f6e209]: VL · Série F
                  - generic [ref=f6e210]: 13,0285 $
                  - generic [ref=f6e211]: au 28 sept. 2026
                - generic [ref=f6e212]:
                  - text: Rendements au août 2026 · Après déduction des frais ·
                  - generic [ref=f6e213]: "Rendements : Série F"
              - figure "Rendements par année civile" [ref=f6e214]:
                - generic [aria-hidden] [ref=f6e216]:
                  - emphasis [ref=f6e219]: 14,0 %
                  - emphasis [ref=f6e221]: 5,1 %
                  - emphasis [ref=f6e223]: 9,2 %
                  - emphasis [ref=f6e225]: −7,6 %
                  - emphasis [ref=f6e227]: 16,1 %
                  - emphasis [ref=f6e229]: 5,4 %
                - generic [aria-hidden] [ref=f6e230]:
                  - generic [ref=f6e231]: "2021"
                  - generic [ref=f6e232]: "2022"
                  - generic [ref=f6e233]: "2023"
                  - generic [ref=f6e234]: "2024"
                  - generic [ref=f6e235]: "2025"
                  - generic [ref=f6e236]: 2026 CA
                - list [ref=f6e237]:
                  - listitem [ref=f6e238]: "2021 : 14,0 %"
                  - listitem [ref=f6e239]: "2022 : 5,1 %"
                  - listitem [ref=f6e240]: "2023 : 9,2 %"
                  - listitem [ref=f6e241]: "2024 : −7,6 %"
                  - listitem [ref=f6e242]: "2025 : 16,1 %"
                  - listitem [ref=f6e243]: "2026 (depuis le début de l’année) : 5,4 %"
              - generic [ref=f6e244]:
                - generic [ref=f6e245]: Niveau de risque
                - generic [ref=f6e246]: Moyen
              - generic [ref=f6e254]: Voir la stratégie
            - link "Stratégie de superposition (comptes gérés) Données fictives Comptes gérés Global Minimum Volatility Une stratégie de superposition conçue pour avoir une faible corrélation avec les obligations lors des mois de baisse DDA +4,8 % 1 an +6,1 % Depuis la création, annualisé +8,2 % Rendements au août 2026 · Avant déduction des frais · volatilité à la baisse de 6 % Rendements par année civile Niveau de risque Faible Voir la stratégie" [ref=f6e257] [cursor=pointer]:
              - /url: /strategies/global-minimum-volatility
              - generic [ref=f6e258]:
                - generic [aria-hidden] [ref=f6e259]: "04"
                - generic [ref=f6e260]: Stratégie de superposition (comptes gérés)
                - generic [ref=f6e261]:
                  - generic "Chiffres illustratifs seulement, pas des rendements réels." [ref=f6e262]: Données fictives
                  - generic [ref=f6e263]: Comptes gérés
              - heading "Global Minimum Volatility" [level=3] [ref=f6e264]
              - generic [ref=f6e265]: Une stratégie de superposition conçue pour avoir une faible corrélation avec les obligations lors des mois de baisse
              - generic [ref=f6e266]:
                - generic [ref=f6e267]:
                  - generic [ref=f6e268]:
                    - generic [ref=f6e269]: DDA
                    - generic [ref=f6e270]: +4,8 %
                  - generic [ref=f6e271]:
                    - generic [ref=f6e272]: 1 an
                    - generic [ref=f6e273]: +6,1 %
                  - generic [ref=f6e274]:
                    - generic [ref=f6e275]: Depuis la création, annualisé
                    - generic [ref=f6e276]: +8,2 %
                - generic [ref=f6e277]: Rendements au août 2026 · Avant déduction des frais · volatilité à la baisse de 6 %
              - figure "Rendements par année civile" [ref=f6e278]:
                - generic [aria-hidden] [ref=f6e280]:
                  - emphasis [ref=f6e283]: 2,8 %
                  - emphasis [ref=f6e285]: 6,0 %
                  - emphasis [ref=f6e287]: 5,3 %
                  - emphasis [ref=f6e289]: 3,7 %
                  - emphasis [ref=f6e291]: 9,4 %
                  - emphasis [ref=f6e293]: 4,8 %
                - generic [aria-hidden] [ref=f6e294]:
                  - generic [ref=f6e295]: "2021"
                  - generic [ref=f6e296]: "2022"
                  - generic [ref=f6e297]: "2023"
                  - generic [ref=f6e298]: "2024"
                  - generic [ref=f6e299]: "2025"
                  - generic [ref=f6e300]: 2026 CA
                - list [ref=f6e301]:
                  - listitem [ref=f6e302]: "2021 : 2,8 %"
                  - listitem [ref=f6e303]: "2022 : 6,0 %"
                  - listitem [ref=f6e304]: "2023 : 5,3 %"
                  - listitem [ref=f6e305]: "2024 : 3,7 %"
                  - listitem [ref=f6e306]: "2025 : 9,4 %"
                  - listitem [ref=f6e307]: "2026 (depuis le début de l’année) : 4,8 %"
              - generic [ref=f6e308]:
                - generic [ref=f6e309]: Niveau de risque
                - generic [ref=f6e310]: Faible
              - generic [ref=f6e318]: Voir la stratégie
          - paragraph [ref=f6e321]: Après déduction des frais, en CAD. Le rendement passé pourrait ne pas se reproduire. Voir les renseignements importants ci-dessous. Les rendements de Global Minimum Volatility (variante à volatilité à la baisse de 6 %, sauf si une autre est sélectionnée) sont présentés avant déduction des frais (comptes gérés, pas un fonds).
      - region [ref=f6e322]:
        - generic [ref=f6e323]:
          - generic [ref=f6e324]:
            - paragraph [ref=f6e326]: Côte à côte
            - heading "Comparaison des stratégies" [level=2] [ref=f6e328]:
              - generic [aria-hidden] [ref=f6e329]:
                - generic [ref=f6e330]: Comparaison
                - generic [ref=f6e331]: des
                - generic [ref=f6e332]: stratégies
            - generic [ref=f6e333]: Caractéristiques et rendements publiés, côte à côte.
          - region "Comparaison des stratégies" [ref=f6e336]:
            - table [ref=f6e337]:
              - caption [ref=f6e338]: Comparaison des stratégies
              - rowgroup [ref=f6e339]:
                - row [ref=f6e340]:
                  - columnheader "Stratégie" [ref=f6e341]
                  - columnheader "Véhicule" [ref=f6e342]
                  - columnheader "Indice de référence" [ref=f6e343]
                  - columnheader "DDA" [ref=f6e344]
                  - columnheader "1 an" [ref=f6e345]
                  - columnheader "Depuis la création" [ref=f6e346]
                  - columnheader "Niveau de risque" [ref=f6e347]
                  - columnheader "VL" [ref=f6e348]
              - rowgroup [ref=f6e349]:
                - row [ref=f6e350]:
                  - 'rowheader "Revenu Mensuel Revenu fixe à court terme Rendements au août 2026 · Rendements : Série F" [ref=f6e351]':
                    - link "Revenu Mensuel" [ref=f6e352] [cursor=pointer]:
                      - /url: /strategies/monthly-income
                    - generic [ref=f6e354]: Revenu fixe à court terme
                    - generic [ref=f6e355]:
                      - text: Rendements au août 2026 ·
                      - generic [ref=f6e356]: "Rendements : Série F"
                  - cell "Fonds · Fundserv LDM081" [ref=f6e357]:
                    - text: Fonds · Fundserv
                    - generic [ref=f6e358]: LDM081
                  - cell "Indice FTSE Canada des obligations corporatives à court terme" [ref=f6e359]
                  - cell "−0,3 %" [ref=f6e360]
                  - cell "+0,7 %" [ref=f6e361]
                  - cell "+0,8 % annualisé" [ref=f6e362]:
                    - text: +0,8 %
                    - generic [ref=f6e363]: annualisé
                  - cell "Faible à moyen" [ref=f6e364]
                  - cell "10,0397 $ Série F · 28 sept. 2026" [ref=f6e373]:
                    - text: 10,0397 $
                    - generic [ref=f6e374]: Série F · 28 sept. 2026
                - row [ref=f6e375]:
                  - rowheader "Obligations Durables Bonifiées Revenu fixe de base" [ref=f6e376]:
                    - link "Obligations Durables Bonifiées" [ref=f6e377] [cursor=pointer]:
                      - /url: /strategies/sustainable-enhanced-bonds
                    - generic [ref=f6e379]: Revenu fixe de base
                  - cell "Fonds · Fundserv LDM201" [ref=f6e380]:
                    - text: Fonds · Fundserv
                    - generic [ref=f6e381]: LDM201
                  - cell "Indice FTSE Canada des obligations universelles" [ref=f6e382]
                  - cell "—" [ref=f6e383]
                  - cell "—" [ref=f6e384]
                  - cell "—" [ref=f6e385]
                  - cell "Faible" [ref=f6e386]
                  - cell "9,5816 $ Série F · 28 sept. 2026" [ref=f6e395]:
                    - text: 9,5816 $
                    - generic [ref=f6e396]: Série F · 28 sept. 2026
                - row [ref=f6e397]:
                  - 'rowheader "Multistratégies Stratégies alternatives Rendements au août 2026 · Rendements : Série F" [ref=f6e398]':
                    - link "Multistratégies" [ref=f6e399] [cursor=pointer]:
                      - /url: /strategies/multi-strategy
                    - generic [ref=f6e401]: Stratégies alternatives
                    - generic [ref=f6e402]:
                      - text: Rendements au août 2026 ·
                      - generic [ref=f6e403]: "Rendements : Série F"
                  - cell "Fonds · Fundserv LDM301" [ref=f6e404]:
                    - text: Fonds · Fundserv
                    - generic [ref=f6e405]: LDM301
                  - cell "Aucun (rendement absolu)" [ref=f6e406]
                  - cell "+5,4 %" [ref=f6e407]
                  - cell "+9,4 %" [ref=f6e408]
                  - cell "+7,6 % annualisé" [ref=f6e409]:
                    - text: +7,6 %
                    - generic [ref=f6e410]: annualisé
                  - cell "Moyen" [ref=f6e411]
                  - cell "13,0285 $ Série F · 28 sept. 2026" [ref=f6e420]:
                    - text: 13,0285 $
                    - generic [ref=f6e421]: Série F · 28 sept. 2026
                - row [ref=f6e422]:
                  - rowheader "Global Minimum Volatility Stratégie de superposition (comptes gérés) Rendements au août 2026 · volatilité à la baisse de 6 %" [ref=f6e423]:
                    - link "Global Minimum Volatility" [ref=f6e424] [cursor=pointer]:
                      - /url: /strategies/global-minimum-volatility
                    - generic [ref=f6e426]: Stratégie de superposition (comptes gérés)
                    - generic [ref=f6e427]: Rendements au août 2026 · volatilité à la baisse de 6 %
                  - cell "Comptes gérés" [ref=f6e428]
                  - cell "Aucun (rendement absolu)" [ref=f6e429]
                  - cell "+4,8 % brut" [ref=f6e430]:
                    - text: +4,8 %
                    - generic [ref=f6e431]: brut
                  - cell "+6,1 % brut" [ref=f6e432]:
                    - text: +6,1 %
                    - generic [ref=f6e433]: brut
                  - cell "+8,2 % annualisé · brut" [ref=f6e434]:
                    - text: +8,2 %
                    - generic [ref=f6e435]: annualisé · brut
                  - cell "Faible" [ref=f6e436]
                  - cell "—" [ref=f6e445]
          - generic [ref=f6e446]:
            - paragraph [ref=f6e447]:
              - generic "Chiffres illustratifs seulement, pas des rendements réels." [ref=f6e448]: Données fictives
              - text: Chiffres illustratifs seulement, pas des rendements réels.
            - paragraph [ref=f6e449]: Après déduction des frais, en CAD. Le rendement passé pourrait ne pas se reproduire. Voir les renseignements importants ci-dessous. Les rendements de Global Minimum Volatility (variante à volatilité à la baisse de 6 %, sauf si une autre est sélectionnée) sont présentés avant déduction des frais (comptes gérés, pas un fonds).
            - paragraph [ref=f6e450]: "— : pas encore publié; nous n’affichons jamais d’estimation à sa place."
            - paragraph [ref=f6e451]: Les rendements depuis la création sont annualisés lorsque l’historique couvre au moins 12 mois, cumulatifs sinon. Les rendements depuis le début de l’année et sur 1 an ne sont pas annualisés.
      - generic [ref=f6e454]:
        - heading "Quelle stratégie convient à votre mandat?" [level=2] [ref=f6e455]:
          - generic [aria-hidden] [ref=f6e456]:
            - generic [ref=f6e457]: Quelle
            - generic [ref=f6e458]: stratégie
            - generic [ref=f6e459]: convient
            - generic [ref=f6e460]: à
            - generic [ref=f6e461]: votre
            - generic [ref=f6e462]: mandat?
        - paragraph [ref=f6e464]: Posez-nous vos questions sur chaque stratégie et la façon d’y accéder.
        - generic [ref=f6e466]:
          - link "Communiquez avec nous" [ref=f6e467] [cursor=pointer]:
            - /url: /contact
          - link "Voir les solutions" [ref=f6e470] [cursor=pointer]:
            - /url: /solutions
  - contentinfo [ref=f6e471]:
    - generic [ref=f6e472]:
      - generic [ref=f6e473]:
        - generic [ref=f6e474]:
          - link "Nymbus Capital, accueil" [ref=f6e475] [cursor=pointer]:
            - /url: /
            - img "nymbus" [ref=f6e476]
          - paragraph [ref=f6e485]: Gestionnaire de portefeuille établi à Montréal, qui conçoit des stratégies systématiques de revenu fixe et alternatives.
          - generic [ref=f6e486]:
            - generic [ref=f6e487]: 1002, rue Sherbrooke Ouest, bureau 1900 Montréal (Québec) H3A 3L6
            - link "514 985-1138" [ref=f6e488] [cursor=pointer]:
              - /url: tel:+15149851138
            - generic [ref=f6e489]: 1 833 227-2656 (sans frais)
            - link "info@nymbus.ca" [ref=f6e490] [cursor=pointer]:
              - /url: mailto:info@nymbus.ca
        - generic [ref=f6e491]:
          - heading "Stratégies" [level=2] [ref=f6e492]
          - list [ref=f6e493]:
            - listitem [ref=f6e494]:
              - link "Revenu Mensuel" [ref=f6e495] [cursor=pointer]:
                - /url: /strategies/monthly-income
            - listitem [ref=f6e497]:
              - link "Obligations Durables Bonifiées" [ref=f6e498] [cursor=pointer]:
                - /url: /strategies/sustainable-enhanced-bonds
            - listitem [ref=f6e500]:
              - link "Multistratégies" [ref=f6e501] [cursor=pointer]:
                - /url: /strategies/multi-strategy
            - listitem [ref=f6e503]:
              - link "Global Minimum Volatility" [ref=f6e504] [cursor=pointer]:
                - /url: /strategies/global-minimum-volatility
        - generic [ref=f6e506]:
          - heading "Entreprise" [level=2] [ref=f6e507]
          - list [ref=f6e508]:
            - listitem [ref=f6e509]:
              - link "À propos et équipe" [ref=f6e510] [cursor=pointer]:
                - /url: /team
            - listitem [ref=f6e511]:
              - link "Approche" [ref=f6e512] [cursor=pointer]:
                - /url: /approach
            - listitem [ref=f6e513]:
              - link "Concepts clés" [ref=f6e514] [cursor=pointer]:
                - /url: /critical-concepts
            - listitem [ref=f6e515]:
              - link "Développement durable" [ref=f6e516] [cursor=pointer]:
                - /url: /sustainability
            - listitem [ref=f6e517]:
              - link "Solutions" [ref=f6e518] [cursor=pointer]:
                - /url: /solutions
        - generic [ref=f6e519]:
          - heading "Ressources" [level=2] [ref=f6e520]
          - list [ref=f6e521]:
            - listitem [ref=f6e522]:
              - link "Contact" [ref=f6e523] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=f6e524]:
              - link "Politique de confidentialité" [ref=f6e525] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=f6e526]:
              - link "Plaintes et code d’éthique" [ref=f6e527] [cursor=pointer]:
                - /url: /legal
            - listitem [ref=f6e528]:
              - link "LinkedIn" [ref=f6e529] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/nymbus-capital/
      - generic [ref=f6e533]:
        - paragraph [ref=f6e534]: Nymbus Capital inc. est inscrite à titre de gestionnaire de portefeuille et de gestionnaire de fonds d’investissement auprès de l’Autorité des marchés financiers (Québec). Les renseignements présentés sur ce site Web sont fournis à titre informatif seulement; ils ne constituent pas des conseils en placement, fiscaux, juridiques ou comptables et ne doivent pas être considérés comme tels. Ils ne constituent ni une offre de vente ni une sollicitation d’achat de titres ou de parts de fonds d’investissement dans un territoire où une telle offre ou sollicitation n’est pas autorisée. Les parts des fonds Nymbus ne sont offertes qu’au moyen de leurs documents de placement (prospectus simplifié et aperçu du fonds, ou notice d’offre aux investisseurs admissibles, selon le cas) et uniquement là où elles peuvent légalement être vendues.
        - paragraph [ref=f6e535]: Un placement dans un organisme de placement collectif peut donner lieu à des courtages, des commissions de suivi, des frais de gestion et d’autres frais. Veuillez lire l’aperçu du fonds et le prospectus (ou la notice d’offre) avant de faire un placement. Les organismes de placement collectif ne sont pas garantis, leur valeur fluctue souvent et leur rendement passé n’est pas indicatif de leur rendement futur.
        - paragraph [ref=f6e536]: Les taux de rendement indiqués sont les rendements totaux annuels composés historiques, après déduction des frais, qui tiennent compte des fluctuations de la valeur des parts et du réinvestissement de toutes les distributions; ils ne tiennent pas compte des frais d’acquisition, de rachat, de placement ou des frais optionnels ni de l’impôt sur le revenu payable par un porteur, qui auraient réduit le rendement. Les rendements sont exprimés en dollars canadiens pour la série indiquée; les périodes de moins d’un an ne sont pas annualisées.
        - paragraph [ref=f6e537]: L’indice de référence est un indice obligataire général FTSE Canada présenté à des fins de comparaison seulement. Les indices ne sont pas gérés, n’assument aucuns frais et on ne peut y investir directement; la composition et le risque d’un fonds peuvent différer sensiblement de ceux de son indice de référence.
        - paragraph [ref=f6e538]: Le Fonds Nymbus Revenu Mensuel a été lancé le 5 octobre 2021. Les rendements présentés pour les périodes antérieures à cette date correspondent à ceux de la même stratégie de placement gérée par Nymbus Capital depuis janvier 2019; il ne s’agit pas des rendements du fonds, et ceux-ci auraient pu être différents si le fonds avait existé durant cette période.
        - paragraph [ref=f6e539]: Nymbus Global Minimum Volatility est une stratégie offerte au moyen de comptes gérés distincts; il ne s’agit pas d’un fonds d’investissement. Ses rendements sont présentés avant déduction des frais de gestion et des autres frais, lesquels réduisent le rendement des clients; le rendement réel varie d’un compte à l’autre. Les rendements sont arithmétiques (sommes simples des rendements mensuels sur l’exposition notionnelle, non composés) et avant déduction des frais; le graphique de croissance est illustratif. Sauf si une autre variante est sélectionnée sur la page de la stratégie, les rendements présentés sont ceux de la variante à volatilité à la baisse de 6 %; la stratégie est aussi offerte avec des cibles de volatilité à la baisse de 3 % et de 9 %, dont les rendements diffèrent.
        - paragraph [ref=f6e540]: "Source : London Stock Exchange Group plc et les entreprises de son groupe (collectivement, le « Groupe LSE »). © Groupe LSE. FTSE Russell est une dénomination commerciale de certaines sociétés du Groupe LSE. « FTSE® » est une marque de commerce des sociétés concernées du Groupe LSE, utilisée sous licence par toute autre société du Groupe LSE. Tous les droits sur les indices ou les données FTSE Russell appartiennent à la société du Groupe LSE qui en est propriétaire. Ni le Groupe LSE ni ses concédants de licence n’assument de responsabilité à l’égard d’erreurs ou d’omissions dans les indices ou les données, et nul ne peut se fier aux indices ou aux données contenus dans la présente communication. Toute autre diffusion de données du Groupe LSE est interdite sans le consentement écrit exprès de la société concernée du Groupe LSE. Le Groupe LSE ne promeut, ne parraine ni n’approuve le contenu de la présente communication."
      - generic [ref=f6e541]:
        - generic [ref=f6e542]: © 2026 Nymbus Capital Inc. Tous droits réservés.
        - generic [ref=f6e543]: Signataire des PRI
  - alert [ref=f6e544]
```

# Test source

```ts
  337 | 
  338 |     // restore the boilerplate (empty override)
  339 |     const after = (await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json()).content;
  340 |     await request.put("/api/admin/content/settings", {
  341 |       headers: adminHeaders(token),
  342 |       data: { version: after.version, firm: { aumLabel: after.firm.aumLabel, announcement: null, disclaimer: { en: "", fr: "" } }, publishMode: after.pipeline.publishMode },
  343 |     });
  344 | 
  345 |     // a stale hash is refused
  346 |     const stale = await request.post("/api/admin/compliance", { headers: adminHeaders(token), data: { version: after.version + 1, textsHash: "0000000000000000", confirm: true } });
  347 |     expect(stale.status()).toBe(409);
  348 |   });
  349 | 
  350 |   test("unticking 'hide aum' persists and publishes the fund AUM; ticking it again removes it from the page", async ({ page, context, request }, info) => {
  351 |     test.skip(info.project.name !== "desktop", "mutations run on the desktop project only");
  352 |     const token = await signIn(context);
  353 |     const fund = "sustainable-enhanced-bonds";
  354 |     const before = await request.get(`/strategies/${fund}`).then((r) => r.text());
  355 |     expect(before).not.toMatch(CAD_KEY);
  356 | 
  357 |     await page.goto(`/admin/funds/${fund}`);
  358 |     const aum = page.getByTestId("fund-editor").locator("label.adm-chip", { hasText: /^aum$/ }).locator("input");
  359 |     await expect(aum).toBeChecked(); // hidden by default
  360 |     await aum.uncheck({ force: true });
  361 |     await page.getByTestId("save-fund").click();
  362 |     await expect(page.locator(".adm-toast.ok")).toContainText("Saved");
  363 | 
  364 |     const { content } = await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json();
  365 |     expect(content.funds[fund].hide?.aum).toBe(false);
  366 |     const after = await request.get(`/strategies/${fund}`).then((r) => r.text());
  367 |     expect(after).toMatch(CAD_KEY);
  368 | 
  369 |     // restore (hide again)
  370 |     const put = await request.put(`/api/admin/content/funds/${fund}`, {
  371 |       headers: adminHeaders(token),
  372 |       data: { version: content.version, fund: { ...content.funds[fund], hide: { ...(content.funds[fund].hide ?? {}), aum: true } } },
  373 |     });
  374 |     expect(put.status()).toBe(200);
  375 |     expect(await request.get(`/strategies/${fund}`).then((r) => r.text())).not.toMatch(CAD_KEY);
  376 | 
  377 |     // a one-language override is rejected
  378 |     const v = (await put.json()).content.version;
  379 |     const bad = await request.put(`/api/admin/content/funds/${fund}`, { headers: adminHeaders(token), data: { version: v, fund: { tagline: { en: "only english", fr: "" } } } });
  380 |     expect(bad.status()).toBe(400);
  381 |   });
  382 | 
  383 |   test("SEB pinned to a class H run: F opens as coming soon; with class H selected every performance label says Series H / Série H", async ({ page, context, request }, info) => {
  384 |     // mutates the (global) content: desktop admin project only, restored at the end
  385 |     test.skip(info.project.name !== "admin-desktop", "mutations run on the desktop project only");
  386 |     const token = await signIn(context);
  387 |     const fund = "sustainable-enhanced-bonds";
  388 |     // a stored "live" run whose SEB data is the class H series (synthetic: what the dataplatform serves before PR #626)
  389 |     const id = "20260929T140000-e2eclassh";
  390 |     const dirRun = path.join(E2E_ENV.SITE_DATA_DIR, "snapshots", id);
  391 |     mkdirSync(dirRun, { recursive: true });
  392 |     const data = JSON.parse(readFileSync("e2e/fixtures/seb-class-h-site-data.json", "utf8"));
  393 |     expect(data.funds[fund].performance.classCode).toBe("STRATEGY_H");
  394 |     writeFileSync(path.join(dirRun, "site-data.json"), JSON.stringify({ ...data, runId: id }));
  395 |     writeFileSync(path.join(dirRun, "report.json"), JSON.stringify({
  396 |       id, trigger: "manual", by: "e2e", startedAt: data.generatedAt, finishedAt: data.generatedAt, status: "published", asOf: data.asOf,
  397 |       issues: [], sources: [], funds: { [fund]: "updated" }, publishedAt: data.generatedAt, publishedBy: "e2e",
  398 |     }));
  399 |     const { content } = await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json();
  400 |     const original = content.funds[fund] ?? {};
  401 |     const pin = await request.put(`/api/admin/content/funds/${fund}`, { headers: adminHeaders(token), data: { version: content.version, fund: { ...original, pinnedSnapshot: id } } });
  402 |     expect(pin.status(), await pin.text()).toBe(200);
  403 |     try {
  404 |       for (const [lang, word, fundWord, returns] of [["en", "Series", "Fund", "Returns: Series"], ["fr", "Série", "Fonds", "Rendements\\s:\\sSérie"]] as const) {
  405 |         await page.goto(`/strategies/${fund}`);
  406 |         if (lang === "fr") {
  407 |           // cookie for the whole site (a cookie set from the fund page's URL would be scoped to /strategies)
  408 |           await page.context().addCookies([{ name: "nymbus-locale", value: "fr", url: BASE }]);
  409 |           await page.reload();
  410 |         }
  411 |         // the page opens on class F (LDM201), which this run has no series for: "coming soon", never H's numbers under F
  412 |         await expect(page.getByTestId("figures-soon")).toBeVisible();
  413 |         await page.getByTestId("nav-card").getByTestId("series-LDM202").click();
  414 |         const h = new RegExp(`${word} H(?![A-Za-z])`);
  415 |         const f = new RegExp(`(Series|Série) F(?![A-Za-z])`);
  416 |         for (const tid of ["basis", "overview-returns", "perf-class"]) {
  417 |           await expect(page.getByTestId(tid)).toContainText(h);
  418 |           await expect(page.getByTestId(tid)).not.toContainText(f);
  419 |         }
  420 |         // the NAV card follows the class selected (H, LDM202)
  421 |         await expect(page.getByTestId("nav-fundserv")).toHaveText("LDM202");
  422 |         await page.getByTestId("fund-tabs").locator('[role="tab"][data-tab="performance"]').click();
  423 |         await expect(page.getByTestId("perf-context")).toContainText(h);
  424 |         await expect(page.getByTestId("perf-context")).not.toContainText(f);
  425 |         await page.getByTestId("growth").scrollIntoViewIfNeeded();
  426 |         await expect(page.getByTestId("growth").locator(".fx-legend").first()).toContainText(`${fundWord} (${word} H)`);
  427 |         // home tile and strategies index
  428 |         for (const p of ["/", "/strategies"]) {
  429 |           await page.goto(p);
  430 |           // the tile shows only the headline class's own returns: F has no series here, so no class H figure appears
  431 |           await expect(page.getByTestId(`strategy-${fund}`).getByTestId("perf-class")).toHaveCount(0);
  432 |         }
  433 |         await expect(page.getByTestId("compare-table").getByTestId("perf-class").filter({ hasText: new RegExp(`${returns} H$`) })).toHaveCount(0);
  434 |       }
  435 |       await shot(page, "seb-class-h-strategies", info.project.name);
  436 |     } finally {
> 437 |       const cur = (await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json()).content;
      |                                         ^ Error: apiRequestContext.get: read ECONNRESET
  438 |       const { pinnedSnapshot: _pin, ...rest } = cur.funds[fund] ?? {}; // eslint-disable-line @typescript-eslint/no-unused-vars
  439 |       const unpin = await request.put(`/api/admin/content/funds/${fund}`, { headers: adminHeaders(token), data: { version: cur.version, fund: rest } });
  440 |       expect(unpin.status()).toBe(200);
  441 |     }
  442 |     await page.goto(`/strategies/${fund}`);
  443 |     await page.context().clearCookies({ name: "nymbus-locale" });
  444 |     await page.reload();
  445 |     await expect(page.getByTestId("basis")).toContainText(/Series F(?![A-Za-z])/);
  446 |   });
  447 | 
  448 |   test("rankings: seeded RBC entry shown; new entry draft → stale hidden → fresh shown with source and date; brand image slots", async ({ page, context, request }, info) => {
  449 |     test.skip(info.project.name !== "admin-desktop", "mutations run on the desktop project only");
  450 |     const token = await signIn(context);
  451 |     const fund = "sustainable-enhanced-bonds";
  452 |     const original = (await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json()).content.funds[fund];
  453 | 
  454 |     await page.goto("/admin");
  455 |     // official Morningstar files are shipped: no missing-assets warning; the seeded RBC entry is confirmed
  456 |     await expect(page.getByTestId("rankings-panel")).toBeVisible();
  457 |     await expect(page.getByTestId("rankings-panel")).not.toContainText("official Morningstar assets missing");
  458 |     await expect(page.getByTestId("rankings-panel")).toContainText("Q2 2026");
  459 | 
  460 |     await page.goto(`/admin/funds/${fund}`);
  461 |     const ed = page.getByTestId("tp-editor");
  462 |     await expect(ed.getByTestId("tp-status-0")).toHaveText("shown on the site");
  463 |     await expect(page.getByTestId("morningstar-assets-missing")).toHaveCount(0);
  464 |     // a new eVestment entry: draft, then confirmed but stale (hidden), then fresh (shown)
  465 |     await page.getByTestId("tp-add-evestment").click();
  466 |     await expect(ed.getByTestId("tp-status-1")).toHaveText("draft — hidden");
  467 |     const n = "eVestment 2";
  468 |     const label = (s: string) => page.getByLabel(`${n} ${s}`, { exact: true });
  469 |     await label("class").fill("Strategy composite");
  470 |     await label("peer group (EN)").fill("Canadian Core Plus Fixed Income");
  471 |     await label("peer group (FR)").fill("Revenu fixe canadien de base plus");
  472 |     await label("as of").fill("2025-12-31");
  473 |     await label("source URL").fill("https://www.evestment.example/e2e-ranking");
  474 |     await ed.getByTestId("tp-entry-1").getByRole("button", { name: "add period", exact: true }).click();
  475 |     await label("percentile 1M").fill("3");
  476 |     await label("confirmed").check();
  477 |     await expect(ed.getByTestId("tp-status-1")).toHaveText("out of date — hidden");
  478 |     await page.getByTestId("save-fund").click();
  479 |     await expect(page.locator(".adm-toast.ok")).toContainText("Saved");
  480 |     await shot(page, "rankings", info.project.name);
  481 | 
  482 |     // stale: neither on the page nor in its payload
  483 |     const staleHtml = await request.get(`/strategies/${fund}`).then((r) => r.text());
  484 |     expect(staleHtml).not.toContain("e2e-ranking");
  485 |     await page.goto(`/strategies/${fund}#awards`);
  486 |     await expect(page.getByTestId("awards")).toBeVisible();
  487 |     await expect(page.getByTestId("tp-evestment")).toHaveCount(0);
  488 |     await expect(page.getByTestId("tp-rbc-pfs")).toBeVisible();
  489 | 
  490 |     // fresh (end of the last quarter): shown on the awards tab and in the advisors list, with source link and date
  491 |     const now = new Date();
  492 |     const qEnd = new Date(Date.UTC(now.getUTCFullYear(), Math.floor(now.getUTCMonth() / 3) * 3, 0)).toISOString().slice(0, 10);
  493 |     await page.goto(`/admin/funds/${fund}`);
  494 |     await label("as of").fill(qEnd);
  495 |     await expect(page.getByTestId("tp-editor").getByTestId("tp-status-1")).toHaveText("shown on the site");
  496 |     await page.getByTestId("save-fund").click();
  497 |     await expect(page.locator(".adm-toast.ok")).toContainText("Saved");
  498 |     await page.goto(`/strategies/${fund}#awards`);
  499 |     const entry = page.getByTestId("tp-evestment");
  500 |     await expect(entry).toBeVisible();
  501 |     await expect(entry.getByTestId("tp-row-1M")).toContainText("3rd percentile");
  502 |     await expect(entry.getByRole("link", { name: /eVestment/ })).toHaveAttribute("href", "https://www.evestment.example/e2e-ranking");
  503 |     await page.goto("/solutions#advisor");
  504 |     await expect(page.getByTestId("advisor-rankings-sustainable-enhanced-bonds").getByTestId("advisor-item-evestment")).toContainText("3rd percentile");
  505 | 
  506 |     // a confirmed entry without its source URL is refused by the API
  507 |     const cur = (await (await request.get("/api/admin/content", { headers: adminHeaders(token) })).json()).content;
  508 |     const noUrl = { ...cur.funds[fund].rankings.thirdParty[1], url: undefined };
  509 |     const bad = await request.put(`/api/admin/content/funds/${fund}`, { headers: adminHeaders(token), data: { version: cur.version, fund: { ...cur.funds[fund], rankings: { ...cur.funds[fund].rankings, thirdParty: [noUrl] } } } });
  510 |     expect(bad.status()).toBe(400);
  511 |     expect(await bad.text()).toContain("source URL");
  512 | 
  513 |     // restore the seeded content
  514 |     const restore = await request.put(`/api/admin/content/funds/${fund}`, { headers: adminHeaders(token), data: { version: cur.version, fund: original } });
  515 |     expect(restore.status(), await restore.text()).toBe(200);
  516 | 
  517 |     // brand image slots: plain image accepted and served with its exact type, an active SVG refused, removal
  518 |     const svgBad = await request.post("/api/admin/upload/brand", { headers: adminHeaders(token, false), multipart: { slot: "gmr-logo", file: { name: "x.svg", mimeType: "image/svg+xml", buffer: Buffer.from('<svg onload="alert(1)"></svg>') } } });
  519 |     expect(svgBad.status()).toBe(415);
  520 |     const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
  521 |     const up = await request.post("/api/admin/upload/brand", { headers: adminHeaders(token, false), multipart: { slot: "gmr-logo", file: { name: "gmr.png", mimeType: "image/png", buffer: png } } });
  522 |     expect(up.status(), await up.text()).toBe(201);
  523 |     const img = await request.get("/api/brand/gmr-logo");
  524 |     expect(img.status()).toBe(200);
  525 |     expect(img.headers()["content-type"]).toBe("image/png");
  526 |     expect(img.headers()["x-content-type-options"]).toBe("nosniff");
  527 |     expect(img.headers()["content-security-policy"]).toContain("sandbox");
  528 |     expect((await request.get("/api/brand/not-a-slot")).status()).toBe(404);
  529 |     expect((await request.post("/api/admin/upload/brand", { multipart: { slot: "gmr-logo", file: { name: "gmr.png", mimeType: "image/png", buffer: png } } })).status()).toBe(401);
  530 |     await page.goto("/admin/settings");
  531 |     await expect(page.getByTestId("brand-gmr-logo")).toContainText("uploaded");
  532 |     await expect(page.getByTestId("brand-morningstar-logo")).toContainText("shipped");
  533 |     await expect(page.getByTestId("brand-morningstar-stars-4")).toContainText("missing");
  534 |     const del = await request.delete("/api/admin/brand/gmr-logo", { headers: adminHeaders(token, false) });
  535 |     expect(del.status()).toBe(200);
  536 |     expect((await request.get("/api/brand/gmr-logo")).status()).toBe(404);
  537 |   });
```