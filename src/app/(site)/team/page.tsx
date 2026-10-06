import type { Metadata } from "next";
import { Team } from "@/components/site/pages/Team";
import { AB } from "@/components/site/pages/copy-about";
import { getLocale } from "@/lib/i18n/server";
import { getSiteTexts, getTeam } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: AB.meta.title[locale], description: AB.meta.description[locale], alternates: { canonical: "/team" } };
}

export default async function Page() {
  const [members, texts] = await Promise.all([getTeam(), getSiteTexts()]);
  return <Team members={members} intro={texts.pageIntros?.team} />;
}
