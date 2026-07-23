"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  BarMeter,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Sparkline,
  StatCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  toneFromStatus,
} from "@agentops/ui";
import type { Alert, ApiResponse, DashboardOverview, Diagnosis, TraceSummary } from "@agentops/shared";
import { Sidebar } from "./_components/Sidebar";
import { Topbar } from "./_components/Topbar";

function formatDuration(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

function formatTime(iso: string) {
  return new Date(iso).toISOString().slice(11, 19) + " UTC";
}

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [traces, setTraces] = useState<TraceSummary[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);

    try {
      const [alertsResponse, tracesResponse] = await Promise.all([
        fetch("/api/alerts", { cache: "no-store" }),
        fetch("/api/traces", { cache: "no-store" }),
      ]);

      const alertsPayload = (await alertsResponse.json()) as ApiResponse<Alert[]>;
      const tracesPayload = (await tracesResponse.json()) as ApiResponse<TraceSummary[]>;

      setAlerts(alertsPayload.data ?? []);
      setTraces(tracesPayload.data ?? []);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error("Failed to refresh dashboard data", error);
      setAlerts([]);
      setTraces([]);
      setDiagnosisError("Unable to refresh dashboard data right now.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchDashboardData();

    const intervalId = window.setInterval(() => {
      void fetchDashboardData();
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (alerts.length && !selectedAlertId) {
      setSelectedAlertId(alerts[0].alertId);
    }

    if (traces.length && !selectedTraceId) {
      setSelectedTraceId(traces[0].traceId);
    }
  }, [alerts, traces, selectedAlertId, selectedTraceId]);

  const selectedAlert = useMemo(
    () => alerts.find((alert) => alert.alertId === selectedAlertId) ?? null,
    [alerts, selectedAlertId]
  );

  const selectedTrace = useMemo(
    () => traces.find((trace) => trace.traceId === selectedTraceId) ?? null,
    [traces, selectedTraceId]
  );

  const loadDiagnosis = async (alertId: string | null, traceId: string | null) => {
    if (!traceId) {
      setDiagnosis(null);
      setDiagnosisError(null);
      return;
    }

    setDiagnosisLoading(true);
    setDiagnosisError(null);

    try {
      const response = await fetch("/api/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ traceId, alertId }),
      });
      const payload = (await response.json()) as ApiResponse<Diagnosis>;

      if (payload.error || !payload.data) {
        throw new Error(payload.error ?? "No diagnosis returned.");
      }

      setDiagnosis(payload.data);
    } catch (error) {
      setDiagnosis(null);
      setDiagnosisError(error instanceof Error ? error.message : "Unable to create a diagnosis.");
    } finally {
      setDiagnosisLoading(false);
    }
  };

  useEffect(() => {
    const traceId = selectedAlert?.traceId ?? selectedTrace?.traceId ?? null;
    if (!traceId) {
      setDiagnosis(null);
      setDiagnosisError(null);
      return;
    }

    void loadDiagnosis(selectedAlert?.alertId ?? null, traceId);
  }, [selectedAlert?.alertId, selectedAlert?.traceId, selectedTrace?.traceId]);

  const overview: DashboardOverview = useMemo(() => {
    const openAlerts = alerts.filter((alert) => alert.status === "open").length;
    const criticalAlerts = alerts.filter((alert) => alert.severity === "critical").length;
    const errorTraces = traces.filter((trace) => trace.status === "error").length;
    const avgLatencyMs = traces.length
      ? Math.round(traces.reduce((sum, trace) => sum + trace.durationMs, 0) / traces.length)
      : 0;

    return {
      activeAgents: new Set(traces.map((trace) => trace.agentName)).size,
      tracesLast24h: traces.length,
      openAlerts,
      criticalAlerts,
      avgLatencyMs,
      errorRatePct: traces.length ? Number(((errorTraces / traces.length) * 100).toFixed(1)) : 0,
    };
  }, [alerts, traces]);

  const latencyTrend = useMemo(() => traces.slice(0, 9).map((trace) => trace.durationMs), [traces]);
  const breakdown = useMemo(
    () => [
      { label: "Open alerts", value: overview.openAlerts, tone: "alert" as const },
      { label: "Critical alerts", value: overview.criticalAlerts, tone: "critical" as const },
      { label: "Error traces", value: traces.filter((trace) => trace.status === "error").length, tone: "critical" as const },
      { label: "Healthy traces", value: traces.filter((trace) => trace.status === "ok").length, tone: "signal" as const },
    ],
    [overview.openAlerts, overview.criticalAlerts, traces]
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 space-y-6 px-6 py-6">
          <section className="flex flex-wrap items-center justify-between gap-3 rounded border border-base-600 bg-base-900/70 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-ink-100">Live dashboard</p>
              <p className="text-xs text-ink-500">
                {isRefreshing ? "Refreshing data…" : `Updated ${lastUpdated ? formatTime(lastUpdated) : "just now"}`}
              </p>
            </div>
            <Button variant="secondary" onClick={() => void fetchDashboardData()}>
              Refresh now
            </Button>
          </section>

          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Active agents" value={overview.activeAgents} hint="reporting in last 5m" />
            <StatCard label="Traces / 24h" value={overview.tracesLast24h.toLocaleString()} delta="+8.2%" deltaTone="signal" />
            <StatCard
              label="Open alerts"
              value={overview.openAlerts}
              delta={`${overview.criticalAlerts} critical`}
              deltaTone={overview.criticalAlerts > 0 ? "critical" : "signal"}
            />
            <StatCard
              label="Error rate"
              value={`${overview.errorRatePct}%`}
              delta={overview.errorRatePct > 2 ? "above target" : "nominal"}
              deltaTone={overview.errorRatePct > 2 ? "alert" : "signal"}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Avg latency, last 9 windows</CardTitle>
                <span className="font-data text-xs text-ink-500">{overview.avgLatencyMs}ms current</span>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-6">
                <Sparkline points={latencyTrend.length ? latencyTrend : [0, 0, 0, 0, 0, 0, 0, 0, 0]} width={480} height={90} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Signal mix</CardTitle>
              </CardHeader>
              <CardContent>
                <BarMeter items={breakdown} />
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Recent alerts</CardTitle>
                <Badge tone="critical">{overview.criticalAlerts} critical</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Severity</TableHeaderCell>
                      <TableHeaderCell>Alert</TableHeaderCell>
                      <TableHeaderCell>Agent</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Raised</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alerts.map((alert) => {
                      const isSelected = alert.alertId === selectedAlert?.alertId;
                      return (
                        <TableRow
                          key={alert.alertId}
                          className={isSelected ? "bg-signal/10" : "cursor-pointer hover:bg-base-800/60"}
                          onClick={() => {
                            setSelectedAlertId(alert.alertId);
                            setSelectedTraceId(alert.traceId ?? null);
                          }}
                        >
                          <TableCell>
                            <Badge tone={toneFromStatus(alert.severity)}>{alert.severity}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{alert.title}</div>
                            <div className="text-xs text-ink-500">{alert.summary}</div>
                          </TableCell>
                          <TableCell className="font-data text-xs">{alert.agentName}</TableCell>
                          <TableCell>
                            <Badge tone={toneFromStatus(alert.status)}>{alert.status}</Badge>
                          </TableCell>
                          <TableCell className="font-data text-xs text-ink-500">{formatTime(alert.createdAt)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Run & diagnosis</CardTitle>
                <Badge tone="signal">{selectedTrace?.traceId ?? "Awaiting run"}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedAlert ? (
                  <div className="rounded border border-base-600 bg-base-900/80 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-500">Selected alert</p>
                    <p className="mt-1 font-medium text-ink-100">{selectedAlert.title}</p>
                    <p className="mt-1 text-sm text-ink-400">{selectedAlert.summary}</p>
                  </div>
                ) : (
                  <div className="rounded border border-base-600 bg-base-900/80 p-3 text-sm text-ink-400">
                    Select an alert to inspect the related run.
                  </div>
                )}

                {selectedTrace ? (
                  <div className="rounded border border-base-600 bg-base-900/80 p-3">
                    <p className="text-xs uppercase tracking-wide text-ink-500">Trace context</p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-ink-300">{selectedTrace.agentName}</span>
                      <Badge tone={toneFromStatus(selectedTrace.status)}>{selectedTrace.status}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-ink-500">
                      Duration {formatDuration(selectedTrace.durationMs)} · {selectedTrace.spanCount} spans
                    </p>
                  </div>
                ) : null}

                {diagnosisLoading ? (
                  <div className="rounded border border-base-600 bg-base-900/80 p-3 text-sm text-ink-400">
                    Generating diagnosis…
                  </div>
                ) : diagnosis ? (
                  <div className="space-y-3 rounded border border-signal/30 bg-signal/10 p-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-signal">Diagnosis</p>
                      <p className="mt-1 text-sm font-medium text-ink-100">{diagnosis.rootCause}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-ink-500">Suggested remediation</p>
                      <p className="mt-1 text-sm text-ink-300">{diagnosis.suggestedFix}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-ink-500">
                      <span>Confidence {Math.round(diagnosis.confidence * 100)}%</span>
                      <span>{diagnosis.relatedSpanIds.length} related spans</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded border border-base-600 bg-base-900/80 p-3 text-sm text-ink-400">
                    {diagnosisError ?? "Select a trace or alert to generate a diagnosis and remediation guide."}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader>
                <CardTitle>Recent traces</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Trace</TableHeaderCell>
                      <TableHeaderCell>Agent</TableHeaderCell>
                      <TableHeaderCell>Env</TableHeaderCell>
                      <TableHeaderCell>Spans</TableHeaderCell>
                      <TableHeaderCell>Duration</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {traces.map((trace) => {
                      const isSelected = trace.traceId === selectedTrace?.traceId;
                      return (
                        <TableRow
                          key={trace.traceId}
                          className={isSelected ? "bg-signal/10" : "cursor-pointer hover:bg-base-800/60"}
                          onClick={() => {
                            setSelectedTraceId(trace.traceId);
                          }}
                        >
                          <TableCell className="font-data text-xs text-ink-300">{trace.traceId}</TableCell>
                          <TableCell>{trace.agentName}</TableCell>
                          <TableCell className="text-ink-500">{trace.environment}</TableCell>
                          <TableCell className="font-data text-xs">{trace.spanCount}</TableCell>
                          <TableCell className="font-data text-xs">{formatDuration(trace.durationMs)}</TableCell>
                          <TableCell>
                            <Badge tone={toneFromStatus(trace.status)}>{trace.status}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
