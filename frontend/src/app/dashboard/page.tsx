"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BookingRow from "@/components/dashboard/BookingRow";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getMyBookings } from "@/services/bookingService";
import type { Booking } from "@/types/booking";
import { CalendarRange, Heart, FileText } from "lucide-react";

const ACTIVE_ISH = new Set(["CONFIRMED", "READY_FOR_PICKUP", "ACTIVE"]);

export default function DashboardOverviewPage() {
  const ready = useAuthGuard();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    getMyBookings()
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return null;

  const upcoming = bookings.find((b) => ACTIVE_ISH.has(b.status));
  const recent = bookings.slice(0, 4);

  return (
    <DashboardLayout>
      <h1 className="font-display text-display-md font-700 text-ivory">Overview</h1>

      {upcoming && (
        <section className="mt-8">
          <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-brass">
            Upcoming / Active Rental
          </h2>
          <BookingRow booking={upcoming} />
        </section>
      )}

      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QuickLink href="/dashboard/bookings" icon={CalendarRange} label="My Bookings" count={bookings.length} />
        <QuickLink href="/dashboard/wishlist" icon={Heart} label="Wishlist" />
        <QuickLink href="/dashboard/documents" icon={FileText} label="Documents" />
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-steel">Recent Bookings</h2>
          <Link href="/dashboard/bookings" className="text-xs text-brass hover:underline">
            View all
          </Link>
        </div>

        {loading && <p className="text-sm text-steel">Loading…</p>}

        {!loading && recent.length === 0 && (
          <div className="rounded-panel border border-dashed border-graphite-line py-16 text-center">
            <p className="text-sm text-ivory">You haven&apos;t booked a car yet.</p>
            <Link
              href="/cars"
              className="mt-4 inline-block rounded-full bg-brass-sheen px-5 py-2.5 text-xs font-medium text-obsidian"
            >
              Explore Cars
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {recent.map((b) => (
            <BookingRow key={b.id} booking={b} />
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  count,
}: {
  href: string;
  icon: typeof CalendarRange;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-card border border-graphite-line bg-graphite p-5 transition-colors hover:border-brass/40"
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-brass" strokeWidth={1.6} />
        <span className="text-sm text-ivory">{label}</span>
      </div>
      {count !== undefined && <span className="font-mono text-xs text-steel">{count}</span>}
    </Link>
  );
}
