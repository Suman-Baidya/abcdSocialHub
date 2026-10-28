import {
  prisma,
  createTenantRepository,
  resolveApprovalToken,
  submitApprovalDecision,
  Platform,
  PostStatus,
} from "../packages/db/src/index";

async function runApprovalTest() {
  console.log("--- Starting Mobile Magic-Link Approval Test ---");

  // 1. Get or create test organization & workspace
  const org = await prisma.organization.upsert({
    where: { slug: "test-approval-org" },
    update: {},
    create: {
      name: "ABCD Test Organization",
      slug: "test-approval-org",
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { id: "test-approval-workspace-id" },
    update: {},
    create: {
      id: "test-approval-workspace-id",
      name: "Kolkata Glamour Salon",
      organizationId: org.id,
      brandKit: {
        create: {
          businessName: "Kolkata Glamour Salon",
          phoneNumber: "+91 8944899747",
          addressBanner: "Park Street, Kolkata • WA: +91 8167685731",
          primaryColor: "#00F0FF",
        },
      },
    },
    include: { brandKit: true },
  });

  console.log(`[1] Testing with workspace: ${workspace.name} (${workspace.id})`);

  const repo = createTenantRepository(workspace.id);

  // 2. Create draft post with approval token
  const { contentItem, rawToken, tokenExpiresAt } = await repo.createContentDraftWithApproval({
    title: "Diwali 50% Off Mega Sale",
    rawBrief: "Flat 50% off on all grooming and salon packages for Diwali week.",
    variants: [
      {
        platform: Platform.INSTAGRAM_BUSINESS,
        caption: "🪔 Diwali Special: 50% discount on all salon grooming services!",
        mediaUrl: "https://res.cloudinary.com/mdlaprj0/image/upload/v1793193499/abcd_posters/iy93bkzz4nub2ck4nupw.webp",
      },
    ],
  });

  console.log(`[2] Draft created: ${contentItem.id}`);
  console.log(`    Generated Raw Token: ${rawToken}`);
  console.log(`    Token Expires: ${tokenExpiresAt.toISOString()}`);
  console.log(`    Initial Status: ${contentItem.status}`);

  if (contentItem.status !== PostStatus.IN_REVIEW) {
    throw new Error(`Expected status IN_REVIEW, got ${contentItem.status}`);
  }

  // 3. Resolve token via public magic-link resolver
  const resolved = await resolveApprovalToken(rawToken);
  if (!resolved || resolved.expired || !resolved.contentItem) {
    throw new Error("Failed to resolve valid approval token");
  }

  console.log(`[3] Public token resolved successfully!`);
  console.log(`    Content Title: ${resolved.contentItem.title}`);
  console.log(`    Brand Name: ${resolved.contentItem.workspace.brandKit?.businessName || resolved.contentItem.workspace.name}`);

  // 4. Submit 1-Tap Approval Decision
  console.log(`[4] Submitting 1-Tap 'APPROVE' decision...`);
  const decisionResult = await submitApprovalDecision(rawToken, "APPROVE");
  console.log(`    Decision result:`, decisionResult);

  if (decisionResult.status !== PostStatus.SCHEDULED) {
    throw new Error(`Expected status SCHEDULED, got ${decisionResult.status}`);
  }

  // 5. Verify single-use: Calling again with the same token should fail
  console.log(`[5] Verifying single-use protection...`);
  try {
    await submitApprovalDecision(rawToken, "APPROVE");
    throw new Error("Security Violation: Token was accepted twice!");
  } catch (err: any) {
    console.log(`    Single-use verified: Reusing token rejected as expected (${err.message})`);
  }

  // 6. Verify audit log entry
  const audit = await prisma.auditLog.findFirst({
    where: {
      workspaceId: workspace.id,
      action: "CONTENT_APPROVED_VIA_MAGIC_LINK",
    },
    orderBy: { createdAt: "desc" },
  });

  if (!audit) {
    throw new Error("Audit log entry was not found");
  }
  console.log(`[6] Audit log verified: Action ${audit.action} recorded at ${audit.createdAt.toISOString()}`);

  console.log("\n✅ ALL APPROVAL ENGINE TESTS PASSED SUCCESSFULLY!");
}

runApprovalTest()
  .catch((err) => {
    console.error("❌ Approval test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
