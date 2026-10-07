/**
 * Weekly rankings freshness check (RBC pooled fund survey), started by src/instrumentation.ts next to the pipeline
 * scheduler. Every 6 hours the process looks at the stored state and runs the check when the last one is older than
 * RANKINGS_CHECK_DAYS (default 7), so restarts neither skip nor repeat it; each tick also posts the rankings about to be
 * hidden (expiry-alert.ts, once per entry). RANKINGS_CHECK=off disables both.
 */
const G = globalThis as typeof globalThis & {
  __nymbusRankingsCheck?: { timer: ReturnType<typeof setInterval> | null };
};

export function checkIntervalDays(env: Record<string, string | undefined> = process.env): number {
  const n = Number(env.RANKINGS_CHECK_DAYS);
  return Number.isFinite(n) && n >= 1 && n <= 60 ? Math.floor(n) : 7;
}

/** Due when never run, or when the last check (successful or not) is older than `days`. */
export function checkDue(lastCheckedAt: string | null | undefined, now: Date, days: number): boolean {
  if (!lastCheckedAt) return true;
  const t = Date.parse(lastCheckedAt);
  return !Number.isFinite(t) || now.getTime() - t >= days * 86_400_000;
}

export function startRankingsCheck(opts: { log?: (m: string) => void } = {}): boolean {
  const log = opts.log ?? ((m: string) => console.log(`[rankings] ${m}`));
  if ((process.env.RANKINGS_CHECK ?? "").trim().toLowerCase() === "off") {
    log("freshness check off (RANKINGS_CHECK=off)");
    return false;
  }
  if (G.__nymbusRankingsCheck) return true;
  const days = checkIntervalDays();
  let running = false;
  const tick = async (): Promise<void> => {
    if (running) return;
    running = true;
    try {
      const { getContent } = await import("../data/content.ts");
      const content = await getContent();
      // rankings about to be hidden (30 days ahead) or just hidden: webhook, once per entry and phase
      try {
        const [{ alertRankingExpiries }, { FUNDS }] = await Promise.all([
          import("./expiry-alert.ts"),
          import("../../config/funds.ts"),
        ]);
        await alertRankingExpiries(content, { classes: Object.fromEntries(FUNDS.map((f) => [f.key, f.classes])) });
      } catch (e: unknown) {
        log(`expiry alert failed: ${(e as Error)?.message ?? e}`);
      }
      const { readRbcState, runRbcSurveyCheck } = await import("./rbc-survey.ts");
      const prev = await readRbcState();
      if (!checkDue(prev?.checkedAt, new Date(), days)) return;
      await runRbcSurveyCheck({ content });
    } catch (e: unknown) {
      log(`freshness check crashed: ${(e as Error)?.message ?? e}`);
    } finally {
      running = false;
    }
  };
  const first = setTimeout(() => void tick(), 120_000);
  first.unref?.();
  const timer = setInterval(() => void tick(), 6 * 3_600_000);
  timer.unref?.();
  G.__nymbusRankingsCheck = { timer };
  log(`freshness check scheduled (every ${days} days)`);
  return true;
}
