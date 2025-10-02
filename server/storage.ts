import { 
  type User, 
  type InsertUser,
  type UpdateUserProfile,
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
  users,
  microbiomeSamples,
  bacterialComposition,
  metabolites,
  healthImpacts,
  cohortReferences,
  mlAnalyses,
  recommendations,
  meals,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: string, profile: UpdateUserProfile): Promise<void>;
  
  getMicrobiomeSample(id: string): Promise<MicrobiomeSample | undefined>;
  insertMicrobiomeSample(sample: InsertMicrobiomeSample): Promise<MicrobiomeSample>;
  updateMicrobiomeSample(id: string, updates: Partial<MicrobiomeSample>): Promise<void>;
  getUserSamples(userId: string): Promise<MicrobiomeSample[]>;
  
  getBacterialComposition(sampleId: string): Promise<BacterialComposition[]>;
  insertBacterialComposition(composition: InsertBacterialComposition): Promise<void>;
  
  getMetabolites(sampleId: string): Promise<Metabolite[]>;
  insertMetabolite(metabolite: InsertMetabolite): Promise<void>;
  
  getHealthImpacts(metaboliteId: string): Promise<HealthImpact[]>;
  insertHealthImpact(impact: InsertHealthImpact): Promise<void>;
  
  getCohortReferences(): Promise<CohortReference[]>;
  insertCohortReference(cohort: InsertCohortReference): Promise<void>;
  
  getMlAnalyses(sampleId: string): Promise<MlAnalysis[]>;
  insertMlAnalysis(analysis: InsertMlAnalysis): Promise<string>;
  
  getRecommendations(sampleId: string): Promise<Recommendation[]>;
  insertRecommendation(recommendation: InsertRecommendation): Promise<void>;
  
  getMeals(userId: string): Promise<Meal[]>;
  insertMeal(meal: InsertMeal): Promise<Meal>;
  updateMeal(id: string, updates: Partial<Meal>): Promise<Meal>;
  deleteMeal(id: string): Promise<void>;
  
  getDemoUser(): Promise<User | undefined>;
  getDemoSamples(): Promise<MicrobiomeSample[]>;
}

export class DatabaseStorage implements IStorage {
  private demoUserId: string = "demo-user-123";
  
  constructor() {
    this.seedDemoData();
  }
  
