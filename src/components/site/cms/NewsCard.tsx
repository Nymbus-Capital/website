/**
 * One news card of /news (server component): optional image (only ever a validated https URL on the CMS media
 * origin, see src/lib/cms/sanitize.ts), category, date, title, summary and a link to the article page or, when the
 * item has no text of its own, to its external link.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NewsEntry } from "@/lib/cms/map";
import { NEWS_CATEGORY } from "@/components/site/home/news";
import { dateLong, pickL, type Loc } from "./format";
import "./cms.css";

export function NewsCard({ n, locale }: { n: NewsEntry; locale: Loc }) {
  const fr = locale === "fr";
  const hasPage = !!(n.body.en || n.body.fr);
  const href = hasPage ? `/news/${n.id}` : n.link;
  const external = !hasPage && !!n.link;
  const title = pickL(n.title, locale);
  const more = fr ? "Lire la suite" : "Read more";
  return (
    <article className="card cms-news-card" data-testid={`news-card-${n.id}`}>
      {n.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cms-news-img" src={n.image} alt="" loading="lazy" decoding="async" />
      ) : null}
      <div className="cms-news-body">
        <p className="cms-news-meta">
          <span className="cms-news-chip">{pickL(NEWS_CATEGORY[n.category], locale)}</span>
          <time dateTime={n.date}>{dateLong(n.date, locale)}</time>
        </p>
        <h2 className="h4">{title}</h2>
        {n.summary.en || n.summary.fr ? <p>{pickL(n.summary, locale)}</p> : null}
        {href && external ? (
          <a className="link cms-news-more" href={href} target="_blank" rel="noopener noreferrer">
            {more} <ArrowRight aria-hidden="true" />
            <span className="sr-only">: {title}</span>
          </a>
        ) : href ? (
          <Link className="link cms-news-more" href={href}>
            {more} <ArrowRight aria-hidden="true" />
            <span className="sr-only">: {title}</span>
          </Link>
        ) : null}
      </div>
    </article>
  );
}
