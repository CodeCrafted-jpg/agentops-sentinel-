import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" }); // Fallback if local doesn't exist

import {
  initTelemetry,
  shutdownTelemetry,
  traceAgentRun,
  traceStep,
  recordLLMUsage,
  recordRetrievalUsage,
  recordToolUsage,
} from "../packages/telemetry/src/otel";
import fs from "fs/promises";
import path from "path";

async function fetchRealWeather(city: string) {
  // Simulate a real API call
  await new Promise((resolve) => setTimeout(resolve, 800));
  if (city === "Atlantis") {
    throw new Error("City 'Atlantis' not found in weather database.");
  }
  return { temp: 22, condition: "Sunny" };
}

async function analyzeWithLLM(data: any) {
  // Simulate calling an LLM
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return `The weather is ${data.condition} and ${data.temp} degrees.`;
}

async function runRealAgent() {
  console.log("Starting real agent run...");
  initTelemetry("weather-agent-prod");

  const city = process.argv.includes("--fail") ? "Atlantis" : "San Francisco";

  try {
    await traceAgentRun("weather-agent", "production", async () => {
      console.log("- Started agent run trace");

      // Step 1: Retrieval
      const weatherData = await traceStep("fetch-weather-api", "tool", async (span) => {
        console.log(`  - Fetching weather for ${city}...`);
        recordToolUsage(span, "weather_api", JSON.stringify({ city }));
        
        try {
          const result = await fetchRealWeather(city);
          span.setAttribute("weather.temp", result.temp);
          return result;
        } catch (err: any) {
          throw new Error(`Weather API failure: ${err.message}`);
        }
      });

      // Step 2: LLM
      const summary = await traceStep("generate-summary", "llm", async (span) => {
        console.log("  - Generating summary via LLM...");
        const result = await analyzeWithLLM(weatherData);
        recordLLMUsage(span, "command-r", 150, 50, 0.001);
        return result;
      });

      console.log("Agent output:", summary);
      console.log("Agent run completed successfully!");
    });
  } catch (err: any) {
    console.error("Agent run failed during execution:", err.message);
  } finally {
    console.log("Shutting down telemetry SDK...");
    await shutdownTelemetry();
    console.log("Done.");
  }
}

runRealAgent();
