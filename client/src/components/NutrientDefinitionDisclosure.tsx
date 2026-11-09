import type {MealIntelligence} from "@shared/meal-intelligence";
import {nutrientDefinitionDetails,nutrientDefinitionSource} from "@shared/nutrient-definitions";
import {readNutrientSourceSnapshots} from "@shared/nutrient-source-snapshot";
import {useState} from "react";
import {useAuth} from "@/lib/auth";
import {recordedNutrientObservations,type RecordedFoodRecord} from "@shared/nutrient-observations";
import {formatNutrientAmount} from "@shared/nutrition-display";
export default function NutrientDefinitionDisclosure({analysis,recordedMeal}:{analysis:MealIntelligence;recordedMeal?:RecordedFoodRecord}){
 const[open,setOpen]=useState(false),{user}=useAuth();
 if(recordedMeal&&recordedMeal.userId!==user?.id)return <p role="status" className="panel-note">Saved meal source context is unavailable for the current account.</p>;
 const source=nutrientDefinitionSource(analysis),definitions=nutrientDefinitionDetails().filter(d=>analysis.nutrients.some(n=>n.key===d.key)&&["vitamin_a_ug","folate_ug","vitamin_d_ug","vitamin_e_mg","vitamin_k_ug"].includes(d.key));
 const captured=open?readNutrientSourceSnapshots(analysis.nutrientSourceSnapshots):{status:"not-captured" as const,snapshots:[]};
 const recorded=open&&recordedMeal?recordedNutrientObservations(analysis,recordedMeal,user?.id):undefined;
 return <details className="nutrient-source-disclosure min-w-0 break-words" open={open} onToggle={event=>setOpen(event.currentTarget.open)}>
  <summary className="min-h-11 cursor-pointer">Nutrient forms & units</summary>
  <div className="space-y-3 py-2">
   <p className="panel-note">These are recorded food estimates, not a measure of absorption, deficiency or usual intake. Missing values stay unknown; a displayed zero may reflect source rounding.</p>
   {source==="form-not-recorded"?<p className="panel-note">Chemical forms and equivalent units are not confirmed for these label, mixed or legacy sources. Check the original label or choose a specific source; no RAE, DFE, NE, IU or elemental-dose conversion is inferred.</p>:<><p className="panel-note">Matched USDA nutrient fields use these definitions when a value is available. The definitions do not fill a missing amount or identify every chemical form.</p><ul className="space-y-2">{definitions.map(d=><li key={d.key}><strong>{d.name} · {d.amountUnit}</strong><p className="panel-note">{d.sourceBasis}</p></li>)}</ul></>}
   <p className="panel-note">A compound weight is not an elemental mineral dose. These amounts do not select a supplement dose or establish an upper-limit safety assessment.</p>
   {open&&(captured.snapshots.length?<section aria-label="Original generic nutrient source values" className="space-y-4">
    <h3>Original generic source values</h3><p className="panel-note">{captured.snapshots.length} captured generic food sources. Values below are the saved source amounts per100g in original field units, before portion scaling. They are composition estimates; source-reported zero is not a verified biological zero. Other label/provider sources retain their existing source records.</p>
    {recordedMeal&&<p className="panel-note break-words">Saved record time: {recorded?.observations[0]?.occurredAt??"Not recorded"}. Portion contributions below belong to this saved meal record. They do not establish complete daily intake or adequacy.</p>}
    {captured.snapshots.map((snapshot,index)=><section key={`${index}:${snapshot.sourceId}`} className="space-y-2">
     <h4 className="break-words">{snapshot.ingredient}</h4><p className="panel-note break-words">{snapshot.sourceVersion} · reviewed portion {snapshot.reviewedGrams} g · collection date not recorded</p>
     <div className="min-w-0 max-w-full overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" role="region" aria-label={`Original nutrient source values for ${snapshot.ingredient}, source ${index+1}`} tabIndex={0}><table className="w-full text-sm"><caption className="text-left">Saved composition source · {snapshot.sourceId}</caption><thead><tr><th scope="col" className="text-left p-2">Field</th><th scope="col" className="text-left p-2">Per100g source amount</th>{recordedMeal&&<th scope="col" className="text-left p-2">Recorded portion contribution</th>}</tr></thead><tbody>{snapshot.values.map(value=>{const observation=recorded?.observations.find(o=>o.sourceIndex===index&&o.nutrientKey===value.key);return <tr key={value.key}><td className="p-2">{analysis.nutrients.find(n=>n.key===value.key)?.name??value.key}</td><td className="p-2">{value.sourceValuePer100g===null?"Unknown":`${String(value.sourceValuePer100g)} ${value.unit}${value.sourceReportsZero?" · source reports zero (estimate)":" · estimate"}`}</td>{recordedMeal&&<td className="p-2">{observation?.state==="conflicting"?"Source units conflict":observation?.amount==null?"Unknown":`${formatNutrientAmount(observation.amount)} ${observation.unit} · estimate`}</td>}</tr>;})}</tbody></table></div>
     <a className="text-link inline-flex items-center min-h-11" aria-label={`Original food source for ${snapshot.ingredient}`} href={snapshot.sourceUrl} target="_blank" rel="noopener noreferrer">Original food source</a>
    </section>)}
   </section>:<p className="panel-note">{captured.status==="unsupported"?"Original generic source details could not be verified for this view.":"Original generic per100g values were not captured for this entry."} Its saved estimates and any label snapshot remain available; a current database lookup would not recreate the original source.</p>)}
   <a className="text-link inline-flex items-center min-h-11" href="https://fdc.nal.usda.gov/data-documentation.html" target="_blank" rel="noopener noreferrer">USDA source documentation</a>
  </div>
 </details>;
}
