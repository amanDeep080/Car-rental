"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarRange, Heart, FileText, Wallet, User, Bell, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getCurrentUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import Header from "@/components/layout/Header";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "My Bookings", icon: CalendarRange },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/payments", label: "Payments", icon: Wallet },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
    <>
      <Header />
      <div className="min-h-screen bg-obsidian pt-32">
        <div className="container-edge grid grid-cols-1 gap-10 pb-24 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-28 lg:h-fit">
            {mounted && user && (
              <div className="mb-6 rounded-card border border-graphite-line bg-graphite p-4">
                <p className="text-sm text-ivory">{user.fullName}</p>
                <p className="mt-0.5 truncate text-xs text-steel">{user.email}</p>
              </div>
            )}

            <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex flex-shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm transition-colors",
                      active ? "bg-brass/10 text-brass" : "text-steel hover:bg-graphite hover:text-ivory"
                    )}
                  >
                    <Icon size={16} strokeWidth={1.6} />
                    <span className="whitespace-nowrap">{label}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex flex-shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm text-steel transition-colors hover:bg-graphite hover:text-signal-booked"
              >
                <LogOut size={16} strokeWidth={1.6} />
                Sign Out
              </button>
            </nav>
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </>
  );
}
