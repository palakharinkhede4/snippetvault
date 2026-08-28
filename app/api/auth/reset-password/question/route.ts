import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Please provide your account email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, securityQuestion: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    if (!user.securityQuestion) {
      return NextResponse.json(
        {
          error:
            "No security question was configured for this account. Please contact support.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      email: user.email,
      securityQuestion: user.securityQuestion,
    });
  } catch (err) {
    console.error("Error retrieving security question:", err);
    return NextResponse.json(
      { error: "Failed to retrieve security question. Please try again." },
      { status: 500 }
    );
  }
}
