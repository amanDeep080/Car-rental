"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { register } from "@/services/authService";
import { AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!acceptedTerms || !acceptedPrivacyPolicy) {
      setError("Please accept the Terms & Conditions and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      await register({ ...form, acceptedTerms, acceptedPrivacyPolicy });
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Verify once, then book any car in the fleet."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-signal-booked/40 bg-signal-booked/10 px-3.5 py-2.5 text-sm text-signal-booked">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <Field label="Full Name">
          <input required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="input" placeholder="Amandeep Kumar" />
        </Field>
        <Field label="Email">
          <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} className="input" placeholder="you@example.com" />
        </Field>
        <Field label="Phone">
          <input required value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input" placeholder="+91 98765 43210" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Password">
            <input type="password" required minLength={8} value={form.password} onChange={(e) => update("password", e.target.value)} className="input" placeholder="••••••••" />
          </Field>
          <Field label="Confirm Password">
            <input type="password" required value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} className="input" placeholder="••••••••" />
          </Field>
        </div>

        <div className="space-y-2 pt-1">
          <label className="flex items-start gap-2.5 text-xs text-steel">
            <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5 accent-brass" />
            I agree to the <a href="/legal/terms" className="text-brass hover:underline">Terms &amp; Conditions</a>
          </label>
          <label className="flex items-start gap-2.5 text-xs text-steel">
            <input type="checkbox" checked={acceptedPrivacyPolicy} onChange={(e) => setAcceptedPrivacyPolicy(e.target.checked)} className="mt-0.5 accent-brass" />
            I agree to the <a href="/legal/privacy" className="text-brass hover:underline">Privacy Policy</a>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brass-sheen py-3 text-sm font-medium text-obsidian transition-transform duration-300 hover:scale-[1.01] disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>
    </AuthShell>
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
