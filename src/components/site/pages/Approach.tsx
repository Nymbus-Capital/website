"use client";
/**
 * /approach: how Nymbus invests. The previous site's sections (hero, four-step methodology, philosophy),
 * improved and completed with the bond process (two systems), the protection overlay, research and
 * technology, and the team. Motion: the pipeline diagram draws itself step by step when it scrolls into
 * view, the step line fills with the scroll, the risk flow converges, cards pop in.
 */
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Brain,
  Database,
  FlaskConical,
  Layers,
  Microscope,
  Radar,
  Shield,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { useInView } from "@/components/motion/motion";
import { useTranslation } from "@/lib/i18n";
import { team as staticTeam, type TeamMember } from "@/data/team";
import { introCopy } from "@/lib/cms/map";
import type { CmsPageIntro } from "@/lib/cms/types";
import {
  Bullets,
  ButtonLink,
  CardGrid,
  CtaBand,
  FeatureCard,
  PageHero,
  Reveal,
  Section,
  SectionHead,
  Stat,
  StatRow,
} from "../kit";
import { AP } from "./approach.copy";
import { Portrait } from "./Portrait";
import { countCharter, countPhD, membersOf } from "./lib/people";
import "./pages.css";

/* ------------------------------------------------------------------ pipeline art (one per step) */

// deterministic scatter (no Math.random: server and client render the same dots)
const DOTS = (() => {
  let s = 7;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 34 }, () => ({ x: 14 + r() * 172, y: 12 + r() * 96, big: r() > 0.78 }));
})();
const LINKS: [number, number][] = [
  [0, 5],
  [5, 9],
  [9, 14],
  [2, 7],
  [7, 12],
  [12, 20],
  [3, 16],
  [16, 22],
];

function ArtData() {
  return (
    <svg viewBox="0 0 200 120" aria-hidden="true" className="ap-art-svg">
      {LINKS.map(([a, b], k) => (
        <line
          key={`l${k}`}
          className="ap-link"
          x1={DOTS[a].x}
          y1={DOTS[a].y}
          x2={DOTS[b].x}
          y2={DOTS[b].y}
          style={{ ["--k" as string]: k }}
        />
      ))}
      {DOTS.map((d, k) => (
        <circle
          key={k}
          className={`ap-dot ${d.big ? "hl" : ""}`}
          cx={d.x}
          cy={d.y}
          r={d.big ? 4 : 2.6}
          style={{ ["--k" as string]: k }}
        />
      ))}
    </svg>
  );
}

function ArtSignals() {
  const waves = [
    "M6 78 C 30 40, 48 40, 70 70 S 110 104, 132 66 S 172 30, 194 52",
    "M6 60 C 28 72, 52 84, 76 62 S 116 30, 140 52 S 176 86, 194 74",
    "M6 92 C 34 86, 60 62, 88 58 S 140 50, 194 26",
  ];
  return (
    <svg viewBox="0 0 200 120" aria-hidden="true" className="ap-art-svg">
      {[30, 60, 90].map((y) => (
        <line key={y} className="ap-grid" x1="0" y1={y} x2="200" y2={y} />
      ))}
      {waves.map((d, k) => (
        <path
          key={k}
          className={`ap-wave ${k === 2 ? "hl" : ""}`}
          d={d}
          pathLength={1}
          style={{ ["--k" as string]: k }}
        />
      ))}
      <circle className="ap-end" cx="194" cy="26" r="5" />
    </svg>
  );
}

function ArtPortfolio() {
  const h = [58, 86, 44, 96, 70, 36, 78];
  return (
    <svg viewBox="0 0 200 120" aria-hidden="true" className="ap-art-svg">
      <line className="ap-grid" x1="0" y1="112" x2="200" y2="112" />
      {h.map((v, k) => (
        <rect
          key={k}
          className={`ap-bar ${k === 3 ? "hl" : ""}`}
          x={14 + k * 26}
          y={112 - v}
          width="16"
          height={v}
          rx="4"
          style={{ ["--k" as string]: k }}
        />
      ))}
    </svg>
  );
}

function ArtRisk() {
  return (
    <svg viewBox="0 0 200 120" aria-hidden="true" className="ap-art-svg">
      <path className="ap-band" d="M0 30 C 60 24, 140 24, 200 30 L 200 92 C 140 98, 60 98, 0 92 Z" />
      <line className="ap-limit" x1="0" y1="24" x2="200" y2="24" />
      <line className="ap-limit" x1="0" y1="98" x2="200" y2="98" />
      <path
        className="ap-risk-line"
        pathLength={1}
        d="M4 62 C 20 44, 30 50, 42 66 S 64 84, 78 70 S 98 36, 112 50 S 134 78, 150 64 S 176 48, 196 58"
      />
      <circle className="ap-end" cx="196" cy="58" r="5" />
    </svg>
  );
}

