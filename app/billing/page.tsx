import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import BillingActions from "@/components/BillingActions";
import { stripe } from "@/lib/stripe";

// Fallback path: if Stripe's webhook hasn't reached this server yet (very common in local
// dev if `stripe listen` isn't running, or its secret is stale), verify the checkout
// session directly with Stripe's API on the success redirect and self-heal the DB.
// The webhook remains the source of truth for renewals/cancellations — this only covers
// the initial upgrade moment.
async function reconcileFromCheckoutSession(sessionId: string, expectedUserId: string) {
  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (checkoutSession.metadata?.userId && checkoutSession.metadata.userId !== expectedUserId) {
      console.warn("User ID mismatch on checkout session:", checkoutSession.metadata.userId, "expected:", expectedUserId);
      return;
    }

    let subscriptionId: string | undefined;
    let currentPeriodEnd: Date | null = null;
    let customerId: string | undefined = typeof checkoutSession.customer === "string"
      ? checkoutSession.customer
      : checkoutSession.customer?.id || undefined;

    const sub = checkoutSession.subscription;
    if (typeof sub === "string") {
      const retrievedSub = await stripe.subscriptions.retrieve(sub);
      subscriptionId = retrievedSub.id;
      currentPeriodEnd = new Date(retrievedSub.current_period_end * 1000);
    } else if (sub && typeof sub === "object") {
      subscriptionId = sub.id;
      currentPeriodEnd = new Date(sub.current_period_end * 1000);
    }

    await prisma.user.update({
      where: { id: expectedUserId },
      data: {
        plan: "pro",
        ...(customerId ? { stripeCustomerId: customerId } : {}),
        ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
        ...(currentPeriodEnd ? { stripeCurrentPeriodEnd: currentPeriodEnd } : {}),
      },
    });
  } catch (err) {
    console.error("Could not reconcile checkout session:", err);
  }
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { session_id?: string; upgraded?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;

  if (searchParams.session_id) {
    await reconcileFromCheckoutSession(searchParams.session_id, userId);
  }

  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  // Secondary fallback: if still on free plan but user has a Stripe Customer ID, check if they have an active subscription
  if (user.plan === "free" && user.stripeCustomerId) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const activeSub = subscriptions.data[0];
        user = await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "pro",
            stripeSubscriptionId: activeSub.id,
            stripeCurrentPeriodEnd: new Date(activeSub.current_period_end * 1000),
          },
        });
      }
    } catch (err) {
      console.warn("Could not check customer subscriptions for user:", err);
    }
  }

  const justUpgraded = Boolean(searchParams.session_id || searchParams.upgraded) && user.plan === "pro";

  return (
    <main className="min-h-screen bg-paper">
      <NavBar plan={user.plan} email={user.email} />
      <div className="mx-auto max-w-xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-ink/60 hover:text-ink">
          ← Back to your drawer
        </Link>

        <h1 className="mt-3 font-display text-3xl">Billing</h1>

        {justUpgraded && (
          <div className="mt-4 flex items-center justify-between rounded-card border border-teal bg-teal/10 p-4">
            <p className="text-sm text-ink">
              <span className="font-medium">You're on Pro now</span> — unlimited snippets, unlocked.
            </p>
            <Link
              href="/dashboard"
              className="focus-ring shrink-0 rounded-card bg-teal px-4 py-2 text-sm font-medium text-ink hover:bg-teal-dark hover:text-paper"
            >
              Go to your drawer →
            </Link>
          </div>
        )}

        <div className="mt-6 rounded-card border border-ink/15 bg-white/50 p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">Current plan</p>
          <p className="mt-2 font-display text-2xl capitalize">{user.plan}</p>
          {user.plan === "pro" && user.stripeCurrentPeriodEnd && (
            <p className="mt-1 text-sm text-ink/60">
              Renews {new Date(user.stripeCurrentPeriodEnd).toLocaleDateString()}
            </p>
          )}
          <p className="mt-4 text-sm text-ink/70">
            {user.plan === "pro"
              ? "Unlimited snippets, priority support."
              : "Up to 5 saved snippets. Upgrade any time — no downtime, no data loss."}
          </p>

          <BillingActions plan={user.plan} hasStripeCustomer={Boolean(user.stripeCustomerId)} />
        </div>
      </div>
    </main>
  );
}
