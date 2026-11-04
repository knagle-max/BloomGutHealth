/** Preserve the existing two-decimal estimate convention without turning a known
 * positive source amount into a measured zero. Unknown values stay with callers. */
export function roundNutrientEstimate(amount: number): number {
  const scaled = amount * 100;
  // Restore decimal half-cent ties lost to binary floating-point multiplication.
  const rounded = Math.round(scaled + Number.EPSILON * Math.abs(scaled)) / 100;
  return amount > 0 && rounded === 0 ? amount : rounded;
}
