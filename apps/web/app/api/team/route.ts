import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "CREATOR" | "STAFF" | "GUEST";
  status: "ACTIVE" | "INVITED";
  joinedAt: string;
  avatarUrl?: string;
  lastActive?: string;
}

// In-memory tenant store seeded with realistic members
let TENANT_TEAM_STORE: Record<string, TeamMember[]> = {};

function getInitialMembers(): TeamMember[] {
  return [
    {
      id: "mem_01",
      name: "Suman Baidya",
      email: "suman.baidya.pro@gmail.com",
      role: "OWNER",
      status: "ACTIVE",
      joinedAt: "Founding Member",
      lastActive: "Active now",
    },
    {
      id: "mem_02",
      name: "Priya Sharma",
      email: "priya.creative@gmail.com",
      role: "CREATOR",
      status: "ACTIVE",
      joinedAt: "24 Oct 2026",
      lastActive: "2 hours ago",
    },
    {
      id: "mem_03",
      name: "Amitav Ghosh",
      email: "amitav.frontdesk@salonderoyal.in",
      role: "STAFF",
      status: "INVITED",
      joinedAt: "Pending acceptance",
      lastActive: "Never",
    },
    {
      id: "mem_04",
      name: "Rohan Mukherjee",
      email: "rohan.analytics@agencyhub.co",
      role: "GUEST",
      status: "ACTIVE",
      joinedAt: "18 Oct 2026",
      lastActive: "1 day ago",
    },
  ];
}

function getTenantMembers(tenantKey: string): TeamMember[] {
  if (!TENANT_TEAM_STORE[tenantKey]) {
    TENANT_TEAM_STORE[tenantKey] = getInitialMembers();
  }
  return TENANT_TEAM_STORE[tenantKey];
}

// Validation schemas
const inviteSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().trim().email("Invalid email address"),
  role: z.enum(["OWNER", "CREATOR", "STAFF", "GUEST"]).default("CREATOR"),
});

const patchRoleSchema = z.object({
  id: z.string().min(1, "Member ID is required"),
  role: z.enum(["OWNER", "CREATOR", "STAFF", "GUEST"]),
});

const deleteMemberSchema = z.object({
  id: z.string().min(1, "Member ID is required"),
});

// ─────────────────────────────────────────────────────────────
// GET: Query team members with search, role filter & stats
// ─────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const tenantKey = (session?.user as any)?.workspaceId || (session?.user as any)?.id || "workspace_demo_default";
    const members = getTenantMembers(tenantKey);

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const role = (searchParams.get("role") || "ALL").toUpperCase();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10", 10)));

    // Filtering
    let filtered = members.filter((member) => {
      // Role filter
      if (role !== "ALL" && member.role !== role) {
        return false;
      }

      // Search filter (name, email)
      if (search) {
        const matchesName = member.name.toLowerCase().includes(search);
        const matchesEmail = member.email.toLowerCase().includes(search);
        if (!matchesName && !matchesEmail) {
          return false;
        }
      }

      return true;
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    // KPI Metrics calculation
    const totalCount = members.length;
    const activeCount = members.filter((m) => m.status === "ACTIVE").length;
    const invitedCount = members.filter((m) => m.status === "INVITED").length;
    const maxSeats = 6; // Standard Growth Tier allocation
    const availableSeats = Math.max(0, maxSeats - totalCount);

    return NextResponse.json({
      success: true,
      members: paginated,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      },
      stats: {
        totalCount,
        activeCount,
        invitedCount,
        maxSeats,
        availableSeats,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// POST: Dispatch magic-link invite to new member
// ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const tenantKey = (session?.user as any)?.workspaceId || (session?.user as any)?.id || "workspace_demo_default";
    const members = getTenantMembers(tenantKey);

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

    const { name, email, role } = parseResult.data;

    // Check if email already exists in workspace
    const existing = members.find(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A member with this email already belongs to this workspace." },
        { status: 409 }
      );
    }

    // Check seat limit
    if (members.length >= 6) {
      return NextResponse.json(
        { success: false, error: "Seat quota reached. Upgrade plan to invite additional members." },
        { status: 403 }
      );
    }

    const newMember: TeamMember = {
      id: `mem_${Date.now()}`,
      name,
      email,
      role,
      status: "INVITED",
      joinedAt: "Just invited",
      lastActive: "Never",
    };

    members.unshift(newMember);

    return NextResponse.json({
      success: true,
      member: newMember,
      message: `Invitation dispatched to ${email}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to invite member" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// PATCH: Update member role
// ─────────────────────────────────────────────────────────────
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const tenantKey = (session?.user as any)?.workspaceId || (session?.user as any)?.id || "workspace_demo_default";
    const members = getTenantMembers(tenantKey);

    const body = await req.json();
    const parseResult = patchRoleSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { id, role } = parseResult.data;
    const memberIndex = members.findIndex((m) => m.id === id);

    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 }
      );
    }

    // Cannot demote Founding Owner
    if (members[memberIndex].id === "mem_01" && role !== "OWNER") {
      return NextResponse.json(
        { success: false, error: "Primary Workspace Owner role cannot be reassigned." },
        { status: 403 }
      );
    }

    members[memberIndex].role = role;

    return NextResponse.json({
      success: true,
      member: members[memberIndex],
      message: `Role updated to ${role}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update role" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE: Revoke member access
// ─────────────────────────────────────────────────────────────
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const tenantKey = (session?.user as any)?.workspaceId || (session?.user as any)?.id || "workspace_demo_default";
    const members = getTenantMembers(tenantKey);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const parseResult = deleteMemberSchema.safeParse({ id });
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const memberIndex = members.findIndex((m) => m.id === id);
    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 }
      );
    }

    // Protect primary owner
    if (members[memberIndex].role === "OWNER" || members[memberIndex].id === "mem_01") {
      return NextResponse.json(
        { success: false, error: "Primary Workspace Owner access cannot be revoked." },
        { status: 403 }
      );
    }

    const [removed] = members.splice(memberIndex, 1);

    return NextResponse.json({
      success: true,
      removedId: removed.id,
      message: `${removed.name} revoked from workspace`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to revoke member" },
      { status: 500 }
    );
  }
}
