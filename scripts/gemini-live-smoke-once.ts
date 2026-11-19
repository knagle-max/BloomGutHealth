/**
 * ONE-TIME operator-authorized smoke test, no routes and no personal data.
 * Remove this file and package.json startup hook immediately after inspection.
 * Source descriptions below are independently authored, non-quoted scientific summaries:
 *  - Collins et al., Nat Rev Microbiol (2023), DOI 10.1038/s41579-022-00805-x
 *  - Fecal Bile Acids and Neutral Sterols Are Associated with Latent Microbial
 *    Subgroups in the Human Gut (2022), DOI 10.3390/metabo12090846
 */
import { Pool } from "pg";
import { SpendLedger, postgresSpendTransaction } from "../server/spend-ledger";
import { sessionSecret } from "../server/security";
import { investigatePublishedScienceWithGemini } from "../server/gemini-science-research";

const label = "bloom-gemini-live-smoke-20261118";
const receipt = (stage: string, payload: Record<string, unknown> = {}) =>
  console.log("[BLOOM_GEMINI_SMOKE] " + JSON.stringify({ stage, ...payload }));
const requestId = "bloom-gemini-bile-20261118-onecall";
const question = "What nonpersonal published evidence distinguishes microbial bile-acid deconjugation and dehydroxylation from host and dietary influences on the bile-acid pool? Compare mechanistic hypotheses with observational human evidence, highlight contradictory or null findings and distinguish association from causal personalized inference.";
const sources = [
  {
    sourceId: "doi:10.1038/s41579-022-00805-x",
    title: "Bile acids and the gut microbiota: metabolic interactions and impacts on disease",
    doi: "10.1038/s41579-022-00805-x",
    excerpt: "Author-written research synopsis (not copied publication text): This review describes bacterial bile salt hydrolase deconjugation and further dehydroxylation as distinct microbial pathways, while host synthesis, intestinal absorption, dietary composition and antibiotics also affect circulating and intestinal bile-acid pools. Results derived from animal and biochemical models cannot establish individual human metabolic effects.",
    evidenceClass: "review" as const,
    status: "source-reviewed-for-research" as const,
    rights: "approved-for-provider-research" as const,
  },
  {
    sourceId: "doi:10.3390/metabo12090846",
    title: "Fecal Bile Acids and Neutral Sterols Are Associated with Latent Microbial Subgroups in the Human Gut",
    doi: "10.3390/metabo12090846",
    excerpt: "Author-written research synopsis (not copied publication text): A cross-sectional study of 1,280 KORA FF4 participants measured fecal bile-acid metabolites and analyzed associations with microbial community subgroups. Several microbial groups were associated in different directions with fecal bile acids. These observational correlations do not show that a particular bacterium caused a metabolite change or that a clinical intervention would help an individual.",
    evidenceClass: "human-observational" as const,
    status: "source-reviewed-for-research" as const,
    rights: "approved-for-provider-research" as const,
  },
];
async function run() {
  receipt("preflight", { serviceCommit: process.env.RENDER_GIT_COMMIT ?? "unavailable", sample: "nonpersonal-public-literature", keyConfigured: !!process.env.GEMINI_API_KEY?.trim(), normalFeatureFlag: process.env.BLOOM_GEMINI_PUBLIC_SCIENCE_ENABLED === "true" ? "enabled" : "disabled" });
  if (!process.env.GEMINI_API_KEY?.trim()) { receipt("blocked", { reason: "missing_key" }); return; }
  if (!process.env.DATABASE_URL?.trim()) { receipt("blocked", { reason: "missing_database_url" }); return; }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000, query_timeout: 5000 });
  try {
    const found = await pool.query("SELECT to_regclass('public.ai_spend_requests') IS NOT NULL AS ledger_ready");
    if (found.rows[0]?.ledger_ready !== true) { receipt("blocked", { reason: "atomic_spend_ledger_table_missing" }); return; }
    const ledger = new SpendLedger(postgresSpendTransaction(pool), sessionSecret());
    let providerHttpStatus: number | null = null;
    let providerRequested = false;
    const fetcher: typeof fetch = async (input, init) => {
      if (providerRequested) throw new Error("one_call_limit");
      providerRequested = true;
      const result = await fetch(input, init);
      providerHttpStatus = result.status;
      return result;
    };
    try {
      const result = await investigatePublishedScienceWithGemini({
        question,
        taskId: "bile-acid-smoke-public-20261118",
        sources,
        declaredDataClass: "nonpersonal-published-science",
        approvedForUnpaidGoogleProcessing: true,
      }, {
        env: { ...process.env, BLOOM_GEMINI_PUBLIC_SCIENCE_ENABLED: "true" },
        fetcher, ledger, requestId, timeoutMs: 12000,
      });
      receipt("result", {
        status: "PASS", providerHttpStatus, actualProviderCall: providerRequested,
        model: result.model, sourceSetSha256: result.sourceSetSha256,
        provider: result.provider, candidateStatus: result.status,
        usage: result.usage, estimatedReservedAndSettledUsd: 0.01,
        review: "candidate_only_not_personal_not_approved_knowledge",
        claims: result.claims,
      });
    } catch (error) {
      const safeError = error instanceof Error ? error.message : "unclassified";
      const safeCategories = [
        "Gemini research is not configured or approved.",
        "Server-side spend ledger and idempotency ID are required.",
        "Nonpersonal, rights-reviewed source payload is required.",
        "Research spend limit or duplicate request.",
        "Gemini provider request unsuccessful.",
        "Gemini transport unavailable.",
        "Provider response was not valid JSON.",
        "Candidate was not valid structured JSON.",
        "Candidate schema or research question mismatch.",
        "Unexpected Gemini response schema.",
        "Candidate cited an unknown scientific source.",
        "Could not settle Gemini spend reservation.",
      ];
      receipt("result", { status: "FAIL", providerHttpStatus, actualProviderCall: providerRequested,
        reason: safeCategories.includes(safeError) ? safeError : "ledger_or_transport_failure", sourceCount: sources.length });
    }
  } catch {
    receipt("blocked", { reason: "ledger_connection_or_schema_unavailable" });
  } finally {
    await pool.end().catch(() => {});
  }
}
await run().catch(() => receipt("blocked", { reason: "unexpected_preflight_failure" }));
