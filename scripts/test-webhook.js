const payload = {
  ruleId: "rule_latency_spike",
  ruleName: "LLM Latency Spike",
  severity: "critical",
  status: "firing",
  labels: {
    serviceName: "checkout-agent",
    traceId: "trc_4821"
  },
  annotations: {
    summary: "LLM call in checkout-agent exceeded 5s response time threshold."
  },
  startsAt: "2026-07-23T16:00:00Z"
};

fetch("http://localhost:3000/api/webhooks/signoz", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
  .then(async (res) => {
    const data = await res.json().catch(() => null);
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  })
  .catch((err) => console.error("Error:", err));
