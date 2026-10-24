import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyHealthRevision,
  healthObservationKey,
  healthObservationSchema,
} from "../shared/health-ingestion.js";

const example = {
  kind: "steps" as const,
  source: { provider: "apple_health" as const, deviceId: "watch-1", recordId: "item-7", sourceRevision: "1" },
  startAt: "2026-10-17T09:00:00-06:00",
  endAt: "2026-10-17T10:00:00-06:00",
  receivedAt: "2026-10-17T10:05:00-06:00",
  value: 1250,
  unit: "count" as const,
};

test("canonical observation validates bounded values and offset timestamps", () => {
  assert.equal(healthObservationSchema.parse(example).value, 1250);
  assert.equal(healthObservationSchema.safeParse({ ...example, value: -1 }).success, false);
  assert.equal(healthObservationSchema.safeParse({ ...example, value: 1e9 }).success, false);
  assert.equal(healthObservationSchema.safeParse({ ...example, startAt: "2026-10-17T09:00:00" }).success, false);
  assert.equal(healthObservationSchema.safeParse({ ...example, endAt: example.startAt }).success, false);
  assert.equal(healthObservationSchema.safeParse({ ...example, secret: "unsafe extra" }).success, false);
});

test("retries are idempotent, changes are versioned and different devices stay separate", () => {
  const parsed = healthObservationSchema.parse(example);
  assert.equal(classifyHealthRevision(undefined, parsed), "new");
  assert.equal(classifyHealthRevision(parsed, parsed), "replay");
  const newer = healthObservationSchema.parse({ ...example, source: { ...example.source, sourceRevision: "2" } });
  assert.equal(classifyHealthRevision(parsed, newer), "replace");
  const another = healthObservationSchema.parse({ ...example, source: { ...example.source, deviceId: "watch-2" } });
  assert.notEqual(healthObservationKey(parsed), healthObservationKey(another));
  assert.equal(classifyHealthRevision(parsed, another), "new");
});

test("sleep observations cannot exceed their interval", () => {
  assert.equal(healthObservationSchema.safeParse({
    ...example, kind: "sleep", unit: "minutes", stage: "asleep", value: 90,
  }).success, false);
});
