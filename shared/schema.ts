import { sql } from "drizzle-orm";
import {
  pgTable,
  primaryKey,
  foreignKey,
  text,
  varchar,
  timestamp,
  integer,
  bigint,
  real,
  jsonb,
  boolean,
  index,
  check,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  sex: text("sex"),
  age: integer("age"),
  heightCm: real("height_cm"),
  weightKg: real("weight_kg"),
  activityLevel: text("activity_level").default("moderate"),
  dietaryPreferences: jsonb("dietary_preferences"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const updateUserProfileSchema = createInsertSchema(users)
  .pick({
    sex: true,
    age: true,
    heightCm: true,
    weightKg: true,
    activityLevel: true,
    dietaryPreferences: true,
  })
  .extend({
    sex: z.enum(["male", "female"]).nullable().optional(),
    age: z.number().int().min(1).max(120).nullable().optional(),
    heightCm: z.number().positive().max(250).nullable().optional(),
    weightKg: z.number().positive().max(500).nullable().optional(),
    activityLevel: z
      .enum(["sedentary", "light", "moderate", "active", "very_active"])
      .optional(),
  })
  .strict();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type User = typeof users.$inferSelect;

export const microbiomeSamples = pgTable("microbiome_samples", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  testDate: timestamp("test_date").notNull(),
  testingCompany: text("testing_company"),
  testId: text("test_id"),
  rawDataPath: text("raw_data_path"),
  structuredData: jsonb("structured_data"),
  notes: text("notes"),
  processingStatus: text("processing_status").notNull().default("pending"),
  diversityIndex: real("diversity_index"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const insertMicrobiomeSampleSchema = createInsertSchema(
  microbiomeSamples,
).omit({
  id: true,
  uploadedAt: true,
});

export type InsertMicrobiomeSample = z.infer<
  typeof insertMicrobiomeSampleSchema
>;
export type MicrobiomeSample = typeof microbiomeSamples.$inferSelect;

export const bacterialComposition = pgTable("bacterial_composition", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sampleId: varchar("sample_id")
    .notNull()
    .references(() => microbiomeSamples.id),
  bacterialName: text("bacterial_name").notNull(),
  taxonomyLevel: text("taxonomy_level").notNull(),
  abundance: real("abundance").notNull(),
  genomeData: jsonb("genome_data"),
});

export const insertBacterialCompositionSchema = createInsertSchema(
  bacterialComposition,
).omit({
  id: true,
});

export type InsertBacterialComposition = z.infer<
  typeof insertBacterialCompositionSchema
>;
export type BacterialComposition = typeof bacterialComposition.$inferSelect;

export const metabolites = pgTable("metabolites", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sampleId: varchar("sample_id")
    .notNull()
    .references(() => microbiomeSamples.id),
  bacterialId: varchar("bacterial_id").references(
    () => bacterialComposition.id,
  ),
  metaboliteName: text("metabolite_name").notNull(),
  pathwayId: text("pathway_id"),
  predictedConcentration: real("predicted_concentration"),
  confidence: real("confidence"),
  productionGenes: text("production_genes").array(),
});

export const insertMetaboliteSchema = createInsertSchema(metabolites).omit({
  id: true,
});

export type InsertMetabolite = z.infer<typeof insertMetaboliteSchema>;
export type Metabolite = typeof metabolites.$inferSelect;

export const healthImpacts = pgTable("health_impacts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  metaboliteId: varchar("metabolite_id")
    .notNull()
    .references(() => metabolites.id),
  impactCategory: text("impact_category").notNull(),
  impactDescription: text("impact_description").notNull(),
  impactScore: real("impact_score"),
  evidenceLevel: text("evidence_level"),
  affectedSystems: text("affected_systems").array(),
  mechanismOfAction: text("mechanism_of_action"),
});

export const insertHealthImpactSchema = createInsertSchema(healthImpacts).omit({
  id: true,
});

export type InsertHealthImpact = z.infer<typeof insertHealthImpactSchema>;
export type HealthImpact = typeof healthImpacts.$inferSelect;

export const cohortReferences = pgTable("cohort_references", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  cohortName: text("cohort_name").notNull(),
  cohortType: text("cohort_type").notNull(),
  bacterialProfile: jsonb("bacterial_profile").notNull(),
  metaboliteProfile: jsonb("metabolite_profile"),
  healthMarkers: jsonb("health_markers"),
  sampleSize: integer("sample_size"),
  studyReference: text("study_reference"),
});

export const insertCohortReferenceSchema = createInsertSchema(
  cohortReferences,
).omit({
  id: true,
});

export type InsertCohortReference = z.infer<typeof insertCohortReferenceSchema>;
export type CohortReference = typeof cohortReferences.$inferSelect;

