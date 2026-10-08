import ResearchSummary from "@/components/ResearchSummary";
import { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  dailyMealSummary,
  loggingHistory,
  type LoggedMeal,
} from "@/lib/dashboard-data";
import type { MicrobiomeSample } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [days, setDays] = useState(7);
  const meals = useQuery<LoggedMeal[]>({
    queryKey: ["/api/meals", user?.id],
    enabled: !!user,
  });
  const samples = useQuery<MicrobiomeSample[]>({
    queryKey: ["/api/microbiome/samples", user?.id],
    enabled: !!user,
  });
  const summary = dailyMealSummary(meals.data || []);
  const history = loggingHistory(meals.data || [], days);
  const activeDays = history.filter((day) => day.count > 0).length;
  const latestSample = [...(samples.data || [])].sort(
    (a, b) => +new Date(b.testDate) - +new Date(a.testDate),
  )[0];
  const date = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const mealError = meals.isError;

  return (
    <main className="bloom-dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">YOUR DAILY OVERVIEW</p>
          <h1>
            A little care. <span>A healthier you.</span>
          </h1>
          <p className="muted">
            Welcome back, {user?.username}. Let's make room for good habits.
          </p>
        </div>
        <span className="date-pill">
          <CalendarDays size={16} />
          {date}
        </span>
      </div>

      <section className="bloom-hero" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <span className="hero-tag">
            <Sprout size={15} /> SMALL STEPS, EVERY DAY
          </span>
          <h2 id="hero-heading">
            Good things
            <br />
            grow from within.
          </h2>
          <p>
            Your meals tell a story. Build a picture of your nutrition, one
            entry at a time.
          </p>
          <Link href="/log-meal" className="hero-button">
            Log a meal <Plus size={18} />
          </Link>
          <span className="hero-footnote">
            Your next step takes less than a minute.
          </span>
        </div>
        <div className="botanical" aria-hidden="true">
          <div className="botanical-orbit orbit-one" />
          <div className="botanical-orbit orbit-two" />
          <div className="plant-stem" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`plant-leaf leaf-${i}`} />
          ))}
          <div className="plant-seed" />
          <span className="botanical-caption">NOURISH · NOTICE · GROW</span>
        </div>
      </section>

      <div className="section-heading">
        <div>
          <p className="eyebrow">ONE DAY AT A TIME</p>
          <h2>Today, at a glance</h2>
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
              value: summary.fiber.toFixed(1),
              unit: "g",
              icon: Leaf,
              note: "From logged meals",
              color: "ochre",
            },
            {
              label: "Protein",
              value: summary.protein.toFixed(0),
              unit: "g",
              icon: Sprout,
              note: "From logged meals",
              color: "pink",
            },
            {
              label: "Energy",
              value: summary.calories.toFixed(0),
              unit: "kcal",
              icon: FlaskConical,
              note: "Estimated from your entries",
              color: "blue",
            },
          ].map((stat) => (
            <article className={`daily-card ${stat.color}`} key={stat.label}>
              <div className="stat-heading">
                <span>{stat.label}</span>
                <stat.icon size={18} />
              </div>
              {meals.isLoading ? (
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
          ) : meals.isLoading ? (
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
                  ? `Your latest test is from ${new Date(latestSample.testDate).toLocaleDateString()}. Explore your report and analysis status.`
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

      <section className="bloom-panel" aria-labelledby="meals-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">YOUR FOOD JOURNAL</p>
            <h2 id="meals-title">On the menu today</h2>
          </div>
          <Link href="/log-meal" className="text-link">
            <Plus size={16} /> Add meal
          </Link>
        </div>
        {mealError ? (
          <p className="panel-note">
            Meals are unavailable while the journal is disconnected.
          </p>
        ) : meals.isLoading ? (
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
                  {Math.round(meal.totalCalories || 0)} kcal
                </span>
                <ChevronRight size={17} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="journal-empty">
            <span className="meal-icon">
              <Utensils size={24} />
            </span>
            <div>
              <h3>A fresh page for today.</h3>
              <p>
                Add breakfast, lunch, dinner, or a snack. Your entries will
                appear here.
              </p>
            </div>
            <Link href="/log-meal" className="text-link">
              Start your journal <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>
      {summary.nutritionUnavailable > 0 && (
        <p className="panel-note">
          {summary.nutritionUnavailable} meal(s) need nutrition estimates.
          Totals include only available data.
        </p>
      )}
      <ResearchSummary />
      <footer className="dashboard-footer">
        <Leaf size={15} /> Bloom with intention. Your pace, your progress.
      </footer>
    </main>
  );
}
