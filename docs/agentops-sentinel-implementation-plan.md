# AgentOps Sentinel — Full Implementation Plan

## 1. Project Summary

AgentOps Sentinel is a developer-first observability and self-healing assistant for multi-step AI workflows. It combines:

- OpenTelemetry instrumentation for agent traces, LLM calls, tool usage, and vector retrieval
- SigNoz as the telemetry backend
- A webhook-driven backend that receives alerts and diagnoses failures
- A Next.js dashboard that shows live agent execution, cost/latency insights, and AI-generated SRE analysis

This plan is the blueprint for building the full hackathon-ready web app in this workspace.

---

## Current Implementation Status (2026-07-24)

As of 2026-07-24 the workspace contains a working Next.js dashboard that is running locally and wired to several API routes used by the UI. Key items already in place:

- The dashboard at [app/dashboard/page.tsx](app/dashboard/page.tsx) fetches live data from API routes and supports alert/trace selection and diagnosis rendering.
- A streaming SSE route exists at [app/api/stream/route.ts](app/api/stream/route.ts) to push live updates to the UI.
- The diagnosis API route at [app/api/diagnostics/route.ts](app/api/diagnostics/route.ts) calls into the `SignozClient` and `DiagnosisAgent` from the `telemetry` package; it persists diagnoses via the local `db` layer.
- A Python FastAPI service skeleton is present at [backend/app/main.py](backend/app/main.py) and already includes routers for `health`, `alerts`, and `diagnostics`.

The app is therefore functionally end-to-end in the UI (alerts → trace selection → POST /api/diagnostics → render), but the backend persistence and production integration (Supabase, Clerk auth) are not yet wired.


## 2. What the Final Product Should Do

### Core experience
1. A developer runs a sample AI workflow (RAG + tool calls + LLM steps).
2. The workflow emits traces and metrics to SigNoz via OpenTelemetry.
3. A SigNoz alert fires on an anomaly such as:
   - high latency
   - tool loop failure
   - token spike
   - schema parse error
4. A backend listener receives the webhook.
5. The backend uses the SigNoz MCP server or equivalent query layer to inspect traces/logs.
6. An LLM agent produces a root-cause diagnosis, likely cause, and suggested recovery action.
7. The Next.js dashboard displays the analysis in a polished, real-time UI.

### Demo story for the hackathon
A user sees:
- an agent run failing in a loop,
- a SigNoz alert appearing,
- the backend correlating traces and logs,
- the dashboard showing a post-mortem with likely root cause and fix suggestions.

---

## 3. Recommended Product Architecture

### High-level architecture

```text
User / Developer
   |
   v
Next.js App Router UI (dashboard + trace explorer)
   |
   +--> API Routes / Webhooks
   |       - /api/webhooks/signoz
   |       - /api/alerts
   |       - /api/traces
   |       - /api/diagnostics
   |
   +--> Backend Service (FastAPI or Node service)
           - consumes SigNoz webhooks
           - queries telemetry context
           - orchestrates LLM diagnosis agent
           - stores workflow state

Telemetry sources
   - OpenTelemetry SDK in app runtime
   - LLM calls
   - vector retrieval
   - tool execution
   - custom spans and events

SigNoz
   - OTLP receiver
   - traces/logs/metrics
   - alerting + webhook delivery

MCP layer
   - SigNoz MCP server / query interface
   - used by agent to inspect traces and logs
```

### Recommended implementation split
- Frontend: Next.js + TypeScript + Tailwind + shadcn/ui-style components
- Backend: Python FastAPI for the agent orchestration layer
- Telemetry: OpenTelemetry JS/Node or Python SDK depending on your workflow runtime
- Data storage: local JSON/SQLite for MVP, Postgres later if needed
- Optional real-time UI: Server-Sent Events or polling for updates

---

## 4. Suggested Tech Stack

### Frontend
- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- React 19
- Recharts or charting library for latency/cost visualizations
- Lucide React for icons
- Zod for validation

### Backend
- Python 3.11+
- FastAPI
- Uvicorn
- Pydantic
- httpx or requests
- OpenAI or compatible LLM SDK
- LangChain or LlamaIndex (optional but useful)

### Telemetry and observability
- OpenTelemetry SDK
- OTLP exporter to SigNoz
- SigNoz cloud or local instance
- SigNoz webhook integration
- Optionally SigNoz MCP server for trace investigation

### Developer tooling
- Docker Compose for local stack
- ESLint + TypeScript strict mode
- Playwright or Vitest for testing

