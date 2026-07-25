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
  toneFromStatus,
} from "@agentops/ui";
import type { ApiResponse, TraceSummary } from "@agentops/shared";

function formatTime(iso: string) {
  return new Date(iso).toISOString().slice(11, 19) + " UTC";
}

function formatDuration(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

export default function TracesPage() {
  const [traces, setTraces] = useState<TraceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTraces() {
      try {
        const response = await fetch("/api/traces", { cache: "no-store" });
        const payload = (await response.json()) as ApiResponse<TraceSummary[]>;
        setTraces(payload.data ?? []);
      } catch (error) {
        console.error("Failed to fetch traces", error);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchTraces();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 space-y-6 px-6 py-6">
          <Card className="flex flex-col">
            <CardHeader className="flex-none">
              <CardTitle>All Traces</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Trace ID</TableHeaderCell>
                    <TableHeaderCell>Agent</TableHeaderCell>
                    <TableHeaderCell>Time</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Duration</TableHeaderCell>
                    <TableHeaderCell>Spans</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-ink-500">
                        Loading traces...
                      </TableCell>
                    </TableRow>
                  ) : traces.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-ink-500">
                        No traces found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    traces.map((trace) => (
                      <TableRow key={trace.traceId}>
                        <TableCell className="font-data text-xs text-ink-300">
                          {trace.traceId.slice(0, 8)}
                        </TableCell>
                        <TableCell>{trace.agentName}</TableCell>
                        <TableCell className="text-ink-500">{formatTime(trace.startTime)}</TableCell>
                        <TableCell>
                          <Badge tone={toneFromStatus(trace.status)}>{trace.status}</Badge>
                        </TableCell>
                        <TableCell>{formatDuration(trace.durationMs)}</TableCell>
                        <TableCell>{trace.spanCount}</TableCell>
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
