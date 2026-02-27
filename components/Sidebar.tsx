// components/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Badge from "./Badge";

function NavItem({
  href,
  label,
  comingSoon,
}: {
  href: string;
  label: string;
  comingSoon?: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
        active
          ? "bg-gray-900 text-white"
          : "text-gray-700 hover:bg-gray-100",
      ].join(" ")}
    >
      <span className="font-medium">{label}</span>
      {comingSoon ? (
        <Badge className={active ? "bg-white/15 text-white" : "bg-gray-200 text-gray-700"}>
          Soon
        </Badge>
      ) : null}
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-gray-200 bg-white p-4 md:block">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold tracking-tight text-gray-900">
          FINNEX
        </div>
        <Badge className="bg-emerald-100 text-emerald-700">MVP</Badge>
      </div>

      <div className="mt-1 text-xs text-gray-500">
        Investor / Partner dashboard
      </div>

      <nav className="mt-6 space-y-2">
        <NavItem href="/" label="Overview" />
        <NavItem href="/projects" label="Projects" />
        <NavItem href="/basket" label="Basket" />
        <NavItem href="/settings" label="Settings" />
        <NavItem href="/coming-soon" label="Farmer onboarding" comingSoon />
      </nav>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="text-xs font-semibold text-gray-900">
          Core proposition
        </div>
        <div className="mt-2 text-xs leading-relaxed text-gray-600">
          Make smallholder agriculture investable using milestone-based capital
          control, structured intelligence, and real-time monitoring.
        </div>
      </div>

      <div className="mt-6 text-[11px] text-gray-500">
        © {new Date().getFullYear()} FINNEX Capital
      </div>
    </aside>
  );
}