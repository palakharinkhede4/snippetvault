import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { validateRealEmail } from "../lib/emailValidation";
import { sendOtpEmail } from "../lib/email";

async function runOtpVerificationTest() {
  console.log("==================================================");
  console.log("   SnippetVault End-to-End OTP Workflow Test      ");
  console.log("==================================================\n");

  const testEmail = "testuser@gmail.com";

  // Test 1: Real Email Validation
  console.log("[Test 1] Testing Email Validation...");
  const fakeEmailCheck = await validateRealEmail("fake@mailinator.com");
  console.log(`   - Fake Email (mailinator.com): valid=${fakeEmailCheck.valid}, reason="${fakeEmailCheck.reason || ''}"`);
  if (fakeEmailCheck.valid) {
    throw new Error("FAIL: Disposable email was incorrectly marked as valid!");
  }

  const realEmailCheck = await validateRealEmail(testEmail);
  console.log(`   - Real Email (${testEmail}): valid=${realEmailCheck.valid}`);
  if (!realEmailCheck.valid) {
    throw new Error(`FAIL: Real email check failed: ${realEmailCheck.reason}`);
  }
  console.log("   ✓ Email Validation passed!\n");

  // Test 2: OTP Generation & Token Storage
  console.log("[Test 2] Testing OTP Generation & Storage...");
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = await bcrypt.hash(otpCode, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otpToken.deleteMany({ where: { email: testEmail } });
  const createdToken = await prisma.otpToken.create({
    data: {
      email: testEmail,
      codeHash,
      expiresAt,
    },
  });
  console.log(`   - OTP Token Created: ID=${createdToken.id}, Email=${createdToken.email}`);
  console.log("   ✓ OTP Storage passed!\n");

  // Test 3: Email Dispatch Test
  console.log("[Test 3] Testing Email Dispatch (Console / Transporter)...");
  await sendOtpEmail(testEmail, otpCode);
  console.log("   ✓ Email Dispatch passed!\n");

  // Test 4: OTP Verification & Auto User Creation
  console.log("[Test 4] Testing OTP Code Verification & User Creation...");
  const tokenInDb = await prisma.otpToken.findFirst({
    where: {
      email: testEmail,
      expiresAt: { gte: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!tokenInDb) {
    throw new Error("FAIL: OTP token not found in database!");
  }

  const isMatch = await bcrypt.compare(otpCode, tokenInDb.codeHash);
  console.log(`   - Code Matching (${otpCode}): ${isMatch}`);
  if (!isMatch) {
    throw new Error("FAIL: Generated code did not match stored hash!");
  }

  // Cleanup used OTP token
  await prisma.otpToken.deleteMany({ where: { email: testEmail } });

  // Auto-create or update user as NextAuth does
  let user = await prisma.user.findUnique({ where: { email: testEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: testEmail,
        emailVerified: true,
      },
    });
    console.log(`   - User Created: ID=${user.id}, Email=${user.email}, Verified=${user.emailVerified}`);
  } else {
    console.log(`   - User Found: ID=${user.id}, Email=${user.email}`);
  }
  console.log("   ✓ OTP Verification & User Creation passed!\n");

  // Test 5: Cleanup Test User
  console.log("[Test 5] Cleaning up test data...");
  await prisma.snippet.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  console.log("   ✓ Test Data Cleanup passed!\n");

  console.log("==================================================");
  console.log("   🎉 ALL OTP WORKFLOW TESTS PASSED CLEANLY!      ");
  console.log("==================================================");
}

runOtpVerificationTest()
  .catch((err) => {
    console.error("\n❌ OTP Workflow Test Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
