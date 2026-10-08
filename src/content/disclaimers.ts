/**
 * ALL regulatory / disclaimer boilerplate of the public site, EN + FR, in one place so compliance edits one file.
 *
 * STATUS: DRAFT BOILERPLATE — MUST BE REVIEWED BY COMPLIANCE (see docs/compliance-review.md). Each text carries
 * `where` (the pages that show it) and `review` (what to verify). The admin dashboard shows a "compliance review
 * required" banner until an admin marks the current texts as reviewed; any change to this file or to the admin
 * overrides (firm disclaimer, per-fund performance notes) changes `disclaimersHash` and brings the banner back.
 *
 * Pure, dependency-free (unit tested; imported by server and client components).
 */

export type Text = { en: string; fr: string };

interface Disclaimer {
  id: string;
  label: string;
  text: Text;
  /** where it appears: [human description, link] */
  where: { label: string; href: string }[];
  /** what compliance must verify */
  review: string[];
}

/** Fund launch vs strategy track record (performance before the fund's launch is the strategy's). */
export const FUND_INCEPTION: Record<string, { fundLaunch: Text; strategySince: Text } | undefined> = {
  "monthly-income": {
    fundLaunch: { en: "October 5, 2021", fr: "5 octobre 2021" },
    strategySince: { en: "January 2019", fr: "janvier 2019" },
  },
};

const FIRM: Text = {
  en:
    "Nymbus Capital Inc. is registered as a portfolio manager and investment fund manager with the Autorité des marchés financiers (Québec). " +
    "The information on this website is provided for information purposes only; it is not investment, tax, legal or accounting advice and should not be relied upon as such. " +
    "It does not constitute an offer to sell or a solicitation of an offer to buy any security or investment fund in any jurisdiction where such an offer or solicitation is not authorized. " +
    "Units of the Nymbus funds are offered only by means of their offering documents (simplified prospectus and fund facts, or offering memorandum to eligible investors, as applicable) and only where they may lawfully be sold.",
  fr:
    "Nymbus Capital inc. est inscrite à titre de gestionnaire de portefeuille et de gestionnaire de fonds d’investissement auprès de l’Autorité des marchés financiers (Québec). " +
    "Les renseignements présentés sur ce site Web sont fournis à titre informatif seulement; ils ne constituent pas des conseils en placement, fiscaux, juridiques ou comptables et ne doivent pas être considérés comme tels. " +
    "Ils ne constituent ni une offre de vente ni une sollicitation d’achat de titres ou de parts de fonds d’investissement dans un territoire où une telle offre ou sollicitation n’est pas autorisée. " +
    "Les parts des fonds Nymbus ne sont offertes qu’au moyen de leurs documents de placement (prospectus simplifié et aperçu du fonds, ou notice d’offre aux investisseurs admissibles, selon le cas) et uniquement là où elles peuvent légalement être vendues.",
};

const FUND_STANDARD: Text = {
  en:
    "Commissions, trailing commissions, management fees and expenses all may be associated with mutual fund investments. " +
    "Please read the fund facts and the prospectus (or offering memorandum) before investing. " +
    "Mutual funds are not guaranteed, their values change frequently and past performance may not be repeated.",
  fr:
    "Un placement dans un organisme de placement collectif peut donner lieu à des courtages, des commissions de suivi, des frais de gestion et d’autres frais. " +
    "Veuillez lire l’aperçu du fonds et le prospectus (ou la notice d’offre) avant de faire un placement. " +
    "Les organismes de placement collectif ne sont pas garantis, leur valeur fluctue souvent et leur rendement passé n’est pas indicatif de leur rendement futur.",
};

const RETURNS_NET: Text = {
  en:
    "The indicated rates of return are the historical annual compounded total returns, net of fees, including changes in unit value and reinvestment of all distributions, " +
    "and do not take into account sales, redemption, distribution or optional charges or income taxes payable by any securityholder that would have reduced returns. " +
    "Returns are in Canadian dollars for the series shown; periods of less than one year are not annualized.",
  fr:
    "Les taux de rendement indiqués sont les rendements totaux annuels composés historiques, après déduction des frais, qui tiennent compte des fluctuations de la valeur des parts et du réinvestissement de toutes les distributions; " +
    "ils ne tiennent pas compte des frais d’acquisition, de rachat, de placement ou des frais optionnels ni de l’impôt sur le revenu payable par un porteur, qui auraient réduit le rendement. " +
    "Les rendements sont exprimés en dollars canadiens pour la série indiquée; les périodes de moins d’un an ne sont pas annualisées.",
};

