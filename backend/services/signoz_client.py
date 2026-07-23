"""
Thin client for querying SigNoz's HTTP API (traces, metrics).

Phase 1: Added real request structure with fallback to local sample data.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
import httpx


@dataclass
class SignozClient:
    base_url: str
    api_key: str | None = None

    def get_recent_traces(self, agent_name: str | None = None, limit: int = 50) -> list[dict]:
        """Fetch recent traces from SigNoz, optionally filtered by agent name."""
        try:
            headers = {}
            if self.api_key:
                headers["signoz-api-key"] = self.api_key
            
            response = httpx.get(
                f"{self.base_url}/api/v1/traces",
                params={"limit": limit, "service": agent_name} if agent_name else {"limit": limit},
                headers=headers,
                timeout=2.0
            )
            response.raise_for_status()
            data = response.json()
            if isinstance(data, list):
                return data
            elif isinstance(data, dict) and "traces" in data:
                return data["traces"]
        except Exception:
            pass

        return self._load_fallback_traces(agent_name, limit)

    def get_trace(self, trace_id: str) -> dict | None:
        """Fetch a single trace with all of its spans."""
        try:
            headers = {}
            if self.api_key:
                headers["signoz-api-key"] = self.api_key
            response = httpx.get(
                f"{self.base_url}/api/v1/traces/{trace_id}",
                headers=headers,
                timeout=2.0
            )
            response.raise_for_status()
            return response.json()
        except Exception:
            pass

        traces = self._load_fallback_traces()
        return next((t for t in traces if t.get("traceId") == trace_id), None)

    def _load_fallback_traces(self, agent_name: str | None = None, limit: int = 50) -> list[dict]:
        data_path = Path(__file__).resolve().parent.parent / "data" / "sample_runs.json"
        if not data_path.exists():
            return []
        try:
            payload = json.loads(data_path.read_text(encoding="utf-8"))
            traces = payload.get("traces", [])
            if agent_name:
                traces = [t for t in traces if t.get("agentName") == agent_name]
            return traces[:limit]
        except Exception:
            return []
