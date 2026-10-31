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
    label: "Add food",
    reason: "Log a meal to see today’s nutrition. Unlogged intake is unknown.",
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

/** Schedule routing only: no inferred workload, intake deficit or clinical advice. */
export function todayContextAction(input: Parameters<typeof todayJournalAction>[0] & {
  goal?: { mapping: string; sourceIds: string[] };
  sessions?: { title: string; startsAt: string; status: string }[];
  now?: Date;
}) {
  const base = todayJournalAction(input);
  if (input.loading || input.unavailable || !input.mealCount || (input.missingNutritionCount || 0) > 0) return base;
  const now = input.now || new Date();
  const session = input.sessions?.filter(s => {
    const start = new Date(s.startsAt);
    return s.status === "planned" && Number.isFinite(+start) && +start >= +now &&
      start.getFullYear() === now.getFullYear() && start.getMonth() === now.getMonth() && start.getDate() === now.getDate();
  }).sort((a,b) => +new Date(a.startsAt) - +new Date(b.startsAt))[0];
  if (session) return {
    href: "/athlete/fueling",
    label: "Review session fuel",
    reason: `“${session.title}” is planned today. Review familiar foods and your saved plan; a planned session does not establish an energy requirement.`,
  };
  if (input.goal?.sourceIds.length) return {
    ...base,
    reason: `Your saved focus: ${input.goal.mapping}. Use logged meals and targets; missing nutrients are not evidence of deficiency.`,
  };
  return base;
}
