import type { Metadata } from "next";
import { Solutions } from "@/components/site/pages/Solutions";
import { toHomeData } from "@/components/site/home/data";
import { getAllFundViews, getContent } from "@/lib/data/site";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const fr = (await getLocale()) === "fr";
  return {
    title: "Solutions",
    description: fr
      ? "Des stratégies systématiques pour les investisseurs institutionnels, les family offices et les conseillers en placement : véhicules offerts et stratégies adaptées."
      : "Systematic strategies for institutional investors, family offices and investment advisors: available vehicles and suitable strategies.",
    alternates: { canonical: "/solutions" },
  };
}

export default async function Page() {
  const [views, content] = await Promise.all([getAllFundViews(), getContent()]);
  return <Solutions data={toHomeData(views, content)} />;
}
