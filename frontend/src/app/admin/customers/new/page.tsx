"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { createCustomer } from "@/services/adminService";
import { ArrowLeft, UserPlus } from "lucide-react";

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    dateOfBirth: "",
    emailVerified: false,
    active: true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createCustomer(form);
      router.push("/admin/customers");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create customer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-xs text-steel hover:text-ivory">
        <ArrowLeft size={14} /> Back to Customers
      </button>

      <div className="max-w-2xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-graphite-raised text-brass">
            <UserPlus size={24} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-700 text-ivory">Create New Customer</h1>
            <p className="text-sm text-steel">Manually add a customer account to the system.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-signal-booked/10 border border-signal-booked/20 p-4 text-sm text-signal-booked">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-graphite border border-graphite-line rounded-panel p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Full Name">
              <input
                required
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="input"
                placeholder="John Doe"
              />
            </Field>
            <Field label="Email Address">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="john@example.com"
              />
            </Field>
            <Field label="Phone Number">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input"
                placeholder="+91..."
              />
            </Field>
            <Field label="Initial Password">
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input"
                placeholder="••••••••"
              />
            </Field>
            <Field label="Date of Birth">
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="input [color-scheme:dark]"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-graphite-line">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.emailVerified}
                onChange={(e) => setForm({ ...form, emailVerified: e.target.checked })}
                className="accent-brass h-4 w-4"
              />
              <span className="text-sm text-ivory">Pre-verify Email</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="accent-brass h-4 w-4"
              />
              <span className="text-sm text-ivory">Account Active</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brass-sheen py-3 text-sm font-medium text-obsidian transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </AdminLayout>
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
