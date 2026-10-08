import type { Express, RequestHandler } from "express";
import { z } from "zod";
import {
  preferenceSchema,
  defaultPreferences,
  recommendMeals,
  cohortResearch,
  mealContextSchema,
  recipes,
} from "../shared/meal-intelligence";
import { pathways, evidenceSources } from "../shared/science-coach";
import { analyzeMeal, nutritionTotals } from "./meal-intelligence";
import { prioritizeRecipes } from "./recipe-ranking";
import type { IStorage } from "./storage";
const requestSchema = z
  .object({
    mealText: z.string().trim().min(1).max(2000),
    mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
    mealContext: mealContextSchema.optional(),
    aiConsent: z.boolean().default(false),
  })
  .strict();
export function registerPlannerRoutes(
  app: Express,
  requireAuth: RequestHandler,
  storage: IStorage,
  analyzer = analyzeMeal,
) {
  const limited = new Map<string, { at: number; count: number }>();
  const limit: RequestHandler = (req, res, next) => {
    const now = Date.now();
    for (const [id, v] of Array.from(limited))
      if (now - v.at > 60000) limited.delete(id);
    const id = req.session.userId!;
    const entry = limited.get(id) || { at: now, count: 0 };
    if (entry.count >= 6)
      return void res
        .status(429)
        .json({ error: "Please wait a minute before another analysis." });
    entry.count++;
    limited.set(id, entry);
    next();
  };
  app.get("/api/preferences", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      const saved = preferenceSchema.safeParse(user?.dietaryPreferences);
      res.json(saved.success ? saved.data : defaultPreferences);
    } catch {
      res.status(503).json({ error: "Preferences could not load." });
    }
  });
  app.put("/api/preferences", requireAuth, async (req, res) => {
    const parsed = preferenceSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid preferences" });
    try {
      await storage.updateUserProfile(req.session.userId!, {
        dietaryPreferences: parsed.data,
      });
      res.json(parsed.data);
    } catch {
      res.status(503).json({ error: "Preferences could not save." });
    }
  });
  app.post(
    "/api/meal-planner/prioritize",
    requireAuth,
    limit,
    async (req, res) => {
      if (
        !z.object({ aiConsent: z.boolean() }).strict().safeParse(req.body)
          .success
      )
        return res.status(400).json({ error: "Choose AI consent." });
      try {
        const user = await storage.getUser(req.session.userId!);
        const saved = preferenceSchema.safeParse(user?.dietaryPreferences);
        const preferences = saved.success ? saved.data : defaultPreferences;
        const meals = await storage.getMeals(req.session.userId!);
        const recent = meals.filter(
          (m) =>
            +new Date(m.loggedAt) >= Date.now() - 14 * 86400000 &&
            +new Date(m.loggedAt) <= Date.now(),
        );
        res.json(
          await prioritizeRecipes(
            recommendMeals(
              preferences,
              recent.map((m) => m.mealText),
            ),
            preferences,
            req.body.aiConsent,
          ),
        );
      } catch {
        res.status(503).json({ error: "Meal prioritization unavailable." });
      }
    },
  );
  app.get("/api/meal-planner", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      const saved = preferenceSchema.safeParse(user?.dietaryPreferences);
      const preferences = saved.success ? saved.data : defaultPreferences;
      const meals = await storage.getMeals(req.session.userId!);
      const recent = meals.filter(
        (m) =>
          +new Date(m.loggedAt) >= Date.now() - 14 * 86400000 &&
          +new Date(m.loggedAt) <= Date.now(),
      );
      const suggestions = recommendMeals(
        preferences,
        recent.map((m) => m.mealText),
      );
      const ids = new Set(suggestions.flatMap((r) => r.pathwayIds));
      res.json({
        preferences,
        suggestions,
        pathways: pathways.filter((p) => ids.has(p.id)),
        sources: evidenceSources,
        cohorts: cohortResearch.filter((c) =>
          preferences.goals.includes(c.id as any),
        ),
        recentMeals: recent.length,
        note: "Curated complete recipes ranked by supported goals and recent food mentions. Recipes are practical translations, not trial-tested interventions. AI ingredient parsing is optional when analyzing meals; this planner does not yet generate unrestricted recipes.",
      });
    } catch {
      res.status(503).json({ error: "Meal plan could not load." });
    }
  });
  app.post("/api/meals/analyze", requireAuth, limit, async (req, res) => {
    const p = requestSchema.safeParse(req.body);
    if (!p.success)
      return res
        .status(400)
        .json({ error: "Invalid meal description or context." });
    try {
      res.json(await analyzer(p.data.mealText, p.data.aiConsent));
    } catch {
      res
        .status(503)
        .json({ error: "Analysis unavailable. Try saving the meal." });
    }
  });
  // Register before the legacy /api/meals handlers. Existing clients remain compatible.
  app.post("/api/meals", requireAuth, limit, async (req, res) => {
    const p = requestSchema.safeParse(req.body);
    if (!p.success)
      return res
        .status(400)
        .json({ error: "Invalid meal description or context." });
    try {
      const result = await analyzer(p.data.mealText, p.data.aiConsent);
      const meal = await storage.insertMeal({
        userId: req.session.userId!,
        mealText: p.data.mealText,
        mealType: p.data.mealType,
        mealContext: p.data.mealContext,
        intelligence: result.intelligence,
        nutritionalData: result.nutritionalData,
        ...nutritionTotals(result.nutritionalData),
        ...(p.data.mealContext?.eatenAt
          ? { loggedAt: new Date(p.data.mealContext.eatenAt) }
          : {}),
      } as any);
      res.json(meal);
    } catch {
      res.status(503).json({ error: "Meal could not save. Please retry." });
    }
  });
  app.put("/api/meals/:mealId", requireAuth, limit, async (req, res) => {
    const p = requestSchema.safeParse(req.body);
    if (!p.success)
      return res
        .status(400)
        .json({ error: "Invalid meal description or context." });
    try {
      const meal = await storage.getMeal(req.params.mealId);
      if (!meal) return res.status(404).json({ error: "Meal not found" });
      if (meal.userId !== req.session.userId)
        return res.status(403).json({ error: "Access denied" });
      const result = await analyzer(p.data.mealText, p.data.aiConsent);
      res.json(
        await storage.updateMeal(meal.id, {
          mealText: p.data.mealText,
          mealType: p.data.mealType ?? meal.mealType,
          mealContext: p.data.mealContext ?? meal.mealContext,
          ...(p.data.mealContext?.eatenAt
            ? { loggedAt: new Date(p.data.mealContext.eatenAt) }
            : {}),
          intelligence: result.intelligence,
          nutritionalData: result.nutritionalData,
          ...nutritionTotals(result.nutritionalData),
        }),
      );
    } catch {
      res.status(503).json({ error: "Meal could not update." });
    }
  });
  app.get("/api/meal-planner/progress", requireAuth, async (req, res) => {
    try {
      const meals = await storage.getMeals(req.session.userId!);
      const cutoff = Date.now() - 28 * 86400000;
      const recent = meals.filter(
        (m) =>
          +new Date(m.loggedAt) >= cutoff &&
          +new Date(m.loggedAt) <= Date.now(),
      );
      res.json({
        weeks: Array.from({ length: 4 }, (_, index) => {
          const start = cutoff + index * 7 * 86400000;
          const entries = recent.filter(
            (m) =>
              +new Date(m.loggedAt) >= start &&
              +new Date(m.loggedAt) < start + 7 * 86400000,
          );
          return {
            start: new Date(start).toISOString(),
            meals: entries.length,
            nutritionAvailable: entries.filter((m) => m.totalCalories !== null)
              .length,
            symptoms: ["bloating", "energy", "comfort", "clarity"].map(
              (key) => {
                const values = entries
                  .map((m) => (m.mealContext as any)?.symptoms?.[key])
                  .filter((v) => typeof v === "number");
                return {
                  key,
                  average: values.length
                    ? values.reduce((n, v) => n + v, 0) / values.length
                    : null,
                  entries: values.length,
                };
              },
            ),
          };
        }),
        adherence: recipes.map((r) => ({
          id: r.id,
          name: r.name,
          possibleMatches: recent.filter((m) =>
            r.ingredients.every((i) =>
              i.name
                .toLowerCase()
                .split(" ")
                .filter((w) => w.length > 3)
                .some((w) => m.mealText.toLowerCase().includes(w)),
            ),
          ).length,
        })),
        note: "Food matches are approximate and do not prove a recipe was followed. Symptom trends are observations, not evidence of causation.",
      });
    } catch {
      res.status(503).json({ error: "Progress could not load." });
    }
  });
}
