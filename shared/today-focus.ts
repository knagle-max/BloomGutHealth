/** Journal completeness changes the next action, never a clinical priority. */
export function todayJournalAction({ mealCount, missingNutritionCount = 0, loading = false, unavailable = false }: {
  mealCount: number;
  missingNutritionCount?: number;
  loading?: boolean;
  unavailable?: boolean;
}) {
  if (loading || unavailable) return {
    href: "/log-meal",
    label: "Log a meal",
    reason: loading
      ? "Your journal is loading. You can still add a meal."
      : "Your journal could not load. You can still record food; your existing intake is unknown until the journal reconnects.",
  };
  if (!mealCount) return {
    href: "/log-meal",
    label: "Log my first meal",
    reason: "Start with what you ate. You can scan a package, choose a saved meal or type a description.",
  };
  if (missingNutritionCount > 0) return {
    href: "/nutrition",
    label: "Review my meal estimates",
    reason: `${missingNutritionCount} logged meal(s) have incomplete energy estimates. Review matches and portions before relying on remaining-intake suggestions; missing values are not zero.`,
  };
  return {
    href: "/plan-day",
    label: "Choose my next meal",
    reason: "Suggestions use the meals you have logged today. Review portions and missing values.",
  };
}
