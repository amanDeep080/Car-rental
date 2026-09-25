import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CarGallery from "@/components/cars/CarGallery";
import ReviewsSection from "@/components/cars/ReviewsSection";
import BookingButton from "@/components/cars/BookingButton";
import { getCarBySlug } from "@/services/carService";
import { Fuel, Cog, Users, DoorOpen, Gauge, MapPin, ShieldCheck, Check } from "lucide-react";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCarBySlug(params.slug);
  if (!car) return { title: "Car not found" };

  const title = `${car.brand} ${car.model} ${car.variant} — Self-Drive Rental`;
  const description = `Rent the ${car.brand} ${car.model} ${car.variant} self-drive from ₹${car.pricePerDay}/day in ${car.locationCity}. No drivers — you get the keys.`;

  return {
    title,
    description,
    alternates: { canonical: `/cars/${car.slug}` },
    openGraph: { title, description, images: car.imageUrls[0] ? [car.imageUrls[0]] : undefined },
  };
}

export default async function CarDetailPage({ params }: Props) {
  const car = await getCarBySlug(params.slug);
  if (!car) notFound();

  const specs = [
    { icon: Cog, label: "Transmission", value: car.transmission === "AUTOMATIC" ? "Automatic" : "Manual" },
    { icon: Fuel, label: "Fuel", value: car.fuel.charAt(0) + car.fuel.slice(1).toLowerCase() },
    { icon: Users, label: "Seats", value: `${car.seats}` },
    { icon: DoorOpen, label: "Doors", value: car.doors ? `${car.doors}` : "—" },
    { icon: Gauge, label: "Mileage Policy", value: car.mileagePolicy ?? "Contact branch" },
    { icon: MapPin, label: "Location", value: car.locationCity },
  ];

  const effectiveTwentyFourHourRate =
    car.pricePerTwentyFourHours == null || car.pricePerTwentyFourHours === 0 ||
    (car.pricePerTwentyFourHours === 2000 && car.pricePerDay !== 2000)
      ? car.pricePerDay
      : (car.pricePerTwentyFourHours ?? car.pricePerDay);

  const pricingTiers = [
    { label: "6 Hours", value: car.pricePerSixHours },
    { label: "12 Hours", value: car.pricePerTwelveHours },
    { label: "24 Hours", value: effectiveTwentyFourHourRate },
  ].filter((t) => t.value != null);

  const unavailable = car.status !== "AVAILABLE" || car.currentlyBooked === true;
  const bookedMessage = car.currentlyBooked && car.bookedUntil
    ? `Car is already booked until ${new Date(car.bookedUntil).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}.`
    : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-obsidian pb-24 pt-32">
        <div className="container-edge">
          <p className="eyebrow mb-3">{car.category}</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="font-display text-display-lg font-700 text-ivory">
              {car.brand} {car.model} <span className="text-steel">{car.variant}</span>
            </h1>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
            <div>
              <CarGallery images={car.imageUrls} alt={`${car.brand} ${car.model} ${car.variant}`} />

              <section className="mt-12">
                <h2 className="font-display text-lg font-600 text-ivory">Specifications</h2>
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {specs.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-card border border-graphite-line bg-graphite p-4">
                      <Icon size={16} className="text-brass" strokeWidth={1.6} />
                      <p className="mt-2 text-xs text-steel">{label}</p>
                      <p className="text-sm text-ivory">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {car.features.length > 0 && (
                <section className="mt-12">
                  <h2 className="font-display text-lg font-600 text-ivory">Features</h2>
                  <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                    {car.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-steel">
                        <Check size={14} className="text-brass" />
                        {f}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {car.description && (
                <section className="mt-12">
                  <h2 className="font-display text-lg font-600 text-ivory">About this car</h2>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-steel">{car.description}</p>
                </section>
              )}

              {car.rentalPolicy && (
                <section className="mt-12 rounded-card border border-graphite-line bg-graphite p-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-brass" />
                    <h2 className="font-display text-base font-600 text-ivory">Rental Policy</h2>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-steel">{car.rentalPolicy}</p>
                </section>
              )}

              <ReviewsSection carId={car.id} rating={car.rating} reviewCount={car.reviewCount} />
            </div>

            {/* Sticky booking panel */}
            <aside className="h-fit rounded-panel border border-graphite-line bg-graphite p-6 lg:sticky lg:top-28">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl font-700 text-ivory">
                  ₹{car.pricePerDay.toLocaleString("en-IN")}
                </span>
                <span className="text-sm text-steel">/day</span>
              </div>

              {pricingTiers.length > 0 && (
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-graphite-line pt-5">
                  {pricingTiers.map((t) => (
                    <div key={t.label} className="rounded-lg bg-graphite-raised px-2 py-2.5 text-center">
                      <p className="font-mono text-[10px] text-steel">{t.label}</p>
                      <p className="mt-0.5 text-sm text-ivory">₹{t.value!.toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>
              )}

              <BookingButton carSlug={car.slug} status={unavailable ? "BOOKED" : car.status} />
              {bookedMessage && <p className="mt-3 text-center text-xs text-signal-booked">{bookedMessage}</p>}

              <p className="mt-4 text-center text-xs text-steel">
                No drivers, no dispatch — you hold the keys the whole trip.
              </p>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
