"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getCarReviews, type Review } from "@/services/reviewService";

export default function ReviewsSection({ carId, rating, reviewCount }: { carId: string; rating: number; reviewCount: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCarReviews(carId).then(setReviews).finally(() => setLoading(false));
  }, [carId]);

  if (!loading && reviewCount === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-lg font-600 text-ivory">Reviews</h2>
        {reviewCount > 0 && (
          <span className="flex items-center gap-1 text-sm text-steel">
            <Star size={14} className="fill-brass text-brass" />
            {rating.toFixed(1)} · {reviewCount} review{reviewCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {loading && <p className="mt-4 text-sm text-steel">Loading reviews…</p>}

      <div className="mt-5 space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-card border border-graphite-line bg-graphite p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ivory">{r.reviewerName}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className={i < r.overallRating ? "fill-brass text-brass" : "text-graphite-line"} />
                ))}
              </div>
            </div>
            {r.comment && <p className="mt-2 text-sm text-steel">{r.comment}</p>}
            <p className="mt-2 text-xs text-steel">{new Date(r.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
