"""
The diagnosis agent: given a failing trace, walks its spans (optionally
pulling more context over MCP via mcp_bridge.py) and produces a Diagnosis
with a root cause and suggested fix.

Phase 0: interface skeleton only.
"""

import uuid
from datetime import datetime
from typing import Optional
from models.schemas import Diagnosis, Trace

class DiagnosisAgent:
    def diagnose(self, trace: Trace, alert_id: Optional[str] = None) -> Diagnosis:
        root_cause = "No anomalies detected in the trace spans. The workflow appears to have executed successfully."
        suggested_fix = "No fix required. Inspect client logic if incorrect results were returned."
        confidence = 1.0
        impact = "The workflow completed without visible anomalies."
        next_steps = ["Monitor the run for regressions."]
        related_span_ids = []

        error_spans = [s for s in trace.spans if s.status == "error" or s.status == "timeout"]
        if error_spans:
            primary = error_spans[0]
            related_span_ids.append(primary.span_id)
            if primary.status == "timeout":
                root_cause = f"The execution step '{primary.name}' timed out after {primary.duration_ms}ms."
                suggested_fix = f"Verify the performance/latency of downstream dependency or increase the timeout value configuration (currently set to limit at {primary.duration_ms}ms)."
                confidence = 0.85
                impact = "The run likely stalled in the failing step, delaying the user-facing response."
                next_steps = [
                    "Inspect upstream dependency latency and retry behavior.",
                    "Increase or tune the timeout budget for the affected step.",
                    "Add a fallback path so the workflow can recover gracefully."
                ]
            else:
                root_cause = f"The execution step '{primary.name}' threw an error: {primary.error_message or 'Unknown execution failure'}."
                suggested_fix = f"Check input formats, authentication secrets, or validate tool logs for '{primary.name}'."
                confidence = 0.90
                impact = "The workflow likely produced incomplete or incorrect results after the failing step."
                next_steps = [
                    "Validate the input payload and tool configuration.",
                    "Inspect logs and authentication secrets for the failing step.",
                    "Retry the run after the upstream issue clears."
                ]

        return Diagnosis(
            diagnosisId=f"diag_{uuid.uuid4().hex[:8]}",
            traceId=trace.trace_id,
            alertId=alert_id,
            createdAt=datetime.utcnow().isoformat() + "Z",
            rootCause=root_cause,
            confidence=confidence,
            suggestedFix=suggested_fix,
            relatedSpanIds=related_span_ids,
            impact=impact,
            nextSteps=next_steps
        )

