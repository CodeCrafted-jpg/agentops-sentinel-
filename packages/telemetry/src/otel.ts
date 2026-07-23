import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const SIGNOZ_OTLP_ENDPOINT = process.env.SIGNOZ_OTLP_ENDPOINT || "http://localhost:4318/v1/traces";

let sdk: NodeSDK | null = null;

export function initTelemetry(serviceName: string = "agentops-sentinel") {
  if (sdk) {
    return;
  }

  const traceExporter = new OTLPTraceExporter({
    url: SIGNOZ_OTLP_ENDPOINT,
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
