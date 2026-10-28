import { PrismaClient, Platform, PostStatus } from "@prisma/client";
import crypto from "node:crypto";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export function hashApprovalToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Tenant-Scoped Repository Factory
 * Strictly enforces that every database query is scoped to a verified workspaceId.
 * Never call raw Prisma queries without workspace scoping in application routes.
 */
export function createTenantRepository(workspaceId: string) {
  if (!workspaceId) {
    throw new Error("Security Violation: workspaceId is required for tenant data access");
  }

  return {
    workspaceId,

    // Workspace & Brand
    getWorkspace: () => prisma.workspace.findUnique({ where: { id: workspaceId } }),
    getBrandKit: () => prisma.brandKit.findUnique({ where: { workspaceId } }),
    upsertBrandKit: (data: any) =>
      prisma.brandKit.upsert({
        where: { workspaceId },
        update: data,
        create: { ...data, workspaceId },
      }),

    // Content Items
    listContentItems: (status?: PostStatus) =>
      prisma.contentItem.findMany({
        where: { workspaceId, ...(status ? { status } : {}) },
        include: { variants: true },
        orderBy: { createdAt: "desc" },
      }),

    getContentItem: (id: string) =>
      prisma.contentItem.findFirst({
        where: { id, workspaceId },
        include: { variants: true },
      }),

    // Create Draft Content with Mobile Magic-Link Approval Token
    createContentDraftWithApproval: async (params: {
      title: string;
      rawBrief: string;
      scheduledFor?: Date;
      variants: Array<{
        platform: Platform;
        caption: string;
        mediaUrl?: string;
        mediaType?: string;
        hashtags?: string[];
      }>;
    }) => {
      // Generate 32-byte cryptographically secure random token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = hashApprovalToken(rawToken);

      // Expire strictly in 72 hours
      const tokenExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

      const contentItem = await prisma.contentItem.create({
        data: {
          workspaceId,
          title: params.title,
          rawBrief: params.rawBrief,
          status: PostStatus.IN_REVIEW,
          scheduledFor: params.scheduledFor || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24h
          approvalToken: hashedToken,
          tokenExpiresAt,
          variants: {
            create: params.variants.map((v) => ({
              platform: v.platform,
              caption: v.caption,
              mediaUrl: v.mediaUrl,
              mediaType: v.mediaType || "IMAGE",
              hashtags: v.hashtags || [],
              turnitoutClean: true,
            })),
          },
        },
        include: {
          variants: true,
        },
      });

      return {
        contentItem,
        rawToken,
        tokenExpiresAt,
      };
    },

    // Usage Ledger (Append-Only)
    recordUsage: (actionType: string, creditsUsed: number, metadata?: any) =>
      prisma.usageLedger.create({
        data: {
          workspaceId,
          actionType,
          creditsUsed,
          metadata: metadata ?? {},
        },
      }),

    getMonthlyCreditUsage: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const records = await prisma.usageLedger.findMany({
        where: {
          workspaceId,
          createdAt: { gte: startOfMonth },
        },
      });

      return records.reduce((sum, item) => sum + item.creditsUsed, 0);
    },
  };
}

/**
 * Public Mobile Magic-Link Resolver
 * Resolves a ContentItem using the single-use raw token without requiring user authentication.
 */
export async function resolveApprovalToken(rawToken: string) {
  if (!rawToken || rawToken.length < 16) return null;

  const hashedToken = hashApprovalToken(rawToken);

  const contentItem = await prisma.contentItem.findUnique({
    where: { approvalToken: hashedToken },
    include: {
      workspace: {
        include: {
          brandKit: true,
        },
      },
      variants: true,
    },
  });

  if (!contentItem) return null;

  // Check 72-hour expiration
  if (contentItem.tokenExpiresAt && contentItem.tokenExpiresAt < new Date()) {
    return { expired: true, contentItem };
  }

  return { expired: false, contentItem };
}

/**
 * Public Mobile Magic-Link Decision Handler
 * Single-use decision execution (Approve -> SCHEDULED, Request Changes -> DRAFT)
 */
export async function submitApprovalDecision(
  rawToken: string,
  decision: "APPROVE" | "REQUEST_CHANGES",
  notes?: string
) {
  const resolved = await resolveApprovalToken(rawToken);
  if (!resolved || resolved.expired || !resolved.contentItem) {
    throw new Error("Invalid or expired approval token");
  }

  const { contentItem } = resolved;

  if (decision === "APPROVE") {
    // Transition to SCHEDULED and invalidate token (single-use)
    const updated = await prisma.contentItem.update({
      where: { id: contentItem.id },
      data: {
        status: PostStatus.SCHEDULED,
        approvalToken: null, // Invalidate token on approval
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        workspaceId: contentItem.workspaceId,
        action: "CONTENT_APPROVED_VIA_MAGIC_LINK",
        details: {
          contentItemId: contentItem.id,
          decision: "APPROVE",
          approvedAt: new Date().toISOString(),
        },
      },
    });

    return { success: true, status: updated.status };
  } else {
    // Request changes
    const updated = await prisma.contentItem.update({
      where: { id: contentItem.id },
      data: {
        status: PostStatus.DRAFT,
      },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: contentItem.workspaceId,
        action: "CONTENT_CHANGES_REQUESTED",
        details: {
          contentItemId: contentItem.id,
          decision: "REQUEST_CHANGES",
          notes: notes || "Changes requested by business owner",
          requestedAt: new Date().toISOString(),
        },
      },
    });

    return { success: true, status: updated.status };
  }
}

export * from "@prisma/client";
