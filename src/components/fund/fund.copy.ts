/**
 * Fund page copy, EN / FR, sentence case. Regulatory texts live in src/content/disclaimers.ts (compliance review);
 * this file holds labels and the descriptive texts of each fund. No figure is written here: every number on the
 * page comes from the published data (SiteData) or the admin content (FundContent). Pure data.
 */
import type { DocType, FundKey, Period } from "../../lib/data/types.ts";
import { DISC } from "../../content/disclaimers.ts";
import { l, type L } from "../../lib/i18n/config.ts";

export const T = {
  crumbs: { home: l("Home", "Accueil"), strategies: l("Strategies", "Stratégies") },
  sample: {
    ribbon: l("Sample data", "Données fictives"),
    note: l(
      "Illustrative figures only, not actual performance",
      "Chiffres illustratifs seulement, pas des rendements réels",
    ),
  },
  header: {
    vehicleFund: l("Mutual fund", "Organisme de placement collectif"),
    vehicleStrategy: l("Managed accounts", "Comptes gérés"),
    risk: l("Risk", "Risque"),
    levels: [
      l("Low", "Faible"),
      l("Low to medium", "Faible à moyen"),
      l("Medium", "Moyen"),
      l("Medium to high", "Moyen à élevé"),
      l("High", "Élevé"),
    ],
    contact: l("Contact us", "Nous joindre"),
    documents: l("Fund documents", "Documents du fonds"),
    strategyDocuments: l("Documentation", "Documentation"),
  },
  nav: {
    title: l("Net asset value per unit", "Valeur liquidative par part"),
    series: l("Series", "Série"),
    chooseSeries: l("Choose a series", "Choisir une série"),
    change: l("vs previous valuation day", "par rapport au jour d’évaluation précédent"),
    noChange: l("No daily change published", "Aucune variation quotidienne publiée"),
    asOf: l("As of", "Au"),
    currency: l("Currency", "Devise"),
    fundserv: l("Fundserv", "Fundserv"),
    trackRecord: l("Track record since", "Historique depuis"),
    fundLaunch: l("Fund launch", "Lancement du fonds"),
    mer: l("MER", "RFG"),
    managementFee: l("Management fee", "Frais de gestion"),
    benchmark: l("Benchmark", "Indice de référence"),
    aum: l("Fund assets", "Actif du fonds"),
    // strategy card (managed accounts, no NAV)
    strategyTitle: l("Strategy at a glance", "La stratégie en bref"),
    siGross: l(
      "Annualized return since inception, gross of fees",
      "Rendement annualisé depuis la création, avant déduction des frais",
    ),
    siGrossCum: l("Return since inception, gross of fees", "Rendement depuis la création, avant déduction des frais"),
    vehicle: l("Vehicle", "Véhicule"),
    vehicleAccounts: l("Separately managed accounts", "Comptes gérés distincts"),
    basis: l("Returns", "Rendements"),
    grossBasis: l("Gross of fees", "Avant déduction des frais"),
    netBasis: l("Net of fees", "Après déduction des frais"),
  },
  badges: {
    title: l("Returns", "Rendements"),
    annualized: l("Periods over one year are annualized.", "Les périodes de plus d’un an sont annualisées."),
  },
  tabs: {
    label: l("Fund information", "Information sur le fonds"),
    labelStrategy: l("Strategy information", "Information sur la stratégie"),
    overview: l("Overview", "Aperçu"),
    performance: l("Performance", "Rendement"),
    portfolio: l("Portfolio", "Portefeuille"),
    distributions: l("Distributions", "Distributions"),
    awards: l("Awards and rankings", "Prix et classements"),
    documents: l("Documents", "Documents"),
  },
  classes: {
    prospectus: l("Prospectus class", "Série à prospectus"),
    om: l("Offering memorandum class", "Série à notice d’offre"),
    prospectusNote: l(
      "This series is offered under the simplified prospectus.",
      "Cette série est offerte aux termes du prospectus simplifié.",
    ),
    omNote: l(
      "This series is offered by offering memorandum, to eligible investors only.",
      "Cette série est offerte par notice d’offre, aux investisseurs admissibles seulement.",
    ),
    type: l("Offered under", "Offerte aux termes"),
    since: l(
      "Since series inception ({date}): only the periods this series has completed are shown.",
      "Depuis la création de la série ({date})\u00a0: seules les périodes complétées par la série sont présentées.",
    ),
    siShort: l("Since series inception", "Depuis la création de la série"),
    inception: l("Series inception", "Création de la série"),
    launch: l("Series launch", "Lancement de la série"),
    siTrack: l("Since track-record start ({month})", "Depuis le début de l’historique ({month})"),
    riskFrom: l("From {month}", "Depuis {month}"),
    partialMonth: l(
      "Partial month: from the series inception on {date}",
      "Mois partiel : depuis la création de la série, le {date}",
    ),
    growthFromInception: l("Starts at the series inception, {date}.", "Débute à la création de la série, le {date}."),
    growthFrom: l("Starts on {date}.", "Débute le {date}."),
    rangeFrom: l("From {date}", "Depuis le {date}"),
    partialFirst: l(
      "The first month runs from the series inception on {date}.",
      "Le premier mois court à partir de la création de la série, le {date}.",
    ),
  },
  variants: {
    label: l("Target downside volatility", "Volatilité à la baisse cible"),
    shown: l("Variant", "Variante"),
    note: l("Figures follow the variant selected.", "Les chiffres suivent la variante sélectionnée."),
  },
  awards: {
    intro: l(
      "Independent rankings and ratings of the series listed, as at the date given.",
      "Classements et cotes indépendants des séries indiquées, à la date indiquée.",
    ),
    category: l("Category", "Catégorie"),
    asAt: l("As at", "Au"),
    period: l("Period", "Période"),
    rank: l("Rank in category", "Rang dans la catégorie"),
    quartile: l("Quartile", "Quartile"),
    of: l("of", "sur"),
    quartileTop: l("top quartile", "premier quartile"),
    fundGrade: l("FundGrade", "FundGrade"),
    fundGradeLabel: l("FundGrade rating", "Cote FundGrade"),
    morningstar: l("Morningstar rating", "Cote Morningstar"),
    stars: l("{n} out of 5 stars", "{n} étoiles sur 5"),
    source: l("Source", "Source"),
    series: l("Series", "Série"),
    table: l("Category rank and quartile by period", "Rang et quartile dans la catégorie, par période"),
    note: l(
      "Rankings and ratings are provided by third parties, reproduced as at the date shown and not updated daily. Category rankings compare returns with those of the other funds in the same category over each period; the number of funds ranked varies by period. Past performance does not predict future results, and rankings and ratings are not guarantees. See the source for the methodology.",
      "Les classements et les cotes sont fournis par des tiers, reproduits à la date indiquée et non mis à jour quotidiennement. Les classements comparent les rendements à ceux des autres fonds de la même catégorie pour chaque période; le nombre de fonds classés varie selon la période. Les rendements passés ne prédisent pas les résultats futurs, et les classements et les cotes ne sont pas des garanties. Consultez la source pour la méthodologie.",
    ),
  },
  overview: {
    objective: l("Investment objective", "Objectif de placement"),
    whatFund: l("What the fund does", "Ce que fait le fonds"),
    whatStrategy: l("What the strategy does", "Ce que fait la stratégie"),
    approach: l("Investment approach", "Approche de placement"),
    facts: l("Key facts", "Caractéristiques du fonds"),
    strategyFacts: l("Key facts", "Caractéristiques de la stratégie"),
    fees: l("Fees and expenses", "Frais et charges"),
    feesNone: l(
      "Fees and expenses are set out in the fund facts and the simplified prospectus.",
      "Les frais et charges sont présentés dans l’aperçu du fonds et le prospectus simplifié.",
    ),
    feesNoneStrategy: l(
      "Fees are set out in each client’s investment management agreement.",
      "Les frais sont précisés dans la convention de gestion de chaque client.",
    ),
    returns: l("Returns", "Rendements"),
    returnsMore: l("See all performance", "Voir tous les rendements"),
    series: l("Series and Fundserv codes", "Séries et codes Fundserv"),
    team: l("Investment team", "Équipe de placement"),
    teamGeneric: l(
      "The fund is managed by the Nymbus Capital investment team.",
      "Le fonds est géré par l’équipe de placement de Nymbus Capital.",
    ),
    teamGenericStrategy: l(
      "The strategy is managed by the Nymbus Capital investment team.",
      "La stratégie est gérée par l’équipe de placement de Nymbus Capital.",
    ),
    teamLink: l("Meet the team", "Découvrir l’équipe"),
    manager: l("Portfolio manager", "Gestionnaire de portefeuille"),
  },
  facts: {
    legalName: l("Legal name", "Dénomination"),
    strategyName: l("Strategy", "Stratégie"),
    vehicle: l("Vehicle", "Véhicule"),
    assetClass: l("Asset class", "Classe d’actifs"),
    benchmark: l("Benchmark", "Indice de référence"),
    fundLaunch: l("Fund launch", "Lancement du fonds"),
    trackRecord: l("Track record since", "Historique depuis"),
    currency: l("Currency", "Devise"),
    series: l("Series", "Séries"),
    risk: l("Risk rating", "Niveau de risque"),
    distributions: l("Distributions", "Distributions"),
    minInvestment: l("Minimum investment", "Placement minimal"),
    minSubsequent: l("Minimum subsequent investment", "Placement subséquent minimal"),
    rsp: l("Registered plans (RSP) eligible", "Admissible aux régimes enregistrés (REER)"),
    yes: l("Yes", "Oui"),
    no: l("No", "Non"),
    liquidity: l("Liquidity", "Liquidité"),
    cifsc: l("CIFSC category", "Catégorie CIFSC"),
    managers: l("Portfolio managers", "Gestionnaires de portefeuille"),
    managementFee: l("Management fee", "Frais de gestion"),
    performanceFee: l("Performance fee", "Frais liés au rendement"),
    mer: l("Management expense ratio (MER)", "Ratio des frais de gestion (RFG)"),
    aum: l("Fund assets", "Actif du fonds"),
    basis: l("Returns shown", "Rendements présentés"),
    fundserv: l("Fundserv", "Fundserv"),
    nav: l("NAV per unit", "VL par part"),
    change: l("Daily change", "Variation quotidienne"),
    date: l("Valuation date", "Date d’évaluation"),
    headline: l("Series shown in the header", "Série présentée en en-tête"),
  },
  perf: {
    classShown: l("Performance shown", "Rendements présentés"),
    asOf: l("as of", "au"),
    growth: l("Growth of $10,000", "Croissance de 10 000 $"),
    growthLead: l(
      "A hypothetical $10,000 investment, net of fees, distributions reinvested.",
      "Un placement hypothétique de 10 000 $, après déduction des frais, distributions réinvesties.",
    ),
    growthLeadGross: l(
      "A hypothetical $10,000 invested in the strategy. Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative.",
      "Un placement hypothétique de 10 000 $ dans la stratégie. Les rendements sont arithmétiques (sommes simples des rendements mensuels sur l’exposition notionnelle, non composés) et avant déduction des frais; le graphique de croissance est illustratif.",
    ),
    range: l("Period", "Période"),
    ranges: {
      "1Y": l("1Y", "1 an"),
      "3Y": l("3Y", "3 ans"),
      "5Y": l("5Y", "5 ans"),
      SI: l("Since inception", "Depuis la création"),
    },
    rebased: l("Rebased to $10,000 at the start of the period.", "Ramené à 10 000 $ au début de la période."),
    keys: l("Use the arrow keys to move through the months.", "Utilisez les flèches pour parcourir les mois."),
    trailing: l("Annualized and trailing returns", "Rendements annualisés et sur périodes mobiles"),
    calendar: l("Calendar-year returns", "Rendements par année civile"),
    monthly: l("Monthly returns", "Rendements mensuels"),
    monthlyLead: l(
      "Every month since the start of the track record; the last column is the calendar-year return.",
      "Chaque mois depuis le début de l’historique; la dernière colonne est le rendement de l’année civile.",
    ),
    risk: l("Risk statistics", "Statistiques de risque"),
    riskLead: l("Annualized, from monthly returns.", "Annualisées, à partir des rendements mensuels."),
    notes: l("Performance notes", "Notes sur les rendements"),
    table: l("Show the data table", "Afficher le tableau de données"),
    ytd: l("YTD", "DDA"),
    partial: l("partial year", "année partielle"),
    year: l("Year", "Année"),
    period: l("Period", "Période"),
    fund: l("Fund", "Fonds"),
    strategy: l("Strategy", "Stratégie"),
    index: l("Benchmark", "Indice de référence"),
    /** basis of the fund / strategy figures, in the series names of every chart, table and tooltip of the tab */
    netShort: l("net of fees", "après déduction des frais"),
    grossShort: l("gross of fees", "avant déduction des frais"),
    va: l("Value added", "Valeur ajoutée"),
    negative: l("Negative", "Négatif"),
    positive: l("Positive", "Positif"),
    periods: {
      "1M": l("1M", "1 m"),
      "3M": l("3M", "3 m"),
      YTD: l("YTD", "DDA"),
      "1Y": l("1Y", "1 an"),
      "2Y": l("2Y", "2 ans"),
      "3Y": l("3Y", "3 ans"),
      "5Y": l("5Y", "5 ans"),
      "10Y": l("10Y", "10 ans"),
      SI: l("SI", "DC"),
    } as Record<Period, L>,
    periodsLong: {
      "1M": l("1 month", "1 mois"),
      "3M": l("3 months", "3 mois"),
      YTD: l("Year to date", "Depuis le début de l’année"),
      "1Y": l("1 year", "1 an"),
      "2Y": l("2 years", "2 ans"),
      "3Y": l("3 years", "3 ans"),
      "5Y": l("5 years", "5 ans"),
      "10Y": l("10 years", "10 ans"),
      SI: l("Since inception", "Depuis la création"),
    } as Record<Period, L>,
    windows: { SI: l("Since inception", "Depuis la création"), "3Y": l("Last 3 years", "3 dernières années") },
    annReturn: l("Annualized return", "Rendement annualisé"),
    annVol: l("Volatility", "Volatilité"),
    downsideDev: l("Downside deviation", "Écart baissier"),
    sharpe: l("Sharpe ratio", "Ratio de Sharpe"),
    sortino: l("Sortino ratio", "Ratio de Sortino"),
    maxDrawdown: l("Maximum drawdown", "Recul maximal"),
    positiveMonths: l("Positive months", "Mois positifs"),
    bestMonth: l("Best month", "Meilleur mois"),
    worstMonth: l("Worst month", "Pire mois"),
  },
  portfolio: {
    asOf: l("As of", "Au"),
    characteristics: l("Portfolio characteristics", "Caractéristiques du portefeuille"),
    index: l("Index", "Indice"),
    fund: l("Fund", "Fonds"),
    strategy: l("Strategy", "Stratégie"),
    breakdowns: {
      credit: l("Credit quality", "Qualité du crédit"),
      sectors: l("Sectors", "Secteurs"),
      curve: l("Term to maturity", "Échéance"),
      country: l("Geography", "Répartition géographique"),
      assetClass: l("Asset class allocation", "Répartition par classe d’actifs"),
    },
    holdings: l("Top 10 holdings", "10 principaux titres"),
    holding: l("Holding", "Titre"),
    topTotal: l("Top 10 total", "Total des 10 principaux titres"),
    weight: l("Weight", "Poids"),
    esg: l("Sustainability metrics", "Indicateurs de durabilité"),
    esgLead: l("The portfolio compared with its index.", "Le portefeuille comparé à son indice."),
    metric: l("Metric", "Indicateur"),
    /* daily portfolio (data platform book) */
    metrics: {
      duration: l("Modified duration", "Durée modifiée"),
      ytm: l("Yield to maturity", "Rendement à l’échéance"),
      coupon: l("Average coupon", "Coupon moyen"),
      maturity: l("Average term to maturity", "Échéance moyenne"),
      rating: l("Average credit rating", "Cote de crédit moyenne"),
    },
    years: l("years", "ans"),
    bondHoldingsOnly: l(
      "bond holdings only, excluding futures",
      "obligations détenues seulement, hors contrats à terme",
    ),
    securities: l("Securities held", "Titres détenus"),
    coverage: l(
      "Computed only over the bonds for which the input is available (share of the bond holdings, by market value): {x}.",
      "Calculé seulement sur les obligations pour lesquelles la donnée est disponible (part des obligations détenues, en valeur de marché)\u00a0: {x}.",
    ),
    weightsNote: l(
      "Weights as a percentage of net assets, cash included. Futures used for the protective overlay are excluded.",
      "Pondérations en pourcentage de l’actif net, liquidités comprises. Les contrats à terme de la superposition protectrice sont exclus.",
    ),
    dailyBreakdowns: {
      assetType: l("Asset types", "Types d’actifs"),
      sector: l("Sectors", "Secteurs"),
      rating: l("Credit quality", "Qualité du crédit"),
      term: l("Term to maturity", "Échéance"),
      country: l("Geography", "Répartition géographique"),
    },
    col: {
      coupon: l("Coupon", "Coupon"),
      maturity: l("Maturity", "Échéance"),
      rating: l("Rating", "Cote"),
      sector: l("Sector", "Secteur"),
    },
    green: l("Green bond", "Obligation verte"),
    greenTitle: l("Green bonds", "Obligations vertes"),
    greenLead: l(
      "Share of the portfolio invested in green bonds, whose proceeds finance projects with environmental benefits.",
      "Part du portefeuille investie dans des obligations vertes, dont le produit finance des projets aux retombées environnementales.",
    ),
    greenOf: l("of the portfolio", "du portefeuille"),
  },
  dist: {
    title: l("Distributions", "Distributions"),
    policy: l("Distribution policy", "Politique de distribution"),
    none: l(
      "Distribution details are set out in the fund’s offering documents. Contact us for the latest distribution information.",
      "Les modalités de distribution sont présentées dans les documents de placement du fonds. Communiquez avec nous pour obtenir les plus récents renseignements sur les distributions.",
    ),
    noneStrategy: l(
      "The strategy is offered through managed accounts: it does not make distributions of its own. Income and gains are credited to each client account.",
      "La stratégie est offerte au moyen de comptes gérés : elle ne verse pas de distributions. Les revenus et les gains sont portés au crédit de chaque compte client.",
    ),
    reinvest: l(
      "Returns shown on this page assume that all distributions are reinvested.",
      "Les rendements présentés sur cette page supposent le réinvestissement de toutes les distributions.",
    ),
    ask: l("Ask about distributions", "Se renseigner sur les distributions"),
    /* per-series distributions (data platform) */
    recent: l("Recent distributions", "Distributions récentes"),
    recentLead: l("Per unit, in the currency of each series.", "Par part, dans la devise de chaque série."),
    asOf: l("Data as of", "Données au"),
    series: l("Series", "Série"),
    last: l("Last distribution", "Dernière distribution"),
    amount: l("Amount per unit", "Montant par part"),
    t12m: l("Trailing 12 months", "12 derniers mois"),
    t12mLong: l("Total per unit over the trailing 12 months", "Total par part des 12 derniers mois"),
    /* the window ends at the day the data were read, not at the last distribution ("Data as of") */
    t12mTo: l("12 months to {date}", "12 mois au {date}"),
    t12mToLong: l(
      "Total per unit of the distributions paid in the 12 months to {date}",
      "Total par part des distributions versées au cours des 12 mois terminés le {date}",
    ),
    frequency: l("Frequency", "Fréquence"),
    frequencies: {
      monthly: l("Monthly", "Mensuelle"),
      quarterly: l("Quarterly", "Trimestrielle"),
      "semi-annual": l("Semi-annual", "Semestrielle"),
      annual: l("Annual", "Annuelle"),
      irregular: l("Irregular", "Irrégulière"),
    },
    none2: l("No distribution recorded", "Aucune distribution enregistrée"),
    history: l("Distribution history", "Historique des distributions"),
    chart: l("Distributions per unit", "Distributions par part"),
    lastN: l("last {n}", "{n} dernières"),
    calendar: l("Calendar-year totals", "Totaux par année civile"),
    year: l("Year", "Année"),
    total: l("Total per unit", "Total par part"),
    count: l("Distributions", "Distributions"),
    date: l("Date", "Date"),
    all: l("All distributions", "Toutes les distributions"),
    showAll: l("Show all ({n})", "Tout afficher ({n})"),
    showLess: l("Show the last 12", "Afficher les 12 dernières"),
    note: l(
      "Amounts are per unit, in the currency of each series, by valuation date. Past distributions do not guarantee future distributions: amounts and frequency may change. The tax character of distributions (income, capital gains or return of capital) is not shown here; it is reported on the annual tax slips.",
      "Les montants sont par part, dans la devise de chaque série, par date d’évaluation. Les distributions passées ne garantissent pas les distributions futures\u00a0: les montants et la fréquence peuvent changer. La nature fiscale des distributions (revenu, gains en capital ou remboursement de capital) n’est pas présentée ici; elle figure sur les feuillets fiscaux annuels.",
    ),
  },
  docs: {
    title: l("Fund documents", "Documents du fonds"),
    firm: l("Nymbus Capital", "Nymbus Capital"),
    download: l("Download", "Télécharger"),
    onRequest: l("Available on request", "Disponible sur demande"),
    request: l("Request", "Demander"),
    regulatoryLead: l(
      "The regulatory documents of the fund are available on request. Please read them before investing.",
      "Les documents réglementaires du fonds sont disponibles sur demande. Veuillez les lire avant d’investir.",
    ),
    strategyNote: l(
      "Documents are provided directly to mandate holders. Please contact us for details.",
      "Les documents sont remis directement aux titulaires de mandat. Communiquez avec nous pour en savoir plus.",
    ),
    types: {
      factsheet: l("Factsheets", "Fiches mensuelles"),
      "fund-facts": l("Fund facts", "Aperçus du fonds"),
      prospectus: l("Simplified prospectus", "Prospectus simplifié"),
      "annual-report": l("Annual financial statements", "États financiers annuels"),
      "interim-report": l("Interim financial statements", "États financiers intermédiaires"),
      mrfp: l("Management reports of fund performance", "Rapports de la direction sur le rendement du fonds"),
      "proxy-voting": l("Proxy voting", "Vote par procuration"),
      "tax-factors": l("Tax factors", "Facteurs fiscaux"),
      commentary: l("Commentaries", "Commentaires"),
      presentation: l("Presentations", "Présentations"),
      esg: l("Sustainability", "Durabilité"),
      other: l("Other documents", "Autres documents"),
    } as Record<DocType, L>,
    single: {
      factsheet: l("Factsheet", "Fiche mensuelle"),
      "fund-facts": l("Fund facts", "Aperçu du fonds"),
      prospectus: l("Simplified prospectus", "Prospectus simplifié"),
      "annual-report": l("Annual financial statements", "États financiers annuels"),
      "interim-report": l("Interim financial statements", "États financiers intermédiaires"),
      mrfp: l("Management report of fund performance", "Rapport de la direction sur le rendement du fonds"),
      "proxy-voting": l("Proxy voting", "Vote par procuration"),
      "tax-factors": l("Tax factors", "Facteurs fiscaux"),
      commentary: l("Commentary", "Commentaire"),
      presentation: l("Presentation", "Présentation"),
      esg: l("Sustainability report", "Rapport de durabilité"),
      other: l("Document", "Document"),
    } as Record<DocType, L>,
    regulatoryText: {
      "fund-facts": l(
        "A short summary of the fund: its investments, risk, past performance and costs.",
        "Un résumé du fonds : placements, risque, rendement passé et coûts.",
      ),
      prospectus: l(
        "The offering document that describes the fund, its risks and investors’ rights.",
        "Le document de placement qui décrit le fonds, ses risques et les droits des investisseurs.",
      ),
      "annual-report": l(
        "Audited financial statements for the fiscal year.",
        "États financiers audités de l’exercice.",
      ),
      "interim-report": l(
        "Unaudited financial statements for the first six months of the fiscal year.",
        "États financiers non audités des six premiers mois de l’exercice.",
      ),
      mrfp: l(
        "Management’s discussion of the fund’s results, annual and interim.",
        "L’analyse par la direction des résultats du fonds, annuelle et intermédiaire.",
      ),
    } as Partial<Record<DocType, L>>,
  },
  disclosure: {
    eyebrow: l("Important information", "Renseignements importants"),
    title: l("Disclosures", "Mentions importantes"),
    // regulatory texts: src/content/disclaimers.ts (compliance review)
    net: DISC.returnsNet,
    standard: DISC.fundStandard,
    index: DISC.benchmark,
    ftse: DISC.ftse,
    general: DISC.firm,
    provenance: DISC.provenance,
    provenanceFactsheet: DISC.provenanceFactsheet,
    provenanceDaily: DISC.provenanceDaily,
    provenanceEsgFactsheet: DISC.provenanceEsgFactsheet,
    gross: DISC.gmvGross,
    sample: DISC.sample,
    basisNet: DISC.basisNet,
    basisGross: DISC.basisGross,
    perfAsOf: l("performance as of", "rendements au"),
    navAsOf: l("net asset values as of", "valeurs liquidatives au"),
    aumAsOf: l("fund assets as of", "actif du fonds au"),
  },
  /** regulatory labels under their historical keys (tests/unit/admin/disclaimers.test.ts checks they come from the module) */
  hero: { grossNote: DISC.gmvGross, basisNet: DISC.basisNet, basisGross: DISC.basisGross },
  cta: {
    title: l("Interested in the fund?", "Le fonds vous intéresse?"),
    titleStrategy: l("Interested in the strategy?", "La stratégie vous intéresse?"),
    text: l(
      "Our team can walk you through the fund, its series and how to invest.",
      "Notre équipe peut vous présenter le fonds, ses séries et la façon d’investir.",
    ),
    textStrategy: l(
      "Our team can explain how the protective overlay works and how it could fit your portfolio.",
      "Notre équipe peut vous expliquer le fonctionnement de la stratégie et sa place dans votre portefeuille.",
    ),
    contact: l("Contact our team", "Communiquer avec notre équipe"),
    all: l("All strategies", "Toutes les stratégies"),
  },
  others: {
    eyebrow: l("Explore", "Explorer"),
    title: l("Other strategies", "Autres stratégies"),
    view: l("View", "Voir"),
  },
  misc: {
    dash: "—",
    learnMore: l("Learn more", "En savoir plus"),
  },
} as const;

