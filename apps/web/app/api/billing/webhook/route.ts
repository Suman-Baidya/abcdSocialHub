import { NextResponse } from "next/server";
import { prisma, createTenantRepository, SubscriptionStatus } from "@abcd/db";
import { ABCD_PLANS, PlanKey, verifyWebhookSignature } from "@abcd/integrations";

export const dynamic = "force-dynamic";

/**
 * Official Razorpay Webhook Handler
 * VERIFY: Razorpay Webhooks API documentation (https://razorpay.com/docs/webhooks/)
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn("RAZORPAY_WEBHOOK_SECRET is not configured. Webhook rejected.");
      return NextResponse.json({ error: "Webhook secret unconfigured" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
    }

    // Verify HMAC-SHA256 signature
    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error("Invalid Razorpay webhook signature detected");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const payment = payload.payload?.payment?.entity;
    const subscriptionEntity = payload.payload?.subscription?.entity;

    const workspaceId =
      payment?.notes?.workspaceId ||
      subscriptionEntity?.notes?.workspaceId;

    const planId = (payment?.notes?.planId || subscriptionEntity?.notes?.planId || "starter") as PlanKey;

    if (!workspaceId) {
      // Event without workspaceId (untracked or general event)
      return NextResponse.json({ status: "ignored_no_workspace" });
    }

    const repo = createTenantRepository(workspaceId);

    // Event Handling
    switch (event) {
      case "payment.captured": {
        const paymentId = payment.id;
        const amountInPaise = payment.amount;

        // Idempotency check: see if audit log already exists for this paymentId
        const existingAudit = await prisma.auditLog.findFirst({
          where: {
            workspaceId,
            details: {
              path: ["paymentId"],
              equals: paymentId,
            },
          },
        });

        if (existingAudit) {
          return NextResponse.json({ status: "already_processed" });
        }

        if (planId === "topup_50") {
          await repo.recordUsage("CREDIT_TOPUP", -50, {
            paymentId,
            planId,
            amountInPaise,
            source: "WEBHOOK",
          });
        } else {
          await repo.upsertSubscription({
            planId,
            status: SubscriptionStatus.ACTIVE,
            razorpaySubId: paymentId,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });

          await repo.recordUsage("SUBSCRIPTION_WEBHOOK_RENEWAL", 0, {
            paymentId,
            planId,
            amountInPaise,
            source: "WEBHOOK",
          });
        }

        await prisma.auditLog.create({
          data: {
            workspaceId,
            action: "RAZORPAY_PAYMENT_CAPTURED",
            details: { paymentId, planId, amountInPaise },
          },
        });
        break;
      }

      case "subscription.charged": {
        await repo.upsertSubscription({
          planId,
          status: SubscriptionStatus.ACTIVE,
          razorpaySubId: subscriptionEntity?.id,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        await prisma.auditLog.create({
          data: {
            workspaceId,
            action: "RAZORPAY_SUBSCRIPTION_CHARGED",
            details: { subscriptionId: subscriptionEntity?.id, planId },
          },
        });
        break;
      }

      case "subscription.cancelled": {
        await repo.upsertSubscription({
          planId,
          status: SubscriptionStatus.CANCELED,
        });

        await prisma.auditLog.create({
          data: {
            workspaceId,
            action: "RAZORPAY_SUBSCRIPTION_CANCELLED",
            details: { subscriptionId: subscriptionEntity?.id },
          },
        });
        break;
      }

      default:
        console.log(`Unhandled Razorpay event: ${event}`);
    }

    return NextResponse.json({ status: "success", event });
  } catch (error: any) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: "Internal webhook failure", details: error.message }, { status: 500 });
  }
}
