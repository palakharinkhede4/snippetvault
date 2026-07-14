import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is not set — billing routes will fail until it is.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-06-20",
});

export const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || "";
export const FREE_PLAN_SNIPPET_LIMIT = 5;
