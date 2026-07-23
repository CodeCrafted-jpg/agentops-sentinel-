"""
AgentOps Sentinel backend — FastAPI entrypoint.

Phase 0: app factory + router wiring only. Services under
backend/services/ are stubbed and picked up in later phases.

Run locally with:
    uvicorn app.main:app --reload --port 8000
(from the backend/ directory, see scripts/run-dev.sh)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import alerts, diagnostics, health


def create_app() -> FastAPI:
    app = FastAPI(
        title="AgentOps Sentinel API",
        version="0.1.0",
        description="Ingestion, alerting, and diagnosis backend for AgentOps Sentinel.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(alerts.router)
    app.include_router(diagnostics.router)

    return app


app = create_app()
