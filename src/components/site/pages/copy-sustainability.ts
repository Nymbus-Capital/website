/**
 * /sustainability copy, EN / FR. Sources: the previous site's Sustainability page and its (unused) dictionary
 * copy, rewritten as facts: no ESG metrics, green-bond allocations or "PRI scorecard" percentages (the old
 * figures were placeholders). Public commitments only: PRI signatory since 2018, the Tobacco-Free Finance
 * Pledge (2024), the Fondaction mandates.
 */
import { l } from "../../../lib/i18n/config.ts";

export const SU = {
  meta: {
    title: l("Sustainability", "Développement durable"),
    description: l(
      "Responsible investing at Nymbus Capital: ESG integration in a systematic process, exclusion policy, green bonds, the Fondaction partnership and our PRI commitment.",
      "L’investissement responsable chez Nymbus Capital : intégration ESG dans un processus systématique, politique d’exclusion, obligations vertes, partenariat avec Fondaction et engagement envers les PRI.",
    ),
  },
  hero: {
    eyebrow: l("Sustainability", "Développement durable"),
    title: l("Responsible investing,", "L’investissement responsable,"),
    accent: l("built into the process", "intégré au processus"),
    lead: l(
      "ESG criteria are part of the systematic process that selects our bonds. They do not apply in the same way to our futures overlays, which trade exchange-traded futures rather than securities of individual issuers.",
      "Les critères ESG font partie du processus systématique qui sélectionne nos obligations. Ils ne s’appliquent pas de la même façon à nos stratégies de superposition, qui portent sur des contrats à terme cotés plutôt que sur des titres d’émetteurs individuels.",
    ),
    cta1: l("Sustainable Enhanced Bonds", "Obligations Durables Bonifiées"),
    cta2: l("Our exclusion policy", "Notre politique d’exclusion"),
    badge: l("PRI signatory since 2018", "Signataire des PRI depuis 2018"),
  },
  principles: {
    eyebrow: l("Our principles", "Nos principes"),
    title: l("ESG as part of", "L’ESG au cœur"),
    accent: l("the investment process", "du processus de placement"),
    lead: l(
      "Same commitments in every bond selection process. Futures overlays, which do not hold securities of individual issuers, are outside their scope.",
      "Mêmes engagements dans chaque processus de sélection d’obligations. Les stratégies de superposition, qui ne détiennent pas de titres d’émetteurs individuels, n’en font pas partie.",
    ),
    items: [
      { t: l("Core integration", "Intégration au cœur"), d: l("ESG data inside our bond selection models.", "Des données ESG au sein de nos modèles de sélection.") },
      { t: l("Transparency", "Transparence"), d: l("We explain and report how ESG shapes our portfolios.", "Nous expliquons et rapportons l’effet de l’ESG sur nos portefeuilles.") },
      { t: l("Accountability", "Responsabilité"), d: l("PRI signatory since 2018: we report on our progress every year.", "Signataire des PRI depuis 2018 : nous rendons compte de nos progrès chaque année.") },
    ],
  },
  integration: {
    eyebrow: l("Integration in practice", "L’intégration en pratique"),
    title: l("Three layers,", "Trois couches,"),
    accent: l("one systematic process", "un seul processus systématique"),
    lead: l(
      "From the investable universe to each security.",
      "De l’univers admissible à chaque titre.",
    ),
    steps: [
      { t: l("Exclusion screening", "Filtrage d’exclusion"), d: l("Excluded issuers leave the universe before any analysis.", "Les émetteurs exclus quittent l’univers avant toute analyse.") },
      { t: l("Positive screening", "Filtrage positif"), d: l("Stronger ESG practices are favoured in credit analysis.", "De meilleures pratiques ESG sont favorisées dans l’analyse de crédit.") },
      { t: l("Quantitative integration", "Intégration quantitative"), d: l("ESG metrics feed credit models, alongside yield and risk.", "Les mesures ESG alimentent les modèles de crédit, avec le rendement et le risque.") },
    ],
  },
  exclusions: {
    eyebrow: l("Exclusion policy", "Politique d’exclusion"),
    title: l("Our", "Nos"),
    accent: l("exclusions", "exclusions"),
    lead: l(
      "The exclusions below apply to the securities we select directly, as set out in each fund’s offering documents and each mandate’s investment policy. They do not apply to exchange-traded futures used in our overlays.",
      "Les exclusions ci-dessous s’appliquent aux titres que nous sélectionnons directement, selon les modalités prévues dans les documents de placement de chaque fonds et la politique de placement de chaque mandat. Elles ne visent pas les contrats à terme cotés utilisés dans nos stratégies de superposition.",
    ),
    items: [
      { t: l("Coal and oil sands", "Charbon et sables bitumineux"), d: l("More than 5% of revenue from coal, oil sands or thermal coal power.", "Plus de 5 % des revenus tirés du charbon, des sables bitumineux ou de l’électricité au charbon.") },
      { t: l("Tobacco", "Tabac"), d: l("Manufacturers and distributors, per the Tobacco-Free Finance Pledge (2024).", "Fabricants et distributeurs, selon l’Engagement pour une finance sans tabac (2024).") },
      { t: l("Controversial weapons", "Armes controversées"), d: l("Cluster munitions, landmines, biological, chemical and nuclear weapons.", "Armes à sous-munitions, mines terrestres, armes biologiques, chimiques et nucléaires.") },
      { t: l("Severe ESG controversies", "Controverses ESG graves"), d: l("Rated “severe” by MSCI or an equivalent provider.", "Jugées « graves » par MSCI ou un fournisseur équivalent.") },
    ],
  },
  green: {
    eyebrow: l("Green bonds", "Obligations vertes"),
    title: l("Financing the transition", "Financer la transition"),
    accent: l("through fixed income", "par le revenu fixe"),
    text: l(
      "Our sustainable bond strategy can hold green bonds labelled under recognized frameworks such as the ICMA Green Bond Principles. Same credit, risk and ESG criteria as any other security.",
      "Notre stratégie obligataire durable peut détenir des obligations vertes désignées selon des cadres reconnus, comme les Principes applicables aux obligations vertes de l’ICMA. Mêmes critères de crédit, de risque et ESG que tout autre titre.",
    ),
    uses: [l("Renewable energy", "Énergie renouvelable"), l("Energy efficiency", "Efficacité énergétique"), l("Clean transportation", "Transport propre"), l("Green buildings", "Bâtiments écologiques")],
    note: l(
      "Portfolio characteristics, including ESG measures when they are published, are on the fund page.",
      "Les caractéristiques du portefeuille, y compris les mesures ESG lorsqu’elles sont publiées, figurent sur la page du fonds.",
    ),
    go: l("Sustainable Enhanced Bonds fund", "Fonds Obligations Durables Bonifiées"),
  },
  fondaction: {
    eyebrow: l("Partnership", "Partenariat"),
    title: l("Working with", "Aux côtés de"),
    accent: l("Fondaction", "Fondaction"),
    p1: l(
      "Fondaction, a Québec labour-sponsored fund, has entrusted Nymbus with sustainable bond mandates.",
      "Fondaction, un fonds de travailleurs québécois, a confié à Nymbus des mandats obligataires durables.",
    ),
  },
  pri: {
    eyebrow: l("PRI signatory", "Signataire des PRI"),
    title: l("The six principles", "Les six principes"),
    accent: l("we signed", "que nous avons signés"),
    lead: l(
      "Signatory of the UN-supported Principles for Responsible Investment since 2018. Signatories commit to:",
      "Signataire depuis 2018 des Principes pour l’investissement responsable, soutenus par les Nations Unies. Les signataires s’engagent à :",
    ),
    items: [
      l("Incorporate ESG issues into investment analysis and decision-making processes.", "Prendre en compte les questions ESG dans les processus d’analyse et de décision en matière d’investissements."),
      l("Be active owners and incorporate ESG issues into ownership policies and practices.", "Être des investisseurs actifs et prendre en compte les questions ESG dans leurs politiques et pratiques d’actionnaires."),
      l("Seek appropriate disclosure on ESG issues by the entities in which they invest.", "Demander aux entités dans lesquelles ils investissent de publier des informations appropriées sur les questions ESG."),
      l("Promote acceptance and implementation of the Principles within the investment industry.", "Favoriser l’acceptation et l’application des Principes auprès des acteurs de la gestion d’actifs."),
      l("Work together to enhance their effectiveness in implementing the Principles.", "Travailler ensemble pour accroître l’efficacité de l’application des Principes."),
      l("Report on their activities and progress towards implementing the Principles.", "Rendre compte individuellement de leurs activités et de leurs progrès dans l’application des Principes."),
    ],
    link: l("About the PRI", "À propos des PRI"),
  },
  commitments: {
    eyebrow: l("Our commitments", "Nos engagements"),
    title: l("Commitments", "Des engagements"),
    accent: l("on the record", "publics"),
    items: [
      { y: "2018", t: l("PRI signatory since 2018", "Signataire des PRI depuis 2018"), d: l("Signed the UN-supported Principles for Responsible Investment.", "Signature des Principes pour l’investissement responsable, soutenus par les Nations Unies.") },
      { y: "2024", t: l("Tobacco-Free Finance Pledge", "Engagement pour une finance sans tabac"), d: l("No tobacco in the securities we select directly.", "Aucun tabac dans les titres que nous sélectionnons directement.") },
    ],
    fondaction: { t: l("Fondaction mandates", "Mandats de Fondaction"), d: l("Sustainable bond mandates managed for Fondaction.", "Des mandats obligataires durables gérés pour Fondaction.") },
  },
  cta: {
    title: l("Invest", "Investir"),
    accent: l("responsibly", "de façon responsable"),
    text: l(
      "See these criteria at work in the fund.",
      "Voyez ces critères à l’œuvre dans le fonds.",
    ),
    b1: l("Explore the fund", "Découvrir le fonds"),
    b2: l("Contact us", "Nous joindre"),
  },
};
