import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@abcd/db";

export const dynamic = "force-dynamic";

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
      return NextResponse.json({ error: "Forbidden: Platform Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role");
    const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();

    // Fetch all users with their memberships, organizations, and workspaces
    const users = await prisma.user.findMany({
      include: {
        memberships: {
          include: {
            organization: {
              include: {
                workspaces: {
                  include: {
                    brandKit: {
                      select: {
                        businessName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      workspaceId: string;
      workspaceName: string;
      businessName: string;
      allowedPages: string[];
    }> = [];

    for (const u of users) {
      const email = u.email?.toLowerCase() || "";
      const isUserDev = email === "suman.baidya.pro@gmail.com" || u.memberships.some((m) => m.role === "DEVELOPER");

      // 🔒 Shadow Developer Guard: Hide developer account from non-developer super admins
      if (isUserDev && !isDeveloper) {
        continue;
      }

      for (const m of u.memberships) {
        const role = m.role as string;
        if (roleFilter && roleFilter !== "ALL" && role !== roleFilter) {
          continue;
        }

        const org = m.organization;
        const ws = org?.workspaces?.[0];
        const businessName = ws?.brandKit?.businessName || ws?.name || org?.name || "Business Brand";
        const wsName = ws?.name || "Primary Brand";
        const wsId = ws?.id || "";

        if (searchQuery) {
          const matchName = (u.name || "").toLowerCase().includes(searchQuery);
          const matchEmail = email.includes(searchQuery);
          const matchBiz = businessName.toLowerCase().includes(searchQuery);
          if (!matchName && !matchEmail && !matchBiz) {
            continue;
          }
        }

        formattedUsers.push({
          id: u.id,
          name: u.name || email.split("@")[0],
          email: u.email || "",
          role,
          workspaceId: wsId,
          workspaceName: wsName,
          businessName,
          allowedPages: (m as any).allowedPages || [],
        });
      }
    }

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length,
    });
  } catch (error: any) {
    console.error("Failed to load platform users:", error);
    return NextResponse.json(
      { error: "Failed to load platform users", details: error.message },
      { status: 500 }
    );
  }
}
