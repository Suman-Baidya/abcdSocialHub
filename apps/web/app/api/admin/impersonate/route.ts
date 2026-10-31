import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@abcd/db";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "abcd_impersonated_workspace_id";

// ─────────────────────────────────────────────────────────────
// GET: Inspect current impersonation state
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
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    const impersonatedId = match ? decodeURIComponent(match[1]) : null;

    if (!impersonatedId) {
      return NextResponse.json({ isImpersonating: false });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: impersonatedId },
      include: {
        brandKit: {
          select: {
            businessName: true,
          },
        },
      },
    });

    if (!workspace) {
      const response = NextResponse.json({ isImpersonating: false });
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    return NextResponse.json({
      isImpersonating: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        businessName: workspace.brandKit?.businessName || workspace.name,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ isImpersonating: false, error: error.message });
  }
}

// ─────────────────────────────────────────────────────────────
// POST: Start inspecting customer workspace
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
        { error: "Forbidden: Super Admin or Developer access required to inspect workspaces" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        brandKit: {
          select: {
            businessName: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        businessName: workspace.brandKit?.businessName || workspace.name,
      },
      message: `Now inspecting workspace "${workspace.brandKit?.businessName || workspace.name}"`,
    });

    // Set cookie across whole domain for 24 hours
    response.cookies.set(COOKIE_NAME, workspace.id, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: any) {
    console.error("Impersonation error:", error);
    return NextResponse.json(
      { error: "Failed to start workspace inspection", details: error.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE: Stop inspecting and return to default admin workspace
// ─────────────────────────────────────────────────────────────
export async function DELETE() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Workspace inspection ended. Restored admin context.",
    });

    response.cookies.set(COOKIE_NAME, "", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to exit workspace inspection", details: error.message },
      { status: 500 }
    );
  }
}
