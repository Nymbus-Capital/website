import { Fragment } from "react";
import { requireAdminPage } from "@/lib/auth/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FUNDS } from "@/config/funds";
import { Head, Pill } from "@/components/admin/Head";
import { IssueList, PublishRunButton, RunStatusPill } from "@/components/admin/runs";
import { summarizeRunData } from "@/components/admin/summary";
import { duration, fundStateTone, money, num, pct, when } from "@/components/admin/format";
import { safeRun, safeStatus } from "../../_lib/data";

export const dynamic = "force-dynamic";

export default async function RunDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage("/admin/runs"); // defence in depth: every page re-verifies the session (not only the layout)
  const { id } = await params;
  if (!/^[0-9A-Za-z][0-9A-Za-z-]{0,79}$/.test(id)) notFound();
  const [run, status] = await Promise.all([safeRun(id), safeStatus()]);
  if (!run) notFound();
  const { report } = run;
  const summary = summarizeRunData(run.data);
  const name = (k: string) => FUNDS.find((f) => f.key === k)?.short.en ?? k;
  return (
    <>
      <Head crumb="admin / pipeline / run" title={`run ${report.id}`} lead={<>Started {when(report.startedAt)} by {report.by} ({report.trigger}), took {duration(report.startedAt, report.finishedAt)}.</>}>
        <RunStatusPill status={report.status} />
        <PublishRunButton run={report} publishedRunId={status?.publishedRunId ?? null} />
      </Head>

      <div className="adm-grid side">
        <div className="adm-grid">
          <section className="adm-panel">
            <h2 className="adm-h2">funds</h2>
            <div className="adm-scroll">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>fund</th><th>outcome</th><th>as of</th><th>basis</th>
                    <th className="num">1m</th><th className="num">ytd</th><th className="num">1y</th><th className="num">si</th>
                    <th>nav</th><th className="num">aum</th><th>factsheet</th>
                  </tr>
                </thead>
                <tbody>
                  {FUNDS.map((f) => {
                    const s = summary.funds.find((x) => x.key === f.key);
                    const st = report.funds?.[f.key];
                    return (
                      <tr key={f.key}>
                        <td>{f.short.en}{s?.variant ? <div className="adm-small adm-muted">{s.variant}</div> : null}</td>
                        <td><Pill tone={fundStateTone(st)}>{st ?? "—"}</Pill></td>
                        <td className="tabnum">{s?.performanceAsOf ?? "—"}</td>
                        <td className="adm-muted">{s?.basis ?? "—"}</td>
                        <td className="num">{pct(s?.r1M)}</td>
                        <td className="num">{pct(s?.rYTD)}</td>
                        <td className="num">{pct(s?.r1Y)}</td>
                        <td className="num">{pct(s?.rSI)}</td>
                        <td className="adm-small">
                          {s?.classes.length
                            ? s.classes.slice(0, 3).map((c) => `${c.display} ${num(c.nav, 4)}`).join(" · ") + (s.classes.length > 3 ? ` +${s.classes.length - 3}` : "")
                            : "—"}
                        </td>
                        <td className="num">{money(s?.aumCad)}</td>
                        <td className="tabnum">{s?.factsheetMonth ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
          <section className="adm-panel">
            <h2 className="adm-h2">issues <span className="sp adm-small">{report.issues.length}</span></h2>
            <IssueList issues={report.issues} />
          </section>
        </div>
        <div className="adm-grid">
          <section className="adm-panel">
            <h2 className="adm-h2">as of</h2>
            <dl className="adm-dl">
              <dt>performance</dt><dd>{report.asOf?.performance ?? "—"}</dd>
              <dt>nav</dt><dd>{report.asOf?.nav ?? "—"}</dd>
              <dt>aum</dt><dd>{report.asOf?.aum ?? "—"}</dd>
              <dt>factsheet</dt><dd>{report.asOf?.factsheet ?? "—"}</dd>
              <dt>data mode</dt><dd>{summary.mode}</dd>
              <dt>published</dt><dd>{report.publishedAt ? `${when(report.publishedAt)} by ${report.publishedBy ?? "—"}` : "no"}</dd>
            </dl>
          </section>
          <section className="adm-panel">
            <h2 className="adm-h2">sources</h2>
            <ul className="adm-issues">
              {report.sources.map((s) => (
                <li key={s.name}>
                  <Pill tone={s.ok ? "ok" : "err"}>{s.ok ? "ok" : "fail"}</Pill>
                  <div>{s.name}{s.detail ? <code>{s.detail}</code> : null}</div>
                </li>
              ))}
              {!report.sources.length ? <li><span /><span className="adm-muted">none recorded</span></li> : null}
            </ul>
          </section>
          {summary.provenance.length ? (
            <section className="adm-panel">
              <h2 className="adm-h2">provenance</h2>
              <dl className="adm-dl" style={{ fontSize: 12 }}>
                {summary.provenance.slice(0, 40).map(([k, v]) => (
                  <Fragment key={k}><dt className="mono">{k.replace(/^funds\./, "")}</dt><dd>{v}</dd></Fragment>
                ))}
              </dl>
            </section>
          ) : null}
          <Link href="/admin/runs" className="adm-link adm-small">← all runs</Link>
          <span className="adm-small">Funds kept on their previous data: {Object.entries(report.funds ?? {}).filter(([, v]) => v !== "updated").map(([k]) => name(k)).join(", ") || "none"}.</span>
        </div>
      </div>
    </>
  );
}
