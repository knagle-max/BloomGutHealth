import {createHash} from 'node:crypto';
import {and,eq,notInArray,desc,sql} from 'drizzle-orm';
import {experienceRecords,experienceSettings,nutritionProducts,users} from '../shared/schema';
import {experienceLifecycleSchema} from '../shared/experience';
import {productResponseSchema,type Product} from '../shared/products';
import {supplementIntakeSchema,supplementIntakeValueSchema,type SupplementIntake} from '../shared/supplement-intake';
import {supplementCreateCommandSchema,supplementEditCommandSchema,supplementRemoveCommandSchema,supplementDraftSchema,type SupplementCreateCommand,type SupplementDraft} from '../shared/supplement-commands';
import {decryptPrecision,encryptPrecision} from './precision-crypto';
import {stableReviewSourceValue} from './meal-review-source';
import {ExperienceStorage} from './experience-storage';
import type {db} from './db';

type Database=Pick<typeof db,'select'|'insert'|'update'|'delete'|'transaction'>;
export class SupplementIntakeError extends Error {
 constructor(readonly status:number,readonly code:string,message:string){super(message);}
}
const conflict=()=>new SupplementIntakeError(409,'SOURCE_CHANGED','This intake or its source changed. Review it again before saving.');
const identity=(userId:string,intentId:string)=>createHash('sha256').update(JSON.stringify(['supplement-intake-v1',userId,intentId])).digest('hex');
const same=(a:unknown,b:unknown)=>JSON.stringify(stableReviewSourceValue(a))===JSON.stringify(stableReviewSourceValue(b));
function owned(userId:string){if(typeof userId!=='string'||!userId)throw new SupplementIntakeError(401,'ACCOUNT_REQUIRED','Sign in before recording an intake.');}
export function supplementReviewRevision(userId:string,lifecycleId:string,draft:SupplementDraft,label:Product|null,target?:{id:string;revision:string}){
 return createHash('sha256').update(JSON.stringify(stableReviewSourceValue({version:'supplement-source-v1',userId,lifecycleId,draft,label,target}))).digest('hex');
}
function view(row:typeof experienceRecords.$inferSelect,payload:SupplementIntake){return{id:row.id,userId:row.userId,kind:'supplement-intake' as const,payload,createdAt:row.createdAt.toISOString(),updatedAt:row.updatedAt.toISOString()};}
function originalDraft(value:SupplementIntake['original']):SupplementDraft {
 return supplementDraftSchema.parse({takenAt:value.takenAt,servings:value.servings,mineralBasis:value.mineralBasis,formulation:value.formulation,
  source:value.label?{kind:'label',product:{source:value.label.source,id:value.label.id}}:{kind:'unlabelled',description:value.unlabelled}});
}
function replay(row:typeof experienceRecords.$inferSelect,userId:string,command:SupplementCreateCommand){
 if(row.userId!==userId)throw new SupplementIntakeError(404,'NOT_FOUND','This intake is not in your account.');
 if(row.kind==='supplement-intent')throw new SupplementIntakeError(409,'SUPPLEMENT_INTAKE_DELETED','This intake was removed. Start a new entry to record it again.');
 if(row.kind!=='supplement-intake')throw conflict();
 const payload=supplementIntakeSchema.parse(decryptPrecision(row.encryptedPayload,userId)),draft=originalDraft(payload.original);
 if(payload.intentId!==command.intentId||payload.lifecycleId!==command.lifecycleId||!same(draft,command.draft)||
  supplementReviewRevision(userId,payload.lifecycleId,draft,payload.original.label)!==command.reviewRevision)throw conflict();
 return view(row,payload);
}

/** Dedicated commands on the existing encrypted Experience store. Generic
 * workspace writes stay denied; callers supply reviewed source material. */
