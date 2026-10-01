/**
 * Contact form logic (pure, unit tested). The site has no email backend: the three-step form (investor
 * profile, interests, contact details) is validated here and turned into a mailto: link that opens the
 * visitor's own mail app with the message prepared. Nothing is sent or stored by the site.
 */

export const INQUIRY_TO = "info@nymbus.ca";
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type Lang = "en" | "fr";

export interface Inquiry {
  profile: string;
  interests: string[];
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
}

export type InquiryField = "profile" | "interests" | "name" | "email" | "phone";
export type InquiryErrors = Partial<Record<InquiryField, true>>;

/** Errors of one step (1: profile, 2: interests, 3: details) or of every step (0). */
export function validateInquiry(q: Inquiry, step: 0 | 1 | 2 | 3 = 0): InquiryErrors {
  const e: InquiryErrors = {};
  if ((step === 0 || step === 1) && !q.profile.trim()) e.profile = true;
  if ((step === 0 || step === 2) && q.interests.length === 0) e.interests = true;
  if (step === 0 || step === 3) {
    if (q.name.trim().length < 2) e.name = true;
    if (!EMAIL_RE.test(q.email.trim())) e.email = true;
    if (q.phone && q.phone.trim() && !/^[+()\d\s.-]{7,25}$/.test(q.phone.trim())) e.phone = true;
  }
  return e;
}

/** First step (1-3) holding an error, or 0 when the inquiry is complete. */
export function firstInvalidStep(q: Inquiry): 0 | 1 | 2 | 3 {
  for (const s of [1, 2, 3] as const) if (Object.keys(validateInquiry(q, s)).length) return s;
  return 0;
}

const LABELS: Record<Lang, { subject: string; profile: string; interests: string; name: string; email: string; phone: string; company: string; message: string }> = {
  en: { subject: "Website inquiry", profile: "Investor profile", interests: "Interested in", name: "Name", email: "Email", phone: "Phone", company: "Organization", message: "Message" },
  fr: { subject: "Demande du site Web", profile: "Profil d’investisseur", interests: "Intérêts", name: "Nom", email: "Courriel", phone: "Téléphone", company: "Organisation", message: "Message" },
};

const clip = (s: string | undefined, n: number) => (s ?? "").trim().replace(/\s+\n/g, "\n").slice(0, n);

/** Subject and body of the prepared email, in the visitor's language. */
export function inquiryEmail(q: Inquiry, lang: Lang = "en"): { subject: string; body: string } {
  const L = LABELS[lang];
  const name = clip(q.name, 120);
  const subject = `${L.subject} · ${clip(q.profile, 60)} · ${name}`;
  const lines = [
    clip(q.message, 1500),
    "",
    "—",
    `${L.name}: ${name}`,
    `${L.email}: ${clip(q.email, 200)}`,
    q.phone?.trim() ? `${L.phone}: ${clip(q.phone, 25)}` : "",
    q.company?.trim() ? `${L.company}: ${clip(q.company, 160)}` : "",
    `${L.profile}: ${clip(q.profile, 60)}`,
    `${L.interests}: ${q.interests.map((i) => clip(i, 60)).join(", ")}`,
  ];
  const body = lines.filter((x, i) => i < 3 || x).join("\n").replace(/^\n+/, "");
  return { subject, body };
}

/** mailto: link (RFC 6068: subject and body percent-encoded, spaces as %20). */
export function mailto(to: string, subject?: string, body?: string): string {
  const q = [subject ? `subject=${encodeURIComponent(subject)}` : "", body ? `body=${encodeURIComponent(body)}` : ""].filter(Boolean).join("&");
  return `mailto:${to}${q ? `?${q}` : ""}`;
}

export function inquiryMailto(q: Inquiry, lang: Lang = "en", to = INQUIRY_TO): string {
  const { subject, body } = inquiryEmail(q, lang);
  return mailto(to, subject, body);
}

/** Google Maps search link for an address (a link, not an embed: the CSP allows no third-party frames). */
export const mapsLink = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
