import type { Trace } from "@agentops/shared";
import fs from "fs";
import path from "path";

export class SignozClient {
  private baseUrl: string;
  private apiKey: string | null;

  constructor(baseUrl: string, apiKey: string | null = null) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async getRecentTraces(agentName?: string, limit: number = 50): Promise<Trace[]> {
    try {
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers["signoz-api-key"] = this.apiKey;
      }
      const query = agentName ? `?service=${encodeURIComponent(agentName)}&limit=${limit}` : `?limit=${limit}`;
      const response = await fetch(`${this.baseUrl}/api/v1/traces${query}`, {
        headers,
        signal: AbortSignal.timeout(2000),
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.traces)) return data.traces;
      }
    } catch {
      // ignore, fallback
    }

    return this.loadFallbackTraces(agentName, limit);
  }

  async getTrace(traceId: string): Promise<Trace | null> {
    try {
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers["signoz-api-key"] = this.apiKey;
      }
      const response = await fetch(`${this.baseUrl}/api/v1/traces/${traceId}`, {
        headers,
        signal: AbortSignal.timeout(2000),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // ignore, fallback
    }

    const traces = await this.loadFallbackTraces();
    return traces.find((t) => t.traceId === traceId) || null;
  }

  private loadFallbackTraces(agentName?: string, limit: number = 50): Trace[] {
    // The fallback loader is intentionally kept minimal and returns an empty set.
    // Supabase-backed traces are the main source for production use.
    return [];
  }
}
