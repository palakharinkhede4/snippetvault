import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { validatePassword } from "../lib/passwordValidation";
import { SECURITY_QUESTIONS } from "../lib/securityQuestions";

async function main() {
  console.log("🚀 Starting End-to-End Test for Security Question Password Reset...");

  const testEmail = `test_${Date.now()}@gmail.com`;
  const originalPassword = "OriginalPassword123!";
  const newPassword = "BrandNewSecurePassword456#";
  const question = SECURITY_QUESTIONS[0]; // "What was the name of your first pet?"
  const answer = "Buddy";

  console.log(`\n1. Creating test user: ${testEmail}`);
  const passwordHash = await bcrypt.hash(originalPassword, 10);
  const securityAnswerHash = await bcrypt.hash(answer.toLowerCase().trim(), 10);

  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: testEmail,
      passwordHash,
      securityQuestion: question,
      securityAnswerHash,
      emailVerified: true,
      plan: "free",
    },
  });

  console.log("✅ User created successfully with ID:", user.id);

  console.log("\n2. Testing initial login password match...");
  const isMatchOriginal = await bcrypt.compare(originalPassword, user.passwordHash!);
  if (!isMatchOriginal) throw new Error("Original password did not match!");
  console.log("✅ Original password correctly verified.");

  console.log("\n3. Testing Security Question Lookup...");
  const retrievedUser = await prisma.user.findUnique({
    where: { email: testEmail },
    select: { email: true, securityQuestion: true, securityAnswerHash: true },
  });

  if (retrievedUser?.securityQuestion !== question) {
    throw new Error("Security question mismatch!");
  }
  console.log("✅ Retrieved Security Question:", retrievedUser.securityQuestion);

  console.log("\n4. Testing Wrong Security Answer Verification...");
  const isWrongAnswerValid = await bcrypt.compare("wronganswer".toLowerCase().trim(), retrievedUser.securityAnswerHash!);
  if (isWrongAnswerValid) throw new Error("Wrong answer unexpectedly validated!");
  console.log("✅ Wrong answer correctly rejected.");

  console.log("\n5. Testing Correct Security Answer Verification (case-insensitive & trimmed)...");
  const isCorrectAnswerValid = await bcrypt.compare("  bUdDy  ".toLowerCase().trim(), retrievedUser.securityAnswerHash!);
  if (!isCorrectAnswerValid) throw new Error("Correct answer failed verification!");
  console.log("✅ Correct answer successfully verified.");

  console.log("\n6. Testing New Password Security Standards Validation...");
  const weakCheck = validatePassword("weak");
  if (weakCheck.valid) throw new Error("Weak password passed validation unexpectedly!");
  console.log("✅ Weak password correctly rejected.");

  const strongCheck = validatePassword(newPassword);
  if (!strongCheck.valid) throw new Error("Strong password failed validation!");
  console.log("✅ Strong password verified:", strongCheck.valid);

  console.log("\n7. Executing Password Reset in Database...");
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash },
  });
  console.log("✅ Password hash updated in database.");

  console.log("\n8. Verifying old password fails and new password succeeds...");
  const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
  const oldCheck = await bcrypt.compare(originalPassword, updatedUser?.passwordHash!);
  if (oldCheck) throw new Error("Old password should not match anymore!");
  console.log("✅ Old password is now invalid.");

  const newCheck = await bcrypt.compare(newPassword, updatedUser?.passwordHash!);
  if (!newCheck) throw new Error("New password should match!");
  console.log("✅ New password verified successfully!");

  console.log("\n9. Cleaning up test user...");
  await prisma.user.delete({ where: { id: user.id } });
  console.log("✅ Test user cleaned up.");

  console.log("\n🎉 ALL SECURITY QUESTION & PASSWORD RESET TESTS PASSED WITH 100% SUCCESS!");
}

main()
  .catch((e) => {
    console.error("❌ Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
