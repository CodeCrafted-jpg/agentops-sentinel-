import { NextResponse } from "next/server";
import type { Alert, ApiResponse } from "@agentops/shared";
import { db } from "@/app/api/db";

export async function GET(): Promise<NextResponse<ApiResponse<Alert[]>>> {
  try {
    const alerts = await db.getAlerts();
    return NextResponse.json({ data: alerts, error: null });
  } catch (err) {
    console.error("Failed to load alerts:", err);
    return NextResponse.json({ data: null, error: "Unable to load alerts." }, { status: 500 });
  }
}
