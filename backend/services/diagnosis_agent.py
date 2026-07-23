"""
The diagnosis agent: given a failing trace, walks its spans (optionally
pulling more context over MCP via mcp_bridge.py) and produces a Diagnosis
with a root cause and suggested fix.

Phase 0: interface skeleton only.
"""

from __future__ import annotations

from models.schemas import Diagnosis, Trace


class DiagnosisAgent:
    def diagnose(self, trace: Trace) -> Diagnosis:
        """Produce a root-cause diagnosis for a failing trace.

        Not implemented in Phase 0 — later phases will wire this to an
        LLM call plus MCP tool access via mcp_bridge.py.
        """
        raise NotImplementedError("DiagnosisAgent.diagnose: implemented in a later phase")
