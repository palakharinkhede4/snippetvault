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
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not start checkout.");
      return;
    }
    window.location.href = data.url;
  }

  async function goToPortal() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not open the billing portal.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="mt-6">
      {plan === "free" ? (
        <button
          onClick={goToCheckout}
          disabled={loading}
          className="focus-ring rounded-card bg-teal px-5 py-3 font-medium text-ink transition hover:bg-teal-dark hover:text-paper disabled:opacity-60"
        >
          {loading ? "Redirecting…" : "Upgrade to Pro — $9/mo"}
        </button>
      ) : (
        <button
          onClick={goToPortal}
          disabled={loading || !hasStripeCustomer}
          className="focus-ring rounded-card border border-ink px-5 py-3 font-medium text-ink transition hover:bg-ink hover:text-paper disabled:opacity-60"
        >
          {loading ? "Opening…" : "Manage or cancel subscription"}
        </button>
      )}
      {error && <p className="mt-3 text-sm text-rust">{error}</p>}
    </div>
  );
}