---

## 5. Recommended Repository Structure

```text
app/
  api/
    webhooks/
      signoz/route.ts
    alerts/route.ts
    traces/route.ts
    diagnostics/route.ts
  dashboard/
    page.tsx
  layout.tsx
  page.tsx

backend/
  app/
    main.py
    api/
      alerts.py
      diagnostics.py
      health.py
  services/
    signoz_client.py
    telemetry_ingest.py
    diagnosis_agent.py
    mcp_bridge.py
  models/
    schemas.py
  data/
    sample_runs.json

packages/
  shared/
    src/
      types.ts
      schemas.ts
  telemetry/
    src/
      otel.ts
      span-helpers.ts
  ui/
    src/
      components/
      charts/

scripts/
  setup.sh
  seed-demo-data.py
  run-dev.sh

docs/
  agentops-sentinel-implementation-plan.md
```

---

## 6. Functional Requirements

### A. Telemetry ingestion
The app must capture:
- LLM completion requests
- token usage (prompt, completion, total)
- total latency
- error events
- tool execution steps
- vector retrieval latency and result count
- workflow step status

### B. Alert handling
The system must receive alerts from SigNoz and store them as structured records with:
- alert ID
- title
- severity
- source service
- first seen / last seen
- trace ID or correlation ID
- status

### C. Diagnosis engine
When an alert arrives, the backend should:
- fetch the relevant trace context
- inspect logs and spans
- determine the likely root cause
- generate a concise diagnosis and suggested remediation

### D. Dashboard UI
The UI should include:
- live alert feed
- high-level metrics cards
- cost/latency trend views
- execution tree for workflow steps
- per-run diagnosis details
- links to trace details

---

## 7. Data Model Design

### Trace run model
```ts
interface AgentRun {
  id: string;
  workflowName: string;
  startedAt: string;
  endedAt?: string;
  status: "running" | "succeeded" | "failed" | "error";
  correlationId: string;
  traceId?: string;
  totalTokens?: number;
  totalCostUsd?: number;
  totalLatencyMs?: number;
  steps: AgentStep[];
  diagnosis?: DiagnosisResult;
}
```

### Agent step model
```ts
interface AgentStep {
  id: string;
  name: string;
  type: "llm" | "tool" | "retrieval" | "workflow";
  status: "pending" | "running" | "succeeded" | "failed" | "error";
  startedAt?: string;
  endedAt?: string;
  latencyMs?: number;
  tokensUsed?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}
```

### Alert model
```ts
interface AlertEvent {
  id: string;
  source: "signoz";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  traceId?: string;
  serviceName?: string;
  createdAt: string;
  status: "new" | "investigating" | "resolved";
}
```

### Diagnosis model
```ts
interface DiagnosisResult {
  id: string;
  runId: string;
  summary: string;
  rootCause: string;
  likelyFactors: string[];
  remediationSteps: string[];
  confidence: number;
  generatedAt: string;
}
```

---

## 8. Phase-by-Phase Implementation Plan

### Phase 0 — Project foundation
Goal: get the repo ready for the full app.

Tasks:
- replace the placeholder landing page with a polished product landing/dashboard shell
- create the folder structure for API routes and backend services
- set up shared types and schemas in packages/shared
- configure Tailwind and base UI styles
- add a simple design system for cards, tables, badges, and charts

Deliverables:
- working Next.js home/dashboard shell
- reusable UI base components
- consistent app theme

### Phase 1 — Telemetry instrumentation
Goal: make the sample workflow emit spans and events.

Tasks:
- add OpenTelemetry SDK setup for the app runtime
- create custom spans for:
  - workflow start/stop
  - LLM call
  - retrieval call
  - tool call
- capture token counts and latency as span attributes
- add correlation IDs to all steps
- export traces to SigNoz via OTLP

Deliverables:
- sample traces visible in SigNoz
- traces contain structured metadata for the dashboard

### Phase 2 — Backend alert intake and diagnosis
Goal: make the app react to failures automatically.

Tasks:
- create webhook route for incoming SigNoz alerts
- validate payloads and persist alert data
- build a service that correlates alerts with runs and traces
- connect to an LLM agent that inspects telemetry context
- implement a diagnosis pipeline:
  1. retrieve relevant traces/logs
  2. summarize the failure
  3. suggest likely root cause
  4. output remediation steps

Deliverables:
- webhook receiver
- automated diagnosis pipeline
- persisted alert/diagnosis records

