import { requireAdminPage } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { FUNDS } from "@/config/funds";

export default async function FundsIndex() {
  await requireAdminPage("/admin/funds");
  redirect(`/admin/funds/${FUNDS[0].key}`);
}
