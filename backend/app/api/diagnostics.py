"""
Diagnosis endpoints — kicks off the diagnosis agent for a given trace.

Phase 0: route shape only. The actual agent (services/diagnosis_agent.py)
and its MCP bridge (services/mcp_bridge.py) are implemented in a later
phase; this returns 501 so the frontend can integrate against a stable
contract now.
"""

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from models.schemas import Diagnosis, Trace
from services.supabase_client import supabase_client
from services.signoz_client import SignozClient
from services.diagnosis_agent import DiagnosisAgent

router = APIRouter(prefix="/diagnostics", tags=["diagnostics"])

class DiagnosisRequest(BaseModel):
    trace_id: str
    alert_id: Optional[str] = None

def map_row_to_diagnosis(row: dict) -> Diagnosis:
    return Diagnosis(
        diagnosisId=row.get("diagnosis_id"),
        traceId=row.get("trace_id"),
        alertId=row.get("alert_id"),
        createdAt=row.get("created_at"),
        rootCause=row.get("root_cause"),
        confidence=float(row.get("confidence", 0)),
        suggestedFix=row.get("suggested_fix"),
        relatedSpanIds=row.get("related_span_ids") or [],
        impact=row.get("impact", "Unknown impact"),
        nextSteps=row.get("next_steps") or []
    )

@router.post("", response_model=Diagnosis)
def request_diagnosis(payload: DiagnosisRequest) -> Diagnosis:
    # 1. Check if we already have it persisted in Supabase
    if supabase_client:
        try:
            response = supabase_client.table("diagnoses").select("*").eq("trace_id", payload.trace_id).execute()
            rows = response.data or []
            if rows:
                return map_row_to_diagnosis(rows[0])
        except Exception as e:
            print("Failed to fetch existing diagnosis from Supabase:", e)

    # 2. Get trace context from SigNoz
    signoz_url = os.environ.get("SIGNOZ_API_URL") or "http://localhost:3301"
    signoz_client = SignozClient(base_url=signoz_url)
    trace_data = signoz_client.get_trace(payload.trace_id)
    if not trace_data:
        raise HTTPException(status_code=404, detail=f"Trace {payload.trace_id} not found in SigNoz")

    try:
        trace = Trace(**trace_data)
    except Exception as e:
        print("Trace data validation failed:", e)
        raise HTTPException(status_code=422, detail=f"Failed to parse trace data: {e}")

    # 3. Generate diagnosis
    agent = DiagnosisAgent()
    diagnosis = agent.diagnose(trace, alert_id=payload.alert_id)

    # 4. Save to Supabase
    if supabase_client:
        try:
            supabase_client.table("diagnoses").insert({
                "diagnosis_id": diagnosis.diagnosis_id,
                "trace_id": diagnosis.trace_id,
                "alert_id": diagnosis.alert_id,
                "root_cause": diagnosis.root_cause,
                "confidence": diagnosis.confidence,
                "suggested_fix": diagnosis.suggested_fix,
                "related_span_ids": diagnosis.related_span_ids,
                "impact": diagnosis.impact,
                "next_steps": diagnosis.next_steps,
                "created_at": diagnosis.created_at
            }).execute()
        except Exception as e:
            print("Failed to save new diagnosis to Supabase:", e)

    return diagnosis

