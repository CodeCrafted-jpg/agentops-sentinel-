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
import type { ApiResponse, Diagnosis } from "@agentops/shared";

function formatTime(iso: string) {
  return new Date(iso).toISOString().slice(11, 19) + " UTC";
}

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<Diagnosis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDiagnostics() {
      try {
        const response = await fetch("/api/diagnostics", { cache: "no-store" });
        const payload = (await response.json()) as ApiResponse<Diagnosis[]>;
        setDiagnostics(payload.data ?? []);
      } catch (error) {
        console.error("Failed to fetch diagnostics", error);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchDiagnostics();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 space-y-6 px-6 py-6">
          <Card className="flex flex-col">
            <CardHeader className="flex-none">
              <CardTitle>AI Diagnoses History</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Diag ID</TableHeaderCell>
                    <TableHeaderCell>Trace ID</TableHeaderCell>
                    <TableHeaderCell>Root Cause</TableHeaderCell>
                    <TableHeaderCell>Confidence</TableHeaderCell>
                    <TableHeaderCell>Time</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-ink-500">
                        Loading diagnoses...
                      </TableCell>
                    </TableRow>
                  ) : diagnostics.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-ink-500">
                        No diagnoses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    diagnostics.map((diag) => (
                      <TableRow key={diag.diagnosisId}>
                        <TableCell className="font-data text-xs text-ink-300">
                          {diag.diagnosisId.slice(0, 8)}
                        </TableCell>
                        <TableCell className="font-data text-xs text-ink-300">
                          {diag.traceId.slice(0, 8)}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {diag.rootCause}
                        </TableCell>
                        <TableCell>
                          <Badge tone={diag.confidence > 0.8 ? "signal" : diag.confidence > 0.5 ? "alert" : "critical"}>
                            {Math.round(diag.confidence * 100)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-ink-500">{formatTime(diag.createdAt)}</TableCell>
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
