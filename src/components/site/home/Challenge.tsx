"use client";
/**
 * The fixed income challenge: three risks converge (light lines) into one ring, "elevated volatility",
 * whose signal trembles inside it; below, our solution. Deck wording and footnote.
 */
import { ChevronsLeftRight, Flame, ShieldCheck, TrendingUp } from "lucide-react";
import { Reveal, useInView } from "@/components/v3/motion";
import { useTranslation } from "@/lib/i18n";
import { HOME } from "../copy";
import { Foot, Head } from "../ui";

const ICONS = [TrendingUp, Flame, ChevronsLeftRight];

/** Jagged "volatility" trace for the ring: deterministic, so server and client render the same path. */
function volPath(w: number, h: number) {
  const pts: string[] = [];
  const n = 36;
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * w;
    const env = Math.sin((i / n) * Math.PI);
    const y = h / 2 + env * h * 0.42 * Math.sin(i * 2.7) * Math.cos(i * 0.9 + 1);
    pts.push(`${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

export function Challenge() {
  const { pick } = useTranslation();
  const X = HOME.challenge;
  const [ref, seen] = useInView<HTMLDivElement>({ threshold: 0.3 });
  return (
    <section className="screen glow challenge" data-swap="" aria-labelledby="challenge-t">
      <div className="wrap wide">
        <Head eyebrow={pick(X.eyebrow)} title={pick(X.title)} accent={pick(X.accent)} sub={pick(X.sub)} id="challenge-t" size="h1" className="center-head" />

        <div ref={ref} className={`fic ${seen ? "go" : ""}`}>
          <div className="fic-prob">
            <Reveal className="fic-lbl" self><span className="lbl">{pick(X.problem)}</span><span className="h3">{pick(X.suffer)}</span></Reveal>
            <Reveal as="ul" className="fic-risks" kind="pop" stagger={140}>
              {X.risks.map((r, i) => {
                const I = ICONS[i];
                return (
                  <li key={i} className="fic-r">
                    <span className="ring sm"><I size={26} strokeWidth={1.6} aria-hidden="true" /></span>
                    <span className="fic-rt">{pick(r)}</span>
                  </li>
                );
              })}
            </Reveal>
          </div>

          <div className="fic-join" aria-hidden="true">
            <svg viewBox="0 0 200 240" preserveAspectRatio="none">
              <path d="M0 40 C 110 40, 90 120, 200 120" /><path d="M0 120 L 200 120" /><path d="M0 200 C 110 200, 90 120, 200 120" />
            </svg>
            <span className="small">{pick(X.create)}</span>
          </div>

          <Reveal className="fic-vol" kind="zoom" self delay={500}>
            <span className="lbl">{pick(X.thread)}</span>
            <div className="ring big">
              <svg viewBox="0 0 120 60" className="vol-trace" aria-hidden="true"><path d={volPath(120, 60)} /></svg>
              <span className="ring-pulse" aria-hidden="true" />
            </div>
            <span className="fic-volt">{pick(X.vol)}</span>
          </Reveal>
        </div>

        <Reveal className="fic-sol" kind="pop" self delay={200}>
          <span className="ring sol"><ShieldCheck size={30} strokeWidth={1.6} aria-hidden="true" /></span>
          <div>
            <span className="lbl brand">{pick(X.solution)}</span>
            <p className="h3">{pick(X.solT)}</p>
            <p className="body">{pick(X.solD)}</p>
          </div>
        </Reveal>
        <Foot>{pick(X.foot)}</Foot>
      </div>
    </section>
  );
}
