import type { Metadata } from "next";
import { Approach } from "@/components/site/pages/Approach";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const fr = (await getLocale()) === "fr";
  return {
    title: fr ? "Approche" : "Approach",
    description: fr ? "L’investissement scientifique en revenu fixe : un processus à deux systèmes (positionnement macro, sélection de titres) et une stratégie de protection non corrélée." : "Scientific investing in fixed income: a two-system process (macro positioning, security selection) and an uncorrelated protection overlay.",
    alternates: { canonical: "/approach" },
  };
}

export default function Page() {
  return <Approach />;
}
