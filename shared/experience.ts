import { z } from "zod";
import { ingredientSchema } from "./meal-intelligence";
export const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v, "Use a real calendar date");
const optionalText = z.string().trim().max(1000).default("");
export const athleteProfileSchema = z.object({
  sport: z.string().trim().max(100).default(""),
  discipline: z.enum(["endurance", "strength-power", "team", "mixed", "skill"]).default("mixed"),
  level: z.enum(["recreational", "competitive", "professional", "olympic-paralympic"]).default("recreational"),
  weightKg: z.number().finite().min(30).max(250).nullable().default(null),
  adult: z.boolean().default(false), pregnancyNo: z.boolean().default(false),
  healthReviewed: z.boolean().default(false), needsClinicalReview: z.boolean().default(false),
  trainingPhase: z.enum(["base", "build", "competition", "taper", "recovery"]).default("base"),
  gutTrained: z.boolean().default(false), proteinGkg: z.number().min(1.2).max(2).default(1.6),
  carbGkgMin: z.number().min(1).max(15).nullable().default(null), carbGkgMax: z.number().min(1).max(15).nullable().default(null),
  energyKcal: z.number().finite().int().min(1200).max(12000).nullable().default(null),
  targetsConfirmed: z.boolean().default(false), teamPlanNotes: optionalText,
  reviewDate: dateKey.nullable().default(null),
}).strict().refine(v=>(v.carbGkgMin===null&&v.carbGkgMax===null)||(v.carbGkgMin!==null&&v.carbGkgMax!==null&&v.carbGkgMin<=v.carbGkgMax), "Set both carbohydrate values with maximum at least minimum");
export type AthleteProfile = z.infer<typeof athleteProfileSchema>;
export const practicalPreferencesSchema = z.object({
  minutes: z.number().int().min(5).max(180).default(30),
  budget: z.enum(["economical", "flexible"]).default("economical"),
  household: z.number().int().min(1).max(8).default(1),
  pantry: z.array(z.string().trim().min(1).max(100)).max(100).default([]),
  equipment: z.array(z.enum(["stove", "oven", "microwave", "none"])).max(4).default(["stove", "oven"]),
}).strict();
export const experienceSettingsSchema = z.object({
  mode: z.enum(["everyday", "athlete"]).default("everyday"),
  athlete: athleteProfileSchema.default({}), practical: practicalPreferencesSchema.default({}),
}).strict();
export type ExperienceSettings = z.infer<typeof experienceSettingsSchema>;
export const settingsPatchSchema = z.object({
  mode: z.enum(["everyday", "athlete"]).optional(), athlete: athleteProfileSchema.optional(), practical: practicalPreferencesSchema.optional(),
}).strict().refine(v => Object.keys(v).length > 0);
export const trainingSessionSchema = z.object({
  title: z.string().trim().min(1).max(120), startsAt: z.string().datetime({offset:true}),
  minutes: z.number().int().min(1).max(600), intensity: z.enum(["easy", "moderate", "hard", "competition"]),
  discipline: z.enum(["endurance", "strength-power", "team", "mixed", "skill"]),
  status: z.enum(["planned", "completed", "cancelled"]).default("planned"),
  climate: z.enum(["cool", "temperate", "hot"]).default("temperate"),
  rpe: z.number().int().min(1).max(10).nullable().default(null),
  carbsG: z.number().finite().min(0).max(1200).nullable().default(null),
  fluidMl: z.number().finite().min(0).max(15000).nullable().default(null),
  gutComfort: z.number().int().min(0).max(10).nullable().default(null),
  performance: optionalText, notes: optionalText,
}).strict();
export type TrainingSession = z.infer<typeof trainingSessionSchema>;
export const hydrationSchema = z.object({
  date: dateKey, minutes: z.number().min(10).max(600),
  preKg: z.number().finite().min(30).max(250), postKg: z.number().finite().min(30).max(250),
  drankMl: z.number().finite().min(0).max(15000), urineMl: z.number().finite().min(0).max(5000).default(0),
  climate: z.enum(["cool", "temperate", "hot"]),
  sweatSodiumMgL: z.number().min(100).max(2500).nullable().default(null), testSource: optionalText,
}).strict().refine(v => v.sweatSodiumMgL === null || !!v.testSource, "Record the source of measured sweat sodium");
export const checkinSchema = z.object({
  date: dateKey, mode: z.enum(["everyday", "athlete"]),
  energy: z.number().int().min(0).max(10), hunger: z.number().int().min(0).max(10),
  digestion: z.number().int().min(0).max(10), sleepHours: z.number().min(0).max(24),
  soreness: z.number().int().min(0).max(10).nullable().default(null),
  adherence: z.number().int().min(0).max(7),
  focus: z.string().trim().max(200).default(""), notes: optionalText,
  professionalReview: z.boolean().default(false),
}).strict();
export const experimentSchema = z.object({
  mode: z.enum(["everyday", "athlete"]), title: z.string().trim().min(1).max(160),
  startsOn: dateKey, endsOn: dateKey, action: z.string().trim().min(1).max(1000),
  outcome: z.string().trim().min(1).max(300), rationale: optionalText,
  status: z.enum(["planned", "active", "completed"]).default("planned"), reflection: optionalText,
}).strict().refine(v => v.endsOn >= v.startsOn && (Date.parse(v.endsOn)-Date.parse(v.startsOn))/86400000 <= 90, "Choose an experiment of 0–90 days");
export const competitionSchema = z.object({
  name: z.string().trim().min(1).max(120), startsAt: z.string().datetime({offset:true}),
  minutes: z.number().int().min(1).max(600), travel: optionalText, access: optionalText,
  familiarFoods: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
  checklist: z.array(z.enum(["food-rehearsed", "fluid-rehearsed", "aid-stations", "travel-food", "batch-check", "medication-check", "team-review"])).max(7).default([]), notes: optionalText,
}).strict();
export const supplementReviewSchema = z.object({
  name: z.string().trim().min(1).max(160), purpose: optionalText,
  ingredients: z.array(z.string().trim().min(1).max(100)).max(40).default([]),
  batch: z.string().trim().max(100).default(""), certification: z.enum(["unknown", "nsf", "informed-sport", "other"]).default("unknown"),
  certificateUrl: z.union([z.literal(""), z.string().url().max(1500).refine(u => new URL(u).protocol === "https:")]).default(""),
  checkedOn: dateKey.nullable().default(null), reviewer: optionalText, notes: optionalText,
}).strict();
export const templateSchema = z.object({
  name: z.string().trim().min(1).max(120), mealText: z.string().trim().max(2000),
  ingredients: z.array(ingredientSchema.strict()).min(1).max(20),
  sourceMealId: z.string().max(100).nullable().default(null),
}).strict();
export const memorySchema = z.object({
  key: z.string().trim().min(1).max(2000), ingredients: z.array(ingredientSchema.strict()).min(1).max(20),
}).strict();
export const experienceEntrySchema = z.discriminatedUnion("kind", [
  z.object({kind:z.literal("session"), payload:trainingSessionSchema}).strict(),
  z.object({kind:z.literal("hydration"), payload:hydrationSchema}).strict(),
  z.object({kind:z.literal("checkin"), payload:checkinSchema}).strict(),
  z.object({kind:z.literal("experiment"), payload:experimentSchema}).strict(),
  z.object({kind:z.literal("competition"), payload:competitionSchema}).strict(),
  z.object({kind:z.literal("supplement-review"), payload:supplementReviewSchema}).strict(),
  z.object({kind:z.literal("meal-template"), payload:templateSchema}).strict(),
  z.object({kind:z.literal("food-memory"), payload:memorySchema}).strict(),
]);
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type ExperienceRecord = ExperienceEntry & { id:string; createdAt:string; updatedAt:string };
export const memoryKey = (s:string) => s.toLowerCase().replace(/\s+/g," ").trim();
