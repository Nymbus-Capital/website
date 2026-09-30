"use client";
/**
 * Distributions tab (policy from the admin content, else a neutral note) and Documents tab (admin uploads grouped
 * by type; else the regulatory documents listed as available on request; managed accounts: mandate-holder note).
 */
import Link from "next/link";
import { ArrowRight, Download, FileText, Mail } from "lucide-react";
import { Reveal } from "@/components/v3/motion";
import { CONTACT } from "@/components/site/links";
import type { FundContent } from "@/lib/data/types";
import type { FundDoc, PublicFundSpec as FundSpec } from "./types";
import { T, tr } from "./copy";
import { Block } from "./Block";
import { dateLabel, fileSize, type Lang, colon } from "./lib/format.ts";
import { groupDocuments, REGULATORY_DOCS } from "./lib/data.ts";

const mailto = (subject: string) => `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}`;

export function DistributionsTab({ spec, content, lang }: { spec: FundSpec; content: FundContent; lang: Lang }) {
  const isFund = spec.vehicle === "fund";
  const text = content.distributions && (content.distributions.en || content.distributions.fr) ? tr(content.distributions, lang) : null;
  return (
    <div className="container fp">
      <div className="ds-grid">
        <Block title={tr(T.dist.policy, lang)} testId="distributions">
          {text ? <p className="fxb-text" data-testid="distribution-policy">{text}</p>
            : <p className="fxb-text" data-testid="distribution-none">{tr(isFund ? T.dist.none : T.dist.noneStrategy, lang)}</p>}
          {isFund ? <p className="fine fxb-foot">{tr(T.dist.reinvest, lang)}</p> : null}
          <div className="actions sm">
            <a className="btn ghost sm" href={mailto(`${tr(spec.name, lang)} · ${tr(T.dist.title, lang)}`)}><Mail aria-hidden="true" />{tr(T.dist.ask, lang)}</a>
          </div>
        </Block>
      </div>
    </div>
  );
}

export function DocumentsTab({ spec, docs, lang }: { spec: FundSpec; docs: FundDoc[]; lang: Lang }) {
  const isFund = spec.vehicle === "fund";
  const byId = new Map(docs.map((d) => [d.meta.id, d]));
  const groups = groupDocuments(docs.map((d) => d.meta), lang);
  return (
    <div className="container fp">
      {groups.length ? (
        <div className="dc-groups" data-testid="documents-list">
          {groups.map((g) => (
            <Block key={g.type} title={tr(T.docs.types[g.type], lang)}>
              <Reveal className="dc-list" stagger={50}>
                {g.docs.map((m) => {
                  const d = byId.get(m.id)!;
                  return (
                    <a key={m.id} className="dc-item" href={d.url} target="_blank" rel="noopener" download={m.fileName}
                      aria-label={`${tr(T.docs.download, lang)}${colon(lang)}${tr(m.title, lang)}, ${dateLabel(m.date, lang)}, PDF ${fileSize(m.size, lang)}`}>
                      <span className="dc-ic" aria-hidden="true"><FileText /></span>
                      <span className="dc-t">{tr(m.title, lang)}<small>{m.scope === "firm" ? `${tr(T.docs.firm, lang)} · ` : ""}{tr(T.docs.single[m.type], lang)} · PDF · {fileSize(m.size, lang)}</small></span>
                      <span className="dc-d">{dateLabel(m.date, lang)}</span>
                      <span className="dc-langs" aria-hidden="true">{m.lang === "both" ? <><span>EN</span><span>FR</span></> : <span>{m.lang.toUpperCase()}</span>}</span>
                      <span className="dc-go" aria-hidden="true"><Download /></span>
                    </a>
                  );
                })}
              </Reveal>
            </Block>
          ))}
        </div>
      ) : null}
      {isFund ? (
        !groups.some((g) => REGULATORY_DOCS.includes(g.type)) ? (
          <Block title={tr(T.docs.title, lang)} lead={tr(T.docs.regulatoryLead, lang)} testId="documents-on-request">
            <Reveal className="dc-req" kind="pop" stagger={60}>
              {REGULATORY_DOCS.map((type) => (
                <div key={type} className="dc-req-item">
                  <span className="dc-ic" aria-hidden="true"><FileText /></span>
                  <span className="dc-t">{tr(T.docs.single[type], lang)}<small>{tr(T.docs.regulatoryText[type], lang)}</small></span>
                  <span className="fx-chip">{tr(T.docs.onRequest, lang)}</span>
                  <a className="link" href={mailto(`${tr(spec.name, lang)} · ${tr(T.docs.single[type], lang)}`)}>
                    {tr(T.docs.request, lang)}<span className="sr-only">: {tr(T.docs.single[type], lang)}</span> <ArrowRight aria-hidden="true" />
                  </a>
                </div>
              ))}
            </Reveal>
          </Block>
        ) : null
      ) : (
        <Block title={tr(T.header.strategyDocuments, lang)} testId="documents-mandate">
          <p className="fxb-text">{tr(T.docs.strategyNote, lang)}</p>
          <div className="actions sm"><Link className="btn sm" href="/contact">{tr(T.cta.contact, lang)} <ArrowRight className="arrow" aria-hidden="true" /></Link></div>
        </Block>
      )}
    </div>
  );
}
