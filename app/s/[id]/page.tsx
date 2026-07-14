import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function PublicSnippetPage({ params }: { params: { id: string } }) {
  const snippet = await prisma.snippet.findUnique({ where: { id: params.id } });

  if (!snippet || !snippet.isPublic) notFound();

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 py-16">
      <div className="w-full max-w-xl rounded-card border border-paper/15 bg-paper p-6 text-ink">
        <div className="mb-3 border-b border-dashed border-ink/20 pb-2 font-mono text-[10px] uppercase tracking-wide text-rust">
          shared from Cache
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
        <p className="mt-6 text-center text-xs text-ink/40">
          <Link href="/" className="underline underline-offset-4">
            Keep your own drawer on Cache →
          </Link>
        </p>
      </div>
    </main>
  );
}
