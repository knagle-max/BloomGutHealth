import {readLabelNutrientSources,recordedLabelContributions} from '@shared/label-nutrient-sources';
import type {MealIntelligence} from '@shared/meal-intelligence';
import type {RecordedFoodRecord} from '@shared/nutrient-observations';
import {formatNutrientAmount} from '@shared/nutrition-display';
import {useAuth} from '@/lib/auth';
/** Parent nutrient disclosure verifies the saved meal's owner before mounting. */
export default function LabelNutrientSources({analysis,recordedMeal}:{analysis:MealIntelligence;recordedMeal?:RecordedFoodRecord}){
 const {user}=useAuth();
 if(recordedMeal&&recordedMeal.userId!==user?.id)return <p role="status">Saved label source context is unavailable for the current account.</p>;
 if(!analysis.productDetails?.length)return null;
 const view=readLabelNutrientSources(analysis.productDetails);
 const recorded=recordedMeal?recordedLabelContributions(analysis.productDetails,recordedMeal,user?.id):undefined;
 return <section aria-label="Original label nutrient source values" className="space-y-3 min-w-0 [overflow-wrap:anywhere]">
  <h3>Original label source values</h3>
  <p className="panel-note">{view.sources.length} captured label sources. These are saved amounts per label serving, before scaling to your portion. Missing fields stay unknown. Source-reported zero may reflect label rounding. These tables do not add another meal total or confirm supplement ingestion.</p>
  {(view.missing>0||view.unsupported>0)&&<p role="status" className="panel-note">{view.missing} sources have no captured label; {view.unsupported} could not be verified. A current product lookup would not recreate the original label.</p>}
  {view.sources.map(source=>{const portion=recorded?.sources.find(row=>row.sourceIndex===source.index);return <section key={source.index} className="space-y-2 min-w-0">
   <h4>{source.brand?source.brand+' · ':''}{source.name}</h4><p className="panel-note">Source: {source.provider} · {source.id}. Retrieved: {source.retrievedAt??'Not recorded'}. Retrieval is not a collection date or a verified formulation version.</p>
   <p>Label serving: {source.servingDescription??'Not recorded'} · mass {source.servingGrams===null?'not recorded':`${source.servingGrams} g`}.</p>
   {recordedMeal&&<p className="panel-note">{portion?.servings==null?'The numeric portion was not captured for this source. Its recorded contribution stays unknown here.':`${portion.servings} label serving(s) recorded in this entry.`} Record time: {portion?.occurredAt??'Not recorded'}. These are label-based estimates, not absorbed amounts or an elemental-dose safety assessment.</p>}
   <div className="min-w-0 max-w-full overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" role="region" aria-label={`Original label amounts for ${source.name}, source ${source.index+1}`} tabIndex={0}><table className="label-source-table w-full table-fixed text-sm"><caption className="text-left">{recordedMeal?'Saved label · original serving and recorded portion':'Saved label · amounts per label serving'}</caption><thead><tr><th scope="col" className="text-left p-2">Field</th><th scope="col" className="text-left p-2">Original per-serving amount</th>{recordedMeal&&<th scope="col" className="text-left p-2">Recorded portion</th>}</tr></thead><tbody>{source.fields.map(field=><tr key={field.key}><td className="p-2">{field.name}</td><td className="p-2">{field.amount===null?(field.state==='conflicting'?'Unknown · declarations conflict':'Unknown'):`${String(field.amount)} ${field.unit}${field.sourceReportsZero?' · label reports zero':''}`}</td>{recordedMeal&&<td className="p-2">{portion?.fields.find(row=>row.key===field.key)?.amount==null?'Unknown':`${formatNutrientAmount(portion.fields.find(row=>row.key===field.key)!.amount!)} ${field.unit} · label-based estimate`}</td>}</tr>)}{source.unmappedFields.map(field=><tr key={'unmapped:'+field.key}><td className="p-2">{field.key}</td><td className="p-2">{String(field.amount)} · unit not captured; excluded from equivalent conversions</td>{recordedMeal&&<td className="p-2">Unknown</td>}</tr>)}</tbody></table></div>
   {source.declarations.length>0&&<details><summary className="min-h-11 cursor-pointer">Original source-declared ingredients</summary><p className="panel-note">Exact source amounts for the label serving, before app-unit conversion. Activity units and chemical names are retained without inferring equivalents or counting these again.</p><ul>{source.declarations.map((field,index)=><li key={index}>{field.name}: {field.operator} {field.amount} {field.unit}</li>)}</ul></details>}
   {source.otherIngredients.length>0&&<details><summary className="min-h-11 cursor-pointer">Other original label ingredients</summary><ul>{source.otherIngredients.map((field,index)=><li key={index}>{field.name}: {String(field.amount)} {field.unit}{field.amount===0?' · label reports zero':''}</li>)}</ul><p className="panel-note">Separate label declarations. No elemental amount, RAE, DFE, NE or IU equivalence is inferred, and overlapping entries are not added again here.</p></details>}
   {source.url&&<a className="text-link inline-flex items-center min-h-11 min-w-0 max-w-full whitespace-normal [overflow-wrap:anywhere]" href={source.url} target="_blank" rel="noopener noreferrer">Label source page for {source.name}</a>}
  </section>;})}
 </section>;
}
