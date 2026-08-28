import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function PublicSnippetPage({ params }: { params: { id: string } }) {
  const snippet = await prisma.snippet.findUnique({
    where: { id: params.id },
    include: { user: true },
  });

  if (!snippet || !snippet.isPublic) notFound();

  // If the snippet author is on the free plan and has more than 5 snippets (from previous Pro plan), public sharing is locked
  if (snippet.user.plan === "free") {
    const authorSnippetCount = await prisma.snippet.count({
      where: { userId: snippet.userId },
    });
    if (authorSnippetCount > 5) {
      notFound();
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 py-16">
      <div className="w-full max-w-xl rounded-card border border-paper/15 bg-paper p-6 text-ink">
        <div className="mb-3 border-b border-dashed border-ink/20 pb-2 font-mono text-[10px] uppercase tracking-wide text-rust">
          shared from SnippetVault
        </div>
        <h1 className="font-display text-2xl">{snippet.title}</h1>
        {snippet.tags && (
          <div className="mt-2 flex flex-wrap gap-1">
            {snippet.tags.split(",").filter(Boolean).map((t) => (
              <span
                key={t}
                className="rounded-full bg-teal/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-teal-dark"
              >
                {t.trim()}
              </span>
            ))}
          </div>
        )}
        <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-card bg-ink/5 p-4 font-mono text-sm">
{snippet.content}
        </pre>
        <div className="mt-6 flex items-center justify-between text-xs text-ink/50 border-t border-ink/10 pt-4">
          <Link href="/" className="underline underline-offset-4 hover:text-ink">
            Keep your own drawer on SnippetVault →
          </Link>
          <Link href="/about" className="font-mono text-teal-dark hover:underline underline-offset-4">
            About Project ↗
          </Link>
        </div>
      </div>
    </main>
  );
}
