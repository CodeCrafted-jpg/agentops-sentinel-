async function verify() {
  const alertsRes = await fetch("http://localhost:3000/api/alerts");
  const alertsData = await alertsRes.json();
  console.log("Alerts Count:", alertsData.data ? alertsData.data.length : 0);
  if (alertsData.data && alertsData.data.length > 0) {
    console.log("Latest Alert:", JSON.stringify(alertsData.data[0], null, 2));
  }

  const diagRes = await fetch("http://localhost:3000/api/diagnostics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ traceId: "trc_4821" })
  });
  const diagData = await diagRes.json();
  console.log("Diagnosis for trc_4821:", JSON.stringify(diagData.data, null, 2));
}

verify().catch(console.error);
