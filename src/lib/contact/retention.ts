/**
 * Retention of the website inquiries: started by src/instrumentation.ts, deletes the inquiries older than the configured
 * retention (admin settings, default 180 days) two minutes after start and then every 12 hours (the admin list purges
 * too). Its own timer, not the pipeline scheduler's: the purge must run even with PIPELINE_SCHEDULE=off. Logs counts only.
 */
import { purgeExpiredInquiries } from "./store.ts";

const G = globalThis as typeof globalThis & { __nymbusInquiryRetention?: ReturnType<typeof setInterval> };

export function startInquiryRetention(log: (m: string) => void = (m) => console.log(`[contact] ${m}`)): void {
  if (G.__nymbusInquiryRetention) return;
  const tick = (): void => {
    purgeExpiredInquiries().then(
      (n) => { if (n) log(`deleted ${n} expired inquir${n === 1 ? "y" : "ies"}`); },
      (e: unknown) => log(`retention purge failed: ${(e as Error)?.message ?? e}`),
    );
  };
  setTimeout(tick, 120_000).unref?.();
  G.__nymbusInquiryRetention = setInterval(tick, 12 * 3_600_000);
  G.__nymbusInquiryRetention.unref?.();
}
