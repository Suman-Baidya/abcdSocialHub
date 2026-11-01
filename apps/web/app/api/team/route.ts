import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "@abcd/db";

export const dynamic = "force-dynamic";

export interface TeamMember {
  id: string;
  userId?: string;
  name: string;
  email: string;
  role: "DEVELOPER" | "SUPER_ADMIN" | "SUPER_ADMIN_STAFF" | "TENANT_ADMIN" | "OWNER" | "ADMIN_STAFF" | "STAFF" | "CREATOR" | "GUEST";
  status: "ACTIVE" | "INVITED" | "PAUSED";
  joinedAt: string;
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
  createdAt: string;
  expiresAt: string;
}

// Validation schemas
const inviteSchema = z.object({
  email: z.string().trim().email("Please provide a valid work email address"),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60).optional(),
  // Tenant admin can strictly only invite Staff / Team Mate
  role: z.enum(["ADMIN_STAFF", "STAFF"]).default("ADMIN_STAFF"),
  allowedPages: z.array(z.string()).default(["content", "calendar"]),
});

const patchMemberSchema = z.object({
  id: z.string().min(1, "Member ID is required"),
  allowedPages: z.array(z.string()).optional(),
  role: z.enum(["ADMIN_STAFF", "STAFF", "TENANT_ADMIN"]).optional(),
});

// Helper: Resolve verified user & tenant organization
async function resolveAuthAndTenant() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "Unauthorized: Please sign in", status: 401 };
  }

  const user = session.user as any;
  const isDeveloper =
    user?.isDeveloper ||
    user?.role === "DEVELOPER" ||
    user?.email === "suman.baidya.pro@gmail.com";
  const isSuperAdmin =
    isDeveloper ||
    user?.isSuperAdmin ||
    user?.role === "SUPER_ADMIN" ||
    user?.email === "suman.baidya.pro@gmail.com";

  // Resolve user's database record & primary organization
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email?.toLowerCase().trim() },
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
  const organizationId = primaryMembership?.organizationId || user.organizationId;

  if (!organizationId) {
    return { error: "No tenant organization assigned to this account", status: 403 };
  }

  const effectiveRole = (primaryMembership?.role as string) || (user.role as string) || "TENANT_ADMIN";
  const isCreator = effectiveRole === "CREATOR" || user.dashboardType === "CREATOR";

  return {
    user: dbUser,
    sessionUser: user,
    primaryMembership,
    organizationId,
    effectiveRole,
    isDeveloper,
    isSuperAdmin,
    isCreator,
  };
}

