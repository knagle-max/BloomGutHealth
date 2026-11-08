import {createHash} from 'node:crypto';
import {and,eq} from 'drizzle-orm';
import {meals,type Meal} from '../shared/schema';
import type {db} from './db';
import type {MealUpdates} from './meal-records';

function canonical(value:unknown):unknown {
  if(value instanceof Date)return value.toISOString();
  if(Array.isArray(value))return value.map(canonical);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)]));
  return value;
}
function digest(value:unknown){return createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');}
export function mealRecordRevision(meal:Meal){return digest(['meal-record-v1',meal]);}
export type MealEditReceipt={id:string;fingerprint:string};
export function mealEditReceipt(userId:string,mealId:string,key:string,payload:unknown):MealEditReceipt {
  return {id:digest(['meal-edit-v1',userId,mealId,key]),fingerprint:digest(payload)};
}
export class MealEditConflict extends Error {
  constructor(){super('This meal changed. Reload its latest details before saving your changes.');}
}
/** Only the most recent edit can replay; an intervening correction must never be overwritten. */
export function replayMealEdit(meal:Meal,receipt:MealEditReceipt):Meal|undefined {
  const previous=(meal.mealContext as {_editReceipt?:MealEditReceipt}|null)?._editReceipt;
  if(previous?.id!==receipt.id)return undefined;
  if(previous.fingerprint!==receipt.fingerprint)throw new MealEditConflict();
  return meal;
}
export async function updateMealWithReview(database:Pick<typeof db,'transaction'>,id:string,userId:string,revision:string,updates:MealUpdates,receipt:MealEditReceipt):Promise<Meal|undefined> {
  if(!userId||Object.hasOwn(updates,'id')||Object.hasOwn(updates,'userId'))throw Error('Meal ownership cannot be changed');
  return database.transaction(async tx=>{
    const where=and(eq(meals.id,id),eq(meals.userId,userId));
    const [current]=await tx.select().from(meals).where(where).for('update');
    if(!current)return undefined;
    const replay=replayMealEdit(current,receipt);if(replay)return replay;
    if(mealRecordRevision(current)!==revision)throw new MealEditConflict();
    const [saved]=await tx.update(meals).set({...updates,mealContext:{...((current.mealContext as object)||{}),...((updates.mealContext as object)||{}),_editReceipt:receipt}}).where(where).returning();
    return saved;
  });
}
