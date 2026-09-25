"use client";

import { useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import CarCard from "@/components/cars/CarCard";
import { getAiRecommendation } from "@/services/aiService";
import type { CarSummary } from "@/types/car";

const EXAMPLES = [
  "A 7-seater SUV under ₹4000/day",
  "Automatic hatchback for city driving",
  "Something for a weekend trip to the hills",
];

export default function AiAssistant() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ explanation: string; matches: CarSummary[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAiRecommendation(query);
      setResult(res);
    } catch {
      setError("Couldn't get recommendations right now. Try the filters instead.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-panel border border-brass/25 bg-gradient-to-br from-brass/[0.06] to-transparent p-6">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2.5 text-left"
      >
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brass/15">
          <Sparkles size={15} className="text-brass" />
        </span>
        <div>
          <p className="text-sm text-ivory">Not sure which car? Describe your trip.</p>
          <p className="text-xs text-steel">AI-assisted search across our real fleet — no invented cars.</p>
        </div>
      </button>

      {expanded && (
        <div className="mt-5">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. a spacious SUV for 6 people under ₹4000/day"
              className="input flex-1"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-brass-sheen px-4 py-3 text-sm font-medium text-obsidian disabled:opacity-60"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setQuery(ex)}
                className="rounded-full border border-graphite-line px-3 py-1.5 text-xs text-steel transition-colors hover:border-brass hover:text-ivory"
              >
                {ex}
              </button>
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-signal-booked">{error}</p>}

          {result && (
            <div className="mt-6">
              <p className="text-sm text-steel">{result.explanation}</p>
              {result.matches.length === 0 ? (
                <p className="mt-3 text-sm text-ivory">
                  No exact matches in the fleet right now — try widening your criteria.
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {result.matches.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
