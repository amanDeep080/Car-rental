"use client";

const CATEGORIES = ["Hatchback", "Sedan", "Compact SUV", "Mid SUV", "Full-Size SUV", "MPV", "Off-Roader", "Crossover"];
const BRANDS = ["Maruti Suzuki", "Hyundai", "Kia", "Mahindra", "Toyota", "Volkswagen"];

export interface FilterState {
  category: string;
  brand: string;
  transmission: string;
  fuel: string;
  maxPrice: number;
}

export const DEFAULT_FILTERS: FilterState = {
  category: "",
  brand: "",
  transmission: "",
  fuel: "",
  maxPrice: 5000,
};

export default function FilterSidebar({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}) {
  return (
    <aside className="space-y-8">
      <FilterGroup title="Category">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              active={filters.category === c}
              label={c}
              onClick={() => onChange({ ...filters, category: filters.category === c ? "" : c })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Brand">
        <div className="flex flex-col gap-2">
          {BRANDS.map((b) => (
            <label key={b} className="flex items-center gap-2.5 text-sm text-steel">
              <input
                type="radio"
                name="brand"
                checked={filters.brand === b}
                onChange={() => onChange({ ...filters, brand: filters.brand === b ? "" : b })}
                className="accent-brass"
              />
              {b}
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Transmission">
        <div className="flex gap-2">
          {["MANUAL", "AUTOMATIC"].map((t) => (
            <Chip
              key={t}
              active={filters.transmission === t}
              label={t === "MANUAL" ? "Manual" : "Automatic"}
              onClick={() => onChange({ ...filters, transmission: filters.transmission === t ? "" : t })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Fuel">
        <div className="flex flex-wrap gap-2">
          {["PETROL", "DIESEL", "ELECTRIC", "HYBRID"].map((f) => (
            <Chip
              key={f}
              active={filters.fuel === f}
              label={f.charAt(0) + f.slice(1).toLowerCase()}
              onClick={() => onChange({ ...filters, fuel: filters.fuel === f ? "" : f })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={`Max price · ₹${filters.maxPrice.toLocaleString("en-IN")}/day`}>
        <input
          type="range"
          min={1500}
          max={5000}
          step={100}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-brass"
        />
      </FilterGroup>

      <button
        onClick={() => onChange(DEFAULT_FILTERS)}
        className="text-xs text-steel underline decoration-graphite-line underline-offset-4 transition-colors hover:text-brass"
      >
        Clear all filters
      </button>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-steel">{title}</h4>
      {children}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
        active
          ? "border-brass bg-brass/10 text-brass"
          : "border-graphite-line text-steel hover:border-brass/50 hover:text-ivory"
      }`}
    >
      {label}
    </button>
  );
}
