"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ReviewForm from "@/components/dashboard/ReviewForm";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getBookingByReference, cancelBooking } from "@/services/bookingService";
import type { Booking } from "@/types/booking";
import { MapPin, Calendar } from "lucide-react";

const CANCELLABLE = new Set(["PENDING", "AWAITING_VERIFICATION", "AWAITING_PAYMENT", "CONFIRMED", "READY_FOR_PICKUP"]);

export default function BookingDetailPage() {
  const ready = useAuthGuard();
  const params = useParams<{ reference: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!ready) return;
    getBookingByReference(params.reference)
      .then(setBooking)
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [ready, params.reference]);

  async function handleCancel() {
    if (!booking || !confirm("Cancel this booking? This can't be undone.")) return;
    setCancelling(true);
    try {
      await cancelBooking(booking.bookingReference);
      router.refresh();
      const updated = await getBookingByReference(booking.bookingReference);
      setBooking(updated);
    } finally {
      setCancelling(false);
    }
  }

  if (!ready) return null;

  return (
    <DashboardLayout>
      {loading && <p className="text-sm text-steel">Loading…</p>}

      {!loading && !booking && <p className="text-sm text-steel">Booking not found.</p>}

      {booking && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow mb-2">{booking.bookingReference}</p>
              <h1 className="font-display text-display-md font-700 text-ivory">
                {booking.carBrand} {booking.carModel}
              </h1>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <div className="relative aspect-video overflow-hidden rounded-panel bg-graphite">
                <Image src={booking.carImageUrl} alt={booking.carModel} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoCard icon={MapPin} label="Pickup" value={booking.pickupLocationName} sub={new Date(booking.pickupAt).toLocaleString()} />
                <InfoCard icon={MapPin} label="Return" value={booking.returnLocationName} sub={new Date(booking.returnAt).toLocaleString()} />
              </div>

              {booking.addons.length > 0 && (
                <div>
                  <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-steel">Add-ons</h2>
                  <div className="space-y-2">
                    {booking.addons.map((a) => (
                      <div key={a.name} className="flex justify-between rounded-lg bg-graphite-raised/40 px-4 py-2.5 text-sm">
                        <span className="text-ivory">{a.name}</span>
                        <span className="text-steel">₹{a.price.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {booking.status === "COMPLETED" && (
                <ReviewForm bookingReference={booking.bookingReference} />
              )}
            </div>

            <aside className="h-fit rounded-panel border border-graphite-line bg-graphite p-6">
              <h2 className="font-display text-base font-600 text-ivory">Payment Summary</h2>
              <div className="mt-4 space-y-2 font-mono text-sm">
                <Row label="Rental" value={booking.rentalAmount} />
                {booking.addonsAmount > 0 && <Row label="Add-ons" value={booking.addonsAmount} />}
                {booking.discountAmount > 0 && <Row label="Discount" value={-booking.discountAmount} />}
                <div className="flex justify-between border-t border-graphite-line pt-2 text-ivory">
                  <span>Total</span>
                  <span className="text-brass">₹{booking.totalPayable.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {CANCELLABLE.has(booking.status) && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="mt-5 w-full rounded-full border border-signal-booked/40 py-2.5 text-sm text-signal-booked transition-colors hover:bg-signal-booked/10 disabled:opacity-60"
                >
                  {cancelling ? "Cancelling…" : "Cancel Booking"}
                </button>
              )}
            </aside>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function InfoCard({ icon: Icon, label, value, sub }: { icon: typeof MapPin; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-card border border-graphite-line bg-graphite p-4">
      <Icon size={15} className="text-brass" />
      <p className="mt-2 text-xs text-steel">{label}</p>
      <p className="text-sm text-ivory">{value}</p>
      <p className="mt-0.5 text-xs text-steel">{sub}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-steel">
      <span>{label}</span>
      <span className={value < 0 ? "text-signal-available" : "text-ivory"}>
        {value < 0 ? "−" : ""}₹{Math.abs(value).toLocaleString("en-IN")}
      </span>
    </div>
  );
}
