import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, createTenantRepository, SubscriptionStatus } from "@abcd/db";
import { ABCD_PLANS, PlanKey } from "@abcd/integrations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceIdParam = searchParams.get("workspaceId");

    // Fetch user with organizations and workspaces
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        memberships: {
          include: {
            organization: {
              include: {
                workspaces: true,
                subscription: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.memberships.length === 0) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    // Role check: Staff cannot access billing
    const primaryMembership = user.memberships[0];
    if (primaryMembership.role === "STAFF") {
      return NextResponse.json(
        { error: "Forbidden: Staff members cannot view billing information" },
        { status: 403 }
      );
    }

    // Active workspace resolution
    const organization = primaryMembership.organization;
    const activeWorkspace =
      organization.workspaces.find((w) => w.id === workspaceIdParam) ||
      organization.workspaces[0];

    if (!activeWorkspace) {
      return NextResponse.json({ error: "No workspace found" }, { status: 404 });
    }

    const repo = createTenantRepository(activeWorkspace.id);

    // Fetch subscription or initialize default starter
    let subscription = await repo.getSubscription();
    if (!subscription) {
      subscription = await repo.upsertSubscription({
        planId: "starter",
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }

    const usedThisMonth = await repo.getMonthlyCreditUsage();
    const recentUsage = await repo.getRecentUsage(20);

    const activePlanKey = (subscription.planId || "starter") as PlanKey;
    const planConfig = ABCD_PLANS[activePlanKey] || ABCD_PLANS.starter;
    const allocatedCredits = planConfig.credits || 30;
    const remainingCredits = Math.max(0, allocatedCredits - usedThisMonth);

    return NextResponse.json({
      workspaceId: activeWorkspace.id,
      organizationId: organization.id,
      organizationName: organization.name,
      subscription: {
        planId: subscription.planId,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        razorpaySubId: subscription.razorpaySubId,
      },
      credits: {
        allocated: allocatedCredits,
        usedThisMonth,
        remaining: remainingCredits,
      },
      plans: ABCD_PLANS,
      recentUsage,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "",
    });
  } catch (error: any) {
    console.error("Billing GET API Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve billing information", details: error.message },
      { status: 500 }
    );
  }
}
