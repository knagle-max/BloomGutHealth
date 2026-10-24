import { eq, sql } from "drizzle-orm";
import { users, meals, microbiomeSamples, bacterialComposition, metabolites, healthImpacts, mlAnalyses, recommendations, precisionProfiles, precisionRecords, nutritionProducts, experienceSettings, experienceRecords, healthSourceConsents, healthObservations, capabilityPreferences } from "../shared/schema";
import { decryptPrecision } from "./precision-crypto";
import type { db as appDatabase } from "./db";

/** Read-only snapshot of account-owned application records. Never exports auth material. */
export class AccountExportStorage {
  constructor(private readonly db: Pick<typeof appDatabase, "transaction">) {}
  async exportAccount(userId: string) {
    let stage="snapshot";
    try { return await this.db.transaction(async tx => {
      await tx.execute(sql`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY`);
      await tx.execute(sql`SET LOCAL statement_timeout = '20s'`);
      stage="profile";
      const [profile] = await tx.select({id:users.id,username:users.username,sex:users.sex,age:users.age,heightCm:users.heightCm,weightKg:users.weightKg,activityLevel:users.activityLevel,dietaryPreferences:users.dietaryPreferences}).from(users).where(eq(users.id,userId));
      if (!profile) throw Error("ACCOUNT_NOT_FOUND");
      let bytes=0;
      const checked = <T>(rows: T[]) => {
        bytes+=Buffer.byteLength(JSON.stringify(rows),"utf8");
        if(rows.length > 50000 || bytes > 20*1024*1024) throw Error("EXPORT_TOO_LARGE");
        return rows;
      };
      stage="journal";
      const journal = checked(await tx.select().from(meals).where(eq(meals.userId,userId)).limit(50001));
      stage="gut-samples";
      const samples = checked(await tx.select({id:microbiomeSamples.id,testDate:microbiomeSamples.testDate,testingCompany:microbiomeSamples.testingCompany,testId:microbiomeSamples.testId,structuredData:microbiomeSamples.structuredData,notes:microbiomeSamples.notes,processingStatus:microbiomeSamples.processingStatus,diversityIndex:microbiomeSamples.diversityIndex,uploadedAt:microbiomeSamples.uploadedAt}).from(microbiomeSamples).where(eq(microbiomeSamples.userId,userId)).limit(50001));
      stage="gut-bacteria";
      const bacteria = checked(await tx.select({record:bacterialComposition}).from(bacterialComposition).innerJoin(microbiomeSamples,eq(bacterialComposition.sampleId,microbiomeSamples.id)).where(eq(microbiomeSamples.userId,userId)).limit(50001)).map(r=>r.record);
      stage="gut-metabolites";
      const compounds = checked(await tx.select({record:metabolites}).from(metabolites).innerJoin(microbiomeSamples,eq(metabolites.sampleId,microbiomeSamples.id)).where(eq(microbiomeSamples.userId,userId)).limit(50001)).map(r=>r.record);
      stage="gut-impacts";
      const impacts = checked(await tx.select({record:healthImpacts}).from(healthImpacts).innerJoin(metabolites,eq(healthImpacts.metaboliteId,metabolites.id)).innerJoin(microbiomeSamples,eq(metabolites.sampleId,microbiomeSamples.id)).where(eq(microbiomeSamples.userId,userId)).limit(50001)).map(r=>r.record);
      stage="gut-analyses";
      const analyses = checked(await tx.select({record:mlAnalyses}).from(mlAnalyses).innerJoin(microbiomeSamples,eq(mlAnalyses.sampleId,microbiomeSamples.id)).where(eq(microbiomeSamples.userId,userId)).limit(50001)).map(r=>r.record);
      stage="gut-recommendations";
      const advice = checked(await tx.select({record:recommendations}).from(recommendations).innerJoin(microbiomeSamples,eq(recommendations.sampleId,microbiomeSamples.id)).where(eq(microbiomeSamples.userId,userId)).limit(50001)).map(r=>r.record);
      stage="biology-context";
      const [context] = await tx.select().from(precisionProfiles).where(eq(precisionProfiles.userId,userId));
      stage="biology-records";
      const precision = checked(await tx.select().from(precisionRecords).where(eq(precisionRecords.userId,userId)).limit(50001)).map(({encryptedPayload,...r})=>({...r,payload:decryptPrecision(encryptedPayload,userId)}));
      stage="labels";
      const labels = checked(await tx.select().from(nutritionProducts).where(eq(nutritionProducts.userId,userId)).limit(50001)).map(({encryptedPayload,...r})=>({...r,payload:decryptPrecision(encryptedPayload,userId)}));
      stage="experience-settings";
      const [settings] = await tx.select().from(experienceSettings).where(eq(experienceSettings.userId,userId));
      stage="experience-records";
      const experience = checked(await tx.select().from(experienceRecords).where(eq(experienceRecords.userId,userId)).limit(50001)).map(({encryptedPayload,...r})=>({...r,payload:decryptPrecision(encryptedPayload,userId)}));
      const healthTables=await tx.execute<{consent_table:string|null;observation_table:string|null;preview_table:string|null}>(sql`SELECT to_regclass('health_source_consents')::text AS consent_table, to_regclass('health_observations')::text AS observation_table,to_regclass('capability_preferences')::text AS preview_table`);
      const healthStorage=healthTables.rows[0];
      stage="health-consents";
      const consents = healthStorage.consent_table ? checked(await tx.select().from(healthSourceConsents).where(eq(healthSourceConsents.userId,userId)).limit(50001)).map(({encryptedPayload,...r})=>({...r,payload:decryptPrecision(encryptedPayload,userId)})) : null;
      stage="health-observations";
      const observations = healthStorage.observation_table ? checked(await tx.select().from(healthObservations).where(eq(healthObservations.userId,userId)).limit(50001)).map(({encryptedPayload,...r})=>({...r,payload:decryptPrecision(encryptedPayload,userId)})) : null;
      const preview=healthStorage.preview_table?await tx.select({enabled:capabilityPreferences.enabled,updatedAt:capabilityPreferences.updatedAt}).from(capabilityPreferences).where(eq(capabilityPreferences.userId,userId)):[];
      return {experimentalPreference:preview[0]||null,format:"bloom-account-records-v1",exportedAt:new Date().toISOString(),profile,journal,
        gutReports:{samples,bacteria,metabolites:compounds,healthImpacts:impacts,analyses,recommendations:advice},
        biology:{context:context?{payload:decryptPrecision(context.encryptedContext,userId),updatedAt:context.updatedAt}:null,records:precision},
        savedLabels:labels,experience:{settings:settings?{payload:decryptPrecision(settings.encryptedPayload,userId),updatedAt:settings.updatedAt}:null,records:experience},healthSources:{storage:{consents:healthStorage.consent_table?"provisioned":"not-provisioned",observations:healthStorage.observation_table?"provisioned":"not-provisioned"},consents,observations},
        limits:["Optional health-source sections are null with storage status not-provisioned when those tables are absent in an older deployment; this is distinct from a provisioned empty collection.","Sensitive health information. Store privately and share only with people you choose.","Recorded values, original units and historical outputs are preserved; this export does not validate or update past medical interpretations.","Includes the account-owned application records listed here. Excludes passwords, sessions, encryption keys, internal file paths, operational logs and request receipts, database backups and records held independently by external providers.","Downloading does not delete records, revoke permissions or stop future processing. Account-wide erasure and backup/vendor lifecycle controls remain incomplete."]};
    }); } catch(error) {
      const candidate=(error as any)?.cause?.code || (error as any)?.code;
      const code=typeof candidate==="string" && /^[A-Z0-9_]{1,40}$/.test(candidate)?candidate:"unclassified";
      // Fixed stage + SQLSTATE only: never log query text, parameters, user IDs or payloads.
      console.warn(`Account export unavailable: stage=${stage}; code=${code}`);
      throw Error("ACCOUNT_EXPORT_UNAVAILABLE");
    }
  }
}
