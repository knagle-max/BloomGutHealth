import type {Express} from 'express';
import {z} from 'zod';
import {dateKey} from '../shared/experience';
import {recordedNutrientDefinitionDetails} from '../shared/nutrient-definitions';
import {recognizedMealTimeZone} from '../shared/meal-time';
import {recordedIntakeSources,recordedIntakeViewSchema} from '../shared/recorded-intake-sources';
import {mealRecordRevision} from './meal-edit';
import type {IStorage} from './storage';

/** Mounted inside the existing active-account/no-store Experience family.
 * Read existing canonical owned sources only, never a provider or a new store. */
export function registerRecordedIntakeSourceRoutes(app:Express,store:Pick<IStorage,'getMeals'|'getExperienceRecords'>,now=()=>new Date()){
 const query=z.object({date:dateKey,timeZone:z.string().max(100).refine(recognizedMealTimeZone),nutrientKey:z.string().refine(key=>recordedNutrientDefinitionDetails().some(def=>def.key===key))}).strict();
 app.get('/api/experience/recorded-intake-sources',async(req,res)=>{
  const parsed=query.safeParse(req.query);if(!parsed.success)return res.status(400).json({error:'Choose a valid date, time zone and nutrient.'});
  try{
   const userId=req.session.userId!;
   if(!userId)return res.status(401).json({error:'Sign in to view your recorded sources.'});
   const[foods,supplements]=await Promise.all([store.getMeals(userId),store.getExperienceRecords(userId,'supplement-intake')]);
   // The canonical Experience workspace has a2000-record limit. Refuse a
   // truncated/unsupported feed rather than imply a complete daily source view.
   if(supplements.length>=2000)throw Error('SOURCE_WINDOW_LIMIT');
   const result=recordedIntakeSources({actor:userId,...parsed.data,asOf:now().toISOString(),foods:foods.map(meal=>({id:meal.id,userId:meal.userId,name:meal.mealText.slice(0,160),loggedAt:meal.loggedAt,revision:mealRecordRevision(meal),analysis:meal.intelligence&&typeof meal.intelligence==='object'?meal.intelligence as any:null})),supplements:supplements.map(record=>({...record,userId:'userId'in record?record.userId:userId}))});
   for(const event of result.events)event.rows=event.rows.filter(row=>row.nutrientKey===parsed.data.nutrientKey);
   const body=recordedIntakeViewSchema.parse(result);
   if(Buffer.byteLength(JSON.stringify(body),'utf8')>2*1024*1024)throw Error('SOURCE_VIEW_LIMIT');
   res.json(body);
  }catch{res.status(503).json({error:'Recorded nutrient sources could not load. Missing sources are not zero intake. Please retry.'});}
 });
}
