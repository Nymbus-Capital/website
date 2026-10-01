"use client";
/**
 * Site header: wordmark, the previous site's menu (Strategies · Approach · About · Solutions · Sustainability ·
 * Contact) with a strategies dropdown, EN/FR. Transparent over the page hero, a frosted bar once scrolled, with a
 * glowing brand-gradient hairline for the scroll progress. On small screens a full-screen white sheet opens.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Logo } from "./Logo";
import { visibleFunds } from "@/config/funds-public";
import { CONTACT, FUND_LINKS, NAV_LINKS } from "./links";

export function LangToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useTranslation();
  const next = locale === "en" ? "fr" : "en";
  return (
    <button type="button" className={`lang-btn ${className ?? ""}`} onClick={() => setLocale(next)} aria-label={t("nav.langSwitch")} lang={next} data-testid="lang-toggle">
      <span aria-hidden="true" className={locale === "en" ? "on" : ""}>en</span>
      <span aria-hidden="true" className={locale === "fr" ? "on" : ""}>fr</span>
    </button>
  );
}

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`));

export function Nav({ hiddenFunds = [] }: { hiddenFunds?: string[] }) {
  const { t, pick } = useTranslation();
  // funds hidden in the admin are left out of the dropdown and the mobile menu
  const funds = visibleFunds(FUND_LINKS, hiddenFunds);
  const path = usePathname() || "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
        setScrolled(y > 8);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => { setOpen(false); }, [path]);
  const close = useCallback(() => { setOpen(false); toggleRef.current?.focus(); }, []);

  // menu open: lock scroll, trap focus, Escape closes
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add("menu-open");
    const el = menuRef.current;
    el?.querySelector<HTMLElement>(".menu-links a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab" || !el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
      if (!items.length) return;
      const first = items[0], lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { root.classList.remove("menu-open"); document.removeEventListener("keydown", onKey); };
  }, [open, close]);

  return (
    <>
      <a className="skip" href="#main">{t("nav.skip")}</a>
      <header className={`nav ${scrolled ? "is-scrolled" : ""}`} data-testid="site-nav">
        <div className="container nav-in">
          <Link href="/" className="nav-logo" aria-label={t("nav.homeLink")}><Logo /></Link>
          <nav aria-label={t("nav.primary")} style={{ marginLeft: "auto" }}>
            <ul className="nav-links">
              {NAV_LINKS.map((l) => {
                const on = isActive(path, l.href);
                if (l.href === "/strategies") {
                  return (
                    <li key={l.href} className="nav-drop">
                      <Link href={l.href} className={on ? "on" : ""} aria-current={path === l.href ? "page" : undefined}>
                        {t(l.key)} <ChevronDown size={14} aria-hidden="true" style={{ marginLeft: 4 }} />
                      </Link>
                      <div className="nav-drop-panel">
                        {funds.map((f) => (
                          <Link key={f.href} href={f.href} aria-current={path === f.href ? "page" : undefined}>
                            <i style={{ background: `linear-gradient(135deg, ${f.color.from}, ${f.color.to})` }} aria-hidden="true" />
                            <span><b>{pick(f.short)}</b><small>{pick(f.tagline)}</small></span>
                          </Link>
                        ))}
                        <Link href="/strategies" className="all">{t("nav.allStrategies")} →</Link>
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={l.href}>
                    <Link href={l.href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>{t(l.key)}</Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="nav-tools">
            <LangToggle />
            <button ref={toggleRef} type="button" className="icon-btn nav-burger" aria-expanded={open} aria-controls="site-menu"
              aria-label={open ? t("nav.close") : t("nav.open")} onClick={() => setOpen((o) => !o)} data-testid="menu-toggle">
              {open ? <X size={20} strokeWidth={1.8} aria-hidden="true" /> : <Menu size={20} strokeWidth={1.8} aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div className="nav-progress" aria-hidden="true"><div ref={bar} /></div>
      </header>

      <div id="site-menu" ref={menuRef} className="menu" role="dialog" aria-modal="true" aria-label={t("nav.menu")} hidden={!open} data-testid="mobile-menu">
        <div className="container">
          <div className="menu-head">
            <Link href="/" className="nav-logo" aria-label={t("nav.homeLink")} onClick={() => setOpen(false)}><Logo /></Link>
            <button type="button" className="icon-btn" aria-label={t("nav.close")} onClick={close}><X size={20} strokeWidth={1.8} aria-hidden="true" /></button>
          </div>
          <ul className="menu-links">
            <li style={{ ["--i" as string]: 0 }}><Link href="/" onClick={() => setOpen(false)} aria-current={path === "/" ? "page" : undefined}>{t("nav.home")}</Link></li>
            {NAV_LINKS.map((l, i) => (
              <li key={l.href} style={{ ["--i" as string]: i + 1 }}>
                <Link href={l.href} onClick={() => setOpen(false)} aria-current={isActive(path, l.href) ? "page" : undefined}>{t(l.key)}</Link>
              </li>
            ))}
          </ul>
          <ul className="menu-funds" style={{ ["--i" as string]: NAV_LINKS.length + 1 }}>
            {funds.map((f) => (
              <li key={f.href}>
                <Link href={f.href} onClick={() => setOpen(false)}>
                  <i style={{ background: `linear-gradient(135deg, ${f.color.from}, ${f.color.to})` }} aria-hidden="true" />
                  {pick(f.short)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="menu-foot" style={{ ["--i" as string]: NAV_LINKS.length + 2 }}>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={14} aria-hidden="true" /></a>
            <LangToggle />
          </div>
        </div>
      </div>
    </>
  );
}
