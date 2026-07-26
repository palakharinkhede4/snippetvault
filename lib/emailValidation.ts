import dns from "dns/promises";

// Popular disposable / temporary / test email provider domains
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "yopmail.com",
  "trashmail.com",
  "dispostable.com",
  "getnada.com",
  "sharklasers.com",
  "fakemailgenerator.com",
  "maildrop.cc",
  "crazymailing.com",
  "throwawaymail.com",
  "generator.email",
  "temp-mail.org",
  "test.com",
  "example.com",
  "sample.com",
  "dummy.com",
  "invalid.com",
  "fake.com",
]);

export async function validateRealEmail(email: string): Promise<{ valid: boolean; reason?: string }> {
  if (!email || typeof email !== "string") {
    return { valid: false, reason: "Email address is required." };
  }

  const normalized = email.toLowerCase().trim();

  // 1. Strict RFC format check (ensures local part, @, domain, and valid TLD format)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(normalized)) {
    return { valid: false, reason: "Please enter a valid email address format (e.g. name@domain.com)." };
  }

  const parts = normalized.split("@");
  if (parts.length !== 2) {
    return { valid: false, reason: "Invalid email structure." };
  }

  const [localPart, domain] = parts;

  if (!localPart || !domain) {
    return { valid: false, reason: "Invalid email structure." };
  }

  // 2. Block disposable / temporary / test domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      reason: "Disposable or test email domains are not allowed. Please register with a real email address.",
    };
  }

  // 3. Perform DNS MX record lookup to ensure the domain actually has active mail servers
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DNS_TIMEOUT")), 3500)
    );

    const mxRecords = await Promise.race([
      dns.resolveMx(domain),
      timeoutPromise,
    ]);

    if (!mxRecords || mxRecords.length === 0) {
      return {
        valid: false,
        reason: "The domain for this email address does not have active mail servers.",
      };
    }
  } catch (error: any) {
    if (error.message === "DNS_TIMEOUT") {
      // If DNS takes too long, we fallback gracefully to passing the check so user isn't stuck
      return { valid: true };
    }
    return {
      valid: false,
      reason: `The email domain "${domain}" does not appear to be active or able to receive emails.`,
    };
  }

  return { valid: true };
}
