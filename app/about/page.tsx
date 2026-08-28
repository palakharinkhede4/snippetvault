import Link from "next/link";
import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About SnippetVault — Architecture, Working & Creator",
  description:
    "Explore the engineering, system architecture, database schema, and creator details for SnippetVault by Palak Harinkhede.",
};

const TECH_STACK = [
  {
    category: "Frontend Framework",
    name: "Next.js 14 (App Router)",
    detail: "React Server Components (RSC), dynamic routing, and fast edge rendering.",
    tag: "v14.2",
    badgeColor: "bg-ink text-paper",
  },
  {
    category: "Language",
    name: "TypeScript",
    detail: "Strict type safety across API routes, Prisma models, and client state.",
    tag: "v5.5",
    badgeColor: "bg-teal text-ink font-semibold",
  },
  {
    category: "Styling & Design System",
    name: "Tailwind CSS",
    detail: "Custom card catalog theme with tactile paper textures and vintage editorial fonts.",
    tag: "v3.4",
    badgeColor: "bg-paper-dim text-ink border border-ink/20",
  },
  {
    category: "Database & ORM",
    name: "Prisma + PostgreSQL (Neon)",
    detail: "Serverless pooled Postgres connections, migrations, and type-safe relational queries.",
    tag: "Prisma 5.20",
    badgeColor: "bg-ink text-paper",
  },
  {
    category: "Authentication",
    name: "NextAuth.js (JWT)",
    detail: "Stateless 30-day JWT sessions, Bcrypt password hashing, and email validation.",
    tag: "v4.24",
    badgeColor: "bg-amber text-ink font-semibold",
  },
  {
    category: "Monetization & Billing",
    name: "Stripe Subscriptions",
    detail: "Checkout sessions, webhook ingestion, self-healing sync, and Billing Portal.",
    tag: "Stripe v16",
    badgeColor: "bg-teal-dark text-paper",
  },
  {
    category: "Email Delivery",
    name: "Resend API & SMTP",
    detail: "Transactional OTP verification emails with instant inbox dispatch.",
    tag: "Resend / SMTP",
    badgeColor: "bg-rust text-paper",
  },
  {
    category: "Hosting & CI/CD",
    name: "Vercel Edge Platform",
    detail: "Automated Git deployment pipelines, zero-cold-start serverless functions.",
    tag: "Cloud Native",
    badgeColor: "bg-ink text-paper",
  },
];

const API_ENDPOINTS = [
  {
    method: "GET / POST",
    path: "/api/snippets",
    auth: "Required (JWT)",
    description: "Fetch user's snippets or create a new snippet with server-side 5-snippet plan quota gate.",
  },
  {
    method: "PATCH / DELETE",
    path: "/api/snippets/[id]",
    auth: "Required (JWT)",
    description: "Update snippet contents/tags, toggle public visibility, or permanently delete snippet.",
  },
  {
    method: "GET",
    path: "/s/[id]",
    auth: "Public (Zero-Auth)",
    description: "Public landing page for shared snippets with distraction-free syntax rendering.",
  },
  {
    method: "POST",
    path: "/api/register",
    auth: "Public",
    description: "Create account with email sanitization, password complexity check & bcrypt salt hashing.",
  },
  {
    method: "POST",
    path: "/api/auth/send-otp",
    auth: "Public",
    description: "Generate cryptographically secure 6-digit OTP token and dispatch via email.",
  },
  {
    method: "POST",
    path: "/api/stripe/checkout",
    auth: "Required (JWT)",
    description: "Create hosted Stripe Checkout Session for $9/mo Pro recurring subscription.",
  },
  {
    method: "POST",
    path: "/api/stripe/webhook",
    auth: "Stripe Signature",
    description: "Listen to checkout.session.completed, invoice.paid, and customer.subscription events.",
  },
  {
    method: "POST",
    path: "/api/stripe/portal",
    auth: "Required (JWT)",
    description: "Generate Stripe Customer Portal session for subscription cancellation and payment updates.",
  },
];

