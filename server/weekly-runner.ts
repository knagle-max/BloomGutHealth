import { Worker } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import type { WeeklyRequest, WeeklyPlan } from "../shared/weekly-planner";
import type { DietaryPreferences } from "../shared/meal-intelligence";
import type { PrecisionReport } from "../shared/precision-nutrition";
let active = 0;
// Keep CPU-heavy search off the HTTP event loop. Bound parallel work and memory on small hosts.
export async function runWeeklyPlanning(
  input: WeeklyRequest,
  preferences: DietaryPreferences,
  report: PrecisionReport,
): Promise<WeeklyPlan> {
  if (active >= 2) throw Error("PLANNING_BUSY");
  active++;
  try {
    const source = import.meta.url.endsWith(".ts");
    let developmentCode: string | undefined;
    if (source) {
      const { build } = await import("esbuild");
      const compiled = await build({
        entryPoints: [
          fileURLToPath(new URL("./weekly-worker.ts", import.meta.url)),
        ],
        bundle: true,
        write: false,
        platform: "node",
        format: "cjs",
        packages: "external",
      });
      developmentCode = compiled.outputFiles[0].text;
    }
    return await new Promise<WeeklyPlan>((resolve, reject) => {
      const options = {
        workerData: { input, preferences, report },
        execArgv: [],
        resourceLimits: { maxOldGenerationSizeMb: 128 },
      };
      const worker = developmentCode
        ? new Worker(developmentCode, { ...options, eval: true })
        : new Worker(new URL("./weekly-worker.js", import.meta.url), options);
      const timer = setTimeout(() => {
        void worker.terminate();
        reject(Error("PLANNING_TIMEOUT"));
      }, 45000);
      worker.once("message", (result) => {
        clearTimeout(timer);
        if (result.ok) resolve(result.plan);
        else reject(Error(result.message));
        void worker.terminate();
      });
      worker.once("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      worker.once("exit", (code) => {
        clearTimeout(timer);
        if (code !== 0) reject(Error("Planner stopped before completion."));
      });
    });
  } finally {
    active--;
  }
}
