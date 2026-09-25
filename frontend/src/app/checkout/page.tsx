"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BookingProgress from "@/components/booking/BookingProgress";
import StepTrip, { type TripDetails } from "@/components/booking/StepTrip";
import StepVehicle from "@/components/booking/StepVehicle";
import StepDocuments from "@/components/booking/StepDocuments";
import StepAgreement, { DEFAULT_AGREEMENT, type AgreementDetails } from "@/components/booking/StepAgreement";
import StepPayment, { type EstimatedTotals } from "@/components/booking/StepPayment";

import { getCarBySlug } from "@/services/carService";
import { getAddons, getLocations, createBooking } from "@/services/bookingService";
import { submitAgreement } from "@/services/agreementService";
import { getMyDocuments } from "@/services/documentService";
import { isAuthenticated, getCurrentUser } from "@/services/authService";
import { getAdminCustomers, type AdminCustomerSummary } from "@/services/adminService";
import type { CarDetail } from "@/types/car";
import type { Addon, LocationOption } from "@/types/booking";
import { ArrowLeft, ArrowRight, UserCircle } from "lucide-react";

const LAST_STEP_BEFORE_CONFIRM = 5;

function defaultTrip(locations: LocationOption[], cityHint?: string): TripDetails {
  const match = locations.find((l) => l.city.toLowerCase() === cityHint?.toLowerCase()) ?? locations[0];
  const start = new Date();
  // Round up to the next hour and add 1 hour buffer
  start.setHours(start.getHours() + 2, 0, 0, 0);

  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const fmt = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const fmtTime = (d: Date) => d.toTimeString().split(" ")[0]!.substring(0, 5);

  return {
    pickupLocationId: match?.id ?? "",
    returnLocationId: match?.id ?? "",
    pickupDate: fmt(start),
    pickupTime: fmtTime(start),
    returnDate: fmt(end),
    returnTime: fmtTime(end),
  };
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const carSlug = searchParams.get("carSlug");

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [car, setCar] = useState<CarDetail | null>(null);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Set<string>>(new Set());
  const [agreement, setAgreement] = useState<AgreementDetails>(DEFAULT_AGREEMENT);
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("COD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<AdminCustomerSummary[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(searchParams.get("onBehalfOf") || "");

  const user = getCurrentUser();
  const isAdmin = user?.roles.includes("ADMIN");

  useEffect(() => {
    setMounted(true);
    if (carSlug) {
      Promise.all([getCarBySlug(carSlug), getLocations()]).then(([c, l]) => {
        setCar(c);
        setLocations(l);
        setTrip(defaultTrip(l, c?.locationCity));
        setLoading(false);
      });
    }

    if (isAuthenticated()) {
      getMyDocuments().then((docs) => {
        const types = new Set(docs.map((d) => d.documentType));
        setUploadedDocs(types);
      });
    }

    if (isAdmin) {
      getAdminCustomers().then(setCustomers);
    }
  }, [carSlug, isAdmin]);

  const totals: EstimatedTotals | null = useMemo(() => {
    if (!car || !trip) return null;
    const pickup = new Date(`${trip.pickupDate}T${trip.pickupTime}`);
    const ret = new Date(`${trip.returnDate}T${trip.returnTime}`);
    const diffMs = ret.getTime() - pickup.getTime();
    const totalHours = Math.max(0, Math.round(diffMs / 3_600_000));

    const days = Math.floor(totalHours / 24);
    const extraHours = totalHours % 24;

    let rental = 0;
    let km = 0;
    let basis = "";

    // 1. Calculate Full Days
    if (days > 0) {
      rental += days * car.pricePerDay;
      km += days * 300;
      basis = `${days} Day${days > 1 ? 's' : ''}`;
    }

    // 2. Add Tiered Extra Hours
    if (extraHours > 0 || (days === 0 && totalHours > 0)) {
      if (extraHours <= 6 && car.pricePerSixHours) {
        rental += car.pricePerSixHours;
        km += 80;
        basis += (basis ? " + " : "") + "6 Hours";
      } else if (extraHours <= 12 && car.pricePerTwelveHours) {
        rental += car.pricePerTwelveHours;
        km += 150;
        basis += (basis ? " + " : "") + "12 Hours";
      } else {
        // More than 12 hours, or no specific tier, treat as another full day
        rental += car.pricePerDay;
        km += 300;
        basis += (basis ? " + " : "") + "Full Day";
      }
    }

    return {
      rentalAmount: rental,
      addonsAmount: 0,
      taxAmount: 0,
      securityDeposit: 0,
      total: rental,
      rateBasis: basis || "Per Day",
      kmLimit: km,
      durationDays: days,
      durationHours: extraHours,
    };
  }, [car, trip]);

  async function handleConfirm() {
    if (!car || !trip || !totals) return;

    const pickupAt = new Date(`${trip.pickupDate}T${trip.pickupTime}`);
    const returnAt = new Date(`${trip.returnDate}T${trip.returnTime}`);
    if (pickupAt.getTime() < Date.now() || returnAt.getTime() <= pickupAt.getTime()) {
      setError("Choose a pickup time in the future and a return time after pickup.");
      setStep(1);
      return;
    }
    if (totals.durationDays === 0 && totals.durationHours === 0) {
      setError("Please select a valid rental duration (at least 6 hours).");
      setStep(1);
      return;
    }

    if (!isAuthenticated()) {
      router.push(`/login?redirect=${encodeURIComponent(`/checkout?carSlug=${carSlug}`)}`);
      return;
    }
    if (!agreement.agreedToTerms) {
      setError("Please go back and accept the Rental Agreement to continue.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const booking = await createBooking({
        carId: car.id,
        pickupLocationId: trip.pickupLocationId,
        returnLocationId: trip.returnLocationId,
        pickupAt: pickupAt.toISOString(),
        returnAt: returnAt.toISOString(),
        addonIds: [],
        paymentMethod,
        onBehalfOfUserId: isAdmin && selectedCustomerId ? selectedCustomerId : undefined,
      });

      // The affidavit's vehicle details (registration/chassis/engine) come
      // from the car record server-side, not this form — the agreement can
      // only be recorded once the booking (and therefore the specific car)
      // exists, which is why this happens after createBooking rather than
      // its own earlier step.
      await submitAgreement(booking.bookingReference, {
        fullName: agreement.fullName,
        guardianRelation: agreement.guardianRelation,
        guardianName: agreement.guardianName,
        residentAddress: agreement.residentAddress,
        drivingLicenseNumber: agreement.drivingLicenseNumber,
        universityRegistrationNumber: agreement.universityRegistrationNumber || undefined,
        idProofType: agreement.idProofType,
        idProofNumber: agreement.idProofNumber,
        mobileNumber: agreement.mobileNumber,
        kmPerDayLimit: agreement.kmPerDayLimit,
        agreedToTerms: agreement.agreedToTerms,
      });

      router.push(`/checkout/success?ref=${booking.bookingReference}`);
    } catch (err: any) {
      console.error("Booking failure details:", err);
      const data = err?.response?.data;
      const msg = data?.message || "This car couldn't be booked for those dates. Please try different times.";

      setError(msg);

      // Handle validation errors specifically if present
      if (data?.fieldErrors) {
        const fieldMsgs = Object.entries(data.fieldErrors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(", ");
        setError(`Validation failed: ${fieldMsgs}`);
      }

      // Scroll to top to see error
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Only redirect if it's a systemic failure, not a user-fixable validation error
      if (err?.response?.status >= 500 || !err?.response) {
        router.push("/checkout/failure");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!carSlug) {
    return <EmptyState message="No car selected. Head back to the fleet to choose one." />;
  }
  if (loading || !car || !trip) {
    return <EmptyState message="Loading your booking…" />;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-obsidian pb-24 pt-32">
        <div className="container-edge max-w-2xl">
          <div className="mb-10">
            <BookingProgress currentStep={step} />
          </div>

          <div className="rounded-panel border border-graphite-line bg-graphite p-6 sm:p-8">
            {mounted && isAdmin && step === 1 && (
              <div className="mb-8 rounded-xl border border-brass/20 bg-brass/5 p-4">
                <div className="flex items-center gap-2 text-brass mb-3">
                  <UserCircle size={16} />
                  <span className="text-xs font-600 uppercase tracking-wider">Admin: Book for Customer</span>
                </div>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="input border-brass/30 bg-graphite focus:border-brass"
                >
                  <option value="">Book for myself ({user?.fullName})</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.email})
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[10px] text-steel italic">
                  Leave as "myself" to book in your own name.
                </p>
              </div>
            )}
            {step === 1 && <StepTrip locations={locations} trip={trip} onChange={setTrip} />}
            {step === 2 && <StepVehicle car={car} />}
            {step === 3 && (
              <StepDocuments
                uploaded={uploadedDocs}
                onUploaded={(t) => setUploadedDocs((prev) => new Set(prev).add(t))}
                onRemove={(t) => setUploadedDocs((prev) => {
                  const next = new Set(prev);
                  next.delete(t);
                  return next;
                })}
              />
            )}
            {step === 4 && totals && (
              <StepAgreement
                agreement={agreement}
                onChange={setAgreement}
                vehicleLabel={`${car.brand} ${car.model} ${car.variant}`}
                rentTotal={totals.total}
                kmLimit={totals.kmLimit}
                durationDays={totals.durationDays}
                durationHours={totals.durationHours}
              />
            )}
            {step === 5 && totals && (
              <StepPayment
                totals={totals}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                submitting={submitting}
                error={error}
                onConfirm={handleConfirm}
                car={car}
                trip={trip}
              />
            )}

            {step < LAST_STEP_BEFORE_CONFIRM && (
              <div className="mt-8 flex items-center justify-between border-t border-graphite-line pt-6">
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="flex items-center gap-1.5 text-sm text-steel disabled:opacity-0"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  onClick={() => setStep((s) => Math.min(LAST_STEP_BEFORE_CONFIRM, s + 1))}
                  disabled={
                    (step === 3 &&
                      (!uploadedDocs.has("DRIVING_LICENSE") ||
                        !uploadedDocs.has("GOVERNMENT_ID") ||
                        !uploadedDocs.has("LPU_ID"))) ||
                    (step === 4 &&
                      (!agreement.agreedToTerms ||
                        !agreement.fullName ||
                        !agreement.mobileNumber ||
                        !agreement.guardianName ||
                        !agreement.residentAddress ||
                        !agreement.drivingLicenseNumber ||
                        !agreement.universityRegistrationNumber ||
                        !agreement.idProofNumber))
                  }
                  className="flex items-center gap-1.5 rounded-full bg-brass-sheen px-6 py-2.5 text-sm font-medium text-obsidian transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  Continue <ArrowRight size={14} />
                </button>
              </div>
            )}

            {step === LAST_STEP_BEFORE_CONFIRM && (
              <div className="mt-8 border-t border-graphite-line pt-6">
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  className="flex items-center gap-1.5 text-sm text-steel"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <>
      <Header />
      <main className="flex min-h-screen items-center justify-center bg-obsidian px-6 pt-20">
        <p className="text-steel">{message}</p>
      </main>
      <Footer />
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}