const BENCHMARK: Text = {
  en:
    "The benchmark is a broad-based FTSE Canada bond index shown for comparison purposes only. Indices are unmanaged, bear no fees or expenses and cannot be invested in directly; " +
    "the composition and risk of a fund may differ materially from those of its benchmark.",
  fr:
    "L’indice de référence est un indice obligataire général FTSE Canada présenté à des fins de comparaison seulement. Les indices ne sont pas gérés, n’assument aucuns frais et on ne peut y investir directement; " +
    "la composition et le risque d’un fonds peuvent différer sensiblement de ceux de son indice de référence.",
};

const PRE_INCEPTION = (f: { fundLaunch: Text; strategySince: Text }): Text => ({
  en:
    `The Nymbus Monthly Income Fund was launched on ${f.fundLaunch.en}. Performance shown for periods before that date reflects the track record of the same investment strategy as managed by Nymbus Capital since ${f.strategySince.en}; ` +
    "it is not the performance of the fund, and the fund’s returns may have differed had it existed during that period.",
  fr:
    `Le Fonds Nymbus Revenu Mensuel a été lancé le ${f.fundLaunch.fr}. Les rendements présentés pour les périodes antérieures à cette date correspondent à ceux de la même stratégie de placement gérée par Nymbus Capital depuis ${f.strategySince.fr}; ` +
    "il ne s’agit pas des rendements du fonds, et ceux-ci auraient pu être différents si le fonds avait existé durant cette période.",
});

const GMV_GROSS: Text = {
  en:
    "Nymbus Global Minimum Volatility is a strategy offered through separately managed accounts; it is not an investment fund. " +
    "Its returns are shown gross of management fees and other expenses, which reduce client returns; actual client returns vary by account. " +
    "Returns are arithmetic (simple sums of monthly returns on notional exposure, not compounded) and gross of fees; the growth chart is illustrative. " +
    "Unless another variant is selected on the strategy page, the returns shown are those of the 6% downside volatility variant; the strategy is also offered with 3% and 9% downside volatility targets, whose returns differ.",
  fr:
    "Nymbus Global Minimum Volatility est une stratégie offerte au moyen de comptes gérés distincts; il ne s’agit pas d’un fonds d’investissement. " +
    "Ses rendements sont présentés avant déduction des frais de gestion et des autres frais, lesquels réduisent le rendement des clients; le rendement réel varie d’un compte à l’autre. " +
    "Les rendements sont arithmétiques (sommes simples des rendements mensuels sur l’exposition notionnelle, non composés) et avant déduction des frais; le graphique de croissance est illustratif. " +
    "Sauf si une autre variante est sélectionnée sur la page de la stratégie, les rendements présentés sont ceux de la variante à volatilité à la baisse de 6\u00a0%; la stratégie est aussi offerte avec des cibles de volatilité à la baisse de 3\u00a0% et de 9\u00a0%, dont les rendements diffèrent.",
};

const FTSE: Text = {
  en:
    "Source: London Stock Exchange Group plc and its group undertakings (collectively, the “LSE Group”). © LSE Group. FTSE Russell is a trading name of certain of the LSE Group companies. " +
    "“FTSE®” is a trade mark of the relevant LSE Group companies and is used by any other LSE Group company under licence. All rights in the FTSE Russell indexes or data vest in the relevant LSE Group company which owns the index or the data. " +
    "Neither LSE Group nor its licensors accept any liability for any errors or omissions in the indexes or data and no party may rely on any indexes or data contained in this communication. " +
    "No further distribution of data from the LSE Group is permitted without the relevant LSE Group company’s express written consent. The LSE Group does not promote, sponsor or endorse the content of this communication.",
  fr:
    "Source : London Stock Exchange Group plc et les entreprises de son groupe (collectivement, le « Groupe LSE »). © Groupe LSE. FTSE Russell est une dénomination commerciale de certaines sociétés du Groupe LSE. " +
    "« FTSE® » est une marque de commerce des sociétés concernées du Groupe LSE, utilisée sous licence par toute autre société du Groupe LSE. Tous les droits sur les indices ou les données FTSE Russell appartiennent à la société du Groupe LSE qui en est propriétaire. " +
    "Ni le Groupe LSE ni ses concédants de licence n’assument de responsabilité à l’égard d’erreurs ou d’omissions dans les indices ou les données, et nul ne peut se fier aux indices ou aux données contenus dans la présente communication. " +
    "Toute autre diffusion de données du Groupe LSE est interdite sans le consentement écrit exprès de la société concernée du Groupe LSE. Le Groupe LSE ne promeut, ne parraine ni n’approuve le contenu de la présente communication.",
};

