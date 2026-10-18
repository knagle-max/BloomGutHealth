// Cooking instructions are distinct from the edible weights used for composition estimates.
export const cookingSource =
  "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart";
export function prepareIngredient(name: string): string | null {
  const n = name.toLowerCase();
  if (/fermented cabbage/.test(n))
    return "Use ready-to-eat fermented cabbage. Check the ingredient list for exclusions; keep refrigerated and follow the package.";
  if (/chicken/.test(n))
    return "Start with raw boneless chicken breast. Heat oven to 200°C / 400°F; roast on a lined tray about 20–25 minutes, until the thickest part reaches 74°C / 165°F. Rest, slice and weigh the cooked portion.";
  if (/salmon/.test(n))
    return "Start with a raw salmon fillet. Bake on a lined tray at 200°C / 400°F about 12–18 minutes, until the center reaches 63°C / 145°F. Remove skin/bones as needed, then weigh the cooked portion.";
  if (/egg/.test(n))
    return "Cover eggs with cold water, bring to a boil, then gently simmer about 10–12 minutes until yolks and whites are firm. Cool in cold water, peel and weigh the edible portion.";
  if (/tofu/.test(n))
    return "Drain firm tofu and pat dry. Cut into cubes; heat in a nonstick skillet with a splash of water for 6–8 minutes, turning until hot. Weigh the prepared portion.";
  if (/lentil|chickpea|black bean/.test(n))
    return /lentil/.test(n)
      ? "Rinse dry lentils. Simmer in plenty of water for 20–30 minutes until tender, then drain and weigh. No-salt-added canned lentils, drained and rinsed, are a quicker alternative."
      : "Use no-salt-added canned beans or chickpeas, drain and rinse, then warm in water for 5 minutes and weigh. If using dried beans, soak and fully cook according to the package before starting; soaking time is additional.";
  if (/rice|quinoa|millet|buckwheat|barley/.test(n))
    return "Rinse the dry grain. Simmer covered in water according to its package until tender (about 15–20 minutes for quinoa/white rice, 30–45 minutes for brown rice/barley). Rest 5 minutes, fluff and weigh the cooked portion.";
  if (/sweet potato/.test(n))
    return "Scrub raw sweet potato, prick the skin and bake at 200°C / 400°F for about 45–60 minutes until tender. Remove inedible parts and weigh the cooked portion.";
  if (/potato/.test(n))
    return "Scrub and dice raw potatoes. Cover with water, bring to a boil and simmer 12–18 minutes until fork-tender. Drain and weigh. For a cooled-potato recipe, refrigerate in a shallow container within 2 hours and cool fully before assembling; allow extra chilling time.";
  if (/apple/.test(n) && !/cooked/.test(n))
    return "Wash, core and slice the fresh apple.";
  if (/apple/.test(n))
    return "Peel and core a fresh apple, dice and simmer with a little water for 8–12 minutes until tender. Drain excess liquid and weigh if the listed ingredient is cooked apple. For a fresh apple recipe, wash, core and slice instead.";
  if (/collard/.test(n))
    return "Wash collard greens, remove tough stems and slice thinly. Simmer in water for 20–30 minutes until tender, then drain and weigh.";
  if (/beet/.test(n))
    return "Scrub beets and simmer in water about 30–45 minutes until tender. Cool, peel and weigh the edible cooked portion.";
  if (/corn/.test(n))
    return "Cook fresh or frozen corn kernels in simmering water for 5–8 minutes until tender. Drain and weigh the cooked portion.";
  if (
    /broccoli|carrot|spinach|cauliflower|collard|brussels|asparagus|beet|onion/.test(
      n,
    )
  )
    return /onion/.test(n)
      ? "Peel and dice the onion. Soften over medium heat for 5–8 minutes with water or the recipe’s measured oil."
      : "Wash and trim the vegetables. Cut into bite-size pieces; steam about 5–10 minutes until tender (leafy greens about 3–5 minutes; beets may take longer). Drain and weigh if a cooked weight is listed.";
  if (/oat/.test(n))
    return "For porridge, simmer rolled oats with about twice their volume of water for 5–8 minutes, stirring. Oats are weighed dry. For yogurt bowls, stir oats into yogurt and let soften for 10 minutes.";
  return null;
}
export function recipePreparation(recipe: {
  ingredients: { name: string; grams: number }[];
  steps: string[];
  minutes: number;
}) {
  const instructions = Array.from(
    new Set(
      recipe.ingredients
        .map((i) => prepareIngredient(i.name))
        .filter((s): s is string => !!s),
    ),
  );
  const text = recipe.ingredients.map((i) => i.name).join(" ");
  const preparationMinutes = recipe.ingredients.map((i) => {
    const n = i.name.toLowerCase();
    return /sweet potato/.test(n)
      ? 65
      : /brown rice|barley/.test(n)
        ? 55
        : /beet/.test(n)
          ? 50
          : /collard/.test(n)
            ? 40
            : /chicken|lentil/.test(n)
              ? 35
              : /potato|salmon|quinoa|millet|buckwheat|white rice/.test(n)
                ? 30
                : /egg/.test(n)
                  ? 25
                  : /cooked.*apple|apple.*cooked|tofu|oat|broccoli|carrot|spinach|onion|cauliflower|brussels|asparagus|corn/.test(
                        n,
                      )
                    ? 15
                    : 0;
  });
  const minutes = Math.max(recipe.minutes, ...preparationMinutes);
  const shopping = recipe.ingredients.map((i) => {
    const n = i.name.toLowerCase();
    const factor = /chicken|salmon/.test(n)
      ? 1 / 0.75
      : /cooked.*(?:brown rice|lentil)|(?:brown rice|white rice|quinoa|millet|buckwheat|barley).*cooked/.test(
            n,
          )
        ? 1 / 3
        : 1;
    const label = /chicken/.test(n)
      ? "Raw boneless chicken breast"
      : /salmon/.test(n)
        ? "Raw salmon fillet"
        : factor < 1
          ? "Dry " + i.name.replace(/cooked|no salt|[(),]/gi, "").trim()
          : /potato|broccoli|carrot|spinach|cauliflower|collard|brussels|asparagus|beet/.test(
                n,
              ) && !/fermented/.test(n)
            ? "Fresh " +
              i.name.replace(/cooked|boiled|baked|no salt|[(),]/gi, "").trim()
            : /chickpea|black bean/.test(n)
              ? "No-salt-added canned " +
                i.name.replace(/cooked|no salt|[(),]/gi, "").trim()
              : i.name;
    return {
      name: label,
      grams: Math.round(i.grams * factor),
      estimated: factor !== 1,
      nutritionBasis: `${i.grams} g ${i.name}`,
    };
  });
  return {
    instructions,
    shopping,
    minutes,
    note: "Shopping amounts marked approximate use rough cooking yields, not measured conversion factors. Weigh the listed prepared portion for nutrition. Ingredient amounts describe the food as listed. Cooked weights are measured after cooking; raw food loses or gains water, so the same gram amount is not interchangeable. Start grains/protein first and prepare vegetables while they cook. Only listed oils and salt are included in nutrition. Times are estimates; chilling, soaking and batch cooking may take longer.",
    source: cookingSource,
  };
}
