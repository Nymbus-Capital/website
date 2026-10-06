/**
 * /sustainability copy, EN / FR. Facts only: no ESG metrics, green-bond allocations or "PRI scorecard" percentages
 * (the old figures were placeholders). Scope: ESG criteria and exclusions belong to the
 * Sustainable Enhanced Bonds Fund ONLY; firm-level items are the public commitments (PRI signatory since 2018, the
 * Tobacco-Free Finance Pledge, 2024) and the Fondaction mandates. tests/unit/site/esg-scope.test.ts fails when
 * exclusion / ESG-screen wording appears on a firm-level page without the fund's name in the same block.
 */
import { l } from "../../../lib/i18n/config.ts";

const SEB = l("Sustainable Enhanced Bonds Fund", "Fonds Obligations Durables Bonifiées");

export const SU = {
  meta: {
    title: l("Sustainability", "Développement durable"),
    description: l(
      "Responsible investing at Nymbus Capital: firm commitments (PRI signatory, Tobacco-Free Finance Pledge) and the Sustainable Enhanced Bonds Fund’s ESG integration, exclusions and green bonds.",
      "L’investissement responsable chez Nymbus Capital : engagements de la firme (signataire des PRI, Engagement pour une finance sans tabac) et, pour le Fonds Obligations Durables Bonifiées, intégration ESG, exclusions et obligations vertes.",
    ),
  },
  hero: {
    eyebrow: l("Sustainability", "Développement durable"),
    title: l("Our commitments,", "Nos engagements,"),
    accent: l("and a sustainable bond fund", "et un fonds obligataire durable"),
    lead: l(
      "Firm-wide, we are a PRI signatory. The ESG criteria and exclusions on this page are those of the Sustainable Enhanced Bonds Fund; they do not apply to its futures overlay, which trades exchange-traded futures rather than securities of individual issuers.",
      "À l’échelle de la firme, nous sommes signataires des PRI. Les critères ESG et les exclusions présentés ici sont ceux du Fonds Obligations Durables Bonifiées; ils ne visent pas sa stratégie de superposition, qui porte sur des contrats à terme cotés plutôt que sur des titres d’émetteurs individuels.",
    ),
    cta1: SEB,
    cta2: l("The fund’s exclusions", "Les exclusions du fonds"),
    badge: l("PRI signatory since 2018", "Signataire des PRI depuis 2018"),
  },
  principles: {
    eyebrow: l("At the firm level", "À l’échelle de la firme"),
    title: l("Commitments", "Des engagements"),
    accent: l("we hold as a firm", "pris par la firme"),
    lead: l(
      "The ESG screens and exclusions on this page are those of the Sustainable Enhanced Bonds Fund.",
      "Les filtres ESG et les exclusions présentés ici sont ceux du Fonds Obligations Durables Bonifiées.",
    ),
    items: [
      { t: l("Accountability", "Responsabilité"), d: l("PRI signatory since 2018.", "Signataire des PRI depuis 2018.") },
      { t: l("Engagement", "Engagement"), d: l("Tobacco-Free Finance Pledge signatory since 2024.", "Signataire de l’Engagement pour une finance sans tabac depuis 2024.") },
      { t: l("Transparency", "Transparence"), d: l("The sustainable fund’s metrics, on its page.", "Les indicateurs du fonds durable, sur sa page.") },
    ],
  },
  integration: {
    eyebrow: l("In the Sustainable Enhanced Bonds Fund", "Dans le Fonds Obligations Durables Bonifiées"),
    title: l("Three layers,", "Trois couches,"),
    accent: l("in one fund’s process", "dans le processus d’un fonds"),
    steps: [
      { t: l("Exclusion screening", "Filtrage d’exclusion"), d: l("Excluded issuers leave the fund’s universe first.", "Les émetteurs exclus quittent d’abord l’univers du fonds.") },
      { t: l("Positive screening", "Filtrage positif"), d: l("Stronger ESG practices are favoured.", "Les meilleures pratiques ESG sont favorisées.") },
      { t: l("Quantitative integration", "Intégration quantitative"), d: l("ESG metrics feed the fund’s credit models.", "Les mesures ESG alimentent les modèles de crédit du fonds.") },
    ],
  },
  exclusions: {
    eyebrow: l("Exclusion policy", "Politique d’exclusion"),
    title: l("The fund’s", "Les exclusions"),
    accent: l("exclusions", "du fonds"),
    lead: l(
      "The ESG criteria and exclusions below are those of the Sustainable Enhanced Bonds Fund, as set out in its offering documents. They do not apply to exchange-traded futures used in the fund’s overlay.",
      "Les critères ESG et les exclusions ci-dessous sont ceux du Fonds Obligations Durables Bonifiées, selon les modalités prévues dans ses documents de placement. Ils ne visent pas les contrats à terme cotés utilisés dans la stratégie de superposition du fonds.",
    ),
    items: [
      { t: l("Coal and oil sands", "Charbon et sables bitumineux"), d: l("More than 5% of revenue from coal, oil sands or thermal coal power.", "Plus de 5 % des revenus tirés du charbon, des sables bitumineux ou de l’électricité au charbon.") },
      { t: l("Tobacco", "Tabac"), d: l("Manufacturers and distributors.", "Fabricants et distributeurs.") },
      { t: l("Controversial weapons", "Armes controversées"), d: l("Cluster munitions, landmines, biological, chemical and nuclear weapons.", "Armes à sous-munitions, mines terrestres, armes biologiques, chimiques et nucléaires.") },
      { t: l("Severe ESG controversies", "Controverses ESG graves"), d: l("Rated “severe” by MSCI or an equivalent provider.", "Jugées « graves » par MSCI ou un fournisseur équivalent.") },
    ],
  },
  green: {
    eyebrow: l("Green bonds", "Obligations vertes"),
    title: l("Financing the transition", "Financer la transition"),
    accent: l("through fixed income", "par le revenu fixe"),
    text: l(
      "The Sustainable Enhanced Bonds Fund can hold green bonds labelled under frameworks such as the ICMA Green Bond Principles, on the same criteria as its other securities.",
      "Le Fonds Obligations Durables Bonifiées peut détenir des obligations vertes désignées selon des cadres comme les Principes de l’ICMA, selon les mêmes critères que ses autres titres.",
    ),
    uses: [l("Renewable energy", "Énergie renouvelable"), l("Energy efficiency", "Efficacité énergétique"), l("Clean transportation", "Transport propre"), l("Green buildings", "Bâtiments écologiques")],
    note: l("ESG measures, when published, are on the fund page.", "Les mesures ESG, si publiées, figurent sur la page du fonds."),
    go: SEB,
  },
  fondaction: {
    eyebrow: l("Partnership", "Partenariat"),
    title: l("Working with", "Aux côtés de"),
    accent: l("Fondaction", "Fondaction"),
    p1: l(
      "Fondaction has entrusted Nymbus with sustainable bond mandates.",
      "Fondaction a confié à Nymbus des mandats obligataires durables.",
    ),
  },
  pri: {
    link: l("About the PRI", "À propos des PRI"),
  },
  commitments: {
    eyebrow: l("Our commitments", "Nos engagements"),
    title: l("Commitments", "Des engagements"),
    accent: l("on the record", "publics"),
    items: [
      { y: "2018", t: l("PRI signatory since 2018", "Signataire des PRI depuis 2018"), d: l("UN-supported Principles for Responsible Investment.", "Principes pour l’investissement responsable, soutenus par l’ONU.") },
      { y: "2024", t: l("Tobacco-Free Finance Pledge", "Engagement pour une finance sans tabac"), d: l("A firm-level signature. The pledge, an initiative of Tobacco Free Portfolios hosted with UNEP FI, encourages signatories to consider tobacco-free policies across lending, insurance and investment.", "Une signature de la firme. L’engagement, une initiative de Tobacco Free Portfolios menée avec l’IF du PNUE, invite les signataires à envisager des politiques sans tabac en matière de prêt, d’assurance et de placement.") },
    ],
    fondaction: { t: l("Fondaction mandates", "Mandats de Fondaction") },
  },
  cta: {
    title: l("Explore", "Découvrir"),
    accent: l("the sustainable fund", "le fonds durable"),
    b1: l("Explore the fund", "Découvrir le fonds"),
    b2: l("Contact us", "Nous joindre"),
  },
};
