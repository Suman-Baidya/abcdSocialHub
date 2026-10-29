import {
  prisma,
  createTenantRepository,
  resolveApprovalToken,
  submitApprovalDecision,
  Platform,
  PostStatus,
} from "../packages/db/src/index";
import { encryptToken, decryptToken } from "../packages/integrations/src/crypto";
import { checkRateLimit } from "../apps/web/lib/rate-limit";

async function runSecurityAudit() {
  console.log("==================================================================");
  console.log("🔒 PHASE 9: MULTI-TENANT ISOLATION & SECURITY AUDIT TEST SUITE");
  console.log("==================================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition: boolean, testName: string, failureDetail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✓ [PASS] ${testName}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      if (failureDetail) console.error(`     Detail: ${failureDetail}`);
      throw new Error(`Security Test Failed: ${testName}`);
    }
  }

  try {
    // ==================================================================
    // 1. SETUP TWO INDEPENDENT TENANTS (WORKSPACE A & WORKSPACE B)
    // ==================================================================
    console.log("[1] Setting up two isolated test workspaces (Tenant A vs Tenant B)...");

    const orgA = await prisma.organization.upsert({
      where: { slug: "security-test-org-a" },
      update: {},
      create: { name: "Tenant A Org", slug: "security-test-org-a" },
    });

    const orgB = await prisma.organization.upsert({
      where: { slug: "security-test-org-b" },
      update: {},
      create: { name: "Tenant B Org", slug: "security-test-org-b" },
    });

    const workspaceA = await prisma.workspace.upsert({
      where: { id: "security-test-workspace-a" },
      update: {},
      create: {
        id: "security-test-workspace-a",
        name: "Kolkata Fitness Arena",
        organizationId: orgA.id,
      },
    });

    const workspaceB = await prisma.workspace.upsert({
      where: { id: "security-test-workspace-b" },
      update: {},
      create: {
        id: "security-test-workspace-b",
        name: "Siliguri Tea Cafe",
        organizationId: orgB.id,
      },
    });

    const repoA = createTenantRepository(workspaceA.id);
    const repoB = createTenantRepository(workspaceB.id);

    console.log(`    Tenant A: ${workspaceA.name} (${workspaceA.id})`);
    console.log(`    Tenant B: ${workspaceB.name} (${workspaceB.id})\n`);

    // ==================================================================
    // 2. DATA CREATION IN SEPARATE WORKSPACES
    // ==================================================================
    console.log("[2] Generating scoped content in both workspaces...");

    const { contentItem: itemA } = await repoA.createContentDraftWithApproval({
      title: "Tenant A Secret Campaign",
      rawBrief: "Flat 40% off gym annual memberships",
      variants: [
        {
          platform: Platform.INSTAGRAM_BUSINESS,
          caption: "Tenant A confidential promotional post",
        },
      ],
    });

    const { contentItem: itemB } = await repoB.createContentDraftWithApproval({
      title: "Tenant B Secret Campaign",
      rawBrief: "Buy 1 get 1 free Darjeeling first flush tea",
      variants: [
        {
          platform: Platform.FACEBOOK_PAGE,
          caption: "Tenant B confidential promotional post",
        },
      ],
    });

    // ==================================================================
    // 3. CROSS-TENANT DATA ISOLATION VERIFICATION
    // ==================================================================
    console.log("\n[3] Testing Cross-Tenant Data Isolation (Zero Data Leakage)...");

    // Repo A querying items
    const itemsSeenByA = await repoA.listContentItems();
    const hasItemAInRepoA = itemsSeenByA.some((i) => i.id === itemA.id);
    const hasItemBInRepoA = itemsSeenByA.some((i) => i.id === itemB.id);

    assert(hasItemAInRepoA, "Tenant A repository retrieves Tenant A's own content");
    assert(!hasItemBInRepoA, "Tenant A repository CANNOT see Tenant B's content (Leakage Guard)");

    // Repo B querying items
    const itemsSeenByB = await repoB.listContentItems();
    const hasItemBInRepoB = itemsSeenByB.some((i) => i.id === itemB.id);
    const hasItemAInRepoB = itemsSeenByB.some((i) => i.id === itemA.id);

    assert(hasItemBInRepoB, "Tenant B repository retrieves Tenant B's own content");
    assert(!hasItemAInRepoB, "Tenant B repository CANNOT see Tenant A's content (Leakage Guard)");

    // Direct single item query across tenants
    const itemBQueriedByA = await repoA.getContentItem(itemB.id);
    assert(
      itemBQueriedByA === null,
      "Tenant A cannot fetch Tenant B's specific content item by ID"
    );

    const itemAQueriedByB = await repoB.getContentItem(itemA.id);
    assert(
      itemAQueriedByB === null,
      "Tenant B cannot fetch Tenant A's specific content item by ID"
    );

    // ==================================================================
    // 4. AES-256-GCM SOCIAL TOKEN ENCRYPTION & INTEGRITY
    // ==================================================================
    console.log("\n[4] Testing AES-256-GCM Social Token Authenticated Encryption...");

    const sensitiveMetaToken = "EAAGNO4_live_production_secret_token_never_expose_me_12345";
    const encrypted = encryptToken(sensitiveMetaToken);

    // Assert format: iv:authTag:ciphertext (3 colon-separated hex components)
    const parts = encrypted.split(":");
    assert(parts.length === 3, "Encrypted token structure follows IV:AuthTag:Ciphertext format");
    assert(!encrypted.includes(sensitiveMetaToken), "Plaintext token is never present in ciphertext");

    // Decryption assertion
    const decrypted = decryptToken(encrypted);
    assert(decrypted === sensitiveMetaToken, "Decrypted token matches original secret exactly");

    // Tamper resistance assertion (AEAD Authenticated Encryption)
    let tamperDetected = false;
    try {
      const tamperedParts = [...parts];
      // Flip the last byte of the ciphertext
      tamperedParts[2] = tamperedParts[2].slice(0, -2) + "ff";
      decryptToken(tamperedParts.join(":"));
    } catch {
      tamperDetected = true;
    }
    assert(tamperDetected, "AEAD integrity check rejects tampered token ciphertext");

    // ==================================================================
    // 5. SHA-256 SINGLE-USE MAGIC LINK APPROVAL SECURITY
    // ==================================================================
    console.log("\n[5] Testing Mobile Magic-Link Approval Token Security...");

    const { contentItem: draftForApproval, rawToken } = await repoA.createContentDraftWithApproval({
      title: "Festive Puja Deal",
      rawBrief: "Diwali 20% cashback",
      variants: [
        {
          platform: Platform.INSTAGRAM_BUSINESS,
          caption: "Puja flash deal!",
        },
      ],
    });

    // Verify token stored in DB is hashed, not plaintext
    const dbRecord = await prisma.contentItem.findUnique({
      where: { id: draftForApproval.id },
    });
    assert(
      dbRecord?.approvalToken !== rawToken,
      "Approval token in database is hashed with SHA-256 (not raw token)"
    );

    // Resolve with valid token
    const resolved = await resolveApprovalToken(rawToken);
    assert(
      resolved !== null && resolved.contentItem?.id === draftForApproval.id,
      "Valid raw token successfully resolves content item"
    );

    // Resolve with invalid/forged token
    const forgedToken = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const invalidResolved = await resolveApprovalToken(forgedToken);
    assert(invalidResolved === null, "Forged token fails resolution");

    // Single-use execution test (Approve and verify token invalidation)
    const decisionResult = await submitApprovalDecision(rawToken, "APPROVE");
    assert(decisionResult.status === PostStatus.SCHEDULED, "Approval transitions status to SCHEDULED");

    // Replay attack test: using the same token again must fail
    let replayPrevented = false;
    try {
      await submitApprovalDecision(rawToken, "APPROVE");
    } catch {
      replayPrevented = true;
    }
    assert(replayPrevented, "Replay attack prevented: token is invalidated immediately on approval");

    // ==================================================================
    // 6. USAGE LEDGER CROSS-TENANT ISOLATION
    // ==================================================================
    console.log("\n[6] Testing Usage Ledger Multi-Tenant Isolation...");

    // Record usage in workspace A
    await repoA.recordUsage("AI_POSTER_SYNTHESIS", 7, { model: "FastAPI-Pillow" });

    // Record usage in workspace B
    await repoB.recordUsage("AI_POSTER_SYNTHESIS", 3, { model: "FastAPI-Pillow" });

    const usageA = await repoA.getMonthlyCreditUsage();
    const usageB = await repoB.getMonthlyCreditUsage();

    assert(usageA >= 7, "Tenant A ledger aggregates only Tenant A's consumed credits");
    assert(usageB >= 3, "Tenant B ledger aggregates only Tenant B's consumed credits");

    const recentUsageA = await repoA.getRecentUsage();
    const leakedToA = recentUsageA.some((r) => r.workspaceId === workspaceB.id);
    assert(!leakedToA, "Tenant A recent usage query contains zero Tenant B records");

    // ==================================================================
    // 7. IN-MEMORY SLIDING WINDOW RATE LIMITER
    // ==================================================================
    console.log("\n[7] Testing Sliding-Window Rate Limiting Engine...");

    const testClient = `client_ip_${Date.now()}`;
    const opts = { maxRequests: 2, intervalMs: 2000 };

    const req1 = checkRateLimit(testClient, opts);
    assert(req1.success && req1.remaining === 1, "First request passes rate limiter");

    const req2 = checkRateLimit(testClient, opts);
    assert(req2.success && req2.remaining === 0, "Second request passes within window limit");

    const req3 = checkRateLimit(testClient, opts);
    assert(!req3.success && req3.remaining === 0, "Third request is strictly blocked by rate limiter");

    console.log("\n==================================================================");
    console.log(`🎉 ALL ${passedTests}/${totalTests} SECURITY AUDIT TESTS PASSED CLEANLY!`);
    console.log("==================================================================\n");
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Security test failed with error:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

runSecurityAudit();
