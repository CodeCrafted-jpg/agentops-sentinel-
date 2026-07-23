import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, Diagnosis } from "@agentops/shared";

/**
 * POST /api/diagnostics
 *
 * Phase 0 stub — accepts `{ traceId }` and returns 501 until the diagnosis
 * agent (backend/services/diagnosis_agent.py, bridged over MCP via
 * backend/services/mcp_bridge.py) is implemented in a later phase.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Diagnosis>>> {
  const body = await request.json().catch(() => null);

  if (!body?.traceId || typeof body.traceId !== "string") {
    return NextResponse.json(
      { data: null, error: "missing required field: traceId" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { data: null, error: "diagnosis agent not yet implemented" },
    { status: 501 }
  );
}
