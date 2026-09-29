"use client";
/** /legal (complaints policy, code of ethics as tabs) and /privacy, in the keynote look. */
import { useState } from "react";
import { Reveal } from "@/components/v3/motion";
import { l, useTranslation } from "@/lib/i18n";
import { ComplaintsContent, EthicsContent } from "../legal/texts";
import { PrivacyContent, PrivacyIntro } from "../legal/privacy-text";
import { PageHero } from "./PageHero";

const C = {
  compliance: l("compliance", "conformité"),
  legal: l("legal", "juridique"),
  privacy: l("privacy policy", "politique de confidentialité"),
  tabs: [l("complaints policy", "politique de plaintes"), l("code of ethics", "code d’éthique")],
};

export function Legal() {
  const { locale, pick } = useTranslation();
  const fr = locale === "fr";
  const [tab, setTab] = useState<0 | 1>(0);
  const ids = ["complaints", "ethics"];
  return (
    <div className="stage">
      <PageHero eyebrow={pick(C.compliance)} title={pick(C.legal)} compact trail={false} />
      <section className="screen auto legal-s" aria-label={pick(C.tabs[tab])}>
        <div className="wrap narrow">
          <div className="tabs" role="tablist" aria-label={pick(C.legal)}>
            {C.tabs.map((t, i) => (
              <button
                key={i} type="button" role="tab" id={`tab-${ids[i]}`} aria-controls={`panel-${ids[i]}`} aria-selected={tab === i} tabIndex={tab === i ? 0 : -1}
                className={`chip ${tab === i ? "on" : ""}`} onClick={() => setTab(i as 0 | 1)}
                onKeyDown={(e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const n = (tab === 0 ? 1 : 0) as 0 | 1; setTab(n); document.getElementById(`tab-${ids[n]}`)?.focus(); } }}
              >
                {pick(t)}
              </button>
            ))}
          </div>
          <Reveal self key={tab} className="legal" role="tabpanel" id={`panel-${ids[tab]}`} aria-labelledby={`tab-${ids[tab]}`} data-tab={ids[tab]}>
            {tab === 0 ? <ComplaintsContent fr={fr} /> : <EthicsContent fr={fr} />}
          </Reveal>
        </div>
      </section>
    </div>
  );
}

export function Privacy() {
  const { locale, pick } = useTranslation();
  const fr = locale === "fr";
  return (
    <div className="stage">
      <PageHero eyebrow={pick(C.compliance)} title={pick(C.privacy)} lead={<PrivacyIntro fr={fr} />} compact trail={false} />
      <section className="screen auto legal-s" aria-label={pick(C.privacy)}>
        <div className="wrap narrow legal"><PrivacyContent fr={fr} /></div>
      </section>
    </div>
  );
}
