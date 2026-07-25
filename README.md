# AgentOps Sentinel

## Overview
AgentOps Sentinel is an AI-powered observability platform for LLM and multi-agent applications. It uses OpenTelemetry and SigNoz to collect traces, metrics, and logs, then leverages AI to analyze failures, identify root causes, and suggest fixes.

## Problem Statement
Modern AI systems are difficult to debug because failures occur across multiple LLM calls, vector databases, tool invocations, and agent workflows. Traditional logging is not enough to understand these complex execution paths.

## Solution
AgentOps Sentinel provides: 
- End-to-end OpenTelemetry instrumentation 
- Centralized observability with SigNoz 
- AI-assisted root cause analysis 
- Real-time dashboards 
- Alerting for failures and latency spikes 
- Incident timeline and execution replay

## Features
- Distributed tracing for AI workflows
- Custom metrics (latency, token usage, cost)
- Structured logging
- SigNoz dashboards
- Alert rules
- AI-generated incident diagnosis
- Execution timeline visualization
- Modern Next.js dashboard

## Tech Stack
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI (Python), Next.js Route Handlers
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Clerk
- **Observability**: OpenTelemetry, SigNoz, OTLP Exporter
- **AI**: Gemini / OpenAI

## Architecture
`User → Next.js Application → AI Workflow → OpenTelemetry → SigNoz → AI Diagnosis Engine → Dashboard`

## Project Structure
```text
app/               # Next.js frontend
backend/           # FastAPI backend
components/        # React components
supabase/          # Database schema
scripts/           # Utility scripts
instrumentation.ts # OpenTelemetry setup
public/            # Static assets
```

## Installation
1. Clone the repository.
2. Install dependencies for both frontend and backend.
3. Configure environment variables.
4. Set up Supabase Database using `supabase/schema.sql`.
5. Start SigNoz using Foundry (`casting.yaml`).
6. Run the development servers.

## Environment Variables
Ensure `.env.local` is present in the root directory:
```env
NEXT_PUBLIC_APP_NAME=AgentOps Sentinel
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
NEXT_PUBLIC_SIGNOZ_API_URL=your-signoz-api-url
SIGNOZ_API_KEY=your-signoz-api-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## SigNoz Integration
The application is instrumented using OpenTelemetry. Every AI workflow generates: 
- Traces 
- Metrics 
- Logs

Custom metrics include: 
- LLM latency 
- Token usage 
- Token cost 
- Tool execution time 
- Retrieval latency 
- Error rate 
- Retry count

SigNoz dashboards visualize application health, while alerts notify developers when thresholds are exceeded.

## Demo Flow
1. User starts an AI workflow.
2. OpenTelemetry creates traces.
3. SigNoz collects telemetry.
4. An alert is triggered on failure.
5. The AI diagnosis engine analyzes the incident.
6. The dashboard displays the root cause and suggested fix.

## Future Improvements
- Multi-agent support
- GitHub PR generation
- Cost forecasting
- Prompt comparison
- Failure simulation

## AI Assistance Declaration
AI tools were utilized during the development of this project:
- **ChatGPT** was used for brainstorming, architecture planning, and documentation.
- **GitHub Copilot** was used for monitoring and implementation guidance.

All integration, testing, validation, and final implementation decisions were completed by the project author(s).

## License
Specify the license used for this project (e.g., MIT).

## Acknowledgements
- SigNoz
- OpenTelemetry
- WeMakeDevs
- Next.js
- React
- FastAPI
- Clerk
- Supabase
