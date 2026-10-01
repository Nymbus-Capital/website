import { Head, Pill } from "@/components/admin/Head";
import { requireAdminPage } from "@/lib/auth/server";
import { readAuditTail } from "@/components/admin/audit-read";
import { when } from "@/components/admin/format";

export const dynamic = "force-dynamic";

const tone = (a: string) =>
  a.startsWith("auth.denied") || a.endsWith("crashed") || a.endsWith("delete") ? "err" : a.startsWith("pipeline") ? "info" : a.startsWith("auth") ? "mute" : "ok";

function detail(d: unknown): string {
  if (d === undefined || d === null) return "";
  const s = JSON.stringify(d);
  return s.length > 400 ? `${s.slice(0, 400)}…` : s;
}

export default async function AuditPage() {
  await requireAdminPage("/admin/audit"); // defence in depth: every page re-verifies the session (not only the layout)
  const entries = await readAuditTail(200);
  return (
    <>
      <Head crumb="admin / audit" title="audit log" lead="The last 200 changes and sign-ins, newest first." />
      <section className="adm-panel">
        <div className="adm-scroll">
          <table className="adm-table" data-testid="audit-table">
            <thead><tr><th>when</th><th>who</th><th>action</th><th>target</th><th>detail</th></tr></thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={`${e.at}-${i}`}>
                  <td className="tabnum">{when(e.at)}</td>
                  <td>{e.by}</td>
                  <td><Pill tone={tone(e.action)} plain>{e.action}</Pill></td>
                  <td className="mono">{e.target ?? ""}</td>
                  <td className="mono adm-muted" style={{ whiteSpace: "normal", wordBreak: "break-all", maxWidth: 520 }}>{detail(e.detail)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!entries.length ? <div className="adm-empty">Nothing recorded yet.</div> : null}
        </div>
      </section>
    </>
  );
}
