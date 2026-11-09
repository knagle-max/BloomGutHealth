import type {IngredientMassEntry as Source} from "@shared/ingredient-mass-entry";
export default function IngredientMassEntry({source}:{source?:Source}){
 return <details className="panel-note"><summary className="min-h-11 py-2 cursor-pointer focus-visible:outline focus-visible:outline-2">Portion entry source</summary>
  {source?<p>Entered {source.value} {source.unit}. This is self-reported portion text before display conversion, not an independently measured amount.</p>:<p>Original portion text and unit were not retained. The saved canonical mass remains available; its original entry cannot be reconstructed.</p>}
 </details>;
}
