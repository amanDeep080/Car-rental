"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getMyBookings } from "@/services/bookingService";
import type { Booking } from "@/types/booking";
import { Receipt } from "lucide-react";

export default function PaymentsPage() {
  const ready = useAuthGuard();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    getMyBookings().then(setBookings).catch(() => setBookings([])).finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return null;

  return (
    <DashboardLayout>
      <h1 className="font-display text-display-md font-700 text-ivory">Payments</h1>
      <p className="mt-2 text-sm text-steel">
        A record for every booking. Live gateway receipts will appear here once payment collection is wired up.
      </p>

      {loading && <p className="mt-6 text-sm text-steel">Loading…</p>}

      {!loading && bookings.length === 0 && (
        <div className="mt-8 rounded-panel border border-dashed border-graphite-line py-16 text-center">
          <Receipt size={24} className="mx-auto text-steel" />
          <p className="mt-3 text-sm text-ivory">No payments yet.</p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-card border border-graphite-line bg-graphite p-4">
            <div>
              <p className="text-sm text-ivory">
                {b.carBrand} {b.carModel} <span className="font-mono text-xs text-steel">· {b.bookingReference}</span>
              </p>
              <p className="mt-1 text-xs text-steel">{new Date(b.pickupAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-ivory">₹{b.totalPayable.toLocaleString("en-IN")}</p>
              <p className="text-xs text-steel">incl. ₹{b.securityDepositAmount.toLocaleString("en-IN")} deposit</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
