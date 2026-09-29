"use client";
/** The home page: a keynote you scroll through, one rounded screen per idea. */
import { ScreenSwap } from "@/components/v3/motion";
import { useTranslation } from "@/lib/i18n";
import { HOME } from "../copy";
import { Hero } from "../hero/Hero";
import { Chapter } from "../ui";
import type { HomeData } from "./data";
import { Glance } from "./Glance";
import { Pillars } from "./Pillars";
import { Process } from "./Process";
import { Challenge } from "./Challenge";
import { Overlay } from "./Overlay";
import { Strategies } from "./Strategies";
import { Investors } from "./Investors";
import { ContactCta, Summary } from "./Summary";

export function Home({ data }: { data: HomeData }) {
  const { pick } = useTranslation();
  const C = HOME.chapters;
  return (
    <div className="stage home">
      <ScreenSwap />
      <Hero funds={data.funds} navAsOf={data.navAsOf} sample={data.sample} />
      <Glance aumLabel={data.aumLabel} />
      <Chapter no={1} title={pick(C.bonds)} id="ch1-t" variant={0} />
      <Pillars />
      <Process />
      <Chapter no={2} title={pick(C.overlay)} id="ch2-t" variant={1} />
      <Challenge />
      <Overlay />
      <Chapter no={3} title={pick(C.strategies)} id="ch3-t" variant={2} />
      <Strategies funds={data.funds} sample={data.sample} />
      <Investors />
      <Summary />
      <ContactCta />
    </div>
  );
}
