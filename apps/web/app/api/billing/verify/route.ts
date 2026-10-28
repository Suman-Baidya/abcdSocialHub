import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, createTenantRepository, SubscriptionStatus } from "@abcd/db";
import { ABCD_PLANS, PlanKey, verifyPaymentSignature } from "@abcd/integrations";
import { z } from "zod";

export const dynamic = "force-dynamic";

const verifySchema = z.object({
  workspaceId: z.string().min(1),
  planId: z.enum(["starter", "growth", "topup_50"]),
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment data", details: parsed.error.format() }, { status: 400 });
    }

    const { workspaceId, planId, orderId, paymentId, signature } = parsed.data;

    // Verify workspace access
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        memberships: {
          include: {
            organization: {
              include: { workspaces: true },
            },
          },
        },
      },
    });

    const hasAccess = user?.memberships.some((m) =>
      m.organization.workspaces.some((w) => w.id === workspaceId)
    );

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden: No access to this workspace" }, { status: 403 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isMock = orderId.startsWith("order_mock_");

    // Real signature check if not mock and secret exists
    if (!isMock && keySecret && signature) {
      const isValid = verifyPaymentSignature(orderId, paymentId, signature, keySecret);
      if (!isValid) {
        return NextResponse.json({ error: "Payment verification failed: Invalid HMAC signature" }, { status: 400 });
      }
    }

    const repo = createTenantRepository(workspaceId);
    const planConfig = ABCD_PLANS[planId as PlanKey];

    if (planId === "topup_50") {
      // Top-up negative usage adds credits to ledger balance
      await repo.recordUsage("CREDIT_TOPUP", -50, {
        planId,
        orderId,
        paymentId,
        amountInRupees: planConfig.priceInRupees,
        replenishedCredits: 50,
      });
    } else {
      // Plan upgrade (Starter or Growth)
      await repo.upsertSubscription({
        planId,
        status: SubscriptionStatus.ACTIVE,
        razorpaySubId: paymentId,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      await repo.recordUsage("PLAN_UPGRADE", 0, {
        planId,
        orderId,
        paymentId,
        amountInRupees: planConfig.priceInRupees,
        monthlyQuota: planConfig.credits,
      });
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user?.id,
        workspaceId,
        action: planId === "topup_50" ? "BILLING_TOPUP_PURCHASED" : "BILLING_PLAN_UPGRADED",
        details: {
          planId,
          orderId,
          paymentId,
          amountInRupees: planConfig.priceInRupees,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully activated ${planConfig.name}`,
      planId,
    });
  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json(
      { error: "Payment verification failed", details: error.message },
      { status: 500 }
    );
  }
}