### Phase 3 — Dashboard experience
Goal: turn the data into a beautiful observability console.

Tasks:
- create a dashboard page with:
  - active alerts
  - recent runs
  - cost and latency charts
  - execution tree view
- create a dedicated run details page
- add status badges, timeline views, and diagnosis panels
- add links back to SigNoz traces/logs
- implement polling or SSE for live updates

Deliverables:
- polished UI for the full demo experience
- evidence of telemetry-driven diagnosis in the UI

### Phase 4 — Demo polish and deployment
Goal: make the project hackathon-ready.

Tasks:
- add sample data and seeded demo runs
- add Docker Compose or simple local startup commands
- add README usage instructions
- record a short demo flow
- ensure environment variables and secrets are documented
- create a final presentation narrative

Deliverables:
- reproducible local demo setup
- clear README and architecture explanation
- one-click demo flow

---

## 9. Exact Implementation Tasks for This Workspace

### A. Frontend tasks
1. Replace the default landing page in [app/page.tsx](app/page.tsx) with a product hero and dashboard preview.
2. Create a dashboard route in [app/dashboard/page.tsx](app/dashboard/page.tsx).
3. Add reusable components under [packages/ui/src/components](packages/ui/src/components).
4. Add charts and visualizations for:
   - latency trend
   - token usage trend
   - alert severity breakdown
5. Add dark mode UI polish for a premium hacker-product feel.

### B. API route tasks
1. Create [app/api/webhooks/signoz/route.ts](app/api/webhooks/signoz/route.ts) to receive incoming webhook events.
2. Create [app/api/alerts/route.ts](app/api/alerts/route.ts) to list alerts.
3. Create [app/api/traces/route.ts](app/api/traces/route.ts) to return run details.
4. Create [app/api/diagnostics/route.ts](app/api/diagnostics/route.ts) to return AI-generated diagnosis records.

### C. Shared types and schemas
1. Add TypeScript types in [packages/shared/src/types.ts](packages/shared/src/types.ts).
2. Add Zod schemas in [packages/shared/src/schemas.ts](packages/shared/src/schemas.ts).

### D. Telemetry tasks
1. Add a telemetry helper module in [packages/telemetry/src/otel.ts](packages/telemetry/src/otel.ts).
2. Create helpers for:
   - startSpan
   - recordTokenUsage
   - recordLatency
   - recordError
3. Use them in the sample workflow runtime or mock workflow simulator.

### E. Backend tasks
1. Create [backend/app/main.py](backend/app/main.py) for FastAPI.
2. Add handlers for alerts and diagnostics.
3. Add a diagnosis agent service that calls an LLM and summarizes traces.

---

## 10. Suggested Sample Workflow to Instrument

Use a synthetic but realistic agent workflow for the demo.

### Example workflow
1. User query arrives.
2. Retrieval step searches a vector index.
3. LLM planner decides which tool to call.
4. Tool call executes and returns data.
5. Final LLM answer is generated.

### Introduce a controlled failure
Simulate one of these in the demo:
- vector retrieval latency spike
- tool execution exception
- prompt schema parsing error
- excessive token usage causing cost anomaly

This makes the telemetry and diagnosis loop visible and easy to explain.

---

## 11. Recommended Dependencies to Add

### Next.js/TypeScript dependencies
```bash
npm install zod clsx tailwind-merge lucide-react recharts
```

### Telemetry dependencies
```bash
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http
```

### Backend Python dependencies
```bash
pip install fastapi uvicorn pydantic httpx openai langchain llama-index
```

If you want a lighter setup, you can keep the backend logic inside Next.js API routes and avoid a separate Python service for the MVP.

---

## 12. Environment Variables

Create a local env file with:

```env
NEXT_PUBLIC_APP_NAME=AgentOps Sentinel
SIGNOZ_OTLP_ENDPOINT=http://localhost:4318
SIGNOZ_API_URL=http://localhost:3301
SIGNOZ_WEBHOOK_SECRET=changeme
OPENAI_API_KEY=your_key_here
LLM_MODEL=gpt-4.1-mini
BACKEND_BASE_URL=http://localhost:8000
```

If you are using a hosted SigNoz instance, replace the local endpoints with your real values.

---

## 13. API Contract Ideas

### POST /api/webhooks/signoz
Accepts SigNoz webhook payloads and stores alerts.

Example response:
```json
{
  "ok": true,
  "received": true,
  "alertId": "alert_123"
}
```

