"use client";
/**
 * Client helpers of the admin: API calls (always same-origin with the CSRF header), toasts, confirm dialog.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(
  path: string,
  init: { method?: string; json?: unknown; form?: FormData } = {},
): Promise<T> {
  const headers: Record<string, string> = { "x-nymbus-admin": "1", Accept: "application/json" };
  let body: BodyInit | undefined;
  if (init.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
  } else if (init.form) {
    body = init.form;
  }
  const res = await fetch(path, {
    method: init.method ?? (body ? "POST" : "GET"),
    headers,
    body,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (res.status === 401) {
    window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    throw new ApiError(401, "unauthenticated", "Your session expired; redirecting to sign-in…");
  }
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* empty */
  }
  if (!res.ok) {
    const d = (data ?? {}) as { error?: string; message?: string };
    throw new ApiError(res.status, d.error ?? `http_${res.status}`, d.message ?? `Request failed (${res.status}).`);
  }
  return data as T;
}

/* ------------------------------------------------------------------ toasts */

type Toast = { id: number; kind: "ok" | "err" | "info"; text: string };
const ToastCtx = createContext<(kind: Toast["kind"], text: string) => void>(() => undefined);
export const useToast = () => useContext(ToastCtx);

export function AdminShellClient({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef<number>(0);
  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = (seq.current ?? 0) + 1;
    seq.current = id;
    setToasts((t) => [...t.slice(-3), { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "err" ? 8000 : 4000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="adm-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`adm-toast ${t.kind}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ------------------------------------------------------------------ confirm dialog */

export function useConfirm() {
  const [state, setState] = useState<{
    title: string;
    body: string;
    action: string;
    danger?: boolean;
    resolve: (v: boolean) => void;
  } | null>(null);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (state && !d.open) d.showModal();
    if (!state && d.open) d.close();
  }, [state]);
  const confirm = useCallback(
    (o: { title: string; body: string; action: string; danger?: boolean }) =>
      new Promise<boolean>((resolve) => setState({ ...o, resolve })),
    [],
  );
  const close = (v: boolean) => {
    state?.resolve(v);
    setState(null);
  };
  const dialog = (
    <dialog
      ref={ref}
      className="adm-dialog"
      onCancel={(e) => {
        e.preventDefault();
        close(false);
      }}
      aria-labelledby="adm-confirm-title"
    >
      {state ? (
        <div className="in">
          <span className="adm-mark" />
          <h3 id="adm-confirm-title">{state.title}</h3>
          <p>{state.body}</p>
          <div className="adm-actions">
            <span className="sp" />
            <button type="button" className="adm-btn ghost" onClick={() => close(false)}>
              cancel
            </button>
            <button
              type="button"
              className={`adm-btn${state.danger ? " danger" : ""}`}
              onClick={() => close(true)}
              autoFocus
            >
              {state.action}
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
  return { confirm, dialog };
}

/* ------------------------------------------------------------------ small shared bits */

export function L10nInput({
  label,
  value,
  onChange,
  multiline,
  max,
  hint,
  name,
}: {
  label: string;
  value: { en: string; fr: string };
  onChange: (v: { en: string; fr: string }) => void;
  multiline?: boolean;
  max?: number;
  hint?: string;
  name?: string;
}) {
  return (
    <div className="adm-field">
      <span>
        {label}
        {hint ? <em>{hint}</em> : null}
      </span>
      <div className="adm-l10n">
        {(["en", "fr"] as const).map((l) => (
          <div key={l} className="lang" data-lang={l}>
            {multiline ? (
              <textarea
                className="adm-input"
                name={name ? `${name}.${l}` : undefined}
                aria-label={`${label} (${l.toUpperCase()})`}
                value={value[l]}
                maxLength={max}
                rows={4}
                onChange={(e) => onChange({ ...value, [l]: e.target.value })}
              />
            ) : (
              <input
                className="adm-input"
                name={name ? `${name}.${l}` : undefined}
                aria-label={`${label} (${l.toUpperCase()})`}
                value={value[l]}
                maxLength={max}
                onChange={(e) => onChange({ ...value, [l]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
