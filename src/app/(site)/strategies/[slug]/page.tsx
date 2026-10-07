/**
 * Fund detail page: /strategies/<fund key>. Reads the published pipeline data + admin content at request
 * time (the pipeline refreshes the data daily; no rebuild), then hands plain JSON to the client page.
 * Legacy slugs are redirected by next.config.ts; registry aliases (e.g. /strategies/sest) redirect here.
 */
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { FundPage } from "@/components/fund/FundPage";
import { toPublicData, toPublicSpec, type FundDoc, type FundLink } from "@/components/fund/types";
import { stripHidden } from "@/components/fund/lib/visibility";
import { documentUrl, listPublishedDocuments, toPublicDocument } from "@/lib/data/documents";
import { getAllFundViews, getContent, getFundView } from "@/lib/data/site";
import type { DocumentMeta } from "@/lib/data/types";
import { resolveBrandAssets } from "@/lib/data/brand-assets";
import { gateAwards, policyMonths, publicFundRankings } from "@/lib/rankings/policy";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

async function documentsFor(scope: DocumentMeta["scope"]): Promise<FundDoc[]> {
  try {
    const [own, firm] = await Promise.all([listPublishedDocuments(scope), listPublishedDocuments("firm")]);
    // public DTO only: uploader, hash and publication flag never reach the client bundle
    return [...own, ...firm].map((d) => ({ meta: toPublicDocument(d), url: documentUrl(d) }));
  } catch {
    // documents are optional on this page: a broken index must not take the fund page down
    return [];
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const view = await getFundView(slug);
  if (!view) return { title: "Nymbus Capital" };
  const { spec, content } = view;
  const description = (content.description ?? spec.defaults.description).en;
  return {
    title: spec.name.en,
    description,
    alternates: { canonical: `/strategies/${spec.key}` },
    openGraph: { title: spec.name.en, description, type: "website" },
    robots: view.sample ? { index: false, follow: true } : undefined,
  };
}

export default async function StrategyPage({ params }: Params) {
  const { slug } = await params;
  const view = await getFundView(slug);
  if (!view) notFound();
  if (view.spec.key !== slug) permanentRedirect(`/strategies/${view.spec.key}`);

  const [docs, all, siteContent, brand] = await Promise.all([
    documentsFor(view.spec.key),
    getAllFundViews(),
    getContent(),
    resolveBrandAssets(),
  ]);
  const funds: FundLink[] = all.map(({ spec, content }) => ({
    key: spec.key,
    name: spec.name,
    short: spec.short,
    assetClass: spec.assetClass,
    tagline: content.tagline ?? spec.defaults.tagline,
    color: spec.color,
  }));

  // the snapshot pin is internal (admin) state: strip it before the props cross to the client
  const { pinnedSnapshot: _pin, rankings: allRankings, ...rest } = view.content;
  void _pin;
  // only confirmed, fresh rankings reach the page (drafts, notes, stale figures stay on the server); "hide" sends none
  const rankings = rest.hide?.rankings
    ? undefined
    : publicFundRankings(allRankings, {
        now: new Date(),
        months: policyMonths(siteContent),
        classes: view.spec.classes,
      });
  // awards only for a Fundata FundGrade of A or B: otherwise no rankings in the payload (CIFSC category line kept)
  const content = gateAwards(rankings ? { ...rest, rankings } : rest, view.spec.classes);
  // internal source names and every block the admin hid (AUM unless published) stay out of the RSC payload
  const data = stripHidden(toPublicData(view.data), content);
  return (
    <FundPage
      spec={toPublicSpec(view.spec)}
      content={content}
      data={data}
      sample={view.sample}
      docs={docs}
      funds={funds}
      firmDisclaimer={siteContent.firm.disclaimer ?? null}
      brand={brand}
    />
  );
}
