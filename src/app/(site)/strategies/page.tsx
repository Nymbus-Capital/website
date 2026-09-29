import type { Metadata } from "next";
import { StrategiesIndex } from "@/components/site/pages/StrategiesIndex";
import { toHomeData } from "@/components/site/home/data";
import { getAllFundViews, getContent } from "@/lib/data/site";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const fr = (await getLocale()) === "fr";
  return {
    title: fr ? "Stratégies" : "Strategies",
    description: fr
      ? "Revenu fixe systématique et stratégies non corrélées : revenu mensuel, obligations durables bonifiées, multistratégies et global minimum volatilité."
      : "Systematic fixed income and uncorrelated strategies: monthly income, sustainable enhanced bonds, multi-strategy and global minimum volatility.",
    alternates: { canonical: "/strategies" },
  };
}

export default async function StrategiesPage() {
  const [views, content] = await Promise.all([getAllFundViews(), getContent()]);
  return <StrategiesIndex data={toHomeData(views, content)} />;
}
