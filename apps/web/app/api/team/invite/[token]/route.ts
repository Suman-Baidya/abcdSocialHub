import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@abcd/db";

export const dynamic = "force-dynamic";

const acceptInviteSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters").max(60),
  phone: z.string().trim().optional(),
  image: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ─────────────────────────────────────────────────────────────
// GET: Validate Invitation Token
// ─────────────────────────────────────────────────────────────
export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    if (!token) {
      return NextResponse.json({ valid: false, error: "Invalid invitation token." }, { status: 400 });
    }

    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: { name: true, slug: true },
        },
        inviter: {
          select: { name: true, email: true },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { valid: false, error: "Invitation not found. The link may be incorrect or removed." },
        { status: 404 }
      );
    }

    if (invitation.status === "ACCEPTED") {
      return NextResponse.json(
        { valid: false, error: "This invitation has already been accepted. Please sign in to your account." },
        { status: 410 }
      );
    }

    if (invitation.status === "REVOKED") {
      return NextResponse.json(
        { valid: false, error: "This invitation was revoked by the workspace administrator." },
        { status: 410 }
      );
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "This invitation link has expired. Please ask the administrator for a new invite." },
        { status: 410 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: invitation.email,
      name: invitation.name,
      role: invitation.role,
      allowedPages: invitation.allowedPages,
      organizationName: invitation.organization.name,
      inviterName: invitation.inviter.name || invitation.inviter.email,
      expiresAt: invitation.expiresAt.toISOString(),
    });
  } catch (error: any) {
    console.error("[Invite Validation Error]:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate invitation." },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// POST: Complete Onboarding & Accept Invitation
// ─────────────────────────────────────────────────────────────
export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    if (!token) {
      return NextResponse.json({ success: false, error: "Missing invitation token." }, { status: 400 });
    }

    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
      include: {
        organization: {
          include: { workspaces: true },
        },
      },
    });

    if (!invitation || invitation.status !== "PENDING" || new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: "This invitation is no longer valid or has expired." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parseResult = acceptInviteSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { name, phone, image, password } = parseResult.data;
    const cleanEmail = invitation.email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 10);

    // 1. Upsert User in database
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          phone: phone || user.phone,
          image: image || user.image || "/avatars/default-avatar.svg",
          passwordHash,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name,
          phone: phone || null,
          image: image || "/avatars/default-avatar.svg",
          passwordHash,
        },
      });
    }

    // 2. Provision Tenant Membership with Assigned Role & Page Permissions
    await prisma.membership.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: invitation.organizationId,
        },
      },
      update: {
        role: invitation.role,
        allowedPages: invitation.allowedPages,
      },
      create: {
        userId: user.id,
        organizationId: invitation.organizationId,
        role: invitation.role,
        allowedPages: invitation.allowedPages,
      },
    });

    // 3. Mark invitation as accepted
    await prisma.teamInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    });

    // 4. Log Audit Event if workspace exists
    const primaryWorkspace = invitation.organization.workspaces[0];
    if (primaryWorkspace) {
      await prisma.auditLog.create({
        data: {
          workspaceId: primaryWorkspace.id,
          userId: user.id,
          action: "INVITE_ACCEPTED",
          details: {
            role: invitation.role,
            organizationId: invitation.organizationId,
            allowedPages: invitation.allowedPages,
          },
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: `Welcome to ${invitation.organization.name}! Your account has been activated.`,
      email: cleanEmail,
    });
  } catch (error: any) {
    console.error("[Accept Invite Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
