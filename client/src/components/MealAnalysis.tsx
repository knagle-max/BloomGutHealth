import { useExperience } from "@/lib/experience";
import { nutrientDisplay, foodMass, formatNutrientAmount } from "@shared/nutrition-display";
import FoodRelationshipLinks from "./FoodRelationshipLinks";
import ProductPicker from "./ProductPicker";
import { unmatchedFoods } from "@shared/nutrition-review";
import { useState } from "react";
import type { Ingredient } from "@shared/meal-intelligence";
import type { MealIntelligence } from "@shared/meal-intelligence";
export default function MealAnalysis({
  analysis,
  onRecalculate,
  pending = false,
  current = true,
}: {
  analysis: MealIntelligence;
  onRecalculate?: (ingredients: Ingredient[]) => void;
  pending?: boolean;
  current?: boolean;
}) {
  const { settings } = useExperience();
  const units = settings.displayUnits;
  const [edits, setEdits] = useState<Ingredient[] | null>(null);
  const ingredients = edits ?? analysis.ingredients;
  const missing = unmatchedFoods(analysis);
  const firstMissingIndex = ingredients.findIndex((i) => missing.some((m) => m.name === i.name && m.grams === i.grams));
  return (
    <section className="bloom-panel space-y-4">
      <h2>Nutrition & gut pathways</h2>
      {current&&<FoodRelationshipLinks names={analysis.ingredients.map(i=>i.name)}/>}
      {!current&&<p role="status">Current nutrition analysis is not confirmed. Your portion draft is retained; retry the correction to confirm saved nutrition.</p>}
      <p className="panel-note">
        {!current&&"Previous saved analysis: "}{analysis.provider} ·{" "}
        {analysis.parser === "ai"
          ? "AI ingredient interpretation"
          : "Description-based interpretation"}
      </p>
      {analysis.parserNotice && (
        <p className="bloom-panel text-sm" role="status">
          {analysis.parserNotice}
        </p>
      )}
      {missing.length > 0 && (
        <div className="border rounded-xl p-3 space-y-2" role="status">
          <h3>Choose a product to complete the nutrition</h3>
          <p>Recalculation could not match {missing.map((i) => i.name).join("; ")}. Review the search results below, choose the exact formula and confirm the amount you ate. Confirming a product saves its nutrition immediately.</p>
          <p className="panel-note">Powders, gummies, capsules and sugared or sugar-free versions can have different labels. A heaping spoon is an estimate; check your package serving.</p>
        </div>
      )}
      <fieldset disabled={pending} className="min-w-0">
      <details open>
        <summary>Review foods & estimated portions</summary>
        <p className="panel-note">
          Portion corrections use source grams; saved label servings retain their printed basis.
          Working estimates, not measured intake. Check the amount you ate, meat
          cut, dressing and cooking fat. Unknown brand, salt and marinade can
          change nutrients substantially.
        </p>
        {ingredients.map((item, index) => (
          <div className="border-t py-3 space-y-2" key={index}>
            {onRecalculate ? (
              <>
                <label className="block">
                  Food
                  <input
                    className="bloom-input w-full"
                    aria-label={`Food ${index + 1}`}
                    disabled={!!item.product}
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
                      onChange={(e) =>
                        setEdits(
                          ingredients.map((v, i) =>
                            i === index
                              ? {
                                  ...v,
                                  product: {
                                    ...v.product!,
                                    servings: Number(e.target.value),
                                  },
                                }
                              : v,
                          ),
                        )
                      }
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
                      onRecalculate(updated);
                    }}
                  />
                </details>
                <button
                  type="button"
                  className="text-link"
                  disabled={pending}
                  onClick={() =>
                    setEdits(ingredients.filter((_, i) => i !== index))
                  }
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
        {onRecalculate && <p className="panel-note">Reviewed corrections are remembered privately for this exact meal description. Manage or forget them in Saved meals.</p>}
        {onRecalculate && (
          <button
            type="button"
            className="hero-button"
            disabled={
              pending ||
              !ingredients.length ||
              ingredients.some(
                (i) =>
                  !i.name.trim() ||
                  (i.grams !== null && (!(i.grams > 0) || i.grams > 3000)),
              )
            }
            onClick={() => onRecalculate(ingredients)}
          >
            {pending
              ? "Recalculating…"
              : "Save corrected portions & recalculate"}
          </button>
        )}
      </details>
      </fieldset>
      <div hidden={!current} className="space-y-4">
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
            description and save again.
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
      </div>
    </section>
  );
}
