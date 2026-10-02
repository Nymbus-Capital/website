"use client";
/**
 * /team ("About" in the navigation): the firm (who we are, Montreal office, values, verifiable milestones),
 * then the people (src/data/team.ts; photos hotlinked from www.nymbus.ca, initials when missing), filterable
 * by department (a person can belong to several), each opening a bio dialog (native <dialog>: focus trap,
 * Escape, backdrop click), and a join-us / contact band.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Handshake, Lightbulb, MapPin, Scale, ShieldCheck, Users, X, Zap } from "lucide-react";
import { useInView, useScrub } from "@/components/v3/motion";
import { useTranslation } from "@/lib/i18n";
import { team as staticTeam, type TeamMember } from "@/data/team";
import { Bullets, ButtonLink, CardGrid, CtaBand, FeatureCard, PageHero, Reveal, Section, SectionHead, Stat, StatRow } from "../kit";
import { AB } from "./copy-about";
import { Portrait } from "./Portrait";
import { countCFA, countPhD, inDept, membersOf, type DeptFilter } from "./lib/people";
import { mailto, mapsLink } from "./lib/inquiry";
import "./pages.css";

const ADDRESS = "1002 Sherbrooke Street West, Suite 1900, Montreal, Quebec H3A 3L6";

function Bio({ m, onClose }: { m: TeamMember | null; onClose: () => void }) {
  const { locale, pick } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (m && !d.open) d.showModal();
    if (!m && d.open) d.close();
  }, [m]);
  const fr = locale === "fr";
  const P = AB.people;
  const roles = m ? (fr ? m.previousRolesFr ?? m.previousRoles : m.previousRoles) : undefined;
  return (
    <dialog ref={ref} className="ab-bio" aria-labelledby="bio-name" onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }} data-testid="bio-dialog">
      {m ? (
        <div className="ab-bio-in">
          <button type="button" className="icon-btn ab-bio-x" onClick={onClose} aria-label={pick(P.close)}><X size={18} aria-hidden="true" /></button>
          <div className="ab-bio-head">
            <Portrait m={m} size="l" />
            <div>
              <h2 id="bio-name" className="h3">{m.name}</h2>
              <p className="ab-bio-role">{fr ? m.titleFr ?? m.title : m.title}</p>
              {m.designations?.length ? <p className="ab-tags">{m.designations.map((d) => <span key={d} className="ab-tag">{d}</span>)}</p> : null}
            </div>
          </div>
          <div className="ab-bio-body">
            <h3 className="ab-bio-h">{pick(P.bio)}</h3>
            <p>{fr ? m.bioFr ?? m.bio : m.bio}</p>
            {roles?.length ? (
              <>
                <h3 className="ab-bio-h">{pick(P.prev)}</h3>
                <ul role="list" className="pg-ticks">{roles.map((r) => <li key={r}>{r}</li>)}</ul>
              </>
            ) : null}
            {m.education?.length ? (
              <>
                <h3 className="ab-bio-h">{pick(P.edu)}</h3>
                <ul role="list" className="pg-ticks">{m.education.map((r) => <li key={r}>{r}</li>)}</ul>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

function Milestones() {
  const { pick } = useTranslation();
  const line = useScrub<HTMLOListElement>((k, el) => el.style.setProperty("--fill", k.toFixed(3)));
  const [ref, seen] = useInView<HTMLDivElement>({ threshold: 0.2 });
  return (
    <div ref={ref} className="ab-tl-wrap" data-on={seen ? "" : undefined}>
      <ol ref={line} className="ab-tl">
        {AB.milestones.items.map((it, i) => (
          <Reveal as="li" self key={it.y} delay={i * 110} className="ab-tl-i">
            <span className="ab-tl-dot" aria-hidden="true" />
            <p className="ab-tl-y tabnum">{it.y}</p>
            <h3 className="h4">{pick(it.t)}</h3>
            {it.d ? <p className="ab-tl-d">{pick(it.d)}</p> : null}
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

export function Team({ members: team = staticTeam }: { members?: TeamMember[] }) {
  const { locale, pick } = useTranslation();
  const fr = locale === "fr";
  const P = AB.people;
  const [dept, setDept] = useState<DeptFilter>("all");
  const [open, setOpen] = useState<TeamMember | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const shown = useMemo(() => membersOf(team, dept), [dept]);

  const openBio = (m: TeamMember, el: HTMLElement) => { lastFocus.current = el; setOpen(m); };
  const closeBio = () => { setOpen(null); requestAnimationFrame(() => lastFocus.current?.focus()); };
  const valueIcons = [Lightbulb, Zap, ShieldCheck, Scale, Handshake];

  return (
    <div className="pg ab">
      <PageHero eyebrow={pick(AB.hero.eyebrow)} title={pick(AB.hero.title)} accent={pick(AB.hero.accent)} lead={pick(AB.hero.lead)}
        crumbs={[{ href: "/", label: fr ? "Accueil" : "Home" }, { label: pick(AB.hero.eyebrow) }]}
        aside={
          <div className="ab-hero-card card">
            <StatRow className="ab-hero-stats">
              <Stat value={team.length} label={pick(AB.hero.people)} lang={locale} />
              <Stat value={countPhD(team)} label={pick(AB.hero.phd)} lang={locale} />
              <Stat value={countCFA(team)} label={pick(AB.hero.cfa)} lang={locale} />
              <Stat text="2013" label={pick(AB.hero.since)} lang={locale} />
            </StatRow>
            <ul className="ab-hero-faces" aria-hidden="true">
              {team.filter((m) => m.photo).slice(0, 7).map((m) => <li key={m.name}><Portrait m={m} size="s" /></li>)}
              <li className="ab-hero-more"><Users /></li>
            </ul>
          </div>
        }>
        <ButtonLink href="#people">{pick(AB.hero.cta1)}</ButtonLink>
        <ButtonLink href="/contact" variant="ghost">{pick(AB.hero.cta2)}</ButtonLink>
      </PageHero>

      <Section labelledBy="ab-intro-t" glow="tr">
        <div className="split top ab-intro">
          <div>
            <SectionHead eyebrow={pick(AB.intro.eyebrow)} title={pick(AB.intro.title)} accent={pick(AB.intro.accent)} lead={pick(AB.intro.p1)} id="ab-intro-t" className="ab-intro-head">
              <Bullets items={AB.intro.points.map((p) => pick(p))} />
            </SectionHead>
          </div>
          <Reveal self kind="pop" delay={150} className="card ab-office">
            <div className="ab-office-map" aria-hidden="true">
              <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice">
                {Array.from({ length: 9 }, (_, i) => <line key={`a${i}`} className="ab-street" x1={-40 + i * 60} y1="0" x2={40 + i * 60} y2="180" />)}
                {Array.from({ length: 5 }, (_, i) => <line key={`b${i}`} className="ab-street" x1="0" y1={20 + i * 40} x2="400" y2={i * 40 - 10} />)}
                <path className="ab-street main" d="M0 120 L 400 60" />
                <circle className="ab-pin-ring" cx="206" cy="89" r="16" />
                <circle className="ab-pin" cx="206" cy="89" r="7" />
              </svg>
            </div>
            <div className="ab-office-body">
              <p className="ab-office-t"><MapPin aria-hidden="true" />{pick(AB.intro.office)}</p>
              <p className="ab-office-a">{pick(AB.intro.address)}</p>
              <dl className="ab-facts">
                {AB.intro.facts.map(([k, v], i) => <div key={i}><dt>{pick(k)}</dt><dd>{pick(v)}</dd></div>)}
              </dl>
              <a className="link" href={mapsLink(ADDRESS)} target="_blank" rel="noopener noreferrer">{pick(AB.intro.directions)} <ArrowUpRight aria-hidden="true" /></a>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section tone="tint" labelledBy="ab-val-t">
        <SectionHead eyebrow={pick(AB.values.eyebrow)} title={pick(AB.values.title)} accent={pick(AB.values.accent)} id="ab-val-t" center />
        <CardGrid cols={3} className="ab-values">
          {AB.values.items.map((v, i) => {
            const Icon = valueIcons[i];
            return <FeatureCard key={i} icon={<Icon />} title={pick(v.t)} className="ring"><p>{pick(v.d)}</p></FeatureCard>;
          })}
        </CardGrid>
      </Section>

      <Section labelledBy="ab-ms-t">
        <SectionHead eyebrow={pick(AB.milestones.eyebrow)} title={pick(AB.milestones.title)} accent={pick(AB.milestones.accent)} id="ab-ms-t" />
        <Milestones />
      </Section>

      <Section tone="tint" id="people" labelledBy="ab-people-t" glow="bl">
        <SectionHead eyebrow={pick(P.eyebrow)} title={pick(P.title)} accent={pick(P.accent)} lead={pick(P.lead)} id="ab-people-t" />
        <div className="ab-filter" role="group" aria-label={pick(P.filter)}>
          {P.depts.map((d) => (
            <button key={d.key} type="button" className="ab-chip" aria-pressed={dept === d.key} onClick={() => setDept(d.key)} data-dept={d.key}>
              {pick(d.label)}
              <span className="ab-chip-n tabnum" aria-hidden="true">{team.filter((m) => inDept(m, d.key)).length}</span>
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">{pick(P.showing).replace("{n}", String(shown.length))}</p>
        <Reveal as="ul" className="ab-people" kind="pop" stagger={50} key={dept} data-testid="people">
          {shown.map((m) => (
            <li key={m.name}>
              <button type="button" className="ab-person" onClick={(e) => openBio(m, e.currentTarget)} aria-haspopup="dialog"
                aria-label={`${pick(P.open)} ${m.name}`}>
                <Portrait m={m} />
                <span className="ab-person-b">
                  <span className="ab-person-n">{m.name}</span>
                  <span className="ab-person-t">{fr ? m.titleFr ?? m.title : m.title}</span>
                  {m.designations?.length ? <span className="ab-tags">{m.designations.slice(0, 3).map((d) => <span key={d} className="ab-tag">{d}</span>)}</span> : null}
                </span>
                <span className="ab-person-go" aria-hidden="true"><ArrowUpRight /></span>
              </button>
            </li>
          ))}
        </Reveal>
      </Section>

      <CtaBand title={pick(AB.join.title)} accent={pick(AB.join.accent)} text={pick(AB.join.text)}>
        <ButtonLink href={mailto("info@nymbus.ca", pick(AB.join.careersSubject))}>{pick(AB.join.careers)}</ButtonLink>
        <ButtonLink href="/contact" variant="ghost">{pick(AB.join.contact)}</ButtonLink>
      </CtaBand>
      <Bio m={open} onClose={closeBio} />
    </div>
  );
}
