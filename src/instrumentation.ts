/**
 * Next.js instrumentation hook: starts the in-process data pipeline scheduler on the Node.js server
 * runtime only (the NEXT_RUNTIME check wraps the import so the edge bundle never includes the
 * pipeline). Disabled with PIPELINE_SCHEDULE=off; not started during `next build`.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const off = (process.env.PIPELINE_SCHEDULE ?? "").trim().toLowerCase() === "off";
    if (!off && process.env.NEXT_PHASE !== "phase-production-build") {
      const { startScheduler } = await import("./lib/pipeline/schedule.ts");
      startScheduler();
    }
  }
}
