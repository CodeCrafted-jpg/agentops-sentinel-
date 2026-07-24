#!/usr/bin/env python3
"""
Loads backend/data/sample_runs.json and inserts alerts and diagnoses into Supabase.
"""

from __future__ import annotations

import json
from pathlib import Path
import sys
import os
from dotenv import load_dotenv

# Add backend directory to sys.path so we can import services
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.append(str(BACKEND_DIR))

env_path = BACKEND_DIR.parent / ".env.local"
if not env_path.exists():
    env_path = BACKEND_DIR / ".env"
load_dotenv(env_path)

from services.supabase_client import supabase_client

DATA_PATH = BACKEND_DIR / "data" / "sample_runs.json"

def main() -> None:
    if not supabase_client:
        raise SystemExit("Error: Supabase client could not be initialized. Please check your .env variables (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).")

    if not DATA_PATH.exists():
        raise SystemExit(f"sample data not found at {DATA_PATH}")

    payload = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    alerts = payload.get("alerts", [])
    diagnoses = payload.get("diagnoses", [])

    print(f"Loaded {DATA_PATH.name}")
    print(f"  alerts: {len(alerts)}")
    print(f"  diagnoses: {len(diagnoses)}")
    
    print("\nInserting data into Supabase...")

    # Insert alerts
    for a in alerts:
        try:
            supabase_client.table("alerts").upsert({
                "alert_id": a["alertId"],
                "title": a["title"],
                "severity": a["severity"],
                "status": a["status"],
                "agent_name": a["agentName"],
                "rule_name": a["ruleName"],
                "trace_id": a["traceId"],
                "summary": a["summary"],
                "created_at": a["createdAt"],
                "updated_at": a["updatedAt"]
            }, on_conflict="alert_id").execute()
            print(f"  Inserted alert: {a['alertId']}")
        except Exception as e:
            print(f"  Failed to insert alert {a['alertId']}: {e}")

    # Insert diagnoses
    for d in diagnoses:
        try:
            supabase_client.table("diagnoses").upsert({
                "diagnosis_id": d["diagnosisId"],
                "trace_id": d["traceId"],
                "alert_id": d["alertId"],
                "root_cause": d["rootCause"],
                "confidence": d["confidence"],
                "suggested_fix": d["suggestedFix"],
                "related_span_ids": d["relatedSpanIds"],
                "created_at": d["createdAt"]
            }, on_conflict="diagnosis_id").execute()
            print(f"  Inserted diagnosis: {d['diagnosisId']}")
        except Exception as e:
            print(f"  Failed to insert diagnosis {d['diagnosisId']}: {e}")

    print("\nDone seeding Supabase database!")

if __name__ == "__main__":
    main()
