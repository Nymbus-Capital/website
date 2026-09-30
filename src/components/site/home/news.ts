/**
 * News and milestones, from the previous site (origin/main src/data/news.ts, English only), translated to French
 * and trimmed to the facts. The old images and "read on nymbus.ca" links pointed at the WordPress site that this
 * site replaces on www.nymbus.ca, so they are not used (the cards carry an illustration by category instead).
 */
import { l, type L } from "../../../lib/i18n/config.ts";

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
      "Mageska confie à Nymbus la gestion d’une partie du Fonds Mageska afin d’y mettre en œuvre une stratégie d’alpha portable.",
    ),
    body: l(
      "Mageska Capital Inc., an investment management firm, announced a partnership with Nymbus Capital Inc., a Montreal portfolio manager that runs systematic strategies.\n\nUnder this agreement, Mageska Capital entrusts Nymbus Capital with the management of a specific portion of the Mageska Fund to implement a portable alpha strategy. The mandate uses Nymbus Capital’s low-volatility strategies, which are designed to have low correlation with traditional indices.",
      "Mageska Capital inc., une société de gestion de placements, a annoncé un partenariat avec Nymbus Capital inc., un gestionnaire de portefeuille montréalais qui applique des stratégies systématiques.\n\nAux termes de cette entente, Mageska Capital confie à Nymbus Capital la gestion d’une partie déterminée du Fonds Mageska afin d’y mettre en œuvre une stratégie d’alpha portable. Le mandat fait appel aux stratégies à faible volatilité de Nymbus Capital, conçues pour avoir une faible corrélation avec les indices traditionnels.",
    ),
  },
  {
    id: "tobacco-free",
    date: "2024-04-23",
    category: "esg",
    title: l("Nymbus becomes a signatory of the Tobacco-Free Finance Pledge", "Nymbus devient signataire du Tobacco-Free Finance Pledge"),
    summary: l(
      "Nymbus commits to excluding tobacco companies from the securities it selects directly.",
      "Nymbus s’engage à exclure les entreprises du tabac des titres qu’elle sélectionne directement.",
    ),
    body: l(
      "Nymbus has become a signatory of the Tobacco-Free Finance Pledge led by Tobacco Free Portfolios, and is committed to excluding tobacco companies from the securities it selects directly.\n\nWe believe institutional investors and asset managers can play an active role in the global effort against tobacco.",
      "Nymbus est devenue signataire du Tobacco-Free Finance Pledge, mené par Tobacco Free Portfolios, et s’engage à exclure les entreprises du tabac des titres qu’elle sélectionne directement.\n\nNous croyons que les investisseurs institutionnels et les gestionnaires d’actifs peuvent jouer un rôle actif dans la lutte mondiale contre le tabac.",
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
