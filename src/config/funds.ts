/**
 * Static registry of the funds shown on the website: identity, where each data point comes from,
 * brand colours. Everything editable by the business (fees, descriptions, visibility, documents) lives
 * in the admin-managed content store instead (see SiteContent), so this file only changes with code.
 *
 * Dependency-free (plain TS) so the pipeline can import it under Node type stripping.
 */
import type { FundKey, L10n } from "../lib/data/types.ts";

export interface FundSpec {
  key: FundKey;
  name: L10n;
  short: L10n;
  vehicle: "fund" | "strategy";
  assetClass: L10n;
  /** accent gradient (from, to) and solid accent: v3 keynote colours */
  color: { solid: string; from: string; to: string };
  /** legacy slugs that should redirect here */
  aliases: string[];
  sources: {
    /** dataplatform `short_name` for monthly-net-returns / nav-timeseries / aum / holdings (null: no fund vehicle) */
    dataplatform: "SEST" | "SEB" | "Multistrat" | null;
    /**
     * FTSE index-summary short_name, used for index months the published factsheet does not cover yet
     * (the factsheet's own index tables are the primary source of every index figure). null: no benchmark
     */
    ftseIndex: string | null;
    /** series name in the analytics repo fund_returns.json (official monthly history before the Apex cutover) */
    analytics: string | null;
    /** class the published performance is labelled with on the site (business decision: FP / F) */
    returnClassLabel: "FP" | "F" | null;
    /** factsheet archive: file prefix and fund key inside it */
    factsheet: { file: "bonds_data" | "factsheet_data"; key: string } | null;
    /** strategies without a fund vehicle only have gross figures in the factsheet archive */
    basis: "net" | "gross";
  };
  benchmark: L10n | null;
  /** default headline class (FundServ) when the admin has not chosen one */
  headlineClass: string | null;
  defaults: {
    riskRating: "low" | "low-medium" | "medium" | "medium-high" | "high";
    tagline: L10n;
    description: L10n;
  };
}