const SUMMARY_NET: Text = {
  en: "Fund returns are net of fees, in CAD; benchmark indices bear no fees. Past performance may not be repeated. See the important information below.",
  fr: "Les rendements des fonds sont présentés après déduction des frais, en CAD; les indices de référence n’assument aucuns frais. Le rendement passé pourrait ne pas se reproduire. Voir les renseignements importants ci-dessous.",
};

const SUMMARY_GROSS: Text = {
  en: "Global Minimum Volatility returns (6% downside volatility variant unless another is selected) are gross of fees (managed accounts, not a fund).",
  fr: "Les rendements de Global Minimum Volatility (variante à volatilité à la baisse de 6\u00a0%, sauf si une autre est sélectionnée) sont présentés avant déduction des frais (comptes gérés, pas un fonds).",
};

const BASIS_NET: Text = { en: "net of fees", fr: "après déduction des frais" };
const BASIS_GROSS: Text = {
  en: "gross of fees · managed accounts, not a fund",
  fr: "avant déduction des frais · comptes gérés, pas un fonds",
};

const SAMPLE: Text = {
  en: "The figures on this page are illustrative sample data used while the data platform is not connected. They are not the actual returns of the fund.",
  fr: "Les chiffres de cette page sont des données fictives utilisées tant que la plateforme de données n’est pas branchée. Il ne s’agit pas des rendements réels du fonds.",
};

const PROVENANCE: Text = {
  en: "Updated daily from Nymbus’ data platform",
  fr: "Mis à jour quotidiennement à partir de la plateforme de données de Nymbus",
};
const PROVENANCE_FACTSHEET: Text = {
  en: "portfolio data as of",
  fr: "données de portefeuille au",
};
/** when the Portfolio tab shows the daily book computed by the data platform */
const PROVENANCE_DAILY: Text = {
  en: "portfolio data as of",
  fr: "données de portefeuille au",
};
/** next to the daily book, the sustainability metrics still come from the factsheet */
const PROVENANCE_ESG_FACTSHEET: Text = {
  en: "sustainability metrics as of",
  fr: "indicateurs de durabilité au",
};

