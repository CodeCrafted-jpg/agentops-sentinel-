err sending command=$body = '{"ruleId":"rule-123","ruleName":"High error rate","severity":"critical","status":"firing","labels":{"serviceName":"demo-agent","traceId":"trace-test-123"},"annotations":{"description":"Test alert from local curl","summary":"Simulated SigNoz alert"},"startsAt":"2026-07-24T12:00:00Z","endsAt":"2026-07-24T12:05:00Z"}'

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/webhooks/signoz" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body


 alert simulation command= npx.cmd -y tsx scripts/simulate-agent.ts --fail

 get fresh webhook URL (localhost.run tunnel)= ssh -o StrictHostKeyChecking=no -R 80:localhost:3000 nokey@localhost.run


 frontend run=npm run dev
 backend run=cd backend
>> uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload  