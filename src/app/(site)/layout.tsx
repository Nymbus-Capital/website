/**
 * Public site layout (route group: URLs are unchanged). Wraps every public page in the site chrome.
 * The admin (/admin) sits outside this group and keeps its own layout.
 */
import { SiteShell } from "@/components/site/SiteShell";
import { getLocale } from "@/lib/i18n/server";
import { getContent } from "@/lib/data/site";
import "@/components/site/kit.css";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [locale, content] = await Promise.all([getLocale(), getContent().catch(() => null)]);
  // admin firm disclaimer (settings) replaces the boilerplate firm text in the footer when set
  // fund-specific footer paragraphs are omitted for funds hidden in the admin
  const hiddenFunds = Object.entries(content?.funds ?? {}).filter(([, f]) => f?.hidden).map(([k]) => k);
  return <SiteShell locale={locale} firmDisclaimer={content?.firm.disclaimer ?? null} hiddenFunds={hiddenFunds}>{children}</SiteShell>;
}
