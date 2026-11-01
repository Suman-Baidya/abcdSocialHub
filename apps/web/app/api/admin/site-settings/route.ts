import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@abcd/db";
import { DEFAULT_SITE_SETTINGS, siteSettingsSchema, SiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const isSuperAdmin =
      user?.isDeveloper ||
      user?.role === "SUPER_ADMIN" ||
      user?.isSuperAdmin ||
      user?.email === "suman.baidya.pro@gmail.com";

    if (!session || !isSuperAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Super Admin authorization required." },
        { status: 403 }
      );
    }

    const setting = await prisma.siteSetting.findUnique({
      where: { key: "public_site_cms" },
    });

    const data: SiteSettings = setting?.data
      ? {
          ...DEFAULT_SITE_SETTINGS,
          ...(setting.data as Partial<SiteSettings>),
          hero: {
            ...DEFAULT_SITE_SETTINGS.hero,
            ...((setting.data as any)?.hero || {}),
          },
          announcement: {
            ...DEFAULT_SITE_SETTINGS.announcement,
            ...((setting.data as any)?.announcement || {}),
          },
          general: {
            ...DEFAULT_SITE_SETTINGS.general,
            ...((setting.data as any)?.general || {}),
            socialLinks: {
              ...DEFAULT_SITE_SETTINGS.general.socialLinks,
              ...((setting.data as any)?.general?.socialLinks || {}),
            },
          },
        }
      : DEFAULT_SITE_SETTINGS;

    return NextResponse.json({
      success: true,
      data,
      updatedAt: setting?.updatedAt || null,
    });
  } catch (err: any) {
    console.error("[Admin SiteSettings GET error]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to fetch site settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const isSuperAdmin =
      user?.isDeveloper ||
      user?.role === "SUPER_ADMIN" ||
      user?.isSuperAdmin ||
      user?.email === "suman.baidya.pro@gmail.com";

    if (!session || !isSuperAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Super Admin authorization required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = siteSettingsSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid settings format",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const validData = parseResult.data;

    const saved = await prisma.siteSetting.upsert({
      where: { key: "public_site_cms" },
      update: {
        data: validData as any,
        updatedAt: new Date(),
      },
      create: {
        key: "public_site_cms",
        data: validData as any,
      },
    });

    // Record Audit Log entry
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id || null,
          action: "UPDATE_SITE_CMS_SETTINGS",
          details: {
            updatedAt: new Date().toISOString(),
            changedSections: Object.keys(body),
          },
        },
      });
    } catch (auditErr) {
      console.warn("[AuditLog warning on SiteSettings]", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: "Site settings successfully updated and live.",
      data: saved.data,
      updatedAt: saved.updatedAt,
    });
  } catch (err: any) {
    console.error("[Admin SiteSettings PATCH error]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to update site settings" },
      { status: 500 }
    );
  }
}
