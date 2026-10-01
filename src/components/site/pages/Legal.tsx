"use client";
/**
 * /legal (complaints policy + code of ethics) and /privacy. The texts live as data in
 * src/components/site/legal/*.ts (wording kept from the previous site, compliance-controlled); this file
 * only lays them out: readable prose column, sticky table of contents that follows the reading position
 * (a collapsible "on this page" on small screens), the complaint process as glowing steps.
 */
import Link from "next/link";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, FileText, Scale, ShieldCheck } from "lucide-react";
import { l, useTranslation } from "@/lib/i18n";
import { PageHero, Reveal, Steps } from "../kit";
import { codeOfEthics, complaintsPolicy } from "../legal/complaints";
import { privacyPolicy } from "../legal/privacy";
import type { LegalBlock, LegalDoc, LegalSection } from "../legal/types";
import { contactParts } from "./lib/contact-links";
import "./pages.css";

const C = {
  compliance: l("Compliance", "Conformité"),
  legal: l("Legal", "Juridique"),
  legalLead: l("Our complaints policy and our code of ethics.", "Notre politique de traitement des plaintes et notre code d’éthique."),
  privacyBefore: l("For personal information, see our", "Pour les renseignements personnels, consultez notre"),
  privacyLink: l("privacy policy", "politique de confidentialité"),
  privacy: l("Privacy policy", "Politique de confidentialité"),
  toc: l("On this page", "Sur cette page"),
  useful: l("Useful links", "Liens utiles"),
  amf: l("Autorité des marchés financiers (AMF)", "Autorité des marchés financiers (AMF)"),
  obsi: l("Ombudsman for Banking Services and Investments (OBSI)", "Ombudsman des services bancaires et d’investissement (OSBI)"),
  home: l("Home", "Accueil"),
  seeAlso: l("See also", "Voir aussi"),
  legalPage: l("Complaints policy and code of ethics", "Politique de plaintes et code d’éthique"),
};

type H = "h2" | "h3" | "h4";
const down = (h: H): H => (h === "h2" ? "h3" : "h4");

function ContactLine({ line }: { line: string }) {
  return <>{contactParts(line).map((p, i) => (p.href ? <a key={i} href={p.href}>{p.text}</a> : <Fragment key={i}>{p.text}</Fragment>))}</>;
}

/** "Person in charge: our …" → bold lead-in before the colon (short lead-ins only). */
function LeadIn({ text }: { text: string }) {
  const m = /^([^:]{3,40}?)(\s?):\s(.+)$/s.exec(text);
  // keep the (non-breaking) space French puts before the colon
  return m ? <><strong>{m[1]}{m[2] ? "\u00a0:" : ":"}</strong> {m[3]}</> : <>{text}</>;
}

function Block({ b }: { b: LegalBlock }) {
  switch (b.kind) {
    case "p":
      return <p className={b.small ? "lg2-small" : undefined}>{b.strong ? <strong>{b.text}</strong> : b.text}</p>;
    case "lead":
      return <p><strong>{b.lead}</strong> {b.text}</p>;
    case "list":
      return (
        <>
          <ul className="pg-ticks lg2-list">{b.items.map((it) => <li key={it}><LeadIn text={it} /></li>)}</ul>
          {b.note ? <p className="lg2-small">{b.note}</p> : null}
        </>
      );
    case "cards":
      return (
        <div className="lg2-cards">
          {b.items.map((it) => <div key={it.title} className="lg2-card"><p className="lg2-card-t">{it.title}</p><p>{it.text}</p></div>)}
        </div>
      );
    case "steps":
      return <div className="lg2-steps"><Steps layout="column" items={b.items.map((it) => ({ title: it.title, text: it.text }))} /></div>;
    case "address":
      return <address className="lg2-addr">{b.lines.map((ln, i) => <span key={i} className={i === 0 ? "lg2-addr-n" : undefined}><ContactLine line={ln} /></span>)}</address>;
    case "link":
      return (
        <p>
          {b.before}
          {b.href.startsWith("/") ? <Link className="inline" href={b.href}>{b.label}</Link>
            : <a className="inline" href={b.href} target="_blank" rel="noopener noreferrer">{b.label}</a>}
          {b.after}
        </p>
      );
    default:
      return null;
  }
}

function SectionView({ s, h }: { s: LegalSection; h: H }) {
  const Tag = h;
  return (
    <div className="lg2-sec" data-review={s.review ? "" : undefined}>
      <Tag id={s.id} className={`lg2-${h}`}>{s.title}</Tag>
      {s.blocks.map((b, i) => <Block key={i} b={b} />)}
      {s.children?.map((c) => <SectionView key={c.id} s={c} h={down(h)} />)}
    </div>
  );
}

