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
      "Part of the Mageska Fund, managed with a portable alpha strategy.",
      "Une partie du Fonds Mageska, gérée selon une stratégie d’alpha portable.",
    ),
    body: l(
      "Mageska Capital entrusted Nymbus with the mandate: a portable alpha strategy using Nymbus’ low-volatility strategies, designed to have low correlation with traditional indices.",
      "Mageska Capital a confié le mandat à Nymbus : une stratégie d’alpha portable fondée sur les stratégies à faible volatilité de Nymbus, conçues pour avoir une faible corrélation avec les indices traditionnels.",
    ),
  },
  {
    id: "tobacco-free",
    date: "2024-04-23",
    category: "esg",
    title: l("Nymbus becomes a signatory of the Tobacco-Free Finance Pledge", "Nymbus devient signataire de l’Engagement pour une finance sans tabac"),
    summary: l(
      "A commitment by the firm to an initiative led by Tobacco Free Portfolios.",
      "Un engagement de la firme envers une initiative menée par Tobacco Free Portfolios.",
    ),
    body: l(
      "Nymbus signed the Tobacco-Free Finance Pledge, led by Tobacco Free Portfolios.",
      "Nymbus a signé l’Engagement pour une finance sans tabac (Tobacco-Free Finance Pledge), mené par Tobacco Free Portfolios.",
    ),
  },
  {
    id: "dans-la-rue",
    date: "2023-10-03",
    category: "community",
    title: l("Nymbus partners with Dans la rue", "Nymbus s’associe à Dans la rue"),
    summary: l(
      "Supporting homeless and at-risk youth in Montreal.",
      "Pour les jeunes en situation d’itinérance ou à risque de Montréal.",
    ),
    body: l(
      "Nymbus partners with Dans la rue, a Montreal organization supporting homeless and at-risk youth.\n\nSince 1988, Dans la rue has offered emergency shelter, food, counselling and educational support.",
      "Nymbus s’associe à Dans la rue, un organisme montréalais qui vient en aide aux jeunes en situation d’itinérance ou à risque.\n\nDepuis 1988, Dans la rue offre hébergement d’urgence, alimentation, accompagnement et soutien scolaire.",
    ),
  },
];
