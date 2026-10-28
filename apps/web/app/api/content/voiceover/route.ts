import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createTenantRepository } from "@abcd/db";
import { z } from "zod";

const voiceoverSchema = z.object({
  text: z.string().min(5, "Text must be at least 5 characters"),
  language: z.enum(["bengali", "english"]).default("bengali"),
  gender: z.enum(["female", "male"]).default("female"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const workspaceId = (session?.user as any)?.workspaceId;

    if (!workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = voiceoverSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { text, language, gender } = result.data;
    const workerUrl = process.env.PYTHON_WORKER_URL || "http://localhost:8000";

    const workerRes = await fetch(`${workerUrl}/api/generate-voiceover`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": process.env.INTERNAL_API_SECRET || "",
      },
      body: JSON.stringify({ text, language, gender }),
    });

    if (!workerRes.ok) {
      const errText = await workerRes.text();
      throw new Error(`Voice worker error: ${errText}`);
    }

    const data = await workerRes.json();

    // Record credit usage in append-only UsageLedger
    const repo = createTenantRepository(workspaceId);
    await repo.recordUsage("AI_VOICEOVER_GENERATE", 1, {
      language,
      gender,
      duration: data.duration_seconds,
    });

    return NextResponse.json({
      success: true,
      audioUrl: data.audio_url,
      duration: data.duration_seconds,
      voice: data.voice,
    });
  } catch (error: any) {
    console.error("Voiceover generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate neural voiceover" },
      { status: 500 }
    );
  }
}
