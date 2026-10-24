import {quantityFromCanonical,quantityToCanonical} from "@shared/display-units";
import { recipeDisplayName } from "@/lib/recipe-display";
import { useExperience } from "@/lib/experience";
import { energyAmount, foodMass, nutrientDisplay } from "@shared/nutrition-display";
import { recipePreparation } from "@shared/recipe-preparation";
import MetaboliteResearch from "./MetaboliteResearch";
import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import type {
  WeeklyPlan,
  WeeklyRequest,
  PlanningRecipe,
  PlannedMeal,
} from "@shared/weekly-planner";
import type { PrecisionRecord } from "@shared/precision-nutrition";
const defaults: WeeklyRequest = {
  name: "My weekly plan",
  days: 7,
  householdServings: 1,
  targets: {
    calories: 2200,
    protein: 100,
    fiber: 30,
    fiberMaximum: 45,
    sodium: 2300,
    saturatedFat: 20,
  },
  customRecipes: [],
  nutrientTargets: {},
  locked: {},
};
const targetFields = [
  ["calories", "Energy (kcal)", 1200, 4500],
  ["protein", "Protein minimum (g)", 40, 250],
  ["fiber", "Fiber minimum (g)", 10, 60],
  ["fiberMaximum", "Fiber maximum (g)", 15, 80],
  ["sodium", "Sodium maximum (mg)", 1000, 4000],
  ["saturatedFat", "Saturated fat maximum (g)", 5, 40],
] as const;
const rounded = (v: number | null | undefined) =>
  v == null ? "Unavailable" : Math.round(v * 10) / 10;
