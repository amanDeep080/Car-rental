"use client";

import { useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { forgotPassword } from "@/services/authService";
import { CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
    } finally {
      // Always show the same success state, whether or not the email
      // matched an account — this page must not reveal which emails are
      // registered.
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link to set a new one."
      footerText="Remembered it?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      {sent ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-signal-available/40 bg-signal-available/10 p-4 text-sm text-signal-available">
          <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
          <span>If an account exists for that email, a reset link is on its way. It&apos;s valid for 30 minutes.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs text-steel">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brass-sheen py-3 text-sm font-medium text-obsidian transition-transform duration-300 hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
