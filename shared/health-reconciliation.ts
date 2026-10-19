import { z } from "zod";
import { healthObservationKey, healthObservationSchema, type HealthObservation } from "./health-ingestion";

/**
 * Consent is provider- and metric-specific. A native adapter must request
 * OS permissions independently; an app toggle is not OS authorization.
 * This module only accepts validated data already obtained lawfully.
 */
export const healthImportConsentSchema = z.object({
  provider: z.enum(["apple_health", "health_connect"]),
  allowedKinds: z.array(z.enum(["steps", "heart_rate", "body_mass", "sleep"])).max(4),
  grantedAt: z.string().datetime({ offset: true }),
  revokedAt: z.string().datetime({ offset: true }).nullable(),
}).strict().superRefine((value, ctx) => {
  if (new Set(value.allowedKinds).size !== value.allowedKinds.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["allowedKinds"], message: "Duplicate metric permission" });
  }
  if (value.revokedAt && Date.parse(value.revokedAt) < Date.parse(value.grantedAt)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["revokedAt"], message: "Revocation precedes consent" });
  }
});

export type HealthImportConsent = z.infer<typeof healthImportConsentSchema>;
export type HealthReconciliation = {
  accepted: HealthObservation[];
  replayed: number;
  rejected: number;
  conflicts: number;
};

/**
 * Deterministic, all-or-nothing batch validation. Source record IDs are
 * NOT trusted as globally unique; callers must enforce account scope.
 *
 * Conflicting payloads with an identical revision are rejected rather than
 * silently accepting one. Different source revisions replace earlier ones.
 * Cross-provider measurements are intentionally never summed or merged.
 */
export function reconcileHealthBatch(
  existing: readonly HealthObservation[],
  candidate: readonly unknown[],
  consents: readonly HealthImportConsent[],
  now: Date,
): HealthReconciliation {
  if (candidate.length > 1000) throw new Error("HEALTH_BATCH_LIMIT");
  const validated = candidate.map(item => healthObservationSchema.parse(item));
  const approved = consents.map(item => healthImportConsentSchema.parse(item));
  const active = new Map(approved.filter(c => !c.revokedAt || Date.parse(c.revokedAt) > now.getTime())
    .map(c => [c.provider, new Set(c.allowedKinds)]));
  const state = new Map(existing.map(item => [healthObservationKey(healthObservationSchema.parse(item)), item]));
  const accepted = new Map<string, HealthObservation>();
  let replayed = 0, rejected = 0, conflicts = 0;
  for (const item of validated) {
    if (item.source.provider === "manual" || !active.get(item.source.provider)?.has(item.kind) ||
      Date.parse(item.receivedAt) > now.getTime() + 5 * 60_000) {
      rejected++;
      continue;
    }
    const key = healthObservationKey(item);
    const prior = state.get(key);
    if (prior && prior.source.sourceRevision === item.source.sourceRevision) {
      if (JSON.stringify(prior) === JSON.stringify(item)) replayed++;
      else conflicts++;
      continue;
    }
    // Revision identifiers are opaque, never ordered lexicographically.
    // An authenticated connector must establish the revision sequence.
    state.set(key, item);
    accepted.set(key, item);
  }
  return { accepted: Array.from(accepted.values()), replayed, rejected, conflicts };
}
