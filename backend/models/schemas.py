"""
Pydantic models mirroring packages/shared/src/types.ts.

Keep these two files in sync by hand for now. If drift becomes a problem,
a later phase can generate one from the other (e.g. datamodel-code-generator
from a shared JSON Schema).
"""

from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class Severity(str, Enum):
    info = "info"
    warning = "warning"
    critical = "critical"


class AlertStatus(str, Enum):
    open = "open"
    acknowledged = "acknowledged"
    resolved = "resolved"


class SpanKind(str, Enum):
    llm = "llm"
    tool = "tool"
    retrieval = "retrieval"
    agent = "agent"
    internal = "internal"


class SpanStatus(str, Enum):
    ok = "ok"
    error = "error"
    timeout = "timeout"


class Span(BaseModel):
    span_id: str = Field(alias="spanId")
    trace_id: str = Field(alias="traceId")
    parent_span_id: Optional[str] = Field(default=None, alias="parentSpanId")
    name: str
    kind: SpanKind
    status: SpanStatus
    start_time: str = Field(alias="startTime")
    duration_ms: float = Field(alias="durationMs")
    attributes: dict[str, str | float | bool] = Field(default_factory=dict)
    error_message: Optional[str] = Field(default=None, alias="errorMessage")

    class Config:
        populate_by_name = True


class Trace(BaseModel):
    trace_id: str = Field(alias="traceId")
    agent_name: str = Field(alias="agentName")
    environment: str
    start_time: str = Field(alias="startTime")
    duration_ms: float = Field(alias="durationMs")
    status: SpanStatus
    span_count: int = Field(alias="spanCount")
    token_count: Optional[int] = Field(default=None, alias="tokenCount")
    cost_usd: Optional[float] = Field(default=None, alias="costUsd")
    spans: list[Span] = Field(default_factory=list)

    class Config:
        populate_by_name = True


class Alert(BaseModel):
    alert_id: str = Field(alias="alertId")
    title: str
    severity: Severity
    status: AlertStatus
    agent_name: str = Field(alias="agentName")
    rule_name: str = Field(alias="ruleName")
    trace_id: Optional[str] = Field(default=None, alias="traceId")
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")
    summary: str

    class Config:
        populate_by_name = True


class SignozWebhookPayload(BaseModel):
    rule_id: str = Field(alias="ruleId")
    rule_name: str = Field(alias="ruleName")
    severity: Severity
    status: str  # "firing" | "resolved"
    labels: dict[str, str] = Field(default_factory=dict)
    annotations: dict[str, str] = Field(default_factory=dict)
    starts_at: str = Field(alias="startsAt")
    ends_at: Optional[str] = Field(default=None, alias="endsAt")

    class Config:
        populate_by_name = True


class Diagnosis(BaseModel):
    diagnosis_id: str = Field(alias="diagnosisId")
    trace_id: str = Field(alias="traceId")
    alert_id: Optional[str] = Field(default=None, alias="alertId")
    created_at: str = Field(alias="createdAt")
    root_cause: str = Field(alias="rootCause")
    confidence: float
    suggested_fix: str = Field(alias="suggestedFix")
    related_span_ids: list[str] = Field(default_factory=list, alias="relatedSpanIds")
    impact: str = Field(default="Unknown impact")
    next_steps: list[str] = Field(default_factory=list, alias="nextSteps")

    class Config:
        populate_by_name = True

