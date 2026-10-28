import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@abcd/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    const isSuperAdmin =
      user?.isSuperAdmin ||
      user?.role === "SUPER_ADMIN" ||
      user?.email === "suman.baidya.pro@gmail.com";

    if (!session || !isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [userCount, workspaceCount, contentCount, creditUsage] = await Promise.all([
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.contentItem.count(),
      prisma.usageLedger.aggregate({
        _sum: { creditsUsed: true },
      }),
    ]);

    const totalCredits = creditUsage._sum.creditsUsed || 0;
    
    // Unit economics modeling (in INR ₹)
    const pricePerWorkspace = 499; // Starter Plan
    const projectedMRR = workspaceCount * pricePerWorkspace;
    const vpsServerCost = 1000; // ~12 EUR/month VPS
    const estAiCostPerGen = 0.08; // ₹0.08 average per generation
    const totalAiCost = Math.round(totalCredits * estAiCostPerGen);
    const totalCOGS = vpsServerCost + totalAiCost;
    const grossProfit = Math.max(0, projectedMRR - totalCOGS);
    const grossMargin = projectedMRR > 0 ? Math.round((grossProfit / projectedMRR) * 100) : 92;

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers: userCount,
        totalWorkspaces: workspaceCount,
        totalContentGenerated: contentCount,
        totalCreditsConsumed: totalCredits,
        financials: {
          projectedMRR,
          vpsServerCost,
          totalAiCost,
          totalCOGS,
          grossProfit,
          grossMarginPct: grossMargin,
        },
      },
    });
  } catch (error: any) {
    console.error("Admin metrics API error:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
