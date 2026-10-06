import type { Metadata } from "next";
import { Sustainability } from "@/components/site/pages/Sustainability";
import { SU } from "@/components/site/pages/sustainability.copy";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: SU.meta.title[locale], description: SU.meta.description[locale], alternates: { canonical: "/sustainability" } };
}

export default function Page() {
  return <Sustainability />;
}
