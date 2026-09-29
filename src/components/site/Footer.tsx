"use client";
/**
 * Footer: a black screen closing the stage. Wordmark, strategies (each in its colour), firm links,
 * contact, legal. The deck's glowing gradient bar marks the top.
 */
import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Logo } from "./Logo";
import { CONTACT, FUND_LINKS } from "./links";

export function Footer() {
  const { t, pick } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="footer" data-testid="site-footer">
      <div className="screen dark auto footer-screen">
        <div className="wrap wide">
          <div className="footer-top">
            <div className="footer-brand">
              <Link href="/" aria-label={t("nav.homeLink")}><Logo className="footer-logo" /></Link>
              <p className="footer-tag"><span className="mark" aria-hidden="true" /> <span className="grad">{t("footer.tagline")}</span></p>
            </div>
            <button type="button" className="icon-btn footer-up" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label={t("footer.top")}>
              <ArrowUp size={18} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>

          <div className="footer-cols">
            <div>
              <h2 className="footer-h">{t("footer.strategies")}</h2>
              <ul>
                {FUND_LINKS.map((f) => (
                  <li key={f.href}>
                    <Link href={f.href} className="footer-fund">
                      <i style={{ background: `linear-gradient(135deg, ${f.color.from}, ${f.color.to})` }} aria-hidden="true" />
                      {pick(f.name)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="footer-h">{t("footer.firm")}</h2>
              <ul>
                <li><Link href="/approach">{t("nav.approach")}</Link></li>
                <li><Link href="/team">{t("nav.team")}</Link></li>
                <li><Link href="/sustainability">{t("nav.sustainability")}</Link></li>
                <li><Link href="/solutions">{t("nav.solutions")}</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="footer-h">{t("footer.contact")}</h2>
              <address>
                <span style={{ whiteSpace: "pre-line" }}>{t("footer.address")}</span>
                <a href={`tel:${CONTACT.phone}`}>{t("footer.phone")}</a>
                <span>{t("footer.tollFree")}</span>
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">{t("footer.linkedin")} <ArrowUpRight size={13} aria-hidden="true" /></a>
              </address>
            </div>
            <div>
              <h2 className="footer-h">{t("footer.legal")}</h2>
              <ul>
                <li><Link href="/legal">{t("footer.legalPage")}</Link></li>
                <li><Link href="/privacy">{t("footer.privacy")}</Link></li>
                <li><span className="footer-pri">{t("footer.pri")}</span></li>
              </ul>
            </div>
          </div>

          <p className="footer-disc">{t("footer.disclaimer")}</p>
          <p className="footer-copy">© {year} {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}
