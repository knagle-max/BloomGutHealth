import { useEffect, useId, useRef, useState } from "react";
import { quantityFromCanonical } from "@shared/display-units";
import { foodMassDraft, type NutritionDisplayUnits } from "@shared/nutrition-display";

/** Draft text stays editable; only a valid canonical mass leaves this control. */
export default function FoodMassInput({ grams, unit, onChange }: {
  grams: number;
  unit: NutritionDisplayUnits["foodWeight"];
  onChange: (grams: number) => void;
}) {
  const display = (g: number, u: NutritionDisplayUnits["foodWeight"]) =>
    g > 0 ? String(Number(quantityFromCanonical("foodWeight", g, u).toFixed(8))) : "";
  const [draft, setDraft] = useState(() => display(grams, unit));
  const last = useRef({ grams, unit });
  const errorId = useId();
  useEffect(() => {
    if (last.current.grams !== grams || last.current.unit !== unit) setDraft(display(grams, unit));
    last.current = { grams, unit };
  }, [grams, unit]);
  const valid = foodMassDraft(draft, unit) !== null;
  return <div>
    <label>Amount eaten ({unit})
      <input className="bloom-input" type="text" inputMode="decimal" value={draft}
        aria-invalid={!valid} aria-describedby={!valid ? errorId : undefined}
        onChange={e => {
          const raw = e.target.value, canonical = foodMassDraft(raw, unit) ?? 0;
          setDraft(raw);
          last.current = { grams: canonical, unit };
          onChange(canonical);
        }} />
    </label>
    {!valid && <p id={errorId} role="alert">Enter a positive mass up to {unit === "oz" ? "105.82 oz" : "3,000 g"}. Finish decimals before continuing.</p>}
  </div>;
}
