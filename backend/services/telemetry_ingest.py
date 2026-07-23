"""
Turns inbound SigNoz webhook payloads into Alert records (and, later,
correlates them against the matching Trace pulled via SignozClient).

Phase 0: interface skeleton only. The Next.js webhook route at
app/api/webhooks/signoz/route.ts currently validates and logs payloads
directly; Phase 1 forwards them here instead.
"""

from __future__ import annotations

from models.schemas import Alert, SignozWebhookPayload


def ingest_signoz_webhook(payload: SignozWebhookPayload) -> Alert:
    """Convert a SigNoz webhook payload into a persisted Alert.

    Not implemented in Phase 0.
    """
    raise NotImplementedError("ingest_signoz_webhook: implemented in Phase 1")
