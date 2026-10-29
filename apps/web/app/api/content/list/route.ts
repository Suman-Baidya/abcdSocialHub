import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, PostStatus } from "@abcd/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    // Resolve user workspace
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    if (!user || user.memberships.length === 0) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const workspace =
      user.memberships[0].organization.workspaces.find(
        (w) => w.id === (session.user as any).workspaceId
      ) || user.memberships[0].organization.workspaces[0];

    if (!workspace) {
      return NextResponse.json({ error: "No workspace found" }, { status: 404 });
    }

    const whereClause: any = {
      workspaceId: workspace.id,
    };

    if (statusParam && statusParam !== "ALL") {
      whereClause.status = statusParam as PostStatus;
    }

    const items = await prisma.contentItem.findMany({
      where: whereClause,
      include: {
        variants: true,
        publishJobs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      workspaceId: workspace.id,
      items,
    });
  } catch (error: any) {
    console.error("Content list API error:", error);
    return NextResponse.json(
      { error: "Failed to list content items", details: error.message },
      { status: 500 }
    );
  }
}
