/** Formatting helpers of the admin (pure). */

export const pct = (v: number | null | undefined, d = 2): string =>
  typeof v === "number" && Number.isFinite(v) ? `${v < 0 ? "−" : ""}${Math.abs(v * 100).toFixed(d)}%` : "—";

export const num = (v: number | null | undefined, d = 2): string =>
  typeof v === "number" && Number.isFinite(v)
    ? v.toLocaleString("en-CA", { minimumFractionDigits: d, maximumFractionDigits: d })
    : "—";

export const money = (v: number | null | undefined): string => {
  if (typeof v !== "number" || !Number.isFinite(v)) return "—";
  if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(2)} B$`;
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)} M$`;
  return `${Math.round(v).toLocaleString("en-CA")} $`;
};

export const bytes = (n: number): string =>
  n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} KB` : `${n} B`;

/** "2026-09-29 06:45" in America/Toronto. */
export function when(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(d)
    .replace(",", "");
}

export function duration(a: string | null | undefined, b: string | null | undefined): string {
  if (!a || !b) return "—";
  const ms = new Date(b).getTime() - new Date(a).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "—";
  if (ms < 1000) return `${ms} ms`;
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${s % 60} s`;
}

type Tone = "ok" | "warn" | "err" | "info" | "mute";

export const runTone = (status: string): Tone =>
  status === "published"
    ? "ok"
    : status === "pending-review"
      ? "info"
      : status === "blocked"
        ? "warn"
        : status === "failed"
          ? "err"
          : "mute";

export const fundStateTone = (s: string | undefined): Tone =>
  s === "updated" ? "ok" : s === "kept-previous" ? "warn" : s === "unavailable" ? "err" : "mute";

export const levelTone = (l: string): Tone => (l === "error" ? "err" : l === "warn" ? "warn" : "info");
