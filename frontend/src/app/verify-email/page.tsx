"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { verifyEmail, resendOtp } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuthStore();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Email is missing from the URL.");
      return;
    }
    setError(null);
    setResendStatus(null);
    setLoading(true);
    try {
      await verifyEmail(email, otp);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email || resending) return;
    setResending(true);
    setError(null);
    setResendStatus(null);
    try {
      await resendOtp(email);
      setResendStatus("A new code has been sent!");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle={`We've sent a 6-digit code to ${email || 'your email'}.`}
    >
      {success ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-xl font-700 text-ivory">Verified!</h2>
          <p className="mt-2 text-sm text-steel">Redirecting you to login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-signal-booked/40 bg-signal-booked/10 px-3.5 py-2.5 text-sm text-signal-booked">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {resendStatus && (
            <div className="flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-3.5 py-2.5 text-sm text-green-500">
              <CheckCircle2 size={15} /> {resendStatus}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs text-steel uppercase tracking-widest font-600">Verification Code</label>
            <input
              required
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full bg-graphite-raised border border-graphite-line rounded-xl px-4 py-4 text-center text-2xl font-mono tracking-[0.5em] text-brass focus:border-brass outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full rounded-full bg-brass-sheen py-3.5 text-sm font-medium text-obsidian transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Account"}
          </button>

          <p className="text-center text-xs text-steel">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-brass hover:underline disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend"}
            </button>
          </p>
        </form>
      )}
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
