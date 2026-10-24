import { createHash } from "node:crypto";
import {
  researchBoundary,
  researchScenario,
  validateResearchResult,
} from "../shared/metabolite-research";
import type { WeeklyPlan } from "../shared/weekly-planner";
import type { TaxonReport } from "../shared/precision-nutrition";

export function prepareResearch(plan: WeeklyPlan, report: TaxonReport | null) {
  const scenario = researchScenario(plan, report);
  const inputHash = createHash("sha256")
    .update(JSON.stringify(scenario))
    .digest("hex");
  const blockers: string[] = [];
  if (!plan.checksPassed || !scenario.days.length)
    blockers.push("Select a saved plan that passed its nutrient checks.");
  if (!report?.taxa.length)
    blockers.push(
      "Add a supported structured microbial abundance report. Model coverage and functional suitability still require assessment.",
    );
  const configured = !!(
    process.env.METABOLITE_RESEARCH_URL && process.env.METABOLITE_RESEARCH_TOKEN
  );
  if (!configured)
    blockers.push(
      "The metabolic simulation service, curated model database and food-to-substrate mapping are not connected.",
    );
  return {
    scenario,
    inputHash,
    configured,
    blockers,
    boundary: researchBoundary,
  };
}
let active = 0;
// Only the operator-configured endpoint is contacted. No user-supplied URLs or redirects.
export async function simulateResearch(
  input: ReturnType<typeof prepareResearch>,
  fetcher = fetch,
) {
  if (input.blockers.length) return { ...input, result: null };
  const url = new URL(process.env.METABOLITE_RESEARCH_URL!);
  if (url.protocol !== "https:" || url.username || url.password)
    throw Error("RESEARCH_INVALID_URL");
  if (active >= 2) throw Error("RESEARCH_BUSY");
  active++;
  try {
    const response = await fetcher(url, {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(25000),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.METABOLITE_RESEARCH_TOKEN}`,
      },
      body: JSON.stringify({ ...input.scenario, inputHash: input.inputHash }),
    });
    if (!response.ok) throw Error("RESEARCH_SERVICE_FAILED");
    // Bound response size before JSON parsing; never relay raw provider errors.
    const reader = response.body?.getReader();
    if (!reader) throw Error("RESEARCH_EMPTY_RESPONSE");
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 256000) {
        await reader.cancel();
        throw Error("RESEARCH_RESPONSE_TOO_LARGE");
      }
      chunks.push(value);
    }
    const result = validateResearchResult(
      JSON.parse(Buffer.concat(chunks).toString("utf8")),
      input.inputHash,
      input.scenario.days.map((d) => d.day),
    );
    return { ...input, result };
  } finally {
    active--;
  }
}
