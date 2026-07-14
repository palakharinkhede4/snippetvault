import Link from "next/link";

const catalogCards = [
  { tab: "JS · array-dedupe", body: "const uniq = (arr) =>\n  [...new Set(arr)];", rotate: "-rotate-3" },
  { tab: "PROMPT · tighten-copy", body: "Rewrite the paragraph below\nfor a terser, more direct tone.", rotate: "rotate-2" },
  { tab: "SQL · monthly-active", body: "SELECT date_trunc('month', ts),\n  count(DISTINCT user_id)\nFROM events;", rotate: "-rotate-1" },
];

const features = [
  {
    tab: "TAG",
    title: "File it once, the right way",
    body: "Every snippet gets free-form tags — language, project, or your own shorthand — so future-you can find it without remembering the exact title.",
  },
  {
    tab: "SEARCH",
    title: "Find it before you'd finish typing it",
    body: "Search across titles, tags, and the snippet body itself. If you've saved it, it surfaces in under a second.",
  },
  {
    tab: "SHARE",
    title: "Hand a teammate one link",
    body: "Mark any snippet public and it gets a clean, shareable URL — no account required for the person on the other end.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper">
      {/* Nav */}
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-display text-xl italic tracking-tight text-ink">
            Cache
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <a href="#features" className="hidden text-ink/70 hover:text-ink sm:inline">
              Features
            </a>
            <a href="#pricing" className="hidden text-ink/70 hover:text-ink sm:inline">
              Pricing
            </a>
            <Link href="/login" className="text-ink/70 hover:text-ink">
              Log in
            </Link>
            <Link
              href="/signup"
              className="focus-ring rounded-card bg-ink px-4 py-2 text-paper transition hover:bg-ink-soft"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-amber">
              a card catalog for developers
            </p>
            <h1 className="font-display text-4xl leading-[1.1] md:text-5xl">
              Every snippet you keep{" "}
              <em className="italic text-teal">re-writing from memory</em>, filed for good.
            </h1>
            <p className="mt-6 max-w-md text-paper/70">
              Code, prompts, SQL, boilerplate — save it once, tag it, and pull it back up in a
              search instead of a Slack scroll. Share any card with a single link.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="focus-ring rounded-card bg-teal px-6 py-3 font-medium text-ink transition hover:bg-teal-dark hover:text-paper"
              >
                Start for free
              </Link>
              <a href="#pricing" className="text-sm text-paper/70 underline underline-offset-4 hover:text-paper">
                See plans
              </a>
            </div>
          </div>

          {/* Signature element: staggered index cards */}
          <div className="relative h-72 md:h-80">
            {catalogCards.map((card, i) => (
              <div
                key={card.tab}
                className={`absolute w-64 rounded-card border border-ink/10 bg-paper p-4 text-ink shadow-lg ${card.rotate}`}
                style={{ top: `${i * 34}px`, left: `${i * 26}px` }}
              >
                <div className="mb-2 border-b border-dashed border-ink/20 pb-1 font-mono text-[10px] uppercase tracking-wide text-rust">
                  {card.tab}
                </div>
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-ink/80">
{card.body}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl">Built around the moment you go looking.</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.tab} className="rounded-card border border-ink/10 bg-white/40 p-6">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-teal-dark">
                {f.tab}
              </span>
              <h3 className="mt-3 font-display text-xl">{f.title}</h3>
              <p className="mt-2 text-sm text-ink/70">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-ink/10 bg-paper-dim/60">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-center font-display text-3xl">Two drawers. Pick one.</h2>
          <p className="mt-3 text-center text-ink/60">
            Free to start. Upgrade the moment the free drawer fills up.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* Starter */}
            <div className="rounded-card border border-ink/15 bg-paper p-8">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
                Starter
              </span>
              <p className="mt-3 font-display text-4xl">
                $0<span className="text-base font-body text-ink/50"> /month</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-ink/75">
                <li>· Up to 5 saved snippets</li>
                <li>· Tagging and search</li>
                <li>· Public share links</li>
              </ul>
              <Link
                href="/signup?plan=starter"
                className="focus-ring mt-8 block rounded-card border border-ink px-5 py-3 text-center font-medium text-ink transition hover:bg-ink hover:text-paper"
              >
                Start free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative rounded-card border-2 border-teal bg-ink p-8 text-paper">
              <span className="absolute -top-3 right-6 rounded-full bg-amber px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-ink">
                Most reached-for
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-teal">Pro</span>
              <p className="mt-3 font-display text-4xl">
                $9<span className="text-base font-body text-paper/50"> /month</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-paper/80">
                <li>· Unlimited saved snippets</li>
                <li>· Tagging and search</li>
                <li>· Public share links</li>
                <li>· Priority support</li>
              </ul>
              <Link
                href="/signup?plan=pro"
                className="focus-ring mt-8 block rounded-card bg-teal px-5 py-3 text-center font-medium text-ink transition hover:bg-teal-dark hover:text-paper"
              >
                Go Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/10 px-6 py-10 text-center text-xs text-ink/50">
        Cache — built for people tired of re-writing the same fifteen lines.
      </footer>
    </main>
  );
}
