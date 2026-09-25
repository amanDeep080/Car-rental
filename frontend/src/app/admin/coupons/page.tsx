"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { getAdminCoupons, createCoupon, deactivateCoupon, type AdminCoupon } from "@/services/adminService";
import { Plus, X } from "lucide-react";

const emptyForm = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 10,
  minBookingAmount: "",
  maxDiscountAmount: "",
  startDate: new Date().toISOString().split("T")[0]!,
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]!,
  usageLimit: "",
  userUsageLimit: "1",
};

export default function AdminCouponsPage() {
  const ready = useAdminGuard();
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready]);

  function load() {
    setLoading(true);
    getAdminCoupons().then(setCoupons).catch(() => setCoupons([])).finally(() => setLoading(false));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createCoupon({
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minBookingAmount: form.minBookingAmount ? Number(form.minBookingAmount) : undefined,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        userUsageLimit: form.userUsageLimit ? Number(form.userUsageLimit) : undefined,
        active: true,
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id: string) {
    await deactivateCoupon(id);
    load();
  }

  if (!ready) return null;

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-display-md font-700 text-ivory">Coupons</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-full bg-brass-sheen px-5 py-2.5 text-sm font-medium text-obsidian transition-transform hover:scale-[1.02]"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? "Cancel" : "New Coupon"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-6 grid grid-cols-1 gap-4 rounded-panel border border-graphite-line bg-graphite p-6 sm:grid-cols-3">
          <Field label="Code">
            <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input" placeholder="SUMMER20" />
          </Field>
          <Field label="Discount Type">
            <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="input">
              <option value="PERCENTAGE" className="bg-graphite-raised">Percentage</option>
              <option value="FIXED" className="bg-graphite-raised">Fixed Amount</option>
            </select>
          </Field>
          <Field label="Discount Value">
            <input type="number" required value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} className="input" />
          </Field>
          <Field label="Min Booking Amount">
            <input type="number" value={form.minBookingAmount} onChange={(e) => setForm({ ...form, minBookingAmount: e.target.value })} className="input" />
          </Field>
          <Field label="Max Discount Amount">
            <input type="number" value={form.maxDiscountAmount} onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })} className="input" />
          </Field>
          <Field label="Usage Limit (total)">
            <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="input" placeholder="Unlimited" />
          </Field>
          <Field label="Start Date">
            <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input [color-scheme:dark]" />
          </Field>
          <Field label="End Date">
            <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input [color-scheme:dark]" />
          </Field>
          <Field label="Per-User Limit">
            <input type="number" value={form.userUsageLimit} onChange={(e) => setForm({ ...form, userUsageLimit: e.target.value })} className="input" />
          </Field>
          <div className="sm:col-span-3">
            <button type="submit" disabled={saving} className="rounded-full bg-brass-sheen px-5 py-2.5 text-sm font-medium text-obsidian disabled:opacity-60">
              {saving ? "Creating…" : "Create Coupon"}
            </button>
          </div>
        </form>
      )}

      {loading && <p className="mt-6 text-sm text-steel">Loading…</p>}

      {!loading && (
        <div className="mt-8 overflow-x-auto rounded-panel border border-graphite-line">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-graphite-line bg-graphite text-xs text-steel">
                <th className="px-4 py-3 font-normal">Code</th>
                <th className="px-4 py-3 font-normal">Discount</th>
                <th className="px-4 py-3 font-normal">Valid</th>
                <th className="px-4 py-3 font-normal">Limits</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-graphite-line last:border-0 hover:bg-graphite-raised/30">
                  <td className="px-4 py-3 font-mono text-ivory">{c.code}</td>
                  <td className="px-4 py-3 text-steel">
                    {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    {c.maxDiscountAmount ? ` (max ₹${c.maxDiscountAmount})` : ""}
                  </td>
                  <td className="px-4 py-3 text-xs text-steel">
                    {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-steel">
                    {c.usageLimit ?? "∞"} total · {c.userUsageLimit ?? "∞"}/user
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase ${c.active ? "bg-signal-available/10 text-signal-available" : "bg-steel/10 text-steel"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.active && (
                      <button onClick={() => handleDeactivate(c.id)} className="rounded-full border border-graphite-line px-3 py-1.5 text-xs text-ivory hover:border-brass">
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && <p className="p-8 text-center text-sm text-steel">No coupons yet.</p>}
        </div>
      )}
    </AdminLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-steel">{label}</span>
      {children}
    </label>
  );
}
