import { assessFood, type BiologicalRegistry } from "./biological-model";
import type { PrecisionReport } from "./precision-nutrition";
import type { DietaryPreferences } from "./meal-intelligence";
/** Only structured, reviewed ingredient IDs activate a curated food relationship. */
export function explainRecipeBiology(foodIds: string[], report: PrecisionReport, preferences: DietaryPreferences, registry?: BiologicalRegistry) {
  if (!registry) return { available: false, version: null, reasons: [] as string[], relationshipIds: [] as string[], sources: [] as {title:string;url:string}[], note: "Reviewed biological explanations are temporarily unavailable. These choices use nutrient composition and practical preferences only." };
  const assessments = Array.from(new Set(foodIds)).flatMap(id => {
    const assessment = assessFood(registry, "food:" + id, report, preferences);
    return assessment ? [assessment] : [];
  });
  const activeIds = new Set(assessments.flatMap(a => a.relationshipEffects.filter(e => e.affectsRecommendation).map(e => e.id)));
  const sourceIds=new Set([...registry.relationships.filter(e=>activeIds.has(e.id)).flatMap(e=>e.sourceIds),...assessments.filter(a=>a.reasons.length).flatMap(a=>report.foods.find(f=>"food:"+f.id===a.food.id)?.sourceIds||[])]);
  return { available: true, version: registry.version, note: null,
    reasons: Array.from(new Set(assessments.flatMap(a => a.reasons))),
    relationshipIds: Array.from(activeIds),
    sources: Array.from(new Map([...registry.sources,...report.sources].filter(s=>sourceIds.has(s.id)).map(s=>[s.id,s])).values()).map(s=>({title:s.title,url:s.url})),
  };
}
