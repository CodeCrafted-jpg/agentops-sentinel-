# AgentOps Sentinel — Current State and Next Step

## Current state

The core project foundation (**Phase 0**) has been successfully implemented:

- **Frontend & UI Shell**: A polished product landing page (`app/page.tsx`) and a complete dashboard shell (`app/dashboard/page.tsx` with sidebar, topbar, and charts) are in place, using custom UI elements from `@agentops/ui`.
- **API Scaffold & Validation**: Core API endpoints (`app/api/alerts/route.ts`, `/diagnostics/route.ts`, `/traces/route.ts`) and the SigNoz webhook receiver (`app/api/webhooks/signoz/route.ts`) are structured and validate requests against shared Zod schemas.
- **Shared Types & Schemas**: Domain types and Zod validators are fully defined in `packages/shared/src/types.ts` and `packages/shared/src/schemas.ts`.
- **Backend Architecture**: The Python FastAPI app (`backend/app/main.py`) is structured with modular routers (`alerts.py`, `diagnostics.py`, `health.py`) and service shells.
- **Telemetry Skeleton**: Packages for telemetry (`packages/telemetry/src/otel.ts` and `span-helpers.ts`) are initialized.

What is not yet implemented (Next Phases):

- **Phase 1**: Real OpenTelemetry SDK setup and exporting spans to SigNoz.
- **Phase 2**: Real webhook ingestion, persistence of alerts, and LLM-based root-cause diagnosis.
- **Phase 3**: Replacing dashboard mock data with real API calls fetch from the FastAPI/Next.js routes.
- **Phase 4**: Setup script, Docker Compose, seeding demo data, and final polish.

---

## What to do next

### 📡 Next step: Telemetry Instrumentation (Phase 1)

The next logical development step is to make agent workflows observable by implementing OpenTelemetry instrumentation. Specifically:

1. **Implement OpenTelemetry SDK Setup**
   - Populate `packages/telemetry/src/otel.ts` to initialize the Node SDK with an OTLP/HTTP Trace Exporter pointing to the SigNoz collector.

2. **Develop Telemetry Span Helpers**
   - Populate `packages/telemetry/src/span-helpers.ts` with custom span creation wrappers for tracking agent runs, LLM completion calls, tool executions, and vector retrieval spans, passing metadata (like token counts and status) as attributes.

3. **Verify via a Test Script or Simulator**
   - Create or configure a script (e.g. under `scripts/` or a test runner) to simulate a multi-step agent workflow (LLM calls + tool calls + retrieval) and verify that trace data is successfully emitted.

4. **Prepare the SigNoz Query Client**
   - Update `backend/services/signoz_client.py` to draft actual queries for fetching traces and spans from the SigNoz API.

---

## Recommended files to edit next

- [packages/telemetry/src/otel.ts](file:///c:/Users/user/Desktop/agentops-sentinel/packages/telemetry/src/otel.ts)
- [packages/telemetry/src/span-helpers.ts](file:///c:/Users/user/Desktop/agentops-sentinel/packages/telemetry/src/span-helpers.ts)
- [backend/services/signoz_client.py](file:///c:/Users/user/Desktop/agentops-sentinel/backend/services/signoz_client.py)
- [backend/services/telemetry_ingest.py](file:///c:/Users/user/Desktop/agentops-sentinel/backend/services/telemetry_ingest.py)

