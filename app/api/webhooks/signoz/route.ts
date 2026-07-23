import { NextRequest, NextResponse } from "next/server";
import { signozWebhookPayloadSchema } from "@agentops/shared";
import type { Alert, ApiResponse } from "@agentops/shared";
import { db } from "@/app/api/db";
import { SignozClient, DiagnosisAgent } from "@agentops/telemetry";

const signozClient = new SignozClient(
  process.env.SIGNOZ_API_URL || "http://localhost:3301"
);
const diagnosisAgent = new DiagnosisAgent();

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ received: true; alertId: string }>>> {
  const body = await request.json().catch(() => null);
  const parsed = signozWebhookPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: `invalid signoz payload: ${parsed.error.message}` },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  const alertId = `alt_${Math.random().toString(36).substring(2, 11)}`;

  const alert: Alert = {
    alertId,
    title: payload.ruleName,
    severity: payload.severity,
    status: "open",
    agentName: payload.labels["serviceName"] || payload.labels["service"] || "unknown-agent",
    ruleName: payload.ruleName,
    traceId: payload.labels["traceId"] || null,
    createdAt: payload.startsAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    summary: payload.annotations["description"] || payload.annotations["summary"] || "Anomaly detected by rule.",
  };

  db.addAlert(alert);
  console.info("[webhooks/signoz] Alert saved:", alert.alertId, alert.title);

  if (alert.traceId) {
    const traceId = alert.traceId;
    (async () => {
      try {
        console.info(`[webhooks/signoz] Fetching trace context for traceId: ${traceId}`);
        const trace = await signozClient.getTrace(traceId);
        if (trace) {
          console.info(`[webhooks/signoz] Running Diagnosis Agent for trace: ${alert.traceId}`);
          const diagnosis = await diagnosisAgent.diagnose(trace, alert.alertId);
          db.addDiagnosis(diagnosis);
          console.info(`[webhooks/signoz] Diagnosis saved for alert ${alert.alertId}`);
        } else {
          console.warn(`[webhooks/signoz] No trace found for traceId: ${alert.traceId}`);
        }
      } catch (err) {
        console.error(`[webhooks/signoz] Error diagnosing trace ${alert.traceId}:`, err);
      }
    })();
  }

  return NextResponse.json({ data: { received: true, alertId }, error: null }, { status: 202 });
}
