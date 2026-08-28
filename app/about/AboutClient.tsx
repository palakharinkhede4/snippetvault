"use client";

import { useState } from "react";
import Link from "next/link";

interface FlowStep {
  title: string;
  badge: string;
  description: string;
  tech: string;
  codeSnippet?: string;
}

interface FlowData {
  id: string;
  name: string;
  subtitle: string;
  steps: FlowStep[];
}

const ARCHITECTURE_FLOWS: FlowData[] = [
  {
    id: "snippet-lifecycle",
    name: "1. Snippet Lifecycle & Plan Gate",
    subtitle: "Server-side enforced quota validation, PostgreSQL persistence & optimistic UI updates",
    steps: [
      {
        title: "User Submits Snippet",
        badge: "Client UI",
        tech: "React 18 • SnippetBoard.tsx",
        description:
          "User types title, body content, and comma-separated tags in the dashboard card creator and hits Save.",
        codeSnippet: `const res = await fetch("/api/snippets", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title, content, tags, isPublic }),
});`,
      },
      {
        title: "Server Authentication & Quota Gate",
        badge: "API Route",
        tech: "Next.js Route Handler • /api/snippets/route.ts",
        description:
          "The server extracts the NextAuth JWT session. If user.plan === 'free', it queries the count of existing snippets. If count >= 5, returns HTTP 403 with plan upgrade prompt.",
        codeSnippet: `if (user.plan !== "pro") {
  const count = await prisma.snippet.count({ where: { userId } });
  if (count >= FREE_PLAN_SNIPPET_LIMIT) {
    return NextResponse.json(
      { error: "Free plan is limited to 5 snippets. Upgrade to Pro for unlimited." },
      { status: 403 }
    );
  }
}`,
      },
      {
        title: "Prisma ORM & PostgreSQL Commit",
        badge: "Database Layer",
        tech: "Prisma Client • Neon PostgreSQL",
        description:
          "If valid, Prisma creates a new Snippet record tied to userId with cuid() primary key, timestamps, and indexes.",
        codeSnippet: `const snippet = await prisma.snippet.create({
  data: { title, content, tags, isPublic, userId },
});`,
      },
      {
        title: "Instant UI Update & Search Index",
        badge: "Client State",
        tech: "Optimistic React State",
        description:
          "The new snippet is appended to the active list immediately, automatically indexed for client-side search filtering.",
      },
    ],
  },
  {
    id: "stripe-billing",
    name: "2. Stripe Subscriptions & Self-Healing Webhooks",
    subtitle: "End-to-end checkout, automated webhook ingestion, and resilient direct-session fallback",
    steps: [
      {
        title: "Checkout Session Initialization",
        badge: "Billing Route",
        tech: "Stripe API • /api/stripe/checkout/route.ts",
        description:
          "User clicks 'Go Pro'. Next.js creates a Stripe Checkout Session with subscription mode, metadata containing userId, and returns the Stripe hosted URL.",
        codeSnippet: `const checkoutSession = await stripe.checkout.sessions.create({
  mode: "subscription",
  customer: user.stripeCustomerId || undefined,
  line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
  metadata: { userId: user.id },
  success_url: \`\${appUrl}/billing?session_id={CHECKOUT_SESSION_ID}\`,
  cancel_url: \`\${appUrl}/billing\`,
});`,
      },
      {
        title: "Webhook Ingestion & Signature Verification",
        badge: "Webhook Handler",
        tech: "Stripe Webhook • /api/stripe/webhook/route.ts",
        description:
          "Stripe fires 'checkout.session.completed' and 'invoice.paid'. The endpoint validates stripe-signature using STRIPE_WEBHOOK_SECRET and elevates the user's plan to 'pro'.",
        codeSnippet: `await prisma.user.update({
  where: { id: userId },
  data: {
    plan: "pro",
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
  },
});`,
      },
      {
        title: "Self-Healing Client Reconciliation",
        badge: "Fail-Safe Mechanism",
        tech: "Server Component • app/billing/page.tsx",
        description:
          "If webhooks are delayed or offline (e.g. local development without stripe-cli), the success redirect inspects ?session_id, queries Stripe API directly, and instantly reconciles the database.",
        codeSnippet: `if (searchParams.session_id) {
  await reconcileFromCheckoutSession(searchParams.session_id, userId);
}`,
      },
      {
        title: "Stripe Customer Portal Management",
        badge: "Self-Serve Billing",
        tech: "Stripe Portal • /api/stripe/portal/route.ts",
        description:
          "Pro users can update payment cards, view invoices, or cancel anytime through Stripe's hosted billing portal.",
      },
    ],
  },
  {
    id: "auth-security",
    name: "3. Hybrid Auth & Email Verification",
    subtitle: "NextAuth credentials with bcrypt hashing, email sanitization, and OTP verification pipelines",
    steps: [
      {
        title: "Input Validation & Strict Email Sanitization",
        badge: "Security Layer",
        tech: "lib/emailValidation.ts • lib/passwordValidation.ts",
        description:
          "Emails are trimmed, lowercased, validated for MX records & syntax, while passwords are evaluated for complexity standards (8+ chars, mix of cases and numbers).",
      },
      {
        title: "Password Hashing with Bcrypt",
        badge: "Cryptography",
        tech: "bcryptjs (10 salt rounds)",
        description:
          "Passwords are never stored in plaintext. Bcrypt generates salted one-way hashes before inserting into User.passwordHash.",
        codeSnippet: `const passwordHash = await bcrypt.hash(password, 10);
await prisma.user.create({
  data: { email: normalizedEmail, passwordHash, plan: "free" },
});`,
      },
      {
        title: "Transactional OTP Dispatch (Optional/2FA)",
        badge: "Email Provider",
        tech: "Resend API / SMTP Nodemailer",
        description:
          "When OTP login/verification is requested, a cryptographically random 6-digit code is hashed and stored in OtpToken with a 10-minute TTL, then dispatched via email.",
      },
      {
        title: "Stateless JWT Session Issuance",
        badge: "Session Manager",
        tech: "NextAuth.js JWT (30-day lifespan)",
        description:
          "On successful credential verification, NextAuth issues an encrypted JWT cookie containing userId and email, enabling fast, stateless server-side authentication without database session queries.",
      },
    ],
  },
  {
    id: "public-share",
    name: "4. Zero-Auth Public Snippet Sharing",
    subtitle: "Unique cryptographic URLs, responsive card rendering, and frictionless team handoffs",
    steps: [
      {
        title: "Toggle Snippet Visibility",
        badge: "Privacy Switch",
        tech: "PATCH /api/snippets/[id]",
        description:
          "Owner flips the 'Public' toggle on any snippet card. The server updates `isPublic: true`.",
      },
      {
        title: "Dynamic Slug Routing",
        badge: "Next.js App Router",
        tech: "Server Component • app/s/[id]/page.tsx",
        description:
          "A unique link `/s/{id}` is generated. When visited by anyone on the internet, Next.js Server Components query Postgres directly with zero authentication required.",
        codeSnippet: `const snippet = await prisma.snippet.findUnique({
  where: { id: params.id },
});
if (!snippet || !snippet.isPublic) notFound();`,
      },
      {
        title: "Distraction-Free Card Catalog View",
        badge: "Shared UI",
        tech: "Responsive Styled Card",
        description:
          "Recipient views formatted syntax, categorized tags, and can copy the raw snippet to clipboard in one click.",
      },
    ],
  },
];

