import { useExperience } from "@/lib/experience";
import { nutrientDisplay, foodMass, formatNutrientAmount } from "@shared/nutrition-display";
import FoodRelationshipLinks from "./FoodRelationshipLinks";
import ProductPicker from "./ProductPicker";
import { unmatchedFoods } from "@shared/nutrition-review";
import { useEffect, useState } from "react";
import { MAX_MEAL_INGREDIENTS, type Ingredient } from "@shared/meal-intelligence";
import type { MealIntelligence } from "@shared/meal-intelligence";
export default function MealAnalysis({
  analysis,
  onRecalculate,
  pending = false,
  current = true,
  preview = false,
  disabled = false,
  onDraftChange,
}: {
  analysis: MealIntelligence;
  onRecalculate?: (ingredients: Ingredient[]) => void;
  pending?: boolean;
  current?: boolean;
  preview?: boolean;
  disabled?: boolean;
  onDraftChange?: (dirty:boolean)=>void;
}) {
  const { settings } = useExperience();
  const units = settings.displayUnits;
  const [rows,setRows]=useState(()=>analysis.ingredients.map(ingredient=>({key:crypto.randomUUID(),ingredient})));
  const [hasEdits,setHasEdits]=useState(false);
  const ingredients=rows.map(row=>row.ingredient);
  // Confirmed corrections preserve request order. Keep row views/search drafts while adopting canonical source values.
  useEffect(()=>{setRows(previous=>analysis.ingredients.map((ingredient,index)=>({key:previous[index]?.key||crypto.randomUUID(),ingredient})));setHasEdits(false);onDraftChange?.(false);},[analysis]);
  const setEdits=(next:Ingredient[])=>{setRows(previous=>next.map((ingredient,index)=>({key:previous[index]?.key||crypto.randomUUID(),ingredient})));setHasEdits(true);onDraftChange?.(true);};
  const addIngredient=()=>{
    const key=crypto.randomUUID();
    setRows(previous=>previous.length>=MAX_MEAL_INGREDIENTS?previous:[...previous,{key,ingredient:{name:"",grams:null,preparation:"As described",assumption:"User-added food; review the source and amount."}}]);
    setHasEdits(true);onDraftChange?.(true);
    requestAnimationFrame(()=>document.querySelector<HTMLInputElement>(`[data-draft-row="${key}"] input[aria-label^="Food "]`)?.focus());
  };
  const missing = unmatchedFoods(analysis);
  const firstMissingIndex = ingredients.findIndex((i) => missing.some((m) => m.name === i.name && m.grams === i.grams));
  const DetailContainer=preview?"details":"div";
  const PortionGuidance=preview?"details":"div";
  return (
    <section className={preview?"space-y-4":"bloom-panel space-y-4"}>
      {!preview&&<h2>Nutrition & gut pathways</h2>}
      {hasEdits&&current&&<p role="status">Unsaved ingredient changes. Nutrition and food explanations shown here still describe your last confirmed {preview?"review":"saved meal"}.</p>}
      {current&&!preview&&<FoodRelationshipLinks names={analysis.ingredients.map(i=>i.name)}/>}
      {!current&&<p role="status">{preview?"This review needs updating. Your ingredient draft is retained; update the review before saving.":"Current nutrition analysis is not confirmed. Your portion draft is retained; retry the correction to confirm saved nutrition."}</p>}
      {!preview&&<p className="panel-note">
        {!current&&(preview?"Previous review: ":"Previous saved analysis: ")}{analysis.provider} ·{" "}
        {analysis.parser === "ai"
          ? "AI ingredient interpretation"
          : "Description-based interpretation"}
      </p>}
      {analysis.parserNotice && (
        <p className="bloom-panel text-sm" role="status">
          {analysis.parserNotice}
        </p>
      )}
      {missing.length > 0 && (
        <div className="border rounded-xl p-3 space-y-2" role="status">
          <h3>Choose a product to complete the nutrition</h3>
          <p>Recalculation could not match {missing.map((i) => i.name).join("; ")}. Review the search results below, choose the exact formula and confirm the amount you ate. {preview?"Choosing a product updates this review; save the meal only when ready.":"Confirming a product saves its nutrition immediately."}</p>
          <p className="panel-note">Powders, gummies, capsules and sugared or sugar-free versions can have different labels. A heaping spoon is an estimate; check your package serving.</p>
        </div>
      )}
      <fieldset disabled={pending||disabled} className="min-w-0">
      <details open>
        <summary>Review foods & estimated portions</summary>
        <PortionGuidance>{preview&&<summary>Portion guidance & limits</summary>}<p className="panel-note">
          Portion corrections use source grams; saved label servings retain their printed basis.
          Working estimates, not measured intake. Check the amount you ate, meat
          cut, dressing and cooking fat. Unknown brand, salt and marinade can
          change nutrients substantially.
        </p></PortionGuidance>
        {ingredients.map((item, index) => (
          <div className="border-t py-3 space-y-2" key={rows[index].key} data-draft-row={rows[index].key} role="group" aria-label={`Ingredient ${index+1}`}>
            {onRecalculate ? (
              <>
                <label className="block">
                  Food
                  <input
                    className="bloom-input w-full"
                    aria-label={`Food ${index + 1}`}
                    disabled={!!item.product||!!item.catalogue}
                    maxLength={120}
                    value={item.name}
                    onChange={(e) =>
                      setEdits(
                        ingredients.map((v, i) =>
                          i === index
                            ? {
                                ...v,
                                name: e.target.value,
                                assumption:
                                  "User-edited food; review database match",
                              }
                            : v,
                        ),
                      )
                    }
                  />
                </label>
                {item.product ? (
                  <label className="block">
                    Label servings eaten
                    <input
                      className="bloom-input w-full"
                      type="number"
                      min="0.01"
                      max="100"
                      step="any"
                      value={item.product.servings}
                      onChange={(e) => {
                        const servings=Number(e.target.value);
                        setEdits(ingredients.map((v,i)=>i===index?{...v,
                          grams:v.grams!==null&&v.product!.servings>0&&Number.isFinite(servings)&&servings>0?v.grams*servings/v.product!.servings:null,
                          product:{...v.product!,servings},
                        }:v));
                      }}
                    />
                  </label>
                ) : (
                  <label className="block">
                    Amount eaten (g)
                    <input
                      className="bloom-input w-full"
                      type="number"
                      min="0.1"
                      max="3000"
                      step="any"
                      aria-label={`Grams ${index + 1}`}
                      value={item.grams ?? ""}
                      onChange={(e) =>
                        setEdits(
                          ingredients.map((v, i) =>
                            i === index
                              ? {
                                  ...v,
                                  grams: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                  assumption:
                                    "User-edited portion; generic composition record may differ from product",
                                }
                              : v,
                          ),
                        )
                      }
                    />
                  </label>
                )}
                <details
                  open={
                    !analysis.foodMatches.some(
                      (m) => m.ingredient === item.name,
                    )
                  }
                >
                  <summary>
                    {item.product
                      ? "Change selected product"
                      : "Find the exact product or enter its label"}
                  </summary>
                  <ProductPicker
                    initialGrams={item.grams}
                    initialQuery={item.name}
                    autoSearch={
                      index === firstMissingIndex
                    }
                    confirmLabel="Use product & update meal"
                    pending={pending}
                    onPick={(product) => {
                      const updated = ingredients.map((v, i) => (i === index ? product : v));
                      setEdits(updated);
                      const details=document.querySelector<HTMLDetailsElement>(`[data-draft-row="${rows[index].key}"] > details`);
                      if(details){details.open=false;details.querySelector("summary")?.focus();}
                      onRecalculate(updated);
                    }}
                  />
                </details>
                <button
                  type="button"
                  className="text-link"
                  disabled={pending}
                  onClick={() => {const key=rows[index].key;setRows(previous=>previous.filter(row=>row.key!==key));setHasEdits(true);onDraftChange?.(true);}}
                >
                  Remove {item.name}
                </button>
              </>
            ) : (
              <p>
                {item.name}:{" "}
                {item.grams === null ? "Amount unknown" : foodMass(item.grams, units.foodWeight)}
              </p>
            )}
            <p className="panel-note">{item.assumption}</p>
          </div>
        ))}
        {onRecalculate&&<div className="space-y-2"><button type="button" className="text-link min-h-[44px]" disabled={pending||ingredients.length>=MAX_MEAL_INGREDIENTS} onClick={addIngredient}>Add missing ingredient</button><p className="panel-note">{ingredients.length} of {MAX_MEAL_INGREDIENTS} ingredient entries in this draft.</p>{!ingredients.length&&<p role="status">No ingredients in this draft. Add any foods that were missed, or delete the whole entry from your journal.</p>}</div>}
        {onRecalculate && !preview && <p className="panel-note">Reviewed corrections are remembered privately for this exact meal description. Manage or forget them in Saved meals.</p>}
        {onRecalculate && (
          <button
            type="button"
            className="hero-button"
            disabled={
              pending ||
              !ingredients.length || ingredients.length>MAX_MEAL_INGREDIENTS ||
              ingredients.some(
                (i) =>
                  !i.name.trim() ||
                  !!i.product&&(!Number.isFinite(i.product.servings)||i.product.servings<=0||i.product.servings>100) ||
                  (i.grams !== null && (!(i.grams > 0) || i.grams > 3000)),
              )
            }
            onClick={() => onRecalculate(ingredients)}
          >
            {pending
              ? (preview?"Updating review…":"Recalculating…")
              : (preview?"Update meal review":"Save corrected portions & recalculate")}
          </button>
        )}
      </details>
      </fieldset>
      <DetailContainer hidden={!current} className="space-y-4">
      {preview&&<><summary>Nutrition sources & science</summary><FoodRelationshipLinks names={analysis.ingredients.map(i=>i.name)}/><p className="panel-note">{analysis.provider} · {analysis.parser==="ai"?"AI ingredient interpretation":"Description-based interpretation"}</p></>}
      {analysis.clarificationQuestions.length > 0 && (
        <div>
          <h3>Improve this estimate</h3>
          <ul className="list-disc pl-5">
            {analysis.clarificationQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
          <p className="panel-note">
            Review the foods and amounts above, or edit the original meal
            description and {preview?"review again before saving.":"save again."}
          </p>
        </div>
      )}
      <details open>
        <summary>Macros, vitamins & minerals</summary>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Nutrient</th>
                <th className="text-left p-2">Estimate</th>
                <th className="text-left p-2">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {analysis.nutrients.map((n) => (
                <tr key={n.key}>
                  <td className="p-2">{n.name}</td>
                  <td className="p-2">
                    {n.amount === null
                      ? "Unavailable"
                      : `${formatNutrientAmount(nutrientDisplay(n.key, n.amount, n.unit, units).amount)} ${nutrientDisplay(n.key, n.amount, n.unit, units).unit}`}
                  </td>
                  <td className="p-2">
                    {n.coverage === 1
                      ? "All matched items"
                      : n.coverage > 0
                        ? "Partial; not a meal total"
                        : "No value"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      {analysis.productDetails?.some((p) => p.otherNutrients.length > 0) && (
        <details>
          <summary>Other supplement-label ingredients</summary>
          {analysis.productDetails.map((p, i) => (
            <div key={i}>
              <h3>
                {p.name} · {p.serving}
              </h3>
              {p.otherNutrients.map((n, j) => (
                <p key={j}>
                  {n.name}: {Number(n.amount.toFixed(3))} {n.unit}
                </p>
              ))}
            </div>
          ))}
          <p className="panel-note">
            Label ingredients are recorded separately. They are not added again
            to macro totals or treated as a recommended dose.
          </p>
        </details>
      )}
      {analysis.foodMatches.length > 0 && (
        <details>
          <summary>Review automatic database matches</summary>
          {analysis.foodMatches.map((m, i) => (
            <p key={i}>
              {m.ingredient} (
              {m.serving ||
                (m.grams === null ? "mass not supplied" : `${m.grams} g`)}
              ) →{" "}
              {m.url ? (
                <a
                  className="underline"
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {m.description}
                </a>
              ) : (
                <span>{m.description}</span>
              )}
              . Automatic match; check preparation and product.
            </p>
          ))}
        </details>
      )}
      {analysis.pathways.length ? (
        analysis.pathways.map((p) => (
          <article key={p.id} className="border-t pt-3">
            <h3>{p.substrate}</h3>
            <p>{p.microbialFunction}</p>
            <p className="text-sm">Microbes: {p.organisms.join(" · ")}</p>
            <p className="text-sm">Molecules: {p.molecules.join(" · ")}</p>
            <p className="panel-note">{p.relationship}</p>
          </article>
        ))
      ) : (
        <p>
          No supported food-pathway match in the current evidence catalogue.
          This does not mean the meal has no gut effects.
        </p>
      )}
      <details>
        <summary>Evidence & limits</summary>
        {analysis.sources.map((s) => (
          <p key={s.id}>
            <a
              className="underline"
              href={s.url}
              target="_blank"
              rel="noreferrer"
            >
              {s.authors}, {s.year}
            </a>{" "}
            — {s.design}. {s.limitation}
          </p>
        ))}
        {analysis.warnings.map((w, i) => (
          <p className="panel-note" key={i}>
            {w}
          </p>
        ))}
      </details>
      </DetailContainer>
    </section>
  );
}
