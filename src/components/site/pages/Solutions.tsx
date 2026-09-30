"use client";
/**
 * /solutions: institutional investors, family offices and advisors. Hero · the three profiles (cards linking to
 * their section) · one section per profile (how we work with you, vehicles, strategies that usually fit, with a
 * link to each fund page and its minimum when the admin provides one) · call to action. All content is in the
 * page (no hidden panels), so it reads without JavaScript.
 */
import Link from "next/link";
import { ArrowDown, ArrowRight, Briefcase, Building2, Check, Users } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { FundKey } from "@/lib/data/types";
import { ButtonLink, CtaBand, Reveal, Section, SectionHead } from "../kit";
import type { FundCard, HomeData } from "../home/data";
import { Intro } from "../home/Intro";
import { FUND_COPY as F } from "../home/copy";
import { fundStyle } from "../home/FundTile";
import { monthText, pctText } from "../home/figures";
import { AUDIENCES, SOL_COPY as S, type Audience, type AudienceCopy } from "./solutions-copy";
import "../home/home.css";

const ICON: Record<Audience, typeof Building2> = { institutional: Building2, family: Users, advisor: Briefcase };
const TONE: Record<Audience, string> = { institutional: "#1a73e8", family: "#0b8fd6", advisor: "#00a3e0" };

function FundLink({ f, sample }: { f: FundCard; sample: boolean }) {
  const { locale, pick } = useTranslation();
  const si = pctText(f.si, locale);
  return (
    <li style={fundStyle(f)}>
      <Link href={`/strategies/${f.key}`} className="sl-fund" data-testid={`solution-fund-${f.key}`}>
        <i aria-hidden="true" />
        <span className="sl-fund-n">
          <b>{pick(f.short)}</b>
          <span>{pick(f.assetClass)}</span>
          {f.minInvestment ? <span>{pick(S.minimum)}: {f.minInvestment}</span> : null}
        </span>
        {si ? (
          <span className="sl-fund-f">
            <b className="tabnum">{si}</b>
            <span>{pick(F.siShort)}{f.siAnnualized ? ` · ${pick(F.annualized)}` : ""}{f.asOf ? ` · ${monthText(f.asOf, locale)}` : ""}{sample ? ` · ${pick(F.sample)}` : ""}</span>
          </span>
        ) : null}
        <ArrowRight aria-hidden="true" className="sl-fund-go" />
      </Link>
    </li>
  );
}

function AudienceSection({ a, funds, sample, tone }: { a: AudienceCopy; funds: Map<FundKey, FundCard>; sample: boolean; tone: "white" | "tint" }) {
  const { pick } = useTranslation();
  const I = ICON[a.key];
  const list = a.funds.map((k) => funds.get(k)).filter((f): f is FundCard => !!f);
  return (
    <Section tone={tone} id={a.key} labelledBy={`${a.key}-t`} className="sl-aud">
      <div className="sl-aud-grid">
        <div>
          <Reveal self>
            <span className="bubble sl-bubble" aria-hidden="true" style={{ ["--bc" as string]: TONE[a.key], ["--size" as string]: "64px" }}><I /></span>
          </Reveal>
          <SectionHead title={pick(a.name)} lead={pick(a.intro)} id={`${a.key}-t`} />
          <Reveal self delay={120}><p className="sl-who">{pick(a.who)}</p></Reveal>
          <Reveal self delay={200} className="card flat sl-benefits">
            <h3 className="h4">{pick(S.benefits)}</h3>
            <ul>{a.benefits.map((b, i) => <li key={i}><Check aria-hidden="true" />{pick(b)}</li>)}</ul>
          </Reveal>
        </div>
        <div className="sl-side">
          <Reveal self kind="pop" className="card sl-block">
            <h3 className="h4">{pick(S.vehicles)}</h3>
            <dl className="sl-veh">
              {a.vehicles.map((v, i) => <div key={i}><dt>{pick(v.name)}</dt><dd>{pick(v.text)}</dd></div>)}
            </dl>
          </Reveal>
          <Reveal self kind="pop" delay={140} className="card sl-block">
            <h3 className="h4">{pick(S.suitable)}</h3>
            <ul className="sl-funds">{list.map((f) => <FundLink key={f.key} f={f} sample={sample} />)}</ul>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

export function Solutions({ data }: { data: HomeData }) {
  const { pick } = useTranslation();
  const funds = new Map(data.funds.map((f) => [f.key, f] as const));
  const anyFig = data.funds.some((f) => f.si !== null);
  const anyGross = data.funds.some((f) => f.si !== null && f.basis === "gross");
  return (
    <div className="hm">
      <Intro
        crumbs={[{ href: "/", label: pick(S.home) }, { label: pick(S.crumb) }]}
        eyebrow={pick(S.eyebrow)} title={pick(S.title)} accent={pick(S.accent)} lead={pick(S.lead)} id="solutions-t"
      >
        <ButtonLink href="/contact">{pick(S.talk)}</ButtonLink>
        <ButtonLink href="/strategies" variant="ghost">{pick(S.strategies)}</ButtonLink>
      </Intro>

      <Section labelledBy="who-t" glow="tr" className="sl-who-s">
        <SectionHead eyebrow={pick(S.whoEyebrow)} title={pick(S.whoTitle)} accent={pick(S.whoAccent)} lead={pick(S.whoLead)} id="who-t" center />
        <Reveal kind="pop" stagger={110} className="sl-types">
          {AUDIENCES.map((a) => {
            const I = ICON[a.key];
            return (
              <a key={a.key} href={`#${a.key}`} className="card ring sl-type" data-testid={`audience-${a.key}`}>
                <span className="bubble" aria-hidden="true" style={{ ["--bc" as string]: TONE[a.key] }}><I /></span>
                <span className="h4 sl-type-n">{pick(a.name)}</span>
                <span className="sl-type-d">{pick(a.who)}</span>
                <span className="link">{pick(S.see)} <ArrowDown aria-hidden="true" /></span>
              </a>
            );
          })}
        </Reveal>
      </Section>

      {AUDIENCES.map((a, i) => (
        <AudienceSection key={a.key} a={a} funds={funds} sample={data.sample} tone={i % 2 === 0 ? "tint" : "white"} />
      ))}

      <Section tight className="sl-notes">
        <p className="fine">{pick(S.minNote)}</p>
        {anyFig ? <p className="fine">{pick(F.perfNote)}{anyGross ? ` ${pick(F.grossNote)}` : ""}</p> : null}
      </Section>

      <CtaBand title={pick(S.ctaTitle)} accent={pick(S.ctaAccent)} text={pick(S.ctaText)}>
        <ButtonLink href="/contact">{pick(S.cta)}</ButtonLink>
      </CtaBand>
    </div>
  );
}
