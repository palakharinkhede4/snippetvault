import nodemailer from "nodemailer";

export async function sendOtpEmail(to: string, otp: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // Always log OTP to server logs for debugging
  console.log(`\n========================================`);
  console.log(`[SnippetVault OTP] To: ${to}`);
  console.log(`[SnippetVault OTP] Code: ${otp}`);
  console.log(`========================================\n`);

  const htmlBody = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #111827; margin-top: 0; font-size: 20px; font-weight: 600;">SnippetVault</h2>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">Enter the 6-digit verification code below to log in or complete your registration:</p>
      <div style="background-color: #f3f4f6; padding: 18px; text-align: center; border-radius: 8px; margin: 24px 0;">
        <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0d9488;">${otp}</span>
      </div>
      <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">This code expires in 10 minutes. If you did not request this email, please ignore it.</p>
    </div>
  `;

  // Option 1: Resend API (Recommended - Free & Fast)
  if (resendApiKey) {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "SnippetVault <onboarding@resend.dev>",
        to: [to],
        subject: `Your SnippetVault Verification Code: ${otp}`,
        html: htmlBody,
      }),
    });

    if (!resendRes.ok) {
      const errorData = await resendRes.json();
      console.error("[Resend Error]", errorData);
      throw new Error(errorData.message || "Failed to deliver email via Resend API.");
    }
    return;
  }

  // Option 2: SMTP Transporter (Nodemailer - Gmail, SendGrid, Brevo, Custom SMTP)
  if (smtpHost && smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `SnippetVault <${process.env.SMTP_FROM || smtpUser}>`,
      to,
      subject: `Your SnippetVault Verification Code: ${otp}`,
      text: `Your 6-digit verification code for SnippetVault is: ${otp}\n\nThis code will expire in 10 minutes.`,
      html: htmlBody,
    });
    return;
  }

  // Option 3: If no provider credentials exist in production, throw explicit error
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Email provider is not configured. Please set RESEND_API_KEY or SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) in your environment variables (e.g. Vercel dashboard)."
    );
  }
}
