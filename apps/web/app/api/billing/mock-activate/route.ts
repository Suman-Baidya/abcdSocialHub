import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, createTenantRepository, SubscriptionStatus } from "@abcd/db";
import { ABCD_PLANS, PlanKey } from "@abcd/integrations";
import { z } from "zod";

export const dynamic = "force-dynamic";

const mockSchema = z.object({
  workspaceId: z.string().min(1),
  planId: z.enum(["starter", "growth", "topup_50"]),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = mockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.format() }, { status: 400 });
    }

    const { workspaceId, planId } = parsed.data;

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

    const repo = createTenantRepository(workspaceId);
    const planConfig = ABCD_PLANS[planId as PlanKey];
    const demoRef = `demo_${Date.now().toString(36)}`;

    if (planId === "topup_50") {
      await repo.recordUsage("CREDIT_TOPUP", -50, {
        planId,
        demoRef,
        amountInRupees: planConfig.priceInRupees,
        mode: "DEV_MOCK_ACTIVATION",
      });
    } else {
      await repo.upsertSubscription({
        planId,
        status: SubscriptionStatus.ACTIVE,
        razorpaySubId: `sub_${demoRef}`,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      await repo.recordUsage("PLAN_UPGRADE", 0, {
        planId,
        demoRef,
        amountInRupees: planConfig.priceInRupees,
        mode: "DEV_MOCK_ACTIVATION",
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user?.id,
        workspaceId,
        action: "BILLING_DEMO_ACTIVATION",
        details: { planId, demoRef },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Demo mode: Activated ${planConfig.name}`,
      planId,
    });
  } catch (error: any) {
    console.error("Mock Activate Error:", error);
    return NextResponse.json(
      { error: "Failed to activate demo plan", details: error.message },
      { status: 500 }
    );
  }
}