export default function AboutProjectPage() {
  return (
    <main className="min-h-screen bg-paper text-ink pb-24">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display text-xl italic tracking-tight text-ink hover:opacity-80 transition">
              SnippetVault
            </Link>
            <span className="rounded-full bg-teal/15 px-2.5 py-0.5 font-mono text-[10px] uppercase font-semibold text-teal-dark">
              Architecture & Overview
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="hidden text-ink/70 hover:text-ink sm:inline">
              Home
            </Link>
            <Link href="/dashboard" className="text-ink/70 hover:text-ink">
              Dashboard
            </Link>
            <a
              href="https://github.com/palakharinkhede4/snippetvault"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring rounded-card bg-ink px-4 py-1.5 text-xs font-medium text-paper transition hover:bg-ink-soft"
            >
              GitHub Repo ↗
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-ink/10 bg-ink text-paper py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-amber">
              Project Blueprint & Creator Dossier
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl md:text-6xl text-paper">
              How SnippetVault was engineered: <em className="italic text-teal">from concept to cloud</em>.
            </h1>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-paper/80">
              A deep dive into the system design, relational database models, authentication guardrails, Stripe billing webhooks, and the philosophy behind this developer card catalog.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-16">
        
        {/* Creator & Owner Profile Section */}
        <section className="rounded-card border-2 border-teal/40 bg-white/70 p-6 md:p-10 shadow-sm">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Monogram Avatar */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-card bg-ink text-paper font-display text-3xl italic shadow-md border-2 border-amber">
                PH
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-3xl font-semibold text-ink">Palak Harinkhede</h2>
                  <span className="rounded-full bg-teal/15 px-3 py-1 font-mono text-[11px] uppercase tracking-wide font-bold text-teal-dark">
                    Project Creator & Architect
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-ink/60">
                  Full Stack Engineer • Cloud Architect • Open Source Builder
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink/80">
                  Hi! I'm <strong>Palak Harinkhede</strong>, the author and creator of SnippetVault. I designed SnippetVault to eradicate the friction of lost code snippets, terminal commands, and AI prompts that engineers constantly rewrite from memory. Every layer of this project — from the tactile card catalog UI to the resilient Stripe webhook reconciliation and server-gated Prisma backend — was engineered with craft, speed, and reliability.
                </p>

                {/* Badges / Skills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["Next.js 14", "React 18", "TypeScript", "Prisma ORM", "PostgreSQL", "NextAuth.js", "Stripe API", "Tailwind CSS", "System Design", "Vercel"].map((skill) => (
                    <span key={skill} className="rounded-card border border-ink/15 bg-paper px-2.5 py-0.5 font-mono text-[10px] text-ink/70">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Social & Connect Links */}
            <div className="flex flex-col gap-3 min-w-[220px] shrink-0 border-t border-ink/10 pt-4 md:border-t-0 md:border-l md:border-ink/10 md:pl-8 md:pt-0">
              <span className="font-mono text-[11px] uppercase tracking-wider text-ink/50">
                Connect & Socials
              </span>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/palakharinkhede/"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring flex items-center justify-between rounded-card border border-ink/15 bg-paper px-4 py-2.5 text-xs font-semibold text-ink transition hover:border-teal hover:bg-teal/10 hover:text-teal-dark"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>LinkedIn Profile</span>
                </div>
                <span>↗</span>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/palakharinkhede4"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring flex items-center justify-between rounded-card border border-ink/15 bg-paper px-4 py-2.5 text-xs font-semibold text-ink transition hover:border-ink hover:bg-ink hover:text-paper"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub Profile</span>
                </div>
                <span>↗</span>
              </a>

              {/* GitHub Repository */}
              <a
                href="https://github.com/palakharinkhede4/snippetvault"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring flex items-center justify-between rounded-card border border-teal bg-teal/15 px-4 py-2.5 text-xs font-semibold text-teal-dark transition hover:bg-teal hover:text-paper"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal animate-ping" />
                  <span>SnippetVault Repo</span>
                </div>
                <span>★ Star</span>
              </a>

              {/* Portfolio */}
              <a
                href="https://www.linkedin.com/in/palakharinkhede/"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring flex items-center justify-between rounded-card border border-amber/50 bg-amber/10 px-4 py-2.5 text-xs font-semibold text-ink transition hover:bg-amber hover:text-ink"
              >
                <div className="flex items-center gap-2">
                  <span>💼</span>
                  <span>Portfolio & Contact</span>
                </div>
                <span>↗</span>
              </a>
            </div>
          </div>
        </section>

        {/* Project Mission & Problem Statement */}
        <section className="grid gap-8 md:grid-cols-2">
          <div className="rounded-card border border-ink/15 bg-paper-dim/40 p-6 md:p-8">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-rust">
              The Friction Point
            </span>
            <h3 className="mt-2 font-display text-2xl text-ink">The "Snippet Amnesia" Problem</h3>
            <p className="mt-4 text-sm leading-relaxed text-ink/80">
              Every day, developers rewrite identical snippets: array deduplication functions, tricky SQL window calculations, multi-stage Dockerfiles, JWT verification middlewares, and tuned LLM prompts.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">
              Traditional note apps are cluttered, bloated, and lack code-native syntax clarity. Gists are disconnected and slow to organize. Developers needed a clean, tactile index drawer that stores snippets instantly and retrieves them with sub-millisecond search.
            </p>
          </div>

          <div className="rounded-card border border-ink/15 bg-paper-dim/40 p-6 md:p-8">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-teal-dark">
              The Architecture Solution
            </span>
            <h3 className="mt-2 font-display text-2xl text-ink">The Card Catalog System</h3>
            <p className="mt-4 text-sm leading-relaxed text-ink/80">
              SnippetVault models snippets like physical 3×5 index cards in a mahogany drawer. Each card carries a title, tag taxonomy, and formatted code.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">
              Under the hood, a modern Next.js 14 full-stack engine powers instant client-side search indexing, server-enforced tier quotas (5 free vs. unlimited Pro), cryptographic public sharing URLs, and self-healing Stripe billing reconciliation.
            </p>
          </div>
        </section>

        {/* High-Level Architecture Flow Diagram */}
        <section className="rounded-card border border-ink/20 bg-ink text-paper p-6 md:p-10 shadow-lg">
          <div className="border-b border-paper/15 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-teal">
                  System Architecture Blueprint
                </span>
                <h2 className="mt-1 font-display text-2xl md:text-3xl text-paper">
                  End-to-End System Design
                </h2>
              </div>
              <span className="rounded-card border border-paper/20 bg-paper/10 px-3 py-1 font-mono text-xs text-paper/80">
                Serverless & Edge Ready
              </span>
            </div>
            <p className="mt-2 text-sm text-paper/70">
              Visual overview of data flow from client requests through security, serverless handlers, PostgreSQL database, and third-party SaaS integrations.
            </p>
          </div>

          {/* Visual Architecture Diagram Flow Blocks */}
          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            {/* Box 1: Client Tier */}
            <div className="rounded-card border border-paper/20 bg-ink-soft p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-amber uppercase tracking-wider font-bold">Layer 1</span>
                <span className="text-xs">💻</span>
              </div>
              <h4 className="mt-2 font-display text-lg text-paper">Client UI</h4>
              <p className="mt-1 font-mono text-[11px] text-teal">Next.js 14 App Router</p>
              <ul className="mt-3 space-y-1.5 font-mono text-[11px] text-paper/75">
                <li>• React Server Components</li>
                <li>• Optimistic UI States</li>
                <li>• Real-Time Tag Filtering</li>
                <li>• Tailwind Design System</li>
              </ul>
            </div>

            {/* Box 2: Auth & Security */}
            <div className="rounded-card border border-paper/20 bg-ink-soft p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-amber uppercase tracking-wider font-bold">Layer 2</span>
                <span className="text-xs">🛡️</span>
              </div>
              <h4 className="mt-2 font-display text-lg text-paper">Security & Auth</h4>
              <p className="mt-1 font-mono text-[11px] text-teal">NextAuth.js + Bcrypt</p>
              <ul className="mt-3 space-y-1.5 font-mono text-[11px] text-paper/75">
                <li>• 30-Day Stateless JWT</li>
                <li>• 10 Salt Rounds Bcrypt</li>
                <li>• Email Sanitization & MX</li>
                <li>• 10m TTL Hashed OTP</li>
              </ul>
            </div>

            {/* Box 3: API & Business Logic */}
            <div className="rounded-card border border-paper/20 bg-ink-soft p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-amber uppercase tracking-wider font-bold">Layer 3</span>
                <span className="text-xs">⚙️</span>
              </div>
              <h4 className="mt-2 font-display text-lg text-paper">API Routes</h4>
              <p className="mt-1 font-mono text-[11px] text-teal">Serverless Handlers</p>
              <ul className="mt-3 space-y-1.5 font-mono text-[11px] text-paper/75">
                <li>• Plan Quota Enforcement</li>
                <li>• Snippet CRUD Operations</li>
                <li>• Stripe Session Generator</li>
                <li>• Webhook Signature Verif.</li>
              </ul>
            </div>

            {/* Box 4: Database & ORM */}
            <div className="rounded-card border border-paper/20 bg-ink-soft p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-amber uppercase tracking-wider font-bold">Layer 4</span>
                <span className="text-xs">🗄️</span>
              </div>
              <h4 className="mt-2 font-display text-lg text-paper">Postgres Data</h4>
              <p className="mt-1 font-mono text-[11px] text-teal">Prisma ORM • Neon</p>
              <ul className="mt-3 space-y-1.5 font-mono text-[11px] text-paper/75">
                <li>• Connection Pooling</li>
                <li>• Cascading Foreign Keys</li>
                <li>• Indexed Query Speeds</li>
                <li>• Atomic Model Mutations</li>
              </ul>
            </div>

            {/* Box 5: External Services */}
            <div className="rounded-card border border-teal/40 bg-ink-soft p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-amber uppercase tracking-wider font-bold">Layer 5</span>
                <span className="text-xs">☁️</span>
              </div>
              <h4 className="mt-2 font-display text-lg text-paper">External Cloud</h4>
              <p className="mt-1 font-mono text-[11px] text-teal">Stripe & Resend</p>
              <ul className="mt-3 space-y-1.5 font-mono text-[11px] text-paper/75">
                <li>• Stripe Recurring Pro</li>
                <li>• Hosted Customer Portal</li>
                <li>• Resend / SMTP Delivery</li>
                <li>• Vercel Global Edge CDN</li>
              </ul>
            </div>
          </div>

          {/* Flow Arrows / Connection Summary */}
          <div className="mt-8 rounded-card border border-paper/15 bg-paper/5 p-4 text-center font-mono text-xs text-paper/80">
            Client Requests <span className="text-teal font-bold">⇄</span> JWT Validation <span className="text-teal font-bold">⇄</span> Server Quota Checks <span className="text-teal font-bold">⇄</span> Prisma ORM <span className="text-teal font-bold">⇄</span> PostgreSQL <span className="text-amber font-bold">|</span> Stripe Webhooks & Fallback Sync
          </div>
        </section>

        {/* Interactive Pipelines & Code Walkthrough (Client Component) */}
        <AboutClient />

        {/* Complete Technology Matrix */}
        <section className="rounded-card border border-ink/15 bg-white/50 p-6 md:p-8">
          <div className="border-b border-ink/10 pb-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-teal-dark">
              Technology Evaluation
            </span>
            <h2 className="mt-1 font-display text-2xl md:text-3xl text-ink">
              Production Tech Stack Matrix
            </h2>
            <p className="mt-1 text-sm text-ink/70">
              Architectural decisions and packages chosen for scalability, security, and developer ergonomics.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TECH_STACK.map((item) => (
              <div
                key={item.name}
                className="flex flex-col justify-between rounded-card border border-ink/10 bg-paper p-5 transition hover:border-ink/25"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-ink/50 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${item.badgeColor}`}>
                      {item.tag}
                    </span>
                  </div>
                  <h4 className="mt-2 font-display text-base font-semibold text-ink">{item.name}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-ink/70">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* REST API & Route Architecture Reference */}
        <section className="rounded-card border border-ink/15 bg-paper p-6 md:p-8">
          <div className="border-b border-ink/10 pb-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber">
              Interface Reference
            </span>
            <h2 className="mt-1 font-display text-2xl md:text-3xl text-ink">
              API & Route Specifications
            </h2>
            <p className="mt-1 text-sm text-ink/70">
              Full breakdown of serverless REST endpoints, authorization requirements, and behaviors.
            </p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-ink/20 text-ink/60">
                  <th className="pb-3 pr-4 font-semibold uppercase">Method</th>
                  <th className="pb-3 pr-4 font-semibold uppercase">Route Path</th>
                  <th className="pb-3 pr-4 font-semibold uppercase">Auth Guard</th>
                  <th className="pb-3 font-semibold uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {API_ENDPOINTS.map((ep, i) => (
                  <tr key={i} className="hover:bg-paper-dim/40 transition">
                    <td className="py-3 pr-4 font-bold text-teal-dark">{ep.method}</td>
                    <td className="py-3 pr-4 font-medium text-ink">{ep.path}</td>
                    <td className="py-3 pr-4 text-ink/70">
                      <span className="rounded bg-ink/10 px-2 py-0.5 text-[10px]">
                        {ep.auth}
                      </span>
                    </td>
                    <td className="py-3 text-ink/80">{ep.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="rounded-card border border-ink bg-ink text-paper p-8 md:p-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-amber">
            Experience SnippetVault Live
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl text-paper">
            Ready to organize your code & prompts?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-paper/75">
            Join developers who file their go-to code snippets once and pull them up in sub-seconds. Free forever for up to 5 cards, upgrade anytime for unlimited.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="focus-ring rounded-card bg-teal px-6 py-3 font-medium text-ink transition hover:bg-teal-dark hover:text-paper"
            >
              Start Free Drawer →
            </Link>
            <a
              href="https://www.linkedin.com/in/palakharinkhede/"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring rounded-card border border-paper/30 px-6 py-3 font-medium text-paper transition hover:bg-paper hover:text-ink"
            >
              Connect with Palak on LinkedIn ↗
            </a>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="border-t border-ink/10 mt-12 px-6 py-10 text-center text-xs text-ink/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p>SnippetVault — designed & engineered with care by <strong>Palak Harinkhede</strong>.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
            <Link href="/dashboard" className="hover:text-ink">
              Dashboard
            </Link>
            <a
              href="https://github.com/palakharinkhede4/snippetvault"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink underline underline-offset-4"
            >
              GitHub Repository
            </a>
            <a
              href="https://www.linkedin.com/in/palakharinkhede/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink underline underline-offset-4"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
