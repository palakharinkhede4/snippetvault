import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import AccountSettings from "@/components/AccountSettings";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      snippets: {
        select: { id: true },
      },
    },
  });

  if (!user) redirect("/login");

  const userProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    snippetCount: user.snippets.length,
    createdAt: user.createdAt.toISOString(),
    stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd
      ? user.stripeCurrentPeriodEnd.toISOString()
      : null,
  };

  return (
    <main className="min-h-screen bg-paper">
      <NavBar plan={user.plan} email={user.email} />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-ink/60 hover:text-ink">
          ← Back to your drawer
        </Link>

        <h1 className="mt-3 font-display text-3xl text-ink">Manage Account</h1>
        <p className="mt-1 text-sm text-ink/60">
          Manage your credentials, view account status, and configure security preferences.
        </p>

        <div className="mt-8">
          <AccountSettings user={userProfile} />
        </div>
      </div>
    </main>
  );
}
