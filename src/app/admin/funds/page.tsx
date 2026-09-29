import { redirect } from "next/navigation";
import { FUNDS } from "@/config/funds";

export default function FundsIndex() {
  redirect(`/admin/funds/${FUNDS[0].key}`);
}
