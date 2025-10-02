import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import FormData from "form-data";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import { insertUserSchema } from "@shared/schema";
import { createReadStream } from "fs";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

const ALLOWED_FILE_TYPES = [
  'text/plain',
  'text/csv',
  'application/octet-stream',
  'application/x-gzip',
  'application/gzip',
];

const ALLOWED_EXTENSIONS = ['.fastq', '.fasta', '.fa', '.fq', '.csv', '.txt', '.gz'];

const upload = multer({
  dest: "/tmp/uploads/",
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`));
    }
  },
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Microbiome sample upload endpoint
  app.post("/api/microbiome/upload", requireAuth, (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: "File too large. Maximum size is 100MB." });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  }, async (req, res) => {
    try {
      const file = req.file;
      const { testDate, testingCompany, testId, notes } = req.body;
      const userId = req.session.userId!;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Forward to Python ML service for processing
      const formData = new FormData();
      formData.append("file", createReadStream(file.path));

      const mlResponse = await fetch(`${ML_SERVICE_URL}/api/ml/upload`, {
        method: "POST",
        body: formData,
      });

      const mlResult = await mlResponse.json() as any;

      // Save to database
      const sample = await storage.insertMicrobiomeSample({
        userId,
        testDate: new Date(testDate),
        testingCompany,
        testId,
        rawDataPath: mlResult.file_path,
        processingStatus: "uploaded",
      });

      res.json({
        success: true,
        sampleId: sample.id,
        preview: mlResult.preview,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message?.includes('ECONNREFUSED')) {
        return res.status(503).json({ 
          error: "ML analysis service is currently unavailable. Please try again later." 
        });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Trigger ML analysis
  app.post("/api/microbiome/analyze/:sampleId", requireAuth, async (req, res) => {
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

      // Update status to processing
      await storage.updateMicrobiomeSample(sampleId, {
        processingStatus: "processing",
      });

      // Trigger ML analysis
      const mlResponse = await fetch(`${ML_SERVICE_URL}/api/ml/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sample_id: sampleId,
          user_id: sample.userId,
          file_path: sample.rawDataPath,
          cohorts_to_compare: cohortsToCompare,
        }),
      });

      const mlResult = await mlResponse.json() as any;

      // Save ML analysis results
      const analysisId = await storage.insertMlAnalysis({
        sampleId,
        analysisType: "comprehensive",
        modelVersion: mlResult.model_version,
        results: mlResult as any,
        confidence: mlResult.confidence,
        comparedCohorts: cohortsToCompare,
      });

      // Save bacterial composition
      for (const bacteria of mlResult.bacterial_composition) {
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
      console.error("Analysis error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get analysis results
  app.get("/api/microbiome/results/:sampleId", requireAuth, async (req, res) => {
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

      const bacterial = await storage.getBacterialComposition(sampleId);
      const metabolites = await storage.getMetabolites(sampleId);
      const recommendations = await storage.getRecommendations(sampleId);
      const analyses = await storage.getMlAnalyses(sampleId);

      res.json({
        sample,
        bacterial_composition: bacterial,
        metabolites,
        recommendations,
        analyses,
      });
    } catch (error: any) {
      console.error("Results error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get available cohorts
  app.get("/api/microbiome/cohorts", async (req, res) => {
    try {
      const mlResponse = await fetch(`${ML_SERVICE_URL}/api/ml/cohorts`);
      const cohorts = await mlResponse.json();
      res.json(cohorts);
    } catch (error: any) {
      console.error("Cohorts error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Health check for ML service
  app.get("/api/ml/health", async (req, res) => {
    try {
      const mlResponse = await fetch(`${ML_SERVICE_URL}/health`);
      const health = await mlResponse.json();
      res.json({ ml_service: health });
    } catch (error: any) {
      res.status(503).json({ ml_service: "unavailable", error: error.message });
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
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/demo/samples", async (req, res) => {
    try {
      const samples = await storage.getDemoSamples();
      res.json(samples);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Meal tracking endpoints
  app.post("/api/meals", requireAuth, async (req, res) => {
    try {
      const { mealText, mealType } = req.body;
      const userId = req.session.userId!;

      if (!mealText) {
        return res.status(400).json({ error: "Meal text is required" });
      }

      // Analyze nutrition using API Ninjas
      const apiKey = process.env.API_NINJAS_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Nutrition API key not configured" });
      }

      const nutritionResponse = await fetch(
        `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(mealText)}`,
        {
          headers: { "X-Api-Key": apiKey },
        }
      );

      const nutritionData = await nutritionResponse.json() as any;

      if (!Array.isArray(nutritionData) || nutritionData.length === 0) {
        return res.status(400).json({ 
          error: "Unable to analyze this meal. Please try a different description.",
          nutritionalData: []
        });
      }

      const hasValidData = nutritionData.every((item: any) => 
        typeof item === 'object' && item !== null && 'calories' in item
      );

      if (!hasValidData) {
        return res.status(400).json({ 
          error: "Nutrition data unavailable for this meal",
          nutritionalData: []
        });
      }

      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      for (const item of nutritionData) {
        totalCalories += parseFloat(item.calories) || 0;
        totalProtein += parseFloat(item.protein_g) || 0;
        totalCarbs += parseFloat(item.carbohydrates_total_g) || 0;
        totalFat += parseFloat(item.fat_total_g) || 0;
      }

      const meal = await storage.insertMeal({
        userId,
        mealText,
        mealType,
        nutritionalData: nutritionData,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      });

      res.json(meal);
    } catch (error: any) {
      console.error("Meal logging error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/meals", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const meals = await storage.getMeals(userId);
      res.json(meals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/meals/:mealId", requireAuth, async (req, res) => {
    try {
      const { mealId } = req.params;
      const { mealText, mealType } = req.body;
      const userId = req.session.userId!;

      const existingMeal = await storage.getMeal(mealId);
      if (!existingMeal) {
        return res.status(404).json({ error: "Meal not found" });
      }

      if (existingMeal.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!mealText) {
        return res.status(400).json({ error: "Meal text is required" });
      }

      const apiKey = process.env.API_NINJAS_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Nutrition API key not configured" });
      }

      const nutritionResponse = await fetch(
        `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(mealText)}`,
        {
          headers: { "X-Api-Key": apiKey },
        }
      );

      const nutritionData = await nutritionResponse.json() as any;

      if (!Array.isArray(nutritionData) || nutritionData.length === 0) {
        return res.status(400).json({ error: "Could not analyze nutrition for this meal" });
      }

      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      for (const item of nutritionData) {
        totalCalories += parseFloat(item.calories) || 0;
        totalProtein += parseFloat(item.protein_g) || 0;
        totalCarbs += parseFloat(item.carbohydrates_total_g) || 0;
        totalFat += parseFloat(item.fat_total_g) || 0;
      }

      const updatedMeal = await storage.updateMeal(mealId, {
        mealText,
        mealType,
        nutritionalData: nutritionData,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      });

      res.json(updatedMeal);
    } catch (error: any) {
      console.error("Meal update error:", error);
      res.status(500).json({ error: error.message });
    }
  });

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
      console.error("Meal delete error:", error);
      res.status(500).json({ error: error.message });
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
      const sex = user.sex || 'male';
      const heightCm = user.heightCm || 175;
      const weightKg = user.weightKg || 75;
      const activityLevel = user.activityLevel || 'moderate';

      const heightM = heightCm / 100;
      const bmr = sex === 'male' 
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
        fat: Math.round((tdee * 0.30) / 9),
        fiber: 30,
        sodium: 2300,
        potassium: 3500,
        cholesterol: 300,
        sugar: 50,
      };

      res.json(targets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/nutrition/daily/:userId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const requestedUserId = req.params.userId;

      if (userId !== requestedUserId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const { date } = req.query;
      
      const targetDate = date ? new Date(date as string) : new Date();
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const meals = await storage.getMeals(userId);
      const dailyMeals = meals.filter(meal => {
        const mealDate = new Date(meal.loggedAt);
        return mealDate >= startOfDay && mealDate <= endOfDay;
      });

      const totals = dailyMeals.reduce((acc, meal) => {
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
            acc.cholesterol += item.cholesterol_mg || 0;
          }
        }
        
        return acc;
      }, {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        potassium: 0,
        cholesterol: 0,
      });

      res.json({ meals: dailyMeals, totals });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
      
      const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
      const targetMonth = month !== undefined ? parseInt(month as string) : new Date().getMonth();
      
      const startOfMonth = new Date(targetYear, targetMonth, 1);
      const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

      const meals = await storage.getMeals(userId);
      const monthlyMeals = meals.filter(meal => {
        const mealDate = new Date(meal.loggedAt);
        return mealDate >= startOfMonth && mealDate <= endOfMonth;
      });

      const totalDays = Math.ceil((endOfMonth.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24));
      const daysWithMeals = new Set(monthlyMeals.map(m => new Date(m.loggedAt).toDateString())).size;

      const totals = monthlyMeals.reduce((acc, meal) => {
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
      }, {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        potassium: 0,
      });

      const dailyAverages = daysWithMeals > 0 ? {
        calories: Math.round(totals.calories / daysWithMeals),
        protein: Math.round(totals.protein / daysWithMeals),
        carbs: Math.round(totals.carbs / daysWithMeals),
        fat: Math.round(totals.fat / daysWithMeals),
        fiber: Math.round(totals.fiber / daysWithMeals),
        sugar: Math.round(totals.sugar / daysWithMeals),
        sodium: Math.round(totals.sodium / daysWithMeals),
        potassium: Math.round(totals.potassium / daysWithMeals),
      } : null;

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
      res.status(500).json({ error: error.message });
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
      
      const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
      const startOfYear = new Date(targetYear, 0, 1);
      const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

      const meals = await storage.getMeals(userId);
      const yearlyMeals = meals.filter(meal => {
        const mealDate = new Date(meal.loggedAt);
        return mealDate >= startOfYear && mealDate <= endOfYear;
      });

      const daysWithMeals = new Set(yearlyMeals.map(m => new Date(m.loggedAt).toDateString())).size;

      const totals = yearlyMeals.reduce((acc, meal) => {
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
      }, {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        potassium: 0,
      });

      const dailyAverages = daysWithMeals > 0 ? {
        calories: Math.round(totals.calories / daysWithMeals),
        protein: Math.round(totals.protein / daysWithMeals),
        carbs: Math.round(totals.carbs / daysWithMeals),
        fat: Math.round(totals.fat / daysWithMeals),
        fiber: Math.round(totals.fiber / daysWithMeals),
        sugar: Math.round(totals.sugar / daysWithMeals),
        sodium: Math.round(totals.sodium / daysWithMeals),
        potassium: Math.round(totals.potassium / daysWithMeals),
      } : null;

      const monthlyBreakdown = [];
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(targetYear, month, 1);
        const monthEnd = new Date(targetYear, month + 1, 0, 23, 59, 59, 999);
        const monthMeals = yearlyMeals.filter(meal => {
          const mealDate = new Date(meal.loggedAt);
          return mealDate >= monthStart && mealDate <= monthEnd;
        });
        
        if (monthMeals.length > 0) {
          const monthDays = new Set(monthMeals.map(m => new Date(m.loggedAt).toDateString())).size;
          const monthTotals = monthMeals.reduce((acc, meal) => {
            acc.calories += meal.totalCalories || 0;
            acc.protein += meal.totalProtein || 0;
            return acc;
          }, { calories: 0, protein: 0 });

          monthlyBreakdown.push({
            month,
            monthName: new Date(targetYear, month).toLocaleDateString('en-US', { month: 'long' }),
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
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/user/:userId/profile", async (req, res) => {
    try {
      const { userId } = req.params;
      const { sex, age, heightCm, weightKg, activityLevel } = req.body;
      
      await storage.updateUserProfile(userId, {
        sex,
        age,
        heightCm,
        weightKg,
        activityLevel,
      });
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
      res.json(samples);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/microbiome/diet-prediction/:userId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const requestedUserId = req.params.userId;

      if (userId !== requestedUserId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const meals = await storage.getMeals(userId);
      const recentMeals = meals.slice(0, 30);
      
      if (recentMeals.length < 3) {
        return res.json({
          mealsAnalyzed: recentMeals.length,
          predictedBacteria: [],
          insights: [],
          message: 'Log more meals for accurate predictions',
        });
      }

      const dietaryPatterns = analyzeDietaryPatterns(recentMeals);
      const predictedBacteria = predictBacteriaFromDiet(dietaryPatterns);
      const insights = generateDietInsights(dietaryPatterns, predictedBacteria);

      res.json({
        mealsAnalyzed: recentMeals.length,
        dietaryPatterns,
        predictedBacteria,
        insights,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/health/analysis/:userId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const requestedUserId = req.params.userId;

      if (userId !== requestedUserId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const { calculateMoleculeProduction, calculateHealthScores, identifyBacterialGaps, generateFoodRecommendations } = await import('../shared/health-calculations');
      
      const meals = await storage.getMeals(userId);
      const recentMeals = meals.slice(0, 30);
      
      if (recentMeals.length < 3) {
        return res.json({
          mealsAnalyzed: recentMeals.length,
          molecules: null,
          healthScores: [],
          message: 'Log at least 3 meals for health analysis',
        });
      }

      const totals = recentMeals.reduce((acc, meal) => {
        const nutritionalData = Array.isArray(meal.nutritionalData) ? meal.nutritionalData : [];
        acc.fiber += nutritionalData.reduce((sum: number, item: any) => sum + (item.fiber_g || 0), 0);
        acc.protein += meal.totalProtein || 0;
        acc.sugar += nutritionalData.reduce((sum: number, item: any) => sum + (item.sugar_g || 0), 0);
        return acc;
      }, { fiber: 0, protein: 0, sugar: 0 });

      const avgTotals = {
        fiber: totals.fiber / recentMeals.length,
        protein: totals.protein / recentMeals.length,
        sugar: totals.sugar / recentMeals.length,
      };

      const molecules = calculateMoleculeProduction(totals.fiber, totals.protein);
      const healthScores = calculateHealthScores(molecules, totals.sugar);
      const gaps = identifyBacterialGaps(avgTotals.fiber, avgTotals.protein, avgTotals.sugar);

      res.json({
        mealsAnalyzed: recentMeals.length,
        molecules,
        healthScores,
        bacterialGaps: gaps,
        averages: avgTotals,
      });
    } catch (error: any) {
      console.error('Health analysis error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/health/recommendations/:userId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const requestedUserId = req.params.userId;

      if (userId !== requestedUserId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const { identifyBacterialGaps, generateFoodRecommendations, calculateMoleculeProduction, calculateHealthScores } = await import('../shared/health-calculations');
      
      const meals = await storage.getMeals(userId);
      const recentMeals = meals.slice(0, 30);
      
      if (recentMeals.length < 3) {
        return res.json({
          recommendations: [],
          message: 'Log more meals for personalized recommendations',
        });
      }

      const totals = recentMeals.reduce((acc, meal) => {
        const nutritionalData = Array.isArray(meal.nutritionalData) ? meal.nutritionalData : [];
        acc.fiber += nutritionalData.reduce((sum: number, item: any) => sum + (item.fiber_g || 0), 0);
        acc.protein += meal.totalProtein || 0;
        acc.sugar += nutritionalData.reduce((sum: number, item: any) => sum + (item.sugar_g || 0), 0);
        return acc;
      }, { fiber: 0, protein: 0, sugar: 0 });

      const avgTotals = {
        fiber: totals.fiber / recentMeals.length,
        protein: totals.protein / recentMeals.length,
        sugar: totals.sugar / recentMeals.length,
      };

      const molecules = calculateMoleculeProduction(totals.fiber, totals.protein);
      const healthScores = calculateHealthScores(molecules, totals.sugar);
      const gaps = identifyBacterialGaps(avgTotals.fiber, avgTotals.protein, avgTotals.sugar);
      const recommendations = generateFoodRecommendations(gaps, healthScores);

      res.json({
        recommendations,
        gaps,
        healthScores,
        mealsAnalyzed: recentMeals.length,
      });
    } catch (error: any) {
      console.error('Recommendations error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/health/progress/:userId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const requestedUserId = req.params.userId;

      if (userId !== requestedUserId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const { weeks = 4 } = req.query;
      const { calculateMoleculeProduction, calculateHealthScores } = await import('../shared/health-calculations');
      
      const meals = await storage.getMeals(userId);
      const now = new Date();
      const weeksToAnalyze = parseInt(weeks as string) || 4;
      
      const weeklyData = [];
      
      for (let i = weeksToAnalyze - 1; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i * 7 + 7));
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() - (i * 7));
        
        const weekMeals = meals.filter(meal => {
          const mealDate = new Date(meal.loggedAt);
          return mealDate >= weekStart && mealDate < weekEnd;
        });
        
        if (weekMeals.length > 0) {
          const totals = weekMeals.reduce((acc, meal) => {
            const nutritionalData = meal.nutritionalData as any[] || [];
            acc.fiber += nutritionalData.reduce((sum: number, item: any) => sum + (item.fiber_g || 0), 0);
            acc.protein += meal.totalProtein || 0;
            acc.sugar += nutritionalData.reduce((sum: number, item: any) => sum + (item.sugar_g || 0), 0);
            return acc;
          }, { fiber: 0, protein: 0, sugar: 0 });

          const molecules = calculateMoleculeProduction(totals.fiber, totals.protein);
          const healthScores = calculateHealthScores(molecules, totals.sugar);
          
          weeklyData.push({
            week: `Week ${weeksToAnalyze - i}`,
            weekStart: weekStart.toISOString().split('T')[0],
            weekEnd: weekEnd.toISOString().split('T')[0],
            mealsLogged: weekMeals.length,
            molecules,
            healthScores,
            averageScores: {
              inflammation: healthScores.find(s => s.category === 'Inflammation')?.score || 0,
              gutBarrier: healthScores.find(s => s.category === 'Gut Barrier')?.score || 0,
              metabolic: healthScores.find(s => s.category === 'Metabolic Health')?.score || 0,
              immune: healthScores.find(s => s.category === 'Immune Function')?.score || 0,
            }
          });
        }
      }

      res.json({
        weeklyData,
        totalWeeks: weeksToAnalyze,
      });
    } catch (error: any) {
      console.error('Progress tracking error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/health/adherence/:userId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const requestedUserId = req.params.userId;

      if (userId !== requestedUserId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const { days = 7 } = req.query;
      const { generateFoodRecommendations, identifyBacterialGaps, calculateMoleculeProduction, calculateHealthScores, calculateAdherence, matchMealToRecommendations } = await import('../shared/health-calculations');
      
      const allMeals = await storage.getMeals(userId);
      
      if (allMeals.length < 3) {
        return res.json({
          message: 'Log at least 3 meals to track adherence',
          adherenceStats: null,
          details: [],
        });
      }

      const daysToAnalyze = parseInt(days as string) || 7;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToAnalyze);
      
      const recentMeals = allMeals.filter(meal => new Date(meal.loggedAt) >= cutoffDate);
      
      const mealsForAnalysis = recentMeals.length >= 3 ? recentMeals : allMeals.slice(0, 30);

      const totals = mealsForAnalysis.reduce((acc, meal) => {
        const nutritionalData = meal.nutritionalData as any[] || [];
        acc.fiber += nutritionalData.reduce((sum: number, item: any) => sum + (item.fiber_g || 0), 0);
        acc.protein += meal.totalProtein || 0;
        acc.sugar += nutritionalData.reduce((sum: number, item: any) => sum + (item.sugar_g || 0), 0);
        return acc;
      }, { fiber: 0, protein: 0, sugar: 0 });

      const avgTotals = {
        fiber: totals.fiber / mealsForAnalysis.length,
        protein: totals.protein / mealsForAnalysis.length,
        sugar: totals.sugar / mealsForAnalysis.length,
      };

      const molecules = calculateMoleculeProduction(totals.fiber, totals.protein);
      const healthScores = calculateHealthScores(molecules, totals.sugar);
      const gaps = identifyBacterialGaps(avgTotals.fiber, avgTotals.protein, avgTotals.sugar);
      const recommendations = generateFoodRecommendations(gaps, healthScores);
      
      const mealData = recentMeals
        .filter(meal => meal.mealText && meal.mealText.trim().length > 0)
        .map(meal => ({
          description: meal.mealText,
          loggedAt: meal.loggedAt.toISOString(),
        }));

      const { adherenceStats, details } = calculateAdherence(mealData, recommendations);

      res.json({
        adherenceStats,
        details,
        recommendations,
        mealsAnalyzed: recentMeals.length,
        periodDays: daysToAnalyze,
      });
    } catch (error: any) {
      console.error('Adherence tracking error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/meals/:mealId/check-adherence", requireAuth, async (req, res) => {
    try {
      const { mealId } = req.params;
      const userId = req.session.userId!;

      const meal = await storage.getMeal(mealId);
      if (!meal) {
        return res.status(404).json({ error: "Meal not found" });
      }

      if (meal.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { matchMealToRecommendations } = await import('../shared/health-calculations');

      const adherenceData = await fetch(`http://localhost:5000/api/health/adherence/${userId}?days=7`);
      const adherence = await adherenceData.json() as any;
      
      const recommendations = adherence?.recommendations || [];
      const matches = matchMealToRecommendations(meal.mealText, recommendations);

      res.json({
        meal,
        matches,
        message: matches.length > 0 
          ? `Great choice! This meal includes ${matches.map(m => m.matchedKeywords.join(', ')).join(' and ')}`
          : 'This meal doesn\'t match current recommendations. Consider adding fiber-rich or fermented foods.',
      });
    } catch (error: any) {
      console.error('Meal adherence check error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: "Invalid input" });
      }

      const { username, password } = result.data;

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, password: hashedPassword });

      req.session.userId = user.id;
      req.session.username = user.username;

      res.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      req.session.userId = user.id;
      req.session.username = user.username;

      res.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to logout" });
        }
        res.json({ success: true });
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.json({ user: null });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.json({ user: null });
      }

      res.json({ user: { id: user.id, username: user.username } });
    } catch (error: any) {
      console.error("Get me error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

function analyzeDietaryPatterns(meals: any[]) {
  const totals = meals.reduce((acc, meal) => {
    acc.fiber += meal.nutritionalData?.reduce((sum: number, item: any) => sum + (item.fiber_g || 0), 0) || 0;
    acc.protein += meal.totalProtein || 0;
    acc.carbs += meal.totalCarbs || 0;
    acc.fat += meal.totalFat || 0;
    acc.sugar += meal.nutritionalData?.reduce((sum: number, item: any) => sum + (item.sugar_g || 0), 0) || 0;
    return acc;
  }, { fiber: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 });

  const avgPerMeal = {
    fiber: totals.fiber / meals.length,
    protein: totals.protein / meals.length,
    carbs: totals.carbs / meals.length,
    fat: totals.fat / meals.length,
    sugar: totals.sugar / meals.length,
  };

  return {
    fiberIntake: avgPerMeal.fiber > 8 ? 'high' : avgPerMeal.fiber > 4 ? 'moderate' : 'low',
    proteinIntake: avgPerMeal.protein > 25 ? 'high' : avgPerMeal.protein > 15 ? 'moderate' : 'low',
    carbIntake: avgPerMeal.carbs > 50 ? 'high' : avgPerMeal.carbs > 30 ? 'moderate' : 'low',
    sugarIntake: avgPerMeal.sugar > 15 ? 'high' : avgPerMeal.sugar > 8 ? 'moderate' : 'low',
    avgFiber: avgPerMeal.fiber,
    avgProtein: avgPerMeal.protein,
    avgCarbs: avgPerMeal.carbs,
    avgSugar: avgPerMeal.sugar,
  };
}

function predictBacteriaFromDiet(patterns: any) {
  const bacteria = [];

  if (patterns.fiberIntake === 'high') {
    bacteria.push({
      name: 'Faecalibacterium prausnitzii',
      likelihood: 'High',
      description: 'Fiber-fermenting bacteria producing anti-inflammatory butyrate',
      dietaryDriver: `High fiber intake (~${Math.round(patterns.avgFiber)}g/meal) from whole grains, vegetables, legumes`,
      impact: 'Produces butyrate → Reduces inflammation → Improved gut barrier',
    });
    bacteria.push({
      name: 'Bifidobacterium longum',
      likelihood: 'High',
      description: 'Beneficial bacteria thriving on dietary fiber',
      dietaryDriver: `High fiber intake (~${Math.round(patterns.avgFiber)}g/meal) from whole grains, vegetables, legumes`,
      impact: 'Ferments fiber → Produces SCFAs → Enhances immune function',
    });
  } else if (patterns.fiberIntake === 'low') {
    bacteria.push({
      name: 'Bacteroides fragilis',
      likelihood: 'Moderate',
      description: 'Common bacteria, less beneficial without fiber',
      dietaryDriver: `Low fiber intake (~${Math.round(patterns.avgFiber)}g/meal) limits beneficial bacteria`,
      impact: 'Limited SCFA production → Reduced gut barrier integrity',
    });
  }

  if (patterns.proteinIntake === 'high') {
    bacteria.push({
      name: 'Akkermansia muciniphila',
      likelihood: 'Moderate',
      description: 'Mucin-degrading bacteria, supports metabolic health',
      dietaryDriver: `High protein intake (~${Math.round(patterns.avgProtein)}g/meal) from lean meats, fish, legumes`,
      impact: 'Strengthens gut lining → Improves glucose metabolism',
    });
  }

  if (patterns.sugarIntake === 'high') {
    bacteria.push({
      name: 'Escherichia coli',
      likelihood: 'Elevated',
      description: 'Opportunistic bacteria that thrive on simple sugars',
      dietaryDriver: `High sugar intake (~${Math.round(patterns.avgSugar)}g/meal) from added sugars, sweets`,
      impact: 'Consumes sugars → May produce inflammatory compounds',
    });
  }

  return bacteria;
}

function generateDietInsights(patterns: any, bacteria: any[]) {
  const insights = [];

  if (patterns.fiberIntake === 'high') {
    insights.push({
      title: 'Strong Fiber Foundation',
      description: 'Your high fiber intake (~' + Math.round(patterns.avgFiber) + 'g/meal) promotes beneficial bacteria like Faecalibacterium, which produce anti-inflammatory compounds.',
      impact: 'positive',
    });
  } else if (patterns.fiberIntake === 'low') {
    insights.push({
      title: 'Increase Fiber for Better Microbiome',
      description: 'Low fiber intake (~' + Math.round(patterns.avgFiber) + 'g/meal) limits beneficial bacteria growth. Aim for 8-10g per meal.',
      impact: 'improvement',
    });
  }

  if (patterns.sugarIntake === 'high') {
    insights.push({
      title: 'Reduce Sugar to Balance Microbiome',
      description: 'High sugar intake (~' + Math.round(patterns.avgSugar) + 'g/meal) may promote inflammatory bacteria. Consider reducing to <10g per meal.',
      impact: 'warning',
    });
  }

  if (patterns.proteinIntake === 'high' && patterns.fiberIntake === 'high') {
    insights.push({
      title: 'Balanced Diet Supporting Diversity',
      description: 'Your combination of high protein and fiber supports diverse bacterial populations and metabolic health.',
      impact: 'positive',
    });
  }

  return insights;
}
