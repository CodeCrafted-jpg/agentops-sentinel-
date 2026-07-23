import { NextResponse } from "next/server";
import type { Alert, ApiResponse } from "@agentops/shared";

/**
 * GET /api/alerts
 *
 * Phase 0 stub — returns an empty list so the route shape and response
 * envelope are locked in early. Phase 1 wires this to the FastAPI backend
 * (backend/app/api/alerts.py) which reads from the alert store populated
 * by the SigNoz webhook.
 */
export async function GET(): Promise<NextResponse<ApiResponse<Alert[]>>> {
  return NextResponse.json({ data: [], error: null });
}
