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

async function runSimulation() {
  console.log("Starting simulated agent run...");
  initTelemetry("checkout-agent-simulator");

  try {
    await traceAgentRun("checkout-agent", "development", async () => {
      console.log("- Started agent run trace");

      // Step 1: Retrieval
      await traceStep("fetch-inventory", "retrieval", async (span) => {
        console.log("  - Fetching inventory...");
        await new Promise((resolve) => setTimeout(resolve, 200));
        recordRetrievalUsage(span, "search: item_id=9821", 5, "inventory-v2");
      });

      // Step 2: LLM Plan
      await traceStep("plan-next-action", "llm", async (span) => {
        console.log("  - Planning next action via LLM...");
        await new Promise((resolve) => setTimeout(resolve, 400));
        recordLLMUsage(span, "gpt-4o-mini", 350, 120, 0.002);
      });

      // Step 3: Tool execution (Simulated failure if requested)
      const shouldFail = process.argv.includes("--fail");
      await traceStep("apply-discount-code", "tool", async (span) => {
        console.log("  - Executing apply-discount tool...");
        recordToolUsage(span, "discount_applicator", JSON.stringify({ code: "SUMMER25", cartValue: 120 }));
        
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        if (shouldFail) {
          throw new Error("Failed to contact payment gateway: connection timeout.");
        }
      });

      // Step 4: Final output
      await traceStep("generate-response", "llm", async (span) => {
        console.log("  - Generating response via LLM...");
        await new Promise((resolve) => setTimeout(resolve, 500));
        recordLLMUsage(span, "gpt-4o-mini", 600, 150, 0.0035);
      });
      
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

runSimulation();
