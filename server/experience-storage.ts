import {routineSourceMatches,routineLocalDate,routineDue,addRoutineDays} from '../shared/activity-routines';
import {ActivityRoutineConflict} from './activity-routine-errors';
import {activityRoutineSchema,activityRoutinePlanSchema,type ActivityRoutinePlan,routineOccurrenceOverrideSchema,type RoutineOccurrenceOverride} from '../shared/experience';
import {checkinRecordSourceSchema,type CheckinRecordSource} from '../shared/wellness-checkin-sources';
import {ExperimentHistoryUnavailable} from "./experience-errors";
import {WellnessChoiceStorage} from "./wellness-choice-storage";
import {WellnessChoiceConflict} from "./wellness-actions";
import type {WellnessDay,WellnessChoiceCommand,WellnessHistoryDelete} from "../shared/wellness-actions";
import {mergeAthleteEntrySource} from "../shared/athlete-entry-capture";
import {activityProjection} from "../shared/activity-capture";
import {createHash,randomUUID} from "node:crypto";
import {checkinFeedbackView,preserveFocusFeedback,focusFeedbackReceipt,CheckinFeedbackConflict,CheckinFeedbackInvalid} from "./checkin-feedback-source";
import {settingsRevision,SettingsRevisionConflict} from "./settings-source";
import {invalidateAthleteReview} from "../shared/athlete-review";
import { and, eq, ne, desc, sql } from "drizzle-orm";
import { experienceSettings, experienceRecords,experimentVersions } from "../shared/schema";
import { athleteProfileSchema,hydrationSchema,experimentSchema,type ExperimentHistory,activitySchema,type Activity,trainingSessionSchema,type TrainingSession,checkinSchema,focusFeedbackRequestSchema,type FocusFeedbackRequest,experienceSettingsSchema,settingsPatchSchema, experienceEntrySchema, type ExperienceSettings, type ExperienceSettingsPatch, type ExperienceEntry, type ExperienceRecord,type CheckinFeedbackView } from "../shared/experience";
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
  patch=settingsPatchSchema.parse(patch);
  return this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 1))`);
   const [r]=await tx.select().from(experienceSettings).where(eq(experienceSettings.userId,userId));
   const current=experienceSettingsSchema.parse(r?decryptPrecision(r.encryptedPayload,userId):{});
   if(expectedRevision!==undefined&&settingsRevision(userId,current)!==expectedRevision)throw new SettingsRevisionConflict();
   const {athleteReviewFor,...values}=patch;
   const next=experienceSettingsSchema.parse({...current,...values,lifecycleId:current.lifecycleId??randomUUID()});
   // Unaware practical forms must not erase an explicitly saved browsing region.
   if(patch.practical&&patch.practical.region===undefined&&current.practical.region!==undefined)next.practical.region=current.practical.region;
   if(patch.athlete){
    next.athlete=athleteProfileSchema.parse({...next.athlete,entrySource:mergeAthleteEntrySource(current.athlete.entrySource,next.athlete.entrySource,next.athlete,next.athlete.massReference?.source==="profile-copy")});
    next.athlete=invalidateAthleteReview(current.athlete,next.athlete,athleteReviewFor);
   }
   await tx.insert(experienceSettings).values({userId,encryptedPayload:encryptPrecision(next,userId)}).onConflictDoUpdate({target:experienceSettings.userId,set:{encryptedPayload:encryptPrecision(next,userId),updatedAt:new Date()}});
   return next;
  });
 }
 async getExperienceRecords(userId:string, kind?:ExperienceEntry["kind"]) {
  const query=this.db.select().from(experienceRecords).where(kind?and(eq(experienceRecords.userId,userId),eq(experienceRecords.kind,kind)):and(eq(experienceRecords.userId,userId),ne(experienceRecords.kind,"wellness-choice")));
  const rows=kind==="wellness-choice"?await query.orderBy(desc(experienceRecords.createdAt),desc(experienceRecords.id)).limit(2000):await query.orderBy(desc(experienceRecords.updatedAt)).limit(2000);
  return rows.map(r=>decode(r,userId));
 }
 async exportExperience(userId:string){return this.db.transaction(async tx=>{
  await tx.execute(sql`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY`);
  await tx.execute(sql`SET LOCAL statement_timeout = '20s'`);
  const source=new ExperienceStorage(tx as unknown as Database);
  return{settings:await source.getExperienceSettings(userId),records:[...await source.getExperienceRecords(userId),...await source.getExperienceRecords(userId,"wellness-choice")],history:await source.getExperimentHistory(userId)};
 });}
 async getExperimentHistory(userId:string,recordId?:string):Promise<ExperimentHistory|null>{
  if(recordId){const[parent]=await this.db.select({id:experienceRecords.id}).from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,recordId),eq(experienceRecords.kind,"experiment")));if(!parent)return null;}
  const table=await this.db.select({exists:sql<boolean>`to_regclass('experiment_versions') IS NOT NULL`}).from(sql`(SELECT 1) AS history_storage`);
  if(!table[0]?.exists)return{status:"not-provisioned",versions:[]};
  const rows=await this.db.select({id:experimentVersions.id,recordId:experimentVersions.recordId,encryptedPayload:experimentVersions.encryptedPayload,sourceCreatedAt:experimentVersions.sourceCreatedAt,sourceUpdatedAt:experimentVersions.sourceUpdatedAt,supersededAt:experimentVersions.supersededAt}).from(experimentVersions).innerJoin(experienceRecords,eq(experimentVersions.recordId,experienceRecords.id)).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.kind,"experiment"),...(recordId?[eq(experienceRecords.id,recordId)]:[]))).orderBy(desc(experimentVersions.supersededAt),desc(experimentVersions.id)).limit(50001);
  if(rows.length>50000||Buffer.byteLength(JSON.stringify(rows),"utf8")>20*1024*1024)throw Error("EXPERIMENT_HISTORY_TOO_LARGE");
  return{status:"available",versions:rows.map(({encryptedPayload,...row})=>({...row,sourceCreatedAt:row.sourceCreatedAt.toISOString(),sourceUpdatedAt:row.sourceUpdatedAt.toISOString(),supersededAt:row.supersededAt.toISOString(),payload:experimentSchema.parse(decryptPrecision(encryptedPayload,userId))}))};
 }
 async getCheckinRecord(userId:string,id:string):Promise<CheckinRecordSource|null>{
  const [row]=await this.db.select().from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id),eq(experienceRecords.kind,"checkin")));
  return row?checkinRecordSourceSchema.parse(decode(row,userId)):null;
 }
 async getCheckinFeedback(userId:string,id:string):Promise<CheckinFeedbackView|null>{
  const [row]=await this.db.select({id:experienceRecords.id,encryptedPayload:experienceRecords.encryptedPayload}).from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id),eq(experienceRecords.kind,"checkin")));
  return row?checkinFeedbackView(userId,row.id,decryptPrecision(row.encryptedPayload,userId)):null;
 }
 async putCheckinFeedback(userId:string,id:string,request:FocusFeedbackRequest,key:string):Promise<CheckinFeedbackView|null>{
  const input=focusFeedbackRequestSchema.parse(request);
  if(!/^[A-Za-z0-9_-]{8,128}$/.test(key))throw new CheckinFeedbackInvalid();
  return this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 1))`);
   const [row]=await tx.select({id:experienceRecords.id,encryptedPayload:experienceRecords.encryptedPayload}).from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id),eq(experienceRecords.kind,"checkin")));
   if(!row)return null;
   const payload=checkinSchema.parse(decryptPrecision(row.encryptedPayload,userId));
   const view=checkinFeedbackView(userId,id,payload),receiptHash=focusFeedbackReceipt(userId,key),previous=payload.focusFeedback;
   if(previous?.receiptHash===receiptHash){
    if(previous.previousRevision!==input.sourceRevision||previous.response!==input.response)throw new CheckinFeedbackConflict();
    return view;
   }
   if(view.revision!==input.sourceRevision)throw new CheckinFeedbackConflict();
   if(input.response===null?previous?.response==null:!payload.focus)throw new CheckinFeedbackInvalid();
   const context=input.response===null?previous!:{focus:payload.focus,date:payload.date,mode:payload.mode};
   const next=checkinSchema.parse({...payload,focusFeedback:{version:1,response:input.response,focus:context.focus,date:context.date,mode:context.mode,recordedAt:new Date().toISOString(),receiptHash,previousRevision:input.sourceRevision}});
   const updated=await tx.update(experienceRecords).set({encryptedPayload:encryptPrecision(next,userId),updatedAt:new Date()}).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id),eq(experienceRecords.kind,"checkin"))).returning({id:experienceRecords.id});
   return updated.length?checkinFeedbackView(userId,id,next):null;
  });
 }
 async createActivityRoutine(userId:string,plan:ActivityRoutinePlan,key:string,sourceActivityId:string|null):Promise<ExperienceRecord>{
  plan=activityRoutinePlanSchema.parse(plan);
  if(!/^[a-f0-9-]{36}$/i.test(key))throw new ActivityRoutineConflict(400,'Choose a valid routine save reference.');
  const id='routine_'+createHash('sha256').update(JSON.stringify(['activity-routine-v1',userId,key])).digest('hex');
  return this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},1))`);
   const [existing]=await tx.select().from(experienceRecords).where(and(eq(experienceRecords.id,id),eq(experienceRecords.userId,userId),eq(experienceRecords.kind,'activity-routine')));
   if(existing){const row=decode(existing,userId);if(row.kind!=='activity-routine'||JSON.stringify(row.payload.plan)!==JSON.stringify(plan)||row.payload.sourceActivityId!==sourceActivityId)throw new ActivityRoutineConflict(409,'This routine save already has different details. Review the saved routine.');return row;}
   if(sourceActivityId){const [source]=await tx.select({id:experienceRecords.id}).from(experienceRecords).where(and(eq(experienceRecords.id,sourceActivityId),eq(experienceRecords.userId,userId),eq(experienceRecords.kind,'activity')));if(!source)throw new ActivityRoutineConflict(404,'Source activity not found in your account.');}
   const [count]=await tx.select({count:sql<number>`count(*)::int`}).from(experienceRecords).where(and(eq(experienceRecords.userId,userId),ne(experienceRecords.kind,'wellness-choice')));if(count.count>=2000)throw Error('EXPERIENCE_LIMIT');
   const payload=activityRoutineSchema.parse({plan,sourceActivityId,acknowledgedOccurrences:{}});
   const [row]=await tx.insert(experienceRecords).values({id,userId,kind:'activity-routine',encryptedPayload:encryptPrecision(payload,userId)}).returning();return decode(row,userId);
  });
 }
 async updateActivityRoutine(userId:string,id:string,expectedRevision:string,plan:ActivityRoutinePlan):Promise<ExperienceRecord|null>{
  plan=activityRoutinePlanSchema.parse(plan);
  return this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},1))`);
   const [source]=await tx.select().from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id),eq(experienceRecords.kind,'activity-routine'))).for('update');if(!source)return null;
   const current=activityRoutineSchema.parse(decryptPrecision(source.encryptedPayload,userId));
   if(current.plan.revision===plan.revision&&JSON.stringify(current.plan)===JSON.stringify(plan))return decode(source,userId);
   if(current.plan.revision!==expectedRevision||plan.revision===expectedRevision)throw new ActivityRoutineConflict(409,'This routine changed elsewhere. Review its latest schedule before saving.');
   if(current.priorPlans.length>=100)throw new ActivityRoutineConflict(409,'This routine has reached its saved revision limit. Keep it for history and create a new routine.');
   const payload=activityRoutineSchema.parse({...current,priorPlans:[...current.priorPlans,current.plan],plan});const [row]=await tx.update(experienceRecords).set({encryptedPayload:encryptPrecision(payload,userId),updatedAt:new Date()}).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id),eq(experienceRecords.kind,'activity-routine'))).returning();return decode(row,userId);
  });
 }
 async changeRoutineOccurrence(userId:string,id:string,date:string,expectedPlanRevision:string,expectedRevision:string|null,next:RoutineOccurrenceOverride|null):Promise<ExperienceRecord|null>{
  return this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},1))`);
   const [row]=await tx.select().from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id),eq(experienceRecords.kind,'activity-routine'))).for('update');if(!row)return null;
   const current=activityRoutineSchema.parse(decryptPrecision(row.encryptedPayload,userId)),previous=current.occurrenceOverrides[date],today=routineLocalDate(current.plan.timeZone);
   if(next)next=routineOccurrenceOverrideSchema.parse(next);
   if(next&&JSON.stringify(previous)===JSON.stringify(next))return decode(row,userId);
   if(!next&&!previous&&expectedPlanRevision===current.plan.revision)return decode(row,userId);
   if(next&&next.revision===expectedRevision)throw new ActivityRoutineConflict(409,'A changed occurrence requires a fresh revision.');
   if(current.plan.revision!==expectedPlanRevision||(previous?.revision??null)!==expectedRevision)throw new ActivityRoutineConflict(409,'This occurrence or schedule changed elsewhere. Review its latest source.');
   if(current.acknowledgedOccurrences[date])throw new ActivityRoutineConflict(409,'This occurrence was already recorded. Correct or remove its actual record in activity history.');
   if(date<addRoutineDays(today,-28)||date>addRoutineDays(today,28)||!routineDue({...current.plan,paused:false},date))throw new ActivityRoutineConflict(400,'Choose a scheduled day within 28 days of today.');
   if(next?.state==='rescheduled'&&(next.toDate!<today||next.toDate!>addRoutineDays(today,28)||next.toDate===date))throw new ActivityRoutineConflict(400,'Choose a different local date between today and 28 days from now.');
   const overrides={...current.occurrenceOverrides};if(next)overrides[date]=next;else delete overrides[date];
   const payload=activityRoutineSchema.parse({...current,occurrenceOverrides:overrides});const [updated]=await tx.update(experienceRecords).set({encryptedPayload:encryptPrecision(payload,userId),updatedAt:new Date()}).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id),eq(experienceRecords.kind,'activity-routine'))).returning();return decode(updated,userId);
  });
 }
 createActivity(userId:string,input:Activity,key:string):Promise<ExperienceRecord>{return this.createTimedRecord(userId,"activity",input,key);}
 createSession(userId:string,input:TrainingSession,key:string):Promise<ExperienceRecord>{return this.createTimedRecord(userId,"session",input,key);}
 private async createTimedRecord(userId:string,kind:"activity"|"session",input:Activity|TrainingSession,key:string):Promise<ExperienceRecord>{
  let payload=kind==="activity"?activitySchema.parse(input):trainingSessionSchema.parse(input);
  if(kind==="activity"&&(payload as Activity).components)payload=activitySchema.parse({...payload,...activityProjection((payload as Activity).components!.items)});
  if(!/^[a-f0-9-]{36}$/i.test(key))throw Error("INVALID_SAVE_KEY");
  const routineSource=kind==='activity'?(payload as Activity).routineSource:undefined;
  const id=kind+"_"+createHash("sha256").update(JSON.stringify(routineSource?['routine-activity-v1',userId,routineSource.routineId,routineSource.scheduledDate]:[`manual-${kind}-v1`,userId,key])).digest("hex");
  return this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 1))`);
   const [existing]=await tx.select().from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id),eq(experienceRecords.kind,kind)));
   if(existing){const record=decode(existing,userId);if(record.kind!==kind||JSON.stringify(record.payload)!==JSON.stringify(payload))throw Error(kind==="activity"?"ACTIVITY_SAVE_CONFLICT":"SESSION_SAVE_CONFLICT");return record;}
   let routine: {id:string;payload:ReturnType<typeof activityRoutineSchema.parse>}|null=null;
   if(routineSource){
    const [source]=await tx.select().from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,routineSource.routineId),eq(experienceRecords.kind,'activity-routine'))).for('update');
    if(!source)throw new ActivityRoutineConflict(404,'Routine not found in your account.');
    const saved=activityRoutineSchema.parse(decryptPrecision(source.encryptedPayload,userId));
    if(saved.acknowledgedOccurrences[routineSource.scheduledDate])throw new ActivityRoutineConflict(409,'This occurrence was already recorded. Review its source history; a retry cannot restore a deleted record.');
    if(!routineSourceMatches(payload as Activity,saved.plan,new Date(),saved.occurrenceOverrides))throw new ActivityRoutineConflict(409,'Review the current routine, local date and explicit completion before saving.');
    routine={id:source.id,payload:saved};
   }
   const [count]=await tx.select({count:sql<number>`count(*)::int`}).from(experienceRecords).where(and(eq(experienceRecords.userId,userId),ne(experienceRecords.kind,"wellness-choice")));
   if(count.count>=2000)throw Error("EXPERIENCE_LIMIT");
   const [row]=await tx.insert(experienceRecords).values({id,userId,kind,encryptedPayload:encryptPrecision(payload,userId)}).returning();
   if(routine&&routineSource){const next=activityRoutineSchema.parse({...routine.payload,acknowledgedOccurrences:{...routine.payload.acknowledgedOccurrences,[routineSource.scheduledDate]:{activityId:id,revision:routineSource.revision,receiptHash:createHash('sha256').update(JSON.stringify([id,payload])).digest('hex')}}});await tx.update(experienceRecords).set({encryptedPayload:encryptPrecision(next,userId),updatedAt:new Date()}).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,routine.id),eq(experienceRecords.kind,'activity-routine')));}
   return decode(row,userId);
  });
 }
 async insertExperienceRecord(userId:string, entry:ExperienceEntry) {
  if(entry.kind==="wellness-choice")throw Error("WELLNESS_CHOICE_ACTION_REQUIRED");
  if(entry.kind==="activity")throw Error("ACTIVITY_ACTION_REQUIRED");
  if(entry.kind==="activity-routine")throw new ActivityRoutineConflict(400,"Use the versioned routine action.");
  if(entry.kind==="checkin"&&entry.payload.focusFeedback!==undefined)throw Error("CHECKIN_FEEDBACK_ACTION_REQUIRED");
  return this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 1))`);
   const rows=await tx.select({id:experienceRecords.id,kind:experienceRecords.kind,encryptedPayload:experienceRecords.encryptedPayload,createdAt:experienceRecords.createdAt}).from(experienceRecords).where(and(eq(experienceRecords.userId,userId),ne(experienceRecords.kind,"wellness-choice"))).orderBy(desc(experienceRecords.createdAt));
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
  if(entry.kind==="activity-routine")throw new ActivityRoutineConflict(400,"Use the versioned routine controls.");
  if(entry.kind==="wellness-choice")throw Error("WELLNESS_CHOICE_ACTION_REQUIRED");
  if(entry.kind==="checkin"&&entry.payload.focusFeedback!==undefined)throw Error("CHECKIN_FEEDBACK_ACTION_REQUIRED");
  return this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 1))`);
   const [existing]=await tx.select().from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id),eq(experienceRecords.kind,entry.kind))).for("update");
   if(!existing)return null;
   const previous=decryptPrecision(existing.encryptedPayload,userId);
   // Older session editors must not erase newer manual set observations.
   let payload=preserveFocusFeedback(entry,previous);
   if(entry.kind==="activity"){
    const current=activitySchema.parse(previous);
    if(entry.payload.routineSource&&JSON.stringify(entry.payload.routineSource)!==JSON.stringify(current.routineSource))throw new ActivityRoutineConflict(409,'The original routine occurrence identity cannot be replaced.');
    if(current.routineSource&&routineLocalDate(current.routineSource.timeZone,new Date(entry.payload.startedAt))!==current.routineSource.localDate)throw new ActivityRoutineConflict(409,'This activity belongs to its original routine day. Review the occurrence before changing its day.');
    if(current.components&&entry.payload.components===undefined&&(entry.payload.minutes!==current.minutes||entry.payload.title!==current.title||(entry.payload.distanceM!==undefined&&entry.payload.distanceM!==current.distanceM)||(entry.payload.actualSets!==undefined&&JSON.stringify(entry.payload.actualSets)!==JSON.stringify(current.actualSets))))throw Error("ACTIVITY_COMPONENT_REVIEW_REQUIRED");
    payload={...entry.payload,
     ...(current.routineSource?{routineSource:current.routineSource}:{}),
     ...(entry.payload.components===undefined&&current.components?{components:current.components}:{}),
     ...(entry.payload.components?{components:{version:1 as const,items:entry.payload.components.items.map(part=>{const prior=current.components?.items.find(old=>old.id===part.id);return {...part,...(part.steps===undefined&&prior?.steps!==undefined?{steps:prior.steps}:{}),...(part.stepScope===undefined&&prior?.stepScope!==undefined?{stepScope:prior.stepScope}:{})};})}}:{}),
     ...(entry.payload.steps===undefined&&current.steps!==undefined?{steps:current.steps}:{}),
     ...(entry.payload.stepScope===undefined&&current.stepScope!==undefined?{stepScope:current.stepScope}:{}),
     ...(entry.payload.distanceM===undefined&&current.distanceM!==undefined?{distanceM:current.distanceM}:{}),
     ...(entry.payload.actualSets===undefined&&current.actualSets!==undefined?{actualSets:current.actualSets}:{}),
     ...(current.capture?{capture:{...(entry.payload.capture||current.capture),description:current.capture.description,method:current.capture.method,...(entry.payload.capture?.reviewedDescription===undefined&&current.capture.reviewedDescription!==undefined?{reviewedDescription:current.capture.reviewedDescription}:{})}}:{})};
   }
   if(entry.kind==="activity"&&(payload as Activity).components)payload=activitySchema.parse({...payload,...activityProjection((payload as Activity).components!.items)});
   if(entry.kind==="session"&&entry.payload.actualSets===undefined){
    const current=trainingSessionSchema.parse(previous);
    if(current.actualSets!==undefined)payload={...entry.payload,actualSets:current.actualSets};
   }
   if(entry.kind==="session"||entry.kind==="hydration"){
    const schema=entry.kind==="session"?trainingSessionSchema:hydrationSchema,current=schema.parse(previous),next=schema.parse(payload);
    payload=schema.parse({...next,entrySource:mergeAthleteEntrySource(current.entrySource,next.entrySource,next)});
   }
   if(entry.kind==="experiment"){
    const before=experimentSchema.parse(previous);
    if(JSON.stringify(before)===JSON.stringify(payload))return decode(existing,userId);
    const historyStorage=await tx.execute<{ready:boolean}>(sql`SELECT to_regclass('experiment_versions') IS NOT NULL AS ready`);
    // A correction must not erase its prior source when history is unprovisioned.
    // No-op saves above remain safe; reads, export and explicit deletion stay available.
    if(!historyStorage.rows[0]?.ready)throw new ExperimentHistoryUnavailable();
    await tx.insert(experimentVersions).values({recordId:id,encryptedPayload:existing.encryptedPayload,sourceCreatedAt:existing.createdAt,sourceUpdatedAt:existing.updatedAt,supersededAt:sql`clock_timestamp()`});
   }
   const [row]=await tx.update(experienceRecords).set({encryptedPayload:encryptPrecision(payload,userId),updatedAt:new Date()}).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id),eq(experienceRecords.kind,entry.kind))).returning();
   return row?decode(row,userId):null;
  });
 }
 getWellnessActionView(userId:string,day:WellnessDay){return new WellnessChoiceStorage(this.db).view(userId,day);}
 createWellnessChoice(userId:string,command:WellnessChoiceCommand){return new WellnessChoiceStorage(this.db).create(userId,command);}
 deleteWellnessChoiceHistory(userId:string,command:WellnessHistoryDelete){return new WellnessChoiceStorage(this.db).removeHistory(userId,command);}
 async deleteExperienceRecord(userId:string,id:string) {
  return this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},1))`);
   const [row]=await tx.select({kind:experienceRecords.kind}).from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id)));
   if(row?.kind==="wellness-choice")throw new WellnessChoiceConflict("dedicated-action");
   const result=await tx.delete(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id))).returning({id:experienceRecords.id});return !!result.length;
  });
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
 getCheckinRecord?(userId:string,id:string):Promise<CheckinRecordSource|null>;
 getWellnessActionView?(userId:string,day:WellnessDay):Promise<import("../shared/wellness-actions").WellnessActionView>;
 createWellnessChoice?(userId:string,command:WellnessChoiceCommand):Promise<ExperienceRecord>;
 deleteWellnessChoiceHistory?(userId:string,command:WellnessHistoryDelete):Promise<void>;
 getExperienceSettings(userId:string):Promise<ExperienceSettings>;
 putExperienceSettings(userId:string,patch:ExperienceSettingsPatch):Promise<ExperienceSettings>;
 putExperienceSettingsIfCurrent?(userId:string,patch:ExperienceSettingsPatch,revision:string):Promise<ExperienceSettings>;
 putCheckinFeedback?(userId:string,id:string,request:FocusFeedbackRequest,key:string):Promise<CheckinFeedbackView|null>;
 createSession?(userId:string,payload:TrainingSession,key:string):Promise<ExperienceRecord>;
 createActivity?(userId:string,payload:Activity,key:string):Promise<ExperienceRecord>;
 createActivityRoutine?(userId:string,plan:ActivityRoutinePlan,key:string,sourceActivityId:string|null):Promise<ExperienceRecord>;
 updateActivityRoutine?(userId:string,id:string,expectedRevision:string,plan:ActivityRoutinePlan):Promise<ExperienceRecord|null>;
 changeRoutineOccurrence?(userId:string,id:string,date:string,expectedPlanRevision:string,expectedRevision:string|null,next:RoutineOccurrenceOverride|null):Promise<ExperienceRecord|null>;
 getCheckinFeedback?(userId:string,id:string):Promise<CheckinFeedbackView|null>;
 exportExperience?(userId:string):Promise<{settings:ExperienceSettings;records:ExperienceRecord[];history:ExperimentHistory|null}>;
 getExperimentHistory?(userId:string,recordId?:string):Promise<ExperimentHistory|null>;
 getExperienceRecords(userId:string,kind?:ExperienceEntry["kind"]):Promise<ExperienceRecord[]>;
 insertExperienceRecord(userId:string,entry:ExperienceEntry):Promise<ExperienceRecord>;
 updateExperienceRecord(userId:string,id:string,entry:ExperienceEntry):Promise<ExperienceRecord|null>;
 deleteExperienceRecord(userId:string,id:string):Promise<boolean>;
 clearExperienceData(userId:string):Promise<void>;
}
