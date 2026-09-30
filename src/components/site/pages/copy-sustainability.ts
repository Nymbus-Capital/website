/**
 * /sustainability copy, EN / FR. Sources: the previous site's Sustainability page and its (unused) dictionary
 * copy, rewritten as facts: no ESG metrics, green-bond allocations or "PRI scorecard" percentages (the old
 * figures were placeholders). Public commitments only: PRI signatory since 2018, the Tobacco-Free Finance
 * Pledge (2024), the Fondaction mandates.
 */
import { l } from "@/lib/i18n/config";

export const SU = {
  meta: {
    title: l("Sustainability", "Développement durable"),
    description: l(
      "Responsible investing at Nymbus Capital: ESG integration in a systematic process, exclusion policy, green bonds, the Fondaction partnership and our PRI commitment.",
      "L’investissement responsable chez Nymbus Capital : intégration ESG dans un processus systématique, politique d’exclusion, obligations vertes, partenariat avec Fondaction et engagement envers les PRI.",
    ),
  },
  hero: {
    eyebrow: l("Sustainability", "Développement durable"),
    title: l("Responsible investing,", "L’investissement responsable,"),
    accent: l("built into the process", "intégré au processus"),
    lead: l(
      "Responsible investing is not a separate strategy at Nymbus. Environmental, social and governance criteria are part of the same systematic process that builds every portfolio.",
      "L’investissement responsable n’est pas une stratégie à part chez Nymbus. Les critères environnementaux, sociaux et de gouvernance font partie du même processus systématique qui bâtit chaque portefeuille.",
    ),
    cta1: l("Sustainable Enhanced Bonds", "Obligations Durables Bonifiées"),
    cta2: l("Our exclusion policy", "Notre politique d’exclusion"),
    badge: l("UN PRI signatory since 2018", "Signataire des PRI de l’ONU depuis 2018"),
  },
  principles: {
    eyebrow: l("Our principles", "Nos principes"),
    title: l("ESG as part of", "L’ESG au cœur"),
    accent: l("the investment process", "du processus de placement"),
    lead: l(
      "Every portfolio decision reflects the same commitments, whatever the strategy.",
      "Chaque décision de portefeuille reflète les mêmes engagements, quelle que soit la stratégie.",
    ),
    items: [
      { t: l("Core integration", "Intégration au cœur"), d: l("ESG data is built into our quantitative models, not added as an afterthought.", "Les données ESG sont intégrées à nos modèles quantitatifs, et non ajoutées après coup.") },
      { t: l("Transparency", "Transparence"), d: l("We explain how ESG criteria shape our portfolios and report on our practices.", "Nous expliquons comment les critères ESG façonnent nos portefeuilles et rendons compte de nos pratiques.") },
      { t: l("Accountability", "Responsabilité"), d: l("As a signatory of the UN Principles for Responsible Investment since 2018, we report on our progress every year.", "Signataire des Principes pour l’investissement responsable de l’ONU depuis 2018, nous rendons compte de nos progrès chaque année.") },
    ],
  },
  integration: {
    eyebrow: l("Integration in practice", "L’intégration en pratique"),
    title: l("Three layers,", "Trois couches,"),
    accent: l("one systematic process", "un seul processus systématique"),
    lead: l(
      "ESG criteria enter the process at three points, from the investable universe to the selection of each security.",
      "Les critères ESG interviennent à trois moments du processus, de l’univers admissible à la sélection de chaque titre.",
    ),
    steps: [
      { t: l("Exclusion screening", "Filtrage d’exclusion"), d: l("Issuers that do not meet our exclusion policy are removed from the investable universe before any analysis.", "Les émetteurs qui ne respectent pas notre politique d’exclusion sont retirés de l’univers admissible avant toute analyse.") },
      { t: l("Positive screening", "Filtrage positif"), d: l("Issuers with stronger environmental, social and governance practices are favoured in credit analysis.", "Les émetteurs dont les pratiques environnementales, sociales et de gouvernance sont plus solides sont favorisés dans l’analyse de crédit.") },
      { t: l("Quantitative integration", "Intégration quantitative"), d: l("ESG metrics are inputs of our credit models and of the systematic security selection, alongside yield and risk.", "Les mesures ESG sont des données d’entrée de nos modèles de crédit et de la sélection systématique des titres, au même titre que le rendement et le risque.") },
    ],
  },
  exclusions: {
    eyebrow: l("Exclusion policy", "Politique d’exclusion"),
    title: l("What we", "Ce que nous"),
    accent: l("do not finance", "ne finançons pas"),
    lead: l(
      "The exclusions below apply as set out in each fund’s offering documents and each mandate’s investment policy.",
      "Les exclusions ci-dessous s’appliquent selon les modalités prévues dans les documents de placement de chaque fonds et la politique de placement de chaque mandat.",
    ),
    items: [
      { t: l("Fossil fuel production", "Production de combustibles fossiles"), d: l("Companies deriving more than 5% of their revenue from coal, oil sands or thermal coal power generation.", "Les sociétés qui tirent plus de 5 % de leurs revenus du charbon, des sables bitumineux ou de la production d’électricité au charbon.") },
      { t: l("Tobacco", "Tabac"), d: l("All tobacco manufacturers and distributors, in line with the Tobacco-Free Finance Pledge we signed in 2024.", "Tous les fabricants et distributeurs de tabac, conformément à l’Engagement pour une finance sans tabac que nous avons signé en 2024.") },
      { t: l("Controversial weapons", "Armes controversées"), d: l("Manufacturers of cluster munitions, landmines, and biological, chemical and nuclear weapons.", "Les fabricants d’armes à sous-munitions, de mines terrestres et d’armes biologiques, chimiques et nucléaires.") },
      { t: l("Severe ESG controversies", "Controverses ESG graves"), d: l("Companies rated “severe” for ESG controversies by MSCI or an equivalent provider.", "Les sociétés dont les controverses ESG sont jugées « graves » par MSCI ou un fournisseur équivalent.") },
    ],
  },
  green: {
    eyebrow: l("Green bonds", "Obligations vertes"),
    title: l("Financing the transition", "Financer la transition"),
    accent: l("through fixed income", "par le revenu fixe"),
    text: l(
      "Green bonds are issued to finance projects with environmental benefits, such as renewable energy, energy efficiency and clean transportation. Our sustainable bond strategy can hold certified green bonds, which go through the same credit, risk and ESG criteria as any other security in the portfolio.",
      "Les obligations vertes sont émises pour financer des projets aux retombées environnementales positives, comme l’énergie renouvelable, l’efficacité énergétique et le transport propre. Notre stratégie obligataire durable peut détenir des obligations vertes certifiées, soumises aux mêmes critères de crédit, de risque et ESG que tout autre titre du portefeuille.",
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
      "Fondaction is a Québec labour-sponsored fund dedicated to positive economic, social and environmental impact. It has entrusted Nymbus with sustainable bond mandates aligned with its mission of responsible capital allocation.",
      "Fondaction est un fonds de travailleurs québécois voué à un impact économique, social et environnemental positif. Il a confié à Nymbus des mandats obligataires durables alignés sur sa mission d’allocation responsable du capital.",
    ),
    p2: l(
      "The partnership reflects a shared commitment to advancing responsible investing in Canadian fixed income markets.",
      "Ce partenariat traduit un engagement commun à faire progresser l’investissement responsable sur les marchés canadiens des titres à revenu fixe.",
    ),
  },
  pri: {
    eyebrow: l("PRI signatory", "Signataire des PRI"),
    title: l("The six principles", "Les six principes"),
    accent: l("we signed", "que nous avons signés"),
    lead: l(
      "Nymbus has been a signatory of the United Nations-supported Principles for Responsible Investment since 2018. Signatories commit to:",
      "Nymbus est signataire des Principes pour l’investissement responsable, soutenus par les Nations Unies, depuis 2018. Les signataires s’engagent à :",
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
      { y: "2018", t: l("UN PRI signatory", "Signataire des PRI de l’ONU"), d: l("Nymbus became a signatory of the Principles for Responsible Investment and reports on its progress every year.", "Nymbus devient signataire des Principes pour l’investissement responsable et rend compte de ses progrès chaque année.") },
      { y: "2024", t: l("Tobacco-Free Finance Pledge", "Engagement pour une finance sans tabac"), d: l("Nymbus committed to excluding tobacco companies from all of its portfolios.", "Nymbus s’engage à exclure les entreprises du tabac de tous ses portefeuilles.") },
    ],
    fondaction: { t: l("Fondaction mandates", "Mandats de Fondaction"), d: l("Sustainable bond mandates managed for Fondaction.", "Des mandats obligataires durables gérés pour Fondaction.") },
  },
  cta: {
    title: l("Invest", "Investir"),
    accent: l("responsibly", "de façon responsable"),
    text: l(
      "Learn how our sustainable bond strategy applies these criteria, or ask our team about ESG requirements for your mandate.",
      "Découvrez comment notre stratégie obligataire durable applique ces critères, ou parlez à notre équipe des exigences ESG de votre mandat.",
    ),
    b1: l("Explore the fund", "Découvrir le fonds"),
    b2: l("Contact us", "Nous joindre"),
  },
};
