import { ingredientSchema, MAX_MEAL_INGREDIENTS } from './meal-intelligence';
import { z } from 'zod';

/** Display saved food identities without rewriting the user's source description. */
export function journalIdentity(meal: { mealText: string; intelligence?: unknown }) {
  const parsed = z.object({ ingredients: z.array(ingredientSchema).max(MAX_MEAL_INGREDIENTS) }).safeParse(meal.intelligence);
  const foods = parsed.success ? parsed.data.ingredients : null;
  return {
    title: foods === null ? meal.mealText : foods.length ? foods.map(food => food.name).join(', ') : 'No foods recorded',
    foods,
  };
}
