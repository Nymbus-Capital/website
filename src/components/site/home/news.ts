/**
 * News and milestones, from the previous site (origin/main src/data/news.ts, English only), translated to French
 * and trimmed to the facts. The old images and "read on nymbus.ca" links pointed at the WordPress site that this
 * site replaces on www.nymbus.ca, so they are not used (the cards carry an illustration by category instead).
 */
import { l, type L } from "@/lib/i18n";

export type NewsCategory = "partnership" | "esg" | "recognition" | "community";

export interface NewsItem {
  id: string;
  /** ISO date of the announcement */
  date: string;
  category: NewsCategory;
  title: L;
  summary: L;
  /** full text, paragraphs separated by a blank line */
  body: L;
}

export const NEWS_CATEGORY: Record<NewsCategory, L> = {
  partnership: l("Partnership", "Partenariat"),
  esg: l("ESG", "ESG"),
  recognition: l("Recognition", "Reconnaissance"),
  community: l("Community", "Communauté"),
};

export const NEWS: NewsItem[] = [
  {
    id: "mageska",
    date: "2025-01-28",
    category: "partnership",
    title: l("Mageska Capital and Nymbus Capital announce a partnership", "Mageska Capital et Nymbus Capital annoncent un partenariat"),
    summary: l(
      "Mageska entrusts Nymbus with a portion of the Mageska Fund to implement a portable alpha strategy.",
      "Mageska confie à Nymbus la gestion d’une portion du Fonds Mageska afin d’y mettre en œuvre une stratégie d’alpha portable.",
    ),
    body: l(
      "Mageska Capital Inc., an investment management firm, announced a partnership with Nymbus Capital Inc., an asset manager known for its systematic strategies and rigorous risk management.\n\nUnder this agreement, Mageska Capital entrusts Nymbus Capital with the management of a specific portion of the Mageska Fund to implement a portable alpha strategy. The collaboration draws on Nymbus Capital’s expertise in low-volatility strategies that are uncorrelated with traditional indices, with the aim of improving the fund’s overall return potential while reducing its correlation with its benchmark.\n\nBoth firms share an approach to investing that combines innovation, technology and discipline.",
      "Mageska Capital inc., une société de gestion de placements, a annoncé un partenariat avec Nymbus Capital inc., un gestionnaire d’actifs reconnu pour ses stratégies systématiques et sa gestion rigoureuse des risques.\n\nAux termes de cette entente, Mageska Capital confie à Nymbus Capital la gestion d’une portion déterminée du Fonds Mageska afin d’y mettre en œuvre une stratégie d’alpha portable. La collaboration s’appuie sur l’expertise de Nymbus Capital en stratégies à faible volatilité, non corrélées aux indices traditionnels, dans le but d’améliorer le potentiel de rendement global du fonds tout en réduisant sa corrélation avec son indice de référence.\n\nLes deux firmes partagent une approche du placement qui allie innovation, technologie et discipline.",
    ),
  },
  {
    id: "tobacco-free",
    date: "2024-04-23",
    category: "esg",
    title: l("Nymbus becomes a signatory of the Tobacco-Free Finance Pledge", "Nymbus devient signataire du Tobacco-Free Finance Pledge"),
    summary: l(
      "Nymbus commits to excluding tobacco companies from all of its portfolios.",
      "Nymbus s’engage à exclure les entreprises du tabac de tous ses portefeuilles.",
    ),
    body: l(
      "Nymbus has become a signatory of the Tobacco-Free Finance Pledge led by Tobacco Free Portfolios, and is committed to excluding tobacco companies from all of its portfolios.\n\nPublic health programs around the world spend billions every year treating cancer, emphysema, heart disease and other illnesses linked to tobacco use. We believe institutional investors and asset managers can play an active role in the global effort against tobacco.\n\nTobacco-related illnesses cause some eight million deaths worldwide each year. Global, multi-stakeholder collaboration is needed to address its impact on society and on the environment.",
      "Nymbus est devenue signataire du Tobacco-Free Finance Pledge, mené par Tobacco Free Portfolios, et s’engage à exclure les entreprises du tabac de tous ses portefeuilles.\n\nPartout dans le monde, les programmes de santé publique consacrent chaque année des milliards au traitement du cancer, de l’emphysème, des maladies cardiaques et d’autres maladies liées au tabagisme. Nous croyons que les investisseurs institutionnels et les gestionnaires d’actifs peuvent jouer un rôle actif dans la lutte mondiale contre le tabac.\n\nLes maladies liées au tabac causent quelque huit millions de décès chaque année dans le monde. Une collaboration mondiale entre toutes les parties prenantes est nécessaire pour en limiter les effets sur la société et sur l’environnement.",
    ),
  },
  {
    id: "rbc-study",
    date: "2023-11-16",
    category: "recognition",
    title: l("Nymbus fixed income strategies ranked in the RBC fund study", "Les stratégies de revenu fixe de Nymbus classées dans l’étude de fonds de RBC"),
    summary: l(
      "All three fixed income strategies managed by Nymbus ranked in the top percentiles of the RBC fund study.",
      "Les trois stratégies de revenu fixe gérées par Nymbus se sont classées dans les premiers centiles de l’étude de fonds de RBC.",
    ),
    body: l(
      "All three fixed income strategies managed by Nymbus Capital were ranked in the top percentiles of the RBC fund study, an analysis of Canadian investment fund performance.\n\nThe strategies share the same disciplined, quantitative approach to fixed income: systematic credit analysis combined with rigorous risk management. Past performance may not be repeated.",
      "Les trois stratégies de revenu fixe gérées par Nymbus Capital se sont classées dans les premiers centiles de l’étude de fonds de RBC, une analyse du rendement des fonds de placement canadiens.\n\nCes stratégies partagent la même approche quantitative et disciplinée du revenu fixe : une analyse systématique du crédit alliée à une gestion rigoureuse des risques. Le rendement passé pourrait ne pas se reproduire.",
    ),
  },
  {
    id: "dans-la-rue",
    date: "2023-10-03",
    category: "community",
    title: l("Nymbus partners with Dans la rue", "Nymbus s’associe à Dans la rue"),
    summary: l(
      "A partnership with the Montreal organization that supports homeless and at-risk youth.",
      "Un partenariat avec l’organisme montréalais qui vient en aide aux jeunes en situation d’itinérance ou à risque.",
    ),
    body: l(
      "Nymbus Capital has partnered with Dans la rue, a Montreal organization dedicated to supporting homeless and at-risk youth.\n\nSince 1988, Dans la rue has helped young people in difficulty leave the street and build a better future, with services that include emergency shelter, food, counselling and educational support.\n\nThis partnership reflects our commitment to our community, beyond the financial markets.",
      "Nymbus Capital s’est associée à Dans la rue, un organisme montréalais qui vient en aide aux jeunes en situation d’itinérance ou à risque.\n\nDepuis 1988, Dans la rue aide les jeunes en difficulté à quitter la rue et à se bâtir un meilleur avenir, grâce à des services d’hébergement d’urgence, d’alimentation, d’accompagnement et de soutien scolaire.\n\nCe partenariat témoigne de notre engagement envers notre communauté, au-delà des marchés financiers.",
    ),
  },
];
