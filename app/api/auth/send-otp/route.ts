import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validateRealEmail } from "@/lib/emailValidation";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, mode } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // 1. Strict real-email validation (Format + Disposable check + DNS MX record resolution)
    const emailCheck = await validateRealEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: emailCheck.reason || "Please provide a valid, active email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // 2. Account existence checks for Login vs Signup modes
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (mode === "login" && !existingUser) {
      return NextResponse.json(
        { error: "No account found with this email. Please sign up first." },
        { status: 404 }
      );
    }

    if (mode === "signup" && existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in instead." },
        { status: 409 }
      );
    }

    // 3. Generate random 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any existing OTP tokens for this email to keep table clean
    await prisma.otpToken.deleteMany({ where: { email: normalizedEmail } });

    // Store new OTP token
    await prisma.otpToken.create({
      data: {
        email: normalizedEmail,
        codeHash,
        expiresAt,
      },
    });

    // 4. Dispatch OTP via email (or server log in dev)
    await sendOtpEmail(normalizedEmail, otpCode);

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}.`,
    });
  } catch (err: any) {
    console.error("send-otp error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }
}
