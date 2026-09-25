"use client";

import { useEffect, useState } from "react";
import CarCard from "@/components/cars/CarCard";
import CarCardSkeleton from "@/components/cars/CarCardSkeleton";
import type { CarSummary } from "@/types/car";
import { searchCars } from "@/services/carService";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function FeaturedCars() {
  const [cars, setCars] = useState<CarSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchCars({ sort: "RATING" })
      .then((all) => setCars(all.slice(0, 6)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-28">
      <div className="container-edge">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-4">The current lineup</p>
            <h2 className="font-display text-display-lg font-700 text-ivory">Featured Fleet</h2>
          </div>
          <Link
            href="/cars"
            className="flex items-center gap-1.5 text-sm text-steel transition-colors hover:text-brass"
          >
            View full fleet
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CarCardSkeleton key={i} />)
            : cars.map((car) => <CarCard key={car.id} car={car} />)}
        </div>
      </div>
    </section>
  );
}
