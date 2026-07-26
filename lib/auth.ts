import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days — sessions persist across reloads
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) return null;

        const normalizedEmail = credentials.email.toLowerCase().trim();

        // 1. Find active OTP token for this email
        const token = await prisma.otpToken.findFirst({
          where: {
            email: normalizedEmail,
            expiresAt: { gte: new Date() },
          },
          orderBy: { createdAt: "desc" },
        });

        if (!token) return null;

        // 2. Compare OTP hash
        const isValid = await bcrypt.compare(credentials.otp.trim(), token.codeHash);
        if (!isValid) return null;

        // 3. Delete used OTP token
        await prisma.otpToken.deleteMany({ where: { email: normalizedEmail } });

        // 4. Find or auto-create user on verified OTP
        let user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: normalizedEmail,
              emailVerified: true,
            },
          });
        } else if (!user.emailVerified) {
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true },
          });
        }

        return { id: user.id, email: user.email, name: user.name || user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
