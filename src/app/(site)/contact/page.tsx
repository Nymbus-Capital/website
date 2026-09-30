import type { Metadata } from "next";
import { Contact } from "@/components/site/pages/Contact";
import { CT } from "@/components/site/pages/copy-contact";
import { getLocale } from "@/lib/i18n/server";
import { getContent } from "@/lib/data/site";
import { hiddenFundKeys } from "@/config/funds-public";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: CT.meta.title[locale], description: CT.meta.description[locale], alternates: { canonical: "/contact" } };
}

export default async function Page() {
  // funds hidden in the admin are not offered as an interest
  const content = await getContent().catch(() => null);
  const hiddenFunds = hiddenFundKeys(content);
  return <Contact hiddenFunds={hiddenFunds} />;
}