export default function AboutClient() {
  const [activeTab, setActiveTab] = useState(ARCHITECTURE_FLOWS[0].id);
  const [copiedClone, setCopiedClone] = useState(false);

  const currentFlow = ARCHITECTURE_FLOWS.find((f) => f.id === activeTab) || ARCHITECTURE_FLOWS[0];

  const handleCopyClone = () => {
    navigator.clipboard.writeText("git clone https://github.com/palakharinkhede4/snippetvault.git");
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2500);
  };

  return (
    <div className="space-y-16">
      {/* Quick Action Banner */}
      <div className="rounded-card border border-ink/15 bg-ink p-6 text-paper shadow-md">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber">
              Open Source Codebase
            </span>
            <h3 className="mt-1 font-display text-xl text-paper">
              Explore SnippetVault on GitHub
            </h3>
            <p className="mt-1 text-xs text-paper/70">
              Full-stack production Next.js 14 codebase with Prisma, NextAuth, Stripe & PostgreSQL.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-card border border-paper/20 bg-ink-soft px-3 py-1.5 font-mono text-xs text-paper/90">
              <span className="mr-2 text-teal">$</span>
              <span className="text-[11px] sm:text-xs">git clone https://github.com/palakharinkhede4/snippetvault.git</span>
              <button
                onClick={handleCopyClone}
                className="ml-3 rounded bg-teal/20 px-2 py-0.5 text-[10px] uppercase font-bold text-teal hover:bg-teal/30 transition"
              >
                {copiedClone ? "✓ Copied" : "Copy"}
              </button>
            </div>

            <a
              href="https://github.com/palakharinkhede4/snippetvault"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-2 rounded-card bg-teal px-4 py-2 text-xs font-semibold text-ink transition hover:bg-teal-dark hover:text-paper"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Star Repository
            </a>
          </div>
        </div>
      </div>

      {/* Interactive System Workflow Visualizer */}
      <section className="rounded-card border border-ink/15 bg-white/60 p-6 md:p-8">
        <div className="flex flex-col gap-2 border-b border-ink/10 pb-6">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-teal-dark">
            Interactive Architecture & Data Pipelines
          </span>
          <h2 className="font-display text-2xl md:text-3xl text-ink">
            Core Engine Workflows
          </h2>
          <p className="text-sm text-ink/70">
            Select a pipeline to inspect step-by-step logic, security gates, and code implementations.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="mt-6 flex flex-wrap gap-2">
          {ARCHITECTURE_FLOWS.map((flow) => (
            <button
              key={flow.id}
              onClick={() => setActiveTab(flow.id)}
              className={`rounded-card px-4 py-2.5 text-xs font-mono transition text-left ${
                activeTab === flow.id
                  ? "bg-ink text-paper shadow-sm font-semibold"
                  : "bg-paper border border-ink/15 text-ink/80 hover:bg-paper-dim hover:text-ink"
              }`}
            >
              {flow.name}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        <div className="mt-8">
          <div className="mb-6 rounded-card border-l-4 border-teal bg-teal/10 p-4">
            <h4 className="font-display text-lg text-ink font-semibold">{currentFlow.name}</h4>
            <p className="mt-1 text-xs text-ink/75 font-mono">{currentFlow.subtitle}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {currentFlow.steps.map((step, idx) => (
              <div
                key={idx}
                className="relative flex flex-col justify-between rounded-card border border-ink/10 bg-paper p-5 transition hover:border-ink/30 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-amber">
                      STEP 0{idx + 1}
                    </span>
                    <span className="rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[10px] uppercase text-ink/70">
                      {step.badge}
                    </span>
                  </div>

                  <h5 className="mt-2 font-display text-lg text-ink">{step.title}</h5>
                  <p className="mt-1 font-mono text-[11px] text-teal-dark">{step.tech}</p>
                  <p className="mt-3 text-xs leading-relaxed text-ink/80">{step.description}</p>
                </div>

                {step.codeSnippet && (
                  <div className="mt-4">
                    <div className="rounded-card bg-ink p-3 text-paper font-mono text-[11px] overflow-x-auto">
                      <pre>{step.codeSnippet}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Database Schema Visualizer */}
      <section className="rounded-card border border-ink/15 bg-paper-dim/50 p-6 md:p-8">
        <div className="border-b border-ink/10 pb-4">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-rust">
            Data Architecture & Entity Relationships
          </span>
          <h2 className="mt-1 font-display text-2xl md:text-3xl text-ink">
            Prisma PostgreSQL Schema
          </h2>
          <p className="mt-1 text-sm text-ink/70">
            Relational model schema with cascading referential integrity, unique constraints, and performance indexes.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* User Model */}
          <div className="rounded-card border border-ink/20 bg-paper p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-ink/15 pb-2">
              <span className="font-display font-semibold text-ink">User</span>
              <span className="font-mono text-[10px] text-teal-dark uppercase">Model</span>
            </div>
            <ul className="mt-3 space-y-2 font-mono text-xs text-ink/80">
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>id</span>
                <span className="text-ink/50">String @id (cuid)</span>
              </li>
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>email</span>
                <span className="text-teal-dark font-medium">String @unique</span>
              </li>
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>passwordHash</span>
                <span className="text-ink/50">String?</span>
              </li>
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>emailVerified</span>
                <span className="text-ink/50">Boolean (false)</span>
              </li>
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>plan</span>
                <span className="text-amber font-semibold">String ("free"|"pro")</span>
              </li>
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>stripeCustomerId</span>
                <span className="text-ink/50">String? @unique</span>
              </li>
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>stripeSubId</span>
                <span className="text-ink/50">String? @unique</span>
              </li>
              <li className="flex justify-between">
                <span>snippets</span>
                <span className="text-rust font-medium">Snippet[] (1:N)</span>
              </li>
            </ul>
          </div>

          {/* Snippet Model */}
          <div className="rounded-card border-2 border-teal bg-paper p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-teal/20 pb-2">
              <span className="font-display font-semibold text-ink">Snippet</span>
              <span className="font-mono text-[10px] text-teal-dark uppercase">Primary Entity</span>
            </div>
            <ul className="mt-3 space-y-2 font-mono text-xs text-ink/80">
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>id</span>
                <span className="text-ink/50">String @id (cuid)</span>
              </li>
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>title</span>
                <span className="text-ink">String</span>
              </li>
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>content</span>
                <span className="text-ink">String (Text)</span>
              </li>
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>tags</span>
                <span className="text-teal-dark">String (CSV)</span>
              </li>
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>isPublic</span>
                <span className="text-amber">Boolean (false)</span>
              </li>
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>userId</span>
                <span className="text-rust font-medium">String (FK)</span>
              </li>
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>user</span>
                <span className="text-ink/50">User (Cascade)</span>
              </li>
              <li className="flex justify-between text-[11px] text-ink/50 italic">
                <span>@@index([userId])</span>
                <span>Fast Foreign Lookup</span>
              </li>
            </ul>
          </div>

          {/* OtpToken Model */}
          <div className="rounded-card border border-ink/20 bg-paper p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-ink/15 pb-2">
              <span className="font-display font-semibold text-ink">OtpToken</span>
              <span className="font-mono text-[10px] text-rust uppercase">Auth Temporary</span>
            </div>
            <ul className="mt-3 space-y-2 font-mono text-xs text-ink/80">
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>id</span>
                <span className="text-ink/50">String @id (cuid)</span>
              </li>
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>email</span>
                <span className="text-teal-dark font-medium">String</span>
              </li>
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>codeHash</span>
                <span className="text-ink/50">String (Salted)</span>
              </li>
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>expiresAt</span>
                <span className="text-rust">DateTime (TTL 10m)</span>
              </li>
              <li className="flex justify-between border-b border-dashed border-ink/10 pb-1">
                <span>createdAt</span>
                <span className="text-ink/50">DateTime (now())</span>
              </li>
              <li className="flex justify-between text-[11px] text-ink/50 italic">
                <span>@@index([email])</span>
                <span>Fast Index Lookup</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
