/**
 * /news/<id> — one article: title, date, optional image, body as plain paragraphs, optional external link.
 * Unknown id → 404. Plain text only (every string was reduced to text by src/lib/cms/sanitize.ts).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Crumbs, Section } from "@/components/site/kit";
import { NEWS_CATEGORY } from "@/components/site/home/news";
import { dateLong, pickL } from "@/components/site/cms/format";
import { getNews } from "@/lib/cms";
import { getLocale } from "@/lib/i18n/server";
import "@/components/site/cms/cms.css";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function find(id: string) {
  return (await getNews()).find((n) => n.id === id) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [n, locale] = await Promise.all([find(id), getLocale()]);
  if (!n) return { title: "News" };
  return { title: pickL(n.title, locale), description: pickL(n.summary, locale) || undefined, alternates: { canonical: `/news/${n.id}` } };
}

export default async function NewsArticle({ params }: Props) {
  const { id } = await params;
  const [n, locale] = await Promise.all([find(id), getLocale()]);
  if (!n) notFound();
  const fr = locale === "fr";
  const summary = pickL(n.summary, locale);
  const paragraphs = pickL(n.body, locale).split("\n\n").filter(Boolean);
  return (
    <div className="pg">
      <Section>
        <Crumbs items={[{ href: "/", label: fr ? "Accueil" : "Home" }, { href: "/news", label: fr ? "Actualités" : "News" }, { label: pickL(n.title, locale) }]} />
        <article className="cms-article" data-testid="news-article">
          <p className="cms-news-meta">
            <span className="cms-news-chip">{pickL(NEWS_CATEGORY[n.category], locale)}</span>
            <time dateTime={n.date}>{dateLong(n.date, locale)}</time>
          </p>
          <h1 className="h2" style={{ marginTop: 12 }}>{pickL(n.title, locale)}</h1>
          {n.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="cms-news-img" src={n.image} alt="" decoding="async" />
          ) : null}
          <div className="prose">
            {summary ? <p className="lead" style={{ marginTop: 0 }}>{summary}</p> : null}
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {n.link ? (
            <p style={{ marginTop: 24 }}>
              <a className="link" href={n.link} target="_blank" rel="noopener noreferrer">{fr ? "En savoir plus" : "Learn more"} <ArrowUpRight aria-hidden="true" /></a>
            </p>
          ) : null}
          <p style={{ marginTop: 32 }}><Link className="link" href="/news">{fr ? "Toutes les actualités" : "All news"}</Link></p>
        </article>
      </Section>
    </div>
  );
}
