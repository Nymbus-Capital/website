/**
 * Public site layout (route group: URLs are unchanged). Wraps every public page in the site chrome.
 * The admin (/admin) sits outside this group and keeps its own layout.
 */
import { SiteShell } from "@/components/site/SiteShell";
import { getLocale } from "@/lib/i18n/server";
import "@/components/site/site.css";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return <SiteShell locale={locale}>{children}</SiteShell>;
}
