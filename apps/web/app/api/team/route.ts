import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "@abcd/db";

export const dynamic = "force-dynamic";

function parseEmailList(val?: string, fallback: string = ""): string[] {
  const str = val || fallback;
  return str
    .split(",")
    .map((e) => e.replace(/['"]/g, "").trim().toLowerCase())
    .filter(Boolean);
}

const DEVELOPER_EMAILS = parseEmailList(
  process.env.DEVELOPER_EMAILS || process.env.DEVELOPER_EMAIL,
  "suman.baidya.pro@gmail.com"
);

export interface TeamMember {
  id: string;
  userId?: string;
  name: string;
  email: string;
  role: "DEVELOPER" | "SUPER_ADMIN" | "SUPER_ADMIN_STAFF" | "TENANT_ADMIN" | "OWNER" | "ADMIN_STAFF" | "STAFF" | "CREATOR" | "GUEST";
  status: "ACTIVE" | "INVITED" | "PAUSED";
  joinedAt: string;
  workspaceName?: string;
  organizationId?: string;
  allowedPages?: string[];
  avatarUrl?: string | null;
  lastActive?: string;
  isOwner?: boolean;
}

export interface PendingInvitation {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  allowedPages: string[];
  token: string;
  inviteUrl: string;
  workspaceName?: string;
  createdAt: string;
  expiresAt: string;
}

// Validation schemas
const inviteSchema = z.object({
  email: z.string().trim().email("Please provide a valid work email address"),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60).optional(),
  role: z.enum([
    "DEVELOPER",
    "SUPER_ADMIN",
    "SUPER_ADMIN_STAFF",
    "TENANT_ADMIN",
    "OWNER",
    "ADMIN_STAFF",
    "STAFF",
    "CREATOR",
    "GUEST",
  ]).default("ADMIN_STAFF"),
  allowedPages: z.array(z.string()).default(["content", "calendar"]),
  organizationId: z.string().optional(),
});

const patchMemberSchema = z.object({
  id: z.string().min(1, "Member ID is required"),
  allowedPages: z.array(z.string()).optional(),
  role: z.enum([
    "DEVELOPER",
    "SUPER_ADMIN",
    "SUPER_ADMIN_STAFF",
    "TENANT_ADMIN",
    "OWNER",
    "ADMIN_STAFF",
    "STAFF",
    "CREATOR",
    "GUEST",
  ]).optional(),
});

// Helper: Resolve authenticated user & role scope
async function resolveAuthAndScope() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "Unauthorized: Please sign in", status: 401 };
  }

  const sessionUser = session.user as any;
  const email = (sessionUser.email || "").toLowerCase().trim();
  const isDeveloper =
    sessionUser?.isDeveloper ||
    sessionUser?.role === "DEVELOPER" ||
    DEVELOPER_EMAILS.includes(email);

  const isSuperAdmin =
    isDeveloper ||
    sessionUser?.isSuperAdmin ||
    sessionUser?.role === "SUPER_ADMIN" ||
    DEVELOPER_EMAILS.includes(email);

  // Resolve user record from DB
  const dbUser = await prisma.user.findUnique({
    where: { email },
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

  if (!dbUser) {
    return { error: "User account not found in database", status: 404 };
  }

  const primaryMembership = dbUser.memberships[0];
  const organizationId = primaryMembership?.organizationId || sessionUser.organizationId;
  const effectiveRole = isDeveloper
    ? "DEVELOPER"
    : isSuperAdmin
    ? "SUPER_ADMIN"
    : ((primaryMembership?.role as string) || (sessionUser.role as string) || "TENANT_ADMIN");

  const isCreator = !isSuperAdmin && (effectiveRole === "CREATOR" || sessionUser.dashboardType === "CREATOR");

  return {
    user: dbUser,
    sessionUser,
    primaryMembership,
    organizationId,
    effectiveRole,
    isDeveloper,
    isSuperAdmin,
    isCreator,
  };
}

// ─────────────────────────────────────────────────────────────
// GET: Query Team Members & Invitations based on Scope Hierarchy
// ─────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const auth = await resolveAuthAndScope();
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { isDeveloper, isSuperAdmin, isCreator, organizationId, user, primaryMembership } = auth;
    const url = new URL(req.url);
    const origin = url.origin || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const search = (url.searchParams.get("search") || "").toLowerCase().trim();
    const roleFilter = (url.searchParams.get("role") || "ALL").toUpperCase();

    // ──────────────────────────────────────────────────────────
    // HIERARCHY LEVEL 1: CREATOR (Solo Workspace)
    // ──────────────────────────────────────────────────────────
    if (isCreator) {
      return NextResponse.json({
        success: true,
        isCreatorSolo: true,
        isPlatformAdmin: false,
        members: [
          {
            id: primaryMembership?.id || "mem_creator_solo",
            userId: user.id,
            name: user.name || "Solo Creator",
            email: user.email || "",
            role: "CREATOR",
            status: "ACTIVE",
            joinedAt: user.createdAt.toISOString(),
            avatarUrl: user.image,
            allowedPages: ["content", "calendar", "dashboard", "brand"],
            isOwner: true,
          },
        ],
        invitations: [],
        stats: {
          totalCount: 1,
          activeCount: 1,
          invitedCount: 0,
          maxSeats: 1,
          availableSeats: 0,
        },
      });
    }

    // ──────────────────────────────────────────────────────────
    // HIERARCHY LEVEL 2: PLATFORM ADMIN (DEVELOPER & SUPER_ADMIN)
    // - Developer can see ALL users (including other developers)
    // - Super Admin can see ALL users EXCEPT developers (Shadow Developer rule)
    // ──────────────────────────────────────────────────────────
    if (isDeveloper || isSuperAdmin) {
      const [allDbUsers, allDbInvitations] = await Promise.all([
        prisma.user.findMany({
          include: {
            memberships: {
              include: {
                organization: {
                  include: { workspaces: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.teamInvitation.findMany({
          where: {
            status: "PENDING",
            expiresAt: { gte: new Date() },
          },
          include: {
            organization: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      let platformMembers: TeamMember[] = allDbUsers.map((u) => {
        const primaryMem = u.memberships[0];
        const isUserDev = DEVELOPER_EMAILS.includes((u.email || "").toLowerCase().trim());
        let calculatedRole: TeamMember["role"] = (primaryMem?.role as any) || "TENANT_ADMIN";
        if (isUserDev) {
          calculatedRole = "DEVELOPER";
        } else if (u.email && u.email === "suman.baidya.pro@gmail.com") {
          calculatedRole = "DEVELOPER";
        }

        const workspaceName = primaryMem?.organization?.name || "Global Platform";
        const isOwner =
          calculatedRole === "DEVELOPER" ||
          calculatedRole === "SUPER_ADMIN" ||
          calculatedRole === "TENANT_ADMIN" ||
          calculatedRole === "OWNER";

        return {
          id: primaryMem?.id || `usr_${u.id}`,
          userId: u.id,
          name: u.name || u.email?.split("@")[0] || "User",
          email: u.email || "",
          role: calculatedRole,
          status: "ACTIVE" as const,
          workspaceName,
          organizationId: primaryMem?.organizationId,
          joinedAt: u.createdAt.toISOString(),
          allowedPages: primaryMem?.allowedPages || [],
          avatarUrl: u.image,
          lastActive: u.updatedAt.toISOString(),
          isOwner,
        };
      });

      // 🔒 SHADOW DEVELOPER RULE:
      // Super Admin sees all user types EXCEPT Developer
      if (!isDeveloper) {
        platformMembers = platformMembers.filter(
          (m) =>
            m.role !== "DEVELOPER" &&
            !DEVELOPER_EMAILS.includes(m.email.toLowerCase().trim())
        );
      }

      // Map pending platform invitations
      const pendingInvitations: PendingInvitation[] = allDbInvitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        name: inv.name,
        role: inv.role,
        allowedPages: inv.allowedPages || [],
        token: inv.token,
        inviteUrl: `${origin}/invite/${inv.token}`,
        workspaceName: inv.organization.name,
        createdAt: inv.createdAt.toISOString(),
        expiresAt: inv.expiresAt.toISOString(),
      }));

      // Apply Filters
      let filtered = platformMembers;
      if (search) {
        filtered = filtered.filter(
          (m) =>
            m.name.toLowerCase().includes(search) ||
            m.email.toLowerCase().includes(search) ||
            (m.workspaceName && m.workspaceName.toLowerCase().includes(search))
        );
      }
      if (roleFilter !== "ALL") {
        if (roleFilter === "ADMIN") {
          filtered = filtered.filter(
            (m) => m.role === "TENANT_ADMIN" || m.role === "OWNER" || m.role === "SUPER_ADMIN" || m.role === "DEVELOPER"
          );
        } else if (roleFilter === "STAFF") {
          filtered = filtered.filter(
            (m) => m.role === "ADMIN_STAFF" || m.role === "STAFF" || m.role === "SUPER_ADMIN_STAFF"
          );
        } else {
          filtered = filtered.filter((m) => m.role === roleFilter);
        }
      }

      return NextResponse.json({
        success: true,
        isPlatformAdmin: true,
        isDeveloper,
        isCreatorSolo: false,
        members: filtered,
        invitations: pendingInvitations,
        stats: {
          totalCount: platformMembers.length,
          activeCount: platformMembers.length,
          invitedCount: pendingInvitations.length,
          maxSeats: 100,
          availableSeats: Math.max(0, 100 - platformMembers.length),
          tenantAdminCount: platformMembers.filter((m) => m.role === "TENANT_ADMIN" || m.role === "OWNER").length,
          staffCount: platformMembers.filter((m) => m.role === "ADMIN_STAFF" || m.role === "STAFF").length,
          creatorCount: platformMembers.filter((m) => m.role === "CREATOR").length,
          superAdminCount: platformMembers.filter((m) => m.role === "SUPER_ADMIN" || m.role === "SUPER_ADMIN_STAFF").length,
        },
      });
    }

    // ──────────────────────────────────────────────────────────
    // HIERARCHY LEVEL 3: TENANT ADMIN
    // - Sees ONLY teammates in their own organization
    // - Strictly 2 posts: Admin & Staff (Team Mate)
    // ──────────────────────────────────────────────────────────
    if (!organizationId) {
      return NextResponse.json({ success: false, error: "No organization assigned to account." }, { status: 403 });
    }

    const [dbMemberships, dbInvitations] = await Promise.all([
      prisma.membership.findMany({
        where: { organizationId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              phone: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.teamInvitation.findMany({
        where: {
          organizationId,
          status: "PENDING",
          expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    let activeMembers: TeamMember[] = dbMemberships.map((m) => {
      const isOwner = m.role === "OWNER" || m.role === "TENANT_ADMIN";
      return {
        id: m.id,
        userId: m.userId,
        name: m.user.name || m.user.email?.split("@")[0] || "Teammate",
        email: m.user.email || "",
        role: m.role as any,
        status: "ACTIVE",
        joinedAt: m.createdAt.toISOString(),
        allowedPages: m.allowedPages || [],
        avatarUrl: m.user.image,
        lastActive: m.user.updatedAt.toISOString(),
        isOwner,
      };
    });

    // Conceal Developer root account from tenant view
    activeMembers = activeMembers.filter(
      (m) =>
        (m.role as string) !== "DEVELOPER" &&
        !DEVELOPER_EMAILS.includes(m.email.toLowerCase().trim())
    );

    const pendingInvitations: PendingInvitation[] = dbInvitations.map((inv) => ({
      id: inv.id,
      email: inv.email,
      name: inv.name,
      role: inv.role,
      allowedPages: inv.allowedPages || [],
      token: inv.token,
      inviteUrl: `${origin}/invite/${inv.token}`,
      createdAt: inv.createdAt.toISOString(),
      expiresAt: inv.expiresAt.toISOString(),
    }));

    // Apply Tenant Search / Filter
    let filtered = activeMembers;
    if (search) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.email.toLowerCase().includes(search)
      );
    }
    if (roleFilter !== "ALL") {
      filtered = filtered.filter((m) => m.role === roleFilter);
    }

    const maxSeats = 5;
    const totalCount = activeMembers.length + pendingInvitations.length;
    const availableSeats = Math.max(0, maxSeats - totalCount);

    return NextResponse.json({
      success: true,
      isPlatformAdmin: false,
      isDeveloper: false,
      isCreatorSolo: false,
      members: filtered,
      invitations: pendingInvitations,
      stats: {
        totalCount,
        activeCount: activeMembers.length,
        invitedCount: pendingInvitations.length,
        maxSeats,
        availableSeats,
      },
    });
  } catch (error: any) {
    console.error("[Team API GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load team roster" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// POST: Dispatch / Create Teammate Invitation
// ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const auth = await resolveAuthAndScope();
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { isDeveloper, isSuperAdmin, isCreator, organizationId: authOrgId, user } = auth;

    if (isCreator) {
      return NextResponse.json(
        { success: false, error: "Creator accounts are solo and cannot add teammates." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = inviteSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || "Validation failed",
        },
        { status: 400 }
      );
    }

    const { email, name, role, allowedPages, organizationId: targetOrgId } = parseResult.data;
    const cleanEmail = email.toLowerCase().trim();

    // 🔒 ROLE AUTHORIZATION CHECK:
    // 1. Only Developer can invite Developer
    if (role === "DEVELOPER" && !isDeveloper) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only Developer root can invite another Developer." },
        { status: 403 }
      );
    }

    // 2. Only Super Admin or Developer can invite Super Admin roles
    if ((role === "SUPER_ADMIN" || role === "SUPER_ADMIN_STAFF") && !isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Super Admin access required." },
        { status: 403 }
      );
    }

    // 3. Regular Tenant Admin can strictly only invite Staff (Team Mate)
    if (!isSuperAdmin && role !== "ADMIN_STAFF" && role !== "STAFF") {
      return NextResponse.json(
        { success: false, error: "Tenant Administrators can only invite Staff (Team Mate)." },
        { status: 403 }
      );
    }

    // Resolve target organization
    const orgId = isSuperAdmin && targetOrgId ? targetOrgId : authOrgId;
    if (!orgId) {
      return NextResponse.json(
        { success: false, error: "Organization ID is required for team invitation." },
        { status: 400 }
      );
    }

    // Check if user is already an active member in this organization
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        memberships: {
          where: { organizationId: orgId },
        },
      },
    });

    if (existingUser && existingUser.memberships.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "A user with this email is already a member of this workspace.",
        },
        { status: 409 }
      );
    }

    // Generate Cryptographic 32-Byte Token & Expiration (7 days)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Remove any previous pending invitation for this email in this org
    await prisma.teamInvitation.deleteMany({
      where: {
        organizationId: orgId,
        email: cleanEmail,
        status: "PENDING",
      },
    });

    const invitation = await prisma.teamInvitation.create({
      data: {
        email: cleanEmail,
        name: name || cleanEmail.split("@")[0],
        role: role as any,
        allowedPages: allowedPages.length > 0 ? allowedPages : ["content", "calendar"],
        token: rawToken,
        organizationId: orgId,
        inviterId: user.id,
        status: "PENDING",
        expiresAt,
      },
      include: {
        organization: { select: { name: true } },
      },
    });

    const url = new URL(req.url);
    const origin = url.origin || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const inviteUrl = `${origin}/invite/${rawToken}`;

    return NextResponse.json({
      success: true,
      message: `Invitation link created for ${cleanEmail}`,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        allowedPages: invitation.allowedPages,
        token: invitation.token,
        inviteUrl,
        expiresAt: invitation.expiresAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[Team API POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create invitation" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// PATCH: Update Member Role & Granular Page Permissions
// ─────────────────────────────────────────────────────────────
export async function PATCH(req: Request) {
  try {
    const auth = await resolveAuthAndScope();
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { isDeveloper, isSuperAdmin, organizationId } = auth;
    const body = await req.json();
    const parseResult = patchMemberSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { id, allowedPages, role } = parseResult.data;

    // Disallow assigning DEVELOPER unless caller is Developer
    if (role === "DEVELOPER" && !isDeveloper) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Developer privilege required." },
        { status: 403 }
      );
    }

    // Look up target membership
    const membership = await prisma.membership.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!membership) {
      return NextResponse.json(
        { success: false, error: "Member record not found." },
        { status: 404 }
      );
    }

    // If caller is regular Tenant Admin, verify membership belongs to their org
    if (!isSuperAdmin && membership.organizationId !== organizationId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Cannot modify members outside your organization." },
        { status: 403 }
      );
    }

    // Protect Developer records from modification by non-developers
    if (
      !isDeveloper &&
      (membership.role === "DEVELOPER" || DEVELOPER_EMAILS.includes(membership.user.email?.toLowerCase().trim() || ""))
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Developer account is protected." },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (allowedPages !== undefined) updateData.allowedPages = allowedPages;
    if (role !== undefined) updateData.role = role;

    const updated = await prisma.membership.update({
      where: { id },
      data: updateData,
      include: { user: true },
    });

    return NextResponse.json({
      success: true,
      message: "Member updated successfully",
      member: {
        id: updated.id,
        name: updated.user.name,
        email: updated.user.email,
        role: updated.role,
        allowedPages: updated.allowedPages,
      },
    });
  } catch (error: any) {
    console.error("[Team API PATCH Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update member" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE: Revoke Member Access OR Cancel Pending Invitation
// ─────────────────────────────────────────────────────────────
export async function DELETE(req: Request) {
  try {
    const auth = await resolveAuthAndScope();
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { isDeveloper, isSuperAdmin, organizationId, user } = auth;
    const { searchParams } = new URL(req.url);
    const invitationId = searchParams.get("invitationId");
    const memberId = searchParams.get("id");

    // Case 1: Cancel invitation
    if (invitationId) {
      const invite = await prisma.teamInvitation.findUnique({
        where: { id: invitationId },
      });

      if (!invite) {
        return NextResponse.json({ success: false, error: "Invitation not found." }, { status: 404 });
      }

      if (!isSuperAdmin && invite.organizationId !== organizationId) {
        return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
      }

      await prisma.teamInvitation.delete({ where: { id: invitationId } });
      return NextResponse.json({ success: true, message: `Invitation cancelled.` });
    }

    // Case 2: Revoke active membership
    if (memberId) {
      const membership = await prisma.membership.findUnique({
        where: { id: memberId },
        include: { user: true },
      });

      if (!membership) {
        return NextResponse.json({ success: false, error: "Member not found." }, { status: 404 });
      }

      if (!isSuperAdmin && membership.organizationId !== organizationId) {
        return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
      }

      if (membership.userId === user.id) {
        return NextResponse.json({ success: false, error: "You cannot revoke your own access." }, { status: 403 });
      }

      // Protect Developer accounts from non-developers
      if (
        !isDeveloper &&
        (membership.role === "DEVELOPER" || DEVELOPER_EMAILS.includes(membership.user.email?.toLowerCase().trim() || ""))
      ) {
        return NextResponse.json({ success: false, error: "Forbidden: Developer account is protected." }, { status: 403 });
      }

      await prisma.membership.delete({ where: { id: memberId } });
      return NextResponse.json({ success: true, message: `${membership.user.name || membership.user.email} removed.` });
    }

    return NextResponse.json({ success: false, error: "Missing id or invitationId parameter." }, { status: 400 });
  } catch (error: any) {
    console.error("[Team API DELETE Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove member" },
      { status: 500 }
    );
  }
}
