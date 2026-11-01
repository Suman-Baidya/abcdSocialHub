import { NextResponse } from "next/server";
import { prisma } from "@abcd/db";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "public_site_cms" },
    });

    if (!setting || !setting.data) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_SITE_SETTINGS,
        source: "default",
      });
    }

    const mergedData: SiteSettings = {
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
    };

    return NextResponse.json(
      {
        success: true,
        data: mergedData,
        source: "database",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("[SiteSettings GET error]", err);
    return NextResponse.json({
      success: true,
      data: DEFAULT_SITE_SETTINGS,
      source: "fallback",
    });
  }
}
