"use client";
/**
 * Floating glass mini-nav: fund switcher (one glowing dot per fund, in its colour) + section anchors with
 * a scroll-spy, a "sample data" badge. Hidden on the hero, slides up once the reader scrolls into the page.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import type { FundKey } from "@/lib/data/types";
import { T, tr } from "./copy";
import type { FundLink } from "./types";
import type { Lang } from "./lib/format.ts";

export function FundDock({ current, funds, sections, lang, sample }: {
  current: FundKey; funds: FundLink[]; sections: { id: string; label: string }[]; lang: Lang; sample: boolean;
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.55);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const els = sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver((entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      }, { rootMargin: "-40% 0px -55% 0px" });
      els.forEach((e) => io!.observe(e));
    }
    return () => { window.removeEventListener("scroll", onScroll); io?.disconnect(); };
  }, [sections]);

  return (
    <nav className={`fx-dock${shown ? "" : " hidden"}`} aria-label={tr(T.nav.sections, lang)} data-testid="fund-dock">
      <div className="funds" role="list" aria-label={tr(T.nav.funds, lang)}>
        {funds.map((f) => (
          <Link key={f.key} role="listitem" href={`/strategies/${f.key}`} aria-current={f.key === current ? "page" : undefined} title={tr(f.name, lang)} style={{ color: f.color.solid }}>
            <i style={{ background: `linear-gradient(135deg, ${f.color.from}, ${f.color.to})` }} />
            <span className="sr-only">{tr(f.name, lang)}</span>
          </Link>
        ))}
      </div>
      <div className="secs">
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`} className={active === s.id ? "on" : undefined} aria-current={active === s.id ? "location" : undefined}>{s.label}</a>
        ))}
      </div>
      {sample ? <span className="sample" title={tr(T.sample.note, lang)}>{tr(T.sample.ribbon, lang)}</span> : null}
    </nav>
  );
}
