"use client";
/**
 * /critical-concepts: three ideas behind the funds, each told by one large animation with very little text —
 * what an overlay is, how futures settle daily, and why systematic analysis covers more of the bond universe.
 */
import { PageHero, Section, SectionHead } from "../kit";
import { useTranslation } from "@/lib/i18n";
import { CC, CONCEPTS } from "./concepts-copy";
import { ConceptPanel } from "./ConceptPanel";
import "./concepts.css";

export function CriticalConcepts() {
  const { pick } = useTranslation();
  return (
    <>
      <PageHero eyebrow={pick(CC.hero.eyebrow)} title={pick(CC.hero.title)} accent={pick(CC.hero.accent)} lead={pick(CC.hero.lead)} id="cc-t">
        <nav aria-label={pick(CC.jump)} className="cc-jump" data-testid="concepts-jump">
          {CONCEPTS.map((c, i) => (
            <a key={c.id} href={`#${c.anchor}`}><i aria-hidden="true">{i + 1}</i>{pick(c.copy.eyebrow).split(" · ").slice(1).join(" · ")}</a>
          ))}
        </nav>
      </PageHero>
      {CONCEPTS.map((c, i) => (
        <Section key={c.id} id={c.anchor} labelledBy={`${c.id}-t`} tone={i === 1 ? "tint" : "white"} glow={i === 1 ? "bl" : "tr"} className="cc-sec">
          {c.aliases.map((a) => <span key={a} id={a} className="cc-alias" aria-hidden="true" />)}
          <SectionHead eyebrow={pick(c.copy.eyebrow)} title={pick(c.copy.title)} accent={pick(c.copy.accent)} lead={pick(c.copy.lead)} id={`${c.id}-t`} center />
          <ConceptPanel id={c.id} />
          {c.id === "coverage" ? <p className="cc-note" data-testid="coverage-note">{pick(CC.coverage.note)}</p> : null}
        </Section>
      ))}
    </>
  );
}
