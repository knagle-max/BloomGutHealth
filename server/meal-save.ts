import { createHash } from "node:crypto";
import { eq, and } from "drizzle-orm";
import { meals, type InsertMeal, type Meal } from "../shared/schema";
import type { db } from "./db";

export type MealSaveReceipt = { id: string; fingerprint: string };
export function mealSaveReceipt(userId: string, key: string, payload: unknown): MealSaveReceipt {
  const hash = (value: string) => createHash("sha256").update(value).digest("hex");
  return { id: hash(JSON.stringify(["meal-save-v1", userId, key])), fingerprint: hash(JSON.stringify(payload)) };
}
export function checkMealReceipt(meal: Meal, receipt: MealSaveReceipt): Meal {
  if ((meal.mealContext as any)?._saveReceipt !== receipt.fingerprint) throw new Error("MEAL_SAVE_CONFLICT");
  return meal;
}

// The existing primary key arbitrates concurrent writes across server instances.
export async function insertMealWithReceipt(database: Pick<typeof db, "insert" | "select">, meal: InsertMeal, receipt?: MealSaveReceipt): Promise<Meal> {
  if (!receipt) {
    const [saved] = await database.insert(meals).values(meal).returning();
    return saved;
  }
  const [saved] = await database.insert(meals).values({ ...meal, id: receipt.id,
    mealContext: { ...((meal.mealContext as object) || {}), _saveReceipt: receipt.fingerprint },
  }).onConflictDoNothing({ target: meals.id }).returning();
  if (saved) return saved;
  const [existing] = await database.select().from(meals).where(and(eq(meals.id, receipt.id), eq(meals.userId, meal.userId)));
  if (!existing) throw new Error("MEAL_SAVE_UNAVAILABLE");
  return checkMealReceipt(existing, receipt);
}
