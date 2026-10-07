/**
 * Public site layout (route group: URLs are unchanged). Wraps every public page in the site chrome.
 * The admin (/admin) sits outside this group and keeps its own layout.
 */
import { SiteShell } from "@/components/site/SiteShell";
import { getLocale } from "@/lib/i18n/server";
import { getPublicContent, getSiteTexts } from "@/lib/cms";
import { contactOverrides } from "@/lib/cms/map";
import { AnnouncementBanner } from "@/components/site/cms/AnnouncementBanner";
import { hiddenFundKeys } from "@/config/funds-public";
import "@/components/site/kit.css";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [locale, content, texts] = await Promise.all([
    getLocale(),
    getPublicContent().catch(() => null),
    getSiteTexts(),
  ]);
  // admin firm disclaimer (settings) replaces the boilerplate firm text in the footer when set
  // fund-specific footer paragraphs are omitted for funds hidden in the admin
  const hiddenFunds = hiddenFundKeys(content);
  // footer contact details: WordPress values where set, else the built-in ones
  const contact = contactOverrides(texts);
  return (
    <SiteShell
      locale={locale}
      firmDisclaimer={content?.firm.disclaimer ?? null}
      hiddenFunds={hiddenFunds}
      contact={contact}
    >
      <AnnouncementBanner text={content?.firm.announcement} />
      {children}
    </SiteShell>
  );
}
