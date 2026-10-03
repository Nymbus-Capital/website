import { getContent } from "@/lib/data/content";
import { requireAdminPage } from "@/lib/auth/server";
import { Head } from "@/components/admin/Head";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { when } from "@/components/admin/format";
import { BrandAssetsManager } from "@/components/admin/BrandAssetsManager";
import { policyMonths } from "@/lib/rankings/policy";
import { brandRows } from "../_lib/rankings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdminPage("/admin/settings"); // defence in depth: every page re-verifies the session (not only the layout)
  const [c, rows] = await Promise.all([getContent(), brandRows()]);
  return (
    <>
      <Head crumb="admin / settings" title="site settings" lead={<>Firm-wide texts and how pipeline runs reach the site. Content v{c.version}{c.version ? `, last saved ${when(c.updatedAt)} by ${c.updatedBy}` : ""}.</>} />
      <SettingsForm key={c.version} version={c.version} firm={c.firm} publishMode={c.pipeline.publishMode} maxAgeMonths={policyMonths(c)} />
      <BrandAssetsManager rows={rows} />
    </>
  );
}
