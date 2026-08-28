import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import SnippetBoard from "@/components/SnippetBoard";
import NavBar from "@/components/NavBar";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;

  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  // Sync plan status with Stripe in real-time if user has a Stripe Customer ID
  if (user.stripeCustomerId) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        if (user.plan !== "free") {
          user = await prisma.user.update({
            where: { id: userId },
            data: { plan: "free", stripeSubscriptionId: null, stripeCurrentPeriodEnd: null },
          });
        }
      } else {
        const sub = subscriptions.data[0];
        const isActive = sub.status === "active" || sub.status === "trialing";
        const newPlan = isActive ? "pro" : "free";

        if (user.plan !== newPlan || user.stripeSubscriptionId !== sub.id) {
          user = await prisma.user.update({
            where: { id: userId },
            data: {
              plan: newPlan,
              stripeSubscriptionId: sub.id,
              stripeCurrentPeriodEnd: sub.current_period_end
                ? new Date(sub.current_period_end * 1000)
                : null,
            },
          });
        }
      }
    } catch (err) {
      console.warn("Could not sync Stripe subscription status on dashboard:", err);
    }
  }

  const snippets = await prisma.snippet.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-paper">
      <NavBar plan={user.plan} email={user.email} />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-3xl">Your drawer</h1>

        <SnippetBoard
          initialSnippets={snippets.map((s) => ({
            ...s,
            createdAt: s.createdAt.toISOString(),
            updatedAt: s.updatedAt.toISOString(),
          }))}
          plan={user.plan}
        />
      </div>
    </main>
  );
}
