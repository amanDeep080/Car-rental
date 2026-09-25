"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getBookingByReference } from "@/services/bookingService";
import type { Booking } from "@/types/booking";
import { CheckCircle2 } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (ref) getBookingByReference(ref).then(setBooking).catch(() => {});
  }, [ref]);

  return (
    <>
      <Header />
      <main className="flex min-h-screen items-center justify-center bg-obsidian px-6 pt-20">
        <div className="w-full max-w-md rounded-panel border border-graphite-line bg-graphite p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-signal-available/10">
            <CheckCircle2 size={28} className="text-signal-available" />
          </div>
          <h1 className="mt-5 font-display text-xl font-700 text-ivory">Booking confirmed</h1>
          <p className="mt-2 text-sm text-steel">
            Reference <span className="font-mono text-ivory">{ref}</span>
          </p>

          {booking && (
            <div className="mt-6 rounded-card border border-graphite-line bg-graphite-raised/40 p-4 text-left text-sm">
              <p className="text-ivory">
                {booking.carBrand} {booking.carModel} {booking.carVariant}
              </p>
              <p className="mt-1 text-xs text-steel">
                Pickup: {booking.pickupLocationName} · {new Date(booking.pickupAt).toLocaleString()}
              </p>
              <p className="text-xs text-steel">
                Return: {booking.returnLocationName} · {new Date(booking.returnAt).toLocaleString()}
              </p>
              <p className="mt-3 border-t border-graphite-line pt-3 text-ivory">
                Total: ₹{booking.totalPayable.toLocaleString("en-IN")}
              </p>
            </div>
          )}

          <Link
            href="/dashboard/bookings"
            className="mt-8 block rounded-full bg-brass-sheen py-3 text-sm font-medium text-obsidian transition-transform hover:scale-[1.01]"
          >
            View My Bookings
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
