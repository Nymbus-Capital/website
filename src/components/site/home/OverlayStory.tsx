"use client";
/**
 * "Why an overlay", told as one pinned scroll story (~280vh):
 *   1. the problem: three risks (rates, inflation, spreads) orbit the portfolio;
 *   2. they converge into one ring, "elevated volatility";
 *   3. our solution: the overlay block drops onto the portfolio (capital still 100% invested);
 *   4. an illustrative drawdown line morphs from "bonds only" to "with overlay".
 * The line is a conceptual shape (no axes, no values) and is labelled as such, with the deck footnote.
 * Everything is driven by one scroll progress from the shared loop; under reduced motion the section is not
 * pinned and shows its final state with every caption.
 */
import { useRef } from "react";
import { ChevronsLeftRight, Flame, TrendingUp } from "lucide-react";
import { reducedMotion, useScrub } from "@/components/v3/motion";
import { l, useTranslation } from "@/lib/i18n";
import { HOME } from "../copy";

const S = {
  illus: l("illustrative shape, not actual performance", "forme illustrative, pas des rendements réels"),
  bonds: l("bonds only", "obligations seules"),
  withOv: l("with overlay", "avec la stratégie"),
  chart: l("drawdowns through a volatile period", "reculs au cours d’une période volatile"),
};

/* conceptual drawdown paths (0..100 viewBox units, higher = deeper drawdown); deterministic */
const N = 64;
function series(damp: number) {
  const pts: number[] = [];
  for (let i = 0; i < N; i++) {
    const x = i / (N - 1);
    const dip = 70 * Math.exp(-Math.pow((x - 0.34) / 0.07, 2)) + 48 * Math.exp(-Math.pow((x - 0.72) / 0.06, 2)) + 14 * Math.exp(-Math.pow((x - 0.12) / 0.04, 2));
    pts.push(4 + dip * damp + 3 * Math.sin(i * 1.7) * (0.4 + damp * 0.6));
  }
  return pts;
}
const BONDS = series(1);
const OVERLAY = series(0.38);
const pathOf = (ys: number[]) => ys.map((y, i) => `${i ? "L" : "M"}${((i / (N - 1)) * 300).toFixed(1)} ${(y * 1.1).toFixed(1)}`).join(" ");
const areaOf = (ys: number[]) => `${pathOf(ys)} L300 0 L0 0 Z`;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ICONS = [TrendingUp, Flame, ChevronsLeftRight];

export function OverlayStory() {
  const { pick } = useTranslation();
  const X = HOME.challenge, O = HOME.overlay;
  const line = useRef<SVGPathElement>(null);
  const area = useRef<SVGPathElement>(null);
  const ref = useScrub<HTMLElement>((_k, el) => {
    // progress through the pinned distance (0 when the section's top reaches the top, 1 at its end)
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = reducedMotion() ? 1 : clamp(-r.top / Math.max(1, r.height - vh));
    const a = clamp((p - 0.06) / 0.2);   // risks converge
    const b = clamp((p - 0.2) / 0.12);   // elevated volatility
    const c = clamp((p - 0.44) / 0.18);  // overlay drops onto the portfolio
    const d = clamp((p - 0.38) / 0.1);   // chart appears
    const m = clamp((p - 0.6) / 0.22);   // bonds only → with overlay
    const st = el.querySelector<HTMLElement>(".story-pin");
    if (!st) return;
    st.style.setProperty("--a", a.toFixed(3));
    st.style.setProperty("--b", b.toFixed(3));
    st.style.setProperty("--c", c.toFixed(3));
    st.style.setProperty("--d", d.toFixed(3));
    st.style.setProperty("--m", m.toFixed(3));
    const step = p < 0.2 ? 0 : p < 0.42 ? 1 : p < 0.62 ? 2 : 3;
    st.dataset.step = String(step);
    if (line.current && area.current) {
      const ys = BONDS.map((y, i) => y + (OVERLAY[i] - y) * m);
      line.current.setAttribute("d", pathOf(ys));
      area.current.setAttribute("d", areaOf(ys));
    }
  });

  const eq = O.eq.map(pick);
  return (
    <section ref={ref} className="story" aria-labelledby="story-t">
      <div className="screen glow story-pin" data-step="0">
        <div className="wrap wide story-grid">
          <div className="story-copy">
            <span className="eyebrow">{pick(X.eyebrow)}</span>
            <h2 id="story-t" className="h1">{pick(X.title)} <span className="grad">{pick(X.accent)}</span></h2>
            <ol className="story-steps">
              <li data-i="0">
                <span className="lbl">{pick(X.problem)}</span>
                <p className="h3">{pick(X.suffer)}</p>
                <p className="body">{X.risks.map(pick).join(" · ")}</p>
              </li>
              <li data-i="1">
                <span className="lbl">{pick(X.thread)}</span>
                <p className="h3">{pick(X.create)} <span className="story-red">{pick(X.vol)}</span></p>
                <p className="body">{pick(X.sub)}</p>
              </li>
              <li data-i="2">
                <span className="lbl brand">{pick(X.solution)}</span>
                <p className="h3">{pick(X.solT)}</p>
                <p className="body">{pick(X.solD)}</p>
              </li>
              <li data-i="3">
                <span className="lbl brand">{pick(O.title)} {pick(O.accent)}</span>
                <p className="h3">{pick(O.sub)}</p>
                <p className="eq"><span>{eq[0]}</span><i>=</i><span>{eq[1]}</span><i>+</i><span className="hl">{eq[2]}</span></p>
              </li>
            </ol>
          </div>

          <div className="story-vis" aria-hidden="true">
            <div className="story-stage">
              {X.risks.map((r, i) => {
                const I = ICONS[i];
                return (
                  <div key={i} className="story-risk" style={{ ["--ang" as string]: `${-90 + i * 120}deg` }}>
                    <span className="story-ring"><I size={24} strokeWidth={1.6} /></span>
                    <span className="story-rl">{pick(r)}</span>
                  </div>
                );
              })}
              <div className="story-vol">
                <span className="story-ring big"><svg viewBox="0 0 120 60"><path d="M0 30 L10 30 L16 12 L22 48 L28 20 L34 42 L40 6 L46 54 L52 22 L58 38 L64 10 L70 50 L76 26 L82 34 L90 30 L120 30" /></svg></span>
                <span className="story-volt">{pick(X.vol)}</span>
              </div>
              <div className="story-stack">
                <div className="blk ovl"><span>{pick(O.overlay)}</span></div>
                <div className="blk port"><span>{pick(O.portfolio)}</span><b className="dep">5–10%</b></div>
                <span className="story-cap">{pick(O.cap2)}</span>
              </div>
            </div>
            <figure className="story-chart">
              <figcaption>
                <span className="small">{pick(S.chart)}</span>
                <span className="story-leg"><i className="lb" />{pick(S.bonds)}<i className="lo" />{pick(S.withOv)}</span>
              </figcaption>
              <svg viewBox="0 -4 300 118" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="story-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a73e8" stopOpacity=".02" /><stop offset="1" stopColor="#1a73e8" stopOpacity=".28" /></linearGradient>
                </defs>
                <line x1="0" y1="0" x2="300" y2="0" className="story-zero" />
                <path className="story-ghost" d={pathOf(BONDS)} />
                <path ref={area} className="story-area" d={areaOf(BONDS)} />
                <path ref={line} className="story-line" d={pathOf(BONDS)} />
              </svg>
              <span className="pill story-illus">{pick(S.illus)}</span>
            </figure>
          </div>
        </div>
        <p className="foot fine story-foot">{pick(X.foot)}</p>
      </div>
    </section>
  );
}
