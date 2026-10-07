"use client";
/** Opening screen of a secondary page: black, word-reveal display title, optional light trail and lead. */
import type { ReactNode } from "react";
import { LightTrail, Reveal, RevealTitle, Spotlight } from "@/components/motion/motion";

export function PageHero({
  eyebrow,
  title,
  accent,
  lead,
  children,
  trail = true,
  id = "page-t",
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  lead?: ReactNode;
  children?: ReactNode;
  trail?: boolean;
  id?: string;
  compact?: boolean;
}) {
  return (
    <section className={`screen dark page-hero ${compact ? "compact" : ""}`} data-swap="" aria-labelledby={id}>
      {trail ? <LightTrail d="M-60 690 C 320 660, 640 690, 900 630 C 1080 590, 1180 540, 1340 500" /> : null}
      <Spotlight />
      <div className="wrap wide">
        {eyebrow ? (
          <Reveal className="eyebrow" self>
            {eyebrow}
          </Reveal>
        ) : null}
        <RevealTitle
          as="h1"
          id={id}
          text={title}
          accent={accent}
          className="display page-t"
          step={110}
          breakBeforeAccent
        />
        {lead ? (
          <Reveal as="p" className="lead page-lead" self delay={450}>
            {lead}
          </Reveal>
        ) : null}
        {children}
      </div>
    </section>
  );
}
