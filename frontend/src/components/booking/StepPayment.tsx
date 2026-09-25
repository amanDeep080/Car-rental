import { ShieldAlert, Banknote, CreditCard, Check, Clock, Calendar } from "lucide-react";
import type { CarDetail } from "@/types/car";
import { formatDuration } from "@/types/booking";
import type { TripDetails } from "./StepTrip";

export interface EstimatedTotals {
  rentalAmount: number;
  addonsAmount: number;
  taxAmount: number;
  securityDeposit: number;
  total: number;
  rateBasis: string;
  kmLimit: number;
  durationDays: number;
  durationHours: number;
}

export default function StepPayment({
  totals,
  paymentMethod,
  onPaymentMethodChange,
  submitting,
  error,
  onConfirm,
  car,
  trip,
}: {
  totals: EstimatedTotals;
  paymentMethod: "ONLINE" | "COD";
  onPaymentMethodChange: (method: "ONLINE" | "COD") => void;
  submitting: boolean;
  error: string | null;
  onConfirm: () => void;
  car: CarDetail;
  trip: TripDetails;
}) {
  const effectiveTwentyFourHourRate =
    car.pricePerTwentyFourHours == null || car.pricePerTwentyFourHours === 0 ||
    (car.pricePerTwentyFourHours === 2000 && car.pricePerDay !== 2000)
      ? car.pricePerDay
      : (car.pricePerTwentyFourHours ?? car.pricePerDay);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-600 text-ivory">Review and confirm</h2>

      <div className="grid grid-cols-1 gap-3 rounded-card border border-graphite-line bg-graphite-raised/40 p-5 text-sm sm:grid-cols-2">
        <DateTime label="Pickup" value={trip.pickupDate} time={trip.pickupTime} />
        <DateTime label="Return" value={trip.returnDate} time={trip.returnTime} />
        <div className="sm:col-span-2 flex justify-between border-t border-graphite-line pt-3 text-steel">
          <span>Rental duration</span>
          <span className="font-medium text-ivory">{formatDuration(totals.durationDays, totals.durationHours)}</span>
        </div>
      </div>

      <div className="rounded-card border border-graphite-line bg-graphite-raised/40 p-5 font-mono text-sm">
        <div className="mb-4 flex items-center justify-between border-b border-graphite-line pb-3">
          <div className="flex items-center gap-2 text-brass">
            <Clock size={16} />
            <span className="text-xs uppercase tracking-wider">Duration</span>
          </div>
          <span className="text-ivory">
            {formatDuration(totals.durationDays, totals.durationHours)}
          </span>
        </div>

        <Row label={`Rental (${totals.rateBasis.replace("_", " ").toLowerCase()})`} value={totals.rentalAmount} />

        <div className="mt-3 flex items-center justify-between border-t border-graphite-line pt-3 text-base text-ivory">
          <span>Total payable</span>
          <span className="text-brass">₹{totals.total.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-graphite border border-graphite-line p-2 text-center">
          <p className="text-[9px] uppercase text-steel mb-0.5">6 Hours</p>
          <p className="text-xs text-ivory">₹{car.pricePerSixHours?.toLocaleString("en-IN") || '—'}</p>
        </div>
        <div className="rounded-lg bg-graphite border border-graphite-line p-2 text-center">
          <p className="text-[9px] uppercase text-steel mb-0.5">12 Hours</p>
          <p className="text-xs text-ivory">₹{car.pricePerTwelveHours?.toLocaleString("en-IN") || '—'}</p>
        </div>
        <div className="rounded-lg bg-graphite border border-graphite-line p-2 text-center">
          <p className="text-[9px] uppercase text-steel mb-0.5">24 Hours</p>
          <p className="text-xs text-ivory">₹{effectiveTwentyFourHourRate.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-steel">Payment Method</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            disabled
            className="flex items-center justify-between gap-3 rounded-card border border-graphite-line bg-graphite-raised/10 p-4 text-left opacity-40 cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <CreditCard size={18} className="text-steel" strokeWidth={1.6} />
              <div>
                <p className="text-sm text-ivory">Pay Online</p>
                <p className="text-[10px] text-brass uppercase font-bold">Coming Soon</p>
              </div>
            </div>
          </button>
          <PaymentOption
            active={paymentMethod === "COD"}
            icon={Banknote}
            title="Cash on Delivery"
            subtitle="Pay in person at pickup"
            onClick={() => onPaymentMethodChange("COD")}
          />
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-card border border-brass/30 bg-brass/5 p-4 text-xs text-steel">
        <ShieldAlert size={15} className="mt-0.5 flex-shrink-0 text-brass" />
        <p>
          Your car is reserved now. The rental amount shown above is payable in cash when you pick up the vehicle.
        </p>
      </div>

      {error && <p className="text-sm text-signal-booked">{error}</p>}

      <button
        onClick={onConfirm}
        disabled={submitting}
        className="w-full rounded-full bg-brass-sheen py-3.5 text-sm font-medium text-obsidian transition-transform duration-300 hover:scale-[1.01] disabled:opacity-60"
      >
        {submitting ? "Confirming…" : paymentMethod === "COD" ? "Confirm Booking (Pay at Pickup)" : "Confirm Booking"}
      </button>
    </div>
  );
}

function DateTime({ label, value, time }: { label: string; value: string; time: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-steel">{label}</p>
      <p className="mt-1 text-ivory">{new Date(`${value}T${time}`).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
      <p className="text-xs text-brass">{new Date(`${value}T${time}`).toLocaleTimeString("en-IN", { timeStyle: "short" })}</p>
    </div>
  );
}

function PaymentOption({
  active,
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  icon: typeof Banknote;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between gap-3 rounded-card border p-4 text-left transition-colors ${
        active ? "border-brass bg-brass/5" : "border-graphite-line bg-graphite-raised/30"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={active ? "text-brass" : "text-steel"} strokeWidth={1.6} />
        <div>
          <p className="text-sm text-ivory">{title}</p>
          <p className="text-xs text-steel">{subtitle}</p>
        </div>
      </div>
      <div
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
          active ? "border-brass bg-brass text-obsidian" : "border-graphite-line"
        }`}
      >
        {active && <Check size={12} />}
      </div>
    </button>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-1 text-steel">
      <span className="capitalize">{label}</span>
      <span className="text-ivory">₹{value.toLocaleString("en-IN")}</span>
    </div>
  );
}
