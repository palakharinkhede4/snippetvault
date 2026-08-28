"use client";

import { useState } from "react";

export default function BillingActions({
  plan,
  hasStripeCustomer,
}: {
  plan: string;
  hasStripeCustomer: boolean;
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

  async function goToPortal() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not open the billing portal.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("No portal URL returned.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError("Network or server error opening billing portal.");
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
        <button
          onClick={goToPortal}
          disabled={loading || !hasStripeCustomer}
          className="focus-ring rounded-card border border-ink px-5 py-3 font-medium text-ink transition hover:bg-ink hover:text-paper disabled:opacity-60"
        >
          {loading ? "Opening Stripe Portal…" : "Manage or cancel subscription"}
        </button>
      )}
      {error && (
        <div className="mt-3 rounded-card bg-rust/10 p-3 text-xs text-rust">
          {error}
        </div>
      )}
    </div>
  );
}
