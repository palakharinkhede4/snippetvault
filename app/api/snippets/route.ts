import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FREE_PLAN_SNIPPET_LIMIT } from "@/lib/stripe";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  const snippets = await prisma.snippet.findMany({
    where: {
      userId: (session.user as any).id,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
              { tags: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ snippets });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  if (user.plan === "free") {
    const count = await prisma.snippet.count({ where: { userId } });
    if (count >= FREE_PLAN_SNIPPET_LIMIT) {
      return NextResponse.json(
        {
          error: `The free plan holds ${FREE_PLAN_SNIPPET_LIMIT} snippets. Upgrade to Pro for unlimited storage.`,
          code: "PLAN_LIMIT_REACHED",
        },
        { status: 402 }
      );
    }
  }

  const { title, content, tags, isPublic } = await req.json();

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "A title and content are required." }, { status: 400 });
  }

  const snippet = await prisma.snippet.create({
    data: {
      title: title.trim(),
      content,
      tags: (tags || "").trim(),
      isPublic: Boolean(isPublic),
      userId,
    },
  });

  return NextResponse.json({ snippet });
}
