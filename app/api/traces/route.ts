import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, Trace, TraceSummary } from "@agentops/shared";
import { SignozClient } from "@agentops/telemetry";

const signozClient = new SignozClient(
  process.env.SIGNOZ_API_URL || "http://localhost:3301"
);

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Trace | TraceSummary[] | null>>> {
  const { searchParams } = new URL(request.url);
  const agentName = searchParams.get("agentName") || undefined;
  const traceId = searchParams.get("traceId") || undefined;

  try {
    if (traceId) {
      const trace = await signozClient.getTrace(traceId);
      if (!trace) {
        return NextResponse.json(
          { data: null, error: `trace not found: ${traceId}` },
          { status: 404 }
        );
      }

      return NextResponse.json({ data: trace, error: null });
    }

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
