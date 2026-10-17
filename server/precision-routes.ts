import type { Express, RequestHandler } from "express";
import { z } from "zod";
import type { IStorage } from "./storage";
import {
  buildPrecisionReport,
  contextSchema,
  precisionEntrySchema,
  type TaxonReport,
} from "../shared/precision-nutrition";
import {
  preferenceSchema,
  defaultPreferences,
} from "../shared/meal-intelligence";
import { abundanceSchema } from "../shared/report-import";

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
      const predictions = await store.getMetabolites(sample.id);
      report = {
        id: sample.id,
        date: sample.testDate.toISOString(),
        taxa: Object.entries(percentages).map(([name, abundance]) => ({
          name,
          abundance,
        })),
        predictions: predictions.map((m) => ({
          name: m.metaboliteName,
          value: m.predictedConcentration,
        })),
      };
    }
    const result = buildPrecisionReport(
      records,
      context,
      preferences.success ? preferences.data : defaultPreferences,
      report,
    );
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
  app.post("/api/precision/records", async (req, res) => {
    const p = precisionEntrySchema.safeParse(req.body);
    if (!p.success)
      return res
        .status(400)
        .json({ error: p.error.issues.map((i) => i.message).join("; ") });
    try {
      const userId = req.session.userId!;
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
      );
      res.status(201).json(record);
    } catch (e) {
      unavailable(res, e);
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
}
