"use client";
/**
 * Corporate site kit: the building blocks every public page uses. Light, full-width bands; the v3 keynote
 * motion (words rising out of a blur, blocks floating up, glowing marks and bubbles, light trails, figures
 * counting to their value, curves drawing in) applied to an informational website.
 *
 *   <Section tone="tint" glow="tr"><SectionHead eyebrow="Our approach" title="Science, applied" lead="…" /></Section>
 */
import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { CountUp, EASE, Reveal, RevealTitle, reducedMotion, useInView, useMountValue, useScrub } from "@/components/motion/motion";

import { DataField, Divider } from "./fx/fx";

export { Reveal, RevealTitle } from "@/components/motion/motion";

/* ------------------------------------------------------------------ layout */

export function Section({
  children, id, tone = "white", glow, tight = false, className, style, labelledBy, as: Tag = "section",
}: {
  children: ReactNode; id?: string; tone?: "white" | "tint"; glow?: "tr" | "bl"; tight?: boolean; className?: string;
  style?: CSSProperties; labelledBy?: string; as?: ElementType;
}) {
  const cls = ["section", tone === "tint" ? "tint" : "", glow ? `glow-${glow}` : "", tight ? "tight" : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <Tag id={id} className={cls} style={style} aria-labelledby={labelledBy}>
      <Divider />
      <div className="container">{children}</div>
    </Tag>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={`eyebrow ${className ?? ""}`}>
      <span className="mark" aria-hidden="true" />
      {children}
    </p>
  );
}

/**
 * Eyebrow + heading (words rise out of a blur) + lead. `accent` words carry the brand gradient.
 * Pass `id` to label the enclosing <Section labelledBy>.
 */
export function SectionHead({
  eyebrow, title, accent, lead, center = false, as = "h2", size, id, children, className,
}: {
  eyebrow?: ReactNode; title: string; accent?: string; lead?: ReactNode; center?: boolean; as?: "h1" | "h2" | "h3";
  size?: "display" | "h1" | "h2" | "h3"; id?: string; children?: ReactNode; className?: string;
}) {
  const cls = size ?? (as === "h1" ? "h1" : as === "h3" ? "h3" : "h2");
  return (
    <div className={`section-head ${center ? "center" : ""} ${className ?? ""}`}>
      {eyebrow ? <Reveal self><Eyebrow>{eyebrow}</Eyebrow></Reveal> : null}
      <RevealTitle as={as} text={title} accent={accent} className={cls} id={id} />
      {lead ? <Reveal self delay={180}><div className="lead">{lead}</div></Reveal> : null}
      {children}
    </div>
  );
}

