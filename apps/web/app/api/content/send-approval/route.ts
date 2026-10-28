import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createTenantRepository, Platform } from "@abcd/db";
import { z } from "zod";

const approvalDispatchSchema = z.object({
  title: z.string().min(3),
  brief: z.string().min(5),
  posterUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  instagram: z.string().min(5),
  facebook: z.string().min(5),
  linkedin: z.string().min(5),
  x: z.string().min(5),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const workspaceId = (session?.user as any)?.workspaceId;

    if (!workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = approvalDispatchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { title, brief, posterUrl, audioUrl, instagram, facebook, linkedin, x } = result.data;

    const repo = createTenantRepository(workspaceId);
    const brandKit = await repo.getBrandKit();

    const variants: Array<{
      platform: Platform;
      caption: string;
      mediaUrl?: string;
    }> = [
      { platform: Platform.INSTAGRAM_BUSINESS, caption: instagram, mediaUrl: posterUrl },
      { platform: Platform.FACEBOOK_PAGE, caption: facebook, mediaUrl: posterUrl },
      { platform: Platform.LINKEDIN, caption: linkedin, mediaUrl: posterUrl },
      { platform: Platform.X_TWITTER, caption: x, mediaUrl: posterUrl },
    ];

    const { contentItem, rawToken, tokenExpiresAt } = await repo.createContentDraftWithApproval({
      title,
      rawBrief: brief,
      variants,
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const approvalUrl = `${baseUrl}/approve/${rawToken}`;

    const targetPhone = "8167685731"; // Business WhatsApp
    const targetEmail = "sb.abcd321@gmail.com";

    // Direct WhatsApp Click-to-Chat Link
    const waText = encodeURIComponent(
      `👋 Namaskar! Please review and approve your new promotional post for ${
        brandKit?.businessName || "ABCD Social"
      }:\n\n🔗 Tap to Approve (1-Tap): ${approvalUrl}\n\nLink expires in 72 hours.`
    );
    const whatsAppUrl = `https://wa.me/91${targetPhone}?text=${waText}`;

    // Send email via Resend if API key is present
    let emailSent = false;
    if (process.env.RESEND_API_KEY) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || "ABCD Social <onboarding@resend.dev>",
            to: [targetEmail],
            subject: `⚡ Post Approval Required: ${title} (${brandKit?.businessName || "ABCD Social"})`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0A0D14; color: #FFFFFF; border-radius: 16px;">
                <h2 style="color: #00F0FF; margin-top: 0;">1-Tap Mobile Post Approval</h2>
                <p style="color: #94A3B8; font-size: 14px;">A new promotional post is ready for your brand <strong>${brandKit?.businessName || "ABCD Social"}</strong>.</p>
                
                <div style="background-color: #121722; padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold; font-size: 16px;">${title}</p>
                  <p style="color: #94A3B8; font-size: 13px; margin: 8px 0 0 0;">${brief}</p>
                </div>

                <div style="text-align: center; margin: 28px 0;">
                  <a href="${approvalUrl}" style="background-color: #00F0FF; color: #0A0D14; font-weight: bold; padding: 14px 28px; border-radius: 12px; text-decoration: none; display: inline-block; font-size: 15px;">
                    Open & Approve on Phone
                  </a>
                </div>

                <p style="color: #64748B; font-size: 12px; text-align: center;">This magic link expires in 72 hours and requires no login.</p>
              </div>
            `,
          }),
        });
        emailSent = emailRes.ok;
      } catch (emailErr) {
        console.warn("Failed to dispatch approval email via Resend:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      contentItemId: contentItem.id,
      approvalUrl,
      whatsAppUrl,
      emailSent,
      expiresAt: tokenExpiresAt,
      recipient: {
        email: targetEmail,
        whatsapp: targetPhone,
      },
    });
  } catch (error: any) {
    console.error("Send approval error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to dispatch approval link" },
      { status: 500 }
    );
  }
}
