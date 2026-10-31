import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import {
  scaleDatabaseNutrients,
  type Ingredient,
  type MealIntelligence,
} from "../shared/meal-intelligence";
export type CatalogueFood = {
  fdcId: number;
  description: string;
  per100g: Record<string, number>;
  portions: Array<[string, number]>;
};
// Versioned, compact USDA FNDDS composition data. Server-only: never shipped in the browser bundle.
export const catalogueFoods: CatalogueFood[] = JSON.parse(
  gunzipSync(
    readFileSync(
      new URL("../server/data/fndds-2021-2023.json.gz", import.meta.url),
    ),
  ).toString("utf8"),
);
const stop = new Set(
  "a an the of on in for to as is are was were that which it some had ate i my dinner lunch breakfast snack served made cooked cooking frozen fresh regular nfs ns specified not quantity amount food foods cup cups tablespoon tablespoons tbsp teaspoon teaspoons tsp slice slices piece pieces medium small large gram grams g kg oz ounce ounces fl with and or grilled bbq bbqd barbecued barbequed roasted baked broiled plain raw bowl bowls plate plates serving servings from type restaurant fast school".split(
    " ",
  ),
);
export function normalFoodText(text: string) {
  return text
    .toLowerCase()
    .replace(/hamburger\s+patt(?:y|ies)/g, "beef ground patty")
    .replace(/beef\s+patt(?:y|ies)/g, "beef ground patty")
    .replace(/\btoast\b/g, "bread toasted")
    .replace(/patties/g, "patty")
    .replace(/catsup/g, "ketchup")
    .replace(/macaroni/g, "macaroni")
    .replace(/\bveggies\b/g, "vegetables")
    .replace(/\bgarbanzo\b/g, "chickpea")
    .replace(/\byoghurt\b/g, "yogurt");
}
const tokens = (s: string) =>
  Array.from(
    new Set(
      normalFoodText(s)
        .replace(/[^a-z ]/g, " ")
        .split(/\s+/)
        .map((w) =>
          w.length > 3 && w.endsWith("s") && !w.endsWith("ss")
            ? w.slice(0, -1)
            : w,
        )
        .filter((w) => w.length > 1 && !stop.has(w)),
    ),
  );
const records = catalogueFoods.map((food) => ({
  food,
  words: new Set(tokens(food.description)),
}));
const frequencies = new Map<string, number>();
for (const r of records)
  for (const w of Array.from(r.words))
    frequencies.set(w, (frequencies.get(w) || 0) + 1);