/* ------------------------------------------------------------------ per-fund texts (descriptive, no figures) */

interface FundTexts {
  /** shown under "What the fund does" when the admin has not entered the official investment objective */
  summary: L;
  /** investment approach as short bullets */
  focus: L[];
  /** risk disclosure shown under the approach bullets (regulatory wording, kept verbatim) */
  note?: L;
  feature: {
    eyebrow: L;
    title: L;
    lead: L;
    cards: { icon: FeatureIcon; title: L; text: L; needs?: "esg" | "portfolio" }[];
    link?: { href: string; label: L };
  };
}

export type FeatureIcon =
  | "calendar"
  | "timer"
  | "scan"
  | "shield"
  | "leaf"
  | "filter"
  | "gauge"
  | "sprout"
  | "layers"
  | "trend"
  | "repeat"
  | "umbrella"
  | "stack"
  | "waves";

/* risk disclosures of the futures overlay (compliance-reviewed wording, verbatim) */
const LOW_CORR = l(
  "designed to have low correlation with bonds in down months and to offset part of bond losses when volatility rises; it may not do so and can lose money.",
  "conçue pour avoir une faible corrélation avec les obligations lors des mois de baisse et pour compenser une partie des pertes obligataires lorsque la volatilité augmente; elle peut ne pas y parvenir et peut subir des pertes.",
);
const OVERLAY_EXPOSURE = l(
  "The overlay adds futures exposure on top of the underlying portfolio; its losses add to those of the underlying portfolio and may require additional margin.",
  "La superposition ajoute une exposition additionnelle au moyen de contrats à terme; ses pertes s’ajoutent à celles du portefeuille sous-jacent et peuvent exiger des dépôts de garantie supplémentaires.",
);
const DIST = l(
  "Distributions are not guaranteed, may change and may include a return of capital.",
  "Les distributions ne sont pas garanties, peuvent changer et peuvent comprendre un remboursement de capital.",
);
/** Sentences joined with a space, in each language. */
const join = (...xs: L[]): L => ({ en: xs.map((x) => x.en).join(" "), fr: xs.map((x) => x.fr).join(" ") });

