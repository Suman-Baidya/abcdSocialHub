import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createTenantRepository } from "@abcd/db";
import { z } from "zod";

const brandKitSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  tagline: z.string().optional().nullable(),
  phoneNumber: z.string().min(8, "Phone number is required"),
  addressBanner: z.string().min(3, "Contact/Address banner is required"),
  primaryColor: z.string().default("#00F0FF"),
  secondaryColor: z.string().default("#0A0D14"),
  defaultLanguage: z.enum(["bengali", "english", "hindi"]).default("bengali"),
  logoUrl: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const workspaceId = (session?.user as any)?.workspaceId;

    if (!workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const repo = createTenantRepository(workspaceId);
    const brandKit = await repo.getBrandKit();

    return NextResponse.json({ success: true, brandKit });
  } catch (error: any) {
    console.error("GET BrandKit error:", error);
    return NextResponse.json({ error: "Failed to fetch BrandKit" }, { status: 500 });
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
    const result = brandKitSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    const repo = createTenantRepository(workspaceId);
    const updated = await repo.upsertBrandKit(result.data);

    return NextResponse.json({ success: true, brandKit: updated });
  } catch (error: any) {
    console.error("POST BrandKit error:", error);
    return NextResponse.json({ error: "Failed to update BrandKit" }, { status: 500 });
  }
}
