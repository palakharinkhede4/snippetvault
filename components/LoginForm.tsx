"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intendedPlan = searchParams.get("plan");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Password Recovery state
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1); // 1 = enter email, 2 = answer question & new password
  const [fetchedQuestion, setFetchedQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Live password security checks for reset
  const passwordCriteria = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(newPassword) },
    { label: "At least one lowercase letter (a-z)", met: /[a-z]/.test(newPassword) },
    { label: "At least one number (0-9)", met: /[0-9]/.test(newPassword) },
    { label: "At least one special character (!@#$%^&*)", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) },
  ];
  const allCriteriaMet = passwordCriteria.every((c) => c.met);

  // Normal login handler
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
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

  // Step 1: Find security question for email
  async function handleFindQuestion(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setError("Please enter your account email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Could not find an account with that email.");
        return;
      }

      setFetchedQuestion(data.securityQuestion);
      setResetStep(2);
    } catch (err) {
      setLoading(false);
      setError("Failed to look up account. Please try again.");
    }
  }

  // Step 2: Verify answer and set new password
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!securityAnswer.trim()) {
      setError("Please provide the answer to your security question.");
      return;
    }

    if (!allCriteriaMet) {
      setError("Please ensure your new password meets all security criteria.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          securityAnswer: securityAnswer.trim(),
          newPassword,
        }),
      });
      const data = await res.json();

      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        return;
      }

      // Success: reset inputs and switch back to login mode
      setSuccessMessage("Password reset successfully! Log in with your new password.");
      setIsResetMode(false);
      setResetStep(1);
      setPassword(newPassword);
      setSecurityAnswer("");
      setNewPassword("");
      setConfirmPassword("");
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

      {successMessage && (
        <div className="mt-4 rounded-card border border-teal bg-teal/15 p-3 text-xs text-teal-dark font-medium">
          ✓ {successMessage}
        </div>
      )}

      {!isResetMode ? (
        /* NORMAL LOGIN FORM */
        <>
          <h1 className="mt-6 font-display text-2xl">Welcome back</h1>
          <p className="mt-1 text-sm text-ink/60">Log in to your account using your email and password.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
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
              <div className="flex items-center justify-between">
                <label className="block text-sm text-ink/70">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(true);
                    setResetStep(1);
                    setError("");
                    setSuccessMessage("");
                  }}
                  className="text-xs text-teal-dark hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
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
        </>
      ) : (
        /* PASSWORD RESET / RECOVERY FLOW */
        <>
          <div className="mt-6 flex items-center justify-between">
            <h1 className="font-display text-2xl">Reset Password</h1>
            <span className="rounded-full bg-amber/20 px-2.5 py-0.5 font-mono text-[10px] uppercase font-semibold text-amber-900">
              Zero-Email Recovery
            </span>
          </div>
          <p className="mt-1 text-xs text-ink/60">
            {resetStep === 1
              ? "Enter your account email to retrieve your security question."
              : "Answer your security question and set your new password."}
          </p>

          {resetStep === 1 ? (
            /* STEP 1: Enter email */
            <form onSubmit={handleFindQuestion} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm text-ink/70">Account Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus-ring mt-1 w-full rounded-card border border-ink/20 bg-white px-3 py-2 text-sm"
                />
              </div>

              {error && (
                <div className="rounded-card bg-rust/10 p-3 text-xs text-rust">
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="focus-ring w-full rounded-card bg-teal px-4 py-3 font-medium text-ink transition hover:bg-teal-dark hover:text-paper disabled:opacity-60"
              >
                {loading ? "Looking up account…" : "Find Security Question →"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setError("");
                }}
                className="w-full text-center text-xs text-ink/60 hover:text-ink pt-2"
              >
                ← Back to log in
              </button>
            </form>
          ) : (
            /* STEP 2: Answer question & set new password */
            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
              {/* Question Banner */}
              <div className="rounded-card border border-teal/30 bg-teal/10 p-3.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-teal-dark font-bold">
                  Security Question
                </span>
                <p className="mt-1 font-display text-sm font-semibold text-ink">
                  {fetchedQuestion}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink/70">Your Security Answer</label>
                <input
                  type="text"
                  required
                  placeholder="Your answer (case-insensitive)"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  className="focus-ring mt-1 w-full rounded-card border border-ink/20 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink/70">New Password</label>
                <div className="relative mt-1">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="focus-ring w-full rounded-card border border-ink/20 bg-white px-3 py-2 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-ink/50 hover:text-ink"
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Password Criteria Checklist */}
                {newPassword.length > 0 && (
                  <div className="mt-2.5 rounded-card bg-paper-dim/80 p-2.5 space-y-1 text-[11px]">
                    <p className="font-medium text-ink/70">Password Security Standards:</p>
                    {passwordCriteria.map((c, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className={c.met ? "text-teal-dark font-bold" : "text-ink/30"}>
                          {c.met ? "✓" : "○"}
                        </span>
                        <span className={c.met ? "text-ink/80" : "text-ink/50"}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-ink/70">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="focus-ring mt-1 w-full rounded-card border border-ink/20 bg-white px-3 py-2 text-sm"
                />
              </div>

              {error && (
                <div className="rounded-card bg-rust/10 p-3 text-xs text-rust">
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (newPassword.length > 0 && !allCriteriaMet)}
                className="focus-ring w-full rounded-card bg-ink px-4 py-3 font-medium text-paper transition hover:bg-ink-soft disabled:opacity-60"
              >
                {loading ? "Updating password…" : "Reset Password & Log In"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setResetStep(1);
                  setError("");
                }}
                className="w-full text-center text-xs text-ink/60 hover:text-ink pt-1"
              >
                ← Change Email
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