/** Every text of the public site that compliance must approve. */
export const DISCLAIMERS: Disclaimer[] = [
  {
    id: "firm",
    label: "Firm disclaimer (registration, not advice, not an offer, offering documents)",
    text: FIRM,
    where: [
      { label: "footer of every public page (replaced by the admin firm disclaimer when set)", href: "/#disclaimers" },
      { label: "fund pages, disclosure", href: "/strategies/monthly-income#disclosure" },
    ],
    review: [
      "Registration categories and regulator(s): portfolio manager + investment fund manager with the AMF only? Other provinces (OSC…), exempt market dealer?",
      "How each fund is distributed: simplified prospectus + fund facts vs offering memorandum (prospectus-exempt); adapt the sentence per fund if needed.",
      "Legal entity name (Nymbus Capital Inc. / Nymbus Capital inc.).",
    ],
  },
  {
    id: "fundStandard",
    label: "Mutual fund standard warning (NI 81-102 s. 15.4 style)",
    text: FUND_STANDARD,
    where: [
      { label: "footer of every public page", href: "/#disclaimers" },
      { label: "fund pages (funds only), disclosure", href: "/strategies/monthly-income#disclosure" },
    ],
    review: [
      "Exact prescribed wording for prospectus funds vs OM funds; 'fund facts' only exists for prospectus funds.",
    ],
  },
  {
    id: "returnsNet",
    label: "Definition of the rates of return (net of fees)",
    text: RETURNS_NET,
    where: [
      { label: "footer of every public page", href: "/#disclaimers" },
      {
        label: "fund pages (net-of-fees funds), disclosure",
        href: "/strategies/sustainable-enhanced-bonds#disclosure",
      },
    ],
    review: [
      "Net of which fees (management fee, fund expenses, MER)? Series shown per fund: Monthly Income FP, Multi-Strategy F; SEB series F once the dataplatform serves its full class F history, else series H — the label always follows the class of the data (Gabriel 2026-10-01). SEB series F for 2019-02 to 2023-07 covers pre-launch strategy returns net of current fees (same question as the Monthly Income pre-launch record).",
      "Annualization convention matches the site: periods of 12 months and more are annualized (since inception annualized once the track record covers 12 months); periods under one year are not annualized. Standard periods (1, 3, 5, 10 years and since inception) per NI 81-102 Part 15.",
    ],
  },
  {
    id: "benchmark",
    label: "Benchmark (broad-based FTSE index, comparison only)",
    text: BENCHMARK,
    where: [
      { label: "footer of every public page", href: "/#disclaimers" },
      { label: "fund pages with a benchmark, disclosure", href: "/strategies/monthly-income#disclosure" },
    ],
    review: [
      "Benchmark names per fund (Monthly Income: FTSE Canada Short Term Corporate; SEB: FTSE Canada Universe). Index figures are computed from FTSE data and can differ from factsheets before May 2026 (ETF proxies).",
      "Whether 'broad-based' is accurate for each benchmark.",
    ],
  },
  {
    id: "preInception",
    label: "Performance before the fund's launch (strategy track record)",
    text: PRE_INCEPTION(FUND_INCEPTION["monthly-income"]!),
    where: [
      { label: "footer of every public page", href: "/#disclaimers" },
      {
        label: "Monthly Income fund page, disclosure (unless the admin performance note replaces it)",
        href: "/strategies/monthly-income#disclosure",
      },
    ],
    review: [
      "Fund launch date (2021-10-05) and strategy start (2019-01) for Monthly Income.",
      "Launch dates of the other funds (Sustainable Enhanced Bonds, Multi-Strategy): do they also show pre-launch strategy history? If so add them to FUND_INCEPTION.",
      "Is the pre-launch series net of the fund's current fees or of actual account fees? Is showing it permitted (NI 81-102 s. 15.3 / sales communications rules)?",
    ],
  },
  {
    id: "gmvGross",
    label: "Global Minimum Volatility: gross of fees, managed accounts, not a fund",
    text: GMV_GROSS,
    where: [
      { label: "footer of every public page", href: "/#disclaimers" },
      { label: "GMV strategy page, hero + disclosure", href: "/strategies/global-minimum-volatility#disclosure" },
    ],
    review: [
      "Gross/net wording; whether a net-of-fees series must be shown alongside (GIPS / performance advertising rules).",
      "Target volatility variant shown (6 %); variant sentence added 2026-10-02: every GMV figure names its downside volatility variant.",
      "Arithmetic-returns sentence added 2026-09-30. Is the series actual accounts, a composite or a model? If model/hypothetical, it must be labelled as such.",
    ],
  },
  {
    id: "ftse",
    label: "FTSE Russell trademark and data notice",
    text: FTSE,
    where: [
      { label: "footer of every public page", href: "/#disclaimers" },
      { label: "fund pages with a benchmark, disclosure", href: "/strategies/monthly-income#disclosure" },
    ],
    review: [
      "Exact notice required by the FTSE Russell data licence (year in the © line, 'LSE Group' wording), and whether index data may be redistributed on a public website.",
    ],
  },
  {
    id: "summaryNet",
    label: "Short performance note under return figures (home, strategies)",
    text: SUMMARY_NET,
    where: [
      { label: "home page, strategies", href: "/" },
      { label: "strategies index", href: "/strategies" },
    ],
    review: ["Short notes near figures must not contradict the full disclosure (net of which fees, class)."],
  },
  {
    id: "basisLabels",
    label: "Basis labels next to return figures (net / gross, managed accounts)",
    text: { en: `${BASIS_NET.en} | ${BASIS_GROSS.en}`, fr: `${BASIS_NET.fr} | ${BASIS_GROSS.fr}` },
    where: [{ label: "fund pages, hero and disclosure", href: "/strategies/global-minimum-volatility#disclosure" }],
    review: ["Short labels must match the full net/gross disclosure."],
  },
  {
    id: "sample",
    label: "Sample-data warning (only while the data platform is not connected)",
    text: SAMPLE,
    where: [{ label: "fund pages, disclosure (sample mode only)", href: "/strategies/monthly-income#disclosure" }],
    review: ["Sample data must never appear in production (SHOW_SAMPLE_DATA); wording if it does on a demo site."],
  },
  {
    id: "provenance",
    label: "Data provenance line (update frequency, source and date of the portfolio data)",
    text: {
      en: `${PROVENANCE.en}; ${PROVENANCE_FACTSHEET.en} <month>. — or, when the daily holdings are shown: ${PROVENANCE.en}; ${PROVENANCE_DAILY.en} <date>; ${PROVENANCE_ESG_FACTSHEET.en} <month>.`,
      fr: `${PROVENANCE.fr}; ${PROVENANCE_FACTSHEET.fr} <mois>. — ou, lorsque les positions quotidiennes sont présentées\u00a0: ${PROVENANCE.fr}; ${PROVENANCE_DAILY.fr} <date>; ${PROVENANCE_ESG_FACTSHEET.fr} <mois>.`,
    },
    where: [{ label: "fund pages, disclosure", href: "/strategies/monthly-income#disclosure" }],
    review: [
      "'Updated daily' is accurate (schedule); the as-of dates shown next to it.",
      "Daily holdings wording: the Portfolio tab of the bond funds shows the data platform's daily book (holdings of the last valuation day) when its coverage is sufficient, else the month-end factsheet.",
      "The sustainability-metrics clause appears only when those factsheet metrics are shown next to the daily book.",
    ],
  },
  {
    id: "summaryGross",
    label: "Short gross-of-fees note (home, strategies)",
    text: SUMMARY_GROSS,
    where: [
      { label: "home page, strategies", href: "/" },
      { label: "strategies index", href: "/strategies" },
    ],
    review: ["Gross/net wording."],
  },
];

