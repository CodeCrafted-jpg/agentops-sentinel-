<div align="center">

# AgentOps Sentinel

### AI-Powered Observability & Root Cause Analysis for LLM and Multi-Agent Systems

Built for the **Agents of SigNoz Hackathon**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![SigNoz](https://img.shields.io/badge/SigNoz-Observability-orange?style=for-the-badge)](https://signoz.io/)
[![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-Instrumented-7A3E9D?style=for-the-badge)](https://opentelemetry.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

### 🌐 Live Demo

**https://agentops-sentinel-dc6w.vercel.app/**

</div>

---

# Overview

Modern AI applications rarely fail in a single place.

A single user request may travel through:

- LLMs
- Retrieval pipelines
- Vector databases
- Multiple autonomous agents
- External APIs
- Tool executions

Traditional logs only tell **what happened**.

They rarely explain:

- Which agent failed?
- Which tool caused the issue?
- Where latency increased?
- Why did the workflow break?
- Which span is responsible?

**AgentOps Sentinel** combines **OpenTelemetry**, **SigNoz**, and an **AI Diagnosis Engine** into one platform that observes every AI workflow in real time, detects failures automatically, and provides actionable root cause analysis before developers even open their terminal.

---

# Problem Statement

Debugging AI systems is significantly harder than debugging traditional applications.

Challenges include:

- Multi-agent execution chains
- Long-running LLM workflows
- Hidden latency spikes
- Token usage across multiple providers
- Tool invocation failures
- Distributed tracing across services
- Missing context during production incidents

Without centralized observability, developers spend hours manually searching through logs to identify failures.

---

# Solution

AgentOps Sentinel provides an end-to-end observability platform specifically designed for AI applications.

It automatically:

- Instruments AI workflows using OpenTelemetry
- Sends traces and metrics to SigNoz
- Detects failures using alert rules
- Collects execution context
- Generates AI-powered incident diagnosis
- Displays the entire execution timeline in a unified dashboard

Instead of asking:

> "Why did my AI fail?"

Developers immediately receive:

✔ Root Cause

✔ Failed Span

✔ Error Timeline

✔ Suggested Fix

---

# Key Features

## AI Observability

- OpenTelemetry instrumentation
- Distributed tracing
- Span visualization
- Trace waterfall
- Flame graph analysis

---

## SigNoz Integration

- Real-time trace ingestion
- Metrics collection
- Error tracking
- Custom dashboards
- Alert management

---

## AI Diagnosis Engine

Automatically analyzes incidents and provides:

- Root cause
- Failure summary
- Suggested fix
- Execution context

---

## Real-Time Dashboard

Monitor:

- Active Agents
- Live Traces
- Open Alerts
- Error Rate
- Average Latency
- Recent Incidents

---

## Incident Replay

Every alert contains:

- Complete trace
- Timeline
- Failed spans
- Environment
- Metadata

---

## Alert Management

Automatic alert generation for:

- LLM latency spikes
- Agent failures
- Tool failures
- Error rate thresholds
- Custom webhook alerts

---

# Architecture

```text
                        User Request
                             │
                             ▼
                     Next.js Frontend
                             │
                             ▼
                  AI Workflow / Agents
                             │
                             ▼
                 OpenTelemetry SDK
                             │
                             ▼
                     OTLP Exporter
                             │
                             ▼
                         SigNoz
               Traces • Metrics • Logs
                             │
                 Alert Rules Triggered
                             │
                             ▼
              AI Diagnosis Engine (FastAPI)
                             │
                             ▼
                  Supabase Incident Store
                             │
                             ▼
                 AgentOps Dashboard
```

---

# Tech Stack

| Category | Technology |
|-----------|------------|
| Frontend | Next.js 16 |
| UI | React + Tailwind CSS + shadcn/ui |
| Backend | FastAPI |
| Database | Supabase PostgreSQL |
| Authentication | Clerk |
| Observability | SigNoz |
| Instrumentation | OpenTelemetry |
| AI | Gemini / OpenAI |
| Deployment | Vercel + Render |

---

# Project Structure

```text
AgentOps-Sentinel/

├── app/
├── backend/
├── components/
├── lib/
├── hooks/
├── instrumentation.ts
├── scripts/
├── supabase/
├── public/
├── middleware.ts
└── README.md
```

---

# Observability Pipeline

```text
AI Agent
      │
      ▼
OpenTelemetry SDK
      │
      ▼
OTLP Exporter
      │
      ▼
SigNoz Cloud
      │
      ├── Traces
      ├── Metrics
      ├── Logs
      └── Alerts
              │
              ▼
Webhook
              │
              ▼
Diagnosis Engine
              │
              ▼
Dashboard
```

---

# Screenshots

## Landing Page

<img width="1684" height="878" alt="Screenshot 2026-07-25 222836" src="https://github.com/user-attachments/assets/40c98ea6-326a-4601-b49d-fa1eb821192e" />

---

## Live Dashboard

<img width="1864" height="934" alt="Screenshot 2026-07-25 222810" src="https://github.com/user-attachments/assets/786734cf-8725-44ea-bf63-5917e18ba43e" />


---

## Alert Center

<img width="1881" height="725" alt="Screenshot 2026-07-25 222907" src="https://github.com/user-attachments/assets/6b280063-124a-4bbb-bfe2-ea67b7975bff" />


---

## SigNoz Dashboard

<img width="1826" height="849" alt="Screenshot 2026-07-25 222942" src="https://github.com/user-attachments/assets/62abb8d6-f8f6-4813-a6e7-ec10e9137f3b" />


---

## Trace Waterfall

<img width="1834" height="873" alt="Screenshot 2026-07-25 223014" src="https://github.com/user-attachments/assets/09199d7f-2b1f-4ae9-8e1e-01015240fdb4" />


---

# Demo Workflow

1. User starts an AI workflow.

2. OpenTelemetry creates spans.

3. Traces are exported to SigNoz.

4. Metrics are generated.

5. Alert rule detects failure.

6. Webhook sends incident.

7. Diagnosis engine analyzes failure.

8. Dashboard displays:

- Root Cause
- Trace
- Failed Span
- Suggested Fix

---

# Metrics Collected

The application collects custom telemetry including:

- Agent latency
- Tool execution time
- Retrieval latency
- Token usage
- Token cost
- Error rate
- Retry count
- Span duration
- Request throughput

---

# Environment Variables

Create a `.env.local`

```env
NEXT_PUBLIC_APP_NAME=AgentOps Sentinel

NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

CLERK_SECRET_KEY=

NEXT_PUBLIC_SIGNOZ_API_URL=

SIGNOZ_API_KEY=

NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

# Installation

Clone the repository

```bash
git clone https://github.com/your-username/agentops-sentinel.git

cd agentops-sentinel
```

Install frontend

```bash
npm install
```

Install backend

```bash
cd backend

pip install -r requirements.txt
```

Run frontend

```bash
npm run dev
```

Run backend

```bash
uvicorn app.main:app --reload
```

---

# SigNoz Setup

Configure OpenTelemetry exporter.

Provide:

- OTLP Endpoint
- API Key

All traces will automatically appear inside SigNoz dashboards.

---

# Why AgentOps Sentinel?

Unlike traditional monitoring tools, AgentOps Sentinel is built specifically for AI systems.

It understands:

- LLM calls
- Multi-agent execution
- Tool chains
- AI workflows
- Retrieval pipelines

Developers receive meaningful AI-native observability instead of raw infrastructure metrics.

---

# Future Roadmap

- Multi-agent orchestration support
- GitHub Pull Request generation
- Cost forecasting
- Prompt comparison
- Failure simulation
- Automatic rollback recommendations
- Production anomaly detection
- Long-term telemetry analytics

---

# Built For

**Agents of SigNoz Hackathon**

Theme:

> Build innovative AI applications using SigNoz observability.

This project demonstrates:

- OpenTelemetry instrumentation
- SigNoz integration
- AI-native observability
- Automated diagnostics
- Production-ready dashboards

---

# AI Assistance Disclosure

AI tools were used responsibly during development.

- ChatGPT assisted with brainstorming, architecture discussions, documentation, and code review.
- GitHub Copilot assisted with code completion and implementation guidance.

All design decisions, integrations, debugging, testing, deployment, and final implementation were completed by the project author.

---

# Acknowledgements

- SigNoz
- OpenTelemetry
- WeMakeDevs
- Next.js
- FastAPI
- React
- Clerk
- Supabase
- Vercel

---

# License

MIT License

---

<div align="center">

### ⭐ If you like this project, consider giving it a star!

Built with ❤️ for the Agents of SigNoz Hackathon

</div>
