import type { Metadata } from "next";
import { Team } from "@/components/site/pages/Team";
import { AB } from "@/components/site/pages/copy-about";
import { getLocale } from "@/lib/i18n/server";
import { getTeam } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: AB.meta.title[locale], description: AB.meta.description[locale], alternates: { canonical: "/team" } };
}

export default async function Page() {
  return <Team members={await getTeam()} />;
}
