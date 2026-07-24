import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

let sdk: NodeSDK | null = null;

export function initTelemetry(serviceName: string = "agentops-sentinel") {
  if (sdk) {
    return;
  }

  const SIGNOZ_OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || process.env.SIGNOZ_OTLP_ENDPOINT || (process.env.NEXT_PUBLIC_SIGNOZ_API_URL ? `${process.env.NEXT_PUBLIC_SIGNOZ_API_URL}/v1/traces` : "http://localhost:4318/v1/traces");
  const SIGNOZ_API_KEY = process.env.SIGNOZ_INGESTION_KEY || process.env.SIGNOZ_API_KEY;

  const traceExporter = new OTLPTraceExporter({
    url: SIGNOZ_OTLP_ENDPOINT,
    headers: SIGNOZ_API_KEY ? { "signoz-access-token": SIGNOZ_API_KEY } : {},
  });

  sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    traceExporter,
  });

  sdk.start();

  process.on("SIGTERM", () => {
    sdk?.shutdown()
      .then(() => console.info("Tracing terminated"))
      .catch((error) => console.error("Error terminating tracing", error))
      .finally(() => process.exit(0));
  });

  console.info(`OpenTelemetry SDK initialized for service "${serviceName}". Sending traces to: ${SIGNOZ_OTLP_ENDPOINT}`);
}

export function shutdownTelemetry(): Promise<void> {
  if (!sdk) return Promise.resolve();
  return sdk.shutdown().then(() => {
    sdk = null;
  });
}

export * from "./span-helpers";
export * from "./signoz-client";
export * from "./diagnosis-agent";
