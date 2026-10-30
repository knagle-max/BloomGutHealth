import type {ReactNode} from "react";
import {useState} from 'react';
import {Button} from './ui/button';
import ActivitySetEditor from './ActivitySetEditor';
import {activityChoices,activitySetSummary,activityCompletionSummary,type ActivityDraftComponent} from '@shared/activity-capture';
import type {WeightUnit} from '@shared/display-units';

export default function ActivityReview({items,onChange,unit,details}:{items:ActivityDraftComponent[];onChange:(items:ActivityDraftComponent[])=>void;unit:WeightUnit;details?:ReactNode}){
 const [expanded,setExpanded]=useState(()=>new Set(items.filter(part=>!!part.actualSets).map(part=>part.id)));
 const sets=items.flatMap(part=>part.actualSets?.sets||[]),known=items.flatMap(part=>part.minutes===null?[]:[part.minutes]);
 const described=sets.filter(set=>set.state!=='planned'&&set.state!=='cancelled');
 const update=(id:string,patch:Partial<ActivityDraftComponent>)=>onChange(items.map(part=>part.id===id?{...part,...patch}:part));
 return <div className="space-y-4">
  {items.map((part,index)=><details key={part.id} data-activity-id={part.id} className="activity-review-row" open={expanded.has(part.id)} onToggle={e=>{if(e.target!==e.currentTarget)return;const open=e.currentTarget.open;setExpanded(previous=>{const next=new Set(previous);if(open)next.add(part.id);else next.delete(part.id);return next;});}}>
   <summary><span><strong>{part.title||'Activity to review'}{part.match==='unclassified'&&part.actualSets&&!part.actualSets.sets.length?' — check sets':''}</strong><small>{part.actualSets?part.match==='unclassified'&&!part.actualSets.sets.length?'Check sets':activitySetSummary(part.actualSets.sets,unit):part.minutes===null?'Duration not recorded':`${part.minutes} min`}</small></span><span className="activity-row-status" data-needs-review={part.match==='unclassified'||undefined}>{part.match==='suggested'?'Suggested match':part.match==='unclassified'?'Needs review':'Reported'}</span><span>{expanded.has(part.id)?'Close':'Change'}</span></summary>
   <div className="space-y-3 pt-3">
    <details><summary>Change activity type</summary><label className="block">Activity type<select aria-label={`Activity type ${index+1}`} className="bloom-input w-full" value={part.activityId} onChange={e=>{const choice=activityChoices.find(choice=>choice.id===e.target.value)!;update(part.id,{activityId:choice.id,match:'reported',...(choice.id==='strength'&&!part.actualSets?{actualSets:{version:1,sets:[]}}:{})});}}>{activityChoices.map(choice=><option value={choice.id} key={choice.id}>{choice.label}</option>)}</select></label></details>
    <details><summary>Change activity name</summary><label className="block">Activity name<input aria-label={`Activity name ${index+1}`} className="bloom-input w-full" value={part.title} maxLength={120} required onChange={e=>update(part.id,{title:e.target.value,match:'reported',...(part.actualSets?{actualSets:{...part.actualSets,sets:part.actualSets.sets.map(set=>({...set,exercise:e.target.value||'Other activity'}))}}:{})})}/></label></details>
    <div className="precision-grid">{(!part.actualSets||part.minutes!==null)&&<label>Duration (minutes, optional)<input aria-label={`Duration for activity ${index+1}`} className="bloom-input w-full" type="number" min={1} max={1440} step={1} value={part.minutes??''} onChange={e=>update(part.id,{minutes:e.target.value===''?null:Number(e.target.value)})}/></label>}{part.distanceM!==null&&<label>Distance (km, optional)<input aria-label={`Distance for activity ${index+1}`} className="bloom-input w-full" type="number" min={0} max={1000} step="any" value={part.distanceM===null?'':part.distanceM/1000} onChange={e=>update(part.id,{distanceM:e.target.value===''?null:Number(e.target.value)*1000})}/></label>}</div>
    {(part.actualSets&&part.minutes===null||part.distanceM===null)&&<details><summary>Add other reported amounts (optional)</summary><div className="precision-grid">{part.actualSets&&part.minutes===null&&<label>Duration (minutes, optional)<input aria-label={`Duration for activity ${index+1}`} className="bloom-input w-full" type="number" min={1} max={1440} step={1} value={part.minutes??''} onChange={e=>update(part.id,{minutes:e.target.value===''?null:Number(e.target.value)})}/></label>}{part.distanceM===null&&<label>Distance (km, optional)<input aria-label={`Distance for activity ${index+1}`} className="bloom-input w-full" type="number" min={0} max={1000} step="any" value={part.distanceM===null?'':part.distanceM/1000} onChange={e=>update(part.id,{distanceM:e.target.value===''?null:Number(e.target.value)*1000})}/></label>}</div></details>}
    {part.actualSets&&<ActivitySetEditor exercise={part.title} value={part.actualSets} onChange={actualSets=>update(part.id,{actualSets})} unit={unit} canAdd={sets.length<100}/>}
    <Button type="button" variant="ghost" onClick={()=>onChange(items.filter(old=>old.id!==part.id))}>Remove activity {index+1}</Button>
   </div>
  </details>)}
  <Button type="button" variant="outline" disabled={items.length>=20} onClick={()=>{const id=crypto.randomUUID();setExpanded(old=>new Set([...Array.from(old),id]));onChange([...items,{id,title:'Other activity',activityId:'other',match:'unclassified',minutes:null,distanceM:null}]);}}>Add another activity</Button>
  {details}
  <section className="activity-summary" aria-label="Activity summary"><h3>Activity summary</h3>
   <div className="activity-summary-values"><div><strong>{known.length?`${known.reduce((a,b)=>a+b,0)} min`:'Not recorded'}</strong><span>Reported time</span></div>{sets.length>0&&<div><strong>{described.length} sets</strong><span>Described, not inferred completion</span></div>}</div>
   {known.length<items.length&&<p className="panel-note">{items.length-known.length} activity duration(s) unrecorded. Strength duration is not guessed.</p>}
   {sets.length>0&&<><p aria-live="polite">{activityCompletionSummary(sets)}{sets.length>described.length?` · ${sets.length-described.length} planned or cancelled`:''}</p><p>{described.length&&described.every(set=>set.reps!==null&&set.exercise===described[0].exercise&&set.side===described[0].side)?`${described.reduce((total,set)=>total+set.reps!,0)} reported reps`:'Repetition total incomplete or not combined'}</p></>}
   <p className="panel-note">Minutes and sets stay separate. No calories estimated.</p>
  </section>
 </div>;
}
