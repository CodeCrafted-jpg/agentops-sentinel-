#!/usr/bin/env bash
# Runs the Next.js dashboard (port 3000) and FastAPI backend (port 8000)
# together for local development. Ctrl-C stops both.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cleanup() {
  echo "==> Stopping dev servers"
  jobs -p | xargs -r kill
}
trap cleanup EXIT INT TERM

echo "==> Starting FastAPI backend on :8000"
(
  cd "$ROOT_DIR/backend"
  source .venv/bin/activate
  uvicorn app.main:app --reload --port 8000
) &

echo "==> Starting Next.js dashboard on :3000"
(
  cd "$ROOT_DIR"
  npm run dev
) &

wait
