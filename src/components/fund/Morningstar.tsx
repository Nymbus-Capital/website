"use client";
/**
 * Morningstar Rating™ block (overview and awards tabs). The official Morningstar logo and star-rating image are shown
 * only when the official files are present (public/brand/third-party/ or uploaded in the admin, see
 * src/lib/data/brand-assets.ts); otherwise the rating is plain text — never an imitation graphic. Always with the class,
 * the as-of date, the source link and Morningstar's attribution / methodology text (in full, behind an info note).
 */
import { ExternalLink } from "lucide-react";
import type { MorningstarRating } from "@/lib/data/types";
import type { BrandAssets } from "@/lib/data/brand-assets";
import { tr } from "./copy";
import { RK } from "./rankings-copy";
import { InfoNote } from "./InfoNote";
import { dateLabel, type Lang } from "./lib/format.ts";

const CLASS_WORD = /^(class|series|série|classe)\s+/i;

const ratingText = (m: Pick<MorningstarRating, "stars">, lang: Lang): string =>
  m.stars === 1 ? tr(RK.ms.ratingOne, lang) : tr(RK.ms.rating, lang).replace("{n}", String(m.stars));

export function MorningstarRatingBlock({ m, brand, lang, variant = "full", testId = "morningstar" }: {
  m: MorningstarRating; brand?: BrandAssets; lang: Lang; variant?: "overview" | "full"; testId?: string;
}) {
  const logo = brand?.["morningstar-logo"];
  const stars = brand?.[`morningstar-stars-${m.stars}` as keyof BrandAssets];
  const text = ratingText(m, lang);
  const date = dateLabel(m.asOf, lang, true);
  const series = tr(RK.ms.series, lang).replace("{x}", m.classLabel.replace(CLASS_WORD, ""));
  const detail = [
    series,
    m.category ? tr(RK.ms.category, lang).replace("{c}", tr(m.category, lang)) : null,
    m.fundsInCategory ? tr(RK.ms.outOf, lang).replace("{n}", m.fundsInCategory.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA")) : null,
    tr(RK.ms.asOf, lang).replace("{date}", date),
  ].filter(Boolean).join(", ");
  const year = m.asOf.slice(0, 4);
  return (
    <section className={`ms-block ms-${variant}`} data-testid={testId} data-official={logo && stars ? "yes" : "no"} aria-label={tr(RK.ms.title, lang)}>
      <div className="ms-head">
        {logo ? <img className="ms-logo" src={logo} alt="Morningstar" height={26} data-testid="morningstar-logo" /> : null}
        {stars ? (
          <img className="ms-stars" src={stars} alt={text} height={19} data-testid="morningstar-stars-img" />
        ) : null}
        {/* the text rating is always in the page: it is the only rendering when the official images are missing */}
        <p className={`ms-text ${stars ? "sr-only" : ""}`} data-testid="morningstar-text" data-stars={m.stars}>{text}</p>
      </div>
      <p className="ms-detail" data-testid="morningstar-class">{detail}</p>
      <div className="fine ms-source">
        {m.url ? (
          <a className="link" href={m.url} target="_blank" rel="noopener noreferrer" data-testid="morningstar-source">
            {tr(RK.ms.source, lang)}<ExternalLink aria-hidden="true" /><span className="sr-only"> ({tr(RK.newTab, lang)})</span>
          </a>
        ) : tr(RK.ms.source, lang)}
        {/* methodology and © attribution in full, behind a compact info note (compliance to confirm, docs/compliance-review.md W10) */}
        <InfoNote label={tr(RK.ms.info, lang)} testId={`${testId}-info`}>
          <span className="ms-legal" data-testid="morningstar-attribution">
            {tr(RK.ms.methodology, lang).replace("{date}", date)} {tr(RK.ms.attribution, lang).replace("{year}", year)}
          </span>
        </InfoNote>
      </div>
    </section>
  );
}
