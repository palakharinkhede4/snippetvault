"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const FREE_PLAN_SNIPPET_LIMIT = 5; // keep in sync with lib/stripe.ts

type Snippet = {
  id: string;
  title: string;
  content: string;
  tags: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function SnippetBoard({
  initialSnippets,
  plan,
}: {
  initialSnippets: Snippet[];
  plan: string;
}) {
  const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return snippets;
    const q = query.toLowerCase();
    return snippets.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.content.toLowerCase().includes(q) ||
        s.tags.toLowerCase().includes(q)
    );
  }, [snippets, query]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLimitReached(false);
    setSaving(true);

    const res = await fetch("/api/snippets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, tags, isPublic }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Could not save that snippet.");
      if (data.code === "PLAN_LIMIT_REACHED") setLimitReached(true);
      return;
    }

    setSnippets([data.snippet, ...snippets]);
    setTitle("");
    setContent("");
    setTags("");
    setIsPublic(false);
  }

  async function handleDelete(id: string) {
    const prev = snippets;
    setSnippets(snippets.filter((s) => s.id !== id));
    const res = await fetch(`/api/snippets/${id}`, { method: "DELETE" });
    if (!res.ok) setSnippets(prev);
  }

  async function togglePublic(s: Snippet) {
    const res = await fetch(`/api/snippets/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !s.isPublic }),
    });
    const data = await res.json();
    if (res.ok) {
      setSnippets(snippets.map((x) => (x.id === s.id ? data.snippet : x)));
    }
  }

  return (
    <div className="mt-8">
      <p className="mb-4 text-sm text-ink/60">
        {plan === "pro"
          ? "Pro plan — unlimited snippets."
          : `Starter plan — ${snippets.length}/${FREE_PLAN_SNIPPET_LIMIT} snippets used.`}
      </p>

      {/* Create form */}
      <form onSubmit={handleCreate} className="rounded-card border border-ink/15 bg-white/50 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Title, e.g. array-dedupe"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="focus-ring rounded-card border border-ink/20 bg-white px-3 py-2 text-sm"
          />
          <input
            placeholder="Tags, comma separated"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="focus-ring rounded-card border border-ink/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <textarea
          placeholder="Paste the snippet or prompt…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          className="focus-ring mt-3 w-full rounded-card border border-ink/20 bg-white px-3 py-2 font-mono text-sm"
        />
        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Make this shareable
          </label>
          <button
            type="submit"
            disabled={saving}
            className="focus-ring rounded-card bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink-soft disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save snippet"}
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-card border border-rust/30 bg-rust/5 p-3 text-sm text-rust">
            {error}
            {limitReached && (
              <Link href="/billing" className="ml-2 underline underline-offset-4">
                Upgrade to Pro →
              </Link>
            )}
          </div>
        )}
      </form>

      {/* Search */}
      <input
        placeholder="Search titles, tags, or content…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="focus-ring mt-6 w-full rounded-card border border-ink/20 bg-white px-3 py-2 text-sm"
      />

      {/* List */}
      <div className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <p className="rounded-card border border-dashed border-ink/20 p-8 text-center text-sm text-ink/50">
            {snippets.length === 0
              ? "Nothing filed yet. Save your first snippet above."
              : "Nothing matches that search."}
          </p>
        )}
        {filtered.map((s) => (
          <div key={s.id} className="rounded-card border border-ink/15 bg-white/60 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-display text-lg">{s.title}</h3>
                {s.tags && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {s.tags.split(",").filter(Boolean).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-teal/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-teal-dark"
                      >
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3 text-xs">
                <button onClick={() => togglePublic(s)} className="focus-ring text-ink/60 hover:text-ink">
                  {s.isPublic ? "Public ✓" : "Make public"}
                </button>
                {s.isPublic && (
                  <a
                    href={`/s/${s.id}`}
                    target="_blank"
                    className="text-teal-dark underline underline-offset-4"
                  >
                    View link
                  </a>
                )}
                <button onClick={() => handleDelete(s.id)} className="focus-ring text-rust hover:underline">
                  Delete
                </button>
              </div>
            </div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-card bg-ink/5 p-3 font-mono text-xs text-ink/80">
{s.content}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
