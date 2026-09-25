"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CarCard from "@/components/cars/CarCard";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getWishlist } from "@/lib/wishlist";
import { searchCars } from "@/services/carService";
import type { CarSummary } from "@/types/car";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const ready = useAuthGuard();
  const [cars, setCars] = useState<CarSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    const slugs = new Set(getWishlist());
    searchCars({})
      .then((all) => setCars(all.filter((c) => slugs.has(c.slug))))
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return null;

  return (
    <DashboardLayout>
      <h1 className="font-display text-display-md font-700 text-ivory">Wishlist</h1>

      {loading && <p className="mt-6 text-sm text-steel">Loading…</p>}

      {!loading && cars.length === 0 && (
        <div className="mt-8 rounded-panel border border-dashed border-graphite-line py-20 text-center">
          <Heart size={24} className="mx-auto text-steel" />
          <p className="mt-3 text-sm text-ivory">Your dream cars belong here.</p>
          <Link href="/cars" className="mt-5 inline-block rounded-full bg-brass-sheen px-5 py-2.5 text-xs font-medium text-obsidian">
            Explore Fleet
          </Link>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {cars.map((c) => (
          <CarCard key={c.id} car={c} />
        ))}
      </div>
    </DashboardLayout>
  );
}
