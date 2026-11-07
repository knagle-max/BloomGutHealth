import type {MealIntelligence} from "@shared/meal-intelligence";
import {nutrientDefinitionDetails,nutrientDefinitionSource} from "@shared/nutrient-definitions";
export default function NutrientDefinitionDisclosure({analysis}:{analysis:MealIntelligence}){
 const source=nutrientDefinitionSource(analysis),definitions=nutrientDefinitionDetails().filter(d=>analysis.nutrients.some(n=>n.key===d.key)&&["vitamin_a_ug","folate_ug","vitamin_d_ug","vitamin_e_mg","vitamin_k_ug"].includes(d.key));
 return <details>
  <summary className="min-h-11 cursor-pointer">Nutrient forms & units</summary>
  <div className="space-y-3 py-2">
   <p className="panel-note">These are recorded food estimates, not a measure of absorption, deficiency or usual intake. Missing values stay unknown; a displayed zero may reflect source rounding.</p>
   {source==="form-not-recorded"?<p className="panel-note">Chemical forms and equivalent units are not confirmed for these label, mixed or legacy sources. Check the original label or choose a specific source; no RAE, DFE, NE, IU or elemental-dose conversion is inferred.</p>:<><p className="panel-note">Matched USDA nutrient fields use these definitions when a value is available. The definitions do not fill a missing amount or identify every chemical form.</p><ul className="space-y-2">{definitions.map(d=><li key={d.key}><strong>{d.name} · {d.amountUnit}</strong><p className="panel-note">{d.sourceBasis}</p></li>)}</ul></>}
   <p className="panel-note">A compound weight is not an elemental mineral dose. These amounts do not select a supplement dose or establish an upper-limit safety assessment.</p>
   <a className="text-link" href="https://fdc.nal.usda.gov/data-documentation.html" target="_blank" rel="noopener noreferrer">USDA source documentation</a>
  </div>
 </details>;
}
