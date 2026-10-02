"use client";
/**
 * Home sections below the hero, in the order of the previous site: key figures · approach · strategies ·
 * investment process · institutions and partners · news and milestones. Every figure is published data,
 * admin content or a structural fact (number of strategies, people in src/data/team.ts).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Database, Handshake, HeartHandshake, Layers, Leaf, Medal, ShieldCheck, TrendingUp, X, Zap } from "lucide-react";
import { useTilt } from "@/components/v3/motion";
import { useTranslation } from "@/lib/i18n";
import { Bullets, ButtonLink, CardGrid, Marquee, Reveal, Section, SectionHead, Stat, StatRow, Steps } from "../kit";
import type { HomeData } from "./data";
import { HOME_COPY as C, FUND_COPY as F } from "./copy";
import { FundTile } from "./FundTile";
import { dayText } from "./figures";
import { NEWS, NEWS_CATEGORY, type NewsCategory, type NewsItem } from "./news";

/* ------------------------------------------------------------------ key figures */

export function KeyFigures({ data }: { data: HomeData }) {
  const { locale, pick } = useTranslation();
  return (
    <section className="hm-figs-w" aria-labelledby="glance-t">
      <div className="container">
        <div className="hm-figs">
          <Reveal self className="hm-figs-h">
            <h2 id="glance-t" className="h4">{pick(C.figures.title)}</h2>
            <p className="small">{pick(C.figures.where)}</p>
          </Reveal>
          <StatRow className="hm-stats">
            {data.aumLabel ? <Stat text={pick(data.aumLabel)} label={pick(C.figures.aum)} lang={locale} /> : null}
            <Stat value={data.funds.length || null} label={pick(C.figures.strategies)} lang={locale} />
            <Stat value={data.teamSize} label={pick(C.figures.team)} lang={locale} />
          </StatRow>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ approach teaser */

const APPROACH_ICONS = [TrendingUp, BarChart3, ShieldCheck];

function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useTilt<HTMLDivElement>(5);
  return <div ref={ref} className={`card ring hm-tilt ${className ?? ""}`}>{children}</div>;
}

export function Approach() {
  const { pick } = useTranslation();
  return (
    <Section glow="tr" labelledBy="approach-t" className="hm-approach">
      <div className="split top">
        <div>
          <SectionHead eyebrow={pick(C.approach.eyebrow)} title={pick(C.approach.title)} accent={pick(C.approach.accent)} lead={pick(C.approach.lead)} id="approach-t">
            <Bullets items={C.approach.points.map((p) => pick(p))} />
          </SectionHead>
          <Reveal self delay={260} className="hm-links">
            <Link className="link" href="/approach">{pick(C.approach.more)} <ArrowRight aria-hidden="true" /></Link>
            <Link className="link" href="/team">{pick(C.approach.team)} <ArrowRight aria-hidden="true" /></Link>
          </Reveal>
        </div>
        <Reveal kind="pop" stagger={120} className="hm-approach-cards">
          {C.approach.cards.map((c, i) => {
            const I = APPROACH_ICONS[i];
            return (
              <TiltCard key={i}>
                <div className="hm-card-row">
                  <span className="bubble" aria-hidden="true" style={{ ["--size" as string]: "48px", ["--bc" as string]: ["#1a73e8", "#0b8fd6", "#00a3e0"][i] }}><I /></span>
                  <div>
                    <h3 className="h4">{pick(c.title)}</h3>
                    <p>{pick(c.text)}</p>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ strategies */

export function StrategiesBand({ data }: { data: HomeData }) {
  const { pick } = useTranslation();
  const anyFig = data.funds.some((f) => f.si !== null || f.y1 !== null);
  const anyGross = data.funds.some((f) => f.basis === "gross" && (f.si !== null || f.y1 !== null));
  return (
    <Section tone="tint" labelledBy="strat-t" className="hm-strats">
      <SectionHead eyebrow={pick(C.strategies.eyebrow)} title={pick(C.strategies.title)} accent={pick(C.strategies.accent)} lead={pick(C.strategies.lead)} id="strat-t" center />
      <Reveal kind="pop" stagger={110} className="fx-grid fx-grid-2">
        {data.funds.map((f, i) => <FundTile key={f.key} f={f} sample={data.sample} index={i} />)}
      </Reveal>
      {anyFig ? <p className="fine hm-note">{pick(F.perfNote)}{anyGross ? ` ${pick(F.grossNote)}` : ""}</p> : null}
      <Reveal self className="hm-center">
        <ButtonLink href="/strategies" variant="ghost">{pick(C.strategies.all)} <ArrowRight aria-hidden="true" /></ButtonLink>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------------------ process */

const STEP_ICONS = [Database, Zap, Layers, ShieldCheck];

export function Process() {
  const { pick } = useTranslation();
  return (
    <Section labelledBy="process-t" glow="bl" className="hm-process">
      <SectionHead eyebrow={pick(C.process.eyebrow)} title={pick(C.process.title)} accent={pick(C.process.accent)} lead={pick(C.process.lead)} id="process-t" />
      <Steps items={C.process.steps.map((s, i) => {
        const I = STEP_ICONS[i];
        return { title: pick(s.title), text: pick(s.text), icon: <I aria-hidden="true" /> };
      })} />
    </Section>
  );
}

/* ------------------------------------------------------------------ institutions and partners */

// heights balance the logos' visual weight (their aspect ratios differ a lot)
const CLIENTS = [
  { src: "/logos/fondaction.png", alt: "Fondaction", h: 36 },
  { src: "/logos/fmoq.png", alt: "Fonds FMOQ", h: 48 },
  { src: "/logos/qemp.png", alt: "QEMP (Innocap)", h: 35 },
  { src: "/logos/securitas.png", alt: "Caisse de retraite et d’épargne du Groupe Securitas", h: 24 },
  { src: "/logos/gardaworld.png", alt: "GardaWorld", h: 30 },
  { src: "/logos/batirente.png", alt: "Bâtirente", h: 48 },
];
const PLATFORMS = [
  { src: "/logos/nbf.png", alt: "National Bank Financial Wealth Management", h: 42 },
  { src: "/logos/rbc-ds.png", alt: "RBC Dominion Securities", h: 42 },
  { src: "/logos/ia.png", alt: "iA Financial Group", h: 52 },
];

export function Partners() {
  const { pick } = useTranslation();
  const logo = (l: { src: string; alt: string; h: number }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <li key={l.src}><img src={l.src} alt={l.alt} loading="lazy" decoding="async" style={{ height: l.h }} /></li>
  );
  return (
    <Section tone="tint" labelledBy="partners-t" className="hm-partners">
      <SectionHead eyebrow={pick(C.partners.eyebrow)} title={pick(C.partners.title)} accent={pick(C.partners.accent)} id="partners-t" center />
      <Reveal self>
        <Marquee label={pick(C.partners.marquee)} speed={46}>
          {[...CLIENTS, ...PLATFORMS].map(logo)}
        </Marquee>
      </Reveal>
      <Reveal className="hm-partner-lists" stagger={140}>
        <div>
          <h3 className="h4">{pick(C.partners.clients)}</h3>
          <ul className="hm-names">{CLIENTS.map((c) => <li key={c.src}>{c.alt}</li>)}</ul>
        </div>
        <div>
          <h3 className="h4">{pick(C.partners.platforms)}</h3>
          <ul className="hm-names">{PLATFORMS.map((c) => <li key={c.src}>{c.alt}</li>)}</ul>
        </div>
      </Reveal>
      <p className="fine hm-note">{pick(C.partners.note)}</p>
    </Section>
  );
}

/* ------------------------------------------------------------------ news */

const NEWS_ICON: Record<NewsCategory, typeof Handshake> = { partnership: Handshake, esg: Leaf, recognition: Medal, community: HeartHandshake };
const NEWS_TONE: Record<NewsCategory, string> = { partnership: "#1a73e8", esg: "#188038", recognition: "#0b8fd6", community: "#c2410c" };

function NewsArt({ n }: { n: NewsItem }) {
  const I = NEWS_ICON[n.category];
  return (
    <span className="hm-news-art" aria-hidden="true" style={{ ["--tone" as string]: NEWS_TONE[n.category] }}>
      <svg viewBox="0 0 400 180" preserveAspectRatio="none">
        <path d="M-10 150 C 90 140, 170 120, 230 90 C 290 60, 330 40, 410 30" />
        <path d="M-10 170 C 110 160, 200 150, 260 120 C 320 92, 360 80, 410 74" />
      </svg>
      <span className="bubble" style={{ ["--bc" as string]: NEWS_TONE[n.category], ["--size" as string]: "56px" }}><I /></span>
    </span>
  );
}

function NewsDialog({ item, onClose }: { item: NewsItem | null; onClose: () => void }) {
  const { locale, pick } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (item && !d.open) d.showModal();
    if (!item && d.open) d.close();
  }, [item]);
  return (
    <dialog ref={ref} className="hm-dialog" aria-labelledby="news-d-t" onClose={onClose} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} data-testid="news-dialog">
      {item ? (
        <div className="hm-dialog-in">
          <button type="button" className="icon-btn hm-dialog-x" onClick={onClose} aria-label={pick(C.news.close)}><X aria-hidden="true" /></button>
          <p className="hm-news-meta"><span className="hm-chip">{pick(NEWS_CATEGORY[item.category])}</span><time dateTime={item.date}>{dayText(item.date, locale)}</time></p>
          <h2 id="news-d-t" className="h3">{pick(item.title)}</h2>
          <div className="prose hm-dialog-body">{pick(item.body).split("\n\n").map((p, i) => <p key={i}>{p}</p>)}</div>
        </div>
      ) : null}
    </dialog>
  );
}

/** `items`: the latest news (CMS or static), newest first; the teaser shows the first 3. */
export function News({ items = NEWS }: { items?: NewsItem[] }) {
  const { locale, pick } = useTranslation();
  const [open, setOpen] = useState<NewsItem | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const close = () => { setOpen(null); opener.current?.focus(); };
  return (
    <Section labelledBy="news-t" className="hm-news">
      <SectionHead eyebrow={pick(C.news.eyebrow)} title={pick(C.news.title)} accent={pick(C.news.accent)} id="news-t" />
      <CardGrid cols={4} className="hm-news-grid">
        {items.slice(0, 3).map((n) => (
          <article key={n.id} className="card hm-news-card" data-testid={`news-${n.id}`}>
            <NewsArt n={n} />
            <div className="hm-news-body">
              <p className="hm-news-meta"><span className="hm-chip">{pick(NEWS_CATEGORY[n.category])}</span><time dateTime={n.date}>{dayText(n.date, locale)}</time></p>
              <h3 className="h4">{pick(n.title)}</h3>
              <p>{pick(n.summary)}</p>
              <button type="button" className="link hm-news-more" onClick={(e) => { opener.current = e.currentTarget; setOpen(n); }} aria-haspopup="dialog">
                {pick(C.news.read)} <ArrowRight aria-hidden="true" /><span className="sr-only">: {pick(n.title)}</span>
              </button>
            </div>
          </article>
        ))}
      </CardGrid>
      <p className="hm-news-all" style={{ marginTop: 24 }}><Link className="link" href="/news">{locale === "fr" ? "Toutes les actualités" : "All news"} <ArrowRight aria-hidden="true" /></Link></p>
      <NewsDialog item={open} onClose={close} />
    </Section>
  );
}

