import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@abcd/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    const isDeveloper =
      user?.isDeveloper ||
      user?.role === "DEVELOPER" ||
      user?.email === "suman.baidya.pro@gmail.com";

    const isSuperAdmin =
      isDeveloper ||
      user?.isSuperAdmin ||
      user?.role === "SUPER_ADMIN" ||
      user?.email === "suman.baidya.pro@gmail.com";

    if (!session || !isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const workspaces = await prisma.workspace.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        brandKit: {
          select: {
            businessName: true,
            phoneNumber: true,
            defaultLanguage: true,
            tagline: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            subscription: {
              select: {
                planId: true,
                status: true,
                currentPeriodEnd: true,
              },
            },
            memberships: {
              select: {
                id: true,
                role: true,
                allowedPages: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            contentItems: true,
            socialAccounts: true,
          },
        },
      },
    });

    // Compute summary metrics
    const totalWorkspaces = workspaces.length;
    const approvedCount = workspaces.filter((w) => w.isApproved).length;
    const pendingCount = totalWorkspaces - approvedCount;

    const formattedTenants = workspaces.map((w) => {
      const ownerMembership =
        w.organization.memberships.find(
          (m) => m.role === "TENANT_ADMIN" || m.role === "OWNER"
        ) || w.organization.memberships[0];

      return {
        id: w.id,
        name: w.name,
        businessName: w.brandKit?.businessName || w.name,
        phoneNumber: w.brandKit?.phoneNumber || "",
        isApproved: w.isApproved,
        createdAt: w.createdAt,
        plan: w.organization.subscription?.planId || "starter",
        subscriptionStatus: w.organization.subscription?.status || "active",
        ownerEmail: ownerMembership?.user?.email || "Unknown",
        ownerName: ownerMembership?.user?.name || "Business Owner",
        totalMembers: w.organization.memberships.length,
        totalPosts: w._count.contentItems,
        totalChannels: w._count.socialAccounts,
        members: w.organization.memberships.map((m) => ({
          id: m.id,
          role: m.role,
          email: m.user.email,
          name: m.user.name,
          allowedPages: m.allowedPages,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalWorkspaces,
        approvedCount,
        pendingCount,
      },
      tenants: formattedTenants,
    });
  } catch (error: any) {
    console.error("Super Admin Tenants API error:", error);
    return NextResponse.json(
      { error: "Failed to load tenants", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    const isDeveloper =
      user?.isDeveloper ||
      user?.role === "DEVELOPER" ||
      user?.email === "suman.baidya.pro@gmail.com";

    const isSuperAdmin =
      isDeveloper ||
      user?.isSuperAdmin ||
      user?.role === "SUPER_ADMIN" ||
      user?.email === "suman.baidya.pro@gmail.com";

    if (!session || !isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { workspaceId, isApproved } = body;

    if (!workspaceId || typeof isApproved !== "boolean") {
      return NextResponse.json(
        { error: "Invalid payload: workspaceId and boolean isApproved required" },
        { status: 400 }
      );
    }

    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { isApproved },
      select: {
        id: true,
        name: true,
        isApproved: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      workspace: updatedWorkspace,
      message: `Workspace "${updatedWorkspace.name}" ${isApproved ? "approved successfully" : "suspended"}`,
    });
  } catch (error: any) {
    console.error("Super Admin Update Tenant API error:", error);
    return NextResponse.json(
      { error: "Failed to update tenant status", details: error.message },
      { status: 500 }
    );
  }
}
