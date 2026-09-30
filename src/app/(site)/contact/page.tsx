import type { Metadata } from "next";
import { Contact } from "@/components/site/pages/Contact";
import { CT } from "@/components/site/pages/copy-contact";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: CT.meta.title[locale], description: CT.meta.description[locale], alternates: { canonical: "/contact" } };
}

export default function Page() {
  return <Contact />;
}
