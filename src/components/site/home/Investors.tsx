"use client";
/**
 * Trusted by leading institutions: the deck's representative client logos (institutions, platforms) and the
 * investor mix donut (45 / 35 / 20, as % of AUM) whose arcs sweep in and focus on hover.
 */
import { useState } from "react";
import { Reveal, useInView, CountUp } from "@/components/v3/motion";
import { useTranslation } from "@/lib/i18n";
import { HOME } from "../copy";
import { Foot, Head } from "../ui";

const INST: { src: string; s: number; alt: string; star?: boolean }[] = [
  { src: "/logos/fondaction.png", s: 1, alt: "Fondaction" },
  { src: "/logos/fmoq.png", s: 1.05, alt: "Fonds FMOQ" },
  { src: "/logos/qemp.png", s: 0.9, alt: "QEMP by Innocap", star: true },
  { src: "/logos/securitas.png", s: 0.62, alt: "Caisse de retraite et d'épargne du Groupe Securitas" },
  { src: "/logos/gardaworld.png", s: 0.7, alt: "GardaWorld" },
  { src: "/logos/batirente.png", s: 1.08, alt: "Bâtirente" },
];
const PLAT: { src: string; s: number; alt: string }[] = [
  { src: "/logos/nbf.png", s: 1.05, alt: "National Bank Financial Wealth Management" },
  { src: "/logos/rbc-ds.png", s: 1.02, alt: "RBC Dominion Securities Wealth Management" },
  { src: "/logos/ia.png", s: 1.12, alt: "iA Financial Group" },
];
const COLORS = ["#1a73e8", "#4fa3ff", "#9cc8ff"];

function Donut({ parts }: { parts: { v: number; label: string }[] }) {
  const [ref, seen] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const [focus, setFocus] = useState(0);
  const size = 260, thick = 26, r = size / 2 - thick / 2 - 6, C = 2 * Math.PI * r, gap = thick + 6;
  const total = parts.reduce((s, p) => s + p.v, 0);
  let acc = 0;
  return (
    <div ref={ref} className={`donut ${seen ? "go" : ""}`}>
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle r={r} cx={size / 2} cy={size / 2} className="donut-bg" strokeWidth={thick} />
        {parts.map((p, i) => {
          const len = (p.v / total) * C;
          const dash = Math.max(0.01, len - gap);
          const off = -(acc + gap / 2);
          acc += len;
          return (
            <circle
              key={i} r={r} cx={size / 2} cy={size / 2} fill="none" stroke={COLORS[i]} strokeWidth={thick} strokeLinecap="round"
              strokeDasharray={`${dash} ${C}`} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className={`arc ${focus === i ? "on" : ""}`} style={{ ["--len" as string]: dash, ["--d" as string]: `${i * 220}ms` }}
              onPointerEnter={() => setFocus(i)}
            />
          );
        })}
      </svg>
      <div className="donut-c" aria-live="polite">
        <span className="fig m grad tabnum">{parts[focus].v}%</span>
        <span className="small">{parts[focus].label}</span>
      </div>
      <ul className="donut-l">
        {parts.map((p, i) => (
          <li key={i}>
            <button type="button" className={focus === i ? "on" : ""} onClick={() => setFocus(i)} onPointerEnter={() => setFocus(i)} onFocus={() => setFocus(i)} aria-pressed={focus === i}>
              <i style={{ background: COLORS[i] }} aria-hidden="true" />
              <span>{p.label}</span>
              <span className="mbar" aria-hidden="true"><b style={{ width: `${(p.v / 45) * 100}%`, background: COLORS[i] }} /></span>
              <em className="tabnum"><CountUp value={p.v} decimals={0} suffix="%" /></em>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Investors() {
  const { pick } = useTranslation();
  const I = HOME.investors;
  const parts = I.parts.map((p) => ({ v: p.v, label: pick(p.label) }));
  return (
    <section className="screen glow investors" data-swap="" aria-labelledby="inv-t">
      <div className="wrap wide">
        <Head eyebrow={pick(I.eyebrow)} title={pick(I.title)} accent={pick(I.accent)} id="inv-t" size="h1" className="center-head" />
        <div className="inv-grid">
          <div className="inv-logos">
            <div>
              <Reveal self><h3 className="h3">{pick(I.inst)}</h3><p className="small">{pick(I.instS)}</p></Reveal>
              <Reveal as="ul" className="logos two" kind="pop" stagger={80}>
                {INST.map((l) => (
                  <li key={l.src} style={{ ["--s" as string]: l.s }}><img src={l.src} alt={l.alt} loading="lazy" decoding="async" />{l.star ? <b className="star" aria-hidden="true">*</b> : null}</li>
                ))}
              </Reveal>
            </div>
            <div>
              <Reveal self><h3 className="h3">{pick(I.plat)}</h3><p className="small">{pick(I.platS)}</p></Reveal>
              <Reveal as="ul" className="logos" kind="pop" stagger={80} delay={200}>
                {PLAT.map((l) => <li key={l.src} style={{ ["--s" as string]: l.s }}><img src={l.src} alt={l.alt} loading="lazy" decoding="async" /></li>)}
              </Reveal>
            </div>
            <Reveal as="p" className="inv-more" self>{pick(I.more)}</Reveal>
          </div>
          <Reveal className="inv-mix" self kind="pop" delay={200}>
            <h3 className="h3">{pick(I.mix)} <span className="small">{pick(I.mixS)}</span></h3>
            <Donut parts={parts} />
          </Reveal>
        </div>
        <Foot>{pick(I.qemp)} · {pick(I.foot)}</Foot>
      </div>
    </section>
  );
}