const byId = (id: string): Text => DISCLAIMERS.find((d) => d.id === id)!.text;

/** Named access for components. */
export const DISC = {
  firm: FIRM,
  fundStandard: FUND_STANDARD,
  returnsNet: RETURNS_NET,
  benchmark: BENCHMARK,
  gmvGross: GMV_GROSS,
  ftse: FTSE,
  summaryNet: SUMMARY_NET,
  summaryGross: SUMMARY_GROSS,
  basisNet: BASIS_NET,
  basisGross: BASIS_GROSS,
  sample: SAMPLE,
  provenance: PROVENANCE,
  provenanceFactsheet: PROVENANCE_FACTSHEET,
  provenanceDaily: PROVENANCE_DAILY,
  provenanceEsgFactsheet: PROVENANCE_ESG_FACTSHEET,
  byId,
} as const;

/** Pre-launch note of a fund, or null when the fund shows no pre-launch history. */
export function preInceptionNote(fundKey: string): Text | null {
  const f = FUND_INCEPTION[fundKey];
  return f ? PRE_INCEPTION(f) : null;
}

/**
 * Texts shown in the footer of every public page, in order. `firmOverride` = admin firm disclaimer (settings);
 * `hiddenFunds` = funds hidden in the admin (their fund-specific paragraphs are omitted).
 */
export function footerDisclaimers(firmOverride?: Text | null, hiddenFunds: readonly string[] = []): Text[] {
  const firm = firmOverride && (firmOverride.en.trim() || firmOverride.fr.trim()) ? firmOverride : FIRM;
  const preLaunch = Object.entries(FUND_INCEPTION)
    .filter(([k, f]) => f && !hiddenFunds.includes(k))
    .map(([, f]) => PRE_INCEPTION(f!));
  return [firm, FUND_STANDARD, RETURNS_NET, BENCHMARK, ...preLaunch, GMV_GROSS, FTSE];
}

export interface DisclaimerOverrides {
  firm?: Text | null;
  performanceNotes?: Record<string, Text | undefined>;
}

/**
 * Fingerprint of everything compliance approves: the boilerplate above + the admin overrides. FNV-1a 64 over a
 * canonical JSON (not a secret; only detects change).
 */
export function disclaimersHash(o: DisclaimerOverrides = {}): string {
  const notes = Object.entries(o.performanceNotes ?? {})
    .filter(([, t]) => t && (t.en.trim() || t.fr.trim()))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, t]) => [k, t!.en, t!.fr]);
  const firm = o.firm && (o.firm.en.trim() || o.firm.fr.trim()) ? [o.firm.en, o.firm.fr] : null;
  const canon = JSON.stringify([DISCLAIMERS.map((d) => [d.id, d.text.en, d.text.fr]), FUND_INCEPTION, firm, notes]);
  let h = 0xcbf29ce484222325n;
  for (const b of new TextEncoder().encode(canon)) {
    h ^= BigInt(b);
    h = (h * 0x100000001b3n) & 0xffffffffffffffffn;
  }
  return h.toString(16).padStart(16, "0");
}
