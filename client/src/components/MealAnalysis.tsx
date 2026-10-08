import type { MealIntelligence } from "@shared/meal-intelligence";
export default function MealAnalysis({
  analysis,
}: {
  analysis: MealIntelligence;
}) {
  return (
    <section className="bloom-panel space-y-4">
      <h2>Nutrition & gut pathways</h2>
      <p className="panel-note">
        {analysis.provider} ·{" "}
        {analysis.parser === "ai"
          ? "AI ingredient interpretation"
          : "Description-based interpretation"}
      </p>
      {analysis.clarificationQuestions.length > 0 && (
        <div>
          <h3>Improve this estimate</h3>
          <ul className="list-disc pl-5">
            {analysis.clarificationQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
          <p className="panel-note">
            Edit the meal description with ingredient weights and preparation,
            then save again.
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
