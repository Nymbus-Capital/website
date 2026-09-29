import { FUNDS } from "@/config/funds";
import { documentUrl, listDocuments } from "@/lib/data/documents";
import { Head } from "@/components/admin/Head";
import { DocumentsManager } from "@/components/admin/DocumentsManager";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const docs = (await listDocuments()).sort((a, b) => b.date.localeCompare(a.date) || b.uploadedAt.localeCompare(a.uploadedAt));
  return (
    <>
      <Head crumb="admin / documents" title="documents" lead="Fund facts, factsheets, prospectuses, reports: PDF only, 25 MB max. Only published documents can be downloaded from the public site." />
      <DocumentsManager
        initial={docs.map((d) => ({ ...d, url: documentUrl(d) }))}
        funds={FUNDS.map((f) => ({ key: f.key, label: f.short.en }))}
      />
    </>
  );
}
