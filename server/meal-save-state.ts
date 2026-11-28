import {sql} from 'drizzle-orm';
import {meals,type Meal} from '../shared/schema';

/** Internal, health-content-free spent save intent. Never a journal observation. */
export function isDeletedMealSave(meal:Pick<Meal,'mealContext'>):boolean {
 return (meal.mealContext as {_deletedSaveIntent?:unknown}|null)?._deletedSaveIntent===true;
}
export function activeMealPredicate(){
 return sql`coalesce(${meals.mealContext}->>'_deletedSaveIntent', 'false') <> 'true'`;
}
