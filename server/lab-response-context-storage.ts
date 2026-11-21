import {createHash,randomUUID} from 'node:crypto';
import {and,eq,inArray,ne,sql} from 'drizzle-orm';
import {experienceRecords,precisionRecords} from '../shared/schema';
import {activeLabRows,labSchema,sourceOnlyLabSchema,type Lab,type SourceOnlyLab} from '../shared/precision-nutrition';
import {labReviewRevisionText} from '../shared/lab-source-review';
import {labDateText} from '../shared/lab-history';
import {hasConfirmedLabIdentity} from '../shared/lab-assay-identity';
import {labReviewFamilies} from '../shared/lab-panel-review';
import {labResponseQuestionForMarkers,labResponseQuestions,labResponseContextSchema,recalledLabResponseContextSchema,labResponseContextLifecycleSchema,labResponseContextSelectionSchema,labResponseContextPrepareSchema,labResponseContextSaveSchema,labResponseContextDeleteSchema,type LabResponseContext,type LabResponseContextRecord,type LabResponseContextView,type LabResponseContextHistory,type LabResponseContextSelection,type LabResponseContextPrepare,type LabResponseContextSave,type LabResponseContextDelete} from '../shared/lab-response-context';
import {encryptPrecision,decryptPrecision} from './precision-crypto';
import type {db as appDatabase} from './db';
type Database=Pick<typeof appDatabase,'select'|'insert'|'update'|'delete'|'transaction'>;
type Stored=typeof experienceRecords.$inferSelect;
type Fact=(Lab|SourceOnlyLab)&{id:string};
type ContextRows={stored:Stored[];decoded:Array<{row:Stored;payload:LabResponseContext;scope:string}>};
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const scopeOf=(userId:string,selection:LabResponseContextSelection)=>hash(['lab-context-scope-v1',userId,selection.family,[...selection.sourceIds].sort()]);
const epochId=(scope:string)=>hash(['lab-context-epoch-v1',scope]);
const answerId=(userId:string,intentId:string)=>hash(['lab-context-answer-v1',userId,intentId]);
const refs=(references:LabResponseContextPrepare['sourceReferences'])=>[...references].sort((a,b)=>a.id.localeCompare(b.id));
const scopeSelection=(command:LabResponseContextPrepare)=>({family:command.family,sourceIds:command.sourceReferences.map(source=>source.id)});
export class LabResponseContextError extends Error{
 constructor(readonly status:400|404|409|422|503,message:string){super(message);}
}
const unavailable=()=>new LabResponseContextError(503,'Lab context is unavailable. Your source results and ordinary logging are unchanged.');
const changed=()=>new LabResponseContextError(409,'The source or saved context changed. Review the current records before saving.');
/** Reuses the encrypted app records and canonical laboratory source contracts.
 * Reader compatibility precedes these source-versioned producers. */
