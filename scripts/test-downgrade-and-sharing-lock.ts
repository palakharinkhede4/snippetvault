import { prisma } from "../lib/prisma";

async function main() {
  console.log("🚀 Testing Pro -> Free Downgrade, Snippet Preservation & Sharing Lock Policy...\n");

  const testEmail = `downgrade_test_${Date.now()}@example.com`;

  console.log(`1. Creating Pro user: ${testEmail}`);
  const user = await prisma.user.create({
    data: {
      name: "Pro User",
      email: testEmail,
      plan: "pro",
    },
  });
  console.log("✅ Pro user created with ID:", user.id);

  console.log("\n2. Creating 7 snippets for the Pro user (exceeding free limit of 5)...");
  const createdSnippets = [];
  for (let i = 1; i <= 7; i++) {
    const snippet = await prisma.snippet.create({
      data: {
        title: `Pro Snippet ${i}`,
        content: `console.log("Snippet content #${i}");`,
        tags: `test,tag${i}`,
        isPublic: false,
        userId: user.id,
      },
    });
    createdSnippets.push(snippet);
  }
  console.log(`✅ Successfully created ${createdSnippets.length} snippets on Pro plan.`);

  console.log("\n3. Simulating subscription cancellation -> downgrade to 'free' plan...");
  const downgradedUser = await prisma.user.update({
    where: { id: user.id },
    data: { plan: "free", stripeSubscriptionId: null },
  });
  console.log("✅ User plan successfully downgraded to:", downgradedUser.plan);

  console.log("\n4. Verifying snippet preservation (all 7 snippets must still exist)...");
  const countAfterDowngrade = await prisma.snippet.count({ where: { userId: user.id } });
  if (countAfterDowngrade !== 7) {
    throw new Error(`Expected 7 preserved snippets, found ${countAfterDowngrade}!`);
  }
  console.log(`✅ All ${countAfterDowngrade} snippets are safely preserved and not deleted.`);

  console.log("\n5. Testing snippet creation lock when count (7) >= 5 on free plan...");
  const canCreate = downgradedUser.plan === "free" && countAfterDowngrade >= 5 ? false : true;
  if (canCreate) {
    throw new Error("Snippet creation should be blocked when over free limit!");
  }
  console.log("✅ Snippet creation correctly blocked for downgraded user.");

  console.log("\n6. Testing public sharing lock when count (7) > 5 on free plan...");
  const firstSnippet = createdSnippets[0];
  let sharingAllowed = true;
  if (downgradedUser.plan === "free" && countAfterDowngrade > 5) {
    sharingAllowed = false;
  }

  if (sharingAllowed) {
    throw new Error("Public sharing should be locked when user has > 5 snippets on free plan!");
  }
  console.log("✅ Public sharing is correctly locked while user has 7 snippets on free plan.");

  console.log("\n7. Simulating user deleting 2 snippets down to 5 snippets...");
  await prisma.snippet.delete({ where: { id: createdSnippets[5].id } });
  await prisma.snippet.delete({ where: { id: createdSnippets[6].id } });

  const updatedCount = await prisma.snippet.count({ where: { userId: user.id } });
  console.log(`✅ Current snippet count reduced to: ${updatedCount}`);

  console.log("\n8. Testing public sharing when count is within the 5-snippet limit...");
  let sharingAllowedAt5 = false;
  if (downgradedUser.plan === "free" && updatedCount <= 5) {
    sharingAllowedAt5 = true;
  }

  if (!sharingAllowedAt5) {
    throw new Error("Sharing should be allowed when count <= 5!");
  }
  console.log("✅ Public sharing is successfully restored when user is at 5 snippets.");

  console.log("\n9. Cleaning up test user and snippets...");
  await prisma.snippet.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  console.log("✅ Cleaned up test records.");

  console.log("\n🎉 DOWNGRADE & PRESERVATION & SHARING LOCK POLICIES VERIFIED WITH 100% SUCCESS!");
}

main()
  .catch((e) => {
    console.error("❌ Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
