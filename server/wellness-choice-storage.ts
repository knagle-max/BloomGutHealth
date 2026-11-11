import {optionalWellnessSourceReadable} from './wellness-source-readiness';
import {checkinSourceObservations,type OwnedCheckinRow} from './wellness-checkin-observations';
import {randomUUID} from "node:crypto";
import {and,eq,desc,inArray,sql,gte,lt} from "drizzle-orm";
import {users,precisionProfiles,experienceSettings,experienceRecords,meals,precisionRecords} from "../shared/schema";
import {experienceSettingsSchema,experienceEntrySchema,wellnessChoiceSchema,type ExperienceRecord} from "../shared/experience";
import {wellnessDaySchema,wellnessChoiceCommandSchema,wellnessHistoryDeleteSchema,type WellnessDay,type WellnessChoiceCommand,type WellnessHistoryDelete} from "../shared/wellness-actions";
import {encryptPrecision,decryptPrecision} from "./precision-crypto";
import {buildWellnessContext} from "./wellness-context";
import {buildWellnessActionView,WellnessChoiceConflict,wellnessChoiceId,wellnessChoiceRevision} from "./wellness-actions";
import type {db as appDatabase} from "./db";
type Database=Pick<typeof appDatabase,"select"|"insert"|"update"|"delete"|"transaction">;
const decode=(row:typeof experienceRecords.$inferSelect,userId:string):ExperienceRecord&{kind:"wellness-choice"}=>({kind:"wellness-choice",id:row.id,payload:wellnessChoiceSchema.parse(decryptPrecision(row.encryptedPayload,userId)),createdAt:row.createdAt.toISOString(),updatedAt:row.updatedAt.toISOString()});
const commandFrom=(row:ReturnType<typeof decode>)=>wellnessChoiceCommandSchema.parse({intentId:row.payload.intentId,actionId:row.payload.actionId,choice:row.payload.choice,lifecycleId:row.payload.lifecycleId,requestRevision:row.payload.requestRevision,date:row.payload.date,timezoneOffset:row.payload.timezoneOffset});
/** Commands use the existing encrypted experience records. No new source store. */
export class WellnessChoiceStorage {
 constructor(private readonly db:Database,private readonly now:()=>Date=()=>new Date()){}
 private async sources(tx:Database,userId:string,day:WellnessDay,user?:{id:string;age:unknown;dietaryPreferences:unknown}){
  const actor=user??(await tx.select({id:users.id,age:users.age,dietaryPreferences:users.dietaryPreferences}).from(users).where(eq(users.id,userId)))[0];
  if(!actor)throw new WellnessChoiceConflict("scope");
  const [profile]=await tx.select().from(precisionProfiles).where(eq(precisionProfiles.userId,userId));
  const [settings]=await tx.select().from(experienceSettings).where(eq(experienceSettings.userId,userId));
  // Separate bounds: many old activities cannot hide an unrelated saved choice.
  // One sentinel row distinguishes a complete source from a truncated view.
  const movement=await tx.select().from(experienceRecords).where(and(eq(experienceRecords.userId,userId),inArray(experienceRecords.kind,["session","activity"]))).orderBy(desc(experienceRecords.createdAt),desc(experienceRecords.id)).limit(6001);
  const choiceRows=await tx.select().from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.kind,"wellness-choice"))).orderBy(desc(experienceRecords.createdAt),desc(experienceRecords.id)).limit(2001);
  const movementHistoryComplete=movement.length<=6000,choiceHistoryComplete=choiceRows.length<=2000;
  const decoded=[...movement.slice(0,6000),...choiceRows.slice(0,2000)].map(row=>({...experienceEntrySchema.parse({kind:row.kind,payload:decryptPrecision(row.encryptedPayload,userId)}),id:row.id,createdAt:row.createdAt.toISOString(),updatedAt:row.updatedAt.toISOString()}));
  // Optional journal source: missing table/columns/permissions must not disable
  // goals-only actions. Preflight avoids aborting the consistent transaction.
  const sourceDb=tx as Database&Pick<typeof appDatabase,"execute">;
  const weeklyRows=await tx.select().from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.kind,"checkin"))).orderBy(desc(experienceRecords.createdAt),desc(experienceRecords.id)).limit(2001);
  let body:OwnedCheckinRow[]|null=null,bodyLimited=false;
  if(await optionalWellnessSourceReadable(sourceDb,'precision_records')){
   const rows=await tx.select().from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,"checkin"))).orderBy(desc(precisionRecords.createdAt),desc(precisionRecords.id)).limit(2001);bodyLimited=rows.length>2000;
   try{body=bodyLimited?[]:rows.map(row=>({id:row.id,userId:row.userId,payload:decryptPrecision(row.encryptedPayload,userId),createdAt:row.createdAt.toISOString()}));}catch{body=null;}
  }
  const weeklyLimited=weeklyRows.length>2000;let weekly:OwnedCheckinRow[]|null=null;
  try{weekly=weeklyLimited?[]:weeklyRows.map(row=>({id:row.id,userId:row.userId,payload:decryptPrecision(row.encryptedPayload,userId),createdAt:row.createdAt.toISOString(),updatedAt:row.updatedAt.toISOString()}));}catch{weekly=null;}
  const checkinSources=checkinSourceObservations(userId,day,weekly,body,weeklyLimited,bodyLimited,this.now());
  let food:{records:typeof meals.$inferSelect[];limited:boolean}|null=null;
  if(await optionalWellnessSourceReadable(sourceDb,'meals')){
   const start=new Date(Date.parse(day.date+'T00:00:00Z')+day.timezoneOffset*60000),end=new Date(+start+86400000);
   const journal=await tx.select().from(meals).where(and(eq(meals.userId,userId),gte(meals.loggedAt,start),lt(meals.loggedAt,end))).orderBy(desc(meals.loggedAt),desc(meals.id)).limit(201);
   food={records:journal.slice(0,200),limited:journal.length>200};
  }
  const context=buildWellnessContext(userId,profile?decryptPrecision(profile.encryptedContext,userId):undefined,actor,this.now());
  return buildWellnessActionView({context,settings:experienceSettingsSchema.parse(settings?decryptPrecision(settings.encryptedPayload,userId):{}),day,sessions:decoded.filter(r=>r.kind==="session"),activities:decoded.filter(r=>r.kind==="activity"),choices:decoded.filter(r=>r.kind==="wellness-choice"),choiceHistoryComplete,movementHistoryComplete,food,checkinSources,now:this.now()});
 }
 async view(userId:string,day:WellnessDay){
  day=wellnessDaySchema.parse(day);
  return this.db.transaction(async tx=>{
   await tx.execute(sql`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY`);
   return this.sources(tx as unknown as Database,userId,day);
  });
 }
 async create(userId:string,input:WellnessChoiceCommand){
  const command=wellnessChoiceCommandSchema.parse(input),id=wellnessChoiceId(userId,command.intentId);
  return this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},0))`);
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},1))`);
   const [user]=await tx.select({id:users.id,age:users.age,dietaryPreferences:users.dietaryPreferences}).from(users).where(eq(users.id,userId)).for("update");
   if(!user)throw new WellnessChoiceConflict("scope");
   const [previous]=await tx.select().from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id),eq(experienceRecords.kind,"wellness-choice")));
   if(previous){
    const record=decode(previous,userId);
    if(JSON.stringify(commandFrom(record))!==JSON.stringify(command))throw new WellnessChoiceConflict("intent-conflict");
    return record; // A completed receipt never becomes a new current event.
   }
   const view=await this.sources(tx as unknown as Database,userId,{date:command.date,timezoneOffset:command.timezoneOffset},user);
   if(!view.dateCurrent)throw new WellnessChoiceConflict("date-changed");
   if(!view.lifecycleId||view.lifecycleId!==command.lifecycleId)throw new WellnessChoiceConflict("source-changed");
   const decision=view.actions.find(a=>a.action.id===command.actionId);
   if(!decision?.eligible)throw new WellnessChoiceConflict("not-eligible");
   if(decision.requestRevision!==command.requestRevision)throw new WellnessChoiceConflict("source-changed");
   const [count]=await tx.select({count:sql<number>`count(*)::int`}).from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.kind,"wellness-choice")));
   if(count.count>=2000)throw new WellnessChoiceConflict("limit");
   const payload=wellnessChoiceSchema.parse({version:1,valueKind:"user-choice",...command,actionVersion:decision.action.version,contextRevision:view.contextRevision,evidenceVersion:view.evidenceVersion,decisionRevision:decision.decisionRevision,chosenAt:this.now().toISOString()});
   const [row]=await tx.insert(experienceRecords).values({id,userId,kind:"wellness-choice",encryptedPayload:encryptPrecision(payload,userId),createdAt:sql`clock_timestamp()`,updatedAt:sql`clock_timestamp()`}).returning();
   return decode(row,userId);
  });
 }
 async removeHistory(userId:string,input:WellnessHistoryDelete){
  const command=wellnessHistoryDeleteSchema.parse(input);
  if(new Set(command.records.map(r=>r.id)).size!==command.records.length)throw new WellnessChoiceConflict("scope");
  for(const target of command.records)if(wellnessChoiceId(userId,target.intentId)!==target.id)throw new WellnessChoiceConflict("scope");
  return this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},1))`);
   const rows=await tx.select().from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.kind,"wellness-choice"),inArray(experienceRecords.id,command.records.map(r=>r.id))));
   for(const row of rows){const target=command.records.find(r=>r.id===row.id)!;if(wellnessChoiceRevision(userId,decode(row,userId).payload)!==target.revision)throw new WellnessChoiceConflict("source-changed");}
   if(!rows.length)return; // Exact absent retry cannot affect future arrivals.
   const [settingsRow]=await tx.select().from(experienceSettings).where(eq(experienceSettings.userId,userId));
   if(settingsRow){const settings=experienceSettingsSchema.parse(decryptPrecision(settingsRow.encryptedPayload,userId));await tx.update(experienceSettings).set({encryptedPayload:encryptPrecision({...settings,lifecycleId:randomUUID()},userId),updatedAt:new Date()}).where(eq(experienceSettings.userId,userId));}
   await tx.delete(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.kind,"wellness-choice"),inArray(experienceRecords.id,rows.map(r=>r.id))));
  });
 }
}
