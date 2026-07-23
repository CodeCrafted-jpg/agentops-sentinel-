import { trace, Span as OTelSpan, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("agentops-sentinel-tracer");

/**
 * Wraps a multi-step agent run execution inside a root span.
 */
export function traceAgentRun<T>(
  agentName: string,
  environment: string,
  fn: (span: OTelSpan) => Promise<T> | T
): Promise<T> {
  return tracer.startActiveSpan(
    `agent-run:${agentName}`,
    {
      attributes: {
        "agentops.agent_name": agentName,
        "agentops.environment": environment,
        "agentops.kind": "agent",
      },
    },
    async (span) => {
      try {
        const result = await fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (err: any) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: err.message || String(err),
        });
        span.recordException(err);
        throw err;
      } finally {
        span.end();
      }
    }
  );
}

/**
 * Wraps an individual step (LLM, tool, retrieval) inside a child span.
 */
export function traceStep<T>(
  name: string,
  kind: "llm" | "tool" | "retrieval" | "internal",
  fn: (span: OTelSpan) => Promise<T> | T
): Promise<T> {
  return tracer.startActiveSpan(
    `${kind}:${name}`,
    {
      attributes: {
        "agentops.step_name": name,
        "agentops.kind": kind,
      },
    },
    async (span) => {
      try {
        const result = await fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (err: any) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: err.message || String(err),
        });
        span.recordException(err);
        throw err;
      } finally {
        span.end();
      }
    }
  );
}

/**
 * Helper to record token usage and cost on LLM spans.
 */
export function recordLLMUsage(
  span: OTelSpan,
  modelName: string,
  promptTokens: number,
  completionTokens: number,
  costUsd?: number
) {
  span.setAttributes({
    "agentops.llm.model": modelName,
    "agentops.llm.prompt_tokens": promptTokens,
    "agentops.llm.completion_tokens": completionTokens,
    "agentops.llm.total_tokens": promptTokens + completionTokens,
  });
  if (costUsd !== undefined) {
    span.setAttribute("agentops.llm.cost_usd", costUsd);
  }
}

/**
 * Helper to record query metadata on retrieval spans.
 */
export function recordRetrievalUsage(
  span: OTelSpan,
  query: string,
  resultCount: number,
  indexName?: string
) {
  span.setAttributes({
    "agentops.retrieval.query": query,
    "agentops.retrieval.result_count": resultCount,
  });
  if (indexName) {
    span.setAttribute("agentops.retrieval.index_name", indexName);
  }
}

/**
 * Helper to record inputs/outputs on tool spans.
 */
export function recordToolUsage(
  span: OTelSpan,
  toolName: string,
  input: string,
  output?: string
) {
  span.setAttributes({
    "agentops.tool.name": toolName,
    "agentops.tool.input": input,
  });
  if (output) {
    span.setAttribute("agentops.tool.output", output);
  }
}
