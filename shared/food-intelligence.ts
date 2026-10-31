import { nutrientDefinitions } from "./meal-intelligence";

export const FOOD_INTELLIGENCE_VERSION = "food-composition-2026-10-18.2";
export type TargetRange = { target?: number | null; min?: number | null; max?: number | null };
export type NutrientIntakeCoverage = Record<string, { partial: boolean } | undefined>;
const known = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;
/** Composition arithmetic only. A selected target is not a clinical upper limit.
 * Missing intake coverage never establishes complete intake or below-limit clearance. */
export function explainNutrientContribution(
  nutrients: Record<string, number | null | undefined>,
  targets: Record<string, TargetRange> = {},
  consumed: Record<string, number | null | undefined> = {},
  coverage: NutrientIntakeCoverage = {},
) {
  return nutrientDefinitions.map(([key, name, unit]) => {
    const raw = nutrients[key], amount = known(raw) ? raw : null;
    const range = targets[key], before = consumed[key], knownBefore = known(before);
    const complete = knownBefore && coverage[key]?.partial === false;
    const intakeStatus = complete ? "complete" as const : knownBefore ? "partial" as const : "unknown" as const;
    const minimum = known(range?.min) && range.min > 0 ? range.min : null;
    const maximum = known(range?.max) ? range.max : null;
    const target = known(range?.target) && range.target > 0 ? range.target : null;
    const percentage = (reference: number | null) => amount !== null && reference !== null && reference > 0 ? Math.round(amount / reference * 100) : null;
    const percentOfMinimum = percentage(minimum), percentOfMaximum = percentage(maximum), percentOfTarget = percentage(target);
    const remainder = (reference: number | null) => reference !== null && knownBefore ? Math.max(0, reference - before) : null;
    const remainingMinimum = complete ? remainder(minimum) : null;
    const targetRemaining = complete ? remainder(target) : null;
    const provisionalRemainingMinimum = !complete ? remainder(minimum) : null;
    const provisionalRemainingTarget = !complete ? remainder(target) : null;
    // Known intake is a lower bound when logging is partial. It can prove an exceedance,
    // but cannot establish that the whole day remains below a limit.
    const exceedsMaximum = maximum !== null && amount !== null
      ? amount + (knownBefore ? before : 0) > maximum ? true : complete ? false : null
      : null;
    const formatted = amount === null ? "Unknown" : Number(amount.toFixed(1)).toLocaleString("en-US");
    const comparesIntake = minimum !== null || maximum !== null || target !== null;
    return { key, name, unit, amount, percentOfMinimum, percentOfMaximum, percentOfTarget,
      remainingMinimum, targetRemaining, provisionalRemainingMinimum, provisionalRemainingTarget, intakeStatus, exceedsMaximum,
      explanation: amount === null ? `${name} is unavailable; it is not counted as zero.` : `${formatted} ${unit} ${name.toLowerCase()}${percentOfMinimum !== null ? ` · ${percentOfMinimum}% of your selected daily minimum` : ""}${percentOfTarget !== null ? ` · ${percentOfTarget}% of your selected daily target` : ""}${percentOfMaximum !== null ? ` · ${percentOfMaximum}% of your selected daily limit` : ""}${exceedsMaximum ? knownBefore ? " · would exceed that limit with known logged intake" : " · this portion alone exceeds that limit" : ""}${comparesIntake && !complete ? " · logged intake is incomplete or unavailable; any remaining amount is provisional, and being below a daily limit is not confirmed" : ""}.`,
      basis: "composition" as const };
  });
}
