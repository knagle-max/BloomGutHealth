import {readLabelNutrientSources} from '@shared/label-nutrient-sources';
import type {MealIntelligence} from '@shared/meal-intelligence';
/** Parent nutrient disclosure verifies the saved meal's owner before mounting. */
export default function LabelNutrientSources({analysis}:{analysis:MealIntelligence}){
 if(!analysis.productDetails?.length)return null;
 const view=readLabelNutrientSources(analysis.productDetails);
 return <section aria-label="Original label nutrient source values" className="space-y-3 min-w-0 [overflow-wrap:anywhere]">
  <h3>Original label source values</h3>
  <p className="panel-note">{view.sources.length} captured label sources. These are saved amounts per label serving, before scaling to your portion. Missing fields stay unknown. Source-reported zero may reflect label rounding. These tables do not add another meal total or confirm supplement ingestion.</p>
  {(view.missing>0||view.unsupported>0)&&<p role="status" className="panel-note">{view.missing} sources have no captured label; {view.unsupported} could not be verified. A current product lookup would not recreate the original label.</p>}
  {view.sources.map(source=><section key={source.index} className="space-y-2 min-w-0">
   <h4>{source.brand?source.brand+' · ':''}{source.name}</h4><p className="panel-note">Source: {source.provider} · {source.id}. Retrieved: {source.retrievedAt??'Not recorded'}. Retrieval is not a collection date or a verified formulation version.</p>
   <p>Label serving: {source.servingDescription??'Not recorded'} · mass {source.servingGrams===null?'not recorded':`${source.servingGrams} g`}.</p>
   <div className="min-w-0 max-w-full overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" role="region" aria-label={`Original label amounts for ${source.name}, source ${source.index+1}`} tabIndex={0}><table className="w-full text-sm"><caption className="text-left">Saved label · amounts per label serving</caption><thead><tr><th scope="col" className="text-left p-2">Field</th><th scope="col" className="text-left p-2">Original amount</th></tr></thead><tbody>{source.fields.map(field=><tr key={field.key}><td className="p-2">{field.name}</td><td className="p-2">{field.amount===null?'Unknown':`${String(field.amount)} ${field.unit}${field.sourceReportsZero?' · label reports zero':''}`}</td></tr>)}{source.unmappedFields.map(field=><tr key={'unmapped:'+field.key}><td className="p-2">{field.key}</td><td className="p-2">{String(field.amount)} · unit not captured; excluded from equivalent conversions</td></tr>)}</tbody></table></div>
   {source.otherIngredients.length>0&&<details><summary className="min-h-11 cursor-pointer">Other original label ingredients</summary><ul>{source.otherIngredients.map((field,index)=><li key={index}>{field.name}: {String(field.amount)} {field.unit}{field.amount===0?' · label reports zero':''}</li>)}</ul><p className="panel-note">Separate label declarations. No elemental amount, RAE, DFE, NE or IU equivalence is inferred, and overlapping entries are not added again here.</p></details>}
   {source.url&&<a className="text-link inline-flex items-center min-h-11 min-w-0 max-w-full whitespace-normal [overflow-wrap:anywhere]" href={source.url} target="_blank" rel="noopener noreferrer">Label source page for {source.name}</a>}
  </section>)}
 </section>;
}
