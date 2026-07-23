#!/usr/bin/env bash
# One-time environment setup for AgentOps Sentinel.
#
# Installs Node dependencies for the Next.js app + workspace packages, and
# creates a Python virtual environment for the FastAPI backend.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Installing Node dependencies (root + packages/*)"
npm install

echo "==> Creating Python virtual environment for backend/"
cd "$ROOT_DIR/backend"
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "==> Setup complete."
echo "    Frontend: npm run dev        (from repo root)"
echo "    Backend:  scripts/run-dev.sh (from repo root)"