export function findFoodCandidates(query: string, limit = 4) {
  const exact = catalogueFoods.find(
    (f) => f.description.toLowerCase() === query.toLowerCase(),
  );
  if (exact) return [exact];
  if (/^relish$/i.test(query.trim())) query = "pickle relish";
  if (/^(?:\d+\s+)?dressing$/i.test(query.trim())) query = "salad dressing";
  const words = tokens(query);
  if (!words.length) return [];
  const raw = /\b(raw|uncooked)\b/i.test(query),
    fried = /\b(fried|breaded|battered)\b/i.test(query);
  return records
    .flatMap((r) => {
      if (words.some((w) => !r.words.has(w))) return [];
      if (
        !raw &&
        /\braw\b/i.test(r.food.description) &&
        /\b(beef|chicken|pork|turkey|fish|salmon|egg|meat)\b/i.test(
          r.food.description,
        )
      )
        return [];
      if (raw && !/\braw\b/i.test(r.food.description)) return [];
      if (
        /\b(meatless|vegetarian|vegan)\b/i.test(r.food.description) &&
        !/\b(meatless|vegetarian|vegan|plant.based)\b/i.test(query)
      )
        return [];
      if (!fried && /\b(fried|breaded|battered)\b/i.test(r.food.description))
        return [];
      if (
        /\b(?:meal|dinner)\b/i.test(r.food.description) &&
        !/\b(?:meal|dinner)\b/i.test(query)
      )
        return [];
      let score = words.reduce(
        (n, w) => n + Math.log(1 + records.length / (frequencies.get(w) || 1)),
        0,
      );
      score -= Math.max(0, r.words.size - words.length) * 1.5;
      const head = tokens(r.food.description.split(",")[0]);
      if (head.length && head.every((w) => words.includes(w))) score += 5;
      if (/\b(?:NFS|NS as to)\b/i.test(r.food.description)) score += 1;
      for (const special of [
        "dessert",
        "baby",
        "toddler",
        "topping",
        "stuffed",
        "fruit",
        "mexican",
        "split",
        "pudding",
        "sweetened",
        "fried",
        "baked",
        "grilled",
        "roasted",
        "toasted",
        "canned",
        "raw",
      ]) {
        if (
          new RegExp(`\\b${special}\\b`, "i").test(r.food.description) &&
          !new RegExp(`\\b${special}\\b`, "i").test(query)
        )
          score -=
            special === "raw"
              ? 0
              : special === "dessert" ||
                  special === "baby" ||
                  special === "toddler" ||
                  special === "topping" ||
                  special === "stuffed" ||
                  special === "fruit" ||
                  special === "mexican"
                ? 8
                : 2;
      }
      if (
        /\btoasted\b/i.test(query) &&
        !/\btoasted\b/i.test(r.food.description)
      )
        score -= 5;
      if (
        /\b(reduced|nonfat|fat free|low sodium|low fat|unsalted)\b/i.test(
          r.food.description,
        ) &&
        !/\b(reduced|nonfat|fat free|low sodium|low fat|unsalted)\b/i.test(
          query,
        )
      )
        score -= 3;
      return [{ food: r.food, score }];
    })
    .sort((a, b) => b.score - a.score || a.food.fdcId - b.food.fdcId)
    .slice(0, limit)
    .map((r) => r.food);
}
export function estimateCatalogueIngredient(input: Ingredient): Ingredient {
  if (input.grams === null && /User-specified mass/.test(input.assumption))
    return input;
  if (/(?:^|\s)-\d/.test(input.name))
    return {
      ...input,
      grams: null,
      assumption: "Invalid negative quantity; enter a positive amount.",
    };
  const candidates = findFoodCandidates(input.name);
  const food = candidates[0];
  if (!food) return input;
  let grams = input.grams;
  let reason = input.assumption;
  if (grams === null) {
    const mass = input.name.match(
      /(?:^|\s)(\d+(?:\.\d+)?)\s*(kg|g|grams?|oz|ounces?)\b/i,
    );
    if (mass) {
      grams =
        Number(mass[1]) *
        (/^kg$/i.test(mass[2])
          ? 1000
          : /oz|ounce/i.test(mass[2])
            ? 28.3495
            : 1);
      reason = "User-specified mass";
    } else {
      const count = Number(input.name.match(/^\s*(\d+(?:\.\d+)?)/)?.[1] || 1);
      const unit = input.name
        .match(
          /\b(cups?|tablespoons?|tbsp|teaspoons?|tsp|slices?|patt(?:y|ies)|eggs?|pieces?)\b/i,
        )?.[1]
        ?.toLowerCase();
      const normalizedUnit = unit
        ?.replace(/^tbsp$/, "tablespoon")
        .replace(/^tsp$/, "teaspoon")
        .replace(/ies$/, "y")
        .replace(/s$/, "");
      const unitPattern = normalizedUnit
        ? new RegExp(`\\b${normalizedUnit}\\b`, "i")
        : null;
      const matching = unitPattern
        ? food.portions.filter(
            (p) => /^1 /i.test(p[0]) && unitPattern.test(p[0]),
          )
        : [];
      let portion =
        matching.find((p) => /^1 (?:medium|regular)/i.test(p[0])) ||
        matching.find((p) =>
          new RegExp(`^1 ${normalizedUnit}\\b`, "i").test(p[0]),
        ) ||
        matching[0];
      if (normalizedUnit && !portion)
        return {
          ...input,
          assumption:
            "No supported household measure for this food; enter grams.",
        };
      portion ||=
        food.portions.find((p) => p[0] === "Quantity not specified") ||
        food.portions.find((p) =>
          /^1 (?:medium |slice|piece|patty|cup|tablespoon|serving)/i.test(p[0]),
        ) ||
        food.portions[0];
      if (!portion) return input;
      grams = portion[1] * count;
      reason = `Estimated portion: ${count} × ${portion[0]} (${portion[1]} g each), ${Math.round(grams * 100) / 100} g total; adjust to amount eaten`;
    }
  }
  if (!(grams! > 0 && grams! <= 3000))
    return {
      ...input,
      grams: null,
      assumption:
        "Invalid mass or portion; enter an amount above 0 and no more than 3000 g.",
    };
  return {
    name: food.description.slice(0, 120),
    grams: Math.round(grams! * 100) / 100,
    preparation: food.description.slice(0, 120),
    assumption: reason.includes("Generic USDA match; brand, fat content and preparation may differ.")
      ? reason.slice(0,300)
      : `${reason}. Generic USDA match; brand, fat content and preparation may differ.`.slice(0,300),
  };
}
export function lookupCatalogueNutrition(ingredients: Ingredient[]) {
  const foodMatches: MealIntelligence["foodMatches"] = [],
    foods: Array<{
      grams: number;
      foodNutrients: Array<{ nutrient: { id: number }; amount: number }>;
    }> = [];
  for (const ingredient of ingredients) {
    if (ingredient.grams === null) continue;
    const food = catalogueFoods.find(
      (f) =>
        ingredient.catalogue ? f.fdcId===ingredient.catalogue.fdcId :
        f.description === ingredient.name ||
        f.description.slice(0, 120) === ingredient.name,
    );
    if (!food) continue;
    foodMatches.push({
      ingredient: ingredient.name,
      grams: ingredient.grams,
      fdcId: food.fdcId,
      description: food.description,
      url: `https://fdc.nal.usda.gov/food-details/${food.fdcId}/nutrients`,
      needsConfirmation: true,
    });
    foods.push({
      grams: ingredient.grams,
      foodNutrients: Object.entries(food.per100g).map(([id, amount]) => ({
        nutrient: { id: Number(id) },
        amount,
      })),
    });
  }
  return {
    foodMatches,
    nutrients: scaleDatabaseNutrients(foods, ingredients.length),
    warnings: [
      "Generic USDA FNDDS 2021–2023 matches and household portions are estimates. Review food, preparation, product label and amount eaten.",
    ],
  };
}
const numberWords: Record<string, string> = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  eleven: "11",
  twelve: "12",
  half: "0.5",
};
export function splitMealDescription(text: string): Ingredient[] {
  const cleaned = text
    .replace(
      /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|half)\b/gi,
      (w) => numberWords[w.toLowerCase()],
    )
    .replace(/½/g, "0.5")
    .replace(/¼/g, "0.25")
    .replace(/\b1\/2\b/g, "0.5")
    .replace(/\b1\/4\b/g, "0.25")
    .replace(/\b(?:i (?:ate|had)|for (?:breakfast|lunch|dinner))\b/gi, "")
    .replace(/\b(?:that|which)\s+(?:was|were)\s+\w+(?=[,.;]|$)/gi, "")
    .replace(/\bwithout\s+([^,.;]+?)(?=\s+with\b|[,.;]|$)/gi, ", no $1,")
    .replace(/\bthat came with\b/gi, ",")
    .replace(/\b(?:served with|alongside|with|plus)\b/gi, ",")
    .replace(/\bmac(?:aroni)? and cheese\b/gi, "macaroni & cheese");
  return cleaned
    .split(/[,;+]|[.!?](?!\d)|\s+and\s+/i)
    .map((s) => s.trim())
    .filter((s) => s && !/^(?:no|without|hold|skip)\b/i.test(s))
    .map((name) => ({
      name,
      grams: null,
      preparation: "As described",
      assumption: "Amount and food match require estimation or confirmation",
    }));
}