export class LabResponseContextStorage{
 constructor(private readonly db:Database,private readonly now:()=>Date=()=>new Date()){}
 private async lock(tx:any,userId:string){
  // Fixed source-before-experience order fences lab edits and ordinary erasure.
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},0))`);
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},1))`);
 }
 private async facts(tx:Database,userId:string){
  const rows=await tx.select().from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,'lab'))).limit(10001);
  if(rows.length>10000)throw unavailable();
  const facts:Fact[]=rows.map(row=>{const value=decryptPrecision(row.encryptedPayload,userId),known=labSchema.safeParse(value),raw=sourceOnlyLabSchema.safeParse(value);if(!known.success&&!raw.success)throw unavailable();return{...(known.success?known.data:raw.data!),id:row.id};});
  return activeLabRows(facts);
 }
 private versions(facts:Fact[]){return new Map(facts.flatMap(fact=>!('sourceOnly'in fact)&&fact.unitReview?.status!=='pending'&&hasConfirmedLabIdentity(fact.marker,fact)?[[fact.id,createHash('sha256').update(labReviewRevisionText(fact)).digest('hex')] as const]:[]));}
 private current(payload:Extract<LabResponseContext,{valueKind:'recalled-context'}>,facts:Fact[],versions=this.versions(facts)){
  return payload.sourceReferences.every(source=>versions.get(source.id)===source.revision);
 }
 private sources(command:LabResponseContextPrepare,facts:Fact[],now:Date){
  if(new Set(command.sourceReferences.map(source=>source.id)).size!==command.sourceReferences.length)throw new LabResponseContextError(400,'Keep each source once.');
  const family=labReviewFamilies.find(family=>family.id===command.family)!;
  const selected=command.sourceReferences.map(reference=>{
   const fact=facts.find(row=>row.id===reference.id);if(!fact)throw new LabResponseContextError(404,'Source records are not available in your account.');
   if('sourceOnly'in fact||fact.unitReview?.status==='pending'||!hasConfirmedLabIdentity(fact.marker,fact)||!(family.markers as readonly string[]).includes(fact.marker))throw changed();
   if(createHash('sha256').update(labReviewRevisionText(fact)).digest('hex')!==reference.revision)throw changed();return fact;
  });
  const dates=selected.map(row=>labDateText(row.measuredAt,row.sourceReport,row.dateCorrection)).sort(),reported=selected.filter(row=>!!(row.dateCorrection?.enteredDate||row.sourceReport?.enteredDate)).length;
  if(dates.at(-1)! >new Date(now.getTime()+14*60*60*1000).toISOString().slice(0,10))throw new LabResponseContextError(400,'Review the source date before adding retrospective context.');
  return{from:dates.length>1&&dates[0]!==dates.at(-1)?dates[0]:null,to:dates.at(-1)!,basis:reported===selected.length?'source-date' as const:reported===0?'stored-timestamp' as const:'mixed-or-unknown' as const};
 }
 /** Derive only from the exact current owned selection, never profile values or
  * a retained answer's label. A missing/withdrawn source keeps history readable. */
 private sourceQuestion(family:LabResponseContextSelection['family'],sourceIds:readonly string[],facts:Fact[]){
  const supported=labReviewFamilies.find(row=>row.id===family)!;
  const selected=sourceIds.map(id=>facts.find(row=>row.id===id));
  if(selected.some(fact=>!fact||'sourceOnly'in fact||fact.unitReview?.status==='pending'||!hasConfirmedLabIdentity(fact.marker,fact)||!(supported.markers as readonly string[]).includes(fact.marker)))return null;
  return labResponseQuestionForMarkers(family,selected.map(fact=>(fact as Lab).marker));
 }
 private async rows(tx:Database,userId:string):Promise<ContextRows>{
  const stored=await tx.select().from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.kind,'lab-response-context'))).limit(2001);
  if(stored.length>2000)throw unavailable();
  const decoded=stored.map(row=>{const parsed=labResponseContextSchema.safeParse(decryptPrecision(row.encryptedPayload,userId));if(!parsed.success)throw unavailable();const payload=parsed.data;return{row,payload,scope:payload.valueKind==='context-lifecycle'?payload.scopeHash:scopeOf(userId,scopeSelection(payload))};});return{stored,decoded};
 }
 private async inventory(tx:Database,userId:string,selection:LabResponseContextSelection,existing?:ContextRows){
  const scope=scopeOf(userId,selection),{stored,decoded}=existing||await this.rows(tx,userId);
  const epochs=decoded.filter((item):item is {row:Stored;payload:Extract<LabResponseContext,{valueKind:'context-lifecycle'}>;scope:string}=>item.payload.valueKind==='context-lifecycle'&&item.scope===scope);
  if(epochs.length>1||epochs.some(item=>item.row.id!==epochId(scope)))throw unavailable();
  const answers=decoded.flatMap(item=>item.payload.valueKind==='recalled-context'&&item.scope===scope?[{id:item.row.id,payload:item.payload,createdAt:item.row.createdAt.toISOString(),updatedAt:item.row.updatedAt.toISOString()}]:[]);
  const referenced=new Set(answers.flatMap(row=>row.payload.supersedes?[row.payload.supersedes]:[])),heads=answers.filter(row=>!referenced.has(row.id));
  if(answers.length&&heads.length!==1)throw unavailable();
  const visited=new Set<string>();let cursor:LabResponseContextRecord|undefined=heads[0];while(cursor){if(visited.has(cursor.id))throw unavailable();visited.add(cursor.id);const previous:string|null=cursor.payload.supersedes;if(!previous)break;const found:LabResponseContextRecord|undefined=answers.find(row=>row.id===previous);if(!found)throw unavailable();cursor=found;}
  if(visited.size!==answers.length)throw unavailable();
  const epoch=epochs[0]?.payload||null;
  const historyRevision=hash(['lab-context-history-v1',userId,scope,epoch,answers.map(row=>({id:row.id,payload:row.payload})).sort((a,b)=>a.id.localeCompare(b.id))]);
  return{family:selection.family,sourceIds:selection.sourceIds,scope,epoch,answers,head:heads[0]||null,historyRevision,stored};
 }
 private async quota(tx:Database,userId:string){const[count]=await tx.select({count:sql<number>`count(*)::int`}).from(experienceRecords).where(and(eq(experienceRecords.userId,userId),ne(experienceRecords.kind,'wellness-choice')));if(count.count>=2000)throw new LabResponseContextError(422,'Your workspace has reached its record limit. Export and remove old entries before adding context.');}
 private viewOf(inventory:Awaited<ReturnType<LabResponseContextStorage['inventory']>>,facts:Fact[],now:Date,versions=this.versions(facts)):LabResponseContextView{return{questionId:this.sourceQuestion(inventory.family,inventory.sourceIds,facts)??inventory.head?.payload.question??labResponseQuestions[inventory.family].id,scopeHash:inventory.scope,generationId:inventory.epoch?.generationId||null,historyRevision:inventory.historyRevision,historyCount:inventory.answers.length,latest:inventory.head?{record:inventory.head,sourceCurrent:this.current(inventory.head.payload,facts,versions)}:null,asOf:now.toISOString()};}
 async history(userId:string):Promise<LabResponseContextHistory>{return this.db.transaction(async tx=>{
  await tx.execute(sql`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY`);const dataset=await this.rows(tx,userId),facts=await this.facts(tx,userId),versions=this.versions(facts),now=this.now(),selections=new Map<string,LabResponseContextSelection>();
  for(const item of dataset.decoded)if(item.payload.valueKind==='recalled-context')selections.set(item.scope,scopeSelection(item.payload));
  const result:LabResponseContextHistory=[];for(const selection of Array.from(selections.values()))result.push({selection,view:this.viewOf(await this.inventory(tx,userId,selection,dataset),facts,now,versions)});
  return result.sort((a,b)=>(b.view.latest?.record.payload.recordedAt||'').localeCompare(a.view.latest?.record.payload.recordedAt||'')||a.view.scopeHash.localeCompare(b.view.scopeHash));
 });}
 async view(userId:string,input:LabResponseContextSelection){const selection=labResponseContextSelectionSchema.parse(input);return this.db.transaction(async tx=>{await tx.execute(sql`SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY`);return this.viewOf(await this.inventory(tx,userId,selection),await this.facts(tx,userId),this.now());});}
 async prepare(userId:string,input:LabResponseContextPrepare){const command=labResponseContextPrepareSchema.parse(input);return this.db.transaction(async tx=>{
  await this.lock(tx,userId);const now=this.now(),facts=await this.facts(tx,userId);this.sources(command,facts,now);let inventory=await this.inventory(tx,userId,scopeSelection(command));
  if(!inventory.epoch){await this.quota(tx,userId);const epoch=labResponseContextLifecycleSchema.parse({version:1,valueKind:'context-lifecycle',scopeHash:inventory.scope,generationId:randomUUID(),updatedAt:now.toISOString()});await tx.insert(experienceRecords).values({id:epochId(inventory.scope),userId,kind:'lab-response-context',encryptedPayload:encryptPrecision(epoch,userId)});inventory=await this.inventory(tx,userId,scopeSelection(command));}
  return this.viewOf(inventory,facts,now);
 });}
 async save(userId:string,input:LabResponseContextSave):Promise<{record:LabResponseContextRecord;sourceCurrent:boolean;replayed:boolean;isLatest:boolean}>{const command=labResponseContextSaveSchema.parse(input);return this.db.transaction(async tx=>{
  await this.lock(tx,userId);const now=this.now(),selection=scopeSelection(command),inventory=await this.inventory(tx,userId,selection),facts=await this.facts(tx,userId),id=answerId(userId,command.intentId);
  if(!inventory.epoch||inventory.epoch.generationId!==command.generationId)throw changed();
  const existing=inventory.stored.find(row=>row.id===id);
  if(existing){const parsed=recalledLabResponseContextSchema.safeParse(decryptPrecision(existing.encryptedPayload,userId));if(!parsed.success)throw changed();const payload=parsed.data;
   const requested=[command.family,refs(command.sourceReferences),command.answer,command.eventWindow,command.datePrecision,command.notes,command.expectedCurrentId,command.expectedQuestion??labResponseQuestions[command.family].id];
   const recorded=[payload.family,refs(payload.sourceReferences),payload.answer,payload.eventWindow,payload.datePrecision,payload.notes,payload.supersedes,payload.question];
   if(hash(requested)!==hash(recorded))throw changed();return{record:{id,payload,createdAt:existing.createdAt.toISOString(),updatedAt:existing.updatedAt.toISOString()},sourceCurrent:this.current(payload,facts),replayed:true,isLatest:inventory.head?.id===id};
  }
  if(!inventory.epoch||inventory.epoch.generationId!==command.generationId||(inventory.head?.id||null)!==command.expectedCurrentId)throw changed();
  const reviewWindow=this.sources(command,facts,now),question=this.sourceQuestion(command.family,selection.sourceIds,facts);
  if(!question||(command.expectedQuestion??labResponseQuestions[command.family].id)!==question)throw changed();
  const parsed=recalledLabResponseContextSchema.safeParse({version:1,valueKind:'recalled-context',intentId:command.intentId,family:command.family,question,answer:command.answer,reviewWindow,eventWindow:command.eventWindow,datePrecision:command.datePrecision,recordedAt:now.toISOString(),sourceReferences:refs(command.sourceReferences),supersedes:inventory.head?.id||null,notes:command.notes});
  if(!parsed.success)throw new LabResponseContextError(400,'Review the answer and remembered date precision. A pre-test event cannot be placed after the source date.');await this.quota(tx,userId);
  const payload=parsed.data,[row]=await tx.insert(experienceRecords).values({id,userId,kind:'lab-response-context',encryptedPayload:encryptPrecision(payload,userId)}).returning();
  return{record:{id:row.id,payload,createdAt:row.createdAt.toISOString(),updatedAt:row.updatedAt.toISOString()},sourceCurrent:true,replayed:false,isLatest:true};
 });}
 async deleteHistory(userId:string,input:LabResponseContextDelete){const command=labResponseContextDeleteSchema.parse(input);return this.db.transaction(async tx=>{
  await this.lock(tx,userId);const inventory=await this.inventory(tx,userId,command),requestRevision=hash(['lab-context-delete-v1',userId,{...command,sourceIds:[...command.sourceIds].sort()}]);
  if(inventory.epoch?.lastDelete?.intentId===command.intentId){if(inventory.epoch.lastDelete.requestRevision!==requestRevision)throw changed();return;}
  if(!inventory.epoch||inventory.epoch.generationId!==command.generationId||inventory.historyRevision!==command.expectedHistoryRevision)throw changed();
  if(inventory.answers.length)await tx.delete(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.kind,'lab-response-context'),inArray(experienceRecords.id,inventory.answers.map(row=>row.id))));
  const epoch=labResponseContextLifecycleSchema.parse({version:1,valueKind:'context-lifecycle',scopeHash:inventory.scope,generationId:randomUUID(),updatedAt:this.now().toISOString(),lastDelete:{intentId:command.intentId,requestRevision}});
  await tx.update(experienceRecords).set({encryptedPayload:encryptPrecision(epoch,userId),updatedAt:this.now()}).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,epochId(inventory.scope)),eq(experienceRecords.kind,'lab-response-context')));
 });}
}
