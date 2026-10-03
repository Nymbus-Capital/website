import type { Metadata } from "next";
import { Solutions } from "@/components/site/pages/Solutions";
import { toHomeData } from "@/components/site/home/data";
import { getAllFundViews, getContent } from "@/lib/data/site";
import { getLocale } from "@/lib/i18n/server";
import { AdvisorRankingsProvider } from "@/components/site/AdvisorRankings";
import { advisorRankingItems } from "@/lib/rankings/advisor";
import { policyMonths } from "@/lib/rankings/policy";
import { resolveBrandAssets } from "@/lib/data/brand-assets";

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
  const [views, content, brand] = await Promise.all([getAllFundViews(), getContent(), resolveBrandAssets()]);
  // confirmed, fresh third-party rankings for the advisors section (drafts and stale entries stay on the server)
  const rankings = advisorRankingItems(
    views.filter((v) => v.spec.vehicle === "fund").map((v) => ({ key: v.spec.key, name: v.spec.name, classes: v.spec.classes, content: v.content })),
    { now: new Date(), months: policyMonths(content), brand },
  );
  return (
    <AdvisorRankingsProvider items={rankings}>
      <Solutions data={toHomeData(views, content)} />
    </AdvisorRankingsProvider>
  );
}
