"""
Alert listing/management endpoints.

Phase 0: route shape only, backed by an empty in-memory list. Phase 1
replaces this with a real store populated by
backend/services/telemetry_ingest.py off the SigNoz webhook.
"""

from fastapi import APIRouter
from models.schemas import Alert
from services.supabase_client import supabase_client

router = APIRouter(prefix="/alerts", tags=["alerts"])

def map_row_to_alert(row: dict) -> Alert:
    return Alert(
        alertId=row.get("alert_id"),
        title=row.get("title"),
        severity=row.get("severity"),
        status=row.get("status"),
        agentName=row.get("agent_name", ""),
        ruleName=row.get("rule_name", ""),
        traceId=row.get("trace_id"),
        createdAt=row.get("created_at"),
        updatedAt=row.get("updated_at"),
        summary=row.get("summary", "")
    )

@router.get("", response_model=list[Alert])
def list_alerts() -> list[Alert]:
    if not supabase_client:
        return []
    try:
        response = supabase_client.table("alerts").select("*").order("created_at", desc=True).execute()
        rows = response.data or []
        return [map_row_to_alert(row) for row in rows]
    except Exception as e:
        print("Failed to query alerts from Supabase:", e)
        return []

@router.get("/{alert_id}", response_model=Alert | None)
def get_alert(alert_id: str) -> Alert | None:
    if not supabase_client:
        return None
    try:
        response = supabase_client.table("alerts").select("*").eq("alert_id", alert_id).execute()
        rows = response.data or []
        if not rows:
            return None
        return map_row_to_alert(rows[0])
    except Exception as e:
        print(f"Failed to query alert {alert_id} from Supabase:", e)
        return None

