import type { ReactNode } from "react";

export function Head({ crumb, title, lead, children }: { crumb?: string; title: string; lead?: ReactNode; children?: ReactNode }) {
  return (
    <header className="adm-head">
      <div className="adm-crumb"><span className="adm-mark" />{crumb ?? "admin"}</div>
      <div className="row">
        <div>
          <h1>{title}</h1>
          {lead ? <p>{lead}</p> : null}
        </div>
        {children ? <div className="adm-actions">{children}</div> : null}
      </div>
    </header>
  );
}

export function Pill({ tone = "mute", children, plain }: { tone?: string; children: ReactNode; plain?: boolean }) {
  return <span className={`adm-pill ${tone}${plain ? " plain" : ""}`}>{children}</span>;
}
