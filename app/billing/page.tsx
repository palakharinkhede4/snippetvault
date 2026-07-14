import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";
import BillingActions from "@/components/BillingActions";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-paper">
      <NavBar plan={user.plan} email={user.email} />
      <div className="mx-auto max-w-xl px-6 py-10">
        <h1 className="font-display text-3xl">Billing</h1>

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
