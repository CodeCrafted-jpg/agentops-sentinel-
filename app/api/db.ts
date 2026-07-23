import fs from "fs";
import path from "path";
import type { Alert, Diagnosis, Trace } from "@agentops/shared";

const DB_PATH = path.join(process.cwd(), "backend", "data", "sample_runs.json");

interface Schema {
  traces: Trace[];
  alerts: Alert[];
  diagnoses?: Diagnosis[];
}

function readDb(): Schema {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      const parsed = JSON.parse(data);
      return {
        traces: parsed.traces || [],
        alerts: parsed.alerts || [],
        diagnoses: parsed.diagnoses || [],
      };
    }
  } catch (error) {
    console.error("Error reading db file:", error);
  }
  return { traces: [], alerts: [], diagnoses: [] };
}

function writeDb(data: Schema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to db file:", error);
  }
}

export const db = {
  getTraces: (): Trace[] => readDb().traces,
  getAlerts: (): Alert[] => readDb().alerts,
  getDiagnoses: (): Diagnosis[] => readDb().diagnoses || [],

  addAlert: (alert: Alert) => {
    const current = readDb();
    current.alerts.unshift(alert);
    writeDb(current);
  },

  addDiagnosis: (diagnosis: Diagnosis) => {
    const current = readDb();
    if (!current.diagnoses) current.diagnoses = [];
    current.diagnoses.unshift(diagnosis);
    writeDb(current);
  },
  
  updateAlertStatus: (alertId: string, status: Alert["status"]) => {
    const current = readDb();
    const alert = current.alerts.find((a) => a.alertId === alertId);
    if (alert) {
      alert.status = status;
      alert.updatedAt = new Date().toISOString();
      writeDb(current);
    }
  }
};