function DocView({ doc, h, children, showTitle = true }: { doc: LegalDoc; h: H; children?: ReactNode; showTitle?: boolean }) {
  const sub = showTitle ? down(h) : h;
  return (
    <article className="lg2-doc" id={doc.id} aria-labelledby={showTitle ? `${doc.id}-t` : undefined} data-doc={doc.id}>
      {showTitle ? <h2 id={`${doc.id}-t`} className="lg2-doc-t h2">{doc.title}</h2> : null}
      {doc.intro && showTitle ? <p className="lg2-intro">{doc.intro}</p> : null}
      {doc.sections.map((s) => <SectionView key={s.id} s={s} h={sub} />)}
      {children}
      <p className="lg2-eff">{doc.effective}</p>
    </article>
  );
}

/** Table of contents with the section being read highlighted (IntersectionObserver on the headings). */
function Toc({ docs, showDocs }: { docs: LegalDoc[]; showDocs: boolean }) {
  const { pick } = useTranslation();
  const [active, setActive] = useState<string>("");
  const ids = docs.flatMap((d) => [...(showDocs ? [`${d.id}-t`] : []), ...d.sections.map((s) => s.id)]);
  const key = ids.join("|");
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id);
    }, { rootMargin: "-88px 0px -65% 0px", threshold: 0 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const item = (id: string, label: string, sub = false) => (
    <li key={id} className={sub ? "sub" : undefined}>
      <a href={`#${id}`} aria-current={active === id ? "true" : undefined}>{label}</a>
    </li>
  );
  const list = (
    <ol className="lg2-toc-list">
      {docs.map((d) => (
        <Fragment key={d.id}>
          {showDocs ? item(`${d.id}-t`, d.title) : null}
          {d.sections.map((s) => item(s.id, s.title, showDocs))}
        </Fragment>
      ))}
    </ol>
  );
  return (
    <nav className="lg2-toc" aria-label={pick(C.toc)}>
      <details className="lg2-toc-m">
        <summary>{pick(C.toc)}</summary>
        {list}
      </details>
      <div className="lg2-toc-d">
        <p className="lg2-toc-h">{pick(C.toc)}</p>
        {list}
      </div>
    </nav>
  );
}

export function Legal() {
  const { locale, pick } = useTranslation();
  const docs = [complaintsPolicy(locale), codeOfEthics(locale)];
  return (
    <div className="pg lg2">
      <PageHero eyebrow={pick(C.compliance)} title={pick(C.legal)} art="trail"
        crumbs={[{ href: "/", label: pick(C.home) }, { label: pick(C.legal) }]}
        lead={<>{pick(C.legalLead)} {pick(C.privacyBefore)} <Link className="inline" href="/privacy">{pick(C.privacyLink)}</Link>.</>}>
        <a className="btn ghost" href="#complaints"><Scale aria-hidden="true" /> {docs[0].title}</a>
        <a className="btn ghost" href="#ethics"><ShieldCheck aria-hidden="true" /> {docs[1].title}</a>
      </PageHero>
      <div className="section">
        <div className="container lg2-layout">
          <Toc docs={docs} showDocs />
          <div className="lg2-main">
            <DocView doc={docs[0]} h="h2">
              <Reveal self className="lg2-useful">
                <p className="lg2-card-t">{pick(C.useful)}</p>
                <a href="https://lautorite.qc.ca/" target="_blank" rel="noopener noreferrer">{pick(C.amf)} <ArrowUpRight aria-hidden="true" /></a>
                <a href="https://www.obsi.ca/" target="_blank" rel="noopener noreferrer">{pick(C.obsi)} <ArrowUpRight aria-hidden="true" /></a>
              </Reveal>
            </DocView>
            <DocView doc={docs[1]} h="h2" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Privacy() {
  const { locale, pick } = useTranslation();
  const doc = privacyPolicy(locale);
  return (
    <div className="pg lg2">
      <PageHero eyebrow={pick(C.compliance)} title={pick(C.privacy)} lead={doc.intro} art="trail"
        crumbs={[{ href: "/", label: pick(C.home) }, { label: pick(C.privacy) }]} />
      <div className="section">
        <div className="container lg2-layout">
          <Toc docs={[doc]} showDocs={false} />
          <div className="lg2-main">
            <DocView doc={doc} h="h2" showTitle={false} />
            <p className="lg2-see"><FileText aria-hidden="true" /> {pick(C.seeAlso)}{locale === "fr" ? "\u00a0: " : ": "}<Link className="inline" href="/legal">{pick(C.legalPage)}</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
