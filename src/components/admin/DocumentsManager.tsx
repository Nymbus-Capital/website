"use client";
import { useMemo, useRef, useState } from "react";
import { Eye, EyeOff, FileUp, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import type { DocType, DocumentMeta } from "@/lib/data/types";
import { api, L10nInput, useConfirm, useToast } from "./client";
import { Pill } from "./Head";
import { bytes, when } from "./format";

type Doc = DocumentMeta & { url: string };
const TYPES: DocType[] = ["factsheet", "fund-facts", "prospectus", "annual-report", "interim-report", "mrfp", "commentary", "presentation", "esg", "other"];
const MAX = 25 * 1024 * 1024;

type Meta = { scope: string; type: DocType; lang: "en" | "fr" | "both"; title: { en: string; fr: string }; date: string; published: boolean };
const today = () => new Date().toISOString().slice(0, 10);
const blank = (): Meta => ({ scope: "firm", type: "factsheet", lang: "both", title: { en: "", fr: "" }, date: today(), published: false });

async function looksLikePdf(f: File): Promise<boolean> {
  const head = new Uint8Array(await f.slice(0, 5).arrayBuffer());
  return String.fromCharCode(...head) === "%PDF-";
}

function MetaFields({ meta, set, funds }: { meta: Meta; set: (m: Meta) => void; funds: { key: string; label: string }[] }) {
  return (
    <>
      <div className="row">
        <label className="adm-field">
          <span>scope</span>
          <select name="scope" value={meta.scope} onChange={(e) => set({ ...meta, scope: e.target.value })}>
            <option value="firm">firm-wide</option>
            {funds.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
        </label>
        <label className="adm-field">
          <span>type</span>
          <select name="type" value={meta.type} onChange={(e) => set({ ...meta, type: e.target.value as DocType })}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="adm-field">
          <span>language</span>
          <select name="lang" value={meta.lang} onChange={(e) => set({ ...meta, lang: e.target.value as Meta["lang"] })}>
            <option value="both">en + fr</option>
            <option value="en">english</option>
            <option value="fr">français</option>
          </select>
        </label>
        <label className="adm-field">
          <span>date</span>
          <input className="adm-input" type="date" name="date" value={meta.date} required onChange={(e) => set({ ...meta, date: e.target.value })} />
        </label>
      </div>
      <L10nInput label="title" value={meta.title} onChange={(title) => set({ ...meta, title })} max={200} name="title" />
      <label className="adm-check">
        <input type="checkbox" name="published" checked={meta.published} onChange={(e) => set({ ...meta, published: e.target.checked })} /> published (downloadable from the public site)
      </label>
    </>
  );
}

export function DocumentsManager({ initial, funds }: { initial: Doc[]; funds: { key: string; label: string }[] }) {
  const [docs, setDocs] = useState<Doc[]>(initial);
  const [meta, setMeta] = useState<Meta>(blank);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState({ scope: "", type: "", q: "", status: "" });
  const [editing, setEditing] = useState<{ id: string; meta: Meta } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceId = useRef<string | null>(null);
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  const label = (scope: string) => (scope === "firm" ? "firm" : funds.find((f) => f.key === scope)?.label ?? scope);

  const shown = useMemo(() => {
    const q = filter.q.trim().toLowerCase();
    return docs.filter(
      (d) =>
        (!filter.scope || d.scope === filter.scope) &&
        (!filter.type || d.type === filter.type) &&
        (!filter.status || (filter.status === "published") === d.published) &&
        (!q || `${d.title.en} ${d.title.fr} ${d.fileName}`.toLowerCase().includes(q)),
    );
  }, [docs, filter]);

  const upsert = (d: Doc) => setDocs((all) => [d, ...all.filter((x) => x.id !== d.id)].sort((a, b) => b.date.localeCompare(a.date) || b.uploadedAt.localeCompare(a.uploadedAt)));

  const pick = async (f: File | null) => {
    setErr(null);
    setFile(null);
    if (!f) return;
    if (f.size > MAX) {
      setErr("The file is larger than 25 MB.");
      return;
    }
    if (!(await looksLikePdf(f))) {
      setErr("This file is not a PDF.");
      return;
    }
    setFile(f);
    setMeta((m) => (m.title.en || m.title.fr ? m : { ...m, title: { en: f.name.replace(/\.pdf$/i, ""), fr: "" } }));
  };

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErr("Choose a PDF file.");
      return;
    }
    setUploading(true);
    setErr(null);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("scope", meta.scope);
    fd.set("type", meta.type);
    fd.set("lang", meta.lang);
    fd.set("titleEn", meta.title.en);
    fd.set("titleFr", meta.title.fr);
    fd.set("date", meta.date);
    fd.set("published", meta.published ? "true" : "false");
    try {
      const r = await api<{ document: DocumentMeta }>("/api/admin/upload/documents", { form: fd });
      upsert({ ...r.document, url: urlOf(r.document) });
      toast("ok", `Uploaded ${r.document.fileName}.`);
      setFile(null);
      setMeta(blank());
      if (fileRef.current) fileRef.current.value = "";
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const patch = async (id: string, body: Partial<Meta>) => {
    try {
      const r = await api<{ document: Doc }>(`/api/admin/documents/${id}`, { method: "PATCH", json: body });
      upsert(r.document);
      return true;
    } catch (e) {
      toast("err", (e as Error).message);
      return false;
    }
  };

  const togglePublish = async (d: Doc) => {
    if (await patch(d.id, { published: !d.published })) toast("ok", d.published ? "Unpublished." : "Published.");
  };

  const remove = async (d: Doc) => {
    const yes = await confirm({ title: "delete this document?", body: `“${d.title.en || d.title.fr}” (${d.fileName}) will be removed from the site and deleted. This cannot be undone.`, action: "delete", danger: true });
    if (!yes) return;
    try {
      await api(`/api/admin/documents/${d.id}`, { method: "DELETE" });
      setDocs((all) => all.filter((x) => x.id !== d.id));
      toast("ok", "Deleted.");
    } catch (e) {
      toast("err", (e as Error).message);
    }
  };

  const startReplace = (id: string) => {
    replaceId.current = id;
    replaceRef.current?.click();
  };
  const doReplace = async (f: File | null) => {
    const id = replaceId.current;
    if (replaceRef.current) replaceRef.current.value = "";
    if (!f || !id) return;
    if (f.size > MAX) {
      toast("err", "The file is larger than 25 MB.");
      return;
    }
    if (!(await looksLikePdf(f))) {
      toast("err", "This file is not a PDF.");
      return;
    }
    const d = docs.find((x) => x.id === id);
    const yes = await confirm({ title: "replace the file?", body: `${d?.fileName ?? "The current file"} will be replaced by ${f.name}. The link stays the same.`, action: "replace" });
    if (!yes) return;
    const fd = new FormData();
    fd.set("file", f);
    try {
      const r = await api<{ document: DocumentMeta }>(`/api/admin/upload/documents/${id}`, { form: fd });
      upsert({ ...r.document, url: urlOf(r.document) });
      toast("ok", "File replaced.");
    } catch (e) {
      toast("err", (e as Error).message);
    }
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (await patch(editing.id, editing.meta)) {
      toast("ok", "Saved.");
      setEditing(null);
    }
  };

  return (
    <>
      <div className="adm-grid side">
        <section className="adm-panel" aria-labelledby="docs-title">
          <h2 id="docs-title" className="adm-h2">library <span className="sp adm-small">{shown.length} of {docs.length}</span></h2>
          <div className="adm-actions" style={{ marginBottom: 12 }}>
            <input className="adm-input" style={{ maxWidth: 220 }} placeholder="search title or file" value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} aria-label="search" />
            <select style={{ maxWidth: 180 }} value={filter.scope} onChange={(e) => setFilter({ ...filter, scope: e.target.value })} aria-label="filter by scope">
              <option value="">all scopes</option>
              <option value="firm">firm-wide</option>
              {funds.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
            <select style={{ maxWidth: 160 }} value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })} aria-label="filter by type">
              <option value="">all types</option>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select style={{ maxWidth: 140 }} value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} aria-label="filter by status">
              <option value="">any status</option>
              <option value="published">published</option>
              <option value="draft">draft</option>
            </select>
          </div>
          <div className="adm-scroll">
            <table className="adm-table" data-testid="documents-table">
              <thead>
                <tr><th>title</th><th>scope</th><th>type</th><th>lang</th><th>date</th><th>file</th><th>status</th><th className="num">actions</th></tr>
              </thead>
              <tbody>
                {shown.map((d) => (
                  <tr key={d.id} data-doc-id={d.id}>
                    <td style={{ maxWidth: 280, whiteSpace: "normal" }}>
                      <div>{d.title.en || d.title.fr}</div>
                      {d.title.en && d.title.fr ? <div className="adm-small">{d.title.fr}</div> : null}
                    </td>
                    <td>{label(d.scope)}</td>
                    <td className="adm-muted">{d.type}</td>
                    <td className="adm-muted">{d.lang}</td>
                    <td className="tabnum">{d.date}</td>
                    <td className="adm-small" title={`sha256 ${d.sha256}\nuploaded ${when(d.uploadedAt)} by ${d.uploadedBy}`}>
                      {d.published ? <a className="adm-link" href={d.url} target="_blank" rel="noopener">{d.fileName}</a> : d.fileName}
                      <div>{bytes(d.size)}</div>
                    </td>
                    <td>{d.published ? <Pill tone="ok">published</Pill> : <Pill tone="mute">draft</Pill>}</td>
                    <td className="num">
                      <span className="adm-actions" style={{ justifyContent: "flex-end", flexWrap: "nowrap" }}>
                        <button type="button" className="adm-btn ghost xs" onClick={() => togglePublish(d)} aria-label={d.published ? "unpublish" : "publish"} title={d.published ? "unpublish" : "publish"} data-testid="toggle-publish">
                          {d.published ? <EyeOff /> : <Eye />}
                        </button>
                        <button type="button" className="adm-btn ghost xs" onClick={() => setEditing({ id: d.id, meta: { scope: d.scope, type: d.type, lang: d.lang, title: d.title, date: d.date, published: d.published } })} aria-label="edit" title="edit metadata"><Pencil /></button>
                        <button type="button" className="adm-btn ghost xs" onClick={() => startReplace(d.id)} aria-label="replace file" title="replace file"><RefreshCw /></button>
                        <button type="button" className="adm-btn ghost xs" onClick={() => remove(d)} aria-label="delete" title="delete"><Trash2 /></button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!shown.length ? <div className="adm-empty">{docs.length ? "No document matches the filters." : "No document yet. Upload the first one."}</div> : null}
          </div>
          <input ref={replaceRef} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => void doReplace(e.target.files?.[0] ?? null)} />
        </section>

        {editing ? (
          <form className="adm-panel adm-form" onSubmit={saveEdit} aria-labelledby="edit-title">
            <h2 id="edit-title" className="adm-h2">edit document <button type="button" className="sp adm-btn ghost xs" onClick={() => setEditing(null)} aria-label="close"><X /></button></h2>
            <MetaFields meta={editing.meta} set={(m) => setEditing({ ...editing, meta: m })} funds={funds} />
            <div className="adm-actions"><span className="sp" /><button type="submit" className="adm-btn">save</button></div>
          </form>
        ) : (
          <form className="adm-panel adm-form" onSubmit={upload} aria-labelledby="upload-title" data-testid="upload-form">
            <h2 id="upload-title" className="adm-h2">upload a pdf</h2>
            {err ? <div className="adm-alert err" role="alert">{err}</div> : null}
            <label className="adm-field">
              <span>file <em>pdf · 25 mb max</em></span>
              <input ref={fileRef} className="adm-input" style={{ paddingTop: 5 }} type="file" name="file" accept="application/pdf,.pdf" onChange={(e) => void pick(e.target.files?.[0] ?? null)} />
            </label>
            <MetaFields meta={meta} set={setMeta} funds={funds} />
            <div className="adm-actions">
              <span className="adm-small">{file ? `${file.name} · ${bytes(file.size)}` : ""}</span>
              <span className="sp" />
              <button type="submit" className="adm-btn" disabled={uploading || !file} data-testid="upload-submit"><FileUp /> {uploading ? "uploading…" : "upload"}</button>
            </div>
          </form>
        )}
      </div>
      {dialog}
    </>
  );
}

/** Mirror of documentUrl() (server) for freshly uploaded documents. */
function urlOf(d: DocumentMeta): string {
  return `/api/documents/${encodeURIComponent(d.id)}/${encodeURIComponent(d.fileName)}`;
}
