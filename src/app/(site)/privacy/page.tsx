import type { Metadata } from "next";
import { Privacy } from "@/components/site/pages/Legal";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const fr = (await getLocale()) === "fr";
  return {
    title: fr ? "Politique de confidentialité" : "Privacy policy",
    description: fr ? "Comment Nymbus Capital Inc. protège vos renseignements personnels." : "How Nymbus Capital Inc. protects your personal information.",
    alternates: { canonical: "/privacy" },
  };
}

export default function Page() {
  return <Privacy />;
}
