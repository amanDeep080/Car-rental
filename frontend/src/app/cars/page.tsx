"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CarCard from "@/components/cars/CarCard";
import CarCardSkeleton from "@/components/cars/CarCardSkeleton";
import NoResults from "@/components/cars/NoResults";
import AiAssistant from "@/components/cars/AiAssistant";
import FilterSidebar, { DEFAULT_FILTERS, type FilterState } from "@/components/cars/FilterSidebar";
import { searchCars } from "@/services/carService";
import { getCustomerDetail, type AdminCustomerSummary } from "@/services/adminService";
import { getCurrentUser } from "@/services/authService";
import type { CarSummary } from "@/types/car";
import { SlidersHorizontal, X, UserCircle } from "lucide-react";

const SORT_OPTIONS = [
  { value: "RECOMMENDED", label: "Recommended" },
  { value: "PRICE_LOW", label: "Price: Low to High" },
  { value: "PRICE_HIGH", label: "Price: High to Low" },
  { value: "RATING", label: "Top Rated" },
  { value: "NEWEST", label: "Newest" },
];

function CarSearchContent() {
  const searchParams = useSearchParams();
  const [cars, setCars] = useState<CarSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState("RECOMMENDED");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [onBehalfUser, setOnBehalfUser] = useState<AdminCustomerSummary | null>(null);

  const location = searchParams.get("location");
  const pickupDate = searchParams.get("pickupDate");
  const pickupTime = searchParams.get("pickupTime");
  const returnDate = searchParams.get("returnDate");
  const returnTime = searchParams.get("returnTime");
  const onBehalfOf = searchParams.get("onBehalfOf");

  useEffect(() => {
    const user = getCurrentUser();
    const isAdmin = user?.roles.includes("ADMIN");

    if (onBehalfOf && isAdmin) {
      getCustomerDetail(onBehalfOf)
        .then(setOnBehalfUser)
        .catch(() => setOnBehalfUser(null));
    }
  }, [onBehalfOf]);

  useEffect(() => {
    setLoading(true);
    searchCars({
      location: location ?? undefined,
      pickupAt: pickupDate && pickupTime ? new Date(`${pickupDate}T${pickupTime}`).toISOString() : undefined,
      returnAt: returnDate && returnTime ? new Date(`${returnDate}T${returnTime}`).toISOString() : undefined,
      category: filters.category || undefined,
      brand: filters.brand || undefined,
      transmission: filters.transmission || undefined,
      fuel: filters.fuel || undefined,
      maxPrice: filters.maxPrice,
      sort,
    })
      .then(setCars)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, filters, sort]);

  const summaryLabel = useMemo(() => {
    if (!location) return "All locations";
    return pickupDate ? `${location} · ${pickupDate} ${pickupTime ?? ""} → ${returnDate} ${returnTime ?? ""}` : location;
  }, [location, pickupDate, pickupTime, returnDate, returnTime]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-obsidian pt-32">
        <div className="container-edge">
          {onBehalfUser && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-brass/20 bg-brass/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brass/10 text-brass">
                  <UserCircle size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brass">Admin Mode</p>
                  <p className="text-sm font-600 text-ivory">Booking for {onBehalfUser.fullName} ({onBehalfUser.email})</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("onBehalfOf");
                  window.location.search = params.toString();
                }}
                className="text-xs text-steel hover:text-ivory"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex flex-wrap items-end justify-between gap-4 pb-8">
            <div>
              <p className="eyebrow mb-3">{summaryLabel}</p>
              <h1 className="font-display text-display-md font-700 text-ivory">
                {loading ? "Searching…" : `${cars.length} cars available`}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 rounded-full border border-graphite-line px-4 py-2.5 text-sm text-ivory lg:hidden"
              >
                <SlidersHorizontal size={14} /> Filters
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-full border border-graphite-line bg-graphite px-4 py-2.5 text-sm text-ivory outline-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-graphite-raised">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-8">
            <AiAssistant />
          </div>

          <div className="grid grid-cols-1 gap-10 pb-24 lg:grid-cols-[240px_1fr]">
            <div className="hidden lg:block">
              <FilterSidebar filters={filters} onChange={setFilters} />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {loading &&
                Array.from({ length: 6 }).map((_, i) => <CarCardSkeleton key={i} />)}

              {!loading && cars.length === 0 && <NoResults onReset={() => setFilters(DEFAULT_FILTERS)} />}

              {!loading && cars.map((car) => <CarCard key={car.id} car={car} />)}
            </div>
          </div>
        </div>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
            <div className="relative ml-auto flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-graphite p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-display text-base font-600 text-ivory">Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                  <X size={20} className="text-steel" />
                </button>
              </div>
              <FilterSidebar filters={filters} onChange={setFilters} />
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-8 rounded-full bg-brass-sheen py-3 text-sm font-medium text-obsidian"
              >
                Show {cars.length} cars
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function CarSearchPage() {
  return (
    <Suspense fallback={null}>
      <CarSearchContent />
    </Suspense>
  );
}
