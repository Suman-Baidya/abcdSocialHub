import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@abcd/db";

const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").max(100, "Name is too long").optional(),
  phone: z.string().trim().max(25, "Phone number is too long").optional().nullable(),
  image: z.string().max(10 * 1024 * 1024, "Avatar payload exceeds maximum size").optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session?.user as any)?.id;

    // Bulletproof dual-key lookup: by id OR by case-insensitive email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(userId ? [{ id: userId }] : []),
          { email: { equals: email, mode: "insensitive" } },
        ],
      },
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const membership = user.memberships[0];
    const organizationName = membership?.organization?.name || "Personal Workspace";
    const workspaceName = membership?.organization?.workspaces[0]?.name || "Primary Brand";
    const role = (session?.user as any)?.role || membership?.role || "TENANT_ADMIN";

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        image: user.image || null,
        role,
        organizationName,
        workspaceName,
        hasPassword: Boolean(user.passwordHash),
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error("[GET /api/user/profile error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load user profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session?.user as any)?.id;

    // Bulletproof dual-key lookup: by id OR by case-insensitive email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(userId ? [{ id: userId }] : []),
          { email: { equals: email, mode: "insensitive" } },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid profile data" },
        { status: 400 }
      );
    }

    const { name, phone, image } = parsed.data;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (phone !== undefined) dataToUpdate.phone = phone || null;
    if (image !== undefined) dataToUpdate.image = image || null;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
    });

    // Write audit log if workspace exists
    const workspaceId = (session?.user as any)?.workspaceId;
    if (workspaceId) {
      await prisma.auditLog.create({
        data: {
          workspaceId,
          userId: user.id,
          action: "PROFILE_UPDATED",
          details: {
            updatedFields: Object.keys(dataToUpdate),
            timestamp: new Date().toISOString(),
          },
        },
      }).catch((e) => console.error("Non-fatal profile audit error:", e));
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        image: updatedUser.image,
      },
    });
  } catch (err: any) {
    console.error("[PATCH /api/user/profile error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
