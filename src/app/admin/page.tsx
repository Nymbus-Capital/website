import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/server";
import { FUNDS } from "@/config/funds";
import { getContent } from "@/lib/data/content";
import { getSiteData } from "@/lib/data/site";
import { listDocuments } from "@/lib/data/documents";
import { Head, Pill } from "@/components/admin/Head";
import { PipelinePanel } from "@/components/admin/runs";
import { summarizeFund } from "@/components/admin/summary";
import { money, pct, when } from "@/components/admin/format";
import { safeRuns, safeStatus } from "./_lib/data";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdminPage("/admin"); // defence in depth: every page re-verifies the session (not only the layout)
  const [status, runs, content, site, docs] = await Promise.all([safeStatus(), safeRuns(12), getContent(), getSiteData(), listDocuments()]);
  const published = docs.filter((d) => d.published).length;
  return (
    <>
      <Head title="dashboard" lead="Pipeline health, what the public site shows right now, and shortcuts to the content you manage.">
        <Pill tone={content.pipeline.publishMode === "auto" ? "ok" : "info"}>publish mode: {content.pipeline.publishMode}</Pill>
        {site?.mode === "sample" ? <Pill tone="warn">sample data</Pill> : null}
      </Head>

      <PipelinePanel initialStatus={status} initialRuns={runs} />

      <section className="adm-panel" aria-labelledby="live-title">
        <h2 id="live-title" className="adm-h2">
          on the site now <span className="sp adm-small">generated {when(site?.generatedAt)}</span>
        </h2>
        <div className="adm-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th>fund</th>
                <th>visibility</th>
                <th>as of</th>
                <th className="num">1m</th>
                <th className="num">ytd</th>
                <th className="num">1y</th>
                <th className="num">since inception</th>
                <th className="num">aum</th>
                <th>pinned</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {FUNDS.map((f) => {
                const s = summarizeFund(f.key, site?.funds?.[f.key]);
                const fc = content.funds[f.key] ?? {};
                return (
                  <tr key={f.key}>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <span className="adm-swatch" style={{ background: f.color.solid }} />
                        {f.short.en}
                      </span>
                    </td>
                    <td>{fc.hidden ? <Pill tone="warn">hidden</Pill> : <Pill tone="ok">visible</Pill>}</td>
                    <td className="tabnum">{s.performanceAsOf ?? "—"}</td>
                    <td className="num">{pct(s.r1M)}</td>
                    <td className="num">{pct(s.rYTD)}</td>
                    <td className="num">{pct(s.r1Y)}</td>
                    <td className="num">{pct(s.rSI)}</td>
                    <td className="num">{money(s.aumCad)}</td>
                    <td className="mono">{fc.pinnedSnapshot ?? "—"}</td>
                    <td className="num"><Link className="adm-link" href={`/admin/funds/${f.key}`}>edit →</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="adm-grid c3">
        <Link href="/admin/documents" className="adm-panel adm-kpi">
          <span className="k">documents</span>
          <span className="v grad">{docs.length}</span>
          <span className="s">{published} published · {docs.length - published} draft</span>
        </Link>
        <Link href="/admin/settings" className="adm-panel adm-kpi">
          <span className="k">announcement banner</span>
          <span className="v">{content.firm.announcement ? "on" : "off"}</span>
          <span className="s">{content.firm.announcement?.en?.slice(0, 80) ?? "no banner"}</span>
        </Link>
        <Link href="/admin/audit" className="adm-panel adm-kpi">
          <span className="k">content version</span>
          <span className="v">v{content.version}</span>
          <span className="s">{content.version ? `${when(content.updatedAt)} · ${content.updatedBy}` : "defaults"}</span>
        </Link>
      </div>
    </>
  );
}
