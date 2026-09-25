"use client";

import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { submitReview } from "@/services/reviewService";
import { cn } from "@/lib/cn";

export default function ReviewForm({ bookingReference, onSubmitted }: { bookingReference: string; onSubmitted?: () => void }) {
  const [overall, setOverall] = useState(0);
  const [cleanliness, setCleanliness] = useState(0);
  const [condition, setCondition] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (overall === 0) {
      setError("Please choose an overall rating.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitReview({
        bookingReference,
        overallRating: overall,
        cleanlinessRating: cleanliness || undefined,
        conditionRating: condition || undefined,
        comment: comment || undefined,
      });
      setDone(true);
      onSubmitted?.();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Couldn't submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-card border border-signal-available/40 bg-signal-available/10 p-4 text-sm text-signal-available">
        <CheckCircle2 size={16} /> Thanks for the review!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-card border border-graphite-line bg-graphite p-5">
      <h3 className="font-display text-sm font-600 text-ivory">Rate this rental</h3>

      <StarPicker label="Overall" value={overall} onChange={setOverall} />
      <StarPicker label="Cleanliness" value={cleanliness} onChange={setCleanliness} />
      <StarPicker label="Vehicle Condition" value={condition} onChange={setCondition} />

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How was the car and the overall experience?"
        className="input min-h-20"
      />

      {error && <p className="text-xs text-signal-booked">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-brass-sheen px-5 py-2.5 text-xs font-medium text-obsidian transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}

function StarPicker({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-steel">{label}</span>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} type="button" onClick={() => onChange(i + 1)} aria-label={`${i + 1} stars`}>
            <Star size={18} className={cn(i < value ? "fill-brass text-brass" : "text-graphite-line", "transition-colors")} />
          </button>
        ))}
      </div>
    </div>
  );
}
