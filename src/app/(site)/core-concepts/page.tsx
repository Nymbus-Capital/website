import type { Metadata } from "next";
import { CoreConcepts } from "@/components/site/concepts/CoreConcepts";
import { CC } from "@/components/site/concepts/concepts.copy";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: CC.meta.title[locale],
    description: CC.meta.description[locale],
    alternates: { canonical: "/core-concepts" },
  };
}

export default function Page() {
  return <CoreConcepts />;
}
