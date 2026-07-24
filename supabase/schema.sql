-- Supabase schema for AgentOps Sentinel

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  email text unique,
  clerk_id text unique,
  role text default 'member',
  created_at timestamptz default now()
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  alert_id text unique,
  org_id uuid references organizations(id) on delete cascade,
  title text not null,
  severity text not null,
  status text not null,
  agent_name text,
  rule_name text,
  trace_id text,
  summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists diagnoses (
  id uuid primary key default gen_random_uuid(),
  diagnosis_id text unique,
  org_id uuid references organizations(id) on delete cascade,
  trace_id text,
  alert_id text,
  root_cause text,
  confidence numeric,
  suggested_fix text,
  related_span_ids text[] default array[]::text[],
  impact text,
  next_steps text[] default array[]::text[],
  created_at timestamptz default now()
);
