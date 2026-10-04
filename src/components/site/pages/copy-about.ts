/**
 * /team ("About" in the navigation) copy, EN / FR. Firm introduction, values (from the previous site's
 * unused src/data/timeline.ts, rewritten and translated), verifiable milestones only (the old timeline mixed
 * inconsistent AUM figures and launch dates: see docs/site-rebuild.md), and the people (src/data/team.ts).
 */
import { l, type L } from "../../../lib/i18n/config.ts";
import type { Department } from "../../../data/team.ts";

export const AB = {
  meta: {
    title: l("About us", "À propos"),
    description: l(
      "Nymbus Capital, Montreal portfolio manager founded in 2013: scientists, engineers and market veterans building systematic fixed income and protective overlay strategies. Meet the team.",
      "Nymbus Capital, gestionnaire de portefeuille montréalais fondé en 2013 : des scientifiques, des développeurs et des vétérans des marchés qui bâtissent des stratégies systématiques de revenu fixe et de superposition protectrice sur contrats à terme. Rencontrez l’équipe.",
    ),
  },
  hero: {
    eyebrow: l("About Nymbus", "À propos de Nymbus"),
    title: l("Scientists", "Des scientifiques"),
    accent: l("and market veterans", "et des vétérans des marchés"),
    lead: l(
      "Systematic fixed income and protective overlays, from Montreal, since 2013.",
      "Revenu fixe systématique et superpositions protectrices, à Montréal, depuis 2013.",
    ),
    cta1: l("Meet the team", "Rencontrer l’équipe"),
    cta2: l("Contact us", "Nous joindre"),
    people: l("people", "personnes"),
    since: l("founded in Montreal", "fondée à Montréal"),
  },
  creds: {
    eyebrow: l("Credentials", "Titres et diplômes"),
    title: l("Scientists, engineers", "Scientifiques, développeurs"),
    accent: l("and market veterans", "et vétérans des marchés"),
    lead: l(
      "The scientific method, applied to bonds and futures.",
      "La méthode scientifique, appliquée aux obligations et aux contrats à terme.",
    ),
    phd: l("PhDs", "doctorats"),
    eng: l("Engineering & computer-science degrees", "diplômes en génie et en informatique"),
    grad: l("Master’s and doctoral degrees", "maîtrises et doctorats"),
    charter: l("CFA or CIM holders", "titulaires de titres CFA ou CIM"),
    years: l("Years of combined experience", "années d’expérience cumulées"),
    note: l(
      "Counted from the team list below, board included; “+” marks a lower bound.",
      "Dénombrés à partir de la liste de l’équipe ci-dessous, conseil compris; « + » indique un minimum.",
    ),
  },
  intro: {
    eyebrow: l("Who we are", "Qui nous sommes"),
    title: l("A research-driven", "Une firme de gestion"),
    accent: l("investment firm", "axée sur la recherche"),
    p1: l(
      "Founded in 2013 by Marc Rivet and Gabriel Cefaloni.",
      "Fondée en 2013 par Marc Rivet et Gabriel Cefaloni.",
    ),
    points: [
      l("Two specialties: systematic fixed income and protective overlays", "Deux spécialités : revenu fixe systématique et superpositions protectrices"),
      l("Bonds analyzed one by one; futures traded systematically", "Des obligations analysées une à une; des contrats à terme négociés systématiquement"),
      l("Scientists, engineers and market veterans, side by side", "Scientifiques, développeurs et vétérans des marchés, côte à côte"),
    ] as L[],
    /** qualifier of the "protective" name (compliance: kept wherever the overlay is named) */
    overlayNote: l(
      "Protective overlays are designed to offset part of losses; they may not do so and can lose money.",
      "Les superpositions protectrices sont conçues pour compenser une partie des pertes; elles peuvent ne pas y parvenir et peuvent subir des pertes.",
    ),
    office: l("Montreal office", "Bureau de Montréal"),
    address: l("1002 Sherbrooke Street West, Suite 1900\nMontreal, Quebec H3A 3L6", "1002, rue Sherbrooke Ouest, bureau 1900\nMontréal (Québec) H3A 3L6"),
    directions: l("Directions", "Itinéraire"),
    facts: [
      [l("Founded", "Fondation"), l("2013, Montreal", "2013, Montréal")],
      [l("Signatory", "Signataire"), l("PRI, since 2018", "PRI, depuis 2018")],
    ] as [L, L][],
  },
  values: {
    eyebrow: l("Our values", "Nos valeurs"),
    title: l("What guides", "Ce qui guide"),
    accent: l("the way we work", "notre façon de travailler"),
    items: [
      { t: l("Innovation", "Innovation"), d: l("We adopt what research supports.", "Nous adoptons ce que la recherche confirme.") },
      { t: l("Agility", "Agilité"), d: l("Research reaches production quickly.", "La recherche passe vite en production.") },
      { t: l("Accountability", "Responsabilité"), d: l("Transparent methods, fiduciary duty first.", "Méthodes transparentes, devoir fiduciaire d’abord.") },
      { t: l("Integrity", "Intégrité"), d: l("Clients’ interests first.", "L’intérêt des clients d’abord.") },
      { t: l("Collaboration", "Collaboration"), d: l("Scientists and practitioners, challenging each other.", "Scientifiques et praticiens confrontent leurs idées.") },
    ],
  },
  milestones: {
    eyebrow: l("Milestones", "Jalons"),
    title: l("Our story", "Notre parcours"),
    accent: l("so far", "à ce jour"),
    items: [
      { y: "2013", t: l("Nymbus is founded", "Fondation de Nymbus") },
      { y: "2018", t: l("PRI signatory", "Signataire des PRI") },
      { y: "2021", t: l("Monthly Income fund launched", "Lancement du Fonds Revenu Mensuel") },
      { y: "2023", t: l("Partnership with Dans la rue", "Partenariat avec Dans la rue"), d: l("Support for youth at risk.", "Soutien aux jeunes à risque.") },
      { y: "2024", t: l("Tobacco-Free Finance Pledge", "Engagement pour une finance sans tabac") },
      { y: "2025", t: l("Partnership with Mageska Capital", "Partenariat avec Mageska Capital"), d: l("A portable alpha strategy.", "Une stratégie d’alpha portable.") },
    ],
  },
  people: {
    eyebrow: l("Our team", "Notre équipe"),
    title: l("The people", "Les gens"),
    accent: l("behind the science", "derrière la science"),
    lead: l("Select a person for their biography.", "Choisissez une personne pour sa biographie."),
    filter: l("Filter by department", "Filtrer par service"),
    showing: l("{n} people shown", "{n} personnes affichées"),
    open: l("Read the biography of", "Lire la biographie de"),
    bio: l("Biography", "Biographie"),
    edu: l("Education", "Formation"),
    prev: l("Previous roles", "Postes précédents"),
    linkedin: l("LinkedIn profile", "Profil LinkedIn"),
    newTab: l("(opens in a new tab)", "(s’ouvre dans un nouvel onglet)"),
    exp: l("{n} years of experience", "{n} ans d’expérience"),
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
      "Researchers, engineers and investors: write to us.",
      "Chercheurs, développeurs et investisseurs : écrivez-nous.",
    ),
    careers: l("Send us your résumé", "Envoyez-nous votre CV"),
    careersSubject: l("Careers", "Carrières"),
    contact: l("Contact us", "Nous joindre"),
  },
};
