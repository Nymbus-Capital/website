"use client";
/** A titled block inside a fund tab: optional card surface, heading (h3) with an optional aside, floats up on scroll. */
import type { ReactNode } from "react";
import { Reveal } from "@/components/v3/motion";

export function Block({ title, children, aside, card = true, className, id, lead, testId }: {
  title: string; children: ReactNode; aside?: ReactNode; card?: boolean; className?: string; id?: string; lead?: ReactNode; testId?: string;
}) {
  return (
    <Reveal self className={`fb ${card ? "fb-card" : ""} ${className ?? ""}`} id={id} data-testid={testId}>
      <div className="fb-head">
        <h3 className="fb-title"><span className="fb-mark" aria-hidden="true" />{title}</h3>
        {aside ? <div className="fb-aside">{aside}</div> : null}
      </div>
      {lead ? <p className="fb-lead">{lead}</p> : null}
      {children}
    </Reveal>
  );
}
