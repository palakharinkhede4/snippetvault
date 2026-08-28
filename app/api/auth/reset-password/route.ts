import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validatePassword } from "@/lib/passwordValidation";

export async function POST(req: Request) {
  try {
    const { email, securityAnswer, newPassword } = await req.json();

    if (!email || !securityAnswer || !newPassword) {
      return NextResponse.json(
        { error: "Email, security answer, and new password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    if (!user.securityAnswerHash) {
      return NextResponse.json(
        {
          error:
            "No security answer on file for this account. Please contact support.",
        },
        { status: 400 }
      );
    }

    // Verify security answer (case-insensitive & trimmed)
    const normalizedAnswer = String(securityAnswer).toLowerCase().trim();
    const isAnswerValid = await bcrypt.compare(
      normalizedAnswer,
      user.securityAnswerHash
    );

    if (!isAnswerValid) {
      return NextResponse.json(
        { error: "Incorrect answer to security question. Please try again." },
        { status: 401 }
      );
    }

    // Validate new password security standards
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        {
          error: `Password security standards not met: ${passwordCheck.errors.join(", ")}.`,
          details: passwordCheck.errors,
        },
        { status: 400 }
      );
    }

    // Hash the new password and update user record
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully. You can now log in.",
    });
  } catch (err) {
    console.error("Error resetting password:", err);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
