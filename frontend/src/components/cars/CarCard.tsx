"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Heart, Star, Fuel, Users, Cog } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CarSummary } from "@/types/car";
import { isWishlisted, toggleWishlist } from "@/lib/wishlist";

export default function CarCard({ car }: { car: CarSummary }) {
  const [wishlisted, setWishlisted] = useState(false);
  const unavailable = car.status !== "AVAILABLE";
  const displayImageUrl = car.imageUrl && car.imageUrl.startsWith("http")
    ? car.imageUrl
    : `https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800&q=80`;

  useEffect(() => {
    setWishlisted(isWishlisted(car.slug));
  }, [car.slug]);

  return (
    <div className="group relative overflow-hidden rounded-card border border-graphite-line bg-graphite transition-colors duration-300 hover:border-brass/60">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={displayImageUrl}
          alt={`${car.brand} ${car.model} ${car.variant}`}
          className="h-full w-full object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent" />

        <button
          onClick={() => setWishlisted(toggleWishlist(car.slug))}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-obsidian/60 backdrop-blur-sm transition-colors hover:bg-obsidian/80"
        >
          <Heart
            size={16}
            className={cn("transition-colors", wishlisted ? "fill-brass text-brass" : "text-ivory")}
          />
        </button>

        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide",
            unavailable ? "bg-signal-booked/20 text-signal-booked" : "bg-signal-available/20 text-signal-available"
          )}
        >
          {unavailable ? car.status.replace("_", " ") : "Available"}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-600 text-ivory">
              {car.brand} {car.model}
            </h3>
            <p className="text-xs text-steel">{car.variant} · {car.year}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-ivory">
            <Star size={13} className="fill-brass text-brass" />
            {car.rating.toFixed(1)}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-steel">
          <span className="flex items-center gap-1.5">
            <Cog size={13} /> {car.transmission === "AUTOMATIC" ? "Automatic" : "Manual"}
          </span>
          <span className="flex items-center gap-1.5">
            <Fuel size={13} /> {car.fuel.charAt(0) + car.fuel.slice(1).toLowerCase()}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={13} /> {car.seats} seats
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-graphite-line pt-4">
          <div>
            <span className="font-display text-lg font-700 text-ivory">
              ₹{car.pricePerDay.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-steel"> /day</span>
          </div>
          <Link
            href={`/cars/${car.slug}`}
            className="rounded-full border border-graphite-line px-4 py-2 text-xs font-medium text-ivory transition-colors hover:border-brass hover:text-brass"
          >
            View Car
          </Link>
        </div>
      </div>
    </div>
  );
}