// ─────────────────────────────────────────────────────────────
// GET: Scoped Tenant Teammates & Pending Invitations
// ─────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const auth = await resolveAuthAndTenant();
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { organizationId, isDeveloper, isCreator, user: dbUser, primaryMembership } = auth;

    // 🔒 CREATOR SOLO ISOLATION:
    // Creators are individual solo accounts. No teammate roster or invitation capability.
    if (isCreator) {
      return NextResponse.json({
        success: true,
        isCreatorSolo: true,
        members: [
          {
            id: primaryMembership?.id || "mem_creator_solo",
            userId: auth.user.id,
            name: auth.user.name || "Solo Creator",
            email: auth.user.email || "",
            role: "CREATOR",
            status: "ACTIVE",
            joinedAt: auth.user.createdAt.toISOString(),
            avatarUrl: auth.user.image,
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

    // 1. Fetch live active memberships belonging strictly to this organization
    const dbMemberships = await prisma.membership.findMany({
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
    });

    // 2. Fetch pending, unexpired invitations for this organization
    const dbInvitations = await prisma.teamInvitation.findMany({
      where: {
        organizationId,
        status: "PENDING",
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    const url = new URL(req.url);
    const origin = url.origin || process.env.NEXTAUTH_URL || "http://localhost:3000";

    // 3. Format active members
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

    // 🔒 SHADOW DEVELOPER RULE: Conceal Developer root account from non-developers
    if (!isDeveloper) {
      activeMembers = activeMembers.filter(
        (m) =>
          (m.role as string) !== "DEVELOPER" &&
          m.email.toLowerCase() !== "suman.baidya.pro@gmail.com"
      );
    }

    // 4. Format pending invitations
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

    // 5. Query Filters
    const search = (url.searchParams.get("search") || "").toLowerCase().trim();
    const roleFilter = (url.searchParams.get("role") || "ALL").toUpperCase();

    let filteredMembers = activeMembers;
    if (search) {
      filteredMembers = filteredMembers.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.email.toLowerCase().includes(search)
      );
    }
    if (roleFilter !== "ALL") {
      filteredMembers = filteredMembers.filter((m) => m.role === roleFilter);
    }

    const maxSeats = 5;
    const totalCount = activeMembers.length + pendingInvitations.length;
    const availableSeats = Math.max(0, maxSeats - totalCount);

    return NextResponse.json({
      success: true,
      isCreatorSolo: false,
      members: filteredMembers,
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
// POST: Dispatch / Create Teammate (Staff) Invitation
// ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const auth = await resolveAuthAndTenant();
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { organizationId, user, isCreator, effectiveRole } = auth;

    // 🔒 CREATOR RESTRICTION
    if (isCreator) {
      return NextResponse.json(
        { success: false, error: "Creator accounts are solo and cannot add teammates." },
        { status: 403 }
      );
    }

    // Role check: Caller must be Tenant Admin or Super Admin/Developer
    if (
      effectiveRole !== "TENANT_ADMIN" &&
      effectiveRole !== "OWNER" &&
      effectiveRole !== "SUPER_ADMIN" &&
      effectiveRole !== "DEVELOPER"
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only Tenant Administrators can invite teammates." },
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

    const { email, name, allowedPages } = parseResult.data;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if user is already an active member in this organization
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        memberships: {
          where: { organizationId },
        },
      },
    });

    if (existingUser && existingUser.memberships.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "A teammate with this email is already a member of this workspace.",
        },
        { status: 409 }
      );
    }

    // 2. Check seat capacity
    const currentMemberCount = await prisma.membership.count({ where: { organizationId } });
    const currentPendingCount = await prisma.teamInvitation.count({
      where: {
        organizationId,
        status: "PENDING",
        expiresAt: { gte: new Date() },
      },
    });

    if (currentMemberCount + currentPendingCount >= 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Seat quota reached (5 seats max). Upgrade plan to invite additional teammates.",
        },
        { status: 403 }
      );
    }

    // 3. Generate Cryptographic 32-Byte Token & Expiration (7 days)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // If there was an old pending invitation for this email, revoke it first
    await prisma.teamInvitation.deleteMany({
      where: {
        organizationId,
        email: cleanEmail,
        status: "PENDING",
      },
    });

    // 4. Create new TeamInvitation in DB
    const invitation = await prisma.teamInvitation.create({
      data: {
        email: cleanEmail,
        name: name || cleanEmail.split("@")[0],
        role: "ADMIN_STAFF", // Strictly Staff / Teammate
        allowedPages: allowedPages.length > 0 ? allowedPages : ["content", "calendar"],
        token: rawToken,
        organizationId,
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
    const auth = await resolveAuthAndTenant();
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { organizationId, effectiveRole } = auth;

    if (
      effectiveRole !== "TENANT_ADMIN" &&
      effectiveRole !== "OWNER" &&
      effectiveRole !== "SUPER_ADMIN" &&
      effectiveRole !== "DEVELOPER"
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only Tenant Administrators can update teammate permissions." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = patchMemberSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { id, allowedPages, role } = parseResult.data;

    // Verify membership belongs to caller's tenant organization
    const membership = await prisma.membership.findFirst({
      where: { id, organizationId },
      include: { user: true },
    });

    if (!membership) {
      return NextResponse.json(
        { success: false, error: "Teammate membership not found in this workspace." },
        { status: 404 }
      );
    }

    // Disallow modifying owner
    if (membership.role === "OWNER" && role) {
      return NextResponse.json(
        { success: false, error: "Primary Workspace Owner role cannot be changed." },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (allowedPages !== undefined) {
      updateData.allowedPages = allowedPages;
    }
    if (role !== undefined) {
      updateData.role = role;
    }

    const updated = await prisma.membership.update({
      where: { id },
      data: updateData,
      include: { user: true },
    });

    return NextResponse.json({
      success: true,
      message: "Teammate permissions updated successfully",
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
    const auth = await resolveAuthAndTenant();
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { organizationId, effectiveRole, user } = auth;

    if (
      effectiveRole !== "TENANT_ADMIN" &&
      effectiveRole !== "OWNER" &&
      effectiveRole !== "SUPER_ADMIN" &&
      effectiveRole !== "DEVELOPER"
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Only Tenant Administrators can remove teammates." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const invitationId = searchParams.get("invitationId");
    const memberId = searchParams.get("id");

    // Case 1: Cancel/Delete a pending invitation
    if (invitationId) {
      const invite = await prisma.teamInvitation.findFirst({
        where: { id: invitationId, organizationId },
      });

      if (!invite) {
        return NextResponse.json(
          { success: false, error: "Invitation not found in this workspace." },
          { status: 404 }
        );
      }

      await prisma.teamInvitation.delete({
        where: { id: invitationId },
      });

      return NextResponse.json({
        success: true,
        message: `Invitation for ${invite.email} cancelled successfully.`,
      });
    }

    // Case 2: Revoke active membership
    if (memberId) {
      const membership = await prisma.membership.findFirst({
        where: { id: memberId, organizationId },
        include: { user: true },
      });

      if (!membership) {
        return NextResponse.json(
          { success: false, error: "Teammate not found in this workspace." },
          { status: 404 }
        );
      }

      // Disallow revoking oneself or the workspace owner
      if (membership.userId === user.id) {
        return NextResponse.json(
          { success: false, error: "You cannot revoke your own workspace access." },
          { status: 403 }
        );
      }

      if (membership.role === "OWNER") {
        return NextResponse.json(
          { success: false, error: "Primary Workspace Owner access cannot be revoked." },
          { status: 403 }
        );
      }

      await prisma.membership.delete({
        where: { id: memberId },
      });

      return NextResponse.json({
        success: true,
        message: `${membership.user.name || membership.user.email} removed from workspace.`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Either 'id' (member) or 'invitationId' parameter is required." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Team API DELETE Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove member" },
      { status: 500 }
    );
  }
}
