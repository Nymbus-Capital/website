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
      "Nymbus Capital, Montreal portfolio manager founded in 2013: scientists and market veterans building systematic strategies. Meet the team.",
      "Nymbus Capital, gestionnaire de portefeuille montréalais fondé en 2013 : des scientifiques et des vétérans des marchés qui bâtissent des stratégies systématiques. Rencontrez l’équipe.",
    ),
  },
  hero: {
    eyebrow: l("About Nymbus", "À propos de Nymbus"),
    title: l("Scientists", "Des scientifiques"),
    accent: l("and market veterans", "et des vétérans des marchés"),
    lead: l(
      "Independent Montreal portfolio manager, since 2013.",
      "Gestionnaire de portefeuille indépendant à Montréal, depuis 2013.",
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
      "Founded in 2013 by Marc Rivet and Gabriel Cefaloni.",
      "Fondée en 2013 par Marc Rivet et Gabriel Cefaloni.",
    ),
    points: [
      l("Bond markets produce more data than a team can analyze", "Les marchés obligataires produisent plus de données qu’une équipe ne peut en analyser"),
      l("A scientific process puts that data to work", "Un processus scientifique met ces données à profit"),
      l("Physicists and computer scientists, alongside fixed income managers", "Physiciens et informaticiens, aux côtés de gestionnaires en revenu fixe"),
    ] as L[],
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
      { t: l("Accountability", "Responsabilité"), d: l("Transparent methods. Fiduciary duty first.", "Des méthodes transparentes. Le devoir fiduciaire d’abord.") },
      { t: l("Integrity", "Intégrité"), d: l("Clients’ interests first.", "L’intérêt des clients d’abord.") },
      { t: l("Collaboration", "Collaboration"), d: l("Scientists and practitioners challenge each other.", "Scientifiques et praticiens confrontent leurs idées.") },
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
    lead: l("Select a person to read their biography.", "Choisissez une personne pour lire sa biographie."),
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
      "Researchers, engineers and investors: write to us.",
      "Chercheurs, ingénieurs et investisseurs : écrivez-nous.",
    ),
    careers: l("Send us your résumé", "Envoyez-nous votre CV"),
    careersSubject: l("Careers", "Carrières"),
    contact: l("Contact us", "Nous joindre"),
  },
};
