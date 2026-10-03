import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/server";
import { notFound } from "next/navigation";
import { FUNDS } from "@/config/funds";
import { getContent } from "@/lib/data/content";
import { getSiteData } from "@/lib/data/site";
import type { FundKey } from "@/lib/data/types";
import { Head, Pill } from "@/components/admin/Head";
import { FundEditor } from "@/components/admin/FundEditor";
import { isPinnable, summarizeFund } from "@/components/admin/summary";
import { money, num, pct, when } from "@/components/admin/format";
import { safeRuns } from "../../_lib/data";
import { morningstarMissing } from "../../_lib/rankings";
import { policyMonths } from "@/lib/rankings/policy";

export const dynamic = "force-dynamic";

export default async function FundPage({ params }: { params: Promise<{ key: string }> }) {
  await requireAdminPage("/admin/funds"); // defence in depth: every page re-verifies the session (not only the layout)
  const { key } = await params;
  const spec = FUNDS.find((f) => f.key === key);
  if (!spec) notFound();
  const [content, site, runs] = await Promise.all([getContent(), getSiteData(), safeRuns(60)]);
  const fundOnly = { ...content, funds: { [spec.key]: content.funds[spec.key as FundKey] ?? {} } };
  const rankingsCtx = { months: policyMonths(content), morningstarMissing: await morningstarMissing(fundOnly) };
  const fc = content.funds[spec.key as FundKey] ?? {};
  const live = summarizeFund(spec.key, site?.funds?.[spec.key]);
  const pinnable = runs
    // live-data check happens on save (the list only has reports)
    .filter((r) => isPinnable(r, { mode: "live" }) && r.funds?.[spec.key] === "updated")
    .map((r) => ({ id: r.id, label: `${when(r.startedAt)} · perf ${r.asOf?.performance ?? "—"} · ${r.status}` }));
  if (fc.pinnedSnapshot && !pinnable.some((p) => p.id === fc.pinnedSnapshot)) pinnable.unshift({ id: fc.pinnedSnapshot, label: `${fc.pinnedSnapshot} (current pin)` });
  const seen = new Set<string>();
  const classTypeRows = [
    ...(spec.classes ?? []).map((c) => ({ fundserv: c.fundserv, label: `${c.fundserv} · ${c.display}`, defaultType: c.type ?? ("none" as const) })),
    ...live.classes.map((c) => ({ fundserv: c.fundserv, label: `${c.fundserv} · ${c.display} (${c.currency})`, defaultType: "none" as const })),
  ].filter((c) => (seen.has(c.fundserv) ? false : (seen.add(c.fundserv), true)));
  return (
    <>
      <Head crumb="admin / funds" title={spec.short.en} lead={<>{spec.name.en} · {spec.assetClass.en} · public page <Link className="adm-link" href={`/strategies/${spec.key}`} target="_blank">/strategies/{spec.key} ↗</Link></>}>
        {fc.hidden ? <Pill tone="warn">hidden</Pill> : <Pill tone="ok">visible</Pill>}
        {fc.pinnedSnapshot ? <Pill tone="info">pinned</Pill> : null}
      </Head>

      <nav className="adm-tabs" aria-label="funds">
        {FUNDS.map((f) => (
          <Link key={f.key} href={`/admin/funds/${f.key}`} aria-current={f.key === spec.key ? "page" : undefined} prefetch={false}>
            <span className="adm-swatch" style={{ background: f.color.solid }} />
            {f.short.en}
          </Link>
        ))}
      </nav>

      <div className="adm-grid side">
        <FundEditor
          key={`${spec.key}-${content.version}`}
          fundKey={spec.key}
          version={content.version}
          initial={fc}
          defaults={{ tagline: spec.defaults.tagline, description: spec.defaults.description, riskRating: spec.defaults.riskRating, headlineClass: spec.headlineClass }}
          classes={live.classes.map((c) => ({ fundserv: c.fundserv, label: `${c.fundserv} · ${c.display} (${c.currency})` }))}
          runs={pinnable}
          classTypeRows={classTypeRows}
          rankingsCtx={rankingsCtx}
        />
        <aside className="adm-grid" aria-label="live numbers">
          <section className="adm-panel">
            <h2 className="adm-h2">live numbers</h2>
            <div className="adm-grid c2">
              <div className="adm-kpi"><span className="k">1 year</span><span className="v grad">{pct(live.r1Y)}</span></div>
              <div className="adm-kpi"><span className="k">since inception</span><span className="v">{pct(live.rSI)}</span></div>
              <div className="adm-kpi"><span className="k">ytd</span><span className="v">{pct(live.rYTD)}</span></div>
              <div className="adm-kpi"><span className="k">aum</span><span className="v">{money(live.aumCad)}</span></div>
            </div>
            <dl className="adm-dl" style={{ marginTop: 14 }}>
              <dt>performance</dt><dd>{live.performanceAsOf ?? "—"} ({live.basis ?? "—"})</dd>
              <dt>nav as of</dt><dd>{live.navAsOf ?? "—"}</dd>
              <dt>factsheet</dt><dd>{live.factsheetMonth ?? "—"}</dd>
              <dt>holdings</dt><dd>{live.holdings}</dd>
            </dl>
          </section>
          <section className="adm-panel">
            <h2 className="adm-h2">classes</h2>
            {live.classes.length ? (
              <table className="adm-table">
                <thead><tr><th>code</th><th>class</th><th className="num">nav</th><th className="num">chg</th></tr></thead>
                <tbody>
                  {live.classes.map((c) => (
                    <tr key={c.fundserv} className={c.fundserv === (fc.headlineClass || spec.headlineClass) ? "hl" : undefined}>
                      <td className="mono">{c.fundserv}</td>
                      <td>{c.display} <span className="adm-muted">{c.currency}</span></td>
                      <td className="num">{num(c.nav, 4)}</td>
                      <td className={`num ${(c.changePct ?? 0) < 0 ? "neg" : "pos"}`}>{pct(c.changePct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="adm-empty">No NAV classes in the published data.</div>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
