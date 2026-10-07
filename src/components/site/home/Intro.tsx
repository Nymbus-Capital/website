"use client";
/**
 * Page header of the strategies and solutions pages: breadcrumb, eyebrow, H1 whose words rise out of a blur,
 * lead, actions, the yield curves drawing in behind. A local variant of the kit's PageHero with its own class
 * names (`xp-*`).
 */
import type { ReactNode } from "react";
import { Crumbs, Eyebrow, HeroCurves, Reveal, RevealTitle } from "../kit";
import { DataField } from "../fx/fx";

export function Intro({
  eyebrow,
  title,
  accent,
  lead,
  crumbs,
  children,
  aside,
  id,
}: {
  eyebrow?: ReactNode;
  title: string;
  accent?: string;
  lead?: ReactNode;
  crumbs?: { href?: string; label: string }[];
  children?: ReactNode;
  aside?: ReactNode;
  id?: string;
}) {
  return (
    <header className={`xp-hero ${aside ? "has-aside" : ""}`}>
      <DataField />
      <HeroCurves />
      <div className="container">
        {crumbs ? <Crumbs items={crumbs} /> : null}
        <div className="xp-hero-grid">
          <div className="xp-hero-main">
            {eyebrow ? (
              <Reveal self>
                <Eyebrow>{eyebrow}</Eyebrow>
              </Reveal>
            ) : null}
            <RevealTitle as="h1" text={title} accent={accent} className="h1" id={id} />
            {lead ? (
              <Reveal self delay={200}>
                <p className="lead">{lead}</p>
              </Reveal>
            ) : null}
            {children ? (
              <Reveal self delay={320}>
                <div className="actions">{children}</div>
              </Reveal>
            ) : null}
          </div>
          {aside ? (
            <Reveal self kind="pop" delay={280} className="xp-hero-aside">
              {aside}
            </Reveal>
          ) : null}
        </div>
      </div>
    </header>
  );
}
