import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import {
  biologyVersions,
  biologyEntities,
  biologyRelationships,
  biologySources,
  biologyRelationshipSources,
} from "../shared/schema";
import {
  BIOLOGY_VERSION,
  biologicalRegistrySchema,
  validateRegistry,
  type BiologicalRegistry,
} from "../shared/biological-model";
import type { db as applicationDatabase } from "./db";
export function registryFingerprint(value: BiologicalRegistry) {
  const registry = biologicalRegistrySchema.parse(value);
  const sort = <T extends { id: string }>(values: T[]) =>
    [...values].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const canonical = {
    ...registry,
    entities: sort(registry.entities),
    relationships: sort(
      registry.relationships.map((r) => ({
        ...r,
        sourceIds: [...r.sourceIds].sort(),
      })),
    ),
    sources: sort(registry.sources),
  };
  const stable = (v: any): any =>
    Array.isArray(v)
      ? v.map(stable)
      : v && typeof v === "object"
        ? Object.fromEntries(
            Object.keys(v)
              .sort()
              .map((k) => [k, stable(v[k])]),
          )
        : v;
  return createHash("sha256")
    .update(JSON.stringify(stable(canonical)))
    .digest("hex");
}
export class BiologyStorage {
  private cached: { value: BiologicalRegistry; until: number } | undefined;
  constructor(
    private readonly db: Pick<typeof applicationDatabase, "select">,
  ) {}
  async getBiologicalRegistry() {
    if (this.cached && this.cached.until > Date.now()) return this.cached.value;
    const [versions, entities, relationships, sources, links] =
      await Promise.all([
        this.db
          .select()
          .from(biologyVersions)
          .where(eq(biologyVersions.version, BIOLOGY_VERSION)),
        this.db
          .select()
          .from(biologyEntities)
          .where(eq(biologyEntities.version, BIOLOGY_VERSION)),
        this.db
          .select()
          .from(biologyRelationships)
          .where(eq(biologyRelationships.version, BIOLOGY_VERSION)),
        this.db
          .select()
          .from(biologySources)
          .where(eq(biologySources.version, BIOLOGY_VERSION)),
        this.db
          .select()
          .from(biologyRelationshipSources)
          .where(eq(biologyRelationshipSources.version, BIOLOGY_VERSION)),
      ]);
    if (!versions[0])
      throw Error("Biological registry version is not installed");
    const value = validateRegistry(
      biologicalRegistrySchema.parse({
        version: BIOLOGY_VERSION,
        summary: versions[0].summary,
        entities: entities.map(({ version, ...row }) => row),
        sources: sources.map(({ version, ...row }) => row),
        relationships: relationships.map(({ version, details, ...row }) => ({
          ...(details as object),
          ...row,
          sourceIds: links
            .filter((l) => l.relationshipId === row.id)
            .map((l) => l.sourceId),
        })),
      }),
    );
    if (registryFingerprint(value) !== versions[0].fingerprint)
      throw Error("Biological registry fingerprint mismatch");
    this.cached = { value, until: Date.now() + 300000 };
    return value;
  }
}
