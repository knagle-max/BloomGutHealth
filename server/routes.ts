import { reportedAbundanceAnalysis, historicalAnalysisMetadata, publicSample } from "./analysis-boundary";
import { registerRetiredHealthRoutes } from "./retired-health-routes";
import { registerBiologyRoutes } from "./biology-routes";
import { registerExperienceRoutes } from "./experience-routes";
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


function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  registerScienceRoutes(app, {
    requireAuth,
    getMeals: (userId) => storage.getMeals(userId),
    getPreferences: async (userId) =>
      (await storage.getUser(userId))?.dietaryPreferences,
  });
  registerPlannerRoutes(app, requireAuth, storage);
  const precisionService = registerPrecisionRoutes(app, requireAuth, storage);
  registerExperienceRoutes(app, requireAuth, storage, precisionService);
  registerReportRoutes(app, requireAuth, storage);
  registerBiologyRoutes(app, requireAuth, storage, precisionService);
  // Trigger ML analysis
  app.post(
    "/api/microbiome/analyze/:sampleId",
    requireAuth,
    async (req, res) => {
      let authorizedSampleId: string | undefined;
      try {
        const { sampleId } = req.params;
        const { cohortsToCompare = ["general_population"] } = req.body;
        const userId = req.session.userId!;

        const sample = await storage.getMicrobiomeSample(sampleId);
        if (!sample) {
          return res.status(404).json({ error: "Sample not found" });
        }

        if (sample.userId !== userId) {
          return res.status(403).json({ error: "Access denied" });
        }

        if (!abundanceSchema.safeParse((sample.structuredData as any)?.bacteria_percentages).success) {
          return res.status(422).json({error:"This report has no supported quantitative bacterial percentages. Functional scores and organism detection are viewable report data, not inputs for abundance-based modelling. No analysis was run."});
        }
        authorizedSampleId = sampleId;
        // Update status to processing
        await storage.updateMicrobiomeSample(sampleId, {
          processingStatus: "processing",
        });

        // Trigger ML analysis
        const mlResponse = await mlServiceFetch("/api/ml/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sample_id: "structured-processing-request",
            user_id: "server-authorized",
            raw_data: { bacteria_percentages: (sample.structuredData as any).bacteria_percentages },
            cohorts_to_compare: [],
          }),
        });

        await mlResponse.json();
        const mlResult = reportedAbundanceAnalysis(sampleId,(sample.structuredData as any).bacteria_percentages);

        // Save ML analysis results
        if (!mlResponse.ok) {
          await storage.updateMicrobiomeSample(sampleId, {
            processingStatus: "failed",
          });
          return res
            .status(mlResponse.status)
            .json({ error: "Microbiome analysis could not be completed. Review the report or retry later." });
        }
        const analysisId = await storage.insertMlAnalysis({
          sampleId,
          analysisType: "comprehensive",
          modelVersion: mlResult.model_version,
          results: mlResult as any,
          confidence: mlResult.confidence,
          comparedCohorts: cohortsToCompare,
        });

        const existingBacteria =
          await storage.getBacterialComposition(sampleId);
        const existingMetabolites = await storage.getMetabolites(sampleId);
        const existingRecommendations =
          await storage.getRecommendations(sampleId);
        // Preserve reported composition; avoid duplicate rows on repeated model runs.
        for (const bacteria of mlResult.bacterial_composition) {
          if (
            existingBacteria.some(
              (row) => row.bacterialName === bacteria.bacterial_name,
            )
          )
            continue;
          await storage.insertBacterialComposition({
            sampleId,
            bacterialName: bacteria.bacterial_name,
            taxonomyLevel: bacteria.taxonomy_level,
            abundance: bacteria.abundance,
            genomeData: bacteria.genome_data,
          });
        }

        // Save metabolites
        for (const metabolite of mlResult.metabolites) {
          if (
            existingMetabolites.some(
              (row) => row.metaboliteName === metabolite.metabolite_name,
            )
          )
            continue;
          await storage.insertMetabolite({
            sampleId,
            metaboliteName: metabolite.metabolite_name,
            pathwayId: metabolite.pathway_id,
            predictedConcentration: metabolite.predicted_concentration,
            confidence: metabolite.confidence,
            productionGenes: metabolite.production_genes,
          });
        }

        // Save recommendations
        for (const rec of mlResult.recommendations) {
          if (existingRecommendations.some((row) => row.itemName === rec.item))
            continue;
          await storage.insertRecommendation({
            sampleId,
            analysisId,
            recommendationType: rec.type,
            category: rec.category,
            itemName: rec.item,
            reasoning: rec.reasoning,
            details: rec.details,
            priority: rec.priority,
            expectedImpact: rec.expected_impact,
            targetBacteria: rec.target_bacteria,
            targetMetabolites: rec.target_metabolites,
          });
        }

        // Update sample with diversity index and status
        await storage.updateMicrobiomeSample(sampleId, {
          diversityIndex: mlResult.diversity_index,
          processingStatus: "completed",
        });

        res.json({
          success: true,
          analysisId,
          results: mlResult,
        });
      } catch (error: any) {
        console.error("Analysis request could not be completed.");
        if (authorizedSampleId) await storage
          .updateMicrobiomeSample(authorizedSampleId, {
            processingStatus: "failed",
          })
          .catch(() => {});
        res.status(503).json({ error: "Analysis could not be completed. Please retry later." });
      }
    },
  );

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

  // Get available cohorts
  app.get("/api/microbiome/cohorts", requireAuth, async (req, res) => {
    try {
      const mlResponse = await mlServiceFetch("/api/ml/cohorts");
      if (!mlResponse.ok) throw Error("Cohort service unavailable.");
      const cohorts = await mlResponse.json();
      res.json(cohorts);
    } catch (error: any) {
      console.error("Cohort service could not be reached.");
      res.status(503).json({ error: "Cohort information is unavailable." });
    }
  });

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

  app.get("/api/nutrition/targets/:userId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const requestedUserId = req.params.userId;

      if (userId !== requestedUserId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const age = user.age || 30;
      const sex = user.sex || "male";
      const heightCm = user.heightCm || 175;
      const weightKg = user.weightKg || 75;
      const activityLevel = user.activityLevel || "moderate";

      const heightM = heightCm / 100;
      const bmr =
        sex === "male"
          ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
          : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

      const activityMultipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
      };

      const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

      const targets = {
        calories: Math.round(tdee),
        protein: Math.round(weightKg * 1.6),
        carbs: Math.round((tdee * 0.45) / 4),
        fat: Math.round((tdee * 0.3) / 9),
        fiber: 30,
        sodium: 2300,
        potassium: 3500,
        cholesterol: 300,
        sugar: 50,
      };

      res.json(targets);
    } catch (error: any) {
      res.status(503).json({ error: "This request could not be completed. Please retry." });
    }
  });

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

  app.get("/api/nutrition/monthly/:userId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const requestedUserId = req.params.userId;

      if (userId !== requestedUserId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const { year, month } = req.query;

      const targetYear = year
        ? parseInt(year as string)
        : new Date().getFullYear();
      const targetMonth =
        month !== undefined ? parseInt(month as string) : new Date().getMonth();

      const startOfMonth = new Date(targetYear, targetMonth, 1);
      const endOfMonth = new Date(
        targetYear,
        targetMonth + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const meals = await storage.getMeals(userId);
      const monthlyMeals = meals.filter((meal) => {
        const mealDate = new Date(meal.loggedAt);
        return mealDate >= startOfMonth && mealDate <= endOfMonth;
      });

      const totalDays = Math.ceil(
        (endOfMonth.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24),
      );
      const daysWithMeals = new Set(
        monthlyMeals.map((m) => new Date(m.loggedAt).toDateString()),
      ).size;

      const totals = monthlyMeals.reduce(
        (acc, meal) => {
          acc.calories += meal.totalCalories || 0;
          acc.protein += meal.totalProtein || 0;
          acc.carbs += meal.totalCarbs || 0;
          acc.fat += meal.totalFat || 0;

          if (meal.nutritionalData && Array.isArray(meal.nutritionalData)) {
            for (const item of meal.nutritionalData as any[]) {
              acc.fiber += item.fiber_g || 0;
              acc.sugar += item.sugar_g || 0;
              acc.sodium += item.sodium_mg || 0;
              acc.potassium += item.potassium_mg || 0;
            }
          }

          return acc;
        },
        {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          potassium: 0,
        },
      );

      const dailyAverages =
        daysWithMeals > 0
          ? {
              calories: Math.round(totals.calories / daysWithMeals),
              protein: Math.round(totals.protein / daysWithMeals),
              carbs: Math.round(totals.carbs / daysWithMeals),
              fat: Math.round(totals.fat / daysWithMeals),
              fiber: Math.round(totals.fiber / daysWithMeals),
              sugar: Math.round(totals.sugar / daysWithMeals),
              sodium: Math.round(totals.sodium / daysWithMeals),
              potassium: Math.round(totals.potassium / daysWithMeals),
            }
          : null;

      res.json({
        month: targetMonth,
        year: targetYear,
        totalMeals: monthlyMeals.length,
        daysWithMeals,
        totalDays,
        totals,
        dailyAverages,
      });
    } catch (error: any) {
      res.status(503).json({ error: "This request could not be completed. Please retry." });
    }
  });

  app.get("/api/nutrition/yearly/:userId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const requestedUserId = req.params.userId;

      if (userId !== requestedUserId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const { year } = req.query;

      const targetYear = year
        ? parseInt(year as string)
        : new Date().getFullYear();
      const startOfYear = new Date(targetYear, 0, 1);
      const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

      const meals = await storage.getMeals(userId);
      const yearlyMeals = meals.filter((meal) => {
        const mealDate = new Date(meal.loggedAt);
        return mealDate >= startOfYear && mealDate <= endOfYear;
      });

      const daysWithMeals = new Set(
        yearlyMeals.map((m) => new Date(m.loggedAt).toDateString()),
      ).size;

      const totals = yearlyMeals.reduce(
        (acc, meal) => {
          acc.calories += meal.totalCalories || 0;
          acc.protein += meal.totalProtein || 0;
          acc.carbs += meal.totalCarbs || 0;
          acc.fat += meal.totalFat || 0;

          if (meal.nutritionalData && Array.isArray(meal.nutritionalData)) {
            for (const item of meal.nutritionalData as any[]) {
              acc.fiber += item.fiber_g || 0;
              acc.sugar += item.sugar_g || 0;
              acc.sodium += item.sodium_mg || 0;
              acc.potassium += item.potassium_mg || 0;
            }
          }

          return acc;
        },
        {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          potassium: 0,
        },
      );

      const dailyAverages =
        daysWithMeals > 0
          ? {
              calories: Math.round(totals.calories / daysWithMeals),
              protein: Math.round(totals.protein / daysWithMeals),
              carbs: Math.round(totals.carbs / daysWithMeals),
              fat: Math.round(totals.fat / daysWithMeals),
              fiber: Math.round(totals.fiber / daysWithMeals),
              sugar: Math.round(totals.sugar / daysWithMeals),
              sodium: Math.round(totals.sodium / daysWithMeals),
              potassium: Math.round(totals.potassium / daysWithMeals),
            }
          : null;

      const monthlyBreakdown = [];
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(targetYear, month, 1);
        const monthEnd = new Date(targetYear, month + 1, 0, 23, 59, 59, 999);
        const monthMeals = yearlyMeals.filter((meal) => {
          const mealDate = new Date(meal.loggedAt);
          return mealDate >= monthStart && mealDate <= monthEnd;
        });

        if (monthMeals.length > 0) {
          const monthDays = new Set(
            monthMeals.map((m) => new Date(m.loggedAt).toDateString()),
          ).size;
          const monthTotals = monthMeals.reduce(
            (acc, meal) => {
              acc.calories += meal.totalCalories || 0;
              acc.protein += meal.totalProtein || 0;
              return acc;
            },
            { calories: 0, protein: 0 },
          );

          monthlyBreakdown.push({
            month,
            monthName: new Date(targetYear, month).toLocaleDateString("en-US", {
              month: "long",
            }),
            mealsLogged: monthMeals.length,
            daysWithMeals: monthDays,
            avgCalories: Math.round(monthTotals.calories / monthDays),
            avgProtein: Math.round(monthTotals.protein / monthDays),
          });
        }
      }

      res.json({
        year: targetYear,
        totalMeals: yearlyMeals.length,
        daysWithMeals,
        totals,
        dailyAverages,
        monthlyBreakdown,
      });
    } catch (error: any) {
      res.status(503).json({ error: "This request could not be completed. Please retry." });
    }
  });

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

  registerAuthRoutes(app, storage);

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
