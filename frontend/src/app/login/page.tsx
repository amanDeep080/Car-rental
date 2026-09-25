"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import { login } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = await login(email, password);
      refresh();
      const isAdmin = auth.roles.includes("ADMIN");
      const defaultRedirect = isAdmin ? "/admin" : "/dashboard";
      router.push(searchParams.get("redirect") ?? defaultRedirect);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your bookings."
      footerText="Don't have an account?"
      footerLinkText="Create one"
      footerLinkHref="/register"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-signal-booked/40 bg-signal-booked/10 px-3.5 py-2.5 text-sm text-signal-booked">
            <AlertCircle size={15} /> {error}
          </div>
        )}
        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
          />
        </Field>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-steel hover:text-brass">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brass-sheen py-3 text-sm font-medium text-obsidian transition-transform duration-300 hover:scale-[1.01] disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <div className="pt-4 border-t border-graphite-line mt-6">
          <p className="text-center text-[10px] uppercase tracking-widest text-steel mb-3">Staff Only</p>
          <button
            type="button"
            onClick={() => {
              setEmail("admin@velocira.example.com");
              setPassword("ChangeMe123!");
            }}
            className="w-full rounded-xl border border-brass/30 bg-brass/5 py-2.5 text-xs font-600 text-brass transition-colors hover:bg-brass/10"
          >
            Admin Quick Login
          </button>
        </div>
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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
