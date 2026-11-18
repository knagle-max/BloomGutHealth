/**
 * Gemini science research adapter — nonpersonal candidate generation ONLY.
 *
 * Deliberately NOT a second user-facing AI stack or metered clinical gateway.
 * This is a dependency-injected provider transport for the existing scientific
 * investigation workstream. A future integration into server/metered-ai.ts MUST
 * have independent Gemini usage/tariff/circuit/account-consent review.
 *
 * No per-account labs, profiles, medications, genomes, prompt archives, training
 * corpus, auto-approved claims, or consumer inference is permitted here.
 */
import { createHash } from "node:crypto";
import { z } from "zod";

export const geminiScienceSourceSchema = z.object({
  sourceId: z.string().min(1).max(128),
  title: z.string().min(1).max(400),
  doi: z.string().max(140).optional(),
  excerpt: z.string().min(1).max(3200),
  evidenceClass: z.enum(["human-intervention","human-observational","animal","in-vitro","review","curated-reference"]),
  status: z.literal("source-reviewed-for-research"),
  rights: z.literal("approved-for-provider-research"),
}).strict();

export const geminiScienceResearchRequestSchema = z.object({
  question: z.string().min(12).max(1100),
  sources: z.array(geminiScienceSourceSchema).min(1).max(6),
  taskId: z.string().regex(/^[a-zA-Z0-9:_-]{5,90}$/),
  declaredDataClass: z.literal("nonpersonal-published-science"),
  approvedForUnpaidGoogleProcessing: z.literal(true),
}).strict();

const claimSchema = z.object({
  claim: z.string().min(12).max(650),
  evidenceSourceIds: z.array(z.string()).min(1).max(6),
  uncertainty: z.string().min(6).max(400),
  hypothesis: z.boolean(),
}).strict();
export const geminiScienceCandidateSchema = z.object({
  question: z.string().min(12).max(1100),
  hypotheses: z.array(claimSchema).max(4),
  contradictingFindings: z.array(claimSchema).max(4),
  unansweredQuestions: z.array(z.string().max(250)).max(4),
}).strict();
export type GeminiScienceResearchRequest = z.infer<typeof geminiScienceResearchRequestSchema>;
export type GeminiScienceCandidate = z.infer<typeof geminiScienceCandidateSchema>;
export type GeminiScienceResearchResult = {
  status: "candidate_unreviewed";
  provider: "google-gemini";
  model: string;
  sourceSetSha256: string;
  taskId: string;
  claims: GeminiScienceCandidate;
  usage: { inputTokens: number | null; outputTokens: number | null };
  noKnowledgePromotion: true;
};

export class GeminiResearchUnavailable extends Error {
  constructor(message = "Gemini research is not configured or approved.") { super(message); this.name = "GeminiResearchUnavailable"; }
}
export type GeminiScienceOptions = {
  env?: Record<string, string | undefined>;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};
const allowedModels = new Set(["gemini-2.5-flash", "gemini-2.5-flash-lite"]);
const endpointRoot = "https://generativelanguage.googleapis.com/v1beta/models/";