  private async seedDemoData() {
    try {
      const existingDemo = await db.select().from(users).where(eq(users.id, this.demoUserId));
      if (existingDemo.length > 0) return;

      await db.insert(users).values({
        id: this.demoUserId,
        username: "demo_explorer",
        password: "demo",
        sex: "male",
        age: 35,
        heightCm: 175,
        weightKg: 75,
        activityLevel: "moderate",
      });

      const demoSampleId = "demo-sample-123";
      await db.insert(microbiomeSamples).values({
        id: demoSampleId,
        userId: this.demoUserId,
        testDate: new Date("2025-09-15"),
        testingCompany: "BiomeFX",
        testId: "BMX-2025-0915",
        rawDataPath: "/demo/sample.fastq",
        processingStatus: "completed",
        diversityIndex: 4.2,
      });

      await db.insert(bacterialComposition).values([
        {
          id: "demo-bac-1",
          sampleId: demoSampleId,
          bacterialName: "Akkermansia muciniphila",
          taxonomyLevel: "species",
          abundance: 8.5,
          genomeData: { genes: ["amuc_0010", "amuc_1435"] },
        },
        {
          id: "demo-bac-2",
          sampleId: demoSampleId,
          bacterialName: "Faecalibacterium prausnitzii",
          taxonomyLevel: "species",
          abundance: 12.3,
          genomeData: { genes: ["fpra_0234", "fpra_1890"] },
        },
        {
          id: "demo-bac-3",
          sampleId: demoSampleId,
          bacterialName: "Bifidobacterium longum",
          taxonomyLevel: "species",
          abundance: 6.7,
          genomeData: { genes: ["blon_0045", "blon_1267"] },
        },
        {
          id: "demo-bac-4",
          sampleId: demoSampleId,
          bacterialName: "Lactobacillus plantarum",
          taxonomyLevel: "species",
          abundance: 4.2,
          genomeData: { genes: ["lpla_0156", "lpla_0892"] },
        },
      ]);

      await db.insert(metabolites).values([
        {
          id: "demo-met-1",
          sampleId: demoSampleId,
          bacterialId: "demo-bac-2",
          metaboliteName: "Butyrate",
          pathwayId: "KEGG:ko00650",
          predictedConcentration: 15.8,
          confidence: 0.92,
          productionGenes: ["butyryl-CoA dehydrogenase", "butyrate kinase"],
        },
        {
          id: "demo-met-2",
          sampleId: demoSampleId,
          bacterialId: "demo-bac-1",
          metaboliteName: "Propionate",
          pathwayId: "KEGG:ko00640",
          predictedConcentration: 12.4,
          confidence: 0.88,
          productionGenes: ["methylmalonyl-CoA mutase", "propionyl-CoA carboxylase"],
        },
        {
          id: "demo-met-3",
          sampleId: demoSampleId,
          bacterialId: "demo-bac-3",
          metaboliteName: "Acetate",
          pathwayId: "KEGG:ko00620",
          predictedConcentration: 22.1,
          confidence: 0.95,
          productionGenes: ["acetate kinase", "phosphotransacetylase"],
        },
      ]);

      await db.insert(recommendations).values([
        {
          id: "demo-rec-1",
          sampleId: demoSampleId,
          recommendationType: "dietary",
          category: "prebiotics",
          itemName: "Resistant Starch",
          reasoning: "Your Faecalibacterium levels are good but could be optimized. Resistant starch feeds butyrate-producing bacteria.",
          details: "Add 1-2 tablespoons of raw potato starch or cooked & cooled rice/potatoes daily",
          priority: 1,
          expectedImpact: 0.85,
          targetBacteria: ["Faecalibacterium prausnitzii", "Roseburia spp."],
          targetMetabolites: ["Butyrate"],
        },
        {
          id: "demo-rec-2",
          sampleId: demoSampleId,
          recommendationType: "dietary",
          category: "probiotics",
          itemName: "Fermented Foods",
          reasoning: "To maintain your beneficial Lactobacillus and Bifidobacterium populations",
          details: "Include kimchi, sauerkraut, or kefir 3-4 times per week",
          priority: 2,
          expectedImpact: 0.72,
          targetBacteria: ["Lactobacillus plantarum", "Bifidobacterium longum"],
          targetMetabolites: ["Acetate", "Lactate"],
        },
        {
          id: "demo-rec-3",
          sampleId: demoSampleId,
          recommendationType: "lifestyle",
          category: "exercise",
          itemName: "Moderate Cardio",
          reasoning: "Exercise increases microbial diversity and promotes Akkermansia growth",
          details: "30-45 minutes of moderate cardio 4-5 times per week",
          priority: 3,
          expectedImpact: 0.68,
          targetBacteria: ["Akkermansia muciniphila"],
          targetMetabolites: ["Propionate"],
        },
      ]);

      await db.insert(mlAnalyses).values({
        id: "demo-analysis-1",
        sampleId: demoSampleId,
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
        comparedCohorts: ["elite_athletes", "centenarians", "mediterranean_diet"],
      });
    } catch (error) {
      console.error("Demo data seeding error (likely already exists):", error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserProfile(id: string, profile: UpdateUserProfile): Promise<void> {
    await db.update(users).set(profile).where(eq(users.id, id));
  }

  async getMicrobiomeSample(id: string): Promise<MicrobiomeSample | undefined> {
    const [sample] = await db.select().from(microbiomeSamples).where(eq(microbiomeSamples.id, id));
    return sample || undefined;
  }

  async insertMicrobiomeSample(sample: InsertMicrobiomeSample): Promise<MicrobiomeSample> {
    const [newSample] = await db.insert(microbiomeSamples).values(sample).returning();
    return newSample;
  }

  async updateMicrobiomeSample(id: string, updates: Partial<MicrobiomeSample>): Promise<void> {
    await db.update(microbiomeSamples).set(updates).where(eq(microbiomeSamples.id, id));
  }

  async getUserSamples(userId: string): Promise<MicrobiomeSample[]> {
    return await db.select().from(microbiomeSamples).where(eq(microbiomeSamples.userId, userId));
  }

  async getBacterialComposition(sampleId: string): Promise<BacterialComposition[]> {
    return await db.select().from(bacterialComposition).where(eq(bacterialComposition.sampleId, sampleId));
  }

  async insertBacterialComposition(composition: InsertBacterialComposition): Promise<void> {
    await db.insert(bacterialComposition).values(composition);
  }

  async getMetabolites(sampleId: string): Promise<Metabolite[]> {
    return await db.select().from(metabolites).where(eq(metabolites.sampleId, sampleId));
  }

  async insertMetabolite(metabolite: InsertMetabolite): Promise<void> {
    await db.insert(metabolites).values(metabolite);
  }

  async getHealthImpacts(metaboliteId: string): Promise<HealthImpact[]> {
    return await db.select().from(healthImpacts).where(eq(healthImpacts.metaboliteId, metaboliteId));
  }

  async insertHealthImpact(impact: InsertHealthImpact): Promise<void> {
    await db.insert(healthImpacts).values(impact);
  }

  async getCohortReferences(): Promise<CohortReference[]> {
    return await db.select().from(cohortReferences);
  }

  async insertCohortReference(cohort: InsertCohortReference): Promise<void> {
    await db.insert(cohortReferences).values(cohort);
  }

  async getMlAnalyses(sampleId: string): Promise<MlAnalysis[]> {
    return await db.select().from(mlAnalyses).where(eq(mlAnalyses.sampleId, sampleId));
  }

  async insertMlAnalysis(analysis: InsertMlAnalysis): Promise<string> {
    const [result] = await db.insert(mlAnalyses).values(analysis).returning();
    return result.id;
  }

  async getRecommendations(sampleId: string): Promise<Recommendation[]> {
    return await db.select().from(recommendations).where(eq(recommendations.sampleId, sampleId));
  }

  async insertRecommendation(recommendation: InsertRecommendation): Promise<void> {
    await db.insert(recommendations).values(recommendation);
  }

  async getMeals(userId: string): Promise<Meal[]> {
    return await db.select().from(meals).where(eq(meals.userId, userId)).orderBy(desc(meals.loggedAt));
  }

  async insertMeal(meal: InsertMeal): Promise<Meal> {
    const [newMeal] = await db.insert(meals).values(meal).returning();
    return newMeal;
  }

  async updateMeal(id: string, updates: Partial<Meal>): Promise<Meal> {
    const [updatedMeal] = await db.update(meals).set(updates).where(eq(meals.id, id)).returning();
    return updatedMeal;
  }

  async deleteMeal(id: string): Promise<void> {
    await db.delete(meals).where(eq(meals.id, id));
  }

  async getDemoUser(): Promise<User | undefined> {
    return this.getUser(this.demoUserId);
  }

  async getDemoSamples(): Promise<MicrobiomeSample[]> {
    return this.getUserSamples(this.demoUserId);
  }
}

export const storage = new DatabaseStorage();
