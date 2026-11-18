import {accountContextGuard} from '@/lib/request-actor';
import {knownNutrientCoverage} from '@shared/nutrient-coverage';
import {useEffect,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useAuth} from '@/lib/auth';
import {apiRequest} from '@/lib/queryClient';
import {Button} from '@/components/ui/button';
import {currentMealTimeZone,recognizedMealTimeZone} from '@shared/meal-time';
import {dateKey} from '@shared/experience';
import {nutrientDefinitionDetails} from '@shared/nutrient-definitions';
import {recordedIntakeViewSchema} from '@shared/recorded-intake-sources';
import {formatNutrientAmount} from '@shared/nutrition-display';

export const recordedIntakeSourcePath='/api/experience/recorded-intake-sources';
const localDate=()=>{const now=new Date();return new Date(+now-now.getTimezoneOffset()*60000).toISOString().slice(0,10);};
const sourceNames={'generic-food':'Food composition estimate','food-label':'Saved food label','supplement-label':'Confirmed supplement label'};
/** One on-demand view of the existing saved sources. No new intake store,
 * chart, clinical target or chemical-equivalent calculation. */
export default function RecordedIntakeSources(){
 const {user}=useAuth(),[open,setOpen]=useState(false),[date,setDate]=useState(localDate),[timeZone,setTimeZone]=useState(()=>currentMealTimeZone()??''),[nutrientKey,setNutrientKey]=useState('iron_mg'),[visible,setVisible]=useState(25);
 const valid=dateKey.safeParse(date).success&&recognizedMealTimeZone(timeZone);
 const view=useQuery({queryKey:[recordedIntakeSourcePath,user?.id,date,timeZone,nutrientKey],enabled:open&&!!user&&valid,queryFn:async({signal})=>{
  const owner=user!.id,assertCurrent=accountContextGuard(owner),query=new URLSearchParams({date,timeZone,nutrientKey});assertCurrent();
  const result=recordedIntakeViewSchema.parse(await(await apiRequest('GET',recordedIntakeSourcePath+'?'+query,undefined,undefined,signal)).json());
  if(result.userId!==owner||result.date!==date||result.timeZone!==timeZone||result.events.some(event=>event.rows.some(row=>row.nutrientKey!==nutrientKey)))throw Error('These sources could not be verified for this account and date.');
  assertCurrent();return {...result,coverage:knownNutrientCoverage(result,owner,nutrientKey)};
 }});
 useEffect(()=>setVisible(25),[user?.id,date,timeZone,nutrientKey]);
 const data=!view.isError&&!view.isFetching&&!view.isStale?view.data:undefined,definitions=nutrientDefinitionDetails(),selected=definitions.find(def=>def.key===nutrientKey)!;
 return <details className="bloom-panel min-w-0" onToggle={event=>setOpen(event.currentTarget.open)}><summary className="min-h-11 cursor-pointer font-semibold">Recorded nutrients from foods & supplements</summary>{open&&<section aria-label="Recorded nutrient sources" className="space-y-4 pt-4 min-w-0 [overflow-wrap:anywhere]">
  <p>Saved source contributions, with missing amounts and chemical forms kept explicit.</p>
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label>Recorded source date<input type="date" className="bloom-input min-h-11 w-full min-w-0" value={date} onChange={event=>setDate(event.target.value)}/></label><label>Nutrient<select aria-label="Nutrient" className="bloom-input min-h-11 w-full min-w-0" value={nutrientKey} onChange={event=>setNutrientKey(event.target.value)}>{definitions.map(def=><option key={def.key} value={def.key}>{def.key==='vitamin_a_ug'?'Vitamin A (source-specific basis)':def.key==='folate_ug'?'Folate (source-specific basis)':def.name}</option>)}</select></label></div>
  <details><summary className="min-h-11 cursor-pointer">Change view time zone</summary><label>View time zone<input className="bloom-input min-h-11 w-full min-w-0" value={timeZone} onChange={event=>setTimeZone(event.target.value)} autoComplete="off"/></label></details>
  {!valid&&<p role="status">Choose a valid date and named time zone, such as America/Regina. Source timestamps are preserved.</p>}
  {view.isFetching&&<p role="status">Checking saved nutrient sources…</p>}
  {view.isError&&<div role="alert"><p>Recorded sources could not load. This does not mean no intake was recorded.</p><Button className="min-h-11" onClick={()=>void view.refetch()}>Retry recorded nutrient sources</Button></div>}
  {data&&<><h3>{selected.key==='vitamin_a_ug'?'Vitamin A':selected.key==='folate_ug'?'Folate':selected.name} · recorded sources</h3><p className="panel-note">{data.events.length} dated {data.events.length===1?'event':'events'} · {data.timeZone}. Unlogged foods or supplements remain unknown. This is not a measure of absorption, usual intake or adequacy.</p>
   {!data.events.length&&<p>No source events are available for this day. Unlogged or unavailable intake is unknown.</p>}
   {!!data.coverage.groups.length&&<section aria-label="Known recorded subtotals" className="space-y-2"><h4>Known recorded subtotals</h4><p className="panel-note">Sources and measurement bases are kept separate. Missing amounts are not counted as zero.</p><ul className="space-y-2">{data.coverage.groups.map((group,index)=><li key={index} className="min-w-0"><p>{sourceNames[group.sourceKind]}: <strong>{group.knownSubtotal===null?'No compatible subtotal':`${formatNutrientAmount(group.knownSubtotal)} ${group.activityUnit??group.unit}`}</strong>{group.chemicalForm?` · ${group.chemicalForm}`:''}</p><p className="panel-note">{group.knownRows} known source {group.knownRows===1?'amount':'amounts'}{group.zeroRows?` (${group.zeroRows} source-reported zero)`:''}{group.unknownRows?` · ${group.unknownRows} unknown`:''}{group.incompatibleRows?` · ${group.incompatibleRows} excluded: measurement basis unresolved or incompatible`:''}</p></li>)}</ul></section>}
   {!!data.coverage.unavailableEvents&&<p role="status">{data.coverage.unavailableEvents} recorded {data.coverage.unavailableEvents===1?'event has':'events have'} no captured amount for this nutrient.</p>}

   {!!(data.undatedEvents+data.unsupportedEvents+data.conflictingEvents+data.futureEvents)&&<p role="status">Some records cannot contribute to this view: {data.undatedEvents} undated, {data.unsupportedEvents} unsupported, {data.conflictingEvents} conflicting, {data.futureEvents} later than this check. Their absence is not a measured zero.</p>}
   <div className="space-y-3">{data.events.slice(0,visible).map(event=><article key={event.key} className="border rounded-xl p-3 min-w-0 space-y-2" aria-label={`${event.kind==='food'?'Food':'Supplement'} source event ${event.recordId}`}><h4>{event.name} · {new Date(event.occurredAt).toLocaleTimeString(undefined,{timeZone:data.timeZone,hour:'numeric',minute:'2-digit'})}</h4>
    {!event.rows.length&&<p>Amount unknown — source composition was not captured or could not be verified.</p>}
    {event.rows.map(row=><div key={`${row.sourceKind}:${row.sourceIndex}:${row.nutrientKey}`} className="space-y-1"><p><strong>{row.amount===null?'Unknown':`${formatNutrientAmount(row.amount)} ${row.unit}`}</strong> · {sourceNames[row.sourceKind]}{row.state==='estimated'?' · estimate':''}{row.sourceReportedZero?' · source reports zero':''}</p>
     {row.state==='conflicting'&&<p role="status" className="panel-note">Source units conflict with this nutrient field; the amount is unavailable.</p>}{row.mineralBasis==='compound-weight'&&<p className="panel-note">Compound weight is recorded; the elemental amount is unknown.</p>}{row.mineralBasis==='unknown'&&<p className="panel-note">Elemental basis is not confirmed.</p>}
     <details><summary className="min-h-11 cursor-pointer">Source & measurement basis</summary><div className="space-y-1">{row.sourceKind!=='generic-food'&&<p className="panel-note">Saved label values use app units; original printed units may not be captured. Chemical equivalents are not inferred.</p>}<p>{row.name} · chemical form: {row.chemicalForm??'Not established'} · activity basis: {row.activityUnit??'Not established'}</p>{row.mineralBasis!==null&&<p className="panel-note">Mineral basis: {row.mineralBasis==='elemental-label'?'Elemental amount confirmed on label':row.mineralBasis==='compound-weight'?'Compound weight; elemental amount unknown':'Not confirmed'}</p>}<p className="panel-note">Source: {row.source.id} · version: {row.source.version??'Not supplied'} · retrieved: {row.source.retrievedAt??'Not supplied'}</p>{row.source.url&&<a className="text-link inline-flex min-h-11 items-center" href={row.source.url} target="_blank" rel="noopener noreferrer">Open original composition source</a>}</div></details>
    </div>)}
   </article>)}</div>
   {visible<data.events.length&&<Button variant="outline" className="min-h-11" onClick={()=>setVisible(count=>count+25)}>Show more recorded events</Button>}
  </>}
 </section>}</details>;
}
