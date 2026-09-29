"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, FileText, History, LayoutDashboard, Settings, Wallet } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/runs", label: "pipeline runs", icon: Activity },
  { href: "/admin/funds", label: "funds", icon: Wallet },
  { href: "/admin/documents", label: "documents", icon: FileText },
  { href: "/admin/settings", label: "site settings", icon: Settings },
  { href: "/admin/audit", label: "audit log", icon: History },
];

export function Rail({ email, name }: { email: string; name: string }) {
  const path = usePathname() ?? "/admin";
  return (
    <aside className="adm-rail" aria-label="admin navigation">
      <div className="adm-brand">
        <span className="adm-mark" />
        <b>nymbus <span>admin</span></b>
      </div>
      <nav className="adm-nav">
        {ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? path === href : path === href || path.startsWith(href + "/");
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} prefetch={false}>
              <Icon aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="adm-user">
        <div>
          <strong>{name}</strong>
          <div>{email}</div>
        </div>
        <form method="post" action="/api/auth/logout">
          <button type="submit" className="adm-btn ghost xs">sign out</button>
        </form>
        <a className="adm-link adm-small" href="/" target="_blank" rel="noopener">open the public site ↗</a>
      </div>
    </aside>
  );
}
