"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { getAdminLocations, createLocation, updateLocation, deleteLocation, type AdminLocation } from "@/services/adminService";
import { Plus, MapPin, MoreVertical, X, Phone, Clock, Navigation } from "lucide-react";
import { cn } from "@/lib/cn";

export default function AdminLocationsPage() {
  const ready = useAdminGuard();
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; edit: AdminLocation | null }>({ open: false, edit: null });

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready]);

  function load() {
    setLoading(true);
    getAdminLocations()
      .then(setLocations)
      .finally(() => setLoading(false));
  }

  async function handleToggleStatus(loc: AdminLocation) {
    await updateLocation(loc.id, { ...loc, active: !loc.active });
    load();
  }

  if (!ready) return null;

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-display-md font-700 text-ivory">Service Locations</h1>
        <button
          onClick={() => setModal({ open: true, edit: null })}
          className="flex items-center gap-1.5 rounded-full bg-brass-sheen px-5 py-2.5 text-sm font-medium text-obsidian transition-transform hover:scale-[1.02]"
        >
          <Plus size={15} /> Add Location
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-sm text-steel">Loading locations...</p>
        ) : locations.map((loc) => (
          <div key={loc.id} className={cn(
            "group rounded-panel border p-5 transition-all",
            loc.active ? "border-graphite-line bg-graphite shadow-sm" : "border-graphite-line bg-graphite/40 grayscale"
          )}>
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-graphite-raised text-brass">
                <MapPin size={18} />
              </div>
              <div className="flex gap-2">
                 <button
                  onClick={() => handleToggleStatus(loc)}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                    loc.active ? "bg-green-500/10 text-green-500" : "bg-signal-booked/10 text-signal-booked"
                  )}
                >
                  {loc.active ? "Active" : "Inactive"}
                </button>
                <button onClick={() => setModal({ open: true, edit: loc })} className="text-steel hover:text-ivory">
                  <EditIcon />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-display text-base font-600 text-ivory">{loc.branchName}</h3>
              <p className="text-xs text-brass font-mono uppercase tracking-wide">{loc.city}</p>
              <p className="mt-3 text-xs leading-relaxed text-steel line-clamp-2">{loc.address}</p>
            </div>

            <div className="mt-5 space-y-2 border-t border-graphite-line pt-4">
              <div className="flex items-center gap-2 text-[11px] text-steel">
                <Phone size={12} className="text-brass/60" /> {loc.contactNumber || "—"}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-steel">
                <Clock size={12} className="text-brass/60" /> {loc.openingHours || "—"}
              </div>
              {(loc.latitude && loc.longitude) && (
                <div className="flex items-center gap-2 text-[11px] text-steel">
                  <Navigation size={12} className="text-brass/60" /> {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {modal.open && (
        <LocationModal
          initial={modal.edit}
          onClose={() => setModal({ open: false, edit: null })}
          onSuccess={() => { setModal({ open: false, edit: null }); load(); }}
        />
      )}
    </AdminLayout>
  );
}

function LocationModal({ initial, onClose, onSuccess }: { initial: AdminLocation | null, onClose: () => void, onSuccess: () => void }) {
  const [form, setForm] = useState({
    city: initial?.city || "",
    branchName: initial?.branchName || "",
    address: initial?.address || "",
    contactNumber: initial?.contactNumber || "",
    openingHours: initial?.openingHours || "",
    latitude: initial?.latitude || 0,
    longitude: initial?.longitude || 0,
    active: initial ? initial.active : true,
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (initial) await updateLocation(initial.id, form);
      else await createLocation(form);
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/80 backdrop-blur-sm p-6">
      <div className="w-full max-w-lg bg-graphite border border-graphite-line rounded-panel shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-graphite-line p-6">
          <h2 className="font-display text-lg font-700 text-ivory">{initial ? "Edit Location" : "Add Location"}</h2>
          <button onClick={onClose} className="text-steel hover:text-ivory"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="City">
              <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="input" placeholder="e.g. Ludhiana" />
            </Field>
            <Field label="Branch Name">
              <input required value={form.branchName} onChange={e => setForm({...form, branchName: e.target.value})} className="input" placeholder="e.g. North Hub" />
            </Field>
          </div>
          <Field label="Street Address">
            <input required value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input" placeholder="Full address..." />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact Number">
              <input value={form.contactNumber} onChange={e => setForm({...form, contactNumber: e.target.value})} className="input" placeholder="+91..." />
            </Field>
            <Field label="Opening Hours">
              <input value={form.openingHours} onChange={e => setForm({...form, openingHours: e.target.value})} className="input" placeholder="09:00 - 21:00" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude">
              <input type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: parseFloat(e.target.value)})} className="input" />
            </Field>
            <Field label="Longitude">
              <input type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: parseFloat(e.target.value)})} className="input" />
            </Field>
          </div>
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="accent-brass" />
              <span className="text-sm text-steel">Available for public bookings</span>
            </label>
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-full bg-brass-sheen py-3 text-sm font-medium text-obsidian">
            {loading ? "Saving..." : initial ? "Save Changes" : "Create Location"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-steel uppercase tracking-wider font-600">{label}</span>
      {children}
    </label>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
  );
}
