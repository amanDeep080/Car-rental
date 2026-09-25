"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BookingRow from "@/components/dashboard/BookingRow";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getMyBookings } from "@/services/bookingService";
import type { Booking } from "@/types/booking";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "upcoming", label: "Upcoming", statuses: ["PENDING", "AWAITING_VERIFICATION", "AWAITING_PAYMENT", "CONFIRMED", "READY_FOR_PICKUP"] as string[] },
  { key: "active", label: "Active", statuses: ["ACTIVE", "RETURNED", "INSPECTION_PENDING"] as string[] },
  { key: "completed", label: "Completed", statuses: ["COMPLETED"] as string[] },
  { key: "cancelled", label: "Cancelled", statuses: ["CANCELLED", "REFUND_PENDING", "REFUNDED"] as string[] },
] as const;

export default function MyBookingsPage() {
  const ready = useAuthGuard();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("upcoming");

  useEffect(() => {
    if (!ready) return;
    getMyBookings()
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [ready]);

  const activeTab = TABS.find((t) => t.key === tab)!;
  const filtered = useMemo(
    () => bookings.filter((b) => activeTab.statuses.includes(b.status)),
    [bookings, activeTab]
  );

  if (!ready) return null;

  return (
    <DashboardLayout>
      <h1 className="font-display text-display-md font-700 text-ivory">My Bookings</h1>

      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-graphite-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-shrink-0 border-b-2 px-4 py-3 text-sm transition-colors",
              tab === t.key ? "border-brass text-ivory" : "border-transparent text-steel hover:text-ivory"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-steel">Loading…</p>}

        {!loading && filtered.length === 0 && (
          <div className="rounded-panel border border-dashed border-graphite-line py-16 text-center">
            <p className="text-sm text-ivory">No {activeTab.label.toLowerCase()} bookings.</p>
            <Link
              href="/cars"
              className="mt-4 inline-block rounded-full bg-brass-sheen px-5 py-2.5 text-xs font-medium text-obsidian"
            >
              Explore Cars
            </Link>
          </div>
        )}

        {filtered.map((b) => (
          <BookingRow key={b.id} booking={b} />
        ))}
      </div>
    </DashboardLayout>
  );
}
