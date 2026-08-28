"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { SECURITY_QUESTIONS } from "@/lib/securityQuestions";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intendedPlan = searchParams.get("plan");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState<string>(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Live password security checks
  const passwordCriteria = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "At least one number (0-9)", met: /[0-9]/.test(password) },
    { label: "At least one special character (!@#$%^&*)", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  const allCriteriaMet = passwordCriteria.every((c) => c.met);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!allCriteriaMet) {
      setError("Please ensure your password meets all security criteria.");
      return;
    }

    if (!securityAnswer.trim() || securityAnswer.trim().length < 2) {
      setError("Please provide an answer to your security question (at least 2 characters).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.trim(),
          password,
          securityQuestion,
          securityAnswer: securityAnswer.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      setLoading(false);

      if (signInRes?.error) {
        setError("Account created, but sign-in failed. Try logging in.");
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
      <div className="flex items-center justify-between">
        <Link href="/" className="font-display text-xl italic text-ink">
          SnippetVault
        </Link>
        <Link
          href="/about"
          className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-teal/40 bg-teal/10 px-2.5 py-0.5 font-mono text-[11px] font-medium text-teal-dark hover:border-teal hover:bg-teal/20 transition"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
          About Project
        </Link>
      </div>
      <h1 className="mt-6 font-display text-2xl">Start your drawer</h1>
      <p className="mt-1 text-sm text-ink/60">Free forever for up to 5 snippets.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm text-ink/70">Name (optional)</label>
          <input
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="focus-ring mt-1 w-full rounded-card border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>

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
          <p className="mt-1 text-[11px] text-ink/40">Must be a real email address with active mail servers.</p>
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

          {/* Password Security Standard Checklist */}
          {password.length > 0 && (
            <div className="mt-3 rounded-card bg-paper-dim/80 p-3 space-y-1.5 text-xs">
              <p className="font-medium text-ink/70">Password Security Standards:</p>
              {passwordCriteria.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={c.met ? "text-teal-dark font-bold" : "text-ink/30"}>
                    {c.met ? "✓" : "○"}
                  </span>
                  <span className={c.met ? "text-ink/80" : "text-ink/50"}>{c.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Question for Zero-Email Password Recovery */}
        <div className="border-t border-dashed border-ink/15 pt-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-teal-dark font-mono">
              Account Recovery Question
            </label>
            <span className="text-[10px] text-ink/50 font-mono">Zero-Email Reset</span>
          </div>
          <p className="mt-1 text-xs text-ink/60">
            Used to securely reset your password if you ever forget it.
          </p>

          <select
            value={securityQuestion}
            onChange={(e) => setSecurityQuestion(e.target.value)}
            className="focus-ring mt-2 w-full rounded-card border border-ink/20 bg-white px-3 py-2 text-xs"
          >
            {SECURITY_QUESTIONS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>

          <input
            type="text"
            required
            placeholder="Your secret answer (case-insensitive)"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
            className="focus-ring mt-2 w-full rounded-card border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>

        {error && (
          <div className="rounded-card bg-rust/10 p-3 text-sm text-rust">
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (password.length > 0 && !allCriteriaMet)}
          className="focus-ring w-full rounded-card bg-ink px-4 py-3 font-medium text-paper transition hover:bg-ink-soft disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Already have an account?{" "}
        <Link href="/login" className="text-teal-dark underline underline-offset-4 font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
