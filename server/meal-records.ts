import{and,eq}from'drizzle-orm';import{meals,type Meal}from'../shared/schema';import type{db}from'./db';
type Database=Pick<typeof db,'select'|'update'|'delete'>;
export type MealUpdates=Partial<Omit<Meal,'id'|'userId'>>;
function owned(id:string,userId:string){if(typeof userId!=='string'||!userId)throw Error('Account context is required');return and(eq(meals.id,id),eq(meals.userId,userId));}
export async function getOwnedMeal(database:Database,id:string,userId:string):Promise<Meal|undefined>{
 const where=owned(id,userId);const[meal]=await database.select().from(meals).where(where);return meal;
}
export async function updateOwnedMeal(database:Database,id:string,updates:MealUpdates,userId:string):Promise<Meal|undefined>{
 const where=owned(id,userId);
 if(Object.hasOwn(updates,'id')||Object.hasOwn(updates,'userId'))throw Error('Meal ownership cannot be changed');
 const[meal]=await database.update(meals).set(updates).where(where).returning();return meal;
}
export async function deleteOwnedMeal(database:Database,id:string,userId:string):Promise<void>{
 const where=owned(id,userId);await database.delete(meals).where(where);
}
