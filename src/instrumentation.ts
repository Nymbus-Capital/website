/**
 * Next.js instrumentation hook: starts the in-process data pipeline scheduler on the Node.js server
 * runtime only (the NEXT_RUNTIME check wraps the import so the edge bundle never includes the
 * pipeline). Disabled with PIPELINE_SCHEDULE=off; not started during `next build`.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.NEXT_PHASE !== "phase-production-build") {
      // names and statuses only, never values: tells ops why /admin says "not configured"
      try {
        const { authDiagnostics, pipelineDiagnostics, dataplatformProbe } = await import("./lib/auth/diagnostics.ts");
        for (const line of authDiagnostics(process.env)) console.log(line);
        console.log(pipelineDiagnostics(process.env));
        void dataplatformProbe(process.env).then((l) => console.log(l), () => undefined);
      } catch (e: unknown) {
        console.log(`[admin] diagnostics failed: ${(e as Error)?.message ?? e}`);
      }
    }
    const off = (process.env.PIPELINE_SCHEDULE ?? "").trim().toLowerCase() === "off";
    if (!off && process.env.NEXT_PHASE !== "phase-production-build") {
      const { startScheduler } = await import("./lib/pipeline/schedule.ts");
      startScheduler();
    }
    // weekly third-party rankings freshness check (RBC pooled fund survey); RANKINGS_CHECK=off disables it
    if (process.env.NEXT_PHASE !== "phase-production-build") {
      try {
        const { startRankingsCheck } = await import("./lib/rankings/schedule.ts");
        startRankingsCheck();
      } catch (e: unknown) {
        console.log(`[rankings] freshness check not started: ${(e as Error)?.message ?? e}`);
      }
      // website inquiries (contact form): deleted 12 months after receipt
      try {
        const { startInquiryRetention } = await import("./lib/contact/retention.ts");
        startInquiryRetention();
      } catch (e: unknown) {
        console.log(`[contact] retention purge not started: ${(e as Error)?.message ?? e}`);
      }
    }
  }
}
