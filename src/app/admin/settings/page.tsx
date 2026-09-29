import { getContent } from "@/lib/data/content";
import { Head } from "@/components/admin/Head";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { when } from "@/components/admin/format";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const c = await getContent();
  return (
    <>
      <Head crumb="admin / settings" title="site settings" lead={<>Firm-wide texts and how pipeline runs reach the site. Content v{c.version}{c.version ? `, last saved ${when(c.updatedAt)} by ${c.updatedBy}` : ""}.</>} />
      <SettingsForm key={c.version} version={c.version} firm={c.firm} publishMode={c.pipeline.publishMode} />
    </>
  );
}
