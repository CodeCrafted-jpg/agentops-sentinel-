#!/usr/bin/env python3
"""
Loads backend/data/sample_runs.json and prints a summary.

Phase 0: there is no database yet, so this script only validates the
sample fixture and reports what it contains. Once a store exists (Phase 1+),
extend this to actually insert traces/alerts instead of just printing them.
"""

from __future__ import annotations

import json
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "backend" / "data" / "sample_runs.json"


def main() -> None:
    if not DATA_PATH.exists():
        raise SystemExit(f"sample data not found at {DATA_PATH}")

    payload = json.loads(DATA_PATH.read_text())
    traces = payload.get("traces", [])
    alerts = payload.get("alerts", [])

    print(f"Loaded {DATA_PATH.relative_to(DATA_PATH.parents[3])}")
    print(f"  traces: {len(traces)}")
    for t in traces:
        print(f"    - {t['traceId']} · {t['agentName']} · {t['status']} · {t['durationMs']}ms")
    print(f"  alerts: {len(alerts)}")
    for a in alerts:
        print(f"    - {a['alertId']} · {a['severity']} · {a['title']}")

    print("\nNo database configured yet — this is a dry run (see Phase 1).")


if __name__ == "__main__":
    main()
