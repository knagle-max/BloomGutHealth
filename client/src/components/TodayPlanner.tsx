import {useAuth} from '@/lib/auth';
import {todayMealSlots,type TodayMealChoices} from '@shared/today-planner';
import {quantityFromCanonical,quantityToCanonical} from "@shared/display-units";
import {useLocalClock} from '@/lib/use-local-clock';
import { useExperience } from "@/lib/experience";
import { foodMass, nutrientDisplay } from "@shared/nutrition-display";
import { recipeDisplayName } from "@/lib/recipe-display";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import type { TodayPlan } from "@shared/today-planner";
import type { WeeklyRequest } from "@shared/weekly-planner";
import { nutrientDefinitions } from "@shared/meal-intelligence";
import { recipePreparation } from "@shared/recipe-preparation";
const round = (v: number | null) =>
  v === null ? "Unknown" : Number(v.toFixed(1));
export default function TodayPlanner({ onEditPreferences }: { onEditPreferences?: () => void } = {}) {
  const {user}=useAuth();
  const { settings } = useExperience();
  const units = settings.displayUnits;
  const [editedState, setEditedState] = useState<{owner:string;plan:WeeklyRequest} | null>(null),
    [result, setResult] = useState<
      {scope:string;plan:TodayPlan & { targetSource: string }} | null
    >(null);
  const edited=editedState && editedState.owner===user?.id?editedState.plan:null;
  const setEdited=(plan:WeeklyRequest)=>setEditedState({owner:user!.id,plan});
  const [choiceDraft,setChoiceDraft]=useState<{scope:string;values:TodayMealChoices}|null>(null);
  const clock = useLocalClock(),
    day = new Date(+clock - clock.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10),
    hour = clock.getHours(),timezoneOffset=clock.getTimezoneOffset(),
    scope=`${user?.id}|${day}|${hour}|${timezoneOffset}`;
  const choiceScope=`${user?.id}|${day}|${timezoneOffset}`,choices=choiceDraft?.scope===choiceScope?choiceDraft.values:{};
  const currentResult=result?.scope===scope?result.plan:null;
  const fetchPlan = async (plan?: WeeklyRequest,selectedChoices:TodayMealChoices=choices) =>
    (
      await apiRequest("POST", "/api/precision/today-plan", {
        date: day,
        timezoneOffset,
        hour,
        ...(plan ? { plan } : {}),
        ...(Object.keys(selectedChoices).length?{choices:selectedChoices}:{}),
      })
    ).json() as Promise<TodayPlan & { targetSource: string }>;
  const initial = useQuery({
    queryKey: ["/api/precision/today-plan", user?.id,day,hour,timezoneOffset],
    enabled:!!user?.id,
    queryFn: () => fetchPlan(edited || undefined),
    staleTime: 60000,
  });
  useEffect(() => {
    setResult(null);
  }, [initial.dataUpdatedAt]);
  const build = useMutation({
    mutationFn: async (override?:TodayMealChoices) => ({scope,plan:await fetchPlan(edited || (currentResult || initial.data)!.request,override??choices)}),
    onSuccess: (r) => setResult(r),
  });
  const checking = initial.isPending || initial.fetchStatus !== "idle" || build.isPending;
  // A failed or unfinished current-context check cannot fall back to a
  // previous suggestion set. Keep the draft targets for an explicit retry.
  const r = checking || initial.isError || build.isError ? null : currentResult || initial.data,
    request = edited || r?.request || initial.data?.request;
  const choicesDirty=!!r&&todayMealSlots.some(slot=>choices[slot]?.recipeId!==(r.requestedChoices||{})[slot]?.recipeId||choices[slot]?.portion!==(r.requestedChoices||{})[slot]?.portion);
  const pendingChanges=!!r&&(choicesDirty||JSON.stringify(request)!==JSON.stringify(r.request));
  const checkChanges=()=>{setResult(null);build.mutate(undefined);};
  const targetEditor=request?(<details>
            <summary>Review daily targets</summary>
            <p className="panel-note">
              Energy entry uses your saved display unit; other targets use the nutrient units shown.
              Energy uses a ±10% planning range. Other maxima below are limits.
              These targets are not inferred from genetic variants or a
              diagnosis.
            </p>
            <div className="precision-grid">
              {(
                [
                  "calories",
                  "protein",
                  "fiber",
                  "fiberMaximum",
                  "sodium",
                  "saturatedFat",
                ] as const
              ).map((k) => (
                <label key={k}>
                  {
                    {
                      calories: `Energy (${units.energy})`,
                      protein: "Protein minimum (g)",
                      fiber: "Fiber minimum (g)",
                      fiberMaximum: "Fiber maximum (g)",
                      sodium: "Sodium maximum (mg)",
                      saturatedFat: "Saturated fat maximum (g)",
                    }[k]
                  }
                  <input
                    className="bloom-input w-full"
                    type="number"
                    step="any"
                    min="0"
                    value={k === "calories" ? quantityFromCanonical("energy", request.targets[k], units.energy) : request.targets[k]}
                    onChange={(e) =>
                      setEdited({
                        ...request,
                        targets: {
                          ...request.targets,
                          [k]: k === "calories" ? quantityToCanonical("energy", Number(e.target.value), units.energy) : Number(e.target.value),
                        },
                      })
                    }
                  />
                </label>
              ))}
            </div>
            <details>
              <summary>Carbohydrate, fat & micronutrient targets</summary>
              <p>
                Optional daily minimums and maximums override the corresponding
                target above. Leave blank if not set; micronutrient goals need
                appropriate units and personal context.
              </p>
              {nutrientDefinitions
                .filter(
                  ([k]) =>
                    ![
                      "calories",
                      "fiber_g",
                      "sodium_mg",
                      "fat_saturated_g",
                    ].includes(k),
                )
                .map(([key, name, unit]) => (
                  <div className="precision-grid" key={key}>
                    <span>
                      {name} ({unit})
                    </span>
                    {(["min", "max"] as const).map((bound) => (
                      <label key={bound}>
                        {bound === "min" ? "Minimum" : "Maximum"}
                        <input
                          className="bloom-input w-full"
                          type="number"
                          min="0"
                          step="any"
                          value={request.nutrientTargets[key]?.[bound] ?? ""}
                          onChange={(e) => {
                            const next = { ...request.nutrientTargets },
                              v = {
                                ...(next[key] || { min: null, max: null }),
                                [bound]:
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                              };
                            if (v.min === null && v.max === null)
                              delete next[key];
                            else next[key] = v;
                            setEdited({ ...request, nutrientTargets: next });
                          }}
                        />
                      </label>
                    ))}
                  </div>
                ))}
            </details>
          </details>):null;
  return (
    <section className="bloom-panel space-y-4">
      <h2>What to eat for the rest of today</h2>
      <p>
        Suggestions use today’s logged meals, your local time, saved food
        preferences and the targets below. Refresh after logging a meal.
      </p>
      {checking && <p role="status">Checking today’s intake and current context…</p>}
      {(initial.isError || build.isError) && (
        <div>
          <p role="alert">{(build.error || initial.error)?.message}</p>
          <p className="panel-note">Current suggestions are unavailable until the check succeeds. Your edited targets are retained for retry.</p>
          <Button type="button" disabled={checking} onClick={() => initial.isError ? initial.refetch() : build.mutate(undefined)}>Retry suggestions</Button>
        </div>
      )}
      {!r&&request&&<>{targetEditor}<Button type="button" disabled={checking} onClick={checkChanges}>Check edited targets again</Button></>}
      {Object.keys(choices).length>0&&<Button type="button" variant="outline" disabled={checking} onClick={()=>{setChoiceDraft({scope:choiceScope,values:{}});setResult(null);build.mutate({});}}>Clear meal choices and retry</Button>}
      {r && request && (
        <>
          <div className="planner-status"><span>{r.eatenMeals} meals logged today</span><span>Still to plan: {r.slots.join(", ") || "no remaining meals"}</span></div>
          <p className="panel-note">Targets: {r.targetSource}.</p>
          {targetEditor}
          <Button
            className="whitespace-normal h-auto max-w-full"
            type="button"
            disabled={build.isPending}
            onClick={checkChanges}
          >
            {build.isPending
              ? "Finding meals…"
              : "Update suggestions with these targets"}
          </Button>
          {pendingChanges&&<p role="status">Changes have not been checked. The amounts below belong to the last checked plan; check changes before reviewing a suggested meal.</p>}
          {!!r.availableChoices?.length&&<details className="today-meal-choices"><summary>Choose meals &amp; portions</summary><p className="panel-note">Choose a different eligible recipe or portion, then check the remaining day. Other suggestions may change to protect the same constraints. No food is logged by planning.</p>{r.slots.map(slot=>{const selected=choices[slot],current=r.meals.find(meal=>meal.slot===slot),kind=slot==='breakfast'?'breakfast':slot==='snack'?'snack':'main';return <div className="precision-grid" key={slot}><label className="min-w-0">Meal for {slot}<select className="bloom-input w-full" aria-label={`Meal for ${slot}`} value={selected?.recipeId||''} onChange={event=>{const next={...choices};if(event.target.value)next[slot]={recipeId:event.target.value,portion:selected?.portion??current?.portion??1};else delete next[slot];setChoiceDraft({scope:choiceScope,values:next});}}><option value="">Let Bloom choose</option>{r.availableChoices.filter(recipe=>recipe.mealType===kind).map(recipe=><option key={recipe.id} value={recipe.id}>{recipeDisplayName(recipe.name)}</option>)}</select></label><label>Recipe portion for {slot}<select className="bloom-input w-full" aria-label={`Recipe portion for ${slot}`} value={selected?.portion??current?.portion??1} disabled={!selected&&!current} onChange={event=>{const recipeId=selected?.recipeId||current?.recipe.id;if(recipeId)setChoiceDraft({scope:choiceScope,values:{...choices,[slot]:{recipeId,portion:Number(event.target.value)}}});}}>{[.5,.75,1,1.25,1.5,1.75,2].map(portion=><option key={portion} value={portion}>{portion} × recipe</option>)}</select></label></div>;})}<Button type="button" disabled={checking} onClick={checkChanges}>Check meal changes</Button></details>}
          <details>
            <summary>How your preferences affect these meals</summary>
            <p>
              Diet: {r.preferences.dietaryPattern}. Maximum cooking time:{" "}
              {r.preferences.cookingMinutes} minutes. Exclusions:{" "}
              {r.preferences.exclusions.join(", ") || "none"}. Dislikes:{" "}
              {r.preferences.dislikes.join(", ") || "none"}. Sensitive-gut
              filter: {r.preferences.sensitiveGut ? "on" : "off"}.
            </p>
            <p>
              Cuisine notes are sent only to optional AI recipe suggestions when
              you consent. The local planner does not interpret arbitrary
              cuisine text.
            </p>
            {onEditPreferences ? <button type="button" className="text-link" onClick={onEditPreferences}>Edit food preferences</button> : <Link className="text-link" href="/meal-planner?preferences=1">Edit food preferences</Link>}
          </details>
          {r.warnings.map((w, i) => (
            <p className="panel-note" key={i}>
              {w}
            </p>
          ))}
          {r.meals.map((m) => {
            const prep = recipePreparation(m.recipe);
            return (
              <article className="precision-observation block meal-suggestion" key={m.slot}>
                <h3 className="capitalize">
                  {m.slot}: {recipeDisplayName(m.recipe.name)}
                </h3>
                <p className="panel-note">About {prep.minutes} minutes · {m.portion} × recipe</p>
                <div className="meal-nutrition-strip">
                  {[[nutrientDisplay("calories", m.nutrients.calories, "kcal", units).amount, units.energy], [m.nutrients.protein_g, "g protein"], [m.nutrients.carbohydrates_total_g, "g carbs"], [m.nutrients.fat_total_g, "g fat"], [m.nutrients.fiber_g, "g fiber"]].map(([value, unit]) => <span key={String(unit)}>{value == null ? "Unknown" : Math.round(Number(value))} {unit}</span>)}
                </div>
                <details>
                  <summary>Ingredients, recipe & evidence</summary>
                  <h4>Shopping & ingredients</h4>
                  <ul>
                    {prep.shopping.map((i) => (
                      <li key={i.name}>
                        {i.estimated ? "Approximately " : ""}
                        {foodMass(i.grams * m.portion, units.foodWeight)} {i.name}
                      </li>
                    ))}
                  </ul>
                  <p className="panel-note">
                    Nutrition uses these prepared portions:{" "}
                    {m.recipe.ingredients
                      .map((i) => `${foodMass(i.grams * m.portion, units.foodWeight)} ${i.name}`)
                      .join("; ")}
                    .
                  </p>
                  <ol>
                    {prep.instructions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                    <li>
                      Assemble the prepared ingredients in the listed portions.
                      For soup, add water and simmer together 10 minutes; for
                      bowls, serve warm.
                    </li>
                  </ol>
                  <p>{prep.note}</p>
                  <p>{m.recipe.rationale}</p>
                  <a
                    className="text-link"
                    target="_blank"
                    rel="noreferrer"
                    href={prep.source}
                  >
                    Cooking safety
                  </a>
                  <p className="panel-note">
                    Composition uses the cited USDA records in the weekly
                    planner food catalogue.
                  </p>
                </details>
                <details>
                  <summary>Why this fits today</summary>
                  <p>
                    Checked against logged intake and selected constraints.
                    Missing nutrients and any remaining gaps are shown in the daily checks.
                  </p>
                  <ul>
                    {m.reasons.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </details>
                {pendingChanges?<Button type="button" disabled>Check changes before review</Button>:<Link
                  className="text-link"
                  href={
                    "/log-meal?description=" +
                    encodeURIComponent(
                      m.recipe.ingredients
                        .map(
                          (i) =>
                            `${i.grams * m.portion} g ${i.name.replaceAll(",", " ")}`,
                        )
                        .join(", "),
                    ) +
                    "&type=" +
                    m.slot
                  }
                >
                  Review and log this meal
                </Link>}
              </article>
            );
          })}
          {!r.meals.length && (
            <p>
              No suitable combination fits the current targets and context.
              Check the messages above, review missing meal portions or adjust
              your targets and cooking preferences. Bloom will not add a meal
              just to exceed a limit.
            </p>
          )}
          {r.tradeoffs && <section className="bloom-panel space-y-2" aria-label="Planning trade-offs">
            <h3 className="font-medium">Why gaps can remain</h3>
            <p>The searched plan leaves these selected minimums unmet: {r.tradeoffs.unmetMinimums.join(", ")}.</p>
            {r.tradeoffs.excludedByLimits.length>0 && <p>Candidate combinations were excluded for exceeding these known limits: {r.tradeoffs.excludedByLimits.join(", ")}. Limits were kept in place.</p>}
            <p className="panel-note">This is a limited search of eligible recipes and portions, not proof that no other combination could fit. Missing intake remains provisional. Review the projected amounts and your saved targets; Bloom does not automatically relax limits to close a gap.</p>
          </section>}
          <details>
            <summary>Projected daily nutrition & remaining gaps</summary>
            <p>
              “Added” is the suggested food, not food already eaten. A missing
              nutrient prevents a complete daily check.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th>Nutrient</th>
                    <th>Logged</th>
                    <th>Added</th>
                    <th>Projected</th>
                    <th>Target</th>
                    <th>Check</th>
                  </tr>
                </thead>
                <tbody>
                  {r.checks.map((c) => {
                    const display = (v: number | null) => round(nutrientDisplay(c.key, v, c.unit, units).amount);
                    return (
                    <tr key={c.key}>
                      <td>
                        {c.name} ({nutrientDisplay(c.key, null, c.unit, units).unit})
                      </td>
                      <td>{display(c.consumed)}</td>
                      <td>{display(c.added)}</td>
                      <td>{display(c.projected)}</td>
                      <td>
                        {c.min === null ? "" : `≥${display(c.min)} `}
                        {c.max === null ? "" : `≤${display(c.max)}`}
                      </td>
                      <td>{c.status}</td>
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
          </details>
          {r.supplements.length > 0 && (
            <details>
              <summary>Supplements to review separately</summary>
              <p>
                Missing intake estimates do not establish a deficiency. No
                automatic dose is added to the plan.
              </p>
              {r.supplements.map((s) => (
                <p key={s.id}>
                  <strong>{s.name}</strong>: {s.reason} — {s.status}.{" "}
                  {s.checks.join(" ")}
                </p>
              ))}
            </details>
          )}
          <p className="panel-note">{r.note}</p>
        </>
      )}
    </section>
  );
}