export const mlAnalyses = pgTable("ml_analyses", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sampleId: varchar("sample_id")
    .notNull()
    .references(() => microbiomeSamples.id),
  analysisType: text("analysis_type").notNull(),
  modelVersion: text("model_version").notNull(),
  results: jsonb("results").notNull(),
  confidence: real("confidence"),
  explainability: jsonb("explainability"),
  comparedCohorts: text("compared_cohorts").array(),
  analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
});

export const insertMlAnalysisSchema = createInsertSchema(mlAnalyses).omit({
  id: true,
  analyzedAt: true,
});

export type InsertMlAnalysis = z.infer<typeof insertMlAnalysisSchema>;
export type MlAnalysis = typeof mlAnalyses.$inferSelect;

export const metaboliteImpactKnowledge = pgTable(
  "metabolite_impact_knowledge",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    metaboliteName: text("metabolite_name").notNull().unique(),
    impactCategory: text("impact_category").notNull(),
    impactDescription: text("impact_description").notNull(),
    impactScore: real("impact_score"),
    evidenceLevel: text("evidence_level"),
    affectedSystems: text("affected_systems").array(),
    mechanismOfAction: text("mechanism_of_action"),
    studyReferences: text("study_references").array(),
  },
);

export const insertMetaboliteImpactKnowledgeSchema = createInsertSchema(
  metaboliteImpactKnowledge,
).omit({
  id: true,
});

export type InsertMetaboliteImpactKnowledge = z.infer<
  typeof insertMetaboliteImpactKnowledgeSchema
>;
export type MetaboliteImpactKnowledge =
  typeof metaboliteImpactKnowledge.$inferSelect;

export const recommendations = pgTable("recommendations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sampleId: varchar("sample_id")
    .notNull()
    .references(() => microbiomeSamples.id),
  analysisId: varchar("analysis_id").references(() => mlAnalyses.id),
  recommendationType: text("recommendation_type").notNull(),
  category: text("category").notNull(),
  itemName: text("item_name").notNull(),
  reasoning: text("reasoning").notNull(),
  details: text("details"),
  priority: integer("priority"),
  expectedImpact: real("expected_impact"),
  targetBacteria: text("target_bacteria").array(),
  targetMetabolites: text("target_metabolites").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRecommendationSchema = createInsertSchema(
  recommendations,
).omit({
  id: true,
  createdAt: true,
});

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;

export const meals = pgTable("meals", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  mealText: text("meal_text").notNull(),
  mealType: text("meal_type"),
  loggedAt: timestamp("logged_at").notNull().defaultNow(),
  nutritionalData: jsonb("nutritional_data"),
  mealContext: jsonb("meal_context"),
  intelligence: jsonb("intelligence"),
  totalCalories: real("total_calories"),
  totalProtein: real("total_protein"),
  totalCarbs: real("total_carbs"),
  totalFat: real("total_fat"),
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  loggedAt: true,
});

export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof meals.$inferSelect;

// Precision data is encrypted by the application before reaching these JSON columns.
export const precisionProfiles = pgTable("precision_profiles", {
  userId: varchar("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  encryptedContext: jsonb("encrypted_context").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const precisionRecords = pgTable(
  "precision_records",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    encryptedPayload: jsonb("encrypted_payload").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("precision_records_user_created_idx").on(
      table.userId,
      table.createdAt.desc(),
    ),
    check(
      "precision_records_kind_check",
      sql`${table.kind} IN ('genetics','lab','metabolite','checkin','plan')`,
    ),
  ],
);

// Personal product labels are private and encrypted, separate from public reference data.
export const nutritionProducts = pgTable(
  "nutrition_products",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    encryptedPayload: jsonb("encrypted_payload").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("nutrition_products_user_idx").on(table.userId)],
);

