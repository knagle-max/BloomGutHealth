import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import FormData from "form-data";
import fetch from "node-fetch";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const upload = multer({ dest: "/tmp/uploads/" });

export async function registerRoutes(app: Express): Promise<Server> {
  // Microbiome sample upload endpoint
  app.post("/api/microbiome/upload", upload.single("file"), async (req, res) => {
    try {
      const file = req.file;
      const { userId, testDate, testingCompany, testId, notes } = req.body;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Forward to Python ML service for processing
      const formData = new FormData();
      formData.append("file", require("fs").createReadStream(file.path));

      const mlResponse = await fetch(`${ML_SERVICE_URL}/api/ml/upload`, {
        method: "POST",
        body: formData,
      });

      const mlResult = await mlResponse.json();

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
      res.status(500).json({ error: error.message });
    }
  });

  // Trigger ML analysis
  app.post("/api/microbiome/analyze/:sampleId", async (req, res) => {
    try {
      const { sampleId } = req.params;
      const { cohortsToCompare = ["general_population"] } = req.body;

      const sample = await storage.getMicrobiomeSample(sampleId);
      if (!sample) {
        return res.status(404).json({ error: "Sample not found" });
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

      const mlResult = await mlResponse.json();

      // Save ML analysis results
      const analysisId = await storage.insertMlAnalysis({
        sampleId,
        analysisType: "comprehensive",
        modelVersion: mlResult.model_version,
        results: mlResult,
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
  app.get("/api/microbiome/results/:sampleId", async (req, res) => {
    try {
      const { sampleId } = req.params;

      const sample = await storage.getMicrobiomeSample(sampleId);
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

  const httpServer = createServer(app);

  return httpServer;
}
