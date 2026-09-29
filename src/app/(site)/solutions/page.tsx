import type { Metadata } from "next";
import { Solutions } from "@/components/site/pages/Solutions";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const fr = (await getLocale()) === "fr";
  return {
    title: fr ? "Solutions" : "Solutions",
    description: fr ? "Des stratégies systématiques pour les institutions, les family offices et les conseillers en placements." : "Systematic strategies for institutions, family offices and financial advisors.",
    alternates: { canonical: "/solutions" },
  };
}

export default function Page() {
  return <Solutions />;
}
