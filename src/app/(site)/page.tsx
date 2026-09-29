/**
 * Home. Reads the published data + admin content at request time (the pipeline refreshes it daily), then
 * hands plain JSON to the client keynote.
 */
import type { Metadata } from "next";
import { Home } from "@/components/site/home/Home";
import { toHomeData } from "@/components/site/home/data";
import { getAllFundViews, getContent } from "@/lib/data/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Nymbus Capital · scientific investing" },
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [views, content] = await Promise.all([getAllFundViews(), getContent()]);
  return <Home data={toHomeData(views, content)} />;
}
