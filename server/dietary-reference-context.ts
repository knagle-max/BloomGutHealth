import type {Express} from 'express';
import {eq} from 'drizzle-orm';
import {createHash} from 'node:crypto';
import {z} from 'zod';
import {users,precisionProfiles} from '../shared/schema';
import {dateKey} from '../shared/experience';
import {recognizedMealTimeZone} from '../shared/meal-time';
import {dietaryReferenceEligibility} from '../shared/dietary-reference-eligibility';
import {decryptPrecision} from './precision-crypto';
import {readProfileMeasurementSource} from './profile-measurement-source';
import type {db} from './db';
import type {IStorage} from './storage';

/** One repeatable read of existing own-account inputs, never another profile
 * store or a current context projected into historical life stages. */
export function readDietaryReferenceInputs(database:Pick<typeof db,'transaction'>,actor:string){
 if(!actor)throw Error('REFERENCE_SCOPE_UNAVAILABLE');
 return database.transaction(async tx=>{
  const[profile]=await tx.select({id:users.id,sex:users.sex,heightCm:users.heightCm,weightKg:users.weightKg}).from(users).where(eq(users.id,actor));
  if(!profile)return null;
  const source=await readProfileMeasurementSource(tx,actor,profile);
  const[health]=await tx.select({encryptedContext:precisionProfiles.encryptedContext}).from(precisionProfiles).where(eq(precisionProfiles.userId,actor));
  return{profile:{id:profile.id,sex:profile.sex},birthYear:source.available?source.fields.birthYear??null:null,healthContext:health?decryptPrecision(health.encryptedContext,actor):undefined};
 },{isolationLevel:'repeatable read',accessMode:'read only'});
}
export type DietaryReferenceInputs=Awaited<ReturnType<typeof readDietaryReferenceInputs>>;
export function registerDietaryReferenceContextRoutes(app:Express,store:IStorage,now:()=>Date=()=>new Date()){
 const query=z.object({date:dateKey,timeZone:z.string().refine(recognizedMealTimeZone),nutrientKey:z.string().min(1).max(80).regex(/^[a-z][a-z0-9_]*$/)}).strict();
 app.get('/api/experience/dietary-reference-context',async(req,res)=>{
  const parsed=query.safeParse(req.query);if(!parsed.success)return res.status(400).json({error:'Choose a valid reference date, time zone and nutrient.'});
  const actor=req.session.userId;if(!actor)return res.status(401).json({error:'Sign in to view your reference context.'});
  try{
   if(!store.getDietaryReferenceInputs)throw Error('REFERENCE_INPUTS_UNAVAILABLE');
   const inputs=await store.getDietaryReferenceInputs(actor);if(!inputs)return res.status(401).json({error:'Sign in to view your reference context.'});
   const result=dietaryReferenceEligibility({actor,...inputs,...parsed.data,asOf:now().toISOString()});
   const revision=createHash('sha256').update(JSON.stringify([actor,inputs,result.referenceVersion])).digest('hex');
   res.json({...result,revision});
  }catch{res.status(503).json({error:'Profile reference context could not load. General published references remain available; no intake assessment was made.'});}
 });
}
