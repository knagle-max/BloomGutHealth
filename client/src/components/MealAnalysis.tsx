import { useState } from "react";
import type { Ingredient } from "@shared/meal-intelligence";
import type { MealIntelligence } from "@shared/meal-intelligence";
export default function MealAnalysis({
  analysis,
  onRecalculate,
  pending = false,
}: {
  analysis: MealIntelligence;
  onRecalculate?: (ingredients: Ingredient[]) => void;
  pending?: boolean;
}) {
  const [edits, setEdits] = useState<Ingredient[] | null>(null);
  const ingredients = edits ?? analysis.ingredients;
  return (
    <section className="bloom-panel space-y-4">
      <h2>Nutrition & gut pathways</h2>
      <p className="panel-note">
        {analysis.provider} ·{" "}
        {analysis.parser === "ai"
          ? "AI ingredient interpretation"
          : "Description-based interpretation"}
      </p>
      <details open>
        <summary>Review foods & estimated portions</summary>
        <p className="panel-note">
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
                {item.grams === null ? "Amount unknown" : `${item.grams} g`}
              </p>
            )}
            <p className="panel-note">{item.assumption}</p>
          </div>
        ))}
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
                      : `${n.amount.toFixed(1)} ${n.unit}`}
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
      {analysis.foodMatches.length > 0 && (
        <details>
          <summary>Review automatic database matches</summary>
          {analysis.foodMatches.map((m, i) => (
            <p key={i}>
              {m.ingredient} ({m.grams} g) →{" "}
              <a
                className="underline"
                href={m.url}
                target="_blank"
                rel="noreferrer"
              >
                {m.description}
              </a>
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
    </section>
  );
}
