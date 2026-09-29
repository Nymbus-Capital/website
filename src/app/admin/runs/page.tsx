import { Head } from "@/components/admin/Head";
import { requireAdminPage } from "@/lib/auth/server";
import { RunsTable } from "@/components/admin/runs";
import { safeRuns, safeStatus } from "../_lib/data";

export const dynamic = "force-dynamic";

export default async function RunsPage() {
  await requireAdminPage("/admin/runs"); // defence in depth: every page re-verifies the session (not only the layout)
  const [status, runs] = await Promise.all([safeStatus(), safeRuns(100)]);
  return (
    <>
      <Head crumb="admin / pipeline" title="pipeline runs" lead="Every run is kept as a snapshot. Open a run to see its issues and sources, approve it, or roll the public site back to it." />
      <section className="adm-panel">
        <h2 className="adm-h2">last {runs.length} runs <span className="sp adm-small">highlighted: live on the site</span></h2>
        <RunsTable runs={runs} publishedRunId={status?.publishedRunId ?? null} />
      </section>
    </>
  );
}
