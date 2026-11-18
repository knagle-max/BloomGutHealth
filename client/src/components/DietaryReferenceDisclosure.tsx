import {useQuery} from '@tanstack/react-query';
import {apiRequest} from '@/lib/queryClient';
import {accountContextGuard} from '@/lib/request-actor';
import {currentMealTimeZone} from '@shared/meal-time';
import {intakeCalendarDate} from '@shared/recorded-intake-sources';
import {dietaryReferenceContextSchema} from '@shared/dietary-reference-eligibility';
import {Button} from '@/components/ui/button';
import {useAuth} from '@/lib/auth';
import type {RecordedFoodRecord} from '@shared/nutrient-observations';
import {useState} from 'react';
import {dietaryReferenceSubset,dietaryReferencesFor,dietaryReferenceKinds,dietaryReferenceNutrients} from '@shared/dietary-references';
/** General published facts alongside existing source context, without a second
 * intake calculator, inferred profile/life stage or target-setting control. */
export const dietaryReferenceContextPath='/api/experience/dietary-reference-context';
export default function DietaryReferenceDisclosure({recordedMeal,nutrientKey,date,timeZone}:{recordedMeal?:RecordedFoodRecord;nutrientKey?:string;date?:string;timeZone?:string}){
 const {user}=useAuth(),[open,setOpen]=useState(false);
 const[chosenNutrient,setNutrient]=useState('vitamin_c_mg'),nutrient=nutrientKey??chosenNutrient,rows=dietaryReferencesFor(nutrient),source=dietaryReferenceSubset.sources.find(source=>source.id===rows[0]?.sourceId);
 const zone=timeZone??currentMealTimeZone(),rawMealDate=recordedMeal?.loggedAt,mealTimestamp=rawMealDate instanceof Date?(Number.isFinite(+rawMealDate)?rawMealDate.toISOString():null):rawMealDate;
 const referenceDate=date??(zone?intakeCalendarDate(recordedMeal?mealTimestamp??'':new Date().toISOString(),zone):null);
 const matching=useQuery({queryKey:[dietaryReferenceContextPath,user?.id,referenceDate,zone,nutrient],enabled:open&&!!user&&!!referenceDate&&!!zone&&rows.length>0,queryFn:async({signal})=>{
  const owner=user!.id,assertCurrent=accountContextGuard(owner);assertCurrent();
  const result=dietaryReferenceContextSchema.parse(await(await apiRequest('GET',dietaryReferenceContextPath+'?'+new URLSearchParams({date:referenceDate!,timeZone:zone!,nutrientKey:nutrient}),undefined,undefined,signal)).json());assertCurrent();
  if(result.userId!==owner||result.date!==referenceDate||result.timeZone!==zone||result.referenceVersion!==dietaryReferenceSubset.version||result.rows.some(item=>JSON.stringify(item.reference)!==JSON.stringify(rows.find(row=>row.id===item.reference.id))))throw Error('Reference context does not match its source.');
  return result;
 }});
 const matched=!matching.isFetching&&!matching.isError&&!matching.isStale?matching.data:undefined,eligibleIds=new Set(matched?.rows.filter(row=>row.eligible).map(row=>row.reference.id)??[]);
 const reasons=Array.from(new Set(matched?.rows.filter(row=>!row.reasons.includes('different-reference-sex-category')).flatMap(row=>row.reasons).filter(reason=>reason!=='different-age-category')??[]));
 const descriptions:Record<string,string>={'menstrual-context-not-established':'The source menstrual-status assumption is not established by Profile sex or birth year.','adult-19plus-category-not-applicable':'Available personal reference categories begin at age 19.','historical-life-stage-and-reference-era-not-established':'Historical life stage and reference effective dates are not established.','birth-year-not-recorded':'Birth year is not recorded in Profile.','nonpregnant-nonlactating-context-not-confirmed':'The shared pregnancy, breastfeeding and planning context is not confirmed for this category.','health-context-not-reviewed':'Shared health context has not been reviewed.','clinical-context-not-assessed':'These general references do not assess your recorded conditions or medications.','age-sources-conflict':'Saved age sources conflict.','age-category-not-established':'Birth year alone does not establish every published age category.','reference-sex-category-not-recorded':'The reference sex category is not recorded in Profile.','smoking-status-not-recorded':'Smoking status is not captured; nonsmoking requirements cannot be matched.'};
 const groups=new Map<string,typeof rows>();
 for(const row of rows){const key=JSON.stringify([row.nutrientKey,row.unit,row.sexReferenceCategory,row.ageMinYears,row.ageMaxYears,row.intakeScope,row.smokingApplicability,row.lifeStage,row.referencePeriod,row.sourceId,row.referenceVersion]);groups.set(key,[...(groups.get(key)||[]),row]);}
 if(recordedMeal&&recordedMeal.userId!==user?.id)return null;
 return <details className="min-w-0 [overflow-wrap:anywhere]" open={open} onToggle={event=>setOpen(event.currentTarget.open)}><summary className="min-h-11 cursor-pointer">Canadian dietary references</summary>{open&&<section className="space-y-3 min-w-0 [overflow-wrap:anywhere] border-t border-border pt-3" aria-label="Published Canadian dietary references">
  <h3>Published Canadian references</h3>
  <p className="panel-note">General information for apparently healthy adults 19+ who are not pregnant or lactating. Profile matching below concerns reference applicability only. Your recorded intake is not assessed.</p>
  {!nutrientKey&&<label className="block">Reference nutrient<select className="bloom-input w-full min-h-11" aria-label="Published reference nutrient" value={nutrient} onChange={event=>setNutrient(event.target.value)}>{dietaryReferenceNutrients.map(item=><option key={item.key} value={item.key}>{item.name}</option>)}</select></label>}
  <section aria-label="Saved profile reference context" className="space-y-2 min-w-0">
   {matching.isFetching&&<p role="status">Checking saved Profile context…</p>}
   {matching.isError&&<div role="alert"><p>Profile reference context could not load. General published values remain available.</p><Button variant="outline" className="min-h-11 whitespace-normal h-auto" onClick={()=>void matching.refetch()}>Retry reference context</Button></div>}
   {matched&&<><p>{eligibleIds.size?`${eligibleIds.size} published ${eligibleIds.size===1?'reference matches':'references match'} the available current profile context.`:'Personal reference matching is unavailable with the recorded context.'}{matched.ageRange?` Birth-year age range: ${matched.ageRange.min}–${matched.ageRange.max}; no birthday is assumed.`:''}</p>{!!reasons.length&&<details><summary className="min-h-11 cursor-pointer">Unmatched reference context</summary><ul>{reasons.map(reason=><li key={reason}>{descriptions[reason]??'Reference context is not established.'}</li>)}</ul>{reasons.some(reason=>reason==='birth-year-not-recorded'||reason==='reference-sex-category-not-recorded')&&<a className="text-link inline-flex min-h-11 items-center" href="/profile">Update Profile</a>}{reasons.some(reason=>reason==='health-context-not-reviewed'||reason==='nonpregnant-nonlactating-context-not-confirmed')&&<a className="text-link inline-flex min-h-11 items-center" href="/precision?edit=health-context">Review shared health context</a>}</details>}</>}
   {!referenceDate&&<p>Reference matching is unavailable without a valid date and time zone. General source values remain available.</p>}
  </section>
  <p className="panel-note">EAR (estimated average requirement) and RDA (recommended dietary allowance) serve different usual-intake purposes and use total intake. UL (tolerable upper intake level) is a potential-risk limit, not an intake goal; its source scope matters. No personal adequacy or dose is calculated.</p>
  <ul className="space-y-3">{Array.from(groups.entries()).map(([key,values])=>{const first=values[0];return <li key={key} className="min-w-0 border-t border-border py-2 space-y-2">
   <p>{first.sexReferenceCategory==='M'?'Male reference category':first.sexReferenceCategory==='F'?'Female reference category':'All reference sex categories'} · ages {first.ageMinYears}{first.ageMaxYears===null?'+':`–${first.ageMaxYears}`} {first.smokingApplicability==='non-smoker'?'· nonsmoking reference':''}</p>{first.menstrualBasis&&<p className="panel-note">{first.menstrualBasis==='source-assumed-menstruating'?'Source assumes menstruation.':'Source assumes post-menopause.'} This is not a recorded personal status.</p>}
   <dl className="grid grid-cols-2 gap-3">{values.map(row=><div key={row.id} className={row.kind==='UL'?'col-span-2 min-w-0':'min-w-0'} data-reference-kind={row.kind} data-intake-scope={row.intakeScope}><dt className="font-semibold">{row.kind}<span className="sr-only">: {dietaryReferenceKinds[row.kind]}</span></dt><dd className="tabular-nums">{row.amount} {row.unit}</dd>{eligibleIds.has(row.id)&&<dd className="panel-note">Profile context matches this reference.</dd>}{row.kind==='UL'&&<dd className="panel-note mt-2">{row.intakeScope==='pharmacological-only'?'Pharmacological agents only; food and water are excluded.':row.intakeScope==='preformed-vitamin-a-only'?'Preformed vitamin A only; carotenoids are excluded. Not an intake goal.':row.intakeScope==='synthetic-folic-acid-only'?'Folic acid from supplements and fortified foods only; natural food folate is excluded. Not an intake goal.':row.intakeScope==='synthetic-vitamin-e-only'?'Synthetic vitamin E from supplements and fortified foods only. Not an intake goal.':'Total-intake limit; not an intake goal.'}</dd>}</div>)}</dl>
  </li>;})}</ul>
  {source&&<>{nutrient!=='magnesium_mg'&&<p className="panel-note">{(dietaryReferenceSubset.nutrientNotes as Record<string,string>)[nutrient]??source.note}</p>}<a className="text-link inline-flex min-h-11 min-w-0 max-w-full whitespace-normal [overflow-wrap:anywhere] items-center" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a><p className="panel-note">{source.location} · retrieved {source.retrievedOn}. Publication/effective date unavailable.</p></>}
  <p className="panel-note">Vitamin C, magnesium, calcium, potassium, vitamin D, vitamin A, folate, vitamin E and iron references are available in this view; other nutrient references are not included.</p>
 </section>}</details>;
}
