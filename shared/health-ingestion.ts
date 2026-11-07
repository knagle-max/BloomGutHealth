import { z } from "zod";

/**
 * Internal-only v0.5 ingestion boundary. Does not connect to HealthKit or
 * Health Connect, and does not authorize importing data without user consent.
 * All timestamps must carry offsets. Never interpret activity energy as food.
 */
const offsetInstant = z.string().datetime({ offset: true });
const source = z.object({
  provider: z.enum(["apple_health", "health_connect", "manual"]),
  deviceId: z.string().trim().min(1).max(160),
  recordId: z.string().trim().min(1).max(256),
  sourceRevision: z.string().trim().min(1).max(120),
}).strict();

const base = z.object({
  source,
  startAt: offsetInstant,
  endAt: offsetInstant,
  receivedAt: offsetInstant,
}).strict();

const steps = base.extend({
  kind: z.literal("steps"),
  value: z.number().int().nonnegative().max(500000),
  unit: z.literal("count"),
});

const heartRate = base.extend({
  kind: z.literal("heart_rate"),
  value: z.number().finite().positive().max(350),
  unit: z.literal("beats/min"),
});

const bodyMass = base.extend({
  kind: z.literal("body_mass"),
  value: z.number().finite().positive().max(500),
  unit: z.literal("kg"),
});

// Device-sourced measurements are canonicalized to explicit SI units.
// Distance is an interval measurement, not a guaranteed unique daily total.
// Hydration is recorded intake and must never be inferred from activity.
const distance = base.extend({
  kind: z.literal("distance"),
  value: z.number().finite().nonnegative().max(1000000),
  unit: z.literal("m"),
});
const hydration = base.extend({
  kind: z.literal("hydration"),
  value: z.number().finite().positive().max(20000),
  unit: z.literal("mL"),
});

const sleep = base.extend({
  kind: z.literal("sleep"),
  value: z.number().finite().nonnegative().max(1440),
  unit: z.literal("minutes"),
  stage: z.enum(["asleep", "awake", "unknown"]),
});

export const healthObservationSchema = z.discriminatedUnion("kind", [
  steps, heartRate, bodyMass, sleep, distance, hydration,
]).superRefine((observation, ctx) => {
  const start = Date.parse(observation.startAt);
  const end = Date.parse(observation.endAt);
  const received = Date.parse(observation.receivedAt);
  if (start >= end) ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: "Observation end must be later than start",
    path: ["endAt"],
  });
  if (end > received + 5 * 60_000) ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: "Observation cannot end in the future",
    path: ["endAt"],
  });
  if (observation.kind === "sleep" && observation.value > (end - start) / 60_000 + 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Sleep duration exceeds observation interval",
      path: ["value"],
    });
  }
});

export type HealthObservation = z.infer<typeof healthObservationSchema>;

/** Stable per-source replacement key; must also be scoped to the authenticated user in storage. */
export function healthObservationKey(record: HealthObservation): string {
  return JSON.stringify([
    record.source.provider,
    record.source.deviceId,
    record.source.recordId,
    record.kind,
  ]);
}

/**
 * Same source record + identical revision is replay, not a new observation.
 * Changed revision replaces the previous source version after validation.
 * Never sum across providers by default; devices can report the same event.
 */
export function classifyHealthRevision(
  previous: HealthObservation | undefined,
  incoming: HealthObservation,
): "new" | "replay" | "replace" {
  if (!previous) return "new";
  if (healthObservationKey(previous) !== healthObservationKey(incoming)) return "new";
  return previous.source.sourceRevision === incoming.source.sourceRevision
    ? "replay" : "replace";
}
