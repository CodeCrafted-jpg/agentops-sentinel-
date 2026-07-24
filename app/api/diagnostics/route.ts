import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, Diagnosis } from "@agentops/shared";
import { db } from "@/app/api/db";
import { SignozClient, DiagnosisAgent } from "@agentops/telemetry";

const signozClient = new SignozClient(
  process.env.SIGNOZ_API_URL || "http://localhost:3301"
);
const diagnosisAgent = new DiagnosisAgent();

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Diagnosis>>> {
  const body = await request.json().catch(() => null);

  if (!body?.traceId || typeof body.traceId !== "string") {
    return NextResponse.json(
      { data: null, error: "missing required field: traceId" },
      { status: 400 }
    );
  }

  const traceId = body.traceId;

  const existingDiagnoses = await db.getDiagnoses();
  const existing = existingDiagnoses.find((d) => d.traceId === traceId);
  if (existing) {
    return NextResponse.json({ data: existing, error: null });
  }

  try {
    const trace = await signozClient.getTrace(traceId);
    if (!trace) {
      return NextResponse.json(
        { data: null, error: `trace not found: ${traceId}` },
        { status: 404 }
      );
    }

    const diagnosis = await diagnosisAgent.diagnose(trace, body.alertId || null);
    await db.addDiagnosis(diagnosis);

    return NextResponse.json({ data: diagnosis, error: null });
  } catch (err: any) {
    console.error("Failed to generate diagnosis:", err);
    return NextResponse.json(
      { data: null, error: `failed to generate diagnosis: ${err.message || err}` },
      { status: 500 }
    );
  }
}
