import { getOwnedSample,updateOwnedSample,getOwnedComposition,getOwnedAnalyses,insertOwnedComposition,insertOwnedAnalysis,type SampleUpdates } from "./report-records";
import { getOwnedMeal,updateOwnedMeal,deleteOwnedMeal,type MealUpdates } from "./meal-records";
import {importStructuredReportWithReceipt} from "./structured-report-storage";
import type {StructuredReport,ReportImportFields,ReportSaveResult} from "../shared/structured-report";
import type {LabDateChange} from "../shared/lab-date-correction";
import {updatePreferencesWithRevision} from "./preference-source";
import type {DietaryPreferences} from "../shared/meal-intelligence";
import {updateProfileWithRevision} from "./profile-source";
import { BiologyStorage } from "./biology-storage";
import { insertMealWithReceipt, type MealSaveReceipt } from "./meal-save";
import type { BiologicalRegistry } from "../shared/biological-model";
import { ExperienceStorage, type ExperienceStore } from "./experience-storage";
import { nutritionProducts } from "../shared/schema";
import { encryptPrecision, decryptPrecision } from "./precision-crypto";
import type { LabelInput, Product } from "../shared/products";
import {
  type User,
  type InsertUser,
  type UpdateUserProfile,
  type MicrobiomeSample,
  type InsertMicrobiomeSample,
  type BacterialComposition,
  type InsertBacterialComposition,
  type MlAnalysis,
  type InsertMlAnalysis,
  type Meal,
  type InsertMeal,
  users,
  microbiomeSamples,
  meals,
} from "@shared/schema";
import { db } from "./db";
import { PrecisionStorage } from "./precision-storage";
import type {
  PrecisionContext,
  PrecisionRecord,
} from "../shared/precision-nutrition";
import { eq, and, sql, desc } from "drizzle-orm";

