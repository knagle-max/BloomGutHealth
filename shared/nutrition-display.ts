import { quantityFromCanonical } from "./display-units";

export type NutritionDisplayUnits = { energy: "kcal" | "kJ"; foodWeight: "g" | "oz" };

/** Convert only the canonical nutrition energy convention, never arbitrary lab/label units. */
export function nutrientDisplay(
  key: string,
  amount: number | null | undefined,
  sourceUnit: string,
  units: Pick<NutritionDisplayUnits, "energy">,
): { amount: number | null; unit: string } {
  const convert = key === "calories" && sourceUnit === "kcal";
  const known = typeof amount === "number" && Number.isFinite(amount) && amount >= 0;
  return {
    amount: known ? (convert ? quantityFromCanonical("energy", amount, units.energy) : amount) : null,
    unit: convert ? units.energy : sourceUnit,
  };
}

export function energyAmount(kcal: number | null | undefined, unit: NutritionDisplayUnits["energy"]): string {
  const value = nutrientDisplay("calories", kcal, "kcal", { energy: unit }).amount;
  return value === null ? "Unavailable" : String(Math.round(value));
}

export function foodMass(grams: number | null | undefined, unit: NutritionDisplayUnits["foodWeight"]): string {
  if (grams == null || !Number.isFinite(grams) || grams < 0) return "Amount unknown";
  return `${Number(quantityFromCanonical("foodWeight", grams, unit).toFixed(unit === "oz" ? 2 : 1))} ${unit}`;
}

export function foodMassDraft(raw: string, unit: NutritionDisplayUnits["foodWeight"]): number | null {
  if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(raw.trim())) return null;
  const grams = Number(raw) * (unit === "oz" ? 28.349523125 : 1);
  return Number.isFinite(grams) && grams > 0 && grams <= 3000 ? grams : null;
}
