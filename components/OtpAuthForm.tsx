"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function OtpAuthForm({ mode = "login" }: { mode?: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intendedPlan = searchParams.get("plan");

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP to email
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Failed to send verification code.");
        return;
      }

      setSuccessMsg(data.message || "Verification code sent to your email.");
      setStep("otp");
    } catch (err) {
      setLoading(false);
      setError("Something went wrong. Please check your connection.");
    }
  }

  // Step 2: Verify OTP and sign in
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const signInRes = await signIn("credentials", {
      email,
      otp,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      setError("Invalid or expired verification code. Please try again.");
      return;
    }

    if (intendedPlan === "pro") {
      router.push("/billing?upgrade=1");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="font-display text-xl italic text-ink">
        SnippetVault
      </Link>
      
      <h1 className="mt-6 font-display text-2xl">
        {mode === "signup" ? "Start your drawer" : "Welcome to SnippetVault"}
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        {step === "email"
          ? "Enter your email to receive a 6-digit sign-in code."
          : `Enter the 6-digit code sent to ${email}`}
      </p>

      {step === "email" ? (
        <form onSubmit={handleSendOtp} className="mt-8 space-y-4">
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

          {error && <p className="text-sm text-rust">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="focus-ring w-full rounded-card bg-ink px-4 py-3 font-medium text-paper transition hover:bg-ink-soft disabled:opacity-60"
          >
            {loading ? "Sending verification code…" : "Continue with Email Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm text-ink/70">6-Digit Code</label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              className="focus-ring mt-1 w-full rounded-card border border-ink/20 bg-white px-3 py-2 text-center font-mono text-xl tracking-widest"
            />
          </div>

          {successMsg && <p className="text-xs text-teal-dark">{successMsg}</p>}
          {error && <p className="text-sm text-rust">{error}</p>}

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="focus-ring w-full rounded-card bg-ink px-4 py-3 font-medium text-paper transition hover:bg-ink-soft disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Sign In"}
          </button>

          <div className="flex items-center justify-between text-xs text-ink/60 pt-2">
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError("");
                setSuccessMsg("");
              }}
              className="underline hover:text-ink"
            >
              ← Change email
            </button>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="underline hover:text-ink"
            >
              Resend code
            </button>
          </div>
        </form>
      )}

      <p className="mt-8 text-center text-xs text-ink/40">
        No password needed. A secure one-time code will be sent to your real email address.
      </p>
    </div>
  );
}
