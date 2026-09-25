import { SearchX } from "lucide-react";

export default function NoResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-panel border border-dashed border-graphite-line py-24 text-center">
      <SearchX size={32} className="text-steel" strokeWidth={1.4} />
      <h3 className="mt-4 font-display text-lg font-600 text-ivory">No cars match those filters</h3>
      <p className="mt-1.5 max-w-sm text-sm text-steel">
        Try widening your price range or checking a nearby location.
      </p>
      <button
        onClick={onReset}
        className="mt-6 rounded-full border border-graphite-line px-5 py-2.5 text-sm text-ivory transition-colors hover:border-brass"
      >
        Reset filters
      </button>
    </div>
  );
}
