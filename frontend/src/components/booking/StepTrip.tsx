"use client";

import { useState } from "react";
import type { LocationOption } from "@/types/booking";

export interface TripDetails {
  pickupLocationId: string;
  returnLocationId: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
}

export default function StepTrip({
  locations,
  trip,
  onChange,
}: {
  locations: LocationOption[];
  trip: TripDetails;
  onChange: (t: TripDetails) => void;
}) {
  // offset 24 actually means "Full Day" logic (same time as pickup)
  const [offset, setOffset] = useState<6 | 12 | 24>(() => {
    const pickup = new Date(`${trip.pickupDate}T${trip.pickupTime}`);
    const drop = new Date(`${trip.returnDate}T${trip.returnTime}`);
    const diffMs = drop.getTime() - pickup.getTime();
    const totalHours = diffMs / 3_600_000;
    const moduloHours = Math.round(totalHours) % 24;

    if (moduloHours === 6) return 6;
    if (moduloHours === 12) return 12;
    return 24;
  });

  function updateTrip(updates: Partial<TripDetails>, newOffset?: 6 | 12 | 24) {
    const activeOffset = newOffset || offset;
    const newTrip = { ...trip, ...updates };

    const pickup = new Date(`${newTrip.pickupDate}T${newTrip.pickupTime}`);
    // Use the user's selected return date as the base
    let baseReturnDate = new Date(`${newTrip.returnDate}T${newTrip.pickupTime}`);

    // If the user picked a return date before pickup, reset it to pickup date
    if (baseReturnDate < pickup) {
      baseReturnDate = new Date(pickup);
    }

    // Apply the offset (6h, 12h, or 24h) to the base return date at pickup time
    const returnAt = new Date(baseReturnDate.getTime() + (activeOffset % 24) * 3_600_000);

    // Special case: if offset is 24 and return date is same as pickup, it's effectively +1 day (24h)
    if (activeOffset === 24 && baseReturnDate.getTime() === pickup.getTime()) {
      returnAt.setTime(returnAt.getTime() + 24 * 3_600_000);
    }

    const fmt = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const fmtTime = (d: Date) => d.toTimeString().split(" ")[0]!.substring(0, 5);

    onChange({
      ...newTrip,
      returnDate: fmt(returnAt),
      returnTime: fmtTime(returnAt),
    });
    if (newOffset) setOffset(newOffset);
  }

  const pickupDateObj = new Date(`${trip.pickupDate}T${trip.pickupTime}`);
  const dropDateObj = new Date(`${trip.returnDate}T${trip.returnTime}`);
  const diffMs = dropDateObj.getTime() - pickupDateObj.getTime();
  const totalHours = Math.max(0, Math.round(diffMs / 3_600_000));
  const displayDays = Math.floor(totalHours / 24);
  const displayHours = totalHours % 24;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-600 text-ivory">When and where?</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Pickup Location">
          <select
            value={trip.pickupLocationId}
            onChange={(e) => onChange({ ...trip, pickupLocationId: e.target.value })}
            className="input"
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id} className="bg-graphite-raised">
                {l.branchName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Return Location">
          <select
            value={trip.returnLocationId}
            onChange={(e) => onChange({ ...trip, returnLocationId: e.target.value })}
            className="input"
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id} className="bg-graphite-raised">
                {l.branchName}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Pickup Date">
          <input
            type="date"
            value={trip.pickupDate}
            onChange={(e) => updateTrip({ pickupDate: e.target.value })}
            className="input [color-scheme:dark]"
          />
        </Field>
        <Field label="Pickup Time">
          <input
            type="time"
            value={trip.pickupTime}
            onChange={(e) => updateTrip({ pickupTime: e.target.value })}
            className="input [color-scheme:dark]"
          />
        </Field>

        <Field label="Return Date (Flexible)">
          <input
            type="date"
            value={trip.returnDate}
            min={trip.pickupDate}
            onChange={(e) => updateTrip({ returnDate: e.target.value })}
            className="input [color-scheme:dark]"
          />
        </Field>

        <Field label="Return Time">
          <input
            type="time"
            value={trip.returnTime}
            onChange={(e) => onChange({ ...trip, returnTime: e.target.value })}
            className="input [color-scheme:dark]"
          />
        </Field>

        <div>
          <h3 className="mb-3 text-xs font-medium text-steel uppercase tracking-wider">Duration Extension</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 6, label: "+6 Hours" },
              { id: 12, label: "+12 Hours" },
              { id: 24, label: "Full Day" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => updateTrip({}, t.id as any)}
                className={`flex flex-col items-center justify-center rounded-xl border py-3 transition-all ${
                  offset === t.id
                    ? "border-brass bg-brass/10 text-brass shadow-[0_0_15px_rgba(201,138,59,0.1)]"
                    : "border-graphite-line bg-graphite-raised/30 text-steel hover:border-steel/50"
                }`}
              >
                <span className="text-sm font-700">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2 rounded-card border border-brass/20 bg-brass/5 p-4">
           <p className="text-center text-xs text-brass mb-1">
             Your car is due back on <strong className="text-ivory">{new Date(trip.returnDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong> at <strong className="text-ivory">{trip.returnTime}</strong>
           </p>
           <p className="text-center text-[10px] uppercase tracking-wider text-steel font-medium">
             Total Duration: <span className="text-brass">{displayDays > 0 ? `${displayDays} Day${displayDays > 1 ? 's' : ''}` : ''}{displayDays > 0 && displayHours > 0 ? ' ' : ''}{displayHours > 0 ? `${displayHours} Hour${displayHours > 1 ? 's' : ''}` : displayDays === 0 ? '0 Hours' : ''}</span>
           </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-steel">{label}</span>
      {children}
    </label>
  );
}
