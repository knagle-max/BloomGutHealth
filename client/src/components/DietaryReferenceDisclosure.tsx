import {useAuth} from '@/lib/auth';
import type {RecordedFoodRecord} from '@shared/nutrient-observations';
import {useState} from 'react';
import {dietaryReferenceSubset,dietaryReferencesFor,dietaryReferenceKinds} from '@shared/dietary-references';
/** General published facts alongside existing source context, without a second
 * intake calculator, inferred profile/life stage or target-setting control. */
export default function DietaryReferenceDisclosure({recordedMeal}:{recordedMeal?:RecordedFoodRecord}){
 const {user}=useAuth(),[open,setOpen]=useState(false);
 const[nutrient,setNutrient]=useState('vitamin_c_mg'),rows=dietaryReferencesFor(nutrient),source=dietaryReferenceSubset.sources.find(source=>source.id===rows[0]?.sourceId);
 const groups=new Map<string,typeof rows>();
 for(const row of rows){const key=JSON.stringify([row.nutrientKey,row.unit,row.sexReferenceCategory,row.ageMinYears,row.ageMaxYears,row.intakeScope,row.smokingApplicability,row.lifeStage,row.referencePeriod,row.sourceId,row.referenceVersion]);groups.set(key,[...(groups.get(key)||[]),row]);}
 if(recordedMeal&&recordedMeal.userId!==user?.id)return null;
 return <details className="min-w-0 [overflow-wrap:anywhere]" open={open} onToggle={event=>setOpen(event.currentTarget.open)}><summary className="min-h-11 cursor-pointer">Canadian dietary references</summary>{open&&<section className="space-y-3 min-w-0 [overflow-wrap:anywhere] border-t border-border pt-3" aria-label="Published Canadian dietary references">
  <h3>Published Canadian references</h3>
  <p className="panel-note">General information for apparently healthy adults 19+ who are not pregnant or lactating. These values have not been matched to your profile or used to assess your recorded intake.</p>
  <label className="block">Reference nutrient<select className="bloom-input w-full min-h-11" aria-label="Published reference nutrient" value={nutrient} onChange={event=>setNutrient(event.target.value)}><option value="vitamin_c_mg">Vitamin C</option><option value="magnesium_mg">Magnesium</option></select></label>
  <p className="panel-note">EAR (estimated average requirement) and RDA (recommended dietary allowance) serve different usual-intake purposes and use total intake. UL (tolerable upper intake level) is a potential-risk limit, not an intake goal; its source scope matters. No personal adequacy or dose is calculated.</p>
  <ul className="space-y-3">{Array.from(groups.entries()).map(([key,values])=>{const first=values[0];return <li key={key} className="min-w-0 border-t border-border py-2 space-y-2">
   <p>{first.sexReferenceCategory==='M'?'Male reference category':first.sexReferenceCategory==='F'?'Female reference category':'All reference sex categories'} · ages {first.ageMinYears}{first.ageMaxYears===null?'+':`–${first.ageMaxYears}`} {first.smokingApplicability==='non-smoker'?'· nonsmoking reference':''}</p>
   <dl className="grid grid-cols-2 gap-3">{values.map(row=><div key={row.id} className={row.kind==='UL'?'col-span-2 min-w-0':'min-w-0'} data-reference-kind={row.kind} data-intake-scope={row.intakeScope}><dt className="font-semibold">{row.kind}<span className="sr-only">: {dietaryReferenceKinds[row.kind]}</span></dt><dd className="tabular-nums">{row.amount} {row.unit}</dd>{row.kind==='UL'&&<dd className="panel-note mt-2">{row.intakeScope==='pharmacological-only'?'Pharmacological agents only; food and water are excluded.':'Total-intake limit; not an intake goal.'}</dd>}</div>)}</dl>
  </li>;})}</ul>
  {source&&<>{nutrient!=='magnesium_mg'&&<p className="panel-note">{source.note}</p>}<a className="text-link inline-flex min-h-11 min-w-0 max-w-full whitespace-normal [overflow-wrap:anywhere] items-center" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a><p className="panel-note">{source.location} · retrieved {dietaryReferenceSubset.retrievedOn}. Publication/effective date unavailable.</p></>}
  <p className="panel-note">Vitamin C and magnesium references are available in this view; other nutrient references are not included.</p>
 </section>}</details>;
}
