import { NextResponse } from "next/server";
import type { Alert, ApiResponse } from "@agentops/shared";
import { db } from "@/app/api/db";

export async function GET(): Promise<NextResponse<ApiResponse<Alert[]>>> {
  const alerts = db.getAlerts();
  return NextResponse.json({ data: alerts, error: null });
}
