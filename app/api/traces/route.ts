import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, TraceSummary } from "@agentops/shared";
import { SignozClient } from "@agentops/telemetry";

const signozClient = new SignozClient(
  process.env.SIGNOZ_API_URL || "http://localhost:3301"
);

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<TraceSummary[]>>> {
  const { searchParams } = new URL(request.url);
  const agentName = searchParams.get("agentName") || undefined;

  try {
    const traces = await signozClient.getRecentTraces(agentName);
    const summaries: TraceSummary[] = traces.map((t: any) => ({
      traceId: t.traceId,
      agentName: t.agentName,
      environment: t.environment,
      startTime: t.startTime,
      durationMs: t.durationMs,
      status: t.status,
      spanCount: t.spanCount,
    }));
    return NextResponse.json({ data: summaries, error: null });
  } catch (err: any) {
    return NextResponse.json(
      { data: null, error: `failed to query traces: ${err.message || err}` },
      { status: 500 }
    );
  }
}
