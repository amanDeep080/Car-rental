import type { Addon } from "@/types/booking";
import { Check } from "lucide-react";

export default function StepExtras({
  addons,
  selectedIds,
  onToggle,
}: {
  addons: Addon[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-600 text-ivory">Add optional extras</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {addons.map((addon) => {
          const selected = selectedIds.includes(addon.id);
          return (
            <button
              key={addon.id}
              type="button"
              onClick={() => onToggle(addon.id)}
              className={`flex items-start justify-between gap-3 rounded-card border p-4 text-left transition-colors ${
                selected ? "border-brass bg-brass/5" : "border-graphite-line bg-graphite-raised/30 hover:border-graphite-line"
              }`}
            >
              <div>
                <p className="text-sm text-ivory">{addon.name}</p>
                {addon.description && <p className="mt-1 text-xs text-steel">{addon.description}</p>}
                <p className="mt-2 font-mono text-xs text-brass">
                  ₹{addon.price.toLocaleString("en-IN")} {addon.pricingType === "PER_DAY" ? "/day" : "flat"}
                </p>
              </div>
              <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                selected ? "border-brass bg-brass text-obsidian" : "border-graphite-line"
              }`}>
                {selected && <Check size={12} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