export function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="crumbs">
      <ol>
        {items.map((it, i) => (
          <li key={i}>
            {it.href ? <Link href={it.href}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
            {i < items.length - 1 ? <ChevronRight aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Page header band: breadcrumb, eyebrow, H1 (word reveal), lead, actions, and animated art on the right or
 * behind (yield curves drawing in, or a light trail).
 */
export function PageHero({
  eyebrow, title, accent, lead, crumbs, children, art = "curves", aside, id,
}: {
  eyebrow?: ReactNode; title: string; accent?: string; lead?: ReactNode; crumbs?: { href?: string; label: string }[];
  children?: ReactNode; art?: "curves" | "trail" | "none"; aside?: ReactNode; id?: string;
}) {
  return (
    <header className={`page-hero glow-tr ${aside ? "has-aside" : ""}`} data-trail-host="">
      {art !== "none" ? <DataField /> : null}
      {art === "curves" ? <HeroCurves /> : null}
      {art === "trail" ? <HeroTrail /> : null}
      <div className="container">
        {crumbs ? <Crumbs items={crumbs} /> : null}
        <div className="page-hero-grid">
          <div className="page-hero-main">
            {eyebrow ? <Reveal self><Eyebrow>{eyebrow}</Eyebrow></Reveal> : null}
            <RevealTitle as="h1" text={title} accent={accent} className="h1" id={id} />
            {lead ? <Reveal self delay={220}><div className="lead">{lead}</div></Reveal> : null}
            {children ? <Reveal self delay={360}><div className="actions">{children}</div></Reveal> : null}
          </div>
          {aside ? <Reveal self kind="pop" delay={300} className="page-hero-aside">{aside}</Reveal> : null}
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ hero art */

/** A family of yield curves (term structures) drawing themselves in, then breathing; a light pulse travels the lead curve. */
export function HeroCurves({ className }: { className?: string }) {
  const uid = `c${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const ref = useRef<SVGSVGElement>(null);
  const anim = useMountValue(() => !reducedMotion(), false);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    if (reducedMotion()) return;
    svg.querySelectorAll<SVGPathElement>("path[data-curve]").forEach((p, i) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 2200 + i * 180, delay: 150 + i * 140, easing: EASE, fill: "both" });
    });
  }, []);
  // upward-sloping to flat term structures (x: maturity, y: yield), plus one inverted
  const curves = [
    "M0 470 C 180 330, 420 250, 700 215 C 930 188, 1110 180, 1280 176",
    "M0 505 C 200 400, 440 320, 720 282 C 950 255, 1120 246, 1280 242",
    "M0 540 C 220 470, 470 400, 740 360 C 960 332, 1130 322, 1280 318",
    "M0 400 C 260 380, 520 372, 780 372 C 990 373, 1150 378, 1280 382",
    "M0 330 C 240 360, 500 392, 760 410 C 980 424, 1140 430, 1280 432",
  ];
  return (
    <svg ref={ref} className={`hero-curves ${className ?? ""}`} viewBox="0 0 1280 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a73e8" stopOpacity="0" />
          <stop offset=".25" stopColor="#1a73e8" stopOpacity=".9" />
          <stop offset=".7" stopColor="#4c8dff" />
          <stop offset="1" stopColor="#00a3e0" stopOpacity=".85" />
        </linearGradient>
        <filter id={`${uid}f`} x="-5%" y="-40%" width="110%" height="180%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id={`${uid}d`}>
          <stop offset="0" stopColor="#fff" />
          <stop offset=".35" stopColor="#4fd1ff" />
          <stop offset="1" stopColor="#1a73e8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="hero-curves-grid">
        {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={(i + 1) * 128} y1="80" x2={(i + 1) * 128} y2="600" />)}
        {Array.from({ length: 5 }, (_, i) => <line key={`h${i}`} x1="0" y1={120 + i * 110} x2="1280" y2={120 + i * 110} />)}
      </g>
      {curves.map((d, i) => (
        <path key={i} data-curve="" id={i === 0 ? `${uid}p` : undefined} d={d} fill="none" stroke={`url(#${uid}g)`}
          strokeWidth={i === 0 ? 3.2 : 1.6} strokeOpacity={i === 0 ? 1 : 0.55 - i * 0.07} strokeLinecap="round"
          filter={i === 0 ? `url(#${uid}f)` : undefined} className={`hc-${i}`} />
      ))}
      {[128, 256, 512, 768, 1024].map((x, i) => (
        <circle key={x} className="hero-curves-node" cx={x} cy={[380, 305, 238, 204, 186][i]} r="4.5" style={{ animationDelay: `${1.6 + i * 0.18}s` }} />
      ))}
      {anim ? (
        <circle r="9" fill={`url(#${uid}d)`}>
          <animateMotion dur="7s" repeatCount="indefinite" rotate="auto" begin="2.4s" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1">
            <mpath href={`#${uid}p`} />
          </animateMotion>
        </circle>
      ) : null}
    </svg>
  );
}

/** The deck's chapter light trail as a page-hero backdrop (draws in once). */
function HeroTrail() {
  const ref = useRef<SVGPathElement>(null);
  const uid = `t${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 2600, delay: 200, easing: EASE, fill: "both" });
  }, []);
  return (
    <svg className="hero-trail" viewBox="0 0 1280 480" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a73e8" stopOpacity="0" /><stop offset=".35" stopColor="#1a73e8" />
          <stop offset=".7" stopColor="#4c8dff" /><stop offset="1" stopColor="#4fd1ff" stopOpacity=".5" />
        </linearGradient>
        <filter id={`${uid}f`} x="-10%" y="-60%" width="120%" height="220%">
          <feGaussianBlur stdDeviation="9" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path ref={ref} d="M-40 420 C 280 400, 560 380, 760 330 C 960 280, 1080 170, 1320 120" fill="none" stroke={`url(#${uid}g)`} strokeWidth="5" strokeLinecap="round" filter={`url(#${uid}f)`} />
    </svg>
  );
}

/* ------------------------------------------------------------------ content blocks */

export function FeatureCard({ icon, title, children, href, cta, className }: {
  icon?: ReactNode; title: string; children?: ReactNode; href?: string; cta?: string; className?: string;
}) {
  const body = (
    <>
      {icon ? <div className="card-icon" aria-hidden="true">{icon}</div> : null}
      <h3 className="h4">{title}</h3>
      {children ? <div className="card-text">{children}</div> : null}
      {href && cta ? <span className="link card-cta">{cta} <ArrowRight aria-hidden="true" /></span> : null}
    </>
  );
  return href ? <Link href={href} className={`card ring feature ${className ?? ""}`}>{body}</Link> : <div className={`card feature ${className ?? ""}`}>{body}</div>;
}

/**
 * Short bullet list: gradient tick markers, items float in one after the other (hidden only behind the html.js
 * gate, static under reduced motion). `cols={2}` lays long lists out in two columns on wide screens.
 */
export function Bullets({ items, cols = 1, className, size }: { items: ReactNode[]; cols?: 1 | 2; className?: string; size?: "sm" }) {
  if (!items.length) return null;
  return (
    <Reveal as="ul" role="list" stagger={70} className={`ticks ${cols === 2 ? "c2" : ""} ${size ?? ""} ${className ?? ""}`}>
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </Reveal>
  );
}

/** Grid whose children pop in one after the other. */
export function CardGrid({ children, cols = 3, className }: { children: ReactNode; cols?: 2 | 3 | 4; className?: string }) {
  return <Reveal kind="pop" stagger={90} className={`grid c${cols} ${className ?? ""}`}>{children}</Reveal>;
}

/**
 * A key figure that counts to its value when it scrolls into view. The server renders the final value (no
 * JS, crawlers and screen readers always get the real number); `value === null` renders nothing: never a placeholder.
 */
export function Stat({ value, label, decimals = 0, prefix, suffix, pct = false, text, lang = "en", className }: {
  value?: number | null; label: ReactNode; decimals?: number; prefix?: string; suffix?: string; pct?: boolean;
  /** a figure that is not a number (e.g. "$1.9B"): shown as is, rising in */
  text?: string | null; lang?: "en" | "fr"; className?: string;
}) {
  if ((value === null || value === undefined) && !text) return null;
  return (
    <div className={`stat ${className ?? ""}`}>
      <div className="fig l grad">
        {text ? text : <CountUp value={value as number} decimals={decimals} prefix={prefix} suffix={suffix} pct={pct} lang={lang} />}
      </div>
      <div className="fig-label">{label}</div>
    </div>
  );
}

export function StatRow({ children, className }: { children: ReactNode; className?: string }) {
  return <Reveal className={`stat-row ${className ?? ""}`} stagger={120}>{children}</Reveal>;
}

/**
 * Numbered process with glowing bubbles joined by a light line that fills as the section scrolls by.
 * layout "row" on wide screens (4 steps), "column" for long texts.
 */
export function Steps({ items, layout = "row" }: { items: { title: string; text: ReactNode; icon?: ReactNode; color?: string }[]; layout?: "row" | "column" }) {
  const line = useScrub<HTMLOListElement>((k, el) => el.style.setProperty("--fill", k.toFixed(3)));
  const colors = ["#1a73e8", "#0b8fd6", "#00a3e0", "#188038", "#fa7b17"];
  return (
    <ol ref={line} className={`steps steps-${layout}`}>
      {items.map((s, i) => (
        <Reveal as="li" self key={i} delay={i * 120} className="step">
          <div className="bubble" style={{ ["--bc" as string]: s.color ?? colors[i % colors.length] }}>
            {s.icon ?? <span>{i + 1}</span>}
          </div>
          <div className="step-body">
            <p className="step-no">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="h4">{s.title}</h3>
            <div className="step-text">{s.text}</div>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

/** Closing call to action band (light, gradient glow, light trail). */
export function CtaBand({ title, accent, text, children }: { title: string; accent?: string; text?: ReactNode; children?: ReactNode }) {
  return (
    <section className="cta-band" data-trail-host="">
      <div className="container">
        <div className="cta-card">
          <HeroTrail />
          <RevealTitle as="h2" text={title} accent={accent} className="h2" />
          {text ? <Reveal self delay={160}><p className="lead">{text}</p></Reveal> : null}
          {children ? <Reveal self delay={280}><div className="actions">{children}</div></Reveal> : null}
        </div>
      </div>
    </section>
  );
}

export function ButtonLink({ href, children, variant = "primary", external = false, className, size }: {
  href: string; children: ReactNode; variant?: "primary" | "ghost"; external?: boolean; className?: string; size?: "sm";
}) {
  const cls = `btn ${variant === "ghost" ? "ghost" : ""} ${size ?? ""} ${className ?? ""}`;
  const inner = <>{children}{variant === "primary" ? <ArrowRight className="arrow" aria-hidden="true" /> : null}</>;
  if (external || /^(mailto:|tel:|https?:)/.test(href)) {
    return <a href={href} className={cls} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>{inner}</a>;
  }
  return <Link href={href} className={cls}>{inner}</Link>;
}

/** Infinite, pausable logo strip (duplicated once for a seamless loop; the copy is hidden from assistive tech). */
export function Marquee({ children, label, speed = 40 }: { children: ReactNode; label: string; speed?: number }) {
  return (
    <div className="marquee" role="region" aria-label={label} style={{ ["--speed" as string]: `${speed}s` }}>
      <div className="marquee-track">
        <ul className="marquee-set">{children}</ul>
        <ul className="marquee-set" aria-hidden="true">{children}</ul>
      </div>
    </div>
  );
}

/**
 * Accessible tabs (WAI-ARIA pattern, arrow keys, Home/End). The selected tab follows the URL hash
 * (#performance) so it can be linked and survives reloads; panels stay mounted only while selected.
 */
export function Tabs({ tabs, label, initial, onChange, sticky = false }: {
  tabs: { id: string; label: string; content: ReactNode }[]; label: string; initial?: string; onChange?: (id: string) => void; sticky?: boolean;
}) {
  const ids = tabs.map((t) => t.id);
  const [active, setActive] = useState(initial && ids.includes(initial) ? initial : ids[0]);
  const listRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  useEffect(() => {
    const fromHash = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      if (ids.includes(h)) setActive(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join("|")]);
  const select = (id: string, focus = false) => {
    setActive(id);
    onChange?.(id);
    history.replaceState(null, "", `#${id}`);
    if (focus) listRef.current?.querySelector<HTMLButtonElement>(`#${uid}-tab-${id}`)?.focus();
  };
  const onKey = (e: React.KeyboardEvent) => {
    const i = ids.indexOf(active);
    const to = e.key === "ArrowRight" ? ids[(i + 1) % ids.length] : e.key === "ArrowLeft" ? ids[(i - 1 + ids.length) % ids.length]
      : e.key === "Home" ? ids[0] : e.key === "End" ? ids[ids.length - 1] : null;
    if (to) { e.preventDefault(); select(to, true); }
  };
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div className="tabset">
      <div className={`tabs-bar ${sticky ? "sticky" : ""}`}>
        <div className="container">
          <div ref={listRef} className="tabs" role="tablist" aria-label={label} onKeyDown={onKey}>
            {tabs.map((t) => (
              <button key={t.id} id={`${uid}-tab-${t.id}`} type="button" role="tab" className="tab" aria-selected={t.id === active}
                aria-controls={`${uid}-panel-${t.id}`} tabIndex={t.id === active ? 0 : -1} onClick={() => select(t.id)} data-tab={t.id}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div key={current.id} id={`${uid}-panel-${current.id}`} role="tabpanel" aria-labelledby={`${uid}-tab-${current.id}`} className="tab-panel" data-panel={current.id}>
        {current.content}
      </div>
    </div>
  );
}

/** Horizontal percentage bars that grow in (breakdowns). Values are fractions (0.25 = 25 %). */
export function Bars({ rows, lang = "en", decimals = 1 }: { rows: { label: string; value: number }[]; lang?: "en" | "fr"; decimals?: number }) {
  const [ref, seen] = useInView<HTMLUListElement>();
  const max = Math.max(...rows.map((r) => r.value), 0.0001);
  const f = (v: number) => `${(v * 100).toLocaleString(lang === "fr" ? "fr-CA" : "en-CA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${lang === "fr" ? " %" : "%"}`;
  return (
    <ul ref={ref} className="hbars" data-shown={seen ? "" : undefined}>
      {rows.map((r, i) => (
        <li key={r.label}>
          <span className="hbars-l">{r.label}</span>
          <span className="hbars-v tabnum">{f(r.value)}</span>
          <span className="bar" aria-hidden="true">
            <i style={{ width: `${(r.value / max) * 100}%`, transitionDelay: `${i * 70}ms` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}
