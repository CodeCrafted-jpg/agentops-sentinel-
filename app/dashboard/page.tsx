import {
  Badge,
  BarMeter,
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
import { Sidebar } from "./_components/Sidebar";
import { Topbar } from "./_components/Topbar";
import {
  latencyTrend,
  overview,
  recentAlerts,
  recentTraces,
  spanKindBreakdown,
} from "./mock-data";

function formatDuration(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

function formatTime(iso: string) {
  return new Date(iso).toISOString().slice(11, 19) + " UTC";
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 space-y-6 px-6 py-6">
          {/* KPI row */}
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
                <span className="font-data text-xs text-ink-500">
                  {overview.avgLatencyMs}ms current
                </span>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-6">
                <Sparkline points={latencyTrend} width={480} height={90} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spans by kind</CardTitle>
              </CardHeader>
              <CardContent>
                <BarMeter items={spanKindBreakdown} />
              </CardContent>
            </Card>
          </section>

          {/* Alerts */}
          <section>
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
                    {recentAlerts.map((alert) => (
                      <TableRow key={alert.alertId}>
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
                        <TableCell className="font-data text-xs text-ink-500">
                          {formatTime(alert.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          {/* Traces */}
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
                    {recentTraces.map((trace) => (
                      <TableRow key={trace.traceId}>
                        <TableCell className="font-data text-xs text-ink-300">{trace.traceId}</TableCell>
                        <TableCell>{trace.agentName}</TableCell>
                        <TableCell className="text-ink-500">{trace.environment}</TableCell>
                        <TableCell className="font-data text-xs">{trace.spanCount}</TableCell>
                        <TableCell className="font-data text-xs">{formatDuration(trace.durationMs)}</TableCell>
                        <TableCell>
                          <Badge tone={toneFromStatus(trace.status)}>{trace.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
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
