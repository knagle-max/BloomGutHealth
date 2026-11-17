import{and,eq,desc}from'drizzle-orm';import{meals,type Meal}from'../shared/schema';import type{db}from'./db';
import {activeMealPredicate,isDeletedMealSave} from './meal-save-state';
type Database=Pick<typeof db,'select'|'update'|'delete'|'transaction'>;
export type MealUpdates=Partial<Omit<Meal,'id'|'userId'>>;
function owned(id:string,userId:string){if(typeof userId!=='string'||!userId)throw Error('Account context is required');return and(eq(meals.id,id),eq(meals.userId,userId));}
export async function getOwnedMeal(database:Database,id:string,userId:string):Promise<Meal|undefined>{
 const where=and(owned(id,userId),activeMealPredicate());const[meal]=await database.select().from(meals).where(where);return meal;
}
/** Save recovery only; callers must check the receipt before returning anything. */
export async function getOwnedMealSaveRecord(database:Database,id:string,userId:string):Promise<Meal|undefined>{
 const[meal]=await database.select().from(meals).where(owned(id,userId));return meal;
}
export async function getOwnedMeals(database:Database,userId:string):Promise<Meal[]>{
 if(!userId)throw Error('Account context is required');
 return database.select().from(meals).where(and(eq(meals.userId,userId),activeMealPredicate())).orderBy(desc(meals.loggedAt));
}
export async function updateOwnedMeal(database:Database,id:string,updates:MealUpdates,userId:string):Promise<Meal|undefined>{
 const where=and(owned(id,userId),activeMealPredicate());
 if(Object.hasOwn(updates,'id')||Object.hasOwn(updates,'userId'))throw Error('Meal ownership cannot be changed');
 const[meal]=await database.update(meals).set(updates).where(where).returning();return meal;
}
export async function deleteOwnedMeal(database:Database,id:string,userId:string):Promise<void>{
 const where=owned(id,userId);
 await database.transaction(async tx=>{
  const[current]=await tx.select().from(meals).where(where).for('update');
  if(!current||isDeletedMealSave(current))return;
  if(typeof(current.mealContext as {_saveReceipt?:unknown}|null)?._saveReceipt!=='string'){
   await tx.delete(meals).where(where);return;
  }
  // Keep only the spent opaque intent + owner, not payload hashes, source data,
  // symptoms, nutrition or intake time. The PK prevents delayed retry resurrection.
  await tx.update(meals).set({mealText:'',mealType:null,loggedAt:new Date(),
   nutritionalData:null,intelligence:null,totalCalories:null,totalProtein:null,
   totalCarbs:null,totalFat:null,mealContext:{_deletedSaveIntent:true}}).where(where);
 });
}
