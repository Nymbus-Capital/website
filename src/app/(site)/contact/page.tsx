import type { Metadata } from "next";
import { Contact } from "@/components/site/pages/Contact";
import { getLocale } from "@/lib/i18n/server";
import { submitContact } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const fr = (await getLocale()) === "fr";
  return {
    title: fr ? "Contact" : "Contact",
    description: fr ? "Joignez l’équipe de Nymbus Capital à Montréal." : "Reach the Nymbus Capital team in Montreal.",
    alternates: { canonical: "/contact" },
  };
}

export default function Page() {
  return <Contact action={submitContact} />;
}
