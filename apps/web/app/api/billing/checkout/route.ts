import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, createTenantRepository } from "@abcd/db";
import { ABCD_PLANS, PlanKey, createRazorpayOrder } from "@abcd/integrations";
import { z } from "zod";

export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
  planId: z.enum(["starter", "growth", "topup_50"]),
  workspaceId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
    }

    const { planId, workspaceId } = parsed.data;

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

    const planConfig = ABCD_PLANS[planId as PlanKey];
    if (!planConfig) {
      return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Live Razorpay order flow when keys are present
    if (keyId && keySecret) {
      const order = await createRazorpayOrder(keyId, keySecret, {
        amountInPaise: planConfig.priceInPaise,
        currency: "INR",
        receipt: `rcpt_${workspaceId.slice(0, 8)}_${Date.now().toString().slice(-6)}`,
        notes: {
          workspaceId,
          planId,
          userId: user?.id || "",
          userEmail: session.user.email!,
        },
      });

      return NextResponse.json({
        isMock: false,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
        plan: planConfig,
        user: {
          name: session.user.name || "Business Owner",
          email: session.user.email,
        },
      });
    }

    // Demo/Development Mock Order (no Razorpay credentials needed for local testing)
    const mockOrderId = `order_mock_${Date.now().toString(36)}`;
    return NextResponse.json({
      isMock: true,
      orderId: mockOrderId,
      amount: planConfig.priceInPaise,
      currency: "INR",
      keyId: "rzp_test_mock123",
      plan: planConfig,
      user: {
        name: session.user.name || "Business Owner",
        email: session.user.email,
      },
      message: "Development mode: Mock order generated without live Razorpay keys.",
    });
  } catch (error: any) {
    console.error("Billing Checkout Error:", error);
    return NextResponse.json(
      { error: "Failed to initiate checkout", details: error.message },
      { status: 500 }
    );
  }
}