export interface IStorage extends ExperienceStore {
  getBiologicalRegistry(): Promise<BiologicalRegistry>;
  getNutritionProducts(userId: string): Promise<Product[]>;
  insertNutritionProduct(userId: string, label: LabelInput): Promise<Product>;
  deleteNutritionProduct(userId: string, id: string): Promise<boolean>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: string, profile: UpdateUserProfile, expectedRevision?:string): Promise<void>;
  updateUserPreferences?(id:string,preferences:DietaryPreferences,expectedRevision:string):Promise<void>;

  getMicrobiomeSample(id: string,userId:string): Promise<MicrobiomeSample | undefined>;
  insertMicrobiomeSample(
    sample: InsertMicrobiomeSample,
  ): Promise<MicrobiomeSample>;
  updateMicrobiomeSample(
    id: string,
    updates: SampleUpdates,
    userId:string,
  ): Promise<void>;
  getUserSamples(userId: string): Promise<MicrobiomeSample[]>;
  importStructuredReport?(userId:string,report:StructuredReport,fields:ReportImportFields,filename:string|null,key:string):Promise<ReportSaveResult>;

  getBacterialComposition(sampleId: string,userId:string): Promise<BacterialComposition[]>;
  insertBacterialComposition(
    composition: InsertBacterialComposition,
    userId:string,
  ): Promise<void>;




  getMlAnalyses(sampleId: string,userId:string): Promise<MlAnalysis[]>;
  insertMlAnalysis(analysis: InsertMlAnalysis,userId:string): Promise<string>;


  getMeal(id: string,userId:string): Promise<Meal | undefined>;
  getMeals(userId: string): Promise<Meal[]>;
  insertMeal(meal: InsertMeal, receipt?: MealSaveReceipt): Promise<Meal>;
  updateMeal(id: string, updates: MealUpdates,userId:string): Promise<Meal|undefined>;
  deleteMeal(id: string,userId:string): Promise<void>;

  getPrecisionContext(userId: string): Promise<unknown>;
  putPrecisionContext(userId: string, context: PrecisionContext): Promise<void>;
  getPrecisionRecords(userId: string): Promise<PrecisionRecord[]>;
  insertPrecisionRecord(
    userId: string,
    kind: string,
    payload: unknown,
    saveKey?: string,
  ): Promise<PrecisionRecord>;
  insertReviewedLab?(userId:string,payload:unknown,saveKey:string,reviewedMatches:readonly string[]):Promise<PrecisionRecord>;
  correctLabDate?(userId:string, sourceId:string, input:LabDateChange, saveKey:string):Promise<PrecisionRecord>;
  deleteLabEntry?(userId: string, id: string): Promise<void>;
  deletePrecisionRecord(userId: string, id: string): Promise<boolean>;
  clearPrecisionData(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private biology = new BiologyStorage(db);
  getBiologicalRegistry(){return this.biology.getBiologicalRegistry();}
  // Inactive unscoped prediction/cohort accessors are intentionally not part of this application interface.
  // Synthetic examples are served by demo-routes; construction never seeds account data.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserProfile(
    id: string,
    profile: UpdateUserProfile,
    expectedRevision?:string,
  ): Promise<void> {
    await updateProfileWithRevision(db,id,profile,expectedRevision);
  }

  async updateUserPreferences(id:string,preferences:DietaryPreferences,expectedRevision:string):Promise<void>{
    await updatePreferencesWithRevision(db,id,preferences,expectedRevision);
  }

  getMicrobiomeSample(id:string,userId:string) { return getOwnedSample(db,id,userId); }

  importStructuredReport(userId:string,report:StructuredReport,fields:ReportImportFields,filename:string|null,key:string){return importStructuredReportWithReceipt(db,userId,report,fields,filename,key);}

  async insertMicrobiomeSample(
    sample: InsertMicrobiomeSample,
  ): Promise<MicrobiomeSample> {
    const [newSample] = await db
      .insert(microbiomeSamples)
      .values(sample)
      .returning();
    return newSample;
  }

  updateMicrobiomeSample(id:string,updates:SampleUpdates,userId:string) { return updateOwnedSample(db,id,updates,userId); }

  async getUserSamples(userId: string): Promise<MicrobiomeSample[]> {
    return await db
      .select()
      .from(microbiomeSamples)
      .where(eq(microbiomeSamples.userId, userId));
  }

  getBacterialComposition(sampleId:string,userId:string) { return getOwnedComposition(db,sampleId,userId); }

  insertBacterialComposition(composition:InsertBacterialComposition,userId:string) { return insertOwnedComposition(db,composition,userId); }

  getMlAnalyses(sampleId:string,userId:string) { return getOwnedAnalyses(db,sampleId,userId); }

  insertMlAnalysis(analysis:InsertMlAnalysis,userId:string) { return insertOwnedAnalysis(db,analysis,userId); }

  getMeal(id:string,userId:string) { return getOwnedMeal(db,id,userId); }

  async getMeals(userId: string): Promise<Meal[]> {
    return await db
      .select()
      .from(meals)
      .where(eq(meals.userId, userId))
      .orderBy(desc(meals.loggedAt));
  }

  async insertMeal(meal: InsertMeal, receipt?: MealSaveReceipt): Promise<Meal> {
    return insertMealWithReceipt(db, meal, receipt);
  }

  updateMeal(id:string,updates:MealUpdates,userId:string) { return updateOwnedMeal(db,id,updates,userId); }
  deleteMeal(id:string,userId:string) { return deleteOwnedMeal(db,id,userId); }

  private readonly experience = new ExperienceStorage(db);
  getExperienceSettings: ExperienceStore["getExperienceSettings"] = (id) => this.experience.getExperienceSettings(id);
  putExperienceSettings: ExperienceStore["putExperienceSettings"] = (id,p) => this.experience.putExperienceSettings(id,p);
  putExperienceSettingsIfCurrent = (id:string,p:Parameters<ExperienceStore["putExperienceSettings"]>[1],revision:string) => this.experience.putExperienceSettingsIfCurrent(id,p,revision);
  getCheckinFeedback(userId:string,id:string){return this.experience.getCheckinFeedback(userId,id);}
  createActivity(...args:Parameters<ExperienceStorage["createActivity"]>){return this.experience.createActivity(...args);}
  createSession(...args:Parameters<ExperienceStorage["createSession"]>){return this.experience.createSession(...args);}
  putCheckinFeedback(...args:Parameters<ExperienceStorage["putCheckinFeedback"]>){return this.experience.putCheckinFeedback(...args);}
  getExperienceRecords: ExperienceStore["getExperienceRecords"] = (id,kind) => this.experience.getExperienceRecords(id,kind);
  insertExperienceRecord: ExperienceStore["insertExperienceRecord"] = (id,p) => this.experience.insertExperienceRecord(id,p);
  updateExperienceRecord: ExperienceStore["updateExperienceRecord"] = (id,r,p) => this.experience.updateExperienceRecord(id,r,p);
  deleteExperienceRecord: ExperienceStore["deleteExperienceRecord"] = (id,r) => this.experience.deleteExperienceRecord(id,r);
  clearExperienceData: ExperienceStore["clearExperienceData"] = (id) => this.experience.clearExperienceData(id);
  private readonly precision = new PrecisionStorage(db);
  getPrecisionContext(userId: string) {
    return this.precision.getPrecisionContext(userId);
  }
  putPrecisionContext(userId: string, context: PrecisionContext) {
    return this.precision.putPrecisionContext(userId, context);
  }
  async getNutritionProducts(userId: string): Promise<Product[]> {
    const rows = await db
      .select()
      .from(nutritionProducts)
      .where(eq(nutritionProducts.userId, userId))
      .orderBy(desc(nutritionProducts.createdAt))
      .limit(200);
    return rows.map((row) => ({
      ...(decryptPrecision(row.encryptedPayload, userId) as LabelInput),
      source: "manual" as const,
      id: row.id,
      url: null,
      retrievedAt: row.createdAt.toISOString(),
      notes: ["Entered from your package label; not independently verified."],
    }));
  }
  async insertNutritionProduct(
    userId: string,
    label: LabelInput,
  ): Promise<Product> {
    const [row] = await db
      .insert(nutritionProducts)
      .values({ userId, encryptedPayload: encryptPrecision(label, userId) })
      .returning();
    return {
      ...label,
      source: "manual",
      id: row.id,
      url: null,
      retrievedAt: row.createdAt.toISOString(),
      notes: ["Entered from your package label; not independently verified."],
    };
  }
  async deleteNutritionProduct(userId: string, id: string) {
    const rows = await db
      .delete(nutritionProducts)
      .where(
        and(eq(nutritionProducts.userId, userId), eq(nutritionProducts.id, id)),
      )
      .returning({ id: nutritionProducts.id });
    return rows.length > 0;
  }
  getPrecisionRecords(userId: string) {
    return this.precision.getPrecisionRecords(userId);
  }
  insertPrecisionRecord(userId: string, kind: string, payload: unknown, saveKey?: string) {
    return this.precision.insertPrecisionRecord(userId, kind, payload, saveKey);
  }
  insertReviewedLab(userId:string,payload:unknown,saveKey:string,reviewedMatches:readonly string[]){
    return this.precision.insertReviewedLab(userId,payload,saveKey,reviewedMatches);
  }
  correctLabDate(userId:string, sourceId:string, input:LabDateChange, saveKey:string) {
    return this.precision.correctLabDate(userId,sourceId,input,saveKey);
  }
  deleteLabEntry(userId: string, id: string) {
    return this.precision.deleteLabEntry(userId, id);
  }
  deletePrecisionRecord(userId: string, id: string) {
    return this.precision.deletePrecisionRecord(userId, id);
  }
  clearPrecisionData(userId: string) {
    return this.precision.clearPrecisionData(userId);
  }


}

export const storage = new DatabaseStorage();
