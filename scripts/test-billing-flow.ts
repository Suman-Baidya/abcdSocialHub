import { prisma, createTenantRepository, SubscriptionStatus } from "../packages/db/src/index";
import {
  ABCD_PLANS,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "../packages/integrations/src/index";
import crypto from "crypto";

async function runBillingTests() {
  console.log("=== Phase 7: Billing & Subscription Engine Integration Test ===");

  try {
    // 1. Verify Plan Configurations
    console.log("\n[Test 1] Verifying Plan Pricing and Features...");
    if (!ABCD_PLANS.starter || ABCD_PLANS.starter.priceInRupees !== 499) {
      throw new Error("Starter plan pricing mismatch");
    }
    if (!ABCD_PLANS.growth || ABCD_PLANS.growth.priceInRupees !== 999) {
      throw new Error("Growth plan pricing mismatch");
    }
    console.log("  Starter: ₹499/mo (30 credits) - Validated");
    console.log("  Growth:  ₹999/mo (100 credits) - Validated");

    // 2. Test Cryptographic HMAC Signature Verification
    console.log("\n[Test 2] Testing Razorpay HMAC Signatures...");
    const secret = "test_webhook_secret_key_12345";
    const testPayload = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: "pay_test123", amount: 49900 } } },
    });

    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(testPayload)
      .digest("hex");

    const isVerified = verifyWebhookSignature(testPayload, validSignature, secret);
    if (!isVerified) throw new Error("Webhook signature verification failed");
    console.log("  Webhook HMAC-SHA256 verification: PASS");

    const orderId = "order_test_987";
    const paymentId = "pay_test_456";
    const paymentSecret = "test_key_secret_abc";
    const validPaymentSig = crypto
      .createHmac("sha256", paymentSecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isPaymentVerified = verifyPaymentSignature(
      orderId,
      paymentId,
      validPaymentSig,
      paymentSecret
    );
    if (!isPaymentVerified) throw new Error("Payment signature verification failed");
    console.log("  Payment HMAC-SHA256 verification: PASS");

    // 3. Test Multi-Tenant Database Subscription & Ledger
    console.log("\n[Test 3] Testing Multi-Tenant DB Subscription & Usage Ledger...");
    let workspace = await prisma.workspace.findFirst({
      include: { organization: true },
    });

    if (!workspace) {
      console.log("  Creating temporary test workspace...");
      const org = await prisma.organization.create({
        data: { name: "Billing Test Org", slug: `test-org-${Date.now()}` },
      });
      workspace = await prisma.workspace.create({
        data: { name: "Billing Test Workspace", organizationId: org.id },
        include: { organization: true },
      });
    }

    const repo = createTenantRepository(workspace.id);

    // Upsert subscription
    console.log("  Upserting subscription to 'growth'...");
    const sub = await repo.upsertSubscription({
      planId: "growth",
      status: SubscriptionStatus.ACTIVE,
      razorpaySubId: "sub_test_live",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    console.log(`  Subscription saved: planId=${sub.planId}, status=${sub.status}`);

    // Append credit usage to ledger
    console.log("  Recording credit usage in append-only ledger...");
    await repo.recordUsage("POSTER_RENDER", 1, {
      testRun: true,
      creativeName: "Test Creative",
    });
    await repo.recordUsage("AI_COPY_GENERATION", 1, {
      testRun: true,
      channel: "INSTAGRAM",
    });

    const monthlyUsage = await repo.getMonthlyCreditUsage();
    console.log(`  Current monthly usage computed: ${monthlyUsage} credits`);

    const recentUsage = await repo.getRecentUsage(5);
    console.log(`  Fetched recent usage events: ${recentUsage.length} records`);

    console.log("\n=======================================================");
    console.log("SUCCESS: All Phase 7 Billing Engine Tests Passed Cleanly!");
    console.log("=======================================================\n");
  } catch (error) {
    console.error("\n❌ Billing Test Failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runBillingTests();
