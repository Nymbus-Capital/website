import type { Metadata } from "next";
import { Sustainability } from "@/components/site/pages/Sustainability";
import { SU } from "@/components/site/pages/sustainability.copy";
import { getLocale } from "@/lib/i18n/server";
import { getSiteTexts } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: SU.meta.title[locale],
    description: SU.meta.description[locale],
    alternates: { canonical: "/sustainability" },
  };
}

export default async function Page() {
  const texts = await getSiteTexts();
  return <Sustainability intro={texts.pageIntros?.sustainability} />;
}
