"use client";
/**
 * /contact: direct contacts + a short form. The form is validated by a server action and then hands the
 * message to the visitor's mail client (mailto:), because the site has no email backend. Nothing is stored.
 */
import { useActionState, useEffect, useState } from "react";
import { ArrowUpRight, Mail, MapPin, Phone, Send } from "lucide-react";
import { Reveal, ScreenSwap } from "@/components/v3/motion";
import { l, useTranslation } from "@/lib/i18n";
import { FUNDS } from "@/config/funds";
import type { ContactState } from "@/app/(site)/contact/actions";
import { CONTACT } from "../links";
import { PageHero } from "./PageHero";

type Action = (prev: ContactState, form: FormData) => Promise<ContactState>;

const C = {
  eyebrow: l("contact", "contact"),
  title: l("let’s", "parlons"), accent: l("talk", "ensemble"),
  lead: l("interested in our strategies or a custom mandate? our team is here to help.", "nos stratégies ou un mandat sur mesure vous intéressent? notre équipe est là pour vous aider."),
  office: l("montreal office", "bureau de montréal"),
  write: l("write to us", "écrivez-nous"),
  name: l("full name", "nom complet"), email: l("email", "courriel"), company: l("organization (optional)", "organisation (facultatif)"),
  profile: l("you are", "vous êtes"), topic: l("interested in", "intéressé par"), message: l("message", "message"),
  profiles: [l("an institution", "une institution"), l("a family office", "un family office"), l("a financial advisor", "un conseiller financier"), l("other", "autre")],
  mandate: l("a custom mandate", "un mandat sur mesure"), other: l("something else", "autre chose"),
  send: l("prepare my email", "préparer mon courriel"),
  note: l("This form does not store or send anything: it prepares an email to info@nymbus.ca in your mail app.",
    "Ce formulaire n’enregistre ni n’envoie rien : il prépare un courriel à info@nymbus.ca dans votre application de courriel."),
  errs: { name: l("please enter your name", "veuillez entrer votre nom"), email: l("please enter a valid email", "veuillez entrer un courriel valide"), message: l("a few words, please (10 characters minimum)", "quelques mots, s’il vous plaît (10 caractères minimum)") },
  ready: l("your email is ready", "votre courriel est prêt"),
  readyD: l("Your mail app should have opened. If it didn’t, use the button below.", "Votre application de courriel devrait s’être ouverte. Sinon, utilisez le bouton ci-dessous."),
  openMail: l("open my email", "ouvrir mon courriel"),
  compliance: l("complaints and compliance", "plaintes et conformité"),
};

export function Contact({ action }: { action: Action }) {
  const { locale, pick } = useTranslation();
  const [state, formAction, pending] = useActionState<ContactState, FormData>(action, { status: "idle" });
  const [touched, setTouched] = useState(false);
  const err = state.status === "invalid" ? state.errors ?? {} : {};

  useEffect(() => {
    if (state.status === "ready" && state.mailto) window.location.href = state.mailto;
  }, [state]);

  const fr = locale === "fr";
  return (
    <div className="stage">
      <ScreenSwap />
      <PageHero eyebrow={pick(C.eyebrow)} title={pick(C.title)} accent={pick(C.accent)} lead={pick(C.lead)} compact />

      <section className="screen glow auto contact-s" data-swap="" aria-labelledby="ct-form-t">
        <div className="wrap wide contact-grid">
          <Reveal className="contact-info" stagger={100}>
            <h2 className="lbl">{pick(C.office)}</h2>
            <a className="ci" href={`mailto:${CONTACT.email}`}><Mail size={20} aria-hidden="true" /><span className="h3 grad">{CONTACT.email}</span></a>
            <a className="ci" href={`tel:${CONTACT.phone}`}><Phone size={20} aria-hidden="true" /><span className="h3">{fr ? "514 985-1138" : "514-985-1138"}</span></a>
            <p className="ci"><MapPin size={20} aria-hidden="true" /><span className="body" style={{ whiteSpace: "pre-line" }}>{fr ? "1002, rue Sherbrooke Ouest, bureau 1900\nMontréal (Québec) H3A 3L6" : "1002 Sherbrooke Street West, Suite 1900\nMontreal, Quebec H3A 3L6"}</span></p>
            <p className="small">{fr ? "Sans frais : 1 833 227-2656" : "Toll-free: 1-833-227-2656"}</p>
            <a className="link small" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={13} aria-hidden="true" style={{ display: "inline" }} /></a>
            <p className="small">{pick(C.compliance)}: <a className="link" href="mailto:compliance@nymbus.ca">compliance@nymbus.ca</a></p>
          </Reveal>

          <Reveal className="contact-form-w" self kind="pop" delay={150}>
            <h2 id="ct-form-t" className="h2">{pick(C.write)}</h2>
            {state.status === "ready" ? (
              <div className="form-ok" role="status" data-testid="contact-ready">
                <p className="h3 grad">{pick(C.ready)}</p>
                <p className="body">{pick(C.readyD)}</p>
                <a className="btn" href={state.mailto}>{pick(C.openMail)} <Send size={16} aria-hidden="true" /></a>
              </div>
            ) : (
              <form action={formAction} className="form" noValidate onSubmit={() => setTouched(true)} data-testid="contact-form">
                <div className="hp" aria-hidden="true"><label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label></div>
                <div className="field">
                  <label htmlFor="cf-name">{pick(C.name)}</label>
                  <input id="cf-name" name="name" autoComplete="name" required minLength={2} aria-invalid={err.name ? true : undefined} aria-describedby={err.name ? "cf-name-e" : undefined} />
                  {err.name ? <span id="cf-name-e" className="err">{pick(C.errs.name)}</span> : null}
                </div>
                <div className="field">
                  <label htmlFor="cf-email">{pick(C.email)}</label>
                  <input id="cf-email" name="email" type="email" autoComplete="email" required aria-invalid={err.email ? true : undefined} aria-describedby={err.email ? "cf-email-e" : undefined} />
                  {err.email ? <span id="cf-email-e" className="err">{pick(C.errs.email)}</span> : null}
                </div>
                <div className="field">
                  <label htmlFor="cf-company">{pick(C.company)}</label>
                  <input id="cf-company" name="company" autoComplete="organization" />
                </div>
                <fieldset className="field">
                  <legend>{pick(C.profile)}</legend>
                  <div className="seg">
                    {C.profiles.map((p, i) => (
                      <label key={i} className="seg-o"><input type="radio" name="profile" value={p.en} defaultChecked={i === 0} /><span>{pick(p)}</span></label>
                    ))}
                  </div>
                </fieldset>
                <div className="field">
                  <label htmlFor="cf-topic">{pick(C.topic)}</label>
                  <select id="cf-topic" name="topic" defaultValue="">
                    <option value="">—</option>
                    {FUNDS.map((f) => <option key={f.key} value={f.key}>{pick(f.short)}</option>)}
                    <option value="mandate">{pick(C.mandate)}</option>
                    <option value="other">{pick(C.other)}</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="cf-msg">{pick(C.message)}</label>
                  <textarea id="cf-msg" name="message" rows={5} required minLength={10} aria-invalid={err.message ? true : undefined} aria-describedby={err.message ? "cf-msg-e" : undefined} />
                  {err.message ? <span id="cf-msg-e" className="err">{pick(C.errs.message)}</span> : null}
                </div>
                <button className="btn" type="submit" disabled={pending} data-touched={touched || undefined}>{pick(C.send)} <Send size={16} aria-hidden="true" /></button>
                <p className="small">{pick(C.note)}</p>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
