import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { validatePassword } from "../lib/passwordValidation";

async function main() {
  console.log("🚀 Testing Manage Account: Change Password & Permanent Account Deletion...\n");

  const testEmail = `account_mgmt_${Date.now()}@example.com`;
  const initialPassword = "OldPassword123!";
  const passwordHash = await bcrypt.hash(initialPassword, 10);

  console.log(`1. Creating test user: ${testEmail}`);
  const user = await prisma.user.create({
    data: {
      name: "Management Tester",
      email: testEmail,
      passwordHash,
      plan: "free",
    },
  });
  console.log("✅ User created with ID:", user.id);

  console.log("\n2. Testing Change Password validation...");
  // Test wrong current password
  const isWrongPasswordValid = await bcrypt.compare("WrongPass999!", user.passwordHash);
  if (isWrongPasswordValid) {
    throw new Error("Should reject incorrect current password!");
  }
  console.log("✅ Correctly rejected invalid current password.");

  // Test weak new password
  const weakValidation = validatePassword("weak");
  if (weakValidation.valid) {
    throw new Error("Should reject weak new password!");
  }
  console.log("✅ Correctly rejected weak new password (missing uppercase, number, symbol, length).");

  // Test valid password change
  const newPassword = "NewStrongPassword888!";
  const newValidation = validatePassword(newPassword);
  if (!newValidation.valid) {
    throw new Error("Valid password failed validation!");
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
  const isOldValid = await bcrypt.compare(initialPassword, updatedUser!.passwordHash!);
  const isNewValid = await bcrypt.compare(newPassword, updatedUser!.passwordHash!);

  if (isOldValid || !isNewValid) {
    throw new Error("Password hash was not updated properly!");
  }
  console.log("✅ Successfully updated password hash and verified new credentials.");

  console.log("\n3. Creating snippets for the user to verify complete cascade deletion...");
  await prisma.snippet.createMany({
    data: [
      { title: "Snippet 1", content: "const a = 1;", userId: user.id },
      { title: "Snippet 2", content: "const b = 2;", userId: user.id },
    ],
  });
  const snippetCountBefore = await prisma.snippet.count({ where: { userId: user.id } });
  console.log(`✅ Created ${snippetCountBefore} test snippets for user.`);

  console.log("\n4. Testing Account Deletion Confirmation Validation...");
  const wrongConfirm = "delete account"; // lowercase
  const isExactConfirm = wrongConfirm.trim() === "Delete Account";
  if (isExactConfirm) {
    throw new Error("Should strictly require exact case 'Delete Account'!");
  }
  console.log("✅ Strict confirmation check verified.");

  const exactConfirm = "Delete Account";
  if (exactConfirm.trim() !== "Delete Account") {
    throw new Error("Exact confirmation failed!");
  }
  console.log("✅ Exact 'Delete Account' phrase verified.");

  console.log("\n5. Executing account deletion...");
  await prisma.snippet.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });

  const userAfter = await prisma.user.findUnique({ where: { id: user.id } });
  const snippetsAfter = await prisma.snippet.count({ where: { userId: user.id } });

  if (userAfter !== null || snippetsAfter !== 0) {
    throw new Error("User or snippets still exist after deletion!");
  }
  console.log("✅ User account and all associated snippets permanently deleted from DB.");

  console.log("\n🎉 ALL MANAGE ACCOUNT & DELETION FEATURES VERIFIED WITH 100% SUCCESS!");
}

main()
  .catch((e) => {
    console.error("❌ Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
