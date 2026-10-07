"use client";
/**
 * Announcement banner (text from the website admin or from WordPress, plain text, EN/FR). Rendered above the page
 * content of every public page when there is text; nothing when there is none.
 */
import { useTranslation } from "@/lib/i18n";
import "./cms.css";

export function AnnouncementBanner({ text }: { text: { en: string; fr: string } | null | undefined }) {
  const { locale, pick } = useTranslation();
  const msg = text ? pick(text).trim() : "";
  if (!msg) return null;
  return (
    <div
      className="cms-banner"
      role="region"
      aria-label={locale === "fr" ? "Annonce" : "Announcement"}
      data-testid="announcement-banner"
    >
      <div className="container">
        <p style={{ margin: 0 }}>{msg}</p>
      </div>
    </div>
  );
}
