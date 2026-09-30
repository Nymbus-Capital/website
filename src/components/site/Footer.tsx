"use client";
/**
 * Footer (structure of the previous site): brand + description + address, then Strategies · Company · Resources,
 * the regulatory disclaimers (src/content/disclaimers.ts, firm text overridable in the admin), copyright, LinkedIn, PRI.
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { footerDisclaimers } from "@/content/disclaimers";
import { Logo } from "./Logo";
import { CONTACT, FUND_LINKS } from "./links";

export function Footer({ firmDisclaimer = null, hiddenFunds = [] }: { firmDisclaimer?: { en: string; fr: string } | null; hiddenFunds?: string[] }) {
  const { t, pick } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="footer" data-testid="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" aria-label={t("nav.homeLink")}><Logo /></Link>
            <p>{t("footer.description")}</p>
            <address>
              <span style={{ whiteSpace: "pre-line" }}>{t("footer.address")}</span>
              <a href={`tel:${CONTACT.phone}`}>{t("footer.phone")}</a>
              <span>{t("footer.tollFree")}</span>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </address>
          </div>
          <div className="footer-col">
            <h2>{t("footer.strategies")}</h2>
            <ul>
              {FUND_LINKS.filter((f) => !hiddenFunds.includes(f.key)).map((f) => (
                <li key={f.href}>
                  <Link href={f.href}><i style={{ background: `linear-gradient(135deg, ${f.color.from}, ${f.color.to})` }} aria-hidden="true" />{pick(f.short)}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h2>{t("footer.firm")}</h2>
            <ul>
              <li><Link href="/team">{t("footer.about")}</Link></li>
              <li><Link href="/approach">{t("nav.approach")}</Link></li>
              <li><Link href="/sustainability">{t("nav.sustainability")}</Link></li>
              <li><Link href="/solutions">{t("nav.solutions")}</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h2>{t("footer.legal")}</h2>
            <ul>
              <li><Link href="/contact">{t("nav.contact")}</Link></li>
              <li><Link href="/privacy">{t("footer.privacy")}</Link></li>
              <li><Link href="/legal">{t("footer.legalPage")}</Link></li>
              <li><a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">{t("footer.linkedin")} <ArrowUpRight size={13} aria-hidden="true" /></a></li>
            </ul>
          </div>
        </div>

        {/* regulatory boilerplate: src/content/disclaimers.ts (compliance review); firm text overridable in the admin */}
        <div className="footer-disc" id="disclaimers" data-testid="footer-disclaimers">
          {footerDisclaimers(firmDisclaimer, hiddenFunds).map((d, i) => <p key={i}>{pick(d)}</p>)}
        </div>
        <div className="footer-bottom">
          <span>© {year} {t("footer.rights")}</span>
          <span>{t("footer.pri")}</span>
        </div>
      </div>
    </footer>
  );
}
