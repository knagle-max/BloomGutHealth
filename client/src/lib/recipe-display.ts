/** Preparation-specific composition names remain in the ingredient evidence. */
export function recipeDisplayName(name: string) {
  return name.replace(/\s*\((?:cooked|raw|dry|no salt|drained|canned)[^)]*\)/gi, "")
    .replace(/\s+([,&])/g, "$1").replace(/\s{2,}/g, " ").trim();
}
