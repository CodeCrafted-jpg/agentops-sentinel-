import { z } from "zod";

/**
 * Runtime validators mirroring `types.ts`. Use these at every trust
 * boundary — API route handlers, webhook receivers, and MCP tool
 * responses — so malformed telemetry fails fast instead of silently
 * corrupting the dashboard.
 */

export const severitySchema = z.enum(["info", "warning", "critical"]);

export const alertStatusSchema = z.enum(["open", "acknowledged", "resolved"]);

export const spanKindSchema = z.enum([
  "llm",
  "tool",
  "retrieval",
  "agent",
  "internal",
]);

export const spanStatusSchema = z.enum(["ok", "error", "timeout"]);

export const spanSchema = z.object({
  spanId: z.string(),
  traceId: z.string(),
  parentSpanId: z.string().nullable(),
  name: z.string(),
  kind: spanKindSchema,
  status: spanStatusSchema,
  startTime: z.string(),
  durationMs: z.number().nonnegative(),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  errorMessage: z.string().optional(),
});

export const traceSchema = z.object({
  traceId: z.string(),
  agentName: z.string(),
  environment: z.string(),
  startTime: z.string(),
  durationMs: z.number().nonnegative(),
  status: spanStatusSchema,
  spanCount: z.number().int().nonnegative(),
  tokenCount: z.number().int().nonnegative().optional(),
  costUsd: z.number().nonnegative().optional(),
  spans: z.array(spanSchema),
});

export const traceSummarySchema = z.object({
  traceId: z.string(),
  agentName: z.string(),
  environment: z.string(),
  startTime: z.string(),
  durationMs: z.number().nonnegative(),
  status: spanStatusSchema,
  spanCount: z.number().int().nonnegative(),
});

export const alertSchema = z.object({
  alertId: z.string(),
  title: z.string(),
  severity: severitySchema,
  status: alertStatusSchema,
  agentName: z.string(),
  ruleName: z.string(),
  traceId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  summary: z.string(),
});

export const metricPointSchema = z.object({
  timestamp: z.string(),
  value: z.number(),
});

export const metricSeriesSchema = z.object({
  metric: z.string(),
  unit: z.string(),
  points: z.array(metricPointSchema),
});

export const diagnosisSchema = z.object({
  diagnosisId: z.string(),
  traceId: z.string(),
  alertId: z.string().nullable(),
  createdAt: z.string(),
  rootCause: z.string(),
  confidence: z.number().min(0).max(1),
  suggestedFix: z.string(),
  relatedSpanIds: z.array(z.string()),
});

export const signozWebhookPayloadSchema = z.object({
  ruleId: z.string(),
  ruleName: z.string(),
  severity: severitySchema,
  status: z.enum(["firing", "resolved"]),
  labels: z.record(z.string(), z.string()),
  annotations: z.record(z.string(), z.string()),
  startsAt: z.string(),
  endsAt: z.string().optional(),
});

export const dashboardOverviewSchema = z.object({
  activeAgents: z.number().int().nonnegative(),
  tracesLast24h: z.number().int().nonnegative(),
  openAlerts: z.number().int().nonnegative(),
  criticalAlerts: z.number().int().nonnegative(),
  avgLatencyMs: z.number().nonnegative(),
  errorRatePct: z.number().min(0).max(100),
});
