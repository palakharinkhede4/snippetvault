"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function NavBar({ plan, email }: { plan: string; email: string }) {
  return (
    <header className="border-b border-ink/10 bg-paper">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="font-display text-lg italic text-ink">
          Cache
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <span className="hidden text-ink/50 sm:inline">{email}</span>
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
              plan === "pro" ? "bg-teal text-ink" : "bg-ink/10 text-ink/60"
            }`}
          >
            {plan}
          </span>
          <Link href="/billing" className="text-ink/70 hover:text-ink">
            Billing
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="focus-ring text-ink/70 hover:text-ink"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
