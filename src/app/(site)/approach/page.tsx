import type { Metadata } from "next";
import { Approach } from "@/components/site/pages/Approach";
import { AP } from "@/components/site/pages/copy-approach";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: AP.meta.title[locale], description: AP.meta.description[locale], alternates: { canonical: "/approach" } };
}

export default function Page() {
  return <Approach />;
}