const ART = [ArtData, ArtSignals, ArtPortfolio, ArtRisk];
const STEP_ICONS = [Database, Brain, Layers, ShieldCheck];
const STEP_COLORS = ["#1a73e8", "#0b8fd6", "#00a3e0", "#188038"];

function Pipeline() {
  const { pick } = useTranslation();
  const [ref, seen] = useInView<HTMLElement>({ threshold: 0.3 });
  return (
    <figure ref={ref} className="ap-pipe" data-on={seen ? "" : undefined} data-testid="approach-pipeline">
      <ol className="ap-pipe-list">
        {AP.steps.map((s, i) => {
          const Art = ART[i];
          const Icon = STEP_ICONS[i];
          return (
            <li key={i} className="ap-node" style={{ ["--i" as string]: i, ["--bc" as string]: STEP_COLORS[i] }}>
              <div className="ap-art">
                <Art />
              </div>
              <div className="ap-node-head">
                <span
                  className="bubble ap-node-b"
                  style={{ ["--bc" as string]: STEP_COLORS[i], ["--size" as string]: "40px" }}
                  aria-hidden="true"
                >
                  <Icon />
                </span>
                <span className="ap-node-no">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <p className="ap-node-t">{pick(s.title)}</p>
              <Bullets size="sm" className="ap-node-l" items={s.bullets.map((b) => pick(b))} />
              {"note" in s && s.note ? <p className="fine ap-node-n">{pick(s.note)}</p> : null}
            </li>
          );
        })}
      </ol>
      <figcaption className="ap-loop">
        <span className="ap-loop-line" aria-hidden="true" />
        <span className="ap-loop-t">
          <Workflow aria-hidden="true" />
          {pick(AP.pipe.loop)}
        </span>
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ protection overlay */

function RiskFlow() {
  const { pick } = useTranslation();
  const [ref, seen] = useInView<HTMLDivElement>({ threshold: 0.3 });
  const O = AP.overlay;
  return (
    <div ref={ref} className="ap-flow" data-on={seen ? "" : undefined} data-testid="overlay-flow">
      <div className="ap-flow-col">
        <p className="ap-flow-k">{pick(O.suffer)}</p>
        <ul className="ap-risks">
          {O.risks.map((r, i) => (
            <li key={i} style={{ ["--k" as string]: i }}>
              <Activity aria-hidden="true" />
              {pick(r)}
            </li>
          ))}
        </ul>
      </div>
      <svg className="ap-conv" viewBox="0 0 96 220" aria-hidden="true">
        {[36, 110, 184].map((y, k) => (
          <path key={y} pathLength={1} d={`M0 ${y} C 50 ${y}, 46 110, 96 110`} style={{ ["--k" as string]: k }} />
        ))}
      </svg>
      <div className="ap-flow-col ap-flow-mid">
        <p className="ap-flow-k">{pick(O.common)}</p>
        <div className="ap-vol">
          <svg viewBox="0 0 120 40" aria-hidden="true">
            <path
              pathLength={1}
              d="M2 20 L 14 20 L 20 6 L 28 34 L 36 10 L 44 30 L 52 14 L 60 26 L 68 4 L 76 36 L 84 12 L 92 28 L 100 20 L 118 20"
            />
          </svg>
          <span>{pick(O.vol)}</span>
        </div>
      </div>
      <svg className="ap-arrow" viewBox="0 0 96 220" aria-hidden="true">
        <path pathLength={1} d="M4 110 L 88 110 M 80 102 L 88 110 L 80 118" />
      </svg>
      <div className="ap-flow-col">
        <p className="ap-flow-k">{pick(O.solution)}</p>
        <div className="ap-sol card">
          <span
            className="bubble"
            style={{ ["--bc" as string]: "#188038", ["--size" as string]: "44px" }}
            aria-hidden="true"
          >
            <Shield />
          </span>
          <h3 className="h4">{pick(O.solT)}</h3>
          <p>{pick(O.solD)}</p>
        </div>
      </div>
    </div>
  );
}

function OverlayStack() {
  const { pick } = useTranslation();
  const [ref, seen] = useInView<HTMLDivElement>({ threshold: 0.35 });
  const O = AP.overlay;
  return (
    <div ref={ref} className="ap-stack card" data-on={seen ? "" : undefined}>
      <div className="ap-stack-text">
        <h3 className="h4">{pick(O.stackT)}</h3>
        <p>{pick(O.stackD)}</p>
      </div>
      <div className="ap-stack-viz" aria-hidden="true">
        <div className="ap-col">
          <div className="ap-col-bars">
            <span className="ap-seg bonds">{pick(O.bonds)}</span>
          </div>
          <p>{pick(O.before)}</p>
        </div>
        <div className="ap-col">
          <div className="ap-col-bars">
            <span className="ap-seg ovl">{pick(O.overlay)}</span>
            <span className="ap-seg bonds">{pick(O.bonds)}</span>
          </div>
          <p>{pick(O.after)}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ risk first: ultra-micro analysis, at scale */

// deterministic universe (no Math.random: server and client render the same cells)
const UNIVERSE = (() => {
  let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: 80 }, (_, i) => ({ c: i % 10, r: Math.floor(i / 10), v: r() }));
})();
const PICK = { c: 6, r: 3 };
const METRIC_W = [0.72, 0.58, 0.34, 0.86];

function UltraMicro() {
  const { pick } = useTranslation();
  const [ref, seen] = useInView<HTMLElement>({ threshold: 0.3 });
  const R = AP.risk;
  const cx = 14 + PICK.c * 17 + 6;
  const cy = 30 + PICK.r * 17 + 6;
  return (
    <figure ref={ref} className="ap-um card" data-on={seen ? "" : undefined} data-testid="ultra-micro">
      <svg
        viewBox="0 0 360 200"
        role="img"
        aria-label={`${pick(R.viz)}. ${R.metrics.map((m) => pick(m)).join(", ")}.`}
        className="ap-um-svg"
      >
        <g aria-hidden="true">
          {UNIVERSE.map((u, k) => (
            <rect
              key={k}
              className={`ap-um-cell ${u.v > 0.86 ? "hl" : ""}`}
              x={14 + u.c * 17}
              y={30 + u.r * 17}
              width="12"
              height="12"
              rx="3"
              style={{ ["--k" as string]: u.c + u.r, opacity: 0.25 + u.v * 0.6 }}
            />
          ))}
          <rect className="ap-um-scan" x="10" y="24" width="20" height="144" rx="6" />
          <path className="ap-um-link" pathLength={1} d={`M${cx + 14} ${cy} C ${cx + 50} ${cy}, 190 60, 214 60`} />
          <circle className="ap-um-lens" cx={cx} cy={cy} r="14" />
          <rect className="ap-um-pick" x={cx - 6} y={cy - 6} width="12" height="12" rx="3" />
          <rect className="ap-um-card" x="214" y="34" width="136" height="132" rx="14" />
        </g>
        {R.metrics.map((m, i) => (
          <g key={i} className="ap-um-m" style={{ ["--k" as string]: i }} aria-hidden="true">
            <text x="228" y={58 + i * 30} className="ap-um-t">
              {pick(m)}
            </text>
            <rect x="228" y={64 + i * 30} width="108" height="6" rx="3" className="ap-um-track" />
            <rect
              x="228"
              y={64 + i * 30}
              width={108 * METRIC_W[i]}
              height="6"
              rx="3"
              className={`ap-um-bar ${i === 3 ? "hl" : ""}`}
            />
          </g>
        ))}
        <text x="14" y="16" className="ap-um-tag" aria-hidden="true">
          {pick(R.illus)}
        </text>
      </svg>
    </figure>
  );
}

/* ------------------------------------------------------------------ multi-strategy across asset classes */

function MultiStrategy() {
  const { pick } = useTranslation();
  const [ref, seen] = useInView<HTMLDivElement>({ threshold: 0.25 });
  const M = AP.multi;
  return (
    <figure className="ap-ms" data-testid="multi-strategy">
      <div
        ref={ref}
        className="ap-ms-viz card"
        role="img"
        data-on={seen ? "" : undefined}
        aria-label={`${pick(M.strategiesK)}: ${M.strategies.map((x) => pick(x)).join(", ")}. ${pick(M.assetsK)}: ${M.assets.map((x) => pick(x)).join(", ")}. ${pick(M.overlay)}.`}
        style={{ ["--cols" as string]: M.assets.length }}
      >
        <div className="ap-ms-ovl" aria-hidden="true">
          <Shield />
          {pick(M.overlay)}
        </div>
        <div className="ap-ms-grid" aria-hidden="true">
          <span className="ap-ms-k">
            {pick(M.strategiesK)} · {pick(M.assetsK)}
          </span>
          {M.assets.map((a, c) => (
            <span key={c} className="ap-ms-a" style={{ ["--c" as string]: c }}>
              {pick(a)}
            </span>
          ))}
          {M.strategies.map((st, r) => (
            <div key={r} className="ap-ms-row" style={{ ["--r" as string]: r }}>
              <span className="ap-ms-s">{pick(st)}</span>
              {M.assets.map((_, c) => (
                <i key={c} className="ap-ms-cell" style={{ ["--c" as string]: c, ["--r" as string]: r }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <figcaption className="fine ap-ms-note">{pick(M.note)}</figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ page */

export function Approach({ members: team = staticTeam, intro }: { members?: TeamMember[]; intro?: CmsPageIntro }) {
  const { locale, pick } = useTranslation();
  // hero copy: the WordPress page intro where filled, else the coded copy (identical rendering without WordPress)
  const hero = introCopy(AP.hero, intro);
  const faces = membersOf(team, "all")
    .filter((m) => m.photo && m.department !== "Board")
    .slice(0, 9);
  const riskIcons = [Microscope, Radar, Shield];
  return (
    <div className="pg">
      <PageHero
        eyebrow={pick(AP.hero.eyebrow)}
        title={pick(hero.title)}
        accent={pick(hero.accent)}
        lead={pick(hero.lead)}
        crumbs={[{ href: "/", label: locale === "fr" ? "Accueil" : "Home" }, { label: pick(AP.hero.eyebrow) }]}
      >
        <ButtonLink href="/strategies">{pick(AP.hero.cta1)}</ButtonLink>
        <ButtonLink href="/team" variant="ghost">
          {pick(AP.hero.cta2)}
        </ButtonLink>
      </PageHero>

      <Section labelledBy="ap-risk-t" className="ap-risk-s">
        <div className="split ap-risk">
          <div>
            <SectionHead
              eyebrow={pick(AP.risk.eyebrow)}
              title={pick(AP.risk.title)}
              accent={pick(AP.risk.accent)}
              lead={pick(AP.risk.lead)}
              id="ap-risk-t"
            />
            <Reveal as="ul" stagger={110} className="ap-risk-l">
              {AP.risk.items.map((it, i) => {
                const Icon = riskIcons[i];
                return (
                  <li key={i}>
                    <span
                      className="bubble"
                      style={{ ["--bc" as string]: ["#1a73e8", "#0b8fd6", "#188038"][i], ["--size" as string]: "40px" }}
                      aria-hidden="true"
                    >
                      <Icon />
                    </span>
                    <div>
                      <p className="ap-risk-t">{pick(it.t)}</p>
                      <p className="ap-risk-d">{pick(it.d)}</p>
                    </div>
                  </li>
                );
              })}
            </Reveal>
          </div>
          <UltraMicro />
        </div>
      </Section>

      <Section tone="tint" labelledBy="ap-pipe-t" glow="tr">
        <SectionHead
          eyebrow={pick(AP.pipe.eyebrow)}
          title={pick(AP.pipe.title)}
          accent={pick(AP.pipe.accent)}
          id="ap-pipe-t"
        />
        <Pipeline />
      </Section>

      <Section labelledBy="ap-bonds-t">
        <SectionHead
          eyebrow={pick(AP.bonds.eyebrow)}
          title={pick(AP.bonds.title)}
          accent={pick(AP.bonds.accent)}
          id="ap-bonds-t"
        />
        <Reveal kind="pop" stagger={140} className="ap-systems">
          {AP.bonds.systems.map((s, i) => (
            <article key={i} className="card ap-sys" style={{ ["--bc" as string]: i ? "#00a3e0" : "#1a73e8" }}>
              <p className="ap-sys-tag">{pick(s.tag)}</p>
              <h3 className="h3">{pick(s.name)}</h3>
              <p className="ap-sys-role">{pick(s.role)}</p>
              <dl className="ap-sys-dl">
                {s.facts.map(([k, v], j) => (
                  <div key={j} className="ap-sys-row">
                    <dt>{pick(k)}</dt>
                    <dd>{pick(v)}</dd>
                  </div>
                ))}
              </dl>
              <ol className="ap-sys-steps">
                {s.steps.map((st, j) => (
                  <li key={j}>
                    <span className="ap-sys-n" aria-hidden="true">
                      {j + 1}
                    </span>
                    {pick(st)}
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </Reveal>
      </Section>

      <Section tone="tint" labelledBy="ap-ovl-t" glow="bl">
        <SectionHead
          eyebrow={pick(AP.overlay.eyebrow)}
          title={pick(AP.overlay.title)}
          accent={pick(AP.overlay.accent)}
          lead={pick(AP.overlay.lead)}
          id="ap-ovl-t"
        />
        <RiskFlow />
        <OverlayStack />
        <div className="pg-foot">
          <p className="fine">{pick(AP.overlay.foot1)}</p>
          <p className="fine">{pick(AP.overlay.foot2)}</p>
        </div>
      </Section>

      <Section labelledBy="ap-ms-t" glow="tr">
        <SectionHead
          eyebrow={pick(AP.multi.eyebrow)}
          title={pick(AP.multi.title)}
          accent={pick(AP.multi.accent)}
          lead={pick(AP.multi.lead)}
          id="ap-ms-t"
        />
        <MultiStrategy />
        <h3 className="h4 ap-ms-offers-t">{pick(AP.multi.offersT)}</h3>
        <Reveal as="ul" kind="pop" stagger={110} className="ap-ms-offers">
          {AP.multi.offers.map((o, i) => {
            const links = o.links as { href: string; label?: { en: string; fr: string } }[];
            return (
              <li key={i}>
                {links.length === 1 ? (
                  <Link href={links[0].href} className="card ring ap-ms-offer">
                    <span className="ap-ms-offer-t">{pick(o.t)}</span>
                    <span className="ap-ms-offer-d">{pick(o.d)}</span>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                ) : (
                  // several funds share the card: one link per fund page
                  <div className="card ring ap-ms-offer">
                    <span className="ap-ms-offer-t">{pick(o.t)}</span>
                    <span className="ap-ms-offer-d">{pick(o.d)}</span>
                    <span className="ap-ms-offer-l">
                      {links.map((k) => (
                        <Link key={k.href} href={k.href} className="link">
                          {k.label ? pick(k.label) : null} <ArrowRight aria-hidden="true" />
                        </Link>
                      ))}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </Reveal>
      </Section>

      <Section tone="tint" labelledBy="ap-rt-t">
        <SectionHead
          eyebrow={pick(AP.research.eyebrow)}
          title={pick(AP.research.title)}
          accent={pick(AP.research.accent)}
          lead={pick(AP.research.lead)}
          id="ap-rt-t"
        />
        <div className="ap-rt">
          <div className="ap-rt-life">
            <h3 className="h4">{pick(AP.research.lifecycleT)}</h3>
            <Reveal as="ol" className="ap-life" stagger={120}>
              {AP.research.lifecycle.map((s, i) => (
                <li key={i}>
                  <span className="ap-life-n tabnum" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="ap-life-t">{pick(s.t)}</p>
                    <p className="ap-life-d">{pick(s.d)}</p>
                  </div>
                </li>
              ))}
            </Reveal>
          </div>
          <CardGrid cols={2} className="ap-caps">
            {AP.research.caps.map((c, i) => {
              const Icon = [Database, Brain, FlaskConical, Activity][i];
              return <FeatureCard key={i} icon={<Icon />} title={pick(c.t)} />;
            })}
          </CardGrid>
        </div>
      </Section>

      <Section labelledBy="ap-team-t">
        <div className="ap-team">
          <div>
            <SectionHead
              eyebrow={pick(AP.team.eyebrow)}
              title={pick(AP.team.title)}
              accent={pick(AP.team.accent)}
              id="ap-team-t"
            />
            <StatRow className="ap-team-stats">
              <Stat value={team.length} label={pick(AP.team.people)} lang={locale} />
              <Stat value={countPhD(team)} label={pick(AP.team.phd)} lang={locale} />
              <Stat value={countCharter(team)} label={pick(AP.team.cfa)} lang={locale} />
            </StatRow>
            <div className="actions">
              <ButtonLink href="/team">{pick(AP.team.cta)}</ButtonLink>
            </div>
          </div>
          <Reveal as="ul" kind="pop" stagger={60} className="ap-faces" aria-hidden="true">
            {faces.map((m) => (
              <li key={m.name}>
                <Portrait m={m} size="m" />
              </li>
            ))}
          </Reveal>
        </div>
      </Section>

      <CtaBand title={pick(AP.cta.title)} accent={pick(AP.cta.accent)}>
        <ButtonLink href="/strategies">{pick(AP.cta.b1)}</ButtonLink>
        <ButtonLink href="/contact" variant="ghost">
          {pick(AP.cta.b2)}
        </ButtonLink>
      </CtaBand>
    </div>
  );
}
