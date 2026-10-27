import { z } from "zod";
import { ingredientSchema } from "./meal-intelligence";
export const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v, "Use a real calendar date");
const optionalText = z.string().trim().max(1000).default("");
export const athleteProfileSchema = z.object({
  sport: z.string().trim().max(100).default(""),
  discipline: z.enum(["endurance", "strength-power", "team", "mixed", "skill"]).default("mixed"),
  level: z.enum(["recreational", "competitive", "professional", "olympic-paralympic"]).default("recreational"),
  weightKg: z.number().finite().min(30).max(250).nullable().default(null),
  massReference: z.object({
    source: z.enum(["manual", "profile-copy"]),
    recordedAt: z.string().datetime({offset:true}),
    profileWeightKg: z.number().finite().min(30).max(250).nullable(),
  }).strict().nullable().default(null),
  adult: z.boolean().default(false), pregnancyNo: z.boolean().default(false),
  healthReviewed: z.boolean().default(false), needsClinicalReview: z.boolean().default(false),
  trainingPhase: z.enum(["base", "build", "competition", "taper", "recovery"]).default("base"),
  gutTrained: z.boolean().default(false), proteinGkg: z.number().min(1.2).max(2).default(1.6),
  carbGkgMin: z.number().min(1).max(15).nullable().default(null), carbGkgMax: z.number().min(1).max(15).nullable().default(null),
  energyKcal: z.number().finite().int().min(1200).max(12000).nullable().default(null),
  targetsConfirmed: z.boolean().default(false), teamPlanNotes: optionalText,
  reviewDate: dateKey.nullable().default(null),
}).strict().refine(v=>(v.carbGkgMin===null&&v.carbGkgMax===null)||(v.carbGkgMin!==null&&v.carbGkgMax!==null&&v.carbGkgMin<=v.carbGkgMax), "Set both carbohydrate values with maximum at least minimum")
 .refine(v=>v.massReference===null || (v.weightKg!==null && (v.massReference.source==="manual"?v.massReference.profileWeightKg===null:v.massReference.profileWeightKg!==null&&Math.abs(v.massReference.profileWeightKg-v.weightKg)<0.00001)), "Reference mass provenance must match the saved reference");
export type AthleteProfile = z.infer<typeof athleteProfileSchema>;
export const practicalPreferencesSchema = z.object({
  minutes: z.number().int().min(5).max(180).default(30),
  budget: z.enum(["economical", "flexible"]).default("economical"),
  household: z.number().int().min(1).max(8).default(1),
  pantry: z.array(z.string().trim().min(1).max(100)).max(100).default([]),
  equipment: z.array(z.enum(["stove", "oven", "microwave", "none"])).max(4).default(["stove", "oven"]),
}).strict();
export const onboardingSchema = z.object({status:z.enum(["not-started","skipped","complete"]).default("not-started")}).strict();
// Display preferences are independent and account-scoped in encrypted settings.
// They never change canonical clinical values or source laboratory units.
export const displayUnitsSchema = z.object({
  height: z.enum(["cm","m","ft-in"]).default("cm"),
  bodyWeight: z.enum(["kg","lb"]).default("kg"),
  circumference: z.enum(["cm","in"]).default("cm"),
  hydration: z.enum(["mL","L","US-fl-oz"]).default("mL"),
  temperature: z.enum(["C","F"]).default("C"),
  energy: z.enum(["kcal","kJ"]).default("kcal"),
  foodWeight: z.enum(["g","oz"]).default("g"),
}).strict();
export type DisplayUnits = z.infer<typeof displayUnitsSchema>;

