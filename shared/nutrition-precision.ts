/** Preserve the existing two-decimal estimate convention without turning a known
 * positive source amount into a measured zero. Unknown values stay with callers. */
export function roundNutrientEstimate(amount: number): number {
  const rounded = Math.round(amount * 100) / 100;
  return amount > 0 && rounded === 0 ? amount : rounded;
}
