"""
Diagnosis endpoints — kicks off the diagnosis agent for a given trace.

Phase 0: route shape only. The actual agent (services/diagnosis_agent.py)
and its MCP bridge (services/mcp_bridge.py) are implemented in a later
phase; this returns 501 so the frontend can integrate against a stable
contract now.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/diagnostics", tags=["diagnostics"])


class DiagnosisRequest(BaseModel):
    trace_id: str


@router.post("")
def request_diagnosis(payload: DiagnosisRequest) -> dict[str, str]:
    raise HTTPException(status_code=501, detail="diagnosis agent not yet implemented")
