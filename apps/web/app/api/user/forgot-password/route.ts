import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@abcd/db";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json().catch(() => ({}));
    const parsed = forgotPasswordSchema.safeParse(body);

    const email = (session?.user?.email || parsed.data?.email || "").toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't leak user existence in generic endpoint, but for authenticated profile we return standard status
      return NextResponse.json({
        success: true,
        message: "If an account exists, a password reset link has been dispatched.",
      });
    }

    // Generate random secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Clean up older tokens for this email and create new token
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    const isDev = process.env.NODE_ENV !== "production";
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    return NextResponse.json({
      success: true,
      message: `Password reset instructions initiated for ${email}.`,
      resetUrl: isDev ? resetUrl : undefined,
    });
  } catch (err: any) {
    console.error("[POST /api/user/forgot-password error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initiate password reset" },
      { status: 500 }
    );
  }
}

