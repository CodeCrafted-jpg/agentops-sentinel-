import type { Diagnosis, Trace } from "@agentops/shared";

export class DiagnosisAgent {
  async diagnose(trace: Trace, alertId: string | null = null): Promise<Diagnosis> {
    const errorSpans = trace.spans.filter((s) => s.status === "error" || s.status === "timeout");
    const relatedSpanIds = errorSpans.map((s) => s.spanId);

    let rootCause = "No anomalies detected in the trace spans. The workflow appears to have executed successfully.";
    let suggestedFix = "No fix required. Inspect client logic if incorrect results were returned.";
    let confidence = 1.0;
    let impact = "The workflow completed without visible anomalies.";
    let nextSteps = ["Monitor the run for regressions."];

    // 1. Check if we have active error spans
    if (errorSpans.length > 0) {
      // Find the main error or the deepest error span
      const primaryError = errorSpans[errorSpans.length - 1];
      const isTimeout = primaryError.status === "timeout" || primaryError.name.includes("timeout") || (primaryError.errorMessage && primaryError.errorMessage.toLowerCase().includes("timeout"));
      
      if (isTimeout) {
        rootCause = `The execution step "${primaryError.name}" timed out after ${primaryError.durationMs}ms.`;
        suggestedFix = `Verify the performance/latency of downstream dependency or increase the timeout value configuration (currently set to limit at ${primaryError.durationMs}ms).`;
        confidence = 0.85;
        impact = "The run likely stalled in the failing step, delaying the user-facing response.";
        nextSteps = [
          "Inspect upstream dependency latency and retry behavior.",
          "Increase or tune the timeout budget for the affected step.",
          "Add a fallback path so the workflow can recover gracefully.",
        ];
      } else {
        rootCause = `The execution step "${primaryError.name}" threw an error: ${primaryError.errorMessage || "Unknown execution failure"}.`;
        suggestedFix = `Check input formats, authentication secrets, or validate tool logs for "${primaryError.name}".`;
        confidence = 0.9;
        impact = "The workflow likely produced incomplete or incorrect results after the failing step.";
        nextSteps = [
          "Validate the input payload and tool configuration.",
          "Inspect logs and authentication secrets for the failing step.",
          "Retry the run after the upstream issue clears.",
        ];
      }
    }

    // 2. Try Cohere LLM Diagnosis if API key is present
    if (process.env.COHERE_API_KEY && errorSpans.length > 0) {
      try {
        const model = process.env.COHERE_MODEL || "llama-3b";
        const response = await fetch("https://api.cohere.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content: `You are an AI SRE Agent. Analyze the following trace payload consisting of spans from a failed multi-step agent run. Identify the root cause, determine a confidence score (0.0 to 1.0), and specify a proposed remediation fix. Return your response in JSON format matching this schema:
{
  "rootCause": "string describing root cause",
  "confidence": number,
  "suggestedFix": "string describing suggested remediation",
  "impact": "string",
  "nextSteps": ["string"]
}`,
              },
              {
                role: "user",
                content: JSON.stringify(trace),
              },
            ],
            temperature: 0.2,
            max_tokens: 400,
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          const message = resJson.output?.[0]?.content?.[0]?.text || resJson.choices?.[0]?.message?.content;
          if (typeof message === "string") {
            const parsed = JSON.parse(message);
            if (parsed.rootCause && parsed.suggestedFix) {
              rootCause = parsed.rootCause;
              suggestedFix = parsed.suggestedFix;
              confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0.95;
              impact = typeof parsed.impact === "string" ? parsed.impact : impact;
              nextSteps = Array.isArray(parsed.nextSteps)
                ? parsed.nextSteps.filter((step: unknown): step is string => typeof step === "string")
                : nextSteps;
            }
          }
        }
      } catch (err) {
        console.error("Cohere diagnosis failed, using heuristic fallback:", err);
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
      impact,
      nextSteps,
    };
  }
}