export async function investigatePublishedScienceWithGemini(
  untrusted: unknown,
  options: GeminiScienceOptions = {},
): Promise<GeminiScienceResearchResult> {
  const env = options.env ?? process.env;
  if (env.BLOOM_GEMINI_PUBLIC_SCIENCE_ENABLED !== "true" || !env.GEMINI_API_KEY) {
    throw new GeminiResearchUnavailable();
  }
  const model = env.BLOOM_GEMINI_RESEARCH_MODEL ?? "gemini-2.5-flash";
  if (!allowedModels.has(model)) throw new GeminiResearchUnavailable("Model is not on the reviewed allowlist.");
  const parsed = geminiScienceResearchRequestSchema.safeParse(untrusted);
  if (!parsed.success) throw new GeminiResearchUnavailable("Nonpersonal, rights-reviewed source payload is required.");
  const request = parsed.data;
  // For free-tier operation, no personal data are permitted. This schema
  // intentionally carries NO accountId, user history, patient fields or URLs.
  // API calls are made only from the server; keys never enter URLs/logs.
  const sourceIds = new Set(request.sources.map(x => x.sourceId));
  if (sourceIds.size !== request.sources.length) throw new GeminiResearchUnavailable("Duplicate scientific source IDs.");

  const sourceDigest = createHash("sha256").update(JSON.stringify(request.sources)).digest("hex");
  const systemInstruction = [
    "You are an experimental scientific source-analysis assistant, not a clinical advisor.",
    "Analyze ONLY the provided published nonpersonal source excerpts.",
    "Form plausible competing research hypotheses and identify contradictions and null findings.",
    "Every claim MUST cite provided evidenceSourceIds. Never invent IDs, citations, measured results or clinical effects.",
    "If evidence is absent, say that it is unknown. Do not provide personalized medical advice or dosing.",
    "Your output is an UNREVIEWED RESEARCH CANDIDATE. It does not become Bloom scientific knowledge.",
  ].join(" ");
  const userContent = JSON.stringify({
    question: request.question,
    sources: request.sources.map(({sourceId,title,doi,excerpt,evidenceClass})=>({sourceId,title,doi,excerpt,evidenceClass})),
    outputContract: {
      question: "string",
      hypotheses: [{claim:"string",evidenceSourceIds:["sourceId"],uncertainty:"string",hypothesis:true}],
      contradictingFindings: [{claim:"string",evidenceSourceIds:["sourceId"],uncertainty:"string",hypothesis:false}],
      unansweredQuestions: ["string"],
    },
  });
  const payload = {
    systemInstruction: {parts:[{text:systemInstruction}]},
    contents:[{role:"user",parts:[{text:userContent}]}],
    generationConfig:{responseMimeType:"application/json",temperature:0.2,maxOutputTokens:1300},
  };
  if (Buffer.byteLength(JSON.stringify(payload),"utf8") > 25_000) throw new GeminiResearchUnavailable("Research request exceeds byte limit.");
  const controller = new AbortController();
  const timeoutMs = Math.min(Math.max(options.timeoutMs ?? 12_000,1000),20_000);
  const deadline = setTimeout(()=>controller.abort(),timeoutMs);
  try {
    const response = await (options.fetcher ?? fetch)(
      endpointRoot + encodeURIComponent(model) + ":generateContent",
      {method:"POST",redirect:"error",signal:controller.signal,headers:{
        "Content-Type":"application/json",
        "x-goog-api-key":env.GEMINI_API_KEY,
      },body:JSON.stringify(payload)},
    );
    if (!response.ok) throw new GeminiResearchUnavailable("Gemini provider request unsuccessful.");
    const length = Number(response.headers.get("content-length") ?? 0);
    if (length > 40_000) throw new GeminiResearchUnavailable("Gemini response exceeds size cap.");
    const rawBody = await response.text();
    if (Buffer.byteLength(rawBody,"utf8") > 40_000) throw new GeminiResearchUnavailable("Gemini response exceeds size cap.");
    let decoded: unknown;
    try { decoded = JSON.parse(rawBody); } catch { throw new GeminiResearchUnavailable("Provider response was not valid JSON."); }
    const responseSchema = z.object({
      candidates: z.array(z.object({content:z.object({parts:z.array(z.object({text:z.string()}).passthrough()).min(1)})})).min(1),
      usageMetadata: z.object({promptTokenCount:z.number().int().nonnegative().optional(),candidatesTokenCount:z.number().int().nonnegative().optional()}).optional(),
    }).passthrough();
    const provider = responseSchema.safeParse(decoded);
    if (!provider.success) throw new GeminiResearchUnavailable("Unexpected Gemini response schema.");
    const modelText = provider.data.candidates[0].content.parts.map(x=>x.text).join("");
    let parsedResponse: unknown;
    try { parsedResponse = JSON.parse(modelText); } catch { throw new GeminiResearchUnavailable("Candidate was not valid structured JSON."); }
    const candidate = geminiScienceCandidateSchema.safeParse(parsedResponse);
    if (!candidate.success || candidate.data.question !== request.question)
      throw new GeminiResearchUnavailable("Candidate schema or research question mismatch.");
    for (const claim of [...candidate.data.hypotheses,...candidate.data.contradictingFindings]) {
      if (!claim.evidenceSourceIds.every(id=>sourceIds.has(id)))
        throw new GeminiResearchUnavailable("Candidate cited an unknown scientific source.");
    }
    return {
      status:"candidate_unreviewed",provider:"google-gemini",model,sourceSetSha256:sourceDigest,
      taskId:request.taskId,claims:candidate.data,
      usage:{inputTokens:provider.data.usageMetadata?.promptTokenCount??null,outputTokens:provider.data.usageMetadata?.candidatesTokenCount??null},
      noKnowledgePromotion:true,
    };
  } catch (error) {
    if (error instanceof GeminiResearchUnavailable) throw error;
    throw new GeminiResearchUnavailable("Gemini transport unavailable.");
  } finally {clearTimeout(deadline);}
}