export const FUND_TEXTS: Record<FundKey, FundTexts> = {
  "monthly-income": {
    summary: join(
      l(
        "Monthly income from short-term Canadian corporate bonds, with low rate sensitivity.",
        "Un revenu mensuel tiré d’obligations de sociétés canadiennes à court terme, peu sensible aux taux.",
      ),
      DIST,
    ),
    focus: [
      l("Mainly short-term Canadian corporate bonds", "Surtout des obligations de sociétés canadiennes à court terme"),
      l("Selected by our two-system process", "Sélectionnées par notre processus à deux systèmes"),
      l(
        "Credit risk and relative value, bond by bond",
        "Risque de crédit et valeur relative, obligation par obligation",
      ),
    ],
    note: join(l("The protective overlay is", "La superposition protectrice est"), LOW_CORR, OVERLAY_EXPOSURE),
    feature: {
      eyebrow: l("Monthly Income Fund", "Fonds Revenu Mensuel"),
      title: l("Built for monthly income", "Conçu pour un revenu mensuel"),
      lead: l("What shapes the fund.", "Ce qui définit le fonds."),
      cards: [
        {
          icon: "calendar",
          title: l("Monthly distributions", "Distributions mensuelles"),
          text: join(l("Designed to pay every month.", "Conçu pour verser une distribution chaque mois."), DIST),
        },
        {
          icon: "timer",
          title: l("Short maturities", "Échéances courtes"),
          text: l(
            "Low rate sensitivity. Current duration: Portfolio tab.",
            "Faible sensibilité aux taux. Durée actuelle : onglet Portefeuille.",
          ),
        },
        {
          icon: "scan",
          title: l("Systematic credit selection", "Sélection systématique du crédit"),
          text: l(
            "Credit risk weighed against yield, issuer by issuer.",
            "Risque de crédit contre rendement, émetteur par émetteur.",
          ),
        },
        {
          icon: "shield",
          title: l("Protective overlay", "Superposition protectrice"),
          text: join(l("A protective overlay", "Une superposition protectrice"), LOW_CORR, OVERLAY_EXPOSURE),
        },
      ],
    },
  },
  "sustainable-enhanced-bonds": {
    summary: l(
      "Core Canadian bonds, managed systematically, with sustainability criteria.",
      "Des obligations canadiennes de base, gérées de façon systématique, avec des critères de durabilité.",
    ),
    focus: [
      l("Federal, provincial and corporate issuers", "Émetteurs fédéraux, provinciaux et de sociétés"),
      l("Built with our quantitative models", "Construit à l’aide de nos modèles quantitatifs"),
      l(
        "ESG data weighed with credit quality and valuation",
        "Données ESG prises en compte avec la qualité du crédit et l’évaluation",
      ),
    ],
    note: join(l("The protective overlay is", "La superposition protectrice est"), LOW_CORR, OVERLAY_EXPOSURE),
    feature: {
      eyebrow: l("Sustainable Enhanced Bonds Fund", "Fonds Obligations Durables Bonifiées"),
      title: l("Sustainability, integrated", "La durabilité, intégrée"),
      lead: l(
        "Criteria at every step of bond selection. They do not apply to the futures overlay, which holds no securities of individual issuers.",
        "Des critères à chaque étape de la sélection des obligations. Ils ne visent pas la stratégie de superposition, qui ne détient aucun titre d’émetteurs individuels.",
      ),
      cards: [
        {
          icon: "filter",
          title: l("Exclusion screens", "Filtres d’exclusion"),
          text: l(
            "Issuers in conflict with the fund’s criteria are excluded.",
            "Les émetteurs contraires aux critères du fonds sont exclus.",
          ),
        },
        {
          icon: "leaf",
          title: l("ESG in issuer selection", "ESG dans la sélection des émetteurs"),
          text: l(
            "ESG data weighed with credit and valuation, issuer by issuer.",
            "Données ESG prises en compte avec le crédit et l’évaluation, émetteur par émetteur.",
          ),
        },
        {
          icon: "sprout",
          title: l("Green bonds", "Obligations vertes"),
          text: l(
            "The fund can hold bonds financing environmental projects.",
            "Le fonds peut détenir des obligations qui financent des projets environnementaux.",
          ),
        },
        {
          icon: "gauge",
          title: l("Measured every month", "Mesurée chaque mois"),
          text: l(
            "Metrics such as carbon intensity, monthly, for the portfolio and its index.",
            "Des indicateurs comme l’intensité carbone, chaque mois, pour le portefeuille et son indice.",
          ),
          needs: "esg",
        },
      ],
      link: { href: "/sustainability", label: l("Our sustainability approach", "Notre approche de durabilité") },
    },
  },
  "multi-strategy": {
    summary: l(
      "A liquid alternative fund of systematic strategies, designed to behave differently from stocks and bonds.",
      "Un fonds alternatif liquide de stratégies systématiques, conçues pour se comporter différemment des actions et des obligations.",
    ),
    focus: [
      l(
        "Low-volatility, directional, mean-reversion and hedging strategies",
        "Stratégies à faible volatilité, directionnelles, de retour à la moyenne et de couverture",
      ),
      l(
        "Each with its own rules, designed for a distinct role",
        "Chacune avec ses propres règles, conçue pour un rôle distinct",
      ),
      l("Allocations managed systematically", "Répartition gérée de façon systématique"),
    ],
    feature: {
      eyebrow: l("Multi-Strategy Fund", "Fonds Multistratégies"),
      title: l("Four complementary strategies", "Quatre stratégies complémentaires"),
      lead: l(
        "Alternative Multi-Strategy category: distinct roles, diversified sources of return.",
        "Catégorie Multistratégies alternatives : des rôles distincts, des sources de rendement diversifiées.",
      ),
      cards: [
        {
          icon: "waves",
          title: l("Low volatility", "Faible volatilité"),
          text: l("Seeks returns with lower volatility.", "Vise des rendements assortis d’une volatilité plus faible."),
        },
        {
          icon: "trend",
          title: l("Directional", "Directionnelle"),
          text: l(
            "Follows persistent trends, up or down.",
            "Suit les tendances persistantes, à la hausse comme à la baisse.",
          ),
        },
        {
          icon: "repeat",
          title: l("Mean reversion", "Retour à la moyenne"),
          text: l(
            "Positions for prices returning to usual levels.",
            "Se positionne pour un retour des prix vers leurs niveaux habituels.",
          ),
        },
        {
          icon: "umbrella",
          title: l("Hedging", "Couverture"),
          text: l(
            "Designed to gain in market stress and offset part of the other strategies’ losses; it may not do so.",
            "Conçue pour profiter des tensions de marché et compenser une partie des pertes des autres stratégies; elle peut ne pas y parvenir.",
          ),
        },
      ],
    },
  },
  "global-minimum-volatility": {
    summary: l(
      "A protective overlay of managed futures for family offices and institutions, offered through separately managed accounts. It is designed to add a source of return with low correlation with bonds in down months and to offset part of bond losses when volatility rises; it may not do so and can lose money.",
      "Une superposition protectrice de contrats à terme gérés pour les bureaux de gestion familiale et les institutions, offerte en comptes gérés distincts. Elle est conçue pour ajouter une source de rendement faiblement corrélée aux obligations lors des mois de baisse et pour compenser une partie des pertes obligataires lorsque la volatilité augmente; elle peut ne pas y parvenir et peut subir des pertes.",
    ),
    focus: [
      l("Added on top of an existing portfolio", "Ajoutée par-dessus un portefeuille existant"),
      l(
        "Most of the capital stays invested in the underlying portfolio",
        "La majeure partie du capital demeure investie dans le portefeuille sous-jacent",
      ),
      l(
        "Liquid futures, sized to each client’s downside volatility target",
        "Des contrats à terme liquides, calibrés selon la cible de volatilité à la baisse de chaque client",
      ),
    ],
    note: OVERLAY_EXPOSURE,
    feature: {
      eyebrow: l("Global Minimum Volatility", "Global Minimum Volatility"),
      title: l("How the protective overlay works", "Le fonctionnement de la superposition protectrice"),
      lead: l(
        "Futures on top of the portfolio you already own.",
        "Des contrats à terme ajoutés au portefeuille que vous détenez déjà.",
      ),
      cards: [
        {
          icon: "stack",
          title: l("Stacked on your portfolio", "Ajoutée à votre portefeuille"),
          text: l("Most capital stays in your portfolio.", "L’essentiel du capital reste dans votre portefeuille."),
        },
        {
          icon: "layers",
          title: l("Liquid futures", "Contrats à terme liquides"),
          text: join(
            l(
              "Exchange-traded futures, which require a margin deposit.",
              "Des contrats à terme cotés, qui exigent un dépôt de garantie.",
            ),
            OVERLAY_EXPOSURE,
          ),
        },
        {
          icon: "gauge",
          title: l("A volatility target", "Une cible de volatilité"),
          text: l(
            "Sized to the downside volatility agreed with the client.",
            "Calibrée selon la volatilité à la baisse convenue avec le client.",
          ),
        },
        {
          icon: "shield",
          title: l("Designed for low correlation", "Conçue pour une faible corrélation"),
          text: join(l("The overlay is", "La stratégie est"), LOW_CORR),
        },
      ],
    },
  },
};
