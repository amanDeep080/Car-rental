"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Car, CalendarRange, Users, FileCheck2, BarChart3, Tag, LogOut, Bell, MapPin, FileBarChart } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getCurrentUser } from "@/services/authService";
import { cn } from "@/lib/cn";
import AdminNotificationPanel from "./AdminNotificationPanel";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/cars", label: "Fleet", icon: Car },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarRange },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/locations", label: "Locations", icon: MapPin },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/documents", label: "Verifications", icon: FileCheck2 },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/reports", label: "Reports", icon: FileBarChart },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-obsidian">
      <div className="flex flex-col lg:flex-row">
        <aside className="flex-shrink-0 border-b border-graphite-line bg-graphite lg:min-h-screen lg:w-60 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2.5 px-6 py-6">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brass-sheen text-obsidian font-display font-800 text-xs">
              V
            </span>
            <div>
              <p className="font-display text-sm font-700 text-ivory">VELOCIRA</p>
              <p className="font-mono text-[10px] uppercase tracking-wide text-brass">Admin</p>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex flex-shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm transition-colors",
                    active ? "bg-brass/10 text-brass" : "text-steel hover:bg-graphite-raised hover:text-ivory"
                  )}
                >
                  <Icon size={16} strokeWidth={1.6} />
                  <span className="whitespace-nowrap">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden border-t border-graphite-line px-3 py-4 lg:block">
            {mounted && user && (
              <p className="truncate px-3.5 text-xs text-steel" title={user.email}>
                {user.email}
              </p>
            )}
            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm text-steel transition-colors hover:bg-graphite-raised hover:text-signal-booked"
            >
              <LogOut size={16} strokeWidth={1.6} />
              Sign Out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-6 lg:p-10">
          <div className="mb-8 flex justify-end">
            <AdminNotificationPanel />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
