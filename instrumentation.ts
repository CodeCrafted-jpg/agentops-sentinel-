import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const traceExporter = new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || `${process.env.NEXT_PUBLIC_SIGNOZ_API_URL || 'http://localhost:4318'}/v1/traces`,
      headers: (process.env.SIGNOZ_INGESTION_KEY || process.env.SIGNOZ_API_KEY) ? {
        "signoz-access-token": process.env.SIGNOZ_INGESTION_KEY || process.env.SIGNOZ_API_KEY
      } : {},
    });

    const sdk = new NodeSDK({
      resource: new Resource({
        [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME || 'agentops-sentinel',
      }),
      traceExporter,
    });

    sdk.start();
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      sdk.shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.log('Error terminating tracing', error))
        .finally(() => process.exit(0));
    });
  }
}
