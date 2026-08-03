import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { validateRealEmail } from "../lib/emailValidation";
import { validatePassword } from "../lib/passwordValidation";

async function runAuthFlowTest() {
  console.log("==================================================");
  console.log("   SnippetVault Email & Password Auth Test       ");
  console.log("==================================================\n");

  const testEmail = "validuser@gmail.com";
  const weakPassword = "123";
  const strongPassword = "SecureP@ssword2026!";

  // Test 1: Email Validation Test
  console.log("[Test 1] Testing Real Email Validation...");
  const fakeEmailResult = await validateRealEmail("fake@mailinator.com");
  console.log(`   - Disposable Email (mailinator.com): valid=${fakeEmailResult.valid}, reason="${fakeEmailResult.reason || ''}"`);
  if (fakeEmailResult.valid) {
    throw new Error("FAIL: Disposable email was incorrectly marked as valid!");
  }

  const realEmailResult = await validateRealEmail(testEmail);
  console.log(`   - Real Email (${testEmail}): valid=${realEmailResult.valid}`);
  if (!realEmailResult.valid) {
    throw new Error(`FAIL: Real email validation failed: ${realEmailResult.reason}`);
  }
  console.log("   ✓ Real Email Validation passed!\n");

  // Test 2: Password Security Standards Test
  console.log("[Test 2] Testing Password Security Standard...");
  const weakCheck = validatePassword(weakPassword);
  console.log(`   - Weak Password ("123"): valid=${weakCheck.valid}, errors=[${weakCheck.errors.join(", ")}]`);
  if (weakCheck.valid) {
    throw new Error("FAIL: Weak password was incorrectly marked as valid!");
  }

  const strongCheck = validatePassword(strongPassword);
  console.log(`   - Strong Password ("${strongPassword}"): valid=${strongCheck.valid}`);
  if (!strongCheck.valid) {
    throw new Error(`FAIL: Strong password validation failed: ${strongCheck.errors.join(", ")}`);
  }
  console.log("   ✓ Password Security Standard passed!\n");

  // Test 3: User Registration & Hashing Test
  console.log("[Test 3] Testing User Registration & Password Hashing...");
  await prisma.snippet.deleteMany({ where: { user: { email: testEmail } } });
  await prisma.user.deleteMany({ where: { email: testEmail } });

  const passwordHash = await bcrypt.hash(strongPassword, 10);
  const createdUser = await prisma.user.create({
    data: {
      email: testEmail,
      passwordHash,
      emailVerified: true,
      name: "Test Auth User",
    },
  });

  console.log(`   - User Created: ID=${createdUser.id}, Email=${createdUser.email}, Verified=${createdUser.emailVerified}`);
  if (!createdUser.passwordHash) {
    throw new Error("FAIL: Password hash was not saved!");
  }
  console.log("   ✓ Registration & Hashing passed!\n");

  // Test 4: Credential Authorization (Login) Test
  console.log("[Test 4] Testing Credential Authorization (Login)...");
  const fetchedUser = await prisma.user.findUnique({ where: { email: testEmail } });
  if (!fetchedUser || !fetchedUser.passwordHash) {
    throw new Error("FAIL: User or password hash not found in database!");
  }

  const isPasswordValid = await bcrypt.compare(strongPassword, fetchedUser.passwordHash);
  console.log(`   - Correct Password Match: ${isPasswordValid}`);
  if (!isPasswordValid) {
    throw new Error("FAIL: Valid password comparison failed!");
  }

  const isWrongPasswordInvalid = !(await bcrypt.compare("WrongPassword123!", fetchedUser.passwordHash));
  console.log(`   - Wrong Password Rejection: ${isWrongPasswordInvalid}`);
  if (!isWrongPasswordInvalid) {
    throw new Error("FAIL: Wrong password was incorrectly accepted!");
  }
  console.log("   ✓ Login Authorization passed!\n");

  // Test 5: Cleanup Test User
  console.log("[Test 5] Cleaning up test data...");
  await prisma.snippet.deleteMany({ where: { userId: createdUser.id } });
  await prisma.user.delete({ where: { id: createdUser.id } });
  console.log("   ✓ Test Data Cleanup passed!\n");

  console.log("==================================================");
  console.log("   🎉 ALL AUTHENTICATION WORKFLOW TESTS PASSED!   ");
  console.log("==================================================");
}

runAuthFlowTest()
  .catch((err) => {
    console.error("\n❌ Auth Workflow Test Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