### GET /api/alerts
Returns all recent alerts.

### GET /api/traces?runId=...
Returns trace details for one workflow execution.

### POST /api/diagnostics
Triggers a diagnosis for a run or alert.

---

## 14. MVP Definition of Done

The MVP is complete when:
- a sample workflow emits telemetry to SigNoz
- an alert is received and displayed in the UI
- the backend generates a diagnosis summary
- the dashboard shows cost/latency and trace information
- the app can be demonstrated locally without manual patching

---

## 15. Stretch Goals for the Hackathon

If time remains, add:
- live SSE updates for alerts
- direct links to SigNoz traces
- markdown-based post-mortems
- fix suggestion patch generation
- GitHub PR-style remediation output
- a “self-heal” action that suggests a code change or config update

---

## 16. Suggested Development Order

To avoid building the wrong things first, follow this order:

1. Build the dashboard shell and route structure.
2. Add telemetry instrumentation and produce a visible trace.
3. Create the webhook receiver and alert storage.
4. Add diagnosis generation.
5. Polish the dashboard and demo story.
6. Prepare the README and demo script.

---

## 17. Demo Script for Judges

### 30-second opening
“AgentOps Sentinel is an autonomous SRE assistant for AI agents. It watches multi-step agent workflows, captures telemetry from LLMs and tool calls, and turns failures into actionable diagnoses.”

### 60-second demo flow
1. Show the dashboard with active alerts.
2. Trigger a simulated agent failure.
3. Show the alert arriving in the webhook pipeline.
4. Show the backend diagnosis summary.
5. Show the trace and suggested remediation in the UI.

### Closing line
“This is a practical observability layer for real-world agentic AI systems, with SigNoz and MCP-style context retrieval built directly into the debugging loop.”

---

## 18. README and Hackathon Notes

Your final README should explicitly state:
- what the project does
- how SigNoz is used
- how OpenTelemetry instrumentation works
- how the agent diagnoses failures
- how to run the app locally
- what AI assistant tools were used during development

Suggested README section:

```md
## AI assistant declaration
This project was developed with assistance from GitHub Copilot and other AI coding tools.
```

---

## 19. Recommended First Implementation Milestone

If you want the fastest path to a strong hackathon submission, build this first:

- one dashboard page
- one webhook endpoint
- one mocked or seeded workflow run
- one diagnosis summary card
- one alert feed

That is enough to make the product feel real and impressive even before you add more complexity.

---

## 20. Final Advice

The biggest mistake to avoid is trying to build the full autonomous debugging system too early. Start with a small but impressive slice:

- instrument one workflow,
- capture one alert,
- show one diagnosis,
- display it beautifully.

That gives you a credible hackathon submission with a polished story and strong technical depth.

---

## FastAPI (Python) backend — when to implement and next steps

Status: skeleton present in [backend/app/main.py](backend/app/main.py) (routers wired for health, alerts, diagnostics) but not yet production-ready: it currently uses stubbed services and local persistence.

When to implement: implement the full FastAPI backend immediately after you have the authentication and persistence foundations in place (Clerk + Supabase). Recommended sequencing:

1. Week 0 (this sprint): Add Clerk to the Next.js frontend and provision a Supabase project + DB schema (users, orgs, alerts, diagnoses, runs).
2. Week 1: Wire the FastAPI backend to Supabase (via `supabase-py`) and add environment-driven configuration for DB and Signoz endpoints.
3. Week 1 (parallel): Add auth enforcement — verify Clerk session/JWT on protected endpoints (alerts/diagnostics) and enforce per-org RBAC.
4. Week 2: Migrate any local persistence (app/api/db.ts) to Supabase-backed endpoints, add seed scripts, and run integration tests.

Concrete backend tasks:

- Add `supabase` client to `backend/requirements.txt` or `requirements.txt` and configure `SUPABASE_URL` and `SUPABASE_KEY`.
- Replace local JSON/DB reads with Supabase queries in `backend/app/api/*` handlers.
- Add middleware to validate Clerk JWTs on protected routes (use Clerk public keys or Clerk server SDK).
- Add a small migration/seed script under `backend/` to create tables and insert demo runs and alerts.
- Run the backend locally with:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

If you prefer to postpone the Python backend, the same endpoints can be implemented in Next.js API routes for an MVP — however a separate FastAPI service is recommended for production because it separates concerns and simplifies scaling the diagnosis agent.

