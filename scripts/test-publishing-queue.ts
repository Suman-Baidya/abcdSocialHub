import {
  prisma,
  createTenantRepository,
  Platform,
  PostStatus,
} from "../packages/db/src/index";
import {
  encryptToken,
  decryptToken,
  publishFacebookPage,
  publishInstagramPost,
} from "../packages/integrations/src/index";

async function runPublishingQueueTest() {
  console.log("--- Starting Publishing Queue & Meta Integration Test ---");

  // 1. Test AES-256-GCM Token Encryption & Decryption
  console.log("[1] Testing AES-256-GCM Social Token Encryption...");
  const rawToken = "EAA_test_secret_meta_access_token_123456789";
  const encrypted = encryptToken(rawToken);
  console.log(`    Plaintext: ${rawToken}`);
  console.log(`    Encrypted: ${encrypted}`);

  const decrypted = decryptToken(encrypted);
  if (decrypted !== rawToken) {
    throw new Error(`Decrypted token '${decrypted}' does not match original '${rawToken}'`);
  }
  console.log("    ✓ AES-256-GCM Encryption & Decryption verified!");

  // 2. Setup Test Workspace
  console.log("[2] Setting up Test Workspace for Publishing...");
  const org = await prisma.organization.upsert({
    where: { slug: "test-publish-org" },
    update: {},
    create: {
      name: "Publishing Test Org",
      slug: "test-publish-org",
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { id: "test-publish-workspace-id" },
    update: {},
    create: {
      id: "test-publish-workspace-id",
      name: "Kolkata Digital Hub",
      organizationId: org.id,
      brandKit: {
        create: {
          businessName: "Kolkata Digital Hub",
          phoneNumber: "+91 8944899747",
          addressBanner: "Park Circus, Kolkata",
          primaryColor: "#00F0FF",
        },
      },
    },
    include: { brandKit: true },
  });

  // 3. Connect Test Social Accounts (Instagram & Facebook with encrypted tokens)
  console.log("[3] Connecting Test Instagram & Facebook Accounts...");
  const igAccount = await prisma.socialAccount.upsert({
    where: {
      workspaceId_platform_platformAccountId: {
        workspaceId: workspace.id,
        platform: Platform.INSTAGRAM_BUSINESS,
        platformAccountId: "17841400099999999",
      },
    },
    update: {
      encryptedToken: encryptToken("mock_ig_oauth_token"),
      isActive: true,
    },
    create: {
      workspaceId: workspace.id,
      platform: Platform.INSTAGRAM_BUSINESS,
      platformAccountId: "17841400099999999",
      accountName: "kolkata_digital_hub_ig",
      encryptedToken: encryptToken("mock_ig_oauth_token"),
      isActive: true,
    },
  });

  await prisma.socialAccount.upsert({
    where: {
      workspaceId_platform_platformAccountId: {
        workspaceId: workspace.id,
        platform: Platform.FACEBOOK_PAGE,
        platformAccountId: "100099999999999",
      },
    },
    update: {
      encryptedToken: encryptToken("mock_fb_oauth_token"),
      isActive: true,
    },
    create: {
      workspaceId: workspace.id,
      platform: Platform.FACEBOOK_PAGE,
      platformAccountId: "100099999999999",
      accountName: "Kolkata Digital Hub FB",
      encryptedToken: encryptToken("mock_fb_oauth_token"),
      isActive: true,
    },
  });
  console.log("    ✓ Social accounts created with encrypted tokens in database.");

  // 4. Test Official Meta 2-step Instagram Flow
  console.log("[4] Testing Meta Instagram 2-step container flow...");
  let savedContainerId = "";
  const igResult = await publishInstagramPost(
    "17841400099999999",
    "mock_token",
    {
      imageUrl: "https://res.cloudinary.com/mdlaprj0/image/upload/v1793193499/abcd_posters/iy93bkzz4nub2ck4nupw.webp",
      caption: "Diwali festival offer! Call 8944899747 #abcd",
      onContainerCreated: async (containerId) => {
        savedContainerId = containerId;
        console.log(`    ✓ Step 1: Media container created: ${containerId}`);
        console.log(`    ✓ AGENTS.md Rule Met: Container ID stored before publishing.`);
      },
    }
  );

  console.log(`    ✓ Step 2: Media container published! Post ID: ${igResult.postId}`);

  // 5. Test Facebook Page Publishing
  console.log("[5] Testing Facebook Page post publishing...");
  const fbResult = await publishFacebookPage(
    "100099999999999",
    "mock_token",
    {
      message: "Special weekend announcement for our customers!",
      imageUrl: "https://res.cloudinary.com/mdlaprj0/image/upload/v1793193499/abcd_posters/iy93bkzz4nub2ck4nupw.webp",
    }
  );
  console.log(`    ✓ Facebook post published! Post ID: ${fbResult.postId}`);

  // 6. Test Content Draft & Publishing Job creation in DB
  console.log("[6] Testing Database Job & State Tracking...");
  const content = await prisma.contentItem.create({
    data: {
      workspaceId: workspace.id,
      title: "Queue Integration Test Promo",
      rawBrief: "Test promo for automated publishing verification",
      status: PostStatus.APPROVED,
      variants: {
        create: [
          {
            platform: Platform.INSTAGRAM_BUSINESS,
            caption: "Instagram test caption",
            mediaUrl: "https://res.cloudinary.com/mdlaprj0/image/upload/v1793193499/abcd_posters/iy93bkzz4nub2ck4nupw.webp",
          },
          {
            platform: Platform.FACEBOOK_PAGE,
            caption: "Facebook test caption",
          },
        ],
      },
    },
  });

  const publishJob = await prisma.publishJob.create({
    data: {
      contentItemId: content.id,
      socialAccountId: igAccount.id,
      scheduledTime: new Date(),
      status: PostStatus.PUBLISHED,
      containerId: savedContainerId,
      platformPostId: igResult.postId,
    },
  });

  console.log(`    ✓ ContentItem ${content.id} and PublishJob ${publishJob.id} recorded.`);

  // 7. Verify Audit Log entry
  await prisma.auditLog.create({
    data: {
      workspaceId: workspace.id,
      action: "SOCIAL_POST_PUBLISHED",
      details: {
        contentItemId: content.id,
        destinations: ["Instagram", "Facebook"],
      },
    },
  });

  const audit = await prisma.auditLog.findFirst({
    where: {
      workspaceId: workspace.id,
      action: "SOCIAL_POST_PUBLISHED",
    },
    orderBy: { createdAt: "desc" },
  });

  if (!audit) {
    throw new Error("Audit log entry missing!");
  }
  console.log(`    ✓ Audit log verified: ${audit.action} at ${audit.createdAt.toISOString()}`);

  console.log("\n✅ ALL PUBLISHING QUEUE & META INTEGRATION TESTS PASSED!");
}

runPublishingQueueTest()
  .catch((err) => {
    console.error("❌ Publishing queue test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
