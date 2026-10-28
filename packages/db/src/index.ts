import { PrismaClient } from "@prisma/client";

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
    listContentItems: (status?: any) =>
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

export * from "@prisma/client";
