/**
 * /team ("About" in the navigation) copy, EN / FR. Firm introduction, values (from the previous site's
 * unused src/data/timeline.ts, rewritten and translated), verifiable milestones only (the old timeline mixed
 * inconsistent AUM figures and launch dates: see docs/site-rebuild.md), and the people (src/data/team.ts).
 */
import { l, type L } from "@/lib/i18n/config";
import type { Department } from "@/data/team";

export const AB = {
  meta: {
    title: l("About us", "À propos"),
    description: l(
      "Nymbus Capital is a Montreal investment manager founded in 2013: scientists and market veterans building systematic fixed income and multi-asset strategies. Meet the team.",
      "Nymbus Capital est un gestionnaire de placements montréalais fondé en 2013 : des scientifiques et des vétérans des marchés qui bâtissent des stratégies systématiques de revenu fixe et multi-actifs. Rencontrez l’équipe.",
    ),
  },
  hero: {
    eyebrow: l("About Nymbus", "À propos de Nymbus"),
    title: l("Scientists", "Des scientifiques"),
    accent: l("and market veterans", "et des vétérans des marchés"),
    lead: l(
      "Nymbus Capital is an independent investment manager based in Montreal. Since 2013, our team of scientists, engineers and experienced portfolio managers has built systematic fixed income and multi-asset strategies for institutions, family offices and financial advisors.",
      "Nymbus Capital est un gestionnaire de placements indépendant établi à Montréal. Depuis 2013, notre équipe de scientifiques, d’ingénieurs et de gestionnaires de portefeuille chevronnés bâtit des stratégies systématiques de revenu fixe et multi-actifs pour des institutions, des bureaux de gestion familiale et des conseillers financiers.",
    ),
    cta1: l("Meet the team", "Rencontrer l’équipe"),
    cta2: l("Contact us", "Nous joindre"),
    people: l("people", "personnes"),
    phd: l("PhDs in physics", "doctorats en physique"),
    cfa: l("CFA charterholders", "titulaires de la charte CFA"),
    since: l("founded in Montreal", "fondée à Montréal"),
  },
  intro: {
    eyebrow: l("Who we are", "Qui nous sommes"),
    title: l("A research-driven", "Une firme de gestion"),
    accent: l("investment firm", "axée sur la recherche"),
    p1: l(
      "Nymbus was founded in 2013 by Marc Rivet and Gabriel Cefaloni on a simple idea: fixed income markets generate far more data than a traditional team can analyze, and a scientific process can put that data to work for investors.",
      "Nymbus a été fondée en 2013 par Marc Rivet et Gabriel Cefaloni autour d’une idée simple : les marchés des titres à revenu fixe produisent bien plus de données qu’une équipe traditionnelle ne peut en analyser, et un processus scientifique peut mettre ces données au service des investisseurs.",
    ),
    p2: l(
      "Today, quantitative researchers with backgrounds in physics and computer science work alongside portfolio managers with decades of experience in fixed income and derivatives. Together they run systematic bond strategies, a multi-strategy fund and protection overlays, on technology built in-house.",
      "Aujourd’hui, des chercheurs quantitatifs formés en physique et en informatique travaillent aux côtés de gestionnaires de portefeuille qui comptent des décennies d’expérience en revenu fixe et en produits dérivés. Ensemble, ils gèrent des stratégies obligataires systématiques, un fonds multistratégies et des stratégies de protection, sur une technologie conçue à l’interne.",
    ),
    office: l("Montreal office", "Bureau de Montréal"),
    address: l("1002 Sherbrooke Street West, Suite 1900\nMontreal, Quebec H3A 3L6", "1002, rue Sherbrooke Ouest, bureau 1900\nMontréal (Québec) H3A 3L6"),
    directions: l("Directions", "Itinéraire"),
    facts: [
      [l("Founded", "Fondation"), l("2013, Montreal", "2013, Montréal")],
      [l("Signatory", "Signataire"), l("UN PRI, since 2018", "PRI de l’ONU, depuis 2018")],
      [l("Clients", "Clientèle"), l("Institutions, family offices, advisors", "Institutions, bureaux de gestion familiale, conseillers")],
    ] as [L, L][],
  },
  values: {
    eyebrow: l("Our values", "Nos valeurs"),
    title: l("What guides", "Ce qui guide"),
    accent: l("the way we work", "notre façon de travailler"),
    items: [
      { t: l("Innovation", "Innovation"), d: l("We keep testing new data, methods and technology, and adopt what our research supports.", "Nous testons sans cesse de nouvelles données, méthodes et technologies, et adoptons ce que notre recherche confirme.") },
      { t: l("Agility", "Agilité"), d: l("A lean structure lets us adapt to markets and put new research into production quickly.", "Une structure légère nous permet de nous adapter aux marchés et de mettre rapidement la recherche en production.") },
      { t: l("Accountability", "Responsabilité"), d: l("We are transparent about our methods and results, and take our fiduciary duty seriously.", "Nous sommes transparents sur nos méthodes et nos résultats, et prenons notre devoir fiduciaire au sérieux.") },
      { t: l("Integrity", "Intégrité"), d: l("Every decision is guided by ethical principles and by our clients’ best interests.", "Chaque décision est guidée par des principes éthiques et par l’intérêt de nos clients.") },
      { t: l("Collaboration", "Collaboration"), d: l("Scientists and market practitioners challenge each other’s ideas; better decisions come out of it.", "Scientifiques et praticiens des marchés confrontent leurs idées; les décisions n’en sont que meilleures.") },
    ],
  },
  milestones: {
    eyebrow: l("Milestones", "Jalons"),
    title: l("Our story", "Notre parcours"),
    accent: l("so far", "à ce jour"),
    items: [
      { y: "2013", t: l("Nymbus is founded", "Fondation de Nymbus"), d: l("Marc Rivet and Gabriel Cefaloni found the firm in Montreal and start building systematic fixed income models.", "Marc Rivet et Gabriel Cefaloni fondent la firme à Montréal et commencent à bâtir des modèles systématiques de revenu fixe.") },
      { y: "2018", t: l("UN PRI signatory", "Signataire des PRI de l’ONU"), d: l("Nymbus signs the Principles for Responsible Investment.", "Nymbus signe les Principes pour l’investissement responsable.") },
      { y: "2021", t: l("Monthly Income fund launched", "Lancement du Fonds Revenu Mensuel"), d: l("The Nymbus Monthly Income Fund is launched.", "Le Fonds Nymbus Revenu Mensuel est lancé.") },
      { y: "2023", t: l("Partnership with Dans la rue", "Partenariat avec Dans la rue"), d: l("Nymbus supports Dans la rue, which helps homeless and at-risk youth in Montreal.", "Nymbus soutient Dans la rue, qui vient en aide aux jeunes sans-abri ou à risque de Montréal.") },
      { y: "2024", t: l("Tobacco-Free Finance Pledge", "Engagement pour une finance sans tabac"), d: l("Nymbus commits to excluding tobacco companies from all of its portfolios.", "Nymbus s’engage à exclure les entreprises du tabac de tous ses portefeuilles.") },
      { y: "2025", t: l("Partnership with Mageska Capital", "Partenariat avec Mageska Capital"), d: l("Mageska entrusts Nymbus with a portion of the Mageska Fund to implement a portable alpha strategy.", "Mageska confie à Nymbus une partie du Fonds Mageska pour mettre en œuvre une stratégie d’alpha portable.") },
    ],
  },
  people: {
    eyebrow: l("Our team", "Notre équipe"),
    title: l("The people", "Les gens"),
    accent: l("behind the science", "derrière la science"),
    lead: l(
      "A multidisciplinary team of investment professionals, quantitative researchers and operations specialists. Select a person to read their biography.",
      "Une équipe multidisciplinaire de professionnels du placement, de chercheurs quantitatifs et de spécialistes des opérations. Choisissez une personne pour lire sa biographie.",
    ),
    filter: l("Filter by department", "Filtrer par service"),
    showing: l("{n} people shown", "{n} personnes affichées"),
    open: l("Read the biography of", "Lire la biographie de"),
    bio: l("Biography", "Biographie"),
    edu: l("Education", "Formation"),
    prev: l("Previous roles", "Postes précédents"),
    close: l("Close", "Fermer"),
    depts: [
      { key: "all", label: l("Everyone", "Tout le monde") },
      { key: "Leadership", label: l("Leadership", "Direction") },
      { key: "Quantitative Research", label: l("Quantitative research", "Recherche quantitative") },
      { key: "Investment Team", label: l("Investment team", "Équipe de placement") },
      { key: "Operations", label: l("Operations", "Opérations") },
      { key: "Board", label: l("Board", "Conseil") },
    ] as { key: Department | "all"; label: L }[],
  },
  join: {
    title: l("Work", "Travailler"),
    accent: l("with us", "avec nous"),
    text: l(
      "We are always glad to hear from researchers, engineers and investment professionals who want to apply science to markets, and from investors who want to learn more.",
      "Nous sommes toujours heureux d’entendre des chercheurs, des ingénieurs et des professionnels du placement qui veulent appliquer la science aux marchés, ainsi que des investisseurs qui souhaitent en savoir plus.",
    ),
    careers: l("Send us your résumé", "Envoyez-nous votre CV"),
    careersSubject: l("Careers", "Carrières"),
    contact: l("Contact us", "Nous joindre"),
  },
};
