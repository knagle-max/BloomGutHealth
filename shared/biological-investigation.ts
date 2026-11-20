import { z } from 'zod';
import {investigationNumericClaimSchema,verifyInvestigationNumericClaims,type InvestigationLabNumericFact} from './investigation-numeric-facts';

/** Research contract only. Provider output cannot declare itself verified,
 * prescribe an action, assert a diagnosis or choose its own release tier. */
const id = z.string().min(1).max(128);
const ids = z.array(id).max(24).refine(values => new Set(values).size === values.length, 'Duplicate references');
const hypothesis = z.object({
  id,
  explanation: z.string().min(12).max(900),
  observationIds: ids,
  supportingEvidenceIds: ids,
  contradictingEvidenceIds: ids,
  distinguishingObservations: z.array(z.string().min(6).max(400)).min(1).max(4),
  materialUnknowns: z.array(z.string().min(6).max(400)).min(1).max(6),
  confidence: z.enum(['unresolved','tentative']),
}).strict().refine(value => !value.supportingEvidenceIds.some(id => value.contradictingEvidenceIds.includes(id)), 'Evidence must have an explicit direction per hypothesis');
export const biologicalInvestigationCandidateSchema = z.object({
  snapshotId: id,
  sourceEpoch: z.string().min(1).max(4096),
  evidenceVersion: id,
  hypotheses: z.array(hypothesis).max(4),
  numericClaims:z.array(investigationNumericClaimSchema).max(12).optional(),
  synthesis: z.object({
    finding: z.string().min(12).max(900),
    hypothesisIds: ids,
    abstention: z.boolean(),
    limits: z.array(z.string().min(6).max(400)).min(1).max(6),
  }).strict(),
}).strict();
export type BiologicalInvestigationCandidate = z.infer<typeof biologicalInvestigationCandidateSchema>;
export type InvestigationGroundingContext = {
  accountScope: string;
  purpose: 'personal-wellness';
  permitted: boolean;
  snapshotId: string;
  sourceEpoch: string;
  evidenceVersion: string;
  observationIds: readonly string[];
  numericFacts?:readonly InvestigationLabNumericFact[];
  /** Eligible source/claim IDs from current rights-reviewed retrieval, never
   * the complete graph or a model-provided citation list. */
  eligibleEvidenceIds: readonly string[];
};

/** Reference/freshness gate, not a scientific truth checker. Claims still need
 * independent excerpt/applicability/safety verification. This never yields a
 * ConsumerValueCandidate or authorizes display of a personal interpretation. */
export function groundInvestigationCandidate(
  untrusted: unknown, actor: string, current: InvestigationGroundingContext,
): { state:'research-only-unverified'; candidate:BiologicalInvestigationCandidate } | { state:'abstain'; reason:'permission'|'invalid-contract'|'stale-snapshot'|'unresolved-reference'|'unverified-numeric-fact' } {
  if (!actor || current.accountScope !== actor || current.purpose !== 'personal-wellness' || !current.permitted)
    return {state:'abstain',reason:'permission'};
  const parsed = biologicalInvestigationCandidateSchema.safeParse(untrusted);
  if (!parsed.success) return {state:'abstain',reason:'invalid-contract'};
  const value = parsed.data;
  if (value.snapshotId !== current.snapshotId || value.sourceEpoch !== current.sourceEpoch || value.evidenceVersion !== current.evidenceVersion)
    return {state:'abstain',reason:'stale-snapshot'};
  const observations = new Set(current.observationIds), evidence = new Set(current.eligibleEvidenceIds);
  const hypotheses = new Set(value.hypotheses.map(hypothesis=>hypothesis.id));
  if (hypotheses.size !== value.hypotheses.length ||
      value.hypotheses.some(hypothesis => hypothesis.observationIds.some(id=>!observations.has(id)) ||
        [...hypothesis.supportingEvidenceIds,...hypothesis.contradictingEvidenceIds].some(id=>!evidence.has(id))) ||
      value.synthesis.hypothesisIds.some(id=>!hypotheses.has(id)) ||
      (!value.synthesis.abstention && !value.synthesis.hypothesisIds.length))
    return {state:'abstain',reason:'unresolved-reference'};
  if(!verifyInvestigationNumericClaims(value.numericClaims??[],current.numericFacts,current.observationIds))return {state:'abstain',reason:'unverified-numeric-fact'};
  return {state:'research-only-unverified',candidate:value};
}
