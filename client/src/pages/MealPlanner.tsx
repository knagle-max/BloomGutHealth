import {invalidatePlanningInputs} from "@/lib/planning-cache";
import { recipeDisplayName } from "@/lib/recipe-display";
import { useExperience } from "@/lib/experience";
import { foodMass } from "@shared/nutrition-display";
import { recipePreparation } from "@shared/recipe-preparation";
import TodayPlanner from "@/components/TodayPlanner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { goals, pathways, evidenceSources } from "@shared/science-coach";
import {
  defaultPreferences,
  cohortResearch,
  type DietaryPreferences,
  type Recipe,
  type MealIntelligence,
} from "@shared/meal-intelligence";
import MealAnalysis from "@/components/MealAnalysis";
import WeeklyPlanner from "@/components/WeeklyPlanner";
export function DietaryPreferenceEditor() {
  const saved = useQuery<DietaryPreferences>({
    queryKey: ["/api/preferences"],
  });
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [dislikes, setDislikes] = useState("");
  const [extraGoals, setExtraGoals] = useState("");
  useEffect(() => {
    if (saved.data) {
      setPreferences(saved.data);
      setDislikes(saved.data.dislikes.join(", "));
      setExtraGoals(
        saved.data.goals
          .filter((g) => !goals.some((known) => known.id === g))
          .join(", "),
      );
    }
  }, [saved.data]);
  const save = useMutation({
    mutationFn: async () => {
      const body = {
        ...preferences,
        goals: [
          ...preferences.goals.filter((g) =>
            goals.some((known) => known.id === g),
          ),
          ...extraGoals
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean),
        ],
        dislikes: dislikes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      return (await apiRequest("PUT", "/api/preferences", body)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
      return invalidatePlanningInputs();
    },
  });
  if (saved.isLoading) return <p role="status">Loading saved preferences…</p>;
  if (saved.isError)
    return (
      <p role="alert">
        Preferences could not load.{" "}
        <Button onClick={() => saved.refetch()}>Retry</Button>
      </p>
    );
  return (
    <form
      className="bloom-panel space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <h2>Your food preferences & goals</h2>
      <label className="block">
        Foods you dislike (comma separated)
        <input
          className="bloom-input w-full"
          value={dislikes}
          maxLength={1800}
          onChange={(e) => setDislikes(e.target.value)}
          placeholder="Seafood, mushrooms, olives"
        />
      </label>
      <p className="panel-note">
        Use the seafood exclusion below to exclude the entire category. Dislikes
        also filter matching ingredient names.
      </p>
      <label className="block">
        Dietary pattern
        <select
          className="bloom-input w-full"
          value={preferences.dietaryPattern}
          onChange={(e) =>
            setPreferences({
              ...preferences,
              dietaryPattern: e.target.value as any,
            })
          }
        >
          <option value="omnivore">Omnivore</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
        </select>
      </label>
      <fieldset>
        <legend>Exclude ingredients</legend>
        <div className="flex flex-wrap gap-3">
          {[
            "seafood",
            "dairy",
            "gluten",
            "legumes",
            "alliums",
            "fermented",
            "nuts",
            "eggs",
            "soy",
            "meat",
          ].map((tag) => (
            <label key={tag}>
              <input
                type="checkbox"
                checked={preferences.exclusions.includes(tag as any)}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    exclusions: e.target.checked
                      ? [...preferences.exclusions, tag as any]
                      : preferences.exclusions.filter((t) => t !== tag),
                  })
                }
              />{" "}
              {tag}
            </label>
          ))}
        </div>
        <p className="panel-note">
          Recipe filters are not allergen certification. Verify product labels,
          ingredients and cross-contact.
        </p>
      </fieldset>
      <label className="block">
        Additional goals (comma separated)
        <input
          className="bloom-input w-full"
          maxLength={1000}
          value={extraGoals}
          onChange={(e) => setExtraGoals(e.target.value)}
          placeholder="Improve meal variety, support glucose control"
        />
      </label>
      <p className="panel-note">
        Liver health, muscle-building and healthy-aging goals now inform
        food-pattern matching. Unknown goals stay saved without a treatment
        claim.
      </p>
      <fieldset>
        <legend>Goals</legend>
        <div className="flex flex-wrap gap-3">
          {goals.map((g) => (
            <label key={g.id}>
              <input
                type="checkbox"
                checked={preferences.goals.includes(g.id)}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    goals: e.target.checked
                      ? [...preferences.goals, g.id]
                      : preferences.goals.filter((id) => id !== g.id),
                  })
                }
              />{" "}
              {g.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <input
          type="checkbox"
          checked={preferences.sensitiveGut}
          onChange={(e) =>
            setPreferences({ ...preferences, sensitiveGut: e.target.checked })
          }
        />{" "}
        Sensitive gut: omit initial legume, allium and fermented-food recipes
      </label>
      <label className="block">
        Maximum cooking minutes
        <input
          className="bloom-input"
          type="number"
          min="5"
          max="180"
          value={preferences.cookingMinutes}
          onChange={(e) =>
            setPreferences({
              ...preferences,
              cookingMinutes: Number(e.target.value),
            })
          }
        />
      </label>
      <label className="block">
        Preferred cuisines / context
        <input
          className="bloom-input w-full"
          maxLength={300}
          value={preferences.cuisines}
          onChange={(e) =>
            setPreferences({ ...preferences, cuisines: e.target.value })
          }
        />
      </label>
      <p className="panel-note">
        Cuisine context is used for optional AI recipe ideas. Ingredient,
        pattern and time restrictions are checked independently of the AI.
      </p>
      <Button
        disabled={
          save.isPending || (!preferences.goals.length && !extraGoals.trim())
        }
      >
        {save.isPending ? "Saving…" : "Save preferences"}
      </Button>
      {save.isSuccess && (
        <p role="status">Preferences saved to your account.</p>
      )}
      <p className="panel-note">
        Diet, exclusions, dislikes, cooking time and sensitive-gut choices
        filter recipes. Microbiome and supported health goals influence ranking.
        Cuisine notes guide optional AI recipe suggestions after consent; local
        matching does not interpret arbitrary cuisine text.
      </p>
      {save.isError && <p role="alert">{save.error.message}</p>}
    </form>
  );
}
interface Plan {
  preferences: DietaryPreferences;
  suggestions: Array<
    Recipe & { matchedGoals: string[]; alreadyMentioned: boolean }
  >;
  pathways: typeof pathways;
  sources: typeof evidenceSources;
  cohorts: typeof cohortResearch;
  note: string;
  recentMeals: number;
}
export default function MealPlanner() {
  const { settings } = useExperience();
  const plan = useQuery<Plan>({ queryKey: ["/api/meal-planner"] });
  const currentPlan = !plan.isError && !plan.isFetching ? plan.data : undefined;
  const progress = useQuery<any>({ queryKey: ["/api/meal-planner/progress"] });
  const [selected, setSelected] = useState<string | null>(null);
  const [aiConsent, setConsent] = useState(false);
  const aiStatus=useQuery<{ai:{features?:{ingredientParsing:boolean;recipeRanking:boolean}}}>({queryKey:["/api/analysis/status"]});
  const analyze = useMutation({
    mutationFn: async (recipe: Recipe) =>
      (await (
        await apiRequest("POST", "/api/meals/analyze", {
          mealText: recipe.ingredients
            .map((i) => `${i.grams} g ${i.name.replaceAll(",", " ")}`)
            .join(", "),
          aiConsent,
        })
      ).json()) as { intelligence: MealIntelligence },
  });
  const [editingPreferences, setEditing] = useState(new URLSearchParams(window.location.search).get("preferences") === "1");
  const prioritize = useMutation({
    mutationFn: async () =>
      (
        await apiRequest("POST", "/api/meal-planner/prioritize", { aiConsent })
      ).json(),
    onSuccess: (result) => {
      queryClient.setQueryData<Plan>(["/api/meal-planner"], (current) =>
        current ? { ...current, suggestions: result.suggestions } : current,
      );
    },
  });
  return (
    <main className="science-page space-y-5">
      <div className="science-heading">
        <p className="eyebrow">PERSONALIZED MEAL PLANNING</p>
        <h1>Meal plans</h1>
        <p>
          Find your next meal, plan your week, or explore recipes that fit your preferences.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className="text-link" href="/insights">
            Evidence coach
          </Link>
          <Link className="text-link" href="/health-insights">
            Health, adherence & model trends
          </Link>
          <Link className="text-link" href="/profile">
            Profile
          </Link>
        </div>
      </div>
      <Button variant="outline" onClick={() => setEditing(!editingPreferences)}>
        {editingPreferences ? "Close preferences" : "Edit saved preferences"}
      </Button>
      {editingPreferences && <DietaryPreferenceEditor />}
      <Tabs defaultValue="today" className="workspace-tabs">
        <TabsList aria-label="Meal planning views"><TabsTrigger value="today">Rest of today</TabsTrigger><TabsTrigger value="week">Weekly plan</TabsTrigger><TabsTrigger value="recipes">Recipe library</TabsTrigger></TabsList>
        <TabsContent value="today" forceMount><TodayPlanner onEditPreferences={() => setEditing(true)} /></TabsContent>
        <TabsContent value="week" forceMount><WeeklyPlanner /></TabsContent>
        <TabsContent value="recipes" forceMount>
      {plan.isFetching && <p role="status">Checking recipes against your current preferences…</p>}
      {plan.isError && (
        <p role="alert">
          {plan.error.message}{" "}
          <Button disabled={plan.isFetching} onClick={() => plan.refetch()}>Retry</Button>
        </p>
      )}
      {currentPlan && (
        <>
          <p className="panel-note">
            {currentPlan.note} Based on {currentPlan.recentMeals} meals in the last
            14 days.
          </p>
          {aiStatus.data?.ai?.features?.recipeRanking && <>
          <label className="block text-sm">
            <input
              type="checkbox"
              checked={aiConsent}
              onChange={(e) => setConsent(e.target.checked)}
            />{" "}
            Use optional AI for recipe prioritization and ingredient parsing.
            Sends recipe text and saved preferences to the configured AI
            provider; off by default.
          </label>
          </>}
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={prioritize.isPending}
              onClick={() => prioritize.mutate()}
            >
              {prioritize.isPending
                ? "Prioritizing…"
                : "Prioritize meals for my preferences"}
            </Button>
            {prioritize.data && (
              <p role="status" className="panel-note">
                {prioritize.data.aiStatus}
              </p>
            )}
            {prioritize.isError && (
              <p role="alert">{prioritize.error.message}</p>
            )}
          </div>
          {!currentPlan.suggestions.length && (
            <section className="bloom-panel">
              <h2>No supported recipes fit these choices yet.</h2>
              <p>
                Adjust your preferences or select a supported food-intervention
                goal. Liver health, muscle and healthy-aging goals have
                dietary-pattern mappings; specialized medical diets may require
                review.
              </p>
            </section>
          )}
          {currentPlan.suggestions.map((r) => (
            <article key={r.id} className="bloom-panel space-y-3">
              <h2>{recipeDisplayName(r.name)}</h2>
              <p className="panel-note">
                {recipePreparation(r).minutes} minutes ·{" "}
                {r.matchedGoals.join(", ")} ·{" "}
                {r.alreadyMentioned
                  ? "Familiar ingredients in journal"
                  : "An option to explore"}
              </p>
              <p>{r.rationale}</p>
              <details>
                <summary>Ingredients, recipe & evidence</summary>
                <ul className="list-disc pl-5">
                  {recipePreparation(r).shopping.map((i) => (
                    <li key={i.name}>
                      {i.estimated ? "Approximately " : ""}
                      {foodMass(i.grams, settings.displayUnits.foodWeight)} {i.name}
                    </li>
                  ))}
                </ul>
                <ol className="list-decimal pl-5">
                  {[...recipePreparation(r).instructions, ...r.steps].map(
                    (s, i) => (
                      <li key={i}>{s}</li>
                    ),
                  )}
                </ol>
                <p className="panel-note">{recipePreparation(r).note}</p>
                <a
                  className="text-link"
                  href={recipePreparation(r).source}
                  target="_blank"
                  rel="noreferrer"
                >
                  Cooking safety
                </a>
              </details>
              {plan
                .data!.pathways.filter((p) => r.pathwayIds.includes(p.id))
                .map((p) => (
                  <details key={p.id}>
                    <summary>
                      {p.substrate} → {p.molecules.join(", ")}
                    </summary>
                    <p>{p.microbialFunction}</p>
                    <p>{p.organisms.join("; ")}</p>
                    <p>{p.relationship}</p>
                    {plan
                      .data!.sources.filter((s) => p.sourceIds.includes(s.id))
                      .map((s) => (
                        <p key={s.id}>
                          <a
                            className="underline"
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {s.authors}, {s.year}
                          </a>{" "}
                          · {s.limitation}
                        </p>
                      ))}
                  </details>
                ))}
              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={analyze.isPending}
                  onClick={() => {
                    setSelected(r.id);
                    analyze.mutate(r);
                  }}
                >
                  Estimate macros & micronutrients
                </Button>
                <Link className="text-link" href={`/log-meal?recipe=${r.id}`}>
                  Use this meal in my journal
                </Link>
              </div>
              {selected === r.id && analyze.isPending && (
                <p role="status">Looking up food composition…</p>
              )}
              {selected === r.id && analyze.isError && (
                <p role="alert">{analyze.error.message}</p>
              )}
              {selected === r.id && analyze.data && (
                <MealAnalysis analysis={analyze.data.intelligence} />
              )}
            </article>
          ))}
          {currentPlan.cohorts.length > 0 && (
            <section className="bloom-panel">
              <h2>Research population comparison</h2>
              {currentPlan.cohorts.map((c) => (
                <article key={c.id} className="my-4">
                  <h3>{c.name}</h3>
                  <p>{c.finding}</p>
                  <p>{c.comparison}</p>
                  <p className="panel-note">{c.foodStatus}</p>
                  <a
                    className="underline"
                    href={
                      currentPlan!.sources.find((s) => s.id === c.sourceId)?.url
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read study
                  </a>
                </article>
              ))}
              <Link className="text-link" href="/microbiome">
                Compare report data and explore prototype cohorts
              </Link>
            </section>
          )}
        </>
      )}
        </TabsContent>
      </Tabs>
      <details className="bloom-panel workspace-disclosure">
        <summary>Your four-week journal progress</summary>
        {progress.isLoading ? (
          <p>Loading progress…</p>
        ) : progress.isError ? (
          <p role="alert">
            Progress unavailable.{" "}
            <Button onClick={() => progress.refetch()}>Retry</Button>
          </p>
        ) : (
          progress.data && (
            <>
              <p className="panel-note">{progress.data.note}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {progress.data.weeks.map((w: any) => (
                  <div className="border rounded-lg p-3" key={w.start}>
                    <h3>Week of {new Date(w.start).toLocaleDateString()}</h3>
                    <p>
                      {w.meals} meals · {w.nutritionAvailable} with calories
                    </p>
                    {w.symptoms.map((s: any) => (
                      <p className="text-sm" key={s.key}>
                        {s.key}:{" "}
                        {s.average === null
                          ? "Not recorded"
                          : `${s.average.toFixed(1)}/10 (${s.entries} entries)`}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
              <details className="mt-3">
                <summary>Possible recipe adherence matches</summary>
                {progress.data.adherence.map((a: any) => (
                  <p key={a.id}>
                    {a.name}: {a.possibleMatches} possible matches
                  </p>
                ))}
              </details>
            </>
          )
        )}
      </details>
    </main>
  );
}
