import {registerNutritionTargetRoutes} from "./nutrition-targets";
import {registerNutritionHistoryRoutes} from "./nutrition-history";
import {analyzeReportedComposition} from "./report-analysis";
import {registerFeatureAdministration} from './feature-administration';
import { registerCapabilityAccess, CapabilityPreferenceStorage } from "./capability-access";
import { AccountErasureStorage } from "./account-erasure";
import { requireActiveAccount, AccountSessionGuard } from "./account-auth";
import { registerAccountRoutes } from "./account-routes";
import { AccountExportStorage } from "./account-export";
import { reportedAbundanceAnalysis, historicalAnalysisMetadata, publicSample } from "./analysis-boundary";
import { registerRetiredHealthRoutes } from "./retired-health-routes";
import { registerBiologyRoutes } from "./biology-routes";
import { registerExperienceRoutes } from "./experience-routes";
import { registerHealthSourceRoutes } from "./health-source-routes";
import { HealthSourceStorage } from "./health-source-storage";
import { db } from "./db";
import { describeRecordedDiet } from "../shared/diet-observations";
import { registerReportRoutes } from "./report-routes";
import {
  mealNutritionSummary,
  localDayBounds,
} from "../shared/nutrition-summary";
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mlServiceFetch } from "./ml-service";
import { registerAuthRoutes } from "./auth-routes";
import { registerScienceRoutes } from "./science-coach";
import { registerPlannerRoutes } from "./planner-routes";
import { registerPrecisionRoutes } from "./precision-routes";
import { updateUserProfileSchema } from "@shared/schema";
import {
  preferenceSchema,
  defaultPreferences,
  filterLegacyFoods,
} from "@shared/meal-intelligence";
import { abundanceSchema } from "@shared/report-import";


const requireAuth=requireActiveAccount(async id=>!!await storage.getUser(id));

