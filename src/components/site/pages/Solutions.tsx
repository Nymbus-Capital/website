"use client";
/**
 * /solutions: institutional investors, family offices and advisors. Hero · the three profiles (cards linking to
 * their section) · one section per profile (how we work with you, vehicles, strategies that usually fit, with a
 * link to each fund page and its minimum when the admin provides one) · call to action. All content is in the
 * page (no hidden panels), so it reads without JavaScript.
 */
import Link from "next/link";
import { ArrowDown, ArrowRight, Briefcase, Building2, Check, FileText, Gauge, Landmark, Layers, PiggyBank, Shield, Shuffle, Users, Wallet } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { FundKey } from "@/lib/data/types";
import { ButtonLink, CtaBand, Reveal, Section, SectionHead } from "../kit";
import type { FundCard, HomeData } from "../home/data";
import { Intro } from "../home/Intro";
import { FUND_COPY as F } from "../home/copy";
import { SampleTag, fundStyle } from "../home/FundTile";
import { monthText, pctText } from "../home/figures";
import { HL } from "../home/labels";
import { AUDIENCES, SOL_COPY as S, type Audience, type AudienceCopy } from "./solutions-copy";
import { Fragment } from "react";
import { AdvisorRankings, useAdvisorRankingItems } from "../AdvisorRankings";
import { RK } from "@/components/fund/rankings-copy";
import "../home/home.css";

const ICON: Record<Audience, typeof Building2> = { institutional: Building2, family: Users, advisor: Briefcase };
const TONE: Record<Audience, string> = { institutional: "#1a73e8", family: "#0b8fd6", advisor: "#00a3e0" };

function FundLink({ f }: { f: FundCard }) {
  const { locale, pick } = useTranslation();
  const si = pctText(f.si, locale);
  return (
    <li style={fundStyle(f)}>
      <Link href={`/strategies/${f.key}`} className="sl-fund" data-testid={`solution-fund-${f.key}`}>
        <i aria-hidden="true" />
        <span className="sl-fund-n">
          <b>{pick(f.short)}</b>
          <span>{pick(f.assetClass)}</span>
          {f.minInvestment ? <span>{pick(S.minimum)}{locale === "fr" ? "\u00a0: " : ": "}{f.minInvestment}</span> : null}
        </span>
        {si ? (
          <span className="sl-fund-f">
            <b className="tabnum">{si}</b>
            <span>{pick(f.siAnnualized ? F.siAnn : F.siCumShort)}{f.basis === "gross" ? <> · <abbr title={pick(HL.grossLong)} data-testid="gross-marker">{pick(HL.gross)}</abbr></> : null}</span>
            {/* each fund has its own as-of month: never one date for several funds */}
            {f.asOf ? <span data-testid={`solution-asof-${f.key}`}>{pick(F.asOf)} {monthText(f.asOf, locale)}</span> : null}
            {f.perfVariant ? <span data-testid={`solution-variant-${f.key}`}>{pick(f.perfVariant)}</span> : null}
          </span>
        ) : null}
        <ArrowRight aria-hidden="true" className="sl-fund-go" />
      </Link>
    </li>
  );
}

const CASE_ICONS: Record<Audience, (typeof Building2)[]> = {
  institutional: [Landmark, Shield, PiggyBank],
  family: [Wallet, Gauge, Briefcase],
  advisor: [Layers, Shuffle, FileText],
};

/** Illustrative use case: numbered steps joined by a light line and its risk note (no ranking inside: see RankingsSection). */
function UseCase({ a }: { a: AudienceCopy }) {
  const { pick } = useTranslation();
  const icons = CASE_ICONS[a.key];
  return (
    <Reveal self kind="pop" className="card sl-case" data-testid={`use-case-${a.key}`} style={{ ["--bc" as string]: TONE[a.key] }}>
      <p className="sl-case-k">{pick(S.useCase)}</p>
      <h3 className="h4 sl-case-t">{pick(a.useCase.title)}</h3>
      <Reveal as="ol" stagger={140} className="sl-case-steps">
        {a.useCase.steps.map((st, i) => {
          const Icon = icons[i] ?? Check;
          return (
            <li key={i}>
              <span className="bubble" aria-hidden="true" style={{ ["--bc" as string]: TONE[a.key], ["--size" as string]: "44px" }}><Icon /></span>
              <span className="sl-case-n tabnum" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <span className="sl-case-d">{pick(st)}</span>
            </li>
          );
        })}
      </Reveal>
      <div className="sl-case-notes">
        {a.useCase.note ? <p className="fine">{pick(a.useCase.note)}</p> : null}
        <p className="fine">{pick(S.useCaseNote)}</p>
      </div>
    </Reveal>
  );
}

/**
 * Third-party rankings for advisors, in their own section right after the advisors card (never inside an illustrative
 * use case): each item with provider, class, periods, rank / percentile, out of N where available, as-of date, source link,
 * and a link to the fund's standard performance. Renders nothing when there is no confirmed, current ranking.
 */
function RankingsSection({ tone }: { tone: "white" | "tint" }) {
  const { pick } = useTranslation();
  const items = useAdvisorRankingItems();
  if (!items.length) return null;
  return (
    <Section tone={tone} tight id="advisor-rankings" labelledBy="advisor-rankings-t" className="sl-rank">
      <SectionHead eyebrow={pick(RK.adv.eyebrow)} title={pick(RK.adv.title)} lead={pick(RK.adv.lead)} id="advisor-rankings-t" />
      <AdvisorRankings items={items} title={false} />
    </Section>
  );
}

function AudienceSection({ a, funds, sample, tone }: { a: AudienceCopy; funds: Map<FundKey, FundCard>; sample: boolean; tone: "white" | "tint" }) {
  const { pick } = useTranslation();
  const I = ICON[a.key];
  const list = a.funds.map((k) => funds.get(k)).filter((f): f is FundCard => !!f);
  const anySi = list.some((f) => f.si !== null);
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
            <ul className="sl-funds">{list.map((f) => <FundLink key={f.key} f={f} />)}</ul>
            {sample && anySi ? <p className="sl-asof"><SampleTag /></p> : null}
          </Reveal>
        </div>
      </div>
      <UseCase a={a} />
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
        <SectionHead eyebrow={pick(S.whoEyebrow)} title={pick(S.whoTitle)} accent={pick(S.whoAccent)} id="who-t" center />
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
        <Fragment key={a.key}>
          <AudienceSection a={a} funds={funds} sample={data.sample} tone={i % 2 === 0 ? "tint" : "white"} />
          {a.key === "advisor" ? <RankingsSection tone={i % 2 === 0 ? "tint" : "white"} /> : null}
        </Fragment>
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
