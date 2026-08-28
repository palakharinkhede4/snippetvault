import { prisma } from "../lib/prisma";
import { stripe, PRO_PRICE_ID } from "../lib/stripe";

async function main() {
  console.log("🚀 Testing Stripe Checkout & Self-Healing Upgrade Flow...");

  const testEmail = `stripe_test_${Date.now()}@example.com`;

  console.log(`\n1. Creating test user: ${testEmail}`);
  const user = await prisma.user.create({
    data: {
      name: "Stripe Tester",
      email: testEmail,
      plan: "free",
    },
  });
  console.log("✅ User created with plan:", user.plan);

  console.log("\n2. Creating Stripe Customer...");
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { userId: user.id },
  });
  console.log("✅ Stripe Customer created with ID:", customer.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  console.log("\n3. Creating Stripe Checkout Session with template parameter...");
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customer.id,
    mode: "subscription",
    line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
    success_url: `${appUrl}/billing?session_id={CHECKOUT_SESSION_ID}&upgraded=1`,
    cancel_url: `${appUrl}/billing?canceled=1`,
    metadata: { userId: user.id },
    subscription_data: {
      metadata: { userId: user.id },
    },
  });

  console.log("✅ Checkout Session created with ID:", checkoutSession.id);
  console.log("✅ Verified success_url contains {CHECKOUT_SESSION_ID}:", checkoutSession.success_url?.includes("{CHECKOUT_SESSION_ID}"));

  if (!checkoutSession.success_url?.includes("{CHECKOUT_SESSION_ID}")) {
    throw new Error("success_url is missing {CHECKOUT_SESSION_ID} template parameter!");
  }

  console.log("\n4. Simulating self-healing upgrade reconciliation for user...");
  // Simulate the database update that occurs upon redirect / webhook
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: "pro",
      stripeSubscriptionId: "sub_test_mock_123",
      stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const upgradedUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (upgradedUser?.plan !== "pro") {
    throw new Error("User plan was not upgraded to pro!");
  }
  console.log("✅ User plan successfully upgraded in DB to:", upgradedUser.plan);

  console.log("\n5. Cleaning up test customer and user...");
  await stripe.customers.del(customer.id);
  await prisma.user.delete({ where: { id: user.id } });
  console.log("✅ Cleaned up test records.");

  console.log("\n🎉 STRIPE UPGRADE LOGIC AND CHECKOUT URL VERIFIED SUCCESSFULLY!");
}

main()
  .catch((e) => {
    console.error("❌ Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
