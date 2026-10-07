/**
 * Copy of the third-party ratings and rankings (Morningstar block, RBC / eVestment / LSEG Lipper / GMR entries; the
 * /solutions advisor list was removed on 2026-10-04). EN / FR; placeholders in braces. Morningstar's attribution follows the wording Morningstar
 * usually requires next to a rating — to be verified (docs/compliance-review.md § Awards v2).
 */
const l = (en: string, fr: string) => ({ en, fr });

export const RK = {
  ms: {
    title: l("Morningstar Rating™", "Cote Morningstar™"),
    /** text rating, always present (the only rendering when the official images are missing) */
    rating: l("Morningstar Rating™: {n} stars", "Cote Morningstar™ : {n} étoiles"),
    ratingOne: l("Morningstar Rating™: 1 star", "Cote Morningstar™ : 1 étoile"),
    overall: l("Overall rating", "Cote globale"),
    series: l("Series {x}", "Série {x}"),
    outOf: l("out of {n} funds", "sur {n} fonds"),
    category: l("{c} category", "catégorie {c}"),
    asOf: l("as of {date}", "au {date}"),
    source: l("Source: Morningstar", "Source : Morningstar"),
    /** visible label of the info note holding the methodology and attribution */
    info: l("Rating methodology and attribution", "Méthodologie de la cote et attribution"),
    attribution: l(
      "© {year} Morningstar Research Inc. All rights reserved. The information contained herein: (1) is proprietary to Morningstar and/or its content providers; (2) may not be copied or distributed; and (3) is not warranted to be accurate, complete or timely. Neither Morningstar nor its content providers are responsible for any damages or losses arising from any use of this information.",
      "© {year} Morningstar Research Inc. Tous droits réservés. Les renseignements contenus aux présentes : 1) appartiennent à Morningstar ou à ses fournisseurs de contenu; 2) ne peuvent être reproduits ni distribués; 3) ne sont assortis d’aucune garantie quant à leur exactitude, leur exhaustivité ou leur actualité. Ni Morningstar ni ses fournisseurs de contenu ne sont responsables des dommages ou des pertes découlant de l’utilisation de ces renseignements.",
    ),
    methodology: l(
      "The Morningstar Rating™ reflects performance as of {date} and changes monthly. It is an objective, quantitative measure of a fund’s historical risk-adjusted performance relative to the other funds in its category, calculated from its 3-, 5- and 10-year returns (as available); only funds with at least a three-year track record are rated. The top 10% of a category receive 5 stars, the next 22.5% 4 stars, the middle 35% 3 stars, the next 22.5% 2 stars and the bottom 10% 1 star. The rating is for the series shown only; other series may have different ratings. Past performance does not predict future results.",
      "La cote Morningstar™ reflète le rendement au {date} et change chaque mois. Elle mesure de façon objective et quantitative le rendement historique ajusté au risque d’un fonds par rapport aux autres fonds de sa catégorie, à partir de ses rendements sur 3, 5 et 10 ans (selon les données disponibles); seuls les fonds ayant un historique d’au moins trois ans sont cotés. Les premiers 10 % d’une catégorie reçoivent 5 étoiles, les 22,5 % suivants 4 étoiles, les 35 % du milieu 3 étoiles, les 22,5 % suivants 2 étoiles et les derniers 10 % 1 étoile. La cote vise uniquement la série indiquée; les autres séries peuvent avoir une cote différente. Les rendements passés ne prédisent pas les résultats futurs.",
    ),
  },
  tp: {
    percentile: l("{ord} percentile", "{ord} centile"),
    rankOf: l("{rank} of {of}", "{rank} sur {of}"),
    period: l("Period", "Période"),
    standing: l("Standing in peer group", "Position dans le groupe de pairs"),
    table: l("Percentile rank by period", "Rang centile par période"),
    edition: l("Edition", "Édition"),
    category: l("Peer group", "Groupe de pairs"),
    periodEnd: l("Period ended", "Période terminée le"),
    fundLevel: l("Fund as a whole (not a specific series)", "Fonds dans son ensemble (aucune série en particulier)"),
    fundShort: l("Fund as a whole", "Fonds dans son ensemble"),
    strategyScope: l(
      "Strategy track record since {month} (includes periods before the fund’s launch)",
      "Historique de la stratégie depuis {month} (comprend des périodes antérieures au lancement du fonds)",
    ),
    strategyShort: l("Strategy track record since {month}", "Historique de la stratégie depuis {month}"),
    preLaunch: l(
      "These rankings use the strategy’s track record since {month}, which includes periods before the fund’s launch{launch}; the fund’s own returns may differ.",
      "Ces classements reposent sur l’historique de la stratégie depuis {month}, qui comprend des périodes antérieures au lancement du fonds{launch}; les rendements du fonds lui-même peuvent différer.",
    ),
    launchOn: l(" on {date}", " le {date}"),
    disclosures: l("See the disclosures", "Voir les informations importantes"),
    basis: l(
      "Survey basis: returns {b}; percentile rank 1 = best.",
      "Base du sondage\u00a0: rendements {b}; rang centile 1 = meilleur.",
    ),
    basisShort: l("returns {b}", "rendements {b}"),
    rolling: l("{n} years to {date}", "{n} ans au {date}"),
    note: l(
      "Percentile ranks compare the returns of the fund’s strategy or series (as stated on each ranking) with those of the other funds in the same peer group over each period (1st percentile = top 1%). They are reproduced from the source named, as at the date shown, on that source’s basis (the RBC Investor Services survey uses returns gross of management fees); peer groups and methodologies differ between providers. Past performance does not predict future results.",
      "Les rangs centiles comparent les rendements de la stratégie ou de la série du fonds (selon ce qu’indique chaque classement) à ceux des autres fonds du même groupe de pairs pour chaque période (1er\u00a0centile = premier 1\u00a0%). Ils sont reproduits de la source indiquée, à la date indiquée, sur la base de cette source (le sondage de RBC Services aux investisseurs utilise des rendements avant déduction des frais de gestion); les groupes de pairs et les méthodologies varient d’un fournisseur à l’autre. Les rendements passés ne prédisent pas les résultats futurs.",
    ),
  },
  newTab: l("opens in a new tab", "nouvel onglet"),
};
