import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, createTenantRepository, PostStatus } from "@abcd/db";
import { executePublishJob, enqueuePublishJob } from "@/lib/queue";
import { z } from "zod";

const publishRequestSchema = z.object({
  contentItemId: z.string().min(1),
  action: z.enum(["PUBLISH_NOW", "SCHEDULE"]).default("PUBLISH_NOW"),
  scheduledTime: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const workspaceId = (session?.user as any)?.workspaceId;

    if (!workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = publishRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { contentItemId, action, scheduledTime } = result.data;

    if (action === "PUBLISH_NOW") {
      const publishResult = await executePublishJob(contentItemId, workspaceId);
      return NextResponse.json({
        success: publishResult.success,
        publishedDestinations: publishResult.publishedDestinations,
        errors: publishResult.errors,
      });
    } else {
      const targetTime = scheduledTime ? new Date(scheduledTime) : new Date(Date.now() + 60 * 60 * 1000);
      const jobId = await enqueuePublishJob(contentItemId, workspaceId, targetTime);

      await prisma.contentItem.update({
        where: { id: contentItemId },
        data: {
          status: PostStatus.SCHEDULED,
          scheduledFor: targetTime,
        },
      });

      return NextResponse.json({
        success: true,
        jobId,
        scheduledFor: targetTime.toISOString(),
      });
    }
  } catch (error: any) {
    console.error("Publish API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process publish request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const workspaceId = (session?.user as any)?.workspaceId;

    if (!workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await prisma.publishJob.findMany({
      where: {
        contentItem: {
          workspaceId,
        },
      },
      include: {
        contentItem: {
          select: {
            title: true,
            status: true,
            scheduledFor: true,
          },
        },
      },
      orderBy: { scheduledTime: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    console.error("Fetch publish queue error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load publishing queue" },
      { status: 500 }
    );
  }
}
