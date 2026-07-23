"""
Thin client for querying SigNoz's HTTP API (traces, metrics).

Phase 0: interface skeleton only, no live requests. Fill in `base_url`
handling and the actual query builders in Phase 1 alongside
services/telemetry_ingest.py.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class SignozClient:
    base_url: str
    api_key: str | None = None

    def get_recent_traces(self, agent_name: str | None = None, limit: int = 50) -> list[dict]:
        """Fetch recent traces from SigNoz, optionally filtered by agent name.

        Not implemented in Phase 0 — returns an empty list so callers can
        be written against the final signature ahead of the real query.
        """
        raise NotImplementedError("SignozClient.get_recent_traces: implemented in Phase 1")

    def get_trace(self, trace_id: str) -> dict | None:
        """Fetch a single trace with all of its spans."""
        raise NotImplementedError("SignozClient.get_trace: implemented in Phase 1")
