import { writeFileSync } from "node:fs";
import {
  buildBiologicalRegistry,
  validateRegistry,
} from "../shared/biological-model";
import { registryFingerprint } from "../server/biology-storage";
const registry = validateRegistry(buildBiologicalRegistry());
const quote = (v: unknown) => "'" + String(v).replaceAll("'", "''") + "'";
const json = (v: unknown) => quote(JSON.stringify(v)) + "::jsonb";
const version = quote(registry.version);
export const knowledgeStatements = [
  `CREATE TABLE IF NOT EXISTS biology_versions(version text PRIMARY KEY,fingerprint text NOT NULL,summary text NOT NULL,created_at timestamp NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS biology_entities(version text NOT NULL REFERENCES biology_versions(version),id text NOT NULL,kind text NOT NULL,label text NOT NULL,summary text NOT NULL,metadata jsonb NOT NULL,PRIMARY KEY(version,id))`,
  `CREATE TABLE IF NOT EXISTS biology_sources(version text NOT NULL REFERENCES biology_versions(version),id text NOT NULL,title text NOT NULL,url text NOT NULL,design text NOT NULL,population text NOT NULL,limitation text NOT NULL,PRIMARY KEY(version,id))`,
  `CREATE TABLE IF NOT EXISTS biology_relationships(version text NOT NULL REFERENCES biology_versions(version),id text NOT NULL,from_id text NOT NULL,to_id text NOT NULL,evidence text NOT NULL,confidence text NOT NULL,rule text NOT NULL,details jsonb NOT NULL,PRIMARY KEY(version,id),FOREIGN KEY(version,from_id) REFERENCES biology_entities(version,id),FOREIGN KEY(version,to_id) REFERENCES biology_entities(version,id))`,
  `CREATE INDEX IF NOT EXISTS biology_relationships_from_idx ON biology_relationships(version,from_id)`,
  `CREATE INDEX IF NOT EXISTS biology_relationships_to_idx ON biology_relationships(version,to_id)`,
  `CREATE TABLE IF NOT EXISTS biology_relationship_sources(version text NOT NULL,relationship_id text NOT NULL,source_id text NOT NULL,PRIMARY KEY(version,relationship_id,source_id),FOREIGN KEY(version,relationship_id) REFERENCES biology_relationships(version,id),FOREIGN KEY(version,source_id) REFERENCES biology_sources(version,id))`,
  `INSERT INTO biology_versions(version,fingerprint,summary) VALUES(${version},${quote(registryFingerprint(registry))},${quote(registry.summary)}) ON CONFLICT DO NOTHING`,
  `INSERT INTO biology_entities(version,id,kind,label,summary,metadata) VALUES ${registry.entities.map((n) => `(${version},${quote(n.id)},${quote(n.kind)},${quote(n.label)},${quote(n.summary)},${json(n.metadata)})`).join(",")} ON CONFLICT DO NOTHING`,
  `INSERT INTO biology_sources(version,id,title,url,design,population,limitation) VALUES ${registry.sources.map((n) => `(${version},${quote(n.id)},${quote(n.title)},${quote(n.url)},${quote(n.design)},${quote(n.population)},${quote(n.limitation)})`).join(",")} ON CONFLICT DO NOTHING`,
  `INSERT INTO biology_relationships(version,id,from_id,to_id,evidence,confidence,rule,details) VALUES ${registry.relationships.map(({ id, from, to, evidence, confidence, rule, sourceIds, ...details }) => `(${version},${quote(id)},${quote(from)},${quote(to)},${quote(evidence)},${quote(confidence)},${quote(rule)},${json(details)})`).join(",")} ON CONFLICT DO NOTHING`,
  `INSERT INTO biology_relationship_sources(version,relationship_id,source_id) VALUES ${registry.relationships.flatMap((r) => r.sourceIds.map((source) => `(${version},${quote(r.id)},${quote(source)})`)).join(",")} ON CONFLICT DO NOTHING`,
];
if (process.argv.includes("--write"))
  writeFileSync(
    new URL("../migrations/0005_biological_registry.sql", import.meta.url),
    "-- Generated from the versioned public biological model; no personal data.\n" +
      knowledgeStatements.join(";\n\n") +
      ";\n",
  );
