import {reportDateText} from "@shared/report-dates";
import {useLocalClock} from "@/lib/use-local-clock";
import { energyAmount, formatNutrientAmount } from "@shared/nutrition-display";
import EverydayStart from "@/components/EverydayStart";
import { useExperience } from "@/lib/experience";
import TodayStatus from "@/components/TodayStatus";
import TodayFocus from "@/components/TodayFocus";
import ResearchSummary from "@/components/ResearchSummary";
import { useState,useRef,useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Leaf,
  Sprout,
  Utensils,
  FlaskConical,
  CalendarDays,
  ChevronRight,
  RefreshCw,
  Dna,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  dailyMealSummary,
  localDayKey,
  loggingHistory,
  type LoggedMeal,
} from "@/lib/dashboard-data";
import type { MicrobiomeSample } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const now=useLocalClock(),dayKey=localDayKey(now);
  const lastDay=useRef({userId:user?.id,dayKey});
  const { settings, hasSettings } = useExperience();
  const [days, setDays] = useState(7);
  const meals = useQuery<LoggedMeal[]>({
    queryKey: ["/api/meals", user?.id],
    enabled: !!user,
    staleTime:0,refetchOnMount:"always",refetchOnWindowFocus:true,
  });
  const samples = useQuery<MicrobiomeSample[]>({
    queryKey: ["/api/microbiome/samples", user?.id],
    enabled: !!user,
  });
  useEffect(()=>{
    const previous=lastDay.current;lastDay.current={userId:user?.id,dayKey};
    if(user&&previous.userId===user.id&&previous.dayKey!==dayKey&&localDayKey(new Date(meals.dataUpdatedAt))!==dayKey)void meals.refetch({cancelRefetch:false});
  },[dayKey,user?.id,meals.refetch]);
  useEffect(()=>{
    if(!user)return;
    const resume=()=>{if(document.visibilityState==="visible")void meals.refetch({cancelRefetch:false});};
    window.addEventListener("focus",resume);
    return()=>window.removeEventListener("focus",resume);
  },[user?.id,meals.refetch]);
  const checkingMeals=meals.isPending||meals.fetchStatus!=="idle";
  const summary = dailyMealSummary(meals.data || [],now);
  const history = loggingHistory(meals.data || [], days,now);
  const activeDays = history.filter((day) => day.count > 0).length;
  const latestSample = [...(samples.data || [])].sort(
    (a, b) => +new Date(b.testDate) - +new Date(a.testDate),
  )[0];
  const date = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const mealError = meals.isError;

  return (
    <main className="bloom-dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">A DAY AT YOUR PACE</p>
          <h1>
            Today
          </h1>
        </div>
        <span className="date-pill">
          <CalendarDays size={16} />
          {date}
        </span>
      </div>

      <TodayFocus now={now} mealCount={summary.meals.length} missingNutritionCount={summary.nutritionUnavailable} loading={checkingMeals} journalError={mealError} />
      <TodayStatus mealCount={summary.meals.length} partial={summary.nutritionUnavailable} loading={checkingMeals} unavailable={mealError} />
      {(checkingMeals || mealError || summary.meals.length > 0) && <>
      <details className="bloom-panel workspace-disclosure today-nutrition" open={mealError || undefined}>
      <summary>Nutrition so far</summary>
      <div className="section-heading">
        <div>
          <p className="eyebrow">FROM YOUR FOOD JOURNAL</p>
          <h2>Your nutrition today</h2>
        </div>
        <Link href="/nutrition" className="text-link">
          Nutrition journal <ArrowUpRight size={16} />
        </Link>
      </div>
      {mealError ? (
        <div role="alert" className="bloom-error">
          Your meal journal couldn't load.{" "}
          <Button variant="outline" onClick={() => meals.refetch()}>
            <RefreshCw size={14} className="mr-2" />
            Try again
          </Button>
        </div>
      ) : (
        <div className="daily-grid">
          {[
            {
              label: "Meals logged",
              value: summary.meals.length,
              unit: "entries",
              icon: Utensils,
              note: "A picture of your day",
              color: "green",
            },
            {
              label: "Dietary fiber",
              value: summary.fiber?.toFixed(1) ?? "—",
              unit: "g",
              icon: Leaf,
              note: summary.coverage.fiber.partial
                ? `Partial: ${summary.coverage.fiber.completeMeals} of ${summary.coverage.fiber.totalMeals} meals complete`
                : "From logged meals",
              color: "ochre",
            },
            {
              label: "Protein",
              value: summary.protein==null?"—":formatNutrientAmount(summary.protein),
              unit: "g",
              icon: Sprout,
              note: summary.coverage.protein.partial
                ? `Partial: ${summary.coverage.protein.completeMeals} of ${summary.coverage.protein.totalMeals} meals complete`
                : "From logged meals",
              color: "pink",
            },
            {
              label: "Energy",
              value: energyAmount(summary.calories, settings.displayUnits.energy),
              unit: settings.displayUnits.energy,
              icon: FlaskConical,
              note: summary.coverage.calories.partial
                ? `Partial: ${summary.coverage.calories.completeMeals} of ${summary.coverage.calories.totalMeals} meals complete`
                : "Estimated from your entries",
              color: "blue",
            },
          ].map((stat) => (
            <article className={`daily-card ${stat.color}`} key={stat.label}>
              <div className="stat-heading">
                <span>{stat.label}</span>
                <stat.icon size={18} />
              </div>
              {checkingMeals ? (
                <Skeleton className="h-10 w-24 my-3" />
              ) : (
                <p className="stat-value">
                  {stat.value} <span>{stat.unit}</span>
                </p>
              )}
              <p className="stat-note">{stat.note}</p>
            </article>
          ))}
        </div>
      )}

      </details>
      </>}

      {(checkingMeals || mealError || summary.meals.length > 0) && <section className="bloom-panel food-journal-panel" aria-labelledby="meals-title">
        <div className="panel-heading">
          <h2 id="meals-title">Food journal</h2>
          {(summary.meals.length > 0 || mealError) && <Link href="/log-meal" className="text-link journal-add-action">
            <Plus size={16} /> Add food
          </Link>}
        </div>
        {mealError ? (
          <p className="panel-note">
            Meals are unavailable while the journal is disconnected.
          </p>
        ) : checkingMeals ? (
          <Skeleton className="h-24 w-full mt-4" />
        ) : summary.meals.length ? (
          <div className="meal-list">
            {summary.meals.map((meal) => (
              <Link key={meal.id} href="/nutrition" className="meal-row">
                <span className="meal-icon">
                  <Utensils size={19} />
                </span>
                <div>
                  <p className="meal-type">
                    {meal.mealType || "Meal"} ·{" "}
                    {new Date(meal.loggedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <h3>{meal.mealText}</h3>
                </div>
                <span className="meal-calories">
                  {meal.totalCalories == null
                    ? "Unavailable"
                    : `${energyAmount(meal.totalCalories, settings.displayUnits.energy)} ${settings.displayUnits.energy}`}
                </span>
                <ChevronRight size={17} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="journal-empty">
            <img className="empty-journal-art" src="/brand/empty-journal-illustration.svg" width={160} height={100} alt="" />
            <div>
              <h3>No meals yet</h3>
            </div>
          </div>
        )}
      </section>}
      {hasSettings && !checkingMeals && !mealError && !(meals.data?.length) && settings.onboarding.status === "not-started" && <details className="bloom-panel workspace-disclosure"><summary>Optional starting preferences</summary><EverydayStart /></details>}
      <details className="bloom-panel workspace-disclosure"><summary>Explore your options</summary>
      <div className="workspace-shortcuts">
        {[
          { path: "/plan-day", title: "Plan what’s next", description: "Meals that fit the rest of your day", Icon: CalendarDays },
          { path: "/precision", title: "Connect your biology", description: "Genetics, lab results and your goals", Icon: Dna },
          { path: "/microbiome", title: "Understand your gut", description: "Your reports, explained simply", Icon: FlaskConical },
        ].map(({path, title, description, Icon}) => <Link href={path} className="workspace-shortcut" key={path}><Icon size={20} /><div><strong>{title}</strong><span>{description}</span></div><ChevronRight size={16} /></Link>)}
      </div>

      </details>
      <details className="bloom-panel workspace-disclosure"><summary>Logging history & gut reports</summary>
      <div className="dashboard-columns">
        <section className="bloom-panel" aria-labelledby="consistency-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">BUILD YOUR RHYTHM</p>
              <h2 id="consistency-title">Every entry counts</h2>
            </div>
            <div className="range-toggle" aria-label="Logging history range">
              {[7, 14].map((range) => (
                <button
                  key={range}
                  aria-pressed={days === range}
                  onClick={() => setDays(range)}
                >
                  {range} days
                </button>
              ))}
            </div>
          </div>
          {mealError ? (
            <p className="muted">
              History is unavailable. Retry your meal journal above.
            </p>
          ) : checkingMeals ? (
            <Skeleton className="h-40 w-full mt-6" />
          ) : (
            <>
              <p className="consistency-number">
                {activeDays}
                <span> / {days} days with a meal logged</span>
              </p>
              <div
                className="history-chart"
                aria-label={`Meal logging over the last ${days} days`}
              >
                {history.map((day) => (
                  <div className="history-day" key={day.date}>
                    <div className="bar-track">
                      <div
                        className="history-bar"
                        style={{
                          height: `${day.count ? Math.max(12, (day.count / Math.max(4, ...history.map((d) => d.count))) * 100) : 0}%`,
                        }}
                      />
                      <span className="bar-count">{day.count || "—"}</span>
                    </div>
                    <span>{day.label}</span>
                  </div>
                ))}
              </div>
              <p className="panel-note">
                {activeDays
                  ? "Consistency helps you understand your eating patterns. Unlogged days are not zero intake."
                  : "Your story starts here. Log your first meal to see your rhythm take shape."}
              </p>
            </>
          )}
        </section>
        <section
          className="bloom-panel microbiome-panel"
          aria-labelledby="microbiome-title"
        >
          <span className="panel-icon">
            <FlaskConical size={22} />
          </span>
          <p className="eyebrow">THE BIGGER PICTURE</p>
          <h2 id="microbiome-title">Meet your microbiome.</h2>
          {samples.isLoading ? (
            <Skeleton className="h-20 w-full my-4" />
          ) : samples.isError ? (
            <>
              <p>Your test history couldn't load.</p>
              <Button variant="outline" onClick={() => samples.refetch()}>
                Try again
              </Button>
            </>
          ) : (
            <>
              <p>
                {latestSample
                  ? `Report on file: ${reportDateText(latestSample)}. Explore your report and analysis status.`
                  : "Have a microbiome test? Keep your report alongside your food journal for a more complete picture."}
              </p>
              {latestSample && (
                <span className="sample-status">
                  Analysis: {latestSample.processingStatus}
                </span>
              )}
              <Link
                href={latestSample ? "/microbiome" : "/upload"}
                className="text-link"
              >
                {latestSample ? "Explore your results" : "Add a test report"}{" "}
                <ArrowRight size={17} />
              </Link>
            </>
          )}
          <p className="panel-note">
            Food logs track nutrition; they do not measure bacterial abundance
            or diagnose gut health.
          </p>
        </section>
      </div>

      </details>
      {summary.nutritionUnavailable > 0 && (
        <p className="panel-note">
          {summary.nutritionUnavailable} meal(s) need nutrition estimates.
          Totals include only available data.
        </p>
      )}
      <details className="bloom-panel workspace-disclosure"><summary>Explore the science behind Bloom</summary><ResearchSummary /></details>
      <footer className="dashboard-footer">
        <Leaf size={15} /> Bloom with intention. Your pace, your progress.
      </footer>
    </main>
  );
}
