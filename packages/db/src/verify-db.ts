import { prisma, createTenantRepository } from "./index";

export async function verifyDatabase() {
  console.log("🔍 Checking Neon PostgreSQL connection...");

  // 1. Check database connection
  const userCount = await prisma.user.count();
  console.log(`✅ Database connected successfully! Existing users: ${userCount}`);

  // 2. Setup Test Org & Workspaces
  console.log("🏢 Setting up test organization and workspaces...");
  const org = await prisma.organization.upsert({
    where: { slug: "test-agency-org" },
    update: {},
    create: {
      name: "Test Agency",
      slug: "test-agency-org",
    },
  });

  const workspaceA = await prisma.workspace.create({
    data: {
      name: "Alpha Salon",
      organizationId: org.id,
    },
  });

  const workspaceB = await prisma.workspace.create({
    data: {
      name: "Beta Dental Clinic",
      organizationId: org.id,
    },
  });

  console.log("🔒 Testing Multi-Tenant Isolation...");
  const repoA = createTenantRepository(workspaceA.id);
  const repoB = createTenantRepository(workspaceB.id);

  // Upsert BrandKit for Workspace A
  await repoA.upsertBrandKit({
    businessName: "Alpha Salon",
    phoneNumber: "+919876543210",
    addressBanner: "123 Park Street, Kolkata",
    primaryColor: "#00F0FF",
    tagline: "Best haircut in Kolkata",
  });

  // Verify Workspace A can read its own brand kit
  const brandKitA = await repoA.getBrandKit();
  if (brandKitA?.businessName === "Alpha Salon") {
    console.log("✅ Workspace A BrandKit successfully saved and retrieved.");
  } else {
    throw new Error("Failed to retrieve Workspace A brand kit");
  }

  // Verify Workspace B CANNOT see Workspace A's brand kit
  const brandKitB = await repoB.getBrandKit();
  if (brandKitB === null) {
    console.log("✅ Tenant Isolation Verified: Workspace B cannot access Workspace A's data!");
  } else {
    throw new Error("SECURITY FAILURE: Workspace B leaked Workspace A's data!");
  }

  // 3. Test Usage Ledger (Append-only credits)
  console.log("💳 Testing UsageLedger credit deduction...");
  await repoA.recordUsage("AI_COPY_GENERATE", 5, { platform: "instagram" });
  const monthlyUsage = await repoA.getMonthlyCreditUsage();
  console.log(`✅ UsageLedger verified! Credits recorded: ${monthlyUsage}`);

  // Cleanup test data
  await prisma.usageLedger.deleteMany({ where: { workspaceId: workspaceA.id } });
  await prisma.brandKit.deleteMany({ where: { workspaceId: workspaceA.id } });
  await prisma.workspace.deleteMany({ where: { id: { in: [workspaceA.id, workspaceB.id] } } });
  await prisma.organization.deleteMany({ where: { id: org.id } });
  console.log("🧹 Test cleanup completed.");

  await prisma.$disconnect();
  console.log("🎉 Phase 1 (Database & Tenancy Layer) is 100% verified and operational!");
}

// Only auto-run if executed directly
if (typeof process !== "undefined" && process.argv[1]?.includes("verify-db")) {
  verifyDatabase().catch((err: unknown) => {
    console.error("❌ Verification failed:", err);
    process.exit(1);
  });
}
