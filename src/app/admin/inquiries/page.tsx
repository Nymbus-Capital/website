import { requireAdminPage } from "@/lib/auth/server";
import { configuredRetentionDays, listInquiries, purgeExpiredInquiries } from "@/lib/contact/store";
import { audit } from "@/lib/data/store";
import { Head } from "@/components/admin/Head";
import { InquiriesManager } from "@/components/admin/InquiriesManager";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const user = await requireAdminPage("/admin/inquiries"); // defence in depth: every page re-verifies the session (not only the layout)
  const days = await configuredRetentionDays();
  await purgeExpiredInquiries(new Date(), days);
  const inquiries = await listInquiries();
  // reading personal information is recorded (count only, never the content)
  await audit({ by: user.email, action: "inquiries.view", detail: { count: inquiries.length } });
  return (
    <>
      <Head
        crumb="admin / messages"
        title="messages"
        lead={`Messages sent with the /contact form, newest first. Answer from your own mailbox, then mark them handled; export them as CSV if needed (the file then holds personal information: keep it out of shared folders and delete it after use). Use them only to answer the request (no marketing); each one is deleted automatically ${days} days after it was received (site settings).`}
      />
      <InquiriesManager initial={inquiries} />
    </>
  );
}
