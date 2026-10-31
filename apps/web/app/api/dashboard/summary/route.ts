import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, createTenantRepository, PostStatus } from "@abcd/db";
import { ABCD_PLANS, PlanKey } from "@abcd/integrations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceIdParam = searchParams.get("workspaceId");

    // Check for impersonated customer workspace cookie (Developer & Super Admin privilege)
    const cookieHeader = req.headers.get("cookie") || "";
    const impMatch = cookieHeader.match(/abcd_impersonated_workspace_id=([^;]+)/);
    const impersonatedWorkspaceId = impMatch ? decodeURIComponent(impMatch[1]) : null;

    const sessionUser = session.user as any;
    const isDeveloper =
      sessionUser?.isDeveloper ||
      sessionUser?.role === "DEVELOPER" ||
      session.user.email?.toLowerCase() === "suman.baidya.pro@gmail.com";
    const isSuperAdmin =
      isDeveloper ||
      sessionUser?.isSuperAdmin ||
      sessionUser?.role === "SUPER_ADMIN" ||
      session.user.email?.toLowerCase() === "suman.baidya.pro@gmail.com";

    let activeWorkspace: any = null;
    let organization: any = null;
    let isImpersonating = false;

    if (impersonatedWorkspaceId && isSuperAdmin) {
      const impWs = await prisma.workspace.findUnique({
        where: { id: impersonatedWorkspaceId },
        include: {
          brandKit: true,
          organization: {
            include: {
              subscription: true,
            },
          },
        },
      });

      if (impWs) {
        activeWorkspace = impWs;
        organization = impWs.organization;
        isImpersonating = true;
      }
    }

    if (!activeWorkspace) {
      // Standard user tenant resolution
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
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

      const membership = user.memberships[0];
      organization = membership.organization;
      activeWorkspace =
        organization.workspaces.find((w: any) => w.id === workspaceIdParam) ||
        organization.workspaces.find((w: any) => w.id === (session.user as any).workspaceId) ||
        organization.workspaces[0];
    }

    if (!activeWorkspace) {
      return NextResponse.json({ error: "No workspace found" }, { status: 404 });
    }

    const workspaceId = activeWorkspace.id;
    const repo = createTenantRepository(workspaceId);

    // Concurrently fetch counts, recent posts, social connections, and usage
    const [
      publishedCount,
      scheduledCount,
      inReviewCount,
      totalCount,
      recentPosts,
      socialAccounts,
      usedThisMonth,
      subscription,
      brandKit,
    ] = await Promise.all([
      prisma.contentItem.count({
        where: { workspaceId, status: PostStatus.PUBLISHED },
      }),
      prisma.contentItem.count({
        where: { workspaceId, status: PostStatus.SCHEDULED },
      }),
      prisma.contentItem.count({
        where: { workspaceId, status: PostStatus.IN_REVIEW },
      }),
      prisma.contentItem.count({
        where: { workspaceId },
      }),
      prisma.contentItem.findMany({
        where: { workspaceId },
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          variants: {
            select: {
              id: true,
              platform: true,
              caption: true,
              mediaUrl: true,
              mediaType: true,
              hashtags: true,
            },
          },
        },
      }),
      prisma.socialAccount.findMany({
        where: { workspaceId },
        select: {
          id: true,
          platform: true,
          accountName: true,
          isActive: true,
          updatedAt: true,
        },
      }),
      repo.getMonthlyCreditUsage(),
      repo.getSubscription(),
      repo.getBrandKit(),
    ]);

    // Credit quota calculations
    const activePlanKey = (subscription?.planId || "starter") as PlanKey;
    const planConfig = ABCD_PLANS[activePlanKey] || ABCD_PLANS.starter;
    const allocatedCredits = planConfig.credits || 30;
    const remainingCredits = Math.max(0, allocatedCredits - usedThisMonth);

    // Format channel health mapping
    const channels = {
      FACEBOOK_PAGE: socialAccounts.find((a) => a.platform === "FACEBOOK_PAGE") || null,
      INSTAGRAM_BUSINESS: socialAccounts.find((a) => a.platform === "INSTAGRAM_BUSINESS") || null,
      LINKEDIN: socialAccounts.find((a) => a.platform === "LINKEDIN") || null,
      X_TWITTER: socialAccounts.find((a) => a.platform === "X_TWITTER") || null,
    };

    // Find the next scheduled item and upcoming queue
    const upcomingScheduled = await prisma.contentItem.findMany({
      where: {
        workspaceId,
        status: PostStatus.SCHEDULED,
      },
      orderBy: { scheduledFor: "asc" },
      take: 4,
      include: {
        variants: {
          select: {
            id: true,
            platform: true,
            caption: true,
            mediaUrl: true,
          },
        },
      },
    });

    const nextScheduled = upcomingScheduled[0] ? {
      id: upcomingScheduled[0].id,
      title: upcomingScheduled[0].title,
      scheduledFor: upcomingScheduled[0].scheduledFor,
    } : null;

    // Find item requiring human review
    const pendingReviewItem = await prisma.contentItem.findFirst({
      where: {
        workspaceId,
        status: PostStatus.IN_REVIEW,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      isImpersonating,
      workspace: {
        id: activeWorkspace.id,
        name: activeWorkspace.name,
        organizationName: organization?.name || activeWorkspace.name,
        businessName: brandKit?.businessName || activeWorkspace.name,
        phoneNumber: brandKit?.phoneNumber || "",
        isApproved: activeWorkspace.isApproved ?? true,
      },
      stats: {
        publishedCount,
        scheduledCount,
        inReviewCount,
        totalCount,
      },
      autopilot: {
        nextScheduled,
        pendingReviewItem,
        upcomingScheduled,
      },
      brand: brandKit
        ? {
            businessName: brandKit.businessName,
            tagline: brandKit.tagline,
            primaryColor: brandKit.primaryColor,
            secondaryColor: brandKit.secondaryColor,
            defaultLanguage: brandKit.defaultLanguage,
            phoneNumber: brandKit.phoneNumber,
          }
        : null,
      credits: {
        allocated: allocatedCredits,
        used: usedThisMonth,
        remaining: remainingCredits,
        percentageUsed: Math.min(100, Math.round((usedThisMonth / allocatedCredits) * 100)),
        planName: planConfig.name,
      },
      channels,
      recentPosts,
    });
  } catch (error: any) {
    console.error("Dashboard summary API error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard summary", details: error.message },
      { status: 500 }
    );
  }
}
