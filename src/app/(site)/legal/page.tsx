import type { Metadata } from "next";
import { Legal } from "@/components/site/pages/Legal";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const fr = (await getLocale()) === "fr";
  return {
    title: fr ? "Juridique" : "Legal",
    description: fr
      ? "Politique de traitement des plaintes et code d’éthique de Nymbus Capital Inc."
      : "Complaints policy and code of ethics of Nymbus Capital Inc.",
    alternates: { canonical: "/legal" },
  };
}

export default function Page() {
  return <Legal />;
}