export const FUNDS: FundSpec[] = [
  {
    key: "monthly-income",
    name: { en: "Nymbus Monthly Income Fund", fr: "Fonds Nymbus Revenu Mensuel" },
    short: { en: "Monthly Income", fr: "Revenu Mensuel" },
    vehicle: "fund",
    assetClass: { en: "Short-term fixed income", fr: "Revenu fixe à court terme" },
    color: { solid: "#1a73e8", from: "#6ea8ff", to: "#0b57d0" },
    aliases: ["sustainable-enhanced-short-term-bonds", "sest"],
    sources: {
      dataplatform: "SEST",
      // Every index figure is computed from this FTSE series (dataplatform index-summary levels). The
      // factsheet producer used the XSB ETF until 2026-04 and FTSE short_corp afterwards: its published
      // index figures are only a cross-check. Override with FTSE_INDEX_SEST.
      ftseIndex: "short_corp",
      analytics: "Nymbus Monthly Income",
      returnClassLabel: "FP",
      factsheet: { file: "bonds_data", key: "SEST" },
      basis: "net",
    },
    benchmark: { en: "FTSE Canada Short Term Corporate Bond Index", fr: "Indice FTSE Canada des obligations corporatives à court terme" },
    headlineClass: "LDM001",
    defaults: {
      riskRating: "low-medium",
      tagline: { en: "Monthly income from short-term corporate bonds", fr: "Un revenu mensuel tiré d’obligations de sociétés à court terme" },
      description: {
        en: "Short-term Canadian corporate bonds selected by our two-system process, with a futures overlay designed to have low correlation with bonds and to offset part of bond losses; it may not do so and can lose money. Distributions are not guaranteed, may change and may include a return of capital.",
        fr: "Des obligations de sociétés canadiennes à court terme sélectionnées par notre processus à deux systèmes, avec une stratégie de superposition conçue pour avoir une faible corrélation avec les obligations et compenser une partie des pertes obligataires; elle peut ne pas y parvenir et peut subir des pertes. Les distributions ne sont pas garanties, peuvent changer et peuvent comprendre un remboursement de capital.",
      },
    },
  },
  {
    key: "sustainable-enhanced-bonds",
    name: { en: "Nymbus Sustainable Enhanced Bonds Fund", fr: "Fonds Nymbus Obligations Durables Bonifiées" },
    short: { en: "Sustainable Enhanced Bonds", fr: "Obligations Durables Bonifiées" },
    vehicle: "fund",
    assetClass: { en: "Core fixed income", fr: "Revenu fixe de base" },
    color: { solid: "#00a3e0", from: "#5ad2ff", to: "#0086c3" },
    aliases: ["seb", "core-bond"],
    sources: {
      dataplatform: "SEB",
      ftseIndex: "univ",
      analytics: "Nymbus Sustainable Enhanced Bonds",
      // the dataplatform track record is the STRATEGY_H (class H) series; the site labels it class F
      returnClassLabel: "F",
      factsheet: { file: "bonds_data", key: "QCFI-SEB" },
      basis: "net",
    },
    benchmark: { en: "FTSE Canada Universe Bond Index", fr: "Indice FTSE Canada des obligations universelles" },
    headlineClass: "LDM201",
    defaults: {
      riskRating: "low",
      tagline: { en: "Canadian core bonds, managed systematically", fr: "Obligations canadiennes de base, gérées de façon systématique" },
      description: {
        en: "A core Canadian bond portfolio built systematically, integrating sustainability criteria in bond selection, with a futures overlay designed to have low correlation with bonds and to offset part of bond losses; it may not do so and can lose money.",
        fr: "Un portefeuille obligataire canadien de base construit de façon systématique, intégrant des critères de durabilité dans la sélection des obligations, avec une stratégie de superposition conçue pour avoir une faible corrélation avec les obligations et compenser une partie des pertes obligataires; elle peut ne pas y parvenir et peut subir des pertes.",
      },
    },
  },
  {
    key: "multi-strategy",
    name: { en: "Nymbus Multi-Strategy Fund", fr: "Fonds Nymbus Multistratégies" },
    short: { en: "Multi-Strategy", fr: "Multistratégies" },
    vehicle: "fund",
    assetClass: { en: "Alternative strategies", fr: "Stratégies alternatives" },
    color: { solid: "#fa7b17", from: "#ffc043", to: "#f4511e" },
    aliases: ["multistrategy", "multistrat"],
    sources: {
      dataplatform: "Multistrat",
      ftseIndex: null,
      analytics: "Nymbus Multistrategy (Inc. discretionary strats history)",
      returnClassLabel: "F",
      factsheet: { file: "factsheet_data", key: "Multistrategy" },
      basis: "net",
    },
    benchmark: null,
    headlineClass: "LDM301",
    defaults: {
      riskRating: "medium",
      tagline: { en: "Four systematic strategies designed to have low correlation with one another", fr: "Quatre stratégies systématiques conçues pour être peu corrélées entre elles" },
      description: {
        en: "Low-volatility, directional, mean-reversion and hedging strategies combined into one portfolio, each designed to play a distinct role across market regimes.",
        fr: "Des stratégies à faible volatilité, directionnelles, de retour à la moyenne et de couverture réunies dans un portefeuille, chacune conçue pour jouer un rôle distinct selon les régimes de marché.",
      },
    },
  },
  {
    key: "global-minimum-volatility",
    name: { en: "Nymbus Global Minimum Volatility", fr: "Nymbus Global Minimum Volatility" },
    short: { en: "Global Minimum Volatility", fr: "Global Minimum Volatility" },
    vehicle: "strategy",
    assetClass: { en: "Futures overlay (managed accounts)", fr: "Stratégie de superposition (comptes gérés)" },
    color: { solid: "#34a853", from: "#5be08f", to: "#0f9d58" },
    aliases: ["gmv"],
    sources: {
      dataplatform: null,
      ftseIndex: null,
      analytics: null,
      returnClassLabel: null,
      factsheet: { file: "factsheet_data", key: "GMV_6pct" },
      basis: "gross",
    },
    benchmark: null,
    headlineClass: null,
    defaults: {
      riskRating: "low",
      tagline: { en: "A futures overlay designed to have low correlation with bonds", fr: "Une stratégie de superposition conçue pour avoir une faible corrélation avec les obligations" },
      description: {
        en: "A managed-futures overlay stacked on top of an existing portfolio (margin deposit of about 5 to 10% of exposure): most of the capital stays invested in the underlying portfolio while the overlay targets 3%, 6% or 9% downside volatility. The overlay adds leveraged futures exposure; its losses add to those of the underlying portfolio and may require additional margin.",
        fr: "Une stratégie de contrats à terme gérés ajoutée par-dessus un portefeuille existant (dépôt de garantie d’environ 5 à 10 % de l’exposition) : la majeure partie du capital reste investie dans le portefeuille sous-jacent, tandis que la stratégie cible une volatilité baissière de 3 %, 6 % ou 9 %. La superposition ajoute une exposition à effet de levier au moyen de contrats à terme; ses pertes s’ajoutent à celles du portefeuille sous-jacent et peuvent exiger des dépôts de garantie supplémentaires.",
      },
    },
  },
];

export const FUND_KEYS = FUNDS.map((f) => f.key);
export const fundSpec = (key: string): FundSpec | undefined =>
  FUNDS.find((f) => f.key === key) ?? FUNDS.find((f) => f.aliases.includes(key));
