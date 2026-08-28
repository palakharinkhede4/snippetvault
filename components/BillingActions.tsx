"use client";

import { useState } from "react";

export default function BillingActions({
  plan,
}: {
  plan: string;
  hasStripeCustomer?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function goToCheckout() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not start checkout.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("No checkout URL returned from server.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError("Network or server error starting checkout.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      {plan === "free" ? (
        <button
          onClick={goToCheckout}
          disabled={loading}
          className="focus-ring rounded-card bg-teal px-5 py-3 font-medium text-ink transition hover:bg-teal-dark hover:text-paper disabled:opacity-60"
        >
          {loading ? "Redirecting to Stripe…" : "Upgrade to Pro — $9/mo"}
        </button>
      ) : (
        <div className="flex items-center gap-2.5 rounded-card border border-teal/30 bg-teal/10 px-4 py-3 text-sm font-medium text-teal-dark">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal text-ink text-xs font-bold">
            ✓
          </span>
          <span>Your Pro subscription is active. All features & unlimited storage unlocked.</span>
        </div>
      )}
      {error && (
        <div className="mt-3 rounded-card bg-rust/10 p-3 text-xs text-rust">
          {error}
        </div>
      )}
    </div>
  );
}
