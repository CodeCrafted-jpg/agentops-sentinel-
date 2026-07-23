import type { Alert, DashboardOverview, TraceSummary } from "@agentops/shared";

/**
 * Placeholder data so the dashboard shell renders end-to-end in Phase 0.
 * Replace with a fetch to `/api/alerts` and `/api/traces` once the backend
 * ingestion pipeline (Phase 1) is wired up.
 */

export const overview: DashboardOverview = {
  activeAgents: 6,
  tracesLast24h: 1284,
  openAlerts: 3,
  criticalAlerts: 1,
  avgLatencyMs: 842,
  errorRatePct: 2.4,
};

export const recentAlerts: Alert[] = [
  {
    alertId: "alt_01",
    title: "Retrieval span timeout rate above threshold",
    severity: "critical",
    status: "open",
    agentName: "checkout-agent",
    ruleName: "span.timeout.rate",
    traceId: "trc_4821",
    createdAt: "2026-07-23T09:12:00Z",
    updatedAt: "2026-07-23T09:12:00Z",
    summary: "12% of retrieval spans exceeded 3s over the last 15 minutes.",
  },
  {
    alertId: "alt_02",
    title: "Token cost per run trending up",
    severity: "warning",
    status: "open",
    agentName: "summarizer-agent",
    ruleName: "cost.per_run.delta",
    traceId: "trc_4790",
    createdAt: "2026-07-23T08:41:00Z",
    updatedAt: "2026-07-23T08:41:00Z",
    summary: "Average cost per run up 34% versus yesterday's baseline.",
  },
  {
    alertId: "alt_03",
    title: "Tool call error rate elevated",
    severity: "warning",
    status: "acknowledged",
    agentName: "support-triage-agent",
    ruleName: "tool.error_rate",
    traceId: "trc_4712",
    createdAt: "2026-07-23T07:58:00Z",
    updatedAt: "2026-07-23T08:05:00Z",
    summary: "CRM lookup tool failing intermittently on malformed IDs.",
  },
];

export const recentTraces: TraceSummary[] = [
  {
    traceId: "trc_4821",
    agentName: "checkout-agent",
    environment: "production",
    startTime: "2026-07-23T09:11:40Z",
    durationMs: 6420,
    status: "error",
    spanCount: 14,
  },
  {
    traceId: "trc_4820",
    agentName: "checkout-agent",
    environment: "production",
    startTime: "2026-07-23T09:10:02Z",
    durationMs: 1180,
    status: "ok",
    spanCount: 9,
  },
  {
    traceId: "trc_4790",
    agentName: "summarizer-agent",
    environment: "production",
    startTime: "2026-07-23T08:40:55Z",
    durationMs: 2310,
    status: "ok",
    spanCount: 6,
  },
  {
    traceId: "trc_4712",
    agentName: "support-triage-agent",
    environment: "staging",
    startTime: "2026-07-23T07:57:20Z",
    durationMs: 940,
    status: "error",
    spanCount: 5,
  },
];

export const latencyTrend = [640, 700, 690, 820, 910, 860, 940, 890, 842];

export const spanKindBreakdown = [
  { label: "llm", value: 512, tone: "signal" as const },
  { label: "tool", value: 341, tone: "signal" as const },
  { label: "retrieval", value: 208, tone: "alert" as const },
  { label: "agent", value: 118, tone: "signal" as const },
];