export default function WeeklyPlanner() {
  const { settings } = useExperience();
  const units = settings.displayUnits;
  const [request, setRequest] = useState<WeeklyRequest>(defaults);
  const [display, setDisplay] = useState<WeeklyPlan | null>(null);
  const [message, setMessage] = useState("");
  const [aiConsent, setAIConsent] = useState(false),
    [recipeRequest, setRecipeRequest] = useState("");
  const saved = useQuery<PrecisionRecord[]>({
    queryKey: ["/api/precision/weekly-plans"],
  });
  const menu = useQuery<{
    recipes: PlanningRecipe[];
    unknownAllergies: string[];
  }>({ queryKey: ["/api/precision/planning-recipes"] });
  const providers = useQuery<any>({ queryKey: ["/api/analysis/status"] });
  const build = useMutation({
    mutationFn: async (r: WeeklyRequest) =>
      (
        await apiRequest("POST", "/api/precision/weekly-plans/preview", r)
      ).json() as Promise<WeeklyPlan>,
    onSuccess: (p) => {
      setDisplay(p);
      setRequest(p.request);
      setMessage(
        "Plan recalculated. Review each day’s target checks before saving.",
      );
    },
  });
  const save = useMutation({
    mutationFn: async () =>
      (
        await apiRequest(
          "POST",
          "/api/precision/weekly-plans/save",
          display!.request,
        )
      ).json(),
    onSuccess: () => {
      setMessage(
        "Weekly plan saved to your account. You can link response check-ins in Precision nutrition.",
      );
      queryClient.invalidateQueries({
        queryKey: ["/api/precision/weekly-plans"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/precision"] });
    },
  });
  const ideas = useMutation({
    mutationFn: async () =>
      (
        await apiRequest("POST", "/api/precision/recipe-ideas", {
          aiConsent,
          instruction: recipeRequest,
        })
      ).json(),
    onSuccess: (r) => {
      setRequest((current) => ({
        ...current,
        customRecipes: r.recipes,
        locked: {},
      }));
      setMessage(r.note + " Generate a new weekly plan to include them.");
    },
  });
  const busy = build.isPending || save.isPending || ideas.isPending;
  const log = useMutation({
    mutationFn: async (m: PlannedMeal) =>
      (
        await apiRequest("POST", "/api/meals", {
          mealText: m.recipe.ingredients
            .map(
              (i) =>
                `${Math.round(i.grams * m.portion)} g ${i.name.replaceAll(",", " ")}`,
            )
            .join(", "),
          mealType: m.slot,
          aiConsent: false,
        })
      ).json(),
    onSuccess: () => {
      setMessage("Meal logged with source-backed nutrient estimates.");
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/precision"] });
    },
  });
  function swap(day: number, slot: string, recipeId: string, portion: number) {
    if (!display) return;
    const locked: WeeklyRequest["locked"] = {};
    for (const d of display.days)
      for (const m of d.meals)
        locked[`d${d.day - 1}-${m.slot}`] = {
          recipeId: m.recipeId,
          portion: m.portion,
        };
    locked[`d${day - 1}-${slot}`] = { recipeId, portion };
    build.mutate({ ...display.request, locked });
  }
  return (
    <section className="space-y-5" aria-labelledby="weekly-title">
      <div className="bloom-panel space-y-4">
        <p className="eyebrow">BIOLOGY-INFORMED PLANNING</p>
        <h2 id="weekly-title">Build a balanced week</h2>
        <p>
          Connect your saved biology, preferences and nutrient targets to
          complete recipes. Meal combinations are checked against your targets;
          microbial pathway explanations remain hypotheses.
        </p>
        <Link href="/precision" className="text-link">
          Set up genetics, bloodwork, allergies & health context →
        </Link>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setMessage("");
            build.mutate({ ...request, locked: {} });
          }}
        >
          <label className="block">
            Plan name
            <input
              className="bloom-input w-full"
              value={request.name}
              maxLength={100}
              required
              onChange={(e) => setRequest({ ...request, name: e.target.value })}
            />
          </label>
          <p className="panel-note">
            Starting values are editable examples, not calculated personal
            requirements. Confirm suitable targets with your nutrition
            professional where needed. Automated planning currently requires a
            reviewed adult profile and does not provide condition-specific diets
            or medication interaction screening.
          </p>
          <p className="panel-note">Energy entry, plan estimates and shopping quantities use your saved display units. Other targets use the nutrient units shown.</p>
          <div className="precision-grid">
            {targetFields.map(([key, label, min, max]) => (
              <label className="block" key={key}>
                {key === "calories" ? `Energy (${settings.displayUnits.energy})` : label}
                <input
                  type="number"
                  className="bloom-input w-full"
                  required
                  step="any"
                  min={key === "calories" ? quantityFromCanonical("energy", min, settings.displayUnits.energy) : min}
                  max={key === "calories" ? quantityFromCanonical("energy", max, settings.displayUnits.energy) : max}
                  value={key === "calories" ? quantityFromCanonical("energy", request.targets[key], settings.displayUnits.energy) : request.targets[key]}
                  onChange={(e) =>
                    setRequest({
                      ...request,
                      targets: {
                        ...request.targets,
                        [key]: key === "calories" ? quantityToCanonical("energy", Number(e.target.value), settings.displayUnits.energy) : Number(e.target.value),
                      },
                    })
                  }
                />
              </label>
            ))}
          </div>
          <details>
            <summary>Additional nutrient targets (optional)</summary>
            <p className="panel-note">
              Set only requirements relevant to your plan. These are
              user-entered constraints; the app does not derive personal
              micronutrient requirements from genetics.
            </p>
            {[
              ["vitamin_b12_ug", "Vitamin B12 (µg)"],
              ["vitamin_d_ug", "Vitamin D (µg)"],
              ["calcium_mg", "Calcium (mg)"],
              ["iron_mg", "Iron (mg)"],
              ["folate_ug", "Folate (µg)"],
              ["magnesium_mg", "Magnesium (mg)"],
              ["potassium_mg", "Potassium (mg)"],
            ].map(([key, label]) => (
              <label className="block" key={key}>
                {label} minimum
                <input
                  type="number"
                  className="bloom-input w-full"
                  min={0}
                  max={100000}
                  value={request.nutrientTargets[key]?.min ?? ""}
                  placeholder="Not constrained"
                  onChange={(e) => {
                    const nutrientTargets = { ...request.nutrientTargets };
                    if (e.target.value === "") delete nutrientTargets[key];
                    else
                      nutrientTargets[key] = {
                        min: Number(e.target.value),
                        max: null,
                      };
                    setRequest({ ...request, nutrientTargets });
                  }}
                />
              </label>
            ))}
          </details>
          <div className="precision-grid">
            <label>
              Days
              <input
                type="number"
                className="bloom-input w-full"
                min={1}
                max={7}
                required
                value={request.days}
                onChange={(e) =>
                  setRequest({ ...request, days: Number(e.target.value) })
                }
              />
            </label>
            <label>
              Household servings
              <input
                type="number"
                className="bloom-input w-full"
                min={1}
                max={8}
                required
                value={request.householdServings}
                onChange={(e) =>
                  setRequest({
                    ...request,
                    householdServings: Number(e.target.value),
                  })
                }
              />
            </label>
          </div>
          <Button disabled={busy}>
            {build.isPending ? "Balancing meals…" : "Generate a weekly plan"}
          </Button>
        </form>
        <details>
          <summary>Optional AI recipe ideas</summary>
          <p>
            Generate new ingredient combinations from the sourced catalogue.
            Nutrition and safety checks remain enforced by the planner.
          </p>
          <label className="block">
            What would you like?
            <input
              className="bloom-input w-full"
              maxLength={500}
              value={recipeRequest}
              onChange={(e) => setRecipeRequest(e.target.value)}
              placeholder="Warm breakfasts and simple soups"
            />
          </label>
          <label className="block">
            <input
              type="checkbox"
              checked={aiConsent}
              onChange={(e) => setAIConsent(e.target.checked)}
            />{" "}
            Send my food preferences, allergy exclusions and recipe request to
            the configured AI provider. Genetic calls and blood results are not
            sent.
          </label>
          <Button
            variant="outline"
            disabled={busy || !aiConsent || !providers.data?.ai.configured}
            onClick={() => ideas.mutate()}
          >
            {ideas.isPending
              ? "Creating recipe ideas…"
              : "Generate additional recipe ideas"}
          </Button>
          {!providers.data?.ai.configured && (
            <p className="panel-note">
              Requires a configured AI provider key and model. Structured
              recipes work without it.
            </p>
          )}
          {ideas.isError && <p role="alert">{ideas.error.message}</p>}
          {request.customRecipes.length > 0 && (
            <p>
              {request.customRecipes.length} additional combinations ready for
              your next plan.
            </p>
          )}
        </details>
        {providers.data && (
          <details>
            <summary>Analysis connections</summary>
            <ul className="list-disc pl-5">
              <li>
                AI parsing and prioritization:{" "}
                {providers.data.ai.configured
                  ? "configured; live provider response not verified"
                  : "not configured"}
              </li>
              <li>
                Live nutrition lookup:{" "}
                {providers.data.nutrition.liveLookupConfigured
                  ? "configured"
                  : "not configured"}
                . Sourced offline planning catalogue is available.
              </li>
              <li>
                Microbial flux simulation: not implemented. The network supplies
                cited mechanisms.
              </li>
            </ul>
          </details>
        )}
        {providers.isError && (
          <p role="alert">Provider status could not load.</p>
        )}
        {message && <p role="status">{message}</p>}
        {(build.isError || save.isError) && (
          <p role="alert">{build.error?.message || save.error?.message}</p>
        )}
        {log.isError && <p role="alert">{log.error.message}</p>}
      </div>

      {display && (
        <>
          <section className="bloom-panel space-y-3">
            <h2>{display.name}</h2>
            <p role="status">
              {display.status === "feasible"
                ? "All planned days meet your specified nutrient checks."
                : display.status === "blocked"
                  ? "Your profile needs review before automated planning."
                  : "Some targets could not be met. Restrictions were preserved."}
            </p>
            {display.blocks.map((b) => (
              <p key={b}>{b}</p>
            ))}
            <p className="panel-note">
              {display.catalogue.eligibleRecipes} eligible recipes from{" "}
              {display.catalogue.foods} sourced ingredients. Energy may vary
              within 10% of your target. No nutrient is silently filled with
              zero.
            </p>
            <Button
              disabled={busy || !display.checksPassed}
              onClick={() => save.mutate()}
            >
              {save.isPending ? "Saving…" : "Save this checked plan"}
            </Button>
            {display.limitations.map((l) => (
              <p className="panel-note" key={l}>
                {l}
              </p>
            ))}
          </section>
          <section className="bloom-panel space-y-3">
            <h2>Why this plan for you?</h2>
            <p>
              Laboratory flags provide context for food-pattern priorities; they
              are not diagnoses. Genetics adds secondary pathway context and
              does not prescribe a supplement or a nutrient limit.
            </p>
            {display.biologicalEvidence.labPriorities.length ? (
              display.biologicalEvidence.labPriorities.map((l) => (
                <p key={l.id}>
                  {l.marker}: {l.value} {l.unit} · {l.flag} ·{" "}
                  {l.date.slice(0, 10)}
                </p>
              ))
            ) : (
              <p>
                No recent flagged laboratory measurements were available. Your
                targets and preferences still guide planning.
              </p>
            )}
            {display.biologicalEvidence.geneticContext.map((g) => (
              <details key={g.rsid}>
                <summary>
                  {g.rsid} · {g.pathway}
                </summary>
                <p>{g.interpretation}</p>
                <p className="panel-note">{g.limitation}</p>
              </details>
            ))}
            {display.biologicalEvidence.pathwayContext.map((p) => (
              <details key={p.id}>
                <summary>
                  {p.substrate} → {p.molecules.join(", ")}
                </summary>
                <p>{p.interpretation}</p>
                <p>
                  Report matches:{" "}
                  {p.reportedParticipants
                    .map((t) => `${t.name} (${t.abundance}%)`)
                    .join(", ") || "None available; absence is not inferred."}
                </p>
                {display.biologicalEvidence.network.sources
                  .filter((s) => p.sourceIds.includes(s.id))
                  .map((s) => (
                    <p key={s.id}>
                      <a
                        className="text-link"
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {s.title}
                      </a>
                    </p>
                  ))}
              </details>
            ))}
          </section>
          {display.days.map((d) => (
            <details
              className="bloom-panel space-y-4"
              key={d.day}
              open={d.day === 1}
            >
              <summary>
                Day {d.day} · {energyAmount(d.nutrients.calories, units.energy)} {units.energy} ·{" "}
                {rounded(d.nutrients.protein_g)} g protein ·{" "}
                {d.checks.every((c) => c.passed)
                  ? "targets met"
                  : "review targets"}
              </summary>
              <ul className="list-disc pl-5">
                {d.checks.map((c) => {
                  const unit = c.key === "calories" ? "kcal" : "";
                  const value = nutrientDisplay(c.key, c.value, unit, units);
                  const min = nutrientDisplay(c.key, c.min, unit, units);
                  const max = nutrientDisplay(c.key, c.max, unit, units);
                  return (
                  <li key={c.key}>
                    {c.passed ? "✓" : "Needs review"} {c.label}{c.key === "calories" ? ` (${units.energy})` : ""}:{" "}
                    {rounded(value.amount)}
                    {min.amount !== null ? ` (minimum ${rounded(min.amount)})` : ""}
                    {max.amount !== null ? ` (maximum ${rounded(max.amount)})` : ""}
                  </li>
                  );
                })}
              </ul>
              {d.meals.map((m) => (
                <article
                  className="rounded-xl border p-4 space-y-3 min-w-0"
                  key={m.slot}
                >
                  <p className="eyebrow">{m.slot}</p>
                  <h3>{recipeDisplayName(m.recipe.name)}</h3>
                  <p>
                    {energyAmount(m.nutrients.calories, units.energy)} {units.energy} ·{" "}
                    {rounded(m.nutrients.protein_g)} g protein · {m.portion} ×
                    base portion
                  </p>
                  <details>
                    <summary>Ingredients, recipe & evidence</summary>
                    <ul className="list-disc pl-5">
                      {recipePreparation(m.recipe).shopping.map((i) => (
                        <li key={i.name}>
                          {i.estimated ? "Approximately " : ""}
                          {foodMass(i.grams * m.portion, units.foodWeight)} {i.name}
                        </li>
                      ))}
                    </ul>
                    <ol className="list-decimal pl-5">
                      {[
                        ...recipePreparation(m.recipe).instructions,
                        ...m.recipe.steps,
                      ].map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                    <p className="panel-note">
                      {recipePreparation(m.recipe).note}
                    </p>
                    <a
                      className="text-link"
                      href={recipePreparation(m.recipe).source}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Cooking safety
                    </a>
                  </details>
                  <details>
                    <summary>
                      Why this meal suits you & nutrient details
                    </summary>
                    {m.reasons.map((r) => (
                      <p key={r}>{r}</p>
                    ))}
                    {m.pathways.map((p) => (
                      <p key={p.id}>
                        {p.substrate} → {p.molecules.join(", ")}.{" "}
                        {p.relationship}
                      </p>
                    ))}
                    <dl>
                      {display.nutrientDefinitions.map((n) => {
                        const value = nutrientDisplay(n.key, m.nutrients[n.key], n.unit, units);
                        return (
                        <div className="flex justify-between gap-3" key={n.key}>
                          <dt>{n.name}</dt>
                          <dd>
                            {rounded(value.amount)}{" "}
                            {value.amount === null ? "" : value.unit}
                          </dd>
                        </div>
                        );
                })}
                    </dl>
                  </details>
                  <label className="block">
                    Swap meal
                    <select
                      className="bloom-input w-full max-w-full"
                      aria-label={`Day ${d.day} ${m.slot} recipe`}
                      value={m.recipeId}
                      disabled={busy || !menu.data}
                      onChange={(e) =>
                        swap(d.day, m.slot, e.target.value, m.portion)
                      }
                    >
                      {[
                        ...(menu.data?.recipes || []),
                        ...(m.recipeId.startsWith("custom-") ? [m.recipe] : []),
                      ]
                        .filter((r) => r.mealType === m.recipe.mealType)
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label className="block">
                    Portion
                    <select
                      className="bloom-input"
                      aria-label={`Day ${d.day} ${m.slot} portion`}
                      value={m.portion}
                      disabled={busy}
                      onChange={(e) =>
                        swap(d.day, m.slot, m.recipeId, Number(e.target.value))
                      }
                    >
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((p) => (
                        <option key={p} value={p}>
                          {p} ×
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button
                    variant="outline"
                    disabled={log.isPending}
                    onClick={() => log.mutate(m)}
                  >
                    Log this meal as eaten now
                  </Button>
                </article>
              ))}
            </details>
          ))}
          {display.shoppingList.length > 0 && (
            <section className="bloom-panel space-y-3">
              <h2>Shopping & preparation list</h2>
              <p>
                For {display.request.householdServings} equal servings per meal.
                Amounts are edible cooked/prepared weights where stated; raw
                purchase weights and prices are not inferred.
              </p>
              <ul className="list-disc pl-5">
                {display.shoppingList.map((i) => (
                  <li key={i.foodId}>
                    {foodMass(i.grams, units.foodWeight)} {i.name} ·{" "}
                    <a
                      className="underline"
                      href={i.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      composition source
                    </a>
                  </li>
                ))}
              </ul>
              <Button variant="outline" onClick={() => window.print()}>
                Print plan & shopping list
              </Button>
            </section>
          )}
        </>
      )}
      <section className="bloom-panel space-y-3">
        <h2>Saved weekly plans</h2>
        {saved.isLoading && <p role="status">Loading saved plans…</p>}
        {saved.isError && <p role="alert">Saved plans could not load.</p>}
        {saved.data?.length === 0 && <p>Your saved plans will appear here.</p>}
        {saved.data?.map((p) => (
          <div className="flex flex-wrap gap-3 items-center" key={p.id}>
            <span>
              {(p.payload as WeeklyPlan).name} ·{" "}
              {new Date(p.createdAt).toLocaleDateString()}
            </span>
            <Button
              variant="outline"
              onClick={() => {
                setDisplay(p.payload as WeeklyPlan);
                setRequest((p.payload as WeeklyPlan).request);
                setMessage(
                  "Saved snapshot loaded. Rebuild before following it if your health, goals or preferences have changed.",
                );
              }}
            >
              Open saved plan
            </Button>
          </div>
        ))}
        <Link href="/precision" className="text-link">
          Track adherence, symptoms and repeat measurements →
        </Link>
      </section>
    </section>
  );
}
