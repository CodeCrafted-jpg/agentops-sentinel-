import { NextResponse } from "next/server";
import type { ApiResponse, TraceSummary } from "@agentops/shared";

/**
 * GET /api/traces
 *
 * Phase 0 stub. Phase 1 proxies to backend/app/api (trace listing backed
 * by SigNoz query APIs via backend/services/signoz_client.py).
 */
export async function GET(): Promise<NextResponse<ApiResponse<TraceSummary[]>>> {
  return NextResponse.json({ data: [], error: null });
}
