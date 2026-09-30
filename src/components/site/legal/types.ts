/**
 * Structure of the legal documents (/legal, /privacy): sections with stable ids (anchors + table of contents)
 * and typed blocks, so the wording lives in plain data and the page renders it with a sticky table of contents.
 */
export type LegalBlock =
  | { kind: "p"; text: string; strong?: boolean; small?: boolean }
  /** paragraph starting with a bold lead-in ("1. Request a review by the AMF:") */
  | { kind: "lead"; lead: string; text: string }
  | { kind: "list"; items: string[]; note?: string }
  /** titled entries shown as cards (principles, steps) */
  | { kind: "cards"; items: { title: string; text: string }[] }
  | { kind: "steps"; items: { title: string; text: string }[] }
  /** postal / contact block; lines matching an email or a phone number become links */
  | { kind: "address"; lines: string[] }
  /** paragraph with one inline link: text before, the link, text after */
  | { kind: "link"; before: string; label: string; href: string; after: string };

export interface LegalSection {
  id: string;
  title: string;
  blocks: LegalBlock[];
  children?: LegalSection[];
  /** added by the website team, pending compliance review (docs/compliance-review.md) */
  review?: string;
}

export interface LegalDoc {
  id: string;
  title: string;
  intro?: string;
  sections: LegalSection[];
  effective: string;
}
