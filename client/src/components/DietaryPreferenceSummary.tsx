import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { DietaryPreferences } from "@shared/meal-intelligence";
import type { PrecisionContext, PrecisionReport } from "@shared/precision-nutrition";
import { Button } from "@/components/ui/button";

export default function DietaryPreferenceSummary({ context }: { context?: PrecisionContext }) {
  const preferences = useQuery<DietaryPreferences>({ queryKey: ["/api/preferences"] });
  const biology = useQuery<PrecisionReport>({ queryKey: ["/api/precision"], enabled: !context });
  const safety = context || (!biology.isError && !biology.isFetching ? biology.data?.context : undefined);
  const p = preferences.data;
  return <section className="bloom-panel space-y-3" aria-labelledby="dietary-summary-title">
    <h2 id="dietary-summary-title">Food preferences & restrictions</h2>
    {preferences.isLoading && <p role="status">Loading saved food preferences…</p>}
    {preferences.isError && <p role="alert">Food preferences could not load. <Button type="button" variant="outline" onClick={() => preferences.refetch()}>Retry preferences</Button></p>}
    <div className="report-context">
      <strong>Allergies & safety context</strong>
      {safety ? <p>{safety.allergies?.length ? safety.allergies.join(", ") : "No allergies recorded; this does not certify allergen safety."} {!safety.safetyReviewed && "Safety context has not been confirmed."}</p>
        : <p>{biology.isError ? "Allergy context could not load." : "Checking your saved allergy context…"} Review My Biology before relying on food filters.</p>}
      {!context && biology.isError && <Button type="button" variant="outline" onClick={() => biology.refetch()}>Retry allergy context</Button>}
      <Link className="text-link" href="/precision">Review allergies & health context</Link>
    </div>
    {p && <dl className="space-y-2">
      <div><dt className="font-medium">Dietary exclusions</dt><dd>{p.exclusions.length ? p.exclusions.join(", ") : "None selected; allergy review is separate."}</dd></div>
      <div><dt className="font-medium">Dietary pattern</dt><dd>{p.dietaryPattern}</dd></div>
      <div><dt className="font-medium">Dislikes</dt><dd>{p.dislikes.join(", ") || "None saved"}</dd></div>
      <div><dt className="font-medium">Goals selected for food planning</dt><dd>{p.goals.join(", ") || "None saved"}</dd></div>
    </dl>}
    <p className="panel-note">These are your food-planning choices, separate from clinically sourced goals and laboratory interpretation. Ingredient filters do not certify products or cross-contact as safe.</p>
    <Link className="text-link" href="/meal-planner?preferences=1">Edit shared food preferences</Link>
  </section>;
}
