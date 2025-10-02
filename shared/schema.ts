import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, real, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const microbiomeSamples = pgTable("microbiome_samples", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  testDate: timestamp("test_date").notNull(),
  testingCompany: text("testing_company"),
  testId: text("test_id"),
  rawDataPath: text("raw_data_path"),
  processingStatus: text("processing_status").notNull().default('pending'),
  diversityIndex: real("diversity_index"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const insertMicrobiomeSampleSchema = createInsertSchema(microbiomeSamples).omit({
  id: true,
  uploadedAt: true,
});

export type InsertMicrobiomeSample = z.infer<typeof insertMicrobiomeSampleSchema>;
export type MicrobiomeSample = typeof microbiomeSamples.$inferSelect;

export const bacterialComposition = pgTable("bacterial_composition", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sampleId: varchar("sample_id").notNull().references(() => microbiomeSamples.id),
  bacterialName: text("bacterial_name").notNull(),
  taxonomyLevel: text("taxonomy_level").notNull(),
  abundance: real("abundance").notNull(),
  genomeData: jsonb("genome_data"),
});

export const insertBacterialCompositionSchema = createInsertSchema(bacterialComposition).omit({
  id: true,
});

export type InsertBacterialComposition = z.infer<typeof insertBacterialCompositionSchema>;
export type BacterialComposition = typeof bacterialComposition.$inferSelect;

export const metabolites = pgTable("metabolites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sampleId: varchar("sample_id").notNull().references(() => microbiomeSamples.id),
  bacterialId: varchar("bacterial_id").references(() => bacterialComposition.id),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metaboliteId: varchar("metabolite_id").notNull().references(() => metabolites.id),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cohortName: text("cohort_name").notNull(),
  cohortType: text("cohort_type").notNull(),
  bacterialProfile: jsonb("bacterial_profile").notNull(),
  metaboliteProfile: jsonb("metabolite_profile"),
  healthMarkers: jsonb("health_markers"),
  sampleSize: integer("sample_size"),
  studyReference: text("study_reference"),
});

export const insertCohortReferenceSchema = createInsertSchema(cohortReferences).omit({
  id: true,
});

export type InsertCohortReference = z.infer<typeof insertCohortReferenceSchema>;
export type CohortReference = typeof cohortReferences.$inferSelect;

export const mlAnalyses = pgTable("ml_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sampleId: varchar("sample_id").notNull().references(() => microbiomeSamples.id),
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

export const metaboliteImpactKnowledge = pgTable("metabolite_impact_knowledge", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metaboliteName: text("metabolite_name").notNull().unique(),
  impactCategory: text("impact_category").notNull(),
  impactDescription: text("impact_description").notNull(),
  impactScore: real("impact_score"),
  evidenceLevel: text("evidence_level"),
  affectedSystems: text("affected_systems").array(),
  mechanismOfAction: text("mechanism_of_action"),
  studyReferences: text("study_references").array(),
});

export const insertMetaboliteImpactKnowledgeSchema = createInsertSchema(metaboliteImpactKnowledge).omit({
  id: true,
});

export type InsertMetaboliteImpactKnowledge = z.infer<typeof insertMetaboliteImpactKnowledgeSchema>;
export type MetaboliteImpactKnowledge = typeof metaboliteImpactKnowledge.$inferSelect;

export const recommendations = pgTable("recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sampleId: varchar("sample_id").notNull().references(() => microbiomeSamples.id),
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

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
});

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
