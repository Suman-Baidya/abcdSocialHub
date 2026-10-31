import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@abcd/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

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
      // 🔒 SHADOW DEVELOPER RULE:
      // If the caller is NOT Developer, filter out DEVELOPER memberships and identity
      let memberships = w.organization.memberships;
      if (!isDeveloper) {
        memberships = memberships.filter(
          (m) =>
            (m.role as string) !== "DEVELOPER" &&
            m.user.email?.toLowerCase() !== "suman.baidya.pro@gmail.com"
        );
      }

      const ownerMembership =
        memberships.find(
          (m) => m.role === "TENANT_ADMIN" || m.role === "OWNER"
        ) || memberships[0];

      let ownerEmail = ownerMembership?.user?.email || "owner@abcdsocial.in";
      let ownerName = ownerMembership?.user?.name || "Business Owner";

      if (!isDeveloper && ownerEmail.toLowerCase() === "suman.baidya.pro@gmail.com") {
        ownerEmail = "owner@abcdsocial.in";
        ownerName = "Platform Owner";
      }

      return {
        id: w.id,
        name: w.name,
        businessName: w.brandKit?.businessName || w.name,
        phoneNumber: w.brandKit?.phoneNumber || "",
        isApproved: w.isApproved,
        createdAt: w.createdAt,
        plan: w.organization.subscription?.planId || "starter",
        subscriptionStatus: w.organization.subscription?.status || "active",
        ownerEmail,
        ownerName,
        totalMembers: memberships.length,
        totalPosts: w._count.contentItems,
        totalChannels: w._count.socialAccounts,
        members: memberships.map((m) => ({
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

export async function POST(req: Request) {
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
    const createSchema = z.object({
      businessName: z.string().trim().min(2, "Business name is required"),
      ownerName: z.string().trim().min(2, "Owner name is required"),
      ownerEmail: z.string().trim().email("Valid owner email is required"),
      phoneNumber: z.string().trim().optional(),
      plan: z.enum(["starter", "growth", "agency"]).default("starter"),
      isApproved: z.boolean().default(true),
    });

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { businessName, ownerName, ownerEmail, phoneNumber, plan, isApproved } = parsed.data;
    const cleanEmail = ownerEmail.toLowerCase();

    // 1. Check or create User
    let targetUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!targetUser) {
      const hashedPassword = await bcrypt.hash("Password123!", 10);
      targetUser = await prisma.user.create({
        data: {
          name: ownerName,
          email: cleanEmail,
          passwordHash: hashedPassword,
          phone: phoneNumber || null,
        },
      });
    }

    // 2. Generate unique slug
    const slugBase = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30);
    const uniqueSlug = `${slugBase}-${Date.now().toString(36)}`;

    // 3. Atomically create Organization, Workspace, BrandKit, Membership, and Subscription
    const newTenant = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: businessName,
          slug: uniqueSlug,
          subscription: {
            create: {
              planId: plan,
              status: "ACTIVE",
            },
          },
        },
      });

      const ws = await tx.workspace.create({
        data: {
          name: businessName,
          organizationId: org.id,
          isApproved,
          brandKit: {
            create: {
              businessName,
              phoneNumber: phoneNumber || "+91 98000 00000",
              addressBanner: "Kolkata, West Bengal",
              defaultLanguage: "bengali",
              primaryColor: "#00F0FF",
              secondaryColor: "#0A0D14",
            },
          },
        },
      });

      await tx.membership.create({
        data: {
          userId: targetUser.id,
          organizationId: org.id,
          role: "TENANT_ADMIN",
          allowedPages: [],
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: (session.user as any)?.id,
          workspaceId: ws.id,
          action: "TENANT_CREATED",
          details: {
            businessName,
            ownerEmail: cleanEmail,
            plan,
            isApproved,
          },
        },
      });

      return ws;
    });

    return NextResponse.json({
      success: true,
      workspace: newTenant,
      message: `Tenant workspace "${businessName}" created successfully`,
    });
  } catch (error: any) {
    console.error("Super Admin Create Tenant API error:", error);
    return NextResponse.json(
      { error: "Failed to create tenant workspace", details: error.message },
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

export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url);
    let workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) {
      const body = await req.json().catch(() => ({}));
      workspaceId = body.workspaceId;
    }

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { organization: { include: { workspaces: true } } },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const orgId = workspace.organizationId;
    const orgWorkspacesCount = workspace.organization.workspaces.length;

    await prisma.$transaction(async (tx) => {
      // Delete workspace (cascades to BrandKit, ContentItem, SocialAccount, UsageLedger, AuditLog)
      await tx.workspace.delete({
        where: { id: workspaceId },
      });

      // If this was the only workspace of this organization, delete the organization as well
      if (orgWorkspacesCount <= 1) {
        await tx.organization.delete({
          where: { id: orgId },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Workspace "${workspace.name}" deleted successfully`,
    });
  } catch (error: any) {
    console.error("Super Admin Delete Tenant API error:", error);
    return NextResponse.json(
      { error: "Failed to delete tenant workspace", details: error.message },
      { status: 500 }
    );
  }
}
