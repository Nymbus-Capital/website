/**
 * /news — all news, newest first (WordPress when configured, else the static items). Server-rendered; plain text only.
 */
import type { Metadata } from "next";
import { PageHero, Section } from "@/components/site/kit";
import { NewsCard } from "@/components/site/cms/NewsCard";
import { getNews } from "@/lib/cms";
import { getLocale } from "@/lib/i18n/server";
import "@/components/site/cms/cms.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const fr = (await getLocale()) === "fr";
  return {
    title: fr ? "Actualités" : "News",
    description: fr ? "Les dernières nouvelles de Nymbus Capital." : "The latest news from Nymbus Capital.",
    alternates: { canonical: "/news" },
  };
}

export default async function NewsPage() {
  const [locale, news] = await Promise.all([getLocale(), getNews()]);
  const fr = locale === "fr";
  return (
    <div className="pg">
      <PageHero
        eyebrow={fr ? "Actualités" : "News"}
        title={fr ? "Actualités" : "News"}
        art="none"
        crumbs={[{ href: "/", label: fr ? "Accueil" : "Home" }, { label: fr ? "Actualités" : "News" }]}
      />
      <Section tight>
        {news.length ? (
          <div className="cms-news-grid" data-testid="news-list">
            {news.map((n) => (
              <NewsCard key={n.id} n={n} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="cms-news-empty">{fr ? "Aucune actualité pour le moment." : "No news yet."}</p>
        )}
      </Section>
    </div>
  );
}
