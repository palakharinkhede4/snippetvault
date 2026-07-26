import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validateRealEmail } from "@/lib/emailValidation";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Enter an email and a password of at least 8 characters." },
        { status: 400 }
      );
    }

    const emailCheck = await validateRealEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: emailCheck.reason || "Please provide a valid, real email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists. Try logging in." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email: normalizedEmail,
        passwordHash,
      },
    });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
