import CompanionHero from "./CompanionHero";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { PrecisionReport } from "@shared/precision-nutrition";
import { todayContextAction } from "@shared/today-focus";
import { useExperienceRecords } from "@/lib/experience";
export default function TodayFocus({ now,mealCount = 0, missingNutritionCount = 0, loading = false, journalError = false }: { now?:Date;mealCount?: number; missingNutritionCount?: number; loading?: boolean; journalError?: boolean }) {
  const report = useQuery<PrecisionReport>({ queryKey: ["/api/precision"] }),
    goal = report.fetchStatus === "idle" && !report.isError ? report.data?.goals.find((g) => g.id !== "unmapped") : undefined;
  const sessions = useExperienceRecords("session");
  const action = todayContextAction({ now,mealCount, missingNutritionCount, loading, unavailable: journalError, goal, sessions: sessions.fetchStatus === "idle" && !sessions.isError ? sessions.data?.flatMap(r => r.kind === "session" ? [r.payload] : []) : undefined });
  const sessionAction = action.href === '/athlete/fueling';
  return (
    <CompanionHero title={loading ? 'Make space for today' : journalError ? 'Keep a place for your day' : !mealCount ? 'Start with a meal' : missingNutritionCount ? 'A clearer food picture' : sessionAction ? 'Fuel your planned session' : 'One good next step'} eyebrow="A LITTLE CARE, EVERY DAY" reason={action.reason} actions={<><Link className="hero-button" href={action.href}>{action.label}</Link><Link className="text-link" href="/precision?tab=overview&edit=goals">Adjust</Link></>}>
      {report.error && (
        <p role="alert" className="panel-note">
          Your saved focus could not load. This general routine suggestion
          remains available; retry My biology to review your saved goals.
        </p>
      )}
      {sessions.isError && <p className="panel-note">Training schedule unavailable. This action uses your journal and saved focus only.</p>}
      <details className="today-focus-evidence"><summary>Why this?</summary>
      {goal && <h3>{goal.mapping}</h3>}
      <p className="panel-note">{goal?.actions[0] || "This step uses your food journal and available saved context. Unlogged intake does not establish a nutrient deficit."}</p>
      {goal && <div className="space-y-2">{report.data?.sources.filter(s => goal.sourceIds.includes(s.id)).map(s => <p key={s.id} className="panel-note"><a className="text-link" href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> — {s.limitation}</p>)}</div>}
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
    </CompanionHero>
  );
}
