import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, Platform } from "@abcd/db";
import { encryptToken } from "@abcd/integrations";
import { z } from "zod";

const connectAccountSchema = z.object({
  platform: z.enum(["FACEBOOK_PAGE", "INSTAGRAM_BUSINESS", "LINKEDIN", "X_TWITTER", "YOUTUBE"]),
  platformAccountId: z.string().min(1),
  accountName: z.string().min(1),
  accessToken: z.string().min(5),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const workspaceId = (session?.user as any)?.workspaceId;

    if (!workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Never return encrypted tokens or plaintext to the browser
    const accounts = await prisma.socialAccount.findMany({
      where: { workspaceId },
      select: {
        id: true,
        platform: true,
        platformAccountId: true,
        accountName: true,
        isActive: true,
        tokenExpiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, accounts });
  } catch (error: any) {
    console.error("Fetch social accounts error:", error);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const workspaceId = (session?.user as any)?.workspaceId;

    if (!workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = connectAccountSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { platform, platformAccountId, accountName, accessToken } = result.data;

    // Encrypt token using AES-256-GCM before storage
    const encryptedToken = encryptToken(accessToken);

    const account = await prisma.socialAccount.upsert({
      where: {
        workspaceId_platform_platformAccountId: {
          workspaceId,
          platform: platform as Platform,
          platformAccountId,
        },
      },
      update: {
        accountName,
        encryptedToken,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        workspaceId,
        platform: platform as Platform,
        platformAccountId,
        accountName,
        encryptedToken,
        isActive: true,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        workspaceId,
        action: "CONNECT_SOCIAL_ACCOUNT",
        details: {
          platform,
          accountName,
          connectedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        platform: account.platform,
        accountName: account.accountName,
        isActive: account.isActive,
      },
    });
  } catch (error: any) {
    console.error("Connect social account error:", error);
    return NextResponse.json({ error: "Failed to connect account" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const workspaceId = (session?.user as any)?.workspaceId;

    if (!workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("id");

    if (!accountId) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
    }

    const deleted = await prisma.socialAccount.deleteMany({
      where: { id: accountId, workspaceId },
    });

    if (deleted.count > 0) {
      await prisma.auditLog.create({
        data: {
          workspaceId,
          action: "DISCONNECT_SOCIAL_ACCOUNT",
          details: { accountId },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Disconnect account error:", error);
    return NextResponse.json({ error: "Failed to disconnect account" }, { status: 500 });
  }
}
