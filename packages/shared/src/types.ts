/**
 * Shared domain types for AgentOps Sentinel.
 *
 * These describe the core objects that flow between SigNoz (telemetry
 * source), the FastAPI backend (ingestion + diagnosis), and the Next.js
 * dashboard (presentation). Keep this file framework-free so it can be
 * imported from both server and client components.
 */

export type Severity = "info" | "warning" | "critical";

export type AlertStatus = "open" | "acknowledged" | "resolved";

export type SpanKind = "llm" | "tool" | "retrieval" | "agent" | "internal";

export type SpanStatus = "ok" | "error" | "timeout";

/** A single span within an agent execution trace. */
export interface Span {
  spanId: string;
  traceId: string;
  parentSpanId: string | null;
  name: string;
  kind: SpanKind;
  status: SpanStatus;
  startTime: string; // ISO-8601
  durationMs: number;
  attributes: Record<string, string | number | boolean>;
  errorMessage?: string;
}

/** A full agent run, made up of one or more spans. */
export interface Trace {
  traceId: string;
  agentName: string;
  environment: string;
  startTime: string; // ISO-8601
  durationMs: number;
  status: SpanStatus;
  spanCount: number;
  tokenCount?: number;
  costUsd?: number;
  spans: Span[];
}

/** A condensed row shown in trace tables / lists. */
export interface TraceSummary {
  traceId: string;
  agentName: string;
  environment: string;
  startTime: string;
  durationMs: number;
  status: SpanStatus;
  spanCount: number;
}

/** An alert raised from a rule evaluation or an inbound SigNoz webhook. */
export interface Alert {
  alertId: string;
  title: string;
  severity: Severity;
  status: AlertStatus;
  agentName: string;
  ruleName: string;
  traceId: string | null;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
  summary: string;
}

/** A time-series point used to drive sparkline / trend charts. */
export interface MetricPoint {
  timestamp: string; // ISO-8601
  value: number;
}

export interface MetricSeries {
  metric: string;
  unit: string;
  points: MetricPoint[];
}

/** Result produced by the diagnosis agent after inspecting a trace. */
export interface Diagnosis {
  diagnosisId: string;
  traceId: string;
  alertId: string | null;
  createdAt: string; // ISO-8601
  rootCause: string;
  confidence: number; // 0..1
  suggestedFix: string;
  relatedSpanIds: string[];
}

/** Raw webhook payload shape sent by SigNoz alerting. */
export interface SignozWebhookPayload {
  ruleId: string;
  ruleName: string;
  severity: Severity;
  status: "firing" | "resolved";
  labels: Record<string, string>;
  annotations: Record<string, string>;
  startsAt: string;
  endsAt?: string;
}

/** Standard envelope returned by every internal API route. */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

/** Summary counters shown on the dashboard KPI cards. */
export interface DashboardOverview {
  activeAgents: number;
  tracesLast24h: number;
  openAlerts: number;
  criticalAlerts: number;
  avgLatencyMs: number;
  errorRatePct: number;
}
