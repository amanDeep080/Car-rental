"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadCarImage, type AdminCarUpsertInput } from "@/services/adminService";
import type { LocationOption } from "@/types/booking";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

const CATEGORIES = ["Hatchback", "Sedan", "Compact SUV", "Mid SUV", "Full-Size SUV", "MPV", "Off-Roader", "Crossover"];
const STATUSES = ["AVAILABLE", "MAINTENANCE", "INACTIVE"];

export default function CarForm({
  initial,
  locations,
  onSubmit,
}: {
  initial?: Partial<AdminCarUpsertInput>;
  locations: LocationOption[];
  onSubmit: (input: AdminCarUpsertInput) => Promise<void>;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<AdminCarUpsertInput>({
    slug: initial?.slug ?? "",
    brand: initial?.brand ?? "",
    model: initial?.model ?? "",
    variant: initial?.variant ?? "",
    year: initial?.year ?? new Date().getFullYear(),
    registrationNumber: initial?.registrationNumber ?? "",
    category: initial?.category ?? CATEGORIES[0]!,
    fuel: initial?.fuel ?? "PETROL",
    transmission: initial?.transmission ?? "MANUAL",
    seats: initial?.seats ?? 5,
    doors: initial?.doors ?? 4,
    engine: initial?.engine ?? "",
    power: initial?.power ?? "",
    mileagePolicy: initial?.mileagePolicy ?? "",
    pricePerDay: initial?.pricePerDay ?? initial?.pricePerTwentyFourHours ?? 2000,
    pricePerSixHours: initial?.pricePerSixHours,
    pricePerTwelveHours: initial?.pricePerTwelveHours,
    pricePerTwentyFourHours: initial?.pricePerTwentyFourHours ?? initial?.pricePerDay ?? 2000,
    pricePerWeek: initial?.pricePerWeek,
    pricePerMonth: initial?.pricePerMonth,
    securityDeposit: initial?.securityDeposit ?? 0,
    locationId: initial?.locationId ?? locations[0]?.id ?? "",
    status: initial?.status ?? "AVAILABLE",
    description: initial?.description ?? "",
    rentalPolicy: initial?.rentalPolicy ?? "",
    features: initial?.features ?? [],
    imageUrls: initial?.imageUrls ?? [],
  });
  const [featuresText, setFeaturesText] = useState((initial?.features ?? []).join(", "));
  const [urlInput, setUrlInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof AdminCarUpsertInput>(key: K, value: AdminCarUpsertInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateNumber<K extends keyof AdminCarUpsertInput>(key: K, value: string) {
    if (value === "") {
      update(key, undefined as any);
      return;
    }
    const num = Number(value);
    if (!isNaN(num)) {
      update(key, num as any);
    }
  }

  function addImageUrl() {
    if (!urlInput.trim()) return;
    update("imageUrls", [...(form.imageUrls || []), urlInput.trim()]);
    setUrlInput("");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const url = await uploadCarImage(file);
      update("imageUrls", [...(form.imageUrls || []), url]);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err?.response?.data?.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    update("imageUrls", (form.imageUrls || []).filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Basic frontend validation to prevent obvious 400s
    if (!form.locationId) {
      setError("Please select a location for this vehicle.");
      return;
    }
    if (!form.brand || !form.model || !form.slug) {
      setError("Brand, Model, and Slug are required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // Clean the payload: ensure numbers are numbers and remove empty strings from optional fields
      const payload: any = {
        ...form,
        year: Number(form.year) || new Date().getFullYear(),
        seats: Number(form.seats) || 5,
        pricePerDay: Number(form.pricePerTwentyFourHours) || 0,
        pricePerTwentyFourHours: Number(form.pricePerTwentyFourHours) || 0,
        features: featuresText.split(",").map((s) => s.trim()).filter(Boolean),
      };

      delete payload.securityDeposit;

      // Ensure optional numeric fields are either numbers or omitted (not empty strings)
      ['pricePerSixHours', 'pricePerTwelveHours', 'pricePerTwentyFourHours', 'pricePerWeek', 'pricePerMonth', 'doors'].forEach(key => {
        if (payload[key] === "" || payload[key] === undefined) {
          delete payload[key];
        } else if (typeof payload[key] === 'string') {
          const n = Number(payload[key]);
          if (!isNaN(n)) payload[key] = n;
          else delete payload[key];
        }
      });

      console.log("Submitting vehicle payload:", payload);
      await onSubmit(payload);
      router.push("/admin/cars");
    } catch (err: any) {
      console.error("Save error full object:", err);
      const data = err?.response?.data;
      console.error("Backend error response:", data);

      if (data?.fieldErrors) {
        const fieldMsgs = Object.entries(data.fieldErrors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(", ");
        setError(`Validation failed: ${fieldMsgs}`);
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError("Couldn't save this vehicle. Please check all fields and try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 pb-20">
      {error && <p className="rounded-lg border border-signal-booked/40 bg-signal-booked/10 px-4 py-2.5 text-sm text-signal-booked">{error}</p>}

      <Section title="Identity">
        <Grid>
          <Field label="Brand"><input required value={form.brand} onChange={(e) => update("brand", e.target.value)} className="input" /></Field>
          <Field label="Model"><input required value={form.model} onChange={(e) => update("model", e.target.value)} className="input" /></Field>
          <Field label="Variant"><input value={form.variant} onChange={(e) => update("variant", e.target.value)} className="input" /></Field>
          <Field label="Year"><input type="number" required value={form.year} onChange={(e) => updateNumber("year", e.target.value)} className="input" /></Field>
          <Field label="Slug (URL)"><input required value={form.slug} onChange={(e) => update("slug", e.target.value)} className="input" placeholder="bmw-3-series" /></Field>
          <Field label="Registration Number"><input value={form.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value)} className="input" /></Field>
        </Grid>
      </Section>

      <Section title="Media">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          {form.imageUrls?.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-graphite-line bg-graphite-raised">
              <img src={url} alt="Car" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-obsidian/60 text-ivory opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-graphite-line bg-graphite-raised/30 text-steel transition-colors hover:border-brass hover:bg-brass/5 hover:text-ivory disabled:opacity-50"
          >
            {uploading ? <Loader2 size={20} className="animate-spin text-brass" /> : <Upload size={20} />}
            <span className="mt-2 text-[10px] font-medium uppercase tracking-wider">{uploading ? "Uploading…" : "Upload"}</span>
          </button>
        </div>

        <div className="mt-4 flex max-w-md items-end gap-3">
          <Field label="Or paste image URL" className="flex-1">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
              className="input"
              placeholder="https://images.unsplash.com/..."
            />
          </Field>
          <button
            type="button"
            onClick={addImageUrl}
            className="mb-[1px] h-[38px] rounded-lg bg-graphite-raised px-4 text-xs font-medium text-ivory hover:bg-brass/10 hover:text-brass"
          >
            Add
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <p className="mt-2 text-[10px] text-steel italic">Upload from local disk or provide a direct web link.</p>
      </Section>

      <Section title="Specifications">
        <Grid>
          <Field label="Category">
            <select value={form.category} onChange={(e) => update("category", e.target.value)} className="input">
              {CATEGORIES.map((c) => <option key={c} value={c} className="bg-graphite-raised">{c}</option>)}
            </select>
          </Field>
          <Field label="Fuel">
            <select value={form.fuel} onChange={(e) => update("fuel", e.target.value)} className="input">
              {["PETROL", "DIESEL", "ELECTRIC", "HYBRID"].map((f) => <option key={f} value={f} className="bg-graphite-raised">{f}</option>)}
            </select>
          </Field>
          <Field label="Transmission">
            <select value={form.transmission} onChange={(e) => update("transmission", e.target.value)} className="input">
              {["MANUAL", "AUTOMATIC"].map((t) => <option key={t} value={t} className="bg-graphite-raised">{t}</option>)}
            </select>
          </Field>
          <Field label="Seats"><input type="number" required value={form.seats} onChange={(e) => updateNumber("seats", e.target.value)} className="input" /></Field>
          <Field label="Doors"><input type="number" value={form.doors ?? ""} onChange={(e) => updateNumber("doors", e.target.value)} className="input" /></Field>
          <Field label="Engine"><input value={form.engine} onChange={(e) => update("engine", e.target.value)} className="input" /></Field>
          <Field label="Power"><input value={form.power} onChange={(e) => update("power", e.target.value)} className="input" /></Field>
          <Field label="Mileage Policy"><input value={form.mileagePolicy} onChange={(e) => update("mileagePolicy", e.target.value)} className="input" /></Field>
        </Grid>
      </Section>

      <Section title="Pricing">
        <Grid>
          <Field label="Price / 6 Hours"><input type="number" value={form.pricePerSixHours ?? ""} onChange={(e) => updateNumber("pricePerSixHours", e.target.value)} className="input" /></Field>
          <Field label="Price / 12 Hours"><input type="number" value={form.pricePerTwelveHours ?? ""} onChange={(e) => updateNumber("pricePerTwelveHours", e.target.value)} className="input" /></Field>
          <Field label="Price / 24 Hours"><input type="number" value={form.pricePerTwentyFourHours ?? ""} onChange={(e) => updateNumber("pricePerTwentyFourHours", e.target.value)} className="input" /></Field>
          <Field label="Price / Week"><input type="number" value={form.pricePerWeek ?? ""} onChange={(e) => updateNumber("pricePerWeek", e.target.value)} className="input" /></Field>
          <Field label="Price / Month"><input type="number" value={form.pricePerMonth ?? ""} onChange={(e) => updateNumber("pricePerMonth", e.target.value)} className="input" /></Field>
        </Grid>
      </Section>

      <Section title="Availability">
        <Grid>
          <Field label="Location">
            <select value={form.locationId} onChange={(e) => update("locationId", e.target.value)} className="input">
              <option value="" disabled className="bg-graphite-raised">Select a branch</option>
              {locations.map((l) => <option key={l.id} value={l.id} className="bg-graphite-raised">{l.branchName} ({l.city})</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => update("status", e.target.value)} className="input">
              {STATUSES.map((s) => <option key={s} value={s} className="bg-graphite-raised">{s}</option>)}
            </select>
          </Field>
        </Grid>
      </Section>

      <Section title="Content">
        <Field label="Description">
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="input min-h-24" />
        </Field>
        <Field label="Rental Policy">
          <textarea value={form.rentalPolicy} onChange={(e) => update("rentalPolicy", e.target.value)} className="input min-h-20" />
        </Field>
        <Field label="Features (comma-separated)">
          <input value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} className="input" placeholder="Air Conditioning, Bluetooth, Sunroof" />
        </Field>
      </Section>

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-brass-sheen px-6 py-3 text-sm font-medium text-obsidian transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save Vehicle"}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-brass">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs text-steel">{label}</span>
      {children}
    </label>
  );
}
