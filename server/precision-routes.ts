import {LabImportReviewRequired} from "./precision-storage";
import {labDateChangeSchema} from "../shared/lab-date-correction";
import {nutritionTargetReference} from "./nutrition-targets";
import {resolvePlanningContext} from "./planning-context";
import {historicalPlanRecord} from "./plan-history";
import {aiExecutionContext} from "./metered-ai";
import { requireRestrictedCapability } from "./capability-policy";
import { buildTodayPlan } from "../shared/today-planner";
import { localDayBounds } from "../shared/nutrition-summary";
import type { Express, RequestHandler } from "express";
import { z } from "zod";
import type { IStorage } from "./storage";
import {
  buildPrecisionReport,
  labSchema,
  sourceOnlyLabSchema,
  activeLabRows,
  contextSchema,
  precisionEntrySchema,
  type TaxonReport,
} from "../shared/precision-nutrition";
import {
  preferenceSchema,
  defaultPreferences,
} from "../shared/meal-intelligence";
import { abundanceSchema } from "../shared/report-import";
import {
  weeklyRequestSchema,
  eligiblePlanningRecipes,
} from "../shared/weekly-planner";
import { evidenceNetwork } from "../shared/evidence-network";
import { runWeeklyPlanning } from "./weekly-runner";
import { generateRecipes, recipeFailure } from "./recipe-generation";
import { prepareResearch, simulateResearch } from "./metabolite-research";
import type { WeeklyPlan } from "../shared/weekly-planner";

type Store = Pick<
  IStorage,
  | "getMeals"
  | "getUser"
  | "getUserSamples"
  | "getBacterialComposition"
  | "getMetabolites"
  | "getPrecisionContext"
  | "putPrecisionContext"
  | "getPrecisionRecords"
  | "insertPrecisionRecord"
  | "insertReviewedLab"
  | "correctLabDate"
  | "deleteLabEntry"
  | "deletePrecisionRecord"
  | "clearPrecisionData"