export const experienceSettingsSchema = z.object({
  mode: z.enum(["everyday", "athlete"]).default("everyday"),
  onboarding: onboardingSchema.prefault({}),
  displayUnits: displayUnitsSchema.prefault({}),
  athlete: athleteProfileSchema.prefault({}), practical: practicalPreferencesSchema.prefault({}),
}).strict();
export type ExperienceSettings = z.infer<typeof experienceSettingsSchema>;
export const settingsPatchSchema = z.object({
  athleteReviewFor:z.object({base:z.string().max(1024).optional(),targets:z.string().max(1024).optional(),health:z.string().max(1024).optional()}).strict().optional(),
  onboarding: onboardingSchema.optional(),
  displayUnits: displayUnitsSchema.optional(),
  mode: z.enum(["everyday", "athlete"]).optional(), athlete: athleteProfileSchema.optional(), practical: practicalPreferencesSchema.optional(),
}).strict().refine(v => Object.keys(v).length > 0).refine(v=>!v.athleteReviewFor||!!v.athlete,"Review acknowledgement requires the corresponding Athlete inputs");
export type ExperienceSettingsPatch=z.infer<typeof settingsPatchSchema>;
export const activitySchema=z.object({
 title:z.string().trim().min(1).max(120),startedAt:z.string().datetime({offset:true}),
 minutes:z.number().int().min(1).max(1440),effort:z.enum(["easy","moderate","hard"]).nullable().default(null),
 source:z.literal("manual").default("manual"),
 timeZone:z.string().min(1).max(100).refine(value=>{try{new Intl.DateTimeFormat("en",{timeZone:value});return true;}catch{return false;}},"Choose a recognized time zone").nullable().default(null),
 notes:optionalText,
}).strict();
export type Activity=z.infer<typeof activitySchema>;
/** Optional manual observations; absence is not a completed or zero-load workout. */
export const actualSetsSchema = z.object({
  version: z.literal(1),
  sets: z.array(z.object({
    exercise: z.string().trim().min(1).max(120),
    reps: z.number().int().min(0).max(1000).nullable(),
    loadKg: z.number().finite().min(0).max(2000).nullable(),
    completed: z.boolean(),
  }).strict()).max(100),
}).strict();
export type ActualSets = z.infer<typeof actualSetsSchema>;
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
  actualSets: actualSetsSchema.optional(),
}).strict();
export type TrainingSession = z.infer<typeof trainingSessionSchema>;
export const hydrationSchema = z.object({
  date: dateKey, minutes: z.number().min(10).max(600),
  preKg: z.number().finite().min(30).max(250), postKg: z.number().finite().min(30).max(250),
  drankMl: z.number().finite().min(0).max(15000), urineMl: z.number().finite().min(0).max(5000).default(0),
  climate: z.enum(["cool", "temperate", "hot"]),
  sweatSodiumMgL: z.number().min(100).max(2500).nullable().default(null), testSource: optionalText,
}).strict().refine(v => v.sweatSodiumMgL === null || !!v.testSource, "Record the source of measured sweat sodium");
export const focusFeedbackResponses=["liked","disliked","intolerant","not-applicable","helped","no-benefit"] as const;
export const focusFeedbackSchema=z.object({
 version:z.literal(1),response:z.enum(focusFeedbackResponses).nullable(),
 focus:z.string().trim().min(1).max(200),date:dateKey,mode:z.enum(["everyday","athlete"]),recordedAt:z.string().datetime({offset:true}),
 receiptHash:z.string().regex(/^[a-f0-9]{64}$/),previousRevision:z.string().regex(/^[a-f0-9]{64}$/),
}).strict();
export type FocusFeedback=z.infer<typeof focusFeedbackSchema>;
export const focusFeedbackRequestSchema=z.object({response:z.enum(focusFeedbackResponses).nullable(),sourceRevision:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
export type FocusFeedbackRequest=z.infer<typeof focusFeedbackRequestSchema>;
export const checkinFeedbackViewSchema=z.object({source:z.object({id:z.string().min(1),date:dateKey,mode:z.enum(["everyday","athlete"]),focus:z.string().max(200)}).strict(),feedback:focusFeedbackSchema.omit({receiptHash:true,previousRevision:true}).nullable(),revision:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
export type CheckinFeedbackView=z.infer<typeof checkinFeedbackViewSchema>;
export const checkinSchema = z.object({
  date: dateKey, mode: z.enum(["everyday", "athlete"]),
  energy: z.number().int().min(0).max(10), hunger: z.number().int().min(0).max(10),
  digestion: z.number().int().min(0).max(10), sleepHours: z.number().min(0).max(24),
  soreness: z.number().int().min(0).max(10).nullable().default(null),
  adherence: z.number().int().min(0).max(7),
  focus: z.string().trim().max(200).default(""), notes: optionalText,
  professionalReview: z.boolean().default(false),
  focusFeedback:focusFeedbackSchema.optional(),
}).strict();
export const experimentSchema = z.object({
  mode: z.enum(["everyday", "athlete"]), title: z.string().trim().min(1).max(160),
  startsOn: dateKey, endsOn: dateKey, action: z.string().trim().min(1).max(1000),
  outcome: z.string().trim().min(1).max(300), rationale: optionalText,
  status: z.enum(["planned", "active", "completed"]).default("planned"), reflection: optionalText,
  design: z.object({
    baselineStartsOn: dateKey, baselineEndsOn: dateKey,
    metricUnit: z.string().trim().min(1).max(50), measurementMethod: z.string().trim().min(1).max(300),
    expectedDirection: z.enum(["increase", "decrease", "observe"]),
    confoundersToTrack: z.string().trim().min(1).max(1000),
  }).strict().nullable().default(null),
  observations: z.array(z.object({
    date: dateKey, value: z.number().finite().min(-1e9).max(1e9),
    adherence: z.number().int().min(0).max(100).nullable(),
    confounders: z.string().trim().max(1000),
  }).strict()).max(180).default([]),
}).strict().refine(v => v.endsOn >= v.startsOn && (Date.parse(v.endsOn)-Date.parse(v.startsOn))/86400000 <= 90, "Choose an experiment of 0–90 days").superRefine((v,ctx)=>{
  if (!v.design && v.observations.length) ctx.addIssue({code:"custom",message:"Define a measurement method and baseline before entering observations"});
  if(v.design) {
    if(v.design.baselineStartsOn > v.design.baselineEndsOn || v.design.baselineEndsOn >= v.startsOn || Date.parse(v.design.baselineEndsOn)-Date.parse(v.design.baselineStartsOn)>90*86400000)
      ctx.addIssue({code:"custom",message:"Choose a baseline of at most 90 days ending before the intervention"});
    if(new Set(v.observations.map(o=>o.date)).size !== v.observations.length || v.observations.some(o=>!(o.date>=v.design!.baselineStartsOn&&o.date<=v.design!.baselineEndsOn)&&!(o.date>=v.startsOn&&o.date<=v.endsOn)))
      ctx.addIssue({code:"custom",message:"Use one observation per day within the baseline or intervention period"});
  }
});
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
  z.object({kind:z.literal("activity"),payload:activitySchema}).strict(),
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
