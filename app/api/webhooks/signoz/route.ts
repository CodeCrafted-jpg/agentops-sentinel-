import { NextRequest, NextResponse } from "next/server";
import { signozWebhookPayloadSchema } from "@agentops/shared";
import type { Alert, ApiResponse } from "@agentops/shared";
import { db } from "@/app/api/db";
import { SignozClient, DiagnosisAgent } from "@agentops/telemetry";

const signozClient = new SignozClient(
  process.env.SIGNOZ_API_URL || "http://localhost:3301"
);
const diagnosisAgent = new DiagnosisAgent();

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ received: true; alertId?: string }>>> {
  const body = await request.json().catch(() => null);
  
  // SigNoz often wraps alerts in an `alerts` array.
  let rawAlert = body;
  if (body && Array.isArray(body.alerts) && body.alerts.length > 0) {
    rawAlert = body.alerts[0];
  }

  // If this is just a test ping from SigNoz, accept it gracefully.
  if (!rawAlert || Object.keys(rawAlert).length === 0 || (body && body.receiver && !body.alerts)) {
    return NextResponse.json({ data: { received: true }, error: null }, { status: 200 });
  }

  // Try extracting fields loosely in case the schema mismatches slightly
  const title = rawAlert.ruleName || rawAlert.labels?.alertname || "Unknown Alert";
  const severity = rawAlert.severity || rawAlert.labels?.severity || "critical";
  const traceId = rawAlert.labels?.traceId || rawAlert.labels?.trace_id || null;
  const agentName = rawAlert.labels?.serviceName || rawAlert.labels?.service || "unknown-agent";
  const summary = rawAlert.annotations?.description || rawAlert.annotations?.summary || "Anomaly detected by rule.";
  const status = rawAlert.status === "resolved" ? "resolved" : "open";
  
  // If we can't find a ruleName or labels, it's probably a test message.
  if (!rawAlert.labels && !rawAlert.ruleName) {
    return NextResponse.json({ data: { received: true }, error: null }, { status: 200 });
  }

  const alertId = `alt_${Math.random().toString(36).substring(2, 11)}`;

  const alert: Alert = {
    alertId,
    title,
    severity: (["info", "warning", "critical"].includes(severity) ? severity : "critical") as Alert["severity"],
    status,
    agentName,
    ruleName: title,
    traceId,
    createdAt: rawAlert.startsAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    summary,
  };

  await db.addAlert(alert);
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
          await db.addDiagnosis(diagnosis);
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
