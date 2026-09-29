"use client";
/**
 * Floating glass pill (the deck HUD): wordmark, links, EN/FR, theme. A brand-gradient hairline shows the
 * scroll progress; the pill slides away while scrolling down and returns on the way up. On small screens
 * a full-screen black menu opens with large lowercase links rising one by one.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { LightTrail } from "@/components/v3/motion";
import { Logo } from "./Logo";
import { ThemeToggle } from "./theme";
import { CONTACT, FUND_LINKS, NAV_LINKS } from "./links";

export function LangToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useTranslation();
  const next = locale === "en" ? "fr" : "en";
  return (
    <button
      type="button"
      className={`lang-btn ${className ?? ""}`}
      onClick={() => setLocale(next)}
      aria-label={t("nav.langSwitch")}
      lang={next}
      data-testid="lang-toggle"
    >
      <span aria-hidden="true" className={locale === "en" ? "on" : ""}>en</span>
      <span aria-hidden="true" className={locale === "fr" ? "on" : ""}>fr</span>
    </button>
  );
}

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`));

export function Nav() {
  const { t, pick } = useTranslation();
  const path = usePathname() || "/";
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // scroll: progress hairline + hide on the way down
  useEffect(() => {
    let last = window.scrollY, raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
        setScrolled(y > 24);
        if (Math.abs(y - last) > 6) { setHidden(y > last && y > 240); last = y; }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  // route change closes the menu
  useEffect(() => { setOpen(false); }, [path]);

  const close = useCallback(() => { setOpen(false); toggleRef.current?.focus(); }, []);

  // menu open: lock scroll, trap focus, Escape closes
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add("menu-open");
    const el = menuRef.current;
    el?.querySelector<HTMLElement>("a, button")?.focus();
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
      <header className={`nav ${hidden && !open ? "is-hidden" : ""} ${scrolled ? "is-scrolled" : ""}`} data-testid="site-nav">
        <nav className="nav-pill" aria-label={t("nav.primary")}>
          <Link href="/" className="nav-logo" aria-label={t("nav.homeLink")}>
            <Logo />
          </Link>
          <ul className="nav-links">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={isActive(path, l.href) ? "on" : ""} aria-current={isActive(path, l.href) ? "page" : undefined}>
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="nav-tools">
            <LangToggle />
            <ThemeToggle />
            <button
              ref={toggleRef}
              type="button"
              className="icon-btn nav-burger"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? t("nav.close") : t("nav.open")}
              onClick={() => setOpen((o) => !o)}
              data-testid="menu-toggle"
            >
              {open ? <X size={18} strokeWidth={1.8} aria-hidden="true" /> : <Menu size={18} strokeWidth={1.8} aria-hidden="true" />}
            </button>
          </div>
          <div className="nav-progress" aria-hidden="true"><div ref={bar} /></div>
        </nav>
      </header>

      <div
        id="site-menu"
        ref={menuRef}
        className={`menu ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.menu")}
        hidden={!open}
        data-testid="mobile-menu"
      >
        {open ? <LightTrail d="M-60 640 C 260 610, 520 610, 700 590 C 900 565, 860 470, 600 460 C 500 456, 440 470, 410 486" /> : null}
        <div className="menu-in">
          <ul className="menu-links">
            <li style={{ ["--i" as string]: 0 }}><Link href="/" onClick={() => setOpen(false)} aria-current={path === "/" ? "page" : undefined}>{t("nav.home")}</Link></li>
            {NAV_LINKS.map((l, i) => (
              <li key={l.href} style={{ ["--i" as string]: i + 1 }}>
                <Link href={l.href} onClick={() => setOpen(false)} className={isActive(path, l.href) ? "on" : ""} aria-current={isActive(path, l.href) ? "page" : undefined}>
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="menu-funds" style={{ ["--i" as string]: NAV_LINKS.length + 1 }}>
            {FUND_LINKS.map((f) => (
              <li key={f.href}>
                <Link href={f.href} onClick={() => setOpen(false)}>
                  <i style={{ background: `linear-gradient(135deg, ${f.color.from}, ${f.color.to})` }} aria-hidden="true" />
                  {pick(f.name)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="menu-foot" style={{ ["--i" as string]: NAV_LINKS.length + 2 }}>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={14} aria-hidden="true" /></a>
            <div className="menu-tools"><LangToggle /><ThemeToggle /></div>
          </div>
        </div>
      </div>
    </>
  );
}
