import { snapshotFoods, loggingFoods } from "./food-snapshot";
import { parseExplicitIngredients, type Ingredient } from "./meal-intelligence";

// These are editable working assumptions, not measured serving weights.
const aliases: Array<[RegExp, string, number]> = [
  [/\bchicken\b/i, "chicken", 150],
  [/\b(beef|steak)\b/i, "beef-grilled", 150],
  [/\b(croutons?)\b/i, "croutons", 15],
  [/\b(dressing|caesar sauce)\b/i, "caesar-dressing", 30],
  [/\b(salad|lettuce|romaine)\b/i, "romaine", 85],
  [/\bolive oil\b/i, "olive-oil", 10],
  [/\blemon juice\b/i, "lemon-juice", 15],
  [/\bsweet potato(?:es)?\b/i, "sweetpotato", 200],
  [/\bpotato(?:es)?\b/i, "potato", 200],
  [/\bbrown rice\b/i, "rice", 150],
  [/\b(white rice|rice)\b/i, "white-rice", 150],
  [/\bquinoa\b/i, "quinoa", 150],
  [/\bbroccoli\b/i, "broccoli", 80],
  [/\bcarrots?\b/i, "carrot", 80],
  [/\bspinach\b/i, "spinach", 80],
  [/\bsalmon\b/i, "salmon", 150],
  [/\btofu\b/i, "tofu", 150],
  [/\blentils?\b/i, "lentils", 150],
  [/\bchickpeas?\b/i, "chickpeas", 150],
  [/\bblack beans?\b/i, "beans", 150],
  [/\beggs?\b/i, "egg", 50],
];
const foods = [...snapshotFoods, ...loggingFoods];
export function estimateIngredient(input: Ingredient): Ingredient {
  if (input.grams === null && /User-specified mass/i.test(input.assumption))
    return input;
  const exact = foods.find(
    (f) =>
      f.name.toLowerCase() === input.name.toLowerCase() ||
      f.description.toLowerCase() === input.name.toLowerCase(),
  );
  // Do not silently convert a raw, fried, breaded or otherwise conflicting food to a cooked generic record.
  const conflicting =
    /\b(pizza|sandwich|burger|casserole|soup|curry|pie|raw|fried|breaded|battered|thigh|skin|ranch|vinaigrette|dry|uncooked)\b/i.test(
      input.name,
    );
  const alias = conflicting
    ? undefined
    : aliases.find(([pattern]) => pattern.test(input.name));
  const food = exact || (alias && foods.find((f) => f.id === alias[1]));
  if (!food) return input;
  let grams = input.grams;
  const assumptions: string[] = [];
  if (!exact)
    assumptions.push(
      `Generic substitute for “${input.name}”: ${food.description}; product/cut may differ`,
    );
  if (grams === null) {
    // An explicit but invalid mass must never turn into a plausible serving.
    if (/\d\s*(?:kg|g|grams?|oz|ounces?)\b/i.test(input.name)) return input;
    const count = input.name.match(/^(\d+(?:\.\d+)?)\s+/);
    const pieces = /\b(skewers?|kebabs?|kebobs?)\b/i.test(input.name);
    const eggs = /\beggs?\b/i.test(input.name);
    const cup = /\bcups?\b/i.test(input.name);
    const base = pieces
      ? 75
      : eggs
        ? 50
        : cup && /rice|quinoa|lentil|chickpea|beans/i.test(input.name)
          ? 180
          : alias?.[2];
    if (!base) return input;
    grams = base * (count && (pieces || eggs || cup) ? Number(count[1]) : 1);
    if (!(grams > 0 && grams <= 3000)) return input;
    assumptions.push(
      `Estimated portion: ${grams} g${pieces ? ` (${count?.[1] || 1} × 75 g cooked meat per skewer)` : ""}; edit to the amount eaten${/bag|salad/i.test(input.name) ? "; assumes one serving, not a whole bag" : ""}`,
    );
  } else assumptions.push(input.assumption);
  return {
    name: food.name,
    grams,
    preparation: food.description,
    assumption: assumptions.join(". ").slice(0, 300),
  };
}
export function estimateMealIngredients(text: string): Ingredient[] {
  const cleaned = text
    .replace(/\ball\s+(?:bbq|barbecued|grilled)\b/gi, "")
    .replace(/\bthat came with\b/gi, ", ")
    .replace(/\s+with\s+/gi, ", ")
    .replace(/[.!?](?!\d)/g, ",");
  const result = parseExplicitIngredients(cleaned)
    .filter((i) => !/^(?:no|without|hold|skip)\b/i.test(i.name))
    .map(estimateIngredient);
  if (/\blemon potatoes\b/i.test(text)) {
    for (const [id, grams] of [
      ["olive-oil", 10],
      ["lemon-juice", 15],
    ] as const) {
      const food = foods.find((f) => f.id === id)!;
      if (
        !(
          id === "olive-oil" &&
          /\b(?:no|without)\s+(?:added\s+)?(?:olive\s+)?oil\b/i.test(text)
        ) &&
        !result.some((i) => i.name === food.name)
      )
        result.push({
          name: food.name,
          grams,
          preparation: food.description,
          assumption: `Estimated recipe addition for lemon potatoes: ${grams} g; edit or remove if not eaten. Salt and other marinade ingredients are unknown.`,
        });
    }
  }
  return result.slice(0, 20);
}
