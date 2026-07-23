import type { Diagnosis, Trace } from "@agentops/shared";

export class DiagnosisAgent {
  async diagnose(trace: Trace, alertId: string | null = null): Promise<Diagnosis> {
    const errorSpans = trace.spans.filter((s) => s.status === "error" || s.status === "timeout");
    const relatedSpanIds = errorSpans.map((s) => s.spanId);

    let rootCause = "No anomalies detected in the trace spans. The workflow appears to have executed successfully.";
    let suggestedFix = "No fix required. Inspect client logic if incorrect results were returned.";
    let confidence = 1.0;

    // 1. Check if we have active error spans
    if (errorSpans.length > 0) {
      // Find the main error or the deepest error span
      const primaryError = errorSpans[errorSpans.length - 1];
      const isTimeout = primaryError.status === "timeout" || primaryError.name.includes("timeout") || (primaryError.errorMessage && primaryError.errorMessage.toLowerCase().includes("timeout"));
      
      if (isTimeout) {
        rootCause = `The execution step "${primaryError.name}" timed out after ${primaryError.durationMs}ms.`;
        suggestedFix = `Verify the performance/latency of downstream dependency or increase the timeout value configuration (currently set to limit at ${primaryError.durationMs}ms).`;
        confidence = 0.85;
      } else {
        rootCause = `The execution step "${primaryError.name}" threw an error: ${primaryError.errorMessage || "Unknown execution failure"}.`;
        suggestedFix = `Check input formats, authentication secrets, or validate tool logs for "${primaryError.name}".`;
        confidence = 0.9;
      }
    }

    // 2. Try LLM Diagnosis if API key is present
    if (process.env.OPENAI_API_KEY && errorSpans.length > 0) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: `You are an AI SRE Agent. Analyze the following trace payload consisting of spans from a failed multi-step agent run. Identify the root cause, determine a confidence score (0.0 to 1.0), and specify a proposed remediation fix. Return your response in JSON format matching this schema:
{
  "rootCause": "string describing root cause",
  "confidence": number,
  "suggestedFix": "string describing suggested remediation"
}`,
              },
              {
                role: "user",
                content: JSON.stringify(trace),
              },
            ],
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          const parsed = JSON.parse(resJson.choices[0].message.content);
          if (parsed.rootCause && parsed.suggestedFix) {
            rootCause = parsed.rootCause;
            suggestedFix = parsed.suggestedFix;
            confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0.95;
          }
        }
      } catch (err) {
        console.error("LLM diagnosis failed, using heuristic fallback:", err);
      }
    }

    return {
      diagnosisId: `diag_${Math.random().toString(36).substring(2, 11)}`,
      traceId: trace.traceId,
      alertId,
      createdAt: new Date().toISOString(),
      rootCause,
      confidence,
      suggestedFix,
      relatedSpanIds,
    };
  }
}
