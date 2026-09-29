"use client";
/**
 * /team: the people (src/data/team.ts, photos on www.nymbus.ca), filterable by department (a person can
 * belong to several). Each portrait opens a bio drawer (native <dialog>: focus trap, Escape, backdrop) in
 * the current language.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { CountUp, Reveal, ScreenSwap } from "@/components/v3/motion";
import { l, useTranslation, type L } from "@/lib/i18n";
import { team, type Department, type TeamMember } from "@/data/team";
import { TEAM_COPY } from "../copy";
import { ContactCta } from "../home/Summary";
import { PageHero } from "./PageHero";

const DEPTS: { key: Department | "all"; label: L }[] = [
  { key: "all", label: l("everyone", "tout le monde") },
  { key: "Leadership", label: l("leadership", "direction") },
  { key: "Investment Team", label: l("investment", "investissement") },
  { key: "Quantitative Research", label: l("quantitative research", "recherche quantitative") },
  { key: "Operations", label: l("governance & operations", "gouvernance et opérations") },
  { key: "Board", label: l("board", "conseil") },
];

const P = {
  eyebrow: l("team", "équipe"),
  title: l("scientists", "des scientifiques"), accent: l("and market veterans", "et des vétérans des marchés"),
  lead: l("scientists and market veterans tackling problems traditional managers don't", "scientifiques et vétérans des marchés s'attaquant à des problèmes que les gestionnaires traditionnels ignorent"),
  people: l("people", "personnes"), phd: l("physics PhDs", "doctorats en physique"), years: l("years average experience", "ans d’expérience moyenne"),
  filter: l("filter by department", "filtrer par département"),
  bio: l("biography", "biographie"), edu: l("education", "formation"), prev: l("previous roles", "postes précédents"),
  joined: l("joined", "arrivée"), open: l("read the biography of", "lire la biographie de"),
  showing: l("{n} people", "{n} personnes"),
};

const inDept = (m: TeamMember, d: Department | "all") => d === "all" || m.department === d || !!m.additionalDepartments?.includes(d);

function Portrait({ m, size = "m" }: { m: TeamMember; size?: "m" | "l" }) {
  const [broken, setBroken] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  // an image that failed before hydration never fires onError: check once mounted
  useEffect(() => { const i = img.current; if (i && i.complete && i.naturalWidth === 0) setBroken(true); }, []);
  return (
    <span className={`pt pt-${size}`} style={{ ["--pc" as string]: m.color }}>
      {m.photo && !broken ? (
        <img ref={img} src={m.photo} alt="" loading="lazy" decoding="async" onError={() => setBroken(true)} />
      ) : (
        <span className="pt-i" aria-hidden="true">{m.initials}</span>
      )}
    </span>
  );
}

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
  return (
    <dialog
      ref={ref}
      className="bio"
      aria-labelledby="bio-name"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      data-testid="bio-dialog"
    >
      {m ? (
        <div className="bio-in">
          <button type="button" className="icon-btn bio-x" onClick={onClose} aria-label={fr ? "Fermer" : "Close"}><X size={18} aria-hidden="true" /></button>
          <div className="bio-head">
            <Portrait m={m} size="l" />
            <div>
              <h2 id="bio-name" className="h2">{m.name.toLowerCase()}</h2>
              <p className="bio-role">{fr ? m.titleFr ?? m.title : m.title}</p>
              {m.designations?.length ? <p className="bio-des">{m.designations.map((d) => <span key={d} className="pill brand">{d}</span>)}</p> : null}
            </div>
          </div>
          <div className="bio-body">
            <h3 className="lbl">{pick(P.bio)}</h3>
            <p className="body">{fr ? m.bioFr ?? m.bio : m.bio}</p>
            {m.previousRoles?.length ? (
              <>
                <h3 className="lbl">{pick(P.prev)}</h3>
                <ul className="bio-list">{(fr ? m.previousRolesFr ?? m.previousRoles : m.previousRoles).map((r) => <li key={r}>{r}</li>)}</ul>
              </>
            ) : null}
            {m.education?.length ? (
              <>
                <h3 className="lbl">{pick(P.edu)}</h3>
                <ul className="bio-list">{m.education.map((r) => <li key={r}>{r}</li>)}</ul>
              </>
            ) : null}
            {m.yearJoined ? <p className="small">{pick(P.joined)} · {m.yearJoined}</p> : null}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

export function Team() {
  const { locale, pick } = useTranslation();
  const fr = locale === "fr";
  const [dept, setDept] = useState<Department | "all">("all");
  const [open, setOpen] = useState<TeamMember | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const shown = useMemo(() => team.filter((m) => inDept(m, dept)), [dept]);
  const phds = team.filter((m) => m.designations?.some((d) => /^PhD/i.test(d)) || m.education?.some((e) => /^PhD/i.test(e))).length;

  const openBio = (m: TeamMember, el: HTMLElement) => { lastFocus.current = el; setOpen(m); };
  const closeBio = () => { setOpen(null); requestAnimationFrame(() => lastFocus.current?.focus()); };

  return (
    <div className="stage">
      <ScreenSwap />
      <PageHero eyebrow={pick(P.eyebrow)} title={pick(P.title)} accent={pick(P.accent)} lead={pick(TEAM_COPY.investment.sub)}>
        <Reveal className="team-figs" delay={600} stagger={120}>
          <div><span className="fig m g-blue"><CountUp value={team.length} decimals={0} lang={locale} /></span><span className="fig-label">{pick(P.people)}</span></div>
          <div><span className="fig m g-cyan"><CountUp value={phds} decimals={0} lang={locale} /></span><span className="fig-label">{pick(P.phd)}</span></div>
          <div><span className="fig m g-green"><CountUp value={23} decimals={0} lang={locale} /></span><span className="fig-label">{pick(P.years)}</span></div>
        </Reveal>
      </PageHero>

      <section className="screen glow auto team-s" data-swap="" aria-labelledby="team-grid-t">
        <div className="wrap wide">
          <h2 id="team-grid-t" className="sr-only">{pick(P.eyebrow)}</h2>
          <div className="filters" role="toolbar" aria-label={pick(P.filter)}>
            {DEPTS.map((d) => (
              <button key={d.key} type="button" className={`chip ${dept === d.key ? "on" : ""}`} aria-pressed={dept === d.key} onClick={() => setDept(d.key)}>
                {pick(d.label)}
                <span className="chip-n tabnum">{team.filter((m) => inDept(m, d.key)).length}</span>
              </button>
            ))}
          </div>
          <p className="sr-only" aria-live="polite">{pick(P.showing).replace("{n}", String(shown.length))}</p>
          <Reveal as="ul" className="people" kind="pop" stagger={60} key={dept}>
            {shown.map((m) => (
              <li key={m.name}>
                <button type="button" className="person" onClick={(e) => openBio(m, e.currentTarget)} aria-label={`${pick(P.open)} ${m.name}`} aria-haspopup="dialog">
                  <Portrait m={m} />
                  <span className="person-n">{m.name}</span>
                  <span className="person-t small">{fr ? m.titleFr ?? m.title : m.title}</span>
                  <span className="person-s small">{fr ? m.summaryFr ?? m.summary : m.summary}</span>
                  <span className="person-go" aria-hidden="true"><ArrowUpRight size={16} /></span>
                </button>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="screen dark auto team-gov" data-swap="" aria-labelledby="gov-t">
        <div className="wrap narrow" style={{ textAlign: "center" }}>
          <Reveal className="kicker" self style={{ justifyContent: "center" }}><span className="mark" aria-hidden="true" />{pick(TEAM_COPY.governance.title)}</Reveal>
          <Reveal as="p" className="h2" self id="gov-t">{pick(TEAM_COPY.governance.sub)}</Reveal>
        </div>
      </section>

      <ContactCta />
      <Bio m={open} onClose={closeBio} />
    </div>
  );
}
