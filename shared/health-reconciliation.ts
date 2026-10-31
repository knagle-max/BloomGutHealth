import { z } from "zod";
import { healthObservationKey, healthObservationSchema, type HealthObservation } from "./health-ingestion";

/**
 * Consent is provider- and metric-specific. A native adapter must request
 * OS permissions independently; an app toggle is not OS authorization.
 * This module only accepts validated data already obtained lawfully.
 */
export const healthImportConsentSchema = z.object({
  provider: z.enum(["apple_health", "health_connect"]),
  allowedKinds: z.array(z.enum(["steps", "heart_rate", "body_mass", "sleep", "distance", "hydration"])).max(6),
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
  if (new Set(approved.map(c => c.provider)).size !== approved.length) throw new Error("HEALTH_DUPLICATE_CONSENT");
  // Consent is checked both at import and at the recorded receipt time.
  // An active permission cannot retroactively authorize previously received
  // data; equally, a future-dated receipt cannot use a revoked permission.
  const active = new Map(approved.filter(c => Date.parse(c.grantedAt) <= now.getTime() &&
    (!c.revokedAt || Date.parse(c.revokedAt) > now.getTime()))
    .map(c => [c.provider, c]));
  const state = new Map(existing.map(item => [healthObservationKey(healthObservationSchema.parse(item)), item]));
  const accepted = new Map<string, HealthObservation>();
  const seenInBatch = new Map<string, HealthObservation>();
  let replayed = 0, rejected = 0, conflicts = 0;
  for (const item of validated) {
    const consent = active.get(item.source.provider as "apple_health" | "health_connect");
    const received = Date.parse(item.receivedAt);
    if (item.source.provider === "manual" || !consent?.allowedKinds.includes(item.kind) ||
      received < Date.parse(consent.grantedAt) ||
      (consent.revokedAt !== null && received >= Date.parse(consent.revokedAt)) ||
      received > now.getTime() + 5 * 60_000) {
      rejected++;
      continue;
    }
    const key = healthObservationKey(item);
    // A single upload must not carry contradictory versions of the same record.
    // Reject any later occurrence even if it has a different revision, so
    // caller cannot silently replace the first accepted item in one batch.
    if (seenInBatch.has(key)) {
      const first = seenInBatch.get(key)!;
      if (first.source.sourceRevision === item.source.sourceRevision &&
          JSON.stringify(first) === JSON.stringify(item)) replayed++;
      else conflicts++;
      continue;
    }
    seenInBatch.set(key, item);
    const prior = state.get(key);
    if (prior && prior.source.sourceRevision === item.source.sourceRevision) {
      if (JSON.stringify(prior) === JSON.stringify(item)) replayed++;
      else conflicts++;
      continue;
    }
    // Revision IDs are opaque; reject a correction whose receipt predates
    // the stored one, rather than rolling a record back after an old retry.
    // Equal receipt times for different revisions cannot establish order.
    if (prior && Date.parse(item.receivedAt) <= Date.parse(prior.receivedAt)) {
      conflicts++;
      continue;
    }
    state.set(key, item);
    accepted.set(key, item);
  }
  return { accepted: Array.from(accepted.values()), replayed, rejected, conflicts };
}
