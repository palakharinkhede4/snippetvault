"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intendedPlan = searchParams.get("plan");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const signInRes = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      setLoading(false);

      if (signInRes?.error) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      if (intendedPlan === "pro") {
        router.push("/billing?upgrade=1");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="font-display text-xl italic text-ink">
        SnippetVault
      </Link>
      
      <h1 className="mt-6 font-display text-2xl">Welcome back</h1>
      <p className="mt-1 text-sm text-ink/60">Log in to your account using your email and password.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm text-ink/70">Email address</label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus-ring mt-1 w-full rounded-card border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-ink/70">Password</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring w-full rounded-card border border-ink/20 bg-white px-3 py-2 pr-10 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-ink/50 hover:text-ink"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-card bg-rust/10 p-3 text-sm text-rust">
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="focus-ring w-full rounded-card bg-ink px-4 py-3 font-medium text-paper transition hover:bg-ink-soft disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Log In"}
        </button>

        <p className="mt-6 text-center text-sm text-ink/60">
          No account yet?{" "}
          <Link href="/signup" className="text-teal-dark underline underline-offset-4 font-medium">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
