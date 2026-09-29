"use client";
/**
 * How a protection overlay works: before / after columns. As the screen scrolls in, the portfolio grows to
 * 100 % of capital, then the overlay drops on top of it with a spring; the 5-10 % futures deposit glows at
 * the base. Right: total return = portfolio return + overlay return.
 */
import { ArrowRight } from "lucide-react";
import { Reveal, useInView } from "@/components/v3/motion";
import { useTranslation } from "@/lib/i18n";
import { HOME } from "../copy";
import { Foot, Head } from "../ui";

export function Overlay() {
  const { pick } = useTranslation();
  const O = HOME.overlay;
  const [ref, seen] = useInView<HTMLDivElement>({ threshold: 0.35 });
  const eq = O.eq.map(pick);
  return (
    <section className="screen overlay-s" data-swap="" aria-labelledby="overlay-t">
      <div className="wrap wide">
        <Head eyebrow={pick(O.eyebrow)} title={pick(O.title)} accent={pick(O.accent)} sub={pick(O.sub)} id="overlay-t" size="h1" className="center-head" />
        <div ref={ref} className={`ov ${seen ? "go" : ""}`}>
          <figure className="ov-col">
            <figcaption className="lbl">{pick(O.before)}</figcaption>
            <div className="ov-stack">
              <div className="blk port"><span>{pick(O.portfolio)}</span></div>
            </div>
            <p className="ov-cap">{pick(O.cap)}</p>
          </figure>
          <div className="ov-arrow" aria-hidden="true"><ArrowRight size={22} strokeWidth={1.6} /></div>
          <figure className="ov-col">
            <figcaption className="lbl brand">{pick(O.after)}</figcaption>
            <div className="ov-stack">
              <div className="blk ovl"><em aria-hidden="true">+</em><span>{pick(O.overlay)}</span></div>
              <div className="blk port">
                <span>{pick(O.portfolio)}</span>
                <b className="dep" title={pick(O.deposit)}>5–10%</b>
              </div>
            </div>
            <p className="ov-cap brand">{pick(O.cap2)}</p>
          </figure>
          <Reveal className="ov-r" stagger={160} delay={900}>
            <p className="ov-note"><i aria-hidden="true" />{pick(O.deposit)}</p>
            <div className="ov-tr">
              <span className="lbl">{pick(O.trS)}</span>
              <p className="h2 grad ov-trt">{pick(O.tr)}</p>
              <p className="eq"><span>{eq[0]}</span><i>=</i><span>{eq[1]}</span><i>+</i><span className="hl">{eq[2]}</span></p>
            </div>
          </Reveal>
        </div>
        <Foot>{pick(O.foot)}</Foot>
      </div>
    </section>
  );
}
