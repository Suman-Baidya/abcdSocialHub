import { NextResponse } from "next/server";
import { submitApprovalDecision } from "@abcd/db";
import { z } from "zod";

const decisionSchema = z.object({
  decision: z.enum(["APPROVE", "REQUEST_CHANGES"]),
  notes: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const body = await req.json();
    const result = decisionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { decision, notes } = result.data;
    const response = await submitApprovalDecision(token, decision, notes);

    return NextResponse.json({
      success: true,
      decision,
      status: response.status,
    });
  } catch (error: any) {
    console.error("Approval decision error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process decision" },
      { status: 400 }
    );
  }
}
