"""
The diagnosis agent: given a failing trace, walks its spans (optionally
pulling more context over MCP via mcp_bridge.py) and produces a Diagnosis
with a root cause and suggested fix.

Phase 0: interface skeleton only.
"""

import uuid
import os
import json
from datetime import datetime
from typing import Optional
from models.schemas import Diagnosis, Trace
import cohere

class DiagnosisAgent:
    def __init__(self):
        self.cohere_api_key = os.getenv("COHERE_API_KEY")
        self.cohere_model = os.getenv("COHERE_MODEL", "command-r-plus")
        if self.cohere_api_key:
            self.co = cohere.Client(self.cohere_api_key)
        else:
            self.co = None

    def diagnose(self, trace: Trace, alert_id: Optional[str] = None) -> Diagnosis:
        error_spans = [s for s in trace.spans if s.status == "error" or s.status == "timeout"]
        
        if not error_spans:
            return Diagnosis(
                diagnosisId=f"diag_{uuid.uuid4().hex[:8]}",
                traceId=trace.trace_id,
                alertId=alert_id,
                createdAt=datetime.utcnow().isoformat() + "Z",
                rootCause="No anomalies detected in the trace spans. The workflow appears to have executed successfully.",
                confidence=1.0,
                suggestedFix="No fix required. Inspect client logic if incorrect results were returned.",
                relatedSpanIds=[],
                impact="The workflow completed without visible anomalies.",
                nextSteps=["Monitor the run for regressions."]
            )

        primary = error_spans[0]
        related_span_ids = [primary.span_id]

        if self.co:
            try:
                prompt = f"""
Analyze the following trace and determine the root cause, suggested fix, impact, and next steps for the error.
The error occurred in a span named '{primary.name}' with status '{primary.status}'.
Error Message: {primary.error_message}
Duration: {primary.duration_ms}ms
Attributes: {json.dumps(primary.attributes)}

Output the result EXACTLY as a JSON object with the following schema, and no other text:
{{
  "root_cause": "string",
  "suggested_fix": "string",
  "impact": "string",
  "next_steps": ["string", "string", ...],
  "confidence": 0.95
}}
"""
                response = self.co.chat(
                    model=self.cohere_model,
                    message=prompt,
                    temperature=0.1
                )
                
                text = response.text.strip()
                if text.startswith("```json"):
                    text = text.split("```json")[1].split("```")[0].strip()
                elif text.startswith("```"):
                    text = text.split("```")[1].split("```")[0].strip()
                    
                result = json.loads(text)
                
                return Diagnosis(
                    diagnosisId=f"diag_{uuid.uuid4().hex[:8]}",
                    traceId=trace.trace_id,
                    alertId=alert_id,
                    createdAt=datetime.utcnow().isoformat() + "Z",
                    rootCause=result.get("root_cause", "Unknown root cause"),
                    confidence=float(result.get("confidence", 0.8)),
                    suggestedFix=result.get("suggested_fix", "Unknown fix"),
                    relatedSpanIds=related_span_ids,
                    impact=result.get("impact", "Unknown impact"),
                    nextSteps=result.get("next_steps", [])
                )
            except Exception as e:
                print(f"Cohere generation failed: {e}")
                # Fallback to deterministic logic below
        
        # Deterministic logic fallback
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

