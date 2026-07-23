import { NextRequest, NextResponse } from "next/server";
import { signozWebhookPayloadSchema } from "@agentops/shared";
import type { ApiResponse } from "@agentops/shared";

/**
 * Inbound webhook from SigNoz alerting.
 *
 * Phase 0: validate the payload shape and acknowledge receipt only.
 * Phase 1 (backend/services/telemetry_ingest.py) will take over turning
 * this into a persisted Alert + triggering the diagnosis agent.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ received: true }>>> {
  const body = await request.json().catch(() => null);
  const parsed = signozWebhookPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: `invalid signoz payload: ${parsed.error.message}` },
      { status: 400 }
    );
  }

  // TODO(phase 1): forward to backend/services/telemetry_ingest.py
  // and persist as an Alert via backend/app/api/alerts.py.
  console.info("[webhooks/signoz] received rule:", parsed.data.ruleName);

  return NextResponse.json({ data: { received: true }, error: null }, { status: 202 });
}