>;
export function registerPrecisionRoutes(
  app: Express,
  auth: RequestHandler,
  store: Store,
) {
  const noCache: RequestHandler = (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  };
  app.use("/api/precision", auth, noCache);
  async function reportFor(userId: string, sampleId?: string) {
    const [rawContext, records, user, samples] = await Promise.all([
      store.getPrecisionContext(userId),
      store.getPrecisionRecords(userId),
      store.getUser(userId),
      store.getUserSamples(userId),
    ]);
    const context =
      rawContext === undefined
        ? contextSchema.parse({})
        : contextSchema.parse(rawContext);
    const preferences = preferenceSchema.safeParse(user?.dietaryPreferences);
    // Only actual structured user reports enter precision mapping, never legacy demo taxa.
    const owned = samples.filter(
      (s) =>
        s.processingStatus === "completed" &&
        abundanceSchema.safeParse(
          (s.structuredData as any)?.bacteria_percentages,
        ).success,
    );
    const sample = sampleId
      ? owned.find((s) => s.id === sampleId)
      : owned.sort((a, b) => +new Date(b.testDate) - +new Date(a.testDate))[0];
    if (sampleId && !sample) throw new Error("SAMPLE_NOT_FOUND");
    let report: TaxonReport | null = null;
    if (sample) {
      const percentages = abundanceSchema.parse(
        (sample.structuredData as any).bacteria_percentages,
      );
      // Legacy prototype outputs are not validated personal predictions.
      report = {
        id: sample.id,
        date: sample.testDate.toISOString(),
        taxa: Object.entries(percentages).map(([name, abundance]) => ({
          name,
          abundance,
        })),
        predictions: [],
      };
    }
    const resolved = resolvePlanningContext(context, user?.age);
    const result = buildPrecisionReport(
      records,
      resolved.context,
      preferences.success ? preferences.data : defaultPreferences,
      report,
    );
    result.safetyBlocks.unshift(...resolved.blocks);
    result.plans = result.plans.map(historicalPlanRecord);
    const meals = await store.getMeals(userId);
    const recent = meals.filter(
      (m) =>
        +new Date(m.loggedAt) >= Date.now() - 28 * 86400000 &&
        +new Date(m.loggedAt) <= Date.now(),
    );
    const nutrientKeys = Array.from(
      new Set(
        recent.flatMap((m) =>
          ((m.intelligence as any)?.nutrients || []).map((n: any) =>
            String(n.key),
          ),
        ),
      ),
    ) as string[];
    const intake = nutrientKeys.map((key) => {
      const values = recent.flatMap((m) =>
        ((m.intelligence as any)?.nutrients || []).filter(
          (n: any) =>
            n.key === key &&
            typeof n.amount === "number" &&
            Number.isFinite(n.amount),
        ),
      );
      return {
        key,
        name: values[0]?.name || key,
        unit: values[0]?.unit || "",
        knownTotal: values.reduce((sum, n) => sum + n.amount, 0),
        mealsWithEstimate: values.length,
        completeMeals: values.filter((n) => n.coverage === 1).length,
      };
    });
    return {
      ...result,
      ageSources: resolved.ageSources,
      availableReports: owned.map((s) => ({
        id: s.id,
        date: s.testDate.toISOString(),
        name: s.testingCompany || "Structured report",
      })),
      intake: {
        days: 28,
        mealsLogged: recent.length,
        nutrients: intake,
        note: "Totals cover recorded estimates only. Missing meals, missing nutrients and partial coverage prevent adequacy or deficiency conclusions.",
      },
      journalSymptoms: recent
        .filter((m) => (m.mealContext as any)?.symptoms)
        .map((m) => ({
          mealId: m.id,
          date: m.loggedAt,
          symptoms: (m.mealContext as any).symptoms,
        })),
    };
  }
  const unavailable = (res: any, error: unknown) => {
    if (error instanceof Error && error.message === "SAMPLE_NOT_FOUND")
      return res.status(404).json({
        error: "Report not found in your supported structured reports.",
      });
    return res.status(503).json({
      error:
        "Precision data could not load or save. Please retry or contact support.",
    });
  };
  app.get("/api/precision/evidence-network", (_req, res) =>
    res.json(evidenceNetwork()),
  );
  app.get("/api/precision/weekly-plans", async (req, res) => {
    try {
      const records = await store.getPrecisionRecords(req.session.userId!);
      res.json(
        records.filter(
          (r) =>
            r.kind === "plan" && (r.payload as any)?.type === "weekly-plan",
        ).map(historicalPlanRecord),
      );
    } catch (e) {
      unavailable(res, e);
    }
  });
  app.get("/api/precision/planning-recipes", async (req, res) => {
    try {
      const report = await reportFor(req.session.userId!);
      const user = await store.getUser(req.session.userId!);
      const saved = preferenceSchema.safeParse(user?.dietaryPreferences);
      res.json(
        eligiblePlanningRecipes(
          saved.success ? saved.data : defaultPreferences,
          report.context.allergies,
        ),
      );
    } catch (e) {
      unavailable(res, e);
    }
  });
  async function todayPlanFor(userId: string, input: { date: string; timezoneOffset: number; hour: number; plan?: import("../shared/weekly-planner").WeeklyRequest }) {
    const bounds = localDayBounds(input.date, input.timezoneOffset);
      const id = userId,
        [user, records, meals, report] = await Promise.all([
          store.getUser(id),
          store.getPrecisionRecords(id),
          store.getMeals(id),
          reportFor(id),
        ]);
      const prefs = preferenceSchema.safeParse(user?.dietaryPreferences);
      const recentPlan = records
        .filter(
          (r) =>
            r.kind === "plan" && (r.payload as any)?.type === "weekly-plan",
        )
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
      const saved = weeklyRequestSchema.safeParse(
        (recentPlan?.payload as any)?.request,
      );
      const reference = nutritionTargetReference(user);
      const profileComplete = reference.basis.usesProfile;
      // Keep the existing explicit planning examples and bounds; only actual,
      // supported adult fields can supply a profile-derived estimate.
      const energy = profileComplete ? reference.calories : 2200;
      const base = weeklyRequestSchema.parse({
        days: 1,
        targets: {
          calories: Math.min(4500, Math.max(1200, energy)),
          protein: profileComplete
            ? Math.min(250, Math.max(40, reference.protein))
            : 100,
          fiber: 30,
          fiberMaximum: 45,
          sodium: 2300,
          saturatedFat: 20,
        },
        nutrientTargets: {
          carbohydrates_total_g: {
            min: Math.round((energy * 0.45) / 4),
            max: Math.round((energy * 0.55) / 4),
          },
          fat_total_g: {
            min: Math.round((energy * 0.2) / 9),
            max: Math.round((energy * 0.35) / 9),
          },
        },
      });
      const request = input.plan || (saved.success ? saved.data : base),
        targetSource = input.plan
          ? "Targets confirmed in this form"
          : saved.success
            ? "Latest saved weekly-plan targets"
            : profileComplete
              ? "Estimated from your profile; review before relying on them"
              : "Example targets — review and confirm to personalize";
      const today = meals.filter(
        (m) =>
          +new Date(m.loggedAt) >= +bounds.startOfDay &&
          +new Date(m.loggedAt) <= +bounds.endOfDay &&
          +new Date(m.loggedAt) <= Date.now(),
      );
      const result = buildTodayPlan(
        today,
        input.hour,
        prefs.success ? prefs.data : defaultPreferences,
        report,
        request,
      );
      if (!input.plan && !saved.success && !profileComplete) {
        result.meals = [];
        result.status = "needs-context";
        result.warnings.unshift(
          "Set and confirm your daily targets below. Example targets are not a prescription.",
        );
      }
      return { ...result, targetSource };
  }
  app.post("/api/precision/today-plan", async (req, res) => {
    const parsed = z
      .object({
        date: z.string(),
        timezoneOffset: z.number().int(),
        hour: z.number().int().min(0).max(23),
        plan: weeklyRequestSchema.optional(),
      })
      .strict()
      .safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({
          error: "Choose a valid local day, time and nutrient targets.",
        });
    let bounds;
    try {
      bounds = localDayBounds(parsed.data.date, parsed.data.timezoneOffset);
    } catch {
      return res.status(400).json({ error: "Invalid local date or timezone." });
    }
    try {
      res.json(await todayPlanFor(req.session.userId!, parsed.data));
    } catch (e) {
      unavailable(res, e);
    }
  });
  const planningRequests = new Map<string, { at: number; count: number }>();
  const researchRequests = new Map<string, number>();
  app.post("/api/precision/metabolite-research", requireRestrictedCapability("bloom.microbiome.flux"), async (req, res) => {
    const parsed = z
      .object({
        planId: z.string().min(1).max(100),
        run: z.boolean().default(false),
        researchConsent: z.boolean().default(false),
      })
      .strict()
      .safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Select a saved weekly plan." });
    if (parsed.data.run && !parsed.data.researchConsent)
      return res.status(400).json({
        error:
          "Consent is required to send microbial abundances and planned food quantities to the research service.",
      });
    const userId = req.session.userId!;
    if (parsed.data.run) {
      const now = Date.now();
      for (const [id, at] of Array.from(researchRequests))
        if (now - at >= 60000) researchRequests.delete(id);
      if (researchRequests.has(userId))
        return res
          .status(429)
          .json({ error: "Wait a minute before another simulation." });
      researchRequests.set(userId, now);
    }
    try {
      const records = await store.getPrecisionRecords(userId);
      const record = records.find(
        (r) =>
          r.id === parsed.data.planId &&
          r.kind === "plan" &&
          (r.payload as any)?.type === "weekly-plan",
      );
      if (!record)
        return res.status(404).json({ error: "Saved weekly plan not found." });
      const report = await reportFor(userId);
      const prepared = prepareResearch(
        record.payload as WeeklyPlan,
        report.microbiome.report,
      );
      res.json(
        parsed.data.run
          ? await simulateResearch(prepared)
          : { ...prepared, result: null },
      );
    } catch {
      res.status(503).json({
        error:
          "Research inputs or model output could not be verified. No prediction is available. Your meal plan is unchanged.",
      });
    }
  });

  app.post("/api/precision/recipe-ideas", async (req, res) => {
    const parsed = z
      .object({
        aiConsent: z.literal(true),
        instruction: z.string().trim().max(500).default(""),
      })
      .strict()
      .safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        error:
          "Explicit consent is required to send food preferences and allergy exclusions to the AI provider.",
      });
    const id = req.session.userId!,
      now = Date.now();
    const prior = planningRequests.get(id);
    if (prior && now - prior.at < 60000 && prior.count >= 8)
      return res
        .status(429)
        .json({ error: "Please wait a minute before another request." });
    planningRequests.set(id, {
      at: now,
      count: prior && now - prior.at < 60000 ? prior.count + 1 : 1,
    });
    try {
      const report = await reportFor(id);
      if (
        report.context.ageGroup !== "adult" ||
        report.context.pregnancy !== "no" ||
        !report.context.safetyReviewed
      )
        return res.status(422).json({
          error: "Complete your reviewed adult health context first.",
        });
      const user = await store.getUser(id),
        saved = preferenceSchema.safeParse(user?.dietaryPreferences);
      res.json({
        recipes: await generateRecipes(
          saved.success ? saved.data : defaultPreferences,
          report.context.allergies,
          parsed.data.instruction,
          aiExecutionContext(id, true),
        ),
        note: "AI proposed ingredient combinations from sourced foods. The server validates restrictions and calculates nutrition; the weekly optimizer must still verify the complete plan.",
      });
    } catch (error) {
      res.status(503).json(recipeFailure(error));
    }
  });
  for (const action of ["preview", "save"] as const)
    app.post(`/api/precision/weekly-plans/${action}`, async (req, res) => {
      const parsed = weeklyRequestSchema.safeParse(req.body);
      if (!parsed.success)
        return res.status(400).json({
          error: "Check planning targets, duration and selected meals.",
        });
      const userId = req.session.userId!;
      const now = Date.now();
      for (const [id, entry] of Array.from(planningRequests))
        if (now - entry.at > 60000) planningRequests.delete(id);
      const entry = planningRequests.get(userId) || { at: now, count: 0 };
      if (entry.count >= 8)
        return res.status(429).json({
          error: "Please wait a minute before rebuilding another plan.",
        });
      entry.count++;
      planningRequests.set(userId, entry);
      try {
        const report = await reportFor(userId);
        const user = await store.getUser(userId);
        const saved = preferenceSchema.safeParse(user?.dietaryPreferences);
        const plan = await runWeeklyPlanning(
          parsed.data,
          saved.success ? saved.data : defaultPreferences,
          report,
        );
        if (action === "save") {
          if (!plan.checksPassed)
            return res.status(422).json({
              error:
                "The plan cannot be saved until every day meets your targets. Review unmet targets or restrictions in the preview.",
            });
          return res
            .status(201)
            .json(await store.insertPrecisionRecord(userId, "plan", plan));
        }
        res.json(plan);
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("A locked meal"))
          return res.status(400).json({ error: e.message });
        if (e instanceof Error && e.message === "PRECISION_INPUTS_CHANGED")
          return res.status(409).json({
            error:
              "Your biology or preferences changed while planning. Generate a fresh plan before saving.",
          });
        if (
          e instanceof Error &&
          ["PLANNING_BUSY", "PLANNING_TIMEOUT"].includes(e.message)
        )
          return res.status(503).json({
            error:
              "The planner is busy or took too long. Retry shortly or choose fewer days.",
          });
        unavailable(res, e);
      }
    });
  app.get("/api/precision", async (req, res) => {
    if (
      req.query.sampleId !== undefined &&
      typeof req.query.sampleId !== "string"
    )
      return res.status(400).json({ error: "Invalid report selection" });
    try {
      res.json(
        await reportFor(
          req.session.userId!,
          req.query.sampleId as string | undefined,
        ),
      );
    } catch (e) {
      unavailable(res, e);
    }
  });
  app.put("/api/precision/context", async (req, res) => {
    const p = contextSchema.safeParse(req.body);
    if (!p.success)
      return res.status(400).json({ error: "Invalid health context" });
    try {
      await store.putPrecisionContext(req.session.userId!, p.data);
      res.json(p.data);
    } catch (e) {
      unavailable(res, e);
    }
  });
  app.post("/api/precision/labs/import", async(req,res)=>{
    const input=z.object({payload:z.union([labSchema,sourceOnlyLabSchema]),reviewedMatchIds:z.array(z.string().min(1).max(100)).max(1000).refine(ids=>new Set(ids).size===ids.length)}).strict().safeParse(req.body);
    const key=req.get("Idempotency-Key");
    if(!input.success||!key||!/^[A-Za-z0-9_-]{8,128}$/.test(key))return res.status(400).json({error:"Review the source result and current matches with a valid save reference."});
    const payload=input.data.payload;
    if(payload.dateCorrection||("unitReview" in payload&&payload.unitReview&&(payload.unitReview.status!=="pending"||payload.unitReview.confirmedAt!==null||payload.unitReview.supersedes!==null||payload.value!==payload.unitReview.originalValue)))
      return res.status(400).json({error:"Import original source facts; use the separate date and unit review actions for revisions."});
    try{
      if(!store.insertReviewedLab)return res.status(503).json({error:"Atomic laboratory match review is unavailable. No legacy save was attempted."});
      res.status(201).json(await store.insertReviewedLab(req.session.userId!,payload,key,input.data.reviewedMatchIds));
    }catch(error){
      if(error instanceof LabImportReviewRequired)return res.status(409).json({code:"LAB_REIMPORT_REVIEW_REQUIRED",error:"Recorded source matches changed. Review the current matches before recording a separate result.",matchedIds:error.matchedIds});
      if(error instanceof Error&&error.message==="PRECISION_SAVE_CONFLICT")return res.status(409).json({code:"LAB_SAVE_CONFLICT",error:"This save reference belongs to different source facts. Keep the original request for retry."});
      if(error instanceof Error&&error.message==="LAB_SOURCE_CHANGED")return res.status(409).json({code:"LAB_SOURCE_CHANGED",error:"Laboratory sources changed or cannot be classified safely. Review the current source history."});
      unavailable(res,error);
    }
  });
  app.post("/api/precision/records", async (req, res) => {
    const p = precisionEntrySchema.safeParse(req.body);
    if (!p.success)
      return res
        .status(400)
        .json({ error: p.error.issues.map((i) => i.message).join("; ") });
    const saveKey=req.get("Idempotency-Key");
    if(saveKey!==undefined&&(p.data.kind!=="lab"||!/^[A-Za-z0-9_-]{8,128}$/.test(saveKey)))return res.status(400).json({error:"Use a valid laboratory save reference."});
    try {
      const userId = req.session.userId!;
      if (p.data.kind === "lab" && p.data.payload.dateCorrection)
        return res.status(400).json({error:"Use the reviewed date correction action to preserve source history."});
      if (p.data.kind === "lab" && "unitReview" in p.data.payload && p.data.payload.unitReview &&
        (p.data.payload.unitReview.status !== "pending" || p.data.payload.unitReview.confirmedAt !== null ||
         p.data.payload.unitReview.supersedes !== null || p.data.payload.value !== p.data.payload.unitReview.originalValue))
        return res.status(400).json({error:"Import provisional units first, then use the source-unit confirmation action."});
      if (p.data.kind === "checkin" && p.data.payload.planId) {
        const planId = p.data.payload.planId;
        const owned = await store.getPrecisionRecords(userId);
        if (!owned.some((r) => r.kind === "plan" && r.id === planId))
          return res
            .status(400)
            .json({ error: "Select one of your saved plans." });
      }
      const record = await store.insertPrecisionRecord(
        userId,
        p.data.kind,
        p.data.payload,
        saveKey,
      );
      res.status(201).json(record);
    } catch (e) {
      if(e instanceof Error&&e.message==="PRECISION_SAVE_CONFLICT")return res.status(409).json({error:"This save reference belongs to different results. Retry the original result or start a separate reviewed entry."});
      unavailable(res, e);
    }
  });
  app.post("/api/precision/labs/:id/confirm-unit", async (req, res) => {
    const request = z.object({unit:z.string().min(1).max(50)}).strict().safeParse(req.body);
    if (!request.success) return res.status(400).json({error:"Choose the unit printed on your source report."});
    try {
      const userId=req.session.userId!, records=await store.getPrecisionRecords(userId);
      const source=records.find(r=>r.id===req.params.id && r.kind==="lab");
      if(!source) return res.status(404).json({error:"Laboratory record not found in your account."});
      const parsed=labSchema.safeParse(source.payload);
      if(!parsed.success || parsed.data.unitReview?.status!=="pending") return res.status(409).json({error:"This record is not awaiting a unit confirmation."});
      const active=activeLabRows(records.flatMap(record=>{const payload=record.kind==="lab"?labSchema.safeParse(record.payload):null;return payload?.success?[{...payload.data,id:record.id}]:[];}));
      const prior=active.find(row=>row.unitReview?.supersedes===source.id);
      if(!prior&&!active.some(row=>row.id===source.id))return res.status(409).json({error:"This source was revised. Reload and review the current result."});
      if(prior) return res.json(records.find(record=>record.id===prior.id));
      const original=parsed.data, review=original.unitReview!;
      // Reinterpret the ORIGINAL number, never convert an earlier guessed normalization.
      const payload=labSchema.safeParse({...original,value:review.originalValue,unit:request.data.unit,referenceLow:null,referenceHigh:null,
        unitReview:{...review,status:"confirmed",confirmedAt:new Date().toISOString(),supersedes:source.id}});
      if(!payload.success) return res.status(400).json({error:"Unsupported source unit for this marker."});
      res.status(201).json(await store.insertPrecisionRecord(userId,"lab",payload.data));
    }catch(e){
      if(e instanceof Error&&e.message==="LAB_SOURCE_CHANGED")return res.status(409).json({error:"This source was revised. Reload and review the current result."});
      unavailable(res,e);
    }
  });
  app.post("/api/precision/plans", async (req, res) => {
    const p = z
      .object({
        name: z.string().trim().min(1).max(100),
        sampleId: z.string().max(100).optional(),
      })
      .strict()
      .safeParse(req.body);
    if (!p.success)
      return res.status(400).json({ error: "Give this plan a name." });
    try {
      const userId = req.session.userId!,
        report = await reportFor(userId, p.data.sampleId);
      if (!report.recommendations.length)
        return res.status(400).json({
          error:
            "Add an adult profile and supported goals or measurements before saving a plan.",
        });
      res.status(201).json(
        await store.insertPrecisionRecord(userId, "plan", {
          name: p.data.name,
          version: report.version,
          startedAt: new Date().toISOString(),
          goals: report.context.goals,
          recommendations: report.recommendations.map((r) => ({
            id: r.id,
            name: r.name,
            reasons: r.reasons,
            sourceIds: r.sourceIds,
            matchedRecordIds: r.matchedRecordIds,
          })),
          reviewFlags: report.reviewFlags,
          supplements: report.supplements,
          rankingNote: report.rankingNote,
        }),
      );
    } catch (e) {
      unavailable(res, e);
    }
  });
  app.post("/api/precision/labs/:id/correct-date", async (req, res) => {
    const input=labDateChangeSchema.safeParse(req.body),key=req.get("Idempotency-Key");
    if(req.get("X-Bloom-Confirm")!=="correct-lab-date"||!input.success||!key||!/^[A-Za-z0-9_-]{8,128}$/.test(key))
      return res.status(400).json({error:"Review a valid source date, optional time and correction reason, with a new correction reference."});
    try{
      if(!store.correctLabDate)return res.status(503).json({error:"Date correction is unavailable. No source was replaced."});
      res.status(201).json(await store.correctLabDate(req.session.userId!,req.params.id,input.data,key));
    }catch(e){
      if(e instanceof Error&&e.message==="LAB_NOT_FOUND")return res.status(404).json({error:"Laboratory result not found in your account."});
      if(e instanceof Error&&["LAB_SOURCE_CHANGED","PRECISION_SAVE_CONFLICT"].includes(e.message))return res.status(409).json({error:"The source or correction reference changed. Cancel and review the current result."});
      if(e instanceof z.ZodError||e instanceof Error&&["LAB_DATE_UNCHANGED","LAB_DATE_INVALID"].includes(e.message))return res.status(400).json({error:"Review a changed source date/time and valid reason. Values and units cannot be changed here."});
      unavailable(res,e);
    }
  });
  app.delete("/api/precision/labs/:id/entry", async (req, res) => {
    if (req.headers["x-bloom-confirm"] !== "delete-lab-entry-and-revisions")
      return res.status(400).json({ error: "Explicit result and revision deletion confirmation is required." });
    try {
      if (!store.deleteLabEntry) return res.status(503).json({ error: "Laboratory entry deletion is unavailable. No fallback deletion was attempted." });
      await store.deleteLabEntry(req.session.userId!, req.params.id);
      res.status(204).end();
    } catch (e) {
      if (e instanceof Error && e.message === "LAB_SOURCE_CHANGED")
        return res.status(409).json({ error: "Laboratory sources changed. Reload and review the current result before deleting." });
      unavailable(res, e);
    }
  });
  app.delete("/api/precision/records/:id", async (req, res) => {
    try {
      if (
        !(await store.deletePrecisionRecord(req.session.userId!, req.params.id))
      )
        return res.status(404).json({ error: "Record not found" });
      res.status(204).end();
    } catch (e) {
      unavailable(res, e);
    }
  });
  app.delete("/api/precision", async (req, res) => {
    if (req.headers["x-bloom-confirm"] !== "delete-precision-data")
      return res.status(400).json({
        error: "Explicit precision-data deletion confirmation is required.",
      });
    try {
      await store.clearPrecisionData(req.session.userId!);
      res.status(204).end();
    } catch (e) {
      unavailable(res, e);
    }
  });
  return { reportFor, todayPlanFor };
}
