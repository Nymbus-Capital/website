import type { Metadata } from "next";
import { Contact } from "@/components/site/pages/Contact";
import { CT } from "@/components/site/pages/contact.copy";
import { getLocale } from "@/lib/i18n/server";
import { getContent } from "@/lib/data/site";
import { hiddenFundKeys } from "@/config/funds-public";
import { getSiteTexts } from "@/lib/cms";
import { contactOverrides } from "@/lib/cms/map";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: CT.meta.title[locale], description: CT.meta.description[locale], alternates: { canonical: "/contact" } };
}

export default async function Page() {
  // funds hidden in the admin are not offered as an interest
  const [content, texts] = await Promise.all([getContent().catch(() => null), getSiteTexts()]);
  const hiddenFunds = hiddenFundKeys(content);
  // address, phone and e-mail from WordPress where set, else the built-in ones
  return <Contact hiddenFunds={hiddenFunds} contact={contactOverrides(texts)} />;
}
