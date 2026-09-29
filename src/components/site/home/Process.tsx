"use client";
/**
 * The two-system bond process: system 1 (macro, blue) and system 2 (micro, orange), phases 1 to 4 in glowing
 * glass bubbles joined by a light path that draws itself with the scroll; each bubble ignites as the light
 * reaches it.
 */
import { Reveal, useScrub } from "@/components/v3/motion";
import { useTranslation } from "@/lib/i18n";
import { HOME } from "../copy";
import { Head } from "../ui";

const COLS = ["#1f74ff", "#f5891f"];

export function Process() {
  const { pick } = useTranslation();
  const P = HOME.process;
  const track = useScrub<HTMLDivElement>((k, el) => {
    // the light runs from 10 % to 90 % of the scrub window
    const p = Math.min(1, Math.max(0, (k - 0.1) / 0.8));
    el.style.setProperty("--p", p.toFixed(4));
    el.querySelectorAll<HTMLElement>("[data-at]").forEach((b) => {
      if (p >= Number(b.dataset.at) - 0.001) b.setAttribute("data-lit", ""); else b.removeAttribute("data-lit");
    });
  });
  let n = 0;
  return (
    <section className="screen glow process" data-swap="" aria-labelledby="process-t">
      <div className="wrap wide">
        <Head eyebrow={pick(P.eyebrow)} title={pick(P.title)} accent={pick(P.accent)} id="process-t" size="h1" className="center-head" />
        <div className="flow" ref={track}>
          <div className="flow-line" aria-hidden="true"><i /></div>
          {P.systems.map((s, i) => (
            <div key={i} className="fsys" style={{ ["--sc" as string]: COLS[i] }}>
              <Reveal className="fsys-h" self>
                <span className="fsys-tag">{pick(s.tag)}</span>
                <h3 className="h3">{pick(s.name)}</h3>
              </Reveal>
              <ol className="fsteps" start={i * 2 + 1}>
                {s.steps.map((st) => {
                  n += 1;
                  return (
                    <li key={n} className="fst">
                      <span className="bubble" data-at={((n - 1) / 3).toFixed(4)} style={{ ["--bc" as string]: COLS[i] }} aria-hidden="true">{n}</span>
                      <Reveal as="p" className="fd" self delay={120}>{pick(st)}</Reveal>
                    </li>
                  );
                })}
              </ol>
              <Reveal as="ul" className="fb" stagger={70} delay={200}>
                {s.bullets.map((b, j) => <li key={j}>{pick(b)}</li>)}
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
