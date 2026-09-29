"use client";
/** Two pillars (deck "our investment philosophy"): big gradient numerals, a light rule between them. */
import { Reveal } from "@/components/v3/motion";
import { useTranslation } from "@/lib/i18n";
import { HOME } from "../copy";
import { Head } from "../ui";

export function Pillars() {
  const { pick } = useTranslation();
  const P = HOME.pillars;
  return (
    <section className="screen glow pillars" data-swap="" aria-labelledby="pillars-t">
      <div className="wrap">
        <Head kicker={pick(P.eyebrow)} title={pick(P.title)} accent={pick(P.accent)} id="pillars-t" size="h1" breakAccent className="center-head" />
        <Reveal className="pillar-grid" kind="pop" stagger={180}>
          {P.items.map((it, i) => (
            <article key={i} className={`pillar ${i ? "p2" : "p1"}`}>
              <span className={`pillar-n ${i ? "g-orange" : "g-blue"}`} aria-hidden="true">0{i + 1}</span>
              <p className="pillar-k">{pick(it.k)}</p>
              <h3 className="h3">{pick(it.t)}</h3>
              <p className="body">{pick(it.d)}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
