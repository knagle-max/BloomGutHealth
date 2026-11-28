/** Operator-only auxiliary command; never replace Render's normal start command. */
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { stagingCallerEnvironment } from "./staging-environment.mjs";

export async function runStagingCaller({ approvedNetworkCheck = false, environment = process.env, spawnChild = spawn } = {}) {
  const childEnv = stagingCallerEnvironment(environment);
  if (!approvedNetworkCheck) return { status: "configuration-checked-no-network", identifyingValuesReleased: false };
  const child = spawnChild(process.execPath, [fileURLToPath(new URL("./reference-probe.mjs", import.meta.url))],
    { env: childEnv, stdio: "ignore", shell: false });
  return await new Promise(resolve => {
    let done = false;
    const finish = passed => {
      if (done) return;
      done = true; clearTimeout(timer);
      resolve({ status: passed ? "synthetic-reference-passed" : "synthetic-reference-unavailable", identifyingValuesReleased: false });
    };
    const timer = setTimeout(() => { child.kill("SIGKILL"); finish(false); }, 90000);
    child.once("error", () => finish(false));
    child.once("exit", code => finish(code === 0));
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await runStagingCaller({ approvedNetworkCheck: process.argv.includes("--approved-synthetic-network-check") });
    console.log(JSON.stringify(result));
    process.exitCode = result.status === "synthetic-reference-unavailable" ? 2 : 0;
  } catch { console.error("Staging caller configuration unavailable; identifying values withheld."); process.exitCode = 2; }
}
