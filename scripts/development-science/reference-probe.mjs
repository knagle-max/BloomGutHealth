/** Fixed synthetic probe, invoked only as an explicitly approved auxiliary child. */
import { createDevelopmentScienceClient } from "./client.mjs";
try {
  const client = createDevelopmentScienceClient();
  const submitted = await client.submitReference("baseline");
  const end = performance.now() + 60000;
  let passed = false;
  while (performance.now() < end) {
    const result = await client.referenceStatus(submitted.id);
    if (result.state === "completed") {
      passed = result.result.status === "optimal" && result.result.personalUsePermitted === false;
      break;
    }
    if (!["running", "cancelling"].includes(result.state)) break;
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  if (!passed) throw Error("Reference check unavailable");
  process.exitCode = 0;
} catch { process.exitCode = 2; }
