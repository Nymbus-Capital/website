"use server";
/**
 * Contact form: validation only. There is no email backend on this site (nothing is sent or stored);
 * a valid submission returns a prefilled mailto: link so the visitor sends the message from their own
 * mail client, and the page shows the direct contacts.
 */
export interface ContactState {
  status: "idle" | "invalid" | "ready";
  errors?: Partial<Record<"name" | "email" | "message" | "topic", true>>;
  mailto?: string;
}

const TO = "info@nymbus.ca";
const TOPICS = new Set(["monthly-income", "sustainable-enhanced-bonds", "multi-strategy", "global-minimum-volatility", "mandate", "other"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function submitContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  const get = (k: string) => String(form.get(k) ?? "").trim();
  // honeypot: bots fill every field
  if (get("website")) return { status: "ready", mailto: `mailto:${TO}` };
  const name = get("name").slice(0, 120);
  const email = get("email").slice(0, 200);
  const company = get("company").slice(0, 160);
  const profile = get("profile").slice(0, 60);
  const topic = get("topic");
  const message = get("message").slice(0, 4000);
  const errors: ContactState["errors"] = {};
  if (name.length < 2) errors.name = true;
  if (!EMAIL.test(email)) errors.email = true;
  if (message.length < 10) errors.message = true;
  if (topic && !TOPICS.has(topic)) errors.topic = true;
  if (Object.keys(errors).length) return { status: "invalid", errors };

  const subject = `Website inquiry${topic ? ` · ${topic}` : ""} · ${name}`;
  const body = [message, "", "—", name, company, profile, email].filter((x, i) => i < 3 || x).join("\n");
  return { status: "ready", mailto: `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
}
