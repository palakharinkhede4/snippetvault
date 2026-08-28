import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOwnedSnippet(id: string, userId: string) {
  const snippet = await prisma.snippet.findUnique({ where: { id } });
  if (!snippet || snippet.userId !== userId) return null;
  return snippet;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const userId = (session.user as any).id;
  const existing = await getOwnedSnippet(params.id, userId);
  if (!existing) return NextResponse.json({ error: "Snippet not found." }, { status: 404 });

  const { title, content, tags, isPublic } = await req.json();

  const snippet = await prisma.snippet.update({
    where: { id: params.id },
    data: {
      title: title?.trim() ?? existing.title,
      content: content ?? existing.content,
      tags: (tags ?? existing.tags).trim(),
      isPublic: typeof isPublic === "boolean" ? isPublic : existing.isPublic,
    },
  });

  return NextResponse.json({ snippet });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const userId = (session.user as any).id;
  const existing = await getOwnedSnippet(params.id, userId);
  if (!existing) return NextResponse.json({ error: "Snippet not found." }, { status: 404 });

  await prisma.snippet.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
