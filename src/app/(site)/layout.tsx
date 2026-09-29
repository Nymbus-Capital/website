/**
 * Public site layout (route group: URLs are unchanged). Wraps every public page in the site chrome.
 * The admin (/admin) sits outside this group and keeps its own layout.
 */
import { SiteShell } from "@/components/site/SiteShell";
import { getLocale } from "@/lib/i18n/server";
import { getContent } from "@/lib/data/site";
import "@/components/site/site.css";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [locale, content] = await Promise.all([getLocale(), getContent().catch(() => null)]);
  // admin firm disclaimer (settings) replaces the boilerplate firm text in the footer when set
  return <SiteShell locale={locale} firmDisclaimer={content?.firm.disclaimer ?? null}>{children}</SiteShell>;
}
