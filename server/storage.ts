import { 
  type User, 
  type InsertUser,
  type MicrobiomeSample,
  type InsertMicrobiomeSample,
  type BacterialComposition,
  type InsertBacterialComposition,
  type Metabolite,
  type InsertMetabolite,
  type HealthImpact,
  type InsertHealthImpact,
  type CohortReference,
  type InsertCohortReference,
  type MlAnalysis,
  type InsertMlAnalysis,
  type Recommendation,
  type InsertRecommendation,
  type Meal,
  type InsertMeal,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Microbiome sample methods
  getMicrobiomeSample(id: string): Promise<MicrobiomeSample | undefined>;
  insertMicrobiomeSample(sample: InsertMicrobiomeSample): Promise<MicrobiomeSample>;
  updateMicrobiomeSample(id: string, updates: Partial<MicrobiomeSample>): Promise<void>;
  getUserSamples(userId: string): Promise<MicrobiomeSample[]>;
  
  // Bacterial composition methods
  getBacterialComposition(sampleId: string): Promise<BacterialComposition[]>;
  insertBacterialComposition(composition: InsertBacterialComposition): Promise<void>;
  
  // Metabolite methods
  getMetabolites(sampleId: string): Promise<Metabolite[]>;
  insertMetabolite(metabolite: InsertMetabolite): Promise<void>;
  
  // Health impact methods
  getHealthImpacts(metaboliteId: string): Promise<HealthImpact[]>;
  insertHealthImpact(impact: InsertHealthImpact): Promise<void>;
  
  // Cohort reference methods
  getCohortReferences(): Promise<CohortReference[]>;
  insertCohortReference(cohort: InsertCohortReference): Promise<void>;
  
  // ML analysis methods
  getMlAnalyses(sampleId: string): Promise<MlAnalysis[]>;
  insertMlAnalysis(analysis: InsertMlAnalysis): Promise<string>;
  
  // Recommendation methods
  getRecommendations(sampleId: string): Promise<Recommendation[]>;
  insertRecommendation(recommendation: InsertRecommendation): Promise<void>;
  
  // Meal methods
  getMeals(userId: string): Promise<Meal[]>;
  insertMeal(meal: InsertMeal): Promise<Meal>;
  
  // Demo data
  getDemoUser(): Promise<User | undefined>;
  getDemoSamples(): Promise<MicrobiomeSample[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private microbiomeSamples: Map<string, MicrobiomeSample>;
  private bacterialComposition: Map<string, BacterialComposition[]>;
  private metabolites: Map<string, Metabolite[]>;
  private healthImpacts: Map<string, HealthImpact[]>;
  private cohortReferences: Map<string, CohortReference>;
  private mlAnalyses: Map<string, MlAnalysis[]>;
  private recommendations: Map<string, Recommendation[]>;
  private meals: Map<string, Meal[]>;
  private demoUserId: string | null = null;

  constructor() {
    this.users = new Map();
    this.microbiomeSamples = new Map();
    this.bacterialComposition = new Map();
    this.metabolites = new Map();
    this.healthImpacts = new Map();
    this.cohortReferences = new Map();
    this.mlAnalyses = new Map();
    this.recommendations = new Map();
    this.meals = new Map();
    
    this.seedDemoData();
  }
  
  private async seedDemoData() {
    const demoUser: User = {
      id: "demo-user-123",
      username: "demo_explorer",
      password: "demo",
    };
    this.demoUserId = demoUser.id;
    this.users.set(demoUser.id, demoUser);
    
    const demoSample: MicrobiomeSample = {
      id: "demo-sample-123",
      userId: demoUser.id,
      testDate: new Date("2025-09-15"),
      testingCompany: "BiomeFX",
      testId: "BMX-2025-0915",
      rawDataPath: "/demo/sample.fastq",
      processingStatus: "completed",
      diversityIndex: 4.2,
      uploadedAt: new Date("2025-09-16"),
    };
    this.microbiomeSamples.set(demoSample.id, demoSample);
    
    const demoBacteria: BacterialComposition[] = [
      {
        id: "demo-bac-1",
        sampleId: demoSample.id,
        bacterialName: "Akkermansia muciniphila",
        taxonomyLevel: "species",
        abundance: 8.5,
        genomeData: { genes: ["amuc_0010", "amuc_1435"] },
      },
      {
        id: "demo-bac-2",
        sampleId: demoSample.id,
        bacterialName: "Faecalibacterium prausnitzii",
        taxonomyLevel: "species",
        abundance: 12.3,
        genomeData: { genes: ["fpra_0234", "fpra_1890"] },
      },
      {
        id: "demo-bac-3",
        sampleId: demoSample.id,
        bacterialName: "Bifidobacterium longum",
        taxonomyLevel: "species",
        abundance: 6.7,
        genomeData: { genes: ["blon_0045", "blon_1267"] },
      },
      {
        id: "demo-bac-4",
        sampleId: demoSample.id,
        bacterialName: "Lactobacillus plantarum",
        taxonomyLevel: "species",
        abundance: 4.2,
        genomeData: { genes: ["lpla_0156", "lpla_0892"] },
      },
    ];
    this.bacterialComposition.set(demoSample.id, demoBacteria);
    
    const demoMetabolites: Metabolite[] = [
      {
        id: "demo-met-1",
        sampleId: demoSample.id,
        bacterialId: "demo-bac-2",
        metaboliteName: "Butyrate",
        pathwayId: "KEGG:ko00650",
        predictedConcentration: 15.8,
        confidence: 0.92,
        productionGenes: ["butyryl-CoA dehydrogenase", "butyrate kinase"],
      },
      {
        id: "demo-met-2",
        sampleId: demoSample.id,
        bacterialId: "demo-bac-1",
        metaboliteName: "Propionate",
        pathwayId: "KEGG:ko00640",
        predictedConcentration: 12.4,
        confidence: 0.88,
        productionGenes: ["methylmalonyl-CoA mutase", "propionyl-CoA carboxylase"],
      },
      {
        id: "demo-met-3",
        sampleId: demoSample.id,
        bacterialId: "demo-bac-3",
        metaboliteName: "Acetate",
        pathwayId: "KEGG:ko00620",
        predictedConcentration: 22.1,
        confidence: 0.95,
        productionGenes: ["acetate kinase", "phosphotransacetylase"],
      },
    ];
    this.metabolites.set(demoSample.id, demoMetabolites);
    
    const demoRecommendations: Recommendation[] = [
      {
        id: "demo-rec-1",
        sampleId: demoSample.id,
        analysisId: null,
        recommendationType: "dietary",
        category: "prebiotics",
        itemName: "Resistant Starch",
        reasoning: "Your Faecalibacterium levels are good but could be optimized. Resistant starch feeds butyrate-producing bacteria.",
        details: "Add 1-2 tablespoons of raw potato starch or cooked & cooled rice/potatoes daily",
        priority: 1,
        expectedImpact: 0.85,
        targetBacteria: ["Faecalibacterium prausnitzii", "Roseburia spp."],
        targetMetabolites: ["Butyrate"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "demo-rec-2",
        sampleId: demoSample.id,
        analysisId: null,
        recommendationType: "dietary",
        category: "probiotics",
        itemName: "Fermented Foods",
        reasoning: "To maintain your beneficial Lactobacillus and Bifidobacterium populations",
        details: "Include kimchi, sauerkraut, or kefir 3-4 times per week",
        priority: 2,
        expectedImpact: 0.72,
        targetBacteria: ["Lactobacillus plantarum", "Bifidobacterium longum"],
        targetMetabolites: ["Acetate", "Lactate"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "demo-rec-3",
        sampleId: demoSample.id,
        analysisId: null,
        recommendationType: "lifestyle",
        category: "exercise",
        itemName: "Moderate Cardio",
        reasoning: "Exercise increases microbial diversity and promotes Akkermansia growth",
        details: "30-45 minutes of moderate cardio 4-5 times per week",
        priority: 3,
        expectedImpact: 0.68,
        targetBacteria: ["Akkermansia muciniphila"],
        targetMetabolites: ["Propionate"],
        isActive: true,
        createdAt: new Date(),
      },
    ];
    this.recommendations.set(demoSample.id, demoRecommendations);
    
    const demoAnalysis: MlAnalysis = {
      id: "demo-analysis-1",
      sampleId: demoSample.id,
      analysisType: "comprehensive",
      modelVersion: "v2.3.1",
      results: {
        overall_score: 82,
        diversity_index: 4.2,
        health_status: "good",
        cohort_comparisons: {
          elite_athletes: { similarity: 0.78, percentile: 72 },
          centenarians: { similarity: 0.81, percentile: 76 },
          mediterranean_diet: { similarity: 0.85, percentile: 80 },
        },
      },
      confidence: 0.89,
      explainability: null,
      comparedCohorts: ["elite_athletes", "centenarians", "mediterranean_diet"],
      analyzedAt: new Date("2025-09-16"),
    };
    this.mlAnalyses.set(demoSample.id, [demoAnalysis]);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMicrobiomeSample(id: string): Promise<MicrobiomeSample | undefined> {
    return this.microbiomeSamples.get(id);
  }

  async insertMicrobiomeSample(sample: InsertMicrobiomeSample): Promise<MicrobiomeSample> {
    const id = randomUUID();
    const newSample: MicrobiomeSample = {
      id,
      userId: sample.userId,
      testDate: sample.testDate,
      testingCompany: sample.testingCompany ?? null,
      testId: sample.testId ?? null,
      rawDataPath: sample.rawDataPath ?? null,
      processingStatus: sample.processingStatus || "pending",
      diversityIndex: sample.diversityIndex ?? null,
      uploadedAt: new Date(),
    };
    this.microbiomeSamples.set(id, newSample);
    return newSample;
  }

  async updateMicrobiomeSample(id: string, updates: Partial<MicrobiomeSample>): Promise<void> {
    const sample = this.microbiomeSamples.get(id);
    if (sample) {
      this.microbiomeSamples.set(id, { ...sample, ...updates });
    }
  }

  async getUserSamples(userId: string): Promise<MicrobiomeSample[]> {
    return Array.from(this.microbiomeSamples.values()).filter(
      (sample) => sample.userId === userId
    );
  }

  async getBacterialComposition(sampleId: string): Promise<BacterialComposition[]> {
    return this.bacterialComposition.get(sampleId) || [];
  }

  async insertBacterialComposition(composition: InsertBacterialComposition): Promise<void> {
    const id = randomUUID();
    const newComposition: BacterialComposition = {
      id,
      sampleId: composition.sampleId,
      bacterialName: composition.bacterialName,
      taxonomyLevel: composition.taxonomyLevel,
      abundance: composition.abundance,
      genomeData: composition.genomeData ?? null,
    };
    const existing = this.bacterialComposition.get(composition.sampleId) || [];
    this.bacterialComposition.set(composition.sampleId, [...existing, newComposition]);
  }

  async getMetabolites(sampleId: string): Promise<Metabolite[]> {
    return this.metabolites.get(sampleId) || [];
  }

  async insertMetabolite(metabolite: InsertMetabolite): Promise<void> {
    const id = randomUUID();
    const newMetabolite: Metabolite = {
      id,
      sampleId: metabolite.sampleId,
      bacterialId: metabolite.bacterialId ?? null,
      metaboliteName: metabolite.metaboliteName,
      pathwayId: metabolite.pathwayId ?? null,
      predictedConcentration: metabolite.predictedConcentration ?? null,
      confidence: metabolite.confidence ?? null,
      productionGenes: metabolite.productionGenes ?? null,
    };
    const existing = this.metabolites.get(metabolite.sampleId) || [];
    this.metabolites.set(metabolite.sampleId, [...existing, newMetabolite]);
  }

  async getHealthImpacts(metaboliteId: string): Promise<HealthImpact[]> {
    return this.healthImpacts.get(metaboliteId) || [];
  }

  async insertHealthImpact(impact: InsertHealthImpact): Promise<void> {
    const id = randomUUID();
    const newImpact: HealthImpact = {
      id,
      metaboliteId: impact.metaboliteId,
      impactCategory: impact.impactCategory,
      impactDescription: impact.impactDescription,
      impactScore: impact.impactScore ?? null,
      evidenceLevel: impact.evidenceLevel ?? null,
      affectedSystems: impact.affectedSystems ?? null,
      mechanismOfAction: impact.mechanismOfAction ?? null,
    };
    const existing = this.healthImpacts.get(impact.metaboliteId) || [];
    this.healthImpacts.set(impact.metaboliteId, [...existing, newImpact]);
  }

  async getCohortReferences(): Promise<CohortReference[]> {
    return Array.from(this.cohortReferences.values());
  }

  async insertCohortReference(cohort: InsertCohortReference): Promise<void> {
    const id = randomUUID();
    const newCohort: CohortReference = {
      id,
      cohortName: cohort.cohortName,
      cohortType: cohort.cohortType,
      bacterialProfile: cohort.bacterialProfile,
      metaboliteProfile: cohort.metaboliteProfile ?? null,
      healthMarkers: cohort.healthMarkers ?? null,
      sampleSize: cohort.sampleSize ?? null,
      studyReference: cohort.studyReference ?? null,
    };
    this.cohortReferences.set(id, newCohort);
  }

  async getMlAnalyses(sampleId: string): Promise<MlAnalysis[]> {
    return this.mlAnalyses.get(sampleId) || [];
  }

  async insertMlAnalysis(analysis: InsertMlAnalysis): Promise<string> {
    const id = randomUUID();
    const newAnalysis: MlAnalysis = {
      id,
      sampleId: analysis.sampleId,
      analysisType: analysis.analysisType,
      modelVersion: analysis.modelVersion,
      results: analysis.results,
      confidence: analysis.confidence ?? null,
      explainability: analysis.explainability ?? null,
      comparedCohorts: analysis.comparedCohorts ?? null,
      analyzedAt: new Date(),
    };
    const existing = this.mlAnalyses.get(analysis.sampleId) || [];
    this.mlAnalyses.set(analysis.sampleId, [...existing, newAnalysis]);
    return id;
  }

  async getRecommendations(sampleId: string): Promise<Recommendation[]> {
    return this.recommendations.get(sampleId) || [];
  }

  async insertRecommendation(recommendation: InsertRecommendation): Promise<void> {
    const id = randomUUID();
    const newRecommendation: Recommendation = {
      id,
      sampleId: recommendation.sampleId,
      analysisId: recommendation.analysisId ?? null,
      recommendationType: recommendation.recommendationType,
      category: recommendation.category,
      itemName: recommendation.itemName,
      reasoning: recommendation.reasoning,
      details: recommendation.details ?? null,
      priority: recommendation.priority ?? null,
      expectedImpact: recommendation.expectedImpact ?? null,
      targetBacteria: recommendation.targetBacteria ?? null,
      targetMetabolites: recommendation.targetMetabolites ?? null,
      isActive: recommendation.isActive ?? true,
      createdAt: new Date(),
    };
    const existing = this.recommendations.get(recommendation.sampleId) || [];
    this.recommendations.set(recommendation.sampleId, [...existing, newRecommendation]);
  }
  
  async getMeals(userId: string): Promise<Meal[]> {
    return this.meals.get(userId) || [];
  }
  
  async insertMeal(meal: InsertMeal): Promise<Meal> {
    const id = randomUUID();
    const newMeal: Meal = {
      id,
      userId: meal.userId,
      mealText: meal.mealText,
      mealType: meal.mealType ?? null,
      nutritionalData: meal.nutritionalData ?? null,
      totalCalories: meal.totalCalories ?? null,
      totalProtein: meal.totalProtein ?? null,
      totalCarbs: meal.totalCarbs ?? null,
      totalFat: meal.totalFat ?? null,
      loggedAt: new Date(),
    };
    const existing = this.meals.get(meal.userId) || [];
    this.meals.set(meal.userId, [...existing, newMeal]);
    return newMeal;
  }
  
  async getDemoUser(): Promise<User | undefined> {
    return this.demoUserId ? this.users.get(this.demoUserId) : undefined;
  }
  
  async getDemoSamples(): Promise<MicrobiomeSample[]> {
    if (!this.demoUserId) return [];
    return Array.from(this.microbiomeSamples.values()).filter(
      sample => sample.userId === this.demoUserId
    );
  }
}

export const storage = new MemStorage();
