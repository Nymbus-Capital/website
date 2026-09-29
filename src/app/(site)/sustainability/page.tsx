import type { Metadata } from "next";
import { Sustainability } from "@/components/site/pages/Sustainability";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const fr = (await getLocale()) === "fr";
  return {
    title: fr ? "Durabilité" : "Sustainability",
    description: fr ? "L’investissement responsable intégré à un processus systématique : signataire des PRI, engagement sans tabac, solutions obligataires durables." : "Responsible investing woven into a systematic process: PRI signatory, tobacco-free pledge, sustainable bond solutions.",
    alternates: { canonical: "/sustainability" },
  };
}

export default function Page() {
  return <Sustainability />;
}
