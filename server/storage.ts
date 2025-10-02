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

  constructor() {
    this.users = new Map();
    this.microbiomeSamples = new Map();
    this.bacterialComposition = new Map();
    this.metabolites = new Map();
    this.healthImpacts = new Map();
    this.cohortReferences = new Map();
    this.mlAnalyses = new Map();
    this.recommendations = new Map();
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
      ...sample,
      id,
      uploadedAt: new Date(),
      processingStatus: sample.processingStatus || "pending",
      diversityIndex: sample.diversityIndex || null,
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
    const newComposition: BacterialComposition = { ...composition, id };
    const existing = this.bacterialComposition.get(composition.sampleId) || [];
    this.bacterialComposition.set(composition.sampleId, [...existing, newComposition]);
  }

  async getMetabolites(sampleId: string): Promise<Metabolite[]> {
    return this.metabolites.get(sampleId) || [];
  }

  async insertMetabolite(metabolite: InsertMetabolite): Promise<void> {
    const id = randomUUID();
    const newMetabolite: Metabolite = { ...metabolite, id };
    const existing = this.metabolites.get(metabolite.sampleId) || [];
    this.metabolites.set(metabolite.sampleId, [...existing, newMetabolite]);
  }

  async getHealthImpacts(metaboliteId: string): Promise<HealthImpact[]> {
    return this.healthImpacts.get(metaboliteId) || [];
  }

  async insertHealthImpact(impact: InsertHealthImpact): Promise<void> {
    const id = randomUUID();
    const newImpact: HealthImpact = { ...impact, id };
    const existing = this.healthImpacts.get(impact.metaboliteId) || [];
    this.healthImpacts.set(impact.metaboliteId, [...existing, newImpact]);
  }

  async getCohortReferences(): Promise<CohortReference[]> {
    return Array.from(this.cohortReferences.values());
  }

  async insertCohortReference(cohort: InsertCohortReference): Promise<void> {
    const id = randomUUID();
    const newCohort: CohortReference = { ...cohort, id };
    this.cohortReferences.set(id, newCohort);
  }

  async getMlAnalyses(sampleId: string): Promise<MlAnalysis[]> {
    return this.mlAnalyses.get(sampleId) || [];
  }

  async insertMlAnalysis(analysis: InsertMlAnalysis): Promise<string> {
    const id = randomUUID();
    const newAnalysis: MlAnalysis = {
      ...analysis,
      id,
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
      ...recommendation,
      id,
      createdAt: new Date(),
      isActive: recommendation.isActive ?? true,
    };
    const existing = this.recommendations.get(recommendation.sampleId) || [];
    this.recommendations.set(recommendation.sampleId, [...existing, newRecommendation]);
  }
}

export const storage = new MemStorage();
