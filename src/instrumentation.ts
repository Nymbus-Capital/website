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
  }
}
