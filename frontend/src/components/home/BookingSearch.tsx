"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MapPin, Calendar, Clock, Search } from "lucide-react";

const LOCATIONS = ["Phagwara", "Jalandhar", "Ludhiana", "Chandigarh", "Amritsar", "Delhi"];

export default function BookingSearch() {
  const router = useRouter();
  const [location, setLocation] = useState<string>(LOCATIONS[0] ?? "Phagwara");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("10:00");

  function handleSearch() {
    const params = new URLSearchParams({
      location,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
    });
    router.push(`/cars?${params.toString()}`);
  }

  return (
    <section id="booking-search" className="relative z-20 -mt-10">
      <div className="container-edge">
        <div className="rounded-panel border border-graphite-line bg-graphite/90 p-3 shadow-panel backdrop-blur-xl md:p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto]">
            <Field icon={<MapPin size={16} />} label="Pickup Location">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-sm text-ivory outline-none"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-graphite-raised">
                    {loc}
                  </option>
                ))}
              </select>
            </Field>

            <Field icon={<Calendar size={16} />} label="Pickup Date">
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-transparent text-sm text-ivory outline-none [color-scheme:dark]"
              />
            </Field>

            <Field icon={<Clock size={16} />} label="Pickup Time">
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full bg-transparent text-sm text-ivory outline-none [color-scheme:dark]"
              />
            </Field>

            <Field icon={<Calendar size={16} />} label="Return Date">
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-transparent text-sm text-ivory outline-none [color-scheme:dark]"
              />
            </Field>

            <Field icon={<Clock size={16} />} label="Return Time">
              <input
                type="time"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className="w-full bg-transparent text-sm text-ivory outline-none [color-scheme:dark]"
              />
            </Field>

            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 rounded-xl bg-brass-sheen px-6 py-4 text-sm font-medium text-obsidian transition-transform duration-300 hover:scale-[1.02] md:px-5"
            >
              <Search size={16} />
              <span className="md:hidden">Find Cars</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-graphite-line bg-graphite-raised/60 px-4 py-3 transition-colors focus-within:border-brass">
      <div className="flex items-center gap-2 text-steel">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-[0.16em]">{label}</span>
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
