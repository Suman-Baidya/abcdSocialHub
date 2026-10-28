import PgBoss from "pg-boss";
import { prisma, createTenantRepository, Platform, PostStatus } from "@abcd/db";
import { decryptToken, publishFacebookPage, publishInstagramPost } from "@abcd/integrations";

export const PUBLISH_QUEUE_NAME = "publish-social-post";

declare global {
  // eslint-disable-next-line no-var
  var globalPgBoss: PgBoss | undefined;
}

/**
 * Returns the singleton pg-boss instance connected via non-pooled DIRECT_URL.
 */
export async function getBoss(): Promise<PgBoss> {
  if (globalThis.globalPgBoss) {
    return globalThis.globalPgBoss;
  }

  // pg-boss requires a direct PostgreSQL connection string (not PgBouncer pooled)
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DIRECT_URL or DATABASE_URL for pg-boss queue");
  }

  const boss = new PgBoss({
    connectionString,
    schema: "pgboss",
    archiveCompletedAfterSeconds: 86400, // Retain for 24 hours
    deleteAfterDays: 7,
  });

  boss.on("error", (error) => {
    console.error("[pg-boss] Queue Error:", error);
  });

  await boss.start();
  globalThis.globalPgBoss = boss;
  return boss;
}

export interface PublishJobPayload {
  contentItemId: string;
  workspaceId: string;
}

/**
 * Enqueues a scheduled or immediate publishing job into pg-boss.
 */
export async function enqueuePublishJob(
  contentItemId: string,
  workspaceId: string,
  runAt?: Date
): Promise<string | null> {
  const boss = await getBoss();

  const options: PgBoss.SendOptions = {
    singletonKey: `publish_${contentItemId}`, // Idempotent: prevent duplicate jobs for the same content item
    retryLimit: 3,
    retryDelay: 30, // 30s initial backoff
    retryBackoff: true,
  };

  if (runAt && runAt > new Date()) {
    options.startAfter = runAt;
  }

  const jobId = await boss.send(PUBLISH_QUEUE_NAME, { contentItemId, workspaceId }, options);
  return jobId;
}

/**
 * Core idempotent publishing worker.
 * Can be invoked either by pg-boss background consumer or direct manual trigger.
 */