export async function registerRoutes(app: Express): Promise<Server> {
  registerFeatureAdministration(app,requireAuth);
  registerScienceRoutes(app, {
    requireAuth,
    getMeals: (userId) => storage.getMeals(userId),
    getPreferences: async (userId) =>
      (await storage.getUser(userId))?.dietaryPreferences,
  });
  registerCapabilityAccess(app,requireAuth,new CapabilityPreferenceStorage(db));
  registerAccountRoutes(app, requireAuth, new AccountExportStorage(db), new AccountErasureStorage(db));
  registerPlannerRoutes(app, requireAuth, storage);
  const precisionService = registerPrecisionRoutes(app, requireAuth, storage);
  registerExperienceRoutes(app, requireAuth, storage, precisionService);
  registerHealthSourceRoutes(app, requireAuth, new HealthSourceStorage(db));
  registerReportRoutes(app, requireAuth, storage);
  registerBiologyRoutes(app, requireAuth, storage, precisionService);
  // Local descriptive summary of supported reported composition only.
  app.post('/api/microbiome/analyze/:sampleId',requireAuth,analyzeReportedComposition(storage));

  // Get analysis results
  app.get(
    "/api/microbiome/results/:sampleId",
    requireAuth,
    async (req, res) => {
      try {
        const { sampleId } = req.params;
        const userId = req.session.userId!;

        const sample = await storage.getMicrobiomeSample(sampleId);
        if (!sample) {
          return res.status(404).json({ error: "Sample not found" });
        }

        if (sample.userId !== userId) {
          return res.status(403).json({ error: "Access denied" });
        }

        const reported=abundanceSchema.safeParse((sample.structuredData as any)?.bacteria_percentages);
        const composition=reported.success?reportedAbundanceAnalysis(sampleId,reported.data):null;
        const bacterial=composition?.bacterial_composition.map((b,index)=>({id:`reported-${index}`,sampleId,bacterialName:b.bacterial_name,abundance:b.abundance,taxonomyLevel:b.taxonomy_level,genomeData:null}))||[];
        const analyses = await storage.getMlAnalyses(sampleId);

        res.json({
          sample:{...publicSample(sample),diversityIndex:composition?.diversity_index??null},
          bacterial_composition: bacterial,
          metabolites: [],
          recommendations: [],
          analyses: historicalAnalysisMetadata(analyses),
          interpretationStatus: "unvalidated_model_outputs_withheld",
          interpretationNote: "Historical prototype molecule values, health effects and supplement doses are withheld. Use reviewed pathways and actual laboratory measurements.",
        });
      } catch (error: any) {
        console.error("Results request could not be completed.");
        res.status(503).json({ error: "Results could not load. Please retry." });
      }
    },
  );

  // Health check for ML service
  app.get("/api/ml/health", async (req, res) => {
    try {
      const mlResponse = await mlServiceFetch("/health");
      if (!mlResponse.ok) throw Error("Processing service unavailable.");
      res.json({ ml_service: { status: "healthy" } });
    } catch (error: any) {
      res.status(503).json({ ml_service: "unavailable" });
    }
  });

  // Demo data endpoints
  app.get("/api/demo/user", async (req, res) => {
    try {
      const demoUser = await storage.getDemoUser();
      if (!demoUser) {
        return res.status(404).json({ error: "Demo user not found" });
      }
      res.json({ id: demoUser.id, username: demoUser.username });
    } catch (error: any) {
      res.status(503).json({ error: "This request could not be completed. Please retry." });
    }
  });

  app.get("/api/demo/samples", async (req, res) => {
    try {
      const samples = await storage.getDemoSamples();
      res.json(samples.map(publicSample));
    } catch (error: any) {
      res.status(503).json({ error: "This request could not be completed. Please retry." });
    }
  });

  // Meal tracking endpoints
  app.get(
    ["/api/meals", "/api/meals/:userId"],
    requireAuth,
    async (req, res) => {
      try {
        const userId = req.session.userId!;
        if (req.params.userId && req.params.userId !== userId) {
          return res.status(403).json({ error: "Access denied" });
        }
        const meals = await storage.getMeals(userId);
        res.json(meals);
      } catch (error: any) {
        res.status(503).json({ error: "This request could not be completed. Please retry." });
      }
    },
  );

  app.delete("/api/meals/:mealId", requireAuth, async (req, res) => {
    try {
      const { mealId } = req.params;
      const userId = req.session.userId!;

      const existingMeal = await storage.getMeal(mealId);
      if (!existingMeal) {
        return res.status(404).json({ error: "Meal not found" });
      }

      if (existingMeal.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      await storage.deleteMeal(mealId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Meal deletion could not be completed.");
      res.status(503).json({ error: "This request could not be completed. Please retry." });
    }
  });

  registerNutritionTargetRoutes(app,requireAuth,storage);

  app.get("/api/nutrition/daily/:userId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const requestedUserId = req.params.userId;

      if (userId !== requestedUserId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const { date, timezoneOffset } = req.query;
      let startOfDay: Date, endOfDay: Date;
      if (timezoneOffset !== undefined) {
        try {
          ({ startOfDay, endOfDay } = localDayBounds(
            String(date || ""),
            Number(timezoneOffset),
          ));
        } catch {
          return res
            .status(400)
            .json({ error: "Invalid local date or timezone offset." });
        }
      } else {
        const targetDate = date ? new Date(String(date)) : new Date();
        if (!Number.isFinite(+targetDate))
          return res.status(400).json({ error: "Invalid date." });
        startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      }

      const meals = await storage.getMeals(userId);
      const dailyMeals = meals.filter((meal) => {
        const mealDate = new Date(meal.loggedAt);
        return mealDate >= startOfDay && mealDate <= endOfDay;
      });

      const summary = mealNutritionSummary(dailyMeals);

      res.json({
        meals: dailyMeals,
        totals: summary.totals,
        nutritionCoverage: summary.coverage,
        isPartial: summary.isPartial,
      });
    } catch (error: any) {
      res.status(503).json({ error: "This request could not be completed. Please retry." });
    }
  });

  registerNutritionHistoryRoutes(app,requireAuth,storage);

  app.get("/api/profile", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(404).json({ error: "User not found" });
      const { password, ...profile } = user;
      res.json(profile);
    } catch {
      res.status(503).json({ error: "Profile unavailable" });
    }
  });
  app.patch("/api/user/:userId/profile", requireAuth, async (req, res) => {
    if (req.params.userId !== req.session.userId)
      return res.status(403).json({ error: "Access denied" });
    const parsed = updateUserProfileSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid profile" });
    try {
      await storage.updateUserProfile(req.session.userId!, parsed.data);
      res.json({ success: true });
    } catch {
      res.status(503).json({ error: "Profile could not save" });
    }
  });

  app.get("/api/microbiome/samples/:userId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const requestedUserId = req.params.userId;

      if (userId !== requestedUserId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const samples = await storage.getUserSamples(userId);
      res.json(samples.map(publicSample));
    } catch (error: any) {
      res.status(503).json({ error: "This request could not be completed. Please retry." });
    }
  });

  app.get(
    "/api/microbiome/diet-prediction/:userId",
    requireAuth,
    async (req, res) => {
      try {
        const userId = req.session.userId!;
        const requestedUserId = req.params.userId;

        if (userId !== requestedUserId) {
          return res.status(403).json({ error: "Access denied" });
        }

        const meals = await storage.getMeals(userId);
        res.json(describeRecordedDiet(meals));
      } catch (error: any) {
        res.status(503).json({ error: "This request could not be completed. Please retry." });
      }
    },
  );

  registerRetiredHealthRoutes(app, requireAuth, storage);

  const sessionGuard=new AccountSessionGuard(db);
  registerAuthRoutes(app, storage, undefined, (id,save)=>sessionGuard.withActiveAccount(id,save));

  const httpServer = createServer(app);

  return httpServer;
}

