"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Heart, User, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/cars", label: "Fleet" },
  { href: "/locations", label: "Locations" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/offers", label: "Offers" },
];

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-premium",
        scrolled ? "bg-obsidian/85 backdrop-blur-md border-b border-graphite-line" : "bg-transparent"
      )}
    >
      <div className="container-edge flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brass-sheen text-obsidian font-display font-800 text-sm">
            W
          </span>
          <span className="font-display text-lg font-700 tracking-tight text-ivory uppercase">
            Wheels<span className="text-brass">_</span>On<span className="text-brass">_</span>Rentals
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-steel transition-colors duration-300 hover:text-ivory"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <Link href="/dashboard/wishlist" aria-label="Wishlist" className="text-steel hover:text-ivory transition-colors">
            <Heart size={19} strokeWidth={1.6} />
          </Link>

          {mounted && user ? (
            <div className="flex items-center gap-4">
              <Link
                href={user.roles.includes("ADMIN") ? "/admin" : "/dashboard"}
                className="flex items-center gap-2 rounded-full border border-graphite-line px-4 py-2 text-sm text-ivory transition-colors hover:border-brass"
              >
                <User size={16} strokeWidth={1.6} />
                {user.fullName.split(' ')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="text-steel hover:text-signal-booked transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : mounted ? (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full border border-graphite-line px-4 py-2 text-sm text-ivory transition-colors hover:border-brass"
            >
              <User size={16} strokeWidth={1.6} />
              Sign in
            </Link>
          ) : (
            <div className="w-24 h-9" /> // Placeholder to prevent jump
          )}

          <Link
            href="/cars"
            className="rounded-full bg-brass-sheen px-5 py-2.5 text-sm font-medium text-obsidian transition-transform duration-300 hover:scale-[1.03]"
          >
            Explore Cars
          </Link>
        </div>

        <button
          className="md:hidden text-ivory"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-graphite-line bg-obsidian px-6 py-6">
          <nav className="flex flex-col gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-base text-ivory"
              >
                {link.label}
              </Link>
            ))}
            <div className="hairline mt-2 flex flex-col gap-3 pt-5">
              <Link href="/login" className="text-base text-ivory">
                Sign in
              </Link>
              <Link
                href="/cars"
                className="rounded-full bg-brass-sheen px-5 py-3 text-center text-sm font-medium text-obsidian"
              >
                Explore Cars
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
