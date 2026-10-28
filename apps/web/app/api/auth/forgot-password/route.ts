import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@abcd/db";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = forgotSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const email = result.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return generic success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been dispatched.",
      });
    }

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // Send email via Resend
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "ABCD Social <onboarding@resend.dev>",
          to: [email],
          subject: "Reset your ABCD Social Hub password",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #0A0D14; color: #FFFFFF; border-radius: 12px; border: 1px solid #1E293B;">
              <h2 style="color: #00F0FF; margin-top: 0;">ABCD Social Hub</h2>
              <p style="font-size: 16px; color: #E2E8F0;">Hello,</p>
              <p style="font-size: 15px; color: #94A3B8; line-height: 1.6;">You requested a password reset for your ABCD Social Hub account. Click the button below to choose a new password. This link is valid for 1 hour.</p>
              <div style="margin: 28px 0;">
                <a href="${resetUrl}" style="background: #00F0FF; color: #0A0D14; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">Reset Password</a>
              </div>
              <p style="font-size: 13px; color: #64748B;">If you did not request this, you can safely ignore this email.</p>
            </div>
          `,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been dispatched.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to send reset link. Please try again." },
      { status: 500 }
    );
  }
}
