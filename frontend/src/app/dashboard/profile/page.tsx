"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getMyProfile, updateMyProfile, type UserProfile } from "@/services/userService";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const ready = useAuthGuard();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ fullName: "", phone: "", dateOfBirth: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    if (!ready) return;
    getMyProfile()
      .then((p) => {
        setProfile(p);
        setForm({ fullName: p.fullName, phone: p.phone, dateOfBirth: p.dateOfBirth ?? "" });
      })
      .finally(() => setLoading(false));
  }, [ready]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");
    try {
      const updated = await updateMyProfile({ ...form, dateOfBirth: form.dateOfBirth || null });
      setProfile(updated);
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return null;

  return (
    <DashboardLayout>
      <h1 className="font-display text-display-md font-700 text-ivory">Profile</h1>

      {loading && <p className="mt-6 text-sm text-steel">Loading…</p>}

      {profile && (
        <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-4 rounded-panel border border-graphite-line bg-graphite p-6">
          {status === "success" && (
            <div className="flex items-center gap-2 rounded-lg border border-signal-available/40 bg-signal-available/10 px-3.5 py-2.5 text-sm text-signal-available">
              <CheckCircle2 size={15} /> Profile updated.
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 rounded-lg border border-signal-booked/40 bg-signal-booked/10 px-3.5 py-2.5 text-sm text-signal-booked">
              <AlertCircle size={15} /> Couldn&apos;t save changes. Please try again.
            </div>
          )}

          <Field label="Full Name">
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input" required />
          </Field>
          <Field label="Email">
            <input value={profile.email} disabled className="input opacity-60" />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" required />
          </Field>
          <Field label="Date of Birth">
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              className="input [color-scheme:dark]"
            />
          </Field>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-brass-sheen px-6 py-2.5 text-sm font-medium text-obsidian transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      )}
    </DashboardLayout>
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
