"use client";
/**
 * Pipeline UI: live status panel (polls while a run is in progress), "run now", runs table, publish / roll back.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Play, RefreshCw, Upload } from "lucide-react";
import type { RunReport } from "@/lib/pipeline";
import { PUBLIC_FUNDS as FUNDS } from "@/config/funds-public";
import { api, ApiError, useConfirm, useToast } from "./client";
import { Pill } from "./Head";
import { duration, fundStateTone, levelTone, runTone, when } from "./format";

export type PipelineStatus = {
  running: boolean;
  schedule: string[];
  timezone: string;
  nextRunAt: string | null;
  lastRun: RunReport | null;
  publishedRunId: string | null;
};

export function RunStatusPill({ status }: { status: string }) {
  return <Pill tone={runTone(status)}>{status}</Pill>;
}

export function FundStates({ funds }: { funds: RunReport["funds"] }) {
  return (
    <span className="adm-chips">
      {FUNDS.map((f) => {
        const s = funds?.[f.key];
        return (
          <span key={f.key} title={`${f.name.en}: ${s ?? "not in run"}`} className={`adm-pill ${fundStateTone(s)}`}>
            {f.short.en.split(" ").map((w) => w[0]).join("")}
          </span>
        );
      })}
    </span>
  );
}

function issueCounts(r: RunReport) {
  const c = { error: 0, warn: 0, info: 0 };
  for (const i of r.issues ?? []) c[i.level] = (c[i.level] ?? 0) + 1;
  return c;
}

export function RunsTable({ runs, publishedRunId, compact }: { runs: RunReport[]; publishedRunId: string | null; compact?: boolean }) {
  if (!runs.length) return <div className="adm-empty">No pipeline run yet.</div>;
  return (
    <div className="adm-scroll">
      <table className="adm-table" data-testid="runs-table">
        <thead>
          <tr>
            <th>started</th>
            <th>status</th>
            <th>trigger</th>
            {!compact && <th>by</th>}
            <th>performance as of</th>
            {!compact && <th>nav as of</th>}
            <th>funds</th>
            <th className="num">issues</th>
            {!compact && <th className="num">duration</th>}
            <th />
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => {
            const c = issueCounts(r);
            return (
              <tr key={r.id} className={r.id === publishedRunId ? "hl" : undefined}>
                <td className="tabnum">{when(r.startedAt)}</td>
                <td>
                  <RunStatusPill status={r.status} /> {r.id === publishedRunId ? <Pill tone="info" plain>live</Pill> : null}
                </td>
                <td className="adm-muted">{r.trigger}</td>
                {!compact && <td className="adm-muted">{r.by}</td>}
                <td className="tabnum">{r.asOf?.performance ?? "—"}</td>
                {!compact && <td className="tabnum">{r.asOf?.nav ?? "—"}</td>}
                <td><FundStates funds={r.funds} /></td>
                <td className="num">
                  {c.error ? <span className="neg">{c.error} err </span> : null}
                  {c.warn ? <span style={{ color: "var(--yellow)" }}>{c.warn} warn</span> : null}
                  {!c.error && !c.warn ? <span className="adm-muted">{c.info || "—"}</span> : null}
                </td>
                {!compact && <td className="num adm-muted">{duration(r.startedAt, r.finishedAt)}</td>}
                <td className="num"><Link className="adm-link" href={`/admin/runs/${encodeURIComponent(r.id)}`}>details →</Link></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function PipelinePanel({ initialStatus, initialRuns }: { initialStatus: PipelineStatus | null; initialRuns: RunReport[] }) {
  const [status, setStatus] = useState(initialStatus);
  const [runs, setRuns] = useState(initialRuns);
  const [dryRun, setDryRun] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(initialStatus ? null : "The pipeline status is unavailable.");
  const toast = useToast();

  const refresh = useCallback(async () => {
    try {
      const [s, r] = await Promise.all([api<PipelineStatus>("/api/admin/status"), api<{ runs: RunReport[] }>("/api/admin/runs?limit=12")]);
      setStatus(s);
      setRuns(r.runs);
      setError(null);
      return s;
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, []);

  // poll every 3 s while a run is in progress
  useEffect(() => {
    if (!status?.running) return;
    const t = setInterval(async () => {
      const s = await refresh();
      if (s && !s.running) toast("ok", `Run finished: ${s.lastRun?.status ?? "done"}.`);
    }, 3000);
    return () => clearInterval(t);
  }, [status?.running, refresh, toast]);

  const runNow = async () => {
    setStarting(true);
    try {
      await api("/api/admin/pipeline/run", { json: { dryRun } });
      toast("info", dryRun ? "Dry run started." : "Pipeline run started.");
      setStatus((s) => (s ? { ...s, running: true } : s));
      setTimeout(refresh, 800);
    } catch (e) {
      toast("err", (e as Error).message);
      if (e instanceof ApiError && e.status === 409) void refresh();
    } finally {
      setStarting(false);
    }
  };

  const last = status?.lastRun ?? null;
  const issues = last?.issues ?? [];
  return (
    <>
      <section className="adm-panel" aria-labelledby="pipeline-title" data-testid="pipeline-status">
        <h2 id="pipeline-title" className="adm-h2">
          {status?.running ? <span className="adm-dot" aria-hidden="true" /> : <span className="adm-mark" />}
          data pipeline
          <span className="sp adm-actions">
            <label className="adm-check">
              <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} /> dry run
            </label>
            <button type="button" className="adm-btn ghost xs" onClick={() => void refresh()} aria-label="refresh status"><RefreshCw /></button>
            <button type="button" className="adm-btn" onClick={runNow} disabled={starting || !!status?.running} data-testid="run-now">
              <Play /> {status?.running ? "running…" : "run now"}
            </button>
          </span>
        </h2>
        {error ? <div className="adm-alert err">{error}</div> : null}
        <div className="adm-grid c4" style={{ marginTop: 6 }}>
          <div className="adm-kpi">
            <span className="k">last run</span>
            <span className="v">{last ? <RunStatusPill status={last.status} /> : "—"}</span>
            <span className="s">{last ? `${when(last.startedAt)} · ${last.trigger} · ${last.by}` : "never"}</span>
          </div>
          <div className="adm-kpi">
            <span className="k">performance as of</span>
            <span className="v grad">{last?.asOf?.performance ?? "—"}</span>
            <span className="s">nav {last?.asOf?.nav ?? "—"} · aum {last?.asOf?.aum ?? "—"}</span>
          </div>
          <div className="adm-kpi">
            <span className="k">factsheet</span>
            <span className="v">{last?.asOf?.factsheet ?? "—"}</span>
            <span className="s">live run {status?.publishedRunId ? <Link className="adm-link mono" href={`/admin/runs/${encodeURIComponent(status.publishedRunId)}`}>{status.publishedRunId}</Link> : "—"}</span>
          </div>
          <div className="adm-kpi">
            <span className="k">next run</span>
            <span className="v">{status?.nextRunAt ? when(status.nextRunAt).slice(11) : "off"}</span>
            <span className="s">{status?.nextRunAt ? when(status.nextRunAt).slice(0, 10) : ""} {status?.schedule?.length ? `(${status.schedule.join(", ")} ${status.timezone})` : "schedule off"}</span>
          </div>
        </div>
        {last?.status === "pending-review" ? (
          <div className="adm-alert warn" style={{ marginTop: 14 }}>
            The last run is waiting for approval. <Link className="adm-link" href={`/admin/runs/${encodeURIComponent(last.id)}`}>Review and publish →</Link>
          </div>
        ) : null}
        {issues.length ? (
          <>
            <h3 className="adm-small" style={{ margin: "16px 0 6px", textTransform: "lowercase" }}>issues of the last run</h3>
            <IssueList issues={issues.slice(0, 8)} />
            {issues.length > 8 && last ? <Link className="adm-link adm-small" href={`/admin/runs/${encodeURIComponent(last.id)}`}>all {issues.length} issues →</Link> : null}
          </>
        ) : null}
      </section>
      <section className="adm-panel" aria-labelledby="runs-title">
        <h2 id="runs-title" className="adm-h2">recent runs <Link href="/admin/runs" className="sp adm-link adm-small">full history →</Link></h2>
        <RunsTable runs={runs} publishedRunId={status?.publishedRunId ?? null} compact />
      </section>
    </>
  );
}

export function IssueList({ issues }: { issues: { key: string; level: string; message: string }[] }) {
  if (!issues.length) return <div className="adm-empty">No issues.</div>;
  return (
    <ul className="adm-issues">
      {issues.map((i, n) => (
        <li key={`${i.key}-${n}`}>
          <Pill tone={levelTone(i.level)}>{i.level}</Pill>
          <div>
            {i.message}
            <code>{i.key}</code>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PublishRunButton({ run, publishedRunId }: { run: RunReport; publishedRunId: string | null }) {
  const { confirm, dialog } = useConfirm();
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const isLive = run.id === publishedRunId;
  const publishable = run.status === "pending-review" || run.status === "published" || run.status === "blocked";
  if (!publishable) return <span className="adm-small">A {run.status} run cannot be published.</span>;
  // a run live in auto mode may still hold a performance class change back: publishing it again approves the change
  const classChange = !!run.classChanges?.length && !run.classChangesApprovedAt;
  // likewise new months no independent source confirms (auto mode published the run without them)
  const review = !!run.reviewNeeded?.length && run.status === "pending-review";
  if (isLive && !classChange && !review) return <Pill tone="ok">live on the site</Pill>;
  const pending = run.status === "pending-review" || run.status === "blocked";
  const go = async () => {
    const yes = await confirm({
      title: pending ? "publish this run?" : "roll back to this run?",
      body: pending
        ? `The public site will show the data of run ${run.id} (performance as of ${run.asOf?.performance ?? "—"}).${classChange ? ` This approves the performance class change of ${run.classChanges!.join(", ")}: every month is restated under the new class label.` : ""}${review ? ` This approves the new performance month(s) of ${run.reviewNeeded!.join(", ")} that no source independent of the dataplatform confirms: check them first.` : ""}${run.status === "blocked" ? " This run failed a blocking check: review its issues first." : ""}`
        : `The public site will go back to the data of run ${run.id} (performance as of ${run.asOf?.performance ?? "—"}). Later runs stay in the history.`,
      action: pending ? "publish" : "roll back",
      danger: !pending,
    });
    if (!yes) return;
    setBusy(true);
    try {
      await api(`/api/admin/runs/${encodeURIComponent(run.id)}/publish`, { json: { confirm: true } });
      toast("ok", pending ? "Run published." : "Rolled back.");
      router.refresh();
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <button type="button" className={`adm-btn${pending ? "" : " ghost"}`} onClick={go} disabled={busy} data-testid="publish-run">
        <Upload /> {classChange ? "approve class change & publish" : pending ? "approve & publish" : "roll back to this run"}
      </button>
      {dialog}
    </>
  );
}
