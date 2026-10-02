/**
 * Home. Reads the published data + admin content at request time (the pipeline refreshes it daily), then
 * hands plain JSON to the client page.
 */
import type { Metadata } from "next";
import { Home } from "@/components/site/home/Home";
import { toHomeData } from "@/components/site/home/data";
import { getAllFundViews } from "@/lib/data/site";
import { getNews, getPublicContent, getTeam } from "@/lib/cms";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const fr = (await getLocale()) === "fr";
  return {
    title: { absolute: fr ? "Nymbus Capital · Investissement scientifique" : "Nymbus Capital · Scientific investing" },
    description: fr
      ? "Gestionnaire de placements montréalais : stratégies de revenu fixe et alternatives bâties par la recherche quantitative et la construction systématique de portefeuilles."
      : "Montreal investment manager: fixed income and alternative strategies built with quantitative research and systematic portfolio construction.",
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const [views, content, team, news] = await Promise.all([getAllFundViews(), getPublicContent(), getTeam(), getNews()]);
  return <Home data={toHomeData(views, content, { teamSize: team.length })} news={news} />;
}
