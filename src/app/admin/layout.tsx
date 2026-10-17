import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { headers } from "next/headers";
import { requireAdminPage } from "@/lib/auth/server";
import { Rail } from "@/components/admin/Rail";
import { AdminShellClient } from "@/components/admin/client";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin | Nymbus Capital",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Admin shell. The proxy has already gated the request; the session is verified again here (defence in depth)
 * so no admin page can render without a valid, policy-compliant session.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdminPage();
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <div className="adm" data-admin>
      <Script
        nonce={nonce}
        id="admin-session-recovery"
        strategy="afterInteractive"
        src="/session.js"
        data-probe="/api/auth/session"
        data-login="/api/auth/login?returnTo="
        data-api-prefix="/api/admin/"
        data-active-prefix="/admin"
      />
      <Rail email={user.email} name={user.name} />
      <AdminShellClient>
        <div className="adm-main" id="admin-main">
          {children}
        </div>
      </AdminShellClient>
    </div>
  );
}
