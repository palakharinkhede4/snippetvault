import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { confirmationText, password } = await req.json();

    if (!confirmationText || confirmationText.trim() !== "Delete Account") {
      return NextResponse.json(
        { error: 'Confirmation failed. You must type exactly "Delete Account" to confirm.' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Your password is required to verify account deletion." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect password. Account deletion aborted." },
        { status: 400 }
      );
    }

    // Clean up Stripe customer record if exists
    if (user.stripeCustomerId) {
      try {
        await stripe.customers.del(user.stripeCustomerId);
      } catch (stripeErr) {
        console.warn("Could not delete customer from Stripe:", stripeErr);
      }
    }

    // Delete all user snippets and account from database
    await prisma.snippet.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({
      success: true,
      message: "Your account and all associated snippets have been permanently deleted.",
    });
  } catch (err: any) {
    console.error("Error deleting user account:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete account." },
      { status: 500 }
    );
  }
}
