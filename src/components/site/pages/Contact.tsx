"use client";
/**
 * /contact: the Montreal office (address, phone, toll-free, email, hours, LinkedIn, Google Maps link: a link,
 * not an embed, the CSP allows no third-party frames), the previous site's three-step form (investor type,
 * interests, contact details) and "who to contact" cards.
 *
 * The site has no email backend: the form is validated in the browser (lib/inquiry.ts) and prepares the
 * message in the visitor's own mail app (mailto:). Without JavaScript the three steps show one under the
 * other and the browser's own mailto form submission is the fallback.
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Clock, Mail, MapPin, Phone, RotateCcw, Send } from "lucide-react";
import { useInView } from "@/components/v3/motion";
import { useTranslation } from "@/lib/i18n";
import { PUBLIC_FUNDS, visibleFunds } from "@/config/funds-public";
import { CardGrid, PageHero, Reveal, Section, SectionHead } from "../kit";
import { CONTACT } from "../links";
import { CT } from "./copy-contact";
import { INQUIRY_TO, firstInvalidStep, inquiryMailto, mailto, mapsLink, validateInquiry, type Inquiry, type InquiryErrors } from "./lib/inquiry";
import "./pages.css";

const ADDRESS = "1002 Sherbrooke Street West, Suite 1900, Montreal, Quebec H3A 3L6";
const EMPTY: Inquiry = { profile: "", interests: [], name: "", email: "", phone: "", company: "", message: "" };

function InquiryForm({ hiddenFunds }: { hiddenFunds: string[] }) {
  const { locale, pick } = useTranslation();
  const F = CT.form;
  const [live, setLive] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [q, setQ] = useState<Inquiry>(EMPTY);
  const [errs, setErrs] = useState<InquiryErrors>({});
  const [ready, setReady] = useState<string | null>(null);
  const stepRefs = [useRef<HTMLFieldSetElement>(null), useRef<HTMLFieldSetElement>(null), useRef<HTMLFieldSetElement>(null)];
  const moved = useRef(false);
  useEffect(() => { setLive(true); }, []);
  useEffect(() => {
    if (!moved.current) return;
    stepRefs[step - 1].current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const interests = [...visibleFunds(PUBLIC_FUNDS, hiddenFunds).map((f) => ({ v: f.short.en, t: f.short })), { v: "Custom mandate", t: F.custom }, { v: "General inquiry", t: F.general }];
  const set = <K extends keyof Inquiry>(k: K, v: Inquiry[K]) => {
    setQ((x) => ({ ...x, [k]: v }));
    setErrs((e) => { const n = { ...e }; delete n[k as keyof InquiryErrors]; return n; });
  };
  const toggle = (v: string) => set("interests", q.interests.includes(v) ? q.interests.filter((x) => x !== v) : [...q.interests, v]);
  const go = (s: 1 | 2 | 3) => { moved.current = true; setStep(s); };
  const next = () => {
    const e = validateInquiry(q, step);
    setErrs(e);
    if (Object.keys(e).length) return;
    if (step < 3) go((step + 1) as 2 | 3);
  };
  const submit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const bad = firstInvalidStep(q);
    if (bad) { setErrs(validateInquiry(q, bad)); if (bad !== step) go(bad); return; }
    const href = inquiryMailto(q, locale);
    setReady(href);
    window.location.href = href;
  };
  const reset = () => { setQ(EMPTY); setErrs({}); setReady(null); moved.current = true; setStep(1); };

  const err = (k: keyof InquiryErrors, id: string) => errs[k] ? <p id={id} className="ct-err" role="alert">{pick(F.errs[k])}</p> : null;
  const shown = (s: 1 | 2 | 3) => !live || step === s;

  if (ready) {
    return (
      <div className="ct-ready" role="status" data-testid="contact-ready">
        <span className="bubble" style={{ ["--bc" as string]: "#188038" }} aria-hidden="true"><Check /></span>
        <p className="h3">{pick(F.ready)}</p>
        <p className="body">{pick(F.readyD)}</p>
        <div className="actions">
          <a className="btn" href={ready}>{pick(F.openMail)} <Send aria-hidden="true" /></a>
          <button type="button" className="btn ghost" onClick={reset}><RotateCcw aria-hidden="true" /> {pick(F.again)}</button>
        </div>
      </div>
    );
  }

  return (
    <form className="ct-form" action={`mailto:${INQUIRY_TO}`} method="post" encType="text/plain" noValidate onSubmit={submit}
      data-live={live ? "" : undefined} data-testid="contact-form">
      <ol className="ct-progress" aria-label={pick(F.stepsLabel)}>
        {F.steps.map((s, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          const state = !live ? "todo" : n < step ? "done" : n === step ? "on" : "todo";
          return (
            <li key={i} data-state={state} aria-current={live && n === step ? "step" : undefined}>
              <span className="ct-progress-b" aria-hidden="true">{state === "done" ? <Check /> : n}</span>
              <span className="ct-progress-t">{pick(s)}</span>
            </li>
          );
        })}
      </ol>

      <fieldset ref={stepRefs[0]} tabIndex={-1} className="ct-step" hidden={!shown(1)} aria-describedby={errs.profile ? "ct-e-profile" : undefined}>
        <legend className="ct-q">{pick(F.q1)}</legend>
        <div className="ct-opts">
          {F.profiles.map((p) => (
            <label key={p.v} className="ct-opt">
              <input type="radio" name="profile" value={p.v} checked={q.profile === p.v} onChange={() => set("profile", p.v)} />
              <span className="ct-opt-b">
                <span className="ct-opt-t">{pick(p.t)}</span>
                <span className="ct-opt-d">{pick(p.d)}</span>
              </span>
              <span className="ct-opt-c" aria-hidden="true"><Check /></span>
            </label>
          ))}
        </div>
        {err("profile", "ct-e-profile")}
        <div className="ct-nav">
          <button type="button" className="btn ct-next" onClick={next}>{pick(F.next)} <ArrowRight className="arrow" aria-hidden="true" /></button>
        </div>
      </fieldset>

      <fieldset ref={stepRefs[1]} tabIndex={-1} className="ct-step" hidden={!shown(2)} aria-describedby={errs.interests ? "ct-e-interests" : "ct-h-interests"}>
        <legend className="ct-q">{pick(F.q2)}</legend>
        <p id="ct-h-interests" className="small">{pick(F.q2hint)}</p>
        <div className="ct-opts ct-opts-s">
          {interests.map((it) => (
            <label key={it.v} className="ct-opt ct-check">
              <input type="checkbox" name="interests" value={it.v} checked={q.interests.includes(it.v)} onChange={() => toggle(it.v)} />
              <span className="ct-opt-b"><span className="ct-opt-t">{pick(it.t)}</span></span>
              <span className="ct-opt-c" aria-hidden="true"><Check /></span>
            </label>
          ))}
        </div>
        {err("interests", "ct-e-interests")}
        <div className="ct-nav">
          <button type="button" className="btn ghost ct-back" onClick={() => go(1)}><ArrowLeft aria-hidden="true" /> {pick(F.back)}</button>
          <button type="button" className="btn ct-next" onClick={next}>{pick(F.next)} <ArrowRight className="arrow" aria-hidden="true" /></button>
        </div>
      </fieldset>

      <fieldset ref={stepRefs[2]} tabIndex={-1} className="ct-step" hidden={!shown(3)}>
        <legend className="ct-q">{pick(F.q3)}</legend>
        <div className="ct-fields">
          <div className="ct-field">
            <label htmlFor="ct-name">{pick(F.name)}</label>
            <input id="ct-name" name="name" autoComplete="name" required value={q.name} onChange={(e) => set("name", e.target.value)}
              aria-invalid={errs.name ? true : undefined} aria-describedby={errs.name ? "ct-e-name" : undefined} />
            {err("name", "ct-e-name")}
          </div>
          <div className="ct-field">
            <label htmlFor="ct-email">{pick(F.email)}</label>
            <input id="ct-email" name="email" type="email" autoComplete="email" required value={q.email} onChange={(e) => set("email", e.target.value)}
              aria-invalid={errs.email ? true : undefined} aria-describedby={errs.email ? "ct-e-email" : undefined} />
            {err("email", "ct-e-email")}
          </div>
          <div className="ct-field">
            <label htmlFor="ct-phone">{pick(F.phone)}</label>
            <input id="ct-phone" name="phone" type="tel" autoComplete="tel" value={q.phone} onChange={(e) => set("phone", e.target.value)}
              aria-invalid={errs.phone ? true : undefined} aria-describedby={errs.phone ? "ct-e-phone" : undefined} />
            {err("phone", "ct-e-phone")}
          </div>
          <div className="ct-field">
            <label htmlFor="ct-company">{pick(F.company)}</label>
            <input id="ct-company" name="company" autoComplete="organization" value={q.company} onChange={(e) => set("company", e.target.value)} />
          </div>
          <div className="ct-field ct-wide">
            <label htmlFor="ct-message">{pick(F.message)}</label>
            <textarea id="ct-message" name="message" rows={4} placeholder={pick(F.messagePh)} value={q.message} onChange={(e) => set("message", e.target.value)} />
          </div>
        </div>
        <div className="ct-nav">
          <button type="button" className="btn ghost ct-back" onClick={() => go(2)}><ArrowLeft aria-hidden="true" /> {pick(F.back)}</button>
          <button type="submit" className="btn">{pick(F.send)} <Send aria-hidden="true" /></button>
        </div>
      </fieldset>
      <p className="ct-note">{pick(F.note)}</p>
    </form>
  );
}

function VisitMap() {
  const [ref, seen] = useInView<HTMLAnchorElement>({ threshold: 0.3 });
  const { pick } = useTranslation();
  return (
    <a ref={ref} className="ct-map" href={mapsLink(ADDRESS)} target="_blank" rel="noopener noreferrer" data-on={seen ? "" : undefined}>
      <svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="640" height="360" className="ct-map-bg" />
        <path className="ct-map-park" d="M430 250 C 470 220, 560 230, 640 260 L 640 360 L 410 360 Z" />
        {Array.from({ length: 12 }, (_, i) => <line key={`v${i}`} className="ct-map-st" x1={-80 + i * 64} y1="0" x2={20 + i * 64} y2="360" />)}
        {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} className="ct-map-st" x1="0" y1={30 + i * 56} x2="640" y2={-20 + i * 56} />)}
        <path className="ct-map-main" d="M0 236 L 640 130" pathLength={1} />
        <path className="ct-map-main alt" d="M250 360 L 330 0" pathLength={1} />
        <g className="ct-map-pin">
          <circle className="ct-map-ring" cx="300" cy="186" r="26" />
          <path d="M300 186 C 300 186, 280 160, 280 146 A 20 20 0 1 1 320 146 C 320 160, 300 186, 300 186 Z" className="ct-map-drop" />
          <circle cx="300" cy="146" r="7" fill="#fff" />
        </g>
      </svg>
      <span className="ct-map-card">
        <b>Nymbus Capital</b>
        <span>{pick(CT.office.address)}</span>
        <span className="link">{pick(CT.office.map)} <ArrowUpRight aria-hidden="true" /></span>
      </span>
    </a>
  );
}

export function Contact({ hiddenFunds = [] }: { hiddenFunds?: string[] }) {
  const { locale, pick } = useTranslation();
  const O = CT.office;
  return (
    <div className="pg ct">
      <PageHero eyebrow={pick(CT.hero.eyebrow)} title={pick(CT.hero.title)} accent={pick(CT.hero.accent)} lead={pick(CT.hero.lead)}
        crumbs={[{ href: "/", label: locale === "fr" ? "Accueil" : "Home" }, { label: pick(CT.hero.eyebrow) }]}>
        <a className="btn" href={`tel:${CONTACT.phone}`}><Phone aria-hidden="true" /> {pick(O.phone)}</a>
        <a className="btn ghost" href={`mailto:${CONTACT.email}`}><Mail aria-hidden="true" /> {CONTACT.email}</a>
      </PageHero>

      <Section labelledBy="ct-form-t" glow="tr">
        <div className="ct-grid">
          <Reveal self kind="pop" className="card ct-card">
            <h2 id="ct-form-t" className="h2">{pick(CT.form.title)}</h2>
            <p className="ct-lead">{pick(CT.form.lead)}</p>
            <InquiryForm hiddenFunds={hiddenFunds} />
          </Reveal>
          <Reveal as="aside" className="ct-side" stagger={120} aria-label={pick(O.title)}>
            <div className="card ct-office">
              <h2 className="h4">{pick(O.title)}</h2>
              <ul className="ct-lines">
                <li><MapPin aria-hidden="true" /><span className="ct-pre">{pick(O.address)}</span></li>
                <li><Phone aria-hidden="true" /><span><a href={`tel:${CONTACT.phone}`}>{pick(O.phone)}</a><br /><a href="tel:+18332272656">{pick(O.tollFree)}</a></span></li>
                <li><Mail aria-hidden="true" /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
                <li><Clock aria-hidden="true" /><span>{pick(O.hours)}</span></li>
              </ul>
              <div className="ct-office-links">
                <a className="link" href={mapsLink(ADDRESS)} target="_blank" rel="noopener noreferrer">{pick(O.map)} <ArrowUpRight aria-hidden="true" /></a>
                <a className="link" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight aria-hidden="true" /></a>
              </div>
            </div>
            <div className="card soft ct-resp">
              <h2 className="h4">{pick(O.response)}</h2>
              <p>{pick(O.responseD)}</p>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section tone="tint" labelledBy="ct-who-t">
        <SectionHead eyebrow={pick(CT.who.eyebrow)} title={pick(CT.who.title)} accent={pick(CT.who.accent)} id="ct-who-t" />
        <CardGrid cols={4} className="ct-who">
          {CT.who.items.map((w, i) => (
            <div key={i} className="card ring ct-who-c">
              <h3 className="h4">{pick(w.t)}</h3>
              <p>{pick(w.d)}</p>
              <a className="link ct-who-mail" href={mailto(w.email, pick(w.subject))}><Mail aria-hidden="true" />{w.email}</a>
              {w.link ? <a className="link ct-who-more" href={w.link.href}>{pick(w.link.label)} <ArrowRight aria-hidden="true" /></a> : null}
            </div>
          ))}
        </CardGrid>
      </Section>

      <Section labelledBy="ct-visit-t">
        <div className="split ct-visit">
          <div>
            <SectionHead eyebrow={pick(CT.visit.eyebrow)} title={pick(CT.visit.title)} accent={pick(CT.visit.accent)} id="ct-visit-t" />
            <Reveal self><p className="body">{pick(CT.visit.text)}</p></Reveal>
            <Reveal self delay={120}>
              <ul className="ct-lines ct-visit-lines">
                <li><MapPin aria-hidden="true" /><span className="ct-pre">{pick(O.address)}</span></li>
                <li><Clock aria-hidden="true" /><span>{pick(O.hours)}</span></li>
              </ul>
              <div className="actions">
                <a className="btn ghost" href={mapsLink(ADDRESS)} target="_blank" rel="noopener noreferrer">{pick(O.map)} <ArrowUpRight aria-hidden="true" /></a>
              </div>
            </Reveal>
          </div>
          <Reveal self kind="pop"><VisitMap /></Reveal>
        </div>
      </Section>
    </div>
  );
}
