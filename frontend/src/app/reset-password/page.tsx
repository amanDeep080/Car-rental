"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { resetPassword } from "@/services/authService";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("This reset link is missing its token. Please request a new one.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a new password for your account."
      footerText="Remembered your old one?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      {done ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-signal-available/40 bg-signal-available/10 p-4 text-sm text-signal-available">
          <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
          <span>Password updated. Redirecting you to sign in…</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-signal-booked/40 bg-signal-booked/10 px-3.5 py-2.5 text-sm text-signal-booked">
              <AlertCircle size={15} /> {error}
            </div>
          )}
          <label className="block">
            <span className="mb-1.5 block text-xs text-steel">New Password</span>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-steel">Confirm New Password</span>
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input" placeholder="••••••••" />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brass-sheen py-3 text-sm font-medium text-obsidian transition-transform duration-300 hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
