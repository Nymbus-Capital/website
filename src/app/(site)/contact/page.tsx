import type { Metadata } from "next";
import { Contact, type ContactStatus } from "@/components/site/pages/Contact";
import { CT } from "@/components/site/pages/contact.copy";
import { getLocale } from "@/lib/i18n/server";
import { getContent } from "@/lib/data/site";
import { hiddenFundKeys } from "@/config/funds-public";
import { getSiteTexts } from "@/lib/cms";
import { contactOverrides } from "@/lib/cms/map";
import { issueFormToken } from "@/lib/contact/token";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: CT.meta.title[locale], description: CT.meta.description[locale], alternates: { canonical: "/contact" } };
}

type Search = Promise<Record<string, string | string[] | undefined>>;

/** Result of a form post without JavaScript (POST /api/contact redirects to ?sent=1 or ?error=<code>). */
function statusOf(sp: Record<string, string | string[] | undefined>): ContactStatus {
  if (sp.sent === "1") return "sent";
  const e = typeof sp.error === "string" ? sp.error : "";
  if (!e) return null;
  return Object.hasOwn(CT.form.fail, e) ? (e as ContactStatus) : "error";
}

export default async function Page({ searchParams }: { searchParams: Search }) {
  // funds hidden in the admin are not offered as an interest
  const [content, texts, sp] = await Promise.all([getContent().catch(() => null), getSiteTexts(), searchParams]);
  const hiddenFunds = hiddenFundKeys(content);
  // address, phone and e-mail from WordPress where set, else the built-in ones; the form timing token is issued per render
  return <Contact hiddenFunds={hiddenFunds} contact={contactOverrides(texts)} formToken={issueFormToken()} initialStatus={statusOf(sp)} />;
}
