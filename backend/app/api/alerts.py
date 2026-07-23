"""
Alert listing/management endpoints.

Phase 0: route shape only, backed by an empty in-memory list. Phase 1
replaces this with a real store populated by
backend/services/telemetry_ingest.py off the SigNoz webhook.
"""

from fastapi import APIRouter

from models.schemas import Alert

router = APIRouter(prefix="/alerts", tags=["alerts"])

_ALERTS: list[Alert] = []


@router.get("", response_model=list[Alert])
def list_alerts() -> list[Alert]:
    return _ALERTS


@router.get("/{alert_id}", response_model=Alert | None)
def get_alert(alert_id: str) -> Alert | None:
    return next((a for a in _ALERTS if a.alert_id == alert_id), None)
