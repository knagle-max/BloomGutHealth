import { parentPort, workerData } from "node:worker_threads";
import { buildWeeklyPlan } from "../shared/weekly-planner";
try {
  const plan = buildWeeklyPlan(
    workerData.input,
    workerData.preferences,
    workerData.report,
  );
  parentPort!.postMessage({ ok: true, plan });
} catch (error) {
  parentPort!.postMessage({
    ok: false,
    message:
      error instanceof Error ? error.message : "Plan could not be calculated.",
  });
}
