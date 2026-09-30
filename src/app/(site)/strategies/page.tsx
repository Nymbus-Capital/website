import type { Metadata } from "next";
import { StrategiesIndex } from "@/components/site/pages/StrategiesIndex";
import { toHomeData } from "@/components/site/home/data";
import { getAllFundViews, getContent } from "@/lib/data/site";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const fr = (await getLocale()) === "fr";
  return {
    title: fr ? "Nos fonds et stratégies" : "Our funds and strategies",
    description: fr
      ? "Revenu fixe systématique et stratégies alternatives : Revenu Mensuel, Obligations Durables Bonifiées, Multistratégies et Global Minimum Volatilité, avec leurs rendements publiés."
      : "Systematic fixed income and alternative strategies: Monthly Income, Sustainable Enhanced Bonds, Multi-Strategy and Global Minimum Volatility, with their published returns.",
    alternates: { canonical: "/strategies" },
  };
}

export default async function StrategiesPage() {
  const [views, content] = await Promise.all([getAllFundViews(), getContent()]);
  return <StrategiesIndex data={toHomeData(views, content)} />;
}
