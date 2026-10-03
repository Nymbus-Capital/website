import type { Metadata } from "next";
import { CriticalConcepts } from "@/components/site/concepts/CriticalConcepts";
import { CC } from "@/components/site/concepts/concepts-copy";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: CC.meta.title[locale], description: CC.meta.description[locale], alternates: { canonical: "/critical-concepts" } };
}

export default function Page() {
  return <CriticalConcepts />;
}
