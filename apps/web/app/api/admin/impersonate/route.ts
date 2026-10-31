import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@abcd/db";

export const dynamic = "force-dynamic";

const COOKIE_WS_NAME = "abcd_impersonated_workspace_id";
const COOKIE_USER_NAME = "abcd_impersonated_user_id";
const COOKIE_USER_ROLE = "abcd_impersonated_user_role";
const COOKIE_USER_DISPLAY = "abcd_impersonated_user_name";

// ─────────────────────────────────────────────────────────────
// GET: Inspect current impersonation state (Workspace & User)
// ─────────────────────────────────────────────────────────────
export async function GET(req: Request) {
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
      return NextResponse.json({ isImpersonating: false });
    }

    const cookieHeader = req.headers.get("cookie") || "";
    const matchWs = cookieHeader.match(new RegExp(`${COOKIE_WS_NAME}=([^;]+)`));
    const matchUser = cookieHeader.match(new RegExp(`${COOKIE_USER_NAME}=([^;]+)`));

    const impersonatedWsId = matchWs ? decodeURIComponent(matchWs[1]) : null;
    const impersonatedUserId = matchUser ? decodeURIComponent(matchUser[1]) : null;

    if (!impersonatedWsId && !impersonatedUserId) {
      return NextResponse.json({ isImpersonating: false });
    }

    let workspace: any = null;
    if (impersonatedWsId) {
      workspace = await prisma.workspace.findUnique({
        where: { id: impersonatedWsId },
        include: {
          brandKit: {
            select: {
              businessName: true,
            },
          },
        },
      });
    }

    let targetUser: any = null;
    if (impersonatedUserId) {
      targetUser = await prisma.user.findUnique({
        where: { id: impersonatedUserId },
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

      // If workspace wasn't explicitly loaded, derive from user's primary membership
      if (!workspace && targetUser?.memberships?.[0]?.organization?.workspaces?.[0]) {
        workspace = targetUser.memberships[0].organization.workspaces[0];
      }
    }

    if (!workspace && !targetUser) {
      const response = NextResponse.json({ isImpersonating: false });
      response.cookies.delete(COOKIE_WS_NAME);
      response.cookies.delete(COOKIE_USER_NAME);
      response.cookies.delete(COOKIE_USER_ROLE);
      response.cookies.delete(COOKIE_USER_DISPLAY);
      return response;
    }

    const primaryMembership = targetUser?.memberships?.[0];

    return NextResponse.json({
      isImpersonating: true,
      workspace: workspace
        ? {
            id: workspace.id,
            name: workspace.name,
            businessName: workspace.brandKit?.businessName || workspace.name,
          }
        : null,
      user: targetUser
        ? {
            id: targetUser.id,
            name: targetUser.name || targetUser.email,
            email: targetUser.email,
            role: primaryMembership?.role || "TENANT_ADMIN",
            allowedPages: primaryMembership?.allowedPages || [],
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json({ isImpersonating: false, error: error.message });
  }
}

// ─────────────────────────────────────────────────────────────
// POST: Start inspecting customer workspace or specific user
// ─────────────────────────────────────────────────────────────
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
      return NextResponse.json(
        { error: "Forbidden: Super Admin or Developer access required to inspect accounts" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { workspaceId, userId } = body;

    if (!workspaceId && !userId) {
      return NextResponse.json(
        { error: "Either workspaceId or userId is required" },
        { status: 400 }
      );
    }

    let targetWorkspace: any = null;
    let targetUser: any = null;
    let targetRole = "TENANT_ADMIN";
    let targetAllowedPages: string[] = [];

    // 1. Resolve Target User if provided
    if (userId) {
      targetUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          memberships: {
            include: {
              organization: {
                include: { workspaces: { include: { brandKit: true } } },
              },
            },
          },
        },
      });

      if (!targetUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Security check: Super Admin / Tenant Admin cannot impersonate Developer
      if (
        (targetUser.role === "DEVELOPER" || targetUser.email === "suman.baidya.pro@gmail.com") &&
        !isDeveloper
      ) {
        return NextResponse.json(
          { error: "Unauthorized: Developer account cannot be impersonated" },
          { status: 403 }
        );
      }

      const membership = targetUser.memberships?.[0];
      targetRole = membership?.role || "TENANT_ADMIN";
      targetAllowedPages = (membership as any)?.allowedPages || [];

      if (!workspaceId && membership?.organization?.workspaces?.[0]) {
        targetWorkspace = membership.organization.workspaces[0];
      }
    }

    // 2. Resolve Workspace if provided
    if (workspaceId && !targetWorkspace) {
      targetWorkspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
          brandKit: {
            select: {
              businessName: true,
            },
          },
        },
      });

      if (!targetWorkspace) {
        return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
      }
    }

    const wsDisplayName =
      targetWorkspace?.brandKit?.businessName || targetWorkspace?.name || "Customer Brand";
    const userDisplayName = targetUser?.name || targetUser?.email || "Workspace Member";

    const response = NextResponse.json({
      success: true,
      workspace: targetWorkspace
        ? {
            id: targetWorkspace.id,
            name: targetWorkspace.name,
            businessName: wsDisplayName,
          }
        : null,
      user: targetUser
        ? {
            id: targetUser.id,
            name: userDisplayName,
            email: targetUser.email,
            role: targetRole,
            allowedPages: targetAllowedPages,
          }
        : null,
      message: targetUser
        ? `Now viewing dashboard as ${userDisplayName} (${targetRole}) at "${wsDisplayName}"`
        : `Now inspecting workspace "${wsDisplayName}"`,
    });

    const cookieOptions = {
      path: "/",
      httpOnly: false,
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24, // 24 hours
    };

    if (targetWorkspace) {
      response.cookies.set(COOKIE_WS_NAME, targetWorkspace.id, cookieOptions);
    }
    if (targetUser) {
      response.cookies.set(COOKIE_USER_NAME, targetUser.id, cookieOptions);
      response.cookies.set(COOKIE_USER_ROLE, targetRole, cookieOptions);
      response.cookies.set(
        COOKIE_USER_DISPLAY,
        encodeURIComponent(userDisplayName),
        cookieOptions
      );
    }

    return response;
  } catch (error: any) {
    console.error("Impersonation error:", error);
    return NextResponse.json(
      { error: "Failed to start account inspection", details: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE: Stop inspecting and return to default Developer / Admin state
// ─────────────────────────────────────────────────────────────
export async function DELETE() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Inspection session ended. Restored Developer / Admin context.",
    });

    const expireOptions = {
      path: "/",
      httpOnly: false,
      sameSite: "lax" as const,
      maxAge: 0,
      expires: new Date(0),
    };

    response.cookies.set(COOKIE_WS_NAME, "", expireOptions);
    response.cookies.set(COOKIE_USER_NAME, "", expireOptions);
    response.cookies.set(COOKIE_USER_ROLE, "", expireOptions);
    response.cookies.set(COOKIE_USER_DISPLAY, "", expireOptions);

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to exit inspection", details: error.message },
      { status: 500 }
    );
  }
}