function analyzeDietaryPatterns(meals: any[]) {
  const totals = meals.reduce(
    (acc, meal) => {
      acc.fiber +=
        meal.nutritionalData?.reduce(
          (sum: number, item: any) => sum + (item.fiber_g || 0),
          0,
        ) || 0;
      acc.protein += meal.totalProtein || 0;
      acc.carbs += meal.totalCarbs || 0;
      acc.fat += meal.totalFat || 0;
      acc.sugar +=
        meal.nutritionalData?.reduce(
          (sum: number, item: any) => sum + (item.sugar_g || 0),
          0,
        ) || 0;
      return acc;
    },
    { fiber: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 },
  );

  const avgPerMeal = {
    fiber: totals.fiber / meals.length,
    protein: totals.protein / meals.length,
    carbs: totals.carbs / meals.length,
    fat: totals.fat / meals.length,
    sugar: totals.sugar / meals.length,
  };

  return {
    fiberIntake:
      avgPerMeal.fiber > 8 ? "high" : avgPerMeal.fiber > 4 ? "moderate" : "low",
    proteinIntake:
      avgPerMeal.protein > 25
        ? "high"
        : avgPerMeal.protein > 15
          ? "moderate"
          : "low",
    carbIntake:
      avgPerMeal.carbs > 50
        ? "high"
        : avgPerMeal.carbs > 30
          ? "moderate"
          : "low",
    sugarIntake:
      avgPerMeal.sugar > 15
        ? "high"
        : avgPerMeal.sugar > 8
          ? "moderate"
          : "low",
    avgFiber: avgPerMeal.fiber,
    avgProtein: avgPerMeal.protein,
    avgCarbs: avgPerMeal.carbs,
    avgSugar: avgPerMeal.sugar,
  };
}

function predictBacteriaFromDiet(patterns: any) {
  const bacteria = [];

  if (patterns.fiberIntake === "high") {
    bacteria.push({
      name: "Faecalibacterium prausnitzii",
      likelihood: "High",
      description:
        "Fiber-fermenting bacteria producing anti-inflammatory butyrate",
      dietaryDriver: `High fiber intake (~${Math.round(patterns.avgFiber)}g/meal) from whole grains, vegetables, legumes`,
      impact: "Produces butyrate → Reduces inflammation → Improved gut barrier",
    });
    bacteria.push({
      name: "Bifidobacterium longum",
      likelihood: "High",
      description: "Beneficial bacteria thriving on dietary fiber",
      dietaryDriver: `High fiber intake (~${Math.round(patterns.avgFiber)}g/meal) from whole grains, vegetables, legumes`,
      impact: "Ferments fiber → Produces SCFAs → Enhances immune function",
    });
  } else if (patterns.fiberIntake === "low") {
    bacteria.push({
      name: "Bacteroides fragilis",
      likelihood: "Moderate",
      description: "Common bacteria, less beneficial without fiber",
      dietaryDriver: `Low fiber intake (~${Math.round(patterns.avgFiber)}g/meal) limits beneficial bacteria`,
      impact: "Limited SCFA production → Reduced gut barrier integrity",
    });
  }

  if (patterns.proteinIntake === "high") {
    bacteria.push({
      name: "Akkermansia muciniphila",
      likelihood: "Moderate",
      description: "Mucin-degrading bacteria, supports metabolic health",
      dietaryDriver: `High protein intake (~${Math.round(patterns.avgProtein)}g/meal) from lean meats, fish, legumes`,
      impact: "Strengthens gut lining → Improves glucose metabolism",
    });
  }

  if (patterns.sugarIntake === "high") {
    bacteria.push({
      name: "Escherichia coli",
      likelihood: "Elevated",
      description: "Opportunistic bacteria that thrive on simple sugars",
      dietaryDriver: `High sugar intake (~${Math.round(patterns.avgSugar)}g/meal) from added sugars, sweets`,
      impact: "Consumes sugars → May produce inflammatory compounds",
    });
  }

  return bacteria;
}

function generateDietInsights(patterns: any, bacteria: any[]) {
  const insights = [];

  if (patterns.fiberIntake === "high") {
    insights.push({
      title: "Strong Fiber Foundation",
      description:
        "Your high fiber intake (~" +
        Math.round(patterns.avgFiber) +
        "g/meal) promotes beneficial bacteria like Faecalibacterium, which produce anti-inflammatory compounds.",
      impact: "positive",
    });
  } else if (patterns.fiberIntake === "low") {
    insights.push({
      title: "Increase Fiber for Better Microbiome",
      description:
        "Low fiber intake (~" +
        Math.round(patterns.avgFiber) +
        "g/meal) limits beneficial bacteria growth. Aim for 8-10g per meal.",
      impact: "improvement",
    });
  }

  if (patterns.sugarIntake === "high") {
    insights.push({
      title: "Reduce Sugar to Balance Microbiome",
      description:
        "High sugar intake (~" +
        Math.round(patterns.avgSugar) +
        "g/meal) may promote inflammatory bacteria. Consider reducing to <10g per meal.",
      impact: "warning",
    });
  }

  if (patterns.proteinIntake === "high" && patterns.fiberIntake === "high") {
    insights.push({
      title: "Balanced Diet Supporting Diversity",
      description:
        "Your combination of high protein and fiber supports diverse bacterial populations and metabolic health.",
      impact: "positive",
    });
  }

  return insights;
}
