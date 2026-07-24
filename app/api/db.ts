import { createClient } from "@supabase/supabase-js";
import type { Alert, Diagnosis } from "@agentops/shared";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase configuration in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

function mapAlert(row: any): Alert {
  return {
    alertId: row.alert_id,
    title: row.title,
    severity: row.severity,
    status: row.status,
    agentName: row.agent_name,
    ruleName: row.rule_name,
    traceId: row.trace_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    summary: row.summary,
  };
}

function mapDiagnosis(row: any): Diagnosis {
  return {
    diagnosisId: row.diagnosis_id,
    traceId: row.trace_id,
    alertId: row.alert_id,
    createdAt: row.created_at,
    rootCause: row.root_cause,
    confidence: Number(row.confidence),
    suggestedFix: row.suggested_fix,
    relatedSpanIds: row.related_span_ids || [],
    impact: row.impact,
    nextSteps: row.next_steps || [],
  };
}

export const db = {
  getAlerts: async (): Promise<Alert[]> => {
    const { data, error } = await supabase.from("alerts").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapAlert);
  },

  getDiagnoses: async (): Promise<Diagnosis[]> => {
    const { data, error } = await supabase.from("diagnoses").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapDiagnosis);
  },

  addAlert: async (alert: Alert) => {
    const { error } = await supabase.from("alerts").insert([
      {
        alert_id: alert.alertId,
        title: alert.title,
        severity: alert.severity,
        status: alert.status,
        agent_name: alert.agentName,
        rule_name: alert.ruleName,
        trace_id: alert.traceId,
        summary: alert.summary,
        created_at: alert.createdAt,
        updated_at: alert.updatedAt,
      },
    ]);
    if (error) throw error;
  },

  addDiagnosis: async (diagnosis: Diagnosis) => {
    const { error } = await supabase.from("diagnoses").insert([
      {
        diagnosis_id: diagnosis.diagnosisId,
        trace_id: diagnosis.traceId,
        alert_id: diagnosis.alertId,
        root_cause: diagnosis.rootCause,
        confidence: diagnosis.confidence,
        suggested_fix: diagnosis.suggestedFix,
        related_span_ids: diagnosis.relatedSpanIds,
        impact: diagnosis.impact,
        next_steps: diagnosis.nextSteps,
        created_at: diagnosis.createdAt,
      },
    ]);
    if (error) throw error;
  },

  updateAlertStatus: async (alertId: string, status: Alert["status"]) => {
    const { error } = await supabase
      .from("alerts")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("alert_id", alertId);
    if (error) throw error;
  },
};
