import Image from "next/image";
import type { CarDetail } from "@/types/car";

export default function StepVehicle({ car }: { car: CarDetail }) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-600 text-ivory">Confirm your vehicle</h2>
      <div className="flex gap-5 rounded-card border border-graphite-line bg-graphite-raised/40 p-5">
        <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg">
          <img src={car.imageUrls[0] ?? "https://placehold.co/600x400?text=No+Vehicle+Image"} alt={car.model} className="h-full w-full object-cover" />
        </div>
        <div>
          <h3 className="font-display text-base font-600 text-ivory">
            {car.brand} {car.model} <span className="text-steel">{car.variant}</span>
          </h3>
          <p className="mt-1 text-xs text-steel">
            {car.category} · {car.transmission === "AUTOMATIC" ? "Automatic" : "Manual"} · {car.seats} seats
          </p>
          <p className="mt-3 font-display text-lg font-700 text-ivory">
            ₹{car.pricePerDay.toLocaleString("en-IN")} <span className="text-xs font-normal text-steel">/day</span>
          </p>
        </div>
      </div>
      <p className="text-xs text-steel">
        Pickup and return location can still be adjusted in the previous step if needed.
      </p>
    </div>
  );
}
