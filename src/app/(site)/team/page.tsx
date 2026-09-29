import type { Metadata } from "next";
import { Team } from "@/components/site/pages/Team";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const fr = (await getLocale()) === "fr";
  return {
    title: fr ? "Équipe" : "Team",
    description: fr ? "Des scientifiques et des vétérans des marchés : rencontrez l’équipe de Nymbus Capital." : "Scientists and market veterans: meet the Nymbus Capital team.",
    alternates: { canonical: "/team" },
  };
}

export default function Page() {
  return <Team />;
}
