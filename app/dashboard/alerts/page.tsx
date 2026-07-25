"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "../_components/Sidebar";
import { Topbar } from "../_components/Topbar";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@agentops/ui";
import type { ApiResponse, Alert } from "@agentops/shared";

function formatTime(iso: string) {
  return new Date(iso).toISOString().slice(11, 19) + " UTC";
}

function toneFromSeverity(severity: string) {
  if (severity === "critical") return "critical";
  if (severity === "warning") return "alert";
  return "signal";
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch("/api/alerts", { cache: "no-store" });
        const payload = (await response.json()) as ApiResponse<Alert[]>;
        setAlerts(payload.data ?? []);
      } catch (error) {
        console.error("Failed to fetch alerts", error);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchAlerts();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 space-y-6 px-6 py-6">
          <Card className="flex flex-col">
            <CardHeader className="flex-none">
              <CardTitle>All Alerts</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Alert ID</TableHeaderCell>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Severity</TableHeaderCell>
                    <TableHeaderCell>Agent</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Time</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-ink-500">
                        Loading alerts...
                      </TableCell>
                    </TableRow>
                  ) : alerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-ink-500">
                        No alerts found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    alerts.map((alert) => (
                      <TableRow key={alert.alertId}>
                        <TableCell className="font-data text-xs text-ink-300">
                          {alert.alertId}
                        </TableCell>
                        <TableCell className="font-medium text-ink-100">{alert.title}</TableCell>
                        <TableCell>
                          <Badge tone={toneFromSeverity(alert.severity)}>{alert.severity}</Badge>
                        </TableCell>
                        <TableCell>{alert.agentName}</TableCell>
                        <TableCell>
                          <span className={alert.status === "open" ? "text-red-400" : "text-ink-500"}>
                            {alert.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-ink-500">{formatTime(alert.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
