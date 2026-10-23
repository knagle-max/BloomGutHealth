import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { PrecisionReport } from "@shared/precision-nutrition";
import { todayJournalAction } from "@shared/today-focus";
export default function TodayFocus({ mealCount = 0, missingNutritionCount = 0, loading = false, journalError = false }: { mealCount?: number; missingNutritionCount?: number; loading?: boolean; journalError?: boolean }) {
  const report = useQuery<PrecisionReport>({ queryKey: ["/api/precision"] }),
    goal = report.data?.goals.find((g) => g.id !== "unmapped");
  const action = todayJournalAction({ mealCount, missingNutritionCount, loading, unavailable: journalError });
  return (
    <section className="bloom-panel today-focus space-y-3">
      <p className="eyebrow">TODAY’S FOCUS</p>
      <h2>{goal?.mapping || "Build a consistent meal routine"}</h2>
      <p>
        {goal?.actions[0] ||
          "Log what you eat, review portions, and use your remaining nutrition to choose the next meal."}
      </p>
      <p className="panel-note">
        {goal
          ? "Based on your saved goal. This is a practical dietary focus, not a diagnosis or predicted effect."
          : "Add your goals and health context to connect food choices with useful priorities."}
      </p>
      {report.error && (
        <p role="alert" className="panel-note">
          Your saved focus could not load. This general routine suggestion
          remains available; retry My biology to review your saved goals.
        </p>
      )}
      <div className="today-next-action">
        <Link className="hero-button" href={action.href}>
          {action.label}
        </Link>
        <p className="panel-note">{action.reason}</p>
      </div>
      <details><summary>Your focus & next steps</summary>
      <div className="flex flex-wrap gap-4">
        <Link className="text-link" href={mealCount ? "/log-meal" : "/plan-day"}>
          {mealCount ? "Log another meal" : "Plan meals"}
        </Link>
        <Link className="text-link" href="/explore">
          Explore why foods matter
        </Link>
        <Link className="text-link" href="/progress">
          Review my progress
        </Link>
      </div></details>
    </section>
  );
}
