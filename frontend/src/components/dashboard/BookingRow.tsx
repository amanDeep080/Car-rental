import Link from "next/link";
import Image from "next/image";
import type { Booking } from "@/types/booking";
import StatusBadge from "./StatusBadge";
import { ChevronRight } from "lucide-react";

export default function BookingRow({ booking }: { booking: Booking }) {
  return (
    <Link
      href={`/dashboard/bookings/${booking.bookingReference}`}
      className="flex items-center gap-4 rounded-card border border-graphite-line bg-graphite p-4 transition-colors hover:border-brass/40"
    >
      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-graphite-raised">
        <Image src={booking.carImageUrl} alt={booking.carModel} fill sizes="96px" className="object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm text-ivory">
            {booking.carBrand} {booking.carModel}
          </p>
          <StatusBadge status={booking.status} />
        </div>
        <p className="mt-1 truncate text-xs text-steel">
          {new Date(booking.pickupAt).toLocaleDateString()} → {new Date(booking.returnAt).toLocaleDateString()} ·{" "}
          {booking.pickupLocationName}
        </p>
        <p className="mt-0.5 font-mono text-xs text-steel">{booking.bookingReference}</p>
      </div>

      <div className="hidden text-right sm:block">
        <p className="text-sm text-ivory">₹{booking.totalPayable.toLocaleString("en-IN")}</p>
      </div>

      <ChevronRight size={16} className="flex-shrink-0 text-steel" />
    </Link>
  );
}
