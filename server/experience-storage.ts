import {checkinFeedbackView,preserveFocusFeedback} from "./checkin-feedback-source";
import {settingsRevision,SettingsRevisionConflict} from "./settings-source";
import {invalidateAthleteReview} from "../shared/athlete-review";
import { and, eq, desc, sql } from "drizzle-orm";
import { experienceSettings, experienceRecords } from "../shared/schema";
import { experienceSettingsSchema, experienceEntrySchema, type ExperienceSettings, type ExperienceSettingsPatch, type ExperienceEntry, type ExperienceRecord,type CheckinFeedbackView } from "../shared/experience";
import { encryptPrecision, decryptPrecision } from "./precision-crypto";
import type { db as appDatabase } from "./db";
type Database = Pick<typeof appDatabase,"select"|"insert"|"update"|"delete"|"transaction">;
const decode = (r: typeof experienceRecords.$inferSelect, userId:string):ExperienceRecord => ({...experienceEntrySchema.parse({kind:r.kind,payload:decryptPrecision(r.encryptedPayload,userId)}),id:r.id,createdAt:r.createdAt.toISOString(),updatedAt:r.updatedAt.toISOString()});
export class ExperienceStorage {
 constructor(private readonly db:Database) {}
 async getExperienceSettings(userId:string) {
  const [r]=await this.db.select().from(experienceSettings).where(eq(experienceSettings.userId,userId));
  return experienceSettingsSchema.parse(r?decryptPrecision(r.encryptedPayload,userId):{});
 }
 async putExperienceSettings(userId:string,patch:ExperienceSettingsPatch){return this.writeSettings(userId,patch);}
 async putExperienceSettingsIfCurrent(userId:string,patch:ExperienceSettingsPatch,revision:string){return this.writeSettings(userId,patch,revision);}
 private async writeSettings(userId:string, patch:ExperienceSettingsPatch,expectedRevision?:string) {
  return this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 1))`);
   const [r]=await tx.select().from(experienceSettings).where(eq(experienceSettings.userId,userId));
   const current=experienceSettingsSchema.parse(r?decryptPrecision(r.encryptedPayload,userId):{});
   if(expectedRevision!==undefined&&settingsRevision(userId,current)!==expectedRevision)throw new SettingsRevisionConflict();
   const {athleteReviewFor,...values}=patch;
   const next=experienceSettingsSchema.parse({...current,...values});
   if(patch.athlete)next.athlete=invalidateAthleteReview(current.athlete,next.athlete,athleteReviewFor);
   await tx.insert(experienceSettings).values({userId,encryptedPayload:encryptPrecision(next,userId)}).onConflictDoUpdate({target:experienceSettings.userId,set:{encryptedPayload:encryptPrecision(next,userId),updatedAt:new Date()}});
   return next;
  });
 }
 async getExperienceRecords(userId:string, kind?:ExperienceEntry["kind"]) {
  const rows=await this.db.select().from(experienceRecords).where(kind?and(eq(experienceRecords.userId,userId),eq(experienceRecords.kind,kind)):eq(experienceRecords.userId,userId)).orderBy(desc(experienceRecords.updatedAt)).limit(2000);
  return rows.map(r=>decode(r,userId));
 }
 async getCheckinFeedback(userId:string,id:string):Promise<CheckinFeedbackView|null>{
  const [row]=await this.db.select({id:experienceRecords.id,encryptedPayload:experienceRecords.encryptedPayload}).from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id),eq(experienceRecords.kind,"checkin")));
  return row?checkinFeedbackView(userId,row.id,decryptPrecision(row.encryptedPayload,userId)):null;
 }
 async insertExperienceRecord(userId:string, entry:ExperienceEntry) {
  if(entry.kind==="checkin"&&entry.payload.focusFeedback!==undefined)throw Error("CHECKIN_FEEDBACK_ACTION_REQUIRED");
  return this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 1))`);
   const rows=await tx.select({id:experienceRecords.id,kind:experienceRecords.kind,encryptedPayload:experienceRecords.encryptedPayload,createdAt:experienceRecords.createdAt}).from(experienceRecords).where(eq(experienceRecords.userId,userId)).orderBy(desc(experienceRecords.createdAt));
   // Exact-description memories are one record per key, scoped to the owner.
   if(entry.kind==="food-memory" || entry.kind==="checkin") {
    const found=rows.find(r=>{
      if(r.kind!==entry.kind)return false;
      const payload=decryptPrecision(r.encryptedPayload,userId) as any;
      return entry.kind==="food-memory" ? payload.key===entry.payload.key : payload.date===entry.payload.date && payload.mode===entry.payload.mode;
    });
    if(found) {
     const payload=preserveFocusFeedback(entry,decryptPrecision(found.encryptedPayload,userId));
     const [r]=await tx.update(experienceRecords).set({encryptedPayload:encryptPrecision(payload,userId),updatedAt:new Date()}).where(and(eq(experienceRecords.id,found.id),eq(experienceRecords.userId,userId))).returning();
     return decode(r,userId);
    }
   }
   if(rows.length>=2000) throw Error("EXPERIENCE_LIMIT");
   const [r]=await tx.insert(experienceRecords).values({userId,kind:entry.kind,encryptedPayload:encryptPrecision(entry.payload,userId)}).returning();
   return decode(r,userId);
  });
 }
 async updateExperienceRecord(userId:string,id:string,entry:ExperienceEntry) {
  if(entry.kind==="checkin"&&entry.payload.focusFeedback!==undefined)throw Error("CHECKIN_FEEDBACK_ACTION_REQUIRED");
  return this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 1))`);
   const [existing]=await tx.select({encryptedPayload:experienceRecords.encryptedPayload}).from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id),eq(experienceRecords.kind,entry.kind)));
   if(!existing)return null;
   const payload=preserveFocusFeedback(entry,decryptPrecision(existing.encryptedPayload,userId));
   const [row]=await tx.update(experienceRecords).set({encryptedPayload:encryptPrecision(payload,userId),updatedAt:new Date()}).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id),eq(experienceRecords.kind,entry.kind))).returning();
   return row?decode(row,userId):null;
  });
 }
 async deleteExperienceRecord(userId:string,id:string) {
  const r=await this.db.delete(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id))).returning({id:experienceRecords.id});return !!r.length;
 }
 async clearExperienceData(userId:string) {
  await this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 1))`);
   await tx.delete(experienceRecords).where(eq(experienceRecords.userId,userId));
   await tx.delete(experienceSettings).where(eq(experienceSettings.userId,userId));
  });
 }
}
export interface ExperienceStore {
 getExperienceSettings(userId:string):Promise<ExperienceSettings>;
 putExperienceSettings(userId:string,patch:ExperienceSettingsPatch):Promise<ExperienceSettings>;
 putExperienceSettingsIfCurrent?(userId:string,patch:ExperienceSettingsPatch,revision:string):Promise<ExperienceSettings>;
 getCheckinFeedback?(userId:string,id:string):Promise<CheckinFeedbackView|null>;
 getExperienceRecords(userId:string,kind?:ExperienceEntry["kind"]):Promise<ExperienceRecord[]>;
 insertExperienceRecord(userId:string,entry:ExperienceEntry):Promise<ExperienceRecord>;
 updateExperienceRecord(userId:string,id:string,entry:ExperienceEntry):Promise<ExperienceRecord|null>;
 deleteExperienceRecord(userId:string,id:string):Promise<boolean>;
 clearExperienceData(userId:string):Promise<void>;
}
