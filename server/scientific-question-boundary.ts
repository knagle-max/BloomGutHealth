import { createHash } from 'node:crypto';
import { z } from 'zod';
import { geminiScienceResearchRequestSchema, type GeminiScienceResearchRequest } from './gemini-science-research';

/** Server-only boundary. A private investigator may nominate a public research
 * task, but cannot write any part of the outbound question or source excerpts.
 * Catalog approval is a separate original-source/privacy review, not AI output.
 * No catalog is installed here and this module never invokes a provider. */
const taskSchema = z.object({
  request: geminiScienceResearchRequestSchema,
  review: z.object({
    id: z.string().min(1).max(120),
    scope: z.literal('broad-nonpersonal-question-and-public-excerpts'),
    approvedDigest: z.string().regex(/^[a-f0-9]{64}$/),
    validUntil: z.string().datetime(),
    withdrawn: z.boolean(),
  }).strict(),
}).strict();
export type ReviewedPublicResearchTask = z.infer<typeof taskSchema>;
const nominationSchema = z.object({
  taskId: z.string().regex(/^[a-zA-Z0-9:_-]{5,90}$/),
}).strict();

// Hash parsed, stable field order; source order remains part of the review.
export function publicResearchTaskDigest(request: GeminiScienceResearchRequest): string {
  return createHash('sha256').update(JSON.stringify(geminiScienceResearchRequestSchema.parse(request))).digest('hex');
}

export class ScientificQuestionUnavailable extends Error {
  constructor() { super('No current reviewed nonpersonal research task is available.'); }
}

/** Exactly one independently general question per call. Never concatenate
 * private selections into a distinctive joint profile. Private facts, account
 * IDs, medications, rare combinations and source text cannot enter the DTO.
 * This is not an anonymizer: an unreviewed new question must abstain. */
export function selectReviewedPublicResearchTask(
  nomination: unknown,
  catalog: readonly ReviewedPublicResearchTask[],
  now = Date.now(),
): GeminiScienceResearchRequest {
  const chosen = nominationSchema.safeParse(nomination);
  if (!chosen.success || !Number.isFinite(now)) throw new ScientificQuestionUnavailable();
  const matches = catalog.filter(task => task?.request?.taskId === chosen.data.taskId);
  if (matches.length !== 1) throw new ScientificQuestionUnavailable();
  const parsed = taskSchema.safeParse(matches[0]);
  if (!parsed.success) throw new ScientificQuestionUnavailable();
  const { request, review } = parsed.data;
  if (review.withdrawn || Date.parse(review.validUntil) <= now ||
      publicResearchTaskDigest(request) !== review.approvedDigest ||
      new Set(request.sources.map(source => source.sourceId)).size !== request.sources.length) {
    throw new ScientificQuestionUnavailable();
  }
  // Return a detached object; callers cannot mutate the approved catalog.
  return structuredClone(request);
}