// Everyday preferences and athlete records are separate from precision interpretation.
export const experienceSettings = pgTable("experience_settings", {
  userId: varchar("user_id").primaryKey().references(() => users.id, {onDelete:"cascade"}),
  encryptedPayload: jsonb("encrypted_payload").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const experienceRecords = pgTable("experience_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, {onDelete:"cascade"}),
  kind: text("kind").notNull(), encryptedPayload: jsonb("encrypted_payload").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(), updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, table => [index("experience_records_user_kind_idx").on(table.userId, table.kind)]);

// Public reference knowledge. Personal observations are never stored in these tables.
export const biologyVersions = pgTable("biology_versions", {version:text("version").primaryKey(),fingerprint:text("fingerprint").notNull(),summary:text("summary").notNull(),createdAt:timestamp("created_at").defaultNow().notNull()});
export const biologyEntities=pgTable("biology_entities",{version:text("version").notNull().references(()=>biologyVersions.version),id:text("id").notNull(),kind:text("kind").notNull(),label:text("label").notNull(),summary:text("summary").notNull(),metadata:jsonb("metadata").notNull()},t=>[primaryKey({columns:[t.version,t.id]})]);
export const biologySources=pgTable("biology_sources",{version:text("version").notNull().references(()=>biologyVersions.version),id:text("id").notNull(),title:text("title").notNull(),url:text("url").notNull(),design:text("design").notNull(),population:text("population").notNull(),limitation:text("limitation").notNull()},t=>[primaryKey({columns:[t.version,t.id]})]);
export const biologyRelationships=pgTable("biology_relationships",{version:text("version").notNull().references(()=>biologyVersions.version),id:text("id").notNull(),from:text("from_id").notNull(),to:text("to_id").notNull(),evidence:text("evidence").notNull(),confidence:text("confidence").notNull(),rule:text("rule").notNull(),details:jsonb("details").notNull()},t=>[primaryKey({columns:[t.version,t.id]}),foreignKey({columns:[t.version,t.from],foreignColumns:[biologyEntities.version,biologyEntities.id]}),foreignKey({columns:[t.version,t.to],foreignColumns:[biologyEntities.version,biologyEntities.id]}),index("biology_relationships_from_idx").on(t.version,t.from),index("biology_relationships_to_idx").on(t.version,t.to)]);
export const biologyRelationshipSources=pgTable("biology_relationship_sources",{version:text("version").notNull(),relationshipId:text("relationship_id").notNull(),sourceId:text("source_id").notNull()},t=>[primaryKey({columns:[t.version,t.relationshipId,t.sourceId]}),foreignKey({columns:[t.version,t.relationshipId],foreignColumns:[biologyRelationships.version,biologyRelationships.id]}),foreignKey({columns:[t.version,t.sourceId],foreignColumns:[biologySources.version,biologySources.id]})]);

// No raw account names or addresses are stored in request abuse budgets.
export const requestBudgets = pgTable("request_budgets", {
  identity: text("identity").primaryKey(),
  attempts: integer("attempts").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, table => [index("request_budgets_expiry").on(table.expiresAt)]);


/** Dormant, encrypted and owner-scoped external health import records. */
export const healthSourceConsents = pgTable("health_source_consents", {
  userId: varchar("user_id").notNull().references(() => users.id, {onDelete:"cascade"}),
  provider: text("provider").notNull(),
  encryptedPayload: jsonb("encrypted_payload").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, t => [primaryKey({columns:[t.userId,t.provider]})]);

export const healthObservations = pgTable("health_observations", {
  userId: varchar("user_id").notNull().references(() => users.id, {onDelete:"cascade"}),
  sourceKey: text("source_key").notNull(),
  encryptedPayload: jsonb("encrypted_payload").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, t => [primaryKey({columns:[t.userId,t.sourceKey]}),index("health_observations_user_updated_idx").on(t.userId,t.updatedAt.desc())]);

// Internal-preview preference only; role/approval grants never come from this table.
export const capabilityPreferences = pgTable("capability_preferences", {
  userId:varchar("user_id").primaryKey().references(()=>users.id,{onDelete:"cascade"}),
  enabled:boolean("enabled").notNull().default(false),
  grantFingerprint:text("grant_fingerprint").notNull(),
  updatedAt:timestamp("updated_at").notNull().defaultNow(),
});

// Monetary accounting foundation: HMAC identities only; no health or prompt content.
export const aiSpendRequests = pgTable("ai_spend_requests", {
    providerUsage:jsonb("provider_usage"),
    requestKey: text("request_key").primaryKey(), accountKey: text("account_key").notNull(),
    feature: text("feature").notNull(), provider: text("provider").notNull(), model: text("model").notNull(), tariffReference: text("tariff_reference").notNull(),
    reservedMicroUsd: bigint("reserved_micro_usd", { mode: "bigint" }).notNull(), settledMicroUsd: bigint("settled_micro_usd", { mode: "bigint" }),
    state: text("state").notNull(), billingBasis: text("billing_basis"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql `clock_timestamp()`), settledAt: timestamp("settled_at", { withTimezone: true }),
}, table => [index("ai_spend_account_time").on(table.accountKey, table.createdAt), index("ai_spend_provider_time").on(table.provider, table.createdAt),
    check("ai_spend_reserved_positive", sql `${table.reservedMicroUsd} > 0`), check("ai_spend_settled_nonnegative", sql `${table.settledMicroUsd} >= 0`),
    check("ai_spend_state", sql `${table.state} IN ('reserved','settled','released')`), check("ai_spend_basis", sql `${table.billingBasis} IN ('actual','estimated')`),
    check("ai_spend_consistency", sql `(${table.state} = 'reserved' AND ${table.settledMicroUsd} IS NULL AND ${table.billingBasis} IS NULL AND ${table.settledAt} IS NULL) OR (${table.state} = 'settled' AND ${table.settledMicroUsd} IS NOT NULL AND ${table.billingBasis} IS NOT NULL AND ${table.settledAt} IS NOT NULL) OR (${table.state} = 'released' AND ${table.settledMicroUsd} = 0 AND ${table.billingBasis} IS NULL AND ${table.settledAt} IS NOT NULL)`)]);
