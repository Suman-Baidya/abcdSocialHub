import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@abcd/db";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessName: z.string().min(2, "Business or Agency name is required"),
});

const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS || "suman.baidya.pro@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase());

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { name, email, password, businessName } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(normalizedEmail);

    // Create User, Organization, and Primary Workspace with BrandKit atomically
    const orgSlug = `${businessName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        memberships: {
          create: {
            role: isSuperAdmin ? "SUPER_ADMIN" : "OWNER",
            organization: {
              create: {
                name: businessName,
                slug: orgSlug,
                workspaces: {
                  create: {
                    name: "Primary Brand",
                    brandKit: {
                      create: {
                        businessName,
                        phoneNumber: "+91 8944899747",
                        addressBanner: "WhatsApp: +91 8167685731 • Email: sb.abcd321@gmail.com",
                        primaryColor: "#00F0FF",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account registered successfully!",
      userId: user.id,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating your account. Please try again." },
      { status: 500 }
    );
  }
}