export async function executePublishJob(
  contentItemId: string,
  workspaceId: string
): Promise<{ success: boolean; publishedDestinations: string[]; errors: string[] }> {
  const repo = createTenantRepository(workspaceId);

  // 1. Fetch content item & variants
  const content = await prisma.contentItem.findFirst({
    where: { id: contentItemId, workspaceId },
    include: { variants: true },
  });

  if (!content) {
    throw new Error(`ContentItem ${contentItemId} not found in workspace ${workspaceId}`);
  }

  // Idempotency: if already published, skip
  if (content.status === PostStatus.PUBLISHED) {
    return {
      success: true,
      publishedDestinations: ["ALREADY_PUBLISHED"],
      errors: [],
    };
  }

  // 2. Fetch active connected social accounts
  const socialAccounts = await prisma.socialAccount.findMany({
    where: { workspaceId, isActive: true },
  });

  const publishedDestinations: string[] = [];
  const errors: string[] = [];

  // Update status to PUBLISHING
  await prisma.contentItem.update({
    where: { id: contentItemId },
    data: { status: PostStatus.PUBLISHING },
  });

  // If no social accounts connected, fall back to mock sandbox publishing for demonstration
  const accountsToPublish =
    socialAccounts.length > 0
      ? socialAccounts
      : [
          {
            id: "mock_ig_account",
            workspaceId,
            platform: Platform.INSTAGRAM_BUSINESS,
            platformAccountId: "17841400000000000",
            accountName: "ABCD Demo Instagram",
            encryptedToken: "mock_token",
            tokenExpiresAt: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "mock_fb_account",
            workspaceId,
            platform: Platform.FACEBOOK_PAGE,
            platformAccountId: "100000000000000",
            accountName: "ABCD Demo Facebook Page",
            encryptedToken: "mock_token",
            tokenExpiresAt: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

  // 3. Publish to each platform variant
  for (const account of accountsToPublish) {
    const variant = content.variants.find((v) => v.platform === account.platform) || content.variants[0];
    if (!variant) continue;

    // Decrypt social token safely
    let accessToken = "mock_token";
    if (account.encryptedToken !== "mock_token") {
      try {
        accessToken = decryptToken(account.encryptedToken);
      } catch (err: any) {
        errors.push(`Token decryption failed for ${account.platform}: ${err.message}`);
        continue;
      }
    }

    // Ensure social account exists in DB for foreign key constraint
    let validSocialAccountId = account.id;
    if (validSocialAccountId.startsWith("mock_")) {
      const demoAccount = await prisma.socialAccount.upsert({
        where: {
          workspaceId_platform_platformAccountId: {
            workspaceId,
            platform: account.platform,
            platformAccountId: account.platformAccountId,
          },
        },
        update: {},
        create: {
          workspaceId,
          platform: account.platform,
          platformAccountId: account.platformAccountId,
          accountName: account.accountName,
          encryptedToken: account.encryptedToken,
          isActive: true,
        },
      });
      validSocialAccountId = demoAccount.id;
    }

    // Create or find PublishJob entry
    const publishJob = await prisma.publishJob.create({
      data: {
        contentItemId: content.id,
        socialAccountId: validSocialAccountId,
        scheduledTime: content.scheduledFor || new Date(),
        status: PostStatus.PUBLISHING,
      },
    });

    try {
      if (account.platform === Platform.INSTAGRAM_BUSINESS) {
        const imageUrl = variant.mediaUrl || "https://res.cloudinary.com/mdlaprj0/image/upload/v1793193499/abcd_posters/iy93bkzz4nub2ck4nupw.webp";
        
        const result = await publishInstagramPost(account.platformAccountId, accessToken, {
          imageUrl,
          caption: variant.caption,
          // CRITICAL AGENTS.md rule: Store container ID before calling publish!
          onContainerCreated: async (containerId: string) => {
            await prisma.publishJob.update({
              where: { id: publishJob.id },
              data: { containerId },
            });
          },
        });

        await prisma.publishJob.update({
          where: { id: publishJob.id },
          data: {
            status: PostStatus.PUBLISHED,
            platformPostId: result.postId,
          },
        });

        publishedDestinations.push(`Instagram (${account.accountName})`);
      } else if (account.platform === Platform.FACEBOOK_PAGE) {
        const result = await publishFacebookPage(account.platformAccountId, accessToken, {
          message: variant.caption,
          imageUrl: variant.mediaUrl || undefined,
        });

        await prisma.publishJob.update({
          where: { id: publishJob.id },
          data: {
            status: PostStatus.PUBLISHED,
            platformPostId: result.postId,
          },
        });

        publishedDestinations.push(`Facebook (${account.accountName})`);
      }
    } catch (err: any) {
      console.error(`Publishing failed for ${account.platform}:`, err);
      errors.push(`${account.platform}: ${err.message}`);

      await prisma.publishJob.update({
        where: { id: publishJob.id },
        data: {
          status: PostStatus.FAILED,
          lastError: err.message,
          attemptsCount: { increment: 1 },
        },
      });

      // If token expired/unauthorized, mark account as needing reconnect
      if (err.isAuthError) {
        if (!account.id.startsWith("mock_")) {
          await prisma.socialAccount.update({
            where: { id: account.id },
            data: { isActive: false },
          });
        }
      }
    }
  }

  // 4. Update overall ContentItem status
  const finalStatus = publishedDestinations.length > 0 ? PostStatus.PUBLISHED : PostStatus.FAILED;
  await prisma.contentItem.update({
    where: { id: contentItemId },
    data: { status: finalStatus },
  });

  // 5. Write audit log & usage deduction
  if (publishedDestinations.length > 0) {
    await prisma.auditLog.create({
      data: {
        workspaceId,
        action: "SOCIAL_POST_PUBLISHED",
        details: {
          contentItemId,
          destinations: publishedDestinations,
          publishedAt: new Date().toISOString(),
        },
      },
    });

    await repo.recordUsage("SOCIAL_PUBLISH", publishedDestinations.length, {
      contentItemId,
      destinations: publishedDestinations,
    });
  }

  return {
    success: publishedDestinations.length > 0,
    publishedDestinations,
    errors,
  };
}