export class SupplementIntakeStorage {
 constructor(private readonly database:Database,private readonly now:()=>Date=()=>new Date()){}
 /** Server-only cutoff captured before any asynchronous source or transaction work. */
 confirmationTimestamp(){return new Date(+this.now());}
 assertTakenAt(draft:SupplementDraft,confirmedAt:Date){
  if(!Number.isFinite(+confirmedAt)||Date.parse(draft.takenAt)>+confirmedAt)throw new SupplementIntakeError(400,'FUTURE_INTAKE','Confirm an intake only after it was taken.');
 }
 async reviewScope(userId:string){
  owned(userId);
  const [actor]=await this.database.select({id:users.id}).from(users).where(eq(users.id,userId));
  if(!actor)throw new SupplementIntakeError(401,'ACCOUNT_REQUIRED','Sign in before recording an intake.');
  // Reuse canonical settings creation/locking. This creates only an opaque
  // account epoch, never a supplement or an ingestion assertion.
  return new ExperienceStorage(this.database).ensureExperienceLifecycle(userId);
 }
 async recoverCreate(userId:string,input:unknown){
  owned(userId);const command=supplementCreateCommandSchema.parse(input);
  const[row]=await this.database.select().from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,identity(userId,command.intentId))));
  return row?replay(row,userId,command):null;
 }
 /** Check before any provider invocation; commit rechecks under the account lock. */
 async validateScope(userId:string,lifecycleId:string){
  owned(userId);
  const[actor]=await this.database.select({id:users.id}).from(users).where(eq(users.id,userId));
  if(!actor)throw new SupplementIntakeError(401,'ACCOUNT_REQUIRED','Sign in before recording an intake.');
  const[row]=await this.database.select().from(experienceSettings).where(eq(experienceSettings.userId,userId));
  const settings=experienceLifecycleSchema.parse(row?decryptPrecision(row.encryptedPayload,userId):{});
  if(!settings.lifecycleId||settings.lifecycleId!==lifecycleId)throw conflict();
 }
 async create(userId:string,input:unknown,resolvedLabel:Product|null,confirmedAt=this.confirmationTimestamp()){
  owned(userId);const command=supplementCreateCommandSchema.parse(input);
  return this.database.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},1))`);
   const id=identity(userId,command.intentId),where=and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id));
   const[previous]=await tx.select().from(experienceRecords).where(where).for('update');
   if(previous)return replay(previous,userId,command);
   const[actor]=await tx.select({id:users.id}).from(users).where(eq(users.id,userId)).for('key share');
   if(!actor)throw new SupplementIntakeError(401,'ACCOUNT_REQUIRED','Sign in before recording an intake.');
   const[settingsRow]=await tx.select().from(experienceSettings).where(eq(experienceSettings.userId,userId));
   const settings=experienceLifecycleSchema.parse(settingsRow?decryptPrecision(settingsRow.encryptedPayload,userId):{});
   // Erasure destroys this epoch. An old request cannot re-bootstrap it.
   if(!settings.lifecycleId||settings.lifecycleId!==command.lifecycleId)throw conflict();
   const label=resolvedLabel===null?null:productResponseSchema.parse(resolvedLabel);
   if(command.draft.source.kind==='label'){
    if(!label||label.id!==command.draft.source.product.id||label.source!==command.draft.source.product.source)throw conflict();
    if(label.source==='manual'){
     const[available]=await tx.select({id:nutritionProducts.id}).from(nutritionProducts).where(and(eq(nutritionProducts.userId,userId),eq(nutritionProducts.id,label.id))).for('key share');
     if(!available)throw conflict();
    }
   }else if(label!==null)throw conflict();
   if(supplementReviewRevision(userId,command.lifecycleId,command.draft,label)!==command.reviewRevision)throw conflict();
   const now=this.now();
   this.assertTakenAt(command.draft,confirmedAt);
   if(!Number.isFinite(+now)||+confirmedAt>+now)throw new SupplementIntakeError(400,'FUTURE_INTAKE','Confirm an intake only after it was taken.');
   const[count]=await tx.select({count:sql<number>`count(*)::int`}).from(experienceRecords).where(and(eq(experienceRecords.userId,userId),notInArray(experienceRecords.kind,['wellness-choice','supplement-intent'])));
   if(count.count>=2000)throw new SupplementIntakeError(422,'EXPERIENCE_LIMIT','Your workspace has reached its record limit. Export and remove old entries before adding more.');
   const draft=command.draft;
   const value=supplementIntakeValueSchema.parse({takenAt:draft.takenAt,confirmedAt:confirmedAt.toISOString(),confirmedTaken:true,
    servings:draft.servings,mineralBasis:draft.mineralBasis,formulation:draft.formulation,label,
    ...(draft.source.kind==='unlabelled'?{unlabelled:draft.source.description}:{})});
   const payload=supplementIntakeSchema.parse({version:1,valueKind:'confirmed-supplement-consumption',intentId:command.intentId,
    revision:command.intentId,lifecycleId:command.lifecycleId,original:value,current:value,corrections:[]});
   const[row]=await tx.insert(experienceRecords).values({id,userId,kind:'supplement-intake',encryptedPayload:encryptPrecision(payload,userId),createdAt:now,updatedAt:now}).returning();
   return view(row,payload);
  });
 }
 async get(userId:string,id:string){
  owned(userId);
  const[row]=await this.database.select().from(experienceRecords).where(and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id),eq(experienceRecords.kind,'supplement-intake')));
  return row?view(row,supplementIntakeSchema.parse(decryptPrecision(row.encryptedPayload,userId))):null;
 }
 async list(userId:string,offset=0,limit=25){
  owned(userId);
  if(!Number.isInteger(offset)||offset<0||offset>10000||!Number.isInteger(limit)||limit<1||limit>25)throw new SupplementIntakeError(400,'INVALID_PAGE','Choose a valid intake page.');
  const where=and(eq(experienceRecords.userId,userId),eq(experienceRecords.kind,'supplement-intake'));
  const rows=await this.database.select().from(experienceRecords).where(where).orderBy(desc(experienceRecords.updatedAt),desc(experienceRecords.id)).offset(offset).limit(limit+1);
  const[count]=await this.database.select({count:sql<number>`count(*)::int`}).from(experienceRecords).where(where);
  return{userId,records:rows.slice(0,limit).map(row=>view(row,supplementIntakeSchema.parse(decryptPrecision(row.encryptedPayload,userId)))),
   total:count.count,offset,limit,hasMore:rows.length>limit,order:'updated-descending' as const};
 }
 async correct(userId:string,id:string,input:unknown,resolvedLabel?:Product|null,confirmedAt=this.confirmationTimestamp()){
  owned(userId);const command=supplementEditCommandSchema.parse(input);
  return this.database.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},1))`);
   const where=and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id));
   const[row]=await tx.select().from(experienceRecords).where(where).for('update');
   if(!row)throw new SupplementIntakeError(404,'NOT_FOUND','This intake is not in your account.');
   if(row.kind==='supplement-intent')throw new SupplementIntakeError(409,'SUPPLEMENT_INTAKE_DELETED','This intake was removed. Start a new entry to record it again.');
   if(row.kind!=='supplement-intake')throw conflict();
   const current=supplementIntakeSchema.parse(decryptPrecision(row.encryptedPayload,userId));
   if(current.revision===command.editId){
    const previous=current.corrections.at(-2)?.revision??current.intentId;
    if(command.expectedRevision!==previous||!same(originalDraft(current.current),command.draft)||
     supplementReviewRevision(userId,command.lifecycleId,command.draft,current.current.label,{id,revision:previous})!==command.reviewRevision)throw conflict();
    return view(row,current);
   }
   if(current.revision!==command.expectedRevision||command.editId===current.intentId||current.corrections.some(change=>change.revision===command.editId))throw conflict();
   if(current.corrections.length>=32)throw new SupplementIntakeError(422,'HISTORY_LIMIT','This entry has reached its supported correction-history limit. Your original and prior corrections have been retained.');
   const[actor]=await tx.select({id:users.id}).from(users).where(eq(users.id,userId)).for('key share');
   if(!actor)throw new SupplementIntakeError(401,'ACCOUNT_REQUIRED','Sign in before correcting an intake.');
   const[settingsRow]=await tx.select().from(experienceSettings).where(eq(experienceSettings.userId,userId));
   const settings=experienceLifecycleSchema.parse(settingsRow?decryptPrecision(settingsRow.encryptedPayload,userId):{});
   if(!settings.lifecycleId||settings.lifecycleId!==command.lifecycleId)throw conflict();
   const draft=command.draft;
   // Explicitly retaining this event's captured source permits a quantity/date
   // correction after catalogue removal. It never guesses a replacement label.
   let label:Product|null;
   if(resolvedLabel===undefined){
    label=current.current.label;
    if(draft.source.kind==='label'){
     if(!label||label.id!==draft.source.product.id||label.source!==draft.source.product.source)throw conflict();
    }else if(label!==null)throw conflict();
   }else{
    label=resolvedLabel===null?null:productResponseSchema.parse(resolvedLabel);
    if(draft.source.kind==='label'){
     if(!label||label.id!==draft.source.product.id||label.source!==draft.source.product.source)throw conflict();
     if(label.source==='manual'){
      const[available]=await tx.select({id:nutritionProducts.id}).from(nutritionProducts).where(and(eq(nutritionProducts.userId,userId),eq(nutritionProducts.id,label.id))).for('key share');
      if(!available)throw conflict();
     }
    }else if(label!==null)throw conflict();
   }
   if(supplementReviewRevision(userId,command.lifecycleId,draft,label,{id,revision:command.expectedRevision})!==command.reviewRevision)throw conflict();
   const now=this.now();
   this.assertTakenAt(draft,confirmedAt);
   if(!Number.isFinite(+now)||+confirmedAt>+now)throw new SupplementIntakeError(400,'FUTURE_INTAKE','Confirm an intake only after it was taken.');
   const value=supplementIntakeValueSchema.parse({takenAt:draft.takenAt,confirmedAt:confirmedAt.toISOString(),confirmedTaken:true,servings:draft.servings,
    mineralBasis:draft.mineralBasis,formulation:draft.formulation,label,...(draft.source.kind==='unlabelled'?{unlabelled:draft.source.description}:{})});
   const payload=supplementIntakeSchema.parse({...current,current:value,revision:command.editId,
    corrections:[...current.corrections,{revision:command.editId,changedAt:now.toISOString(),value}]});
   const[saved]=await tx.update(experienceRecords).set({encryptedPayload:encryptPrecision(payload,userId),updatedAt:now}).where(where).returning();
   return view(saved,payload);
  });
 }
 async remove(userId:string,id:string,input:unknown){
  owned(userId);const command=supplementRemoveCommandSchema.parse(input);
  return this.database.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},1))`);
   const where=and(eq(experienceRecords.userId,userId),eq(experienceRecords.id,id));
   const[row]=await tx.select().from(experienceRecords).where(where).for('update');
   if(!row)return false;
   if(row.kind==='supplement-intent')return true;
   if(row.kind!=='supplement-intake')throw conflict();
   const current=supplementIntakeSchema.parse(decryptPrecision(row.encryptedPayload,userId));
   if(current.revision!==command.expectedRevision)throw conflict();
   // No label, dose, source hash, actual dates or history survive individual
   // removal. The opaque intent remains spent until explicit account erasure.
   const marker={version:1,intentId:current.intentId,lifecycleId:current.lifecycleId};
   await tx.update(experienceRecords).set({kind:'supplement-intent',encryptedPayload:encryptPrecision(marker,userId),updatedAt:this.now()}).where(where);
   return true;
  });
 }
}
