const aliases: Record<string, string[]> = {
  seafood: [
    "seafood",
    "fish",
    "shellfish",
    "salmon",
    "shrimp",
    "prawns",
    "tuna",
  ],
  dairy: ["dairy", "milk", "casein", "whey", "lactose", "yogurt", "yoghurt", "kefir", "cheese", "butter", "ghee"],
  gluten: ["gluten", "wheat", "barley", "rye"],
  nuts: ["nuts", "tree nut", "walnut", "almond"],
  eggs: ["egg"],
  soy: ["soy", "soya", "tofu"],
  legumes: ["legume", "beans", "lentil", "chickpea", "peanut"],
  alliums: ["allium", "onion", "garlic"],
  sesame: ["sesame", "tahini"],
  mustard: ["mustard"],
  celery: ["celery"],
};
export function foodCategory(term: string) {
  const t = term.toLowerCase().trim();
  return Object.entries(aliases).find(
    ([key, words]) => words.some((w) => t.includes(w)) || t === key,
  )?.[0];
}

type NamedFood={name:string;tags?:readonly string[]};
const inName=(name:string,term:string)=>{const words=name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),needle=term.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);return needle.length>0&&needle.every(word=>words.some(value=>value===word||value===word+"s"||value+"s"===word));};
/** Name/category matches prompt review; they never certify packaged-product safety. */
export function foodPreferenceMatches(ingredients:readonly NamedFood[],terms:readonly string[]){
 return terms.filter(term=>ingredients.some(ingredient=>{const group=foodCategory(term);return inName(ingredient.name,term)||!!group&&((ingredient.tags||[]).includes(group)||aliases[group].some(alias=>inName(ingredient.name,alias)));}));
}
export function unknownAllergyTerms(allergies:readonly string[],foods:readonly NamedFood[]){return allergies.filter(term=>!foodCategory(term)&&!foods.some(food=>inName(food.name,term)));}

/** A manual report prompts review, not a diagnosis or an automatic exclusion. */
export function intoleranceWarnings(ingredients: readonly NamedFood[], terms: readonly string[] = []) {
  const matches = foodPreferenceMatches(ingredients, terms);
  return matches.length ? [`Contains ingredients matching your reported intolerance: ${matches.join(", ")}. Review your own tolerance and portions; this is not a diagnosis or a guarantee of tolerance.`] : [];
}
export function tasteMatches(ingredients: readonly NamedFood[], terms: readonly string[] = []) {
  return foodPreferenceMatches(ingredients, terms);
}
