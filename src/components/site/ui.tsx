"use client";
/**
 * Small building blocks of the keynote pages, all on top of the v3 motion primitives.
 */
import type { CSSProperties, ElementType, ReactNode } from "react";
import { LightTrail, Reveal, RevealTitle } from "@/components/v3/motion";
import { useTranslation } from "@/lib/i18n";

/** Section header: gradient-bordered eyebrow chip (or a kicker with the glowing bar), word-reveal title, lead. */
export function Head({
  eyebrow, kicker, title, accent, sub, as = "h2", size = "h2", id, breakAccent = false, gradient = false, className, style,
}: {
  eyebrow?: string; kicker?: string; title: string; accent?: string; sub?: ReactNode; as?: ElementType; size?: string; id?: string;
  breakAccent?: boolean; gradient?: boolean; className?: string; style?: CSSProperties;
}) {
  return (
    <header className={`head ${className ?? ""}`} style={style}>
      {eyebrow ? <Reveal className="eyebrow" self>{eyebrow}</Reveal> : null}
      {kicker ? <Reveal className="kicker" self><span className="mark" aria-hidden="true" />{kicker}</Reveal> : null}
      <RevealTitle as={as} id={id} text={title} accent={accent} className={size} breakBeforeAccent={breakAccent} gradient={gradient} />
      {sub ? <Reveal as="p" className="lead" self delay={260}>{sub}</Reveal> : null}
    </header>
  );
}

/** Footnote under a screen (compliance text), small and muted. */
export function Foot({ children, className }: { children: ReactNode; className?: string }) {
  return <Reveal as="p" className={`foot fine ${className ?? ""}`} self delay={200}>{children}</Reveal>;
}

const TRAILS = [
  "M-40 600 C 300 575, 560 575, 700 560 C 860 540, 820 470, 560 462 C 470 460, 420 470, 400 480",
  "M1320 610 C 1000 590, 760 600, 600 575 C 420 548, 470 470, 700 468 C 800 466, 860 480, 880 494",
  "M-40 520 C 240 640, 520 660, 760 600 C 980 545, 1120 470, 1320 430",
];

/** Black chapter screen with the glowing light trail drawing itself as it scrolls in. */
export function Chapter({ no, title, kicker, variant = 0, id }: { no: number; title: string; kicker?: string; variant?: number; id?: string }) {
  const { t } = useTranslation();
  const label = kicker ?? t("ui.chapter");
  return (
    <section className="screen dark center chapter" data-swap="" aria-labelledby={id}>
      <LightTrail d={TRAILS[variant % TRAILS.length]} scrub />
      <div className="wrap narrow chapter-in">
        <Reveal className="kicker" self><span className="mark" aria-hidden="true" /><span>{String(no).padStart(2, "0")} · {label}</span></Reveal>
        <RevealTitle as="h2" id={id} text={title} className="h1 chapter-t" step={80} />
      </div>
    </section>
  );
}

/** Figures that are not published yet: an elegant placeholder, never a made-up number. */
export function Soon({ className, long = false }: { className?: string; long?: boolean }) {
  const { t } = useTranslation();
  return (
    <span className={`soon ${className ?? ""}`} data-testid="figures-soon">
      <span className="soon-bar" aria-hidden="true"><i /></span>
      <span className="soon-t">{t("ui.soon")}</span>
      {long ? <span className="soon-l small">{t("ui.soonLong")}</span> : null}
    </span>
  );
}

/** "sample data" chip shown next to illustrative figures (demo environments only). */
export function SampleChip() {
  const { t } = useTranslation();
  return <span className="pill sample-chip" title={t("ui.sampleLong")}>{t("ui.sample")}</span>;
}
